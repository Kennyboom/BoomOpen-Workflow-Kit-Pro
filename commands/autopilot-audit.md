---
description: "🏛️ Autopilot Audit — End-to-End Requirement Traceability Matrix (RTM), Zero-Omission Spec Audit, and Anti-Regression Verification"
version: "5.5"
category: orchestration
execution-mode: execute
---

# /autopilot:audit — End-to-End Zero-Omission & Quality Audit

> **MISSION**: Perform a deterministic + adversarial end-to-end audit of `.boomopen/project-ledger.json` against the original specification documents, source code, and test suites to guarantee **0% Spec Omission, 0 Hollow Stubs, 0 Regressions, and 100% Requirement Traceability (`REQ-101..NNN`)**, producing **1 cohesive Brain Artifact** (`<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md`, `<= 500` lines).

<scope>$ARGUMENTS</scope>

---

## ⚡ STEP 1: DETERMINISTIC CLI LEDGER & STRICT-PHASE AUDIT (TURN 1)

Run all deterministic CLI ledger, shard, and anti-stub gates first:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger validate --strict-shards
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger audit
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_dir> --strict-phase --no-stubs
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
```
*(Or `boomopen ledger validate --strict-shards && boomopen ledger audit && boomopen check <project_dir> --strict-phase --no-stubs && boomopen ledger status`; pass `--json` to `ledger audit --json` or `ledger status --json` when scripting structured RTM summaries.)*

This deterministically verifies:
1. **Schema, Spec SHA-256 & DAG Integrity (`ledger validate --strict-shards`)**: Zero spec document drift, valid topological `phases[]` DAG, and zero intra-phase `owned_files` collisions (`≤ 4` files/shard).
2. **100% File & Test Existence (`ledger audit`)**: Every `owned_files` and `test_files` entry for every `REQ-xxx` exists and is non-empty on disk, and every requirement has `passes: true` + `status: "verified"`.
3. **Zero Hollow Code (`check --strict-phase --no-stubs`)**: `0` `TODO`/`FIXME`/`PLACEHOLDER`, `0` `NotImplementedError`/hollow stubs, `0` `.skip`/`.only`/vacuous test gaming, `0` explicit `any`, and `0` source files exceeding the `500`-line hard ceiling.
4. **Monotonic Test Ratchet**: Cumulative passing test floor (`active_cursor.baseline_passed_tests`) covers every completed phase and requirement.

---

## 💎 STEP 2: PARALLEL 3-VECTOR ADVERSARIAL AUDIT WAVE (`invoke_subagent`)

Launch **3 specialist audit shards concurrently in a single Turn-1 batch** via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` (recording `role#shard -> conversationId` for Warm Session Reuse via `send_message`):

| Audit Vector | Specialist Shard (`Model: "inherit"`) | Mission & Verification Scope |
|--------------|---------------------------------------|------------------------------|
| **Vector 1 — Requirement Traceability Matrix (RTM) & Reverse Spec Check** | `reviewer#rtm` | Compare `spec_documents` (`PRD`, `SRS`, `Architecture`, `Design` via `read_file`) backwards against `.boomopen/project-ledger.json` (`features[]`) and actual code in `owned_files`. Verify `100%` of `acceptance_criteria` and `verbatim_quote` rules are implemented without silent omissions. |
| **Vector 2 — Full Regression & Edge-Case Test Execution** | `tester#regression` | Execute the complete project test suite (`unit`, `integration`, `E2E`). Confirm every `REQ-xxx` has real behavioural assertions in `test_files` and `0` cross-phase regressions exist across `Phase 1..N`. |
| **Vector 3 — Cross-Phase Contract & Security Audit** | `security-engineer` (loads `security-auditor` skill) | Audit all endpoints, auth boundaries, data validation, and secrets handling against `.boomopen/contracts/SHARED_CONTRACT.md` and OWASP Top 10 / LLM Top 10. |

- **Optional Cross-Engine Council Augmentation**: When `engines.reviewer = "council"` in `/settings`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --prompt "Audit RTM & SHARED_CONTRACT compliance"` in parallel.
- **Read-Only Audit Lock**: During Step 2, lock `.boomopen/project-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and all `owned_files` / `test_files` in `READ_ONLY_FILES` so audit shards never mutate production code or test assertions while inspecting coverage.

---

## 📊 STEP 3: COHESIVE BRAIN AUDIT ARTIFACT (`REPORT-autopilot-{project}.md`)

Synthesize the deterministic CLI output and all 3 adversarial audit vectors into **1 single cohesive Brain Artifact** (`<= 500` lines — NEVER split into folders; use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested):
- **Path**: `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md`
- **`ArtifactMetadata`**: `{ Summary: "End-to-End Autopilot RTM, Strict-Phase & Security Audit Report", UserFacing: true, RequestFeedback: false }`

```markdown
# 🏛️ Project Autopilot Audit & Requirement Traceability Matrix (RTM): {project}

- **Verdict**: ✅ 100% VERIFIED | ⚠️ GAPS DETECTED
- **Requirements Verified**: `{verified}/{total}` (`{percent}%`) | **Phases Completed**: `{completed_phases}/{total_phases}`
- **CLI Gates (`ledger audit` + `check --strict-phase --no-stubs`)**: ✅ PASS (`0` stubs, `0` TODOs, `0` skipped tests, `0` `any`)
- **Cumulative Passing Tests**: `{total_passed_tests}` (`0` regressions)

## 📋 Requirement Traceability Matrix (`REQ-101` .. `REQ-NNN`)
| REQ ID | Phase | Source Doc & Lines | Implementation (`owned_files`) | Verification (`test_files`) | Status |
|:-------|:------|:-------------------|:-------------------------------|:----------------------------|:-------|
| `REQ-101` | `PHASE-1` | `docs/PRD.md#L20-L45` | `src/...` | `tests/...` | ✅ Verified |

## 🔍 Adversarial Audit Findings & Remediation Actions (If Any)
- {List any unverified `REQ-xxx`, missing edge cases, or contract/security findings with clickable `file:///` links}
```

---

## ⛔ REMEDIATION LOOP & NEXT ACTIONS

1. **In-Session Self-Healing (When Minor Stub/Test Violations Are Detected)**:
   - If `ledger audit`, `check --strict-phase --no-stubs`, or one of the 3 audit vectors flags isolated defects in `<= 2` shards and the user requested audit-and-fix:
     - Dispatch targeted fixes via `invoke_subagent(TypeName: "self", Model: "inherit")` (or warm `send_message` to active `role#shard` `conversationId`s) with prior phase tests locked in `READ_ONLY_FILES`.
     - Re-run tests, `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger verify --phase <id> --passed-tests <N>`, `ledger audit`, and `check <project_dir> --strict-phase --no-stubs` until `0` violations remain!
2. **Audit-Only Next Steps (When Reporting Status Only)**:
   - Present clickable `file:///` links to `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md` and `.boomopen/ROADMAP-PROGRESS.md`:
     1. 🚀 **`/autopilot:run`** (`commands/autopilot-run.md`) → Execute or remediate remaining unverified phase(s) automatically.
     2. 🔧 **`/fix:team`** (`commands/fix-team.md`) → Surgically resolve specific audit findings with the Elastic Golden Diamond team.
     3. 📝 **`/docs:audit`** (`commands/docs-audit.md`) → Synchronize repository documentation with verified implementation.
