'use strict';

/**
 * Reading kit sources: which entries to ship, and how a file is rendered for one tool
 * (path placeholders such as `~/.{TOOL}/` replaced in text files).
 */

const fs = require('node:fs');
const path = require('node:path');

const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.mdc', '.yaml', '.yml', '.toml']);
// Only VCS/OS/build clutter is skipped; dotfiles such as .env.example, .gitignore, .github ship.
const SKIPPED_NAMES = new Set(['.git', '.svn', '.hg', '.DS_Store', 'Thumbs.db', 'node_modules', '__pycache__']);
const SKIPPED_SUFFIXES = ['.pyc', '.boomopen-backup'];
// Large media/benchmark folders of vendored skills that no SKILL.md needs (also left out of the npm
// package): skipped so every platform install does not copy ~23 MB of images, audio and JSON dumps.
const SKIPPED_VAULT_DIRS = new Set(['last30days/assets', 'loki-mode/benchmarks', 'loki-mode/demo']);
const VAULT_DIR_NAME = 'skills_library';
// Test-only files in the kit's own cli/ folder are never installed (they are also left out of the npm
// package). Scoped to cli/ so vendored skills_library content keeps its test files.
const CLI_DIR_NAME = 'cli';
const CLI_TEST_FILE_PATTERN = /\.test(?:-helper)?\.js$|\.test\.js\.example$/;

function shouldSkipEntry(entry) {
    if (entry.isSymbolicLink()) return true; // never follow links out of the kit
    if (SKIPPED_NAMES.has(entry.name)) return true;
    return SKIPPED_SUFFIXES.some((suffix) => entry.name.endsWith(suffix));
}

/**
 * All shippable files under srcDir.
 * @returns {Array<{ rel: string, abs: string }>} rel uses the OS separator
 */
function listSourceFiles(srcDir, relDir = '', acc = []) {
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
        if (isCli && entry.isFile() && CLI_TEST_FILE_PATTERN.test(entry.name)) continue;
        const rel = path.join(relDir, entry.name);
        if (entry.isDirectory() && isVault && SKIPPED_VAULT_DIRS.has(rel.split(path.sep).join('/'))) continue;
        if (entry.isDirectory()) listSourceFiles(srcDir, rel, acc);
        else if (entry.isFile()) acc.push({ rel, abs: path.join(srcDir, rel) });
    }
    return acc;
}

function countFiles(dir) {
    return listSourceFiles(dir).length;
}

function applyReplacements(text, replacements) {
    if (!replacements) return text;
    let result = text;
    // Longer keys first so a short key never breaks a longer one
    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    for (const search of keys) result = result.replaceAll(search, replacements[search]);
    return result;
}

/**
 * Bytes the kit writes for one source file.
 * @param {string} srcPath
 * @param {Record<string,string>|null} replacements null = copy verbatim (vendored or explanatory docs)
 * @returns {Buffer}
 */
function renderFile(srcPath, replacements) {
    const ext = path.extname(srcPath).toLowerCase();
    if (!replacements || !TEXT_EXTENSIONS.has(ext)) return fs.readFileSync(srcPath);
    return Buffer.from(applyReplacements(fs.readFileSync(srcPath, 'utf8'), replacements), 'utf8');
}

module.exports = {
    TEXT_EXTENSIONS,
    shouldSkipEntry,
    listSourceFiles,
    countFiles,
    applyReplacements,
    renderFile,
};
