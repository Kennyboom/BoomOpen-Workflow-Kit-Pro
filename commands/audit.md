---
description: "🔎 Audit Router — Stateful Multi-Round Post-Completion Whole-Project Audit (Spec <-> Code RTM, Cross-Module Flow, 2-Layer Security/Leakage & Human-Gated Fix Loop)"
version: "5.5"
category: validation
execution-mode: router
---

# /audit — Stateful Multi-Round Post-Completion Audit Router (v5.5)

> **ROUTER DIRECTIVE**: Eliminate post-completion feature gaps, cross-module integration disconnects, auth/PII leaks, `N+1`/`TOCTOU` hazards, and UX state omissions via a **stateful 4-Round Progressive Audit Engine** backed by `.boomopen/audit-ledger.json` and `.boomopen/AUDIT-PROGRESS.md` — **strictly human-gated before every code fix wave** unless `/audit:auto` or `--auto-fix` is explicitly requested.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & HUMAN-GATED INVARIANTS

1. **Zero Pre-Flight Tax**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — inspect `.boomopen/audit-ledger.json` and route **immediately on Turn 1**.
2. **⛔ Non-Negotiable Human-Gated Fix Law**:
   - During every audit scan round (`SCANNING_ROUND`), lock **100% of project source, test, and ledger files in `READ_ONLY_FILES`**.
   - **NEVER modify production or test code before the user reviews `AUDIT-{project}-r{k}.md` and explicitly approves fixes** (unless the user explicitly invoked `/audit:auto` or passed `--auto-fix`).
3. **Deterministic Audit CLI (`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit ...`)**:
   - `audit init [--docs <a.md,b.md>] [--max-rounds <N>] [--auto-fix] [--json]` — Full codebase census (`0` file truncation!), spec discovery (`spec_grounded` vs zero-doc `code_inferred`), vertical flow graph (`FLOW-01..M`), and static hazard scan.
   - `audit slice [--round <k>] --json` — Emits the Round `k` Progressive Focus Slice (`R1` Spec & Vertical Flows -> `R2` Re-Audit + 2-Layer Security/Leakage + TX/Perf -> `R3` Re-Audit + UX 5-States/A11y/Ops + `P3` Nitpick Freeze -> `R4+` Scoped Delta Sign-off).
   - `audit record [--round <k>] --input <findings.json> --json` — SHA-256 fingerprint deduplication, `wont_fix`/`deferred` suppression, `P3` nitpick freeze (`R3+`), oscillation circuit-breaker (`reopen_count >= 2`), and convergence gate.
   - `audit approve [--round <k>] [--select <all|P0,P1,P2|AUD-001,...>] [--exclude <ids>] [--defer <ids>] --json` — Applies user decisions, short-circuits to `CONVERGED` when `0` mutations remain, or compiles collision-free `<= 4 OWNED_FILES` fix packets.
   - `audit verify-fix [--round <k>] [--passed-tests <N>] [--locked-tests <a,b>] --run-verify --json` — Enforces `strictPhase` code inspection + monotonic test ratchet + regression test lock before chaining into Round `k+1`.
   - `audit status [--json]` — Prints the round-over-round burn-down scorecard and refreshes `.boomopen/AUDIT-PROGRESS.md`.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to perform a comprehensive post-completion whole-project audit, verify spec-to-code completeness, or run a multi-round project health & bug audit in any of the 17 supported languages without typing `/audit`, trigger this router automatically:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"audit the entire project"*, *"full post-completion audit"*, *"check missing features & cross-module bugs"*, *"multi-round project audit"* |
| **`vi` (Tiếng Việt)** | *"kiểm toán toàn bộ dự án"*, *"audit tổng thể sau khi hoàn thiện"*, *"rà soát tính năng thiếu & lỗi liên module"*, *"audit dự án nhiều vòng"* |
| **`zh-CN` / `zh-TW`** | *"全项目完成后全面审计"*, *"多轮跨模块与需求漏项审计"* / *"全專案完成後全面審計"*, *"多輪跨模組與需求漏項審計"* |
| **`ja` (日本語)** | *"プロジェクト全体の完成後監査"*, *"仕様漏れとモジュール間バグを複数ラウンドで監査して"* |
| **`ko` (한국어)** | *"프로젝트 전체 완료 후 종합 감사"*, *"다중 라운드 요구사항 누락 및 모듈 간 버그 감사"* |
| **`es` / `pt-BR`** | *"auditar todo el proyecto tras finalizar"*, *"auditoría integral multi-ronda"* / *"auditar todo o projeto pós-conclusão"*, *"auditoria multi-rodada"* |
| **`fr` / `de` / `it`** | *"auditer tout le projet après achèvement"* / *"gesamtes Projekt mehrstufig auditieren"* / *"audit completo multi-round dell'intero progetto"* |
| **`ru` / `tr`** | *"провести полный многораундовый аудит проекта"* / *"tüm projeyi çok turlu denetle"* |
| **`hi` / `ar`** | *"पूरे प्रोजेक्ट का बहु-चरणीय ऑडिट करें"* / *"تدقيق شامل متعدد الجولات للمشروع بالكامل"* |
| **`id` / `th`** | *"audit menyeluruh seluruh proyek multi-putaran"* / *"ตรวจสอบโปรเจกต์ทั้งหมดแบบหลายรอบหลังทำเสร็จ"* |

---

## 🧭 STATE-AWARE AUTO-ROUTING LOGIC

```text
1. IF user explicitly invokes `/audit:auto` OR `$ARGUMENTS` contains `--auto-fix`:
   → Load and execute `commands/audit-auto.md` (Unattended Auto-Approve P0/P1/P2 Loop)

2. IF user explicitly invokes `/audit:fix`:
   → Load and execute `commands/audit-fix.md`

3. IF user explicitly invokes `/audit:run`:
   → Load and execute `commands/audit-run.md`

4. OTHERWISE inspect `.boomopen/audit-ledger.json` (via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js audit status --json` if file exists):
   - Ledger NOT FOUND, OR `state === "SCANNING_ROUND"`:
     → Route IMMEDIATELY to `commands/audit-run.md` (Initialize if needed & execute Round `k` Read-Only Scan)
   - `state === "AWAITING_USER_APPROVAL"` AND user replied with approval / `"Proceed"` / filter choices:
     → Route IMMEDIATELY to `commands/audit-fix.md` (Apply decisions → `RED -> GREEN` Fix Shards → Auto-chain Round `k+1`)
   - `state === "FIXING"`:
     → Resume `commands/audit-fix.md` to complete fix verification and chain into Round `k+1`
   - `state === "CONVERGED"` OR `state === "HALTED_OSCILLATION"`:
     → Present `.boomopen/AUDIT-PROGRESS.md` scorecard and call `ask_question` asking whether to start a fresh Round 1 audit (`audit init`) or inspect prior Brain report
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Core Responsibility & Deterministic Guarantees |
|-------|---------------|------------------------------------------------|
| **`/audit:run`** | `commands/audit-run.md` | **Read-Only Progressive Audit Round (`R1..R4+`)**: Runs `audit init` / `audit slice`, dispatches parallel vertical-flow, Spec-RTM, and 2-Layer security shards, records deduplicated findings via `audit record`, writes `<appDataDir>\brain\<conversation-id>\AUDIT-{project}-r{k}.md`, and **pauses via `ask_question` for user approval**. |
| **`/audit:fix`** | `commands/audit-fix.md` | **Collision-Free `RED -> GREEN` Fix Wave & Auto-Reaudit**: Runs `audit approve` (with Zero-Approved-Mutation short-circuit), dispatches `<= 3–4 OWNED_FILES` fix shards with `locked_regression_tests` in `READ_ONLY_FILES`, runs `audit verify-fix --run-verify`, and **chains straight into `commands/audit-run.md` for Round `k+1`**. |
| **`/audit:auto`** | `commands/audit-auto.md` | **Explicit Unattended Multi-Round Convergence (`--auto-fix`)**: Auto-approves `P0 + P1 + P2 + SPEC_GAP` across rounds until `CONVERGED` or `HALTED_OSCILLATION`. |
