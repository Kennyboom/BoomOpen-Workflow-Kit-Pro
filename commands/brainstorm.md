---
description: "💡 Brainstorm Router — SOTA 2026 Anti-Sycophancy Strategic Ideation, 6-Month Pre-Mortem Critic, Weighted MCDA Decision Matrix & 1-Click Proceed Handoff"
version: "5.5"
category: planning
execution-mode: router
---

# /brainstorm — Structured Adversarial Brainstorming & Strategic Option Router (v5.5)

> **ROUTER DIRECTIVE**: Ground product, feature, game, or architecture ideation in codebase reality first (`autonomous_first`), fast-forward any existing `RESEARCH-{topic}.md`, and route immediately on Turn 1 to `/brainstorm:fast`, `/brainstorm:hard`, or `/brainstorm:team`.
> **DEFAULT ROUTING (`auto_team`)**: When `workflows.defaultVariant = "auto"` or `workflows.naturalLanguageResearchTrigger = "auto_team"`, route **IMMEDIATELY on Turn 1** to `/brainstorm:team` (`commands/brainstorm-team.md`), or `/brainstorm:hard` (`commands/brainstorm-hard.md`) when configured as `"auto_hard"`.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & SUB-AGENT CAPABILITY RULE

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Stage 1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`; load `./rules/*.md` on-demand in parallel only when needed.

> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**:
> Antigravity's built-in read-only scout sub-agent runs in a restricted sandbox with **NO network access (`search_web` disabled) and NO `write_file` tool**.
> **ALWAYS use `invoke_subagent(TypeName: "self", Role: ..., Model: "inherit", Prompt: ...)`** for `brainstormer`, `researcher`, `scouter`, `tech-lead`, and `brainstorm-team` shards!

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

Whenever the user asks in natural language to brainstorm ideas, explore strategic options, propose killer features, or evaluate product/game/architecture directions across any of the 17 supported languages without typing `/brainstorm`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"brainstorm"*, *"explore options/ideas"*, *"propose killer features"*, *"ideate product/game/architecture concepts"* |
| **`vi` (Tiếng Việt)** | *"khám phá ý tưởng"*, *"đề xuất ý tưởng"*, *"đề xuất phương án / tính năng"*, *"brainstorm sản phẩm/game"* |
| **`zh-CN` / `zh-TW`** | *"头脑风暴"*, *"探索创意/方案"*, *"提出创新功能点"* / *"腦力激盪"*, *"探索創意/方案"*, *"提出創新功能"* |
| **`ja` (日本語)** | *"アイデアを出して"*, *"ブレインストーミングして"*, *"新機能・方針を提案して"* |
| **`ko` (한국어)** | *"아이디어 브레인스토밍해줘"*, *"새로운 기능/옵션 제안해줘"*, *"컨셉 탐색해줘"* |
| **`es` / `pt-BR`** | *"lluvia de ideas"*, *"proponer opciones/funciones"* / *"brainstorm de ideias"*, *"propor novas funcionalidades"* |
| **`fr` / `de` / `it`** | *"brainstormer des idées"*, *"proposer des options"* / *"Ideen sammeln (Brainstorming)"* / *"proporre nuove idee"* |
| **`ru` / `tr`** | *"мозговой штурм"*, *"предложить идеи/варианты"* / *"beyin fırtınası yap"*, *"yeni fikirler öner"* |
| **`hi` / `ar`** | *"नए विचारों पर मंथन करें"*, *"फ़ीचर/विकल्प सुझाएं"* / *"عصف ذهني للأفكار"*, *"اقترح ميزات مبتكرة"* |
| **`id` / `th`** | *"brainstorming ide"*, *"usulkan opsi/fitur baru"* / *"ระดมสมองหาไอเดีย"*, *"เสนอฟีเจอร์ใหม่ๆ"* |

---

## 🔘 ANTI-SYCOPHANCY ARCHITECTURE, NATIVE `ask_question`, 1-CLICK `"PROCEED"` & CLI VALIDATION

> ⛔ **ALL `/brainstorm` workflows produce STRATEGIC DECISION BLUEPRINTS ONLY. NO APPLICATION SOURCE CODE.**
>
> 1. **Prior-Artifact Fast-Forward Gate (`boomopen research brief`)**:
>    - Inspect `<appDataDir>\brain\<conversation-id>\` on Turn 1. If `RESEARCH-{topic}.md` (or `SCOUT-{topic}.md`) already exists, extract its structured brief via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<research-path>"` and **skip redundant web searches**!
> 2. **`autonomous_first` Grounding + Native `ask_question` UI Rule**:
>    - Never dump blind plain-text question walls on Turn 1! Ground in repo manifests/files first; call Antigravity 2.0's native `ask_question` tool (`1–3` crisp multiple-choice questions, unnumbered, no manual `'Other'`, `(Recommended)` option first) **ONLY** after grounding when a genuine P0 product/business fork remains.
> 3. **Cohesive Single-File Rule (`<= 500` Lines) & 1-Click `"Proceed"` (`ArtifactMetadata.RequestFeedback: true`)**:
>    - Synthesize **1 cohesive 6-Block user-facing file** at `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so Antigravity 2.0 renders the native 1-click **"Proceed"** button.
>    - Keep all internal vector/support files (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`, `COUNCIL-{topic}.md`, `MAILBOX-{date}.md`) strictly `UserFacing: false, RequestFeedback: false`.
> 4. **Multi-Engine Ideation Council & Deterministic CLI Validation (`boomopen research validate`)**:
>    - When `engines.researcher = "council"` (or multi-platform ideation is requested), run:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task brainstorm --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"`
>    - Validate every `BRAINSTORM-{topic}.md` before presenting it to the user:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/BRAINSTORM-{topic}.md" --mode brainstorm`
>    - Clicking **"Proceed"** bridges `HANDOFF_BRIEF` straight into `/design`, `/plan`, or `/cook` with zero re-researching!

---

## 🧭 ROUTING LOGIC

```text
1. IF the request is pure empirical/documentation investigation with no strategic option ideation ("nghiên cứu", "tìm hiểu sâu", "investigate SDK/API docs"):
   → Hand off to `/research` (`commands/research.md`).

2. IF user explicitly specifies a variant:
   - `/brainstorm:fast` → Load `commands/brainstorm-fast.md`
   - `/brainstorm:hard` → Load `commands/brainstorm-hard.md`
   - `/brainstorm:team` → Load `commands/brainstorm-team.md`

3. IF topic is strategic product/game/system/feature ideation (no explicit variant):
   - Check active `workflows.naturalLanguageResearchTrigger` / `workflows.defaultVariant`:
     * `auto_team` / `team` (DEFAULT) → Route IMMEDIATELY to `/brainstorm:team` (`commands/brainstorm-team.md` — 2-Stage Elastic Golden Diamond + Pre-Mortem Critic)
     * `auto_hard` / `hard` → Route IMMEDIATELY to `/brainstorm:hard` (`commands/brainstorm-hard.md` — Parallel 5-Lens Grounding + 6-Block Strategic Matrix)
     * `fast` → Route to `/brainstorm:fast` (`commands/brainstorm-fast.md` — 1-Wave Autonomous Grounding + 3-Option Matrix)
     * `ask_first` / `ask` → Call `ask_question` UI tool with `(Recommended) /brainstorm:team` first
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Architecture & Best Use Case |
|-------|---------------|------------------------------|
| **`/brainstorm:fast`** | `commands/brainstorm-fast.md` | **1-Wave Rapid Strategic Ideation (`1` Wave)**: Parallel `scouter` + `brainstormer` (`autonomous_first` grounding) → `3` Orthogonal Options + Pre-Mortem + Decision Matrix → validated `BRAINSTORM-{topic}.md` (`RequestFeedback: true`) |
| **`/brainstorm:hard`** | `commands/brainstorm-hard.md` | **2-Stage Elastic 5-Lens Grounding & Strategic Blueprint**: Prior `RESEARCH` fast-forward or parallel `researcher#v1..k` + `scouter#s1..k` (+ optional `COUNCIL-{topic}.md`) → `3–4` Options + 6-Month Pre-Mortem + Weighted MCDA Matrix → validated `BRAINSTORM-{topic}.md` (`RequestFeedback: true`) |
| **`/brainstorm:team`** | `commands/brainstorm-team.md` | **Default (`auto_team`) — 2-Stage Elastic Golden Diamond Adversarial Ideation**: Stage 1 parallel grounding (+ optional `conduct council --task brainstorm`) → Stage 2 `brainstorm-team-executor` ⇄ `brainstorm-team-reviewer` Pre-Mortem Cross-Exam via `send_message` → validated `BRAINSTORM-{topic}.md` (`RequestFeedback: true`) |
