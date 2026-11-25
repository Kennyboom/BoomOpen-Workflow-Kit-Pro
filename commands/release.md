---
description: "📦 Semantic Release Preparation — Conventional commit audit since last tag, CHANGELOG.md synthesis, version/stats/doc parity gates (doctor, check, test, test:pack) & gh release create checklist"
version: "5.5"
category: operations
execution-mode: execute
---

# /release — Semantic Release Preparation, Parity Audit & `gh release create`

> **MISSION**: Prepare a zero-defect semantic release (`MAJOR.MINOR.PATCH`) by auditing Conventional Commits since the last Git tag, synchronizing version & documentation parity, synthesizing `CHANGELOG.md`, running the full deterministic release gate suite (`doctor`, `check`, `lint`, `test`, `test:pack`), and staging a human-confirmed `git tag` + `gh release create` checklist.

<release_args>$ARGUMENTS</release_args>

---

## ⚡ RELEASE SAFETY INVARIANTS & ARTIFACT ROUTING

1. **Never Push Tags or Publish Without Explicit Human Go/No-Go**:
   - Local commit audits, `CHANGELOG.md` drafting, version parity sync, and full verification gates run autonomously.
   - Creating/pushing Git tags (`git tag`, `git push --tags`), publishing packages (`npm publish`), or running `gh release create` **MUST pause for explicit user confirmation** (`ask_question`) unless explicitly pre-authorized in the current turn!
2. **Cohesive Release Dossier**:
   - Write `<appDataDir>\brain\<conversation-id>\RELEASE-v{version}.md` on Antigravity (`ArtifactMetadata: { Summary: "Release v{version} readiness dossier, changelog preview, and Go/No-Go checklist", UserFacing: true, RequestFeedback: true }`) or `./reports/release/RELEASE-v{version}.md` on Claude Code, Codex, Cursor, and Copilot.

---

## 🔍 PHASE 1: GIT TAG HISTORY & CONVENTIONAL COMMIT AUDIT (TURN 1)

Inspect repository cleanliness, active branch, latest SemVer tag, and commit log since that tag:

```bash
git status -s
git branch --show-current
git describe --tags --abbrev=0
git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --pretty=format:"%h %s"
```

Compute the deterministic **SemVer Bump** (unless `$ARGUMENTS` explicitly pins a target version such as `v5.6.0` or `--patch`/`--minor`/`--major`):
- **`MAJOR` (`X+1.0.0`)**: Any commit with `BREAKING CHANGE:` footer or `<type>!:` bang header.
- **`MINOR` (`X.Y+1.0`)**: One or more `feat:` / `feat(<scope>):` commits with `0` breaking changes.
- **`PATCH` (`X.Y.Z+1`)**: Only `fix:`, `perf:`, `security:`, `refactor:`, or `docs:` commits.
- *(Note: If the repository uses automated CI `semantic-release` in `.github/workflows/`, verify whether `package.json` `"version"` is managed by CI or bumped in-branch so local commits never conflict with the CI release bot!)*

---

## 📝 PHASE 2: VERSION, STATS & `CHANGELOG.md` PARITY SYNC

1. **Manifest & Documentation Parity Check**:
   - Verify version strings and inventory counts stay 100% aligned across project manifests (`package.json`, `package-lock.json`, `pyproject.toml`, `Cargo.toml`, `SKILL.md`, `README.md`, and any version constants such as `cli/doctor-version.js`).
   - When `.boomopen/project-ledger.json` exists, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` to confirm `0` release-scoped requirements remain unverified.
2. **`CHANGELOG.md` Synthesis**:
   - Prepend (or update) the `[v{version}] - {YYYY-MM-DD}` section in `CHANGELOG.md` grouped cleanly into **`Breaking Changes`**, **`Added` (`feat`)**, **`Fixed` (`fix`)**, **`Performance & Security` (`perf`/`sec`)**, and **`Documentation & Tooling`**, citing real commit SHAs/PR numbers and omitting noisy merge/WIP commits.

---

## 🛡️ PHASE 3: MANDATORY DETERMINISTIC RELEASE GATE SUITE

Run every applicable release gate end-to-end and **fix any reported failure iteratively** until all gates exit `0`:

```bash
# 1. BoomOpen Kit Doctor & Pragmatic 2-Tier / Anti-Stub Gate
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js doctor
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check . --strict-phase --no-stubs

# 2. Syntax / Lint / Typecheck & Full Automated Test Suite
npm run lint && npm test

# 3. Package Tarball / Build Smoke Verification (when test:pack or pack applies)
npm run test:pack
```
*(Adapt step 2–3 to the project's native toolchain — e.g., `pnpm build && pnpm test && npm pack --dry-run`, `pytest && python -m build`, or `cargo test && cargo package --list` — and inspect the packed file list to ensure zero leaked secrets, `.env` files, or test fixtures ship in the artifact!)*

---

## 🧭 SEMVER & PARITY VERIFICATION MATRIX

| Check Area | What `/release` Audits Before Tagging | Failure Action |
|------------|---------------------------------------|----------------|
| **Working Tree & Branch** | `git status -s` clean, release branch (`main` / `release/*`) synced with `origin` | Commit/stash stray edits or fast-forward from `origin` before bumping |
| **Version & Stats Parity** | `package.json`, lockfile, `SKILL.md`, `README.md`, `i18n/README.*.md`, and CLI version constants | Synchronize mismatched version numbers or stale command/agent/skill counts |
| **Kit & Code Hygiene** | `boomopen doctor` + `boomopen check . --strict-phase --no-stubs` | Fix Markdown line-limit overflows, mojibake, stubs, or `any` types until exit `0` |
| **Test & Tarball Integrity** | Full test suite (`npm test`) + package smoke check (`npm run test:pack` / `npm pack --dry-run`) | Block tag creation if any test fails or if `.env` / test fixtures leak into tarball |
| **CI Release Bot Alignment** | `.github/workflows/release*.yml` / `.releaserc*` (`semantic-release` vs manual tag workflow) | Match the repo's release mechanism so manual tags never collide with CI automation |

### ⛔ Release Anti-Patterns (Zero Tolerance)
- ❌ **Blind Tagging**: Creating `git tag vX.Y.Z` before `doctor`, `check`, `lint`, `test`, and `test:pack` all exit `0`.
- ❌ **Raw Commit Dump Changelog**: Pasting uncurated `git log` noise (merge commits, typo fixes) instead of structured user-facing release notes.
- ❌ **Unconfirmed Remote Push / Publish**: Running `git push --tags`, `gh release create`, or `npm publish` without passing the Phase 4 `ask_question` Go/No-Go gate.

---

## 🌐 MULTILINGUAL INTENT TRIGGERS (WHEN NL ROUTING IS ENABLED)

| Language | Representative Release Prep Intents |
|----------|-------------------------------------|
| **`en` / `vi`** | *"prepare semantic release"*, *"generate changelog and verify release gates"* / *"chuẩn bị bản release mới"*, *"tổng hợp changelog và kiểm tra trước khi tag"* |
| **`zh` / `ja` / `ko`** | *"准备语义化版本发布并生成 CHANGELOG"* / *"次期リリースのCHANGELOG作成と品質ゲート検証をして"* / *"시맨틱 릴리스 준비 및 체인지로그 작성해줘"* |
| **`es` / `fr` / `de`** | *"preparar nueva versión y changelog"* / *"préparer la release sémantique et vérifier les gates"* / *"neues Release samt Changelog vorbereiten"* |

---

## 🛑 PHASE 4: RELEASE DOSSIER & HUMAN GO/NO-GO CHECKLIST (`gh release create`)

Write `RELEASE-v{version}.md` containing:
1. **Release Metadata**: Previous tag → Target tag `v{version}`, branch, commit count, and SemVer rationale.
2. **Release Gate Evidence Table**: Exact exit status and counts for `doctor`, `check --strict-phase --no-stubs`, `lint`/`typecheck`, `test`, and `test:pack` / build artifact inspection.
3. **Generated Release Notes Preview**: Exact Markdown body prepared for `CHANGELOG.md` and GitHub Releases.
4. **Tag & Publish Execution Checklist**:
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "chore(release): prepare v<version>"
   git tag -a v<version> -m "Release v<version>"
   git push origin main --follow-tags
   gh release create v<version> --title "v<version>" --notes-file "<release-notes-file>"
   ```

Pause via `ask_question` with `(Recommended) Commit release prep & create annotated tag v{version} locally`, `Push tag & publish GitHub Release via gh release create`, or `Hold — review CHANGELOG.md first`.
