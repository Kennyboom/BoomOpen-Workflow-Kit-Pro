'use strict';

/**
 * Multi-Engine Conductor & Parallel Council Engine (`boomopen conduct`).
 *
 * Supports two orchestration paradigms across Claude Code, Codex, Antigravity (Gemini), Cursor, and Copilot:
 *   1. Pipeline Dispatch (`boomopen conduct dispatch`): Specialist role routing, Author != Critic
 *      cross-family enforcement, 3-Tier automatic quota failover, and SHA-256 READ_ONLY_FILES guard.
 *   2. Parallel Council Consensus (`boomopen conduct council`): Spawns N engines in parallel on the
 *      same task (research, brainstorm, plan, design, review, debug) and synthesizes their outputs into a
 *      unified Consensus, Unique Blind-Spot Insights, and Final Actionable Conclusion report.
 */

const fs = require('node:fs');
const path = require('node:path');

const {
  SUPPORTED_ENGINES, ENGINE_FAMILY, ROLE_AFFINITY_ORDER, normalizeEngineName,
  probeEngines, resolveCrossFamilyEngine, buildEngineInvocation,
  captureReadOnlySnapshot, verifyAndRestoreReadOnlySnapshot, executeEngineSubprocess,
} = require('./conductor-engines.js');
const { loadSettings } = require('./settings.js');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;

const COUNCIL_LENSES = {
  claude: 'Deep Architecture, System Invariants, Edge Cases & Security Critique',
  codex: 'Pragmatic Code Execution, Algorithms, Type Safety & Verification',
  antigravity: 'Broad Ecosystem Synthesis, SOTA Patterns, Scalability & UX',
  cursor: 'Codebase Ergonomics, Module Boundaries & Refactoring',
  copilot: 'Developer Workflow, API Contracts & Integration Patterns',
};

const COUNCIL_TASK_DIRECTIVES = {
  research: '\n[COUNCIL RESEARCHER REQUIREMENTS]: Explicitly output: (a) Evidence-backed findings with concrete URL or file:line citations and [HIGH]/[MEDIUM]/[LOW] confidence tags, (b) Weighted comparison matrix across candidate approaches, and (c) Contradictions, failure modes, and a concise HANDOFF_BRIEF.',
  brainstorm: '\n[COUNCIL BRAINSTORMER REQUIREMENTS]: Explicitly output: (a) 3 distinct strategic/architectural options grounded in codebase/constraints, (b) Weighted trade-off matrix (Value, Effort, Risk, Maintainability), and (c) Pre-Mortem / Devil\'s Advocate critique plus recommended winner & HANDOFF_BRIEF.',
  plan: '\n[COUNCIL PLANNER REQUIREMENTS]: Explicitly output: (a) Proposed SHARED_CONTRACT TypeScript/API signatures, (b) Disjoint role#shard Wave breakdown (<= 3-4 OWNED_FILES per shard), and (c) Pre-Mortem failure modes & rollback safeguards from your lens.',
  design: '\n[COUNCIL DESIGNER REQUIREMENTS]: Explicitly output: (a) OKLCH + Tailwind v4 @theme inline token proposals, (b) 5-State component matrix (Default, Loading, Empty, Error, Focus/Disabled), and (c) WCAG 2.2 AA & layout trade-offs.',
  review: '\n[COUNCIL REVIEWER REQUIREMENTS]: Explicitly output: (a) P0-P3 severity matrix with exact file:line citations, (b) OWASP security & performance hot-path audit with concrete exploit/failure proof, and (c) Zero speculative nitpicks plus minimal-diff patch recommendations.',
  debug: '\n[COUNCIL DEBUGGER REQUIREMENTS]: Explicitly output: (a) 5-Whys causal chain from symptom to systemic root cause, (b) Exact file:line root-cause locus, and (c) Deterministic reproduction test command plus minimal blast-radius fix.',
};

function parseEngineList(raw, installedEngines = []) {
  if (Array.isArray(raw)) return raw.map(normalizeEngineName).filter(Boolean);
  if (raw === 'all_installed') return installedEngines.length > 0 ? installedEngines : ['claude', 'codex', 'antigravity'];
  return String(raw || 'claude,codex,antigravity').split(',').map((s) => normalizeEngineName(s)).filter(Boolean);
}

function resolveEngineForRole(role = 'coder', settings = {}, probes = {}, options = {}) {
  const normRole = ROLE_AFFINITY_ORDER[role] ? role : 'coder';
  const installed = SUPPORTED_ENGINES.filter((e) => probes[e]?.available);
  const pool = installed.length > 0 ? installed : SUPPORTED_ENGINES;
  const configured = options.engine || settings?.engines?.[normRole] || 'current';
  const councilEngines = parseEngineList(options.engines || settings?.engines?.councilMembers, installed);

  if (configured === 'council') {
    return { mode: 'council', primaryEngine: councilEngines[0] || 'claude', fallbackEngines: councilEngines.slice(1), councilEngines, configuredPolicy: 'council' };
  }
  const affinity = ROLE_AFFINITY_ORDER[normRole] || SUPPORTED_ENGINES;
  let primary = null;
  if (configured === 'cross_family') primary = resolveCrossFamilyEngine(options.authorEngine || 'claude', pool, normRole);
  else if (configured === 'auto' || configured === 'current') primary = affinity.find((e) => pool.includes(e)) || affinity[0];
  else primary = normalizeEngineName(configured) || 'claude';

  const fallbacks = [...affinity.filter((e) => e !== primary && pool.includes(e)), ...affinity.filter((e) => e !== primary && !pool.includes(e))];
  return { mode: 'single', primaryEngine: primary, fallbackEngines: [...new Set(fallbacks)], councilEngines, configuredPolicy: configured };
}

function renderHandoffEnvelope({ role, engine, prompt, sharedContract, ownedFiles = [], readOnlyFiles = [], readOnly = false }) {
  return [
    `# 🎼 BOOMOPEN CROSS-ENGINE HANDOFF PACKET (${engine.toUpperCase()} — ${role.toUpperCase()})`,
    '',
    '## 1. MISSION & ACCEPTANCE CRITERIA',
    prompt || 'Execute assigned role task.',
    '',
    '## 2. SHARED_CONTRACT',
    sharedContract || '.boomopen/contracts/SHARED_CONTRACT.md',
    '',
    '## 3. OWNED_FILES (Exclusive Write Lock)',
    readOnly || ownedFiles.length === 0 ? '- NONE (Read-Only Execution Mode)' : ownedFiles.map((f) => `- \`${f}\``).join('\n'),
    '',
    '## 4. READ_ONLY_FILES (Strictly Do Not Modify)',
    readOnlyFiles.length === 0 ? '- All files outside OWNED_FILES' : readOnlyFiles.map((f) => `- \`${f}\``).join('\n'),
    '',
    '## 5. VERIFICATION & DELIVERABLE',
    '- Output structured, evidence-backed findings or verified code changes with 0 stubs/TODOs.',
    '',
  ].join('\n');
}

async function dispatchToEngine(options = {}) {
  const cwd = options.cwd || process.cwd();
  const role = options.role || 'coder';
  const settings = options.settings || loadSettings({ cwd, homeDir: options.homeDir, silent: true });
  const probes = options.probes || probeEngines({ mockProbes: options.mockProbes });
  const resolved = resolveEngineForRole(role, settings, probes, { engine: options.engine, authorEngine: options.authorEngine, engines: options.engines });

  const runId = options.runId || `run-${Date.now()}`;
  const runsDir = path.join(cwd, '.boomopen', 'conductor', 'runs');
  const queueDir = path.join(cwd, '.boomopen', 'conductor', 'queue');
  fs.mkdirSync(runsDir, { recursive: true });

  const candidates = [resolved.primaryEngine, ...(options.allowFailover !== false ? resolved.fallbackEngines : [])];
  const snapshot = captureReadOnlySnapshot(cwd, options.readOnlyFiles || []);
  const failoverHistory = [];
  let finalRes = null;
  let engineUsed = resolved.primaryEngine;
  let promptPath = '';

  for (const candidate of candidates) {
    engineUsed = candidate;
    promptPath = path.join(runsDir, `${runId}-${candidate}-prompt.md`);
    const promptText = renderHandoffEnvelope({
      role, engine: candidate, prompt: options.prompt, sharedContract: options.sharedContract,
      ownedFiles: options.ownedFiles, readOnlyFiles: options.readOnlyFiles, readOnly: Boolean(options.readOnly),
    });
    fs.writeFileSync(promptPath, promptText, 'utf8');

    const probe = probes[candidate] || { available: true, bin: candidate };
    const invocation = buildEngineInvocation(candidate, promptPath, {
      readOnly: Boolean(options.readOnly), available: probe.available, bin: probe.bin, queueFile: path.join(queueDir, `${runId}-${candidate}.md`),
    });
    finalRes = await executeEngineSubprocess(candidate, invocation, { cwd, promptText, mockRunner: options.mockRunner, timeoutMs: options.timeoutMs });
    if (finalRes.ok || (!finalRes.isQuotaError && finalRes.exitCode !== 127)) break;
    failoverHistory.push({ engine: candidate, exitCode: finalRes.exitCode, isQuotaError: finalRes.isQuotaError });
  }

  const guard = verifyAndRestoreReadOnlySnapshot(cwd, snapshot);
  const resultPath = path.join(runsDir, `${runId}-result.json`);
  const outputPath = options.output ? path.resolve(cwd, options.output) : null;
  if (outputPath && finalRes) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, finalRes.stdout || finalRes.stderr || '', 'utf8');
  }
  const payload = {
    ok: Boolean(finalRes && finalRes.ok), runId, role, configuredPolicy: resolved.configuredPolicy,
    engineUsed, family: ENGINE_FAMILY[engineUsed] || 'unknown', queued: Boolean(finalRes && finalRes.queued),
    failoverHistory, restoredReadOnlyFiles: guard.violations, promptPath, resultPath, outputPath,
    exitCode: finalRes ? finalRes.exitCode : 1, stdout: finalRes ? finalRes.stdout : '',
    stderr: finalRes ? finalRes.stderr : '', durationMs: finalRes ? finalRes.durationMs : 0,
  };
  fs.writeFileSync(resultPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

function extractKeyPoints(text = '') {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => /^[-*•]\s+|^\d+\.\s+/.test(l)).map((l) => l.replace(/^[-*•]\s+|^\d+\.\s+/, '').trim()).filter((l) => l.length >= 6);
  return bullets.length > 0 ? bullets.slice(0, 8) : lines.filter((l) => !l.startsWith('#') && l.length >= 10).slice(0, 5);
}

function normalizeFingerprint(point) {
  return point.toLowerCase().replace(/[`*_~[\]().,:;!?/\\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function synthesizeCouncilPoints(engineOutputs) {
  const pointMap = new Map();
  const pointsByEngine = {};
  for (const item of engineOutputs) {
    const pts = extractKeyPoints(item.stdout);
    pointsByEngine[item.engine] = pts;
    for (const pt of pts) {
      const fp = normalizeFingerprint(pt);
      if (!fp) continue;
      const existing = pointMap.get(fp) || { text: pt, engines: new Set() };
      existing.engines.add(item.engine);
      pointMap.set(fp, existing);
    }
  }
  const consensus = [];
  const uniqueByEngine = {};
  for (const item of engineOutputs) uniqueByEngine[item.engine] = [];

  for (const entry of pointMap.values()) {
    const owners = [...entry.engines];
    if (owners.length >= 2) consensus.push({ text: entry.text, engines: owners });
    else if (owners.length === 1) uniqueByEngine[owners[0]].push(entry.text);
  }
  return { consensus, uniqueByEngine, pointsByEngine };
}

function renderCouncilSynthesisMarkdown({ runId, task, prompt, results, synthesis }) {
  const lines = [
    `# 🏛️ MULTI-ENGINE COUNCIL SYNTHESIS REPORT (${task.toUpperCase()})`,
    '',
    `- **Run ID**: \`${runId}\` | **Task Type**: \`${task}\``,
    `- **Participating Engines**: ${results.map((r) => `\`${r.engine}\` (${r.family})`).join(', ')}`,
    `- **Mission Prompt**: ${prompt}`,
    '',
    '| Engine | Model Family | Perspective Lens | Status | Duration | Output File |',
    '|--------|--------------|------------------|--------|----------|-------------|',
  ];
  for (const r of results) {
    const status = r.ok ? (r.queued ? '📥 Queued' : '✅ Completed') : `❌ Exit ${r.exitCode}`;
    lines.push(`| \`${r.engine}\` | \`${r.family}\` | ${r.lens} | ${status} | ${r.durationMs}ms | \`${path.basename(r.outputFile)}\` |`);
  }
  lines.push(
    '',
    '## 1. 🤝 Multi-Engine Consensus (High-Confidence Convergence)',
    '### 🟢 Unanimous / Multi-Engine Consensus (Điểm đồng thuận giữa các nền tảng)'
  );
  if (synthesis.consensus.length > 0) {
    for (const c of synthesis.consensus) lines.push(`- **[${c.engines.join(' + ')}]**: ${c.text}`);
  } else {
    lines.push('- Each engine explored orthogonal facets of the problem; review the complementary insights below.');
  }
  lines.push(
    '',
    '## 2. 💡 Unique Blind-Spot Insights & Complementary Perspectives',
    '### 🟡 Unique Blind-Spot Insights by Engine (Góc nhìn độc bản từng nền tảng phát hiện)'
  );
  for (const r of results) {
    const uniq = synthesis.uniqueByEngine[r.engine] || [];
    lines.push(`- **\`${r.engine.toUpperCase()}\` (${r.family} · ${r.lens})**: ${uniq.length > 0 ? uniq.join(' | ') : 'Aligned with shared consensus.'}`);
  }
  for (const r of results) {
    lines.push('', `#### Perspective — \`${r.engine.toUpperCase()}\` (${r.family})`, r.stdout.trim() || '*(No output returned)*');
  }
  lines.push(
    '',
    '## 3. 🔴 Contradictions & Evidence Arbitration (Divergent Trade-Offs)',
    synthesis.consensus.length > 0
      ? '- Cross-family outputs converged on core invariants without conflicting architectural blockers; divergent items above are additive blind-spot checks.'
      : '- Engines emphasized distinct trade-offs across their perspective lenses; arbitrate using concrete codebase benchmarks and contract tests.',
    '',
    '## 4. 🏆 Final Actionable Conclusion & Verification Checklist',
    '### 🏆 Final Synthesized Verdict & Actionable Conclusion (Kết luận Tổng hợp)',
    `- [ ] **Consensus Anchor**: Adopt all ${synthesis.consensus.length} cross-verified recommendations shared across multiple model families.`,
    `- [ ] **Blind-Spot Integration**: Incorporate the unique edge-case and architectural checks surfaced individually by ${results.map((r) => `\`${r.engine}\``).join(', ')}.`,
    ''
  );
  return lines.join('\n');
}

async function runMultiEngineCouncil(options = {}) {
  const cwd = options.cwd || process.cwd();
  const task = options.task || options.role || 'research';
  const prompt = options.prompt || `Execute multi-engine ${task} analysis.`;
  const settings = options.settings || loadSettings({ cwd, homeDir: options.homeDir, silent: true });
  const probes = options.probes || probeEngines({ mockProbes: options.mockProbes });
  const installed = SUPPORTED_ENGINES.filter((e) => probes[e]?.available);
  const engines = parseEngineList(options.engines || settings?.engines?.councilMembers, installed);
  const runId = options.runId || `council-${Date.now()}`;
  const runsDir = path.join(cwd, '.boomopen', 'conductor', 'runs');
  const queueDir = path.join(cwd, '.boomopen', 'conductor', 'queue');
  fs.mkdirSync(runsDir, { recursive: true });

  const snapshot = captureReadOnlySnapshot(cwd, options.readOnlyFiles || []);
  const results = await Promise.all(
    engines.map(async (engine) => {
      const lens = COUNCIL_LENSES[engine] || 'General Analysis';
      const promptPath = path.join(runsDir, `${runId}-${engine}-prompt.md`);
      const outputFile = path.join(runsDir, `${runId}-${engine}.md`);
      const taskDirective = COUNCIL_TASK_DIRECTIVES[String(task).toLowerCase()] || '';
      const promptText = renderHandoffEnvelope({
        role: `${task}-council (${lens})`, engine,
        prompt: `${prompt}\n\n[COUNCIL PERSPECTIVE LENS]: Focus specifically on ${lens}. Provide bulleted findings.${taskDirective}`,
        sharedContract: options.sharedContract, ownedFiles: [], readOnlyFiles: options.readOnlyFiles || [], readOnly: true,
      });
      fs.writeFileSync(promptPath, promptText, 'utf8');
      const probe = probes[engine] || { available: true, bin: engine };
      const invocation = buildEngineInvocation(engine, promptPath, {
        readOnly: true, available: probe.available, bin: probe.bin, queueFile: path.join(queueDir, `${runId}-${engine}.md`),
      });
      const res = await executeEngineSubprocess(engine, invocation, { cwd, promptText, mockRunner: options.mockRunner, timeoutMs: options.timeoutMs });
      fs.writeFileSync(outputFile, res.stdout || res.stderr || '', 'utf8');
      return { ...res, engine, family: ENGINE_FAMILY[engine] || 'unknown', lens, promptPath, outputFile };
    })
  );

  const guard = verifyAndRestoreReadOnlySnapshot(cwd, snapshot);
  const synthesis = synthesizeCouncilPoints(results);
  const markdown = renderCouncilSynthesisMarkdown({ runId, task, prompt, results, synthesis });
  const defaultSynthesisPath = path.join(runsDir, `${runId}-COUNCIL-SYNTHESIS.md`);
  const aliasSynthesisPath = path.join(runsDir, `${runId}-council.md`);
  fs.writeFileSync(defaultSynthesisPath, markdown, 'utf8');
  fs.writeFileSync(aliasSynthesisPath, markdown, 'utf8');
  const synthesisPath = options.output ? path.resolve(cwd, options.output) : defaultSynthesisPath;
  if (options.output) {
    fs.mkdirSync(path.dirname(synthesisPath), { recursive: true });
    fs.writeFileSync(synthesisPath, markdown, 'utf8');
  }

  const jsonPath = path.join(runsDir, `${runId}-council.json`);
  const summary = {
    ok: results.some((r) => r.ok), runId, task, engines, restoredReadOnlyFiles: guard.violations,
    consensus: synthesis.consensus, uniqueByEngine: synthesis.uniqueByEngine, synthesisPath, aliasSynthesisPath, jsonPath,
    results: results.map((r) => ({ engine: r.engine, family: r.family, ok: r.ok, queued: r.queued, exitCode: r.exitCode, outputFile: r.outputFile, durationMs: r.durationMs })),
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  return summary;
}

const CONDUCTOR_HELP = `Usage: boomopen conduct <probe|dispatch|council|status|help> [options]
  probe [--json]                                   Detect installed CLI engines (claude, codex, agy/gemini, cursor, copilot)
  dispatch --role <role> --prompt <text> [opts]    Dispatch a role task with 5-Field Handoff & 3-Tier Failover
  council --task <type> --prompt <text> [opts]     Run N engines in parallel and synthesize Consensus & Blind-Spots
  status [--json]                                  List recent cross-engine runs and queued handoffs`;

function parseFlags(argv) {
  const flags = { role: 'coder', task: 'research', engine: null, authorEngine: null, engines: null, prompt: '', owned: [], readOnly: [], output: null, json: false, help: false };
  const positional = [];
  let taskExplicit = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') flags.help = true;
    else if (a === '--json') flags.json = true;
    else if (a === '--role') { const v = argv[++i]; flags.role = v; if (!taskExplicit) flags.task = v; }
    else if (a === '--task') { flags.task = argv[++i]; taskExplicit = true; }
    else if (a === '--engine') flags.engine = argv[++i];
    else if (a === '--author-engine') flags.authorEngine = argv[++i];
    else if (a === '--engines') flags.engines = argv[++i];
    else if (a === '--prompt') flags.prompt = argv[++i] || '';
    else if (a === '--output') flags.output = argv[++i];
    else if (a === '--owned' || a === '--owned-files') flags.owned = (argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--read-only' || a === '--read-only-files') flags.readOnly = (argv[++i] || '').split(',').map((s) => s.trim()).filter(Boolean);
    else positional.push(a);
  }
  return { sub: (positional[0] || 'probe').toLowerCase(), flags };
}

async function runConductorCli(argv = [], options = {}) {
  const { sub, flags } = parseFlags(argv);
  if (flags.help || sub === 'help') {
    if (!options.silent) console.log(CONDUCTOR_HELP);
    return EXIT_OK;
  }
  const cwd = options.cwd || process.cwd();
  if (sub === 'probe') {
    const probes = probeEngines({ mockProbes: options.mockProbes });
    if (!options.silent) console.log(flags.json ? JSON.stringify(probes, null, 2) : Object.entries(probes).map(([k, v]) => `${v.available ? '✅' : '⬚'} ${k.padEnd(12)} (${v.family}) bin=${v.bin || 'none'}`).join('\n'));
    return EXIT_OK;
  }
  if (sub === 'dispatch') {
    if (!flags.prompt) {
      if (!options.silent) console.error('❌ boomopen conduct dispatch requires --prompt "<task>".');
      return EXIT_USAGE;
    }
    const res = await dispatchToEngine({ cwd, homeDir: options.homeDir, role: flags.role, engine: flags.engine, authorEngine: flags.authorEngine, prompt: flags.prompt, output: flags.output, ownedFiles: flags.owned, readOnlyFiles: flags.readOnly, mockProbes: options.mockProbes, mockRunner: options.mockRunner });
    if (!options.silent) console.log(flags.json ? JSON.stringify(res, null, 2) : `✅ Dispatched [${res.role}] to ${res.engineUsed} (${res.family}) -> ${res.resultPath}`);
    return res.ok ? EXIT_OK : EXIT_FAIL;
  }
  if (sub === 'council') {
    if (!flags.prompt) {
      if (!options.silent) console.error('❌ boomopen conduct council requires --prompt "<task>".');
      return EXIT_USAGE;
    }
    const res = await runMultiEngineCouncil({ cwd, homeDir: options.homeDir, task: flags.task, engines: flags.engines, prompt: flags.prompt, output: flags.output, readOnlyFiles: flags.readOnly, mockProbes: options.mockProbes, mockRunner: options.mockRunner });
    if (!options.silent) console.log(flags.json ? JSON.stringify(res, null, 2) : `🏛️ Council synthesis (${res.engines.join(', ')}) written to ${res.synthesisPath}`);
    return res.ok ? EXIT_OK : EXIT_FAIL;
  }
  if (sub === 'status') {
    const runsDir = path.join(cwd, '.boomopen', 'conductor', 'runs');
    const files = fs.existsSync(runsDir) ? fs.readdirSync(runsDir).filter((f) => f.endsWith('.json') || f.endsWith('-SYNTHESIS.md')) : [];
    if (!options.silent) console.log(flags.json ? JSON.stringify({ runs: files }, null, 2) : `📊 Conductor artifacts (${files.length}): ${files.join(', ') || 'none'}`);
    return EXIT_OK;
  }
  if (!options.silent) console.error(`❌ Unknown conduct subcommand "${sub}"\n\n${CONDUCTOR_HELP}`);
  return EXIT_USAGE;
}

module.exports = {
  COUNCIL_LENSES,
  COUNCIL_TASK_DIRECTIVES,
  resolveEngineForRole,
  renderHandoffEnvelope,
  dispatchToEngine,
  extractKeyPoints,
  synthesizeCouncilPoints,
  runMultiEngineCouncil,
  runConductorCli,
};
