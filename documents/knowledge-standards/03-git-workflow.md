# BoomOpen Workflow Kit — Git Workflow, CI/CD & Release Pipeline

> **Purpose**: Conventional Commits specification, cross-OS GitHub Actions CI matrix, guarded Semantic Release workflow, local verification discipline, and source-only distribution policy for `@boomopen/workflow-kit` v5.5.0
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Version**: 5.5.0

---

## Commit Message Format

BoomOpen Workflow Kit uses **Conventional Commits** (`conventionalcommits` preset in [`.releaserc.json`](../../.releaserc.json)):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types and Release Impact

Configured in `.releaserc.json` via `@semantic-release/commit-analyzer` and `@semantic-release/release-notes-generator`:

| Type | Release Bump | Appears in `CHANGELOG.md` | Section |
|------|:------------:|:-------------------------:|---------|
| `feat` | **minor** | Yes | Features |
| `fix` | **patch** | Yes | Bug Fixes |
| `perf` | **patch** | Yes | Performance |
| `refactor` | **patch** | Yes | Refactoring |
| `docs` (`scope: README`) | **patch** | Yes | Documentation |
| `docs` (other scopes) | none | Yes | Documentation |
| `chore` | none | Hidden | — |
| `style` | none | Hidden | — |
| `test` | none | Hidden | — |
| `ci` / `build` | none | Hidden | — |

Any commit with `breaking: true` (via a `BREAKING CHANGE:` footer or `!` after `<type>`) triggers a **major** version bump.

### Commit Message Examples

```
feat(conduct): add 6-task parallel multi-engine council synthesis
fix(cli): preserve user TOML tables during codex config merge on Windows
perf(doctor): cache compact skill index lookup across platform checks
refactor(checker): extract comment/string stripper into checker-strip.js
docs(README): update installation instructions for v5.5.0
chore: sync third-party license notices
feat!: require disjoint OWNED_FILES in compiled wave ledgers
BREAKING CHANGE: plan compiler now rejects overlapping OWNED_FILES across parallel wave shards
```

### Observed Commit Scopes

| Scope | Used For |
|-------|----------|
| `cli` | `cli/install.js` and the `40` modular `cli/*.js` files |
| `conduct` / `cook` / `plan` / `design` / `research` / `ledger` | Deterministic compiler and conductor subsystems |
| `platforms` | `platforms/{antigravity,claude,codex,copilot,cursor}/` bundles and entrypoints |
| `agents` / `commands` / `rules` / `skills` | Instruction Markdown, teams, and skills vault updates |
| `README` / `i18n` / `docs` | Root `README.md` (patch-releasing), `i18n/README.*.md`, and `documents/` |
| `web` | `web/` React 19 + Vite 7 marketing application |
| `release` | Automated `chore(release): <version> [skip ci]` commits |

---

## Branch Strategy & Pull Request Gates

- **Release Branch**: `main` is the single release branch configured in `.releaserc.json` (`"branches": ["main"]`).
- **Pull Request Verification**: Every push to `main` and every pull request automatically runs the 4-job GitHub Actions workflow in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) (`concurrency` cancels superseded in-progress runs per ref, using least-privilege `contents: read` permissions).
- **Repository Metadata**: No static PR template Markdown file is checked into `.github/`; contributors follow Conventional Commits and must pass all 4 CI jobs cleanly before merge.

---

## Continuous Integration Pipeline (`.github/workflows/ci.yml`)

[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs automatically on `push` to `main`, `pull_request`, and manual `workflow_dispatch`:

| Job | Runner Matrix | Verification Steps Executed |
|-----|---------------|-----------------------------|
| **`cli`** | `ubuntu-latest`, `windows-latest`, `macos-latest` × Node `18`, `20`, `22` (`9` combinations) | 1. `npm test` (`30` `node:test` suites; zero `npm ci` needed because the CLI uses pure Node built-ins)<br>2. `npm run lint` ([`.github/scripts/check-syntax.js`](../../.github/scripts/check-syntax.js))<br>3. Sandboxed kit lifecycle health check (`install claude` -> `doctor` -> `uninstall claude` with `HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, and `XDG_CONFIG_HOME` redirected to `$RUNNER_TEMP`)<br>4. `node cli/install.js check . --strict-phase --no-stubs` |
| **`syntax`** | `ubuntu-latest` (Python `3.10` floor) | 1. Compiles every `.py` helper across `scripts/`, `skills/`, and `skills_library/` (`python -B` AST `compile()`, excluding `*/assets/template.py` placeholders)<br>2. Validates all `.sh` scripts via `bash -n`<br>3. Verifies `THIRD_PARTY_NOTICES.md` freshness via `node .github/scripts/third-party-notices.js --check` |
| **`web`** | `ubuntu-latest`, `windows-latest`, `macos-latest` × Node `20`, `22` (`6` combinations; Vite 7 requires Node `^20.19.0 \|\| >=22.12.0`) | Runs `npm ci`, `npm run lint` (ESLint 9), and `npm run build` (`kit-stats.mjs` + `tsc -b && vite build`) inside `web/` |
| **`package`** | `ubuntu-latest`, `windows-latest` × Node `22` | Runs `npm run test:pack` ([`.github/scripts/pack-smoke.js`](../../.github/scripts/pack-smoke.js)): packs the npm tarball without lifecycle scripts, extracts it in a temp folder, verifies all `1,462` indexed `SKILL.md` files shipped, and runs sandboxed `install claude` -> `doctor` -> `uninstall claude` |

---

## Guarded Semantic-Release Pipeline (`.github/workflows/release.yml`)

Releases are cut intentionally via the manual **`Release`** workflow ([`.github/workflows/release.yml`](../../.github/workflows/release.yml), `workflow_dispatch` on `main`, `dry_run` boolean defaulting to `true`) as documented in [`.github/RELEASING.md`](../../.github/RELEASING.md).

### Pre-Release Gate & Plugin Chain

Before invoking `npx semantic-release`, `.github/workflows/release.yml` runs `npm ci --ignore-scripts`, `npm test`, `npm run lint`, `node cli/install.js check . --strict-phase --no-stubs`, and `npm run test:pack` on `ubuntu-latest` (Node `22`). Then `semantic-release` executes the `.releaserc.json` plugin chain in order:

| Step | Plugin | Action |
|:----:|--------|--------|
| 0 | `@semantic-release/exec` | Runs `verifyConditionsCmd: node .github/scripts/release-guard.js` ([`.github/scripts/release-guard.js`](../../.github/scripts/release-guard.js)), aborting unless a `v<major>.x.y` git tag matching `package.json` major version (`v5.5.0` / `v5.x.y`) is reachable from `HEAD` so `semantic-release` can never reset versioning |
| 1 | `@semantic-release/commit-analyzer` | Computes `major`, `minor`, `patch`, or `no release` from commits since the last tag |
| 2 | `@semantic-release/release-notes-generator` | Generates structured release notes using the `conventionalcommits` preset |
| 3 | `@semantic-release/changelog` | Prepends generated notes to `CHANGELOG.md` |
| 4 | `@semantic-release/npm` | **`"npmPublish": false`** — updates `version` in `package.json` and `package-lock.json` only; **nothing is published to the npm registry** |
| 5 | `@semantic-release/git` | Commits `CHANGELOG.md`, `package.json`, and `package-lock.json` as `chore(release): ${nextRelease.version} [skip ci]` and creates git tag `v{version}` |
| 6 | `@semantic-release/github` | Publishes the GitHub Release and release notes on `Kennyboom/BoomOpen-Workflow-Kit-Pro` |

---

## Local Pre-Commit Discipline (Zero Local Git Hooks)

`package.json` intentionally installs **no local Git hook manager** and defines no `prepare` script, so `npm install` never writes to `.git/hooks` on Windows, macOS, or Linux. Before pushing a branch or opening a PR, run the local verification suite:

```bash
npm test
npm run lint
node cli/install.js doctor --source-only
node cli/install.js check . --strict-phase --no-stubs
```

---

## Git Ignore Patterns (`.gitignore`)

| Category | Excluded Patterns |
|----------|-------------------|
| Build & package outputs | `out`, `dist`, `*.vsix`, `.vscode-test` |
| Dependencies & caches | `node_modules`, `__pycache__/`, `*.py[cod]`, `coverage/`, `.nyc_output/` |
| OS & editor state | `.DS_Store`, `Thumbs.db`, `.idea/`, `*.swp`, `*.swo`, `.vscode`, `*.tmp`, `*.temp` |
| Secrets & registry auth | `.env`, `.env.*` (`!.env.example` kept), `.npmrc` (`!web/.npmrc` kept), `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.cert`, `*.secret` |
| Ephemeral reports & state | `reports/`, `.brain/`, `.boomopen.json`, `.boomopen/conductor/` |
| Local AI assistant dirs | `.cursor/`, `.claude/`, `.gemini/`, `.codex/`, `.copilot/`, `.antigravity/`, `.agent/` |

---

## Source-Only Distribution & Packaging Policy

- **Source-Only Installation**: `@boomopen/workflow-kit` (`v5.5.0`) is distributed exclusively from its GitHub repository (`npmPublish: false` in `.releaserc.json`). Install via:
  ```bash
  git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
  cd BoomOpen-Workflow-Kit-Pro
  node cli/install.js install <tool>
  ```
  (Or run `npm link` inside the checkout to expose the global `boomopen` binary.)
- **Anti-Typosquatting Hygiene**: Documentation must never advertise global npm registry install or runner one-liners for the unpublished `@boomopen/workflow-kit` package name.
- **Tarball Readiness**: Even with npm publishing disabled, `package.json` maintains a strict `files` allowlist (`cli/` minus tests/helpers, `agents/`, `commands/`, `rules/`, `matrix-skills/`, `skills/`, `skills_library/` minus demo/benchmark assets, `scripts/`, `documents/`, `i18n/`, `platforms/`, root entrypoints, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CHANGELOG.md`) verified on every CI run by `npm run test:pack`. `web/` is excluded from the tarball.

---

## Evidence Sources

| Source | Path |
|--------|------|
| CI workflow (4-job cross-OS matrix) | [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml) |
| Manual guarded Release workflow | [../../.github/workflows/release.yml](../../.github/workflows/release.yml) |
| Release policy & operator runbook | [../../.github/RELEASING.md](../../.github/RELEASING.md) |
| Major-tag release guard | [../../.github/scripts/release-guard.js](../../.github/scripts/release-guard.js) |
| Tarball smoke test | [../../.github/scripts/pack-smoke.js](../../.github/scripts/pack-smoke.js) |
| Semantic-release configuration | [../../.releaserc.json](../../.releaserc.json) |
| Package manifest & `files` allowlist | [../../package.json](../../package.json) |
| Git ignore rules | [../../.gitignore](../../.gitignore) |
| Changelog | [../../CHANGELOG.md](../../CHANGELOG.md) |
