# BoomOpen Workflow Kit — Architecture Decision Records

> **Purpose**: Key Architecture Decision Records (`ADR-001` through `ADR-007`) for **BoomOpen Workflow Kit v5.5.0**, documenting context, decisions, rejected alternatives, rationale, and trade-offs
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-25
> **Version**: `5.5.0`

---

## Table of Contents

1. [ADR Summary Table](#adr-summary-table)
2. [ADR-001: Smart-Hybrid Markdown Protocols Paired with Deterministic CLI Compilers](#adr-001-smart-hybrid-markdown-protocols-paired-with-deterministic-cli-compilers)
3. [ADR-002: Host AI Model Runtime with Proactive Sub-agent First Gate](#adr-002-host-ai-model-runtime-with-proactive-sub-agent-first-gate)
4. [ADR-003: Zero Runtime npm Dependencies & Source-Only Git Distribution](#adr-003-zero-runtime-npm-dependencies--source-only-git-distribution)
5. [ADR-004: 5-Platform Unified Abstraction via Templates, SHA-256 Ledgers & AOT Settings](#adr-004-5-platform-unified-abstraction-via-templates-sha-256-ledgers--aot-settings)
6. [ADR-005: Elastic Golden Diamond Topology & 4-Tier Cognitive Load Sharding](#adr-005-elastic-golden-diamond-topology--4-tier-cognitive-load-sharding)
7. [ADR-006: Two-Tier `1,462`-Skill Vault & `O(1)` Compact-Index Resolution (`HSOL v5.5`)](#adr-006-two-tier-1462-skill-vault--o1-compact-index-resolution-hsol-v55)
8. [ADR-007: 10 Orchestration Laws, 4-Layer Phase Ratchet & Cross-Engine Conductor](#adr-007-10-orchestration-laws-4-layer-phase-ratchet--cross-engine-conductor)
9. [Evidence Sources](#evidence-sources)

---

## ADR Summary Table

| ADR | Decision (`v5.5.0`) | Status | Primary Impact |
|-----|---------------------|--------|----------------|
| **001** | Smart-Hybrid Markdown protocols + `14` deterministic `boomopen` CLI subcommands | Accepted | Human-readable workflows backed by `< 50ms` machine-verified gates and `34` `node:test` suites |
| **002** | Host AI model runtime + Proactive Sub-agent First Gate (`Mode A` vs. `Mode B`) | Accepted | Zero cloud infrastructure cost; instant micro-edits (`<= 2` files) + clean parent context on `> 2` files |
| **003** | Zero runtime npm dependencies + source-only Git distribution (`npmPublish: false`) | Accepted | Zero supply-chain risk; cross-OS reliability on Windows, macOS, and Linux (`Node >= 18.0.0`) |
| **004** | `5`-platform `{TOOL}` templates + SHA-256 `InstallLedger` + `< 10ms` AOT settings sync | Accepted | Single codebase for Antigravity, Claude Code, Codex, Cursor, and Copilot with non-destructive upgrades |
| **005** | `18` Elastic Golden Diamond teams (`72` files) + `<= 3–4 OWNED_FILES` sharding & warm reuse | Accepted | Eliminates single-agent bottlenecks while preserving 3-round adversarial quality review |
| **006** | Two-tier `1,462`-skill vault (`22` Core + `1,440` Library) + `O(1)` `compact-index.json` | Accepted | Zero startup context bloat with millisecond on-demand access to `1,462` skills |
| **007** | `10` Orchestration Laws + 4-Layer Phase Ratchet (`ledger`, `check`) + Cross-Engine Conductor | Accepted | Prevents stubs, test gaming, spec drift across sessions, and single-model blind spots |

---

## ADR-001: Smart-Hybrid Markdown Protocols Paired with Deterministic CLI Compilers

### Context

Encoding multi-agent workflows purely as prose Markdown makes authoring easy for LLMs to follow, but leaves structural invariants—such as acyclic wave DAGs, disjoint `OWNED_FILES` locks, OKLCH design contracts, citation completeness, and anti-stub enforcement—vulnerable to probabilistic drift. Conversely, encoding every agent workflow in a rigid Python/TypeScript runtime requires external servers and breaks inside native IDE chat loops.

### Decision

**Use structured Markdown and YAML (`93` flat command files, `7` on-demand rules, `22` agents, `18` teams) as the cognitive instruction plane, paired with `14` deterministic `< 50ms` Node.js CLI subcommands (`cli/install.js` + `48` modular `cli/*.js` modules) as the compiler and verification plane.**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Pure prose Markdown with zero CLI validators | Cannot deterministically catch overlapping `OWNED_FILES`, broken plan DAGs, missing citations, or hollow `TODO` stubs |
| Heavyweight external Python/TS agent server (LangGraph/CrewAI) | Requires API keys, background servers, and separate billing outside the user's IDE subscription |
| Custom binary DSL | Adds compilation friction and opaque syntax that LLMs reason over less effectively than Markdown + YAML |

### Rationale

- LLMs natively follow Markdown/YAML workflows while deterministic Node.js compilers (`boomopen research`, `design`, `plan`, `cook`, `reconcile`, `audit`, `check`, `ledger`, `conduct`) verify structural contracts in `< 50ms`.
- Every CLI compiler, parser, installer, and Markdown budget rule is continuously verified by **`34` active `node:test` suites** in `.github/workflows/ci.yml`.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Machine-enforced gates (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `REC-G1..G4`) | Requires Node.js `>= 18.0.0` on the developer machine |
| `93` flat `commands/*.md` + `_ref/*.md` remain human-editable and Git-diffable | Prompts and CLI parsers (`cli/*.js`) must evolve in lockstep |

---

## ADR-002: Host AI Model Runtime with Proactive Sub-agent First Gate

### Context

Running full multi-phase orchestration on a 1-line typo wastes turns and tokens, whereas letting the primary agent sequentially crawl `10+` files on complex tasks pollutes the parent context window and degrades reasoning quality.

### Decision

**Use the host IDE's AI model as the zero-server runtime, governed on Turn 1 by a Proactive Sub-agent First Gate (`Mode A` vs. `Mode B`) and Zero-Latency Entrypoints (`<= 250` lines).**

- **Mode A (Tier 0 Micro-Direct)**: Strictly for `<= 2` already-known files, `1` domain, `0` exploration needed, and no `/cmd` or workflow intent.
- **Mode B (Tiers 1–3 Multi-Agent Orchestration)**: Mandatory for unscoped exploration, `> 2` files, `>= 2` domains, **17-language natural-language workflow intents**, or explicit `/cmd`. `rules/*.md` load strictly on demand in Mode B.

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Always-orchestrate every prompt (strict solo prohibition even on 1-line edits) | High latency and token tax on trivial known-file edits |
| Let the primary agent freely crawl files before deciding to delegate | Consumes parent context window before sub-agents even launch |
| Pre-load all `7` `rules/*.md` files on Turn 1 | Wastes thousands of tokens on every simple question or micro-edit |

### Rationale

- Zero-latency entrypoints keep Turn 1 lean while embedding the 5-Field Handoff Packet and 17-language intent router directly in the pre-loaded prompt.
- Immediate Turn-1 sub-agent fan-out keeps the orchestrator's context window `100%` clean for synthesis and gate verification.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Instant 1-turn execution for `<= 2` known-file micro-edits | Entrypoints must stay disciplined (`<= 250` lines enforced by `boomopen doctor`) |
| Zero solo-crawling context bloat on multi-file tasks | Relies on host IDE sub-agent primitives (TIER 1) or falls back to sequential TIER 2 embodiment |

---

## ADR-003: Zero Runtime npm Dependencies & Source-Only Git Distribution

### Context

Developer tooling installed into global AI assistant directories (`~/.claude`, `~/.gemini`, `~/.codex`, `~/.cursor`, `~/.copilot`) requires high supply-chain trust and frictionless execution across Windows, macOS, and Linux without native build steps or Git hook wrapper failures.

### Decision

**Ship `0` production npm dependencies (pure `node:*` built-ins on Node.js `>= 18.0.0`) and distribute strictly from the canonical source repository (`https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git`, `npmPublish: false`).**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Third-party CLI/filesystem packages (`commander`, `chalk`, `fs-extra`, `glob`, `yaml`) | Introduces transitive supply-chain risk and `node_modules` install overhead |
| Public npm registry auto-publishing | Source-only Git clone (`node cli/install.js install <tool>` or `npm link` -> `boomopen`) gives teams auditable commits and avoids registry drift |
| Client-side Git hook manager packages in `devDependencies` | Removed to prevent cross-platform shell/Windows path hook failures; syntax, unit, doctor, and pack checks run deterministically in `.github/workflows/ci.yml` |

### Rationale

- Node.js `>= 18.0.0` built-ins (`node:fs`, `node:path`, `node:crypto`, `node:http`, `node:child_process`, `node:test`) cover every installer, SHA-256 ledger, TOML/YAML parser, localhost Settings Web UI (`:4567`), and test runner requirement with zero external runtime code.
- `devDependencies` contain strictly `semantic-release` packages used by the guarded manual GitHub Release workflow (`.github/workflows/release.yml`, `.github/scripts/release-guard.js`).

### Trade-offs

| Benefit | Cost |
|---------|------|
| Zero runtime supply-chain attack surface | Custom lightweight YAML/TOML/arg parsers maintained in `cli/*.js` |
| Works identically on Windows PowerShell, macOS, and Linux CI matrices | Users install via `git clone` + `node cli/install.js` (or `npm link`) rather than an npm registry tarball |

---

## ADR-004: 5-Platform Unified Abstraction via Templates, SHA-256 Ledgers & AOT Settings

### Context

Developers switch between **Antigravity (Gemini)**, **Claude Code**, **OpenAI Codex**, **Cursor**, and **GitHub Copilot**—each expecting distinct global config paths, rule formats (`.mdc`, `.toml`, `.agent.md`), and tool names—while also maintaining personal instructions in `~/.claude/CLAUDE.md` or `~/.codex/config.toml`.

### Decision

**Maintain one canonical framework source with install-time `{TOOL}` path substitution, a Cross-Platform Tool Vocabulary (`rules/REFERENCE.md`), per-file SHA-256 ownership ledgers (`~/.boomopen/manifests/<tool>.json`), non-destructive marked blocks, and `< 10ms` Ahead-of-Time (AOT) settings synchronization.**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Five separate per-platform forks or duplicated folders | Guaranteed feature drift across `93` commands, `22` agents, and `1,462` skills |
| Blindly overwriting global `CLAUDE.md`, `GEMINI.md`, or `config.toml` | Destroys user-authored instructions and custom MCP/model settings |
| Runtime JSON config file read on every prompt | Adds `read_file` latency to Turn 1; AOT-injecting `<!-- BOOMOPEN-SETTINGS-START/END -->` costs `0` runtime tool calls |

### Rationale

- `InstallLedger` (`cli/manifest.js`) hashes every shared file, backs up user files to `~/.boomopen/backups/<tool>/` before replacement, and restores/preserves user edits on `boomopen uninstall`.
- `boomopen settings` (`~/.boomopen/settings.json` + `./.boomopen.json` + Web UI on `http://127.0.0.1:4567`) compiles active settings directly into all installed entrypoints in `< 10ms`.

### Trade-offs

| Benefit | Cost |
|---------|------|
| `100%` feature parity across all `5` platforms from `1` codebase | Platform installer plans (`cli/tool-config.js`, `cli/codex-config.js`) require dedicated E2E regression tests |
| Non-destructive install, upgrade, and uninstall | Settings changes run a fast local sync (`boomopen settings set/preset/sync`) to update entrypoint blocks |

---

## ADR-005: Elastic Golden Diamond Topology & 4-Tier Cognitive Load Sharding

### Context

A rigid `"3 agents per team"` topology works well for small reviews (`<= 4` files), but bottlenecks severely when a full-stack feature spans `12` files across database, API, and UI—forcing a single Executor agent to juggle too many files and lose precision.

### Decision

**Replace fixed 3-agent teams with `18` Elastic Golden Diamond teams (`72` files in `agents/teams/*-team/`, including `brainstorm-team`) and enforce the 4-Tier Cognitive Load Sharding Law (`<= 3–4` heavy `OWNED_FILES` per `role#shard`) with Scoped Warm Session Reuse (`role#shard -> conversationId` via `send_message`).**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Fixed 3-agent triangle regardless of file count | Overloads the lone Executor on `6–15` file tasks, causing truncation and omissions |
| Uncoordinated parallel swarm without contract locks | Produces conflicting API schemas and concurrent write collisions on shared files |
| Cold-spawning fresh sub-agents on every review round | Multiplies token cost and discards each shard's loaded mental model |

### Rationale

- Scaling from `1-1-1` (`<= 4` files) up to **`1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics/Testers`** keeps every shard under `<= 3–4` disjoint `OWNED_FILES` while preserving adversarial review (`max 3 debate rounds` + binding Tech Lead arbitration).
- Reusing warm `role#shard` sessions via `send_message` (`E0` auto-revive) delivers `0s` cold-start fixes during Wave 3 QA and `:team` debates.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Scales cleanly from `3`-file tasks to repo-wide audits (`maxParallelSubagents = 8` default) | Requires Wave 1 `SHARED_CONTRACT` discipline before Wave 2 shards fan out |
| Zero concurrent file overwrites (`C8-TEAMS-04` + `boomopen cook verify-wave --git`) | Higher parallel token throughput when running `:team` on large multi-domain tasks |

---

## ADR-006: Two-Tier `1,462`-Skill Vault & `O(1)` Compact-Index Resolution (`HSOL v5.5`)

### Context

Bundling `1,462` specialized skills provides deep coverage across `19` engineering domains, but placing all `1,462` folders inside an IDE's active startup skills directory bloats every system prompt and slows IDE initialization.

### Decision

**Split the skill ecosystem into `22` pre-loaded Core Skills (`skills/`) and `1,440` dormant Library Skills (`skills_library/`), unified by a pre-compiled `O(1)` lookup dictionary (`matrix-skills/compact-index.json`) queried via `skill-seeker`.**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Put all `1,462` skills in active `skills/` | Floods `<skills>` startup context with thousands of descriptions on every turn |
| Parse all `19` `matrix-skills/*.yaml` files at runtime on every task | High token and latency cost compared to an `O(1)` pre-compiled JSON index |
| Rely solely on live network discovery (`npx skills find`) | Requires network access, adds latency, and lacks curated `trust = 1.0` guarantees |

### Rationale

- `22` Core Skills cover everyday architecture, clean code, TDD, API/DB design, UI/UX, deep research, brainstorming, and routing with `0ms` lookup.
- `matrix-skills/compact-index.json` (verified and rebuilt via `boomopen doctor --rebuild-index`) maps all `1,462` skills (`22` Core + `1,440` Library) to `{ domain, priority, category, path }` for instant on-demand loading.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Zero idle token bloat for `1,440` niche library skills | Adding or moving YAML skill entries requires `boomopen doctor --rebuild-index` (enforced in CI) |
| Offline-ready `trust = 1.0` vault + optional HSOL dynamic discovery | Agents perform 1 `compact-index.json` / `skill-seeker` lookup when encountering niche frameworks |

---

## ADR-007: 10 Orchestration Laws, 4-Layer Phase Ratchet & Cross-Engine Conductor

### Context

Long-horizon multi-phase projects (`/autopilot`) and complex debugging sessions suffer from three systemic AI failure modes: (1) premature completion with `TODO` stubs or `.skip` test gaming, (2) cross-session spec drift, and (3) single-model-family blind spots when debugging subtle defects.

### Decision

**Enforce `10` Orchestration Laws (`rules/CORE.md` `v5.5`) backed by a 4-Layer Phase Quality Ratchet (`boomopen check --strict-phase --no-stubs` + SHA-256 `.boomopen/project-ledger.json`) and the Cross-Engine Conductor (`boomopen conduct` `Author != Critic` pipelines & 6-Task Multi-Engine Council).**

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Behavioral reminders alone ("please don't leave TODOs") | Models still emit placeholders under context pressure without a hard CLI exit-code gate |
| Stateless Markdown checklists across multi-session epics | Cannot detect upstream spec tampering or cumulative test count regressions |
| Retrying the same stuck model family indefinitely on Round-3 bugs | Wastes tokens repeating identical blind spots instead of escalating across model families (`E6`) |

### Rationale

- `boomopen check --strict-phase --no-stubs` deterministically blocks explicit `any`, leftover production `console.log`, line-budget violations (Soft `400` / Hard `500`), hollow stubs, and `.skip`/`.only` test gaming.
- `boomopen ledger` locks requirement traceability and SHA-256 spec hashes across `/autopilot` sessions, requiring monotonic cumulative test growth ($\text{Passed}(P_K) \ge \text{Passed}(P_{K-1}) + |\text{REQ}(P_K)|$).
- `boomopen conduct` enables parallel multi-engine consensus (`COUNCIL-SYNTHESIS.md`) and `Author != Critic` verification across `Claude`, `Codex`, and `Antigravity`.

### Trade-offs

| Benefit | Cost |
|---------|------|
| Eliminates silent omissions, stubbed phases, and cross-session spec drift | Strict gates require genuine end-to-end fixes before a wave or phase can close |
| Breaks single-model reasoning deadlocks via Cross-Engine Escalation (`E6`) | Live multi-engine dispatch requires corresponding CLI tools authenticated on `PATH` (otherwise uses queue fallback) |

---

## Evidence Sources

| Source | Path | What It Provides |
|--------|------|------------------|
| `package.json` | [../../package.json](../../package.json) | `5.5.0` metadata, `0` production deps, `34` `node:test` suites, `semantic-release` dev tooling |
| `cli/install.js` | [../../cli/install.js](../../cli/install.js) | `14` CLI subcommands, `InstallLedger`, `{TOOL}` transforms, `< 10ms` AOT settings sync |
| `cli/checker.js` | [../../cli/checker.js](../../cli/checker.js) | Pragmatic 2-Tier Coding Standards & `--strict-phase --no-stubs` enforcement |
| `cli/ledger.js` | [../../cli/ledger.js](../../cli/ledger.js) | `.boomopen/project-ledger.json` SHA-256 spec-hash ratchet & cumulative test gate |
| `cli/conductor.js` | [../../cli/conductor.js](../../cli/conductor.js) | `Author != Critic` cross-engine dispatch & 6-Task Multi-Engine Council |
| `rules/CORE.md` | [../../rules/CORE.md](../../rules/CORE.md) | Proactive Sub-agent First Gate, 4-Tier Elastic Swarm, Laws `L1–L10` |
| `rules/TEAMS.md` | [../../rules/TEAMS.md](../../rules/TEAMS.md) | `18` Elastic Golden Diamond teams (`72` files) and `C8-TEAMS-01..04` |
| `rules/SKILLS.md` | [../../rules/SKILLS.md](../../rules/SKILLS.md) | Two-tier `1,462`-skill vault (`22` Core + `1,440` Library) & `compact-index.json` |
| `rules/ERRORS.md` | [../../rules/ERRORS.md](../../rules/ERRORS.md) | `E0–E6` recovery protocols and `A1–A14` anti-patterns |
