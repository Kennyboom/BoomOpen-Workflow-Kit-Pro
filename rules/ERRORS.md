# 🛠️ ERRORS

> **VERSION**: 5.5 — Antigravity 2.0 Smart-Hybrid Edition | **LOAD**: When errors or CLI gate failures occur | **PURPOSE**: Deterministic CLI Gate Auto-Repair, Warm Sub-agent Auto-Revive (`send_message`), & Cross-Engine Escalation Protocols

---

## CORE PRINCIPLE

```
Every error MUST lead to:
  1. Automatic self-healing / targeted warm sub-agent repair via send_message, OR
  2. Explicit user decision (via ask_question UI widget when available)

❌ FORBIDDEN: Silent halt, unexplained termination, or cold re-spawning a sub-agent that already has a warm conversationId
```

---

## ERROR CLASSIFICATION (`E0–E6`)

| Code | Type | Description | Deterministic Response |
|------|------|-------------|------------------------|
| **E0** | **Sub-agent Interrupted / Server Restart** | Sub-agent stopped mid-task or tool server restarted (`invoke_subagent` aborted) | **Warm Auto-Revive**: Call `send_message(Recipient: conversationId, Message: "Continue from current state and report via send_message")` to resume the exact warm sub-agent without losing context. |
| **E1** | **Transient Tool / Network Error** | Timeout, network hiccup, temporary CLI/RPC error | Retry up to `3x` with backoff; on Windows shell mismatch, use native PowerShell / Node fallback. |
| **E1b** | **Deliverable Cohesion / Size Overflow** | Artifact exceeds `500` lines or multi-doc `/docs` suite is too large for 1 write | Keep **ALL** Brain Artifacts (`RESEARCH`, `BRAINSTORM`, `DESIGN`, `PLAN`, `DEBUG`, `TEST`, `REVIEW`) as **1 cohesive single file (`≤ 500` lines)** — NEVER split them into `{name}/` folders! For `> 500`-line epics, compile phases into `.boomopen/project-ledger.json` (`boomopen ledger from-plan`); chunk into `00-index.md` + `01-*.md` **only** inside `./documents/knowledge-*/` (`/docs:core`). |
| **E2** | **Recoverable Build / Type / Test / `check` Failure** | Compilation, typecheck, test failure, or `boomopen check --strict-phase --no-stubs` violation | Route exact `File:Line` error output back ONLY to the owning warm shard (`role#shard -> conversationId`) via `send_message` to fix and re-verify iteratively until `0` errors remain. |
| **E3** | **Blocking Contract or Requirement Conflict** | Contradictory spec, missing credential/resource, or breaking `SHARED_CONTRACT` change | Pause affected shard → evaluate options → auto-resolve if clear (`autonomous_first`) or prompt user via `ask_question` with `(Recommended)` first option. |
| **E4** | **Cascading Cross-Shard Drift** | Breaking contract change affects sibling parallel shards | Stop propagation → Rollback affected `OWNED_FILES` → `tech-lead` updates `SHARED_CONTRACT` → Broadcast delta to warm sibling shards via `send_message`. |
| **E5** | **Deterministic CLI Gate Failure (`research` / `design` / `plan` / `cook` / `ledger`)** | `boomopen research validate`, `boomopen design validate` (`DESIGN-G1..G4`), `boomopen plan validate` (`PLAN-G1..G5`), `boomopen cook <preflight\|verify-wave>`, or `boomopen ledger verify` exits non-zero | Route the exact failed gate IDs (`RESEARCH`/`DESIGN-G1..G4`/`PLAN-G1..G5`/wave lock/stub/ledger check) to the owning warm specialist shard (`researcher` / `designer` / `planner` / `engineer#shard`) via `send_message`, repair immediately, and re-run the CLI validator until exit `0`! |
| **E6** | **Round-2 Debug / Review Deadlock** | Same model family fails to resolve a root-cause bug, Heisenbug, or test failure after `2` rounds | **Cross-Engine Escalation**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct dispatch --role debugger --engine cross_family --author-engine <prev> --prompt "<failure-context>"` so a second model family breaks the blind spot. |

---

## RECOVERY PROTOCOL

```yaml
on_error:
  1. CAPTURE: error code, failed CLI gate ID, phase/wave, role#shard, conversationId, owned_files
  2. CLASSIFY: E0 / E1 / E1b / E2 / E3 / E4 / E5 / E6
  3. ATTEMPT deterministic recovery:
     E0: Resume warm sub-agent via send_message(Recipient: conversationId, Message: "Resume task and report results")
     E1: Retry tool call (max 3) or use cross-platform PowerShell / Node fallback
     E1b: Compress Brain Artifact to 1 cohesive file (<= 500 lines) or sync epic to .boomopen/project-ledger.json
     E2: Send exact File:Line log to warm role#shard via send_message + re-run tests & `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <dir> --strict-phase --no-stubs`
     E3: Apply autonomous_first if safe, otherwise escalate via ask_question UI widget
     E4: Rollback owned_files, amend SHARED_CONTRACT, broadcast delta to warm shards via send_message
     E5: Repair failing artifact/wave via warm send_message and re-run `boomopen <research|design|plan|cook|ledger> validate/verify-wave` until exit 0
     E6: Escalate after Round 2 via `boomopen conduct dispatch --role debugger --engine cross_family --author-engine <prev> --prompt "<failure-context>"`
  4. RESUME workflow immediately upon exit 0 verification
  5. NEVER halt silently
```

---

## USER ESCALATION (`ask_question` UI Widget Preferred)

When user input is required to resolve a genuine blocking `E3`/`E4` decision, use `ask_question` (with `(Recommended)` first) or present:

```markdown
## ⚠️ BLOCKED — Decision Required
**Error**: {description} | **Impact**: {affected shards/files}
- **A) {Recommended option}** — {tradeoff} *(Recommended)*
- **B) {Alternative}** — {tradeoff}
- **C) {Provide input / credentials}** — {what is needed}
```

---

## ANTI-PATTERNS (`A1–A14`)

| Code | Anti-Pattern | Correct `v5.5` Behavior |
|:----:|--------------|-------------------------|
| **A1** | Orchestrator coding/crawling in Mode B | In Mode B (`> 2 files`, `≥ 2 domains`, or `/cmd`), delegate to shards; execute directly ONLY in Mode A (`≤ 2` known files, `1` domain) |
| **A2** | Bypassing deterministic CLI gates | Always pass `boomopen research\|design\|plan validate`, `cook verify-wave`, and `check --strict-phase --no-stubs` before advancing |
| **A3** | Silent halt or unverified fix | Never stop after an unverified edit; run repro + tests + `check` until `100%` green or report explicit blocker |
| **A4** | Weakening or skipping regression tests | Lock pre-existing `tests/**` in `READ_ONLY_FILES`; never use `.skip`/`.only` or hollow assertions to pass |
| **A5** | Lazy TIER 2 fallback or `TypeName: "research"` trap | Always use TIER 1 `invoke_subagent(TypeName: "self", Model: "inherit")` whenever tools exist (`TypeName: "research"` has NO network/write/shell!) |
| **A6** | Stalling Turn 1 on vague questions | Follow `clarification.style = autonomous_first`: explore/state explicit assumptions first; ask `ask_question` only on genuine contradictions |
| **A7** | Unauthorized `SHARED_CONTRACT` / `OWNED_FILES` trespass | Treat `SHARED_CONTRACT` and `READ_ONLY_FILES` as hard locks; escalate via `[ESCALATION]` if contract changes are needed |
| **A8** | Serializing independent waves/shards | Launch independent vectors/shards (`researcher#v1..k`, `debugger#h1..k`, Wave 2 feature shards) concurrently in ONE turn |
| **A9** | Redundant middleman or re-discovery hops | Fast-forward past already-existing `SCOUT`/`RESEARCH`/`DESIGN`/`PLAN`/`DEBUG` artifacts (`boomopen cook state`) |
| **A10** | Downgrading model quality | Mandatory `Model: "inherit"` (Pro High default); `"flash"` strictly for trivial chores; **NEVER `"flash_lite"`** |
| **A11** | Cold re-spawning warm sub-agents | Reuse `role#shard -> conversationId` via `send_message(Recipient: conversationId)` across all review/test/fix rounds |
| **A12** | Concurrent writes to the same file | Lock disjoint `OWNED_FILES` (`≤ 3–4` files/shard) and disjoint scratch notes (`*-v{k}.md` / `*-h{k}.md`, `UserFacing: false`) |
| **A13** | Overloading 1 sub-agent with `> 4` files | Enforce the Cognitive Load Sharding Law ($N_{\text{agents}}$, `≤ 3–4` heavy files or `1` deep vector per shard) |
| **A14** | Re-running `/plan`, `/design`, or `/debug` after `"Proceed"` | When user clicks **"Proceed"** (`RequestFeedback: true`) on `PLAN`, `DESIGN`, or `DEBUG`, fast-forward directly into execution (`/code` / `/cook` / `/fix`)! |

---

## RESILIENCE GUARANTEES

- Zero tasks silently skipped; interrupted warm shards auto-revive via `send_message(Recipient: conversationId)`.
- Zero parallel write collisions via disjoint `OWNED_FILES` and `*-v{k}.md` / `*-h{k}.md` locks.
- Every CLI gate failure (`E5`) and build/test error (`E2`) triggers deterministic warm auto-repair until verified exit `0`.
