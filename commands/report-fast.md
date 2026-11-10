---
description: "⚡ Fast Report — Rapid CLI-verified status summaries and standup reports in a single cohesive Brain Artifact (`REPORT-{topic}.md`)"
version: "5.5"
category: documentation
execution-mode: execute
---

# /report:fast — Quick Evidence-Backed Status Report (`v5.5`)

> **MISSION**: Generate a concise, zero-fiction status report or executive summary grounded in deterministic CLI & git telemetry. Use for daily standups, sprint checkpoints, and rapid progress snapshots. *(For updating existing docs or custom multi-source templates, route to `/report:hard` or `/report:team`.)*

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & TIERED EXECUTION

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`.
2. **0-Turn Execution Routing**:

| Scope / Tier | Condition | Action |
|--------------|-----------|--------|
| **Mode A Direct** | `≤ 2` already-known artifacts/files + quick CLI telemetry | Run telemetry commands directly and write `REPORT-{topic}.md` |
| **TIER 1 Sub-Agent** | Unscoped scan across `> 2` files (`invoke_subagent` available) | Launch `reporter` immediately on Turn 1 via 0-turn `invoke_subagent(TypeName: "self", Role: "Status Reporter", Model: "inherit")`; reuse warm `conversationId` via `send_message` for refinements |
| **TIER 2 Fallback** | Sub-agent tool unavailable | Embody `~/.{TOOL}/skills/boomopen-workflow-kit/agents/reporter.md` directly |

---

## ⛔ NON-NEGOTIABLE GUARDRAILS & SINGLE-FILE ARTIFACT OUTPUT

> [!IMPORTANT]
> **REPORTS ONLY — ZERO APPLICATION CODE MUTATIONS**:
> - ❌ **NEVER** write or edit application source, config, or test files (`READ_ONLY_FILES` lock on the entire codebase).
> - ❌ **NEVER** split reports into `{name}/` sub-folders or default to `./reports/{topic}/` on Antigravity 2.0.
> - ❌ **NEVER** auto-transition to `/code`, `/cook`, or `/fix` — yield control after presenting the report.
> - ✅ **Single Cohesive Brain Artifact**: Save **1 cohesive file** (`<= 500` lines; fast target `80–180` lines) to `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` with:
>   `ArtifactMetadata: { Summary: "Concise status report for {topic}", UserFacing: true, RequestFeedback: false }`
>   *(Write to `./reports/{topic}/REPORT-{topic}.md` **ONLY** if explicitly requested by the user or on non-Antigravity tools without `<appDataDir>`.)*
> - ✅ **Language & Formatting**: Write in the user's input language (technical identifiers in English), use clickable `file:///` links, quote Mermaid labels containing parentheses (`id["Label (Metric)"]`), and escape literal currency dollars as `\$`.

---

## 🎭 Phase 1: DETERMINISTIC TELEMETRY & STATE GATHERING

| Attribute | Value |
|-----------|-------|
| **Agent** | `reporter` (`TypeName: "self"`, `Model: "inherit"`) or Mode A Direct (`≤ 2` known files) |
| **Goal** | Collect objective, zero-fiction workspace telemetry before writing any claim |

Run the applicable deterministic telemetry commands (`0` fabricated or estimated counts):
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status   # when .boomopen/project-ledger.json exists
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir>     # target source directory health
git status --short && git log -n 10 --stat
```
Also inspect any existing `<appDataDir>\brain\<conversation-id>\{PLAN,TEST,REVIEW,DEBUG}-*.md` artifacts from the active session.

---

## 🎭 Phase 2: COHESIVE `REPORT-{topic}.md` SYNTHESIS (`RPT-G1..G4`)

| Attribute | Value |
|-----------|-------|
| **Agent** | Same warm `reporter` session (`send_message`) or single-pass synthesis |
| **Output** | `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` (`<= 500` lines, `UserFacing: true, RequestFeedback: false`) |

### Required Fast Report Blueprint
```markdown
# 📊 Status Report: {Topic}

> [!IMPORTANT]
> **Executive Summary**
> - **Status**: {🟢 On Track | 🟡 At Risk | 🔴 Blocked}
> - **Completed**: {verified deliverables / commits}
> - **Blockers / Risks**: {concrete blockers or `None`}
> - **Key Metrics**: {CLI-verified counts: phases/REQs, tests, `boomopen check` status}
> - **Next Decisions**: {top decision needed from user}

## 1. Verified Telemetry Snapshot
| Metric | Verified Value | Provenance (Command / Artifact) |
|--------|----------------|---------------------------------|
| {e.g. Active Pipeline / Ledger} | `{verified}` | `boomopen cook state` / `boomopen ledger status` |
| {e.g. Code Health} | `{verified}` | `boomopen check <dir>` |
| {e.g. Recent Changes} | `{N files / commits}` | `git status` / `git log --stat` |

## 2. Key Accomplishments & Active Work
- {Bullet items with clickable `[basename](file:///...)` links}

## 3. Prioritized Next Actions
| Priority | Action | Target Files / Command | Expected Impact |
|----------|--------|------------------------|-----------------|
| `P0` / `P1` | {concrete action} | `{file or /cmd}` | {measurable outcome} |
```

---

## ⛔ HARD STOP — AWAIT USER DECISION

> **WORKFLOW COMPLETE. DO NOT PROCEED FURTHER.**
> Present the clickable link to `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` and **STOP**:
> 1. ✅ **Done** — Fast status report complete
> 2. 📋 `/report:hard` — Expand into a deep multi-source analysis
> 3. 💎 `/report:team` — Run 2-Stage Elastic Golden Diamond adversarial metric audit
