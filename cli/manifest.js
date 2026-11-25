'use strict';

/**
 * Install manifest: the sha256 of every file the kit writes into folders it shares with the user
 * (commands, agents, workflows, skills, skills_library, Codex agents, ...).
 *
 * - Install: an existing file is overwritten only when it is byte-identical to what the kit wrote
 *   last time; anything else (a user's same-named file, or a kit file the user edited) is first
 *   copied to ~/.boomopen/backups/<tool>/<timestamp>/.
 * - Reinstall/upgrade: files the previous install wrote that the new kit no longer ships are
 *   deleted only while unmodified.
 * - Uninstall (see cli/manifest-uninstall.js): only files whose hash still matches are deleted;
 *   backups of files the user had before the first install are moved back; only folders the kit
 *   created are pruned (when empty).
 *
 * Manifest location: ~/.boomopen/manifests/<tool>.json (paths stored relative to the home folder).
 */

const fs = require('node:fs');
const path = require('node:path');

const {
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
} = require('./manifest-uninstall.js');

const MANIFEST_FORMAT = 1;
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

/** Records everything one install writes into shared folders. */
class InstallLedger {
    /**
     * @param {{ homeDir: string, toolKey: string, kitVersion: string, userFilesRestorable: boolean }} options
     *   userFilesRestorable: true on a first install (displaced files are the user's and are put
     *   back on uninstall); false when upgrading a pre-manifest install (they are old kit copies).
     */
    constructor({ homeDir, toolKey, kitVersion, userFilesRestorable }) {
        this.homeDir = homeDir;
        this.toolKey = toolKey;
        this.kitVersion = kitVersion;
        this.previous = loadManifest(homeDir, toolKey);
        this.restorable = this.previous ? true : userFilesRestorable;
        // Upgrading a pre-manifest install: folders that release created were never recorded, so
        // existing folders below a shared destination are adopted (pruned on uninstall when empty).
        this.adoptExistingDirs = !this.previous && !userFilesRestorable;
        this.files = {};
        this.dirs = new Set(this.previous ? this.previous.dirs : []);
        this.backups = { ...(this.previous ? this.previous.backups : {}) };
        this.legacyMoves = { ...(this.previous ? this.previous.legacyMoves : {}) };
        this.sessionBackupDir = path.join(backupRoot(homeDir, toolKey), timestamp());
        this.backedUp = [];
    }

    rel(absPath) {
        return toRel(this.homeDir, absPath);
    }

    abs(relPath) {
        return toAbs(this.homeDir, relPath);
    }

    /** mkdir -p, remembering every folder the kit itself creates. */
    ensureDir(dirPath) {
        const missing = [];
        let current = path.resolve(dirPath);
        while (!fs.existsSync(current)) {
            missing.push(current);
            const parent = path.dirname(current);
            if (parent === current) break;
            current = parent;
        }
        if (missing.length === 0) return;
        fs.mkdirSync(dirPath, { recursive: true });
        for (const dir of missing) {
            const rel = this.rel(dir);
            // Only folders below the home folder are ever pruned again
            if (!rel.startsWith('..') && !path.isAbsolute(rel.split('/').join(path.sep)) && rel !== '') this.dirs.add(rel);
        }
    }

    /**
     * Pre-manifest upgrade only: record the existing folders between dirPath and rootDir (rootDir
     * itself excluded), so the folders an older release created are pruned again when left empty.
     */
    adoptDirs(dirPath, rootDir) {
        if (!this.adoptExistingDirs || !rootDir) return;
        const root = path.resolve(rootDir);
        let current = path.resolve(dirPath);
        while (current !== root && current.startsWith(root + path.sep)) {
            const rel = this.rel(current);
            if (!rel.startsWith('..') && !path.isAbsolute(rel.split('/').join(path.sep))) this.dirs.add(rel);
            current = path.dirname(current);
        }
    }

    /** Remember a skill folder the legacy migration moved aside, so uninstall can put it back. */
    recordLegacyMove(fromDir, toDir) {
        this.legacyMoves[this.rel(fromDir)] = toDir;
    }

    /**
     * Keep tracking every file the previous install recorded but this run did not write (used when
     * a run failed part-way, so its stale-file cleanup is skipped).
     */
    carryForwardPrevious() {
        if (!this.previous) return;
        for (const [rel, hash] of Object.entries(this.previous.files)) {
            if (!this.files[rel]) this.files[rel] = hash;
        }
    }

    /**
     * @param {boolean} restoreOnUninstall true for a user's own file the kit displaced; false for a
     *   kit file the user edited (kept in the backup folder, never put back automatically)
     */
    backup(destPath, data, restoreOnUninstall) {
        // Mirror the destination below the backup folder (drive letters and ".." become plain folders)
        const safeRel = this.rel(destPath)
            .replace(/^([A-Za-z]):/, '$1')
            .split('/')
            .filter((part) => part !== '' && part !== '..')
            .join('/');
        const target = path.join(this.sessionBackupDir, ...safeRel.split('/'));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, data);
        this.backedUp.push(target);
        const rel = this.rel(destPath);
        if (restoreOnUninstall && this.restorable && !this.backups[rel]) this.backups[rel] = target;
    }

    /**
     * Write one kit file into a shared folder.
     * @param {string} destPath
     * @param {Buffer} data
     * @param {string} [rootDir] the shared destination folder the file is copied into
     * @returns {'created'|'updated'|'unchanged'}
     */
    writeFile(destPath, data, rootDir) {
        this.adoptDirs(path.dirname(destPath), rootDir);
        const hash = sha256(data);
        const rel = this.rel(destPath);
        const current = readBufferSafe(destPath);
        if (current !== null && sha256(current) === hash) {
            this.files[rel] = hash;
            return 'unchanged';
        }
        if (current !== null) {
            const recorded = this.previous ? this.previous.files[rel] : undefined;
            if (recorded !== sha256(current)) this.backup(destPath, current, recorded === undefined);
        } else {
            this.ensureDir(path.dirname(destPath));
        }
        fs.writeFileSync(destPath, data);
        this.files[rel] = hash;
        return current === null ? 'created' : 'updated';
    }

    /** Clean unmodified previous-manifest files under dirPath before replacing dirPath with a shared junction. */
    prunePreviousUnder(dirPath) {
        if (!this.previous || isSymlink(dirPath)) return;
        const prefix = `${this.rel(dirPath)}/`;
        for (const [rel, hash] of Object.entries(this.previous.files)) {
            if (!rel.startsWith(prefix)) continue;
            const absPath = this.abs(rel);
            if (hasSymlinkAncestor(this.homeDir, absPath)) continue;
            const current = readBufferSafe(absPath);
            if (current !== null && sha256(current) === hash) {
                const outcome = undoKitFile(absPath, this.backups[rel]);
                if (outcome.restored) delete this.backups[rel];
                delete this.previous.files[rel];
            }
        }
    }

    /** Drop manifest tracking at or beneath dirPath once dirPath is a shared-vault symlink/junction. */
    forgetSubtree(dirPath) {
        const exact = this.rel(dirPath);
        const prefix = `${exact}/`;
        if (this.previous) {
            for (const rel of Object.keys(this.previous.files)) {
                if (rel === exact || rel.startsWith(prefix)) delete this.previous.files[rel];
            }
        }
        for (const rel of [...this.dirs]) {
            if (rel === exact || rel.startsWith(prefix)) this.dirs.delete(rel);
        }
    }

    /** Remove files the previous install wrote that this install no longer ships. */
    pruneStale() {
        const result = { removed: [], kept: [] };
        if (!this.previous) return result;
        for (const [rel, hash] of Object.entries(this.previous.files)) {
            if (this.files[rel]) continue;
            const absPath = this.abs(rel);
            if (hasSymlinkAncestor(this.homeDir, absPath)) continue;
            const current = readBufferSafe(absPath);
            if (current === null) continue;
            if (sha256(current) !== hash) {
                result.kept.push(absPath);
                continue;
            }
            const outcome = undoKitFile(absPath, this.backups[rel]);
            if (outcome.removed) result.removed.push(absPath);
            if (outcome.restored) delete this.backups[rel];
        }
        for (const rel of [...this.dirs].sort(byDepthDesc)) {
            const absDir = this.abs(rel);
            if (isSymlink(absDir) || hasSymlinkAncestor(this.homeDir, absDir)) {
                this.dirs.delete(rel);
                continue;
            }
            if (removeDirIfEmpty(absDir)) this.dirs.delete(rel);
        }
        return result;
    }

    save() {
        const target = manifestPath(this.homeDir, this.toolKey);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        const payload = {
            format: MANIFEST_FORMAT,
            tool: this.toolKey,
            kitVersion: this.kitVersion,
            updatedAt: new Date().toISOString(),
            files: this.files,
            dirs: [...this.dirs].filter((rel) => fs.existsSync(this.abs(rel))).sort(),
            backups: this.backups,
            legacyMoves: this.legacyMoves,
        };
        fs.writeFileSync(target, JSON.stringify(payload, null, 1) + '\n', 'utf8');
        removeDirIfEmpty(this.sessionBackupDir);
        return target;
    }
}

/**
 * The kit itself rewrote an installed file (settings sync updates the settings block): carry the
 * manifest hash forward so uninstall and upgrades still treat the file as kit-owned and unmodified.
 * Only an entry whose hash matches the previous content is updated, so a user's edit stays theirs.
 * @param {string} homeDir
 * @param {string} absPath file that was rewritten
 * @param {string|Buffer} previousData content before the rewrite
 * @param {string|Buffer} nextData content written
 * @returns {string[]} tools whose manifest was updated
 */
function recordKitRewrite(homeDir, absPath, previousData, nextData) {
    const dir = path.join(stateDir(homeDir), 'manifests');
    let names;
    try {
        names = fs.readdirSync(dir).filter((name) => name.endsWith('.json'));
    } catch (error) {
        if (error && error.code === 'ENOENT') return [];
        throw error;
    }
    const rel = toRel(homeDir, absPath);
    const previousHash = sha256(previousData);
    const updated = [];
    for (const name of names) {
        const file = path.join(dir, name);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (error) {
            if (error instanceof SyntaxError) continue; // a corrupt manifest is reported by doctor/uninstall
            throw error;
        }
        if (!isPlainObject(data) || !isPlainObject(data.files) || data.files[rel] !== previousHash) continue;
        data.files[rel] = sha256(nextData);
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(file, `${JSON.stringify(data, null, 1)}\n`, 'utf8');
        updated.push(name.slice(0, -'.json'.length));
    }
    return updated;
}

module.exports = {
    MANIFEST_FORMAT,
    sha256,
    manifestPath,
    backupRoot,
    loadManifest,
    InstallLedger,
    uninstallFromManifest,
    recordKitRewrite,
    moveFile,
    moveDir,
    isSymlink,
    restoreBackup,
    removeDirIfEmpty,
    pruneEmptyTree,
    pruneStateDirs,
};
