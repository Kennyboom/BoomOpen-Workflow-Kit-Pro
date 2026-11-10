'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parsePlanMarkdown,
  validatePlan,
  compilePlanToLedger,
  runPlanCli,
} = require('./plan.js');
const { loadLedgerFile, validateLedger, runLedgerCli } = require('./ledger.js');
const { runMultiEngineCouncil } = require('./conductor.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const VALID_PLAN_MD = [
  '# Implementation Plan: Zero-Trust Auth & Billing',
  '',
  '## 📌 User Request (VERBATIM)',
  '> Build zero-trust JWT authentication and billing endpoints.',
  '',
  '## 🎯 Acceptance Criteria & Edge Cases',
  '| ID | Given | When | Then | Verify |',
  '|----|-------|------|------|--------|',
  '| AC1 | Valid credentials | POST /api/auth/login | Returns signed JWT | npm test |',
  '| AC2 | Authenticated user | POST /api/billing/charge | Creates invoice | npm test |',
  '',
  '## 🤝 Shared Interface Contracts (`SHARED_CONTRACT`)',
  '```ts',
  'export interface AuthTokenDto { token: string; expiresAt: number; }',
  'export interface ChargeRequestDto { amountCents: number; currency: string; }',
  '```',
  '',
  '## Phase 1: Parallel Core Implementation (`phase_id: PHASE-1` | `Parallelizable: Yes` | `Depends On: NONE`)',
  '',
  '### Task 1.1 (REQ-101): Implement JWT Auth Service',
  '- **Agent**: `backend-engineer#auth` (`Model: "inherit"`, `<= 3-4 OWNED_FILES`)',
  '- **Acceptance**: `AC1`',
  '- **OWNED_FILES**: `src/auth/jwt.ts`, `src/auth/login.controller.ts`',
  '- **READ_ONLY_FILES**: `src/types/contracts.ts`',
  '- **Test Files**: `tests/auth/jwt.test.ts`',
  '- **Verify**: `node --test tests/auth/jwt.test.ts`',
  '',
  '### Task 1.2 (REQ-102): Implement Billing Charge Service',
  '- **Agent**: `backend-engineer#billing` (`Model: "inherit"`, `<= 3-4 OWNED_FILES`)',
  '- **Acceptance**: `AC2`',
  '- **OWNED_FILES**: `src/billing/charge.ts`, `src/billing/invoice.ts`',
  '- **READ_ONLY_FILES**: `src/types/contracts.ts`',
  '- **Test Files**: `tests/billing/charge.test.ts`',
  '- **Verify**: `node --test tests/billing/charge.test.ts`',
  '',
  '## Phase 2: E2E Integration (`phase_id: PHASE-2` | `Parallelizable: No` | `Depends On: PHASE-1`)',
  '',
  '- [ ] **Task 2.1 (REQ-103)**: Wire Gateway Router',
  '  - **Agent**: `backend-engineer#gateway`',
  '  - **Traces To**: `AC1`, `AC2`',
  '  - **OWNED_FILES**: `src/gateway/router.ts`, `tests/gateway/router.spec.ts`',
  '  - **READ_ONLY_FILES**: `src/auth/jwt.ts`, `src/billing/charge.ts`',
  '  - **Verification**: `npm test`',
  '',
].join('\n');

test('parsePlanMarkdown and validatePlan pass a cohesive multi-phase plan (PLAN-G1..G5)', () => {
  const parsed = parsePlanMarkdown(VALID_PLAN_MD, 'PLAN-auth-billing.md');
  assert.equal(parsed.title, 'Zero-Trust Auth & Billing');
  assert.equal(parsed.hasContractCodeBlock, true);
  assert.deepEqual(parsed.acceptanceCriteria, ['AC1', 'AC2']);
  assert.equal(parsed.phases.length, 2);
  assert.equal(parsed.phases[0].phase_id, 'PHASE-1');
  assert.equal(parsed.phases[0].parallelizable, true);
  assert.deepEqual(parsed.phases[1].dependsOn, ['PHASE-1']);
  assert.equal(parsed.tasks.length, 3);
  assert.equal(parsed.tasks[0].reqId, 'REQ-101');
  assert.equal(parsed.tasks[0].agent, 'backend-engineer#auth');
  assert.deepEqual(parsed.tasks[2].testFiles, ['tests/gateway/router.spec.ts']);

  const res = validatePlan(parsed);
  assert.equal(res.valid, true, res.errors.join('\n'));
  assert.equal(res.errors.length, 0);
});

test('PLAN-G1 & PLAN-G2: rejects missing handoff fields, missing SHARED_CONTRACT, and > 4 OWNED_FILES per shard', () => {
  const overloadedPlan = [
    '# Implementation Plan: Overloaded Shard',
    '',
    '## Wave 1: Parallel Execution (`Parallelizable: Yes`)',
    '### Task 1.1 (REQ-101): Giant Backend Task',
    '- **Agent**: `backend-engineer#1`',
    '- **OWNED_FILES**: `src/a.ts`, `src/b.ts`, `src/c.ts`, `src/d.ts`, `src/e.ts`',
    '- **Verify**: manual check',
    '',
    '### Task 1.2 (REQ-102): Missing Agent Task',
    '- **OWNED_FILES**: `src/ui.tsx`',
    '- **Verify**: `npm test`',
  ].join('\n');

  const res = validatePlan(overloadedPlan);
  assert.equal(res.valid, false);
  assert.ok(res.gates['PLAN-G1'].some((e) => /SHARED_CONTRACT/.test(e)), 'must flag missing SHARED_CONTRACT');
  assert.ok(res.gates['PLAN-G1'].some((e) => /REQ-101.*- \*\*Verify\*\*:/.test(e)), 'must reject vague manual check');
  assert.ok(res.gates['PLAN-G1'].some((e) => /REQ-102.*- \*\*Agent\*\*:/.test(e)), 'must flag missing Agent');
  assert.ok(res.gates['PLAN-G2'].some((e) => /REQ-101.*owns 5 files/.test(e)), 'must flag > 4 OWNED_FILES');
});

test('PLAN-G3, PLAN-G4 & PLAN-G5: rejects duplicate OWNED_FILES in parallel waves, DAG cycles, and orphan ACs', () => {
  const brokenPlan = [
    '# Implementation Plan: Collisions & Cycles',
    '',
    '## 🎯 Acceptance Criteria',
    '| ID | Given | When | Then |',
    '|----|-------|------|------|',
    '| AC1 | User | Action | Result |',
    '| AC2 | Admin | Action | Result |',
    '| AC3 | Guest | Orphan | Result |',
    '',
    '## 🤝 Shared Interface Contracts (`SHARED_CONTRACT`)',
    '- Shared DTOs locked.',
    '',
    '## Wave 1: Parallel API (`Parallelizable: Yes` | `Depends On: WAVE-2`)',
    '### Task 1.1 (REQ-101): Shard A',
    '- **Agent**: `backend-engineer#a`',
    '- **Acceptance**: `AC1`',
    '- **OWNED_FILES**: `src/shared/index.ts`, `src/a/service.ts`',
    '- **READ_ONLY_FILES**: `src/a/service.ts`',
    '- **Verify**: `npm test`',
    '',
    '### Task 1.2 (REQ-102): Shard B',
    '- **Agent**: `backend-engineer#b`',
    '- **Acceptance**: `AC2`',
    '- **OWNED_FILES**: `src/shared/index.ts`, `src/b/service.ts`',
    '- **Verify**: `npm test`',
    '',
    '## Wave 2: Follow-up (`Depends On: WAVE-1`)',
    '### Task 2.1 (REQ-103): Shard C',
    '- **Agent**: `frontend-engineer#ui`',
    '- **Acceptance**: `AC1`',
    '- **OWNED_FILES**: `src/ui/App.tsx`',
    '- **Verify**: `npm test`',
  ].join('\n');

  const res = validatePlan(brokenPlan);
  assert.equal(res.valid, false);
  assert.ok(res.gates['PLAN-G3'].some((e) => /both OWNED_FILES and READ_ONLY_FILES/.test(e)), 'must catch self lock conflict');
  assert.ok(res.gates['PLAN-G3'].some((e) => /File lock collision.*src\/shared\/index\.ts/.test(e)), 'must catch parallel shard file collision');
  assert.ok(res.gates['PLAN-G4'].some((e) => /Circular dependency/.test(e)), 'must catch WAVE-1 <-> WAVE-2 cycle');
  assert.ok(res.gates['PLAN-G5'].some((e) => /Orphan acceptance criterion "AC3"/.test(e)), 'must catch orphan AC3');
});

test('compilePlanToLedger, boomopen plan validate --sync-ledger, and boomopen ledger from-plan generate a valid ledger', () => {
  const root = tempDir('boomopen-plan-bridge-');
  try {
    const planFile = path.join(root, 'PLAN-auth-billing.md');
    fs.writeFileSync(planFile, VALID_PLAN_MD, 'utf8');

    // 1. Validate via CLI with --sync-ledger
    const valCode = runPlanCli(['validate', 'PLAN-auth-billing.md', '--sync-ledger', '--json'], { cwd: root, silent: true });
    assert.equal(valCode, 0);

    const ledgerPath = path.join(root, '.boomopen', 'project-ledger.json');
    const contractPath = path.join(root, '.boomopen', 'contracts', 'SHARED_CONTRACT.md');
    const progressPath = path.join(root, '.boomopen', 'ROADMAP-PROGRESS.md');
    assert.ok(fs.existsSync(ledgerPath));
    assert.ok(fs.existsSync(contractPath));
    assert.ok(fs.existsSync(progressPath));

    const ledger = loadLedgerFile(ledgerPath);
    assert.equal(ledger.phases.length, 2);
    assert.equal(ledger.features.length, 3);
    assert.equal(ledger.features[0].req_id, 'REQ-101');
    assert.deepEqual(ledger.features[0].owned_files, ['src/auth/jwt.ts', 'src/auth/login.controller.ts']);
    assert.deepEqual(ledger.features[0].test_files, ['tests/auth/jwt.test.ts']);

    const checkRes = validateLedger(ledger, root, { strictShards: true });
    assert.equal(checkRes.valid, true, checkRes.errors.join('; '));

    // 2. Also test `boomopen ledger from-plan` CLI subcommand
    fs.rmSync(path.join(root, '.boomopen'), { recursive: true, force: true });
    const fromPlanCode = runLedgerCli(['from-plan', 'PLAN-auth-billing.md', '--name', 'AuthBillingProject'], { cwd: root, silent: true });
    assert.equal(fromPlanCode, 0);
    assert.equal(runLedgerCli(['validate', '--strict-shards'], { cwd: root, silent: true }), 0);

    const reloaded = loadLedgerFile(ledgerPath);
    assert.equal(reloaded.project_name, 'AuthBillingProject');
    assert.match(fs.readFileSync(contractPath, 'utf8'), /AuthTokenDto/);
  } finally {
    removeDir(root);
  }
});

test('runMultiEngineCouncil enriches prompt with SHARED_CONTRACT and role#shard requirements when task === plan', async () => {
  const root = tempDir('boomopen-plan-council-');
  try {
    const capturedPrompts = {};
    const res = await runMultiEngineCouncil({
      cwd: root,
      runId: 'council-plan-01',
      task: 'plan',
      engines: ['claude', 'codex', 'antigravity'],
      prompt: 'Plan distributed rate limiter',
      mockProbes: {
        claude: { available: true, bin: 'claude' },
        codex: { available: true, bin: 'codex' },
        antigravity: { available: true, bin: 'agy' },
      },
      mockRunner: async (engine, _invocation, opts) => {
        capturedPrompts[engine] = opts.promptText;
        return { ok: true, exitCode: 0, stdout: '- Lock TokenBucket interface in SHARED_CONTRACT', stderr: '', durationMs: 5 };
      },
    });
    assert.equal(res.ok, true);
    for (const engine of ['claude', 'codex', 'antigravity']) {
      assert.match(capturedPrompts[engine], /\[COUNCIL PLANNER REQUIREMENTS\]/);
      assert.match(capturedPrompts[engine], /SHARED_CONTRACT/);
      assert.match(capturedPrompts[engine], /role#shard/);
    }
  } finally {
    removeDir(root);
  }
});
