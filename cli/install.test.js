/**
 * In-process behaviour tests for the CLI modules.
 *
 * Hermetic by construction: before any kit module is loaded, HOME / USERPROFILE / APPDATA /
 * LOCALAPPDATA / XDG_CONFIG_HOME point at a temp folder, so os.homedir(), the installer's TOOLS
 * paths and the VS Code prompts folder all resolve inside the sandbox. Nothing is written into the
 * repository (the last test verifies that for the generated compact index).
 *
 * Content/size lint of the Markdown files lives in docs-content.test.js; the hook corpus in
 * hook-guard.test.js; real install/uninstall runs in user-files.test.js, install-cli.test.js and
 * cli-e2e.test.js; Codex config merging in codex-config.test.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  REPO_ROOT,
  tempDir,
  removeDir,
  sandboxEnv,
  listFiles,
} = require('./sandbox.test-helper.js');

const SANDBOX_HOME = tempDir('boomopen-test-home-');
Object.assign(process.env, sandboxEnv(SANDBOX_HOME));
process.on('exit', () => removeDir(SANDBOX_HOME));

const { TOOLS, ROOT_FILES, ensureDir, copyWithReplace } = require('./install.js');
const { buildCompactSkillIndex, runDoctor } = require('./doctor.js');
const { SOFT_FILE_LINES, HARD_FILE_LINES, inspectSourceFile, runCheck } = require('./checker.js');
const {
  SETTINGS_MARKER_START,
  SETTINGS_MARKER_END,
  DEFAULT_SETTINGS,
  PRESETS,
  ALLOWED_ENUMS,
  CODING_STANDARDS_PRESETS,
  loadSettings,
  saveSettings,
  setSettingByKey,
  getSettingByKey,
  applyPreset,
  resetSettings,
  renderActiveSettingsMarkdown,
  injectSettingsBlockIntoText,
  syncSettingsToInstalledPlatforms,
  runSettingsCommand,
} = require('./settings.js');
const { startSettingsUiServer } = require('./settings-ui.js');

const KIT_VERSION = require('../package.json').version;
const COMPACT_INDEX_PATH = path.join(REPO_ROOT, 'matrix-skills', 'compact-index.json');
const KIT_ENTRY_HEADER = '# ENTRY.md — BoomOpen Workflow Kit Orchestrator Instructions';
const REPO_SOURCE_CHECK_PREFIXES = ['platforms/', 'rules/', 'commands/', 'agents/', 'i18n/', 'skills/', 'matrix-skills/'];
const KIT_SOURCE_DIRS = ['cli', 'platforms', 'scripts'];

function fileFingerprint(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  return { hash, mtimeMs: stat.mtimeMs };
}

/** `count` newline-terminated lines, the way every real source file ends. */
function sourceLines(count, eol = '\n') {
  return Array.from({ length: count }, (_, i) => `const line${i} = ${i};`).join(eol) + eol;
}

const COMPACT_INDEX_BEFORE = fileFingerprint(COMPACT_INDEX_PATH);

// ---------------------------------------------------------------------------
// Installer configuration
// ---------------------------------------------------------------------------

test('TOOLS: all 5 platforms ship their assets from platforms/<tool> and resolve inside the sandboxed home', () => {
  for (const toolKey of ['cursor', 'copilot', 'antigravity', 'claude', 'codex']) {
    const tool = TOOLS[toolKey];
    assert.ok(tool && tool.assets, `TOOLS.${toolKey}.assets should exist`);
    for (const [assetName, assetPath] of Object.entries(tool.assets)) {
      assert.ok(assetPath.includes(path.join('platforms', toolKey)), `${toolKey}.${assetName} must live in platforms/${toolKey}`);
      assert.ok(fs.existsSync(assetPath), `asset ${toolKey}.${assetName} missing at ${assetPath}`);
    }
    for (const [key, value] of Object.entries(tool.paths)) {
      assert.ok(value.startsWith(SANDBOX_HOME), `TOOLS.${toolKey}.paths.${key} escaped the sandbox: ${value}`);
    }
  }
  assert.ok(
    TOOLS.antigravity.paths.frameworkPath.endsWith(path.join('.gemini', 'config', 'skills', 'boomopen-workflow-kit'))
  );
  assert.equal(TOOLS.antigravity.replacements['{TOOL}'], 'gemini/config');
  assert.ok(ROOT_FILES.includes('README.md') && ROOT_FILES.includes('SKILL.md'));
});

test('copyWithReplace applies placeholder replacements and skips node_modules and symlinks', (t) => {
  const dir = tempDir('boomopen-copy-');
  try {
    const src = path.join(dir, 'src');
    const dest = path.join(dir, 'dest', 'nested');
    fs.mkdirSync(path.join(src, 'node_modules', 'pkg'), { recursive: true });
    fs.mkdirSync(path.join(src, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(src, 'guide.md'), 'read ~/.{TOOL}/skills/boomopen-workflow-kit/SKILL.md\n');
    fs.writeFileSync(path.join(src, 'sub', 'data.json'), '{"tool":"{TOOL}"}');
    fs.writeFileSync(path.join(src, 'node_modules', 'pkg', 'index.js'), 'module.exports = 1;');
    const outside = path.join(dir, 'outside.md');
    fs.writeFileSync(outside, 'secret');
    let symlinkCreated = true;
    try {
      fs.symlinkSync(outside, path.join(src, 'link.md'), 'file');
    } catch {
      symlinkCreated = false; // Windows without Developer Mode cannot create symlinks
    }

    ensureDir(dest);
    assert.ok(fs.statSync(dest).isDirectory(), 'ensureDir creates nested folders');
    assert.doesNotThrow(() => ensureDir(dest), 'ensureDir is idempotent');

    const replacements = {
      '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.claude/skills/boomopen-workflow-kit/',
      '{TOOL}': 'claude',
    };
    const copied = copyWithReplace(src, dest, replacements, false);
    assert.equal(copied, 2);
    assert.equal(fs.readFileSync(path.join(dest, 'guide.md'), 'utf8'), 'read ~/.claude/skills/boomopen-workflow-kit/SKILL.md\n');
    assert.equal(fs.readFileSync(path.join(dest, 'sub', 'data.json'), 'utf8'), '{"tool":"claude"}');
    assert.equal(fs.existsSync(path.join(dest, 'node_modules')), false, 'node_modules is never copied');
    if (symlinkCreated) assert.equal(fs.existsSync(path.join(dest, 'link.md')), false, 'symlinks are never followed');
    else t.diagnostic('symlink case skipped: this OS user cannot create symlinks');
    assert.equal(copyWithReplace(path.join(dir, 'missing'), dest, {}, false), 0, 'missing source copies nothing');
  } finally {
    removeDir(dir);
  }
});

// ---------------------------------------------------------------------------
// Compact skill index (never regenerated inside the repository)
// ---------------------------------------------------------------------------

test('buildCompactSkillIndex output matches the committed matrix-skills/compact-index.json (built in a temp copy)', () => {
  const tmpRoot = tempDir('boomopen-index-');
  try {
    fs.cpSync(path.join(REPO_ROOT, 'matrix-skills'), path.join(tmpRoot, 'matrix-skills'), { recursive: true });
    fs.rmSync(path.join(tmpRoot, 'matrix-skills', 'compact-index.json'), { force: true });
    // Only the core skill folder names matter (they decide skills/ vs skills_library/ paths).
    for (const entry of fs.readdirSync(path.join(REPO_ROOT, 'skills'), { withFileTypes: true })) {
      if (entry.isDirectory()) fs.mkdirSync(path.join(tmpRoot, 'skills', entry.name), { recursive: true });
    }

    const result = buildCompactSkillIndex(tmpRoot);
    assert.ok(result.outputPath.startsWith(tmpRoot), 'the index is written where it was asked to be');
    assert.ok(result.count >= 1000, `Expected >= 1000 skills, got ${result.count}`);
    const generated = JSON.parse(fs.readFileSync(result.outputPath, 'utf8'));
    const committed = JSON.parse(fs.readFileSync(COMPACT_INDEX_PATH, 'utf8'));
    assert.equal(generated.version, KIT_VERSION, 'index version follows package.json');
    assert.equal(committed.version, KIT_VERSION, 'committed index version follows package.json');
    assert.equal(generated.skills['api-patterns'].domain, 'backend');
    assert.deepEqual(
      committed.skills,
      generated.skills,
      'committed compact-index.json is stale: regenerate it from matrix-skills/*.yaml'
    );
    assert.equal(committed.totalSkills, generated.totalSkills);
  } finally {
    removeDir(tmpRoot);
  }
});

// ---------------------------------------------------------------------------
// Pragmatic 2-Tier checker (fixtures end with a newline, like real files)
// ---------------------------------------------------------------------------

test(`checker counts lines like wc -l: ${SOFT_FILE_LINES}/${HARD_FILE_LINES} are allowed, one more warns/errors (LF and CRLF)`, () => {
  assert.equal(SOFT_FILE_LINES, 400);
  assert.equal(HARD_FILE_LINES, 500);
  for (const eol of ['\n', '\r\n']) {
    const label = JSON.stringify(eol);
    const atSoft = inspectSourceFile('/project/src/a.ts', '/project', sourceLines(SOFT_FILE_LINES, eol));
    assert.deepEqual([atSoft.violations.length, atSoft.warnings.length], [0, 0], `${label}: exactly ${SOFT_FILE_LINES} lines is clean`);

    const overSoft = inspectSourceFile('/project/src/a.ts', '/project', sourceLines(SOFT_FILE_LINES + 1, eol));
    assert.deepEqual([overSoft.violations.length, overSoft.warnings.length], [0, 1], `${label}: ${SOFT_FILE_LINES + 1} lines warns`);
    assert.match(overSoft.warnings[0], new RegExp(`\\b${SOFT_FILE_LINES + 1} lines`));

    const atHard = inspectSourceFile('/project/src/a.ts', '/project', sourceLines(HARD_FILE_LINES, eol));
    assert.equal(atHard.violations.length, 0, `${label}: exactly ${HARD_FILE_LINES} lines is not a hard error`);

    const overHard = inspectSourceFile('/project/src/a.ts', '/project', sourceLines(HARD_FILE_LINES + 1, eol));
    assert.equal(overHard.violations.length, 1, `${label}: ${HARD_FILE_LINES + 1} lines is a hard error`);
    assert.match(overHard.violations[0], new RegExp(`\\b${HARD_FILE_LINES + 1} lines`));
  }

  const unterminated = sourceLines(HARD_FILE_LINES).trimEnd();
  assert.equal(inspectSourceFile('/project/src/a.ts', '/project', unterminated).violations.length, 0);
  assert.equal(inspectSourceFile('/project/src/a.ts', '/project', '').violations.length, 0);
});

test('checker exempts test files from size limits and flags explicit any in TypeScript', () => {
  const resTest = inspectSourceFile('/project/src/userService.test.ts', '/project', sourceLines(600));
  assert.deepEqual([resTest.violations.length, resTest.warnings.length], [0, 0]);

  const badAny = 'export function parsePayload(input: any): string { return String(input); }\n';
  assert.equal(inspectSourceFile('/project/src/parser.ts', '/project', badAny).violations.length, 1);
  const typed = 'export function parsePayload(input: unknown): string { return String(input); }\n';
  assert.equal(inspectSourceFile('/project/src/parser.ts', '/project', typed).violations.length, 0);
});

test('codingStandards presets: strict 300/400 and relaxed 600/800 boundaries are exact', () => {
  assert.deepEqual(CODING_STANDARDS_PRESETS.strict, {
    softFileLines: 300,
    hardFileLines: 400,
    forbidExplicitAny: true,
    warnConsoleLog: true,
  });
  assert.deepEqual(CODING_STANDARDS_PRESETS.relaxed, {
    softFileLines: 600,
    hardFileLines: 800,
    forbidExplicitAny: true,
    warnConsoleLog: false,
  });
  const inspect = (lines, preset) => inspectSourceFile('/project/src/mod.ts', '/project', sourceLines(lines), preset);
  assert.deepEqual([inspect(300, 'strict').violations.length, inspect(300, 'strict').warnings.length], [0, 0]);
  assert.deepEqual([inspect(301, 'strict').violations.length, inspect(301, 'strict').warnings.length], [0, 1]);
  assert.equal(inspect(400, 'strict').violations.length, 0);
  assert.equal(inspect(401, 'strict').violations.length, 1);
  assert.deepEqual([inspect(450, 'relaxed').violations.length, inspect(450, 'relaxed').warnings.length], [0, 0]);
  assert.deepEqual([inspect(650, 'relaxed').violations.length, inspect(650, 'relaxed').warnings.length], [0, 1]);
  assert.equal(inspect(801, 'relaxed').violations.length, 1);
});

test(`runCheck passes on the whole repository (same as \`boomopen check .\`) and fails on an oversized file`, () => {
  const repoReport = runCheck(REPO_ROOT, { silent: true, homeDir: SANDBOX_HOME, cwd: REPO_ROOT });
  assert.equal(repoReport.passed, true, `boomopen check . failed: ${repoReport.violations.join(', ')}`);
  for (const dir of KIT_SOURCE_DIRS) {
    const report = runCheck(path.join(REPO_ROOT, dir), { silent: true, homeDir: SANDBOX_HOME, cwd: REPO_ROOT });
    assert.equal(report.passed, true, `boomopen check ${dir}/ failed: ${report.violations.join(', ')}`);
    assert.ok(report.scannedFiles >= 1, `${dir}/ should contain source files`);
  }
  assert.ok(repoReport.scannedFiles > 100, `expected the repo-wide scan to cover the kit and web sources, got ${repoReport.scannedFiles}`);

  const project = tempDir('boomopen-check-');
  try {
    fs.mkdirSync(path.join(project, 'src'));
    fs.writeFileSync(path.join(project, 'src', 'ok.ts'), sourceLines(HARD_FILE_LINES));
    assert.equal(runCheck(project, { silent: true }).passed, true);
    fs.writeFileSync(path.join(project, 'src', 'big.ts'), sourceLines(HARD_FILE_LINES + 1));
    const failing = runCheck(project, { silent: true });
    assert.equal(failing.passed, false);
    assert.equal(failing.violations.length, 1);
  } finally {
    removeDir(project);
  }
});

// ---------------------------------------------------------------------------
// Doctor (always against a sandboxed home, never the developer's profile)
// ---------------------------------------------------------------------------

test('runDoctor with an empty sandboxed home: kit source checks pass, missing installs are reported', () => {
  const emptyHome = tempDir('boomopen-doctor-home-');
  try {
    const report = runDoctor({ repoRoot: REPO_ROOT, homeDir: emptyHome, cwd: emptyHome, silent: true });
    const sourceChecks = report.checks.filter((c) => REPO_SOURCE_CHECK_PREFIXES.some((p) => c.name.startsWith(p)));
    assert.ok(sourceChecks.length >= 5, `expected the kit source checks, got ${JSON.stringify(report.checks.map((c) => c.name))}`);
    const failedSource = sourceChecks.filter((c) => !c.passed);
    assert.deepEqual(failedSource, [], `kit source checks failed: ${JSON.stringify(failedSource)}`);
    assert.equal(report.healthy, false, 'nothing is installed in an empty home, so doctor must not report healthy');
    const homeFiles = listFiles(emptyHome);
    assert.deepEqual(homeFiles, [], 'doctor is read-only');
  } finally {
    removeDir(emptyHome);
  }
});

// ---------------------------------------------------------------------------
// Settings engine
// ---------------------------------------------------------------------------

test('Settings schema: version follows package.json, smart-hybrid defaults and 20 enum settings', () => {
  assert.equal(DEFAULT_SETTINGS.version, KIT_VERSION);
  assert.equal(DEFAULT_SETTINGS.preset, 'smart-hybrid');
  assert.equal(DEFAULT_SETTINGS.execution.modeAThresholdFiles, 2);
  assert.equal(DEFAULT_SETTINGS.execution.swarmScaling, 'elastic');
  assert.equal(DEFAULT_SETTINGS.execution.maxParallelSubagents, 8);
  assert.ok(ALLOWED_ENUMS['execution.modeAThresholdFiles'].includes(2));
  assert.equal(DEFAULT_SETTINGS.workflows.naturalLanguageResearchTrigger, 'auto_team');

  const mdBlock = renderActiveSettingsMarkdown(DEFAULT_SETTINGS);
  assert.ok(mdBlock.startsWith(SETTINGS_MARKER_START) && mdBlock.endsWith(SETTINGS_MARKER_END));
  assert.ok(mdBlock.includes('Proactive Sub-agent First'));
  assert.ok(mdBlock.includes('Turn 1'));

  const expected20Keys = [
    'execution.mode',
    'execution.modeAThresholdFiles',
    'execution.swarmScaling',
    'execution.maxParallelSubagents',
    'workflows.defaultVariant',
    'workflows.naturalLanguageResearchTrigger',
    'models.subagentPolicy',
    'research.depth',
    'clarification.style',
    'teams.maxDebateRounds',
    'codingStandards.preset',
    'verification.level',
    'deliverables.routing',
    'language.response',
    'engines.researcher',
    'engines.planner',
    'engines.coder',
    'engines.debugger',
    'engines.reviewer',
    'engines.councilMembers',
  ];
  assert.deepEqual(Object.keys(ALLOWED_ENUMS).filter((k) => k !== 'preset'), expected20Keys);
  for (const key of expected20Keys) {
    const val = getSettingByKey(DEFAULT_SETTINGS, key);
    assert.ok(ALLOWED_ENUMS[key].includes(val), `DEFAULT_SETTINGS.${key} (${val}) not in ALLOWED_ENUMS`);
  }
  assert.deepEqual(Object.keys(PRESETS), ['smart-hybrid', 'solo-fast', 'deep-architect', 'adversarial-team']);
  assert.equal(PRESETS['solo-fast'].execution.mode, 'mode_a');
  assert.equal(PRESETS['deep-architect'].execution.mode, 'mode_b');
  assert.equal(PRESETS['adversarial-team'].execution.mode, 'team');
  for (const preset of Object.values(PRESETS)) assert.equal(preset.version, KIT_VERSION);
});

test('Settings persistence (global + project), presets, set and reset work in an isolated temp dir', async () => {
  const tmpRoot = tempDir('boomopen-settings-');
  const homeDir = path.join(tmpRoot, 'home');
  const cwd = path.join(tmpRoot, 'workspace');
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(cwd, { recursive: true });
  try {
    const initial = loadSettings({ homeDir, cwd });
    assert.equal(initial.preset, 'smart-hybrid');
    assert.equal(initial.workflows.naturalLanguageResearchTrigger, 'auto_team');

    for (const presetName of ['solo-fast', 'deep-architect', 'adversarial-team', 'smart-hybrid']) {
      const applied = applyPreset(presetName, { homeDir, cwd, scope: 'global', sync: false });
      assert.equal(applied.settings.preset, presetName);
      assert.equal(applied.settings.execution.mode, PRESETS[presetName].execution.mode);
    }

    const customGlobal = setSettingByKey('execution.mode', 'mode_b', { homeDir, cwd, scope: 'global', sync: false });
    assert.equal(customGlobal.settings.preset, 'custom');
    assert.equal(customGlobal.settings.execution.mode, 'mode_b');

    const projOverride = saveSettings(
      { 'execution.mode': 'team', 'teams.maxDebateRounds': 2 },
      { homeDir, cwd, scope: 'project', sync: false }
    );
    assert.equal(projOverride.scope, 'project');
    assert.ok(fs.existsSync(path.join(cwd, '.boomopen.json')));
    assert.equal(loadSettings({ homeDir, cwd }).execution.mode, 'team');
    assert.equal(loadSettings({ homeDir, cwd }).teams.maxDebateRounds, 2);
    assert.equal(loadSettings({ homeDir, cwd, scope: 'global' }).execution.mode, 'mode_b');

    resetSettings({ homeDir, cwd, scope: 'project', sync: false });
    assert.ok(!fs.existsSync(path.join(cwd, '.boomopen.json')));
    assert.equal(loadSettings({ homeDir, cwd }).execution.mode, 'mode_b', 'project reset keeps global settings');

    resetSettings({ homeDir, cwd, scope: 'global', sync: false });
    assert.equal(loadSettings({ homeDir, cwd }).preset, 'smart-hybrid');
    assert.equal(loadSettings({ homeDir, cwd }).execution.mode, 'auto');

    const cmdGet = await runSettingsCommand(['get', 'workflows.naturalLanguageResearchTrigger', '--json'], {
      homeDir,
      cwd,
      silent: true,
    });
    assert.equal(cmdGet.value, 'auto_team');
  } finally {
    removeDir(tmpRoot);
  }
});

/**
 * Every instruction file the installer writes with a settings block, derived from the installer's
 * own TOOLS paths (so APPDATA/XDG-based locations such as the VS Code prompts folder are included).
 */
function installedEntrypoints() {
  const p = (tool) => TOOLS[tool].paths;
  return {
    antigravity: [
      path.join(p('antigravity').gemini, 'GEMINI.md'),
      path.join(p('antigravity').globalAgents, 'AntigravityGlobal.agent.md'),
    ],
    claude: [path.join(p('claude').home, 'CLAUDE.md'), path.join(p('claude').home, 'AGENT.md')],
    codex: [
      path.join(p('codex').home, 'AGENTS.md'),
      path.join(p('codex').home, 'CODEX.md'),
      path.join(p('codex').home, 'AGENT.md'),
    ],
    cursor: [
      path.join(p('cursor').editorHome, 'CURSOR.md'),
      path.join(p('cursor').rules, 'boomopen-workflow-kit.mdc'),
      path.join(p('cursor').editorHome, 'AGENT.md'),
      path.join(p('cursor').editorHome, 'CLAUDE.md'),
    ],
    copilot: [
      path.join(p('copilot').home, 'COPILOT.md'),
      path.join(p('copilot').home, 'AGENT.md'),
      path.join(p('copilot').home, 'CLAUDE.md'),
      path.join(p('copilot').vsCodePrompts, 'boomopen-workflow-kit.agent.md'),
    ],
  };
}

test('syncSettingsToInstalledPlatforms updates every installer-written entrypoint (incl. VS Code prompt) and no user file', () => {
  const entrypoints = installedEntrypoints();
  const kitText = `${KIT_ENTRY_HEADER}\n\n${renderActiveSettingsMarkdown(DEFAULT_SETTINGS)}\n\n## Rules\n`;
  const userOwned = path.join(SANDBOX_HOME, '.codex', 'my-notes.md');
  try {
    for (const [tool, files] of Object.entries(entrypoints)) {
      const frameworkPath = TOOLS[tool].paths.frameworkPath;
      fs.mkdirSync(frameworkPath, { recursive: true });
      fs.writeFileSync(path.join(frameworkPath, 'SKILL.md'), '# BoomOpen Workflow Kit\n');
      for (const file of files) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, kitText, 'utf8');
      }
    }
    fs.writeFileSync(userOwned, '# My own Codex notes\n', 'utf8');

    const report = syncSettingsToInstalledPlatforms(PRESETS['adversarial-team'], { homeDir: SANDBOX_HOME });
    assert.deepEqual(report.platforms, { antigravity: true, claude: true, codex: true, cursor: true, copilot: true });
    assert.equal(fs.readFileSync(userOwned, 'utf8'), '# My own Codex notes\n', 'user files are never touched');

    const stale = Object.values(entrypoints)
      .flat()
      .filter((file) => !fs.readFileSync(file, 'utf8').includes('**Active Preset**: `adversarial-team`'));
    assert.deepEqual(stale.map((f) => path.relative(SANDBOX_HOME, f)), [], 'installed entrypoints left stale');
    for (const file of Object.values(entrypoints).flat()) {
      const updated = fs.readFileSync(file, 'utf8');
      assert.ok(updated.includes('**Execution Mode (`execution.mode`)**: `team`'), file);
      assert.equal(updated.split(SETTINGS_MARKER_START).length, 2, `${file} must hold exactly one settings block`);
    }

    const injected = injectSettingsBlockIntoText('# Title\n\n---\n\n## Content\n', PRESETS['solo-fast']);
    assert.ok(injected.includes(SETTINGS_MARKER_START));
    assert.ok(injected.includes('**Active Preset**: `solo-fast`'));
  } finally {
    for (const dir of ['.gemini', '.claude', '.codex', '.cursor', '.copilot', 'AppData', '.config', 'Library']) {
      removeDir(path.join(SANDBOX_HOME, dir));
    }
  }
});

test('Settings Web UI (port 0) serves HTML and the REST API, and rejects cross-origin writes', async () => {
  const tmpRoot = tempDir('boomopen-webui-');
  const homeDir = path.join(tmpRoot, 'home');
  const cwd = path.join(tmpRoot, 'workspace');
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(cwd, { recursive: true });
  const { server, url, port } = await startSettingsUiServer({ port: 0, openBrowser: false, silent: true, homeDir, cwd });
  let token = '';
  const postJson = (route, body, headers = {}) =>
    fetch(`${url}${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-BoomOpen-Token': token, ...headers },
      body: JSON.stringify(body),
    });
  try {
    assert.ok(port > 0, 'Expected ephemeral port > 0');
    const htmlRes = await fetch(`${url}/`);
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.ok(html.includes('UNIFIED SETTINGS & CONTROL CENTER'));
    token = /const TOKEN = "([0-9a-f]+)"/.exec(html)[1];
    assert.equal((await fetch(`${url}/api/settings`)).status, 403, 'API calls without the session token are refused');

    const getData = await (await fetch(`${url}/api/settings`, { headers: { 'X-BoomOpen-Token': token } })).json();
    assert.equal(getData.ok, true);
    assert.equal(getData.settings.preset, 'smart-hybrid');
    assert.ok(getData.descriptions && getData.descriptions['execution.mode']);

    const crossSite = await postJson('/api/preset', { preset: 'solo-fast', scope: 'global' }, { Origin: 'http://evil.example' });
    assert.equal(crossSite.status, 403, 'a cross-origin page must not change settings');
    assert.equal(loadSettings({ homeDir, cwd }).preset, 'smart-hybrid');

    const presetData = await (await postJson('/api/preset', { preset: 'adversarial-team', scope: 'global' })).json();
    assert.equal(presetData.ok, true);
    assert.equal(presetData.settings.execution.mode, 'team');

    const postData = await (
      await postJson('/api/settings', {
        scope: 'global',
        settings: { execution: { mode: 'mode_a', modeAThresholdFiles: 5 }, workflows: { naturalLanguageResearchTrigger: 'auto_hard' } },
      })
    ).json();
    assert.equal(postData.ok, true);
    assert.equal(postData.settings.execution.mode, 'mode_a');
    assert.equal(postData.settings.execution.modeAThresholdFiles, 5);
    assert.equal(postData.settings.workflows.naturalLanguageResearchTrigger, 'auto_hard');

    const resetData = await (await postJson('/api/reset', { scope: 'global' })).json();
    assert.equal(resetData.ok, true);
    assert.equal(resetData.settings.preset, 'smart-hybrid');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    removeDir(tmpRoot);
  }
});

// ---------------------------------------------------------------------------
// Hermeticity guard (keep last)
// ---------------------------------------------------------------------------

test('the test run did not rewrite matrix-skills/compact-index.json or touch the real home', () => {
  assert.deepEqual(fileFingerprint(COMPACT_INDEX_PATH), COMPACT_INDEX_BEFORE, 'compact-index.json was rewritten during tests');
  assert.equal(os.homedir(), SANDBOX_HOME);
});
