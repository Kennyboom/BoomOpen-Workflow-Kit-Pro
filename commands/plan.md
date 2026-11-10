---
description: 📋 Plan Router — Smart 3-Tier Adaptive Planning, Cross-Engine Planner & Antigravity 2.0 Native Artifact Router
version: "5.5"
category: planning
execution-mode: router
---

# /plan — Smart Planning & Spec-to-Execution Router

> **ROUTER DIRECTIVE**: Classify scope complexity, existing spec documents, and `engines.planner` configuration, then route immediately on Turn 1 to `/plan:fast`, `/plan:hard`, `/plan:team`, or `/autopilot:init`.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & ON-DEMAND RULES

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the 5-Field Handoff Packet (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Wave 1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`; load `./rules/*.md` on-demand in parallel only when needed.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks for an implementation plan, technical specification, roadmap, or task breakdown in natural language without typing `/plan`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"plan"*, *"create an implementation plan"*, *"write a spec"*, *"roadmap"*, *"break down tasks"*, *"architecture plan"* |
| **`vi` (Tiếng Việt)** | *"lập kế hoạch"*, *"lên kế hoạch"*, *"viết plan"*, *"phân rã task"*, *"lộ trình triển khai"*, *"thiết kế kế hoạch"* |
| **`zh-CN` / `zh-TW`** | *"制定计划"*, *"编写实施计划"*, *"任务拆解"*, *"技术方案规划"* / *"制定計劃"*, *"編寫實施計劃"*, *"任務拆解"* |
| **`ja` (日本語)** | *"計画を立てて"*, *"実装計画を作成"*, *"タスク分解"*, *"ロードマップ作成"* |
| **`ko` (한국어)** | *"계획 세워줘"*, *"구현 계획 작성"*, *"태스크 분해"*, *"로드맵 작성"* |
| **`es` / `pt-BR`** | *"crear plan de implementación"*, *"planificar"*, *"desglosar tareas"* / *"criar plano de implementação"*, *"planejar"* |
| **`fr` / `de` / `it`** | *"planifier"*, *"créer un plan"* / *"Implementierungsplan erstellen"*, *"planen"* / *"creare un piano di implementazione"* |
| **`ru` / `tr`** | *"составить план реализации"*, *"спланировать"* / *"uygulama planı oluştur"*, *"planla"* |
| **`hi` / `ar`** | *"योजना बनाएं"*, *"कार्यान्वयन योजना"* / *"ضع خطة تنفيذ"*, *"تخطيط المشروع"* |
| **`id` / `th`** | *"buat rencana implementasi"*, *"rencanakan"* / *"วางแผนการพัฒนา"*, *"สร้างแผนงาน"* |

---

## 🎯 3-TIER ADAPTIVE ROUTING & CROSS-ENGINE PLANNER (`engines.planner`)

1. **Tier 1 — Focused / Small Scope (`1–5` files, single module, known approach)** → **`/plan:fast`** (`commands/plan-fast.md`, compact `<= 100` lines single-wave plan).
2. **Tier 2 — Multi-File / Multi-Module Feature (`6–12` files or `> 2` files needing codebase scouting + pattern research)** → **`/plan:hard`** (`commands/plan-hard.md`, 2-Wave Fused Parallel Discovery + 6-Block Cohesive Plan).
3. **Tier 3 — High-Stakes Architecture, `execution.mode = team`, or Large Epic (`> 12` files / `>= 3` phases)** → **`/plan:team`** (`commands/plan-team.md`, 2-Stage Elastic Golden Diamond + automatic `.boomopen/project-ledger.json` compilation via `boomopen plan validate --sync-ledger` / `boomopen ledger from-plan`).
4. **Multi-Document Spec Directory (`./docs/`, `./specs/`, `PRD*.md`, `SRS*.md`) for Multi-Session Execution** → Route to **`/autopilot:init`** (`commands/autopilot-init.md`) or run **`/plan:team`** followed by `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger from-plan <plan-path>`.
5. **Cross-Engine Planner & Council Routing (`engines.planner` in `/settings`)**:
   - **`engines.planner = "council"`** (or user requests multi-platform planning synthesis): Route to `/plan:team` (or `/plan:hard` Wave 1 Council) and run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task plan --engines <engines.councilMembers> --prompt "<task>"`.
   - **`engines.planner = "auto" | "claude" | "codex" | "antigravity" | "cursor" | "copilot"`**: When resolved to an external CLI engine, dispatch plan synthesis via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role planner --engine <engines.planner> --prompt "<task>"`.

---

## 🔘 ANTIGRAVITY 2.0 NATIVE "PROCEED" BUTTON & COHESIVE SINGLE-FILE RULE (MANDATORY)

> ⛔ **ALL plan workflows produce PLAN FILES ONLY. NO IMPLEMENTATION CODE.**
>
> - ❌ **NEVER** write implementation code or modify application source files during `/plan`.
> - ❌ **NEVER** auto-transition to `/code`, `/cook`, or `/fix` without user approval.
> - ✅ **Cohesive Single-File Rule (`<= 500` lines)**: Keep `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` as **1 single, self-contained file up to 500 lines** (NEVER split `PLAN-{task}.md` into a `{name}/` folder at 150 lines!). For `> 12` files or `>= 3` waves, also sync `.boomopen/project-ledger.json` via `boomopen plan validate <plan-path> --sync-ledger`.
> - ✅ **Native 1-Click "Proceed" Button (`ArtifactMetadata.RequestFeedback: true`)**:
>   - When writing or editing `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md`, **ALWAYS** set:
>     `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }`
>     so Antigravity 2.0 renders the native **"Proceed"** button directly in the UI (clicking "Proceed" triggers the Approved-Plan Continuation Gate → `/code:hard` or `/code:team`).
>   - Supporting artifacts (`SCOUT-{task}.md`, `RESEARCH-{task}.md`, `BRAINSTORM-{task}.md`, `COUNCIL-PLAN-{task}.md`, `MAILBOX-{date}.md`) **MUST** set `RequestFeedback: false` so premature "Proceed" buttons never appear.
> - ✅ **Deterministic CLI Validation**: Every plan workflow MUST run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate <plan-path>` before presenting the plan to the user.

---

## 🔀 ROUTING LOGIC

```
IF user points to a multi-doc spec folder (./docs/, ./specs/, PRD*.md) for multi-session execution:
  → Route to /autopilot:init (commands/autopilot-init.md)

IF task is clear & localized (known approach, <= 2–5 files, single module):
  → Route to /plan:fast (commands/plan-fast.md)

IF task is complex (> 2 files, research + codebase scouting needed — Default for auto):
  → Route to /plan:hard (commands/plan-hard.md)

IF task is high-stakes (> 12 files, >= 3 waves, execution.mode = team, or engines.planner = council):
  → Route to /plan:team (commands/plan-team.md)
```

| Route | Scope & Ceremony | Post-Plan Continuation |
|-------|------------------|------------------------|
| `/plan:fast` | Tier 1 Compact Plan (`<= 100` lines, `1` fast scout + `1` wave) | Click **"Proceed"** → `/code:fast` or `/code:hard` |
| `/plan:hard` | Tier 2 Fused 2-Wave Plan (Turn-1 parallel `scouter#1..k` + `researcher#1..k` → 6-Block `PLAN-{task}.md`) | Click **"Proceed"** → `/code:hard` or `/code:team` |
| `/plan:team` | Tier 3 2-Stage Elastic Golden Diamond + Multi-Engine Council + Auto-Ledger Sync | Click **"Proceed"** → `/code:team` or `/autopilot:run` |

---

## PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 📋 Planning Mode Selection

**Task**: [parsed task]

1. ⚡ **Fast** → `/plan:fast` — Compact 1-wave plan (`<= 100` lines)
2. ⚡⚡⚡ **Hard** → `/plan:hard` — 2-Wave parallel scout/research + 6-Block validated plan
3. 👥 **Team** → `/plan:team` — 2-Stage Elastic Golden Diamond + Ledger compilation

⏳ Awaiting selection...
```
