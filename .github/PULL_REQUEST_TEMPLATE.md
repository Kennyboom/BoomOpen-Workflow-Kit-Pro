## Summary

<!-- Briefly describe what this PR changes and why. Link any related issue (e.g. Closes #123). -->

## Scope of Changes

- [ ] `cli/` — Installer, settings, or deterministic compilers (`zero` runtime npm dependencies)
- [ ] `commands/` / `agents/` / `rules/` — Workflow commands (`<= 450`L), agents/teams (`<= 450`L), or rules (`<= 300`L)
- [ ] `platforms/` & root entrypoints — Synced across all 5 IDEs (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `COPILOT.md`, `CURSOR.md`, `AGENT.md`)
- [ ] `skills/` / `skills_library/` / `matrix-skills/` — Rebuilt `compact-index.json` (`doctor --rebuild-index`)
- [ ] `documents/` / `i18n/` / `web/` — Documentation, localized READMEs, or web showcase (`npm --prefix web run stats`)

## Verification Checklist

- [ ] `npm run lint` passes (`0` syntax errors)
- [ ] `npm test` passes (all `node:test` suites in sandboxed `HOME`)
- [ ] `npm --prefix web test` passes (`kit-stats.json` & discovery files in sync)
- [ ] `node cli/install.js doctor --source-only` passes (`0` line-budget, mojibake, or index errors)
- [ ] `node cli/install.js check . --strict-phase --no-stubs` passes (Pragmatic 2-Tier `400/500`L, `0` explicit `any`, `0` debug `console.log`, `0` stubs)
- [ ] 100% LF (`\n`) line endings and zero personal paths, usernames, or secrets
