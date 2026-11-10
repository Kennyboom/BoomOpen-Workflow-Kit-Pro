# BoomOpen Workflow Kit Pro — v5.5 Bilingual Flagship Website

Official bilingual (`EN / VI`) developer showcase and interactive catalog for **[BoomOpen-Workflow-Kit-Pro](https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro)** (`v5.5.0`), the Smart-Hybrid Multi-Agent AI Workforce Operating System across **Google Antigravity 2.0**, **Claude Code**, **OpenAI Codex**, **Cursor**, and **GitHub Copilot**.

## Highlights

- **Obsidian Tungsten & Forge Amber OKLCH Design System**: Perceptual Tailwind v4 `@theme inline` tokens (`Space Grotesk` + `Plus Jakarta Sans` + `JetBrains Mono` with `tabular-nums`), WCAG 2.2 AA `44x44px` hit targets, and full `prefers-reduced-motion` compliance.
- **Instant Bilingual (`EN / VI`) Experience**: Header toggle persists `'en' | 'vi'` in `localStorage` (`boomopen-locale`), synchronizes `document.documentElement.lang`, updates runtime `<head>` metadata + JSON-LD, and dynamically swaps the Full HD 1080p Launch Trailer between `/media/boomopen_v55_trailer_en.mp4` (`poster_en.png`) and `/media/boomopen_v55_trailer_vi.mp4` (`poster_vi.png`).
- **Zero-Drift Repository Telemetry (`build/kit-stats.mjs`)**: Regenerates `src/data/kit-stats.json` plus static `public/{robots.txt,sitemap.xml,llms.txt}` directly from repository ground truth (`32` slash commands / `84` files, `21` specialist agents, `18` Elastic Golden Diamond teams / `72` files, `1,462` indexed skills across `19` domains, `5` platforms, `17` locales).
- **Interactive Visualizers & Searchable Catalogs**:
  - `TIER 0` Direct vs `TIER 1` 3-Wave Contract-First Swarm Visualizer + Multi-Engine Council (`Author != Critic`)
  - `12`-Command Deterministic CLI Compilers & Gates Playground (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `check --strict-phase --no-stubs`, `settings --ui`, `doctor`)
  - Searchable & filterable catalogs across `/commands`, `/agents`, `/skills`, `/architecture`, and `/install`
- **Zero Git Media Duplication (`build/site-plugin.ts`)**: Streams `../assets/media/*` with HTTP `206 Partial Content` range support during `vite` dev and emits `dist/media/*` plus pre-rendered per-route `.html` heads during `vite build`.

## Development & Verification

```bash
npm install
npm run dev                         # Regenerates kit-stats.json + discovery files, starts Vite dev server
npm run lint                        # ESLint flat config (React 19 + TypeScript strict)
npm run build                       # kit-stats.mjs + tsc -b + vite build -> dist/
node --test build/kit-stats.test.mjs
```

## Safe Repository Installation Reference

BoomOpen Workflow Kit Pro is distributed exclusively from GitHub (never published on npm):

```bash
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
node cli/install.js install antigravity   # antigravity | claude | codex | cursor | copilot | --all
node cli/install.js doctor
```

## Project Layout

```text
build/
├── kit-stats.mjs        # Syncs src/data/kit-stats.json + public/{robots.txt,sitemap.xml,llms.txt}
├── kit-stats.test.mjs   # Enforces 100% parity between web/src/data/* and repository files on disk
└── site-plugin.ts       # Pre-renders per-route SEO heads + JSON-LD + serves/copies ../assets/media/*
src/
├── components/
│   ├── catalogs/        # CommandRowCard & TeamDiamondCard
│   ├── home/            # TrailerPlayer, SwarmVisualizer & CliPlayground
│   ├── layout/          # Header (EN/VI toggle), Footer & persistent Suspense Layout
│   ├── seo/             # Runtime localized <head> & JSON-LD manager
│   └── ui/              # 5-State OKLCH Primitives
├── data/                # kitStats, seoRoutes, platforms, cliSuite, commands, agents, teams, skills
├── hooks/               # useCopyCommand clipboard hook
├── i18n/                # LanguageProvider + natural EN & VI dictionaries
├── pages/               # HomePage, CommandsPage, AgentsTeamsPage, SkillsPage, ArchitecturePage, InstallPage, NotFoundPage
├── styles/              # Tailwind v4 OKLCH globals.css
└── types/               # Locked ui-contract.ts interfaces
```

## License

MIT License — see `../LICENSE`.
