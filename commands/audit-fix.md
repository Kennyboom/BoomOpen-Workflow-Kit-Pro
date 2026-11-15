---
description: "🔧 Audit Fix — Apply Human Approval Decisions, Dispatch Collision-Free RED->GREEN Fix Shards & Auto-Chain into Round k+1 Re-Audit"
version: "5.5"
category: validation
execution-mode: execute
---

# /audit:fix — Human-Approved `RED -> GREEN` Fix Wave & Round `k+1` Chain (v5.5)

> **MISSION**: Record the user's approval/exclusion choices in `.boomopen/audit-ledger.json`, execute collision-free `<= 3–4 OWNED_FILES` `RED -> GREEN` fix shards with prior regression tests locked in `READ_ONLY_FILES`, pass the strict-phase + monotonic test ratchet, and **automatically chain directly into `commands/audit-run.md` for Round `k+1`**.

<decisions>$ARGUMENTS</decisions>

---

## ⚡ STEP 1: APPLY USER DECISIONS & COMPILE COLLISION-FREE FIX PACKETS

Map the user's choice from `ask_question` (or `$ARGUMENTS`) to `audit approve`:
- **`(Recommended) Approve P0 + P1 + P2 fixes & auto-run Round {k+1}`** (or `"Proceed"`): `--select P0,P1,P2,SPEC_GAP`
- **`Approve P0 + P1 only`**: `--select P0,P1`
- **`Approve ALL (P0-P3)`**: `--select all`
- **`Custom filter (exclude specific AUD-xxx IDs)`**: `--select P0,P1,P2,SPEC_GAP --exclude <AUD-005,...> [--defer <AUD-008,...>]`
- **`Conclude audit now`**: Exclude/defer remaining open items (`--select P0 --exclude <all_open_ids>`) to trigger clean termination.

Run deterministically:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit approve [--round <k>] [--select <...>] [--exclude <AUD-...>] [--defer <AUD-...>] --json
```

- **⚡ Zero-Approved-Mutation Short-Circuit**:
  If `audit approve --json` returns `"state": "CONVERGED"` (`"short_circuited": true` because `0` findings were `"approved"` and `0` are `"fixed_pending_reaudit"`), present the final `.boomopen/AUDIT-PROGRESS.md` burn-down scorecard and **STOP IMMEDIATELY** (`0` unnecessary re-audit rounds!).

---

## 🛠️ STEP 2: DISPATCH COLLISION-FREE `RED -> GREEN` FIX SHARDS (`<= 3–4 OWNED_FILES`)

When `state === "FIXING"`, iterate over `fix_packets` returned by `audit approve --json` (grouped by `wave`, with `<= 4 OWNED_FILES` per shard and `0` intra-wave file overlap). Dispatch all shards in the active sub-wave **concurrently in 1 turn** via `invoke_subagent(TypeName: "self", Model: "inherit")` (or warm `send_message` to existing specialist `conversationId`s):

Each shard's **5-Field Handoff Packet** MUST enforce:
1. **`1. MISSION & ACCEPTANCE CRITERIA`**: Resolve assigned `finding_ids` (`AUD-xxx`) completely with zero hollow stubs, zero swallowed catches, and zero collateral refactors outside scope.
2. **`2. SHARED_CONTRACT`**: Preserve existing API/DB/UI contracts in `.boomopen/contracts/SHARED_CONTRACT.md` (unless a `SPEC_GAP` explicitly requires updating the contract first).
3. **`3. OWNED_FILES`**: Exact `packet.owned_files` + new/assigned `packet.test_files` (`<= 4` source files).
4. **`4. READ_ONLY_FILES`**: Exact `packet.read_only_files` — **ALWAYS locking `.boomopen/audit-ledger.json`, `.boomopen/project-ledger.json` (if present), sibling shard files, and all `locked_regression_tests` from prior rounds** so sub-agents never weaken existing tests or hand-edit ledger state!
5. **`5. VERIFICATION & DELIVERABLE (`RED -> GREEN` Ratchet)**:
   - **RED**: Add or extend a real behavioral regression test reproducing each `AUD-xxx` defect.
   - **GREEN**: Implement the minimal production-grade fix until all unit/integration tests and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs` pass with `0` errors.

---

## 🛡️ STEP 3: DETERMINISTIC STRICT-PHASE & MONOTONIC TEST RATCHET (`verify-fix`)

After all fix shards complete, run the full project test suite and strict code gate, then lock the round via `audit verify-fix`:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit verify-fix --round <k> --passed-tests <TOTAL_PASSED_TESTS> --locked-tests "<comma_separated_new_test_files>" --run-verify --json
```

- **Iterative Self-Healing**: If `check --strict-phase --no-stubs` or `audit verify-fix` reports any violation (e.g. leftover stub comment, >500-line file, explicit `any`, failing `verification_cmd`, or `passedTests < current_passed_tests`), immediately fix the offending `OWNED_FILES` and re-run `audit verify-fix` until exit code `0`!
- Upon exit code `0`, `audit verify-fix` automatically:
  - Appends new regression test files to `locked_regression_tests`
  - Marks all `"approved"` items `"fixed_pending_reaudit"`
  - Advances `current_round` to `k + 1` (`state = "SCANNING_ROUND"`) and refreshes `.boomopen/AUDIT-PROGRESS.md`.

---

## 🔄 STEP 4: AUTOMATIC CHAIN INTO ROUND `k+1` (`commands/audit-run.md`)

Do **NOT** stop after `verify-fix`! Immediately load and execute **`commands/audit-run.md`** for **Round `k+1`** so:
1. Every `"fixed_pending_reaudit"` item from Round `k` (+ its 1-hop callers) is independently re-audited (`verified_closed` vs `reopened`),
2. Round `k+1`'s progressive focus (`SECURITY_TX_AND_PERF` in R2, `UX_STATES_AND_OPS_READINESS` in R3, or `SCOPED_DELTA_SIGNOFF` in R4+) executes in read-only mode, and
3. Execution converges automatically if `0` blockers remain, or pauses cleanly at Round `k+1`'s `ask_question` Human Review Gate!
