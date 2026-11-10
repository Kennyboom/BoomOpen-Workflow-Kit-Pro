---
description: "🎼 Cross-Engine Autonomous Conductor & Multi-Engine Council — Orchestrate Claude Code, OpenAI Codex, Antigravity, Cursor, and Copilot in Role-Division Pipelines or Parallel Multi-Engine Councils with 4-Part Consensus Synthesis."
version: "5.5"
category: orchestration
execution-mode: router
---

# /conduct — Cross-Engine Autonomous Conductor & Multi-Engine Council (v5.5)

> **ROUTER DIRECTIVE**: Coordinate **multiple AI platforms and model families** (`Claude Code` [Anthropic], `OpenAI Codex` [OpenAI], `Antigravity` [Google Gemini], `Cursor`, `GitHub Copilot`) on the same workspace using either **Mode 1: Multi-Engine Parallel Council (`/conduct:council`)** or **Mode 2: Cross-Engine Role-Division Pipeline (`/conduct:pipeline`)**.

<arguments>$ARGUMENTS</arguments>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, CLI SYNTAX & BRAIN ARTIFACT CONTRACT

1. **Zero Pre-Flight Tax & 0-Turn Native Fallback**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch `/conduct:{council|pipeline}` **immediately on Turn 1**. Whenever an external CLI engine is unavailable on `PATH` (queued in `.boomopen/conductor/queue/`) or `engines.<role> = "current"`, spawn native parallel shards via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` and reuse warm sessions via `send_message`.
2. **Conductor CLI Suite**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct <probe|dispatch|council|status>
   ```
   *(Or `boomopen conduct <probe|dispatch|council|status>`)*
3. **Cohesive Brain Artifacts & `ArtifactMetadata` (`<= 500` lines, Clean Git Tree)**:
   - Write cross-engine synthesis deliverables as single cohesive files in `<appDataDir>\brain\<conversation-id>\COUNCIL-{topic}.md` (plus canonical `RESEARCH` / `BRAINSTORM` / `PLAN` / `DESIGN` / `REVIEW` / `DEBUG` artifacts; use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested):
     - **`COUNCIL-{topic}.md` & Research/Review/Debug/Pipeline Reports**: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`
     - **Approval-Gate `PLAN-{topic}.md` Blueprint**: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }`

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

Whenever the user asks in natural language to coordinate multiple AI platforms/engines in parallel for consensus synthesis (`council`) OR assign different AI engines to specialist roles like planning, coding, debugging, and reviewing (`pipeline`) across any of the 17 supported languages without typing `/conduct`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases (`council` vs. `pipeline`) |
|----------|-------------------------------------------------------------|
| **`en` (English)** | *"let Claude, Codex, and Antigravity all research/plan/review/debug in parallel and synthesize"*, *"3 engines 3 perspectives"*, *"use Claude for planning/docs and Codex/Cursor for coding & debugging"* |
| **`vi` (Tiếng Việt)** | *"cho nhiều nền tảng cùng nghiên cứu / lên kế hoạch / review / debug rồi tổng hợp lại"*, *"3 nghiên cứu 3 góc nhìn"*, *"dùng Claude viết tài liệu/lên kế hoạch, dùng Codex/Antigravity/Cursor code và debug, hoặc ngược lại"* |
| **`zh-CN` / `zh-TW`** | *"让Claude、Codex和Antigravity同时研究/规划/审查并汇总结论"*, *"用Claude写文档规划、用Codex/Cursor编码调试"* / *"讓多個平台同時研究規劃並匯總結論"* |
| **`ja` (日本語)** | *"Claude・Codex・Antigravityで同時に調査/設計/レビューして統合して"*, *"Claudeで設計しCodex/Cursorで実装・デバッグして"* |
| **`ko` (한국어)** | *"Claude, Codex, Antigravity가 동시에 연구/계획/리뷰하고 종합해줘"*, *"Claude로 기획하고 Codex/Cursor로 코딩 및 디버깅해줘"* |
| **`es` / `pt-BR`** | *"que Claude, Codex y Antigravity investiguen/planifiquen en paralelo y sintetizar"* / *"usar Claude para planejar e Codex/Cursor para codificar e depurar"* |
| **`fr` / `de` / `it`** | *"faire chercher/planifier Claude, Codex et Antigravity en parallèle et synthétiser"* / *"Claude für Planung und Codex/Cursor für Code & Debugging nutzen"* / *"usare più motori AI in parallelo e sintetizzare"* |
| **`ru` / `tr`** | *"запустить Claude, Codex и Antigravity параллельно и объединить выводы"* / *"Claude ile planla, Codex/Cursor ile kodla ve hata ayıkla"* |
| **`hi` / `ar`** | *"Claude, Codex और Antigravity से समानांतर शोध/योजना कराएं और निष्कर्ष निकालें"* / *"دع Claude وCodex وAntigravity يبحثون أو يخططون بالتوازي ثم اجمع النتائج"* |
| **`id` / `th`** | *"jalankan Claude, Codex, dan Antigravity secara paralel lalu sintesiskan"* / *"ให้ Claude, Codex และ Antigravity วิจัย/วางแผนพร้อมกันแล้วสรุปรวม"* |

---

## 🧭 ROUTING LOGIC

```
1. IF user explicitly specifies a subcommand:
   - `/conduct:council`  → Load and execute `commands/conduct-council.md`
   - `/conduct:pipeline` → Load and execute `commands/conduct-pipeline.md`
   - `/conduct probe`    → Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct probe` and display installed CLI engines
   - `/conduct status`   → Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct status` and display recent cross-engine runs & queued handoffs

2. IF user wants MULTIPLE ENGINES TO PERFORM THE SAME TASK IN PARALLEL AND SYNTHESIZE ("cùng nghiên cứu / cùng lên kế hoạch / cùng review / cùng debug rồi tổng hợp", "3 nghiên cứu 3 góc nhìn", "multi-engine council", "compare perspectives across Claude, Codex, and Antigravity"):
   → Route IMMEDIATELY to `/conduct:council` (`commands/conduct-council.md`)

3. IF user wants DIFFERENT ENGINES ASSIGNED TO DIFFERENT SPECIALIST ROLES IN A PIPELINE ("dùng Claude viết tài liệu/plan, dùng Codex/Antigravity/Cursor code và debug", "role division across engines"):
   → Route IMMEDIATELY to `/conduct:pipeline` (`commands/conduct-pipeline.md`)

4. IF unsure:
   → Research / brainstorm / plan / design / review / root-cause diagnosis → Default to `/conduct:council` (`commands/conduct-council.md`)
   → End-to-end multi-phase feature implementation across roles → Default to `/conduct:pipeline` (`commands/conduct-pipeline.md`)
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Architecture & Best Use Case |
|-------|---------------|------------------------------|
| **`/conduct:council`** | `commands/conduct-council.md` | **Multi-Engine Parallel Council (`N` Engines × `1` Task → 4-Part Consensus Synthesis)**: Runs `claude`, `codex`, `antigravity` (+ `cursor`/`copilot` or 0-turn `invoke_subagent` fallback) concurrently in read-only mode on Research, Brainstorm, Plan, Design, Debug, or Review, then synthesizes `<appDataDir>\brain\<conversation-id>\COUNCIL-{topic}.md`. |
| **`/conduct:pipeline`** | `commands/conduct-pipeline.md` | **Automated Cross-Engine Role-Division Pipeline (`Engine A Plans → Engine B/C Codes Shards → Cross-Family Engine D Reviews & Debugs`)**: Dispatches each phase via `conduct dispatch` (or 0-turn `invoke_subagent` fallback) with `SHARED_CONTRACT`, SHA-256 `READ_ONLY_FILES` snapshot protection, 3-Tier quota failover, and `Author != Critic` cross-family enforcement. |

---

## 🛡️ CROSS-ENGINE SAFETY GUARANTEES & ARTIFACT TRAILS

- **SHA-256 `READ_ONLY_FILES` Snapshot Guard**: `conduct dispatch` and `conduct council` hash every path in `--read-only` before invoking external CLI subprocesses and restore any unauthorized file mutation byte-for-byte.
- **3-Tier Automatic Quota Failover**: On HTTP `429` / rate-limit / exit `127` errors, `conduct dispatch` automatically fails over across installed model families (`claude` ↔ `codex` ↔ `antigravity`) and logs telemetry in `.boomopen/conductor/runs/`.
- **Queue Handoff & Native 0-Turn Fallback**: If an external binary is absent on `PATH`, prompts are persisted to `.boomopen/conductor/queue/` AND mirrored immediately via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` so execution never stalls.

## 💬 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 🎼 Cross-Engine Conductor Mode Selection

1. 🏛️ **Parallel Council** → `/conduct:council` (`commands/conduct-council.md`) — Run N engines on the same task & synthesize 4-Part Consensus
2. 🎼 **Role-Division Pipeline** → `/conduct:pipeline` (`commands/conduct-pipeline.md`) — Planner Engine → Sharded Coder Engines → Cross-Family Critic
3. 🔍 **Probe / Status** → `/conduct probe` / `/conduct status` — Inspect installed AI CLIs and recent conductor runs
```
