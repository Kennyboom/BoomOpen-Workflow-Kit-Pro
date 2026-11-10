---
description: "⚡ Fast Research — 2-Wave Autonomous Documentation, SDK/API & Technical Lookup with 4-Source Triangulation & Deterministic CLI Validation"
version: "5.5"
category: research
execution-mode: execute
---

> **📂 Deliverable Routing (v5.5)**: On Antigravity 2.0, write `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` as **1 cohesive file (`<= 300` lines, zero `{name}/` folder splits)** with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so Antigravity 2.0 renders the native 1-click **"Proceed"** button (use `./reports/{topic}/RESEARCH-{topic}.md` on non-Antigravity tools or when explicitly requested).

---

# /research:fast — Fast 2-Wave Autonomous Documentation & Technical Research

> **MISSION**: Rapidly investigate an SDK, API, library, framework, or narrow technical question using **4-Source Triangulation** and a **2-Wave Iterative Search Loop (`4–6` targeted queries)**, producing a CLI-validated 6-Block `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` artifact.

<topic>$ARGUMENTS</topic>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH & SUB-AGENT CAPABILITY RULE

⚡ **TURN-1 ZERO-TAX DISPATCH**: Core orchestration laws and the **5-Field Handoff Packet** (`1. MISSION & ACCEPTANCE CRITERIA`, `2. SHARED_CONTRACT`, `3. OWNED_FILES`, `4. READ_ONLY_FILES`, `5. VERIFICATION & DELIVERABLE`) are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`).
- **Fast-Forward Delta Check**: Inspect `<appDataDir>\brain\<conversation-id>\` on Turn 1. If `RESEARCH-{topic}.md` already exists and the user asks a narrow follow-up, extract its brief via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research brief "<path>"` and run only delta verification queries.
- Otherwise, spawn `researcher` **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Role: "Deep Technical Researcher", Model: "inherit", Prompt: ...)`.

> ⚠️ **SUB-AGENT CAPABILITY RULE (`TypeName: "self"` MANDATORY)**: Antigravity's built-in read-only scout sub-agent disables `search_web` and `write_file`. Always use `TypeName: "self"` with `Model: "inherit"` so `researcher` has live web search (`search_web`) and Brain Artifact write access.

---

## 🧭 4-SOURCE TRIANGULATION & 2-WAVE SEARCH LOOP (`4–6` Queries)

### 1. 4-Source Evidence Tiers (Tag every finding `[Tier 1..4]` + `[Confidence: HIGH|MEDIUM|LOW]`):
1. **`[Tier 1]` Workspace Manifests & Docs**: Inspect `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, lockfiles, and `./documents/` to pin exact installed versions and project constraints.
2. **`[Tier 2]` BoomOpen `1,462` Skills Vault (`compact-index.json`)**: Query `~/.{TOOL}/skills/boomopen-workflow-kit/matrix-skills/compact-index.json` (and `<skills>`) to load matching 2026 `SKILL.md` patterns.
3. **`[Tier 3]` Official Primary Documentation (`search_web`)**: Retrieve vendor specifications, `/llms.txt`, API references, migration guides, and release notes for the exact pinned version.
4. **`[Tier 4]` Empirical Benchmarks & Production Issues**: Check GitHub Issues, CVE advisories, and production benchmarks for breaking changes, rate limits, and edge cases.

### 2. 2-Wave Iterative Search Loop:
| Wave | Focus | Queries | Action |
|------|-------|:-------:|--------|
| **Wave 1: Official Specs & Version Pinning** | Official docs, latest stable vs. installed version, canonical API/config syntax | `2–3` | Pin exact versions, extract verified signatures, and list open edge-case gaps. |
| **Wave 2: Gotchas, Drift & Verification** | GitHub issues, version-drift pitfalls, security/perf caveats, concrete code examples | `2–3` | Arbitrate any contradictions and verify every snippet against the pinned version. |

---

## 📐 CANONICAL 6-BLOCK `RESEARCH-{topic}.md` BLUEPRINT (`<= 300` Lines)

Write **1 cohesive file** at `<appDataDir>\brain\<conversation-id>\RESEARCH-{topic}.md` (`ArtifactMetadata: { Summary: "<1-line verdict & pinned stack>", UserFacing: true, RequestFeedback: true }`) containing all **6 Mandatory Blocks**:

1. **`## 1. Executive Verdict & Scope Summary`**:
   - Direct recommendation + compact Scope YAML (`topic`, `date`, `track`, `overall_confidence: HIGH|MEDIUM|LOW`, `pinned_versions`).
2. **`## 2. 5-Lens Multi-Angle Findings`**:
   - Concise 5-Lens technical/product breakdown where every substantive claim includes inline **`[Confidence: HIGH|MEDIUM|LOW]`** and **`[Tier 1..4]`** provenance tags, plus copy-pasteable code/config snippets matching the pinned version.
3. **`## 3. Contradiction & Version-Drift Arbitration + Comparison Matrix`**:
   - **Contradiction & Version-Drift Arbitration Table** (`Conflicting Claim / Version Drift | Source A vs Source B | Arbitrated Truth & Condition`) + **Comparison Matrix (`>= 2` rows)** + **Mermaid diagram** (`flowchart LR`, `sequenceDiagram`, or `xychart-beta` with quoted special labels).
4. **`## 4. Anti-Sycophancy "When NOT to Use" & Failure Modes`**:
   - Explicit boundary conditions where the recommended approach loses to an alternative, plus concrete failure modes, breaking changes, and mitigations.
5. **`## 5. Clickable Citation Registry & Execution Audit Log`**:
   - Wave 1–2 query audit table + clickable `[Source Title](https://...)` and `[file:line](file:///...)` citations.
6. **`## 6. Downstream Handoff Brief (HANDOFF_BRIEF)`**:
   - Structured bullet/YAML contract (`Recommended Approach`, `Pinned Packages & Versions`, `Hard Constraints`, `Rejected Anti-Patterns`, `Repo Touchpoints`, `Next Recommended Workflow`) consumed automatically by `/brainstorm`, `/design`, `/plan`, and `/cook`.

---

## ✅ DETERMINISTIC CLI VALIDATION GATE & HARD STOP

Before presenting `RESEARCH-{topic}.md` to the user, run the deterministic validator and fix any missing block, citation, or tag if exit code `!= 0`:

```bash
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js research validate "<appDataDir>/brain/<conversation-id>/RESEARCH-{topic}.md" --mode research
```

> **⛔ WORKFLOW COMPLETE. DO NOT WRITE APPLICATION SOURCE CODE AUTOMATICALLY.**
>
> Present clickable link `[RESEARCH-{topic}.md](file:///...)` (with Antigravity 2.0's 1-click **"Proceed"** button active) and highlight concise next options:
> 1. 🔘 **Click "Proceed"** (or run `/plan:fast` / `/cook:fast`) → Consume `HANDOFF_BRIEF` directly without re-researching
> 2. 💡 `/brainstorm:fast` or `/brainstorm:team` → Explore strategic product/architecture options grounded in this research
> 3. 🔬 `/research:hard` or `/research:team` → Escalate to multi-vector 3-Wave / Golden Diamond cross-examination
