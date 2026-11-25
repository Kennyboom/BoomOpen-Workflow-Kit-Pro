'use strict';

/**
 * Manifest uninstall, backup restoration, symlink-safe file undo, and directory pruning helpers.
 * Extracted from cli/manifest.js to keep both modules small and single-responsibility.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const STATE_DIR_NAME = '.boomopen';

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const byDepthDesc = (a, b) => b.split('/').length - a.split('/').length;
const stateDir = (homeDir) => path.join(homeDir, STATE_DIR_NAME);
const manifestPath = (homeDir, toolKey) => path.join(stateDir(homeDir), 'manifests', `${toolKey}.json`);
const backupRoot = (homeDir, toolKey) => path.join(stateDir(homeDir), 'backups', toolKey);
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Manifest key: home-relative with '/' separators, or absolute when outside the home drive. */
function toRel(homeDir, absPath) {
    const rel = path.relative(homeDir, absPath);
    return (path.isAbsolute(rel) ? path.resolve(absPath) : rel).split(path.sep).join('/');
}

function toAbs(homeDir, relPath) {
    const native = relPath.split('/').join(path.sep);
    return path.isAbsolute(native) ? native : path.join(homeDir, native);
}

function readBufferSafe(filePath) {
    try {
        return fs.readFileSync(filePath);
    } catch (error) {
        if (error && error.code === 'ENOENT') return null;
        throw error;
    }
}

/** True when filePath itself is a symbolic link (a missing path is not). */
function isSymlink(filePath) {
    try {
        return fs.lstatSync(filePath).isSymbolicLink();
    } catch (error) {
        if (error && (error.code === 'ENOENT' || error.code === 'ENOTDIR')) return false;
        throw error;
    }
}

/** True when any directory between rootDir (exclusive) and targetPath's parent (inclusive) is a symlink/junction. */
function hasSymlinkAncestor(rootDir, targetPath) {
    const stop = path.resolve(rootDir);
    let cur = path.dirname(path.resolve(targetPath));
    while (cur !== stop && cur.startsWith(stop + path.sep)) {
        if (isSymlink(cur)) return true;
        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
    }
    return false;
}

/** Loads the install manifest for one tool, or throws when present and corrupt. */
function loadManifest(homeDir, toolKey) {
    const raw = readBufferSafe(manifestPath(homeDir, toolKey));
    if (raw === null) return null;
    let data;
    try {
        data = JSON.parse(raw.toString('utf8'));
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`install manifest ${manifestPath(homeDir, toolKey)} is corrupt: ${error.message}`);
        }
        throw error;
    }
    return {
        kitVersion: typeof data.kitVersion === 'string' ? data.kitVersion : undefined,
        files: isPlainObject(data.files) ? data.files : {},
        dirs: Array.isArray(data.dirs) ? data.dirs.filter((d) => typeof d === 'string') : [],
        backups: isPlainObject(data.backups) ? data.backups : {},
        legacyMoves: isPlainObject(data.legacyMoves) ? data.legacyMoves : {},
    };
}

function moveFile(from, to) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    try {
        fs.renameSync(from, to);
    } catch (error) {
        if (!error || error.code !== 'EXDEV') throw error;
        fs.copyFileSync(from, to);
        fs.unlinkSync(from);
    }
}

/** Move a folder (rename, or copy + delete across devices). */
function moveDir(from, to) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    try {
        fs.renameSync(from, to);
    } catch (error) {
        if (!error || error.code !== 'EXDEV') throw error;
        fs.cpSync(from, to, { recursive: true });
        fs.rmSync(from, { recursive: true, force: true });
    }
}

/** Put a backup back at targetPath, writing through symbolic links rather than replacing them. */
function restoreBackup(backupPath, targetPath) {
    if (isSymlink(targetPath)) {
        fs.writeFileSync(targetPath, fs.readFileSync(backupPath));
        fs.unlinkSync(backupPath);
        return;
    }
    moveFile(backupPath, targetPath);
}

/** Undo one kit file: restore the user's backup over it, or delete it when there is none. */
function undoKitFile(absPath, backupPath) {
    const hasBackup = Boolean(backupPath) && fs.existsSync(backupPath);
    if (isSymlink(absPath)) {
        if (hasBackup) restoreBackup(backupPath, absPath);
        return { removed: false, restored: hasBackup };
    }
    let removed = false;
    if (fs.existsSync(absPath)) {
        fs.unlinkSync(absPath);
        removed = true;
    }
    if (hasBackup) moveFile(backupPath, absPath);
    return { removed, restored: hasBackup };
}

function removeDirIfEmpty(dirPath) {
    if (isSymlink(dirPath)) return false;
    try {
        if (fs.readdirSync(dirPath).length > 0) return false;
        fs.rmdirSync(dirPath);
        return true;
    } catch (error) {
        if (error && ['ENOENT', 'ENOTDIR', 'ENOTEMPTY', 'EPERM', 'EBUSY'].includes(error.code)) return false;
        throw error;
    }
}

/** Delete empty folders below (and including) root, deepest first. */
function pruneEmptyTree(root) {
    let entries;
    try {
        entries = fs.readdirSync(root, { withFileTypes: true });
    } catch (error) {
        if (error && error.code === 'ENOENT') return;
        throw error;
    }
    for (const entry of entries) if (entry.isDirectory()) pruneEmptyTree(path.join(root, entry.name));
    removeDirIfEmpty(root);
}

function restoreLegacyMoves(homeDir, legacyMoves, result) {
    for (const [rel, backupDir] of Object.entries(legacyMoves)) {
        const absPath = toAbs(homeDir, rel);
        if (typeof backupDir !== 'string' || !fs.existsSync(backupDir)) continue;
        if (fs.existsSync(absPath)) {
            result.kept.push(backupDir);
            continue;
        }
        moveDir(backupDir, absPath);
        result.restored.push(absPath);
    }
}

function pruneStateDirs(homeDir) {
    for (const sub of ['manifests', 'backups', 'templates']) removeDirIfEmpty(path.join(stateDir(homeDir), sub));
    removeDirIfEmpty(stateDir(homeDir));
}

/** Remove what the manifest says the kit installed, returning null when no manifest exists. */
function uninstallFromManifest(homeDir, toolKey) {
    const manifest = loadManifest(homeDir, toolKey);
    if (!manifest) return null;
    const result = { removed: [], kept: [], restored: [] };
    for (const [rel, hash] of Object.entries(manifest.files)) {
        const absPath = toAbs(homeDir, rel);
        if (hasSymlinkAncestor(homeDir, absPath)) continue;
        const current = readBufferSafe(absPath);
        if (current !== null && sha256(current) !== hash) {
            result.kept.push(absPath);
            continue;
        }
        const outcome = undoKitFile(absPath, manifest.backups[rel]);
        if (outcome.removed) result.removed.push(absPath);
        if (outcome.restored) result.restored.push(absPath);
    }
    restoreLegacyMoves(homeDir, manifest.legacyMoves, result);
    for (const rel of [...manifest.dirs].sort(byDepthDesc)) {
        const absDir = toAbs(homeDir, rel);
        if (isSymlink(absDir) || hasSymlinkAncestor(homeDir, absDir)) continue;
        if (removeDirIfEmpty(absDir)) result.removed.push(absDir);
    }
    fs.unlinkSync(manifestPath(homeDir, toolKey));
    fs.rmSync(path.join(stateDir(homeDir), 'templates', toolKey), { recursive: true, force: true });
    pruneEmptyTree(backupRoot(homeDir, toolKey));
    pruneStateDirs(homeDir);
    return result;
}

module.exports = {
    sha256,
    byDepthDesc,
    stateDir,
    manifestPath,
    backupRoot,
    toRel,
    toAbs,
    readBufferSafe,
    isPlainObject,
    isSymlink,
    hasSymlinkAncestor,
    loadManifest,
    moveFile,
    moveDir,
    restoreBackup,
    undoKitFile,
    removeDirIfEmpty,
    pruneEmptyTree,
    pruneStateDirs,
    uninstallFromManifest,
};
