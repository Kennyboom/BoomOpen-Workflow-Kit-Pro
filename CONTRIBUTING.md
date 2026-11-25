# Contributing to BoomOpen Workflow Kit

Thank you for contributing to **BoomOpen Workflow Kit** (`@boomopen/workflow-kit` `v5.5.0`)! Please review these architecture, coding, and verification standards before opening an issue or pull request.

---

## 1. Source-Only Git Architecture

- **Zero Runtime Dependencies (`cli/`)**: The `boomopen` CLI (`cli/install.js` + `cli/*.js`) runs on **Node.js `>= 18.0.0`** using **built-in `node:*` modules only**. Do not add runtime `dependencies` to the root `package.json`.
- **Source-Only Distribution**: The kit is installed directly from Git (`git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git` + `node cli/install.js install <tool>` or `npm link`). `.releaserc.json` keeps `"npmPublish": false` — never add instructions pointing to an unpublished npm package.
- **5-Platform Parity**: Keep root entrypoints (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`) synchronized with their `platforms/<tool>/` templates (`<= 250` authored lines each) and preserve `<!-- BOOMOPEN-SETTINGS-START/END -->` markers.
- **Flat Commands & Specialist Agents**:
  - `commands/` must stay 100% flat (`commands/{cmd}.md` + `commands/{cmd}-{variant}.md`, `<= 450` lines each), with `_ref/` as the sole subdirectory.
  - `agents/*.md` (`22` specialists) and `agents/teams/*-team/` (`18` teams / `72` files) must stay `<= 450` lines each; `rules/*.md` (`7` files) must stay `<= 300` lines each.
  - When adding or modifying skills in `skills/` or `skills_library/` or domain maps in `matrix-skills/*.yaml`, rebuild the `O(1)` index with `node cli/install.js doctor --rebuild-index`.

---

## 2. Pragmatic 2-Tier Coding & Hygiene Standards

All JavaScript (`cli/`, `.github/scripts/`), TypeScript/React (`web/src/`), and Python (`scripts/`, `skills/**/scripts/`) changes must satisfy `boomopen check . --strict-phase --no-stubs`:

1. **Tier 1 — Strict Safety & Hygiene (Zero Tolerance)**:
   - Single Responsibility per module and function; `SCREAMING_SNAKE_CASE` for module constants; DRY (`>= 3` repetitions).
   - **Zero explicit `any`** in TypeScript (`unknown` + type narrowing or generics `<T>`).
   - **Zero debug `console.log`** in production UI/API/service modules, **zero deferred `TODO`/`FIXME` stubs**, and **zero `.skip`/`.only` test gaming**.
   - Explicit `try/catch` error handling at async, filesystem, and subprocess boundaries.
   - **100% LF (`\n`) line endings**, UTF-8 without mojibake, and **zero personal filesystem paths, usernames, or secrets**.
2. **Tier 2 — Cohesive File & Function Budgets**:
   - Target `~200–350` lines per source file; **`400` lines soft ceiling / `500` lines hard ceiling** (split `> 500` lines along cohesive responsibility boundaries; `*.test.*`, `*.d.ts`, and `documents/` are exempt from code line caps).
   - Keep logic functions around `~20–40` lines (`~40–80` lines for UI components), nesting `<= 4`, and parameters `<= 5`.

---

## 3. Local Development & Mandatory Verification

No `npm install` is needed to work on `cli/`, `commands/`, `agents/`, `rules/`, or `skills/`. If your change touches `web/`, run `npm --prefix web ci` (Node `20` or `22`) once first.

Run the full verification suite from the repository root before pushing:

```bash
# 1. Core syntax lint, 34 CLI/kit test suites, and web stats parity test
npm run lint && npm test && npm --prefix web test

# 2. Kit Markdown budgets, compact-index parity, and zero legacy/mojibake checks
node cli/install.js doctor --source-only

# 3. Pragmatic 2-Tier Coding Standards & Zero-Stub Phase Ratchet
node cli/install.js check . --strict-phase --no-stubs

# 4. Tarball allowlist & sandboxed install/uninstall smoke test (when touching cli/, platforms/, or package.json)
npm run test:pack
```

> **Sandbox Safety**: All CLI installer tests MUST use `cli/sandbox.test-helper.js` (`HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, `XDG_CONFIG_HOME` redirected to temp folders) and never touch a developer's real `~/` tool configs.

---

## 4. Pull Request & Commit Workflow

1. Fork the repository and create a focused branch from `main` (`feat/<topic>`, `fix/<topic>`, `docs/<topic>`).
2. Follow **Conventional Commits** (`feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, `test:`, `chore:`) as enforced by `.releaserc.json`.
3. If you change counts of commands, agents, teams, or skills, run `npm --prefix web run stats` so `web/src/data/kit-stats.json` and `web/public/llms.txt` stay in sync.
4. Open a Pull Request completing `.github/PULL_REQUEST_TEMPLATE.md`. All cross-OS CI checks (`.github/workflows/ci.yml` across Ubuntu, Windows, and macOS) must pass before merge.
5. For security vulnerabilities, **do not open a public issue or PR** — follow [SECURITY.md](./SECURITY.md) for private disclosure.
