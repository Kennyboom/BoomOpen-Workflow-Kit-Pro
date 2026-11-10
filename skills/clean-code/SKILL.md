---
name: clean-code
description: Pragmatic 2-Tier coding standards — strict type/error safety with cohesive, maintainable file and function structure
allowed-tools: Read, Write, Edit, Bash
version: "5.5.0"
priority: CRITICAL
---

# Clean Code — Pragmatic 2-Tier AI Coding Standards (v5.5.0)

> **CRITICAL SKILL**: Write **clean, type-safe, cohesive, and CLI-verified** code. Enforce **zero-tolerance safety on Tier 1** while favoring **cohesion over mechanical file/function fragmentation on Tier 2**.

---

## 1. Core Engineering Principles

| Principle | Rule |
|-----------|------|
| **SRP (Single Responsibility)** | Each file, class, or function addresses **1 clear cohesive responsibility** or domain concept |
| **DRY (Don't Repeat Yourself)** | Extract logic repeated `>= 3` times into a shared typed helper; do not over-abstract 2-line snippets |
| **KISS & YAGNI** | Prefer the simplest, most direct implementation; never build speculative abstractions or dead config layers |
| **Contract & Ownership Fidelity** | Honor `SHARED_CONTRACT` / `DESIGN_CONTRACT` signatures 100% and never edit outside assigned `OWNED_FILES` |
| **Boy Scout Rule** | Leave every touched file cleaner, better-typed, and free of lint/stub debt |

---

## 2. Pragmatic 2-Tier Coding Standards (`boomopen check` Enforced)

### 🛡️ Tier 1 — Strict Quality & Safety Rules (MANDATORY — Zero Tolerance)

1. **Zero Explicit `any` (`forbidExplicitAny = true`)**:
   - TypeScript MUST use concrete types/interfaces, `unknown` narrowed via Type Guards or Zod schemas, or Generics `<T>`. Never use `: any`, `as any`, or `<any>`.
2. **Zero Leftover `console.log` in Production App Code (`warnConsoleLog = true`)**:
   - Use a structured logger (`logger.debug`/`info`/`warn`/`error`) in UI, API, and service modules; remove all temporary debug logs before completion. *(CLI tools `cli/*.js`, build scripts, and test benchmarks are exempt).*
3. **Async Error Handling & Named Constants**:
   - Wrap every async/API/database/IO boundary in `try/catch` with typed error handling and actionable context (RFC 9457 / typed `Result`).
   - Extract business/configuration magic numbers into `SCREAMING_SNAKE_CASE` constants.
4. **Clean Imports & Caller Synchronization**:
   - Sort imports (`external` → `internal` → `relative`) and remove unused imports.
   - When modifying a function signature or exported type within your scope, update all callers in the same turn.
5. **Zero Hollow Stubs, Deferred Markers & Test Gaming (`--strict-phase --no-stubs`)**:
   - **`0` Deferred Work Markers**: Never leave `TODO`, `FIXME`, `PLACEHOLDER`, or `XXX` comments in delivered source files.
   - **`0` Hollow Stubs or Leaked Mocks**: Never ship `throw new Error('Not implemented')`, `raise NotImplementedError`, `todo!()`, `unimplemented!()`, or `vi.mock`/`jest.mock` inside production modules.
   - **`0` Test Gaming**: Never weaken tests with `it.skip`, `test.only`, `test.todo`, or vacuous assertions (`expect(true).toBe(true)`), and never modify locked regression tests in `READ_ONLY_FILES`.

### 📐 Tier 2 — Flexible Structural Guidelines (Cohesion Over Mechanical Splitting)

| Dimension | Soft Target | Hard Limit & Pragmatic Split Rule (`codingStandards.preset = pragmatic`) |
|-----------|:-----------:|--------------------------------------------------------------------------|
| **File length** | **~200–350 lines** *(warn at `> 400`)* | **Hard ceiling `500` lines** (`boomopen check` warns `> 400`, errors `> 500`). Keep a `350–450` line file intact when serving 1 cohesive responsibility; split ONLY when exceeding `~450–500` lines **or** mixing multiple domains. *(Exempt: Test suites, Schema/Types `.d.ts`, CLI entrypoints, Markdown/Docs; kit docs use `boomopen doctor` budgets: `rules` `300`, `commands/agents/teams/i18n/skills` `450`).* |
| **Function length** | **~20–40 lines** *(logic)*<br>**~40–80 lines** *(UI / Handler)* | Extract sub-functions when reusing logic (DRY) or isolating an independent step. Never shatter readable sequential logic into tiny 8-line fragments. |
| **Line width** | **~100–120 chars** | Flexible for URLs, Regex patterns, SQL queries, Tailwind CSS classes, and Markdown tables. |
| **Nesting & Params** | **`<= 3–4` levels** / **`<= 4–5` params** | Use **Guard Clauses** (early returns) at top of functions; pass a typed `Options` object when optional parameters exceed `4–5`. |

---

## 3. Naming Conventions

| Element | Convention | Examples |
|---------|------------|----------|
| **Variables & Properties** | Descriptive camelCase / snake_case noun | `activeSession`, `retryAttemptCount`, `invoice_total_cents` |
| **Functions & Methods** | Action verb + domain noun | `compileWavePackets()`, `validatePlan()`, `verifyWebhookSignature()` |
| **Booleans** | `is` / `has` / `can` / `should` prefix | `isAuthenticated`, `hasValidToken`, `canPublish` |
| **Constants** | `SCREAMING_SNAKE_CASE` | `MAX_PARALLEL_SHARDS`, `NAVIGATION_TIMEOUT_MS` |

---

## 4. Persistent Self-Verification & Auto-Fix Loop (MANDATORY)

> **NEVER stop after an unverified edit or shift testing onto the user.** Run deterministic CLI checks and project build/test suites yourself, iteratively fixing any error until **0 errors** remain.

| Domain / Role | Mandatory Verification Commands |
|---------------|---------------------------------|
| **All Source Edits** | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` + project typecheck/build (`tsc --noEmit`, `npm run build`) |
| **Frontend & UI (`frontend-engineer`, `designer`)** | `python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>` + `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>` |
| **Backend & API (`backend-engineer`)** | `python ~/.{TOOL}/skills/api-patterns/scripts/api_validator.py <project_path>` |
| **Database (`database-architect`)** | `python ~/.{TOOL}/skills/database-design/scripts/schema_validator.py <project_path>` |
| **Security (`security-engineer`)** | `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <project_path>` |
| **Testing (`tester`)** | Project test runner (`npm test` / `vitest` / `pytest`) or `python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project_path>` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.
