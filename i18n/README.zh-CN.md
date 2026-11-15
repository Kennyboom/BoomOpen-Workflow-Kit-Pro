<div align="center">
  <h1>⚡ BoomOpen Workflow Kit v5.5.0</h1>
  <p><strong>跨平台智能混合 (Smart-Hybrid) AI 研发操作系统 — 22 位专家级智能体、18 支黄金三角团队与 1,460+ 按需技能宝库</strong></p>

  <p>
    <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/releases"><img src="https://img.shields.io/badge/Version-5.5.0-7c3aed.svg" alt="Version: 5.5.0" /></a>
    <a href="#platforms"><img src="https://img.shields.io/badge/Platforms-Antigravity%20%7C%20Claude%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot-0ea5e9.svg" alt="Platforms: 5 Unified" /></a>
    <a href="#agents"><img src="https://img.shields.io/badge/Agents-22%20Specialists%20%2B%2018%20Teams-10b981.svg" alt="Agents: 22 Specialists + 18 Teams" /></a>
    <a href="#skills"><img src="https://img.shields.io/badge/Skills-22%20Core%20%2B%201%2C440%20Library-f59e0b.svg" alt="Skills: 22 Core + 1,440 Library" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-22c55e.svg" alt="Node.js: >=18.0.0" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/License%20(kit%20code)-MIT-blue.svg" alt="License: MIT (kit code)" /></a>
  </p>

  <p>
    <a href="../README.md">🇬🇧 English</a> • <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> • <b>🇨🇳 简体中文</b> • <a href="./README.zh-TW.md">🇹🇼 繁體中文</a> • <a href="./README.ja.md">🇯🇵 日本語</a> • <a href="./README.ko.md">🇰🇷 한국어</a> • <a href="./README.es.md">🇪🇸 Español</a> • <a href="./README.fr.md">🇫🇷 Français</a> • <a href="./README.de.md">🇩🇪 Deutsch</a><br/>
    <a href="./README.pt-BR.md">🇧🇷 Português</a> • <a href="./README.ru.md">🇷🇺 Русский</a> • <a href="./README.hi.md">🇮🇳 हिन्दी</a> • <a href="./README.ar.md">🇸🇦 العربية</a> • <a href="./README.id.md">🇮🇩 Bahasa Indonesia</a> • <a href="./README.th.md">🇹🇭 ไทย</a> • <a href="./README.tr.md">🇹🇷 Türkçe</a> • <a href="./README.it.md">🇮🇹 Italiano</a>
  </p>
</div>

---

## 🎬 官方发布宣传片 (Full HD 1080p)

<div align="center">
  <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4">
    <img src="../assets/media/poster_en.png" alt="观看 BoomOpen Workflow Kit v5.5 官方发布宣传片 (Full HD 1080p)" width="92%" />
  </a>
  <p>
    ▶️ <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4"><b>点击此处在线观看 / 播放 Full HD 1080p 官方宣传片 (MP4 专业配音版)</b></a>
  </p>
</div>

---

## 🌟 什么是 BoomOpen Workflow Kit v5.5？

**BoomOpen Workflow Kit v5.5（跨平台统一与智能混合版）** 是一个开源的多智能体（Multi-Agent）研发操作系统，能够将单一的 AI 编程助手升级为由 **22 位专家级智能体（Specialist Agents）**、**18 支黄金三角对抗团队（Golden Triangle Teams）**、**33 个斜杠命令（`89` 个命令与协议文件）**、**22 项核心技能（Core Skills）** 以及 **1,440 项垂直领域技能库（`skills_library/`）** 组成的协同工程团队。

不同于每轮对话都会带来冷启动延迟与上下文膨胀的笨重代理封装，BoomOpen v5.5 融合了 **Turn-1 子代理优先门控（Proactive Sub-agent First Gate）**、**17 语言自然语言工作流路由**、**4 层动态弹性蜂群分片（`role#shard`）**、**Wave 2.5 规格到代码自动对账（`boomopen reconcile`）**、**基于状态账本的多轮次全项目审计（`/audit` & `boomopen audit`）**、**多会话项目自动驾驶（`/autopilot`）** 与 **跨引擎指挥官（`/conduct`）**：
- **🚀 Turn-1 零税并行子代理、Wave 2.5 对账与 Mode B 多智能体编排**：范围未知的代码库探索（`> 2` 个文件）、跨领域特性（`≥ 2` 个领域）、**全部 17 种支持语言**的自然语言工作流意图或显式 `/cmd` 命令，均在 Turn 1 立即并发启动子代理分片（`role#shard`，每分片 `<= 3–4` 个 `OWNED_FILES`），结合 **DAG 并行扇出**、**计划直达执行者派发**、**契约优先文件锁（`SHARED_CONTRACT` + `OWNED_FILES`）**、**Wave 2.5 规格对账（`boomopen reconcile` + `cook amend-plan`，自动捕获孤岛模块、路由/环境变量偏差与 `[SC-*]` 遗漏）**，以及 **分片级热会话复用（`role#shard -> conversationId`，通过 `send_message`）**。
- **🏛️ 多会话自动驾驶 (`/autopilot`)、多轮全项目审计 (`/audit`) 与跨引擎委员会 (`/conduct`)**：将多份需求文档编译为带 SHA-256 防漂移校验的不可变 `.boomopen/project-ledger.json` 账本及 4 层零遗漏阶段门禁（`boomopen check --strict-phase --no-stubs`）；完工后通过 `/audit` 与 `boomopen audit`（写入 `.boomopen/audit-ledger.json`）执行覆盖 RTM 需求追踪、UI->API->DB 垂直链路连续性、**2 层安全与防泄漏扫描（`security_scan.py` v6）** 及用户审批分片修复的多轮审计；或通过 `/conduct` 调度 Claude Code、OpenAI Codex、Antigravity、Cursor 与 Copilot 组成 **多引擎并行委员会** 与 **角色分工流水线（`Author != Critic`）**。
- **⚡ Mode A — 已知目标微直接执行（0 秒冷启动）**：简单问答、代码解释以及 **在 Turn 1 已明确知晓精确 `≤ 2` 个目标文件**的微小修改（0 探索、无 `/cmd`），由主智能体严格遵循 **务实双层编码规范** 与 **持续测试与缺陷修复** **直接**完成并验证。
- **📚 1,462 巨型专业技能库（零上下文膨胀）**：包含 **22 项核心技能 (`skills/`)** 与 **1,440 项垂直领域技能 (`skills_library/`)**，预编译至 `matrix-skills/compact-index.json` 实现 `O(1)` 两步按需加载，让 AI 瞬间掌握后端、前端、移动端、游戏开发 (Unity/Unreal/Godot)、AI/ML、BigQuery/数据工程、云原生/DevOps 与 OWASP 网络安全，且绝不污染上下文窗口。

---

## 🏗️ 智能混合架构图 (v5.5)

```mermaid
flowchart TD
    User["👤 用户请求 / 斜杠命令"] --> Gate{"🚦 双模式智能复杂度门控"}
    Gate -->|"≤ 2 个文件, 单领域, 无 /cmd"| ModeA["⚡ Mode A: 直接执行 (Tier 0)<br/>0 秒冷启动 + 务实双层编码规范"]
    Gate -->|"> 2 个文件, ≥ 2 个领域, 或 /cmd"| ModeB["🎻 Mode B: 多智能体编排器 (Tier 1)<br/>Model: inherit"]

    ModeB --> FanOut["🔀 阶段 1: DAG 并行扇出<br/>(researcher + scouter | debugger + researcher)"]
    FanOut --> Plan["📋 阶段 2: 契约优先规划 (planner)<br/>锁定 SHARED_CONTRACT + OWNED_FILES"]
    Plan --> Dispatch{"🎯 执行变体路由"}

    Dispatch -->|":fast / :hard"| Direct["⚡ 计划直达工程师并行派发<br/>(backend-engineer + frontend-engineer)"]
    Dispatch -->|":team"| Triangle["🔺 黄金三角对抗审查团队<br/>(TechLead ⇄ Executor ⇄ Reviewer 经由 MAILBOX)"]

    Direct --> Verify["🧪 阶段 4: 自动化验证与热会话复用<br/>tester + reviewer (send_message 0秒热循环)"]
    Triangle --> Verify
```

---

<a id="pillars"></a>

## 🧠 v5.5 的 6 大核心支柱

1. **🌐 五大平台 100% 统一支持 (`platforms/*`)**：
   - 基于统一架构原生支持 **Google Antigravity 2.0 (Gemini)**、**Claude Code**、**OpenAI Codex**、**Cursor** 和 **GitHub Copilot** 五大主流 AI 编程工具。
2. **📏 务实双层编码规范（Pragmatic 2-Tier Coding Standards — 拒绝机械拆碎文件）**：
   - **第一层（Tier 1 — 严苛质量与安全底线，零容忍）**：单一职责原则（Single Responsibility）、**严禁显式 `any`**、**严禁在生产代码中遗留调试 `console.log`**、异步与 API 边界必须包含 `try/catch` 与强类型错误处理、常量采用 `SCREAMING_SNAKE_CASE`、DRY（重复 ≥ 3 次抽离）、清理并排序导入语句。
   - **第二层（Tier 2 — 弹性结构指南，内聚优先）**：单文件软目标为 `~200–350 行`，高内聚模块软上限可达 `~400–450 行`（仅当 `>500 行` 或混杂多个领域职责时才强制拆分；测试、Schema/Types 与文档免除行数限制）。逻辑函数目标 `~20–40 行`（UI/处理函数 `~40–80 行`）。
3. **🎯 4 层动态弹性蜂群分片（`role#shard`）、计划直达派发 & 热会话复用 (`send_message`)**：
   - 一旦生成 `PLAN-{feature}.md`，编排器将任务**直接派发**给领域工程师分片（`backend-engineer#shard-1`、`frontend-engineer#shard-2`、`database-architect#shard-1` 等，每分片 `<= 3–4` 个 `OWNED_FILES`），彻底消除多余的 `tech-lead` 中转跳数。
   - 活动子代理按分片记录在 **分片会话注册表 (`role#shard → conversationId`)** 中，后续迭代通过 `send_message` 直接唤醒，实现 **0 秒冷启动** 与 **100% 上下文保留**。
4. **🤝 契约优先并行派发 (`SHARED_CONTRACT` + `OWNED_FILES`)**：
   - 跨领域计划在启动并行开发前，预先锁定 API 接口契约、DTO 数据结构及互斥的文件写入所有权（`OWNED_FILES` 与 `READ_ONLY_FILES`），彻底杜绝并行覆写冲突与接口不匹配。
5. **🔍 5-Whys (SPIE v3.0) 根因调试与 100% 洁净 Git 树**：
   - `debugger` 通过 3 个优先级假设与 **5-Whys 因果链**（`Why 1 直接症状` → `Why 5 系统性根因`）定位问题。所有过程产物（`PLAN`、`DEBUG`、`TEST`、`REVIEW`、`MAILBOX`）默认写入 `<appDataDir>\brain\<conversation-id>\`，保持项目 Git 工作区 100% 洁净。
6. **🩺 内置 14 命令 CLI 套件 (`research`, `design`, `plan`, `cook`, `reconcile`, `audit`, `ledger`, `conduct`, `check`, `doctor`, `settings`, `install`, `uninstall`, `list`) 与 O(1) 技能索引**：
   - `npm run doctor` 自动校验五大平台配置、22 个智能体、72 个团队文件（18 个团队目录）、89 个命令文件（`commands/**/*.md`，含 83 个工作流 + 6 个 `_ref/` 协议）及 `matrix-skills/compact-index.json`（索引 `1,462` 项技能）。确定性工作流编译器（`boomopen research`、`boomopen design`、`boomopen plan`、`boomopen cook`、`boomopen reconcile` 与 `boomopen audit <init|slice|record|approve|verify-fix|status>`）提供上游制品校验、Wave 2.5 跨分片联动对账（`REC-G1..G4`）以及多轮次全项目审计账本（`.boomopen/audit-ledger.json`）。`boomopen check <dir> [--strict-phase --no-stubs]` 静态审计文件行数、显式 TypeScript `any`、遗留 `console.log`、推迟的 `TODO`/`FIXME` 注释、空壳桩代码（stubs）及测试作弊行为；`boomopen ledger` 管理多会话阶段门禁；`boomopen conduct` 编排跨引擎派发与 6 类多引擎委员会任务（`research|brainstorm|plan|design|review|debug`）。

---

<a id="platforms"></a>

## 💻 支持的 AI 编程平台

| 平台名称 | 支持级别 | 全局入口文件 | 框架安装路径 |
|----------|:-------------:|-------------------|------------------------|
| **Antigravity (Gemini)** | ✅ 原生 v5.5 | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/boomopen-workflow-kit/` |
| **Claude Code** | ✅ 原生 v5.5 | `~/.claude/CLAUDE.md` | `~/.claude/skills/boomopen-workflow-kit/` |
| **OpenAI Codex** | ✅ 原生 v5.5 | `~/.codex/CODEX.md` & `AGENTS.md` | `~/.codex/skills/boomopen-workflow-kit/` |
| **Cursor** | ✅ 原生 v5.5 | `~/.cursor/rules/boomopen-workflow-kit.mdc` | `~/.cursor/skills/boomopen-workflow-kit/` |
| **GitHub Copilot** | ✅ 原生 v5.5 | `~/.copilot/COPILOT.md` | `~/.copilot/skills/boomopen-workflow-kit/` |

---

## 🚀 快速开始与安装指南

```bash
# 1. 克隆代码仓库
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro

# 2. 为您使用的 AI 编程助手安装（任选其一或使用 --all 全部安装）
npm run install:antigravity   # Google Antigravity 2.0 (Gemini)
npm run install:claude        # Anthropic Claude Code
npm run install:codex         # OpenAI Codex CLI
npm run install:cursor        # Cursor AI Editor
npm run install:copilot       # GitHub Copilot (VS Code)
npm run install:all           # 一键安装全部 5 大平台

# 3. 校验安装结果（只读）
npm run doctor
npm link
boomopen research validate path/to/RESEARCH.md
boomopen design validate path/to/DESIGN.md
boomopen plan validate path/to/PLAN.md
boomopen cook preflight path/to/PLAN.md
boomopen reconcile path/to/your/project --plan path/to/PLAN.md
boomopen audit init --docs docs/prd.md,docs/arch.md
boomopen check path/to/your/project --strict-phase --no-stubs
boomopen ledger status
boomopen conduct probe
```

> 本套件**未发布到 npm**，请仅从本仓库安装。可选：`npm link` 会把 `boomopen` 命令加入 PATH（不会从 npm 下载任何内容）。

---

## 🎛️ 统一设置与执行模式选择 (`/settings` 控制中心)

BoomOpen v5.5 内置**零延迟统一控制中心**，支持在 `< 10ms` 内跨全部 **5 大平台**切换执行模式（`auto`、`mode_a`、`mode_b`、`team`）、5 套一键预设与 20 项系统参数（+ 2 项行数上限配置）（首轮对话延迟为 **0ms**）：

### 1️⃣ 5 套一键预设配置与执行模式

| 预设配置 (`Preset`) | 执行模式 (`execution.mode`) | 默认变体 | 自然语言深度调研 (`naturalLanguageResearchTrigger`) | 代码规范 (`codingStandards`) | 适用场景 |
|:---|:---|:---:|:---:|:---:|:---|
| **⚡ `smart-hybrid`** *(默认推荐)* | **`auto`**（`≤ 2 个文件` 走 Mode A 极速直连；`> 2 个文件` 或 `/cmd` 走 Mode B 多智能体） | `auto` | **`auto_team`** *(自动路由至 `/research:team` / `/brainstorm:team` 黄金三角三人组)* | `pragmatic` (`400/500` 行) | 日常全栈研发首选：小任务零延迟，大架构深度协同 |
| **🛡️ `carbon-guardrails`** | **`mode_a`** *（`≤ 10 个文件` 直接执行 — Carbon 主导编排，BoomOpen 守卫护栏）* | `auto` | `off` *（零自然语言劫持；仅响应显式 `/cmd`）* | `pragmatic` (`400/500` 行) | 配合 Antigravity Orchestrator Carbon：由 Carbon 驱动日常任务，同时强制执行严格的编码规范与端到端验证门禁 |
| **🚀 `solo-fast`** | **`mode_a`** *(强制单智能体直接执行，0 秒子代理开销)* | `fast` | `off` *(直接回复，除非显式输入 `/brainstorm`)* | `relaxed` (`600/800` 行) | 紧急热修复、快速原型验证、小型脚本与极致节省 Token |
| **🧠 `deep-architect`** | **`mode_b`** *(所有任务强制启用 Mode B 多智能体编排)* | `hard` | `auto_hard` *(自动运行 `/research:hard` / `/brainstorm:hard` 五维深度调研)* | `strict` (`300/400` 行) | 复杂系统架构设计、从零新建项目与跨领域重构 |
| **🔺 `adversarial-team`** | **`team`** *(所有工作流强制启用 3 智能体黄金三角 `:team`)* | `team` | **`auto_team`** *(3 智能体经由 `MAILBOX` 交叉对抗评审)* | `strict` (`300/400` 行) | 核心生产系统、金融级安全审计与零缺陷交付 |

### 三种切换方式（聊天框 `/settings`、本地 Web 面板、终端 CLI）

```bash
# 1. 聊天框内直接输入斜杠命令（弹出交互式选择菜单或单行速设）
/settings                                     # 打开交互式选择菜单 (ask_question UI)
/settings preset smart-hybrid                 # 切换为默认推荐模式 (Auto Mode A/B + auto_team)
/settings preset carbon-guardrails            # 切换为 Carbon-Guardrails（Carbon 主导，BoomOpen 守卫）
/settings preset solo-fast                    # 切换为 Mode A 极速单代理直接执行
/settings preset deep-architect               # 切换为 Mode B 多智能体深度编排
/settings preset adversarial-team             # 切换为黄金三角 3 智能体对抗团队 (:team)
/settings mode auto | mode_a | mode_b | team  # 单独覆盖执行模式 (execution.mode)

# 2. 启动本地 Web 可视化控制中心 (http://127.0.0.1:4567)
boomopen settings --ui

# 3. 终端 CLI 命令（支持全局 ~/.boomopen/settings.json 与项目级 ./.boomopen.json）
boomopen settings status
boomopen settings preset adversarial-team
cd path/to/your/project
boomopen settings set execution.mode mode_a --project
boomopen settings reset
```

> `--project` 总是在你运行命令的文件夹中写入 `./.boomopen.json`，请在你的项目目录中运行，而不是在套件克隆目录中。未执行 `npm link` 时，请把 `boomopen` 替换为 `node /path/to/BoomOpen-Workflow-Kit-Pro/cli/install.js`。

---

## 🎯 斜杠命令参考手册

| 命令 | 支持变体 | 核心用途说明 |
|---------|----------|-----------------|
| **`/cook`** | `:fast`, `:hard`, `:team` | 端到端功能研发全流程（调研/侦察 → 规划 → 并行编码 → 测试 → 审查） |
| **`/code`** | `:fast`, `:hard`, `:team` | 基于现有 `PLAN-{feature}.md` 直接执行代码实现与验证 |
| **`/plan`** | `:fast`, `:hard`, `:team` | 生成包含 `SHARED_CONTRACT`、`OWNED_FILES` 与 Given/When/Then 验收标准的实施蓝图 |
| **`/fix`** | `:fast`, `:hard`, `:team` | 根因缺陷修复并强制执行回归测试验证 |
| **`/debug`** | `:fast`, `:hard`, `:team` | 基于 3 假设验证 + **5-Whys (SPIE v3.0)** 因果链的深度根因调查（`DEBUG-{issue}.md`） |
| **`/test`** | `:fast`, `:hard`, `:team` | DAG 并行扇出执行测试套件 + 扫描未覆盖边界场景（`tester` + `scouter`） |
| **`/review`** | `:fast`, `:hard`, `:team` | 四维并行代码审计（架构合规、代码质量、OWASP 安全、性能瓶颈） |
| **`/audit`** | `:run`, `:fix`, `:auto` | 基于状态账本的多轮次全项目完工审计（RTM 规格覆盖、UI->API->DB 垂直链路、2 层安全与防泄漏扫描，以及通过 `boomopen audit` 进行用户审批的分片修复） |
| **`/design`** | `:fast`, `:hard`, `:team` | 系统架构、数据库模式与 UI/UX 设计规范生成（`DESIGN.md`） |
| **`/docs`** | `:core`, `:business`, `:audit` | 生成或同步双层结构化架构文档与业务文档（`./documents/`） |
| **`/deploy`** | `:check`, `:preview`, `:production`, `:rollback` | 部署前质量门禁检查、预览环境发布、生产环境上线与安全回滚 |
| **`/research`** | `:fast`, `:hard`, `:team` | 自主深度研究引擎（4 源三角验证、3 波次迭代搜索与 3 向量黄金三角委员会） |
| **`/brainstorm`** | `:fast`, `:hard`, `:team` | 苏格拉底式需求澄清、架构权衡分析与方案头脑风暴 |
| **`/report`** | `:fast`, `:hard`, `:team` | 生成包含指标统计与架构图表的技术及管理总结报告 |
| **`/autopilot`** | `:init`, `:run`, `:audit` | 跨会话多阶段项目自动驾驶仪（基于 `.boomopen/project-ledger.json` 账本与 4 层零遗漏棘轮门禁） |
| **`/conduct`** | `:council`, `:pipeline` | 跨引擎指挥官与多引擎并行委员会（`boomopen conduct`，生成 4 部分共识综合报告） |
| **`/orchestrate`** | — | 跨多个领域的自定义多智能体流水线协同编排 |
| **`/settings`** | `preset`, `mode`, `set`, `ui` | 统一控制中心：配置 20 项枚举 + 2 项行数上限、切换 5 套预设或打开本地 Web 界面 (`--ui`) |
| **`/save` / `/recap`** | — | 保存会话交接状态（`SESSION-HANDOVER.md`）并在 `< 5秒` 内快速恢复项目上下文 |

### 🌙 过夜大型多阶段项目指南 (`/autopilot` vs. `/goal` + `/autopilot` + `/audit`)

| 工作流方案 | 适用范围 | 上下文阈值处理 (`~70%`) | 质量与规格保障 |
|:-----------|:---------|:------------------------|:---------------|
| **仅用 `/autopilot`** | 单会话或中小型构建（`< 70%` 上下文） | 在单一会话内运行；上下文占满后需手动恢复 | 初始化 `.boomopen/project-ledger.json`，执行 5 道验证门禁与 Wave 2.5 对账 |
| **`/goal` + `/autopilot` + `/audit`** | 包含 `docs/` 的大型多阶段项目（过夜全自动运行） | **`/goal`** 作为持久外层调度器，在上下文接近 `~70%` 时自动重置并衔接下一阶段 | **`/autopilot`** 维护 `project-ledger.json`、强制每阶段通过 5 道验证门禁与 Wave 2.5 规格对账，并在 100% 完工后触发多轮 **`/audit`** |

**可直接复制使用的过夜提示词：**

```text
/goal 使用 /autopilot 读取 docs/ 目录下的全部项目文档，初始化 project-ledger.json，并从头到尾按顺序自主实现每一个 phase（跳过初始 PLAN 审批暂停；每个 phase 都必须通过全部 5 道验证门禁并与规格文档 100% reconcile 对齐）。在 100% 完成所有 phase 后，执行第 1 轮 /audit 并停止，输出审计报告供我审查。
```

---

<a id="agents"></a>

## 🤖 22 位专家级智能体 & 18 支黄金三角团队

| 领域分类 | 专家级智能体 (`agents/*.md`) | 黄金三角对抗团队 (`agents/teams/*-team/`) |
|----------|-----------------------------------|------------------------------------------------|
| **工程实现与交付** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect`, `devops-engineer` | `backend-team`, `frontend-team`, `fullstack-team`, `mobile-team`, `game-team`, `database-team`, `devops-team` |
| **架构设计与规划** | `tech-lead`, `planner`, `brainstormer`, `business-analyst`, `project-manager`, `designer` | `planning-team`, `brainstorm-team`, `project-team`, `design-team` |
| **质量、安全与调试** | `debugger`, `tester`, `reviewer`, `spec-reconciler`, `security-engineer`, `performance-engineer` | `debug-team`, `qa-team`, `security-team`, `performance-team` |
| **技术调研与知识管理** | `researcher`, `scouter`, `docs-manager`, `reporter` | `research-team`, `docs-team`, `report-team` |

---

<a id="skills"></a>

## 📚 1,460+ 专业技能宝库（22 项核心技能 + 1,440 项领域技能）

BoomOpen 内置开源界规模最大的 AI 工程技能矩阵之一，通过 **两步 O(1) 渐进式检索**（`<skills>` 核心匹配 → `matrix-skills/compact-index.json` 索引检索 → 按需加载 `SKILL.md`）实现 **0 空闲 Token 消耗**：

| 技能层级 / 领域 | 数量 | 代表性技能与核心能力 | 加载机制 |
|:---|:---:|:---|:---|
| **⚡ Tier 1：核心技能 (`skills/`)** | **22** | `clean-code`, `debugger`, `plan-writing`, `brainstorming`, `frontend-design`, `frontend-architecture`, `design-spec`, `api-patterns`, `database-design`, `testing-patterns`, `skill-seeker` | 预加载于 `<skills>`，首轮零延迟调用 |
| **🎨 UI/UX 视觉工艺、动效与设计系统** | **42** | Anti-AI-Slop 视觉工艺、OKLCH 感知色彩与 Bento 网格、Motion v12 + CSS View Transitions、无头原语 (`cmdk`/`vaul`/`sonner`)、Figma MCP + W3C DTCG 设计令牌、WCAG 2.2 AA/AAA、iOS 18 HIG 与 Material 3 Expressive | 经由 `compact-index.json` 按需加载 (`matrix-skills/design.yaml`) |
| **🌐 Web、后端与分布式系统** | **390+** | Next.js/React 19、FastAPI、NestJS、Go/Rust 微服务、GraphQL、gRPC、Redis/Kafka 事件驱动架构、多租户 SaaS | 经由 `compact-index.json` 按需加载 (`skills_library/`) |
| **🤖 AI、LLM 智能体与数据工程** | **320+** | RAG 流水线、LangGraph/MCP 服务、提示词工程、Vertex AI、BigQuery 分析、dbt、Spark、向量数据库 | 经由 `compact-index.json` 按需加载 (`skills_library/`) |
| **☁️ 云原生、DevOps、K8s 与网络安全** | **300+** | Terraform/OpenTofu、AWS/GCP/Azure 架构、Docker/K8s GitOps、CI/CD 流水线、OWASP Top 10 安全审计、零信任鉴权 | 经由 `compact-index.json` 按需加载 (`skills_library/`) |
| **📱 移动端、游戏引擎与垂直行业** | **410+** | iOS Swift/SwiftUI、Android Kotlin、React Native、Flutter、Unity 6、Unreal Engine 5、Godot 4、WebGL/Three.js、量化金融、Web3 | 经由 `compact-index.json` 按需加载 (`skills_library/`) |

---

## 📂 仓库目录结构

```text
BoomOpen-Workflow-Kit-Pro/
├── agents/                  # 22 个专家智能体定义 + 18 支黄金三角团队（54 个角色文件 + 18 个 _team.md，共 72 个文件）
├── cli/                     # 14 命令 CLI 套件：install.js, doctor.js, checker.js, settings.js, research.js, design.js, plan.js, cook.js, reconcile.js, audit.js, ledger.js 与 conductor.js
├── commands/                # 83 个斜杠命令工作流（33 个命令：:fast, :hard, :team, :run/:fix/:auto, :init/:run/:audit, :council/:pipeline）+ 6 个 _ref/ 共享协议（共 89 个文件）
├── documents/               # 双层架构、领域模型、源码底座与编码规范文档
├── i18n/                    # 多语言国际化文档目录（包含 16 种主流语言的完整译本）
├── matrix-skills/           # 领域技能矩阵 YAML + 预编译 compact-index.json (1,462 项技能)
├── platforms/               # 五大平台统一配置模板 (antigravity/, claude/, codex/, copilot/, cursor/)
├── rules/                   # Mode B 按需加载核心规则 (CORE, PHASES, AGENTS, TEAMS, SKILLS, ERRORS, REFERENCE)
├── scripts/                 # Python 自动化校验与辅助脚本 (checklist.py, verify_all.py 等)
├── skills/                  # 22 项核心技能 (clean-code, debugger, plan-writing, frontend-design 等)
├── skills_library/          # 1,440 项垂直领域按需加载技能库（通过两步快速检索加载）
└── GEMINI.md | CLAUDE.md | CODEX.md | COPILOT.md | CURSOR.md | AGENT.md
```

---

## 📄 开源许可与安全策略

- **开源协议**：本项目基于 [MIT 许可证](../LICENSE) 开源发布。版权所有 © 2026 **BoomOpen Labs**。`skills_library/` 中的第三方技能沿用其上游许可证，详见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。
- **安全策略**：请参阅 [SECURITY.md](../SECURITY.md) 了解内置安全防护机制及漏洞私密报告流程。
