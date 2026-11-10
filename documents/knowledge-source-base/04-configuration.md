# BoomOpen Workflow Kit — Configuration

> **Purpose**: Complete inventory of user settings (`~/.boomopen/settings.json` & `./.boomopen.json`), package/release configs, CI/CD pipelines, HSOL registries, platform configs, and environment variables in `v5.5.0`
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Edition**: `@boomopen/workflow-kit` `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)

---

## Table of Contents

- [Overview](#overview)
- [3-Surface Unified Control Center (`settings.json` & `.boomopen.json`)](#3-surface-unified-control-center-settingsjson--boomopenjson)
- [Root Package Configuration (`package.json`)](#root-package-configuration-packagejson)
- [Release & CI/CD Configuration (`.releaserc.json` & `.github/`)](#release--cicd-configuration-releasercjson--github)
- [Git & Line-Ending Configuration (`.gitignore` & `.gitattributes`)](#git--line-ending-configuration-gitignore--gitattributes)
- [Runtime Ledgers & Manifests (`~/.boomopen/` & `.boomopen/`)](#runtime-ledgers--manifests-boomopen--boomopen)
- [HSOL v5.5 Configuration (`matrix-skills/`)](#hsol-v55-configuration-matrix-skills)
- [Platform-Specific Configuration (`platforms/`)](#platform-specific-configuration-platforms)
- [Web Application Configuration (`web/`)](#web-application-configuration-web)
- [Environment Variables & Secrets Management](#environment-variables--secrets-management)
- [Configuration Precedence Hierarchy](#configuration-precedence-hierarchy)
- [Evidence Sources](#evidence-sources)

---

## Overview

BoomOpen Workflow Kit `v5.5.0` organizes configuration across three cleanly separated layers:
1. **Runtime Orchestration Settings** — Global (`~/.boomopen/settings.json`) and workspace (`./.boomopen.json`) JSON configs managed via `/settings`, `boomopen settings`, or the local Control Center Web UI (`http://127.0.0.1:4567`), compiled ahead-of-time (`< 10ms`) into `<!-- BOOMOPEN-SETTINGS-START/END -->` blocks inside installed platform entrypoints.
2. **Framework & Skill Registry Config** — Declarative Markdown rules (`rules/*.md`), platform TOML/MDC files (`platforms/*`), and `HSOL v5.5` registries (`matrix-skills/_index.yaml`, `_dynamic.yaml`, `compact-index.json`).
3. **Packaging, CI/CD & Web Config** — `package.json`, `.releaserc.json` (`npmPublish: false`), `.github/workflows/{ci,release}.yml`, `.gitignore`, `.gitattributes`, and standalone `web/` build configs.

---

## 3-Surface Unified Control Center (`settings.json` & `.boomopen.json`)

Defined in [`cli/settings-schema.js`](../../cli/settings-schema.js), the Control Center exposes **`4` named presets** (plus automatic `custom` fingerprinting), **`20` validated enum keys**, and **`2` custom numeric line-limit keys** (`codingStandards.softFileLines`, `codingStandards.hardFileLines`):

### Named Presets (`boomopen settings preset <name>`)

| Preset | `execution.mode` | `modeAThresholdFiles` | `swarmScaling` / `maxParallelSubagents` | `defaultVariant` / `NL Trigger` | `codingStandards` | Cross-Engine Defaults |
|--------|------------------|:---------------------:|-----------------------------------------|---------------------------------|-------------------|-----------------------|
| **`smart-hybrid`** *(default)* | `auto` | `2` | `elastic` / `8` | `auto` / `auto_team` | `pragmatic` (`400`/`500`) | `current` (`councilMembers: claude,codex,antigravity`) |
| **`solo-fast`** | `mode_a` | `10` | `conservative` / `3` | `fast` / `off` | `relaxed` (`600`/`800`) | `current` (`councilMembers: claude,codex`) |
| **`deep-architect`** | `mode_b` | `1` | `elastic` / `12` | `hard` / `auto_hard` | `strict` (`300`/`400`) | `researcher=council`, `debugger/reviewer=cross_family` |
| **`adversarial-team`** | `team` | `1` | `hyper_swarm` / `12` | `team` / `auto_team` | `strict` (`300`/`400`) | `researcher/planner/reviewer=council`, `debugger=cross_family` |

### Key Settings Schema (`20` Enum Keys + `2` Numeric Keys)

| Key Group | Keys | Allowed Values |
|-----------|------|----------------|
| **Profile & Execution** | `preset`, `execution.mode`, `execution.modeAThresholdFiles`, `execution.swarmScaling`, `execution.maxParallelSubagents` | `auto\|mode_a\|mode_b\|team`; files `1\|2\|3\|5\|10`; `elastic\|hyper_swarm\|conservative`; max parallel `3\|6\|8\|12\|16` |
| **Workflows & Models** | `workflows.defaultVariant`, `workflows.naturalLanguageResearchTrigger`, `models.subagentPolicy` | `auto\|fast\|hard\|team\|ask`; `auto_team\|auto_hard\|ask_first\|off`; `quality_first\|strict_inherit\|balanced_speed` |
| **Research, Clarification & Teams** | `research.depth`, `clarification.style`, `teams.maxDebateRounds` | `5_lens_deep\|standard\|quick_brief`; `autonomous_first\|interactive_ask\|zero_questions`; rounds `1\|2\|3` |
| **Standards, Verification & Routing** | `codingStandards.preset`, `codingStandards.softFileLines`, `codingStandards.hardFileLines`, `verification.level`, `deliverables.routing`, `language.response` | `pragmatic\|strict\|relaxed` + integer line limits (`1..100000`, `soft <= hard`); `strict_e2e\|fast_check\|manual`; `brain_artifacts\|workspace_reports\|both`; `auto` or any of the `17` language codes |
| **Cross-Engine Conductor** | `engines.{researcher,planner,coder,debugger,reviewer}`, `engines.councilMembers` | `current\|auto\|cross_family\|council\|antigravity\|claude\|codex\|cursor\|copilot`; `2+` comma-separated engines |

### Storage & AOT Sync Behavior
- **Global Settings (`~/.boomopen/settings.json`)**: Updated via `boomopen settings set <key> <val>` or `boomopen settings --ui`; triggers `syncSettingsToInstalledPlatforms()` (`< 10ms`) to rewrite the `<!-- BOOMOPEN-SETTINGS-START/END -->` block across every installed platform entrypoint.
- **Project Override (`./.boomopen.json`)**: Created inside a target project directory via `boomopen settings set <key> <val> --project` (run from that project directory). Never leaks into global `~/.<tool>/` entrypoints.

---

## Root Package Configuration (`package.json`)

| Field | Value | Purpose |
|-------|-------|---------|
| `name` | `@boomopen/workflow-kit` | Canonical package identifier |
| `version` | `5.5.0` | Current release version (`KIT_VERSION` single source of truth) |
| `main` | `cli/install.js` | Programmatic CommonJS module entry |
| `bin.boomopen` | `./cli/install.js` | CLI binary exposed on `PATH` when linked via `npm link` |
| `engines.node` | `>=18.0.0` | Minimum Node.js runtime requirement |
| `license` | `MIT` | Open-source license for kit code |
| `author` | `BoomOpen Labs` | Maintainer identity |
| `repository.url` | `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git` | Canonical source-only GitHub repository |

### `files` Whitelist (`package.json`)
Verified by [`cli/packaging.test.js`](../../cli/packaging.test.js) and `npm run test:pack`:
- **Included Directories (`11`)**: `cli/` (excluding `cli/*.test.js` and test helper files), `agents/`, `commands/`, `rules/`, `matrix-skills/`, `skills/`, `skills_library/` (excluding `last30days/assets/` and `loki-mode/{benchmarks,demo}/`), `scripts/` (excluding `__pycache__/` and `*.py[cod]`), `documents/`, `i18n/`, `platforms/`.
- **Included Root Files (`12`)**: `AGENT.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `GEMINI.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `README.md`, `SECURITY.md`, `SKILL.md`, `CHANGELOG.md` (plus `package.json`).
- **Excluded**: `web/`, `AGENT-TEMPLATE.md`, `.github/`, `.releaserc.json`, `.gitignore`, `.gitattributes`.

### `devDependencies` (`9` Packages — Release Toolchain Only)
`@semantic-release/changelog`, `@semantic-release/commit-analyzer`, `@semantic-release/exec`, `@semantic-release/git`, `@semantic-release/github`, `@semantic-release/npm`, `@semantic-release/release-notes-generator`, `conventional-changelog-conventionalcommits`, and `semantic-release`. Zero runtime dependencies and zero Git hook runner packages are used, ensuring 100% portable installs across Windows `cmd.exe` / PowerShell, macOS, and Linux.

---

## Release & CI/CD Configuration (`.releaserc.json` & `.github/`)

### `.releaserc.json` (`npmPublish: false`)
- **Branch**: `main` | **Repository**: `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git`
- **Ordered Plugin Pipeline**:
  1. `@semantic-release/exec` — Runs `verifyConditionsCmd: "node .github/scripts/release-guard.js"` to block accidental misconfigured releases.
  2. `@semantic-release/commit-analyzer` — Conventional Commits (`feat` -> minor; `fix`/`perf`/`refactor`/`docs(README)` -> patch; `breaking: true` -> major; `chore`/`style`/`test` -> no release).
  3. `@semantic-release/release-notes-generator` — Groups release notes into Features, Bug Fixes, Performance, Refactoring, and Documentation.
  4. `@semantic-release/changelog` — Updates `CHANGELOG.md`.
  5. `@semantic-release/npm` — Configured with **`"npmPublish": false`** (synchronizes `package.json` and `package-lock.json` versions locally without publishing to npm).
  6. `@semantic-release/git` — Commits `CHANGELOG.md`, `package.json`, and `package-lock.json` with `[skip ci]`.
  7. `@semantic-release/github` — Publishes GitHub Release tags and notes.

### `.github/workflows/ci.yml` & `.github/workflows/release.yml`
- **`ci.yml`**: Runs automatically on pushes to `main` and pull requests across `4` jobs (`cli` on Ubuntu/Windows/macOS × Node `18`/`20`/`22`; `syntax` Python `3.10` + shell syntax + `third-party-notices.js --check`; `web` on Ubuntu/Windows/macOS × Node `20`/`22`; `package` tarball smoke test on Ubuntu/Windows).
- **`release.yml`**: Manual `workflow_dispatch` only (`dry_run: true` default), gated by `npm test`, `npm run lint`, `check . --strict-phase --no-stubs`, and `npm run test:pack` (documented in [`.github/RELEASING.md`](../../.github/RELEASING.md)).

---

## Git & Line-Ending Configuration (`.gitignore` & `.gitattributes`)

- **[`.gitattributes`](../../.gitattributes)**: Enforces `* text=auto eol=lf` so shell scripts, Markdown budgets, and SHA-256 hashes stay deterministic across Windows and POSIX systems.
- **[`.gitignore`](../../.gitignore)**: Excludes build outputs (`out`, `dist`), `node_modules`, secrets (`.env*` except `!.env.example`, `.npmrc` except `!web/.npmrc`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.cert`, `*.secret`), transient session/report outputs (`reports/`, `.brain/`), Python caches (`__pycache__/`, `*.py[cod]`), workspace overrides & ephemeral conductor runs (`.boomopen.json`, `.boomopen/conductor/`), and local AI assistant directories (`.cursor/`, `.claude/`, `.gemini/`, `.codex/`, `.copilot/`, `.antigravity/`, `.agent/`).

---

## Runtime Ledgers & Manifests (`~/.boomopen/` & `.boomopen/`)

| Path | Scope | Managed By | Purpose |
|------|-------|------------|---------|
| `~/.boomopen/settings.json` | User-global | `cli/settings-store.js` | Active user preset, swarm sizing, coding standard thresholds, and engine routing |
| `~/.boomopen/manifests/<tool>.json` | User-global | `cli/manifest.js` | SHA-256 per-file ownership manifest & created-directory list for safe upgrades/uninstalls |
| `~/.boomopen/backups/<tool>/` | User-global | `cli/manifest.js`, `user-files.js` | Automatic backups of user files replaced during install or pre-manifest migrations |
| `./.boomopen.json` | Workspace | `cli/settings-store.js` | Optional per-repository settings override |
| `.boomopen/project-ledger.json` | Workspace | `cli/ledger.js`, `cli/plan.js` | Multi-session `/autopilot` DAG ledger, RTM requirements, and SHA-256 spec-hash drift guard |
| `.boomopen/conductor/runs/` | Workspace (ephemeral) | `cli/conductor.js` | Multi-Engine Council transcripts & `<runId>-COUNCIL-SYNTHESIS.md` outputs |

---

## HSOL v5.5 Configuration (`matrix-skills/`)

- **`matrix-skills/compact-index.json`**: Pre-compiled `O(1)` JSON lookup table (`totalSkills: 1462` = `22` Core Skills + `1,440` Library Skills) generated by `boomopen doctor --rebuild-index`.
- **[`matrix-skills/_index.yaml`](../../matrix-skills/_index.yaml)**: Defines `19` domain registries (`total_matrix_skills: 1476` domain mappings across `1,462` unique skills), `21` `agent_profiles` with `inherit_from` domain chains, fitness scoring weights (`0.35` semantic + `0.25` specificity + `0.20` trust + `0.10` freshness + `0.10` success rate), decision thresholds (`matrix_sufficient: 0.8`, `matrix_adequate: 0.75`), trust progression (`0.3 -> 0.5 -> 0.7 -> 1.0`), and governance states. Runtime lookup uses `skills/skill-seeker/SKILL.md` (`rules/SKILLS.md`).
- **`matrix-skills/_dynamic.yaml`**: Tracks community skills added dynamically at runtime.

---

## Platform-Specific Configuration (`platforms/`)

| Platform | Source Asset(s) | Installed Config Target(s) | Special Handling |
|----------|-----------------|----------------------------|------------------|
| **Antigravity (Gemini)** | `platforms/antigravity/GEMINI.md`, `AntigravityGlobal.agent.md`, `hooks/validate-tool-call.mjs` | `~/.gemini/GEMINI.md`, `~/.gemini/agents/AntigravityGlobal.agent.md`, `~/.gemini/config/skills/boomopen-workflow-kit/hooks/` | Cleans retired `AGENT.md` / `CLAUDE.md` in `~/.gemini/`; prints manual hook registration snippet |
| **Claude Code** | `platforms/claude/CLAUDE.md` | `~/.claude/CLAUDE.md`, `~/.claude/AGENT.md`, optional `~/.claude/settings.json` | `--with-hooks` registers `validate-tool-call.mjs` under `hooks.PreToolUse` (`cli/hook-registration.js`) |
| **OpenAI Codex** | `platforms/codex/CODEX.md`, `config.toml`, `agents/*.toml` (`21`), `skills/*` (`79`) | `~/.codex/AGENTS.md`, `~/.codex/CODEX.md`, `~/.codex/config.toml`, `~/.codex/agents/boomopen/*.toml`, `~/.codex/skills/` | `codex-config.js` merges a managed TOML block validated by `toml-lite.js`, preserving UTF-8 BOM and user edits |
| **Cursor** | `platforms/cursor/.cursorrules`, `rules/boomopen-workflow-kit.mdc` | `~/.cursor/CURSOR.md`, `~/.cursor/AGENT.md`, `~/.cursor/rules/boomopen-workflow-kit.mdc` | Cleans retired `CLAUDE.md` inside `~/.cursor/` via `legacyInstructionFiles` |
| **GitHub Copilot** | `platforms/copilot/boomopen-workflow-kit.agent.md` | `~/.copilot/COPILOT.md`, `~/.copilot/AGENT.md`, `<VSCodeUser>/prompts/boomopen-workflow-kit.agent.md` | Cleans retired `CLAUDE.md` inside `~/.copilot/` via `legacyInstructionFiles` |

---

## Web Application Configuration (`web/`)

- **[`web/package.json`](../../web/package.json)**: Private ESM (`"type": "module"`) package using React `19.2.0`, Vite `7.2.4`, Tailwind CSS `4.1.18`, TypeScript `~5.9.3`, and ESLint `9.39.1`.
- **`web/.npmrc`**: Sets `legacy-peer-deps=true` (explicitly tracked via `!web/.npmrc` in `.gitignore`, contains zero credentials).
- **[`web/vite.config.ts`](../../web/vite.config.ts)**: Uses `react()`, `tailwindcss()`, and `sitePlugin()`, outputs hashed assets under `static/`, aliases `@` -> `/src`, and splits `react-vendor` and `animation-vendor` chunks.
- **`web/tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`**: `ES2022` target, `bundler` resolution, `react-jsx`, `verbatimModuleSyntax: true`.
- **`web/vercel.json`**: SPA fallback rewrite (`/(.*) -> /index.html`).

---

## Environment Variables & Secrets Management

### CLI Environment Variables
The CLI requires **zero API keys or secrets**. Standard OS environment variables consulted for path resolution and sandboxing:

| Variable | Used By | Purpose |
|----------|---------|---------|
| `HOME` / `USERPROFILE` | `os.homedir()` / sandboxed tests | Resolves user home directory for `~/.<tool>/` and `~/.boomopen/` |
| `APPDATA` / `LOCALAPPDATA` / `XDG_CONFIG_HOME` | `cli/platform-paths.js` | Resolves OS-specific VS Code user `prompts` directory on Windows and Linux |
| `INIT_CWD` & `npm_lifecycle_event` | `cli/install.js` (`settingsCwd()`) | Ensures `npm run settings` resolves caller directory accurately when invoked via npm scripts |

### CI/CD Secrets Policy
- **Zero Secrets in Repo**: Enforced by `.gitignore` and [`cli/docs-content.test.js`](../../cli/docs-content.test.js) (scans repo files against GitHub PAT, Google API key, AWS key, and PEM private key patterns).
- **Release Token**: `.github/workflows/release.yml` uses GitHub Actions' built-in `GITHUB_TOKEN` to push release tags and create GitHub Releases (`NPM_TOKEN` is not required because `.releaserc.json` enforces `"npmPublish": false`).

---

## Configuration Precedence Hierarchy

```text
1. Explicit Turn Command (/cmd:variant, @fast / @deep / @team)   [Highest Precedence]
      ↓ overrides
2. Workspace Override (./.boomopen.json)
      ↓ overrides
3. Global User Settings (~/.boomopen/settings.json -> AOT synced into entrypoints)
      ↓ overrides
4. Canonical Kit Defaults (DEFAULT_SETTINGS in cli/settings-schema.js & rules/*.md)
```

---

## Evidence Sources

| File | Verification Purpose |
|------|----------------------|
| [../../cli/settings-schema.js](../../cli/settings-schema.js) | Verified `4` presets, `20` enum keys, `2` numeric line-limit keys, and `DEFAULT_SETTINGS` |
| [../../package.json](../../package.json) | Verified `5.5.0` metadata, `bin.boomopen`, `files` whitelist, `28` scripts, and `9` devDependencies |
| [../../.releaserc.json](../../.releaserc.json) | Verified `release-guard.js`, `npmPublish: false`, and conventional-commit rules |
| [../../.gitignore](../../.gitignore) & [../../.gitattributes](../../.gitattributes) | Verified LF normalization and secret/artifact ignore rules |
| [../../matrix-skills/_index.yaml](../../matrix-skills/_index.yaml) | Verified `19` domains, `21` agent profiles, fitness weights, and trust thresholds |
| [../../SECURITY.md](../../SECURITY.md) & [../../THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) | Verified security guard model and third-party skill attribution policy |
