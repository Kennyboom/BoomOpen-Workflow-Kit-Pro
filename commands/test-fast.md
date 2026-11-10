---
description: "⚡ Quick Test — Targeted Unit/Regression Authoring with READ_ONLY App-Code Lock, test_runner.py & Zero-Stub CLI Verification"
version: "5.5"
category: validation
execution-mode: execute
---

> **📂 Deliverable & Conditional 1-Click `"Proceed"` Rule (v5.5)**:
> - Write **1 cohesive file** at `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 300` lines, zero `{name}/` folder splits; follow `deliverables.routing` outside Antigravity).
> - Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` **when failing tests expose real bugs in app code** (so clicking **"Proceed"** launches `/fix:fast`), or `RequestFeedback: false` when `100%` of tests pass!

---

# /test:fast — Rapid Zero-Test-Gaming Unit & Regression Verification

> **MISSION**: Author high-signal behavioral tests and execute the targeted suite for `<= 2` modules while enforcing the **Zero-Test-Gaming `READ_ONLY_FILES` App-Code Lock** and deterministic CLI hygiene checks.

<scope>$ARGUMENTS</scope>

---

## ⚡ MODE GATE & ZERO-TEST-GAMING LOCK

- **Mode A (Direct Execution — `<= 2` Known Files, 1 Domain)**: Author and run tests directly.
- **Mode B (Tier 1 Sub-Agent — `> 2` Files or Unscoped)**: Spawn `tester` (`invoke_subagent(TypeName: "self", Role: "QA Test Engineer", Model: "inherit", Prompt: ...)`) or reuse the warm `tester` session via `send_message`.
- **🛡️ `READ_ONLY_FILES` Production Source Lock**:
  - Lock all production source files (`src/**`, `app/**`, `server/**`) in `READ_ONLY_FILES` unless `--fix` is explicitly requested!
  - **NEVER** weaken assertions, mock internal functions under test, comment out failing checks, or add `it.skip` / `test.only` / `test.todo` to force a green exit code. If a valid test catches a real production bug, preserve the failing test as proof (`[APP_DEFECT]`)!

---

## 🔄 3-STEP DETERMINISTIC EXECUTION LOOP

1. **Inspect Contract & Author Behavioral Tests (`OWNED_FILES`: Target `*.test.*` / `*.spec.*`)**:
   - Check `<appDataDir>\brain\<conversation-id>\PLAN-*.md` (if present) to map acceptance criteria (`AC1..N`).
   - Write isolated **AAA (Arrange-Act-Assert)** tests covering:
     - **Happy Path**: Exact expected return values / state mutations (never shallow `toBeTruthy()`).
     - **Boundary & Null Cases**: `0`, `-1`, empty string/array, `null`/`undefined`, max payload limits.
     - **Error & Auth Envelopes**: Typed error codes, HTTP `400/401/403/404/422` shapes, and MSW v2 external boundary mocks (`skills/testing-patterns/SKILL.md`).
2. **Execute Real Suite & Zero-Stub Hygiene Gates (Mandatory)**:
   ```bash
   python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project-or-test-dir>
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <test-dir> --strict-phase --no-stubs
   ```
   *(If E2E applies, also run `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py <url-or-dir>`.)*
   - Fix any test-only syntax/import/mock bugs iteratively until test code passes `boomopen check --strict-phase --no-stubs` with `0` `.skip`/`.only`/`.todo` markers.
3. **Write Cohesive `TEST-{scope}.md` & Stop**:
   - Record the `AC -> Test File:Line` traceability table, exact command exit codes/pass counts, and any uncovered `[APP_DEFECT]` stack traces (`RequestFeedback: true` if defects exist → 1-click **"Proceed"** to `/fix:fast`; `RequestFeedback: false` if `100%` green).
