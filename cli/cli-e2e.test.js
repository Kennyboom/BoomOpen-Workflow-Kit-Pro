/**
 * End-to-end CLI tests: argument handling, the Codex config.toml merge, and the Claude Code hook
 * registration, each run through `node cli/install.js` in a sandboxed HOME with a fixture kit.
 *
 * Related end-to-end coverage lives elsewhere: user-files.test.js (user files survive install and
 * uninstall on all 5 platforms), settings-e2e.test.js (settings sync), doctor.test.js (doctor on
 * an installed home) and hook-guard.test.js (the hook's command corpus and exit codes).
 */
const test = require('node:test');
const { before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseSubcommandArgs, splitCommaOption } = require('./cli-args.js');
const {
  REPO_ROOT,
  tempDir,
  removeDir,
  buildFixtureKit,
  runCli,
  listFiles,
} = require('./sandbox.test-helper.js');

const E2E_TIMEOUT_MS = 600000;
const KIT_DIR_NAME = 'boomopen-workflow-kit';
const HOOK_SCRIPT_NAME = 'validate-tool-call.mjs';
const UNPUBLISHED_INSTALL_HINTS = ['npx boomopen-workflow-kit', 'npm install -g @boomopen/workflow-kit'];

const USER_CODEX_CONFIG = [
  '[mcp_servers.docs]',
  'command = "docs-server"',
  '',
  '[agents]',
  'max_threads = 4',
  '',
  '[features]',
  'web_search = true',
  '',
].join('\n');

const USER_CLAUDE_SETTINGS = {
  model: 'opus',
  hooks: {
    PreToolUse: [{ matcher: 'Edit', hooks: [{ type: 'command', command: 'echo my-own-hook' }] }],
  },
};

const read = (filePath) => fs.readFileSync(filePath, 'utf8');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function expectStatus(result, expected, label) {
  assert.equal(result.status, expected, `${label}\n--- stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}`);
}

/**
 * Table headers of a TOML document (`[a.b]`, not `[[array]]`), skipping multi-line strings.
 * @param {string} text
 * @returns {{ headers: string[], firstHeaderLine: number, lines: string[] }}
 */
function scanTomlHeaders(text) {
  const lines = text.split(/\r?\n/);
  const headers = [];
  let firstHeaderLine = -1;
  let openDelimiter = null;
  lines.forEach((line, index) => {
    if (openDelimiter) {
      if (line.includes(openDelimiter)) openDelimiter = null;
      return;
    }
    const header = line.match(/^\s*\[([^[\]]+)\]\s*(?:#.*)?$/);
    if (header) {
      headers.push(header[1].replace(/\s+/g, ''));
      if (firstHeaderLine === -1) firstHeaderLine = index;
    }
    const delimiters = line.match(/"""|'''/g) || [];
    if (delimiters.length % 2 === 1) openDelimiter = delimiters[0];
  });
  return { headers, firstHeaderLine, lines };
}

/** The installer registers the hook unless SECURITY.md documents it as opt-in/not registered. */
function securityDocSaysHookIsNotRegistered() {
  const text = read(path.join(REPO_ROOT, 'SECURITY.md'));
  return /installer does \*{0,2}not\*{0,2} (?:copy or )?register/i.test(text);
}

function kitHookEntries(settings) {
  const groups = (settings.hooks && settings.hooks.PreToolUse) || [];
  return groups.flatMap((group) => group.hooks || []).filter((hook) => String(hook.command).includes(HOOK_SCRIPT_NAME));
}

let kitRoot = null;
before(() => {
  kitRoot = buildFixtureKit();
});
after(() => removeDir(kitRoot));

// ---------------------------------------------------------------------------
// Argument handling
// ---------------------------------------------------------------------------

test('help shows the real command name and never an unpublished npm package', () => {
  const home = tempDir('boomopen-args-');
  try {
    const help = runCli(kitRoot, home, ['help']);
    expectStatus(help, 0, 'boomopen help');
    assert.match(help.stdout, /boomopen|node cli\/install\.js/);
    for (const hint of UNPUBLISHED_INSTALL_HINTS) {
      assert.ok(!help.stdout.includes(hint), `help must not advertise "${hint}"`);
    }
  } finally {
    removeDir(home);
  }
});

test('unknown tools, unknown commands and a missing uninstall target exit non-zero and write nothing', () => {
  const home = tempDir('boomopen-args-');
  try {
    const cases = [
      ['install', 'bogus-tool'],
      ['uninstall', 'bogus-tool'],
      ['uninstall'],
      ['frobnicate'],
    ];
    for (const args of cases) {
      const result = runCli(kitRoot, home, args);
      assert.notEqual(result.status, 0, `boomopen ${args.join(' ')} must fail:\n${result.stdout}\n${result.stderr}`);
    }
    const written = listFiles(home).map((f) => path.relative(home, f));
    assert.deepEqual(written, [], 'a rejected command must not create files in the profile');
  } finally {
    removeDir(home);
  }
});

// ---------------------------------------------------------------------------
// Codex config.toml merge and Claude Code hook registration (install, then uninstall)
// ---------------------------------------------------------------------------

test('install codex + claude keeps config.toml valid and user settings intact; uninstall restores both', { timeout: E2E_TIMEOUT_MS }, () => {
  const home = tempDir('boomopen-e2e-home-');
  const configPath = path.join(home, '.codex', 'config.toml');
  const claudeSettingsPath = path.join(home, '.claude', 'settings.json');
  const userClaudeSettings = `${JSON.stringify(USER_CLAUDE_SETTINGS, null, 2)}\n`;
  try {
    write(configPath, USER_CODEX_CONFIG);
    write(claudeSettingsPath, userClaudeSettings);

    for (const tool of ['codex', 'claude']) {
      expectStatus(runCli(kitRoot, home, ['install', tool]), 0, `install ${tool}`);
    }

    // config.toml: no table declared twice, user values kept, top-level keys never land in a table.
    const merged = read(configPath);
    const { headers, firstHeaderLine, lines } = scanTomlHeaders(merged);
    const duplicates = headers.filter((h, i) => headers.indexOf(h) !== i);
    assert.deepEqual(duplicates, [], `duplicate TOML tables after install:\n${merged}`);
    for (const userLine of ['command = "docs-server"', 'max_threads = 4', 'web_search = true']) {
      assert.ok(merged.includes(userLine), `install dropped the user's "${userLine}"`);
    }
    const fallbackLine = lines.findIndex((line) => /^\s*project_doc_fallback_filenames\s*=/.test(line));
    if (fallbackLine !== -1) {
      assert.ok(fallbackLine < firstHeaderLine, 'project_doc_fallback_filenames must be a top-level key, not inside a table');
    }
    assert.ok(merged.includes('boomopen-workflow-kit'), 'the kit block is present');

    // Claude Code hook: registered (with the script installed) unless SECURITY.md says it is opt-in.
    const claudeSettings = JSON.parse(read(claudeSettingsPath));
    assert.equal(claudeSettings.model, 'opus', 'user settings.json keys are kept');
    assert.ok(
      JSON.stringify(claudeSettings).includes('echo my-own-hook'),
      'the user\'s own hooks are kept'
    );
    const kitHooks = kitHookEntries(claudeSettings);
    if (securityDocSaysHookIsNotRegistered()) {
      assert.equal(kitHooks.length, 0, 'SECURITY.md says the hook is opt-in, so install must not register it');
    } else {
      assert.equal(kitHooks.length, 1, 'install registers exactly one destructive-command guard hook');
      const scriptPath = listFiles(path.join(home, '.claude')).find((f) => path.basename(f) === HOOK_SCRIPT_NAME);
      assert.ok(scriptPath, 'the hook script is installed under ~/.claude');
      const blocked = spawnSync(process.execPath, [scriptPath], {
        input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }),
        encoding: 'utf8',
      });
      assert.notEqual(blocked.status, 0, 'the installed hook blocks rm -rf /');
    }

    for (const tool of ['codex', 'claude']) {
      expectStatus(runCli(kitRoot, home, ['uninstall', tool]), 0, `uninstall ${tool}`);
    }

    assert.equal(read(configPath), USER_CODEX_CONFIG, 'uninstall restores config.toml byte-for-byte');
    assert.deepEqual(JSON.parse(read(claudeSettingsPath)), USER_CLAUDE_SETTINGS, 'uninstall restores settings.json');
    const leftovers = listFiles(home)
      .map((f) => path.relative(home, f))
      .filter((rel) => rel.split(path.sep).some((part) => part === KIT_DIR_NAME || part === 'skills_library'));
    assert.deepEqual(leftovers.slice(0, 10), [], 'uninstall leaves no kit framework or vault files behind');
  } finally {
    removeDir(home);
  }
});

test('parseSubcommandArgs comma-joins repeatable list flags while scalar flags use last-value-wins', () => {
  const listFlags = ['docs', 'owned-files', 'read-only-files', 'read-only', 'engines', 'checks', 'tags', 'files', 'targets', 'domains', 'skills'];
  const scalarFlags = ['out', 'plan', 'round', 'prompt', 'phase', 'role', 'engine', 'preset', 'scope', 'dir', 'cwd', 'max-rounds', 'passed-tests'];
  const valueFlags = {};
  for (const name of [...listFlags, ...scalarFlags]) valueFlags[`--${name}`] = name;

  const argv = [];
  for (const name of listFlags) argv.push(`--${name}`, `${name}-1`, `--${name}`, `${name}-2`);
  for (const name of scalarFlags) argv.push(`--${name}`, `${name}-old`, `--${name}`, `${name}-new`);

  const parsed = parseSubcommandArgs(argv, { valueFlags });
  assert.equal(parsed.error, null);
  for (const name of listFlags) {
    assert.deepEqual(splitCommaOption(parsed.flags[name]), [`${name}-1`, `${name}-2`], `Expected list flag --${name} to comma-join`);
  }
  for (const name of scalarFlags) {
    assert.equal(parsed.flags[name], `${name}-new`, `Expected scalar flag --${name} to use last-value-wins`);
  }
});
