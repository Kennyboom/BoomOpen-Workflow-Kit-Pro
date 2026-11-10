# BoomOpen Workflow Kit — Decision Rules & Exceptions

| Field | Value |
|-------|-------|
| **Purpose** | Codify all `v5.5.0` business decision rules, Mode A/B routing gates, Cognitive Load Sharding laws, CLI compiler gates, `HSOL v5.5` skill thresholds, `:team` checkpoints, and `E0–E6` exception recovery |
| **Parent** | [00-index.md](./00-index.md) |
| **Last Updated** | 2026-11-10 |
| **Version** | 5.5.0 (Smart-Hybrid Edition) |

---

## 1. Settings Precedence & 10 Smart-Hybrid Orchestration Laws (`L1–L10`)

### Configuration Precedence Hierarchy
1. **Explicit Turn Command** (`/cmd:variant`, `@fast` / `@deep` / `@team` override on the current prompt)
2. **Workspace Project Override** (`./.boomopen.json`)
3. **Global Active Settings** (`~/.boomopen/settings.json` synced into `<!-- BOOMOPEN-SETTINGS-START/END -->`)
4. **Default Kit Rules** (`GEMINI.md` / `CLAUDE.md` + `rules/*.md`)

### Core Orchestration Laws (`v5.5.0`)

| Law | Name | Binding Rule | Workflow Impact |
|:---:|------|--------------|-----------------|
| **L1** | Zero-Latency Turn-1 Entry | Global entrypoint (`<= 250` lines) embeds the 5-Field Handoff Packet; never waste Turn 1 reading `CORE.md` + `PHASES.md` + `AGENTS.md` before spawning shards | `BW-003`, `BW-004` |
| **L2** | 100% Requirement & Spec Fidelity | Parse every requirement into a Requirements Registry; apply `autonomous_first` for safe defaults and `ask_question` only on genuine contradictions | `BW-003`, `BW-008`, `BW-012` |
| **L3** | 4-Tier Dynamic Elastic Swarm | Never crawl `> 2` files solo and never overload a shard beyond `<= 3–4` heavy `OWNED_FILES` (or `1` deep vector) | `BW-003`, `BW-004`, `BW-011` |
| **L4** | Quality-First Model Policy | Mandatory `Model: "inherit"` (Pro High default) for all core specialist work; `flash` only for trivial chores; **`flash_lite` strictly forbidden** | All AI workflows |
| **L5** | 3-Wave Contract-First Execution | Lock schemas, API DTOs (`SHARED_CONTRACT`), and `DESIGN_CONTRACT` UI tokens in Wave 1 before parallel Wave 2 feature shards | `BW-008`, `BW-009`, `BW-011` |
| **L6** | Language Compliance | User responses & artifacts match user input language (technical terms in English); source code & comments are always English | All workflows |
| **L7** | Direct Plan-to-Executor Dispatch | Fast-forward past completed stages (`boomopen cook state`) and dispatch directly from validated `PLAN` to domain shards (`0` middleman hop) | `BW-008`, `BW-009` |
| **L8** | Scoped Warm Session Reuse | Record `role#shard -> conversationId` and route all follow-ups, fixes, and debate rounds via `send_message` (`0s` cold-start) | `BW-004`, `BW-011`, `BW-016` |
| **L9** | 4-Layer Deterministic Phase Ratchet | Every artifact/wave must pass its CLI gate (`research`, `design`, `plan`, `cook verify-wave`, `check --strict-phase --no-stubs`, `ledger verify`) | `BW-006`..`BW-013` |
| **L10** | Clean Git Working Tree | Route transient artifacts to `<appDataDir>/brain/<conversation-id>/` (or git-ignored `./reports/{topic}/`); write `./documents/` only on `/docs` | All artifact workflows |

---

## 2. Mode A vs Mode B Gate & Cognitive Load Sharding Rules

### Execution Mode Routing Rules

| Rule ID | Condition | Selected Mode | Action |
|---------|-----------|---------------|--------|
| `MR-001` | `<= 2` target files already known on Turn 1, `1` domain, `0` exploration needed, `0` `/cmd` or NL workflow intent | **Mode A (`Tier 0`)** | Execute, test, and verify directly under Pragmatic 2-Tier Coding Standards |
| `MR-002` | Open-ended codebase Q&A across `> 2` files with `0` workflow intent (*"where is X?"*, *"how does Y work?"*) | **Fast Q&A Fan-Out** | Spawn parallel read-only `scouter#1..k` shards (`Model: "inherit"`, `0` `.md` report clutter) |
| `MR-003` | Explicit `/cmd`, `> 2` files, `>= 2` domains, architectural design, or **17-language NL workflow intent** | **Mode B (`Tier 1–3`)** | Load flat `commands/{cmd}-{variant}.md` AND launch Turn-1 `TypeName: "self", Model: "inherit"` shards |
| `MR-004` | Sub-agent needs `search_web`, `run_command`, or `write_file` (`RESEARCH`, `BRAINSTORM`, `SCOUT`, `DEBUG`) | **`TypeName: "self"` Lock** | Mandatory `TypeName: "self"` (`TypeName: "research"` lacks network, shell, and write access) |
| `MR-005` | Sub-agent tool missing or errors at runtime | **TIER 2 Fallback** | Log `TIER 2` reason, read `agents/{agent}.md`, embody persona, and enforce all CLI gates |

### 4-Tier Elastic Swarm Sizing (`N_agents = min(maxParallelSubagents, max(ceil(Files / 3.5), Domains, Vectors))`)

| Swarm Tier | Scope Trigger | Parallel Shards | Sharding Constraint |
|------------|---------------|:---------------:|---------------------|
| **Tier 0 — Micro Direct** | `<= 2` known files, `1` domain, `0` exploration | `0` (Mode A) | Primary agent direct edit + verification |
| **Tier 1 — Focused Triad** | `3–5` files OR `2` domains/vectors | `2–3` | Disjoint `OWNED_FILES` (`<= 3–4` files/shard) |
| **Tier 2 — Elastic Swarm** | `6–12` files, `3–4` domains, OR `4–5` vectors | `4–6` | Scoped `role#shard` keys + `SHARED_CONTRACT` |
| **Tier 3 — Hyper-Swarm** | `13+` files or repo-wide audits | `7–8+` *(up to `8` default / `12` max)* | Full horizontal module sharding (`<= 3–4` files/shard) |

---

## 3. Deterministic CLI Compiler & Phase Ratchet Gates

| Gate Family | CLI Command | Mandatory Pass Criteria (Exit `0`) |
|-------------|-------------|------------------------------------|
| **`RES-G1..G4`** | `boomopen research validate <file.md> [--mode research\|brainstorm]` | 6-Block blueprint (`<= 500` lines), triangulated citations, contradiction arbitration / Devil's Advocate pre-mortem, MCDA recommendation |
| **`DESIGN-G1..G4`** | `boomopen design validate <design.md>` | 6-Block spec (`<= 500` lines), OKLCH + hex color tokens, 5-State Component Matrix, WCAG 2.2 AA contrast & touch targets, valid `DESIGN_CONTRACT` |
| **`PLAN-G1..G5`** | `boomopen plan validate <plan.md> [--sync-ledger]` | 6-Block completeness, acyclic wave DAG, 100% disjoint `OWNED_FILES` (`<= 4` files/shard), explicit `SHARED_CONTRACT` & `READ_ONLY_FILES`, runnable verify commands, `<= 500` lines |
| **`COOK-G1..G4`** | `boomopen cook verify-wave <plan.md> --wave <W> --git --run-verify` | Zero edits outside wave `OWNED_FILES`, zero `READ_ONLY_FILES` regression test tampering, verification command exit `0`, `check --strict-phase --no-stubs` pass |
| **`DBG-G1..G4`** | `/debug:hard` / `/debug:team` `SPIE v3.0` synthesis | Deterministic reproduction (`G1`), 5-Whys `[file:line]` chain (`G2`), `H1..Hk` falsification matrix (`G3`), blast-radius + fail-first test spec (`G4`) |
| **Zero-Omission Code Gate** | `boomopen check <dir> --strict-phase --no-stubs` | Soft `400` / Hard `500` lines, `0` explicit `any`, `0` prod `console.log`, `0` deferred `TODO`/`FIXME`/`PLACEHOLDER`, `0` hollow stubs, `0` `.skip`/`.only` or vacuous tests |
| **Autopilot Ratchet** | `boomopen ledger verify --phase <id> --passed-tests <N> --run-verify` | SHA-256 spec-hash match, prior `test_files` untouched, cumulative passed tests strictly non-decreasing |
| **Cross-Engine Guard** | `boomopen conduct dispatch --role <r> --author-engine <prev>` | Enforces `Author != Critic` across model families + pre/post SHA-256 `READ_ONLY_FILES` integrity |

---

## 4. `HSOL v5.5` Skill Resolution & Trust Rules

- **`HS-001` (2-Step `O(1)` Lookup)**: Always check `<skills>` (`22` Core Skills in `skills/`) first (`0ms`), then query `matrix-skills/compact-index.json` (`1,462` skills = `22` Core + `1,440` Library) via `skill-seeker` and read **only** matched `SKILL.md` files.
- **`HS-002` (5-Weight Fitness Formula)**: `fitness = 0.35*SEMANTIC_MATCH + 0.25*SPECIFICITY + 0.20*TRUST_LEVEL + 0.10*FRESHNESS + 0.10*SUCCESS_RATE`.
- **`HS-003` (Trust Progression)**: Curated vault skills carry `trust = 1.0`. Dynamically added skills (`_dynamic.yaml`) progress `NEW (0.3) -> EVALUATING (0.5, 3 successes) -> VALIDATED (0.7, 10 successes) -> PROMOTED (1.0, >= 85% rate & <= 30d inactive)`, transitioning to `BLOCKED (0.0)` if success rate `< 85%` or inactive `> 30` days (`90d` full decay). Low-trust critical external skills (`fitness < 0.75`) require user confirmation.

---

## 5. Elastic Golden Diamond Team Checkpoints (`C8-TEAMS-01..04`)

| Rule ID | Checkpoint | Enforcement |
|---------|------------|-------------|
| `C8-TEAMS-01` | **Append-Only Mailbox** | `<appDataDir>/brain/<conversation-id>/MAILBOX-{date}.md` (`RequestFeedback: false`) records all Round 2/3 inter-pillar exchanges |
| `C8-TEAMS-02` | **3-Round Debate Ceiling** | Maximum `3` targeted warm `send_message` rounds; unresolved disputes trigger binding Tech Lead `ARBITRATION` (or Round-2 Cross-Engine escalation) |
| `C8-TEAMS-03` | **Dual Gate + Consensus Stamp** | Release requires **both** CLI gate exit `0` and `CONSENSUS: TechLead + Executors (shard-1..N) + Critics (1..M)` |
| `C8-TEAMS-04` | **Disjoint Shard Locks** | Every `role#shard` holds `<= 3–4` disjoint `OWNED_FILES` (or `1` `*-v{k}.md` note); critiques without empirical proof (`file:line` / test log) auto-fail |

---

## 6. Exception Catalog (`E0–E6` & Operational Exceptions)

| Code / ID | Trigger | Deterministic Handling (`rules/ERRORS.md`) | Severity |
|-----------|---------|--------------------------------------------|----------|
| **`E0`** | Sub-agent interrupted or tool server restarted | **Warm Auto-Revive**: call `send_message(Recipient: conversationId)` to resume exact shard with `100%` context retained | Recoverable |
| **`E1`** | Transient tool timeout, network hiccup, or shell mismatch | Retry up to `3x` with backoff; use native PowerShell / Node fallback on Windows | Recoverable |
| **`E1b`** | Brain Artifact exceeds `500` lines | Compress into **1 cohesive file (`<= 500` lines)** (never split into `{name}/` folders) or compile epic phases into `.boomopen/project-ledger.json` | Auto-compacted |
| **`E2`** | Build, typecheck, test, or `check --strict-phase --no-stubs` failure | Route exact `File:Line` failure output to owning warm `role#shard` via `send_message`; iterate until `0` errors | Self-healing |
| **`E3`** | Genuine requirement contradiction or missing secret/credential | Apply `autonomous_first` when safe; otherwise pause affected shard and prompt user via `ask_question` (`(Recommended)` first) | User-gated |
| **`E4`** | Breaking `SHARED_CONTRACT` drift across sibling parallel shards | Halt propagation, rollback affected `OWNED_FILES`, update `SHARED_CONTRACT`, broadcast delta to warm shards via `send_message` | Coordinated rollback |
| **`E5`** | CLI validator (`research`, `design`, `plan`, `cook`, `ledger`) exits `1` | Send failed gate IDs to owning warm specialist shard via `send_message`, repair, and re-run CLI validator until exit `0` | Self-healing |
| **`E6`** | Same model family deadlocks after `2` debug/review rounds | Escalate via `boomopen conduct dispatch --role debugger --engine cross_family --author-engine <prev>` | Cross-engine |
| **`EX-CLI-01`** | Node.js `< 18.0.0`, unknown platform, or invalid CLI flag | Print usage/diagnostic and exit `1` or `2` without mutating user files | Blocking |
| **`EX-LEDGER-01`** | Spec file modified without updating `.boomopen/project-ledger.json` | SHA-256 Spec-Hash Drift Guard blocks `/autopilot:run` until re-validated via `boomopen ledger` | Integrity lock |

---

## Evidence Sources

- [../../../GEMINI.md](../../../GEMINI.md) · [../../../CLAUDE.md](../../../CLAUDE.md) — Settings precedence, Mode A/B gate, Pragmatic 2-Tier Standards
- [../../../rules/CORE.md](../../../rules/CORE.md) · [../../../rules/PHASES.md](../../../rules/PHASES.md) · [../../../rules/AGENTS.md](../../../rules/AGENTS.md) — Laws `L1–L10`, 4-Tier Swarm formula, Model Policy
- [../../../rules/TEAMS.md](../../../rules/TEAMS.md) · [../../../rules/SKILLS.md](../../../rules/SKILLS.md) · [../../../rules/ERRORS.md](../../../rules/ERRORS.md) — `C8-TEAMS-01..04`, `HSOL v5.5`, `E0–E6`, Anti-Patterns `A1–A14`
