---
description: "🔺 Team Research — 2-Stage Elastic Golden Diamond 3-to-6 Vector Deep-Research, Multi-Engine Council, Adversarial Cross-Examination & CLI Validation"
version: "5.5"
category: research
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Single User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` (rendering Antigravity 2.0's 1-click **"Proceed"** button).
> - **Zero Parallel Write Collisions**: Parallel Stage 1 shards **NEVER concurrently write/append to the same `MAILBOX-{date}.md` or `RESEARCH-{topic}.md`**! Each shard returns structured vector findings via message OR writes a disjoint internal scratch file (`RESEARCH-{topic}-v{1..k}.md`, `SCOUT-{topic}-s{1..k}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`. Only the single coordinator (`techlead` / orchestrator) writes consolidated debate rounds to `MAILBOX-{date}.md` (`UserFacing: false, RequestFeedback: false`) and synthesizes `RESEARCH-{topic}.md`.

---

# /research:team — 2-Stage Elastic Golden Diamond Deep-Research Engine (`3–6` Vectors + Council)

> **MISSION**: Achieve maximum epistemic accuracy and zero-hallucination synthesis through **Stage 1 Elastic Parallel Vector Deep-Hunting (`3` core `research-team` vectors scaling to `4–6` disjoint shards)** + optional **Multi-Engine Council (`boomopen conduct council --task research`)**, followed by **Stage 2 Adversarial Contradiction Cross-Examination & Wave 3 Gap-Filling via Warm `send_message`** into **1 CLI-validated 6-Block `RESEARCH-{topic}.md`**.
> **DEFAULT (`naturalLanguageResearchTrigger = "auto_team"`)**: Default workflow for `/research` and natural-language deep technical/market investigations across all 17 languages.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 ZERO-TAX ELASTIC PARALLEL FAN-OUT & SUB-AGENT RULE

⚡ **COGNITIVE LOAD SHARDING LAW**:
$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
Each sub-agent owns **at most `1` deep research vector** (or `<= 3–4` heavy workspace files). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — spawn all **`3` core `research-team` roles (plus `1–3` elastic `researcher#v4..6` / `scouter#s2` shards when spanning `4–6` sub-problems) in a single Turn-1 tool batch** via `invoke_subagent(TypeName: "self", Model: "inherit")` and record `role#vector → conversationId` for Stage 2 Warm Session Reuse (`send_message`).

> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. **ALWAYS use `TypeName: "self"`, `Model: "inherit"`** for every `research-team` shard!

---

## 🎭 Stage 1 (Turn-1 Parallel Fan-Out): ELASTIC `3–6` VECTOR DEEP-HUNTING + OPTIONAL MULTI-ENGINE COUNCIL — 💎 GOLDEN DIAMOND

Spawn all disjoint investigative vectors concurrently on Turn 1 across the **4 Evidence Tiers** (`[Tier 1]` Workspace Manifests/Code, `[Tier 2]` `1,462` Skills Vault `compact-index.json`, `[Tier 3]` Official Vendor Docs/RFCs/`/llms.txt`, `[Tier 4]` Empirical Benchmarks/GitHub Issues/CVEs):

| Diamond Shard (`role#vector`) | Persona (`agents/teams/research-team/`) | Disjoint Turn-1 Vector Mission & Output Lock (`UserFacing: false, RequestFeedback: false`) |
|-------------------------------|-----------------------------------------|--------------------------------------------------------------------------------------------|
| **🔺 `techlead#v1`** | `techlead.md` (`researcher` Lead) | **Vector 1 — Official Specifications, RFCs, `/llms.txt` & Version Matrix**: Run `4–6+` Wave 1–2 `search_web` queries on official specs, runtime internals, and Dual-Track 5-Lens framing. Return structured payload via message OR write `RESEARCH-{topic}-v1.md`. |
| **⚙️ `executor#v2`** | `executor.md` (`scouter` + `researcher#sdk`) | **Vector 2 — Workspace Manifests, `1,462` Skills Vault & Verified SDK Blueprints**: Inspect repo manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `./documents/`), query `matrix-skills/compact-index.json`, and run `4–6+` SDK/API `search_web` queries. Return payload via message OR write `SCOUT-{topic}-s1.md` + `RESEARCH-{topic}-v2.md`. |
| **🛡️ `reviewer#v3`** | `reviewer.md` (Adversarial Fact-Checker) | **Vector 3 — Independent Benchmarks, Version-Drift, CVEs & Failure Modes**: Run `4–6+` adversarial `search_web` queries targeting GitHub Issues, breaking migrations, CVEs, p99 latency/cost traps, and `>= 5` competitor/alternative benchmarks. Return payload via message OR write `RESEARCH-{topic}-v3.md`. |
| **⚡ `executor#v4..6` *(Elastic)* ** | `executor.md` (`researcher#v4..6` / `scouter#s2`) | **Vectors 4–6 (When topic spans `>= 4` frameworks/competitors or `> 4` repo files)**: Dedicated 1-vector shards returning payloads via message OR disjoint `RESEARCH-{topic}-v{4..6}.md` / `SCOUT-{topic}-s2.md`. |

- **🎼 Optional Multi-Engine Council (`engines.researcher = "council"` or user-requested)**:
  Launch concurrently in Turn 1 (writes disjoint `COUNCIL-{topic}.md`):
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task research --output "<appDataDir>/brain/<conversation-id>/COUNCIL-{topic}.md" --prompt "<topic>"
  ```

---

## 🎭 Stage 2: ADVERSARIAL CROSS-EXAMINATION (`send_message`), MASTER SYNTHESIS & CLI VALIDATION

> **♻️ WARM SESSION REUSE**: Never cold-spawn new agents in Stage 2! Reuse Stage 1 `conversationId`s via `send_message(Recipient: conversationId, Message: ...)` (`<= 2` debate rounds; coordinator logs consolidated `[VECTOR_SUBMISSIONS]` → `[CRITIQUE]` → `[CONSENSUS]` into `MAILBOX-{date}.md` with `UserFacing: false, RequestFeedback: false`).

1. **Adversarial Contradiction & Provenance Audit (`reviewer#v3` via `send_message`)**:
   - Challenges all Vector `1..N` + `COUNCIL-{topic}.md` claims lacking `[Tier 1..4]` citations, flags version-drift or cherry-picked benchmarks, and forces **Wave 3 gap-filling `search_web` queries** on warm `executor#v2..k` / `techlead#v1` shards until resolved.
   - Stamp consensus in `MAILBOX-{date}.md`: `✅ CONSENSUS: research-team/techlead ✓ | research-team/executor#v2..k ✓ | research-team/reviewer ✓`.
2. **Synthesize 1 Cohesive 6-Block `RESEARCH-{topic}.md` (`<= 500` Lines)**:
   Write `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` with `ArtifactMetadata: { Summary: "<consensus verdict + confidence + pinned stack>", UserFacing: true, RequestFeedback: true }`:
   - **`## 1. Executive Verdict & Scope Summary`**: Consensus verdict, Scope YAML (`topic`, `date`, `track`, `overall_confidence`, `pinned_versions`, `consensus_stamp`), and 4-Part Multi-Engine Council summary (when Council ran).
   - **`## 2. 5-Lens Multi-Angle Findings`**: Deep Track A or Track B 5-Lens synthesis where claims carry inline **`[Confidence: HIGH|MEDIUM|LOW]`** + **`[Tier 1..4]`** tags and verified code/config blueprints.
   - **`## 3. Contradiction & Version-Drift Arbitration + Comparison Matrix`**: **Contradiction & Version-Drift Arbitration Table** + **Quantitative Comparison Matrix (`>= 2` rows)** + **Mermaid diagram** (`flowchart LR`, `sequenceDiagram`, or `xychart-beta`; optionally pair with a `generative_ui` interactive comparison widget for complex multi-axis benchmarks).
   - **`## 4. Anti-Sycophancy "When NOT to Use" & Failure Modes`**: Explicit boundary conditions where alternatives win + production failure modes, CVEs & mitigations.
   - **`## 5. Clickable Citation Registry & Execution Audit Log`**: Multi-vector Wave 1–3 audit table + clickable `[Source Title](https://...)` and `[file:line](file:///...)` citations.
   - **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**: Machine-ready handoff block (`Recommended Architecture & Pinned Versions`, `Hard Constraints`, `Rejected Anti-Patterns`, `Repo Touchpoints`, `Recommended Next Workflow`).
3. **Deterministic CLI Validation Gate (Mandatory)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/RESEARCH-{topic}.md" --mode research
   ```

---

## ⛔ HARD STOP — PRESENT COHESIVE ARTIFACT & AWAIT USER DECISION

> **WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[RESEARCH-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active), highlight key arbitrated findings, and offer next steps:
> 1. 🔘 **Click "Proceed"** (or run `/plan:team` / `/cook:team`) → Consume `HANDOFF_BRIEF` directly with zero re-searching
> 2. 💡 `/brainstorm:team` → Fast-forward `HANDOFF_BRIEF` into `3–4` strategic options & Devil's Advocate Pre-Mortem scoring
> 3. 🎨 `/design:team` or `/design:hard` → Fast-forward into a 6-Block UI/UX `DESIGN-{topic}.md` specification
