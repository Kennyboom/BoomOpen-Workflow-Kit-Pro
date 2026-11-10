'use strict';

/**
 * Content integrity checks for the Markdown/YAML the kit ships (read-only, no install, no network):
 * clean characters, native tool vocabulary per platform, install paths that exist after install,
 * install instructions that never point at the unpublished npm package, skill counts that match
 * the disk, valid matrix YAML structure and README anchors that resolve.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_DIRS = ['commands', 'rules', 'agents', 'platforms', 'documents', 'i18n', 'matrix-skills'];
const ROOT_DOCS = ['AGENT.md', 'CLAUDE.md', 'COPILOT.md', 'README.md', 'SKILL.md'];
const TEXT_FILE = /\.(md|mdc|toml|ya?ml|json)$|\.cursorrules$/;
const BAD_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0080-\u009F�]/;
const NON_ANTIGRAVITY_ENTRY_FILES = [
  'AGENT.md',
  'CLAUDE.md',
  'CODEX.md',
  'COPILOT.md',
  'CURSOR.md',
  'platforms/claude/CLAUDE.md',
  'platforms/codex/CODEX.md',
  'platforms/copilot/boomopen-workflow-kit.agent.md',
  'platforms/cursor/.cursorrules',
  'platforms/cursor/rules/boomopen-workflow-kit.mdc',
];
const ANTIGRAVITY_ONLY = /invoke_subagent\(|TypeName|define_subagent|flash_lite|Model: "flash"|Pro High|PRO HIGH/;
const SETTINGS_BLOCK = /<!-- BOOMOPEN-SETTINGS-START -->[\s\S]*?<!-- BOOMOPEN-SETTINGS-END -->/;
const STALE_SKILL_COUNTS = /(?<![\d,.])1[,. ]?4(?:30|50|70|71)\+?(?!\d)/;
const UNPUBLISHED_INSTALL = /npm (?:install|i) -g @boomopen|npx (?:-y )?(?:@boomopen|boomopen-workflow-kit)|npm run settings -- [^\n]*--project/;

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (entry.isFile() && TEXT_FILE.test(entry.name)) out.push(full);
  }
  return out;
}

function contentFiles() {
  const files = CONTENT_DIRS.flatMap((dir) => listFiles(path.join(REPO_ROOT, dir)));
  return files.concat(ROOT_DOCS.map((name) => path.join(REPO_ROOT, name)));
}

function read(relOrAbs) {
  return fs.readFileSync(path.isAbsolute(relOrAbs) ? relOrAbs : path.join(REPO_ROOT, relOrAbs), 'utf8');
}

function rel(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

/** Lines of `text` that match `pattern`, as "file:line: text" strings. */
function grepLines(file, text, pattern, skip = () => false) {
  return text.split(/\r?\n/)
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => pattern.test(line) && !skip(line))
    .map(({ line, i }) => `${rel(file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
}

test('shipped content has no control characters, mojibake or U+FFFD', () => {
  const offenders = contentFiles().filter((file) => BAD_CHARS.test(read(file))).map(rel);
  assert.deepEqual(offenders, []);
});

test('non-Antigravity entry files use their native tool names outside the settings block and tool table (M12, M55)', () => {
  const offenders = NON_ANTIGRAVITY_ENTRY_FILES.flatMap((file) => {
    const body = read(file).replace(SETTINGS_BLOCK, '');
    // Rows of the "TOOL NAMES ON <platform>" table name the Antigravity tools on purpose.
    return grepLines(file, body, ANTIGRAVITY_ONLY, (line) => line.startsWith('| `'));
  });
  assert.deepEqual(offenders, []);
});

test('installed commands, rules and agents only use paths that exist after install (H17, M48, M54, M58, M64)', () => {
  const rules = [
    // Relative .agent/ paths are never rewritten by the installer.
    /(?<![~\w])\.agent\//,
    // The CLI lives in the framework folder, not in the user's project.
    /(?<![\w/.-])node cli\/install\.js (?:check|doctor|settings)/,
    // The skills vault is per tool (~/.{TOOL}/skills_library/), not the Antigravity folder.
    /~\/\.gemini\/config\/skills_library/,
  ];
  const files = ['commands', 'rules', 'agents'].flatMap((dir) => listFiles(path.join(REPO_ROOT, dir)));
  const offenders = files.flatMap((file) => rules.flatMap((pattern) => grepLines(file, read(file), pattern)));
  assert.deepEqual(offenders, []);
  for (const script of ['auto_preview.py', 'session_manager.py']) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, 'scripts', script)), `scripts/${script} is referenced by commands`);
  }
});

test('install instructions never point at the unpublished npm package (decision 1, M23, M62)', () => {
  const offenders = contentFiles().flatMap((file) => grepLines(file, read(file), UNPUBLISHED_INSTALL));
  assert.deepEqual(offenders, []);
});

test('skill counts match the disk: 22 core + library = compact-index total (L42, L45, L49)', () => {
  const countSkillDirs = (dir) => fs.readdirSync(path.join(REPO_ROOT, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(REPO_ROOT, dir, entry.name, 'SKILL.md'))).length;
  const core = countSkillDirs('skills');
  const library = countSkillDirs('skills_library');
  const index = JSON.parse(read('matrix-skills/compact-index.json'));
  assert.equal(index.totalSkills, core + library, 'compact-index totalSkills = core + library');
  assert.equal(Object.keys(index.skills).length, index.totalSkills);
  const fmt = (n) => n.toLocaleString('en-US');
  for (const file of ['README.md', 'AGENT.md', 'platforms/claude/CLAUDE.md']) {
    const text = read(file);
    assert.ok(text.includes(fmt(index.totalSkills)), `${file} names the indexed total ${fmt(index.totalSkills)}`);
    assert.ok(text.includes(fmt(library)), `${file} names the library count ${fmt(library)}`);
  }
  const stale = contentFiles().flatMap((file) => grepLines(file, read(file), STALE_SKILL_COUNTS));
  assert.deepEqual(stale, []);
});

test('matrix domain files are well-formed lists whose skill_count matches their entries (L42, L46)', () => {
  const dir = path.join(REPO_ROOT, 'matrix-skills');
  for (const name of fs.readdirSync(dir).filter((file) => /^[a-z].*\.yaml$/.test(file))) {
    const text = read(path.join(dir, name));
    const entries = text.match(/^ {2}- skill_id: /gm) || [];
    assert.doesNotMatch(text, /^- skill_id: /m, `${name}: list items must be indented under skills:`);
    assert.doesNotMatch(text, /^\s*- skill_id: \d+\s*$/m, `${name}: numeric skill ids must be quoted`);
    const declared = /^skill_count: (\d+)$/m.exec(text);
    assert.ok(declared, `${name}: skill_count missing`);
    assert.equal(Number(declared[1]), entries.length, `${name}: skill_count`);
  }
});

function githubSlug(heading) {
  return heading.trim().toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

test('README and i18n in-page links resolve to a heading or an explicit id (L50)', () => {
  const files = ['README.md', ...fs.readdirSync(path.join(REPO_ROOT, 'i18n')).map((name) => `i18n/${name}`)];
  const broken = [];
  for (const file of files) {
    const text = read(file);
    const ids = new Set([...text.matchAll(/\b(?:id|name)="([^"]+)"/g)].map((m) => m[1]));
    let inFence = false;
    for (const line of text.split(/\r?\n/)) {
      if (/^\s*```/.test(line)) inFence = !inFence;
      const heading = !inFence && /^#{1,6}\s+(.*)$/.exec(line);
      if (heading) ids.add(githubSlug(heading[1].replace(/`/g, '')));
    }
    for (const m of text.matchAll(/href="#([^"]+)"|\]\(#([^)]+)\)/g)) {
      const anchor = decodeURIComponent(m[1] || m[2]);
      if (!ids.has(anchor)) broken.push(`${file}#${anchor}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('routes only name commands that exist (L43)', () => {
  const files = ['commands', 'rules', 'agents'].flatMap((dir) => listFiles(path.join(REPO_ROOT, dir)))
    .concat(NON_ANTIGRAVITY_ENTRY_FILES.map((file) => path.join(REPO_ROOT, file)));
  const phantom = /(?<![\w./~-])\/(?:create|enhance|implement|config)\b(?![./-])/;
  const offenders = files.flatMap((file) => grepLines(file, read(file), phantom));
  assert.deepEqual(offenders, []);
});
