const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  BACKUP_SUFFIX,
  CODEX_MARKER_START,
  stripMarkedBlock,
  isKitOwnedText,
  backupUserFile,
  restoreOrRemoveUserFile,
  removeMirroredFiles,
  stripCodexManagedConfig,
} = require('./user-files.js');
const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./settings.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURE_DIRS = ['cli', 'agents', 'commands', 'rules', 'documents', 'matrix-skills', 'skills', 'platforms'];
const FIXTURE_FILES = ['README.md', 'SKILL.md', 'AGENT.md', 'CLAUDE.md', 'COPILOT.md', 'package.json'];

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

test('stripMarkedBlock keeps text around the block and returns empty when only the block exists', () => {
  const kept = stripMarkedBlock('# Mine\n\n<!-- S -->\nkit\n<!-- E -->\n\nmore\n', '<!-- S -->', '<!-- E -->');
  assert.equal(kept.found, true);
  assert.equal(kept.text, '# Mine\n\nmore\n');

  const empty = stripMarkedBlock('<!-- S -->\nkit\n<!-- E -->\n', '<!-- S -->', '<!-- E -->');
  assert.deepEqual(empty, { text: '', found: true });

  const untouched = stripMarkedBlock('no markers\n', '<!-- S -->', '<!-- E -->');
  assert.deepEqual(untouched, { text: 'no markers\n', found: false });
});

test('isKitOwnedText ignores an injected settings block when deciding ownership', () => {
  assert.equal(isKitOwnedText('# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5)\n'), true);
  assert.equal(isKitOwnedText('---\nname: BoomOpen Workflow Kit Orchestrator\n---\n'), true);
  assert.equal(isKitOwnedText('```chatagent\n---\nname: BoomOpen Workflow Kit\n'), true);
  assert.equal(
    isKitOwnedText('# Notes\nread ~/.claude/skills/boomopen-workflow-kit/SKILL.md\n'),
    false,
    'a mention of the kit is not ownership'
  );
  assert.equal(isKitOwnedText('# My personal rules\n'), false);
  const userWithSettings = `# My rules\n\n${SETTINGS_MARKER_START}\nboomopen-workflow-kit\n${SETTINGS_MARKER_END}\n`;
  assert.equal(isKitOwnedText(userWithSettings), false);
});

test('backupUserFile keeps a byte-exact copy of user files, skips kit files and rotates old backups', () => {
  const dir = tempDir('boomopen-backup-');
  try {
    const userFile = path.join(dir, 'CLAUDE.md');
    write(userFile, '# My rules\r\nkeep me\r\n');
    const backupPath = backupUserFile(userFile);
    assert.equal(backupPath, userFile + BACKUP_SUFFIX);
    assert.equal(read(backupPath), '# My rules\r\nkeep me\r\n');

    write(userFile, '# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5)\n');
    assert.equal(backupUserFile(userFile), null, 'kit-owned file must not be backed up');

    write(userFile, '# My rewritten rules\n');
    backupUserFile(userFile);
    assert.equal(read(backupPath), '# My rewritten rules\n');
    const rotated = fs.readdirSync(dir).filter((name) => name.startsWith(`CLAUDE.md${BACKUP_SUFFIX}-`));
    assert.equal(rotated.length, 1, 'older backup must be rotated, not overwritten');
    assert.equal(read(path.join(dir, rotated[0])), '# My rules\r\nkeep me\r\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('restoreOrRemoveUserFile restores the backup and keeps files the user rewrote', () => {
  const dir = tempDir('boomopen-restore-');
  try {
    const file = path.join(dir, 'AGENTS.md');
    write(file + BACKUP_SUFFIX, 'original user content\n');
    write(file, '# AGENTS.md — BoomOpen Workflow Kit\n');
    assert.deepEqual(restoreOrRemoveUserFile(file), { removed: true, restored: true, kept: false });
    assert.equal(read(file), 'original user content\n');
    assert.equal(fs.existsSync(file + BACKUP_SUFFIX), false);

    assert.deepEqual(restoreOrRemoveUserFile(file), { removed: false, restored: false, kept: true });
    assert.equal(read(file), 'original user content\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('removeMirroredFiles removes only kit files and prunes only empty kit folders', () => {
  const dir = tempDir('boomopen-mirror-');
  try {
    const src = path.join(dir, 'src');
    const dest = path.join(dir, 'dest');
    write(path.join(src, 'cook.md'), 'kit');
    write(path.join(src, 'teams', 'qa', 'lead.md'), 'kit');
    write(path.join(src, 'teams', 'db', 'lead.md'), 'kit');
    write(path.join(dest, 'cook.md'), 'kit copy');
    write(path.join(dest, 'teams', 'qa', 'lead.md'), 'kit copy');
    write(path.join(dest, 'teams', 'db', 'lead.md'), 'kit copy');
    write(path.join(dest, 'teams', 'db', 'my-notes.md'), 'user');
    write(path.join(dest, 'my-command.md'), 'user');
    write(path.join(dest, 'my-folder', 'flow.md'), 'user');

    const removed = removeMirroredFiles(src, dest);
    assert.ok(removed.length >= 4);
    assert.equal(fs.existsSync(path.join(dest, 'cook.md')), false);
    assert.equal(fs.existsSync(path.join(dest, 'teams', 'qa')), false, 'empty kit folder is pruned');
    assert.equal(read(path.join(dest, 'teams', 'db', 'my-notes.md')), 'user');
    assert.equal(read(path.join(dest, 'my-command.md')), 'user');
    assert.equal(read(path.join(dest, 'my-folder', 'flow.md')), 'user');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('stripCodexManagedConfig restores user keys and drops kit-only keys', () => {
  const managed = `${CODEX_MARKER_START}\n[agents.planner]\nconfig_file = "agents/planner.toml"\n# === boomopen-workflow-kit END ===\n`;
  const ours = 'project_doc_fallback_filenames = ["AGENT.md", "CODEX.md", "AGENTS.md", ".agents.md"]';
  const original = 'model = "o3"\nproject_doc_fallback_filenames = ["MINE.md"]\n\n[features]\nweb_search = true\n';
  const installed = `model = "o3"\n${ours}\n\n[features]\nmulti_agent = true\nweb_search = true\n\n${managed}`;
  assert.equal(stripCodexManagedConfig(installed, original), original);

  const commented = 'model = "o3"\nproject_doc_fallback_filenames = ["MINE.md"] # my docs\n\n[features]\nweb_search = true\n';
  const commentedInstalled = `model = "o3"\n${ours} # my docs\n\n[features]\nmulti_agent = true\nweb_search = true\n\n${managed}`;
  assert.equal(stripCodexManagedConfig(commentedInstalled, commented), commented, 'trailing comment must not break restore');

  const noBackup = stripCodexManagedConfig(`${ours}\n\n${managed}`, null);
  assert.equal(noBackup, '');
});

// ---------------------------------------------------------------------------
// End-to-end: real install + uninstall in a sandboxed HOME (no skills_library copy)
// ---------------------------------------------------------------------------

function buildFixtureKit() {
  const kitRoot = tempDir('boomopen-kit-');
  for (const dir of FIXTURE_DIRS) {
    fs.cpSync(path.join(REPO_ROOT, dir), path.join(kitRoot, dir), { recursive: true });
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
    timeout: 120000,
  });
  assert.equal(result.status, 0, `boomopen ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

const USER_FILES = {
  '.claude/CLAUDE.md': '# My Claude rules\nalways use pnpm\n',
  '.claude/commands/my-command.md': 'user command',
  '.claude/agents/my-agent.md': 'user agent',
  '.codex/AGENTS.md': '# My Codex rules\n',
  '.codex/agents/mine.toml': 'model = "o3"\n',
  '.codex/config.toml':
    'model = "o3"\nproject_doc_fallback_filenames = ["MINE.md"] # my docs\n\n[features]\nweb_search = true\n\n[profiles.fast]\nmodel = "o4-mini"\n',
  '.cursor/AGENT.md': '# My notes\nfor big tasks read ~/.cursor/skills/boomopen-workflow-kit/SKILL.md\n',
  '.gemini/GEMINI.md': '# My Gemini rules\n',
  '.gemini/AGENT.md': '# My agent notes\n',
  '.gemini/agents/my-agent.md': 'user agent',
  '.antigravity/workflows/team/flow.md': 'user workflow in a subfolder',
  '.gemini/config/global_workflows/mine/flow.md': 'user workflow in a subfolder',
  '.gemini/antigravity/global_workflows/my-flow.md': 'user global workflow',
  '.cursor/CLAUDE.md': '# My Cursor CLAUDE\n',
  '.cursor/commands/my-command.md': 'user command',
  '.cursor/agents/my-agent.md': 'user agent',
  '.copilot/COPILOT.md': '# My Copilot rules\n',
  '.copilot/commands/my-command.md': 'user command',
};

test('install then uninstall on all 5 platforms never loses user files (sandboxed HOME)', { timeout: 300000 }, () => {
  const kitRoot = buildFixtureKit();
  const home = tempDir('boomopen-home-');
  try {
    for (const [rel, content] of Object.entries(USER_FILES)) write(path.join(home, rel), content);
    const kitCommand = fs.readdirSync(path.join(kitRoot, 'commands')).find((name) => name.endsWith('.md'));

    for (const tool of ['claude', 'codex', 'antigravity', 'cursor', 'copilot']) {
      runCli(kitRoot, home, ['install', tool]);
    }

    // After install: kit content is in place, user originals are backed up, nothing was deleted
    assert.match(read(path.join(home, '.claude', 'CLAUDE.md')), /boomopen-workflow-kit/);
    assert.equal(read(path.join(home, '.claude', `CLAUDE.md${BACKUP_SUFFIX}`)), USER_FILES['.claude/CLAUDE.md']);
    assert.equal(read(path.join(home, '.codex', `AGENTS.md${BACKUP_SUFFIX}`)), USER_FILES['.codex/AGENTS.md']);
    assert.ok(fs.existsSync(path.join(home, '.claude', 'commands', kitCommand)));
    assert.match(read(path.join(home, '.codex', 'config.toml')), /boomopen-workflow-kit START/);
    for (const rel of Object.keys(USER_FILES).filter((r) => !/(CLAUDE|AGENTS|AGENT|COPILOT)\.md$|config\.toml$|GEMINI\.md$/.test(r))) {
      assert.equal(read(path.join(home, rel)), USER_FILES[rel], `install must not delete ${rel}`);
    }

    for (const tool of ['claude', 'codex', 'antigravity', 'cursor', 'copilot']) {
      runCli(kitRoot, home, ['uninstall', tool]);
    }

    // After uninstall: every user file is back byte-for-byte, kit files are gone
    for (const [rel, content] of Object.entries(USER_FILES)) {
      assert.equal(read(path.join(home, rel)), content, `uninstall must restore ${rel}`);
    }
    assert.equal(fs.existsSync(path.join(home, '.claude', 'commands', kitCommand)), false);
    assert.equal(fs.existsSync(path.join(home, '.codex', 'agents', 'planner.toml')), false);
    assert.equal(fs.existsSync(path.join(home, '.claude', 'skills', 'boomopen-workflow-kit')), false);
  } finally {
    fs.rmSync(home, { recursive: true, force: true });
    fs.rmSync(kitRoot, { recursive: true, force: true });
  }
});
