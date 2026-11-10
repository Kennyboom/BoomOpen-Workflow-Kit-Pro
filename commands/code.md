---
description: "💻 Code Router — Approved-Plan & Feature Execution Router with Turn-1 Fast-Forward, Contract Extraction & 3-Wave Verification"
version: "5.5"
category: engineering
execution-mode: router
---

# /code — Feature & Approved-Plan Execution Router

> **ROUTER DIRECTIVE**: Inspect existing Brain/Workspace artifacts via `boomopen cook state`, detect Antigravity 2.0 1-click **"Proceed"** / Approved-Plan Continuation triggers, and route to `/code:fast`, `/code:hard`, or `/code:team` with **zero redundant planning or re-sharding**.

<task_or_feature>$ARGUMENTS</task_or_feature>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & FAST-FORWARD STATE MACHINE

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Wave 1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{task}.md` exists (1-Click "Proceed" / Approved-Plan Continuation)** → **Fast-Forward directly to Wave Execution**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" [--design "<design-path>"]`, dispatch Wave 1 shards immediately (**0 scouting, 0 design, 0 re-planning, 0 `tech-lead` re-sharding**), and gate each wave via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave <W> --run-verify`.
   - **2. `DESIGN-{task}.md` exists (no `PLAN` yet)** → **Fast-Forward to Planning**: Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and invoke `planner` directly.
   - **3. `SCOUT-*.md` or `RESEARCH-*.md` exists** → **Fast-Forward past Discovery/Scouting**.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

### 1. Approved-Plan Continuation Trigger (When `PLAN-*.md` Already Exists in `<appDataDir>\brain\<conversation-id>\` or `./reports/`):
Whenever `PLAN-*.md` exists and the user clicks Antigravity 2.0's native **"Proceed"** button (`ArtifactMetadata.RequestFeedback: true`) or replies with an approval phrase, **route immediately to `/code:hard` or `/code:team` (or `/code:fast` if `≤ 2` files)**:
- **Trigger Phrases**: *"ok, em làm đi"*, *"tiến hành đi"*, *"triển khai theo plan đi"*, *"proceed"*, *"go ahead"*, *"implement the plan"*, *"build it now"*, *"开始执行"*, *"按计划实施"*, *"按照計劃執行"*, *"実行して"*, *"計画通り進めて"*, *"진행해"*, *"계획대로 구현해줘"*, *"procede"*, *"lance l'implémentation"*, *"setze den Plan um"*, *"pode implementar"*, *"приступай к реализации"*, *"योजना लागू करें"*, *"ابدأ التنفيذ"*, *"lanjutkan implementasi"*, *"ดำเนินการตามแผนเลย"*, *"planı uygula"*, *"procedi con l'implementazione"*.

### 2. General Coding & Implementation Triggers (17 Supported Languages):

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"code this"*, *"implement X"*, *"refactor module Y"*, *"write the code for..."*, *"implement the plan"* |
| **`vi` (Tiếng Việt)** | *"code phần này"*, *"triển khai code"*, *"refactor lại module"*, *"ok, em làm đi"*, *"tiến hành đi"* |
| **`zh-CN` / `zh-TW`** | *"编写代码"*, *"实现这个模块"*, *"重构代码"*, *"开始执行"* / *"編寫程式碼"*, *"實作這個模組"*, *"重構程式碼"* |
| **`ja` (日本語)** | *"コードを実装して"*, *"リファクタリングして"*, *"実行して"* |
| **`ko` (한국어)** | *"코드 구현해줘"*, *"리팩토링해줘"*, *"진행해"* |
| **`es` / `pt-BR`** | *"implementar el código"*, *"refactorizar"* / *"implementar o código"*, *"refatorar"* |
| **`fr` / `de` / `it`** | *"implémenter le code"*, *"refactoriser"* / *"Code implementieren"*, *"refaktorisieren"* / *"implementare il codice"* |
| **`ru` / `tr`** | *"реализовать код"*, *"отрефакторить"* / *"kodu uygula"*, *"yeniden düzenle (refactor)"* |
| **`hi` / `ar`** | *"कोड लागू करें"*, *"रीफैक्टर करें"* / *"تنفيذ الكود"*, *"إعادة هيكلة الكود"* |
| **`id` / `th`** | *"implementasikan kode ini"*, *"refaktor"* / *"เขียนโค้ดส่วนนี้"*, *"รีแฟกเตอร์โค้ด"* |

---

## 🔀 ROUTING LOGIC & AVAILABLE ROUTES

```
IF user approves an existing PLAN-*.md ("Proceed" button, @plan, "ok, em làm đi", "proceed", "implement the plan"):
  → ≤ 2 files: /code:fast (commands/code-fast.md)
  → > 2 files: /code:hard (commands/code-hard.md) — or /code:team (commands/code-team.md) when execution.mode = team

IF task is simple & localized (clear requirements, ≤ 2 files, 1 domain):
  → Route to /code:fast (commands/code-fast.md)

IF task spans > 2 files or ≥ 2 domains:
  → Route to /code:hard (commands/code-hard.md) — or /code:team (commands/code-team.md) when maximum adversarial QA is needed
```

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| `/code:fast` | `commands/code-fast.md` | Quick localized implementation (`≤ 2` files Mode A or 1-Wave `cook packets` dispatch) |
| `/code:hard` | `commands/code-hard.md` | Multi-file changes & approved plans: 3-Wave Contract-First Execution + Parallel QA |
| `/code:team` | `commands/code-team.md` | High-assurance coding with Elastic Golden Diamond parallel shards & adversarial review |

---

## 📋 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 💻 Implementation Mode Selection

**Request**: [parsed task/feature]

1. ⚡ **Fast** → `/code:fast` — Quick implementation (`commands/code-fast.md`)
2. ⚡⚡⚡ **Hard** → `/code:hard` — 3-Wave Contract-First implementation (`commands/code-hard.md`)
3. 🔺 **Team** → `/code:team` — Elastic Golden Diamond collaboration (`commands/code-team.md`)

⏳ Awaiting selection...
```
