---
description: "📝 Knowledge Folder Specs, Collision-Free Sharding & Quality Gates — Referenced by `/docs`, `/docs:core`, `/docs:business`, `/docs:audit`, and `docs-team`"
version: "5.5"
type: reference
---

# Workspace Documentation Specifications & Collision-Free Sharding (`v5.5`)

## 1. Core Knowledge Folder Content Requirements (`./documents/knowledge-*/`)

### FOLDER 1: `knowledge-source-base/` — Foundation: WHERE things are
| Sub-File | MUST Include |
|----------|--------------|
| `00-index.md` | Summary, TOC matching sub-files, **Read Order for New Members**, cross-refs, known gaps |
| `01-directory-structure.md` | Annotated directory tree (depth 3–4), purpose of each directory |
| `02-entry-points.md` | Entry files, boot sequence, build/CLI scripts, config entry points |
| `03-key-modules.md` | Per-module: purpose, exports, dependencies, internal structure |
| `04-configuration.md` | Config files inventory, env vars with descriptions, secrets handling |

### FOLDER 2: `knowledge-overview/` — Identity: WHAT and WHY
| Sub-File | MUST Include |
|----------|--------------|
| `00-index.md` | Project summary, TOC, quick facts table (name, version, type, primary language) |
| `01-project-identity.md` | Name, version, purpose, **First 60 Minutes onboarding checklist** |
| `02-tech-stack.md` | Categorized stack table with exact versions + manifest evidence file |
| `03-features.md` | Key capabilities/features with verified descriptions and metrics |
| `04-getting-started.md` | Prerequisites, step-by-step install, first run, verified scripts, troubleshooting |

### FOLDER 3: `knowledge-architecture/` — Design: HOW things connect
| Sub-File | MUST Include |
|----------|--------------|
| `00-index.md` | Architecture summary, quoted Mermaid component diagram (`flowchart TD/LR`), cross-refs |
| `01-system-overview.md` | High-level Mermaid diagram, architecture style, layer boundaries |
| `02-components.md` | Per-component: name, responsibility, public interfaces, dependencies |
| `03-data-flow.md` | Request lifecycle (`sequenceDiagram` / `flowchart`), key data & event flows |
| `04-design-patterns.md` | Patterns used: name, where applied, rationale, `file:line` reference |
| `05-decisions.md` | ADR table: decision, chosen option, alternatives, rationale, trade-offs |

### FOLDER 4: `knowledge-domain/` — Data: WHAT flows through
| Sub-File | MUST Include |
|----------|--------------|
| `00-index.md` | Domain summary, entity overview (`erDiagram` / `classDiagram`), bounded contexts |
| `01-entities.md` | Per-entity: fields with types, constraints, relationships |
| `02-database-schema.md` | Tables, indexes, migrations — or explicit `"Not applicable"` with reason |
| `03-api-contracts.md` | Per-endpoint/CLI command: method/verb, path/args, payload/response, auth, errors |
| `04-business-rules.md` | Validations, invariants, state machines (`stateDiagram-v2`), constraints |

### FOLDER 5: `knowledge-standards/` — Rules: HOW TO CODE correctly
| Sub-File | MUST Include |
|----------|--------------|
| `00-index.md` | Standards summary, naming convention quick reference |
| `01-code-style.md` | Formatting rules, linting config, naming conventions table |
| `02-conventions.md` | File organization, import ordering, export & error-handling patterns |
| `03-git-workflow.md` | Commit format, branch naming, PR checks, CI/CD pipeline |
| `04-testing-standards.md` | Test organization, naming, coverage targets, verified test commands |

---

## 2. Collision-Free Parallel Sharding Law (`docs-manager#<shard>` / `docs#<shard>`)

1. **Strict `<= 3–4 OWNED_FILES` Lock per Writer Shard**:
   - Spawn parallel writers via 0-turn `invoke_subagent(TypeName: "self", Model: "inherit")`.
   - Every `docs-manager#<shard>` (`docs#<shard>`) MUST own **at most `3–4` disjoint Markdown files** inside `./documents/`.
   - **NEVER** assign overlapping paths across concurrent shards, and **NEVER** allow any `/docs` shard to edit application source, test, or config files (`READ_ONLY_FILES`).
2. **2-Wave Sub-File → `00-index.md` Ordering**:
   - **Wave A (Sub-File Shards `01..05`)**: Parallel shards write numbered sub-files using a locked `SHARED_CONTRACT` (canonical glossary, ID prefixes `BG/BR/BF/BW` or `SEC/CMP/DFL/REM`, and planned filenames).
   - **Wave B (`00-index.md` Shards, `<= 4` indexes/shard)**: Write `00-index.md` files once sub-files exist on disk so TOC links and cross-folder links resolve with 100% accuracy.
   - Reuse warm `role#shard -> conversationId` sessions via `send_message` for any Phase 3/4 `reviewer` corrections.

---

## 3. Workspace `./documents/` vs. Transient Brain Artifact Routing (`ArtifactMetadata`)

| Deliverable Class | Target Location | `ArtifactMetadata` | Rule |
|-------------------|-----------------|--------------------|------|
| **Canonical Docs** | `./documents/**` | Omit (`N/A` — repo files) | Permanent structured project documentation |
| **Recon & Contract Packs** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-*.md` | `UserFacing: false, RequestFeedback: false` | Raw scans, Evidence Ledger & ID contracts |
| **Team Mailbox** | `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md` | `UserFacing: false, RequestFeedback: false` | Append-only `:team` critiques & `✅ CONSENSUS` |
| **Zero-Drift Audit** | `<appDataDir>\brain\<conversation-id>\REVIEW-docs-{topic}.md` | `UserFacing: true, RequestFeedback: false` | Final `DOC-G1..G4` symbol, link & Mermaid report |

---

## 4. Mode-Dependent Execution & Quality Gates (`DOC-G1..G4`)

| Mode | Action |
|------|--------|
| **CREATE** | Create folder → generate sub-files (`<= 4` files/shard) → finalize `00-index.md` TOC |
| **UPDATE** | Read existing sub-files → diff against Phase 1 Evidence Ledger → revise stale claims & preserve valid sections |
| **MIGRATE** | Read legacy flat doc → distribute into numbered folder sub-files + `00-index.md` → remove/archive superseded flat doc |

### Mandatory Per-File & Cross-Folder Checklist (`DOC-G1..G4`)
- [ ] **`DOC-G1` (Symbol Accuracy)**: Written in user's input language (technical terms in English); every CLI flag, route, env var, and path exists verbatim in repo source (`## Evidence Sources` present).
- [ ] **`DOC-G2` (Sharded Cohesion & Zero Stubs)**: Zero `{placeholder}`/`TODO`/`TBD` markers; no sub-file exceeds `~300` lines (split if needed) or falls below `20` lines of real content (merge if too thin).
- [ ] **`DOC-G3` (Link & Mermaid Integrity)**: `00-index.md` TOC matches actual sub-files; all relative links resolve; Mermaid uses only `flowchart TD/LR`, `sequenceDiagram`, `stateDiagram-v2`, `classDiagram`, `erDiagram`, or `xychart-beta` with quoted special-character labels (`id["Service (API)"]`).
- [ ] **`DOC-G4` (Runnable Examples)**: Documented install/build/test commands match actual `package.json` / workspace manifests.

---

## 5. Sub-File Format Template

```markdown
# {Project Name} — {Document Title}

> **Purpose**: {one-line summary}
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: {YYYY-MM-DD}

---

{Evidence-backed sections, tables, and quoted Mermaid diagrams}

---

## Evidence Sources

| File | Evidence Extracted |
|------|--------------------|
| `{actual/repo/path}` | `{verified symbols, routes, schemas, or config}` |
```
