---
description: ⚡⚡⚡ Research Answer — Elastic Turn-1 Parallel Sharding (scouter#1..k + researcher#1..k) with 3-Wave Evidence-Gated Synthesis
version: "5.5"
category: knowledge
execution-mode: execute
---

> **📂 Deliverable & `ArtifactMetadata` Routing (v5.5)**: Keep per-shard scratch notes (`RESEARCH-{topic}-v{k}.md`, `SCOUT-{topic}-s{k}.md`, `COUNCIL-{topic}.md`) hidden from UI clutter with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`. When saving a master summary `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (`≤ 500` lines, single cohesive file — NEVER folder-split), set `UserFacing: true` (`RequestFeedback: false` for pure Q&A, or `RequestFeedback: true` when proposing an actionable architecture ready to `"Proceed"` into `/plan` or `/cook`).

---

# /ask:hard — Elastic Parallel Research-Backed Answering

> **MISSION**: Answer complex architectural, cross-module, and SDK/documentation questions by launching **`researcher#1..k` + `scouter#1..k` in parallel on Turn 1 (`TypeName: "self"`, `Model: "inherit"`)** using **Cognitive Load Sharding (`≤ 3–4` files or `1` vector per shard)**, **4-Source Triangulation**, and the **3-Wave Multi-Hop Search Loop**.

<question>$ARGUMENTS</question>

---

## ⚡ TURN-1 ZERO-TAX ELASTIC SHARDING & SUB-AGENT RULE

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

1. **Zero Pre-Flight Tax & `autonomous_first`**: Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`, and do **NOT** stall on clarification menus when scope is sufficient — state explicit assumptions and launch Turn-1 parallel shards immediately!
2. **Elastic `role#shard` Fan-Out**:
   - **Moderate Scope (`≤ 4` files, `1–2` vectors)**: Spawn `researcher#v1` + `scouter#s1` (`2` parallel sub-agents) in a single Turn-1 batch.
   - **Broad / Cross-Subsystem Scope (`> 4` files or `≥ 3` vectors/libraries)**: Horizontally shard into **`researcher#v1..k` + `scouter#s1..k` (`4–8` parallel sub-agents)** on Turn 1 (`≤ 3–4` heavy files or `1` deep research vector per shard) and record `role#shard -> conversationId` for Warm Session Reuse (`send_message`).
3. **⚠️ `TypeName: "self"` Mandatory**: Antigravity's built-in `TypeName: "research"` disables `search_web`, `run_command`, and `write_file`. **ALWAYS use `invoke_subagent(TypeName: "self", Role: "<role>#<shard>", Model: "inherit", Prompt: ...)`** (NEVER `flash_lite`).
4. **🎼 Optional Multi-Engine Council (`engines.researcher = "council"`)**: When configured or requested, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task research --engines <engines.councilMembers> --prompt "<question>" --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md"` on Turn 1.

---

## 🚀 Phase 1 (Turn-1 Parallel Fan-Out): `researcher#v1..k` + `scouter#s1..k`

> **🔒 ZERO WRITE-COLLISION RULE**: Every parallel shard MUST write to its own disjoint scratch path (`RESEARCH-{topic}-v{k}.md` / `SCOUT-{topic}-s{k}.md` with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`) — NEVER have multiple concurrent shards overwrite the same file!

### 🔬 Track 1A: External & Official Documentation Deep Research (`researcher#v1..k`)
- **Invocation**: `invoke_subagent(TypeName: "self", Role: "Deep Technical Researcher (researcher#v1..k)", Model: "inherit", Prompt: ...)`
- **4-Source Triangulation + 3-Wave Search Protocol (`6–10+` queries across vectors)**:
  1. **Wave 1 (Official Docs & Version Pinning)**: Verify vendor docs, RFCs, and changelogs (`search_web` + `read_url_content`).
  2. **Gap Reflection**: Identify unverified internals, rate limits, concurrency traps, or migration caveats.
  3. **Wave 2 (Deep Internals, APIs & Benchmarks)**: Confirm exact typed signatures, wire schemas, and empirical benchmarks.
  4. **Wave 3 (Adversarial Failure Modes & Issues)**: Inspect GitHub Issues, CVEs, breaking changes, and production gotchas.
- **Disjoint Shard Deliverable**: `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}-v{k}.md` (`UserFacing: false, RequestFeedback: false`).

### 🧭 Track 1B: Local Codebase, Manifests & `1,462` Skills Vault (`scouter#s1..k`)
- **Invocation**: `invoke_subagent(TypeName: "self", Role: "Codebase & Skills Scouter (scouter#s1..k)", Model: "inherit", Prompt: ...)`
- **Responsibilities (`≤ 3–4` heavy files per shard)**:
  1. Inspect workspace manifests (`package.json`, `pyproject.toml`, `Cargo.toml`), `./documents/`, and assigned modules (`[file:line](file:///...)` links).
  2. Query `~/.{TOOL}/skills/boomopen-workflow-kit/matrix-skills/compact-index.json` (`1,462` skills) and extract curated patterns from matching `SKILL.md` files.
- **Disjoint Shard Deliverable**: `<appDataDir>\brain\<conversation-id>\SCOUT-{topic}-s{k}.md` (or `SCOUT-{topic}.md` when `k = 1`; `UserFacing: false, RequestFeedback: false`).

---

## 🎭 Phase 2: CROSS-VERIFICATION & EVIDENCE-GATED SYNTHESIS

Once all Phase 1 shards complete via **Reactive Async Wakeup**:
1. Cross-check external SDK/protocol findings against local workspace versions and call sites (resolve any discrepancy via warm `send_message(Recipient: conversationId)`).
2. Present a structured, high-signal synthesis in chat with clickable `file:///` + `https://` citations, version-pinned code examples, Mermaid architecture/flow diagrams, and explicit trade-offs.
3. **Cohesive Summary Artifact (When Multi-Section Reference / Architectural Decision Is Produced)**:
   - Write **1 cohesive single file** (`≤ 500` lines — NEVER split into `{name}/` folders) at `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (fallback `./reports/{topic}/researchers/RESEARCH-{topic}.md`):
     - Pure informational / diagnostic Q&A → `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`.
     - Actionable architectural recommendation ready for implementation → `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` and validate via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<path>"`.

---

## ✅ COMPLETION

Present the synthesized answer and offer next steps:
1. ✅ **Answered** — Verified across local codebase (`SCOUT`) + primary external sources (`RESEARCH`)
2. 🔺 **Adversarial Deep-Dive** → `/research:team` (`commands/research-team.md`) for `3–6` vector Golden Diamond cross-examination
3. 📋 **Plan** → `/plan:hard` (`commands/plan-hard.md`) to turn the recommendation into a contract-locked `PLAN`
4. 💻 **Implement** → `/cook:hard` or `/code:hard` if implementation is requested next
