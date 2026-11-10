'use strict';

/**
 * Regression suite for Vector 3 CLI Compilers, Fences, Argument Parser, Plan DAG & Cook Locks (`[V3-CLI-03..07]`).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parseSubcommandArgs, splitCommaOption } = require('./cli-args.js');
const { stripMarkdownFences, extractFencedBlocks } = require('./markdown-fences.js');
const { validateResearch } = require('./research.js');
const { validatePlan } = require('./plan.js');
const { verifyWaveExecution } = require('./cook.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

test('V3-CLI-03: validatePlan detects task-level circular dependencies (PLAN-G4) and does not skip PLAN-G3 lock collision on mutual cycles', () => {
  const cyclicTasksPlan = [
    '# Implementation Plan: Cyclic Tasks',
    '',
    '## 🤝 Shared Interface Contracts (SHARED_CONTRACT)',
    '```ts',
    'export interface Shared { id: string; }',
    '```',
    '',
    '## Wave 1 — Parallel Build (Parallel: Yes)',
    '### Task 1.1 (REQ-101): First Shard',
    '- **Agent**: `backend-engineer#1`',
    '- **Depends On**: `REQ-102`',
    '- **OWNED_FILES**: `src/shared.ts`',
    '- **Verify**: `node -e "process.exit(0)"`',
    '',
    '### Task 1.2 (REQ-102): Second Shard',
    '- **Agent**: `backend-engineer#2`',
    '- **Depends On**: `REQ-101`',
    '- **OWNED_FILES**: `src/shared.ts`',
    '- **Verify**: `node -e "process.exit(0)"`',
  ].join('\n');

  const res = validatePlan(cyclicTasksPlan);
  assert.equal(res.valid, false);
  assert.ok(res.gates['PLAN-G4'].some((e) => /Circular task dependency/i.test(e)), res.errors.join('\n'));
  assert.ok(res.gates['PLAN-G3'].some((e) => /File lock collision/i.test(e)), res.errors.join('\n'));

  // One-way task dependency using Task-1.1 identifier is valid and does not cycle
  const validSequentialByTaskId = [
    '# Implementation Plan: Sequential By Task ID',
    '',
    '## 🤝 Shared Interface Contracts (SHARED_CONTRACT)',
    '```ts',
    'export interface Shared { id: string; }',
    '```',
    '',
    '## Wave 1 — Sequential Tasks (Parallel: Yes)',
    '### Task 1.1 (REQ-101): Base Setup',
    '- **Agent**: `backend-engineer#1`',
    '- **OWNED_FILES**: `src/shared.ts`',
    '- **Verify**: `node -e "process.exit(0)"`',
    '',
    '### Task 1.2 (REQ-102): Follow-up Extension',
    '- **Agent**: `backend-engineer#2`',
    '- **Depends On**: `Task 1.1`',
    '- **OWNED_FILES**: `src/shared.ts`',
    '- **Verify**: `node -e "process.exit(0)"`',
  ].join('\n');
  const seqRes = validatePlan(validSequentialByTaskId);
  assert.equal(seqRes.valid, true, seqRes.errors.join('\n'));
});

test('V3-CLI-04: markdown-fences supports 4-space list-indented fences & 4-backtick markdown containers; research RES-G4 ignores inline-backtick path conventions', () => {
  const listIndentedMd = [
    '1. Step one:',
    '    ```ts',
    '    const route = "/api/{topic}/{task}";',
    '    ```',
    '````markdown',
    '```json',
    '{"ok":true}',
    '```',
    '````',
  ].join('\n');

  const stripped = stripMarkdownFences(listIndentedMd);
  assert.ok(!stripped.includes('{topic}'));
  const blocks = extractFencedBlocks(listIndentedMd);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].lang, 'ts');
  assert.equal(blocks[1].lang, 'json');

  const researchWithInlinePathConventions = [
    '# Deep Research: Artifact Routing',
    '',
    '## 1. Context & Constraints',
    '- Save `PLAN-{task}.md` and `DESIGN-{task}.md` to `./reports/{topic}/` as documented in `cli/research.js:15`.',
    '- Reference: https://example.com/spec and `cli/plan.js:20` [HIGH].',
    '    ```ts',
    '    // Indented fence under list item',
    '    const template = "{topic}/{url}";',
    '    ```',
    '',
    '## 2. Comparison Matrix',
    '| Option | Latency | Fit |',
    '|---|---|---|',
    '| A | 10ms | High |',
    '| B | 25ms | Medium |',
    '',
    '## 3. Risks & Trade-Offs',
    '- Risk of stale cache if TTL exceeds 60s.',
    '',
    '## 4. Executive Summary & Verdict',
    '- Adopt Option A with `[HIGH]` confidence.',
    '',
    '## 5. Downstream Handoff (`HANDOFF_BRIEF`)',
    '- Proceed to `/plan` with `cli/research.js`.',
  ].join('\n');

  const resVal = validateResearch(researchWithInlinePathConventions);
  assert.equal(resVal.valid, true, resVal.errors.join('\n'));
});

test('V3-CLI-05: parseSubcommandArgs accumulates repeated string flags with commas', () => {
  const spec = {
    defaults: { readOnly: '', owned: '' },
    valueFlags: { '--read-only': 'readOnly', '--read-only-files': 'readOnly', '--owned': 'owned' },
  };
  const parsed = parseSubcommandArgs(
    ['dispatch', '--read-only', 'src/a.ts', '--read-only=src/b.ts', '--read-only-files', 'src/c.ts', '--owned', 'src/x.ts', '--owned', 'src/y.ts'],
    spec
  );
  assert.equal(parsed.error, null);
  assert.deepEqual(splitCommaOption(parsed.flags.readOnly), ['src/a.ts', 'src/b.ts', 'src/c.ts']);
  assert.deepEqual(splitCommaOption(parsed.flags.owned), ['src/x.ts', 'src/y.ts']);
});

test('V3-CLI-07: validatePlan and verifyWaveExecution allow a specific OWNED_FILES child inside a broader READ_ONLY_FILES directory', () => {
  const root = tempDir('boomopen-v3-carveout-');
  try {
    fs.mkdirSync(path.join(root, 'src', 'auth'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src', 'auth', 'login.ts'), 'export const login = () => true;\n', 'utf8');
    fs.writeFileSync(path.join(root, 'src', 'auth', 'frozen.ts'), 'export const frozen = true;\n', 'utf8');

    const carveOutPlan = [
      '# Implementation Plan: Directory Carve-Out',
      '',
      '## Wave 1 — Targeted Edit (Parallel: No)',
      '### Task 1.1 (REQ-101): Update Login Only',
      '- **Agent**: `backend-engineer#auth`',
      '- **OWNED_FILES**: `src/auth/login.ts`',
      '- **READ_ONLY_FILES**: `src/auth`',
      '- **Verify**: `node -e "process.exit(0)"`',
    ].join('\n');

    const planVal = validatePlan(carveOutPlan);
    assert.equal(planVal.valid, true, planVal.errors.join('\n'));

    // Mutating the carved-out owned file `src/auth/login.ts` passes COOK-G1
    const okWave = verifyWaveExecution(carveOutPlan, {
      cwd: root,
      changedFiles: ['src/auth/login.ts'],
      noGit: true,
    });
    assert.equal(okWave.valid, true, okWave.errors.join('\n'));

    // Mutating any other file inside `src/auth/` fails COOK-G1
    const badWave = verifyWaveExecution(carveOutPlan, {
      cwd: root,
      changedFiles: ['src/auth/login.ts', 'src/auth/frozen.ts'],
      noGit: true,
    });
    assert.equal(badWave.valid, false);
    assert.ok(badWave.errors.some((e) => /Read-only file mutated.*"src\/auth\/frozen\.ts"/.test(e)), badWave.errors.join('\n'));

    // Owning parent directory `src/auth` while listing child `src/auth/frozen.ts` in READ_ONLY_FILES is still rejected by PLAN-G3
    const invalidParentOwnPlan = carveOutPlan
      .replace('- **OWNED_FILES**: `src/auth/login.ts`', '- **OWNED_FILES**: `src/auth`')
      .replace('- **READ_ONLY_FILES**: `src/auth`', '- **READ_ONLY_FILES**: `src/auth/frozen.ts`');
    assert.equal(validatePlan(invalidParentOwnPlan).valid, false);
  } finally {
    removeDir(root);
  }
});
