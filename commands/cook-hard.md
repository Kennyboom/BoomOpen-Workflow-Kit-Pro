---
description: "⚡⚡⚡ Full Feature — Complete feature lifecycle with Turn-1 Fast-Forward, 3-Wave Contract-First Execution & Parallel Verification"
version: "5.5"
category: engineering
execution-mode: execute
---

# /cook:hard — Complete Feature Development (3-Wave Contract-First Sharding)

> **MISSION**: End-to-end feature development with **Turn-1 Fast-Forward (`boomopen cook state`)**, elastic parallel discovery (`scouter#1..k` + `researcher#1..k`), conditional 6-Block UI/UX design (`DESIGN_CONTRACT`), machine-validated planning (`boomopen plan validate`), **3-Wave Contract-First Execution (`boomopen cook packets` + `verify-wave`)**, and parallel verification (`Model: "inherit"` Pro High default).

<feature>$ARGUMENTS</feature>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & COGNITIVE LOAD SHARDING

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — launch the active stage **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{feature}.md` exists (Approved-Plan Continuation Gate)** → **Fast-Forward directly to Stage 4 (3-Wave Execution)**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" [--design "<design-path>"]` and dispatch Wave 1 shards immediately (**0 scouting, 0 design, 0 re-planning!**).
   - **2. `DESIGN-{feature}.md` exists (no `PLAN` yet — Approved-Design Gate)** → **Fast-Forward to Stage 3 (Planning)**: Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and invoke `planner` directly (reusing `SCOUT`/`RESEARCH` if present, or running a fast `scouter` only if missing).
   - **3. `SCOUT-{feature}.md` or `RESEARCH-{feature}.md` exists (no `DESIGN`/`PLAN` yet)** → **Fast-Forward past Stage 1 (Discovery)**: Reuse existing discovery artifacts and start at Stage 2 (if UI needed) or Stage 3 (Planning).
3. **Cognitive Load Sharding Law (`≤ 3–4 files/sub-agent` or `1` research vector)**:
   $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
   Record `role#shard -> conversationId` for every spawned sub-agent (`TypeName: "self"`, `Model: "inherit"`, NEVER `flash_lite`) to reuse warm sessions via `send_message`.

---

## 📁 DELIVERABLE FILES & DAG STAGE MATRIX (CLEAN GIT TREE)

> **Cohesive Single-File Rule (`<= 500` lines)**: Write transient deliverables to `<appDataDir>\brain\<conversation-id>\` as single cohesive files (`ArtifactMetadata: { Summary, UserFacing: true, RequestFeedback: false }` during autonomous `/cook:hard`; NEVER split into `{name}/` folders).

| Stage | Workflow Phase | Execution Mode & Deterministic CLI Gate | Output Artifact (`RequestFeedback: false`) |
|-------|----------------|-----------------------------------------|--------------------------------------------|
| **Stage 1** | **Elastic Discovery (`researcher#1..k` + `scouter#1..k`)** | ⚡ Turn-1 Parallel Fan-Out *(Skipped if `SCOUT`/`RESEARCH`/`PLAN` exists)* | `RESEARCH-{feature}.md`, `SCOUT-{feature}.md` |
| **Stage 2** | **Conditional UI/UX Design (`designer`)** | Sequential only when UI is needed *(Skipped if no UI or `DESIGN`/`PLAN` exists)* → `boomopen design validate` | `DESIGN-{feature}.md` |
| **Stage 3** | **Contract-First Planning (`planner`)** | Locks DB + API + `DESIGN_CONTRACT` into 3-Wave DAG *(Skipped if `PLAN` exists)* → `boomopen plan validate` | `PLAN-{feature}.md` |
| **Stage 4** | **3-Wave Contract-First Implementation** | 🎯 Wave 1 (Foundation) → Wave 2 (Parallel Shards `≤ 3–4` files) via `boomopen cook packets` + `cook verify-wave` | Source Code + `[x]` in `PLAN-{feature}.md` |
| **Stage 5** | **Wave 3: Parallel Verification & Adversarial Review** | ⚡ Parallel `tester#1..k` + `reviewer` (+ Cross-Engine Critic & `python` UI audits) + `check --strict-phase --no-stubs` | `REVIEW-{feature}.md` (`<= 300` lines) |

---

## 🌊 STAGE 1: ELASTIC PARALLEL DISCOVERY *(Skipped When Prior Artifacts Exist)*

Launch `researcher#1..k` AND `scouter#1..k` **concurrently on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`:
- **`researcher#1..k` (`agents/researcher.md`)**: Map requirements, architectural patterns, `1,462` skills, and run `python ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "<query>" --design-system` when UI is involved → `RESEARCH-{feature}.md`.
- **`scouter#1..k` (`agents/scouter.md`)**: Map existing modules, DB schemas/migrations, CSS/Tailwind tokens, reusable components, and exact target paths (`≤ 3–4` heavy files/shard) → `SCOUT-{feature}.md`.

---

## 🎨 STAGE 2: CONDITIONAL UI/UX DESIGN *(Only If Feature Has UI & No `DESIGN-{feature}.md` Exists)*

- If UI is needed and `DESIGN-{feature}.md` does not yet exist: spawn `designer` (`agents/designer.md`, `TypeName: "self"`, `Model: "inherit"`) to author the cohesive **6-Block `DESIGN-{feature}.md`** (`<= 500` lines, OKLCH `@theme inline` tokens, 5-State Matrix, WCAG 2.2 AA, and fenced `DESIGN_CONTRACT`), then validate and extract:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<design-path>"
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"
  ```
- *(Note: Database schema design is NOT a separate pre-planning turn — fold additive DB schema/migrations directly into `PLAN-{feature}.md` **Wave 1 (`database-architect#schema`)**!)*

---

## 📋 STAGE 3: CONTRACT-FIRST 3-WAVE PLANNING *(Skipped If `PLAN-{feature}.md` Already Exists)*

Spawn `planner` (`agents/planner.md`, `TypeName: "self"`, `Model: "inherit"`) to author `<appDataDir>\brain\<conversation-id>\PLAN-{feature}.md` (`<= 500` lines) structured into the **3-Wave Contract-First Topology**:
1. **`SHARED_CONTRACT`**: Embed compilable DB/API TypeScript/Zod DTOs **plus** `DESIGN_CONTRACT` (`@theme inline` CSS + Component Props).
2. **Wave 1 (Foundation, Schema & Shared Primitives Lock)**: `database-architect#schema` (migrations/schema) + `backend-engineer#contracts` (shared DTO/Zod/error types) + `frontend-engineer#tokens-primitives` (`globals.css` `@theme inline` & shared UI primitives, `≤ 3–4 OWNED_FILES`/shard).
3. **Wave 2 (Parallel Feature Shards `Depends On: WAVE-1`, `Parallelizable: Yes`)**: `backend-engineer#api-1..k` + `frontend-engineer#screen-1..k` (+ `mobile-engineer#1..k`), each owning `≤ 3–4` disjoint files with Wave 1 foundation files locked in `READ_ONLY_FILES`.
4. **Deterministic Gate**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"` (`--sync-ledger` if `≥ 3` waves or `13+` files; must exit `0`).

---

## 🔨 STAGE 4: 3-WAVE CONTRACT-FIRST IMPLEMENTATION (`boomopen cook packets` & `verify-wave`)

1. **Wave 1 — Foundation Lock**:
   - Generate deterministic 5-Field Handoff Packets:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1
     ```
   - Dispatch Wave 1 shards (`database-architect#schema`, `backend-engineer#contracts`, `frontend-engineer#tokens-primitives`) in parallel (`TypeName: "self"`, `Model: "inherit"`), record `role#shard -> conversationId`, and gate completion:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify
     ```
2. **Wave 2 — Parallel Feature Shards (`100%` Concurrent Backend + Frontend)**:
   - Generate Wave 2 packets (automatically locking Wave 1 contracts/tokens and sibling shards' `OWNED_FILES` into `READ_ONLY_FILES`):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2
     ```
   - Dispatch `backend-engineer#api-1..k`, `frontend-engineer#screen-1..k`, and `mobile-engineer#1..k` **in parallel in the same turn**, then gate completion (routing any failures via warm `send_message`, max 3 rounds):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2 --git --run-verify
     ```

---

## 🧪 STAGE 5 (WAVE 3): PARALLEL CROSS-STACK VERIFICATION & ADVERSARIAL REVIEW

1. **Single-Turn Parallel Verification Fan-Out**: Spawn `tester#1..k` (`agents/tester.md`) AND `reviewer` (`agents/reviewer.md`, plus `security-engineer` when auth/data/API is touched) **concurrently in one wave**.
   - If Cross-Engine review is configured (`engines.reviewer` = `cross_family` / `council`), also run:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "Audit PLAN-{feature}.md implementation against SHARED_CONTRACT"
     ```
2. **Deterministic Repo & UI Quality Gates**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   If UI files were touched, run portable Python UX & WCAG 2.2 AA scripts:
   ```bash
   python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
   python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
   ```
3. **Self-Healing Fix Loop & Clean Checkpoint**: Route any test, check, UX, or review blocker to the owning warm `{role#shard}` `conversationId` via `send_message` until green. Update `PLAN-{feature}.md` checkboxes (`[x]`) and write **1 unified `REVIEW-{feature}.md` (`<= 300` lines, `RequestFeedback: false`)**.

---

## ✅ COMPLETION

Present feature completion summary with verified test results, `cook verify-wave` / `check --strict-phase --no-stubs` status, and next steps:
1. ✅ **Done** — Feature complete and verified end-to-end
2. 🚀 **Deploy** → `/deploy:preview`
3. 📝 **Docs** → `/docs:core`
