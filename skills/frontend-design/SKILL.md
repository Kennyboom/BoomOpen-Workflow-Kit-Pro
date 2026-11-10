---
name: frontend-design
description: Design thinking, 2026 visual craft, OKLCH color architecture, 3-axis typography, spring motion, 5-State UI Matrix, and WCAG 2.2 AA decision-making for web UI. Pair with design-spec, anti-ai-slop-visual-craft, and generative_ui.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 5.5.0
---

# Frontend Design System (v5.5 — 2026 Anti-AI-Slop, OKLCH & WCAG 2.2 AA Edition)

> **Philosophy:** Every pixel has purpose. Restraint is luxury. User psychology drives decisions.
> **Core Principle:** THINK, don't memorize. ASK, don't assume. Lock an Aesthetic Archetype and `DESIGN-{task}.md` (`DESIGN_CONTRACT`) BEFORE coding.

---

## 🎯 Selective Reading & Companion Skills Rule (MANDATORY)

| Resource / Companion Skill | Status | When to Read |
|----------------------------|--------|--------------|
| [ux-psychology.md](ux-psychology.md) | 🔴 **REQUIRED** | Always read first! |
| `design-spec` (`skills/design-spec/SKILL.md`) | 🔴 **REQUIRED** | Authoring `<appDataDir>\brain\<conversation-id>\DESIGN-{task}.md` (`<= 500` lines, `RequestFeedback: true`) & `DESIGN_CONTRACT` |
| `anti-ai-slop-visual-craft` (`skills_library/`) | 🔴 **REQUIRED** | Pre-Coding Aesthetic Gate, Anti-Slop Ban List, 1px specular borders, optical alignment |
| `wcag-22-accessibility-ergonomics` (`skills_library/`) | 🔴 **REQUIRED** | WCAG 2.2 AA (`SC 2.4.11` Focus Not Obscured, `SC 2.5.7` Drag Alternatives, `SC 2.5.8` 24px/44pt Targets, `SC 3.3.8` Accessible Auth) |
| [color-system.md](color-system.md) / `oklch-bento-grid-architecture` | ⚪ Optional | OKLCH palettes, dark mode surface ladders & asymmetric Bento grids |
| [typography-system.md](typography-system.md) | ⚪ Optional | 3-axis font pairing (`Display` + `UI Sans` + `Tabular Mono`) & fluid `clamp()` scales |
| [animation-guide.md](animation-guide.md) / `motion-v12-view-transitions-css` | ⚪ Optional | View Transitions API, CSS `@starting-style`/`scroll()`, `motion/react` v12 springs |
| `ai-native-generative-ui-ux` (`skills_library/`) & `generative_ui` | ⚪ Optional | Streaming AI surfaces, `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{task}.html` live preview widgets |
| [visual-effects.md](visual-effects.md) / [decision-trees.md](decision-trees.md) | ⚪ Optional | Specular depth, tactile textures, context templates |

## 🔧 Design Intelligence, Spec Validator & Runtime Audit Scripts

| Tool / Script | Purpose | Command / Usage |
|---------------|---------|-----------------|
| **Design Intelligence Search** | Query 161 industry rules, 161 palettes & 57 font pairings before choosing tokens | `python ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "<industry or product>" --design-system` |
| **Static Spec Validator (`< 50ms`)** | Validate `DESIGN-G1..G4` on `DESIGN-{task}.md` or `DESIGN.md` | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<path-to-DESIGN.md>"` |
| **UX Psychology & Craft Audit** | Verify OKLCH color system, typography (`tabular-nums`, `dvh`), Fitts'/Hick's laws & anti-slop rules | `python ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path> [--json]` |
| **WCAG 2.2 AA Accessibility Checker** | Verify semantic HTML, labels, `:focus-visible`, `prefers-reduced-motion`, and `SC 3.3.8` | `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path> [--json]` |
| **Interactive Preview & Visual Assets** | Render live HTML token/component preview (`generative_ui`) or bespoke illustrations (`image-generator`) | Write `DESIGN-PREVIEW-{task}.html` via `generative_ui`; spawn `invoke_subagent(TypeName: "image-generator", ...)` for custom hero/empty-state art |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## ⚠️ CRITICAL: PRE-CODING AESTHETIC GATE & ASK BEFORE ASSUMING

> **STOP! If the user's request is open-ended, DO NOT default to generic Tailwind SaaS templates.**

### 1. When User Prompt is Vague, Ask or Propose an Archetype:
- **Aesthetic Archetype**: *Swiss Editorial Grid* (warm paper + serif + exposed `1px` hairlines), *Linear Technical Dark* (obsidian OKLCH surface ladder + top specular border), *Quiet Luxury Minimal* (tonal limestone + generous whitespace), or *Tactile Neo-Brutalist* (`2px` ink border + hard offset shadow)?
- **Color & Theme**: Light-first, Dark-first, or Adaptive OKLCH dual theme?
- **Layout Architecture**: Editorial narrative, Asymmetric 12-column Bento Grid (`7:5` / `8:4`), or Dense Workspace Workbench?

### 2. ⛔ Explicit Anti-AI-Slop Ban List (Zero Tolerance)

| AI Default Tendency | Why It Fails | 2026 Craft Replacement |
|---------------------|--------------|------------------------|
| **Purple/Indigo or Purple/Cyan Gradient (`#6366f1 → #a855f7`, `#8b5cf6 → #06b6d4`)** | Universal LLM cliché; screams uncurated AI output | Single high-conviction OKLCH accent (`oklch(0.62 0.19 28)` ember, emerald, or monochrome ink) |
| **3 Equal Cards in a Row (`grid-cols-3 gap-6`)** | Zero visual hierarchy; boring template rhythm | Asymmetric Bento Grid (`8:4` or `7:5` split) or numbered editorial index (`01 / 02 / 03`) |
| **Floating Blurred Neon Blobs (`blur-3xl`)** | Muddy contrast, GPU overdraw, dated 2021 look | Stepped OKLCH surface elevation + `1px` hairline border with top inner specular highlight |
| **Centered Everything (`text-center` on all sections)** | Destroys scannability and reading anchor | Left-align thesis headlines (`max-w-[58ch]`) and body copy; right-align metadata/actions |
| **Naked Icons in Colored Circles** | Overused boilerplate filler | Interactive micro-UI previews, live sparklines, or `<kbd>⌘K</kbd>` shortcut badges |
| **AI Copywriting (*"Unleash"*, *"Empower"*, *"Next-Gen"*)** | Zero information density | Concrete, metric-backed copy (*"Sub-10ms hot-sync across 5 IDEs"*) |

---

## 1. Constraint & Audience Analysis (Always First)

| Constraint | Question | Design Impact |
|------------|----------|---------------|
| **Audience** | Developers, Enterprise B2B, Consumer Gen-Z, or Luxury? | Drives density, typography, and motion tempo |
| **Brand / `DESIGN.md`** | Does `DESIGN-{task}.md` or workspace `DESIGN.md` exist? | Conform strictly to `DESIGN_CONTRACT` tokens |
| **Device Mix** | Desktop keyboard-first (`⌘K`) or Mobile thumb-zone? | Dictates `<ResponsiveModal>` (`vaul` drawer vs Radix dialog) and `44pt`/`48dp` targets |

---

## 2. UX Psychology Principles

| Law | Principle | UI Engineering Application |
|-----|-----------|----------------------------|
| **Hick's Law** | More choices = slower decisions | Progressive disclosure; move secondary actions into `⌘K` (`cmdk`) or overflow menus |
| **Fitts' Law** | Bigger + closer = faster acquisition | Keep primary CTAs in the thumb zone on mobile (`>= 44×44pt` iOS / `>= 48×48dp` Android) |
| **Miller's Law** | `5 ± 2` items in working memory | Group navigation and dashboard KPIs into chunks of `3–5` cards |
| **Von Restorff Effect** | The distinct item is remembered | Limit primary accent color (`10%` budget) to **one primary CTA per viewport** |
| **Doherty Threshold** | `< 400ms` response feels instantaneous | Use optimistic UI updates (`useOptimistic` + `sonner` Undo toast) and skeleton shimmer |

---

## 3. Layout, Viewport & Bento Grid Architecture

1. **8-Point Spatial System & Concentric Radii**:
   - Spacing uses `4px` micro-steps and `8px` structural multiples (`8, 16, 24, 32, 48, 64, 96px`).
   - **Concentric Border Radius Formula**: `R_outer = R_inner + Padding` (e.g., outer card `rounded-2xl` `20px` with `p-2` `8px` padding requires inner container `rounded-xl` `12px`).
2. **Modern CSS Viewport & Container Queries**:
   - Always use **`min-h-dvh`** (dynamic viewport height) instead of `100vh` so mobile browser chrome never clips bottom CTAs.
   - Mark reusable cards and Bento cells with **`@container`** so internal layouts switch from stacked to horizontal based on component width (`@min-[520px]:flex-row`), not global screen width.
3. **Reading Measure & Text Wrapping**:
   - Constrain body prose strictly to **`45ch–68ch`** (`max-w-prose`) with `text-wrap: pretty`, and apply `text-wrap: balance` to all headings.

---

## 4. Perceptual Color Architecture (OKLCH First)

### 60-30-10 Allocation & Dark Mode Surface Elevation

```text
60% → Canvas & Primary Surfaces (calm neutral OKLCH base)
30% → Elevated Cards, Hairline Borders & Secondary Typography
10% → High-Conviction Accent (Primary CTA, active indicators, focus rings)
```

- **Why OKLCH (`oklch(L C H / alpha)`)**: Guarantees uniform perceived lightness across hues.
- **Dark Mode by Lightness Stepping (Never Black Drop Shadows)**:
  - Canvas: `oklch(0.12 0.012 H)` → Card: `oklch(0.155 0.014 H)` → Elevated: `oklch(0.19 0.016 H)` → Overlay: `oklch(0.225 0.018 H / 0.88)`.
  - Avoid pure `#000000` backgrounds with `#FFFFFF` text (prevents OLED halation/astigmatism blur).
- **CSS Relative Color Syntax**: Derive hover and subtle states dynamically via `oklch(from var(--color-primary) calc(l + 0.06) c h)`.

---

## 5. 3-Axis Typography System & `tabular-nums`

1. **3-Axis Font Pairing**:
   - **`--font-display`**: High-character editorial serif (*Instrument Serif*, *Newsreader*) or geometric display (*Geist*, *Space Grotesk*) with tight tracking (`-0.025em` to `-0.035em`) and tight leading (`1.06–1.15`).
   - **`--font-sans`**: Neutral, high-x-height UI sans (*Plus Jakarta Sans*, *Inter*, *Satoshi*) with `1.5–1.65` line height and `>= 16px` mobile input font size (prevents iOS Safari auto-zoom).
   - **`--font-mono`**: Technical monospace (*JetBrains Mono*, *Geist Mono*) for IDs, code, keyboard shortcuts, and metrics.
2. **Mandatory Tabular Numerals**:
   - Every number in a dashboard, price tag, timer, counter, or table cell MUST apply `font-variant-numeric: tabular-nums` (`tabular-nums` in Tailwind) so digits align vertically and never jitter during live updates.

---

## 6. Mandatory 5-State UI Completeness (`DESIGN-G2`)

Never ship a component or screen that only handles the happy path. Every view and interactive component MUST implement all **5 UI States**:

| State | Visual & Engineering Requirement |
|-------|----------------------------------|
| **1. `Default / Idle`** | Restrained hierarchy, `1px` hairline border (`var(--border-hairline)`), clear primary CTA |
| **2. `Loading / Skeleton`** | Geometry-matched shimmer skeleton (`animate-pulse` with `motion-reduce:animate-none`) preserving exact layout height (`CLS = 0`) |
| **3. `Empty State`** | First-run onboarding card with bespoke illustration/icon, concise value explanation, and 1-click primary action |
| **4. `Error State`** | Inline field error (`aria-invalid="true"`, `aria-describedby`) or non-destructive banner with actionable **Retry** button |
| **5. `Disabled / Focus-Visible / Success`** | Crisp `:focus-visible` ring (`2px` solid primary + `2px` offset), `disabled:opacity-50 disabled:pointer-events-none`, and optimistic `sonner` confirmation |

---

## 7. 3-Tier Motion & Choreography (60–120 FPS)

| Tier | Technology | Use Case |
|------|------------|----------|
| **Tier 1** | **Native CSS View Transitions API** (`document.startViewTransition`) | Route changes, tab content switches, and Bento grid filter sorting |
| **Tier 2** | **Pure CSS `@starting-style` & `animation-timeline: view()`** | Zero-JS dialog/popover entry/exit and off-main-thread scroll reveals |
| **Tier 3** | **`motion/react` (Motion v12 Springs)** (`stiffness: 420, damping: 32, mass: 0.8`) | Shared `layoutId` active pills, swipeable `vaul` drawers, and physics gestures |

- **Compositor-Only Rule**: Animate only `transform` and `opacity`.
- **Mandatory Accessibility**: Always honor `@media (prefers-reduced-motion: reduce)` and `useReducedMotion()`.

---

## 8. WCAG 2.2 AA Accessibility & Ergonomics Gate (`DESIGN-G3`)

Every UI component must pass **WCAG 2.2 Level AA** before completion:
- [ ] **Contrast Ratios (`1.4.3` & `1.4.11`)**: `>= 4.5:1` for normal text, `>= 3.0:1` for large text (`>= 18pt` or `14pt bold`) and functional UI borders/icons.
- [ ] **Target Size (`2.5.8` — WCAG 2.2 AA)**: Interactive targets are **at least `24×24 CSS px`** on desktop and **`>= 44×44pt` (`48×48dp`)** on mobile touchscreens.
- [ ] **Focus Not Obscured (`2.4.11` — WCAG 2.2 AA)** & **Focus Appearance**: Sticky headers/footers never cover the focused element (`scroll-padding-top`), and `:focus-visible` renders a crisp `2px` ring with `2px` offset.
- [ ] **Accessible Authentication (`3.3.8`) & Drag Alternatives (`2.5.7`)**: Never block paste (`onPaste`) on password/OTP fields; provide single-click buttons alongside any drag-and-drop or slider gesture.

---

## 9. End-to-End Verification Workflow

```text
1. RESEARCH & TOKENS → Run search.py --design-system & write DESIGN-{task}.md (design-spec + RequestFeedback: true)
2. STATIC GATE       → Run `boomopen design validate <DESIGN-{task}.md>` (verifies DESIGN-G1..G4 in < 50ms)
3. LIVE PREVIEW      → Render optional DESIGN-PREVIEW-{task}.html (generative_ui) & custom assets (image-generator)
4. 2-WAVE BUILD      → Wave 1 locks globals.css + primitives; Wave 2 shards screens in parallel (frontend-architecture)
5. RUNTIME AUDIT     → Run ux_audit.py + accessibility_checker.py (0 accessibility issues, PASS status)
```
