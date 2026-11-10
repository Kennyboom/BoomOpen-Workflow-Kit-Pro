const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURE_DIRS = ['cli', 'agents', 'commands', 'rules', 'documents', 'matrix-skills', 'skills', 'platforms'];
const FIXTURE_FILES = ['README.md', 'SKILL.md', 'AGENT.md', 'CLAUDE.md', 'COPILOT.md', 'package.json'];
const CLI_TIMEOUT_MS = 180000;

const tempDir = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));
const read = (filePath) => fs.readFileSync(filePath, 'utf8');

/** Copy of the kit without skills_library, so installs stay fast. */
function buildFixtureKit() {
  const kitRoot = tempDir('boomopen-settings-kit-');
  for (const dir of FIXTURE_DIRS) fs.cpSync(path.join(REPO_ROOT, dir), path.join(kitRoot, dir), { recursive: true });
  for (const file of FIXTURE_FILES) {
    if (fs.existsSync(path.join(REPO_ROOT, file))) fs.copyFileSync(path.join(REPO_ROOT, file), path.join(kitRoot, file));
  }
  return kitRoot;
}

function sandboxEnv(home) {
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    APPDATA: path.join(home, 'AppData', 'Roaming'),
    LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: path.join(home, '.config'),
  };
}

function runCli(kitRoot, home, cwd, args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, 'cli', 'install.js'), ...args], {
    env: sandboxEnv(home),
    cwd,
    encoding: 'utf8',
    timeout: CLI_TIMEOUT_MS,
  });
  assert.equal(result.status, expectedStatus, `boomopen ${args.join(' ')}:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function vsCodePromptsFile(home) {
  const env = sandboxEnv(home);
  const base =
    process.platform === 'win32'
      ? path.join(env.APPDATA, 'Code', 'User', 'prompts')
      : process.platform === 'darwin'
        ? path.join(home, 'Library', 'Application Support', 'Code', 'User', 'prompts')
        : path.join(env.XDG_CONFIG_HOME, 'Code', 'User', 'prompts');
  return path.join(base, 'boomopen-workflow-kit.agent.md');
}

test('every installed file with a settings block is synced; user files and other tools are not (H9/H10)', { timeout: 600000 }, () => {
  const kitRoot = buildFixtureKit();
  const home = tempDir('boomopen-settings-home-');
  const cwd = tempDir('boomopen-settings-cwd-');
  try {
    const userClaude = path.join(home, '.claude', 'CLAUDE.md');
    const userGemini = path.join(home, '.gemini', 'GEMINI.md');
    fs.mkdirSync(path.dirname(userClaude), { recursive: true });
    fs.mkdirSync(path.dirname(userGemini), { recursive: true });
    fs.writeFileSync(userClaude, '# My Claude rules\n\n---\n\nmine\n');
    fs.writeFileSync(userGemini, '# My Gemini rules\n');

    runCli(kitRoot, home, cwd, ['install', 'copilot']);
    runCli(kitRoot, home, cwd, ['install', 'cursor']);
    runCli(kitRoot, home, cwd, ['settings', 'set', 'execution.mode', 'team']);

    const synced = [
      vsCodePromptsFile(home),
      path.join(home, '.copilot', 'COPILOT.md'),
      path.join(home, '.copilot', 'AGENT.md'),
      path.join(home, '.cursor', 'CURSOR.md'),
      path.join(home, '.cursor', 'AGENT.md'),
      path.join(home, '.cursor', 'rules', 'boomopen-workflow-kit.mdc'),
    ];
    for (const file of synced) {
      assert.match(read(file), /\*\*Execution Mode \(`execution.mode`\)\*\*: `team`/, `${file} must be synced`);
    }
    assert.equal(read(userClaude), '# My Claude rules\n\n---\n\nmine\n', 'tools without the kit are untouched');
    assert.equal(read(userGemini), '# My Gemini rules\n');
    assert.equal(fs.existsSync(path.join(home, '.vscode-prompts')), false);

    // Workspace overrides never leak into the global entry files.
    runCli(kitRoot, home, cwd, ['settings', 'set', 'execution.mode', 'mode_b', '--project']);
    runCli(kitRoot, home, cwd, ['settings', 'status']);
    assert.match(read(path.join(home, '.cursor', 'CURSOR.md')), /`execution.mode`\)\*\*: `team`/);
    assert.match(runCli(kitRoot, home, cwd, ['settings', 'get', 'execution.mode']), /mode_b/);

    runCli(kitRoot, home, cwd, ['settings', 'bogus'], 1);

    // Files the sync rewrote are still the kit's: uninstall removes them (install manifest updated).
    runCli(kitRoot, home, cwd, ['uninstall', 'copilot']);
    runCli(kitRoot, home, cwd, ['uninstall', 'cursor']);
    for (const file of [vsCodePromptsFile(home), path.join(home, '.cursor', 'rules', 'boomopen-workflow-kit.mdc')]) {
      assert.equal(fs.existsSync(file), false, `${file} must be removed by uninstall after a settings sync`);
    }
  } finally {
    for (const dir of [home, cwd, kitRoot]) fs.rmSync(dir, { recursive: true, force: true });
  }
});
