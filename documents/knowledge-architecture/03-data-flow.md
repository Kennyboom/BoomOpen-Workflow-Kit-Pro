# BoomOpen Workflow Kit — Data Flow

> **Purpose**: End-to-end runtime lifecycles — 5-Stage Fast-Forward & 3-Wave execution, SHA-256 manifest CLI install, 2-step `O(1)` skill resolution, Elastic Golden Diamond / Conductor flows, and `E0–E6` recovery for **BoomOpen Workflow Kit v5.5.0**
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-10
> **Version**: `5.5.0`

---

## Table of Contents

1. [Smart-Hybrid Command, Fast-Forward & 3-Wave Lifecycle](#smart-hybrid-command-fast-forward--3-wave-lifecycle)
2. [Source-Only CLI Install & SHA-256 Ownership Flow](#source-only-cli-install--sha-256-ownership-flow)
3. [2-Step `O(1)` Progressive Skill Resolution Flow (`HSOL v5.5`)](#2-step-o1-progressive-skill-resolution-flow-hsol-v55)
4. [Elastic Golden Diamond (`:team`), Autopilot & Conductor Flows](#elastic-golden-diamond-team-autopilot--conductor-flows)
5. [Self-Healing Error Recovery Flow (`E0–E6`)](#self-healing-error-recovery-flow-e0e6)
6. [Evidence Sources](#evidence-sources)

---

## Smart-Hybrid Command, Fast-Forward & 3-Wave Lifecycle

From a user prompt in any of **17 supported languages** (or an explicit `/cmd[:variant]`), the pre-loaded platform entrypoint evaluates the **Proactive Sub-agent First Gate**. Mode A handles `<= 2` known-file micro-edits directly; Mode B loads the flat workflow file (`commands/{cmd}-{variant}.md`), runs the **5-Stage Fast-Forward State Machine** (`boomopen cook state`), compiles **5-Field Wave Handoff Packets** (`boomopen cook packets`), and verifies each wave via deterministic CLI gates.

```mermaid
sequenceDiagram
    participant U as User (17 Languages / /cmd)
    participant EP as Entrypoint (<= 250L + AOT Settings)
    participant CLI as boomopen CLI (< 50ms Gates)
    participant W as Flat Workflow (commands/{cmd}-{variant}.md)
    participant S1 as Wave 1 Shards (Schema · Contracts · Tokens)
    participant S2 as Wave 2 Shards (role#shard <= 3-4 Files)
    participant QA as Wave 3 Shards (tester#1..k · reviewer#1..m)

    U->>EP: Prompt or /cook:hard / /code:team / NL intent
    alt Mode A (<= 2 known files, 1 domain, 0 exploration, no /cmd)
        EP->>EP: Edit directly + run tests/typecheck + Pragmatic 2-Tier check
        EP->>U: Verified micro-edit result
    else Mode B (> 2 files, >= 2 domains, 17-lang NL intent, or /cmd)
        EP->>W: Read flat commands/{cmd}-{variant}.md (Turn-1 Instant Dispatch)
        W->>CLI: boomopen cook state (inspect Brain Artifacts / reports)
        CLI-->>W: Earliest incomplete stage (Stage 1..5)
        opt Stages 1-3 Needed (Discovery -> Design -> Plan)
            W->>CLI: boomopen research validate (RES-G1..G4) + brief
            W->>CLI: boomopen design validate (DESIGN-G1..G4) + contract
            W->>CLI: boomopen plan validate (PLAN-G1..G5) [--sync-ledger]
        end
        W->>CLI: boomopen cook packets "<plan.md>" --wave 1
        CLI-->>W: 5-Field Handoff Packets (disjoint OWNED_FILES)
        W->>S1: Parallel invoke_subagent (role#shard -> conversationId)
        S1-->>W: Wave 1 contracts, SQL migrations & OKLCH CSS tokens
        W->>CLI: boomopen cook verify-wave "<plan.md>" --wave 1 --git --run-verify
        W->>CLI: boomopen cook packets "<plan.md>" --wave 2
        W->>S2: Parallel invoke_subagent (SHARED_CONTRACT in READ_ONLY_FILES)
        S2-->>W: Sharded feature implementations
        W->>CLI: boomopen cook verify-wave "<plan.md>" --wave 2 --git --run-verify
        W->>QA: Parallel tester#1..k + reviewer#1..m
        opt Defect or check --strict-phase --no-stubs failure
            W->>S2: Warm send_message(Recipient: conversationId) -> targeted fix
        end
        W->>U: Verified build + cohesive Brain Artifacts (<= 500 lines)
    end
```

### Data Flowing Across Stages (`boomopen cook` + Validators)

| Stage | Primary Artifact / Payload | Deterministic CLI Gate |
|-------|----------------------------|------------------------|
| **Turn-1 Gate** | Prompt + active `BOOMOPEN-SETTINGS` block | Mode A (`<= 2` known files) vs. Mode B (`commands/{cmd}-{variant}.md`) |
| **Stage 1: Discovery** | `SCOUT-{task}.md`, `RESEARCH-{task}.md` / `BRAINSTORM-{task}.md` | `boomopen research <validate\|brief>` (`RES-G1..G4`) |
| **Stage 2: UI/UX Design** | `DESIGN-{task}.md` (`<= 500` lines) + optional `DESIGN-PREVIEW-*.html` | `boomopen design <validate\|contract>` (`DESIGN-G1..G4` -> `@theme` CSS + TS Props) |
| **Stage 3: Planning** | `PLAN-{task}.md` (`<= 500` lines, `RequestFeedback: true`) | `boomopen plan <validate\|compile>` (`PLAN-G1..G5` -> DAG & `<= 4` `OWNED_FILES`/shard) |
| **Stage 4: 3-Wave Code** | 5-Field Wave Handoff Packets (`SHARED_CONTRACT`, `OWNED_FILES`, `READ_ONLY_FILES`) | `boomopen cook <packets\|verify-wave>` (`COOK-G1..G4`) + `boomopen check --strict-phase --no-stubs` |
| **Stage 5: Parallel QA** | `TEST-{task}.md` & `REVIEW-{task}.md` + warm `send_message` repairs | Full test suite + `boomopen check --strict-phase --no-stubs` (`0` stubs, `0` `.skip`/`.only`) |

---

## Source-Only CLI Install & SHA-256 Ownership Flow

BoomOpen Workflow Kit is distributed strictly from its Git repository (`npmPublish: false`). During installation, `cli/install.js` builds a per-platform plan (`cli/tool-config.js`), tracks every file written into shared user directories with a SHA-256 ledger (`~/.boomopen/manifests/<tool>.json`), backs up pre-existing user files (`~/.boomopen/backups/`), injects marked kit/settings blocks without clobbering user prose, and refuses to execute from inside an already-installed framework copy.

```mermaid
flowchart TD
    CLONE["git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git<br/>cd BoomOpen-Workflow-Kit-Pro<br/>node cli/install.js install <tool|--all> [--with-hooks]<br/>(or: npm link -> boomopen install <tool>)"]

    GUARD["Self-Overwrite Guard (installedCopyProblem)<br/>Refuse running install/uninstall from ~/.<tool>/skills/boomopen-workflow-kit/"]
    PLAN["Build Platform Plan (cursor | copilot | antigravity | claude | codex)<br/>+ Initialize SHA-256 InstallLedger (~/.boomopen/manifests/<tool>.json)"]

    subgraph "Per-Platform Atomic Pipeline"
        MIGRATE["Clean legacy artifacts & back up pre-existing user files<br/>to ~/.boomopen/backups/<tool>/"]
        ENTRY["Inject marked blocks into global entrypoints<br/><!-- boomopen-workflow-kit-START/END --> (preserves user text)"]
        FW["Copy CORE_DIRS + ROOT_FILES + hooks into frameworkPath<br/>Apply {TOOL} replacements (keep VERBATIM_DIRS untouched)"]
        SHARED["Sync shared folders (skills/, skills_library/, commands/, agents/)<br/>Record SHA-256 hashes in InstallLedger"]
        SPECIAL["Platform Specials:<br/>• Codex: TOML-aware merge into ~/.codex/config.toml + 21 role TOMLs + 79 command skills<br/>• Claude (--with-hooks): register PreToolUse validate-tool-call.mjs"]
        PRUNE["Prune stale unmodified kit files from prior manifest<br/>+ Save ~/.boomopen/manifests/<tool>.json"]
        AOT["< 10ms AOT Settings Sync<br/>Inject <!-- BOOMOPEN-SETTINGS-START/END --> across installed entrypoints"]
    end

    VERIFY["Post-Install Verification & Summary Report"]

    CLONE --> GUARD --> PLAN --> MIGRATE --> ENTRY --> FW --> SHARED --> SPECIAL --> PRUNE --> AOT --> VERIFY
```

### Installed Artifact Routing per Platform

| Asset Group | Source in Repo | Installed Destination | Transform Policy |
|-------------|----------------|-----------------------|------------------|
| Global Entrypoints | `GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`, `platforms/*` | `~/.gemini/GEMINI.md`, `~/.claude/CLAUDE.md`, `~/.codex/{CODEX,AGENTS}.md`, `~/.cursor/CURSOR.md`, `~/.copilot/COPILOT.md`, etc. | Marked block + `{TOOL}` replacement + AOT settings block |
| Framework Core (`CORE_DIRS`) | `agents/`, `rules/`, `commands/`, `matrix-skills/`, `cli/`, `scripts/`, `documents/` | `~/.{tool}/skills/boomopen-workflow-kit/` (`~/.gemini/config/skills/boomopen-workflow-kit/` on Antigravity) | `{TOOL}` replacement (`documents/` copied verbatim via `VERBATIM_DIRS`) |
| Core Skills (`22`) | `skills/*/SKILL.md` | `~/.{tool}/skills/*/` (`~/.gemini/config/skills/*/` on Antigravity) | `{TOOL}` replacement + SHA-256 manifest ledger |
| Library Vault (`1,440`) | `skills_library/*/SKILL.md` | `~/.{tool}/skills_library/*/` (`~/.gemini/config/skills_library/*/` on Antigravity) | Copied verbatim (`VERBATIM_DIRS`) + SHA-256 manifest ledger |
| Ownership Manifest | Generated at install | `~/.boomopen/manifests/<tool>.json` & `~/.boomopen/backups/<tool>/` | Preserves user-modified files on upgrade/uninstall |

---

## 2-Step `O(1)` Progressive Skill Resolution Flow (`HSOL v5.5`)

To keep startup token overhead near zero while exposing `1,462` domain skills, agents never scan all `19` YAML matrices manually. Instead, `rules/SKILLS.md` enforces a **Fast 2-Step Progressive Lookup** backed by `matrix-skills/compact-index.json`.

```mermaid
flowchart TD
    START["Specialist Shard Invoked<br/>(e.g., backend-engineer#auth, Profile: backend:execution)"]
    COMPLEXITY{{"Task Complexity?"}}
    SKIP["Simple Task<br/>Use base model expertise (0 extra file reads)"]

    STEP1["STEP 1 — Pre-Loaded Core Skills (0ms)<br/>Check 22 Core Skills in system prompt <skills>"]
    IN_CORE{{"Match in <skills>?"}}
    READ_CORE["Read matched ~/.{tool}/skills/<id>/SKILL.md"]

    STEP2["STEP 2 — Compact Index Lookup (O(1))<br/>Query matrix-skills/compact-index.json (1,462 skills)<br/>via skill-seeker (or targeted grep in skills_library/)"]
    IN_LIB{{"Match in compact-index.json?"}}
    READ_LIB["Read ONLY matched ~/.{tool}/skills_library/<id>/SKILL.md"]

    DYN{{"Variant is :hard or :team<br/>AND HSOL fitness < 0.8?"}}
    COMMUNITY["Optional Community Discovery (npx skills find)<br/>Trust progression: 0.3 -> 0.5 -> 0.7 -> 1.0<br/>(User confirmation required if fitness < 0.75)"]
    EXECUTE["Execute Shard Work under Skill Guardrails"]

    START --> COMPLEXITY
    COMPLEXITY -->|"Simple"| SKIP --> EXECUTE
    COMPLEXITY -->|"Complex"| STEP1 --> IN_CORE
    IN_CORE -->|"Yes"| READ_CORE --> EXECUTE
    IN_CORE -->|"No (niche framework/domain)"| STEP2 --> IN_LIB
    IN_LIB -->|"Yes"| READ_LIB --> EXECUTE
    IN_LIB -->|"No"| DYN
    DYN -->|"Yes"| COMMUNITY --> EXECUTE
    DYN -->|"No"| EXECUTE
```

### HSOL Fitness Formula & Trust Tiers (`matrix-skills/_index.yaml`)

$$\text{Fitness} = 0.35 \times \text{Semantic} + 0.25 \times \text{Specificity} + 0.20 \times \text{Trust} + 0.10 \times \text{Freshness} + 0.10 \times \text{SuccessRate}$$

- **Bundled Core (`22`) & Library (`1,440`) Skills**: Pre-verified (`trust = 1.0`) by `boomopen doctor`.
- **Dynamic Community Skills (`_dynamic.yaml`)**: `NEW (0.3)` $\rightarrow$ `EVALUATING (0.5, 3 runs)` $\rightarrow$ `VALIDATED (0.7, 10 runs)` $\rightarrow$ `PROMOTED (1.0, >= 85% success)`.

---

## Elastic Golden Diamond (`:team`), Autopilot & Conductor Flows

### 1. Elastic Golden Diamond (`18` Specialist Teams)

When `:team` is invoked (or auto-triggered via `naturalLanguageResearchTrigger = auto_team`), `rules/TEAMS.md` scales from `1-1-1` (`<= 4` files) up to **`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`**, using **Topology A** (Turn-1 parallel fan-out for research, brainstorm, review, Stage 1 discovery, and CLI-validated plans) or **Topology B** (`SHARED_CONTRACT` lock first for unplanned multi-file coding).

```mermaid
sequenceDiagram
    participant ORC as Orchestrator
    participant TL as Pillar 1: Tech Lead [1]
    participant EX as Pillar 2: Executor Shards [1..6] (role#shard)
    participant CR as Pillar 3: Critics / Testers [1..3]
    participant MB as Append-Only MAILBOX-{date}.md
    participant CLI as boomopen CLI Validator

    ORC->>TL: Dispatch :team wave (Topology A Turn-1 Fan-Out or Topology B Contract-First)
    ORC->>EX: Parallel invoke_subagent (<= 3-4 disjoint OWNED_FILES per shard)
    EX->>CLI: Run research/design/plan validate or cook verify-wave + check --strict-phase --no-stubs
    CLI-->>EX: Gate PASS
    EX->>MB: Append SUBMISSION (with empirical evidence)
    ORC->>CR: Parallel review / test across Critic shards
    CR->>MB: Append REVIEW (PASS or FAIL with file:line findings)

    opt Round 2-3 Targeted Warm Debate (Only failing shards wake up)
        ORC->>EX: send_message(Recipient: conversationId) -> Fix or Empirical DEFENSE
        EX->>MB: Append RESUBMISSION or DEFENSE
        ORC->>CR: send_message(Recipient: conversationId) -> Re-verify
    end

    opt Unresolved after 3 Rounds (C8-TEAMS-02)
        TL->>MB: Read full log -> Append binding ARBITRATION DECISION
    end

    Note over TL,CR: C8-TEAMS-03 Consensus Stamp + CLI Gate Exit 0
    TL-->>ORC: Release verified consensus deliverable
```

### 2. Multi-Session Autopilot (`boomopen ledger`) & Cross-Engine Conductor (`boomopen conduct`)

- **Autopilot Ledger (`.boomopen/project-ledger.json`)**: `boomopen ledger from-plan <plan.md>` compiles multi-phase specs with SHA-256 spec hashes. Across sessions, `boomopen ledger next` loads the next unfinished phase (locking prior `test_files` in `READ_ONLY_FILES`), and `boomopen ledger verify --phase <id> --passed-tests <N> --run-verify` enforces monotonic cumulative test growth before advancing.
- **Cross-Engine Conductor (`boomopen conduct`)**:
  - **6-Task Parallel Council (`research|brainstorm|plan|design|review|debug`)**: `boomopen conduct council --task <type> --engines claude,codex,antigravity` runs multiple engines in parallel and reconciles `.boomopen/conductor/runs/<runId>-<engine>.md` into `<runId>-COUNCIL-SYNTHESIS.md`.
  - **Cross-Engine Pipeline (`boomopen conduct dispatch`)**: Enforces `Author != Critic` across model families and guards `READ_ONLY_FILES` via SHA-256 snapshots before and after external engine execution.

---

## Self-Healing Error Recovery Flow (`E0–E6`)

`rules/ERRORS.md` (`v5.5`) classifies every runtime or CLI failure into **`7` deterministic classes (`E0–E6`)** so workflows never halt silently and never cold-respawn warm shards unnecessarily.

```mermaid
flowchart TD
    ERR["Runtime Error or Non-Zero CLI Exit"]
    CAP["1. CAPTURE: code, gate ID, wave, role#shard, conversationId, OWNED_FILES"]
    CLS["2. CLASSIFY (E0 - E6)"]

    E0["E0: Sub-agent Interrupted<br/>Warm Auto-Revive via send_message(conversationId)"]
    E1["E1: Transient Tool / Network<br/>Retry up to 3x + cross-OS shell fallback"]
    E1B["E1b: Artifact > 500 Lines<br/>Compress to 1 cohesive <= 500L file or sync epic to project-ledger.json"]
    E2["E2: Build / Test / check Failure<br/>Send exact File:Line to owning warm role#shard via send_message"]
    E3["E3: Blocking Spec / Resource Conflict<br/>Apply autonomous_first or prompt via ask_question UI"]
    E4["E4: Cross-Shard Contract Drift<br/>Rollback OWNED_FILES -> Tech Lead updates SHARED_CONTRACT -> broadcast delta"]
    E5["E5: CLI Validator Failure (RES/DESIGN/PLAN/COOK/LEDGER)<br/>Route failed gate IDs to warm shard -> repair -> re-run CLI until exit 0"]
    E6["E6: Round-2 Debug / Review Deadlock<br/>Escalate via boomopen conduct dispatch --engine cross_family"]

    OK["Verify Exit 0 & Resume Immediately"]
    USER["Explicit User Decision (ask_question)"]

    ERR --> CAP --> CLS
    CLS --> E0 & E1 & E1B & E2 & E4 & E5 & E6 --> OK
    CLS --> E3 --> USER
    E1 & E2 & E6 -->|"Unresolved after max retries"| USER
```

---

## Evidence Sources

| Source | Path | What It Provides |
|--------|------|------------------|
| `rules/CORE.md` | [../../rules/CORE.md](../../rules/CORE.md) | Turn-1 Mode A/B gate, 17-language routing, Brain Artifact defaults |
| `rules/PHASES.md` | [../../rules/PHASES.md](../../rules/PHASES.md) | 5-Stage Fast-Forward (`boomopen cook state`), 3-Wave Contract-First pipeline |
| `rules/AGENTS.md` | [../../rules/AGENTS.md](../../rules/AGENTS.md) | 5-Field Handoff Packet, `role#shard -> conversationId` warm reuse |
| `rules/TEAMS.md` | [../../rules/TEAMS.md](../../rules/TEAMS.md) | Elastic Golden Diamond, Topology A/B, `C8-TEAMS-01..04` |
| `rules/SKILLS.md` | [../../rules/SKILLS.md](../../rules/SKILLS.md) | 2-step progressive lookup (`<skills>` -> `compact-index.json`), HSOL formula |
| `rules/ERRORS.md` | [../../rules/ERRORS.md](../../rules/ERRORS.md) | `E0–E6` recovery flows and `A1–A14` anti-patterns |
| `cli/install.js` | [../../cli/install.js](../../cli/install.js) | `InstallLedger`, backups, `{TOOL}` transforms, `< 10ms` AOT settings sync |
| `cli/cook.js` | [../../cli/cook.js](../../cli/cook.js) | `detectCookState`, `compileWavePackets`, `verifyWaveExecution` (`COOK-G1..G4`) |
| `cli/ledger.js` | [../../cli/ledger.js](../../cli/ledger.js) | `.boomopen/project-ledger.json` SHA-256 spec-hash drift guard & phase ratchet |
| `cli/conductor.js` | [../../cli/conductor.js](../../cli/conductor.js) | `Author != Critic` dispatch, SHA-256 `READ_ONLY_FILES` guard, 6-Task Council |
