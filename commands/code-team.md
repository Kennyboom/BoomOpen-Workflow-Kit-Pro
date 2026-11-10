---
description: "🔺 Team Code — Elastic Golden Diamond code execution with Turn-1 Fast-Forward, 3-Wave Contract-First Sharding & Parallel Adversarial QA"
version: "5.5"
category: engineering
execution-mode: execute
---

# /code:team — Elastic Golden Diamond Code Implementation

> **MISSION**: Maximum-assurance code implementation through **Elastic Golden Diamond adversarial collaboration** (`1 Tech Lead + N Parallel Shard Executors [1..6] + M Parallel Critics/Testers [1..3]`), featuring **Turn-1 Fast-Forward (`boomopen cook state`)**, **Zero-Middleman `cook packets` Wave Dispatch**, **3-Wave Contract-First Sharding**, and parallel verification.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & ON-DEMAND REFERENCES

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading rule files — inspect state and launch Turn-1 shards immediately via `invoke_subagent(TypeName: "self", Model: "inherit")`, loading `commands/_ref/golden-triangle-protocol.md` and `commands/_ref/implementation-loop.md` on-demand in parallel.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{task}.md` exists (1-Click "Proceed" / Approved-Plan Continuation Gate)** → **Fast-Forward directly to Phase 2 (3-Wave Implementation) with ZERO `tech-lead` Re-Sharding**:
     Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>" [--design "<design-path>"]` (plus `plan compile "<plan-path>"` if `≥ 3` waves or `13+` files) and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1 [--design "<design-path>"]`, then **dispatch Wave 1 executor shards directly on Turn 1!** (**SKIP Phase 1 Scope & Sharding AND skip redundant `tech-lead` re-partitioning** — `tech-lead` is invoked only for dispute arbitration or contract amendments!)
   - **2. `DESIGN-{task}.md` exists (no `PLAN` yet)** → Extract `DESIGN_CONTRACT` via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and lock it into Phase 1 `SHARED_CONTRACT` + **2-Wave Frontend Sharding**.
   - **3. `SCOUT-{task}.md` or `RESEARCH-{task}.md` exists** → Reuse existing codebase map in Phase 1 without re-spawning `scouter`.

---

## 📁 DELIVERABLE FILES & MAILBOX PROTOCOL (CLEAN GIT TREE)

> **Cohesive Deliverable Rule (`<= 500` lines)**: Write transient deliverables (`REVIEW-{task}.md`, `MAILBOX-{date}.md`) to `<appDataDir>\brain\<conversation-id>\` (`ArtifactMetadata: { Summary, UserFacing: true, RequestFeedback: false }` on `REVIEW-{task}.md`; `UserFacing: false, RequestFeedback: false` on `MAILBOX-{date}.md`; NEVER split into `{name}/` folders).

| Phase | Required Input | Deterministic CLI Gate | Output Deliverable |
|-------|----------------|------------------------|--------------------|
| **Phase 1: Scope & Sharding Diamond** | User request *(Skipped if `PLAN-{task}.md` exists!)* | — | `SHARED_CONTRACT` + Disjoint `OWNED_FILES` (`≤ 3–4`/shard) in `MAILBOX-{date}.md` |
| **Phase 2: 3-Wave Implementation** | Validated `PLAN-{task}.md` or Phase 1 Scope | `boomopen cook verify-wave "<plan-path>" --wave <W> --git --run-verify` | Source Code + `[x]` in `PLAN-{task}.md` + `MAILBOX-{date}.md` |
| **Phase 3: Wave 3 Verification Diamond** | Wave 1–2 Code Changes | `boomopen check <dir> --strict-phase --no-stubs` + `ux_audit.py` | `<appDataDir>\brain\<conversation-id>\REVIEW-{task}.md` (`<= 300` lines) |

**Mailbox Entry Header (`MAILBOX-{date}.md`)**:
`## [{TIMESTAMP}] {TASK_ASSIGNMENT | SUBMISSION | REVIEW | DEFENSE | RESUBMISSION | APPROVAL | ESCALATION | ARBITRATION | DECISION} | {role#shard} → {target}`

---

## 💎 PHASE 1: SCOPE ANALYSIS & CONTRACT SHARDING DIAMOND *(Skipped When `PLAN-{task}.md` Exists)*

| Role | Agent (`TypeName: "self"`, `Model: "inherit"`) | Mission |
|------|------------------------------------------------|---------|
| **Tech Lead** | `tech-lead` (`agents/tech-lead.md`) | Lock compilable `SHARED_CONTRACT` (+ `DESIGN_CONTRACT` if `DESIGN-{task}.md` exists) and partition target files into **Wave 1 (Foundation)** → **Wave 2 (Parallel Feature Shards, `≤ 3–4 OWNED_FILES`/shard)**. |
| **Executor** | `scouter` (or `scouter#1..k`, `agents/scouter.md`) | Map exact files to create/modify, schemas, tokens, and caller blast radius *(skipped if `SCOUT-{task}.md` exists)*. |
| **Critic** | `reviewer` (`agents/reviewer.md`) | Challenge scope completeness, zero `OWNED_FILES` overlap, and **2-Wave Frontend Sharding** when `> 3` UI files change. |

**Consensus**: `✅ CONSENSUS (Scope): tech-lead ✓ | scouter ✓ | reviewer ✓`

---

## 💎 PHASE 2: 3-WAVE CONTRACT-FIRST IMPLEMENTATION (`commands/_ref/implementation-loop.md`)

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

1. **Wave 1 — Foundation, Schema & Shared Primitives Lock**:
   - Extract packets via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1` (or Phase 1 `TASK_ASSIGNMENT`) and spawn `database-architect#schema`, `backend-engineer#contracts`, and `frontend-engineer#tokens-primitives` (`globals.css` `@theme inline` + shared UI primitives) concurrently (`TypeName: "self"`, `Model: "inherit"`). Record `role#shard -> conversationId`.
   - Gate Wave 1: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify`.
2. **Wave 2 — Parallel Feature Shards (`1..6` Concurrent Executors, `≤ 3–4 OWNED_FILES`/Shard)**:
   - Extract packets via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2` (auto-locking Wave 1 contracts/tokens & sibling shards' files in `READ_ONLY_FILES`).
   - Dispatch `backend-engineer#api-1..k`, `frontend-engineer#screen-1..k`, `mobile-engineer#1..k`, or `game-engineer#1..k` **100% concurrently in one turn** (2-Wave Frontend Sharding keeps `globals.css` & `components/ui/*` read-only during Wave 2).
   - Critic (`reviewer`, plus `security-engineer` when auth/data/API touched) audits each shard submission and runs `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2 --git --run-verify`.
   - Route any `[CRITIQUE]` or gate failure via warm `send_message` **only** to the flagged `{role#shard}` `conversationId` (max 3 rounds; `tech-lead` arbitrates Round-3 disputes).

**Consensus**: `✅ CONSENSUS (Implementation): tech-lead ✓ | {executor#1..N} ✓ | {reviewer#1..M} ✓`

---

## 💎 PHASE 3 (WAVE 3): PARALLEL CROSS-STACK VERIFICATION & SECURITY DIAMOND

> **⚡ Parallel Distinct-Role Verification (Never `tester → tester` Self-Review!)**: Spawn Test Executors and Adversarial Critics **concurrently in one wave** with independent sign-off.

| Role | Agent Shard(s) (`TypeName: "self"`, `Model: "inherit"`) | Mission |
|------|---------------------------------------------------------|---------|
| **Parallel Test Executors (`[1..3]`)** | `tester` (or `tester#unit-int` + `tester#e2e` when `> 4` test files, `agents/tester.md`) | Write and execute deterministic tests covering all `AC1..N`, error contracts, and edge cases (`≤ 3–4` test files/shard). |
| **Parallel Adversarial Critics (`[1..2]`)** | `reviewer` (`agents/reviewer.md`) + `security-engineer` (`agents/security-engineer.md`) *(+ optional Cross-Engine `boomopen conduct dispatch --role reviewer --engine cross_family --prompt "<diff-and-contract>"`)* | Audit test completeness, OWASP/auth safety, `SHARED_CONTRACT` / `DESIGN_CONTRACT` alignment, and zero regressions. |
| **Coordinator & Arbitrator (`[1]`)** | `tech-lead` (`agents/tech-lead.md`) | Enforce deterministic CLI & UI gates, route any defects to warm `{executor#shard}` sessions via `send_message`, and synthesize `<appDataDir>\brain\<conversation-id>\REVIEW-{task}.md` (`<= 300` lines, `RequestFeedback: false`). |

**Mandatory Repo & Portable UI Gates (Must Exit `0` Before Consensus)**:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
```
Whenever UI/frontend files were touched:
```bash
python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
```

**Consensus**: `✅ CONSENSUS (Verification): tech-lead ✓ | tester#1..k ✓ | reviewer + security-engineer ✓`

---

## ✅ COMPLETION

```markdown
# 🔺 Elastic Golden Diamond Code Report: {task}

| Phase | Diamond Roster | CLI Gate | Consensus |
|-------|----------------|----------|:---------:|
| P1: Scope & Sharding | tech-lead / scouter / reviewer | — | ✅ / FAST-FORWARDED |
| P2: Waves 1–2 Coding | {executor#1..N} / reviewer (+ tech-lead arbitration) | `cook verify-wave` | ✅ |
| P3: Wave 3 QA & Security | tech-lead / tester#1..k / reviewer + security-engineer | `check --strict-phase` + `ux_audit.py` | ✅ |

- **Verification Artifact**: `<appDataDir>\brain\<conversation-id>\REVIEW-{task}.md`
- **Mailbox Log**: `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md`

## Next Actions
1. ✅ **Done** — Code complete and diamond-validated
2. 🚀 **Deploy** → `/deploy:preview`
3. 📝 **Docs** → `/docs:core`
```
