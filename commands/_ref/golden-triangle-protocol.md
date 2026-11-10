---
description: "🔺 Elastic Golden Diamond & Triangle Core Protocol — Topology A (Turn-1 Parallel Fan-Out) vs Topology B (Contract-Lock First) & Warm Session Reuse"
version: "5.5"
type: reference
---

# 🔺 Golden Triangle & Elastic Golden Diamond Protocol (`v5.5`)

> **THIS FILE IS REFERENCED BY ALL `*-team.md` WORKFLOWS.**
> Every rule below is **MANDATORY** and **BINDING** when running any `:team` command.

---

## 💎 ELASTIC GOLDEN DIAMOND & COGNITIVE LOAD SHARDING LAW

To eliminate sequential single-executor bottlenecks and prevent LLM attention degradation on multi-file or multi-vector tasks, all `:team` workflows dynamically scale from a classic `1-1-1` Golden Triangle into an **Elastic Golden Diamond (`1 Tech Lead + N Parallel Specialist/Shard Executors [1..6] + M Parallel Critics/Testers [1..3]`)**:

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

- **Cognitive Load Sharding Law**: Each sub-agent owns **at most `3–4` heavy files** (`OWNED_FILES`) or **`1` deep research/audit vector**.
- **Focused Scope (`≤ 4` files in `1` domain)**: Classic `1-1-1` Golden Triangle (`1 Tech Lead` + `1 Executor` + `1 Reviewer` = `3` agents).
- **Multi-File / Multi-Domain / Multi-Vector Scope (`> 4` files or `≥ 2` domains/vectors)**: Elastic Golden Diamond (`1` Lead + `2–6` Parallel Shard Executors + `1–3` Parallel Critics/Testers).

---

## 🔀 TIERED EXECUTION & WARM `role#shard` SESSION REGISTRY (MANDATORY)

| Tier | Condition | Action |
|------|-----------|--------|
| **TIER 1** | Antigravity 2.0 Native Sub-Agents (`invoke_subagent`, `send_message`, `manage_subagents`) or `runSubagent` EXISTS | **MUST** spawn each required `role#shard` **once** (`TypeName: "self"`, `Model: "inherit"` — NEVER `TypeName: "research"` or `flash_lite`), store `role#shard → conversationId`, and run Round 2..3 critiques, fixes, and consensus checks via **Warm Session Reuse (`send_message(Recipient: conversationId)`)** with **Reactive Async Wakeup** (never poll). |
| **TIER 2** | Sub-agent tool MISSING or throws system error | Load agent `.md` file → adopt persona in explicit `[ROLE: ...]` blocks (LAST RESORT) |

> **⚡ TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the 5-Field Handoff Packet (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-embedded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). **NEVER burn Turn 1 reading `CORE.md`, `PHASES.md`, `AGENTS.md`, or `_ref/*.md` alone before launching Phase 1 sub-agents!** Read `_ref/*.md` (if needed) AND launch Turn-1 shards in the **same parallel tool batch**.

---

## 🚀 TWO ROUND-1 TOPOLOGIES: ZERO-TURN FAN-OUT vs. CONTRACT-LOCK FIRST

Choose the Round-1 topology that matches the phase so `:team` workflows never waste pre-flight turns:

### ⚡ Topology A — Turn-1 Parallel Vector / Validated-Plan Fan-Out (`0` Wasted Pre-Flight Turns!)
- **Mandatory For**: `/research:team`, `/brainstorm:team`, `/review:team`, Stage 1 discovery in `/plan:team` & `/design:team`, and **Validated-Plan `/code:team` / `/cook:team`** (where `PLAN-{task}.md` already passed `boomopen plan validate` and `boomopen cook packets` emits locked 5-Field Handoff Packets).
- **Round 1 (Single Turn-1 Parallel Batch)**:
  - Launch `{tech-lead}` (Vector 1 / Coordinator) + `{executor#1..N}` (`≤ 3–4` files or `1` vector/shard) + `{reviewer#1..M}` (Adversarial Vector / Critic) **simultaneously on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`!
  - **Disjoint Per-Shard Scratch Files (Zero Overwrite Collisions)**: Concurrent Turn-1 research/review shards write to isolated paths (`{TYPE}-{topic}-v{1..N}.md` or `{TYPE}-{topic}-s{1..N}.md` with `UserFacing: false, RequestFeedback: false`) instead of concurrently writing to `MAILBOX-{date}.md`.

### 🔒 Topology B — Contract-Lock First (`STEP A → Parallel STEP B → Parallel STEP C`)
- **Used ONLY When**: Un-planned multi-file coding or fixing (`/code:team` with no prior `PLAN`, `/fix:team` before contract lock) requires `{tech-lead}` to define `SHARED_CONTRACT` + disjoint `OWNED_FILES` (`≤ 3–4` files/shard) **before** parallel executors write code:
  1. **STEP A (`{tech-lead}`)**: Locks compilable `SHARED_CONTRACT` + disjoint `OWNED_FILES` shards in `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md` (`UserFacing: false, RequestFeedback: false`).
  2. **STEP B (`{executor#1..N}` in 1 parallel wave)**: Implement assigned `OWNED_FILES` shards (Wave 1 contracts/tokens $\rightarrow$ Wave 2 feature shards) and verify via `boomopen check --strict-phase --no-stubs`.
  3. **STEP C (`{reviewer#1..M}` in 1 parallel wave)**: Audit all shards against `SHARED_CONTRACT`, security, performance, and tests → append `[CRITIQUE]` or `[APPROVAL]` to `MAILBOX-{date}.md`.

---

## 🔄 ROUNDS 2..3: WARM SESSION CONVERGENCE & `MAILBOX` PROTOCOL (`send_message`)

Log inter-agent exchanges in `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md` (fallback `./reports/{topic}/MAILBOX-{date}.md`; `ArtifactMetadata: { Summary: "Team debate mailbox", UserFacing: false, RequestFeedback: false }`):

```markdown
### [Round {N}] [{FROM_ROLE} ({role#shard})] → [{TO_ROLE} ({role#shard})] [{TYPE}]
**Phase**: {phase_name} | **Shard / OWNED_FILES**: {file list or vector}
**Content**: {concrete findings, file:line evidence, critiques — NEVER placeholders}
---
```
Message types: `TASK_BRIEF`, `REPORT`, `CRITIQUE`, `REVISION`, `APPROVAL`, `CONSENSUS`, `ESCALATION`.

1. **STEP D — Targeted Warm Fix/Defense (`send_message` to flagged `{executor#shard}` `conversationId`s in parallel)**:
   - Only shards with `🔴 CRITICAL` or `🟠 HIGH` critiques enter Round 2 (clean shards stay idle) → fix `OWNED_FILES` or defend with empirical proof (`file:line`, test output, primary URLs) → post `[REVISION]`.
2. **STEP E — Warm Re-Audit (`send_message` to `{reviewer#1..M}` `conversationId`)**:
   - Re-verifies modified shards → posts `[APPROVAL]` or Round-2 `[CRITIQUE]`.
3. **STEP F — Binding Arbitration (`send_message` to `{tech-lead}` `conversationId`, max `teams.maxDebateRounds = 3`)**:
   - Mediates any Round-3 deadlock with empirical evidence and stamps:
     `✅ CONSENSUS: {TL} ✓ | {Exec#1..N} ✓ | {Rev#1..M} ✓`

---

## 📁 COHESIVE DELIVERABLES & `ArtifactMetadata` RULES (MANDATORY)

1. **Single Cohesive Deliverable (`≤ 500` Lines — NEVER Folder-Split)**: Final deliverables (`RESEARCH-{topic}.md`, `BRAINSTORM-{topic}.md`, `DESIGN-{task}.md`, `PLAN-{task}.md`, `REVIEW-{scope}.md`, `TEST-{scope}.md`) MUST be **1 single file (`≤ 500` lines)** — NEVER split into `{name}/` folders at `150` lines!
2. **Strict `ArtifactMetadata.RequestFeedback` Gate**:
   - **`RequestFeedback: true` (`UserFacing: true`)**: Set **ONLY** on the final standalone actionable deliverable (`PLAN-{task}.md`, `DESIGN-{task}.md`, `BRAINSTORM-{topic}.md`, or standalone `RESEARCH-{topic}.md` proposing a recommended architecture/action) so Antigravity 2.0 renders the native 1-click **"Proceed"** button.
   - **`RequestFeedback: false`**: Mandatory on **ALL** intermediate, vector/shard, mailbox, council, preview, and terminal audit files (`MAILBOX-{date}.md`, `SCOUT-*.md`, `*-v{k}.md`, `*-s{k}.md`, `COUNCIL-*.md` with `UserFacing: false`; terminal `REVIEW`/`TEST`/`REPORT` with `UserFacing: true, RequestFeedback: false`).
3. **Language & Evidence**: Write deliverables in the user's input language (technical terms & code comments in English), backed by verified `file:line`, CLI gate outputs, or primary URLs.
