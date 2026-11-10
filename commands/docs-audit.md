---
description: "🛡️ Audit Docs — Generate 4 `./documents/audit/audit-*/` folders via collision-free parallel sharding (`<= 3–4 OWNED_FILES`/shard) and `SEC/CMP/DFL/REM` scoring"
version: "5.5"
category: documentation
execution-mode: execute
---

# /docs:audit — Security, Compliance & Dataflow Audit Documentation (`v5.5`)

> **MISSION**: Generate or update **all 4 security & compliance audit folders** (`20+` files in `./documents/audit/audit-*/`), each with `00-index.md` + `01..04` sub-files, backed by `file:line` codebase evidence, strict maturity scoring, and cross-linked `SEC-*` / `CMP-*` / `DFL-*` / `REM-*` IDs using **collision-free parallel `docs-manager#audit-*` shards (`<= 3–4 OWNED_FILES` per shard)**.

<scope>$ARGUMENTS</scope>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & MANDATORY REFERENCES

1. **Same-Turn Reference Load + Recon Dispatch**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — read these binding specs AND spawn Phase 1 `scouter#audit-1..k` shards **in the same Turn-1 parallel batch** via `invoke_subagent(TypeName: "self", Model: "inherit")`:
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-recon-protocol.md` — Mode detection (`CREATE`/`UPDATE`/`MIGRATE`) and evidence rules (reuse existing `SCOUT-docs-core-*.md` if Step 1 of `/docs` already ran!).
   - `~/.{TOOL}/skills/boomopen-workflow-kit/commands/_ref/docs-folder-specs.md` — Collision-free sharding rules, sub-file quality gates, and Mermaid rules.
   - *(When `:team` or `execution.mode = team` is active, also follow `~/.{TOOL}/skills/boomopen-workflow-kit/agents/teams/docs-team/_team.md`.)*
2. **Workspace `./documents/audit/` vs. Transient Brain Artifacts (`ArtifactMetadata`)**:
   - **Workspace Audit Docs (`./documents/audit/audit-*/`)**: Written in the **user's input language** (technical terms, CWE/OWASP identifiers, finding IDs, and `file:line` paths in English). Omit `ArtifactMetadata` on workspace files.
   - **Transient Brain Artifacts (`<appDataDir>\brain\<conversation-id>\`)**: Keep `./documents/` clean of raw recon and review scratchpads:
     - `SCOUT-docs-audit-{1..k}.md` & `SCOUT-docs-audit-findings.md`: `ArtifactMetadata: { Summary: "Audit recon & SEC/CMP/DFL/REM master register", UserFacing: false, RequestFeedback: false }`
     - `MAILBOX-{date}.md` (`:team` mode): `ArtifactMetadata: { Summary: "Docs team coordination mailbox", UserFacing: false, RequestFeedback: false }`
     - `REVIEW-docs-audit.md`: `ArtifactMetadata: { Summary: "Audit docs cross-folder ID, score & evidence verification", UserFacing: true, RequestFeedback: false }`
3. **Zero Source Mutation Guardrail**: All application source, config, and test files are strictly `READ_ONLY_FILES`.

---

## 📁 DELIVERABLES — 4 Audit Folders (`20+` Files Minimum)

> [!IMPORTANT]
> **MUST CREATE OR UPDATE ALL 4 FOLDERS (`4 × 5 = 20+` files).** Incomplete = FAILED execution.

```
./documents/audit/
  audit-security/          # 00-index + 01-attack-surface + 02-vulnerability-findings + 03-owasp-assessment + 04-risk-summary (5 files)
  audit-compliance/        # 00-index + 01-control-inventory + 02-framework-mapping + 03-gap-register + 04-evidence-state (5 files)
  audit-dataflow/          # 00-index + 01-trust-boundaries + 02-data-flow-map + 03-sensitive-data-inventory + 04-privacy-posture (5 files)
  audit-recommendations/   # 00-index + 01-critical-remediations + 02-high-priority + 03-medium-low + 04-score-uplift-plan (5 files)
```

### Canonical Finding ID & Evidence Discipline (`SHARED_CONTRACT`)
| Prefix | Folder Domain | Cross-Folder Traceability Rule |
|--------|---------------|--------------------------------|
| `SEC-001..N` | `audit-security/` | Referenced verbatim with identical severity in `audit-recommendations/` |
| `CMP-001..N` | `audit-compliance/` | Mapped to NIST / CIS / ISO / OWASP ASVS controls & cited in `audit-recommendations/` |
| `DFL-001..N` | `audit-dataflow/` | Linked to trust boundaries / PII stores & cited in `audit-recommendations/` |
| `REM-001..N` | `audit-recommendations/` | Every `REM-*` item MUST cite ≥ 1 upstream `SEC-*` / `CMP-*` / `DFL-*` ID + score uplift |

- **Evidence Tags**: Tag every control/claim as `Verified` (`path/to/file.ts#L42`), `Partial` (incomplete control with `file:line`), or `Unknown` (isolated to `Known Gaps` — NEVER infer `Verified` without reading source).
- **`00-index.md` Pattern**: Quick summary, **Strict Maturity Score** (`{score}/100`, Grade `A–F`, Confidence `High/Medium/Low`), Sub-files TOC table, Top Findings, Cross-references (`../audit-*/00-index.md` + `../../knowledge-architecture/00-index.md`), and `Known Gaps`.

---

## 🎭 Phase 1: PARALLEL AUDIT RECONNAISSANCE (`Turn 1`)

| Attribute | Value |
|-----------|-------|
| **Shards** | `scouter#audit-1..k` via `invoke_subagent(TypeName: "self", Model: "inherit")` (`<= 3–4` modules/shard; reuse `SCOUT-docs-core-*.md` if present) |
| **Goal** | Detect `CREATE`/`UPDATE`/`MIGRATE` mode per folder; map entry points, auth/RBAC middleware, secrets/env handling, PII data stores, external integrations, and dependency manifests |
| **Output** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-audit-{1..k}.md` (`UserFacing: false, RequestFeedback: false`) |

---

## 🎭 Phase 2: DEEP SECURITY ANALYSIS, FRAMEWORK MAPPING & SCORE LOCK

| Attribute | Value |
|-----------|-------|
| **Agent** | `security-engineer` via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Skills** | `skills/security-auditor/SKILL.md` + `~/.{TOOL}/skills_library/docs-audit/references/framework-mapping.md` + `~/.{TOOL}/skills_library/docs-audit/references/scoring-framework.md` |
| **Goal** | Produce the canonical Findings Register (`SEC-*`, `CMP-*`, `DFL-*`, `REM-*`), OWASP Top 10 & NIST/CIS/ISO control matrix, `likelihood × impact` risk ratings, and folder/overall maturity scores (`{score}/100`) |
| **Output** | `<appDataDir>\brain\<conversation-id>\SCOUT-docs-audit-findings.md` (`UserFacing: false, RequestFeedback: false`) — locked `SHARED_CONTRACT` for Phase 3! |

---

## 🎭 Phase 3: COLLISION-FREE PARALLEL AUDIT FOLDER SHARDING (`<= 4 OWNED_FILES` / Shard)

> **ANTI-COLLISION LAW**: Dispatch 4 parallel `docs-manager#audit-*` sub-agents (`TypeName: "self"`, `Model: "inherit"`) consuming `SCOUT-docs-audit-findings.md` as their read-only `SHARED_CONTRACT`. Each shard owns **exactly `4` disjoint sub-files** (`0` shared write targets!).

### Wave 3A — Parallel Sub-File Shards (`4` Disjoint Shards, `4` Files Each)

| Shard Key (`role#shard`) | Disjoint `OWNED_FILES` (`4` Files) | Mandatory Content |
|:-------------------------|:-----------------------------------|:------------------|
| `docs-manager#audit-sec` | `documents/audit/audit-security/01-attack-surface.md` .. `04-risk-summary.md` | Attack surface, `SEC-*` findings (`CWE` + `file:line`), OWASP Top 10 matrix, risk summary |
| `docs-manager#audit-cmp` | `documents/audit/audit-compliance/01-control-inventory.md` .. `04-evidence-state.md` | Control inventory, NIST/CIS/ISO mapping, `CMP-*` gap register, `Verified/Partial/Unknown` ledger |
| `docs-manager#audit-dfl` | `documents/audit/audit-dataflow/01-trust-boundaries.md` .. `04-privacy-posture.md` | Quoted Mermaid `flowchart TD/LR` trust-boundary & data-flow maps, sensitive/PII inventory, `DFL-*` posture |
| `docs-manager#audit-rem` | `documents/audit/audit-recommendations/01-critical-remediations.md` .. `04-score-uplift-plan.md` | Prioritized `REM-*` roadmap linked to `SEC/CMP/DFL` IDs + quantified score uplift table |

### Wave 3B — Index & Score Rollup Shard (`4` Files)
Once Wave 3A finishes, `docs-manager#audit-indexes` (or warm reuse via `send_message`) writes the 4 `00-index.md` files (`audit-security/00-index.md`, `audit-compliance/00-index.md`, `audit-dataflow/00-index.md`, `audit-recommendations/00-index.md`) embedding locked Phase 2 scores and verified TOC links.

---

## 🎭 Phase 4: CONSISTENCY & ZERO-DRIFT QUALITY REVIEW (`DOC-G1..G4`)

| Attribute | Value |
|-----------|-------|
| **Agent** | `reviewer` (or `docs-team-reviewer` in `:team` mode) via `invoke_subagent(TypeName: "self", Model: "inherit")` |
| **Goal** | Verify cross-folder `SEC/CMP/DFL/REM` ID/severity parity, `file:line` accuracy, score arithmetic, relative links, and quoted Mermaid syntax |
| **Output** | `<appDataDir>\brain\<conversation-id>\REVIEW-docs-audit.md` (`ArtifactMetadata: { Summary: "Audit documentation zero-drift & score verification", UserFacing: true, RequestFeedback: false }`) |

Route any discrepancy to the owning warm `docs-manager#audit-*` `conversationId` via `send_message` (max 3 rounds) until `0` mismatches remain.

---

## ✅ COMPLETION OUTPUT

```markdown
## 🛡️ Audit Documentation Complete (`v5.5`)

| Folder | Files | Score | Grade | Shard Owner | Status |
|--------|-------|-------|-------|-------------|--------|
| `documents/audit/audit-security/` | `00-index` + `01..04` | `{score}/100` | `{grade}` | `docs-manager#audit-sec` | ✅ Verified |
| `documents/audit/audit-compliance/` | `00-index` + `01..04` | `{score}/100` | `{grade}` | `docs-manager#audit-cmp` | ✅ Verified |
| `documents/audit/audit-dataflow/` | `00-index` + `01..04` | `{score}/100` | `{grade}` | `docs-manager#audit-dfl` | ✅ Verified |
| `documents/audit/audit-recommendations/` | `00-index` + `01..04` | `{score}/100` | `{grade}` | `docs-manager#audit-rem` | ✅ Verified |

- **Overall Audit Maturity**: `{score}/100` | **Grade**: `{grade}` | **Confidence**: `{High/Medium/Low}`
- **Top Remediations**: `1. {REM-001 -> SEC-...}` | `2. {REM-002 -> CMP-...}`
- **Workspace Docs**: `4` folders (`20+` files) in `./documents/audit/`
- **Zero-Drift Audit**: `<appDataDir>\brain\<conversation-id>\REVIEW-docs-audit.md`
```
