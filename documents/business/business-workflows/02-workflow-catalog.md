# BoomOpen Workflow Kit — Workflow Catalog

| Field | Value |
|-------|-------|
| **Purpose** | Complete catalog of all `16` canonical business workflows (`BW-001` – `BW-016`) and the `84`-file (`32`-command) routing inventory in `@boomopen/workflow-kit` `v5.5.0` |
| **Parent** | [00-index.md](./00-index.md) |
| **Last Updated** | 2026-11-10 |
| **Version** | 5.5.0 (Smart-Hybrid Edition) |

---

## Slash Command & CLI Inventory (`v5.5.0`)

- **`84` Flat Command Markdown Files ([`commands/`](../../../commands/))**: `79` flat workflow files (`commands/{cmd}.md` + `commands/{cmd}-{variant}.md`) + `5` shared protocol files in `commands/_ref/` (`convergent-analysis-loop.md`, `docs-folder-specs.md`, `docs-recon-protocol.md`, `golden-triangle-protocol.md`, `implementation-loop.md`).
- **`32` Base Slash Commands**:
  - **`16` Multi-Variant Families**: `/cook`, `/code`, `/plan`, `/design`, `/research`, `/brainstorm`, `/debug`, `/fix`, `/test`, `/review`, `/report` (all `:fast|:hard|:team`), `/docs` (`:core|:business|:audit`), `/deploy` (`:check|:preview|:production|:rollback`), `/autopilot` (`:init|:run|:audit`), `/conduct` (`:council|:pipeline`), `/ask` (`:fast|:hard`).
  - **`16` Standalone Commands**: `/settings`, `/orchestrate`, `/save`, `/recap`, `/init`, `/next`, `/status`, `/preview`, `/rollback`, `/architect`, `/auto`, `/refactor`, `/performance`, `/security-audit`, `/deep-audit`, `/ui-ux-pro-max`.
- **`12` Deterministic `boomopen` CLI Subcommands**: `install`, `uninstall`, `list`, `settings`, `doctor`, `check`, `research`, `design`, `plan`, `cook`, `ledger`, `conduct`.

---

## Canonical Workflow Catalog (`BW-001` – `BW-016`)

### BW-001 — Multi-Platform Framework Installation

| Attribute | Value |
|-----------|-------|
| **Actor** | Framework User (`A-01`) + `boomopen` CLI (`A-05`) |
| **Trigger** | `node cli/install.js install <tool\|--all> [--with-hooks]` (or `boomopen install ...` after `npm link`) |
| **Outcome** | Installs entrypoints, `84` command files, `21` agents, `18` teams (`72` files), `7` rules, `22` core skills, `1,440` library skills, `compact-index.json`, and `7` Python scripts into `cursor`, `copilot`, `antigravity`, `claude`, or `codex` with SHA-256 `~/.boomopen/manifests/<tool>.json` ledgers and `~/.boomopen/backups/` |
| **Complexity / Frequency** | Low / Rare (initial setup or kit upgrade) |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-001--multi-platform-framework-installation) |

### BW-002 — Manifest-Safe Framework Uninstallation

| Attribute | Value |
|-----------|-------|
| **Actor** | Framework User (`A-01`) + `boomopen` CLI (`A-05`) |
| **Trigger** | `node cli/install.js uninstall <tool\|--all>` |
| **Outcome** | Removes only kit-owned files recorded in `~/.boomopen/manifests/<tool>.json`, strips `<!-- boomopen-workflow-kit-START/END -->` blocks cleanly, and preserves all custom user files |
| **Complexity / Frequency** | Low / Rare |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-002--manifest-safe-framework-uninstallation) |

### BW-003 — Proactive Gate & 17-Language Command Routing

| Attribute | Value |
|-----------|-------|
| **Actor** | Smart-Hybrid Orchestrator (`A-02`) |
| **Trigger** | Every user prompt across all `17` supported languages (explicit `/cmd` or natural language) |
| **Outcome** | Classifies request on Turn 1 into **Mode A Direct** (`<= 2` known files, `1` domain, `0` exploration), **Ad-Hoc Read-Only Q&A Fan-Out**, or **Mode B Structured Workflow** (`commands/{cmd}-{variant}.md`) with Turn-1 Zero-Tax sub-agent dispatch |
| **Complexity / Frequency** | Medium / Per-Turn |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-003--proactive-gate--17-language-command-routing) |

### BW-004 — Elastic Swarm Sharding & Warm Session Delegation

| Attribute | Value |
|-----------|-------|
| **Actor** | Smart-Hybrid Orchestrator (`A-02`) + Specialist Sub-Agents (`A-03`) |
| **Trigger** | Any Mode B phase or unscoped `> 2`-file exploration |
| **Outcome** | Computes shard count via Cognitive Load Sharding (`<= 3–4 OWNED_FILES` per `role#shard`, `maxParallelSubagents = 8`), dispatches TIER 1 `TypeName: "self", Model: "inherit"` with 5-Field Handoff Packets, records `role#shard -> conversationId`, and reuses warm sessions via `send_message` |
| **Complexity / Frequency** | Medium / Per-Phase |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-004--elastic-swarm-sharding--warm-session-delegation) |

### BW-005 — Fast 2-Step Skill Resolution (`HSOL v5.5`)

| Attribute | Value |
|-----------|-------|
| **Actor** | Specialist Sub-Agents (`A-03`) + HSOL v5.5 Subsystem (`A-06`) |
| **Trigger** | Complex domain/framework task inside any specialist or `:team` shard |
| **Outcome** | Step 1 checks pre-loaded `<skills>` (`22` Core Skills); Step 2 queries `matrix-skills/compact-index.json` (`1,462` skills = `22` Core + `1,440` Library) via `skill-seeker` in `O(1)` and loads only matched `SKILL.md` files; tracks dynamic skill trust (`NEW -> EVALUATING -> VALIDATED -> PROMOTED / BLOCKED`) |
| **Complexity / Frequency** | Medium / Per-Task |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-005--fast-2-step-skill-resolution-hsol-v55) |

### BW-006 — Deep Research & Grounded Brainstorming

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + `researcher#v1..k` / `brainstormer#opt-1..k` / `research-team` / `brainstorm-team` + `boomopen research` (`A-05`) |
| **Trigger** | `/research`, `/brainstorm` (`:fast\|:hard\|:team`) or 17-language research/ideation intent (`auto_team` default) |
| **Outcome** | Parallel Turn-1 vector fan-out writing disjoint `*-v{k}.md` notes -> synthesized single cohesive `RESEARCH-{topic}.md` or `BRAINSTORM-{topic}.md` (`<= 500` lines, `RequestFeedback: true`) passing `boomopen research validate` (`RES-G1..G4`) + `HANDOFF_BRIEF` |
| **Complexity / Frequency** | High / On-Demand |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-006--deep-research--grounded-brainstorming) |

### BW-007 — UI/UX Design Spec & Contract Extraction

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + `designer` / `design-team` + `boomopen design` (`A-05`) |
| **Trigger** | `/design` (`:fast\|:hard\|:team`), `/ui-ux-pro-max`, or 17-language UI/UX design intent |
| **Outcome** | Produces 1 cohesive 6-Block `DESIGN-{task}.md` (`<= 500` lines, `RequestFeedback: true`) passing `boomopen design validate` (`DESIGN-G1..G4`: OKLCH + hex tokens, 5-State UI Matrix, WCAG 2.2 AA) and compiles executable `DESIGN_CONTRACT` (`@theme` CSS + TypeScript props) |
| **Complexity / Frequency** | High / On-Demand |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-007--uiux-design-spec--contract-extraction) |

### BW-008 — Deterministic Planning & Approved-Plan Execution

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + `planner` / `planning-team` + Executor Shards (`A-03`) + `boomopen plan` / `cook` (`A-05`) |
| **Trigger** | `/plan` (`:fast\|:hard\|:team`) followed by user 1-click `"Proceed"` or `/code` (`"proceed"`, *"ok em làm đi"*) |
| **Outcome** | Validates 6-Block `PLAN-{task}.md` via `boomopen plan validate` (`PLAN-G1..G5`: acyclic DAG, disjoint `OWNED_FILES <= 4`, `SHARED_CONTRACT`, verify cmds, `<= 500` lines); upon approval, fast-forwards directly into Direct Plan-to-Executor Dispatch via `boomopen cook packets` without re-planning |
| **Complexity / Frequency** | High / Per-Feature |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-008--deterministic-planning--approved-plan-execution) |

### BW-009 — 5-Stage Fast-Forward & 3-Wave Cook Execution

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + Multi-Domain `role#shard` Swarm (`A-03`/`A-04`) + `boomopen cook` & `check` (`A-05`) |
| **Trigger** | `/cook` (`:fast\|:hard\|:team`) or 17-language end-to-end feature build intent |
| **Outcome** | `boomopen cook state` skips completed Discovery/Design/Plan stages -> executes **Wave 1** (Schema/DTO/UI Tokens lock) -> **Wave 2** (Parallel Feature Shards) -> **Wave 3** (Parallel QA/Audit), gated at each wave by `boomopen cook verify-wave` (`COOK-G1..G4`) and `boomopen check --strict-phase --no-stubs` |
| **Complexity / Frequency** | High / Per-Feature |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-009--5-stage-fast-forward--3-wave-cook-execution) |

### BW-010 — Elastic SPIE Debugging & Surgical Fix

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + `debugger#h1..k` / `debug-team` + Fix Shards (`A-03`) + `boomopen conduct` (`A-07`) |
| **Trigger** | `/debug` or `/fix` (`:fast\|:hard\|:team`) or 17-language root-cause / multi-file bug-fix intent |
| **Outcome** | Parallel read-only `debugger#h1..k` shards falsify competing hypotheses -> synthesize `SPIE v3.0` 5-Whys `DEBUG-{issue}.md` (`DBG-G1..G4`, `RequestFeedback: true`, escalating to Cross-Engine `conduct dispatch` if Round 1 is inconclusive) -> 1-click `"Proceed"` into `/fix` fail-first `RED -> GREEN` regression test + surgical remediation |
| **Complexity / Frequency** | High / On-Demand |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-010--elastic-spie-debugging--surgical-fix) |

### BW-011 — Elastic Golden Diamond Team Collaboration

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + Any of the `18` Elastic Golden Diamond Teams (`A-04`) |
| **Trigger** | Any `:team` command variant or `auto_team` NL research/brainstorm/review trigger |
| **Outcome** | Runs **Topology A** (Turn-1 Parallel Fan-Out) or **Topology B** (Contract-Lock First) across `1` Tech Lead + `1..6` `role#shard` Executors + `1..3` Critics; resolves `CRITICAL`/`HIGH` critiques in `<= 3` warm `send_message` rounds via `MAILBOX-{date}.md` and stamps consensus |
| **Complexity / Frequency** | High / On-Demand |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-011--elastic-golden-diamond-team-collaboration) |

### BW-012 — Multi-Session Autonomous Project Autopilot

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + Swarm Shards (`A-03`/`A-04`) + `boomopen ledger` (`A-05`) |
| **Trigger** | `/autopilot`, `/autopilot:init`, `/autopilot:run`, `/autopilot:audit` (or NL multi-phase project execution) |
| **Outcome** | Compiles and advances `.boomopen/project-ledger.json` across sessions with SHA-256 Spec-Hash Drift Guard, `READ_ONLY_FILES` prior-phase test locks, monotonic cumulative test ratchet, and `boomopen ledger verify` / `audit` gates |
| **Complexity / Frequency** | High / Multi-Session Epics |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-012--multi-session-autonomous-project-autopilot) |

### BW-013 — Cross-Engine Conductor & Multi-Engine Council

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + `boomopen conduct` (`A-05`) + External Council Engines (`A-07`) |
| **Trigger** | `/conduct`, `/conduct:council`, `/conduct:pipeline` (or NL multi-engine council request) |
| **Outcome** | Probes installed engines (`probe`), dispatches `Author != Critic` cross-family tasks guarded by SHA-256 `READ_ONLY_FILES` (`dispatch`), or fans out 6-task parallel councils (`research\|brainstorm\|plan\|design\|review\|debug`) synthesized into `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md` |
| **Complexity / Frequency** | High / High-Stakes Architecture & Audits |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-013--cross-engine-conductor--multi-engine-council) |

### BW-014 — 3-Surface Settings Control Center & AOT Sync

| Attribute | Value |
|-----------|-------|
| **Actor** | Framework User (`A-01`) + Orchestrator (`A-02`) + `boomopen settings` (`A-05`) |
| **Trigger** | `/settings` in chat, `boomopen settings <subcmd>`, or `boomopen settings --ui` (`http://127.0.0.1:4567`) |
| **Outcome** | Updates `~/.boomopen/settings.json` or `./.boomopen.json` (`4` presets, `20` enum keys + `2` line-limit keys) and re-renders `<!-- BOOMOPEN-SETTINGS-START/END -->` blocks across all installed platforms in `< 10ms` |
| **Complexity / Frequency** | Low / On-Demand |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-014--3-surface-settings-control-center--aot-sync) |

### BW-015 — Sequential Repository Documentation Suite

| Attribute | Value |
|-----------|-------|
| **Actor** | Orchestrator (`A-02`) + Sharded `docs-manager#s1..k` / `docs-team` (`A-03`/`A-04`) |
| **Trigger** | `/docs`, `/docs:core`, `/docs:business`, `/docs:audit` |
| **Outcome** | Generates or synchronizes committed `./documents/` layers (`knowledge-*/` core folders -> `business/business-*/` folders -> audit packs) with `0` broken relative links and `100%` repository ground-truth parity |
| **Complexity / Frequency** | Medium / Release & Milestone Cycles |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-015--sequential-repository-documentation-suite) |

### BW-016 — Graduated Self-Healing & Error Recovery (`E0–E6`)

| Attribute | Value |
|-----------|-------|
| **Actor** | Smart-Hybrid Orchestrator (`A-02`) + Warm Shards (`A-03`) + `boomopen` CLI (`A-05`) + Council (`A-07`) |
| **Trigger** | Any sub-agent interruption, tool timeout, test/type error, contract drift, CLI gate failure, or Round-2 debug deadlock |
| **Outcome** | Executes deterministic recovery across `E0` (warm `send_message` auto-revive), `E1` (`3x` retry), `E1b` (`<= 500` line cohesion / ledger sync), `E2` (targeted warm shard fix), `E3` (`autonomous_first` / `ask_question`), `E4` (rollback & contract delta broadcast), `E5` (CLI gate warm auto-repair), and `E6` (Cross-Engine escalation) with **zero silent halts** |
| **Complexity / Frequency** | High / On-Demand (fault-triggered) |
| **Detailed Flow** | [03-detailed-workflows.md](./03-detailed-workflows.md#bw-016--graduated-self-healing--error-recovery) |

---

## Complexity & Frequency Summary

| Dimension | Distribution |
|-----------|--------------|
| **Complexity** | **Low (`3`)**: `BW-001`, `BW-002`, `BW-014` · **Medium (`4`)**: `BW-003`, `BW-004`, `BW-005`, `BW-015` · **High (`9`)**: `BW-006`, `BW-007`, `BW-008`, `BW-009`, `BW-010`, `BW-011`, `BW-012`, `BW-013`, `BW-016` |
| **Frequency** | **Per-Turn / Per-Phase (`3`)**: `BW-003`, `BW-004`, `BW-005` · **Per-Feature (`2`)**: `BW-008`, `BW-009` · **On-Demand (`9`)**: `BW-006`, `BW-007`, `BW-010`, `BW-011`, `BW-012`, `BW-013`, `BW-014`, `BW-015`, `BW-016` · **Rare (`2`)**: `BW-001`, `BW-002` |

---

## Evidence Sources

- [../../../commands/](../../../commands/) — `79` flat command files + `5` `commands/_ref/*.md` protocols (`84` files total)
- [../../../cli/install.js](../../../cli/install.js) — Dispatcher for all `12` `boomopen` CLI subcommands
- [../../../rules/CORE.md](../../../rules/CORE.md) · [../../../rules/PHASES.md](../../../rules/PHASES.md) · [../../../rules/ERRORS.md](../../../rules/ERRORS.md)
