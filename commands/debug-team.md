---
description: "🔺 Team Debug — 3-Stage SPIE v3.0 Elastic Golden Diamond (Parallel Hypothesis Shards, Adversarial Causal Validation & 1-Click Proceed to /fix)"
version: "5.5"
category: debugging
execution-mode: execute
---

# /debug:team — 3-Stage SPIE v3.0 Elastic Golden Diamond Investigation (`v5.5`)

> **MISSION**: Achieve forensic, zero-guesswork root-cause certainty on Heisenbugs, race conditions, and cross-subsystem failures via `agents/teams/debug-team/` (`1 Triage Lead + 1..6 Parallel Hypothesis Shards + Adversarial Root-Cause Validator`) — investigation only, releasing **1 cohesive `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`≤ 500` lines)** with `ArtifactMetadata.RequestFeedback: true` ONLY after consensus on `DBG-G1..G4`!

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX TOPOLOGY A FAN-OUT & REFERENCES

1. **Zero Pre-Flight Tax (`Topology A`)**: Core orchestration laws and the 5-Field Handoff Packet are pre-loaded in your global entrypoint. Do **NOT** burn Turn 1 reading `CORE.md`, `PHASES.md`, or `_ref/*.md` alone before spawning sub-agents! Launch **Stage 1 (`debug-team-techlead` + `debugger#h1..k`)** on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` and load `commands/_ref/golden-triangle-protocol.md` + `commands/_ref/convergent-analysis-loop.md` in parallel if needed.
2. **Prior-Artifact Fast-Forward**: If `SCOUT-{issue}.md` or stack/repro logs already exist in `<appDataDir>\brain\<conversation-id>\`, reuse them immediately without re-scouting.
3. **⚠️ `TypeName: "self"` & Disjoint Scratch Lock**: Always use `TypeName: "self"`, `Model: "inherit"` (NEVER `TypeName: "research"` or `flash_lite`). Record `role#shard -> conversationId` and reuse warm sessions via `send_message` (max `3` rounds; Round 3 escalates strictly to `debug-team-techlead`).

---

## 📁 DELIVERABLE & `ArtifactMetadata` ROUTING (SINGLE-FILE COHESION)

> **🚫 NO FOLDER SPLITTING OR ARTIFACT FRAGMENTATION**: Never split reports into `{name}/` folders or separate `SYMPTOMS`/`HYPOTHESES`/`EVIDENCE` user-facing files!

| Artifact | Path (`<appDataDir>\brain\<conversation-id>\`) | `ArtifactMetadata` | Purpose & Limit |
|----------|------------------------------------------------|--------------------|-----------------|
| **Hypothesis Scratch Notes** | `DEBUG-{issue}-h{1..k}.md` (and optional `SCOUT-{issue}.md`) | `{ Summary: "Track h{k} trace", UserFacing: false, RequestFeedback: false }` | Disjoint Turn-1 shard traces (`0` write collisions) |
| **Team Debate Mailbox** | `MAILBOX-{date}.md` | `{ Summary: "Debug team debate log", UserFacing: false, RequestFeedback: false }` | Append-only critiques, defenses & `✅ CONSENSUS` |
| **Master Root-Cause Report** | **`DEBUG-{issue}.md`** (fallback `./reports/{topic}/debugs/DEBUG-{issue}.md`) | **`{ Summary: "Consensus SPIE root-cause & fix spec", UserFacing: true, RequestFeedback: true }`** | **1 cohesive file `≤ 500` lines** (1-click **"Proceed"** → `/fix`) |

---

## 💎 3-STAGE SPIE v3.0 ELASTIC GOLDEN DIAMOND (`agents/teams/debug-team/`)

### 🚀 Stage 1 (Turn-1 Parallel Fan-Out): SYMPTOM REPRODUCTION & HYPOTHESIS SHARDING
Compute $N_{\text{agents}} = \min(\text{maxParallelSubagents}, \max(\lceil \text{Suspect Files} / 3.5 \rceil, \text{Subsystems}, \text{Hypotheses}))$ and spawn **in one Turn-1 batch** (`READ_ONLY_FILES`: all production source files):
- **`debug-team-techlead` (`agents/teams/debug-team/techlead.md`)**: Triage reproducibility, blast radius, data impact, and regression window; frame `3–6` ranked hypotheses `H1..Hk` in `MAILBOX-{date}.md`.
- **`debugger#h1..k` (`agents/debugger.md` / `debug-team/executor.md`, `1..6` parallel shards, `≤ 3–4` files/shard)**: Execute deterministic reproduction (`run_command`), git blame/diff correlation, call-graph/state tracing, and external CVE/SDK check (`search_web` if needed) → each shard writes its disjoint **`DEBUG-{issue}-h{k}.md`** (`UserFacing: false, RequestFeedback: false`).
- **🎼 Optional Multi-Engine Council**: When `engines.debugger = "council"`, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task debug --engines <engines.councilMembers> --prompt "<issue>" --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{issue}.md"`.

### 🔬 Stage 2: SPIE 5-WHYS CAUSAL PROOF & FIX BLUEPRINT (`debug-team-executor`)
Reuse warm `debug-team-executor` (`send_message` or spawn once) to synthesize all `DEBUG-{issue}-h{1..k}.md` traces into `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`≤ 500` lines) covering:
1. **Executive Summary & Deterministic Reproduction Command/Steps (`DBG-G1`)**
2. **Hypothesis Falsification Matrix (`H1..Hk` — `DBG-G3`)** with concrete log/code proof eliminating competing causes
3. **SPIE v3.0 5-Whys Causal Chain (`DBG-G2`)** (`Why 1 Symptom` → `Why 5 Systemic Root Cause`, clickable `[file:line](file:///...)` at every link)
4. **Blast-Radius Impact & Surgical Fix Blueprint (`DBG-G4`)** (disjoint `OWNED_FILES` shards `≤ 3–4` files/shard, rollback plan, and Fail-First `RED → GREEN` regression test spec)

### 🛡️ Stage 3: ADVERSARIAL ROOT-CAUSE VALIDATION (`debug-team-reviewer` via Warm `send_message`)
Spawn `debug-team-reviewer` (`agents/teams/debug-team/reviewer.md`, plus optional Cross-Engine Critic `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<symptom + DEBUG-{issue}.md>"`) to stress-test `DEBUG-{issue}.md` across all **4 Mandatory Gates (`DBG-G1..G4`)**:
- **Correlation ≠ Causation Challenge**: Does the proven `file:line` mechanism account for *100%* of observed symptoms? Are any alternative hypotheses still uneliminated?
- **Fix Safety Challenge**: Does the proposed fix solve Why 5 (rather than masking Why 1 with `catch {}` or `?.`) without breaking shared callers/pools?
- Run targeted debate via warm `send_message` (max `3` rounds in `MAILBOX-{date}.md`; Round 3 arbitrated by **`debug-team-techlead`** — never `planner`!). Stamp binding consensus:
  `✅ CONSENSUS: debug-team-techlead ✓ | debug-team-executor (h1..k) ✓ | debug-team-reviewer ✓`

---

## ✅ COMPLETION

Present `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`RequestFeedback: true` — native **"Proceed"** button active) and `MAILBOX-{date}.md`:
1. 🔧 **Proceed / `/fix:team` (or `/fix:hard`)** → Bidirectional Fast-Forward skips Stage 1 and jumps straight to Fail-First Reproduction Test + Sharded Fix!
2. 📝 **`/docs:core`** → Update architecture/runbook docs if systemic design invariants changed
