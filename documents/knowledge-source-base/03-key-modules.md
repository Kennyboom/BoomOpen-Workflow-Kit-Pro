# BoomOpen Workflow Kit — Key Modules

> **Purpose**: Per-module breakdown of purpose, exports, dependencies, and internal architecture across all `10` major modules in `@boomopen/workflow-kit` `v5.5.0`
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Edition**: `@boomopen/workflow-kit` `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)

---

## Table of Contents

- [Overview](#overview)
- [Module 1: Modular CLI Suite (`cli/`)](#module-1-modular-cli-suite-cli)
- [Module 2: Specialist Agents & Elastic Teams (`agents/`)](#module-2-specialist-agents--elastic-teams-agents)
- [Module 3: Flat Slash Commands & Protocols (`commands/`)](#module-3-flat-slash-commands--protocols-commands)
- [Module 4: On-Demand Orchestration Rules (`rules/`)](#module-4-on-demand-orchestration-rules-rules)
- [Module 5: Matrix Skills & O(1) Compact Index (`matrix-skills/`)](#module-5-matrix-skills--o1-compact-index-matrix-skills)
- [Module 6: Core Skills & On-Demand Library Vault (`skills/` & `skills_library/`)](#module-6-core-skills--on-demand-library-vault-skills--skills_library)
- [Module 7: Platform Bundles & Security Hook (`platforms/`)](#module-7-platform-bundles--security-hook-platforms)
- [Module 8: Root Entrypoints, Python Helpers & Localization (`*.md`, `scripts/`, `i18n/`)](#module-8-root-entrypoints-python-helpers--localization-md-scripts-i18n)
- [Module 9: Web Marketing Site (`web/`)](#module-9-web-marketing-site-web)
- [Module 10: Documentation & CI/CD Automation (`documents/` & `.github/`)](#module-10-documentation--cicd-automation-documents--github)
- [Module Dependency Map](#module-dependency-map)
- [Evidence Sources](#evidence-sources)

---

## Overview

BoomOpen Workflow Kit `v5.5.0` combines **declarative multi-agent orchestration content** (Markdown entrypoints, rules, flat slash commands, specialist agents, Elastic Golden Diamond teams, and a `1,462`-skill vault) with **deterministic executable tooling**:
1. **Modular Node.js CLI Suite (`cli/`)** — `41` production CommonJS modules (`cli/install.js` + `40` focused domain modules) and `29` `node:test` suites with zero runtime npm dependencies.
2. **Python Automation Helpers (`scripts/`)** — `7` cross-platform Python `>=3.10` verification and preview utilities.
3. **Standalone Marketing Website (`web/`)** — Independent React 19 + Vite 7 + Tailwind CSS 4 web application with `kit-stats.test.mjs` live repository sync.

---

## Module 1: Modular CLI Suite (`cli/`)

### Purpose
Provides manifest-safe multi-platform installation, the 3-Surface Control Center (`settings` + local Web UI), kit health auditing (`doctor`), Pragmatic 2-Tier & anti-stub code verification (`check`), deterministic workflow artifact compilers (`research`, `design`, `plan`, `cook`), multi-session project ledgers (`ledger`), and cross-engine consensus orchestration (`conduct`).

### Subsystem Breakdown (`41` Production Modules + `29` Test Suites)

| Subsystem | Production Modules | Core Responsibilities |
|-----------|--------------------|-----------------------|
| **1. CLI Router & Installer Core** | `install.js`, `tool-config.js`, `platform-paths.js`, `copy-engine.js`, `install-steps.js`, `install-ownership.js`, `progress.js`, `cli-args.js`, `markdown-fences.js` | `boomopen` binary dispatch (`12` subcommands), `TOOLS` & `buildPlan()` for 5 platforms, `CORE_DIRS` / `ROOT_FILES` / `VERBATIM_DIRS`, symlink-safe copy, installed-copy protection |
| **2. Manifest, Instruction & Config Safety** | `manifest.js`, `instruction-files.js`, `markers.js`, `user-files.js`, `legacy-skills.js`, `codex-config.js`, `toml-lite.js`, `hook-registration.js` | Per-file SHA-256 `InstallLedger` (`~/.boomopen/manifests/<tool>.json`), `~/.boomopen/backups/`, `<!-- boomopen-workflow-kit-START/END -->` merges, TOML-validated `~/.codex/config.toml` blocks, opt-in Claude `PreToolUse` hook |
| **3. Control Center Settings & Web UI** | `settings.js`, `settings-schema.js`, `settings-store.js`, `settings-sync.js`, `settings-ui.js`, `settings-ui-html.js`, `settings-http.js` | `4` presets (`smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team`), `20` enum + `2` line-limit keys, `< 10ms` AOT injection into `<!-- BOOMOPEN-SETTINGS-START/END -->`, local HTTP UI (`127.0.0.1:4567`) |
| **4. Health Auditor & Skill Indexer** | `doctor.js`, `doctor-version.js`, `doctor-index.js`, `doctor-markdown.js`, `doctor-platforms.js`, `doctor-settings.js` | Validates source & installed bundles (`install-files.json`), Markdown line limits & mojibake, settings integrity, Conductor CLIs, and compiles `matrix-skills/compact-index.json` (`--rebuild-index`) |
| **5. Pragmatic 2-Tier Code Checker** | `checker.js`, `checker-rules.js`, `checker-strip.js`, `checker-text.js` | Audits soft (`400`) / hard (`500`) file line ceilings, explicit `any`, leftover `console.log`, plus `--strict-phase --no-stubs` checks against `TODO`/`FIXME`, hollow stubs, and `.skip`/`.only` test gaming |
| **6. Deterministic Workflow Compilers & Ledger** | `research.js`, `design.js`, `plan.js`, `cook.js`, `ledger.js` | Enforces `RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, compiles `HANDOFF_BRIEF` / `DESIGN_CONTRACT` / 5-Field Wave Packets, and manages `.boomopen/project-ledger.json` with SHA-256 spec-hash drift guards |
| **7. Cross-Engine Conductor & Council** | `conductor.js`, `conductor-engines.js` | Probes installed AI CLIs, enforces `Author != Critic` cross-family pipelines with SHA-256 `READ_ONLY_FILES` guards, and runs 6-task Parallel Multi-Engine Councils (`research\|brainstorm\|plan\|design\|review\|debug`) |
| **8. Automated Verification** | `29` `cli/*.test.js` suites + `sandbox.test-helper.js` + `data/legacy-bundled-skills.json` | Full unit, E2E, regression, packaging, hook-guard, content-integrity, and Python-syntax test coverage in isolated sandboxed `HOME` directories |

### Key Exports from `cli/install.js`
`TOOLS`, `TOOL_KEYS`, `ROOT_FILES`, `CORE_DIRS`, `KIT_DIR_NAME`, `installTool`, `uninstallTool`, `parseArgs`, `main`, `buildCompactSkillIndex`, `runDoctor`, `runCheck`, `runCookCli`, `detectCookState`, `compileWavePackets`, `verifyWaveExecution`, `runCookPreflight`, `runResearchCli`, `validateResearch`, `extractResearchBrief`, `runDesignCli`, `validateDesign`, `extractDesignContract`, `runPlanCli`, `validatePlan`, `compilePlanToLedger`, `runLedgerCli`, `initLedger`, `validateLedger`, `verifyPhaseGate`, `auditLedger`, `runConductorCli`, `dispatchToEngine`, `runMultiEngineCouncil`, `resolveEngineForRole`, `loadSettings`, `saveSettings`, `applyPreset`, `syncSettingsToInstalledPlatforms`, `runSettingsCommand`, `startSettingsUiServer`.

### Security & Ownership Guarantees
- **Zero Blind Overwrites**: Shared user files are hashed (SHA-256) in `~/.boomopen/manifests/<tool>.json`; user files are backed up before replacement and preserved on uninstall if modified.
- **Symlink & Traversal Protection**: `copy-engine.js` skips symbolic links, hidden files, `__pycache__/`, and excluded vault demo/benchmark folders.
- **Installed-Copy Guard**: `installedCopyProblem()` prevents `install` / `uninstall` from running inside an installed `<skills>/boomopen-workflow-kit/cli/` directory.

---

## Module 2: Specialist Agents & Elastic Teams (`agents/`)

### Purpose
Defines the domain-specialist personas and adversarial team topologies dispatched by the Orchestrator in Mode B (`<= 450` lines per file).

### Inventory (`93` Markdown Files Total)

| Category | Count | Location | Details |
|----------|:-----:|----------|---------|
| **Solo Specialist Agents** | `21` | `agents/*.md` | `backend-engineer`, `brainstormer`, `business-analyst`, `database-architect`, `debugger`, `designer`, `devops-engineer`, `docs-manager`, `frontend-engineer`, `game-engineer`, `mobile-engineer`, `performance-engineer`, `planner`, `project-manager`, `reporter`, `researcher`, `reviewer`, `scouter`, `security-engineer`, `tech-lead`, `tester` |
| **Elastic Golden Diamond Teams** | `18` teams (`72` files) | `agents/teams/*-team/` | `backend-team`, `brainstorm-team`, `database-team`, `debug-team`, `design-team`, `devops-team`, `docs-team`, `frontend-team`, `fullstack-team`, `game-team`, `mobile-team`, `performance-team`, `planning-team`, `project-team`, `qa-team`, `report-team`, `research-team`, `security-team` (`54` role files `techlead.md` + `executor.md` + `reviewer.md`, plus `18` `_team.md` specs) |

### Elastic Golden Diamond Topology (`v5.5`)
Replaces fixed 3-agent bottlenecks with dynamic **Cognitive Load Sharding** (`N_agents = min(maxParallelSubagents, max(ceil(Files / 3.5), Domains, Vectors))`):
- Scales elastically from **`1-1-1`** (`3` agents when `<= 4` target files) up to **`1 Tech Lead + 1..6 Parallel Shard Executors (`role#shard`, `<= 3-4 OWNED_FILES` each) + 1..3 Parallel Critics`** communicating via shared `MAILBOX` artifacts and warm `send_message` sessions (`maxDebateRounds = 3` default).

---

## Module 3: Flat Slash Commands & Protocols (`commands/`)

### Purpose
Provides the `32` user-facing slash commands and `17`-language natural-language workflow targets (`<= 450` lines per file).

### 100% Flat File Layout (`84` Files Total)
Zero nested command variant subdirectories exist; every command and variant lives directly at `commands/*.md`, accompanied by `commands/_ref/` for shared loop protocols:
- **`16` Multi-Variant Command Families (`63` files)**:
  - `:fast | :hard | :team` (`11` families × `4` files = `44` files): `/cook`, `/code`, `/plan`, `/design`, `/research`, `/brainstorm`, `/debug`, `/fix`, `/test`, `/review`, `/report` (e.g., `commands/cook.md`, `commands/cook-fast.md`, `commands/cook-hard.md`, `commands/cook-team.md`).
  - `/docs` (`4` files): `docs.md`, `docs-core.md`, `docs-business.md`, `docs-audit.md`.
  - `/deploy` (`5` files): `deploy.md`, `deploy-check.md`, `deploy-preview.md`, `deploy-production.md`, `deploy-rollback.md`.
  - `/autopilot` (`4` files): `autopilot.md`, `autopilot-init.md`, `autopilot-run.md`, `autopilot-audit.md`.
  - `/conduct` (`3` files): `conduct.md`, `conduct-council.md`, `conduct-pipeline.md`.
  - `/ask` (`3` files): `ask.md`, `ask-fast.md`, `ask-hard.md`.
- **`16` Standalone Commands (`16` files)**: `settings.md`, `orchestrate.md`, `save.md`, `recap.md`, `init.md`, `next.md`, `status.md`, `preview.md`, `rollback.md`, `architect.md`, `auto.md`, `refactor.md`, `performance.md`, `security-audit.md`, `deep-audit.md`, `ui-ux-pro-max.md`.
- **`5` Shared Reference Protocols (`commands/_ref/`)**: `convergent-analysis-loop.md`, `docs-folder-specs.md`, `docs-recon-protocol.md`, `golden-triangle-protocol.md`, `implementation-loop.md`.

---

## Module 4: On-Demand Orchestration Rules (`rules/`)

### Purpose
Defines the Mode B Orchestrator operating system across `7` focused Markdown files (`<= 300` lines each). Unlike legacy eager-loading designs, `v5.5` pre-embeds the Turn-1 Gate and 5-Field Handoff Packet inside the platform entrypoint so `rules/*.md` are loaded **strictly on demand** when Mode B or `/cmd` triggers.

| File | Load Condition | Key `v5.5` Mechanics |
|------|----------------|----------------------|
| [`CORE.md`](../../rules/CORE.md) | Mode B orchestration & deliverable routing | 4-Tier Elastic Swarm (`Tier 0..3`), 17-Language NL Router, Quality-First `Model: "inherit"`, Laws `L1-L10`, Brain Artifact routing |
| [`PHASES.md`](../../rules/PHASES.md) | Multi-phase DAG workflows | DAG Parallel Fan-Out, 5-Stage `/cook` Fast-Forward, Contract-First wave locks |
| [`AGENTS.md`](../../rules/AGENTS.md) | Sub-agent shard delegation | Direct Plan-to-Executor Dispatch, Active Sub-agent Session Registry (`role#shard -> conversationId`), `OWNED_FILES` / `SHARED_CONTRACT` |
| [`TEAMS.md`](../../rules/TEAMS.md) | `:team` adversarial workflows | Elastic Golden Diamond (`1-N-M`), `MAILBOX` critique rounds, convergence rules |
| [`SKILLS.md`](../../rules/SKILLS.md) | Niche skill resolution & CLI gates | Fast 2-Step `O(1)` lookup (`<skills>` -> `compact-index.json` / `skill-seeker`) & Warm Auto-Repair on CLI gate failure |
| [`ERRORS.md`](../../rules/ERRORS.md) | Error recovery | `E0` warm shard auto-revive, `E2`/`E5` gate repair loops |
| [`REFERENCE.md`](../../rules/REFERENCE.md) | Fast lookup | Consolidated command, agent, team, and CLI gate cheat sheets |

---

## Module 5: Matrix Skills & O(1) Compact Index (`matrix-skills/`)

### Purpose
Implements the **Hybrid Skill Orchestration Layer (`HSOL v5.5`)** metadata and pre-compiled `O(1)` index across `19` engineering domains (`1,462` unique skills; `1,476` domain mappings where `14` cross-domain skills appear in `2` domains).

### Fast 2-Step `O(1)` Resolution Flow
1. **Step 1 — Pre-Loaded `<skills>` Check (`0ms`)**: Check the `22` Core Skills already visible in the system prompt `<skills>` catalog; if matched, read its `SKILL.md` directly.
2. **Step 2 — `compact-index.json` / `skill-seeker` Lookup (`O(1)`)**: For niche frameworks or domains, query `matrix-skills/compact-index.json` (`1,462` entries mapping `skillId -> { domain, priority, category, path }`) via `skills/skill-seeker/SKILL.md` and read **only** the matched `SKILL.md` from `<skills>_library/` — never scanning all `19` YAML files in prompt context.

### Files in `matrix-skills/`
- `compact-index.json`: Pre-compiled JSON index (`totalSkills: 1462`), built and verified by `boomopen doctor --rebuild-index` (`cli/doctor-index.js`).
- `_index.yaml`: Master domain registry (`19` domains: `ai-ml`, `architecture`, `backend`, `cloud`, `data`, `design`, `devops`, `frontend`, `gaming`, `languages`, `management`, `mcp`, `mobile`, `performance`, `planning`, `quality`, `research`, `security`, `tools`), `21` `agent_profiles`, fitness weights, and trust progression rules.
- `_dynamic.yaml`: Manifest for community-installed dynamic skills (`npx skills add`).
- `19` `{domain}.yaml` files: Curated priority (`1-10`) and profile mappings maintained as the source of truth for `compact-index.json`.

---

## Module 6: Core Skills & On-Demand Library Vault (`skills/` & `skills_library/`)

### Purpose
Splits the `1,462` skill definitions into a two-tier storage model to eliminate idle prompt token bloat:
- **`skills/` (`22` Pre-Loaded Core Skills + `doc.md`, plus root `SKILL.md`)**: Installed directly into `~/.<tool>/skills/` (`~/.gemini/config/skills/` on Antigravity):
  `api-patterns`, `app-builder`, `behavioral-modes`, `brainstorming`, `clean-code`, `database-design`, `debugger`, `deep-research`, `design-spec`, `frontend-architecture`, `frontend-design`, `game-developer`, `intelligent-routing`, `mobile-design`, `mobile-developer`, `plan-writing`, `security-auditor`, `seo-fundamentals`, `skill-seeker`, `tdd-workflow`, `testing-patterns`, `webapp-testing`.
- **`skills_library/` (`1,440` Dormant On-Demand Library Skills)**: Installed verbatim (`VERBATIM_DIRS`) into `~/.<tool>/skills_library/` (`~/.gemini/config/skills_library/` on Antigravity) so the IDE does not pre-load `1,440` descriptions on every turn. Third-party attributions are verified by `.github/scripts/third-party-notices.js --check` against [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).

---

## Module 7: Platform Bundles & Security Hook (`platforms/`)

### Purpose
Adapts the unified orchestration core to the native instruction, sub-agent, rule, and hook conventions of all `5` AI platforms:

| Bundle | Assets | Installed Role |
|--------|--------|----------------|
| `platforms/antigravity/` | `GEMINI.md`, `AntigravityGlobal.agent.md`, `hooks/validate-tool-call.mjs` | Native Antigravity 2.0 `invoke_subagent` (`TypeName: "self"` / `"research"`), Brain Artifact routing, and universal opt-in destructive-command guard |
| `platforms/claude/` | `CLAUDE.md` | Native Claude Code `Task` parallel sub-agents & `--with-hooks` `PreToolUse` guard registration |
| `platforms/codex/` | `CODEX.md`, `config.toml`, `agents/*.toml` (`21`), `skills/boomopen-workflow-kit-*` (`79`) | Native Codex `AGENTS.md`, `multi_agent = true` TOML roles in `~/.codex/agents/boomopen/`, and `79` generated command skills |
| `platforms/copilot/` | `boomopen-workflow-kit.agent.md` | VS Code Copilot Agent Mode prompt (`<VSCodeUser>/prompts/`) |
| `platforms/cursor/` | `.cursorrules`, `rules/boomopen-workflow-kit.mdc` | Global `~/.cursor/CURSOR.md` + native `.mdc` rule (`~/.cursor/rules/boomopen-workflow-kit.mdc`) |

---

## Module 8: Root Entrypoints, Python Helpers & Localization (`*.md`, `scripts/`, `i18n/`)

- **Root Entrypoints (`6` files, `<= 250` lines)**: `GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md` — shipped in `package.json` `files` and synchronized with AOT settings markers.
- **Python Automation Scripts (`scripts/`, `7` files)**: `auto_preview.py`, `checklist.py`, `kit_checks.py`, `kit_console.py`, `kit_process.py`, `session_manager.py`, `verify_all.py` — shipped in `CORE_DIRS` and syntax-checked against Python `3.10` in CI and `cli/python-scripts.test.js`.
- **Multilingual READMEs (`i18n/`, `16` files)**: `README.{vi,zh-CN,zh-TW,ja,ko,es,fr,de,pt-BR,ru,hi,ar,id,th,tr,it}.md` (`130-450` lines each), audited for Mermaid diagrams, command coverage, and platform parity by `cli/docs-content.test.js`.

---

## Module 9: Web Marketing Site (`web/`)

### Purpose
Standalone React 19 + Vite 7 + Tailwind CSS 4 marketing site deployed to Vercel (excluded from `package.json` `files`).

| Layer | Files / Packages | Notes |
|-------|------------------|-------|
| **Runtime Deps** | `react` `19.2.0`, `react-dom` `19.2.0`, `react-router-dom` `7.13.0`, `framer-motion` `12.29.2`, `lucide-react` `0.563.0`, `@xyflow/react` `12.10.0`, `clsx` `2.1.1` | Zero runtime coupling to `cli/` |
| **Build & Sync** | `vite` `7.2.4`, `@tailwindcss/vite` `4.1.18`, `typescript` `~5.9.3`, `eslint` `9.39.1`, `web/build/kit-stats.mjs`, `web/build/site-plugin.ts` | `kit-stats.mjs` writes `src/data/kit-stats.json`; `kit-stats.test.mjs` runs as the 30th suite in root `npm test` |

---

## Module 10: Documentation & CI/CD Automation (`documents/` & `.github/`)

- **`documents/`**: Houses [`SMART-SKILL-ORCHESTRATION-BLUEPRINT.md`](../SMART-SKILL-ORCHESTRATION-BLUEPRINT.md), [`HSOL-ASSESSMENT.md`](../HSOL-ASSESSMENT.md), five `knowledge-*` technical packs (`overview`, `architecture`, `domain`, `source-base`, `standards`), and four `business/business-*` packs (`prd`, `features`, `workflows`, `glossary`). Shipped in `package.json` `files` and copied verbatim via `CORE_DIRS`.
- **`.github/`**: Houses [`workflows/ci.yml`](../../.github/workflows/ci.yml), [`workflows/release.yml`](../../.github/workflows/release.yml), [`RELEASING.md`](../../.github/RELEASING.md), and `6` automation scripts in `.github/scripts/`.

---

## Module Dependency Map

```text
User / IDE Session
  └── Root or Platform Entrypoint (GEMINI.md, CLAUDE.md, CODEX.md, COPILOT.md, CURSOR.md, AGENT.md)
        ├── AOT Settings Block (<-- ~/.boomopen/settings.json & ./.boomopen.json via cli/settings-sync.js)
        ├── Mode A (<= 2 known files) ──> Direct execution + Pragmatic 2-Tier Standards
        └── Mode B (> 2 files, >= 2 domains, 17-lang NL intent, or /cmd)
              ├── commands/{cmd}.md & commands/{cmd}-{variant}.md (+ commands/_ref/*.md)
              ├── rules/{CORE,PHASES,AGENTS,TEAMS,SKILLS,ERRORS,REFERENCE}.md (on demand)
              ├── agents/*.md (21 specialists) & agents/teams/*-team/ (18 Elastic Golden Diamond teams)
              ├── skills/* (22 Core Skills) + matrix-skills/compact-index.json -> skills_library/* (1,440 skills)
              └── cli/install.js deterministic gates (research, design, plan, cook, check, ledger, conduct, doctor)
```

---

## Evidence Sources

| File | Verification Purpose |
|------|----------------------|
| [../../cli/install.js](../../cli/install.js) | Verified all `12` subcommands and module exports |
| [../../cli/tool-config.js](../../cli/tool-config.js) | Verified `CORE_DIRS`, `ROOT_FILES`, `VERBATIM_DIRS`, and 5-platform install plans |
| [../../cli/manifest.js](../../cli/manifest.js) | Verified `InstallLedger` SHA-256 ownership and backup restoration |
| [../../cli/settings-schema.js](../../cli/settings-schema.js) | Verified `4` presets, `20` enum keys, and `2` line-limit keys |
| [../../rules/CORE.md](../../rules/CORE.md) & [../../rules/SKILLS.md](../../rules/SKILLS.md) | Verified 4-Tier Elastic Swarm, 17-language routing, Laws `L1-L10`, and 2-Step `O(1)` skill lookup |
| [../../web/vite.config.ts](../../web/vite.config.ts) & [../../web/build/kit-stats.mjs](../../web/build/kit-stats.mjs) | Verified Vite 7 build setup and live repository stats synchronization |
