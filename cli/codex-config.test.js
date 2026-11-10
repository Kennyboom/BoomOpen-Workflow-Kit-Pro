'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { scanToml, validateToml } = require('./toml-lite.js');
const {
  KIT_LINE_TAG,
  KIT_FALLBACK_FILES,
  CodexConfigError,
  mergeCodexConfigText,
  unmergeCodexConfigText,
  isManagedBlockEdited,
  parseStringArray,
} = require('./codex-config.js');
const { CODEX_MARKER_START } = require('./markers.js');

const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'platforms', 'codex', 'config.toml'), 'utf8');
const ROLE_COUNT = (TEMPLATE.match(/^\[agents\.[^\]]+\]/gm) || []).length;

// Configs users really have; every one must merge into valid TOML and un-merge back unchanged.
const USER_CONFIGS = {
  empty: '',
  simple: 'model = "o3"\n',
  ownAgentsTable: 'model = "gpt-5"\n\n[agents]\nmax_threads = 4\n',
  ownRole: '[agents.reviewer]\ndescription = "mine"\nconfig_file = "agents/mine.toml"\n',
  dottedFeatureOff: 'features.multi_agent = false\nmodel = "x"\n',
  dottedFeatureOther: 'features.web_search = true\n',
  commentMentionsFeatures: '# toggles live in [features] below\nmodel = "x"\n\n[features]\nweb_search = true\n',
  headerOnFirstLine: '[mcp_servers.docs]\ncommand = "npx"\n',
  multilineString: 'developer_instructions = """\n[1] be concise\nproject_doc_fallback_filenames = 1\n"""\n\n[profiles.x]\nmodel = "o3"\n',
  ownFallback: 'model = "o3"\nproject_doc_fallback_filenames = ["MINE.md"] # my docs\n\n[features]\nweb_search = true\n',
  ownFallbackMultiline: 'project_doc_fallback_filenames = [\n  "MINE.md",\n  "X.md",\n]\n',
  inlineFeatures: 'features = { web_search = true }\n',
  crlf: 'model = "o3"\r\n\r\n[features]\r\nweb_search = true\r\n',
  commentedKey: '# multi_agent = false\nmodel = "x"\n',
  arrayOfTables: '[[profiles_list]]\nname = "a"\n\n[[profiles_list]]\nname = "b"\n',
};

// Windows PowerShell 5.1 (Out-File, Set-Content -Encoding UTF8) writes UTF-8 with a BOM.
const BOM_CONFIGS = {
  bomHeaderFirst: '﻿[features]\nweb_search = true\n',
  bomComment: '﻿# my config\n[tui]\nnotifications = true\n',
  bomRootKey: '﻿model = "o3"\n',
};

test('toml-lite accepts valid documents and reports the errors TOML parsers reject', () => {
  assert.equal(validateToml(TEMPLATE), null);
  for (const [name, text] of Object.entries(USER_CONFIGS)) assert.equal(validateToml(text), null, name);
  const invalid = {
    duplicateTable: '[agents]\na = 1\n[agents]\nb = 2\n',
    duplicateSubTable: '[agents.reviewer]\na = 1\n[agents.reviewer]\nb = 1\n',
    dottedThenHeader: 'features.multi_agent = false\n[features]\nx = 1\n',
    duplicateKey: 'a = 1\na = 2\n',
    unterminatedString: 'a = "oops\n',
    unterminatedMultiline: 'a = """\nnever closed\n',
    junkAfterValue: 'multi_agent = true below\n',
    tableIsValue: 'agents = 1\n[agents.x]\n',
  };
  for (const [name, text] of Object.entries(invalid)) assert.notEqual(validateToml(text), null, name);
});

test('toml-lite tracks statement line ranges across multi-line values', () => {
  const scan = scanToml('a = [\n  1,\n  2,\n]\n[t]\nb = """\nx\n"""\n');
  assert.equal(scan.ok, true);
  const kvs = scan.statements.filter((s) => s.type === 'kv');
  assert.deepEqual(kvs.map((s) => [s.startLine, s.endLine]), [[0, 3], [5, 7]]);
});

test('parseStringArray reads plain string arrays only', () => {
  assert.deepEqual(parseStringArray('["A.md", \'B.md\']'), ['A.md', 'B.md']);
  assert.deepEqual(parseStringArray('[\n "A.md", # c\n]'), ['A.md']);
  assert.deepEqual(parseStringArray('[]'), []);
  assert.equal(parseStringArray('[1, 2]'), null);
});

test('mergeCodexConfigText: valid, idempotent and reversible for every user config', () => {
  for (const [name, original] of Object.entries(USER_CONFIGS)) {
    const { text } = mergeCodexConfigText(original, TEMPLATE);
    assert.equal(validateToml(text), null, `${name}: merged config must be valid TOML`);
    assert.ok(text.includes(CODEX_MARKER_START), name);
    assert.equal(mergeCodexConfigText(text, TEMPLATE).text, text, `${name}: reinstall must be a no-op`);
    assert.equal(unmergeCodexConfigText(text).text, original, `${name}: uninstall must restore the original bytes`);
  }
});

test('mergeCodexConfigText never redefines what the user already has', () => {
  const ownAgents = mergeCodexConfigText(USER_CONFIGS.ownAgentsTable, TEMPLATE).text;
  assert.equal((ownAgents.match(/^\[agents\]$/gm) || []).length, 1, 'single [agents] table');
  assert.equal((ownAgents.match(/^\[agents\.[^\]]+\]$/gm) || []).length, ROLE_COUNT);

  const ownRole = mergeCodexConfigText(USER_CONFIGS.ownRole, TEMPLATE);
  assert.equal((ownRole.text.match(/^\[agents\.reviewer\]$/gm) || []).length, 1);
  assert.equal((ownRole.text.match(/^\[agents\]$/gm) || []).length, 1, 'implicit [agents] still gets [agents] max_threads');
  assert.match(ownRole.notes.join('\n'), /reviewer/);

  const dottedOff = mergeCodexConfigText(USER_CONFIGS.dottedFeatureOff, TEMPLATE);
  assert.doesNotMatch(dottedOff.text, /^\[features\]$/m, 'no [features] table next to dotted features keys');
  assert.match(dottedOff.notes.join('\n'), /multi_agent is disabled/);

  const dottedOther = mergeCodexConfigText(USER_CONFIGS.dottedFeatureOther, TEMPLATE).text;
  assert.match(dottedOther, new RegExp(`^features\\.multi_agent = true ${KIT_LINE_TAG}$`, 'm'));

  const firstLineHeader = mergeCodexConfigText(USER_CONFIGS.headerOnFirstLine, TEMPLATE).text;
  assert.ok(firstLineHeader.startsWith('project_doc_fallback_filenames'), 'root key goes above the first table');

  const ownFallback = mergeCodexConfigText(USER_CONFIGS.ownFallback, TEMPLATE).text;
  const expected = `["MINE.md", ${KIT_FALLBACK_FILES.map((f) => JSON.stringify(f)).join(', ')}]`;
  assert.ok(ownFallback.includes(`project_doc_fallback_filenames = ${expected}`), 'user fallback list is extended, not replaced');

  const inline = mergeCodexConfigText(USER_CONFIGS.inlineFeatures, TEMPLATE);
  assert.match(inline.notes.join('\n'), /inline table/);
});

test('mergeCodexConfigText refuses invalid input and an unterminated managed block', () => {
  assert.throws(() => mergeCodexConfigText('[agents]\n[agents]\n', TEMPLATE), CodexConfigError);
  assert.throws(() => mergeCodexConfigText(`model = "x"\n${CODEX_MARKER_START}\n[agents.x]\n`, TEMPLATE), CodexConfigError);
});

/** A Python with tomllib (3.11+), used as an independent TOML parser when available. */
function findTomlPython() {
  const candidates = [['py', ['-3.14']], ['py', ['-3']], ['python3', []], ['python', []]];
  for (const [cmd, args] of candidates) {
    const probe = spawnSync(cmd, [...args, '-B', '-c', 'import tomllib'], { encoding: 'utf8', timeout: 20000 });
    if (probe.status === 0) return [cmd, args];
  }
  return null;
}

test('merged configs parse with Python tomllib (independent parser)', (t) => {
  const python = findTomlPython();
  if (!python) {
    t.skip('no Python 3.11+ with tomllib on PATH');
    return;
  }
  const merged = Object.fromEntries(
    Object.entries(USER_CONFIGS).map(([name, text]) => [name, mergeCodexConfigText(text, TEMPLATE).text])
  );
  const script = [
    'import json, sys, tomllib',
    'data = json.loads(sys.stdin.read())',
    'out = {}',
    'for name, text in data.items():',
    '    try:',
    '        doc = tomllib.loads(text)',
    '        out[name] = {"ok": True, "roles": len([k for k, v in doc.get("agents", {}).items() if isinstance(v, dict)]),',
    '                     "multi_agent": doc.get("features", {}).get("multi_agent")}',
    '    except Exception as exc:',
    '        out[name] = {"ok": False, "error": str(exc)}',
    'print(json.dumps(out))',
  ].join('\n');
  const result = spawnSync(python[0], [...python[1], '-B', '-c', script], { input: JSON.stringify(merged), encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  for (const [name, entry] of Object.entries(report)) {
    assert.equal(entry.ok, true, `${name}: ${entry.error}`);
    assert.ok(entry.roles >= ROLE_COUNT - 1, `${name}: kit roles registered`);
  }
  assert.equal(report.simple.multi_agent, true);
  assert.equal(report.dottedFeatureOff.multi_agent, false, "the user's explicit choice is kept");
});

test('user edits to kit-tagged lines survive reinstall and uninstall; block edits are detected', () => {
  const user = 'project_doc_fallback_filenames = ["NOTES.md"]\nmodel = "o3"\n';
  const installed = mergeCodexConfigText(user, TEMPLATE).text;
  assert.equal(unmergeCodexConfigText(installed).text, user, 'untouched: byte-for-byte restore');

  const editedList = installed.replace('".agents.md"]', '".agents.md", "Z.md"]');
  const reinstalled = mergeCodexConfigText(editedList, TEMPLATE).text;
  assert.match(reinstalled.split('\n')[0], /"NOTES\.md", "Z\.md"/, 'reinstall keeps the added name');
  assert.equal(
    unmergeCodexConfigText(reinstalled).text,
    'project_doc_fallback_filenames = ["NOTES.md", "Z.md"]\nmodel = "o3"\n',
    'uninstall keeps the added name and drops only the kit names'
  );

  const featureUser = '[features]\nweb_search = true\n';
  const switchedOff = mergeCodexConfigText(featureUser, TEMPLATE).text.replace(
    `multi_agent = true ${KIT_LINE_TAG}`,
    `multi_agent = false ${KIT_LINE_TAG}`
  );
  const again = mergeCodexConfigText(switchedOff, TEMPLATE);
  assert.match(again.text, /^multi_agent = false$/m, "multi_agent = false is now the user's own line");
  assert.ok(again.notes.some((note) => /multi_agent is disabled/.test(note)));

  assert.equal(isManagedBlockEdited(installed), false);
  assert.equal(isManagedBlockEdited(installed.replace('max_threads = 6', 'max_threads = 99')), true);
  assert.match(installed, /do not edit inside this block/);
});

test('a BOM-prefixed config.toml keeps its BOM at the start and un-merges byte-for-byte', () => {
  for (const [name, original] of Object.entries(BOM_CONFIGS)) {
    const merged = mergeCodexConfigText(original, TEMPLATE).text;
    assert.equal(merged.charCodeAt(0), 0xfeff, name);
    assert.equal(merged.indexOf('﻿', 1), -1, `${name}: no BOM inside the file`);
    assert.equal(validateToml(merged.slice(1)), null, name);
    assert.equal(mergeCodexConfigText(merged, TEMPLATE).text, merged, `${name}: reinstall is a no-op`);
    assert.equal(unmergeCodexConfigText(merged).text, original, name);
  }
});
