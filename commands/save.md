---
description: "💾 Save Session & Project Memory — Persist cohesive SESSION-{date}.md Brain Artifact, sync .boomopen/project-ledger.json & cook state, and update .brain/ memory"
version: "5.5"
category: session
execution-mode: execute
---

# /save — Infinite Memory, Ledger Sync & Session Keeper

<context>$ARGUMENTS</context>

---

## ⚡ PURPOSE, SUB-AGENT GATE & STORAGE ROUTING (v5.5)

Combat cross-session context drift by capturing architectural decisions, completed work, active workflow stage (`cook state`), deterministic `.boomopen/project-ledger.json` progress, and next actions so any future session resumes with 100% fidelity via `/recap`, `/next`, or `/autopilot:run`.

1. **0-Turn Sub-agent Scouting Gate (`> 2` Unindexed Files)**: Standard `/save` inspects Git status, CLI telemetry, and Brain Artifacts directly (`run_command`, `read_file`). If reconstructing undocumented changes requires scouting **`> 2` unfamiliar source files**, spawn parallel `scouter#1..k` immediately on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` using Antigravity 2.0 tools ONLY (`read_file`, `write_file`, `edit_file`, `run_command`, `invoke_subagent`, `send_message`, `ask_question`, `search_web`).
2. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Write **1 single cohesive file** `<appDataDir>\brain\<conversation-id>\SESSION-{date}.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Session continuity snapshot with ledger cursor, cook state, completed work, architectural decisions, and next actions",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```
3. **Deterministic Ledger & Session Telemetry Sync**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
   python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/session_manager.py info .
   ```
   When `.boomopen/project-ledger.json` exists in the workspace, also run:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next
   ```
4. **Workspace `.brain/` Persistence (Cross-Conversation / Team Shared)**: Update `.brain/session.json`, `.brain/brain.json`, and `.brain/handover.md` whenever `.brain/` already exists in the repository OR when the user requests workspace-persisted memory across new conversations.

---

## 🔍 Phase 1: State, Git & Ledger Analysis

1. Run `git status -s`, `git diff --stat`, and `git log --oneline -5` (`run_command`).
2. Inspect active workflow artifacts via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"` and `python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/session_manager.py status .`.
3. If `.boomopen/project-ledger.json` exists, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next` to record exact `active_cursor`, verified `REQ-xxx` count, next pending requirements, and `baseline_passed_tests`.
4. Classify session changes:
   - **MAJOR** (new module/service, DB schema migration, API contract update, ADR): sync static architecture knowledge (`.brain/brain.json` and `.boomopen/contracts/SHARED_CONTRACT.md` when active).
   - **MINOR** (feature slice, bug fix, refactor, tests): sync dynamic session snapshot (`SESSION-{date}.md` and `.brain/session.json` when active).

---

## 📋 Phase 2: Write Cohesive `SESSION-{date}.md` Brain Artifact (`<= 500` lines)

Write `<appDataDir>\brain\<conversation-id>\SESSION-{date}.md` (`ArtifactMetadata: { Summary: "Session continuity snapshot with ledger cursor, cook state, completed work, architectural decisions, and next actions", UserFacing: true, RequestFeedback: false }`, and mirror to `.brain/handover.md` if `.brain/` is active):

```markdown
# 📋 Session Snapshot — {Project / Feature} ({YYYY-MM-DD})

> **Saved At**: {ISO-timestamp}
> **Workflow Cook State**: {PLAN / DESIGN / SCOUT / RESEARCH / Active Wave}
> **Autopilot Ledger Cursor**: {current_phase_id | N/A} ({verified_reqs}/{total_reqs} REQ verified, Baseline Tests: {baseline_passed_tests})

## 📍 Current Focus & Active Files
- **Feature / Phase**: {name}
- **Active Files**: {clickable file links}

## ✅ Completed This Session
- {completed item with verification proof}

## ⏳ Next Priority Actions
1. {exact next command or pending REQ-xxx from ledger next}
2. {follow-up verification or task}

## 🔧 Key Architectural Decisions & Gotchas
- **Decision**: {what was chosen and why}
- **Gotcha**: {non-obvious constraint or edge case}

## ⚠️ Uncommitted Changes / Active Blockers
- {git status summary or blocker notes}
```

---

## 🧠 Phase 3: Optional Workspace `.brain/` JSON Sync

When `.brain/` workspace memory is active, keep `.brain/brain.json` (schema `"5.5.0"`, `project`, `tech_stack`, `features`, `knowledge_items`) and `.brain/session.json` synchronized via `write_file` / `edit_file`:

```json
{
  "schema_version": "5.5.0",
  "timestamp": "ISO-date",
  "cook_state": "PLAN|DESIGN|SCOUT|IDLE",
  "ledger_cursor": "PHASE-K|null",
  "working_on": { "feature": "", "task": "", "status": "planning|coding|testing|debugging", "files": [] },
  "progress": { "completed": [], "in_progress": [], "remaining": [] },
  "decisions_made": [],
  "blockers": []
}
```

---

## ✅ Phase 4: Confirmation

Present a concise summary with clickable links to `<appDataDir>\brain\<conversation-id>\SESSION-{date}.md` (plus `.boomopen/ROADMAP-PROGRESS.md` or `.brain/session.json` when active) and remind the user they can restore full context anytime via `/recap`, `/next`, or `/autopilot:run`.
