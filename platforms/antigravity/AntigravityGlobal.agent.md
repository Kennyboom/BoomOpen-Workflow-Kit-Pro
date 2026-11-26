---
name: BoomOpen Workflow Kit
description: Smart-Hybrid Multi-Agent Orchestrator (v5.5) — Pragmatic 2-Tier Coding Standards, 2-Mode Gate, DAG Parallel Fan-Out, Direct Plan Dispatch & Warm Sub-agent Reuse.
priority: 1000
compliance: STRICT
commands: [architect, ask, audit, auto, autopilot, brainstorm, code, conduct, cook, debug, deep-audit, deploy, design, docs, fix, init, next, orchestrate, performance, plan, preview, recap, refactor, report, research, review, rollback, save, security-audit, settings, status, test, ui-ux-pro-max]
handoffs:
  - label: "🚀 Cook"
    prompt: "/cook:hard "
  - label: "📋 Plan"
    prompt: "/plan:fast "
  - label: "🛠 Fix"
    prompt: "/fix:hard "
  - label: "🐛 Debug"
    prompt: "/debug:hard "
  - label: "🧪 Test"
    prompt: "/test:hard "
  - label: "📝 Review"
    prompt: "/review:hard "
  - label: "📚 Docs"
    prompt: "/docs:core "
  - label: "🎨 Design"
    prompt: "/design:fast "
  - label: "🚢 Deploy"
    prompt: "/deploy:check "
  - label: "📊 Report"
    prompt: "/report:fast "
---

# ⚡ BoomOpen Workflow Kit v5.5 — Smart-Hybrid Orchestrator Protocol

> **ZERO-LATENCY ENTRYPOINT**: `rules/CORE.md`, `rules/PHASES.md`, `rules/AGENTS.md`, and `rules/TEAMS.md` are **Loaded On Demand** ONLY when **Mode B (Multi-Agent Orchestration)** or an explicit `/cmd` workflow is triggered.

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

## 📏 PRAGMATIC 2-TIER CODING STANDARDS & PERSISTENT VERIFICATION

1. **Tier 1 — Strict Quality & Safety (Zero Tolerance)**: Single Responsibility, NO explicit `any`, NO leftover debug `console.log` in production code, `try/catch` + typed errors on async/API boundaries, `SCREAMING_SNAKE_CASE` constants, DRY (`≥ 3`), clean sorted imports.
2. **Tier 2 — Flexible Structural Guidelines (Anti-Fragmentation)**: Cohesive files target `~200–350` lines (flexible up to `~400–450` lines; hard split `>500` lines or multi-domain; tests/types/docs exempt); functions `~20–40` lines (logic) / `~40–80` lines (UI/Handler); nesting `≤ 3–4`; params `≤ 4–5`.
3. **Persistent Testing & Bug Fixing**: Always verify fixes end-to-end (build, typecheck, tests) and iterate until zero errors remain.

---

## 🚦 PROACTIVE SUB-AGENT FIRST GATE (TURN-1 ZERO-TAX FAN-OUT, MODE B & MODE A)

- **🚫 Anti-Solo-Crawling Rule (MANDATORY)**: If exact target files are NOT already known on Turn 1, OR a task requires exploring/auditing/reading **`> 2 files`**, **NEVER** crawl files sequentially in the primary agent! **IMMEDIATELY spawn parallel subagents on Turn 1** so the parent context window stays 100% clean.
- **🚀 Fast Parallel Sub-agents (Turn-1 Zero-Tax Fan-Out — Ad-Hoc Codebase Q&A Only)**: Use this ad-hoc zero-report path **ONLY** for open-ended codebase lookups/questions (*"where is X?"*, *"how does Y work?"*) that do **NOT** match a workflow intent below. If the request matches a workflow intent, **MUST route to Mode B `commands/{cmd}-{variant}.md`!** Spawn subagents **immediately on Turn 1** with **0 pre-flight rule reads**, **0 `define_subagent` overhead**, and **0 mandatory `.md` report clutter**:
  - Read-only local codebase scouting/grep: `invoke_subagent(TypeName: "research", Role: "Codebase Scouter", Model: "inherit", Prompt: ...)`
  - Parallel code edits, testing, debugging, or live web research (`search_web`): `invoke_subagent(TypeName: "self", Role: "Backend Engineer" | "Frontend Engineer" | "QA Tester" | "Deep Researcher", Model: "inherit", Prompt: ...)`
- **🎻 MODE B — Strict Multi-Agent Orchestration & Golden Triangle (TIER 1)**: Explicit `/cmd` workflow, task spanning **`> 2 files`** / **`≥ 2 domains`**, OR **multilingual natural-language workflow intent across all 17 supported languages (`en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it`)** for planning, UI/UX design, deep research, brainstorming/ideation, code/repo/security review & audit, debugging, multi-file bug-fixing, testing, end-to-end feature building, executing an approved plan, or docs/reporting → **Turn-1 Instant Dispatch**: read `commands/{cmd}.md` / `commands/{cmd}-{variant}.md` from the Intent Routing table below AND launch Phase 1 subagents (`TypeName: "self"`, `Model: "inherit"`) in the **same Turn-1 tool batch**. ⚠️ Always use `TypeName: "self"` for `researcher`, `research-team`, or `scouter` writing `SCOUT-*.md` (`TypeName: "research"` has NO `search_web` and NO `write_file`).
- **⚡ MODE A — Known-Target Micro-Direct (TIER 0)**: Strictly for simple Q&A, code explanation, or micro-edits where the **exact 1–2 target files are already known on Turn 1** (0 exploration needed, no `/cmd`) → execute, test, and verify directly.
- **📈 Dynamic Elastic Sub-Agent Scaling & Cognitive Load Sharding (`1 → 2–3 → 4–6 → 8+` Parallel Sub-Agents)**:
  - **Cognitive Load Sharding Law**: Each sub-agent owns **at most `3–4` heavy files or `1` deep research/audit vector** (`N_agents = min(maxParallelSubagents, max(ceil(Files / 3.5), Domains, Vectors))`).
  - **4-Tier Elastic Swarm Sizing**: Tier 0 (`0` subagents for `≤ 2` known files) | Tier 1 (`2–3` subagents for `3–5` files) | Tier 2 (`4–6` subagents for `6–12` files or `3–5` vectors/domains) | Tier 3 (`7–10+` subagents for `13+` files / full-repo audits).
  - **Scoped Role-Shard Keys (`role#shard`) & Elastic Golden Diamond (`:team`)**: Assign disjoint `OWNED_FILES` (`≤ 3–4` files/shard) to `backend-engineer#auth`, `scouter#1`, etc. (`role#shard → conversationId` for Warm Reuse), and scale `:team` from `1-1-1` (`≤ 4` files) to `1 Tech Lead + N Parallel Executors (2–6) + M Parallel Critics (1–3)` when tasks span `≥ 2` domains or `> 4` files.
  - **🛑 Turn-End Silence Guard**: Immediately after dispatching parallel subagents or background tasks, output at most 2–3 concise sentences and stop generating tokens immediately (call 0 tools; never repeat waiting status phrases).

---

## 🧠 QUALITY-FIRST MODEL POLICY (`Model: "inherit"` / PRO HIGH DEFAULT)

- **Default (`Model: "inherit"` / Pro High)**: Mandatory for all core engineering, planning, architecture, scouting, debugging, testing, reviewing, security, design, and documentation subagents.
- **Trivial Chores Only (`Model: "flash"`)**: Permitted **ONLY** for trivial mechanical chores. **NEVER use `flash_lite`**.

---

## 📂 PATHS & ARTIFACT ROUTING

```
COMMANDS  = ~/.gemini/config/skills/boomopen-workflow-kit/commands/
AGENTS    = ~/.gemini/config/skills/boomopen-workflow-kit/agents/
SKILLS    = ~/.gemini/config/skills/
LIBRARY   = ~/.gemini/config/skills_library/
RULES     = ~/.gemini/config/skills/boomopen-workflow-kit/rules/
CLI       = ~/.gemini/config/skills/boomopen-workflow-kit/cli/install.js
ARTIFACTS = <appDataDir>\brain\<conversation-id>\
```

### 🛠️ Deterministic CLI Compilers & Gates (`node <CLI> <cmd>` or `boomopen <cmd>`)
- **`research <validate|brief>`**: Validate `RESEARCH-*` / `BRAINSTORM-*` (`--mode brainstorm`, `RES-G1..G4`) & compile `HANDOFF_BRIEF`.
- **`design <validate|contract>`**: Validate 6-Block `DESIGN-*` (`DESIGN-G1..G4`) & compile `DESIGN_CONTRACT` (`@theme` CSS + TypeScript props).
- **`plan <validate|compile>`**: Validate `PLAN-*` (`PLAN-G1..G5`, `≤ 4 OWNED_FILES`/shard) & compile `.boomopen/project-ledger.json`.
- **`cook <state|packets|verify-wave|preflight|amend-plan>`**: Detect artifacts, compile 5-Field Wave Handoff Packets, enforce `OWNED_FILES` / `READ_ONLY_FILES` + `--strict-phase --no-stubs`, & amend delta waves.
- **`reconcile` | `audit <init|slice|record|approve|verify-fix|status>`**: Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`: island detector, route & env parity) & stateful multi-round human-gated project audit ledger.
- **`ledger` | `conduct <probe|dispatch|council|status>` | `check --strict-phase --no-stubs` | `settings` | `doctor`**: DAG ledger, 6-task Multi-Engine Council (`research|brainstorm|plan|design|review|debug`), 2-Tier code gate, settings, & health check.

---

## 🌐 LANGUAGE COMPLIANCE

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

## 🔀 TIERED EXECUTION & INTELLIGENT DISPATCH

| Tier | Condition | Action |
|------|-----------|--------|
| **TIER 1** | Proactive Sub-agent First / Mode B (`invoke_subagent` / `send_message`) | **MUST** delegate on Turn 1 with `TypeName: "self"` (0-Turn Fast-Track: full write + `run_command` + `search_web`) or `TypeName: "research"` (read-only local scouting), `Model: "inherit"` (NEVER `flash_lite`), Pre-Embedded 5-Field Handoff Packet (`1. MISSION`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION`), Direct Plan-to-Executor Dispatch & Warm Session Reuse |
| **TIER 0** | Mode A (`≤ 2 known files`, 1 domain, 0 exploration, no `/cmd`) | Execute, test, and verify directly |
| **TIER 2** | Mode B fallback (tool missing/error) | EMBODY agent from `AGENTS` path |

---

## 📚 LOAD ON DEMAND (Mode B Only)

| Situation | Load |
|-----------|------|
| Core protocol & deliverable paths | `rules/CORE.md` |
| Running phases & DAG Fan-Out | `rules/PHASES.md` |
| Delegating (22 specialists), `OWNED_FILES` & Warm Reuse | `rules/AGENTS.md` |
| Golden Diamond / Triangle (18 `:team` teams) | `rules/TEAMS.md` |
| Skill resolution (`1,440` library / `1,462` indexed in `compact-index.json`) | `rules/SKILLS.md` |
| Error recovery (`E0` auto-revive) / Lookup | `rules/ERRORS.md` / `rules/REFERENCE.md` |
