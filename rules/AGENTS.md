# 🤖 AGENTS

> **VERSION**: 5.5 — Antigravity 2.0 Smart-Hybrid Edition | **LOAD**: When delegating to agents in Mode B | **PURPOSE**: Dynamic Elastic Swarm Sharding, 3-Wave Contract-First Execution, Quality-First Model Policy, Scoped Warm Sub-agent Reuse (`role#shard`) & File Ownership Locks (`21` Specialist Agents + `18` Teams)

---

## 🧠 QUALITY-FIRST MODEL POLICY (PRO HIGH DEFAULT — MANDATORY)

> **CRITICAL USER CONSTRAINT**: All core work **MUST follow the user's selected model (`Model: "inherit"` / Pro High)** to prevent any drop in quality.

| Model Setting | Permitted Scope | Enforcement |
|---------------|-----------------|-------------|
| **`Model: "inherit"`** (or `"pro"` — User's Pro High model) | **ALL 21 specialist agents** on engineering, architecture, planning, codebase scouting, debugging, testing, reviewing, security, performance, design, research, ideation, and documentation tasks | **MANDATORY DEFAULT**: Always use `Model: "inherit"` whenever reasoning, code generation, analysis, or review is involved. |
| **`Model: "flash"`** (Latest Flash High) | **Trivial mechanical chores ONLY** (raw log aggregation, simple list formatting, status ping) | Permitted *strictly* when zero architectural or coding judgment is involved. When in doubt, ALWAYS use `Model: "inherit"`. |
| **`Model: "flash_lite"`** | **NONE** | **⛔ STRICTLY FORBIDDEN**: Never use `flash_lite` in BoomOpen workflows. |

---

## ⚡ INTELLIGENT WORK DISTRIBUTION & COGNITIVE LOAD SHARDING (v5.5)

### 1. Cognitive Load Sharding Law (`MAX 3–4 Heavy Files or 1 Deep Vector per Sub-Agent`)
Never overload a single sub-agent with `> 4` heavy implementation files or multiple orthogonal research vectors:

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

When a domain spans `> 4` files or multiple vectors, horizontally shard the role (`backend-engineer#contracts`, `backend-engineer#auth`, `frontend-engineer#tokens-primitives`, `frontend-engineer#screen-1..k`, `researcher#v1..k`), each locked to **`≤ 3–4` disjoint `OWNED_FILES`** (or `1` disjoint scratch vector file `*-v{k}.md`).

### 2. Direct Plan-to-Executor Dispatch & 3-Wave Contract-First Topology (No Middleman Double-Hop)
- **Once `PLAN-{feature}.md` passes `boomopen plan validate`** in `:fast`, `:hard`, `:team`, or `/orchestrate`, extract exact wave packets via `boomopen cook packets "<plan.md>" --wave <W>` and **dispatch directly from `PLAN` to sharded specialists**:
  - **Wave 1 (Foundation/Contracts/Tokens)**: `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives` (`globals.css` `@theme inline` + `components/ui/*` from `DESIGN_CONTRACT`).
  - **Wave 2 (Parallel Feature Shards)**: `backend-engineer#1..k` + `frontend-engineer#screen-1..k` + `mobile-engineer#1..k` + `game-engineer#1..k` + `devops-engineer#ci` (with Wave 1 contracts/tokens locked in `READ_ONLY_FILES`), gated by `boomopen cook verify-wave "<plan.md>" --wave 2 --git --run-verify`.
  - **Wave 3 (Parallel QA & Adversarial Audit)**: `tester#1..k` + `reviewer#1..m` + `security-engineer#sec` running concurrently.
- **DO NOT** waste a turn spawning a middleman `tech-lead` just to re-read and re-shard an already CLI-validated `PLAN-{feature}.md`! Invoke `tech-lead` strictly when scoping an unplanned `:team` task, designing ADRs, or arbitrating `:team` review disputes.

### 3. Active Sub-agent Session Registry (`role#shard → conversationId`) & Warm Reuse
Record every spawned sub-agent's scoped key `role#shard -> conversationId` in the **Active Sub-agent Session Registry**:
```yaml
active_subagents:
  database-architect#schema: "<conversation-id-1>"
  backend-engineer#contracts: "<conversation-id-2>"
  backend-engineer#auth: "<conversation-id-3>"
  frontend-engineer#tokens-primitives: "<conversation-id-4>"
  frontend-engineer#screen-billing: "<conversation-id-5>"
  tester#integration: "<conversation-id-6>"
  reviewer#code: "<conversation-id-7>"
```
- **Warm Session Reuse Rule (0s Cold-Start, 100% Context Retained)**: For follow-up tasks in the same shard, fix-after-review/test iterations, or `:team` debate rounds, **MUST call `send_message(Recipient: conversationId, Message: ...)`** targeting that exact `role#shard` — NEVER cold re-spawn a duplicate sub-agent!

---

## 📦 STRUCTURED HANDOFF PACKET & FILE OWNERSHIP LOCK

Every `invoke_subagent` prompt or `send_message` brief in Mode B (generated automatically by `boomopen cook packets "<plan.md>" --wave <W>`) **MUST** include these 5 fields:

```yaml
1. MISSION & ACCEPTANCE CRITERIA:
   - Exact shard ID (`role#shard`), task ID(s), and Given/When/Then criteria from PLAN-{feature}.md.
2. SHARED_CONTRACT (Required when ≥ 2 shards or domains run in parallel):
   - Locked API DTOs/Zod schemas, SQL DDL, and `DESIGN_CONTRACT` (`@theme inline` CSS + TS Props).
3. OWNED_FILES (Write Permitted — Strictly ≤ 3–4 heavy files per sub-agent shard):
   - Explicit disjoint list of files (or disjoint vector note `*-v{k}.md`) this sub-agent shard is authorized to create or modify.
4. READ_ONLY_FILES (Do Not Edit):
   - Wave 1 contracts, `globals.css`, `components/ui/*`, sibling shards' files, and locked regression `tests/**`.
5. VERIFICATION & DELIVERABLE:
   - Domain validators (`ux_audit.py`, `api_validator.py`, `schema_validator.py`, `boomopen research|design|plan validate`), tests, `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs`, and Brain Artifact path (`<appDataDir>\brain\<conversation-id>\`).
```

---

## 🔀 4-TIER DYNAMIC ELASTIC SWARM MATRIX & NATIVE DISPATCH RULES

- **🚫 Anti-Solo-Crawling Rule**: Whenever target files are unknown on Turn 1 or exploration spans **`> 2 files`**, **NEVER crawl sequentially in the primary agent** — spawn parallel sub-agent shards on Turn 1!
- **⚡ `TypeName: "self"` (Default for ALL Mode B Shards)**: `invoke_subagent(TypeName: "self", Role: "<role>#<shard>", Model: "inherit", Prompt: ...)` grants `write_file`, `run_command`, and `search_web` immediately on Turn 1.
- **⚠️ `TypeName: "research"` Restriction (`0-Artifact Ad-Hoc Q&A ONLY`)**: Has **NO `search_web`, NO `run_command`, and NO `write_file`**. Use **ONLY** for read-only codebase Q&A where zero files are written — **NEVER** use `TypeName: "research"` for `researcher`, `research-team`, `brainstorm-team`, or any Mode B `scouter` writing `SCOUT-*.md`!
- **Join & Wave Verification**: Wait via **Reactive Async Wakeup** (never poll), then verify each wave via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan.md>" --wave <W> --git --run-verify` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs`.
- **TIER 2 Fallback (Tool Missing/Error Only)**: Log `"⚠️ TIER 2: {reason}"`, read `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{agent}.md`, embody `📋 EMBODIED: {agent}`, and enforce all 5-field locks and `--strict-phase --no-stubs` gates.

---

## AGENT CATEGORIES (21 Specialist Agents — Default `Model: "inherit"`)

| Category | Agents | Write Tools | Default Model | Purpose |
|----------|--------|:-----------:|:-------------:|---------|
| **meta** | `tech-lead`, `planner` | `true` (plans/mailboxes) | `inherit` | Architecture, 6-Block `PLAN` & shard allocation, `:team` arbitration (never write app code) |
| **execution** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect` | `true` | `inherit` | 3-Wave Contract-First sharded implementation (`≤ 3–4 OWNED_FILES` per shard) |
| **validation** | `tester`, `reviewer`, `security-engineer`, `performance-engineer`, `debugger` | `true`/`false` | `inherit` | Sharded QA (`tester#1..k`), adversarial auditing, root-cause debugging |
| **research** | `researcher`, `scouter`, `brainstormer`, `designer` | `true` (artifacts) | `inherit` | Multi-vector research, codebase mapping, grounded ideation, 6-Block `DESIGN` specs (`NO APPLICATION CODE`) |
| **support** | `docs-manager`, `devops-engineer`, `business-analyst`, `project-manager`, `reporter` | `true` | `inherit` | Documentation suites, sharded CI/CD & IaC, requirements, reporting |

---

## 💎 AGENT TEAMS — ALL 18 ELASTIC GOLDEN DIAMOND TEAMS (`agents/teams/*`)

> **LOAD**: `TEAMS.md` for full protocol (`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`, reusing warm `role#shard -> conversationId` sessions via `send_message`).

| Domain (`18` Teams) | Lead Pillar (`[1]`) | Executor Pillar (`[1..6 Shards]`) | Critic / QA Pillar (`[1..3 Critics]`) | Use When |
|---------------------|---------------------|-----------------------------------|---------------------------------------|----------|
| `backend-team` | `tech-lead` | `backend-engineer#contracts` (W1) $\rightarrow$ `backend-engineer#1..N` (W2) | `reviewer#code` (+ `security-engineer#sec`) | APIs, server logic, sharded backend modules |
| `frontend-team` | `tech-lead` | `frontend-engineer#tokens-primitives` (W1) $\rightarrow$ `frontend-engineer#screen-1..N` (W2) | `reviewer#ui` (+ `tester#e2e`) | UI components, `DESIGN_CONTRACT` screens |
| `fullstack-team` | `tech-lead` | **W1**: `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives` $\rightarrow$ **W2**: `backend-engineer#1..N` + `frontend-engineer#screen-1..M` | `reviewer#code` + `security-engineer#sec` + `tester#1..K` | End-to-end 3-Wave Contract-First features |
| `database-team` | `tech-lead` | `database-architect#schema` + `database-architect#queries` | `reviewer#schema` + `performance-engineer#query` | Schema design, reversible migrations, tuning |
| `research-team` | `researcher#lead` (V1) | `researcher#vector-2..N` + `scouter#codebase` | `researcher#adversarial` (Fact-checker) | Multi-vector deep research (`boomopen research validate`) |
| `brainstorm-team` | `brainstorm-team-techlead` | `scouter#1..k` + `researcher#1..k` (S1) $\rightarrow$ `brainstorm-team-executor (brainstormer#opt-1..k)` (S2 — **NO APP CODE!**) | `brainstorm-team-reviewer (tech-lead#premortem)` | 2-Stage grounded ideation & `BRAINSTORM` (`boomopen research validate`) |
| `planning-team` | `planning-team-techlead` | `scouter#1..k` + `researcher#1..k` (S1) $\rightarrow$ `planning-team-executor` (`planner#1..k`, S2) | `planning-team-reviewer` (+ `security-engineer#sec` + `business-analyst#ac`) | 2-Stage 6-Block `PLAN` (`boomopen plan validate`) |
| `design-team` | `design-team-techlead` | `scouter#ui-tokens` + `researcher#ux` (S1) $\rightarrow$ `design-team-executor` (`designer#spec-1..k`, S2 — **NO APP CODE!**) | `design-team-reviewer` (+ `frontend-engineer#feasibility`) | 2-Stage 6-Block `DESIGN` (`boomopen design validate`) |
| `qa-team` | `tester#lead` | `tester#unit` + `tester#integration` + `tester#e2e` | `security-engineer#sec` + `performance-engineer#perf` | Parallel test suites & anti-gaming verification |
| `debug-team` | `debugger#lead` | `debugger#hyp-1..N` + `backend-engineer#fix` | `reviewer#root-cause` + `tester#regression` | Multi-hypothesis root cause analysis & fix |
| `devops-team` | `devops-engineer` | `devops-engineer#iac` + `devops-engineer#ci` | `security-engineer#devsecops` | CI/CD, IaC, containers, zero-downtime deploy |
| `security-team` | `security-engineer#lead` | `security-engineer#audit-1..N` + `backend-engineer#fix` | `reviewer#pentest` | OWASP/STRIDE audit & vulnerability remediation |
| `game-team` | `tech-lead` | `game-engineer#ecs-contracts` (W1) $\rightarrow$ `game-engineer#1..N` (W2) | `reviewer#arch` + `performance-engineer#60fps` | Real-time ECS, WebGPU/3D, physics, netcode |
| `mobile-team` | `tech-lead` | `mobile-engineer#tokens-navigation` (W1) $\rightarrow$ `mobile-engineer#screen-1..N` (W2) | `reviewer#platform-ux` + `tester#mobile` | iOS 18, Android M3 Expressive, RN, Flutter |
| `performance-team` | `performance-engineer` | `backend-engineer#opt` + `frontend-engineer#opt` | `reviewer#benchmarks` | Profiling, optimization, load testing |
| `docs-team` | `docs-manager` | `researcher#shard-1..N` + `docs-manager#writer` | `reviewer#accuracy` | Technical writing, API & architecture docs |
| `project-team` | `project-manager` | `business-analyst#req-1..N` | `tech-lead#feasibility` | Project planning, risk, delivery |
| `report-team` | `reporter` | `scouter#metrics-1..N` | `reviewer#data-accuracy` | Status reports, metrics, analytics |
