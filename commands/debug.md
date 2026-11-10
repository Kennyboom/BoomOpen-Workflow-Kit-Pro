---
description: 🐛 Debug Router — Smart-Hybrid Root-Cause Investigation Router (SPIE v3.0 5-Whys, Elastic Hypothesis Sharding & 1-Click Proceed to /fix)
version: "5.5"
category: debugging
execution-mode: router
---

# /debug — Root-Cause Investigation Router (`v5.5`)

> **ROUTER DIRECTIVE**: Classify bug complexity and route immediately to `/debug:fast`, `/debug:hard`, or `/debug:team` (investigation only — zero production code mutation until root cause is proven). Standalone `DEBUG-{issue}.md` sets `ArtifactMetadata.RequestFeedback: true` so clicking Antigravity 2.0's **"Proceed"** button seamlessly launches `/fix`!

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & SUB-AGENT RULE

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`:
- **Localized Stack Trace (`≤ 2` already-known files, `1` domain)**: Route to `/debug:fast` **Mode A Direct (`0` sub-agents)** or single `debugger` shard.
- **Multi-File / Intermittent / Cross-Module Bug (`> 2` files)**: Spawn parallel `debugger#h1..k` shards **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` (NEVER `TypeName: "research"` or `flash_lite`).

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to investigate a bug, trace an error/stack trace, or find the root cause (without modifying code yet) in natural language without typing `/debug`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"debug this"*, *"investigate this error"*, *"find the root cause"*, *"why is this failing/crashing?"*, *"trace this bug"* |
| **`vi` (Tiếng Việt)** | *"debug lỗi này"*, *"tìm nguyên nhân lỗi"*, *"tại sao bị lỗi/crash?"*, *"điều tra lỗi"*, *"phân tích log lỗi"* |
| **`zh-CN` / `zh-TW`** | *"调试这个错误"*, *"排查原因"*, *"为什么报错/崩溃"* / *"除錯"*, *"調查錯誤原因"*, *"為什麼報錯"* |
| **`ja` (日本語)** | *"デバッグして"*, *"エラーの原因を調査して"*, *"なぜ失敗するのか調べて"* |
| **`ko` (한국어)** | *"디버깅해줘"*, *"에러 원인 찾아줘"*, *"왜 크래시가 나는지 조사해줘"* |
| **`es` / `pt-BR`** | *"depurar este error"*, *"investigar la causa raíz"* / *"depurar este erro"*, *"investigar a causa raiz"* |
| **`fr` / `de` / `it`** | *"déboguer cette erreur"*, *"trouver la cause"* / *"Fehler debuggen"*, *"Ursache finden"* / *"fare il debug"*, *"trovare la causa"* |
| **`ru` / `tr`** | *"отладить ошибку"*, *"найти причину сбоя"* / *"hatayı ayıkla"*, *"kök nedeni bul"* |
| **`hi` / `ar`** | *"इस त्रुटि को डीबग करें"*, *"मूल कारण खोजें"* / *"تصحيح هذا الخطأ"*, *"ابحث عن السبب الجذري"* |
| **`id` / `th`** | *"debug error ini"*, *"cari penyebab utamanya"* / *"ดีบักข้อผิดพลาดนี้"*, *"หาสาเหตุของบั๊ก"* |

**Default Variant Resolution (`workflows.defaultVariant = auto` + Cognitive Load Sharding Law)**:
- **Clear Localized Stack Trace (`≤ 2` files)** → `/debug:fast` (`commands/debug-fast.md`)
- **Cross-Module / Intermittent Bug (`> 2` files)** → `/debug:hard` (`commands/debug-hard.md`, elastic `debugger#h1..k` shards)
- **Heisenbug / Race Condition / Distributed Failure (`execution.mode = team`)** → `/debug:team` (`commands/debug-team.md`, 3-Stage SPIE Elastic Golden Diamond)
- **Multi-Engine Blind-Spot Escalation (`engines.debugger = "council"` or explicit request)** → `boomopen conduct council --task debug --prompt "<debug-context>"` / `boomopen conduct dispatch --role debugger --engine cross_family --prompt "<failure-context>"`

---

## 🧭 ROUTING LOGIC

```
IF issue is simple (clear stack trace, ≤ 2 known files, reproducible):
  → Route to /debug:fast (commands/debug-fast.md)

IF issue is complex (intermittent, multi-module > 2 files, unclear cause — Default for auto on complex errors):
  → Route to /debug:hard (commands/debug-hard.md)

IF issue is mission-critical, a race condition/Heisenbug, OR execution.mode = team:
  → Route to /debug:team (commands/debug-team.md)

IF unsure:
  → Default to /debug:hard (commands/debug-hard.md) for multi-file traces, or /debug:fast (commands/debug-fast.md) for localized errors
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| **`/debug:fast`** | `commands/debug-fast.md` | Quick SPIE 5-Whys diagnosis (**Mode A Direct `0` sub-agents** for `≤ 2` known files, or 1 fast `debugger` wave) |
| **`/debug:hard`** | `commands/debug-hard.md` | Deep SPIE v3.0 investigation with Turn-1 parallel `debugger#h1..k` hypothesis shards + cohesive `DEBUG-{issue}.md` |
| **`/debug:team`** | `commands/debug-team.md` | 3-Stage SPIE Elastic Golden Diamond (`debug-team` parallel hypothesis shards + adversarial causal proof `DBG-G1..G4`) |

---

## 💬 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 🐛 Debug Mode Selection

**Issue**: [parsed issue]

**Choose workflow:**

1. ⚡ **Fast** → `/debug:fast` (`commands/debug-fast.md`) — Quick root-cause trace
2. ⚡⚡⚡ **Hard** → `/debug:hard` (`commands/debug-hard.md`) — Elastic multi-hypothesis SPIE investigation
3. 💎 **Team** → `/debug:team` (`commands/debug-team.md`) — 3-Stage Golden Diamond adversarial root-cause validation

⏳ Awaiting selection...
```
