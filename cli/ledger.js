'use strict';

/**
 * Multi-Session Project Ledger & Phase Gate Engine (`boomopen ledger`).
 * Manages `.boomopen/project-ledger.json`, `.boomopen/ROADMAP-PROGRESS.md`, and
 * `.boomopen/contracts/SHARED_CONTRACT.md` for Spec-Hash Drift Guard, Scoped Context Slicing,
 * Deterministic Phase Gate, Git Checkpoint Rollbacks (`rollback --yes`), and 100% RTM Audit.
 */

const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { inspectSourceFile, resolveActiveStandards } = require('./checker.js');
const { CODE_EXTENSIONS } = require('./checker-rules.js');
const { EXIT_OK, EXIT_FAIL, EXIT_USAGE, parseSubcommandArgs, splitCommaOption, runVerifyCommands } = require('./cli-args.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { createGitCheckpoint, rollbackToGitCheckpoint } = require('./git-checkpoints.js');
const { countLines, readCleanText } = require('./markdown-fences.js');

const DEFAULT_LEDGER_REL = path.join('.boomopen', 'project-ledger.json');
const VALID_STATUSES = new Set(['pending', 'in_progress', 'verified']);
const normRel = (p) => String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
const hashFileSha256 = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

function resolvePaths(cwd, customFile) {
  const ledgerPath = customFile ? path.resolve(cwd, customFile) : path.join(cwd, DEFAULT_LEDGER_REL);
  const boomDir = path.dirname(ledgerPath);
  return { cwd, ledgerPath, progressPath: path.join(boomDir, 'ROADMAP-PROGRESS.md'), contractPath: path.join(boomDir, 'contracts', 'SHARED_CONTRACT.md') };
}

function normalizeLedgerShape(raw, cwd) {
  if (!raw || typeof raw !== 'object') return raw;
  if (!raw.project_name && raw.project) raw.project_name = raw.project;
  if (!raw.schema_version && raw.version) raw.schema_version = raw.version;
  if (!Array.isArray(raw.spec_documents) && Array.isArray(raw.source_documents)) {
    raw.spec_documents = raw.source_documents.map((doc) => {
      if (typeof doc !== 'string') return doc;
      const abs = cwd ? path.resolve(cwd, doc) : null;
      const exists = abs && fs.existsSync(abs) && fs.statSync(abs).isFile();
      return { path: doc, sha256: exists ? hashFileSha256(abs) : '', lines: exists ? countLines(readCleanText(abs)) : 0 };
    });
  }
  if (!Array.isArray(raw.features) && Array.isArray(raw.requirements)) raw.features = raw.requirements;
  for (const p of Array.isArray(raw.phases) ? raw.phases : []) {
    if (!p || typeof p !== 'object') continue;
    if (!p.phase_id && p.id) p.phase_id = p.id;
    if (!p.title && p.name) p.title = p.name;
    if (p.status === 'completed') p.status = 'verified';
    if (!Array.isArray(p.depends_on)) p.depends_on = [];
  }
  for (const f of Array.isArray(raw.features) ? raw.features : []) {
    if (!f || typeof f !== 'object') continue;
    if (!f.req_id && f.id) f.req_id = f.id;
    if (!f.title && f.name) f.title = f.name;
    if (!f.source_doc && f.source_ref) f.source_doc = f.source_ref;
    if (!Array.isArray(f.owned_files) && Array.isArray(f.files_owned)) f.owned_files = f.files_owned;
    if (!f.verification_cmd && f.verification_command) f.verification_cmd = f.verification_command;
    if (f.status === 'completed') f.status = 'verified';
    if (f.status === 'verified' && f.passes === undefined) f.passes = true;
  }
  return raw;
}

function loadLedgerFile(ledgerPath, cwd) {
  if (!fs.existsSync(ledgerPath)) throw new Error(`Project ledger not found at ${ledgerPath}. Run "boomopen ledger init" first.`);
  const dir = path.dirname(path.resolve(ledgerPath));
  const inferredCwd = cwd || (path.basename(dir) === '.boomopen' ? path.resolve(dir, '..') : dir);
  return normalizeLedgerShape(JSON.parse(readCleanText(ledgerPath)), inferredCwd);
}

function saveLedgerFile(ledgerPath, ledger) {
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  ledger.updated_at = new Date().toISOString();
  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
}

function renderProgressMarkdown(ledger) {
  const [phases, features] = [Array.isArray(ledger.phases) ? ledger.phases : [], Array.isArray(ledger.features) ? ledger.features : []];
  const verifiedPhases = phases.filter((p) => p.status === 'verified').length;
  const verifiedReqs = features.filter((f) => f.passes && f.status === 'verified').length;
  const pct = features.length ? Math.round((verifiedReqs / features.length) * 100) : 0;
  const cursor = ledger.active_cursor || {};
  const lines = [
    `# 📊 Project Autopilot Roadmap & Progress — ${ledger.project_name || 'Project'}`, '',
    `- **Schema Version**: \`${ledger.schema_version || KIT_VERSION}\` | **Active Phase**: \`${cursor.current_phase_id || 'COMPLETE'}\``,
    `- **Phases Verified**: \`${verifiedPhases} / ${phases.length}\` | **Requirements Verified**: \`${verifiedReqs} / ${features.length}\` (**${pct}%**)`,
    `- **Cumulative Passing Tests Ratchet**: \`${cursor.baseline_passed_tests || 0}\``, '',
    '## 🗺️ Phase DAG Status', '| Phase ID | Title | Depends On | Status | Requirements |', '|----------|-------|------------|--------|--------------|',
    ...phases.map((p) => {
      const pReqs = features.filter((f) => f.phase_id === p.phase_id);
      const pDone = pReqs.filter((f) => f.passes && f.status === 'verified').length;
      return `| \`${p.phase_id}\` | ${p.title} | ${p.depends_on?.length ? p.depends_on.join(', ') : '—'} | \`${p.status}\` | ${pDone}/${pReqs.length} |`;
    }),
    '', '## 📋 Requirement Traceability Matrix (RTM)', '| REQ ID | Phase | Title | Source Doc | Status |', '|--------|-------|-------|------------|--------|',
    ...features.map((f) => `| \`${f.req_id}\` | \`${f.phase_id}\` | ${f.title} | \`${f.source_doc || '—'}\` | \`${f.passes ? 'verified' : f.status}\` |`),
  ];
  return `${lines.join('\n')}\n`;
}

function writeProgressFile(progressPath, ledger) {
  fs.mkdirSync(path.dirname(progressPath), { recursive: true });
  fs.writeFileSync(progressPath, renderProgressMarkdown(ledger), 'utf8');
}

function findNextReadyPhase(ledger) {
  const phases = Array.isArray(ledger.phases) ? ledger.phases : [];
  const verifiedIds = new Set(phases.filter((p) => p.status === 'verified').map((p) => p.phase_id));
  return phases.find((p) => p.status !== 'verified' && (p.depends_on || []).every((d) => verifiedIds.has(d))) || null;
}

function detectPhaseCycle(phases) {
  const [byId, state] = [new Map(phases.map((p) => [p.phase_id, p])), new Map()];
  const visit = (id) => {
    if (state.get(id) === 1) return true;
    if (state.get(id) === 2) return false;
    state.set(id, 1);
    for (const dep of byId.get(id)?.depends_on || []) if (byId.has(dep) && visit(dep)) return true;
    state.set(id, 2);
    return false;
  };
  return phases.some((p) => visit(p.phase_id));
}

function validateLedger(ledger, cwd, options = {}) {
  const [errors, maxShardFiles] = [[], options.maxFilesPerShard || 4];
  if (!ledger || typeof ledger !== 'object') return { valid: false, errors: ['Ledger root must be a JSON object'] };
  normalizeLedgerShape(ledger, cwd);
  for (const doc of ledger.spec_documents || []) {
    if (!doc || !doc.path || !doc.sha256) { errors.push('spec_documents entry missing path or sha256'); continue; }
    const absDoc = path.resolve(cwd, doc.path);
    if (!fs.existsSync(absDoc)) errors.push(`Spec document missing on disk: ${doc.path}`);
    else if (hashFileSha256(absDoc) !== doc.sha256) errors.push(`Spec drift detected in ${doc.path} (sha256 mismatch)`);
  }
  const [phases, phaseIds] = [Array.isArray(ledger.phases) ? ledger.phases : [], new Set()];
  for (const p of phases) {
    if (!p.phase_id || !p.title) errors.push('Phase entry missing phase_id or title');
    if (phaseIds.has(p.phase_id)) errors.push(`Duplicate phase_id: ${p.phase_id}`);
    phaseIds.add(p.phase_id);
    if (!VALID_STATUSES.has(p.status)) errors.push(`Invalid status "${p.status}" in phase ${p.phase_id}`);
  }
  for (const p of phases) for (const dep of p.depends_on || []) if (!phaseIds.has(dep)) errors.push(`Phase ${p.phase_id} depends on unknown phase "${dep}"`);
  if (detectPhaseCycle(phases)) errors.push('Circular dependency detected in phases[] DAG');
  const [reqIds, phaseFileOwners] = [new Set(), new Map()];
  for (const f of ledger.features || []) {
    if (!f.req_id || !f.phase_id || !f.title) errors.push(`Feature ${f.req_id || '(unnamed)'} missing req_id, phase_id, or title`);
    if (reqIds.has(f.req_id)) errors.push(`Duplicate req_id: ${f.req_id}`);
    reqIds.add(f.req_id);
    if (!phaseIds.has(f.phase_id)) errors.push(`Feature ${f.req_id} references unknown phase_id "${f.phase_id}"`);
    if (!f.source_doc) errors.push(`Feature ${f.req_id} missing source_doc citation`);
    if (!Array.isArray(f.acceptance_criteria) || !f.acceptance_criteria.length) errors.push(`Feature ${f.req_id} must define non-empty acceptance_criteria[]`);
    if (!Array.isArray(f.owned_files) || !Array.isArray(f.test_files)) errors.push(`Feature ${f.req_id} must define owned_files[] and test_files[] arrays`);
    else {
      if (f.owned_files.length > maxShardFiles) errors.push(`Feature ${f.req_id} owns ${f.owned_files.length} files (exceeds <= ${maxShardFiles})`);
      if ((f.passes || f.status === 'verified') && (!f.owned_files.length || !f.test_files.length)) errors.push(`Verified feature ${f.req_id} must have non-empty owned_files[] and test_files[]`);
      if (options.strictShards) {
        for (const rel of f.owned_files) {
          const key = `${f.phase_id}::${normRel(rel).toLowerCase()}`;
          const prev = phaseFileOwners.get(key);
          if (prev && prev !== f.req_id) errors.push(`File collision in phase ${f.phase_id}: "${rel}" owned by both ${prev} and ${f.req_id}`);
          else phaseFileOwners.set(key, f.req_id);
        }
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

function initLedger(options = {}) {
  const [cwd, paths] = [options.cwd || process.cwd(), resolvePaths(options.cwd || process.cwd(), options.file)];
  const specDocs = (options.docs || []).map((relDoc) => {
    const absDoc = path.resolve(cwd, relDoc);
    if (!fs.existsSync(absDoc)) throw new Error(`Spec document not found: ${relDoc}`);
    return { path: relDoc, sha256: hashFileSha256(absDoc), lines: countLines(readCleanText(absDoc)) };
  });
  const cp = createGitCheckpoint(cwd, 'phase-01');
  const cpSha = cp.available ? cp.headSha : null;
  const ledger = {
    schema_version: KIT_VERSION, project_name: options.name || path.basename(cwd), updated_at: new Date().toISOString(),
    spec_documents: specDocs, active_cursor: { current_phase_id: 'phase-01', baseline_passed_tests: 0, checkpoint_sha: cpSha },
    checkpoints: cpSha ? { 'phase-01': cpSha } : {},
    phases: [{ phase_id: 'phase-01', title: 'Phase 1 — Foundation & Core Contracts', status: 'pending', depends_on: [], doc_slices: specDocs.map((d) => `${d.path}#L1-L${d.lines}`), checkpoint_sha: cpSha }],
    features: [],
  };
  saveLedgerFile(paths.ledgerPath, ledger);
  if (!fs.existsSync(paths.contractPath)) {
    fs.mkdirSync(path.dirname(paths.contractPath), { recursive: true });
    fs.writeFileSync(paths.contractPath, '# 🤝 SHARED_CONTRACT — Cross-Phase Architecture & Type Invariants\n\n> Frozen interface definitions shared across phases.\n', 'utf8');
  }
  writeProgressFile(paths.progressPath, ledger);
  return { ledger, paths };
}

function listReadOnlyPriorTests(ledger) {
  const verifiedPhaseIds = new Set((ledger.phases || []).filter((p) => p.status === 'verified').map((p) => p.phase_id));
  return [...new Set((ledger.features || []).filter((f) => verifiedPhaseIds.has(f.phase_id)).flatMap((f) => f.test_files || []))];
}

function getNextPhaseSlice(ledger, paths) {
  const nextPhase = findNextReadyPhase(ledger);
  return {
    complete: !nextPhase, phase_id: nextPhase ? nextPhase.phase_id : null, title: nextPhase ? nextPhase.title : null,
    checkpoint_sha: (nextPhase && nextPhase.checkpoint_sha) || ledger.active_cursor?.checkpoint_sha || null,
    doc_slices: nextPhase ? nextPhase.doc_slices || [] : [],
    shared_contract: normRel(path.relative(paths.cwd, paths.contractPath)),
    baseline_passed_tests: ledger.active_cursor?.baseline_passed_tests || 0,
    read_only_prior_tests: listReadOnlyPriorTests(ledger),
    pending_requirements: nextPhase ? (ledger.features || []).filter((f) => f.phase_id === nextPhase.phase_id && (!f.passes || f.status !== 'verified')) : [],
  };
}

function checkPriorTestLocks(cwd, readOnlyPriorTests) {
  if (!readOnlyPriorTests.length || !fs.existsSync(path.join(cwd, '.git'))) return [];
  const res = spawnSync('git', ['-C', cwd, 'status', '--porcelain', '-z', '-uall'], { encoding: 'utf8', timeout: 15000, windowsHide: true });
  if (res.error || res.status !== 0) return [];
  const [parts, changed] = [res.stdout.split('\0'), new Set()];
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (!e || e.length < 4 || e.slice(0, 2) === '??') continue;
    changed.add(normRel(e.slice(3)).toLowerCase());
    if ('RC'.includes(e[0]) || 'RC'.includes(e[1])) changed.add(normRel(parts[++i] || '').toLowerCase());
  }
  return readOnlyPriorTests.filter((t) => changed.has(normRel(t).toLowerCase())).map((t) => `[LEDGER-LOCK] Read-only prior test file mutated in git status: "${t}"`);
}

function inspectRequirementFiles(reqs, cwd, options = {}) {
  const [violations, activeStd, codeFiles] = [[], resolveActiveStandards(cwd, { cwd, homeDir: options.homeDir }), new Set()];
  for (const req of reqs) {
    if (options.requireArrays) {
      if (!req.owned_files?.length) violations.push(`${req.req_id}: owned_files[] cannot be empty`);
      if (!req.test_files?.length) violations.push(`${req.req_id}: test_files[] cannot be empty`);
    }
    for (const relFile of [...(req.owned_files || []), ...(Array.isArray(req.test_files) ? req.test_files : [])]) {
      const absFile = path.resolve(cwd, relFile);
      if (!fs.existsSync(absFile) || !fs.statSync(absFile).isFile()) violations.push(`${req.req_id}: missing file on disk "${relFile}"`);
      else if (readCleanText(absFile).trim().length === 0) violations.push(`${req.req_id}: empty file "${relFile}"`);
      else if (CODE_EXTENSIONS.has(path.extname(absFile).toLowerCase())) codeFiles.add(absFile);
    }
  }
  for (const absFile of codeFiles) violations.push(...inspectSourceFile(absFile, cwd, undefined, activeStd, { projectRoot: cwd, strictPhase: true }).violations);
  return violations;
}

function verifyPhaseGate(ledger, phaseId, options = {}) {
  const [cwd, violations] = [options.cwd || process.cwd(), [...validateLedger(ledger, options.cwd || process.cwd()).errors]];
  const phase = (ledger.phases || []).find((p) => p.phase_id === phaseId);
  if (!phase) return { passed: false, violations: [`Unknown phase_id "${phaseId}"`] };

  const verifiedIds = new Set((ledger.phases || []).filter((p) => p.status === 'verified').map((p) => p.phase_id));
  for (const dep of phase.depends_on || []) if (!verifiedIds.has(dep)) violations.push(`Dependency phase "${dep}" is not yet verified`);
  const phaseReqs = (ledger.features || []).filter((f) => f.phase_id === phaseId);
  if (phaseReqs.length === 0) violations.push(`Phase "${phaseId}" has 0 requirements in features[]`);

  violations.push(...inspectRequirementFiles(phaseReqs, cwd, { ...options, requireArrays: true }));
  if (options.strictLocks) violations.push(...checkPriorTestLocks(cwd, listReadOnlyPriorTests(ledger)));
  if (options.reconcile) {
    const { scanProjectReconciliation } = require('./reconcile.js');
    violations.push(...scanProjectReconciliation(cwd, { ownedFiles: [...new Set(phaseReqs.flatMap((r) => r.owned_files || []))], strict: true }).errors);
  }
  if (options.runVerify) {
    const cmds = [...new Set(phaseReqs.map((r) => String(r.verification_cmd || '').trim()).filter(Boolean))];
    if (cmds.length === 0 && phaseReqs.length > 0) violations.push(`Phase "${phaseId}" has no verification_cmd defined for --run-verify`);
    else violations.push(...runVerifyCommands(cmds, cwd, options.timeoutMs));
  }

  const requiredTests = (ledger.active_cursor?.baseline_passed_tests || 0) + phaseReqs.length;
  if (options.passedTests !== undefined && (!Number.isInteger(options.passedTests) || options.passedTests < requiredTests)) {
    violations.push(`Regression ratchet failed: --passed-tests ${options.passedTests} < required minimum ${requiredTests}`);
  }
  if (violations.length > 0) return { passed: false, violations };

  for (const req of phaseReqs) { req.passes = true; req.status = 'verified'; }
  phase.status = 'verified';
  const nextReady = findNextReadyPhase(ledger);
  const cp = options.cwd ? createGitCheckpoint(cwd, nextReady ? nextReady.phase_id : `${phaseId}-verified`) : { available: false, headSha: null };
  const cpSha = cp.available ? cp.headSha : null;
  if (cpSha) {
    if (!phase.checkpoint_sha) phase.checkpoint_sha = cpSha;
    phase.verified_sha = cpSha;
    if (nextReady) nextReady.checkpoint_sha = cpSha;
    ledger.checkpoints = { ...(ledger.checkpoints || {}), [phaseId]: phase.checkpoint_sha || cpSha, ...(nextReady ? { [nextReady.phase_id]: cpSha } : {}) };
  }
  ledger.active_cursor = { current_phase_id: nextReady ? nextReady.phase_id : null, baseline_passed_tests: options.passedTests ?? requiredTests, checkpoint_sha: cpSha };
  return { passed: true, violations: [], next_phase_id: ledger.active_cursor.current_phase_id, checkpoint_sha: cpSha };
}

function rollbackLedgerPhase(ledger, options = {}) {
  const phaseId = options.phaseId || ledger.active_cursor?.current_phase_id || ledger.phases?.[ledger.phases.length - 1]?.phase_id;
  const phase = (ledger.phases || []).find((p) => p.phase_id === phaseId);
  if (options.phaseId && !phase) return { ok: false, error: `Unknown phase_id "${options.phaseId}"` };
  const shaOrRef = phase?.checkpoint_sha || ledger.checkpoints?.[phaseId] || ledger.active_cursor?.checkpoint_sha || phaseId;
  const rb = rollbackToGitCheckpoint(options.cwd, shaOrRef, { confirm: Boolean(options.confirm) });
  if (!rb.ok) return { ok: false, phase_id: phaseId, error: rb.error };
  if (phase) {
    phase.status = 'pending';
    for (const f of (ledger.features || []).filter((x) => x.phase_id === phaseId)) { f.status = 'pending'; f.passes = false; }
    ledger.active_cursor = { ...(ledger.active_cursor || {}), current_phase_id: phaseId, checkpoint_sha: rb.restoredSha };
  }
  return { ok: true, phase_id: phaseId, restored_sha: rb.restoredSha, summary: rb.summary };
}

function auditLedger(ledger, cwd, options = {}) {
  const violations = [...validateLedger(ledger, cwd).errors];
  const [phases, features] = [Array.isArray(ledger.phases) ? ledger.phases : [], Array.isArray(ledger.features) ? ledger.features : []];
  if (phases.length === 0) violations.push('Ledger has 0 phases');
  if (features.length === 0) violations.push('Ledger has 0 features/requirements');
  for (const f of features) if (!f.passes || f.status !== 'verified') violations.push(`Unverified requirement: ${f.req_id} (${f.status})`);
  violations.push(...inspectRequirementFiles(features, cwd, options));
  return { passed: violations.length === 0, total_phases: phases.length, verified_phases: phases.filter((p) => p.status === 'verified').length, total_requirements: features.length, verified_requirements: features.filter((f) => f.passes && f.status === 'verified').length, violations };
}

const LEDGER_HELP = 'Usage: boomopen ledger <init|from-plan|validate|status|next|verify|rollback|audit|help> [options]\n  init | from-plan <plan.md> | validate | status | next | verify --phase <id> | rollback [--phase <id>] --yes | audit';
const LEDGER_ARG_SPEC = {
  defaults: { file: null, name: null, docs: '', phase: null, passedTests: undefined, strictShards: false, runVerify: false, reconcile: false, strictLocks: false, yes: false, json: false, help: false },
  booleanFlags: { '-h': 'help', '--help': 'help', '--json': 'json', '--strict-shards': 'strictShards', '--run-verify': 'runVerify', '--reconcile': 'reconcile', '--strict-locks': 'strictLocks', '--yes': 'yes', '-y': 'yes' },
  valueFlags: { '--file': 'file', '--name': 'name', '--docs': 'docs', '--phase': 'phase', '--passed-tests': 'passedTests' },
};

function runLedgerCli(argv = [], options = {}) {
  const { flags, positional, error } = parseSubcommandArgs(argv, LEDGER_ARG_SPEC);
  if (error) { if (!options.silent) console.error(`❌ boomopen ledger: ${error}\n\n${LEDGER_HELP}`); return EXIT_USAGE; }
  const sub = (positional[0] || 'status').toLowerCase();
  if (flags.help || sub === 'help') { if (!options.silent) console.log(LEDGER_HELP); return EXIT_OK; }
  const [cwd, paths] = [options.cwd || process.cwd(), resolvePaths(options.cwd || process.cwd(), flags.file)];
  try {
    if (sub === 'from-plan') {
      const { runPlanCli } = require('./plan.js');
      return runPlanCli(['compile', ...positional.slice(1), ...(flags.file ? ['--file', flags.file] : []), ...(flags.name ? ['--name', flags.name] : []), ...(flags.json ? ['--json'] : [])], options);
    }
    if (sub === 'init') {
      const { ledger } = initLedger({ cwd, file: flags.file, name: flags.name, docs: splitCommaOption(flags.docs) });
      if (!options.silent) console.log(`✅ Initialized project ledger at ${paths.ledgerPath} (${ledger.spec_documents.length} spec docs)`);
      return EXIT_OK;
    }
    const ledger = loadLedgerFile(paths.ledgerPath, cwd);
    if (sub === 'validate') {
      const res = validateLedger(ledger, cwd, { strictShards: flags.strictShards });
      if (!options.silent) { if (res.valid) console.log(`✅ Ledger valid (${ledger.phases.length} phases, ${ledger.features.length} REQs, 0 spec drift)`); else for (const err of res.errors) console.error(`❌ ${err}`); }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    if (sub === 'status') {
      writeProgressFile(paths.progressPath, ledger);
      const summary = { project_name: ledger.project_name, active_cursor: ledger.active_cursor, phases_verified: ledger.phases.filter((p) => p.status === 'verified').length, phases_total: ledger.phases.length, requirements_verified: ledger.features.filter((f) => f.passes && f.status === 'verified').length, requirements_total: ledger.features.length };
      if (!options.silent) console.log(flags.json ? JSON.stringify(summary, null, 2) : renderProgressMarkdown(ledger));
      return EXIT_OK;
    }
    if (sub === 'next') {
      const nextPhase = findNextReadyPhase(ledger);
      if (nextPhase && !nextPhase.checkpoint_sha) {
        const cp = createGitCheckpoint(cwd, nextPhase.phase_id);
        if (cp.available) { nextPhase.checkpoint_sha = cp.headSha; ledger.active_cursor = { ...(ledger.active_cursor || {}), checkpoint_sha: cp.headSha }; ledger.checkpoints = { ...(ledger.checkpoints || {}), [nextPhase.phase_id]: cp.headSha }; saveLedgerFile(paths.ledgerPath, ledger); }
      }
      if (!options.silent) console.log(JSON.stringify(getNextPhaseSlice(ledger, paths), null, 2));
      return EXIT_OK;
    }
    if (sub === 'verify' || sub === 'verify-phase') {
      const phaseId = flags.phase || positional[1];
      if (!phaseId) { if (!options.silent) console.error('❌ boomopen ledger verify requires --phase <phaseId>'); return EXIT_USAGE; }
      const passedTests = flags.passedTests === undefined ? undefined : (/^\d+$/.test(String(flags.passedTests)) ? Number.parseInt(String(flags.passedTests), 10) : Number.NaN);
      const res = verifyPhaseGate(ledger, phaseId, { cwd, homeDir: options.homeDir, passedTests, runVerify: flags.runVerify, reconcile: flags.reconcile, strictLocks: flags.strictLocks });
      if (!res.passed) { if (!options.silent) for (const v of res.violations) console.error(`❌ ${v}`); return EXIT_FAIL; }
      saveLedgerFile(paths.ledgerPath, ledger); writeProgressFile(paths.progressPath, ledger);
      if (!options.silent) console.log(`✅ Phase "${phaseId}" verified! Next phase: ${res.next_phase_id || 'ALL COMPLETE'}`);
      return EXIT_OK;
    }
    if (sub === 'rollback') {
      if (!flags.yes) { if (!options.silent) console.error('❌ boomopen ledger rollback requires --yes.'); return EXIT_USAGE; }
      const res = rollbackLedgerPhase(ledger, { cwd, phaseId: flags.phase || positional[1] || null, confirm: true });
      if (!res.ok) { if (!options.silent) console.error(`❌ ${res.error}`); return EXIT_FAIL; }
      saveLedgerFile(paths.ledgerPath, ledger); writeProgressFile(paths.progressPath, ledger);
      if (!options.silent) console.log(flags.json ? JSON.stringify(res, null, 2) : `⏪ ${res.summary} (phase=${res.phase_id})`);
      return EXIT_OK;
    }
    if (sub === 'audit') {
      const res = auditLedger(ledger, cwd, { homeDir: options.homeDir });
      if (!options.silent) { console.log(flags.json ? JSON.stringify(res, null, 2) : `📊 RTM Audit: ${res.verified_requirements}/${res.total_requirements} REQs verified (${res.violations.length} violations)`); if (!flags.json) for (const v of res.violations) console.error(`❌ ${v}`); }
      return res.passed ? EXIT_OK : EXIT_FAIL;
    }
    if (!options.silent) console.error(`❌ Unknown ledger subcommand "${sub}"\n\n${LEDGER_HELP}`);
    return EXIT_USAGE;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen ledger: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_FAIL;
  }
}

module.exports = {
  hashFileSha256, resolvePaths, normalizeLedgerShape, initLedger, loadLedgerFile, saveLedgerFile,
  validateLedger, detectPhaseCycle, getNextPhaseSlice, verifyPhaseGate, rollbackLedgerPhase, auditLedger,
  renderProgressMarkdown, renderRoadmapMarkdown: renderProgressMarkdown, writeProgressFile, runLedgerCli,
};
