'use strict';

const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { detectCookState, compileWavePackets, verifyWaveExecution, runCookCli } = require('./cook.js');
const { hashFileSha256, loadLedgerFile, saveLedgerFile, verifyPhaseGate, runLedgerCli } = require('./ledger.js');
const { parsePlanMarkdown, validatePlan, compilePlanToLedger } = require('./plan.js');
const {
  scanProjectReconciliation,
  buildImportGraph,
  extractRoutesAndClientCalls,
  checkEnvParity,
  amendPlanWithDeltaWave,
  runReconcileCli,
} = require('./reconcile.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

function writeRel(root, relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
}

test('REC-G1: flags island component imported only by tests (ignoring commented imports) and passes when wired', () => {
  const root = tempDir('boomopen-rec-g1-');
  try {
    writeRel(root, 'package.json', JSON.stringify({ name: 'rec-g1-demo', main: 'src/entry.ts' }, null, 2));
    writeRel(root, 'tsconfig.json', JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': ['src/*'] } } }));
    writeRel(root, 'src/entry.ts', '// import { IslandWidget } from "./components/IslandWidget";\nexport const boot = () => "ready";\n');
    writeRel(root, 'src/components/IslandWidget.tsx', 'export function IslandWidget() { return <section>Widget</section>; }\n');
    writeRel(root, 'src/components/IslandWidget.test.tsx', 'import { IslandWidget } from "./IslandWidget";\nconsole.assert(typeof IslandWidget === "function");\n');
    writeRel(root, 'PLAN-demo.md', [
      '# Implementation Plan — Widget',
      '## Acceptance Criteria',
      '- AC1: Render IslandWidget from entrypoint',
      '## Wave 1: Feature',
      '### Task 1.1 (REQ-101): Build IslandWidget',
      '- **Agent**: `frontend-engineer#1`',
      '- **Acceptance**: `AC1`',
      '- **OWNED_FILES**: `src/entry.ts`, `src/components/IslandWidget.tsx`',
      '- **Test Files**: `src/components/IslandWidget.test.tsx`',
      '- **Verify**: `node -e "process.exit(0)"`',
    ].join('\n'));

    const failRes = scanProjectReconciliation(root, { plan: 'PLAN-demo.md' });
    assert.equal(failRes.valid, false);
    assert.equal(failRes.gates['REC-G1'].length, 1);
    assert.match(failRes.gates['REC-G1'][0], /IslandWidget\.tsx/);

    // Wire via tsconfig @/ alias + dynamic import -> REC-G1 passes
    writeRel(root, 'src/components/LazyChart.ts', 'export const renderChart = () => 42;\n');
    writeRel(root, 'src/entry.ts', 'import { IslandWidget } from "@/components/IslandWidget";\nexport const load = () => ({ IslandWidget, chart: import("./components/LazyChart") });\n');
    const graph = buildImportGraph(root);
    assert.equal(graph.entrypoints.has('src/entry.ts'), true);
    assert.equal(graph.importedBy.get('src/components/IslandWidget.tsx').has('src/entry.ts'), true);
    assert.equal(graph.importedBy.get('src/components/LazyChart.ts').has('src/entry.ts'), true);

    const passRes = scanProjectReconciliation(root, { plan: 'PLAN-demo.md' });
    assert.equal(passRes.valid, true, passRes.errors.join('; '));
  } finally {
    removeDir(root);
  }
});

test('REC-G2: catches /api/v1/user vs /api/v1/users mismatch and passes normalized :id / [id] / {id} across Express, Next.js & FastAPI', () => {
  const root = tempDir('boomopen-rec-g2-');
  try {
    writeRel(root, 'src/server.ts', [
      'import express from "express";',
      'const app = express();',
      'const usersRouter = express.Router();',
      'usersRouter.get("/", (_req, res) => res.json([]));',
      'usersRouter.get("/:id", (_req, res) => res.json({}));',
      'app.use("/api/v1/users", usersRouter);',
    ].join('\n'));
    writeRel(root, 'src/app/api/orders/[orderId]/route.ts', 'export async function PATCH() { return Response.json({ ok: true }); }\n');
    writeRel(root, 'services/items_api.py', '@router.delete("/api/v1/items/{item_id}")\ndef remove_item(item_id: str):\n    return {"deleted": item_id}\n');
    writeRel(root, 'src/client/api.ts', [
      'export async function syncAll(id: string) {',
      '  await fetch("/api/v1/user");',
      '  await fetch(`/api/v1/users/${id}`);',
      '  await fetch(`/api/orders/${id}`, { method: "PATCH" });',
      '  await axios.delete(`/api/v1/items/${id}`);',
      '}',
    ].join('\n'));

    const mismatch = extractRoutesAndClientCalls(root);
    assert.equal(mismatch.mismatches.length, 1);
    assert.equal(mismatch.mismatches[0].rawPath, '/api/v1/user');

    const recFail = scanProjectReconciliation(root);
    assert.equal(recFail.valid, false);
    assert.equal(recFail.gates['REC-G2'].length, 1);

    // Fix singular typo -> all 4 client calls match backend routes
    writeRel(root, 'src/client/api.ts', [
      'export async function syncAll(id: string) {',
      '  await fetch("/api/v1/users?limit=20");',
      '  await axios.get<unknown>(`/api/v1/users/${id}`);',
      '  await fetch(`/api/orders/${id}`, { method: "PATCH" });',
      '  await axios.delete(`/api/v1/items/${id}`);',
      '}',
    ].join('\n'));
    const fixed = extractRoutesAndClientCalls(root);
    assert.equal(fixed.mismatches.length, 0);
  } finally {
    removeDir(root);
  }
});

test('REC-G3 & REC-G4: verifies [SC-*] traceability (--strict) and .env.example variable parity', () => {
  const root = tempDir('boomopen-rec-g3-g4-');
  try {
    writeRel(root, '.env.example', 'DATABASE_URL=postgres://localhost:5432/app\n');
    writeRel(root, 'src/index.ts', [
      '// process.env.COMMENTED_OUT_SECRET',
      'const { DATABASE_URL } = process.env;',
      'const mode = process.env.NODE_ENV;',
      'const stripeKey = process.env.STRIPE_SECRET_KEY;',
      'const pubUrl = import.meta.env.VITE_PUBLIC_API;',
      'export const cfg = { DATABASE_URL, mode, stripeKey, pubUrl };',
    ].join('\n'));
    writeRel(root, 'PLAN-billing.md', [
      '# Implementation Plan — Billing',
      '## Acceptance Criteria',
      '- AC1: Configure Stripe webhook',
      '## Wave 1: Core',
      '### Task 1.1 (REQ-101): Billing Config',
      '- **Agent**: `backend-engineer#1`',
      '- **Source Doc**: `docs/spec.md#L40-L62`',
      '- **Acceptance**: `AC1`',
      '- **OWNED_FILES**: `src/index.ts`',
      '- **Test Files**: `tests/billing.test.ts`',
      '- **Verify**: `node -e "process.exit(0)"`',
      '- [ ] `[SC-101]` Verify webhook signature header',
      '- [x] `[SC-102]` Normalize currency cents',
    ].join('\n'));
    writeRel(root, 'tests/billing.test.ts', 'import assert from "node:assert";\nassert.equal(2 + 2, 4);\n');

    const envCheck = checkEnvParity(root);
    assert.deepEqual(envCheck.missingKeys, ['STRIPE_SECRET_KEY', 'VITE_PUBLIC_API']);

    // Non-strict mode: REC-G3 is warning, REC-G4 is blocking error
    const nonStrict = scanProjectReconciliation(root, { plan: 'PLAN-billing.md', strict: false });
    assert.equal(nonStrict.valid, false);
    assert.equal(nonStrict.warnings.length, 1);
    assert.equal(nonStrict.gates['REC-G4'].length, 2);

    // Fix .env.example; under --strict, uncited SC-101 still blocks until test cites SC-101
    writeRel(root, '.env.example', 'DATABASE_URL=postgres://localhost/db\nSTRIPE_SECRET_KEY=sk_test\nVITE_PUBLIC_API=https://api.example.com\n');
    const strictBlocked = scanProjectReconciliation(root, { plan: 'PLAN-billing.md', strict: true });
    assert.equal(strictBlocked.valid, false);
    assert.equal(strictBlocked.gates['REC-G3'].length, 1);
    assert.equal(strictBlocked.gates['REC-G4'].length, 0);

    writeRel(root, 'tests/billing.test.ts', 'import assert from "node:assert";\n// Covers [SC-101] signature check\nassert.equal(typeof "sig", "string");\n');
    assert.equal(runReconcileCli(['--plan', 'PLAN-billing.md', '--strict', '--json'], { cwd: root, silent: true }), 0);
    assert.equal(runReconcileCli(['--unknown-flag'], { cwd: root, silent: true }), 2);
  } finally {
    removeDir(root);
  }
});

test('amendPlanWithDeltaWave + cook amend-plan + cook verify-wave --wave 2.5 shards >4 files without COOK-G1 collisions', () => {
  const root = tempDir('boomopen-amend-plan-');
  try {
    const planPath = path.join(root, 'PLAN-portal.md');
    writeRel(root, 'PLAN-portal.md', [
      '# Implementation Plan — Customer Portal',
      '## Acceptance Criteria',
      '- AC1: Core widgets implemented',
      '## Wave 1: Widgets',
      '### Task 1.1 (REQ-101): Base Shell',
      '- **Agent**: `frontend-engineer#1`',
      '- **Acceptance**: `AC1`',
      '- **OWNED_FILES**: `src/index.ts`, `src/widgets/A.ts`',
      '- **Verify**: `node -e "process.exit(0)"`',
    ].join('\n'));

    for (const rel of ['src/index.ts', 'src/widgets/A.ts', 'src/widgets/B.ts', 'src/widgets/C.ts', 'src/widgets/D.ts', 'src/widgets/E.ts', 'src/api/quota.ts', 'tests/delta.test.ts']) {
      writeRel(root, rel, `export const id = "${rel}";\n`);
    }

    writeRel(root, 'RECONCILE-portal.md', [
      '# Wave 2.5 Reconcile Report',
      '```json',
      JSON.stringify({
        verdict: 'DELTA_WAVE_REQUIRED',
        gaps: [
          {
            id: 'GAP-1',
            gate: 'REC-G1',
            role: 'integrator',
            title: 'Wire widgets A..E into src/index.ts',
            files: ['src/index.ts', 'src/widgets/A.ts', 'src/widgets/B.ts', 'src/widgets/C.ts', 'src/widgets/D.ts', 'src/widgets/E.ts'],
            acceptance: ['AC1'],
          },
          {
            id: 'GAP-2',
            gate: 'REC-G3',
            role: 'backend-engineer#api',
            title: 'Implement middle-spec quota enforcement',
            files: ['src/api/quota.ts'],
            test_files: ['tests/delta.test.ts'],
            acceptance: ['AC2'],
            sub_clauses: ['SC-205'],
            source_doc: 'docs/PRD.md#L88-L112',
          },
        ],
      }, null, 2),
      '```',
    ].join('\n'));

    const exitCode = runCookCli(['amend-plan', planPath, '--from-reconcile', 'RECONCILE-portal.md'], { cwd: root, silent: true });
    assert.equal(exitCode, 0);

    const parsed = parsePlanMarkdown(fs.readFileSync(planPath, 'utf8'), 'PLAN-portal.md');
    const val = validatePlan(parsed);
    assert.equal(val.valid, true, val.errors.join('; '));
    const deltaTasks = parsed.tasks.filter((t) => t.phaseId === 'WAVE-2.5');
    assert.equal(deltaTasks.length, 3);
    for (const t of deltaTasks) assert.ok(t.ownedFiles.length <= 4);

    const packets = compileWavePackets(planPath, { cwd: root, wave: '2.5' });
    assert.equal(packets.valid, true, packets.errors.join('; '));
    assert.equal(packets.waves.length, 1);
    assert.match(packets.waves[0].shards[2].prompt, /docs\/PRD\.md#L88-L112/);
    assert.match(packets.waves[0].shards[2].prompt, /\[SC-205\]/);

    const verifyRes = verifyWaveExecution(planPath, {
      cwd: root,
      wave: '2.5',
      changedFiles: ['src/index.ts', 'src/widgets/E.ts', 'src/api/quota.ts', 'tests/delta.test.ts'],
      runVerify: true,
    });
    assert.equal(verifyRes.valid, true, verifyRes.errors.join('; '));
  } finally {
    removeDir(root);
  }
});

test('detectCookState Spec-SHA256 drift, renderShardPrompt enrichment, compilePlanToLedger sourceDoc & ledger verify --reconcile --strict-locks', () => {
  const root = tempDir('boomopen-ledger-rec-');
  try {
    spawnSync('git', ['init'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.name', 'Test'], { cwd: root, windowsHide: true });

    writeRel(root, 'docs/spec.md', '# Spec v1\n- Clause 1\n');
    const specSha = hashFileSha256(path.join(root, 'docs/spec.md'));
    writeRel(root, 'src/index.js', 'const { helper } = require("./helper.js");\nmodule.exports = { helper };\n');
    writeRel(root, 'src/helper.js', 'module.exports = { helper: () => "ok" };\n');
    writeRel(root, 'src/phase2-island.js', 'module.exports = { island: () => "unwired" };\n');
    writeRel(root, 'tests/p1.test.js', 'const assert = require("node:assert");\nassert.equal(1, 1);\n');
    writeRel(root, 'tests/p2.test.js', 'const assert = require("node:assert");\nassert.equal(2, 2);\n');

    const planMd = [
      '# Implementation Plan — Spec Sync',
      `- **Spec-SHA256**: \`docs/spec.md=sha256:${specSha}\``,
      '## Acceptance Criteria',
      '- AC1: Foundation ready',
      '- AC2: Phase 2 module wired',
      '## 🤝 Shared Interface Contracts (SHARED_CONTRACT)',
      '```js',
      '// shared contract',
      '```',
      '## Wave 1: Foundation (`Parallelizable: No`)',
      '### Task 1.1 (REQ-101): Core Helper',
      '- **Agent**: `backend-engineer#1`',
      '- **Source Doc**: `docs/spec.md#L1-L2`',
      '- **Acceptance**: `AC1`',
      '- **Sub-Clauses**: `[SC-01]`',
      '- **OWNED_FILES**: `src/index.js`, `src/helper.js`',
      '- **Test Files**: `tests/p1.test.js`',
      '- **Verify**: `node -e "process.exit(0)"`',
      '## Wave 2: Extension (`Depends On: Wave 1`)',
      '### Task 2.1 (REQ-201): Extension Module',
      '- **Agent**: `backend-engineer#2`',
      '- **Acceptance**: `AC2`',
      '- **OWNED_FILES**: `src/phase2-island.js`',
      '- **Test Files**: `tests/p2.test.js`',
      '- **Verify**: `node -e "process.exit(0)"`',
    ].join('\n');
    writeRel(root, 'PLAN-sync.md', planMd);

    // 1. detectCookState Spec-SHA256 drift check
    assert.equal(detectCookState({ cwd: root }).specDrift, false);
    writeRel(root, 'docs/spec.md', '# Spec v2 (edited)\n- Clause 1\n');
    assert.equal(detectCookState({ cwd: root }).specDrift, true);

    // 2. renderShardPrompt preserves Acceptance Criteria line + appends Source Doc, AC Specifications & Sub-Clauses
    const pkt = compileWavePackets(path.join(root, 'PLAN-sync.md'), { cwd: root, wave: 1 });
    const prompt1 = pkt.waves[0].shards[0].prompt;
    assert.match(prompt1, /- \*\*Acceptance Criteria\*\*: AC1/);
    assert.match(prompt1, /- \*\*Source Doc\*\*: `docs\/spec\.md#L1-L2`/);
    assert.match(prompt1, /AC1: Foundation ready/);
    assert.match(prompt1, /\[SC-01\]/);

    // 3. compilePlanToLedger preserves task.sourceDoc and falls back to PLAN-sync.md#L... when absent
    const { ledger, paths } = compilePlanToLedger('PLAN-sync.md', { cwd: root });
    assert.equal(ledger.features[0].source_doc, 'docs/spec.md#L1-L2');
    assert.match(ledger.features[1].source_doc, /^PLAN-sync\.md#L\d+-L\d+$/);

    // Verify Wave 1 and commit git baseline
    assert.equal(runLedgerCli(['verify', '--phase', 'WAVE-1', '--passed-tests', '1', '--reconcile'], { cwd: root, silent: true }), 0);
    spawnSync('git', ['add', '.'], { cwd: root, windowsHide: true });
    spawnSync('git', ['commit', '-m', 'wave-1-verified'], { cwd: root, windowsHide: true });

    // 4. Mutate prior phase test (`tests/p1.test.js`) + unwired `src/phase2-island.js` -> --strict-locks and --reconcile both catch violations
    writeRel(root, 'tests/p1.test.js', 'const assert = require("node:assert");\nassert.equal(1, 1); // mutated\n');
    const loaded = loadLedgerFile(paths.ledgerPath, root);
    const gateFail = verifyPhaseGate(loaded, 'WAVE-2', { cwd: root, passedTests: 2, reconcile: true, strictLocks: true });
    assert.equal(gateFail.passed, false);
    assert.ok(gateFail.violations.some((v) => v.includes('[LEDGER-LOCK]') && v.includes('tests/p1.test.js')));
    assert.ok(gateFail.violations.some((v) => v.includes('[REC-G1]') && v.includes('src/phase2-island.js')));

    // Restore prior test + wire island into src/index.js -> ledger verify passes
    spawnSync('git', ['checkout', '--', 'tests/p1.test.js'], { cwd: root, windowsHide: true });
    writeRel(root, 'src/index.js', 'const { helper } = require("./helper.js");\nconst { island } = require("./phase2-island.js");\nmodule.exports = { helper, island };\n');
    saveLedgerFile(paths.ledgerPath, loaded);
    assert.equal(runLedgerCli(['verify', '--phase', 'WAVE-2', '--passed-tests', '2', '--run-verify', '--reconcile', '--strict-locks'], { cwd: root, silent: true }), 0);
  } finally {
    removeDir(root);
  }
});

test('REC-G1 Next.js 16 proxy.ts vs src/app/_components/DeadIsland.tsx, REC-G4 bracket/Python env parity, and canonical wiring roles', () => {
  const root = tempDir('boomopen-rec-next16-env-');
  try {
    writeRel(root, '.env.example', 'DATABASE_URL=postgres://localhost/db\n');
    writeRel(root, 'src/proxy.ts', 'export function proxy() { return null; }\n');
    writeRel(root, 'src/instrumentation.ts', 'export function register() { return true; }\n');
    writeRel(root, 'src/app/dashboard/page.tsx', [
      '// process.env["COMMENTED_SECRET"]',
      'const doc = "process.env[\'FAKE_STRING_KEY\']";',
      'const k1 = process.env[\'BRACKET_SINGLE_KEY\'];',
      'const k2 = process.env["BRACKET_DOUBLE_KEY"];',
      'export default function DashboardPage() { return <div>{doc}{k1}{k2}</div>; }',
    ].join('\n'));
    writeRel(root, 'src/app/_components/DeadIsland.tsx', 'export function DeadIsland() { return <aside>Unused</aside>; }\n');
    writeRel(root, 'src/routes/orphanRoute.ts', 'export const orphan = () => true;\n');
    writeRel(root, 'src/utils/orphanUtil.ts', 'export const util = () => 1;\n');
    writeRel(root, 'services/worker.py', [
      '# os.getenv("PY_COMMENTED_OUT")',
      '"""os.environ[\'PY_IN_DOCSTRING\']"""',
      'import os',
      'A = os.getenv(\'PY_GETENV_KEY\')',
      'B = os.environ["PY_ENVIRON_BRACKET"]',
      'C = os.environ.get("PY_ENVIRON_GET", "fallback")',
    ].join('\n'));

    const envRes = checkEnvParity(root);
    assert.deepEqual(envRes.missingKeys, [
      'BRACKET_DOUBLE_KEY',
      'BRACKET_SINGLE_KEY',
      'PY_ENVIRON_BRACKET',
      'PY_ENVIRON_GET',
      'PY_GETENV_KEY',
    ]);

    const scanRes = scanProjectReconciliation(root);
    // src/proxy.ts, src/instrumentation.ts, src/app/dashboard/page.tsx are entrypoints -> NOT flagged
    assert.ok(!scanRes.gates['REC-G1'].some((e) => /proxy\.ts|instrumentation\.ts|page\.tsx/.test(e)));
    // DeadIsland.tsx under src/app/_components/ MUST be caught!
    assert.ok(scanRes.gates['REC-G1'].some((e) => /src\/app\/_components\/DeadIsland\.tsx/.test(e)));

    // Verify canonical specialist roles (zero 'integrator' roles anywhere!)
    for (const gap of scanRes.gaps) {
      assert.ok(!gap.role.includes('integrator'), `Unexpected phantom integrator role in ${JSON.stringify(gap)}`);
    }
    assert.equal(scanRes.gaps.find((g) => g.files.includes('src/app/_components/DeadIsland.tsx')).role, 'frontend-engineer#wiring-1');
    assert.equal(scanRes.gaps.find((g) => g.files.includes('src/routes/orphanRoute.ts')).role, 'backend-engineer#wiring-1');
    assert.equal(scanRes.gaps.find((g) => g.files.includes('src/utils/orphanUtil.ts')).role, 'tech-lead#wiring-1');

    // Amending a plan with scanRes.gaps produces 100% PLAN-G4 valid canonical roles
    writeRel(root, 'PLAN-next.md', [
      '# Implementation Plan — Next 16',
      '## Acceptance Criteria',
      '- AC1: Clean wiring',
      '## Wave 1: Base',
      '### Task 1.1 (REQ-101): Dashboard',
      '- **Agent**: `frontend-engineer#1`',
      '- **Acceptance**: `AC1`',
      '- **OWNED_FILES**: `src/app/dashboard/page.tsx`',
      '- **Verify**: `node -e "process.exit(0)"`',
    ].join('\n'));
    const amended = amendPlanWithDeltaWave('PLAN-next.md', { gaps: scanRes.gaps }, { cwd: root });
    assert.equal(amended.valid, true, amended.errors.join('; '));
    assert.ok(!fs.readFileSync(path.join(root, 'PLAN-next.md'), 'utf8').includes('integrator'));
  } finally {
    removeDir(root);
  }
});
