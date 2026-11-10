---
name: behavioral-modes
description: AI operational modes (brainstorm, implement, debug, review, teach, ship, orchestrate). Use to adapt behavior based on task type.
allowed-tools: Read, Glob, Grep
version: "5.5.0"
---

# Behavioral Modes — Adaptive Smart-Hybrid Operating Modes (v5.5.0)

> **PURPOSE**: Define deterministic operational postures for BoomOpen Workflow Kit v5.5.0 across **Mode A (Tier 0 Known-Target Micro-Direct)** and **Mode B (4-Tier Dynamic Elastic Swarm & Golden Diamond Teams)**.

---

## 1. Core Operating Postures

### 🧠 1. BRAINSTORM Mode (`/brainstorm` / `brainstorm-team`)
- **When to use**: Early product discovery, architecture option exploration, trade-off evaluation.
- **Grounding Protocol (`clarification.style = autonomous_first`)**:
  - **Ground BEFORE Questioning**: Inspect workspace reality (`SCOUT`) and live ecosystem constraints (`RESEARCH`) first. Never ask lazy questions whose answers exist in `package.json`, schemas, or repo files!
  - **Conditional `ask_question` Gate**: Ask `0` questions when intent and constraints are clear; invoke native `ask_question` UI (`1–3` structured trade-off questions) **ONLY** when genuine product/business ambiguity would branch the architecture.
  - **Orthogonal Options + Tarpit Pre-Mortem**: Propose `3–4` genuinely distinct architectural options, stress-test each against failure modes, score via weighted MCDA matrix, and validate `<appDataDir>\brain\<conversation-id>\BRAINSTORM-{topic}.md` with `boomopen research validate <file> --mode brainstorm`.

### ⚡ 2. IMPLEMENT Mode (`/cook`, `/code`, or Mode A Micro-Edit)
- **When to use**: Building features, executing approved `PLAN-{task}.md` waves, or applying `<= 2` known-file micro-edits.
- **Execution Discipline**:
  - **Mode A (`<= 2` already-known files, 1 domain)**: Execute, test, and verify directly with zero report clutter.
  - **Mode B (`> 2` files or `>= 2` domains)**: Compile wave handoff packets (`boomopen cook packets`), lock `SHARED_CONTRACT` in Wave 1 before parallel consumers, and shard implementation so each `<role>#<shard>` owns **`<= 3–4` disjoint `OWNED_FILES`**.
  - **Pragmatic 2-Tier Standards**: Zero explicit `any`, zero leftover `console.log` in app code, typed `try/catch` error boundaries, zero `TODO`/hollow stubs, and cohesive files (`Soft 400 / Hard 500` lines).
  - **Concise Output**: Skip tutorial-style narration; deliver verified code and concise evidence (`boomopen check <dir> --strict-phase --no-stubs` + test output).

### 🔍 3. DEBUG Mode (`/debug`, `/fix`, `debug-team`)
- **When to use**: Root-cause analysis (RCA), test failures, race conditions, regressions, or production incidents.
- **Execution Discipline**:
  - **Reproduce & Trace First**: Gather exact stack traces, logs, and data-flow paths before proposing any code edit.
  - **Adversarial Hypothesis Fan-Out**: In complex bugs, fan out parallel `debugger#hyp-1..N` shards to test competing hypotheses rather than guessing sequentially.
  - **5-Whys & Regression Lock**: Document Symptom → Root Cause → Minimal Surgical Fix → Regression Test in `<appDataDir>\brain\<conversation-id>\DEBUG-{issue}.md`, and verify the fix end-to-end.

### 📋 4. REVIEW Mode (`/review`, `qa-team` / `security-team`, Post-Wave Critic)
- **When to use**: Code review, architecture audit, OWASP Web + LLM/Agentic security review, or `:team` Critic evaluation.
- **Execution Discipline**:
  - **Evidence-Cited Severity**: Classify every finding as `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` with exact `file:line` citations and concrete remediation diffs.
  - **Zero-Test-Gaming & Contract Audit**: Verify `OWNED_FILES` boundaries were respected, `READ_ONLY_FILES` tests were never weakened (`0` `it.skip` / `test.only`), and `SHARED_CONTRACT` types match 100%.
  - **Deterministic Gates**: Run `boomopen check <dir> --strict-phase --no-stubs` and relevant domain validators (`security_scan.py`, `ux_audit.py`, `accessibility_checker.py`, `api_validator.py`).

### 📚 5. TEACH Mode (`/ask`, Onboarding & Architecture Explanations)
- **When to use**: Explaining codebase internals, architectural trade-offs, or mental models (`commands/ask.md`).
- **Execution Discipline**:
  - Use read-only `scouter` fan-out (`TypeName: "research"`) when mapping `> 2` unknown files so explanations cite exact `file:line` reality.
  - Progress from high-level mental model + Mermaid `flowchart TD` / `sequenceDiagram` to concrete code walkthroughs.

### 🚀 6. SHIP Mode (`/deploy:check`, Release Readiness)
- **When to use**: Pre-deployment verification, CI/CD readiness, rollback safety, and final release gates.
- **Execution Discipline**:
  - Prioritize stability, zero leaked secrets (`security_scan.py`), migration expand/contract safety (`schema_validator.py`), Core Web Vitals (`LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`), and full E2E verification (`verify_all.py` + `boomopen check --strict-phase --no-stubs`).

---

## 2. Mode B Multi-Agent Collaboration Topologies (v5.5.0)

| Topology | Roles & Sharding | Artifacts & CLI Gates |
|----------|------------------|-----------------------|
| **🔭 Parallel Discovery** | `scouter#1..k` + `researcher#1..m` (`TypeName: "self"` when writing artifacts or using `search_web`) | `SCOUT-{feature}.md`, `RESEARCH-{topic}.md` (`boomopen research validate`) |
| **📐 Contract-First 3-Wave Swarm** | Wave 1 (`SHARED_CONTRACT` + `DESIGN_CONTRACT` + DB schema) → Wave 2 (`backend#1..n` + `frontend#1..m`, `<= 3–4 OWNED_FILES`/shard) → Wave 3 (`tester` + `reviewer`) | `PLAN-{feature}.md` (`boomopen plan validate`), `boomopen cook packets` & `verify-wave` |
| **💎 Elastic Golden Diamond (`:team`)** | `1 Tech Lead` + `1..6 Parallel Shard Executors` + `1..3 Parallel Critics` (`reviewer`, `tester`, `security-engineer`), max `3` debate rounds, Warm Reuse via `send_message` | `REVIEW-{scope}.md`, `TEST-{feature}.md`, `MAILBOX-*.md` |
| **🏛️ Multi-Session Autopilot & Council** | `/autopilot` Spec-to-Phase Ratchet (`planner` → shard executors → `reviewer#spec-auditor`) or `/conduct:council` (`claude` + `codex` + `antigravity` in parallel) | `.boomopen/project-ledger.json` (`boomopen ledger verify`), `<runId>-COUNCIL-SYNTHESIS.md` |

---

## 3. Automatic Mode Transition Pipelines

- **End-to-End Feature (`/cook`)**: `cook state` Fast-Forward → `EXPLORE` (`SCOUT` + `RESEARCH`) → `DESIGN` (`DESIGN-{feature}.md`) → `PLAN` (`PLAN-{feature}.md`) → `IMPLEMENT` (3-Wave `role#shard` swarm) → `REVIEW` & `SHIP` (`cook verify-wave` + `check --strict-phase --no-stubs`).
- **Bug Resolution (`/fix`)**: `DEBUG` (`DEBUG-{issue}.md` 5-Whys RCA) → `IMPLEMENT` (surgical fix + regression test) → `REVIEW` (full test suite green).
- **Approved-Plan Execution (`/code`)**: Skip `PLAN` re-generation → `cook packets` → `IMPLEMENT` → `REVIEW`.
