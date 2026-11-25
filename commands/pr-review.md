---
description: "🔍 Adversarial PR Review — Parallel security, logic, contract & regression inspection of Pull Request hunks via gh pr view & gh pr diff with P0/P1/P2 file:line findings"
version: "5.5"
category: validation
execution-mode: execute
---

# /pr:review — Pull Request Adversarial Hunk Review (`gh pr view` & `gh pr diff`)

> **MISSION**: Perform a forensic, zero-nitpick adversarial review of any GitHub Pull Request (or local branch diff) by inspecting changed hunks **plus** their surrounding caller/callee context in parallel across **Logic/Contracts**, **2-Layer Security**, and **Regression/Test Coverage**, producing `P0/P1/P2` `file:line` findings and a ready-to-post verdict.

<pr_target>$ARGUMENTS</pr_target>

---

## ⚡ STRICT READ-ONLY LOCK & PARALLEL FAN-OUT RULES

1. **100% Read-Only Workspace Guarantee**:
   - Lock all repository source, config, and test files in `READ_ONLY_FILES` — `/pr:review` NEVER mutates project code or auto-posts destructive `gh pr review --request-changes/--approve` comments to GitHub without explicit user confirmation!
   - Write **1 single cohesive `PR-REVIEW-{id}.md` (`<= 400` lines)** to `<appDataDir>\brain\<conversation-id>\PR-REVIEW-{id}.md` on Antigravity (`ArtifactMetadata: { Summary: "Adversarial PR review findings and merge verdict", UserFacing: true, RequestFeedback: true }` when `P0/P1` blockers exist, else `RequestFeedback: false`) or `./reports/pr/PR-REVIEW-{id}.md` on Claude Code, Codex, Cursor, and Copilot.
2. **Proof-Over-Nitpicks Law**:
   - Suppress subjective formatting or naming nitpicks unless they violate a concrete invariant. Every reported finding MUST state exact `file:line` (in the head tree), severity (`P0` / `P1` / `P2`), `[Confidence: HIGH|MEDIUM]`, concrete failure/exploit trigger, and a minimal copy-pasteable fix snippet.

---

## 🔍 PHASE 1: PR METADATA, CI STATUS & HUNK EXTRACTION (TURN 1)

Fetch PR metadata, check-run health, and unified diff in a single shell batch (passing `<pr_target>` number/URL/branch when given, or defaulting to the active branch's open PR; fall back to `git diff origin/main...HEAD` if no remote PR exists yet):

```bash
gh pr view [<pr_target>] --json number,title,body,author,baseRefName,headRefName,files,additions,deletions,commits,statusCheckRollup
gh pr diff [<pr_target>]
```

- **Context-Window Hunk Rule**: Never review a diff hunk in a vacuum! Always read the surrounding function, imported `SHARED_CONTRACT` / DTO schema, and 1-hop callers of modified symbols (`read_file` / `grep_search`) to catch broken caller assumptions that do not appear inside `@@ ... @@` lines.

---

## 🎭 PHASE 2: PARALLEL 3-ANGLE ADVERSARIAL HUNK INSPECTION

When the PR touches `> 2` files or multiple domains, fan out **3 parallel read-only specialist shards** (`invoke_subagent(TypeName: "self", Model: "inherit")` on Antigravity — or `run_workflow(ScriptPath="~/.gemini/config/skills/boomopen-workflow-kit/platforms/antigravity/workflows/review_fanout.py", Description="3-angle adversarial PR review", Args={"scope": "PR #<number>"})` — and `Task` / `spawn_agent` / `runSubagent` on Claude Code, Codex, Copilot, Cursor):

| Parallel Critic Shard | Inspection Focus on Changed Hunks & 1-Hop Callers | Blocking Criteria (`P0` / `P1`) |
|-----------------------|---------------------------------------------------|---------------------------------|
| **`reviewer#logic-contracts`** | Null/undefined paths, async `try/catch` gaps, race/TOCTOU windows, transaction rollback safety, API/DB backward compatibility, island modules (`REC-G1`), route parity (`REC-G2`), and Pragmatic 2-Tier hygiene (`0` `any`, `0` stubs/TODOs, `0` debug `console.log`). | Runtime crash, silent data corruption, breaking API/schema contract drift, or hollow stub implementation. |
| **`security-engineer#pr-sec`** | **Layer A Inbound**: AuthN/AuthZ/RBAC/tenant `BOLA` guards, Zod/schema validation, SQLi/command injection, SSRF, path traversal, webhook HMAC (`timingSafeEqual`). **Layer B Outbound**: `BOPLA` response over-exposure, leaked secrets/tokens, `500` stack/SQL leaks, unsafe lockfile/dependency additions. | Any exploitable auth bypass, cross-tenant read/write, injection sink, or secret/PII exposure. |
| **`tester#regression-gap`** | Behavioral test coverage for every new branch/error path in the diff, weakened/deleted assertions or `.skip`/`.only` in existing `tests/**`, `.env.example` parity, and failing `statusCheckRollup` CI checks. | Untested critical mutation/error path, weakened regression test, or red CI check. |

When checking out the PR locally, also run deterministic static verification:
```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check . --strict-phase --no-stubs
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js reconcile . --strict
```

---

## 📊 PHASE 3: SYNTHESIZE `PR-REVIEW-{id}.md` & READY-TO-POST VERDICT

Deduplicate shard findings, discard speculative false positives lacking a concrete failure path, and write `PR-REVIEW-{id}.md`:

````markdown
# 🔍 Pull Request Review: PR #{number} — {Title}

- **Verdict**: `APPROVE` | `REQUEST_CHANGES` | `BLOCK`
- **Branches & Scope**: `{headRefName}` → `{baseRefName}` (`+{additions} / -{deletions}` across `{N}` files)
- **CI & Static Gates**: CI Checks: `{PASS/FAIL}` | `boomopen check`: `{PASS/FAIL}` | `boomopen reconcile`: `{PASS/FAIL}`

## 1. Findings Severity Matrix (`P0` Blocker · `P1` High · `P2` Medium)
| ID | Severity | Confidence | Lens | `file:line` | Concrete Failure / Exploit Trace | Fix Summary |
|----|:--------:|:----------:|------|-------------|----------------------------------|-------------|
| `PR-01` | `P0` / `P1` / `P2` | `HIGH` | `Security / Logic / Contract / Test` | `[file.ts:L42](file:///...)` | {exact input/sequence causing bug} | {1-line fix} |

## 2. Surgical Patch Suggestions (`P0` & `P1`)
### `[PR-01]` `{Severity}` — {Finding Title} (`file.ts:L42`)
- **Trigger & Blast Radius**: {Step-by-step causal trace through changed hunk and callers}
- **Suggested Patch**:
```ts
// Minimal production-ready remediation
```

## 3. Verified Strengths & Ready-to-Post GitHub Review Comment
> {Copy-pasteable concise GitHub PR review summary ready for `gh pr review`}
````

---

## 🧭 SEVERITY RUBRIC & FALSE-POSITIVE FILTER

| Severity | Threshold (`Proof Required`) | Merge Verdict Impact |
|:--------:|------------------------------|----------------------|
| **`P0` (Critical)** | Exploitable auth/BOLA/injection/secret leak, crash on reachable input, silent data loss/corruption, or breaking API/DB migration without fallback | **`BLOCK`** (`RequestFeedback: true`) |
| **`P1` (High)** | Broken acceptance rule, race/TOCTOU bug, missing error propagation (`catch {}`), `N+1` hot-path cliff, island module (`REC-G1`), or untested critical branch | **`REQUEST_CHANGES`** (`RequestFeedback: true`) |
| **`P2` (Medium)** | Non-blocking edge-case validation gap, missing secondary test case, or Pragmatic 2-Tier maintainability violation (`> 400` soft / `> 500` hard lines, explicit `any`) | **`APPROVE` with suggestions** or **`COMMENT`** |

### ⛔ Anti-Patterns (Zero Tolerance)
- ❌ **Diff-Blind Tunnel Vision**: Flagging a change without reading the full enclosing function and its 1-hop callers/types.
- ❌ **Speculative Style Policing**: Complaining about variable names, formatting, or hypothetical futures without a concrete bug/contract violation.
- ❌ **Unsolicited Remote Mutation**: Calling `gh pr review --request-changes` or `gh pr merge` on GitHub before the user confirms.
- ❌ **Editing Workspace Code**: Modifying local files during `/pr:review` instead of keeping 100% of repo files in `READ_ONLY_FILES`.

---

## 🌐 MULTILINGUAL INTENT TRIGGERS (WHEN NL ROUTING IS ENABLED)

| Language | Representative PR Review Intents |
|----------|----------------------------------|
| **`en` / `vi`** | *"review PR #142"*, *"audit this pull request diff"* / *"review PR này giúp tôi"*, *"kiểm tra bảo mật và logic PR #142"* |
| **`zh` / `ja` / `ko`** | *"审查这个 PR 的代码变更与安全风险"* / *"このPRの差分をセキュリティ・ロジック観点でレビューして"* / *"이 PR 변경사항 보안 및 로직 리뷰해줘"* |
| **`es` / `fr` / `de`** | *"revisar este pull request a fondo"* / *"faire la revue adversariale de cette PR"* / *"diesen Pull Request auf Bugs und Security prüfen"* |

---

## 🛑 COMPLETION & OPTIONAL GITHUB POST GATE

Present the review verdict and `P0/P1/P2` summary in chat:
- If the user is the PR author and `P0/P1` issues exist → offer `/fix:hard` (or click **"Proceed"** on Antigravity) to remediate and re-verify before updating the PR.
- If the user wants to publish the review to GitHub → confirm via `ask_question` before running `gh pr review <number> --comment|--approve|--request-changes --body-file "<path-to-comment.md>"`.
