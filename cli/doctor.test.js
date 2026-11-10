'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { runDoctor, runDoctorCli } = require('./doctor.js');
const { parseDomainYaml, validateDomainYamlLayout, buildCompactIndexData, buildCompactSkillIndex } = require('./doctor-index.js');
const { detectMojibake, DOC_LINE_LIMITS } = require('./doctor-markdown.js');
const { checkSettingsFiles } = require('./doctor-settings.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { GEMINI_MARKER_START } = require('./markers.js');
const { tempDir, removeDir, sandboxEnv, buildFixtureKit, runCli } = require('./sandbox.test-helper.js');

const PKG_VERSION = require('../package.json').version;

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function findCheck(report, name) {
  return report.checks.find((c) => c.name === name);
}

test('parseDomainYaml handles quotes, byte-0 entries, flow items, key order and subcategory (L21)', () => {
  const yaml = [
    '- skill_id: "007"',
    '  category: "core"',
    '  priority_score: 9',
    '- { skill_id: flowy, category: tools, priority_score: 7 }',
    '- category: expert',
    '  skill_id: second',
    '- skill_id: nocat',
    '  subcategory: niche',
    'other_section:',
    '  category: leaked',
  ].join('\n');
  const entries = parseDomainYaml(yaml, 'demo', new Set(['flowy']));
  assert.deepEqual(Object.keys(entries), ['007', 'flowy', 'second', 'nocat']);
  assert.equal(entries['007'].category, 'core');
  assert.equal(entries['007'].priority, 9);
  assert.equal(entries['007'].path, 'skills_library/007/SKILL.md');
  assert.equal(entries.flowy.path, 'skills/flowy/SKILL.md');
  assert.equal(entries.second.category, 'expert');
  assert.equal(entries.nocat.category, 'specialized', 'subcategory and later sections must not leak');
});

test('validateDomainYamlLayout flags a list item at column 0 among indented ones (L21)', () => {
  const broken = 'skills:\n- skill_id: a\n    category: core\n  - skill_id: b\n    category: core\n';
  assert.equal(validateDomainYamlLayout(broken).length, 1);
  const valid = 'skills:\n  - skill_id: a\n    category: core\n  - skill_id: b\n    category: core\n';
  assert.deepEqual(validateDomainYamlLayout(valid), []);
});

test('compact index keeps every domain of multi-domain skills and uses the package version (L22)', () => {
  const root = tempDir('boomopen-index-');
  try {
    write(path.join(root, 'matrix-skills', 'design.yaml'), 'skill_count: 1\nskills:\n  - skill_id: shared\n    category: core\n');
    write(path.join(root, 'matrix-skills', 'frontend.yaml'), 'skill_count: 5\nskills:\n  - skill_id: shared\n    category: expert\n');
    const { payload, report } = buildCompactIndexData(root);
    assert.equal(payload.version, PKG_VERSION);
    assert.equal(KIT_VERSION, PKG_VERSION);
    assert.deepEqual(payload.skills.shared.domains, ['design', 'frontend']);
    assert.equal(payload.skills.shared.domain, 'frontend');
    assert.deepEqual(report.duplicates, ['shared']);
    assert.equal(report.files.find((f) => f.file === 'frontend.yaml').declaredCount, 5);
  } finally {
    removeDir(root);
  }
});

test('detectMojibake catches UTF-8 read as Windows-1252 and accepts clean text (L23)', () => {
  const garble = (s) => new TextDecoder('windows-1252').decode(Buffer.from(s, 'utf8'));
  for (const s of ['❌', '✅', '—', '→', '📏', 'Bóc tách', 'Tiếng Việt', '日本語', '╔']) {
    assert.ok(detectMojibake(garble(s)), `should flag ${s}`);
  }
  for (const s of ['Tiếng Việt chuẩn', 'Café crème — naïve', '日本語のテキスト', 'Größe °C ±5 «x»', 'à côté']) {
    assert.equal(detectMojibake(s), null, `should accept ${s}`);
  }
  assert.equal(DOC_LINE_LIMITS.rules, 300);
  assert.equal(DOC_LINE_LIMITS.commands, 450);
});

test('settings check fails on broken JSON and on ignored keys/values (M33)', () => {
  const home = tempDir('boomopen-doc-settings-');
  const cwd = tempDir('boomopen-doc-cwd-');
  const settingsPath = path.join(home, '.boomopen', 'settings.json');
  try {
    assert.equal(checkSettingsFiles({ homeDir: home, cwd }).passed, true, 'no files = defaults');
    write(settingsPath, '{ "preset": "adversarial-team", BROKEN JSON');
    assert.equal(checkSettingsFiles({ homeDir: home, cwd }).passed, false);
    write(settingsPath, JSON.stringify({ preset: 'bogus', execution: { mode: 'nope' } }));
    const bogus = checkSettingsFiles({ homeDir: home, cwd });
    assert.equal(bogus.passed, false);
    assert.match(bogus.detail, /preset/);
    assert.match(bogus.detail, /execution\.mode/);
    write(settingsPath, JSON.stringify({ preset: 'deep-architect', execution: { mode: 'mode_b' } }));
    assert.equal(checkSettingsFiles({ homeDir: home, cwd }).passed, true);
    write(path.join(cwd, '.boomopen.json'), JSON.stringify({ typoKey: 1 }));
    assert.equal(checkSettingsFiles({ homeDir: home, cwd }).passed, false, 'workspace file is checked too');
  } finally {
    removeDir(home);
    removeDir(cwd);
  }
});

test('doctor never requires ~/.gemini/config/skills.json and reports an empty profile clearly (H11, H12)', () => {
  const home = tempDir('boomopen-doc-empty-');
  try {
    const report = runDoctor({ homeDir: home, cwd: home, env: sandboxEnv(home), silent: true });
    assert.ok(!report.checks.some((c) => /skills\.json|GEMINI\.md/.test(c.name)));
    const installed = findCheck(report, 'Installed platforms');
    assert.equal(installed.passed, false);
    assert.match(installed.detail, /install/);
    assert.equal(runDoctorCli(['--platform', 'nope'], { homeDir: home }), 2);
    assert.equal(runDoctorCli(['--bogus'], { homeDir: home }), 2);
  } finally {
    removeDir(home);
  }
});

/**
 * Fixture kit with a tiny 2-domain matrix and stub vault skills, so the full install is fast
 * and the doctor's repository checks can pass without the real skills_library.
 */
function buildSmallKit() {
  const kitRoot = buildFixtureKit();
  removeDir(path.join(kitRoot, 'scripts'));
  fs.cpSync(path.join(__dirname, '..', 'i18n'), path.join(kitRoot, 'i18n'), { recursive: true });
  const matrixDir = path.join(kitRoot, 'matrix-skills');
  for (const file of fs.readdirSync(matrixDir)) {
    if (file.endsWith('.yaml') && !file.startsWith('_')) fs.rmSync(path.join(matrixDir, file));
  }
  const coreSkill = fs.readdirSync(path.join(kitRoot, 'skills'), { withFileTypes: true }).find((d) => d.isDirectory()).name;
  write(path.join(matrixDir, 'alpha.yaml'), `skill_count: 2\nskills:\n  - skill_id: ${coreSkill}\n    category: core\n  - skill_id: lib-one\n    category: expert\n`);
  write(path.join(matrixDir, 'beta.yaml'), 'skill_count: 2\nskills:\n  - skill_id: lib-one\n    category: core\n  - skill_id: lib-two\n    category: core\n');
  for (const id of ['lib-one', 'lib-two']) {
    write(path.join(kitRoot, 'skills_library', id, 'SKILL.md'), `---\nname: ${id}\n---\n# ${id}\n`);
  }
  // The fixture's committed index must match its own YAML files.
  buildCompactSkillIndex(kitRoot);
  return kitRoot;
}

test('doctor checks only installed platforms and detects a broken install (H11, H12, M25, M32, M49)', { timeout: 600000 }, () => {
  const kitRoot = buildSmallKit();
  const home = tempDir('boomopen-doc-home-');
  const doctor = (extra = {}) =>
    runDoctor({ repoRoot: kitRoot, homeDir: home, cwd: home, env: sandboxEnv(home), minSkills: 1, silent: true, ...extra });
  try {
    // A personal 250-line GEMINI.md must not count against the kit block limit.
    const personal = Array.from({ length: 250 }, (_, i) => `- my rule ${i}`).join('\n') + '\n';
    write(path.join(home, '.gemini', 'GEMINI.md'), personal);
    for (const tool of ['claude', 'antigravity']) {
      const result = runCli(kitRoot, home, ['install', tool]);
      assert.equal(result.status, 0, `install ${tool} failed:\n${result.stdout}\n${result.stderr}`);
    }

    const healthy = doctor();
    assert.equal(healthy.healthy, true, JSON.stringify(healthy.checks.filter((c) => !c.passed), null, 1));
    assert.match(findCheck(healthy, 'Installed platforms').detail, /antigravity, claude/);
    assert.ok(findCheck(healthy, 'Claude Code: skills vault'));
    assert.ok(!healthy.checks.some((c) => c.name.startsWith('Cursor')), 'cursor is not installed');

    // Every check is per platform: a missing vault skill, a replaced entry file, lost rules.
    fs.rmSync(path.join(home, '.claude', 'skills_library', 'lib-two'), { recursive: true });
    write(path.join(home, '.gemini', 'GEMINI.md'), 'hello, not the kit\n');
    fs.rmSync(path.join(home, '.claude', 'skills', 'boomopen-workflow-kit', 'rules'), { recursive: true });
    const broken = doctor();
    assert.equal(broken.healthy, false);
    assert.equal(findCheck(broken, 'Claude Code: skills vault').passed, false);
    assert.equal(findCheck(broken, 'Claude Code: framework files').passed, false);
    assert.match(findCheck(broken, 'Antigravity: entry files').detail, /no kit block/);
    assert.equal(findCheck(broken, 'Antigravity: skills vault').passed, true);

    // --platform narrows the run; a repo helper script that is not installed is reported.
    write(path.join(kitRoot, 'scripts', 'helper.py'), 'print("x")\n');
    const onlyAntigravity = doctor({ platforms: ['antigravity'] });
    assert.ok(!onlyAntigravity.checks.some((c) => c.name.startsWith('Claude')));
    assert.match(findCheck(onlyAntigravity, 'Antigravity: framework files').detail, /scripts/);

    // A stale committed index is detected (M25).
    write(path.join(kitRoot, 'matrix-skills', 'beta.yaml'), 'skills:\n  - skill_id: lib-two\n  - skill_id: lib-three\n');
    const stale = doctor({ platforms: ['antigravity'] });
    assert.match(findCheck(stale, 'matrix-skills/compact-index.json').detail, /stale/);
    assert.ok(home.includes(path.sep) && fs.readFileSync(path.join(home, '.gemini', 'GEMINI.md'), 'utf8').indexOf(GEMINI_MARKER_START) === -1);
  } finally {
    removeDir(home);
    removeDir(kitRoot);
  }
});
