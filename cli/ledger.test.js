'use strict';

const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { createGitCheckpoint, rollbackToGitCheckpoint } = require('./git-checkpoints.js');
const {
  initLedger,
  loadLedgerFile,
  saveLedgerFile,
  validateLedger,
  getNextPhaseSlice,
  verifyPhaseGate,
  auditLedger,
  runLedgerCli,
} = require('./ledger.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

function write(root, rel, content) {
  const full = path.join(root, ...rel.split('/'));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

function withWorkspace(fn) {
  const root = tempDir('boomopen-ledger-');
  try {
    write(root, 'package.json', '{"name":"autopilot-demo"}\n');
    write(root, 'documents/SRS.md', '# System Requirements\n\n## REQ-001 Auth\nUsers can sign in.\n\n## REQ-002 Billing\nUsers can pay.\n');
    return fn(root);
  } finally {
    removeDir(root);
  }
}

test('ledger init creates project-ledger.json, SHARED_CONTRACT.md, ROADMAP-PROGRESS.md and hashes spec docs', () => {
  withWorkspace((root) => {
    const code = runLedgerCli(['init', '--name', 'DemoApp', '--docs', 'documents/SRS.md'], { cwd: root, silent: true });
    assert.equal(code, 0);
    const ledgerPath = path.join(root, '.boomopen', 'project-ledger.json');
    const contractPath = path.join(root, '.boomopen', 'contracts', 'SHARED_CONTRACT.md');
    const progressPath = path.join(root, '.boomopen', 'ROADMAP-PROGRESS.md');
    assert.ok(fs.existsSync(ledgerPath));
    assert.ok(fs.existsSync(contractPath));
    assert.ok(fs.existsSync(progressPath));

    const ledger = loadLedgerFile(ledgerPath);
    assert.equal(ledger.project_name, 'DemoApp');
    assert.equal(ledger.spec_documents.length, 1);
    assert.equal(ledger.spec_documents[0].path, 'documents/SRS.md');
    assert.equal(ledger.spec_documents[0].lines, 7);
    assert.match(ledger.spec_documents[0].sha256, /^[0-9a-f]{64}$/);
  });
});

test('ledger validate catches spec SHA-256 drift and circular phase dependencies', () => {
  withWorkspace((root) => {
    const { ledger, paths } = initLedger({ cwd: root, name: 'DriftTest', docs: ['documents/SRS.md'] });
    ledger.phases = [
      { phase_id: 'phase-01', title: 'P1', status: 'pending', depends_on: ['phase-02'], doc_slices: [] },
      { phase_id: 'phase-02', title: 'P2', status: 'pending', depends_on: ['phase-01'], doc_slices: [] },
    ];
    saveLedgerFile(paths.ledgerPath, ledger);
    const cycleRes = validateLedger(ledger, root);
    assert.equal(cycleRes.valid, false);
    assert.ok(cycleRes.errors.some((e) => /Circular dependency/.test(e)));

    ledger.phases[0].depends_on = [];
    saveLedgerFile(paths.ledgerPath, ledger);
    assert.equal(runLedgerCli(['validate'], { cwd: root, silent: true }), 0);

    // Mutate the spec document to trigger spec drift detection
    write(root, 'documents/SRS.md', '# Modified Spec\n');
    assert.equal(runLedgerCli(['validate'], { cwd: root, silent: true }), 1);
  });
});

test('multi-phase lifecycle: next context slicing, verify strict-phase gate, regression ratchet, and final RTM audit', () => {
  withWorkspace((root) => {
    const { ledger, paths } = initLedger({ cwd: root, name: 'FullLifecycle', docs: ['documents/SRS.md'] });
    ledger.phases = [
      {
        phase_id: 'phase-01',
        title: 'Phase 1 — Auth Module',
        status: 'pending',
        depends_on: [],
        doc_slices: ['documents/SRS.md#L1-L4'],
      },
      {
        phase_id: 'phase-02',
        title: 'Phase 2 — Billing Module',
        status: 'pending',
        depends_on: ['phase-01'],
        doc_slices: ['documents/SRS.md#L5-L8'],
      },
    ];
    ledger.features = [
      {
        req_id: 'REQ-001',
        phase_id: 'phase-01',
        title: 'Authentication service',
        source_doc: 'documents/SRS.md#L3-L4',
        acceptance_criteria: ['Validates credentials and returns token'],
        owned_files: ['src/auth.ts'],
        test_files: ['src/auth.test.ts'],
        passes: false,
        status: 'pending',
      },
      {
        req_id: 'REQ-002',
        phase_id: 'phase-02',
        title: 'Billing invoice service',
        source_doc: 'documents/SRS.md#L6-L8',
        acceptance_criteria: ['Computes invoice total'],
        owned_files: ['src/billing.ts'],
        test_files: ['src/billing.test.ts'],
        passes: false,
        status: 'pending',
      },
    ];
    saveLedgerFile(paths.ledgerPath, ledger);

    // 1. Check `next` slice before Phase 1 is verified
    const slice1 = getNextPhaseSlice(ledger, paths);
    assert.equal(slice1.phase_id, 'phase-01');
    assert.deepEqual(slice1.read_only_prior_tests, []);
    assert.equal(slice1.pending_requirements.length, 1);

    // 2. Attempt to verify Phase 1 when files contain a TODO comment or stub -> MUST FAIL
    write(root, 'src/auth.ts', 'export function login(u: string): string {\n  // TODO: implement real auth\n  return u;\n}\n');
    write(root, 'src/auth.test.ts', 'import { test } from "node:test";\ntest("login", () => {});\n');
    assert.equal(runLedgerCli(['verify', '--phase', 'phase-01', '--passed-tests', '2'], { cwd: root, silent: true }), 1);

    // 3. Fix Phase 1 files to be 100% production-grade, but pass insufficient test count (0 < 1) -> MUST FAIL ratchet
    write(root, 'src/auth.ts', 'export function login(user: string): string {\n  return `token:${user}`;\n}\n');
    assert.equal(runLedgerCli(['verify', '--phase', 'phase-01', '--passed-tests', '0'], { cwd: root, silent: true }), 1);

    // 4. Verify Phase 1 with passing tests = 3 -> MUST PASS and advance cursor to phase-02
    assert.equal(runLedgerCli(['verify', '--phase', 'phase-01', '--passed-tests', '3'], { cwd: root, silent: true }), 0);

    const afterP1 = loadLedgerFile(paths.ledgerPath);
    assert.equal(afterP1.active_cursor.current_phase_id, 'phase-02');
    assert.equal(afterP1.active_cursor.baseline_passed_tests, 3);

    // 5. `next` for Phase 2 now lists `src/auth.test.ts` in `read_only_prior_tests`
    const slice2 = getNextPhaseSlice(afterP1, paths);
    assert.equal(slice2.phase_id, 'phase-02');
    assert.deepEqual(slice2.read_only_prior_tests, ['src/auth.test.ts']);

    // 6. Audit before Phase 2 is done -> MUST FAIL (REQ-002 still pending)
    assert.equal(runLedgerCli(['audit'], { cwd: root, silent: true }), 1);

    // 7. Implement Phase 2 cleanly and verify with cumulative tests = 5 (>= baseline 3 + 1 REQ)
    write(root, 'src/billing.ts', 'export function invoice(cents: number): number {\n  return Math.max(0, cents);\n}\n');
    write(root, 'src/billing.test.ts', 'import { test } from "node:test";\ntest("invoice", () => {});\n');
    assert.equal(runLedgerCli(['verify', '--phase', 'phase-02', '--passed-tests', '5'], { cwd: root, silent: true }), 0);

    // 8. Final End-to-End RTM Audit -> MUST PASS (0 violations, 2/2 phases, 2/2 REQs)
    const finalLedger = loadLedgerFile(paths.ledgerPath);
    const audit = auditLedger(finalLedger, root);
    assert.equal(audit.passed, true);
    assert.equal(audit.verified_requirements, 2);
    assert.equal(runLedgerCli(['audit'], { cwd: root, silent: true }), 0);
  });
});

test('normalizeLedgerShape normalizes source_documents, requirements, id/name, files_owned, and completed status', () => {
  withWorkspace((root) => {
    initLedger({ cwd: root, name: 'AliasDemo', docs: ['documents/SRS.md'] });
    write(root, 'src/auth.ts', 'export const auth = true;\n');
    write(root, 'src/auth.test.ts', 'import { test } from "node:test";\ntest("auth", () => {});\n');
    const aliasLedger = {
      schema_version: '5.5.0',
      project_name: 'AliasDemo',
      source_documents: ['documents/SRS.md'],
      active_cursor: { current_phase_id: 'phase-01', baseline_passed_tests: 1 },
      phases: [{ id: 'phase-01', name: 'Phase 1', status: 'completed' }],
      requirements: [
        {
          id: 'REQ-001',
          phase_id: 'phase-01',
          name: 'Auth feature',
          source_doc: 'documents/SRS.md#L3',
          acceptance_criteria: ['Signs in user'],
          files_owned: ['src/auth.ts'],
          test_files: ['src/auth.test.ts'],
          verification_command: 'node --test',
          status: 'completed',
        },
      ],
    };
    const res = validateLedger(aliasLedger, root);
    assert.equal(res.valid, true, res.errors.join('; '));
    assert.equal(aliasLedger.phases[0].phase_id, 'phase-01');
    assert.equal(aliasLedger.phases[0].status, 'verified');
    assert.equal(aliasLedger.features[0].req_id, 'REQ-001');
    assert.deepEqual(aliasLedger.features[0].owned_files, ['src/auth.ts']);
    assert.equal(aliasLedger.features[0].passes, true);
  });
});

test('regressions S1-BUG-06, S1-BUG-08, S1-BUG-09, S1-BUG-13 & S1-IMP-17: UTF-8 BOM ledger, custom --file cwd, non-code >500-line CSS, EISDIR safety, .boomopen.json standards, verify-phase & --run-verify', () => {
  withWorkspace((root) => {
    // Workspace .boomopen.json `relaxed` preset (hard limit 800 lines)
    write(root, '.boomopen.json', JSON.stringify({ codingStandards: { preset: 'relaxed' } }));
    const bigCss = `${Array.from({ length: 520 }, (_, i) => `--tok-${i}: ${i}px;`).join('\n')}\n`;
    const bigTs = `${Array.from({ length: 550 }, (_, i) => `export const c${i} = ${i};`).join('\n')}\n`;
    write(root, 'src/tokens.css', bigCss);
    write(root, 'src/big.ts', bigTs);
    write(root, 'src/big.test.ts', 'import { test } from "node:test";\ntest("ok", () => {});\n');

    // Custom nested --file path with UTF-8 BOM and source_documents relative to workspace root
    const customRel = '.boomopen/nested/custom-ledger.json';
    const customAbs = path.join(root, ...customRel.split('/'));
    fs.mkdirSync(path.dirname(customAbs), { recursive: true });
    const bomJson = `\uFEFF${JSON.stringify({
      schema_version: '5.5.0',
      project_name: 'BomNested',
      source_documents: ['documents/SRS.md'],
      active_cursor: { current_phase_id: 'phase-01', baseline_passed_tests: 0 },
      phases: [{ phase_id: 'phase-01', title: 'Phase 1', status: 'pending', depends_on: [] }],
      features: [{
        req_id: 'REQ-001',
        phase_id: 'phase-01',
        title: 'Tokens and Relaxed TS',
        source_doc: 'documents/SRS.md#L3',
        acceptance_criteria: ['Tokens'],
        owned_files: ['src/tokens.css', 'src/big.ts'],
        test_files: ['src/big.test.ts'],
        verification_cmd: 'node -e "process.exit(1)"',
        status: 'pending',
        passes: false,
      }],
    }, null, 2)}\n`;
    fs.writeFileSync(customAbs, bomJson, 'utf8');

    // Unknown flag `--passed-test` must return EXIT_USAGE (2)
    assert.equal(runLedgerCli(['verify', '--file', customRel, '--phase', 'phase-01', '--passed-test', '0'], { cwd: root, silent: true }), 2);

    // `verify-phase` with `--run-verify` fails when verification_cmd exits 1
    assert.equal(runLedgerCli(['verify-phase', 'phase-01', '--file', customRel, '--run-verify'], { cwd: root, silent: true }), 1);

    // Update verification_cmd to exit 0 -> `verify-phase` + `--run-verify` passes on 520-line CSS + 550-line relaxed TS
    const loaded = loadLedgerFile(customAbs, root);
    loaded.features[0].verification_cmd = 'node -e "process.exit(0)"';
    saveLedgerFile(customAbs, loaded);
    assert.equal(runLedgerCli(['verify-phase', 'phase-01', '--file', customRel, '--run-verify', '--passed-tests', '2'], { cwd: root, silent: true }), 0);

    // Directory entry in owned_files reports clean violation in auditLedger instead of throwing EISDIR
    const verifiedLedger = loadLedgerFile(customAbs, root);
    verifiedLedger.features[0].owned_files = ['src'];
    const dirAudit = auditLedger(verifiedLedger, root);
    assert.equal(dirAudit.passed, false);
    assert.ok(dirAudit.violations.some((v) => /missing file on disk "src"/.test(v)));
  });
});

test('git-checkpoints & boomopen ledger rollback --yes handle non-git, unborn HEAD, phase checkpoint_sha, and confirmed rollback', () => {
  withWorkspace((root) => {
    // 1. Outside git -> graceful { available: false }
    assert.equal(createGitCheckpoint(root, 'phase-01').available, false);

    // 2. Unborn HEAD (git init with 0 commits) -> graceful { available: false }
    spawnSync('git', ['init'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.name', 'Test'], { cwd: root, windowsHide: true });
    assert.equal(createGitCheckpoint(root, 'phase-01').available, false);

    // 3. Commit baseline -> initLedger & verifyPhaseGate record checkpoint_sha + refs/boomopen/checkpoints/*
    write(root, 'src/core.ts', 'export const core = 1;\n');
    write(root, 'src/core.test.ts', 'import test from "node:test";\ntest("core", () => {});\n');
    spawnSync('git', ['add', '.'], { cwd: root, windowsHide: true });
    spawnSync('git', ['commit', '-m', 'p1-baseline'], { cwd: root, windowsHide: true });
    const sha1 = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).stdout.trim();

    const { ledger, paths } = initLedger({ cwd: root, name: 'RollbackApp', docs: ['documents/SRS.md'] });
    assert.equal(ledger.active_cursor.checkpoint_sha, sha1);
    assert.equal(ledger.phases[0].checkpoint_sha, sha1);
    const refSha = spawnSync('git', ['rev-parse', 'refs/boomopen/checkpoints/phase-01'], { cwd: root, encoding: 'utf8', windowsHide: true }).stdout.trim();
    assert.equal(refSha, sha1);

    ledger.phases.push({ phase_id: 'phase-02', title: 'Phase 2', status: 'pending', depends_on: ['phase-01'], doc_slices: [] });
    ledger.features.push({
      req_id: 'REQ-001', phase_id: 'phase-01', title: 'Core', source_doc: 'documents/SRS.md#L3',
      acceptance_criteria: ['Core works'], owned_files: ['src/core.ts'], test_files: ['src/core.test.ts'], status: 'pending', passes: false,
    });
    saveLedgerFile(paths.ledgerPath, ledger);
    assert.equal(runLedgerCli(['verify', '--phase', 'phase-01', '--passed-tests', '1'], { cwd: root, silent: true }), 0);

    // 4. Corrupt tracked file in phase-02 -> rollback without --yes is rejected; rollback --yes restores sha1
    write(root, 'src/core.ts', 'export const core = "corrupted";\n');
    assert.equal(rollbackToGitCheckpoint(root, 'phase-02', { confirm: false }).ok, false);
    assert.equal(runLedgerCli(['rollback', '--phase', 'phase-02'], { cwd: root, silent: true }), 2);
    assert.equal(fs.readFileSync(path.join(root, 'src', 'core.ts'), 'utf8'), 'export const core = "corrupted";\n');

    assert.equal(runLedgerCli(['rollback', '--phase', 'phase-02', '--yes'], { cwd: root, silent: true }), 0);
    assert.equal(fs.readFileSync(path.join(root, 'src', 'core.ts'), 'utf8'), 'export const core = 1;\n');
  });
});
