'use strict';

/**
 * Ownership checks around one install / uninstall run:
 *  - installedCopyProblem: install/uninstall only run from a kit clone, never from an installed
 *    framework copy (that copy would delete its own sources and then prune every kit file);
 *  - migrateLegacy: the pre-v5 skill migration runs only when upgrading a pre-manifest kit install,
 *    and every folder it moves is recorded so uninstall puts it back;
 *  - recordToolDirs: tool folders the kit creates (~/.claude, ~/.codex, ...) are recorded so
 *    uninstall removes them again when they end up empty;
 *  - kitInstructionTexts: the rendered kit instruction texts that identify a pristine kit copy.
 * Failures are recorded with logError and never abort a run.
 */

const fs = require('node:fs');
const path = require('node:path');

const { applyReplacements } = require('./copy-engine.js');
const { logError } = require('./progress.js');
const { backupRoot } = require('./manifest.js');
const { migrateLegacySkills } = require('./legacy-skills.js');

const LEGACY_KIT_DIR_NAME = 'agent-assistant';

/**
 * @param {string} root folder the running CLI belongs to
 * @param {Record<string, { paths: { frameworkPath: string } }>} tools
 * @returns {string|null} why this copy cannot install or uninstall, or null
 */
function installedCopyProblem(root, tools) {
    const resolvedRoot = path.resolve(root);
    for (const tool of Object.values(tools)) {
        const rel = path.relative(path.resolve(tool.paths.frameworkPath), resolvedRoot);
        if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) {
            return `this CLI is an installed copy (${resolvedRoot})`;
        }
    }
    if (!fs.existsSync(path.join(resolvedRoot, 'platforms'))) return `${resolvedRoot} is not a kit clone (platforms/ is missing)`;
    return null;
}

/** An install made by a release that kept no manifest (the framework folder or its old name exists). */
function hasPreManifestInstall(tool) {
    return fs.existsSync(tool.paths.frameworkPath) || fs.existsSync(path.join(tool.paths.skills, LEGACY_KIT_DIR_NAME));
}

/**
 * Upgrade from a pre-manifest install only: move unmodified skills bundled by pre-split releases out
 * of the active folder. A brand-new user's skills are never touched, a skill whose content differs
 * from the kit's copy stays, and every move is recorded so uninstall puts it back.
 * @param {{ key: string, tool: object, ledger: import('./manifest.js').InstallLedger, notes: string[],
 *   root: string, homeDir: string }} options
 */
function migrateLegacy({ key, tool, ledger, notes, root, homeDir }) {
    if (ledger.previous || !hasPreManifestInstall(tool)) return;
    try {
        const coreDir = path.join(root, 'skills');
        const { moves, skipped, backupDir } = migrateLegacySkills({
            skillsDir: tool.paths.skills,
            coreSkillNames: fs.existsSync(coreDir) ? fs.readdirSync(coreDir) : [],
            vaultDirs: [path.join(root, 'skills_library'), `${tool.paths.skills}_library`],
            backupDir: path.join(backupRoot(homeDir, key), 'legacy-skills'),
            replacements: tool.replacements,
        });
        for (const move of moves) ledger.recordLegacyMove(move.from, move.to);
        if (moves.length) {
            notes.push(`Legacy:      moved ${moves.length} unmodified pre-v5 bundled skills (now in the vault) to ${backupDir}`);
            notes.push('             (uninstall moves them back)');
        }
        if (skipped.length) {
            notes.push(`Legacy:      kept ${skipped.length} skills named like old kit skills (content differs), e.g. ${skipped[0]}`);
        }
    } catch (error) {
        logError('legacy-skills', tool.paths.skills, error);
    }
}

/** Remember every tool folder this install creates, so uninstall can remove it again when empty. */
function recordToolDirs(plan, tool, ledger) {
    const dirs = plan.instructionFiles.map(({ dest }) => path.dirname(dest)).concat(path.dirname(tool.paths.frameworkPath));
    for (const dir of dirs) {
        try {
            ledger.ensureDir(dir);
        } catch (error) {
            logError('mkdir', dir, error);
        }
    }
}

/** Rendered kit instruction texts: an unmarked copy equal to one of them is a pristine kit file. */
function kitInstructionTexts(tool, plan, root) {
    const sources = new Set([
        ...plan.instructionFiles.map(({ src }) => src),
        path.join(root, 'CLAUDE.md'),
        path.join(root, 'AGENT.md'),
        path.join(root, 'platforms', 'claude', 'CLAUDE.md'),
    ]);
    const texts = [];
    for (const src of sources) {
        try {
            const raw = fs.readFileSync(src, 'utf8');
            texts.push(raw, applyReplacements(raw, tool.replacements));
        } catch (error) {
            if (!error || error.code !== 'ENOENT') logError('instructions', src, error);
        }
    }
    return texts;
}

module.exports = { installedCopyProblem, hasPreManifestInstall, migrateLegacy, recordToolDirs, kitInstructionTexts };
