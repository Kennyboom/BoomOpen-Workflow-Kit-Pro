---
description: "🏗️ Core Docs — Generate 5 `./documents/knowledge-*/` folders via collision-free parallel sharding (`<= 3–4 OWNED_FILES`/shard) and source-grounded evidence"
version: "5.5"
category: documentation
execution-mode: execute
---

# /docs:core — Core Technical Documentation (`v5.5`)

> **MISSION**: Analyze the repository through parallel codebase reconnaissance, then generate or update **all 5 core knowledge folders** (`26+` files in `./documents/knowledge-*/`) using **collision-free parallel `docs-manager#<shard>` writers (`<= 3–4 OWNED_FILES` per shard)**. Every command, route, env var, schema field, and file reference MUST trace to live source code (`DOC-G1..G4`).

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & MANDATORY REFERENCES

1. **Same-Turn Reference Load + Sub-Agent Fan-Out**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** burn Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` alone — read these two binding reference specs AND spawn Phase 1 `scouter#docs-1..k` shards **in the same Turn-1 parallel tool batch** via `invoke_subagent(TypeName: "self", Model: "inherit")`:
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-recon-protocol.md` — Mode detection (`CREATE`/`UPDATE`/`MIGRATE`), cross-platform scan steps, and Intelligence Report + Evidence Ledger template.
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-folder-specs.md` — Per-folder sub-file specs, collision-free sharding rules, Mermaid constraints, and quality gates.
   - *(When `:team` or `execution.mode = team` is active, also follow `~/.{TOOL}/skills/boomopen-workflow-kit/agents/teams/docs-team/_team.md`.)*
2. **Workspace `./documents/` vs. Transient Brain Artifacts (`ArtifactMetadata`)**:
   - **Workspace Knowledge Base (`./documents/knowledge-*/`)**: Permanent version-controlled project docs written in the **user's input language** (technical terms, identifiers, paths, and code snippets in English). Omit `ArtifactMetadata` on workspace files.
   - **Transient Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`)**: Keep `./documents/` clean of scratch files:
     - `SCOUT-docs-core-{1..k}.md`: `ArtifactMetadata: { Summary: "Core docs codebase recon shard {k}", UserFacing: false, RequestFeedback: false }`
     - `MAILBOX-{date}.md` (`:team` mode): `ArtifactMetadata: { Summary: "Docs team shard coordination log", UserFacing: false, RequestFeedback: false }`
     - `REVIEW-docs-core.md`: `ArtifactMetadata: { Summary: "Core technical docs zero-drift audit report", UserFacing: true, RequestFeedback: false }`
3. **Zero Source Mutation Guardrail**: All application source, test, and config files are strictly `READ_ONLY_FILES`.

---

## 📁 DELIVERABLES — 5 Knowledge Folders (`26+` Files)

> [!IMPORTANT]
> **ALL 5 FOLDERS MUST BE CREATED OR UPDATED.** Partial output = FAILED execution.

```
./documents/
  knowledge-source-base/    # WHERE things are       (00-index.md + 01..04 = 5 files)
  knowledge-overview/       # WHAT and WHY           (00-index.md + 01..04 = 5 files)
  knowledge-architecture/   # HOW things connect     (00-index.md + 01..05 = 6 files)
  knowledge-domain/         # WHAT flows through     (00-index.md + 01..04 = 5 files)
  knowledge-standards/      # HOW TO CODE correctly  (00-index.md + 01..04 = 5 files)
```

### Mandatory `00-index.md` & Sub-File Scaling Rules
- Every `00-index.md` MUST include: (1) 2–3 paragraph summary, (2) Sub-files TOC table matching actual files on disk, (3) Quick facts table, (4) Valid relative cross-references (`../knowledge-*/00-index.md`), and (5) `Known Gaps and Open Questions`.
- Sub-file sizing per `_ref/docs-folder-specs.md`: split cohesive sub-files exceeding `~300` lines into numbered sub-files (`05-*.md`, `06-*.md`) and assign disjoint `OWNED_FILES` (`<= 3–4` files/shard); merge thin stubs `< 20` lines into the nearest related sub-file.

---

## 🎭 Phase 1: PARALLEL DEEP CODEBASE RECONNAISSANCE (`Turn 1`)

| Attribute | Value |
|-----------|-------|
| **Shards** | `scouter#docs-1..k` via `invoke_subagent(TypeName: "self", Model: "inherit")` (`<= 3–4` heavy modules/shard) |
| **Goal** | Detect `CREATE`/`UPDATE`/`MIGRATE` mode per folder, map live stack/routes/schemas/scripts, and build the Evidence Ledger |
| **Output** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-core-{1..k}.md` (`UserFacing: false, RequestFeedback: false`) |
| **Reference** | `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-recon-protocol.md` |

**Exit Criteria**:
- [ ] `CREATE` / `UPDATE` / `MIGRATE` mode determined for all 5 `knowledge-*/` folders
- [ ] Tech stack, entry points, architecture layers, domain entities, API contracts, and lint/test standards verified via `read_file`
- [ ] Evidence Ledger populated (`>= 3` verified repository files per knowledge area; unknowns isolated to `Known Gaps`)
- [ ] Canonical glossary + cross-folder relative link map locked as `SHARED_CONTRACT` for Phase 2 shards

---

## 🎭 Phase 2: COLLISION-FREE PARALLEL FOLDER SHARDING (`<= 3–4 OWNED_FILES` / Shard)

> **ANTI-COLLISION LAW**: Never assign `26+` files to a single `docs-manager` and never allow two shards to share an `OWNED_FILES` target! Dispatch parallel `docs-manager#<shard>` sub-agents (`TypeName: "self"`, `Model: "inherit"`) with disjoint `OWNED_FILES` (`<= 4` files per shard) and lock all repo source + sibling `./documents/**` paths in `READ_ONLY_FILES`.

### Wave 2A — Parallel Sub-File Writer Shards (`6` Disjoint Shards, `2–4` Files Each)

| Shard Key (`role#shard`) | Disjoint `OWNED_FILES` (`<= 4` Files) | Focus & Required Skills |
|:-------------------------|:--------------------------------------|:------------------------|
| `docs-manager#source-base` | `documents/knowledge-source-base/01-directory-structure.md` .. `04-configuration.md` (`4` files) | Annotated tree, boot sequence, modules, env/config |
| `docs-manager#overview` | `documents/knowledge-overview/01-project-identity.md` .. `04-getting-started.md` (`4` files) | Onboarding, stack versions, verified install/run commands |
| `docs-manager#arch-1` | `documents/knowledge-architecture/01-system-overview.md` .. `03-data-flow.md` (`3` files) | Layer boundaries, components, quoted Mermaid `flowchart`/`sequenceDiagram` |
| `docs-manager#arch-2` | `documents/knowledge-architecture/04-design-patterns.md`, `05-decisions.md` (`2` files) | Code-backed design patterns & ADR trade-off table |
| `docs-manager#domain` | `documents/knowledge-domain/01-entities.md` .. `04-business-rules.md` (`4` files) | Load `skills/api-patterns/SKILL.md` & `skills/database-design/SKILL.md` |
| `docs-manager#standards` | `documents/knowledge-standards/01-code-style.md` .. `04-testing-standards.md` (`4` files) | Lint/format rules, import conventions, Git/CI, test commands |

### Wave 2B — Disjoint `00-index.md` Synthesis Shards (`2` Shards, `2–3` Files Each)
Once Wave 2A completes (so every sub-file filename and heading exists on disk), finalize the 5 index files via warm session reuse (`send_message`) or 2 disjoint index shards:
- **`docs-manager#index-1` (`3` files)**: `knowledge-source-base/00-index.md`, `knowledge-overview/00-index.md`, `knowledge-architecture/00-index.md`
- **`docs-manager#index-2` (`2` files)**: `knowledge-domain/00-index.md`, `knowledge-standards/00-index.md`

### Mandatory Thinking Protocol (Before Writing Each Sub-File)
1. **Audience**: Can a new engineer or AI agent understand this subsystem from this file alone?
2. **Provenance**: Does every symbol, CLI script, and path trace to Phase 1's Evidence Ledger (`## Evidence Sources` table)?
3. **Mermaid Safety**: Are only supported Mermaid types (`flowchart TD/LR`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, `xychart-beta`) used with quoted labels (`id["Label (Detail)"]`)?

---

## 🎭 Phase 3: ZERO-DRIFT QUALITY & LINK AUDIT (`DOC-G1..G4`)

| Attribute | Value |
|-----------|-------|
| **Agent** | `reviewer` (or `docs-team-reviewer` in `:team` mode) via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Goal** | Cross-check all `26+` files against live codebase symbols, TOC links, Mermaid syntax, and language rules |
| **Output** | `<appDataDir>\brain\<conversation-id>\REVIEW-docs-core.md` (`ArtifactMetadata: { Summary: "Core docs zero-drift verification", UserFacing: true, RequestFeedback: false }`) |

If any broken relative link, phantom flag/path, unquoted Mermaid label, or `TODO` placeholder is detected, route targeted fixes back to the owning warm `docs-manager#<shard>` `conversationId` via `send_message` (max 3 rounds) until `DOC-G1..G4` pass 100%.

**Exit Criteria**:
- [ ] All 5 `knowledge-*/` folders created/updated (`26+` files) in user's input language (technical terms in English)
- [ ] Every `00-index.md` TOC matches actual sub-files and all cross-folder links resolve
- [ ] Every sub-file includes `## Evidence Sources` with real repository file paths (`0` placeholders)
- [ ] `REVIEW-docs-core.md` confirms `DOC-G1..G4` PASS

---

## ✅ COMPLETION OUTPUT

```markdown
## 🏗️ Docs-Core Complete (`v5.5`)

| # | Folder | Files | Mode | Shard Owner | Status |
|---|--------|-------|------|-------------|--------|
| 1 | `documents/knowledge-source-base/` | `00-index` + `{N}` | CREATE/UPDATE | `docs-manager#source-base` | ✅ Verified |
| 2 | `documents/knowledge-overview/` | `00-index` + `{N}` | CREATE/UPDATE | `docs-manager#overview` | ✅ Verified |
| 3 | `documents/knowledge-architecture/` | `00-index` + `{N}` | CREATE/UPDATE | `docs-manager#arch-1..2` | ✅ Verified |
| 4 | `documents/knowledge-domain/` | `00-index` + `{N}` | CREATE/UPDATE | `docs-manager#domain` | ✅ Verified |
| 5 | `documents/knowledge-standards/` | `00-index` + `{N}` | CREATE/UPDATE | `docs-manager#standards` | ✅ Verified |

- **Total Workspace Docs**: `{count}` files in `./documents/knowledge-*/`
- **Zero-Drift Audit**: `<appDataDir>\brain\<conversation-id>\REVIEW-docs-core.md`
- **Next** → `/docs:business` (when running full `/docs` suite) or await user instruction
```
