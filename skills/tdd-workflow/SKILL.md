---
name: tdd-workflow
description: Test-Driven Development workflow principles (v5.5). RED-GREEN-REFACTOR cycle, PLAN-{task}.md Given/When/Then mapping, READ_ONLY_FILES regression test locks, and zero-test-gaming CLI verification.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 5.5.0
---

# TDD Workflow (v5.5 — Contract-First & Regression-Locked Edition)

> Write behavioral tests first, implement minimal production code to pass, refactor cleanly, and never weaken existing regression suites.

---

## 1. The TDD Cycle

```text
🔴 RED      → Translate Given/When/Then AC into a failing behavioral test
    ↓
🟢 GREEN    → Write minimal, clean production code to make the test pass
    ↓
🔵 REFACTOR → Improve cohesion & types while keeping all tests + strict checks green
```

---

## 2. The Three Laws of TDD

1. Write production code only to make a failing test pass.
2. Write only enough of a test to demonstrate a concrete behavioral failure.
3. Write only enough production code to satisfy the failing assertion cleanly.

---

## 3. Mapping `PLAN-{task}.md` `Given/When/Then` to Tests

Every task in `PLAN-{task}.md` defines `Acceptance` (`AC1..N`), `>= 5` Edge Cases, `Test Files`, and `Verify`. Map each directly to `Arrange / Act / Assert`:

| `PLAN-{task}.md` Clause | TDD Test Translation |
|-------------------------|----------------------|
| **`Given`** *(precondition / state)* | **Arrange**: Construct deterministic fixtures, mock external network boundaries (MSW v2 / in-memory repo), set initial state |
| **`When`** *(trigger / action)* | **Act**: Invoke the public API route, hook, or service function under test |
| **`Then`** *(observable outcome)* | **Assert**: Verify exact response status/payload, DOM state, or DB side effect |
| **Edge Cases Table (`EC1..EC5+`)** | Dedicated boundary tests for empty inputs, auth expiry (`401`/`403`), conflict (`409`), malformed payloads (`400`/`422`), and network timeouts |

---

## 4. RED → GREEN → REFACTOR Rules

| Phase | Mandatory Rules |
|-------|-----------------|
| **🔴 RED** | Run the test runner first and confirm the new test **fails for the expected behavioral reason** (not a syntax/import typo). Name tests by behavior (`"returns 409 Conflict when booking slot is already reserved"`). |
| **🟢 GREEN** | Implement against `SHARED_CONTRACT` types without speculative abstractions (YAGNI). Handle errors explicitly (`try/catch` / typed `Result`). |
| **🔵 REFACTOR** | Remove duplication (`>= 3` repeats), tighten TypeScript types (`0` `any`), verify file cohesion (`<= 400` soft / `<= 500` hard lines), and re-run the full suite. |

---

## 5. Multi-Agent Test-Lock & Anti-Gaming Protocol (MANDATORY)

When running `/cook`, `/code`, `/fix`, or `/autopilot` across specialist sub-agents:

### 🔒 1. Existing Regression Suite Lock (`READ_ONLY_FILES`)
- Existing regression test files (`tests/**`, `*.test.ts`) that guard previously working behavior MUST be listed in **`READ_ONLY_FILES`** for implementation shards (`backend-engineer#shard`, `frontend-engineer#shard`).
- **Rule**: An implementation shard MUST fix its production code to satisfy existing tests — **NEVER delete, comment out, or weaken an existing test assertion to make a broken build pass!** If a deliberate product spec change invalidates an old test, escalate to `tech-lead` / `tester` explicitly.

### 🛡️ 2. Zero Test Gaming & Zero Hollow Stubs (`--strict-phase --no-stubs`)
Every TDD cycle MUST pass BoomOpen's deterministic anti-stub & anti-gaming gate before completion:

```bash
# Run project tests + strict anti-gaming / anti-stub verification
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs
```

| Forbidden Pattern (Rejected by `--strict-phase --no-stubs`) | Required TDD Practice |
|-------------------------------------------------------------|-----------------------|
| `it.skip(...)`, `test.skip(...)`, `describe.skip(...)` | Fix the underlying failure or feature flag; never commit skipped tests |
| `it.only(...)`, `test.only(...)` | Run the complete test file/suite before reporting `PASS` |
| `test.todo(...)` or empty test callbacks | Implement concrete behavioral assertions before closing the task |
| Vacuous assertions (`expect(true).toBe(true)`, `assert(true)`) | Assert concrete outputs, state transitions, or thrown error codes |
| Production `vi.mock` / `jest.mock` or `NotImplementedError` | Keep mocks strictly inside test files; ship real production logic |

---

## 6. AI-Augmented Multi-Agent TDD Topologies

| Workflow | Agent Shard Allocation |
|----------|------------------------|
| **Intra-Shard TDD (`/code`, `/cook` Wave 2)** | Each `{domain}-engineer#shard` owns both its production module (`src/features/x.ts`) and colocated unit test (`src/features/x.test.ts`, `<= 3–4` files total), running RED → GREEN → REFACTOR before submitting. |
| **Adversarial Dual-Agent TDD (`/test:team`, `/cook:team` Wave 3)** | **`tester#red`** authors behavioral/integration/E2E tests directly from `PLAN-{task}.md` (`Given/When/Then` + `SHARED_CONTRACT`) while **`{domain}-engineer#shard`** implements production code with the test files locked in `READ_ONLY_FILES`. |

---

> **Remember:** The test is the executable specification. Lock existing regression tests in `READ_ONLY_FILES`, write failing behavioral tests from `Given/When/Then`, and verify with `boomopen check <dir> --strict-phase --no-stubs`.
