---
description: "🔺 Team Design — 2.5x faster 2-Stage Elastic Golden Diamond, ui-ux-pro-max intelligence, 6-Block DESIGN_CONTRACT & 4-Gate adversarial validation"
version: "5.5"
category: design
execution-mode: execute
---

# /design:team — 2-Stage Elastic Golden Diamond UI/UX & Design System Development

> **MISSION**: Maximum-assurance UI/UX design through a **2-Stage Adversarial Elastic Golden Diamond** (`agents/teams/design-team/_team.md`: `techlead` + `executor` + `reviewer`), combining empirical `ui-ux-pro-max` intelligence, optional Multi-Engine Design Council (`boomopen conduct council --task design`), interactive `generative_ui` HTML prototyping, and deterministic 4-Gate CLI validation (`boomopen design validate`).
> **⛔ NO APPLICATION SOURCE CODE — produce design specifications and preview artifacts only.**

<request>$ARGUMENTS</request>

---

## ⚡ TURN-1 ZERO-TAX DISPATCH, PRIOR-ARTIFACT FAST-FORWARD & REFERENCES

1. **Zero Pre-Flight Tax**: Core orchestration laws and the 5-Field Handoff Packet are pre-loaded in your global entrypoint (`GEMINI.md` / `CLAUDE.md` / `CODEX.md`). Do **NOT** block Turn 1 reading `CORE.md`, `PHASES.md`, or `AGENTS.md` — launch Stage 1 shards **immediately on Turn 1** via `invoke_subagent(TypeName: "self", Model: "inherit")` and load `agents/teams/design-team/_team.md` + `commands/_ref/golden-triangle-protocol.md` on-demand in parallel.
2. **⚡ PRIOR-ARTIFACT FAST-FORWARD GATE**:
   - Check if `SCOUT-{request}.md` or `RESEARCH-{request}.md` already exists in `<appDataDir>\brain\<conversation-id>\` (or `./reports/{topic}/`).
   - **If present and fresh**: Reuse existing discovery artifacts immediately — skip Stage 1 scouting/research and jump directly to **Stage 2 (`design-team-techlead` → `design-team-executor` → `design-team-reviewer`)**!
3. **🎨 Mandatory 2026 UI/UX Skill Bundle**:
   - `skills/design-spec/SKILL.md`, `skills/frontend-design/SKILL.md`, `skills/frontend-architecture/SKILL.md`, `skills/mobile-design/SKILL.md`
   - `skills_library/ui-ux-pro-max/SKILL.md` (`scripts/search.py --design-system`)
   - `skills_library/anti-ai-slop-visual-craft/SKILL.md`, `skills_library/oklch-bento-grid-architecture/SKILL.md`, `skills_library/motion-v12-view-transitions-css/SKILL.md`, `skills_library/ai-native-generative-ui-ux/SKILL.md`, `skills_library/wcag-22-accessibility-ergonomics/SKILL.md`

---

## 📁 DELIVERABLE ROUTING & ANTIGRAVITY 2.0 `ArtifactMetadata` RULES

> **Cohesive Single-File `DESIGN-{request}.md` Rule (`<= 500` lines — NO `{name}/` Folder Split & NO Separate `DESIGN-SPEC` Sprawl)**: Keep `<appDataDir>\brain\<conversation-id>\DESIGN-{request}.md` as **1 single, self-contained 6-Block file up to 500 lines**. Embed the visual tokens, component prop contracts (`DESIGN_CONTRACT`), and QA consensus stamp inside `DESIGN-{request}.md`.

| Stage / Artifact | Path (`<appDataDir>\brain\<conversation-id>\`) | `ArtifactMetadata` Setting |
|------------------|------------------------------------------------|----------------------------|
| **Stage 1 Discovery** | `SCOUT-{request}.md` + `RESEARCH-{request}.md` (+ `COUNCIL-DESIGN-{request}.md` if council ran) | `UserFacing: true, RequestFeedback: false` *(No premature "Proceed" button)* |
| **Stage 2 Master Spec** | **`DESIGN-{request}.md`** *(Single cohesive 6-Block file `<= 500` lines)* | **`UserFacing: true, RequestFeedback: true`** *(Renders native 1-click **"Proceed"** button!)* |
| **Stage 2 Live Prototype** | `DESIGN-PREVIEW-{request}.html` *(Optional interactive `generative_ui` prototype)* | `UserFacing: true, RequestFeedback: false` |
| **Inter-Agent Log** | `MAILBOX-{date}.md` | `UserFacing: false, RequestFeedback: false` |

---

## 💎 STAGE 1 (TURNS 1–2): PARALLEL DISCOVERY, CODEBASE TOKEN SCOUT & ARCHETYPE LOCK

> **Why Fused**: Launches codebase token scouting (`scouter`) and empirical design-system research (`researcher` running `ui-ux-pro-max/scripts/search.py --design-system`) **in parallel on Turn 1**, then `design-team-techlead` (`agents/teams/design-team/techlead.md`) locks the Aesthetic Archetype, OKLCH palette, and component scope.

| Governance Pillar | Agent (`TypeName: "self"`, `Model: "inherit"`) | Stage 1 Mission |
|-------------------|------------------------------------------------|-----------------|
| **Parallel Discovery Shards** | • `scouter` (`agents/scouter.md`)<br>• `researcher` (`agents/researcher.md`)<br>• *(Optional)* `boomopen conduct council --task design` | • **`scouter`**: Audit existing CSS variables (`globals.css`, `@theme`), Tailwind config, component primitives, and routes (`SCOUT-{request}.md`, `RequestFeedback: false`).<br>• **`researcher`**: Run `python3 ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "<Project>"` + extract JTBD user flows and UX anti-patterns (`RESEARCH-{request}.md`, `RequestFeedback: false`). |
| **Lead Pillar (`[1]`)** | `design-team-techlead` (`agents/teams/design-team/techlead.md`, `base-agent: designer`) | Read `SCOUT-{request}.md` + `RESEARCH-{request}.md` → lock the **Named Aesthetic Archetype**, **OKLCH + sRGB Hex Token Palette**, **3-Axis Typography**, and **Shared Task List** in `MAILBOX-{date}.md`. |

---

## 💎 STAGE 2 (TURNS 3–4): COHESIVE 6-BLOCK `DESIGN-{request}.md` AUTHORING, LIVE PROTOTYPE & 4-GATE ADVERSARIAL AUDIT

> **Adversarial Design Loop (Max 3 Warm `send_message` Rounds)**: `design-team-executor` (`agents/teams/design-team/executor.md`, `base-agent: designer`) authors the single cohesive 6-Block `DESIGN-{request}.md` (`<= 500` lines, `RequestFeedback: true`, **NO application code**) + optional `DESIGN-PREVIEW-{request}.html` (`generative_ui`) / `image-generator` assets. Then `design-team-reviewer` (`agents/teams/design-team/reviewer.md`) runs `boomopen design validate <design-path>` and performs the 4-Gate Adversarial Audit (`DESIGN-G1..G4`), looping via warm `send_message` until `PASS`.

| Governance Pillar | Agent (`TypeName: "self"`, `Model: "inherit"`) | Stage 2 Mission |
|-------------------|------------------------------------------------|-----------------|
| **Executor Pillar (`[1..N]`)** | `design-team-executor` (`agents/teams/design-team/executor.md`, `base-agent: designer`) | 1. Author the single cohesive **6-Block `DESIGN-{request}.md`** (`<= 500` lines, `ArtifactMetadata: { Summary, UserFacing: true, RequestFeedback: true }`).<br>2. Optionally generate interactive `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{request}.html` (`generative_ui` with `https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js` & 5-state tabs) and bespoke illustrations via `invoke_subagent(TypeName: "image-generator", ...)`.<br>3. Post `SUBMISSION` to `MAILBOX-{date}.md` and record `conversationId` for warm `send_message` revisions. |
| **Critic Pillar (`[1..2]`)** | `design-team-reviewer` (`agents/teams/design-team/reviewer.md`, `base-agent: reviewer`) | 1. Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<appDataDir>/brain/<conversation-id>/DESIGN-{request}.md"`.<br>2. Challenge `DESIGN-{request}.md` across **4 Deterministic Gates (`DESIGN-G1..G4`)**:<br>   - **`DESIGN-G1` (Token & Elevation Lock)**: Complete YAML frontmatter + OKLCH & `#hex` fallback + 4-step surface elevation + 3-axis typography (`tabular-nums`) + spring physics.<br>   - **`DESIGN-G2` (5-State Matrix)**: Complete `Default`, `Loading Skeleton` (`150ms` delay / `400ms` hold, `CLS = 0`), `Empty State`, `Error Recovery` (`role="alert"`), and `Disabled / Focus-Visible`.<br>   - **`DESIGN-G3` (WCAG 2.2 AA & Anti-Slop)**: Contrast `>= 4.5:1`, target size `>= 24x24px` web / `44x44pt` mobile (`SC 2.5.8`), `scroll-padding-top` (`SC 2.4.11`), drag alternatives (`SC 2.5.7`), `prefers-reduced-motion`, responsive breakpoints (`320px`/`768px`/`1024px`/`1440px`), zero `#6366f1 -> #a855f7` AI-slop.<br>   - **`DESIGN-G4` (`DESIGN_CONTRACT` & 2-Wave Sharding)**: Fenced CSS `@theme inline` block + fenced TypeScript Props/5-State interface block + Wave-1 (`#tokens-primitives`) / Wave-2 (`#screen-1..k`) shard topology.<br>3. If any `🔴 BLOCKER` or gate failure exists, send `REVIEW` (`REVISE`) to `design-team-executor` via warm `send_message` (max 3 rounds). |
| **Lead Arbitration & Stamp** | `design-team-techlead` (`agents/teams/design-team/techlead.md`) | Arbitrate any Round-3 dispute, verify `boomopen design validate` exits `0`, and stamp `✅ CONSENSUS: design-team-techlead ✓ | design-team-executor ✓ | design-team-reviewer ✓` inside `DESIGN-{request}.md` and `MAILBOX-{date}.md`. |

### Mandatory 6-Block Structure of `<appDataDir>\brain\<conversation-id>\DESIGN-{request}.md` (`<= 500` Lines)

1. **YAML Token Frontmatter (`design-spec` v2.0)**: `version`, `name`, `archetype`, `colors` (OKLCH + `#hex`), `surface_elevation`, `typography` (`tabular-nums`), `motion`, `spacing`, `rounded`, `wcag_target: "2.2-AA"`.
2. **Block 1 — Problem, Aesthetic Direction & Anti-Slop Charter**: Verbatim request, JTBD goal, Named Archetype, 60-30-10 color allocation, explicit Anti-AI-Slop rejections (+ Multi-Engine Council Synthesis summary if council ran).
3. **Block 2 — Information Architecture, Responsive Breakpoint Matrix & Mermaid Flow**: `flowchart LR` user journey + `320px` / `768px` / `1024px` / `1440px` breakpoint matrix (`min-h-dvh`, `@container`, Asymmetric Bento Grid).
4. **Block 3 — 5-State Component & Interaction Matrix**: `Default (Idle)`, `Loading Skeleton` (`150ms` delay / `400ms` min hold, `CLS = 0`), `Empty State`, `Error Recovery` (`role="alert"`), `Disabled & Keyboard Focus-Visible`.
5. **Block 4 — WCAG 2.2 AA & Core Web Vitals Verification**: `SC 1.4.3` (`>= 4.5:1`), `SC 2.5.8` (`>= 24x24px` web / `44x44pt` mobile), `SC 2.4.11` (`scroll-padding-top`), `SC 2.5.7` (drag alternatives), `SC 3.3.8` (accessible auth), `prefers-reduced-motion: reduce`, `tabular-nums`, `CLS < 0.1`.
6. **Block 5 & 6 — Fenced `DESIGN_CONTRACT` (`css` `@theme inline` + `ts` Props/5-State Interfaces + 2-Wave Frontend Shard Topology) & Diamond Consensus Stamp**:
   - Verified via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<design-path>"`.
   - Extractable via `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"`.

---

## ⛔ HARD STOP — AWAIT USER DECISION

Present `<appDataDir>\brain\<conversation-id>\DESIGN-{request}.md` (`RequestFeedback: true`), `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{request}.html` (if generated), and `<appDataDir>\brain\<conversation-id>\MAILBOX-{date}.md`, then **STOP**:
1. 🟢 **Click "Proceed" (or reply `"proceed"` / `"tiến hành đi"`)** → Transition directly to `/plan:team` or `/code:team` (Approved-Design Continuation)
2. 📋 **`/plan:team {request}`** → Create sharded Wave-1 (`#tokens-primitives`) + Wave-2 (`#screen-1..k`) implementation plan locking `DESIGN_CONTRACT`
3. 🚀 **`/cook:team {request}`** → Execute full-stack feature build reusing this approved `DESIGN-{request}.md`
4. 🔄 **Iterate** → Refine specific tokens, components, or states
