---
description: "🏛️ Autonomous Multi-Session Project Orchestrator — Ingest multi-doc specs into an immutable .boomopen/project-ledger.json, execute multi-phase DAGs with Elastic Golden Diamond swarms, and enforce 4-Layer Zero-Omission & Anti-Regression Quality Gates."
version: "5.5"
category: orchestration
execution-mode: router
---

# /autopilot — Autonomous Multi-Session Project Orchestrator (v5.5)

> **ROUTER DIRECTIVE**: Eliminate "Lost in the Middle" spec omission, cross-session amnesia, hollow stub implementations, and cross-phase regressions on large multi-document projects by routing to `/autopilot:init`, `/autopilot:run`, or `/autopilot:audit` backed by `.boomopen/project-ledger.json`.

<arguments>$ARGUMENTS</arguments>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, BRAIN ARTIFACTS & LIVE CLI GATES

1. **Zero Pre-Flight Tax & 0-Turn Sub-Agent Dispatch**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — inspect `.boomopen/project-ledger.json` and launch the matched `/autopilot:{init|run|audit}` workflow **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` with Warm Session Reuse (`send_message`).
2. **Cohesive Brain Artifacts First (`<= 500` lines, Clean Git Tree)**:
   - Write transient deliverables as **1 single cohesive Brain Artifact** in `<appDataDir>\brain\<conversation-id>\` (`<= 500` lines; NEVER split into multi-file folders; use `./reports/{topic}/` ONLY when `deliverables.routing = workspace_reports` or explicitly requested) alongside `.boomopen/project-ledger.json`:
     - **Approval-Gate Plan (`PLAN-{project}.md`)**: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }`
     - **Progress / RTM Audit Report (`REPORT-autopilot-{project}.md`)**: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`
3. **Deterministic CLI Suite (`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ...`)**:
   - **Ledger Lifecycle**: `ledger init [--name <name>] [--docs <a.md,b.md>]` | `ledger from-plan <plan.md>` | `ledger validate [--strict-shards]` | `ledger status` | `ledger next` | `ledger verify --phase <id> [--passed-tests <N>]` | `ledger audit`
   - **Plan & Wave Execution**: `plan validate <plan.md> --sync-ledger` | `plan compile <plan.md>` | `cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"` | `cook packets <plan.md> --wave <n>` | `cook verify-wave <plan.md> --wave <n> --run-verify`
   - **Strict Code Gate**: `check <dir> --strict-phase --no-stubs`

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

Whenever the user asks in natural language to ingest multiple specification documents, build an entire multi-phase project from docs, resume/continue the next phase of a project, or audit 100% specification traceability across any of the 17 supported languages without typing `/autopilot`, automatically trigger this router:

| Language | Natural-Language Trigger Phrases (`init` / `run` / `audit`) |
|----------|-------------------------------------------------------------|
| **`en` (English)** | *"build the whole project from docs"*, *"initialize project roadmap/ledger"*, *"continue project"*, *"run next phase"*, *"audit spec coverage"* |
| **`vi` (Tiếng Việt)** | *"triển khai toàn bộ dự án theo bộ tài liệu"*, *"khởi tạo lộ trình nhiều phase"*, *"tiếp tục dự án"*, *"làm tiếp phase tiếp theo"*, *"kiểm toán độ phủ tài liệu"* |
| **`zh-CN` / `zh-TW`** | *"根据文档全自动开发整个项目"*, *"初始化多阶段路线图"*, *"继续项目下一阶段"* / *"根據文檔全自動開發整個專案"*, *"繼續專案下一階段"* |
| **`ja` (日本語)** | *"仕様書群からプロジェクト全体を自動構築して"*, *"次のフェーズを続行して"*, *"要件カバレッジを監査して"* |
| **`ko` (한국어)** | *"문서 기반으로 전체 프로젝트 자동 구축해줘"*, *"프로젝트 다음 단계 계속 진행해줘"*, *"요구사항 누락 감사해줘"* |
| **`es` / `pt-BR`** | *"construir todo el proyecto desde los documentos"*, *"continuar siguiente fase"* / *"construir o projeto completo pelos documentos"*, *"continuar próxima fase"* |
| **`fr` / `de` / `it`** | *"construire tout le projet depuis les specs"*, *"continuer la phase suivante"* / *"Gesamtprojekt aus Dokumenten bauen"*, *"nächste Phase fortsetzen"* / *"costruire l'intero progetto dai documenti"* |
| **`ru` / `tr`** | *"построить весь проект по документации"*, *"продолжить следующую фазу"* / *"tüm projeyi dokümanlardan inşa et"*, *"sonraki faza devam et"* |
| **`hi` / `ar`** | *"दस्तावेज़ों से पूरा प्रोजेक्ट बनाएं"*, *"अगला चरण जारी रखें"* / *"بناء المشروع بالكامل من الوثائق"*, *"متابعة المرحلة التالية"* |
| **`id` / `th`** | *"bangun seluruh proyek dari dokumen"*, *"lanjutkan fase berikutnya"* / *"สร้างโปรเจกต์ทั้งหมดจากเอกสาร"*, *"ทำเฟสต่อไปต่อเลย"* |

---

## 🧭 STATE-AWARE AUTO-ROUTING LOGIC

```
1. IF user explicitly specifies a subcommand:
   - `/autopilot:init`  → Load and execute `commands/autopilot-init.md`
   - `/autopilot:run`   → Load and execute `commands/autopilot-run.md`
   - `/autopilot:audit` → Load and execute `commands/autopilot-audit.md`

2. IF user invokes `/autopilot` (or triggers via Natural Language):
   - Inspect `.boomopen/project-ledger.json` and run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state --artifact-dir "<appDataDir>/brain/<conversation-id>"`:
     * Ledger NOT FOUND, BUT an approved `PLAN-{project}.md` already exists in `<appDataDir>\brain\<conversation-id>\`:
       → **Approved-Plan Fast-Bootstrap Gate**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger from-plan "<plan-path>"` (or `plan validate "<plan-path>" --sync-ledger`) + `ledger validate --strict-shards` to compile `.boomopen/project-ledger.json`, `.boomopen/contracts/SHARED_CONTRACT.md`, and `.boomopen/ROADMAP-PROGRESS.md` without re-scouting specs, then route immediately to `/autopilot:run` (`commands/autopilot-run.md`)!
     * Ledger NOT FOUND (and no approved `PLAN-{project}.md`, or user explicitly asks to ingest specs / initialize roadmap):
       → Route IMMEDIATELY to `/autopilot:init` (`commands/autopilot-init.md`)
     * Ledger FOUND AND user asks to audit / check omissions / verify RTM:
       → Route IMMEDIATELY to `/autopilot:audit` (`commands/autopilot-audit.md`)
     * Ledger FOUND AND `active_cursor` has pending phases/requirements (or user says "tiếp tục dự án" / "continue project" / "next phase"):
       → Route IMMEDIATELY to `/autopilot:run` (`commands/autopilot-run.md`)
     * Ledger FOUND AND 100% of phases are already verified (`status = verified`):
       → Route to `/autopilot:audit` (`commands/autopilot-audit.md`) for final E2E RTM verification
```

---

## 📋 AVAILABLE ROUTES

| Route | Workflow File | Core Responsibility & Deterministic Guarantees |
|-------|---------------|------------------------------------------------|
| **`/autopilot:init`** | `commands/autopilot-init.md` | **Phase 0 — Sharded Multi-Doc Ingestion & Zero-Omission Ledger Lock**: Fast-bootstrap via `ledger from-plan` / `plan compile` OR parallel `scouter#doc-1..N` + `reviewer#spec-auditor` Reverse Coverage Audit + `ledger init` + `ledger validate --strict-shards` + cohesive Brain `PLAN-{project}.md` / `REPORT-autopilot-{project}.md`. |
| **`/autopilot:run`** | `commands/autopilot-run.md` | **Phase K..N — Scoped Context Slice & 4-Layer Quality Ratchet**: `ledger next` (~2,000-token slice) + Direct Ledger/Plan-to-Executor Dispatch (`cook packets` + 0-turn `invoke_subagent` `<= 3–4 OWNED_FILES`/shard) + `cook verify-wave --run-verify` + `check --strict-phase --no-stubs` + `ledger verify --phase <id>`. |
| **`/autopilot:audit`** | `commands/autopilot-audit.md` | **Full RTM & Anti-Regression Audit**: `ledger audit` + `check --strict-phase --no-stubs` + parallel `reviewer#rtm`, `tester#regression`, and `security-engineer` verification → cohesive `<appDataDir>\brain\<conversation-id>\REPORT-autopilot-{project}.md`. |

---

## 🛡️ CORE MULTI-SESSION INVARIANTS (NON-NEGOTIABLE)

- **Zero Hand-Edited Status Flips**: Sub-agents MUST treat `.boomopen/project-ledger.json` as `READ_ONLY_FILES`. Only `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger verify --phase <id> --passed-tests <N>` may mark a phase `"verified"`.
- **SHA-256 Spec-Hash Drift Guard**: `ledger validate` verifies SHA-256 digests of every ingested `spec_documents[]` file on disk so spec edits are never silently ignored across sessions.
- **Prior-Phase Test Lock (`read_only_prior_tests`)**: Every test file verified in `Phase 1 .. K-1` is automatically locked in `READ_ONLY_FILES` during `Phase K` to guarantee monotonic test growth (`0` regressions).

## 💬 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 🏛️ Project Autopilot Mode Selection

1. 🗺️ **Initialize Ledger** → `/autopilot:init` (`commands/autopilot-init.md`) — Ingest specs or compile `PLAN` into `.boomopen/project-ledger.json`
2. 🚀 **Execute Next Phase** → `/autopilot:run` (`commands/autopilot-run.md`) — Run active phase slice with 4-Layer Quality Ratchet
3. 📊 **Audit RTM Coverage** → `/autopilot:audit` (`commands/autopilot-audit.md`) — Verify 100% spec traceability & 0 regressions
```
