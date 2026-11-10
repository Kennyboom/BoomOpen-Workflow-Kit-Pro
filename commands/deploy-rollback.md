---
description: "⏪ Deploy Rollback — Emergency revert to last-known-good release, restoration verification, and root-cause triage"
version: "5.5"
category: operations
execution-mode: execute
---

# /deploy:rollback — Emergency Deployment Rollback & Stabilization

> **MISSION**: Restore production/staging stability immediately by reverting to the last-known-good release, verifying live service recovery, and capturing preliminary root-cause analysis in `REPORT-deploy-rollback.md`.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 EMERGENCY DISPATCH, INTEGRITY CHECK & ARTIFACT CONTRACT

1. **Turn-1 0-Turn Sub-agent Dispatch (`Stabilize First, RCA Second`)**: Launch `devops-engineer#1..k` **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` with the **5-Field Handoff Packet** (plus `security-engineer` in parallel if a security incident or credential leak triggered the rollback). Record `role#shard -> conversationId` for warm `send_message` reuse across rollback and verification, then dispatch `tester` + `debugger` in parallel once rollback executes (Tier 2 `EMBODY` from `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{role}.md` ONLY on logged system tool failure).
2. **Data-Loss Guardrail & Deterministic CLI Gate**:
   - Enforce `skills_library/deployment-procedures/SKILL.md` (**MANDATORY STOP-AND-VERIFY** consent gate + `hooks/validate-tool-call.mjs`): NEVER run destructive database `DROP`/`TRUNCATE` down-migrations without explicit user confirmation via `ask_question`; prefer traffic/artifact rollback over backward-compatible schemas.
   - Whenever rolling forward a local Git revert commit, gate repository integrity with:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
     ```
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Write the complete rollback & incident report as **1 single cohesive file** `<appDataDir>\brain\<conversation-id>\REPORT-deploy-rollback.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Emergency deployment rollback report with target SHA restoration, live smoke verification, and root-cause triage",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 📁 DAG STAGE & DELIVERABLE MATRIX

| Phase | Execution Mode | Active Specialists (`TypeName: "self"`, `Model: "inherit"`) | Gate / Output |
|-------|----------------|-------------------------------------------------------------|---------------|
| **Phase 1** | ⚡ Turn-1 Forensic Snapshot & Target Lock | `devops-engineer#1` (+ `security-engineer` if breach) | Broken SHA logs captured + last-known-good SHA locked |
| **Phase 2** | ⏪ Warm Session Revert (`send_message`) | `devops-engineer#1` | Traffic/release reverted (`check --strict-phase --no-stubs` on revert commits) |
| **Phase 3** | ⚡ Parallel Verification & Incident RCA | `devops-engineer#1` + `tester` + `debugger` | `<appDataDir>\brain\<conversation-id>\REPORT-deploy-rollback.md` (`<= 500` lines) |

---

## 🌊 PHASE 1: RAPID ASSESSMENT & TARGET LOCK (TURN 1)

`devops-engineer#1` (`TypeName: "self"`, `Model: "inherit"`):
- Snapshot failing deployment ID, broken commit SHA, error logs/metrics, and active environment state before reverting so forensic evidence is preserved.
- Identify the exact last-known-good deployment artifact/tag/SHA and verify schema compatibility with the currently running database.

**Exit Gate**: Failing telemetry captured and last-known-good rollback target locked.

---

## ⏪ PHASE 2: EXECUTE ROLLBACK (WARM REUSE)

Send `send_message` to warm `devops-engineer#1` to execute the revert procedure:
- Switch traffic / redeploy pinned artifact / revert release pointer to the last-known-good version (if building a Git revert commit, pass `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` first).
- If security-triggered, warm `security-engineer` rotates/revokes compromised keys or blocks offending endpoints concurrently.

**Exit Gate**: Previous stable version active and serving traffic.

---

## 🧪 PHASE 3: PARALLEL RECOVERY VERIFICATION & ROOT-CAUSE TRIAGE

Run concurrently via warm `send_message` and `invoke_subagent(TypeName: "self", Model: "inherit")`:
1. **Service Recovery (`devops-engineer#1` + `tester`)**:
   - Verify HTTP health/readiness endpoints, `5xx` error-rate drop, latency normalization, and core smoke journeys on the restored version.
2. **Preliminary Root-Cause Analysis (`debugger` — `agents/debugger.md`)**:
   - Diff the rolled-back SHA against the restored SHA, correlate captured error logs/stack traces, identify the root-cause hypothesis, and list concrete regression tests needed before re-attempting release.

---

## 📊 COMPLETION & DELIVERABLE (`REPORT-deploy-rollback.md`)

Write `<appDataDir>\brain\<conversation-id>\REPORT-deploy-rollback.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "Emergency deployment rollback report with target SHA restoration, live smoke verification, and root-cause triage", UserFacing: true, RequestFeedback: false }`) structured with:
- **Incident & Rollback Summary**: Rolled-back SHA/version → restored SHA/version, timestamps, and time-to-recovery
- **Service Restoration Evidence**: Post-rollback `/health` status, `5xx` error-rate recovery, and smoke test results
- **Preliminary Root-Cause & Prevention Plan**: `debugger` diff analysis, failing stack trace/config delta, and required regression tests before re-shipping

Present concise next steps:
1. ✅ **Rolled Back & Healthy** — Service restored to stable version
2. 🐛 **Investigate & Fix Root Cause** → `/debug:hard` (`commands/debug-hard.md`) or `/fix:hard` (`commands/fix-hard.md`)
3. 💾 **Save Post-Mortem Context** → `/save` (`commands/save.md`)
