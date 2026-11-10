'use strict';

/**
 * Unit tests for the installer's ownership rules: instruction-file blocks, the install manifest,
 * Claude Code hook registration and the legacy-skill migration. All work in temp folders.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { installInstructionFile, uninstallInstructionFile, KIT_BLOCK_START } = require('./instruction-files.js');
const { InstallLedger, uninstallFromManifest, manifestPath, backupRoot } = require('./manifest.js');
const { registerClaudeHook, unregisterClaudeHook, HookConfigError } = require('./hook-registration.js');
const { migrateLegacySkills, loadLegacySkillNames } = require('./legacy-skills.js');
const { BACKUP_SUFFIX } = require('./user-files.js');
const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./markers.js');

const KIT_TEXT = `# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5)\n\n${SETTINGS_MARKER_START}\nsettings\n${SETTINGS_MARKER_END}\n\nkit rules\n`;

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-safety-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
const read = (file) => fs.readFileSync(file, 'utf8');

// ---------------------------------------------------------------------------
// Instruction files
// ---------------------------------------------------------------------------

test('instruction file: user text survives install, reinstall and later additions; uninstall restores it', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'CLAUDE.md');
    const original = '# My rules\r\nalways use pnpm\r\n';
    write(file, original);

    assert.equal(installInstructionFile(file, KIT_TEXT).action, 'merged');
    assert.equal(read(file + BACKUP_SUFFIX), original, 'pristine backup');
    assert.ok(read(file).startsWith('# My rules'), 'user text stays first');
    assert.equal(installInstructionFile(file, KIT_TEXT).action, 'unchanged', 'reinstall is idempotent');

    // e.g. Claude Code "#" memory appended at the end of the file
    fs.appendFileSync(file, '\n- remember: deploy on Fridays\n');
    assert.equal(installInstructionFile(file, KIT_TEXT.replace('kit rules', 'kit rules v2')).action, 'updated');
    assert.match(read(file), /remember: deploy on Fridays/);
    assert.match(read(file), /kit rules v2/);

    assert.equal(uninstallInstructionFile(file).action, 'stripped');
    const after = read(file);
    assert.ok(!after.includes(KIT_BLOCK_START) && !after.includes(SETTINGS_MARKER_START));
    assert.match(after, /always use pnpm/);
    assert.match(after, /remember: deploy on Fridays/);
  });
});

test('instruction file: untouched user file is restored byte-for-byte; kit-only file is deleted', () => {
  withTempDir((dir) => {
    const userFile = path.join(dir, 'AGENTS.md');
    write(userFile, '# Mine\n');
    installInstructionFile(userFile, KIT_TEXT);
    assert.equal(uninstallInstructionFile(userFile).action, 'restored');
    assert.equal(read(userFile), '# Mine\n');
    assert.equal(fs.existsSync(userFile + BACKUP_SUFFIX), false);

    const kitOnly = path.join(dir, 'CODEX.md');
    installInstructionFile(kitOnly, KIT_TEXT);
    assert.equal(uninstallInstructionFile(kitOnly).action, 'removed');
    assert.equal(fs.existsSync(kitOnly), false);

    const foreign = path.join(dir, 'COPILOT.md');
    write(foreign, '# not ours\n');
    assert.equal(uninstallInstructionFile(foreign).action, 'kept');
  });
});

test('instruction file: an unmarked kit copy is replaced in place, never appended twice (GEMINI.md)', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'GEMINI.md');
    const gemini = '# ⚡ BoomOpen Workflow Kit v5.5 — GEMINI/ANTIGRAVITY SMART-HYBRID EDITION\n\nrules\n';
    write(file, gemini);
    assert.equal(installInstructionFile(file, gemini).action, 'replaced-legacy');
    assert.equal(read(file).split('BoomOpen Workflow Kit v5.5').length - 1, 1);
    assert.equal(fs.readdirSync(dir).filter((n) => n.includes(BACKUP_SUFFIX)).length, 0, 'identical copy needs no backup');

    const legacy = path.join(dir, 'CLAUDE.md');
    write(legacy, `${KIT_TEXT}\n- my own addition\n`);
    write(legacy + BACKUP_SUFFIX, '# My original\n');
    installInstructionFile(legacy, KIT_TEXT);
    assert.ok(read(legacy).startsWith('# My original'), 'pre-kit original is merged back in');
    assert.equal(fs.readdirSync(dir).filter((n) => n.startsWith(`CLAUDE.md${BACKUP_SUFFIX}-`)).length, 1, 'modified legacy copy saved');
  });
});

// ---------------------------------------------------------------------------
// Manifest
// ---------------------------------------------------------------------------

test('manifest: backs up same-named user files, prunes stale kit files and uninstalls only unmodified ones', () => {
  withTempDir((home) => {
    const ledgerFor = () => new InstallLedger({ homeDir: home, toolKey: 'claude', kitVersion: '1.0.0', userFilesRestorable: true });
    const skill = path.join(home, '.claude', 'skills', 'frontend-design', 'SKILL.md');
    const cmdA = path.join(home, '.claude', 'commands', 'a.md');
    const cmdB = path.join(home, '.claude', 'commands', 'b.md');
    write(skill, 'USER-OWNED copy\n');

    const first = ledgerFor();
    first.writeFile(skill, Buffer.from('kit skill v1\n'));
    first.writeFile(cmdA, Buffer.from('kit a v1\n'));
    first.writeFile(cmdB, Buffer.from('kit b v1\n'));
    first.save();
    assert.equal(first.backedUp.length, 1, 'the user skill was backed up');
    assert.equal(read(first.backedUp[0]), 'USER-OWNED copy\n');

    // Upgrade: b.md is dropped by the kit, a.md was edited by the user
    write(cmdA, 'kit a v1\nmy tweak\n');
    const second = ledgerFor();
    second.writeFile(skill, Buffer.from('kit skill v2\n'));
    second.writeFile(cmdA, Buffer.from('kit a v2\n'));
    const pruned = second.pruneStale();
    second.save();
    assert.deepEqual(pruned.removed, [cmdB], 'unmodified stale kit file removed');
    assert.equal(second.backedUp.length, 1, "the user's edit to a.md was backed up before overwrite");
    assert.equal(read(second.backedUp[0]), 'kit a v1\nmy tweak\n');

    write(cmdA, 'kit a v2\nedited after install\n');
    const result = uninstallFromManifest(home, 'claude');
    assert.deepEqual(result.kept, [cmdA], 'modified kit file is kept');
    assert.equal(read(skill), 'USER-OWNED copy\n', "the user's original skill is restored");
    assert.equal(fs.existsSync(manifestPath(home, 'claude')), false);
    assert.equal(fs.existsSync(path.join(home, '.claude', 'commands', 'b.md')), false);
  });
});

test('manifest: a corrupt manifest stops the install instead of guessing ownership', () => {
  withTempDir((home) => {
    write(manifestPath(home, 'codex'), '{ not json');
    assert.throws(
      () => new InstallLedger({ homeDir: home, toolKey: 'codex', kitVersion: '1', userFilesRestorable: true }),
      /corrupt/
    );
  });
});

// ---------------------------------------------------------------------------
// Claude Code hook registration
// ---------------------------------------------------------------------------

test('hook registration keeps other settings/hooks and is reversible', () => {
  withTempDir((dir) => {
    const settingsPath = path.join(dir, 'settings.json');
    const original = JSON.stringify({ model: 'opus', hooks: { PreToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'lint' }] }] } }, null, 2) + '\n';
    write(settingsPath, original);
    const script = path.join(dir, '.claude', 'skills', 'boomopen-workflow-kit', 'hooks', 'validate-tool-call.mjs');

    assert.equal(registerClaudeHook(settingsPath, script), 'added');
    assert.equal(registerClaudeHook(settingsPath, script), 'unchanged');
    const data = JSON.parse(read(settingsPath));
    assert.equal(data.model, 'opus');
    assert.equal(data.hooks.PreToolUse.length, 2);
    assert.equal(data.hooks.PreToolUse[1].matcher, 'Bash');
    assert.match(data.hooks.PreToolUse[1].hooks[0].command, /validate-tool-call\.mjs"$/);

    assert.equal(unregisterClaudeHook(settingsPath), 'removed');
    assert.equal(read(settingsPath), original, 'byte-exact restore');
    assert.equal(unregisterClaudeHook(settingsPath), 'missing');
  });
});

test('hook registration never rewrites an invalid settings.json; a file it created is removed again', () => {
  withTempDir((dir) => {
    const broken = path.join(dir, 'broken.json');
    write(broken, '{ "model": ');
    assert.throws(() => registerClaudeHook(broken, '/x/boomopen-workflow-kit/hooks/validate-tool-call.mjs'), HookConfigError);
    assert.equal(read(broken), '{ "model": ');

    const fresh = path.join(dir, 'fresh.json');
    registerClaudeHook(fresh, '/x/boomopen-workflow-kit/hooks/validate-tool-call.mjs');
    unregisterClaudeHook(fresh);
    assert.equal(fs.existsSync(fresh), false);
  });
});

// ---------------------------------------------------------------------------
// Legacy skills
// ---------------------------------------------------------------------------

test('legacy migration moves only unmodified pre-split kit skills that the vault now provides', () => {
  withTempDir((home) => {
    const [legacyName, notInVault, sameNameUserSkill] = loadLegacySkillNames();
    assert.ok(legacyName && notInVault && sameNameUserSkill, 'legacy skill list is bundled');
    const skills = path.join(home, '.claude', 'skills');
    const vault = path.join(home, 'vault');
    write(path.join(skills, legacyName, 'SKILL.md'), 'old kit copy\r\n');
    write(path.join(skills, notInVault, 'SKILL.md'), 'kept: no vault copy');
    write(path.join(skills, sameNameUserSkill, 'SKILL.md'), 'MY OWN SKILL');
    write(path.join(skills, 'my-own-skill', 'SKILL.md'), 'user');
    write(path.join(vault, legacyName, 'SKILL.md'), 'old kit copy\n');
    write(path.join(vault, sameNameUserSkill, 'SKILL.md'), 'the kit version');
    const backupDir = path.join(backupRoot(home, 'claude'), 'legacy-skills');

    const { moved, moves, skipped } = migrateLegacySkills({ skillsDir: skills, coreSkillNames: [], vaultDirs: [vault], backupDir });
    assert.deepEqual(moved, [legacyName]);
    assert.deepEqual(moves, [{ name: legacyName, from: path.join(skills, legacyName), to: path.join(backupDir, legacyName) }]);
    assert.deepEqual(skipped, [sameNameUserSkill], "a same-named skill with other content is the user's");
    assert.equal(read(path.join(backupDir, legacyName, 'SKILL.md')), 'old kit copy\r\n', 'moved, never deleted');
    assert.equal(read(path.join(skills, sameNameUserSkill, 'SKILL.md')), 'MY OWN SKILL');
    assert.ok(fs.existsSync(path.join(skills, notInVault, 'SKILL.md')));
    assert.ok(fs.existsSync(path.join(skills, 'my-own-skill', 'SKILL.md')));
  });
});
