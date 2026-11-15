---
description: "🏛️ Autopilot Init — Sharded Multi-Document Spec Ingestion, Reverse Coverage Audit, and Immutable .boomopen/project-ledger.json Initialization"
version: "5.5"
category: orchestration
execution-mode: execute
---

# /autopilot:init — Sharded Multi-Doc Spec Ingestion & Zero-Omission Ledger Lock (Phase 0)

> **MISSION**: Ingest all project specification documents (`PRD`, `SRS`, `Architecture`, `UI/UX`, `DB Schema`, `API Specs`) without "Lost in the Middle" omissions, lock `.boomopen/contracts/SHARED_CONTRACT.md`, compile a machine-validated `.boomopen/project-ledger.json` (`100%` Spec Coverage, `0%` Bundling), and present **1 cohesive Brain Artifact** (`<appDataDir>\brain\<conversation-id>\PLAN-{project}.md` or `REPORT-autopilot-{project}.md`, `<= 500` lines).

<docs_or_scope>$ARGUMENTS</docs_or_scope>

---

## ⚡ STEP 0: APPROVED-PLAN FAST-BOOTSTRAP GATE (`cook state` + `ledger from-plan`)

Before spawning `scouter#doc-1..N` to scan raw documentation from scratch, check `<appDataDir>\brain\<conversation-id>\` via:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"
```
- **IF AN APPROVED `PLAN-{project}.md` EXISTS** (and the user is not asking to ingest additional external PRD/SRS documents):
  1. Validate and compile `PLAN-{project}.md` directly into the ledger (`ledger from-plan` / `plan compile` / `plan validate --sync-ledger`):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<path/to/PLAN-{project}.md>" --sync-ledger
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger from-plan "<path/to/PLAN-{project}.md>"
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger validate --strict-shards
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
     ```
     *(Equivalent: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan compile "<path/to/PLAN-{project}.md>"`)*
  2. This deterministically compiles waves, `Task X.Y (REQ-xxx)` shards, `OWNED_FILES`, `READ_ONLY_FILES`, `Test Files`, `Verify` commands, and `SHARED_CONTRACT` into `.boomopen/project-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and `.boomopen/ROADMAP-PROGRESS.md` in `< 50ms` **without re-scouting specs from scratch**.
  3. Skip Steps 1–4 and jump directly to **COMPLETION & NEXT ACTION**.
- **IF NO `PLAN-{project}.md` EXISTS** (or raw multi-doc PRDs/specs must be ingested): Proceed to Step 1 immediately on Turn 1.

---

## ⚡ STEP 1: TURN-1 SHARDED MULTI-DOC INGESTION (`scouter#doc-1..N`)

> **Cognitive Load Sharding Law for Documentation (`≤ 2–3` doc files per sub-agent shard)**:
> Never feed 5–20 specification documents into a single agent's context window! Spawn parallel shards on Turn 1 via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` and record `role#shard -> conversationId` for Warm Session Reuse (`send_message`).

1. **Discover Specification Sources & Bootstrap Ledger Skeleton**:
   - Locate all specification files passed in `$ARGUMENTS` or inside `./docs/`, `./specs/`, `./documents/`, `PRD*.md`, `SRS*.md`, `ARCHITECTURE*.md`, `DESIGN*.md`, `schema*`, `openapi*`.
   - Seed SHA-256 spec hashes via `ledger init`:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger init --name "<ProjectName>" --docs "<doc1.md,doc2.md>"
     ```
2. **Parallel Sharded Extraction (`invoke_subagent` on Turn 1)**:
   - Partition discovered documents into disjoint shards of **`≤ 2–3` documents per shard** (`scouter#doc-1`, `scouter#doc-2`, ..., `scouter#doc-N`, `TypeName: "self"`, `Model: "inherit"`).
   - Each `scouter#doc-k` shard MUST read its assigned documents line-by-line (paying special attention to the middle `30%–70%` ranges of long specification documents, markdown tables, footnotes, and edge-case rules) and extract **100% Atomic Requirements (`REQ-101` .. `REQ-NNN`)**:
     - `req_id`: `"REQ-101"` (sequential unique ID)
     - `title`: Concise atomic requirement name
     - `source_doc`: Relative path and line range (`"docs/PRD.md#L142-L168"`)
     - `doc_slices`: Scoped slice array (`["docs/PRD.md#L142-L168"]`)
     - `verbatim_quote`: Key constraint or formula quoted verbatim from the spec
     - `acceptance_criteria`: Non-empty array of concrete, testable `Given/When/Then` assertions (`["AC1: ..."]`)
   - **🚫 ANTI-BUNDLING LAW (STRICT)**: Never merge multiple endpoints, tables, screens, or business rules into a single vague item. Decompose every distinct endpoint, state transition, validation rule, and UI state into its own atomic `REQ-xxx` and explicit `- [ ] [SC-xxx]` sub-clauses (`- **Source Doc**: \`docs/PRD.md#L142-L168\``) for Wave 2.5 `reconcile --strict` traceability.

---

## 🛡️ STEP 2: INDEPENDENT REVERSE SPEC COVERAGE GATE (`reviewer#spec-auditor`)

Before locking phases, spawn `reviewer#spec-auditor` (`TypeName: "self"`, `Model: "inherit"`) to run an **Adversarial Reverse Traceability Audit**:
1. Compare every section heading, markdown table row, API route, DB table/column, and UI screen in the original specification documents **backwards** against the extracted `REQ-101..NNN` list.
2. Explicitly verify the **middle `30%–70%` line ranges** of every multi-section specification document where LLM attention typically drops.
3. If **ANY** requirement, business rule, permission check, or edge case was omitted or bundled, output `[MISSING_REQUIREMENTS]` and append the missing atomic `REQ-xxx` entries until **100% Spec Coverage (`0%` Omission)** is achieved.

---

## 🔗 STEP 3: MULTI-PHASE TOPOLOGICAL DAG, `SHARED_CONTRACT` & BRAIN ARTIFACT

1. **Lock `.boomopen/contracts/SHARED_CONTRACT.md`**:
   - Define cross-phase domain entities, primary/foreign keys, DB table schemas, canonical API routes, request/response DTOs, error envelopes, and shared config constants.
2. **Organize `REQ-101..NNN` into Topological Phases (`phases[]` & `features[]`)**:
   - Group atomic requirements into dependency-ordered phases (`PHASE-1` Foundation/DB → `PHASE-2` Core Backend/Auth → `PHASE-3` Domain Modules → `PHASE-4` Frontend Screens → `PHASE-5` E2E Hardening, scaled `3–10` phases) with **`≤ 3–4` disjoint `owned_files` per `role_shard`**.
   - Every `features[]` item MUST define: `req_id`, `phase_id`, `title`, `role_shard` (e.g., `"backend-engineer#auth"`), `source_doc`, `doc_slices`, non-empty `acceptance_criteria[]`, disjoint `owned_files[]` (`1–4` files), non-empty `test_files[]`, `verification_cmd`, `passes: false`, and `status: "pending"`.
3. **Write 1 Cohesive Brain Artifact (`<= 500` lines — Never Split Into Folders)**:
   - Write `<appDataDir>\brain\<conversation-id>\PLAN-{project}.md` (`ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when pausing at an interactive approval gate; or `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md` with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }` when summarizing initialized ledger status).
   - *(Use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested.)*

---

## 🔒 STEP 4: VALIDATE `.boomopen/project-ledger.json` (`--strict-shards`)

1. **Populate `.boomopen/project-ledger.json`** matching `cli/ledger.js` (`schema_version`, `project_name`, `spec_documents` with `sha256` & `lines`, `active_cursor: { current_phase_id: "PHASE-1", baseline_passed_tests: 0 }`, `phases[]`, `features[]`).
2. **Run Deterministic CLI Shard & Schema Validation**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger validate --strict-shards
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status
   ```
   *(If `PLAN-{project}.md` was authored in Step 3, also validate via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"` — must exit `0` with `0` file-lock collisions and `0` spec drift!)*

---

## ✅ COMPLETION & NEXT ACTION

Present clickable links to `.boomopen/project-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and `<appDataDir>\brain\<conversation-id>\PLAN-{project}.md` (or `REPORT-autopilot-{project}.md`):
- **Total Spec Documents Hashed**: `{M}` | **Atomic Requirements Locked**: `{N}` (`100%` Spec Coverage) | **Topological Phases**: `{P}`
- **Next Step**: Click **"Proceed"** on `PLAN-{project}.md` or run **`/autopilot:run`** (*"continue project"* / *"tiếp tục dự án"*) to execute `PHASE-1`!
