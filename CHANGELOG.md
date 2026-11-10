# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.5.0] - 2026-11-10

### Added
- **CI & Release Automation (`.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/RELEASING.md`)**:
  - Cross-OS CI matrix (`ubuntu-latest`, `windows-latest`, `macos-latest` on Node 18, 20, 22) running full unit/integration tests, syntax lint, sandboxed `install` + `doctor`, `boomopen check .`, Python 3.10 + shell syntax compilation, `THIRD_PARTY_NOTICES.md` verification, website lint + build, and npm tarball smoke tests (`npm run test:pack`).
  - Manual release workflow (`.github/workflows/release.yml`, dry-run by default) guarded by `.github/scripts/release-guard.js`.
- **Multi-Session Autonomous Project Autopilot (`/autopilot:init|run|audit` & `cli/ledger.js` / `boomopen ledger`)**:
  - Added `/autopilot` (`commands/autopilot.md`, `autopilot-init.md`, `autopilot-run.md`, `autopilot-audit.md`) and the `boomopen ledger <init|status|next|verify-phase|audit>` CLI engine to ingest multi-document PRDs/specs into an immutable `.boomopen/project-ledger.json` with SHA-256 Spec-Hash Drift Guard, `.boomopen/contracts/SHARED_CONTRACT.md`, and `.boomopen/ROADMAP-PROGRESS.md`.
  - Added a 4-Layer Zero-Omission & Anti-Regression Phase Ratchet (`boomopen check --strict-phase --no-stubs`) that rejects deferred `TODO`/`FIXME`/`PLACEHOLDER` comments, hollow stubs (`NotImplementedError`, `todo!()`, production test-mock leaks), and test gaming (`it.skip`, `test.only`, vacuous assertions).
- **Cross-Engine Autonomous Conductor & Multi-Engine Council (`/conduct:council|pipeline`, `cli/conductor.js`, `cli/conductor-engines.js` / `boomopen conduct`)**:
  - Added `/conduct` (`commands/conduct.md`, `conduct-council.md`, `conduct-pipeline.md`) and `boomopen conduct <probe|dispatch|council|status>` to orchestrate Claude Code, OpenAI Codex, Antigravity (Gemini), Cursor, and GitHub Copilot in **Parallel Multi-Engine Councils** across all **6 core tasks** (`research`, `brainstorm`, `plan`, `design`, `review`, `debug` — producing 4-Part Consensus Synthesis reports at `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md`) or **Role-Division Pipelines** (`Author != Critic` cross-family enforcement, 3-Tier quota failover, and SHA-256 `READ_ONLY_FILES` snapshot guard).
- **Executable Research, Brainstorm, Planning, Design & Cook Subsystem Compilers (`cli/research.js`, `cli/plan.js`, `cli/design.js`, `cli/cook.js`)**:
  - Added `boomopen research <validate|brief>` enforcing 4 deterministic gates (`RES-G1..G4`: Evidence/Confidence & Constraint Grounding, Multi-Perspective Weighted Decision Matrix & Pre-Mortem/Contradiction Arbitration, Executive Verdict & `HANDOFF_BRIEF`, and single cohesive file `<= 500` lines), enriched `boomopen conduct council` for `--task research|brainstorm`, created `agents/teams/brainstorm-team/` (`18/18` specialist teams with `_team.md`), and upgraded `skills/brainstorming/` to `autonomous_first` Grounding + native `ask_question` UI.
  - Added `boomopen plan <validate|compile>` enforcing 5 deterministic gates (`PLAN-G1..G5`: DAG acyclicity, disjoint `OWNED_FILES` & `<= 4` files/shard, `SHARED_CONTRACT` presence, verification commands, and single cohesive file `<= 500` lines with `ArtifactMetadata.RequestFeedback: true`) and `boomopen ledger from-plan <plan.md>` to compile approved plans directly into `.boomopen/project-ledger.json`.
  - Added `boomopen design <validate|contract>` enforcing 4 deterministic gates (`DESIGN-G1..G4`: OKLCH perceptual tokens & Anti-AI-Slop check, 5-State UI Matrix `Default/Loading/Empty/Error/Disabled-Focus`, WCAG 2.2 AA & responsive ergonomics, and executable `DESIGN_CONTRACT` CSS `@theme inline` + TypeScript Props inside a single cohesive file `<= 500` lines with `ArtifactMetadata.RequestFeedback: true`), plus **2-Wave Frontend Sharding** (`Wave 1: frontend-engineer#tokens-primitives` → `Wave 2: frontend-engineer#screen-1..k`) and updated Python UX/Accessibility verification scripts (`ux_audit.py`, `accessibility_checker.py`).
  - Added `boomopen cook <state|packets|verify-wave|preflight>` implementing the **5-Stage Fast-Forward State Machine** (`state`), automatic **5-Field Wave Handoff Packet Compiler** with sibling/prior-wave `READ_ONLY_FILES` locking (`packets`), and **4 Post-Wave Verification Gates (`COOK-G1..G4`: File Ownership Lock, Deliverable Existence, Pragmatic 2-Tier & Zero-Stub Gate, and Verification Command Execution)** across the **3-Wave Contract-First Execution Topology** (`fullstack-team`, `backend-team`, `frontend-team`, `database-team`, `mobile-team`, `devops-team`, `game-team`).
- **Full-Spectrum Debug, Fix, Test, Review, Security, Docs, Report & Deploy SOTA 2026 Upgrade (`commands/*.md`, `agents/**/*.md`, `skills/**/*.py`, `rules/{ERRORS,SKILLS}.md`)**:
  - Upgraded `/debug` & `/fix` (`debug-team`, `debugger`) to **3-Stage SPIE v3.0 Elastic Golden Diamond** (`DBG-G1..G4`) with 1-click **"Proceed"** Fast-Forward from standalone `DEBUG-{issue}.md` into `/fix`.
  - Upgraded `/test` & `/review` (`qa-team`, `security-team`, `performance-team`, `reviewer`, `security-engineer`, `performance-engineer`) with Zero-Test-Gaming `READ_ONLY_FILES` production locks, collision-free parallel review sharding (`REVIEW-{scope}-s{k}.md` → `REVIEW-{scope}.md`), Cross-Engine `Author != Critic` (`conduct council --task review`), 2026 OWASP LLM/Agentic security checks, and Measure-First `INP`/`LCP`/`p95` performance checks.
  - Added `skills/security-auditor/scripts/security_scan.py` (2026 secret patterns + SQL/XSS/shell static sinks) and upgraded `seo_checker.py` (`INP <= 200ms` + `llms.txt`), `test_runner.py` (hybrid-repo multi-framework detection), `playwright_runner.py` (Navigation Timing L2), `mobile_audit.py`, and all `/docs`, `/report`, `/deploy`, `/save`, `/recap`, `/orchestrate`, and `18/18` specialist team directories (`72` team files).
- **17-Language Natural-Language Intent-to-Workflow Router & 4-Tier Dynamic Elastic Swarm Sharding (`skills/intelligent-routing/SKILL.md`, `rules/CORE.md`, `rules/AGENTS.md`)**:
  - Added deterministic natural-language intent routing across all **17 supported languages** (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) into the 14 canonical Mode B workflows (`commands/{cmd}-{variant}.md`), Approved-Plan Execution (`/code:team`), Multi-Session Autopilot (`/autopilot`), and Cross-Engine Conductor (`/conduct`).
  - Added the **Cognitive Load Sharding Law** (`N_agents = min(maxParallelSubagents, max(ceil(Files / 3.5), Domains, Vectors))`, max `3–4` `OWNED_FILES` per sub-agent shard) with scoped `role#shard -> conversationId` Warm Session Reuse and **Elastic Golden Diamond** teams (`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Critics`).
- **3-Surface Unified Settings & Mode Selection Control Center (`cli/settings.js`, `cli/settings-schema.js`, `cli/settings-ui.js`, `commands/settings.md`)**:
  - Added `/settings` in-chat interactive control center, Local Web Dashboard (`npm run settings:ui` at `http://127.0.0.1:4567`), and Terminal CLI (`boomopen settings ...`) managing **20 configurable enum settings keys + 2 custom line-limit keys** (including `execution.swarmScaling`, `execution.maxParallelSubagents`, and `engines.{researcher,planner,coder,debugger,reviewer,councilMembers}`) with `< 10ms` AOT hot-sync (`<!-- BOOMOPEN-SETTINGS-START -->`) across all 5 platforms (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `CURSOR.md`, `COPILOT.md`).
  - Added 4 one-click presets (`smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team`) and defaulted `workflows.naturalLanguageResearchTrigger` to `auto_team` so natural-language research/ideation requests automatically activate the 3-agent Golden Triangle (`/research:team` / `/brainstorm:team`).
- **Official Full HD Launch Trailers & 17-Language Localized Documentation (`README.md`, `i18n/README.*.md`, `assets/media/*`)**:
  - Embedded Full HD 1080p launch trailers (`boomopen_v55_trailer_en.mp4` and `boomopen_v55_trailer_vi.mp4`) and 16 pure localized README translations (`vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) with 100% valid HTML header navigation.
- **Unified 5-Platform Architecture (`platforms/{antigravity,claude,codex,copilot,cursor}/`)**:
  - Standardized all platform configuration bundles under `platforms/<tool>/` and added `install:claude` / `uninstall:claude` scripts in `package.json`.
  - Upgraded all 5 platform templates (`platforms/antigravity/*`, `platforms/claude/CLAUDE.md`, `platforms/codex/CODEX.md` & `agents/*.toml`, `platforms/copilot/boomopen-workflow-kit.agent.md`, `platforms/cursor/.cursorrules` & `rules/boomopen-workflow-kit.mdc`) and all 6 root entrypoints (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`) to 100% `v5.5` Smart-Hybrid parity.
  - Embedded **Pragmatic 2-Tier Coding Standards**, **Persistent Testing & Bug Fixing**, **2-Mode Smart Complexity Threshold Gate (Mode A vs. Mode B)**, **Quality-First Model Policy (`Model: "inherit"`)**, **DAG Parallel Fan-Out**, **Direct Plan-to-Executor Dispatch**, **Contract-First Handoffs (`SHARED_CONTRACT` + `OWNED_FILES`)**, and flat command routing (`commands/{cmd}-{variant}.md`) across all 5 platforms.
- **Complete Legacy Name & Path Cleanup (`scripts/*.py`, `documents/**/*.md`, `cli/doctor.js`)**:
  - Updated `scripts/auto_preview.py`, `scripts/checklist.py`, `scripts/session_manager.py`, and `scripts/verify_all.py` to BoomOpen Workflow Kit branding and real `skills/.../scripts/*.py` paths.
  - Updated all architecture and source-base documentation (`documents/**/*.md`) to reference `platforms/<tool>/`.
  - Enhanced `cli/doctor.js` and `cli/install.test.js` to validate all 5 platform bundles and enforce zero legacy directory/branding references across the repository.

### Fixed
- **Packaging (`package.json`)**: the `files` allowlist now ships `skills_library/` and `scripts/` (plus `SECURITY.md`), so a packed kit ships all `1,440` library + `22` core = `1,462` indexed skills while leaving out tests, Python caches, and demo media/benchmark data of `last30days` and `loki-mode`.
- **Windows-safe npm scripts**: removed the unused husky `prepare` script (`husky install || true` failed under `cmd.exe`) and the no-op `lint:md`; `npm run lint` now runs `.github/scripts/check-syntax.js`, syntax-checking every `cli/`, `platforms/`, and `.github/scripts/` JavaScript file.
- **Lockfile & Release Safety (`package-lock.json`, `.releaserc.json`, `SECURITY.md`)**: regenerated `package-lock.json`, disabled accidental npm publishing (`npmPublish: false`), added `.github/scripts/release-guard.js` to prevent cutting `1.0.0` without a baseline `v5.x.y` tag, and updated `SECURITY.md` with private reporting targets and accurate opt-in hook documentation.

## [5.4.0] - 2026-10-31

### Added
- **Pragmatic 2-Tier Coding Standards (`~/.gemini/GEMINI.md`, `GEMINI.md`, `rules/CORE.md`, `documents/knowledge-standards/01-code-style.md`, `skills/clean-code/SKILL.md`)**:
  - Replaced rigid mechanical line-count limits (`≤ 300` lines/file, `≤ 25` lines/function) with **Pragmatic 2-Tier Coding Standards** (Tier 1 strict type/error safety + Tier 2 cohesive structure with `~200–350` target, `≤ 400–450` soft ceiling, `>500` hard split).
- **2-Tier CLI Code Checker & Recursive Doctor (`cli/checker.js`, `cli/doctor.js`, `cli/install.test.js`)**:
  - Updated `cli/checker.js` with `SOFT_FILE_LINES = 400` and `HARD_FILE_LINES = 500` (exempting `*.test.*`, `*.spec.*`, `*.d.ts`, `install.js`), and updated `cli/doctor.js` to recursively validate `agents/teams/**/*.md`.
- **Synchronized Core Skills (`skills/`) & 5-Whys (SPIE v3.0) Debugging (`agents/debugger.md`, `commands/debug-*.md`)**:
  - Upgraded `agents/debugger.md`, `skills/debugger/SKILL.md`, `commands/debug-hard.md`, and `commands/debug-fast.md` with the **5-Whys (SPIE v3.0)** causal framework.

## [5.3.0] - 2026-10-31

### Added
- **Direct Plan-to-Executor Dispatch**, **Stateful Warm Sub-agent Reuse Registry (`send_message` by `conversationId`)**, **Contract-First Parallel Dispatch & File Ownership Locks (`SHARED_CONTRACT` + `OWNED_FILES`)**, and **Warm Sub-agent Auto-Revive (`E0`)**.

## [5.2.0] - 2026-10-31

### Added
- **Quality-First Model Policy (`Model: "inherit"` / Pro High Default)**, **DAG-Aware Parallel Fan-Out Execution**, and **Pre-Compiled Compact Skill Index (`matrix-skills/compact-index.json`) & CLI `doctor` / `check`**.

## [5.1.0] - 2026-10-31

### Added
- **Smart-Hybrid 2-Mode Complexity Threshold Gate (Mode A vs. Mode B)**, Antigravity 2.0 native primitives, and Brain Artifact routing (`<appDataDir>\brain\<conversation-id>\`).

## [1.3.2] - 2026-03-30

### Removed
- Removed deprecated `focus` workflow variants across commands and documentation.

## [1.2.0] - 2026-03-09

### Added
- **Golden Triangle Agent Teams (`:team`)** and **OpenAI Codex (`~/.codex/`)** support.

## [1.0.0] - 2026-01-26

### Added
- Initial release of BoomOpen Workflow Kit and CLI installer.
