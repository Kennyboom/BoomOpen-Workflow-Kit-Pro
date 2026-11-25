# 📚 REFERENCE

> **VERSION**: 5.5 — Frontier-Guardrails & Smart-Hybrid Edition | **PURPOSE**: Fast lookup tables for `36` Base Commands (`93` files = `87` workflows + `6` `_ref/`), Built-In Presets (`frontier-guardrails` default, `carbon-guardrails` alias, `smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team`), 17-Language Routing, 5-Stage Cook/Code + Wave 2.5 Reconcile (`boomopen cook|reconcile`), 5-Layer Phase Ratchet (`boomopen ledger|audit` + `rollback`), Cross-Engine Conductor (`boomopen conduct`), Antigravity `run_workflow` Templates, & Cross-Platform Tools (all 5 platforms)

---

## 🚦 4-TIER DYNAMIC ELASTIC SWARM MATRIX & COGNITIVE LOAD SHARDING LAW

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

| Swarm Tier / Path | Mode | Trigger Condition | Parallel Sub-Agents | Action & Sharding Rule (`≤ 3–4 OWNED_FILES` / Shard) |
|-------------------|------|-------------------|:-------------------:|------------------------------------------------------|
| **Tier 0 — Micro Direct** | **MODE A** | Simple Q&A, explanation, or micro-edit where **exact `≤ 2 files` are already known on Turn 1**, `1` domain, `0` exploration, no `/cmd`, no workflow intent | **`0`** | Execute, test, and verify **directly** (Pragmatic 2-Tier Coding Standards). |
| **Tier 1 — Focused Triad** | **MODE B** | Explicit `/cmd` or 17-language NL workflow intent spanning `3–5` files OR `2` domains/vectors | **`2–3`** | Load `commands/{cmd}-{variant}.md` & Turn-1 Instant Dispatch across 2–3 roles/vectors (`TypeName: "self"`, `Model: "inherit"`). |
| **Tier 2 — Elastic Swarm** | **MODE B** | Explicit `/cmd` or 17-language NL workflow intent spanning `6–12` files, `3–4` domains, OR `4–5` vectors | **`4–6`** | Load `commands/{cmd}-{variant}.md` & horizontally shard roles (`<role>#shard-1..N`), each locked to `≤ 3–4` disjoint `OWNED_FILES` + `SHARED_CONTRACT`. |
| **Tier 3 — Hyper-Swarm** | **MODE B** | Explicit `/cmd` or 17-language NL workflow intent spanning `13+` files, repo-wide audits, OR multi-module overhauls | **`7–10+`** *(up to `execution.maxParallelSubagents`)* | Full horizontal sharding across modules (`scouter#1..N`, `engineer#shard-1..N`, `reviewer#1..M`) + Scoped Warm Reuse (`role#shard -> conversationId`). |
| **💎 Elastic Golden Diamond** | **`:team` Variant** | Any `:team` workflow, `/autopilot:run`, or `auto_team` NL research/ideation trigger (`18` specialist teams) | **`3` to `10`** (`1` Lead + `1..6` Executor Shards + `1..3` Critics) | `≤ 4` files: Classic `1-1-1` (`3` agents). `> 4` files or multi-domain: `1 Tech Lead` + `2–6 Parallel Shard Executors` (`≤ 3–4` files each) + `1–3 Parallel Critics/Testers`. |
| **🎼 Cross-Engine Conductor** | **`/conduct`** | Multi-engine consensus (`council`) or cross-platform role pipeline (`pipeline`, `Author != Critic`) | **`2` to `5` Engines** (`claude`, `codex`, `antigravity`, etc.) | Run `boomopen conduct council` (4-Part Synthesis Matrix) or `boomopen conduct dispatch` (Cross-Family Role Pipeline & Round-2 Debug Escalation). |
| **🚀 Ad-Hoc Codebase Q&A** | **Fast Lookup** | Open-ended codebase Q&A / file lookup across `> 2` files (*"where is X?"*, *"how does Y work?"*) with **NO** workflow intent | **`2–4`** | Spawn `TypeName: "research"` (`scouter#shard-1..N`, `Model: "inherit"`) with `0` `.md` report clutter; never use to bypass structured workflows! |

---

## 🌐 14-WORKFLOW MULTILINGUAL NATURAL-LANGUAGE ROUTING TABLE (ALL 17 LANGUAGES)

> **Supported Languages (`17` + Semantic Match)**: `en`, `vi`, `zh-CN`, `zh-TW`, `ja`, `ko`, `es`, `fr`, `de`, `pt-BR`, `ru`, `hi`, `ar`, `id`, `th`, `tr`, `it` (see `skills/intelligent-routing/SKILL.md`). **NEVER** fall into unguided ad-hoc sub-agents when a user request matches any intent below!

| # | Natural-Language Workflow Intent (Examples in `en` / `vi` / `zh` / `ja` / `ko` / `es` / `fr`) | Auto-Routed Mode B Workflow (`commands/`) | Mandatory Brain Artifact / CLI Gate |
|:-:|-----------------------------------------------------------------------------------------------|-------------------------------------------|-------------------------------------|
| **1** | **Plan & Architecture**: *"create a plan"*, *"lên kế hoạch / lập kế hoạch"*, *"制定计划"*, *"実装計画"*, *"구현 계획"*, *"planificar"*, *"planifier"* | `commands/plan-hard.md` \| `plan-team.md` | `PLAN-{feature}.md` (`≤ 500` lines, `RequestFeedback: true`, `boomopen plan validate`) |
| **2** | **UI/UX & Design Spec**: *"design UI/UX"*, *"thiết kế giao diện / UI"*, *"设计界面"*, *"UI/UXデザイン"*, *"화면 설계"*, *"diseñar UI"* | `commands/design-hard.md` \| `design-team.md` | `DESIGN-{feature}.md` (`≤ 500` lines, `RequestFeedback: true`, `boomopen design validate`) + optional `DESIGN-PREVIEW-{feature}.html` |
| **3** | **Deep Research**: *"research / deep dive"*, *"nghiên cứu / tìm hiểu sâu"*, *"深入研究"*, *"徹底調査"*, *"심층 조사"*, *"investigar"* | `commands/research-team.md` (`auto_team`) \| `research-hard.md` | `RESEARCH-{topic}.md` (`≤ 500` lines, `RequestFeedback: true` when actionable, `boomopen research <validate\|brief>`) |
| **4** | **Brainstorm / Ideation**: *"brainstorm / propose ideas"*, *"khám phá / đề xuất ý tưởng"*, *"头脑风暴"*, *"アイデア提案"*, *"브레인스토밍"* | `commands/brainstorm-team.md` (`auto_team`) \| `brainstorm-hard.md` | `BRAINSTORM-{topic}.md` (`≤ 500` lines, `RequestFeedback: true`, `boomopen research <validate\|brief>`) |
| **5** | **Code / Security / Project Audit**: *"review / audit code or project"*, *"đánh giá / review / audit toàn diện dự án"*, *"代码审查 / 全面项目审计"*, *"コード監査"* | `commands/review-team.md` \| `review-hard.md` \| `commands/audit.md` (multi-round whole-project) | `REVIEW-{scope}.md` / `.boomopen/audit-ledger.json` |
| **6** | **Root-Cause Debug**: *"debug / find root cause"*, *"tìm nguyên nhân lỗi / tại sao lỗi"*, *"排查原因"*, *"原因究明"*, *"원인 파악"* | `commands/debug-hard.md` \| `debug-team.md` | `DEBUG-{issue}.md` |
| **7** | **Multi-File Bug Fix**: *"fix bug / resolve errors"*, *"sửa lỗi / khắc phục sự cố"*, *"修复bug"*, *"バグ修正"*, *"버그 수정"* (`> 2` files) | `commands/fix-hard.md` \| `fix-team.md` | `DEBUG` + `TEST-{issue}.md` |
| **8** | **Testing & QA**: *"write/run tests"*, *"viết test / kiểm thử"*, *"编写测试"*, *"テスト作成"*, *"테스트 작성"*, *"escribir pruebas"* | `commands/test-hard.md` \| `test-team.md` | `TEST-{feature}.md` (`check --strict-phase --no-stubs`) |
| **9** | **End-to-End Feature Build**: *"build/implement feature"*, *"xây dựng / làm tính năng mới"*, *"开发新功能"*, *"新機能実装"* | `commands/cook-hard.md` \| `cook-team.md` | `boomopen cook <state\|packets\|verify-wave>` + `PLAN` + Code + `TEST` + `REVIEW` |
| **10** | **Approved-Plan Execution**: *"proceed / go ahead / implement the plan"*, *"ok, em làm đi / tiến hành đi"*, *"开始执行"*, *"実行して"*, *"진행해"* (after `PLAN`) | `commands/code-hard.md` \| `commands/code-team.md` | `boomopen cook <packets\|verify-wave>` + Sharded Code (NO re-planning!) |
| **11** | **Project Documentation**: *"write/update docs"*, *"viết / cập nhật tài liệu"*, *"编写文档"*, *"ドキュメント作成"*, *"문서 작성"* | `commands/docs-core.md` \| `docs-business.md` \| `docs-audit.md` | `./documents/knowledge-*/` |
| **12** | **Status Report / Deploy Check**: *"status report / deploy check"*, *"báo cáo tiến độ / kiểm tra deploy"*, *"进度报告 / 部署检查"* | `commands/report-hard.md` \| `commands/deploy-check.md` | `REPORT-{type}-{date}.md` |
| **13** | **Multi-Session Project Autopilot**: *"run multi-phase project / next phase"*, *"đọc tài liệu làm toàn bộ dự án nhiều phase / chạy tiếp phase tiếp theo"*, *"多阶段项目自动驾驶"* | `commands/autopilot.md` → `autopilot-init.md` \| `autopilot-run.md` \| `autopilot-audit.md` | `.boomopen/project-ledger.json` + `.boomopen/ROADMAP-PROGRESS.md` |
| **14** | **Cross-Engine Conductor & Multi-Engine Council**: *"multi-engine council / use Claude to plan and Codex to code"*, *"cho cả 3 công cụ cùng nghiên cứu rồi tổng hợp"*, *"多引擎并行研究汇总"* | `commands/conduct.md` → `conduct-council.md` \| `conduct-pipeline.md` (`boomopen conduct`) | `.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md` + `COUNCIL-{topic}.md` |

---

## 🧠 QUALITY-FIRST MODEL POLICY

| Model | Permitted Usage | Rule |
|-------|-----------------|------|
| `Model: "inherit"` (or `"pro"`) | All 22 specialist agents across engineering, architecture, planning, scouting, research, ideation, debugging, testing, reviewing, reconciliation, security, design, docs | **MANDATORY DEFAULT** (Pro High quality) |
| `Model: "flash"` | Trivial mechanical chores only (raw log aggregation, simple formatting) | Only when 0 reasoning needed |
| `Model: "flash_lite"` | **NONE** | **⛔ STRICTLY FORBIDDEN** |

---

## 🔌 CROSS-PLATFORM TOOL VOCABULARY (read this before following any command or agent file)

Commands, agents and rules are written in the **Antigravity tool vocabulary** (the canonical names on the left). On every other platform, translate each name to the native tool below — never call a tool that does not exist on your platform.

| Canonical name (kit files) | Claude Code | OpenAI Codex | GitHub Copilot (VS Code) | Cursor |
|----------------------------|-------------|--------------|--------------------------|--------|
| `invoke_subagent(TypeName: "self", Role: "role#shard", Prompt)` | `Task` / Agent tool, `subagent_type` = agent name from `~/.claude/agents/` (or `general-purpose`) | `spawn_agent` with a role from `~/.codex/config.toml` (`[agents.<role>]`) | `runSubagent` | Built-in subagent / Task tool when available; otherwise TIER 2 EMBODY |
| `TypeName: "research"` (0-artifact ad-hoc Q&A only) | `subagent_type: "Explore"` | `spawn_agent` role `scouter` with a read-only prompt | `runSubagent` with read-only instructions | Read-only subagent prompt |
| `TypeName: "browser"` (`Model: "flash"`, live visual UI/DOM E2E) | Playwright MCP / `Bash` (`npx playwright test`) | Playwright MCP / shell (`npx playwright test`) | Playwright MCP / `runInTerminal` | Playwright MCP / terminal |
| `run_workflow(ScriptPath: ".../workflows/*.py")` | Parallel `Task` fan-out | Parallel `spawn_agent` fan-out | Parallel `runSubagent` fan-out | Parallel subagent / TIER 2 |
| `send_message(Recipient: conversationId)` (Scoped Warm Reuse `role#shard`) | `SendMessage` to the running agent when available; otherwise spawn again with the full 5-field packet | `send_input` + `wait` | Not available → call `runSubagent` again with the full packet | Not available → spawn again with the full packet |
| `Model: "inherit"` / `"pro"` | Omit `model` (inherits the session model) | Omit (role TOMLs inherit your configured model) | Omit (uses the selected chat model) | Omit |
| `Model: "flash"` (trivial chores only) | `model: "haiku"` | Omit | Omit | Omit |
| `search_web` / `read_url_content` | `WebSearch` / `WebFetch` | `web_search` (when enabled) / shell `curl` | `fetch` tool | `@Web` / web search tool |
| `read_file` / `view_file` / `grep_search` | `Read` / `Grep` / `Glob` | Shell (`cat`, `rg`) | `codebase` / read-file tools | Read file / codebase search |
| `write_file` / `edit_file` | `Write` / `Edit` | `apply_patch` | `editFiles` | Edit file tool |
| `run_command` | `Bash` / `PowerShell` | Shell | `runInTerminal` | Terminal tool |
| `ask_question` | `AskUserQuestion` | Ask in chat | Ask in chat | Ask in chat |
| `define_subagent`, `manage_subagents`, `manage_task` | Not needed (`~/.claude/agents/*.md`) | Not needed (`config.toml` roles) | Not needed | Not needed |
| Artifacts `<appDataDir>\brain\<conversation-id>\` | `./reports/{topic}/` | `./reports/{topic}/` | `./reports/{topic}/` | `./reports/{topic}/` |

> If a platform has no parallel sub-agent tool, run the shards sequentially yourself (TIER 2 EMBODY) — the 5-field packet, `OWNED_FILES` locks (`≤ 3–4` files/shard) and verification gates still apply.

---

## COMMAND TABLE & STANDALONE COMMANDS (`36` Base Commands / `93` Files = `87` Workflows + `6` `_ref/`)

| Command | Router | Variants | Standalone | File | Purpose |
|---------|--------|----------|------------|------|---------|
| `/cook` | `cook.md` | `fast`, `hard`, `team` | `/architect` | `architect.md` | C4, ADR, schema, API contracts (no code) |
| `/fix` | `fix.md` | `fast`, `hard`, `team` | `/auto` | `auto.md` | Autonomous end-to-end workflow execution |
| `/plan` | `plan.md` | `fast`, `hard`, `team` | `/deep-audit` | `deep-audit.md` | Logic audit of documentation before coding |
| `/debug` | `debug.md` | `fast`, `hard`, `team` | `/init` | `init.md` | Bootstrap a new greenfield project |
| `/test` | `test.md` | `fast`, `hard`, `team` | `/onboard` | `onboard.md` | 60s brownfield architecture map (`ARCHITECTURE-MAP.md`) |
| `/review` | `review.md` | `fast`, `hard`, `team` | `/next` | `next.md` | Detect state & recommend next workflow |
| `/docs` | `docs.md` | `core`, `business`, `audit` | `/performance` | `performance.md` | Performance budgets, profiling & tuning |
| `/design` | `design.md` | `fast`, `hard`, `team` | `/preview` | `preview.md` | Start / stop / check local preview server |
| `/deploy` | `deploy.md` | `check`, `preview`, `production`, `rollback` | `/refactor` | `refactor.md` | Behavior-preserving refactoring |
| `/report` | `report.md` | `fast`, `hard`, `team` | `/rollback` | `rollback.md` | Emergency recovery of code/deploy/DB |
| `/research` | `research.md` | `fast`, `hard`, `team` | `/security-audit` | `security-audit.md` | OWASP / STRIDE security audit & report |
| `/brainstorm` | `brainstorm.md` | `fast`, `hard`, `team` | `/status` | `status.md` | Agent and project status board |
| `/ask` | `ask.md` | `fast`, `hard` | `/ui-ux-pro-max` | `ui-ux-pro-max.md` | Design-system generation & UI/UX specs |
| `/code` | `code.md` | `fast`, `hard`, `team` | `/orchestrate` | `orchestrate.md` | Multi-agent domain & `run_workflow` orchestration |
| `/autopilot` | `autopilot.md` | `init`, `run`, `audit` | `/save`, `/recap` | `save.md`, `recap.md` | Save / restore session state & memory |
| `/audit` | `audit.md` | `run`, `fix`, `auto` | `/settings` | `settings.md` | Unified Settings & Presets (`frontier-guardrails` default) |
| `/conduct` | `conduct.md` | `council`, `pipeline` | `/release` | `release.md` | Semantic release, `CHANGELOG.md`, parity gates & tag |
| `/pr` | `pr.md` | `review` (`pr-review.md`) | — | — | Pre-PR quality/reconcile gate, `gh pr create` & PR review |

> On Claude Code, `/init`, `/review` and `/status` are also built-in commands; if the built-in one runs, ask for the kit workflow by name (e.g. "run the BoomOpen /review:hard workflow") or use a variant such as `/review:hard`.

---

## AGENT TABLE (22 Specialist Agents — Default `Model: "inherit"`)

| Category | Agents (`role#shard` when horizontally sharded `> 3–4` files) | Primary Tasks |
|----------|---------------------------------------------------------------|---------------|
| **meta** | `tech-lead`, `planner` | Architecture review, `:team` Diamond Arbitration, `PLAN` & `SHARED_CONTRACT` + shard allocation |
| **execution** | `backend-engineer`, `frontend-engineer`, `database-architect`, `mobile-engineer`, `game-engineer` | 3-Wave Contract-First sharded code & schema implementation (`≤ 3–4 OWNED_FILES` per shard) |
| **validation** | `tester`, `reviewer`, `spec-reconciler`, `security-engineer`, `performance-engineer`, `debugger` | Parallel `tester#1..k` QA, Wave 2.5 spec/wiring reconciliation, code review, OWASP pentest, profiling, debugging |
| **research** | `researcher`, `scouter`, `brainstormer`, `designer` | Multi-vector external/doc research, codebase mapping, grounded ideation, 6-Block UI/UX specs |
| **support** | `docs-manager`, `devops-engineer`, `business-analyst`, `project-manager`, `reporter` | Documentation suites, sharded CI/CD & IaC, BRD/requirements, project coordination, status reports |

---

## DELIVERABLE PATHS, CLI ENGINES & ORCHESTRATION LAWS (Quick Reference)

```yaml
brain_artifact_default: <appDataDir>\brain\<conversation-id>\{TYPE}-{topic}.md    # Antigravity only (standalone RESEARCH, BRAINSTORM, DESIGN, PLAN, DEBUG & defect-bearing TEST/REVIEW use RequestFeedback: true, single file <= 500 lines)
design_live_preview:    <appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{feature}.html  # Optional interactive HTML widget (generative_ui)
other_platforms:        ./reports/{topic}/{TYPE}-{feature}.md                       # Claude Code, Codex, Copilot, Cursor
docs_suite_workspace:   ./documents/knowledge-*/00-index.md
research_cli_validator: boomopen research <validate|brief> <file.md> [--mode research|brainstorm] [--json] # Evidence/citation gate for RESEARCH & BRAINSTORM + compact downstream brief (< 50ms)
design_cli_validator:   boomopen design <validate|contract> <design.md> [--json]                           # 4-Gate static design & DESIGN_CONTRACT validator (< 50ms)
plan_cli_validator:     boomopen plan <validate|compile> <plan.md> [--sync-ledger]  # 5-Gate static plan validator (< 50ms)
cook_code_cli_engine:   boomopen cook <state|packets|verify-wave|preflight|amend-plan>  # 5-Stage Fast-Forward state, 5-Field Packet emitter, 3-Wave lock gate & delta wave amender
reconcile_cli_engine:   boomopen reconcile [dir] [--plan <p>] [--specs <s1,s2>] [--strict] # Wave 2.5 REC-G1..G4 island shard, route parity, [SC-*] & .env.example parity scanner
active_presets:         frontier-guardrails (default) | carbon-guardrails (Antigravity alias) | smart-hybrid | solo-fast | deep-architect | adversarial-team
antigravity_workflows:  platforms/antigravity/workflows/{audit_fanout,review_fanout,research_fanout}.py # Executable Antigravity run_workflow templates
audit_cli_ledger:       ./.boomopen/audit-ledger.json + ./.boomopen/AUDIT-PROGRESS.md (boomopen audit <init|slice|record|approve|verify-fix|rollback|status>)
strict_quality_gate:    boomopen check <dir> --strict-phase --no-stubs              # Pragmatic 2-Tier quality, line limits & anti-stub/anti-skip verifier
autopilot_ledger:       ./.boomopen/project-ledger.json + ./.boomopen/ROADMAP-PROGRESS.md (boomopen ledger <init|from-plan|validate|status|next|verify|rollback|audit>)
conductor_runs:         ./.boomopen/conductor/runs/<runId>-COUNCIL-SYNTHESIS.md
```

- **L1–L3**: Zero-Latency Entry; 100% Requirement, 17-Language NL Intent & `.boomopen/project-ledger.json` Integrity; 4-Tier Elastic Swarm Gate ($N_{\text{agents}}$, `≤ 3–4` files/shard).
- **L4–L6**: Quality-First `Model: "inherit"` (never `flash_lite`); 3-Wave Contract-First (`SHARED_CONTRACT` + disjoint `OWNED_FILES`, gated by `boomopen research|design|plan validate`); Language Compliance.
- **L7–L10**: 5-Stage Fast-Forward & Approved-Plan Direct Dispatch (`boomopen cook state` / `boomopen cook packets` without re-planning); Scoped Warm Reuse (`role#shard -> conversationId`); **5-Layer Phase Quality Ratchet** (`G1 check --strict-phase --no-stubs` -> `G2 test/build` -> `G3 Wave 2.5 reconcile` -> `G4 adversarial review` -> **`G5 ledger verify --reconcile --strict-locks` RUNS LAST**, plus `ledger/audit rollback`); Clean Git Tree.
