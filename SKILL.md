---
name: boomopen-workflow-kit
description: BoomOpen Workflow Kit (v5.5 Antigravity 2.0 Smart-Hybrid Edition) — Pragmatic 2-Tier Coding Standards, 17-Language Natural-Language Workflow Router, Multi-Session Autonomous Project Autopilot (.boomopen/project-ledger.json), Cross-Engine Conductor & Multi-Engine Council (boomopen conduct), 4-Tier Dynamic Elastic Swarm Sharding (<= 3-4 OWNED_FILES per sub-agent shard), Quality-First Model Policy (Model inherit / Pro High default), DAG Parallel Fan-Out, Direct Plan-to-Executor Dispatch, Scoped Warm Sub-agent Reuse (role#shard -> conversationId via send_message), Contract-First File Ownership Locks, Brain Artifact routing, Elastic Golden Diamond / Triangle teams, and 22 core + 1,440 library skills (1,462 indexed in compact-index.json).
version: "5.5.0"
---

# ⚡ BoomOpen Workflow Kit (v5.5.0 — Antigravity 2.0 Smart-Hybrid & Elastic Swarm Edition)

> **PURPOSE**: Root skill entry point for the BoomOpen Workflow Kit Smart-Hybrid multi-agent orchestration framework (`~/.{TOOL}/skills/boomopen-workflow-kit/SKILL.md`).

---

## 📊 v5.5.0 Architecture Snapshot

| Subsystem | Canonical Inventory | Location |
|-----------|---------------------|----------|
| **Specialist Agents** | **`21` specialist agents** (`planner`, `tech-lead`, `backend-engineer`, `frontend-engineer`, `database-architect`, `mobile-engineer`, `game-engineer`, `designer`, `researcher`, `scouter`, `brainstormer`, `debugger`, `tester`, `reviewer`, `security-engineer`, `performance-engineer`, `devops-engineer`, `docs-manager`, `business-analyst`, `project-manager`, `reporter`) | `agents/*.md` |
| **Adversarial Teams** | **`18` specialist Golden Diamond / Golden Triangle teams (`72` team files)** including `backend-team`, `brainstorm-team`, `database-team`, `debug-team`, `design-team`, `devops-team`, `docs-team`, `frontend-team`, `fullstack-team`, `game-team`, `mobile-team`, `performance-team`, `planning-team`, `project-team`, `qa-team`, `report-team`, `research-team`, `security-team` | `agents/teams/*/` |
| **Workflow Commands** | **`84` flat command & reference files** across 32 slash commands & 17 natural-language intents | `commands/**/*.md` |
| **Skill Ecosystem** | **`22` core skills + `1,440` library skills (`1,462` indexed in `compact-index.json`)** | `skills/` + `skills_library/` + `matrix-skills/compact-index.json` |
| **Core Rules** | **`7` on-demand Mode B rule specs** (`<= 300` lines each) | `rules/{CORE,AGENTS,PHASES,TEAMS,SKILLS,ERRORS,REFERENCE}.md` |
| **Deterministic CLI** | **`12` zero-dependency Node.js CLI subcommands** (install, governance, artifact compilers & multi-engine council) | `cli/install.js` (`boomopen`) |

---

## 🚦 Proactive Sub-agent First Gate & 4-Tier Dynamic Elastic Swarm

### 🚫 Anti-Solo-Crawling & Cognitive Load Sharding Law (MANDATORY)
- If the exact target files are **NOT already known on Turn 1**, OR if a task requires exploring/auditing/reading **`> 2 files`** across the codebase, **NEVER crawl files sequentially in the primary agent!** **IMMEDIATELY spawn parallel subagents on Turn 1** so the parent context window stays 100% clean.
- **Cognitive Load Sharding Law (`MAX 3–4 Heavy Files or 1 Deep Vector per Sub-Agent`)**:
  $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
  - **Tier 0 — Micro Direct (`0` sub-agents)**: `≤ 2` already-known files, `1` domain, `0` exploration, no `/cmd`, no workflow intent.
  - **Tier 1 — Focused Triad (`2–3` parallel sub-agents)**: `3–5` files or `2` domains/vectors.
  - **Tier 2 — Elastic Swarm (`4–6` parallel sub-agents)**: `6–12` files, `3–4` domains, or `4–5` research/audit vectors.
  - **Tier 3 — Hyper-Swarm (`7–10+` parallel sub-agents, up to `execution.maxParallelSubagents`)**: `13+` files, repo-wide audits, or multi-module overhauls (horizontally sharded so each sub-agent owns `≤ 3–4` files).

### 🎻 MODE B — Explicit `/cmd` & 17-Language Natural-Language Workflow Orchestration (Tiers 1–3)
- **When ANY of the following is true**:
  1. User explicitly invokes a BoomOpen workflow command (`/cook`, `/autopilot`, `/conduct`, `/fix`, `/plan:hard`, `/brainstorm:team`, `/review:team`, `/docs:core`, `/orchestrate`, etc.).
  2. User speaks in natural language (without typing `/cmd`) across **any of the 17 supported languages** (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it` + semantic match) expressing a structured workflow intent (`Plan`, `Design UI/UX`, `Research`, `Brainstorm`, `Review/Audit`, `Debug`, `Fix`, `Test`, `Build Feature End-to-End / Cook`, `Approved-Plan Execution / Code`, `Multi-Session Project Autopilot`, `Cross-Engine Conductor / Multi-Engine Council`, `Docs`, `Report`, `Deploy`) — see [`skills/intelligent-routing/SKILL.md`](./skills/intelligent-routing/SKILL.md).
  3. Task spans **`> 2 files`** or **`≥ 2 domains`** (e.g., Database + Backend + Frontend + Security), or requires **Elastic Golden Diamond** review (`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`).
- **Turn-1 Instant Dispatch Action**: Never bypass `commands/{cmd}-{variant}.md` with unguided ad-hoc sub-agents when a workflow intent matches! Read `commands/{cmd}.md` AND launch Phase 1 subagent shards (`TypeName: "self"`, `Model: "inherit"`) or `boomopen conduct` in the **same Turn-1 tool batch**, using **DAG-Aware Parallel Fan-Out**, **Direct Plan-to-Executor Dispatch**, **Contract-First Parallel Handoffs (`SHARED_CONTRACT` + disjoint `OWNED_FILES` `≤ 3–4` files/shard)**, and **Scoped Warm Sub-agent Reuse (`role#shard -> conversationId` via `send_message`)**.

### 🚀 Ad-Hoc Codebase Q&A Fan-Out (Without `/cmd` — Pure Lookup Only)
- Strictly reserved for open-ended codebase Q&A / file lookups across `> 2` files (*"where is X defined?"*, *"how does module Y work?"*) that do **NOT** match any structured workflow intent above: spawn read-only scouters (`TypeName: "research"`, `Role: "scouter#shard-1..N"`, `Model: "inherit"`) with `0` mandatory `.md` report clutter.

### ⚡ MODE A — Known-Target Micro-Direct (Tier 0 — `≤ 2 Known Files`, `1 Domain`, 0 Exploration Needed, No `/cmd`)
- **When**: Strictly for simple factual Q&A, code explanations, or micro-edits where the **exact 1–2 target files are already known on Turn 1**, AND no `/cmd` or structured workflow intent was invoked.
- **Action**: Primary agent executes, tests, and verifies directly while enforcing **Pragmatic 2-Tier Coding Standards** and **Persistent Testing & Bug Fixing**.

---

## 🧠 Quality-First Model Policy (`Model: "inherit"` / Pro High Default)

- **Default (`Model: "inherit"` / Pro High)**: Mandatory for all core engineering, planning, architecture, scouting, debugging, testing, reviewing, security, design, and documentation tasks.
- **Trivial Chores Only (`Model: "flash"` — Latest Flash High)**: Permitted **ONLY** for trivial mechanical chores (raw log aggregation, simple list formatting, status ping). When in doubt, ALWAYS use `Model: "inherit"`.
- **Forbidden (`flash_lite`)**: **NEVER use `flash_lite`**.

---

## 🛠️ Deterministic CLI Suite (`boomopen` — All 12 Subcommands)

Invoke via `boomopen <subcommand>` (when linked) or `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js <subcommand>`:

| CLI Subcommand | Key Operations & Gates | Purpose |
|----------------|------------------------|---------|
| `install` | `install <cursor\|copilot\|antigravity\|claude\|codex\|--all> [--with-hooks]` | SHA-256 manifest-backed installer (run from kit git clone) |
| `uninstall` | `uninstall <tool\|--all>` | Clean removal preserving user-created & user-modified files |
| `list` | `list` | Inspect installed platforms, versions, and tracked manifest counts |
| `doctor` | `doctor [--platform <tool>] [--source-only] [--rebuild-index]` | Read-only health check, Markdown line-limit audit & `compact-index.json` builder |
| `check` | `check [dir] [--strict-phase] [--no-stubs] [--ignore <glob>]` | Pragmatic 2-Tier static code & anti-stub/anti-test-gaming auditor |
| `settings` | `settings [status\|get\|set\|mode\|preset\|sync\|reset\|ui\|--ui]` | Manage `~/.boomopen/settings.json`, `./.boomopen.json`, or launch Web Control Center |
| `research` | `research <validate\|brief> <file> [--mode research\|brainstorm] [--out <f>]` | 4-Gate validator (`RES-G1..G4`) & `HANDOFF_BRIEF` extractor for `RESEARCH` / `BRAINSTORM` |
| `design` | `design <validate\|contract> <file> [--out <f>] [--json]` | 4-Gate UI spec validator (`DESIGN-G1..G4`) & `DESIGN_CONTRACT` token/props compiler |
| `plan` | `plan <validate\|compile> <file> [--sync-ledger]` | 5-Gate implementation plan validator (`PLAN-G1..G5`) & Plan-to-Ledger compiler |
| `cook` | `cook <state\|packets\|verify-wave\|preflight>` | Fast-forward artifact state detector, wave packet compiler & Post-Wave `COOK-G1..G4` verifier |
| `ledger` | `ledger <init\|from-plan\|validate\|status\|next\|verify\|audit>` | Multi-session `.boomopen/project-ledger.json` phase ratchet & RTM spec completeness auditor |
| `conduct` | `conduct <probe\|dispatch\|council\|status>` | Cross-engine CLI orchestrator & parallel Multi-Engine Council consensus runner |

---

## 📂 Brain Artifacts, Multi-Session Autopilot Ledger & Cross-Engine Conductor

- Default transient deliverables (`PLAN`, `DESIGN`, `RESEARCH`, `BRAINSTORM`, `SCOUT`, `DEBUG`, `TEST`, `REVIEW`, `REPORT`, `MAILBOX`, `COUNCIL`, `SESSION-HANDOVER`) are written to `<appDataDir>\brain\<conversation-id>\` so they render in the Antigravity UI Artifact pane and keep the Git working tree 100% clean.
- Multi-session `/autopilot` projects persist their immutable **Spec-to-Phase Ledger** in `.boomopen/project-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and `.boomopen/ROADMAP-PROGRESS.md`, verified via `boomopen ledger` and `boomopen check --strict-phase --no-stubs`.
- Cross-engine `/conduct` workflows orchestrate across installed CLI platforms (`claude`, `codex`, `antigravity`, `copilot`, `cursor`) via `boomopen conduct <probe|dispatch|council|status>` and store council syntheses in `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md`.

---

## 📚 Core Architecture & Rules (`rules/` — Load On Demand in Mode B)

| Rule File | Purpose | When to Load |
|-----------|---------|--------------|
| [`rules/CORE.md`](./rules/CORE.md) | 17-Language Workflow Gate, 4-Tier Dynamic Elastic Swarm, Orchestration Laws, Model Policy | On-demand in Mode B |
| [`rules/AGENTS.md`](./rules/AGENTS.md) | `21` Specialist Agents, Cognitive Load Sharding (`≤ 3–4` files/shard), Warm Reuse (`role#shard`) | Before delegating to specialist subagents |
| [`rules/PHASES.md`](./rules/PHASES.md) | DAG-Aware Parallel Fan-Out, Multi-Session `/autopilot` & 4-Layer Phase Ratchet, `/conduct` Phases | When running multi-phase workflows |
| [`rules/TEAMS.md`](./rules/TEAMS.md) | `18` Elastic Golden Diamond Teams (`72` files) & Cross-Engine Conductor (`boomopen conduct`) | When executing `:team` or `/conduct` variants |
| [`rules/SKILLS.md`](./rules/SKILLS.md) | Fast 2-Step Progressive Skill Lookup (`<skills>` → `compact-index.json` 22 core + 1,440 library = 1,462 indexed skills) | When resolving domain skills for complex tasks |
| [`rules/ERRORS.md`](./rules/ERRORS.md) | Self-healing, Error Classification (`E0` warm auto-revive – `E4`), Anti-Patterns (`A1`–`A12`) | When errors or protocol violations occur |
| [`rules/REFERENCE.md`](./rules/REFERENCE.md) | Quick lookup tables for 14 Multilingual Workflows, CLI gates, Agents, and Deliverable paths | Fast reference |

---

## 🎯 Workflow Commands (`commands/` — 84 Files)

| Command | Router File | Variants |
|---------|-------------|----------|
| `/cook` | [`commands/cook.md`](./commands/cook.md) | `fast`, `hard`, `team` (`boomopen cook state\|packets\|verify-wave`) |
| `/code` | [`commands/code.md`](./commands/code.md) | `fast`, `hard`, `team` (Direct Plan-to-Executor Dispatch) |
| `/plan` | [`commands/plan.md`](./commands/plan.md) | `fast`, `hard`, `team` (`boomopen plan validate\|compile`) |
| `/design` | [`commands/design.md`](./commands/design.md) | `fast`, `hard`, `team` (`boomopen design validate\|contract`) |
| `/research` | [`commands/research.md`](./commands/research.md) | `fast`, `hard`, `team` (`boomopen research validate\|brief`) |
| `/brainstorm` | [`commands/brainstorm.md`](./commands/brainstorm.md) | `fast`, `hard`, `team` (`brainstorm-team` + `research --mode brainstorm`) |
| `/fix` | [`commands/fix.md`](./commands/fix.md) | `fast`, `hard`, `team` |
| `/debug` | [`commands/debug.md`](./commands/debug.md) | `fast`, `hard`, `team` |
| `/test` | [`commands/test.md`](./commands/test.md) | `fast`, `hard`, `team` |
| `/review` | [`commands/review.md`](./commands/review.md) | `fast`, `hard`, `team` |
| `/docs` | [`commands/docs.md`](./commands/docs.md) | `core`, `business`, `audit` |
| `/deploy` | [`commands/deploy.md`](./commands/deploy.md) | `check`, `preview`, `production`, `rollback` |
| `/report` | [`commands/report.md`](./commands/report.md) | `fast`, `hard`, `team` |
| `/ask` | [`commands/ask.md`](./commands/ask.md) | `fast`, `hard` |
| `/autopilot` | [`commands/autopilot.md`](./commands/autopilot.md) | `init`, `run`, `audit` (Multi-Session Spec-to-Phase Ledger via `boomopen ledger`) |
| `/conduct` | [`commands/conduct.md`](./commands/conduct.md) | `council`, `pipeline` (Cross-Engine Conductor & Multi-Engine Council via `boomopen conduct`) |
| `/orchestrate` | [`commands/orchestrate.md`](./commands/orchestrate.md) | Custom multi-agent domain & shard orchestration |
| `/save` / `/recap` | [`commands/save.md`](./commands/save.md) / [`commands/recap.md`](./commands/recap.md) | Infinite session memory & context recovery (`SESSION-HANDOVER.md`) |
| `/settings` | [`commands/settings.md`](./commands/settings.md) | Unified Settings & Control Center (`ask_question` UI, CLI & `--ui` Web Dashboard) |
