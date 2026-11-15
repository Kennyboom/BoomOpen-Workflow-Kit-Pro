---
description: "⚡⚡⚡ Full Review — Turn-1 Parallel Multi-Lens Audit Shards (Architecture, OWASP/LLM Security, Hot-Path Perf), Cross-Engine Council & Proof-Backed Patch Matrix"
version: "5.5"
category: validation
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Single User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!). Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when `P0/P1` defects exist so Antigravity 2.0's 1-click **"Proceed"** button fast-forwards straight into `/fix:hard` (`RequestFeedback: false` when `0` `P0/P1` issues exist).
> - **Disjoint Shard Outputs (`0` Write Collisions)**: Parallel Stage 1 critics **NEVER write to the same file path**! Each shard returns structured findings via message OR writes a disjoint scratch file (`REVIEW-{scope}-s{1..k}.md`, `COUNCIL-review-{scope}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`.

---

# /review:hard — Turn-1 Parallel Multi-Lens Code, 2-Layer Security & Performance Audit

> **MISSION**: Conduct an exhaustive, read-only multi-lens audit across `3–8+` files by launching parallel specialist critics (`reviewer#arch-1..k`, `security-engineer#ep-1..k`, `performance-engineer#hotpaths`) + deterministic M1–M6 CLI scanners on Turn 1, synthesizing **1 proof-gated `REVIEW-{scope}.md`**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX PARALLEL DISPATCH, ENDPOINT SHARDING & READ-ONLY LOCK

- **Zero Turn-1 Rule-Read Tax**: Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — launch all Stage 1 audit shards + CLI scanners in **one parallel Turn-1 batch** (`invoke_subagent(TypeName: "self", Model: "inherit")`).
- **🛡️ `READ_ONLY_FILES` Lock**: Lock **100% of repository source and test files** in `READ_ONLY_FILES` across all shards — never modify project files during `/review:hard`.
- **Cognitive Load & Endpoint Sharding (`<= 3–4` Heavy Files or `<= 8–10` Endpoints / Shard)**: Shard `reviewer#arch-1..k` (`<= 3–4` heavy files/shard) and dynamically partition `route_census.entrypoints` across `security-engineer#ep-1..k` (`<= 8–10` endpoints/shard) so `audited_entrypoints == extracted_entrypoints`.

---

## 🎭 Stage 1 (Turn-1 Parallel Fan-Out): MULTI-LENS CRITICS + M1–M6 SCANNERS (+ OPTIONAL COUNCIL)

Launch all applicable audit tracks concurrently in Turn 1:

| Parallel Track | Specialist / CLI Tool | Disjoint Audit Scope & Output Lock (`UserFacing: false, RequestFeedback: false`) |
|----------------|-----------------------|---------------------------------------------------------------------------------|
| **🏗️ Track 1A: Architecture, Logic & Contract Shards** | `reviewer#arch-1..k` (`agents/reviewer.md`, `<= 3–4` files/shard) | Verify `PLAN-{scope}.md`, `DESIGN-{scope}.md`, `SHARED_CONTRACT` & `OWNED_FILES` compliance; trace null/async/race bugs and Pragmatic 2-Tier rules (`0 any`, `<= 500L`). Output via message or `REVIEW-{scope}-s{k}.md`. |
| **🔐 Track 1B: 2-Layer Anti-Leakage & Endpoint Taint Shards** | `security-engineer#ep-1..k` (`<= 8–10` endpoints/shard, `skills/security-auditor/SKILL.md`) | Run `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <dir> --json --emit-routes` (plus `api_validator.py <dir> --json` & `schema_validator.py <dir> --strict --json` when API/DB files exist) and trace all **4 Source-to-Sink Taint Checklists**: (1) **BOPLA Read Leak** (`select` DTO projection, zero `500` `err.stack`/`sqlMessage`, zero `NEXT_PUBLIC_`/`VITE_` or `"use client"` DB leaks), (2) **BOLA/Mass-Assign/TOCTOU Write** (`org_id` scope, strict schemas, atomic locks), (3) **Injection/Traversal/SSRF/Webhook HMAC** (`$queryRawUnsafe`, `exec`/`shell:true`, `path.join`, `cors`+credentials, `jwt.verify`, `timingSafeEqual`), and (4) **LLM/RAG/MCP Boundary**. Output via message or `REVIEW-{scope}-sec-{k}.md`. |
| **⚡ Track 1C: Hot-Path Performance & CWV** | `performance-engineer#hotpaths` (`agents/performance-engineer.md`) | Audit N+1 SQL/ORM queries, missing composite/FK indexes, blocking I/O, memory/allocation leaks, bundle size & Core Web Vitals (`INP/LCP/CLS`). Output via message or `REVIEW-{scope}-perf.md`. |
| **🛠️ Track 1D: Deterministic CLI & UI/A11y Gates** | `boomopen check` + UI scripts | Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs` (plus `python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <ui-dir>` & `accessibility_checker.py <ui-dir>` when UI files are in scope). |
| **🎼 Track 1E: Cross-Engine Critic *(Conditional)*** | `boomopen conduct` (`Author != Critic`) | If `engines.reviewer = "council"`: `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --output "<appDataDir>/brain/<conversation-id>/COUNCIL-review-{scope}.md" --prompt "<scope>"` (or `conduct dispatch --role reviewer --engine cross_family --prompt "<scope>"`). |

---

## 🎭 Stage 2: FALSE-POSITIVE PRUNING & COHESIVE `REVIEW-{scope}.md` SYNTHESIS

1. **Deduplicate, Verify Proof & Enforce Route Census Parity**: Strip any speculative warning lacking a concrete failure/exploit path! Resolve shard disagreements via warm `send_message(Recipient: conversationId)` and verify **`audited_entrypoints == extracted_entrypoints`** whenever backend/IPC/MCP entrypoints exist in `<scope>`.
2. **Write 1 Cohesive `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 500` Lines)**:
   - **1. Executive Verdict & Gate Matrix**: Overall verdict (`APPROVE` | `REQUEST_CHANGES` | `BLOCK`), `PLAN`/`DESIGN` compliance score, CLI scanner exit codes (`security_scan.py --emit-routes`, `boomopen check`), census parity (`audited_entrypoints / extracted_entrypoints`), and Cross-Engine Consensus summary (if active).
   - **2. 8-Column Endpoint Security & Anti-Leakage Matrix *(Mandatory when entrypoints > 0)***:
     | ID (`EP-NNN`) | Entrypoint (`METHOD path/symbol`) | `file:line` | AuthN Guard | AuthZ / Tenant Scope (`BOLA`) | Input Schema | Response DTO / `BOPLA` Leak Check | Sink & Rate-Limit Verdict |
     |---------------|-----------------------------------|-------------|-------------|-------------------------------|--------------|-----------------------------------|---------------------------|
   - **3. Actionable Severity Matrix (`P0 Critical`, `P1 High`, `P2 Medium`, `P3 Low`)**:
     | ID | Severity | Confidence | Lens | `file:line` | Failure / Source-to-Sink Trace | Concrete Remediation Summary |
     |----|----------|------------|------|-------------|--------------------------------|------------------------------|
   - **4. Detailed Proof & Patch Blueprints (`P0` & `P1` Mandatory)** + **5. Verified Strengths**: Exact clickable `[file:line](file:///...)`, step-by-step trigger/exploit trace, and copy-pasteable non-bypassable patch diff for every `P0/P1` issue.

> **⛔ HARD STOP**: Present `[REVIEW-{scope}.md](file:///...)`. When `P0/P1` findings exist (`RequestFeedback: true`), clicking **"Proceed"** (or typing `/fix:hard`) fast-forwards directly into remediation; when clean (`RequestFeedback: false`), approve for merge or `/deploy:check`.
