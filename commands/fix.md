---
description: 🔧 Fix Router — Smart-Hybrid Bug Resolution Router (Approved-Debug Fast-Forward, Fail-First TDD & Persistent Verification)
version: "5.5"
category: debugging
execution-mode: router
---

# /fix — Bug & Issue Resolution Router (`v5.5`)

> **ROUTER DIRECTIVE**: Classify bug scope, check for prior `DEBUG-{issue}.md` / `REVIEW-{scope}.md` artifacts (**Bidirectional Fast-Forward**), and route immediately to `/fix:fast`, `/fix:hard`, or `/fix:team`.

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & APPROVED-DEBUG FAST-FORWARD

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`:
- **⚡ Approved-Debug Continuation Trigger**: Whenever `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (or `REVIEW-{scope}.md` with P0/P1 defects) already exists and the user clicks Antigravity 2.0's **"Proceed"** button (`ArtifactMetadata.RequestFeedback: true`) or replies *"fix it"*, *"sửa đi"*, *"proceed"*, *"tiến hành sửa"*, **route immediately to `/fix` and SKIP redundant root-cause discovery**!
- **Sub-Agent Rule**: Use **Mode A Direct (`0` sub-agents)** for localized `≤ 2` known-file fixes in `/fix:fast`; otherwise spawn shards via `invoke_subagent(TypeName: "self", Model: "inherit")` (NEVER `TypeName: "research"` or `flash_lite`).

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to fix a bug, resolve a failing test/build error, or patch an issue in natural language without typing `/fix`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"fix this bug"*, *"resolve this issue"*, *"repair the failing test/build"*, *"patch this error"* |
| **`vi` (Tiếng Việt)** | *"sửa lỗi này"*, *"fix bug"*, *"khắc phục sự cố"*, *"sửa lỗi build/test bị fail"* |
| **`zh-CN` / `zh-TW`** | *"修复这个bug"*, *"解决这个错误"*, *"修复构建/测试失败"* / *"修復這個bug"*, *"解決這個錯誤"* |
| **`ja` (日本語)** | *"このバグを修正して"*, *"エラーを直して"*, *"テスト失敗を修正"* |
| **`ko` (한국어)** | *"이 버그 수정해줘"*, *"오류 해결해줘"*, *"실패한 테스트 고쳐줘"* |
| **`es` / `pt-BR`** | *"corregir este bug"*, *"arreglar este error"* / *"corrigir este bug"*, *"resolver este problema"* |
| **`fr` / `de` / `it`** | *"corriger ce bug"*, *"résoudre cette erreur"* / *"diesen Bug beheben"*, *"Fehler reparieren"* / *"correggere questo bug"* |
| **`ru` / `tr`** | *"исправить этот баг"*, *"устранить ошибку"* / *"bu hatayı düzelt"*, *"sorunu çöz"* |
| **`hi` / `ar`** | *"इस बग को ठीक करें"*, *"त्रुटि सुधारें"* / *"أصلح هذا الخطأ"*, *"حل هذه المشكلة"* |
| **`id` / `th`** | *"perbaiki bug ini"*, *"atasi error ini"* / *"แก้ไขบั๊กนี้"*, *"แก้ข้อผิดพลาด"* |

**Default Variant Resolution (`workflows.defaultVariant = auto` + Cognitive Load Sharding Law)**:
- **Simple / Localized Fix (`≤ 2` known files, clear cause)** → `/fix:fast` (`commands/fix-fast.md`)
- **Multi-File or Unscoped Bug (`> 2` files, or multi-file `DEBUG-{issue}.md`)** → `/fix:hard` (`commands/fix-hard.md`, Fail-First Reproduction Test + disjoint `≤ 3–4 OWNED_FILES` fix shards)
- **Production-Critical / Multi-Domain Regression (`execution.mode = team`)** → `/fix:team` (`commands/fix-team.md`, 3-Stage Elastic Golden Diamond)

---

## 🧭 ROUTING LOGIC

```
IF issue is simple (clear cause, ≤ 2 known files, single domain):
  → Route to /fix:fast (commands/fix-fast.md)

IF issue spans > 2 files, has unknown cause, OR implements a multi-file DEBUG-{issue}.md (Default for auto on non-trivial bugs):
  → Route to /fix:hard (commands/fix-hard.md)

IF issue is production-critical, security-sensitive, OR execution.mode = team:
  → Route to /fix:team (commands/fix-team.md)

IF unsure:
  → Default to /fix:hard (commands/fix-hard.md) for multi-file bugs, or /fix:fast (commands/fix-fast.md) for localized fixes
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| **`/fix:fast`** | `commands/fix-fast.md` | Quick localized fixes (**Mode A Direct `0` sub-agents** for `≤ 2` known files, or 1 fast domain shard) + mandatory regression check |
| **`/fix:hard`** | `commands/fix-hard.md` | Multi-file bug resolution with Bidirectional `DEBUG` Fast-Forward, Fail-First `RED → GREEN` test, sharded engineers & `--strict-phase --no-stubs` |
| **`/fix:team`** | `commands/fix-team.md` | 3-Stage Elastic Golden Diamond resolution (`debug-team` RCA → `RED → GREEN` sharded fix wave → adversarial QA + optional Cross-Engine Critic) |

---

## 💬 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 🔧 Fix Mode Selection

**Issue**: [parsed issue]

**Choose workflow:**

1. ⚡ **Fast** → `/fix:fast` (`commands/fix-fast.md`) — Quick localized fix + verification
2. ⚡⚡⚡ **Hard** → `/fix:hard` (`commands/fix-hard.md`) — Sharded root-cause fix + regression guard
3. 💎 **Team** → `/fix:team` (`commands/fix-team.md`) — 3-Stage Golden Diamond adversarial fix & QA

⏳ Awaiting selection...
```
