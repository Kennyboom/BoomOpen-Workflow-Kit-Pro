---
description: "⚙️ Implementation Loop — 3-Wave Contract-First Execution, boomopen cook Packet/Wave Gates & Warm Session Reuse protocol"
version: "5.5"
type: reference
---

# ⚙️ 3-Wave Contract-First Implementation Loop (`v5.5` — `boomopen cook` Packets, Wave Gates & Warm Session Reuse)

> **REFERENCED BY**: `cook-team.md` (Stage 4), `code-team.md` (Phase 2), `fix-team.md` (Phase 3)
> **CRITICAL**: Never bottleneck multi-file or fullstack implementation through a single sequential executor or a redundant `tech-lead` re-sharding hop when a validated `PLAN` already exists. Shard work by the **Cognitive Load Sharding Law (`≤ 3–4` files per sub-agent)**, materialize shared contracts in **Wave 1**, execute feature shards concurrently in **Wave 2**, and reuse warm sessions (`send_message` by `conversationId`) across all review/fix rounds.

---

## 🛑 STEP 0: VALIDATED-PLAN FAST-PATH vs. AD-HOC SCOPE BRIEFING

Before writing ANY code, check whether an approved `PLAN-{feature}.md` already exists:

1. **⚡ Validated-Plan Fast-Path (`PLAN-{feature}.md` Exists — ZERO `tech-lead` Re-Sharding Hop)**:
   - Run deterministic preflight & packet compilation directly:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1 [--design "<design-path>"]
     ```
   - **Skip spawning `tech-lead` to re-partition shards!** `boomopen cook packets` already validates `PLAN-G1..G5` and generates ready-to-send **5-Field Handoff Packets** with cross-shard `READ_ONLY_FILES` locks automatically computed. Invoke `tech-lead` **only** if a Round-3 `[ESCALATION]` or contract amendment occurs.
2. **Ad-Hoc Scope Path (No `PLAN-{feature}.md` — e.g. `/code:team` Phase 1 Scope or `/fix:team` `DEBUG-{issue}.md`)**:
   - `tech-lead` locks compilable `SHARED_CONTRACT` (plus `DESIGN_CONTRACT` via `boomopen design contract "<design-path>"` if `DESIGN-*.md` exists) and partitions target files into disjoint `≤ 3–4 OWNED_FILES` shards in `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md` (`RequestFeedback: false`):
     $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
3. **Active Sub-Agent Session Registry (`Spawn Once, Reuse Many`)**:
   - Spawn each `{role#shard}` executor and critic (`TypeName: "self"`, `Model: "inherit"`, NEVER `flash_lite`) **once** and record `role#shard -> conversationId`.
   - Communicate all subsequent wave tasks, review critiques, and targeted fixes via `send_message(Recipient: conversationId, Message: ...)` (`0s` cold-start latency, `100%` retained file context).

---

## 🌊 3-WAVE CONTRACT-FIRST EXECUTION TOPOLOGY

### WAVE 1 — FOUNDATION, SCHEMA & SHARED PRIMITIVES LOCK (`Parallelizable: Yes`)
Whenever a task spans DB migrations, shared API/DTO contracts, or `> 3` UI files across multiple screens, materialize shared foundation files **first** so Wave 2 shards never collide or drift:
- **`database-architect#schema`**: Additive schema & migrations (`≤ 3–4 OWNED_FILES`).
- **`backend-engineer#contracts`**: Shared TypeScript/Zod DTOs, OpenAPI/RPC signatures, and error envelopes (`src/types/contracts.ts`, `src/lib/errors.ts`).
- **`frontend-engineer#tokens-primitives`** *(2-Wave Frontend Sharding Rule)*: Tailwind v4 `@theme inline` OKLCH variables (`globals.css`) and shared CVA/Radix UI primitives (`src/components/ui/*`) from `DESIGN_CONTRACT`.
- **Deterministic Wave 1 Gate**:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify
  ```

### WAVE 2 — HIGH-VELOCITY PARALLEL FEATURE SHARDS (`1..6` Concurrent Executors in ONE Turn)
- Generate Wave 2 packets (automatically locking Wave 1 contracts/tokens and sibling shards' `OWNED_FILES` inside each shard's `READ_ONLY_FILES`):
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 2
  ```
- **Dispatch `backend-engineer#api-1..k`, `frontend-engineer#screen-1..k`, and `mobile-engineer#1..k` concurrently in the same turn** — NEVER serialize backend and frontend when Wave 1 contracts/tokens are compiled on disk and `OWNED_FILES` are disjoint!
- Each `{role#shard}` modifies **ONLY** its `OWNED_FILES` (`≤ 3–4` files), runs its task `Verify` command + `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <owned_path> --strict-phase --no-stubs`, and reports completion.
- **Deterministic Wave 2 Gate**:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 2 --git --run-verify
  ```

### WAVE 2.5 — SPEC-TO-CODE RECONCILIATION & SELF-COMPLETION (`commands/_ref/reconcile-loop.md`)
- Before launching Wave 3 QA, eliminate unwired island shards (`REC-G1`), frontend/backend `/api/...` route mismatches (`REC-G2`), uncited `[SC-*]` sub-clauses (`REC-G3`), and missing `.env.example` keys (`REC-G4`):
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile <dir> --plan "<plan-path>" --strict --json
  ```
- Spawn `spec-reconciler` (`agents/spec-reconciler.md`) to run the reverse `30%–70%` middle-slice spec audit. Whenever `gaps[]` exist, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook amend-plan "<plan-path>" --from-reconcile "<reconcile-path>"` and execute `Wave 2.5` delta/wiring shards (`integrator#wiring-1..k` / `{role}#delta-1..k`, up to `3` rounds) until `reconcile --strict` reports **`0` gaps**.

### WAVE 3 — PARALLEL CROSS-STACK VERIFICATION & ADVERSARIAL REVIEW (`1..3` Critics + Testers)
- Spawn `tester#1..k` (`agents/tester.md`) AND `reviewer` (`agents/reviewer.md`, plus `security-engineer` when auth/data/API is touched, or Cross-Engine `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "..."` when configured) **concurrently in one wave**.
- Run full repo strict check and (whenever UI files were modified) portable Python UX & WCAG 2.2 AA scripts:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
  python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
  python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
  ```
- Critics audit 5 mandatory gates: (1) `PLAN` & `SHARED_CONTRACT` / `DESIGN_CONTRACT` compliance + zero `OWNED_FILES` trespass, (2) Correctness & 5-state UI resilience, (3) OWASP & auth security, (4) N+1 & rendering performance, (5) Pragmatic 2-Tier quality (`0` `any`, `0` stubs/TODOs, `≤ 400` soft / `≤ 500` hard lines).

---

## 🔄 TARGETED WARM FIX & STOP-AND-ESCALATE PROTOCOL (MAX 3 ROUNDS)

1. **Targeted Warm Auto-Repair**: If `cook verify-wave`, tests, `ux_audit.py`, or `[CRITIQUE]` fails, send exact `file:line` diagnostics via `send_message` **ONLY** to the flagged `{role#shard}` `conversationId`s in parallel (unflagged shards stay idle). Re-run `cook verify-wave` / `check --strict-phase --no-stubs` after revision.
2. **Round-3 Binding Arbitration**: If an Executor vs. Critic dispute remains unresolved after `3` rounds, `tech-lead` evaluates empirical test/benchmark evidence and records a binding `ARBITRATION` + `✅ CONSENSUS` stamp in `MAILBOX-{date}.md`.
3. **Contract Escalation Guard**: If any shard discovers `SHARED_CONTRACT` requires a breaking change, **STOP immediately** (never edit `READ_ONLY_FILES`), post `[ESCALATION]` to `MAILBOX-{date}.md`, let `tech-lead` amend `SHARED_CONTRACT`, and broadcast the delta to sibling warm shards via `send_message`.
