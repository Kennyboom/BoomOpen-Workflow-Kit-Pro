# Smart Skill Orchestration Mechanism (`HSOL v5.5`) — Technical Blueprint

> **Product & Version**: `BoomOpen Workflow Kit v5.5.0` (`@boomopen/workflow-kit` `5.5.0` — Multi-Platform Unified & Smart-Hybrid Edition / `HSOL v5.5`)
> **Author**: AI System Architecture Team
> **Last Updated**: 2026-11-10
> **Status**: Production-Verified Architecture (`1,462` Indexed Skills = `22` Core + `1,440` Library)
> **Canonical Repository**: `https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro`

---

## Executive Summary

This blueprint defines the **Hybrid Skill Orchestration Layer (`HSOL v5.5`)** in `BoomOpen Workflow Kit v5.5.0`, solving both the **Scalability Paradox** and the **Context-Window Bloat Paradox** in multi-agent AI engineering:

1. **Zero-Bloat 2-Tier Local Skill Vault (`1,462` Unique Skills)**:
   - **Tier 1 — `22` Pre-Loaded Core Skills (`skills/`, installed to `{SKILLS_PATH}/`)** (+ root [`SKILL.md`](../SKILL.md)): Always visible in the agent's `<skills>` system prompt (`0ms` lookup).
   - **Tier 2 — `1,440` Dormant On-Demand Library Skills (`skills_library/`, installed to `{LIBRARY_PATH}/`)**: Specialized domain skills (such as [`skills_library/ab-test-setup/SKILL.md`](../skills_library/ab-test-setup/SKILL.md), `better-auth-typescript`, `tailwind-v4-shadcn-ui`, `owasp-llm-agent-security-2025`) remain dormant on disk (`0` idle prompt tokens) until needed.
2. **2-Step `O(1)` Progressive Skill Resolution via `compact-index.json` & `skill-seeker`**:
   - Step 1 checks `<skills>` (`22` Core Skills).
   - Step 2 queries [`matrix-skills/compact-index.json`](../matrix-skills/compact-index.json) — deterministically compiled by `boomopen doctor --rebuild-index` ([`cli/doctor-index.js`](../cli/doctor-index.js)) from `1,476` domain entries (`14` multi-domain) across `19` `matrix-skills/*.yaml` files — via [`skills/skill-seeker/SKILL.md`](../skills/skill-seeker/SKILL.md) and loads at most `1–3` exact `SKILL.md` files per task or Mode B sub-agent shard.
3. **Conditional External Ecosystem Discovery (`npx skills find` / `npx skills add`)**:
   - Triggered only on `:hard` and `:team` workflow variants when best local fitness `< 0.8`, tracking community-installed skills with SHA-256 checksums, trust progression, and governance states in [`matrix-skills/_dynamic.yaml`](../matrix-skills/_dynamic.yaml).
4. **Deterministic CLI Verification & Warm Auto-Repair**:
   - Paired with `12` zero-dependency `boomopen` CLI subcommands ([`cli/install.js`](../cli/install.js)) that enforce artifact gates (`research`, `design`, `plan`, `cook`, `check --strict-phase --no-stubs`, `ledger`, `conduct`, `doctor`) and route diagnostics back to warm `role#shard` sub-agents.

**Key Runtime Specifications**: [`rules/SKILLS.md`](../rules/SKILLS.md) · [`skills/skill-seeker/SKILL.md`](../skills/skill-seeker/SKILL.md) · [`matrix-skills/_index.yaml`](../matrix-skills/_index.yaml) · [`matrix-skills/_dynamic.yaml`](../matrix-skills/_dynamic.yaml) · [`HSOL-ASSESSMENT.md`](./HSOL-ASSESSMENT.md) · External catalog: https://skills.sh/

---

## Table of Contents

1. [Problem Analysis](#1-problem-analysis)
2. [First-Principles Architecture](#2-first-principles-architecture)
3. [Hybrid Synergy Model (`HSOL v5.5`)](#3-hybrid-synergy-model-hsol-v55)
4. [Intelligent Decision Logic](#4-intelligent-decision-logic)
5. [Autonomous Evolution Framework](#5-autonomous-evolution-framework)
6. [Consistency & Versioning Strategy](#6-consistency--versioning-strategy)
7. [Production-Grade Edge Cases](#7-production-grade-edge-cases)
8. [Implementation Architecture (`v5.5.0`)](#8-implementation-architecture-v550)
9. [System Integration](#9-system-integration)

---

## Prerequisites & 5-Platform Path Mapping

`BoomOpen Workflow Kit v5.5.0` uses a **source-only repository distribution model** (`npmPublish: false` in `.releaserc.json`). When installed for a target AI coding platform, the CLI provisions `{SKILLS_PATH}` (`22` Core Skills including `skill-seeker`), `{LIBRARY_PATH}` (`1,440` on-demand Library Skills), and `{FRAMEWORK_PATH}` (`matrix-skills/compact-index.json`, `rules/`, `commands/`, `agents/`, `cli/`):

| Platform (`<tool>`) | Global Entrypoints | `{SKILLS_PATH}` (`22` Core) | `{LIBRARY_PATH}` (`1,440` Library) | `{FRAMEWORK_PATH}` |
|---------------------|--------------------|-----------------------------|------------------------------------|--------------------|
| **`antigravity`** (Gemini) | `~/.gemini/GEMINI.md`, `~/.gemini/agents/AntigravityGlobal.agent.md` | `~/.gemini/config/skills/` | `~/.gemini/config/skills_library/` | `~/.gemini/config/skills/boomopen-workflow-kit/` |
| **`claude`** (Claude Code) | `~/.claude/CLAUDE.md`, `~/.claude/AGENT.md` | `~/.claude/skills/` | `~/.claude/skills_library/` | `~/.claude/skills/boomopen-workflow-kit/` |
| **`codex`** (OpenAI Codex) | `~/.codex/CODEX.md`, `~/.codex/AGENTS.md`, `~/.codex/AGENT.md` | `~/.codex/skills/` (+ `79` `boomopen-workflow-kit-*` cmd skills) | `~/.codex/skills_library/` | `~/.codex/skills/boomopen-workflow-kit/` |
| **`cursor`** (Cursor IDE) | `~/.cursor/CURSOR.md`, `~/.cursor/AGENT.md`, `~/.cursor/rules/boomopen-workflow-kit.mdc` | `~/.cursor/skills/` | `~/.cursor/skills_library/` | `~/.cursor/skills/boomopen-workflow-kit/` |
| **`copilot`** (GitHub Copilot) | `~/.copilot/COPILOT.md`, `~/.copilot/AGENT.md`, `<VSCodeUser>/prompts/boomopen-workflow-kit.agent.md` | `~/.copilot/skills/` | `~/.copilot/skills_library/` | `~/.copilot/skills/boomopen-workflow-kit/` |

> **Path Shorthand Convention**: Throughout this blueprint, `{TOOL_BASE}` denotes `~/.gemini/config` on Antigravity and `~/.{claude|codex|cursor|copilot}` on the other `4` platforms, so `{SKILLS_PATH}` = `{TOOL_BASE}/skills/`, `{LIBRARY_PATH}` = `{TOOL_BASE}/skills_library/`, and `{FRAMEWORK_PATH}` = `{TOOL_BASE}/skills/boomopen-workflow-kit/`. All install/verify operations target **only the active platform** unless `--all` is explicitly requested.

**Installation (from source checkout, scoped to the current tool):**

```bash
# 1. Clone the canonical repository and install for your active AI platform
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
node cli/install.js install <cursor|copilot|antigravity|claude|codex> [--with-hooks]

# Optional: link the `boomopen` CLI binary globally from your local checkout
npm link
boomopen list

# Optional external community skill installation (current environment only, skip prompt)
npx skills add <owner/repo@skill> -g -y
```

**Verification (read-only health audit & compact-index check):**

```bash
# Verify kit source, installed platform layout, compact-index.json (1,462 skills), and settings
node cli/install.js doctor --platform <cursor|copilot|antigravity|claude|codex>

# Rebuild matrix-skills/compact-index.json after editing any matrix-skills/*.yaml file
node cli/install.js doctor --rebuild-index

# Confirm skill-seeker and compact-index.json in the active platform path
ls "{SKILLS_PATH}/skill-seeker/SKILL.md"
ls "{FRAMEWORK_PATH}/matrix-skills/compact-index.json"
```

---

## 1. Problem Analysis

### 1.1 Dual-Layer State Assessment

**Local Curated Layer (`{FRAMEWORK_PATH}/matrix-skills/compact-index.json` + `skills/` + `skills_library/`):**

```
Architecture (v5.5.0):
├── 22 Pre-Loaded Core Skills in {SKILLS_PATH}/ (0ms <skills> visibility)
├── 1,440 Dormant Library Skills in {LIBRARY_PATH}/ (0 idle context tokens)
├── 19 Domain YAML Registries ({FRAMEWORK_PATH}/matrix-skills/*.yaml, 1,476 entries)
├── Pre-Compiled O(1) Index (compact-index.json, 1,462 unique skills, < 5ms lookup)
└── 21 Specialist Agent Inheritance Profiles in matrix-skills/_index.yaml

Strengths:
├── Sub-5ms O(1) resolution without crawling 19 YAML files
├── Zero context-window bloat (loads <= 1-3 matched SKILL.md files per shard)
├── 100% offline-capable & deterministic (verified by `boomopen doctor`)
├── SHA-256 manifest-protected installation (~/.boomopen/manifests/<tool>.json)
└── Direct Handoff Packet skill pointer injection for parallel sub-agents

Residual Limits Without Dynamic Layer:
├── Cutting-edge vendor SDKs released after the latest kit checkout may not exist locally
├── Niche proprietary/internal team workflows require extensible skill registration
└── Static priority scores alone do not capture project-specific runtime telemetry
```

**Dynamic External Discovery Layer (`npx skills` CLI + `_dynamic.yaml`):**

```
Local Resolver:  {SKILLS_PATH}/skill-seeker/SKILL.md (Step 1-2 local O(1) lookup)
External Browse: https://skills.sh/ (Step 3 conditional external fallback)

External CLI Commands:
├── npx skills find [query]              → Search community skill ecosystem
├── npx skills add <owner/repo@skill> -g -y → Install globally for current environment
├── npx skills check                     → Check installed dynamic skills for updates
└── npx skills update                    → Update installed dynamic skills

Strengths:
├── Unbounded ecosystem coverage for newly released SDKs/APIs
├── Real-time community discovery when local fitness < 0.8 on :hard / :team
├── Domain experts publish specialized skills directly
└── Versioned & checksum-tracked in {FRAMEWORK_PATH}/matrix-skills/_dynamic.yaml

Risks Managed by HSOL Governance:
├── Network latency (100-500ms per external query; skipped on :fast)
├── Offline availability risk (graceful fallback to 1,462 local skills)
├── Quality variance (graduated trust 0.3 -> 0.5 -> 0.7 -> 1.0)
└── Supply-chain surface (low-trust confirmation gate + SHA-256 checksums)

When External Discovery Triggers:
├── Task complexity is Complex AND workflow variant is :hard or :team
├── Local 2-Step lookup (<skills> + compact-index.json) yields fitness < 0.8
└── Or user explicitly requests searching/installing an external community skill
```

### 1.2 Core Tensions Identified

| Tension | Curated Vault Priority | Dynamic Ecosystem Priority | `HSOL v5.5` Resolution Principle |
|---------|------------------------|----------------------------|----------------------------------|
| **Speed vs Coverage** | `< 5ms` `O(1)` `compact-index.json` | Unbounded community catalog | 2-Step local-first + `:hard`/`:team` fallback |
| **Token Budget vs Depth** | `22` Core Skills in `<skills>` | `1,440` Library + external skills | Dormant `skills_library/` + `1–3` `SKILL.md` cap |
| **Reliability vs Freshness** | `1,462` doctor-audited skills | Newly released SDK skills | Graduated trust scoring (`0.3 -> 1.0`) |
| **Security vs Openness** | SHA-256 manifest-verified | Third-party Markdown specs | Confirmation gate + `_dynamic.yaml` governance |

### 1.3 The Scalability & Context Paradox — Root Cause

```
┌─────────────────────────────────────────────────────────────────┐
│              THE SCALABILITY & CONTEXT PARADOX                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [More Domain Skills Added] ───────────────────────────────┐   │
│          │                                                   │   │
│          ▼                                                   │   │
│   [Naively Pre-Loading All Skills Bloats System Prompt]      │   │
│          │                                                   │   │
│          ▼                                                   │   │
│   [Sequential YAML Crawling Burns Turn-1 Latency] ───┐      │   │
│          │                                            │      │   │
│          ▼                                            ▼      │   │
│   [Skills Drift or Get Skipped] ◄─────── [Context Fatigue]  │   │
│          │                                                   │   │
│          ▼                                                   │   │
│   [Capability Gaps Appear] ──────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

HSOL v5.5 SOLUTION:
  1. Physical 2-Tier Split: 22 Core (`skills/`) vs 1,440 Dormant (`skills_library/`)
  2. O(1) Pre-Compiled Map: `matrix-skills/compact-index.json` (`boomopen doctor --rebuild-index`)
  3. Conditional Dynamic Loop: `npx skills find` + `_dynamic.yaml` trust/promotion lifecycle
```

---

## 2. First-Principles Architecture

### 2.1 Design Axioms

**Axiom 1: Skill Resolution is an `O(1)` Index + Ranked Selection Problem**
> Every complex engineering request maps to `1–3` high-signal domain capabilities. Pre-compiling `19` domain YAML matrices into `compact-index.json` eliminates sequential YAML parsing while preserving rich domain inheritance.

**Axiom 2: Idle Context Budget & Turn-1 Latency Are Sacred**
> Pre-loading `1,462` skills into `<skills>` would waste tens of thousands of tokens on every turn. Only `22` universal Core Skills live in `<skills>`; the `1,440` Library Skills consume `0` tokens until `skill-seeker` loads the exact `1–3` matched `SKILL.md` files in `< 5ms`.

**Axiom 3: Trust is Earned, Not Assumed**
> Bundled Core and Library skills carry `trust = 1.0` (`boomopen doctor` audited). Dynamically installed external skills start at `trust = 0.3` and earn promotion through verified executions.

**Axiom 4: Deterministic CLI Gates Close the Verification Loop**
> Skill guidance must translate into verified artifacts. `boomopen` CLI validators (`research`, `design`, `plan`, `cook`, `check --strict-phase --no-stubs`) enforce contract compliance after skill-guided execution.

### 2.2 Architectural Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    USER REQUEST / MULTILINGUAL INTENT                        │
│              (17 Supported Languages + 32 Base Slash Commands)               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: SEMANTIC INTENT & COMPLEXITY CLASSIFIER                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                           │
│  • Route Simple tasks directly (`Simple -> Skipping` skill lookup)           │
│  • Route Complex tasks into Mode B (`commands/{cmd}-{variant}.md`)           │
│  • Extract target domains, specialist `role#shard`, and capability keywords  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               │               ▼
┌──────────────────────────┐       │       ┌──────────────────────────┐
│  LAYER 2A: FAST 2-STEP   │       │       │  LAYER 2B: EXTERNAL      │
│  LOCAL LOOKUP (SYNC)     │       │       │  DISCOVERY (:hard/:team) │
│  ━━━━━━━━━━━━━━━━━━━━━━  │       │       │  ━━━━━━━━━━━━━━━━━━━━━━  │
│  • Step 1: <skills> (22) │       │       │  • `npx skills find`     │
│  • Step 2: compact-index │       │       │  • https://skills.sh/    │
│    (1,462 O(1) map)      │       │       │  • `_dynamic.yaml` check │
│  • Load 1-3 SKILL.md     │       │       │  • LATENCY: 100-500ms    │
│  • LATENCY: < 5ms        │       │       │    (skipped on :fast)    │
└──────────────────────────┘       │       └──────────────────────────┘
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: SKILL FITNESS EVALUATOR                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                           │
│  • Multi-factor scoring (semantic 0.35, specificity 0.25, trust 0.20,        │
│    freshness 0.10, success_rate 0.10)                                        │
│  • Gap detection (`fitness < 0.75`) & superiority detection (`delta >= 0.15`)│
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: ORCHESTRATION DECISION & HANDOFF PACKET COMPILER                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│  ┌─────────────────┬────────────────┬───────────────────────────────────┐   │
│  │ Local Fitness   │ Dynamic Score  │ Action                            │   │
│  ├─────────────────┼────────────────┼───────────────────────────────────┤   │
│  │ HIGH (≥0.8)     │ Skipped / Any  │ Inject Core/Library SKILL.md      │   │
│  │ MEDIUM (0.75-0.8)│ HIGH (≥0.9)    │ Execute local + suggest dynamic   │   │
│  │ MEDIUM (0.75-0.8)│ < 0.9          │ Execute local skill               │   │
│  │ LOW (<0.75)     │ HIGH (≥0.8)    │ Confirm & install dynamic (block) │   │
│  │ LOW (<0.75)     │ LOW (<0.8)     │ Execute best local + report gap   │   │
│  │ NONE            │ HIGH (≥0.7)    │ Confirm, install & execute        │   │
│  │ NONE            │ NONE           │ Fallback to base capabilities     │   │
│  └─────────────────┴────────────────┴───────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 5: SHARD EXECUTION, CLI GATES & TELEMETRY FEEDBACK                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│  • Inject exact `SKILL.md` pointers into 5-Field Shard Handoff Packets       │
│  • Validate via `boomopen <research|design|plan|cook|check>` CLI gates       │
│  • Update `_dynamic.yaml` execution counts, trust level, and promotion state │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Hybrid Synergy Model (`HSOL v5.5`)

### 3.1 Synergy Principles

**Principle 1: 2-Step Local-First (`<skills>` -> `compact-index.json`), Dynamic-Enhanced**
> Local Core (`22`) and Library (`1,440`) skills resolve synchronously in `< 5ms` via [`skills/skill-seeker/SKILL.md`](../skills/skill-seeker/SKILL.md) and [`matrix-skills/compact-index.json`](../matrix-skills/compact-index.json). External discovery runs only when local coverage is below optimal (`< 0.8`).

**Principle 2: Blocking vs Async External Discovery**
> - **Blocking (`fitness < 0.75` on `:hard` / `:team`)**: Await external search -> confirm if low-trust task-critical -> install -> inject `SKILL.md` -> execute, ensuring the **current** task receives specialized guidance.
> - **Async (`0.75 <= fitness < 0.8` on `:hard` / `:team`)**: Execute immediately with the matched local Core/Library skill; if external discovery finds a skill with superiority delta `>= 0.15`, surface a non-blocking recommendation for future sessions.

**Principle 2b: Variant-Aware Discovery Gate (`fast` vs `hard` / `team`)**
> External CLI discovery (`npx skills find`) runs **only** when: (1) the resolved workflow variant is **`hard`** or **`team`** (`fast` always skips network discovery to stay instant), and (2) best local matrix fitness is **`< 0.8`**.

**Principle 3: Graduated Trust & Handoff Pointer Discipline**
> Orchestrators resolve skill paths once during planning/dispatch and pass `1–3` exact `SKILL.md` paths in each sub-agent shard's **5-Field Handoff Packet** (`READ_ONLY_FILES` / Skill Pointers), preventing parallel shards from repeating searches.

### 3.2 Execution Flow Example

```
USER REQUEST (/cook:hard): "Implement OAuth + Passkeys with Clerk"
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ SEMANTIC INTENT CLASSIFIER & SKILL-SEEKER                      │
│                                                                │
│ Extracted:                                                     │
│   • Domain: backend + security                                 │
│   • Specificity: HIGH (Clerk-specific provider)                │
│   • Variant: hard (external discovery eligible if < 0.8)       │
│   • Keywords: ["clerk", "oauth", "passkeys", "authentication"] │
└───────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────────────────────┐
        │                                      │
        ▼ (SYNC, <5ms via compact-index.json)  ▼ (ASYNC on :hard/:team)
┌─────────────────────────┐         ┌─────────────────────────┐
│ 2-STEP LOCAL LOOKUP     │         │ EXTERNAL DISCOVERY      │
│                         │         │                         │
│ Step 1 (<skills>):      │         │ Query: `npx skills find │
│ • api-patterns (0.60)   │         │   "clerk oauth"`        │
│ • security-auditor(0.62)│         │                         │
│ Step 2 (compact-index): │         │ [Searching skills.sh]   │
│ • better-auth-typescript│         │                         │
│   @ 0.76 (Library)      │         │                         │
└─────────────────────────┘         └─────────────────────────┘
        │                                      │
        │                                      │ (200-500ms later)
        │                                      ▼
        │                           ┌─────────────────────────┐
        │                           │ DISCOVERY RESULT        │
        │                           │                         │
        │                           │ Found: clerk-auth       │
        │                           │ Score: 0.94 (delta+0.18)│
        │                           │ Source: vercel-labs     │
        └─────────────────────────┘
        │                                      │
        ▼                                      ▼
┌───────────────────────────────────────────────────────────────┐
│ SKILL FITNESS EVALUATOR & ORCHESTRATION DECISION               │
│                                                                │
│ Local best: skills_library/better-auth-typescript @ 0.76       │
│ External best: clerk-auth @ 0.94 (Clerk-specific, +0.18 >=0.15)│
│                                                                │
│ SELECTED (0.75 <= 0.76 < 0.80 -> ASYNC ENHANCEMENT):           │
│   1. Inject `skills_library/better-auth-typescript/SKILL.md`   │
│      into `backend-engineer#auth` Handoff Packet immediately   │
│   2. Surface non-blocking recommendation:                      │
│      `npx skills add vercel-labs/skills@clerk-auth -g -y`      │
└───────────────────────────────────────────────────────────────┘
```

### 3.3 Cognitive Load Management

**Problem**: Specialist sub-agents (`role#shard`) must focus cognitive budget on `<= 3–4 OWNED_FILES` rather than crawling `1,440` skill folders.

**Solution**: `HSOL v5.5` + `skill-seeker` centralizes lookup into `O(1)` index resolution:

```yaml
subagent_shard_perspective:
  without_HSOL:
    - "Glob 1,440 folders in skills_library/ looking for matching skills"
    - "Parse 19 matrix-skills/*.yaml files sequentially"
    - "Wonder whether to search external registries mid-coding"

  with_HSOL_v5_5:
    - "Read the 1-3 exact SKILL.md paths pre-injected in 5-Field Handoff Packet"
    - "Execute OWNED_FILES (<= 3-4 files) and pass `boomopen check --strict-phase --no-stubs`"
```

---

## 4. Intelligent Decision Logic

### 4.1 Skill Fitness Scoring

**Multi-Factor Fitness Model (`rules/SKILLS.md` & `matrix-skills/_index.yaml`):**

```
SKILL_FITNESS = (
    0.35 × SEMANTIC_MATCH +
    0.25 × SPECIFICITY_SCORE +
    0.20 × TRUST_LEVEL +
    0.10 × FRESHNESS_SCORE +
    0.10 × SUCCESS_RATE
)
```

**Factor Definitions:**

| Factor | Weight | Curated Vault (`skills/` & `skills_library/`) | Dynamic Skill (`_dynamic.yaml` / External) |
|--------|--------|-----------------------------------------------|--------------------------------------------|
| **SEMANTIC_MATCH** | `0.35` | Keyword + `19`-domain inheritance alignment | Registry relevance & keyword match |
| **SPECIFICITY_SCORE** | `0.25` | Category (`core`/`expert`/`specialized`/`utility`) & priority (`1–10`) | Provider/framework specificity alignment |
| **TRUST_LEVEL** | `0.20` | `1.0` (curated & `boomopen doctor` verified) | `0.3` (`new`) -> `0.5` (`3` runs) -> `0.7` (`10` runs) -> `1.0` (`promoted`) |
| **FRESHNESS_SCORE** | `0.10` | Kit release currency (`v5.5.0`) | `freshness.last_verified` (`stale_after_days: 90`) |
| **SUCCESS_RATE** | `0.10` | Baseline validated (`1.0`) | `success_count / execution_count` |

### 4.2 Self-Correction Heuristics

**Heuristic 1: Capability Gap Detection**

```python
def detect_capability_gap(request, compact_index, dynamic_manifest):
    """
    Detect when local Core (22) + Library (1,440) + installed dynamic skills
    cannot adequately serve a Complex request.
    """
    best_match = find_best_local_skill(request, compact_index, dynamic_manifest)

    if best_match is None:
        return GapType.COMPLETE_GAP

    if best_match.specificity < 0.4 and request.specificity > 0.7:
        return GapType.SPECIFICITY_GAP

    if best_match.days_since_verified > 90 and request.domain in FAST_EVOLVING_DOMAINS:
        return GapType.FRESHNESS_GAP

    if best_match.success_rate is not None and best_match.success_rate < 0.6:
        return GapType.QUALITY_GAP

    return GapType.NO_GAP
```

**Heuristic 2: Superiority Detection**

```python
def detect_superior_dynamic_skill(local_skill, dynamic_skill, request):
    """
    Determine whether an external dynamic skill meaningfully outperforms
    the best local Core/Library match (`superiority_delta = 0.15`).
    """
    SUPERIORITY_THRESHOLD = 0.15

    local_fitness = calculate_fitness(local_skill, request)
    dynamic_fitness = calculate_fitness(dynamic_skill, request)

    if (dynamic_fitness - local_fitness) >= SUPERIORITY_THRESHOLD:
        return SuperiorityResult(
            is_superior=True,
            reason="HIGHER_FITNESS",
            recommendation="Install specialized external skill for higher precision",
        )

    if dynamic_skill.specificity > 0.8 and local_skill.specificity < 0.5:
        return SuperiorityResult(
            is_superior=True,
            reason="DOMAIN_SPECIFIC",
            recommendation="Vendor-specific skill available",
        )

    return SuperiorityResult(is_superior=False)
```

**Heuristic 3: Automatic Matrix Promotion (`_index.yaml` & `_dynamic.yaml`)**

```python
def evaluate_skill_for_promotion(dynamic_skill):
    """
    Determine if a validated dynamic skill in `_dynamic.yaml` qualifies for
    automatic promotion (`automatic: true` in matrix-skills/_index.yaml).
    """
    PROMOTION_CRITERIA = {
        "min_executions": 10,
        "min_success_rate": 0.85,
        "max_inactive_days": 30,
    }

    if (
        dynamic_skill.support_state == "supported"
        and dynamic_skill.execution_count >= PROMOTION_CRITERIA["min_executions"]
        and dynamic_skill.success_rate >= PROMOTION_CRITERIA["min_success_rate"]
        and dynamic_skill.inactive_days <= PROMOTION_CRITERIA["max_inactive_days"]
    ):
        return PromotionAction(
            skill=dynamic_skill,
            action="PROMOTE_TO_MATRIX_AND_REBUILD_COMPACT_INDEX",
            target_domain=dynamic_skill.domains[0],
            rebuild_cmd="boomopen doctor --rebuild-index",
        )

    return None
```

### 4.3 Decision Tree

```
                        ┌─────────────────────────┐
                        │ Complex Task Arrives    │
                        │ (Mode B / Variant Set)  │
                        └────────────┬────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │ 2-Step Local O(1) Lookup       │
                    │ 1. <skills> (22 Core Skills)   │
                    │ 2. compact-index.json (1,462)  │
                    └────────────────┬───────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
         ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
         │ FITNESS     │      │ FITNESS     │      │ FITNESS     │
         │ >= 0.8      │      │ 0.75 - 0.8  │      │ < 0.75      │
         │ (HIGH)      │      │ (ADEQUATE)  │      │ (GAP)       │
         └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
                │                    │                    │
                ▼                    ▼                    ▼
    ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
    │ Load 1-3 SKILL.md │  │ Load Local Skill  │  │ If :hard / :team: │
    │ from skills/ or   │  │ + Async External  │  │ Blocking External │
    │ skills_library/   │  │ Check (:hard/team)│  │ Search (`npx`)    │
    └───────────────────┘  └─────────┬─────────┘  └─────────┬─────────┘
                                     │                      │
                           ┌─────────┴─────────┐            ▼
                           ▼                   ▼  ┌───────────────────┐
                    ┌─────────────┐     ┌────────┐│ Confirm Low-Trust │
                    │ Delta>=0.15 │     │ < 0.15 ││ -> Install `-g -y`│
                    │ Suggest Cmd │     │ Silent ││ -> Register & Run │
                    └─────────────┘     └────────┘└───────────────────┘
```

---

## 5. Autonomous Evolution Framework

### 5.1 Feedback Loop Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS EVOLUTION LOOP                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ SHARD        │ ──▶ │ CLI GATE &   │ ──▶ │ FITNESS &    │ ──▶ │ MATRIX &     │
│ EXECUTION    │     │ TELEMETRY    │     │ GOVERNANCE   │     │ INDEX SYNC   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       ▲                                                              │
       └──────────────────────────────────────────────────────────────┘
                    `boomopen doctor --rebuild-index`

1. SHARD EXECUTION: Specialist agent (`role#shard`) executes using injected `SKILL.md`.
2. CLI GATE & TELEMETRY: Deterministic validators (`boomopen check`, `plan`, `design`,
   `research`, `cook`) record pass/fail outcomes and execution counts in `_dynamic.yaml`.
3. FITNESS & GOVERNANCE: Evaluates trust progression (`0.3 -> 0.5 -> 0.7 -> 1.0`),
   90-day freshness decay, and `supported | experimental | blocked` status.
4. MATRIX & INDEX SYNC: Promoted skills append to `{FRAMEWORK_PATH}/matrix-skills/{domain}.yaml`
   and regenerate `{FRAMEWORK_PATH}/matrix-skills/compact-index.json`.
```

### 5.2 Skill Lifecycle States (`_index.yaml` & `_dynamic.yaml`)

```
                    ┌──────────────────────┐
                    │       NEW (0.3)      │
                    │  (`_dynamic.yaml`)   │
                    └──────────┬───────────┘
                               │ 3 successful executions
                               ▼
                    ┌──────────────────────┐
                    │   EVALUATING (0.5)   │
                    │  (Probation Window)  │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         10 runs, >=85%   >90d inactive   Validation/Security
                │              │              Failure
                ▼              ▼              ▼
       ┌────────────────┐ ┌──────────┐ ┌────────────────┐
       │ VALIDATED (0.7)│ │  STALE   │ │    BLOCKED     │
       └────────┬───────┘ └──────────┘ │(rejected_skills│
                │                      └────────────────┘
      Auto-promotion criteria met
      (>=10 runs, >=85%, <=30d inactive)
                │
                ▼
       ┌────────────────┐
       │ PROMOTED (1.0) │
       │(`compact-index`)│
       └────────────────┘
```

### 5.3 Tiered Skill Placement Model

```yaml
skill_placement_tiers:

  tier_1_core_active:
    location: "{SKILLS_PATH}/{skill-id}/SKILL.md"
    repo_source: "skills/{skill-id}/SKILL.md"
    count_in_v5_5_0: 22
    visibility: "Always pre-listed in <skills> system context (0ms)"
    examples:
      - "skill-seeker"
      - "intelligent-routing"
      - "clean-code"
      - "plan-writing"
      - "design-spec"
      - "deep-research"

  tier_2_library_dormant:
    location: "{LIBRARY_PATH}/{skill-id}/SKILL.md"
    repo_source: "skills_library/{skill-id}/SKILL.md"
    count_in_v5_5_0: 1440
    visibility: "0 idle tokens; O(1) lookup via matrix-skills/compact-index.json"
    examples:
      - "ab-test-setup"
      - "better-auth-typescript"
      - "tailwind-v4-shadcn-ui"
      - "owasp-llm-agent-security-2025"

  tier_3_dynamic_user_global:
    location: "{SKILLS_PATH}/{skill-id}/SKILL.md"
    registry: "{FRAMEWORK_PATH}/matrix-skills/_dynamic.yaml"
    command: "npx skills add <owner/repo@skill> -g -y"
    visibility: "Tracked with SHA-256 checksum, owner, support_state, and trust_level"

  tier_4_matrix_promoted:
    location: "{FRAMEWORK_PATH}/matrix-skills/{domain}.yaml + compact-index.json"
    rebuild_command: "node {FRAMEWORK_PATH}/cli/install.js doctor --rebuild-index"
    effect: |
      1. Appends validated entry to {domain}.yaml when min_executions >= 10 and success_rate >= 0.85
      2. Recompiles compact-index.json in < 50ms
      3. Immediately discoverable by skill-seeker on the next request without restarting the IDE/CLI
```

### 5.4 Environment Synchronization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│             DYNAMIC SKILL REGISTRATION & INDEX SYNC             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AGENT OR USER RUNS `npx skills add <owner/repo@skill> -g -y`   │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. DOWNLOAD & VALIDATE                                   │   │
│  │    • Fetch SKILL.md and verify YAML frontmatter          │   │
│  │    • Compute SHA-256 checksum & check `rejected_skills`  │   │
│  │    • Detect ID collisions against `compact-index.json`   │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. INSTALL TO ACTIVE PLATFORM                            │   │
│  │    • Write `{SKILLS_PATH}/{skill-id}/SKILL.md`           │   │
│  │    • Preserve user-created files outside kit manifest    │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3. REGISTER IN `_dynamic.yaml`                           │   │
│  │    • `{FRAMEWORK_PATH}/matrix-skills/_dynamic.yaml`      │   │
│  │    • Record owner, checksum, support_state, freshness    │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. AVAILABLE IMMEDIATELY FOR CURRENT & NEXT SHARDS       │   │
│  │    • Inject SKILL.md path directly into Handoff Packet   │   │
│  │    • Zero session restart required                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Consistency & Versioning Strategy

### 6.1 Conflict Detection

| Conflict Type | Description | Resolution Strategy |
|---------------|-------------|---------------------|
| **ID Collision** | Dynamic skill shares `skill_id` with one of the `1,462` curated skills | Curated skill keeps canonical ID; prefix dynamic skill with `ext-` |
| **Multi-Domain Entry** | Curated skill appears in `2+` domain YAML files (`14` skills in `v5.5.0`) | `cli/doctor-index.js` deduplicates into `1` `compact-index.json` entry with `"domains": [...]` |
| **Domain Overlap** | Dynamic skill claims same capability as a curated Core/Library skill | Curated skill wins unless dynamic fitness exceeds local by `>= 0.15` |
| **Quarantined Skill** | Skill appears in `rejected_skills` with `block_reinstall: true` | Block installation and alert user |

### 6.2 Versioning & Lock Model

```yaml
# Kit & Compact Index Version (Synchronized via cli/doctor-version.js)
kit_index_version:
  package_name: "@boomopen/workflow-kit"
  version: "5.5.0"
  compact_index_path: "matrix-skills/compact-index.json"
  total_unique_skills: 1462     # 22 Core (skills/) + 1,440 Library (skills_library/)
  total_domain_entries: 1476    # Across 19 domain *.yaml files (14 multi-domain)

# Dynamic External Skill Reference Format
dynamic_skill_reference:
  format: "{source}/{owner}/{repo}@{skill}#{version}"
  example: "github/vercel-labs/skills@clerk-auth#v2.4.0"

# Project-Level Reproducibility Lock (Optional)
locked_skills:
  kit_version: "5.5.0"
  dynamic_skills:
    - id: "clerk-auth"
      source: "github/vercel-labs/skills@clerk-auth"
      version: "v2.4.0"
      installed_at: "2026-11-10T00:00:00Z"
      checksum: "sha256:9f86d081884c7d659a2feaa0c55ad015..."
```

### 6.3 Conflict Resolution Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│                  CONFLICT RESOLUTION PROTOCOL                   │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1: DETECT CONFLICT                                        │
│    • Check `skill_id` against `compact-index.json` (1,462 IDs)  │
│    • Check `rejected_skills` in `matrix-skills/_dynamic.yaml`   │
│                                                                  │
│  STEP 2: APPLY PRECEDENCE                                       │
│    • Rule 1: Curated `skills/` & `skills_library/` retain IDs   │
│    • Rule 2: Colliding external skills receive `ext-` prefix    │
│    • Rule 3: Higher fitness (`delta >= 0.15`) wins capability   │
│    • Rule 4: Explicit user instruction overrides automatic rank │
│                                                                  │
│  STEP 3: VERIFY INDEX INTEGRITY                                 │
│    • Run `boomopen doctor` to confirm 0 missing skill paths,    │
│      valid YAML indentation, and clean `compact-index.json`     │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Unified Skill Index Data Structures

```json
{
  "version": "5.5.0",
  "totalSkills": 1462,
  "skills": {
    "skill-seeker": {
      "domain": "tools",
      "priority": 9,
      "category": "core",
      "path": "skills/skill-seeker/SKILL.md"
    },
    "ab-test-setup": {
      "domain": "planning",
      "priority": 7,
      "category": "specialized",
      "path": "skills_library/ab-test-setup/SKILL.md"
    },
    "better-auth-typescript": {
      "domain": "backend",
      "priority": 9,
      "category": "expert",
      "path": "skills_library/better-auth-typescript/SKILL.md",
      "domains": ["backend", "security"]
    }
  }
}
```

---

## 7. Production-Grade Edge Cases

### 7.1 Network, Offline & Vendored Reference Handling

```yaml
edge_case_resolutions:

  scenario_1_external_discovery_timeout_or_offline:
    trigger: "External `npx skills find` exceeds 5,000ms timeout or network/CLI is unavailable"
    impact: "Cannot query remote https://skills.sh/ registry"
    resolution:
      immediate: "Proceed immediately with the 1,462 offline skills in compact-index.json"
      notification: "Surface concise note only when fitness < 0.75 capability gap remains"

  scenario_2_vendored_library_upstream_paths:
    trigger: "A skill in `skills_library/<id>/SKILL.md` references `.claude/skills/<id>/...` or unvendored `references/`"
    impact: "Naive path lookup would fail on non-Claude platforms or missing optional files"
    resolution:
      path_rewrite: "Resolve relative to `{LIBRARY_PATH}/<id>/...` per `rules/SKILLS.md`"
      missing_asset_rule: "If optional `references/`, `scripts/`, or `assets/` were not vendored, state so and follow `SKILL.md` without inventing file contents"

  scenario_3_partial_dynamic_install_failure:
    trigger: "External skill download or schema validation fails mid-install"
    resolution:
      rollback: "Remove incomplete directory under `{SKILLS_PATH}/` and do not register in `_dynamic.yaml`"
      fallback: "Continue execution with best local Core/Library match"

  scenario_4_cli_gate_validation_failure:
    trigger: "`boomopen <research|design|plan|cook|check>` exits non-zero after shard execution"
    resolution:
      auto_repair: "Route exact CLI diagnostic to warm `role#shard` (`send_message` by `conversationId`) under `rules/ERRORS.md` (`E5`/`E2`) and re-verify until exit `0`"
```

### 7.2 Deterministic Index & Platform Integrity (`boomopen doctor`)

Instead of fragile background file-watcher daemons, `BoomOpen Workflow Kit v5.5.0` uses deterministic on-demand index compilation and SHA-256 manifest verification:

1. **Zero-Daemon Instant Availability**: `skill-seeker` reads `matrix-skills/compact-index.json` and `matrix-skills/_dynamic.yaml` directly on disk (`< 5ms`), so newly added skills require zero background daemons or IDE restarts.
2. **Deterministic Rebuild (`boomopen doctor --rebuild-index`)**: Parses all `19` `matrix-skills/*.yaml` files via [`cli/doctor-index.js`](../cli/doctor-index.js), validates YAML sequence indentation, checks that all `1,462` `skills/` and `skills_library/` paths exist, and writes `matrix-skills/compact-index.json`.
3. **Non-Destructive Uninstall & Upgrade (`~/.boomopen/manifests/<tool>.json`)**: Only kit-owned unchanged files are updated or removed; user-installed dynamic skills in `{SKILLS_PATH}/` are never deleted by `boomopen uninstall`.

### 7.3 Security Model

```yaml
security_model:

  threat_1_malicious_prompt_instructions:
    vector: "Untrusted community skill embeds unsafe shell or destructive SQL guidance"
    mitigation:
      - "Low-trust (`0.3`) task-critical external installs require explicit user confirmation"
      - "Claude/Antigravity opt-in `PreToolUse` hook (`--with-hooks` -> `validate-tool-call.mjs`)"
      - "Strict `OWNED_FILES` & SHA-256 `READ_ONLY_FILES` enforcement (`boomopen cook verify-wave` & `boomopen conduct`)"

  threat_2_supply_chain_tampering:
    vector: "External skill mutates unexpectedly upstream"
    mitigation:
      - "SHA-256 `checksum` and `owner` recorded in `matrix-skills/_dynamic.yaml`"
      - "`support_state: blocked` and `rejected_skills` prevent re-installation"

  threat_3_hollow_stubs_or_test_gaming:
    vector: "Agent leaves `TODO`/`FIXME` placeholders or `.skip`/`.only` tests"
    mitigation:
      - "`boomopen check --strict-phase --no-stubs` rejects hollow implementations and test gaming"
```

---

## 8. Implementation Architecture (`v5.5.0`)

### 8.1 Shipped Subsystem Inventory

| Subsystem | Shipped Implementation in `BoomOpen-Workflow-Kit-Pro` (`v5.5.0`) | Verification Gate |
|-----------|------------------------------------------------------------------|-------------------|
| **Core & Library Vault** | `22` Core Skills (`skills/`) + `1,440` Library Skills (`skills_library/`) = **`1,462` unique skills** | `boomopen doctor --source-only` |
| **Compact Skill Index** | [`matrix-skills/compact-index.json`](../matrix-skills/compact-index.json) + `19` domain `*.yaml` (`1,476` entries) + [`_index.yaml`](../matrix-skills/_index.yaml) + [`_dynamic.yaml`](../matrix-skills/_dynamic.yaml) | `cli/doctor-index.js` (`--rebuild-index`) |
| **Runtime Skill Rules** | [`rules/SKILLS.md`](../rules/SKILLS.md) (`<= 300` lines) + [`skills/skill-seeker/SKILL.md`](../skills/skill-seeker/SKILL.md) | `cli/doctor-markdown.js` |
| **Specialist Agents & Teams** | **`21` specialist agents** (`agents/*.md`) + **`18` Elastic Golden Diamond teams** (`agents/teams/*-team/` = `54` role files + `18` `_team.md` = `72` files) | `boomopen doctor` |
| **Slash Commands** | **`32` base slash commands** across **`84` command files** (`79` flat `commands/*.md` + `5` `commands/_ref/*.md`) | `boomopen doctor` |
| **Deterministic CLI (`12` cmds)** | [`cli/install.js`](../cli/install.js) + `39` modular `cli/*.js` files (`install`, `uninstall`, `list`, `settings`, `doctor`, `check`, `research`, `design`, `plan`, `cook`, `ledger`, `conduct`) | `30` `node:test` suites (`npm test`) + GitHub Actions CI |

### 8.2 Verified Production Metrics (`v5.5.0`)

```yaml
verified_production_metrics:
  indexed_skills: 1462            # 22 pre-loaded Core + 1,440 dormant Library skills
  domain_yaml_registries: 19      # 1,476 total domain mappings (14 multi-domain)
  local_lookup_latency: "< 5ms"   # O(1) JSON lookup in matrix-skills/compact-index.json
  idle_library_token_overhead: 0  # Dormant skills_library/ never injected until matched
  per_shard_skill_injection: "1-3 SKILL.md files max"
  automated_test_suites: 30       # 29 cli/*.test.js + web/build/kit-stats.test.mjs
  cross_os_ci_matrix: "Ubuntu, Windows, macOS x Node 18, 20, 22"
```

---

## 9. System Integration

### 9.1 Integration Across Kit Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                HSOL v5.5 INTEGRATION ACROSS BOOMOPEN v5.5.0                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  6 ROOT ENTRYPOINTS (`<= 250` lines each)                                    │
│  ════════════════════════════════════════                                    │
│  `GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md` │
│  • Route 17 languages & 32 slash commands into Mode B without Turn-1 crawl   │
│  • Point Mode B skill resolution on demand to `rules/SKILLS.md`              │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  `rules/SKILLS.md` & `skills/skill-seeker/SKILL.md`                          │
│  ══════════════════════════════════════════════════                          │
│  • Enforce 2-Step O(1) Lookup: `<skills>` (22) -> `compact-index.json`       │
│    (1,462) -> read `1-3` matched `SKILL.md` files from `skills_library/`     │
│  • Inject resolved `SKILL.md` paths into 5-Field Shard Handoff Packets       │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  21 SPECIALIST AGENTS (`agents/*.md`) & 18 ELASTIC TEAMS (`72` files)        │
│  ════════════════════════════════════════════════════════════════════        │
│  • Every specialist profile in `matrix-skills/_index.yaml` maps domain       │
│    inheritance (`backend`, `frontend`, `security`, `ai-ml`, `mcp`, etc.)     │
│  • Elastic Golden Diamond scales from `1-1-1` (`<= 4` files) up to           │
│    `1 Tech Lead + 1..6 Parallel Shard Executors + 1..3 Parallel Critics`     │
│    (`<= 3-4 OWNED_FILES` per shard)                                          │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  12 `boomopen` CLI SUBCOMMANDS (`cli/install.js`)                            │
│  ════════════════════════════════════════════════                            │
│  • `install` / `uninstall` / `list` / `settings` (`--ui` port `4567`)        │
│  • `doctor [--rebuild-index]` — compiles & audits `compact-index.json`       │
│  • `research` / `design` / `plan` / `cook` / `check` / `ledger` / `conduct`  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Canonical Repository Layout (`BoomOpen-Workflow-Kit-Pro`)

```
BoomOpen-Workflow-Kit-Pro/
├── GEMINI.md, CLAUDE.md, CODEX.md, COPILOT.md, CURSOR.md, AGENT.md, SKILL.md
├── platforms/
│   └── {antigravity,claude,codex,copilot,cursor}/   # 5 unified platform bundles
├── rules/
│   └── {CORE,PHASES,AGENTS,TEAMS,SKILLS,ERRORS,REFERENCE}.md  # 7 rules (<=300L)
├── commands/
│   ├── {cmd}.md & {cmd}-{variant}.md                # 79 flat command specs
│   └── _ref/*.md                                    # 5 shared protocol refs (84 total)
├── agents/
│   ├── *.md                                         # 21 specialist agents (<=450L)
│   └── teams/*-team/                                # 18 teams (54 roles + 18 _team.md = 72)
├── skills/
│   ├── skill-seeker/SKILL.md                        # Core 2-Step O(1) resolver
│   └── ...                                          # 22 pre-loaded Core Skills
├── skills_library/
│   ├── ab-test-setup/SKILL.md                       # Dormant on-demand Library Skills
│   └── ...                                          # 1,440 Library Skills total
├── matrix-skills/
│   ├── compact-index.json                           # Pre-compiled O(1) index (1,462 skills)
│   ├── _index.yaml                                  # 19 domains + 21 agent profiles + HSOL
│   ├── _dynamic.yaml                                # Dynamic external skill manifest
│   └── {domain}.yaml                                # 19 domain YAML registries
├── cli/
│   ├── install.js                                   # `boomopen` CLI entry (12 subcommands)
│   ├── doctor.js & doctor-index.js                  # Health audit & compact-index builder
│   └── *.js / *.test.js                             # 39 CLI modules + 29 CLI test suites
├── scripts/                                         # 7 Python verification/session helpers
└── documents/
    ├── HSOL-ASSESSMENT.md
    └── SMART-SKILL-ORCHESTRATION-BLUEPRINT.md       # This blueprint
```

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **`HSOL v5.5`** | Hybrid Skill Orchestration Layer combining `22` Core Skills, `1,440` Library Skills (`compact-index.json`), and conditional external discovery |
| **Core Skills (`22`)** | Universal skills in `{SKILLS_PATH}/` (`skills/`) pre-loaded into `<skills>` at turn start |
| **Library Skills (`1,440`)** | Specialized skills in `{LIBRARY_PATH}/` (`skills_library/`) kept dormant until loaded on demand via `skill-seeker` |
| **`compact-index.json`** | Pre-compiled `O(1)` JSON lookup map (`1,462` unique skills) built by `boomopen doctor --rebuild-index` |
| **`skill-seeker`** | Core skill (`skills/skill-seeker/SKILL.md`) executing the mandatory 2-Step `O(1)` lookup protocol |
| **Dynamic Skills** | External community skills discovered via `npx skills find`, installed with `npx skills add <pkg> -g -y`, and tracked in `matrix-skills/_dynamic.yaml` |
| **Skill Fitness** | Weighted score (`0.35` semantic + `0.25` specificity + `0.20` trust + `0.10` freshness + `0.10` success) |

---

## Appendix B: Decision Matrix Quick Reference

```
┌──────────────────────────────────────────────────────────────────────┐
│               HSOL v5.5 SKILL SELECTION QUICK REFERENCE              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TASK / VARIANT     │ LOCAL FITNESS │ EXTERNAL   │ ACTION            │
│  ───────────────────┼───────────────┼────────────┼─────────────────  │
│  Simple             │      N/A      │  Skipped   │ Base knowledge    │
│  Any `:fast`        │      Any      │  Skipped   │ Execute local     │
│  `:hard` / `:team`  │    >= 0.80    │  Skipped   │ Execute local     │
│  `:hard` / `:team`  │  0.75 - 0.80  │ Delta>=0.15│ Local + suggest   │
│  `:hard` / `:team`  │  0.75 - 0.80  │ Delta<0.15 │ Execute local     │
│  `:hard` / `:team`  │    < 0.75     │  >= 0.80   │ Confirm & install │
│  `:hard` / `:team`  │    < 0.75     │  < 0.80    │ Local + gap note  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Appendix C: Canonical Schema Templates

### C.1 `matrix-skills/_dynamic.yaml` Entry Schema

```yaml
# Dynamic Skill Manifest ({FRAMEWORK_PATH}/matrix-skills/_dynamic.yaml)
# Auto-managed by HSOL v5.5 when orchestrator runs `npx skills add <skill> -g -y`

schema_version: 1
last_updated: "2026-11-10T00:00:00Z"

skills:
  - skill_id: "clerk-auth"
    source: "github/vercel-labs/skills@clerk-auth"
    version: "v2.4.0"
    installed_at: "2026-11-10T00:00:00Z"
    installed_by: "system"
    owner: "identity-platform"
    checksum: "sha256:9f86d081884c7d659a2feaa0c55ad015..."
    support_state: "experimental"
    promotion_state: "new"
    freshness:
      last_verified: "2026-11-10T00:00:00Z"
      stale_after_days: 90
    domains: ["backend", "security"]
    keywords: ["clerk", "authentication", "oauth", "passkeys"]
    trust_level: 0.3
    execution_count: 0
    success_count: 0
    failure_count: 0
    last_execution: null
```

### C.2 Skill Execution Telemetry Schema

```yaml
telemetry_entry:
  timestamp: "2026-11-10T00:00:00Z"
  skill_id: "better-auth-typescript"
  source: "skills_library"   # "skills" | "skills_library" | "dynamic"
  agent_shard: "backend-engineer#auth"
  request_hash: "sha256:xyz..."
  lookup_latency_ms: 3
  cli_gate_passed: true
  gap_detected: false
  dynamic_alternative_suggested: "github/vercel-labs/skills@clerk-auth"
```

---

**Document End**

*This blueprint documents the production `HSOL v5.5` architecture in `BoomOpen Workflow Kit v5.5.0` (`@boomopen/workflow-kit`).*
