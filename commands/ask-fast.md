---
description: ⚡ Quick Answer — Mode A Direct (≤ 2 Known Files) or Turn-1 Parallel Codebase Scout (Zero Report Clutter)
version: "5.5"
category: knowledge
execution-mode: execute
---

# /ask:fast — Fast Question Answering (Mode A Direct & Turn-1 Zero-Clutter Scout)

> **MISSION**: Deliver fast, evidence-cited answers with **zero `.md` report clutter** — executing **Mode A Direct (`0` sub-agents)** when `≤ 2` target files are already known, or **Turn-1 Parallel Sub-Agent Scouting (`Model: "inherit"`)** when exploring `> 2` files or unknown codebase locations.

<question>$ARGUMENTS</question>

---

## ⚡ TURN-1 ZERO-TAX SMART-HYBRID GATE (`MODE A` vs `TURN-1 SCOUT`)

> **Reference: AGENTS.md (Tiered Execution)**

Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`, and do **NOT** create `.md` report files unless the user explicitly asks to save a document:

| Scope Condition | Execution Path | Action |
|-----------------|----------------|--------|
| **Path A — Mode A Direct (`0` Sub-Agents)** | Exact **`≤ 2` target files** are already known on Turn 1, `1` domain, and zero external web lookup is needed | Read the `1–2` files directly (`read_file`) and answer immediately in chat with clickable `[file:line](file:///...)` citations. |
| **Path B1 — Read-Only Local Codebase Scout (`> 2` Files, `0` Artifacts, `0` Web)** | Target files are unknown OR question spans **`> 2` local files**, with **no `write_file`, no `run_command`, and no `search_web`** | Spawn `1–4` parallel scouts on Turn 1 (`≤ 3–4` files/module per shard) via `invoke_subagent(TypeName: "research" | "self", Role: "Codebase Scouter (scouter#1..k)", Model: "inherit", Prompt: ...)`. Return structured `file:line` findings in-message (`0` `.md` clutter) and synthesize directly! |
| **Path B2 — Live Doc / Command Verification Needed** | Answering requires a quick `search_web` SDK check, running a read-only CLI inspection (`run_command`), or user explicitly requested saving a note | **MUST use `invoke_subagent(TypeName: "self", Role: "Technical Lookup Specialist", Model: "inherit", Prompt: ...)`** (`TypeName: "research"` has NO `search_web`, NO `run_command`, and NO `write_file`!). |

> **🧭 `clarification.style = autonomous_first`**: If minor ambiguity exists, state your working assumption in 1 line and answer both the primary case and key edge case directly rather than stalling with clarification questions.

---

## 🎭 EXECUTION STEPS

### Step 1: Context Resolution (Path A Direct OR Path B Turn-1 Parallel Fan-Out)
- **Path A (`≤ 2` known files)**: Inspect target lines directly via `read_file` (never crawl `> 2` files sequentially in the primary agent!).
- **Path B (`> 2` files or unknown file locations)**: Compute $N_{\text{agents}} = \min(\text{maxParallelSubagents}, \lceil \text{Files} / 3.5 \rceil)$ and dispatch parallel `scouter#1..k` shards in **one single Turn-1 batch** (`Model: "inherit"`), assigning disjoint directories/modules per shard.
- Wait via **Reactive Async Wakeup** (zero polling, zero sequential `scouter → researcher` relay hop).

### Step 2: Direct Evidence-Cited Answer Synthesis
Synthesize the final response directly in chat (in the user's input language; code identifiers in English):
1. **Direct Answer (1–3 sentences upfront)**: Clear, unambiguous answer to `<question>`.
2. **Codebase Evidence & Trace**: Clickable `[basename:L10-L25](file:///absolute/path#L10-L25)` links, call/data flow summary, and concise code snippets where helpful.
3. **Caveats / Edge Cases**: Any version constraints, config flags, or gotchas observed in code.

*(Optional — Only if user explicitly requests a saved artifact)*: Write `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` with `ArtifactMetadata: { Summary: "Quick Q&A summary", UserFacing: true, RequestFeedback: false }`.

---

## 🔀 ESCALATION

| Condition | Route To |
|-----------|----------|
| Requires deep 3-Wave multi-source external research or architectural trade-off matrix | `/ask:hard` (`commands/ask-hard.md`) or `/research:team` (`commands/research-team.md`) |
| Requires multi-engine (`Claude` + `Codex` + `Antigravity`) consensus | `/conduct:council` (`commands/conduct-council.md`) |
| User follows up asking to modify code or build a feature | `/code:fast` (`commands/code-fast.md`) or `/cook:hard` (`commands/cook-hard.md`) |

---

## ✅ COMPLETION

Present the answer concisely with clickable `file:///` links, then offer lightweight follow-ups only when relevant:
1. ✅ **Answered** — Resolved with verified `file:line` citations
2. 🔬 **Deep Dive** → `/ask:hard` or `/research:team` for multi-wave external benchmarks & trade-offs
3. 💻 **Implement** → `/code:fast` or `/plan:hard` if code changes are needed next
