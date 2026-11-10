# Releasing BoomOpen Workflow Kit

## Current policy

- **The kit is distributed from source only.** Users install with
  `git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git && cd BoomOpen-Workflow-Kit-Pro && node cli/install.js install <tool>`
  (or `npm link` and then `boomopen install <tool>`).
- **npm publishing is disabled** (`"npmPublish": false` for `@semantic-release/npm` in `.releaserc.json`).
  `@boomopen/workflow-kit` is not on the registry. Do not run `npm publish` by hand.
  Turning publishing on is a maintainer decision; when it is made, also reserve the
  package name and update the install instructions in README, i18n, web and CLI help.
- The single source of truth for the version is `package.json` `"version"`.

## Before the first automated release

semantic-release ignores `package.json` and starts at `1.0.0` when no release tag is
reachable from `main`. The repository already shipped 5.x by hand, so tag the current
release once before running the workflow:

```bash
git tag v5.5.0 <commit-of-the-5.5.0-release>
git push origin v5.5.0
```

`.github/scripts/release-guard.js` (run as semantic-release `verifyConditions` through
`@semantic-release/exec`) aborts the release while no `v<major>.x.y` tag matching the
current `package.json` major version is reachable from `HEAD`.

## Cutting a release

1. Make sure CI (`.github/workflows/ci.yml`) is green on `main`.
2. Run the **Release** workflow (`.github/workflows/release.yml`) manually with
   `dry_run: true` and check the computed version and notes.
3. Run it again with `dry_run: false`. semantic-release then:
   - updates `CHANGELOG.md`, `package.json` and `package-lock.json`,
   - commits them as `chore(release): <version> [skip ci]`,
   - tags `v<version>` and creates the GitHub release.

semantic-release prepends its generated notes at the top of `CHANGELOG.md`. After a
release, fold any hand-written `## [Unreleased]` entries into that version's section.

If branch protection blocks the release commit, either allow the GitHub Actions bot to
push to `main` or cut the release locally with `npx semantic-release --no-ci` from a
clean checkout of `main`.

## Checking the package contents

Even while npm publishing is off, keep the tarball healthy:

```bash
npm run test:pack   # npm pack (no scripts), extract, doctor + install/uninstall claude in a sandboxed HOME
```

The `files` allowlist in `package.json` ships `skills_library/` and `scripts/` and leaves
out tests, Python caches and the demo media / benchmark data of a few library skills.
