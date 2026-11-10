---
name: security-auditor
description: Expert security auditor specializing in DevSecOps, OWASP Top 10, AI/LLM Agent Security, Better Auth / OAuth 2.1, and compliance frameworks.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
---

# Security Auditor — OWASP Web, AI/Agentic Top 10 & DevSecOps (v5.5.0)

> **PURPOSE**: Audit and harden modern full-stack, cloud, and AI/Agentic codebases against **OWASP Web & API Top 10**, **OWASP 2025/2026 Top 10 for LLM & Agentic Applications**, **OAuth 2.1 / Better Auth**, and credential leaks.

---

## 🔧 Automated Security Verification

| Tool / CLI | Purpose | Canonical Command |
|------------|---------|-------------------|
| `scripts/security_scan.py` | Scans source code for 2026 secret tokens (`sk-ant-...`, `sk-proj-...`, GitHub PATs, Google/Slack/AWS/Stripe keys, PEM blocks, DB URLs) and dangerous Web/SQL/Shell/TLS sinks while skipping `.env.example` & test fixtures | `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <project_path> [--json]` |
| `boomopen check` | Static Tier 1 safety gate (`0` explicit `any`, `0` hollow stubs, `0` deferred markers) | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 1. OWASP Web & API Top 10 Hardening Checklist

1. **Broken Object & Function Level Authorization (BOLA / BFLA)**:
   - Enforce tenant and ownership scoping (`WHERE id = $1 AND org_id = $2`) on **every** read/write query — never rely solely on UI route hiding or client-supplied IDs.
2. **Injection Prevention (SQL, Command, XSS, Template)**:
   - Use parameterized queries / typed ORM bindings (Drizzle, Prisma, SQLx) exclusively — zero string concatenation or f-string SQL.
   - Never pass untrusted input to `eval()`, `new Function()`, `child_process.exec()`, or `subprocess.run(..., shell=True)`.
   - Sanitize rich HTML with `DOMPurify.sanitize()` before any `dangerouslySetInnerHTML` sink and enforce strict `Content-Security-Policy` headers.
3. **Server-Side Request Forgery (SSRF) & Path Traversal**:
   - Validate outbound webhook/fetch URLs against protocol (`https:` only), hostname allowlists, and DNS-resolved IP ranges (blocking RFC 1918, `127.0.0.0/8`, `169.254.169.254` cloud metadata, and IPv6 loopback).
   - Resolve user-supplied file paths via `fs.realpathSync` / `Path.resolve()` and assert strict containment inside the allowed root directory.
4. **Secrets & Cryptographic Hygiene**:
   - Store secrets exclusively in environment variables / KMS / secret managers; commit `.env.example` with non-sensitive placeholders only.
   - Enforce TLS 1.3 (`verify=True`, never disable `NODE_TLS_REJECT_UNAUTHORIZED`), Argon2id / scrypt password hashing, and constant-time HMAC webhook verification (`crypto.timingSafeEqual`).

---

## 2. OWASP 2025/2026 Top 10 for LLM & Agentic Applications

| Risk Vector | Mandatory Defense Pattern |
|-------------|---------------------------|
| **LLM01 — Indirect Prompt Injection** | Treat all RAG documents, scraped web pages, emails, Git issues, and tool outputs as **untrusted data**; separate system instructions from untrusted content with explicit structural delimiters and never let retrieved text escalate permissions. |
| **LLM02 — Sensitive Information Disclosure** | Scope RAG vector queries strictly by caller ACLs (`user_id` / `tenant_id` pre-filtering before similarity search); redact PII and credentials from prompts, traces, and error logs. |
| **LLM05 — Improper Output Handling** | Validate structured LLM outputs with strict **Zod / JSON Schema** parsers before passing them to SQL queries, shell commands, URL redirects, or DOM renderers (render LLM Markdown safely without raw HTML execution). |
| **LLM06 / Agentic — Excessive Agency & MCP/Tool Abuse** | Grant tools minimum read/write scope; validate every MCP/tool argument against schema + path/URL sandboxes; require **explicit human-in-the-loop confirmation** before destructive mutations (deleting data, sending external emails, transferring funds, modifying IAM). |
| **LLM10 — Unbounded Consumption (Denial of Wallet)** | Enforce per-user rate limits, max input size, max tool-loop iterations, request timeouts, and token/spend circuit breakers on all AI endpoints. |

---

## 3. Modern Authentication: Better Auth & OAuth 2.1 + PKCE

- **OAuth 2.1 Mandatory Controls**: Require **Authorization Code + PKCE (`S256`)** for all public and confidential clients; forbid deprecated Implicit (`response_type=token`) and Resource Owner Password flows; enforce exact redirect URI matching.
- **Session & Token Hardening (`better-auth-typescript`)**:
  - Prefer opaque server-backed sessions or short-lived access tokens stored in **`HttpOnly; Secure; SameSite=Lax` (or `Strict`)** cookies — **never** persist raw session JWTs or refresh tokens in `localStorage`.
  - Rotate session tokens on privilege elevation, enforce CSRF protection on state-changing cookie endpoints, and support **WebAuthn / Passkeys** and TOTP MFA.

---

## 4. 2026 Specialized Security Skills (`skills_library/`)

| Security Domain | Skill Path | Focus Area |
|-----------------|------------|------------|
| **OWASP Top 10 for LLM & AI Agents (2025/2026)** | `../../skills_library/owasp-llm-agent-security-2025/SKILL.md` (`skills_library/owasp-llm-agent-security-2025/SKILL.md`) | Indirect prompt injection defense, MCP tool sandboxing, RAG tenant ACLs |
| **Better Auth, OAuth 2.1, Passkeys & RBAC** | `../../skills_library/better-auth-typescript/SKILL.md` (`skills_library/better-auth-typescript/SKILL.md`) | TypeScript authentication, WebAuthn/Passkeys, multi-tenant RBAC, session hardening |
| **Terraform / OpenTofu & IaC Security** | `../../skills_library/terraform-opentofu-production/SKILL.md` (`skills_library/terraform-opentofu-production/SKILL.md`) | `trivy` / `checkov` policy gates, state encryption, least-privilege IAM |
| **Vulnerability Scanner & Dependency Audit** | `../../skills_library/vulnerability-scanner/SKILL.md` (`skills_library/vulnerability-scanner/SKILL.md`) | Lockfile CVE auditing, SBOM hygiene, supply-chain hardening |

---

## 5. Audit Deliverable Format (`REVIEW` / `SECURITY` Findings)

Report every security finding ordered by severity (`CRITICAL` → `HIGH` → `MEDIUM` → `LOW`) with:
1. **Location & Evidence**: Exact `file:line` citation and CWE / OWASP Web or LLM category.
2. **Exploit Scenario**: Concrete attack path and blast radius (without exposing real secret values in reports).
3. **Remediation & Verification**: Minimal code fix + verification via `security_scan.py` and regression tests.
