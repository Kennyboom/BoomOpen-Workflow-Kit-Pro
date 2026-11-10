---
description: ⚡ Quick Plan — Tier 1 compact machine-validated plan (<= 100 lines) with full 5-Field Handoff & native Proceed button
version: "5.5"
category: planning
execution-mode: execute
---

> **📂 Deliverable & Native "Proceed" Routing (v5.5)**: On Antigravity 2.0, write `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` as **1 single cohesive file (`<= 100` lines for `/plan:fast`, never split into a folder)** with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so the native 1-click **"Proceed"** button renders in the UI. Set `RequestFeedback: false` on any intermediate `SCOUT` artifact.

---

# /plan:fast — Tier 1 Compact Implementation Plan (`<= 100` Lines)

> **MISSION**: Produce a fast, deterministic, machine-validated implementation plan (`<= 100` lines) for focused tasks (`1–5` files) with complete 5-Field Handoff metadata (`SHARED_CONTRACT`, `Agent: role#shard`, `OWNED_FILES <= 4`, `READ_ONLY_FILES`, `Test Files`, `Verify`) ready for 1-click execution via `/code:fast` or `/code:hard`.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & PRIOR-ARTIFACT FAST-FORWARD

1. **Zero Pre-Flight Tax**: Core orchestration laws and the 5-Field Handoff Packet are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`.
2. **Prior-Artifact Fast-Forward**: If `SCOUT-{task}.md` already exists in `<appDataDir>\brain\<conversation-id>\` (or `./reports/{topic}/`), reuse it immediately and skip Phase 1!

| Tier | When | Action |
|------|------|--------|
| **TIER 1** | Antigravity 2.0 Native Sub-Agents (`invoke_subagent`, `send_message`) or `runSubagent` EXISTS | Invoke isolated sub-agent (`TypeName: "self"`, `Model: "inherit"`) |
| **TIER 2** | Tool MISSING or system error | EMBODY agent file (FALLBACK) |

---

## ⛔ ABSOLUTE PROHIBITION — NO CODE

- ❌ **NEVER** write implementation code (TypeScript, Python, Rust, etc.) or modify application source files.
- ❌ **NEVER** auto-transition to `/code`, `/cook`, or `/fix` without user approval.
- ✅ **ONLY** produce `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` (or `./reports/{topic}/plans/PLAN-{task}.md` on non-Antigravity tools) in the user's input language (technical terms in English).

---

## 🎭 Phase 1: FAST CONTEXT SCAN (`scouter`)

| Agent | `scouter` (`TypeName: "self"`, `Model: "inherit"`) |
|-------|----------------------------------------------------|
| Goal | Rapidly locate exact target files (`1–5` files), existing types/interfaces, and existing test files |
| Exit | Exact `OWNED_FILES`, `READ_ONLY_FILES`, and `Test Files` paths verified on disk |

---

## 🎭 Phase 2: COMPACT PLAN CREATION & CLI VALIDATION (`planner`)

| Agent | `planner` (`TypeName: "self"`, `Model: "inherit"`) |
|-------|----------------------------------------------------|
| Goal | Write compact, machine-parseable `PLAN-{task}.md` (`<= 100` lines) and validate via CLI |
| Output | `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` |
| CLI Gate | Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"` (must exit `0`) |

### Mandatory Compact `PLAN-{task}.md` Template (`<= 100` Lines — Compatible with `/code:fast`, `/code:hard` & `boomopen plan validate`)

````markdown
# 📋 Implementation Plan: {Task Name}

> [!IMPORTANT]
> **1-Click Execution Ready**: Click **"Proceed"** on this artifact (or reply `"proceed"` / `"tiến hành đi"` / `"/code:fast"`) to execute Wave 1 directly.

## 📌 User Request (VERBATIM)
> {Exact user request}

## 🎯 Acceptance Criteria
| ID | Given | When | Then | Verify |
|----|-------|------|------|--------|
| AC1 | {context} | {action} | {expected outcome} | `{exact test command}` |
| AC2 | {edge/error case} | {invalid/boundary input} | {graceful error handling} | `{exact test command}` |

## 🤝 Shared Interface Contracts (`SHARED_CONTRACT`)
```ts
// Exact shared DTOs / function signatures / types (or "Single-module internal change — no cross-domain boundary")
export interface TaskPayloadDto {
  readonly id: string;
}
```

## Wave 1: Core Implementation (`Parallelizable: Yes | No` | `Depends On: None`)

### Task 1.1 (REQ-101): {Specific atomic action}
- **Agent**: `{canonical-role}#{shard}`
- **Acceptance**: `AC1`, `AC2`
- **OWNED_FILES**: `src/module/target.ts`
- **READ_ONLY_FILES**: `src/types/index.ts`
- **Test Files**: `tests/module/target.test.ts`
- **Verify**: `npm test -- tests/module/target.test.ts && node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check src/module --strict-phase --no-stubs`

## 💥 Blast-Radius Pre-Mortem & Rollback Manifest
| Risk / Blast Radius | Impact | Mitigation & Locked Regression Tests | Exact Rollback Command |
|---------------------|:------:|--------------------------------------|------------------------|
| {Impacted callers} | L/M | Lock existing tests in `READ_ONLY_FILES` | `git checkout -- src/module/target.ts` |
````

### Mandatory Pre-Presentation CLI Gate
Before finishing Phase 2, run:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<appDataDir>/brain/<conversation-id>/PLAN-{task}.md"
```
Fix any reported `OWNED_FILES` collision, `> 4` files/shard violation, or missing field before presenting to the user.

---

## ⛔ HARD STOP — AWAIT USER DECISION

> **WORKFLOW COMPLETE. DO NOT PROCEED FURTHER.**
>
> Present `<appDataDir>\brain\<conversation-id>\PLAN-{task}.md` (`RequestFeedback: true`) and **STOP**:
> 1. 🟢 **Click "Proceed" (or reply `"proceed"` / `"tiến hành đi"`)** → Execute immediately via `/code:fast` or `/code:hard` (Approved-Plan Continuation — skips redundant scouting)
> 2. 🔍 **`/plan:hard`** → Escalate to deep 2-Wave multi-shard planning
> 3. 🔄 **Iterate** → Tell me which task or contract to refine
