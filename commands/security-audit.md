---
description: >-
  Fortress Builder v3 — OWASP Top 10 scan, STRIDE Threat Modeling,
  Auth/Authorization audit, Data Protection, API Security,
  Frontend/Infrastructure hardening, Supply Chain, and Zero Trust.
  Creates Security Report with severity scoring.
category: security
execution-mode: execute
version: "5.5"
---

# /security-audit — Fortress Builder v6 (2-Layer Anti-Leakage Scanner, Route Census & Parallel Taint Shards)

> **MISSION**: Execute a 2-Layer Zero-Trust security & anti-leakage audit — **Layer 1 deterministic M1–M6 CLI scanning + 100% entrypoint extraction (`--emit-routes`)** followed by **Layer 2 dynamic `security-engineer#ep-1..k` source-to-sink taint sharding** — producing **1 proof-backed `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md`** (`<= 500` lines).

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 PARALLEL DISPATCH, DYNAMIC ENDPOINT SHARDING & READ-ONLY LOCK

1. **Valid Antigravity 2.0 Toolset**: Use `read_file`, `run_command`, `search_web`, `write_file`, `edit_file`, `invoke_subagent`, `send_message`, and `ask_question`.
2. **2-Layer Dynamic Endpoint Sharding (`<= 8–10` Endpoints / Shard)**:
   - For `<= 2` known files, run the Layer 1 CLI gates + `read_file` taint audit directly.
   - For `> 2` files or multi-route apps, run `security_scan.py <target-dir> --json --emit-routes` on Turn 1 alongside specialist shards, partitioning `route_census.entrypoints` across **`security-engineer#ep-1..k`** (`<= 8–10` endpoints / `<= 3–4` heavy files per shard) plus **`security-engineer#ui-infra`** and **`security-engineer#supply-ai`** via `invoke_subagent(TypeName: "self", Model: "inherit")`. Track `role#shard -> conversationId` for warm `send_message` verification.
3. **🛡️ `READ_ONLY_FILES` Audit Lock**: Lock **100% of repository source, config, and test files** in `READ_ONLY_FILES` during audit phases. Shards return structured findings via `send_message` or disjoint scratch files (`REVIEW-security-{topic}-s{1..k}.md`, `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`).
4. **Cohesive Single-File Deliverable**: Write `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md` (`<= 500` lines, zero `{name}/` folder splits) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`.
5. **Skill References (Load On-Demand in Shards)**: `~/.{TOOL}/skills/security-auditor/SKILL.md` plus `~/.{TOOL}/skills_library/{stride-analysis-patterns,vulnerability-scanner,broken-authentication,api-security-best-practices,owasp-llm-agent-security-2025}/SKILL.md` when installed.

---

## 🔍 Phase 1 (Layer 1 + Layer 2 Parallel Fan-Out): M1–M6 Scanners + Endpoint-Sharded Taint Audit

Run the deterministic Layer 1 scanners via `run_command` in parallel with specialist shards:

```bash
# 1. Layer 1 M1-M6 vulnerability, secret/PII leak & 100% entrypoint route census
python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <target-dir> --json --emit-routes

# 2. Zero-cap API auth/validation & strict DB FK/schema audits
python ~/.{TOOL}/skills/api-patterns/scripts/api_validator.py <target-dir> --json
python ~/.{TOOL}/skills/database-design/scripts/schema_validator.py <target-dir> --strict --json

# 3. Tier 1 code safety & dependency CVE audit (Node / Python / Rust as applicable)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs
npm audit --audit-level=moderate
```

| Parallel Shard | Disjoint Scope (`READ_ONLY_FILES`) | Mandatory Audit Focus |
|----------------|------------------------------------|-----------------------|
| **`security-engineer#ep-1..k`** | `<= 8–10` entrypoints (`EP-NNN`) / `<= 3–4` route/action/IPC files per shard | Audit every assigned HTTP route, Next.js handler, `"use server"` action, tRPC procedure, Tauri `#[tauri::command]`, and Electron IPC handler against **Taint Checklists 1–3** + AuthN/OAuth2.1/Better-Auth |
| **`security-engineer#ui-infra`** | Client components, Next/Vite/Electron configs, Docker/CI/env files | M1/M3/M4 client bundle leaks (`NEXT_PUBLIC_`/`VITE_` secrets, `"use client"` DB imports, `productionBrowserSourceMaps`, Electron `nodeIntegration`/`contextIsolation`), DOM XSS, CSP/HSTS, `500` stack leaks |
| **`security-engineer#supply-ai`** | Lockfiles, LLM/RAG pipelines, `tool()` & MCP server registrations | Dependency CVEs, **Taint Checklist 4** (Indirect Prompt Injection, RAG `tenant_id` ACL pre-filtering, Zod output validation, MCP/tool path/URL sandboxes & spend circuit breakers) |

---

## 🧭 Phase 2: 4 Source-to-Sink Taint Checklists & STRIDE Verification

Every `security-engineer#ep-1..k` shard + cross-shard `send_message` synthesis MUST trace concrete `source -> transform -> sink` paths across all 4 checklists and 6 STRIDE categories (`Spoofing`, `Tampering`, `Repudiation`, `Info Disclosure`, `Denial of Service`, `Elevation of Privilege`):

1. **Taint Checklist 1 — BOPLA & Read Anti-Leakage**: Explicit DTO/field `select` projection on reads (zero leaked `passwordHash`, secrets, internal flags, or cross-tenant PII); zero `err.stack`/`sqlMessage` in HTTP `500` JSON; zero `headers.authorization`/`cookies` in logs; zero auth tokens in `localStorage`/`sessionStorage`.
2. **Taint Checklist 2 — BOLA, Mass Assignment & TOCTOU Writes**: Server-derived caller identity + composite tenant filter (`WHERE id = $1 AND org_id = $2`) on every mutation/`"use server"` action; strict allowlist schema blocking role/price/balance mass assignment; atomic transactions / conditional `UPDATE` locks preventing TOCTOU double-spend or race bypasses.
3. **Taint Checklist 3 — Injection, Traversal, SSRF & Webhook HMAC**: Parameterized SQL / safe tagged `` sql`...${v}` `` only (zero `$queryRawUnsafe`, interpolated `sql.raw()`, `eval`, `child_process.exec`, `shell: true`); `realpath` containment on `path.join` inputs; DNS/IP-range allowlists on outbound `fetch`; non-wildcard `cors` when `credentials: true`; `jwt.verify()` enforced; raw-body `crypto.timingSafeEqual` HMAC + replay window on webhooks.
4. **Taint Checklist 4 — LLM, RAG & MCP Boundary**: Untrusted RAG/web/tool text isolated from system prompts; vector retrieval pre-filtered by caller tenant ACL; LLM outputs schema-validated before sinks; MCP/`tool()` arguments sandboxed with human confirmation on destructive mutations + rate/cost caps.

---

## ✅ Phase 3: Mandatory Zero-Blind-Spot Coverage Gate

> ⛔ **HARD GATE**: Do NOT finalize `REVIEW-security-{topic}.md` until all 5 invariants hold:

- [ ] **100% Entrypoint Census Parity**: **`audited_entrypoints == extracted_entrypoints`** (`route_census.total` matches rows in the 8-Column Matrix — zero omitted routes, `"use server"` actions, IPC handlers, or MCP tools)
- [ ] **All 4 Source-to-Sink Taint Checklists + STRIDE** verified across every trust boundary
- [ ] **Automated Gates Recorded**: `security_scan.py --json --emit-routes`, `api_validator.py`, `schema_validator.py --strict`, `boomopen check --strict-phase --no-stubs`, and dependency audit
- [ ] **Zero Tracked Secrets or Client-Boundary Leaks**: `.env.example` holds non-sensitive dummy values only; zero M1–M4 leaks

---

## 📄 Phase 4: Cohesive Brain Artifact (`REVIEW-security-{topic}.md`) & Handover

Write `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md` (`<= 500` lines, `ArtifactMetadata: { "Summary": "2-Layer M1-M6 Security, Route Census & Source-to-Sink Taint Audit Report", "UserFacing": true, "RequestFeedback": false }`) containing:

1. **Executive Security Posture & Gate Telemetry**: Score (`0–100`), Verdict (`PASS` | `HARDEN_BEFORE_PROD` | `CRITICAL_BLOCK`), census parity (`audited_entrypoints / extracted_entrypoints`), and CLI gate results.
2. **8-Column Endpoint Security & Anti-Leakage Matrix (`audited_entrypoints == extracted_entrypoints`)**:
   | ID (`EP-NNN`) | Entrypoint (`METHOD path/symbol`) | `file:line` | AuthN Guard | AuthZ / Tenant Scope (`BOLA`) | Input Schema | Response DTO / `BOPLA` Leak Check | Sink & Rate-Limit Verdict |
   |---------------|-----------------------------------|-------------|-------------|-------------------------------|--------------|-----------------------------------|---------------------------|
3. **Severity & Exploitability Matrix (`🔴 Critical`, `🟠 High`, `🟡 Medium`, `🟢 Low`)**:
   | ID | Severity | OWASP / STRIDE / Checklist | `file:line` / `EP-NNN` | Source-to-Sink Exploit Scenario | Non-Bypassable Fix Summary |
   |----|:--------:|----------------------------|------------------------|---------------------------------|----------------------------|
4. **Copy-Pasteable Remediation Blueprints (`🔴 Critical` & `🟠 High` Mandatory)** + **STRIDE Boundary Summary**: Clickable `[file:line](file:///...)` links and concrete code/config diffs.

Present `[REVIEW-security-{topic}.md](file:///...)` concisely and offer `/fix:hard` or `/deploy:check`.
