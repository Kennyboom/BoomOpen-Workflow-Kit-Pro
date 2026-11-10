'use strict';

/**
 * Static packaging checks (fast, no npm/network). The full tarball smoke test
 * (npm pack + extract + doctor + install in a sandboxed HOME) lives in
 * .github/scripts/pack-smoke.js and runs in CI via `npm run test:pack`.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const REQUIRED_SHIPPED_DIRS = [
  'cli/', 'agents/', 'commands/', 'rules/', 'matrix-skills/', 'skills/',
  'skills_library/', 'scripts/', 'documents/', 'i18n/', 'platforms/',
];

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8'));
}

function negatedDirPrefixes(files) {
  return files
    .filter((entry) => entry.startsWith('!') && entry.endsWith('/') && !entry.includes('*'))
    .map((entry) => entry.slice(1));
}

function compactIndexPaths() {
  const index = readJson(path.join('matrix-skills', 'compact-index.json'));
  return Object.values(index.skills || {}).map((entry) => entry.path).filter((p) => typeof p === 'string');
}

test('package.json "files" ships every runtime folder, including skills_library/ and scripts/', () => {
  const pkg = readJson('package.json');
  for (const dir of REQUIRED_SHIPPED_DIRS) {
    assert.ok(pkg.files.includes(dir), `"files" is missing ${dir}`);
    assert.ok(fs.existsSync(path.join(REPO_ROOT, dir)), `${dir} listed in "files" does not exist`);
  }
  for (const entry of pkg.files.filter((e) => !e.startsWith('!') && !e.endsWith('/'))) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, entry)), `root file ${entry} listed in "files" does not exist`);
  }
});

test('no indexed SKILL.md is excluded from the package by a negated "files" entry', () => {
  const pkg = readJson('package.json');
  const excluded = negatedDirPrefixes(pkg.files);
  const indexPaths = compactIndexPaths();
  assert.ok(indexPaths.length > 0, 'compact-index.json has no skill paths');
  for (const skillPath of indexPaths) {
    const top = `${skillPath.split('/')[0]}/`;
    assert.ok(pkg.files.includes(top), `${skillPath} lives outside the shipped folders`);
    const hit = excluded.find((prefix) => skillPath.startsWith(prefix));
    assert.equal(hit, undefined, `${skillPath} is excluded by "!${hit}"`);
  }
});

test('vault folders left out of the package are also skipped by the installer copy (L53)', () => {
  const { listSourceFiles } = require('./copy-engine.js');
  const pkg = readJson('package.json');
  const vaultPrefix = 'skills_library/';
  const excluded = negatedDirPrefixes(pkg.files)
    .filter((prefix) => prefix.startsWith(vaultPrefix))
    .map((prefix) => prefix.slice(vaultPrefix.length));
  assert.ok(excluded.length > 0, 'expected demo/benchmark folders to be excluded from the package');
  const installed = listSourceFiles(path.join(REPO_ROOT, 'skills_library')).map(({ rel }) => rel.split(path.sep).join('/'));
  for (const prefix of excluded) {
    const leaked = installed.find((rel) => rel.startsWith(prefix));
    assert.equal(leaked, undefined, `installer would still copy ${vaultPrefix}${leaked}`);
  }
});

test('npm scripts are portable: no husky prepare, no shell-quoted echo, no no-op lint:md', () => {
  const pkg = readJson('package.json');
  assert.equal(pkg.scripts.prepare, undefined, 'prepare must not run husky (fails on Windows cmd.exe, no hooks exist)');
  assert.equal(pkg.devDependencies?.husky, undefined, 'husky is unused');
  assert.equal(pkg.scripts['lint:md'], undefined, 'lint:md was an echo that always passed');
  for (const [name, script] of Object.entries(pkg.scripts)) {
    assert.doesNotMatch(script, /\becho\s+'/, `script "${name}" uses a single-quoted echo (prints quotes under cmd.exe)`);
    assert.doesNotMatch(script, /\|\|\s*true\b/, `script "${name}" relies on POSIX "true"`);
  }
  assert.match(pkg.scripts.test, /cli\/install\.test\.js/);
  assert.match(pkg.scripts.test, /cli\/user-files\.test\.js/);
});

test('package-lock.json matches package.json identity and dev dependencies', () => {
  const pkg = readJson('package.json');
  const lock = readJson('package-lock.json');
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  const root = lock.packages[''];
  assert.equal(root.name, pkg.name);
  assert.equal(root.version, pkg.version);
  assert.deepEqual(Object.keys(root.devDependencies || {}).sort(), Object.keys(pkg.devDependencies || {}).sort());
});

test('release config cannot publish to npm or cut an accidental 1.0.0', () => {
  const release = readJson('.releaserc.json');
  const plugins = release.plugins.map((p) => (Array.isArray(p) ? p : [p, {}]));
  const npmPlugin = plugins.find(([name]) => name === '@semantic-release/npm');
  assert.ok(npmPlugin, '@semantic-release/npm should stay configured to keep package.json/lockfile versions in sync');
  assert.equal(npmPlugin[1].npmPublish, false, 'npm publishing must stay off until the maintainers decide');

  const execPlugin = plugins.find(([name]) => name === '@semantic-release/exec');
  assert.ok(execPlugin, 'release guard must run through @semantic-release/exec');
  assert.match(execPlugin[1].verifyConditionsCmd || '', /release-guard\.js/);
  assert.ok(fs.existsSync(path.join(REPO_ROOT, '.github', 'scripts', 'release-guard.js')));

  const gitPlugin = plugins.find(([name]) => name === '@semantic-release/git');
  assert.ok(gitPlugin[1].assets.includes('package-lock.json'), 'release commit must include package-lock.json');
});

test('THIRD_PARTY_NOTICES.md is shipped and matches the vendored skills (M53)', () => {
  const pkg = readJson('package.json');
  assert.ok(pkg.files.includes('THIRD_PARTY_NOTICES.md'), 'THIRD_PARTY_NOTICES.md must be in "files"');
  const result = spawnSync(process.execPath, [path.join(REPO_ROOT, '.github', 'scripts', 'third-party-notices.js'), '--check'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  const vault = path.join(REPO_ROOT, 'skills_library');
  for (const name of fs.readdirSync(vault)) {
    const licensePath = path.join(vault, name, 'LICENSE.txt');
    if (!fs.existsSync(licensePath)) continue;
    const text = fs.readFileSync(licensePath, 'utf8');
    assert.doesNotMatch(text, /All rights reserved|may not[^.]*distribute/i, `${name} ships a non-redistributable license`);
  }
});
