---
description: "🎼 Cross-Engine Role-Division Pipeline — Assign Claude Code, OpenAI Codex, Antigravity, Cursor, and Copilot to specialist roles (Planner/Docs -> Sharded Coders -> Cross-Family Reviewer & Debugger) in an automated pipeline."
version: "5.5"
category: orchestration
execution-mode: execute
---

# /conduct:pipeline — Automated Cross-Engine Role-Division Pipeline

> **MISSION**: Orchestrate multiple AI platforms across software engineering phases (`Engine A Plans → Engine B/C Codes Disjoint Shards → Cross-Family Engine D Reviews & Debugs`) with **SHA-256 `READ_ONLY_FILES` boundary protection**, **3-Tier automatic quota failover**, **0-turn `invoke_subagent` native fallback**, and **Cross-Family Adversarial Review (`Author ≠ Critic`)**.

<pipeline_request>$ARGUMENTS</pipeline_request>

---

## ⚡ STEP 1: PROBE ENGINES & RESOLVE ROLE-TO-ENGINE ROUTING MATRIX

1. **Probe Installed CLI Binaries & Status**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct probe
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct status
   ```
   *(Syntax reference: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct <probe|dispatch|council|status>`)*
2. **Resolve Role-to-Engine Matrix (`Explicit User Prompt > ./.boomopen.json > ~/.boomopen/settings.json`)**:
   - `engines.researcher` / `engines.planner` (`current` | `auto` | `council` | `claude` | `codex` | `antigravity` | `cursor` | `copilot`)
   - `engines.coder` (`current` | `auto` | `codex` | `antigravity` | `claude` | `cursor` | `copilot`)
   - `engines.debugger` (`current` | `auto` | `cross_family` | `council` | `<engine>`)
   - `engines.reviewer` (default `cross_family` — automatically enforces **`Author ≠ Critic`** by selecting a different model family from `engines.coder`!)
3. **0-Turn Native Sub-Agent Fallback (`invoke_subagent` + Warm `send_message`)**:
   - Whenever a role resolves to `"current"` OR `conduct probe` shows the target CLI binary is not installed on `PATH` (`queued: true`), execute that role shard immediately via 0-turn **`invoke_subagent(TypeName: "self", Role: "<role#shard>", Model: "inherit", Prompt: ...)`** and record `role#shard -> conversationId` for Warm Session Reuse (`send_message`).

---

## 📋 STEP 2: PHASE 1 — DISCOVERY, SPECS & CONTRACT-FIRST PLANNING (`engines.planner`)

1. **Fast-Forward Check (`cook state`) & Planner Dispatch**:
   - Check `<appDataDir>\brain\<conversation-id>\` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`. If an approved `PLAN-{feature}.md` already exists, skip straight to Step 3!
   - If `engines.planner = "council"`, run `conduct council --task plan --prompt "<feature>" --output "<appDataDir>/brain/<conversation-id>/COUNCIL-<feature>.md"`.
   - Otherwise, dispatch `engines.planner` (or 0-turn `invoke_subagent` `planner` fallback):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role planner --engine <engines.planner> --prompt "<task>" --output "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md"
     ```
2. **Validate `SHARED_CONTRACT`, Disjoint Shards (`≤ 3–4` files) & `ArtifactMetadata`**:
   - Validate `<appDataDir>\brain\<conversation-id>\PLAN-{feature}.md` (`<= 500` lines single cohesive file; `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` if pausing for interactive approval, or `RequestFeedback: false` in autonomous end-to-end execution):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md"
     ```

---

## 💻 STEP 3: PHASE 2 — PARALLEL MULTI-ENGINE CODING WAVE (`engines.coder`)

1. **Compile Deterministic Wave Handoff Packets**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave <n>
   ```
2. **Dispatch Disjoint Shards (`≤ 3–4 OWNED_FILES` per shard) in Parallel**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role coder --engine <engines.coder> --owned "<file1,file2,file3>" --read-only "<contract,sibling_files,prior_tests>" --prompt "<shard_handoff_packet>"
   ```
   *(Or parallel 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` shards when running natively.)*
   - **SHA-256 `READ_ONLY_FILES` Guard & 3-Tier Quota Failover**: `conduct dispatch` snapshots `READ_ONLY_FILES` before execution, automatically fails over across installed engines on HTTP 429/quota errors, and restores any unauthorized mutation byte-for-byte.
3. **Deterministic Post-Wave & Strict-Phase Gates**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<appDataDir>/brain/<conversation-id>/PLAN-<feature>.md" --wave <n> --git --run-verify
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```

---

## 🛡️ STEP 4: PHASE 3 — CROSS-FAMILY ADVERSARIAL REVIEW & DEBUG ESCALATION (`Author ≠ Critic`)

1. **Cross-Family Adversarial Review (`engines.reviewer = cross_family`)**:
   - Dispatch a **different model family** from `coder_engine` (`claude` ↔ `codex` ↔ `antigravity`):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --author-engine <coder_engine> --prompt "<review_handoff>" --output "<appDataDir>/brain/<conversation-id>/REVIEW-<feature>.md"
     ```
2. **Automated Debug Escalation (`engines.debugger`) & Final Verification**:
   - If tests fail or `🔴 CRITICAL` / `🟠 HIGH` defects appear, route fixes to warm `conversationId` shards via `send_message` or dispatch `conduct dispatch --role debugger --engine <engines.debugger> --author-engine <coder_engine> --prompt "<failure_log>"`.
   - Re-run tests (`0` failures), `check <dir> --strict-phase --no-stubs`, and `conduct status`.

---

## ✅ COMPLETION & BRAIN SYNTHESIS ARTIFACT

Write/present `<appDataDir>\brain\<conversation-id>\COUNCIL-{feature}.md` (and `REVIEW-{feature}.md`, `<= 500` lines, `ArtifactMetadata: { Summary: "Cross-Engine Pipeline Synthesis & Verification", UserFacing: true, RequestFeedback: false }`):

```markdown
## 🎼 Cross-Engine Pipeline Complete: {feature}

| Phase / Role | Assigned Engine(s) | Brain Artifact / Shards | Deterministic Gate |
|:-------------|:-------------------|:------------------------|:-------------------|
| **P1: Plan & Contract** | `{planner_engine}` | `PLAN-{feature}.md` + `SHARED_CONTRACT` | ✅ `plan validate` Pass |
| **P2: Sharded Coding** | `{coder_engines}` | `{N}` shards (`≤ 3–4` files/shard, SHA-256 guard) | ✅ `cook verify-wave` & `check --strict-phase --no-stubs` |
| **P3: Cross-Family Review** | `{reviewer_engine}` (`Author ≠ Critic`) | `COUNCIL-{feature}.md` / `REVIEW-{feature}.md` | ✅ `0` Critical / `100%` Tests Pass |
```
