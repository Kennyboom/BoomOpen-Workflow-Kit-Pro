---
description: "💼 Business Docs — Generate 4 `./documents/business/business-*/` folders via collision-free parallel sharding (`<= 3–4 OWNED_FILES`/shard) and `BG/BR/BF/BW` traceability"
version: "5.5"
category: documentation
execution-mode: execute
---

# /docs:business — Business & Product Documentation (`v5.5`)

> **MISSION**: Generate or update **all 4 business documentation folders** (`22+` files in `./documents/business/business-*/`), each with `00-index.md` + numbered sub-files, backed by codebase evidence, canonical domain terminology, and end-to-end `BG` → `BR` → `BF` → `BW` traceability using **collision-free parallel `docs-manager#biz-*` shards (`<= 3–4 OWNED_FILES` per shard)**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & MANDATORY REFERENCES

1. **Same-Turn Reference Load + Recon Dispatch**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — read these binding specs AND spawn Phase 1 `scouter#biz-1..k` shards **in the same Turn-1 parallel batch** via `invoke_subagent(TypeName: "self", Model: "inherit")`:
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-recon-protocol.md` — Mode detection (`CREATE`/`UPDATE`/`MIGRATE`) and evidence ledger rules (reuse existing `SCOUT-docs-core-*.md` if Step 1 of `/docs` already ran!).
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-folder-specs.md` — Collision-free sharding rules, sub-file quality gates, and Mermaid rules.
   - *(When `:team` or `execution.mode = team` is active, also follow `~/.{TOOL}/skills/boomopen-workflow-kit/agents/teams/docs-team/_team.md`.)*
2. **Workspace `./documents/business/` vs. Transient Brain Artifacts (`ArtifactMetadata`)**:
   - **Workspace Business Docs (`./documents/business/business-*/`)**: Written in the **same language as the user's input** (technical terms, code identifiers, and IDs in English). Omit `ArtifactMetadata` on workspace files.
   - **Transient Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`)**: Keep `./documents/` clean of intermediate packs and audit logs:
     - `SCOUT-docs-business-{1..k}.md` & `SCOUT-docs-business-pack.md`: `ArtifactMetadata: { Summary: "Business recon & BG/BR/BF/BW contract pack", UserFacing: false, RequestFeedback: false }`
     - `MAILBOX-{date}.md` (`:team` mode): `ArtifactMetadata: { Summary: "Docs team coordination mailbox", UserFacing: false, RequestFeedback: false }`
     - `REVIEW-docs-business.md`: `ArtifactMetadata: { Summary: "Business docs traceability & consistency audit", UserFacing: true, RequestFeedback: false }`
3. **Zero Source Mutation Guardrail**: All application source, config, and test files are strictly `READ_ONLY_FILES`.

---

## 📁 DELIVERABLES — 4 Business Folders (`22+` Files Minimum)

> [!CAUTION]
> **MUST CREATE OR UPDATE ALL 4 FOLDERS** with `00-index.md` + sub-files. Incomplete = FAILED execution.

```
./documents/business/
  business-prd/          # 00-index + 01-executive-summary + 02-problem-goals-and-scope + 03-stakeholders-and-requirements + 04-acceptance-risks-assumptions (5 files)
  business-features/     # 00-index + 01-feature-inventory + 02-prioritization-moscow + 03-feature-specifications + 04-dependencies-and-release-sequencing + 05-success-metrics (6 files)
  business-workflows/    # 00-index + 01-actor-map + 02-workflow-catalog + 03-detailed-workflows + 04-decision-rules-and-exceptions + 05-sla-and-handoffs (6 files)
  business-glossary/     # 00-index + 01-canonical-terms + 02-synonyms-and-deprecated-terms + 03-domain-entities-and-events + 04-api-term-mapping (5 files)
```

### Mandatory `00-index.md` Template
```markdown
# {Business Area}

> **Purpose**: {one-line purpose} | **Sub-files**: {count} | **Last Updated**: {YYYY-MM-DD}

## Quick Summary
{2–3 evidence-backed paragraphs}

## Sub-Files
| File | Description |
|------|-------------|
| [01-...](./01-...md) | {summary} |

## Key Facts
| Metric / Key | Value |
|--------------|-------|
| {key} | {verified value} |

## Cross-References
- [business-glossary](../business-glossary/00-index.md)
- [knowledge-overview](../../knowledge-overview/00-index.md)
- [knowledge-domain](../../knowledge-domain/00-index.md)

## Known Gaps and Open Questions
- {explicit unknowns — NEVER guess}
```

---

## 🎭 Phase 1: PARALLEL BUSINESS RECONNAISSANCE (`Turn 1`)

| Attribute | Value |
|-----------|-------|
| **Shards** | `scouter#biz-1..k` via `invoke_subagent(TypeName: "self", Model: "inherit")` (`<= 3–4` modules/shard; reuse `SCOUT-docs-core-*.md` if present) |
| **Goal** | Extract live actors/roles, UI/API feature surfaces, state-machine workflows, and domain terms with `>= 2` verified evidence files per area |
| **Output** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-business-{1..k}.md` (`UserFacing: false, RequestFeedback: false`) |

```markdown
## Business Intelligence Report
| Business Area | Mode | Evidence Files (`>= 2`) | Confidence |
|---------------|------|-------------------------|------------|
| `business-prd/` | CREATE/UPDATE/MIGRATE | `{paths}` | High/Medium/Low |
| `business-features/` | CREATE/UPDATE/MIGRATE | `{paths}` | High/Medium/Low |
| `business-workflows/` | CREATE/UPDATE/MIGRATE | `{paths}` | High/Medium/Low |
| `business-glossary/` | CREATE/UPDATE/MIGRATE | `{paths}` | High/Medium/Low |
```
*Anti-Shallow Guardrail*: Never synthesize from `README.md` alone; verify routes, auth roles, schemas, and UI flows via `read_file`. Isolate unverified product assumptions under `Known Gaps and Open Questions`.

---

## 🎭 Phase 2: CANONICAL `SHARED_CONTRACT` & TRACEABILITY LOCK

| Attribute | Value |
|-----------|-------|
| **Agent** | `business-analyst` via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Skill** | `~/.{TOOL}/skills_library/business-analyst/SKILL.md` |
| **Goal** | Lock canonical `BG-*` / `BR-*` / `BF-*` / `BW-*` IDs, INVEST acceptance criteria, MoSCoW priorities, and glossary definitions before parallel writing |
| **Output** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-business-pack.md` (`UserFacing: false, RequestFeedback: false`) |

```markdown
## Structured Business Contract (`SHARED_CONTRACT` for All Phase 3 Shards)
| Goal ID | Req ID (INVEST) | Feature ID (MoSCoW) | Workflow ID | Canonical Terms | KPI / Metric |
|---------|-----------------|---------------------|-------------|-----------------|--------------|
| `BG-001` | `BR-001` | `BF-001` (Must) | `BW-001` | `{canonical terms}` | `{measurable KPI}` |
```

---

## 🎭 Phase 3: COLLISION-FREE PARALLEL FOLDER SHARDING (`<= 3–4 OWNED_FILES` / Shard)

> **ANTI-COLLISION LAW**: Dispatch parallel `docs-manager#biz-*` sub-agents (`TypeName: "self"`, `Model: "inherit"`) using Phase 2's `SCOUT-docs-business-pack.md` as the locked `SHARED_CONTRACT`. Every shard owns **at most `4` disjoint files** in `./documents/business/` and treats all source files + sibling business folders as `READ_ONLY_FILES`.

### Wave 3A — Parallel Business Sub-File Shards (`6` Disjoint Shards, `2–4` Files Each)

| Shard Key (`role#shard`) | Disjoint `OWNED_FILES` (`<= 4` Files) | Scope & Contract Enforcement |
|:-------------------------|:--------------------------------------|:-----------------------------|
| `docs-manager#biz-prd` | `documents/business/business-prd/01-executive-summary.md` .. `04-acceptance-risks-assumptions.md` (`4` files) | `BG-*` goals, `BR-*` INVEST requirements, scope & risks |
| `docs-manager#biz-feat-1` | `documents/business/business-features/01-feature-inventory.md` .. `03-feature-specifications.md` (`3` files) | `BF-*` inventory, MoSCoW rationale, testable specs |
| `docs-manager#biz-feat-2` | `documents/business/business-features/04-dependencies-and-release-sequencing.md`, `05-success-metrics.md` (`2` files) | Dependency Mermaid `flowchart TD/LR` (quoted labels) & KPIs |
| `docs-manager#biz-flow-1` | `documents/business/business-workflows/01-actor-map.md` .. `03-detailed-workflows.md` (`3` files) | Actor matrix, `BW-*` catalog, quoted Mermaid `sequenceDiagram`/`flowchart` |
| `docs-manager#biz-flow-2` | `documents/business/business-workflows/04-decision-rules-and-exceptions.md`, `05-sla-and-handoffs.md` (`2` files) | Validation/edge-case rules & handoff boundaries |
| `docs-manager#biz-glossary` | `documents/business/business-glossary/01-canonical-terms.md` .. `04-api-term-mapping.md` (`4` files) | Canonical definitions, deprecated aliases, entity/API mapping |

### Wave 3B — Index Finalization Shard (`4` Files)
Once Wave 3A finishes, `docs-manager#biz-indexes` (or warm reuse via `send_message`) writes the 4 `00-index.md` files (`business-prd/00-index.md`, `business-features/00-index.md`, `business-workflows/00-index.md`, `business-glossary/00-index.md`) so every TOC link and cross-reference resolves 100%.

---

## 🎭 Phase 4: CONSISTENCY & TRACEABILITY AUDIT (`DOC-G1..G4`)

| Attribute | Value |
|-----------|-------|
| **Agent** | `project-manager` (or `docs-team-reviewer` in `:team` mode) via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Goal** | Verify cross-folder `BG/BR/BF/BW` ID integrity, glossary consistency, evidence paths, links, and Mermaid syntax |
| **Output** | `<appDataDir>\brain\<conversation-id>\REVIEW-docs-business.md` (`ArtifactMetadata: { Summary: "Business docs consistency & traceability audit", UserFacing: true, RequestFeedback: false }`) |

```markdown
## Business Docs Consistency Matrix
| Check | `business-prd` | `business-features` | `business-workflows` | `business-glossary` | Status |
|-------|----------------|---------------------|----------------------|---------------------|--------|
| Scope & priorities aligned | Yes/No | Yes/No | Yes/No | Yes/No | Pass/Fail |
| Canonical terms uniform | Yes/No | Yes/No | Yes/No | Yes/No | Pass/Fail |
| `BG/BR/BF/BW` IDs traceable | Yes/No | Yes/No | Yes/No | Yes/No | Pass/Fail |
| `## Evidence Sources` valid | Yes/No | Yes/No | Yes/No | Yes/No | Pass/Fail |
| Links & Mermaid valid (`0` `TODO`s) | Yes/No | Yes/No | Yes/No | Yes/No | Pass/Fail |
```
Route any failed check back to the owning warm `docs-manager#biz-*` `conversationId` via `send_message` (max 3 rounds) before marking complete.

---

## ✅ COMPLETION OUTPUT

1. **Complete**: All 4 folders (`22+` files) verified in `./documents/business/` + `REVIEW-docs-business.md` passed (`DOC-G1..G4`).
2. **Next**: Proceed to `/docs:audit` (when running full `/docs` suite) or await user instruction.
