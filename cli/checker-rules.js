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
const ANY_PREFIX_WORDS = new Set(['as', 'keyof', 'extends', 'readonly', 'satisfies']);
const LOOK_AROUND_CHARS = 64;

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

/**
 * @param {string[]} segments path segments relative to the project root
 * @returns {boolean}
 */
function isTestPath(segments) {
  const fileName = segments[segments.length - 1] || '';
  return TEST_FILE.test(fileName) || segments.slice(0, -1).some((s) => TEST_DIR_NAMES.has(s));
}

/**
 * Exempt from line limits: tests, declaration/schema/types files and the kit's own cli/install.js.
 * @param {string} absPath
 * @param {string[]} segments path segments relative to the project root
 * @returns {boolean}
 */
function isLineCountExempt(absPath, segments) {
  const fileName = segments[segments.length - 1] || path.basename(absPath);
  if (path.resolve(absPath) === KIT_INSTALLER_PATH) return true;
  return isTestPath(segments) || DECLARATION_FILE.test(fileName) || SCHEMA_OR_TYPES_FILE.test(fileName);
}

/**
 * console.log is allowed in CLI tools, scripts and tests (CLAUDE.md Tier 1 rule 3).
 * @param {string[]} segments path segments relative to the project root
 * @returns {boolean}
 */
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
    const isMember = prevChar === '.' || prevChar === '#' || before.endsWith('...');
    // `T extends U ? any : never` is a conditional type; `{ any: 1 }` / `any()` are not types.
    const isConditionalBranch = prevChar === '?' && after.startsWith(':');
    // `any.x` / `any?.x` read a value named `any`; no type can be followed by member access.
    const isKeyOrValue = after.startsWith(':') || after.startsWith('(') || after.startsWith('?:')
      || after.startsWith('.') || after.startsWith('?.');
    const typePosition =
      ANY_PREFIX_CHARS.has(prevChar) || ANY_PREFIX_WORDS.has(prevWord) || before.endsWith('=>');
    if (!isMember && (isConditionalBranch || (typePosition && !isKeyOrValue))) {
      return lineNumberAt(code, match.index);
    }
    match = pattern.exec(code);
  }
  return 0;
}

/**
 * First line with a console.log( call in code that was already passed through codeOnly().
 * @param {string} code
 * @returns {number} 1-based line number, or 0 when none
 */
function findConsoleLog(code) {
  const match = /\bconsole\s*\.\s*log\s*\(/.exec(code);
  return match ? lineNumberAt(code, match.index) : 0;
}

/**
 * First line containing a deferred-work comment marker (used with --strict-phase / --no-stubs).
 * Scans bounded comments outside single-line string literals and matches uppercase markers.
 * @param {string} rawContent
 * @returns {number} 1-based line number, or 0 when none
 */
function findDeferredTodoComment(rawContent) {
  const tokenOrComment =
    /"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|`(?:\\.|[^`\\\r\n])*`|(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|^\s*#[^\r\n]*)/gm;
  const marker = /(?:^(?:\/\/|\/\*+|\s*\*+|\s*#+)\s*|\b)(?:TODO|FIXME|PLACEHOLDER|XXX)\b(?=\s*[:(\-])|^(?:\/\/|\/\*+|\s*\*+|\s*#+)\s*(?:TODO|FIXME|XXX)\b/m;
  let match = tokenOrComment.exec(rawContent);
  while (match) {
    if (match[1]) {
      const kw = marker.exec(match[1]);
      if (kw) return lineNumberAt(rawContent, match.index + kw.index);
    }
    match = tokenOrComment.exec(rawContent);
  }
  return 0;
}

/**
 * Detect hollow stub implementations or production test-mock leaks (--strict-phase / --no-stubs).
 * @param {string} code stripped JS/TS code (or empty string for non-JS files)
 * @param {string} rawContent original file text
 * @param {boolean} isTest whether the file is a test file
 * @returns {{ line: number, reason: string } | null}
 */
function findHollowStub(code, rawContent, isTest) {
  const throwRe = /\bthrow\s+new\s+\w*Error\s*\(\s*['"`](?:not\s+implemented|todo|pending|stub|unimplemented)/gi;
  let m = throwRe.exec(rawContent);
  while (m) {
    if (!code || code.slice(m.index, m.index + 5) === 'throw') {
      return { line: lineNumberAt(rawContent, m.index), reason: 'throw NotImplemented/TODO stub' };
    }
    m = throwRe.exec(rawContent);
  }
  if (!code) {
    const pyStub = /^\s*raise\s+NotImplementedError\b/m.exec(rawContent);
    if (pyStub) return { line: lineNumberAt(rawContent, pyStub.index), reason: 'raise NotImplementedError stub' };
    const rustStub = /\b(?:todo|unimplemented)!\s*\(/.exec(rawContent);
    if (rustStub) return { line: lineNumberAt(rawContent, rustStub.index), reason: 'todo!/unimplemented! macro stub' };
  }
  if (!isTest && code) {
    const prodMock = /\b(?:vi|jest)\s*\.\s*(?:mock|spyOn|fn)\s*\(/.exec(code);
    if (prodMock) return { line: lineNumberAt(code, prodMock.index), reason: 'test mock/spy in production file' };
  }
  return null;
}

/**
 * Detect skipped/focused tests or vacuous assertions in test files (--strict-phase / --no-stubs).
 * @param {string} code stripped JS/TS code
 * @param {string} rawContent original file text
 * @param {boolean} isTest whether the file is a test file
 * @returns {{ line: number, reason: string } | null}
 */
function findTestGaming(code, rawContent, isTest) {
  if (!isTest) return null;
  const target = code || rawContent;
  const skipped = /\b(?:it|test|describe)\s*\.\s*(?:skip|only|todo)\s*\(/.exec(target);
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
