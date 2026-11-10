---
description: "🔄 Restore Session Context — Recover project state in seconds from .boomopen/project-ledger.json, cook state, SESSION-{date}.md Brain Artifacts, and session_manager.py"
version: "5.5"
category: session
execution-mode: execute
---

# /recap — Smart Context, Cook State & Project Ledger Recovery

<context>$ARGUMENTS</context>

---

## ⚡ PURPOSE, SUB-AGENT GATE & ARTIFACT CONTRACT

Restore complete project, phase, and workflow context in seconds without re-crawling the codebase from scratch.

1. **0-Turn Sub-agent Scouting Gate (`> 2` Files Cold-Start Fallback)**: When saved ledger/session artifacts exist, read them directly (`run_command`, `read_file`). If no saved state exists and cold-start recovery requires inspecting **`> 2` source or specification files**, do **NOT** read files sequentially in the primary agent — spawn parallel `scouter#1..k` on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` using Antigravity 2.0 tools ONLY (`read_file`, `write_file`, `edit_file`, `run_command`, `invoke_subagent`, `send_message`, `ask_question`, `search_web`).
2. **Cohesive Single-File Brain Artifact (`<= 500` lines, Zero `./reports/` Defaults)**: Never scan or create legacy `./reports/` folders or `> 150` line split directories. When writing or refreshing a recovered session briefing (`<appDataDir>\brain\<conversation-id>\SESSION-{date}.md`), keep it as **1 single cohesive file (`<= 500` lines)** with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Recovered session context briefing with Autopilot ledger cursor, cook fast-forward state, and active tasks",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 🔍 Phase 1: Deterministic Context Discovery (Priority Order)

Execute the fast CLI telemetry batch and check context sources in strict priority order:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/session_manager.py status .
```
*(When `.boomopen/project-ledger.json` exists in the workspace, also run:)*
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next
```

1. **Priority 0 — Deterministic Project Ledger (`.boomopen/project-ledger.json` — When Present)**:
   - Inspect `ledger status` & `ledger next` output, `.boomopen/ROADMAP-PROGRESS.md`, and `.boomopen/contracts/SHARED_CONTRACT.md`.
2. **Priority 1 — Antigravity 2.0 Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`)**:
   - Latest `SESSION-{date}.md` (or `SESSION-HANDOVER.md`), `REPORT-status.md`, and `cook state` artifacts (`PLAN-*.md`, `DESIGN-*.md`, `SCOUT-*.md`, `RESEARCH-*.md`, `DEBUG-*.md`).
3. **Priority 2 — Workspace Memory (`.brain/` — When Present)**:
   - `.brain/session.json` (dynamic task state), `.brain/brain.json` (static stack & architecture), `.brain/handover.md`.
4. **Priority 3 — Script & Git Auto-Detection (Cold-Start Fallback)**:
   - Combine `session_manager.py status .` output with `git status -s`, `git log --oneline -10`, `README.md` / `package.json`, and `./documents/` (fanning out `> 2` file scouting via `invoke_subagent(TypeName: "self", Model: "inherit")`).

---

## 📊 Phase 2: Synthesize & Present Context Briefing

Present a scannable briefing in the user's language (and write/update `<appDataDir>\brain\<conversation-id>\SESSION-{date}.md` with `ArtifactMetadata` if cold-starting or requested):

```markdown
# 📍 Context Restored: {Project Name}

- **Tech Stack**: {Frontend + Backend + DB from session_manager.py / brain.json}
- **Last Active**: {saved timestamp or latest Git commit}
- **Cook Fast-Forward State**: {Approved PLAN / DESIGN / SCOUT / Clean Slate}
- **Autopilot Ledger**: {Phase `PHASE-K` | `verified/total` REQ-xxx Verified | Baseline Passing Tests: `N` (or N/A)}

## 🔥 Currently Working On
- **Active Feature / Phase**: {feature or phase title}
- **Next Pending Tasks / Requirements**: {next unchecked PLAN wave or REQ-xxx from ledger next}
- **Active Files**: {clickable file links}

## 🔧 Key Architectural Decisions & Gotchas
- {critical contract, invariant, or constraint to preserve}

## ⚠️ Uncommitted Changes & Blockers
- {git status summary and any unresolved blockers}
```

---

## 🚀 Phase 3: Interactive Next Action (`ask_question`)

Use `ask_question` (putting the detected top match first with `(Recommended)`):
1. `(Recommended) Resume Active Workflow` — Run `/autopilot:run` (when `.boomopen/project-ledger.json` has pending `REQ-xxx`), `/code` (when an approved `PLAN-*.md` exists), or continue `{current task}`
2. `Inspect Live Status & Quality Gates` — Run `/status` or `/autopilot:audit`
3. `Verify Uncommitted Changes` — Inspect `git diff` and run `/test:fast`
4. `Start a New Goal` — Specify a new feature (`/cook`), plan (`/plan`), or bug fix (`/fix`)
