'use strict';

/**
 * Regressions from the November 2026 code audit, all run in sandboxed profiles (HOME, USERPROFILE,
 * APPDATA, LOCALAPPDATA and XDG_CONFIG_HOME under os.tmpdir()):
 *  - a first install never moves the user's own skills; a pre-manifest upgrade moves only unmodified
 *    kit copies and uninstall puts them back;
 *  - uninstall never deletes user text in instruction files (edited legacy copies, damaged blocks);
 *  - the installed CLI copy works (check, settings, -v) and refuses install/uninstall;
 *  - a BOM settings.json does not fail uninstall; uninstall leaves no empty tool folders;
 *  - `list` reports a corrupt manifest; doctor counts only the kit block of merged files;
 *  - symlinked files keep their link.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT, tempDir, removeDir, buildFixtureKit, runCli, listFiles } = require('./sandbox.test-helper.js');
const { installInstructionFile, uninstallInstructionFile, KIT_BLOCK_START, KIT_BLOCK_END } = require('./instruction-files.js');
const { InstallLedger, uninstallFromManifest, manifestPath, loadManifest } = require('./manifest.js');
const { loadLegacySkillNames } = require('./legacy-skills.js');
const { checkInstalledPlatforms } = require('./doctor-platforms.js');

const KIT_VERSION = require('../package.json').version;
const LEGACY_SKILL = 'systematic-debugging';
const VAULT_SKILL_TEXT = '# systematic-debugging\n\nkit vault copy\n';
const KIT_TEXT = '# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5)\n\nkit rules\n';
const USER_MARKER = 'USER-SECRET-MARKER-1';

const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
const read = (file) => fs.readFileSync(file, 'utf8');

/** Run fn(kit, home) with a fixture kit that has a one-skill vault, and clean both up. */
function withSandbox(fn) {
  const kit = buildFixtureKit();
  const home = tempDir('boomopen-reg-home-');
  try {
    write(path.join(kit, 'skills_library', LEGACY_SKILL, 'SKILL.md'), VAULT_SKILL_TEXT);
    return fn(kit, home);
  } finally {
    removeDir(kit);
    removeDir(home);
  }
}

function withTemp(fn) {
  const dir = tempDir('boomopen-reg-');
  try {
    return fn(dir);
  } finally {
    removeDir(dir);
  }
}

const ok = (result, label) => assert.equal(result.status, 0, `${label}\n${result.stdout}\n${result.stderr}`);

/** Every folder below root (deepest last). */
function listDirs(root, out = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    out.push(path.join(root, entry.name));
    listDirs(path.join(root, entry.name), out);
  }
  return out;
}

/** True when the file system lets this process create file symlinks (Windows needs a privilege). */
function canSymlink(dir) {
  try {
    write(path.join(dir, 'probe-target'), 'x');
    fs.symlinkSync(path.join(dir, 'probe-target'), path.join(dir, 'probe-link'), 'file');
    return true;
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) return false;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Legacy skill migration
// ---------------------------------------------------------------------------

test('first install never moves a user skill that shares a legacy kit name', () => {
  assert.ok(loadLegacySkillNames().includes(LEGACY_SKILL));
  withSandbox((kit, home) => {
    const userSkill = path.join(home, '.claude', 'skills', LEGACY_SKILL, 'SKILL.md');
    write(userSkill, 'MY OWN SKILL');
    const install = runCli(kit, home, ['install', 'claude']);
    ok(install, 'install');
    assert.doesNotMatch(install.stdout, /Legacy:\s+moved/);
    assert.equal(read(userSkill), 'MY OWN SKILL');
    ok(runCli(kit, home, ['uninstall', 'claude']), 'uninstall');
    assert.equal(read(userSkill), 'MY OWN SKILL');
  });
});

test('pre-manifest upgrade moves only unmodified kit skills and uninstall moves them back', () => {
  withSandbox((kit, home) => {
    const skills = path.join(home, '.claude', 'skills');
    write(path.join(skills, 'boomopen-workflow-kit', 'SKILL.md'), 'old kit install without a manifest');
    write(path.join(skills, LEGACY_SKILL, 'SKILL.md'), VAULT_SKILL_TEXT.replace(/\n/g, '\r\n'));

    const install = runCli(kit, home, ['install', 'claude']);
    ok(install, 'install');
    assert.match(install.stdout, /Legacy:\s+moved 1 unmodified/);
    assert.equal(fs.existsSync(path.join(skills, LEGACY_SKILL)), false, 'stale kit copy left the active folder');
    const manifest = loadManifest(home, 'claude');
    assert.ok(manifest.legacyMoves['.claude/skills/systematic-debugging'], 'the move is recorded');

    ok(runCli(kit, home, ['uninstall', 'claude']), 'uninstall');
    assert.equal(read(path.join(skills, LEGACY_SKILL, 'SKILL.md')), VAULT_SKILL_TEXT.replace(/\n/g, '\r\n'));
  });
});

// ---------------------------------------------------------------------------
// Instruction files
// ---------------------------------------------------------------------------

test('uninstall saves an edited unmarked kit copy before removing it; a pristine copy needs no copy', () => {
  withTemp((dir) => {
    const edited = path.join(dir, 'edited', 'CLAUDE.md');
    write(edited, `${KIT_TEXT}\n## MY PERSONAL RULES - ${USER_MARKER}\n`);
    const result = uninstallInstructionFile(edited, { kitTexts: [KIT_TEXT] });
    assert.equal(result.action, 'removed');
    assert.ok(result.savedCopy && read(result.savedCopy).includes(USER_MARKER), 'user text is saved');

    const pristine = path.join(dir, 'pristine', 'CLAUDE.md');
    write(pristine, KIT_TEXT.replace(/\n/g, '\r\n'));
    const clean = uninstallInstructionFile(pristine, { kitTexts: [KIT_TEXT] });
    assert.equal(clean.action, 'removed');
    assert.equal(clean.savedCopy, undefined);
    assert.deepEqual(fs.readdirSync(path.dirname(pristine)), []);
  });
});

test('uninstall never deletes a file with a damaged kit block (lone START or lost END marker)', () => {
  withTemp((dir) => {
    const lone = path.join(dir, 'lone', 'CLAUDE.md');
    write(lone, `${KIT_BLOCK_START}\nMy own notes USER-SECRET-3\n`);
    const loneResult = uninstallInstructionFile(lone, { kitTexts: [KIT_TEXT] });
    assert.equal(loneResult.action, 'damaged');
    assert.equal(read(lone), 'My own notes USER-SECRET-3\n');
    assert.ok(read(loneResult.savedCopy).includes(KIT_BLOCK_START));

    const lostEnd = path.join(dir, 'lost-end', 'CLAUDE.md');
    fs.mkdirSync(path.dirname(lostEnd), { recursive: true });
    installInstructionFile(lostEnd, KIT_TEXT);
    write(lostEnd, `${read(lostEnd).replace(KIT_BLOCK_END, '')}\n## My own notes\nIMPORTANT USER TEXT\n`);
    assert.equal(uninstallInstructionFile(lostEnd).action, 'damaged');
    assert.match(read(lostEnd), /IMPORTANT USER TEXT/);
    assert.ok(!read(lostEnd).includes(KIT_BLOCK_START));
  });
});

test('upgrade keeps user text appended to a legacy ~/.cursor/CLAUDE.md kit copy', () => {
  withSandbox((kit, home) => {
    const legacy = path.join(home, '.cursor', 'CLAUDE.md');
    write(legacy, `${read(path.join(REPO_ROOT, 'CLAUDE.md'))}\n## MY PERSONAL RULES - ${USER_MARKER}\n`);
    const install = runCli(kit, home, ['install', 'cursor']);
    ok(install, 'install');
    const holders = listFiles(home).filter((file) => read(file).includes(USER_MARKER));
    assert.ok(holders.length > 0, 'the user text still exists under HOME');
    assert.match(install.stdout, /Saved the previous CLAUDE\.md/);
  });
});

// ---------------------------------------------------------------------------
// Installed CLI copy
// ---------------------------------------------------------------------------

test('the installed CLI copy runs check/settings/-v and refuses install and uninstall', () => {
  withSandbox((kit, home) => {
    ok(runCli(kit, home, ['install', 'claude']), 'install');
    const framework = path.join(home, '.claude', 'skills', 'boomopen-workflow-kit');
    const project = path.join(home, 'project');
    write(path.join(project, 'index.js'), "'use strict';\n\nmodule.exports = 1;\n");

    const version = runCli(framework, home, ['-v']);
    ok(version, '-v');
    assert.equal(version.stdout.trim(), KIT_VERSION);
    ok(runCli(framework, home, ['check', project]), 'check');
    ok(runCli(framework, home, ['settings', 'status']), 'settings status');

    const before = listFiles(path.join(home, '.claude')).length;
    for (const command of ['install', 'uninstall']) {
      const refused = runCli(framework, home, [command, 'claude']);
      assert.equal(refused.status, 1, refused.stdout);
      assert.match(refused.stderr, /installed copy/);
    }
    assert.equal(listFiles(path.join(home, '.claude')).length, before, 'nothing was deleted');
  });
});

// ---------------------------------------------------------------------------
// Uninstall robustness
// ---------------------------------------------------------------------------

test('uninstall succeeds with a BOM settings.json the kit never touched', () => {
  withSandbox((kit, home) => {
    const settings = path.join(home, '.claude', 'settings.json');
    write(settings, '﻿{"model":"opus"}');
    ok(runCli(kit, home, ['install', 'claude']), 'install');
    ok(runCli(kit, home, ['uninstall', 'claude']), 'uninstall');
    assert.equal(read(settings), '﻿{"model":"opus"}');
  });
});

test('install --all then uninstall --all leaves no folders behind in an empty home', () => {
  withSandbox((kit, home) => {
    ok(runCli(kit, home, ['install', '--all']), 'install --all');
    ok(runCli(kit, home, ['uninstall', '--all']), 'uninstall --all');
    assert.deepEqual(listFiles(home), []);
    assert.deepEqual(listDirs(home), []);
  });
});

test('list reports a corrupt manifest and exits non-zero', () => {
  withSandbox((kit, home) => {
    ok(runCli(kit, home, ['install', 'claude']), 'install');
    write(manifestPath(home, 'claude'), '{bad');
    const list = runCli(kit, home, ['list']);
    assert.equal(list.status, 1);
    assert.match(list.stdout + list.stderr, /manifest unreadable/);
    assert.doesNotMatch(list.stdout, /no manifest \(pre-v5\.5 install\)/);
  });
});

test('doctor counts only the kit block of a merged CLAUDE.md, not the user text above it', () => {
  withTemp((home) => {
    const file = path.join(home, '.claude', 'CLAUDE.md');
    write(file, Array.from({ length: 250 }, (_, i) => `user line ${i}`).join('\n') + '\n');
    assert.equal(installInstructionFile(file, KIT_TEXT).action, 'merged');
    fs.mkdirSync(path.join(home, '.claude', 'skills', 'boomopen-workflow-kit'), { recursive: true });
    const { checks } = checkInstalledPlatforms({ homeDir: home, platforms: ['claude'], env: {} });
    const entry = checks.find((check) => /entry files/.test(check.name));
    assert.ok(entry && /CLAUDE\.md/.test(entry.detail));
    assert.doesNotMatch(entry.detail, /kit content \d+ lines/);
  });
});

// ---------------------------------------------------------------------------
// Symlinks (skipped where the OS does not allow creating them)
// ---------------------------------------------------------------------------

test('symlinked shared and instruction files keep their link and get the user content back', (t) => {
  withTemp((home) => {
    if (!canSymlink(home)) {
      t.skip('file symlinks are not permitted for this account');
      return;
    }
    const dotfiles = path.join(home, 'dotfiles');
    const commandTarget = path.join(dotfiles, 'cook.md');
    const commandLink = path.join(home, '.claude', 'commands', 'cook.md');
    write(commandTarget, 'my cook');
    fs.mkdirSync(path.dirname(commandLink), { recursive: true });
    fs.symlinkSync(commandTarget, commandLink, 'file');

    const ledger = new InstallLedger({ homeDir: home, toolKey: 'claude', kitVersion: KIT_VERSION, userFilesRestorable: true });
    ledger.writeFile(commandLink, Buffer.from('kit cook'));
    ledger.save();
    uninstallFromManifest(home, 'claude');
    assert.ok(fs.lstatSync(commandLink).isSymbolicLink(), 'link kept');
    assert.equal(read(commandTarget), 'my cook');

    const mdTarget = path.join(dotfiles, 'CLAUDE.md');
    const mdLink = path.join(home, '.claude', 'CLAUDE.md');
    write(mdTarget, '# Mine\n');
    fs.symlinkSync(mdTarget, mdLink, 'file');
    installInstructionFile(mdLink, KIT_TEXT);
    assert.equal(uninstallInstructionFile(mdLink).action, 'restored');
    assert.ok(fs.lstatSync(mdLink).isSymbolicLink(), 'link kept');
    assert.equal(read(mdTarget), '# Mine\n');
  });
});
