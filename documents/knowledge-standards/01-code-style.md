# BoomOpen Workflow Kit — Code Style & Pragmatic 2-Tier Coding Standards

> **Purpose**: Pragmatic 2-Tier Coding Standards, Zero-Omission Phase Ratchet, deterministic CLI verification & compiler gates, and naming conventions for BoomOpen Workflow Kit (`@boomopen/workflow-kit` v5.5.0)
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Version**: 5.5.0

---

## Pragmatic 2-Tier Coding Standards (v5.5.0)

BoomOpen Workflow Kit (`v5.5.0`, Smart-Hybrid Edition) separates **non-negotiable safety and quality rules (Tier 1)** from **flexible structural guidelines (Tier 2)** so engineers write cohesive, maintainable modules without mechanically shattering sequential logic into micro-files. Active line thresholds are configurable via `boomopen settings` (`~/.boomopen/settings.json`) and workspace `./.boomopen.json`.

### Tier 1 — Strict Quality & Safety Rules (Zero Tolerance)

1. **Single Responsibility (SRP)**: Every file and function solves **one clear responsibility** or domain boundary.
2. **NO Explicit `any` in TypeScript**: Always use concrete interfaces/types, `unknown` + Type Guard or Zod validation, or Generics `<T>`.
3. **NO Leftover `console.log` in Production App Code**: Use a structured logger (`debug`/`info`/`warn`/`error`) in application UI, API, and service modules; remove temporary debug logs before completion. *(Allowed in CLI tools under `cli/`, `bin/`, `scripts/`, and test suites.)*
4. **Error Handling & Named Constants**: Every async/API/I/O boundary must use `try/catch` with typed error handling; business and configuration constants use `SCREAMING_SNAKE_CASE`.
5. **DRY & Clean Imports**: Extract shared logic repeated `>= 3` times into a dedicated helper; order imports (`external` -> `internal` -> `relative`) and remove unused imports.

### Tier 2 — Flexible Structural Guidelines (Cohesion Over Mechanical Splitting)

| Guideline | Soft Target | Pragmatic Ceiling & Exemption Rule |
|-----------|:-----------:|------------------------------------|
| **File length** | **~200–350 lines** *(flexible to `400`)* | [`cli/checker.js`](../../cli/checker.js) warns at `401–500` lines (`SOFT_FILE_LINES = 400`) and fails only above `500` lines (`HARD_FILE_LINES = 500`). **Exempt**: Test files (`*.test.*`, `*.spec.*`, `test_*.py`, `*_test.go`), `.d.ts` declarations, `types.*` / `schema.*` files, `cli/install.js`, and Markdown docs (audited separately by `boomopen doctor`). |
| **Function length** | **~20–40 lines** *(logic)* / **~40–80 lines** *(UI/Handler)* | Extract sub-functions only for reuse (DRY) or an independent conceptual step. Never fragment simple sequential logic. |
| **Line width** | **~100–120 chars** | Flexible for long URLs, regular expressions, Tailwind CSS utility strings, and Markdown tables. |
| **Nesting & Params** | **`<= 3–4` levels** / **`<= 4–5` params** | Prefer Guard Clauses (early returns) and pass an options/config object when optional parameters grow. |

### 4-Layer Zero-Omission Phase Ratchet (`--strict-phase --no-stubs`)

In `v5.5.0`, running `boomopen check [dir] --strict-phase --no-stubs` (enforced in CI and post-wave `/cook`, `/code`, and `/autopilot` verification) activates strict anti-shortcut AST/lexer checks in [`cli/checker-rules.js`](../../cli/checker-rules.js):

1. **Zero Deferred Work Comments (`findDeferredTodoComment`)**: Rejects `TODO:`, `FIXME:`, `PLACEHOLDER:`, and `XXX` markers inside JS/TS, Python, Rust, and Go comments so unfinished work cannot silently pass a wave gate.
2. **Zero Hollow Stubs (`findHollowStub`)**: Rejects `throw new Error("Not implemented" | "TODO" | "stub")`, Python `raise NotImplementedError`, Rust `todo!()` / `unimplemented!()` macros, and test mocks (`vi.mock`, `jest.mock`, `spyOn`) leaked into production source files.
3. **Zero Test Gaming (`findTestGaming`)**: Rejects skipped, focused, or deferred tests (`it.skip`, `test.only`, `describe.todo`) and vacuous assertions (`expect(true).toBe(true)`) inside test files.
4. **Immutable Ownership & Regression Locks**: Paired with `boomopen cook verify-wave` and `boomopen conduct dispatch`, enforces disjoint `OWNED_FILES` (`<= 3–4` files/shard) and SHA-256 `READ_ONLY_FILES` regression locks.

---

## Built-In CLI Verification & Deterministic Compilers

All CLI gates run via `node cli/install.js <cmd>` (or `boomopen <cmd>` after `npm link`) with zero runtime npm dependencies:

| Command | Module | What It Enforces |
|---------|--------|------------------|
| `boomopen check [dir] [--strict-phase] [--no-stubs] [--ignore <glob>]` | [`cli/checker.js`](../../cli/checker.js) | Audits `.js`, `.mjs`, `.cjs`, `.ts`, `.mts`, `.cts`, `.tsx`, `.jsx`, `.py`, `.go`, `.rs` files against Pragmatic 2-Tier limits (`400`/`500` lines, explicit `any`, production `console.log`) plus the Zero-Omission Phase Ratchet (`--strict-phase --no-stubs`), respecting `~/.boomopen/settings.json` and `./.boomopen.json`. |
| `boomopen doctor [--platform <name>] [--source-only] [--rebuild-index]` | [`cli/doctor.js`](../../cli/doctor.js), [`cli/doctor-markdown.js`](../../cli/doctor-markdown.js) | Audits kit source (`5` platform bundles, `13` root/platform entrypoints authored `<= 250` lines with `MAX_ENTRY_LINES = 350` installed kit-block budget, `7` `rules/*.md` `<= 300` lines, `84` command files = `79` flat `commands/*.md` + `5` `commands/_ref/*.md` `<= 450` lines, `21` specialist `agents/*.md` `<= 450` lines, `72` team files across `18` teams = `54` role files + `18` `_team.md` `<= 450` lines, `16` `i18n/README.*.md` `<= 450` lines, `22` core `skills/*/SKILL.md` `<= 450` lines, `0` mojibake, `0` legacy refs), `matrix-skills/compact-index.json` (`1,462` skills), installed platform homes/manifests, `~/.boomopen/settings.json`, and Conductor CLI engines. |
| `npm run lint` | [`.github/scripts/check-syntax.js`](../../.github/scripts/check-syntax.js) | Runs `node --check` on every `.js`, `.mjs`, and `.cjs` file across `cli/`, `platforms/`, `.github/scripts/`, and `web/build/`. |
| `boomopen research <validate\|brief> <file.md>` | [`cli/research.js`](../../cli/research.js) | Enforces 6-Block `RESEARCH-*` and `BRAINSTORM-*` (`--mode brainstorm`) gates `RES-G1..G4` and compiles compact `HANDOFF_BRIEF` packets. |
| `boomopen design <validate\|contract> <design.md>` | [`cli/design.js`](../../cli/design.js) | Enforces 6-Block `DESIGN-*` gates `DESIGN-G1..G4` (OKLCH + hex tokens, 5-State UI Matrix, WCAG 2.2 AA) and extracts executable `DESIGN_CONTRACT` (`@theme` CSS + TypeScript props). |
| `boomopen plan <validate\|compile> <plan.md> [--sync-ledger]` | [`cli/plan.js`](../../cli/plan.js) | Enforces `PLAN-G1..G5` (DAG acyclicity, disjoint `OWNED_FILES <= 4` files/shard, `SHARED_CONTRACT`, verification commands, `<= 500` lines) and compiles `.boomopen/project-ledger.json`. |
| `boomopen cook <state\|packets\|verify-wave\|preflight> <plan.md>` | [`cli/cook.js`](../../cli/cook.js) | Runs the 5-Stage Fast-Forward state machine, compiles 5-Field Wave Handoff Packets, and enforces `COOK-G1..G4` post-wave ownership and `--strict-phase --no-stubs` gates. |
| `boomopen ledger <init\|from-plan\|validate\|status\|next\|verify\|audit>` | [`cli/ledger.js`](../../cli/ledger.js) | Manages `.boomopen/project-ledger.json` with SHA-256 Spec-Hash Drift Guard for multi-session `/autopilot` execution. |
| `boomopen conduct <probe\|dispatch\|council\|status>` | [`cli/conductor.js`](../../cli/conductor.js) | Enforces Cross-Engine `Author != Critic` dispatch, SHA-256 `READ_ONLY_FILES` integrity, and 6-Task Multi-Engine Council synthesis (`research\|brainstorm\|plan\|design\|review\|debug`). |

### Instruction Markdown Line Budgets (`DOC_LINE_LIMITS`)

Because agents load instruction Markdown into context windows, [`cli/doctor-markdown.js`](../../cli/doctor-markdown.js) and [`cli/doctor-platforms.js`](../../cli/doctor-platforms.js) enforce explicit line ceilings separate from code line limits:

| Audited Scope | Constant | Hard Limit |
|---------------|----------|:----------:|
| Root & platform entrypoints (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`, installed blocks) | `MAX_ENTRY_LINES` | `<= 350` lines *(repo entrypoints kept compact at `<= 250` lines)* |
| Core governance rules (`rules/*.md` — `7` files) | `DOC_LINE_LIMITS.rules` | `<= 300` lines |
| Slash commands (`commands/*.md` + `commands/_ref/*.md` — `84` files) | `DOC_LINE_LIMITS.commands` | `<= 450` lines |
| Specialist agents (`agents/*.md` — `21` files) | `DOC_LINE_LIMITS.agents` | `<= 450` lines |
| Elastic Golden Diamond teams (`agents/teams/*-team/*.md` — `72` files) | `DOC_LINE_LIMITS['agents/teams']` | `<= 450` lines |
| Translated guides (`i18n/README.*.md` — `16` files) | `DOC_LINE_LIMITS.i18n` | `<= 450` lines (`>= 130` lines min) |
| Core skills (`skills/*/SKILL.md` — `22` files) | `DOC_LINE_LIMITS.skills` | `<= 450` lines |

---

## Naming Conventions by Content Type

### Markdown — Specialist Agents & Teams (`agents/*.md` & `agents/teams/*-team/*.md`)

| Element | Convention | Example |
|---------|-----------|---------|
| Specialist file name (`21`) | kebab-case `.md` | `backend-engineer.md`, `researcher.md`, `docs-manager.md` |
| YAML `name` | kebab-case matching filename | `name: backend-engineer` |
| Scoped parallel shard ID | `agent:<name>` + `<name>#<shard>` | `backend-engineer#contracts`, `backend-engineer#api-auth` |
| YAML `profile` | `domain:category` | `"backend:execution"`, `"research:exploration"` |
| YAML `handoffs` | Array of canonical specialist names | `[tester, database-architect, performance-engineer]` |
| YAML `version` | `"5.5"` (agents/roles) or `5.5.0` (`_team.md`) | `version: "5.5"`, `version: 5.5.0` |
| Team directory (`18`) | `<domain>-team/` with `4` files each | `agents/teams/backend-team/{_team.md,techlead.md,executor.md,reviewer.md}` |

### Markdown — Flat Command Files (`commands/*.md` & `commands/_ref/*.md`)

| Element | Convention | Example |
|---------|-----------|---------|
| Base router / standalone file | Flat kebab-case `commands/{cmd}.md` | `commands/cook.md`, `commands/autopilot.md`, `commands/settings.md` |
| Variant workflow file | Flat hyphenated `commands/{cmd}-{variant}.md` | `commands/cook-fast.md`, `commands/cook-hard.md`, `commands/cook-team.md` |
| Shared protocol reference | `commands/_ref/<protocol>.md` | `commands/_ref/golden-triangle-protocol.md` |
| YAML `version` & `execution-mode` | `"5.5"` + `router` or `execute` | `version: "5.5"`, `execution-mode: router` |

### Markdown — Governance Rules (`rules/*.md`)

| Element | Convention | Example |
|---------|-----------|---------|
| File name (`7` files) | `UPPER_CASE.md` | `CORE.md`, `PHASES.md`, `AGENTS.md`, `TEAMS.md`, `SKILLS.md`, `ERRORS.md`, `REFERENCE.md` |

### JavaScript — Modular CLI (`cli/*.js`) & Build Scripts

| Element | Convention | Example |
|---------|-----------|---------|
| File name (`41` modules) | kebab-case `.js` | `install.js`, `checker-rules.js`, `doctor-markdown.js`, `settings-store.js` |
| Module system | `'use strict'` + CommonJS (`require`/`module.exports`) with `node:` prefix | `const fs = require('node:fs');` |
| Functions | `camelCase` verb phrases | `inspectSourceFile()`, `buildCompactSkillIndex()`, `runDoctor()` |
| Constants | `SCREAMING_SNAKE_CASE` | `SOFT_FILE_LINES = 400`, `HARD_FILE_LINES = 500`, `MAX_ENTRY_LINES = 350` |

### TypeScript & React (`web/src/**/*.{ts,tsx}`) and Python (`scripts/*.py`)

| Element | Convention | Example |
|---------|-----------|---------|
| React components & entry (`web/src/`) | `PascalCase.tsx` components, `camelCase.tsx` entry, ES modules | `web/src/App.tsx`, `web/src/main.tsx` |
| Python helper scripts (`scripts/`) | `snake_case.py`, UTF-8 output, `sys.dont_write_bytecode = True` | `scripts/verify_all.py`, `scripts/checklist.py`, `scripts/kit_checks.py` |
