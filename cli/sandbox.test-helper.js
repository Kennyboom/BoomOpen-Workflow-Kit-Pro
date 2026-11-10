'use strict';

/**
 * Shared helpers for tests that must never touch the developer's real profile.
 *
 * - sandboxEnv(home) points every home/config variable the CLI reads at a temp folder.
 * - buildFixtureKit() copies the kit without skills_library (fast, and nothing is written
 *   into the repository when the copied installer regenerates its compact index).
 * - runCli(kitRoot, home, args) runs the copied CLI inside the sandbox.
 *
 * Test-only module: it is not part of the installed CLI.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURE_DIRS = ['cli', 'agents', 'commands', 'rules', 'documents', 'matrix-skills', 'skills', 'platforms', 'scripts'];
const FIXTURE_FILES = ['README.md', 'SKILL.md', 'AGENT.md', 'CLAUDE.md', 'COPILOT.md', 'SECURITY.md', 'package.json'];
const CLI_TIMEOUT_MS = 240000;

/** Create a unique temp directory under os.tmpdir(). */
function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/** Remove a temp directory, ignoring files that are already gone. */
function removeDir(dir) {
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Environment variables that redirect every profile location the CLI resolves
 * (os.homedir() on all OSes, %APPDATA% / %LOCALAPPDATA% on Windows, XDG on Linux).
 * @param {string} home sandbox home folder
 * @returns {Record<string, string>}
 */
function sandboxEnv(home) {
  return {
    HOME: home,
    USERPROFILE: home,
    APPDATA: path.join(home, 'AppData', 'Roaming'),
    LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: path.join(home, '.config'),
  };
}

/** Copy the kit (without the 88 MB skills_library vault) into a temp folder. */
function buildFixtureKit() {
  const kitRoot = tempDir('boomopen-kit-');
  for (const dir of FIXTURE_DIRS) {
    const src = path.join(REPO_ROOT, dir);
    if (fs.existsSync(src)) {
      fs.cpSync(src, path.join(kitRoot, dir), {
        recursive: true,
        filter: (source) => !/__pycache__/.test(source),
      });
    }
  }
  for (const file of FIXTURE_FILES) {
    const src = path.join(REPO_ROOT, file);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(kitRoot, file));
  }
  return kitRoot;
}

/**
 * Run `node <kitRoot>/cli/install.js ...args` with a sandboxed profile.
 * @returns {{status: number|null, stdout: string, stderr: string}}
 */
function runCli(kitRoot, home, args, extraEnv = {}) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, 'cli', 'install.js'), ...args], {
    env: { ...process.env, ...sandboxEnv(home), ...extraEnv },
    encoding: 'utf8',
    input: '',
    timeout: CLI_TIMEOUT_MS,
  });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

/** Recursively list files under dir (no symlink following). */
function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

/** Count lines the way `wc -l` / editors do: a trailing newline does not start a new line. */
function countLines(content) {
  if (content === '') return 0;
  const parts = content.split(/\r?\n/);
  return /\n$/.test(content) ? parts.length - 1 : parts.length;
}

module.exports = {
  REPO_ROOT,
  tempDir,
  removeDir,
  sandboxEnv,
  buildFixtureKit,
  runCli,
  listFiles,
  countLines,
};
