---
description: "🔺 Team Feature — Elastic Golden Diamond feature lifecycle with Turn-1 Fast-Forward, 3-Wave Contract-First Execution & Parallel Adversarial QA"
version: "5.5"
category: engineering
execution-mode: execute
---

# /cook:team — Elastic Golden Diamond End-to-End Feature Development

> **MISSION**: Maximum-assurance end-to-end feature development through **Elastic Golden Diamond adversarial collaboration** (`1 Tech Lead + N Parallel Shard Executors [1..6] + M Parallel Critics/Testers [1..3]`), powered by the **Turn-1 Fast-Forward State Machine (`boomopen cook state`)**, **3-Wave Contract-First Execution (`boomopen cook packets` + `verify-wave`)**, and zero-stub CLI verification.

<feature>$ARGUMENTS</feature>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & REFERENCES

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — launch the active stage **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` and load `commands/_ref/golden-triangle-protocol.md` + `commands/_ref/implementation-loop.md` on-demand in parallel.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{feature}.md` exists (Approved-Plan Gate)** → **Fast-Forward directly to Stage 4 (3-Wave Implementation)**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1 [--design "<design-path>"]` and **dispatch Wave 1 executor shards directly on Turn 1 without a redundant `tech-lead` re-sharding hop!**
   - **2. `DESIGN-{feature}.md` exists (no `PLAN` yet — Approved-Design Gate)** → **Fast-Forward to Stage 3 (Planning Diamond)**: Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and invoke `planner` directly.
   - **3. `SCOUT-{feature}.md` or `RESEARCH-{feature}.md` exists (no `DESIGN`/`PLAN` yet)** → **Fast-Forward past Stage 1 (Discovery Diamond)**.

---

## 📁 DELIVERABLE FILES (BRAIN ARTIFACTS FIRST — SINGLE COHESIVE FILES `<= 500` LINES)

> **Cohesive Single-File Rule (`<= 500` lines)**: Keep `RESEARCH-{feature}.md`, `SCOUT-{feature}.md`, `DESIGN-{feature}.md`, `PLAN-{feature}.md`, and `REVIEW-{feature}.md` as single cohesive files in `<appDataDir>\brain\<conversation-id>\` (`RequestFeedback: false` on all artifacts during autonomous `/cook:team`; NEVER split into `{name}/` folders).

| Stage | Brain Artifact Deliverable (`<appDataDir>\brain\<conversation-id>\`) | Deterministic CLI Gate |
|-------|----------------------------------------------------------------------|------------------------|
| **Stage 1: Discovery Diamond** | `SCOUT-{feature}.md` + `RESEARCH-{feature}.md` *(Skipped if present)* | — |
| **Stage 2: UI/UX Design Diamond** | `DESIGN-{feature}.md` *(Skipped if no UI or already approved)* | `boomopen design validate "<design-path>"` |
| **Stage 3: 3-Wave Planning Diamond** | `PLAN-{feature}.md` (+ `.boomopen/project-ledger.json` if `≥ 3` waves / `13+` files) | `boomopen plan validate "<plan-path>" [--sync-ledger]` |
| **Stage 4: 3-Wave Implementation** | Source Code + `[x]` in `PLAN-{feature}.md` + `MAILBOX-{date}.md` | `boomopen cook verify-wave "<plan-path>" --wave <W> --git --run-verify` |
| **Stage 5: Wave 3 Verification Diamond** | Unified `REVIEW-{feature}.md` (`<= 300` lines, test + security + review proof) | `boomopen check <dir> --strict-phase --no-stubs` + `ux_audit.py` |

---

## 💎 STAGE 1: PARALLEL DISCOVERY, CODEBASE SCOUT & RESEARCH DIAMOND *(Skipped If Present)*

| Governance Pillar | Agent Shard(s) (`TypeName: "self"`, `Model: "inherit"`) | Mission |
|-------------------|---------------------------------------------------------|---------|
| **Lead Pillar (`[1]`)** | `researcher#lead` (`agents/researcher.md`) | Decompose feature requirements, codebase survey modules, and technical/UX vectors in `MAILBOX-{date}.md`. |
| **Parallel Executors (`[2..6]`)** | • `scouter#1..k` (`agents/scouter.md`, `≤ 3–4` modules/shard)<br>• `researcher#1..k` (`agents/researcher.md`, `1` vector/shard) | • **`scouter#1..k`**: Map architecture, DB schemas, CSS/Tailwind tokens, reusable components, and blast radius (`SCOUT-{feature}.md`).<br>• **`researcher#1..k`**: Evaluate patterns, `1,462` skills, and `python ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "<query>" --design-system` when UI is needed (`RESEARCH-{feature}.md`). |
| **Critic Pillar (`[1..2]`)** | `brainstormer#critic` + `tech-lead#feasibility` | Challenge missed requirements, edge cases, and over-engineering (max 2 warm `send_message` rounds). |

**Consensus**: `✅ CONSENSUS (Discovery): researcher#lead ✓ | scouter+researcher ✓ | brainstormer+tech-lead ✓`

---

## 💎 STAGE 2: CONDITIONAL UI/UX DESIGN DIAMOND *(Skip If No UI or `DESIGN-{feature}.md` Exists)*

- *(Database schema changes are folded directly into Stage 3 `PLAN-{feature}.md` **Wave 1 (`database-architect#schema`)** — never run a duplicate pre-planning DB stage!)*
- If UI is needed and `DESIGN-{feature}.md` does not exist:
  - **Lead**: `design-team-techlead` (`agents/teams/design-team/techlead.md`) locks Named Aesthetic Archetype & OKLCH palette.
  - **Executor**: `design-team-executor` (`agents/teams/design-team/executor.md`) authors the cohesive **6-Block `DESIGN-{feature}.md`** (`<= 500` lines, OKLCH `@theme inline`, 5-State Matrix, WCAG 2.2 AA, and fenced `DESIGN_CONTRACT`).
  - **Critic**: `design-team-reviewer` (`agents/teams/design-team/reviewer.md`) runs `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<design-path>"` and audits `DESIGN-G1..G4`.
- Extract locked contract for Stage 3: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"`.
- **Consensus**: `✅ CONSENSUS (Design): design-team-techlead ✓ | design-team-executor ✓ | design-team-reviewer ✓`

---

## 💎 STAGE 3: CONTRACT-FIRST 3-WAVE PLANNING DIAMOND *(Skip If `PLAN-{feature}.md` Exists)*

| Governance Pillar | Agent (`TypeName: "self"`, `Model: "inherit"`) | Mission |
|-------------------|------------------------------------------------|---------|
| **Executor** | `planner` (`agents/planner.md`) | Read `RESEARCH` + `SCOUT` (+ `DESIGN_CONTRACT`) → write cohesive **6-Block `PLAN-{feature}.md`** (`<= 500` lines) structured into **Wave 1 (Foundation Lock)** → **Wave 2 (Parallel Feature Shards `≤ 3–4` files/shard)** → run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>" [--sync-ledger]`. |
| **Critics** | `tech-lead#arch` + `security-engineer#sec` | Audit compilable `SHARED_CONTRACT` (DB migrations + DTOs + `DESIGN_CONTRACT`), disjoint `OWNED_FILES` (`≤ 3–4`/shard), additive DB rollback safety, and **2-Wave Frontend Sharding** (`Wave 1: frontend-engineer#tokens-primitives` → `Wave 2: frontend-engineer#screen-1..k`). |

**Consensus**: `✅ CONSENSUS (Planning): tech-lead#arch ✓ | planner ✓ | security-engineer#sec ✓`

---

## 💎 STAGE 4: 3-WAVE CONTRACT-FIRST IMPLEMENTATION (`commands/_ref/implementation-loop.md`)

> **⚡ Zero Middleman Re-Sharding**: Because `PLAN-{feature}.md` already passed `boomopen plan validate`, do **NOT** run an extra `tech-lead` re-sharding turn! Extract deterministic 5-Field Handoff Packets directly via `boomopen cook packets` and invoke `tech-lead` solely for dispute arbitration or contract amendments.

1. **Wave 1 — Foundation, Schema & Shared Primitives Lock**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1` and dispatch `database-architect#schema`, `backend-engineer#contracts`, and `frontend-engineer#tokens-primitives` in parallel (`TypeName: "self"`, `Model: "inherit"`).
   - Gate Wave 1: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify`.
2. **Wave 2 — Parallel Feature Shards (`1..6` Concurrent Executors, `≤ 3–4 OWNED_FILES`/Shard)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2` (auto-locking Wave 1 contracts/tokens & sibling shards' files in `READ_ONLY_FILES`) and dispatch `backend-engineer#api-1..k`, `frontend-engineer#screen-1..k`, and `mobile-engineer#1..k` **in parallel in the same turn**.
   - Gate Wave 2: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2 --git --run-verify` (route any fixes via warm `send_message` to `role#shard -> conversationId`).
3. **Wave 2.5 — Spec-to-Code Reconciliation & Self-Completion (`commands/_ref/reconcile-loop.md`)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile <dir> --plan "<plan-path>" --strict --json` and spawn `spec-reconciler` (`agents/spec-reconciler.md`) to verify zero island shards (`REC-G1`), `/api/...` route parity (`REC-G2`), `[SC-*]` sub-clause coverage (`REC-G3`), `.env.example` parity (`REC-G4`), and reverse `30%–70%` spec coverage.
   - Whenever `RECONCILE_DELTA` reports `gaps[]`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook amend-plan "<plan-path>" --from-reconcile "<reconcile-path>"` and execute `Wave 2.5` delta shards (`tech-lead#wiring-1` / `backend-engineer#wiring-1` / `frontend-engineer#wiring-1` / `{role}#delta-1..k`, up to `3` rounds) until `0` gaps remain.

---

## 💎 STAGE 5 (WAVE 3): PARALLEL CROSS-STACK VERIFICATION & ADVERSARIAL REVIEW DIAMOND

| Role | Agent Shard(s) (`TypeName: "self"`, `Model: "inherit"`) | Mission |
|------|---------------------------------------------------------|---------|
| **Parallel Test Executors (`[1..3]`)** | `tester#unit-int`, `tester#e2e` (`agents/tester.md`) | Write and execute tests across 100% of `AC1..N` and edge cases (`≤ 3–4` test files/shard). |
| **Parallel Adversarial Critics (`[1..2]`)** | `reviewer` (`agents/reviewer.md`) + `security-engineer` (`agents/security-engineer.md`) *(+ optional `boomopen conduct dispatch --role reviewer --engine cross_family --prompt "<diff-and-contract>"`)* | Audit `SHARED_CONTRACT` / `DESIGN_CONTRACT` alignment, OWASP security, and run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` + portable `python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>` + `accessibility_checker.py <project_path>` (when UI changed). |
| **Arbitrator & Sign-Off (`[1]`)** | `tech-lead` (`agents/tech-lead.md`) | Route any test/critic blockers to warm `{executor#shard}` sessions via `send_message` (max 3 rounds), update `[x]` in `PLAN-{feature}.md`, and stamp unified `REVIEW-{feature}.md` (`<= 300` lines, `RequestFeedback: false`). |

**Consensus**: `✅ CONSENSUS (Verification): tech-lead ✓ | tester#1..k ✓ | reviewer + security-engineer ✓`

---

## ✅ COMPLETION TEMPLATE

```markdown
# 🔺 Elastic Golden Diamond Feature Report: {feature}

| Stage | Diamond Roster | CLI Gate | Status |
|-------|----------------|----------|:------:|
| Stage 1: Discovery | researcher#lead / scouter#1..k + researcher#1..k / brainstormer | — | ✅ / FAST-FORWARDED |
| Stage 2: UI Design | design-team-techlead / design-team-executor / design-team-reviewer | `design validate` | ✅ / FAST-FORWARDED |
| Stage 3: 3-Wave Plan | planner / tech-lead#arch + security-engineer#sec | `plan validate` | ✅ / FAST-FORWARDED |
| Stage 4: Waves 1–2 Code | {executor#1..N} (Direct `cook packets` dispatch) | `cook verify-wave` | ✅ |
| Stage 5: Wave 3 QA & Audit | tech-lead / tester#1..k / reviewer + security-engineer | `check --strict-phase` + `ux_audit.py` | ✅ |

## Next Actions
1. ✅ **Done** — Feature complete and diamond-validated
2. 🚀 `/deploy:preview` → Deploy to staging
3. 📝 `/docs:core` → Update project documentation
```
