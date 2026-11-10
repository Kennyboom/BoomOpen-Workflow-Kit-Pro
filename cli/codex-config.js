'use strict';

/**
 * Merge / un-merge the kit's multi-agent configuration into ~/.codex/config.toml.
 *
 * Rules (every result is re-scanned with toml-lite and rejected if it would not parse):
 *  - tables are only ever appended inside the managed block at the end of the file;
 *  - tables or keys the user already defines are never redefined ([agents], [agents.<role>],
 *    [features], dotted features.* keys, inline tables): the kit skips them and says so;
 *  - single lines the kit adds outside the block end with KIT_LINE_TAG;
 *  - a user line the kit rewrites (project_doc_fallback_filenames) is tagged KIT_MERGED_TAG and its
 *    original text is stored inside the block, so uninstall restores it byte-for-byte;
 *  - edits the user makes to tagged lines are folded back into their own config (reinstall and
 *    uninstall keep them): e.g. a name added to the merged list, or multi_agent switched off;
 *  - the block stores a hash of its body, so an edit inside the block can be detected (and the
 *    file backed up) before a reinstall resets it;
 *  - a leading UTF-8 BOM (Windows PowerShell 5.1) is set aside while editing and put back.
 */

const crypto = require('node:crypto');

const { CODEX_MARKER_START, CODEX_MARKER_END, stripMarkedBlock } = require('./markers.js');
const { scanToml } = require('./toml-lite.js');

const KIT_LINE_TAG = '# boomopen-workflow-kit';
const KIT_MERGED_TAG = '# boomopen-workflow-kit:merged';
const ORIGINAL_LINE_PREFIX = '# boomopen-original-line: ';
const BLOCK_HASH_PREFIX = '# boomopen-block-sha256: ';
const FORMAT_LINE = '# boomopen-config-format: 2';
const BOM = '﻿';
const FALLBACK_KEY = 'project_doc_fallback_filenames';
const KIT_FALLBACK_FILES = ['AGENT.md', 'CODEX.md', 'AGENTS.md', '.agents.md'];
const AGENTS_TABLE = 'agents';
const FEATURES_TABLE = 'features';
const MULTI_AGENT_KEY = 'multi_agent';

class CodexConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CodexConfigError';
    }
}

const keyOf = (segments) => JSON.stringify(segments);

function splitLines(text) {
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    return { lines: text.split(/\r?\n/), eol };
}

function quoteList(values) {
    return `[${values.map((v) => JSON.stringify(v)).join(', ')}]`;
}

/** String items of a TOML array literal, or null when it holds anything but simple strings. */
function parseStringArray(rawValue) {
    const body = rawValue.trim();
    if (!body.startsWith('[') || !body.endsWith(']')) return null;
    const inner = body.slice(1, -1);
    const items = [];
    const token = /\s+|,|#[^\n]*|"((?:[^"\\\n]|\\.)*)"|'([^'\n]*)'/y;
    while (token.lastIndex < inner.length) {
        const start = token.lastIndex;
        const match = token.exec(inner);
        if (!match || token.lastIndex === start) return null;
        if (match[1] !== undefined) {
            try {
                items.push(JSON.parse(`"${match[1]}"`));
            } catch (error) {
                if (error instanceof SyntaxError) return null;
                throw error;
            }
        } else if (match[2] !== undefined) {
            items.push(match[2]);
        }
    }
    return items;
}

/** Sections of the bundled template: [{ path, lines }] for every table header. */
function parseTemplate(templateText) {
    const scan = scanToml(templateText);
    if (!scan.ok) throw new CodexConfigError(`bundled config template is invalid: ${scan.error}`);
    const { lines } = splitLines(templateText);
    const headers = scan.statements.filter((s) => s.type === 'header');
    return headers.map((header, i) => {
        const nextStart = i + 1 < headers.length ? headers[i + 1].startLine : lines.length;
        const body = lines.slice(header.startLine, nextStart).filter((l) => l.trim() !== '' && !l.trim().startsWith('#'));
        return { path: header.path, lines: body };
    });
}

// ---------------------------------------------------------------------------
// Un-merge
// ---------------------------------------------------------------------------

function readStoredOriginals(blockText) {
    const originals = [];
    for (const line of blockText.split(/\r?\n/)) {
        if (!line.startsWith(ORIGINAL_LINE_PREFIX)) continue;
        try {
            originals.push(JSON.parse(line.slice(ORIGINAL_LINE_PREFIX.length)));
        } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
        }
    }
    return originals;
}

function extractBlock(text) {
    const start = text.indexOf(CODEX_MARKER_START);
    if (start === -1) return { blockText: '', hasBlock: false };
    const end = text.indexOf(CODEX_MARKER_END, start);
    if (end === -1) {
        throw new CodexConfigError(`config.toml has "${CODEX_MARKER_START}" without "${CODEX_MARKER_END}"; fix it by hand`);
    }
    return { blockText: text.slice(start, end), hasBlock: true };
}

/** Split a leading UTF-8 BOM off the text. */
function splitBom(text) {
    return text.startsWith(BOM) ? { bom: BOM, body: text.slice(BOM.length) } : { bom: '', body: text };
}

/** String items of a `project_doc_fallback_filenames = [...]` line, or null for any other line. */
function fallbackValues(line) {
    const match = /^\s*project_doc_fallback_filenames\s*=\s*([\s\S]*)$/.exec(line);
    return match ? parseStringArray(match[1]) : null;
}

const sameList = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);
const squash = (line) => line.replace(/\s+/g, '');

/**
 * The user's line behind a KIT_MERGED_TAG line: the stored original when the line is still what the
 * kit wrote, otherwise the user's edited list without the names the kit added.
 */
function unmergeMergedLine(body, original) {
    const current = fallbackValues(body);
    if (typeof original !== 'string' || current === null) return [body]; // no stored original, or rewritten by hand
    const originalValues = fallbackValues(original);
    if (originalValues === null) return original.split(/\r?\n/);
    const kitAdded = KIT_FALLBACK_FILES.filter((name) => !originalValues.includes(name));
    if (sameList(current, originalValues.concat(kitAdded))) return original.split(/\r?\n/);
    return [`${FALLBACK_KEY} = ${quoteList(current.filter((name) => !kitAdded.includes(name)))}`];
}

const PRISTINE_KIT_LINES = new Set(
    [`${FALLBACK_KEY} = ${quoteList(KIT_FALLBACK_FILES)}`, `${FEATURES_TABLE}.${MULTI_AGENT_KEY} = true`, `${MULTI_AGENT_KEY} = true`].map(squash)
);

/** What is left of a KIT_LINE_TAG line: nothing while unchanged, the user's edit otherwise. */
function unmergeKitLine(body) {
    if (body === '' || PRISTINE_KIT_LINES.has(squash(body))) return [];
    const values = fallbackValues(body);
    if (values === null) return [body]; // e.g. multi_agent switched to false: now the user's line
    const own = values.filter((name) => !KIT_FALLBACK_FILES.includes(name));
    return own.length ? [`${FALLBACK_KEY} = ${quoteList(own)}`] : [];
}

/**
 * Remove everything the kit added. Returns '' when nothing user-authored remains.
 * Edits the user made to tagged lines are kept as their own lines.
 * @param {string} text current config.toml
 * @returns {{ text: string, isLegacy: boolean }} isLegacy: block written by an older kit (no format line)
 */
function unmergeCodexConfigText(text) {
    const { bom, body: source } = splitBom(text);
    const { blockText, hasBlock } = extractBlock(source);
    const originals = readStoredOriginals(blockText);
    const isLegacy = hasBlock && !blockText.includes(FORMAT_LINE);
    const stripped = stripMarkedBlock(source, CODEX_MARKER_START, CODEX_MARKER_END).text;
    const { lines, eol } = splitLines(stripped);
    const out = [];
    for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed.endsWith(KIT_MERGED_TAG)) {
            out.push(...unmergeMergedLine(trimmed.slice(0, -KIT_MERGED_TAG.length).trimEnd(), originals.shift()));
        } else if (trimmed.endsWith(` ${KIT_LINE_TAG}`) || trimmed === KIT_LINE_TAG) {
            out.push(...unmergeKitLine(trimmed.slice(0, -KIT_LINE_TAG.length).trimEnd()));
        } else {
            out.push(line);
        }
    }
    const result = out.join(eol);
    return { text: result.trim() === '' ? '' : bom + result.trimEnd() + eol, isLegacy };
}

/** sha256 of the block's TOML lines (comments and blank lines excluded). */
function hashBlockBody(lines) {
    const body = lines.map((l) => l.trimEnd()).filter((l) => l.trim() !== '' && !l.trim().startsWith('#'));
    return crypto.createHash('sha256').update(body.join('\n')).digest('hex');
}

/**
 * True when the TOML inside the kit's managed block differs from what the kit wrote (the user
 * edited it); a reinstall would reset those edits. Blocks without a stored hash report false.
 * @param {string} text current config.toml
 */
function isManagedBlockEdited(text) {
    let blockText;
    try {
        blockText = extractBlock(splitBom(text).body).blockText;
    } catch (error) {
        if (error instanceof CodexConfigError) return false;
        throw error;
    }
    const lines = blockText.split(/\r?\n/);
    const hashLine = lines.find((line) => line.startsWith(BLOCK_HASH_PREFIX));
    if (!hashLine) return false;
    return hashLine.slice(BLOCK_HASH_PREFIX.length).trim() !== hashBlockBody(lines.slice(1));
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

function analyze(scan) {
    const rootKvs = scan.statements.filter((s) => s.type === 'kv' && s.table.length === 0);
    const lastRootLine = rootKvs.length ? Math.max(...rootKvs.map((s) => s.endLine)) + 1 : 0;
    return { rootKvs, rootInsertAt: lastRootLine };
}

function planFallback(info, edits, notes) {
    const existing = info.rootKvs.find((s) => s.key.length === 1 && s.key[0] === FALLBACK_KEY);
    if (!existing) {
        edits.rootLines.push(`${FALLBACK_KEY} = ${quoteList(KIT_FALLBACK_FILES)} ${KIT_LINE_TAG}`);
        return;
    }
    const values = parseStringArray(existing.rawValue);
    if (!values) {
        notes.push(`${FALLBACK_KEY} is not a plain string array; left unchanged`);
        return;
    }
    const missing = KIT_FALLBACK_FILES.filter((name) => !values.includes(name));
    if (missing.length === 0) return;
    edits.replace = {
        startLine: existing.startLine,
        endLine: existing.endLine,
        line: `${FALLBACK_KEY} = ${quoteList(values.concat(missing))} ${KIT_MERGED_TAG}`,
    };
}

function planFeatures(scan, edits, notes) {
    const featuresKind = scan.defs.get([FEATURES_TABLE]);
    const multiAgentKind = scan.defs.get([FEATURES_TABLE, MULTI_AGENT_KEY]);
    if (multiAgentKind) {
        const stmt = scan.statements.find(
            (s) => s.type === 'kv' && keyOf(s.table.concat(s.key)) === keyOf([FEATURES_TABLE, MULTI_AGENT_KEY])
        );
        if (stmt && stmt.rawValue.trim() !== 'true') notes.push('features.multi_agent is disabled in your config; kit agents need it enabled');
        return;
    }
    if (featuresKind === 'header') {
        const header = scan.statements.find((s) => s.type === 'header' && keyOf(s.path) === keyOf([FEATURES_TABLE]));
        edits.afterLine.set(header.startLine, `${MULTI_AGENT_KEY} = true ${KIT_LINE_TAG}`);
        return;
    }
    if (featuresKind === 'dotted') {
        edits.rootLines.push(`${FEATURES_TABLE}.${MULTI_AGENT_KEY} = true ${KIT_LINE_TAG}`);
        return;
    }
    if (featuresKind === 'inline' || featuresKind === 'value' || featuresKind === 'array') {
        notes.push('"features" is an inline table or array in your config; add multi_agent = true yourself');
        return;
    }
    edits.blockSections.push([`[${FEATURES_TABLE}]`, `${MULTI_AGENT_KEY} = true`]);
}

function planAgents(scan, template, edits, notes) {
    const agentsKind = scan.defs.get([AGENTS_TABLE]);
    if (agentsKind === 'inline' || agentsKind === 'value' || agentsKind === 'array') {
        notes.push('"agents" is an inline table or array in your config; kit agent roles were not registered');
        return;
    }
    const skippedRoles = [];
    for (const section of template.filter((s) => s.path[0] === AGENTS_TABLE)) {
        if (section.path.length === 1) {
            if (!agentsKind || agentsKind === 'implicit') edits.blockSections.push(section.lines);
            continue;
        }
        if (scan.defs.get(section.path)) {
            skippedRoles.push(section.path.slice(1).join('.'));
            continue;
        }
        edits.blockSections.push(section.lines);
    }
    if (skippedRoles.length) notes.push(`kept your own agent roles: ${skippedRoles.join(', ')}`);
}

function applyEdits(text, info, edits) {
    const { lines, eol } = splitLines(text);
    const out = [];
    for (let i = 0; i <= lines.length; i++) {
        if (i === info.rootInsertAt && edits.rootLines.length) out.push(...edits.rootLines);
        if (i === lines.length) break;
        if (edits.replace && i >= edits.replace.startLine && i <= edits.replace.endLine) {
            if (i === edits.replace.startLine) out.push(edits.replace.line);
            continue;
        }
        out.push(lines[i]);
        if (edits.afterLine.has(i)) out.push(edits.afterLine.get(i));
    }
    return { body: out.join(eol), eol, lines };
}

function buildBlock(edits, original, eol) {
    const blockLines = [
        CODEX_MARKER_START,
        '# Managed by BoomOpen Workflow Kit — do not edit inside this block: a reinstall resets it',
        '# (your edited config.toml is backed up first) and `boomopen uninstall codex` removes it.',
        '# To change a value, define the table or key yourself outside this block; the kit then skips it.',
        FORMAT_LINE,
    ];
    if (original !== null) blockLines.push(ORIGINAL_LINE_PREFIX + JSON.stringify(original));
    const body = [];
    for (const section of edits.blockSections) body.push('', ...section);
    blockLines.push(BLOCK_HASH_PREFIX + hashBlockBody(body), ...body, CODEX_MARKER_END);
    return blockLines.join(eol);
}

/**
 * @param {string} userText current config.toml ('' when missing)
 * @param {string} templateText bundled platforms/codex/config.toml
 * @returns {{ text: string, notes: string[] }}
 * @throws {CodexConfigError} when the existing file or the result is not valid TOML
 */
function mergeCodexConfigText(userText, templateText) {
    const template = parseTemplate(templateText);
    // The BOM is set aside: inserted root lines must never land between it and the first line.
    const { bom, body: userBody } = splitBom(userText);
    const cleaned = unmergeCodexConfigText(userBody).text;
    const scan = scanToml(cleaned);
    if (!scan.ok) throw new CodexConfigError(`your config.toml is not valid TOML (${scan.error}); not modified`);

    const notes = [];
    const info = analyze(scan);
    const edits = { rootLines: [], afterLine: new Map(), replace: null, blockSections: [] };
    planFallback(info, edits, notes);
    planFeatures(scan, edits, notes);
    planAgents(scan, template, edits, notes);

    const { body, eol, lines } = applyEdits(cleaned, info, edits);
    const original = edits.replace ? lines.slice(edits.replace.startLine, edits.replace.endLine + 1).join(eol) : null;
    const prefix = body.trim() === '' ? '' : body.trimEnd() + eol + eol;
    const text = prefix + buildBlock(edits, original, eol) + eol;

    const check = scanToml(text);
    if (!check.ok) throw new CodexConfigError(`merging would produce invalid TOML (${check.error}); not modified`);
    return { text: bom + text, notes };
}

module.exports = {
    KIT_LINE_TAG,
    KIT_MERGED_TAG,
    KIT_FALLBACK_FILES,
    CodexConfigError,
    mergeCodexConfigText,
    isManagedBlockEdited,
    unmergeCodexConfigText,
    parseStringArray,
};
