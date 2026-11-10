---
description: "⚡ Fast Fix — Mode A Direct (≤ 2 Known Files) or Single-Wave Surgical Fix with Bidirectional DEBUG Fast-Forward & Persistent Verification"
version: "5.5"
category: debugging
execution-mode: execute
---

# /fix:fast — Rapid Surgical Bug Fix (`v5.5`)

> **MISSION**: Eliminate localized bugs at their **SPIE Systemic Root Cause (Why 5)** with **Bidirectional `DEBUG` Fast-Forward**, **Fail-First Regression Proof**, and **Persistent End-to-End Verification** (`0` unverified fixes).

<issue>$ARGUMENTS</issue>

---

## ⚡ TURN-1 FAST-FORWARD & SMART-HYBRID MODE GATE

1. **⚡ Bidirectional Prior-Artifact Fast-Forward (Check First!)**:
   - Inspect `<appDataDir>\brain\<conversation-id>\` (fallback `./reports/{topic}/`) for an existing `DEBUG-{issue}.md` or `REVIEW-{scope}.md`.
   - **If present**: **SKIP root-cause re-scouting!** Extract the proven `[file:line]` fault site, blast radius, and regression test spec directly and jump straight to Step 2!
2. **Mode A Direct vs. Mode B Single-Wave Dispatch**:
   - **Mode A Direct (`0` Sub-Agents)**: When target changes touch **`≤ 2` already-known files** in a single domain, diagnose (if no `DEBUG-{issue}.md` exists), patch, and verify directly!
   - **Mode B Fast Wave (`> 2` Files or Warm Engineer Reuse)**: Dispatch directly to the owning domain specialist (`backend-engineer`, `frontend-engineer`, `mobile-engineer`, `database-architect`) via `invoke_subagent(TypeName: "self", Model: "inherit")` (or reuse a warm `role#shard` session via `send_message`) with explicit `OWNED_FILES` (`≤ 3–4` files) and existing regression tests locked in `READ_ONLY_FILES`.

---

## 🔨 EXECUTION PROTOCOL (FAIL-FIRST → SURGICAL FIX → PERSISTENT VERIFY)

1. **SPIE 5-Whys Root Cause (When No Prior `DEBUG-{issue}.md` Exists)**:
   - Trace the exact stack trace / recent `git diff` from `Why 1 (Crash Symptom)` → `Why 5 (Systemic Root Cause)` (`skills/debugger/SKILL.md`). Never mask symptoms with empty `catch {}` or blind `?.`.
2. **Fail-First Reproduction (`RED`) & Surgical Fix (`GREEN`)**:
   - Write or run a minimal reproduction test/command confirming the failure (`RED`), keeping all pre-existing regression tests untouched (`READ_ONLY_FILES`).
   - Apply the minimal root-cause fix adhering to **Pragmatic 2-Tier Coding Standards** (`0` explicit `any`, `0` leftover debug `console.log`, typed `try/catch` boundaries, cohesive `≤ 400–450` lines).
3. **Persistent Auto-Fix Verification Loop (Mandatory)**:
   - Run the reproduction + regression test suite (`GREEN`), project build/typecheck, and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <changed_dir> --strict-phase --no-stubs`.
   - If any new error or test failure surfaces, iteratively diagnose and fix until `100%` green before reporting completion!
