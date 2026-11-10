---
description: "🔺 Team Fix — 3-Stage Elastic Golden Diamond Resolution (Bidirectional DEBUG Fast-Forward, Fail-First TDD, Sharded Fix Wave & Adversarial QA)"
version: "5.5"
category: debugging
execution-mode: execute
---

# /fix:team — 3-Stage Elastic Golden Diamond Issue Resolution (`v5.5`)

> **MISSION**: Achieve maximum-assurance bug resolution on production-critical, multi-domain, or security-sensitive defects via a **3-Stage Elastic Golden Diamond**: **Stage 1 (`debug-team` SPIE Root-Cause Diamond — auto-skipped when `DEBUG-{issue}.md` already exists!)** → **Stage 2 (Fail-First `RED` Test + Disjoint `≤ 3–4 OWNED_FILES` Fix Wave)** → **Stage 3 (Parallel Adversarial QA, Security & Cross-Engine Critic Verification)**.

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, BIDIRECTIONAL FAST-FORWARD & REFERENCES

1. **Zero Pre-Flight Tax**: Core orchestration laws and the 5-Field Handoff Packet are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** burn Turn 1 reading `CORE.md`, `PHASES.md`, or `_ref/*.md` alone before launching sub-agents — spawn Turn-1 shards via `invoke_subagent(TypeName: "self", Model: "inherit")` and load `commands/_ref/golden-triangle-protocol.md` + `commands/_ref/implementation-loop.md` in parallel!
2. **⚡ BIDIRECTIONAL PRIOR-ARTIFACT FAST-FORWARD (Check First on Turn 1!)**:
   - Inspect `<appDataDir>\brain\<conversation-id>\` (fallback `./reports/{topic}/`) for an existing **`DEBUG-{issue}.md`** (e.g., user clicked **"Proceed"** after `/debug`) or **`REVIEW-{scope}.md`** with P0/P1 defects.
   - **If present**: **SKIP Stage 1 completely!** Reuse the proven root cause and launch **Stage 2** immediately on Turn 1!
3. **Sub-Agent, Warm Reuse & Single-File Cohesion Rules**:
   - Always use `TypeName: "self"`, `Model: "inherit"` (NEVER `TypeName: "research"` or `flash_lite`), record `role#shard -> conversationId`, and run all Round 2/3 debates and targeted fixes via `send_message(Recipient: conversationId)` (max `3` rounds).
   - **Never split deliverables into `{name}/` folders!** Keep `DEBUG-{issue}.md` and `TEST-{issue}.md` as single cohesive files (`≤ 500` lines each, `RequestFeedback: false`); keep shard scratch notes (`DEBUG-{issue}-h{k}.md`) and `MAILBOX-{date}.md` at `UserFacing: false, RequestFeedback: false`.

---

## 💎 STAGE 1: SPIE v3.0 ROOT-CAUSE DIAMOND *(Skipped When `DEBUG-{issue}.md` Exists!)*

| Pillar | Agent Shard(s) (`TypeName: "self"`, `Model: "inherit"`) | Turn-1 Parallel Mission (`Topology A`) |
|--------|---------------------------------------------------------|----------------------------------------|
| **Lead** | `debug-team-techlead` (`agents/teams/debug-team/techlead.md`) | Triage blast radius & frame ranked hypotheses `H1..Hk` in `MAILBOX-{date}.md`. |
| **Executors (`[1..6]`)** | `debugger#h1..k` (`≤ 3–4` suspect files/shard, `READ_ONLY_FILES`: repo code) | Reproduce bug, trace call/state/git-blame paths → write disjoint `DEBUG-{issue}-h{k}.md` (`UserFacing: false`). `debug-team-executor` synthesizes 5-Whys + surgical fix blueprint into **`DEBUG-{issue}.md`** (`≤ 500` lines). |
| **Critic** | `debug-team-reviewer` (`agents/teams/debug-team/reviewer.md`) | Enforce `DBG-G1..G4` (`Correlation ≠ Causation`, repro reliability, blast-radius safety) via warm `send_message` (Round 3 arbitrated by `debug-team-techlead`). |

**Stage 1 Exit**: `✅ CONSENSUS (RCA): debug-team-techlead ✓ | debug-team-executor (h1..k) ✓ | debug-team-reviewer ✓`

---

## 🔨 STAGE 2: FAIL-FIRST REPRODUCTION (`RED`) & SHARDED SURGICAL FIX WAVE (`GREEN`)

Follow `commands/_ref/implementation-loop.md` (`≤ 3–4` disjoint `OWNED_FILES` per shard; existing `tests/**` locked in `READ_ONLY_FILES`):
1. **Contract & Shard Lock**: If `DEBUG-{issue}.md` already specifies disjoint `≤ 3–4` file targets in `1` domain, dispatch directly; if cross-domain contracts change, `tech-lead` locks `SHARED_CONTRACT` + disjoint `OWNED_FILES` shards (or `PLAN-{issue}.md` for `> 6`-file refactors, `RequestFeedback: false`).
2. **Fail-First Reproduction Test (`RED`)**: `tester#repro` (or the owning engineer shard in a dedicated new test file) writes a deterministic test that **FAILS (`RED`)** before the production patch is applied.
3. **Parallel Surgical Fix Shards (`1..6` Domain Engineers)**:
   - Dispatch `database-architect#schema` / `backend-engineer#contracts` (Wave 1, if needed) → parallel `backend-engineer#1..k`, `frontend-engineer#1..k`, `mobile-engineer#1..k` (Wave 2).
   - Enforce **Pragmatic 2-Tier Coding Standards** (`0` explicit `any`, `0` leftover debug `console.log`, typed `try/catch` boundaries, `≤ 400` soft / `≤ 500` hard lines) and verify the reproduction test turns **`GREEN`** + `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` exits `0`.

---

## 🛡️ STAGE 3: ADVERSARIAL QA, SECURITY & CROSS-ENGINE VERIFICATION DIAMOND

Spawn in parallel and converge via warm `send_message` (max `3` rounds in `MAILBOX-{date}.md`):
- **Lead (`tester#lead`) & Executors (`tester#1..k`, `≤ 3–4` test files/shard)**: Execute full unit/integration/E2E regression suites covering the root cause and all blast-radius callers → write cohesive `<appDataDir>\brain\<conversation-id>\TEST-{issue}.md` (`≤ 500` lines, `UserFacing: true, RequestFeedback: false`).
- **Critics (`reviewer` + `security-engineer` when auth/input/DB/infra is touched)**: Audit diff against `DEBUG-{issue}.md` Why 5, verify zero symptom-masking band-aids, zero `READ_ONLY_FILES` trespass, and OWASP / WCAG (`ux_audit.py` if UI changed) compliance.
- **🎼 Optional Cross-Engine Critic (`Author != Critic`)**: When `engines.reviewer = "cross_family"` or after a Round-2 deadlock, run:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<DEBUG-{issue}.md + git diff + test output>"
  ```
- **Persistent Warm Auto-Repair**: Route any test, `boomopen check --strict-phase --no-stubs`, or `[CRITIQUE]` failure ONLY to the owning warm `{engineer#shard}` via `send_message(Recipient: conversationId)` until `100%` green!

**Stage 3 Exit**: `✅ CONSENSUS (Fix & QA): tech-lead ✓ | {engineer#1..N} ✓ | tester#1..k + reviewer (+ security-engineer) ✓`

---

## ✅ COMPLETION TEMPLATE

```markdown
# 💎 Elastic Golden Diamond Fix Report: {issue}

| Stage | Diamond Roster | CLI / Test Gate | Consensus |
|-------|----------------|-----------------|:---------:|
| Stage 1: SPIE Root Cause | debug-team-techlead / debugger#h1..k / debug-team-reviewer | `DBG-G1..G4` | ✅ / FAST-FORWARDED |
| Stage 2: RED → GREEN Fix Wave | tech-lead / {engineer#1..N} (`≤ 3–4` files/shard) | Repro `RED → GREEN` + `check --strict-phase --no-stubs` | ✅ |
| Stage 3: Adversarial QA & Security | tester#1..k + reviewer (+ security-engineer / cross-engine) | Full Suite + Blast-Radius Audit | ✅ |

## Next Actions
1. ✅ **Fixed & Diamond-Verified** — Root cause eliminated (`DEBUG-{issue}.md` + `TEST-{issue}.md`)
2. 🚀 **`/deploy:preview`** → Deploy verified fix to staging
```
