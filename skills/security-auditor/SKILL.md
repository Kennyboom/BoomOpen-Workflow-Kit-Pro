---
name: security-auditor
description: Expert security auditor specializing in DevSecOps, OWASP Top 10, AI/LLM Agent Security, Better Auth / OAuth 2.1, and compliance frameworks.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "6.0.0"
---

# Security Auditor — 2-Layer Anti-Leakage Scanner v6, Route Census & Taint Audit (v6.0)

> **PURPOSE**: Enforce **2-Layer Zero-Blind-Spot Security** across modern full-stack, desktop/IPC, and AI/Agentic codebases:
> - **Layer 1 (Deterministic CLI Census & M1–M6 Static Gate)**: Zero-cap secret/PII/boundary scanning (`security_scan.py` + `security_rules.py`) paired with 100% deterministic entrypoint extraction (`route_census.py` via `--emit-routes`).
> - **Layer 2 (Dynamic Endpoint-Sharded Source-to-Sink Audit)**: Parallel `security-engineer#ep-1..k` shards (`<= 8–10` endpoints/shard) proving `audited_entrypoints == extracted_entrypoints` via the **8-Column Endpoint Security & Anti-Leakage Matrix** and **4 Source-to-Sink Taint Checklists**.

---

## 🔧 Layer 1: Automated Security, API & Schema Verification Gates

| Tool / CLI | Coverage & Purpose | Canonical Command |
|------------|--------------------|-------------------|
| `scripts/security_scan.py` | **M1–M6 Anti-Leakage & Route Census**: Tracked `.env`/keys/service-accounts/Dockerfile secrets (M1), provider tokens + Shannon entropy `>= 3.7` secrets (M2), `NEXT_PUBLIC_`/`VITE_` & `"use client"` DB leaks + Electron/sourcemap boundaries (M3), auth/cookie logs + `500` `err.stack`/`sqlMessage` JSON leaks + Web storage tokens (M4), multi-line SQLi (`$queryRawUnsafe` vs safe tagged `` sql`...` ``), command exec, traversal, `cors` + credentials, unverified `jwt.decode`, TLS & SSRF (M5), plus 100% entrypoint extraction (M6) | `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <project_path> --json --emit-routes [--strict-leaks]` |
| `api_validator.py` | Zero-cap backend route, `"use server"` action, tRPC procedure & OpenAPI contract validator with strict word-bounded auth guard detection | `python ~/.{TOOL}/skills/api-patterns/scripts/api_validator.py <project_path> [--json]` |
| `schema_validator.py` | Zero-cap Prisma & Drizzle schema validator with per-table foreign-key index checks and `--strict` non-zero exit enforcement | `python ~/.{TOOL}/skills/database-design/scripts/schema_validator.py <project_path> --strict [--json]` |
| `boomopen check` | Static Tier 1 safety gate (`0` explicit `any`, `0` hollow stubs, `0` deferred markers) | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 🔀 Layer 2: Dynamic Endpoint Sharding (`security-engineer#ep-1..k`)

1. **Extract 100% Entrypoints First (`0` Silent File Cap)**:
   - Run `security_scan.py <dir> --json --emit-routes` to enumerate every Next.js App/Pages route, `"use server"` exported async function, Express/Fastify/Hono/NestJS handler, tRPC `publicProcedure`/`protectedProcedure`, FastAPI/Flask route, Go/Rust HTTP route, Tauri `#[tauri::command]`, Electron `ipcMain.handle`/`ipcMain.on`, and AI `tool()` / MCP server tool.
2. **Shard by Endpoint Budget (`<= 8–10` Entrypoints / Shard)**:
   - Partition `route_census.entrypoints` into disjoint `security-engineer#ep-1..k` shards (`k = ceil(total / 9)`), keeping each shard within `<= 8–10` entrypoints (`<= 3–4` heavy files) so zero routes are skimmed or truncated.
   - Hard coverage invariant: **`audited_entrypoints == extracted_entrypoints`** (`100%` of census IDs `EP-001..EP-N` must appear in the final matrix).

---

## 🧭 Mandatory 4 Source-to-Sink Taint Checklists

1. **Checklist 1 — BOPLA & Outbound Read Leakage (`Read Source -> Serializer Sink`)**:
   - Enforce explicit DTO / column projection (`select`, `omit`, typed response schema) on every read query — never serialize raw ORM entities exposing `passwordHash`, `totpSecret`, billing keys, internal flags, or cross-tenant PII.
   - Block `500` responses from serializing `err.stack` / `sqlMessage`; forbid `(NEXT_PUBLIC|VITE|EXPO_PUBLIC|NUXT_PUBLIC|PUBLIC)_*` secrets, `"use client"` server-DB imports, `productionBrowserSourceMaps: true`, and auth header/cookie log dumps.
2. **Checklist 2 — BOLA, Mass Assignment & TOCTOU Writes (`Mutation Input -> DB State`)**:
   - Bind every write/delete/action query to server-verified caller identity + tenant ownership (`WHERE id = $1 AND org_id = $2`) — never trust client-supplied `userId`/`orgId` or `"use server"` hidden form arguments.
   - Enforce strict allowlist schemas (`z.object(...).strict()`) blocking `role`, `isAdmin`, `plan`, or `balance` mass assignment, and wrap balance/inventory/quota mutations in atomic transactions or conditional `UPDATE ... WHERE` guards against TOCTOU races.
3. **Checklist 3 — Injection, Traversal, SSRF, CORS & Webhook HMAC (`Untrusted Input -> OS/Net/DB Sink`)**:
   - Allow parameterized bindings / safe tagged `` sql`...${v}` `` only; ban `$queryRawUnsafe`, `$executeRawUnsafe`, interpolated `sql.raw()`, `eval`, `child_process.exec`, and `spawn(..., { shell: true })`.
   - Enforce `realpath` root-containment on file paths, DNS + IP-range allowlists on outbound `fetch` (blocking RFC 1918, `127.0.0.0/8`, `169.254.169.254`), non-wildcard `cors` when `credentials: true`, verified `jwt.verify()`, TLS verification (`rejectUnauthorized: true`), and raw-body `crypto.timingSafeEqual` HMAC + timestamp replay checks on webhooks.
4. **Checklist 4 — LLM, RAG & MCP / Agentic Tool Boundary (`Prompt/Context -> Tool/Output Sink`)**:
   - Isolate untrusted RAG chunks, web pages, emails, and tool results from system prompts; pre-filter vector search by caller `tenant_id` / `user_id` ACLs before similarity ranking.
   - Validate structured LLM outputs with Zod/JSON Schema before downstream SQL/HTML/URL sinks, sandbox MCP/`tool()` file/network scopes with human-in-the-loop confirmation on destructive actions, and enforce per-user rate/token/spend circuit breakers.

---

## 📊 Mandatory 8-Column Endpoint Security & Anti-Leakage Matrix

Every security review or `/security-audit` report MUST include this 8-column census table covering `100%` of extracted entrypoints (`audited_entrypoints == extracted_entrypoints`):

| ID (`EP-NNN`) | Entrypoint (`METHOD path/symbol`) | `file:line` | AuthN Guard | AuthZ / Tenant Scope (`BOLA`) | Input Schema | Response Projection / Anti-Leak (`BOPLA`) | Sink & Rate-Limit Verdict |
|---------------|-----------------------------------|-------------|-------------|-------------------------------|--------------|-------------------------------------------|---------------------------|
| `EP-001` | `POST /api/orders` | `app/api/orders/route.ts:14` | `getSession()` | `org_id == session.orgId` | `CreateOrderSchema` | `OrderPublicDto` (`0` internal fields) | Safe ORM + `20/min` limit (`PASS`) |

---

## 🔐 Modern Authentication (Better Auth & OAuth 2.1) & Vault References

- **OAuth 2.1 + Better Auth**: Enforce Authorization Code + PKCE (`S256`), exact redirect URIs, `HttpOnly; Secure; SameSite=Lax|Strict` session cookies (never store raw session JWTs/refresh tokens in `localStorage`/`sessionStorage`), CSRF protection on cookie mutations, and WebAuthn/Passkeys + TOTP MFA.
- **Specialized Vault Skills (`~/.{TOOL}/skills_library/`)**:
  - `owasp-llm-agent-security-2025/SKILL.md` — Indirect prompt injection, MCP sandboxing, RAG tenant ACLs.
  - `better-auth-typescript/SKILL.md` — Better Auth sessions, OAuth 2.1, Passkeys, multi-tenant RBAC.
  - `terraform-opentofu-production/SKILL.md` & `vulnerability-scanner/SKILL.md` — IaC policy gates & lockfile CVE auditing.

## 📄 Finding Remediation Format

Order findings `CRITICAL` → `HIGH` → `MEDIUM` → `LOW` with: (1) clickable `[file:line](file:///...)` + CWE/OWASP/Checklist tag, (2) step-by-step source-to-sink exploit scenario (redacting live secrets), and (3) non-bypassable patch diff verified by `security_scan.py --json --emit-routes` + regression tests.
