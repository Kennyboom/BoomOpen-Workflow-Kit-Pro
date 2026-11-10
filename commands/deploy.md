---
description: "🚀 Deploy Router — Route to pre-deployment verification, preview/staging, production release, or emergency rollback"
version: "5.5"
category: operations
execution-mode: router
---

# /deploy — Deployment & Release Router

> **ROUTER DIRECTIVE**: Inspect deployment target and workspace readiness, enforce deterministic pre-deploy verification (`check --strict-phase --no-stubs`), and route immediately to `/deploy:check`, `/deploy:preview`, `/deploy:production`, or `/deploy:rollback`.

<target>$ARGUMENTS</target>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, PRE-DEPLOY GATE & ARTIFACT CONTRACT

1. **Zero Pre-Flight Tax & 0-Turn Sub-agent Dispatch**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — route and launch Phase 1 specialists (`devops-engineer#1..k`, `security-engineer`, `tester`, `reviewer`) **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`.
2. **Deterministic Pre-Deploy Quality Gate**: Gate deployment readiness and releases with:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs
   ```
   *(When `.boomopen/project-ledger.json` exists, also run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js ledger status` to confirm requirement verification status.)*
3. **Cohesive Single-File Brain Artifact (`<= 500` lines, Clean Git Tree)**: Write every deployment readiness, release, or rollback report as **1 single cohesive Brain Artifact** `<appDataDir>\brain\<conversation-id>\REPORT-deploy-{env}.md` (`env` = `check` | `preview` | `production` | `rollback`, `<= 500` lines; never split into `{name}/` folders or write to `./reports/` by default) with explicit `ArtifactMetadata`:
   - Autonomous readiness / preview / post-deploy / rollback report: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`
   - Pre-production human Go/No-Go checkpoint: `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }`

---

## 🌐 Multilingual Natural-Language Auto-Triggers (17 Supported Languages)

When the user asks to verify deployment readiness, deploy to staging/preview or production, or roll back a release in natural language without typing `/deploy`, trigger this router automatically:

| Language | Natural-Language Trigger Phrases |
|----------|----------------------------------|
| **`en` (English)** | *"deploy to staging/production"*, *"check deployment readiness"*, *"ship release"*, *"rollback deployment"* |
| **`vi` (Tiếng Việt)** | *"deploy lên staging/production"*, *"kiểm tra trước khi deploy"*, *"triển khai hệ thống"*, *"rollback bản vừa deploy"* |
| **`zh-CN` / `zh-TW`** | *"部署到测试/生产环境"*, *"上线检查"*, *"回滚部署"* / *"部署到測試/正式環境"*, *"回滾部署"* |
| **`ja` (日本語)** | *"ステージング/本番環境にデプロイして"*, *"デプロイ前チェック"*, *"ロールバックして"* |
| **`ko` (한국어)** | *"스테이징/프로덕션 배포해줘"*, *"배포 전 점검"*, *"배포 롤백해줘"* |
| **`es` / `pt-BR`** | *"desplegar a producción/staging"*, *"revertir despliegue"* / *"fazer deploy em produção/staging"*, *"reverter deploy"* |
| **`fr` / `de` / `it`** | *"déployer en production"* / *"auf Produktion deployen"* / *"distribuire in produzione"* |
| **`ru` / `tr`** | *"задеплоить в продакшен"*, *"откатить релиз"* / *"canlıya (prod) çık"*, *"dağıtımı geri al"* |
| **`hi` / `ar`** | *"प्रोडक्शन में डिप्लॉय करें"* / *"نشر في بيئة الإنتاج"*, *"التراجع عن النشر"* |
| **`id` / `th`** | *"deploy ke produksi/staging"* / *"ดีพลอยขึ้นโปรดักชัน/สเตจจิง"* |

---

## 🔀 ROUTING LOGIC & AVAILABLE ROUTES

```
IF target is "check", "readiness", or unspecified pre-flight audit:
  → Route to /deploy:check (commands/deploy-check.md)

IF target is "preview", "staging", or "dev":
  → Route to /deploy:preview (commands/deploy-preview.md)

IF target is "production", "prod", or "release":
  → Route to /deploy:production (commands/deploy-production.md)

IF target is "rollback", "revert", or emergency recovery:
  → Route to /deploy:rollback (commands/deploy-rollback.md)
```

| Route | Workflow File | When to Use |
|-------|---------------|-------------|
| `/deploy:check` | `commands/deploy-check.md` | Parallel 4-track pre-deployment readiness audit across code quality, tests, security, and infra |
| `/deploy:preview` | `commands/deploy-preview.md` | Deploy to preview/staging with `check --strict-phase --no-stubs` gate and live smoke tests |
| `/deploy:production` | `commands/deploy-production.md` | Production release with parallel safety gates, human Go/No-Go checkpoint, and health verification |
| `/deploy:rollback` | `commands/deploy-rollback.md` | Emergency revert to last-known-good release, restoration smoke tests, and root-cause triage |

---

## 📋 PRESENT OPTIONS (Only when target is ambiguous or `workflows.defaultVariant = ask`)

Use `ask_question` when available (or present this concise menu):

```markdown
## 🚀 Deployment Mode Selection

**Target**: [parsed target]

1. ✅ **Check** → `/deploy:check` — Parallel readiness verification (`commands/deploy-check.md`)
2. 🔍 **Preview** → `/deploy:preview` — Staging/preview deployment (`commands/deploy-preview.md`)
3. 🚀 **Production** → `/deploy:production` — Production release with safety gates (`commands/deploy-production.md`)
4. ⏪ **Rollback** → `/deploy:rollback` — Revert to previous stable release (`commands/deploy-rollback.md`)

⏳ Awaiting selection...
```
