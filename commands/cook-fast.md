---
description: "⚡ Quick Feature — Rapid feature implementation with Turn-1 Fast-Forward, Mode A/B Gate & Strict CLI Verification"
version: "5.5"
category: engineering
execution-mode: execute
---

# /cook:fast — Rapid Feature Implementation

> **MISSION**: Quickly implement well-defined features (`≤ 2` known files directly in Mode A, or focused `3–4` file 1-Wave dispatch in Mode B) with **Turn-1 Fast-Forward** and zero-stub CLI verification.

<feature>$ARGUMENTS</feature>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & EXECUTION GATE

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`.
2. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{feature}.md` exists** → **Fast-Forward directly to Phase 3 (Wave Execution)**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" [--design "<design-path>"]` and execute Wave 1 immediately (**skip Phase 1 Context Scan & Phase 2 Micro-Planning!**).
   - **2. `DESIGN-{feature}.md` exists (no `PLAN` yet)** → **Fast-Forward to Phase 2 (Micro-Planning)**: Extract `DESIGN_CONTRACT` (`@theme inline` CSS + TypeScript Props) via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and fold it into your micro-plan.
   - **3. `SCOUT-*.md` or `RESEARCH-*.md` exists** → **Fast-Forward past Phase 1 (Context Scan)**: Consume existing discovery notes directly.
3. **Cohesive Single-File Deliverable Rule (`<= 500` lines)**:
   Keep any transient deliverable (`SCOUT-{feature}.md`, `PLAN-{feature}.md`, `REVIEW-{feature}.md`) in `<appDataDir>\brain\<conversation-id>\` as **1 single cohesive file** (`ArtifactMetadata: { Summary, UserFacing: true, RequestFeedback: false }` during `/cook:fast` — NEVER split into `{name}/` folders). Write deliverables in the user's input language; keep code and comments in English.

| Mode / Tier | When | Action |
|-------------|------|--------|
| **MODE A (TIER 0)** | Exact `≤ 2` target files are already known on Turn 1, `1` domain, 0 exploration needed | Implement, test, and verify **directly** in the primary agent (0 sub-agent overhead). |
| **MODE B (TIER 1)** | Scope requires codebase scan OR touches `3–4` files / `≥ 2` domains | Spawn specialist via `invoke_subagent(TypeName: "self", Model: "inherit")` (NEVER `flash_lite`) with the 5-Field Handoff Packet; record `role#shard -> conversationId` for warm `send_message` reuse. |
| **TIER 2** | Sub-agent tool unavailable | Load `agents/{role}.md` and embody specialist directly (fallback). |

---

## 🎭 Phase 1: FAST CONTEXT SCAN *(Skipped if Mode A or Prior `SCOUT`/`RESEARCH`/`PLAN` Exists)*

| Attribute | Value |
|-----------|-------|
| **Agent** | `scouter` via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Goal** | Locate exact integration points, existing types/components, and test conventions (`SCOUT-{feature}.md`, `RequestFeedback: false`). |

---

## 🎭 Phase 2: INLINE / COMPACT MICRO-PLANNING *(Skipped if `PLAN-{feature}.md` Already Exists)*

- For `≤ 2` known files (Mode A): Define a concise inline checklist (`SHARED_CONTRACT` types, `OWNED_FILES`, test cases).
- For `3–4` files / multi-domain (Mode B): Write a compact single-file `<appDataDir>\brain\<conversation-id>\PLAN-{feature}.md` (`<= 100` lines, `RequestFeedback: false` during autonomous `/cook:fast`), embedding `DESIGN_CONTRACT` if `DESIGN-{feature}.md` exists, and validate via:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"
  ```

---

## 🎭 Phase 3: IMPLEMENTATION & END-TO-END VERIFICATION

1. **Execute Changes**:
   - **Mode A (`≤ 2` files)**: Edit target files directly.
   - **Mode B (`> 2` files or `PLAN-{feature}.md` present)**: Extract packets via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>"` and dispatch `backend-engineer`, `frontend-engineer`, or `database-architect` (`TypeName: "self"`, `Model: "inherit"`, `≤ 3–4 OWNED_FILES` per shard).
2. **Enforce Pragmatic 2-Tier Coding Standards**:
   - **Tier 1 (Zero Tolerance)**: Zero explicit `any`, no debug `console.log` in app code, `try/catch` + typed error handling at async/API boundaries, named `SCREAMING_SNAKE_CASE` constants, clean sorted imports.
   - **Tier 2 (Cohesive Structure)**: `~200–350` lines target (`≤ 400` soft / `≤ 500` hard ceiling), focused functions, guard clauses.
3. **Mandatory Deterministic Verification & Wave 2.5 Reconcile (Iterative Self-Healing Until Green)**:
   - If `PLAN-{feature}.md` exists, verify the wave and run `REC-G1..G4` reconciliation (`commands/_ref/reconcile-loop.md`):
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile <dir> --plan "<plan-path>" --strict
     ```
     *(If `cook state` surfaced `specDrift: true` or `reconcile` flags an island module / mismatched `/api/...` route / missing `.env.example` key, wire & self-complete via `cook amend-plan` before finishing.)*
   - Run project build/typecheck, unit/integration tests, and strict code check:
     ```bash
     node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
     ```
   - If UI/frontend files were modified, run portable Python UX & WCAG 2.2 AA checks:
     ```bash
     python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
     python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
     ```

---

## 🚨 ESCALATION & COMPLETION

- **Escalate**: If scope expands beyond `4` files or requires multi-wave schema + API + UI orchestration → escalate to `/cook:hard`.
- **Completion**: Report modified files, passing test & `boomopen check --strict-phase --no-stubs` proof, and next actions:
  1. ✅ **Done** — Feature implemented and verified end-to-end
  2. 🧪 **Deep QA** → `/test:hard`
  3. 📝 **Docs** → `/docs:core`
