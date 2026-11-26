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
  ALLOWED_ENUMS,
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
const {
  findSettingsBlock,
  getSyncTargets,
  renderPlatformSlimBody,
  renderAntigravitySlimBody,
} = require('./settings-sync.js');

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

test('every shipped settings block equals renderActiveSettingsMarkdown(DEFAULT_SETTINGS) and smart-hybrid is first (L14)', () => {
  const expected = renderActiveSettingsMarkdown(DEFAULT_SETTINGS);
  assert.deepEqual(Object.keys(PRESETS), [
    'smart-hybrid',
    'frontier-guardrails',
    'carbon-guardrails',
    'solo-fast',
    'deep-architect',
    'adversarial-team',
  ]);
  assert.deepEqual(ALLOWED_ENUMS.preset, [...Object.keys(PRESETS), 'custom']);
  assert.equal(DEFAULT_SETTINGS.preset, 'smart-hybrid');
  assert.equal(DEFAULT_SETTINGS.execution.mode, 'auto');
  assert.equal(DEFAULT_SETTINGS.execution.modeAThresholdFiles, 2);
  assert.equal(DEFAULT_SETTINGS.execution.swarmScaling, 'elastic');
  assert.equal(DEFAULT_SETTINGS.execution.maxParallelSubagents, 8);
  assert.equal(DEFAULT_SETTINGS.workflows.naturalLanguageResearchTrigger, 'auto_team');
  assert.deepEqual(PRESETS['smart-hybrid'], DEFAULT_SETTINGS);
  assert.deepEqual({ ...PRESETS['carbon-guardrails'], preset: 'frontier-guardrails' }, PRESETS['frontier-guardrails']);
  assert.equal(PRESETS['frontier-guardrails'].execution.mode, 'mode_a');
  assert.equal(PRESETS['frontier-guardrails'].execution.modeAThresholdFiles, 10);
  assert.equal(PRESETS['frontier-guardrails'].workflows.naturalLanguageResearchTrigger, 'off');
  assert.equal(PRESETS['solo-fast'].execution.swarmScaling, 'conservative');
  assert.equal(PRESETS['solo-fast'].execution.maxParallelSubagents, 3);
  assert.equal(PRESETS['deep-architect'].execution.maxParallelSubagents, 12);
  assert.equal(PRESETS['adversarial-team'].execution.swarmScaling, 'hyper_swarm');
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
      assert.equal(setSettingByKey('language.response', lang, box.opts).settings.language.response, lang);
    }
  } finally {
    box.cleanup();
  }
});

test('BOM, UTF-16, carbon-guardrails alias, and broken JSON settings files are read or refused safely (M16)', () => {
  const box = sandbox();
  try {
    const globalPath = path.join(box.homeDir, '.boomopen', 'settings.json');
    write(globalPath, JSON.stringify({ preset: 'carbon-guardrails' }));
    assert.equal(loadSettings(box.opts).preset, 'carbon-guardrails');

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
    assert.equal(loadSettings(box.opts).preset, 'smart-hybrid');
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
    assert.equal(resetSettings({ ...box.opts, scope: 'project' }).noop, true);
    assert.equal(loadSettings({ ...box.opts, scope: 'global' }).execution.mode, 'mode_b');

    setSettingByKey('research.depth', 'quick_brief', { ...box.opts, scope: 'project' });
    const projectRaw = JSON.parse(fs.readFileSync(path.join(box.cwd, '.boomopen.json'), 'utf8'));
    assert.deepEqual(projectRaw, { research: { depth: 'quick_brief' } });

    setSettingByKey('execution.mode', 'mode_a', box.opts);
    assert.equal(loadSettings(box.opts).execution.mode, 'mode_a');
    assert.equal(loadSettings(box.opts).research.depth, 'quick_brief');

    const claudeMd = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    write(claudeMd, kitFile(PRESETS['smart-hybrid']));
    saveSettings({ 'execution.mode': 'team' }, { homeDir: box.homeDir, cwd: box.cwd, scope: 'project' });
    syncSettingsToInstalledPlatforms(null, { homeDir: box.homeDir, cwd: box.cwd });
    assert.match(fs.readFileSync(claudeMd, 'utf8'), /\*\*Execution Mode \(`execution.mode`\)\*\*: `mode_a`/);
  } finally {
    box.cleanup();
  }
});

test('custom line limits, prototype-key guards, and marker safety rules hold (L16/L17/L18/M21)', async () => {
  const box = sandbox();
  try {
    write(
      path.join(box.homeDir, '.boomopen', 'settings.json'),
      JSON.stringify({ codingStandards: { preset: 'pragmatic', softFileLines: 250, hardFileLines: 350 } })
    );
    setSettingByKey('language.response', 'en', box.opts);
    assert.deepEqual(
      [loadSettings(box.opts).codingStandards.softFileLines, loadSettings(box.opts).codingStandards.hardFileLines],
      [250, 350]
    );
    saveSettings({ codingStandards: { softFileLines: -5, hardFileLines: 1e308 } }, box.opts);
    saveSettings({ codingStandards: { softFileLines: 900 } }, box.opts);
    assert.deepEqual(
      [loadSettings(box.opts).codingStandards.softFileLines, loadSettings(box.opts).codingStandards.hardFileLines],
      [250, 350]
    );
    setSettingByKey('codingStandards.preset', 'strict', box.opts);
    assert.deepEqual(
      [loadSettings(box.opts).codingStandards.softFileLines, loadSettings(box.opts).codingStandards.hardFileLines],
      [300, 400]
    );
    assert.throws(() => setSettingByKey('codingStandards.softFileLines', '550', box.opts), /cannot exceed/);

    for (const key of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      assert.throws(() => setSettingByKey(key, 'x', box.opts), /Unknown setting key/);
    }
    assert.throws(() => applyPreset('toString', box.opts), /Unknown preset/);
    assert.equal((await runSettingsCommand(['get', 'constructor'], { ...box.opts, silent: true })).action, 'error');
    assert.equal(setSettingByKey('preset', 'deep-architect', box.opts).settings.execution.mode, 'mode_b');
    assert.equal(saveSettings({ execution: { mode: 'mode_a' } }, box.opts).settings.preset, 'custom');
    assert.equal(applyPreset('carbon-guardrails', box.opts).settings.preset, 'carbon-guardrails');
    assert.equal(applyPreset('frontier-guardrails', box.opts).settings.preset, 'frontier-guardrails');

    const adv = PRESETS['adversarial-team'];
    const orphan = `${KIT_HEADER}${SETTINGS_MARKER_START}\nMY NOTE\n`;
    assert.equal(injectSettingsBlockIntoText(orphan, adv), orphan);
    const reversed = `${KIT_HEADER}${SETTINGS_MARKER_END}\nmid\n${SETTINGS_MARKER_START}\n`;
    assert.equal(injectSettingsBlockIntoText(reversed, adv), reversed);
    const twoBlocks = `${KIT_HEADER}${renderActiveSettingsMarkdown()}\n\n${renderActiveSettingsMarkdown()}\n`;
    assert.equal(injectSettingsBlockIntoText(twoBlocks, adv), twoBlocks);
    const fenced = '# Title\n\n```md\n---\n```\n\ntext\n\n---\n\n## Content\n';
    assert.ok(injectSettingsBlockIntoText(fenced, adv).indexOf(SETTINGS_MARKER_START) > fenced.indexOf('```\n\ntext'));
    const crlf = kitFile().replace(/\n/g, '\r\n');
    assert.ok(!/[^\r]\n/.test(injectSettingsBlockIntoText(crlf, adv)), 'CRLF files stay CRLF');
  } finally {
    box.cleanup();
  }
});

test('sync touches only kit-owned files with valid blocks, preserves user text, and handles CLI subcommands (H9/H10/L15/L19)', async () => {
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
    assert.equal(fs.readFileSync(kitNoBlock, 'utf8'), `${KIT_HEADER}## Rules\n`);
    assert.equal(fs.readFileSync(brokenKit, 'utf8'), `${KIT_HEADER}${SETTINGS_MARKER_START}\nnote\n`);
    assert.match(fs.readFileSync(goodKit, 'utf8'), /`deep-architect`/);
    assert.deepEqual(report.updatedFiles, [goodKit]);

    const shared = path.join(box.homeDir, '.claude', 'CLAUDE.md');
    const userPart = `# My rules\n\nStale:\n${renderActiveSettingsMarkdown()}\n\nmine\n`;
    write(shared, `${userPart}\n<!-- boomopen-workflow-kit-START -->\n${kitFile(PRESETS['smart-hybrid'])}<!-- boomopen-workflow-kit-END -->\n`);
    syncSettingsToInstalledPlatforms(PRESETS['solo-fast'], { homeDir: box.homeDir });
    const mergedText = fs.readFileSync(shared, 'utf8');
    assert.ok(mergedText.startsWith(userPart));
    assert.match(mergedText.slice(mergedText.indexOf('<!-- boomopen-workflow-kit-START -->')), /`solo-fast`/);

    const targets = getSyncTargets(box.homeDir, { env: { APPDATA: path.join(box.homeDir, 'Roaming') }, platform: 'win32' });
    assert.ok(targets.copilot.includes(path.join(box.homeDir, 'Roaming', 'Code', 'User', 'prompts', 'boomopen-workflow-kit.agent.md')));

    write(shared, kitFile(PRESETS['solo-fast']));
    const opts = { homeDir: box.homeDir, cwd: box.cwd, silent: true };
    assert.equal((await runSettingsCommand(['--help'], opts)).action, 'help');
    assert.equal((await runSettingsCommand(['status'], opts)).action, 'status');
    await runSettingsCommand(['sync'], opts);
    assert.match(fs.readFileSync(shared, 'utf8'), /`smart-hybrid`/);
    assert.equal((await runSettingsCommand(['--set', 'codingStandards.softFileLines=420'], opts)).action, 'set');
    assert.equal((await runSettingsCommand(['--get', 'codingStandards.softFileLines'], opts)).value, 420);
    assert.equal((await runSettingsCommand(['--set', 'engines.councilMembers=cursor,copilot,claude'], opts)).action, 'set');
    assert.equal((await runSettingsCommand(['reset', '--dry-run'], opts)).exitCode, 1);
  } finally {
    box.cleanup();
  }
});

test('all 5 platforms render <2.5KB slim bodies without Carbon leakage, keep YAML frontmatter, and round-trip losslessly', () => {
  const box = sandbox();
  const env = { APPDATA: path.join(box.homeDir, 'Roaming') };
  try {
    const targets = getSyncTargets(box.homeDir, { env, platform: 'win32' });
    const copilotAgent = targets.copilot.find((p) => p.endsWith('boomopen-workflow-kit.agent.md'));
    const fixtureMap = [
      [targets.antigravity[0], 'platforms/antigravity/GEMINI.md', true],
      [targets.antigravity[1], 'platforms/antigravity/AntigravityGlobal.agent.md', false],
      [targets.claude[0], 'platforms/claude/CLAUDE.md', true],
      [targets.claude[1], 'AGENT.md', true],
      [targets.codex[0], 'platforms/codex/CODEX.md', true],
      [targets.codex[1], 'platforms/codex/CODEX.md', true],
      [targets.cursor[0], 'platforms/cursor/.cursorrules', true],
      [targets.cursor[1], 'platforms/cursor/rules/boomopen-workflow-kit.mdc', false],
      [targets.copilot[0], 'COPILOT.md', true],
      [targets.copilot[1], 'COPILOT.md', true],
      [copilotAgent, 'platforms/copilot/boomopen-workflow-kit.agent.md', false],
    ];
    const userNote = '# Personal Note\n- Keep concise.\n';
    for (const [dest, relSrc, wrapped] of fixtureMap) {
      const raw = fs.readFileSync(path.join(REPO_ROOT, relSrc), 'utf8');
      write(dest, wrapped ? `${userNote}\n<!-- boomopen-workflow-kit-START -->\n${raw.trimEnd()}\n<!-- boomopen-workflow-kit-END -->\n` : raw);
    }

    for (const presetName of ['frontier-guardrails', 'carbon-guardrails', 'solo-fast']) {
      const res = syncSettingsToInstalledPlatforms(PRESETS[presetName], { homeDir: box.homeDir, env, platform: 'win32' });
      assert.equal(res.failedFiles.length, 0);
      for (const [dest, , wrapped] of fixtureMap) {
        const text = fs.readFileSync(dest, 'utf8');
        const regionText = wrapped ? text.slice(text.indexOf('<!-- boomopen-workflow-kit-START -->')) : text;
        const bodyOnly = regionText.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n+/, '');
        assert.ok(Buffer.byteLength(bodyOnly, 'utf8') < 2500, `${path.basename(dest)} (${presetName}) body >= 2.5KB: ${Buffer.byteLength(bodyOnly, 'utf8')}B`);
        if (wrapped) assert.ok(text.startsWith(userNote), `${dest} lost user note`);
        if (!dest.includes('.gemini')) assert.doesNotMatch(regionText, /Carbon drives|CARBON-GUARDRAILS/, `${dest} leaked Carbon phrasing`);
      }
      assert.match(fs.readFileSync(targets.cursor[1], 'utf8'), /^---\r?\ndescription:[\s\S]*?alwaysApply: true\r?\n---/);
      assert.match(fs.readFileSync(targets.antigravity[1], 'utf8'), /^---\r?\nname: BoomOpen Workflow Kit[\s\S]*?handoffs:/);
      assert.match(fs.readFileSync(copilotAgent, 'utf8'), /^---\r?\nname: BoomOpen Workflow Kit[\s\S]*?argument-hint:/);
      if (presetName === 'carbon-guardrails') {
        assert.match(fs.readFileSync(targets.antigravity[0], 'utf8'), /CARBON-GUARDRAILS EDITION/);
        assert.match(renderAntigravitySlimBody(PRESETS['carbon-guardrails']), /Carbon drives daily tasks/);
      }
      assert.doesNotMatch(renderPlatformSlimBody('claude', PRESETS['carbon-guardrails']), /Carbon/);
      assert.deepEqual(syncSettingsToInstalledPlatforms(PRESETS[presetName], { homeDir: box.homeDir, env, platform: 'win32' }).writtenFiles, []);

      const fullPreset = presetName === 'solo-fast' ? 'deep-architect' : 'smart-hybrid';
      syncSettingsToInstalledPlatforms(PRESETS[fullPreset], { homeDir: box.homeDir, env, platform: 'win32' });
      assert.match(fs.readFileSync(targets.claude[0], 'utf8'), /WebSearch/);
      assert.match(fs.readFileSync(targets.codex[1], 'utf8'), /spawn_agent/);
      assert.match(fs.readFileSync(targets.cursor[1], 'utf8'), /TOOL NAMES ON CURSOR/);
      assert.match(fs.readFileSync(copilotAgent, 'utf8'), /runSubagent/);
      assert.match(fs.readFileSync(targets.antigravity[0], 'utf8'), /Anti-Solo-Crawling Rule/);
    }
  } finally {
    box.cleanup();
  }
});
