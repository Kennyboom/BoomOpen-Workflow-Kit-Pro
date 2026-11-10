---
description: ⚡⚡⚡ Full Fix — Bidirectional DEBUG Fast-Forward, Elastic Hypothesis Sharding, Fail-First TDD & Sharded Engineer Verification
version: "5.5"
category: debugging
execution-mode: execute
---

# /fix:hard — Elastic Multi-Shard Bug Resolution (`v5.5`)

> **MISSION**: Resolve complex, multi-file bugs end-to-end with **Bidirectional `DEBUG`/`REVIEW` Fast-Forward**, **Turn-1 Parallel Root-Cause Sharding** (when un-diagnosed), **Fail-First `RED → GREEN` Regression Locking**, **Disjoint Fix Shards (`≤ 3–4 OWNED_FILES`/shard)**, and a **Persistent Auto-Fix Verification Loop** (`boomopen check --strict-phase --no-stubs`).

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, FAST-FORWARD GATE & COGNITIVE LOAD SHARDING

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Hypotheses}\right)\right)$$

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`!
2. **⚡ BIDIRECTIONAL PRIOR-ARTIFACT FAST-FORWARD (Check on Turn 1!)**:
   - Inspect `<appDataDir>\brain\<conversation-id>\` (fallback `./reports/{topic}/`) for an existing **`DEBUG-{issue}.md`** or **`REVIEW-{scope}.md`** (with P0/P1 defects).
   - **If `DEBUG-{issue}.md` or `REVIEW-{scope}.md` exists**: **SKIP Stage 1 completely (`0` redundant `debugger`/`researcher` spawns!)** and jump straight to **Stage 2 (Fail-First Reproduction Test + Disjoint Fix Shards)**!
3. **Sub-Agent & Metadata Rules**:
   - Always use `invoke_subagent(TypeName: "self", Role: "<role>#<shard>", Model: "inherit", Prompt: ...)` (NEVER `TypeName: "research"` or `flash_lite`) and store `role#shard -> conversationId` for Warm Session Reuse (`send_message`).
   - All artifacts written inside `/fix:hard` set `ArtifactMetadata.RequestFeedback: false` (`DEBUG-{issue}-h{k}.md` uses `UserFacing: false, RequestFeedback: false`; consolidated `DEBUG-{issue}.md` and `TEST-{issue}.md` use `UserFacing: true, RequestFeedback: false`, single file `≤ 500` lines — NEVER folder-split!).

---

## 🔍 STAGE 1: PARALLEL SPIE ROOT-CAUSE & PATTERN DISCOVERY *(Skipped When `DEBUG-{issue}.md` Exists!)*

Spawn **`2–3` sub-agents for moderate bugs (`≤ 4` files) or `4–8` parallel shards (`debugger#h1..k` + optional `researcher#pattern`) when spanning `> 4` files or `≥ 3` modules** in a single Turn-1 batch (`READ_ONLY_FILES`: all production code):
- **`debugger#h1..k` (`agents/debugger.md`, `≤ 3–4` suspect files/shard)**: Reproduce failure, trace stack/state/git-blame, and falsify competing hypotheses → each shard writes disjoint `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}-h{k}.md` (`UserFacing: false, RequestFeedback: false`).
- **`researcher#pattern` *(Conditional — spawned only when framework/SDK/CVE edge cases are involved)***: Run targeted 2-Wave `search_web` + `compact-index.json` (`1,462` skills) lookup → writes `<appDataDir>\brain\<conversation-id>\RESEARCH-{issue}.md` (`UserFacing: false, RequestFeedback: false`).
- **Round-2 Cross-Engine Debug Escalation**: If Stage 1 fails to prove causation, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role debugger --engine cross_family --prompt "<symptom + H1..Hk>"`.
- **Stage 1 Synthesis**: Consolidate into **1 cohesive `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`≤ 500` lines, `RequestFeedback: false`)** locking exact fault `[file:line]`s, `SHARED_CONTRACT` (if cross-module), and disjoint `OWNED_FILES` shards (`≤ 3–4` files/shard). *(Only invoke `planner` to write `PLAN-{issue}.md` if the remediation requires a multi-wave architectural refactor across `> 6` files!)*

---

## 🔨 STAGE 2: FAIL-FIRST REPRODUCTION TEST (`RED`) & DISJOINT FIX SHARDS (`GREEN`)

1. **Fail-First Reproduction Lock (`RED`)**:
   - Before or alongside Wave 1 fix dispatch, write/execute a targeted reproduction test confirming the exact bug fails (`RED`).
   - **Regression Lock**: Lock all pre-existing `tests/**` files inside every engineer shard's `READ_ONLY_FILES` so existing tests are never weakened, deleted, or `.skip`ped!
2. **Direct Disjoint Engineer Fan-Out (`1..6` Parallel Shards, `Model: "inherit"`)**:
   - Dispatch directly from `DEBUG-{issue}.md` (or `PLAN-{issue}.md`) to sharded domain specialists (`database-architect#schema` / `backend-engineer#contracts` first if shared schemas change → parallel `backend-engineer#1..k`, `frontend-engineer#1..k`, `mobile-engineer#1..k`), each strictly locked to **`≤ 3–4` disjoint `OWNED_FILES`**.
   - Enforce **Pragmatic 2-Tier Coding Standards** (`0` explicit `any`, `0` temporary debug `console.log`, typed `try/catch` boundaries, `≤ 400` soft / `≤ 500` hard lines).

---

## 🧪 STAGE 3: PERSISTENT AUTO-FIX VERIFICATION LOOP & CRITIC GATE

1. **Parallel Regression Suite & CLI Strict Check (`tester#1..k`)**:
   - Run the new reproduction test (`RED → GREEN`), full affected test suites, build/typecheck, and:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
     ```
   - Write `<appDataDir>\brain\<conversation-id>\TEST-{issue}.md` (`≤ 500` lines, `UserFacing: true, RequestFeedback: false`).
2. **Persistent Iterative Auto-Repair (`send_message`)**:
   - If any test, build, or `check --strict-phase --no-stubs` check fails, route exact `file:line` diagnostics back to the owning warm `{engineer#shard}` via `send_message(Recipient: conversationId)` and re-verify iteratively until **100% green**!
3. **Optional Cross-Engine Critic / Rollback Check**:
   - When `engines.reviewer = "cross_family"`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<DEBUG-{issue}.md + git diff>"`.
   - If DB migrations or production infra changed, run `devops-engineer` rollback verification.

---

## ✅ COMPLETION

Present verified resolution summary (`DEBUG-{issue}.md` + `TEST-{issue}.md` + clean `check --strict-phase --no-stubs` proof):
1. ✅ **Fixed & Verified** — Root cause eliminated, `RED → GREEN` regression test passing, `0` new errors
2. 🔍 **Review** → `/review:fast` or `/review:team`
3. 🚀 **Deploy** → `/deploy:check`
