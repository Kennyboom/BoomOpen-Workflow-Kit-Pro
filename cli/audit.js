'use strict';

/**
 * Multi-Round Human-Gated Post-Completion Audit Engine (`boomopen audit`).
 * Manages `.boomopen/audit-ledger.json` and `.boomopen/AUDIT-PROGRESS.md` across progressive rounds,
 * fingerprint deduplication, `wont_fix` suppression, `P3` nitpick freeze, oscillation halts, and git rollback.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { runAuditStaticScan } = require('./audit-scanners.js');
const { inspectSourceFile, resolveActiveStandards } = require('./checker.js');
const { CODE_EXTENSIONS } = require('./checker-rules.js');
const { EXIT_OK, EXIT_FAIL, EXIT_USAGE, parseSubcommandArgs, splitCommaOption, runVerifyCommands } = require('./cli-args.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { createGitCheckpoint, rollbackToGitCheckpoint } = require('./git-checkpoints.js');
const { readCleanText } = require('./markdown-fences.js');

const DEFAULT_AUDIT_REL = path.join('.boomopen', 'audit-ledger.json');
const BLOCKING_SEVERITIES = new Set(['P0', 'P1', 'P2', 'SPEC_GAP']);
const VALID_SEVERITIES = new Set(['P0', 'P1', 'P2', 'P3', 'SPEC_GAP']);
const ACTIVE_OPEN = new Set(['open', 'reopened']);
const MAX_SHARD_OWNED = 4;
const ROUND_FOCUS = Object.freeze({ 1: 'SPEC_AND_VERTICAL_FLOWS', 2: 'SECURITY_TX_AND_PERF', 3: 'UX_STATES_AND_OPS_READINESS' });

const normRel = (p) => String(p || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
const normFileOnly = (loc) => normRel(loc).replace(/:L?\d+(?:-L?\d+)?$/i, '');
const toList = (v) => (Array.isArray(v) ? v : splitCommaOption(String(v || '')));
const normalizeFileArray = (arr) => [...new Set(toList(arr).map(normFileOnly).filter((f) => f && f !== 'global'))];
const normalizeSeverity = (s) => { const u = String(s || 'P2').trim().toUpperCase().replace(/[\s-]+/g, '_'); return VALID_SEVERITIES.has(u) ? u : 'P2'; };
const parseRoundOpt = (opt, fallback) => (opt !== undefined && opt !== null ? Number.parseInt(String(opt), 10) : fallback);
const chunkList = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

function resolveAuditPaths(cwd, customFile) {
  const root = path.resolve(cwd || process.cwd());
  const ledgerPath = customFile ? path.resolve(root, customFile) : path.join(root, DEFAULT_AUDIT_REL);
  return { cwd: root, ledgerPath, progressPath: path.join(path.dirname(ledgerPath), 'AUDIT-PROGRESS.md') };
}

function computeFindingFingerprint(item) {
  const dim = String(item?.dimension || item?.category || 'general').trim().toLowerCase();
  const loc = normFileOnly(item?.primary_location || item?.file || item?.owned_files?.[0] || item?.files?.[0] || 'global').toLowerCase() || 'global';
  const titleKey = String(item?.title_key || item?.title || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return crypto.createHash('sha256').update(`${dim}:${loc}:${titleKey}`).digest('hex');
}

function renderAuditProgressMarkdown(ledger) {
  const st = getAuditStatus(ledger);
  return [
    `# 🔎 Multi-Round Post-Completion Audit — ${ledger.project_name || 'Project'}`, '',
    `- **State**: \`${ledger.state}\` | **Mode**: \`${ledger.mode}\` | **Round**: \`${ledger.current_round} / ${ledger.max_rounds}\` | **Auto-Fix**: \`${Boolean(ledger.auto_fix)}\``,
    `- **Open Blockers (\`P0..P2/SPEC_GAP\`)**: \`${st.open_blockers}\` | **Pending Re-Audit**: \`${st.counts.fixed_pending_reaudit}\` | **Verified Closed**: \`${st.counts.verified_closed}\``,
    `- **Suppressed (\`wont_fix\`/\`deferred\`)**: \`${st.counts.wont_fix + st.counts.deferred}\` | **Passing Tests Ratchet**: \`${st.current_passed_tests}\``, '',
    '## 📉 Round-Over-Round Burn-Down Scorecard',
    '| Round | Focus | Added | Reopened | Verified Closed | Suppressed | Frozen P3 | Open Blockers | State After |',
    '|-------|-------|-------|----------|-----------------|------------|-----------|---------------|-------------|',
    ...(ledger.rounds || []).map((r) => `| \`R${r.round}\` | \`${r.focus}\` | ${r.added_ids.length} | ${r.reopened_ids.length} | ${r.verified_closed_ids.length} | ${r.suppressed_count} | ${r.nitpick_frozen_dropped} | ${r.open_blockers} | \`${r.state_after}\` |`),
    '', '## 📋 Audit Findings Ledger', '| ID | Sev | Dimension | Location | Title | Status | Reopens |', '|----|-----|-----------|----------|-------|--------|---------|',
    ...(ledger.findings || []).map((f) => `| \`${f.id}\` | \`${f.severity}\` | \`${f.dimension}\` | \`${f.primary_location}\` | ${f.title} | \`${f.status}\` | ${f.reopen_count || 0} |`), '',
  ].join('\n');
}

function saveAuditLedger(pathOrCwd, ledger) {
  const isDir = fs.existsSync(pathOrCwd) && fs.statSync(pathOrCwd).isDirectory();
  const ledgerPath = isDir ? path.join(pathOrCwd, DEFAULT_AUDIT_REL) : path.resolve(pathOrCwd);
  const progressPath = path.join(path.dirname(ledgerPath), 'AUDIT-PROGRESS.md');
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  ledger.updated_at = new Date().toISOString();
  fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  fs.writeFileSync(progressPath, renderAuditProgressMarkdown(ledger), 'utf8');
  return { ledgerPath, progressPath };
}

function loadAuditLedger(pathOrOpts, cwd) {
  const base = pathOrOpts && typeof pathOrOpts === 'object' ? null : path.resolve(cwd || process.cwd(), String(pathOrOpts || DEFAULT_AUDIT_REL));
  const ledgerPath = base ? (fs.existsSync(base) && fs.statSync(base).isDirectory() ? path.join(base, DEFAULT_AUDIT_REL) : base) : resolveAuditPaths(pathOrOpts.cwd || cwd, pathOrOpts.file).ledgerPath;
  if (!fs.existsSync(ledgerPath)) throw new Error(`Audit ledger not found at ${ledgerPath}. Run "boomopen audit init" first.`);
  return JSON.parse(readCleanText(ledgerPath));
}

function initAuditLedger(options = {}) {
  const paths = resolveAuditPaths(options.cwd, options.file);
  const maxRounds = options.maxRounds === undefined ? 4 : Number.parseInt(String(options.maxRounds), 10);
  if (!Number.isInteger(maxRounds) || maxRounds < 1) throw new Error('--max-rounds must be a positive integer.');
  const scan = runAuditStaticScan(paths.cwd, { docs: options.docs, homeDir: options.homeDir, useGitIgnore: options.useGitIgnore });
  let [baselineTests, priorTests] = [Number.isInteger(options.passedTests) ? options.passedTests : 0, []];
  if (scan.spec_sources.ledger_present) {
    try {
      const proj = JSON.parse(readCleanText(path.join(paths.cwd, '.boomopen', 'project-ledger.json')));
      if (!options.passedTests && proj.active_cursor?.baseline_passed_tests) baselineTests = proj.active_cursor.baseline_passed_tests;
      for (const f of proj.features || []) if (f.passes && Array.isArray(f.test_files)) priorTests.push(...f.test_files);
    } catch { /* optional project-ledger enrichment */ }
  }
  const cp = createGitCheckpoint(paths.cwd, 'audit-round-1');
  const [preSha, now] = [cp.available ? cp.headSha : null, new Date().toISOString()];
  const ledger = {
    schema_version: KIT_VERSION, project_name: options.name || scan.spec_sources.project_name || path.basename(paths.cwd),
    created_at: now, updated_at: now, mode: scan.spec_sources.mode, auto_fix: Boolean(options.autoFix),
    state: 'SCANNING_ROUND', current_round: 1, max_rounds: maxRounds, approval_policy: 'P0_P1_P2',
    pre_round_sha: preSha, round_checkpoints: preSha ? { '1': preSha } : {},
    current_passed_tests: baselineTests, locked_regression_tests: normalizeFileArray(priorTests), modified_files_by_round: {},
    baseline_metrics: { scanned_files: scan.scanned_files, strict_violations: scan.strict_check.violations.length, static_hazards: scan.cross_module_hazards.hazards.length, current_passed_tests: baselineTests },
    spec_sources: scan.spec_sources, system_graph: { files: scan.files, vertical_flows: scan.vertical_flows, static_hazards: scan.cross_module_hazards, strict_violations: scan.strict_check.violations },
    fix_packets: [], rounds: [], findings: [],
  };
  saveAuditLedger(paths.ledgerPath, ledger);
  return { ledger, paths };
}

function findOneHopNeighbors(targetFiles, ledger) {
  const seed = new Set(targetFiles.map(normFileOnly).filter(Boolean));
  const neighbors = new Set(seed);
  for (const flow of ledger.system_graph?.vertical_flows || []) {
    if ((flow.files || []).some((f) => seed.has(normFileOnly(f)))) for (const f of flow.files || []) neighbors.add(normFileOnly(f));
  }
  return [...neighbors].sort();
}

function getRoundSlice(ledger, options = {}) {
  const round = parseRoundOpt(options.round, ledger.current_round || 1);
  const focus = ROUND_FOCUS[round] || 'SCOPED_DELTA_SIGNOFF';
  const reauditItems = (ledger.findings || []).filter((f) => f.status === 'fixed_pending_reaudit');
  const reauditSeed = reauditItems.flatMap((f) => (f.owned_files?.length ? f.owned_files : [normFileOnly(f.primary_location)]));
  const reauditFiles = findOneHopNeighbors(reauditSeed, ledger);
  const suppressed = (ledger.findings || []).filter((f) => f.status === 'wont_fix' || f.status === 'deferred').map((f) => f.fingerprint);
  const [flows, hazards, shards] = [ledger.system_graph?.vertical_flows || [], ledger.system_graph?.static_hazards || {}, []];

  if (round === 1) {
    if (ledger.mode === 'spec_grounded') chunkList(ledger.spec_sources?.documents || [], 3).forEach((docs, i) => shards.push({ shard_id: `R1-RTM-${i + 1}`, role: `reviewer#rtm-${i + 1}`, type: 'spec_rtm', docs: docs.map((d) => d.path) }));
    flows.forEach((fl) => shards.push({ shard_id: `R1-${fl.flow_id}`, role: `reviewer#${fl.flow_id.toLowerCase()}`, type: 'vertical_flow', flow: fl }));
  } else if (round === 2) {
    if (reauditItems.length) shards.push({ shard_id: 'R2-REAUDIT', role: 'reviewer#reaudit', type: 'reaudit_fixes', finding_ids: reauditItems.map((f) => f.id), files: reauditFiles });
    const routeFiles = [...new Set(flows.flatMap((fl) => fl.api_routes || []))];
    chunkList(routeFiles.length ? routeFiles : (ledger.system_graph?.files || []).slice(0, 8), 4).forEach((files, i) => shards.push({ shard_id: `R2-SEC-${i + 1}`, role: `security-engineer#sec-${i + 1}`, type: 'endpoint_security_leakage', files }));
    shards.push({ shard_id: 'R2-TX-PERF', role: 'performance-engineer#tx-perf', type: 'tx_concurrency_perf', files: [...new Set(flows.flatMap((fl) => fl.services_and_models || []))], n_plus_one_candidates: hazards.n_plus_one_loops || [] });
  } else if (round === 3) {
    if (reauditItems.length) shards.push({ shard_id: 'R3-REAUDIT', role: 'reviewer#reaudit', type: 'reaudit_fixes', finding_ids: reauditItems.map((f) => f.id), files: reauditFiles });
    shards.push({ shard_id: 'R3-UX-A11Y', role: 'frontend-engineer#ux-a11y', type: 'ux_5states_a11y_i18n', ux_screens: hazards.ux_screen_coverage || [] });
    shards.push({ shard_id: 'R3-OPS', role: 'devops-engineer#ops', type: 'ops_env_build_e2e', missing_env_keys: hazards.missing_env_keys || [] });
  } else {
    const deltaFiles = findOneHopNeighbors(ledger.modified_files_by_round?.[String(round - 1)] || reauditSeed, ledger);
    chunkList(deltaFiles, 4).forEach((files, i) => shards.push({ shard_id: `R${round}-DELTA-${i + 1}`, role: `reviewer#delta-${i + 1}`, type: 'scoped_delta_signoff', files, finding_ids: reauditItems.map((f) => f.id) }));
  }
  return {
    round, max_rounds: ledger.max_rounds, focus, mode: ledger.mode, read_only_lock: true, nitpick_freeze: round >= 3,
    reaudit_items: reauditItems, reaudit_files: reauditFiles, suppressed_fingerprints: suppressed,
    pre_findings: round === 1 ? [...(hazards.hazards || []), ...(ledger.system_graph?.strict_violations || []).map((v) => ({ category: 'strict_check', severity: 'P1', message: v }))] : [], shards,
  };
}

function applyReauditOutcome(target, outcome, round, handledPending, reopenedIds, verifiedClosedIds) {
  handledPending.add(target.id);
  if (outcome === 'reopened' || outcome === 'failed') {
    target.status = 'reopened'; target.reopen_count = (target.reopen_count || 0) + 1; target.last_seen_round = round;
    if (!reopenedIds.includes(target.id)) reopenedIds.push(target.id);
  } else if (outcome === 'verified_closed' || outcome === 'closed' || outcome === 'passed') {
    target.status = 'verified_closed'; target.closed_in_round = round;
    if (!verifiedClosedIds.includes(target.id)) verifiedClosedIds.push(target.id);
  }
}

function recordRoundFindings(ledger, payload, options = {}) {
  const round = parseRoundOpt(options.round, Number(payload?.round) || ledger.current_round || 1);
  ledger.current_round = round;
  const incoming = Array.isArray(payload) ? payload : (Array.isArray(payload?.findings) ? payload.findings : []);
  const checks = payload?.reopened_checks || payload?.reaudit_results || payload?.verifications || [];
  const [byId, byFp] = [new Map((ledger.findings || []).map((f) => [f.id, f])), new Map((ledger.findings || []).map((f) => [f.fingerprint, f]))];
  const touchedPrior = new Set(Object.entries(ledger.modified_files_by_round || {}).filter(([r]) => Number(r) < round).flatMap(([, list]) => (list || []).map(normFileOnly)));
  const [handledPending, addedIds, reopenedIds, verifiedClosedIds] = [new Set(), [], [], []];
  let [suppressedCount, nitpickFrozenDropped] = [0, 0];

  for (const chk of Array.isArray(checks) ? checks : []) {
    const target = (chk.id && byId.get(chk.id)) || (chk.fingerprint && byFp.get(chk.fingerprint)) || byFp.get(computeFindingFingerprint(chk));
    if (!target || target.status === 'wont_fix' || target.status === 'deferred') continue;
    const out = chk.reopened === true ? 'reopened' : (chk.verified === true ? 'verified_closed' : String(chk.status || chk.outcome || '').toLowerCase());
    applyReauditOutcome(target, out, round, handledPending, reopenedIds, verifiedClosedIds);
  }
  for (const raw of incoming) {
    const fp = raw.fingerprint || computeFindingFingerprint(raw);
    const existing = (raw.id && byId.get(raw.id)) || byFp.get(fp);
    if (existing) {
      if (existing.status === 'wont_fix' || existing.status === 'deferred') { suppressedCount++; continue; }
      const rawStatus = String(raw.status || '').toLowerCase();
      if (rawStatus === 'verified_closed') applyReauditOutcome(existing, 'verified_closed', round, handledPending, reopenedIds, verifiedClosedIds);
      else if ((existing.status === 'fixed_pending_reaudit' || existing.status === 'verified_closed' || rawStatus === 'reopened') && !handledPending.has(existing.id)) {
        applyReauditOutcome(existing, 'reopened', round, handledPending, reopenedIds, verifiedClosedIds);
      } else existing.last_seen_round = round;
      continue;
    }
    const [sev, loc] = [normalizeSeverity(raw.severity), normRel(raw.primary_location || raw.file || raw.owned_files?.[0] || 'global')];
    const owned = normalizeFileArray(raw.owned_files || raw.files || [loc]);
    if (round >= 3 && sev === 'P3' && !owned.some((f) => touchedPrior.has(f))) { nitpickFrozenDropped++; continue; }
    const id = `AUD-${String(ledger.findings.length + 1).padStart(3, '0')}`;
    const finding = {
      id, fingerprint: fp, severity: sev, dimension: String(raw.dimension || raw.category || 'general').trim().toLowerCase(),
      title: String(raw.title || 'Untitled finding').trim(), primary_location: loc, owned_files: owned,
      test_files: normalizeFileArray(raw.test_files || []), verification_cmd: String(raw.verification_cmd || '').trim(),
      proof: String(raw.proof || raw.message || '').trim(), remediation: String(raw.remediation || '').trim(),
      req_id: raw.req_id || null, status: 'open', first_seen_round: round, last_seen_round: round, reopen_count: 0,
    };
    ledger.findings.push(finding); byId.set(id, finding); byFp.set(fp, finding); addedIds.push(id);
  }
  for (const f of ledger.findings) {
    if (f.status === 'fixed_pending_reaudit' && (f.fixed_in_round || 0) < round && !handledPending.has(f.id)) applyReauditOutcome(f, 'verified_closed', round, handledPending, reopenedIds, verifiedClosedIds);
  }
  const openBlockers = ledger.findings.filter((f) => ACTIVE_OPEN.has(f.status) && BLOCKING_SEVERITIES.has(f.severity)).length;
  const pendingReaudit = ledger.findings.filter((f) => f.status === 'fixed_pending_reaudit').length;
  const hasOscillation = ledger.findings.some((f) => (f.reopen_count || 0) >= 2 && ACTIVE_OPEN.has(f.status));
  ledger.state = hasOscillation || (round >= (ledger.max_rounds || 4) && openBlockers > 0) ? 'HALTED_OSCILLATION' : (openBlockers === 0 && pendingReaudit === 0 ? 'CONVERGED' : 'AWAITING_USER_APPROVAL');

  const summary = { round, focus: ROUND_FOCUS[round] || 'SCOPED_DELTA_SIGNOFF', recorded_at: new Date().toISOString(), added_ids: addedIds, reopened_ids: reopenedIds, verified_closed_ids: verifiedClosedIds, suppressed_count: suppressedCount, nitpick_frozen_dropped: nitpickFrozenDropped, open_blockers: openBlockers, state_after: ledger.state, pre_round_sha: ledger.round_checkpoints?.[String(round)] || ledger.pre_round_sha || null };
  ledger.rounds = [...(ledger.rounds || []).filter((r) => r.round !== round), summary].sort((a, b) => a.round - b.round);
  return summary;
}

function buildFixShardPackets(approvedFindings, ledger, round) {
  const buckets = [];
  for (const f of approvedFindings) {
    const files = (f.owned_files?.length ? f.owned_files : [normFileOnly(f.primary_location)]).filter((x) => x && x !== 'global').slice(0, MAX_SHARD_OWNED);
    const overlaps = buckets.map((b, i) => (b.wave === 1 && files.some((fl) => b.owned.has(fl)) ? i : -1)).filter((i) => i !== -1);
    const mergeIdx = overlaps.length === 1 && new Set([...buckets[overlaps[0]].owned, ...files]).size <= MAX_SHARD_OWNED ? overlaps[0] : (overlaps.length === 0 ? buckets.findIndex((b) => b.wave === 1 && new Set([...b.owned, ...files]).size <= MAX_SHARD_OWNED) : -1);
    if (mergeIdx !== -1) {
      buckets[mergeIdx].findings.push(f);
      for (const fl of files) buckets[mergeIdx].owned.add(fl);
      for (const tf of f.test_files || []) buckets[mergeIdx].tests.add(tf);
    } else {
      const wave = overlaps.length > 0 ? Math.max(...buckets.filter((b) => files.some((fl) => b.owned.has(fl))).map((b) => b.wave)) + 1 : 1;
      buckets.push({ wave, findings: [f], owned: new Set(files), tests: new Set(f.test_files || []) });
    }
  }
  const baseLocks = ['.boomopen/audit-ledger.json', ...(ledger.spec_sources?.ledger_present ? ['.boomopen/project-ledger.json'] : []), ...(ledger.locked_regression_tests || [])];
  const lockedSet = new Set(baseLocks);
  return buckets.map((b, idx) => {
    const siblingOwned = buckets.flatMap((other, j) => (j === idx || other.wave !== b.wave ? [] : [...other.owned]));
    return {
      shard_id: `FIX-R${round}-S${idx + 1}`, round, wave: b.wave, finding_ids: b.findings.map((f) => f.id),
      owned_files: [...b.owned], test_files: [...b.tests].filter((tf) => !lockedSet.has(tf)),
      read_only_files: [...new Set([...baseLocks, ...siblingOwned.filter((fl) => !b.owned.has(fl) || lockedSet.has(fl))])],
      verification_cmds: [...new Set(b.findings.map((f) => f.verification_cmd).filter(Boolean))],
    };
  });
}

function applyUserDecisions(ledger, options = {}) {
  const round = parseRoundOpt(options.round, ledger.current_round || 1);
  const [excludeSet, deferSet] = [new Set(toList(options.exclude).map((s) => s.toUpperCase())), new Set(toList(options.defer).map((s) => s.toUpperCase()))];
  const selectTokens = new Set((options.select ? toList(options.select) : ['P0', 'P1', 'P2', 'SPEC_GAP']).map((s) => s.toUpperCase()));
  if (selectTokens.has('P0') && selectTokens.has('P1') && selectTokens.has('P2') && !options.strictSelect) selectTokens.add('SPEC_GAP');

  const [approvedIds, wontFixIds, deferredIds] = [[], [], []];
  for (const f of ledger.findings || []) {
    const idUp = f.id.toUpperCase();
    if (excludeSet.has(idUp)) { f.status = 'wont_fix'; wontFixIds.push(f.id); }
    else if (deferSet.has(idUp)) { f.status = 'deferred'; deferredIds.push(f.id); }
    else if (ACTIVE_OPEN.has(f.status) && (selectTokens.has('ALL') || selectTokens.has(idUp) || selectTokens.has(f.severity.toUpperCase()))) { f.status = 'approved'; approvedIds.push(f.id); }
  }
  const approvedFindings = (ledger.findings || []).filter((f) => f.status === 'approved');
  const pendingReaudit = (ledger.findings || []).filter((f) => f.status === 'fixed_pending_reaudit').length;
  if (approvedFindings.length === 0 && pendingReaudit === 0) {
    ledger.state = 'CONVERGED'; ledger.fix_packets = [];
    return { state: ledger.state, short_circuited: true, approved_ids: [], wont_fix_ids: wontFixIds, deferred_ids: deferredIds, fix_packets: [], pre_round_sha: ledger.pre_round_sha || null };
  }
  if (options.cwd) {
    const cp = createGitCheckpoint(options.cwd, `audit-round-${round}`);
    if (cp.available) { ledger.pre_round_sha = cp.headSha; ledger.round_checkpoints = { ...(ledger.round_checkpoints || {}), [String(round)]: cp.headSha }; }
  }
  ledger.fix_packets = buildFixShardPackets(approvedFindings, ledger, round);
  ledger.state = 'FIXING';
  return { state: ledger.state, short_circuited: false, approved_ids: approvedIds, wont_fix_ids: wontFixIds, deferred_ids: deferredIds, fix_packets: ledger.fix_packets, pre_round_sha: ledger.round_checkpoints?.[String(round)] || ledger.pre_round_sha || null };
}

function verifyRoundFixes(ledger, options = {}) {
  const [cwd, round] = [path.resolve(options.cwd || process.cwd()), parseRoundOpt(options.round, ledger.current_round || 1)];
  const [approved, lockedTests] = [(ledger.findings || []).filter((f) => f.status === 'approved'), normalizeFileArray(options.lockedTests || [])];
  const touched = [...new Set([...approved.flatMap((f) => [...(f.owned_files || []), ...(f.test_files || [])]), ...lockedTests])];
  const [activeStd, violations] = [resolveActiveStandards(cwd, { cwd, homeDir: options.homeDir }), []];

  for (const rel of touched) {
    const abs = path.resolve(cwd, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) violations.push(`Missing touched file on disk: "${rel}"`);
    else if (CODE_EXTENSIONS.has(path.extname(rel).toLowerCase())) violations.push(...inspectSourceFile(abs, cwd, undefined, activeStd, { projectRoot: cwd, strictPhase: true }).violations);
  }
  const floor = ledger.current_passed_tests ?? ledger.baseline_metrics?.current_passed_tests ?? 0;
  if (options.passedTests !== undefined && (!Number.isInteger(options.passedTests) || options.passedTests < floor)) {
    violations.push(`Monotonic test ratchet failed: --passed-tests ${options.passedTests} < current_passed_tests ${floor}`);
  }
  if (options.runVerify) {
    const cmds = [...new Set([...approved.map((f) => f.verification_cmd), ...(options.verifyCmd ? [options.verifyCmd] : [])].filter(Boolean))];
    if (cmds.length > 0) violations.push(...runVerifyCommands(cmds, cwd, options.timeoutMs));
  }
  if (violations.length > 0) return { passed: false, violations, state: ledger.state, current_round: ledger.current_round };

  if (options.passedTests !== undefined) {
    ledger.current_passed_tests = options.passedTests;
    if (ledger.baseline_metrics) ledger.baseline_metrics.current_passed_tests = options.passedTests;
  }
  ledger.locked_regression_tests = normalizeFileArray([...(ledger.locked_regression_tests || []), ...lockedTests]);
  ledger.modified_files_by_round = ledger.modified_files_by_round || {};
  ledger.modified_files_by_round[String(round)] = normalizeFileArray([...(ledger.modified_files_by_round[String(round)] || []), ...approved.flatMap((f) => f.owned_files || [])]);

  const openBlockers = (ledger.findings || []).filter((f) => ACTIVE_OPEN.has(f.status) && BLOCKING_SEVERITIES.has(f.severity)).length;
  if (options.finalize && round >= 4 && openBlockers === 0) {
    for (const f of approved) { f.status = 'verified_closed'; f.closed_in_round = round; }
    ledger.state = 'CONVERGED';
  } else {
    for (const f of approved) { f.status = 'fixed_pending_reaudit'; f.fixed_in_round = round; }
    const nextRound = round + 1;
    ledger.current_round = nextRound; ledger.state = 'SCANNING_ROUND';
    if (options.cwd) {
      const cp = createGitCheckpoint(cwd, `audit-round-${nextRound}`);
      if (cp.available) { ledger.pre_round_sha = cp.headSha; ledger.round_checkpoints = { ...(ledger.round_checkpoints || {}), [String(nextRound)]: cp.headSha }; }
    }
  }
  ledger.fix_packets = [];
  return { passed: true, violations: [], state: ledger.state, current_round: ledger.current_round, locked_regression_tests: ledger.locked_regression_tests, pre_round_sha: ledger.pre_round_sha || null };
}

function rollbackAuditRound(ledger, options = {}) {
  const round = parseRoundOpt(options.round, ledger.current_round || 1);
  const shaOrRef = ledger.round_checkpoints?.[String(round)] || ledger.rounds?.find((r) => r.round === round)?.pre_round_sha || ledger.pre_round_sha || `audit-round-${round}`;
  const rb = rollbackToGitCheckpoint(options.cwd, shaOrRef, { confirm: Boolean(options.confirm) });
  if (!rb.ok) return { ok: false, round, error: rb.error };
  for (const f of ledger.findings || []) {
    if (f.status === 'approved' || (f.status === 'fixed_pending_reaudit' && (f.fixed_in_round || 0) >= round)) { f.status = 'open'; delete f.fixed_in_round; }
  }
  ledger.fix_packets = []; ledger.current_round = round; ledger.pre_round_sha = rb.restoredSha;
  ledger.state = (ledger.findings || []).some((f) => ACTIVE_OPEN.has(f.status)) ? 'AWAITING_USER_APPROVAL' : 'SCANNING_ROUND';
  return { ok: true, round, restored_sha: rb.restoredSha, summary: rb.summary, state: ledger.state };
}

function getAuditStatus(ledger) {
  const counts = { open: 0, reopened: 0, approved: 0, fixed_pending_reaudit: 0, verified_closed: 0, wont_fix: 0, deferred: 0 };
  const openBySev = { P0: 0, P1: 0, P2: 0, P3: 0, SPEC_GAP: 0 };
  for (const f of ledger.findings || []) {
    if (counts[f.status] !== undefined) counts[f.status]++;
    if (ACTIVE_OPEN.has(f.status) && openBySev[f.severity] !== undefined) openBySev[f.severity]++;
  }
  return { project_name: ledger.project_name, mode: ledger.mode, state: ledger.state, current_round: ledger.current_round, max_rounds: ledger.max_rounds, auto_fix: Boolean(ledger.auto_fix), pre_round_sha: ledger.pre_round_sha || null, current_passed_tests: ledger.current_passed_tests || 0, locked_regression_tests: ledger.locked_regression_tests || [], open_blockers: openBySev.P0 + openBySev.P1 + openBySev.P2 + openBySev.SPEC_GAP, counts, open_by_severity: openBySev, rounds: ledger.rounds || [] };
}

const AUDIT_HELP = 'Usage: boomopen audit <init|slice|record|approve|verify-fix|rollback|status|help> [options]\n  init | slice | record --input <file> | approve | verify-fix | rollback [--round <k>] --yes | status';
const AUDIT_ARG_SPEC = {
  defaults: { docs: '', name: null, maxRounds: undefined, autoFix: false, round: undefined, input: null, select: '', exclude: '', defer: '', passedTests: undefined, lockedTests: '', verifyCmd: '', runVerify: false, finalize: false, yes: false, file: null, json: false, help: false },
  booleanFlags: { '-h': 'help', '--help': 'help', '--json': 'json', '--auto-fix': 'autoFix', '--run-verify': 'runVerify', '--finalize': 'finalize', '--yes': 'yes', '-y': 'yes' },
  valueFlags: { '--docs': 'docs', '--name': 'name', '--max-rounds': 'maxRounds', '--round': 'round', '--input': 'input', '--select': 'select', '--exclude': 'exclude', '--defer': 'defer', '--passed-tests': 'passedTests', '--locked-tests': 'lockedTests', '--verify-cmd': 'verifyCmd', '--file': 'file' },
};

function runAuditCli(argv = [], options = {}) {
  const { flags, positional, error } = parseSubcommandArgs(argv, AUDIT_ARG_SPEC);
  if (error) { if (!options.silent) console.error(`❌ boomopen audit: ${error}\n\n${AUDIT_HELP}`); return EXIT_USAGE; }
  const sub = (positional[0] || 'status').toLowerCase();
  if (flags.help || sub === 'help') { if (!options.silent) console.log(AUDIT_HELP); return EXIT_OK; }
  const [cwd, paths] = [path.resolve(options.cwd || process.cwd()), resolveAuditPaths(options.cwd, flags.file)];
  const printOut = (obj, text) => { if (!options.silent) console.log(flags.json ? JSON.stringify(obj, null, 2) : text); };
  try {
    if (sub === 'init') {
      const { ledger } = initAuditLedger({ cwd, file: flags.file, name: flags.name, docs: splitCommaOption(flags.docs), maxRounds: flags.maxRounds, autoFix: flags.autoFix, homeDir: options.homeDir });
      printOut(ledger, `✅ Initialized audit ledger (${ledger.mode}, ${ledger.baseline_metrics.scanned_files} files)`);
      return EXIT_OK;
    }
    const ledger = loadAuditLedger(paths.ledgerPath, cwd);
    if (sub === 'slice') { if (!options.silent) console.log(JSON.stringify(getRoundSlice(ledger, { round: flags.round }), null, 2)); return EXIT_OK; }
    if (sub === 'record') {
      const inputPath = flags.input || positional[1];
      if (!inputPath) { if (!options.silent) console.error('❌ boomopen audit record requires --input <findings.json>'); return EXIT_USAGE; }
      const res = recordRoundFindings(ledger, JSON.parse(readCleanText(path.resolve(cwd, inputPath))), { round: flags.round });
      saveAuditLedger(paths.ledgerPath, ledger); printOut(res, `📊 Recorded Round ${res.round}: state=${res.state_after} (${res.open_blockers} open blockers)`); return EXIT_OK;
    }
    if (sub === 'approve') {
      const res = applyUserDecisions(ledger, { cwd, round: flags.round, select: flags.select, exclude: flags.exclude, defer: flags.defer });
      saveAuditLedger(paths.ledgerPath, ledger); printOut(res, `✅ Audit state: ${res.state} (${res.approved_ids.length} approved, ${res.fix_packets.length} shards)`); return EXIT_OK;
    }
    if (sub === 'verify-fix' || sub === 'verify') {
      const passedTests = flags.passedTests === undefined ? undefined : (/^\d+$/.test(String(flags.passedTests)) ? Number.parseInt(String(flags.passedTests), 10) : Number.NaN);
      const res = verifyRoundFixes(ledger, { cwd, homeDir: options.homeDir, round: flags.round, passedTests, lockedTests: flags.lockedTests, verifyCmd: flags.verifyCmd, runVerify: flags.runVerify, finalize: flags.finalize });
      if (!res.passed) { if (!options.silent) for (const v of res.violations) console.error(`❌ ${v}`); return EXIT_FAIL; }
      saveAuditLedger(paths.ledgerPath, ledger); printOut(res, `✅ Verified fixes! Next state: ${res.state} (Round ${res.current_round})`); return EXIT_OK;
    }
    if (sub === 'rollback') {
      if (!flags.yes) { if (!options.silent) console.error('❌ boomopen audit rollback requires --yes.'); return EXIT_USAGE; }
      const res = rollbackAuditRound(ledger, { cwd, round: flags.round, confirm: true });
      if (!res.ok) { if (!options.silent) console.error(`❌ ${res.error}`); return EXIT_FAIL; }
      saveAuditLedger(paths.ledgerPath, ledger); printOut(res, `⏪ ${res.summary} (Round ${res.round}, state=${res.state})`); return EXIT_OK;
    }
    if (sub === 'status') { saveAuditLedger(paths.ledgerPath, ledger); printOut(getAuditStatus(ledger), renderAuditProgressMarkdown(ledger)); return EXIT_OK; }
    if (!options.silent) console.error(`❌ Unknown audit subcommand "${sub}"\n\n${AUDIT_HELP}`);
    return EXIT_USAGE;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen audit: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_FAIL;
  }
}

if (require.main === module) process.exitCode = runAuditCli(process.argv.slice(2));
module.exports = { computeFindingFingerprint, initAuditLedger, loadAuditLedger, saveAuditLedger, getRoundSlice, recordRoundFindings, applyUserDecisions, verifyRoundFixes, rollbackAuditRound, getAuditStatus, runAuditCli };
