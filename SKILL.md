---
name: boomopen-workflow-kit
description: BoomOpen Workflow Kit (v5.5 Frontier-Guardrails & Smart-Hybrid Edition) — frontier-guardrails default preset (carbon-guardrails alias), Pragmatic 2-Tier Coding Standards, 36 base commands (93 command files = 87 workflows + 6 _ref) including /onboard, /pr (/pr:review), and /release, 17-Language Workflow Router, Multi-Session Project Autopilot (.boomopen/project-ledger.json with 5-Layer Phase Ratchet & ledger/audit rollback), Cross-Engine Conductor & Multi-Engine Council (boomopen conduct), Antigravity run_workflow Python templates, 4-Tier Dynamic Elastic Swarm Sharding (<= 3-4 OWNED_FILES per shard), Quality-First Model Policy (Model inherit default), E0-E6 Error Recovery & A1-A14 Anti-Patterns, and 22 core + 1,440 library skills (1,462 indexed in compact-index.json).
version: "5.5.0"
---

# ⚡ BoomOpen Workflow Kit (v5.5.0 — Frontier-Guardrails & Elastic Swarm Edition)

> **PURPOSE**: Root skill entry point for the BoomOpen Workflow Kit multi-platform orchestration & deterministic guardrails framework (`~/.{TOOL}/skills/boomopen-workflow-kit/SKILL.md`).

---

## 📊 v5.5.0 Architecture Snapshot

| Subsystem | Canonical Inventory | Location |
|-----------|---------------------|----------|
| **Specialist Agents** | **`22` specialist agents** (`planner`, `tech-lead`, `backend-engineer`, `frontend-engineer`, `database-architect`, `mobile-engineer`, `game-engineer`, `designer`, `researcher`, `scouter`, `brainstormer`, `debugger`, `tester`, `reviewer`, `spec-reconciler`, `security-engineer`, `performance-engineer`, `devops-engineer`, `docs-manager`, `business-analyst`, `project-manager`, `reporter`) | `agents/*.md` |
| **Adversarial Teams** | **`18` specialist Golden Diamond / Golden Triangle teams (`72` team files)** including `backend-team`, `brainstorm-team`, `database-team`, `debug-team`, `design-team`, `devops-team`, `docs-team`, `frontend-team`, `fullstack-team`, `game-team`, `mobile-team`, `performance-team`, `planning-team`, `project-team`, `qa-team`, `report-team`, `research-team`, `security-team` | `agents/teams/*/` |
| **Workflow Commands** | **`93` flat command & reference files** (`87` workflows + `6` `_ref/`) across **`36` base slash commands** (`/onboard`, `/pr`, `/pr:review`, `/release`, `/cook`, `/autopilot`, `/audit`, `/conduct`, etc.) & 17 natural-language intents | `commands/**/*.md` |
| **Built-In Presets** | **`frontier-guardrails` (Default Recommended)** + `carbon-guardrails` (Antigravity alias) + `smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team` | `cli/settings-schema.js` (`/settings`) |
| **Antigravity Workflows** | **`3` executable `run_workflow` Python orchestration templates** (`audit_fanout.py`, `review_fanout.py`, `research_fanout.py`) | `platforms/antigravity/workflows/*.py` |
| **Skill Ecosystem** | **`22` core skills + `1,440` library skills (`1,462` indexed in `compact-index.json`)** | `skills/` + `skills_library/` + `matrix-skills/compact-index.json` |
| **Core Rules** | **`7` on-demand Mode B rule specs** (`<= 300` lines each; `E0–E6` error recovery & `A1–A14` anti-patterns) | `rules/{CORE,AGENTS,PHASES,TEAMS,SKILLS,ERRORS,REFERENCE}.md` |
| **Deterministic CLI** | **`14` zero-dependency Node.js CLI subcommands** (install, governance, artifact compilers, Wave 2.5 reconcile, multi-round audit, `ledger/audit rollback` & multi-engine council) | `cli/install.js` (`boomopen`) |

---

## 🚦 Presets, Proactive Sub-agent Gate & 4-Tier Dynamic Elastic Swarm

### 🛡️ Default `frontier-guardrails` Preset vs. `smart-hybrid` Swarm Mode (`/settings`)
- **`frontier-guardrails` (Default Recommended; `carbon-guardrails` Antigravity alias)**: Native frontier agent drives daily tasks up to `≤ 10` known files (`execution.mode = mode_a`, `naturalLanguageResearchTrigger = off`, `< 3KB` slim entrypoint), while BoomOpen enforces Pragmatic 2-Tier Coding Standards (`400/500` lines, `0` `any`, `--strict-phase --no-stubs`) and unlocks full Mode B swarms whenever an explicit `/cmd` is invoked.
- **`smart-hybrid` / `deep-architect` / `adversarial-team`**: Proactive Mode B orchestration (`≤ 2` or `1` file Mode A threshold) with 17-language natural-language workflow routing (`auto_team` / `auto_hard`) and Multi-Engine Council integration.
- **Cognitive Load Sharding Law (`MAX 3–4 Heavy Files or 1 Deep Vector per Sub-Agent`)**:
  $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$
  - **Tier 0 — Micro Direct (`0` sub-agents)**: Known-target files within `modeAThresholdFiles`, `1` domain, `0` exploration, no `/cmd`.
  - **Tier 1 — Focused Triad (`2–3` parallel sub-agents)**: `3–5` files or `2` domains/vectors.
  - **Tier 2 — Elastic Swarm (`4–6` parallel sub-agents)**: `6–12` files, `3–4` domains, or `4–5` research/audit vectors.
  - **Tier 3 — Hyper-Swarm (`7–10+` parallel sub-agents, up to `execution.maxParallelSubagents`)**: `13+` files, repo-wide audits, or multi-module overhauls (horizontally sharded so each sub-agent owns `≤ 3–4` files).

### 🎻 MODE B — Explicit `/cmd` & 17-Language Natural-Language Workflow Orchestration (Tiers 1–3)
- **Triggered when**:
  1. User explicitly invokes any of the **`36` BoomOpen slash commands** (`/onboard`, `/pr`, `/pr:review`, `/release`, `/cook`, `/code`, `/autopilot`, `/audit`, `/conduct`, `/fix`, `/plan:hard`, `/design:hard`, `/review:team`, `/orchestrate`, etc.).
  2. When `naturalLanguageResearchTrigger != off`, user speaks in natural language across **any of the 17 supported languages** (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) matching a structured workflow intent — see [`skills/intelligent-routing/SKILL.md`](./skills/intelligent-routing/SKILL.md).
  3. Task exceeds `modeAThresholdFiles` or requires **Elastic Golden Diamond** collaboration (`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`).
- **Turn-1 Instant Dispatch**: Read `commands/{cmd}.md` AND launch Phase 1 subagent shards (`TypeName: "self"`, `Model: "inherit"`), Antigravity `run_workflow` scripts (`platforms/antigravity/workflows/*.py`), or `boomopen conduct` in the **same Turn-1 tool batch**, enforcing **3-Wave Contract-First Handoffs (`SHARED_CONTRACT` + disjoint `OWNED_FILES` `≤ 3–4` files/shard)**, **Wave 2.5 `boomopen reconcile`**, and **Scoped Warm Sub-agent Reuse (`role#shard -> conversationId` via `send_message`)**.

### ⚡ MODE A — Known-Target Direct Execution (Tier 0)
- Primary agent executes, tests, and verifies directly while enforcing **Pragmatic 2-Tier Coding Standards** (`0` explicit `any`, `0` debug `console.log`, `≤ 400` soft / `≤ 500` hard lines) and **Persistent End-to-End Verification**.

---

## 🧠 Quality-First Model Policy (`Model: "inherit"` Default)

- **Default (`Model: "inherit"` / Pro High)**: Mandatory for all 22 specialist roles across engineering, planning, architecture, scouting, debugging, testing, reviewing, reconciliation, security, design, and documentation.
- **Mechanical Chores & Visual Browser Only (`Model: "flash"`)**: Permitted for trivial log/list formatting or Antigravity's native `TypeName: "browser"` live visual UI/DOM subagent.
- **Forbidden (`flash_lite`)**: **NEVER use `flash_lite`**.

---

## 🛠️ Deterministic CLI Suite (`boomopen` — All 14 Subcommands)

Invoke via `boomopen <subcommand>` (when linked) or `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js <subcommand>`:

| CLI Subcommand | Key Operations & Gates | Purpose |
|----------------|------------------------|---------|
| `install` | `install <cursor\|copilot\|antigravity\|claude\|codex\|--all> [--with-hooks]` | SHA-256 manifest-backed installer & target-native agent `tools:` compiler |
| `uninstall` | `uninstall <tool\|--all>` | Clean removal preserving user-created & user-modified files |
| `list` | `list` | Inspect installed platforms, versions, and tracked manifest counts |
| `doctor` | `doctor [--platform <tool>] [--source-only] [--rebuild-index]` | Read-only health check, Markdown line-limit audit & `compact-index.json` builder |
| `check` | `check [dir] [--strict-phase] [--no-stubs] [--ignore <glob>]` | Pragmatic 2-Tier static code & anti-stub/anti-test-gaming auditor |
| `settings` | `settings [status\|get\|set\|mode\|preset\|sync\|reset\|ui\|--ui]` | Manage `frontier-guardrails` (default), `carbon-guardrails` (alias), `smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team` |
| `research` | `research <validate\|brief> <file> [--mode research\|brainstorm] [--out <f>]` | 4-Gate validator (`RES-G1..G4`) & `HANDOFF_BRIEF` extractor for `RESEARCH` / `BRAINSTORM` |
| `design` | `design <validate\|contract> <file> [--out <f>] [--json]` | 4-Gate UI spec validator (`DESIGN-G1..G4`) & `DESIGN_CONTRACT` token/props compiler |
| `plan` | `plan <validate\|compile> <file> [--sync-ledger]` | 5-Gate implementation plan validator (`PLAN-G1..G5`) & Plan-to-Ledger compiler |
| `cook` | `cook <state\|packets\|verify-wave\|preflight\|amend-plan>` | Fast-forward state detector, 5-Field wave packet compiler, `COOK-G1..G4` verifier & delta plan amender |
| `reconcile` | `reconcile [dir] [--plan <p>] [--specs <s1,s2>] [--ledger <l>] [--strict]` | Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`: island shards, route parity, `[SC-*]` & `.env.example` parity) |
| `audit` | `audit <init\|slice\|record\|approve\|verify-fix\|rollback\|status>` | Stateful multi-round whole-project audit ledger (`.boomopen/audit-ledger.json`), fix ratchet & atomic `rollback` |
| `ledger` | `ledger <init\|from-plan\|validate\|status\|next\|verify\|rollback\|audit>` | Multi-session `.boomopen/project-ledger.json` **5-Layer Phase Ratchet** (`G5 verify --reconcile --strict-locks` last) & `rollback` |
| `conduct` | `conduct <probe\|dispatch\|council\|status>` | Cross-engine CLI orchestrator & parallel Multi-Engine Council consensus runner |

---

## 📂 Brain Artifacts, 5-Layer Autopilot Ratchet & Antigravity `run_workflow` Templates

- **Cross-Platform Artifact Routing**: Transient deliverables (`ARCHITECTURE-MAP`, `PLAN`, `DESIGN`, `RESEARCH`, `BRAINSTORM`, `SCOUT`, `DEBUG`, `TEST`, `REVIEW`, `PR-SUMMARY`, `PR-REVIEW`, `RELEASE`, `REPORT`, `SESSION`) default to `<appDataDir>\brain\<conversation-id>\` on Antigravity (clean Git tree) and `./reports/{topic}/` on Claude Code, OpenAI Codex, Cursor, and GitHub Copilot.
- **5-Layer Phase Quality Ratchet & Git Checkpoint Rollback**: Multi-session `/autopilot:run` enforces `G1 check --strict-phase --no-stubs` → `G2 cumulative build/tests` → `G3 Wave 2.5 boomopen reconcile` → `G4 adversarial review` → **`G5 boomopen ledger verify --reconcile --strict-locks` (RUNS LAST!)**, backed by automatic git checkpoints and `boomopen ledger rollback --yes` / `boomopen audit rollback --yes`.
- **Antigravity 2.0 `run_workflow` Templates (`platforms/antigravity/workflows/`)**: Executable Python 3.10+ multi-agent fan-out scripts (`audit_fanout.py`, `review_fanout.py`, `research_fanout.py`) using native `phase`, `agent`, `parallel`, `pipeline`, `log`, `WORKSPACES`, `args`, and `schema` primitives.

---

## 📚 Core Architecture & Rules (`rules/` — Load On Demand in Mode B, `<= 300` Lines Each)

| Rule File | Purpose | When to Load |
|-----------|---------|--------------|
| [`rules/CORE.md`](./rules/CORE.md) | Presets (`frontier-guardrails` default), `36` Base Commands (`93` files), 4-Tier Swarm, Laws `L1–L10` | On-demand in Mode B |
| [`rules/AGENTS.md`](./rules/AGENTS.md) | `22` Specialist Agents, Cognitive Load Sharding (`≤ 3–4` files/shard), Warm Reuse (`role#shard`) | Before delegating to specialist subagents |
| [`rules/PHASES.md`](./rules/PHASES.md) | 3-Wave + Wave 2.5 Reconcile Topology, **5-Layer Phase Quality Ratchet (`G5` last)**, `ledger/audit rollback` | When running multi-phase workflows |
| [`rules/TEAMS.md`](./rules/TEAMS.md) | `18` Elastic Golden Diamond Teams (`72` files) & Cross-Engine Conductor (`boomopen conduct`) | When executing `:team` or `/conduct` variants |
| [`rules/SKILLS.md`](./rules/SKILLS.md) | Fast 2-Step Progressive Skill Lookup (`<skills>` → `compact-index.json` `22` core + `1,440` library = `1,462` skills) | When resolving domain skills |
| [`rules/ERRORS.md`](./rules/ERRORS.md) | Self-healing, Error Classification (`E0` warm auto-revive – `E6` cross-engine escalation), Anti-Patterns (`A1`–`A14`) | When errors or CLI gate failures occur |
| [`rules/REFERENCE.md`](./rules/REFERENCE.md) | Quick lookup tables for all `36` Base Commands, Cross-Platform Tool Vocabulary, Agents, and CLI gates | Fast reference |

---

## 🎯 Workflow Commands (`commands/` — 93 Files = 87 Workflows + 6 `_ref/` across 36 Base Commands)

| Command | Router / File | Variants & Purpose |
|---------|---------------|--------------------|
| `/onboard` | [`commands/onboard.md`](./commands/onboard.md) | 60-second brownfield codebase & architecture map (`ARCHITECTURE-MAP.md`, zero `/init` collision) |
| `/pr` | [`commands/pr.md`](./commands/pr.md) | Pre-PR strict gate (`check`, `reconcile`, diff tests) + `gh pr create`; variant `review` ([`pr-review.md`](./commands/pr-review.md)) for adversarial hunk review |
| `/release` | [`commands/release.md`](./commands/release.md) | Conventional commit audit, SemVer bump, `CHANGELOG.md`, `doctor`/`check`/`test`/`test:pack` parity & `gh release create` |
| `/cook` | [`commands/cook.md`](./commands/cook.md) | `fast`, `hard`, `team` (`boomopen cook state\|packets\|verify-wave\|amend-plan` + Wave 2.5 `reconcile`) |
| `/code` | [`commands/code.md`](./commands/code.md) | `fast`, `hard`, `team` (Direct Plan-to-Executor Dispatch + Wave 2.5 `reconcile`) |
| `/plan` | [`commands/plan.md`](./commands/plan.md) | `fast`, `hard`, `team` (`boomopen plan validate\|compile`) |
| `/design` | [`commands/design.md`](./commands/design.md) | `fast`, `hard`, `team` (`boomopen design validate\|contract`) |
| `/research` / `/brainstorm` | [`commands/research.md`](./commands/research.md) / [`commands/brainstorm.md`](./commands/brainstorm.md) | `fast`, `hard`, `team` (`boomopen research validate\|brief`) |
| `/fix` / `/debug` | [`commands/fix.md`](./commands/fix.md) / [`commands/debug.md`](./commands/debug.md) | `fast`, `hard`, `team` (SPIE v3.0 5-Whys & `RED -> GREEN` fixes) |
| `/test` / `/review` | [`commands/test.md`](./commands/test.md) / [`commands/review.md`](./commands/review.md) | `fast`, `hard`, `team` (Test pyramid + Visual Browser E2E + 2-Layer security/perf review) |
| `/audit` | [`commands/audit.md`](./commands/audit.md) | `run`, `fix`, `auto` (Multi-round whole-project audit, Visual Browser E2E & `audit rollback`) |
| `/autopilot` | [`commands/autopilot.md`](./commands/autopilot.md) | `init`, `run`, `audit` (Multi-session ledger, 5-Layer Phase Ratchet & `ledger rollback`) |
| `/conduct` | [`commands/conduct.md`](./commands/conduct.md) | `council`, `pipeline` (Cross-Engine Conductor & Multi-Engine Council via `boomopen conduct`) |
| `/docs` / `/report` / `/deploy` | [`commands/docs.md`](./commands/docs.md) / [`commands/report.md`](./commands/report.md) / [`commands/deploy.md`](./commands/deploy.md) | `core\|business\|audit`, `fast\|hard\|team`, `check\|preview\|production\|rollback` |
| `/ask` / `/orchestrate` | [`commands/ask.md`](./commands/ask.md) / [`commands/orchestrate.md`](./commands/orchestrate.md) | `fast\|hard` Q&A & custom 22-specialist + `run_workflow` orchestration |
| `/save` / `/recap` / `/settings` | [`commands/save.md`](./commands/save.md) / [`commands/recap.md`](./commands/recap.md) / [`commands/settings.md`](./commands/settings.md) | Session continuity & Unified Settings Control Center (`frontier-guardrails` default) |
| **Standalone Utilities** | `commands/{architect,auto,deep-audit,init,next,performance,preview,refactor,rollback,security-audit,status,ui-ux-pro-max}.md` | 12 focused single-file specialist commands completing the `36` base command suite |
