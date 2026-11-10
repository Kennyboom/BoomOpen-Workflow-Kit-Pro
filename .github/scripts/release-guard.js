#!/usr/bin/env node
'use strict';

/**
 * semantic-release `verifyConditions` guard (wired through @semantic-release/exec).
 *
 * semantic-release ignores package.json "version" and starts at 1.0.0 when no
 * release tag is reachable from HEAD. This repository already shipped 5.x by
 * hand, so a first automated run would publish 1.0.0 and prepend it above
 * "## [5.5.0]" in CHANGELOG.md. Abort unless a baseline tag such as v5.5.0
 * exists and matches the current major version.
 */

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TAG_PATTERN = /^v(\d+)\.(\d+)\.(\d+)$/;

function readMergedTags() {
  const result = spawnSync('git', ['tag', '--list', 'v*', '--merged', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git tag failed: ${(result.stderr || '').trim()}`);
  }
  return result.stdout.split(/\r?\n/).map((tag) => tag.trim()).filter((tag) => TAG_PATTERN.test(tag));
}

function main() {
  const { version } = require(path.join(REPO_ROOT, 'package.json'));
  const packageMajor = Number(String(version).split('.')[0]);

  let tags;
  try {
    tags = readMergedTags();
  } catch (error) {
    console.error(`Release guard: cannot read git tags (${error instanceof Error ? error.message : String(error)}).`);
    return 1;
  }

  const sameMajor = tags.filter((tag) => Number(TAG_PATTERN.exec(tag)[1]) === packageMajor);
  if (sameMajor.length === 0) {
    console.error(
      `Release guard: no v${packageMajor}.x.y tag is reachable from HEAD (package.json is ${version}).\n` +
      `semantic-release would compute 1.0.0 as the next version. Tag the current release first,\n` +
      `for example: git tag v${version} <commit> && git push origin v${version}. See .github/RELEASING.md.`
    );
    return 1;
  }

  console.log(`Release guard: baseline tag(s) found: ${sameMajor.join(', ')}.`);
  return 0;
}

process.exitCode = main();
