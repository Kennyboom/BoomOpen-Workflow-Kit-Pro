#!/usr/bin/env node

/**
 * BoomOpen Workflow Kit Stop & PreCompact lifecycle hook.
 *  - PreCompact: writes `.boomopen/compact-snapshot.json` when `.boomopen/` exists in `cwd`, exits 0 with `{}`.
 *  - Stop: skips when `continuationActive` or `stop_hook_active` is true; when `.boomopen/project-ledger.json`
 *    or `.boomopen/audit-ledger.json` exists in `cwd` and modified git files fail `checker.js` Tier-1 checks,
 *    returns `{"decision":"continue","reason":"..."}` on Antigravity or `{"decision":"block","reason":"..."}`
 *    on Claude Code; otherwise exits 0 with `{}`.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_PAYLOAD_BYTES = 4 * 1024 * 1024;
const GIT_TIMEOUT_MS = 8000;
const requireCjs = createRequire(import.meta.url);
const HOOK_DIR = path.dirname(fileURLToPath(import.meta.url));

function loadChecker() {
  const candidates = [
    path.resolve(HOOK_DIR, '..', 'cli', 'checker.js'),
    path.resolve(HOOK_DIR, '..', 'skills', 'boomopen-workflow-kit', 'cli', 'checker.js'),
    path.resolve(HOOK_DIR, '..', '..', '..', 'cli', 'checker.js'),
  ];
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const checker = requireCjs(candidate);
    const rules = requireCjs(path.join(path.dirname(candidate), 'checker-rules.js'));
    return { ...checker, CODE_EXTENSIONS: rules.CODE_EXTENSIONS, isIgnoredSegment: rules.isIgnoredSegment };
  }
  return null;
}

function resolveCwd(payload) {
  if (payload && typeof payload.cwd === 'string' && payload.cwd.trim()) return payload.cwd.trim();
  if (payload && Array.isArray(payload.workspacePaths) && typeof payload.workspacePaths[0] === 'string') return payload.workspacePaths[0];
  return process.cwd();
}

const isAntigravityEvent = (p) =>
  Boolean(p && typeof p === 'object' && ('hookEventName' in p || 'continuationActive' in p || 'terminationReason' in p || 'workspacePaths' in p));

function listModifiedGitFiles(cwd) {
  const res = spawnSync('git', ['-C', cwd, 'status', '--porcelain', '-z', '-uall'], { encoding: 'utf8', timeout: GIT_TIMEOUT_MS, windowsHide: true });
  if (res.error || res.status !== 0 || !res.stdout) return [];
  const tokens = res.stdout.split('\0');
  const relPaths = [];
  for (let i = 0; i < tokens.length; i++) {
    const entry = tokens[i];
    if (!entry || entry.length < 4) continue;
    const status = entry.slice(0, 2);
    const rel = entry.slice(3);
    if (status[0] === 'R' || status[0] === 'C') i++;
    if (status[0] === 'D' || status[1] === 'D') continue;
    relPaths.push(rel);
  }
  return [...new Set(relPaths)];
}

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeCompactSnapshot(cwd, payload) {
  const boomDir = path.join(cwd, '.boomopen');
  try {
    if (!fs.existsSync(boomDir) || !fs.statSync(boomDir).isDirectory()) return {};
    const projectLedger = readJsonSafe(path.join(boomDir, 'project-ledger.json'));
    const auditLedger = readJsonSafe(path.join(boomDir, 'audit-ledger.json'));
    const snapshot = {
      savedAt: new Date().toISOString(),
      cwd,
      trigger: (payload && payload.trigger) || 'PreCompact',
      sessionId: (payload && (payload.conversationId || payload.session_id)) || null,
      hasProjectLedger: Boolean(projectLedger),
      hasAuditLedger: Boolean(auditLedger),
      currentPhase: projectLedger?.currentPhase ?? null,
      currentRound: auditLedger?.currentRound ?? null,
      modifiedFiles: listModifiedGitFiles(cwd),
    };
    fs.writeFileSync(path.join(boomDir, 'compact-snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  } catch { /* best-effort */ }
  return {};
}

export function evaluateStopGate(payload = {}) {
  const eventName = (payload && (payload.hookEventName || payload.hook_event_name)) || 'Stop';
  const cwd = resolveCwd(payload);
  if (eventName === 'PreCompact') return writeCompactSnapshot(cwd, payload);
  if (!payload || payload.continuationActive === true || payload.stop_hook_active === true) return {};
  if (payload.terminationReason && payload.terminationReason !== 'NO_TOOL_CALL') return {};

  const hasLedger =
    fs.existsSync(path.join(cwd, '.boomopen', 'project-ledger.json')) ||
    fs.existsSync(path.join(cwd, '.boomopen', 'audit-ledger.json'));
  if (!hasLedger) return {};

  const checker = loadChecker();
  const modified = checker ? listModifiedGitFiles(cwd) : [];
  if (modified.length === 0) return {};

  let std;
  try { std = checker.resolveCodingStandards(checker.resolveActiveStandards(cwd, { cwd })); } catch { std = checker.resolveCodingStandards(); }

  const violations = [];
  for (const rel of modified) {
    if (!checker.CODE_EXTENSIONS.has(path.extname(rel).toLowerCase())) continue;
    if (rel.split(/[\\/]+/).filter(Boolean).slice(0, -1).some((seg) => checker.isIgnoredSegment(seg))) continue;
    const abs = path.join(cwd, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    try { violations.push(...checker.inspectSourceFile(abs, cwd, undefined, std, { projectRoot: cwd, strictPhase: true }).violations); } catch { /* skip */ }
  }
  if (violations.length === 0) return {};

  const shown = violations.slice(0, 3).join('; ');
  const more = violations.length > 3 ? ` (+${violations.length - 3} more)` : '';
  const reason = `BoomOpen Stop Quality Gate failed (${violations.length} Tier-1 violation(s)): ${shown}${more}. Fix all violations before finishing.`;
  return { decision: isAntigravityEvent(payload) ? 'continue' : 'block', reason };
}

function readStdin() {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    process.stdin.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_PAYLOAD_BYTES) { process.stdin.destroy(); resolve('{}'); return; }
      chunks.push(chunk);
    });
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', () => resolve('{}'));
  });
}

export async function main() {
  const raw = await readStdin();
  let parsed = {};
  try { parsed = JSON.parse(raw || '{}'); } catch { parsed = {}; }
  process.stdout.write(`${JSON.stringify(evaluateStopGate(parsed))}\n`);
  return 0;
}

function isEntryPoint() {
  if (!process.argv[1]) return false;
  try { return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
}

if (isEntryPoint()) process.exitCode = await main();
