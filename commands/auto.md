---
description: 🤖 Autonomous Execution — Full workflow automation
version: "5.5"
category: meta
execution-mode: router
---

# /auto — Autonomous Workflow Orchestrator (v5.5)

> **ROUTER DIRECTIVE**: Classify the user's intent across all 17 supported languages on Turn 1, fast-forward past already-completed artifacts via `boomopen cook state`, and autonomously execute the matching workflow end-to-end without unnecessary user pauses between phases.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, FAST-FORWARD STATE MACHINE & SHARDING LAW

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — classify, select the target `commands/{cmd}-{variant}.md`, and launch Phase 1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` (Pro High default; NEVER `flash_lite`).
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` and `.boomopen/project-ledger.json` on Turn 1:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
   ```
   - **Active Multi-Phase Ledger (`.boomopen/project-ledger.json`)** → Fast-forward directly to `commands/autopilot-run.md` (`boomopen ledger next`).
   - **`PLAN-{task}.md` already exists (Approved-Plan Gate)** → Fast-forward directly to `commands/code-team.md` (`boomopen cook preflight` + `boomopen cook packets`, **0 re-scouting, 0 re-planning!**).
   - **`DESIGN-{task}.md` exists (no `PLAN` yet)** → Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and fast-forward to Stage 3 planning in `commands/cook-hard.md` or `commands/plan-hard.md`.
   - **`SCOUT-{task}.md` or `RESEARCH-{task}.md` exists** → Reuse existing discovery artifacts and skip redundant Stage 1 scouting/research spawns.
3. **Cognitive Load Sharding (`≤ 3–4` Files/Shard) & Warm Session Reuse**:
   $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
   Assign disjoint `OWNED_FILES` (`≤ 3–4` files per `role#shard`), lock upstream contracts and tests in `READ_ONLY_FILES`, and record `role#shard -> conversationId` to reuse warm sub-agents via `send_message(Recipient: conversationId, Message: ...)`.

---

## 🎭 Phase 1: ZERO-HOP TASK CLASSIFICATION & WORKFLOW ROUTING TABLE

Classify the request directly in the orchestrator on Turn 1 (**no** redundant `tech-lead` router hop) and load the canonical workflow file:

| Task Type / Intent (17 Languages) | Canonical Command | Workflow File | Turn-1 Execution Strategy |
|-----------------------------------|-------------------|---------------|---------------------------|
| Multi-Doc / Multi-Phase Project | `/autopilot` | `commands/autopilot.md` (`commands/autopilot-init.md`, `commands/autopilot-run.md`, `commands/autopilot-audit.md`) | Ledger DAG init/resume via `boomopen ledger` |
| Multi-Engine Consensus / Pipeline | `/conduct` | `commands/conduct.md` (`commands/conduct-council.md`, `commands/conduct-pipeline.md`) | Parallel cross-engine council via `boomopen conduct` |
| Approved Plan Execution | `/code:team` / `/code:hard` | `commands/code-team.md` / `commands/code-hard.md` | Direct Plan-to-Executor Dispatch (`cook packets`) |
| End-to-End New Feature (No Plan) | `/cook:hard` / `/cook:team` | `commands/cook-hard.md` / `commands/cook-team.md` | 3-Wave Contract-First Discovery → Design → Plan → Build |
| Implementation Plan / System Architecture | `/plan:hard` / `/architect` | `commands/plan-hard.md` / `commands/architect.md` | Parallel `scouter` + `researcher` → `boomopen plan validate` |
| UI/UX Design & Token Contract | `/design:hard` / `/design:team` | `commands/design-hard.md` / `commands/design-team.md` | 6-Block `DESIGN-{task}.md` → `boomopen design validate` |
| Root-Cause Debug / Multi-File Bug Fix | `/debug:hard` / `/fix:hard` | `commands/debug-hard.md` / `commands/fix-hard.md` (`commands/fix-team.md`) | Parallel hypothesis trace → root-cause patch + regression test |
| Deep Research / Product Ideation | `/research:team` / `/brainstorm:team` | `commands/research-team.md` / `commands/brainstorm-team.md` | Multi-vector parallel `researcher#1..k` + adversarial synthesis |
| Code, Doc-Logic, Security & Perf Audit | `/review:team` / `/deep-audit` / `/security-audit` / `/performance` | `commands/review-team.md` / `commands/deep-audit.md` / `commands/security-audit.md` / `commands/performance.md` | Parallel `READ_ONLY_FILES` critic shards + CLI scanners |
| Structure-Only Safe Refactoring | `/refactor` | `commands/refactor.md` | Baseline metrics → sharded Fowler surgery (`0` perf regression) |
| Comprehensive Testing & QA | `/test:hard` / `/test:team` | `commands/test-hard.md` / `commands/test-team.md` | Parallel unit/integration/E2E shards + coverage gate |
| Bootstrap / Preview / Rollback / Settings | `/init` / `/preview` / `/rollback` / `/settings` | `commands/init.md` / `commands/preview.md` / `commands/rollback.md` / `commands/settings.md` | Sharded setup, `auto_preview.py`, safe recovery, UI config |
| Docs / Report / Deploy | `/docs:core` / `/report:hard` / `/deploy:check` | `commands/docs-core.md` / `commands/report-hard.md` / `commands/deploy-check.md` | Domain-specialist execution + CLI health gates |
| Codebase Q&A / Fast Lookup | `/ask:hard` / `/ask:fast` | `commands/ask-hard.md` / `commands/ask-fast.md` | Zero-tax read-only parallel `scouter` fan-out |

*(For `≤ 2` already-known target files in `1` domain with `0` exploration needed, use **Mode A Direct** execution + full CLI/test verification.)*

---

## 🎭 Phase 2: AUTONOMOUS WAVE EXECUTION & BRAIN ARTIFACT CONTRACT

1. **DAG Parallel Fan-Out**: Launch independent shards (`TypeName: "self"`, `Model: "inherit"`) in a single tool batch; await Reactive Async Wakeup (never poll or sleep).
2. **Cohesive Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`, `≤ 500` Lines)**:
   - Write each deliverable (`RESEARCH-*`, `SCOUT-*`, `DESIGN-*`, `PLAN-*`, `REVIEW-*`, `REPORT-*`) as **1 single cohesive file** (never split into `{name}/` folders) to keep the Git working tree 100% clean.
   - **Autonomous Execution `ArtifactMetadata`**: Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }` on autonomous phase deliverables so execution flows uninterrupted without premature "Proceed" prompts.
   - **Approval-Gate `ArtifactMetadata`**: Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` only when the routed workflow explicitly stops for user approval (`/plan:hard`, `/architect`, or `P0/P1` `/review`).
   - **Internal Shard Scratch Files**: Parallel sub-agent scratch outputs must use disjoint filenames and `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`.

---

## 🎭 Phase 3: PERSISTENT E2E VERIFICATION & FINAL SYNTHESIS

Before reporting completion, verify every modified directory and deliverable end-to-end (iteratively fixing any failure via warm `send_message` up to 3 rounds):

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs
```

- [ ] Build, typecheck (`tsc --noEmit`), linter, and test suite pass with `0` regressions
- [ ] Pragmatic 2-Tier Coding Standards met (`0` explicit `any`, `0` leftover debug `console.log`, cohesive files `≤ 450–500` lines)
- [ ] Clickable links to modified files and `<appDataDir>\brain\<conversation-id>\` Brain Artifacts presented in the user's language

---

## COMPLETION

Present the verified final result concisely in the user's language:
1. ✅ **Done** — Summary of completed waves, verification proof, and clickable `[Artifact](file:///...)` links
2. 🔄 **Next** — Recommended follow-up command (`/test:hard`, `/review:team`, `/deploy:check`, or `/save`)
