---
description: "🔺 Team Brainstorm — 2-Stage Elastic Golden Diamond Grounding, Multi-Engine Council, Devil's Advocate Pre-Mortem Cross-Exam & MCDA Decision Blueprint"
version: "5.5"
category: ideation
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Single User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits!) written with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` (rendering Antigravity 2.0's 1-click **"Proceed"** button).
> - **Zero Parallel Write Collisions & Zero Multi-File Clutter**: Parallel Stage 1 shards (`researcher#v1..k`, `scouter#s1..k`, `COUNCIL-{topic}.md`) **NEVER write to the same file path**! Shards return structured payloads via message OR write disjoint internal scratch files (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`. Consolidated debate logs in `MAILBOX-{date}.md` are also written strictly with `UserFacing: false, RequestFeedback: false`.

---

# /brainstorm:team — 2-Stage Elastic Golden Diamond Adversarial Ideation (`agents/teams/brainstorm-team/_team.md`)

> **MISSION**: Deliver anti-sycophantic, empirically grounded product, game, or system architecture strategy in **2 high-parallelism stages** (replacing legacy 3-triangle sequential sprawl): **Stage 1 Parallel Empirical & Codebase Grounding (+ Optional Multi-Engine Council)** followed by **Stage 2 Adversarial Option Synthesis & 6-Month Pre-Mortem Cross-Examination (`brainstorm-team-executor` ⇄ `brainstorm-team-reviewer`, signed off by `brainstorm-team-techlead`)** into **1 CLI-validated 6-Block `BRAINSTORM-{topic}.md`**.
> **DEFAULT (`naturalLanguageResearchTrigger = "auto_team"`)**: Default workflow for `/brainstorm` and natural-language ideation across all 17 languages.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 PRIOR-ARTIFACT FAST-FORWARD & SUB-AGENT CAPABILITY RULE

> ⛔ **ZERO APPLICATION CODE**: Produce `BRAINSTORM-{topic}.md` ONLY — never modify project source files or auto-transition to `/cook` without user approval.
> 📖 **Team Definition**: Follow `agents/teams/brainstorm-team/_team.md` (`techlead.md`, `executor.md`, `reviewer.md`) and `commands/_ref/golden-triangle-protocol.md` (Warm Session Reuse via `send_message`).
> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. **ALWAYS use `invoke_subagent(TypeName: "self", Model: "inherit")`** for every Stage 1 and Stage 2 agent!

### 🚀 Prior-Artifact Fast-Forward Gate (Check `<appDataDir>\brain\<conversation-id>\` on Turn 1!):
- If `RESEARCH-{topic}.md` (and/or `SCOUT-{topic}.md`) already exists in `<appDataDir>\brain\<conversation-id>\`, extract its structured brief immediately:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<research-or-scout-path>"
  ```
- **Fast-Forward**: Skip Stage 1 external web re-searching (only run a quick `scouter` pass if repo files were not yet mapped, plus optional `COUNCIL-{topic}.md`) and launch **Stage 2** right away!

---

## 🎭 Stage 1 (Turn-1 Parallel Fan-Out — When No Prior `RESEARCH` Exists): EMPIRICAL & CODEBASE GROUNDING (+ COUNCIL)

Spawn all Stage 1 grounding shards in **1 parallel Turn-1 tool batch** (`TypeName: "self"`, `Model: "inherit"`):

| Parallel Track | Specialist Shard | Disjoint Mission & Output Lock (`UserFacing: false, RequestFeedback: false`) |
|----------------|------------------|------------------------------------------------------------------------------|
| **🔬 Track 1A: Market, Competitor & Tech Vectors** | `researcher#v1..k` (`1` vector/shard) | Execute **4-Source Triangulation + 3-Wave `search_web` (`8–12+` queries)**: behavioral hooks, `>= 5` real competitors & fatal weaknesses, system architecture, and unit economics at `1k / 10k / 100k` users. Return structured payload via message OR write disjoint `RESEARCH-{topic}-v{1..k}.md`. |
| **🧭 Track 1B: `autonomous_first` Repo & Skills Grounding** | `scouter` / `scouter#s1..k` (`<= 3–4` files/shard; or `game-engineer` / `tech-lead` for greenfield) | Map workspace manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `./documents/`), existing module touchpoints, and matching 2026 `SKILL.md` rules from `matrix-skills/compact-index.json` (`1,462` skills). Return payload via message OR write disjoint `SCOUT-{topic}-s{1..k}.md`. |
| **🎼 Track 1C: Multi-Engine Council *(Conditional)*** | `boomopen conduct council` (when `engines.researcher = "council"` or requested) | Run concurrently on Turn 1:<br>`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task brainstorm --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"` |

---

## 🎭 Stage 2: ADVERSARIAL OPTION SYNTHESIS & 6-MONTH PRE-MORTEM CROSS-EXAMINATION — 💎 GOLDEN DIAMOND

Spawn the `brainstorm-team` Golden Diamond (`agents/teams/brainstorm-team/{techlead,executor,reviewer}.md`, `TypeName: "self"`, `Model: "inherit"`), record `role → conversationId`, and drive `<= 2–3` adversarial debate rounds via **Warm Session Reuse (`send_message`)** (coordinator logs consolidated rounds to `MAILBOX-{date}.md` with `UserFacing: false, RequestFeedback: false`):

| Golden Diamond Role | Specialist (`agents/teams/brainstorm-team/`) | Adversarial Responsibility |
|---------------------|----------------------------------------------|----------------------------|
| **⚙️ `brainstorm-team-executor`** | `executor.md` (`brainstormer`) | Grounded in Stage 1 / `HANDOFF_BRIEF` + `COUNCIL-{topic}.md`, construct **`3–4` genuinely orthogonal strategic options** (`Option A: Conservative Fast-Ship`, `Option B: Pragmatic Balanced [Recommended]`, `Option C: Ambitious Category Wedge`, optional `Option D: Composable Alternative`), Core Loop, Killer Mechanics, and strict `MVP` vs. `V1/V2` cutline. |
| **🛡️ `brainstorm-team-reviewer`** | `reviewer.md` (`tech-lead` Pre-Mortem Critic) | **Anti-Sycophancy Devil's Advocate**: Assume each option **catastrophically failed 6 months in production** — attack scale/tech-debt cliffs, D7/D30 churn traps, unit-economics blowups (`1k/10k/100k` users), and seductive tarpit features via `send_message` until every surviving option has falsifiable mitigations. |
| **🔺 `brainstorm-team-techlead`** | `techlead.md` (Strategic Arbitrator) | Arbitrate trade-offs, compute final **Weighted MCDA Decision Matrix** scores, trigger `ask_question` **ONLY** if a genuine P0 business/product fork requires user choice (`(Recommended)` option first), stamp `✅ CONSENSUS: brainstorm-team-techlead ✓ | brainstorm-team-executor ✓ | brainstorm-team-reviewer ✓`, and synthesize `BRAINSTORM-{topic}.md`. |

### 📐 Canonical 6-Block `BRAINSTORM-{topic}.md` (`<= 500` Lines, `UserFacing: true, RequestFeedback: true`):
1. **`## 1. Autonomous Codebase & Constraint Grounding`**: Repo stack/touchpoints (`[file:line]`), empirical market/competitor baseline (+ Council summary if active), hard constraints, and **Non-Goals**.
2. **`## 2. Strategic Options (3–4 Orthogonal Paths)`**: `Option A: Conservative Fast-Ship`, `Option B: Pragmatic Balanced [Recommended]`, `Option C: Ambitious Category Wedge` (+ optional `Option D`), with concrete UX & architecture mechanics.
3. **`## 3. Devil's Advocate 6-Month Failure Pre-Mortem & Rejected Tarpits`**: Per-option 6-month production failure post-mortem, survivability mitigations, and explicitly pruned **Rejected Tarpit Ideas**.
4. **`## 4. Weighted MCDA Decision Matrix`**: Quantitative table (`>= 3` weighted rows) + **Mermaid `xychart-beta` / `flowchart LR` diagram** (plus optional `generative_ui` interactive comparison widget for multi-axis trade-offs).
5. **`## 5. Recommended Option Verdict & Deep-Dive (MVP vs V1/V2 Cutline & Core Loop)`**: Core Loop Mermaid `stateDiagram-v2` / `flowchart LR`, differentiating Killer Mechanics, Domain Entities/Contracts, and strict **`MVP` vs `V1/V2` cutline**.
6. **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**: Machine-ready contract (`Selected Option`, `Pinned Stack`, `MVP Scope Cutline`, `Deferred Non-Goals`, `Needs UI Design: true|false`, `Target Touchpoints`, `Pre-Mortem Risks for PLAN`, `Consensus Stamp`).

---

## ✅ DETERMINISTIC CLI VALIDATION GATE & HARD STOP

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/BRAINSTORM-{topic}.md" --mode brainstorm
```

> **⛔ WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[BRAINSTORM-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active), summarize the consensus-winning strategy & Pre-Mortem safeguards, and offer next steps:
> 1. 🔘 **Click "Proceed"** (or run `/plan:team` / `/cook:team`) → Consume `HANDOFF_BRIEF` directly with zero re-researching
> 2. 🎨 `/design:team` or `/design:hard` → Author the 6-Block UI/UX `DESIGN-{topic}.md` & live HTML prototype
> 3. 🎼 `/conduct:pipeline` → Execute cross-engine implementation & adversarial review
