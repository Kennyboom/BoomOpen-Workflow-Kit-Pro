'use strict';

/**
 * Deterministic Plan Parser, 5-Gate Validator & Plan-to-Ledger Compiler (`boomopen plan`).
 * Enforces PLAN-G1..G5 across all 17 supported languages and compiles `PLAN-{task}.md` into `.boomopen/project-ledger.json`.
 */

const fs = require('node:fs');
const path = require('node:path');
const { EXIT_OK, EXIT_FAIL, EXIT_USAGE, parseSubcommandArgs } = require('./cli-args.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { hashFileSha256, resolvePaths, saveLedgerFile, writeProgressFile, detectPhaseCycle } = require('./ledger.js');
const { countLines, stripBom, readCleanText, stripOutsideBacktickParens, parseFenceOpen, isFenceClose } = require('./markdown-fences.js');

const [DEFAULT_MAX_FILES_PER_SHARD, SOFT_PLAN_LINES, HARD_PLAN_LINES] = [4, 400, 500];
const VAGUE_VERIFY_RE = /^(?:manual(?:\s+check|\s+test|\s+verification)?|verify\s+manually|check\s+manually|kiểm\s+tra\s+thủ\s+công|none|n\/a|tbd|later|-|—)$/iu;
const NONE_TOKEN_RE = /^(?:none(?:\s*\(.*\))?|n\/a|không(?:\s+có)?|all\s+files\s+outside\b.*|mọi\s+(?:tệp|file)\s+ngoài\b.*|—|-)$/iu;
const PHASE_KEYWORD_RE = /^(#{2,3})\s+(?:[^\p{L}\p{N}\n]*\s*)?(?:\d+[.)]\s*)?(?:[^\p{L}\p{N}\n]*\s*)?(Phase|Wave|Stage|Giai\s+đoạn|Đợt|阶段|波次|フェーズ|ウェーブ|단계|웨이브|Fase|Ola|Étape|Vague)\s+([A-Za-z0-9_.-]+)\s*(?:[:—–-]\s*([^\n(]*))?(.*)$/iu;
const TASK_HEADING_RE = /^(#{3,4})\s+(?:[^\p{L}\p{N}[\n]*\s*)?(?:\[[ xX]\]\s*)?(?:\*\*)?(?:(?:Task|Nhiệm\s+vụ|Công\s+việc|任务|タスク|작업|Tarea|Tâche|Aufgabe)\s+([A-Za-z0-9._-]+)|([A-Za-z0-9._-]+)(?=\s*[([]\s*REQ-\d+))(?:\*\*)?(?:\s*\(([^)]+)\)|\s*\[([^\]]+)\])?\s*(?:[:—–-]\s*(.*))?$/iu;
const TASK_BULLET_RE = /^\s*[-*]\s+(?:\[[ xX]\]\s+)?\*\*(?:Task|Nhiệm\s+vụ|Công\s+việc|任务|タスク|작업|Tarea|Tâche|Aufgabe)\s+([A-Za-z0-9._-]+)(?:\s*\(([^)]+)\)|\s*\[([^\]]+)\])?\*\*\s*(?:[:—–-]\s*(.*))?$/iu;
const SUB_CLAUSE_LINE_RE = /^\s*[-*]\s+(?:\[([ xX])\]\s+)?(?:`?\[(SC-[A-Za-z0-9_.-]+)\]`?|`(SC-[A-Za-z0-9_.-]+)`|(SC-[A-Za-z0-9_.-]+))\s*[:—–-]?\s*(.*)$/i;

function normalizeRelPath(p) {
  return String(p || '').trim().replace(/^['"`]+|['"`]+$/g, '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '');
}

function parsePathList(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const stripped = stripOutsideBacktickParens(raw.trim()).trim();
  if (!stripped || NONE_TOKEN_RE.test(stripped.replace(/`/g, '').trim())) return [];
  const backticked = [...stripped.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  return (backticked.length > 0 ? backticked : stripped.split(/[,\s]+/)).map(normalizeRelPath).filter((item) => item && !NONE_TOKEN_RE.test(item));
}

function canonicalPhasePrefix(word) {
  const lower = String(word || '').toLowerCase();
  return /^(?:wave|đợt|波次|ウェーブ|웨이브|ola|vague)$/.test(lower) ? 'WAVE' : lower === 'stage' ? 'STAGE' : 'PHASE';
}

function normalizePhaseId(raw) {
  const clean = String(raw || '').trim().replace(/^`|`$/g, '');
  const explicit = /\b((?:PHASE|WAVE|STAGE)[-_]\d+(?:\.\d+)*)\b/i.exec(clean);
  if (explicit) return explicit[1].toUpperCase().replace(/_/g, '-');
  const numMatch = /(?:^|[^\p{L}\p{N}])(Phase|Wave|Stage|Giai\s+đoạn|Đợt|阶段|波次|フェーズ|ウェーブ|단계|웨이브|Fase|Ola|Étape|Vague)\s+(\d+(?:\.\d+)*)\b/iu.exec(clean);
  return numMatch ? `${canonicalPhasePrefix(numMatch[1])}-${numMatch[2]}` : clean.toUpperCase().replace(/\s+/g, '-');
}

function parseDepList(raw) {
  return (!raw || typeof raw !== 'string') ? [] : raw.replace(/`/g, '').split(/[,|]+/).map((s) => s.trim()).filter((s) => s && !NONE_TOKEN_RE.test(s)).map(normalizePhaseId);
}

function extractAcIds(text) {
  return [...new Set([...String(text || '').matchAll(/\bAC-?0*(\d+)\b/gi)].map((m) => `AC${m[1]}`))];
}

function extractAgentId(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const backtick = /`([^`]+)`/.exec(text);
  const candidate = (backtick ? backtick[1] : stripOutsideBacktickParens(text)).trim();
  return NONE_TOKEN_RE.test(candidate) ? '' : candidate.split(/\s+/)[0];
}

function pushSubClause(targetList, idRaw, checked, rawDesc, taskId = null) {
  const [id, desc] = [String(idRaw || '').toUpperCase(), String(rawDesc || '').trim()];
  if (!id) return;
  const text = desc ? `[${id}] ${desc}` : `[${id}]`;
  const existing = targetList.find((c) => c.id === id);
  if (existing) { if (checked) existing.checked = true; if (desc && existing.text === `[${id}]`) existing.text = text; return; }
  targetList.push(taskId ? { id, checked: Boolean(checked), text, taskId } : { id, checked: Boolean(checked), text });
}

function parseInlineSubClauses(val, taskList, planList, taskId) {
  const checked = /\[x\]/i.test(val);
  for (const m of String(val || '').matchAll(/\[?(SC-[A-Za-z0-9_.-]+)\]?\s*[:—–-]?\s*([^;,[\]`]*)/gi)) {
    pushSubClause(taskList, m[1], checked, m[2], null); pushSubClause(planList, m[1], checked, m[2], taskId);
  }
}

function parsePhaseHeader(line, lineNumber) {
  const explicitId = /^#{2,3}\s+.*?\bphase_id`?\s*:\s*`?([A-Za-z0-9_.-]+)`?/i.exec(line);
  const m = PHASE_KEYWORD_RE.exec(line);
  if (!m && !explicitId) return null;
  const phaseId = explicitId ? explicitId[1].toUpperCase() : `${canonicalPhasePrefix(m[2])}-${m[3].toUpperCase()}`;
  const parMatch = /(?:Parallel(?:izable)?|Song\s+song)`?\s*:\s*`?(Yes|No|True|False|Có|Không)/iu.exec(line);
  const parallelizable = parMatch ? /^(?:yes|true|có)$/iu.test(parMatch[1]) : /\bParallel\s+Wave\b/i.test(line) ? true : null;
  const depMatch = /(?:Depends\s+On|Phụ\s+thuộc(?:\s+vào)?)`?\s*:\s*([^)|\]\n]+)/iu.exec(line);
  const deps = depMatch ? parseDepList(depMatch[1]) : [];
  const rawHeading = m ? `${m[2]} ${m[3]} — ${`${m[4] || ''} ${m[5] || ''}`.replace(/\([^)]*\)/g, '').trim()}`.replace(/\s+—\s*$/, '') : line.replace(/^#{2,3}\s+/, '').replace(/\([^)]*\)/g, '').trim();
  return { phase_id: phaseId, title: rawHeading || phaseId, parallelizable, dependsOn: deps, depends_on: deps, startLine: lineNumber, endLine: lineNumber };
}

function parseTaskHeader(line, lineNumber, currentPhaseId, taskSeq) {
  const hMatch = TASK_HEADING_RE.exec(line);
  const bMatch = !hMatch ? TASK_BULLET_RE.exec(line) : null;
  if (!hMatch && !bMatch) return null;
  const taskNum = hMatch ? (hMatch[2] || hMatch[3]) : bMatch[1];
  const bracketTag = (hMatch ? hMatch[4] || hMatch[5] : bMatch[2] || bMatch[3]) || '';
  const rawTitle = (hMatch ? hMatch[6] : bMatch[4]) || `Task ${taskNum}`;
  const reqMatch = /\b(REQ-\d+)\b/i.exec(bracketTag) || /\b(REQ-\d+)\b/i.exec(rawTitle);
  const explicitReqId = reqMatch ? reqMatch[1].toUpperCase() : null;
  return {
    reqId: explicitReqId || `Task-${taskNum || taskSeq}`, explicitReqId, taskId: `Task-${taskNum}`,
    title: rawTitle.replace(/\(`?REQ-\d+`?\)/gi, '').trim() || `Task ${taskNum}`,
    phaseId: currentPhaseId, agent: '', sourceDoc: '', acceptance: extractAcIds(`${bracketTag} ${rawTitle}`), subClauses: [],
    ownedFiles: [], readOnlyFiles: [], testFiles: [], verifyCmd: '', dependsOn: [], startLine: lineNumber, endLine: lineNumber,
  };
}

function parseTaskFieldLine(task, line, planSubClauses) {
  const fieldMatch = /^\s*[-*]\s+\*\*([^*]+)\*\*\s*:\s*(.*)$/.exec(line);
  if (!fieldMatch) return false;
  const [key, val] = [fieldMatch[1].trim().toLowerCase(), fieldMatch[2].trim()];
  if (!val) return true;
  if (/^(?:agent|role|role_shard|vai\s+trò|tác\s+nhân|角色|담당)$/u.test(key)) task.agent = extractAgentId(val);
  else if (/^(?:owned_files|files_owned|owned\s+files|tệp\s+sở\s+hữu|file\s+sở\s+hữu)/u.test(key)) task.ownedFiles.push(...parsePathList(val));
  else if (/^(?:read_only_files|read[- ]only\s+files|tệp\s+chỉ\s+đọc|file\s+chỉ\s+đọc)/u.test(key)) task.readOnlyFiles.push(...parsePathList(val));
  else if (/^(?:test[ _]files?|tests|tệp\s+kiểm\s+thử|file\s+test)$/u.test(key)) task.testFiles.push(...parsePathList(val));
  else if (/^(?:verify|verification|verification_cmd|kiểm\s+tra|xác\s+minh|lệnh\s+kiểm\s+tra)$/u.test(key)) task.verifyCmd = val.replace(/^`+|`+$/g, '').trim();
  else if (/^(?:source[ _-]?doc|source[ _-]?ref|spec[ _-]?source|nguồn\s+đặc\s+tả|tài\s+liệu\s+nguồn)$/u.test(key)) {
    const clean = stripOutsideBacktickParens(val).replace(/^`+|`+$/g, '').trim();
    if (clean && !NONE_TOKEN_RE.test(clean)) task.sourceDoc = clean;
  } else if (/^(?:sub[-_ ]?clauses?|clauses?|tiểu\s+khoản|điều\s+khoản\s+con)$/u.test(key)) parseInlineSubClauses(val, task.subClauses, planSubClauses, task.reqId);
  else if (/^(?:acceptance|traces\s+to|acceptance_criteria|nghiệm\s+thu|tiêu\s+chí\s+nghiệm\s+thu|truy\s+vết)$/u.test(key)) {
    for (const id of [...extractAcIds(val), ...[...val.matchAll(/\b(REQ-\d+)\b/gi)].map((m) => m[1].toUpperCase())]) if (!task.acceptance.includes(id)) task.acceptance.push(id);
    parseInlineSubClauses(val, task.subClauses, planSubClauses, task.reqId);
  } else if (/^(?:depends[ _]on|phụ\s+thuộc(?:\s+vào)?)$/u.test(key)) task.dependsOn.push(...parseDepList(val));
  return true;
}

function parsePlanMarkdown(markdownText, planFilePath = 'PLAN.md') {
  const raw = stripBom(markdownText);
  const [lineCount, lines] = [raw ? countLines(raw) : 0, raw.split(/\r?\n/)];
  let title = path.basename(planFilePath, path.extname(planFilePath));
  const [sharedLines, acSet, traceAcSet, phases, tasks, specSources, subClauses, acDetails] = [[], new Set(), new Set(), [], [], [], [], {}];
  let [section, currentPhase, currentTask, defaultParallelizable, activeFence] = ['', null, null, null, null];

  for (let i = 0; i < lines.length; i++) {
    const [line, lineNum] = [lines[i], i + 1];
    if (!activeFence) {
      const opened = parseFenceOpen(line);
      if (opened) { activeFence = opened; if (section === 'contract') sharedLines.push(line); continue; }
    } else {
      if (section === 'contract') sharedLines.push(line);
      if (isFenceClose(line, activeFence)) activeFence = null;
      continue;
    }
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h1 && i < 15) { title = h1[1].replace(/^(?:Implementation\s+Plan|Kế\s+hoạch\s+Triển\s+khai)\s*[:—–-]\s*/iu, '').trim() || title; continue; }
    const phaseHdr = parsePhaseHeader(line, lineNum);
    if (phaseHdr) {
      if (currentTask) { currentTask.endLine = lineNum - 1; currentTask = null; }
      if (currentPhase) currentPhase.endLine = lineNum - 1;
      currentPhase = phaseHdr; phases.push(currentPhase); section = 'phase'; continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      if (currentTask) { currentTask.endLine = lineNum - 1; currentTask = null; }
      const h2Text = h2[1];
      if (/SHARED_CONTRACT|DESIGN_CONTRACT|Shared\s+Interface\s+Contract|Design-to-Code\s+Contract|Hợp\s+đồng\s+(?:Giao\s+diện|Thiết\s+kế)/iu.test(h2Text)) {
        if (section === 'contract' && sharedLines.length > 0) sharedLines.push(line);
        section = 'contract';
      } else if (/Acceptance\s+Criteria|Tiêu\s+chí\s+Nghiệm\s+thu|验收标准|受入基準|수락\s*기준|Criterios\s+de\s+Aceptación/iu.test(h2Text)) section = 'ac';
      else if (/Traceability|Truy\s+vết|追溯|トレーサビリティ|추적성/iu.test(h2Text)) section = 'traceability';
      else if (/Spec\s+Sources?|Source\s+Documents?|Tài\s+liệu\s+Đặc\s+tả/iu.test(h2Text)) section = 'specs';
      else if (/Tasks|Nhiệm\s+vụ|Danh\s+sách\s+Công\s+việc/iu.test(h2Text)) {
        section = 'tasks';
        const par = /(?:Parallel(?:izable)?|Song\s+song)`?\s*:\s*`?(Yes|No|True|False|Có|Không)/iu.exec(h2Text);
        if (par) defaultParallelizable = /^(?:yes|true|có)$/iu.test(par[1]);
      } else section = 'other';
      continue;
    }
    const taskHdr = parseTaskHeader(line, lineNum, currentPhase ? currentPhase.phase_id : 'PHASE-1', tasks.length + 1);
    if (taskHdr) {
      if (currentTask) currentTask.endLine = lineNum - 1;
      if (!currentPhase) {
        currentPhase = { phase_id: 'PHASE-1', title: 'Phase 1 — Implementation', parallelizable: defaultParallelizable, dependsOn: [], depends_on: [], startLine: lineNum, endLine: lines.length };
        phases.push(currentPhase);
      }
      currentTask = taskHdr; tasks.push(currentTask); continue;
    }
    if (!currentTask) {
      const specMeta = /^(?:[-*>]\s*)?(?:\*\*)?Spec[- ]Sources?(?:\*\*)?\s*:\s*(.+)$/i.exec(line);
      if (specMeta) specSources.push(...parsePathList(specMeta[1]));
      const shaMeta = /Spec-SHA256\**\s*:\s*(.+)$/i.exec(line);
      if (shaMeta) for (const m of shaMeta[1].matchAll(/([^,\s`]+?)\s*=\s*(?:sha256:)?[0-9a-fA-F]{8,64}/g)) specSources.push(normalizeRelPath(m[1]));
      if (section === 'specs' && /^\s*[-*]\s+/.test(line)) specSources.push(...parsePathList(line.replace(/^\s*[-*]\s+/, '')));
    }
    if (section === 'contract') sharedLines.push(line);
    if (section === 'ac') for (const id of extractAcIds(line)) { acSet.add(id); if (!acDetails[id]) acDetails[id] = line.trim().replace(/^[-*]\s+/, ''); }
    else if (section === 'traceability') for (const id of extractAcIds(line)) traceAcSet.add(id);
    if (currentPhase && !currentTask) {
      const pDep = /^\s*[-*]\s+\*\*(?:Depends\s+On|Phụ\s+thuộc(?:\s+vào)?)\*\*\s*:\s*(.+)$/iu.exec(line);
      if (pDep) { currentPhase.dependsOn = parseDepList(pDep[1]); currentPhase.depends_on = currentPhase.dependsOn; }
      const pPar = /^\s*[-*]\s+\*\*(?:Parallel(?:izable)?|Song\s+song)\*\*\s*:\s*`?(Yes|No|True|False|Có|Không)`?/iu.exec(line);
      if (pPar) currentPhase.parallelizable = /^(?:yes|true|có)$/iu.test(pPar[1]);
    }
    const handledField = currentTask ? parseTaskFieldLine(currentTask, line, subClauses) : false;
    const scMatch = !handledField ? SUB_CLAUSE_LINE_RE.exec(line) : null;
    if (scMatch) {
      const [scId, checked, desc] = [scMatch[2] || scMatch[3] || scMatch[4], Boolean(scMatch[1] && scMatch[1].toLowerCase() === 'x'), scMatch[5]];
      if (currentTask) pushSubClause(currentTask.subClauses, scId, checked, desc, null);
      pushSubClause(subClauses, scId, checked, desc, currentTask ? currentTask.reqId : null);
    }
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
    title, planFilePath, lineCount, sharedContract, hasContractCodeBlock: /`{3,}|~{3,}/.test(sharedContract),
    specSources: [...new Set(specSources.filter(Boolean))], acceptanceDetails: acDetails, subClauses,
    acceptanceCriteria: [...acSet], traceabilityCriteria: [...traceAcSet], phases, waves: phases, tasks,
  };
}

function pathsCollide(pathA, pathB) {
  const [a, b] = [normalizeRelPath(pathA).toLowerCase(), normalizeRelPath(pathB).toLowerCase()];
  return Boolean(a && b) && (a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`));
}

function roConflictsWithOwned(owned, ro) {
  const [o, r] = [normalizeRelPath(owned).toLowerCase(), normalizeRelPath(ro).toLowerCase()];
  return Boolean(o && r) && (o === r || r.startsWith(`${o}/`));
}

function taskDependsOn(tA, tB) {
  const deps = tA.dependsOn || [];
  return deps.includes(String(tB.reqId || '').toUpperCase()) || (Boolean(tB.taskId) && deps.includes(String(tB.taskId).toUpperCase()));
}

function detectTaskCycle(tasks = []) {
  const alias = new Map();
  for (const t of tasks) {
    const id = String(t.reqId || '').toUpperCase();
    if (id) alias.set(id, id);
    if (t.taskId) alias.set(String(t.taskId).toUpperCase(), id);
  }
  return detectPhaseCycle(tasks.map((t) => ({
    phase_id: String(t.reqId || '').toUpperCase(),
    depends_on: (t.dependsOn || []).map((d) => alias.get(String(d).toUpperCase())).filter(Boolean),
  })));
}

function isParallelPhase(phase, phaseTasks) {
  if (phase.parallelizable === true) return true;
  if (phase.parallelizable === false || phaseTasks.length < 2) return false;
  return new Set(phaseTasks.map((t) => t.agent).filter(Boolean)).size >= 2 || phaseTasks.some((t) => t.agent.includes('#'));
}

function validatePlan(parsedOrMarkdown, options = {}) {
  const plan = typeof parsedOrMarkdown === 'string' ? parsePlanMarkdown(parsedOrMarkdown) : parsedOrMarkdown;
  const maxFiles = options.maxFilesPerShard || DEFAULT_MAX_FILES_PER_SHARD;
  const gates = { 'PLAN-G1': [], 'PLAN-G2': [], 'PLAN-G3': [], 'PLAN-G4': [], 'PLAN-G5': [] };
  const warnings = [];
  if (!plan || !Array.isArray(plan.tasks) || plan.tasks.length === 0) {
    gates['PLAN-G1'].push('[PLAN-G1] Plan must define at least 1 task (### Task X.Y or - [ ] **Task X.Y**).');
  } else {
    const distinctAgents = new Set(plan.tasks.map((t) => t.agent).filter(Boolean));
    const hasParallel = (plan.phases || []).some((p) => isParallelPhase(p, plan.tasks.filter((t) => t.phaseId === p.phase_id)));
    if ((distinctAgents.size >= 2 || hasParallel) && !plan.sharedContract) {
      gates['PLAN-G1'].push('[PLAN-G1] Multi-agent / parallel plan is missing a "## 🤝 Shared Interface Contracts (SHARED_CONTRACT)" section.');
    }
    const seenExplicitReqIds = new Map();
    for (const t of plan.tasks) {
      if (t.explicitReqId) {
        const prev = seenExplicitReqIds.get(t.explicitReqId);
        if (prev) gates['PLAN-G1'].push(`[PLAN-G1] Duplicate requirement ID "${t.explicitReqId}" assigned to both "${prev}" and "${t.title}".`);
        else seenExplicitReqIds.set(t.explicitReqId, t.title);
      }
      if (!t.agent) gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") is missing "- **Agent**: <role#shard>".`);
      if (!options.allowEmptyOwnedFiles && t.ownedFiles.length === 0) gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") must specify >= 1 file in "- **OWNED_FILES**:".`);
      if (!t.verifyCmd || VAGUE_VERIFY_RE.test(t.verifyCmd)) gates['PLAN-G1'].push(`[PLAN-G1] Task ${t.reqId} ("${t.title}") is missing a concrete "- **Verify**:" command.`);
    }
  }
  for (const t of plan?.tasks || []) {
    if (t.ownedFiles.length > maxFiles) gates['PLAN-G2'].push(`[PLAN-G2] Task ${t.reqId} (${t.agent || 'unassigned'}) owns ${t.ownedFiles.length} files (exceeds <= ${maxFiles} OWNED_FILES per shard).`);
    for (const owned of t.ownedFiles) if (t.readOnlyFiles.some((ro) => roConflictsWithOwned(owned, ro))) gates['PLAN-G3'].push(`[PLAN-G3] Task ${t.reqId} lists "${owned}" in both OWNED_FILES and READ_ONLY_FILES.`);
  }
  for (const phase of plan?.phases || []) {
    const phaseTasks = (plan.tasks || []).filter((t) => t.phaseId === phase.phase_id);
    if (!isParallelPhase(phase, phaseTasks)) continue;
    for (let i = 0; i < phaseTasks.length; i++) {
      for (let j = i + 1; j < phaseTasks.length; j++) {
        const [tA, tB] = [phaseTasks[i], phaseTasks[j]];
        const [ab, ba] = [taskDependsOn(tA, tB), taskDependsOn(tB, tA)];
        if ((ab || ba) && !(ab && ba)) continue;
        for (const fA of tA.ownedFiles) for (const fB of tB.ownedFiles) {
          if (pathsCollide(fA, fB)) gates['PLAN-G3'].push(`[PLAN-G3] File lock collision in parallel phase ${phase.phase_id}: "${fA}" (${tA.reqId}) collides with "${fB}" (${tB.reqId}).`);
        }
      }
    }
  }
  const phases = plan?.phases || [];
  const phaseIds = new Set(phases.map((p) => p.phase_id));
  for (const p of phases) for (const dep of p.dependsOn || []) if (!phaseIds.has(dep)) gates['PLAN-G4'].push(`[PLAN-G4] Phase "${p.phase_id}" depends on unknown phase "${dep}".`);
  if (detectPhaseCycle(phases.map((p) => ({ phase_id: p.phase_id, depends_on: p.dependsOn || [] })))) gates['PLAN-G4'].push('[PLAN-G4] Circular dependency detected in plan phase/wave DAG.');
  if (detectTaskCycle(plan?.tasks || [])) gates['PLAN-G4'].push('[PLAN-G4] Circular task dependency detected in plan tasks.');
  const definedAcs = plan?.acceptanceCriteria || [];
  if (definedAcs.length > 0) {
    const covered = new Set([...(plan.traceabilityCriteria || []), ...(plan.tasks || []).flatMap((t) => t.acceptance || [])]);
    for (const ac of definedAcs) if (!covered.has(ac)) gates['PLAN-G5'].push(`[PLAN-G5] Orphan acceptance criterion "${ac}" is not referenced by any task.`);
  }
  if (typeof plan?.lineCount === 'number') {
    if (plan.lineCount > HARD_PLAN_LINES) gates['PLAN-G5'].push(`[PLAN-G5] Plan is ${plan.lineCount} lines (exceeds cohesive single-file limit of ${HARD_PLAN_LINES} lines).`);
    else if (plan.lineCount > SOFT_PLAN_LINES) warnings.push(`[PLAN-G5] Plan is ${plan.lineCount} lines (exceeds soft target of ${SOFT_PLAN_LINES} lines).`);
  }
  const errors = Object.values(gates).flat();
  return { valid: errors.length === 0, errors, warnings, gates, plan };
}

function compilePlanToLedger(planFilePath, options = {}) {
  const cwd = options.cwd || process.cwd();
  const absPlanPath = path.resolve(cwd, planFilePath);
  if (!fs.existsSync(absPlanPath)) throw new Error(`Plan file not found: ${planFilePath}`);
  const rawMarkdown = readCleanText(absPlanPath);
  const relPlanPath = path.relative(cwd, absPlanPath).replace(/\\/g, '/') || path.basename(absPlanPath);
  const plan = parsePlanMarkdown(rawMarkdown, relPlanPath);
  const validation = validatePlan(plan, options);
  if (!validation.valid && !options.force) throw new Error(`Plan validation failed (${validation.errors.length} errors):\n${validation.errors.join('\n')}`);
  const paths = resolvePaths(cwd, options.file);
  fs.mkdirSync(path.dirname(paths.contractPath), { recursive: true });
  fs.writeFileSync(paths.contractPath, `# 🤝 SHARED_CONTRACT — ${plan.title}\n\n${plan.sharedContract || `> Locked contract compiled from ${relPlanPath}.`}\n`, 'utf8');
  const usedReqIds = new Set();
  const features = plan.tasks.map((t, idx) => {
    let reqId = /^REQ-\d+$/i.test(t.reqId) ? t.reqId.toUpperCase() : `REQ-${String(101 + idx)}`;
    while (usedReqIds.has(reqId)) reqId = `REQ-${String(101 + idx + usedReqIds.size)}`;
    usedReqIds.add(reqId);
    const slice = `${relPlanPath}#L${t.startLine}-L${t.endLine}`;
    const sourceDoc = t.sourceDoc || slice;
    const docSlices = t.sourceDoc && t.sourceDoc !== slice ? [t.sourceDoc, slice] : [slice];
    return {
      req_id: reqId, phase_id: t.phaseId, title: t.title, role_shard: t.agent, source_ref: sourceDoc, source_doc: sourceDoc, doc_slices: docSlices,
      acceptance_criteria: t.acceptance.length > 0 ? t.acceptance : [t.title], status: 'pending', passes: false,
      owned_files: t.ownedFiles, read_only_files: t.readOnlyFiles, test_files: t.testFiles.length > 0 ? t.testFiles : [`tests/${reqId.toLowerCase()}.test.ts`],
      verification_cmd: t.verifyCmd, evidence: null,
    };
  });
  const phases = plan.phases.map((p) => ({ phase_id: p.phase_id, title: p.title, status: 'pending', depends_on: p.dependsOn || [], parallelizable: Boolean(p.parallelizable), doc_slices: [`${relPlanPath}#L${p.startLine}-L${p.endLine}`] }));
  const projectName = options.name || plan.title || path.basename(cwd);
  const ledger = {
    version: KIT_VERSION, schema_version: KIT_VERSION, project: projectName, project_name: projectName, updated_at: new Date().toISOString(),
    spec_documents: [{ path: relPlanPath, sha256: hashFileSha256(absPlanPath), lines: countLines(rawMarkdown) }],
    active_cursor: { current_phase_id: phases[0]?.phase_id || 'PHASE-1', baseline_passed_tests: 0 }, phases, features,
  };
  saveLedgerFile(paths.ledgerPath, ledger); writeProgressFile(paths.progressPath, ledger);
  return { ledger, paths, validation };
}

const PLAN_HELP = `Usage: boomopen plan <validate|compile|help> <plan.md> [options]
  validate <plan.md> [--sync-ledger] [--json]   Validate PLAN.md against 5 Deterministic Gates (PLAN-G1..G5)
  compile <plan.md> [--file <path>] [--json]    Compile PLAN.md into .boomopen/project-ledger.json & SHARED_CONTRACT.md`;
const PLAN_ARG_SPEC = {
  defaults: { syncLedger: false, json: false, help: false, file: null, name: null },
  booleanFlags: { '-h': 'help', '--help': 'help', '--json': 'json', '--sync-ledger': 'syncLedger' },
  valueFlags: { '--file': 'file', '--name': 'name' },
};

function runPlanCli(argv = [], options = {}) {
  const { flags, positional, error } = parseSubcommandArgs(argv, PLAN_ARG_SPEC);
  if (error) { if (!options.silent) console.error(`❌ boomopen plan: ${error}\n\n${PLAN_HELP}`); return EXIT_USAGE; }
  const sub = (positional[0] || 'help').toLowerCase();
  if (flags.help || sub === 'help') { if (!options.silent) console.log(PLAN_HELP); return EXIT_OK; }
  if (sub !== 'validate' && sub !== 'compile' && sub !== 'from-plan') { if (!options.silent) console.error(`❌ Unknown plan subcommand "${sub}"\n\n${PLAN_HELP}`); return EXIT_USAGE; }
  const [cwd, targetFile] = [options.cwd || process.cwd(), positional[1]];
  if (!targetFile) { if (!options.silent) console.error(`❌ boomopen plan ${sub} requires a <plan.md> path.\n\n${PLAN_HELP}`); return EXIT_USAGE; }
  const abs = path.resolve(cwd, targetFile);
  if (!fs.existsSync(abs)) { if (!options.silent) console.error(`❌ boomopen plan: Plan file not found: ${targetFile}`); return EXIT_USAGE; }
  try {
    if (sub === 'validate') {
      const res = validatePlan(parsePlanMarkdown(readCleanText(abs), targetFile), options);
      if (res.valid && flags.syncLedger) compilePlanToLedger(targetFile, { cwd, file: flags.file, name: flags.name });
      if (!options.silent) {
        if (flags.json) console.log(JSON.stringify({ valid: res.valid, errors: res.errors, warnings: res.warnings, gates: res.gates }, null, 2));
        else if (res.valid) console.log(`✅ Plan valid (${res.plan.phases.length} phases, ${res.plan.tasks.length} tasks, 0 gate violations)`);
        else for (const err of res.errors) console.error(`❌ ${err}`);
      }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    const { ledger, paths } = compilePlanToLedger(targetFile, { cwd, file: flags.file, name: flags.name });
    if (!options.silent) console.log(flags.json ? JSON.stringify({ ok: true, ledgerPath: paths.ledgerPath, phases: ledger.phases.length, features: ledger.features.length }, null, 2) : `✅ Compiled ${targetFile} -> ${paths.ledgerPath} (${ledger.phases.length} phases, ${ledger.features.length} REQs)`);
    return EXIT_OK;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen plan: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_FAIL;
  }
}

module.exports = { SOFT_PLAN_LINES, HARD_PLAN_LINES, parsePlanMarkdown, validatePlan, compilePlanToLedger, runPlanCli };
