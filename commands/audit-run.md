---
description: "🔎 Audit Run — Execute Round k Read-Only Whole-Project Progressive Audit (Vertical Flows, Spec RTM & 2-Layer Security) and Pause for Human Approval"
version: "5.5"
category: validation
execution-mode: execute
---

# /audit:run — Round `k` Read-Only Progressive Audit & Human Review Gate (v5.5)

> **MISSION**: Execute Round `k` of the Multi-Round Post-Completion Audit with **100% of project source and test files locked in `READ_ONLY_FILES`**, synthesize a proof-gated Brain Artifact (`AUDIT-{project}-r{k}.md`), and **ALWAYS pause via `ask_question` for human approval** before any code is modified.

<scope>$ARGUMENTS</scope>

---

## ⚡ STEP 1: CENSUS / INITIALIZATION & ROUND `k` PROGRESSIVE SLICE (TURN 1)

1. **Initialize Audit Ledger (Only When `.boomopen/audit-ledger.json` Does Not Exist)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit init [--docs <a.md,b.md>] [--max-rounds 4] --json
   ```
   - Walks **100% of project source files** (`0` file truncation!), discovers `.boomopen/project-ledger.json` + `docs/**/*.md`, `specs/**/*.md`, `documents/**/*.md`, `PRD*.md`, `SRS*.md`, `DESIGN*.md`, `PLAN*.md`, `openapi.*`, and `README.md` (`mode: "spec_grounded"` vs zero-doc brownfield `mode: "code_inferred"`), builds vertical journeys `FLOW-01..M`, and runs deterministic static hazard detection (`empty_catch`, `n_plus_one_loop`, `api_route_mismatch`, `missing_env_example`, and per-screen UX 5-States).
2. **Extract Round `k` Focus Slice**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit slice --json
   ```

---

## 💎 STEP 2: PARALLEL READ-ONLY AUDIT SHARDS (`invoke_subagent`)

> ⛔ **STRICT READ-ONLY LOCK**: Every sub-agent spawned in Step 2 MUST list **all project source files, test files, and `.boomopen/*.json` in `READ_ONLY_FILES`** (`OWNED_FILES: NONE` or internal scratch output only). Never edit codebase files during `audit-run`!

Dispatch the Round `k` shards returned by `audit slice --json` **concurrently in a single batch** via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` (recording `role#shard -> conversationId` for Warm Session Reuse via `send_message`). Enforce `<= 3–4` files, `1` `FLOW-xx` vertical slice, or `8–10` endpoints per shard:

| Round & Progressive Focus | Parallel Specialist Shards (`Model: "inherit"`) | Mandatory Inspection Checklist |
|---------------------------|-------------------------------------------------|--------------------------------|
| **Round 1 — `SPEC_AND_VERTICAL_FLOWS`** | `reviewer#rtm-1..p` (when `spec_grounded`) + `reviewer#flow-01..m` (`1` `FLOW-xx`/shard) | **1)** Forward & Reverse Spec `<->` Code RTM (`SPEC_GAP` omissions, unimplemented acceptance rules). **2)** End-to-end vertical continuity (`UI Page -> Client fetch/axios/RPC -> Backend Route -> Service/DB Model`), DTO/schema drift, swallowed `catch {}` blocks, and mismatched `/api/...` routes. |
| **Round 2 — `SECURITY_TX_AND_PERF`** | `reviewer#reaudit` + `security-engineer#sec-1..k` (`8–10` endpoints/shard) + `performance-engineer#tx-perf` | **1)** Re-verify every Round 1 `fixed_pending_reaudit` item + 1-hop callers (`verified_closed` vs `reopened`). **2)** **2-Layer Endpoint Matrix**: Layer A Inbound AuthN/AuthZ/RBAC/IDOR/validation + Layer B Outbound PII/password-hash/secret/stacktrace leakage. **3)** Missing DB transactions, `TOCTOU` race conditions, `N+1` loop `await` queries, and unbounded memory. |
| **Round 3 — `UX_STATES_AND_OPS_READINESS`** (`nitpick_freeze: true`) | `reviewer#reaudit` + `frontend-engineer#ux-a11y` + `devops-engineer#ops` (+ `browser` / Playwright E2E) | **1)** Re-verify Round 2 fixes + 1-hop callers. **2)** Per-screen **UX 5-States** (`loading`, `empty`, `error`, `disabled`, `success`), WCAG 2.2 AA accessibility, i18n completeness, and **Visual Browser E2E Verification** (dispatching Antigravity's native `TypeName: "browser"` subagent with `Model: "flash"` or Playwright MCP / `npx playwright test` on Claude/Codex/Cursor/Copilot to verify live DOM rendering, click/form flows, `375px`/`768px`/`1440px` responsive viewports, and **`0` hydrated console/page errors** while keeping repo files strictly read-only!). **3)** Build/typecheck, DB migration safety, `.env.example` key parity, and E2E test readiness (**drop new `P3` nitpicks on untouched files**). |
| **Round 4+ — `SCOPED_DELTA_SIGNOFF`** (`nitpick_freeze: true`) | `reviewer#delta-1..k` (`<= 4` delta files/shard) | Strictly scoped to files modified in Round `k-1` + 1-hop vertical neighbors to confirm `0` regressions and `100%` fix closure. |

- **Fingerprint Suppression Guard**: Pass `suppressed_fingerprints` (`wont_fix` / `deferred` items from prior rounds) in shard prompts so critics never re-litigate user-excluded items.
- **Antigravity 2.0 `run_workflow` Fan-Out Option**: On Antigravity 2.0, Round 1's 4-lens parallel scan can also be executed via `run_workflow(ScriptPath="~/.gemini/config/skills/boomopen-workflow-kit/platforms/antigravity/workflows/audit_fanout.py", Description="Round 1 4-lens read-only project audit", Args={"scope": "<target>"})`.
- **Optional Cross-Engine Critic (`Author != Critic`)**: When `engines.reviewer = "council"` or `"cross_family"` in `/settings`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --prompt "Audit Round <k> (<focus>)"` in parallel.

---

## 🧮 STEP 3: RECORD DEDUPLICATED FINDINGS IN `.boomopen/audit-ledger.json`

Consolidate verified shard findings (filtering out unproven speculation; every finding MUST cite `file:line`, concrete failure/exploit trace, `owned_files`, and remediation) into `<appDataDir>\brain\<conversation-id>\scratch\audit-findings-r{k}.json`:

```json
{
  "round": 1,
  "reopened_checks": [
    { "id": "AUD-001", "status": "verified_closed" }
  ],
  "findings": [
    {
      "severity": "P1",
      "dimension": "vertical_flow",
      "title": "Checkout POST /api/orders swallows payment error in empty catch",
      "primary_location": "src/routes/orders.ts:48",
      "owned_files": ["src/routes/orders.ts"],
      "test_files": ["src/routes/orders.test.ts"],
      "verification_cmd": "npm test",
      "proof": "catch (err) {} at L48 returns HTTP 200 even when chargeCard() throws.",
      "remediation": "Propagate typed PaymentError and return 502 with RFC 9457 payload."
    }
  ]
}
```

Record deterministically via CLI:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit record --round <k> --input "<appDataDir>/brain/<conversation-id>/scratch/audit-findings-r<k>.json" --json
```

---

## 📊 STEP 4: COHESIVE BRAIN ARTIFACT (`AUDIT-{project}-r{k}.md`)

Write **1 single cohesive Brain Artifact** (`<= 500` lines; NEVER split into multi-file folders; use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested):
- **Path**: `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{k}.md`
- **`ArtifactMetadata`**:
  - When `state === "AWAITING_USER_APPROVAL"` (open `P0..P2` / `SPEC_GAP` exist): `{ Summary: "Round {k} Post-Completion Audit Report ({open_blockers} blocking findings awaiting approval)", UserFacing: true, RequestFeedback: true }`
  - When `state === "CONVERGED"` or `"HALTED_OSCILLATION"`: `{ Summary: "Round {k} Audit Final Convergence Report", UserFacing: true, RequestFeedback: false }`

Include inside `AUDIT-{project}-r{k}.md`:
1. **Executive Burn-Down Scorecard**: Mode (`spec_grounded` / `code_inferred`), Round `k / max_rounds` (`focus`), Open Blockers (`P0`, `P1`, `P2`, `SPEC_GAP`), Verified Closed count, Suppressed (`wont_fix`/`deferred`) count, and Monotonic Passing Tests floor.
2. **Prior-Round Fix Verification Table** (for `k >= 2`): Status of every prior `fixed_pending_reaudit` item (`✅ verified_closed` vs `⚠️ reopened`).
3. **Proof-Gated Findings (`AUD-xxx`)**: Grouped by `P0 Critical` -> `SPEC_GAP` -> `P1 High` -> `P2 Medium` -> `P3 Low`, each with clickable `[file:line](file:///...)`, **`[Confidence: HIGH|MEDIUM]`**, exploit/failure trace, `OWNED_FILES`, and surgical remediation snippet.

---

## 🛑 STEP 5: MANDATORY HUMAN APPROVAL GATE (`ask_question`)

Check `state` from `audit record --json`:
- **If `state === "CONVERGED"`**: Congratulate the user, link `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{k}.md` and [AUDIT-PROGRESS.md](file:///.boomopen/AUDIT-PROGRESS.md), and **STOP** (`0` fixes needed!).
- **If `state === "HALTED_OSCILLATION"`**: Report the oscillating finding (`reopen_count >= 2`) or `max_rounds` cap and ask the user for architectural guidance via `ask_question`.
- **If `state === "AWAITING_USER_APPROVAL"`**: **PAUSE IMMEDIATELY** — do **NOT** touch any code file! Call `ask_question` with these exact options:
  1. `(Recommended) Approve P0 + P1 + P2 fixes & auto-run Round {k+1}`
  2. `Approve P0 + P1 only`
  3. `Approve ALL (P0-P3)`
  4. `Custom filter (exclude specific AUD-xxx IDs)`
  5. `Conclude audit now`

*(Once the user selects an approval option or clicks **"Proceed"**, transition immediately into `commands/audit-fix.md`!)*
