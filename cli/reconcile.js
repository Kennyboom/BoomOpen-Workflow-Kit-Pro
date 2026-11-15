'use strict';

/**
 * Zero-Omission Spec-to-Code Reconciliation & Self-Completion Engine (`boomopen reconcile` — Wave 2.5).
 * Enforces `REC-G1`..`REC-G4` and `amendPlanWithDeltaWave` for self-completing delta waves.
 */

const fs = require('node:fs');
const path = require('node:path');
const { collectSourceFiles } = require('./checker.js');
const { JS_FAMILY_EXTENSIONS, DECLARATION_FILE, toSegments, isTestPath } = require('./checker-rules.js');
const { stripNonCode } = require('./checker-strip.js');
const { EXIT_OK, EXIT_FAIL, EXIT_USAGE, parseSubcommandArgs, splitCommaOption } = require('./cli-args.js');
const { loadLedgerFile } = require('./ledger.js');
const { readCleanText, extractFencedBlocks } = require('./markdown-fences.js');
const { parsePlanMarkdown, validatePlan } = require('./plan.js');

const JS_RESOLVE_EXTS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'];
const JSX_EXTS = new Set(['.js', '.jsx', '.tsx']);
const TS_EXT_REMAP = { '.js': ['.ts', '.tsx', '.js'], '.jsx': ['.tsx', '.jsx'], '.mjs': ['.mts', '.mjs'], '.cjs': ['.cts', '.cjs'] };
const ENTRYPOINT_BASE_RE = /^(?:index|main|app|server|route|page|layout|middleware)\.[^.]+$/i;
const ENTRYPOINT_DIR_RE = /^(?:cli|scripts|bin|app|pages|src\/app|src\/pages)\//i;
const IGNORED_ENV_VARS = new Set(['NODE_ENV', 'CI', 'PORT', 'HOST', 'HOME', 'USERPROFILE', 'PATH', 'PWD', 'TZ', 'LANG', 'DEBUG', 'BASE_URL', 'MODE', 'DEV', 'PROD', 'SSR']);
const MODULE_SPEC_RES = [/\bfrom\s*(['"`])([ \t]*)\1/g, /\bimport\s*(['"`])([ \t]*)\1/g, /\bimport\s*\(\s*(['"`])([ \t]*)\1\s*(?:,|\))/g, /\brequire(?:\s*\.\s*resolve)?\s*\(\s*(['"`])([ \t]*)\1\s*\)/g];
const MAX_DELTA_FILES = 4;

const normRel = (p) => String(p || '').trim().replace(/^['"`]+|['"`]+$/g, '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
const usageMissingError = (msg) => Object.assign(new Error(msg), { code: 'ENOENT_USAGE' });
const isNonTestJs = (rel) => JS_FAMILY_EXTENSIONS.has(path.extname(rel).toLowerCase()) && !DECLARATION_FILE.test(path.basename(rel)) && !isTestPath(toSegments(rel));
const mustResolveFile = (absDir, ref, label) => { const abs = path.resolve(absDir, String(ref)); if (!fs.existsSync(abs)) throw usageMissingError(`${label} file not found: ${ref}`); return abs; };
const listNonTestFiles = (absDir, options = {}) => !fs.existsSync(absDir) ? [] : collectSourceFiles(absDir, { useGitIgnore: options.useGitIgnore })
  .map((abs) => ({ abs, rel: normRel(path.relative(absDir, abs)) })).filter(({ rel }) => !isTestPath(toSegments(rel)));

function extractPackageEntrypoints(absDir) {
  const [pkgPath, entries] = [path.join(absDir, 'package.json'), new Set()];
  if (!fs.existsSync(pkgPath)) return entries;
  try {
    const pkg = JSON.parse(readCleanText(pkgPath));
    const add = (v) => { const c = normRel(v); if (c && !c.includes('*') && /\.[A-Za-z0-9]+$/.test(c)) entries.add(c.toLowerCase()); };
    const walk = (n) => { if (typeof n === 'string') add(n); else if (n && typeof n === 'object') for (const v of Object.values(n)) walk(v); };
    [pkg.main, pkg.module, pkg.types].filter((f) => typeof f === 'string').forEach(add);
    walk(pkg.bin); walk(pkg.exports);
    for (const cmd of Object.values(pkg.scripts || {})) for (const tok of String(cmd || '').split(/[\s"'`;&|]+/)) if (/\.(?:[cm]?[jt]sx?|py)$/i.test(tok) && !tok.startsWith('-')) add(tok);
  } catch { /* ignore malformed package.json */ }
  return entries;
}

function loadPathAliases(absDir) {
  const aliases = [];
  for (const cfgName of ['tsconfig.json', 'jsconfig.json']) {
    const cfgPath = path.join(absDir, cfgName);
    if (!fs.existsSync(cfgPath)) continue;
    try {
      const co = JSON.parse(stripNonCode(readCleanText(cfgPath)))?.compilerOptions || {};
      const baseDir = path.resolve(absDir, co.baseUrl || '.');
      for (const [pat, targets] of Object.entries(co.paths || {})) {
        if (!Array.isArray(targets) || !targets.length || !pat.endsWith('*') || pat.length <= 1) continue;
        const targetPrefixes = targets.filter((t) => typeof t === 'string').map((t) => path.resolve(baseDir, t.replace(/\*$/, '')));
        if (targetPrefixes.length) aliases.push({ prefix: pat.slice(0, -1), targetPrefixes });
      }
    } catch { /* ignore non-JSON config */ }
  }
  const fb = [path.join(absDir, 'src'), absDir];
  return [...aliases, { prefix: '@/', targetPrefixes: fb }, { prefix: '~/', targetPrefixes: fb }];
}

function resolveImportTarget(specifier, importerAbs, absDir, fileMap, aliases) {
  const cleanSpec = specifier.split(/[?#]/)[0].trim();
  if (!cleanSpec) return null;
  const bases = cleanSpec.startsWith('./') || cleanSpec.startsWith('../') || cleanSpec === '.' || cleanSpec === '..'
    ? [path.resolve(path.dirname(importerAbs), cleanSpec)]
    : aliases.filter((a) => cleanSpec.startsWith(a.prefix)).flatMap((a) => a.targetPrefixes.map((tp) => path.resolve(tp, cleanSpec.slice(a.prefix.length))));
  for (const baseAbs of bases) {
    const [ext, probes] = [path.extname(baseAbs).toLowerCase(), [baseAbs]];
    if (TS_EXT_REMAP[ext]) probes.push(...TS_EXT_REMAP[ext].map((alt) => `${baseAbs.slice(0, -ext.length)}${alt}`));
    else if (!ext) probes.push(...JS_RESOLVE_EXTS.map((e) => `${baseAbs}${e}`), ...JS_RESOLVE_EXTS.map((e) => path.join(baseAbs, `index${e}`)));
    for (const p of probes) { const hit = fileMap.get(normRel(path.relative(absDir, p)).toLowerCase()); if (hit) return hit; }
  }
  return null;
}

function buildImportGraph(dir, options = {}) {
  const absDir = path.resolve(dir || process.cwd());
  const nonTestAbs = listNonTestFiles(absDir, options);
  const [pkgEntries, aliases, fileMap, imports, importedBy, entrypoints] = [extractPackageEntrypoints(absDir), loadPathAliases(absDir), new Map(), new Map(), new Map(), new Set()];
  for (const { rel } of nonTestAbs) {
    fileMap.set(rel.toLowerCase(), rel); imports.set(rel, new Set()); importedBy.set(rel, new Set());
    if (pkgEntries.has(rel.toLowerCase()) || ENTRYPOINT_BASE_RE.test(path.basename(rel)) || ENTRYPOINT_DIR_RE.test(rel)) entrypoints.add(rel);
  }
  for (const { abs, rel } of nonTestAbs) {
    if (!isNonTestJs(rel)) continue;
    const content = readCleanText(abs);
    const stripped = stripNonCode(content, { jsx: JSX_EXTS.has(path.extname(rel).toLowerCase()) });
    for (const re of MODULE_SPEC_RES) {
      for (const m of stripped.matchAll(re)) {
        const qIdx = m.index + m[0].indexOf(m[1]);
        const raw = content.slice(qIdx + 1, qIdx + 1 + m[2].length).trim();
        const targetRel = raw && !raw.includes('${') ? resolveImportTarget(raw, abs, absDir, fileMap, aliases) : null;
        if (targetRel && targetRel !== rel) { imports.get(rel).add(targetRel); importedBy.get(targetRel).add(rel); }
      }
    }
  }
  return { files: [...fileMap.values()], entrypoints, imports, importedBy, pkgEntries };
}

function readStringArgAt(source, startIdx) {
  let i = startIdx;
  while (i < source.length && /\s/.test(source[i])) i++;
  const quote = source[i];
  if (quote !== "'" && quote !== '"' && quote !== '`') return null;
  let [raw, k] = ['', i + 1];
  while (k < source.length) {
    if (source[k] === '\\') { raw += source.slice(k, k + 2); k += 2; continue; }
    if (source[k] === quote) return { value: raw, endIdx: k + 1 };
    if (quote === '`' && source[k] === '$' && source[k + 1] === '{') {
      let depth = 1; k += 2;
      while (k < source.length && depth > 0) { if (source[k] === '{') depth++; else if (source[k] === '}') depth--; k++; }
      raw += ':param'; continue;
    }
    if (source[k] === '\n' && quote !== '`') return null;
    raw += source[k++];
  }
  return null;
}

function normalizeRoutePath(rawPath) {
  const base = String(rawPath || '').trim().split(/[?#]/)[0];
  if (!base) return '/';
  const norm = base.replace(/\$\{[^}]+\}/g, ':param').replace(/\[\[\.\.\.[^\]]+\]\]|\[\.\.\.[^\]]+\]/g, ':param*').replace(/\[[^\]]+\]/g, ':param').replace(/\{[A-Za-z_][\w-]*\}/g, ':param').replace(/:[A-Za-z_][\w-]*(?!\*)/g, ':param').replace(/\/+/g, '/');
  return (norm.startsWith('/') ? norm : `/${norm}`).replace(/^(?!\/$)(.+?)\/+$/, '$1');
}

function routePathsMatch(clientPath, backendPath) {
  const [a, b] = [clientPath.split('/').filter(Boolean), backendPath.split('/').filter(Boolean)];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (b[i] === ':param*') return i <= a.length;
    if (a[i] === undefined || b[i] === undefined || (a[i] !== b[i] && a[i] !== ':param' && b[i] !== ':param')) return false;
  }
  return true;
}

function extractRoutesAndClientCalls(dir, options = {}) {
  const absDir = path.resolve(dir || process.cwd());
  const [backendRoutes, rawSubRoutes, apiPrefixes, clientCalls] = [[], [], new Set(), []];
  const pushBackend = (method, rawPath, file) => {
    const norm = normalizeRoutePath(rawPath);
    backendRoutes.push({ method, rawPath, normalizedPath: norm, file });
    if (!norm.startsWith('/api')) rawSubRoutes.push({ method, normalizedPath: norm, file });
  };
  for (const { abs, rel } of listNonTestFiles(absDir, options)) {
    const [ext, content] = [path.extname(rel).toLowerCase(), readCleanText(abs)];
    if (ext === '.py') {
      const pyClean = content.replace(/#[^\r\n]*/g, '');
      for (const pm of pyClean.matchAll(/\b(?:APIRouter|include_router)\s*\([^)]*prefix\s*=\s*(['"])([^'"]+)\1/g)) if (pm[2].startsWith('/api')) apiPrefixes.add(normalizeRoutePath(pm[2]));
      for (const m of pyClean.matchAll(/@[A-Za-z_]\w*\s*\.\s*(get|post|put|patch|delete|api_route)\s*\(\s*(['"])([^'"]+)\2/gi)) pushBackend(m[1].toUpperCase() === 'API_ROUTE' ? 'ANY' : m[1].toUpperCase(), m[3], rel);
      continue;
    }
    if (!isNonTestJs(rel)) continue;
    const stripped = stripNonCode(content, { jsx: JSX_EXTS.has(ext) });
    const nextApp = /^(?:src\/)?app\/(.*)\/route\.[cm]?[jt]sx?$/i.exec(rel);
    if (nextApp) {
      const routeStr = `/${nextApp[1].split('/').filter((s) => s && !/^\([^)]+\)$/.test(s)).join('/')}`;
      const verbs = [...new Set([...stripped.matchAll(/\bexport\s+(?:async\s+function|function|const|let)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]))];
      for (const v of (verbs.length ? verbs : ['ANY'])) pushBackend(v, routeStr, rel);
    }
    const nextPages = /^(?:src\/)?pages\/(api\/.*)\.[cm]?[jt]sx?$/i.exec(rel);
    if (nextPages) pushBackend('ANY', `/${nextPages[1].replace(/\/index$/i, '')}`, rel);
    for (const pm of stripped.matchAll(/\b(?:[A-Za-z_$][\w$]*(?:App|Router|Server)|app|router|server|api|fastify|hono)\s*\.\s*(?:use|route)\s*\(/g)) {
      const arg = readStringArgAt(content, pm.index + pm[0].length);
      if (arg && arg.value.startsWith('/api')) apiPrefixes.add(normalizeRoutePath(arg.value));
    }
    for (const bm of stripped.matchAll(/\b(?:[A-Za-z_$][\w$]*(?:App|Router|Server)|app|router|server|api|fastify|hono)\s*\.\s*(get|post|put|patch|delete|all)\s*(?:<[^>]*>)?\s*\(/gi)) {
      const arg = readStringArgAt(content, bm.index + bm[0].length);
      if (arg && (arg.value.startsWith('/') || arg.value.startsWith('api/'))) pushBackend(bm[1].toUpperCase() === 'ALL' ? 'ANY' : bm[1].toUpperCase(), arg.value, rel);
    }
    for (const fm of stripped.matchAll(/\bfetch\s*\(/g)) {
      const arg = readStringArgAt(content, fm.index + fm[0].length);
      if (!arg || !/^\/api(?:\/|$|\?)/.test(arg.value.trim())) continue;
      const [tail, has2] = [content.slice(arg.endIdx, arg.endIdx + 160), /^\s*,/.test(content.slice(arg.endIdx, arg.endIdx + 160))];
      const mOpt = has2 ? /\bmethod\s*:\s*['"`]([A-Za-z]+)['"`]/i.exec(tail) : null;
      clientCalls.push({ method: mOpt ? mOpt[1].toUpperCase() : (has2 ? 'ANY' : 'GET'), rawPath: arg.value, normalizedPath: normalizeRoutePath(arg.value), file: rel });
    }
    for (const am of stripped.matchAll(/\baxios\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(/gi)) {
      const arg = readStringArgAt(content, am.index + am[0].length);
      if (arg && /^\/api(?:\/|$|\?)/.test(arg.value.trim())) clientCalls.push({ method: am[1].toUpperCase(), rawPath: arg.value, normalizedPath: normalizeRoutePath(arg.value), file: rel });
    }
  }
  for (const prefix of apiPrefixes) for (const sub of rawSubRoutes) pushBackend(sub.method, `${prefix}/${sub.normalizedPath}`, sub.file);
  const mismatches = backendRoutes.length === 0 ? [] : clientCalls.filter((c) => !backendRoutes.some((r) => routePathsMatch(c.normalizedPath, r.normalizedPath) && (c.method === 'ANY' || r.method === 'ANY' || c.method === r.method)));
  return { backendRoutes, clientCalls, mismatches };
}

function checkEnvParity(dir, options = {}) {
  const absDir = path.resolve(dir || process.cwd());
  const envExamplePath = path.join(absDir, '.env.example');
  if (!fs.existsSync(envExamplePath)) return { applicable: false, definedKeys: [], referencedKeys: [], missingKeys: [], references: {} };
  const definedSet = new Set([...readCleanText(envExamplePath).matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)].map((m) => m[1]));
  const refMap = new Map();
  const recordKey = (key, rel) => {
    if (!key || IGNORED_ENV_VARS.has(key) || /^npm_/i.test(key)) return;
    if (!refMap.has(key)) refMap.set(key, new Set());
    refMap.get(key).add(rel);
  };
  for (const { abs, rel } of listNonTestFiles(absDir, options)) {
    if (!isNonTestJs(rel)) continue;
    const stripped = stripNonCode(readCleanText(abs), { jsx: JSX_EXTS.has(path.extname(rel).toLowerCase()) });
    for (const m of stripped.matchAll(/\b(?:process\s*\.\s*env|import\s*\.\s*meta\s*\.\s*env)\s*\.\s*([A-Za-z_][A-Za-z0-9_]*)\b/g)) recordKey(m[1], rel);
    for (const dm of stripped.matchAll(/(?:const|let|var)\s*\{([^}]+)\}\s*=\s*(?:process\s*\.\s*env|import\s*\.\s*meta\s*\.\s*env)\b/g)) {
      for (const part of dm[1].split(',')) { const id = /^([A-Za-z_][A-Za-z0-9_]*)/.exec(part.trim()); if (id) recordKey(id[1], rel); }
    }
  }
  const missingKeys = [...refMap.keys()].filter((k) => !definedSet.has(k)).sort();
  return { applicable: true, definedKeys: [...definedSet].sort(), referencedKeys: [...refMap.keys()].sort(), missingKeys, references: Object.fromEntries([...refMap.entries()].map(([k, s]) => [k, [...s].sort()])) };
}

function collectUnverifiedSubClauses(absDir, plan, specPaths) {
  const clauses = new Map((plan?.subClauses || []).map((sc) => [sc.id.toUpperCase(), { ...sc, id: sc.id.toUpperCase() }]));
  for (const sp of specPaths) {
    for (const m of readCleanText(sp).matchAll(/^\s*[-*]\s+(?:\[([ xX])\]\s+)?(?:`?\[(SC-[A-Za-z0-9_.-]+)\]`?|`(SC-[A-Za-z0-9_.-]+)`)\s*[:—–-]?\s*(.*)$/gim)) {
      const id = (m[2] || m[3]).toUpperCase();
      if (!clauses.has(id)) clauses.set(id, { id, checked: Boolean(m[1] && m[1].toLowerCase() === 'x'), text: `[${id}] ${m[4].trim()}`.trim() });
    }
  }
  if (clauses.size === 0) return [];
  const cited = new Set();
  for (const abs of fs.existsSync(absDir) ? collectSourceFiles(absDir, {}) : []) {
    if (!isTestPath(toSegments(normRel(path.relative(absDir, abs))))) continue;
    for (const m of readCleanText(abs).matchAll(/\b(SC-[A-Za-z0-9_.-]+)\b/gi)) cited.add(m[1].toUpperCase());
  }
  return [...clauses.values()].filter((sc) => !sc.checked && !cited.has(sc.id));
}

function scanProjectReconciliation(dir = process.cwd(), options = {}) {
  const absDir = path.resolve(dir);
  if (!fs.existsSync(absDir)) throw usageMissingError(`Target directory not found: ${dir}`);
  const planRef = options.plan || options.planPath;
  const plan = planRef ? (typeof planRef === 'object' && Array.isArray(planRef.tasks) ? planRef : parsePlanMarkdown(readCleanText(mustResolveFile(absDir, planRef, 'Plan')), String(planRef))) : null;
  const ledgerRef = options.ledger || options.ledgerPath;
  const ledger = ledgerRef ? loadLedgerFile(mustResolveFile(absDir, ledgerRef, 'Ledger'), absDir) : null;
  const specPaths = (Array.isArray(options.specs) ? options.specs : splitCommaOption(options.specs)).map((s) => mustResolveFile(absDir, s, 'Spec'));

  const [g1, g2, g3, g4, warnings, gaps] = [[], [], [], [], [], []];
  const graph = buildImportGraph(absDir, options);
  const fileLookup = new Map(graph.files.map((f) => [f.toLowerCase(), f]));
  const rawTargets = Array.isArray(options.ownedFiles) ? options.ownedFiles
    : plan ? plan.tasks.flatMap((t) => t.ownedFiles || []) : ledger ? (ledger.features || []).flatMap((f) => f.owned_files || []) : graph.files;
  const defaultParent = [...graph.entrypoints][0] || null;

  for (const cand of [...new Set(rawTargets.map(normRel).filter(Boolean))]) {
    const canonical = fileLookup.get(cand.toLowerCase());
    if (canonical && isNonTestJs(canonical) && !graph.entrypoints.has(canonical) && (graph.importedBy.get(canonical)?.size || 0) === 0) {
      g1.push(`[REC-G1] Unwired island module "${canonical}" is neither an entrypoint nor imported by any non-test file.`);
      gaps.push({ id: `GAP-G1-${gaps.length + 1}`, gate: 'REC-G1', role: 'integrator', files: defaultParent ? [defaultParent, canonical] : [canonical], title: `Wire island module ${canonical} into parent caller` });
    }
  }
  const routeParity = extractRoutesAndClientCalls(absDir, options);
  for (const m of routeParity.mismatches) {
    g2.push(`[REC-G2] Frontend call ${m.method} "${m.rawPath}" in "${m.file}" matches 0 backend routes.`);
    gaps.push({ id: `GAP-G2-${gaps.length + 1}`, gate: 'REC-G2', role: 'integrator', files: [m.file], title: `Reconcile unmatched API route ${m.method} ${m.rawPath}` });
  }
  for (const sc of collectUnverifiedSubClauses(absDir, plan, specPaths)) {
    const msg = `[REC-G3] Unverified sub-clause ${sc.id} ("${sc.text}") is unchecked (- [ ]) and has 0 test citations.`;
    g3.push(msg); if (!options.strict) warnings.push(msg);
    const ownerTask = plan?.tasks.find((t) => t.reqId === sc.taskId);
    gaps.push({ id: sc.id, gate: 'REC-G3', role: ownerTask?.agent || 'integrator', files: ownerTask?.ownedFiles?.slice(0, MAX_DELTA_FILES) || (defaultParent ? [defaultParent] : []), sub_clauses: [sc.id], title: `Complete & test sub-clause ${sc.text}` });
  }
  const envParity = checkEnvParity(absDir, options);
  if (envParity.applicable && envParity.missingKeys.length > 0) {
    for (const key of envParity.missingKeys) g4.push(`[REC-G4] Environment variable "${key}" (referenced in ${envParity.references[key].join(', ')}) is missing from .env.example.`);
    gaps.push({ id: `GAP-G4-${gaps.length + 1}`, gate: 'REC-G4', role: 'integrator', files: ['.env.example'], title: `Document missing env keys (${envParity.missingKeys.join(', ')}) in .env.example` });
  }
  const errors = [...g1, ...g2, ...(options.strict ? g3 : []), ...g4];
  return { valid: errors.length === 0, errors, warnings, gates: { 'REC-G1': g1, 'REC-G2': g2, 'REC-G3': g3, 'REC-G4': g4 }, gaps, routeParity, envParity };
}

function parseReconcileDeltaInput(reconcileInput, cwd) {
  if (reconcileInput && typeof reconcileInput === 'object') return Array.isArray(reconcileInput) ? { gaps: reconcileInput } : reconcileInput;
  if (!reconcileInput) throw usageMissingError('Reconcile delta file is required');
  const text = readCleanText(mustResolveFile(cwd, reconcileInput, 'Reconcile delta')).trim();
  try { const p = JSON.parse(text); return Array.isArray(p) ? { gaps: p } : p; } catch { /* scan fenced json */ }
  for (const block of extractFencedBlocks(text)) {
    if (block.lang && block.lang !== 'json' && block.lang !== 'jsonc') continue;
    try { const p = JSON.parse(block.body); if (Array.isArray(p) || Array.isArray(p?.gaps)) return Array.isArray(p) ? { gaps: p } : p; } catch { /* next */ }
  }
  throw new Error(`No valid RECONCILE_DELTA JSON with gaps[] found in ${reconcileInput}`);
}

function amendPlanWithDeltaWave(planPath, reconcileInputPath, options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  if (!planPath) throw usageMissingError('Plan file is required');
  const absPlan = mustResolveFile(cwd, planPath, 'Plan');
  const delta = parseReconcileDeltaInput(reconcileInputPath, cwd);
  const rawGaps = Array.isArray(delta?.gaps) ? delta.gaps : [];
  let planText = readCleanText(absPlan).replace(/\r\n/g, '\n');
  const existing = parsePlanMarkdown(planText, planPath);
  if (rawGaps.length === 0) return { valid: true, amended: false, addedTasks: 0, phaseId: null, errors: [], planPath: absPlan };

  const defaultVerify = existing.tasks.map((t) => t.verifyCmd).find(Boolean) || 'node -e "process.exit(0)"';
  const fallbackFile = existing.tasks.flatMap((t) => t.ownedFiles || [])[0] || 'src/index.js';
  const existingPhaseIds = new Set(existing.phases.map((p) => p.phase_id.toUpperCase()));
  let [waveLabel, minor] = [options.wave ? String(options.wave).replace(/^(?:WAVE|PHASE)-/i, '') : '2.5', 5];
  while (!options.wave && existingPhaseIds.has(`WAVE-${waveLabel.toUpperCase()}`)) { minor++; waveLabel = `2.${minor}`; }
  const prevPhaseId = existing.phases.length ? existing.phases[existing.phases.length - 1].phase_id : 'NONE';
  let nextReqNum = Math.max(250, ...existing.tasks.map((t) => Number.parseInt((/\d+/.exec(t.reqId) || ['0'])[0], 10))) + 1;

  const [claimedFiles, buckets] = [new Map(), []];
  for (const g of rawGaps) {
    const rawFiles = [...(g.files || []), ...(g.target_files || []), ...(g.owned_files || []), ...(g.file ? [g.file] : [])].map(normRel).filter(Boolean);
    const freshFiles = rawFiles.filter((f) => !claimedFiles.has(f.toLowerCase()));
    const rawRole = String(g.role || g.agent || 'integrator').split('#')[0].trim() || 'integrator';
    const prefix = (rawRole === 'integrator' || /^REC-G[124]$/.test(g.gate || '') || g.type === 'wiring') ? 'integrator#wiring' : `${rawRole}#delta`;
    if (freshFiles.length === 0 && rawFiles.length > 0 && claimedFiles.has(rawFiles[0].toLowerCase())) { claimedFiles.get(rawFiles[0].toLowerCase()).gaps.push(g); continue; }
    const filesToAssign = freshFiles.length > 0 ? freshFiles : [fallbackFile];
    let bucket = buckets.find((b) => b.prefix === prefix && b.files.length + filesToAssign.length <= MAX_DELTA_FILES);
    if (!bucket) { bucket = { prefix, files: [], gaps: [] }; buckets.push(bucket); }
    for (const f of filesToAssign) {
      if (bucket.files.length >= MAX_DELTA_FILES) { bucket = { prefix, files: [], gaps: [] }; buckets.push(bucket); }
      bucket.files.push(f); claimedFiles.set(f.toLowerCase(), bucket);
    }
    bucket.gaps.push(g);
  }

  const [definedAcSet, coveredBefore] = [new Set(existing.acceptanceCriteria), new Set([...existing.traceabilityCriteria, ...existing.tasks.flatMap((t) => t.acceptance || [])])];
  const [orphanAcs, newAcLines, roleCounters] = [existing.acceptanceCriteria.filter((ac) => !coveredBefore.has(ac)), [], new Map()];
  const taskBlocks = buckets.map((b, idx) => {
    const [seq, reqId] = [(roleCounters.get(b.prefix) || 0) + 1, `REQ-${nextReqNum++}`]; roleCounters.set(b.prefix, seq);
    const titles = [...new Set(b.gaps.map((g) => g.title || g.summary || g.description || g.id).filter(Boolean))];
    const acIds = [...new Set(b.gaps.flatMap((g) => (Array.isArray(g.acceptance) ? g.acceptance : g.ac ? [g.ac] : [])).flatMap((a) => [...String(a).matchAll(/\bAC-?0*(\d+)\b/gi)].map((m) => `AC${m[1]}`)))];
    for (const id of acIds) if (!definedAcSet.has(id)) { definedAcSet.add(id); newAcLines.push(`- ${id}: Delta reconciliation (${titles[0] || reqId})`); }
    if (acIds.length === 0) acIds.push(...(idx === 0 && orphanAcs.length ? orphanAcs : existing.acceptanceCriteria.slice(0, 1)));
    const [scs, srcDoc] = [[...new Set(b.gaps.flatMap((g) => g.sub_clauses || g.subClauses || []))], b.gaps.map((g) => g.source_doc || g.sourceDoc).find(Boolean) || ''];
    const [testFiles, verify] = [[...new Set(b.gaps.flatMap((g) => g.test_files || g.testFiles || []).map(normRel).filter(Boolean))], b.gaps.map((g) => g.verify || g.verify_cmd || g.verifyCmd).find(Boolean) || defaultVerify];
    return [
      `### Task ${waveLabel}.${idx + 1} (${reqId}): ${titles.join('; ').slice(0, 110) || 'Delta Integration & Spec Wiring'}`, `- **Agent**: \`${b.prefix}-${seq}\``,
      srcDoc ? `- **Source Doc**: \`${srcDoc}\`` : '', acIds.length ? `- **Acceptance**: ${acIds.map((a) => `\`${a}\``).join(', ')}` : '',
      scs.length ? `- **Sub-Clauses**: ${scs.map((s) => `\`[${String(s).replace(/^\[|\]$/g, '')}]\``).join(', ')}` : '',
      `- **OWNED_FILES**: ${b.files.map((f) => `\`${f}\``).join(', ')}`, testFiles.length ? `- **Test Files**: ${testFiles.map((f) => `\`${f}\``).join(', ')}` : '', `- **Verify**: \`${verify}\``,
    ].filter(Boolean).join('\n');
  });
  const insertBeforeFirstH2 = (txt, blk) => { const h2 = /^##\s+/m.exec(txt); return h2 ? `${txt.slice(0, h2.index)}${blk}${txt.slice(h2.index)}` : `${txt}\n\n${blk}`; };
  if (newAcLines.length > 0) {
    const acHdr = /^##\s+.*(?:Acceptance\s+Criteria|Tiêu\s+chí\s+Nghiệm\s+thu).*$/imu.exec(planText);
    planText = acHdr ? `${planText.slice(0, acHdr.index + acHdr[0].length)}\n${newAcLines.join('\n')}${planText.slice(acHdr.index + acHdr[0].length)}` : insertBeforeFirstH2(planText, `## Acceptance Criteria\n${newAcLines.join('\n')}\n\n`);
  }
  if (!existing.sharedContract) planText = insertBeforeFirstH2(planText, '## 🤝 Shared Interface Contracts (SHARED_CONTRACT)\n```ts\n// Locked cross-shard integration contract\n```\n\n');
  const updated = `${planText.trimEnd()}\n\n## Wave ${waveLabel}: Delta & Integration Wiring (\`phase_id: WAVE-${waveLabel}\` | \`Parallelizable: Yes\` | \`Depends On: ${prevPhaseId}\`)\n\n${taskBlocks.join('\n\n')}\n`;
  const val = validatePlan(updated);
  fs.writeFileSync(absPlan, updated, 'utf8');
  return { valid: val.valid, amended: true, phaseId: `WAVE-${waveLabel}`, addedTasks: taskBlocks.length, errors: val.errors, planPath: absPlan };
}

const RECONCILE_HELP = `Usage: boomopen reconcile [dir] [--plan <plan.md>] [--specs <a.md,b.md>] [--ledger <file>] [--strict] [--json] [--help]\n  REC-G1: Island Shard | REC-G2: Route Parity | REC-G3: [SC-*] Traceability | REC-G4: .env.example Parity`;
const RECONCILE_ARG_SPEC = { defaults: { plan: null, specs: '', ledger: null, strict: false, json: false, help: false }, booleanFlags: { '-h': 'help', '--help': 'help', '--strict': 'strict', '--json': 'json' }, valueFlags: { '--plan': 'plan', '--specs': 'specs', '--ledger': 'ledger' } };

function runReconcileCli(argv = [], options = {}) {
  const { flags, positional, error } = parseSubcommandArgs(argv, RECONCILE_ARG_SPEC);
  if (error) { if (!options.silent) console.error(`❌ boomopen reconcile: ${error}\n\n${RECONCILE_HELP}`); return EXIT_USAGE; }
  if (flags.help || positional[0] === 'help') { if (!options.silent) console.log(RECONCILE_HELP); return EXIT_OK; }
  if (positional.length > 1) { if (!options.silent) console.error(`❌ boomopen reconcile: unexpected argument "${positional[1]}"\n\n${RECONCILE_HELP}`); return EXIT_USAGE; }
  const cwd = path.resolve(options.cwd || process.cwd());
  try {
    const res = scanProjectReconciliation(positional[0] ? path.resolve(cwd, positional[0]) : cwd, { plan: flags.plan ? path.resolve(cwd, String(flags.plan)) : null, ledger: flags.ledger ? path.resolve(cwd, String(flags.ledger)) : null, specs: splitCommaOption(String(flags.specs || '')).map((s) => path.resolve(cwd, s)), strict: Boolean(flags.strict) });
    if (!options.silent) {
      if (flags.json) console.log(JSON.stringify(res, null, 2));
      else if (res.valid) { console.log(`✅ Reconcile passed (0 blocking gaps${res.warnings.length ? `, ${res.warnings.length} warning(s)` : ''})`); for (const w of res.warnings) console.warn(`⚠️  ${w}`); }
      else for (const err of res.errors) console.error(`❌ ${err}`);
    }
    return res.valid ? EXIT_OK : EXIT_FAIL;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen reconcile: ${err instanceof Error ? err.message : String(err)}`);
    return err && err.code === 'ENOENT_USAGE' ? EXIT_USAGE : EXIT_FAIL;
  }
}

if (require.main === module) process.exitCode = runReconcileCli(process.argv.slice(2));
module.exports = { scanProjectReconciliation, buildImportGraph, extractRoutesAndClientCalls, checkEnvParity, amendPlanWithDeltaWave, runReconcileCli };
