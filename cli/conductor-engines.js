'use strict';

/**
 * Multi-Engine Conductor Primitives (`cli/conductor-engines.js`).
 *
 * Provides cross-platform CLI engine probing, non-interactive subprocess invocation
 * builders, Windows `.cmd`/`.bat` shell-safe execution, JSON/JSONL stdout unwrapping,
 * SHA-256 read-only file & directory snapshot/restore guards, and quota failover detection.
 */

const { spawn } = require('node:child_process');
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

function normalizeEngineName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const mapped = ENGINE_ALIASES[raw.trim().toLowerCase()] || raw.trim().toLowerCase();
  return SUPPORTED_ENGINES.includes(mapped) ? mapped : null;
}

function findExecutableOnPath(binName, env = process.env, platform = process.platform) {
  if (!binName || typeof binName !== 'string') return null;
  if ((binName.includes('/') || binName.includes('\\')) && fs.existsSync(binName)) {
    try { if (fs.statSync(binName).isFile()) return binName; } catch { /* fall through */ }
  }
  const dirs = (env.PATH || env.Path || '').split(platform === 'win32' ? ';' : ':').filter(Boolean);
  const exts = platform === 'win32' ? (path.extname(binName) !== '' ? [''] : ['.exe', '.cmd', '.bat']) : [''];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, `${binName}${ext}`);
      try {
        const stat = fs.statSync(candidate, { throwIfNoEntry: false });
        if (stat && stat.isFile()) return candidate;
      } catch { /* ignore unreadable PATH entries */ }
    }
  }
  return null;
}

function quoteWinCmdArg(arg) {
  const escaped = String(arg)
    .replace(/(\\*)"/g, '$1$1""')
    .replace(/(\\+)$/, '$1$1')
    .replace(/%/g, '%%');
  return `"${escaped}"`;
}

function resolveSpawnTarget(command, args = [], env = process.env, platform = process.platform) {
  if (platform !== 'win32' || !command) return { command, args, shell: false, windowsVerbatimArguments: false };
  const resolved = findExecutableOnPath(command, env, platform) || command;
  if (/\.(?:cmd|bat)$/i.test(resolved)) {
    try {
      const shimText = fs.readFileSync(resolved, 'utf8');
      const m = /(?:%dp0%|%~dp0)[\\/]([^"\r\n]+?\.(?:[cm]?js))\b/i.exec(shimText);
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
  const env = options.env || process.env;
  const platform = options.platform || process.platform;
  const probes = {};
  for (const engine of SUPPORTED_ENGINES) {
    const fallbackMode = engine === 'cursor' || engine === 'copilot' ? 'queue' : 'cli';
    if (mockProbes) {
      const mock = mockProbes[engine] || {};
      const bin = mock.bin || (mock.available ? ENGINE_BIN_CANDIDATES[engine][0] : null);
      probes[engine] = { available: Boolean(mock.available), bin, resolvedPath: mock.resolvedPath || bin, family: ENGINE_FAMILY[engine], fallbackMode };
      continue;
    }
    let resolvedBin = null;
    let resolvedPath = null;
    for (const candidate of ENGINE_BIN_CANDIDATES[engine]) {
      const found = findExecutableOnPath(candidate, env, platform);
      if (found) { resolvedBin = candidate; resolvedPath = found; break; }
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
  for (const candidate of affinity) {
    if (availableSet.has(candidate) && (!authorFamily || ENGINE_FAMILY[candidate] !== authorFamily)) return candidate;
  }
  for (const candidate of affinity) if (availableSet.has(candidate)) return candidate;
  return normAuthor || 'claude';
}

function buildEngineInvocation(engine, promptFilePath, options = {}) {
  const norm = normalizeEngineName(engine);
  if (!norm) throw new Error(`Unsupported engine "${engine}"`);
  const readOnly = Boolean(options.readOnly);
  const available = options.available !== undefined ? Boolean(options.available) : true;
  const bin = options.bin || ENGINE_BIN_CANDIDATES[norm][0];
  const instruction = `Read and strictly execute the task in "${promptFilePath}"`;

  if (norm === 'claude') {
    const perm = readOnly ? ['--allowedTools', 'Read,Grep,Glob,WebSearch,WebFetch'] : ['--dangerously-skip-permissions'];
    return { engine: norm, command: bin, args: ['-p', instruction, '--output-format', 'json', ...perm], mode: 'cli', readOnly };
  }
  if (norm === 'codex') {
    return { engine: norm, command: bin, args: ['exec', '--full-auto', '--json', '-s', readOnly ? 'read-only' : 'workspace-write', instruction], mode: 'cli', readOnly };
  }
  if (norm === 'antigravity') {
    return { engine: norm, command: bin, args: ['-p', instruction, '--mode', 'auto', '--output-format', 'json'], mode: 'cli', readOnly };
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

function unwrapEngineStdout(_engine, rawStdout) {
  const raw = String(rawStdout || '');
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return raw;
  try {
    const parsed = JSON.parse(trimmed);
    const single = extractJsonMessageText(parsed);
    if (single !== null) return single;
    if (Array.isArray(parsed)) {
      const joined = parsed.map(extractJsonMessageText).filter(Boolean).join('\n\n');
      if (joined) return joined;
    }
    return raw;
  } catch {
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.every((l) => l.startsWith('{'))) return raw;
    const chunks = [];
    for (const line of lines) {
      try {
        const txt = extractJsonMessageText(JSON.parse(line));
        if (txt) chunks.push(txt);
      } catch { return raw; }
    }
    return chunks.join('\n\n');
  }
}

function hashBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function walkDirFiles(rootDir, prefix = '', map = new Map()) {
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) walkDirFiles(abs, rel, map);
    else if (entry.isFile()) {
      const buffer = fs.readFileSync(abs);
      map.set(rel, { absPath: abs, sha256: hashBuffer(buffer), buffer });
    }
  }
  return map;
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
        const normRel = relPath.replace(/\\/g, '/').replace(/\/+$/, '');
        snapshot.push({ kind: 'dir', relPath: normRel, absPath, existed: true, files: walkDirFiles(absPath) });
        continue;
      }
    }
    snapshot.push({ kind: 'missing', relPath, absPath, existed: false, sha256: null, buffer: null });
  }
  return snapshot;
}

function verifyAndRestoreReadOnlySnapshot(_cwd, snapshot = []) {
  const violations = [];
  for (const entry of snapshot) {
    if (entry.kind === 'dir') {
      if (!fs.existsSync(entry.absPath) || !fs.statSync(entry.absPath).isDirectory()) {
        fs.rmSync(entry.absPath, { force: true });
        fs.mkdirSync(entry.absPath, { recursive: true });
      }
      const current = walkDirFiles(entry.absPath);
      for (const [rel, cur] of current.entries()) {
        if (!entry.files.has(rel)) { fs.rmSync(cur.absPath, { force: true }); violations.push(`${entry.relPath}/${rel}`); }
      }
      for (const [rel, saved] of entry.files.entries()) {
        const cur = current.get(rel);
        if (!cur || cur.sha256 !== saved.sha256) {
          fs.mkdirSync(path.dirname(saved.absPath), { recursive: true });
          fs.writeFileSync(saved.absPath, saved.buffer);
          violations.push(`${entry.relPath}/${rel}`);
        }
      }
      continue;
    }
    if (entry.existed) {
      const existsFile = fs.existsSync(entry.absPath) && fs.statSync(entry.absPath).isFile();
      if (!existsFile) {
        if (fs.existsSync(entry.absPath)) fs.rmSync(entry.absPath, { recursive: true, force: true });
        fs.mkdirSync(path.dirname(entry.absPath), { recursive: true });
        fs.writeFileSync(entry.absPath, entry.buffer);
        violations.push(entry.relPath);
      } else if (hashBuffer(fs.readFileSync(entry.absPath)) !== entry.sha256) {
        fs.writeFileSync(entry.absPath, entry.buffer);
        violations.push(entry.relPath);
      }
    } else if (fs.existsSync(entry.absPath)) {
      fs.rmSync(entry.absPath, { recursive: true, force: true });
      violations.push(entry.relPath);
    }
  }
  return { restored: violations.length > 0, violations };
}

function isQuotaOrRateLimitError(text = '', exitCode = 0) {
  return exitCode !== 0 && QUOTA_ERROR_PATTERN.test(String(text));
}

async function executeEngineSubprocess(engine, invocation, options = {}) {
  const start = Date.now();
  if (invocation.mode === 'queue') {
    if (invocation.queueFile && options.promptText) {
      fs.mkdirSync(path.dirname(invocation.queueFile), { recursive: true });
      fs.writeFileSync(invocation.queueFile, options.promptText, 'utf8');
    }
    const msg = `Queued handoff packet for ${engine}${invocation.queueFile ? ` at ${invocation.queueFile}` : ''}`;
    return { ok: true, queued: true, engine, exitCode: 0, stdout: msg, rawStdout: '', stderr: '', isQuotaError: false, durationMs: Date.now() - start };
  }
  if (typeof options.mockRunner === 'function') {
    const res = await options.mockRunner(engine, invocation, options);
    const exitCode = res.exitCode ?? (res.ok === false ? 1 : 0);
    const rawStdout = res.stdout || '';
    return {
      ok: res.ok !== undefined ? Boolean(res.ok) : exitCode === 0,
      queued: false, engine, exitCode, stdout: unwrapEngineStdout(engine, rawStdout), rawStdout, stderr: res.stderr || '',
      isQuotaError: Boolean(res.isQuotaError ?? isQuotaOrRateLimitError(`${rawStdout}\n${res.stderr || ''}`, exitCode)),
      durationMs: res.durationMs ?? Date.now() - start,
    };
  }
  const timeoutMs = options.timeoutMs || 300_000;
  const env = { ...process.env, ...(options.env || {}), CI: 'true', GIT_TERMINAL_PROMPT: '0', CLAUDE_CODE_DISABLE_BACKGROUND_TASKS: '1' };
  const target = resolveSpawnTarget(invocation.command, invocation.args, env, options.platform || process.platform);
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(target.command, target.args, {
        cwd: options.cwd || process.cwd(), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
        shell: target.shell, windowsVerbatimArguments: Boolean(target.windowsVerbatimArguments), env,
      });
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      resolve({ ok: false, queued: false, engine, exitCode: 127, stdout: '', rawStdout: '', stderr: errText, isQuotaError: isQuotaOrRateLimitError(errText, 127), durationMs: Date.now() - start });
      return;
    }
    let [rawStdout, stderr, timedOut] = ['', '', false];
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, timeoutMs);
    child.stdout.on('data', (chunk) => (rawStdout += chunk.toString('utf8')));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString('utf8')));
    child.on('error', (err) => {
      clearTimeout(timer);
      const errText = err instanceof Error ? err.message : String(err);
      resolve({ ok: false, queued: false, engine, exitCode: 127, stdout: unwrapEngineStdout(engine, rawStdout), rawStdout, stderr: `${stderr}\n${errText}`.trim(), isQuotaError: isQuotaOrRateLimitError(errText, 127), durationMs: Date.now() - start });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const exitCode = timedOut ? 124 : (code ?? 1);
      resolve({
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
  unwrapEngineStdout, captureReadOnlySnapshot, verifyAndRestoreReadOnlySnapshot, isQuotaOrRateLimitError, executeEngineSubprocess,
};
