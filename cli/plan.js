'use strict';

/**
 * Deterministic Plan Parser, 5-Gate Validator & Plan-to-Ledger Compiler (`boomopen plan`).
 * Enforces PLAN-G1..G5 and compiles `PLAN-{task}.md` into `.boomopen/project-ledger.json`.
 */

const fs = require('node:fs');
const path = require('node:path');

const { countLines } = require('./checker-text.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { hashFileSha256, resolvePaths, saveLedgerFile, writeProgressFile, detectPhaseCycle } = require('./ledger.js');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const DEFAULT_MAX_FILES_PER_SHARD = 4;
const VAGUE_VERIFY_RE = /^(?:manual(?:\s+check|\s+test|\s+verification)?|verify\s+manually|check\s+manually|none|n\/a|tbd|later|-|—)$/i;
const NONE_TOKEN_RE = /^(?:none(?:\s*\(.*\))?|n\/a|—|-)$/i;

function normalizeRelPath(p) {
  return String(p || '').trim().replace(/^['"`]+|['"`]+$/g, '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function parsePathList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const cleaned = raw.trim();
  if (!cleaned || NONE_TOKEN_RE.test(cleaned)) return [];
  const backticked = [...cleaned.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  const candidates = backticked.length > 0 ? backticked : cleaned.split(/[,\s]+/);
  return candidates.map((item) => normalizeRelPath(item.replace(/^\([^)]*\)$/, ''))).filter((item) => item && !NONE_TOKEN_RE.test(item) && !item.startsWith('('));
}

function normalizePhaseId(raw) {
  const clean = String(raw || '').trim().replace(/^`|`$/g, '');
  const explicit = /\b((?:PHASE|WAVE)[-_]\d+|\bphase[-_]\d+)\b/i.exec(clean);
  if (explicit) return explicit[1].toUpperCase().replace(/_/g, '-');
  const numMatch = /\b(Phase|Wave)\s+(\d+)\b/i.exec(clean);
  if (numMatch) return `${numMatch[1].toUpperCase()}-${numMatch[2]}`;
  return clean.toUpperCase().replace(/\s+/g, '-');
}

function parseDepList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.replace(/`/g, '').split(/[,|]+/).map((s) => s.trim()).filter((s) => s && !NONE_TOKEN_RE.test(s)).map(normalizePhaseId);
}

function extractAcIds(text) {
  return [...new Set([...String(text || '').matchAll(/\b(AC-?\d+)\b/gi)].map((m) => m[1].toUpperCase()))];
}

function extractAgentId(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const backtick = /`([^`]+)`/.exec(text);
  const candidate = (backtick ? backtick[1] : text.replace(/\([^)]*\)/g, '')).trim();
  return NONE_TOKEN_RE.test(candidate) ? '' : candidate.split(/\s+/)[0];
}

function parsePhaseHeader(line, lineNumber) {
  const m = /^(#{2,3})\s+(?:[^\w\n]*\s*)?(Phase|Wave)\s+([A-Za-z0-9_-]+)\s*(?:[:—-]\s*([^\n(]*))?(.*)$/i.exec(line);
  if (!m) return null;
  const fullRest = `${m[4] || ''} ${m[5] || ''}`.trim();
  const explicitId = /phase_id\s*:\s*`?([A-Za-z0-9_-]+)`?/i.exec(line);
  const phaseId = explicitId ? explicitId[1].toUpperCase() : `${m[2].toUpperCase()}-${m[3].toUpperCase()}`;
  const parMatch = /Parallel(?:izable)?\s*:\s*(Yes|No|True|False)/i.exec(line);
  const parallelizable = parMatch ? /^(?:yes|true)$/i.test(parMatch[1]) : /\bParallel\s+Wave\b/i.test(line) ? true : null;
  const depMatch = /Depends\s+On\s*:\s*([^)|\]\n]+)/i.exec(line);
  const deps = depMatch ? parseDepList(depMatch[1]) : [];
  const cleanTitle = fullRest.replace(/\(`?[^)]*`?\)/g, '').trim() || `${m[2]} ${m[3]}`;
  return {
    phase_id: phaseId, title: `${m[2]} ${m[3]} — ${cleanTitle}`.replace(/\s+—\s+$/, ''),
    parallelizable, dependsOn: deps, depends_on: deps, startLine: lineNumber, endLine: lineNumber,
  };
}

function parseTaskHeader(line, lineNumber, currentPhaseId, taskSeq) {
  const hMatch = /^(#{3,4})\s+(?:\[[ xX]\]\s*)?(?:\*\*)?Task\s+([A-Za-z0-9._-]+)(?:\*\*)?(?:\s*\(([^)]+)\)|\s*\[([^\]]+)\])?\s*(?:[:—-]\s*(.*))?$/i.exec(line);
  const bMatch = !hMatch
    ? /^\s*[-*]\s+(?:\[[ xX]\]\s+)?\*\*Task\s+([A-Za-z0-9._-]+)(?:\s*\(([^)]+)\)|\s*\[([^\]]+)\])?\*\*\s*(?:[:—-]\s*(.*))?$/i.exec(line)
    : null;
  if (!hMatch && !bMatch) return null;
  const taskNum = hMatch ? hMatch[2] : bMatch[1];
  const bracketTag = (hMatch ? hMatch[3] || hMatch[4] : bMatch[2] || bMatch[3]) || '';
  const rawTitle = (hMatch ? hMatch[5] : bMatch[4]) || `Task ${taskNum}`;
  const reqMatch = /\b(REQ-\d+)\b/i.exec(bracketTag) || /\b(REQ-\d+)\b/i.exec(rawTitle);
  const reqId = reqMatch ? reqMatch[1].toUpperCase() : `Task-${taskNum || taskSeq}`;
  return {
    reqId, taskId: `Task-${taskNum}`,
    title: rawTitle.replace(/\(`?REQ-\d+`?\)/gi, '').trim() || `Task ${taskNum}`,
    phaseId: currentPhaseId, agent: '', acceptance: extractAcIds(`${bracketTag} ${rawTitle}`),
    ownedFiles: [], readOnlyFiles: [], testFiles: [], verifyCmd: '', dependsOn: [],
    startLine: lineNumber, endLine: lineNumber,
  };
}

function parseTaskFieldLine(task, line) {
  const fieldMatch = /^\s*[-*]\s+\*\*([^*]+)\*\*\s*:\s*(.+)$/.exec(line);
  if (!fieldMatch) return;
  const key = fieldMatch[1].trim().toLowerCase();
  const val = fieldMatch[2].trim();
  if (key === 'agent' || key === 'role' || key === 'role_shard') task.agent = extractAgentId(val);
  else if (key.startsWith('owned_files') || key === 'files_owned' || key === 'owned files') task.ownedFiles.push(...parsePathList(val));
  else if (key.startsWith('read_only_files') || key === 'read only files' || key === 'read-only files') task.readOnlyFiles.push(...parsePathList(val));
  else if (key === 'test files' || key === 'test_files' || key === 'test_file' || key === 'tests') task.testFiles.push(...parsePathList(val));
  else if (key === 'verify' || key === 'verification' || key === 'verification_cmd') task.verifyCmd = val.replace(/^`+|`+$/g, '').trim();
  else if (key === 'acceptance' || key === 'traces to' || key === 'acceptance_criteria') {
    const ids = [...extractAcIds(val), ...[...val.matchAll(/\b(REQ-\d+)\b/gi)].map((m) => m[1].toUpperCase())];
    for (const id of ids) if (!task.acceptance.includes(id)) task.acceptance.push(id);
  } else if (key === 'depends on' || key === 'depends_on') task.dependsOn.push(...parseDepList(val));
}

function parsePlanMarkdown(markdownText, planFilePath = 'PLAN.md') {
  const lines = String(markdownText || '').split(/\r?\n/);
  let title = path.basename(planFilePath, path.extname(planFilePath));
  const sharedLines = [];
  const acSet = new Set();
  const traceAcSet = new Set();
  const phases = [];
  const tasks = [];
  let section = '';
  let currentPhase = null;
  let currentTask = null;
  let defaultParallelizable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h1 && i < 10) {
      title = h1[1].replace(/^Implementation\s+Plan\s*[:—-]\s*/i, '').trim() || title;
      continue;
    }
    const phaseHdr = parsePhaseHeader(line, lineNum);
    if (phaseHdr) {
      if (currentTask) { currentTask.endLine = lineNum - 1; currentTask = null; }
      if (currentPhase) currentPhase.endLine = lineNum - 1;
      currentPhase = phaseHdr;
      phases.push(currentPhase);
      section = 'phase';
      continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      if (currentTask) { currentTask.endLine = lineNum - 1; currentTask = null; }
      const h2Text = h2[1];
      if (/SHARED_CONTRACT|Shared\s+Interface\s+Contract/i.test(h2Text)) section = 'contract';
      else if (/Acceptance\s+Criteria/i.test(h2Text)) section = 'ac';
      else if (/Traceability/i.test(h2Text)) section = 'traceability';
      else if (/Tasks/i.test(h2Text)) {
        section = 'tasks';
        const par = /Parallel(?:izable)?\s*:\s*(Yes|No|True|False)/i.exec(h2Text);
        if (par) defaultParallelizable = /^(?:yes|true)$/i.test(par[1]);
      } else section = 'other';
      continue;
    }
    const taskHdr = parseTaskHeader(line, lineNum, currentPhase ? currentPhase.phase_id : 'PHASE-1', tasks.length + 1);
    if (taskHdr) {
      if (currentTask) currentTask.endLine = lineNum - 1;
      if (!currentPhase) {
        currentPhase = {
          phase_id: 'PHASE-1', title: 'Phase 1 — Implementation',
          parallelizable: defaultParallelizable, dependsOn: [], depends_on: [], startLine: lineNum, endLine: lines.length,
        };
        phases.push(currentPhase);
      }
      currentTask = taskHdr;
      tasks.push(currentTask);
      continue;
    }
    if (section === 'contract') sharedLines.push(line);
    if (section === 'ac') for (const id of extractAcIds(line)) acSet.add(id);
    else if (section === 'traceability') for (const id of extractAcIds(line)) traceAcSet.add(id);
    if (currentPhase && !currentTask) {
      const pDep = /^\s*[-*]\s+\*\*Depends\s+On\*\*\s*:\s*(.+)$/i.exec(line);
      if (pDep) { currentPhase.dependsOn = parseDepList(pDep[1]); currentPhase.depends_on = currentPhase.dependsOn; }
    }
    if (currentTask) parseTaskFieldLine(currentTask, line);
  }
  if (currentTask) currentTask.endLine = lines.length;
  if (currentPhase) currentPhase.endLine = lines.length;

  for (const t of tasks) {
    t.ownedFiles = [...new Set(t.ownedFiles)];
    t.readOnlyFiles = [...new Set(t.readOnlyFiles)];
    t.testFiles = t.testFiles.length > 0 ? [...new Set(t.testFiles)] : t.ownedFiles.filter((f) => /(?:\.(?:test|spec)\.[^.]+$|^tests?\/)/i.test(f));
  }
  const sharedContract = sharedLines.join('\n').trim();
  return {
    title, planFilePath, sharedContract, hasContractCodeBlock: /```/.test(sharedContract),
    acceptanceCriteria: [...acSet], traceabilityCriteria: [...traceAcSet], phases, waves: phases, tasks,
  };
}

function pathsCollide(pathA, pathB) {
  const a = normalizeRelPath(pathA);
  const b = normalizeRelPath(pathB);
  return Boolean(a && b) && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`));
}

function isParallelPhase(phase, phaseTasks) {
  if (phase.parallelizable === true) return true;
  if (phase.parallelizable === false || phaseTasks.length < 2) return false;
  const agents = new Set(phaseTasks.map((t) => t.agent).filter(Boolean));
  return agents.size >= 2 || phaseTasks.some((t) => t.agent.includes('#'));
}

function validatePlan(parsedOrMarkdown, options = {}) {
  const plan = typeof parsedOrMarkdown === 'string' ? parsePlanMarkdown(parsedOrMarkdown) : parsedOrMarkdown;
  const maxFiles = options.maxFilesPerShard || DEFAULT_MAX_FILES_PER_SHARD;
  const gates = { 'PLAN-G1': [], 'PLAN-G2': [], 'PLAN-G3': [], 'PLAN-G4': [], 'PLAN-G5': [] };

  if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    gates['PLAN-G1'].push('[PLAN-G1] Plan must define at least 1 task (### Task X.Y or - [ ] **Task X.Y**).');
  } else {
    const distinctAgents = new Set(plan.tasks.map((t) => t.agent).filter(Boolean));
    const hasParallel = (plan.phases || []).some((p) => isParallelPhase(p, plan.tasks.filter((t) => t.phaseId === p.phase_id)));
    if ((distinctAgents.size >= 2 || hasParallel) && !plan.sharedContract) {
      gates['PLAN-G1'].push('[PLAN-G1] Multi-agent / parallel plan is missing a "## 🤝 Shared Interface Contracts (SHARED_CONTRACT)" section.');
    }
    for (const t of plan.tasks) {
      if (!t.agent) gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") is missing "- **Agent**: <role#shard>".`);
      if (!options.allowEmptyOwnedFiles && t.ownedFiles.length === 0) {
        gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") must specify >= 1 file in "- **OWNED_FILES**:".`);
      }
      if (!t.verifyCmd || VAGUE_VERIFY_RE.test(t.verifyCmd)) {
        gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") is missing a concrete "- **Verify**:" command.`);
      }
    }
  }

  for (const t of plan?.tasks || []) {
    if (t.ownedFiles.length > maxFiles) {
      gates['PLAN-G2'].push(`[PLAN-G2] Task ${t.reqId} (${t.agent || 'unassigned'}) owns ${t.ownedFiles.length} files (exceeds <= ${maxFiles} OWNED_FILES per shard).`);
    }
    for (const owned of t.ownedFiles) {
      if (t.readOnlyFiles.some((ro) => pathsCollide(owned, ro))) {
        gates['PLAN-G3'].push(`[PLAN-G3] Task ${t.reqId} lists "${owned}" in both OWNED_FILES and READ_ONLY_FILES.`);
      }
    }
  }

  for (const phase of plan?.phases || []) {
    const phaseTasks = (plan.tasks || []).filter((t) => t.phaseId === phase.phase_id);
    if (!isParallelPhase(phase, phaseTasks)) continue;
    for (let i = 0; i < phaseTasks.length; i++) {
      for (let j = i + 1; j < phaseTasks.length; j++) {
        const tA = phaseTasks[i];
        const tB = phaseTasks[j];
        if (tA.dependsOn.includes(tB.reqId.toUpperCase()) || tB.dependsOn.includes(tA.reqId.toUpperCase())) continue;
        for (const fA of tA.ownedFiles) {
          for (const fB of tB.ownedFiles) {
            if (pathsCollide(fA, fB)) {
              gates['PLAN-G3'].push(`[PLAN-G3] File lock collision in parallel phase ${phase.phase_id}: "${fA}" (${tA.reqId}) collides with "${fB}" (${tB.reqId}).`);
            }
          }
        }
      }
    }
  }

  const phases = plan?.phases || [];
  const phaseIds = new Set(phases.map((p) => p.phase_id));
  for (const p of phases) {
    for (const dep of p.dependsOn || []) {
      if (!phaseIds.has(dep)) gates['PLAN-G4'].push(`[PLAN-G4] Phase "${p.phase_id}" depends on unknown phase "${dep}".`);
    }
  }
  if (detectPhaseCycle(phases.map((p) => ({ phase_id: p.phase_id, depends_on: p.dependsOn || [] })))) {
    gates['PLAN-G4'].push('[PLAN-G4] Circular dependency detected in plan phase/wave DAG.');
  }

  const definedAcs = plan?.acceptanceCriteria || [];
  if (definedAcs.length > 0) {
    const covered = new Set([...(plan.traceabilityCriteria || []), ...(plan.tasks || []).flatMap((t) => t.acceptance || [])]);
    for (const ac of definedAcs) {
      if (!covered.has(ac)) gates['PLAN-G5'].push(`[PLAN-G5] Orphan acceptance criterion "${ac}" is not referenced by any task.`);
    }
  }

  const errors = Object.values(gates).flat();
  return { valid: errors.length === 0, errors, gates, plan };
}

function compilePlanToLedger(planFilePath, options = {}) {
  const cwd = options.cwd || process.cwd();
  const absPlanPath = path.resolve(cwd, planFilePath);
  if (!fs.existsSync(absPlanPath)) throw new Error(`Plan file not found: ${planFilePath}`);
  const rawMarkdown = fs.readFileSync(absPlanPath, 'utf8');
  const relPlanPath = path.relative(cwd, absPlanPath).replace(/\\/g, '/') || path.basename(absPlanPath);
  const plan = parsePlanMarkdown(rawMarkdown, relPlanPath);
  const validation = validatePlan(plan, options);
  if (!validation.valid && !options.force) {
    throw new Error(`Plan validation failed (${validation.errors.length} errors):\n${validation.errors.join('\n')}`);
  }

  const paths = resolvePaths(cwd, options.file);
  fs.mkdirSync(path.dirname(paths.contractPath), { recursive: true });
  const body = plan.sharedContract || `> Locked contract compiled from ${relPlanPath}.`;
  fs.writeFileSync(paths.contractPath, `# 🤝 SHARED_CONTRACT — ${plan.title}\n\n${body}\n`, 'utf8');

  const usedReqIds = new Set();
  const features = plan.tasks.map((t, idx) => {
    let reqId = /^REQ-\d+$/i.test(t.reqId) ? t.reqId.toUpperCase() : `REQ-${String(101 + idx)}`;
    while (usedReqIds.has(reqId)) reqId = `REQ-${String(101 + idx + usedReqIds.size)}`;
    usedReqIds.add(reqId);
    const slice = `${relPlanPath}#L${t.startLine}-L${t.endLine}`;
    const testFiles = t.testFiles.length > 0 ? t.testFiles : [`tests/${reqId.toLowerCase()}.test.ts`];
    return {
      req_id: reqId, phase_id: t.phaseId, title: t.title, role_shard: t.agent,
      source_ref: slice, source_doc: slice, doc_slices: [slice],
      acceptance_criteria: t.acceptance.length > 0 ? t.acceptance : [t.title],
      status: 'pending', passes: false, owned_files: t.ownedFiles, read_only_files: t.readOnlyFiles,
      test_files: testFiles, verification_cmd: t.verifyCmd, evidence: null,
    };
  });

  const phases = plan.phases.map((p) => ({
    phase_id: p.phase_id, title: p.title, status: 'pending', depends_on: p.dependsOn || [],
    parallelizable: Boolean(p.parallelizable), doc_slices: [`${relPlanPath}#L${p.startLine}-L${p.endLine}`],
  }));

  const projectName = options.name || plan.title || path.basename(cwd);
  const ledger = {
    version: KIT_VERSION, schema_version: KIT_VERSION, project: projectName, project_name: projectName,
    updated_at: new Date().toISOString(),
    spec_documents: [{ path: relPlanPath, sha256: hashFileSha256(absPlanPath), lines: countLines(rawMarkdown) }],
    active_cursor: { current_phase_id: phases[0]?.phase_id || 'PHASE-1', baseline_passed_tests: 0 },
    phases, features,
  };
  saveLedgerFile(paths.ledgerPath, ledger);
  writeProgressFile(paths.progressPath, ledger);
  return { ledger, paths, validation };
}

const PLAN_HELP = `Usage: boomopen plan <validate|compile|help> <plan.md> [options]
  validate <plan.md> [--sync-ledger] [--json]   Validate PLAN.md against 5 Deterministic Gates (PLAN-G1..G5)
  compile <plan.md> [--file <path>] [--json]    Compile PLAN.md into .boomopen/project-ledger.json & SHARED_CONTRACT.md`;

function runPlanCli(argv = [], options = {}) {
  const flags = { syncLedger: false, json: false, help: false, file: null, name: null };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') flags.help = true;
    else if (a === '--json') flags.json = true;
    else if (a === '--sync-ledger') flags.syncLedger = true;
    else if (a === '--file') flags.file = argv[++i];
    else if (a === '--name') flags.name = argv[++i];
    else positional.push(a);
  }
  const sub = (positional[0] || 'help').toLowerCase();
  if (flags.help || sub === 'help') {
    if (!options.silent) console.log(PLAN_HELP);
    return EXIT_OK;
  }
  const cwd = options.cwd || process.cwd();
  const targetFile = positional[1];
  if (!targetFile) {
    if (!options.silent) console.error(`❌ boomopen plan ${sub} requires a <plan.md> path.\n\n${PLAN_HELP}`);
    return EXIT_USAGE;
  }
  try {
    if (sub === 'validate') {
      const abs = path.resolve(cwd, targetFile);
      if (!fs.existsSync(abs)) throw new Error(`Plan file not found: ${targetFile}`);
      const res = validatePlan(parsePlanMarkdown(fs.readFileSync(abs, 'utf8'), targetFile), options);
      if (res.valid && flags.syncLedger) compilePlanToLedger(targetFile, { cwd, file: flags.file, name: flags.name });
      if (!options.silent) {
        if (flags.json) console.log(JSON.stringify({ valid: res.valid, errors: res.errors, gates: res.gates }, null, 2));
        else if (res.valid) console.log(`✅ Plan valid (${res.plan.phases.length} phases, ${res.plan.tasks.length} tasks, 0 gate violations)`);
        else for (const err of res.errors) console.error(`❌ ${err}`);
      }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    if (sub === 'compile' || sub === 'from-plan') {
      const { ledger, paths } = compilePlanToLedger(targetFile, { cwd, file: flags.file, name: flags.name });
      if (!options.silent) {
        const msg = flags.json
          ? JSON.stringify({ ok: true, ledgerPath: paths.ledgerPath, phases: ledger.phases.length, features: ledger.features.length }, null, 2)
          : `✅ Compiled ${targetFile} -> ${paths.ledgerPath} (${ledger.phases.length} phases, ${ledger.features.length} REQs)`;
        console.log(msg);
      }
      return EXIT_OK;
    }
    if (!options.silent) console.error(`❌ Unknown plan subcommand "${sub}"\n\n${PLAN_HELP}`);
    return EXIT_USAGE;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen plan: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_FAIL;
  }
}

module.exports = { parsePlanMarkdown, validatePlan, compilePlanToLedger, runPlanCli };
