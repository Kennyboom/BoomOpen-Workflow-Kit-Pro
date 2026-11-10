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
  'case', 'do', 'else', 'yield', 'await', 'default', 'cond)',
]);
const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[A-Za-z0-9_$]/;

/**
 * @param {string} source
 * @param {{ jsx?: boolean, onComment?: (slice: string, offset: number) => void }} [options]
 * @returns {string}
 */
function stripNonCode(source, options = {}) {
  const jsx = Boolean(options.jsx);
  const onComment = typeof options.onComment === 'function' ? options.onComment : null;
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

  function hasClosingJsxTag(tagName, fromIndex) {
    if (!tagName) return source.indexOf('</>', fromIndex) !== -1;
    const needle = `</${tagName}`;
    let pos = source.indexOf(needle, fromIndex);
    while (pos !== -1) {
      const after = source[pos + needle.length];
      if (after === '>' || after === ' ' || after === '\t' || after === '\r' || after === '\n') return true;
      pos = source.indexOf(needle, pos + 2);
    }
    return false;
  }

  function looksLikeJsx(start) {
    const next = source[start + 1];
    if (next === '>') return hasClosingJsxTag('', start + 2);
    if (!next || !IDENT_START.test(next)) return false;
    const nameEnd = readTagName(start + 1);
    const rest = source.slice(nameEnd, nameEnd + 24);
    return !/^\s*(?:,|extends\b|=[^>=])/.test(rest);
  }

  // Returns the index after the element. `start` points at '<'.
  function scanJsxElement(start) {
    let i = start + 1;
    if (source[i] === '>') return scanJsxChildren(i + 1);
    const nameEnd = readTagName(i);
    const tagName = source.slice(i, nameEnd);
    i = nameEnd;
    if (source[i] === '>' && (!hasClosingJsxTag(tagName, i + 1) || /^\s*\([^)]*\)\s*(?::[^=;]+)?=>/.test(source.slice(i + 1, i + 120)))) {
      // Unconstrained TS generic parameter such as `<T>(value: T) => T` — not a JSX element.
      return i + 1;
    }
    let typeDepth = 0;
    while (i < n) {
      const ch = source[i];
      if (ch === '"' || ch === "'") { i = scanQuoted(i, ch); continue; }
      if (ch === '{') { i = scanCode(i + 1, true); continue; }
      if (ch === '<') { typeDepth++; i++; continue; }
      if (ch === '>' && typeDepth > 0) { typeDepth--; i++; continue; }
      if (ch === '/' && source[i + 1] === '>' && typeDepth === 0) return i + 2;
      if (ch === '>') return hasClosingJsxTag(tagName, i + 1) ? scanJsxChildren(i + 1) : i + 1;
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
    let condParenDepth = 0;
    while (i < n) {
      const ch = source[i];
      const next = source[i + 1];
      if (ch === '/' && next === '/') {
        const end = source.indexOf('\n', i);
        const stop = end === -1 ? n : end;
        if (onComment) onComment(source.slice(i, stop), i);
        blank(i, stop);
        i = stop;
        continue;
      }
      if (ch === '/' && next === '*') {
        const end = source.indexOf('*/', i + 2);
        const stop = end === -1 ? n : end + 2;
        if (onComment) onComment(source.slice(i, stop), i);
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
      if ((ch === '+' || ch === '-') && next === ch) {
        prev = exprAllowed(REGEX_PREFIX_CHARS) ? ch : 'postfix';
        i += 2;
        continue;
      }
      if (ch === '!' && next !== '=' && !exprAllowed(REGEX_PREFIX_CHARS)) {
        prev = 'nonnull';
        i++;
        continue;
      }
      if (ch === '{') depth++;
      if (ch === '}') {
        if (depth === 0 && untilBrace) { prev = '}'; return i + 1; }
        depth--;
      }
      if (ch === '(') {
        if (condParenDepth > 0 || prev === 'if' || prev === 'while' || prev === 'for') condParenDepth++;
        prev = '(';
        i++;
        continue;
      }
      if (ch === ')' && condParenDepth > 0) {
        condParenDepth--;
        prev = condParenDepth === 0 ? 'cond)' : ')';
        i++;
        continue;
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
