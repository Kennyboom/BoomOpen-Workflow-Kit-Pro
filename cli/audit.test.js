'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  discoverSpecSources,
  extractVerticalFlows,
  scanCrossModuleHazards,
  runAuditStaticScan,
} = require('./audit-scanners.js');
const {
  computeFindingFingerprint,
  initAuditLedger,
  loadAuditLedger,
  getRoundSlice,
  recordRoundFindings,
  applyUserDecisions,
  verifyRoundFixes,
  getAuditStatus,
  runAuditCli,
} = require('./audit.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

function write(root, rel, content) {
  const full = path.join(root, ...rel.split('/'));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

function withTempWorkspace(fn) {
  const root = tempDir('boomopen-audit-');
  try {
    return fn(root);
  } finally {
    removeDir(root);
  }
}

test('discoverSpecSources supports spec_grounded discovery, zero-doc brownfield code_inferred mode, and zero file truncation', () => {
  withTempWorkspace((root) => {
    // 1. Zero-doc brownfield workspace -> mode: "code_inferred", scans > 60 files with 0 truncation
    for (let i = 1; i <= 62; i++) {
      write(root, `src/mod-${String(i).padStart(2, '0')}.ts`, `export const v${i} = ${i};\n`);
    }
    const zeroDocSpecs = discoverSpecSources(root);
    assert.equal(zeroDocSpecs.mode, 'code_inferred');
    assert.equal(zeroDocSpecs.ledger_present, false);
    assert.deepEqual(zeroDocSpecs.documents, []);

    const fullScan = runAuditStaticScan(root);
    assert.equal(fullScan.scanned_files, 62, 'Expected zero 15/30/50 file truncation');

    // 2. Add spec docs + project-ledger.json -> mode: "spec_grounded" with SHA-256 & line counts
    write(root, 'README.md', '# Commerce App\nOverview.\n');
    write(root, 'PRD-commerce.md', '# PRD\n## Checkout\nFast checkout.\n');
    write(root, 'docs/architecture.md', '# Architecture\nLayered API.\n');
    write(root, 'specs/auth.md', '# Auth Spec\nJWT tokens.\n');
    write(root, 'documents/SRS.md', '# SRS\nREQ-101 Orders.\n');
    write(root, 'openapi.yaml', 'openapi: 3.1.0\ninfo:\n  title: Commerce\n');
    write(root, '.boomopen/project-ledger.json', JSON.stringify({
      project_name: 'CommercePro',
      features: [{ req_id: 'REQ-101', passes: true, test_files: ['tests/baseline.test.ts'] }],
    }, null, 2));

    const grounded = discoverSpecSources(root);
    assert.equal(grounded.mode, 'spec_grounded');
    assert.equal(grounded.ledger_present, true);
    assert.equal(grounded.project_name, 'CommercePro');
    assert.equal(grounded.ledger_requirements, 1);
    const docPaths = grounded.documents.map((d) => d.path);
    for (const expected of ['PRD-commerce.md', 'README.md', 'docs/architecture.md', 'documents/SRS.md', 'openapi.yaml', 'specs/auth.md']) {
      assert.ok(docPaths.includes(expected), `Expected ${expected} in discovered docs`);
    }
    for (const doc of grounded.documents) {
      assert.match(doc.sha256, /^[0-9a-f]{64}$/);
      assert.ok(doc.lines >= 2);
    }
  });
});

test('extractVerticalFlows links UI Pages -> Client fetch/axios calls -> Backend Routes -> Service/DB Models', () => {
  withTempWorkspace((root) => {
    write(root, 'src/pages/OrdersPage.tsx', [
      'import { createOrder } from "../api/ordersClient";',
      'export function OrdersPage() {',
      '  return <button onClick={() => createOrder()}>Buy</button>;',
      '}',
    ].join('\n'));
    write(root, 'src/api/ordersClient.ts', [
      'export async function createOrder() {',
      '  return fetch("/api/orders", { method: "POST" });',
      '}',
    ].join('\n'));
    write(root, 'src/server.ts', [
      'import ordersRouter from "./routes/orders";',
      'app.use("/api/orders", ordersRouter);',
    ].join('\n'));
    write(root, 'src/routes/orders.ts', [
      'import { saveOrder } from "../services/orderService";',
      'router.post("/", async (req, res) => saveOrder(req.body));',
    ].join('\n'));
    write(root, 'src/services/orderService.ts', [
      'import { OrderModel } from "../models/Order";',
      'export async function saveOrder(data: unknown) { return OrderModel.insert(data); }',
    ].join('\n'));
    write(root, 'src/models/Order.ts', 'export const OrderModel = { insert: async (d: unknown) => d };\n');

    const flows = extractVerticalFlows(root);
    const orderFlow = flows.find((f) => f.name === '/api/orders');
    assert.ok(orderFlow, `Expected /api/orders vertical flow in ${JSON.stringify(flows)}`);
    assert.match(orderFlow.flow_id, /^FLOW-\d{2}$/);
    assert.ok(orderFlow.entrypoints.includes('src/pages/OrdersPage.tsx'));
    assert.ok(orderFlow.client_calls.includes('/api/orders'));
    assert.ok(orderFlow.api_routes.includes('src/routes/orders.ts'));
    assert.ok(orderFlow.services_and_models.includes('src/services/orderService.ts'));
    assert.ok(orderFlow.services_and_models.includes('src/models/Order.ts'));
  });
});

test('scanCrossModuleHazards detects empty catch, N+1 loop await, API route mismatch, missing .env.example keys, and UX 5-State coverage', () => {
  withTempWorkspace((root) => {
    write(root, '.env.example', 'DATABASE_URL=postgres://localhost:5432/app\n');
    write(root, 'src/routes/orders.ts', [
      'const dbUrl = process.env.DATABASE_URL;',
      'const secret = process.env.STRIPE_WEBHOOK_SECRET;',
      'router.get("/api/orders/:id", async (req, res) => {',
      '  try {',
      '    for (const itemId of req.query.items) {',
      '      await prisma.orderItem.findUnique({ where: { id: itemId } });',
      '    }',
      '  } catch (err) {',
      '    // swallowed silently',
      '  }',
      '  return dbUrl && secret;',
      '});',
    ].join('\n'));
    write(root, 'src/pages/OrdersPage.tsx', [
      'export async function OrdersPage() {',
      '  const pubKey = import.meta.env.VITE_PUBLIC_STRIPE_KEY;',
      '  await fetch("/api/orders/42");',
      '  await fetch("/api/nonexistent-billing", { method: "POST" });',
      '  const isLoading = false;',
      '  return <div>{isLoading ? "Loading" : pubKey}</div>;',
      '}',
    ].join('\n'));

    const report = scanCrossModuleHazards(root);
    assert.equal(report.empty_catches.length, 1);
    assert.equal(report.empty_catches[0].file, 'src/routes/orders.ts');

    assert.equal(report.n_plus_one_loops.length, 1);
    assert.equal(report.n_plus_one_loops[0].file, 'src/routes/orders.ts');

    assert.equal(report.api_mismatches.length, 1);
    assert.equal(report.api_mismatches[0].endpoint, '/api/nonexistent-billing');

    const missingKeys = report.missing_env_keys.map((k) => k.key).sort();
    assert.deepEqual(missingKeys, ['STRIPE_WEBHOOK_SECRET', 'VITE_PUBLIC_STRIPE_KEY']);

    assert.equal(report.ux_screen_coverage.length, 1);
    assert.equal(report.ux_screen_coverage[0].file, 'src/pages/OrdersPage.tsx');
    assert.deepEqual(report.ux_screen_coverage[0].present_states, ['loading']);
    assert.deepEqual(report.ux_screen_coverage[0].missing_states.sort(), ['disabled', 'empty', 'error', 'success']);
  });
});

test('full 3-round human-gated lifecycle: init -> R1 record -> approve (--exclude wont_fix) -> verify-fix -> R2 slice & record (suppression + closure) -> R3 P3 nitpick freeze -> CONVERGED', () => {
  withTempWorkspace((root) => {
    write(root, 'docs/PRD.md', '# PRD\nOrders and Auth requirements.\n');
    write(root, 'src/orders.ts', 'export function calcOrder(n: number): number { return n; }\n');
    write(root, 'src/legacy.ts', 'export const legacyFlag = true;\n');
    write(root, 'src/auth.ts', 'export function checkAuth(tok: string): boolean { return Boolean(tok); }\n');
    write(root, 'src/untouched.ts', 'export const label = "ok";\n');

    // 1. CLI `init`
    assert.equal(runAuditCli(['init', '--name', 'ShopAudit', '--docs', 'docs/PRD.md'], { cwd: root, silent: true }), 0);
    assert.ok(fs.existsSync(path.join(root, '.boomopen', 'audit-ledger.json')));
    assert.ok(fs.existsSync(path.join(root, '.boomopen', 'AUDIT-PROGRESS.md')));

    let ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'SCANNING_ROUND');
    assert.equal(ledger.current_round, 1);
    assert.equal(ledger.mode, 'spec_grounded');

    const sliceR1 = getRoundSlice(ledger);
    assert.equal(sliceR1.focus, 'SPEC_AND_VERTICAL_FLOWS');
    assert.equal(sliceR1.nitpick_freeze, false);

    // 2. CLI `record` Round 1 (AUD-001 P1 + AUD-002 P2)
    write(root, 'r1-findings.json', JSON.stringify({
      round: 1,
      findings: [
        {
          severity: 'P1',
          dimension: 'vertical_flow',
          title: 'Negative order quantity accepted',
          primary_location: 'src/orders.ts:1',
          owned_files: ['src/orders.ts'],
          test_files: ['src/orders.test.ts'],
          verification_cmd: 'node -e "process.exit(0)"',
        },
        {
          severity: 'P2',
          dimension: 'architecture',
          title: 'Legacy compatibility flag still exported',
          primary_location: 'src/legacy.ts:1',
          owned_files: ['src/legacy.ts'],
        },
      ],
    }, null, 2));
    assert.equal(runAuditCli(['record', '--round', '1', '--input', 'r1-findings.json'], { cwd: root, silent: true }), 0);

    ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'AWAITING_USER_APPROVAL');
    assert.equal(ledger.findings.length, 2);

    // 3. CLI `approve` Round 1 with `--exclude AUD-002` (`wont_fix`)
    assert.equal(runAuditCli(['approve', '--round', '1', '--exclude', 'AUD-002'], { cwd: root, silent: true }), 0);
    ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'FIXING');
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-001').status, 'approved');
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-002').status, 'wont_fix');
    assert.equal(ledger.fix_packets.length, 1);
    assert.ok(ledger.fix_packets[0].owned_files.length <= 4);
    assert.ok(ledger.fix_packets[0].read_only_files.includes('.boomopen/audit-ledger.json'));

    // 4. `verify-fix` rejects deferred work marker first, then passes once clean
    const deferredMarker = `// ${'TO' + 'DO'}: finish validation`;
    write(root, 'src/orders.ts', `export function calcOrder(n: number): number {\n  ${deferredMarker}\n  return n;\n}\n`);
    write(root, 'src/orders.test.ts', 'import test from "node:test";\ntest("orders", () => {});\n');
    assert.equal(runAuditCli(['verify-fix', '--round', '1', '--passed-tests', '3'], { cwd: root, silent: true }), 1);

    write(root, 'src/orders.ts', 'export function calcOrder(n: number): number { return Math.max(0, n); }\n');
    assert.equal(
      runAuditCli(['verify-fix', '--round', '1', '--passed-tests', '4', '--locked-tests', 'src/orders.test.ts', '--run-verify'], { cwd: root, silent: true }),
      0
    );

    ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'SCANNING_ROUND');
    assert.equal(ledger.current_round, 2);
    assert.equal(ledger.current_passed_tests, 4);
    assert.deepEqual(ledger.locked_regression_tests, ['src/orders.test.ts']);
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-001').status, 'fixed_pending_reaudit');

    // 5. `slice` Round 2 & `record` Round 2 (wont_fix suppression + R1 fix closure + 1 new R2 finding)
    const sliceR2 = getRoundSlice(ledger);
    assert.equal(sliceR2.focus, 'SECURITY_TX_AND_PERF');
    assert.equal(sliceR2.reaudit_items.length, 1);
    assert.equal(sliceR2.suppressed_fingerprints.length, 1);

    write(root, 'r2-findings.json', JSON.stringify({
      round: 2,
      reopened_checks: [{ id: 'AUD-001', status: 'verified_closed' }],
      findings: [
        {
          // Duplicate of AUD-002 (wont_fix) -> MUST be suppressed!
          severity: 'P2',
          dimension: 'architecture',
          title: 'Legacy compatibility flag still exported',
          primary_location: 'src/legacy.ts:5',
        },
        {
          severity: 'P1',
          dimension: 'security',
          title: 'Token length not validated in checkAuth',
          primary_location: 'src/auth.ts:1',
          owned_files: ['src/auth.ts'],
          test_files: ['src/auth.test.ts'],
          verification_cmd: 'node -e "process.exit(0)"',
        },
      ],
    }, null, 2));
    assert.equal(runAuditCli(['record', '--round', '2', '--input', 'r2-findings.json'], { cwd: root, silent: true }), 0);

    ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'AWAITING_USER_APPROVAL');
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-001').status, 'verified_closed');
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-002').status, 'wont_fix');
    assert.equal(ledger.rounds.find((r) => r.round === 2).suppressed_count, 1);

    // Approve & verify-fix Round 2 (also check monotonic test ratchet: 2 < 4 fails, 6 >= 4 passes)
    assert.equal(runAuditCli(['approve', '--round', '2'], { cwd: root, silent: true }), 0);
    ledger = loadAuditLedger(root);
    assert.ok(ledger.fix_packets[0].read_only_files.includes('src/orders.test.ts'), 'Prior locked test must be in READ_ONLY_FILES');

    write(root, 'src/auth.ts', 'export function checkAuth(tok: string): boolean { return tok.trim().length >= 16; }\n');
    write(root, 'src/auth.test.ts', 'import test from "node:test";\ntest("auth", () => {});\n');
    assert.equal(runAuditCli(['verify-fix', '--round', '2', '--passed-tests', '2'], { cwd: root, silent: true }), 1);
    assert.equal(
      runAuditCli(['verify-fix', '--round', '2', '--passed-tests', '6', '--locked-tests', 'src/auth.test.ts', '--run-verify'], { cwd: root, silent: true }),
      0
    );

    // 6. Round 3: `UX_STATES_AND_OPS_READINESS` + `P3` nitpick freeze on untouched file -> `CONVERGED`!
    ledger = loadAuditLedger(root);
    const sliceR3 = getRoundSlice(ledger);
    assert.equal(sliceR3.focus, 'UX_STATES_AND_OPS_READINESS');
    assert.equal(sliceR3.nitpick_freeze, true);

    write(root, 'r3-findings.json', JSON.stringify({
      round: 3,
      findings: [
        {
          severity: 'P3',
          dimension: 'style',
          title: 'Minor naming preference on untouched helper',
          primary_location: 'src/untouched.ts:1',
          owned_files: ['src/untouched.ts'],
        },
      ],
    }, null, 2));
    assert.equal(runAuditCli(['record', '--round', '3', '--input', 'r3-findings.json'], { cwd: root, silent: true }), 0);

    ledger = loadAuditLedger(root);
    assert.equal(ledger.state, 'CONVERGED');
    assert.equal(ledger.findings.find((f) => f.id === 'AUD-003').status, 'verified_closed');
    assert.equal(ledger.rounds.find((r) => r.round === 3).nitpick_frozen_dropped, 1);

    const status = getAuditStatus(ledger);
    assert.equal(status.open_blockers, 0);
    assert.equal(status.counts.verified_closed, 2);
    assert.equal(status.counts.wont_fix, 1);
  });
});

test('Zero-Approved-Mutation short-circuit transitions directly to CONVERGED when all open items are excluded or deferred', () => {
  withTempWorkspace((root) => {
    write(root, 'src/app.ts', 'export const app = 1;\n');
    const { ledger } = initAuditLedger({ cwd: root, name: 'ShortCircuitApp' });
    recordRoundFindings(ledger, {
      round: 1,
      findings: [
        { severity: 'P1', dimension: 'api', title: 'Issue one', primary_location: 'src/app.ts:1' },
        { severity: 'P2', dimension: 'ux', title: 'Issue two', primary_location: 'src/app.ts:1' },
      ],
    });
    assert.equal(ledger.state, 'AWAITING_USER_APPROVAL');

    const decision = applyUserDecisions(ledger, { round: 1, exclude: ['AUD-001'], defer: ['AUD-002'] });
    assert.equal(decision.short_circuited, true);
    assert.equal(decision.state, 'CONVERGED');
    assert.equal(ledger.state, 'CONVERGED');
    assert.deepEqual(decision.fix_packets, []);
  });
});

test('oscillation circuit-breaker halts with HALTED_OSCILLATION when reopen_count >= 2, and unknown CLI flags exit 2', () => {
  withTempWorkspace((root) => {
    write(root, 'src/payment.ts', 'export const pay = () => true;\n');
    const { ledger } = initAuditLedger({ cwd: root, name: 'OscillationTest' });
    const bug = { severity: 'P0', dimension: 'tx', title: 'Double charge race condition', primary_location: 'src/payment.ts:1', owned_files: ['src/payment.ts'] };
    const fp = computeFindingFingerprint(bug);
    assert.match(fp, /^[0-9a-f]{64}$/);

    // Round 1: discovered -> approved -> fixed_pending_reaudit
    recordRoundFindings(ledger, { round: 1, findings: [bug] });
    applyUserDecisions(ledger, { round: 1, select: 'P0' });
    assert.equal(verifyRoundFixes(ledger, { cwd: root, round: 1, passedTests: 2 }).passed, true);

    // Round 2: re-reported -> reopen_count = 1 -> AWAITING_USER_APPROVAL
    recordRoundFindings(ledger, { round: 2, findings: [bug] });
    assert.equal(ledger.findings[0].status, 'reopened');
    assert.equal(ledger.findings[0].reopen_count, 1);
    assert.equal(ledger.state, 'AWAITING_USER_APPROVAL');

    // Fix attempt 2
    applyUserDecisions(ledger, { round: 2, select: 'P0' });
    assert.equal(verifyRoundFixes(ledger, { cwd: root, round: 2, passedTests: 2 }).passed, true);

    // Round 3: re-reported again -> reopen_count = 2 -> HALTED_OSCILLATION!
    recordRoundFindings(ledger, { round: 3, findings: [bug] });
    assert.equal(ledger.findings[0].reopen_count, 2);
    assert.equal(ledger.state, 'HALTED_OSCILLATION');

    // Round 4 slice scopes strictly to delta files
    const sliceR4 = getRoundSlice(ledger, { round: 4 });
    assert.equal(sliceR4.focus, 'SCOPED_DELTA_SIGNOFF');

    // Unknown flag returns EXIT_USAGE (2)
    assert.equal(runAuditCli(['status', '--unknown-flag'], { cwd: root, silent: true }), 2);
  });
});
