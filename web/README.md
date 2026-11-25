# BoomOpen Workflow Kit Pro | v5.5 Documentation & Catalog Site

Bilingual (`EN / VI`) documentation site (**[boomopen.com](https://boomopen.com)**) and searchable catalog for **[BoomOpen-Workflow-Kit-Pro](https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro)** (`v5.5.0`), supporting **Google Antigravity 2.0**, **Claude Code**, **OpenAI Codex**, **Cursor**, and **GitHub Copilot**.

## Highlights

- **Accessible Dark UI System**: Tailwind v4 `@theme inline` tokens (`Plus Jakarta Sans` + `JetBrains Mono` with `tabular-nums`), WCAG 2.2 AA `44x44px` hit targets, and `prefers-reduced-motion` support.
- **Bilingual (`EN / VI`) Runtime**: Header switch persists `'en' | 'vi'` in `localStorage` (`boomopen-locale`), updates `document.documentElement.lang`, localized `<head>` tags, JSON-LD, and swaps the 1080p walkthrough video between `/media/boomopen_v55_trailer_en.mp4` (`poster_en.png`) and `/media/boomopen_v55_trailer_vi.mp4` (`poster_vi.png`).
- **Repository-Synced Telemetry (`build/kit-stats.mjs`)**: Compiles `src/data/kit-stats.json` and `public/{robots.txt,sitemap.xml,llms.txt}` directly from repository files (`frontier-guardrails` `< 2.3 KB` default preset, `36` slash commands across `93` files = `87` workflows + `6` `_ref`, `22` sub-agents, `18` 3-role review teams across `72` files, `14` CLI commands, and `1,462` indexed skills across `19` domains).
- **Interactive Explorers**:
  - Default `frontier-guardrails` direct mode vs 3-Wave + Wave 2.5 (`boomopen reconcile` `REC-G1..G4`) parallel sharding and Multi-Engine Council (`Author != Critic`)
  - 14-command CLI Playground (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`, `REC-G1..G4`, `audit`, `ledger`, `conduct`, `check --strict-phase --no-stubs`, `settings --ui`, `doctor`)
  - Searchable catalogs across `/commands`, `/agents`, `/skills`, `/architecture`, and `/install`
- **Streaming Media & Static Route Heads (`build/site-plugin.ts`)**: Serves `../assets/media/*` with HTTP `206 Partial Content` range support in `vite` dev and emits `dist/media/*` plus per-route `.html` metadata during `vite build`.

## Development & Verification

```bash
npm install
npm run dev                         # Regenerates kit-stats.json + discovery files, starts Vite dev server
npm run lint                        # ESLint flat config (React 19 + TypeScript strict)
npm run build                       # kit-stats.mjs + tsc -b + vite build -> dist/
node --test build/kit-stats.test.mjs
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
├── kit-stats.mjs        # Syncs src/data/kit-stats.json + public/{robots.txt,sitemap.xml,llms.txt}
├── kit-stats.test.mjs   # Enforces parity between web/src/data/* and repository files on disk
└── site-plugin.ts       # Pre-renders per-route SEO heads + JSON-LD + serves/copies ../assets/media/*
src/
├── components/
│   ├── catalogs/        # CommandRowCard & TeamDiamondCard
│   ├── home/            # TrailerPlayer, SwarmVisualizer & CliPlayground
│   ├── layout/          # Header (EN/VI toggle), Footer & persistent Suspense Layout
│   ├── seo/             # Runtime localized <head> & JSON-LD manager
│   └── ui/              # 5-state accessible UI primitives
├── data/                # kitStats, seoRoutes, platforms, cliSuite, commands, agents, teams, skills
├── hooks/               # useCopyCommand clipboard hook
├── i18n/                # LanguageProvider + EN & VI dictionaries
├── pages/               # HomePage, CommandsPage, AgentsTeamsPage, SkillsPage, ArchitecturePage, InstallPage, NotFoundPage
├── styles/              # Tailwind v4 globals.css
└── types/               # Locked ui-contract.ts interfaces
```

## License

MIT License. See `../LICENSE`.
