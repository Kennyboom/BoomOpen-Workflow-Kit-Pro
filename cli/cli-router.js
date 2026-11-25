'use strict';

/**
 * CLI argument parser, banner, help text, interactive picker, and subcommand dispatcher
 * for `boomopen` (`cli/install.js`).
 */

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const { runDoctorCli } = require('./doctor.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { runCheckCli } = require('./checker.js');
const { runLedgerCli } = require('./ledger.js');
const { runPlanCli } = require('./plan.js');
const { runDesignCli } = require('./design.js');
const { runResearchCli } = require('./research.js');
const { runCookCli } = require('./cook.js');
const { runReconcileCli } = require('./reconcile.js');
const { runAuditCli } = require('./audit.js');
const { runConductorCli } = require('./conductor.js');
const { runSettingsCommand } = require('./settings.js');
const { buildPlan } = require('./tool-config.js');
const { printLine, warnLine } = require('./progress.js');
const { loadManifest } = require('./manifest.js');
const { installedCopyProblem } = require('./install-ownership.js');
const { hasKitContent } = require('./instruction-files.js');

const EXIT_FAILURE = 1;
const EXIT_USAGE = 2;
const REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git';
const INSTALL_FLAGS = new Set(['--all', '--with-hooks', '--as-plugin', '--force', '-h', '--help', '-v', '--version']);
const UNINSTALL_FLAGS = new Set(['--all', '--force', '-h', '--help', '-v', '--version']);

function formatNumber(num) {
    return num.toLocaleString();
}

function printBanner() {
    const title = `BoomOpen Workflow Kit v${KIT_VERSION} — Installer`;
    const subtitle = 'Multi-agent orchestration for AI coding assistants';
    const width = 63;
    const row = (text) => `║   ${text.padEnd(width - 3)}║`;
    printLine(['', `╔${'═'.repeat(width)}╗`, row(title), row(subtitle), `╚${'═'.repeat(width)}╝`, ''].join('\n'));
}

function settingsCwd(root) {
    const fromNpmScript = /^settings(:|$)/.test(process.env.npm_lifecycle_event || '');
    const initCwd = process.env.INIT_CWD;
    if (fromNpmScript && initCwd && path.resolve(process.cwd()) === path.resolve(root)) return initCwd;
    return process.cwd();
}

function printUsage(toolKeys) {
    printLine(`
Usage: boomopen <command> [options]
   or: node cli/install.js <command> [options]

Commands:
  install <tool>     Install for one tool: ${toolKeys.join(', ')}
  install --all      Install for every supported tool
  uninstall <tool>   Remove the kit from one tool (or --all); your own files are kept
  list               Show supported tools and what is installed
  settings [subcmd]  Presets, execution mode, sync, or the local Web UI (settings --ui); see "settings help"
  doctor             Kit source and installed-platform health checks (read-only)
  check [dir]        Audit source files against the Pragmatic 2-Tier Coding Standards
  cook [subcmd]      State detection, wave handoff packets & post-wave verification (see "cook help")
  reconcile [dir]    Wave 2.5 spec-to-code reconciliation, island detector & route/env parity (see "reconcile --help")
  audit [subcmd]     Stateful multi-round whole-project audit ledger & fix ratchet (see "audit help")
  research [subcmd]  Validate RESEARCH/BRAINSTORM.md (4 gates) & extract HANDOFF_BRIEF (see "research help")
  design [subcmd]    Validate DESIGN.md (4 gates) & extract DESIGN_CONTRACT (see "design help")
  plan [subcmd]      Validate PLAN.md (5 gates) & compile to project-ledger.json (see "plan help")
  ledger [subcmd]    Multi-phase project ledger, phase verification gate, and RTM audit (see "ledger help")
  conduct [subcmd]   Multi-engine conductor & parallel council consensus (see "conduct help")
  help               Show this help

Options:
  --all              With install/uninstall: every supported tool
  --with-hooks       Also register the opt-in safety & stop-quality hooks (Antigravity / Claude / Cursor)
  --as-plugin        With install antigravity: bundle as native plugin in ~/.gemini/config/plugins/boomopen-workflow-kit/
  --force            Accepted for compatibility (files are always compared by content)
  -v, --version      Print the kit version
  -h, --help         Show this help

Install from source (the kit is not published on npm):
  git clone ${REPO_URL}
  cd BoomOpen-Workflow-Kit-Pro
  node cli/install.js install claude      (or: npm link, then boomopen install claude)

Examples:
  boomopen install cursor --with-hooks
  boomopen install claude --with-hooks
  boomopen install antigravity --as-plugin
  boomopen install --all
  boomopen settings preset adversarial-team
  boomopen uninstall copilot
`);
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

function createCliRouter(ctx) {
    const { home, root, tools, toolKeys, toolAliases, installTool, uninstallTool, isInstalled } = ctx;

    function resolveToolKey(name) {
        const key = toolAliases[name] || name;
        return toolKeys.includes(key) ? key : null;
    }

    function listTools() {
        printLine('\n📋 Supported Tools:\n');
        for (const key of toolKeys) {
            const tool = tools[key];
            let manifest = null;
            let manifestProblem = null;
            try {
                manifest = loadManifest(home, key);
            } catch (error) {
                manifestProblem = error instanceof Error ? error.message : String(error);
                process.exitCode = EXIT_FAILURE;
            }
            const plan = buildPlan(key, tool, root);
            const installed = Boolean(manifestProblem) || isInstalled(key, tool, plan);
            const hasPluginBundle = Boolean(tool.paths.pluginPath && fs.existsSync(path.join(tool.paths.pluginPath, 'plugin.json')));
            const complete = fs.existsSync(tool.paths.frameworkPath) || hasPluginBundle;
            const version = manifest && manifest.kitVersion ? ` (v${manifest.kitVersion})` : '';
            const modeTag = hasPluginBundle && !fs.existsSync(tool.paths.frameworkPath) ? ' [plugin]' : '';
            let status = '⬚ Not installed';
            if (installed) status = complete ? `✅ Installed${version}${modeTag}` : `⚠️  Partly installed${version} (framework folder missing — reinstall)`;
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

    async function promptToolSelection() {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        printLine('\n📋 Select tools to install:\n');
        toolKeys.forEach((key, i) => printLine(`  ${i + 1}. ${tools[key].name}`));
        printLine(`  ${toolKeys.length + 1}. All tools`);
        printLine('  0. Cancel\n');
        try {
            return await new Promise((resolve) => {
                rl.question(`Enter your choice (0-${toolKeys.length + 1}): `, (answer) => resolve(answer.trim()));
                rl.on('close', () => resolve(''));
            });
        } finally {
            rl.close();
        }
    }

    function runForAll(fn, operation) {
        const startTime = Date.now();
        let total = 0;
        for (const key of toolKeys) total += fn(key);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        printLine('\n' + '═'.repeat(60));
        printLine(`${operation === 'install' ? '🎉 All installations' : '✅ All uninstallations'} finished${process.exitCode ? ' (with errors)' : ''}.`);
        if (operation === 'install') printLine(`   Total files: ${formatNumber(total)}`);
        printLine(`   Total time:  ${duration}s`);
        printLine('═'.repeat(60) + '\n');
    }

    async function interactiveInstall(toolOpts = {}) {
        if (!process.stdin.isTTY) {
            printUsage(toolKeys);
            warnLine('❌ No tool given and no interactive terminal: run `boomopen install <tool>` or `install --all`.');
            process.exitCode = EXIT_FAILURE;
            return;
        }
        const choice = await promptToolSelection();
        const index = Number(choice);
        if (choice === '0') return printLine('\n❌ Installation cancelled.\n');
        if (Number.isInteger(index) && index >= 1 && index <= toolKeys.length) return void installTool(toolKeys[index - 1], toolOpts);
        if (index === toolKeys.length + 1) return void runForAll((k) => installTool(k, toolOpts), 'install');
        warnLine(`\n❌ Invalid choice "${choice}". Please enter 0-${toolKeys.length + 1}.\n`);
        process.exitCode = EXIT_FAILURE;
        return undefined;
    }

    async function runToolCommand(command, positional, flags) {
        const allowedFlags = command === 'install' ? INSTALL_FLAGS : UNINSTALL_FLAGS;
        const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
        if (unknownFlags.length > 0) {
            warnLine(`❌ Unknown option for ${command}: ${unknownFlags.join(', ')}`);
            printUsage(toolKeys);
            process.exitCode = EXIT_USAGE;
            return undefined;
        }
        if (positional.length > 1) {
            warnLine(`❌ Unexpected extra argument "${positional[1]}". Pass one tool name or --all.`);
            process.exitCode = EXIT_USAGE;
            return undefined;
        }
        const target = positional[0];
        const problem = installedCopyProblem(root, tools);
        if (problem) {
            warnLine(`❌ Cannot ${command}: ${problem}.`);
            warnLine(`   Run it from a clone of the kit: git clone ${REPO_URL}`);
            warnLine(`   then: cd BoomOpen-Workflow-Kit-Pro && node cli/install.js ${command} <tool>`);
            process.exitCode = EXIT_FAILURE;
            return undefined;
        }
        const toolOpts = { registerHooks: flags.has('--with-hooks'), asPlugin: flags.has('--as-plugin') };
        const fn = command === 'install' ? (key) => installTool(key, toolOpts) : uninstallTool;
        if (flags.has('--all') || target === 'all') return runForAll(fn, command);
        if (!target) {
            if (command === 'install') return interactiveInstall(toolOpts);
            warnLine(`❌ Please specify a tool: ${toolKeys.join(', ')}, or --all`);
            process.exitCode = EXIT_FAILURE;
            return undefined;
        }
        const key = resolveToolKey(target);
        if (!key) {
            warnLine(`❌ Unknown tool: ${target}\n   Supported tools: ${toolKeys.join(', ')}`);
            process.exitCode = EXIT_FAILURE;
            return undefined;
        }
        if (toolOpts.asPlugin && key !== 'antigravity') {
            warnLine('❌ --as-plugin is supported only for antigravity (`boomopen install antigravity --as-plugin`).');
            process.exitCode = EXIT_USAGE;
            return undefined;
        }
        fn(key);
        return undefined;
    }

    const SYNC_SUBCOMMANDS = {
        doctor: (rest) => runDoctorCli(rest, { repoRoot: root, homeDir: home }),
        check: (rest) => runCheckCli(rest, { cwd: process.cwd(), homeDir: home }),
        cook: (rest) => runCookCli(rest, { cwd: process.cwd(), homeDir: home }),
        reconcile: (rest) => runReconcileCli(rest, { cwd: process.cwd(), homeDir: home }),
        audit: (rest) => runAuditCli(rest, { cwd: process.cwd(), homeDir: home }),
        research: (rest) => runResearchCli(rest, { cwd: process.cwd(), homeDir: home }),
        design: (rest) => runDesignCli(rest, { cwd: process.cwd(), homeDir: home }),
        plan: (rest) => runPlanCli(rest, { cwd: process.cwd(), homeDir: home }),
        ledger: (rest) => runLedgerCli(rest, { cwd: process.cwd(), homeDir: home }),
    };

    async function main(argv = process.argv.slice(2)) {
        const { command, rest, flags, positional } = parseArgs(argv);
        const isSettings = command === 'settings' || command === 'config';
        const isConduct = command === 'conduct' || command === 'conductor';
        const ownsHelp = isSettings || isConduct || Object.hasOwn(SYNC_SUBCOMMANDS, command);
        if (!command && (flags.has('--version') || flags.has('-v'))) return printLine(KIT_VERSION);

        if (!command || command === 'help' || ((flags.has('--help') || flags.has('-h')) && !ownsHelp)) {
            printBanner();
            return printUsage(toolKeys);
        }
        if (command === 'install' || command === 'uninstall') {
            printBanner();
            return runToolCommand(command, positional, flags);
        }
        if (command === 'list') return listTools();
        if (Object.hasOwn(SYNC_SUBCOMMANDS, command)) {
            const code = SYNC_SUBCOMMANDS[command](rest);
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        if (isConduct) {
            const code = await runConductorCli(rest, { cwd: process.cwd(), homeDir: home });
            if (code !== 0) process.exitCode = code;
            return undefined;
        }
        if (isSettings) {
            const res = await runSettingsCommand(rest, { homeDir: home, cwd: settingsCwd(root), repoRoot: root });
            if (res && res.exitCode) process.exitCode = res.exitCode;
            return undefined;
        }
        warnLine(`❌ Unknown command: ${command}`);
        printUsage(toolKeys);
        process.exitCode = EXIT_FAILURE;
        return undefined;
    }

    return { parseArgs, main, listTools, printBanner, printUsage: () => printUsage(toolKeys) };
}

module.exports = {
    EXIT_FAILURE,
    EXIT_USAGE,
    REPO_URL,
    parseArgs,
    createCliRouter,
};
