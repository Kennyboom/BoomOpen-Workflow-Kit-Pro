---
description: "🎨 UI/UX Pro Max — Empirical design intelligence (50+ styles, 97 palettes, 57 font pairings) + 2026 OKLCH @theme tokens, 6-Block DESIGN_CONTRACT & 4-Gate CLI validation"
version: "5.5"
category: design
execution-mode: execute
---

# /ui-ux-pro-max — Empirical Design System Generator & 2026 Visual Craft Engine

> **MISSION**: Combine the searchable empirical database (`~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py`: 50+ styles, 97 industry palettes, 57 font pairings, 99 UX rules, 25 chart types across 11 stacks) with BoomOpen v5.5's **2026 OKLCH Token Architecture**, **Anti-AI-Slop Visual Craft**, **WCAG 2.2 AA Ergonomics**, and **Deterministic 4-Gate `DESIGN-{request}.md` Validation (`boomopen design validate`)**.

<request>$ARGUMENTS</request>

---

## 📂 ANTIGRAVITY 2.0 CLEAN GIT TREE ROUTING (BRAIN ARTIFACTS FIRST)

- **Default Deliverable Path (Clean Git Tree)**: Write `<appDataDir>\brain\<conversation-id>\DESIGN-{request}.md` as **1 single cohesive 6-Block file (`<= 500` lines, NEVER split at 150 lines)** with `ArtifactMetadata: { Summary: "...", UserFacing: true, RequestFeedback: true }` so Antigravity 2.0 renders the native 1-click **"Proceed"** button.
- **Optional Interactive HTML Prototype (`generative_ui`)**: Write `<appDataDir>\brain\<conversation-id>\DESIGN-PREVIEW-{request}.html` (`UserFacing: true, RequestFeedback: false`) using `https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js`.
- **Workspace Export Fallback**: Only write to `./reports/{topic}/designs/DESIGN-{request}.md` or `./design-system/MASTER.md` when running on non-Antigravity tools or when the user explicitly asks to commit design docs to the repository.

---

## 🚀 STEP-BY-STEP WORKFLOW

### Step 1: Extract Product, Industry, Archetype & Stack Context
Identify from `<request>`:
- **Product & Industry**: SaaS, fintech, healthcare, e-commerce, AI workbench, developer tool, gaming, luxury, etc.
- **Named Aesthetic Archetype**: `swiss-editorial`, `linear-technical-dark`, `luxury-minimal`, or `tactile-neo-brutalist` (`skills/frontend-design/SKILL.md`).
- **Target Stack**: `nextjs`, `react`, `shadcn`, `html-tailwind` (default), `vue`, `nuxtjs`, `svelte`, `swiftui`, `react-native`, `flutter`.

### Step 2: Run the Empirical Design System Generator (`--design-system`)
Run `search.py` (uses Python 3.10+ standard library; use `python3`, `python`, or `py -3` on Windows):

```bash
python3 ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <style_keywords>" --design-system -p "<Project Name>" -f markdown
```

Supplement with targeted domain or stack queries as needed:
```bash
# Domain searches: product | style | typography | color | landing | chart | ux | react | web | icons
python3 ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "animation accessibility focus" --domain ux

# Stack guidelines: html-tailwind | react | nextjs | shadcn | vue | svelte | swiftui | react-native | flutter
python3 ~/.{TOOL}/skills_library/ui-ux-pro-max/scripts/search.py "layout responsive form" --stack shadcn
```

### Step 3: Upgrade Palette & Typography to 2026 OKLCH + Tailwind v4 `@theme inline` (`DESIGN_CONTRACT`)
Convert the recommended palette and font pairing from `search.py` into **perceptual OKLCH tokens with sRGB `#hex` fallbacks**, a **4-step surface elevation ladder**, and **3-axis typography (`--font-display`, `--font-sans`, `--font-mono` with `tabular-nums`)**:

```css
@layer base {
  :root {
    /* 4-Step OKLCH Surface Elevation Ladder (+ sRGB Hex Fallback) */
    --surface-canvas: #0B0D13;
    --surface-canvas: oklch(0.12 0.012 260);
    --surface-card: #12151E;
    --surface-card: oklch(0.155 0.014 260);
    --surface-elevated: #1A1E2B;
    --surface-elevated: oklch(0.19 0.016 260);
    --surface-overlay: oklch(0.225 0.018 260 / 0.88);
    --border-hairline: oklch(1 0 0 / 0.08);
    --specular-top: inset 0 1px 0 0 oklch(1 0 0 / 0.07);

    /* Text Hierarchy (WCAG 2.2 AA >= 4.5:1 Contrast Verified) */
    --text-primary: #F8FAFC;
    --text-primary: oklch(0.98 0.005 260);
    --text-secondary: #94A3B8;
    --text-secondary: oklch(0.71 0.015 260);

    /* High-Conviction Accent (10% Viewport Budget — Zero #6366f1->#a855f7 Slop) */
    --primary: #3B82F6;
    --primary: oklch(0.68 0.18 255);
    --primary-hover: oklch(from var(--primary) calc(l + 0.06) c h);

    /* Concentric Border Radius (R_outer = R_inner + Padding) & Scroll Padding */
    --radius-outer: 20px;
    --radius-inner: 12px;
    --sticky-header-offset: 4.5rem;
  }
}

@theme inline {
  --color-canvas: var(--surface-canvas);
  --color-card: var(--surface-card);
  --color-elevated: var(--surface-elevated);
  --color-hairline: var(--border-hairline);
  --color-primary: var(--primary);
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Step 4: Author the Cohesive 6-Block `DESIGN-{request}.md` & Validate via CLI
Write `<appDataDir>\brain\<conversation-id>\DESIGN-{request}.md` (`ArtifactMetadata.RequestFeedback: true`) containing all **6 Mandatory Blocks**:
1. **Block 1 — Problem, Aesthetic Direction & Anti-Slop Charter** (60-30-10 allocation, zero emoji icons, zero `grid-cols-3` equal cards, zero `blur-3xl` neon blobs).
2. **Block 2 — Information Architecture, Responsive Breakpoint Matrix (`320px`/`768px`/`1024px`/`1440px`) & Mermaid Flow** (`min-h-dvh`, `@container`, Asymmetric Bento Grid).
3. **Block 3 — 5-State Component Matrix** (`Default/Idle`, `Loading Skeleton` with `150ms` delay / `400ms` min hold & `CLS = 0`, `Empty State`, `Error Recovery` with `role="alert"`, `Disabled & Focus-Visible`).
4. **Block 4 — WCAG 2.2 AA & Core Web Vitals Spec** (`>= 4.5:1` contrast, `SC 2.5.8` `>= 24x24px` web / `>= 44x44pt` mobile targets, `SC 2.4.11` `scroll-padding-top`, `SC 2.5.7` drag alternatives, `SC 3.3.8` accessible auth, `prefers-reduced-motion: reduce`, `tabular-nums`).
5. **Block 5 — Fenced `DESIGN_CONTRACT`** (CSS `@theme inline` block + TypeScript component prop / 5-state interface block).
6. **Block 6 — 4-Gate CLI Validation (`DESIGN-G1..G4`)**:
   ```bash
   node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate "<appDataDir>/brain/<conversation-id>/DESIGN-{request}.md"
   ```

---

## 🌊 2-WAVE FRONTEND SHARDING RULE (WHEN IMPLEMENTING UI CODE ACROSS `> 3` FILES)

When transitioning from `DESIGN-{request}.md` into `/plan`, `/code`, or `/cook` across multiple UI files:
1. **Extract Contract**: Run `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design contract "<design-path>"` and embed `DESIGN_CONTRACT` into `PLAN-{request}.md` (`SHARED_CONTRACT`).
2. **Wave 1 (`frontend-engineer#tokens-primitives`, `<= 4 OWNED_FILES`)**: Writes `globals.css` (`@theme inline` tokens), shared primitive components (`src/components/ui/*`), and shared TypeScript prop contracts first.
3. **Wave 2 (`frontend-engineer#screen-1..k`, `Depends On: Wave 1`, `Parallelizable: Yes`)**: Implements feature screens/views in parallel (`<= 3–4` files per shard) with Wave 1's token & primitive files locked in `READ_ONLY_FILES` — guaranteeing **zero file-lock collisions (`PLAN-G3`)** and **100% visual consistency**.
4. **Post-Code Verification**:
   ```bash
   python3 ~/.{TOOL}/skills/frontend-design/scripts/ux_audit.py <project_path>
   python3 ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>
   ```

---

## 📋 PRE-DELIVERY PROFESSIONAL UI CHECKLIST

- [ ] **Zero AI Slop**: Named aesthetic archetype locked; no `#6366f1 -> #a855f7` gradients; no emoji icons (SVG Lucide/Heroicons `24x24` viewBox only); `tabular-nums` on all numeric metrics.
- [ ] **5 Mandatory UI States**: `Default`, `Loading Skeleton` (`150ms` delay / `400ms` hold, `CLS = 0`), `Empty State`, `Error Recovery` (`role="alert"`), `Disabled & Focus-Visible`.
- [ ] **WCAG 2.2 AA Verified**: Contrast `>= 4.5:1` (`>= 3:1` UI), hit targets `>= 24x24px` web / `>= 44x44pt` mobile (`SC 2.5.8`), `scroll-padding-top` (`SC 2.4.11`), drag alternatives (`SC 2.5.7`), `prefers-reduced-motion: reduce`.
- [ ] **Responsive & Viewport Hygiene**: `min-h-dvh` (never `100vh`), `@container` queries, tested at `320px`, `768px`, `1024px`, `1440px` with zero horizontal scroll.
- [ ] **CLI Gate Passed**: `boomopen design validate` exits `0`.
