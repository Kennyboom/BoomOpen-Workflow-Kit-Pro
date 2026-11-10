const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  SETTINGS_MARKER_START,
  SETTINGS_MARKER_END,
  DEFAULT_SETTINGS,
  PRESETS,
  loadSettings,
  saveSettings,
  setSettingByKey,
  applyPreset,
  resetSettings,
  renderActiveSettingsMarkdown,
  injectSettingsBlockIntoText,
  syncSettingsToInstalledPlatforms,
  runSettingsCommand,
} = require('./settings.js');
const { findSettingsBlock, getSyncTargets } = require('./settings-sync.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const KIT_HEADER = '# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5 test)\n\n';
const SHIPPED_ENTRY_FILES = [
  'AGENT.md',
  'CLAUDE.md',
  'CODEX.md',
  'COPILOT.md',
  'CURSOR.md',
  'GEMINI.md',
  'platforms/antigravity/AntigravityGlobal.agent.md',
  'platforms/antigravity/GEMINI.md',
  'platforms/claude/CLAUDE.md',
  'platforms/codex/CODEX.md',
  'platforms/copilot/boomopen-workflow-kit.agent.md',
  'platforms/cursor/.cursorrules',
  'platforms/cursor/rules/boomopen-workflow-kit.mdc',
];

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-settings-'));
  const homeDir = path.join(root, 'home');
  const cwd = path.join(root, 'workspace');
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(cwd, { recursive: true });
  return { root, homeDir, cwd, opts: { homeDir, cwd, sync: false }, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const kitFile = (settings = DEFAULT_SETTINGS) => `${KIT_HEADER}${renderActiveSettingsMarkdown(settings)}\n\n## Rules\n`;

test('every shipped settings block equals renderActiveSettingsMarkdown(DEFAULT_SETTINGS) (L14)', () => {
  const expected = renderActiveSettingsMarkdown(DEFAULT_SETTINGS);
  assert.equal(DEFAULT_SETTINGS.execution.swarmScaling, 'elastic');
  assert.equal(DEFAULT_SETTINGS.execution.maxParallelSubagents, 8);
  assert.equal(PRESETS['solo-fast'].execution.swarmScaling, 'conservative');
  assert.equal(PRESETS['solo-fast'].execution.maxParallelSubagents, 3);
  assert.equal(PRESETS['deep-architect'].execution.swarmScaling, 'elastic');
  assert.equal(PRESETS['deep-architect'].execution.maxParallelSubagents, 12);
  assert.equal(PRESETS['adversarial-team'].execution.swarmScaling, 'hyper_swarm');
  assert.equal(PRESETS['adversarial-team'].execution.maxParallelSubagents, 12);
  for (const rel of SHIPPED_ENTRY_FILES) {
    const text = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
    const found = findSettingsBlock(text);
    assert.equal(found.state, 'ok', `${rel} must hold exactly one settings block`);
    assert.equal(text.slice(found.start, found.end), expected, `${rel} settings block drifted from the generator`);
  }
});

test('swarmScaling and maxParallelSubagents settings validate, coerce numeric strings, and sync to markdown', () => {
  const box = sandbox();
  try {
    const s1 = setSettingByKey('execution.swarmScaling', 'hyper_swarm', box.opts);
    assert.equal(s1.settings.execution.swarmScaling, 'hyper_swarm');
    const s2 = setSettingByKey('execution.maxParallelSubagents', '16', box.opts);
    assert.equal(s2.settings.execution.maxParallelSubagents, 16);
    const s3 = setSettingByKey('engines.researcher', 'council', box.opts);
    assert.equal(s3.settings.engines.researcher, 'council');
    const s4 = setSettingByKey('engines.reviewer', 'cross_family', box.opts);
    assert.equal(s4.settings.engines.reviewer, 'cross_family');
    assert.throws(() => setSettingByKey('execution.swarmScaling', 'invalid_scale', box.opts), /Invalid value/);
    assert.throws(() => setSettingByKey('execution.maxParallelSubagents', '99', box.opts), /Invalid value/);
    assert.throws(() => setSettingByKey('engines.coder', 'council', box.opts), /Invalid value/);
    const md = renderActiveSettingsMarkdown(s4.settings);
    assert.match(md, /\*\*Swarm Scaling \(`execution\.swarmScaling`\)\*\*: `hyper_swarm`/);
    assert.match(md, /\*\*Max Parallel Sub-agents \(`execution\.maxParallelSubagents`\)\*\*: `16`/);
    assert.match(md, /researcher=council/);
    assert.match(md, /reviewer=cross_family/);
    assert.match(md, /across all 17 languages/);
    for (const lang of ['auto', 'vi', 'en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ru', 'hi', 'ar', 'id', 'th', 'tr', 'it']) {
      const sLang = setSettingByKey('language.response', lang, box.opts);
      assert.equal(sLang.settings.language.response, lang);
    }
  } finally {
    box.cleanup();
  }
});

test('BOM, UTF-16 and broken JSON settings files are read or refused, never silently replaced (M16)', () => {
  const box = sandbox();
  try {
    const globalPath = path.join(box.homeDir, '.boomopen', 'settings.json');
    const json = JSON.stringify({ execution: { mode: 'mode_b' }, language: { response: 'ja' } });
    write(globalPath, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(json, 'utf8')]));
    assert.equal(loadSettings(box.opts).execution.mode, 'mode_b');
    write(globalPath, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(json, 'utf16le')]));
    assert.equal(loadSettings(box.opts).language.response, 'ja');

    const broken = '{ "execution": { "mode": "mode_b" }, }';
    write(globalPath, broken);
    assert.equal(loadSettings({ ...box.opts, silent: true }).execution.mode, 'auto');
    assert.throws(() => setSettingByKey('research.depth', 'standard', { ...box.opts, silent: true }), /Refusing to overwrite/);
    assert.equal(fs.readFileSync(globalPath, 'utf8'), broken, 'a broken file must be left untouched');

    const reset = resetSettings({ ...box.opts, silent: true });
    assert.equal(fs.readFileSync(reset.backupPath, 'utf8'), broken, 'reset keeps a .bak of the broken file');
    assert.equal(loadSettings(box.opts).execution.mode, 'auto');
  } finally {
    box.cleanup();
  }
});

test('project overrides are sparse, reset --project never wipes global, global sync ignores the workspace (M15/M17/M18)', () => {
  const box = sandbox();
  try {
    setSettingByKey('execution.mode', 'mode_b', box.opts);
    setSettingByKey('language.response', 'ja', box.opts);

    const noop = resetSettings({ ...box.opts, scope: 'project' });
    assert.equal(noop.noop, true);
    assert.equal(loadSettings({ ...box.opts, scope: 'global' }).execution.mode, 'mode_b', 'global must survive');

    setSettingByKey('research.depth', 'quick_brief', { ...box.opts, scope: 'project' });
    const projectRaw = JSON.parse(fs.readFileSync(path.join(box.cwd, '.boomopen.json'), 'utf8'));
    assert.deepEqual(projectRaw, { research: { depth: 'quick_brief' } });

    setSettingByKey('execution.mode', 'mode_a', box.opts);
    const effective = loadSettings(box.opts);
    assert.equal(effective.execution.mode, 'mode_a', 'later global changes reach the workspace');
    assert.equal(effective.research.depth, 'quick_brief');

    const claudeMd = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    write(claudeMd, kitFile());
    saveSettings({ 'execution.mode': 'team' }, { homeDir: box.homeDir, cwd: box.cwd, scope: 'project' });
    syncSettingsToInstalledPlatforms(null, { homeDir: box.homeDir, cwd: box.cwd });
    assert.match(fs.readFileSync(claudeMd, 'utf8'), /\*\*Execution Mode \(`execution.mode`\)\*\*: `mode_a`/);
  } finally {
    box.cleanup();
  }
});

test('custom line limits survive unrelated saves and invalid limits are rejected (L18)', () => {
  const box = sandbox();
  try {
    write(
      path.join(box.homeDir, '.boomopen', 'settings.json'),
      JSON.stringify({ codingStandards: { preset: 'pragmatic', softFileLines: 250, hardFileLines: 350 } })
    );
    setSettingByKey('language.response', 'en', box.opts);
    let cs = loadSettings(box.opts).codingStandards;
    assert.deepEqual([cs.softFileLines, cs.hardFileLines], [250, 350]);

    saveSettings({ codingStandards: { softFileLines: -5, hardFileLines: 1e308 } }, box.opts);
    saveSettings({ codingStandards: { softFileLines: 900 } }, box.opts);
    cs = loadSettings(box.opts).codingStandards;
    assert.deepEqual([cs.softFileLines, cs.hardFileLines], [250, 350]);

    setSettingByKey('codingStandards.preset', 'strict', box.opts);
    cs = loadSettings(box.opts).codingStandards;
    assert.deepEqual([cs.softFileLines, cs.hardFileLines], [300, 400]);
  } finally {
    box.cleanup();
  }
});

test('prototype-named keys/presets are rejected and preset labels follow the values (L16/L17)', async () => {
  const box = sandbox();
  try {
    for (const key of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      assert.throws(() => setSettingByKey(key, 'x', box.opts), /Unknown setting key/);
    }
    assert.throws(() => applyPreset('toString', box.opts), /Unknown preset/);
    const get = await runSettingsCommand(['get', 'constructor'], { ...box.opts, silent: true });
    assert.equal(get.action, 'error');

    const viaSet = setSettingByKey('preset', 'deep-architect', box.opts);
    assert.equal(viaSet.settings.execution.mode, 'mode_b', '`set preset` applies the whole preset');
    assert.equal(viaSet.settings.preset, 'deep-architect');

    const changed = saveSettings({ execution: { mode: 'mode_a' } }, box.opts);
    assert.equal(changed.settings.preset, 'custom');
    assert.equal(applyPreset('solo-fast', box.opts).settings.preset, 'solo-fast');
  } finally {
    box.cleanup();
  }
});

test('marker handling: one standalone pair only; damaged markers never lose text or grow the file (M21)', () => {
  const settings = PRESETS['adversarial-team'];
  const orphanStart = `${KIT_HEADER}${SETTINGS_MARKER_START}\nMY NOTE A\n\n## Rules\nMY NOTE B\n`;
  assert.equal(injectSettingsBlockIntoText(orphanStart, settings), orphanStart);
  const reversed = `${KIT_HEADER}${SETTINGS_MARKER_END}\nmiddle text\n${SETTINGS_MARKER_START}\n`;
  assert.equal(injectSettingsBlockIntoText(reversed, settings), reversed);
  const twoBlocks = `${KIT_HEADER}${renderActiveSettingsMarkdown()}\n\n${renderActiveSettingsMarkdown()}\n`;
  assert.equal(injectSettingsBlockIntoText(twoBlocks, settings), twoBlocks);

  const prose = `${KIT_HEADER}Mention: \`${SETTINGS_MARKER_START} ... ${SETTINGS_MARKER_END}\`\n\n${renderActiveSettingsMarkdown()}\n`;
  const updated = injectSettingsBlockIntoText(prose, settings);
  assert.ok(updated.startsWith(`${KIT_HEADER}Mention: \``), 'prose mentions are not treated as markers');
  assert.match(updated, /`adversarial-team`/);

  const fenced = '# Title\n\n```md\n---\n```\n\ntext\n\n---\n\n## Content\n';
  const inserted = injectSettingsBlockIntoText(fenced, settings);
  assert.ok(inserted.indexOf(SETTINGS_MARKER_START) > inserted.indexOf('```\n\ntext'), 'never insert inside a code fence');

  const crlf = kitFile().replace(/\n/g, '\r\n');
  assert.ok(!/[^\r]\n/.test(injectSettingsBlockIntoText(crlf, settings)), 'CRLF files stay CRLF');
});

test('sync touches only kit-owned files with a block, never inserts, and survives unwritable targets (H9/L19)', () => {
  const box = sandbox();
  try {
    const userClaude = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    const userGemini = path.join(box.homeDir, '.gemini', 'GEMINI.md');
    const kitNoBlock = path.join(box.homeDir, '.codex', 'CODEX.md');
    const brokenKit = path.join(box.homeDir, '.cursor', 'CURSOR.md');
    const dirTarget = path.join(box.homeDir, '.copilot', 'COPILOT.md');
    const goodKit = path.join(box.homeDir, '.copilot', 'AGENT.md');
    write(userClaude, '# My rules\n\n---\n\nmine\n');
    write(userGemini, `# My Gemini\n\n${renderActiveSettingsMarkdown()}\n`);
    write(kitNoBlock, `${KIT_HEADER}## Rules\n`);
    write(brokenKit, `${KIT_HEADER}${SETTINGS_MARKER_START}\nnote\n`);
    fs.mkdirSync(dirTarget, { recursive: true });
    write(goodKit, kitFile());

    const report = syncSettingsToInstalledPlatforms(PRESETS['deep-architect'], { homeDir: box.homeDir });
    assert.equal(fs.readFileSync(userClaude, 'utf8'), '# My rules\n\n---\n\nmine\n');
    assert.equal(fs.readFileSync(userGemini, 'utf8'), `# My Gemini\n\n${renderActiveSettingsMarkdown()}\n`);
    assert.equal(fs.readFileSync(kitNoBlock, 'utf8'), `${KIT_HEADER}## Rules\n`);
    assert.equal(fs.readFileSync(brokenKit, 'utf8'), `${KIT_HEADER}${SETTINGS_MARKER_START}\nnote\n`);
    assert.match(fs.readFileSync(goodKit, 'utf8'), /`deep-architect`/);
    assert.deepEqual(report.updatedFiles, [goodKit]);
    assert.ok(report.skippedFiles.some((s) => s.file === brokenKit && /damaged/.test(s.reason)));
    assert.ok(report.skippedFiles.some((s) => s.file === dirTarget));
    assert.equal(report.platforms.claude, false);
    assert.equal(report.installed.copilot, false);

    // A read-only target is reported; files after it in the list are still synced.
    const readOnly = path.join(box.homeDir, '.codex', 'AGENTS.md');
    const later = path.join(box.homeDir, '.cursor', 'AGENT.md');
    write(readOnly, kitFile());
    write(later, kitFile());
    fs.chmodSync(readOnly, 0o444);
    try {
      const second = syncSettingsToInstalledPlatforms(PRESETS['solo-fast'], { homeDir: box.homeDir });
      assert.ok(second.failedFiles.some((f) => f.file === readOnly));
      assert.match(fs.readFileSync(later, 'utf8'), /`solo-fast`/);
    } finally {
      fs.chmodSync(readOnly, 0o644);
    }
  } finally {
    box.cleanup();
  }
});

test('in a shared instruction file only the kit block is synced; the user text is never edited (H9/M21)', () => {
  const box = sandbox();
  try {
    const shared = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    const userPart = `# My rules\n\nStale copy from an old release:\n${renderActiveSettingsMarkdown()}\n\nmine\n`;
    const kitBlock = `<!-- boomopen-workflow-kit-START -->\n${kitFile()}<!-- boomopen-workflow-kit-END -->\n`;
    write(shared, `${userPart}\n${kitBlock}`);
    const report = syncSettingsToInstalledPlatforms(PRESETS['solo-fast'], { homeDir: box.homeDir });
    const text = fs.readFileSync(shared, 'utf8');
    assert.ok(text.startsWith(userPart), 'text before the kit block is untouched');
    assert.match(text.slice(text.indexOf('<!-- boomopen-workflow-kit-START -->')), /`solo-fast`/);
    assert.deepEqual(report.updatedFiles, [shared]);

    const damaged = `# My rules\n\n<!-- boomopen-workflow-kit-START -->\n${kitFile()}`;
    write(shared, damaged);
    const second = syncSettingsToInstalledPlatforms(PRESETS['deep-architect'], { homeDir: box.homeDir });
    assert.equal(fs.readFileSync(shared, 'utf8'), damaged, 'a damaged kit block is never edited');
    assert.ok(second.skippedFiles.some((s) => s.file === shared && /damaged kit block/.test(s.reason)));
  } finally {
    box.cleanup();
  }
});

test('sync targets include the VS Code prompts file and the cursor/copilot CLAUDE.md copies (H10/L2)', () => {
  const home = path.join(os.tmpdir(), 'boomopen-fake-home');
  const targets = getSyncTargets(home, { env: { APPDATA: path.join(home, 'Roaming') }, platform: 'win32' });
  assert.ok(targets.copilot.includes(path.join(home, 'Roaming', 'Code', 'User', 'prompts', 'boomopen-workflow-kit.agent.md')));
  assert.ok(targets.copilot.includes(path.join(home, '.copilot', 'CLAUDE.md')));
  assert.ok(targets.cursor.includes(path.join(home, '.cursor', 'CLAUDE.md')));
  const linux = getSyncTargets(home, { env: {}, platform: 'linux' });
  assert.ok(linux.copilot.includes(path.join(home, '.config', 'Code', 'User', 'prompts', 'boomopen-workflow-kit.agent.md')));
  const sandboxed = getSyncTargets(home, { platform: 'win32' });
  assert.ok(sandboxed.copilot.every((p) => p.startsWith(home)), 'a custom homeDir never resolves to the real APPDATA');
});

test('settings CLI: help, unknown subcommands, read-only status (L15)', async () => {
  const box = sandbox();
  try {
    const claudeMd = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    write(claudeMd, kitFile(PRESETS['solo-fast']));
    const before = fs.readFileSync(claudeMd, 'utf8');
    const opts = { homeDir: box.homeDir, cwd: box.cwd, silent: true };
    for (const args of [['help'], ['--help'], ['-h']]) {
      assert.equal((await runSettingsCommand(args, opts)).action, 'help');
    }
    assert.equal((await runSettingsCommand(['foo'], opts)).action, 'error');
    assert.equal((await runSettingsCommand([], opts)).action, 'status');
    assert.equal((await runSettingsCommand(['status'], opts)).action, 'status');
    assert.equal(fs.readFileSync(claudeMd, 'utf8'), before, 'status must not write files');
    const synced = await runSettingsCommand(['sync'], opts);
    assert.deepEqual(synced.syncReport.updatedFiles, [claudeMd]);
    assert.match(fs.readFileSync(claudeMd, 'utf8'), /`smart-hybrid`/);
    assert.equal((await runSettingsCommand(['ui', '--port', 'abc'], opts)).action, 'error');
    const viaGet = await runSettingsCommand(['get', 'execution.mode'], opts);
    const viaFlagGet = await runSettingsCommand(['--get', 'execution.mode'], opts);
    assert.equal(viaGet.action, 'get');
    assert.equal(viaFlagGet.action, 'get');
    assert.equal(viaFlagGet.value, viaGet.value);
    const softRes = await runSettingsCommand(['--set', 'codingStandards.softFileLines=420'], opts);
    assert.equal(softRes.action, 'set');
    assert.equal((await runSettingsCommand(['--get', 'codingStandards.softFileLines'], opts)).value, 420);
    const customCouncil = await runSettingsCommand(['--set', 'engines.councilMembers=cursor,copilot,claude'], opts);
    assert.equal(customCouncil.action, 'set');
    assert.equal((await runSettingsCommand(['--get', 'engines.councilMembers'], opts)).value, 'cursor,copilot,claude');
    assert.equal((await runSettingsCommand(['--set', 'engines.councilMembers=claude,unknown'], opts)).action, 'error');
    assert.equal((await runSettingsCommand(['--set', 'engines.councilMembers=claude'], opts)).action, 'error');
  } finally {
    box.cleanup();
  }
});
