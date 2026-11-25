# 🎭 PHASES

> **VERSION**: 5.5 — Frontier-Guardrails & Smart-Hybrid Edition | **LOAD**: On-demand when running Mode B workflow phases | **PURPOSE**: 17-Language Intent Gate (`36` base commands / `93` files), **5-Stage Fast-Forward State Machine (`boomopen cook state`)**, **3-Wave + Wave 2.5 Reconciliation Execution Topology (`boomopen cook` + `boomopen reconcile`)**, **5-Layer Phase Quality Ratchet (`G5 ledger verify --reconcile --strict-locks` LAST + `rollback`)**, Antigravity `run_workflow` Fan-Out (`platforms/antigravity/workflows/*.py`), Cross-Engine Conductor (`boomopen conduct`), & Scoped Warm Reuse (`role#shard`)

---

## REQUIREMENTS INTAKE, 17-LANGUAGE INTENT GATE & 5-STAGE FAST-FORWARD STATE MACHINE

### 1. Deterministic 5-Stage Fast-Forward State Machine (`boomopen cook state`)
Before spawning any sub-agent in `/cook`, `/code`, `/plan`, or `/design`, inspect existing Brain Artifacts (`<appDataDir>\brain\<conversation-id>\` or `./reports/{topic}/`) via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state` and fast-forward to the earliest incomplete stage:

| Stage | State Check (`boomopen cook state`) | Fast-Forward Action (Zero Redundant Turns) |
|:-----:|-------------------------------------|--------------------------------------------|
| **Stage 1: Discovery** | `SCOUT-{task}.md` + `RESEARCH-{task}.md` / `BRAINSTORM-{task}.md` exist (& pass `boomopen research validate`)? | **SKIP** `scouter#1..k` + `researcher#1..k`; extract compact context via `boomopen research brief <file.md>` and advance to Stage 2/3! |
| **Stage 2: UI/UX Design** | `DESIGN-{task}.md` exists & passes `boomopen design validate`? | **SKIP** `designer` / `design-team`; extract `DESIGN_CONTRACT` via `boomopen design contract <design.md>` for Stage 3! |
| **Stage 3: Planning** | Approved `PLAN-{task}.md` exists & passes `boomopen plan validate`? | **SKIP** discovery, design, and `/plan`! When user clicks **"Proceed"** (`RequestFeedback: true`) or says *"ok, em làm đi"* / *"proceed"*, jump straight to **Stage 4**! |
| **Stage 4: 3-Wave Code** | Emit shard packets via `boomopen cook packets "<plan.md>" --wave <W>` | Execute **Wave 1 (Contracts/Schema/Tokens)** $\rightarrow$ **Wave 2 (Parallel Feature Shards)**, gated by `boomopen cook verify-wave "<plan.md>" --wave <W> --git --run-verify`! |
| **Stage 5: Parallel QA** | Code waves verified (`check --strict-phase --no-stubs` = PASS) | Fan out `tester#1..k` + `reviewer#1..m` (+ `ux_audit.py` / `accessibility_checker.py`) **in parallel**; route fixes via warm `send_message`. |

- **17-Language Natural-Language Workflow Gate**: Speaking naturally across any of the 17 BoomOpen languages (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it` + semantic match) automatically loads `commands/{cmd}-{variant}.md` on Turn 1 (never downgrade to unguided ad-hoc sub-agents!).

### 2. Parse ALL requirements into Registry (100% Fidelity — Zero Omissions)

```markdown
### 📋 Requirements Registry
| ID | Requirement | Priority | Shard / Domain | Status |
|----|-------------|----------|----------------|--------|
| R1 | {extracted} | {H/M/L} | `{role#shard}` | ⏳ |
```

---

## ⚡ 3-WAVE CONTRACT-FIRST EXECUTION TOPOLOGY & ELASTIC SWARM SHARDING (v5.5)

Compute parallel sub-agent shards dynamically via the **Cognitive Load Sharding Law (`MAX 3–4 Heavy Files or 1 Deep Vector per Sub-Agent`)**:

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

| Swarm Tier | Scope / File & Vector Count | Parallel Sub-Agents | Wave Fan-Out Strategy |
|------------|-----------------------------|:-------------------:|-----------------------|
| **Tier 0 — Micro Direct** | `≤ 2` known files, `1` domain, `0` exploration, no `/cmd`, no workflow intent | **`0` (Mode A)** | Execute, test, and verify directly without phase overhead. |
| **Tier 1 — Focused Triad** | `3–5` files OR `2` domains/vectors | **`2–3` sub-agents** | Single-wave parallel fan-out across 2–3 roles/vectors. |
| **Tier 2 — Elastic Swarm** | `6–12` files, `3–4` domains, OR `4–5` vectors | **`4–6` sub-agents** | Horizontal role sharding (`role#shard-1..N`, `≤ 3–4 OWNED_FILES` each). |
| **Tier 3 — Hyper-Swarm** | `13+` files, repo-wide audits, OR multi-module overhauls | **`7–10+` sub-agents** *(up to `maxParallelSubagents`)* | Multi-shard horizontal fan-out across all modules (`scouter#1..N`, `engineer#1..N`, `critic#1..M`). |

### 🏗️ Canonical 3-Wave Contract-First Implementation Topology (`Stage 4` & `Stage 5`)
1. **Wave 1 — Foundation, Schema, Contracts & UI Tokens (`Parallelizable: Yes`, Disjoint `<= 3–4 OWNED_FILES`)**:
   - `database-architect#schema`: Locks additive SQL/ORM schemas, RLS, indexes, and reversible `UP`/`DOWN` migrations (`schema_validator.py`).
   - `backend-engineer#contracts`: Locks shared TypeScript DTOs, Zod/OpenAPI v3.1 schemas, and typed HTTP error envelopes.
   - `frontend-engineer#tokens-primitives`: Translates `DESIGN_CONTRACT` (`boomopen design contract`) into `globals.css` (`@theme inline` OKLCH tokens) and shared UI primitives (`components/ui/*`).
   - **Wave 1 Gate**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan.md>" --wave 1 --git --run-verify` before starting Wave 2!
2. **Wave 2 — Parallel Feature & Screen Shards (`Depends On: Wave 1`, `Parallelizable: Yes`)**:
   - Emit exact 5-Field Handoff Packets via `boomopen cook packets "<plan.md>" --wave 2` (with Wave 1 schemas, DTOs, `globals.css`, `components/ui/*`, and existing regression tests locked in `READ_ONLY_FILES`!).
   - Fan out `backend-engineer#api-1..k` + `frontend-engineer#screen-1..k` + `mobile-engineer#1..k` + `game-engineer#1..k` + `devops-engineer#ci` **concurrently in one turn**, then run `boomopen cook verify-wave "<plan.md>" --wave 2 --git --run-verify` (`boomopen check <dir> --strict-phase --no-stubs`).
3. **Wave 2.5 — Spec-to-Code Reconciliation & Delta Auto-Completion (`boomopen reconcile` + `cook amend-plan`)**:
   - Run `boomopen reconcile <dir> --plan "<plan.md>" --strict` + sharded `spec-reconciler#1..k` (`commands/_ref/reconcile-loop.md`) to catch island shards (`REC-G1`), frontend/backend route mismatches (`REC-G2`), omitted `[SC-*]` sub-clauses (`REC-G3`), and missing `.env.example` keys (`REC-G4`); if `RECONCILE_DELTA` is non-empty, amend a Delta Wave via `boomopen cook amend-plan` and execute immediately!
4. **Wave 3 — Parallel Testing, Accessibility & Adversarial Review (`Depends On: Wave 2.5`, `Parallelizable: Yes`)**:
   - Fan out `tester#1..k` (`<= 3–4` test files/shard) + `reviewer#1..m` (+ `security-engineer#sec`, `ux_audit.py`, `accessibility_checker.py`, `api_validator.py`) **in parallel**.
   - Route any defect ONLY to the owning warm `role#shard` session via `send_message(Recipient: conversationId)` (`0s` cold-start latency).

> ⚠️ **Turn-1 Zero-Tax Rule**: Never waste Turn 1 reading `CORE.md` + `PHASES.md` + `AGENTS.md` before spawning subagents, and **NEVER use `TypeName: "research"`** when a sub-agent needs `search_web`, `run_command`, or `write_file` (`SCOUT-*.md` / `RESEARCH-*.md` / `BRAINSTORM-*.md`) — always use `TypeName: "self", Model: "inherit"`!

---

## 🏛️ MULTI-SESSION AUTOPILOT (`/autopilot`), 🛡️ WHOLE-PROJECT AUDIT (`/audit`) & 🎼 CONDUCTOR (`/conduct`)

1. **Autopilot Ledger (`.boomopen/project-ledger.json` — `boomopen ledger`)**:
   - **Init / Compile**: Compile an approved `PLAN-{task}.md` via `boomopen ledger from-plan <plan.md>` (or `boomopen plan validate <plan.md> --sync-ledger`), or ingest multi-doc specs via parallel `scouter#doc-1..N` + `boomopen ledger validate`.
   - **5-Layer Phase Quality Ratchet (`/autopilot:run` — `G5` RUNS LAST!)**: Load active Phase $K$ slice via `boomopen ledger next` (prior `test_files` locked in `READ_ONLY_FILES`, automatic pre-phase git checkpoint recorded), execute Elastic Golden Diamond waves, and enforce **in strict order**: **(G1)** `boomopen check --strict-phase --no-stubs` (+ `cook verify-wave`), **(G2)** monotonic cumulative test/build suite $\text{Passed}(P_K) \ge \text{Passed}(P_{K-1}) + |\text{REQ}(P_K)|$, **(G3)** Wave 2.5 `boomopen reconcile --strict` + `spec-reconciler` (`0` island modules, route mismatches, or omitted `[SC-*]` clauses), **(G4)** adversarial spec & security review (`Author != Critic`: `reviewer` + `tester` + `security-engineer`), and **(G5 — RUNS LAST!)** `boomopen ledger verify --phase <Phase_K_ID> --passed-tests <N> --run-verify --reconcile --strict-locks` (recover failed attempts cleanly via `boomopen ledger rollback --yes`).
2. **Stateful Multi-Round Whole-Project Audit (`.boomopen/audit-ledger.json` — `boomopen audit` / `/audit`)**:
   - Post-completion audit loop across 22 specialist agents: `audit init` $\rightarrow$ `audit slice` (4 parallel lenses: RTM Spec Completeness, Vertical Flow Continuity, 2-Layer Security/Anti-Leakage, Code Quality; runnable via `platforms/antigravity/workflows/audit_fanout.py` on Antigravity `run_workflow`) $\rightarrow$ `audit record` $\rightarrow$ user approval (`audit approve`) $\rightarrow$ pre-fix git checkpoint + sharded fixes + `audit verify-fix` monotonic test ratchet (or `boomopen audit rollback --yes` on regression) until `0` `P0/P1` blockers remain.
3. **Presets, Lifecycle Commands & Cross-Engine Conductor (`boomopen conduct`)**:
   - **Presets (`/settings`)**: `frontier-guardrails` (Default Recommended; `carbon-guardrails` Antigravity alias), `smart-hybrid`, `solo-fast`, `deep-architect`, and `adversarial-team`; **36 Base Commands (`93` files = `87` workflows + `6` `_ref/`)** including `/onboard`, `/pr` (`/pr:review`), and `/release`.
   - Probe via `boomopen conduct probe`, then run **Multi-Engine Council** (`boomopen conduct council --task <type> --engines claude,codex,antigravity --prompt "<task>"` $\rightarrow$ 4-Part `COUNCIL-SYNTHESIS.md`) or **Cross-Engine Pipeline** (`boomopen conduct dispatch --role <role> --author-engine <prev> --prompt "<task>"`, enforcing `Author != Critic` and Round-2 Cross-Engine Debug Escalation).

---

## PHASE OUTPUT FORMAT, BRAIN ARTIFACTS & NATIVE "PROCEED" BUTTON (`RequestFeedback`)

```markdown
## 🎭 Wave / Phase {N}: {name} (Swarm Tier {1|2|3} — {K} Parallel Shards)
### Sub-agent: `{role#shard}` (`Model: inherit`, `Session: new | reused`) — {mission}
{shard summary — Owned Files (≤ 3–4): {list} | CLI verify-wave / check --strict-phase --no-stubs: PASS}
### ✅ `{role#shard}` complete — **Deliverable**: {summary & Brain Artifact link}
```

- **Brain Artifacts First (Clean Git Tree)**: Transient deliverables (`BRAINSTORM`, `RESEARCH`, `SCOUT`, `DESIGN`, `PLAN`, `DEBUG`, `TEST`, `REVIEW`, `REPORT`, `MAILBOX`, `COUNCIL`) default to `<appDataDir>\brain\<conversation-id>\` (`./reports/{topic}/` only on non-Antigravity tools or explicit export).
- **Cohesive Single-File Rule (`<= 500` lines)**: Keep `RESEARCH-{topic}.md`, `BRAINSTORM-{topic}.md`, `DESIGN-{task}.md`, `PLAN-{task}.md`, `TEST-{task}.md`, and `REVIEW-{task}.md` as **1 cohesive single file (`<= 500` lines)** — NEVER shatter deliverables into `{name}/` folders at `150` lines!
- **Native Antigravity 2.0 "Proceed" Button (`ArtifactMetadata.RequestFeedback`)**:
  - Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` on standalone **`RESEARCH-{topic}.md`**, **`BRAINSTORM-{topic}.md`**, **`DESIGN-{task}.md`**, **`PLAN-{task}.md`**, standalone **`DEBUG-{issue}.md`** (1-click `"Proceed"` $\rightarrow$ `/fix`), and defect-bearing **`TEST-{task}.md`** / **`REVIEW-{task}.md`** artifacts (validated via `boomopen research validate`, `boomopen design validate`, and `boomopen plan validate` where applicable) so Antigravity 2.0 renders the native 1-click **"Proceed"** button.
  - Set `RequestFeedback: false` on clean `TEST`/`REVIEW` reports, `REPORT`, `DESIGN-PREVIEW-*.html`, and auto-continuing `/cook` stages; set `UserFacing: false, RequestFeedback: false` on intermediate discovery/shard scratch notes (`SCOUT-*.md`, `*-v{k}.md`, `*-s{k}.md`, `*-h{k}.md`, internal `COUNCIL-*.md`, `MAILBOX-{date}.md`).
- **2-Step Skill Lookup**: (1) Check pre-loaded `<skills>` first; (2) Query `~/.{TOOL}/skills/boomopen-workflow-kit/matrix-skills/compact-index.json` (`1,462` indexed skills: `22` core + `1,440` library).
