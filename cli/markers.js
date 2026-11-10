'use strict';

/**
 * Markers and the ownership signature the kit uses inside files it shares with users.
 * Pure string helpers with no dependencies, so settings.js and user-files.js can both use them.
 */

const SETTINGS_MARKER_START = '<!-- BOOMOPEN-SETTINGS-START -->';
const SETTINGS_MARKER_END = '<!-- BOOMOPEN-SETTINGS-END -->';

const GEMINI_MARKER_START = '<!-- boomopen-workflow-kit-START -->';
const GEMINI_MARKER_END = '<!-- boomopen-workflow-kit-END -->';

const CODEX_MARKER_START = '# === boomopen-workflow-kit START ===';
const CODEX_MARKER_END = '# === boomopen-workflow-kit END ===';

// Kit instruction files identify themselves in their header, e.g.
// "# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5 ...)" or front-matter
// "name: BoomOpen Workflow Kit". A mere mention of the kit inside a user's file does not count.
const KIT_HEADER_PATTERNS = [
    /^#\s+\S+\.md\s+—\s+.*(?:Orchestrator Instructions|BoomOpen Workflow Kit)/,
    /^name:\s*BoomOpen Workflow Kit\b/,
    // platforms/antigravity/GEMINI.md: "# ⚡ BoomOpen Workflow Kit v5.5 — GEMINI/ANTIGRAVITY ..."
    /^#\s+(?:⚡\s*)?BoomOpen Workflow Kit v\d+(?:\.\d+)*\s+—/,
];
const KIT_HEADER_SCAN_LINES = 4;

/**
 * Remove every `start ... end` block (markers included) and re-join the surrounding text.
 * @returns {{ text: string, found: boolean }}
 */
function stripMarkedBlock(text, startMarker, endMarker) {
    let result = text;
    let found = false;
    let startIdx = result.indexOf(startMarker);
    while (startIdx !== -1) {
        const endIdx = result.indexOf(endMarker, startIdx + startMarker.length);
        if (endIdx === -1) break;
        const before = result.slice(0, startIdx).trimEnd();
        const after = result.slice(endIdx + endMarker.length).trimStart();
        const glue = before && after ? '\n\n' : '';
        result = before + glue + after;
        found = true;
        startIdx = result.indexOf(startMarker);
    }
    if (!found) return { text: result, found };
    return { text: result.trim() === '' ? '' : result.trimEnd() + '\n', found };
}

/**
 * A file is kit-owned when it starts with a kit header (ignoring the injected settings block and
 * front-matter / code-fence openers) or contains the kit's marked block (merged GEMINI.md).
 */
function isKitOwnedText(text) {
    if (typeof text !== 'string') return false;
    if (text.includes(GEMINI_MARKER_START)) return true;
    const withoutSettings = stripMarkedBlock(text, SETTINGS_MARKER_START, SETTINGS_MARKER_END).text;
    const headLines = withoutSettings
        .replace(/^﻿/, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line !== '' && line !== '---' && !line.startsWith('```'))
        .slice(0, KIT_HEADER_SCAN_LINES);
    return headLines.some((line) => KIT_HEADER_PATTERNS.some((pattern) => pattern.test(line)));
}

module.exports = {
    SETTINGS_MARKER_START,
    SETTINGS_MARKER_END,
    GEMINI_MARKER_START,
    GEMINI_MARKER_END,
    CODEX_MARKER_START,
    CODEX_MARKER_END,
    stripMarkedBlock,
    isKitOwnedText,
};
