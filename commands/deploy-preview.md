---
description: "🔍 Deploy Preview — Staging/preview deployment with pre-deploy CLI gate, live URL delivery, and smoke verification"
version: "5.5"
category: operations
execution-mode: execute
---

# /deploy:preview — Preview & Staging Deployment

> **MISSION**: Gate code quality with `check --strict-phase --no-stubs`, deploy cleanly to the preview/staging environment, verify live health & smoke paths, and publish `REPORT-deploy-preview.md`.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 DISPATCH, PRE-DEPLOY GATE & ARTIFACT CONTRACT

1. **Turn-1 0-Turn Sub-agent Dispatch & Warm Reuse**: Launch `devops-engineer#1..k`, `tester`, and `security-engineer` (when unverified changes exist) **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` with the **5-Field Handoff Packet**. Record `role#shard -> conversationId` and reuse warm `devops-engineer#1` across pre-flight → staging rollout → health verification via `send_message` (Tier 2 `EMBODY` from `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{role}.md` ONLY on logged system tool failure).
2. **Deterministic Pre-Deploy Quality Gate**: Verify repository integrity before building or pushing preview artifacts:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   *(If `REPORT-deploy-check.md` already passed on the exact `HEAD` commit in `<appDataDir>\brain\<conversation-id>\`, fast-forward past redundant test/security re-scans and proceed straight to build & preview deploy.)*
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Write the staging deployment report as **1 single cohesive file** `<appDataDir>\brain\<conversation-id>\REPORT-deploy-preview.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Preview/staging deployment report with pre-flight check results, live preview URL, and smoke test verification",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 📁 DAG STAGE & DELIVERABLE MATRIX

| Phase | Execution Mode | Active Specialists (`TypeName: "self"`, `Model: "inherit"`) | Gate / Output |
|-------|----------------|-------------------------------------------------------------|---------------|
| **Phase 1** | ⚡ Turn-1 Parallel Pre-Flight | `devops-engineer#1` + `tester` + `security-engineer` | `check <dir> --strict-phase --no-stubs` + clean build |
| **Phase 2** | 🎯 Warm Session Rollout (`send_message`) | `devops-engineer#1` | Provisioned Preview URL & deployment ID |
| **Phase 3** | ⚡ Parallel Live Smoke Verification | `devops-engineer#1` + `tester` | `<appDataDir>\brain\<conversation-id>\REPORT-deploy-preview.md` (`<= 500` lines) |

---

## 🌊 PHASE 1: PARALLEL PRE-FLIGHT & BUILD GATE (TURN 1)

Launch concurrently on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")`:
- **`devops-engineer#1` (`agents/devops-engineer.md`)**:
  - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` and execute staging/preview build.
  - Verify staging environment variables, non-production credentials isolation, and staging migration safety (`accidental-data-loss-prevention`).
- **`tester` + `security-engineer` (`agents/tester.md`, `agents/security-engineer.md` — skipped if `REPORT-deploy-check.md` is green on `HEAD`)**:
  - Run fast test suite and verify zero exposed secrets or critical CVEs before pushing to a network-accessible preview URL.

**Exit Gate**: `check --strict-phase --no-stubs` exits `0`, build succeeds, tests pass, and zero secret leaks exist.

---

## 🚀 PHASE 2: STAGING / PREVIEW DEPLOYMENT (WARM REUSE)

Send `send_message` to warm `devops-engineer#1` to execute staging rollout:
- Apply additive staging database migrations (if applicable) and deploy preview build via the project's configured platform CLI/CI pipeline.
- Capture exact deployment ID, Git commit SHA, target environment name, and live **Preview URL**.

**Exit Gate**: Deployment command exits `0` and Preview URL is provisioned.

---

## 🧪 PHASE 3: PARALLEL LIVE HEALTH & SMOKE VERIFICATION

Verify the live preview deployment concurrently (`send_message` to warm `devops-engineer#1` + `tester`):
- **`devops-engineer#1`**: Probe HTTP status/health endpoints, TLS/headers, container/function startup logs, and p95 response latency.
- **`tester`**: Run automated smoke checks against core user/API routes on the live Preview URL.
- **Auto-Escalation**: If health probes crash or critical smoke routes fail, immediately capture logs and route to `/deploy:rollback` (`commands/deploy-rollback.md`) or `/debug:hard` (`commands/debug-hard.md`).

---

## 📊 COMPLETION & DELIVERABLE (`REPORT-deploy-preview.md`)

Write `<appDataDir>\brain\<conversation-id>\REPORT-deploy-preview.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "Preview/staging deployment report with pre-flight check results, live preview URL, and smoke test verification", UserFacing: true, RequestFeedback: false }`) structured with:
- **Preview Environment Summary**: Live Preview URL, deployment ID, branch/commit SHA, and timestamp
- **Pre-Flight & Build Evidence**: `check --strict-phase --no-stubs` exit status, build output, and staging migration status
- **Live Health & Smoke Matrix**: HTTP health probes, p95 latency, and critical user/API route verification results

Present concise next steps:
1. ✅ **Preview Verified** — Share clickable Preview URL and smoke test status
2. 🚀 **Promote to Production** → `/deploy:production` (`commands/deploy-production.md`)
3. ⏪ **Revert Preview** → `/deploy:rollback` (`commands/deploy-rollback.md`)
