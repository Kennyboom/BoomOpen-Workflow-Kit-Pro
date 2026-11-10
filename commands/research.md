---
description: "🔬 Research Router — SOTA 2026 Autonomous Deep-Research Engine with 5-Lens Triangulation, Contradiction Arbitration, Multi-Engine Council & Deterministic CLI Validation"
version: "5.5"
category: research
execution-mode: router
---

# /research — Autonomous Deep-Research & `HANDOFF_BRIEF` Router (v5.5)

> **ROUTER DIRECTIVE**: Route empirical documentation lookups, SDK/API investigations, architecture comparisons, and competitor benchmarks to `/research:fast`, `/research:hard`, or `/research:team` immediately on Turn 1.
> **DEFAULT ROUTING (`auto_team`)**: When `workflows.defaultVariant = "auto"` or `workflows.naturalLanguageResearchTrigger = "auto_team"`, route **IMMEDIATELY on Turn 1** to `/research:team` (`commands/research-team.md`), or `/research:hard` (`commands/research-hard.md`) when configured as `"auto_hard"`.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & SUB-AGENT CAPABILITY RULE

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Stage 1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`; load `./rules/*.md` on-demand in parallel only when needed.

> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**:
> Antigravity's built-in read-only scout sub-agent runs in a restricted sandbox with **NO network access (`search_web` disabled) and NO `write_file` tool**.
> **ALWAYS use `invoke_subagent(TypeName: "self", Role: ..., Model: "inherit", Prompt: ...)`** for `researcher`, `research-team`, and `scouter` shards so every agent has full live web search (`search_web`) and Brain Artifact access.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

Whenever the user asks in natural language for empirical research, deep technical investigation, official documentation verification, or architecture/benchmark comparisons across any of the 17 supported languages without typing `/research`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"research"*, *"deep dive into"*, *"investigate"*, *"analyze in depth"*, *"compare architectures/benchmarks"* |
| **`vi` (Tiếng Việt)** | *"nghiên cứu"*, *"tìm hiểu sâu"*, *"phân tích chuyên sâu"*, *"đánh giá kỹ thuật"*, *"so sánh giải pháp"* |
| **`zh-CN` / `zh-TW`** | *"深入研究"*, *"深度分析"*, *"技术调研"*, *"对比方案"* / *"深入研究"*, *"深度分析"*, *"技術調研"* |
| **`ja` (日本語)** | *"徹底的に調査して"*, *"深掘り分析して"*, *"技術調査"*, *"ベンチマーク比較"* |
| **`ko` (한국어)** | *"심층 연구해줘"*, *"깊이 분석해줘"*, *"기술 조사"*, *"아키텍처 비교"* |
| **`es` / `pt-BR`** | *"investigar a fondo"*, *"análisis profundo"* / *"pesquisar a fundo"*, *"análise técnica profunda"* |
| **`fr` / `de` / `it`** | *"rechercher en profondeur"*, *"analyser en détail"* / *"tiefgehend recherchieren"*, *"analysieren"* / *"ricerca approfondita"* |
| **`ru` / `tr`** | *"глубоко исследовать"*, *"провести тех. анализ"* / *"derinlemesine araştır"*, *"teknik analiz yap"* |
| **`hi` / `ar`** | *"गहन शोध करें"*, *"विस्तृत विश्लेषण करें"* / *"ابحث بعمق"*, *"تحليل تقني شامل"* |
| **`id` / `th`** | *"riset mendalam"*, *"analisis secara mendalam"* / *"วิจัยเชิงลึก"*, *"วิเคราะห์เจาะลึก"* |

> 💡 **Clean Boundary vs. `/brainstorm`**: `/research` establishes **empirical truth** (specs, versions, benchmarks, contradiction arbitration). If the user asks to explore strategic product options, pitch new features, or ideate concepts (*"brainstorm"*, *"khám phá ý tưởng"*, *"đề xuất tính năng"*), route to `/brainstorm` (`commands/brainstorm.md`).

---

## 🔘 COHESIVE SINGLE-FILE ARTIFACT, 1-CLICK `"PROCEED"`, MULTI-ENGINE COUNCIL & CLI VALIDATION

> ⛔ **ALL `/research` workflows produce EVIDENCE-BACKED RESEARCH ARTIFACTS ONLY. NO APPLICATION SOURCE CODE.**
>
> 1. **Cohesive Single-File Rule (`<= 500` Lines — ZERO `{name}/` Folder Splits)**:
>    - Always synthesize **1 single, self-contained 6-Block user-facing file** at `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (`<= 500` lines; fallback `./reports/{topic}/RESEARCH-{topic}.md` outside Antigravity). Never split `RESEARCH-{topic}.md` into multi-file `{name}/` folders, and never assign the same output path to concurrent parallel shards!
> 2. **Antigravity 2.0 Native 1-Click `"Proceed"` Button (`ArtifactMetadata.RequestFeedback: true`)**:
>    - Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` **exclusively** on `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` so Antigravity 2.0 renders the native 1-click **"Proceed"** button.
>    - Set `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }` on all internal scratch/support files (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`, `COUNCIL-{topic}.md`, `MAILBOX-{date}.md`).
> 3. **Multi-Engine Research Council (`engines.researcher = "council"`)**:
>    - When `engines.researcher = "council"` in `/settings` (or when multi-platform research is requested), run:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task research --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"`
> 4. **Deterministic CLI Validation & Downstream `HANDOFF_BRIEF` Bridge (`boomopen research <validate|brief>`)**:
>    - Validate every `RESEARCH-{topic}.md` before presenting it to the user:
>      `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/RESEARCH-{topic}.md" --mode research`
>    - When the user clicks **"Proceed"** (or runs `/brainstorm`, `/design`, `/plan`, or `/cook`), downstream workflows extract Block 6 (`HANDOFF_BRIEF`) via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<path>"` with **zero redundant re-searching**!

---

## 🧭 ROUTING LOGIC

```text
1. IF user explicitly specifies a variant:
   - `/research:fast` → Load `commands/research-fast.md`
   - `/research:hard` → Load `commands/research-hard.md`
   - `/research:team` → Load `commands/research-team.md`

2. IF `engines.researcher` in `~/.boomopen/settings.json` (or `./.boomopen.json`) is set to a specific non-current CLI engine (`claude`, `codex`, `antigravity`, `cursor`, `copilot`):
   - Dispatch via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role researcher --engine <engines.researcher> --prompt "<topic>"` (or include `conduct council --task research --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md"` inside `:hard` / `:team` when `engines.researcher = "council"`).

3. IF no variant is specified (`/research <topic>`) OR triggered via Multilingual Natural-Language Deep Research:
   - Check active `workflows.naturalLanguageResearchTrigger` / `workflows.defaultVariant`:
     * `auto_team` / `team` (DEFAULT) → Route IMMEDIATELY to `/research:team` (`commands/research-team.md`)
     * `auto_hard` / `hard` → Route IMMEDIATELY to `/research:hard` (`commands/research-hard.md`)
     * `fast` → Route to `/research:fast` (`commands/research-fast.md`)
     * `ask_first` / `ask` → Call `ask_question` UI tool with `(Recommended) /research:team` first
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Architecture & Best Use Case |
|-------|---------------|------------------------------|
| **`/research:fast`** | `commands/research-fast.md` | **Fast 2-Wave Documentation & API Research (`1` Stage)**: Single `researcher` (`TypeName: "self"`) executing **4-Source Triangulation** + **2-Wave Search (`4–6` queries)** → validated 6-Block `RESEARCH-{topic}.md` (`RequestFeedback: true`) |
| **`/research:hard`** | `commands/research-hard.md` | **Deep 3-Wave Elastic Parallel Research (`2` Stages)**: Turn-1 parallel `researcher#v1..k` + `scouter#s1..k` (+ optional `COUNCIL-{topic}.md`) → Contradiction Arbitration → 1 cohesive 6-Block `RESEARCH-{topic}.md` (`RequestFeedback: true`) |
| **`/research:team`** | `commands/research-team.md` | **Default (`auto_team`) — 2-Stage Elastic Golden Diamond `3–6` Vector Deep-Research**: Turn-1 parallel `research-team` vectors (+ optional `conduct council --task research --prompt "<research-context>"`) → Adversarial Cross-Examination via `send_message` → 1 cohesive 6-Block `RESEARCH-{topic}.md` (`RequestFeedback: true`) |
