---
description: "⚡⚡⚡ Deep Debug — Turn-1 Elastic Parallel Hypothesis Sharding (debugger#h1..k), SPIE v3.0 5-Whys Proof & 1-Click Proceed to /fix"
version: "5.5"
category: debugging
execution-mode: execute
---

# /debug:hard — Elastic Multi-Hypothesis SPIE Root-Cause Investigation (`v5.5`)

> **MISSION**: Prove the exact root cause of complex, cross-module, or intermittent bugs without mutating production code by launching **parallel hypothesis shards (`debugger#h1..k`, `TypeName: "self"`, `Model: "inherit"`) on Turn 1**, falsifying competing explanations, and synthesizing **1 cohesive `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`≤ 500` lines)** with `ArtifactMetadata.RequestFeedback: true` for 1-click **"Proceed"** into `/fix`!

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX ELASTIC HYPOTHESIS SHARDING

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Suspect Files}}{3.5} \right\rceil,\; \text{Distinct Subsystems},\; \text{Ranked Hypotheses}\right)\right)$$

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint. Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — check `<appDataDir>\brain\<conversation-id>\` for prior `SCOUT-*.md` / `PLAN-*.md` context and launch Phase 1 shards **immediately on Turn 1**!
2. **⚠️ `TypeName: "self"` Mandatory**: Antigravity's `TypeName: "research"` disables `run_command`, `search_web`, and `write_file`. **ALWAYS spawn `invoke_subagent(TypeName: "self", Role: "debugger#h{k}", Model: "inherit", Prompt: ...)`** (NEVER `flash_lite`) and store `debugger#h{k} -> conversationId` for Warm Session Reuse (`send_message`).
3. **🔒 Disjoint Per-Hypothesis Scratch Files (Zero Overwrite Collisions)**:
   - When `k = 1` (`≤ 4` suspect files in `1` module): `debugger#h1` writes `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` directly.
   - When `k ≥ 2` (`2–6` parallel shards across hypotheses/modules, `≤ 3–4` heavy files per shard): each shard writes to its own isolated `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}-h{k}.md` with `ArtifactMetadata: { Summary: "Hypothesis k trace", UserFacing: false, RequestFeedback: false }`!

---

## 🚀 Phase 1 (Turn-1 Parallel Fan-Out): ORTHOGONAL HYPOTHESIS SHARDS (`debugger#h1..k`)

Decompose `{issue}` into `2–4` ranked orthogonal hypotheses (plus optional `researcher#runtime` if an external SDK/CVE/upgrade regression is suspected) and spawn in **one Turn-1 parallel batch**:
- **`debugger#h1` (Primary Stack / State Path)**: Reproduce failure via `run_command`, inspect top stack frames and recent `git diff` / `git log -p -S`, trace entry → state mutation → crash (`≤ 3–4` files).
- **`debugger#h2` (Upstream Contract / Boundary Mismatch)**: Trace callers, schema/DTO deserialization, null/auth boundaries, and configuration/env drift (`≤ 3–4` files).
- **`debugger#h3..k` (Concurrency, Race Window, Caching, or DB/Infra Edge Case)**: Inspect async ordering, lock/transaction isolation, connection pools, stale caches, or framework-specific gotchas.
- **Strict Read-Only Production Rule**: Target codebase files are locked in `READ_ONLY_FILES` during `/debug:hard` — zero production source files may be modified!

### 🎼 Round-2 Cross-Engine Debug Escalation (If All Round-1 Hypotheses Are Inconclusive)
If Round 1 fails to achieve deterministic causal proof (or when `engines.debugger = "cross_family"` / `"council"`), escalate immediately to a second model family:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role debugger --engine cross_family --prompt "<symptom + repro log + eliminated hypotheses H1..Hk>"
```

---

## 🎭 Phase 2: SPIE v3.0 SYNTHESIS (`DEBUG-{issue}.md` — `DBG-G1..G4`)

Consolidate all `DEBUG-{issue}-h{1..k}.md` traces (resolving any cross-module questions via warm `send_message(Recipient: conversationId)`) into **1 cohesive single file (`≤ 500` lines — NEVER split into `{name}/` folders)** at `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (fallback `./reports/{topic}/debugs/DEBUG-{issue}.md`) with `ArtifactMetadata: { Summary: "Proven SPIE 5-Whys root cause and surgical fix blueprint for {issue}", UserFacing: true, RequestFeedback: true }`:

1. **Exact Failure Signature & Deterministic Reproduction (`DBG-G1`)**: Verbatim error/log output, environment pins, and exact command/steps to trigger the bug on demand.
2. **Hypotheses Tested & Falsification Matrix (`DBG-G3`)**: Table of `H1..Hk` showing empirical `CONFIRMED` proof vs. `ELIMINATED` counter-evidence.
3. **SPIE v3.0 5-Whys Causal Chain (`DBG-G2`)**: `Why 1 (Crash Symptom)` → `Why 2 (Proximate State)` → `Why 3 (Contract/Validation Gap)` → `Why 4 (Control-Flow Flaw)` → `Why 5 (Systemic Root Cause)` with clickable `[basename:L10-L25](file:///...)` citations at every link.
4. **Blast-Radius & Side-Effect Map (`DBG-G4`)**: All callers, shared state, DB schemas, or downstream consumers impacted by modifying the fault site.
5. **Surgical Fix Blueprint & Fail-First Regression Test Spec**: Exact target files (`≤ 3–4 OWNED_FILES` per fix shard), concrete code-level remediation (adhering to Pragmatic 2-Tier Standards), rollback plan, and the exact `RED → GREEN` test case to write first in `/fix`.

---

## ⛔ GATE & NEXT STEPS

- [ ] Root cause proven (`DBG-G1..G4`) with clickable `[file:line]` citations and deterministic repro
- [ ] Single cohesive `DEBUG-{issue}.md` (`≤ 500` lines, `RequestFeedback: true`) written; zero production files modified

Present `DEBUG-{issue}.md` (1-click **"Proceed"** button active):
1. 🔧 **Proceed / `/fix:hard`** → Fast-forwards past root-cause discovery straight into Fail-First Reproduction Test + Sharded Fix!
2. 💎 **`/fix:team`** → Execute the fix with Elastic Golden Diamond adversarial review
