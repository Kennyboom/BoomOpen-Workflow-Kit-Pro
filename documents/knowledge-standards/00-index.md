# Knowledge Standards

> **Purpose**: Standards summary, table of contents, quick reference of naming conventions, automated enforcement gates, cross-references, and remaining intentional omissions for BoomOpen Workflow Kit (`@boomopen/workflow-kit` v5.5.0)
> **Last Updated**: 2026-11-10
> **Version**: 5.5.0

---

## Quick Summary

BoomOpen Workflow Kit (`@boomopen/workflow-kit` v5.5.0 — Multi-Platform Unified & Smart-Hybrid Edition) enforces engineering, documentation, and orchestration quality through deterministic zero-dependency Node.js CLI gates (`boomopen check`, `boomopen doctor`, `boomopen research`, `boomopen design`, `boomopen plan`, `boomopen cook`, `boomopen ledger`, `boomopen conduct`), `30` active `node:test` suites (`29` `cli/*.test.js` suites + `web/build/kit-stats.test.mjs`), cross-OS GitHub Actions CI (`.github/workflows/ci.yml`), and guarded Semantic Release automation (`.github/workflows/release.yml`).

Source code follows the **Pragmatic 2-Tier Coding Standards** (`Soft 400` / `Hard 500` lines, zero explicit TypeScript `any`, zero production `console.log`) paired with the **4-Layer Zero-Omission Phase Ratchet** (`boomopen check --strict-phase --no-stubs`). Instruction Markdown budgets (`rules <= 300` lines; `commands`, `agents`, `agents/teams`, `i18n`, and `skills <= 450` lines; installed kit entry blocks `<= 350` lines), UTF-8 mojibake checks, and `1,462`-skill index integrity (`22` core + `1,440` library) are enforced continuously by `boomopen doctor` and CI. The `web/` marketing site adds ESLint 9 (`typescript-eslint`) and TypeScript (`tsc -b`).

---

## Table of Contents

1. [Quick Summary](#quick-summary)
2. [Sub-Files](#sub-files)
3. [Quick Reference — Naming Conventions](#quick-reference--naming-conventions)
4. [Quick Facts](#quick-facts)
5. [Cross-References](#cross-references)
6. [Known Gaps](#known-gaps)
7. [Evidence Sources](#evidence-sources)

---

## Sub-Files

| # | File | Description |
|---|------|-------------|
| 1 | [01-code-style.md](./01-code-style.md) | Pragmatic 2-Tier Coding Standards, Zero-Omission Phase Ratchet (`--strict-phase --no-stubs`), `doctor` / `check` / deterministic CLI compilers, and naming rules by content type |
| 2 | [02-conventions.md](./02-conventions.md) | Repository layout (`v5.5.0`), flat `commands/{cmd}-{variant}.md` naming, `role#shard` keys, 3-surface artifact routing, YAML frontmatter schemas, and modular CommonJS CLI patterns |
| 3 | [03-git-workflow.md](./03-git-workflow.md) | Conventional Commits, 4-job cross-OS GitHub Actions CI (`.github/workflows/ci.yml`), guarded manual Semantic Release (`.github/workflows/release.yml`), and source-only distribution |
| 4 | [04-testing-standards.md](./04-testing-standards.md) | All `30` active `node:test` suites, `sandbox.test-helper.js` home isolation, Zero-Test-Gaming laws (`READ_ONLY_FILES` locks & `findTestGaming`), and Python verification runners (`scripts/`) |

---

## Quick Reference — Naming Conventions

| Content Type | Pattern | Examples |
|-------------|---------|----------|
| Specialist agent files (`21`) | kebab-case `.md` | `agents/backend-engineer.md`, `agents/researcher.md` |
| Parallel sub-agent shard keys | `<role>#<shard>` | `backend-engineer#contracts`, `frontend-engineer#screen-1` |
| Specialist team dirs (`18`) | kebab-case `*-team/` | `agents/teams/backend-team/`, `agents/teams/research-team/` |
| Team protocol & role files (`72`) | `_team.md` + fixed role `.md` | `_team.md`, `techlead.md`, `executor.md`, `reviewer.md` |
| Flat command files (`79`) | kebab-case `{cmd}.md` / `{cmd}-{variant}.md` | `commands/cook.md`, `commands/cook-hard.md`, `commands/cook-team.md` |
| Shared command protocols (`5`) | kebab-case `.md` in `commands/_ref/` | `commands/_ref/golden-triangle-protocol.md` |
| Governance rule files (`7`) | `UPPER_CASE` `.md` | `rules/CORE.md`, `rules/PHASES.md`, `rules/AGENTS.md` |
| Pre-loaded core skills (`22`) | kebab-case dir + `SKILL.md` | `skills/skill-seeker/`, `skills/clean-code/` |
| On-demand library skills (`1,440`) | kebab-case dir + `SKILL.md` | `skills_library/hono-rpc-zod-openapi/` |
| Matrix skill registries (`21` + JSON) | kebab-case `.yaml`, `_*.yaml`, JSON | `backend.yaml`, `_index.yaml`, `_dynamic.yaml`, `compact-index.json` |
| Root & platform entrypoints (`13`) | `UPPER_CASE` `.md` (plus platform assets) | `GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md` |
| Platform bundle directories (`5`) | kebab-case dirs | `platforms/antigravity/`, `platforms/claude/`, `platforms/codex/`, `platforms/copilot/`, `platforms/cursor/` |
| CLI source modules (`41`) | kebab-case `.js` (CommonJS) | `cli/install.js`, `cli/checker-rules.js`, `cli/doctor-markdown.js` |
| CLI & web test suites (`30`) | kebab-case `<topic>.test.{js,mjs}` | `cli/checker.test.js`, `cli/cli-e2e.test.js`, `web/build/kit-stats.test.mjs` |
| Python helper scripts (`7`) | `snake_case` `.py` | `scripts/verify_all.py`, `scripts/checklist.py` |
| Document folders & files | kebab-case dirs + `NN-` prefix | `documents/knowledge-standards/00-index.md` |
| Web components & entry | `PascalCase` `.tsx` / `camelCase` `.tsx` | `web/src/App.tsx`, `web/src/main.tsx` |

---

## Quick Facts

| Standard | Status | Enforced By |
|----------|--------|-------------|
| Pragmatic 2-Tier Coding Standards | Active | `boomopen check` ([`cli/checker.js`](../../cli/checker.js)) + CI `cli` job |
| 4-Layer Zero-Omission Phase Ratchet | Active | `boomopen check --strict-phase --no-stubs` ([`cli/checker-rules.js`](../../cli/checker-rules.js)) |
| Kit Source, Markdown Budgets & Mojibake Gate | Active | `boomopen doctor` ([`cli/doctor.js`](../../cli/doctor.js)) + `cli/docs-content.test.js` |
| Deterministic Artifact & DAG Compilers | Active | `boomopen research`, `design`, `plan`, `cook`, `ledger`, `conduct` |
| Automated Test Suite (`30` suites) | Active | `npm test`, `npm run test:unit`, `npm run test:pack` |
| Cross-Platform JS Syntax Check | Active | `npm run lint` ([`.github/scripts/check-syntax.js`](../../.github/scripts/check-syntax.js)) |
| Python (`3.10+`) & Shell Syntax Check | Active | GitHub Actions `syntax` job (`python -B` compile + `bash -n`) |
| Cross-OS CI Matrix (Linux/Windows/macOS) | Active | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (Node `18`, `20`, `22`) |
| Conventional Commits & Semantic Versioning | Active | `semantic-release` + [`.github/scripts/release-guard.js`](../../.github/scripts/release-guard.js) |
| Guarded Release Workflow (`npmPublish: false`) | Active | [`.github/workflows/release.yml`](../../.github/workflows/release.yml) + [`.releaserc.json`](../../.releaserc.json) |
| ESLint 9 & TypeScript (`web/` only) | Active | `web/eslint.config.js` + `tsc -b` in CI `web` job |
| Local `.git/hooks` Runner | Intentionally omitted | Zero `.git/hooks` mutation for cross-platform compatibility |
| Prettier / `.editorconfig` / `commitlint` | Not configured | Enforced via CLI gates and CI rather than formatting hooks |
| Code Coverage Threshold Tool | Not configured | No `c8` / `nyc` threshold gate configured |

---

## Cross-References

| Resource | Path | Relationship |
|----------|------|-------------|
| Knowledge Overview | [../knowledge-overview/00-index.md](../knowledge-overview/00-index.md) | Project identity, capabilities, and tech stack |
| Knowledge Architecture | [../knowledge-architecture/00-index.md](../knowledge-architecture/00-index.md) | Multi-agent orchestration, compilers, and platform architecture |
| Knowledge Source Base | [../knowledge-source-base/00-index.md](../knowledge-source-base/00-index.md) | Directory inventory and module breakdown |
| Knowledge Domain | [../knowledge-domain/00-index.md](../knowledge-domain/00-index.md) | Domain model, Golden Diamond teams, and skill routing |
| Package Manifest | [../../package.json](../../package.json) | Version `5.5.0`, CLI binary, scripts, and tarball `files` allowlist |
| CI Workflow | [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml) | Cross-OS Node `18/20/22` test, doctor, check, syntax, web, and pack matrix |
| Release Workflow & Policy | [../../.github/RELEASING.md](../../.github/RELEASING.md) | Manual guarded Semantic Release procedure (`npmPublish: false`) |
| Core Rules | [../../rules/CORE.md](../../rules/CORE.md) | On-demand Mode B orchestration and deliverable governance |
| Clean Code Skill | [../../skills/clean-code/SKILL.md](../../skills/clean-code/SKILL.md) | Pragmatic 2-Tier Coding Standards skill specification |
| Web ESLint Config | [../../web/eslint.config.js](../../web/eslint.config.js) | ESLint 9 flat config for the React 19 + TypeScript website |

---

## Known Gaps

These items reflect intentional omissions or unconfigured tooling in `@boomopen/workflow-kit` `v5.5.0`:

| Gap | Impact | Notes |
|-----|--------|-------|
| No Prettier or `.editorconfig` | Whitespace/quote formatting relies on contributor conventions, `npm run lint`, and `eslint` in `web/` | Keeps the root CLI repository at zero runtime/formatting dependencies |
| No local `commitlint` hook | Commit messages are analyzed during `semantic-release` rather than rejected at `git commit` time | Local `.git/hooks` are intentionally untouched across Windows, macOS, and Linux |
| No numeric test coverage gate | `30` `node:test` suites verify behavior and content, but line/branch coverage percentages are not gated | Node's `--experimental-test-coverage` or `c8` is not wired into `npm test` |
| No React component unit tests in `web/src/` | Website UI components rely on `tsc -b`, `eslint`, Vite production builds, and `web/build/kit-stats.test.mjs` | Vitest / React Testing Library is not installed in `web/` |
| No containerization (`Dockerfile`) | Not needed for a local multi-platform CLI installer and static Vite web build | CI runs directly on GitHub-hosted Linux, Windows, and macOS runners |

---

## Evidence Sources

| Source | Path |
|--------|------|
| Package manifest | [../../package.json](../../package.json) |
| Release configuration | [../../.releaserc.json](../../.releaserc.json) |
| CI & Release workflows | [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml), [../../.github/workflows/release.yml](../../.github/workflows/release.yml) |
| CLI code-standards checker | [../../cli/checker.js](../../cli/checker.js), [../../cli/checker-rules.js](../../cli/checker-rules.js) |
| CLI kit health doctor | [../../cli/doctor.js](../../cli/doctor.js), [../../cli/doctor-markdown.js](../../cli/doctor-markdown.js) |
| Sandboxed test helper | [../../cli/sandbox.test-helper.js](../../cli/sandbox.test-helper.js) |
| Agent & team examples | [../../agents/backend-engineer.md](../../agents/backend-engineer.md), [../../agents/teams/backend-team/_team.md](../../agents/teams/backend-team/_team.md) |
| Command & rule examples | [../../commands/cook.md](../../commands/cook.md), [../../rules/CORE.md](../../rules/CORE.md) |
| Python verification runners | [../../scripts/verify_all.py](../../scripts/verify_all.py), [../../scripts/checklist.py](../../scripts/checklist.py) |
