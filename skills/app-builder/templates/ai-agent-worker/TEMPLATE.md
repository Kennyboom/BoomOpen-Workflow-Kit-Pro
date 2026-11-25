---
name: ai-agent-worker
description: 2026 Stateful AI Agent Worker template. Cloudflare Agents SDK + Durable Objects, OpenAI Agents SDK / Claude Agent SDK, tool guardrails, eval harness, streaming UI.
---

# Stateful AI Agent Worker Template (2026 Edition)

> Production blueprint for long-lived, stateful **AI Agent Workers** with persistent memory, durable tool workflows, human-in-the-loop (HITL) approval gates, token/spend circuit breakers, real-time WebSocket/SSE streaming UI, and deterministic evaluation suites.

## Tech Stack

| Component | Edge / Durable Default (Recommended) | Node / Container Alternatives |
|-----------|--------------------------------------|-------------------------------|
| Agent Runtime | **Cloudflare Agents SDK** (`agents` + `AIChatAgent` on Durable Objects) | **OpenAI Agents SDK** (`@openai/agents`) or **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) |
| State & Memory | Durable Object SQLite (`this.sql`) + scheduled alarms (`this.schedule`) | PostgreSQL (`pgvector` + Drizzle) + Redis/BullMQ |
| Model Routing | `claude-sonnet-4-6` / `gpt-5.4` (reasoning) + `claude-haiku-4-5` / `gpt-4.1-mini` / `gemini-2.5-flash` (fast routing) | Vercel AI SDK (`ai` v5) / provider-native SDKs |
| Tool Contracts | **Zod v4** (`z.strictObject`, `z.uuid()`, `z.iso.datetime()`) | Pydantic v2 (Python workers) |
| Streaming UI | `agents/react` (`useAgent`, `useAgentChat`) + React 19 + Tailwind v4 | SSE / WebSocket streaming client |
| Verification | Vitest + deterministic tool/trajectory eval harness (`evals/*.eval.ts`) | Promptfoo / inspect-ai / pytest evals |

---

## Directory Structure

```
project-name/
├── src/
│   ├── server/
│   │   ├── index.ts             # Worker entrypoint: auth gate + routeAgentRequest()
│   │   ├── agent.ts             # Stateful Agent class (extends Agent<Env, AgentState>)
│   │   ├── tools/
│   │   │   ├── read-tools.ts    # Safe read-only tools (tenant-scoped)
│   │   │   └── action-tools.ts  # Guarded mutating tools (requiresApproval: true)
│   │   └── guardrails/
│   │       ├── budget.ts        # Per-run maxSteps, token & USD spend circuit breaker
│   │       └── sanitize.ts      # Untrusted RAG/tool-output prompt-injection isolation
│   ├── contracts/
│   │   └── agent.contract.ts    # Shared Zod v4 state, message & tool-call schemas
│   └── client/                  # React 19 streaming chat & tool-approval UI
│       ├── App.tsx
│       └── globals.css          # Tailwind v4 `@import "tailwindcss"; @theme { ... }`
├── evals/
│   ├── dataset.json             # Golden prompts, adversarial injection cases & expected tool calls
│   └── agent.eval.ts            # Automated trajectory, schema & refusal accuracy gate
├── wrangler.jsonc               # Durable Object bindings, SQLite migrations & AI Gateway
├── package.json
└── tsconfig.json
```

---

## Core Architecture Guardrails

| Layer | Mandatory 2026 Standard |
|-------|-------------------------|
| **Per-Session Isolation** | Route each user/workspace conversation to an isolated Durable Object instance (`orgId:threadId`) verified at the HTTP/WebSocket upgrade boundary before `routeAgentRequest`. |
| **Bounded Execution Loop** | Enforce hard `maxSteps` (e.g. `<= 12`), per-tool timeouts, and cumulative token/cost budgets on every agent turn to prevent runaway loops. |
| **Human-in-the-Loop (HITL)** | Pause destructive, financial, or external-communication tool calls in `"pending_approval"` state until the authenticated user confirms via signed UI action. |
| **Untrusted Context Isolation** | Delimit retrieved documents, webhooks, and tool outputs as untrusted data; validate all structured LLM outputs with `z.strictObject({...})` before hitting SQL, shell, or fetch sinks. |
| **Eval-Gated Shipping** | Run `npm run eval` in CI on golden + prompt-injection fixtures; fail builds when tool-selection accuracy drops or safety guardrails regress. |

---

## Setup Steps (Cloudflare Agents SDK + Wrangler)

1. Scaffold agent worker project:
   ```bash
   npm create cloudflare@latest {{name}} -- --template cloudflare/agents-starter
   cd {{name}}
   npm install agents ai zod
   npm install -D wrangler vitest typescript @cloudflare/workers-types
   ```

2. Configure Durable Object SQLite migration in `wrangler.jsonc`:
   ```jsonc
   {
     "name": "stateful-agent-worker",
     "main": "src/server/index.ts",
     "compatibility_date": "2026-01-01",
     "compatibility_flags": ["nodejs_compat"],
     "durable_objects": {
       "bindings": [{ "name": "TaskAgent", "class_name": "TaskAgent" }]
     },
     "migrations": [{ "tag": "v1", "new_sqlite_classes": ["TaskAgent"] }]
   }
   ```

3. Run local Durable Object dev server, unit tests & eval suite:
   ```bash
   npx wrangler dev
   npm test
   npm run eval
   ```
