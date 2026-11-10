'use strict';

/**
 * Markdown audits for `boomopen doctor`: per-folder line limits, mojibake and legacy references.
 * DOC_LINE_LIMITS is the single source of truth for the Markdown limits (tests should import it).
 */

const fs = require('node:fs');
const path = require('node:path');

const { countLines, readTextFile } = require('./checker-text.js');

const MAX_DOC_LINES = 450;
const RULES_DOC_LINES = 300;
const MAX_ISSUES_SHOWN = 8;

/**
 * Markdown folders the doctor audits. Code limits (`boomopen check`) are separate: docs are
 * exempt from those, but kit instruction files have their own budget because agents load them.
 */
const DOC_LINE_LIMITS = Object.freeze({
  rules: RULES_DOC_LINES,
  commands: MAX_DOC_LINES,
  agents: MAX_DOC_LINES,
  'agents/teams': MAX_DOC_LINES,
  i18n: MAX_DOC_LINES,
  skills: MAX_DOC_LINES,
});

const DOC_AUDITS = Object.freeze([
  { dir: 'rules', label: 'rules/*.md', recursive: false },
  { dir: 'commands', label: 'commands/**/*.md', recursive: true },
  { dir: 'agents', label: 'agents/*.md', recursive: false },
  { dir: 'agents/teams', label: 'agents/teams/**/*.md', recursive: true },
  { dir: 'i18n', label: 'i18n/README.*.md', recursive: false },
  { dir: 'skills', label: 'skills/**/SKILL.md', recursive: true, fileName: 'SKILL.md' },
]);

const LEGACY_REFERENCES = ['agent-assistant', 'code-assistants'];

// Windows-1252 characters for bytes 0x80-0x9F (bytes 0xA0-0xFF map to U+00A0-U+00FF).
const CP1252_HIGH = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};
const CONTINUATION_CLASS = '[\\u0080-\\u00BF\\u0152\\u0153\\u0160\\u0161\\u0178\\u017D\\u017E\\u0192\\u02C6\\u02DC\\u2013\\u2014\\u2018-\\u201A\\u201C-\\u201E\\u2020-\\u2022\\u2026\\u2030\\u2039\\u203A\\u20AC\\u2122]';
const MOJIBAKE_CANDIDATE = new RegExp(`[\\u00C2-\\u00F4]${CONTINUATION_CLASS}{1,3}`, 'g');

function cp1252Byte(char) {
  const code = char.codePointAt(0);
  if (code <= 0xff) return code;
  return CP1252_HIGH[code] ?? -1;
}

/** True when the characters, read back as Windows-1252/Latin-1 bytes, form one UTF-8 sequence. */
function isUtf8Sequence(chars) {
  const bytes = [...chars].map(cp1252Byte);
  if (bytes.some((b) => b < 0)) return false;
  const lead = bytes[0];
  const expected = lead >= 0xf0 ? 4 : lead >= 0xe0 ? 3 : lead >= 0xc2 ? 2 : 0;
  if (expected === 0 || bytes.length < expected) return false;
  return bytes.slice(1, expected).every((b) => b >= 0x80 && b <= 0xbf);
}

/**
 * Detect UTF-8 text that was decoded as Windows-1252/Latin-1 (e.g. "âœ…", "Tiáº¿ng", "æ—¥").
 * @param {string} text
 * @returns {string|null} the first suspicious sample, or null
 */
function detectMojibake(text) {
  if (text.includes('�')) return '�';
  MOJIBAKE_CANDIDATE.lastIndex = 0;
  let match = MOJIBAKE_CANDIDATE.exec(text);
  while (match) {
    if (isUtf8Sequence(match[0])) return match[0];
    match = MOJIBAKE_CANDIDATE.exec(text);
  }
  return null;
}

function collectMarkdown(dirPath, recursive, fileName, prefix = '', accumulator = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && recursive) {
      collectMarkdown(fullPath, recursive, fileName, `${prefix}${entry.name}/`, accumulator);
    } else if (entry.isFile() && entry.name.endsWith('.md') && (!fileName || entry.name === fileName)) {
      accumulator.push({ fullPath, relName: `${prefix}${entry.name}` });
    }
  }
  return accumulator;
}

/**
 * Audit one Markdown folder for its line limit, mojibake and legacy references.
 * @param {string} dirPath
 * @param {{ label: string, limit: number, recursive?: boolean, fileName?: string }} spec
 * @returns {{ name: string, passed: boolean, detail: string }}
 */
function auditMarkdownDir(dirPath, spec) {
  const { label, limit } = spec;
  if (!fs.existsSync(dirPath)) return { name: label, passed: false, detail: 'Directory missing' };
  const files = collectMarkdown(dirPath, Boolean(spec.recursive), spec.fileName);
  const issues = [];
  for (const file of files) {
    const text = readTextFile(file.fullPath);
    const lineCount = countLines(text);
    if (lineCount > limit) issues.push(`${file.relName} (${lineCount} lines > ${limit})`);
    const garbled = detectMojibake(text);
    if (garbled) issues.push(`${file.relName} (mojibake "${garbled}")`);
    if (LEGACY_REFERENCES.some((ref) => text.includes(ref))) issues.push(`${file.relName} (legacy ref)`);
  }
  const shown = issues.slice(0, MAX_ISSUES_SHOWN).join('; ');
  const more = issues.length > MAX_ISSUES_SHOWN ? ` (+${issues.length - MAX_ISSUES_SHOWN} more)` : '';
  return {
    name: label,
    passed: issues.length === 0,
    detail: issues.length === 0 ? `${files.length} files OK (≤${limit} lines)` : shown + more,
  };
}

/**
 * Run every Markdown audit of the kit source tree.
 * @param {string} repoRoot
 */
function auditKitMarkdown(repoRoot) {
  return DOC_AUDITS.map((audit) =>
    auditMarkdownDir(path.join(repoRoot, ...audit.dir.split('/')), {
      ...audit,
      limit: DOC_LINE_LIMITS[audit.dir],
    })
  );
}

module.exports = {
  MAX_DOC_LINES,
  DOC_LINE_LIMITS,
  detectMojibake,
  auditMarkdownDir,
  auditKitMarkdown,
};
