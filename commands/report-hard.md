---
description: "⚡⚡⚡ Detailed Report — Deep multi-source synthesis, existing-doc updates, or template generation with CLI Telemetry & Cohesive `REPORT-{topic}.md`"
version: "5.5"
category: documentation
execution-mode: execute
---

# /report:hard — Comprehensive Evidence-Mined Project Report (`v5.5`)

> **MISSION**: Produce an authoritative, evidence-backed deliverable for **any technical, product, or operational topic** — creating a single cohesive `REPORT-{topic}.md` (`<= 500` lines), updating existing workspace documentation, or populating a user-supplied template with **100% CLI/git/source provenance (`RPT-G1..G4`)**.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & PARALLEL FAN-OUT

1. **Zero Pre-Flight Tax (`0-Turn` Native Dispatch)**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — spawn Phase 1 discovery shards **immediately on Turn 1 in a single parallel batch** via `invoke_subagent(TypeName: "self", Model: "inherit")`.
2. **Tiered Execution & Warm Session Reuse**:

| Tier | Condition | Action |
|------|-----------|--------|
| **TIER 1** | Native Sub-Agents (`invoke_subagent`, `send_message`) or `runSubagent` available | **MANDATORY**: Fan out parallel `scouter#report-1..k` (+ `researcher` when external context needed) on Turn 1 (`TypeName: "self"`, `Model: "inherit"`); track `role#shard -> conversationId` and reuse warm sessions via `send_message` |
| **TIER 2** | Sub-agent tool unavailable | Load `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{scouter,researcher,reporter}.md` sequentially |

---

## 📁 DELIVERABLES & `ArtifactMetadata` ROUTING (`<= 500` Lines, Single File)

> [!IMPORTANT]
> **SINGLE COHESIVE FILE LAW**: Never split reports into `{name}/` folders! Keep `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` as **1 cohesive Markdown artifact (`<= 500` lines)**. Write to `./reports/{topic}/REPORT-{topic}.md` **ONLY** if explicitly requested by the user (or on non-Antigravity environments without `<appDataDir>`).

| Deliverable / Mode | Path | `ArtifactMetadata` |
|--------------------|------|--------------------|
| **Create Report (Default)** | `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` (`<= 500` lines) | `Summary: "...", UserFacing: true, RequestFeedback: false` |
| **Update Existing Mode** | Targeted workspace docs (`README.md`, `./documents/**`, etc.) | Omit (`N/A` — workspace edits) |
| **From Template Mode** | `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` (or user-specified path) | `Summary: "...", UserFacing: true, RequestFeedback: false` (when in Brain) |
| **Telemetry / Recon Shards** | `<appDataDir>\brain\<conversation-id>\SCOUT-report-{1..k}.md` | `Summary: "...", UserFacing: false, RequestFeedback: false` |
| **External Context (Optional)** | `<appDataDir>\brain\<conversation-id>\RESEARCH-report-{topic}.md` | `Summary: "...", UserFacing: false, RequestFeedback: false` |

---

## ⛔ ABSOLUTE PROHIBITION — ZERO APPLICATION CODE

- ❌ **NEVER** write or modify application source, schema, or test files (`READ_ONLY_FILES` lock across all codebase files; in **Update Existing** mode, edit *only* the targeted documentation files).
- ❌ **NEVER** fabricate or estimate percentages, line counts, pass rates, or benchmark numbers.
- ❌ **NEVER** auto-transition to `/code`, `/cook`, or `/fix` — stop after delivering the report.
- ✅ Write deliverables in the **user's input language** (technical terms in English; escape currency dollars as `\$`).

---

## 🎭 Phase 1: PARALLEL TELEMETRY MINING & DISCOVERY (`Turn 1` DAG Fan-Out)

Launch independent discovery tracks **simultaneously in 1 Turn-1 batch** via `invoke_subagent(TypeName: "self", Model: "inherit")`:

| Shard Key (`role#shard`) | Mission & Deterministic Commands | Disjoint Output (`UserFacing: false`) |
|:-------------------------|:---------------------------------|:--------------------------------------|
| `scouter#report-1..k` (`<= 3–4` modules/shard) | Run deterministic telemetry + deep `read_file` scan:<br/>• `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state`<br/>• `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` *(if `.boomopen/project-ledger.json` exists)*<br/>• `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir>`<br/>• `git status --short` & `git log --stat -n 25` | `<appDataDir>\brain\<conversation-id>\SCOUT-report-{1..k}.md` (`RequestFeedback: false`) |
| `researcher#report` *(optional — only if external benchmarks/standards needed)* | Gather primary external docs, benchmarks, or domain standards via `search_web` | `<appDataDir>\brain\<conversation-id>\RESEARCH-report-{topic}.md` (`RequestFeedback: false`) |

**Exit Criteria**: All quantitative metrics, git deltas, `boomopen` CLI outputs, and `file:line` citations captured in `SCOUT-report-*.md`.

---

## 🎭 Phase 2: DATA SYNTHESIS & OUTPUT GENERATION (`RPT-G1..G4`)

| Attribute | Value |
|-----------|-------|
| **Agent** | `reporter` via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Input** | `SCOUT-report-{1..k}.md` (+ `RESEARCH-report-{topic}.md` and existing Brain `PLAN`/`TEST`/`REVIEW` artifacts) |
| **Goal** | Cross-verify arithmetic and execute the inferred Output Mode (`Create report` / `Update existing` / `From template`) |

### Mandatory Quality Gates (`RPT-G1..G4`)
1. **`RPT-G1` (100% Provenance & Math Accuracy)**: Every count, ratio, pass rate, and milestone figure traces directly to Phase 1 CLI/git/file outputs.
2. **`RPT-G2` (Executive Signal First)**: Open with a 5-bullet **Executive Summary** (`Status`, `Completed`, `Blockers/Risks`, `Key Metrics`, `Next Decisions`).
3. **`RPT-G3` (Actionable Prioritized Recommendations)**: Every recommendation names concrete target files/commands, priority (`P0`–`P2`), effort, and expected impact (`0` vague platitudes).
4. **`RPT-G4` (Single-File Cohesion & Rich Visuals)**: Single cohesive `REPORT-{topic}.md` (`<= 500` lines) using GitHub Alerts (`> [!IMPORTANT]`, `> [!WARNING]`), clickable `file:///` links, escaped `\$` currency, and valid Mermaid `xychart-beta` or `flowchart TD/LR` diagrams with quoted special-character labels (`id["Module (98% Pass)"]`).

### Canonical `REPORT-{topic}.md` Blueprint (Create Report Mode)
```markdown
# 📊 Comprehensive Report: {Topic}
**Date**: {YYYY-MM-DD} | **Scope**: {modules / period} | **Audience**: {Engineering / Product / Leadership}

> [!IMPORTANT]
> **Executive Summary**
> - **Status**: {🟢 Healthy | 🟡 Needs Attention | 🔴 Critical}
> - **Completed**: {verified deliverables, commits, milestones}
> - **Blockers / Risks**: {evidence-backed risks}
> - **Key Metrics**: {exact CLI/git counts}
> - **Next Decisions**: {key decisions required}

## 1. Methodology & Telemetry Provenance
| Telemetry Source | Command / Artifact | Summary |
|------------------|--------------------|---------|
| Pipeline & Ledger | `boomopen cook state` / `boomopen ledger status` | `{verified}` |
| Code Health | `boomopen check <dir>` | `{verified}` |
| Git Activity | `git status` / `git log --stat` | `{verified}` |

## 2. Quantitative Analysis & Visual Overview
- KPI breakdown table + Mermaid `xychart-beta` or `flowchart TD/LR` (`id["Subsystem (Metric)"]`).

## 3. Detailed Evidence-Backed Findings
### Finding {N}: {Title} (`Severity / Confidence`)
- **Source Evidence**: `[basename](file:///.../path#L10-L30)` | **Impact**: {quantified}

## 4. Prioritized Recommendations & Risk Matrix
| Priority | Action | Target Files / Command | Effort | Expected Impact |
|----------|--------|------------------------|--------|-----------------|
| `P0`–`P2` | {concrete action} | `{verified path / CLI}` | {S/M/L} | {measurable outcome} |
```

---

## ⛔ HARD STOP — AWAIT USER DECISION

> **WORKFLOW COMPLETE. DO NOT PROCEED FURTHER.**
> Present the deliverable link(s) per user intent and **STOP**:
> 1. ✅ **Create Report** → `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md`
> 2. ✅ **Update Existing** → Summary of updated workspace documentation files with `file:///` links
> 3. ✅ **From Template** → Populated template deliverable verified against `RPT-G1..G4`
>
> **⛔ DO NOT auto-transition to any implementation workflow. YIELD control to user.**
