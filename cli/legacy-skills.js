'use strict';

/**
 * One-time upgrade step for installs made before the core/library split (v1.0.0, April 2026):
 * those releases copied ~1,400 skills straight into ~/.<tool>/skills, where every one of them
 * stays active (and costs context) even though the kit now ships them in the on-demand vault.
 *
 * The caller runs this only when an earlier kit install without a manifest is detected. A folder
 * is moved (never deleted) to ~/.boomopen/backups/<tool>/legacy-skills/<name> only when:
 *  - its name is in data/legacy-bundled-skills.json (skills bundled by those releases),
 *  - the current kit no longer ships it as a core skill,
 *  - the vault (skills_library) has a skill with the same name, and
 *  - its SKILL.md is identical to the vault copy (line endings and placeholders aside), so a
 *    user's own skill that merely shares a popular name (skill-creator, systematic-debugging, ...)
 *    is never touched.
 * Every move is reported to the caller, which records it in the install manifest so uninstall
 * moves the folder back.
 */

const fs = require('node:fs');
const path = require('node:path');

const { moveDir } = require('./manifest.js');
const { applyReplacements } = require('./copy-engine.js');

const LEGACY_DATA_FILE = path.join(__dirname, 'data', 'legacy-bundled-skills.json');
const SKILL_FILE = 'SKILL.md';

function loadLegacySkillNames() {
    try {
        const data = JSON.parse(fs.readFileSync(LEGACY_DATA_FILE, 'utf8'));
        return Array.isArray(data.skills) ? data.skills.filter((name) => typeof name === 'string') : [];
    } catch (error) {
        if (error && (error.code === 'ENOENT' || error instanceof SyntaxError)) return [];
        throw error;
    }
}

function listDirNames(dirPath) {
    try {
        return fs.readdirSync(dirPath, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
    } catch (error) {
        if (error && error.code === 'ENOENT') return [];
        throw error;
    }
}

function readTextSafe(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error && (error.code === 'ENOENT' || error.code === 'EISDIR')) return null;
        throw error;
    }
}

const normalize = (text) => text.replace(/^﻿/, '').replace(/\r\n/g, '\n').trimEnd();

/**
 * True when the active SKILL.md matches a vault copy (raw, or with the tool's path placeholders
 * replaced the way older installers wrote it).
 */
function matchesVaultCopy(skillText, name, vaultDirs, replacements) {
    const active = normalize(skillText);
    for (const vaultDir of vaultDirs) {
        const vaultText = readTextSafe(path.join(vaultDir, name, SKILL_FILE));
        if (vaultText === null) continue;
        if (normalize(vaultText) === active) return true;
        if (replacements && normalize(applyReplacements(vaultText, replacements)) === active) return true;
    }
    return false;
}

/**
 * @param {{ skillsDir: string, coreSkillNames: Iterable<string>, vaultDirs: string[], backupDir: string,
 *   replacements?: Record<string,string>|null }} options
 * @returns {{ moved: string[], moves: Array<{ name: string, from: string, to: string }>, skipped: string[],
 *   backupDir: string }} skipped: kit-named skills left in place because their content differs
 */
function migrateLegacySkills({ skillsDir, coreSkillNames, vaultDirs, backupDir, replacements = null }) {
    const core = new Set(coreSkillNames);
    const vault = new Set(vaultDirs.flatMap((dir) => listDirNames(dir)));
    const moves = [];
    const skipped = [];
    for (const name of loadLegacySkillNames()) {
        if (core.has(name) || !vault.has(name)) continue;
        const dir = path.join(skillsDir, name);
        let stat;
        try {
            stat = fs.lstatSync(dir);
        } catch (error) {
            if (error && error.code === 'ENOENT') continue;
            throw error;
        }
        if (!stat.isDirectory()) continue;
        const skillText = readTextSafe(path.join(dir, SKILL_FILE));
        if (skillText === null) continue;
        if (!matchesVaultCopy(skillText, name, vaultDirs, replacements)) {
            skipped.push(name);
            continue;
        }
        let target = path.join(backupDir, name);
        if (fs.existsSync(target)) target = `${target}-${Date.now()}`;
        moveDir(dir, target);
        moves.push({ name, from: dir, to: target });
    }
    return { moved: moves.map((m) => m.name), moves, skipped, backupDir };
}

module.exports = { LEGACY_DATA_FILE, loadLegacySkillNames, migrateLegacySkills };
