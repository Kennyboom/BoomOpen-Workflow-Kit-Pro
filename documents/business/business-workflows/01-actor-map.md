# BoomOpen Workflow Kit — Actor Map

| Field | Value |
|-------|-------|
| **Purpose** | Define all `8` actor groups participating in `@boomopen/workflow-kit` `v5.5.0` workflows, including responsibilities, capabilities, constraints, and workflow touchpoints |
| **Parent** | [00-index.md](./00-index.md) |
| **Last Updated** | 2026-11-25 |
| **Version** | 5.5.0 (Smart-Hybrid Edition) |

---

## Actor Overview

BoomOpen Workflow Kit (`v5.5.0`) coordinates **8 distinct actor groups** across **16 canonical workflows (`BW-001` – `BW-016`)**. Every actor operates within strict file-ownership, model-quality, and phase-verification boundaries enforced by instruction contracts and deterministic `boomopen` CLI gates.

| ID | Actor Group | Type | Inventory / Scale (`v5.5.0`) | Primary Responsibility |
|----|-------------|------|------------------------------|------------------------|
| **A-01** | Framework User | Human | Developer / Tech Lead / PM | Installs kit, configures `/settings`, triggers 17-language NL or `/cmd` workflows, approves `"Proceed"` gates |
| **A-02** | Smart-Hybrid Orchestrator | AI Runtime | `5` Unified Platforms (`13` entry files) | Routes Mode A vs Mode B, computes elastic shard counts, dispatches 5-Field Handoff Packets, reuses warm sessions |
| **A-03** | Specialist Sub-Agents | AI Shards | **`22` Specialist Agents** (`agents/*.md`) | Execute isolated `role#shard` tasks (`<= 3–4 OWNED_FILES`, `Model: "inherit"`) across 5 specialist categories |
| **A-04** | Elastic Golden Diamond Teams | AI Team Pillars | **`18` Teams** (`54` roles + `18` `_team.md` = **`72` files**) | Run 3-pillar adversarial collaboration (`1` Lead + `1..6` Shard Executors + `1..3` Critics) via `MAILBOX` & warm `send_message` |
| **A-05** | Deterministic `boomopen` CLI & Helpers | Local Runtime | **`14` CLI Subcommands** (`49` JS modules + `7` Python scripts) | Compiles packets/contracts/ledgers and enforces deterministic `RES`, `DESIGN`, `PLAN`, `COOK`, `REC`, `audit`, `doctor`, and `check` gates |
| **A-06** | HSOL v5.5 & Skills Vault | Skill Engine | **`1,462` Indexed Skills** (`22` Core + `1,440` Library) | Resolves domain `SKILL.md` instructions in `O(1)` via `<skills>` + `matrix-skills/compact-index.json` & tracks dynamic trust |
| **A-07** | External Multi-Engine Council Actors | Cross-Engine AI | `claude`, `codex`, `antigravity`, `cursor`, `copilot` | Provide independent cross-family critique (`Author != Critic`), Round-2 debug deadlock breaking, and 6-Task Council consensus |
| **A-08** | Framework Maintainer & Contributors | Human | BoomOpen Labs & OSS Contributors | Maintain rules, `93` command files, `22` agents, `18` teams, cross-OS CI, and guarded GitHub Releases (`npmPublish: false`) |

---

## A-01: Framework User

**Definition**: A developer, architect, or engineering team member using `@boomopen/workflow-kit` inside any of the `5` supported AI coding environments.

- **Capabilities & Touchpoints**:
  - Clones `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git` and runs `node cli/install.js install <tool|--all>` (`BW-001`) or `uninstall` (`BW-002`).
  - Tunes presets (`frontier-guardrails` default `< 2.5 KB` Slim Guardrails with `carbon-guardrails` alias, `smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team`) via `/settings`, `boomopen settings`, or `boomopen settings --ui` on `http://127.0.0.1:4567` (`BW-014`).
  - Expresses tasks either via `36` base slash commands (`/cook`, `/plan:hard`, `/review:team`, `/audit:auto`, `/pr:review`, `/autopilot:run`, `/conduct:council`) or naturally in any of the **17 supported languages** (`BW-003`).
  - Reviews Brain Artifacts (`PLAN-*`, `DESIGN-*`, `RESEARCH-*`, `BRAINSTORM-*`, `DEBUG-*`) and clicks **"Proceed"** (`ArtifactMetadata.RequestFeedback: true`) or replies in natural language (*"proceed"*, *"ok em làm đi"*) to fast-forward directly into execution (`BW-008`, `BW-009`, `BW-010`).
  - Resolves genuine `E3`/`E4` specification contradictions via native `ask_question` multiple-choice prompts (`BW-016`).

---

## A-02: Smart-Hybrid Orchestrator (`5` Unified AI Platforms)

**Definition**: The primary AI assistant session governed by BoomOpen's unified root/platform entrypoints ([`GEMINI.md`](../../../GEMINI.md), [`CLAUDE.md`](../../../CLAUDE.md), [`CODEX.md`](../../../CODEX.md), [`COPILOT.md`](../../../COPILOT.md), [`CURSOR.md`](../../../CURSOR.md), [`AGENT.md`](../../../AGENT.md), each kept compact `<= 250` lines in source with `MAX_ENTRY_LINES = 350` installed kit-block ceiling):

1. **Antigravity (Gemini)**: `~/.gemini/GEMINI.md`, `~/.gemini/agents/AntigravityGlobal.agent.md`, `~/.gemini/config/skills/boomopen-workflow-kit/` (+ `--as-plugin` `plugin.json` & `run_workflow` scripts), Brain Artifacts at `<appDataDir>/brain/<conversation-id>/`.
2. **Claude Code**: `~/.claude/CLAUDE.md`, `~/.claude/commands/`, `~/.claude/agents/`, `~/.claude/skills/boomopen-workflow-kit/`, optional `PreToolUse` & `PreCompact`/`Stop` hooks (`--with-hooks` -> `validate-tool-call.mjs` & `stop-quality-gate.mjs`).
3. **OpenAI Codex**: `~/.codex/CODEX.md`, `~/.codex/AGENTS.md`, TOML-merged `~/.codex/config.toml`, `22` role TOMLs in `~/.codex/agents/boomopen/*.toml`, `87` generated command skills + `22` core skills in `~/.codex/skills/`.
4. **Cursor**: `~/.cursor/CURSOR.md`, `~/.cursor/rules/boomopen-workflow-kit.mdc`, `~/.cursor/commands/`, `~/.cursor/agents/`, `~/.cursor/skills/boomopen-workflow-kit/`.
5. **GitHub Copilot**: `~/.copilot/COPILOT.md`, `~/.copilot/copilot-instructions.md`, `<VSCodeUser>/prompts/boomopen-workflow-kit.agent.md`, `~/.copilot/commands/`, `~/.copilot/agents/`, `~/.copilot/skills/boomopen-workflow-kit/`.

- **Core Responsibilities & Constraints**:
  - **Mode A Direct (`Tier 0`)**: Executes, tests, and verifies directly **only** when `<= 2` target files are already known on Turn 1, within `1` domain, requiring `0` exploration, with no `/cmd` or workflow intent (or up to `<= 10` files under `frontier-guardrails` native-driver mode).
  - **Proactive Sub-Agent First & Mode B (`Tier 1–3`)**: Never crawls `> 2` files sequentially and never writes production code directly in Mode B; immediately fans out parallel `role#shard` sub-agents on Turn 1, enforces CLI gates, maintains the **Active Sub-agent Session Registry (`role#shard -> conversationId`)**, and reuses warm sessions via `send_message`.

---

## A-03: Specialist Sub-Agents (`22` Specialist Agents in `agents/*.md`)

**Definition**: Domain-specialized AI worker personas defined in [`agents/`](../../../agents/) (`<= 450` lines each), spawned as isolated TIER 1 shards (`invoke_subagent(TypeName: "self", Role: "<role>#<shard>", Model: "inherit")`) or embodied in TIER 2 only on sub-agent tool unavailability.

| Category | Count | Canonical Specialist Agents (`22` Total) | Scope & Write Lock |
|----------|:-----:|------------------------------------------|--------------------|
| **`meta`** | `2` | `tech-lead`, `planner` | Architecture, 6-Block `PLAN-*` authoring, contract arbitration (**never write app code**) |
| **`execution`** | `5` | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect` | 3-Wave Contract-First implementation locked to **`<= 3–4` disjoint `OWNED_FILES`** per shard |
| **`validation`** | `6` | `tester`, `reviewer`, `security-engineer`, `performance-engineer`, `debugger`, `spec-reconciler` | Sharded QA (`tester#1..k`), Wave 2.5 spec reconciliation (`REC-G1..G4`), OWASP/code audits, `SPIE v3.0` root-cause debugging (`READ_ONLY_FILES` regression locks) |
| **`research`** | `4` | `researcher`, `scouter`, `brainstormer`, `designer` | Multi-vector web/codebase research, ideation (`BRAINSTORM-*`), 6-Block `DESIGN-*` (**zero app code**) |
| **`support`** | `5` | `docs-manager`, `devops-engineer`, `business-analyst`, `project-manager`, `reporter` | Repository `/docs` shards, CI/CD & IaC, requirements engineering, delivery metrics & status reports |

- **Boundary Constraints**:
  - Mandatory `Model: "inherit"` (Pro High default); `flash` allowed strictly for trivial mechanical chores; **`flash_lite` is strictly forbidden**.
  - Must never edit files listed in `READ_ONLY_FILES` or outside assigned `OWNED_FILES`.

---

## A-04: Elastic Golden Diamond Teams (`18` Teams = `72` Files in `agents/teams/`)

**Definition**: Domain-specialized adversarial teams defined under [`agents/teams/`](../../../agents/teams/). Each of the **`18` `*-team/` folders** contains `_team.md` + `techlead.md` + `executor.md` + `reviewer.md` (`18` `_team.md` + `54` role files = **`72` team files**, each `<= 450` lines):

`backend-team`, `brainstorm-team`, `database-team`, `debug-team`, `design-team`, `devops-team`, `docs-team`, `frontend-team`, `fullstack-team`, `game-team`, `mobile-team`, `performance-team`, `planning-team`, `project-team`, `qa-team`, `report-team`, `research-team`, `security-team`.

- **Elastic Golden Diamond Scaling (`v5.5.0`)**:
  - Scales dynamically from a compact `1-1-1` triad (`3` agents for `<= 4` files) up to **`1 Tech Lead + 1..6 Parallel `role#shard` Executors + 1..3 Parallel Critics/Testers`** governed by the Cognitive Load Sharding Law (`<= 3–4 OWNED_FILES` per shard).
  - **3 Pillars**: **Lead Pillar `[1]`** (locks `SHARED_CONTRACT`, arbitrates after Round 3, stamps consensus), **Executor Pillar `[1..6]`** (executes Wave 1 contracts/tokens -> Wave 2 parallel feature shards or disjoint research vectors `*-v{k}.md`), and **Critic/QA Pillar `[1..3]`** (issues evidence-backed `PASS`/`FAIL` reviews and anti-gaming QA checks).
  - Communicates Round 2/3 critiques via Append-Only `MAILBOX-{date}.md` and warm `send_message(Recipient: conversationId)` sessions.

---

## A-05: Deterministic `boomopen` CLI & Python Verification Engine

**Definition**: Zero-dependency Node.js CLI ([`cli/install.js`](../../../cli/install.js) + `48` modular `cli/*.js` files, `"bin": { "boomopen": "./cli/install.js" }`) paired with `7` cross-platform Python (`>= 3.10`) scripts in [`scripts/`](../../../scripts/).

- **14 CLI Subcommands**: `install`, `uninstall`, `list`, `settings` (alias `config`), `doctor`, `check`, `research`, `design`, `plan`, `cook`, `reconcile`, `audit`, `ledger`, `conduct` (alias `conductor`).
- **7 Python Helpers**: `auto_preview.py`, `checklist.py`, `kit_checks.py`, `kit_console.py`, `kit_process.py`, `session_manager.py`, `verify_all.py`.
- **Boundary Constraints**: Deterministic exit codes (`0` = pass, `1` = gate violation/unhealthy, `2` = invalid CLI usage); never mutates user files outside manifest-tracked ownership or `.boomopen/` state files.

---

## A-06: HSOL v5.5 & Skills Vault Subsystem (`1,462` Indexed Skills)

**Definition**: The Hybrid Skill Orchestration Layer (`v5.5`) combining **`22` pre-loaded Core Skills** in [`skills/`](../../../skills/) with **`1,440` dormant Library Skills** in `skills_library/` (deduplicated across IDEs via `~/.agents/skills_library/`), indexed in [`matrix-skills/compact-index.json`](../../../matrix-skills/compact-index.json) (`1,462` unique skills compiled from `19` domain `.yaml` files + `_index.yaml` + `_dynamic.yaml`).

- **Capabilities**: 2-step `O(1)` lookup (`<skills>` system prompt check -> `compact-index.json` / `skills/skill-seeker/SKILL.md`), loading only matched `SKILL.md` files on demand with zero idle context bloat, plus dynamic external discovery and `NEW (0.3) -> EVALUATING (0.5) -> VALIDATED (0.7) -> PROMOTED (1.0) / BLOCKED (0.0)` trust tracking.

---

## A-07: External Multi-Engine Council & Conductor Actors

**Definition**: Independent external AI CLI runtimes (`claude`, `codex`, `antigravity`/`agy`, plus queue-fallback IDE engines `cursor`, `copilot`) orchestrated by [`cli/conductor.js`](../../../cli/conductor.js) (`boomopen conduct`).

- **Responsibilities & Constraints**:
  - **Cross-Engine Pipeline (`boomopen conduct dispatch`)**: Enforces `Author != Critic` across distinct model families and computes pre/post SHA-256 hashes over `READ_ONLY_FILES` (reverting unauthorized edits and exiting non-zero on trespass).
  - **6-Task Parallel Multi-Engine Council (`boomopen conduct council`)**: Runs `research`, `brainstorm`, `plan`, `design`, `review`, or `debug` prompts concurrently across engines and writes `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md`.

---

## A-08: Framework Maintainer & Contributors

**Definition**: BoomOpen Labs maintainers and open-source contributors evolving `Kennyboom/BoomOpen-Workflow-Kit-Pro`.

- **Responsibilities & Constraints**: Author and maintain `rules/` (`<= 300` lines), `commands/` (`93` files), `agents/` (`22` files), `agents/teams/` (`72` files), `skills/`, and `i18n/` (`<= 450` lines), `34` `node:test` suites, cross-OS GitHub Actions CI ([`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml)), and manual guarded Semantic Releases ([`.github/workflows/release.yml`](../../../.github/workflows/release.yml), `.github/scripts/release-guard.js`, `npmPublish: false`).

---

## Actor Interaction Matrix

| From \ To | A-01 User | A-02 Orchestrator | A-03 Specialists (`22`) | A-04 `:team` Pillars (`18`) | A-05 `boomopen` CLI | A-06 HSOL (`1,462`) | A-07 Council Engines |
|-----------|-----------|-------------------|-------------------------|-----------------------------|---------------------|---------------------|----------------------|
| **A-01 User** | — | Prompts / `"Proceed"` | — | — | Runs `install`/`settings` | Approves low-trust skill | — |
| **A-02 Orchestrator** | Delivers / `ask_question` | — | Spawns & `send_message` | Launches `:team` pillars | Runs compilers & gates | Queries `<skills>` | Invokes via `conduct` |
| **A-03 Specialists** | — | Reports deliverables | — | — | Runs `check` & validators | Loads `SKILL.md` | — |
| **A-04 `:team` Pillars** | — | Returns stamped output | Shards `role#shard` | Debates via `MAILBOX` | Enforces wave/spec gates | Loads domain skills | Escalates Round-2 |
| **A-05 `boomopen` CLI** | Prints status / Web UI | Returns JSON / exit codes | Validates `OWNED_FILES` | Gates waves & specs | — | Rebuilds `compact-index` | Spawns & SHA-256 guards |

---

## Evidence Sources

- [../../../GEMINI.md](../../../GEMINI.md) · [../../../CLAUDE.md](../../../CLAUDE.md) — Entrypoint contracts, Mode A/B gate, Quality-First Model Policy
- [../../../rules/CORE.md](../../../rules/CORE.md) · [../../../rules/AGENTS.md](../../../rules/AGENTS.md) — `22` specialist agents, Cognitive Load Sharding, 5-Field Handoff Packet, Warm Reuse
- [../../../rules/TEAMS.md](../../../rules/TEAMS.md) — `18` Elastic Golden Diamond teams (`72` files), Topologies A & B, Mailbox & debate rules
- [../../../rules/SKILLS.md](../../../rules/SKILLS.md) — `HSOL v5.5` 2-step lookup across `1,462` skills (`22` core + `1,440` library)
- [../../../cli/install.js](../../../cli/install.js) · [../../../cli/conductor.js](../../../cli/conductor.js) — `14` `boomopen` CLI subcommands & Cross-Engine Conductor
