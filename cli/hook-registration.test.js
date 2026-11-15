/**
 * Regression tests: unregistering the Claude Code hook restores settings.json byte-for-byte
 * (UTF-8 BOM, CRLF, an empty object), never deletes a settings.json the user had, and keeps a
 * symlinked settings.json a link. All work happens in temp folders.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  registerClaudeHook,
  unregisterClaudeHook,
  registerAntigravityHook,
  unregisterAntigravityHook,
  isAntigravityHookRegistered,
} = require('./hook-registration.js');

const HOOK_SCRIPT = '/x/.claude/skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs';
const AGY_HOOK_SCRIPT = '/x/.gemini/config/skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs';
const BOM = '﻿';

function withTempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-hookreg-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function roundTrip(settingsPath) {
  registerClaudeHook(settingsPath, HOOK_SCRIPT);
  assert.match(fs.readFileSync(settingsPath, 'utf8'), /validate-tool-call\.mjs/);
  assert.equal(unregisterClaudeHook(settingsPath), 'removed');
}

const BYTE_EXACT_CASES = {
  'BOM + CRLF object': `${BOM}{\r\n  "theme": "dark"\r\n}\r\n`,
  'BOM + empty object': `${BOM}{}\r\n`,
  'empty object': '{}\n',
  'empty file': '',
};

for (const [label, original] of Object.entries(BYTE_EXACT_CASES)) {
  test(`hook unregister restores a ${label} settings.json byte-for-byte`, (t) => {
    const settingsPath = path.join(withTempDir(t), 'settings.json');
    fs.writeFileSync(settingsPath, original, 'utf8');
    roundTrip(settingsPath);
    assert.equal(fs.existsSync(settingsPath), true, 'a settings.json the user had is never deleted');
    assert.equal(fs.readFileSync(settingsPath, 'utf8'), original);
    assert.equal(fs.existsSync(`${settingsPath}.boomopen-backup`), false, 'the backup is consumed');
  });
}

test('hook unregister deletes a settings.json the installer created for the hook only', (t) => {
  const settingsPath = path.join(withTempDir(t), 'settings.json');
  roundTrip(settingsPath);
  assert.equal(fs.existsSync(settingsPath), false);
});

test('hook unregister keeps a symlinked settings.json a link', (t) => {
  const dir = withTempDir(t);
  const realPath = path.join(dir, 'dotfiles-settings.json');
  const settingsPath = path.join(dir, 'settings.json');
  const original = '{\n  "model": "opus"\n}\n';
  fs.writeFileSync(realPath, original, 'utf8');
  try {
    fs.symlinkSync(realPath, settingsPath, 'file');
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      t.skip('creating symlinks is not permitted here');
      return;
    }
    throw error;
  }
  roundTrip(settingsPath);
  assert.equal(fs.lstatSync(settingsPath).isSymbolicLink(), true);
  assert.equal(fs.readFileSync(realPath, 'utf8'), original);
});

test('Antigravity hooks.json registration uses quote-free relative command for spaced home dirs, preserves sibling hooks, and restores BOM+CRLF backups', (t) => {
  const dir = withTempDir(t);
  const spacedGemini = path.join(dir, 'First Last', '.gemini');
  const freshHooks = path.join(spacedGemini, 'config', 'hooks.json');
  const spacedScript = path.join(spacedGemini, 'config', 'skills', 'boomopen-workflow-kit', 'hooks', 'validate-tool-call.mjs');
  assert.equal(isAntigravityHookRegistered(freshHooks), false);
  assert.equal(registerAntigravityHook(freshHooks, spacedScript), 'added');
  assert.equal(registerAntigravityHook(freshHooks, spacedScript), 'unchanged');
  assert.equal(isAntigravityHookRegistered(freshHooks), true);
  const written = JSON.parse(fs.readFileSync(freshHooks, 'utf8'));
  assert.equal(written['boomopen-guard'].enabled, true);
  assert.equal(written['boomopen-guard'].PreToolUse[0].matcher, 'run_command');
  assert.equal(
    written['boomopen-guard'].PreToolUse[0].hooks[0].command,
    'node ./skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs',
    'uses quote-free relative path from hooks.json folder so Windows cmd /c never breaks on spaced usernames'
  );
  assert.equal(unregisterAntigravityHook(freshHooks), 'removed');
  assert.equal(fs.existsSync(freshHooks), false, 'fresh hooks.json created only for the hook is deleted');

  const existingHooks = path.join(dir, 'existing-hooks.json');
  const siblingOriginal = `${BOM}{\r\n  "lint-checker": {\r\n    "PostToolUse": [\r\n      { "matcher": "run_command", "hooks": [{ "command": "./lint.sh" }] }\r\n    ]\r\n  }\r\n}\r\n`;
  fs.writeFileSync(existingHooks, siblingOriginal, 'utf8');
  assert.equal(registerAntigravityHook(existingHooks, AGY_HOOK_SCRIPT), 'added');
  const merged = JSON.parse(fs.readFileSync(existingHooks, 'utf8').replace(/^\uFEFF/, ''));
  assert.ok(merged['lint-checker'], 'sibling named hooks stay intact');
  assert.ok(merged['boomopen-guard'], 'boomopen-guard added');
  assert.equal(unregisterAntigravityHook(existingHooks), 'removed');
  assert.equal(fs.readFileSync(existingHooks, 'utf8'), siblingOriginal, 'restores BOM + CRLF hooks.json byte-for-byte');
  assert.equal(unregisterAntigravityHook(existingHooks), 'missing');
});
