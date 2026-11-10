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

# /security-audit — The Fortress Builder v3.0 (v5.5 Parallel Shards)

> **MISSION**: Conduct an adversarial Zero-Trust security audit across OWASP Top 10, 2026 LLM/Agentic attack surfaces, STRIDE threat modeling, AuthN/AuthZ, secrets, infrastructure, and supply chain — producing **1 proof-backed `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md`** (`≤ 500` lines).

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX PARALLEL DISPATCH, READ-ONLY LOCK & ARTIFACT CONTRACT

1. **Valid Antigravity 2.0 Toolset**: Use `read_file`, `run_command`, `search_web`, `write_file`, `edit_file`, `invoke_subagent`, `send_message`, and `ask_question`.
2. **Elastic Parallel Security Shards (`> 2` Files)**:
   - For `≤ 2` known files, audit directly via `read_file` + CLI scanners.
   - For `> 2` files/endpoints, launch parallel specialist shards (`security-engineer#auth`, `security-engineer#api-data`, `security-engineer#ui-infra`, `security-engineer#supply-ai`) **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")`, assigning **at most `≤ 3–4` heavy modules/files per shard** and tracking `role#shard -> conversationId` for Warm Session Reuse (`send_message`).
3. **🛡️ `READ_ONLY_FILES` Audit Lock**: Lock **100% of repository source, config, and test files** in `READ_ONLY_FILES` during audit phases. Shards return structured findings via `send_message` or disjoint scratch files (`REVIEW-security-{topic}-s{1..k}.md`, `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`).
4. **Cohesive Single-File Deliverable**: Write `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md` (`≤ 500` lines, zero `{name}/` folder splits) with explicit `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: false }`.
5. **Skill References (Load On-Demand in Shards)**: `~/.{TOOL}/skills/security-auditor/SKILL.md` plus `~/.{TOOL}/skills_library/{stride-analysis-patterns,vulnerability-scanner,broken-authentication,api-security-best-practices}/SKILL.md` when installed.

---

## 🛡️ GOLDEN RULES

1. **THINK LIKE AN ATTACKER** — Every finding requires a concrete exploit path (`input → sink → impact`), not generic boilerplate.
2. **DEFENSE IN DEPTH & ZERO TRUST** — Verify explicitly at every layer; assume perimeter breach.
3. **LEAST PRIVILEGE** — Enforce minimal scopes on DB roles, IAM, API keys, JWT claims, and agent/MCP tools.
4. **SERVER-SIDE VALIDATION ALWAYS** — Client checks are UX only; validate schemas, types, and sizes server-side.
5. **ENCRYPT & REDACT** — Strong crypto in transit/at rest; zero secrets in Git or client bundles; zero PII/tokens in logs.

---

## 🔍 Phase 1 (Turn-1 Parallel Fan-Out): Automated Scanners + Sharded Code Audit

Launch deterministic scanners via `run_command` **in parallel** with `security-engineer#1..k` shards on Turn 1:

```bash
# 1. Automated vulnerability & secret pattern scanner
python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <target-dir>

# 2. Strict code-quality, type-safety & anti-stub gate
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs

# 3. Dependency & lockfile supply-chain audit (Node / Python / Rust as applicable)
npm audit --audit-level=moderate
```

| Parallel Shard | Disjoint Scope (`≤ 3–4` Modules/Files, `READ_ONLY_FILES`) | Security Vectors Audited |
|----------------|-----------------------------------------------------------|--------------------------|
| **`security-engineer#auth`** | Auth routes, session/JWT middleware, RBAC guards | OAuth 2.1 / PKCE / Better Auth, Argon2id/bcrypt (`≥10` rounds), `httpOnly`/`secure`/`sameSite=strict` cookies, refresh rotation, brute-force lockout, horizontal/vertical IDOR (`A01`, `A07`) |
| **`security-engineer#api-data`** | Controllers, ORM/SQL queries, file uploads, webhooks | Parameterized SQL, Zod/schema validation, SSRF allowlists (`A10`), webhook HMAC replay checks, payload limits, CORS origin allowlist, AES-256/TLS (`A02`, `A03`, `A08`) |
| **`security-engineer#ui-infra`** | Frontend views, headers/CSP, Docker/CI/env configs | DOM XSS / `dangerouslySetInnerHTML`, CSP/HSTS/`X-Frame-Options`, `NEXT_PUBLIC_`/`VITE_` secret leaks, non-root containers, debug/stack-trace suppression (`A05`, `A09`) |
| **`security-engineer#supply-ai`** | `package.json`/lockfiles, LLM/RAG/MCP integrations | `npm audit` CVEs, pinned lockfiles, Indirect Prompt Injection, tool-call privilege escalation, sandbox/path-traversal boundaries (`A04`, `A06`, OWASP LLM Top 10) |

---

## 🧭 Phase 2: STRIDE Threat Matrix & Exploit Verification

Cross-check shard outputs (resolving multi-hop exploit chains across shards via warm `send_message`) and model all 6 STRIDE threats per critical boundary:

| STRIDE Threat | Attack Vector Checked | Required Control Verified in Code |
|---------------|-----------------------|-----------------------------------|
| **S — Spoofing** | Forged JWT, missing webhook signature, session fixation | Signed tokens, secret rotation, HMAC verification, MFA |
| **T — Tampering** | Mass assignment, client price/role mutation, unsigned state | Strict server-side allowlist schemas & DB transactions |
| **R — Repudiation** | Unlogged admin/auth/billing mutations | Tamper-evident structured audit logs (with PII/secret redaction) |
| **I — Info Disclosure** | Stack traces, verbose 500s, enumeration, leaked `.env`/keys | Sanitized RFC 9457 error envelopes & secret scanning |
| **D — Denial of Service** | Unbounded queries, ReDoS, large uploads, unthrottled endpoints | Per-IP/user rate limiting, pagination caps, body/upload size limits |
| **E — Elevation of Privilege** | Object-level IDOR, role self-upgrade, unguarded admin/MCP routes | Centralized RBAC/ABAC policy enforcement + ownership checks |

---

## ✅ Phase 3: Mandatory Security Coverage Gate

> ⛔ **HARD GATE**: Do NOT finalize the report until every coverage check below is accounted for:

- [ ] **OWASP Web Top 10 (`A01–A10`)** + **LLM/Agentic Top Risks** (if AI features exist) audited
- [ ] **STRIDE Threat Matrix** completed for all external/internal trust boundaries
- [ ] **100% Target File & Endpoint Census** (`audited_endpoints == total_endpoints`)
- [ ] **Automated Gates Executed**: `security_scan.py`, `boomopen check --strict-phase --no-stubs`, and dependency audit recorded
- [ ] **Secrets & `.env` Check**: Zero hardcoded credentials in source or Git history; `.env.example` contains placeholders only

---

## 📄 Phase 4: Cohesive Brain Artifact (`REVIEW-security-{topic}.md`) & Handover

Synthesize all verified findings into **1 single cohesive file** at `<appDataDir>\brain\<conversation-id>\REVIEW-security-{topic}.md` (`≤ 500` lines) with:
```json
ArtifactMetadata: { "Summary": "OWASP Top 10, STRIDE & Supply-Chain Security Audit Report", "UserFacing": true, "RequestFeedback": false }
```

### Mandatory Structure of `REVIEW-security-{topic}.md`:
1. **Executive Security Posture**: Overall Score (`0–100`), Verdict (`PASS` | `HARDEN_BEFORE_PROD` | `CRITICAL_BLOCK`), endpoint/file census, and CLI scanner outputs (`security_scan.py`, `boomopen check`, `npm audit`).
2. **Severity & Exploitability Matrix (`🔴 Critical`, `🟠 High`, `🟡 Medium`, `🟢 Low`)**:
   | ID | Severity | OWASP / STRIDE | `file:line` / Endpoint | Exploit Scenario (Step-by-Step) | Non-Bypassable Fix Summary |
   |----|:--------:|----------------|------------------------|---------------------------------|----------------------------|
3. **Copy-Pasteable Remediation Blueprints (`🔴 Critical` & `🟠 High` Mandatory)**: Exact clickable `[file:line](file:///...)` links and concrete code/config patches for every Critical/High vulnerability.
4. **STRIDE Boundary Table & Verified Defenses**: Summary of threat mitigations already well-implemented.

Present `[REVIEW-security-{topic}.md](file:///...)` concisely and offer next steps:
- **Remediate Vulnerabilities**: Run `/fix:hard` (dispatching parallel `OWNED_FILES ≤ 3–4` remediation shards + regression tests)
- **Performance / Pre-Deploy Check**: `/performance` or `/deploy:check`
