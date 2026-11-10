/**
 * Regression test: a <file>.boomopen-backup left by an earlier install cycle is never restored by a
 * later uninstall (it would bring back instructions the user had removed). Runs in a temp folder.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { installInstructionFile, uninstallInstructionFile } = require('./instruction-files.js');

const KIT_TEXT = '# BoomOpen Workflow Kit\nkit rules\n';
const OLD_RULES = '# old rules A\n- use var everywhere\n';

test('a stale instruction-file backup from an earlier install cycle is retired, never restored', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-instr-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'CLAUDE.md');

  fs.writeFileSync(file, OLD_RULES, 'utf8');
  installInstructionFile(file, KIT_TEXT); // backup holds the old rules
  const withKit = fs.readFileSync(file, 'utf8').replace(OLD_RULES.trimEnd(), '# rules B');
  fs.writeFileSync(file, withKit, 'utf8');
  assert.equal(uninstallInstructionFile(file).action, 'stripped');
  assert.equal(fs.readFileSync(file, 'utf8'), '# rules B\n');

  fs.unlinkSync(file); // the user deletes their file, then installs again
  const reinstall = installInstructionFile(file, KIT_TEXT);
  assert.equal(reinstall.action, 'created');
  assert.ok(reinstall.retiredBackup, 'the stale backup is renamed');
  assert.equal(fs.readFileSync(reinstall.retiredBackup, 'utf8'), OLD_RULES, 'and kept');

  assert.equal(uninstallInstructionFile(file).action, 'removed');
  assert.equal(fs.existsSync(file), false, 'the obsolete rules are not brought back');
});
