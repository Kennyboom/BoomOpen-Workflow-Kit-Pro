---
description: ❓ Ask Router — Smart-Hybrid Question Answering Router (Mode A Direct, Elastic Parallel Scout & Evidence-Gated Research)
version: "5.5"
category: knowledge
execution-mode: router
---

# /ask — Question Answering Router (v5.5)

> **ROUTER DIRECTIVE**: Classify question scope and answer immediately in **Mode A Direct (`≤ 2` known files)** or route to `/ask:fast`, `/ask:hard`, `/research:team`, or `/conduct:council` without unnecessary confirmation menus (`clarification.style = autonomous_first`).

<question>$ARGUMENTS</question>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & AUTONOMOUS-FIRST RULE

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`:
- **`≤ 2` Already-Known Files (Single Domain, Zero External Web Lookup)**: Answer directly via `/ask:fast` **Mode A Direct (`0` sub-agents)** with clickable `[file:line](file:///...)` citations.
- **Unscoped Codebase Lookup (`> 2` Files) or Multi-Source Question**: Route immediately on Turn 1 and spawn parallel shards (`Model: "inherit"`).
- **`clarification.style = autonomous_first`**: Never stall Turn 1 asking open-ended questions when intent is clear; state explicit assumptions and answer directly.

---

## 🧭 ROUTING LOGIC (All 17 Supported Languages + `workflows.defaultVariant`)

```
1. IF user explicitly specifies a variant (`/ask:fast` or `/ask:hard`):
   → Load `commands/ask-fast.md` or `commands/ask-hard.md` immediately.

2. IF question is factual or a localized codebase lookup (`≤ 2` known files → Mode A Direct; or quick read-only codebase locator across `> 2` files with zero external research):
   → Route to `/ask:fast` (`commands/ask-fast.md`)

3. IF question requires multi-source verification, official SDK/API documentation (`search_web`), or architectural trade-offs across `> 2` files / subsystems:
   → Route to `/ask:hard` (`commands/ask-hard.md`; or `commands/research-team.md` for exhaustive 5-Lens Golden Diamond deep research)

4. IF user asks for multi-platform / multi-engine consensus (`Claude` + `Codex` + `Antigravity` answering in parallel):
   → Route to `/conduct:council` (`commands/conduct-council.md`)

5. IF `workflows.defaultVariant = "ask"` (explicitly configured by user):
   → Present the selection menu below. Otherwise default autonomously (`autonomous_first`).
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| **`/ask:fast`** | `commands/ask-fast.md` | Quick factual answers, **Mode A Direct (`0` sub-agents)** on `≤ 2` known files, or Turn-1 parallel read-only codebase scout (`> 2` files, `0` `.md` report clutter) |
| **`/ask:hard`** | `commands/ask-hard.md` | Evidence-gated multi-source answers with elastic Turn-1 `scouter#1..k` + `researcher#1..k` (`TypeName: "self"`, `Model: "inherit"`) |
| **`/research:team`** | `commands/research-team.md` | Exhaustive 5-Lens Elastic Golden Diamond deep research (`3–6` vectors + adversarial cross-examination) |
| **`/conduct:council`** | `commands/conduct-council.md` | Multi-Engine Parallel Council consensus across `Claude` + `Codex` + `Antigravity` (`boomopen conduct council`) |

---

## 💬 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## ❓ Question Mode Selection

**Question**: [parsed question]

**Choose workflow:**

1. ⚡ **Fast** → `/ask:fast` (`commands/ask-fast.md`) — Direct / single-wave codebase answer
2. ⚡⚡⚡ **Hard** → `/ask:hard` (`commands/ask-hard.md`) — Parallel codebase + 3-Wave research-backed answer
3. 🎼 **Council** → `/conduct:council` (`commands/conduct-council.md`) — Multi-engine parallel consensus

⏳ Awaiting selection...
```
