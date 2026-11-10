---
description: "🏛️ Multi-Engine Parallel Council — Run Claude Code, OpenAI Codex, Antigravity, Cursor, and Copilot in parallel on the same Research, Plan, Review, Debug, or Brainstorm task with 4-Part Consensus Synthesis."
version: "5.5"
category: orchestration
execution-mode: execute
---

# /conduct:council — Multi-Engine Parallel Council & 4-Part Consensus Synthesis

> **MISSION**: Eliminate single-model blind spots and echo-chamber hallucinations by dispatching **$N$ distinct AI platforms (`claude`, `codex`, `antigravity`, `cursor`, `copilot` — default `claude,codex,antigravity`) concurrently in read-only mode on the exact same task**, then reconciling all $N$ independent outputs into a single cohesive Brain Artifact (`<appDataDir>\brain\<conversation-id>\COUNCIL-{topic}.md`, `<= 500` lines).

<task_and_engines>$ARGUMENTS</task_and_engines>

---

## ⚡ STEP 1: PROBE ENGINES & RESOLVE COUNCIL ROSTER (`conduct probe`)

1. **Probe Local AI CLI Engines & Active Runs**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct probe
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct status
   ```
   *(Or `boomopen conduct probe && boomopen conduct status`)* to inspect which external AI CLIs (`claude`, `codex`, `agy`/`gemini`, `cursor`, `copilot`) are installed on `PATH` versus queued fallback.
2. **Determine Council Roster (`--engines`) & Task Mode (`--task`)**:
   - **Engines**: Use engines explicitly named by the user (e.g., `claude,codex,antigravity`), or `engines.councilMembers` in `/settings` (default `claude,codex,antigravity` or `all_installed`).
   - **Task Mode**: Infer `--task` from the user's request:
     - `research` — Deep technical/documentation/market investigation (`RESEARCH-{topic}.md`)
     - `brainstorm` — Strategic product/architecture ideation & MCDA options (`BRAINSTORM-{topic}.md`)
     - `plan` — System architecture & 3-Wave contract-locked implementation plan (`PLAN-{topic}.md`)
     - `design` — OKLCH `@theme inline` tokens, 5-State UI matrix & `DESIGN_CONTRACT` (`DESIGN-{topic}.md`)
     - `review` — Multi-engine adversarial code, security & performance audit (`REVIEW-{topic}.md`)
     - `debug` — Multi-engine independent 5-Whys root-cause diagnosis (`DEBUG-{topic}.md`)

---

## 🚀 STEP 2: PARALLEL MULTI-ENGINE COUNCIL EXECUTION (`conduct council` + `invoke_subagent`)

Launch all participating engines **concurrently in a single turn** with **0% cross-contamination** and SHA-256 `READ_ONLY_FILES` snapshot protection:

1. **Execute `conduct council`**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js conduct council --task <research|brainstorm|plan|design|review|debug> --engines <e1,e2,e3> --prompt "<problem>" [--read-only "<files>"] --output "<appDataDir>/brain/<conversation-id>/COUNCIL-<topic>.md"
   ```
2. **0-Turn Native Sub-Agent Fallback & Augmentation (`invoke_subagent`)**:
   - In parallel with external CLI engines — or automatically whenever `conduct probe` shows one or more requested CLI binaries are not installed locally (`queued: true` in `.boomopen/conductor/queue/`) — spawn independent native specialist lenses (`scouter#lens`, `researcher#lens`, `reviewer#lens`) via **`invoke_subagent(TypeName: "self", Model: "inherit")`** and record `role#shard -> conversationId` for Warm Session Reuse (`send_message`), guaranteeing **at least 3 independent perspectives** in 1 parallel wave.

---

## 🧠 STEP 3: 4-PART CROSS-ENGINE CONSENSUS SYNTHESIS & `ArtifactMetadata`

Read the per-engine outputs and write `<appDataDir>\brain\<conversation-id>\COUNCIL-{topic}.md` (`<= 500` lines, single cohesive file — NEVER split into folders) with explicit `ArtifactMetadata`:
- **`COUNCIL-{topic}.md` & `RESEARCH` / `BRAINSTORM` / `DESIGN` / `REVIEW` / `DEBUG` Artifacts**: `ArtifactMetadata: { Summary: "4-Part Cross-Engine Council Synthesis", UserFacing: true, RequestFeedback: false }`
- **Actionable `PLAN-{topic}.md` Blueprint (when `--task plan`)**: `ArtifactMetadata: { Summary: "Council-Synthesized Implementation Plan", UserFacing: true, RequestFeedback: true }` (and validate via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<plan-path>"`; for `research`/`brainstorm` run `research validate`, and for `design` run `design validate`).

Include all **4 Mandatory Synthesis Sections**:

### 1. 🟢 Unanimous Consensus (Đồng thuận Tuyệt đối — Cả $N$ nền tảng cùng khẳng định)
- List every architectural decision, root cause, `SHARED_CONTRACT` type, or benchmark independently confirmed across multiple model families (`Claude` + `Codex` + `Antigravity`). These carry **highest confidence**.

### 2. 🟡 Unique Blind-Spot Insights by Engine (Góc nhìn Độc bản — Phát hiện riêng của từng nền tảng)
- Surface high-value edge cases, subtle vulnerabilities, concurrency hazards, or UX nuances caught by **only one engine**:
  - **🟣 Claude Code (Anthropic)**: Deep domain invariants, architectural cohesion, security & edge-case critique.
  - **🟢 OpenAI Codex**: Pragmatic execution paths, algorithm/concurrency boundaries, strict type safety & testability.
  - **🔵 Antigravity (Gemini)**: Broad ecosystem synthesis, SOTA patterns, cross-repo blast radius & UX ergonomics.

### 3. 🔴 Contradictions & Evidence-Weighted Arbitration (Điểm Bất đồng & Trọng tài Phân xử bằng Bằng chứng)
- Whenever two or more engines **disagree**, **NEVER average or hand-wave the conflict!**
- Verify claims directly against workspace source files (`read_file` with exact `file:line` anchors), automated test execution, or primary official documentation (`search_web` ONLY — never guess URLs) and record a **Binding Arbitration Verdict**:
  | Disputed Topic | Engine A Claim | Engine B Claim | Empirical Evidence (`read_file` / `search_web` / Tests) | 🏆 Binding Verdict |
  |:---------------|:---------------|:---------------|:--------------------------------------------------------|:-------------------|

### 4. 🏆 Final Synthesized Conclusion & Actionable Blueprint (Kết luận Tổng hợp Cuối cùng)
- Fuse **🟢 Unanimous Consensus** + validated **🟡 Unique Blind-Spot Insights** + **🔴 Arbitrated Winners** into one decision-ready blueprint (`SHARED_CONTRACT`, disjoint `OWNED_FILES` shards `<= 3–4` files/shard, architecture diagram, or prioritized fix plan).

### 5. 🔒 Downstream Canonical Artifact Validation Gates (When Emitting Task Blueprints)
When `--task` also materializes a canonical downstream artifact in `<appDataDir>\brain\<conversation-id>\`, run its deterministic CLI validator before presenting to the user:
```bash
# For --task research or brainstorm:
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/RESEARCH-<topic>.md"
# For --task design:
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<appDataDir>/brain/<conversation-id>/DESIGN-<topic>.md"
# For --task plan (set ArtifactMetadata.RequestFeedback: true):
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js plan validate "<appDataDir>/brain/<conversation-id>/PLAN-<topic>.md"
```

---

## ⛔ COMPLETION & NEXT ACTIONS

Present clickable `file:///` links to `<appDataDir>\brain\<conversation-id>\COUNCIL-{topic}.md` (and any validated `RESEARCH` / `PLAN` / `DESIGN` / `REVIEW` / `DEBUG` artifact), summarize the 4-Part Synthesis in the user's language, and offer:
1. 🎼 **`/conduct:pipeline`** → Execute the synthesized blueprint across multiple engines (`Claude` + `Codex` + `Antigravity`)
2. 🏛️ **`/autopilot:init` / `/autopilot:run`** → Compile into `.boomopen/project-ledger.json` and execute phase by phase
3. 💻 **`/code:team` or `/cook:team`** → Implement immediately with the 3-Wave Elastic Golden Diamond swarm
