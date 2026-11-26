# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.5.0] - 2026-11-25

### Added
- **`smart-hybrid` Default Preset, Opt-In `< 2.5 KB` `frontier-guardrails` Slim Preset & Hardened Control Center (`cli/settings*.js`, `commands/settings.md`)**:
  - Set **`smart-hybrid`** as the default preset out of the box on fresh installs and `boomopen settings reset` (Proactive Turn-1 Elastic Swarm `execution.mode = auto` above `2` files + `17`-language `naturalLanguageResearchTrigger = auto_team` routing), alongside the new opt-in **`frontier-guardrails`** Slim Mode A preset (`boomopen settings preset frontier-guardrails`, with **`carbon-guardrails`** preserved as a backward-compatible alias), `solo-fast`, `deep-architect`, and `adversarial-team` (`5` core presets + `custom`). When opted in, `frontier-guardrails` renders platform-tailored `< 2.5 KB` (`~600 tokens`) Slim Guardrails across Antigravity, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot (`mode_a <= 10` files direct, `naturalLanguageResearchTrigger = off`) while enforcing Pragmatic 2-Tier Coding Standards and `strict_e2e` verification.
  - Added a lossless full-template round-trip cache when switching between Slim (`frontier-guardrails`, `carbon-guardrails`, `solo-fast`) and full Mode B (`smart-hybrid`, `deep-architect`, `adversarial-team`) presets, plus a CSP-hardened Local Web Settings UI (`boomopen settings --ui` on `http://127.0.0.1:4567` with `sha256` inline-script hashes, Host/Origin checks, and per-session CSRF tokens) managing `20` enum keys + `2` custom line-limit keys in `< 10ms` AOT sync.
- **36 Base Slash Commands (`93` Command Files = `87` Flat Workflows + `6` `_ref/` Protocols)**:
  - Expanded the flat command suite in `commands/*.md` + `commands/_ref/*.md` to **`36` base slash commands** (`18` multi-variant families + `18` standalone commands = `87` workflow files + `6` shared `_ref/` protocols = **`93` files**), adding stateful multi-round whole-project **`/audit`** (`run`, `fix`, `auto`, plus Round-2 burn-down verification via `.boomopen/audit-ledger.json` & `.boomopen/AUDIT-PROGRESS.md`), **`/autopilot`** (`init`, `run`, `audit`), **`/conduct`** (`council`, `pipeline`), **`/onboard`** (60-second brownfield `ARCHITECTURE-MAP.md`), **`/pr`** (`/pr:review` pre-PR quality/reconcile gate & PR creation), and **`/release`** (parity-gated semantic release workflow).
- **Wave 2.5 Spec-to-Code Auto-Reconciliation & Automated Git Checkpoint Rollback (`cli/reconcile.js`, `agents/spec-reconciler.md`, `cli/git-checkpoints.js`, `cli/ledger.js`, `cli/audit.js`)**:
  - Added **`boomopen reconcile`** and the **22nd specialist agent (`spec-reconciler`, `quality:reconcile`)** plus `commands/_ref/reconcile-loop.md` and `boomopen cook amend-plan` to run **Wave 2.5** deterministic wiring checks (`REC-G1` Island Shard/Unwired Module check, `REC-G2` Frontend ↔ Backend `/api/...` Route Parity, `REC-G3` `[SC-*]` Sub-Clause Traceability, and `REC-G4` `.env.example` Parity) and auto-compile self-completing delta waves before Wave 3 QA.
  - Added lightweight Git checkpoint refs (`refs/boomopen/checkpoints/<label>`) and confirmation-gated (`--yes`) **`boomopen ledger rollback`** and **`boomopen audit rollback`** commands for instant phase and audit-round recovery.
- **2026 Native Multi-IDE Upgrades & Shared Vault Deduplication (`platforms/*`, `cli/platform-transforms.js`, `cli/hook-registration.js`, `cli/install-steps.js`)**:
  - **Antigravity (Gemini)**: Added `--as-plugin` native plugin bundling (`platforms/antigravity/plugin.json`), compiled sub-agent frontmatter (`read-only` vs full toolsets), and executable `run_workflow` Python fan-out scripts (`platforms/antigravity/workflows/{audit_fanout,review_fanout,research_fanout}.py`).
  - **Claude Code**: Added nested colon command aliases (`/plan:hard` via `<family>/<variant>.md`), per-role agent frontmatter compilation (`disallowedTools` for read-only critics, `memory: project` for planners/leads, `isolation: worktree` annotations for parallel engineers, `disable-model-invocation: true` on `deploy-production`, `deploy-rollback`, and `release`), `Bash|PowerShell` `PreToolUse` hook matching, and `PreCompact` + `Stop` quality gate hooks (`stop-quality-gate.mjs`).
  - **OpenAI Codex**: Added `22` isolated role TOMLs (`~/.codex/agents/boomopen/*.toml`) with OS `read-only` sandboxing on critic/scout roles, implicit-skill gating, and `87` generated `boomopen-workflow-kit-*` command skills.
  - **GitHub Copilot & Cursor**: Added `~/.copilot/copilot-instructions.md` + compiled `.agent.md` prompt agents for Copilot, and `.mdc` rules + `beforeShellExecution` hook support for Cursor.
  - **Shared `~/.agents/skills_library` Vault Deduplication**: Deduplicated the `1,440`-skill library vault through `~/.agents/skills_library` links across multi-IDE installs (~80% disk reduction).
- **Multi-Session Project Autopilot, Cross-Engine Conductor & Executable Artifact Compilers (`cli/{ledger,conductor,research,design,plan,cook}.js`)**:
  - Added **`boomopen ledger <init|from-plan|validate|status|next|verify|audit|rollback>`** with SHA-256 Spec-Hash Drift Guard (`.boomopen/project-ledger.json` + `.boomopen/ROADMAP-PROGRESS.md`) and the 5-Layer Phase Quality Ratchet (`boomopen check --strict-phase --no-stubs` rejecting deferred `TODO`/`FIXME` comments, hollow stubs, and `.skip`/`.only` test gaming).
  - Added **`boomopen conduct <probe|dispatch|council|status>`** orchestrating Claude Code, OpenAI Codex, Antigravity, Cursor, and GitHub Copilot in **6-Task Parallel Multi-Engine Councils** (`research`, `brainstorm`, `plan`, `design`, `review`, `debug` -> `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md`) and **Role-Division Pipelines** (`Author != Critic` cross-family enforcement + SHA-256 `READ_ONLY_FILES` guard).
  - Added `< 50ms` zero-dependency compilers: **`boomopen research <validate|brief>`** (`RES-G1..G4`), **`boomopen design <validate|contract>`** (`DESIGN-G1..G4` OKLCH tokens, 5-State UI Matrix, WCAG 2.2 AA, `@theme` CSS + TS Props), **`boomopen plan <validate|compile>`** (`PLAN-G1..G5` DAG acyclicity, disjoint `OWNED_FILES <= 4`/shard, `SHARED_CONTRACT`), and **`boomopen cook <state|packets|verify-wave|preflight|amend-plan>`** (`COOK-G1..G4`).
- **17-Language Intent Router, 4-Tier Elastic Swarm & 18 Golden Diamond Teams (`skills/intelligent-routing/`, `rules/*.md`, `agents/teams/*-team/`)**:
  - Added deterministic natural-language intent routing across all **`17` supported languages** (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`), the **Cognitive Load Sharding Law** (`<= 3–4 OWNED_FILES`/shard), Scoped Warm Sub-agent Reuse (`role#shard -> conversationId`), SPIE v3.0 5-Whys debugging (`DBG-G1..G4`), and **`18` Elastic Golden Diamond specialist teams** (`72` team files).
- **Security Engine v6, Python Validators Overhaul & 2026 `app-builder` Templates (`skills/**/scripts/*.py`, `skills/app-builder/templates/*`)**:
  - Upgraded `security_scan.py` to **v6** (2026 secret tokens, OWASP LLM/Agentic sinks, SQL/XSS/shell static analysis), AST-based `type_coverage.py`, test-aware `accessibility_checker.py` & `ux_audit.py`, `lighthouse_audit.py`, `playwright_runner.py` (Navigation Timing L2), `seo_checker.py` (`INP <= 200ms` + `llms.txt`), `test_runner.py`, and `mobile_audit.py`.
  - Expanded `skills/app-builder/templates/` to `15` modern 2026 project blueprints including **`mcp-server`** (FastMCP / Streamable HTTP), **`ai-agent-worker`** (Cloudflare Agents / Durable Objects), Better Auth, Tailwind CSS v4, and Python `uv` + `pwdlib`.
- **Flagship 15-Language Cosmic WebGL Showcase (`https://boomopen.com`), Launch Trailers & CI/Release Automation (`web/`, `i18n/`, `.github/workflows/*`)**:
  - Launched the 15-language (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar` RTL, `id`, `th`) React 19 + Vite 7 + Tailwind CSS v4 + WebGL micro-glyph showcase at **`https://boomopen.com`** with lazy locale chunks, live `kit-stats.json` parity checks, URL deep-linking (`useSearchParams`), `llms.txt`/`sitemap.xml`, Full HD 1080p `EN`/`VI` launch trailers, and `16` localized `i18n/README.*.md` guides (`17` total README locales).
  - Added cross-OS GitHub Actions CI (`ubuntu-latest`, `windows-latest`, `macos-latest` × Node `18`, `20`, `22` running `34` `node:test` suites, syntax checks, Python/static audits, web build, and `npm run test:pack`) plus manual `release-guard.js`-protected Semantic Release (`npmPublish: false`).

### Fixed
- **Packaging & Vault Integrity (`package.json`, `THIRD_PARTY_NOTICES.md`)**: Configured the `files` allowlist to ship all `22` Core + `1,440` Library = `1,462` indexed skills (`matrix-skills/compact-index.json`), `scripts/`, `SECURITY.md`, and verified `THIRD_PARTY_NOTICES.md` while excluding tests, `__pycache__/`, and oversized demo/benchmark assets.
- **Cross-Platform Scripts, Lockfile & Non-Destructive Safety (`package-lock.json`, `.releaserc.json`, `SECURITY.md`)**: Replaced shell-fragile hooks with Windows-safe `.github/scripts/check-syntax.js`, regenerated `package-lock.json`, kept `npmPublish: false` with `.github/scripts/release-guard.js`, and documented SHA-256 manifest backups and opt-in `--with-hooks` registration in `SECURITY.md`.

## [5.4.0] - 2026-10-31

### Added
- **Pragmatic 2-Tier Coding Standards (`GEMINI.md`, `rules/CORE.md`, `documents/knowledge-standards/01-code-style.md`, `skills/clean-code/SKILL.md`)**:
  - Replaced rigid mechanical line-count limits (`<= 300` lines/file, `<= 25` lines/function) with **Pragmatic 2-Tier Coding Standards** (Tier 1 strict type/error safety + Tier 2 cohesive structure with `~200–350` target, `<= 400–450` soft ceiling, `>500` hard split).
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
