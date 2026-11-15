---
description: "🧩 Wave 2.5 Reconcile Loop — Deterministic Spec-to-Code Reconciliation, Island-Shard Wiring & Self-Completion Delta Execution"
version: "5.5"
type: reference
---

# 🧩 Wave 2.5: Spec-to-Code Reconcile & Self-Completion Loop (`v5.5`)

> **REFERENCED BY**: `implementation-loop.md`, `cook-fast.md`, `cook-hard.md`, `cook-team.md`, `code-fast.md`, `code-hard.md`, `code-team.md`, `autopilot-run.md`
> **PURPOSE**: Eliminate the #1 failure mode of parallel multi-agent coding — **"Island Shards" & "Lost-in-the-Middle Spec Omissions"** — BEFORE launching Wave 3 Testing & Adversarial Review. Whenever `boomopen reconcile` or `spec-reconciler` detects an unwired module, a mismatched `/api/...` route, a missing `.env.example` key, or an unimplemented spec sub-clause (`[SC-*]`), the orchestrator **automatically amends the plan and self-completes the missing code** (up to `3` delta rounds) instead of stopping early or handing half-wired code to QA.

---

## ⚡ STEP 1: DETERMINISTIC CLI RECONCILIATION SCAN (`REC-G1..G4`)

Immediately after **Wave 2** (`cook verify-wave --wave 2`) completes, run the deterministic reconciliation engine:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile <project_dir> [--plan "<plan-path>"] [--specs "<spec1.md,spec2.md>"] [--ledger ".boomopen/project-ledger.json"] --strict --json
```

- **`REC-G1` (Island Shard / Unwired Module Check)**: Catches any non-test module in `OWNED_FILES` / `owned_files` that is imported only by tests (0 non-test importers and not an entrypoint in `index.*`, `main.*`, `app.*`, `server.*`, `route.*`, `page.*`, `layout.*`, `middleware.*`, `cli/*`, `scripts/*`, `bin/*`, `app/**`, `pages/**`, `src/app/**`, `src/pages/**`, or `package.json`).
- **`REC-G2` (Frontend ↔ Backend Route Parity)**: Catches any literal `/api/...` `fetch()` or `axios.<verb>()` call whose normalized `:param` path + HTTP method matches `0` backend routes (`Express`/`Fastify`/`Hono`, Next.js `app/**/route.*`, `FastAPI`).
- **`REC-G3` (`[SC-*]` Sub-Clause Traceability)**: Catches any `[SC-xxx]` sub-clause in `PLAN` / specs that remains unchecked (`- [ ]`) and uncited by automated tests.
- **`REC-G4` (`.env.example` Parity)**: Catches any runtime `process.env.KEY` / `import.meta.env.KEY` missing from `.env.example` when `.env.example` is present.

---

## 🔍 STEP 2: SEMANTIC REVERSE SPEC AUDIT (`spec-reconciler`)

- **Fast Mode (`/cook:fast`, `/code:fast`)**: If Step 1 exits `0` (`0` errors, `0` warnings) and `<= 4` files were touched, skip spawning `spec-reconciler` and proceed directly to final verification.
- **Full / Team / Autopilot Modes (`/cook:hard`, `/cook:team`, `/code:hard`, `/code:team`, `/autopilot:run`)** — OR whenever Step 1 reports `>= 1` gap:
  1. Spawn (or warm-message) `spec-reconciler` (`agents/spec-reconciler.md`, `TypeName: "self"`, `Model: "inherit"`, workspace `READ_ONLY`) with the Step 1 JSON output, `PLAN-{feature}.md`, `SHARED_CONTRACT`, and `Source Doc` / `doc_slices`.
  2. `spec-reconciler` audits **backwards from spec clauses (especially the middle `30%–70%` slice) to code** and writes `<appDataDir>\brain\<conversation-id>\RECONCILE-{feature}.md` (`RequestFeedback: false`) containing either `RECONCILED_ZERO_GAPS` or a fenced `RECONCILE_DELTA` JSON block (`gaps[]`).

---

## 🔁 STEP 3: SELF-COMPLETION DELTA WAVE LOOP (MAX `3` ROUNDS UNTIL `0` GAPS)

While `RECONCILE_DELTA` (or `boomopen reconcile --json`) reports **`gaps.length > 0`** (up to `3` delta rounds: `Wave 2.5` → `Wave 2.6` → `Wave 2.7`):

1. **Auto-Amend `PLAN-{feature}.md` (`cook amend-plan`)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook amend-plan "<plan-path>" --from-reconcile "<reconcile-md-or-json-path>"
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2.5
   ```
   - `amend-plan` groups target files into disjoint `<= 4 OWNED_FILES` shards (`integrator#wiring-1..k` for cross-module parent wiring / route / `.env.example` fixes, and `{role}#delta-1..k` for missing domain sub-clauses) and validates the amended plan via `validatePlan` with zero `PLAN-G3` / `COOK-G1` collisions.
2. **Execute Delta Shards in Parallel (Warm Reuse First)**:
   - Reuse existing warm `{role#shard}` `conversationId`s via `send_message` when target files match an active domain shard, or spawn `integrator#wiring-1..k` (`TypeName: "self"`, `Model: "inherit"`) when wiring parent entrypoints (`app.ts`, router, `page.tsx`, `layout.tsx`) across shards.
   - Each delta shard implements 100% real production code + behavioral tests (`[SC-xxx]` / `AC` tagged, `0` stubs/TODOs) within its `OWNED_FILES`.
3. **Verify Delta Wave & Re-Run Deterministic Reconcile**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2.5 --git --run-verify
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile <project_dir> --plan "<plan-path>" --strict
   ```
4. **Exit Condition**: Once `boomopen reconcile ... --strict` exits `0` (`0` gaps remaining), advance immediately to **Wave 3 (Parallel Testing & Adversarial Review)**. If gaps persist after `3` delta rounds, escalate to `tech-lead` (or surface blocker report with exact remaining `gaps[]`).
