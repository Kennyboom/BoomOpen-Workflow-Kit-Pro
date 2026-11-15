---
description: "🎛️ Settings & Control Center — Configure BoomOpen presets, Mode A/B threshold, elastic swarm scaling, Cross-Engine Conductor matrix, multilingual NL routing, model policy, and coding standards across all 5 platforms."
version: "5.5"
category: configuration
execution-mode: execute
---

# /settings — Unified Settings & Control Center (v5.5)

> **DIRECTIVE**: Manage BoomOpen's 2-tier settings (`~/.boomopen/settings.json` Global & `./.boomopen.json` Workspace) and, for global changes, sync the active `<!-- BOOMOPEN-SETTINGS-START --> ... <!-- BOOMOPEN-SETTINGS-END -->` block into the kit entry files of every installed platform (`Antigravity`, `Claude Code`, `OpenAI Codex`, `Cursor`, `GitHub Copilot`).

<arguments>$ARGUMENTS</arguments>

---

## 🛠️ CLI ENGINE RESOLUTION & BRAIN ARTIFACTS ROUTING

1. **Primary Installed CLI Path**: Always invoke `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings ...` (replace `.{TOOL}` with `.gemini/config` on Antigravity, `.claude` on Claude Code, `.codex` on Codex, `.cursor` on Cursor, or `.copilot` on Copilot; fallback `./cli/install.js` is used ONLY when working directly inside the `BoomOpen-Workflow-Kit-Pro` source repository itself).
   - Not found → tell the user to install from a clone: `git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git && cd BoomOpen-Workflow-Kit-Pro && node cli/install.js install <tool>` (never suggest unpublished `npx` / global `npm` packages).
2. **Workspace Scope (`--project`)**: Always run from the user's project root so `./.boomopen.json` is written there (e.g., `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set execution.mode mode_a --project` or `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set engines.researcher council --project`). Never run `npm run settings` inside the kit clone for `--project`.
3. **Brain Artifacts First (`deliverables.routing = brain_artifacts` Default)**:
   - **`brain_artifacts` (Default)**: Writes transient workflow deliverables (`PLAN`, `RESEARCH`, `BRAINSTORM`, `SCOUT`, `DESIGN`, `DEBUG`, `TEST`, `REVIEW`, `REPORT`, `COUNCIL`, `MAILBOX`) as single cohesive files (`<= 500` lines) to `<appDataDir>\brain\<conversation-id>\` to keep the Git working tree 100% clean.
   - **`workspace_reports` / `both` (Opt-in Only)**: Writes to `./reports/{topic}/` ONLY when `deliverables.routing` is explicitly set to `workspace_reports` / `both` or when the user explicitly requests workspace report files.

---

## ⚡ MODE 1: FAST-TRACK ARGUMENT EXECUTION (When `$ARGUMENTS` is provided)

If the user passes subcommands or flags in `<arguments>`, execute immediately **without** asking questions:

| User Input | CLI Command to Execute |
|:-----------|:-----------------------|
| `/settings status` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings status` |
| `/settings preset <smart-hybrid\|carbon-guardrails\|solo-fast\|deep-architect\|adversarial-team> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings preset <name> [--project]` |
| `/settings mode <auto\|mode_a\|mode_b\|team> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set execution.mode <mode> [--project]` |
| `/settings get [dotted.key] [--json]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings get [dotted.key] [--json]` |
| `/settings set <dotted.key> <value> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set <dotted.key> <value> [--project]` |
| `/settings set execution.swarmScaling <elastic\|hyper_swarm\|conservative> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set execution.swarmScaling <value> [--project]` |
| `/settings set execution.maxParallelSubagents <3\|6\|8\|12\|16> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set execution.maxParallelSubagents <value> [--project]` |
| `/settings set engines.<researcher\|planner> <current\|auto\|council\|antigravity\|claude\|codex\|cursor\|copilot> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set engines.<role> <value> [--project]` |
| `/settings set engines.coder <current\|auto\|antigravity\|claude\|codex\|cursor\|copilot> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set engines.coder <value> [--project]` |
| `/settings set engines.<debugger\|reviewer> <current\|auto\|cross_family\|council\|antigravity\|claude\|codex\|cursor\|copilot> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set engines.<role> <value> [--project]` |
| `/settings set engines.councilMembers <claude,codex,antigravity\|claude,codex\|claude,antigravity\|codex,antigravity\|all_installed> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set engines.councilMembers <value> [--project]` |
| `/settings set codingStandards.<softFileLines\|hardFileLines> <1..100000> [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set codingStandards.<softFileLines\|hardFileLines> <int> [--project]` |
| `/settings reset [--project]` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings reset [--project]` |
| `/settings ui [--port 4567]` or `/settings --ui` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings --ui [--port 4567]` |
| `/settings sync` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings sync` |
| `/settings help` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings help` |

After running the CLI command, display the updated **Active Settings Summary Table**. Global mutations (`preset`, `mode`, `set`, `reset` without `--project`, and `sync`) automatically re-sync the settings block across all installed platform entry files; `--project` writes a sparse `./.boomopen.json` override without touching global entry files.

---

## 💬 MODE 2: INTERACTIVE CONTROL PANEL (When `$ARGUMENTS` is empty)

When the user types `/settings` with no arguments, or asks in natural language to inspect/change BoomOpen settings:

### Step 1 — Inspect & Display Current Active Settings
Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings status` (or read `~/.boomopen/settings.json` + `./.boomopen.json`) and render the **Active Settings Status Table**:

```markdown
### 🎛️ BoomOpen Control Center (v5.5.0)
| Category | Setting Key | Active Value | Description |
|:---------|:------------|:-------------|:------------|
| **Preset & Scope** | `preset` / `scope` | `⚡ smart-hybrid` (`global`) | Active profile & persistence tier (`global` or `project`) |
| **1. Orchestration** | `execution.mode` | `auto` | `auto` (`≤2` files Mode A) \| `mode_a` \| `mode_b` \| `team` |
| **1. Orchestration** | `execution.modeAThresholdFiles` | `2` | Max files for Mode A direct execution (`1` \| `2` \| `3` \| `5` \| `10`) |
| **1. Orchestration** | `execution.swarmScaling` | `elastic` | Sub-agent swarm scaling (`elastic` `1→2-3→4-6→8+` \| `hyper_swarm` \| `conservative`) |
| **1. Orchestration** | `execution.maxParallelSubagents` | `8` | Max parallel sub-agents per wave (`3` \| `6` \| `8` \| `12` \| `16`) |
| **1. Orchestration** | `workflows.defaultVariant` | `auto` | Default `/cmd` variant (`auto` \| `fast` \| `hard` \| `team` \| `ask`) |
| **1. Orchestration** | `workflows.naturalLanguageResearchTrigger` | `auto_team` | Multilingual NL workflow routing across 17 languages: research → `/research:team`, ideation → `/brainstorm:team` (`auto_team` \| `auto_hard` \| `ask_first` \| `off`) |
| **2. Intelligence** | `models.subagentPolicy` | `quality_first` | `quality_first` (`inherit` Pro High) \| `strict_inherit` \| `balanced_speed` |
| **2. Intelligence** | `research.depth` | `5_lens_deep` | `5_lens_deep` \| `standard` \| `quick_brief` |
| **2. Intelligence** | `clarification.style` | `autonomous_first` | `autonomous_first` \| `interactive_ask` \| `zero_questions` |
| **2. Intelligence** | `teams.maxDebateRounds` | `3` | Max Golden Triangle debate rounds (`1` \| `2` \| `3`) |
| **3. Cross-Engine** | `engines.researcher` / `engines.planner` | `current` / `current` | Engine for research/planning (`current` \| `auto` \| `council` \| `antigravity` \| `claude` \| `codex` \| `cursor` \| `copilot`) |
| **3. Cross-Engine** | `engines.coder` / `engines.debugger` | `current` / `current` | Coding (`current` \| `auto` \| `<engine>`) & Debugging (`current` \| `auto` \| `cross_family` \| `council` \| `<engine>`) |
| **3. Cross-Engine** | `engines.reviewer` / `engines.councilMembers` | `current` / `claude,codex,antigravity` | Reviewer (`current` \| `auto` \| `cross_family` `Author≠Critic` \| `council` \| `<engine>`) & Council roster (`claude,codex,antigravity` \| `claude,codex` \| `claude,antigravity` \| `codex,antigravity` \| `all_installed`) |
| **4. Standards** | `codingStandards.preset` (`softFileLines` / `hardFileLines`) | `pragmatic` (`400` / `500`) | `pragmatic` (`400/500`) \| `strict` (`300/400`) \| `relaxed` (`600/800`) + custom `1..100000` |
| **4. Standards** | `verification.level` | `strict_e2e` | `strict_e2e` \| `fast_check` \| `manual` |
| **5. Deliverables** | `deliverables.routing` | `brain_artifacts` | `brain_artifacts` (`<appDataDir>\brain\<conversation-id>\` default, Clean Git) \| `workspace_reports` (`./reports/{topic}/` opt-in only) \| `both` |
| **5. Deliverables** | `language.response` | `auto` | All 17 languages: `auto` \| `vi` \| `en` \| `zh-CN` \| `zh-TW` \| `ja` \| `ko` \| `es` \| `fr` \| `de` \| `pt-BR` \| `ru` \| `hi` \| `ar` \| `id` \| `th` \| `tr` \| `it` |
```

### Step 2 — Launch Native Interactive `ask_question` UI Widget
Invoke the platform's native **`ask_question`** tool (or numbered Markdown menu if `ask_question` is unavailable) with these structured choices:

1. **Question 1 — Preset Profile or Execution Mode**:
   - `(Recommended) ⚡ Preset: smart-hybrid (Mode A ≤2 files, Elastic Swarm max 8 sub-agents, auto_team NL routing, Brain Artifacts)`
   - `🛡️ Preset: carbon-guardrails (Carbon Drives, BoomOpen Guards: <3KB Antigravity Slim GEMINI.md, Mode A ≤10 files, NL off, strict Pragmatic 400/500 & E2E)`
   - `🚀 Preset: solo-fast (Force Mode A Direct Execution, Conservative max 3 sub-agents, :fast variant, relaxed 600/800 lines)`
   - `🧠 Preset: deep-architect (Force Mode B Orchestrator, Elastic Swarm max 12 sub-agents, :hard variant, strict 300/400 lines)`
   - `🔺 Preset: adversarial-team (Force Elastic Golden Diamond :team + Cross-Engine Council, Hyper Swarm max 12 sub-agents, strict E2E)`
   - `🛠️ Custom: Keep current preset and customize individual settings below`

2. **Question 2 — Cross-Engine Conductor (`engines.*`) & Swarm Scaling**:
   - `(Recommended) ⚡ Smart-Hybrid Default (engines.* = current, councilMembers = claude,codex,antigravity, Elastic Swarm max 8)`
   - `🏛️ Multi-Engine Council Mode (engines.researcher = council, engines.planner = council across Claude + Codex + Antigravity)`
   - `🎼 Cross-Engine Role Pipeline (engines.planner = claude, engines.coder = codex, engines.reviewer = cross_family)`
   - `🔥 Hyper Swarm (max 12-16 sub-agents, aggressive parallel sharding)`

3. **Question 3 — Coding Standards, Model Policy & Deliverable Routing**:
   - `(Recommended) 📏 Pragmatic (400/500 lines) + Quality-First (inherit) + Brain Artifacts (<appDataDir>\brain\<conversation-id>\ Clean Git)`
   - `🛡️ Strict (300/400 lines) + Strict Inherit + Brain Artifacts (<appDataDir>\brain\<conversation-id>\)`
   - `📂 Opt-In Workspace Reports (deliverables.routing = workspace_reports -> ./reports/{topic}/ when explicitly desired)`
   - `🌐 Launch Local Web Control Center UI (http://127.0.0.1:4567)`

### Step 3 — Persist & Sync Global Changes Across Installed Platforms
1. Execute the selected changes via CLI:
   - Preset selected → `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings preset <preset-name> [--project]`
   - Custom overrides → `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings set <key> <value> [--project]`
   - Web UI selected → `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js settings --ui`
2. Confirm the updated file (`~/.boomopen/settings.json` or `./.boomopen.json`), synced platform entry files (global changes only), and active settings summary.

---

## 📦 FOUR BUILT-IN PRESET PROFILES (REFERENCE)

| Setting Key | `smart-hybrid` (Default) | `solo-fast` | `deep-architect` | `adversarial-team` |
|:------------|:------------------------:|:-----------:|:----------------:|:------------------:|
| `execution.mode` / `modeAThresholdFiles` | `auto` / `2` | `mode_a` / `10` | `mode_b` / `1` | `team` / `1` |
| `execution.swarmScaling` / `maxParallelSubagents` | **`elastic`** / **`8`** | `conservative` / `3` | **`elastic`** / **`12`** | **`hyper_swarm`** / **`12`** |
| `workflows.defaultVariant` / `naturalLanguageResearchTrigger` | `auto` / **`auto_team`** | `fast` / `off` | `hard` / `auto_hard` | `team` / **`auto_team`** |
| `engines.researcher` / `engines.planner` | `current` / `current` | `current` / `current` | `council` / `auto` | `council` / `council` |
| `engines.coder` / `engines.debugger` | `current` / `current` | `current` / `current` | `auto` / `cross_family` | `auto` / `cross_family` |
| `engines.reviewer` / `engines.councilMembers` | `current` / `claude,codex,antigravity` | `current` / `claude,codex` | `cross_family` / `claude,codex,antigravity` | `council` / `claude,codex,antigravity` |
| `models.subagentPolicy` / `research.depth` | `quality_first` / `5_lens_deep` | `balanced_speed` / `quick_brief` | `strict_inherit` / `5_lens_deep` | `strict_inherit` / `5_lens_deep` |
| `clarification.style` / `teams.maxDebateRounds` | `autonomous_first` / `3` | `zero_questions` / `1` | `interactive_ask` / `3` | `interactive_ask` / `3` |
| `codingStandards.preset` (`soft` / `hard`) | `pragmatic` (`400/500`) | `relaxed` (`600/800`) | `strict` (`300/400`) | `strict` (`300/400`) |
| `verification.level` / `deliverables.routing` | `strict_e2e` / `brain_artifacts` | `fast_check` / `brain_artifacts` | `strict_e2e` / `brain_artifacts` | `strict_e2e` / `both` |
| `language.response` | `auto` (`17 langs`) | `auto` (`17 langs`) | `auto` (`17 langs`) | `auto` (`17 langs`) |
