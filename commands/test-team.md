---
description: "🔺 Team Test — 3-Wave Zero-Test-Gaming Elastic Golden Diamond (qa-team), App-Code READ_ONLY Lock, Security/Perf Test Critic & Cross-Engine Audit"
version: "5.5"
category: testing
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Single User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!). Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when uncovered production defects (`[APP_DEFECT]`) are found so Antigravity 2.0's 1-click **"Proceed"** button launches `/fix:team`, or `RequestFeedback: false` when `100%` green.
> - **Zero Multi-File Sprawl**: Never generate separate `TEST-STRATEGY`, `TEST-PLAN`, `TEST-RESULTS`, or `QA` files! Keep consolidated debate logs in `MAILBOX-{date}.md` and any shard scratch logs (`TEST-{scope}-s{k}.md`) strictly `UserFacing: false, RequestFeedback: false`.

---

# /test:team — 3-Wave Zero-Test-Gaming Elastic Golden Diamond (`agents/teams/qa-team/_team.md`)

> **MISSION**: Achieve uncompromising production test assurance via the **3-Wave `qa-team` Elastic Golden Diamond** (`qa-team-techlead` Test Architect + parallel `qa-team-executor` `tester#<layer>` shards + `qa-team-reviewer` Adversarial Security/Perf/Mutation Test Critic), strictly locking all production source code in **`READ_ONLY_FILES`**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 FAST-FORWARD, TEAM ROLES & ZERO-TEST-GAMING LAW

- 📖 **Team Protocol**: Follow `agents/teams/qa-team/_team.md` (`techlead.md`, `executor.md`, `reviewer.md`) and `commands/_ref/golden-triangle-protocol.md` (load on-demand; **never** block Turn 1 reading rule files!).
- ⚠️ **Sub-Agent Rule**: Always spawn with `invoke_subagent(TypeName: "self", Model: "inherit")` and record `role#shard → conversationId` for Warm Session Reuse (`send_message`, max 3 rounds).
- 🛡️ **Zero-Test-Gaming & `READ_ONLY_FILES` App-Code Lock**:
  - Unless `--fix` is explicitly passed, **100% of production application source files (`src/**`, `app/**`, `server/**`) are locked in `READ_ONLY_FILES`** across all waves.
  - Shards MUST NEVER mutate production code, weaken assertions, mock internal units under test, add `sleep()`, or use `it.skip` / `test.only` / `test.todo`! Real app bugs exposed by valid tests are logged as `[APP_DEFECT]`.

---

## 🎭 Wave 1 (Turn 1): RTM TEST MATRIX & SHARED HARNESS LOCK

1. **Fast-Forward Context Check**: Inspect `<appDataDir>\brain\<conversation-id>\` (`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"` if `PLAN-*.md` exists) to extract `AC1..N` and planned test paths.
2. **Parallel Wave 1 Launch (`TypeName: "self"`, `Model: "inherit"`)**:
   - **`qa-team-techlead` (`agents/teams/qa-team/techlead.md`, base: `tester`)**: Builds the **Requirements Traceability Matrix (`REQ -> AC -> Given/When/Then -> Assigned Shard`)**, locks disjoint Wave 2 `OWNED_FILES` (`<= 3–4` test files/shard), and publishes `[TASK_ASSIGNMENT]` to `MAILBOX-{date}.md` (`UserFacing: false, RequestFeedback: false`).
   - **`tester#harness` (`qa-team-executor`, `<= 3–4 OWNED_FILES`: `tests/setup.*`, `tests/mocks/*`, `tests/factories.*`)**: Locks deterministic MSW v2 network boundary handlers (`skills_library/vitest-msw-testing-patterns/SKILL.md`) and test fixtures (`READ_ONLY_FILES`: all production source code).

---

## 🎭 Wave 2: PARALLEL TEST PYRAMID SHARDS (`qa-team-executor`, `<= 3–4 OWNED_FILES` / Shard)

Dispatch disjoint `qa-team-executor` (`agents/teams/qa-team/executor.md`) shards concurrently (`READ_ONLY_FILES`: all production source files + Wave 1 harness):
- **`tester#unit-1..k`**: Domain invariants, state transitions, numeric/string/date boundaries (`0, -1, max+1, null, unicode`), fake timers.
- **`tester#integration`**: API/RPC contract schemas, DB rollback isolation, auth bypass (`expired/tampered JWT, IDOR, RBAC`), SQLi/XSS/SSRF input payloads, rate-limit & error envelopes.
- **`tester#e2e` & `tester#a11y`** *(when web/UI)*: Critical user journeys (`playwright_runner.py`), concurrency/double-submit idempotency, keyboard navigation, and WCAG 2.2 AA (`SC 2.4.11`, `SC 2.5.8` target size, ARIA states).

---

## 🎭 Wave 3: REAL EXECUTION & ADVERSARIAL CRITIC AUDIT (`qa-team-reviewer` via Warm `send_message`)

Spawn **`qa-team-reviewer`** (`agents/teams/qa-team/reviewer.md`, combined `security-engineer` + `performance-engineer` lens — **zero `tester -> tester` self-handoff!**) and optionally run Cross-Engine Critic (`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<test diff>"` when `engines.reviewer = "cross_family"`):

1. **Run Deterministic Verification Suite**:
   ```bash
   python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project-or-test-dir>
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <test-dir> --strict-phase --no-stubs
   ```
   *(Plus `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py <url-or-dir>` for E2E and `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <ui-dir>` for UI.)*
2. **Enforce `QA-G1..G4` via Warm `send_message` (`<= 3` Rounds)**:
   - **`QA-G1` (Zero Test Gaming)**: `0` edits to `READ_ONLY_FILES` app code; `0` `.skip`/`.only`/`.todo` or tautological `expect(true).toBe(true)` assertions.
   - **`QA-G2` (Adversarial Security/Perf/Edge Depth)**: OWASP auth/injection/IDOR cases, concurrency/N+1 bounds, and 100% `AC` mapping verified.
   - **`QA-G3` (Deterministic Execution)**: `0` flaky timers; every failure classified honestly as either a test bug (fixed by `tester#<shard>` via `send_message`) or a real `[APP_DEFECT]`.
   - **`QA-G4` (Clean Test Hygiene)**: `boomopen check <test-dir> --strict-phase --no-stubs` exits `0`.
3. **Consensus & Cohesive `TEST-{scope}.md` Synthesis (`qa-team-techlead`)**:
   - Stamp `✅ CONSENSUS: qa-team-techlead ✓ | qa-team-executor (shards) ✓ | qa-team-reviewer ✓` in `MAILBOX-{date}.md`.
   - Write **1 cohesive `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 500` lines)** containing the Executive Verdict, RTM Coverage Table, `[APP_DEFECT]` Dossier (with `src/file:line` & failing trace), CLI Output Proof, and Consensus Stamp.

> **⛔ HARD STOP**: Present `[TEST-{scope}.md](file:///...)`. When `[APP_DEFECT]` items exist (`RequestFeedback: true`), clicking **"Proceed"** fast-forwards straight into `/fix:team`; when `100%` green (`RequestFeedback: false`), offer `/review:team` or `/deploy:check`.
