'use strict';

/**
 * Building blocks of one install / uninstall: copying kit trees (framework, shared folders),
 * instruction-file blocks, the Codex config merge and the cleanup of pre-manifest installs.
 * Every step records failures with logError instead of throwing, so one bad file never aborts a run.
 */

const fs = require('node:fs');
const path = require('node:path');

const { listSourceFiles, renderFile, applyReplacements } = require('./copy-engine.js');
const { progressState, tick, logError, printLine } = require('./progress.js');
const { installInstructionFile, uninstallInstructionFile } = require('./instruction-files.js');
const { mergeCodexConfigText, unmergeCodexConfigText, isManagedBlockEdited } = require('./codex-config.js');
const { BACKUP_SUFFIX, backupUserFile, stripCodexManagedConfig } = require('./user-files.js');
const { CODEX_MARKER_START } = require('./markers.js');
const { moveFile, removeDirIfEmpty, isSymlink, restoreBackup } = require('./manifest.js');
const { FRAMEWORK_FILE_LIST } = require('./tool-config.js');

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return null;
        throw error;
    }
}

/**
 * Copy a kit tree. With a ledger the destination is a shared folder (tracked + backed up);
 * without one it is the kit-owned framework folder (plain writes).
 * @returns {number} files written
 */
function copyTree(src, dest, replacements, ledger = null) {
    let count = 0;
    for (const { rel, abs } of listSourceFiles(src)) {
        const target = path.join(dest, rel);
        try {
            const data = renderFile(abs, replacements);
            if (ledger) {
                ledger.writeFile(target, data, dest);
            } else {
                fs.mkdirSync(path.dirname(target), { recursive: true });
                fs.writeFileSync(target, data);
            }
            progressState.copiedFiles.push(target);
            tick();
            count++;
        } catch (error) {
            logError('copy', abs, error);
        }
    }
    return count;
}

/** Copy one kit file into a shared folder through the ledger. */
function copySharedFile(src, dest, replacements, ledger) {
    try {
        ledger.writeFile(dest, renderFile(src, replacements));
        progressState.copiedFiles.push(dest);
        tick();
        return 1;
    } catch (error) {
        logError('copy', src, error);
        return 0;
    }
}

function describeInstructionResult(dest, result) {
    for (const backup of result.backups) printLine(`  💾 Saved your previous ${path.basename(dest)} → ${backup}`);
    if (result.retiredBackup) {
        printLine(`  💾 Kept an older ${path.basename(dest)} backup as ${result.retiredBackup} (not restored on uninstall)`);
    }
    if (result.action === 'merged') printLine(`  🔗 Added the kit block to your ${dest} (your text is kept above it)`);
}

/** Install the kit block into each shared instruction file. */
function installInstructionFiles(entries, replacements) {
    let count = 0;
    for (const { src, dest } of entries) {
        try {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            const rendered = applyReplacements(fs.readFileSync(src, 'utf8'), replacements);
            describeInstructionResult(dest, installInstructionFile(dest, rendered));
            progressState.copiedFiles.push(dest);
            tick();
            count++;
        } catch (error) {
            logError('instructions', dest, error);
        }
    }
    return count;
}

function describeUninstallResult(filePath, result) {
    if (result.savedCopy) printLine(`  💾 Saved the previous ${path.basename(filePath)} (it had text that is not the kit's) → ${result.savedCopy}`);
    if (result.action === 'restored') printLine(`  ♻️  Restored your original ${filePath}`);
    if (result.action === 'stripped') printLine(`  ✂️  Removed the kit block from ${filePath} (your text is kept)`);
    if (result.action === 'damaged') {
        printLine(`  ⚠️  The kit block in ${filePath} was damaged (a marker is missing): only the stray marker was removed;`);
        printLine('      delete any remaining kit text by hand if you no longer want it.');
    }
}

/**
 * Remove the kit from shared instruction files (current and legacy names).
 * @param {string[]} paths
 * @param {string[]} kitTexts rendered kit contents (an unmarked copy equal to one is deleted without a saved copy)
 */
function uninstallInstructionFiles(paths, kitTexts = []) {
    let count = 0;
    for (const filePath of paths) {
        try {
            const result = uninstallInstructionFile(filePath, { kitTexts });
            if (result.action === 'missing' || result.action === 'kept') continue;
            progressState.removedPaths.push(filePath);
            tick();
            count++;
            describeUninstallResult(filePath, result);
        } catch (error) {
            logError('instructions', filePath, error);
        }
    }
    return count;
}

/** Rebuild the kit-owned framework folder from scratch. */
function installFramework(frameworkPath, root, coreDirs, rootFiles, hooksSrc, replacements, verbatimDirs) {
    let count = 0;
    try {
        fs.rmSync(frameworkPath, { recursive: true, force: true });
        fs.mkdirSync(frameworkPath, { recursive: true });
    } catch (error) {
        logError('framework', frameworkPath, error);
        return 0;
    }
    for (const dir of coreDirs) {
        const map = verbatimDirs.has(dir) ? null : replacements;
        count += copyTree(path.join(root, dir), path.join(frameworkPath, dir), map);
    }
    // Back-compat: commands are also published as workflows/
    count += copyTree(path.join(root, 'commands'), path.join(frameworkPath, 'workflows'), replacements);
    count += copyTree(hooksSrc, path.join(frameworkPath, 'hooks'), null);
    for (const file of rootFiles) {
        const src = path.join(root, file);
        if (!fs.existsSync(src)) continue;
        const dest = path.join(frameworkPath, file);
        try {
            fs.writeFileSync(dest, renderFile(src, replacements));
            progressState.copiedFiles.push(dest);
            tick();
            count++;
        } catch (error) {
            logError('copy', src, error);
        }
    }
    writeFrameworkFileList(frameworkPath);
    return count;
}

/** Record every file now in the framework folder, so doctor can check it without a kit checkout. */
function writeFrameworkFileList(frameworkPath) {
    const listPath = path.join(frameworkPath, FRAMEWORK_FILE_LIST);
    try {
        const files = listSourceFiles(frameworkPath)
            .map(({ rel }) => rel.split(path.sep).join('/'))
            .filter((rel) => rel !== FRAMEWORK_FILE_LIST)
            .sort();
        fs.writeFileSync(listPath, `${JSON.stringify({ files }, null, 1)}\n`, 'utf8');
    } catch (error) {
        logError('framework', listPath, error);
    }
}

// ---------------------------------------------------------------------------
// Codex config.toml
// ---------------------------------------------------------------------------

/** Remove the kit's changes, including blocks written by releases before format 2. */
function cleanCodexConfig(text, backupText) {
    const { text: cleaned, isLegacy } = unmergeCodexConfigText(text);
    return isLegacy ? stripCodexManagedConfig(text, backupText) : cleaned;
}

/** Merge the kit's agent roles into ~/.codex/config.toml. @returns {boolean} written */
function mergeCodexConfigFile(templatePath, configPath) {
    try {
        const current = readTextSafe(configPath);
        if (current !== null) {
            const backupPath = backupUserFile(configPath, { isKitOwned: (text) => text.includes(CODEX_MARKER_START) });
            if (backupPath) printLine(`   💾 Backed up your config.toml → ${backupPath}`);
            if (isManagedBlockEdited(current)) {
                // The kit's block is rewritten below; keep the user's edits to it.
                const editedCopy = `${configPath}${BACKUP_SUFFIX}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
                fs.writeFileSync(editedCopy, current, 'utf8');
                printLine(`   💾 You edited the kit's block in config.toml; saved your version → ${editedCopy}`);
            }
        }
        const base = current === null ? '' : cleanCodexConfig(current, readTextSafe(configPath + BACKUP_SUFFIX));
        const { text, notes } = mergeCodexConfigText(base, fs.readFileSync(templatePath, 'utf8'));
        for (const note of notes) printLine(`   ℹ️  config.toml: ${note}`);
        if (text !== current) fs.writeFileSync(configPath, text, 'utf8');
        progressState.copiedFiles.push(configPath);
        tick();
        return true;
    } catch (error) {
        logError('codex-config', configPath, error);
        return false;
    }
}

/** Undo mergeCodexConfigFile. @returns {number} 1 when the file changed */
function unmergeCodexConfigFile(configPath) {
    try {
        const current = readTextSafe(configPath);
        if (current === null) return 0;
        const backupPath = configPath + BACKUP_SUFFIX;
        const backup = readTextSafe(backupPath);
        const cleaned = cleanCodexConfig(current, backup);
        if (cleaned === current) return 0;
        // A symlinked config.toml keeps its link: content is written through it, never renamed over.
        if (cleaned === '' && !isSymlink(configPath)) fs.unlinkSync(configPath);
        else fs.writeFileSync(configPath, cleaned, 'utf8');
        if (backup !== null && cleaned.replace(/\r\n/g, '\n').trimEnd() === backup.replace(/\r\n/g, '\n').trimEnd()) {
            restoreBackup(backupPath, configPath); // byte-exact restore, backup no longer needed
        }
        progressState.removedPaths.push(configPath);
        tick();
        printLine(`  ✂️  Removed the kit's agent config from ${configPath}`);
        return 1;
    } catch (error) {
        logError('codex-config', configPath, error);
        return 0;
    }
}

// ---------------------------------------------------------------------------
// Installs made before the manifest existed
// ---------------------------------------------------------------------------

/**
 * Remove kit-named files from destDir: identical copies are deleted, anything else is moved to
 * backupDir (never deleted). Used for installs that have no manifest.
 * @returns {{ removed: number, moved: number }}
 */
function removeUnmanifestedCopies(src, dest, replacements, backupDir) {
    const result = { removed: 0, moved: 0 };
    if (!fs.existsSync(src) || !fs.existsSync(dest)) return result;
    const files = fs.statSync(src).isFile() ? [{ rel: '', abs: src }] : listSourceFiles(src);
    for (const { rel, abs } of files) {
        const target = rel ? path.join(dest, rel) : dest;
        try {
            const stat = fs.lstatSync(target);
            if (!stat.isFile()) continue;
            if (fs.readFileSync(target).equals(renderFile(abs, replacements))) {
                fs.unlinkSync(target);
                result.removed++;
            } else if (backupDir) {
                moveFile(target, path.join(backupDir, path.basename(dest), rel));
                result.moved++;
            } else {
                continue;
            }
            progressState.removedPaths.push(target);
            tick();
        } catch (error) {
            if (!error || error.code !== 'ENOENT') logError('remove', target, error);
        }
    }
    if (fs.statSync(src).isDirectory()) pruneEmptyDirs(dest, files.map((f) => path.dirname(f.rel)));
    return result;
}

/** Delete only byte-identical kit copies from dest (anything else is left alone). */
function removeIdenticalCopies(src, dest, replacements) {
    return removeUnmanifestedCopies(src, dest, replacements, null).removed;
}

function pruneEmptyDirs(dest, relDirs) {
    const unique = [...new Set(relDirs.filter((d) => d && d !== '.'))];
    unique.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
    for (const rel of unique) {
        let current = rel;
        while (current && current !== '.') {
            removeDirIfEmpty(path.join(dest, current));
            current = path.dirname(current);
        }
    }
}

module.exports = {
    copyTree,
    copySharedFile,
    installInstructionFiles,
    uninstallInstructionFiles,
    installFramework,
    mergeCodexConfigFile,
    unmergeCodexConfigFile,
    removeUnmanifestedCopies,
    removeIdenticalCopies,
};
