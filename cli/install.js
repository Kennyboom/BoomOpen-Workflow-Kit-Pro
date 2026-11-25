#!/usr/bin/env node
'use strict';

/**
 * BoomOpen Workflow Kit CLI installer for Cursor, GitHub Copilot, Antigravity (Gemini),
 * Claude Code and Codex. CLI argument dispatch lives in `./cli-router.js`.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const doctorMod = require('./doctor.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { runCheck } = require('./checker.js');
const ledgerMod = require('./ledger.js');
const planMod = require('./plan.js');
const designMod = require('./design.js');
const researchMod = require('./research.js');
const cookMod = require('./cook.js');
const reconcileMod = require('./reconcile.js');
const auditMod = require('./audit.js');
const conductorMod = require('./conductor.js');
const settingsMod = require('./settings.js');
const { startSettingsUiServer } = require('./settings-ui.js');
const { KIT_DIR_NAME, CORE_DIRS, ROOT_FILES, VERBATIM_DIRS, buildTools, buildPlan } = require('./tool-config.js');
const { INTERNAL_SKIP_SUBDIRS } = require('./platform-transforms.js');
const { countFiles, listSourceFiles, renderFile } = require('./copy-engine.js');
const { progressState, resetProgress, completeProgress, logError, printLine, warnLine } = require('./progress.js');
const { InstallLedger, uninstallFromManifest, backupRoot, manifestPath, removeDirIfEmpty, pruneEmptyTree } = require('./manifest.js');
const { migrateLegacy, recordToolDirs, kitInstructionTexts } = require('./install-ownership.js');
const hooksMod = require('./hook-registration.js');
const { hasKitContent } = require('./instruction-files.js');
const steps = require('./install-steps.js');
const { EXIT_FAILURE, parseArgs, createCliRouter } = require('./cli-router.js');

const HOME = os.homedir();
const ROOT = path.join(__dirname, '..');
const HOOKS_SRC = path.join(ROOT, 'platforms', 'antigravity', 'hooks');
const TOOLS = buildTools(HOME, ROOT);
const TOOL_KEYS = ['cursor', 'copilot', 'antigravity', 'claude', 'codex'];
const TOOL_ALIASES = { gemini: 'antigravity', 'claude-code': 'claude' };

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const formatNumber = (num) => num.toLocaleString();

function copyWithReplace(src, dest, replacements = {}) {
    if (!fs.existsSync(src)) return 0;
    ensureDir(dest);
    return steps.copyTree(src, dest, replacements);
}

function copyFileWithReplace(src, dest, replacements = {}) {
    if (!fs.existsSync(src)) return false;
    try {
        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, renderFile(src, replacements));
        progressState.copiedFiles.push(dest);
        return true;
    } catch (error) {
        logError('copy', src, error);
        return false;
    }
}

function printSummary(toolName, operation, extra = []) {
    const duration = ((Date.now() - progressState.startTime) / 1000).toFixed(2);
    const isInstall = operation === 'install';
    const failed = isInstall ? progressState.copiedFiles.filter((filePath) => !fs.existsSync(filePath)) : [];
    const total = progressState.copiedFiles.length;
    printLine('\n' + '─'.repeat(60));
    printLine(`📊 ${isInstall ? 'Installation' : 'Uninstallation'} Summary`);
    printLine('─'.repeat(60));
    printLine(`   Tool:        ${toolName}`);
    if (isInstall) {
        printLine(`   Files:       ${formatNumber(total)} written or verified`);
        printLine(`   Verified:    ${total - failed.length}/${total} files`);
        for (const missing of failed.slice(0, 5)) printLine(`   ⚠️  Missing:   ${missing}`);
    } else {
        printLine(`   Removed:     ${formatNumber(progressState.removedPaths.length)} paths`);
    }
    printLine(`   Duration:    ${duration}s`);
    for (const line of extra) printLine(`   ${line}`);
    if (progressState.errors.length > 0) {
        printLine(`   ⚠️  Errors:    ${progressState.errors.length}`);
        for (const e of progressState.errors.slice(0, 5)) printLine(`                 - ${e.operation}: ${e.path} (${e.error})`);
        if (progressState.errors.length > 5) printLine(`                 ... and ${progressState.errors.length - 5} more`);
    }
    printLine('─'.repeat(60));
    const success = progressState.errors.length === 0 && failed.length === 0;
    if (success) printLine(`✅ ${isInstall ? 'Installation' : 'Uninstallation'} completed successfully!`);
    else {
        printLine('❌ Completed with errors (see above).');
        process.exitCode = EXIT_FAILURE;
    }
    return success;
}

function estimateTotal(plan) {
    let total = plan.instructionFiles.length + ROOT_FILES.length + countFiles(HOOKS_SRC) + countFiles(path.join(ROOT, 'commands'));
    for (const dir of CORE_DIRS) total += countFiles(path.join(ROOT, dir));
    for (const copy of plan.shared) {
        total += copy.file || copy.sharedVault ? 1 : countFiles(copy.src, copy.kind ? INTERNAL_SKIP_SUBDIRS[copy.kind] : null);
    }
    return total + 2;
}

function createLedger(key, tool) {
    try {
        const hasExisting = fs.existsSync(tool.paths.frameworkPath) || Boolean(tool.paths.pluginPath && fs.existsSync(tool.paths.pluginPath));
        return new InstallLedger({ homeDir: HOME, toolKey: key, kitVersion: KIT_VERSION, userFilesRestorable: !hasExisting });
    } catch (error) {
        logError('manifest', manifestPath(HOME, key), error);
        return null;
    }
}

function pruneAntigravityVaultOrphans(libraryDir) {
    if (!fs.existsSync(libraryDir) || steps.pointsToSharedVault(libraryDir, HOME)) return;
    for (const name of ['boomopen-workflow-kit', 'bwf-auto-save', 'bwf-session-restore']) {
        const orphan = path.join(libraryDir, name);
        if (fs.existsSync(orphan)) {
            try { fs.rmSync(orphan, { recursive: true, force: true }); } catch (error) { logError('legacy-library', orphan, error); }
        }
    }
}

function copySharedFolders(plan, key, tool, ledger, notes) {
    let total = 0;
    for (const copy of plan.shared) {
        if (copy.sharedVault) {
            if (!fs.existsSync(copy.src)) {
                warnLine('   ⚠️  skills_library/ is not bundled in this kit copy; the on-demand library skills are unavailable.');
                notes.push('Library:     skills_library/ not bundled in this kit copy (indexed library skills unavailable)');
                continue;
            }
            if (key === 'antigravity') pruneAntigravityVaultOrphans(copy.dest);
            total += steps.installSharedSkillsLibrary(copy.src, copy.dest, HOME, ledger);
            continue;
        }
        const replacements = copy.verbatim ? null : tool.replacements;
        if (copy.file) total += steps.copySharedFile(copy.src, copy.dest, replacements, ledger);
        else total += steps.copyTree(copy.src, copy.dest, replacements, ledger, { kind: copy.kind, platformKey: key });
    }
    return total;
}

function finishLedger(ledger, notes) {
    try {
        if (ledger.previous && progressState.errors.length > 0) {
            ledger.carryForwardPrevious();
            notes.push('Upgrade:     old kit files were not cleaned up because this run had errors');
        } else {
            const { removed, kept } = ledger.pruneStale();
            if (removed.length) notes.push(`Upgrade:     removed ${removed.length} files the kit no longer ships`);
            if (kept.length) notes.push(`Upgrade:     kept ${kept.length} files you modified that the kit no longer ships`);
        }
        if (ledger.backedUp.length && ledger.restorable) {
            notes.push(`Backups:     ${ledger.backedUp.length} of your files were saved to ${ledger.sessionBackupDir}`);
        } else if (ledger.backedUp.length) {
            notes.push(`Backups:     ${ledger.backedUp.length} previous kit copies (including any you edited) were saved to`);
            notes.push(`             ${ledger.sessionBackupDir} (they are not put back on uninstall)`);
        }
        ledger.save();
    } catch (error) {
        logError('manifest', manifestPath(HOME, ledger.toolKey), error);
    }
}

function registerHooks(key, tool, notes, optInHooks = false) {
    const hookPath = path.join(tool.paths.frameworkPath, 'hooks', hooksMod.HOOK_SCRIPT_NAME);
    const configs = {
        antigravity: [tool.paths.antigravity && path.join(tool.paths.antigravity, 'hooks.json'), hooksMod.isAntigravityHookRegistered, hooksMod.registerAntigravityHook, true],
        claude: [tool.paths.home && path.join(tool.paths.home, 'settings.json'), hooksMod.isClaudeHookRegistered, hooksMod.registerClaudeHook, false],
        cursor: [tool.paths.editorHome && path.join(tool.paths.editorHome, 'hooks.json'), hooksMod.isCursorHookRegistered, hooksMod.registerCursorHook, false],
    };
    const cfg = configs[key];
    if (!cfg || !cfg[0]) return;
    const [targetPath, isReg, reg, showManual] = cfg;
    if (!optInHooks && !isReg(targetPath)) {
        notes.push(`Guard:       opt-in hook not registered (run \`boomopen install ${key} --with-hooks\` to enable)`);
        if (showManual) for (const line of hooksMod.describeManualRegistration(hookPath).slice(1)) notes.push(`             ${line}`);
        return;
    }
    try {
        reg(targetPath, hookPath);
        notes.push(`Guard:       safety & stop-quality hooks registered in ${targetPath}`);
    } catch (error) {
        warnLine(`   ⚠️  Guard hook not registered: ${error instanceof Error ? error.message : String(error)}`);
        notes.push('Guard:       NOT registered (see warning above)');
    }
}

function syncSettings(platforms = null) {
    try {
        const opts = platforms ? { homeDir: HOME, platforms } : { homeDir: HOME };
        const report = settingsMod.syncSettingsToInstalledPlatforms(null, opts);
        for (const item of (report && report.failedFiles) || []) logError('settings-sync', item.file, new Error(item.error));
    } catch (error) {
        logError('settings-sync', path.join(HOME, '.boomopen'), error);
    }
}

function cleanupPreManifestInternalLeaks(key, tool, plan) {
    for (const copy of plan.shared) {
        if (copy.kind === 'commands' && fs.existsSync(path.join(copy.dest, '_ref'))) {
            steps.removeIdenticalCopies(path.join(ROOT, 'commands', '_ref'), path.join(copy.dest, '_ref'), tool.replacements);
            pruneEmptyTree(path.join(copy.dest, '_ref'));
        }
        if (copy.kind === 'agents' && fs.existsSync(path.join(copy.dest, 'teams'))) {
            steps.removeIdenticalCopies(path.join(ROOT, 'agents', 'teams'), path.join(copy.dest, 'teams'), tool.replacements);
            pruneEmptyTree(path.join(copy.dest, 'teams'));
        }
        if (key === 'copilot' && copy.kind === 'agents') {
            steps.removeIdenticalCopies(path.join(ROOT, 'agents'), copy.dest, tool.replacements);
        }
    }
}

function cleanupAntigravityLegacy(tool) {
    const deadWorkflowDirs = [
        path.join(tool.paths.gemini, 'antigravity', 'global_workflows'),
        path.join(HOME, '.antigravity', 'workflows'),
        path.join(tool.paths.antigravity, 'global_workflows'),
    ];
    for (const dir of deadWorkflowDirs) {
        try { steps.removeIdenticalCopies(path.join(ROOT, 'commands'), dir, tool.replacements); removeDirIfEmpty(dir); } catch (e) { logError('legacy-workflows', dir, e); }
    }
    const deadAgentsDir = path.join(HOME, '.antigravity', 'agents');
    if (fs.existsSync(deadAgentsDir)) {
        try {
            steps.removeIdenticalCopies(path.join(ROOT, 'agents'), deadAgentsDir, tool.replacements);
            steps.removeIdenticalCopies(tool.assets.agentFile, path.join(deadAgentsDir, 'AntigravityGlobal.agent.md'), tool.replacements);
            removeDirIfEmpty(deadAgentsDir);
            removeDirIfEmpty(path.join(HOME, '.antigravity'));
        } catch (error) { logError('legacy-agents', deadAgentsDir, error); }
    }
    const skillsJsonPath = path.join(tool.paths.antigravity, 'skills.json');
    if (fs.existsSync(skillsJsonPath)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.entries)) fs.unlinkSync(skillsJsonPath);
        } catch {
            try { fs.unlinkSync(skillsJsonPath); } catch (err) { logError('legacy-skills-json', skillsJsonPath, err); }
        }
    }
    const legacySkill = path.join(tool.paths.skills, 'agent-assistant');
    if (['SKILL.md', 'rules', 'agents'].every((name) => fs.existsSync(path.join(legacySkill, name)))) {
        try { fs.rmSync(legacySkill, { recursive: true, force: true }); } catch (error) { logError('legacy-skill', legacySkill, error); }
    }
    pruneAntigravityVaultOrphans(`${tool.paths.skills}_library`);
}

function installTool(key, options = {}) {
    const tool = TOOLS[key];
    const plan = buildPlan(key, tool, ROOT);
    const asPlugin = Boolean(options.asPlugin && key === 'antigravity');
    resetProgress(estimateTotal(plan));
    printLine(`\n📦 Installing BoomOpen Workflow Kit v${KIT_VERSION} for ${tool.name}${asPlugin ? ' (native plugin)' : ''}...`);
    printLine(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    const notes = [];
    let total = 0;
    const ledger = createLedger(key, tool);
    if (ledger) {
        migrateLegacy({ key, tool, ledger, notes, root: ROOT, homeDir: HOME });
        if (asPlugin) {
            steps.uninstallInstructionFiles(plan.instructionFiles.map((f) => f.dest).concat(plan.legacyInstructionFiles), kitInstructionTexts(tool, plan, ROOT));
            fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
            total += steps.installAntigravityPlugin(tool, ROOT, CORE_DIRS, ROOT_FILES, HOOKS_SRC, VERBATIM_DIRS, ledger);
            const vaultSrc = path.join(ROOT, 'skills_library');
            if (fs.existsSync(vaultSrc)) {
                pruneAntigravityVaultOrphans(`${tool.paths.skills}_library`);
                total += steps.installSharedSkillsLibrary(vaultSrc, `${tool.paths.skills}_library`, HOME, ledger);
            }
            cleanupAntigravityLegacy(tool);
            finishLedger(ledger, notes);
            notes.push(`Plugin:      bundled in ${tool.paths.pluginPath}`);
        } else {
            if (key === 'antigravity' && tool.paths.pluginPath && fs.existsSync(tool.paths.pluginPath)) {
                fs.rmSync(tool.paths.pluginPath, { recursive: true, force: true });
                removeDirIfEmpty(path.dirname(tool.paths.pluginPath));
            }
            recordToolDirs(plan, tool, ledger);
            total += steps.installInstructionFiles(plan.instructionFiles, tool.replacements);
            steps.uninstallInstructionFiles(plan.legacyInstructionFiles, kitInstructionTexts(tool, plan, ROOT));
            total += steps.installFramework(tool.paths.frameworkPath, ROOT, CORE_DIRS, ROOT_FILES, HOOKS_SRC, tool.replacements, VERBATIM_DIRS, key);
            total += copySharedFolders(plan, key, tool, ledger, notes);
            if (key === 'codex' && steps.mergeCodexConfigFile(tool.assets.configToml, path.join(tool.paths.home, 'config.toml'), HOME)) total++;
            cleanupPreManifestInternalLeaks(key, tool, plan);
            if (key === 'antigravity') cleanupAntigravityLegacy(tool);
            finishLedger(ledger, notes);
            registerHooks(key, tool, notes, Boolean(options.registerHooks));
            syncSettings([key]);
        }
    }
    completeProgress();
    printSummary(tool.name, 'install', notes);
    printLine('\n   📁 Paths:');
    for (const [label, value] of Object.entries(tool.paths)) printLine(`      ${label.padEnd(15)} ${value}`);
    return total;
}

function isInstalled(key, tool, plan) {
    if (fs.existsSync(tool.paths.frameworkPath) || fs.existsSync(manifestPath(HOME, key))) return true;
    if (tool.paths.pluginPath && fs.existsSync(path.join(tool.paths.pluginPath, 'plugin.json'))) return true;
    return plan.instructionFiles.some(({ dest }) => hasKitContent(dest));
}

function removeSharedFiles(key, tool, plan, notes) {
    let result = null;
    try { result = uninstallFromManifest(HOME, key); } catch (error) { logError('manifest', manifestPath(HOME, key), error); return; }
    if (!result) {
        const backupDir = path.join(backupRoot(HOME, key), `uninstall-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        let removed = 0;
        let moved = 0;
        for (const copy of plan.shared) {
            if (copy.sharedVault && steps.pointsToSharedVault(copy.dest, HOME)) continue;
            const r = steps.removeUnmanifestedCopies(copy.src, copy.dest, copy.verbatim ? null : tool.replacements, backupDir, { kind: copy.kind, platformKey: key });
            removed += r.removed;
            moved += r.moved;
        }
        notes.push(`Legacy:      no install manifest; removed ${removed} unchanged kit files`);
        if (moved) notes.push(`Legacy:      ${moved} kit-named files differed and were moved to ${backupDir}`);
        return;
    }
    progressState.removedPaths.push(...result.removed);
    if (result.restored.length) notes.push(`Restored:    ${result.restored.length} of your files the kit had replaced`);
    if (result.kept.length) notes.push(`Kept:        ${result.kept.length} kit files you modified after install, e.g. ${result.kept[0]}`);
}

function unregisterToolHooks(key, tool, notes) {
    const unregMap = {
        antigravity: [tool.paths.antigravity && path.join(tool.paths.antigravity, 'hooks.json'), hooksMod.unregisterAntigravityHook, 'hooks.json'],
        claude: [tool.paths.home && path.join(tool.paths.home, 'settings.json'), hooksMod.unregisterClaudeHook, 'settings.json'],
        cursor: [tool.paths.editorHome && path.join(tool.paths.editorHome, 'hooks.json'), hooksMod.unregisterCursorHook, 'hooks.json'],
    };
    const entry = unregMap[key];
    if (!entry || !entry[0]) return;
    try {
        if (entry[1](entry[0]) === 'removed') notes.push(`Guard:       hook removed from ${entry[2]}`);
    } catch (error) { logError('hook', entry[0], error); }
}

function uninstallTool(key) {
    const tool = TOOLS[key];
    const plan = buildPlan(key, tool, ROOT);
    resetProgress(plan.instructionFiles.length + plan.shared.length + 2);
    printLine(`\n🗑️  Uninstalling BoomOpen Workflow Kit from ${tool.name}...`);
    if (!isInstalled(key, tool, plan)) { printLine('   ℹ️  Not installed — nothing to remove.'); return 0; }
    printLine('   Only files written by the kit are removed; your own files are kept.\n');

    const notes = [];
    steps.uninstallInstructionFiles(plan.instructionFiles.map((f) => f.dest).concat(plan.legacyInstructionFiles), kitInstructionTexts(tool, plan, ROOT));
    if (key === 'codex') steps.unmergeCodexConfigFile(path.join(tool.paths.home, 'config.toml'));
    unregisterToolHooks(key, tool, notes);
    for (const kitOwnedDir of [tool.paths.frameworkPath, tool.paths.pluginPath].filter(Boolean)) {
        if (!fs.existsSync(kitOwnedDir)) continue;
        try {
            fs.rmSync(kitOwnedDir, { recursive: true, force: true });
            progressState.removedPaths.push(kitOwnedDir);
            if (kitOwnedDir === tool.paths.pluginPath) removeDirIfEmpty(path.dirname(kitOwnedDir));
        } catch (error) { logError('remove', kitOwnedDir, error); }
    }
    steps.unlinkToolSkillsLibrary(`${tool.paths.skills}_library`, HOME);
    removeSharedFiles(key, tool, plan, notes);
    steps.cleanupSharedVaultIfUnreferenced(HOME, TOOLS);
    completeProgress();
    printSummary(tool.name, 'uninstall', notes);
    return progressState.removedPaths.length;
}

const router = createCliRouter({ home: HOME, root: ROOT, tools: TOOLS, toolKeys: TOOL_KEYS, toolAliases: TOOL_ALIASES, installTool, uninstallTool, isInstalled });

if (require.main === module) {
    router.main().catch((error) => {
        warnLine(`❌ ${error instanceof Error ? error.stack || error.message : String(error)}`);
        process.exitCode = EXIT_FAILURE;
    });
}

module.exports = {
    TOOLS, TOOL_KEYS, ROOT_FILES, CORE_DIRS, KIT_DIR_NAME,
    ensureDir, copyWithReplace, copyFileWithReplace, countFiles, listSourceFiles,
    installTool, uninstallTool, parseArgs, main: router.main,
    buildCompactSkillIndex: doctorMod.buildCompactSkillIndex, runDoctor: doctorMod.runDoctor, runCheck,
    runCookCli: cookMod.runCookCli, detectCookState: cookMod.detectCookState, compileWavePackets: cookMod.compileWavePackets, verifyWaveExecution: cookMod.verifyWaveExecution, runCookPreflight: cookMod.runCookPreflight,
    runReconcileCli: reconcileMod.runReconcileCli, scanProjectReconciliation: reconcileMod.scanProjectReconciliation, amendPlanWithDeltaWave: reconcileMod.amendPlanWithDeltaWave,
    runAuditCli: auditMod.runAuditCli, initAuditLedger: auditMod.initAuditLedger, getRoundSlice: auditMod.getRoundSlice, recordRoundFindings: auditMod.recordRoundFindings, applyUserDecisions: auditMod.applyUserDecisions, verifyRoundFixes: auditMod.verifyRoundFixes,
    runResearchCli: researchMod.runResearchCli, parseResearchMarkdown: researchMod.parseResearchMarkdown, validateResearch: researchMod.validateResearch, extractResearchBrief: researchMod.extractResearchBrief,
    runDesignCli: designMod.runDesignCli, parseDesignMarkdown: designMod.parseDesignMarkdown, validateDesign: designMod.validateDesign, extractDesignContract: designMod.extractDesignContract,
    runPlanCli: planMod.runPlanCli, parsePlanMarkdown: planMod.parsePlanMarkdown, validatePlan: planMod.validatePlan, compilePlanToLedger: planMod.compilePlanToLedger,
    runLedgerCli: ledgerMod.runLedgerCli, initLedger: ledgerMod.initLedger, validateLedger: ledgerMod.validateLedger, verifyPhaseGate: ledgerMod.verifyPhaseGate, auditLedger: ledgerMod.auditLedger,
    runConductorCli: conductorMod.runConductorCli, dispatchToEngine: conductorMod.dispatchToEngine, runMultiEngineCouncil: conductorMod.runMultiEngineCouncil, resolveEngineForRole: conductorMod.resolveEngineForRole,
    loadSettings: settingsMod.loadSettings, saveSettings: settingsMod.saveSettings, setSettingByKey: settingsMod.setSettingByKey, getSettingByKey: settingsMod.getSettingByKey,
    applyPreset: settingsMod.applyPreset, resetSettings: settingsMod.resetSettings, renderActiveSettingsMarkdown: settingsMod.renderActiveSettingsMarkdown,
    injectSettingsBlockIntoText: settingsMod.injectSettingsBlockIntoText, syncSettingsToInstalledPlatforms: settingsMod.syncSettingsToInstalledPlatforms,
    runSettingsCommand: settingsMod.runSettingsCommand, startSettingsUiServer,
};
