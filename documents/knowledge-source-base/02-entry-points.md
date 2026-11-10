# BoomOpen Workflow Kit — Entry Points

> **Purpose**: Maps all CLI, AI platform, build, CI/CD, and configuration entry points in `@boomopen/workflow-kit` `v5.5.0`
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Edition**: `@boomopen/workflow-kit` `v5.5.0` (Multi-Platform Unified & Smart-Hybrid Edition)

---

## Table of Contents

1. [Application Entry Files](#application-entry-files)
2. [CLI Boot and Execution Flows](#cli-boot-and-execution-flows)
3. [Platform Installation Target Trees](#platform-installation-target-trees)
4. [Build, Verification, and CI/CD Entry Points](#build-verification-and-cicd-entry-points)
5. [Configuration Entry Points](#configuration-entry-points)
6. [Web Application Entry Points](#web-application-entry-points)
7. [Evidence Sources](#evidence-sources)

---

## Application Entry Files

### Primary CLI Entry: `cli/install.js` (`boomopen`)

`cli/install.js` is the primary executable CLI router declared in [`package.json`](../../package.json) under both `main` and `bin`:

```json
{
  "main": "cli/install.js",
  "bin": {
    "boomopen": "./cli/install.js"
  }
}
```

- **Shebang & Mode**: `#!/usr/bin/env node` (`'use strict'`, CommonJS)
- **Modular Architecture**: `cli/install.js` (`~738` lines) delegates specialized responsibilities across **`40` modular `cli/*.js` files** (`41` production JavaScript modules total), keeping zero external runtime npm dependencies (`node:fs`, `node:path`, `node:os`, `node:readline`, `node:crypto`, `node:http`, `node:child_process`).
- **Minimum Runtime**: Node.js `>=18.0.0`
- **Source-Only Invocation**: Because the kit is not published to the public npm registry (`npmPublish: false`), users clone `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git` and run `node cli/install.js <command>` directly or run `npm link` inside the clone to expose the `boomopen` binary on `PATH`.

### Secondary Runtime Entrypoints: `13` Audited AI Bootstrap Files (`<= 350` Line Budget)

AI coding assistants initialize the Smart-Hybrid Orchestrator by reading compact instruction entrypoints (`~220-250` lines in practice, enforced at `MAX_ENTRY_LINES = 350` by `boomopen doctor` and [`cli/docs-content.test.js`](../../cli/docs-content.test.js)). Each carries `<!-- boomopen-workflow-kit-START/END -->` ownership markers and an AOT-synced `<!-- BOOMOPEN-SETTINGS-START/END -->` settings block:

| Scope | File(s) | Consumed By | Bootstrap Behavior (`v5.5`) |
|-------|---------|-------------|-----------------------------|
| **Root Entrypoints (`6`)** | [`GEMINI.md`](../../GEMINI.md), [`CLAUDE.md`](../../CLAUDE.md), [`CODEX.md`](../../CODEX.md), [`COPILOT.md`](../../COPILOT.md), [`CURSOR.md`](../../CURSOR.md), [`AGENT.md`](../../AGENT.md) | Repository-level sessions & `buildPlan` source templates | Zero-latency Turn-1 gate (`Mode A` micro-direct vs. `Mode B` parallel sub-agent orchestration); `rules/CORE.md` loaded **on demand** only in `Mode B` |
| **Platform Bundle Entrypoints (`7`)** | `platforms/antigravity/GEMINI.md`, `platforms/antigravity/AntigravityGlobal.agent.md`, `platforms/claude/CLAUDE.md`, `platforms/codex/CODEX.md`, `platforms/copilot/boomopen-workflow-kit.agent.md`, `platforms/cursor/.cursorrules`, `platforms/cursor/rules/boomopen-workflow-kit.mdc` | Global user-home AI assistant installations | Platform-native tool bindings (`invoke_subagent`, `Task`, Codex multi-agent roles, Cursor subagents, Copilot `runSubagent`) + pre-embedded 5-Field Handoff Packet |

---

## CLI Boot and Execution Flows

### 1. Invocation & `12` CLI Subcommands

```bash
# Source clone invocation (recommended)
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
node cli/install.js install claude --with-hooks
node cli/install.js install --all

# Linked global binary (optional, after `npm link` inside the clone)
boomopen list
boomopen settings --ui
boomopen doctor
boomopen check . --strict-phase --no-stubs
```

`main()` in [`cli/install.js`](../../cli/install.js) parses `process.argv` via `parseArgs()` and dispatches across `12` subcommands (plus `help` / `--version`):

| Subcommand | Alias | Handler Module | Purpose |
|------------|-------|----------------|---------|
| `install <tool\|--all> [--with-hooks]` | — | `install.js`, `install-steps.js`, `manifest.js` | Manifest-tracked installation for `cursor`, `copilot` (`antigravity`/`gemini`, `claude`/`claude-code`, `codex`) |
| `uninstall <tool\|--all>` | — | `install.js`, `manifest.js` | Non-destructive removal preserving user-authored and user-edited files |
| `list` | — | `install.js` | Displays install status, version, active entry files, and manifest-tracked file count per tool |
| `settings [subcmd]` | `config` | `settings.js`, `settings-ui.js` | 3-Surface Control Center (`status`, `get`, `set`, `mode`, `preset`, `sync`, `reset`, `ui` / `--ui` on `http://127.0.0.1:4567`) |
| `doctor [flags]` | — | `doctor.js` (`doctor-*.js`) | Audits kit source, 5 platform bundles, Markdown line/mojibake budgets, `compact-index.json`, settings, and Conductor engines |
| `check [dir] [flags]` | — | `checker.js` (`checker-*.js`) | Enforces Pragmatic 2-Tier Coding Standards + `--strict-phase --no-stubs` Zero-Omission Phase Ratchet |
| `research <validate\|brief>` | — | `research.js` | Enforces `RES-G1..G4` (`--mode research\|brainstorm`) and compiles downstream `HANDOFF_BRIEF` |
| `design <validate\|contract>` | — | `design.js` | Enforces `DESIGN-G1..G4` (OKLCH, 5-State UI Matrix, WCAG 2.2 AA) and extracts `DESIGN_CONTRACT` |
| `plan <validate\|compile>` | — | `plan.js` | Enforces `PLAN-G1..G5` (DAG acyclicity, `OWNED_FILES <= 4`/shard, `SHARED_CONTRACT`) and compiles ledger |
| `cook <state\|packets\|verify-wave\|preflight>` | — | `cook.js` | 5-Stage Fast-Forward detector, 5-Field Wave Handoff Packet emitter, and `COOK-G1..G4` wave verifier |
| `ledger <init\|from-plan\|validate\|status\|next\|verify\|audit>` | — | `ledger.js` | Manages `.boomopen/project-ledger.json` with SHA-256 Spec-Hash Drift Guard for `/autopilot` |
| `conduct <probe\|dispatch\|council\|status>` | `conductor` | `conductor.js`, `conductor-engines.js` | Cross-engine `Author != Critic` dispatch & 6-task Parallel Multi-Engine Council |

### 2. Core Configuration Constants (`cli/tool-config.js`)

```javascript
KIT_DIR_NAME   = 'boomopen-workflow-kit';
CORE_DIRS      = ['agents', 'rules', 'documents', 'commands', 'matrix-skills', 'cli', 'scripts'];
ROOT_FILES     = ['README.md', 'SKILL.md', 'package.json'];
VERBATIM_DIRS  = new Set(['documents', 'skills_library']);
HOOKS_SRC      = path.join(ROOT, 'platforms', 'antigravity', 'hooks');
TOOL_KEYS      = ['cursor', 'copilot', 'antigravity', 'claude', 'codex'];
TOOL_ALIASES   = { gemini: 'antigravity', 'claude-code': 'claude' };
```

### 3. Manifest-Safe Install Flow (`installTool`)

1. **Installed-Copy Guard (`installedCopyProblem`)**: Refuses `install` / `uninstall` if invoked from `~/.<tool>/skills/boomopen-workflow-kit/cli/install.js` so the CLI never overwrites its own running folder.
2. **Ledger Initialization (`InstallLedger`)**: Opens `~/.boomopen/manifests/<tool>.json` and prepares timestamped backup storage under `~/.boomopen/backups/<tool>/`.
3. **Pre-Manifest Migration (`migrateLegacy`)**: Safely migrates byte-identical skills from older pre-manifest releases without touching user-created skills.
4. **Marked Instruction Block Merge (`installInstructionFiles`)**: Injects or updates `<!-- boomopen-workflow-kit-START --> ... <!-- boomopen-workflow-kit-END -->` inside global instruction files while preserving user text outside the block (saving `<file>.boomopen-backup` on first edit).
5. **Legacy Instruction Cleanup (`uninstallInstructionFiles`)**: Strips kit blocks from retired locations defined in `plan.legacyInstructionFiles` (such as retired `CLAUDE.md` copies inside `~/.cursor/` and `~/.copilot/`, and retired `AGENT.md` / `CLAUDE.md` copies inside `~/.gemini/`).
6. **Framework Bundle Copy (`installFramework`)**: Rebuilds `<skills>/boomopen-workflow-kit/` with `CORE_DIRS` (`commands/` also mirrored to `workflows/` for backward compatibility), `ROOT_FILES` (`README.md`, `SKILL.md`, `package.json`), `hooks/validate-tool-call.mjs`, and `install-files.json` (`VERBATIM_DIRS` skips placeholder substitution for `documents/` and `skills_library/`).
7. **Shared Folder Copy (`copySharedFolders`)**: Copies `22` core skills (`skills/`), `1,440` library skills (`skills_library/`), commands/workflows, and agents while recording SHA-256 hashes in `InstallLedger` and backing up any pre-existing user files.
8. **Platform-Specific Finalizers**:
   - **Codex**: Merges a TOML-validated managed block into `~/.codex/config.toml` (`mergeCodexConfigFile`) and isolates `21` role configs in `~/.codex/agents/boomopen/*.toml`.
   - **Antigravity**: Cleans byte-identical legacy workflow copies and retired skill folder names (`cleanupAntigravityLegacy`).
   - **Claude Code (`--with-hooks`)**: Optionally registers `validate-tool-call.mjs` as a `PreToolUse` hook in `~/.claude/settings.json` (`registerHooks`).
9. **Stale Pruning & AOT Settings Sync**: Prunes removed kit files via `ledger.pruneStale()`, saves `~/.boomopen/manifests/<tool>.json`, runs `syncSettingsToInstalledPlatforms()` (`< 10ms` AOT settings block sync), and verifies every written file on disk.

### 4. Non-Destructive Uninstall Flow (`uninstallTool`)

1. Strips only the marked kit block from `plan.instructionFiles` and `plan.legacyInstructionFiles`, keeping any user-authored instructions intact.
2. Unmerges the managed block in `~/.codex/config.toml` (for Codex) and unregisters the `PreToolUse` hook in `~/.claude/settings.json` (for Claude Code).
3. Removes `<skills>/boomopen-workflow-kit/`.
4. Executes `uninstallFromManifest(HOME, key)`: deletes only shared files whose SHA-256 still matches the manifest, keeps files modified by the user after install, restores backed-up user files, and prunes empty directories created by the installer.

---

## Platform Installation Target Trees

### 1. Antigravity (Gemini)
```text
~/.gemini/
├── GEMINI.md                                      # Marked kit block + AOT settings block
├── agents/
│   ├── AntigravityGlobal.agent.md                 # Global Antigravity agent spec
│   └── *.md + teams/                              # 21 specialists + 18 teams
└── config/
    ├── global_workflows/                          # 84 flat workflow files (from commands/)
    ├── skills/
    │   ├── boomopen-workflow-kit/                 # Framework: CORE_DIRS + workflows/ + hooks/ + ROOT_FILES + install-files.json
    │   └── {22 core skills}/                      # Pre-loaded Core Skills (incl. skill-seeker)
    └── skills_library/
        └── {1,440 library skills}/                # On-demand niche vault (copied verbatim)

~/.antigravity/
├── agents/                                        # User-accessible agents + teams
└── workflows/                                     # User-accessible workflows
```

### 2. Claude Code
```text
~/.claude/
├── CLAUDE.md                                      # Marked kit block + AOT settings block
├── AGENT.md                                       # Generic Orchestrator entrypoint
├── settings.json                                  # Touched ONLY when `--with-hooks` registers PreToolUse guard
├── commands/                                      # 84 flat command files + _ref/
├── agents/                                        # 21 specialists + 18 teams
├── skills/
│   ├── boomopen-workflow-kit/                     # Framework bundle
│   └── {22 core skills}/                          # Pre-loaded Core Skills
└── skills_library/
    └── {1,440 library skills}/                    # On-demand niche vault
```

### 3. OpenAI Codex
```text
~/.codex/
├── AGENTS.md                                      # Primary global instructions read natively by Codex
├── CODEX.md                                       # Codex Orchestrator entrypoint
├── AGENT.md                                       # Generic Orchestrator entrypoint
├── config.toml                                    # TOML-validated managed block (multi_agent + role pointers)
├── commands/                                      # 84 flat command files + _ref/
├── agents/
│   └── boomopen/*.toml                            # 21 kit-isolated role TOMLs (user's ~/.codex/agents/*.toml untouched)
├── skills/
│   ├── boomopen-workflow-kit/                     # Framework bundle
│   ├── {22 core skills}/                          # Pre-loaded Core Skills
│   └── boomopen-workflow-kit-{cmd}/               # 79 generated native Codex command skills
└── skills_library/
    └── {1,440 library skills}/                    # On-demand niche vault
```

### 4. Cursor
```text
~/.cursor/
├── CURSOR.md                                      # Installed from platforms/cursor/.cursorrules (marked block)
├── AGENT.md                                       # Generic Orchestrator entrypoint
├── rules/
│   └── boomopen-workflow-kit.mdc                  # Native Cursor MDC rule (<= 250 lines, AOT settings synced)
├── commands/                                      # 84 flat command files + _ref/
├── agents/                                        # 21 specialists + 18 teams
├── skills/
│   ├── boomopen-workflow-kit/                     # Framework bundle
│   └── {22 core skills}/                          # Pre-loaded Core Skills
└── skills_library/
    └── {1,440 library skills}/                    # On-demand niche vault
```
*(Note: Retired `CLAUDE.md` copies inside `~/.cursor/` are automatically cleaned via `legacyInstructionFiles` on install/uninstall.)*

### 5. GitHub Copilot
```text
~/.copilot/
├── COPILOT.md                                     # Copilot Orchestrator entrypoint
├── AGENT.md                                       # Generic Orchestrator entrypoint
├── commands/                                      # 84 flat command files + _ref/
├── agents/                                        # 21 specialists + 18 teams
├── skills/
│   ├── boomopen-workflow-kit/                     # Framework bundle
│   └── {22 core skills}/                          # Pre-loaded Core Skills
└── skills_library/
    └── {1,440 library skills}/                    # On-demand niche vault

<VSCodeUserPrompts>/
└── boomopen-workflow-kit.agent.md                 # Copilot Agent Mode prompt file
```
Where `<VSCodeUserPrompts>` resolves via `cli/platform-paths.js`:
- **Windows**: `%APPDATA%\Code\User\prompts\`
- **macOS**: `~/Library/Application Support/Code/User/prompts/`
- **Linux**: `$XDG_CONFIG_HOME/Code/User/prompts/` (default `~/.config/Code/User/prompts/`)

---

## Build, Verification, and CI/CD Entry Points

### Root `package.json` Scripts (`28` Scripts)

| Category | Script(s) | Command | Purpose |
|----------|-----------|---------|---------|
| **Install** | `install:cursor`, `install:copilot`, `install:antigravity`, `install:claude`, `install:codex`, `install:all` | `node cli/install.js install <tool\|--all>` | Install kit into one or all 5 platforms |
| **Uninstall** | `uninstall:cursor`, `uninstall:copilot`, `uninstall:antigravity`, `uninstall:claude`, `uninstall:codex`, `uninstall:all` | `node cli/install.js uninstall <tool\|--all>` | Manifest-safe uninstall for one or all 5 platforms |
| **Status & Settings** | `list`, `settings`, `settings:ui` | `node cli/install.js list \| settings [--ui]` | Inspect installed tools, manage presets, or launch Web UI (`127.0.0.1:4567`) |
| **Deterministic Gates** | `doctor`, `check`, `cook`, `research`, `design`, `plan`, `ledger`, `conduct` | `node cli/install.js <subcmd>` | Run kit health, 2-Tier code gate, artifact compilers, autopilot ledger, or multi-engine council |
| **Testing & Linting** | `test`, `test:unit`, `lint`, `test:pack` | `node --test ...`, `node .github/scripts/check-syntax.js`, `node .github/scripts/pack-smoke.js` | Execute all `30` `node:test` suites, fast `15`-suite unit subset, JS syntax verification, and tarball smoke test |
| **Release** | `semantic-release` | `semantic-release` | Guarded release automation (`npmPublish: false`) |

### GitHub Actions CI/CD Entry Points (`.github/workflows/`)
- **[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)**: Triggered on `push` (`main`), `pull_request`, and `workflow_dispatch`. Runs 4 parallel jobs:
  1. `cli`: Matrix across `ubuntu-latest`, `windows-latest`, `macos-latest` × Node `18`, `20`, `22` (`npm test`, `npm run lint`, sandboxed `install claude` + `doctor` + `uninstall claude`, and `check . --strict-phase --no-stubs`).
  2. `syntax`: Ubuntu Python `3.10` compile check across `scripts/`, `skills/`, `skills_library/`, `bash -n` shell syntax check, and `third-party-notices.js --check`.
  3. `web`: Matrix across `ubuntu-latest`, `windows-latest`, `macos-latest` × Node `20`, `22` (`npm ci`, `npm run lint`, `npm run build` in `web/`).
  4. `package`: Ubuntu + Windows tarball smoke test (`npm run test:pack` -> `.github/scripts/pack-smoke.js`).
- **[`.github/workflows/release.yml`](../../.github/workflows/release.yml)**: Manual `workflow_dispatch` workflow (`dry_run: true` by default) running full verification before `npx semantic-release`.

---

## Configuration Entry Points

| File | Loaded By | Purpose |
|------|-----------|---------|
| `~/.boomopen/settings.json` | `cli/settings-store.js` | Global user settings (`smart-hybrid` default preset) synced AOT into installed entrypoints |
| `./.boomopen.json` | `cli/settings-store.js`, `checker.js`, `cook.js` | Workspace-scoped settings override (gitignored in kit repo) |
| `.boomopen/project-ledger.json` | `cli/ledger.js`, `/autopilot` | Multi-session phase gate & SHA-256 spec-hash ledger |
| `~/.boomopen/manifests/<tool>.json` | `cli/manifest.js` | Per-file SHA-256 installation ownership ledger |
| `package.json` & `.releaserc.json` | Node.js / `semantic-release` | Package metadata, CLI `bin.boomopen`, scripts, `npmPublish: false` release rules |
| `matrix-skills/compact-index.json` & `_index.yaml` | `doctor-index.js`, AI agents | `O(1)` 1,462-skill dictionary & `19`-domain HSOL configuration |
| `rules/CORE.md` | AI agents (on demand in Mode B) | Smart-Hybrid Orchestrator laws, 17-language routing, and deliverable paths |

---

## Web Application Entry Points

`web/` has its own build-time and browser-runtime entry chain (`web/package.json`):

```text
web/build/kit-stats.mjs         # predev / prebuild entry — syncs repo counts into web/src/data/kit-stats.json
web/index.html                  # Vite HTML entry (<div id="root"> + /src/main.tsx)
  └── web/src/main.tsx          # React 19 root mount
      └── web/src/App.tsx       # Client router, layout, and page composition
```

| Web Script | Command | Purpose |
|------------|---------|---------|
| `stats` | `node build/kit-stats.mjs` | Regenerate `src/data/kit-stats.json` from live repo |
| `dev` (`predev`) | `vite` | Run stats sync then launch Vite 7 dev server |
| `build` (`prebuild`) | `tsc -b && vite build` | Run stats sync, TypeScript project build, and production bundle (`web/dist/`) |
| `lint` | `eslint .` | Run ESLint v9 flat config across `**/*.{ts,tsx}` |
| `preview` | `vite preview` | Preview production bundle locally |

---

## Evidence Sources

| File | Verification Purpose |
|------|----------------------|
| [../../package.json](../../package.json) | Verified `"bin": { "boomopen": "./cli/install.js" }` and all `28` npm scripts |
| [../../cli/install.js](../../cli/install.js) | Verified `12` subcommands, `installTool()`, `uninstallTool()`, `registerHooks()`, and `syncSettings()` |
| [../../cli/tool-config.js](../../cli/tool-config.js) | Verified `CORE_DIRS`, `ROOT_FILES`, `VERBATIM_DIRS`, `TOOLS`, and per-platform `buildPlan()` |
| [../../cli/platform-paths.js](../../cli/platform-paths.js) | Verified cross-OS VS Code user prompts path resolution |
| [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml) | Verified 4-job cross-OS CI matrix |
| [../../.github/workflows/release.yml](../../.github/workflows/release.yml) | Verified manual `workflow_dispatch` release pipeline |
| [../../web/package.json](../../web/package.json) | Verified `stats`, `predev`, `dev`, `prebuild`, `build`, `lint`, and `preview` scripts |
