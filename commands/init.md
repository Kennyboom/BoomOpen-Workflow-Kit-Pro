---
description: Bootstrap a new project. Set up folder structure, git, .brain/, and initial configuration.
category: setup
execution-mode: execute
version: "5.5"
---

# /init — Contract-First Project Bootstrap (v5.5)

> **MISSION**: Bootstrap a clean, production-grade project skeleton with strict TypeScript/tooling, modular architecture, session context, and verified green build/lint/CLI gates from minute zero.

<task>$ARGUMENTS</task>

---

## ⚡ TURN-1 DISCOVERY & PARALLEL SCAFFOLDING SHARDS

1. **Autonomous-First Discovery**: Infer project name, app type, and stack from `$ARGUMENTS` when provided; call `ask_question` **only** for genuinely missing choices (App Type, Stack Preference, Project Name).
2. **Sharded Multi-File Bootstrap (`> 2` Files)**:
   - Because scaffolding creates `> 2` files across tooling, source skeleton, and docs, lock a **`SHARED_CONTRACT`** (project root path, `package.json` scripts, `tsconfig.json` strict compiler options & path aliases, `.env.example` keys) first.
   - Execute Wave 1 root toolchain setup, then fan out parallel Wave 2 shards via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")` with disjoint **`OWNED_FILES` (`≤ 3–4` files/shard)** and **`READ_ONLY_FILES`** locking root config files (`package.json`, `tsconfig.json`).

### Recommended 2026 Default Stacks (When User Asks to Recommend)

| Project Type | Framework / Runtime | Database / ORM | Styling / UI | Hosting Target |
|--------------|---------------------|----------------|--------------|----------------|
| **Web App** | Next.js (App Router, TS) | PostgreSQL + Drizzle / Prisma | Tailwind CSS v4 | Vercel / Cloudflare |
| **Mobile App** | React Native + Expo | SQLite / Supabase | NativeWind | EAS |
| **Desktop App** | Tauri v2 + React (TS) | SQLite | Tailwind CSS v4 | GitHub Releases |
| **Backend API** | Fastify / Hono (Node TS) | PostgreSQL + Drizzle | — | Railway / Fly.io |
| **CLI Tool** | Node.js + TypeScript | — | — | npm |

---

## 🌊 Phase 1 (Wave 1): Toolchain, Git & `SHARED_CONTRACT` Foundation

Create the target project directory (if no active workspace exists on Antigravity, create `<scratch>/<project-name>` and advise setting it as the active workspace) and lock the root toolchain (`devops-engineer#toolchain`, `OWNED_FILES ≤ 4` config files):
- `package.json` (with `dev`, `build`, `test`, `lint`, `typecheck` scripts)
- `tsconfig.json` (`"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`)
- `.gitignore`, `.env.example` (placeholder keys only, zero real secrets), ESLint/Biome + Prettier + Vitest config
- Install core dependencies via `run_command` (`npm install` / `pnpm install`)

---

## 🌊 Phase 2 (Wave 2 — Parallel Shards): Source Skeleton, Docs & Session Context

Launch parallel `TypeName: "self"`, `Model: "inherit"` shards with `package.json` and `tsconfig.json` locked in `READ_ONLY_FILES`:

| Parallel Shard | Disjoint `OWNED_FILES` (`≤ 3–4` Files) | Responsibility |
|----------------|----------------------------------------|----------------|
| **`frontend-engineer#shell` / `backend-engineer#core`** | `src/types/index.ts`, `src/constants/index.ts`, `src/services/health.ts` (+ entry route/view) | Clean typed skeleton (`0` explicit `any`, `0` debug `console.log`, structured logger/health check) + `tests/health.test.ts` |
| **`technical-writer#docs`** | `docs/BRIEF.md`, `README.md` | Concise Project Brief (`What`, `Why`, `Who`, `Tech Stack`, `MVP Scope`, `Explicit Non-Goals`) + quickstart `README.md` |

```text
<project-name>/
├── docs/
│   ├── BRIEF.md             # MVP scope, stack & explicit non-goals
│   └── specs/               # Feature specs (populated via /plan or /architect)
├── src/
│   ├── components/          # UI components (Web/Mobile/Desktop)
│   ├── services/            # Cohesive business logic
│   ├── types/               # Concrete TypeScript interfaces & Zod schemas
│   ├── constants/           # SCREAMING_SNAKE_CASE configuration constants
│   └── utils/               # Shared pure helpers
├── tests/                   # Baseline smoke test (Vitest)
├── .env.example             # Safe placeholder env template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Antigravity 2.0 Session Context (Clean Git Tree Default)
- Write initial project handover state to `<appDataDir>\brain\<conversation-id>\SESSION-HANDOVER.md` with `ArtifactMetadata: { Summary: "Initialized project stack, directory contract, and MVP brief", UserFacing: true, RequestFeedback: false }`.
- Create workspace `.brain/brain.json` and `.brain/session.json` **only** if the user explicitly wants repo-committed `.brain/` files (otherwise keep the Git tree clean!).

---

## ✅ Phase 3: Persistent End-to-End Verification & Handover

Run every verification gate via `run_command` and iteratively fix any issue before reporting back:

```bash
# 1. Strict TypeScript compilation & baseline smoke test
npm run typecheck && npm test

# 2. BoomOpen Pragmatic 2-Tier & anti-stub verification (MUST exit 0)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project-dir> --strict-phase --no-stubs

# 3. Initialize Git repository with clean initial commit (when git is not yet initialized)
git init && git add . && git commit -m "chore: initialize project skeleton"
```
*(Optional for web apps: verify dev server health with `python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py start` → `check` → `stop`.)*

Present the initialized workspace summary in the user's language with clickable links to `[BRIEF.md](file:///...)`, `[package.json](file:///...)`, and `[SESSION-HANDOVER.md](file:///...)`, plus next steps:
1. `/plan:hard` or `/architect` — Design MVP architecture & sharded implementation plan
2. `/brainstorm:team` — Explore product features and UX flows
3. `/cook:hard` — Build the first MVP feature end-to-end
