#!/usr/bin/env node
'use strict';

/**
 * Cross-platform JavaScript syntax check used by `npm run lint`.
 *
 * Runs `node --check` on every CLI module, CLI test, shipped hook and
 * repository maintenance script, so new files are covered without editing
 * package.json. Exits non-zero when any file fails to parse.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCAN_ROOTS = ['cli', 'platforms', path.join('.github', 'scripts'), path.join('web', 'build')];
const SCRIPT_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const SKIPPED_DIRS = new Set(['node_modules', '.git']);

function collectScripts(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) files.push(...collectScripts(fullPath));
    } else if (entry.isFile() && SCRIPT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const files = SCAN_ROOTS.flatMap((root) => collectScripts(path.join(REPO_ROOT, root))).sort();
  const failures = [];
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      failures.push({ file: path.relative(REPO_ROOT, file), output: (result.stderr || result.error || '').toString() });
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`Syntax error in ${failure.file}\n${failure.output}`);
    }
    console.error(`JavaScript syntax check failed: ${failures.length} of ${files.length} file(s).`);
    return 1;
  }

  console.log(`JavaScript syntax valid (${files.length} files checked).`);
  return 0;
}

process.exitCode = main();
