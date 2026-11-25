'use strict';

/**
 * Reading kit sources, rendering files with placeholder/target transforms, and managing the
 * deduplicated ~/.agents/skills_library vault (copied once, linked per platform via junction/symlink).
 */

const fs = require('node:fs');
const path = require('node:path');

const { sha256, isSymlink, removeDirIfEmpty, pruneEmptyTree, pruneStateDirs } = require('./manifest.js');
const { KIT_VERSION } = require('./doctor-version.js');

function canonicalPath(targetPath) {
    const resolved = path.resolve(targetPath);
    const tail = [];
    for (let cur = resolved; ;) {
        try { return path.join(fs.realpathSync.native(cur), ...tail); } catch {
            const parent = path.dirname(cur);
            if (parent === cur) return resolved;
            tail.unshift(path.basename(cur));
            cur = parent;
        }
    }
}

const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.mdc', '.yaml', '.yml', '.toml']);
const SKIPPED_NAMES = new Set(['.git', '.svn', '.hg', '.DS_Store', 'Thumbs.db', 'node_modules', '__pycache__']);
const SKIPPED_SUFFIXES = ['.pyc', '.boomopen-backup'];
const SKIPPED_VAULT_DIRS = new Set(['last30days/assets', 'loki-mode/benchmarks', 'loki-mode/demo']);
const VAULT_DIR_NAME = 'skills_library';
const CLI_DIR_NAME = 'cli';
const CLI_TEST_FILE_PATTERN = /\.test(?:-helper)?\.js$|\.test\.js\.example$/;
const SHARED_VAULT_STATE_FILE = 'shared-vault.json';
let cachedVaultSource = { root: '', files: null };

function shouldSkipEntry(entry) {
    if (entry.isSymbolicLink()) return true;
    if (SKIPPED_NAMES.has(entry.name)) return true;
    return SKIPPED_SUFFIXES.some((suffix) => entry.name.endsWith(suffix));
}

function listSourceFiles(srcDir, relDir = '', acc = [], skipTopSubdirs = null) {
    let entries;
    try {
        entries = fs.readdirSync(path.join(srcDir, relDir), { withFileTypes: true });
    } catch (error) {
        if (error && error.code === 'ENOENT') return acc;
        throw error;
    }
    const isVault = path.basename(srcDir) === VAULT_DIR_NAME;
    const isCli = path.basename(srcDir) === CLI_DIR_NAME;
    for (const entry of entries) {
        if (shouldSkipEntry(entry)) continue;
        if (relDir === '' && entry.isDirectory() && skipTopSubdirs && skipTopSubdirs.has(entry.name)) continue;
        if (isCli && entry.isFile() && CLI_TEST_FILE_PATTERN.test(entry.name)) continue;
        const rel = path.join(relDir, entry.name);
        if (entry.isDirectory() && isVault && SKIPPED_VAULT_DIRS.has(rel.split(path.sep).join('/'))) continue;
        if (entry.isDirectory()) listSourceFiles(srcDir, rel, acc, skipTopSubdirs);
        else if (entry.isFile()) acc.push({ rel, abs: path.join(srcDir, rel) });
    }
    return acc;
}

function countFiles(dir, skipTopSubdirs = null) {
    return listSourceFiles(dir, '', [], skipTopSubdirs).length;
}

function applyReplacements(text, replacements) {
    if (!replacements) return text;
    let result = text;
    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    for (const search of keys) result = result.replaceAll(search, replacements[search]);
    return result;
}

function renderFile(srcPath, replacements, transform = null) {
    const ext = path.extname(srcPath).toLowerCase();
    if ((!replacements && !transform) || !TEXT_EXTENSIONS.has(ext)) return fs.readFileSync(srcPath);
    let text = fs.readFileSync(srcPath, 'utf8');
    if (replacements) text = applyReplacements(text, replacements);
    if (transform) text = transform(text, srcPath);
    return Buffer.from(text, 'utf8');
}

const sharedVaultDir = (homeDir) => path.join(homeDir, '.agents', 'skills_library');
const sharedVaultStatePath = (homeDir) => path.join(homeDir, '.boomopen', SHARED_VAULT_STATE_FILE);

function pointsToSharedVault(linkPath, homeDir) {
    if (!isSymlink(linkPath)) return false;
    try {
        const raw = fs.readlinkSync(linkPath).replace(/^\\\\\?\\/, '');
        const abs = path.isAbsolute(raw) ? raw : path.resolve(path.dirname(linkPath), raw);
        return canonicalPath(abs) === canonicalPath(sharedVaultDir(homeDir));
    } catch {
        return false;
    }
}

function removeLinkOnly(linkPath) {
    try { fs.unlinkSync(linkPath); } catch { fs.rmdirSync(linkPath); }
}

function loadVaultSourceMap(srcDir) {
    const canonicalSrc = canonicalPath(srcDir);
    if (cachedVaultSource.root === canonicalSrc && cachedVaultSource.files) return cachedVaultSource.files;
    const files = listSourceFiles(srcDir).map(({ rel, abs }) => {
        const data = fs.readFileSync(abs);
        return { rel, relPosix: rel.split(path.sep).join('/'), data, hash: sha256(data) };
    });
    cachedVaultSource = { root: canonicalSrc, files };
    return files;
}

function syncSharedVaultFiles(srcDir, homeDir) {
    const vaultDir = sharedVaultDir(homeDir);
    const stateFile = sharedVaultStatePath(homeDir);
    let prevFiles = {};
    try {
        if (fs.existsSync(stateFile)) prevFiles = JSON.parse(fs.readFileSync(stateFile, 'utf8')).files || {};
    } catch {
        prevFiles = {};
    }
    const nextFiles = {};
    for (const item of loadVaultSourceMap(srcDir)) {
        const target = path.join(vaultDir, item.rel);
        nextFiles[item.relPosix] = item.hash;
        if (prevFiles[item.relPosix] === item.hash && fs.existsSync(target)) continue;
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, item.data);
    }
    for (const [relPosix, oldHash] of Object.entries(prevFiles)) {
        if (nextFiles[relPosix]) continue;
        const stalePath = path.join(vaultDir, ...relPosix.split('/'));
        try {
            if (fs.existsSync(stalePath) && sha256(fs.readFileSync(stalePath)) === oldHash) fs.unlinkSync(stalePath);
        } catch {
            // keep modified files intact
        }
    }
    pruneEmptyTree(vaultDir);
    fs.mkdirSync(vaultDir, { recursive: true });
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });
    fs.writeFileSync(stateFile, `${JSON.stringify({ version: KIT_VERSION, files: nextFiles }, null, 1)}\n`, 'utf8');
}

function pruneUnreferencedSharedVault(homeDir, allTools) {
    for (const otherTool of Object.values(allTools)) {
        if (pointsToSharedVault(`${otherTool.paths.skills}_library`, homeDir)) return;
    }
    const stateFile = sharedVaultStatePath(homeDir);
    if (!fs.existsSync(stateFile)) return;
    const vaultDir = sharedVaultDir(homeDir);
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    for (const [relPosix, hash] of Object.entries(state.files || {})) {
        const abs = path.join(vaultDir, ...relPosix.split('/'));
        if (fs.existsSync(abs) && sha256(fs.readFileSync(abs)) === hash) fs.unlinkSync(abs);
    }
    pruneEmptyTree(vaultDir);
    removeDirIfEmpty(path.join(homeDir, '.agents'));
    fs.unlinkSync(stateFile);
    pruneStateDirs(homeDir);
}

module.exports = {
    TEXT_EXTENSIONS,
    shouldSkipEntry,
    listSourceFiles,
    countFiles,
    applyReplacements,
    renderFile,
    sharedVaultDir,
    pointsToSharedVault,
    removeLinkOnly,
    syncSharedVaultFiles,
    pruneUnreferencedSharedVault,
};
