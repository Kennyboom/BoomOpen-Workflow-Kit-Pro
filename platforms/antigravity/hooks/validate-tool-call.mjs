#!/usr/bin/env node

/**
 * BoomOpen Workflow Kit destructive-command guard (pre-tool hook).
 *
 * Reads the host's tool-call JSON on stdin, extracts the shell command and blocks a small set of
 * catastrophic operations (wiping a filesystem root, a home folder, a drive or a raw disk).
 * Drive roots are also recognised in their Git Bash / WSL / Cygwin form (/c, /mnt/c, /cygdrive/c),
 * '..' is resolved (~/.. is the folder above home), and `cd <root> && rm -rf *` is followed.
 * It is a safety net against accidents, not a sandbox: it does not try to stop a determined user.
 *
 * Exit codes: 0 = allowed (no output), 2 = blocked (reason on stderr + a JSON decision on stdout).
 * Exit code 2 is the blocking code for Claude Code (PreToolUse) and Gemini CLI (BeforeTool).
 *
 * Accepted payload shapes: Claude Code / Gemini CLI `tool_input.command`, Antigravity
 * `tool_args.CommandLine`, `arguments` as an object or a JSON string, `command`/`cmd`, argv arrays.
 */

import { realpathSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;
const MAX_NESTING = 6;
const EXIT_ALLOW = 0;
const EXIT_BLOCK = 2;

const WRAPPER_COMMANDS = new Set(['sudo', 'doas', 'env', 'command', 'exec', 'nohup', 'time', 'nice', 'ionice', 'busybox', 'builtin', 'xargs', 'stdbuf', 'timeout']);
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh', 'fish', 'ash', 'busybox']);
const POWERSHELLS = new Set(['powershell', 'pwsh']);
const UNIX_DELETE = new Set(['rm', 'rmdir', 'unlink', 'shred']);
const PS_DELETE = new Set(['remove-item', 'ri', 'del', 'erase', 'rd', 'rmdir', 'rm']);
const DISK_FORMAT = /^(?:mkfs(?:\.[a-z0-9_-]+)?|mke2fs|mkswap|wipefs|mkntfs|newfs(?:_[a-z]+)?|format-volume|clear-disk|initialize-disk|remove-partition)$/;
const RAW_DISK = /^\/dev\/(?:sd[a-z]|hd[a-z]|vd[a-z]|xvd[a-z]|nvme\d|mmcblk\d|disk\d|rdisk\d|md\d|mapper\/|dm-\d|loop\d)/;
const FORK_BOMB = /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/;
const UNIX_SYSTEM_DIRS = new Set(['/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64', '/opt', '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var', '/users', '/system', '/library', '/applications', '/private']);
const HOME_TOKENS = new Set([
  '~', '$home', '${home}', '$userprofile', '${userprofile}', '%userprofile%', '$env:userprofile', '%homepath%', '$env:homepath',
]);
// A home token at the start of a path, followed by the rest of the path.
const HOME_HEAD = /^(~|\$home|\$\{home\}|\$userprofile|\$\{userprofile\}|%userprofile%|\$env:userprofile|%homepath%|\$env:homepath)(\/.*)?$/;
// Git Bash (/c/...), WSL (/mnt/c/...) and Cygwin (/cygdrive/c/...) spellings of a Windows drive.
const DRIVE_MOUNT = /^\/(?:mnt\/|cygdrive\/)?([a-z])(\/.*)?$/;
// PowerShell / cmd syntax: a backslash there is a path separator, never an escape character.
const WINDOWS_SYNTAX = /[A-Za-z]:\\|(?:^|[\s"'])\.{1,2}\\|\$env:|%[A-Za-z_]+%\\|\b(?:remove-item|set-location|get-childitem|new-item|copy-item|move-item)\b/i;
const CWD_COMMANDS = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl']);
// Targets that mean "everything in the current folder" (or its parent).
const CWD_WIDE_TARGET = /^(?:\.\.?\/?)?(?:\*|\.\*)?$/;

// ---------------------------------------------------------------------------
// Payload
// ---------------------------------------------------------------------------

function asCommandText(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && value.every((part) => typeof part === 'string')) return value.join(' ').trim();
  return '';
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function extractCommand(payload) {
  if (!payload || typeof payload !== 'object') return '';
  const sources = [payload.tool_input, payload.toolInput, payload.tool_args, payload.toolArgs, parseMaybeJson(payload.arguments), payload.params, payload];
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of ['CommandLine', 'commandLine', 'command', 'cmd', 'script', 'argv', 'args']) {
      const text = asCommandText(source[key]);
      if (text) return text;
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Shell parsing
// ---------------------------------------------------------------------------

/** Split a command line into simple commands on ; & | && || and newlines (outside quotes). */
function splitSegments(command, posixEscapes) {
  const segments = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (posixEscapes && ch === '\\' && quote === '"' && i + 1 < command.length) {
        current += ch + command[++i];
        continue;
      }
      if (ch === quote) quote = null;
      current += ch;
      continue;
    }
    if (posixEscapes && ch === '\\' && i + 1 < command.length && command[i + 1] !== '\n') {
      current += ch + command[++i];
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    if (ch === ';' || ch === '&' || ch === '|' || ch === '\n' || ch === '\r') {
      segments.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  segments.push(current);
  return segments.map((s) => s.trim()).filter(Boolean);
}

/** Commands hidden in $(...), `...`, (...) and {...} groups. */
function innerCommands(command) {
  const found = [];
  for (const pattern of [/\$\(([^()]*)\)/g, /`([^`]*)`/g, /(?:^|[\s;&|])\(([^()]*)\)/g, /\{\s([^{}]*);?\s*\}/g]) {
    for (const match of command.matchAll(pattern)) found.push(match[1]);
  }
  return found;
}

/** Index of the '}' closing the '${' whose '{' is at openIndex (nesting allowed), else the last index. */
function parameterExpansionEnd(segment, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < segment.length; i++) {
    if (segment[i] === '{') depth++;
    else if (segment[i] === '}' && --depth === 0) return i;
  }
  return segment.length - 1;
}

/** POSIX-style word splitting: quotes removed, backslash escapes resolved, ${VAR} kept whole. */
function tokenize(segment, posixEscapes) {
  const words = [];
  let word = '';
  let inWord = false;
  let quote = null;
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (quote === "'") {
      if (ch === "'") quote = null;
      else word += ch;
      continue;
    }
    if (quote === '"') {
      if (ch === '"') quote = null;
      else if (posixEscapes && ch === '\\' && i + 1 < segment.length && '"\\$`'.includes(segment[i + 1])) word += segment[++i];
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      inWord = true;
    } else if (posixEscapes && ch === '\\' && i + 1 < segment.length) {
      word += segment[++i];
      inWord = true;
    } else if (ch === '$' && segment[i + 1] === '{') {
      // ${VAR} is one parameter expansion, not a brace group: keep it inside the current word.
      const end = parameterExpansionEnd(segment, i + 1);
      word += segment.slice(i, end + 1);
      i = end;
      inWord = true;
    } else if (/\s/.test(ch) || ch === '(' || ch === ')' || ch === '{' || ch === '}') {
      if (inWord) words.push(word);
      word = '';
      inWord = false;
    } else {
      word += ch;
      inWord = true;
    }
  }
  if (inWord) words.push(word);
  return words;
}

function commandName(word) {
  const base = word.replace(/\\/g, '/').split('/').pop() || '';
  return base.toLowerCase().replace(/\.(?:exe|cmd|bat|com)$/, '');
}

/** Drop sudo/env/nohup/... wrappers, their options and leading VAR=value assignments. */
function stripWrappers(words) {
  let i = 0;
  while (i < words.length) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) {
      i++;
      continue;
    }
    const name = commandName(words[i]);
    if (!WRAPPER_COMMANDS.has(name)) break;
    i++;
    while (i < words.length && words[i].startsWith('-')) {
      const takesValue = /^-(?:u|g|n|c|p|C|h|U|t)$/.test(words[i]);
      i += takesValue ? 2 : 1;
    }
    if (name === 'timeout' && i < words.length && /^\d/.test(words[i])) i++;
    if (name === 'nice' && i < words.length && /^-?\d+$/.test(words[i])) i++;
  }
  return words.slice(i);
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

/** Resolve '.' and '..' segments; depth is how far below the start the path ends (may be < 0). */
function resolveSegments(rest) {
  const stack = [];
  let depth = 0;
  for (const segment of rest.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      stack.pop();
      depth--;
    } else {
      stack.push(segment);
      depth++;
    }
  }
  return { stack, depth };
}

/** Lower-case, '/'-separated, '..' resolved; a trailing '/*' or '/.' is judged as the folder itself. */
function normalizeTarget(target) {
  let t = target.trim().toLowerCase().replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  for (;;) {
    const next = t.replace(/\/\*$/, '').replace(/\/\.$/, '');
    if (next === t) break;
    t = next;
  }
  const home = HOME_HEAD.exec(t);
  if (home) {
    const { stack, depth } = resolveSegments(home[2] || '');
    return depth <= 0 ? home[1] : [home[1], ...stack].join('/');
  }
  if (t.startsWith('$') || t.startsWith('%')) return t; // another variable: nothing to resolve
  const drive = /^([a-z]):(\/.*)?$/.exec(t);
  if (drive) return `${drive[1]}:/${resolveSegments(drive[2] || '').stack.join('/')}`;
  if (t === '' || t.startsWith('/')) return `/${resolveSegments(t).stack.join('/')}`;
  return t; // relative path
}

/** True for a filesystem root, a drive root, a home folder or a top-level system folder. */
export function isDangerousTarget(target) {
  const t = normalizeTarget(target);
  if (t === '/' || HOME_TOKENS.has(t)) return true;
  if (/^\/(?:home|users)\/[^/]+$/.test(t)) return true; // a user's home folder (Linux, macOS)
  const mounted = DRIVE_MOUNT.exec(t);
  const windowsPath = mounted ? `${mounted[1]}:/${(mounted[2] || '').replace(/^\//, '')}` : t;
  if (/^[a-z]:\/$/.test(windowsPath)) return true;
  if (/^[a-z]:\/(?:windows|users|program files(?: \(x86\))?|programdata)$/.test(windowsPath)) return true;
  if (/^[a-z]:\/users\/[^/]+$/.test(windowsPath)) return true;
  return UNIX_SYSTEM_DIRS.has(t);
}

/** A target is dangerous by itself, or because it means "everything here" in a dangerous folder. */
function isDangerousIn(target, cwdDangerous) {
  if (isDangerousTarget(target)) return true;
  const t = target.trim().replace(/\\/g, '/');
  return cwdDangerous && t !== '' && CWD_WIDE_TARGET.test(t);
}

/**
 * For cd / pushd / Set-Location: whether the new working folder is a root, home or system folder.
 * @returns {boolean|null} null when the words are not a directory change
 */
function cwdChange(words) {
  const argv = stripWrappers(words);
  if (argv.length === 0) return null;
  const name = commandName(argv[0]);
  if (!CWD_COMMANDS.has(name)) return null;
  const args = argv.slice(1).filter((a) => !/^-(?:path|literalpath|lp)$/i.test(a));
  const target = args.find((a) => !a.startsWith('-'));
  if (target === undefined) return name === 'cd'; // a bare POSIX `cd` goes home
  return isDangerousTarget(target);
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

function unixRecursive(args) {
  return args.some((a) => a === '--recursive' || /^-[A-Za-z]*[rR][A-Za-z]*$/.test(a));
}

function psRecursive(args) {
  return args.some((a) => /^-r(?:e(?:c(?:u(?:r(?:s(?:e)?)?)?)?)?)?$/i.test(a) || /^\/s$/i.test(a));
}

function positional(args) {
  return args.filter((a) => !a.startsWith('-') && !/^\/[a-z]$/i.test(a) && !/^-{1,2}$/.test(a));
}

function checkDelete(name, args, dynamicName, cwdDangerous) {
  const targets = positional(args).concat(args.filter((a) => /^-(?:path|literalpath)[:=]/i.test(a)).map((a) => a.split(/[:=]/).slice(1).join(':')));
  const pathFlag = args.findIndex((a) => /^-(?:path|literalpath|lp)$/i.test(a));
  if (pathFlag !== -1 && args[pathFlag + 1]) targets.push(args[pathFlag + 1]);
  if (!targets.some((t) => isDangerousIn(t, cwdDangerous))) return null;
  if (name === 'rm' || name === 'rmdir' || name === 'shred' || dynamicName) {
    if (unixRecursive(args) || psRecursive(args)) return { rule: 'root-delete', reason: 'recursive deletion of a filesystem root, home folder or system folder' };
  }
  if (PS_DELETE.has(name) && psRecursive(args)) {
    return { rule: 'root-delete', reason: 'recursive deletion of a drive root, home folder or system folder' };
  }
  if ((name === 'del' || name === 'erase') && args.some((a) => /^\/s$/i.test(a))) {
    return { rule: 'root-delete', reason: 'recursive deletion of a drive root' };
  }
  return null;
}

function checkSimpleCommand(words, depth, cwdDangerous = false) {
  const argv = stripWrappers(words);
  if (argv.length === 0) return null;
  const rawName = argv[0];
  const name = commandName(rawName);
  const args = argv.slice(1);
  const dynamicName = /[$`]/.test(rawName);

  if (SHELLS.has(name) || name === 'eval') {
    const flagIndex = args.findIndex((a) => /^-[a-z]*c$/i.test(a));
    const script = name === 'eval' ? args.join(' ') : flagIndex !== -1 ? args[flagIndex + 1] : null;
    if (script) return evaluateNested(script, depth + 1);
  }
  if (name === 'cmd') {
    const flagIndex = args.findIndex((a) => /^\/[ck]$/i.test(a));
    if (flagIndex !== -1) return evaluateNested(args.slice(flagIndex + 1).join(' '), depth + 1);
  }
  if (POWERSHELLS.has(name)) {
    const encIndex = args.findIndex((a) => /^-e(?:nc(?:odedcommand)?)?$/i.test(a));
    if (encIndex !== -1 && args[encIndex + 1]) {
      return evaluateNested(Buffer.from(args[encIndex + 1], 'base64').toString('utf16le'), depth + 1);
    }
    const cmdIndex = args.findIndex((a) => /^-c(?:ommand)?$/i.test(a));
    if (cmdIndex !== -1) return evaluateNested(args.slice(cmdIndex + 1).join(' '), depth + 1);
  }

  if (UNIX_DELETE.has(name) || PS_DELETE.has(name) || dynamicName) {
    const hit = checkDelete(name, args, dynamicName, cwdDangerous);
    if (hit) return hit;
  }
  if (DISK_FORMAT.test(name)) return { rule: 'filesystem-format', reason: 'filesystem or disk formatting command' };
  if (name === 'format' && args.some((a) => /^[a-z]:\\?$/i.test(a))) return { rule: 'drive-format', reason: 'Windows drive format' };
  if (name === 'dd' && args.some((a) => /^of=/i.test(a) && RAW_DISK.test(a.slice(3)))) return { rule: 'raw-disk-overwrite', reason: 'raw disk overwrite' };
  if (name === 'find' && args.some((a) => isDangerousIn(a, cwdDangerous)) && args.some((a) => a === '-delete' || a === '-exec' || a === '-execdir')) {
    return { rule: 'root-delete', reason: 'find deleting from a filesystem root or home folder' };
  }
  if ((name === 'chmod' || name === 'chown' || name === 'chgrp') && unixRecursive(args) && positional(args).slice(1).some(isDangerousTarget)) {
    return { rule: 'root-permissions', reason: 'recursive permission change on a filesystem root or system folder' };
  }
  return null;
}

function evaluateNested(command, depth) {
  if (depth > MAX_NESTING) return { rule: 'nesting', reason: 'command nesting too deep to verify' };
  if (FORK_BOMB.test(command)) return { rule: 'fork-bomb', reason: 'fork bomb' };
  if (/>\s*\/dev\/(?:sd[a-z]|nvme\d|hd[a-z]|vd[a-z]|xvd[a-z]|mmcblk\d|disk\d)/.test(command)) {
    return { rule: 'raw-disk-overwrite', reason: 'redirect onto a raw disk device' };
  }
  for (const inner of innerCommands(command)) {
    const hit = evaluateNested(inner, depth + 1);
    if (hit) return hit;
  }
  // Windows paths (C:\..., .\dist) and PowerShell ($env:USERPROFILE\) use the backslash as a
  // separator, not as an escape character.
  const posixEscapes = !WINDOWS_SYNTAX.test(command);
  let cwdDangerous = false;
  for (const segment of splitSegments(command, posixEscapes)) {
    const words = tokenize(segment, posixEscapes);
    const changed = cwdChange(words);
    if (changed !== null) {
      cwdDangerous = changed;
      continue;
    }
    const hit = checkSimpleCommand(words, depth, cwdDangerous);
    if (hit) return hit;
  }
  return null;
}

export function evaluateCommand(command) {
  const hit = typeof command === 'string' && command.trim() ? evaluateNested(command, 0) : null;
  if (hit) return { allowed: false, rule: hit.rule, reason: hit.reason };
  return { allowed: true, rule: null, reason: 'no destructive command pattern matched' };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    process.stdin.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_PAYLOAD_BYTES) {
        reject(new Error(`hook payload exceeds ${MAX_PAYLOAD_BYTES} bytes`));
        process.stdin.destroy();
        return;
      }
      chunks.push(chunk);
    });
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

function block(reason) {
  const message = `BLOCKED by BoomOpen Workflow Kit: ${reason}.`;
  process.stderr.write(`${message}\n`);
  process.stdout.write(
    JSON.stringify({
      decision: 'deny',
      reason: message,
      permission: 'deny',
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: message },
    }) + '\n'
  );
  return EXIT_BLOCK;
}

export async function main() {
  let raw;
  try {
    raw = await readStdin();
  } catch (error) {
    // Fail closed: an unreadable or oversized payload cannot be verified.
    return block(error instanceof Error ? error.message : String(error));
  }
  let command;
  try {
    command = extractCommand(JSON.parse(raw || '{}'));
  } catch {
    command = raw.trim(); // not JSON: treat the raw input as the command line
  }
  if (!command) return EXIT_ALLOW;
  const result = evaluateCommand(command);
  return result.allowed ? EXIT_ALLOW : block(result.reason);
}

function isEntryPoint() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  process.exitCode = await main();
}
