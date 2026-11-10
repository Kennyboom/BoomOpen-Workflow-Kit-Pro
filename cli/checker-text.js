'use strict';

/**
 * Text helpers shared by `boomopen check` and `boomopen doctor`: line counting that matches
 * editors and `wc -l`, and decoding of files saved as UTF-8 (with or without BOM) or UTF-16.
 */

const fs = require('node:fs');

const UTF8_BOM = [0xef, 0xbb, 0xbf];
const UTF16LE_BOM = [0xff, 0xfe];
const UTF16BE_BOM = [0xfe, 0xff];
const NUL_SNIFF_BYTES = 512;

function startsWithBytes(buffer, bytes) {
  return bytes.every((byte, index) => buffer[index] === byte);
}

/**
 * Count lines the way editors and `wc -l` do: a trailing line break does not start a new line.
 * @param {string} content
 * @returns {number}
 */
function countLines(content) {
  if (typeof content !== 'string' || content.length === 0) return 0;
  const breaks = content.match(/\r\n|\r|\n/g);
  const breakCount = breaks ? breaks.length : 0;
  const endsWithBreak = /(?:\r\n|\r|\n)$/.test(content);
  return endsWithBreak ? breakCount : breakCount + 1;
}

/**
 * Heuristic for UTF-16 text saved without a BOM: many NUL bytes at odd (LE) or even (BE) offsets.
 * @param {Buffer} buffer
 * @returns {'utf16le'|'utf16be'|null}
 */
function sniffBomlessUtf16(buffer) {
  const limit = Math.min(buffer.length, NUL_SNIFF_BYTES);
  if (limit < 4) return null;
  let evenNuls = 0;
  let oddNuls = 0;
  for (let i = 0; i < limit; i++) {
    if (buffer[i] !== 0) continue;
    if (i % 2 === 0) evenNuls++;
    else oddNuls++;
  }
  const half = limit / 2;
  if (oddNuls > half * 0.6 && evenNuls < half * 0.1) return 'utf16le';
  if (evenNuls > half * 0.6 && oddNuls < half * 0.1) return 'utf16be';
  return null;
}

/**
 * Decode a text buffer: UTF-8 (BOM stripped), UTF-16 LE/BE with BOM, or BOM-less UTF-16.
 * @param {Buffer} buffer
 * @returns {string}
 */
function decodeTextBuffer(buffer) {
  if (startsWithBytes(buffer, UTF8_BOM)) return buffer.subarray(UTF8_BOM.length).toString('utf8');
  if (startsWithBytes(buffer, UTF16LE_BOM)) return buffer.subarray(2).toString('utf16le');
  const sniffed = startsWithBytes(buffer, UTF16BE_BOM) ? 'utf16be' : sniffBomlessUtf16(buffer);
  if (sniffed === 'utf16le') return buffer.toString('utf16le');
  if (sniffed === 'utf16be') {
    const start = startsWithBytes(buffer, UTF16BE_BOM) ? 2 : 0;
    const evenLength = start + Math.floor((buffer.length - start) / 2) * 2;
    const swapped = Buffer.from(buffer.subarray(start, evenLength));
    swapped.swap16();
    return swapped.toString('utf16le');
  }
  return buffer.toString('utf8');
}

/**
 * Read a text file with encoding detection.
 * @param {string} filePath
 * @returns {string}
 */
function readTextFile(filePath) {
  return decodeTextBuffer(fs.readFileSync(filePath));
}

module.exports = {
  countLines,
  decodeTextBuffer,
  readTextFile,
};
