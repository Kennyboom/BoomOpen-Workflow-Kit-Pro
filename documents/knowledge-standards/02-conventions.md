# BoomOpen Workflow Kit — Conventions

> **Purpose**: Repository directory organization, flat command naming, scoped `role#shard` conventions, 3-surface deliverable routing, YAML frontmatter schemas, and modular CLI/web code structure for `@boomopen/workflow-kit` v5.5.0
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Version**: 5.5.0

---

## Directory Organization

### Root-Level Structure (`v5.5.0`)

```
BoomOpen-Workflow-Kit-Pro/
├── .github/                 # CI/Release workflows, RELEASING.md, syntax/pack/guard scripts
├── agents/                  # 21 specialist agent definitions (<= 450 lines each)
│   └── teams/               # 18 Elastic Golden Diamond teams (*-team/: _team.md + 3 roles = 72 files)
├── cli/                     # Binary entrypoint (install.js), 40 modular JS files & 29 *.test.js suites
├── commands/                # 100% flat layout: 79 *.md workflows + _ref/ (5 shared protocols) = 84 files
│   ├── cook.md              # Router command
│   ├── cook-fast.md         # Flat variant file ({cmd}-{variant}.md)
│   ├── cook-hard.md
│   ├── cook-team.md
│   └── _ref/                # Shared execution/review protocols (5 files)
├── documents/               # Committed project knowledge base & business pack
│   ├── business/            # Structured business documentation (business-*/)
│   ├── knowledge-overview/
│   ├── knowledge-architecture/
│   ├── knowledge-domain/
│   ├── knowledge-source-base/
│   └── knowledge-standards/
├── i18n/                    # 16 translated README.<lang>.md guides (17 languages w/ root README.md)
├── matrix-skills/           # 19 domain YAML files + _index.yaml + _dynamic.yaml + compact-index.json
├── platforms/               # 5 unified platform bundles (antigravity, claude, codex, copilot, cursor)
├── rules/                   # 7 on-demand Mode B governance rules (<= 300 lines each)
├── scripts/                 # 7 cross-platform Python verification & session helper scripts
├── skills/                  # 22 pre-loaded core skill directories (SKILL.md <= 450 lines)
├── skills_library/          # 1,440 dormant on-demand library skill directories (1,462 indexed total)
├── web/                     # Marketing site (React 19 + TypeScript + Vite 7 + Tailwind CSS 4)
├── GEMINI.md                # Root platform entrypoints (<= 250 lines in repo, synced w/ platforms/*)
├── CLAUDE.md
├── CODEX.md
├── COPILOT.md
├── CURSOR.md
├── AGENT.md
├── SKILL.md
└── package.json             # @boomopen/workflow-kit v5.5.0 ("bin": { "boomopen": "./cli/install.js" })
```

### Structural Pattern Rules

| Pattern | Where | Rule |
|---------|-------|------|
| **100% flat command files** | `commands/*.md` + `commands/_ref/*.md` | Base routers/standalone commands use `commands/{cmd}.md`; variants always use flat hyphenated `commands/{cmd}-{variant}.md` (`79` flat files + `5` `_ref` protocols = `84` files across `32` base slash commands). Subdirectories per command are prohibited (`cli/docs-content.test.js` enforces `_ref` as the sole subdirectory). |
| **Elastic Golden Diamond team folders** | `agents/teams/*-team/` | Each of the `18` team directories contains exactly `4` Markdown files (`72` total): `_team.md` (team topology & wave protocol) plus `techlead.md`, `executor.md`, and `reviewer.md`. |
| **Scoped parallel shard keys (`role#shard`)** | Mode B / `:team` / `PLAN-*` / `cook` | Parallel sub-agents of the same specialist role use `<role>#<shard>` identifiers (e.g., `database-architect#schema`, `backend-engineer#contracts`, `frontend-engineer#screen-1`). Each shard owns disjoint `OWNED_FILES` (`<= 3–4` files/shard) and maps `role#shard -> conversationId` for Warm Sub-agent Session Reuse. |
| **`UPPER_CASE` `.md` files** | Repo root, `platforms/*`, `rules/` | Reserved for global platform entrypoints (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`) and the `7` core rules (`CORE.md`, `PHASES.md`, `AGENTS.md`, `TEAMS.md`, `SKILLS.md`, `ERRORS.md`, `REFERENCE.md`). |
| **2-Tier Skills Vault (`HSOL v5.5`)** | `skills/`, `skills_library/`, `matrix-skills/` | `22` high-frequency core skills live in `skills/`; `1,440` specialized skills stay dormant in `skills_library/` and are resolved in `O(1)` via `matrix-skills/compact-index.json` (`1,462` total indexed skills) through `skills/skill-seeker/SKILL.md`. |
| **Underscore prefix** | `commands/_ref/`, `agents/teams/*/_team.md`, `matrix-skills/_*.yaml` | Reserved for shared protocol/meta files (`_ref/`, `_team.md`, `_index.yaml`, `_dynamic.yaml`). |

---

## Deliverable & Artifact Routing Convention

BoomOpen Workflow Kit `v5.5.0` separates transient agent working artifacts from committed repository documentation to keep the Git working tree clean:

| Surface | Path Pattern | When Used | Git Tracked? |
|---------|-------------|-----------|:------------:|
| **1. Brain Artifacts (`brain_artifacts` default)** | `<appDataDir>/brain/<conversation-id>/{PLAN,DESIGN,RESEARCH,BRAINSTORM,SCOUT,DEBUG,TEST,REVIEW,REPORT,MAILBOX}-*.md` | Default transient deliverables on Antigravity so artifacts render natively in the UI Artifact pane without polluting the workspace | Outside repo |
| **2. Workspace Reports (`workspace_reports`)** | `./reports/{topic}/` | Fallback transient artifact folder on non-Antigravity platforms (`claude`, `codex`, `cursor`, `copilot`) or when `deliverables.routing = workspace_reports` | Ignored (`reports/`) |
| **3. Committed Project Docs** | `./documents/knowledge-*/`, `./documents/business/business-*/` | Written **only** when running `/docs` (`/docs:core`, `/docs:business`, `/docs:audit`) or explicitly requested by the user | Committed |
| **4. Autopilot & Conductor State** | `.boomopen/project-ledger.json`, `.boomopen/conductor/runs/`, `./.boomopen.json` | Multi-session `/autopilot` DAG state (`project-ledger.json`), ephemeral `/conduct:council` synthesis runs (`conductor/`), and workspace settings override (`.boomopen.json`) | `conductor/` & `.boomopen.json` ignored |

### Document Numbering Convention (`documents/`)

All files inside `documents/knowledge-*/` and `documents/business/business-*/` use two-digit zero-padded prefixes:

| Prefix | Purpose | Required |
|--------|---------|----------|
| `00-index.md` | Folder index — summary, table of contents, cross-references | Yes (every knowledge/business folder) |
| `01-` through `NN-` | Sequenced topic files in logical reading order (`01-code-style.md`, `03-git-workflow.md`) | As needed |

---

## YAML Frontmatter Conventions (`v5.5.0`)

### 1. Specialist Agent Frontmatter (`agents/*.md` — `21` files)

```yaml
---
name: backend-engineer
description: Principal Backend Architect — 3-Wave Contract-First API/service sharding, Zod/OpenAPI contracts, transaction safety, and automated API/strict-phase verification
profile: "backend:execution"
handoffs: [tester, database-architect, performance-engineer, devops-engineer, frontend-engineer, security-engineer]
version: "5.5"
category: execution
---
```

- `name`: kebab-case matching filename without `.md`.
- `profile`: `<domain>:<category>` mapping to `matrix-skills/`.
- `handoffs`: canonical names from the `21` specialist agents.
- `version`: `"5.5"` | `category`: `meta`, `execution`, `validation`, `research`, or `support`.

### 2. Command Frontmatter (`commands/*.md` — `79` files)

```yaml
---
description: "🍳 Cook Router — Adaptive end-to-end feature router with Turn-1 Fast-Forward State Machine & 3-Wave Contract-First Execution"
version: "5.5"
category: engineering
execution-mode: router          # "router" for dispatchers, "execute" for concrete workflows
---
```

### 3. Team Protocol & Role Frontmatter (`agents/teams/*-team/*.md` — `72` files)

Every `*-team/` folder carries YAML frontmatter on both `_team.md` (`category: team-protocol`, `version: 5.5.0`, `pattern: elastic-golden-diamond`, `roles: [techlead, executor, reviewer]`, `role_agents`, `deliverables`) and its three role files (`techlead.md`, `executor.md`, `reviewer.md` with `category: team-role`, `version: "5.5"`, `base-agent`, `authority`, `collaborates-with`).

---

## Import, Module & Ownership Conventions

### Modular CLI Architecture (`cli/*.js` — CommonJS)

```javascript
'use strict';

const fs = require('node:fs');
const path = require('node:path');
```

- **Modular Single-Responsibility Layout**: [`cli/install.js`](../../cli/install.js) (`"bin": { "boomopen": "./cli/install.js" }`) dispatches to `40` focused CommonJS modules (`checker.js`, `checker-rules.js`, `doctor.js`, `doctor-markdown.js`, `doctor-platforms.js`, `settings.js`, `research.js`, `design.js`, `plan.js`, `cook.js`, `ledger.js`, `conductor.js`, `copy-engine.js`, `manifest.js`, etc.).
- **Strict Built-In Only Runtime**: Every Node built-in uses the `node:` protocol (`node:fs`, `node:path`, `node:crypto`, `node:http`, `node:child_process`); zero production npm packages are installed.
- **Explicit Exports for Direct Unit Testing**: Every CLI module exports pure helpers and runners via `module.exports` so `cli/*.test.js` can test logic directly in-process alongside subprocess E2E runs.
- **Non-Destructive Install Ownership**: Entry files use marked blocks (`<!-- boomopen-workflow-kit-START -->` ... `<!-- boomopen-workflow-kit-END -->` and `<!-- BOOMOPEN-SETTINGS-START -->` ... `<!-- BOOMOPEN-SETTINGS-END -->`), backed by SHA-256 per-file ownership ledgers in `~/.boomopen/manifests/<tool>.json` and automatic user backups in `~/.boomopen/backups/`.

### Web Application (`web/src/**/*.{ts,tsx}` — ES Modules)

- Uses ES module `import`/`export`, React 19 functional components, TypeScript (`~5.9.3`), Vite 7 (`web/vite.config.ts` with `@tailwindcss/vite` for Tailwind CSS 4), and build-time repository stat synchronization via [`web/build/kit-stats.mjs`](../../web/build/kit-stats.mjs).

---

## Configuration File Conventions

| File | Format | Location | Purpose |
|------|--------|----------|---------|
| `package.json` | JSON | Root | `@boomopen/workflow-kit` `5.5.0` manifest, `boomopen` bin, scripts, `files` allowlist |
| `.releaserc.json` | JSON | Root | `semantic-release` plugins (`release-guard.js`, `npmPublish: false`) |
| `.github/workflows/ci.yml` | YAML | `.github/workflows/` | 4-job cross-OS CI matrix (`cli`, `syntax`, `web`, `package`) |
| `.github/workflows/release.yml` | YAML | `.github/workflows/` | Manual `workflow_dispatch` Semantic Release workflow |
| `~/.boomopen/settings.json` & `./.boomopen.json` | JSON | User home / Workspace | Global & per-project 3-Surface Control Center settings |
| `compact-index.json` | JSON | `matrix-skills/` | Compiled `O(1)` lookup index for all `1,462` skills |
| `eslint.config.js`, `tsconfig*.json`, `vite.config.ts` | JS / JSON / TS | `web/` | ESLint 9 flat config, TypeScript project refs, Vite 7 + Tailwind CSS 4 |

---

## Evidence Sources

| Source | Path |
|--------|------|
| Specialist agent frontmatter | [../../agents/backend-engineer.md](../../agents/backend-engineer.md) |
| Team protocol & role frontmatter | [../../agents/teams/backend-team/_team.md](../../agents/teams/backend-team/_team.md), [../../agents/teams/backend-team/techlead.md](../../agents/teams/backend-team/techlead.md) |
| Flat command router example | [../../commands/cook.md](../../commands/cook.md) |
| CLI binary & modular architecture | [../../cli/install.js](../../cli/install.js), [../../cli/checker.js](../../cli/checker.js), [../../cli/doctor.js](../../cli/doctor.js) |
| Marked-block & manifest ownership | [../../cli/markers.js](../../cli/markers.js), [../../cli/manifest.js](../../cli/manifest.js) |
| Matrix skills index | [../../matrix-skills/_index.yaml](../../matrix-skills/_index.yaml), [../../matrix-skills/compact-index.json](../../matrix-skills/compact-index.json) |
| Web build & config | [../../web/vite.config.ts](../../web/vite.config.ts), [../../web/eslint.config.js](../../web/eslint.config.js), [../../web/build/kit-stats.mjs](../../web/build/kit-stats.mjs) |
| Package manifest | [../../package.json](../../package.json) |
