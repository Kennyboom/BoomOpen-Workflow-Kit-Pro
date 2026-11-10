'use strict';

/**
 * Ownership-aware helpers for files the kit writes into tool folders that users share
 * (~/.claude, ~/.codex, ~/.cursor, ~/.copilot, ~/.gemini, ~/.antigravity).
 *
 * Contract: the kit never destroys content it did not ship.
 *  - Before overwriting a user-owned instruction file, keep a byte-exact backup.
 *  - Restore backups on uninstall and strip only the kit's marked blocks from merged files.
 *
 * The installer tracks shared-folder files with the install manifest (manifest.js) and merges
 * instruction files as marked blocks (instruction-files.js). The helpers below handle the
 * backups and the configs written by releases before those modules existed.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
    GEMINI_MARKER_START,
    GEMINI_MARKER_END,
    CODEX_MARKER_START,
    CODEX_MARKER_END,
    stripMarkedBlock,
    isKitOwnedText,
} = require('./markers.js');

const BACKUP_SUFFIX = '.boomopen-backup';
const CODEX_DOC_FALLBACK = 'project_doc_fallback_filenames = ["AGENT.md", "CODEX.md", "AGENTS.md", ".agents.md"]';
// Key + array only: a trailing comment stays where it is, and the match can never run past
// the array into later tables (array strings never contain ']' for this key).
const CODEX_DOC_FALLBACK_PATTERN = /^[ \t]*project_doc_fallback_filenames\s*=\s*\[[^\]]*\]/m;
const CODEX_FEATURE_LINE = '[features]\nmulti_agent = true';

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return null;
        throw error;
    }
}

function timestampSuffix() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Keep a byte-exact copy of a user-owned file before the kit overwrites it.
 * The newest user version always lives at `<file>.boomopen-backup`; an older backup is
 * rotated to `<file>.boomopen-backup-<timestamp>` so nothing is ever lost.
 * @returns {string|null} backup path, or null when no backup was needed
 */
function backupUserFile(filePath, options = {}) {
    const isKitOwned = options.isKitOwned || isKitOwnedText;
    const current = readTextSafe(filePath);
    if (current === null || isKitOwned(current)) return null;

    const backupPath = filePath + BACKUP_SUFFIX;
    if (fs.existsSync(backupPath)) {
        const previous = readTextSafe(backupPath);
        if (previous === current) return backupPath;
        fs.renameSync(backupPath, `${backupPath}-${timestampSuffix()}`);
    }
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
}

/**
 * Uninstall counterpart of backupUserFile: delete the kit's copy and put the user's file back.
 * A file the user rewrote after install (no kit signature) is left untouched.
 * @returns {{ removed: boolean, restored: boolean, kept: boolean }}
 */
function restoreOrRemoveUserFile(filePath, options = {}) {
    const isKitOwned = options.isKitOwned || isKitOwnedText;
    const outcome = { removed: false, restored: false, kept: false };
    const current = readTextSafe(filePath);

    if (current !== null) {
        if (!isKitOwned(current)) {
            outcome.kept = true;
            return outcome;
        }
        fs.unlinkSync(filePath);
        outcome.removed = true;
    }

    const backupPath = filePath + BACKUP_SUFFIX;
    if (fs.existsSync(backupPath)) {
        fs.renameSync(backupPath, filePath);
        outcome.restored = true;
    }
    return outcome;
}

/** Delete a file only when it is kit-owned (used for legacy cleanups). */
function removeIfKitOwned(filePath) {
    const current = readTextSafe(filePath);
    if (current === null || !isKitOwnedText(current)) return false;
    fs.unlinkSync(filePath);
    return true;
}

function listTree(srcDir, relDir = '', acc = { files: [], dirs: [] }) {
    const entries = fs.readdirSync(path.join(srcDir, relDir), { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isSymbolicLink()) continue;
        const rel = path.join(relDir, entry.name);
        if (entry.isDirectory()) {
            acc.dirs.push(rel);
            listTree(srcDir, rel, acc);
        } else if (entry.isFile()) {
            acc.files.push(rel);
        }
    }
    return acc;
}

function removeDirIfEmpty(dirPath) {
    try {
        if (fs.readdirSync(dirPath).length > 0) return false;
        fs.rmdirSync(dirPath);
        return true;
    } catch (error) {
        if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return false;
        throw error;
    }
}

/**
 * Remove from destDir only the files whose relative paths exist in srcDir (what the kit
 * copied there), then prune directories the kit created if they end up empty.
 * Anything else in destDir (user commands, agents, workflows) survives.
 * @returns {string[]} removed paths
 */
function removeMirroredFiles(srcDir, destDir) {
    const removed = [];
    if (!fs.existsSync(srcDir) || !fs.existsSync(destDir)) return removed;

    const { files, dirs } = listTree(srcDir);
    for (const rel of files) {
        const target = path.join(destDir, rel);
        let stat = null;
        try {
            stat = fs.lstatSync(target);
        } catch (error) {
            if (error && error.code === 'ENOENT') continue;
            throw error;
        }
        if (!stat.isFile()) continue;
        fs.unlinkSync(target);
        removed.push(target);
    }

    const deepestFirst = [...dirs].sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
    for (const rel of deepestFirst) {
        const target = path.join(destDir, rel);
        if (removeDirIfEmpty(target)) removed.push(target);
    }
    if (removeDirIfEmpty(destDir)) removed.push(destDir);
    return removed;
}

/**
 * Strip the kit's marked block from a merged file (e.g. ~/.gemini/GEMINI.md).
 * Deletes the file only when nothing but the kit block was in it.
 * @returns {'missing'|'unchanged'|'updated'|'deleted'}
 */
function removeMarkedBlockFromFile(filePath, startMarker, endMarker) {
    const current = readTextSafe(filePath);
    if (current === null) return 'missing';
    const { text, found } = stripMarkedBlock(current, startMarker, endMarker);
    if (!found) return 'unchanged';
    if (text.trim() === '') {
        fs.unlinkSync(filePath);
        return 'deleted';
    }
    fs.writeFileSync(filePath, text, 'utf8');
    return 'updated';
}

/**
 * Undo what mergeCodexConfig added to ~/.codex/config.toml.
 * @param {string} configText current config.toml
 * @param {string|null} originalText pre-install backup, when one exists
 * @returns {string} cleaned config ('' when nothing user-authored remains)
 */
function stripCodexManagedConfig(configText, originalText = null) {
    let text = stripMarkedBlock(configText, CODEX_MARKER_START, CODEX_MARKER_END).text;

    if (text.includes(CODEX_DOC_FALLBACK)) {
        const originalMatch = originalText ? originalText.match(CODEX_DOC_FALLBACK_PATTERN) : null;
        if (originalMatch) {
            text = text.replace(CODEX_DOC_FALLBACK, originalMatch[0].trim());
        } else {
            text = text.replace(new RegExp(`^[ \\t]*${escapeRegExp(CODEX_DOC_FALLBACK)}[ \\t]*\\r?\\n?`, 'm'), '');
        }
    }

    const injectedFeature = originalText !== null && !originalText.includes('multi_agent');
    if (injectedFeature && text.includes(CODEX_FEATURE_LINE)) {
        text = text.replace(CODEX_FEATURE_LINE, '[features]');
    }

    return text.trim() === '' ? '' : text.trimEnd() + '\n';
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    BACKUP_SUFFIX,
    GEMINI_MARKER_START,
    GEMINI_MARKER_END,
    CODEX_MARKER_START,
    CODEX_MARKER_END,
    CODEX_DOC_FALLBACK,
    stripMarkedBlock,
    isKitOwnedText,
    backupUserFile,
    restoreOrRemoveUserFile,
    removeIfKitOwned,
    removeMirroredFiles,
    removeMarkedBlockFromFile,
    stripCodexManagedConfig,
};
