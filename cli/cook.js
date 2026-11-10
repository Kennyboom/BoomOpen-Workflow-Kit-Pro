'use strict';

/**
 * CLI Execution State Detector, Wave Handoff Packet Compiler & Post-Wave Verification Engine (`boomopen cook`).
 * Bridges `PLAN-{feature}.md` (+ optional `DESIGN-{feature}.md`) to parallel `role#shard` execution
 * and enforces deterministic Post-Wave Gates `COOK-G1..G4`.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { inspectSourceFile } = require('./checker.js');
const { CODE_EXTENSIONS } = require('./checker-rules.js');
const { validateDesign, extractDesignContract } = require('./design.js');
const { parsePlanMarkdown, validatePlan } = require('./plan.js');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const VERIFY_TIMEOUT_MS = 60000;
const GIT_TIMEOUT_MS = 15000;
const TRANSIENT_DOC_RE = /^(?:PLAN|DESIGN|DESIGN-SPEC|SCOUT|RESEARCH|BRAINSTORM|TEST|REVIEW|MAILBOX|REPORT)(?:[-_.].*)?\.md$/i;

function normPath(p) {
  return String(p || '').trim().replace(/^['"`]+|['"`]+$/g, '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function pathsMatchOrInside(candidate, target) {
  const c = normPath(candidate);
  const t = normPath(target);
  return Boolean(c && t) && (c === t || c.startsWith(`${t}/`));
}

function scanArtifactMatches(dirs, prefixRe, featureSlug) {
  const slug = featureSlug ? String(featureSlug).toLowerCase() : '';
  for (const dir of dirs) {
    if (!dir || !fs.existsSync(dir)) continue;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isFile() && prefixRe.test(e.name) && (!slug || e.name.toLowerCase().includes(slug)))
        .map((e) => path.join(dir, e.name)).sort();
      if (files.length > 0) return files[0];
    } catch { /* ignore unreadable dir */ }
  }
  return null;
}

function collectCandidateDirs(cwd, artifactDir) {
  const dirs = [...(artifactDir ? [path.resolve(artifactDir)] : []), path.resolve(cwd)];
  const reportsRoot = path.join(path.resolve(cwd), 'reports');
  if (fs.existsSync(reportsRoot)) {
    try {
      for (const topic of fs.readdirSync(reportsRoot, { withFileTypes: true })) {
        if (!topic.isDirectory()) continue;
        const tDir = path.join(reportsRoot, topic.name);
        dirs.push(tDir, ...['plans', 'designs', 'scouts', 'research', 'brainstorms'].map((s) => path.join(tDir, s)));
      }
    } catch { /* ignore unreadable reports dir */ }
  }
  return dirs;
}

function detectCookState(options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const dirs = collectCandidateDirs(cwd, options.artifactDir);
  const scout = scanArtifactMatches(dirs, /^SCOUT(?:[-_.].*)?\.md$/i, options.feature);
  const research = scanArtifactMatches(dirs, /^RESEARCH(?:[-_.].*)?\.md$/i, options.feature);
  const brainstorm = scanArtifactMatches(dirs, /^BRAINSTORM(?:[-_.].*)?\.md$/i, options.feature);
  const design = scanArtifactMatches(dirs, /^DESIGN(?:-SPEC)?(?:[-_.].*)?\.md$/i, options.feature);
  const plan = scanArtifactMatches(dirs, /^PLAN(?:[-_.].*)?\.md$/i, options.feature);
  const ledgerPath = path.join(cwd, '.boomopen', 'project-ledger.json');
  const artifacts = { scout, research, brainstorm, design, plan, ledger: fs.existsSync(ledgerPath) ? ledgerPath : null };

  let feature = options.feature || null;
  if (!feature) {
    for (const f of [plan, design, brainstorm, scout, research]) {
      const m = f && /^(?:PLAN|DESIGN(?:-SPEC)?|BRAINSTORM|SCOUT|RESEARCH)-(.+)\.md$/i.exec(path.basename(f));
      if (m) { feature = m[1]; break; }
    }
  }
  if (plan) return { feature, artifacts, recommendedStage: 'STAGE_4_EXECUTE', reason: 'Approved PLAN artifact detected; fast-forward directly to Wave Packet execution.', nextCommand: `boomopen cook packets "${plan}"` };
  if (design) return { feature, artifacts, recommendedStage: 'STAGE_3_PLAN', reason: 'Approved DESIGN artifact detected; extract DESIGN_CONTRACT and generate PLAN.', nextCommand: `boomopen design contract "${design}"` };
  if (scout || research || brainstorm) {
    const briefSource = research || brainstorm;
    return { feature, artifacts, recommendedStage: 'STAGE_2_DESIGN_OR_PLAN', reason: 'Prior SCOUT/RESEARCH/BRAINSTORM discovery artifacts detected; proceed to Design or Planning.', nextCommand: briefSource ? `boomopen research brief "${briefSource}"` : 'boomopen plan validate <plan.md>' };
  }
  return { feature, artifacts, recommendedStage: 'STAGE_1_DISCOVER', reason: 'No prior workflow artifacts found; start Stage 1 parallel Research & Scouting.', nextCommand: 'boomopen cook state --json' };
}

function usageMissingError(msg) {
  const err = new Error(msg);
  err.code = 'ENOENT_USAGE';
  return err;
}

function loadPlanInput(planOrPath, cwd) {
  if (planOrPath && typeof planOrPath === 'object' && Array.isArray(planOrPath.tasks)) return planOrPath;
  const raw = String(planOrPath || '');
  if (!raw.includes('\n') && !raw.trim().startsWith('#')) {
    const abs = path.resolve(cwd, raw);
    if (!fs.existsSync(abs)) throw usageMissingError(`Plan file not found: ${raw}`);
    return parsePlanMarkdown(fs.readFileSync(abs, 'utf8'), raw);
  }
  return parsePlanMarkdown(raw, 'PLAN.md');
}

function resolveDesignMarkdown(options, cwd) {
  if (options.designMarkdown) return String(options.designMarkdown);
  const ref = options.designPath || options.design;
  if (!ref) return '';
  const abs = path.resolve(cwd, ref);
  if (!fs.existsSync(abs)) throw usageMissingError(`Design file not found: ${ref}`);
  return fs.readFileSync(abs, 'utf8');
}

function sortPhasesTopologically(phases) {
  const list = Array.isArray(phases) ? [...phases] : [];
  const byId = new Map(list.map((p) => [p.phase_id, p]));
  const state = new Map();
  const ordered = [];
  const visit = (id) => {
    if (state.has(id) || !byId.has(id)) return;
    state.set(id, 1);
    const p = byId.get(id);
    for (const dep of p.dependsOn || p.depends_on || []) visit(dep);
    state.set(id, 2);
    ordered.push(p);
  };
  for (const p of list) visit(p.phase_id);
  return ordered;
}

function renderShardPrompt(s) {
  const acLine = s.acceptance.length ? `\n- **Acceptance Criteria**: ${s.acceptance.join(', ')}` : '';
  const owned = s.ownedFiles.length ? s.ownedFiles.map((f) => `- \`${f}\``).join('\n') : '- NONE (Read-Only)';
  const ro = s.readOnlyFiles.length ? s.readOnlyFiles.map((f) => `- \`${f}\``).join('\n') : '- All files outside OWNED_FILES';
  const tests = s.testFiles.length ? `\n- **Test Files**: ${s.testFiles.map((f) => `\`${f}\``).join(', ')}` : '';
  return [
    `# 📦 5-FIELD HANDOFF PACKET — Wave ${s.wave} | ${s.id} (${s.role})`, '',
    '## 1. MISSION & ACCEPTANCE CRITERIA',
    `- **Task**: ${s.id} — ${s.title}\n- **Assigned Shard**: \`${s.role}\` (Wave ${s.wave})${acLine}`, '',
    '## 2. SHARED_CONTRACT', s.sharedContract || 'No explicit SHARED_CONTRACT block declared.', '',
    '## 3. OWNED_FILES (Exclusive Write Lock)', owned, '',
    '## 4. READ_ONLY_FILES (Strictly Do Not Modify)', ro, '',
    '## 5. VERIFICATION & DELIVERABLE',
    `- **Verify Command**: \`${s.verifyCmd || 'boomopen check . --strict-phase --no-stubs'}\`${tests}`,
  ].join('\n');
}

function matchesWaveFilter(waveObj, filterVal) {
  if (filterVal === undefined || filterVal === null || filterVal === '') return true;
  const raw = String(filterVal).trim().toUpperCase();
  if (/^\d+$/.test(raw)) return waveObj.wave === Number.parseInt(raw, 10);
  return waveObj.phaseId.toUpperCase() === raw || `WAVE-${waveObj.wave}` === raw || `PHASE-${waveObj.wave}` === raw;
}

function compileWavePackets(planOrPath, options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const plan = loadPlanInput(planOrPath, cwd);
  const errors = plan.tasks && plan.tasks.length > 0 ? [] : ['[COOK-PACKETS] Plan contains 0 tasks/shards.'];
  const designMd = resolveDesignMarkdown(options, cwd);
  const designBlock = designMd ? extractDesignContract(designMd).markdownBlock : '';
  let sharedContract = plan.sharedContract || '';
  if (designBlock && !sharedContract.includes('DESIGN_CONTRACT')) {
    sharedContract = sharedContract ? `${sharedContract}\n\n${designBlock}` : designBlock;
  }

  const priorOwned = new Set();
  const allWaves = sortPhasesTopologically(plan.phases || []).map((phase, idx) => {
    const wave = idx + 1;
    const tasks = (plan.tasks || []).filter((t) => t.phaseId === phase.phase_id);
    const ownedPerTask = tasks.map((t) => t.ownedFiles.map(normPath).filter(Boolean));
    const shards = tasks.map((t, sIdx) => {
      const ownedFiles = ownedPerTask[sIdx];
      const ownSet = new Set(ownedFiles);
      const siblingOwned = ownedPerTask.flatMap((list, j) => (j === sIdx ? [] : list));
      const declaredRo = (t.readOnlyFiles || []).map(normPath).filter(Boolean);
      const readOnlyFiles = [...new Set([...declaredRo, ...siblingOwned, ...priorOwned])].filter((f) => !ownSet.has(f));
      const shard = {
        id: t.reqId, title: t.title, role: t.agent || 'unassigned', wave, acceptance: t.acceptance || [],
        ownedFiles, testFiles: (t.testFiles || []).map(normPath).filter(Boolean),
        readOnlyFiles, verifyCmd: t.verifyCmd || '', sharedContract, prompt: '',
      };
      shard.prompt = renderShardPrompt(shard);
      return shard;
    });
    for (const list of ownedPerTask) for (const f of list) priorOwned.add(f);
    return { wave, phaseId: phase.phase_id, title: phase.title, shards };
  });

  const hasFilter = options.wave !== undefined && options.wave !== null && options.wave !== '';
  const waves = hasFilter ? allWaves.filter((w) => matchesWaveFilter(w, options.wave)) : allWaves;
  if (hasFilter && waves.length === 0) errors.push(`[COOK-PACKETS] Wave "${options.wave}" was not found in plan.`);
  return { valid: errors.length === 0, errors, waves };
}

function listGitChangedFiles(cwd) {
  const res = spawnSync('git', ['-C', cwd, 'status', '--porcelain', '-uall'], { encoding: 'utf8', timeout: GIT_TIMEOUT_MS, windowsHide: true });
  if (res.error || res.status !== 0) return [];
  return res.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
    const raw = line.slice(3).trim();
    const arrow = raw.indexOf(' -> ');
    return normPath(arrow !== -1 ? raw.slice(arrow + 4) : raw);
  }).filter(Boolean);
}

function verifyWaveExecution(planOrPath, options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const compiled = compileWavePackets(planOrPath, { ...options, cwd });
  const g1 = [...compiled.errors], g2 = [], g3 = [], g4 = [], warnings = [];
  const shardKey = options.shard ? String(options.shard).trim().toLowerCase() : '';
  const selected = compiled.waves.flatMap((w) => w.shards)
    .filter((s) => !shardKey || s.id.toLowerCase() === shardKey || s.role.toLowerCase() === shardKey);
  if (selected.length === 0 && g1.length === 0) g1.push(`[COOK-G1] No shards matched wave="${options.wave ?? 'all'}" shard="${options.shard ?? 'all'}".`);

  const allowedFiles = [...new Set(selected.flatMap((s) => [...s.ownedFiles, ...s.testFiles]))];
  const readOnlyPool = [...new Set(selected.flatMap((s) => s.readOnlyFiles))]
    .filter((ro) => !allowedFiles.some((own) => pathsMatchOrInside(ro, own)));
  const rawChanged = Array.isArray(options.changedFiles) ? options.changedFiles
    : typeof options.changedFiles === 'string' ? options.changedFiles.split(',').map((s) => s.trim()).filter(Boolean)
      : options.git ? listGitChangedFiles(cwd) : null;

  if (rawChanged) {
    for (const ch of rawChanged.map(normPath).filter(Boolean)) {
      if (ch.startsWith('.boomopen/')) continue;
      if (readOnlyPool.some((ro) => pathsMatchOrInside(ch, ro))) g1.push(`[COOK-G1] Read-only file mutated during wave: "${ch}".`);
      else if (!TRANSIENT_DOC_RE.test(path.basename(ch)) && !allowedFiles.some((own) => pathsMatchOrInside(ch, own))) {
        g1.push(`[COOK-G1] Unauthorized file modified outside wave OWNED_FILES: "${ch}".`);
      }
    }
  }

  const checkedFiles = [];
  for (const rel of allowedFiles) {
    const abs = path.resolve(cwd, rel);
    try {
      if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) { g2.push(`[COOK-G2] Missing expected deliverable on disk: "${rel}".`); continue; }
      if (fs.statSync(abs).size === 0 || fs.readFileSync(abs, 'utf8').trim().length === 0) { g2.push(`[COOK-G2] Deliverable file is empty: "${rel}".`); continue; }
      checkedFiles.push(rel);
      if (CODE_EXTENSIONS.has(path.extname(rel).toLowerCase())) {
        const checkRes = inspectSourceFile(abs, cwd, undefined, undefined, { projectRoot: cwd, strictPhase: true });
        for (const v of checkRes.violations) g3.push(`[COOK-G3] ${v}`);
        warnings.push(...checkRes.warnings);
      }
    } catch (err) {
      g2.push(`[COOK-G2] Cannot inspect "${rel}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (options.runVerify) {
    const cmds = [...new Set(selected.map((s) => s.verifyCmd).filter(Boolean))];
    if (cmds.length === 0 && selected.length > 0) g4.push('[COOK-G4] No concrete verification command defined on target shard(s).');
    for (const cmd of cmds) {
      try {
        const res = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', timeout: options.timeoutMs || VERIFY_TIMEOUT_MS, windowsHide: true });
        if (res.error || res.status !== 0) {
          const detail = (res.stderr || res.stdout || (res.error && res.error.message) || '').trim().slice(0, 180);
          g4.push(`[COOK-G4] Verify command failed (exit ${res.status ?? 1}): "${cmd}"${detail ? ` — ${detail}` : ''}`);
        }
      } catch (err) {
        g4.push(`[COOK-G4] Verify command threw error: "${cmd}" — ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  const errors = [...g1, ...g2, ...g3, ...g4];
  return {
    valid: errors.length === 0, errors, warnings,
    gates: { G1: g1.length === 0, G2: g2.length === 0, G3: g3.length === 0, G4: g4.length === 0 },
    checkedFiles,
  };
}

function runCookPreflight(planOrPath, options = {}) {
  const cwd = path.resolve(options.cwd || process.cwd());
  const plan = loadPlanInput(planOrPath, cwd);
  const planVal = validatePlan(plan, options);
  const designMd = resolveDesignMarkdown(options, cwd);
  const designVal = designMd ? validateDesign(designMd) : null;
  const packets = compileWavePackets(plan, { ...options, cwd, designMarkdown: designMd });
  const errors = [...planVal.errors, ...(designVal ? designVal.errors : []), ...packets.errors];
  return { valid: errors.length === 0, errors, warnings: designVal ? designVal.warnings : [], packets };
}

const COOK_HELP = `Usage: boomopen cook <state|packets|verify-wave|preflight|help> [options]
  state [dir] [--artifact-dir <dir>] [--feature <slug>] [--json]
  packets <plan.md> [--design <design.md>] [--wave <n>] [--out <file>] [--json]
  verify-wave <plan.md> [--wave <n>] [--shard <id>] [--changed <a,b>] [--git] [--run-verify] [--json]
  preflight <plan.md> [--design <design.md>] [--json]`;

const VALUE_FLAG_KEYS = { '--artifact-dir': 'artifactDir', '--feature': 'feature', '--design': 'design', '--wave': 'wave', '--shard': 'shard', '--changed': 'changed', '--out': 'out', '--output': 'out' };

function parseCookArgs(args) {
  const flags = { artifactDir: null, feature: null, design: null, wave: null, shard: null, changed: null, out: null, git: false, runVerify: false, json: false, help: false };
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') flags.help = true;
    else if (a === '--json') flags.json = true;
    else if (a === '--git') flags.git = true;
    else if (a === '--run-verify') flags.runVerify = true;
    else if (VALUE_FLAG_KEYS[a]) flags[VALUE_FLAG_KEYS[a]] = args[++i];
    else positional.push(a);
  }
  return { sub: (positional[0] || 'help').toLowerCase(), positional, flags };
}

function runCookCli(args = [], env = {}) {
  const { sub, positional, flags } = parseCookArgs(args);
  if (flags.help || sub === 'help') { if (!env.silent) console.log(COOK_HELP); return EXIT_OK; }
  const cwd = path.resolve(env.cwd || process.cwd());
  try {
    if (sub === 'state') {
      const targetDir = positional[1] ? path.resolve(cwd, positional[1]) : cwd;
      if (!fs.existsSync(targetDir)) return EXIT_USAGE;
      const st = detectCookState({ cwd: targetDir, artifactDir: flags.artifactDir, feature: flags.feature });
      if (!env.silent) console.log(flags.json ? JSON.stringify(st, null, 2) : `🧭 Stage: ${st.recommendedStage} — ${st.reason}\n   Next: ${st.nextCommand}`);
      return EXIT_OK;
    }
    const planFile = positional[1];
    if (!planFile) { if (!env.silent) console.error(`❌ boomopen cook ${sub} requires a <plan.md> path.\n\n${COOK_HELP}`); return EXIT_USAGE; }
    if (sub === 'packets') {
      const res = compileWavePackets(planFile, { cwd, designPath: flags.design, wave: flags.wave });
      const md = res.waves.map((w) => `# 🌊 WAVE ${w.wave}: ${w.title}\n\n${w.shards.map((s) => `${s.prompt}\n\n---`).join('\n')}`).join('\n\n');
      if (flags.out && res.valid) {
        const outAbs = path.resolve(cwd, flags.out);
        fs.mkdirSync(path.dirname(outAbs), { recursive: true });
        fs.writeFileSync(outAbs, `${md}\n`, 'utf8');
      }
      if (!env.silent) console.log(flags.json ? JSON.stringify(res, null, 2) : md);
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    if (sub === 'verify-wave' || sub === 'preflight') {
      const res = sub === 'verify-wave'
        ? verifyWaveExecution(planFile, { cwd, designPath: flags.design, wave: flags.wave, shard: flags.shard, changedFiles: flags.changed, git: flags.git, runVerify: flags.runVerify })
        : runCookPreflight(planFile, { cwd, designPath: flags.design });
      if (!env.silent) {
        if (flags.json) console.log(JSON.stringify(res, null, 2));
        else if (res.valid) console.log(`✅ Cook ${sub} passed!`);
        else for (const err of res.errors) console.error(`❌ ${err}`);
      }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    if (!env.silent) console.error(`❌ Unknown cook subcommand "${sub}"\n\n${COOK_HELP}`);
    return EXIT_USAGE;
  } catch (err) {
    if (!env.silent) console.error(`❌ boomopen cook: ${err instanceof Error ? err.message : String(err)}`);
    return err && err.code === 'ENOENT_USAGE' ? EXIT_USAGE : EXIT_FAIL;
  }
}

module.exports = { detectCookState, compileWavePackets, verifyWaveExecution, runCookPreflight, runCookCli };
