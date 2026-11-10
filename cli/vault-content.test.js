'use strict';

/**
 * Read-only checks of the vendored skills vault (skills_library/): no proprietary licence terms
 * (H18), THIRD_PARTY_NOTICES.md is regenerated from the vault (M53), and every bundled-file
 * reference in a vault SKILL.md either exists or is listed in that skill's "Vault note" (M50).
 * No install, no network; the whole file is skipped when the vault is not part of this checkout.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const LIBRARY_DIR = path.join(REPO_ROOT, 'skills_library');
const HAS_LIBRARY = fs.existsSync(LIBRARY_DIR);
const SKIP_REASON = HAS_LIBRARY ? false : 'skills_library/ is not part of this checkout';

const LICENSE_FILE_PATTERN = /^(LICENSE|LICENCE|COPYING)([.-][\w.-]*)?$/i;
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/;
const PROPRIETARY_TERMS = /All rights reserved|^\s*license:\s*["']?Proprietary|Distribute, sublicense,? or transfer/im;

// Mirrors the M50 repair script (fix_refs.py --verify): bundle folders always count; ambiguous
// folders (data/, config/, ...) usually name the user's project and only count with $SKILL_DIR/.
const BUNDLE_DIRS = ['references', 'reference', 'resources', 'scripts', 'assets', 'templates', 'examples',
  'knowledge-base', 'rules', 'workflows', 'guides', 'prompts', 'checklists', 'schemas'];
const AMBIGUOUS_DIRS = ['data', 'config', 'docs', 'lib', 'bin', 'tools', 'agents', 'patterns'];
const PATH_PATTERN = new RegExp(
  "(?:^|(?<=[\\s`'\"(\\[|:,=*]))((?:\\$SKILL_DIR/|\\./)?(?:" + [...BUNDLE_DIRS, ...AMBIGUOUS_DIRS].join('|') +
    ")/[A-Za-z0-9_./-]*[A-Za-z0-9_-]\\.[A-Za-z0-9]{1,6})(?=$|[\\s`'\")\\]|:,;#*])",
  'g'
);
const MD_LINK_PATTERN =
  /\[([^\]]*)\]\(((?!https?:|mailto:|#|\/|~|\{)[^)\s]+?\.(?:md|py|sh|js|ts|json|txt|yaml|yml|html|csv))(?:#[^)]*)?\)/g;
const NOTE_MARK = '**Vault note:**';
// Paths that name files in the user's project (examples, files to create), not bundled files.
const USER_PROJECT_PATHS = {
  'ai-native-cli': /^rules\//,
  'claude-settings-audit': /^\.\/scripts\/deploy\.sh$/,
  'comfyui-gateway': /^\.\/workflows\//,
  'docs-core': /./,
  'documentation-templates': /^\.\/docs\//,
  'electron-development': /^resources\/entitlements/,
  'firmware-analyst': /^\.\/scripts\//,
  'hugging-face-datasets': /^scripts\/script_name\.py$/,
  'hugging-face-jobs': /^\.\/scripts\/foo\.py$/,
  'hugging-face-model-trainer': /^\.\/scripts\/train\.py$/,
  imagen: /^\.\/assets\/icons\//,
  'incident-runbook-templates': /^\.\/scripts\//,
  'makepad-deployment': /^\.\/assets\/icon\.png$/,
  'react-flow-architect': /^scripts\/graph-analyzer\.js$/,
  remotion: /^assets\/screens\//,
  'skill-creator-ms': /^references\/acceptance-criteria\.md$/,
  'skill-scanner': /^scripts\/tool\.py$/,
  'threejs-loaders': /^assets\/models\//,
  varlock: /^\.\/scripts\/update-github-secrets\.sh$/,
};

/** Case-sensitive set of every file and folder under skills_library/ ("skills_library/a/b.md"). */
function listVaultPaths() {
  const paths = new Set();
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(REPO_ROOT, rel), { withFileTypes: true })) {
      const child = `${rel}/${entry.name}`;
      paths.add(child);
      if (entry.isDirectory()) walk(child);
    }
  };
  walk('skills_library');
  return paths;
}

function skillFolders() {
  return fs.readdirSync(LIBRARY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(LIBRARY_DIR, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

const stripPrefix = (ref) => ref.replace(/^(?:\$SKILL_DIR\/|\.\/)/, '');

/** References on one line whose target is missing from the skill folder. */
function deadRefs(skill, line, vaultPaths) {
  const found = new Set();
  for (const match of line.matchAll(PATH_PATTERN)) {
    const ref = match[1];
    if (BUNDLE_DIRS.includes(stripPrefix(ref).split('/')[0]) || ref.startsWith('$SKILL_DIR/')) found.add(ref);
  }
  for (const match of line.matchAll(MD_LINK_PATTERN)) found.add(match[2]);
  const allowed = USER_PROJECT_PATHS[skill];
  return [...found].filter((ref) => {
    if (allowed && allowed.test(ref)) return false;
    const full = path.posix.normalize(`skills_library/${skill}/${stripPrefix(ref)}`).replace(/\/$/, '');
    return full.startsWith('skills_library/') && !vaultPaths.has(full);
  });
}

test('vault licence files and SKILL.md frontmatter carry no proprietary terms (H18)', { skip: SKIP_REASON }, () => {
  const offenders = [];
  for (const skill of skillFolders()) {
    const dir = path.join(LIBRARY_DIR, skill);
    for (const file of fs.readdirSync(dir).filter((name) => LICENSE_FILE_PATTERN.test(name))) {
      if (PROPRIETARY_TERMS.test(fs.readFileSync(path.join(dir, file), 'utf8'))) offenders.push(`${skill}/${file}`);
    }
    const frontmatter = FRONTMATTER_PATTERN.exec(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8').replace(/^﻿/, ''));
    if (frontmatter && PROPRIETARY_TERMS.test(frontmatter[1])) offenders.push(`${skill}/SKILL.md (frontmatter)`);
  }
  assert.deepEqual(offenders, [], 'proprietary or non-redistributable skills must not be vendored');
});

test('THIRD_PARTY_NOTICES.md is up to date with the vault (M53)', { skip: SKIP_REASON }, () => {
  const script = path.join(REPO_ROOT, '.github', 'scripts', 'third-party-notices.js');
  const result = spawnSync(process.execPath, [script, '--check'], { encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
});

test('every bundled-file reference in a vault skill exists or is listed in its Vault note (M50)', { skip: SKIP_REASON }, () => {
  const vaultPaths = listVaultPaths();
  const unannotated = [];
  for (const skill of skillFolders()) {
    const lines = fs.readFileSync(path.join(LIBRARY_DIR, skill, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n').split('\n');
    const note = lines.find((line) => line.includes(NOTE_MARK)) || '';
    lines.forEach((line, index) => {
      if (line.includes(NOTE_MARK)) return;
      for (const ref of deadRefs(skill, line, vaultPaths)) {
        if (!note.includes(`\`${stripPrefix(ref)}\``)) unannotated.push(`${skill}/SKILL.md:${index + 1}: ${ref}`);
      }
    });
  }
  assert.deepEqual(unannotated.slice(0, 50), [], `${unannotated.length} unannotated dead references`);
});
