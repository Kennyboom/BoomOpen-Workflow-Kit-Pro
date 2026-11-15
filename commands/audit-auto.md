---
description: "🤖 Audit Auto — Explicit Unattended Multi-Round Post-Completion Audit & Auto-Remediation Loop (--auto-fix)"
version: "5.5"
category: validation
execution-mode: execute
---

# /audit:auto — Explicit Unattended Multi-Round Audit & Fix Loop (v5.5)

> **MISSION**: Execute the full 4-Round Post-Completion Audit & `RED -> GREEN` Remediation Loop **unattended** ONLY when the user explicitly invokes `/audit:auto` or passes `--auto-fix`, auto-approving `P0 + P1 + P2 + SPEC_GAP` defects across rounds until `state === "CONVERGED"` or `"HALTED_OSCILLATION"`.

<scope>$ARGUMENTS</scope>

---

## ⛔ EXPLICIT OPT-IN GUARDRAIL

- Use this workflow **ONLY** when the user explicitly typed `/audit:auto` or passed `--auto-fix` (or explicitly asked in natural language to *"auto-audit and fix everything without stopping"*).
- For standard `/audit` or `/autopilot:audit` invocations without `--auto-fix`, ALWAYS use `commands/audit-run.md` so the human reviews `AUDIT-{project}-r{k}.md` before any code mutation.

---

## 🔄 AUTONOMOUS MULTI-ROUND CONVERGENCE LOOP (`R1 .. max_rounds`)

### 1. Initialize Audit Ledger in `--auto-fix` Mode
If `.boomopen/audit-ledger.json` does not exist yet:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit init --auto-fix [--docs <a.md,b.md>] [--max-rounds 4] --json
```

### 2. Repeat For Each Round `k = current_round .. max_rounds`

1. **Read-Only Progressive Scan (`SCANNING_ROUND`)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit slice --round <k> --json`.
   - Spawn the Round `k` specialist critics (`reviewer#rtm`, `reviewer#flow-01..m`, `security-engineer#sec`, `performance-engineer#tx-perf`, `frontend-engineer#ux-a11y`, `devops-engineer#ops`) in parallel via `invoke_subagent(TypeName: "self", Model: "inherit")` with **100% of project source/test files locked in `READ_ONLY_FILES`**.
   - Consolidate proof-verified findings into `<appDataDir>\brain\<conversation-id>\scratch\audit-findings-r{k}.json` and run:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit record --round <k> --input "<appDataDir>/brain/<conversation-id>/scratch/audit-findings-r<k>.json" --json
     ```
   - Write `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{k}.md` (`ArtifactMetadata: { Summary: "Round {k} Auto-Audit Report", UserFacing: true, RequestFeedback: false }`).

2. **Check Terminal Exit Conditions**:
   - **If `state === "CONVERGED"`**: Break out of the loop — `0` open `P0..P2`/`SPEC_GAP` blockers and `0` `fixed_pending_reaudit` items remain!
   - **If `state === "HALTED_OSCILLATION"`**: Break out of the loop immediately (`reopen_count >= 2` or `k > max_rounds` cap reached) and report the oscillating finding to the user with root-cause diagnostics instead of looping infinitely.

3. **Auto-Approve Blocking Severities (`P0,P1,P2,SPEC_GAP`)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit approve --round <k> --select P0,P1,P2,SPEC_GAP --json
   ```
   - If `short_circuited === true` (`state === "CONVERGED"`), break out of the loop!

4. **Parallel `RED -> GREEN` Fix Shards & Strict Ratchet (`FIXING`)**:
   - Dispatch collision-free `fix_packets` (`<= 4 OWNED_FILES`/shard, `.boomopen/audit-ledger.json` + `locked_regression_tests` locked in `READ_ONLY_FILES`).
   - Run full test suite + `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs`.
   - Verify and advance to Round `k+1`:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit verify-fix --round <k> --passed-tests <TOTAL_PASSED_TESTS> --locked-tests "<new_test_files>" --run-verify --json
     ```
   - Continue immediately to Round `k+1`!

---

## 📊 FINAL DELIVERABLE

Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit status` and present concise clickable `file:///` links to the final `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{final}.md` artifact and `.boomopen/AUDIT-PROGRESS.md` burn-down scorecard.
