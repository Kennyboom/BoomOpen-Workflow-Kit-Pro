---
description: "⚡⚡⚡ Deep Research — 2-Stage Elastic Parallel 3-Wave Research, Multi-Engine Council, Contradiction Arbitration & Validated 6-Block Synthesis"
version: "5.5"
category: research
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Final User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits) written with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` (1-click **"Proceed"** button in Antigravity 2.0).
> - **Disjoint Shard Outputs (Zero Race Conditions)**: Parallel Stage 1 shards (`researcher#v1..k`, `scouter#s1..k`, `COUNCIL-{topic}.md`) **NEVER write to the same file path**! Shards either return structured Claim-Evidence payloads via message OR write disjoint internal vector scratch files (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`.

---

# /research:hard — 2-Stage Elastic Parallel 3-Wave Research & Contradiction Arbitration

> **MISSION**: Conduct exhaustive, zero-guesswork technical or market research by fanning out **`researcher#v1..k` + `scouter#s1..k` in parallel on Turn 1** (`2–3` shards for moderate scope → `4–8` disjoint vector/module shards when spanning `> 4` files or `>= 3` vectors, `TypeName: "self"`, `Model: "inherit"`), optionally paired with **Multi-Engine Council (`engines.researcher = "council"`)**, and synthesizing **1 CLI-validated 6-Block `RESEARCH-{topic}.md`**.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 ZERO-TAX ELASTIC PARALLEL SHARDING & SUB-AGENT RULE

⚡ **COGNITIVE LOAD SHARDING LAW**:
$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
Each sub-agent owns **at most `3–4` heavy workspace files or `1` deep research vector**. Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — dispatch all Stage 1 shards in **one parallel Turn-1 tool batch** (`TypeName: "self"`, `Model: "inherit"`) and record `role#shard → conversationId` for Warm Session Reuse (`send_message`).

> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. **ALWAYS invoke every `researcher#v1..k` and `scouter#s1..k` shard with `TypeName: "self"`, `Model: "inherit"`.**

---

## 🎭 Stage 1 (Turn-1 Parallel Fan-Out): DISJOINT VECTOR DEEP-HUNTING + CODEBASE SCOUTING (+ OPTIONAL COUNCIL)

Launch Track 1A, Track 1B, and (when active) Track 1C **concurrently in Turn 1**:

### 🔬 Track 1A: `researcher#v1..k` — 4-Source Triangulation & 3-Wave Multi-Hop Search (`8–12+` Queries)
- **Invocation**: `invoke_subagent(TypeName: "self", Role: "Principal Researcher Vector k (researcher#vk)", Model: "inherit", Prompt: ...)`
- **Disjoint Output Lock**: Return structured findings + query log via message OR write `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}-v{k}.md` (`UserFacing: false, RequestFeedback: false`). **NEVER write directly to `RESEARCH-{topic}.md` when `k > 1`!**
- **3-Wave Search Protocol**:
  1. **Wave 1 (`3–4` queries)**: Official vendor docs, RFCs/`/llms.txt`, latest stable vs. installed versions (`[Tier 3]`).
  2. **Gap Reflection**: Isolate unverified internals, version-drift ambiguities, or missing quantitative benchmarks.
  3. **Wave 2 (`3–4` queries)**: Wire protocols, API/schema contracts, concurrency/memory envelopes, and head-to-head benchmarks (`[Tier 3–4]`).
  4. **Wave 3 (`2–4` queries)**: Adversarial production evidence — GitHub Issues, breaking changes, CVEs, rate limits, and post-mortems (`[Tier 4]`).
- **Dual-Track 5-Lens Coverage**:
  | Lens | **Track A: Product / Market / Game** | **Track B: Technical / SDK / System Architecture** |
  |------|--------------------------------------|----------------------------------------------------|
  | **1** | Behavioral psychology & core motivation hooks | Official specs, version matrix & runtime internals |
  | **2** | Competitor matrix (`>= 5` benchmarks & fatal flaws) | Typed API contracts, schemas & integration blueprints |
  | **3** | System, state-sync & data architecture | Comparative trade-off matrix (`>= 3` options, p99, DX) |
  | **4** | Unit economics at `1k / 10k / 100k` users | Performance, memory, bundle & cost envelope |
  | **5** | D7/D30 churn failure modes & mitigations | GitHub Issues, CVEs, version-drift & rollback gotchas |

### 🧭 Track 1B: `scouter#s1..k` — Workspace Manifests, Modules (`<= 3–4` Files/Shard) & `1,462` Skills Vault
- **Invocation**: `invoke_subagent(TypeName: "self", Role: "Codebase & Skills Scouter (scouter#sk)", Model: "inherit", Prompt: ...)`
- **Disjoint Output Lock**: Return structured `[Tier 1–2]` payload via message OR write `<appDataDir>\brain\<conversation-id>\SCOUT-{topic}-s{k}.md` (`UserFacing: false, RequestFeedback: false`).
- **Scope**: Inspect `package.json` / `pyproject.toml` / `Cargo.toml` / `./documents/`, map integration `[file:line]` touchpoints, and query `matrix-skills/compact-index.json` (`1,462` skills) for matching 2026 `SKILL.md` guardrails.

### 🎼 Track 1C (Conditional — Multi-Engine Council when `engines.researcher = "council"`):
- Run in parallel on Turn 1:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task research --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"
  ```

---

## 🎭 Stage 2: CONTRADICTION ARBITRATION, SINGLE-FILE SYNTHESIS & CLI VALIDATION

Once all Stage 1 shards complete via Reactive Async Wakeup:
1. **Cross-Verify & Arbitrate**: Reconcile `researcher#v1..k` claims against `scouter#s1..k` repo constraints (and `COUNCIL-{topic}.md` if present). If a version mismatch or unverified claim appears, message the warm shard (`send_message(Recipient: conversationId)`) for targeted verification.
2. **Synthesize 1 Cohesive 6-Block `RESEARCH-{topic}.md` (`<= 500` Lines)**:
   Write `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` with `ArtifactMetadata: { Summary: "<verdict + confidence + pinned versions>", UserFacing: true, RequestFeedback: true }`:
   - **`## 1. Executive Verdict & Scope Summary`**: Clear decision, Scope YAML (`topic`, `date`, `track`, `overall_confidence`, `pinned_versions`), and Cross-Engine Consensus summary (if Council ran).
   - **`## 2. 5-Lens Multi-Angle Findings`**: Complete Track A / Track B 5-Lens analysis with inline **`[Confidence: HIGH|MEDIUM|LOW]`** + **`[Tier 1..4]`** tags on claims and verified code/config blueprints.
   - **`## 3. Contradiction & Version-Drift Arbitration + Comparison Matrix`**: Dialectical **Contradiction & Version-Drift Arbitration Table** + **Quantitative Comparison Matrix (`>= 2` rows)** + **Mermaid diagram** (`flowchart LR`, `sequenceDiagram`, or `xychart-beta`; optionally pair with a `generative_ui` interactive explorer widget when comparing complex multi-axis benchmarks).
   - **`## 4. Anti-Sycophancy "When NOT to Use" & Failure Modes`**: Explicit disqualifiers where alternatives win + production failure modes, CVEs & mitigations.
   - **`## 5. Clickable Citation Registry & Execution Audit Log`**: Consolidated Wave 1–3 query audit log + clickable `https://...` and `file:///...` citations.
   - **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**: Machine-ready handoff contract (`Recommended Stack & Pinned Versions`, `Hard Constraints`, `Rejected Anti-Patterns`, `Repo Touchpoints`, `Recommended Next Workflow`).
3. **Run Deterministic CLI Validation Gate (Mandatory)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/RESEARCH-{topic}.md" --mode research
   ```

---

## ⛔ HARD STOP — PRESENT COHESIVE ARTIFACT & AWAIT USER DECISION

> **WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[RESEARCH-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active), summarize the top arbitrated findings, and offer next steps:
> 1. 🔘 **Click "Proceed"** (or run `/plan:hard` / `/cook:hard`) → Consume `HANDOFF_BRIEF` directly with zero re-searching
> 2. 💡 `/brainstorm:hard` or `/brainstorm:team` → Fast-forward `HANDOFF_BRIEF` into strategic option exploration & Pre-Mortem scoring
> 3. 🎨 `/design:hard` → Fast-forward into a 6-Block UI/UX `DESIGN-{topic}.md` specification
