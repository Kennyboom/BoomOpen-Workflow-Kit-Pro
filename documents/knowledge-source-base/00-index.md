# Knowledge Source Base

> **Purpose**: Comprehensive technical knowledge base for `@boomopen/workflow-kit` `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)
> **Sub-files**: 4
> **Last Updated**: 2026-11-10

---

## Quick Summary

**BoomOpen Workflow Kit `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)** is an open-source multi-agent operating system for AI coding assistants across **Google Antigravity (Gemini)**, **Claude Code**, **OpenAI Codex**, **Cursor**, and **GitHub Copilot**. Installed directly from a repository clone (`https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro`, source-only distribution with `npmPublish: false`), the CLI suite (`cli/install.js` + `40` modular `cli/*.js` files) runs on Node.js `>=18.0.0` using strictly Node.js built-in modules with **zero production npm dependencies**.

At runtime, the AI assistant reads a compact platform entrypoint (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, or `AGENT.md`, each `<= 250` lines with ahead-of-time injected settings) and applies a **Proactive Sub-agent First Gate**:
- **Mode A (Tier 0 — Known-Target Micro-Direct)**: Executes `<= 2` already-known files in a single domain directly under Pragmatic 2-Tier Coding Standards with zero cold-start overhead.
- **Mode B (Tier 1 — Multi-Agent Orchestration & Elastic Swarm)**: Routes explicit `/cmd` workflows and natural-language intents across **all `17` supported languages** into `84` flat command workflow files (`79` `commands/*.md` + `5` `commands/_ref/*.md` across `32` base slash commands), delegating to **`21` specialist agents** and **`18` Elastic Golden Diamond teams** (`54` role files + `18` `_team.md` specs = `72` team files) sharded via `role#shard` (`<= 3-4 OWNED_FILES` per shard).

Capability injection is powered by the **Hybrid Skill Orchestration Layer (`HSOL v5.5`)**, which resolves **`1,462` indexed skills** (`22` pre-loaded Core Skills in `skills/` including `skill-seeker` + `1,440` dormant On-Demand Library Skills in `skills_library/`) in `O(1)` via `matrix-skills/compact-index.json` across `19` domain YAML registries. Deterministic CLI compilers (`boomopen research`, `design`, `plan`, `cook`, `ledger`, `conduct`, `check`, `doctor`, and `settings`) enforce machine-verified phase gates, file ownership locks, multi-session `/autopilot` ledgers, and cross-engine `/conduct` councils. The repository also contains an independent React 19 + Vite 7 + Tailwind CSS 4 marketing website in `web/`, `7` Python 3.10+ helper scripts in `scripts/`, `16` localized READMEs in `i18n/`, `30` automated `node:test` suites, and cross-OS GitHub Actions CI/CD workflows.

---

## Table of Contents

1. [Quick Summary](#quick-summary)
2. [Sub-Files](#sub-files)
3. [Quick Facts](#quick-facts)
4. [Read Order for Contributors](#read-order-for-contributors)
5. [Cross-References](#cross-references)
6. [Architecture Notes and Verification Boundaries](#architecture-notes-and-verification-boundaries)

---

## Sub-Files

| File | Description |
|------|-------------|
| [01-directory-structure.md](./01-directory-structure.md) | Complete annotated directory tree (depth 3-4) with purpose of every top-level directory and root file |
| [02-entry-points.md](./02-entry-points.md) | CLI router (`cli/install.js`), `13` audited entrypoints, manifest-safe install/uninstall flows, 5 platform target layouts, and npm/CI scripts |
| [03-key-modules.md](./03-key-modules.md) | Per-module breakdown: purpose, exports, dependencies, and internal architecture across all `10` major modules |
| [04-configuration.md](./04-configuration.md) | Complete inventory of `~/.boomopen/settings.json`, `./.boomopen.json`, `package.json`, `.releaserc.json`, CI/CD, HSOL, and platform configs |

---

## Quick Facts

| Key | Value |
|-----|-------|
| Package Name | `@boomopen/workflow-kit` |
| Version | `5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition) |
| Canonical Repository | `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro` |
| Distribution Model | Source-only Git clone (`node cli/install.js install <tool>` or `npm link` -> `boomopen`); `npmPublish: false` |
| License | MIT (kit source; third-party vault skills documented in `THIRD_PARTY_NOTICES.md`) |
| Author | BoomOpen Labs |
| Runtime | Node.js `>=18.0.0` (CLI), Python `>=3.10` (`scripts/*.py`) |
| Module System | CommonJS (`cli/`), ESM (`web/` and `validate-tool-call.mjs` hook) |
| Production Dependencies | `0` (pure Node.js built-ins) |
| Dev Dependencies | `9` (`semantic-release` ecosystem for changelog and GitHub releases) |
| CLI Binary Entry | `"bin": { "boomopen": "./cli/install.js" }` (`cli/install.js` + `40` modular `cli/*.js` files = `41` production modules) |
| CLI Subcommands | `12` (`install`, `uninstall`, `list`, `settings`, `doctor`, `check`, `cook`, `research`, `design`, `plan`, `ledger`, `conduct`) |
| Supported Platforms | `5` — Antigravity (Gemini), Claude Code, OpenAI Codex, Cursor, GitHub Copilot |
| Specialist Agents | `21` Markdown files (`agents/*.md`, `<= 450` lines each) |
| Specialist Teams | `18` Elastic Golden Diamond teams (`54` role files + `18` `_team.md` specs = `72` team files; `93` files under `agents/`) |
| Slash Commands | `32` base commands (`16` multi-variant families + `16` standalone) across `84` flat files (`79` `commands/*.md` + `5` `commands/_ref/*.md`) |
| On-Demand Rules | `7` Markdown files (`CORE`, `PHASES`, `AGENTS`, `TEAMS`, `SKILLS`, `ERRORS`, `REFERENCE`, `<= 300` lines each) |
| Skills Vault | `1,462` indexed skills (`22` Core Skills in `skills/` + `1,440` On-Demand Library Skills in `skills_library/`) |
| Matrix Skill Registry | `19` domain YAMLs + `_index.yaml` + `_dynamic.yaml` + `compact-index.json` (`O(1)` lookup) |
| Python Helpers | `7` scripts in `scripts/` (`auto_preview`, `checklist`, `kit_checks`, `kit_console`, `kit_process`, `session_manager`, `verify_all`) |
| Localized READMEs | `16` translations in `i18n/README.<lang>.md` (`17` supported languages including English) |
| Automated Test Suites | `30` `node:test` suites (`29` `cli/*.test.js` + `web/build/kit-stats.test.mjs`) |
| CI/CD Workflows | `.github/workflows/ci.yml` (Ubuntu/Windows/macOS, Node 18/20/22) & `.github/workflows/release.yml` (manual guarded release) |
| Web Stack | React 19 + Vite 7 + Tailwind CSS 4 (deployed independently to Vercel) |

---

## Read Order for Contributors

1. **Start here** — Read this index for the `v5.5.0` architecture and inventory summary.
2. **[01-directory-structure.md](./01-directory-structure.md)** — Understand the repository layout across all top-level folders.
3. **[02-entry-points.md](./02-entry-points.md)** — Trace how `cli/install.js` boots, how SHA-256 manifests protect user files, and where each platform installs.
4. **[03-key-modules.md](./03-key-modules.md)** — Inspect the `41` CLI production modules, `21` agents, `18` teams, `84` flat command files, `7` rules, and `1,462`-skill vault.
5. **[04-configuration.md](./04-configuration.md)** — Review the 3-Surface Control Center (`~/.boomopen/settings.json` & `./.boomopen.json`), packaging, CI/CD, and platform configs.
6. **[`../../rules/CORE.md`](../../rules/CORE.md)** — Read the Smart-Hybrid Orchestrator protocol and Laws `L1-L10`.
7. **[`../../AGENT-TEMPLATE.md`](../../AGENT-TEMPLATE.md)** — Check the frontmatter and section contract for specialist agents.
8. **[`../../matrix-skills/_index.yaml`](../../matrix-skills/_index.yaml)** — Inspect domain inheritance and `HSOL v5.5` resolution thresholds.

---

## Cross-References

- **Knowledge Overview**: [../knowledge-overview/00-index.md](../knowledge-overview/00-index.md) — Product identity, tech stack, features, and getting started
- **Knowledge Architecture**: [../knowledge-architecture/00-index.md](../knowledge-architecture/00-index.md) — System overview, components, data flows, design patterns, and ADRs
- **Knowledge Domain**: [../knowledge-domain/00-index.md](../knowledge-domain/00-index.md) — Domain entities, schemas, CLI/API contracts, and business rules
- **Knowledge Standards**: [../knowledge-standards/00-index.md](../knowledge-standards/00-index.md) — Pragmatic 2-Tier code style, conventions, Git workflow, and testing standards
- **Business PRD**: [../business/business-prd/00-index.md](../business/business-prd/00-index.md) — Executive summary, goals, stakeholders, and requirements
- **HSOL Blueprint**: [../SMART-SKILL-ORCHESTRATION-BLUEPRINT.md](../SMART-SKILL-ORCHESTRATION-BLUEPRINT.md) — Hybrid Skill Orchestration Layer architecture blueprint
- **HSOL Assessment**: [../HSOL-ASSESSMENT.md](../HSOL-ASSESSMENT.md) — Technical evaluation of skill indexing and resolution
- **CLI Reference**: [../../cli/README.md](../../cli/README.md) — `boomopen` subcommands, install targets, and safety guarantees
- **Orchestrator Rules**: [../../rules/CORE.md](../../rules/CORE.md), [../../rules/PHASES.md](../../rules/PHASES.md), [../../rules/AGENTS.md](../../rules/AGENTS.md), [../../rules/TEAMS.md](../../rules/TEAMS.md), [../../rules/SKILLS.md](../../rules/SKILLS.md), [../../rules/ERRORS.md](../../rules/ERRORS.md), [../../rules/REFERENCE.md](../../rules/REFERENCE.md)
- **Security & Notices**: [../../SECURITY.md](../../SECURITY.md) & [../../THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md)
- **Changelog & Web Site**: [../../CHANGELOG.md](../../CHANGELOG.md) & [../../web/README.md](../../web/README.md)

---

## Architecture Notes and Verification Boundaries

1. **Deterministic Structural & Contract Verification (`30` Test Suites)**: `npm test` runs `29` sandboxed `cli/*.test.js` suites plus `web/build/kit-stats.test.mjs`, validating installer manifests, user-file backups, Markdown line budgets, platform parity, AOT settings sync, Python helper syntax, and deterministic CLI compilers (`research`, `design`, `plan`, `cook`, `ledger`, `conduct`, `check`, `doctor`). Live LLM prompt reasoning remains governed at runtime by the host AI IDE/CLI (`Antigravity`, `Claude Code`, `Codex`, `Cursor`, `Copilot`).
2. **Source-Only Distribution Guard**: `.releaserc.json` configures `@semantic-release/npm` with `"npmPublish": false` and runs `.github/scripts/release-guard.js` so releases update `CHANGELOG.md`, `package.json`, `package-lock.json`, and GitHub Releases without publishing to the public npm registry.
3. **Installed Copy Protection**: Running `node ~/.<tool>/skills/boomopen-workflow-kit/cli/install.js` supports operational subcommands (`doctor`, `check`, `settings`, `research`, `design`, `plan`, `cook`, `ledger`, `conduct`, `list`) while refusing `install` or `uninstall` to prevent self-overwriting an installed framework copy.
4. **Independent Marketing Web Deployment**: `web/` maintains its own `package.json`, lockfile, and `vercel.json` SPA rewrites; `web/build/kit-stats.mjs` synchronizes live repository counts into `web/src/data/kit-stats.json` during `predev` and `prebuild`.
