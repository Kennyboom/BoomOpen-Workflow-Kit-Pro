'use strict';

/**
 * Deterministic Whole-Project Static Audit Scanners (`cli/audit-scanners.js`).
 * Walks 100% of project source files without truncation to discover specification sources,
 * extract vertical cross-layer journeys (`FLOW-01..M`), and detect cross-module hazards.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { runCheck } = require('./checker.js');
const { CODE_EXTENSIONS, JS_FAMILY_EXTENSIONS, IGNORED_DIRS, isIgnoredSegment, isTestPath, toSegments } = require('./checker-rules.js');
const { stripNonCode } = require('./checker-strip.js');
const { splitCommaOption } = require('./cli-args.js');
const { countLines, readCleanText } = require('./markdown-fences.js');

const SPEC_SUBDIRS = new Set(['docs', 'specs', 'documents']);
const RESOLVE_EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
const BUILTIN_ENV_KEYS = new Set(['NODE_ENV', 'CI', 'MODE', 'DEV', 'PROD', 'SSR', 'BASE_URL', 'TZ', 'PATH', 'PWD', 'HOME', 'USERPROFILE', 'TMP', 'TEMP']);
const UX_STATE_PATTERNS = Object.freeze({
  loading: /\b(?:isLoading|loading|isPending|pending|Skeleton|Spinner|Suspense|aria-busy)\b/i,
  empty: /\b(?:isEmpty|emptyState|EmptyState|noResults|NoResults|length\s*===\s*0|!\s*\w+\.length|nothing\s+found)\b/i,
  error: /\b(?:isError|error|ErrorBoundary|ErrorState|role=['"]alert['"]|onError)\b/,
  disabled: /\b(?:disabled|isSubmitting|submitting|aria-disabled|readOnly)\b/,
  success: /\b(?:isSuccess|toast|notification|onSuccess|status\s*===\s*['"]success['"]|submitted|saved)\b/i,
});

const toPosixRel = (cwd, target) => path.relative(cwd, path.isAbsolute(target) ? target : path.resolve(cwd, target)).replace(/\\/g, '/');
const hashFileSha256 = (absPath) => crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}
function walkProjectSourceFiles(cwd) {
  const out = [];
  const visit = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (isIgnoredSegment(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) visit(path.join(dir, entry.name), rel);
      else if (entry.isFile() && CODE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(rel);
    }
  };
  if (fs.existsSync(cwd)) visit(cwd, '');
  return out.sort();
}
const normalizeFileList = (cwd, files) => (Array.isArray(files) ? [...new Set(files.map((f) => toPosixRel(cwd, f)).filter(Boolean))].sort() : walkProjectSourceFiles(cwd));

function analyzeSourceText(rawContent, ext) {
  if (!JS_FAMILY_EXTENSIONS.has(ext)) {
    const commentFree = ext === '.py' ? rawContent.replace(/#[^\r\n]*/g, '') : rawContent;
    return { code: commentFree, commentFree };
  }
  const spans = [];
  const code = stripNonCode(rawContent, { jsx: ext === '.js' || ext === '.jsx' || ext === '.tsx', onComment: (s, off) => spans.push({ off, len: s.length }) });
  const chars = rawContent.split('');
  for (const sp of spans) {
    for (let i = sp.off; i < sp.off + sp.len && i < chars.length; i++) if (chars[i] !== '\n' && chars[i] !== '\r') chars[i] = ' ';
  }
  return { code, commentFree: chars.join('') };
}

function classifyRootDocKind(name) {
  for (const [re, kind] of [[/^PRD[^/]*\.md$/i, 'prd'], [/^SRS[^/]*\.md$/i, 'srs'], [/^DESIGN[^/]*\.md$/i, 'design'], [/^PLAN[^/]*\.md$/i, 'plan'], [/^openapi\.(?:ya?ml|json)$/i, 'openapi'], [/^README\.md$/i, 'readme']]) {
    if (re.test(name)) return kind;
  }
  return null;
}

function discoverSpecSources(cwd, explicitDocs = []) {
  const root = path.resolve(cwd || process.cwd());
  const explicitList = Array.isArray(explicitDocs) ? explicitDocs : splitCommaOption(String(explicitDocs || ''));
  const seen = new Map();
  const addDoc = (relCandidate, kind, strict) => {
    const abs = path.resolve(root, relCandidate);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) { if (strict) throw new Error(`Spec document not found: ${relCandidate}`); return; }
    const rel = toPosixRel(root, abs);
    if (rel && !rel.startsWith('..') && !seen.has(rel)) seen.set(rel, { path: rel, sha256: hashFileSha256(abs), lines: countLines(readCleanText(abs)), kind });
  };
  for (const doc of explicitList) addDoc(doc, 'explicit', true);

  const ledgerAbs = path.join(root, '.boomopen', 'project-ledger.json');
  let [ledgerPresent, projectName, ledgerReqs] = [false, null, 0];
  if (fs.existsSync(ledgerAbs) && fs.statSync(ledgerAbs).isFile()) {
    ledgerPresent = true;
    try {
      const parsed = JSON.parse(readCleanText(ledgerAbs));
      projectName = parsed.project_name || parsed.project || null;
      const reqList = Array.isArray(parsed.features) ? parsed.features : parsed.requirements;
      ledgerReqs = Array.isArray(reqList) ? reqList.length : 0;
      for (const sd of parsed.spec_documents || parsed.source_documents || []) addDoc(typeof sd === 'string' ? sd : sd.path, 'ledger_spec', false);
    } catch { /* ignore malformed ledger */ }
  }
  addDoc('.boomopen/contracts/SHARED_CONTRACT.md', 'contract', false);

  const walkSpecDir = (dir, kindPrefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkSpecDir(full, kindPrefix);
      else if (/\.md$/i.test(entry.name) || /^openapi\.(?:ya?ml|json)$/i.test(entry.name)) addDoc(toPosixRel(root, full), /^openapi/i.test(entry.name) ? 'openapi' : kindPrefix, false);
    }
  };
  if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && SPEC_SUBDIRS.has(entry.name.toLowerCase())) walkSpecDir(path.join(root, entry.name), entry.name.toLowerCase());
      else if (entry.isFile() && classifyRootDocKind(entry.name)) addDoc(entry.name, classifyRootDocKind(entry.name), false);
    }
  }
  const documents = [...seen.values()].sort((a, b) => a.path.localeCompare(b.path));
  const mode = documents.length > 0 || (ledgerPresent && ledgerReqs > 0) ? 'spec_grounded' : 'code_inferred';
  return { mode, ledger_present: ledgerPresent, ledger_path: ledgerPresent ? '.boomopen/project-ledger.json' : null, project_name: projectName, ledger_requirements: ledgerReqs, documents };
}

function normalizeRouteSegments(rawRoute) {
  const clean = String(rawRoute || '').split('?')[0].trim().replace(/\/+$/, '') || '/';
  return clean.split('/').filter(Boolean).map((seg) => (/^(?::.+|\[.+\]|\{.+\}|\$\{.+\}|\d+)$/.test(seg) || seg.includes('${') ? ':param' : seg.toLowerCase()));
}

function routesMatch(clientPath, serverPath) {
  const [cSegs, sSegs] = [normalizeRouteSegments(clientPath), normalizeRouteSegments(serverPath)];
  if (sSegs[sSegs.length - 1] === '*') return sSegs.slice(0, -1).every((s, i) => s === ':param' || cSegs[i] === ':param' || s === cSegs[i]);
  return cSegs.length === sSegs.length && cSegs.every((c, i) => c === ':param' || sSegs[i] === ':param' || c === sSegs[i]);
}

const routeDomainKey = (routePath) => {
  const segs = normalizeRouteSegments(routePath);
  return segs[0] === 'api' && segs[1] ? `/api/${segs[1]}` : (segs[0] ? `/${segs[0]}` : '/');
};

function resolveImportTarget(fromRel, specifier, fileSet) {
  if (specifier.startsWith('@/') || specifier.startsWith('~/')) {
    const sub = specifier.slice(2);
    for (const prefix of ['src/', '']) for (const ext of RESOLVE_EXTS) if (fileSet.has(`${prefix}${sub}${ext}`)) return `${prefix}${sub}${ext}`;
    return null;
  }
  if (!specifier.startsWith('.')) return null;
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), specifier));
  for (const cand of [base, base.replace(/\.[cm]?[jt]sx?$/i, '')]) {
    for (const ext of RESOLVE_EXTS) if (fileSet.has(`${cand}${ext}`)) return `${cand}${ext}`;
  }
  return null;
}

function extractImportsAndMounts(rel, commentFree, fileSet) {
  const [imports, namedImports, mounts] = [new Set(), new Map(), []];
  const importRe = /\bimport\s+(?:(?:type\s+)?(?:([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\}\s*)?|\*\s+as\s+([A-Za-z_$][\w$]*)\s*|\{[^}]*\}\s*)from\s*)?['"]([^'"]+)['"]/g;
  for (const m of commentFree.matchAll(importRe)) {
    const target = resolveImportTarget(rel, m[3], fileSet);
    if (target) { imports.add(target); if (m[1] || m[2]) namedImports.set(m[1] || m[2], target); }
  }
  for (const m of commentFree.matchAll(/(?:\bexport\s+[^;'"]*?\bfrom\s+['"]([^'"]+)['"]|\b(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\))/g)) {
    const target = resolveImportTarget(rel, m[1] || m[2] || '', fileSet);
    if (target) imports.add(target);
  }
  for (const cm of commentFree.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const target = resolveImportTarget(rel, cm[2], fileSet);
    if (target) namedImports.set(cm[1], target);
  }
  for (const mm of commentFree.matchAll(/\b(?:app|server|router)\s*\.\s*(?:use|route)\s*\(\s*['"`](\/[^'"`\s)]*)['"`]\s*,\s*([A-Za-z_$][\w$]*)/g)) {
    const target = namedImports.get(mm[2]);
    if (target) mounts.push({ prefix: mm[1].replace(/\/+$/, ''), target });
  }
  return { imports: [...imports], mounts };
}

function extractServerRoutes(rel, commentFree) {
  const routes = [];
  const nextApp = /(?:^|\/)app\/(api\/.+)\/route\.[cm]?[jt]sx?$/i.exec(rel);
  if (nextApp) {
    const methods = [...new Set([...commentFree.matchAll(/\bexport\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]))];
    for (const method of methods.length ? methods : ['ANY']) routes.push({ method, path: `/${nextApp[1]}` });
  }
  const nextPages = /(?:^|\/)pages\/(api\/.+)\.[cm]?[jt]sx?$/i.exec(rel);
  if (nextPages) routes.push({ method: 'ANY', path: `/${nextPages[1].replace(/\/index$/i, '')}` });
  for (const m of commentFree.matchAll(/\b(?:app|router|server|route|routes|bp)\s*\.\s*(get|post|put|patch|delete|all)\s*\(\s*['"`](\/[^'"`\s)]*)['"`]/gi)) {
    routes.push({ method: m[1].toUpperCase() === 'ALL' ? 'ANY' : m[1].toUpperCase(), path: m[2] });
  }
  for (const m of commentFree.matchAll(/@(?:app|router|bp)\s*\.\s*(get|post|put|patch|delete|route)\s*\(\s*['"](\/[^'"]*)['"]/gi)) {
    routes.push({ method: m[1].toUpperCase() === 'ROUTE' ? 'ANY' : m[1].toUpperCase(), path: m[2] });
  }
  return routes;
}

function extractClientCalls(rel, commentFree) {
  const [calls, seen] = [[], new Set()];
  const pushCall = (method, endpoint, offset) => {
    const key = `${method}:${endpoint}:${offset}`;
    if (!seen.has(key) && endpoint.startsWith('/')) { seen.add(key); calls.push({ file: rel, line: lineNumberAt(commentFree, offset), method, endpoint }); }
  };
  for (const m of commentFree.matchAll(/\bfetch\s*\(\s*['"`](\/[A-Za-z0-9_/\-:${}[\].]+)['"`](?:\s*,\s*\{[^}]{0,160}?\bmethod\s*:\s*['"]([A-Za-z]+)['"])?/g)) pushCall((m[2] || 'GET').toUpperCase(), m[1], m.index);
  for (const m of commentFree.matchAll(/\b(?:axios|api|http|client)\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>]*>)?\s*\(\s*['"`](\/[A-Za-z0-9_/\-:${}[\].]+)['"`]/gi)) pushCall(m[1].toUpperCase(), m[2], m.index);
  for (const m of commentFree.matchAll(/['"`](\/api\/[A-Za-z0-9_/\-:${}[\].]+)['"`]/g)) {
    if (!calls.some((c) => c.endpoint === m[1] && Math.abs(c.line - lineNumberAt(commentFree, m.index)) <= 1)) pushCall('ANY', m[1], m.index);
  }
  return calls;
}

function classifyLayer(rel, code, routes) {
  if (routes.length > 0 || /(?:^|\/)(?:routes|controllers|handlers|endpoints)\//i.test(rel)) return 'backend_route';
  if (/(?:^|\/)(?:services|repositories|repos|models|entities|db|database|prisma|drizzle|dao)\//i.test(rel)) return 'service_db';
  if (/\b(?:prisma|drizzle|sequelize|knex|mongoose)\b/.test(code) && !/\.(?:jsx|tsx)$/i.test(rel)) return 'service_db';
  return /\.(?:jsx|tsx)$/i.test(rel) || /(?:^|\/)(?:pages|views|screens|components|ui|frontend|client)\//i.test(rel) || /(?:^|\/)app\/.*\/page\.[cm]?[jt]sx?$/i.test(rel) ? 'ui' : 'module';
}

function buildProjectGraph(cwd, files) {
  const root = path.resolve(cwd || process.cwd());
  const prodFiles = normalizeFileList(root, files).filter((r) => !isTestPath(toSegments(r)));
  const [fileSet, nodes, allMounts] = [new Set(prodFiles), new Map(), []];
  for (const rel of prodFiles) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const ext = path.extname(rel).toLowerCase();
    const { code, commentFree } = analyzeSourceText(readCleanText(abs), ext);
    const { imports, mounts } = extractImportsAndMounts(rel, commentFree, fileSet);
    allMounts.push(...mounts);
    const routes = extractServerRoutes(rel, commentFree);
    const layer = classifyLayer(rel, code, routes);
    nodes.set(rel, { rel, ext, code, commentFree, imports, routes, layer, clientCalls: layer === 'backend_route' ? [] : extractClientCalls(rel, commentFree) });
  }
  for (const m of allMounts) {
    const target = nodes.get(m.target);
    if (target) {
      target.layer = 'backend_route';
      target.routes = target.routes.map((r) => ({ method: r.method, path: r.path === '/' ? m.prefix : (r.path.startsWith(m.prefix) ? r.path : `${m.prefix}${r.path}`) }));
    }
  }
  return { root, nodes };
}

function collectTransitive(startRel, nodes, maxHops = 2) {
  const visited = new Set();
  let frontier = [startRel];
  for (let hop = 0; hop < maxHops && frontier.length > 0; hop++) {
    const next = [];
    for (const cur of frontier) for (const imp of nodes.get(cur)?.imports || []) if (!visited.has(imp) && imp !== startRel) { visited.add(imp); next.push(imp); }
    frontier = next;
  }
  return [...visited];
}

function extractVerticalFlows(cwd, files) {
  const { nodes } = buildProjectGraph(cwd, files);
  const buckets = new Map();
  const ensureBucket = (key) => {
    if (!buckets.has(key)) buckets.set(key, { name: key, entrypoints: new Set(), client_calls: new Set(), api_routes: new Set(), services_and_models: new Set(), files: new Set() });
    return buckets.get(key);
  };
  for (const node of nodes.values()) {
    if (node.layer !== 'backend_route') continue;
    const keys = node.routes.length ? [...new Set(node.routes.map((r) => routeDomainKey(r.path)))] : [`/${path.posix.basename(node.rel, node.ext)}`];
    const downstream = collectTransitive(node.rel, nodes, 2);
    for (const k of keys) {
      const b = ensureBucket(k);
      b.api_routes.add(node.rel); b.files.add(node.rel);
      for (const dep of downstream) { b.files.add(dep); if (nodes.get(dep)?.layer === 'service_db') b.services_and_models.add(dep); }
    }
  }
  for (const node of nodes.values()) {
    if (node.layer !== 'ui') continue;
    const reach = [node.rel, ...collectTransitive(node.rel, nodes, 2)];
    const calls = reach.flatMap((r) => nodes.get(r)?.clientCalls || []);
    const targets = calls.length ? calls.map((c) => ({ key: routeDomainKey(c.endpoint), ep: c.endpoint })) : [{ key: `ui:${path.posix.basename(node.rel, node.ext)}`, ep: null }];
    for (const t of targets) {
      const b = ensureBucket(t.key);
      b.entrypoints.add(node.rel); if (t.ep) b.client_calls.add(t.ep);
      for (const r of reach) { b.files.add(r); if (nodes.get(r)?.layer === 'service_db') b.services_and_models.add(r); }
    }
  }
  if (buckets.size === 0 && nodes.size > 0) {
    const imported = new Set([...nodes.values()].flatMap((n) => n.imports));
    const roots = [...nodes.keys()].filter((r) => !imported.has(r));
    for (const r of (roots.length ? roots : [...nodes.keys()].slice(0, 8))) {
      const b = ensureBucket(`module:${path.posix.basename(r, path.posix.extname(r))}`);
      b.entrypoints.add(r); b.files.add(r);
      for (const dep of collectTransitive(r, nodes, 2)) { b.services_and_models.add(dep); b.files.add(dep); }
    }
  }
  return [...buckets.values()].sort((a, b) => a.name.localeCompare(b.name)).map((b, idx) => ({
    flow_id: `FLOW-${String(idx + 1).padStart(2, '0')}`, name: b.name,
    entrypoints: [...b.entrypoints].sort(), client_calls: [...b.client_calls].sort(),
    api_routes: [...b.api_routes].sort(), services_and_models: [...b.services_and_models].sort(), files: [...b.files].sort(),
  }));
}

function scanLoopsAndCatches(rel, code, emptyCatches, nPlusOneLoops) {
  for (const m of code.matchAll(/\bcatch\b\s*(?:\([^)]*\))?\s*\{([\s;]*)\}/g)) {
    const line = lineNumberAt(code, m.index);
    emptyCatches.push({ category: 'empty_catch', severity: 'P1', file: rel, line, message: `Empty or swallowed catch block in ${rel}:${line}` });
  }
  const awaitRe = /\bawait\b[^;\n{}]*(?:\b(?:prisma|db|fetch|axios|knex|supabase|mongoose|sequelize|drizzle|pool|client|repo|repository)\b|\.\s*(?:query|execute|findOne|findUnique|findFirst|findMany|create|update|delete|upsert|save|get|post|put|patch|request)\s*\()/g;
  for (const lm of code.matchAll(/\b(?:for|while)\b\s*(?:await\s*)?\(/g)) {
    let [i, pDepth] = [lm.index + lm[0].length, 1];
    while (i < code.length && pDepth > 0) { if (code[i] === '(') pDepth++; else if (code[i] === ')') pDepth--; i++; }
    while (i < code.length && /\s/.test(code[i])) i++;
    let [bodyStart, bodyEnd] = [i, i];
    if (code[i] === '{') {
      let bDepth = 1; bodyStart = ++i;
      while (i < code.length && bDepth > 0) { if (code[i] === '{') bDepth++; else if (code[i] === '}') bDepth--; i++; }
      bodyEnd = i - 1;
    } else { while (i < code.length && code[i] !== ';' && code[i] !== '\n') i++; bodyEnd = i; }
    for (const am of code.slice(bodyStart, Math.max(bodyStart, bodyEnd)).matchAll(awaitRe)) {
      const line = lineNumberAt(code, bodyStart + am.index);
      nPlusOneLoops.push({ category: 'n_plus_one_loop', severity: 'P1', file: rel, line, message: `Potential N+1 async DB/HTTP await inside loop at ${rel}:${line}` });
    }
  }
}

const isScreenFile = (rel, layer) => layer === 'ui' && (
  /(?:^|\/)app\/(?:.+\/)?page\.[cm]?[jt]sx?$/i.test(rel)
  || (/(?:^|\/)(?:pages|screens|views)\/(?!api\/)[^/]+\.[cm]?[jt]sx?$/i.test(rel) && !/^_(?:app|document|error)\./i.test(path.posix.basename(rel)))
  || /(?:Page|Screen|View)\.[cm]?[jt]sx$/i.test(rel)
);

function scanCrossModuleHazards(cwd, files) {
  const { root, nodes } = buildProjectGraph(cwd, files);
  const [emptyCatches, nPlusOneLoops, apiMismatches, missingEnvKeys, uxScreenCoverage] = [[], [], [], [], []];
  const envExampleAbs = path.join(root, '.env.example');
  const hasEnvExample = fs.existsSync(envExampleAbs) && fs.statSync(envExampleAbs).isFile();
  const definedEnv = new Set(hasEnvExample ? [...readCleanText(envExampleAbs).matchAll(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)].map((m) => m[1]) : []);
  const seenMissingEnv = new Set();
  const backendRoutes = [...nodes.values()].filter((n) => n.layer === 'backend_route').flatMap((n) => n.routes);

  for (const node of nodes.values()) {
    if (JS_FAMILY_EXTENSIONS.has(node.ext)) scanLoopsAndCatches(node.rel, node.code, emptyCatches, nPlusOneLoops);
    if (backendRoutes.length > 0 && node.layer !== 'backend_route') {
      for (const call of node.clientCalls.filter((c) => c.endpoint.startsWith('/api/'))) {
        const matched = backendRoutes.some((r) => routesMatch(call.endpoint, r.path) && (call.method === 'ANY' || r.method === 'ANY' || call.method === r.method));
        if (!matched) apiMismatches.push({ category: 'api_route_mismatch', severity: 'P1', file: node.rel, line: call.line, method: call.method, endpoint: call.endpoint, message: `Frontend call ${call.method} ${call.endpoint} in ${node.rel}:${call.line} has no matching backend route` });
      }
    }
    if (hasEnvExample) {
      for (const em of [...node.commentFree.matchAll(/\b(?:process\.env|import\.meta\.env)\.([A-Za-z_][A-Za-z0-9_]*)\b/g), ...node.commentFree.matchAll(/\bprocess\.env\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/g)]) {
        const key = em[1];
        if (!BUILTIN_ENV_KEYS.has(key) && !definedEnv.has(key) && !seenMissingEnv.has(key)) {
          seenMissingEnv.add(key);
          const line = lineNumberAt(node.commentFree, em.index);
          missingEnvKeys.push({ category: 'missing_env_example', severity: 'P2', key, file: node.rel, line, message: `Environment key "${key}" used in ${node.rel}:${line} is missing from .env.example` });
        }
      }
    }
    if (isScreenFile(node.rel, node.layer)) {
      const present = Object.entries(UX_STATE_PATTERNS).filter(([, re]) => re.test(node.commentFree)).map(([k]) => k);
      const missing = Object.keys(UX_STATE_PATTERNS).filter((k) => !present.includes(k));
      uxScreenCoverage.push({ file: node.rel, present_states: present, missing_states: missing, coverage_pct: Math.round((present.length / 5) * 100) });
    }
  }
  const uxHazards = uxScreenCoverage.filter((u) => u.missing_states.length > 0).map((u) => ({ category: 'ux_missing_states', severity: u.missing_states.length >= 3 ? 'P2' : 'P3', file: u.file, line: 1, missing_states: u.missing_states, message: `Screen ${u.file} is missing UX states: ${u.missing_states.join(', ')}` }));
  const hazards = [...emptyCatches, ...nPlusOneLoops, ...apiMismatches, ...missingEnvKeys, ...uxHazards];
  return { hazards, counts: { empty_catch: emptyCatches.length, n_plus_one_loop: nPlusOneLoops.length, api_route_mismatch: apiMismatches.length, missing_env_example: missingEnvKeys.length, ux_incomplete_screens: uxHazards.length }, empty_catches: emptyCatches, n_plus_one_loops: nPlusOneLoops, api_mismatches: apiMismatches, missing_env_keys: missingEnvKeys, ux_screen_coverage: uxScreenCoverage };
}

function runAuditStaticScan(cwd, options = {}) {
  const root = path.resolve(cwd || process.cwd());
  const files = walkProjectSourceFiles(root);
  const sc = files.length > 0 ? runCheck(root, { silent: true, strictPhase: true, useGitIgnore: options.useGitIgnore, homeDir: options.homeDir, cwd: root }) : { passed: true, violations: [], warnings: [] };
  return { scanned_files: files.length, files, spec_sources: discoverSpecSources(root, options.docs), vertical_flows: extractVerticalFlows(root, files), cross_module_hazards: scanCrossModuleHazards(root, files), strict_check: { passed: sc.passed, violations: sc.violations, warnings: sc.warnings } };
}

module.exports = { discoverSpecSources, extractVerticalFlows, scanCrossModuleHazards, runAuditStaticScan };
