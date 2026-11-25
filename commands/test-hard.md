---
description: "⚡⚡⚡ Comprehensive Testing — 2-Wave Elastic Parallel Test Pyramid (Unit/Integration/E2E/A11y), App-Code READ_ONLY Lock & Deterministic CLI Verification"
version: "5.5"
category: validation
execution-mode: execute
---

> **📂 Cohesive Single-File & Disjoint Shard Rule (v5.5)**:
> - **Final User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!). Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when real uncovered app bugs (`[APP_DEFECT]`) are found so Antigravity 2.0's 1-click **"Proceed"** button launches `/fix:hard`, or `RequestFeedback: false` when `100%` green.
> - **Zero Parallel Write Collisions**: Parallel `tester#*` and `scouter#*` shards **NEVER write to the same file path**! Shards own disjoint test files (`<= 3–4` test files/shard) and return structured results via message (or write disjoint `TEST-{scope}-s{k}.md` with `UserFacing: false, RequestFeedback: false`).

---

# /test:hard — Elastic Parallel Test Pyramid & Zero-Test-Gaming Verification

> **MISSION**: Build and execute comprehensive Unit, Integration, E2E, and WCAG 2.2 AA Accessibility test coverage across multi-module scopes using **Elastic Parallel Sharding (`<= 3–4` test files per shard)** while locking production application source files in **`READ_ONLY_FILES`**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX SHARDING & ZERO-TEST-GAMING LOCK

⚡ **COGNITIVE LOAD SHARDING LAW**:
$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Test Layers}\right)\right)$$
- Inspect `<appDataDir>\brain\<conversation-id>\` on Turn 1 for `PLAN-*.md`, `DESIGN-*.md`, or `DEBUG-*.md` to extract acceptance criteria (`AC1..N`) without re-scouting already mapped modules.
- **🛡️ `READ_ONLY_FILES` App-Code Lock**: Unless `--fix` is explicitly passed, **100% of production source files (`src/**`, `app/**`, `server/**`) are locked in `READ_ONLY_FILES`**. Shards MUST NEVER edit production source code, weaken assertions, mock the unit under test, use hardcoded `sleep()`, or commit `it.skip` / `test.only` / `test.todo`!
- **Capability Rule**: Always use `invoke_subagent(TypeName: "self", Model: "inherit")` and record `role#shard → conversationId` for Warm Session Reuse (`send_message`).

---

## 🎭 Wave 1 (Turn-1 Parallel Fan-Out): GAP MAPPING + SHARED HARNESS LOCK

When shared fixtures/MSW handlers do not yet exist (or scope is unscoped), launch concurrently on Turn 1:
1. **`scouter#1..k` (`<= 3–4` source files/shard)**: Map `git diff` / target modules for untested boundary values, race conditions, authz/IDOR paths, and error envelopes; return structured RTM rows via message (`READ_ONLY_FILES`: entire repo).
2. **`tester#harness` (`OWNED_FILES`: `tests/setup.*`, `tests/mocks/*`, `tests/factories.*`, `<= 3–4` files)**: Lock shared Vitest/Jest/Pytest setup, MSW v2 external boundary handlers (`skills_library/vitest-msw-testing-patterns/SKILL.md`), and deterministic data factories (`READ_ONLY_FILES`: all production source files).
*(Fast-forward straight to Wave 2 if `PLAN-*.md` already defines test files and test setup exists!)*

---

## 🎭 Wave 2: PARALLEL TEST PYRAMID SHARDS (`<= 3–4 OWNED_FILES` / Shard)

Dispatch disjoint `tester#<layer>` shards in parallel (`TypeName: "self"`, `Model: "inherit"`, `READ_ONLY_FILES`: all production source files + Wave 1 harness):

| Parallel Shard | Disjoint `OWNED_FILES` (`<= 3–4` Test Files) | Mandatory Behavioral Coverage (`skills/tdd-workflow`, `testing-patterns`, `webapp-testing`) |
|----------------|----------------------------------------------|---------------------------------------------------------------------------------------------|
| **`tester#unit-1..k`** | `tests/unit/*.test.*` (or co-located `*.test.*`) | Pure domain logic, state machines, `0/null/empty/max+1` boundaries, fake timers (zero real `setTimeout`). |
| **`tester#integration`** | `tests/integration/*.test.*` | API contract schemas, DB transaction rollback isolation, `400/401/403/404/409/422` auth & validation paths, injection payloads. |
| **`tester#e2e`** *(if web/app)* | `tests/e2e/*.spec.*` | Critical user journeys, semantic `getByRole`/`getByLabel` locators, network error recovery. |
| **`tester#a11y`** *(if UI)* | `tests/a11y/*.spec.*` | WCAG 2.2 AA keyboard focus order, `SC 2.4.11` Focus Not Obscured, `>= 24x24px` (`44pt` mobile) targets, contrast & ARIA states. |

---

## 🎭 Wave 3: DETERMINISTIC RUNNER, HYGIENE GATES & COHESIVE `TEST-{scope}.md`

Execute real verification scripts end-to-end (routing any test-code syntax/flake fixes back to warm `tester#<shard>` via `send_message`):

```bash
python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project-root> [--coverage]
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <test-dir> --strict-phase --no-stubs
```
*(Also run `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py --suite <project-root>` or `playwright_runner.py <http-url> [--a11y] [--screenshot]` when E2E tests exist, and `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <ui-dir>` when UI files are in scope.)*

### 🌐 Visual Browser E2E Verification *(Mandatory When Web/UI Routes Are in Scope)*
Static code tests cannot catch runtime hydration crashes, broken CSS layout stacking, or dead click handlers. Whenever web UI screens or frontend routes are in scope:
1. Start (or confirm) the local dev/preview server (`python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py start` or existing localhost URL).
2. Execute live **Visual Browser E2E Verification**:
   - **Antigravity 2.0**: Dispatch the native browser subagent via `invoke_subagent(TypeName: "browser", Model: "flash", Role: "Visual UI E2E Verifier", Prompt: "Open <localhost-url>, verify live DOM rendering, exercise primary click/form flows, check responsive viewports at 375px, 768px, and 1440px, and report any hydrated console/page errors or broken UI states.")` and cross-check `BROWSER_HOST_FACTS`.
   - **Claude Code / OpenAI Codex / Cursor / Copilot**: Run **Playwright MCP** browser actions or execute `npx playwright test` (and `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py <http-url> --a11y --screenshot`) to verify live DOM rendering, interactive click flows, responsive viewports (`375px` / `768px` / `1440px`), and **zero hydrated browser console/runtime errors**!

Synthesize **1 cohesive `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 500` lines)**:
1. **Executive Gate Verdict & Coverage Summary** (`Pass/Fail` counts per pyramid layer, coverage %, `QA-G1..G4` status).
2. **Requirements Traceability Matrix (`AC -> Shard -> Test File:Line -> Status`)**.
3. **Uncovered Production Defects (`[APP_DEFECT]`)** *(if any)*: Exact `src/file:line`, failing assertion output, and root-cause hint — never silence failing assertions!
4. **Deterministic CLI Verification Proof**: Verbatim `test_runner.py` and `boomopen check --strict-phase --no-stubs` exit codes.

> **⛔ HARD STOP**: Present `[TEST-{scope}.md](file:///...)`. If `[APP_DEFECT]` items exist (`RequestFeedback: true`), invite the user to click **"Proceed"** (or run `/fix:hard`) to remediate production bugs; if `100%` green (`RequestFeedback: false`), offer `/review:hard` or `/deploy:check`.
