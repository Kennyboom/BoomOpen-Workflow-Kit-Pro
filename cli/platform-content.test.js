'use strict';

/**
 * Static checks on the platform bundles in platforms/ (no install, no network):
 * generated Codex command skills, clean frontmatter, role TOMLs that inherit the user's model,
 * and entry files the installer recognises as kit-owned.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { isKitOwnedText } = require('./markers.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const PLATFORMS_DIR = path.join(REPO_ROOT, 'platforms');
const CODEX_SKILLS_DIR = path.join(PLATFORMS_DIR, 'codex', 'skills');
const C1_CONTROL_CHARS = /[\u0080-\u009F]/;
const TEXT_EXTENSIONS = new Set(['.md', '.mdc', '.toml', '.yaml', '.yml', '.json', '']);

function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

test('Codex command skills are generated from commands/*.md and up to date (L10, L11, M11)', () => {
  const script = path.join(REPO_ROOT, '.github', 'scripts', 'generate-codex-skills.js');
  const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const commands = fs.readdirSync(path.join(REPO_ROOT, 'commands')).filter((name) => name.endsWith('.md'));
  for (const name of commands) {
    const skillDir = path.join(CODEX_SKILLS_DIR, `boomopen-workflow-kit-${name.slice(0, -3)}`);
    assert.ok(fs.existsSync(path.join(skillDir, 'SKILL.md')), `missing Codex skill for commands/${name}`);
    const yaml = fs.readFileSync(path.join(skillDir, 'agents', 'openai.yaml'), 'utf8');
    assert.match(yaml, /^interface:\n {2}display_name: /m, `${name}: openai.yaml must nest keys under interface:`);
    assert.match(yaml, /^policy:\n {2}allow_implicit_invocation: /m, `${name}: openai.yaml must nest keys under policy:`);
  }
});

test('platform files contain no C1 control characters (mojibake) (M11, M59)', () => {
  const offenders = listFiles(PLATFORMS_DIR)
    .filter((file) => TEXT_EXTENSIONS.has(path.extname(file)))
    .filter((file) => C1_CONTROL_CHARS.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(REPO_ROOT, file));
  assert.deepEqual(offenders, []);
});

test('Codex role TOMLs do not pin a model, so roles inherit the configured one (M60)', () => {
  const agentsDir = path.join(PLATFORMS_DIR, 'codex', 'agents');
  for (const name of fs.readdirSync(agentsDir).filter((file) => file.endsWith('.toml'))) {
    const text = fs.readFileSync(path.join(agentsDir, name), 'utf8');
    assert.doesNotMatch(text, /^model\s*=/m, `${name} pins a model`);
  }
});

test('every platform entry file is recognised as kit-owned and starts with valid frontmatter (L12)', () => {
  const entryFiles = [
    'antigravity/GEMINI.md',
    'antigravity/AntigravityGlobal.agent.md',
    'claude/CLAUDE.md',
    'codex/CODEX.md',
    'copilot/boomopen-workflow-kit.agent.md',
    'cursor/.cursorrules',
    'cursor/rules/boomopen-workflow-kit.mdc',
  ];
  for (const rel of entryFiles) {
    const text = fs.readFileSync(path.join(PLATFORMS_DIR, rel), 'utf8');
    assert.ok(isKitOwnedText(text), `${rel} must carry a kit header the installer recognises`);
    assert.doesNotMatch(text, /^```/, `${rel} must not start inside a code fence`);
  }
  const mdc = fs.readFileSync(path.join(PLATFORMS_DIR, 'cursor', 'rules', 'boomopen-workflow-kit.mdc'), 'utf8');
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(mdc);
  assert.ok(frontmatter, '.mdc needs frontmatter');
  const keys = frontmatter[1].split(/\r?\n/).map((line) => line.split(':')[0].trim()).filter(Boolean);
  assert.deepEqual(keys.sort(), ['alwaysApply', 'description', 'globs']);
});

test('platform entry files name the native tools for their platform (M12, M55)', () => {
  const expectations = {
    'claude/CLAUDE.md': /WebSearch/,
    'codex/CODEX.md': /spawn_agent/,
    'copilot/boomopen-workflow-kit.agent.md': /runSubagent/,
    'cursor/rules/boomopen-workflow-kit.mdc': /TOOL NAMES ON CURSOR/,
  };
  for (const [rel, pattern] of Object.entries(expectations)) {
    assert.match(fs.readFileSync(path.join(PLATFORMS_DIR, rel), 'utf8'), pattern, rel);
  }
});
