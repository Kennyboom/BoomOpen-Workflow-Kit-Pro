# BoomOpen Workflow Kit Pro | v5.5 Documentation & Catalog Site

15-language Cosmic WebGL documentation site (**[boomopen.com](https://boomopen.com)**) and searchable catalog for **[BoomOpen-Workflow-Kit-Pro](https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro)** (`v5.5.0`), supporting **Google Antigravity 2.0**, **Claude Code**, **OpenAI Codex**, **Cursor**, and **GitHub Copilot**.

## Highlights

- **Cosmic Deep-Space UI & WebGL Backdrop**: Tailwind v4 `@theme inline` tokens (`Plus Jakarta Sans` + `JetBrains Mono` with `tabular-nums`), custom `gl.POINTS` SDF micro-glyph forcefield (`CosmicGlyphCanvas.tsx`), WCAG 2.2 AA `44x44px` hit targets, and `prefers-reduced-motion` support.
- **15 Native Localizations + RTL**: Header language menu persists `'en' | 'vi' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt-BR' | 'ru' | 'hi' | 'ar' | 'id' | 'th'` in `localStorage` (`boomopen-locale`) with lazy Vite chunks, `hreflang` alternates, Arabic `dir="rtl"`, localized JSON-LD, and 1080p walkthrough videos (`boomopen_v55_trailer_en.mp4` / `boomopen_v55_trailer_vi.mp4`).
- **Repository-Synced Telemetry (`build/kit-stats.mjs`)**: Compiles `src/data/kit-stats.json` and `public/{robots.txt,sitemap.xml,llms.txt}` directly from repository files (`smart-hybrid` default preset + `< 2.3 KB` `frontier-guardrails` slim preset, `36` slash commands across `93` files = `87` workflows + `6` `_ref`, `22` sub-agents, `18` 3-role review teams across `72` files, `14` CLI commands, and `1,462` indexed skills across `19` domains).
- **Interactive Explorers**:
  - `smart-hybrid` 3-Wave + Wave 2.5 (`boomopen reconcile` `REC-G1..G4`) parallel sharding, `< 2.3 KB` `frontier-guardrails` direct mode, and Multi-Engine Council (`Author != Critic`)
  - 14-command CLI Playground (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `REC-G1..G4`, `audit`, `ledger`, `conduct`, `check --strict-phase --no-stubs`, `settings --ui`, `doctor`)
  - Searchable catalogs across `/commands`, `/agents`, `/skills`, `/architecture`, and `/install`
- **Streaming Media & Static Route Heads (`build/site-plugin.ts`)**: Serves `../assets/media/*` with HTTP `206 Partial Content` range support in `vite` dev and emits `dist/media/*` plus per-route `.html` metadata during `vite build`.

## Development & Verification

```bash
npm install
npm run dev                         # Regenerates kit-stats.json + discovery files, starts Vite dev server
npm run lint                        # ESLint flat config (React 19 + TypeScript strict)
npm run build                       # kit-stats.mjs + tsc -b + vite build -> dist/
npm test                            # Runs build/kit-stats.test.mjs + build/i18n-locales.test.mjs
```

## Git Installation Reference

BoomOpen Workflow Kit Pro is distributed exclusively via Git (never published on npm):

```bash
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
node cli/install.js install antigravity   # antigravity | claude | codex | cursor | copilot | --all
node cli/install.js doctor
```

## Project Layout

```text
build/
├── i18n-locales.test.mjs # Verifies 15 locales, 26 catalog chunks, LF endings, <= 385L & RTL
├── kit-stats.mjs         # Syncs src/data/kit-stats.json + public/{robots.txt,sitemap.xml,llms.txt}
├── kit-stats.test.mjs    # Enforces parity between web/src/data/* and repository files on disk
└── site-plugin.ts        # Pre-renders per-route SEO heads + JSON-LD + serves/copies ../assets/media/*
src/
├── components/
│   ├── catalogs/         # CommandRowCard & TeamDiamondCard
│   ├── home/             # TrailerPlayer, SwarmVisualizer & CliPlayground
│   ├── layout/           # Header (15-language switcher), Footer, CosmicBackdrop & CosmicGlyphCanvas
│   ├── seo/              # Runtime localized <head>, hreflang & JSON-LD manager
│   └── ui/               # 5-state accessible UI primitives
├── data/                 # kitStats, seoRoutes, platforms, cliSuite, commands, agents, teams, skills
├── hooks/                # useCopyCommand clipboard hook
├── i18n/                 # LanguageProvider, EN/VI core + lazy locales/* and catalogs/* (15 languages)
├── pages/                # HomePage, CommandsPage, AgentsTeamsPage, SkillsPage, ArchitecturePage, InstallPage, NotFoundPage
├── styles/               # Tailwind v4 cosmic deep-space globals.css
└── types/                # Locked ui-contract.ts interfaces
```

## License

MIT License. See `../LICENSE`.
