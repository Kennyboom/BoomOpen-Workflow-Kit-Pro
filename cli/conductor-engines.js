'use strict';

/**
 * Multi-Engine Conductor Primitives (`cli/conductor-engines.js`).
 *
 * Provides cross-platform CLI engine probing, non-interactive subprocess invocation
 * builders, SHA-256 read-only file snapshot/restore guards, and quota/rate-limit
 * failover detection across Claude Code, OpenAI Codex, Antigravity (Gemini), Cursor, and Copilot.
 */

const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SUPPORTED_ENGINES = ['claude', 'codex', 'antigravity', 'cursor', 'copilot'];

const ENGINE_ALIASES = {
  gemini: 'antigravity',
  agy: 'antigravity',
  'claude-code': 'claude',
  'cursor-agent': 'cursor',
  'gh-copilot': 'copilot',
};

const ENGINE_FAMILY = {
  claude: 'anthropic',
  codex: 'openai',
  antigravity: 'google',
  cursor: 'cursor',
  copilot: 'github',
};

const ENGINE_BIN_CANDIDATES = {
  claude: ['claude'],
  codex: ['codex'],
  antigravity: ['agy', 'gemini'],
  cursor: ['cursor-agent'],
  copilot: ['copilot'],
};

const ROLE_AFFINITY_ORDER = {
  researcher: ['antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  planner: ['claude', 'antigravity', 'codex', 'cursor', 'copilot'],
  coder: ['codex', 'antigravity', 'claude', 'cursor', 'copilot'],
  debugger: ['codex', 'claude', 'antigravity', 'cursor', 'copilot'],
  reviewer: ['codex', 'claude', 'antigravity', 'cursor', 'copilot'],
};

const QUOTA_ERROR_PATTERN =
  /\b(?:429|529)\b|rate[-_ ]?limit|quota exceeded|insufficient_quota|overloaded|too many requests|credit balance|usage limit/i;

function normalizeEngineName(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const lower = raw.trim().toLowerCase();
  const mapped = ENGINE_ALIASES[lower] || lower;
  return SUPPORTED_ENGINES.includes(mapped) ? mapped : null;
}

function findExecutableOnPath(binName, env = process.env, platform = process.platform) {
  if (!binName || typeof binName !== 'string') return null;
  if ((binName.includes('/') || binName.includes('\\')) && fs.existsSync(binName)) {
    try {
      if (fs.statSync(binName).isFile()) return binName;
    } catch {
      // fall through
    }
  }
  const pathVar = env.PATH || env.Path || '';
  const dirs = pathVar.split(platform === 'win32' ? ';' : ':').filter(Boolean);
  const hasExt = path.extname(binName) !== '';
  const exts = platform === 'win32' ? (hasExt ? [''] : ['.exe', '.cmd', '.bat']) : [''];
  for (const dir of dirs) {
    for (const ext of exts) {
      const candidate = path.join(dir, `${binName}${ext}`);
      try {
        const stat = fs.statSync(candidate, { throwIfNoEntry: false });
        if (stat && stat.isFile()) return candidate;
      } catch {
        // Ignore unreadable PATH entries
      }
    }
  }
  return null;
}

function resolveSpawnTarget(command, args = [], env = process.env, platform = process.platform) {
  if (platform !== 'win32' || !command) return { command, args, shell: false };
  const resolved = findExecutableOnPath(command, env, platform) || command;
  if (/\.(?:cmd|bat)$/i.test(resolved)) {
    try {
      const shimText = fs.readFileSync(resolved, 'utf8');
      const m = /(?:%dp0%|%~dp0)[\\/]([^"\r\n]+?\.(?:[cm]?js))\b/i.exec(shimText);
      if (m) {
        const jsPath = path.resolve(path.dirname(resolved), m[1].replace(/[\\/]+/g, path.sep));
        if (fs.existsSync(jsPath) && fs.statSync(jsPath).isFile()) {
          return { command: process.execPath, args: [jsPath, ...args], shell: false };
        }
      }
    } catch {
      // Fall back to shell execution for non-Node or unreadable .cmd/.bat shims
    }
    return { command: resolved, args, shell: true };
  }
  return { command: resolved, args, shell: false };
}

function probeEngines(options = {}) {
  if (options.mockProbes && typeof options.mockProbes === 'object') {
    const out = {};
    for (const engine of SUPPORTED_ENGINES) {
      const mock = options.mockProbes[engine] || {};
      const defaultBin = ENGINE_BIN_CANDIDATES[engine][0];
      const bin = mock.bin || (mock.available ? defaultBin : null);
      out[engine] = {
        available: Boolean(mock.available),
        bin,
        resolvedPath: mock.resolvedPath || bin,
        family: ENGINE_FAMILY[engine],
        fallbackMode: engine === 'cursor' || engine === 'copilot' ? 'queue' : 'cli',
      };
    }
    return out;
  }

  const env = options.env || process.env;
  const platform = options.platform || process.platform;
  const probes = {};
  for (const engine of SUPPORTED_ENGINES) {
    let resolvedBin = null;
    let resolvedPath = null;
    for (const candidate of ENGINE_BIN_CANDIDATES[engine]) {
      const found = findExecutableOnPath(candidate, env, platform);
      if (found) {
        resolvedBin = candidate;
        resolvedPath = found;
        break;
      }
    }
    probes[engine] = {
      available: Boolean(resolvedBin),
      bin: resolvedBin,
      resolvedPath,
      family: ENGINE_FAMILY[engine],
      fallbackMode: engine === 'cursor' || engine === 'copilot' ? 'queue' : 'cli',
    };
  }
  return probes;
}

function resolveCrossFamilyEngine(authorEngine, installedEngines = [], role = 'reviewer') {
  const normAuthor = normalizeEngineName(authorEngine);
  const authorFamily = normAuthor ? ENGINE_FAMILY[normAuthor] : null;
  const affinity = ROLE_AFFINITY_ORDER[role] || SUPPORTED_ENGINES;
  const availableSet = new Set(installedEngines.map(normalizeEngineName).filter(Boolean));

  for (const candidate of affinity) {
    if (!availableSet.has(candidate)) continue;
    if (!authorFamily || ENGINE_FAMILY[candidate] !== authorFamily) return candidate;
  }
  for (const candidate of affinity) {
    if (availableSet.has(candidate)) return candidate;
  }
  return normAuthor || 'claude';
}

function buildEngineInvocation(engine, promptFilePath, options = {}) {
  const norm = normalizeEngineName(engine);
  if (!norm) throw new Error(`Unsupported engine "${engine}"`);
  const readOnly = Boolean(options.readOnly);
  const available = options.available !== undefined ? Boolean(options.available) : true;
  const bin = options.bin || ENGINE_BIN_CANDIDATES[norm][0];
  const instruction = `Read and strictly execute the task in ${promptFilePath}`;

  if (norm === 'claude') {
    const args = ['-p', instruction, '--output-format', 'json'];
    if (readOnly) args.push('--allowedTools', 'Read,Grep,Glob,WebSearch,WebFetch');
    else args.push('--dangerously-skip-permissions');
    return { engine: norm, command: bin, args, mode: 'cli', readOnly };
  }
  if (norm === 'codex') {
    const sandbox = readOnly ? 'read-only' : 'workspace-write';
    return {
      engine: norm,
      command: bin,
      args: ['exec', '--full-auto', '--json', '-s', sandbox, instruction],
      mode: 'cli',
      readOnly,
    };
  }
  if (norm === 'antigravity') {
    return {
      engine: norm,
      command: bin,
      args: ['-p', instruction, '--mode', 'auto', '--output-format', 'json'],
      mode: 'cli',
      readOnly,
    };
  }
  if (norm === 'cursor') {
    if (available) {
      return { engine: norm, command: bin, args: ['-p', instruction], mode: 'cli', readOnly };
    }
    return { engine: norm, command: null, args: [], mode: 'queue', queueFile: options.queueFile || null, readOnly };
  }
  if (available) {
    return { engine: norm, command: bin, args: ['-p', instruction, '-s'], mode: 'cli', readOnly };
  }
  return { engine: norm, command: null, args: [], mode: 'queue', queueFile: options.queueFile || null, readOnly };
}

function hashBuffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function captureReadOnlySnapshot(cwd, relPaths = []) {
  const snapshot = [];
  for (const relPath of relPaths) {
    if (!relPath) continue;
    const absPath = path.resolve(cwd, relPath);
    if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
      const buffer = fs.readFileSync(absPath);
      snapshot.push({ relPath, absPath, existed: true, sha256: hashBuffer(buffer), buffer });
    } else {
      snapshot.push({ relPath, absPath, existed: false, sha256: null, buffer: null });
    }
  }
  return snapshot;
}

function verifyAndRestoreReadOnlySnapshot(cwd, snapshot = []) {
  const violations = [];
  for (const entry of snapshot) {
    const existsNow = fs.existsSync(entry.absPath) && fs.statSync(entry.absPath).isFile();
    if (entry.existed) {
      if (!existsNow) {
        fs.mkdirSync(path.dirname(entry.absPath), { recursive: true });
        fs.writeFileSync(entry.absPath, entry.buffer);
        violations.push(entry.relPath);
      } else {
        const currentBuf = fs.readFileSync(entry.absPath);
        if (hashBuffer(currentBuf) !== entry.sha256) {
          fs.writeFileSync(entry.absPath, entry.buffer);
          violations.push(entry.relPath);
        }
      }
    } else if (existsNow) {
      fs.rmSync(entry.absPath, { force: true });
      violations.push(entry.relPath);
    }
  }
  return { restored: violations.length > 0, violations };
}

function isQuotaOrRateLimitError(text = '', exitCode = 0) {
  if (exitCode === 0) return false;
  return QUOTA_ERROR_PATTERN.test(String(text));
}

async function executeEngineSubprocess(engine, invocation, options = {}) {
  const start = Date.now();
  if (invocation.mode === 'queue') {
    if (invocation.queueFile && options.promptText) {
      fs.mkdirSync(path.dirname(invocation.queueFile), { recursive: true });
      fs.writeFileSync(invocation.queueFile, options.promptText, 'utf8');
    }
    return {
      ok: true,
      queued: true,
      engine,
      exitCode: 0,
      stdout: `Queued handoff packet for ${engine}${invocation.queueFile ? ` at ${invocation.queueFile}` : ''}`,
      stderr: '',
      isQuotaError: false,
      durationMs: Date.now() - start,
    };
  }

  if (typeof options.mockRunner === 'function') {
    const res = await options.mockRunner(engine, invocation, options);
    const exitCode = res.exitCode ?? (res.ok === false ? 1 : 0);
    const combined = `${res.stdout || ''}\n${res.stderr || ''}`;
    return {
      ok: res.ok !== undefined ? Boolean(res.ok) : exitCode === 0,
      queued: false,
      engine,
      exitCode,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
      isQuotaError: Boolean(res.isQuotaError ?? isQuotaOrRateLimitError(combined, exitCode)),
      durationMs: res.durationMs ?? Date.now() - start,
    };
  }

  const timeoutMs = options.timeoutMs || 300_000;
  const env = {
    ...process.env,
    ...(options.env || {}),
    CI: 'true',
    GIT_TERMINAL_PROMPT: '0',
    CLAUDE_CODE_DISABLE_BACKGROUND_TASKS: '1',
  };
  const target = resolveSpawnTarget(invocation.command, invocation.args, env, options.platform || process.platform);
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(target.command, target.args, {
        cwd: options.cwd || process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: target.shell,
        env,
      });
    } catch (err) {
      const errText = err instanceof Error ? err.message : String(err);
      resolve({
        ok: false,
        queued: false,
        engine,
        exitCode: 127,
        stdout: '',
        stderr: errText,
        isQuotaError: isQuotaOrRateLimitError(errText, 127),
        durationMs: Date.now() - start,
      });
      return;
    }
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => (stdout += chunk.toString('utf8')));
    child.stderr.on('data', (chunk) => (stderr += chunk.toString('utf8')));
    child.on('error', (err) => {
      clearTimeout(timer);
      const errText = err instanceof Error ? err.message : String(err);
      resolve({
        ok: false,
        queued: false,
        engine,
        exitCode: 127,
        stdout,
        stderr: `${stderr}\n${errText}`.trim(),
        isQuotaError: isQuotaOrRateLimitError(errText, 127),
        durationMs: Date.now() - start,
      });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const exitCode = timedOut ? 124 : (code ?? 1);
      const combined = `${stdout}\n${stderr}`;
      resolve({
        ok: exitCode === 0 && !timedOut,
        queued: false,
        engine,
        exitCode,
        stdout,
        stderr: timedOut ? `${stderr}\nTimed out after ${timeoutMs}ms`.trim() : stderr,
        isQuotaError: isQuotaOrRateLimitError(combined, exitCode),
        durationMs: Date.now() - start,
      });
    });
  });
}

module.exports = {
  SUPPORTED_ENGINES,
  ENGINE_ALIASES,
  ENGINE_FAMILY,
  ROLE_AFFINITY_ORDER,
  normalizeEngineName,
  findExecutableOnPath,
  resolveSpawnTarget,
  probeEngines,
  resolveCrossFamilyEngine,
  buildEngineInvocation,
  captureReadOnlySnapshot,
  verifyAndRestoreReadOnlySnapshot,
  isQuotaOrRateLimitError,
  executeEngineSubprocess,
};
