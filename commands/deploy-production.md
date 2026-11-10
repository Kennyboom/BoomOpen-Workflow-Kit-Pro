---
description: "🚀 Deploy Production — Production release with parallel safety gates, human Go/No-Go checkpoint, and post-deploy verification"
version: "5.5"
category: operations
execution-mode: execute
---

# /deploy:production — Production Release with Safety Gates

> **MISSION**: Execute a zero-surprise production release gated by parallel readiness/security/test verification, deterministic `check --strict-phase --no-stubs`, an explicit human Go/No-Go checkpoint, progressive rollout, and live post-deploy verification.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 PARALLEL SAFETY GATES, GO/NO-GO & ARTIFACT CONTRACT

1. **Turn-1 0-Turn Parallel Sub-agent Dispatch**: Launch `devops-engineer#1..k`, `security-engineer`, and `tester` **concurrently on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` with the **5-Field Handoff Packet**. Record `role#shard -> conversationId` to reuse warm specialists across rollout and post-deploy verification via `send_message` (Tier 2 `EMBODY` from `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{role}.md` ONLY on logged system tool failure).
2. **Deterministic Pre-Deploy CLI Gate**: Mandatory zero-error gate before production sign-off:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   *(When `.boomopen/project-ledger.json` exists, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` to confirm 100% of release-scoped `REQ-xxx` are verified.)*
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Write `<appDataDir>\brain\<conversation-id>\REPORT-deploy-production.md` as **1 single cohesive file** (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) with stage-appropriate `ArtifactMetadata`:
   - **Phase 2 Human Go/No-Go Pause (before mutating production)**:
     `ArtifactMetadata: { "Summary": "Production pre-flight audit, migration check, and rollback plan awaiting Go/No-Go confirmation", "UserFacing": true, "RequestFeedback": true }`
   - **Phase 4 Final Post-Deploy Report**:
     `ArtifactMetadata: { "Summary": "Completed production release report with rollout telemetry and post-deploy health verification", "UserFacing": true, "RequestFeedback": false }`

---

## 📁 DAG STAGE & DELIVERABLE MATRIX

| Phase | Execution Mode | Active Specialists (`TypeName: "self"`, `Model: "inherit"`) | Gate / Output |
|-------|----------------|-------------------------------------------------------------|---------------|
| **Phase 1** | ⚡ Turn-1 Parallel Safety Gates | `devops-engineer#1..k` + `security-engineer` + `tester` | `check <dir> --strict-phase --no-stubs` + security/test pass |
| **Phase 2** | 🛑 Human Go/No-Go Gate | Orchestrator (`ask_question` + pre-flight artifact) | `REPORT-deploy-production.md` (`RequestFeedback: true`) |
| **Phase 3** | 🚀 Warm Session Rollout (`send_message`) | `devops-engineer#1` | Progressive/zero-downtime production release |
| **Phase 4** | ⚡ Parallel Post-Deploy Verification | `devops-engineer#1` + `tester` | `REPORT-deploy-production.md` (`RequestFeedback: false`) |

---

## 🌊 PHASE 1: PARALLEL PRE-PRODUCTION & SECURITY GATES (TURN 1)

Dispatch all 3 production safety tracks simultaneously on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")`:
1. **`devops-engineer#1..k` (`agents/devops-engineer.md`)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` and production build verification.
   - Validate production environment configuration, monitoring/alerting hooks, backward-compatible expand/contract database migrations (`skills_library/deployment-procedures/SKILL.md` & `skills/database-design/SKILL.md` — **STOP-AND-VERIFY** consent gate), and record the exact current live release SHA/version for instant rollback.
2. **`security-engineer` (`agents/security-engineer.md`)**:
   - Load `security-auditor` skill; verify zero critical/high dependency CVEs, production secret isolation, auth/RBAC/CORS/CSP headers, and rate-limiting protections.
3. **`tester` (`agents/tester.md`)**:
   - Run full unit, integration, and E2E regression suites against the release candidate SHA; confirm 0 failures and 0 skipped critical paths.

**Exit Gate**: All 3 tracks green (`0` critical findings, `check --strict-phase --no-stubs` exits `0`).

---

## 🛑 PHASE 2: HUMAN GO/NO-GO CONFIRMATION GATE

1. Write the pre-flight dossier + rollback command to `<appDataDir>\brain\<conversation-id>\REPORT-deploy-production.md` (`RequestFeedback: true`).
2. Unless the user already gave explicit production push confirmation for this exact release in the current turn, pause and confirm via `ask_question` (`Proceed with Production Release`, `Deploy to Preview First (/deploy:preview)`, or `Abort`).

---

## 🚀 PHASE 3: PRODUCTION ROLLOUT (WARM REUSE)

Upon confirmation, send `send_message` to warm `devops-engineer#1` to execute the production release:
- Run additive/zero-downtime migrations (if applicable) followed by progressive/atomic rollout (canary, blue-green, or rolling release).
- Capture release tag/SHA, deployment ID, rollout timestamps, and live production endpoints.

---

## 🧪 PHASE 4: PARALLEL POST-DEPLOY HEALTH & SMOKE VERIFICATION

Verify live production health concurrently via warm `send_message` (`devops-engineer#1` + `tester`):
- **`devops-engineer#1`**: Verify `/health` & `/ready` probes, error rate (`5xx`), p95 latency, and runtime log stream stability.
- **`tester`**: Execute non-destructive, read-safe production smoke checks across critical endpoints/journeys.
- Update `<appDataDir>\brain\<conversation-id>\REPORT-deploy-production.md` (`<= 500` lines) with live verification telemetry and `ArtifactMetadata: { Summary: "Completed production release report with rollout telemetry and post-deploy health verification", UserFacing: true, RequestFeedback: false }`.

---

## 🚨 ESCALATION & COMPLETION

| Condition | Immediate Action |
|-----------|------------------|
| Rollout error or failed migration | Halt rollout → route immediately to `/deploy:rollback` (`commands/deploy-rollback.md`) |
| Post-deploy `5xx` spike or failed smoke check | Route immediately to `/deploy:rollback` (`commands/deploy-rollback.md`) |
| Security anomaly detected | Engage `security-engineer` + trigger `/deploy:rollback` |

Present final release summary:
1. ✅ **Production Live** — Release SHA, URL, and verified health metrics
2. 💾 **Persist Release Milestone** → `/save` (`commands/save.md`)
3. ⏪ **Emergency Revert** → `/deploy:rollback` (`commands/deploy-rollback.md`) if delayed anomalies appear
