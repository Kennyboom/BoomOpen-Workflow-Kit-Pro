/**
 * End-to-end regressions for the install/uninstall/doctor repairs (sandboxed HOME, fixture kit
 * without skills_library):
 *  - Codex: a user's own agents/<role>.toml is never overwritten (kit roles live in agents/boomopen/);
 *  - Codex: an edited kit block in config.toml is backed up before a reinstall resets it;
 *  - doctor: a partly installed platform is checked (not "not installed"), and doctor run from an
 *    installed copy notices a deleted rules/ folder;
 *  - upgrade of a pre-manifest install: folders the old release created are pruned on uninstall.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { tempDir, removeDir, sandboxEnv, buildFixtureKit, runCli } = require('./sandbox.test-helper.js');

const E2E_TIMEOUT_MS = 600000;
const USER_REVIEWER = 'developer_instructions = "MY OWN reviewer prompt"\n';
const USER_CODEX_CONFIG = '[agents.reviewer]\ndescription = "mine"\nconfig_file = "agents/reviewer.toml"\n';

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const write = (filePath, text) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
};

function cli(kitRoot, home, args) {
  const result = runCli(kitRoot, home, args);
  return { ...result, out: `${result.stdout}\n${result.stderr}` };
}

function withSandbox(t) {
  const kitRoot = buildFixtureKit();
  const home = tempDir('boomopen-home-');
  t.after(() => {
    removeDir(home);
    removeDir(kitRoot);
  });
  return { kitRoot, home };
}

test('Codex: the user\'s own agent role file is never overwritten; edited kit blocks are backed up', { timeout: E2E_TIMEOUT_MS }, (t) => {
  const { kitRoot, home } = withSandbox(t);
  const codex = path.join(home, '.codex');
  write(path.join(codex, 'config.toml'), USER_CODEX_CONFIG);
  write(path.join(codex, 'agents', 'reviewer.toml'), USER_REVIEWER);

  const install = cli(kitRoot, home, ['install', 'codex']);
  assert.equal(install.status, 0, install.out);
  assert.match(install.out, /kept your own agent roles: reviewer/);
  assert.equal(read(path.join(codex, 'agents', 'reviewer.toml')), USER_REVIEWER, 'user role file untouched');
  assert.match(read(path.join(codex, 'agents', 'boomopen', 'planner.toml')), /developer_instructions/);
  assert.match(read(path.join(codex, 'config.toml')), /config_file = "agents\/boomopen\/planner\.toml"/);

  const configPath = path.join(codex, 'config.toml');
  write(configPath, read(configPath).replace('agents/boomopen/planner.toml', 'agents/my-planner.toml'));
  const reinstall = cli(kitRoot, home, ['install', 'codex']);
  assert.equal(reinstall.status, 0, reinstall.out);
  const editedCopies = fs.readdirSync(codex).filter((name) => name.startsWith('config.toml.boomopen-backup-'));
  assert.equal(editedCopies.length, 1, reinstall.out);
  assert.match(read(path.join(codex, editedCopies[0])), /agents\/my-planner\.toml/);

  const uninstall = cli(kitRoot, home, ['uninstall', 'codex']);
  assert.equal(uninstall.status, 0, uninstall.out);
  assert.equal(read(path.join(codex, 'agents', 'reviewer.toml')), USER_REVIEWER);
  assert.equal(fs.existsSync(path.join(codex, 'agents', 'boomopen')), false, 'kit role folder removed');
  assert.equal(read(configPath), USER_CODEX_CONFIG, 'config.toml restored');
});

test('doctor checks a partly installed platform and an installed copy that lost rules/', { timeout: E2E_TIMEOUT_MS }, (t) => {
  const { kitRoot, home } = withSandbox(t);
  for (const tool of ['claude', 'codex']) assert.equal(cli(kitRoot, home, ['install', tool]).status, 0);

  const codexFramework = path.join(home, '.codex', 'skills', 'boomopen-workflow-kit');
  fs.rmSync(codexFramework, { recursive: true, force: true });
  const partial = cli(kitRoot, home, ['doctor', '--platform', 'codex']);
  assert.equal(partial.status, 1, partial.out);
  assert.match(partial.out, /Codex: framework files\s+Missing: framework folder/);
  assert.match(cli(kitRoot, home, ['list']).out, /codex\s+Codex\s+⚠️ {2}Partly installed/);

  // The documented form: doctor run from the installed copy itself.
  const claudeFramework = path.join(home, '.claude', 'skills', 'boomopen-workflow-kit');
  const installedCli = path.join(claudeFramework, 'cli', 'install.js');
  const healthy = spawnSync(process.execPath, [installedCli, 'doctor', '--platform', 'claude'], {
    env: { ...process.env, ...sandboxEnv(home) },
    encoding: 'utf8',
  });
  assert.match(healthy.stdout, /✅ Claude Code: framework files/, healthy.stdout);
  fs.rmSync(path.join(claudeFramework, 'rules'), { recursive: true, force: true });
  const broken = spawnSync(process.execPath, [installedCli, 'doctor', '--platform', 'claude'], {
    env: { ...process.env, ...sandboxEnv(home) },
    encoding: 'utf8',
  });
  assert.equal(broken.status, 1, broken.stdout);
  assert.match(broken.stdout, /❌ Claude Code: framework files\s+Missing: .*rules\//);
});

test('upgrading a pre-manifest install: old kit folders are pruned on uninstall', { timeout: E2E_TIMEOUT_MS }, (t) => {
  const { kitRoot, home } = withSandbox(t);
  assert.equal(cli(kitRoot, home, ['install', 'claude']).status, 0);
  const commands = path.join(home, '.claude', 'commands');
  assert.ok(fs.existsSync(path.join(commands, '_ref')));
  // Simulate an install made by a release that kept no manifest, plus a user edit to a kit file.
  fs.rmSync(path.join(home, '.boomopen', 'manifests', 'claude.json'));
  write(path.join(commands, 'cook.md'), '# my own cook\n');

  const upgrade = cli(kitRoot, home, ['install', 'claude']);
  assert.equal(upgrade.status, 0, upgrade.out);
  assert.match(upgrade.out, /previous kit copies \(including any you edited\)/);

  const uninstall = cli(kitRoot, home, ['uninstall', 'claude']);
  assert.equal(uninstall.status, 0, uninstall.out);
  assert.equal(fs.existsSync(path.join(commands, '_ref')), false, 'empty kit sub-folders are pruned');
  assert.equal(fs.existsSync(path.join(home, '.claude', 'agents', 'teams')), false);
});
