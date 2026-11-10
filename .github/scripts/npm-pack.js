'use strict';

/**
 * Helpers shared by the packaging test (cli/packaging.test.js) and the
 * tarball smoke check (.github/scripts/pack-smoke.js).
 *
 * npm is invoked through its JavaScript entry point with the current Node
 * binary, so no shell is involved on Windows (paths with spaces stay safe and
 * Node's .cmd spawning restrictions do not apply).
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const NPM_MAX_BUFFER = 256 * 1024 * 1024;
const SANDBOX_ENV_KEYS = ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'XDG_CONFIG_HOME'];

function resolveNpmCli() {
  const candidates = [];
  const execPath = process.env.npm_execpath;
  if (execPath && /npm-cli\.js$/i.test(execPath)) candidates.push(execPath);
  const nodeDir = path.dirname(process.execPath);
  candidates.push(path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'));
  candidates.push(path.join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'));
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

/**
 * Run npm with the given arguments and return { status, stdout, stderr }.
 * Throws when npm cannot be located or started.
 */
function runNpm(args, options = {}) {
  const npmCli = resolveNpmCli();
  const spawnOptions = {
    cwd: options.cwd || REPO_ROOT,
    env: options.env || process.env,
    encoding: 'utf8',
    maxBuffer: NPM_MAX_BUFFER,
  };
  const result = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], spawnOptions)
    : spawnSync('npm', args, { ...spawnOptions, shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function parsePackJson(stdout) {
  const start = stdout.indexOf('[');
  if (start === -1) throw new Error(`npm pack printed no JSON:\n${stdout.slice(0, 500)}`);
  const parsed = JSON.parse(stdout.slice(start));
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('npm pack returned an empty result');
  return parsed[0];
}

/**
 * Return the npm pack manifest ({ entryCount, unpackedSize, files: [{ path }] })
 * without writing a tarball. Lifecycle scripts are never run.
 */
function packDryRun() {
  const result = runNpm(['pack', '--dry-run', '--json', '--ignore-scripts']);
  if (result.status !== 0) throw new Error(`npm pack --dry-run failed:\n${result.stderr}`);
  return parsePackJson(result.stdout);
}

/**
 * Write the tarball into destDir and return its absolute path.
 */
function packToDir(destDir) {
  const result = runNpm(['pack', '--json', '--ignore-scripts', '--pack-destination', destDir]);
  if (result.status !== 0) throw new Error(`npm pack failed:\n${result.stderr}`);
  const manifest = parsePackJson(result.stdout);
  return path.join(destDir, manifest.filename);
}

/**
 * Build an environment whose home and config folders all live under sandboxRoot,
 * so nothing the CLI does can touch the real user profile.
 */
function sandboxEnv(sandboxRoot) {
  const env = { ...process.env };
  const home = path.join(sandboxRoot, 'home');
  for (const key of SANDBOX_ENV_KEYS) {
    // HOME and USERPROFILE must agree so os.homedir() is sandboxed on every OS.
    const dir = key === 'USERPROFILE' ? home : path.join(sandboxRoot, key.toLowerCase());
    fs.mkdirSync(dir, { recursive: true });
    env[key] = dir;
  }
  return env;
}

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function readCompactIndexPaths(root) {
  const indexFile = path.join(root, 'matrix-skills', 'compact-index.json');
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const entries = Object.values(index && typeof index.skills === 'object' ? index.skills : {});
  return entries
    .map((entry) => (entry && typeof entry.path === 'string' ? entry.path : null))
    .filter(Boolean);
}

module.exports = {
  REPO_ROOT,
  runNpm,
  packDryRun,
  packToDir,
  sandboxEnv,
  makeTempDir,
  readCompactIndexPaths,
};
