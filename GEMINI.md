# ⚡ BoomOpen Workflow Kit v5.5 — GEMINI/ANTIGRAVITY SMART-HYBRID EDITION

> **ZERO-LATENCY ENTRYPOINT**: This file (`GEMINI.md`) is pre-loaded in `<user_rules>` on every turn.
> **DO NOT** read `rules/CORE.md` on Turn 1 for simple tasks. `rules/CORE.md`, `rules/PHASES.md`, `rules/AGENTS.md`, and `rules/TEAMS.md` are **Loaded On Demand** ONLY when **Mode B (Multi-Agent Orchestration)** or an explicit `/cmd` workflow is triggered.

<!-- BOOMOPEN-SETTINGS-START -->
## 🎛️ ACTIVE USER SETTINGS OVERRIDE (Managed via `/settings` & `~/.boomopen/settings.json`)
> **PRECEDENCE**: `1. Explicit Turn Command (/cmd:variant, @fast/@deep/@team)` > `2. Workspace ./.boomopen.json` > `3. Active Settings Below` > `4. Default File Rules`.
- **Active Preset**: `smart-hybrid` | **Execution Mode (`execution.mode`)**: `auto` (`auto` = **Proactive Sub-agent First**: Spawn parallel subagents on Turn 1 (your platform's subagent tool; a read-only scout for scouting) whenever scope is unknown, requires scouting/audit/research across > 2 files, or spans ≥ 2 domains; use Mode A Direct ONLY for known-target micro-edits ≤ 2 files or simple Q&A; `mode_a` = Force Direct Solo Mode unless `:hard`/`:team`/`/orchestrate`; `mode_b` = Force Multi-Agent Orchestrator; `team` = Force Golden Triangle 3-Agent `:team`) | **Swarm Scaling (`execution.swarmScaling`)**: `elastic` | **Max Parallel Sub-agents (`execution.maxParallelSubagents`)**: `8`
- **Workflows**: `defaultVariant = auto` (`auto`|`fast`|`hard`|`team`|`ask`) | `naturalLanguageResearchTrigger = auto_team` (`auto_team` routes NL research/ideation/review to `:team` and NL plan/design/debug/fix/test/cook/docs to `commands/{cmd}-{variant}.md` across all 17 languages | `auto_hard` → `:hard` | `ask_first` | `off`)
- **Intelligence & Research**: `models.subagentPolicy = quality_first` (`inherit` = subagents inherit the session model; never downgrade core roles) | `research.depth = 5_lens_deep` | `clarification.style = autonomous_first` | `teams.maxDebateRounds = 3` | **Cross-Engine Routing (`engines.*`)**: `researcher=current, planner=current, coder=current, debugger=current, reviewer=current, council=[claude,codex,antigravity]`
- **Standards & Verification**: `codingStandards.preset = pragmatic` (Soft `400` / Hard `500` lines, `forbidExplicitAny = true`, `warnConsoleLog = true`) | `verification.level = strict_e2e`
- **Deliverables & Language**: `deliverables.routing = brain_artifacts` (`brain_artifacts` = `<appDataDir>\brain\<conversation-id>\` on Antigravity, `./reports/{topic}/` elsewhere) | `language.response = auto`
<!-- BOOMOPEN-SETTINGS-END -->

---

## 📏 PRAGMATIC 2-TIER CODING STANDARDS & PERSISTENT VERIFICATION (MANDATORY)

> **Precedence**: the line limits (`Soft` / `Hard`) and the Mode-A file threshold in the ACTIVE USER SETTINGS block above (and a workspace `./.boomopen.json`) override the default numbers in this section; `boomopen check` enforces the active limits.

### 🛡️ Tier 1 — Strict Quality & Safety Rules (Zero Tolerance):
1. **Single Responsibility**: Each file or function solves **1 clear responsibility**.
2. **NO explicit `any`**: TypeScript MUST use concrete types, `unknown` + Type Guard/Zod, or Generic `<T>`.
3. **NO leftover `console.log` in Production App**: Use a structured logger (`debug/info/warn/error`) in UI/API/Services; remove temporary debug logs. *(Allowed in CLI tools `cli/*.js`, scripts, and test benchmarks).*
4. **Error Handling & Named Constants**: Every async/API boundary MUST have `try/catch` + typed error handling; business/config constants use `SCREAMING_SNAKE_CASE`.
5. **DRY & Clean Imports**: Extract shared logic repeated ≥ 3 times; sort imports (`external → internal → relative`) and remove unused imports.

### 📐 Tier 2 — Flexible Structural Guidelines (Cohesion Over Mechanical Line Cutting):
| Guideline | Soft Target | When to Split (Pragmatic — Anti-Fragmentation) |
|-----------|:-----------:|------------------------------------------------|
| **File length** | **~200–350 lines** *(flexible up to ~400–450 lines)* | Keep intact if serving 1 cohesive responsibility. Split ONLY when exceeding `~450–500` lines **OR** mixing multiple domains. *(Exempt: Test, Schema/Types, Markdown/Docs; the kit's own instruction Markdown has a separate `boomopen doctor` budget: rules 300, commands/agents/teams/i18n/skills 450 lines).* |
| **Function length** | **~20–40 lines** *(logic)* / **~40–80 lines** *(UI/Handler)* | Extract sub-functions only for reuse (DRY) or an independent step. Never shatter simple sequential logic. |
| **Line width** | **~100–120 chars** | Fully flexible for long strings, URLs, Regex, Tailwind CSS classes, or Markdown tables. |
| **Nesting & Params** | **≤ 3–4 levels** / **≤ 4–5 params** | Prefer Guard Clauses (early returns); use a Config/Options object for multiple optional parameters. |

### 🔄 Persistent Testing & Bug Fixing:
- Never stop after applying an unverified fix. Always run build/typecheck/tests or reproduction commands end-to-end, iteratively fix any new errors, and report only when verified working.

---

## 🚦 PROACTIVE SUB-AGENT FIRST GATE (TURN-1 ZERO-TAX FAN-OUT, MODE B & MODE A)

### 🚫 Anti-Solo-Crawling Rule (MANDATORY)
- If the exact target files are **NOT already known on Turn 1**, OR if a task requires exploring/auditing/reading **`> 2 files`** across the codebase, **NEVER crawl files sequentially in the primary agent!** **IMMEDIATELY spawn parallel subagents on Turn 1** so the parent context window stays 100% clean.

### 🚀 Fast Parallel Sub-agents (Turn-1 Zero-Tax Fan-Out — Ad-Hoc Codebase Q&A Only)
- **Scope Guard**: Use this ad-hoc zero-report path **ONLY** for open-ended codebase lookups/questions (*"where is X?"*, *"how does Y work?"*) that do **NOT** match a workflow intent in the Intent Routing table below. If the user's natural-language request matches a workflow intent (planning, UI/UX design, research, brainstorming, review/audit, debugging, bug-fixing `> 2 files`, testing, end-to-end feature building, docs, reporting, deployment), **MUST route to Mode B `commands/{cmd}-{variant}.md`!**
- Spawn subagents **immediately on Turn 1** with **0 pre-flight rule-file reads**, **0 `define_subagent` overhead**, and **0 mandatory `.md` report clutter**:
  - **Read-Only Local Codebase Scouting/Grep/Mapping**: `invoke_subagent(TypeName: "research", Role: "Codebase Scouter", Model: "inherit", Prompt: ...)`
  - **Parallel Code Edits, Testing, Debugging, or Live Web Research (`search_web`)**: `invoke_subagent(TypeName: "self", Role: "Backend Engineer" | "Frontend Engineer" | "QA Tester" | "Deep Researcher", Model: "inherit", Prompt: ...)`

### 🎻 MODE B — Strict Multi-Agent Orchestration & Golden Triangle (TIER 1 — Deep Path)
- **When ANY of the following is true**:
  1. User explicitly invokes a BoomOpen workflow command (`/cook`, `/fix`, `/research`, `/plan:hard`, `/brainstorm:hard`, `/review:team`, `/docs:core`, `/orchestrate`, etc.).
  2. Task spans **`> 2 files`** or **`≥ 2 domains`** (e.g., Database + Backend + Frontend + Security).
  3. Task requires architectural design, complex cross-module debugging, or adversarial Golden Triangle review (`:hard` / `:team`).
  4. **Multilingual Natural-Language Workflow Intent (All 17 Supported Languages: `en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`)** — EVEN IF 0 `/` commands are typed, any natural-language request matching planning (`/plan`), UI/UX design (`/design`), deep research (`/research`), brainstorming/ideation (`/brainstorm`), code/repo/security review & audit (`/review`), root-cause debugging (`/debug`), multi-file bug-fixing (`/fix`), testing (`/test`), end-to-end feature building (`/cook`), executing an approved plan (`/code`), or docs/reporting/deploy (`/docs`, `/report`, `/deploy`) MUST automatically load and execute its canonical `commands/{cmd}-{variant}.md` workflow from the Intent Routing table below!
- **Turn-1 Instant Dispatch**: Do **NOT** waste Turn 1 reading `rules/CORE.md` + `rules/PHASES.md` + `rules/AGENTS.md` before spawning subagents! The 5-Field Handoff Packet is pre-embedded below. When `/cmd` is invoked, read `commands/{cmd}.md` AND launch Phase 1 subagents (`TypeName: "self"`, `Model: "inherit"`) in the **same Turn-1 tool batch**, using **DAG-Aware Parallel Fan-Out**, **Direct Plan-to-Executor Dispatch**, **Contract-First Handoffs (`SHARED_CONTRACT` + `OWNED_FILES`)**, and **Warm Sub-agent Session Reuse (`send_message` by `conversationId`)**.

### ⚡ MODE A — Known-Target Micro-Direct (TIER 0 — `≤ 2 Known Files`, `1 Domain`, 0 Exploration Needed, No `/cmd`)
- **When**: Strictly for simple Q&A, code explanations, or micro-edits where the **exact 1–2 target files are already known on Turn 1**, 0 exploration is needed, and no `/cmd` was invoked.
- **Action**: Execute, test, and verify directly while enforcing **Pragmatic 2-Tier Coding Standards** and **Persistent Testing & Bug Fixing**.

### 📈 Dynamic Elastic Sub-Agent Scaling & Cognitive Load Sharding (`1 → 2–3 → 4–6 → 8+` Parallel Sub-Agents)
- **Cognitive Load Sharding Law**: Each sub-agent owns **at most `3–4` heavy files or `1` deep research/audit vector** (`N_agents = min(maxParallelSubagents, max(ceil(Files / 3.5), Domains, Vectors))`). Never overload a single sub-agent with `> 4` files!
- **4-Tier Elastic Swarm Sizing**: Tier 0 (`0` subagents for `≤ 2` known files) | Tier 1 (`2–3` subagents for `3–5` files) | Tier 2 (`4–6` subagents for `6–12` files or `3–5` vectors/domains) | Tier 3 (`7–10+` subagents for `13+` files / full-repo audits, up to `execution.maxParallelSubagents`).
- **Scoped Role-Shard Keys (`role#shard`)**: When multiple sub-agents of the same role run in parallel (e.g., `backend-engineer#auth`, `backend-engineer#billing`, `scouter#1`, `scouter#2`), assign disjoint `OWNED_FILES` (`≤ 3–4` files/shard) and track `role#shard → conversationId` for Warm Session Reuse (`send_message`).
- **Elastic Golden Diamond (`:team`)**: Scales from `1-1-1` (`3` agents for `≤ 4` files) to `1 Tech Lead + N Parallel Executors (2–6) + M Parallel Critics (1–3)` when tasks span `≥ 2` domains or `> 4` files.
- **🛑 Turn-End Silence Guard (Anti-Repetition & Zero-Waiting-Loop Rule)**: Immediately after dispatching parallel subagents via `invoke_subagent` (or asynchronous background tasks), output **ONLY a brief single-paragraph summary (≤ 2–3 sentences)** listing the spawned roles/vectors and **STOP GENERATING TOKENS IMMEDIATELY** (call no more tools, emit end-of-turn). **NEVER** simulate waiting, poll in text, or generate repetitive status phrases (*"Subagents đang chạy...", "Subagents đang xử lý...", "Subagents sẽ phản hồi...", "Subagents đang tổng hợp..."*). Antigravity automatically wakes the session up when subagents reply.

---

## 🧠 QUALITY-FIRST MODEL POLICY (`Model: "inherit"` / PRO HIGH DEFAULT)

- **Default (`Model: "inherit"` / Pro High)**: Mandatory for all core engineering, planning, architecture, scouting, debugging, testing, reviewing, security, design, and documentation subagents. Always inherit the user's selected model (`Model: "inherit"` or `"pro"`).
- **Trivial Chores Only (`Model: "flash"` — Latest Flash High)**: Permitted **ONLY** for trivial mechanical chores (raw log aggregation, simple list formatting, status ping). When in doubt, ALWAYS use `Model: "inherit"`.
- **Forbidden (`flash_lite`)**: **NEVER use `flash_lite`** in any BoomOpen workflow.

---

## 📂 PATHS & ARTIFACT ROUTING (ANTIGRAVITY 2.0)

```
COMMANDS  = ~/.gemini/config/skills/boomopen-workflow-kit/commands/
AGENTS    = ~/.gemini/config/skills/boomopen-workflow-kit/agents/
SKILLS    = ~/.gemini/config/skills/
LIBRARY   = ~/.gemini/config/skills_library/
RULES     = ~/.gemini/config/skills/boomopen-workflow-kit/rules/
CLI       = ~/.gemini/config/skills/boomopen-workflow-kit/cli/install.js
ARTIFACTS = <appDataDir>\brain\<conversation-id>\
```

- **Brain Artifacts First (Clean Git Tree)**: Default transient deliverables (`PLAN`, `DESIGN`, `RESEARCH`, `BRAINSTORM`, `SCOUT`, `DEBUG`, `TEST`, `REVIEW`, `REPORT`, `MAILBOX`) MUST be written to `<appDataDir>\brain\<conversation-id>\` so they render in the Antigravity UI Artifact pane and keep the Git working tree 100% clean.
- **Workspace Docs**: Only write to `./reports/{topic}/` or `./documents/` when running `/docs` (`/docs:core`, `/docs:business`, `/docs:audit`) or when explicitly requested.

### 🛠️ Deterministic CLI Compilers & Gates (`node <CLI> <cmd>` or `boomopen <cmd>`)
- **`research <validate|brief>`**: Validate `RESEARCH-*` / `BRAINSTORM-*` (`--mode brainstorm`, `RES-G1..G4`) & compile `HANDOFF_BRIEF`.
- **`design <validate|contract>`**: Validate 6-Block `DESIGN-*` (`DESIGN-G1..G4`) & compile `DESIGN_CONTRACT` (`@theme` CSS + TypeScript props).
- **`plan <validate|compile>`**: Validate `PLAN-*` (`PLAN-G1..G5`, `≤ 4 OWNED_FILES`/shard) & compile `.boomopen/project-ledger.json`.
- **`cook <state|packets|verify-wave|preflight|amend-plan>`**: Detect artifacts, compile 5-Field Wave Handoff Packets, enforce `OWNED_FILES` / `READ_ONLY_FILES` + `--strict-phase --no-stubs`, & amend delta waves.
- **`reconcile` | `audit <init|slice|record|approve|verify-fix|status>`**: Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`: island detector, route & env parity) & stateful multi-round human-gated project audit ledger.
- **`ledger` | `conduct <probe|dispatch|council|status>` | `check --strict-phase --no-stubs` | `settings` | `doctor`**: DAG ledger, 6-task Multi-Engine Council (`research|brainstorm|plan|design|review|debug`), 2-Tier code gate, settings, & health check.

---

## 🌐 LANGUAGE

| Context | Language |
|---------|----------|
| Response to user | **Same as user's language** |
| Code & comments | **Always English** |
| Artifacts, `./reports/{topic}/`, `./documents/` | **Same as user's input language (technical terms in English)** |

---

## 🎯 COMMAND & MULTILINGUAL NATURAL-LANGUAGE INTENT ROUTING (Triggers Mode B — All 17 Languages)

> Speaking naturally in **any of the 17 supported languages** (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`) without typing `/` MUST automatically load and execute the matching `commands/{cmd}-{variant}.md` workflow:

| Explicit `/cmd` | Natural-Language Intent & Multilingual Cues (17 Languages) | Target Workflow (`commands/{cmd}.md` → `commands/{cmd}-{variant}.md`) |
|-----------------|------------------------------------------------------------|-----------------------------------------------------------------------|
| `/plan`, `/plan:hard`, `/plan:fast`, `/plan:team` | Plan / architect / roadmap (*"lên kế hoạch"*, *"lập kế hoạch"*, *"plan"*, *"implementation plan"*, *"制定计划"*, *"計画"*, *"계획"*, *"planificar"*, *"planifier"*, *"Plan erstellen"*) | Load `commands/plan-hard.md` (or `plan-team.md` when `:team`) |
| `/design`, `/design:hard`, `/design:fast`, `/design:team` | Design UI/UX / wireframe / design system (*"thiết kế giao diện"*, *"thiết kế UI/UX"*, *"design UI/UX"*, *"wireframe"*, *"界面设计"*, *"UI設計"*, *"UI 디자인"*) | Load `commands/design-hard.md` (or `design-team.md`) |
| `/research`, `/research:team`, `/research:hard`, `/research:fast` | Deep research / investigate / evaluate (*"nghiên cứu"*, *"tìm hiểu sâu"*, *"phân tích chuyên sâu"*, *"research"*, *"deep dive"*, *"深入研究"*, *"調査"*, *"심층 연구"*) | Load `commands/research-team.md` (or `research-hard.md`) |
| `/brainstorm`, `/brainstorm:team`, `/brainstorm:hard`, `/brainstorm:fast` | Ideate / explore options / propose ideas (*"khám phá ý tưởng"*, *"đề xuất ý tưởng"*, *"brainstorm"*, *"ideate"*, *"头脑风暴"*, *"ブレスト"*, *"브레인스토밍"*) | Load `commands/brainstorm-team.md` (or `brainstorm-hard.md`) |
| `/review`, `/review:team`, `/review:hard`, `/review:fast` | Code review / audit repo or security (*"review code"*, *"kiểm tra toàn bộ"*, *"audit"*, *"code review"*, *"代码审查"*, *"コードレビュー"*, *"코드 리뷰"*) | Load `commands/review-team.md` (or `review-hard.md`) |
| `/debug`, `/fix` (`:hard`, `:fast`, `:team`) | Find root cause (*"tìm nguyên nhân lỗi"*, *"debug"*, *"root cause"*, *"排查原因"*, *"原因調査"*) → `commands/debug-hard.md`; fix bugs `> 2 files` / unknown scope (*"sửa lỗi"*, *"fix bug"*, *"修复错误"*, *"バグ修正"*, *"버그 수정"*) → `commands/fix-hard.md` (`fix-team.md`) | Load `commands/debug-hard.md` or `commands/fix-hard.md` (`fix-team.md`) |
| `/test`, `/test:hard`, `/test:fast`, `/test:team` | Write / run comprehensive tests (*"viết test"*, *"kiểm thử"*, *"write/run tests"*, *"编写测试"*, *"テスト"*, *"테스트"*) | Load `commands/test-hard.md` (or `test-team.md`) |
| `/cook`, `/cook:hard`, `/cook:fast`, `/cook:team` | Build new feature end-to-end when no `PLAN` exists yet (*"xây dựng tính năng"*, *"làm tính năng..."*, *"build feature"*, *"implement end-to-end"*, *"开发新功能"*, *"新機能開発"*, *"기능 개발"*) | Load `commands/cook-hard.md` (or `cook-team.md`) |
| `/code`, `/code:hard`, `/code:fast`, `/code:team` | Execute approved `PLAN` (*"ok em làm đi"*, *"tiến hành đi"*, *"proceed"*, *"go ahead"*, *"implement the plan"*, *"开始执行"*, *"実行して"*, *"진행해"*) — do **NOT** re-run `/plan`! | Direct Plan-to-Executor Dispatch / `commands/code-team.md` |
| `/autopilot`, `/autopilot:init`, `/autopilot:run`, `/autopilot:audit` | Multi-session / multi-phase project execution from spec docs (*"điều hành dự án nhiều phase"*, *"đọc tài liệu code toàn bộ dự án"*, *"chạy tiếp phase tiếp theo"*, *"autopilot"*, *"multi-phase project"*) | Load `commands/autopilot.md` (`.boomopen/project-ledger.json` gate) |
| `/audit`, `/audit:run`, `/audit:fix`, `/audit:auto` | Multi-round whole-project post-completion audit & user-approved fixing (*"audit toàn diện dự án"*, *"kiểm toán toàn bộ dự án sau khi code xong"*, *"audit project"*, *"full project audit"*, *"全面项目审计"*, *"プロジェクト全体監査"*) | Load `commands/audit.md` (`.boomopen/audit-ledger.json` gate) |
| `/conduct`, `/conduct:council`, `/conduct:pipeline` | Multi-engine parallel council consensus or cross-platform pipeline (*"nhiều nền tảng cùng làm rồi tổng hợp"*, *"hội đồng đa mô hình"*, *"chạy song song Claude + Codex + Gemini"*, *"multi-engine council"*, *"cross-engine dispatch"*) | Load `commands/conduct.md` → `commands/conduct-council.md` (or `conduct-pipeline.md`) |
| `/docs`, `/report`, `/deploy`, `/ask`, `/orchestrate`, `/save`, `/recap`, `/settings` | Docs (*"viết tài liệu"*, *"write docs"* → `commands/docs-core.md`), report (*"báo cáo"*, *"status report"* → `commands/report-hard.md`), deploy (*"deploy"* → `commands/deploy-check.md`), Q&A (`/ask` → `commands/ask.md`), swarm (`/orchestrate` → `commands/orchestrate.md`), session (`/save`, `/recap`), settings (*"cài đặt"*, *"/settings"* → `commands/settings.md`) | Load `commands/{cmd}.md` → `commands/{cmd}-{variant}.md` |

**Variant syntax**: `/docs/core` = `/docs:core` → Load `commands/docs-core.md`
**Team variant baseline**: `:team` is supported where `commands/{cmd}-team.md` exists. Deploy uses specialized variants (`check`, `preview`, `production`, `rollback`).

---

## 🔀 TIERED EXECUTION & INTELLIGENT WORK DISTRIBUTION (v5.5)

| Tier | Mode / Condition | Action |
|------|------------------|--------|
| **TIER 1** | **Proactive Sub-agent First / Mode B** (Unscoped exploration, `> 2 files`, `≥ 2 domains`, NL research, or `/cmd`) | **MUST** spawn sub-agents on Turn 1 (`TypeName: "self"` 0-Turn Fast-Track or `TypeName: "research"` read-only; `Model: "inherit"`) + Direct Plan Dispatch + Warm Session Reuse (`send_message`) |
| **TIER 0** | **Mode A** (`≤ 2 known files`, 1 domain, 0 exploration, no `/cmd`) | Execute, test, and verify directly |
| **TIER 2** | **Mode B** fallback (tool missing/error) | EMBODY agent from `AGENTS` path |

### 🛠️ Antigravity 2.0 Native Sub-agent Primitives & Pre-Embedded 5-Field Handoff Packet (TIER 1)
- **⚡ `TypeName: "self"` (0-Turn Fast-Track Default)**: `invoke_subagent(TypeName: "self", Role: "<specialist>", Model: "inherit", Prompt: ...)` inherits full `write_file` + `run_command` + `search_web` immediately on Turn 1 without needing a prior `define_subagent` turn!
- **⚠️ `TypeName: "research"` Warning (NO Network & NO `write_file`)**: Antigravity's built-in `TypeName: "research"` has **NO network access (`search_web` disabled) and NO `write_file` tool** — **ALWAYS use `TypeName: "self"`** for `researcher`, `research-team`, any sub-agent needing `search_web`, or any `scouter` that writes `SCOUT-*.md`!
- **📦 Pre-Embedded 5-Field Handoff Packet (Include in `Prompt`)**: `1. MISSION & ACCEPTANCE CRITERIA` | `2. SHARED_CONTRACT` (API/schema/types when ≥2 domains) | `3. OWNED_FILES` (write lock) | `4. READ_ONLY_FILES` (do not edit) | `5. VERIFICATION & DELIVERABLE`.
- **Direct Plan-to-Executor Dispatch & Warm Session Reuse (`send_message`)**: Dispatch directly from `PLAN` to domain engineers (no `tech-lead` middleman hop) and record `Role → conversationId` to reuse warm sub-agents via `send_message(Recipient: conversationId, Message: ...)`.

---

## 📚 ON-DEMAND RULES (`RULES/`) — Load Only in Mode B

| File | Load When |
|------|-----------|
| `CORE.md` | Mode B orchestration laws & deliverable table needed |
| `PHASES.md` | Running multi-phase workflows, DAG Parallel Fan-Out & Contract-First dispatch |
| `AGENTS.md` | Delegating to 22 specialist sub-agents, File Ownership Locks & Warm Reuse |
| `TEAMS.md` | Executing 18 `:team` Golden Diamond / Triangle adversarial workflows |
| `SKILLS.md` | Resolving 1,440 library skills (`1,462` indexed in `compact-index.json`) via 2-step lookup (`<skills>` → `compact-index.json` / `skill-seeker`) |
| `ERRORS.md` / `REFERENCE.md` | Error recovery (`E0` warm auto-revive) or fast lookup tables |
