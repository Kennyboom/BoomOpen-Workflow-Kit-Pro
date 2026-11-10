---
description: "📝 Report Router — Evidence-mined reporting router (`/report:fast`, `/report:hard`, `/report:team`) with Zero-Fiction CLI Telemetry & Cohesive Brain Artifacts"
version: "5.5"
category: documentation
execution-mode: router
---

# /report — Evidence-Mined Reporting Router (`v5.5`)

> **ROUTER DIRECTIVE**: Analyze the reporting scope, mine deterministic workspace telemetry, and route to `/report:fast`, `/report:hard`, or `/report:team`. Supports three output modes — **create a single cohesive `REPORT-{topic}.md`**, **update existing documentation**, or **generate from a user-supplied template**.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, TELEMETRY & BRAIN ARTIFACT ROUTING

1. **Zero Pre-Flight Tax (`0-Turn` Native Dispatch)**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — load the target `commands/report-*.md` and launch Turn-1 sub-agents **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`, reusing warm sessions via `send_message`.
2. **Deterministic Zero-Fiction Telemetry Commands (`RPT-G1`)**:
   Every metric, pass rate, file count, or milestone percentage in any `/report` deliverable MUST trace to live CLI/git outputs or verified Brain artifacts — **zero estimated or fabricated numbers**:
   - `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js cook state` — active Brain artifacts & wave execution state
   - `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` — multi-phase roadmap & verified requirements progress (when `.boomopen/project-ledger.json` exists)
   - `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir>` — Tier 1 / Tier 2 code quality & line-budget health audit
   - `git status --short` & `git log --stat -n 20` — empirical repository change history
3. **Single Cohesive Brain Artifact Default (`<= 500` Lines)**:
   - **Master Report**: Write **1 single cohesive file** to `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` (`<= 500` lines — **NEVER** split into multi-file folders!) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`. Write to `./reports/{topic}/REPORT-{topic}.md` **ONLY** if explicitly requested by the user (or on non-Antigravity environments without `<appDataDir>`).
   - **Transient Telemetry / Mailbox Logs**: Route `<appDataDir>\brain\<conversation-id>\SCOUT-report-*.md` and `MAILBOX-{date}.md` with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`.

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks for a status report, executive summary, post-mortem, or structured engineering report without typing `/report`, trigger this router automatically:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"write a report"*, *"generate an executive summary"*, *"status report"*, *"summarize findings into a report"* |
| **`vi` (Tiếng Việt)** | *"viết báo cáo"*, *"tổng hợp báo cáo"*, *"báo cáo tiến độ / tổng kết"*, *"xuất file report"* |
| **`zh-CN` / `zh-TW`** | *"生成报告"*, *"编写总结报告"*, *"状态报告"* / *"生成報告"*, *"編寫總結報告"* |
| **`ja` (日本語)** | *"レポートを作成して"*, *"調査結果をレポートにまとめて"*, *"進捗報告"* |
| **`ko` (한국어)** | *"보고서 작성해줘"*, *"요약 보고서 생성"*, *"진행 상황 리포트"* |
| **`es` / `pt-BR`** | *"crear un informe"*, *"generar reporte ejecutivo"* / *"criar um relatório"*, *"relatório executivo"* |
| **`fr` / `de` / `it`** | *"rédiger un rapport"* / *"Bericht erstellen"*, *"Zusammenfassung schreiben"* / *"creare un rapporto"* |
| **`ru` / `tr`** | *"составить отчёт"*, *"написать сводный отчёт"* / *"rapor oluştur"*, *"özet rapor yaz"* |
| **`hi` / `ar`** | *"रिपोर्ट तैयार करें"*, *"सारांश रिपोर्ट"* / *"إعداد تقرير"*, *"ملخص تنفيذي"* |
| **`id` / `th`** | *"buat laporan"*, *"ringkasan eksekutif"* / *"เขียนรายงาน"*, *"สรุปรายงาน"* |

---

## 🎯 INTENT DETECTION & OUTPUT MODES (MANDATORY)

> ⛔ **ALL `/report` WORKFLOWS PRODUCE REPORTS / DOC UPDATES ONLY — ZERO APPLICATION CODE.**
> - ❌ NEVER write or modify application source code (`READ_ONLY_FILES` lock on 100% of code/test files).
> - ❌ NEVER auto-transition to `/code`, `/cook`, or `/fix` after completing a report — present the deliverable link and **STOP**.
> - ✅ Write reports in the **same language the user communicates with you** (technical identifiers in English; escape literal currency dollars as `\$`).

| Mode | User Intent | Reporter Action |
|------|-------------|-----------------|
| **Create report** | Wants a **new** status, audit, post-mortem, or executive report | Mine telemetry → write single cohesive `<appDataDir>\brain\<conversation-id>\REPORT-{topic}.md` (`<= 500` lines, `UserFacing: true, RequestFeedback: false`; `./reports/{topic}/` **only** if explicitly requested). |
| **Update existing** | Wants findings reflected in **existing** docs (`README.md`, specs, changelogs) | Scout & verify → edit only the targeted documentation files; do not emit an extra standalone report unless requested. |
| **From template** | Supplies a custom **format, schema, or template** | Mine verified telemetry → populate the exact user-specified template with zero fabricated metrics. |

---

## 🔀 ROUTING LOGIC & AVAILABLE ROUTES

```
IF quick status check / standup summary (≤ 2 known sources, 1 domain):
  → Route to /report:fast (commands/report-fast.md)

IF comprehensive multi-file analysis, update-existing docs, or template-based report (> 2 files — Default for auto):
  → Route to /report:hard (commands/report-hard.md)

IF executive / stakeholder audit report OR execution.mode = team:
  → Route to /report:team (commands/report-team.md)
```

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| `/report:fast` | `commands/report-fast.md` | Rapid CLI-verified status summaries & standup updates (`≤ 2` known sources or 1-step `reporter`) |
| `/report:hard` | `commands/report-hard.md` | Deep multi-source synthesis (`> 2` files), updating existing docs, or custom template generation |
| `/report:team` | `commands/report-team.md` | 2-Stage Evidence-Mined Elastic Golden Diamond (`agents/teams/report-team/_team.md`, `RPT-G1..G4`) |

### Mandatory Quality Gates Across All Routes (`RPT-G1..G4`)
- **`RPT-G1` (100% Provenance & Math Accuracy)**: Every number, ratio, pass rate, and milestone figure traces to CLI/git/artifact evidence.
- **`RPT-G2` (Executive Signal First)**: Leads with a standalone 5-bullet Executive Summary (`Status`, `Completed`, `Blockers/Risks`, `Key Metrics`, `Next Decisions`).
- **`RPT-G3` (Actionable Next Steps)**: Prioritized `P0–P2` actions naming concrete target files or commands (`0` generic platitudes).
- **`RPT-G4` (Single-File Cohesion & Visuals)**: Single cohesive `REPORT-{topic}.md` (`<= 500` lines), clickable `file:///` links, quoted Mermaid `xychart-beta` / `flowchart TD/LR` labels (`id["Label (Metric)"]`), and escaped `\$` currency.

---

## 📋 PRESENT OPTIONS (Only when `workflows.defaultVariant = ask`)

```markdown
## 📝 Reporting Mode Selection

**Task**: [parsed task]

1. ⚡ **Fast** → `/report:fast` — Concise CLI-verified status summary (`commands/report-fast.md`)
2. ⚡⚡⚡ **Hard** → `/report:hard` — Comprehensive report, doc update, or template output (`commands/report-hard.md`)
3. 💎 **Team** → `/report:team` — 2-Stage Elastic Golden Diamond with metric audit (`commands/report-team.md`)

⏳ Awaiting selection...
```
