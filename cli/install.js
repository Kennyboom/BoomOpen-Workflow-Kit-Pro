#!/usr/bin/env node
'use strict';

/**
 * BoomOpen Workflow Kit CLI installer for Cursor, GitHub Copilot, Antigravity (Gemini),
 * Claude Code and Codex.
 *
 * The kit is not published on npm. Install from a clone:
 *   git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
 *   cd BoomOpen-Workflow-Kit-Pro
 *   node cli/install.js install <tool>      (or: npm link, then boomopen install <tool>)
 *
 * Safety contract (see cli/manifest.js, cli/instruction-files.js, cli/codex-config.js):
 *   - files in folders shared with the user are tracked by sha256 in ~/.boomopen/manifests/<tool>.json;
 *     a user's file is backed up before it is replaced and uninstall removes only unmodified kit files;
 *   - global instruction files (CLAUDE.md, AGENTS.md, GEMINI.md, ...) get a marked kit block, the
 *     user's own text stays;
 *   - ~/.codex/config.toml is edited TOML-aware and never written when the result would not parse;
 *   - the installer never writes into its own package folder: install/uninstall refuse to run from an
 *     installed framework copy (~/.<tool>/skills/boomopen-workflow-kit/cli/install.js).
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');

const { buildCompactSkillIndex, runDoctor, runDoctorCli } = require('./doctor.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { runCheck, runCheckCli } = require('./checker.js');
const { runLedgerCli, initLedger, validateLedger, verifyPhaseGate, auditLedger } = require('./ledger.js');
const { runPlanCli, parsePlanMarkdown, validatePlan, compilePlanToLedger } = require('./plan.js');
const { runDesignCli, parseDesignMarkdown, validateDesign, extractDesignContract } = require('./design.js');
const { runResearchCli, parseResearchMarkdown, validateResearch, extractResearchBrief } = require('./research.js');
const { runCookCli, detectCookState, compileWavePackets, verifyWaveExecution, runCookPreflight } = require('./cook.js');
const { runConductorCli, dispatchToEngine, runMultiEngineCouncil, resolveEngineForRole } = require('./conductor.js');
const {
    loadSettings,
    saveSettings,
    setSettingByKey,
    getSettingByKey,
    applyPreset,
    resetSettings,
    renderActiveSettingsMarkdown,
    injectSettingsBlockIntoText,
    syncSettingsToInstalledPlatforms,
    runSettingsCommand,
} = require('./settings.js');
const { startSettingsUiServer } = require('./settings-ui.js');
const { KIT_DIR_NAME, CORE_DIRS, ROOT_FILES, VERBATIM_DIRS, buildTools, buildPlan } = require('./tool-config.js');
const { countFiles, listSourceFiles, renderFile } = require('./copy-engine.js');
const { progressState, resetProgress, completeProgress, logError, printLine, warnLine } = require('./progress.js');
const { InstallLedger, loadManifest, uninstallFromManifest, backupRoot, manifestPath } = require('./manifest.js');
const { installedCopyProblem, migrateLegacy, recordToolDirs, kitInstructionTexts } = require('./install-ownership.js');
const {
    registerClaudeHook,
    unregisterClaudeHook,
    isClaudeHookRegistered,
    registerAntigravityHook,
    unregisterAntigravityHook,
    isAntigravityHookRegistered,
    describeManualRegistration,
    HOOK_SCRIPT_NAME,
} = require('./hook-registration.js');
const { hasKitContent } = require('./instruction-files.js');
const steps = require('./install-steps.js');

// ============================================================================
// Configuration
// ============================================================================

const HOME = os.homedir();
const ROOT = path.join(__dirname, '..');
const HOOKS_SRC = path.join(ROOT, 'platforms', 'antigravity', 'hooks');
const TOOLS = buildTools(HOME, ROOT);
const TOOL_KEYS = ['cursor', 'copilot', 'antigravity', 'claude', 'codex'];
const TOOL_ALIASES = { gemini: 'antigravity', 'claude-code': 'claude' };
const EXIT_FAILURE = 1;
const EXIT_USAGE = 2;
const REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git';
const INSTALL_FLAGS = new Set(['--all', '--with-hooks', '--force', '-h', '--help', '-v', '--version']);
const UNINSTALL_FLAGS = new Set(['--all', '--force', '-h', '--help', '-v', '--version']);

// ============================================================================
// Compatibility helpers (exported for tests and older callers)
// ============================================================================

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

/** Copy a tree with placeholder replacement into a folder the kit owns. @returns {number} files */
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

function formatNumber(num) {
    return num.toLocaleString();
}

// ============================================================================
// Summary
// ============================================================================

function verifyInstallation() {
    const failed = progressState.copiedFiles.filter((filePath) => !fs.existsSync(filePath));
    return { total: progressState.copiedFiles.length, failed };
}

function printErrors() {
    if (progressState.errors.length === 0) return;
    printLine(`   ⚠️  Errors:    ${progressState.errors.length}`);
    for (const e of progressState.errors.slice(0, 5)) printLine(`                 - ${e.operation}: ${e.path} (${e.error})`);
    if (progressState.errors.length > 5) printLine(`                 ... and ${progressState.errors.length - 5} more`);
}

/** Print the summary; a run with errors sets a failing exit code. @returns {boolean} success */
function printSummary(toolName, operation, extra = []) {
    const duration = ((Date.now() - progressState.startTime) / 1000).toFixed(2);
    const isInstall = operation === 'install';
    const verification = isInstall ? verifyInstallation() : null;
    printLine('\n' + '─'.repeat(60));
    printLine(`📊 ${isInstall ? 'Installation' : 'Uninstallation'} Summary`);
    printLine('─'.repeat(60));
    printLine(`   Tool:        ${toolName}`);
    if (isInstall) {
        printLine(`   Files:       ${formatNumber(progressState.copiedFiles.length)} written or verified`);
        printLine(`   Verified:    ${verification.total - verification.failed.length}/${verification.total} files`);
        for (const missing of verification.failed.slice(0, 5)) printLine(`   ⚠️  Missing:   ${missing}`);
    } else {
        printLine(`   Removed:     ${formatNumber(progressState.removedPaths.length)} paths`);
    }
    printLine(`   Duration:    ${duration}s`);
    for (const line of extra) printLine(`   ${line}`);
    printErrors();
    printLine('─'.repeat(60));

    const success = progressState.errors.length === 0 && (!verification || verification.failed.length === 0);
    if (success) printLine(`✅ ${isInstall ? 'Installation' : 'Uninstallation'} completed successfully!`);
    else {
        printLine('❌ Completed with errors (see above).');
        process.exitCode = EXIT_FAILURE;
    }
    return success;
}

// ============================================================================
// Install
// ============================================================================

function estimateTotal(plan) {
    let total = plan.instructionFiles.length + ROOT_FILES.length + countFiles(HOOKS_SRC);
    for (const dir of CORE_DIRS) total += countFiles(path.join(ROOT, dir));
    total += countFiles(path.join(ROOT, 'commands'));
    for (const copy of plan.shared) total += copy.file ? 1 : countFiles(copy.src);
    return total + 2;
}

function createLedger(key, tool) {
    try {
        return new InstallLedger({
            homeDir: HOME,
            toolKey: key,
            kitVersion: KIT_VERSION,
            userFilesRestorable: !fs.existsSync(tool.paths.frameworkPath),
        });
    } catch (error) {
        logError('manifest', manifestPath(HOME, key), error);
        return null;
    }
}

function copySharedFolders(plan, tool, ledger, notes) {
    let total = 0;
    for (const copy of plan.shared) {
        if (path.basename(copy.src) === 'skills_library' && !fs.existsSync(copy.src)) {
            // listSourceFiles returns [] on ENOENT; never skip the vault silently.
            warnLine('   ⚠️  skills_library/ is not bundled in this kit copy; the on-demand library skills are unavailable.');
            notes.push('Library:     skills_library/ not bundled in this kit copy (indexed library skills unavailable)');
            continue;
        }
        const replacements = copy.verbatim ? null : tool.replacements;
        if (copy.file) total += steps.copySharedFile(copy.src, copy.dest, replacements, ledger);
        else total += steps.copyTree(copy.src, copy.dest, replacements, ledger);
    }
    return total;
}

function finishLedger(ledger, notes) {
    try {
        if (ledger.previous && progressState.errors.length > 0) {
            // A run that failed part-way must not treat the files it could not write as stale.
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
            // Upgrading a pre-manifest install: these are mostly copies the older kit release wrote.
            notes.push(`Backups:     ${ledger.backedUp.length} previous kit copies (including any you edited) were saved to`);
            notes.push(`             ${ledger.sessionBackupDir} (they are not put back on uninstall)`);
        }
        ledger.save();
    } catch (error) {
        logError('manifest', manifestPath(HOME, ledger.toolKey), error);
    }
}

/**
 * The destructive-command guard is copied into every framework folder and is opt-in:
 * `install <claude|antigravity> --with-hooks` registers it as a PreToolUse hook (an existing
 * registration is refreshed on reinstall).
 */
function registerHooks(key, tool, notes, optInHooks = false) {
    const hookPath = path.join(tool.paths.frameworkPath, 'hooks', HOOK_SCRIPT_NAME);
    if (key === 'antigravity') {
        const hooksJsonPath = path.join(tool.paths.antigravity, 'hooks.json');
        if (!optInHooks && !isAntigravityHookRegistered(hooksJsonPath)) {
            notes.push('Guard:       opt-in hook not registered (run `boomopen install antigravity --with-hooks` to enable)');
            for (const line of describeManualRegistration(hookPath).slice(1)) notes.push(`             ${line}`);
            return;
        }
        try {
            registerAntigravityHook(hooksJsonPath, hookPath);
            notes.push(`Guard:       destructive-command hook registered in ${hooksJsonPath}`);
        } catch (error) {
            warnLine(`   ⚠️  Guard hook not registered: ${error instanceof Error ? error.message : String(error)}`);
            notes.push('Guard:       NOT registered (see warning above)');
        }
        return;
    }
    if (key !== 'claude') return;
    const settingsPath = path.join(tool.paths.home, 'settings.json');
    if (!optInHooks && !isClaudeHookRegistered(settingsPath)) {
        notes.push('Guard:       opt-in hook not registered (run `boomopen install claude --with-hooks` to enable)');
        return;
    }
    try {
        registerClaudeHook(settingsPath, hookPath);
        notes.push(`Guard:       destructive-command hook registered in ${settingsPath}`);
    } catch (error) {
        warnLine(`   ⚠️  Guard hook not registered: ${error instanceof Error ? error.message : String(error)}`);
        notes.push('Guard:       NOT registered (see warning above)');
    }
}

function syncSettings(platforms = null) {
    try {
        // null = global settings only, so a workspace ./.boomopen.json never leaks into global entry files.
        const opts = platforms ? { homeDir: HOME, platforms } : { homeDir: HOME };
        const report = syncSettingsToInstalledPlatforms(null, opts);
        for (const item of (report && report.failedFiles) || []) {
            logError('settings-sync', item.file, new Error(item.error));
        }
    } catch (error) {
        logError('settings-sync', path.join(HOME, '.boomopen'), error);
    }
}

/**
 * Older releases also wrote into ~/.gemini/antigravity/global_workflows and a skill folder named
 * after the kit's former name. Only byte-identical kit copies are removed there.
 */
function cleanupAntigravityLegacy(tool) {
    const legacyWorkflows = path.join(tool.paths.gemini, 'antigravity', 'global_workflows');
    try {
        steps.removeIdenticalCopies(path.join(ROOT, 'commands'), legacyWorkflows, tool.replacements);
    } catch (error) {
        logError('legacy-workflows', legacyWorkflows, error);
    }
    const legacySkill = path.join(tool.paths.skills, 'agent-assistant');
    const looksLikeKit = ['SKILL.md', 'rules', 'agents'].every((name) => fs.existsSync(path.join(legacySkill, name)));
    if (looksLikeKit) {
        try {
            fs.rmSync(legacySkill, { recursive: true, force: true });
        } catch (error) {
            logError('legacy-skill', legacySkill, error);
        }
    }
    const libraryDir = `${tool.paths.skills}_library`;
    for (const name of ['boomopen-workflow-kit', 'bwf-auto-save', 'bwf-session-restore']) {
        const orphan = path.join(libraryDir, name);
        if (!fs.existsSync(orphan)) continue;
        try {
            fs.rmSync(orphan, { recursive: true, force: true });
        } catch (error) {
            logError('legacy-library', orphan, error);
        }
    }
}

function printPaths(tool) {
    printLine('\n   📁 Paths:');
    for (const [label, value] of Object.entries(tool.paths)) printLine(`      ${label.padEnd(15)} ${value}`);
}

/** Install the kit for one tool. @returns {number} files written */
function installTool(key, options = {}) {
    const tool = TOOLS[key];
    const plan = buildPlan(key, tool, ROOT);
    resetProgress(estimateTotal(plan));
    printLine(`\n📦 Installing BoomOpen Workflow Kit v${KIT_VERSION} for ${tool.name}...`);
    printLine(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    const notes = [];
    let total = 0;
    const ledger = createLedger(key, tool);
    if (ledger) {
        migrateLegacy({ key, tool, ledger, notes, root: ROOT, homeDir: HOME });
        recordToolDirs(plan, tool, ledger);
        total += steps.installInstructionFiles(plan.instructionFiles, tool.replacements);
        steps.uninstallInstructionFiles(plan.legacyInstructionFiles, kitInstructionTexts(tool, plan, ROOT));
        total += steps.installFramework(tool.paths.frameworkPath, ROOT, CORE_DIRS, ROOT_FILES, HOOKS_SRC, tool.replacements, VERBATIM_DIRS);
        total += copySharedFolders(plan, tool, ledger, notes);
        if (key === 'codex' && steps.mergeCodexConfigFile(tool.assets.configToml, path.join(tool.paths.home, 'config.toml'))) total++;
        if (key === 'antigravity') cleanupAntigravityLegacy(tool);
        finishLedger(ledger, notes);
        registerHooks(key, tool, notes, Boolean(options.registerHooks));
        syncSettings([key]);
    }
    completeProgress();
    printSummary(tool.name, 'install', notes);
    printPaths(tool);
    return total;
}

// ============================================================================
// Uninstall
// ============================================================================

function isInstalled(key, tool, plan) {
    if (fs.existsSync(tool.paths.frameworkPath) || fs.existsSync(manifestPath(HOME, key))) return true;
    return plan.instructionFiles.some(({ dest }) => hasKitContent(dest));
}

/** Pre-manifest installs: remove identical kit copies, move anything else to a backup folder. */
function removeWithoutManifest(key, tool, plan, notes) {
    const backupDir = path.join(backupRoot(HOME, key), `uninstall-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    let removed = 0;
    let moved = 0;
    for (const copy of plan.shared) {
        const result = steps.removeUnmanifestedCopies(copy.src, copy.dest, copy.verbatim ? null : tool.replacements, backupDir);
        removed += result.removed;
        moved += result.moved;
    }
    notes.push(`Legacy:      no install manifest; removed ${removed} unchanged kit files`);
    if (moved) notes.push(`Legacy:      ${moved} kit-named files differed and were moved to ${backupDir}`);
}

function removeSharedFiles(key, tool, plan, notes) {
    let result = null;
    try {
        result = uninstallFromManifest(HOME, key);
    } catch (error) {
        logError('manifest', manifestPath(HOME, key), error);
        return;
    }
    if (!result) {
        removeWithoutManifest(key, tool, plan, notes);
        return;
    }
    progressState.removedPaths.push(...result.removed);
    if (result.restored.length) notes.push(`Restored:    ${result.restored.length} of your files the kit had replaced`);
    if (result.kept.length) {
        notes.push(`Kept:        ${result.kept.length} kit files you modified after install, e.g. ${result.kept[0]}`);
    }
}

function uninstallTool(key) {
    const tool = TOOLS[key];
    const plan = buildPlan(key, tool, ROOT);
    resetProgress(plan.instructionFiles.length + plan.shared.length + 2);
    printLine(`\n🗑️  Uninstalling BoomOpen Workflow Kit from ${tool.name}...`);
    if (!isInstalled(key, tool, plan)) {
        printLine('   ℹ️  Not installed — nothing to remove.');
        return 0;
    }
    printLine('   Only files written by the kit are removed; your own files are kept.\n');

    const notes = [];
    const instructionPaths = plan.instructionFiles.map((f) => f.dest).concat(plan.legacyInstructionFiles);
    steps.uninstallInstructionFiles(instructionPaths, kitInstructionTexts(tool, plan, ROOT));
    if (key === 'codex') steps.unmergeCodexConfigFile(path.join(tool.paths.home, 'config.toml'));
    if (key === 'antigravity') {
        const hooksJsonPath = path.join(tool.paths.antigravity, 'hooks.json');
        try {
            if (unregisterAntigravityHook(hooksJsonPath) === 'removed') notes.push('Guard:       hook removed from hooks.json');
        } catch (error) {
            logError('hook', hooksJsonPath, error);
        }
    }
    if (key === 'claude') {
        try {
            if (unregisterClaudeHook(path.join(tool.paths.home, 'settings.json')) === 'removed') notes.push('Guard:       hook removed from settings.json');
        } catch (error) {
            logError('hook', path.join(tool.paths.home, 'settings.json'), error);
        }
    }
    // The framework goes first so the folders the kit created around it can be pruned when empty.
    try {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
        progressState.removedPaths.push(tool.paths.frameworkPath);
    } catch (error) {
        logError('remove', tool.paths.frameworkPath, error);
    }
    removeSharedFiles(key, tool, plan, notes);
    completeProgress();
    printSummary(tool.name, 'uninstall', notes);
    return progressState.removedPaths.length;
}

// ============================================================================
// CLI
// ============================================================================

function printBanner() {
    const title = `BoomOpen Workflow Kit v${KIT_VERSION} — Installer`;
    const subtitle = 'Multi-agent orchestration for AI coding assistants';
    const width = 63;
    const row = (text) => `║   ${text.padEnd(width - 3)}║`;
    printLine(['', `╔${'═'.repeat(width)}╗`, row(title), row(subtitle), `╚${'═'.repeat(width)}╝`, ''].join('\n'));
}

/**
 * Folder that `settings --project` writes into. `npm --prefix <kit> run settings -- ... --project`
 * runs with the kit as cwd, so only then is npm's INIT_CWD (the caller's folder) used. Child
 * processes inherit INIT_CWD, so it is never trusted when the CLI runs from any other folder.
 */
function settingsCwd() {
    const fromNpmScript = /^settings(:|$)/.test(process.env.npm_lifecycle_event || '');
    const initCwd = process.env.INIT_CWD;
    if (fromNpmScript && initCwd && path.resolve(process.cwd()) === path.resolve(ROOT)) return initCwd;
    return process.cwd();
}

function printUsage() {
    printLine(`
Usage: boomopen <command> [options]
   or: node cli/install.js <command> [options]

Commands:
  install <tool>     Install for one tool: ${TOOL_KEYS.join(', ')}
  install --all      Install for every supported tool
  uninstall <tool>   Remove the kit from one tool (or --all); your own files are kept
  list               Show supported tools and what is installed
  settings [subcmd]  Presets, execution mode, sync, or the local Web UI (settings --ui); see "settings help"
  doctor             Kit source and installed-platform health checks (read-only)
  check [dir]        Audit source files against the Pragmatic 2-Tier Coding Standards
  cook [subcmd]      State detection, wave handoff packets & post-wave verification (see "cook help")
  research [subcmd]  Validate RESEARCH/BRAINSTORM.md (4 gates) & extract HANDOFF_BRIEF (see "research help")
  design [subcmd]    Validate DESIGN.md (4 gates) & extract DESIGN_CONTRACT (see "design help")
  plan [subcmd]      Validate PLAN.md (5 gates) & compile to project-ledger.json (see "plan help")
  ledger [subcmd]    Multi-phase project ledger, phase verification gate, and RTM audit (see "ledger help")
  conduct [subcmd]   Multi-engine conductor & parallel council consensus (see "conduct help")
  help               Show this help

Options:
  --all              With install/uninstall: every supported tool
  --with-hooks       Also register the opt-in destructive-command guard (Antigravity / Claude Code PreToolUse hook)
  --force            Accepted for compatibility (files are always compared by content)
  -v, --version      Print the kit version
  -h, --help         Show this help

Install from source (the kit is not published on npm):
  git clone ${REPO_URL}
  cd BoomOpen-Workflow-Kit-Pro
  node cli/install.js install claude      (or: npm link, then boomopen install claude)

Examples:
  boomopen install cursor
  boomopen install claude --with-hooks
  boomopen install --all
  boomopen settings preset adversarial-team
  boomopen uninstall copilot
`);
}

function listTools() {
    printLine('\n📋 Supported Tools:\n');
    for (const key of TOOL_KEYS) {
        const tool = TOOLS[key];
        let manifest = null;
        let manifestProblem = null;
        try {
            manifest = loadManifest(HOME, key);
        } catch (error) {
            manifestProblem = error instanceof Error ? error.message : String(error);
            process.exitCode = EXIT_FAILURE;
        }
        const plan = buildPlan(key, tool, ROOT);
        // Same rule as uninstall: framework folder, manifest or kit content in an entry file.
        const installed = Boolean(manifestProblem) || isInstalled(key, tool, plan);
        const complete = fs.existsSync(tool.paths.frameworkPath);
        const version = manifest && manifest.kitVersion ? ` (v${manifest.kitVersion})` : '';
        let status = '⬚ Not installed';
        if (installed) status = complete ? `✅ Installed${version}` : `⚠️  Partly installed${version} (framework folder missing — reinstall)`;
        printLine(`  ${key.padEnd(12)} ${tool.name.padEnd(25)} ${status}`);
        if (manifestProblem) warnLine(`  ${' '.repeat(38)} ⚠️  manifest unreadable: ${manifestProblem}`);
        if (!installed) continue;
        const files = plan.instructionFiles.filter(({ dest }) => hasKitContent(dest)).map(({ dest }) => path.basename(dest));
        let tracked = 'no manifest (pre-v5.5 install)';
        if (manifestProblem) tracked = 'manifest unreadable (see above)';
        else if (manifest) tracked = `${formatNumber(Object.keys(manifest.files).length)} tracked files`;
        printLine(`  ${' '.repeat(38)} ${[...files, tracked].join(', ')}`);
    }
    printLine('');
}

function resolveToolKey(name) {
    const key = TOOL_ALIASES[name] || name;
    return TOOL_KEYS.includes(key) ? key : null;
}

async function promptToolSelection() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    printLine('\n📋 Select tools to install:\n');
    TOOL_KEYS.forEach((key, i) => printLine(`  ${i + 1}. ${TOOLS[key].name}`));
    printLine(`  ${TOOL_KEYS.length + 1}. All tools`);
    printLine('  0. Cancel\n');
    try {
        return await new Promise((resolve) => {
            rl.question(`Enter your choice (0-${TOOL_KEYS.length + 1}): `, (answer) => resolve(answer.trim()));
            rl.on('close', () => resolve(''));
        });
    } finally {
        rl.close();
    }
}

async function interactiveInstall(toolOpts = {}) {
    if (!process.stdin.isTTY) {
        printUsage();
        warnLine('❌ No tool given and no interactive terminal: run `boomopen install <tool>` or `install --all`.');
        process.exitCode = EXIT_FAILURE;
        return;
    }
    const choice = await promptToolSelection();
    const index = Number(choice);
    if (choice === '0') return printLine('\n❌ Installation cancelled.\n');
    if (Number.isInteger(index) && index >= 1 && index <= TOOL_KEYS.length) return void installTool(TOOL_KEYS[index - 1], toolOpts);
    if (index === TOOL_KEYS.length + 1) return void runForAll((k) => installTool(k, toolOpts), 'install');
    warnLine(`\n❌ Invalid choice "${choice}". Please enter 0-${TOOL_KEYS.length + 1}.\n`);
    process.exitCode = EXIT_FAILURE;
    return undefined;
}

function runForAll(fn, operation) {
    const startTime = Date.now();
    let total = 0;
    for (const key of TOOL_KEYS) total += fn(key);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    printLine('\n' + '═'.repeat(60));
    printLine(`${operation === 'install' ? '🎉 All installations' : '✅ All uninstallations'} finished${process.exitCode ? ' (with errors)' : ''}.`);
    if (operation === 'install') printLine(`   Total files: ${formatNumber(total)}`);
    printLine(`   Total time:  ${duration}s`);
    printLine('═'.repeat(60) + '\n');
}

async function runToolCommand(command, positional, flags) {
    const allowedFlags = command === 'install' ? INSTALL_FLAGS : UNINSTALL_FLAGS;
    const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
    if (unknownFlags.length > 0) {
        warnLine(`❌ Unknown option for ${command}: ${unknownFlags.join(', ')}`);
        printUsage();
        process.exitCode = EXIT_USAGE;
        return undefined;
    }
    if (positional.length > 1) {
        warnLine(`❌ Unexpected extra argument "${positional[1]}". Pass one tool name or --all.`);
        process.exitCode = EXIT_USAGE;
        return undefined;
    }
    const target = positional[0];
    const problem = installedCopyProblem(ROOT, TOOLS);
    if (problem) {
        warnLine(`❌ Cannot ${command}: ${problem}.`);
        warnLine(`   Run it from a clone of the kit: git clone ${REPO_URL}`);
        warnLine(`   then: cd BoomOpen-Workflow-Kit-Pro && node cli/install.js ${command} <tool>`);
        process.exitCode = EXIT_FAILURE;
        return undefined;
    }
    const toolOpts = { registerHooks: flags.has('--with-hooks') };
    const fn = command === 'install' ? (key) => installTool(key, toolOpts) : uninstallTool;
    if (flags.has('--all') || target === 'all') return runForAll(fn, command);
    if (!target) {
        if (command === 'install') return interactiveInstall(toolOpts);
        warnLine(`❌ Please specify a tool: ${TOOL_KEYS.join(', ')}, or --all`);
        process.exitCode = EXIT_FAILURE;
        return undefined;
    }
    const key = resolveToolKey(target);
    if (!key) {
        warnLine(`❌ Unknown tool: ${target}\n   Supported tools: ${TOOL_KEYS.join(', ')}`);
        process.exitCode = EXIT_FAILURE;
        return undefined;
    }
    fn(key);
    return undefined;
}

/** Split argv: the command, its remaining arguments (including pre-command flags) and flags. */
function parseArgs(argv) {
    const commandIndex = argv.findIndex((arg) => !arg.startsWith('-'));
    const command = commandIndex === -1 ? null : argv[commandIndex].toLowerCase();
    const rest = commandIndex === -1 ? [] : argv.filter((_, idx) => idx !== commandIndex);
    const flags = new Set(argv.filter((arg) => arg.startsWith('-')).map((arg) => arg.toLowerCase()));
    const positional = rest.filter((arg) => !arg.startsWith('-')).map((arg) => arg.toLowerCase());
    return { command, rest, flags, positional };
}

async function main(argv = process.argv.slice(2)) {
    const { command, rest, flags, positional } = parseArgs(argv);
    const isSettings = command === 'settings' || command === 'config';
    const isConduct = command === 'conduct' || command === 'conductor';
    // These subcommands parse their own options, including --help.
    const ownsHelp = isSettings || isConduct || command === 'doctor' || command === 'check' || command === 'ledger' || command === 'plan' || command === 'design' || command === 'research' || command === 'cook';
    if (!command && (flags.has('--version') || flags.has('-v'))) return printLine(KIT_VERSION);

    if (!command || command === 'help' || ((flags.has('--help') || flags.has('-h')) && !ownsHelp)) {
        printBanner();
        return printUsage();
    }
    if (command === 'install' || command === 'uninstall') {
        printBanner();
        return runToolCommand(command, positional, flags);
    }
    switch (command) {
        case 'list':
            return listTools();
        case 'doctor': {
            // --platform, --source-only, --rebuild-index, --help
            const code = runDoctorCli(rest, { repoRoot: ROOT, homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'check': {
            // [dir], --ignore, --no-gitignore, --strict-phase, --help
            const code = runCheckCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'cook': {
            // state, packets, verify-wave, preflight, --help
            const code = runCookCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'research': {
            // validate, brief, --mode, --out, --json, --help
            const code = runResearchCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'design': {
            // validate, contract, --out, --json, --help
            const code = runDesignCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'plan': {
            // validate, compile, --sync-ledger, --help
            const code = runPlanCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'ledger': {
            // init, from-plan, validate, status, next, verify, audit, --help
            const code = runLedgerCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'conduct':
        case 'conductor': {
            // probe, dispatch, council, status, --help
            const code = await runConductorCli(rest, { cwd: process.cwd(), homeDir: HOME });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        case 'settings':
        case 'config': {
            const res = await runSettingsCommand(rest, { homeDir: HOME, cwd: settingsCwd(), repoRoot: ROOT });
            if (res && res.exitCode) process.exitCode = res.exitCode;
            return undefined;
        }
        default:
            warnLine(`❌ Unknown command: ${command}`);
            printUsage();
            process.exitCode = EXIT_FAILURE;
            return undefined;
    }
}

if (require.main === module) {
    main().catch((error) => {
        warnLine(`❌ ${error instanceof Error ? error.stack || error.message : String(error)}`);
        process.exitCode = EXIT_FAILURE;
    });
}

module.exports = {
    TOOLS,
    TOOL_KEYS,
    ROOT_FILES,
    CORE_DIRS,
    KIT_DIR_NAME,
    ensureDir,
    copyWithReplace,
    copyFileWithReplace,
    countFiles,
    listSourceFiles,
    installTool,
    uninstallTool,
    parseArgs,
    main,
    buildCompactSkillIndex,
    runDoctor,
    runCheck,
    runCookCli,
    detectCookState,
    compileWavePackets,
    verifyWaveExecution,
    runCookPreflight,
    runResearchCli,
    parseResearchMarkdown,
    validateResearch,
    extractResearchBrief,
    runDesignCli,
    parseDesignMarkdown,
    validateDesign,
    extractDesignContract,
    runPlanCli,
    parsePlanMarkdown,
    validatePlan,
    compilePlanToLedger,
    runLedgerCli,
    initLedger,
    validateLedger,
    verifyPhaseGate,
    auditLedger,
    runConductorCli,
    dispatchToEngine,
    runMultiEngineCouncil,
    resolveEngineForRole,
    loadSettings,
    saveSettings,
    setSettingByKey,
    getSettingByKey,
    applyPreset,
    resetSettings,
    renderActiveSettingsMarkdown,
    injectSettingsBlockIntoText,
    syncSettingsToInstalledPlatforms,
    runSettingsCommand,
    startSettingsUiServer,
};
