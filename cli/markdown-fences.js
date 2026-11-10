'use strict';

/**
 * BOM-safe Markdown reader, YAML frontmatter extractor, and CommonMark-compliant
 * N-backtick / N-tilde fence state machine shared across `research`, `design`, `plan`,
 * `cook`, and `ledger`. Properly handles 4-backtick nested carousels (` ````carousel `)
 * and UTF-8 BOM / UTF-16 files saved on Windows PowerShell.
 */

const { countLines, readTextFile } = require('./checker-text.js');

function stripBom(text) {
  return String(text || '').replace(/^\uFEFF/, '');
}

function readCleanText(filePath) {
  return stripBom(readTextFile(filePath));
}

/**
 * Remove `(...)` annotations outside inline backticks so `` `src/app/(auth)/page.tsx` ``
 * preserves `(auth)` while `` `src/a.ts` (implements `AuthDto`) `` drops the trailing note.
 */
function stripOutsideBacktickParens(raw) {
  let out = '';
  let inTick = false;
  let parenDepth = 0;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '`' && parenDepth === 0) { inTick = !inTick; out += ch; continue; }
    if (!inTick) {
      if (ch === '(') { parenDepth++; continue; }
      if (ch === ')' && parenDepth > 0) { parenDepth--; continue; }
      if (parenDepth > 0) continue;
    }
    out += ch;
  }
  return out;
}

function parseFenceOpen(line) {
  const m = /^[ \t]*(`{3,}|~{3,})([^\r\n]*)$/.exec(line);
  if (!m) return null;
  const ch = m[1][0];
  const info = m[2].trim();
  if (ch === '`' && info.includes('`')) return null;
  return { char: ch, len: m[1].length, info };
}

function isFenceClose(line, fence) {
  const m = /^[ \t]*(`{3,}|~{3,})[ \t]*$/.exec(line);
  return Boolean(m && m[1][0] === fence.char && m[1].length >= fence.len);
}

function parseFrontmatter(markdown) {
  const cleanText = stripBom(markdown);
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(cleanText);
  if (!fmMatch) {
    return { cleanText, yamlText: '', frontmatter: {}, bodyOffsetLines: 0, bodyText: cleanText };
  }
  const yamlText = fmMatch[1];
  const frontmatter = {};
  for (const line of yamlText.split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.+)$/.exec(line.trim());
    if (kv) frontmatter[kv[1].toLowerCase()] = kv[2].trim().replace(/^['"]|['"]$/g, '');
  }
  const bodyOffsetLines = fmMatch[0].split(/\r?\n/).length - 1;
  return { cleanText, yamlText, frontmatter, bodyOffsetLines, bodyText: cleanText.slice(fmMatch[0].length) };
}

function stripMarkdownFences(markdown, options = {}) {
  const lines = stripBom(markdown).split(/\r?\n/);
  const out = [];
  let outerFence = null;
  for (const line of lines) {
    if (!outerFence) {
      const opened = parseFenceOpen(line);
      if (opened) {
        outerFence = opened;
        if (options.preserveLines) out.push('');
        continue;
      }
      out.push(line);
    } else {
      if (isFenceClose(line, outerFence)) outerFence = null;
      if (options.preserveLines) out.push('');
    }
  }
  return out.join('\n');
}

function extractFencedBlocks(markdown) {
  const lines = stripBom(markdown).split(/\r?\n/);
  const blocks = [];
  let containerFence = null;
  let activeFence = null;
  let buf = [];

  const flushActive = () => {
    if (activeFence) blocks.push({ lang: activeFence.lang, body: buf.join('\n').trim() });
    activeFence = null;
    buf = [];
  };

  for (const line of lines) {
    if (activeFence) {
      if (isFenceClose(line, activeFence)) {
        flushActive();
        if (containerFence && isFenceClose(line, containerFence)) containerFence = null;
      } else if (containerFence && isFenceClose(line, containerFence)) {
        activeFence = null;
        buf = [];
        containerFence = null;
      } else {
        buf.push(line);
      }
      continue;
    }
    if (containerFence) {
      if (isFenceClose(line, containerFence)) { containerFence = null; continue; }
      const inner = parseFenceOpen(line);
      if (inner && inner.len < containerFence.len) {
        activeFence = { ...inner, lang: inner.info.split(/\s+/)[0].toLowerCase() };
        buf = [];
      }
      continue;
    }
    const opened = parseFenceOpen(line);
    if (!opened) continue;
    const lang = opened.info.split(/\s+/)[0].toLowerCase();
    if (opened.len >= 4 && (!lang || /^(?:carousel|markdown|md)$/.test(lang))) containerFence = opened;
    else { activeFence = { ...opened, lang }; buf = []; }
  }
  return blocks;
}

module.exports = {
  countLines,
  stripBom,
  readCleanText,
  stripOutsideBacktickParens,
  parseFenceOpen,
  isFenceClose,
  parseFrontmatter,
  stripMarkdownFences,
  extractFencedBlocks,
};
