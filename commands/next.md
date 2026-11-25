---
description: "🧭 Smart Navigator — Auto-detect project, ledger, and Brain Artifact state to recommend the exact next BoomOpen v5.5 workflow"
version: "5.5"
category: session
execution-mode: execute
---

# /next — Smart Workflow Navigator

<context>$ARGUMENTS</context>

---

## ⚡ PURPOSE, AUTONOMOUS ANALYSIS & ARTIFACT CONTRACT

Act as the deterministic project compass whenever the user is unsure what step comes next. Inspect live CLI telemetry and Brain Artifacts first, then recommend the **exact next workflow** without unnecessary questioning.

1. **0-Turn Sub-agent Scouting Gate (`> 2` Files Cold-Start Inspection)**: Prefer lightweight CLI & metadata checks (`run_command`/`Bash`/shell, `read_file`/`Read`). Only when no ledger or Brain/report artifacts exist and assessing project state requires inspecting **`> 2` source or specification files**, spawn parallel `scouter#1..k` immediately on Turn 1 via your platform's native subagent tool (`invoke_subagent(TypeName: "self", Model: "inherit")` on Antigravity, `Task` on Claude Code, `spawn_agent` on Codex, `runSubagent` on Copilot, or native subagent/TIER 2 on Cursor).
2. **Cohesive Brain Artifact Rule (`<= 500` lines, Zero `./reports/` Defaults)**: Never read/write legacy `./reports/` paths by default or split files at `150` lines. When persisting a navigation snapshot, update `<appDataDir>\brain\<conversation-id>\REPORT-status.md` or `SESSION-{date}.md` (`<= 500` lines) via `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Smart workflow navigation assessment with detected project phase and recommended next command",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 🔍 Phase 1: Deterministic State Auto-Detection (Turn 1)

Run the fast state-detection batch from the project root:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/session_manager.py status .
```

If `.boomopen/project-ledger.json` exists in the workspace, also run:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger next
```

Evaluate signals in strict priority order:
1. **`.boomopen/project-ledger.json`** (`ledger status` & `ledger next`: active phase cursor, pending `REQ-xxx`, verified phases)
2. **Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`)** (`cook state`: `PLAN-*.md`, `DESIGN-*.md`, `SCOUT-*.md`, `RESEARCH-*.md`, `DEBUG-*.md`, `SESSION-*.md`, `REPORT-status.md`)
3. **Workspace `.brain/` Memory** (`.brain/session.json`, `.brain/brain.json` if present)
4. **Git & Workspace Docs** (`./documents/`, `git status -s`, `git log --oneline -5`)

---

## 🧭 Phase 2: State-to-Workflow Decision Matrix

| Detected Workspace / Artifact State | Phase | Exact Recommended Next Command |
|-------------------------------------|-------|--------------------------------|
| `.boomopen/project-ledger.json` has pending `REQ-xxx` in `ledger next` | `AUTOPILOT_ACTIVE` | `/autopilot:run` — Execute active phase slice with 4-Layer Quality Ratchet |
| `.boomopen/project-ledger.json` has 100% phases `verified` | `AUTOPILOT_VERIFIED` | `/autopilot:audit` → `/deploy:check` — Final RTM audit & release readiness |
| Multi-doc specs in `./documents/`, no `.boomopen/project-ledger.json` yet | `SPECS_READY` | `/autopilot:init` (multi-phase roadmap) or `/plan:hard` (single feature) |
| `cook state` finds approved `PLAN-{task}.md` with unchecked waves | `PLANNED` | `/code` (or `/code:team`) — Fast-forward directly to Wave Execution (0 re-planning) |
| `cook state` finds `DESIGN-{task}.md` (no `PLAN` yet) | `DESIGNED` | `/plan:hard` — Lock `SHARED_CONTRACT` + `DESIGN_CONTRACT` into 3-Wave plan |
| `cook state` finds `RESEARCH-*.md` / `SCOUT-*.md` only | `DISCOVERED` | `/design:hard` (if UI feature) or `/plan:hard` (backend/fullstack contract plan) |
| Empty directory (no source code, no specs) | `EMPTY` | `/init` (bootstrap project) or `/brainstorm` (explore product/architecture options) |
| Failing tests, crash logs, or unresolved `DEBUG-*.md` | `DEBUGGING` | `/debug:hard` (isolate root cause) or `/fix:hard` (multi-file verified fix) |
| Source changes written, tests/quality gates not yet verified | `UNVERIFIED_CODE` | `/test:hard` + `/review:team` (and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs`) |
| All features complete, tests & `check --strict-phase --no-stubs` green | `READY_TO_SHIP` | `/deploy:check` → `/deploy:preview` → `/deploy:production` |

---

## 🔗 BoomOpen v5.5 Lifecycle Chain & Output Format

```text
/init → /brainstorm → /research → /design → /plan → /code (or /cook end-to-end | /autopilot multi-phase)
                                                       │
                                           ┌───────────┼───────────┐
                                           ▼           ▼           ▼
                                        /debug       /test      /review
                                           └───────────┼───────────┘
                                                       ▼
                                    /deploy:check → /deploy:preview → /deploy:production → /save → /recap
                                    (Emergency recovery anytime: /deploy:rollback or /rollback)
```

Present the navigation briefing in this concise format:

```markdown
🧭 **WHERE YOU ARE**: {Detected Phase & active artifact/ledger state}
📊 **PROGRESS**: {Verified REQ count, PLAN wave progress, or uncommitted file count}
➡️ **RECOMMENDED NEXT**: `{exact /command}` — {1-sentence reason why this is the zero-waste next step}
💡 **HYGIENE TIP**: {e.g., uncommitted files reminder, `/save` checkpoint tip, or `check --strict-phase --no-stubs` note}
```
