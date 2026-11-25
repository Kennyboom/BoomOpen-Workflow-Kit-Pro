'use strict';

/**
 * Building blocks of one install / uninstall: copying kit trees (framework, shared folders,
 * deduplicated ~/.agents/skills_library, native Antigravity plugin bundle), instruction-file blocks,
 * the Codex config merge and the cleanup of pre-manifest installs.
 */

const fs = require('node:fs');
const path = require('node:path');

const { listSourceFiles, renderFile, applyReplacements, sharedVaultDir, pointsToSharedVault, removeLinkOnly, syncSharedVaultFiles, pruneUnreferencedSharedVault } = require('./copy-engine.js');
const { progressState, tick, logError, printLine } = require('./progress.js');
const { installInstructionFile, uninstallInstructionFile } = require('./instruction-files.js');
const { mergeCodexConfigText, unmergeCodexConfigText, isManagedBlockEdited } = require('./codex-config.js');
const { BACKUP_SUFFIX, backupUserFile, stripCodexManagedConfig } = require('./user-files.js');
const { CODEX_MARKER_START } = require('./markers.js');
const { moveFile, removeDirIfEmpty, isSymlink, restoreBackup, pruneEmptyTree } = require('./manifest.js');
const { FRAMEWORK_FILE_LIST, replacementsFor } = require('./tool-config.js');
const { INTERNAL_SKIP_SUBDIRS, rewriteBrainArtifactPaths, compileAgentMarkdown, targetAgentRelPath, compileCommandMarkdown, claudeColonCommandAlias } = require('./platform-transforms.js');
const { registerAntigravityHook, HOOK_SCRIPT_NAME } = require('./hook-registration.js');
const { loadSettings } = require('./settings.js');
const { KIT_VERSION } = require('./doctor-version.js');

const FRAMEWORK_REWRITE_DIRS = new Set(['agents', 'rules', 'commands', 'workflows']);

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return null;
        throw error;
    }
}

function buildTransform(kind, platformKey) {
    if (!platformKey) return null;
    if (kind === 'commands') return (text, src) => (src.endsWith('.md') ? compileCommandMarkdown(text, platformKey, src) : text);
    if (kind === 'agents') return (text, src) => (src.endsWith('.md') ? compileAgentMarkdown(text, platformKey, src) : text);
    if (kind === 'skills' || kind === 'rules' || kind === 'framework-md') {
        return (text, src) => (src.endsWith('.md') ? rewriteBrainArtifactPaths(text, platformKey) : text);
    }
    return null;
}

function writeTarget(target, data, dest, ledger) {
    if (ledger) ledger.writeFile(target, data, dest);
    else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, data);
    }
    progressState.copiedFiles.push(target);
    tick();
}

/** Copy a kit tree, optionally applying per-IDE filtering, frontmatter compilation, and colon aliases. */
function copyTree(src, dest, replacements, ledger = null, options = {}) {
    let count = 0;
    const { kind = null, platformKey = null } = options;
    const skipTop = kind && INTERNAL_SKIP_SUBDIRS[kind] ? INTERNAL_SKIP_SUBDIRS[kind] : null;
    const transform = buildTransform(kind, platformKey);
    const files = listSourceFiles(src, '', [], skipTop);
    const topCommandStems = kind === 'commands' && platformKey === 'claude'
        ? new Set(files.filter((f) => !f.rel.includes(path.sep) && f.rel.endsWith('.md')).map((f) => f.rel.slice(0, -3)))
        : null;

    for (const { rel, abs } of files) {
        const destRel = kind === 'agents' ? targetAgentRelPath(rel, platformKey) : rel;
        const target = path.join(dest, destRel);
        try {
            const data = renderFile(abs, replacements, transform);
            writeTarget(target, data, dest, ledger);
            count++;
            if (topCommandStems) {
                const aliasRel = claudeColonCommandAlias(rel, topCommandStems);
                if (aliasRel) {
                    writeTarget(path.join(dest, aliasRel), data, dest, ledger);
                    count++;
                }
            }
        } catch (error) {
            logError('copy', abs, error);
        }
    }
    return count;
}

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
    if (result.retiredBackup) printLine(`  💾 Kept an older ${path.basename(dest)} backup as ${result.retiredBackup} (not restored on uninstall)`);
    if (result.action === 'merged') printLine(`  🔗 Added the kit block to your ${dest} (your text is kept above it)`);
}

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

function installFramework(frameworkPath, root, coreDirs, rootFiles, hooksSrc, replacements, verbatimDirs, platformKey = null) {
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
        const kind = FRAMEWORK_REWRITE_DIRS.has(dir) ? 'framework-md' : null;
        count += copyTree(path.join(root, dir), path.join(frameworkPath, dir), map, null, { kind, platformKey });
    }
    count += copyTree(path.join(root, 'commands'), path.join(frameworkPath, 'workflows'), replacements, null, { kind: 'framework-md', platformKey });
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

function installAntigravityPlugin(tool, root, coreDirs, rootFiles, hooksSrc, verbatimDirs, ledger) {
    const pluginDir = tool.paths.pluginPath;
    const pluginRel = 'gemini/config/plugins/boomopen-workflow-kit';
    const pluginReplacements = {
        ...replacementsFor(pluginRel, `${pluginRel}/skills/boomopen-workflow-kit`),
        '~/.gemini/config/skills/boomopen-workflow-kit/': `~/.${pluginRel}/skills/boomopen-workflow-kit/`,
    };
    let count = 0;
    try {
        if (ledger) ledger.ensureDir(path.dirname(pluginDir));
        fs.rmSync(pluginDir, { recursive: true, force: true });
        fs.mkdirSync(pluginDir, { recursive: true });
        const manifest = { ...JSON.parse(fs.readFileSync(tool.assets.pluginJson, 'utf8')), version: KIT_VERSION };
        const manifestDest = path.join(pluginDir, 'plugin.json');
        fs.writeFileSync(manifestDest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
        const rulesDest = path.join(pluginDir, 'rules', 'AGENTS.md');
        fs.mkdirSync(path.dirname(rulesDest), { recursive: true });
        fs.writeFileSync(rulesDest, renderFile(tool.assets.geminiMd, pluginReplacements));
        progressState.copiedFiles.push(manifestDest, rulesDest);
        tick();
        tick();
        count += 2;
    } catch (error) {
        logError('plugin', pluginDir, error);
        return 0;
    }
    count += copyTree(path.join(root, 'skills'), path.join(pluginDir, 'skills'), pluginReplacements, null, { kind: 'skills', platformKey: 'antigravity' });
    count += installFramework(path.join(pluginDir, 'skills', 'boomopen-workflow-kit'), root, coreDirs, rootFiles, hooksSrc, pluginReplacements, verbatimDirs, 'antigravity');
    count += copyTree(path.join(root, 'agents'), path.join(pluginDir, 'agents'), pluginReplacements, null, { kind: 'agents', platformKey: 'antigravity' });
    count += copyTree(hooksSrc, path.join(pluginDir, 'hooks'), null);
    try {
        const hooksJson = path.join(pluginDir, 'hooks.json');
        registerAntigravityHook(hooksJson, path.join(pluginDir, 'hooks', HOOK_SCRIPT_NAME));
        progressState.copiedFiles.push(hooksJson);
    } catch (error) {
        logError('plugin-hooks', path.join(pluginDir, 'hooks.json'), error);
    }
    return count;
}

function installSharedSkillsLibrary(srcDir, linkPath, homeDir, ledger) {
    try {
        syncSharedVaultFiles(srcDir, homeDir);
    } catch (error) {
        logError('shared-vault', sharedVaultDir(homeDir), error);
        return copyTree(srcDir, linkPath, null, ledger);
    }
    if (pointsToSharedVault(linkPath, homeDir)) {
        if (ledger) { ledger.forgetSubtree(linkPath); ledger.ensureDir(path.dirname(linkPath)); }
        progressState.copiedFiles.push(linkPath);
        tick();
        return 1;
    }
    if (isSymlink(linkPath)) return 0;
    if (fs.existsSync(linkPath)) {
        if (ledger) ledger.prunePreviousUnder(linkPath);
        removeIdenticalCopies(srcDir, linkPath, null);
        pruneEmptyTree(linkPath);
        if (fs.existsSync(linkPath)) return copyTree(srcDir, linkPath, null, ledger);
    }
    try {
        if (ledger) ledger.ensureDir(path.dirname(linkPath));
        else fs.mkdirSync(path.dirname(linkPath), { recursive: true });
        fs.symlinkSync(sharedVaultDir(homeDir), linkPath, process.platform === 'win32' ? 'junction' : 'dir');
        if (ledger) ledger.forgetSubtree(linkPath);
        progressState.copiedFiles.push(linkPath);
        tick();
        return 1;
    } catch {
        return copyTree(srcDir, linkPath, null, ledger);
    }
}

function unlinkToolSkillsLibrary(linkPath, homeDir) {
    if (!pointsToSharedVault(linkPath, homeDir)) return false;
    try {
        removeLinkOnly(linkPath);
        progressState.removedPaths.push(linkPath);
        tick();
        return true;
    } catch (error) {
        logError('unlink-vault', linkPath, error);
        return false;
    }
}

function cleanupSharedVaultIfUnreferenced(homeDir, allTools) {
    try {
        pruneUnreferencedSharedVault(homeDir, allTools);
    } catch (error) {
        logError('cleanup-vault', sharedVaultDir(homeDir), error);
    }
}

function cleanCodexConfig(text, backupText) {
    const { text: cleaned, isLegacy } = unmergeCodexConfigText(text);
    return isLegacy ? stripCodexManagedConfig(text, backupText) : cleaned;
}

function mergeCodexConfigFile(templatePath, configPath, homeDir = null) {
    try {
        const current = readTextSafe(configPath);
        if (current !== null) {
            const backupPath = backupUserFile(configPath, { isKitOwned: (text) => text.includes(CODEX_MARKER_START) });
            if (backupPath) printLine(`   💾 Backed up your config.toml → ${backupPath}`);
            if (isManagedBlockEdited(current)) {
                const editedCopy = `${configPath}${BACKUP_SUFFIX}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
                fs.writeFileSync(editedCopy, current, 'utf8');
                printLine(`   💾 You edited the kit's block in config.toml; saved your version → ${editedCopy}`);
            }
        }
        const activeMaxThreads = homeDir ? loadSettings({ homeDir, scope: 'global' }).execution.maxParallelSubagents : undefined;
        const base = current === null ? '' : cleanCodexConfig(current, readTextSafe(configPath + BACKUP_SUFFIX));
        const { text, notes } = mergeCodexConfigText(base, fs.readFileSync(templatePath, 'utf8'), { maxThreads: activeMaxThreads });
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

function unmergeCodexConfigFile(configPath) {
    try {
        const current = readTextSafe(configPath);
        if (current === null) return 0;
        const backupPath = configPath + BACKUP_SUFFIX;
        const backup = readTextSafe(backupPath);
        const cleaned = cleanCodexConfig(current, backup);
        if (cleaned === current) return 0;
        if (cleaned === '' && !isSymlink(configPath)) fs.unlinkSync(configPath);
        else fs.writeFileSync(configPath, cleaned, 'utf8');
        if (backup !== null && cleaned.replace(/\r\n/g, '\n').trimEnd() === backup.replace(/\r\n/g, '\n').trimEnd()) restoreBackup(backupPath, configPath);
        progressState.removedPaths.push(configPath);
        tick();
        printLine(`  ✂️  Removed the kit's agent config from ${configPath}`);
        return 1;
    } catch (error) {
        logError('codex-config', configPath, error);
        return 0;
    }
}

function pruneEmptyDirs(dest, relDirs) {
    const unique = [...new Set(relDirs.filter((d) => d && d !== '.'))].sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
    for (const rel of unique) {
        let current = rel;
        while (current && current !== '.') {
            removeDirIfEmpty(path.join(dest, current));
            current = path.dirname(current);
        }
    }
}

function removeUnmanifestedCopies(src, dest, replacements, backupDir, options = {}) {
    const result = { removed: 0, moved: 0 };
    if (!fs.existsSync(src) || !fs.existsSync(dest)) return result;
    const { kind = null, platformKey = null } = options;
    const transform = buildTransform(kind, platformKey);
    const files = fs.statSync(src).isFile() ? [{ rel: '', abs: src }] : listSourceFiles(src);
    for (const { rel, abs } of files) {
        const destRel = rel && kind === 'agents' ? targetAgentRelPath(rel, platformKey) : rel;
        const target = destRel ? path.join(dest, destRel) : dest;
        try {
            if (!fs.lstatSync(target).isFile()) continue;
            const targetBuf = fs.readFileSync(target);
            const isSame = targetBuf.equals(renderFile(abs, replacements, transform)) || (transform && targetBuf.equals(renderFile(abs, replacements)));
            if (isSame) { fs.unlinkSync(target); result.removed++; }
            else if (backupDir) { moveFile(target, path.join(backupDir, path.basename(dest), destRel)); result.moved++; }
            else continue;
            progressState.removedPaths.push(target);
            tick();
        } catch (error) {
            if (!error || error.code !== 'ENOENT') logError('remove', target, error);
        }
    }
    if (fs.statSync(src).isDirectory()) pruneEmptyDirs(dest, files.map((f) => path.dirname(f.rel)));
    return result;
}

const removeIdenticalCopies = (src, dest, replacements, options = {}) => removeUnmanifestedCopies(src, dest, replacements, null, options).removed;

module.exports = {
    copyTree, copySharedFile, installInstructionFiles, uninstallInstructionFiles,
    installFramework, installAntigravityPlugin, installSharedSkillsLibrary,
    unlinkToolSkillsLibrary, cleanupSharedVaultIfUnreferenced, pointsToSharedVault,
    mergeCodexConfigFile, unmergeCodexConfigFile, removeUnmanifestedCopies, removeIdenticalCopies,
};
