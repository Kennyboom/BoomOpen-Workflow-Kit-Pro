'use strict';

const { spawnSync } = require('node:child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  detectCookState,
  compileWavePackets,
  verifyWaveExecution,
  runCookPreflight,
  runCookCli,
} = require('./cook.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const SAMPLE_DESIGN_MD = `---
colors:
  primary: "oklch(0.55 0.19 255)"
surface_elevation:
  canvas: "oklch(0.985 0.004 85)"
typography:
  display: "'Instrument Serif', serif"
  sans: "'Plus Jakarta Sans', sans-serif"
  mono: "'JetBrains Mono', monospace"
spacing:
  base: "4px"
components:
  card:
    variants: ["default", "elevated"]
---
# Design Spec — Billing
- States: Default, Loading, Empty, Error, Disabled
- Contrast 4.5:1, hit target 24x24px, prefers-reduced-motion, 375px and 1440px.
\`\`\`css
@theme inline { --color-primary: oklch(0.55 0.19 255); }
\`\`\`
\`\`\`ts
export interface CardProps { variant?: 'default' | 'elevated'; }
\`\`\`
`;

const SAMPLE_PLAN_MD = `# Implementation Plan — Billing Portal

## Acceptance Criteria
- AC1: Shared tokens and API types locked in Wave 1
- AC2: Billing screen and API handler implemented in Wave 2

## 🤝 Shared Interface Contracts (SHARED_CONTRACT)
\`\`\`ts
export interface InvoiceDto { id: string; amountCents: number; }
\`\`\`

## Wave 1: Tokens & Primitives (Parallelizable: Yes)

### Task 1.1 (REQ-101): UI Tokens & Card Primitive
- **Agent**: \`frontend-engineer#tokens-primitives\`
- **Acceptance**: AC1
- **OWNED_FILES**: \`src/styles/tokens.css\`, \`src/components/Card.tsx\`
- **READ_ONLY_FILES**: \`package.json\`
- **Test Files**: \`src/components/Card.test.tsx\`
- **Verify**: \`node -e "process.exit(0)"\`

### Task 1.2 (REQ-102): Invoice Schema & DTOs
- **Agent**: \`backend-engineer#contracts\`
- **Acceptance**: AC1
- **OWNED_FILES**: \`src/api/types.ts\`
- **Verify**: \`node -e "process.exit(0)"\`

## Wave 2: Feature Screens & Endpoints (Parallelizable: Yes | Depends On: Wave 1)

### Task 2.1 (REQ-201): Billing Screen
- **Agent**: \`frontend-engineer#screen-billing\`
- **Acceptance**: AC2
- **OWNED_FILES**: \`src/screens/BillingScreen.tsx\`
- **Verify**: \`node -e "process.exit(0)"\`

### Task 2.2 (REQ-202): Billing API Handler
- **Agent**: \`backend-engineer#api-billing\`
- **Acceptance**: AC2
- **OWNED_FILES**: \`src/api/billing.ts\`
- **Verify**: \`node -e "process.exit(0)"\`
`;

test('detectCookState resolves Stage 1 -> Stage 2 -> Stage 3 -> Stage 4 progression across artifactDir & cwd', () => {
  const root = tempDir('boomopen-cook-state-');
  const brain = tempDir('boomopen-cook-brain-');
  try {
    const s1 = detectCookState({ cwd: root, artifactDir: brain });
    assert.equal(s1.recommendedStage, 'STAGE_1_DISCOVER');

    fs.writeFileSync(path.join(brain, 'SCOUT-billing.md'), '# Scout\n', 'utf8');
    const s2 = detectCookState({ cwd: root, artifactDir: brain });
    assert.equal(s2.recommendedStage, 'STAGE_2_DESIGN_OR_PLAN');
    assert.equal(s2.feature, 'billing');

    fs.writeFileSync(path.join(brain, 'DESIGN-billing.md'), SAMPLE_DESIGN_MD, 'utf8');
    const s3 = detectCookState({ cwd: root, artifactDir: brain });
    assert.equal(s3.recommendedStage, 'STAGE_3_PLAN');
    assert.match(s3.nextCommand, /boomopen design contract/);

    fs.writeFileSync(path.join(brain, 'PLAN-billing.md'), SAMPLE_PLAN_MD, 'utf8');
    const s4 = detectCookState({ cwd: root, artifactDir: brain, feature: 'billing' });
    assert.equal(s4.recommendedStage, 'STAGE_4_EXECUTE');
    assert.match(s4.nextCommand, /boomopen cook packets/);
  } finally {
    removeDir(root);
    removeDir(brain);
  }
});

test('compileWavePackets merges DESIGN_CONTRACT and auto-locks sibling + prior-wave OWNED_FILES into READ_ONLY_FILES', () => {
  const res = compileWavePackets(SAMPLE_PLAN_MD, { designMarkdown: SAMPLE_DESIGN_MD });
  assert.equal(res.valid, true);
  assert.equal(res.waves.length, 2);

  const [w1, w2] = res.waves;
  assert.equal(w1.wave, 1);
  assert.equal(w1.shards.length, 2);

  // Wave 1 Shard 1 must lock sibling Shard 2's OWNED_FILES (`src/api/types.ts`) + declared `package.json`
  const s1 = w1.shards[0];
  assert.equal(s1.id, 'REQ-101');
  assert.equal(s1.role, 'frontend-engineer#tokens-primitives');
  assert.ok(s1.readOnlyFiles.includes('package.json'));
  assert.ok(s1.readOnlyFiles.includes('src/api/types.ts'));
  assert.ok(!s1.readOnlyFiles.includes('src/styles/tokens.css'));
  assert.match(s1.prompt, /## 1\. MISSION & ACCEPTANCE CRITERIA/);
  assert.match(s1.prompt, /DESIGN_CONTRACT/);
  assert.match(s1.prompt, /@theme inline/);

  // Wave 2 Shard 1 (`BillingScreen`) must lock Wave 1 files (`src/styles/tokens.css`, `src/components/Card.tsx`, `src/api/types.ts`) + Wave 2 sibling (`src/api/billing.ts`)
  const s2 = w2.shards[0];
  assert.equal(s2.wave, 2);
  for (const locked of ['src/styles/tokens.css', 'src/components/Card.tsx', 'src/api/types.ts', 'src/api/billing.ts']) {
    assert.ok(s2.readOnlyFiles.includes(locked), `Expected Wave 2 shard to lock ${locked}`);
  }

  // Filtering `--wave 2` still preserves Wave 1 prior-wave readOnlyFiles
  const filteredW2 = compileWavePackets(SAMPLE_PLAN_MD, { wave: 2 });
  assert.equal(filteredW2.waves.length, 1);
  assert.equal(filteredW2.waves[0].wave, 2);
  assert.ok(filteredW2.waves[0].shards[0].readOnlyFiles.includes('src/styles/tokens.css'));
});

test('verifyWaveExecution enforces COOK-G1..G4 (ownership lock, existence, strict-phase check, and --run-verify)', () => {
  const root = tempDir('boomopen-cook-verify-');
  try {
    const planPath = path.join(root, 'PLAN-billing.md');
    fs.writeFileSync(planPath, SAMPLE_PLAN_MD, 'utf8');

    // Missing Wave 1 files -> COOK-G2 fails
    const missingRes = verifyWaveExecution(planPath, { cwd: root, wave: 1 });
    assert.equal(missingRes.valid, false);
    assert.equal(missingRes.gates.G2, false);

    // Write valid Wave 1 deliverables
    const write = (rel, content) => {
      const abs = path.join(root, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content, 'utf8');
    };
    write('src/styles/tokens.css', ':root { --color-primary: oklch(0.55 0.19 255); }\n');
    write('src/components/Card.tsx', 'export function Card({ label }: { label: string }) { return <div>{label}</div>; }\n');
    write('src/components/Card.test.tsx', 'import assert from "node:assert";\nassert.equal(1 + 1, 2);\n');
    write('src/api/types.ts', 'export interface InvoiceDto { id: string; amountCents: number; }\n');

    const passW1 = verifyWaveExecution(planPath, {
      cwd: root,
      wave: 1,
      changedFiles: ['src/styles/tokens.css', 'src/components/Card.tsx', 'src/components/Card.test.tsx', 'src/api/types.ts'],
      runVerify: true,
    });
    assert.equal(passW1.valid, true, passW1.errors.join('; '));
    assert.deepEqual(passW1.gates, { G1: true, G2: true, G3: true, G4: true });

    // Mutating a read-only file (`package.json`) or out-of-wave file (`src/rogue.ts`) -> COOK-G1 fails
    const g1Fail = verifyWaveExecution(planPath, {
      cwd: root,
      wave: 1,
      changedFiles: ['src/api/types.ts', 'package.json', 'src/rogue.ts'],
    });
    assert.equal(g1Fail.valid, false);
    assert.equal(g1Fail.gates.G1, false);
    assert.equal(g1Fail.errors.filter((e) => e.startsWith('[COOK-G1]')).length, 2);

    // Explicit `any` in Wave 1 TypeScript file -> COOK-G3 fails
    write('src/api/types.ts', 'export interface InvoiceDto { payload: any; }\n');
    const g3Fail = verifyWaveExecution(planPath, { cwd: root, wave: 1 });
    assert.equal(g3Fail.valid, false);
    assert.equal(g3Fail.gates.G3, false);
    assert.ok(g3Fail.errors.some((e) => /\[COOK-G3\].*explicit 'any'/.test(e)));
  } finally {
    removeDir(root);
  }
});

test('runCookPreflight and runCookCli return expected exit codes (0, 1, 2) and write packet output', () => {
  const root = tempDir('boomopen-cook-cli-');
  try {
    const planPath = path.join(root, 'PLAN-billing.md');
    const designPath = path.join(root, 'DESIGN-billing.md');
    fs.writeFileSync(planPath, SAMPLE_PLAN_MD, 'utf8');
    fs.writeFileSync(designPath, SAMPLE_DESIGN_MD, 'utf8');

    const pre = runCookPreflight(planPath, { cwd: root, designPath });
    assert.equal(pre.valid, true, pre.errors.join('; '));
    assert.equal(pre.packets.waves.length, 2);

    assert.equal(runCookCli(['help'], { cwd: root, silent: true }), 0);
    assert.equal(runCookCli(['state', '--json'], { cwd: root, silent: true }), 0);
    assert.equal(runCookCli(['preflight', planPath, '--design', designPath, '--json'], { cwd: root, silent: true }), 0);

    const outPackets = path.join(root, 'WAVE-1-PACKETS.md');
    assert.equal(runCookCli(['packets', planPath, '--design', designPath, '--wave', '1', '--out', outPackets], { cwd: root, silent: true }), 0);
    assert.ok(fs.existsSync(outPackets));
    assert.match(fs.readFileSync(outPackets, 'utf8'), /WAVE 1/);

    // Verify failure exit code 1 when deliverables missing
    assert.equal(runCookCli(['verify-wave', planPath, '--wave', '1'], { cwd: root, silent: true }), 1);

    // Verify usage / missing-path exit code 2
    assert.equal(runCookCli(['packets'], { cwd: root, silent: true }), 2);
    assert.equal(runCookCli(['packets', 'non-existent-plan.md'], { cwd: root, silent: true }), 2);
    assert.equal(runCookCli(['unknown-sub'], { cwd: root, silent: true }), 2);
  } finally {
    removeDir(root);
  }
});

test('regressions S1-BUG-05, S1-BUG-06, S1-BUG-09, S1-IMP-16, S4-P0-02 & S4-P3-02: git mv READ_ONLY detection, UTF-8 git -z, auto-git, sibling --shard --git, .boomopen.json standards, --plan alias, and strict flags', () => {
  const root = tempDir('boomopen-cook-git-reg-');
  const nonGitDir = tempDir('boomopen-cook-nongit-');
  try {
    // Explicit --git in a non-git folder must fail COOK-G1 instead of silently passing
    const minPlan = '# Plan\n## Phase 1: W1\n### Task 1.1 (REQ-101): X\n- **Agent**: `be#1`\n- **OWNED_FILES**: `src/a.ts`\n- **Verify**: `node -e ""`\n';
    fs.mkdirSync(path.join(nonGitDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(nonGitDir, 'src', 'a.ts'), 'export const a = 1;\n', 'utf8');
    const nonGitRes = verifyWaveExecution(minPlan, { cwd: nonGitDir, wave: 1, git: true });
    assert.equal(nonGitRes.valid, false);
    assert.ok(nonGitRes.errors.some((e) => /Git status check failed/.test(e)));

    // Real git repository tests: auto-git, UTF-8 filenames, sibling --shard --git, and staged git mv READ_ONLY
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    spawnSync('git', ['init'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: root, windowsHide: true });
    spawnSync('git', ['config', 'user.name', 'Test'], { cwd: root, windowsHide: true });
    fs.writeFileSync(path.join(root, 'package.json'), '{"name":"git-cook"}\n', 'utf8');
    fs.writeFileSync(path.join(root, '.boomopen.json'), JSON.stringify({ codingStandards: { preset: 'relaxed' } }), 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'contract.ts'), 'export interface Secret { id: string; }\n', 'utf8');
    spawnSync('git', ['add', '.'], { cwd: root, windowsHide: true });
    spawnSync('git', ['commit', '-m', 'init'], { cwd: root, windowsHide: true });

    const utf8AndParallelPlan = `# Implementation Plan: Parallel UTF-8
## 🤝 Shared Interface Contracts (\`SHARED_CONTRACT\`)
- \`Secret\` locked.
## Wave 1: Parallel (\`Parallelizable: Yes\`)
### Task 1.1 (REQ-101): UTF-8 Report Module
- **Agent**: \`backend-engineer#report\`
- **OWNED_FILES**: \`src/báo-cáo.ts\`
- **READ_ONLY_FILES**: \`src/contract.ts\`
- **Verify**: \`node -e "process.exit(0)"\`
### Task 1.2 (REQ-102): Large Relaxed Module
- **Agent**: \`backend-engineer#large\`
- **OWNED_FILES**: \`src/large.ts\`
- **READ_ONLY_FILES**: \`src/contract.ts\`
- **Verify**: \`node -e "process.exit(0)"\`
`;
    const planFile = path.join(root, 'PLAN-utf8.md');
    fs.writeFileSync(planFile, utf8AndParallelPlan, 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'báo-cáo.ts'), 'export const report = "ok";\n', 'utf8');
    // 550 lines passes under workspace .boomopen.json `relaxed` preset (hard limit 800)
    const lines550 = `${Array.from({ length: 550 }, (_, i) => `export const v${i} = ${i};`).join('\n')}\n`;
    fs.writeFileSync(path.join(root, 'src', 'large.ts'), lines550, 'utf8');

    // Sibling-aware `--shard backend-engineer#report --git` ignores sibling `src/large.ts` in git status
    const shardGitPass = verifyWaveExecution(planFile, { cwd: root, wave: 1, shard: 'backend-engineer#report', git: true });
    assert.equal(shardGitPass.valid, true, shardGitPass.errors.join('; '));

    // Auto-git check (without passing `git: true`) catches rogue `src/rogue.ts`, unless `--no-git` is set
    fs.writeFileSync(path.join(root, 'src', 'rogue.ts'), 'export const r = 1;\n', 'utf8');
    const autoGitFail = verifyWaveExecution(planFile, { cwd: root, wave: 1 });
    assert.equal(autoGitFail.valid, false);
    assert.ok(autoGitFail.errors.some((e) => /Unauthorized file modified.*"src\/rogue\.ts"/.test(e)));
    assert.equal(runCookCli(['verify-wave', '--plan', planFile, '--wave', '1', '--no-git'], { cwd: root, silent: true }), 0);
    fs.rmSync(path.join(root, 'src', 'rogue.ts'));

    // Staged `git mv src/contract.ts src/báo-cáo.ts` MUST fail COOK-G1 (READ_ONLY source moved)
    fs.rmSync(path.join(root, 'src', 'báo-cáo.ts'));
    spawnSync('git', ['mv', 'src/contract.ts', 'src/báo-cáo.ts'], { cwd: root, windowsHide: true });
    const renameBypassCheck = verifyWaveExecution(planFile, { cwd: root, wave: 1, git: true });
    assert.equal(renameBypassCheck.valid, false);
    assert.ok(renameBypassCheck.errors.some((e) => /Read-only file mutated.*"src\/contract\.ts"/.test(e)));

    // Typo flag `--run-tests` must fail with EXIT_USAGE (2) instead of silently passing
    assert.equal(runCookCli(['verify-wave', planFile, '--run-tests'], { cwd: root, silent: true }), 2);
  } finally {
    removeDir(root);
    removeDir(nonGitDir);
  }
});
