---
description: "🧪 Test Router — SOTA 2026 Zero-Test-Gaming Pyramid, App-Code READ_ONLY Lock, Elastic Test Shards & Deterministic CLI Verification"
version: "5.5"
category: validation
execution-mode: router
---

# /test — Zero-Test-Gaming & Elastic Test Suite Router (v5.5)

> **ROUTER DIRECTIVE**: Classify test scope, enforce the **Zero-Test-Gaming `READ_ONLY_FILES` App-Code Lock**, and route immediately on Turn 1 to `/test:fast`, `/test:hard`, or `/test:team`.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & ZERO-TEST-GAMING LAW

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Wave 1 test sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.

> 🛡️ **ZERO-TEST-GAMING & `READ_ONLY_FILES` APP-CODE LOCK (MANDATORY)**:
> 1. **Production Source Lock**: During `/test`, all production application source files (`src/**`, `app/**`, `server/**`, `lib/**`) are strictly locked in **`READ_ONLY_FILES`** (unless `--fix` is passed or the user explicitly asks to fix uncovered bugs). Test shards (`tester#unit`, `tester#integration`, `tester#e2e`, `tester#a11y`, `<= 3–4` test files/shard) **NEVER mutate app code, weaken assertions, or use `it.skip` / `test.only` / `test.todo` to fake green results**!
> 2. **Deterministic Runner & Hygiene Gates**: Every `/test` workflow MUST run:
>    - `python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project-root> [--coverage]` (plus `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py --suite <project-root>` or `playwright_runner.py <http-url> [--a11y] [--screenshot]` when E2E applies)
>    - `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <test-dir> --strict-phase --no-stubs` (blocks `.skip`, `.only`, `.todo`, `any`, and stubbed assertions)
> 3. **Cohesive Single-File `TEST-{scope}.md` & Conditional 1-Click `"Proceed"` to `/fix`**:
>    - Synthesize **1 single user-facing file** at `<appDataDir>\brain\<conversation-id>\TEST-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!).
>    - Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when real failing tests / uncovered P0/P1 app defects (`[APP_DEFECT]`) are found so Antigravity 2.0's 1-click **"Proceed"** button launches `/fix` directly; set `RequestFeedback: false` when the suite is `100%` green.
>    - Keep all internal shard/mailbox logs (`TEST-{scope}-s{1..k}.md`, `MAILBOX-{date}.md`) strictly `UserFacing: false, RequestFeedback: false`.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to write or run unit/integration/E2E tests, verify coverage, or validate edge cases in natural language without typing `/test`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"write tests"*, *"run test suite"*, *"add unit/integration/E2E tests"*, *"check test coverage"* |
| **`vi` (Tiếng Việt)** | *"viết test"*, *"chạy bộ test"*, *"thêm unit/E2E test"*, *"kiểm tra độ phủ test (coverage)"* |
| **`zh-CN` / `zh-TW`** | *"编写测试"*, *"运行测试套件"*, *"增加单元/端到端测试"*, *"检查测试覆盖率"* / *"編寫測試"*, *"執行測試"* |
| **`ja` (日本語)** | *"テストを書いて"*, *"テストを実行して"*, *"単体/E2Eテストを追加"*, *"カバレッジ確認"* |
| **`ko` (한국어)** | *"테스트 작성해줘"*, *"테스트 실행해줘"*, *"단위/E2E 테스트 추가"*, *"테스트 커버리지 확인"* |
| **`es` / `pt-BR`** | *"escribir pruebas"*, *"ejecutar tests"* / *"escrever testes"*, *"executar suíte de testes"* |
| **`fr` / `de` / `it`** | *"écrire des tests"*, *"lancer les tests"* / *"Tests schreiben"*, *"Testsuite ausführen"* / *"scrivere i test"* |
| **`ru` / `tr`** | *"написать тесты"*, *"запустить тесты"* / *"test yaz"*, *"testleri çalıştır"* |
| **`hi` / `ar`** | *"टेस्ट लिखें"*, *"टेस्ट चलाएं"* / *"كتابة الاختبارات"*, *"تشغيل الاختبارات"* |
| **`id` / `th`** | *"tulis pengujian"*, *"jalankan unit/E2E test"* / *"เขียนเทสต์"*, *"รันชุดทดสอบ"* |

---

## 🧭 ROUTING LOGIC

```text
1. IF user explicitly specifies a variant:
   - `/test:fast` → Load `commands/test-fast.md`
   - `/test:hard` → Load `commands/test-hard.md`
   - `/test:team` → Load `commands/test-team.md`

2. IF scope is small (`<= 2` files, targeted unit/regression test):
   → Route to `/test:fast` (`commands/test-fast.md`)

3. IF scope spans `> 2` files, multiple layers (Unit + Integration + E2E/A11y), or coverage gap analysis:
   - IF `execution.mode = "team"` or `workflows.defaultVariant = "team"` or security/mission-critical:
     → Route to `/test:team` (`commands/test-team.md` — 3-Wave Zero-Test-Gaming Golden Diamond)
   - ELSE:
     → Route to `/test:hard` (`commands/test-hard.md` — Elastic Parallel Test Pyramid Shards)

4. IF `workflows.defaultVariant = "ask"`:
   → Call `ask_question` UI tool with `(Recommended) /test:hard` (or `/test:fast` for `<= 2` files) first
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Architecture & Best Use Case |
|-------|---------------|------------------------------|
| **`/test:fast`** | `commands/test-fast.md` | **Targeted Unit & Regression Check (`<= 2` Files)**: App source locked in `READ_ONLY_FILES`, AAA edge-case assertions, `test_runner.py` + `boomopen check --strict-phase --no-stubs` → `TEST-{scope}.md` |
| **`/test:hard`** | `commands/test-hard.md` | **Elastic Parallel Test Pyramid (`> 2` Files)**: Turn-1 parallel `tester#unit`, `tester#integration`, `tester#e2e`, `tester#a11y` (`<= 3–4` test files/shard) + `scouter#1..k` → deterministic runner + hygiene gates → cohesive `TEST-{scope}.md` |
| **`/test:team`** | `commands/test-team.md` | **3-Wave Zero-Test-Gaming Golden Diamond (`agents/teams/qa-team/_team.md`)**: Wave 1 RTM & MSW harness lock → Wave 2 parallel `tester#1..k` shards → Wave 3 `qa-team-reviewer` Security/Perf/Mutation Critic + Cross-Engine audit → `TEST-{scope}.md` |
