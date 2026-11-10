'use strict';

/**
 * File selection, exemption and pattern rules for `boomopen check`
 * (Pragmatic 2-Tier Coding Standards in CLAUDE.md).
 */

const path = require('node:path');

const { stripNonCode } = require('./checker-strip.js');

const CODE_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.tsx', '.jsx', '.py', '.go', '.rs',
]);
const TS_EXTENSIONS = new Set(['.ts', '.mts', '.cts', '.tsx']);
const JS_FAMILY_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.jsx', ...TS_EXTENSIONS]);
const JSX_EXTENSIONS = new Set(['.js', '.jsx', '.tsx']);

// Third-party, generated and environment folders that are never project source.
const IGNORED_DIRS = new Set([
  'node_modules', 'bower_components', 'jspm_packages', '.git', 'dist', 'build', 'out', 'coverage',
  'target', 'vendor', 'venv', 'env', 'site-packages', '__pycache__', '.next', '.nuxt', '.svelte-kit',
  '.turbo', '.cache', 'storybook-static', 'skills_library', 'matrix-skills', '.brain',
]);

// The kit's own installer is the only file exempt by path (it is documented as a large CLI file).
const KIT_INSTALLER_PATH = path.join(__dirname, 'install.js');
const TEST_DIR_NAMES = new Set(['__tests__', '__mocks__', 'tests', 'test']);
// Directories whose files may print to the console (CLI tools and scripts).
const CONSOLE_ALLOWED_DIRS = new Set(['cli', 'bin', 'scripts']);

const DECLARATION_FILE = /\.d\.[cm]?ts$/;
const TEST_FILE = /(?:\.(?:test|spec)\.[^.]+$|^test_.+\.py$|_test\.(?:py|go)$)/;
const SCHEMA_OR_TYPES_FILE = /(?:^(?:types|schema)\.[cm]?tsx?$|\.(?:types|schema)\.[cm]?tsx?$)/;

const ANY_PREFIX_CHARS = new Set([':', '<', ',', '|', '&', '(', '[', '=']);
const ANY_PREFIX_WORDS = new Set(['as', 'keyof', 'extends', 'readonly', 'satisfies', 'is']);
const LOOK_AROUND_CHARS = 128;

const DEFERRED_WORDS = ['TO' + 'DO', 'FIX' + 'ME', 'PLACE' + 'HOLDER', 'X' + 'XX'];
const DEFERRED_COMMENT_RE = new RegExp(
  `(?:^(?:\\/\\/|\\/\\*+|\\s*\\*+|\\s*#+)\\s*|\\b)(?:${DEFERRED_WORDS.join('|')})\\b(?=\\s*[:(\\-])|^(?:\\/\\/|\\/\\*+|\\s*\\*+|\\s*#+)\\s*(?:${[DEFERRED_WORDS[0], DEFERRED_WORDS[1], DEFERRED_WORDS[3]].join('|')})\\b`,
  'm'
);
const STUB_THROW_RE = new RegExp(
  `\\bthrow\\s+new\\s+\\w*Error\\s*\\(\\s*['"\`]\\s*(?:not\\s+implemented(?:\\s+yet)?|${['to' + 'do', 'fix' + 'me', 'stub', 'unimplemented'].join('\\b|')}\\b|pending\\s+implementation\\b)`,
  'gi'
);
const PY_TOKEN_RE = /(?:[fFrRbBuU]{0,2})(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*')|(#[^\r\n]*)/g;
const RS_TOKEN_RE = /b?r(#*)"[\s\S]*?"\1|b?"(?:\\.|[^"\\])*"|(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)/g;
const GO_TOKEN_RE = /`[\s\S]*?`|"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)/g;

/**
 * Split a relative path into its folder/file segments (OS independent).
 * @param {string} relPath
 * @returns {string[]}
 */
function toSegments(relPath) {
  return relPath.split(/[\\/]+/).filter(Boolean);
}

function isIgnoredSegment(segment) {
  return IGNORED_DIRS.has(segment) || (segment.startsWith('.') && segment !== '.' && segment !== '..');
}

function isTestPath(segments) {
  const fileName = segments[segments.length - 1] || '';
  return TEST_FILE.test(fileName) || segments.slice(0, -1).some((s) => TEST_DIR_NAMES.has(s));
}

function isLineCountExempt(absPath, segments) {
  const fileName = segments[segments.length - 1] || path.basename(absPath);
  if (path.resolve(absPath) === KIT_INSTALLER_PATH) return true;
  return isTestPath(segments) || DECLARATION_FILE.test(fileName) || SCHEMA_OR_TYPES_FILE.test(fileName);
}

function isConsoleLogAllowed(segments) {
  return CONSOLE_ALLOWED_DIRS.has(segments[0]) || isTestPath(segments);
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text[i] === '\n') line++;
  return line;
}

/**
 * Remove comments, strings, regex bodies and JSX text from JS/TS sources.
 * @param {string} content
 * @param {string} ext lower-case extension
 * @returns {string}
 */
function codeOnly(content, ext) {
  return stripNonCode(content, { jsx: JSX_EXTENSIONS.has(ext) });
}

function blankPreservingNewlines(slice) {
  return slice.replace(/[^\r\n]/g, ' ');
}

/**
 * Extract comment spans and stripped code for Python, Rust, Go, or JS/TS.
 * @param {string} rawContent
 * @param {string} [ext]
 * @returns {{ stripped: string, comments: Array<{ text: string, offset: number }> }}
 */
function lexCommentsAndCode(rawContent, ext = '') {
  const lower = String(ext || '').toLowerCase();
  if (!lower || JS_FAMILY_EXTENSIONS.has(lower)) {
    const comments = [];
    const stripped = stripNonCode(rawContent, {
      jsx: JSX_EXTENSIONS.has(lower),
      onComment: (slice, offset) => comments.push({ text: slice, offset }),
    });
    return { stripped, comments };
  }
  const tokenRe = lower === '.py' ? PY_TOKEN_RE : lower === '.rs' ? RS_TOKEN_RE : lower === '.go' ? GO_TOKEN_RE : null;
  if (!tokenRe) return { stripped: rawContent, comments: [] };

  tokenRe.lastIndex = 0;
  const comments = [];
  const stripped = rawContent.replace(tokenRe, (...args) => {
    const full = args[0];
    const offset = args[args.length - 2];
    const commentText = lower === '.rs' ? args[2] : args[1];
    if (commentText) comments.push({ text: commentText, offset });
    return blankPreservingNewlines(full);
  });
  return { stripped, comments };
}

/**
 * Find the first explicit `any` type in code that was already passed through codeOnly().
 * @param {string} code
 * @returns {number} 1-based line number, or 0 when none
 */
function findExplicitAny(code) {
  const pattern = /\bany\b/g;
  let match = pattern.exec(code);
  while (match) {
    const before = code.slice(Math.max(0, match.index - LOOK_AROUND_CHARS), match.index).replace(/\s+$/, '');
    const after = code.slice(match.index + 3, match.index + 3 + LOOK_AROUND_CHARS).replace(/^\s+/, '');
    const prevChar = before[before.length - 1];
    const prevWord = (before.match(/[A-Za-z_$][\w$]*$/) || [''])[0];
    const isRestType = /(?:[\[,]\s*)\.\.\.$/.test(before);
    const isMember = (prevChar === '.' || prevChar === '#' || before.endsWith('...')) && !isRestType;
    const isConditionalBranch = prevChar === '?' && after.startsWith(':');
    const isKeyOrValue = after.startsWith(':') || after.startsWith('(') || after.startsWith('?:')
      || after.startsWith('.') || after.startsWith('?.');
    const typePosition =
      isRestType || ANY_PREFIX_CHARS.has(prevChar) || ANY_PREFIX_WORDS.has(prevWord) || before.endsWith('=>');
    if (!isMember && (isConditionalBranch || (typePosition && !isKeyOrValue))) {
      return lineNumberAt(code, match.index);
    }
    match = pattern.exec(code);
  }
  return 0;
}

function findConsoleLog(code) {
  const match = /\bconsole\s*\.\s*log\s*\(/.exec(code);
  return match ? lineNumberAt(code, match.index) : 0;
}

/**
 * First line containing a deferred-work comment marker (used with --strict-phase / --no-stubs).
 * @param {string} rawContent
 * @param {string} [ext]
 * @returns {number} 1-based line number, or 0 when none
 */
function findDeferredTodoComment(rawContent, ext = '') {
  const { comments } = lexCommentsAndCode(rawContent, ext);
  for (const c of comments) {
    const kw = DEFERRED_COMMENT_RE.exec(c.text);
    if (kw) return lineNumberAt(rawContent, c.offset + kw.index);
  }
  return 0;
}

/**
 * Detect hollow stub implementations or production test-mock leaks (--strict-phase / --no-stubs).
 * @param {string} code stripped JS/TS code (or empty string for non-JS files)
 * @param {string} rawContent original file text
 * @param {boolean} isTest whether the file is a test file
 * @param {string} [ext]
 * @returns {{ line: number, reason: string } | null}
 */
function findHollowStub(code, rawContent, isTest, ext = '') {
  const lower = String(ext || '').toLowerCase();
  const effectiveCode = code || (lower ? lexCommentsAndCode(rawContent, lower).stripped : '');

  STUB_THROW_RE.lastIndex = 0;
  let m = STUB_THROW_RE.exec(rawContent);
  while (m) {
    if (!effectiveCode || effectiveCode.slice(m.index, m.index + 5) === 'throw') {
      return { line: lineNumberAt(rawContent, m.index), reason: 'throw NotImplemented/TODO stub' };
    }
    m = STUB_THROW_RE.exec(rawContent);
  }
  if (!code) {
    const target = effectiveCode || rawContent;
    if (!lower || lower === '.py') {
      const pyStub = /^\s*raise\s+NotImplementedError\b/m.exec(target);
      if (pyStub) return { line: lineNumberAt(target, pyStub.index), reason: 'raise NotImplementedError stub' };
    }
    if (!lower || lower === '.rs') {
      const rustStub = new RegExp(`\\b(?:${['to' + 'do', 'unimplemented'].join('|')})!\\s*\\(`).exec(target);
      if (rustStub) return { line: lineNumberAt(target, rustStub.index), reason: 'todo!/unimplemented! macro stub' };
    }
  }
  if (!isTest && code) {
    const prodMock = /\b(?:vi|jest)\s*\.\s*(?:mock|spyOn|fn)\s*\(/.exec(code);
    if (prodMock) return { line: lineNumberAt(code, prodMock.index), reason: 'test mock/spy in production file' };
  }
  return null;
}

/**
 * Detect skipped/focused tests or vacuous assertions in test files (--strict-phase / --no-stubs).
 */
function findTestGaming(code, rawContent, isTest, ext = '') {
  if (!isTest) return null;
  const target = code || (ext ? lexCommentsAndCode(rawContent, ext).stripped : rawContent);
  const skipped = new RegExp(`\\b(?:it|test|describe)\\s*\\.\\s*(?:skip|only|${'to' + 'do'})\\s*\\(`).exec(target);
  if (skipped) return { line: lineNumberAt(target, skipped.index), reason: 'skipped/focused/todo test' };
  const vacuous = /\bexpect\s*\(\s*(?:true|1)\s*\)\s*\.\s*to(?:Be|Equal|StrictEqual)\s*\(\s*(?:true|1)\s*\)/.exec(target);
  if (vacuous) return { line: lineNumberAt(target, vacuous.index), reason: 'vacuous expect(true).toBe(true)' };
  return null;
}

module.exports = {
  CODE_EXTENSIONS,
  TS_EXTENSIONS,
  JS_FAMILY_EXTENSIONS,
  IGNORED_DIRS,
  DECLARATION_FILE,
  toSegments,
  isIgnoredSegment,
  isTestPath,
  isLineCountExempt,
  isConsoleLogAllowed,
  codeOnly,
  findExplicitAny,
  findConsoleLog,
  findDeferredTodoComment,
  findHollowStub,
  findTestGaming,
};
