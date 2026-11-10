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

const { registerClaudeHook, unregisterClaudeHook } = require('./hook-registration.js');

const HOOK_SCRIPT = '/x/.claude/skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs';
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
