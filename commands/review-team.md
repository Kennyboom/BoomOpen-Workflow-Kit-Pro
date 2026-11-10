---
description: "🔺 Team Review — 2-Stage Elastic Golden Diamond Multi-Specialist Audit, Cross-Engine Council (Author != Critic), Warm False-Positive Elimination & 1-Click Proceed to /fix"
version: "5.5"
category: quality
execution-mode: execute
---

> **📂 Cohesive Single-File & Zero-Collision Rule (v5.5)**:
> - **Single User-Facing Deliverable**: `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 500` lines, zero `{name}/` folder splits!). Set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when `P0/P1` issues exist so Antigravity 2.0's 1-click **"Proceed"** button fast-forwards straight into `/fix:team` (`RequestFeedback: false` when `0` `P0/P1` issues exist).
> - **Zero Multi-File Sprawl & Zero Write Collisions**: Never dump separate `SCOUT-{scope}` or `REVIEW-REPORT-{scope}` files on the user! Parallel Stage 1 shards return structured payloads via message OR write disjoint internal scratch files (`REVIEW-{scope}-s{1..k}.md`, `COUNCIL-review-{scope}.md`) with `ArtifactMetadata: { Summary: "...", UserFacing: false, RequestFeedback: false }`. Consolidated debate logs in `MAILBOX-{date}.md` also carry `UserFacing: false, RequestFeedback: false`.

---

# /review:team — 2-Stage Elastic Golden Diamond & Cross-Engine Adversarial Code Audit

> **MISSION**: Deliver zero-blind-spot, zero-false-positive code, security, performance, and test assurance in **2 high-parallelism stages** (replacing legacy 4-triangle sequential bloat): **Stage 1 Turn-1 Multi-Lens Specialist Swarm + Automated Scanners + Cross-Engine Critic (`Author != Critic`)**, followed by **Stage 2 Adversarial Cross-Examination & Patch Verification via Warm `send_message`**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ELASTIC SHARDING, TEAM PROTOCOLS & READ-ONLY LOCK

- **Zero Turn-1 Pre-Flight Delay**: Do **NOT** block Turn 1 reading reference files — launch all Stage 1 shards + CLI scanners **immediately in Turn 1** (`invoke_subagent(TypeName: "self", Model: "inherit")`), loading `commands/_ref/golden-triangle-protocol.md`, `agents/teams/security-team/_team.md`, or `agents/teams/performance-team/_team.md` on-demand.
- **Cognitive Load Sharding Law (`<= 3–4` Heavy Files / Shard)**:
  $$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Audit Vectors}\right)\right)$$
- **🛡️ `READ_ONLY_FILES` Lock**: Lock **100% of repository source and test files** in `READ_ONLY_FILES` across every shard — `/review:team` never modifies workspace code!

---

## 🎭 Stage 1 (Turn-1 Parallel Fan-Out): ELASTIC MULTI-LENS SPECIALIST SWARM + CROSS-ENGINE COUNCIL — 💎 GOLDEN DIAMOND

Spawn all disjoint audit shards concurrently on Turn 1 and record `role#shard → conversationId`:

| Diamond Vector | Specialist Shard (`TypeName: "self"`, `Model: "inherit"`) | Disjoint Audit Mission & Output Lock (`UserFacing: false, RequestFeedback: false`) |
|----------------|-----------------------------------------------------------|------------------------------------------------------------------------------------|
| **🏗️ Vector 1: Architecture, Logic & Contract Shards** | `reviewer#arch-1..k` (`agents/reviewer.md`, `<= 3–4` files/shard) | Line-by-line correctness, null/concurrency edge cases, `PLAN-{scope}.md` + `DESIGN-{scope}.md` + `SHARED_CONTRACT` adherence, and `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs`. Output via message or `REVIEW-{scope}-s{1..k}.md`. |
| **🔐 Vector 2: Offensive STRIDE, OWASP & AI/MCP Security** | `security-engineer#owasp` (`agents/security-engineer.md`) | Run `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <dir>` + trace source-to-sink exploits across Auth/OAuth2.1/Better-Auth/IDOR, SQLi/SSRF/XSS, secrets, Indirect Prompt Injection & MCP tool boundaries. Output via message or `REVIEW-{scope}-sec.md`. |
| **⚡ Vector 3: Hot-Path Performance, SQL & CWV** | `performance-engineer#hotpaths` (`agents/performance-engineer.md`) | Audit p50/p95/p99 bottlenecks, N+1 queries / missing indexes, memory/GC leaks, bundle size & Core Web Vitals (`INP/LCP/CLS`); run `ux_audit.py` + `accessibility_checker.py` when UI changes. Output via message or `REVIEW-{scope}-perf.md`. |
| **🧪 Vector 4: Test Coverage & Regression Audit** | `tester#coverage` (`agents/tester.md`) | Run `python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <dir>`, audit assertion strength (`0` tautologies / `.skip`), and identify untested failure/boundary paths. Output via message or `REVIEW-{scope}-qa.md`. |
| **🎼 Vector 5: Cross-Engine Adversarial Review (`Author != Critic`)** | `boomopen conduct council` / `dispatch` | Run concurrently on Turn 1 when `engines.reviewer = "council"` (or requested):<br>`node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task review --output "<appDataDir>/brain/<conversation-id>/COUNCIL-review-{scope}.md" --prompt "<scope>"`<br>*(Or `conduct dispatch --role reviewer --engine cross_family --prompt "<scope>"` when `engines.reviewer = "cross_family"`.)* |

---

## 🎭 Stage 2: ADVERSARIAL FALSE-POSITIVE ELIMINATION & PATCH VERIFICATION (`tech-lead` via Warm `send_message`)

> **♻️ WARM SESSION REUSE**: Never cold-spawn extra `planner` or `business-analyst` triangles! `tech-lead` (`agents/tech-lead.md`) arbitrates Stage 1 findings with warm shards via `send_message(Recipient: conversationId)` (`<= 2–3` rounds; consolidated log in `MAILBOX-{date}.md` with `UserFacing: false, RequestFeedback: false`):

1. **Adversarial Challenge & Compound-Risk Chaining**:
   - Challenge every `P0/P1` candidate: *"Show the exact `file:line` source-to-sink or concurrency trigger; retract if guarded by framework/ORM/type invariants."*
   - Check compound chains (e.g., `P2` missing rate-limit + `P2` expensive query = `P1` DoS) and verify every proposed remediation snippet does **not** introduce a secondary bypass or contract break.
   - Stamp `✅ CONSENSUS: tech-lead ✓ | reviewer#arch-1..k ✓ | security-engineer#owasp ✓ | performance-engineer#hotpaths ✓ | tester#coverage ✓` in `MAILBOX-{date}.md`.
2. **Synthesize 1 Cohesive `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 500` Lines)**:
   - **1. Executive Verdict, Consensus Stamp & Automated Gate Summary** (`APPROVE` | `REQUEST_CHANGES` | `BLOCK`, `PLAN`/`SHARED_CONTRACT` matrix, CLI scanner exit codes, Cross-Engine Council delta).
   - **2. Calibrated Severity Matrix (`P0..P3`)**: `ID | Severity (P0..P3) | [Confidence: HIGH|MEDIUM|LOW] | Vector | Clickable file:line | Exploit / Failure Proof | Patch Summary`.
   - **3. Non-Bypassable Remediation Diffs**: Concrete code patches + regression test cases for every `P0/P1` finding.
   - **4. Architectural Strengths**: Verified high-craft patterns worth preserving.

> **⛔ HARD STOP**: Present `[REVIEW-{scope}.md](file:///...)`. When `P0/P1` findings exist (`RequestFeedback: true`), clicking **"Proceed"** (or running `/fix:team`) consumes the verified patch blueprints directly; when `0` `P0/P1` issues remain (`RequestFeedback: false`), approve for merge or `/deploy:check`.
