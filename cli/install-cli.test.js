'use strict';

/**
 * End-to-end tests of the installer CLI. Every run uses a copied kit (with a tiny fake
 * skills_library) and a sandboxed HOME / USERPROFILE / APPDATA / LOCALAPPDATA / XDG_CONFIG_HOME.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURE_DIRS = ['cli', 'agents', 'commands', 'rules', 'documents', 'matrix-skills', 'skills', 'platforms', 'scripts'];
const FIXTURE_FILES = ['README.md', 'SKILL.md', 'AGENT.md', 'CLAUDE.md', 'COPILOT.md', 'package.json'];
const PACKAGE_VERSION = require('../package.json').version;
const CLI_TIMEOUT_MS = 240000;

const tempDir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));
const read = (file) => fs.readFileSync(file, 'utf8');
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function buildFixtureKit() {
  const kitRoot = tempDir('boomopen-kit-');
  for (const dir of FIXTURE_DIRS) {
    const src = path.join(REPO_ROOT, dir);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(kitRoot, dir), { recursive: true, filter: (s) => !/__pycache__/.test(s) });
  }
  for (const file of FIXTURE_FILES) {
    if (fs.existsSync(path.join(REPO_ROOT, file))) fs.copyFileSync(path.join(REPO_ROOT, file), path.join(kitRoot, file));
  }
  return kitRoot;
}

function runCli(kitRoot, home, args) {
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    APPDATA: path.join(home, 'AppData', 'Roaming'),
    LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: path.join(home, '.config'),
  };
  const result = spawnSync(process.execPath, [path.join(kitRoot, 'cli', 'install.js'), ...args], {
    env,
    encoding: 'utf8',
    input: '',
    timeout: CLI_TIMEOUT_MS,
  });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function withSandbox(fn) {
  const kitRoot = buildFixtureKit();
  const home = tempDir('boomopen-home-');
  try {
    return fn(kitRoot, home);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(kitRoot, { recursive: true, force: true });
  }
}

test('CLI flags, exit codes and machine-readable output', () => {
  withSandbox((kitRoot, home) => {
    const version = runCli(kitRoot, home, ['--version']);
    assert.equal(version.status, 0);
    assert.equal(version.stdout.trim(), PACKAGE_VERSION);
    assert.equal(runCli(kitRoot, home, ['-v']).stdout.trim(), PACKAGE_VERSION);

    const help = runCli(kitRoot, home, ['--help']);
    assert.equal(help.status, 0);
    assert.match(help.stdout, /git clone https:\/\/github\.com\/Kennyboom\/BoomOpen-Workflow-Kit-Pro\.git/);
    assert.match(help.stdout, /boomopen <command>/);
    assert.doesNotMatch(help.stdout, /npx|npm install -g/);

    for (const args of [['frobnicate'], ['install', 'bogus-tool'], ['uninstall'], ['uninstall', 'bogus-tool'], ['install']]) {
      assert.equal(runCli(kitRoot, home, args).status, 1, `boomopen ${args.join(' ')} must fail`);
    }
    for (const args of [['install', 'claude', '--with-hook'], ['uninstall', '--all', '--dry-run'], ['install', 'claude', 'cursor'], ['install', 'claude', '--as-plugin']]) {
      assert.equal(runCli(kitRoot, home, args).status, 2, `boomopen ${args.join(' ')} must reject invalid options with exit 2`);
    }
    assert.equal(fs.existsSync(path.join(home, '.claude')), false, 'a non-interactive or rejected `install` writes nothing');

    const settings = runCli(kitRoot, home, ['settings', 'get', '--json']);
    assert.equal(settings.status, 0, settings.stderr);
    assert.doesNotThrow(() => JSON.parse(settings.stdout), 'settings get --json prints pure JSON (no banner)');
    assert.equal(runCli(kitRoot, home, ['settings', 'show']).status, 0, 'settings show aliases status');
    assert.equal(runCli(kitRoot, home, ['settings', 'set', 'no.such.key', 'x']).status, 1);

    // Pre-command flags (e.g. boomopen -p settings ...) must be preserved and forwarded to subcommands
    const preFlag = spawnSync(process.execPath, [path.join(kitRoot, 'cli', 'install.js'), '-p', 'settings', 'set', 'execution.mode', 'team'], {
      cwd: home,
      env: { ...process.env, HOME: home, USERPROFILE: home, APPDATA: path.join(home, 'AppData', 'Roaming'), LOCALAPPDATA: path.join(home, 'AppData', 'Local'), XDG_CONFIG_HOME: path.join(home, '.config') },
      encoding: 'utf8',
    });
    assert.equal(preFlag.status, 0, preFlag.stderr);
    assert.ok(fs.existsSync(path.join(home, '.boomopen.json')), '-p before settings writes workspace .boomopen.json');
    assert.equal(fs.existsSync(path.join(home, '.boomopen', 'settings.json')), false, '-p before settings does not write global');
    fs.rmSync(path.join(home, '.boomopen.json'), { force: true });

    const notInstalled = runCli(kitRoot, home, ['uninstall', 'cursor']);
    assert.equal(notInstalled.status, 0);
    assert.match(notInstalled.stdout, /Not installed/);
  });
});

test('install failures give a non-zero exit code', () => {
  withSandbox((kitRoot, home) => {
    write(path.join(home, '.codex'), 'a file where the .codex folder should be');
    const result = runCli(kitRoot, home, ['install', 'codex']);
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stdout, /Completed with errors/);
  });
});

test('claude: install, upgrade and uninstall keep user files and leave nothing of the kit behind', { timeout: 900000 }, () => {
  withSandbox((kitRoot, home) => {
    // Kit fixture: a tiny vault with dotfiles and literal placeholders, plus a legacy skill name
    const [legacyName] = require(path.join(kitRoot, 'cli', 'data', 'legacy-bundled-skills.json')).skills;
    write(path.join(kitRoot, 'skills_library', 'demo-vault', 'SKILL.md'), 'Docs mention `{TOOL}` literally.\n');
    write(path.join(kitRoot, 'skills_library', 'demo-vault', '.env.example'), 'TOKEN=\n');
    write(path.join(kitRoot, 'skills_library', legacyName, 'SKILL.md'), 'vault copy\n');
    const indexPath = path.join(kitRoot, 'matrix-skills', 'compact-index.json');
    const indexHash = sha(indexPath);

    // User state before the first install
    const claude = path.join(home, '.claude');
    write(path.join(claude, 'CLAUDE.md'), '# My Claude rules\nalways use pnpm\n');
    write(path.join(claude, 'skills', 'frontend-design', 'SKILL.md'), 'USER-OWNED copy\n');
    write(path.join(claude, 'skills', legacyName, 'SKILL.md'), 'stale v1 bundled copy\n');
    write(path.join(claude, 'commands', 'my-command.md'), 'mine\n');
    write(path.join(claude, 'settings.json'), JSON.stringify({ model: 'opus' }, null, 2) + '\n');

    const first = runCli(kitRoot, home, ['install', 'claude', '--with-hooks']);
    assert.equal(first.status, 0, first.stdout + first.stderr);
    assert.equal(sha(indexPath), indexHash, 'install never writes into the kit folder');

    const framework = path.join(claude, 'skills', 'boomopen-workflow-kit');
    assert.ok(fs.readdirSync(path.join(framework, 'scripts')).some((f) => f.endsWith('.py')), 'Python helpers installed');
    assert.ok(fs.existsSync(path.join(framework, 'hooks', 'validate-tool-call.mjs')), 'guard hook installed');
    assert.ok(fs.existsSync(path.join(framework, 'hooks', 'stop-quality-gate.mjs')), 'stop quality gate hook installed');
    assert.ok(fs.existsSync(path.join(framework, 'commands', '_ref')), '_ref kept inside framework commands/');
    assert.ok(fs.existsSync(path.join(framework, 'agents', 'teams')), 'teams kept inside framework agents/');
    assert.equal(fs.existsSync(path.join(claude, 'commands', '_ref')), false, '_ref skipped in IDE commands picker');
    assert.equal(fs.existsSync(path.join(claude, 'agents', 'teams')), false, 'teams skipped in IDE agents picker');
    assert.ok(fs.existsSync(path.join(claude, 'commands', 'plan', 'hard.md')), 'Claude colon command /plan:hard generated');
    assert.ok(fs.existsSync(path.join(claude, 'commands', 'cook', 'team.md')), 'Claude colon command /cook:team generated');
    assert.ok(fs.existsSync(path.join(claude, 'commands', 'audit', 'fix.md')), 'Claude colon command /audit:fix generated');
    assert.match(read(path.join(claude, 'commands', 'deploy-production.md')), /disable-model-invocation: true/);
    assert.match(read(path.join(claude, 'commands', 'deploy-rollback.md')), /disable-model-invocation: true/);
    assert.doesNotMatch(read(path.join(claude, 'commands', 'plan-hard.md')), /<appDataDir>[\\/]+brain[\\/]+<conversation-id>/);
    const installedCli = fs.readdirSync(path.join(framework, 'cli'));
    assert.ok(installedCli.includes('install.js'), 'CLI installed');
    assert.deepEqual(installedCli.filter((f) => /\.test(?:-helper)?\.js$/.test(f)), [], 'test-only files are not installed');
    assert.match(read(path.join(claude, 'settings.json')), /Bash\|PowerShell/, 'Bash|PowerShell matcher registered');
    assert.match(read(path.join(claude, 'settings.json')), /stop-quality-gate\.mjs/, 'Stop & PreCompact hook registered');
    assert.ok(fs.existsSync(path.join(claude, 'skills_library', 'demo-vault', '.env.example')), 'dotfiles ship');
    assert.match(read(path.join(claude, 'skills_library', 'demo-vault', 'SKILL.md')), /\{TOOL\}/, 'vendored text is verbatim');
    // No earlier kit install exists, so a skill that merely shares a legacy kit name is the user's
    // (the pre-manifest upgrade path is covered in install-regressions.test.js).
    assert.equal(read(path.join(claude, 'skills', legacyName, 'SKILL.md')), 'stale v1 bundled copy\n', 'fresh install keeps same-named skill');
    assert.notEqual(read(path.join(claude, 'skills', 'frontend-design', 'SKILL.md')), 'USER-OWNED copy\n');
    assert.ok(read(path.join(claude, 'CLAUDE.md')).startsWith('# My Claude rules'));

    // Kit upgrade: one command dropped, the user edited another kit command
    const commands = fs.readdirSync(path.join(kitRoot, 'commands')).filter((f) => f.endsWith('.md')).sort();
    const [dropped, edited] = commands;
    fs.rmSync(path.join(kitRoot, 'commands', dropped));
    fs.appendFileSync(path.join(claude, 'commands', edited), '\nmy local tweak\n');
    fs.appendFileSync(path.join(claude, 'CLAUDE.md'), '\n- memory added later\n');

    const second = runCli(kitRoot, home, ['install', 'claude']);
    assert.equal(second.status, 0, second.stdout + second.stderr);
    assert.equal(fs.existsSync(path.join(claude, 'commands', dropped)), false, 'stale kit file pruned');
    assert.match(read(path.join(claude, 'CLAUDE.md')), /memory added later/, 'user additions survive reinstall');
    assert.match(second.stdout, /Backups:/, 'the edited kit command was backed up before overwrite');
    assert.match(read(path.join(claude, 'settings.json')), /validate-tool-call\.mjs/, 'reinstall keeps an opted-in hook');

    const removed = runCli(kitRoot, home, ['uninstall', 'claude']);
    assert.equal(removed.status, 0, removed.stdout + removed.stderr);
    assert.equal(read(path.join(claude, 'skills', 'frontend-design', 'SKILL.md')), 'USER-OWNED copy\n', 'user skill restored');
    assert.equal(read(path.join(claude, 'commands', 'my-command.md')), 'mine\n');
    assert.equal(read(path.join(claude, 'skills', legacyName, 'SKILL.md')), 'stale v1 bundled copy\n');
    assert.equal(read(path.join(claude, 'settings.json')), JSON.stringify({ model: 'opus' }, null, 2) + '\n');
    assert.match(read(path.join(claude, 'CLAUDE.md')), /always use pnpm[\s\S]*memory added later/);
    assert.doesNotMatch(read(path.join(claude, 'CLAUDE.md')), /boomopen-workflow-kit-START/);
    for (const gone of ['skills_library', 'AGENT.md', path.join('skills', 'boomopen-workflow-kit'), path.join('commands', edited)]) {
      assert.equal(fs.existsSync(path.join(claude, gone)), false, `${gone} must be removed`);
    }
    assert.equal(fs.existsSync(path.join(home, '.boomopen', 'manifests', 'claude.json')), false);
  });
});

test('settings --project writes to the caller folder only for `npm run settings` from the kit (M62)', () => {
  withSandbox((kitRoot, home) => {
    const caller = path.join(home, 'my-project');
    const other = path.join(home, 'elsewhere');
    fs.mkdirSync(caller, { recursive: true });
    fs.mkdirSync(other, { recursive: true });
    const run = (cwd, extraEnv) => spawnSync(
      process.execPath,
      [path.join(kitRoot, 'cli', 'install.js'), 'settings', 'set', 'execution.mode', 'mode_b', '--project'],
      {
        cwd,
        encoding: 'utf8',
        input: '',
        timeout: CLI_TIMEOUT_MS,
        env: {
          ...process.env,
          HOME: home,
          USERPROFILE: home,
          APPDATA: path.join(home, 'AppData', 'Roaming'),
          LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
          XDG_CONFIG_HOME: path.join(home, '.config'),
          ...extraEnv,
        },
      }
    );
    // An inherited INIT_CWD (e.g. from `npm test`) is ignored when the CLI runs from another folder.
    const inherited = run(other, { INIT_CWD: caller, npm_lifecycle_event: 'test' });
    assert.equal(inherited.status, 0, inherited.stderr);
    assert.ok(fs.existsSync(path.join(other, '.boomopen.json')));
    assert.equal(fs.existsSync(path.join(caller, '.boomopen.json')), false);
    // `npm --prefix <kit> run settings -- ... --project` runs in the kit folder: INIT_CWD wins.
    const viaNpm = run(kitRoot, { INIT_CWD: caller, npm_lifecycle_event: 'settings' });
    assert.equal(viaNpm.status, 0, viaNpm.stderr);
    assert.ok(fs.existsSync(path.join(caller, '.boomopen.json')));
    assert.equal(fs.existsSync(path.join(kitRoot, '.boomopen.json')), false);
  });
});

test('antigravity --as-plugin, copilot .agent.md + copilot-instructions.md, and cursor --with-hooks work end-to-end', { timeout: 600000 }, () => {
  withSandbox((kitRoot, home) => {
    // Malformed legacy ~/.gemini/config/skills.json without "entries" array is removed on Antigravity install
    write(path.join(home, '.gemini', 'config', 'skills.json'), '{"legacy":true}\n');
    const agPlugin = runCli(kitRoot, home, ['install', 'antigravity', '--as-plugin']);
    assert.equal(agPlugin.status, 0, agPlugin.stdout + agPlugin.stderr);
    assert.equal(fs.existsSync(path.join(home, '.gemini', 'config', 'skills.json')), false, 'malformed legacy skills.json removed');
    assert.equal(fs.existsSync(path.join(home, '.antigravity')), false, 'dead ~/.antigravity folder never created');
    assert.equal(fs.existsSync(path.join(home, '.gemini', 'config', 'global_workflows')), false, 'deprecated global_workflows never created');

    const pluginDir = path.join(home, '.gemini', 'config', 'plugins', 'boomopen-workflow-kit');
    assert.ok(fs.existsSync(path.join(pluginDir, 'plugin.json')));
    assert.ok(fs.existsSync(path.join(pluginDir, 'rules', 'AGENTS.md')));
    assert.ok(fs.existsSync(path.join(pluginDir, 'hooks.json')));
    assert.ok(fs.existsSync(path.join(pluginDir, 'agents', 'debugger.md')));
    assert.equal(fs.existsSync(path.join(pluginDir, 'agents', 'teams')), false);
    assert.equal(runCli(kitRoot, home, ['uninstall', 'antigravity']).status, 0);
    assert.equal(fs.existsSync(pluginDir), false);

    // Copilot installs copilot-instructions.md + COPILOT.md and <stem>.agent.md without string-array handoffs
    assert.equal(runCli(kitRoot, home, ['install', 'copilot']).status, 0);
    assert.ok(fs.existsSync(path.join(home, '.copilot', 'copilot-instructions.md')));
    assert.ok(fs.existsSync(path.join(home, '.copilot', 'COPILOT.md')));
    assert.ok(fs.existsSync(path.join(home, '.copilot', 'agents', 'backend-engineer.agent.md')));
    assert.doesNotMatch(read(path.join(home, '.copilot', 'agents', 'backend-engineer.agent.md')), /^handoffs:/m);
    assert.equal(runCli(kitRoot, home, ['uninstall', 'copilot']).status, 0);

    // Cursor --with-hooks writes ~/.cursor/hooks.json beforeShellExecution and uninstalls cleanly
    assert.equal(runCli(kitRoot, home, ['install', 'cursor', '--with-hooks']).status, 0);
    assert.match(read(path.join(home, '.cursor', 'hooks.json')), /beforeShellExecution/);
    assert.equal(runCli(kitRoot, home, ['uninstall', 'cursor']).status, 0);
    assert.equal(fs.existsSync(path.join(home, '.cursor', 'hooks.json')), false);
  });
});
