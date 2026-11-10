'use strict';

/**
 * Minimal, dependency-free TOML scanner used to edit ~/.codex/config.toml safely.
 *
 * It does not build values; it finds statement boundaries (headers, key/value extents across
 * multi-line strings/arrays/inline tables, comments) and tracks which tables and keys are defined,
 * reporting the structural errors that make TOML parsers reject a file (duplicate tables,
 * duplicate keys, a dotted key re-opening a [table], a header re-opening a dotted table, ...).
 */

const BARE_KEY_CHAR = /[A-Za-z0-9_-]/;
const SCALAR_STOP = /[\s,\]}#]/;

class TomlScanError extends Error {
    constructor(message, line) {
        super(`line ${line}: ${message}`);
        this.name = 'TomlScanError';
        this.line = line;
    }
}

/** Cursor over the source text with line tracking. */
class Cursor {
    constructor(text) {
        this.text = text;
        this.pos = 0;
    }

    peek(offset = 0) {
        return this.text[this.pos + offset];
    }

    startsWith(token) {
        return this.text.startsWith(token, this.pos);
    }

    eof() {
        return this.pos >= this.text.length;
    }

    line() {
        let count = 1;
        for (let i = 0; i < this.pos && i < this.text.length; i++) if (this.text[i] === '\n') count++;
        return count;
    }

    fail(message) {
        throw new TomlScanError(message, this.line());
    }

    skipInlineSpace() {
        while (this.peek() === ' ' || this.peek() === '\t') this.pos++;
    }

    skipComment() {
        if (this.peek() !== '#') return;
        while (!this.eof() && this.peek() !== '\n') this.pos++;
    }

    /** Skip spaces, newlines and comments (inside arrays / inline tables). */
    skipTrivia() {
        for (;;) {
            this.skipInlineSpace();
            if (this.peek() === '#') this.skipComment();
            else if (this.peek() === '\n' || this.peek() === '\r') this.pos++;
            else return;
        }
    }

    /** After a statement: optional spaces + comment, then end of line or file. */
    expectLineEnd() {
        this.skipInlineSpace();
        this.skipComment();
        if (this.peek() === '\r') this.pos++;
        if (this.eof()) return;
        if (this.peek() !== '\n') this.fail(`unexpected text "${this.text.slice(this.pos, this.pos + 20)}"`);
        this.pos++;
    }
}

function readBasicString(cur) {
    cur.pos++;
    let value = '';
    while (!cur.eof()) {
        const ch = cur.peek();
        if (ch === '\n') cur.fail('unterminated string');
        if (ch === '\\') {
            value += cur.text.slice(cur.pos, cur.pos + 2);
            cur.pos += 2;
            continue;
        }
        cur.pos++;
        if (ch === '"') return value;
        value += ch;
    }
    return cur.fail('unterminated string');
}

function readLiteralString(cur) {
    cur.pos++;
    const end = cur.text.indexOf("'", cur.pos);
    const newline = cur.text.indexOf('\n', cur.pos);
    if (end === -1 || (newline !== -1 && newline < end)) cur.fail('unterminated literal string');
    const value = cur.text.slice(cur.pos, end);
    cur.pos = end + 1;
    return value;
}

function readMultilineString(cur, delimiter) {
    cur.pos += 3;
    while (!cur.eof()) {
        if (delimiter === '"""' && cur.peek() === '\\') {
            cur.pos += 2;
            continue;
        }
        if (cur.startsWith(delimiter)) {
            cur.pos += 3;
            // Up to two extra quotes may close the string ("""a"""" is valid)
            for (let i = 0; i < 2 && cur.peek() === delimiter[0]; i++) cur.pos++;
            return;
        }
        cur.pos++;
    }
    cur.fail(`unterminated ${delimiter} string`);
}

/** Read a (possibly dotted, possibly quoted) key and return its segments. */
function readKey(cur) {
    const segments = [];
    for (;;) {
        cur.skipInlineSpace();
        const ch = cur.peek();
        if (ch === '"') segments.push(readBasicString(cur));
        else if (ch === "'") segments.push(readLiteralString(cur));
        else {
            const start = cur.pos;
            while (!cur.eof() && BARE_KEY_CHAR.test(cur.peek())) cur.pos++;
            if (start === cur.pos) cur.fail('expected a key');
            segments.push(cur.text.slice(start, cur.pos));
        }
        cur.skipInlineSpace();
        if (cur.peek() !== '.') return segments;
        cur.pos++;
    }
}

function readArray(cur) {
    cur.pos++;
    for (;;) {
        cur.skipTrivia();
        if (cur.peek() === ']') {
            cur.pos++;
            return;
        }
        readValue(cur);
        cur.skipTrivia();
        if (cur.peek() === ',') cur.pos++;
        else if (cur.peek() === ']') {
            cur.pos++;
            return;
        } else cur.fail('expected "," or "]" in array');
    }
}

/** Inline tables; newlines are tolerated (TOML 1.1). Returns the keys defined at the top level. */
function readInlineTable(cur) {
    cur.pos++;
    const keys = new Set();
    for (;;) {
        cur.skipTrivia();
        if (cur.peek() === '}') {
            cur.pos++;
            return keys;
        }
        const key = readKey(cur);
        const name = JSON.stringify(key);
        if (keys.has(name)) cur.fail(`duplicate key "${key.join('.')}" in inline table`);
        keys.add(name);
        if (cur.peek() !== '=') cur.fail('expected "=" in inline table');
        cur.pos++;
        cur.skipInlineSpace();
        readValue(cur);
        cur.skipTrivia();
        if (cur.peek() === ',') cur.pos++;
        else if (cur.peek() !== '}') cur.fail('expected "," or "}" in inline table');
    }
}

/** Advance past one value. @returns {'inline'|'value'} */
function readValue(cur) {
    if (cur.startsWith('"""')) readMultilineString(cur, '"""');
    else if (cur.startsWith("'''")) readMultilineString(cur, "'''");
    else if (cur.peek() === '"') readBasicString(cur);
    else if (cur.peek() === "'") readLiteralString(cur);
    else if (cur.peek() === '[') readArray(cur);
    else if (cur.peek() === '{') {
        readInlineTable(cur);
        return 'inline';
    } else {
        const start = cur.pos;
        while (!cur.eof() && !SCALAR_STOP.test(cur.peek())) cur.pos++;
        if (start === cur.pos) cur.fail('expected a value');
    }
    return 'value';
}

/** Tracks definitions to detect the redefinitions TOML forbids. */
class DefinitionTable {
    constructor() {
        this.kinds = new Map();
    }

    get(segments) {
        return this.kinds.get(JSON.stringify(segments));
    }

    set(segments, kind) {
        this.kinds.set(JSON.stringify(segments), kind);
    }

    /** New [[array]] element: forget everything defined inside the previous element. */
    resetBelow(segments) {
        const prefix = JSON.stringify(segments).slice(0, -1) + ',';
        for (const key of [...this.kinds.keys()]) if (key.startsWith(prefix)) this.kinds.delete(key);
    }

    defineHeader(segments, isArray, cur) {
        for (let i = 1; i < segments.length; i++) {
            const kind = this.get(segments.slice(0, i));
            if (kind === 'value' || kind === 'inline') cur.fail(`"${segments.slice(0, i).join('.')}" is not a table`);
            if (!kind) this.set(segments.slice(0, i), 'implicit');
        }
        const kind = this.get(segments);
        if (isArray) {
            if (kind && kind !== 'array') cur.fail(`"${segments.join('.')}" is already defined`);
            this.set(segments, 'array');
            this.resetBelow(segments);
            return;
        }
        if (kind && kind !== 'implicit') cur.fail(`table [${segments.join('.')}] is defined more than once`);
        this.set(segments, 'header');
    }

    defineKey(table, key, valueKind, cur) {
        for (let i = 1; i < key.length; i++) {
            const prefix = table.concat(key.slice(0, i));
            const kind = this.get(prefix);
            if (kind && kind !== 'dotted') cur.fail(`dotted key "${key.join('.')}" re-opens an existing table or value`);
            this.set(prefix, 'dotted');
        }
        const full = table.concat(key);
        if (this.get(full)) cur.fail(`key "${full.join('.')}" is defined more than once`);
        this.set(full, valueKind);
    }
}

function lineIndexAt(lineStarts, pos) {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (lineStarts[mid] <= pos) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}

function computeLineStarts(text) {
    const starts = [0];
    for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
    return starts;
}

function scanStatement(cur, state, lineStarts) {
    const startLine = lineIndexAt(lineStarts, cur.pos);
    if (cur.peek() === '[') {
        const isArray = cur.startsWith('[[');
        cur.pos += isArray ? 2 : 1;
        const segments = readKey(cur);
        if (!cur.startsWith(isArray ? ']]' : ']')) cur.fail('unterminated table header');
        cur.pos += isArray ? 2 : 1;
        state.defs.defineHeader(segments, isArray, cur);
        state.table = segments;
        cur.expectLineEnd();
        state.statements.push({ type: 'header', path: segments, isArray, startLine, endLine: startLine });
        return;
    }
    const key = readKey(cur);
    if (cur.peek() !== '=') cur.fail(`expected "=" after key "${key.join('.')}"`);
    cur.pos++;
    cur.skipInlineSpace();
    const valueStart = cur.pos;
    const kind = readValue(cur);
    const rawValue = cur.text.slice(valueStart, cur.pos);
    state.defs.defineKey(state.table, key, kind, cur);
    const endLine = lineIndexAt(lineStarts, Math.max(cur.pos - 1, valueStart));
    cur.expectLineEnd();
    state.statements.push({ type: 'kv', table: state.table, key, kind, rawValue, startLine, endLine });
}

/**
 * Scan a TOML document.
 * @param {string} text
 * @returns {{ ok: boolean, error: string|null, statements: Array<object>, defs: DefinitionTable }}
 *   statements carry 0-based startLine/endLine indexes into text.split('\n').
 */
function scanToml(text) {
    const source = text.replace(/^﻿/, '');
    const cur = new Cursor(source);
    const lineStarts = computeLineStarts(source);
    const state = { table: [], defs: new DefinitionTable(), statements: [] };
    try {
        while (!cur.eof()) {
            cur.skipInlineSpace();
            if (cur.peek() === '#' || cur.peek() === '\r' || cur.peek() === '\n' || cur.eof()) {
                cur.expectLineEnd();
                continue;
            }
            scanStatement(cur, state, lineStarts);
        }
        return { ok: true, error: null, statements: state.statements, defs: state.defs };
    } catch (error) {
        if (!(error instanceof TomlScanError)) throw error;
        return { ok: false, error: error.message, statements: state.statements, defs: state.defs };
    }
}

/** @returns {string|null} the first structural error, or null when the document is valid. */
function validateToml(text) {
    return scanToml(text).error;
}

module.exports = { scanToml, validateToml, TomlScanError };
