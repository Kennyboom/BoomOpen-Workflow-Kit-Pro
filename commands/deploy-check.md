---
description: "✅ Deploy Check — Parallel 4-track pre-deployment readiness verification across code quality, tests, security, and infrastructure"
version: "5.5"
category: operations
execution-mode: execute
---

# /deploy:check — Parallel Deployment Readiness Verification

> **MISSION**: Verify all code quality, test suite, security, and infrastructure prerequisites in parallel on Turn 1 before promoting a build to preview or production.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 PARALLEL FAN-OUT, CLI GATE & ARTIFACT CONTRACT

1. **Turn-1 0-Turn Concurrent Sub-agent Dispatch**: Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`, and do **NOT** run independent audit tracks sequentially. Launch all 4 verification specialists **concurrently in 1 Turn-1 tool batch** via `invoke_subagent(TypeName: "self", Model: "inherit")` (`reviewer`, `tester`, `security-engineer`, `devops-engineer#1..k`) with the **5-Field Handoff Packet** (`READ_ONLY_FILES: ["*"]`, zero source mutations). Record `role#shard -> conversationId` for warm follow-ups via `send_message` (Tier 2 `EMBODY` from `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{role}.md` ONLY on logged system tool failure).
2. **Deterministic Pre-Deploy Quality Gate**: Enforce zero stubs, strict phase hygiene, and Pragmatic 2-Tier coding limits prior to sign-off:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   *(When `.boomopen/project-ledger.json` is present, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` to confirm no unverified blocking `REQ-xxx` remain in scope.)*
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Consolidate all 4 audit tracks into **1 single cohesive file** `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Pre-deployment readiness audit across code quality, test suite, security scan, and infrastructure readiness",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 📁 DAG STAGE & DELIVERABLE MATRIX

| Wave | Execution Mode | Active Specialists (`TypeName: "self"`, `Model: "inherit"`) | Gate / Output |
|------|----------------|-------------------------------------------------------------|---------------|
| **Wave 1** | ⚡ Turn-1 4-Track Parallel Fan-Out | `reviewer` + `tester` + `security-engineer` + `devops-engineer#1..k` | `check <dir> --strict-phase --no-stubs` + build/test/CVE/infra telemetry |
| **Wave 2** | 🎯 Orchestrator Synthesis | Consolidate 4 tracks into Go / No-Go scorecard | `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines) |

---

## 🌊 WAVE 1: PARALLEL 4-TRACK READINESS AUDIT (TURN 1)

Dispatch all 4 read-only verification shards simultaneously via `invoke_subagent(TypeName: "self", Model: "inherit")`:

1. **Track A — Code Quality & Standards (`reviewer` — `agents/reviewer.md`)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` plus project typecheck and linter (`tsc --noEmit`, `eslint` / `biome` / `ruff` / `cargo check`).
   - Verify zero hollow TODO/stub implementations, zero leftover debug `console.log` in production code, and full contract alignment.
2. **Track B — Automated Test & Regression Suite (`tester` — `agents/tester.md`)**:
   - Execute unit, integration, and critical-path E2E tests.
   - Confirm 0 failing tests, 0 newly skipped regression tests, and clean exit codes.
3. **Track C — Security & Secrets Audit (`security-engineer` — `agents/security-engineer.md`)**:
   - Load `security-auditor` skill; scan dependency advisories (`npm audit` / `pip-audit` / `osv-scanner`), verify zero hardcoded credentials or `.env` leaks in Git history/tree, and check auth, CORS, CSP, and rate-limit guards.
   - Verify any pending SQL/storage migrations obey `accidental-data-loss-prevention` (expand/contract, zero unconfirmed destructive operations).
4. **Track D — Build, Config & Rollback Readiness (`devops-engineer#1..k` — `agents/devops-engineer.md`)**:
   - Execute production build dry-run and container/bundle validation.
   - Verify required environment variable keys/schemas, health-check endpoint wiring (`/health` or `/ready`), database migration dry-run, and a documented rollback target SHA/artifact.

---

## 📊 WAVE 2: SYNTHESIZE `REPORT-deploy-check.md` & COMPLETION

Write `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "Pre-deployment readiness audit across code quality, test suite, security scan, and infrastructure readiness", UserFacing: true, RequestFeedback: false }`) using this cohesive structure:

```markdown
# ✅ Deployment Readiness Report (`REPORT-deploy-check.md`)

- **Verdict**: `READY` | `BLOCKED`
- **Target Branch / Commit SHA**: `{branch} @ {sha}`
- **Autopilot Ledger Status**: `{verified}/{total} REQ verified` (or `N/A`)

## 1. 4-Track Gate Scorecard
| Gate | Specialist | Command / Verification | Status |
|------|------------|------------------------|--------|
| Code & Standards | `reviewer` | `check <dir> --strict-phase --no-stubs` + typecheck/lint | PASS / FAIL |
| Test Suite | `tester` | Unit + Integration + E2E smoke | PASS / FAIL |
| Security & Secrets | `security-engineer` | Dependency CVEs + secrets + migration guard | PASS / FAIL |
| Build & Infra | `devops-engineer#1` | Prod build dry-run + env schema + health endpoint | PASS / FAIL |

## 2. Blocking Issues & Exact Remediations
- `{file}:{line}` — `{root cause & required fix}` (or `None`)

## 3. Rollback & Release Prerequisites
- **Last-Known-Good Target**: `{previous_release_tag_or_sha}`
- **Database Migration Mode**: `None` | `Additive Expand/Contract` | `Requires Human Sign-off`
```

Present concise verdict and next actions:
1. ✅ **Ready for Preview** → `/deploy:preview` (`commands/deploy-preview.md`)
2. 🚀 **Ready for Production** → `/deploy:production` (`commands/deploy-production.md`)
3. 🔧 **Blocked — Fix Issues** → `/fix:hard` (`commands/fix-hard.md`)
