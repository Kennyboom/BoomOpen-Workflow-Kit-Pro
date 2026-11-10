# BoomOpen Workflow Kit — Business Workflows Index

| Field | Value |
|-------|-------|
| **Purpose** | Summary index of all `v5.5.0` business workflows, actors, cross-references, and governance metrics for `@boomopen/workflow-kit` |
| **Parent** | [../../../README.md](../../../README.md) |
| **Sibling Packs** | [../business-prd/00-index.md](../business-prd/00-index.md) · [../business-features/00-index.md](../business-features/00-index.md) · [../business-glossary/00-index.md](../business-glossary/00-index.md) |
| **Last Updated** | 2026-11-10 |
| **Version** | 5.5.0 (Smart-Hybrid Edition) |

---

## Quick Summary

BoomOpen Workflow Kit (`@boomopen/workflow-kit` **v5.5.0** — Multi-Platform Unified & Smart-Hybrid Edition) operates through **16 canonical business workflows (`BW-001` – `BW-016`)** coordinated across **8 distinct actor groups**. Workflows span multi-platform installation (`BW-001`–`BW-002`), Turn-1 Proactive Sub-Agent First & 17-language natural-language routing (`BW-003`), 4-Tier Dynamic Elastic Swarm sharding & warm `role#shard` session reuse (`BW-004`), 2-step `O(1)` HSOL v5.5 skill resolution across `1,462` skills (`BW-005`), deterministic CLI-validated research/brainstorming (`BW-006`), UI/UX design contracts (`BW-007`), DAG planning & 1-click Approved-Plan execution (`BW-008`), 5-Stage Fast-Forward & 3-Wave `/cook` execution (`BW-009`), elastic multi-hypothesis SPIE v3.0 debugging & `/fix` (`BW-010`), `18`-team Elastic Golden Diamond adversarial collaboration (`BW-011`), multi-session `/autopilot` ledger execution (`BW-012`), Cross-Engine Conductor & 6-Task Multi-Engine Council synthesis (`BW-013`), 3-Surface `/settings` management (`BW-014`), sequential `/docs` generation (`BW-015`), and graduated `E0–E6` self-healing recovery (`BW-016`).

---

## Sub-Files

| File | Title | Description |
|------|-------|-------------|
| [01-actor-map.md](./01-actor-map.md) | Actor Map | All `8` actor groups (`5` AI platforms, `21` specialist agents, `18` Elastic Golden Diamond teams = `72` files, `12` `boomopen` CLI subcommands, HSOL v5.5, External Multi-Engine Council actors, Users, Maintainers) |
| [02-workflow-catalog.md](./02-workflow-catalog.md) | Workflow Catalog | Complete classification metadata for all `16` workflows (`BW-001` – `BW-016`), triggers across `84` flat command files (`32` base slash commands), CLI gates, complexity, and frequency |
| [03-detailed-workflows.md](./03-detailed-workflows.md) | Detailed Workflows | Step-by-step operational flows, deterministic CLI gates (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `DBG-G1..G4`), and Mermaid diagrams |
| [04-decision-rules-and-exceptions.md](./04-decision-rules-and-exceptions.md) | Decision Rules & Exceptions | Mode A vs Mode B gate, Cognitive Load Sharding Law (`<= 3–4 OWNED_FILES`), Quality-First Model Policy (`Model: "inherit"`), `E0–E6` recovery rules, and exception catalog |
| [05-sla-and-handoffs.md](./05-sla-and-handoffs.md) | SLA & Handoffs | System/AI latency targets, 5-Field Handoff Packet schema, Scoped Warm Session Reuse (`role#shard -> conversationId`), Brain Artifact routing, and SLO summary |

---

## Key `v5.5.0` Facts

| Metric | Canonical `v5.5.0` Value |
|--------|--------------------------|
| Canonical Business Workflows | `16` (`BW-001` – `BW-016`) |
| Actor Groups | `8` (`A-01` – `A-08`) |
| Unified AI Platforms | `5` (Antigravity / Gemini, Claude Code, OpenAI Codex, Cursor, GitHub Copilot) |
| Deterministic `boomopen` CLI Subcommands | `12` (`install`, `uninstall`, `list`, `settings`, `doctor`, `check`, `research`, `design`, `plan`, `cook`, `ledger`, `conduct`) |
| Slash Command Inventory | `32` base commands (`16` multi-variant families + `16` standalone) across **`84` flat files** (`79` `commands/*.md` + `5` `commands/_ref/*.md`) |
| Natural-Language Intent Languages | `17` (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) |
| Specialist Agents | `21` (`agents/*.md`, including `researcher`; default `Model: "inherit"`, `flash_lite` forbidden) |
| Elastic Golden Diamond Teams | `18` (`agents/teams/*-team/` = `54` role files + `18` `_team.md` = **`72` team files**, scaling `1` Lead + `1..6` `role#shard` Executors + `1..3` Critics) |
| Cognitive Load Sharding Ceiling | `<= 3–4` heavy `OWNED_FILES` (or `1` deep vector) per `role#shard`; `maxParallelSubagents = 8` default (`12` max) |
| Skills Vault (`HSOL v5.5`) | **`1,462` indexed skills** (`22` Core in `skills/` + `1,440` Library in `skills_library/` via `matrix-skills/compact-index.json` & `skill-seeker`) |
| Error Recovery Tiers | `8` classes (`E0`, `E1`, `E1b`, `E2`, `E3`, `E4`, `E5`, `E6`) with `0` silent halts |
| Max Team Debate Rounds | `3` warm `send_message` rounds before binding Tech Lead arbitration (or Round-2 Cross-Engine escalation) |

---

## Workflow Distribution by Actor

| Actor | Primary Workflows | Supporting / Gate Role |
|-------|-------------------|------------------------|
| **A-01: Framework User** | `BW-001`, `BW-002`, `BW-014` | Triggers `BW-003`..`BW-015`; clicks `"Proceed"` (`BW-008`, `BW-010`); resolves blocking `E3`/`E4` (`BW-016`) |
| **A-02: Smart-Hybrid Orchestrator** | `BW-003`, `BW-004`, `BW-008`, `BW-009`, `BW-012`, `BW-015`, `BW-016` | Coordinates `BW-005`..`BW-014`; maintains `role#shard -> conversationId` registry |
| **A-03: Specialist Sub-Agents (`21`)** | `BW-006`, `BW-007`, `BW-008`, `BW-009`, `BW-010`, `BW-015` | Execute sharded waves under 5-Field Handoff Packet locks (`BW-004`) |
| **A-04: Elastic Golden Diamond Teams (`18`)** | `BW-011` | Adversarial execution/critique for `:team` variants of `BW-006`..`BW-010` and `BW-012` |
| **A-05: Deterministic `boomopen` CLI (`12` cmds)** | `BW-001`, `BW-002`, `BW-012`, `BW-013`, `BW-014` | Enforces `RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `doctor`, and `check --strict-phase --no-stubs` |
| **A-06: HSOL v5.5 & Skills Vault (`1,462`)** | `BW-005` | Supplies domain `SKILL.md` blueprints and Python audit scripts to `BW-006`..`BW-015` |
| **A-07: Multi-Engine Council Actors** | `BW-013` | Independent cross-family critique (`Author != Critic`) and Round-2 debug escalation (`BW-010`, `BW-016`) |
| **A-08: Maintainer & Contributors** | — | Govern repository releases (`.github/workflows/release.yml`), CI matrix (`.github/workflows/ci.yml`), and kit evolution |

---

## Workflow Dependency Matrix

| Workflow | Depends On | Feeds Into |
|----------|------------|------------|
| `BW-001` (Multi-Platform Install) | Node.js `>= 18` | Enables `BW-002`..`BW-016` across `5` platforms |
| `BW-002` (Manifest-Safe Uninstall) | `BW-001` (`~/.boomopen/manifests/<tool>.json`) | Clean profile teardown |
| `BW-003` (Proactive Gate & 17-Lang Routing) | `BW-001`, `BW-014` (active settings) | Dispatches Mode A direct or Mode B `BW-004`..`BW-015` |
| `BW-004` (Elastic Swarm & Warm Delegation) | `BW-003` | Powers all specialist & `:team` execution (`BW-006`..`BW-015`) |
| `BW-005` (HSOL v5.5 Skill Resolution) | `BW-004`, `compact-index.json` | Injects `SKILL.md` rules into `BW-006`..`BW-015` |
| `BW-006` (Research & Brainstorming) | `BW-004`, `BW-005`, `boomopen research` | Emits `HANDOFF_BRIEF` into `BW-007`, `BW-008`, `BW-009` |
| `BW-007` (Design Spec & Contract) | `BW-004`, `BW-005`, `boomopen design` | Emits `DESIGN_CONTRACT` into `BW-008` and `BW-009` |
| `BW-008` (Plan & Approved-Plan `/code`) | `BW-004`, `boomopen plan` / `cook packets` | Compiles waves for `BW-009` and `.boomopen/project-ledger.json` for `BW-012` |
| `BW-009` (5-Stage Fast-Forward `/cook`) | `BW-006`..`BW-008`, `boomopen cook` / `check` | Verified feature delivery + Brain Artifacts |
| `BW-010` (SPIE Debug & `/fix`) | `BW-004`, `BW-013` (Round-2 escalation) | Proven `DEBUG-{issue}.md` -> verified regression-tested fix |
| `BW-011` (Elastic Golden Diamond `:team`) | `BW-003`, `BW-004` | Consensus-stamped `:team` deliverables across `18` domains |
| `BW-012` (Multi-Session `/autopilot`) | `BW-008`, `boomopen ledger` | Multi-phase verified project delivery across sessions |
| `BW-013` (Conductor & Council `/conduct`) | `BW-001`, `boomopen conduct` | `COUNCIL-SYNTHESIS.md` & cross-family `Author != Critic` verification |
| `BW-014` (3-Surface `/settings`) | `BW-001` | Reconfigures `BOOMOPEN-SETTINGS` blocks in `< 10ms` for `BW-003`..`BW-013` |
| `BW-015` (Repository `/docs` Suite) | `BW-003`, `BW-004` (`docs-manager#s1..k`) | Synchronized `./documents/` knowledge & business packs |
| `BW-016` (Self-Healing `E0–E6` Recovery) | Triggered on any `BW-003`..`BW-015` fault | Warm auto-repair, auto-revive, or structured `ask_question` escalation |

---

## Known Operational Boundaries

| ID | Area | Current `v5.5.0` Boundary | Mitigation in Place |
|----|------|---------------------------|---------------------|
| `OB-001` | Sub-agent Sandbox Constraints | Antigravity's built-in `TypeName: "research"` lacks `search_web`, `run_command`, and `write_file` | Mode B mandates `TypeName: "self", Model: "inherit"` for all `researcher`, `brainstormer`, and artifact-writing `scouter` shards |
| `OB-002` | External Conductor CLI Availability | Cross-engine `/conduct` requires target CLIs (`claude`, `codex`, `agy`) installed and authenticated on host | `boomopen conduct probe` detects installed CLIs and falls back cleanly to queue briefs for IDE-bound tools (`cursor`, `copilot`) |
| `OB-003` | Unpublished Scoped npm Package | `@boomopen/workflow-kit` sets `npmPublish: false` in `.releaserc.json` | Source-only install from `Kennyboom/BoomOpen-Workflow-Kit-Pro` + `npm run test:pack` CI smoke verification |
| `OB-004` | Cross-Platform Artifact Pane | Only Antigravity renders `<appDataDir>/brain/<conversation-id>/` natively with `RequestFeedback` buttons | Automatic fallback to git-ignored `./reports/{topic}/` on Claude Code, Codex, Cursor, and Copilot |

---

## Cross-References & Evidence Sources

- **Architecture & Technical Overview**: [../../knowledge-overview/00-index.md](../../knowledge-overview/00-index.md) · [../../knowledge-architecture/00-index.md](../../knowledge-architecture/00-index.md) · [../../knowledge-domain/00-index.md](../../knowledge-domain/00-index.md) · [../../knowledge-standards/00-index.md](../../knowledge-standards/00-index.md)
- **Skill Orchestration Blueprints**: [../../SMART-SKILL-ORCHESTRATION-BLUEPRINT.md](../../SMART-SKILL-ORCHESTRATION-BLUEPRINT.md) · [../../HSOL-ASSESSMENT.md](../../HSOL-ASSESSMENT.md)
- **Root Entrypoints & Core Rules**: [../../../GEMINI.md](../../../GEMINI.md) · [../../../CLAUDE.md](../../../CLAUDE.md) · [../../../rules/CORE.md](../../../rules/CORE.md) · [../../../rules/PHASES.md](../../../rules/PHASES.md) · [../../../rules/AGENTS.md](../../../rules/AGENTS.md) · [../../../rules/TEAMS.md](../../../rules/TEAMS.md) · [../../../rules/SKILLS.md](../../../rules/SKILLS.md) · [../../../rules/ERRORS.md](../../../rules/ERRORS.md)
- **CLI & Workflow Implementations**: [../../../cli/install.js](../../../cli/install.js) · [../../../commands/](../../../commands/) · [../../../agents/](../../../agents/) · [../../../matrix-skills/compact-index.json](../../../matrix-skills/compact-index.json)
