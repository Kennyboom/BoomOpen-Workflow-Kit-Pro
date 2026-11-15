---
description: "🏛️ Autopilot Audit — End-to-End RTM Verification + Multi-Round Human-Gated Post-Completion Audit Engine (Zero Pre-Approval Mutation)"
version: "5.5"
category: orchestration
execution-mode: execute
---

# /autopilot:audit — End-to-End RTM & Multi-Round Human-Gated Audit Engine (v5.5)

> **MISSION**: Verify 100% Requirement Traceability (`REQ-101..NNN`), vertical cross-module continuity (`FLOW-01..M`), 2-Layer endpoint security/leakage, and UX/ops readiness across `.boomopen/project-ledger.json` (when present) **OR standalone brownfield/greenfield repositories** via the **Multi-Round Post-Completion Audit Engine (`boomopen audit`)** — **never mutating production or test code before human approval** unless `--auto-fix` was explicitly requested!

<scope>$ARGUMENTS</scope>

---

## ⚡ STEP 1: DETERMINISTIC LEDGER GATES + AUDIT ENGINE BOOTSTRAP (TURN 1)

1. **If `$ARGUMENTS` Explicitly Requests `--auto-fix` (or `/audit:auto`)**:
   - Run Step 1.2's `ledger validate` + `ledger audit` check (when `.boomopen/project-ledger.json` exists), then delegate directly to `commands/audit-auto.md` for unattended multi-round convergence.
2. **Conditional Project-Ledger Gate (When `.boomopen/project-ledger.json` Exists)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger validate --strict-shards
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger audit --json
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status --json
   ```
   - Captures any spec SHA-256 drift, unverified `REQ-xxx` entries, or missing `owned_files` / `test_files` as deterministic `SPEC_GAP` / `P1` inputs for Round 1 (**do NOT fix them yet — include them in the Round 1 report for user approval!**).
   - **Standalone Mode (When `.boomopen/project-ledger.json` Does NOT Exist)**: Skip `ledger validate`/`ledger audit` cleanly without error! `audit init` automatically discovers `docs/**/*.md`, `specs/**/*.md`, `documents/**/*.md`, `PRD*.md`, `SRS*.md`, `DESIGN*.md`, `PLAN*.md`, `openapi.*`, and `README.md` (`mode: "spec_grounded"`) or runs in `mode: "code_inferred"` when `0` docs exist.
3. **Initialize or Resume `.boomopen/audit-ledger.json` & Slice Round `k`**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit init [--docs <a.md,b.md>] --json
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit slice --json
   ```
   *(If `.boomopen/audit-ledger.json` already exists in `AWAITING_USER_APPROVAL` and the user just approved fixes, jump directly to Step 5 / `commands/audit-fix.md`; if in `SCANNING_ROUND` for Round `k >= 2`, skip `audit init` and run `audit slice --round <k> --json`.)*

---

## 💎 STEP 2: PARALLEL READ-ONLY MULTI-VECTOR AUDIT WAVE (`invoke_subagent`)

> ⛔ **READ-ONLY CODEBASE LOCK (MANDATORY)**: During Step 2, lock `.boomopen/project-ledger.json`, `.boomopen/audit-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and **100% of project `owned_files` / source / test files in `READ_ONLY_FILES`**. Audit shards MUST NOT edit production or test code while scanning!

Launch the Round `k` specialist shards concurrently in a single batch via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` (recording `role#shard -> conversationId` for Warm Session Reuse via `send_message`):

| Audit Vector | Specialist Shard (`Model: "inherit"`) | Mission & Progressive Round Scope |
|--------------|---------------------------------------|-----------------------------------|
| **Vector 1 — Spec `<->` Code RTM & Vertical Flows (`FLOW-01..M`)** | `reviewer#rtm` + `reviewer#flow-01..m` (`<= 3–4` files or `1` `FLOW-xx`/shard) | Compare `spec_sources` & `project-ledger.json` (`features[]`) backwards and forwards against code (`0%` silent omission) AND trace end-to-end vertical journeys (`UI -> Client fetch/axios/RPC -> Backend Route -> Service/DB`), empty `catch {}`, and `/api/...` route mismatches. |
| **Vector 2 — Re-Audit, Regression & UX/Ops Readiness** | `tester#regression` (+ `frontend-engineer#ux-a11y` in R3) | Execute the full project test suite (read-only), verify real behavioral assertions per `REQ-xxx`, re-verify prior `fixed_pending_reaudit` items + 1-hop callers (`verified_closed` vs `reopened`), and check UX 5-States (`loading/empty/error/disabled/success`) + `.env.example` parity (`nitpick_freeze: true` in `R3+`). |
| **Vector 3 — 2-Layer Endpoint Security, Leakage & TX/Perf** | `security-engineer#sec` + `performance-engineer#tx-perf` | Audit `.boomopen/contracts/SHARED_CONTRACT.md`, Inbound AuthN/AuthZ/IDOR + Outbound PII/secret/stacktrace leakage across endpoints (`<= 8–10` endpoints/shard), missing DB transactions, `TOCTOU` races, and `N+1` loop `await` calls. |

- **Optional Cross-Engine Council**: When `engines.reviewer = "council"` in `/settings`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --prompt "Audit RTM, SHARED_CONTRACT & vertical flows"` in parallel.

---

## 📊 STEP 3: RECORD ROUND `k` & WRITE COHESIVE BRAIN ARTIFACT

1. Write verified findings (including any `ledger validate` / `ledger audit` / `check --strict-phase` violations) to `<appDataDir>\brain\<conversation-id>\scratch\audit-findings-r{k}.json` and run:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit record --round <k> --input "<appDataDir>/brain/<conversation-id>/scratch/audit-findings-r<k>.json" --json
   ```
2. Synthesize **1 single cohesive Brain Artifact** (`<= 500` lines; NEVER split into folders; use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested):
   - **Round `k` Audit Report**: `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{k}.md`
     - Set `ArtifactMetadata: { Summary: "Round {k} Autopilot RTM & Whole-Project Audit Report", UserFacing: true, RequestFeedback: true }` when `state === "AWAITING_USER_APPROVAL"` (`RequestFeedback: false` when `state === "CONVERGED"`).
   - *(When `state === "CONVERGED"` and `.boomopen/project-ledger.json` exists, also write/refresh `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md` with the final `100%` verified RTM table and `RequestFeedback: false`.)*

```markdown
# 🏛️ Autopilot Multi-Round Audit & RTM Report (Round {k}): {project}

- **Audit State**: `{CONVERGED | AWAITING_USER_APPROVAL | HALTED_OSCILLATION}` | **Mode**: `{spec_grounded | code_inferred}` | **Round**: `{k}/{max_rounds}` (`{focus}`)
- **RTM Coverage**: `{verified}/{total}` (`{percent}%`) | **Open Blockers (`P0..P2/SPEC_GAP`)**: `{open_blockers}` | **Passing Tests Floor**: `{passed_tests}`

## 📋 Requirement Traceability & Prior-Fix Closure Summary
| ID (`REQ` / `AUD`) | Scope / Source Doc | Implementation & Flow | Verification / Re-Audit Status |
|:-------------------|:-------------------|:----------------------|:-------------------------------|
| `REQ-101` | `docs/SRS.md#L20-L45` | `FLOW-01` (`src/...`) | ✅ Verified |

## 🔍 Proof-Gated Findings Awaiting Human Approval (`AUD-001..N`)
- **`[AUD-001]` (`P1` | `[Confidence: HIGH]`)** — [file:line](file:///...) — Concrete failure trace, `OWNED_FILES`, and surgical patch.
```

---

## 🛑 STEP 4: STRICT HUMAN-GATED APPROVAL & MULTI-ROUND FIX LOOP

1. **If `state === "CONVERGED"`**:
   - Present clickable `file:///` links to `AUDIT-{project}-r{k}.md` (and `REPORT-autopilot-{project}.md` / `.boomopen/AUDIT-PROGRESS.md` / `.boomopen/ROADMAP-PROGRESS.md`) and **STOP** — `100%` converged with `0` open blockers!
2. **If `state === "HALTED_OSCILLATION"`**:
   - Halt automatic retries (`reopen_count >= 2` or `k > max_rounds`) and ask the user for guidance via `ask_question`.
3. **If `state === "AWAITING_USER_APPROVAL"` (Default Human-Gated Mode — ZERO Pre-Approval Edits!)**:
   - **STOP before mutating any file** and call `ask_question` with:
     1. `(Recommended) Approve P0 + P1 + P2 fixes & auto-run Round {k+1}`
     2. `Approve P0 + P1 only`
     3. `Approve ALL (P0-P3)`
     4. `Custom filter (exclude specific AUD-xxx IDs)`
     5. `Conclude audit now`
4. **Step 5 — Post-Approval Execution (`commands/audit-fix.md` -> Round `k+1`)**:
   - Once the user approves (or clicks **"Proceed"**), execute **`commands/audit-fix.md`**:
     `audit approve` -> collision-free `<= 3–4 OWNED_FILES` `RED -> GREEN` fix shards (`locked_regression_tests` + ledgers in `READ_ONLY_FILES`) -> `audit verify-fix --run-verify` -> if `.boomopen/project-ledger.json` exists and unverified phases were remediated, run `ledger verify --phase <id> --passed-tests <N>` + `ledger audit` -> **automatically chain into Round `k+1` (`commands/audit-run.md` / Step 2)** until `state === "CONVERGED"`!
