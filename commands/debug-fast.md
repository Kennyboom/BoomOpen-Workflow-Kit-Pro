---
description: "⚡ Quick Debug — Mode A Direct (≤ 2 Known Files) or Single-Wave SPIE 5-Whys Root Cause Trace with 1-Click Proceed to /fix"
version: "5.5"
category: debugging
execution-mode: execute
---

# /debug:fast — Rapid SPIE Root-Cause Diagnosis (`v5.5`)

> **MISSION**: Rapidly isolate the proven root cause of a localized bug without mutating production code — producing **1 cohesive `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (`≤ 500` lines)** with `ArtifactMetadata.RequestFeedback: true` so clicking **"Proceed"** launches `/fix:fast`!

<issue>$ARGUMENTS</issue>

---

## ⚡ SMART-HYBRID MODE GATE (`MODE A` vs `TURN-1 WAVE`)

Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md`:
- **Mode A Direct (`0` Sub-Agents)**: When the stack trace targets **`≤ 2` already-known files** in a single domain, inspect the files (`read_file`), check recent `git diff` / reproduction (`run_command`), and execute the SPIE trace directly (`skills/debugger/SKILL.md`).
- **Mode B Fast Wave (`> 2` Files or Unscoped Error)**: Immediately on Turn 1, spawn `debugger` (or `debugger#h1..2` if 2 distinct subsystems are implicated) via `invoke_subagent(TypeName: "self", Role: "Root-Cause Debugger", Model: "inherit", Prompt: ...)` — **NEVER** use `TypeName: "research"` (which disables `run_command` and `write_file`) or `flash_lite`!

---

## 🔍 SPIE v3.0 FAST INVESTIGATION PROTOCOL

1. **Deterministic Symptom & Reproduction (`DBG-G1`)**:
   - Capture the verbatim error message, stack frames (`[file:line](file:///...)`), and minimal reproduction command or input trigger.
   - Check `git log --oneline -5` / `git diff` if the failure is a recent regression.
2. **5-Whys Causal Chain & Blast Radius (`DBG-G2` & `DBG-G4`)**:
   - Trace backward from **Why 1 (Crash Site Symptom)** → **Why 2 (Invalid Input/State)** → **Why 3 (Missing Contract/Guard)** → **Why 4 (Control-Flow Gap)** → **Why 5 (Systemic Root Cause)**.
   - Inspect direct callers/callees to ensure the proposed fix won't break sibling paths.
3. **Cohesive Deliverable (`DEBUG-{issue}.md` — Zero Production Edits)**:
   - Write **1 single cohesive file (`≤ 500` lines — NEVER split into `{name}/` folders)** at `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (fallback `./reports/{topic}/debugs/DEBUG-{issue}.md`) with:
     - `ArtifactMetadata: { Summary: "SPIE root-cause trace and surgical fix blueprint for {issue}", UserFacing: true, RequestFeedback: true }`
     - **Sections**: `1. Symptom & Reproduction Command`, `2. SPIE 5-Whys Causal Chain ([file:line])`, `3. Blast Radius`, `4. Surgical Fix Blueprint (Pragmatic 2-Tier Standards)`, and `5. Fail-First Regression Test Spec`.

---

## ✅ COMPLETION & NEXT STEPS

Present `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md` (native **"Proceed"** button active):
1. 🔧 **Proceed / `/fix:fast`** → Apply the surgical fix and verify end-to-end (`DEBUG-{issue}.md` auto-fast-forwards!)
2. 🔬 **Escalate to `/debug:hard` or `/debug:team`** → If reproduction is intermittent or spans `> 4` modules
