---
description: >-
  Ruthless Inspector v2 — Deep logic audit of documentation BEFORE code.
  10 Audit Dimensions, Crash Testing, Data Flow Tracing,
  Cross-module Dependency Verification, and Scoring Matrix.
  Finds LOGIC holes, not just TEXT holes.
category: audit
execution-mode: execute
version: "5.5"
---

# /deep-audit — The Ruthless Inspector v2.0 (v5.5 Parallel Shards)

> **MISSION**: Expose broken logic, mismatched boundary formats, race conditions, crash-recovery gaps, and architectural contradictions across specs/plans/designs **before** code breaks in production — synthesizing **1 cohesive `<appDataDir>\brain\<conversation-id>\REVIEW-audit-{topic}.md`** (`≤ 500` lines).

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX PARALLEL DISPATCH, TOOLS & ARTIFACT CONTRACT

1. **Valid Antigravity 2.0 Toolset Only**: Use native `read_file`, `run_command`, `search_web`, `write_file`, `edit_file`, `invoke_subagent`, `send_message`, and `ask_question` (never legacy tool names).
2. **Elastic Parallel Audit Shards (`> 2` Files)**:
   - If auditing `≤ 2` known files, execute Mode A directly via `read_file`.
   - If auditing `> 2` files/modules, **never crawl files sequentially in the primary agent**! Immediately spawn parallel critic shards (`reviewer#audit-1..k`) on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")`, assigning **at most `≤ 3–4` heavy files/modules per shard** and recording `role#shard -> conversationId` for Warm Session Reuse (`send_message`).
3. **🛡️ `READ_ONLY_FILES` Audit Lock**: Lock **100% of audited documentation and repository source files** in `READ_ONLY_FILES` during Phases 0–3. Parallel shards return structured findings via `send_message` or disjoint scratch files (`REVIEW-audit-{topic}-s{1..k}.md`, `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`).
4. **Cohesive Single-File Deliverable**: Write `<appDataDir>\brain\<conversation-id>\REVIEW-audit-{topic}.md` (`≤ 500` lines, zero `{name}/` folder splits) with explicit `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`.

---

## 🧱 12 IRON RULES

1. **CHECK LOGIC, NOT PROSE** — Readable text with broken state transitions is a `P0` ticking time bomb.
2. **TRACE DATA END-TO-END** — Payload types, units, and encodings at every boundary must match byte-for-byte.
3. **CHALLENGE EVERY "WORKS FINE"** — Demand concrete invariants, timeouts, and failure paths.
4. **TIMING IS THE ENEMY** — Any 2 parallel/async processes have skew/delta; verify ordering, idempotency, and locks.
5. **CRASH TEST EVERYTHING** — Trace `kill -9` / power loss mid-flight: detect → recover → user-visible state.
6. **EXACT FORMAT MATCH** — `float32 mono ≠ int16 stereo`; `ISO-8601 UTC ≠ Unix ms`; `camelCase ≠ snake_case`.
7. **CONCRETE RESOURCE BUDGETS** — Demand exact RAM/VRAM/CPU/Disk/QPS numbers, never vague "fast enough".
8. **PINNED & COMPATIBLE DEPENDENCIES** — Verify version compatibility across runtime, ORM, SDKs, and OS.
9. **CROSS-FILE NAMING CONSISTENCY** — Entity, DTO, env var, and error code names must match across every doc.
10. **CLOSED-LOOP ERROR RECOVERY** — Every error needs detection, state rollback/retry, and deterministic UI state.
11. **CENSUS FIRST, AUDIT SECOND** — Complete 100% file/module scope census before scoring.
12. **FULL `read_file` COVERAGE** — Every shard must read its assigned files completely via `read_file` (never skim first 50 lines or assume contents).

---

## 🔍 Phase 0: Scope Census & Deterministic CLI Pre-Scan (Turn 1)

1. **Scope Census & Shard Partitioning**:
   - Enumerate all target docs/specs/plans/designs (`docs/`, `documents/`, `plans/`, `<appDataDir>\brain\<conversation-id>\`) via `run_command` or a fast census scan, grouping tightly coupled files into disjoint `≤ 3–4` file shards (`reviewer#audit-1..k`).
   - Persist multi-wave census state (when auditing massive doc sets `> 24` files) in `<appDataDir>\brain\<conversation-id>\scratch\audit-progress-{topic}.json` (`totalFiles`, `checkedFiles`, `remainingFiles`, `shards`).
2. **Deterministic CLI Validators & Security Pre-Scan (Run in Parallel on Turn 1)**:
   ```bash
   # Validate any PLAN-*.md or DESIGN-*.md in scope
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<design-path>"

   # Scan repository code/configs & security posture when code exists alongside docs
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <dir>
   ```

---

## 🌊 Phase 1: Elastic Parallel Shard Scan & Cross-Module Boundary Graph

Dispatch `reviewer#audit-1..k` (`TypeName: "self"`, `Model: "inherit"`) concurrently with the 5-Field Handoff Packet (`READ_ONLY_FILES` locked):
- **Complete File Reading**: Each shard reads 100% of its `≤ 3–4` assigned files via `read_file` (using `StartLine`/`EndLine` pagination if `> 800` lines) and logs exact line counts read (`✅ {file} — {N} lines read`).
- **Cross-Reference & Boundary Graph**: Extract every exported/referenced schema, API endpoint, IPC channel, event payload, and state machine so the orchestrator can verify cross-shard boundaries:

| Concept / Contract | Defined In (`file:line`) | Referenced By (`file:line`) | Format / Protocol / Size | Match? |
|--------------------|--------------------------|-----------------------------|--------------------------|:------:|
| `{DTO / Table / Event}` | `{docA.md:L42}` | `{docB.md:L118}` | `{JSON / SQL / IPC + exact fields}` | ✅ / ❌ |

---

## 📐 Phase 2: The 10 Mandatory Audit Dimensions

Evaluate **all 10 dimensions** across shard findings (using warm `send_message` to cross-verify inter-module disputes):

| DIM | Dimension | Mandatory Logic Verification |
|:---:|-----------|------------------------------|
| **1** | 📡 **Data Flow** | End-to-end input → transform → storage → output type/nullability/encoding match at every hop |
| **2** | ⏱️ **Timing & Concurrency** | Async races, parallel delta (`> 16ms` UI frame / DB write skew), idempotency keys, lock ordering |
| **3** | 💥 **Crash Recovery** | `kill -9` / network drop mid-transaction: orphan cleanup, retry backoff, dead-letter queue, UI state |
| **4** | 🔗 **Cross-Module Contracts** | Module A output vs. Module B input (`SHARED_CONTRACT`, pagination envelope, error codes) |
| **5** | 🧮 **Resource Budgets** | Concrete memory, VRAM, CPU, connection pool, payload size, and rate-limit math under peak load |
| **6** | 📐 **Naming Consistency** | Zero drift across table columns, TypeScript DTOs, route params, env vars, and ADR terminology |
| **7** | 🔒 **Security & Isolation** | AuthN/AuthZ on every route/IPC, randomized SHM/ports, secret storage, SSRF/injection/prompt guards |
| **8** | 📊 **Test Coverage Ratios** | `features_without_tests == 0` AND `edge_case_tests / happy_path_tests >= 1.0` |
| **9** | 📝 **Spec Completeness** | Verbatim user stories, `Given/When/Then` ACs, 5-state UI (loading/empty/error/offline/populated) |
| **10** | 🧩 **Architecture Parity** | C4 diagrams == API/IPC schemas == DB indexes/migrations == ADR decisions |

---

## 📊 Phase 3: Cohesive Brain Artifact Synthesis (`REVIEW-audit-{topic}.md`)

Verify `checkedFiles == totalFiles` (`100%` scope read), prune unverified speculation, and write **1 cohesive file** to `<appDataDir>\brain\<conversation-id>\REVIEW-audit-{topic}.md` (`≤ 500` lines) with:
```json
ArtifactMetadata: { "Summary": "10-Dimension Deep Logic Audit & Boundary Verification Report", "UserFacing": true, "RequestFeedback": false }
```

### Required Sections in `REVIEW-audit-{topic}.md`:
1. **Executive Verdict & Scope Census**: Files/lines audited (`X/X`), CLI validator & `security_scan.py` status, overall score (`XX/100`), verdict (`READY_FOR_CODE` | `FIX_REQUIRED` | `ARCHITECTURE_BLOCKER`).
2. **10-Dimension Scoring Matrix**:
   | DIM | Dimension | Score (`0–10`) | Critical (`🔴`) | Warning (`🟡`) | Suggestion (`🟢`) | Key Evidence (`file:line`) |
   |:---:|-----------|:--------------:|:---------------:|:--------------:|:-----------------:|----------------------------|
   *(Sum `TOTAL: XX/100` across DIM 1–10.)*
3. **Proof-Backed Findings & Remediation Blueprints** (sorted `🔴 CRITICAL` → `🟡 WARNING` → `🟢 SUGGESTION`):
   - Clickable `[file:line](file:///...)` references, exact failure/race/crash scenario trace, and concrete contract/doc patch for every `🔴` and `🟡` finding.
4. **End-to-End Boundary & Resource Verification Summary**: Verified data-flow mismatches, timing hazards, and peak resource math.

---

## 🔧 Phase 4: Optional Sharded Remediation & Re-Verification

Present `[REVIEW-audit-{topic}.md](file:///...)` to the user and offer next actions (`ask_question` if selective remediation is needed):
1. **Remediate Findings**: Dispatch parallel fix shards (`TypeName: "self"`, `Model: "inherit"`) with disjoint `OWNED_FILES` (`≤ 3–4` files/shard) + `SHARED_CONTRACT`, then re-run `plan validate` / `design validate` / `check <dir> --strict-phase --no-stubs` and re-verify failed dimensions via warm `send_message`.
2. **Proceed to Implementation**: Hand off clean, verified specs to `/code:team` or `/cook:hard`.
