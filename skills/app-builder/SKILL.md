---
name: app-builder
description: Main application building orchestrator (v5.5). Creates full-stack, mobile, and cross-platform applications from natural language requests using Contract-First 3-Wave Parallel Sharding, DESIGN_CONTRACT, PLAN validation, and deterministic CLI verification.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
version: 5.5.0
---

# App Builder — Full-Stack & Cross-Platform Application Orchestrator (v5.5)

> Analyzes user requests, selects the optimal 2026 tech stack, enforces pre-coding **Design (`DESIGN-{feature}.md`)** and **Plan (`PLAN-{feature}.md`)** CLI gates, and orchestrates specialist `role#shard` agents across **3 Contract-First Parallel Waves**.

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map first:

| File | Description | When to Read |
|------|-------------|--------------|
| [project-detection.md](project-detection.md) | Keyword matrix & project type detection | Starting a new project |
| [tech-stack.md](tech-stack.md) | 2026 stack defaults & alternatives | Selecting technologies |
| [agent-coordination.md](agent-coordination.md) | **3-Wave Contract-First Execution Topology (`boomopen cook`)** | Coordinating multi-agent `/cook` & `/code` waves |
| [scaffolding.md](scaffolding.md) | Directory structure & core foundational files | Scaffolding a new repository |
| [feature-building.md](feature-building.md) | Incremental feature slicing, blast radius & recovery | Adding features to an existing codebase |
| [templates/INDEX.md](templates/INDEX.md) | **15 Project Templates** | Bootstrapping from a starter template |

---

## 📦 Project Templates (15)

Quick-start scaffolding for greenfield projects. **Read only the matching template:**

| Template | Tech Stack | When to Use |
|----------|------------|-------------|
| [nextjs-fullstack](templates/nextjs-fullstack/TEMPLATE.md) | Next.js 16 + Drizzle/Prisma + Tailwind v4 | Full-stack web app |
| [nextjs-saas](templates/nextjs-saas/TEMPLATE.md) | Next.js 16 + Stripe + Better Auth | SaaS product |
| [nextjs-static](templates/nextjs-static/TEMPLATE.md) | Next.js 16 + Motion v12 | Editorial / marketing site |
| [astro-static](templates/astro-static/TEMPLATE.md) | Astro + MDX | Content / docs / blog site |
| [nuxt-app](templates/nuxt-app/TEMPLATE.md) | Nuxt + Pinia | Vue full-stack app |
| [express-api](templates/express-api/TEMPLATE.md) | Hono / Express + Zod v4 OpenAPI | Node/Edge API service |
| [python-fastapi](templates/python-fastapi/TEMPLATE.md) | Python 3.12+ + `uv` + FastAPI + Pydantic v2 | Python API / AI service |
| [mcp-server](templates/mcp-server/TEMPLATE.md) | `@modelcontextprotocol/sdk` + Hono / `FastMCP` + OAuth 2.1 | MCP Server & interactive MCP App |
| [ai-agent-worker](templates/ai-agent-worker/TEMPLATE.md) | Cloudflare Agents SDK + Durable Objects / Agent SDKs | Stateful AI Agent Worker |
| [react-native-app](templates/react-native-app/TEMPLATE.md) | Expo SDK 54+ + React Native + NativeWind + Zustand | iOS / Android mobile app |
| [flutter-app](templates/flutter-app/TEMPLATE.md) | Flutter + Riverpod | Cross-platform mobile app |
| [electron-desktop](templates/electron-desktop/TEMPLATE.md) | Tauri v2 (primary) / Electron 35+ + React 19 | Desktop application |
| [chrome-extension](templates/chrome-extension/TEMPLATE.md) | Chrome MV3 + React 19 | Browser extension |
| [cli-tool](templates/cli-tool/TEMPLATE.md) | Node.js / TypeScript CLI | Developer CLI tool |
| [monorepo-turborepo](templates/monorepo-turborepo/TEMPLATE.md) | Turborepo + pnpm workspaces | Multi-package monorepo |

---

## 🔗 Canonical Specialist Agents (`agents/*.md`)

| Agent (`role#shard`) | Primary Responsibility in `/cook` & `/code` |
|----------------------|---------------------------------------------|
| `scouter` (`#1..k`) | Codebase mapping, dependency & caller blast-radius discovery (`SCOUT-{feature}.md`) |
| `designer` | 6-Block `DESIGN-{feature}.md` (`<= 500` lines, `RequestFeedback: true`) & `DESIGN_CONTRACT` |
| `planner` | 6-Block `PLAN-{feature}.md` (`SHARED_CONTRACT`, Wave DAG, `<= 3–4 OWNED_FILES`/shard) |
| `tech-lead` | Architecture governance, contract lock, `:team` Diamond arbitration |
| `database-architect` (`#schema`) | Wave 1 schema DDL, Drizzle/Prisma models, indexes & reversible migrations |
| `backend-engineer` (`#contracts`, `#api-1..k`) | Wave 1 shared DTO/Zod/OpenAPI contracts → Wave 2 parallel API/service shards |
| `frontend-engineer` (`#tokens-primitives`, `#screen-1..k`) | Wave 1 `@theme` CSS tokens & 5-state primitives → Wave 2 parallel screen shards |
| `mobile-engineer` (`#1..k`) | iOS 18 (`44pt`) / Android M3 Expressive (`48dp`) screens, safe-area & offline sync |
| `game-engineer` (`#1..k`) | 60fps ECS/WebGPU/Three.js/Godot/Unity loops, object pooling & physics |
| `tester` / `reviewer` / `security-engineer` | Wave 3 parallel unit/E2E testing, adversarial code review & OWASP audit |
| `devops-engineer` | Wave 3 preview server, CI/CD pipeline, containerization & health checks |

---

## ⚡ 3-Wave Contract-First Build Lifecycle (Summary)

```text
0. PRE-CODE CLI GATES (Mandatory for > 2 files)
   ├─ UI Spec: DESIGN-{feature}.md → `boomopen design validate` + `boomopen design contract`
   └─ Plan:    PLAN-{feature}.md   → `boomopen plan validate` + `boomopen cook packets`
1. WAVE 1 — FOUNDATION & CONTRACTS LOCK (Parallel)
   ├─ `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives`
   └─ Gate: `boomopen cook verify-wave <PLAN.md> --wave 1`
2. WAVE 2 — FEATURE SHARDS (Parallel, <= 3–4 OWNED_FILES per role#shard)
   ├─ `backend-engineer#api-1..k` + `frontend-engineer#screen-1..k` (+ `mobile-engineer#1..k` / `game-engineer#1..k`)
   └─ Gate: `boomopen cook verify-wave <PLAN.md> --wave 2` + `boomopen check <dir> --strict-phase --no-stubs`
3. WAVE 3 — PARALLEL VERIFICATION & PREVIEW
   └─ `tester` + `reviewer` + `security-engineer` + `devops-engineer` (`scripts/checklist.py`)
```

> See [agent-coordination.md](agent-coordination.md) for the complete 3-Wave topology and CLI gate commands.
