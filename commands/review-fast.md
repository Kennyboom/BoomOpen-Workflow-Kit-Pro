---
description: "⚡ Quick Code Review — Focused Diff Audit with boomopen check, Proof-Backed P0..P3 Severity Matrix & 1-Click Proceed to /fix"
version: "5.5"
category: validation
execution-mode: execute
---

> **📂 Deliverable & Conditional 1-Click `"Proceed"` Rule (v5.5)**:
> - **Read-Only Audit Lock**: Lock 100% of project files in `READ_ONLY_FILES` — never edit code during `/review:fast`!
> - Write **1 cohesive file** at `<appDataDir>\brain\<conversation-id>\REVIEW-{scope}.md` (`<= 300` lines, zero `{name}/` folder splits; set `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` when `P0/P1` issues exist so clicking **"Proceed"** launches `/fix:fast`, or `RequestFeedback: false` when clean).

---

# /review:fast — Rapid Proof-Gated Code, Security & Hygiene Review

> **MISSION**: Perform a high-signal, zero-nitpick audit of `<= 2` changed files (or a focused diff) against `PLAN` / `SHARED_CONTRACT`, **Pragmatic 2-Tier Coding Standards**, OWASPWeb/LLM security boundaries, and deterministic CLI checks.

<scope>$ARGUMENTS</scope>

---

## ⚡ MODE GATE & CROSS-ENGINE OPTION

- **Mode A (Direct Execution — `<= 2` Known Files)**: Audit directly and run CLI checks.
- **Mode B (Tier 1 Delegation — `> 2` Files)**: Spawn `reviewer` (`invoke_subagent(TypeName: "self", Role: "Principal Code Reviewer", Model: "inherit", Prompt: ...)`) or reuse the warm `reviewer` session via `send_message`.
- **Optional Cross-Engine Critic (`Author != Critic`)**: When `engines.reviewer = "cross_family"`, run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role reviewer --engine cross_family --prompt "<scope>"`.

---

## 🔍 3-STEP DETERMINISTIC REVIEW PROTOCOL

1. **Automated Standards & Security Baseline**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs
   ```
   *(When auth/input/AI routes touch security, also run `python ~/.{TOOL}/skills/security-auditor/scripts/security_scan.py <target-dir>`; when UI components change, run `python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <ui-dir>` and `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <ui-dir>`.)*
2. **4-Lens Manual Audit (Zero Speculative Nitpicks)**:
   - **Correctness & Contract Compliance**: Matches `PLAN-{scope}.md` & `SHARED_CONTRACT`? Null/boundary/race conditions handled? `try/catch` + typed errors on async boundaries?
   - **Security (OWASP Web + 2026 LLM/Agentic)**: Authn/RBAC/IDOR checks, parameterized queries, URL allowlists (SSRF), prompt/tool-argument sanitization, zero hardcoded secrets.
   - **Performance**: Zero N+1 queries in loops, bounded memory/payloads, `tabular-nums` / CWV render sanity.
   - **Pragmatic 2-Tier Hygiene**: `0` explicit `any`, `0` debug `console.log` in app code, cohesive file structure (`<= 400` soft / `<= 500` hard lines).
3. **Write Cohesive `REVIEW-{scope}.md` & Stop**:
   - **Executive Verdict** (`APPROVE` | `REQUEST_CHANGES` | `BLOCK`) + CLI check summary.
   - **Actionable Severity Matrix (`P0..P3`)**: Every finding MUST include exact `[file:line](file:///...)`, `Severity (P0..P3)`, `[Confidence: HIGH|MEDIUM|LOW]`, concrete failure/exploit trace, and a **copy-pasteable patch snippet**.
   - If `P0/P1` findings exist (`RequestFeedback: true`), invite the user to click **"Proceed"** (or run `/fix:fast`).
