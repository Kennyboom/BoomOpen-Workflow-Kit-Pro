---
description: "✅ Deploy Check — Parallel 4-track pre-deployment readiness verification across code quality, tests, security, and infrastructure"
version: "5.5"
category: operations
execution-mode: execute
---

# /deploy:check — Parallel Deployment Readiness & 2-Layer Anti-Leakage Verification

> **MISSION**: Verify all code quality, test suite, 2-layer security/route-census, and infrastructure prerequisites in parallel on Turn 1 before promoting a build to preview or production.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 PARALLEL FAN-OUT, CLI GATE & ARTIFACT CONTRACT

1. **Turn-1 0-Turn Concurrent Sub-agent Dispatch**: Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`, and do **NOT** run independent audit tracks sequentially. Launch all 4 verification tracks **concurrently in 1 Turn-1 tool batch** via `invoke_subagent(TypeName: "self", Model: "inherit")` (`reviewer`, `tester`, `security-engineer#ep-1..k` (`<= 8–10` endpoints/shard), `devops-engineer#1..k`) with the **5-Field Handoff Packet** (`READ_ONLY_FILES: ["*"]`, zero source mutations). Record `role#shard -> conversationId` for warm follow-ups via `send_message` (Tier 2 `EMBODY` from `~/.{TOOL}/skills/boomopen-workflow-kit/agents/{role}.md` ONLY on logged system tool failure).
2. **Deterministic Pre-Deploy Quality & Security Gates**: Enforce zero hollow stubs, strict phase hygiene, Pragmatic 2-Tier coding limits, and M1–M6 anti-leakage + route census prior to sign-off:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <dir> --json --emit-routes --strict-leaks
   python ~/.{TOOL}/skills/api-patterns/scripts/api_validator.py <dir> --json
   python ~/.{TOOL}/skills/database-design/scripts/schema_validator.py <dir> --strict --json
   ```
   *(When `.boomopen/project-ledger.json` is present, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` to confirm no unverified blocking `REQ-NNN` remain in scope.)*
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Consolidate all 4 audit tracks into **1 single cohesive file** `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) using `write_file` with explicit `ArtifactMetadata`:
   ```json
   {
     "ArtifactMetadata": {
       "Summary": "Pre-deployment readiness audit across code quality, test suite, 2-layer security census, and infrastructure readiness",
       "UserFacing": true,
       "RequestFeedback": false
     }
   }
   ```

---

## 📁 DAG STAGE & DELIVERABLE MATRIX

| Wave | Execution Mode | Active Specialists (`TypeName: "self"`, `Model: "inherit"`) | Gate / Output |
|------|----------------|-------------------------------------------------------------|---------------|
| **Wave 1** | ⚡ Turn-1 4-Track Parallel Fan-Out | `reviewer` + `tester` + `security-engineer#ep-1..k` + `devops-engineer#1..k` | `check --strict-phase --no-stubs` + `security_scan.py --emit-routes` + build/test/CVE/infra telemetry |
| **Wave 2** | 🎯 Orchestrator Synthesis | Consolidate 4 tracks + 8-Column Endpoint Matrix into Go / No-Go scorecard | `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines) |

---

## 🌊 WAVE 1: PARALLEL 4-TRACK READINESS AUDIT (TURN 1)

Dispatch all 4 read-only verification tracks simultaneously via `invoke_subagent(TypeName: "self", Model: "inherit")`:

1. **Track A — Code Quality & Standards (`reviewer` — `agents/reviewer.md`)**:
   - Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` plus project typecheck and linter (`tsc --noEmit`, `eslint` / `biome` / `ruff` / `cargo check`).
   - Verify zero hollow stub implementations, zero leftover debug `console.log` in production code, and full contract alignment.
2. **Track B — Automated Test & Regression Suite (`tester` — `agents/tester.md`)**:
   - Execute unit, integration, and critical-path E2E tests (`python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <dir>`).
   - Confirm `0` failing tests, `0` newly skipped regression tests, and clean exit codes.
3. **Track C — 2-Layer Security, Anti-Leakage & Endpoint Census (`security-engineer#ep-1..k` — `agents/security-engineer.md`)**:
   - Load `~/.{TOOL}/skills/security-auditor/SKILL.md`; run `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <dir> --json --emit-routes --strict-leaks`, `api_validator.py <dir> --json`, `schema_validator.py <dir> --strict --json`, and dependency advisories (`npm audit` / `pip-audit` / `osv-scanner`).
   - Dynamically shard `security-engineer#ep-1..k` (`<= 8–10` endpoints/shard) to audit `100%` of extracted routes, `"use server"` actions, tRPC procedures, IPC commands, and MCP tools (`audited_entrypoints == extracted_entrypoints`) across all **4 Source-to-Sink Taint Checklists** (BOPLA Read Leak, BOLA/Mass-Assign/TOCTOU Write, Injection/Traversal/SSRF/Webhook HMAC, and LLM/RAG/MCP boundary).
   - Verify any pending SQL/storage migrations obey `~/.{TOOL}/skills/database-design/SKILL.md` & `~/.{TOOL}/skills_library/deployment-procedures/SKILL.md` (**MANDATORY STOP-AND-VERIFY** consent gate + `hooks/validate-tool-call.mjs`: additive expand/contract, zero unconfirmed destructive operations).
4. **Track D — Build, Config & Rollback Readiness (`devops-engineer#1..k` — `agents/devops-engineer.md`)**:
   - Execute production build dry-run and container/bundle validation (`0` `productionBrowserSourceMaps` or `NEXT_PUBLIC_`/`VITE_` secret exposures).
   - Verify required environment variable schemas, health-check endpoint wiring (`/health` or `/ready`), database migration dry-run, and a documented rollback target SHA/artifact.

---

## 📊 WAVE 2: SYNTHESIZE `REPORT-deploy-check.md` & COMPLETION

Write `<appDataDir>\brain\<conversation-id>\REPORT-deploy-check.md` (`<= 500` lines, `ArtifactMetadata: { Summary: "Pre-deployment readiness audit across code quality, test suite, 2-layer security census, and infrastructure readiness", UserFacing: true, RequestFeedback: false }`) using this cohesive structure:

```markdown
# ✅ Deployment Readiness Report (`REPORT-deploy-check.md`)

- **Verdict**: `READY` | `BLOCKED`
- **Target Branch / Commit SHA**: `{branch} @ {sha}`
- **Autopilot Ledger Status**: `{verified}/{total} REQ verified` (or `N/A`)
- **Security Route Census Parity**: `{audited_entrypoints}/{extracted_entrypoints} entrypoints verified`

## 1. 4-Track Gate Scorecard
| Gate | Specialist | Command / Verification | Status |
|------|------------|------------------------|--------|
| Code & Standards | `reviewer` | `check <dir> --strict-phase --no-stubs` + typecheck/lint | PASS / FAIL |
| Test Suite | `tester` | Unit + Integration + E2E smoke | PASS / FAIL |
| 2-Layer Security & Census | `security-engineer#ep-1..k` | `security_scan.py --emit-routes --strict-leaks` + CVEs + 4 Taint Checklists + migration guard | PASS / FAIL |
| Build & Infra | `devops-engineer#1` | Prod build dry-run + env schema + health endpoint | PASS / FAIL |

## 2. 8-Column Endpoint Security & Anti-Leakage Matrix (`audited_entrypoints == extracted_entrypoints`)
| ID (`EP-NNN`) | Entrypoint (`METHOD path/symbol`) | `file:line` | AuthN Guard | AuthZ / Tenant Scope (`BOLA`) | Input Schema | Response DTO / `BOPLA` Leak Check | Sink & Rate-Limit Verdict |
|---------------|-----------------------------------|-------------|-------------|-------------------------------|--------------|-----------------------------------|---------------------------|

## 3. Blocking Issues & Exact Remediations
- `{file}:{line}` — `{root cause & required fix}` (or `None`)

## 4. Rollback & Release Prerequisites
- **Last-Known-Good Target**: `{previous_release_tag_or_sha}`
- **Database Migration Mode**: `None` | `Additive Expand/Contract` | `Requires Human Sign-off`
```

Present concise verdict and next actions:
1. ✅ **Ready for Preview** → `/deploy:preview` (`commands/deploy-preview.md`)
2. 🚀 **Ready for Production** → `/deploy:production` (`commands/deploy-production.md`)
3. 🔧 **Blocked — Fix Issues** → `/fix:hard` (`commands/fix-hard.md`)
