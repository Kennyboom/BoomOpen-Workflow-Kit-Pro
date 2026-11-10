---
name: design-spec
description: How to author a DESIGN.md or DESIGN-{task}.md file — the machine-verifiable 6-Block design-token + UI contract format that must exist before any UI is built. Supports OKLCH perceptual color tokens + sRGB hex, surface_elevation ladders, motion spring tokens, 5-State Component Matrix, DESIGN_CONTRACT (@theme CSS + TypeScript Props), and WCAG 2.2 AA guardrails.
when_to_use: "BEFORE writing any UI code (web or mobile). Read when running /design, creating or updating <appDataDir>\\brain\\<conversation-id>\\DESIGN-{task}.md or workspace DESIGN.md, locking DESIGN_CONTRACT for parallel frontend-engineer#shard agents, or validating via boomopen design validate."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 5.5.0
---

# DESIGN.md & `DESIGN-{task}.md` Specification (v5.5 — 6-Block Machine-Verifiable Edition)

> A `DESIGN-{task}.md` (and workspace `./DESIGN.md`) is the **single source of truth** for a project's visual language, component states, and CSS/TypeScript UI contracts. Create and validate it **BEFORE** building UI.
>
> **Cohesive Single-File Rule (`<= 500` Lines)**: Always write `<appDataDir>\brain\<conversation-id>\DESIGN-{task}.md` as **1 cohesive single file up to 500 lines** (NEVER split at 150 lines into a multi-file folder!) with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so Antigravity 2.0 renders the native 1-click **"Proceed"** button. Optionally pair with `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{task}.html` (`generative_ui`) for live interactive token/component previewing.
>
> 📚 **Reference library:** [collection.md](collection.md) — 70+ real-world `DESIGN.md` inspirations (Linear, Stripe, Vercel, Apple, Airbnb…) + `skills_library/ui-ux-pro-max/scripts/search.py --design-system`.

---

## 1. Output Routing & Dual-Artifact Lifecycle

| Context | Canonical Path | `ArtifactMetadata` / Role |
|---------|----------------|---------------------------|
| **Mode B `/design` Spec (Primary)** | `<appDataDir>\brain\<conversation-id>\DESIGN-{task}.md` | `UserFacing: true, RequestFeedback: true` (1 cohesive file `<= 500` lines; unlocks 1-click **"Proceed"**) |
| **Interactive Live Preview (Optional)** | `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{task}.html` | Rendered via `generative_ui` skill to preview palette, typography, and 5-state interactive cards |
| **Workspace Design System Lock** | `./DESIGN.md` (project root) | Persistent repo-level token contract synced when establishing or updating a project-wide design system |

---

## 2. The 6-Block Cohesive `DESIGN-{task}.md` Blueprint

Every `DESIGN-{task}.md` (and workspace `DESIGN.md`) MUST follow this **6-Block Machine-Verifiable Structure** with unique `##` headings:

```markdown
---
<YAML Token Front Matter: version, name, archetype, colors, surface_elevation, typography, motion, rounded, spacing, components>
---

# DESIGN: {Feature or Product Name}

## 1. Overview & Aesthetic Direction
## 2. Colors, Surface Elevation & Typography
## 3. Layout, Responsive Breakpoints & User Flow
## 4. 5-State Component & Screen Matrix
## 5. Accessibility (WCAG 2.2 AA), Motion & Do's/Don'ts
## 🤝 Shared Design & Component Contract (DESIGN_CONTRACT)
```

---

## 3. Token Schema (YAML Front Matter — 2026 OKLCH + Hex Dual Support)

```yaml
version: "5.5"
name: Linear Technical Dark
archetype: linear-technical-dark   # swiss-editorial | linear-technical-dark | luxury-minimal | tactile-neo-brutalist
colors:
  primary: "oklch(0.68 0.18 255)"  # OKLCH preferred (or "#RRGGBB" sRGB hex)
  primary-hover: "oklch(from var(--color-primary) calc(l + 0.06) c h)"
  accent: "oklch(0.74 0.17 162)"
  success: "oklch(0.72 0.17 152)"
  warning: "oklch(0.78 0.16 75)"
  error: "oklch(0.64 0.21 25)"
surface_elevation:
  canvas: "oklch(0.12 0.012 260)"
  card: "oklch(0.155 0.014 260)"
  elevated: "oklch(0.19 0.016 260)"
  overlay: "oklch(0.225 0.018 260 / 0.88)"
  border-hairline: "oklch(1 0 0 / 0.08)"
  specular-top: "inset 0 1px 0 0 oklch(1 0 0 / 0.07)"
typography:
  display-xl:
    fontFamily: Instrument Serif
    fontSize: "clamp(2.25rem, 4vw + 1rem, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.028em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  metric-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 500
    fontFeature: "'tnum' 1, 'zero' 1"
motion:
  spring-snappy: "{ stiffness: 420, damping: 32, mass: 0.8 }"
  spring-spatial: "{ stiffness: 300, damping: 28, mass: 1.0 }"
  ease-out-expo: "cubic-bezier(0.16, 1, 0.3, 1)"
  duration-fast: 160ms
  duration-normal: 220ms
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    minTargetSize: 44px
```

---

## 4. Block-by-Block Requirements (`DESIGN-G1` to `DESIGN-G4`)

| Block | Mandatory Contents | Gate |
|-------|--------------------|:----:|
| **Block 1: Overview & Aesthetic Direction** | Named archetype (`Swiss Editorial`, `Linear Technical Dark`, `Quiet Luxury Minimal`, `Tactile Neo-Brutalist`), domain rationale, audience, and explicit Anti-Slop commitment (zero `#6366f1 -> #a855f7` or `#8b5cf6 -> #06b6d4` neon gradients). | `DESIGN-G1` |
| **Block 2: Colors, Surface Elevation & Typography** | 60-30-10 token allocation, 4-step OKLCH surface ladder (`canvas` → `card` → `elevated` → `overlay`), 3-axis font pairing (`--font-display`, `--font-sans`, `--font-mono`), fluid `clamp()`, `45ch–68ch` measure, and `tabular-nums` on all numeric metrics/tables. | `DESIGN-G1` |
| **Block 3: Layout, Responsive Breakpoints & User Flow** | Responsive adaptation table across **`320px` (Mobile)**, **`768px` (Tablet)**, **`1024px` (Laptop)**, and **`1440px+` (Desktop)** + `@container` queries + `min-h-dvh` + concentric border radius (`R_outer = R_inner + Padding`) + `mermaid` user/screen flow diagram. | `DESIGN-G3` |
| **Block 4: 5-State Component & Screen Matrix** | Every screen/component MUST specify all **5 mandatory UI states**: **`Default / Idle`**, **`Loading / Skeleton`** (exact shimmer geometry), **`Empty State`** (onboarding CTA), **`Error State`** (inline `aria-invalid` / recovery retry), and **`Disabled / Focus-Visible / Success`** (`2px` focus ring + optimistic toast). | `DESIGN-G2` |
| **Block 5: Accessibility (WCAG 2.2 AA), Motion & Do's/Don'ts** | Contrast targets (`>= 4.5:1` normal text, `>= 3:1` large text & UI borders), target size floor (`>= 24×24px` desktop web SC 2.5.8, `>= 44×44pt` iOS / `>= 48×48dp` Android), `scroll-padding-top` (`SC 2.4.11`), no `onPaste` blocking (`SC 3.3.8`), and `@media (prefers-reduced-motion: reduce)`. | `DESIGN-G3` |
| **Block 6: `DESIGN_CONTRACT` (`## 🤝 Shared Design & Component Contract (DESIGN_CONTRACT)`)** | Machine-extractable Tailwind v4 `@theme inline` CSS block + TypeScript component props/state interfaces + 2-Wave `frontend-engineer#shard` file ownership lock table ready for `PLAN-{task}.md`. | `DESIGN-G4` |

---

## 5. Block 6 Template: `## 🤝 Shared Design & Component Contract (DESIGN_CONTRACT)`

Include this exact section in every `DESIGN-{task}.md` so `boomopen design contract <path>` (and `/plan` / `/code`) can inject it directly into `PLAN-{task}.md` (`SHARED_CONTRACT`):

````markdown
## 🤝 Shared Design & Component Contract (DESIGN_CONTRACT)

### 1. CSS Design Tokens (`src/styles/globals.css` — Tailwind v4 `@theme inline`)
```css
@layer base {
  :root {
    --surface-canvas: oklch(0.985 0.004 85);
    --surface-card: oklch(1 0 0);
    --surface-elevated: oklch(0.96 0.006 85);
    --border-hairline: oklch(0.20 0.015 260 / 0.10);
    --text-primary: oklch(0.18 0.015 260);
    --text-secondary: oklch(0.45 0.015 260);
    --color-primary: oklch(0.56 0.18 32);
    --color-danger: oklch(0.60 0.21 25);
    --radius-card: 16px;
    --radius-control: 10px;
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dark {
    --surface-canvas: oklch(0.12 0.012 260);
    --surface-card: oklch(0.155 0.014 260);
    --surface-elevated: oklch(0.19 0.016 260);
    --border-hairline: oklch(1 0 0 / 0.08);
    --text-primary: oklch(0.95 0.008 260);
    --text-secondary: oklch(0.68 0.012 260);
  }
}

@theme inline {
  --color-canvas: var(--surface-canvas);
  --color-card: var(--surface-card);
  --color-elevated: var(--surface-elevated);
  --color-hairline: var(--border-hairline);
  --color-brand: var(--color-primary);
  --font-display: "Instrument Serif", Georgia, serif;
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

### 2. Shared Component Props & 5-State Discriminated Union (`src/types/ui-contract.ts`)
```ts
export type AsyncViewState<T> =
  | { status: 'idle' }
  | { status: 'loading'; skeletonCount?: number }
  | { status: 'empty'; title: string; actionLabel: string }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'success'; data: T };
```

### 3. 2-Wave Frontend Shard Ownership Lock
| Wave | Agent Shard | `OWNED_FILES` (Write Lock) | `READ_ONLY_FILES` |
|:----:|-------------|----------------------------|-------------------|
| **Wave 1** | `frontend-engineer#tokens-primitives` | `src/styles/globals.css`, `src/types/ui-contract.ts`, `src/components/ui/*` | `DESIGN-{task}.md` |
| **Wave 2** | `frontend-engineer#screen-1..k` | `src/features/{slice}/*`, `src/app/{route}/*` (`<= 3-4` files/shard) | `src/styles/globals.css`, `src/types/ui-contract.ts`, `src/components/ui/*` |
````

---

## 6. Deterministic CLI Verification (`boomopen design validate` & `contract`)

Before marking any `/design` workflow complete or handing off to `/plan` / `/code`, run the `< 50ms` static validator:

```bash
# 1. Validate DESIGN-G1 (Tokens & Anti-Slop), DESIGN-G2 (5-State Matrix), DESIGN-G3 (WCAG 2.2 AA & Breakpoints), DESIGN-G4 (DESIGN_CONTRACT & <= 500 lines)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<path-to-DESIGN-task.md>"

# 2. Extract the machine-parseable DESIGN_CONTRACT block for PLAN-{task}.md injection
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<path-to-DESIGN-task.md>"
```

| Gate | Rule Enforced | Failure Fix |
|------|---------------|-------------|
| **`DESIGN-G1`** | Valid YAML/CSS color tokens (`oklch`/`#hex`/`@theme`), typography scale, spacing/radius scale, no duplicate `##` headings, and zero banned `#6366f1 -> #a855f7` / `#8b5cf6 -> #06b6d4` slop gradients | Add missing token scales or replace banned purple-cyan gradient with an intentional OKLCH palette |
| **`DESIGN-G2`** | Complete **5-State Component Matrix** (`Default/Idle`, `Loading/Skeleton`, `Empty State`, `Error State`, `Disabled/Focus-Visible`) | Add the 5-State table covering every designed screen/component |
| **`DESIGN-G3`** | WCAG 2.2 AA contrast (`4.5:1` / `3:1`), hit targets (`24×24px` web / `44×44pt` mobile), `prefers-reduced-motion`, and responsive breakpoints (`320px`/`768px`/`1024px`/`1440px` + `min-h-dvh`) | Document explicit contrast ratios, target dimensions, reduced-motion behavior, and breakpoint rules |
| **`DESIGN-G4`** | Fenced `css` (`@theme` / `--color-*`) + `ts` contract inside `DESIGN_CONTRACT` and single cohesive file `<= 500` lines | Add `## 🤝 Shared Design & Component Contract (DESIGN_CONTRACT)` and keep file `<= 500` lines |
