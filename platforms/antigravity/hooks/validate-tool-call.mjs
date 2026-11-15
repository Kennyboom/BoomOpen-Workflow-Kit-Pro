#!/usr/bin/env node

/**
 * BoomOpen Workflow Kit destructive-command guard (pre-tool hook).
 * Reads tool-call JSON on stdin, extracts the shell command and blocks catastrophic operations
 * across POSIX shells, Windows cmd.exe and PowerShell. Exit 0 = allow, 2 = block.
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
const CMD_DELETE = new Set(['del', 'erase', 'rd', 'rmdir']);
const DISK_FORMAT = /^(?:mkfs(?:\.[a-z0-9_-]+)?|mke2fs|mkswap|wipefs|mkntfs|newfs(?:_[a-z]+)?|format-volume|clear-disk|initialize-disk|remove-partition)$/;
const RAW_DISK = /^\/dev\/(?:sd[a-z]|hd[a-z]|vd[a-z]|xvd[a-z]|nvme\d|mmcblk\d|disk\d|rdisk\d|md\d|mapper\/|dm-\d|loop\d)/;
const RAW_REDIRECT = />\s*\/dev\/(?:sd[a-z]|nvme\d|hd[a-z]|vd[a-z]|xvd[a-z]|mmcblk\d|disk\d)/;
const FORK_BOMB = /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/;
const UNIX_SYSTEM_DIRS = new Set(['/bin', '/boot', '/dev', '/etc', '/home', '/lib', '/lib64', '/opt', '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var', '/users', '/system', '/library', '/applications', '/private']);
const HOME_TOKENS = new Set(['~', '$home', '${home}', '$userprofile', '${userprofile}', '%userprofile%', '$env:userprofile', '%homepath%', '$env:homepath']);
const HOME_HEAD = /^(~|\$home|\$\{home\}|\$userprofile|\$\{userprofile\}|%userprofile%|\$env:userprofile|%homepath%|\$env:homepath)(\/.*)?$/;
const DRIVE_MOUNT = /^\/(?:mnt\/|cygdrive\/)?([a-z])(\/.*)?$/;
const WINDOWS_SYNTAX = /[A-Za-z]:\\|(?:^|[\s"'])\.{1,2}\\|\$env:|%[A-Za-z_][A-Za-z0-9_]*%|\b(?:remove-item|set-location|get-childitem|new-item|copy-item|move-item)\b/i;
const CWD_COMMANDS = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl']);
const CWD_WIDE_TARGET = /^(?:\.\.?\/?)?(?:\*|\.\*)?$/;
const CMD_SLASH_FLAGS = /^(?:\/[a-z])+$/i;
const CMD_RECURSIVE_S = /(?:^|\/)s(?:\/|$)/i;
const PS_VALUE_FLAGS = /^-(?:ex(?:ecutionpolicy)?|ep|w(?:indowstyle)?|in(?:putformat)?|if|o(?:utputformat)?|of|config(?:urationname)?|v(?:ersion)?)$/i;

function asCommandText(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && value.every((part) => typeof part === 'string')) return value.join(' ').trim();
  return '';
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return {}; }
}

export function extractCommand(payload) {
  if (!payload || typeof payload !== 'object') return '';
  const tc = payload.toolCall && typeof payload.toolCall === 'object' ? payload.toolCall : null;
  const sources = [tc?.args, parseMaybeJson(tc?.arguments), payload.tool_input, payload.toolInput, payload.tool_args, payload.toolArgs, parseMaybeJson(payload.arguments), payload.params, payload];
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;
    for (const key of ['CommandLine', 'commandLine', 'command', 'cmd', 'script', 'argv', 'args']) {
      const text = asCommandText(source[key]);
      if (text) return text;
    }
  }
  return '';
}

/** Find matching closing delimiter ('`', ')' or '}') respecting quotes and escapes. */
function findBalancedEnd(text, from, openChar, closeChar, posixEscapes) {
  let depth = 1;
  let quote = null;
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote === "'") { if (ch === "'") quote = null; continue; }
    if (quote === '"') {
      if ((posixEscapes && ch === '\\') || (!posixEscapes && ch === '`')) { i++; continue; }
      if (ch === '"') quote = null;
      continue;
    }
    if (posixEscapes && ch === '\\') { i++; continue; }
    if (ch === "'" || ch === '"') { quote = ch; continue; }
    if (openChar && ch === openChar) depth++;
    else if (ch === closeChar && --depth === 0) return i;
  }
  return -1;
}

/** Mask quoted literals and extract only real shell substitutions/subshells/groups. */
function scanCommand(command, posixEscapes) {
  let unquoted = '';
  const subs = [];
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote === "'") {
      unquoted += ch === "'" ? ((quote = null), "'") : ' ';
      continue;
    }
    if (quote === '"') {
      if ((posixEscapes && ch === '\\') || (!posixEscapes && ch === '`')) { i++; unquoted += '  '; continue; }
      if (ch === '$' && command[i + 1] === '(') {
        const end = findBalancedEnd(command, i + 2, '(', ')', posixEscapes);
        if (end !== -1) { subs.push(command.slice(i + 2, end)); unquoted += ' '; i = end; continue; }
      }
      if (posixEscapes && ch === '`') {
        const end = findBalancedEnd(command, i + 1, null, '`', true);
        if (end !== -1) { subs.push(command.slice(i + 1, end)); unquoted += ' '; i = end; continue; }
      }
      unquoted += ch === '"' ? ((quote = null), '"') : ' ';
      continue;
    }
    if (posixEscapes && ch === '\\' && i + 1 < command.length && command[i + 1] !== '\n') { unquoted += '_'; i++; continue; }
    if (ch === "'" || ch === '"') { quote = ch; unquoted += ch; continue; }
    if (ch === '$' && command[i + 1] === '(') {
      const end = findBalancedEnd(command, i + 2, '(', ')', posixEscapes);
      if (end !== -1) { subs.push(command.slice(i + 2, end)); unquoted += '$()'; i = end; continue; }
    }
    if (posixEscapes && ch === '`') {
      const end = findBalancedEnd(command, i + 1, null, '`', true);
      if (end !== -1) { subs.push(command.slice(i + 1, end)); unquoted += '``'; i = end; continue; }
    }
    if (ch === '(' && (i === 0 || /[\s;&|]/.test(command[i - 1]))) {
      const end = findBalancedEnd(command, i + 1, '(', ')', posixEscapes);
      if (end !== -1 && command.slice(i + 1, end).trim()) subs.push(command.slice(i + 1, end));
    } else if (ch === '{' && /\s/.test(command[i + 1] || '')) {
      const end = findBalancedEnd(command, i + 1, '{', '}', posixEscapes);
      if (end !== -1) subs.push(command.slice(i + 1, end).replace(/;\s*$/, ''));
    }
    unquoted += ch;
  }
  return { unquoted, subs };
}

/** Split a command line into simple commands on ; & | && || and newlines (outside quotes). */
function splitSegments(command, posixEscapes) {
  const segments = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (posixEscapes && ch === '\\' && quote === '"' && i + 1 < command.length) { current += ch + command[++i]; continue; }
      if (ch === quote) quote = null;
      current += ch;
      continue;
    }
    if (posixEscapes && ch === '\\' && i + 1 < command.length && command[i + 1] !== '\n') { current += ch + command[++i]; continue; }
    if (ch === '"' || ch === "'") quote = ch;
    if (ch === ';' || ch === '&' || ch === '|' || ch === '\n' || ch === '\r') { segments.push(current); current = ''; continue; }
    current += ch;
  }
  segments.push(current);
  return segments.map((s) => s.trim()).filter(Boolean);
}

function parameterExpansionEnd(segment, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < segment.length; i++) {
    if (segment[i] === '{') depth++;
    else if (segment[i] === '}' && --depth === 0) return i;
  }
  return segment.length - 1;
}

/** Word splitting: quotes removed, backslash escapes resolved, ${VAR} kept whole. */
function tokenize(segment, posixEscapes) {
  const words = [];
  let word = '';
  let inWord = false;
  let quote = null;
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (quote === "'") { if (ch === "'") quote = null; else word += ch; continue; }
    if (quote === '"') {
      if (ch === '"') quote = null;
      else if (posixEscapes && ch === '\\' && i + 1 < segment.length && '"\\$`'.includes(segment[i + 1])) word += segment[++i];
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') { quote = ch; inWord = true; }
    else if (posixEscapes && ch === '\\' && i + 1 < segment.length) { word += segment[++i]; inWord = true; }
    else if (ch === '$' && segment[i + 1] === '{') {
      const end = parameterExpansionEnd(segment, i + 1);
      word += segment.slice(i, end + 1);
      i = end;
      inWord = true;
    } else if (/\s/.test(ch) || ch === '(' || ch === ')' || ch === '{' || ch === '}') {
      if (inWord) words.push(word);
      word = '';
      inWord = false;
    } else { word += ch; inWord = true; }
  }
  if (inWord) words.push(word);
  return words;
}

const commandName = (word) => (word.replace(/\\/g, '/').split('/').pop() || '').toLowerCase().replace(/\.(?:exe|cmd|bat|com)$/, '');

function stripWrappers(words) {
  let i = 0;
  while (i < words.length) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) { i++; continue; }
    const name = commandName(words[i]);
    if (!WRAPPER_COMMANDS.has(name)) break;
    i++;
    while (i < words.length && words[i].startsWith('-')) i += /^-(?:u|g|n|c|p|C|h|U|t)$/.test(words[i]) ? 2 : 1;
    if (name === 'timeout' && i < words.length && /^\d/.test(words[i])) i++;
    if (name === 'nice' && i < words.length && /^-?\d+$/.test(words[i])) i++;
  }
  return words.slice(i);
}

function resolveSegments(rest) {
  const stack = [];
  let depth = 0;
  for (const segment of rest.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') { stack.pop(); depth--; } else { stack.push(segment); depth++; }
  }
  return { stack, depth };
}

function normalizeTarget(target) {
  let t = target.trim().toLowerCase().replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/(?:\/(?:\*|\.))+$/, '')
    .replace(/^(?:\$env:(?:systemdrive|homedrive)|%(?:systemdrive|homedrive)%)(?=\/|$)/, 'c:')
    .replace(/^(?:\$env:(?:systemroot|windir)|%(?:systemroot|windir)%)(?=\/|$)/, 'c:/windows')
    .replace(/^(?:\$env:programfiles|%(?:programfiles|programfiles\(x86\))%)(?=\/|$)/, 'c:/program files')
    .replace(/^(?:\$env:programdata|%programdata%)(?=\/|$)/, 'c:/programdata');
  const home = HOME_HEAD.exec(t);
  if (home) { const { stack, depth } = resolveSegments(home[2] || ''); return depth <= 0 ? home[1] : [home[1], ...stack].join('/'); }
  if (t.startsWith('$') || t.startsWith('%')) return t;
  const drive = /^([a-z]):(\/.*)?$/.exec(t);
  if (drive) return `${drive[1]}:/${resolveSegments(drive[2] || '').stack.join('/')}`;
  return t === '' || t.startsWith('/') ? `/${resolveSegments(t).stack.join('/')}` : t;
}

export function isDangerousTarget(target) {
  const t = normalizeTarget(target);
  if (t === '/' || HOME_TOKENS.has(t) || /^\/(?:home|users)\/[^/]+$/.test(t)) return true;
  const mounted = DRIVE_MOUNT.exec(t);
  const win = mounted ? `${mounted[1]}:/${(mounted[2] || '').replace(/^\//, '')}` : t;
  if (/^[a-z]:\/$/.test(win) || /^[a-z]:\/users\/[^/]+$/.test(win)) return true;
  if (/^[a-z]:\/(?:windows|users|program files(?: \(x86\))?|programdata)$/.test(win)) return true;
  return UNIX_SYSTEM_DIRS.has(t);
}

const isDangerousIn = (target, cwdDangerous) =>
  isDangerousTarget(target) || (cwdDangerous && target.trim() !== '' && CWD_WIDE_TARGET.test(target.trim().replace(/\\/g, '/')));

function cwdChange(words) {
  const argv = stripWrappers(words);
  if (argv.length === 0 || !CWD_COMMANDS.has(commandName(argv[0]))) return null;
  const target = argv.slice(1).filter((a) => !/^-(?:path|literalpath|lp)$/i.test(a)).find((a) => !a.startsWith('-'));
  return target === undefined ? commandName(argv[0]) === 'cd' : isDangerousTarget(target);
}

const unixRecursive = (args) => args.some((a) => a === '--recursive' || /^-[A-Za-z]*[rR][A-Za-z]*$/.test(a));
const cmdRecursive = (args) => args.some((a) => CMD_SLASH_FLAGS.test(a) && CMD_RECURSIVE_S.test(a));
const psRecursive = (args) => args.some((a) => /^-r(?:e(?:c(?:u(?:r(?:s(?:e)?)?)?)?)?)?(?::(?:\$?true|1))?$/i.test(a)) || cmdRecursive(args);
const positional = (args, stripSlash = false) =>
  args.filter((a) => !a.startsWith('-') && !(stripSlash && CMD_SLASH_FLAGS.test(a)) && !/^-{1,2}$/.test(a));

function checkDelete(name, args, dynamicName, cwdDangerous) {
  const rawTargets = positional(args, CMD_DELETE.has(name))
    .concat(args.filter((a) => /^-(?:path|literalpath)[:=]/i.test(a)).map((a) => a.split(/[:=]/).slice(1).join(':')));
  const pathFlag = args.findIndex((a) => /^-(?:path|literalpath|lp)$/i.test(a));
  if (pathFlag !== -1 && args[pathFlag + 1]) rawTargets.push(args[pathFlag + 1]);
  const targets = PS_DELETE.has(name) ? rawTargets.flatMap((t) => t.split(',')) : rawTargets;
  if (!targets.some((t) => isDangerousIn(t, cwdDangerous))) return null;
  if ((name === 'rm' || name === 'rmdir' || name === 'shred' || dynamicName) && (unixRecursive(args) || psRecursive(args))) {
    return { rule: 'root-delete', reason: 'recursive deletion of a filesystem root, home folder or system folder' };
  }
  if (PS_DELETE.has(name) && psRecursive(args)) {
    return { rule: 'root-delete', reason: 'recursive deletion of a drive root, home folder or system folder' };
  }
  return null;
}

function extractPositionalPsScript(args) {
  if (args.some((a) => /^-f(?:ile)?$/i.test(a))) return null;
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) i += PS_VALUE_FLAGS.test(args[i]) ? 2 : 1;
  return i < args.length ? args.slice(i).join(' ') : null;
}

function checkSimpleCommand(words, depth, cwdDangerous = false) {
  const argv = stripWrappers(words);
  if (argv.length === 0) return null;
  const [rawName, ...args] = argv;
  const name = commandName(rawName);
  const dynamicName = /[$`]/.test(rawName);

  if (SHELLS.has(name) || name === 'eval') {
    const flagIndex = args.findIndex((a) => /^-[a-z]*c$/i.test(a));
    const scriptIdx = args[flagIndex + 1] === '--' ? flagIndex + 2 : flagIndex + 1;
    const script = name === 'eval' ? args.join(' ') : flagIndex !== -1 ? args[scriptIdx] : null;
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
    const psScript = cmdIndex !== -1 ? args.slice(cmdIndex + 1).join(' ') : extractPositionalPsScript(args);
    if (psScript) return evaluateNested(psScript, depth + 1);
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
  const posixEscapes = !WINDOWS_SYNTAX.test(command);
  const { unquoted, subs } = scanCommand(command, posixEscapes);
  if (FORK_BOMB.test(unquoted)) return { rule: 'fork-bomb', reason: 'fork bomb' };
  if (RAW_REDIRECT.test(unquoted)) return { rule: 'raw-disk-overwrite', reason: 'redirect onto a raw disk device' };
  for (const inner of subs) {
    const hit = evaluateNested(inner, depth + 1);
    if (hit) return hit;
  }
  let cwdDangerous = false;
  for (const segment of splitSegments(command, posixEscapes)) {
    const words = tokenize(segment, posixEscapes);
    const changed = cwdChange(words);
    if (changed !== null) { cwdDangerous = changed; continue; }
    const hit = checkSimpleCommand(words, depth, cwdDangerous);
    if (hit) return hit;
  }
  return null;
}

export function evaluateCommand(command) {
  const hit = typeof command === 'string' && command.trim() ? evaluateNested(command, 0) : null;
  return hit ? { allowed: false, rule: hit.rule, reason: hit.reason } : { allowed: true, rule: null, reason: 'no destructive command pattern matched' };
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    process.stdin.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_PAYLOAD_BYTES) { reject(new Error(`hook payload exceeds ${MAX_PAYLOAD_BYTES} bytes`)); process.stdin.destroy(); return; }
      chunks.push(chunk);
    });
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

const isAntigravityPayload = (p) => Boolean(p && typeof p === 'object' && (p.toolCall || p.hookEventName === 'PreToolUse'));

function allow(antigravity) {
  if (antigravity) process.stdout.write('{"decision":"allow"}\n');
  return EXIT_ALLOW;
}

function block(reason, antigravity = false) {
  const message = `BLOCKED by BoomOpen Workflow Kit: ${reason}.`;
  process.stderr.write(`${message}\n`);
  if (antigravity) { process.stdout.write(`${JSON.stringify({ decision: 'deny', reason: message })}\n`); return EXIT_ALLOW; }
  const hookSpecificOutput = { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: message };
  process.stdout.write(`${JSON.stringify({ decision: 'deny', reason: message, permission: 'deny', hookSpecificOutput })}\n`);
  return EXIT_BLOCK;
}

export async function main() {
  let raw;
  try { raw = await readStdin(); } catch (error) { return block(error instanceof Error ? error.message : String(error)); }
  let parsed = null;
  try { parsed = JSON.parse(raw || '{}'); } catch { parsed = null; }
  const antigravity = isAntigravityPayload(parsed);
  const command = parsed !== null ? extractCommand(parsed) : raw.trim();
  if (!command) return allow(antigravity);
  const result = evaluateCommand(command);
  return result.allowed ? allow(antigravity) : block(result.reason, antigravity);
}

function isEntryPoint() {
  if (!process.argv[1]) return false;
  try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; }
}

if (isEntryPoint()) process.exitCode = await main();
