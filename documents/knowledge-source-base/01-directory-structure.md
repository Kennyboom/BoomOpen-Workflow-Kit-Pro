# BoomOpen Workflow Kit — Directory Structure

> **Purpose**: Complete annotated directory tree (depth 3-4) with functional purpose of every top-level directory and root file in `v5.5.0`
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Edition**: `@boomopen/workflow-kit` `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)

---

## Table of Contents

1. [Root Directory Overview](#root-directory-overview)
2. [Annotated Directory Tree](#annotated-directory-tree)
3. [Top-Level Directory Purposes](#top-level-directory-purposes)
4. [Root File Purposes](#root-file-purposes)
5. [File Count Summary](#file-count-summary)
6. [Evidence Sources](#evidence-sources)

---

## Root Directory Overview

The `BoomOpen-Workflow-Kit-Pro` repository root is organized into **14 tracked top-level directories** (`.github/`, `agents/`, `assets/`, `cli/`, `commands/`, `documents/`, `i18n/`, `matrix-skills/`, `platforms/`, `rules/`, `scripts/`, `skills/`, `skills_library/`, `web/`) and **19 root-level files**. The codebase maintains a strict separation of concerns across:
- **Core Orchestration Content** (`agents/`, `commands/`, `rules/`, `matrix-skills/`, `scripts/`, `documents/`) copied into `<skills>/boomopen-workflow-kit/` (`CORE_DIRS` + `cli/`).
- **2-Tier Skills Vault** (`skills/` with `22` pre-loaded Core Skills + `skills_library/` with `1,440` dormant On-Demand Library Skills).
- **Modular Deterministic CLI** (`cli/` with `install.js` + `40` modular production `.js` files and `29` `node:test` suites).
- **Platform Bundles & Localization** (`platforms/` for all `5` AI coding assistants and `i18n/` for `16` localized READMEs).
- **CI/CD & Independent Web Site** (`.github/` workflows/scripts and `web/` React 19 + Vite 7 marketing application).

---

## Annotated Directory Tree

```text
BoomOpen-Workflow-Kit-Pro/                  # Repository root — @boomopen/workflow-kit v5.5.0
│
├── package.json                            # Manifest: bin.boomopen -> ./cli/install.js, 28 scripts, files
├── package-lock.json                       # Locked devDependency tree (semantic-release toolchain)
├── .releaserc.json                         # semantic-release config (main branch, npmPublish: false, release-guard)
├── .gitignore                              # Excludes node_modules, dist, .env, reports/, .boomopen.json, etc.
├── .gitattributes                          # Enforces LF line endings (* text=auto eol=lf)
├── LICENSE                                 # MIT license for kit source code
├── THIRD_PARTY_NOTICES.md                  # Attribution and license manifest for vendored skills_library/ skills
├── SECURITY.md                             # Security policy, manifest safety model, and opt-in PreToolUse hook docs
├── README.md                               # Canonical English documentation (copied in ROOT_FILES)
├── SKILL.md                                # Root framework skill descriptor (copied in ROOT_FILES)
├── CHANGELOG.md                            # Semantic-release version history
│
├── AGENT.md                                # Platform-agnostic Orchestrator entrypoint (<= 250 lines)
├── AGENT-TEMPLATE.md                       # Authoring spec for specialist agent Markdown files
├── CLAUDE.md                               # Claude Code root Orchestrator entrypoint (<= 250 lines)
├── CODEX.md                                # OpenAI Codex root Orchestrator entrypoint (<= 250 lines)
├── COPILOT.md                              # GitHub Copilot root Orchestrator entrypoint (<= 250 lines)
├── CURSOR.md                               # Cursor root Orchestrator entrypoint (<= 250 lines)
├── GEMINI.md                               # Antigravity (Gemini) root Orchestrator entrypoint (<= 250 lines)
│
├── .github/                                # GitHub Actions CI/CD & release verification scripts
│   ├── RELEASING.md                        # Manual release runbook & npmPublish: false policy
│   ├── workflows/
│   │   ├── ci.yml                          # Cross-OS CI matrix (Ubuntu/Windows/macOS; CLI, Python/Sh, Web, Pack)
│   │   └── release.yml                     # Manual workflow_dispatch release pipeline (dry_run default: true)
│   └── scripts/
│       ├── check-syntax.js                 # `npm run lint`: node --check across CLI, tests, hooks, scripts
│       ├── generate-codex-skills.js        # Generates 79 native Codex command skills from commands/*.md
│       ├── npm-pack.js                     # Clean cross-platform tarball packer helper
│       ├── pack-smoke.js                   # `npm run test:pack`: pack, extract, doctor & sandboxed install test
│       ├── release-guard.js                # Pre-release verification hook for semantic-release
│       └── third-party-notices.js          # Verifies/regenerates THIRD_PARTY_NOTICES.md against skills_library/
│
├── agents/                                 # 21 solo specialist agents + 18 Elastic Golden Diamond teams (93 files)
│   ├── backend-engineer.md                 # Server-side API, service, and systems implementation
│   ├── brainstormer.md                     # Product & architecture option exploration and MCDA scoring
│   ├── business-analyst.md                 # PRD, stakeholder, workflow, and domain glossary analysis
│   ├── database-architect.md               # Schema design, migrations, indexing, and RLS policies
│   ├── debugger.md                         # 5-Whys (SPIE v3.0) root-cause investigation
│   ├── designer.md                         # OKLCH design tokens, 5-State UI Matrix, WCAG 2.2 AA specs
│   ├── devops-engineer.md                  # CI/CD pipelines, infrastructure, and deployment safety
│   ├── docs-manager.md                     # Technical and business documentation synchronization
│   ├── frontend-engineer.md                # Web UI architecture, components, and state management
│   ├── game-engineer.md                    # Unity 6, Godot 4, Unreal 5, WebGPU, and netcode engineering
│   ├── mobile-engineer.md                  # React Native, Flutter, iOS/Android, and Tauri v2 mobile apps
│   ├── performance-engineer.md             # Profiling, Core Web Vitals, and latency optimization
│   ├── planner.md                          # Contract-First DAG planning (SHARED_CONTRACT + OWNED_FILES)
│   ├── project-manager.md                  # Multi-phase delivery tracking and ledger coordination
│   ├── reporter.md                         # Executive status synthesis and verification reporting
│   ├── researcher.md                       # 4-Source Triangulation and multi-wave technical research
│   ├── reviewer.md                         # Adversarial code, contract, and quality gate review
│   ├── scouter.md                          # Fast read-only codebase mapping and reconnaissance
│   ├── security-engineer.md                # OWASP Top 10 / LLM security auditing and hardening
│   ├── tech-lead.md                        # Architectural arbitration and Golden Diamond team leadership
│   ├── tester.md                           # Unit, integration, E2E, and regression verification
│   └── teams/                              # 18 team folders x (3 role files + _team.md) = 72 team files
│       ├── backend-team/                   # techlead.md, executor.md, reviewer.md, _team.md
│       ├── brainstorm-team/                # techlead.md, executor.md, reviewer.md, _team.md
│       ├── database-team/                  # techlead.md, executor.md, reviewer.md, _team.md
│       ├── debug-team/                     # techlead.md, executor.md, reviewer.md, _team.md
│       ├── design-team/                    # techlead.md, executor.md, reviewer.md, _team.md
│       ├── devops-team/                    # techlead.md, executor.md, reviewer.md, _team.md
│       ├── docs-team/                      # techlead.md, executor.md, reviewer.md, _team.md
│       ├── frontend-team/                  # techlead.md, executor.md, reviewer.md, _team.md
│       ├── fullstack-team/                 # techlead.md, executor.md, reviewer.md, _team.md
│       ├── game-team/                      # techlead.md, executor.md, reviewer.md, _team.md
│       ├── mobile-team/                    # techlead.md, executor.md, reviewer.md, _team.md
│       ├── performance-team/               # techlead.md, executor.md, reviewer.md, _team.md
│       ├── planning-team/                  # techlead.md, executor.md, reviewer.md, _team.md
│       ├── project-team/                   # techlead.md, executor.md, reviewer.md, _team.md
│       ├── qa-team/                        # techlead.md, executor.md, reviewer.md, _team.md
│       ├── report-team/                    # techlead.md, executor.md, reviewer.md, _team.md
│       ├── research-team/                  # techlead.md, executor.md, reviewer.md, _team.md
│       └── security-team/                  # techlead.md, executor.md, reviewer.md, _team.md
│
├── assets/                                 # Visual media assets (launch trailer poster/MP4 links for READMEs)
│
├── cli/                                    # Modular CommonJS CLI suite (zero external runtime deps)
│   ├── install.js                          # Primary `boomopen` binary router (12 subcommands)
│   ├── tool-config.js                      # 5-platform TOOLS map, buildPlan(), CORE_DIRS, ROOT_FILES, VERBATIM_DIRS
│   ├── copy-engine.js                      # Placeholder rendering, symlink-safe traversal, vault skip filters
│   ├── install-steps.js                    # Framework install, shared folder sync, legacy cleanup
│   ├── install-ownership.js                # Installed-copy guard, pre-manifest migration, tool dir tracking
│   ├── manifest.js                         # InstallLedger (~/.boomopen/manifests/<tool>.json) & SHA-256 backups
│   ├── instruction-files.js                # Marked kit block merge/strip for global instruction files
│   ├── markers.js                          # HTML/TOML block delimiter constants
│   ├── user-files.js                       # Atomic backup and user-file preservation helpers
│   ├── legacy-skills.js                    # Safe migration of older bundled skills using cli/data/
│   ├── codex-config.js                     # TOML-aware managed block merge/unmerge for ~/.codex/config.toml
│   ├── toml-lite.js                        # Zero-dependency TOML parser/validator
│   ├── hook-registration.js                # Opt-in Claude Code PreToolUse hook registration
│   ├── platform-paths.js                   # Cross-OS VS Code prompts & home path resolution
│   ├── progress.js                         # TTY progress bar and non-TTY milestone logger
│   ├── cli-args.js                         # Shared CLI flag/option parser
│   ├── markdown-fences.js                  # Fenced code-block aware Markdown scanner
│   ├── settings*.js                        # 7 modules: settings, schema, store, sync, ui, ui-html, http
│   ├── doctor*.js                          # 6 modules: doctor, version, index, markdown, platforms, settings
│   ├── checker*.js                         # 4 modules: checker, rules, strip, text (2-Tier + anti-stub gates)
│   ├── research.js                         # `boomopen research <validate|brief>` (RES-G1..G4)
│   ├── design.js                           # `boomopen design <validate|contract>` (DESIGN-G1..G4)
│   ├── plan.js                             # `boomopen plan <validate|compile>` (PLAN-G1..G5)
│   ├── cook.js                             # `boomopen cook <state|packets|verify-wave|preflight>` (COOK-G1..G4)
│   ├── ledger.js                           # `boomopen ledger` (.boomopen/project-ledger.json & SHA-256 drift guard)
│   ├── conductor*.js                       # 2 modules: conductor.js & conductor-engines.js (multi-engine council)
│   ├── data/
│   │   └── legacy-bundled-skills.json      # Historical bundled skill list for safe upgrade cleanup
│   ├── *.test.js                           # 29 node:test suites + sandbox.test-helper.js
│   └── README.md                           # CLI command, target path, and safety model documentation
│
├── commands/                               # 100% flat command workflows (79 *.md + 5 _ref/*.md = 84 files)
│   ├── cook.md, cook-fast.md, cook-hard.md, cook-team.md
│   ├── code.md, code-fast.md, code-hard.md, code-team.md
│   ├── plan.md, plan-fast.md, plan-hard.md, plan-team.md
│   ├── design.md, design-fast.md, design-hard.md, design-team.md
│   ├── research.md, research-fast.md, research-hard.md, research-team.md
│   ├── brainstorm.md, brainstorm-fast.md, brainstorm-hard.md, brainstorm-team.md
│   ├── debug.md, debug-fast.md, debug-hard.md, debug-team.md
│   ├── fix.md, fix-fast.md, fix-hard.md, fix-team.md
│   ├── test.md, test-fast.md, test-hard.md, test-team.md
│   ├── review.md, review-fast.md, review-hard.md, review-team.md
│   ├── report.md, report-fast.md, report-hard.md, report-team.md
│   ├── docs.md, docs-core.md, docs-business.md, docs-audit.md
│   ├── deploy.md, deploy-check.md, deploy-preview.md, deploy-production.md, deploy-rollback.md
│   ├── autopilot.md, autopilot-init.md, autopilot-run.md, autopilot-audit.md
│   ├── conduct.md, conduct-council.md, conduct-pipeline.md
│   ├── ask.md, ask-fast.md, ask-hard.md
│   ├── settings.md, orchestrate.md, save.md, recap.md, init.md, next.md, status.md, preview.md
│   ├── rollback.md, architect.md, auto.md, refactor.md, performance.md, security-audit.md
│   ├── deep-audit.md, ui-ux-pro-max.md     # (16 standalone commands)
│   └── _ref/                               # 5 shared reference protocols (<= 450 lines each)
│       ├── convergent-analysis-loop.md
│       ├── docs-folder-specs.md
│       ├── docs-recon-protocol.md
│       ├── golden-triangle-protocol.md
│       └── implementation-loop.md
│
├── documents/                              # Technical knowledge base & business documentation pack
│   ├── HSOL-ASSESSMENT.md                  # HSOL evaluation & architecture trade-off analysis
│   ├── SMART-SKILL-ORCHESTRATION-BLUEPRINT.md
│   ├── knowledge-overview/                 # 00-index..04-getting-started
│   ├── knowledge-architecture/             # 00-index..05-decisions
│   ├── knowledge-domain/                   # 00-index..04-business-rules
│   ├── knowledge-source-base/              # 00-index..04-configuration (this pack)
│   ├── knowledge-standards/                # 00-index..04-testing-standards
│   └── business/                           # business-prd, business-features, business-workflows, business-glossary
│
├── i18n/                                   # 16 localized README.<lang>.md files (vi, zh-CN, zh-TW, ja, ko, es, ...)
│
├── matrix-skills/                          # HSOL v5.5 domain registries & O(1) pre-compiled skill index
│   ├── compact-index.json                  # Pre-compiled O(1) dictionary of 1,462 skills (22 core + 1,440 library)
│   ├── _index.yaml                         # Master domain registry, agent_profiles, fitness & trust config
│   ├── _dynamic.yaml                       # Community/dynamic skill lifecycle manifest
│   └── {19 domain}.yaml                    # ai-ml, architecture, backend, cloud, data, design, devops, frontend,
│                                           # gaming, languages, management, mcp, mobile, performance, planning,
│                                           # quality, research, security, tools
│
├── platforms/                              # 5 unified platform bundles
│   ├── antigravity/                        # GEMINI.md, AntigravityGlobal.agent.md, hooks/validate-tool-call.mjs
│   ├── claude/                             # CLAUDE.md
│   ├── codex/                              # CODEX.md, config.toml, agents/*.toml (21), skills/* (79 command skills)
│   ├── copilot/                            # boomopen-workflow-kit.agent.md
│   └── cursor/                             # .cursorrules (-> CURSOR.md), rules/boomopen-workflow-kit.mdc
│
├── rules/                                  # 7 on-demand Mode B orchestration rules (<= 300 lines each)
│   ├── CORE.md                             # v5.5 Smart-Hybrid Orchestrator, 4-Tier Swarm, Laws L1-L10
│   ├── PHASES.md                           # Multi-phase DAG fan-out, fast-forward & verification gates
│   ├── AGENTS.md                           # 21 specialists, role#shard locks & Warm Session Reuse
│   ├── TEAMS.md                            # 18 Elastic Golden Diamond adversarial team topologies
│   ├── SKILLS.md                           # Fast 2-Step O(1) skill resolution & CLI gate auto-repair
│   ├── ERRORS.md                           # Error classification (E0-E5) & warm shard recovery
│   └── REFERENCE.md                        # Fast lookup tables for commands, agents, teams, and CLI gates
│
├── scripts/                                # 7 cross-platform Python 3.10+ automation helpers
│   ├── auto_preview.py                     # Local dev-server lifecycle manager
│   ├── checklist.py                        # Priority-ordered verification runner
│   ├── kit_checks.py                       # Shared audit checks for scripts
│   ├── kit_console.py                      # UTF-8 terminal output helper
│   ├── kit_process.py                      # Safe subprocess execution helper
│   ├── session_manager.py                  # Session state & summary inspector
│   └── verify_all.py                       # Comprehensive pre-deployment verification suite
│
├── skills/                                 # 22 pre-loaded Core Skills (each with SKILL.md) + doc.md
│   ├── api-patterns/, app-builder/, behavioral-modes/, brainstorming/, clean-code/,
│   ├── database-design/, debugger/, deep-research/, design-spec/, frontend-architecture/,
│   ├── frontend-design/, game-developer/, intelligent-routing/, mobile-design/, mobile-developer/,
│   ├── plan-writing/, security-auditor/, seo-fundamentals/, skill-seeker/, tdd-workflow/,
│   └── testing-patterns/, webapp-testing/
│
├── skills_library/                         # 1,440 dormant On-Demand Library Skills (loaded via compact-index.json)
│   └── {skill-id}/SKILL.md                 # Niche framework/domain skills (copied verbatim to <skills>_library/)
│
└── web/                                    # Standalone React 19 + Vite 7 + Tailwind CSS 4 marketing site
    ├── package.json                        # Web dependencies & scripts (stats, dev, build, lint, preview)
    ├── build/                              # kit-stats.mjs, kit-stats.test.mjs, site-plugin.ts
    ├── vite.config.ts                      # Vite 7 config with React, Tailwind v4, sitePlugin, chunk splitting
    ├── tsconfig*.json                      # Root, app, and node TypeScript 5.9 configs
    ├── eslint.config.js                    # ESLint v9 flat config
    ├── vercel.json                         # Vercel SPA rewrites & static asset headers
    └── src/                                # main.tsx, App.tsx, components/, pages/, hooks/, lib/, data/, styles/, types/
```

---

## Top-Level Directory Purposes

### `.github/` — CI/CD Workflows & Verification Scripts
Houses cross-OS GitHub Actions pipelines (`workflows/ci.yml` and `workflows/release.yml`), the release runbook (`RELEASING.md`), and `6` zero-dependency Node.js maintenance/verification scripts (`check-syntax.js`, `generate-codex-skills.js`, `npm-pack.js`, `pack-smoke.js`, `release-guard.js`, and `third-party-notices.js`).

### `agents/` — 21 Specialist Agents & 18 Elastic Golden Diamond Teams
Contains `21` solo specialist agent definitions (`agents/*.md`, `<= 450` lines each) and `agents/teams/` with `18` adversarial team directories (`backend-team` through `security-team`, including `brainstorm-team`). Each team directory holds `3` role definitions (`techlead.md`, `executor.md`, `reviewer.md`) plus `_team.md` (`54` role files + `18` `_team.md` = `72` team files; `93` Markdown files total). In `v5.5`, `:team` workflows use an **Elastic Golden Diamond** topology that scales from `1-1-1` (`<= 4` files) to `1 Tech Lead + 1..6 Parallel Shard Executors (role#shard) + 1..3 Parallel Critics`.

### `cli/` — Modular Deterministic CLI Suite
Contains `41` production CommonJS modules (`cli/install.js` + `40` focused modules), `cli/data/legacy-bundled-skills.json`, `29` sandboxed `node:test` suites (`cli/*.test.js` + `cli/sandbox.test-helper.js`), and `cli/README.md`. Implements all `12` `boomopen` subcommands (`install`, `uninstall`, `list`, `settings`, `doctor`, `check`, `cook`, `research`, `design`, `plan`, `ledger`, `conduct`) using strictly Node.js built-in modules. Included in `CORE_DIRS` so installed framework copies can run deterministic validators locally.

### `commands/` — 100% Flat Slash Command Workflows
Uses a strictly flat layout with zero nested command-variant subdirectories: `79` workflow files (`commands/{cmd}.md` routers/standalone commands and `commands/{cmd}-{variant}.md` variants) across `32` base slash commands (`16` multi-variant families + `16` standalone commands), plus `5` shared reference protocol files inside `commands/_ref/` (`84` Markdown files total, each `<= 450` lines).

### `documents/` — Technical & Business Documentation Pack
Contains architectural blueprints (`SMART-SKILL-ORCHESTRATION-BLUEPRINT.md`, `HSOL-ASSESSMENT.md`), five technical knowledge packs (`knowledge-overview`, `knowledge-architecture`, `knowledge-domain`, `knowledge-source-base`, `knowledge-standards`), and four business packs (`business/business-{prd,features,workflows,glossary}`). Copied verbatim (`VERBATIM_DIRS`) into `<frameworkPath>/documents/` so `{TOOL}` placeholder examples remain intact.

### `i18n/` — Multilingual Documentation (`16` Localized READMEs)
Provides full localized documentation (`130-450` lines each, verified by `cli/docs-content.test.js`) across `16` languages (`vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`), complementing the English root `README.md` (`17` total supported languages).

### `matrix-skills/` — HSOL v5.5 Registries & `O(1)` Compact Index
Holds `_index.yaml` (`19` domains, `21` agent profiles, `1,476` domain skill mappings across `1,462` unique skills), `_dynamic.yaml`, `19` domain `.yaml` files, and `compact-index.json` — the pre-compiled `O(1)` JSON lookup dictionary (`1,462` skills) generated and verified by `boomopen doctor --rebuild-index`.

### `platforms/` — 5 Unified Platform Bundles
Stores platform-native entrypoints, TOML configs, MDC rules, VS Code prompt agents, `79` generated Codex command skills, `21` Codex role TOMLs, and the opt-in destructive-command guard (`platforms/antigravity/hooks/validate-tool-call.mjs`) copied into `<frameworkPath>/hooks/` for every installed tool.

### `rules/` — On-Demand Orchestration Protocol (`v5.5`)
Seven concise Markdown rule files (`<= 300` lines each: `CORE.md`, `PHASES.md`, `AGENTS.md`, `TEAMS.md`, `SKILLS.md`, `ERRORS.md`, `REFERENCE.md`). Loaded **on demand** when Mode B or a `/cmd` workflow triggers so Mode A micro-tasks incur zero rule-loading latency.

### `scripts/` — Cross-Platform Python Automation Helpers
Seven Python `>=3.10` scripts (`auto_preview.py`, `checklist.py`, `kit_checks.py`, `kit_console.py`, `kit_process.py`, `session_manager.py`, `verify_all.py`) shipped in `CORE_DIRS` under `<frameworkPath>/scripts/` for automated verification and preview management.

### `skills/` & `skills_library/` — 2-Tier Progressive Skills Vault
- **`skills/` (`22` Core Skills)**: High-frequency foundational skills (`api-patterns`, `app-builder`, `behavioral-modes`, `brainstorming`, `clean-code`, `database-design`, `debugger`, `deep-research`, `design-spec`, `frontend-architecture`, `frontend-design`, `game-developer`, `intelligent-routing`, `mobile-design`, `mobile-developer`, `plan-writing`, `security-auditor`, `seo-fundamentals`, `skill-seeker`, `tdd-workflow`, `testing-patterns`, `webapp-testing`) installed into `<toolSkillsDir>/` for zero-latency `<skills>` system prompt visibility.
- **`skills_library/` (`1,440` On-Demand Library Skills)**: Dormant niche framework and domain skills copied verbatim (`VERBATIM_DIRS`) into `<toolSkillsDir>_library/` and loaded strictly on demand via `compact-index.json` and `skill-seeker` without bloating idle context windows.

### `web/` — Standalone Marketing Website
Independent React 19 + Vite 7 + Tailwind CSS 4 web application deployed to Vercel (`web/vercel.json`), with `web/build/kit-stats.mjs` and `web/build/kit-stats.test.mjs` keeping published statistics synchronized with repository counts.

---

## Root File Purposes

| File | Shipped in `package.json` `files` | Copied in `ROOT_FILES` | Purpose |
|------|:---------------------------------:|:----------------------:|---------|
| `package.json` | Implicit (always packed) | Yes | Package manifest (`@boomopen/workflow-kit` `5.5.0`), `bin.boomopen`, `28` scripts, `files` whitelist |
| `package-lock.json` | No | No | Reproducible lockfile for `semantic-release` devDependencies |
| `.releaserc.json` | No | No | Semantic-release config (`npmPublish: false`, `release-guard.js`) |
| `.gitignore` | No | No | Excludes build outputs, secrets, `reports/`, `.boomopen.json`, local IDE folders |
| `.gitattributes` | No | No | Enforces normalized LF line endings across OS checkouts |
| `LICENSE` | Yes | No | MIT license for BoomOpen Workflow Kit source |
| `THIRD_PARTY_NOTICES.md` | Yes | No | License attributions for vendored skills in `skills_library/` |
| `SECURITY.md` | Yes | No | Vulnerability reporting, manifest ownership model, and `PreToolUse` hook docs |
| `README.md` | Yes | Yes | Primary English documentation and quick-start guide |
| `SKILL.md` | Yes | Yes | Root skill metadata file for `<frameworkPath>/SKILL.md` |
| `CHANGELOG.md` | Yes | No | Release notes history maintained by semantic-release |
| `AGENT.md` | Yes | Installed via `buildPlan` | Platform-agnostic Orchestrator entrypoint (`<= 250` lines) |
| `CLAUDE.md` | Yes | Installed via `buildPlan` | Claude Code root Orchestrator entrypoint (`<= 250` lines) |
| `CODEX.md` | Yes | Installed via `buildPlan` | OpenAI Codex root Orchestrator entrypoint (`<= 250` lines) |
| `COPILOT.md` | Yes | Installed via `buildPlan` | GitHub Copilot root Orchestrator entrypoint (`<= 250` lines) |
| `CURSOR.md` | Yes | Installed via `buildPlan` | Cursor root Orchestrator entrypoint (`<= 250` lines) |
| `GEMINI.md` | Yes | Installed via `buildPlan` | Antigravity (Gemini) root Orchestrator entrypoint (`<= 250` lines) |
| `AGENT-TEMPLATE.md` | No | No | Contributor authoring template for `agents/*.md` |

---

## File Count Summary

| Path | Count | Format |
|------|-------|--------|
| `agents/*.md` (solo specialists) | `21` | Markdown (`<= 450` lines) |
| `agents/teams/*/` (`18` teams: `54` roles + `18` `_team.md`) | `72` (`93` total in `agents/`) | Markdown (`<= 450` lines) |
| `cli/` (`41` prod `.js` + `29` `.test.js` + `1` helper + `1` JSON + `README.md`) | `73` | CommonJS JS, JSON, Markdown |
| `commands/` (`79` flat `*.md` + `5` `_ref/*.md` across `32` base commands) | `84` | Markdown (`<= 450` lines) |
| `rules/` | `7` | Markdown (`<= 300` lines) |
| `skills/` (`22` Core Skill folders + `doc.md`) | `22` skill dirs | Markdown (`SKILL.md` each) |
| `skills_library/` (`1,440` dormant Library Skill folders) | `1,440` skill dirs | Markdown (`SKILL.md` + optional refs) |
| `matrix-skills/` (`19` domain YAMLs + `_index.yaml` + `_dynamic.yaml` + `compact-index.json`) | `22` | YAML, JSON (`1,462` indexed skills) |
| `platforms/` (`5` platform bundles incl. `21` Codex TOMLs + `79` Codex command skills + guard hook) | `109` assets/skill files | Markdown, TOML, MDC, MJS |
| `scripts/` | `7` | Python (`>=3.10`) |
| `i18n/` | `16` | Markdown (`130-450` lines) |
| `documents/` (`2` root docs + `5` `knowledge-*` packs + `4` `business/*` packs) | `45` | Markdown |
| `.github/` (`RELEASING.md` + `2` workflows + `6` scripts) | `9` | YAML, JavaScript, Markdown |
| `web/` | Independent app (`1` `kit-stats.test.mjs` suite) | TypeScript, TSX, MJS, CSS, JSON |

---

## Evidence Sources

| File / Directory | Verification Purpose |
|------------------|----------------------|
| [../../package.json](../../package.json) | Confirmed `version: "5.5.0"`, `bin.boomopen`, `28` scripts, `9` devDependencies, and `files` whitelist |
| [../../cli/tool-config.js](../../cli/tool-config.js) | Confirmed `CORE_DIRS` (`7` dirs), `ROOT_FILES` (`3` files), `VERBATIM_DIRS`, `TOOLS`, and `buildPlan()` |
| [../../cli/install.js](../../cli/install.js) | Confirmed `12` CLI subcommands, module imports, and manifest/hook/settings orchestration |
| [../../cli/docs-content.test.js](../../cli/docs-content.test.js) | Confirmed `13` audited entrypoints (`<= 250L`), flat `commands/` + `_ref/`, `7` rules (`<= 300L`), `16` `i18n` files |
| [../../matrix-skills/_index.yaml](../../matrix-skills/_index.yaml) | Confirmed `19` domains, `21` agent profiles, and `1,476` domain mappings (`1,462` unique skills) |
| [../../web/build/kit-stats.mjs](../../web/build/kit-stats.mjs) | Confirmed live counting logic for `21` agents, `18` teams (`54` roles), `32` base commands (`79` files), `22` core + `1,440` library skills |
