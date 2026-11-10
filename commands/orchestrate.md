---
description: Coordinate multiple agents for complex tasks using Elastic Parallel Sharding, Contract-First Parallel Fan-Out, Direct Plan Dispatch, and Warm Sub-agent Reuse.
version: "5.5"
category: orchestration
execution-mode: execute
---

# 🎼 /orchestrate — 3-Wave Contract-First Elastic Swarm Orchestrator (v5.5)

> **📂 Brain Artifacts First (Clean Git Tree)**: Write all transient deliverables (`PLAN`, `SCOUT`, `RESEARCH`, `DESIGN`, `REVIEW`, `REPORT`, `MAILBOX`) to `<appDataDir>\brain\<conversation-id>\` as **single cohesive files (`<= 500` lines; NEVER split into folders)** with explicit `ArtifactMetadata` (`RequestFeedback: true` ONLY on interactive approval-gated `PLAN-{feature}.md`; `RequestFeedback: false` on `SCOUT`, `RESEARCH`, `DESIGN`, `MAILBOX`, `REVIEW`, and `REPORT` artifacts). Use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested.
>
> **🏛️ Multi-Session / Multi-Doc Escalation (`/autopilot`)**: For full projects spanning multiple specification documents (`PRD`, `SRS`, `Architecture`, `Design`) or `> 15` files across sessions, route to **`/autopilot`** (`commands/autopilot.md` → `/autopilot:init` & `/autopilot:run`) backed by `.boomopen/project-ledger.json`.
>
> **🎼 Cross-Engine Escalation (`/conduct`)**: To coordinate external AI CLIs (`Claude Code`, `OpenAI Codex`, `Antigravity`, `Cursor`, `Copilot`) in parallel councils or `Author ≠ Critic` pipelines, route to **`/conduct`** (`commands/conduct.md`).

## Task to Orchestrate
$ARGUMENTS

---

## ⚡ TURN-1 FAST-FORWARD GATE, ELASTIC SHARDING & MODEL POLICY

1. **Zero Pre-Flight Tax & 0-Turn `invoke_subagent`**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint. Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — inspect state and spawn specialist sub-agents **immediately on Turn 1** via **`invoke_subagent(TypeName: "self", Role: "<role#shard>", Model: "inherit", Prompt: ...)`** (Pro High default; NEVER downgrade core roles).
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
   ```
   - **`PLAN-{feature}.md` exists** → Fast-forward directly to **Stage 2 (3-Wave Execution)** (`0` re-scouting, `0` re-planning, `0` middleman `tech-lead` hop!).
   - **`DESIGN-{feature}.md` exists (no `PLAN` yet)** → Extract `DESIGN_CONTRACT` via `boomopen design contract` and jump to `planner`.
   - **`SCOUT-{feature}.md` / `RESEARCH-{feature}.md` exists** → Extract `HANDOFF_BRIEF` via `boomopen research brief` and skip Stage 1a discovery!
3. **Minimum 3 Specialist Agents & Cognitive Load Sharding Law (`≤ 3–4 OWNED_FILES` / shard)**:
   $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
4. **Scoped Warm Session Reuse (`send_message`)**: Track every spawned shard in your **Active Sub-agent Session Registry (`role#shard -> conversationId`)** and reuse warm sessions via `send_message(Recipient: conversationId, Message: ...)` for follow-up waves and fix loops.

### Agent Selection Matrix

| Task Type | REQUIRED Specialist Shards (Minimum 3) |
|-----------|----------------------------------------|
| **Web / Full Stack** | `planner`, `frontend-engineer#1..k`, `backend-engineer#1..k`, `tester`, `reviewer` |
| **API / Backend** | `planner`, `database-architect#schema`, `backend-engineer#1..k`, `security-engineer`, `tester` |
| **UI / Design** | `designer`, `frontend-engineer#1..k`, `performance-engineer`, `tester` |
| **Debug / Security** | `scouter#1..k`, `debugger`, `security-engineer`, `reviewer`, `tester` |

---

## 🌊 STRICT 3-WAVE CONTRACT-FIRST SWARM ORCHESTRATION

### STAGE 1: ELASTIC DISCOVERY, CONDITIONAL DESIGN & VALIDATED PLAN

1. **Stage 1a — Turn-1 Parallel Discovery (`scouter#1..k` + `researcher#1..k`)** *(Skipped if prior artifacts exist)*:
   - Spawn `scouter#1..k` (`SCOUT-{feature}.md`) and `researcher#1..k` (`RESEARCH-{feature}.md`) concurrently (`RequestFeedback: false`).
   - Extract the compact upstream handoff brief via **`boomopen research brief`**:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<appDataDir>/brain/<conversation-id>/RESEARCH-<feature>.md"
     ```
2. **Stage 1b — Conditional 6-Block UI Design (`designer`)** *(Only when UI is touched & no `DESIGN-{feature}.md` exists)*:
   - Spawn `designer` to write `<appDataDir>\brain\<conversation-id>\DESIGN-{feature}.md` (`<= 500` lines, `RequestFeedback: false`), then validate and extract `DESIGN_CONTRACT` via **`boomopen design contract`**:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<appDataDir>/brain/<conversation-id>/DESIGN-<feature>.md"
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<appDataDir>/brain/<conversation-id>/DESIGN-<feature>.md"
     ```
3. **Stage 1c — Contract-First 3-Wave Plan (`planner` + `boomopen plan validate`)**:
   - Spawn `planner` to author `<appDataDir>\brain\<conversation-id>\PLAN-{feature}.md` (`<= 500` lines; `RequestFeedback: true` if pausing for user approval via native `Proceed` / `ask_question`, or `RequestFeedback: false` in autonomous execution) with locked `SHARED_CONTRACT` + disjoint `OWNED_FILES` (`≤ 3–4` files/shard), then gate via:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md"
     ```

### STAGE 2: 3-WAVE DIRECT PLAN-TO-EXECUTOR IMPLEMENTATION (`cook packets` + `verify-wave`)

Dispatch tasks **directly from `PLAN-{feature}.md` to sharded domain engineers** (0 `tech-lead` middleman hop):

1. **Wave 1 — Foundation, Schema & Shared Primitives Lock**:
   - Compile Wave 1 5-Field Handoff Packets via **`boomopen cook packets`** and spawn `database-architect#schema`, `backend-engineer#contracts`, and `frontend-engineer#tokens-primitives` in parallel:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave 1
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave 1 --run-verify
     ```
2. **Wave 2 — Parallel Feature Shards (`100%` Concurrent `role#shard` Fan-Out)**:
   - Compile Wave 2 packets (auto-locking Wave 1 contracts and sibling `OWNED_FILES` into `READ_ONLY_FILES`), launch `backend-engineer#1..k` + `frontend-engineer#1..k` (+ `mobile-engineer#1..k` / `game-engineer#1..k`) **in one parallel turn**, and enforce Post-Wave Gates `COOK-G1..G4` via **`boomopen cook verify-wave --wave 2 --run-verify`**:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave 2
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave 2 --run-verify
     ```

### STAGE 3 (WAVE 3): PARALLEL VERIFICATION, ADVERSARIAL REVIEW & STRICT REPO GATE

1. Spawn `tester#1..k` + `reviewer` (+ `security-engineer` / `performance-engineer`) **concurrently in one turn**.
2. Enforce the deterministic Pragmatic 2-Tier & Anti-Stub Gate (`boomopen check <dir> --strict-phase --no-stubs`):
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
3. Route any test, check, or review blocker back to the owning warm `{role#shard}` `conversationId` via `send_message` until `0` errors remain, then write `<appDataDir>\brain\<conversation-id>\REPORT-{feature}.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`).

---

## 📦 MANDATORY 5-FIELD STRUCTURED HANDOFF PACKET

Every `invoke_subagent` or `send_message` call MUST include:
1. **`MISSION & ACCEPTANCE CRITERIA`**: Exact task ID(s) and `AC` / `Given-When-Then` criteria from `PLAN-{feature}.md`.
2. **`SHARED_CONTRACT`**: Locked DB/API DTOs + `DESIGN_CONTRACT` (`@theme inline` CSS + Props).
3. **`OWNED_FILES (Exclusive Write Lock)`**: Disjoint `1–4` files (`≤ 3–4` files/shard) this shard may create or edit.
4. **`READ_ONLY_FILES (Do Not Edit)`**: Wave 1 contracts, sibling shards' files, and regression tests.
5. **`VERIFICATION & DELIVERABLE`**: Concrete test command + `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` + Brain Artifact path (`<appDataDir>\brain\<conversation-id>\`).

---

## 👥 AVAILABLE CANONICAL AGENTS (21 Specialists — `Model: "inherit"`)

| Category | Canonical Agents |
|----------|------------------|
| **Meta & Planning** | `tech-lead` (Architecture Audit & `:team` Arbitration), `planner` (`SHARED_CONTRACT` & 3-Wave `OWNED_FILES` Shards) |
| **Execution** | `backend-engineer`, `frontend-engineer`, `database-architect`, `mobile-engineer`, `game-engineer` |
| **Validation** | `tester`, `reviewer`, `security-engineer`, `performance-engineer`, `debugger` |
| **Discovery & Design** | `researcher`, `scouter`, `brainstormer`, `designer` |
| **Support & Ops** | `docs-manager`, `devops-engineer`, `business-analyst`, `project-manager`, `reporter` |

---

## 📊 OUTPUT FORMAT (`<appDataDir>\brain\<conversation-id>\REPORT-{feature}.md`)

```markdown
## 🎼 3-Wave Swarm Orchestration Report: {feature}

| # | Agent Shard | Session ID | Wave | Owned Files (`≤ 3–4`) | Status |
|---|-------------|------------|------|-----------------------|--------|
| 1 | `planner` | `{convId}` | Stage 1 | `PLAN-{feature}.md` (`plan validate` ✅) | ✅ |
| 2 | `database-architect#schema` | `{convId}` | Wave 1 | `src/db/**` (`verify-wave --wave 1` ✅) | ✅ |
| 3 | `backend-engineer#1` | `{convId}` | Wave 2 | `src/server/**` (`verify-wave --wave 2` ✅) | ✅ |
| 4 | `frontend-engineer#1` | `{convId}` | Wave 2 | `src/client/**` (`verify-wave --wave 2` ✅) | ✅ |
| 5 | `tester` + `reviewer` | `{convId}` | Wave 3 | `check <dir> --strict-phase --no-stubs` ✅ | ✅ |
```
