---
description: >-
  Code Surgeon v3 — SOLID audit, code smell detection,
  Fowler's catalog techniques, health scoring, performance-safe
  refactoring with before/after metrics.
category: code
execution-mode: execute
version: "5.5"
---

# /refactor — The Code Surgeon v3.0 (v5.5 Contract-Locked Shards)

> **IRON RULE**: Refactoring changes **INTERNAL STRUCTURE ONLY**, never external behavior — and **MUST NEVER degrade performance**. Any test break or benchmark slowdown triggers immediate rollback!

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 SHARDING GATE, OWNERSHIP LOCKS & PRAGMATIC 2-TIER STANDARDS

1. **Mode A vs. Mode B Dispatch**:
   - **Mode A (`≤ 2` Known Files — Quick Surgery)**: Read, baseline, refactor, and verify directly via `read_file`, `edit_file`, and `run_command`.
   - **Mode B (`> 2` Files — Deep Module or Full-Repo Scan)**: Never crawl or edit `> 2` files sequentially in the primary agent! Launch parallel `scouter#1..k` shards (`≤ 3–4` files/shard, `READ_ONLY_FILES` locked) on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")`, then dispatch isolated surgery shards (`backend-engineer#refactor-1..k`, `frontend-engineer#refactor-1..k`) with Warm Session Reuse (`send_message`).
2. **Contract-First Refactoring Locks**:
   - **`SHARED_CONTRACT`**: Lock all public module exports, API DTOs, function signatures, and cross-module types before parallel shards edit code.
   - **`OWNED_FILES`**: Strictly `≤ 3–4` disjoint source files per shard (`0` overlap across parallel shards).
   - **`READ_ONLY_FILES`**: Lock **100% of existing regression tests** (`tests/**`, `*.test.*`, `*.spec.*`) so refactoring proves behavior preservation against untouched tests!
3. **Pragmatic 2-Tier Coding Standards (Anti-Fragmentation)**:
   - **Tier 1 (Zero Tolerance)**: `1` clear responsibility/file, `0` explicit `any`, `0` debug `console.log` in app code, typed `try/catch` at async boundaries, `SCREAMING_SNAKE_CASE` constants, sorted clean imports.
   - **Tier 2 (Cohesive Sizing)**: Target `~200–350` lines/file (flexible to `~400–450`; split **only** above `~450–500` lines or when mixing multiple domains) and `~20–40` lines/logic function (`~40–80` UI/handler).

---

## 🔬 Phase 1 (Turn 1): Parallel Code Health X-Ray, Fowler Smells & SOLID Audit

Run build/lint/test baseline via `run_command` in parallel with `scouter#1..k` (`≤ 3–4` files/shard):

| Audit Lens | What Each Shard Measures |
|------------|--------------------------|
| **1. Health Metrics** | Cyclomatic complexity (`< 10`), nesting depth (`≤ 3` via guard clauses), lines/function, lines/file, `tsc --noEmit`, ESLint warnings (`0`), and Code Health Score (`0–100`). |
| **2. Fowler's 5 Smell Groups** | **🐘 Bloaters** (Long Method, Large Multi-Domain File `> 450–500L`, Long Parameter List `> 4`, Primitive Obsession) · **🔨 OO Abusers** ( sprawling `switch`/conditionals, Temp Fields) · **🚧 Change Preventers** (Divergent Change, Shotgun Surgery) · **🗑️ Dispensables** (Dead Code, Duplication `≥ 3x`) · **🔗 Couplers** (Feature Envy, Inappropriate Intimacy). |
| **3. SOLID Score (`/50`)** | Score `0–10` each across **S**RP, **O**CP, **L**SP, **I**SP, and **D**IP with exact `file:line` violations. |

*If scope is broad (`Full Repo Scan`), call `ask_question` to confirm priority modules before modifying files.*

---

## 🛡️ Phase 2: Mandatory 6-Point Safety Protocol (Before Touching Code)

> ⛔ **DO NOT EDIT ANY FILE** until all 6 baseline locks are recorded:

1. **Git Safety Checkpoint**: Create branch (`git checkout -b refactor/{scope}`) or clean working tree verification (`git status`).
2. **Regression Test Baseline**: Run existing test suite (`npm test`) and lock existing test files in `READ_ONLY_FILES`.
3. **Performance Baseline**: Record hot-path execution / build / bundle metrics (`ms` / `KB`).
4. **Static Analysis Baseline**: Record `tsc --noEmit`, linter, and `boomopen check` baseline counts.
5. **Locked `SHARED_CONTRACT`**: Freeze public signatures and assign disjoint `OWNED_FILES` (`≤ 3–4` files/shard).
6. **Atomic Rollback Command**: Confirm exact 1-command revert (`git checkout -- <files>` or `git reset --hard <checkpoint-sha>`).

---

## 🔪 Phase 3: Sharded Precision Surgery & Persistent Verification

Dispatch refactoring shards via `invoke_subagent(TypeName: "self", Model: "inherit")` (or warm `send_message`) using named **Fowler Techniques** (`Extract Method`, `Introduce Parameter Object`, `Replace Conditional with Polymorphism`, `Move Method`, `Replace Magic Number with Symbolic Constant`, `Extract Cohesive Module`, `Replace Nested Conditional with Guard Clauses`):

For **every** shard and wave, enforce end-to-end verification before accepting changes:
```bash
# 1. Deterministic Pragmatic 2-Tier & anti-stub gate (MUST exit 0)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs

# 2. Strict typecheck, lint, untouched regression tests, and build
npm run build && npm test
```

- **Performance Gate**: Compare post-surgery latency/bundle against Phase 2 baseline. If slower → **rollback immediately** (`git checkout -- <shard-files>`) and apply a zero-overhead refactor instead!
- **Iterative Fix Loop**: If any typecheck, lint, or test fails, fix immediately via warm `send_message(Recipient: conversationId)` until `100%` green.

---

## 📊 Phase 4: Cohesive Brain Artifact (`REPORT-refactor-{topic}.md`) & Guard Rails

Write **1 cohesive summary report** (`≤ 500` lines) to `<appDataDir>\brain\<conversation-id>\REPORT-refactor-{topic}.md` with:
```json
ArtifactMetadata: { "Summary": "Code Health X-Ray, SOLID & Performance-Safe Refactoring Report", "UserFacing": true, "RequestFeedback": false }
```

### Required Content in `REPORT-refactor-{topic}.md`:
| Metric | Before | After | Delta | Gate |
|--------|:------:|:-----:|:-----:|:----:|
| Code Health Score | `{X}/100` | `{Y}/100` | `+{Z}` | ✅ |
| SOLID Score | `{X}/50` | `{Y}/50` | `+{Z}` | ✅ |
| Code Smells / Lint Warnings | `{X}` | `0` | `-{X}` | ✅ |
| Benchmark / Bundle | `{X}ms` | `{Y}ms` | `≤ 0%` regression | ✅ |
| `boomopen check --strict-phase --no-stubs` | `{status}` | `PASS (0 errors)` | Verified | ✅ |

- **Techniques Applied Table**: Clickable `[file:line](file:///...)` links, Fowler technique used, and structural improvement.
- **Guard Rails Enforced**:
  - ⚠️ **Refactor ≠ Rewrite**: Rewriting `> 60%` of module architecture → stop and route to `/architect` or `/plan:hard`.
  - ⚠️ **Refactor ≠ Feature**: Adding new business behavior → route to `/cook:hard` or `/code:team`.
- **Next Steps**: `/test:hard` (expand edge-case coverage), `/review:team`, or `/save`.
