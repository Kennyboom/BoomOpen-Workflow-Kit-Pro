# 💎 TEAMS — Elastic Golden Diamond & Cross-Engine Conductor Architecture

> **VERSION**: 5.5 — Antigravity 2.0 Smart-Hybrid Edition | **LOAD**: When `:team` or `/conduct` is invoked | **PURPOSE**: 3-Pillar adversarial collaboration (`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`) across **all 18 specialist teams**, Topology A vs. Topology B Round-1 Fan-Out, 3-Wave Contract-First Execution (`boomopen cook`), & Cross-Engine Conductor (`boomopen conduct`)

---

## 🔒 C8 Foundation Enforcement Checkpoints

- `C8-TEAMS-01` (BLOCK): Mailbox (`<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md`, `RequestFeedback: false`) is append-only and required for Round 2/3 inter-agent exchanges.
- `C8-TEAMS-02` (BLOCK): Debate is capped at 3 rounds; unresolved disputes escalate to Tech Lead arbitration (or Cross-Engine Escalation after Round 2).
- `C8-TEAMS-03` (BLOCK): Phase/Wave output requires both deterministic CLI gate pass (`research validate` / `design validate` / `plan validate` / `cook verify-wave` / `check --strict-phase --no-stubs`) and explicit consensus stamp before release.
- `C8-TEAMS-04` (BLOCK): Every Executor shard holds a 100% disjoint `OWNED_FILES` lock (`≤ 3–4` heavy files or `1` disjoint scratch vector note `*-v{k}.md` per shard) and never edits `READ_ONLY_FILES`.

---

## CORE PRINCIPLE: 3 ADVERSARIAL GOVERNANCE PILLARS & 2 ROUND-1 TOPOLOGIES

Every `:team` phase is governed by **3 Adversarial Governance Pillars** — **Lead Pillar (`[1]`)**, **Executor Pillar (`[1..6 parallel shards]`)**, and **Critic/QA Pillar (`[1..3 parallel reviewers/testers]`)** — scaled dynamically by the **Cognitive Load Sharding Law**:

$$N_{\text{agents}} = \min\!\left(\text{maxParallelSubagents},\; \max\!\left(\left\lceil \frac{\text{Total Target Files}}{3.5} \right\rceil,\; \text{Distinct Domains},\; \text{Research Vectors}\right)\right)$$

- **⚡ Topology A — Turn-1 Parallel Vector / Validated-Plan Fan-Out (`0` Pre-Flight Turns!)**: Mandatory for `/research:team`, `/brainstorm:team`, `/review:team`, Stage 1 discovery in `/plan:team` & `/design:team`, and **Validated-Plan `/code:team` / `/cook:team`** (`boomopen cook packets`). Launch Lead + Executor Shards (`1..6`) + Critics (`1..3`) **simultaneously on Turn 1** writing disjoint per-shard scratch files (`*-v{k}.md` / `*-s{k}.md`, `UserFacing: false, RequestFeedback: false`).
- **🔒 Topology B — Contract-Lock First (`STEP A → Parallel STEP B → Parallel STEP C`)**: Used ONLY for un-planned multi-file coding/fixing where `tech-lead` must first lock `SHARED_CONTRACT` + disjoint `OWNED_FILES` (`≤ 3–4` files/shard) in `MAILBOX-{date}.md` before parallel executors run **Wave 1 (Contracts/Schema/Tokens)** $\rightarrow$ **Wave 2 (Feature Shards)**.

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR — Topology A (Turn-1 Parallel Fan-Out) & Topology B (Contract-First) │
│                                                                                    │
│                      ┌──────────────────────────────────────┐                      │
│                      │      💎 PILLAR 1: TECH LEAD [1]      │                      │
│                      │  Contract Keeper · Arbitrator · Sign │                      │
│                      └──────┬────────────────────────┬──────┘                      │
│                             │                        │                             │
│         ┌───────────────────▼──────────────────┐ ┌───▼───────────────────────────┐ │
│         │ 🔨 PILLAR 2: EXECUTORS [1..6 Shards] │ │ 🛡️ PILLAR 3: CRITICS [1..3]   │ │
│         │ • Disjoint *-v{k}.md OR ≤ 3–4 files  │◄┤ • reviewer#code / premortem   │ │
│         │ • W1 contracts/tokens → W2 features  ├─► • security-engineer#sec       │ │
│         │ • CLI: research/design/plan/cook gate│ │ • tester#1..k (AC + Anti-Stub)│ │
│         └───────────────────▲──────────────────┘ └───▲───────────────────────────┘ │
│                             └────────── 📬 ──────────┘                             │
│              APPEND-ONLY MAILBOX + SCOPED WARM SESSIONS (role#shard)               │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## THE DEBATE MECHANISM & SCOPED WARM SESSION REUSE (`role#shard -> conversationId`)

- **Spawn Once per Shard, Converse Many (`send_message`)**: Spawn Lead (`[1]`), Executor shards (`[1..6]`), and Critics/Testers (`[1..3]`) **once** (`TypeName: "self"`, `Model: "inherit"`), record `role#shard -> conversationId`, and run all Round 2/3 fixes, defenses, and re-reviews via `send_message(Recipient: conversationId)`.
- **Targeted Shard Debate**: Only shards with `🔴 CRITICAL` or `🟠 HIGH` critiques or CLI gate failures enter Round 2 via `send_message`; clean shards stay idle.
- **Evidence Rule & Consensus Stamp**: Defend with empirical proof (`file:line`, benchmarks, RFC/WCAG specs, test outputs). Max **3 debate rounds** before binding Tech Lead `ARBITRATION`:
  `✅ CONSENSUS: TechLead ✓ | Executors (shard-1..N) ✓ | Critics/Reviewers (1..M) ✓`

---

## TEAM ROSTER (All 18 Specialist Teams in `agents/teams/` — Default `Model: "inherit"`)

| Team Directory (`18`) | Lead Pillar (`[1]`) | Executor Pillar (`[1..6 Shards]`) | Critic / QA Pillar (`[1..3 Critics]`) |
|-----------------------|---------------------|-----------------------------------|---------------------------------------|
| `backend-team` | `tech-lead` | `backend-engineer#contracts` (W1) $\rightarrow$ `backend-engineer#1..N` (W2) | `reviewer#code` (+ `security-engineer#sec`, `tester#api`) |
| `frontend-team` | `tech-lead` | `frontend-engineer#tokens-primitives` (W1) $\rightarrow$ `frontend-engineer#screen-1..N` (W2) | `reviewer#ui` (+ `designer#a11y`, `tester#e2e`) |
| `fullstack-team` | `tech-lead` | **W1**: `database-architect#schema` + `backend-engineer#contracts` + `frontend-engineer#tokens-primitives` $\rightarrow$ **W2**: `backend-engineer#1..N` + `frontend-engineer#screen-1..M` | `reviewer#code` + `security-engineer#sec` + `tester#1..K` |
| `database-team` | `tech-lead` | `database-architect#schema` + `database-architect#queries` | `reviewer#schema` + `performance-engineer#query` |
| `research-team` | `researcher#lead` (Vector 1) | `researcher#vector-2..N` + `scouter#codebase` | `researcher#adversarial` (Fact-checker & blind-spot hunter) |
| `brainstorm-team` | `brainstorm-team-techlead` | `scouter#1..k` + `researcher#1..k` (S1) $\rightarrow$ `brainstorm-team-executor (brainstormer#opt-1..k)` (S2 — **ZERO APP CODE!**) | `brainstorm-team-reviewer (tech-lead#premortem)` |
| `planning-team` | `planning-team-techlead` | `scouter#1..k` + `researcher#1..k` (S1) $\rightarrow$ `planning-team-executor` (`planner#1..k`, S2) | `planning-team-reviewer` (+ `security-engineer#sec` + `business-analyst#ac`) |
| `design-team` | `design-team-techlead` | `scouter#ui-tokens` + `researcher#ux` (S1) $\rightarrow$ `design-team-executor` (`designer#spec-1..k`, S2 — **ZERO APP CODE!**) | `design-team-reviewer` (+ `frontend-engineer#feasibility`) |
| `qa-team` | `tester#lead` | `tester#unit` + `tester#integration` + `tester#e2e` | `security-engineer#sec` + `performance-engineer#perf` |
| `debug-team` | `debugger#lead` | `debugger#hypothesis-1..N` + `backend-engineer#fix` | `reviewer#root-cause` + `tester#regression` |
| `devops-team` | `devops-engineer` | `devops-engineer#iac` + `devops-engineer#ci` | `security-engineer#devsecops` |
| `security-team` | `security-engineer#lead` | `security-engineer#audit-1..N` + `backend-engineer#remediate` | `reviewer#pentest` |
| `game-team` | `tech-lead` | `game-engineer#ecs-contracts` (W1) $\rightarrow$ `game-engineer#1..N` (W2) | `reviewer#arch` + `performance-engineer#60fps` |
| `mobile-team` | `tech-lead` | `mobile-engineer#tokens-navigation` (W1) $\rightarrow$ `mobile-engineer#screen-1..N` (W2) | `reviewer#platform-ux` + `tester#mobile` |
| `performance-team` | `performance-engineer` | `backend-engineer#opt` + `frontend-engineer#opt` | `reviewer#benchmarks` |
| `docs-team` | `docs-manager` | `researcher#1..N` + `docs-manager#writer` | `reviewer#accuracy` |
| `project-team` | `project-manager` | `business-analyst#req-1..N` | `tech-lead#feasibility` |
| `report-team` | `reporter` | `scouter#metrics-1..N` | `reviewer#data-accuracy` |

---

## TIERED EXECUTION & 🎼 CROSS-ENGINE CONDUCTOR (`boomopen conduct`)

1. **TIER 1 (Mandatory Default)**: Spawn shards via `invoke_subagent(TypeName: "self", Model: "inherit")`, enforce CLI gates (`boomopen research|design|plan validate`, `boomopen cook verify-wave`, `boomopen check <dir> --strict-phase --no-stubs`), and run Round 2/3 debates via `send_message(Recipient: conversationId)`. (**TIER 2** sequential embodiment is strictly a tool-error fallback.)
2. **Cross-Engine Pipeline (`boomopen conduct dispatch` — `Author != Critic`)**: Assigns phases across distinct model families (`Claude`, `Codex`, `Antigravity`) and escalates unresolved Round-2 bugs via `boomopen conduct dispatch --role debugger --author-engine <prev>`.
3. **Multi-Engine Council (`boomopen conduct council`)**: Runs `boomopen conduct council --task <type> --engines claude,codex,antigravity --prompt "<task>"` in parallel and reconciles `.boomopen/conductor/runs/<runId>-<engine>.md` into `COUNCIL-SYNTHESIS.md` (`🟢 Unanimous Consensus`, `🟡 Unique Blind-Spot Insights`, `🔴 Contradictions & Evidence Arbitration`, `🏆 Final Synthesized Conclusion`).
