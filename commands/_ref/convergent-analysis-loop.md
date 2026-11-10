---
description: "🔄 Convergent Analysis Loop — Elastic Shard Inspection, Disjoint Scratch Notes & Warm Session Reuse protocol for *:team workflows"
version: "5.5"
type: reference
---

# 🔄 Convergent Analysis Loop (`v5.5` — Elastic `role#shard` Fan-Out & Warm `send_message` Reuse)

> **REFERENCED BY**: `review-team.md`, `debug-team.md`, `test-team.md`, `fix-team.md`, `code-team.md`
> Replaces single-executor sequential passes and cold Round-2/3 respawns with **Cognitive Load Sharding (`≤ 3–4` files or `1` vector per shard)**, **disjoint per-shard scratch files**, and **Warm Session Reuse (`send_message` by `conversationId`, max 3 rounds)**.

---

## 🧮 COGNITIVE LOAD SHARDING & ZERO WRITE-COLLISION RULE

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Audit/Debug Vectors}\right)\right)$$

1. **Never Bottleneck Through 1 Un-Sharded Executor**: Partition target files or hypotheses into `1..6` parallel `{executor#1..N}` shards so every shard inspects **at most `3–4` heavy files or `1` focused vector** (`TypeName: "self"`, `Model: "inherit"`, NEVER `flash_lite`).
2. **Disjoint Scratch Files (No Concurrent `MAILBOX` Overwrites)**: Each parallel `{executor#k}` writes its raw findings to `<appDataDir>\brain\<conversation-id>\{REVIEW|DEBUG|TEST}-{scope}-s{k}.md` with `ArtifactMetadata: { Summary: "Shard k raw analysis", UserFacing: false, RequestFeedback: false }` before sequential `MAILBOX-{date}.md` consolidation.
3. **Active Session Registry (`Spawn Once, Reuse Many`)**: Record `role#shard -> conversationId` on Round 1; execute **100% of Round 2 and Round 3 turns via `send_message(Recipient: conversationId, Message: ...)`**!

---

## 🔄 HOW THE CONVERGENT LOOP WORKS (MAX 3 ROUNDS)

### Round 1: INITIAL ELASTIC DEEP SCAN (`invoke_subagent(TypeName: "self", Model: "inherit")`)

- **Topology A — Turn-1 Parallel Vector/Shard Scan (Default when target files/modules are already known, e.g., `/review:team`)**:
  - Spawn `{tech-lead}` + `{executor#1..N}` (`≤ 3–4` files/shard) **concurrently in ONE Turn-1 batch** (`TypeName: "self"`, `Model: "inherit"`), saving all `conversationId`s!
- **Topology B — Brief-First Scan (Only when `{tech-lead}` must first map unknown cross-module blast radius, e.g., complex `/debug:team` / `/fix:team`)**:
  - `{tech-lead}` writes `[TASK_BRIEF]` + disjoint shard assignments to `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md` (`UserFacing: false, RequestFeedback: false`), then `{executor#1..N}` launch in parallel in one wave.

1. **Lead Decomposition (`{tech-lead}`)**:
   - Frames 4 mandatory audit dimensions: **(1)** Logic & state correctness, **(2)** Security & OWASP/auth safety, **(3)** Performance & N+1/memory bounds, **(4)** Architecture, Pragmatic 2-Tier quality & contract compliance.
2. **Parallel Deep Shard Execution (`{executor#1..N}`)**:
   - Each shard reads every assigned file line-by-line (`read_file` / `grep_search` / `run_command`), traces entry point → domain logic → persistence → response, and writes its disjoint `{TYPE}-{scope}-s{k}.md` (`UserFacing: false, RequestFeedback: false`) with:
     - `File:Line` (`[basename:L10-L20](file:///...)`), `Severity` (`🔴 CRITICAL` / `🟠 HIGH` / `🟡 MEDIUM` / `🟢 LOW`), `Category`, empirical `Evidence` (exact code/log trace + failure scenario), and concrete `Fix`.
3. **Adversarial Challenge (`{reviewer#1..M}` via `invoke_subagent(TypeName: "self", Model: "inherit")` → save `conversationId`)**:
   - Reads all shard reports `{TYPE}-{scope}-s{1..N}.md` AND independently inspects code (`read_file` / `run_command`) to run **2 mandatory checks**:
     1. **False Positive Filter**: Challenge theoretical, nitpicky, or already-guarded claims; demand concrete reproduction/trace proof.
     2. **Blind Spot Hunt**: Actively hunt for missed cross-shard side effects, race conditions, error-boundary gaps, and auth/input flaws.
   - Appends `[CRITIQUE]` (tagged by `executor#k`) or `[APPROVAL]` to `MAILBOX-{date}.md`.

---

### Round 2: TARGETED WARM CONVERGENCE (`send_message` ONLY — Zero Cold Respawns!)

*(Triggered ONLY for shards with disputed findings or newly discovered `🔴 CRITICAL` / `🟠 HIGH` blind spots; clean shards stay idle.)*

1. **Parallel Shard Verification (`send_message(Recipient: executor#k_conversationId)`)**:
   - Flagged `{executor#k}` shards verify Challenger's newly discovered issues via `read_file` / `run_command`, defend valid findings with empirical proof or withdraw disproven ones, update `{TYPE}-{scope}-s{k}.md`, and append `[REVISION]` to `MAILBOX-{date}.md`.
2. **Challenger Re-Verification (`send_message(Recipient: reviewer_conversationId)`)**:
   - `{reviewer#1..M}` verifies updated evidence and appends `[APPROVAL]` (or final `[CRITIQUE]` if still contested) to `MAILBOX-{date}.md`.

---

### Round 3: BINDING TECH LEAD ARBITRATION & COHESIVE SYNTHESIS (`send_message`)

- **Binding Arbitration (`send_message(Recipient: tech_lead_conversationId)`)**:
  - Resolves any remaining disagreement using empirical code/test evidence, deduplicates cross-shard findings, ranks validated issues (`🔴 → 🟠 → 🟡 → 🟢`), and records `✅ CONSENSUS: {TL} ✓ | {Exec#1..N} ✓ | {Rev#1..M} ✓` in `MAILBOX-{date}.md`.
  - Synthesizes **1 cohesive single-file deliverable (`≤ 500` lines)** in `<appDataDir>\brain\<conversation-id>\{REVIEW|DEBUG|TEST}-{scope}.md` (`ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`).
