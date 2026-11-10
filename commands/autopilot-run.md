---
description: "🏛️ Autopilot Run — Execute Active Project Phase via Scoped Context Slice, Elastic Golden Diamond Swarm, Cross-Engine Conductor, and 4-Layer Anti-Regression Ratchet"
version: "5.5"
category: orchestration
execution-mode: execute
---

# /autopilot:run — Incremental Multi-Phase Execution & 4-Layer Quality Ratchet

> **MISSION**: Execute the active phase (`Phase K`) from `.boomopen/project-ledger.json` with **Zero-Prompt Onboarding (~2,000-token Scoped Context Slice)**, **Direct Ledger/Plan-to-Executor Dispatch (`≤ 3–4` files/shard, 0 middleman re-planning hop)**, **Warm Session Reuse (`send_message`)**, and the **Mandatory 4-Layer Phase Quality Ratchet**.

<phase_or_options>$ARGUMENTS</phase_or_options>

---

## ⚡ STEP 1: GATE 0 — ZERO-PROMPT ONBOARDING & PRE-PHASE SANITY CHECK

Do **NOT** re-read all project documentation, re-spawn a middleman re-sharding agent, or escalate back into planning! Load only the ~2,000-token **Scoped Context Slice** for the current phase:

1. **Validate Ledger, Inspect State & Load Active Phase Slice**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger validate --strict-shards
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next
   ```
   - If `.boomopen/project-ledger.json` does not exist yet:
     - If `cook state` finds an approved `PLAN-{project}.md`, bootstrap via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger from-plan "<plan-path>"` and continue immediately.
     - Otherwise, hand off to `commands/autopilot-init.md` (`/autopilot:init`).
2. **Extract the 5 Scoped Inputs for `Phase K`**:
   - **Active Phase Requirements (`pending_requirements`)**: Only the pending `REQ-xxx` items belonging to `Phase K`.
   - **Exact Document Slices (`doc_slices`)**: Read **only** the `source_doc` line ranges (`read_file` with `StartLine`/`EndLine`) cited by `Phase K`'s `REQ-xxx` items.
   - **Shared Contract**: Read `.boomopen/contracts/SHARED_CONTRACT.md`.
   - **Baseline Passed Tests (`baseline_passed_tests`)**: Minimum passing test floor inherited from `Phase 1 .. Phase K-1`.
   - **Prior Phase Test Lock (`read_only_prior_tests`)**: Every test file from `Phase 1 .. Phase K-1` is **strictly locked in `READ_ONLY_FILES`** so `Phase K` shards can NEVER delete, weaken, or `.skip` prior tests!

---

## 💎 STEP 2: DIRECT LEDGER/PLAN-TO-EXECUTOR DISPATCH (`PHASE K`)

Apply the **Cognitive Load Sharding Law (`≤ 3–4` files per sub-agent shard)**:
$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Phase K Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains}\right)\right)$$

1. **Compile Deterministic Shard Handoff Packets (Zero Middleman Hop)**:
   - Group `Phase K`'s `REQ-xxx` items directly by their `role_shard` (`database-architect#schema`, `backend-engineer#1..k`, `frontend-engineer#1..k`, etc.) with **disjoint `owned_files` (`≤ 3–4` files/shard)** — never insert an extra middleman `tech-lead` or re-planning hop!
   - When an active `PLAN-{project}.md` accompanies the ledger, compile wave packets deterministically via:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave <k>
     ```
2. **Parallel Executor Wave (0-Turn `invoke_subagent` or Cross-Engine `conduct dispatch`)**:
   - **Native Sub-Agent Wave**: Launch all independent `Phase K` shards concurrently in a single turn via **`invoke_subagent(TypeName: "self", Role: "<role#shard>", Model: "inherit", Prompt: ...)`** and record `role#shard -> conversationId` in your Active Session Registry for **Warm Session Reuse (`send_message`)**.
   - **Cross-Engine Conductor Mode (When `engines.coder` is configured in `/settings`)**: Dispatch shards via:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role coder --engine <engines.coder> --owned "<shard_files>" --read-only "<contract,prior_tests>" --prompt "<handoff_packet>"
     ```
   - Every shard receives the **5-Field Handoff Packet**:
     1. `MISSION & ACCEPTANCE CRITERIA`: Exact `REQ-xxx` IDs, `verbatim_quote`, `acceptance_criteria`, and `doc_slices`.
     2. `SHARED_CONTRACT`: `.boomopen/contracts/SHARED_CONTRACT.md` (+ `DESIGN_CONTRACT` if UI touched).
     3. `OWNED_FILES (Exclusive Write Lock)`: Only this shard's `owned_files` + `test_files` (`≤ 3–4` files).
     4. `READ_ONLY_FILES (Do Not Edit)`: `.boomopen/project-ledger.json` (never hand-edited by sub-agents!), sibling shard files, and all `read_only_prior_tests` from `Phase 1..K-1`.
     5. `VERIFICATION & DELIVERABLE`: Production-complete code (`0` `TODO`/`FIXME`/stubs, `0` `any`, `≤ 400` soft / `≤ 500` hard lines) + real behavioural tests tagged `[REQ-xxx]`.

---

## 🛡️ STEP 3: MANDATORY 4-LAYER PHASE QUALITY RATCHET (NON-NEGOTIABLE)

`Phase K` is **FORBIDDEN** from being marked complete until all 4 gates pass `100%`:

### Gate 1 — Anti-Stub, Wave Boundary & Pragmatic 2-Tier Gate (`--strict-phase --no-stubs`)
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs
```
*(When executing from `PLAN-{project}.md`, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave <k> --run-verify`.)*
- Must report **`0` violations** (`0` `TODO`/`FIXME`/`PLACEHOLDER`, `0` `NotImplementedError`/hollow stubs, `0` `.skip`/`.only`/vacuous test assertions, `0` explicit `any`, `0` files `> 500` lines, and `0` `READ_ONLY_FILES` mutations).
- On any violation → send exact `File:Line` diagnostics to the warm `{role#shard}` `conversationId` via `send_message` to fix immediately.

### Gate 2 — Cumulative Regression Ratchet (`Phase 1 .. Phase K` Test Suite)
Run the full automated test suite (`Phase 1` through `Phase K`) and verify **`0` failed**, **`0` skipped**, and:
$$\text{PassedTests}(\text{Phase } K) \ge \text{baseline\_passed\_tests} + |\text{REQ}(\text{Phase } K)|$$
- On failure → route to the warm engineer shard via `send_message` (or escalate via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role debugger --engine <engines.debugger>`).

### Gate 3 — Deterministic Ledger Verification (`ledger verify` + `ledger status`)
Agents must **NEVER** flip `"passes": true` by hand! Run:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger verify --phase <Phase_K_ID> --passed-tests <TotalPassedTests>
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
```
- Deterministically verifies disk deliverables, runs `--strict-phase`, enforces the monotonic test ratchet, marks `Phase K` `"verified"`, advances `active_cursor` to `Phase K+1`, and refreshes `.boomopen/ROADMAP-PROGRESS.md`.

### Gate 4 — Adversarial Spec Audit (`Author ≠ Critic`) & Cohesive Brain Progress Artifact
1. Spawn/reuse `reviewer` + `tester` (+ `security-engineer` loading `security-auditor` skill when auth/data/API touched) via `invoke_subagent(TypeName: "self", Model: "inherit")` / `send_message` (or `conduct dispatch --role reviewer --engine cross_family`) against `doc_slices` and `.boomopen/contracts/SHARED_CONTRACT.md`.
2. Write/update **1 cohesive Brain status artifact** at `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`).

---

## 🔄 STEP 4: CONTINUOUS PHASE CHAINING VS. CLEAN CROSS-SESSION HANDOVER

1. **Continuous Chaining (`< 70%` Context Budget)**: If full-project execution was requested and context remains healthy (`< 70%`), **loop directly back to Step 1** for `Phase K+1`.
2. **Clean Milestone Boundary (`~70%` Context or Single-Phase Run)**: Present `.boomopen/ROADMAP-PROGRESS.md` + `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md` and output:
   > ✅ **`{Phase K}` Verified (`100%` REQ passed, Cumulative Tests: `{TotalPassedTests}`, `0` Regressions).**
   > 👉 **To execute `{Phase K+1}` with 0% context bloat, type `/autopilot:run` (or say *"tiếp tục dự án"* / *"continue project"*).**
