'use strict';

/**
 * Multi-Engine Conductor Primitives (`cli/conductor-engines.js`).
 * Cross-platform CLI engine probing, sandboxed invocation builders, Windows `.cmd` execution &
 * process-tree timeouts, JSON/JSONL unwrapping, and SHA-256 file/workspace snapshot guards.
 */

const { spawn, spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SUPPORTED_ENGINES = ['claude', 'codex', 'antigravity', 'cursor', 'copilot'];
const ENGINE_ALIASES = { gemini: 'antigravity', agy: 'antigravity', 'claude-code': 'claude', 'cursor-agent': 'cursor', 'gh-copilot': 'copilot' };
const ENGINE_FAMILY = { claude: 'anthropic', codex: 'openai', antigravity: 'google', cursor: 'cursor', copilot: 'github' };
const ENGINE_BIN_CANDIDATES = { claude: ['claude'], codex: ['codex'], antigravity: ['agy', 'gemini'], cursor: ['cursor-agent'], copilot: ['copilot'] };
const ROLE_AFFINITY_ORDER = {
  researcher: ['antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  planner: ['claude', 'antigravity', 'codex', 'cursor', 'copilot'],
  designer: ['antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  coder: ['codex', 'antigravity', 'claude', 'cursor', 'copilot'],
  debugger: ['codex', 'claude', 'antigravity', 'cursor', 'copilot'],
  reviewer: ['codex', 'claude', 'antigravity', 'cursor', 'copilot'],
};
const QUOTA_ERROR_PATTERN = /\b(?:429|529)\b|rate[-_ ]?limit|quota exceeded|insufficient_quota|overloaded|too many requests|credit balance|usage limit/i;
const WS_SKIP_DIRS = new Set(['.git', '.boomopen', 'node_modules', '.next', '.nuxt', '.turbo', '.cache', 'dist', 'build', 'coverage', 'skills_library', 'matrix-skills']);
const MAX_WS_BUFFER_BYTES = 2 * 1024 * 1024;
const hashBuffer = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

function normalizeEngineName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const mapped = ENGINE_ALIASES[raw.trim().toLowerCase()] || raw.trim().toLowerCase();
  return SUPPORTED_ENGINES.includes(mapped) ? mapped : null;
}

function resolveEnvVar(env, upperName, mixedName) {
  if (!env || typeof env !== 'object') return '';
  if (Object.prototype.hasOwnProperty.call(env, upperName)) return String(env[upperName] ?? '');
  return Object.prototype.hasOwnProperty.call(env, mixedName) ? String(env[mixedName] ?? '') : '';
}

function resolveWinExts(env) {
  const parsed = resolveEnvVar(env, 'PATHEXT', 'Pathext').split(';').map((e) => e.trim().toLowerCase()).filter((e) => e.startsWith('.'));
  return parsed.length > 0 ? parsed : ['.exe', '.cmd', '.bat'];
}

function findExecutableOnPath(binName, env = process.env, platform = process.platform) {
  if (!binName || typeof binName !== 'string') return null;
  const exts = platform === 'win32' ? (path.win32.extname(binName) !== '' ? [''] : resolveWinExts(env)) : [''];
  if (binName.includes('/') || binName.includes('\\')) {
    for (const ext of exts) {
      try { if (fs.statSync(`${binName}${ext}`, { throwIfNoEntry: false })?.isFile()) return `${binName}${ext}`; } catch { /* ignore */ }
    }
  }
  const dirs = resolveEnvVar(env, 'PATH', 'Path').split(platform === 'win32' ? ';' : ':').filter(Boolean);
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, `${binName}${ext}`);
      try { if (fs.statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate; } catch { /* ignore */ }
    }
  }
  return null;
}

const quoteWinCmdArg = (arg) => `"${String(arg).replace(/(\\*)"/g, '$1$1""').replace(/(\\+)$/, '$1$1').replace(/%/g, '%%')}"`;

function resolveSpawnTarget(command, args = [], env = process.env, platform = process.platform) {
  if (platform !== 'win32' || !command) return { command, args, shell: false, windowsVerbatimArguments: false };
  const resolved = findExecutableOnPath(command, env, platform) || command;
  if (/\.(?:cmd|bat)$/i.test(resolved)) {
    try {
      const m = /(?:%dp0%|%~dp0)[\\/]?([^"\r\n]+?\.(?:[cm]?js))\b/i.exec(fs.readFileSync(resolved, 'utf8'));
      if (m) {
        const jsPath = path.resolve(path.dirname(resolved), m[1].replace(/[\\/]+/g, path.sep));
        if (fs.existsSync(jsPath) && fs.statSync(jsPath).isFile()) {
          return { command: process.execPath, args: [jsPath, ...args], shell: false, windowsVerbatimArguments: false };
        }
      }
    } catch { /* fall back to quoted ComSpec invocation */ }
    const cmdLine = `"${[quoteWinCmdArg(resolved), ...args.map(quoteWinCmdArg)].join(' ')}"`;
    return { command: env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', cmdLine], shell: false, windowsVerbatimArguments: true };
  }
  return { command: resolved, args, shell: false, windowsVerbatimArguments: false };
}

function probeEngines(options = {}) {
  const mockProbes = options.mockProbes && typeof options.mockProbes === 'object' ? options.mockProbes : null;
  const [env, platform, probes] = [options.env || process.env, options.platform || process.platform, {}];
  for (const engine of SUPPORTED_ENGINES) {
    const fallbackMode = engine === 'cursor' || engine === 'copilot' ? 'queue' : 'cli';
    if (mockProbes) {
      const mock = mockProbes[engine] || {};
      const bin = mock.bin || (mock.available ? ENGINE_BIN_CANDIDATES[engine][0] : null);
      probes[engine] = { available: Boolean(mock.available), bin, resolvedPath: mock.resolvedPath || bin, family: ENGINE_FAMILY[engine], fallbackMode };
      continue;
    }
    let [resolvedBin, resolvedPath] = [null, null];
    for (const cand of ENGINE_BIN_CANDIDATES[engine]) {
      const found = findExecutableOnPath(cand, env, platform);
      if (found) { resolvedBin = cand; resolvedPath = found; break; }
    }
    probes[engine] = { available: Boolean(resolvedBin), bin: resolvedBin, resolvedPath, family: ENGINE_FAMILY[engine], fallbackMode };
  }
  return probes;
}

function resolveCrossFamilyEngine(authorEngine, installedEngines = [], role = 'reviewer') {
  const normAuthor = normalizeEngineName(authorEngine);
  const authorFamily = normAuthor ? ENGINE_FAMILY[normAuthor] : null;
  const affinity = ROLE_AFFINITY_ORDER[role] || SUPPORTED_ENGINES;
  const availableSet = new Set(installedEngines.map(normalizeEngineName).filter(Boolean));
  for (const cand of affinity) if (availableSet.has(cand) && (!authorFamily || ENGINE_FAMILY[cand] !== authorFamily)) return cand;
  for (const cand of affinity) if (availableSet.has(cand)) return cand;
  return normAuthor || 'claude';
}

function buildEngineInvocation(engine, promptFilePath, options = {}) {
  const norm = normalizeEngineName(engine);
  if (!norm) throw new Error(`Unsupported engine "${engine}"`);
  const [readOnly, available] = [Boolean(options.readOnly), options.available !== undefined ? Boolean(options.available) : true];
  const bin = options.bin || ENGINE_BIN_CANDIDATES[norm][0];
  const instruction = `Read and strictly execute the task in "${promptFilePath}"`;

  if (norm === 'claude') {
    const args = readOnly
      ? ['-p', instruction, '--output-format', 'json', '--permission-mode', 'plan', '--disallowedTools', 'Write,Edit,Bash,PowerShell,NotebookEdit', '--allowedTools', 'Read,Grep,Glob,WebSearch,WebFetch', '--no-session-persistence']
      : ['-p', instruction, '--output-format', 'json', '--dangerously-skip-permissions', '--no-session-persistence'];
    return { engine: norm, command: bin, args, mode: 'cli', readOnly };
  }
  if (norm === 'codex') {
    const args = readOnly
      ? ['exec', '--ephemeral', '--json', '-s', 'read-only', '-c', 'approval_policy="never"', instruction]
      : ['exec', '--ephemeral', '--full-auto', '--json', '-s', 'workspace-write', instruction];
    return { engine: norm, command: bin, args, mode: 'cli', readOnly };
  }
  if (norm === 'antigravity') {
    const binBase = path.win32.basename(String(bin)).toLowerCase();
    const isGemini = binBase === 'gemini' || /^gemini\.(?:cmd|exe|bat)$/.test(binBase);
    const args = isGemini
      ? ['-p', instruction, '--output-format', 'json', ...(readOnly ? ['--approval-mode', 'plan'] : ['-y'])]
      : (readOnly ? ['-p', instruction, '--mode', 'plan', '--sandbox', '--output-format', 'json'] : ['-p', instruction, '--mode', 'auto', '--dangerously-skip-permissions', '--output-format', 'json']);
    return { engine: norm, command: bin, args, mode: 'cli', readOnly };
  }
  if (!available) return { engine: norm, command: null, args: [], mode: 'queue', queueFile: options.queueFile || null, readOnly };
  return { engine: norm, command: bin, args: norm === 'cursor' ? ['-p', instruction] : ['-p', instruction, '-s'], mode: 'cli', readOnly };
}

function extractJsonMessageText(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of ['result', 'response', 'output']) if (typeof obj[key] === 'string') return obj[key];
  if (typeof obj.text === 'string' && obj.type !== 'reasoning') return obj.text;
  if (obj.item && typeof obj.item === 'object') {
    const t = obj.item.type;
    if (!t || t === 'agent_message' || t === 'message') {
      if (typeof obj.item.text === 'string') return obj.item.text;
      if (Array.isArray(obj.item.content)) {
        const parts = obj.item.content.map((c) => (c && typeof c.text === 'string' ? c.text : '')).filter(Boolean);
        if (parts.length) return parts.join('\n');
      }
    }
    return '';
  }
  if (Array.isArray(obj.content)) {
    const parts = obj.content.filter((b) => b && (!b.type || b.type === 'text' || b.type === 'output_text') && typeof b.text === 'string').map((b) => b.text);
    if (parts.length) return parts.join('\n');
  }
  return null;
}

function unwrapEngineStdout(engine, rawStdout) {
  const [norm, raw] = [normalizeEngineName(engine), String(rawStdout || '')];
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return raw;
  try {
    const parsed = JSON.parse(trimmed);
    const single = extractJsonMessageText(parsed);
    if (single !== null) return single;
    if (Array.isArray(parsed)) {
      const agentMsgs = parsed.filter((o) => o?.item?.type === 'agent_message').map(extractJsonMessageText).filter((t) => t && t.trim());
      if (agentMsgs.length) return agentMsgs[agentMsgs.length - 1];
      const texts = parsed.map(extractJsonMessageText).filter((t) => t && t.trim());
      if (texts.length) return norm === 'codex' ? texts[texts.length - 1] : texts.join('\n\n');
    }
    return raw;
  } catch {
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.every((l) => l.startsWith('{'))) return raw;
    const [agentMsgs, chunks] = [[], []];
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        const txt = extractJsonMessageText(obj);
        if (txt && txt.trim()) { chunks.push(txt); if (obj?.item?.type === 'agent_message') agentMsgs.push(txt); }
      } catch { return raw; }
    }
    return agentMsgs.length > 0 ? agentMsgs[agentMsgs.length - 1] : (norm === 'codex' ? (chunks[chunks.length - 1] || '') : chunks.join('\n\n'));
  }
}

function walkDirTree(rootDir, prefix = '', files = new Map(), dirs = new Set(), skipSet = null) {
  if (!fs.existsSync(rootDir)) return { files, dirs };
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (skipSet && skipSet.has(entry.name)) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) { dirs.add(rel); walkDirTree(abs, rel, files, dirs, skipSet); }
    else if (entry.isFile()) {
      const stat = fs.statSync(abs);
      const buffer = stat.size <= MAX_WS_BUFFER_BYTES || !skipSet ? fs.readFileSync(abs) : null;
      files.set(rel, { absPath: abs, sha256: buffer ? hashBuffer(buffer) : hashBuffer(fs.readFileSync(abs)), buffer });
    }
  }
  return { files, dirs };
}

function ensureFileTargetReady(absPath) {
  if (fs.existsSync(absPath) && !fs.lstatSync(absPath).isFile()) fs.rmSync(absPath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
}

function captureReadOnlySnapshot(cwd, relPaths = []) {
  const snapshot = [];
  for (const relPath of relPaths) {
    if (!relPath) continue;
    const absPath = path.resolve(cwd, relPath);
    if (fs.existsSync(absPath)) {
      const stat = fs.statSync(absPath);
      if (stat.isFile()) {
        const buffer = fs.readFileSync(absPath);
        snapshot.push({ kind: 'file', relPath, absPath, existed: true, sha256: hashBuffer(buffer), buffer });
        continue;
      }
      if (stat.isDirectory()) {
        const { files, dirs } = walkDirTree(absPath);
        snapshot.push({ kind: 'dir', relPath: relPath.replace(/\\/g, '/').replace(/\/+$/, ''), absPath, existed: true, files, existingDirs: dirs });
        continue;
      }
    }
    snapshot.push({ kind: 'missing', relPath, absPath, existed: false, sha256: null, buffer: null });
  }
  return snapshot;
}

function restoreDirTreeSnapshot(absRoot, prefixLabel, savedFiles, savedDirs, pushViolation, skipSet = null) {
  const current = walkDirTree(absRoot, '', new Map(), new Set(), skipSet);
  const fmt = (rel) => (prefixLabel ? `${prefixLabel}/${rel}` : rel);
  for (const [rel, cur] of current.files.entries()) if (!savedFiles.has(rel)) { fs.rmSync(cur.absPath, { force: true }); pushViolation(fmt(rel)); }
  const existingDirs = savedDirs instanceof Set ? savedDirs : new Set(savedDirs || []);
  for (const relDir of [...current.dirs].filter((d) => !existingDirs.has(d)).sort((a, b) => b.length - a.length)) {
    fs.rmSync(path.join(absRoot, relDir), { recursive: true, force: true }); pushViolation(fmt(relDir));
  }
  for (const relDir of existingDirs) fs.mkdirSync(path.join(absRoot, relDir), { recursive: true });
  for (const [rel, saved] of savedFiles.entries()) {
    const cur = current.files.get(rel);
    if (!cur || cur.sha256 !== saved.sha256 || !fs.existsSync(saved.absPath) || !fs.lstatSync(saved.absPath).isFile()) {
      if (saved.buffer !== null) { ensureFileTargetReady(saved.absPath); fs.writeFileSync(saved.absPath, saved.buffer); }
      pushViolation(fmt(rel));
    }
  }
}

function verifyAndRestoreReadOnlySnapshot(_cwd, snapshot = []) {
  const violations = [];
  const pushViolation = (v) => { if (!violations.includes(v)) violations.push(v); };
  for (const entry of snapshot) {
    if (entry.kind === 'dir') {
      if (!fs.existsSync(entry.absPath) || !fs.lstatSync(entry.absPath).isDirectory()) {
        fs.rmSync(entry.absPath, { recursive: true, force: true }); fs.mkdirSync(entry.absPath, { recursive: true });
      }
      restoreDirTreeSnapshot(entry.absPath, entry.relPath, entry.files, entry.existingDirs, pushViolation, null);
    } else if (entry.existed) {
      if (!fs.existsSync(entry.absPath) || !fs.lstatSync(entry.absPath).isFile() || hashBuffer(fs.readFileSync(entry.absPath)) !== entry.sha256) {
        ensureFileTargetReady(entry.absPath); fs.writeFileSync(entry.absPath, entry.buffer); pushViolation(entry.relPath);
      }
    } else if (fs.existsSync(entry.absPath)) {
      fs.rmSync(entry.absPath, { recursive: true, force: true }); pushViolation(entry.relPath);
    }
  }
  return { restored: violations.length > 0, violations };
}

function captureWorkspaceDigest(cwd) {
  const absRoot = path.resolve(cwd || process.cwd());
  const { files, dirs } = walkDirTree(absRoot, '', new Map(), new Set(), WS_SKIP_DIRS);
  return { root: absRoot, files, dirs };
}

function verifyWorkspaceDigest(cwd, digest, options = {}) {
  const absRoot = digest?.root || path.resolve(cwd || process.cwd());
  if (!digest || !fs.existsSync(absRoot)) return { clean: true, restored: false, violations: [] };
  const violations = [];
  const pushViolation = (v) => { if (!violations.includes(v)) violations.push(v); };
  if (options.restore !== false) restoreDirTreeSnapshot(absRoot, '', digest.files, digest.dirs, pushViolation, WS_SKIP_DIRS);
  else {
    const current = walkDirTree(absRoot, '', new Map(), new Set(), WS_SKIP_DIRS);
    for (const rel of current.files.keys()) if (!digest.files.has(rel)) pushViolation(rel);
    for (const [rel, saved] of digest.files.entries()) if (!current.files.get(rel) || current.files.get(rel).sha256 !== saved.sha256) pushViolation(rel);
  }
  return { clean: violations.length === 0, restored: options.restore !== false && violations.length > 0, violations };
}

const isQuotaOrRateLimitError = (text = '', exitCode = 0) => exitCode !== 0 && QUOTA_ERROR_PATTERN.test(String(text));

function killSubprocessTree(child) {
  if (!child) return;
  if (process.platform === 'win32' && child.pid) {
    try { spawnSync('taskkill', ['/T', '/F', '/PID', String(child.pid)], { stdio: 'ignore', windowsHide: true }); } catch { /* ignore */ }
  } else if (child.pid) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch { /* ignore */ }
  }
  try { child.kill('SIGKILL'); } catch { /* ignore */ }
  try { child.stdout?.destroy(); child.stderr?.destroy(); } catch { /* ignore */ }
}

async function executeEngineSubprocess(engine, invocation, options = {}) {
  const start = Date.now();
  if (invocation.mode === 'queue') {
    if (invocation.queueFile && options.promptText) { fs.mkdirSync(path.dirname(invocation.queueFile), { recursive: true }); fs.writeFileSync(invocation.queueFile, options.promptText, 'utf8'); }
    const msg = `Queued handoff packet for ${engine}${invocation.queueFile ? ` at ${invocation.queueFile}` : ''}`;
    return { ok: true, queued: true, engine, exitCode: 0, stdout: msg, rawStdout: '', stderr: '', isQuotaError: false, durationMs: Date.now() - start };
  }
  if (typeof options.mockRunner === 'function') {
    const res = await options.mockRunner(engine, invocation, options);
    const [exitCode, rawStdout] = [res.exitCode ?? (res.ok === false ? 1 : 0), res.stdout || ''];
    return {
      ok: res.ok !== undefined ? Boolean(res.ok) : exitCode === 0, queued: false, engine, exitCode,
      stdout: unwrapEngineStdout(engine, rawStdout), rawStdout, stderr: res.stderr || '',
      isQuotaError: Boolean(res.isQuotaError ?? isQuotaOrRateLimitError(`${rawStdout}\n${res.stderr || ''}`, exitCode)), durationMs: res.durationMs ?? Date.now() - start,
    };
  }
  const [timeoutMs, runPlatform] = [options.timeoutMs || 300_000, options.platform || process.platform];
  const env = { ...process.env, ...(options.env || {}), CI: 'true', GIT_TERMINAL_PROMPT: '0', CLAUDE_CODE_DISABLE_BACKGROUND_TASKS: '1' };
  const target = resolveSpawnTarget(invocation.command, invocation.args, env, runPlatform);
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(target.command, target.args, { cwd: options.cwd || process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true, shell: target.shell, windowsVerbatimArguments: Boolean(target.windowsVerbatimArguments), env });
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      resolve({ ok: false, queued: false, engine, exitCode: 127, stdout: '', rawStdout: '', stderr: errText, isQuotaError: isQuotaOrRateLimitError(errText, 127), durationMs: Date.now() - start });
      return;
    }
    let [rawStdout, stderr, timedOut, settled] = ['', '', false, false];
    const finish = (payload) => { if (!settled) { settled = true; resolve(payload); } };
    const timer = setTimeout(() => { timedOut = true; killSubprocessTree(child); }, timeoutMs);
    child.stdout.on('data', (chunk) => (rawStdout += chunk.toString('utf8')));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString('utf8')));
    child.on('error', (err) => {
      clearTimeout(timer);
      const errText = err instanceof Error ? err.message : String(err);
      finish({ ok: false, queued: false, engine, exitCode: 127, stdout: unwrapEngineStdout(engine, rawStdout), rawStdout, stderr: `${stderr}\n${errText}`.trim(), isQuotaError: isQuotaOrRateLimitError(errText, 127), durationMs: Date.now() - start });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const exitCode = timedOut ? 124 : (code ?? 1);
      finish({
        ok: exitCode === 0 && !timedOut, queued: false, engine, exitCode, stdout: unwrapEngineStdout(engine, rawStdout), rawStdout,
        stderr: timedOut ? `${stderr}\nTimed out after ${timeoutMs}ms`.trim() : stderr,
        isQuotaError: isQuotaOrRateLimitError(`${rawStdout}\n${stderr}`, exitCode), durationMs: Date.now() - start,
      });
    });
  });
}

module.exports = {
  SUPPORTED_ENGINES, ENGINE_ALIASES, ENGINE_FAMILY, ROLE_AFFINITY_ORDER, normalizeEngineName,
  findExecutableOnPath, resolveSpawnTarget, probeEngines, resolveCrossFamilyEngine, buildEngineInvocation,
  unwrapEngineStdout, captureReadOnlySnapshot, verifyAndRestoreReadOnlySnapshot, captureWorkspaceDigest,
  verifyWorkspaceDigest, isQuotaOrRateLimitError, executeEngineSubprocess,
};
