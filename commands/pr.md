---
description: "🚀 Pull Request Gate & Creator — Pre-PR strict quality gate (boomopen check, reconcile & diff tests), branch/commit hygiene check, and structured gh pr create"
version: "5.5"
category: operations
execution-mode: execute
---

# /pr — Pre-PR Quality Gate, Spec Reconciliation & Structured `gh pr create`

> **MISSION**: Guarantee zero broken builds, zero unwired island shards, zero stubbed TODOs, and zero leaked secrets reach code review — running deterministic pre-PR gates (`boomopen check --strict-phase --no-stubs`, `boomopen reconcile --strict`, and diff-scoped tests) before crafting an evidence-backed Pull Request via `gh pr create`.

<arguments>$ARGUMENTS</arguments>

---

## 🧭 ROUTING & SAFETY BOUNDARIES

1. **Subcommand Auto-Routing (`/pr:review`)**:
   - If `<arguments>` starts with `review` or asks to review/audit an existing PR number/URL (e.g., `/pr review 142` or `/pr https://github.com/.../pull/142`), immediately load and execute **`commands/pr-review.md`** (`/pr:review`).
2. **Remote Push & Creation Consent**:
   - Pushing branches (`git push`) and opening Pull Requests (`gh pr create`) mutate shared remote state. Run all local Phase 1–2 gates autonomously first; if the user did not already explicitly instruct pushing/creating the PR in this turn (e.g., `--draft` / `"create the PR now"`), preview the PR title, base/head branches, and verification table via `ask_question` before executing `git push` + `gh pr create`.
3. **Cross-Platform Artifact Path**:
   - Draft the PR dossier at `<appDataDir>\brain\<conversation-id>\PR-SUMMARY-{branch}.md` on Antigravity (`ArtifactMetadata: { Summary: "Pre-PR verification gate dossier and PR body", UserFacing: true, RequestFeedback: false }`) or `./reports/pr/PR-SUMMARY-{branch}.md` on Claude Code, Codex, Cursor, and Copilot.

---

## 🔍 PHASE 1: BRANCH, DIFF & COMMIT HYGIENE AUDIT

Execute a single batched Git inspection command to ground the PR against the target base branch (`origin/main` or `origin/master`, overridable via `--base <branch>`):

```bash
git status -s
git branch --show-current
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
```

Verify all **4 Branch Hygiene Invariants** before running build gates:
1. **Protected Branch Guard**: Never open a PR directly from `main` or `master`. If changes sit on `main`, offer to create and switch to a clean `feat/<slug>`, `fix/<slug>`, or `chore/<slug>` branch first.
2. **Clean Working Tree & Zero Secret Leakage**: Flag uncommitted tracked modifications, untracked build junk (`dist/`, `.DS_Store`, `*.log`), `.env*` files, private keys, or hardcoded tokens in `git diff <base>...HEAD`.
3. **Conventional Commit Alignment**: Check whether commits in `<base>..HEAD` follow `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `chore:` conventions (especially when `semantic-release` is configured).
4. **GitHub CLI Readiness**: Check `gh auth status` so authentication issues surface cleanly upfront.

---

## 🛡️ PHASE 2: MANDATORY PRE-PR QUALITY & SPEC RECONCILIATION GATES

Every gate below **MUST exit `0`** before opening the PR. If any gate fails, **iteratively fix all reported errors** and re-verify until `100%` green:

```bash
# 1. Pragmatic 2-Tier Coding Standards & Anti-Stub / Anti-Skip Gate
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check . --strict-phase --no-stubs

# 2. Wave 2.5 Spec-to-Code & Cross-Shard Wiring Reconciliation (REC-G1..G4)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile . --strict
```
*(Pass `--plan "<plan-path>"` or `--ledger ".boomopen/project-ledger.json"` to `reconcile` whenever an active plan or Autopilot ledger exists in the session/workspace.)*

3. **Build, Typecheck, Lint & Diff-Impacted Test Execution**:
   - Run the project's native typecheck, linter, build, and automated test suite covering all modules touched in `git diff <base>...HEAD` (`npm run lint && npm test`, `pytest`, `cargo test`, `go test ./...`).
   - When UI/frontend files changed in `<base>...HEAD`, also run:
     ```bash
     python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <ui-dir>
     python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <ui-dir>
     ```

---

## 📝 PHASE 3: STRUCTURED PR BODY SYNTHESIS & `gh pr create`

Synthesize `PR-SUMMARY-{branch}.md` using this exact 4-section engineering template (zero generic filler; cite real changed modules and verbatim gate counts):

```markdown
## Summary & Motivation
- **Problem / Goal**: {Concise 1–3 bullet explanation of why this change exists and linked issue/REQ IDs}
- **Key Changes**: {High-signal summary of architectural/feature changes across `<base>...HEAD`}

## Contract & Architecture Changes
- **API / DTO / Schema (`SHARED_CONTRACT`)**: {New/updated routes, Zod/OpenAPI schemas, DB migrations, or `None (backward-compatible)`}
- **UI / Config / `.env.example`**: {New design tokens, screens, feature flags, or env keys}

## Verification Evidence
| Gate | Command Executed | Result |
|------|------------------|--------|
| **Pragmatic 2-Tier & Anti-Stub** | `boomopen check . --strict-phase --no-stubs` | ✅ PASS (`0` violations) |
| **Spec & Route Reconciliation** | `boomopen reconcile . --strict` | ✅ PASS (`REC-G1..G4` clean) |
| **Typecheck / Lint / Build** | `{exact command}` | ✅ PASS |
| **Automated Test Suite** | `{exact test command}` | ✅ PASS (`{N}` passed, `0` failed) |

## Risk Blast Radius & Rollback Plan
- **Downstream Callers Affected**: {Impacted modules/endpoints}
- **Migration / Rollback Plan**: `git revert <merge-sha>` {+ additive DB down-migration note if applicable}
```

Once remote push/PR creation is confirmed, push the branch and create the PR cleanly via body file (avoiding shell-escaping corruption):

```bash
git push -u origin HEAD
gh pr create --base <base-branch> --title "<type>(<scope>): <concise summary>" --body-file "<path-to-PR-SUMMARY.md>" [--draft]
```

---

## ⛔ CONSTRAINTS & FAILURE RECOVERY

| Condition / Failure Mode | Deterministic Recovery Action |
|--------------------------|-------------------------------|
| Current branch is `main` or `master` | STOP remote push → offer `git checkout -b feat/<slug>` before staging or pushing |
| `boomopen check` or `boomopen reconcile` exits non-zero | Fix all reported line-limit, `any`, stub, route-mismatch, or island-module violations and re-run until `0` errors |
| Diff contains `.env`, credentials, or debug `console.log` | Strip debug logs / untrack sensitive files (`git rm --cached`) and verify clean `git diff <base>...HEAD` |
| `gh` CLI is unauthenticated or remote has diverged | Report exact `gh auth login` or `git fetch origin && git rebase origin/<base>` guidance without destructive `--force` pushes |
| Inline `--body "..."` risks shell backtick truncation | Always write `PR-SUMMARY-{branch}.md` first and pass `--body-file` to `gh pr create` |

---

## ✅ COMPLETION

Return the live Pull Request URL, the Verification Evidence Table summary, and next-step shortcuts:
1. 🔍 **Adversarial Self-Review** → `/pr:review` (audit the live PR diff across security, logic, and regression lenses)
2. 🚀 **Preview Deployment** → `/deploy:preview`
3. 📦 **Prepare Semantic Release (post-merge)** → `/release`
