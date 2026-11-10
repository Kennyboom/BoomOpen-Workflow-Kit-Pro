#!/usr/bin/env node
'use strict';

/**
 * Smoke test for the npm tarball (`npm run test:pack`, run in CI).
 *
 * 1. `npm pack` into a temp dir (lifecycle scripts disabled) and extract it.
 * 2. Check that every SKILL.md listed in matrix-skills/compact-index.json is in it.
 * 3. Install Claude Code into a sandboxed HOME/USERPROFILE/APPDATA, run the
 *    packaged `doctor` (it needs at least one installed platform), and check
 *    that the skills library and the Python helper scripts arrived.
 * 4. Uninstall and remove the temp dir.
 *
 * Never touches the real user profile: every home/config variable points into
 * the temp dir for the child processes.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { packToDir, sandboxEnv, makeTempDir, readCompactIndexPaths } = require('./npm-pack.js');

const CHILD_TIMEOUT_MS = 10 * 60 * 1000;
const SAMPLE_SIZE = 25;

function run(command, args, options) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: CHILD_TIMEOUT_MS, ...options });
  if (result.error) throw result.error;
  return result;
}

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

function runCli(packageDir, args, env) {
  const result = run(process.execPath, [path.join(packageDir, 'cli', 'install.js'), ...args], {
    cwd: packageDir,
    env,
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  assertOk(result.status === 0, `\`boomopen ${args.join(' ')}\` exited ${result.status}:\n${output}`);
  return output;
}

function sampleEvenly(items, count) {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

function verifyInstalledClaude(home, packageDir) {
  const claudeHome = path.join(home, '.claude');
  const libraryDir = path.join(claudeHome, 'skills_library');
  assertOk(fs.existsSync(libraryDir), `install claude did not create ${libraryDir}`);

  const indexPaths = readCompactIndexPaths(packageDir);
  const libraryPaths = indexPaths.filter((p) => p.startsWith('skills_library/'));
  for (const relPath of sampleEvenly(libraryPaths, SAMPLE_SIZE)) {
    const installed = path.join(claudeHome, ...relPath.split('/'));
    assertOk(fs.existsSync(installed), `indexed skill missing after install: ${installed}`);
  }

  const scriptsDir = path.join(claudeHome, 'skills', 'boomopen-workflow-kit', 'scripts');
  const packagedScripts = fs.readdirSync(path.join(packageDir, 'scripts')).filter((f) => f.endsWith('.py'));
  for (const script of packagedScripts) {
    assertOk(fs.existsSync(path.join(scriptsDir, script)), `helper script not installed: ${path.join(scriptsDir, script)}`);
  }
  return { indexed: indexPaths.length, library: libraryPaths.length, scripts: packagedScripts.length };
}

function main() {
  const tempRoot = makeTempDir('boomopen-pack-smoke-');
  try {
    const tarball = packToDir(tempRoot);
    console.log(`Packed ${path.basename(tarball)} (${fs.statSync(tarball).size} bytes)`);

    // Relative tarball name + cwd avoids GNU tar treating "C:" as a remote host.
    const extract = run('tar', ['-xzf', path.basename(tarball)], { cwd: tempRoot });
    assertOk(extract.status === 0, `tar failed: ${extract.stderr}`);
    const packageDir = path.join(tempRoot, 'package');

    const missing = readCompactIndexPaths(packageDir)
      .filter((relPath) => !fs.existsSync(path.join(packageDir, ...relPath.split('/'))));
    assertOk(missing.length === 0, `${missing.length} indexed SKILL.md file(s) not in the tarball, e.g. ${missing.slice(0, 5).join(', ')}`);

    const env = sandboxEnv(path.join(tempRoot, 'sandbox'));
    runCli(packageDir, ['install', 'claude'], env);
    runCli(packageDir, ['doctor'], env);
    console.log('doctor: healthy on the extracted tarball');
    const stats = verifyInstalledClaude(env.HOME, packageDir);
    console.log(
      `install claude: ${stats.library}/${stats.indexed} indexed library skills shipped, ` +
      `${stats.scripts} helper scripts installed`
    );

    runCli(packageDir, ['uninstall', 'claude'], env);
    console.log('uninstall claude: ok');
    console.log('Pack smoke test passed.');
    return 0;
  } catch (error) {
    console.error(`Pack smoke test failed: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

process.exitCode = main();
