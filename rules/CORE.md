# ⚡ CORE RULES — SMART-HYBRID ORCHESTRATOR & ELASTIC SWARM PROTOCOL

> **VERSION**: 5.5 — Antigravity 2.0 Smart-Hybrid Edition | **LOAD**: On-demand when **Mode B** or `/cmd` is triggered | **PURPOSE**: Single source of truth for 17-Language Natural-Language Workflow Routing, Research/Design/Plan Validators (`boomopen research|design|plan`), 5-Stage Fast-Forward & 3-Wave Cook/Code Engine (`boomopen cook`), Multi-Session Autopilot Ledger, Cross-Engine Conductor (`boomopen conduct`), 4-Tier Dynamic Elastic Swarm & Pragmatic 2-Tier Coding Standards

---

## 🚦 PROACTIVE SUB-AGENT FIRST GATE & 4-TIER DYNAMIC ELASTIC SWARM

### 🧮 Cognitive Load Sharding Law (`MAX 3–4 Heavy Files or 1 Deep Vector per Sub-Agent`)
Never bottleneck a multi-file task inside a single overloaded sub-agent. Compute parallel sub-agent shards dynamically:

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

| Swarm Tier | Scope / Trigger Condition | Parallel Sub-Agents | Orchestration Action |
|------------|---------------------------|:-------------------:|----------------------|
| **Tier 0 — Micro Direct** | `≤ 2` already-known files, `1` domain, `0` exploration needed, no `/cmd`, no workflow intent | **`0` (Mode A)** | Primary agent executes, tests, and verifies directly under Pragmatic 2-Tier Coding Standards. |
| **Tier 1 — Focused Triad** | `3–5` files OR `2` domains / research vectors | **`2–3` sub-agents** | Spawn `2–3` parallel sub-agents on Turn 1 (`≤ 3–4 OWNED_FILES` per agent). |
| **Tier 2 — Elastic Swarm** | `6–12` files, `3–4` domains, OR `4–5` research/audit vectors | **`4–6` sub-agents** | Horizontally shard roles (`role#shard-1..N`), each locked to `≤ 3–4` disjoint `OWNED_FILES` + `SHARED_CONTRACT`. |
| **Tier 3 — Hyper-Swarm** | `13+` files, repo-wide audits, OR multi-module overhauls | **`7–10+` sub-agents** *(up to `execution.maxParallelSubagents`)* | Full horizontal sharding across modules (`scouter#1..N`, `engineer#shard-1..N`, `reviewer#1..M`) so every shard owns `≤ 3–4` files. |

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  🚫 ANTI-SOLO-CRAWLING RULE (MANDATORY)                                       │
│  • If the exact target files are NOT already known on Turn 1, OR if a task    │
│    requires exploring/auditing/reading > 2 files across the codebase, NEVER   │
│    crawl files sequentially in the primary agent! IMMEDIATELY spawn parallel  │
│    subagent shards on Turn 1 so the parent context window stays 100% clean.   │
├───────────────────────────────────────────────────────────────────────────────┤
│  🎻 MODE B — Explicit /cmd & 17-Language Natural-Language Workflow Routing    │
│  • Triggered when ANY of the following is true:                               │
│    1. User types an explicit command (/cook, /code, /autopilot, /conduct).    │
│    2. User speaks in natural language (without /cmd) in ANY of the 17         │
│       BoomOpen languages (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`,     │
│       `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it` +         │
│       semantic match) expressing a structured workflow intent:                │
│       - Plan / Architecture ("lên kế hoạch", "plan", "制定计划", "計画")      │
│         → Load `commands/plan-hard.md` (or `plan-team.md`)                    │
│       - UI/UX Design ("thiết kế UI/UX", "design spec", "设计界面", "UI設計")  │
│         → Load `commands/design-hard.md` (or `design-team.md`)                │
│       - Deep Research ("nghiên cứu", "research", "深入研究", "徹底調査")      │
│         → Load `commands/research-team.md` (`auto_team`) or `research-hard.md`│
│       - Brainstorm / Ideation ("khám phá ý tưởng", "brainstorm", "头脑风暴")  │
│         → Load `commands/brainstorm-team.md` (`auto_team`) or `-hard.md`      │
│       - Review / Audit ("review code", "đánh giá/audit", "代码审查")          │
│         → Load `commands/review-team.md` (or `review-hard.md`)                │
│       - Root-Cause Debug ("debug", "tìm nguyên nhân lỗi", "排查原因")         │
│         → Load `commands/debug-hard.md` (or `debug-team.md`)                  │
│       - Multi-File Bug Fix ("sửa lỗi", "fix bug", "修复bug" > 2 files)        │
│         → Load `commands/fix-hard.md` (or `fix-team.md`)                      │
│       - Testing / QA ("viết test", "kiểm thử", "write tests", "编写测试")     │
│         → Load `commands/test-hard.md` (or `test-team.md`)                    │
│       - Build Feature End-to-End ("xây dựng tính năng", "build feature")      │
│         → Load `commands/cook-hard.md` (or `cook-team.md`; check `cook state`)│
│       - Approved-Plan Execution ("ok, em làm đi", "tiến hành đi", "proceed",  │
│         "go ahead", "开始执行", "実行して", "진행해" after a PLAN exists)      │
│         → Load `commands/code-hard.md` / `commands/code-team.md` + run        │
│         `boomopen cook packets` (NEVER re-run `/plan` when approved!)         │
│       - Multi-Session Project Autopilot ("điều hành dự án nhiều phiên/phase", │
│         "chạy tiếp phase tiếp theo", "autopilot", "run next phase")           │
│         → Load `commands/autopilot.md` → `autopilot-{init|run|audit}.md`      │
│       - Cross-Engine Conductor & Multi-Engine Council ("cho cả 3 công cụ cùng │
│         nghiên cứu/phân tích rồi tổng hợp", "multi-engine council")           │
│         → Load `commands/conduct.md` → `conduct-{council|pipeline}.md`        │
│       - Docs / Report / Deploy ("viết tài liệu", "báo cáo", "deploy check")   │
│         → Load `commands/docs-core.md`, `report-hard.md`, or `deploy-check.md`│
│  • ⛔ NEVER bypass `commands/{cmd}-{variant}.md` with ad-hoc sub-agents when  │
│    a workflow intent matches! Read the mapped command file AND spawn Phase 1  │
│    shards (`TypeName: "self"`, `Model: "inherit"`) in the same Turn-1 batch.  │
├───────────────────────────────────────────────────────────────────────────────┤
│  🚀 AD-HOC CODEBASE Q&A FAN-OUT (Without /cmd — Pure File/Code Lookup Only)   │
│  • Strictly reserved for open-ended codebase Q&A / file lookups across > 2    │
│    files ("where is X defined?", "how does module Y work?") that do NOT match │
│    any structured workflow intent above: spawn `TypeName: "research"`         │
│    (`scouter#shard-1..N`, `Model: "inherit"`) with 0 `.md` report clutter.    │
└───────────────────────────────────────────────────────────────────────────────┘
```

**In Mode B**: **YOU ARE THE ORCHESTRATOR — NOT AN IMPLEMENTER.** Shard, delegate, coordinate, verify, and synthesize across specialist subagents.

---

## 🧠 QUALITY-FIRST MODEL POLICY (`Model: "inherit"` / PRO HIGH DEFAULT)

| Tier / Task Type | Allowed `Model` Parameter | Rule |
|------------------|---------------------------|------|
| **Core Engineering, Architecture, Planning, Scouting, Research, Ideation, Debugging, Testing, Reviewing, Security, Design, Docs** | `Model: "inherit"` (or `"pro"`) | **MANDATORY DEFAULT**: Always inherit the user's selected Pro High model so quality never drops. |
| **Trivial Mechanical Chores Only** (raw log aggregation, simple list formatting, status ping) | `Model: "flash"` (Latest Flash High) | Permitted **strictly** when zero architectural or coding reasoning is needed. When in doubt, use `"inherit"`. |
| **Low-Tier Model (`flash_lite`)** | **⛔ FORBIDDEN** | **NEVER use `flash_lite`** in any BoomOpen workflow. |

---

## 📂 PATHS, DETERMINISTIC CLI GATES & BRAIN ARTIFACT ROUTING

```bash
COMMANDS  = ~/.{TOOL}/skills/boomopen-workflow-kit/commands/
AGENTS    = ~/.{TOOL}/skills/boomopen-workflow-kit/agents/
SKILLS    = ~/.{TOOL}/skills/
LIBRARY   = ~/.{TOOL}/skills_library/
RULES     = ~/.{TOOL}/skills/boomopen-workflow-kit/rules/
ARTIFACTS = <appDataDir>\brain\<conversation-id>\ (Antigravity 2.0 default; maps to ./reports/{topic}/ on Claude Code, Codex, Cursor, Copilot)
REPORTS   = ./reports/{topic}/ (non-Antigravity fallback, /docs, or explicit repo export)
```

- **Cross-Platform Artifact & Metadata Fallback**: On non-Antigravity platforms (`Claude Code`, `OpenAI Codex`, `Cursor`, `GitHub Copilot`), `<appDataDir>\brain\<conversation-id>\` automatically maps to `./reports/{topic}/` and `ArtifactMetadata` is omitted on native file-write tools (`Write`, `apply_patch`, `editFiles`).
- **Deterministic CLI Gates (`~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js`)**:
  - `boomopen research <validate|brief> <file.md>` — Evidence-gated `RESEARCH` / `BRAINSTORM` validator (citations, audit log, options) & compact downstream brief extractor.
  - `boomopen design <validate|contract> <design.md>` — 4-Gate `DESIGN` validator (`DESIGN-G1..G4`) & `DESIGN_CONTRACT` extractor.
  - `boomopen plan <validate|compile> <plan.md> [--sync-ledger]` — 5-Gate `PLAN` validator (`PLAN-G1..G5`) & ledger compiler.
  - `boomopen cook <state|packets|verify-wave|preflight>` — 5-Stage Fast-Forward detector, 5-Field Handoff Packet emitter, & 3-Wave lock/anti-stub gate.
  - `boomopen check <dir> --strict-phase --no-stubs` — Pragmatic 2-Tier quality, line-limit, & anti-stub/anti-skip verifier.
  - `boomopen ledger <init|from-plan|validate|status|next|verify|audit>` & `boomopen conduct <probe|dispatch|council|status>`.

---

## 🎯 COMMAND & 17-LANGUAGE NATURAL-LANGUAGE ROUTING (Triggers Mode B)

> Full 17-language trigger matrices (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) live in `skills/intelligent-routing/SKILL.md`.

| Explicit `/cmd` or 17-Language Natural-Language Intent | Target Workflow File & CLI Gate |
|--------------------------------------------------------|---------------------------------|
| `/plan`, NL Planning & Architecture (*"lên kế hoạch"*, *"create a plan"*, *"制定计划"*, *"計画"*, *"계획"*) | `commands/plan.md` → `plan-hard.md` \| `plan-team.md` (`boomopen plan validate`) |
| `/design`, NL UI/UX & Design Spec (*"thiết kế UI/UX"*, *"design system"*, *"设计界面"*, *"画面設計"*) | `commands/design.md` → `design-hard.md` \| `design-team.md` (`boomopen design validate`) |
| `/research` \| `/brainstorm`, NL Deep Research & Ideation (*"nghiên cứu"*, *"brainstorm"*, *"深入研究"*) | `commands/research-team.md` \| `commands/brainstorm-team.md` (`auto_team`, `boomopen research <validate\|brief>`) |
| `/review` \| `/debug` \| `/fix` \| `/test` (`:fast`, `:hard`, `:team`) | `commands/{review\|debug\|fix\|test}-{hard\|team}.md` (`check --strict-phase --no-stubs`) |
| `/cook`, NL End-to-End Feature Build (*"xây dựng tính năng"*, *"build feature"*, *"开发新功能"*) | `commands/cook.md` → `cook-hard.md` \| `cook-team.md` (`boomopen cook <state\|packets\|verify-wave>`) |
| `/code`, **Approved-Plan Continuation** (*"ok, em làm đi"*, *"proceed"*, *"开始执行"*, *"実行して"*, *"진행해"*) | `commands/code.md` → `code-hard.md` \| `code-team.md` (`boomopen cook <packets\|verify-wave>`) |
| `/autopilot` (`:init`, `:run`, `:audit`), NL Multi-Session Project Autopilot | `commands/autopilot.md` → `autopilot-{init\|run\|audit}.md` (`boomopen ledger`) |
| `/conduct` (`:council`, `:pipeline`), NL Cross-Engine Conductor & Multi-Engine Council | `commands/conduct.md` → `conduct-{council\|pipeline}.md` (`boomopen conduct`) |
| `/docs`, `/report`, `/deploy`, `/ask`, `/orchestrate`, `/save`, `/recap`, `/settings` | `commands/{cmd}.md` → `commands/{cmd}-{variant}.md` |

---

## 🛠️ NATIVE SUB-AGENT PRIMITIVES, DIRECT DISPATCH & SCOPED WARM REUSE (`role#shard`)

- **⚡ `TypeName: "self"` (0-Turn Fast-Track Default)**: Spawns an isolated shard (`Role: "<role>#<shard>"`, `Model: "inherit"`) on Turn 1 with full `write_file` + `run_command` + `search_web` tools.
- **⚠️ `TypeName: "research"` Limitation**: Has **NO `search_web`, NO `run_command`, and NO `write_file`** — **ALWAYS use `TypeName: "self"`** for `researcher`, `research-team`, `brainstorm-team`, or any Mode B `scouter` writing `SCOUT-*.md`!
- **5-Field Packets & Warm Reuse**: Emit wave packets via `boomopen cook packets`, record `role#shard -> conversationId`, and reuse warm sessions via `send_message(Recipient: conversationId)` with **Reactive Async Wakeup**.

---

## 🌐 LANGUAGE, 📜 ORCHESTRATION LAWS & 📁 DELIVERABLES

- **Language**: Response & Artifacts → **Same as user's input language (technical terms in English)** | Code & comments → **Always English**.
- **Laws L1–L10**: **(L1–L2)** Zero-Latency Entry & 100% Requirement/Ledger Integrity; **(L3–L4)** 4-Tier Elastic Swarm (`≤ 3–4` files/shard) & Quality-First `Model: "inherit"`; **(L5–L6)** 3-Wave Contract-First (`SHARED_CONTRACT` + disjoint `OWNED_FILES`) & Language Compliance; **(L7–L8)** Direct Plan Dispatch (`boomopen cook state|packets`) & Scoped Warm Reuse (`role#shard -> conversationId`); **(L9–L10)** 4-Layer Phase Ratchet (`boomopen research|design|plan validate` + `boomopen cook verify-wave` + `check --strict-phase --no-stubs` + `ledger verify` + `conduct`) & Clean Git Tree.

| Agent Group | Antigravity 2.0 Brain Artifact Default | Workspace Path (Only on `/docs` or Explicit Export) |
|-------------|----------------------------------------|-----------------------------------------------------|
| brainstormer / researcher / scouter / council | `<appDataDir>\brain\<conversation-id>\{BRAINSTORM\|RESEARCH\|SCOUT\|COUNCIL}-{topic}.md` (**standalone `RESEARCH-{topic}.md` & `BRAINSTORM-{topic}.md` = 1 cohesive file `≤ 500` lines with `ArtifactMetadata.RequestFeedback: true` when proposing actionable next steps + validated via `boomopen research <validate\|brief>`**; `SCOUT`, internal `COUNCIL`, & per-shard `*-v{k}.md` / `*-s{k}.md` notes use `UserFacing: false, RequestFeedback: false`) | `./reports/{topic}/{type_plural}/{TYPE}-{topic}.md` |
| designer / planner / debugger / tester / reviewer | `<appDataDir>\brain\<conversation-id>\{DESIGN\|PLAN\|DEBUG\|TEST\|REVIEW}-{scope}.md` (**`PLAN-{scope}.md` & `DESIGN-{scope}.md` = 1 cohesive file `≤ 500` lines with `ArtifactMetadata.RequestFeedback: true` for 1-click "Proceed" button + validated via `boomopen plan validate` / `boomopen design <validate\|contract>` + optional `DESIGN-PREVIEW-{scope}.html`**; standalone `DEBUG` and defect-bearing `TEST`/`REVIEW` may set `RequestFeedback: true`; clean `TEST`/`REVIEW` & auto-continuing `/cook` stages use `RequestFeedback: false`) | `./reports/{topic}/{type_plural}/{TYPE}-{scope}.md` (and `./DESIGN.md`) |
| reporter / business-analyst / perf | `<appDataDir>\brain\<conversation-id>\{REPORT\|REQ\|PERF}-{scope}.md` (`RequestFeedback: false`) | `./reports/{topic}/{general\|requirements\|performance}/{TYPE}-{scope}.md` |
