'use strict';

/**
 * A small, dependency-free JavaScript/TypeScript lexer that blanks out everything that is not
 * code: comments, string contents, template-literal text, regular-expression bodies and JSX text.
 * Line breaks and character offsets are preserved, so matches on the result map back to lines
 * of the original file. It is a heuristic (no full parser), tuned to avoid false positives.
 */

const REGEX_PREFIX_CHARS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const JSX_PREFIX_CHARS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '>']);
const EXPRESSION_KEYWORDS = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw',
  'case', 'do', 'else', 'yield', 'await', 'default',
]);
const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[A-Za-z0-9_$]/;

/**
 * @param {string} source
 * @param {{ jsx?: boolean }} [options]
 * @returns {string}
 */
function stripNonCode(source, options = {}) {
  const jsx = Boolean(options.jsx);
  const out = source.split('');
  const n = source.length;
  // Last significant token in code: a single punctuation char, or a word.
  let prev = null;

  function blank(from, to) {
    for (let k = from; k < to && k < n; k++) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' ';
    }
  }

  function exprAllowed(prefixChars) {
    if (prev === null) return true;
    if (prev.length === 1 && !IDENT_PART.test(prev)) return prefixChars.has(prev);
    return EXPRESSION_KEYWORDS.has(prev);
  }

  function scanQuoted(start, quote) {
    let i = start + 1;
    while (i < n) {
      const ch = source[i];
      if (ch === '\\') { i += 2; continue; }
      if (ch === quote || ch === '\n') break;
      i++;
    }
    blank(start + 1, i);
    return Math.min(i + 1, n);
  }

  function scanTemplate(start) {
    let i = start + 1;
    let textStart = i;
    while (i < n) {
      const ch = source[i];
      if (ch === '\\') { i += 2; continue; }
      if (ch === '`') { blank(textStart, i); return i + 1; }
      if (ch === '$' && source[i + 1] === '{') {
        blank(textStart, i);
        i = scanCode(i + 2, true);
        textStart = i;
        continue;
      }
      i++;
    }
    blank(textStart, n);
    return n;
  }

  function scanRegex(start) {
    let i = start + 1;
    let inClass = false;
    while (i < n) {
      const ch = source[i];
      if (ch === '\n') return -1;
      if (ch === '\\') { i += 2; continue; }
      if (ch === '[') inClass = true;
      else if (ch === ']') inClass = false;
      else if (ch === '/' && !inClass) break;
      i++;
    }
    if (i >= n) return -1;
    blank(start + 1, i);
    i++;
    while (i < n && IDENT_PART.test(source[i])) i++;
    return i;
  }

  function readTagName(start) {
    let i = start;
    while (i < n && /[A-Za-z0-9_$.:-]/.test(source[i])) i++;
    return i;
  }

  function looksLikeJsx(start) {
    const next = source[start + 1];
    if (next === '>') return true;
    if (!next || !IDENT_START.test(next)) return false;
    const nameEnd = readTagName(start + 1);
    const rest = source.slice(nameEnd, nameEnd + 12);
    return !/^\s*(?:,|extends\b)/.test(rest);
  }

  // Returns the index after the element. `start` points at '<'.
  function scanJsxElement(start) {
    let i = start + 1;
    if (source[i] === '>') return scanJsxChildren(i + 1);
    i = readTagName(i);
    while (i < n) {
      const ch = source[i];
      if (ch === '"' || ch === "'") { i = scanQuoted(i, ch); continue; }
      if (ch === '{') { i = scanCode(i + 1, true); continue; }
      if (ch === '/' && source[i + 1] === '>') return i + 2;
      if (ch === '>') return scanJsxChildren(i + 1);
      i++;
    }
    return n;
  }

  function scanJsxChildren(start) {
    let i = start;
    let textStart = i;
    while (i < n) {
      const ch = source[i];
      if (ch === '{') {
        blank(textStart, i);
        i = scanCode(i + 1, true);
        textStart = i;
        continue;
      }
      if (ch === '<') {
        blank(textStart, i);
        if (source[i + 1] === '/') {
          const close = source.indexOf('>', i);
          return close === -1 ? n : close + 1;
        }
        i = scanJsxElement(i);
        textStart = i;
        continue;
      }
      i++;
    }
    blank(textStart, n);
    return n;
  }

  // Scan code from `start`. When `untilBrace` is true, stop after the unmatched closing '}'.
  function scanCode(start, untilBrace) {
    let i = start;
    let depth = 0;
    while (i < n) {
      const ch = source[i];
      const next = source[i + 1];
      if (ch === '/' && next === '/') {
        const end = source.indexOf('\n', i);
        const stop = end === -1 ? n : end;
        blank(i, stop);
        i = stop;
        continue;
      }
      if (ch === '/' && next === '*') {
        const end = source.indexOf('*/', i + 2);
        const stop = end === -1 ? n : end + 2;
        blank(i, stop);
        i = stop;
        continue;
      }
      if (ch === '"' || ch === "'") { i = scanQuoted(i, ch); prev = 'str'; continue; }
      if (ch === '`') { i = scanTemplate(i); prev = 'str'; continue; }
      if (ch === '/' && exprAllowed(REGEX_PREFIX_CHARS)) {
        const end = scanRegex(i);
        if (end !== -1) { i = end; prev = 'regex'; continue; }
      }
      if (ch === '<' && jsx && exprAllowed(JSX_PREFIX_CHARS) && looksLikeJsx(i)) {
        i = scanJsxElement(i);
        prev = 'jsx';
        continue;
      }
      if (IDENT_START.test(ch)) {
        let j = i + 1;
        while (j < n && IDENT_PART.test(source[j])) j++;
        prev = source.slice(i, j);
        i = j;
        continue;
      }
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '{') depth++;
      if (ch === '}') {
        if (depth === 0 && untilBrace) { prev = '}'; return i + 1; }
        depth--;
      }
      prev = /[0-9]/.test(ch) ? 'num' : ch;
      i++;
    }
    return n;
  }

  scanCode(0, false);
  return out.join('');
}

module.exports = { stripNonCode };
