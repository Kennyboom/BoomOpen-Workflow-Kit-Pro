---
description: "⚡ Quick Code — Fast implementation from an approved plan or clear spec with Mode A/B Gate & CLI Wave Verification"
version: "5.5"
category: engineering
execution-mode: execute
---

# /code:fast — Quick Implementation & Plan Execution

> **MISSION**: Execute localized changes (`≤ 2` known files directly in Mode A) or compact 1-Wave plans (`3–4` files via `boomopen cook packets` in Mode B) with zero ceremony and strict end-to-end verification.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 FAST-FORWARD STATE MACHINE & MODE GATE

1. **⚡ Unified Turn-1 Fast-Forward State Machine (`boomopen cook state`)**:
   Inspect `<appDataDir>\brain\<conversation-id>\` (or run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`) on Turn 1:
   - **1. `PLAN-{feature}.md` exists** → **Fast-Forward directly to Wave Execution**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"` and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" [--design "<design-path>"]` and execute Wave 1 immediately (**0 scouting, 0 design, 0 re-planning**).
   - **2. `DESIGN-{feature}.md` exists (no `PLAN` yet)** → Extract `DESIGN_CONTRACT` (`@theme inline` CSS + TypeScript Props) via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and conform strictly to its tokens and 5-State Matrix.
   - **3. `SCOUT-*.md` or `RESEARCH-*.md` exists** → Reuse existing discovery context directly without re-scanning.
2. **Mode Gate**:
   - **Mode A (Direct Execution — TIER 0)**: When exact `≤ 2` target files in `1` domain are already known on Turn 1 and no multi-agent coordination is needed, implement and verify directly in the primary agent.
   - **Mode B (1-Wave Direct Plan-to-Executor Dispatch — TIER 1)**: When executing an existing `PLAN-{feature}.md` or touching `3–4` files / `≥ 2` domains, dispatch directly to domain specialists (`backend-engineer`, `frontend-engineer`, `database-architect`, `mobile-engineer`) via `invoke_subagent(TypeName: "self", Model: "inherit")` using the 5-Field Handoff Packet (`OWNED_FILES <= 4`, `READ_ONLY_FILES`, `SHARED_CONTRACT`). Record `role#shard -> conversationId` for warm `send_message` fixes.

---

## 🔨 EXECUTION STEPS

### Step 1: Preflight & Packet Extraction
- If `<appDataDir>\brain\<conversation-id>\PLAN-{feature}.md` (or `./reports/{topic}/plans/PLAN-{feature}.md`) exists:
  ```bash
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook preflight "<plan-path>"
  node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook packets "<plan-path>" --wave 1
  ```
- Otherwise (Mode A `≤ 2` files), confirm exact `OWNED_FILES`, types, and test cases before editing.

### Step 2: Implement with Pragmatic 2-Tier Coding Standards
- **Tier 1 (Zero Tolerance)**: Zero explicit `any`, named `SCREAMING_SNAKE_CASE` constants, structured logger (no debug `console.log` in app code), `try/catch` with typed errors at async/API boundaries, clean sorted imports.
- **Tier 2 (Cohesive Structure)**: Single responsibility per file (`~200–350` lines target, `≤ 400` soft / `≤ 500` hard ceiling), focused functions (`~20–40` lines logic, `~40–80` UI/handlers), guard clauses (`≤ 3–4` nesting levels). Active settings in `~/.boomopen/settings.json` or `./.boomopen.json` override line defaults.
- If `PLAN-{feature}.md` exists, mark completed tasks `[ ]` → `[x]` (`ArtifactMetadata: { Summary, UserFacing: true, RequestFeedback: false }`).

### Step 3: Mandatory End-to-End Verification (Self-Heal Until Green)
1. **Wave Gate** *(when `PLAN-{feature}.md` exists)*:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook verify-wave "<plan-path>" --wave 1 --git --run-verify
   ```
2. **Build, Tests & Strict Anti-Stub Check**:
   Run project typecheck/build (`tsc --noEmit` or equivalent), unit/integration tests, and:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
3. **Automated UI & WCAG 2.2 AA Audit** *(whenever UI/frontend files were modified)*:
   ```bash
   python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
   python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
   ```
4. Fix any error iteratively (or via warm `send_message` in Mode B) before reporting completion.

---

## ✅ COMPLETION

Report modified files and passing verification outputs, then offer:
1. ✅ **Done** — Changes implemented and verified
2. 🧪 **Deep Tests** → `/test:hard`
3. 📝 **Docs** → `/docs:core`
