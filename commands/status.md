---
description: "📊 Project, Ledger & Swarm Status — Inspect live project metrics, .boomopen/project-ledger.json cursor, cook state, active sub-agents, and preview health"
version: "5.5"
category: session
execution-mode: execute
---

# /status — Project, Ledger & Sub-Agent Status Dashboard

<context>$ARGUMENTS</context>

---

## ⚡ PURPOSE, SUB-AGENT GATE & BRAIN ARTIFACT CONTRACT

Deliver a deterministic, real-time health board covering workspace metrics, workflow fast-forward artifacts (`cook state`), Autopilot requirement progress (`ledger status` / `ledger next`), sub-agent shards, and preview server status.

1. **0-Turn Sub-agent Scouting Gate (`> 2` Files Deep Audit)**: Standard `/status` runs fast CLI telemetry directly (`run_command`, `read_file`). Only if the user asks for a deep module-level health scan across **`> 2` source files**, dispatch parallel `scouter#1..k` on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` using Antigravity 2.0 tools ONLY (`read_file`, `write_file`, `edit_file`, `run_command`, `invoke_subagent`, `send_message`, `ask_question`, `search_web`).
2. **Cohesive Single-File Brain Artifact (`REPORT-status.md` `<= 500` lines, Clean Git Tree)**: Write the consolidated status snapshot to `<appDataDir>\brain\<conversation-id>\REPORT-status.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Live project status dashboard with tech stack, Autopilot ledger progress, cook state, sub-agent shards, and preview server health",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 🔍 Phase 1: Collect Deterministic Telemetry

Run the installed BoomOpen scripts and CLI commands from the project root (`python3` on macOS/Linux):

```bash
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/session_manager.py status .
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py status
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
```

When `.boomopen/project-ledger.json` exists in the workspace, also run:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next
```

Also check `git status -s` (modified/untracked file counts) and `<appDataDir>\brain\<conversation-id>\SESSION-*.md` (or `.brain/session.json` if present) for active `role#shard` session history.

---

## 📊 Phase 2: Write `REPORT-status.md` & Present Dashboard

Persist `<appDataDir>\brain\<conversation-id>\REPORT-status.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "Live project status dashboard with tech stack, Autopilot ledger progress, cook state, sub-agent shards, and preview server health", UserFacing: true, RequestFeedback: false }`) and output a concise summary:

1. **Project & Git Summary**: Project name, workspace root, detected tech stack & feature directories (`session_manager.py`), total tracked files, and uncommitted Git changes.
2. **Workflow Fast-Forward State (`cook state`)**: Active Brain Artifacts (`RESEARCH-*.md`, `SCOUT-*.md`, `DESIGN-*.md`, `PLAN-*.md`, `REVIEW-*.md`) and next eligible fast-forward wave.
3. **Autopilot Project Ledger (`ledger status` + `ledger next`)**: Active phase cursor, verified vs total `REQ-xxx` count, next pending requirement IDs, and `baseline_passed_tests`.
4. **Sub-Agent Shard Board**: Completed, running, and queued `role#shard` tracks.
5. **Preview Server Health**: Running preview URL and HTTP health status (`auto_preview.py`).

### Example Dashboard Summary

```text
=== Project & Ledger Status ===
📁 Project: my-ecommerce (/workspace/my-ecommerce)
🔧 Stack: Next.js, TypeScript, Tailwind CSS, Prisma
⚡ Cook State: PLAN-checkout.md ready (Wave 1 complete, Wave 2 pending)
🏛️ Autopilot Ledger: PHASE-2 in_progress (12/28 REQ verified | Next: REQ-013, REQ-014 | Baseline Tests: 34)
📄 Working Tree: 85 source files (3 modified, 1 untracked)

=== Sub-Agent Shards ===
✅ database-architect#schema    → Wave 1 Completed
✅ backend-engineer#contracts   → Wave 1 Completed
🔄 frontend-engineer#checkout   → Wave 2 Ready / Active
⏳ tester#e2e                   → Queued (Wave 3)

=== Preview Server ===
🌐 URL: http://localhost:3000 | 💚 Health: OK
```

---

## 🚀 Phase 3: Recommended Follow-Up Shortcuts

End the status report with 1-line context-aware shortcuts based on detected state:
- **Pending Autopilot `REQ-xxx`** → `/autopilot:run`
- **Approved `PLAN-*.md` ready** → `/code`
- **Modified unverified files** → `/test:fast` or `/save`
- **Unsure what step comes next** → `/next`
