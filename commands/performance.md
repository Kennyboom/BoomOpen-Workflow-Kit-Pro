---
description: >-
  Speed Alchemist v3 — Performance budgets, frontend/backend
  profiling, 6-layer caching, bundle optimization, database
  tuning, Core Web Vitals, and CI/CD performance gates.
category: performance
execution-mode: execute
version: "5.5"
---

# /performance — The Speed Alchemist v3.0 (v5.5 Parallel Profiling & Tuning)

> **MISSION**: Measure real baseline bottlenecks before touching code, enforce strict Core Web Vitals / API / DB budgets, execute non-regressing optimizations across isolated shards when requested, and output **1 cohesive `<appDataDir>\brain\<conversation-id>\REPORT-perf-{topic}.md`** (`≤ 500` lines).

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX PARALLEL DISPATCH, SHARDING & ARTIFACT CONTRACT

1. **Valid Antigravity 2.0 Toolset**: Use `read_file`, `run_command`, `search_web`, `write_file`, `edit_file`, `invoke_subagent`, `send_message`, and `ask_question`.
2. **Elastic Parallel Profiling & Tuning Shards (`> 2` Files)**:
   - For `≤ 2` known files, profile and optimize directly (Mode A).
   - For `> 2` files or multi-domain profiling (Frontend + Backend + DB), **never crawl files sequentially**! Spawn parallel shards (`performance-engineer#frontend`, `performance-engineer#backend-db`, `performance-engineer#cache-net`) on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")`, capping each shard at **`≤ 3–4` heavy files/modules** and saving `role#shard -> conversationId` for Warm Session Reuse (`send_message`).
3. **File Ownership Locks**:
   - **Audit/Profiling Phase**: Lock **100% of repo files** in `READ_ONLY_FILES`; shards report via `send_message` or disjoint scratch files (`REPORT-perf-{topic}-s{1..k}.md`, `UserFacing: false, RequestFeedback: false`).
   - **Optimization Phase (when applying fixes across `> 2` files)**: Lock shared DTOs/cache keys in `SHARED_CONTRACT`, assign disjoint `OWNED_FILES` (`≤ 3–4` files/shard), and lock existing test suites in `READ_ONLY_FILES`.
4. **Cohesive Single-File Deliverable**: Write `<appDataDir>\brain\<conversation-id>\REPORT-perf-{topic}.md` (`≤ 500` lines, zero `{name}/` folder splits) with explicit `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`.

---

## ⚡ GOLDEN RULES

1. **MEASURE FIRST, OPTIMIZE SECOND** — Zero blind micro-optimizations without baseline numbers.
2. **BUDGET IS LAW** — Any metric exceeding its budget blocks production sign-off.
3. **BOTTLENECK PRIORITY** — Attack the highest-latency / largest-byte hot path first (Amdahl's Law).
4. **ZERO BEHAVIOR OR SECURITY REGRESSION** — Never cache auth tokens, user-private PII, or real-time mutations without scoped keys.
5. **BEFORE / AFTER PROOF** — Every applied change must record measured `Before → After` delta (`ms` or `KB`).

---

## 📊 Phase 1 (Turn-1 Parallel Fan-Out): Baseline Measurement & Performance Budgets

Run build/bundle/query diagnostics via `run_command` in parallel with `performance-engineer#1..k` profiling shards:

| Domain | Metric | Strict Budget | Verification Method |
|--------|--------|:-------------:|---------------------|
| **Frontend CWV** | LCP / INP / CLS | `< 2.5s` / `< 200ms` / `< 0.1` | Lighthouse / Playwright Web Vitals |
| **Frontend Assets** | JS Bundle / CSS / Image | `< 300KB gz` / `< 50KB gz` / `< 200KB` | Build output / Bundle Analyzer |
| **Backend API** | API `p95` / Auth `p95` / TTFB | `< 500ms` / `< 200ms` / `< 600ms` | Benchmark / Server timing logs |
| **Database** | Query latency / Queries per req | `< 100ms` (`EXPLAIN < 50ms` hot) / `0` N+1 | `EXPLAIN ANALYZE` / Query counter |

---

## 🔬 Phase 2: Multi-Domain Bottleneck Audit & 6-Layer Caching Matrix

| Shard Track | Checklist Audited (`≤ 3–4` Heavy Modules/Shard) |
|-------------|-------------------------------------------------|
| **🖥️ Track A: Frontend Rendering, Bundle & Media** | Route/component code-splitting (`lazy` + `Suspense`), tree-shaking ESM imports, list virtualization, stable React keys & measured memoization, `WebP/AVIF` + `srcset` + `loading="lazy"`, font subsetting (`font-display: swap`), GPU-only animations (`transform`/`opacity`) + `prefers-reduced-motion`. |
| **🗄️ Track B: Backend Hot Paths & Database** | Composite indexes on `WHERE` / `JOIN` / `ORDER BY` / FK columns, `N+1` query elimination (batching/`JOIN`/dataloader), cursor/bounded pagination (zero unbounded `SELECT *`), connection pooling, non-blocking async queues/streams for heavy payloads, Brotli/Gzip compression. |
| **🚀 Track C: 6-Layer Caching & Network** | HTTP/2–3, `preconnect`/`preload` for critical origins, `ETag` / `stale-while-revalidate`, and the 6-Layer Cache Matrix below. |

### 6-Layer Caching Strategy
| Layer | Mechanism | Typical TTL | Hit Target | Invalidation & Safety Guard |
|-------|-----------|:-----------:|:----------:|-----------------------------|
| 1. Browser | HTTP Cache / Service Worker | Immutable (`1y` hashed) | `80%+` | Content-hashed filenames; `no-cache` on HTML |
| 2. CDN / Edge | Edge Cache | `1h` public static/ISR | `90%+` | Tag/path purge on deploy; `Vary` headers verified |
| 3. Client Query | TanStack Query / SWR | `1–5m` staleTime | `70%+` | Mutation key invalidation |
| 4. App Server | Redis / In-Memory LRU | `5–15m` | `85%+` | Tenant-scoped keys + explicit write-through purge |
| 5. Database | Prepared / Query Cache | Engine-managed | `60%+` | Covering indexes + bounded result sets |
| 6. In-Request | Request-scoped Memoization | Per-request | `95%+` | Cleared at request lifecycle end |

> 🚫 **NEVER CACHE PUBLICLY**: Auth/session tokens, cross-tenant user data, payment/checkout state, or real-time balances.

---

## 🛠️ Phase 3: Sharded Optimization Execution & CLI Verification *(When Optimizing Code)*

When the user requests applying fixes (not audit-only), dispatch parallel domain engineers via warm `send_message` or `invoke_subagent(TypeName: "self", Model: "inherit")` (`≤ 3–4` disjoint `OWNED_FILES`/shard), then run mandatory deterministic gates:

```bash
# 1. Verify code quality, line budgets, zero explicit `any`, and zero stubs
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs

# 2. Verify cache/header/query changes introduced zero security or secret/CORS regressions
python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <target-dir>
```
*(Plus project build, `tsc --noEmit`, test suite, and post-change benchmark comparison — rollback immediately if any metric regresses!)*

---

## 📄 Phase 4: Cohesive Brain Artifact (`REPORT-perf-{topic}.md`) & Handover

Write **1 single cohesive report** (`≤ 500` lines) to `<appDataDir>\brain\<conversation-id>\REPORT-perf-{topic}.md` with:
```json
ArtifactMetadata: { "Summary": "Baseline vs. Post-Optimization Performance & Budget Report", "UserFacing": true, "RequestFeedback": false }
```

### Mandatory Sections in `REPORT-perf-{topic}.md`:
1. **Executive Verdict & Budget Scorecard**: Verdict (`FAST` | `WITHIN_BUDGET` | `NEEDS_TUNING` | `BUDGET_BREACH`), CWV/API/DB budget pass/fail table, and CLI gate status (`boomopen check`, `security_scan.py`).
2. **Measured Optimization & Bottleneck Matrix**:
   | # | Bottleneck / Optimization (`file:line`) | Domain | Before | After / Projected | Savings (`KB` / `ms` / `%`) | Status |
   |---|-----------------------------------------|--------|:------:|:-----------------:|:---------------------------:|:------:|
3. **6-Layer Cache & DB Index Blueprint**: Exact composite index DDL, query rewrites, and cache-header configurations.
4. **Next Actions**: Prioritized follow-ups (`/fix:hard` for structural bottlenecks, `/security-audit`, or `/deploy:check`).
