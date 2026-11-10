---
description: "⚡⚡⚡ Full Code — Turn-1 Fast-Forward, 3-Wave Contract-First Implementation & Parallel Verification"
version: "5.5"
category: engineering
execution-mode: execute
---

# /code:hard — 3-Wave Contract-First Implementation & Parallel Verification

> **MISSION**: Execute approved `PLAN-{task}.md` artifacts or multi-file coding requests at maximum velocity via **Turn-1 Fast-Forward (`boomopen cook state`)**, **3-Wave Contract-First Sharding (`≤ 3–4 OWNED_FILES`/shard)**, **`boomopen cook packets` + `verify-wave`**, and **1-Wave Parallel Testing + Review** (`Model: "inherit"` Pro High default).

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & ZERO-TAX DISPATCH

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, `AGENTS.md`, or `SKILLS.md` — launch sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` (load `./rules/*.md` on-demand in parallel only if needed).
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{task}.md` exists (1-Click "Proceed" / Approved-Plan Continuation)** → **Fast-Forward directly to Stage 3 (3-Wave Implementation)**:
     Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>" [--design "<design-path>"]` (plus `plan compile "<plan-path>"` if `≥ 3` waves or `13+` files) and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1 [--design "<design-path>"]`, then dispatch Wave 1 executor shards immediately (**SKIP Stage 1 Scouting & Stage 2 Planning!**).
   - **2. `DESIGN-{task}.md` exists (no `PLAN` yet)** → **Fast-Forward to Stage 2 (Planning)**:
     Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` (run `scouter` first only if no `SCOUT-{task}.md` exists) and invoke `planner` directly.
   - **3. `SCOUT-{task}.md` or `RESEARCH-{task}.md` exists (no `PLAN` yet)** → **Fast-Forward past Stage 1**: Invoke `planner` directly using the existing discovery artifact.
3. **Tiered Execution & Cohesive Deliverable Rule (`<= 500` lines)**:
   - **TIER 1**: Spawn shards via `invoke_subagent(TypeName: "self", Model: "inherit")` (NEVER `flash_lite`) and record `role#shard -> conversationId` for warm `send_message` reuse. (**TIER 2 Fallback**: embody `agents/{role}.md` only if sub-agent tool is unavailable.)
   - Write transient deliverables (`SCOUT-{task}.md`, `PLAN-{task}.md`, `REVIEW-{task}.md`) to `<appDataDir>\brain\<conversation-id>\` as **single cohesive files `<= 500` lines** (`RequestFeedback: false` during `/code:hard`; NEVER split into `{name}/` folders).

---

## 🔗 STAGE CONTINUITY MATRIX

| Stage | Workflow Phase | Execution Mode & Deterministic CLI Gate | Output Deliverable |
|-------|----------------|-----------------------------------------|--------------------|
| **Stage 1** | **Fast Parallel Codebase Scout (`scouter#1..k`)** | ⚡ Turn-1 Parallel Fan-Out *(Skipped if `SCOUT`/`PLAN` exists)* | `SCOUT-{task}.md` |
| **Stage 2** | **Contract-First 3-Wave Planning (`planner`)** | Locks `SHARED_CONTRACT` + `DESIGN_CONTRACT` *(Skipped if `PLAN` exists)* → `boomopen plan validate` | `PLAN-{task}.md` |
| **Stage 3** | **3-Wave Contract-First Implementation** | 🎯 Wave 1 (Foundation) → Wave 2 (Parallel Shards `≤ 3–4` files) via `cook packets` + `cook verify-wave` | Source Code + `[x]` in `PLAN-{task}.md` |
| **Stage 4** | **Wave 3: Fused Parallel Testing + Review** | ⚡ Single-Wave Parallel `tester#1..k` + `reviewer` + `check --strict-phase` + `python` UI audits | Unified `REVIEW-{task}.md` (`<= 300` lines) |

---

## 🔍 STAGE 1: PARALLEL CODEBASE SCOUTING *(Skipped When `SCOUT` or `PLAN` Exists)*

- Spawn `scouter` (or `scouter#1..k` across subsystems, `TypeName: "self"`, `Model: "inherit"`) to map target files, existing schemas/types, CSS `@theme` tokens, and test patterns → `<appDataDir>\brain\<conversation-id>\SCOUT-{task}.md` (`RequestFeedback: false`). (If requirements are genuinely ambiguous, ask 1 concise `ask_question` prompt alongside Turn 1.)

---

## 📋 STAGE 2: CONTRACT-FIRST 3-WAVE PLANNING *(Skipped When `PLAN-{task}.md` Exists)*

- Spawn `planner` (`agents/planner.md`, `TypeName: "self"`, `Model: "inherit"`) reading `SCOUT-{task}.md` (+ `boomopen design contract "<design-path>"` output if `DESIGN-{task}.md` exists).
- Author single cohesive `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` (`<= 500` lines, `RequestFeedback: false` in auto `/code:hard`) organized into:
  - **`SHARED_CONTRACT`**: Compilable TypeScript/Zod DTOs, API routes, DB schemas, and `DESIGN_CONTRACT` (`@theme inline` CSS + Component Props).
  - **Wave 1 (Foundation, Schema & Shared Primitives Lock)**: `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives` (`≤ 3–4 OWNED_FILES`/shard).
  - **Wave 2 (Parallel Feature Shards `Depends On: WAVE-1`, `Parallelizable: Yes`)**: `backend-engineer#api-1..k` + `frontend-engineer#screen-1..k` (+ `mobile-engineer#1..k`), `≤ 3–4` disjoint `OWNED_FILES`/shard, locking Wave 1 files in `READ_ONLY_FILES`.
- Validate before coding: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"` (must exit `0`).

---

## 🔨 STAGE 3: 3-WAVE CONTRACT-FIRST IMPLEMENTATION (`Orchestrator → role#shard`)

> **Direct Plan-to-Executor Dispatch**: Dispatch directly from `PLAN-{task}.md` to domain shards (`Model: "inherit"`) — **0 middleman `tech-lead` hop**.

1. **Wave 1 — Foundation, Schema & Shared Primitives Lock**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1
   ```
   Spawn Wave 1 shards (`database-architect#schema`, `backend-engineer#contracts`, `frontend-engineer#tokens-primitives`) concurrently (`TypeName: "self"`, `Model: "inherit"`), record `role#shard -> conversationId`, and verify:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --run-verify
   ```
2. **Wave 2 — High-Velocity Parallel Feature Shards (`≤ 3–4 OWNED_FILES`/Shard)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2
   ```
   Spawn `backend-engineer#api-1..k`, `frontend-engineer#screen-1..k`, and `mobile-engineer#1..k` **in parallel in a single turn** (Wave 1 contracts/tokens & sibling shards' files auto-locked in `READ_ONLY_FILES`). Verify Wave 2 (routing any fixes via warm `send_message`, max 3 rounds):
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2 --run-verify
   ```

---

## 🧪 STAGE 4 (WAVE 3): FUSED PARALLEL TESTING, ADVERSARIAL REVIEW & UI AUDITS

1. **Parallel Verification Fan-Out (Single Wave — Do NOT Run `tester` and `reviewer` Sequentially!)**:
   Spawn `tester#1..k` (`agents/tester.md`, writes & runs tests for every `AC1..N`) AND `reviewer` (`agents/reviewer.md`, audits `SHARED_CONTRACT` / `DESIGN_CONTRACT`, security, performance, and Pragmatic 2-Tier rules; add `security-engineer` when auth/data/API is touched) **in parallel in the same turn**.
   - Optional Cross-Engine Critic (when `engines.reviewer` = `cross_family` / `council`):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "Audit PLAN-{task}.md implementation against SHARED_CONTRACT"
     ```
2. **Mandatory CLI & Portable UI Quality Gates**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   Whenever UI/frontend files were modified, run portable Python UX & WCAG 2.2 AA checks:
   ```bash
   python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
   python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
   ```
3. **Warm Self-Healing & Single Verification Artifact**: Route any failure or review blocker to the owning warm `{role#shard}` `conversationId` via `send_message` until green. Mark `[x]` in `PLAN-{task}.md` and write **1 cohesive `<appDataDir>\brain\<conversation-id>\REVIEW-{task}.md` (`<= 300` lines, `RequestFeedback: false`)** combining test results, CLI gate proof, and review sign-off.

---

## ✅ COMPLETION

Present the verified implementation summary with:
1. ✅ **Done** — Implemented, tested, and verified across all waves
2. 🚀 **Deploy** → `/deploy:preview`
3. 📝 **Docs** → `/docs:core`
