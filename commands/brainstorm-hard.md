---
description: "⚡⚡⚡ Deep Ideation — 2-Stage Elastic 5-Lens Grounding, Multi-Engine Council, 6-Month Pre-Mortem & Weighted MCDA Strategic Blueprint"
version: "5.5"
category: planning
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Final User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits) written with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` (1-click **"Proceed"** button in Antigravity 2.0).
> - **Disjoint Shard Outputs (Zero Race Conditions)**: Parallel Stage 1 shards (`researcher#v1..k`, `scouter#s1..k`, `COUNCIL-{topic}.md`) **NEVER write to the same file path**! Shards return structured payloads via message OR write disjoint internal scratch files (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`.

---

# /brainstorm:hard — 2-Stage Deep Strategic Ideation, 6-Month Pre-Mortem & MCDA Blueprint

> **MISSION**: Explore high-leverage product, game, SaaS, or system architecture directions by grounding in empirical market/technical reality (`autonomous_first`), generating **`3–4` orthogonal strategic options**, stress-testing each with an anti-sycophancy **Devil's Advocate 6-Month Pre-Mortem**, and ranking them in a **Weighted MCDA Decision Matrix** (`BRAINSTORM-{topic}.md`).
> **AUTO-TRIGGERED BY STRATEGIC IDEATION (`auto_hard`)**: Triggered when the user asks to *"brainstorm"*, *"explore options"*, *"propose killer features / product strategy"*, *"khám phá ý tưởng"*, or *"đề xuất ý tưởng / phương án"* while `naturalLanguageResearchTrigger = "auto_hard"` (or via explicit `/brainstorm:hard`). *(Pure documentation/SDK lookups belong to `/research`.)*

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 PRIOR-ARTIFACT FAST-FORWARD & COGNITIVE LOAD SHARDING

> ⛔ **ZERO APPLICATION CODE**: Produce `BRAINSTORM-{topic}.md` ONLY — never modify project source code or auto-transition to `/cook` without user approval.
> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. **ALWAYS use `invoke_subagent(TypeName: "self", Model: "inherit")`** for `researcher#v1..k`, `scouter#s1..k`, and `brainstormer`.

1. **Prior-Artifact Fast-Forward Gate (Check `<appDataDir>\brain\<conversation-id>\` on Turn 1!)**:
   - If `RESEARCH-{topic}.md` or `SCOUT-{topic}.md` already exists, extract its structured brief:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<research-or-scout-path>"
     ```
   - **Skip Stage 1 external web re-searching** (only run a targeted `scouter` delta check if repo touchpoints are still unmapped) and jump straight to **Stage 2**!
2. **Elastic Parallel Sharding Law (When no prior `RESEARCH-{topic}.md` exists)**:
   $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
   Each shard owns **at most `3–4` heavy files or `1` research vector**, launched in a single parallel Turn-1 tool batch.

---

## 🎭 Stage 1 (Turn-1 Parallel Grounding — Skipped if Fast-Forwarded): DISJOINT 5-LENS RESEARCH + SCOUTING (+ OPTIONAL COUNCIL)

1. **🔬 Track 1A — `researcher#v1..k` (5-Lens Empirical & Competitor Grounding)**:
   - Execute **4-Source Triangulation + 3-Wave `search_web` (`8–12+` queries)** covering behavioral hooks, `>= 5` real competitors & their fatal weaknesses, technical architecture, unit economics at `1k / 10k / 100k` users, and D7/D30 failure modes.
   - Return structured findings via message OR write disjoint `RESEARCH-{topic}-v{1..k}.md` (`UserFacing: false, RequestFeedback: false`).
2. **🧭 Track 1B — `scouter#s1..k` (Repo Manifests, `1,462` Skills Vault & Domain Constraints)**:
   - Existing codebase: map manifests, reusable schemas/modules (`<= 3–4` files/shard), and matching `SKILL.md` patterns from `matrix-skills/compact-index.json`. Greenfield: spawn domain specialist (`game-engineer` / `tech-lead`) to lock rendering, state-sync, and latency budgets.
   - Return structured constraints via message OR write disjoint `SCOUT-{topic}-s{1..k}.md` (`UserFacing: false, RequestFeedback: false`).
3. **🎼 Track 1C (Conditional — Multi-Engine Council when `engines.researcher = "council"`)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task brainstorm --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"
   ```

---

## 🎭 Stage 2: ORTHOGONAL OPTIONS, 6-MONTH PRE-MORTEM & 6-BLOCK SYNTHESIS (`brainstormer`)

Spawn `brainstormer` (`TypeName: "self"`, `Model: "inherit"`) consuming Stage 1 evidence (or fast-forwarded `HANDOFF_BRIEF` + `COUNCIL-{topic}.md`):
- **Native `ask_question` UI Rule**: Only call `ask_question` (`1–3` crisp multiple-choice questions, unnumbered, no manual `'Other'`, `(Recommended)` option first) **AFTER** Stage 1 grounding if a genuine P0 product/business fork remains unresolved.
- Write **1 cohesive 6-Block `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (`<= 500` lines)** with `ArtifactMetadata: { Summary: "<winning option + MCDA score + MVP scope>", UserFacing: true, RequestFeedback: true }`:
  1. **`## 1. Autonomous Codebase & Constraint Grounding`**: Repo stack/touchpoints (`[file:line]`), empirical competitor/market baseline, hard technical/budget constraints, and explicit **Non-Goals**.
  2. **`## 2. Strategic Options (3–4 Orthogonal Paths)`**: `Option A: Conservative Fast-Ship`, `Option B: Pragmatic Balanced [Recommended]`, `Option C: Ambitious Category Wedge` (plus optional `Option D: Composable / Counter-Conventional`), each with concrete architecture & UX mechanics.
  3. **`## 3. Devil's Advocate 6-Month Failure Pre-Mortem & Rejected Tarpits`**: Assume each option catastrophically failed 6 months post-launch (Scale/Tech Debt cliff, UX/D7/D30 churn, Unit Economics blowup at `1k/10k/100k` users) + explicitly documented **Rejected Tarpit Ideas**.
  4. **`## 4. Weighted MCDA Decision Matrix`**: Quantitative scoring table (`>= 3` weighted rows across Impact, Speed, Stack Fit, Pre-Mortem Survivability, Unit Economics) + **Mermaid `xychart-beta` / `flowchart LR` diagram** (and optional `generative_ui` interactive trade-off explorer for complex comparisons).
  5. **`## 5. Recommended Option Verdict & Deep-Dive (MVP vs V1/V2 Cutline & Core Loop)`**: Core Loop Mermaid `stateDiagram-v2` / `flowchart LR` (Micro → D1–D7 → D30+), `3–5` Killer Differentiators, Domain Entities/State Contracts, and strict **`MVP` vs `V1/V2` cutline**.
  6. **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**: Structured contract (`Selected Option`, `Pinned Stack`, `MVP Scope Cutline`, `Deferred Non-Goals`, `Needs UI Design: true|false`, `Target Touchpoints`, `Pre-Mortem Risks to Guard in PLAN`).

---

## ✅ DETERMINISTIC CLI VALIDATION GATE & HARD STOP

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/BRAINSTORM-{topic}.md" --mode brainstorm
```

> **⛔ WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[BRAINSTORM-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active), summarize the winning strategy & Pre-Mortem safeguards, and offer next steps:
> 1. 🔘 **Click "Proceed"** (or run `/plan:hard` / `/cook:hard`) → Consume `HANDOFF_BRIEF` directly with zero re-researching
> 2. 🎨 `/design:hard` → Author the 6-Block UI/UX `DESIGN-{topic}.md` & live HTML prototype
> 3. 🔺 `/brainstorm:team` → Escalate to Golden Diamond adversarial Pre-Mortem debate
