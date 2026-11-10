---
name: api-patterns
description: API design principles and contract-first architecture for 2026 (v5.5). REST vs GraphQL vs tRPC/Hono RPC selection, Wave 1 SHARED_CONTRACT Zod/OpenAPI schemas, structured logging, RFC 9457 errors, and automated API validation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 5.5.0
---

# API Patterns (v5.5 — 2026 Contract-First Edition)

> API design principles and contract-first execution for 2026.
> **Lock the API contract in Wave 1 (`SHARED_CONTRACT`) so Backend and Frontend shards build in parallel with zero field-name drift.**

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map first:

| File | Description | When to Read |
|------|-------------|--------------|
| [api-style.md](api-style.md) | REST vs GraphQL vs tRPC / Hono RPC decision tree | Choosing API style |
| [rest.md](rest.md) | Resource naming, HTTP methods, status codes (`201`, `204`, `409`, `422`) | Designing REST endpoints |
| [response.md](response.md) | Envelope pattern, RFC 9457 Problem Details, cursor pagination | Response & error shapes |
| [graphql.md](graphql.md) | Schema design, DataLoader N+1 prevention, query depth limits | Designing GraphQL APIs |
| [trpc.md](trpc.md) | TypeScript monorepo end-to-end type safety | TS full-stack RPC |
| [versioning.md](versioning.md) | URI / Header / Query versioning | API evolution planning |
| [auth.md](auth.md) | Better Auth, OAuth 2.1, Passkeys/WebAuthn, JWT, RBAC/BOLA | Auth & authorization |
| [rate-limiting.md](rate-limiting.md) | Token bucket, sliding window, idempotency keys | Abuse & retry protection |
| [documentation.md](documentation.md) | OpenAPI 3.1 / `@hono/zod-openapi` generation | Spec documentation |
| [security-testing.md](security-testing.md) | OWASP API Top 10, BOLA/BFLA object-level authz testing | Security audits |

---

## 🤝 Wave 1 `SHARED_CONTRACT` Pattern (`backend-engineer#contracts`)

In multi-agent `/plan`, `/cook`, and `/code` workflows, `backend-engineer#contracts` materializes shared Zod/OpenAPI schemas and RFC 9457 error shapes in **Wave 1** (`src/contracts/*.contract.ts`) so **Wave 2** `backend-engineer#api-1..k` and `frontend-engineer#screen-1..k` execute **in parallel** with `src/contracts/*` locked in `READ_ONLY_FILES`:

```ts
// src/contracts/orders.contract.ts (Wave 1 — Locked in SHARED_CONTRACT)
import { z } from 'zod';

export const CreateOrderInputSchema = z.object({
  items: z.array(z.object({ sku: z.string().min(1), quantity: z.number().int().positive() })).min(1),
  idempotencyKey: z.string().uuid(),
});

export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'paid', 'failed']),
  totalCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const ApiProblemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  code: z.enum(['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'CONFLICT', 'INTERNAL_ERROR']),
  detail: z.string(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type ApiProblem = z.infer<typeof ApiProblemSchema>;
```

---

## 🔗 Related Skills (2026 Stack)

| Need | Skill Path |
|------|------------|
| Edge/Node RPC & OpenAPI 3.1 (`Hono` + `@hono/zod-openapi`) | `../../skills_library/hono-rpc-zod-openapi/SKILL.md` (`skills_library/hono-rpc-zod-openapi/SKILL.md`) |
| Model Context Protocol (`MCP` / `FastMCP` Servers) | `../../skills_library/mcp-server-fastmcp-2025/SKILL.md` (`skills_library/mcp-server-fastmcp-2025/SKILL.md`) |
| TypeScript Auth, Passkeys, OAuth 2.1 & 2FA (`Better Auth`) | `../../skills_library/better-auth-typescript/SKILL.md` (`skills_library/better-auth-typescript/SKILL.md`) |
| Database Schema, Migrations & Indexing | `../database-design/SKILL.md` (`skills/database-design/SKILL.md`) |
| Security Auditing & OWASP API Top 10 | `../security-auditor/SKILL.md` (`skills/security-auditor/SKILL.md`) |

---

## 🛡️ Production API Standards & Structured Logging Mandate

- **Boundary Validation**: Validate `body`, `query`, and `params` at the entry point (`safeParse` / `zValidator` / Pydantic v2) before calling service logic.
- **Explicit Error Handling & Status Codes**: Wrap async/IO boundaries in `try/catch` or centralized typed error middleware (`onError`, `HTTPException`, `TRPCError`, `ApiError`) returning RFC 9457 Problem Details — never leak stack traces or SQL errors.
- **Structured Logger Mandate (Zero `console.log`)**: Use a structured logger (`pino`, `winston`, `logger.info/warn/error` with `requestId` / correlation IDs) in API handlers and services. **NEVER leave raw `console.log(...)` in production API routes** (flagged by both `api_validator.py` and `boomopen check`).
- **Resource-Level Authorization (Anti-BOLA)**: Enforce tenant/user ownership checks (`WHERE id = $1 AND org_id = $2`) on every read/write mutation, not just route-level auth middleware.

---

## 🔧 Automated API Verification Gates

Run both gates on every modified API directory before marking a backend task complete:

| Tool / Script | Purpose | Command |
|---------------|---------|---------|
| **API Validator** | Checks error handling, status codes, schema validation, auth & structured logging | `python ~/.{TOOL}/skills/api-patterns/scripts/api_validator.py <project_path>` |
| **Pragmatic 2-Tier & Anti-Stub Gate** | Rejects explicit `any`, `console.log`, `TODO`s, and hollow stubs | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_path> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.
