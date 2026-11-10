---
description: "⚡ Quick Ideation — 1-Wave Autonomous Codebase Grounding, 3 Orthogonal Options, Pre-Mortem Check & Weighted Decision Matrix"
version: "5.5"
category: planning
execution-mode: execute
---

> **📂 Cohesive Single-File & 1-Click `"Proceed"` Rule (v5.5)**:
> - Write `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (always include `.md` extension; `<= 350` lines; zero `{name}/` folder splits!) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so Antigravity 2.0 renders the native 1-click **"Proceed"** button (use `./reports/{topic}/BRAINSTORM-{topic}.md` outside Antigravity).
> - Set `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }` on any internal scratch `SCOUT-{topic}-s1.md` file.

---

# /brainstorm:fast — 1-Wave `autonomous_first` Grounding & 3-Option Decision Matrix

> **MISSION**: Rapidly explore a feature, UX workflow, or architectural trade-off in **1 fast parallel wave** — grounding in codebase reality **first** (`autonomous_first`), generating **`3` genuinely distinct strategic options**, stress-testing them with a compact **6-Month Pre-Mortem**, and producing a CLI-validated 6-Block `BRAINSTORM-{topic}.md`.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 PRIOR-ARTIFACT FAST-FORWARD & PARALLEL WAVE DISPATCH

> ⛔ **ZERO APPLICATION CODE**: This workflow produces `BRAINSTORM-{topic}.md` ONLY — never modify project source code or run app builds.
> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. Always use `invoke_subagent(TypeName: "self", Model: "inherit")` for `scouter` and `brainstormer`.

Execute **1 Fast `autonomous_first` Wave** immediately on Turn 1 (never ask blind questions before grounding in the repo!):

1. **Prior-Artifact Fast-Forward Check**:
   - Inspect `<appDataDir>\brain\<conversation-id>\` on Turn 1. If `RESEARCH-{topic}.md` or `SCOUT-{topic}.md` already exists, run:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<research-or-scout-path>"
     ```
     Pass the extracted `HANDOFF_BRIEF` directly into `brainstormer` and **skip redundant scouting/searching**!
2. **Parallel `scouter` + `brainstormer` Wave (When no prior artifact exists)**:
   - Spawn `scouter` (if workspace code exists — inspects `package.json` / schemas / target modules and returns structured constraints via message or writes `SCOUT-{topic}-s1.md` with `UserFacing: false, RequestFeedback: false`) **in parallel with** `brainstormer` (`TypeName: "self"`, `Model: "inherit"`).
3. **Conditional Native `ask_question` UI Rule (Post-Grounding Only)**:
   - Call `ask_question` (`1–3` crisp multiple-choice questions, unnumbered, no manual `'Other'`, `(Recommended)` option first) **ONLY AFTER** autonomous repo grounding if a genuine P0 product/business fork cannot be inferred from the codebase.

---

## 📐 CANONICAL 6-BLOCK `BRAINSTORM-{topic}.md` BLUEPRINT (`<= 350` Lines)

Synthesize **1 cohesive file** at `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (`ArtifactMetadata: { Summary: "<winning option + matrix score + MVP cutline>", UserFacing: true, RequestFeedback: true }`) with all **6 Mandatory Blocks**:

1. **`## 1. Autonomous Codebase & Constraint Grounding`**:
   - Existing repo stack/touchpoints (`[file:line](file:///...)`), prior `RESEARCH` brief (if fast-forwarded), target user problem, hard constraints, and explicit **Non-Goals**.
2. **`## 2. Strategic Options (3–4 Orthogonal Paths)`**:
   - **`Option A: Conservative Fast-Ship`** — Minimal blast radius, maximum reuse of existing codebase patterns, fastest delivery.
   - **`Option B: Pragmatic Balanced [Recommended]`** — Optimal balance of strategic differentiation, clean architecture, and low maintenance.
   - **`Option C: Ambitious Category Wedge`** — High-upside UX/AI/architectural differentiator and 10x product moat.
   - *(Optional `Option D: Composable / Zero-Build Alternative` when applicable).*
3. **`## 3. Devil's Advocate 6-Month Failure Pre-Mortem & Rejected Tarpits`**:
   - Assume each option catastrophically failed 6 months in production — isolate exact technical, UX adoption, and cost failure modes + list **Rejected Tarpit Ideas** (seductive ideas deliberately pruned and why).
4. **`## 4. Weighted MCDA Decision Matrix`**:
   - Quantitative table (`>= 3` criteria rows: e.g., `Strategic Impact 25%`, `Implementation Speed 20%`, `Repo Stack Fit 20%`, `Pre-Mortem Survivability 20%`, `Ops/Cost Simplicity 15%`) + **Mermaid `xychart-beta` or `flowchart LR` diagram**.
5. **`## 5. Recommended Option Verdict & Deep-Dive (MVP vs V1/V2 Cutline & Core Loop)`**:
   - Core user/system loop (`stateDiagram-v2` or `flowchart LR`), concrete mechanics & domain contracts, and strict **`MVP (Build Now)`** vs. **`V1/V2 (Deferred)`** cutline.
6. **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**:
   - Machine-ready handoff block (`Selected Option`, `MVP Scope Cutline`, `Deferred Non-Goals`, `Needs UI Design: true|false`, `Target Repo Touchpoints`, `Key Pre-Mortem Risks for PLAN`).

---

## ✅ DETERMINISTIC CLI VALIDATION GATE & HARD STOP

Validate `BRAINSTORM-{topic}.md` via CLI before presenting it (fix any missing block, option, or matrix row if exit code `!= 0`):

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/BRAINSTORM-{topic}.md" --mode brainstorm
```

> **⛔ WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[BRAINSTORM-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active) and highlight concise next options:
> 1. 🔘 **Click "Proceed"** (or run `/plan:fast` / `/cook:fast`) → Execute the winning `HANDOFF_BRIEF` directly
> 2. 🎨 `/design:fast` or `/design:hard` → Author the 6-Block UI/UX `DESIGN-{topic}.md` specification
> 3. 🔺 `/brainstorm:team` → Escalate to multi-vector Golden Diamond + Multi-Engine Council stress-testing
