'use strict';

/**
 * Global instruction files the kit shares with the user (~/.claude/CLAUDE.md, ~/.codex/AGENTS.md,
 * ~/.gemini/GEMINI.md, ...). The kit's content always lives between
 * `<!-- boomopen-workflow-kit-START -->` and `<!-- boomopen-workflow-kit-END -->`, so:
 *  - the user's own text (before install, or added later outside the block) survives reinstall;
 *  - uninstall strips only the block and restores the pristine pre-install backup when the
 *    remaining text is exactly what the user had;
 *  - an unmarked whole-file kit copy (older releases, manual copies) is replaced in place, never
 *    duplicated, and kept as a timestamped backup when it differs from the new content;
 *  - uninstall deletes an unmarked kit copy only when it is exactly a known kit text; a copy the
 *    user edited (e.g. Claude Code '#' memories appended to it) is first saved as
 *    `<file>.boomopen-backup-<timestamp>`, and a damaged block (one marker missing) is never deleted;
 *  - a symlinked file (dotfiles managers) keeps its link: content is written through it.
 */

const fs = require('node:fs');
const {
    GEMINI_MARKER_START: KIT_BLOCK_START,
    GEMINI_MARKER_END: KIT_BLOCK_END,
    SETTINGS_MARKER_START,
    SETTINGS_MARKER_END,
    stripMarkedBlock,
    isKitOwnedText,
} = require('./markers.js');
const { BACKUP_SUFFIX, backupUserFile } = require('./user-files.js');
const { isSymlink, restoreBackup } = require('./manifest.js');

const LEGACY_BLOCK_PATTERN = /<!-- AGENT-ASSISTANT-START -->[\s\S]*?<!-- AGENT-ASSISTANT-END -->\s*/g;
const LEGACY_PREAMBLE_PATTERN =
    /skills\/agent-assistant\b|AGENT ASSISTANT\s*(?:v\d|[—–-]|â€”)|\bAgent Assistant Orchestrator\b|\bGitHub Copilot Orchestrator Instructions\b/i;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const STRAY_MARKER_LINE = new RegExp(`^[ \\t]*(?:${escapeRegExp(KIT_BLOCK_START)}|${escapeRegExp(KIT_BLOCK_END)})[ \\t]*(?:\\r?\\n|$)`, 'gm');

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return null;
        throw error;
    }
}

const normalize = (text) => text.replace(/\r\n/g, '\n').trimEnd();
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

function wrapKitBlock(content) {
    return `${KIT_BLOCK_START}\n${content.trimEnd()}\n${KIT_BLOCK_END}`;
}

/** Index range of the first complete kit block, or null. */
function findKitBlock(text) {
    const start = text.indexOf(KIT_BLOCK_START);
    if (start === -1) return null;
    const end = text.indexOf(KIT_BLOCK_END, start + KIT_BLOCK_START.length);
    if (end === -1) return null;
    return { start, end: end + KIT_BLOCK_END.length };
}

function withoutSettingsBlock(text) {
    return stripMarkedBlock(text, SETTINGS_MARKER_START, SETTINGS_MARKER_END).text;
}

function appendBlock(base, block) {
    return base.trim() === '' ? `${block}\n` : `${base.trimEnd()}\n\n${block}\n`;
}

/** Save a copy of text next to filePath with a timestamped backup name. */
function saveTimestampedCopy(filePath, text) {
    const copyPath = `${filePath}${BACKUP_SUFFIX}-${timestamp()}`;
    fs.writeFileSync(copyPath, text, 'utf8');
    return copyPath;
}

/** Rename an existing <file>.boomopen-backup to a timestamped name (kept, never restored). */
function retireStaleBackup(filePath) {
    const backupPath = filePath + BACKUP_SUFFIX;
    if (!fs.existsSync(backupPath)) return null;
    const retiredPath = `${backupPath}-${timestamp()}`;
    fs.renameSync(backupPath, retiredPath);
    return retiredPath;
}

/**
 * Compute the new file text for an install.
 * @returns {{ text: string, action: string, backups: string[] }}
 */
function planInstall(filePath, current, rendered) {
    const block = wrapKitBlock(rendered);
    if (current === null) {
        // A <file>.boomopen-backup left by an earlier install cycle no longer describes what the user
        // had before this install (they deleted the file), so uninstall must not bring it back.
        const retiredBackup = retireStaleBackup(filePath);
        return { text: `${block}\n`, action: 'created', backups: [], retiredBackup };
    }

    // Older releases could inject a settings block into the user's own text; the kit block carries
    // its own, so any copy outside it is dropped.
    const found = findKitBlock(current);
    if (found) {
        const backups = [];
        let before = withoutSettingsBlock(current.slice(0, found.start));
        if (LEGACY_PREAMBLE_PATTERN.test(before)) {
            backups.push(saveTimestampedCopy(filePath, current));
            before = '';
        }
        let after = stripMarkedBlock(current.slice(found.end), KIT_BLOCK_START, KIT_BLOCK_END).text;
        after = withoutSettingsBlock(after);
        const head = before.trim() === '' ? '' : `${before.trimEnd()}\n\n`;
        const text = head + block + (after.trim() ? `\n\n${after.trim()}\n` : '\n');
        return { text, action: text === current ? 'unchanged' : 'updated', backups };
    }

    const backups = [];
    let text = withoutSettingsBlock(current.replace(LEGACY_BLOCK_PATTERN, ''));
    if (text.includes(KIT_BLOCK_START) || text.includes(KIT_BLOCK_END)) {
        // Damaged block (one marker missing): keep a copy, then drop the stray marker lines.
        backups.push(saveTimestampedCopy(filePath, current));
        text = text.split(KIT_BLOCK_START).join('').split(KIT_BLOCK_END).join('');
    }

    if (isKitOwnedText(text) || LEGACY_PREAMBLE_PATTERN.test(text)) {
        // Unmarked whole-file kit copy: replace it, keeping the user's pre-kit original if one exists.
        if (normalize(withoutSettingsBlock(text)) !== normalize(withoutSettingsBlock(rendered))) {
            backups.push(saveTimestampedCopy(filePath, current));
        }
        const original = readTextSafe(filePath + BACKUP_SUFFIX);
        const base = original !== null && !isKitOwnedText(original) ? original : '';
        return { text: appendBlock(base, block), action: 'replaced-legacy', backups };
    }

    const backupPath = backupUserFile(filePath);
    if (backupPath) backups.push(backupPath);
    return { text: appendBlock(text, block), action: 'merged', backups };
}

/**
 * Install (or refresh) the kit block inside a shared instruction file.
 * @param {string} filePath destination
 * @param {string} rendered kit content with path placeholders already replaced
 * @returns {{ action: 'created'|'updated'|'unchanged'|'merged'|'replaced-legacy', backups: string[],
 *   retiredBackup: string|null }} retiredBackup: an older backup renamed so uninstall never restores it
 */
function installInstructionFile(filePath, rendered) {
    const current = readTextSafe(filePath);
    const plan = planInstall(filePath, current, rendered);
    if (plan.text !== current) fs.writeFileSync(filePath, plan.text, 'utf8');
    return { action: plan.action, backups: plan.backups, retiredBackup: plan.retiredBackup || null };
}

/** Delete a file the kit owns; a symlink is kept (and emptied through the link) instead. */
function removeKitFile(filePath) {
    if (isSymlink(filePath)) fs.writeFileSync(filePath, '', 'utf8');
    else fs.unlinkSync(filePath);
}

/** The user's own pre-install backup, when one exists. */
function readUserBackup(backupPath) {
    const backup = readTextSafe(backupPath);
    return backup !== null && !isKitOwnedText(backup) ? backup : null;
}

const sameKitText = (a, b) => normalize(withoutSettingsBlock(a)) === normalize(withoutSettingsBlock(b));

/**
 * No complete kit block: a damaged block (one marker left) or an unmarked whole-file kit copy.
 * Nothing the user wrote is deleted without a timestamped copy.
 */
function uninstallWithoutBlock(filePath, current, kitTexts) {
    if (current.includes(KIT_BLOCK_START) || current.includes(KIT_BLOCK_END)) {
        const savedCopy = saveTimestampedCopy(filePath, current);
        const text = current.replace(STRAY_MARKER_LINE, '').split(KIT_BLOCK_START).join('').split(KIT_BLOCK_END).join('');
        if (text.trim() === '') removeKitFile(filePath);
        else fs.writeFileSync(filePath, text, 'utf8');
        return { action: 'damaged', savedCopy };
    }
    if (!isKitOwnedText(current)) return { action: 'kept' };

    const pristine = kitTexts.some((kitText) => sameKitText(kitText, current));
    const savedCopy = pristine ? undefined : saveTimestampedCopy(filePath, current);
    const backupPath = filePath + BACKUP_SUFFIX;
    if (readUserBackup(backupPath) !== null) {
        restoreBackup(backupPath, filePath);
        return { action: 'restored', backupPath, savedCopy };
    }
    removeKitFile(filePath);
    return { action: 'removed', savedCopy };
}

/**
 * Remove the kit from a shared instruction file.
 * @param {string} filePath
 * @param {{ kitTexts?: string[] }} [options] kitTexts: rendered kit contents; an unmarked kit copy is
 *   deleted without a saved copy only when it equals one of them
 * @returns {{ action: 'missing'|'kept'|'removed'|'restored'|'stripped'|'damaged', backupPath?: string,
 *   savedCopy?: string }} savedCopy: where the file's previous text was saved before it was changed
 */
function uninstallInstructionFile(filePath, options = {}) {
    const current = readTextSafe(filePath);
    if (current === null) return { action: 'missing' };
    if (!findKitBlock(current)) return uninstallWithoutBlock(filePath, current, options.kitTexts || []);

    const backupPath = filePath + BACKUP_SUFFIX;
    let remaining = stripMarkedBlock(current, KIT_BLOCK_START, KIT_BLOCK_END).text;
    remaining = withoutSettingsBlock(remaining);
    const backup = readUserBackup(backupPath);

    if (backup !== null && (remaining.trim() === '' || normalize(remaining) === normalize(backup))) {
        restoreBackup(backupPath, filePath);
        return { action: 'restored', backupPath };
    }
    if (remaining.trim() === '') {
        removeKitFile(filePath);
        return { action: 'removed' };
    }
    fs.writeFileSync(filePath, remaining, 'utf8');
    return { action: 'stripped', backupPath: backup !== null ? backupPath : undefined };
}

/** True when the file carries the kit's block (or is a legacy whole-file kit copy). */
function hasKitContent(filePath) {
    const current = readTextSafe(filePath);
    return current !== null && (findKitBlock(current) !== null || isKitOwnedText(current));
}

module.exports = {
    KIT_BLOCK_START,
    KIT_BLOCK_END,
    wrapKitBlock,
    installInstructionFile,
    uninstallInstructionFile,
    hasKitContent,
};
