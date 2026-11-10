---
description: "🍳 Cook Router — Adaptive end-to-end feature router with Turn-1 Fast-Forward State Machine & 3-Wave Contract-First Execution"
version: "5.5"
category: engineering
execution-mode: router
---

# /cook — End-to-End Feature Implementation Router

> **ROUTER DIRECTIVE**: Inspect existing Brain/Workspace artifacts via the **Turn-1 Fast-Forward State Machine (`boomopen cook state`)**, evaluate feature complexity, and route to `/cook:fast`, `/cook:hard`, or `/cook:team` with **zero redundant discovery, design, or planning**.

<feature>$ARGUMENTS</feature>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & 5-STAGE FAST-FORWARD STATE MACHINE

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) before spawning any phase:
   - **1. `PLAN-{feature}.md` exists** → **Fast-Forward directly to Wave Execution**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" [--design "<design-path>"]` and dispatch Wave 1 shards immediately (**0 scouting, 0 design, 0 re-planning, 0 `tech-lead` re-sharding**).
   - **2. `DESIGN-{feature}.md` exists (no `PLAN` yet)** → **Fast-Forward to Planning**: Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and invoke `planner` directly.
   - **3. `SCOUT-*.md` or `RESEARCH-*.md` exists** → **Fast-Forward past Discovery**: Reuse prior discovery artifacts without re-spawning `scouter` or `researcher`.
3. **🌊 3-Wave Contract-First Execution & Deterministic CLI Gates (`boomopen cook`)**:
   - **Wave 1 (Foundation, Schema & Shared Primitives Lock)**: `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives` → gate with `boomopen cook verify-wave "<plan-path>" --wave 1 --git --run-verify`.
   - **Wave 2 (Parallel Feature Shards `<= 3–4` files/shard)**: `backend-engineer#api-1..k` + `frontend-engineer#screen-1..k` (+ `mobile-engineer#1..k`) concurrently in 1 turn (`READ_ONLY_FILES` auto-computed via `boomopen cook packets "<plan-path>" --wave 2`) → gate with `boomopen cook verify-wave "<plan-path>" --wave 2 --git --run-verify`.
   - **Wave 3 (Parallel Cross-Stack Verification & Adversarial Review)**: Parallel `tester` + `reviewer` (+ `security-engineer` or Cross-Engine `boomopen conduct dispatch --role reviewer --engine cross_family --prompt "<diff-and-contract>"`), portable `python` UI audits (`ux_audit.py` + `accessibility_checker.py`), and `boomopen check <dir> --strict-phase --no-stubs`.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to build a complete feature end-to-end in natural language without typing `/cook`, trigger this router automatically:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"build a complete feature"*, *"create a new module/system end-to-end"*, *"develop full feature X"* |
| **`vi` (Tiếng Việt)** | *"xây dựng tính năng hoàn chỉnh"*, *"phát triển trọn gói tính năng X từ A-Z"*, *"làm tính năng mới"* |
| **`zh-CN` / `zh-TW`** | *"完整开发新功能"*, *"端到端构建模块"* / *"完整開發新功能"*, *"端到端構建模組"* |
| **`ja` (日本語)** | *"新機能をエンドツーエンドで開発して"*, *"機能Xを一から構築して"* |
| **`ko` (한국어)** | *"새로운 기능을 처음부터 끝까지 개발해줘"*, *"전체 기능 구축해줘"* |
| **`es` / `pt-BR`** | *"desarrollar la funcionalidad completa"*, *"crear módulo de extremo a extremo"* / *"desenvolver funcionalidade completa"* |
| **`fr` / `de` / `it`** | *"développer la fonctionnalité complète"* / *"komplettes Feature entwickeln"* / *"sviluppare la funzionalità completa"* |
| **`ru` / `tr`** | *"разработать фичу с нуля под ключ"* / *"özelliği uçtan uca geliştir"* |
| **`hi` / `ar`** | *"नया फ़ीचर शुरू से अंत तक बनाएं"* / *"تطوير الميزة بالكامل من البداية للنهاية"* |
| **`id` / `th`** | *"bangun fitur lengkap dari awal"* / *"พัฒนาฟีเจอร์ใหม่แบบครบวงจร"* |

---

## 🔀 ROUTING LOGIC & AVAILABLE ROUTES

```
IF feature is small & self-contained (clear spec, ≤ 2 files, 1 domain):
  → Route to /cook:fast (commands/cook-fast.md)

IF feature is multi-file or fullstack (> 2 files, DB/API/UI — Default for auto):
  → Route to /cook:hard (commands/cook-hard.md)

IF feature is mission-critical OR execution.mode = team:
  → Route to /cook:team (commands/cook-team.md)
```

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| `/cook:fast` | `commands/cook-fast.md` | Quick self-contained features (`≤ 2` files Mode A or 1-Wave dispatch) with Fast-Forward |
| `/cook:hard` | `commands/cook-hard.md` | Fullstack features (`> 2` files): Fast-Forward → Design → Plan → 3-Wave Contract-First Execution |
| `/cook:team` | `commands/cook-team.md` | Maximum assurance with Elastic Golden Diamond adversarial collaboration & 3-Wave gates |

---

## 📋 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 🍳 Feature Mode Selection

**Feature**: [parsed feature]

1. ⚡ **Fast** → `/cook:fast` — Rapid feature implementation (`commands/cook-fast.md`)
2. ⚡⚡⚡ **Hard** → `/cook:hard` — Complete 3-Wave feature lifecycle (`commands/cook-hard.md`)
3. 🔺 **Team** → `/cook:team` — Elastic Golden Diamond collaboration (`commands/cook-team.md`)

⏳ Awaiting selection...
```
