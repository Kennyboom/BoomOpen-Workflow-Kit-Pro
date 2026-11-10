/**
 * Content lint for the kit's Markdown/entrypoint files (structure, limits, legacy references).
 * Behaviour tests live in install.test.js, hook-guard.test.js, user-files.test.js and cli-e2e.test.js.
 * Limits come from cli/doctor.js (DOC_LINE_LIMITS) so the tests and `boomopen doctor` never disagree.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { MAX_ENTRY_LINES, DOC_LINE_LIMITS } = require('./doctor.js');
const { detectMojibake } = require('./doctor-markdown.js');
const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./settings.js');
const { REPO_ROOT, countLines } = require('./sandbox.test-helper.js');

const ENTRY_FILES = [
  'GEMINI.md',
  'CLAUDE.md',
  'CODEX.md',
  'COPILOT.md',
  'CURSOR.md',
  'AGENT.md',
  'platforms/antigravity/GEMINI.md',
  'platforms/antigravity/AntigravityGlobal.agent.md',
  'platforms/claude/CLAUDE.md',
  'platforms/codex/CODEX.md',
  'platforms/copilot/boomopen-workflow-kit.agent.md',
  'platforms/cursor/.cursorrules',
  'platforms/cursor/rules/boomopen-workflow-kit.mdc',
];
const I18N_LANGS = ['vi', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ru', 'hi', 'ar', 'id', 'th', 'tr', 'it'];
const I18N_MIN_LINES = 130;
const RULES_MAX = DOC_LINE_LIMITS.rules;
const COMMANDS_MAX = DOC_LINE_LIMITS.commands;
const I18N_MAX = DOC_LINE_LIMITS.i18n;
const DOCUMENTED_COMMANDS = [
  '/cook', '/code', '/plan', '/fix', '/debug', '/test', '/review', '/design',
  '/docs', '/deploy', '/research', '/brainstorm', '/report', '/autopilot', '/conduct',
  '/orchestrate', '/save', '/settings',
];
const PLATFORM_NAMES = ['Antigravity (Gemini)', 'Claude Code', 'OpenAI Codex', 'Cursor', 'GitHub Copilot'];

function readRepo(relPath) {
  return fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8');
}

test(`platform entrypoints stay <= ${MAX_ENTRY_LINES} lines and carry the v5.5 contract and settings markers`, () => {
  for (const relPath of ENTRY_FILES) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, relPath)), `Expected ${relPath} to exist`);
    const content = readRepo(relPath);
    const lineCount = countLines(content);
    assert.ok(lineCount <= MAX_ENTRY_LINES, `${relPath}: ${lineCount} lines > ${MAX_ENTRY_LINES}`);
    for (const marker of ['v5.5', 'MODE A', 'MODE B']) {
      assert.ok(content.includes(marker), `Expected ${relPath} to include ${marker}`);
    }
    assert.ok(/pragmatic 2-tier/i.test(content), `Expected ${relPath} to include Pragmatic 2-Tier Coding Standards`);
    assert.ok(
      content.includes(SETTINGS_MARKER_START) && content.includes(SETTINGS_MARKER_END),
      `Expected ${relPath} to contain BOOMOPEN-SETTINGS-START/END markers`
    );
    assert.ok(
      !content.includes('commands/{cmd}/{variant}.md') && !content.includes('commands/{cmd}/team.md'),
      `Expected ${relPath} not to contain legacy nested command paths`
    );
    assert.ok(!content.includes('DES-G1..G5'), `Expected ${relPath} to use DESIGN-G1..G4 instead of stale DES-G1..G5`);
  }
  const identicalPairs = [
    ['GEMINI.md', 'platforms/antigravity/GEMINI.md'],
    ['CLAUDE.md', 'platforms/claude/CLAUDE.md'],
    ['CODEX.md', 'platforms/codex/CODEX.md'],
    ['CURSOR.md', 'platforms/cursor/.cursorrules'],
  ];
  for (const [rootEntry, platformEntry] of identicalPairs) {
    assert.equal(
      readRepo(rootEntry).replace(/\r\n/g, '\n'),
      readRepo(platformEntry).replace(/\r\n/g, '\n'),
      `Expected ${rootEntry} and ${platformEntry} to stay in sync`
    );
  }
});

test('root Markdown files and documents/**/*.md contain no mojibake or C1 control characters', () => {
  const c1OrReplacement = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD]/;
  const rootMds = fs.readdirSync(REPO_ROOT)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(REPO_ROOT, name));
  function walkDocs(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkDocs(full);
      return entry.name.endsWith('.md') ? [full] : [];
    });
  }
  for (const file of [...rootMds, ...walkDocs(path.join(REPO_ROOT, 'documents'))]) {
    const rel = path.relative(REPO_ROOT, file);
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(!c1OrReplacement.test(content), `${rel} contains control characters or U+FFFD`);
    const garbled = detectMojibake(content);
    assert.equal(garbled, null, `${rel} contains mojibake "${garbled}"`);
  }
});

test('repository contains no legacy names, personal paths or leaked secrets', () => {
  for (const legacy of ['code-' + 'assistants', 'global_replace.py', 'test-boom']) {
    assert.ok(!fs.existsSync(path.join(REPO_ROOT, legacy)), `${legacy} must not exist at the repo root`);
  }
  assert.ok(fs.existsSync(path.join(REPO_ROOT, 'SECURITY.md')), 'SECURITY.md must exist at repository root');

  const dirsToScan = ['agents', 'cli', 'commands', 'documents', 'i18n', 'platforms', 'rules', 'scripts', 'skills', 'web/src'];
  const rootFiles = [
    'package.json', 'LICENSE', 'SECURITY.md', 'README.md', 'SKILL.md', 'CHANGELOG.md', 'AGENT.md',
    'AGENT-TEMPLATE.md', 'CLAUDE.md', 'CODEX.md', 'COPILOT.md', 'CURSOR.md', 'GEMINI.md',
  ];
  const SCANNED_EXT = /\.(md|js|ts|tsx|json|py|toml|yaml|yml|mdc)$/i;
  function walk(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name === '__pycache__' ? [] : walk(full);
      return SCANNED_EXT.test(entry.name) ? [full] : [];
    });
  }
  const allFiles = [
    ...rootFiles.map((f) => path.join(REPO_ROOT, f)).filter((f) => fs.existsSync(f)),
    ...dirsToScan.flatMap((d) => walk(path.join(REPO_ROOT, d))),
  ];

  // Patterns are assembled at runtime so this file never matches itself.
  const personalName = new RegExp('Kel' + 'ly\\s+Cla' + 'rk', 'i');
  const forbidden = [
    { label: 'legacy assistants dir', regex: new RegExp('code-' + 'assistants') },
    { label: 'legacy kit name', regex: new RegExp('antigravity\\s+' + 'kit', 'i') },
    { label: 'Personal user name', regex: personalName },
    { label: 'Personal Windows user path', regex: new RegExp('C:\\\\' + 'Users\\\\[A-Za-z]') },
    { label: 'Legacy author', regex: new RegExp('\\bNam' + 'CH\\b') },
    { label: 'Legacy scope', regex: new RegExp('@nam' + 'ch\\b', 'i') },
    { label: 'Legacy repo', regex: new RegExp('hainam' + 'chung', 'i') },
    { label: 'Legacy repo slug', regex: new RegExp('anthropics/' + 'boomopen-workflow-kit', 'i') },
    {
      label: 'Secret token pattern',
      regex: new RegExp(
        '(?:gh' + 'p_[A-Za-z0-9]{20,}|github_' + 'pat_[A-Za-z0-9_]{20,}|AI' + 'za[0-9A-Za-z-_]{35}|AK' +
          'IA[0-9A-Z]{16}|BEGIN RSA ' + 'PRIVATE KEY|BEGIN OPENSSH ' + 'PRIVATE KEY)'
      ),
    },
  ];
  // The doctor modules (cli/doctor.js, cli/doctor-*.js) legitimately name the legacy folders they detect.
  const isDoctorModule = (file) =>
    path.dirname(file) === path.join(REPO_ROOT, 'cli') && /^doctor(?:-[\w-]+)?\.js$/.test(path.basename(file));
  for (const file of allFiles) {
    if (isDoctorModule(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const chk of forbidden) {
      assert.ok(!chk.regex.test(content), `${path.relative(REPO_ROOT, file)} matches forbidden pattern: ${chk.label}`);
    }
  }
});

test(`rules/*.md are the 7 known rule files, each <= ${RULES_MAX} lines and free of legacy names`, () => {
  const rulesDir = path.join(REPO_ROOT, 'rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md')).sort();
  assert.deepEqual(ruleFiles, ['AGENTS.md', 'CORE.md', 'ERRORS.md', 'PHASES.md', 'REFERENCE.md', 'SKILLS.md', 'TEAMS.md']);
  for (const file of ruleFiles) {
    const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
    assert.ok(countLines(content) <= RULES_MAX, `rules/${file}: ${countLines(content)} lines > ${RULES_MAX}`);
    assert.ok(!content.includes('agent-assistant'), `rules/${file} must not contain legacy 'agent-assistant'`);
  }
  const agentsContent = fs.readFileSync(path.join(rulesDir, 'AGENTS.md'), 'utf8');
  const requiredPhrases = [
    'QUALITY-FIRST MODEL POLICY',
    'Direct Plan-to-Executor Dispatch',
    'Active Sub-agent Session Registry',
    'OWNED_FILES',
    'SHARED_CONTRACT',
  ];
  for (const phrase of requiredPhrases) {
    assert.ok(agentsContent.includes(phrase), `rules/AGENTS.md must include ${phrase}`);
  }
});

test(`commands/ is flat (*.md + _ref/) and every command is <= ${COMMANDS_MAX} lines`, () => {
  const commandsDir = path.join(REPO_ROOT, 'commands');
  const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
  assert.deepEqual(entries.filter((e) => e.isDirectory()).map((e) => e.name), ['_ref']);
  for (const entry of entries.filter((e) => e.isFile() && e.name.endsWith('.md'))) {
    const lines = countLines(fs.readFileSync(path.join(commandsDir, entry.name), 'utf8'));
    assert.ok(lines <= COMMANDS_MAX, `commands/${entry.name}: ${lines} lines > ${COMMANDS_MAX}`);
  }
  const settingsCmd = readRepo('commands/settings.md');
  assert.ok(settingsCmd.includes('ask_question'));
  assert.ok(settingsCmd.includes('auto_team'));
});

test('16 i18n READMEs exist, are linked from README.md with HTML tags and document every command and platform', () => {
  const rootReadme = readRepo('README.md');
  assert.ok(
    !rootReadme.includes('## 🇻🇳 Tài Liệu Tiếng Việt') && !rootReadme.includes('Xem Video Bản Tiếng Việt'),
    'README.md must be English-only (translations live in i18n/)'
  );
  for (const pBlock of rootReadme.match(/<p>[\s\S]*?<\/p>/g) || []) {
    assert.ok(!/\]\(\.\//.test(pBlock) && !/\*\*[^*]+\*\*/.test(pBlock), 'README.md <p> blocks must use HTML <a>/<b>');
  }
  for (const lang of I18N_LANGS) {
    const relLink = `<a href="./i18n/README.${lang}.md">`;
    assert.ok(rootReadme.includes(relLink), `README.md must link ${relLink}`);
    const rel = `i18n/README.${lang}.md`;
    assert.ok(fs.existsSync(path.join(REPO_ROOT, rel)), `Expected ${rel} to exist`);
    const content = readRepo(rel);
    const lines = countLines(content);
    assert.ok(lines >= I18N_MIN_LINES && lines <= I18N_MAX, `${rel}: ${lines} lines`);
    assert.ok(content.includes('```mermaid') && content.includes('flowchart TD'), `${rel} needs the Mermaid flowchart`);
    assert.ok(content.includes('<a href="../README.md">'), `${rel} must link back to ../README.md`);
    for (const pBlock of content.match(/<p>[\s\S]*?<\/p>/g) || []) {
      assert.ok(!/\]\(\.\.?\//.test(pBlock) && !/\*\*[^*]+\*\*/.test(pBlock), `${rel} <p> blocks must use HTML tags`);
    }
    if (lang !== 'vi') {
      assert.ok(
        !content.includes('Xem Bản Tiếng Việt') && !content.includes('## 🎬 Official Launch Trailer'),
        `${rel} must not mix Vietnamese or untranslated English headers`
      );
    }
    for (const cmd of DOCUMENTED_COMMANDS) assert.ok(content.includes(cmd), `${rel} must document ${cmd}`);
    for (const plat of PLATFORM_NAMES) assert.ok(content.includes(plat), `${rel} must name ${plat}`);
  }
});
