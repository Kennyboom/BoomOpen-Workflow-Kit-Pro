# BoomOpen Workflow Kit — Testing & Verification Standards

> **Purpose**: Complete inventory of the `34` active `node:test` suites, `sandbox.test-helper.js` home isolation, Zero-Test-Gaming laws, tarball smoke tests, and Python verification runners for `@boomopen/workflow-kit` v5.5.0
> **Parent**: [00-index.md](./00-index.md)
> **Last Updated**: 2026-11-25
> **Version**: 5.5.0

---

## Test Runner & Execution Commands

BoomOpen Workflow Kit (`v5.5.0`) uses the **Node.js built-in test runner** (`node:test` + `node:assert/strict`, Node `>= 18.0.0`) with **zero external test framework dependencies**, reinforced by cross-OS GitHub Actions CI ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) across Ubuntu, Windows, and macOS on Node `18`, `20`, and `22`.

| Command | Underlying Script | Scope & Purpose |
|---------|-------------------|-----------------|
| `npm test` | `node --test cli/*.test.js web/build/kit-stats.test.mjs` *(explicit list in `package.json`)* | Runs all **`34` active automated test suites** (`33` CommonJS suites in `cli/` + `1` ESM suite in `web/build/`). |
| `npm run test:unit` | `node --test ...` (`19` fast in-process suites) | Fast unit subset covering `audit`, `checker`, `codex-config`, `conductor`, `cook`, `design`, `doctor`, `hook-guard`, `hook-registration`, `instruction-files`, `ledger`, `plan`, `platform-content`, `reconcile`, `research`, `security-v6`, `settings`, `user-files`, and `v55-compilers`. |
| `npm run test:pack` | `node .github/scripts/pack-smoke.js` | Packs the npm tarball (lifecycle scripts disabled), extracts it in `os.tmpdir()`, verifies all `1,462` indexed `SKILL.md` files exist, and smoke-tests `install claude` -> `doctor` -> `uninstall claude` in a sandboxed `HOME`. |
| `npm run lint` | `node .github/scripts/check-syntax.js` | Runs `node --check` on every `.js`, `.mjs`, and `.cjs` file across `cli/`, `platforms/`, `.github/scripts/`, and `web/build/`. |
| `npm run check` | `node cli/install.js check` | Enforces Pragmatic 2-Tier Coding Standards (`400`/`500` lines, explicit `any`, production `console.log`); CI runs `check . --strict-phase --no-stubs`. |
| `npm run doctor` | `node cli/install.js doctor` | Verifies kit source files, Markdown line limits, mojibake, `compact-index.json` (`1,462` skills), installed platform homes, settings, and Conductor engines. |

---

## Inventory of the `34` Active `node:test` Suites

Tests are co-located alongside source modules in `cli/*.test.js` (`33` suites, excluded from npm tarballs via `"!cli/*.test.js"` in `package.json`) plus [`web/build/kit-stats.test.mjs`](../../web/build/kit-stats.test.mjs):

| Category | Count | Suite Files | What They Verify |
|----------|:-----:|-------------|------------------|
| **1. Installer, Ownership, Safety & Packaging** | `8` | `install.test.js`, `install-cli.test.js`, `install-safety.test.js`, `install-repairs.test.js`, `install-regressions.test.js`, `user-files.test.js`, `codex-config.test.js`, `packaging.test.js` | Multi-platform install/uninstall across all `5` assistants, shared `~/.agents/skills_library` deduplication, SHA-256 `~/.boomopen/manifests/<tool>.json` ownership, non-destructive user file preservation & backups, TOML-aware `~/.codex/config.toml` merge, and `package.json` `files` packaging rules. |
| **2. Deterministic Compilers, Reconcile, Audit, Ledger & Conductor** | `9` | `research.test.js`, `design.test.js`, `plan.test.js`, `cook.test.js`, `reconcile.test.js`, `audit.test.js`, `ledger.test.js`, `conductor.test.js`, `v55-compilers.test.js` | `RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `cook` Fast-Forward & `COOK-G1..G4`, Wave 2.5 `reconcile` (`REC-G1..G4`), stateful multi-round `audit` + Git checkpoint `rollback`, `.boomopen/project-ledger.json` Spec-Hash Drift Guard + `rollback`, and Cross-Engine `conduct`. |
| **3. Health Diagnostics, Code Checker, Security v6 & Hooks** | `5` | `doctor.test.js`, `checker.test.js`, `security-v6.test.js`, `hook-guard.test.js`, `hook-registration.test.js` | `boomopen doctor` source/platform/index checks, `boomopen check` (`400`/`500` ceilings, TypeScript `any`, `console.log`, `--strict-phase --no-stubs`), `security_scan.py` v6 corpus, `validate-tool-call.mjs` + `stop-quality-gate.mjs`, and `--with-hooks` registration across Antigravity, Claude Code, and Cursor. |
| **4. Settings Control Center & Web UI** | `3` | `settings.test.js`, `settings-e2e.test.js`, `settings-ui.test.js` | Preset switching (`frontier-guardrails` default, `carbon-guardrails` alias, `smart-hybrid`, `solo-fast`, `deep-architect`, `adversarial-team`), lossless round-trip template cache, `< 10ms` AOT marker sync, and CSP-hardened HTTP Control Center (`127.0.0.1:4567`). |
| **5. Kit Content, Skills Vault, Python & E2E** | `8` | `cli-e2e.test.js`, `docs-content.test.js`, `instruction-files.test.js`, `platform-content.test.js`, `content-integrity.test.js`, `vault-content.test.js`, `python-scripts.test.js`, `lighthouse-audit.test.js` | End-to-end subprocess CLI runs, `13` entrypoint parity & `DOC_LINE_LIMITS`, `16` `i18n/README.*.md` checks, zero mojibake/personal paths/leaked secrets, `1,462`-skill vault integrity, and Python helper CLI execution. |
| **6. Website Stats Generator (ESM)** | `1` | `web/build/kit-stats.test.mjs` | Verifies YAML frontmatter parsing, flat command variant grouping, domain skill counts, and `kit-stats.json` synchronization for `web/`. |

---

## Hermetic Sandboxed Home Isolation (`cli/sandbox.test-helper.js`)

No test is ever permitted to read from or write to a developer's real home profile (`~/.gemini`, `~/.claude`, `~/.codex`, `~/.cursor`, `~/.copilot`, `~/.boomopen`, or VS Code user prompts). Shared helper [`cli/sandbox.test-helper.js`](../../cli/sandbox.test-helper.js) enforces full environment isolation:

- **`sandboxEnv(home)`**: Redirects `HOME`, `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, and `XDG_CONFIG_HOME` into a unique `os.tmpdir()` directory before loading CLI modules or spawning child processes.
- **`buildFixtureKit()`**: Copies the kit (`cli`, `agents`, `commands`, `rules`, `documents`, `matrix-skills`, `skills`, `platforms`, `scripts`, and root entry files) into a temp directory without copying the `1,440`-skill `skills_library/` vault, keeping E2E installer tests fast and leaving the repository working tree untouched.
- **`runCli(kitRoot, home, args)`**: Executes `node <kitRoot>/cli/install.js` inside the sandboxed environment and returns `{ status, stdout, stderr }`.

### Idiomatic Test Pattern

```javascript
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { tempDir, removeDir, sandboxEnv, buildFixtureKit, runCli } = require('./sandbox.test-helper.js');

test('boomopen install claude creates isolated manifest and passes doctor', (t) => {
  const kitRoot = buildFixtureKit();
  const home = tempDir('boomopen-home-');
  t.after(() => {
    removeDir(kitRoot);
    removeDir(home);
  });

  const installRes = runCli(kitRoot, home, ['install', 'claude']);
  assert.equal(installRes.status, 0, installRes.stderr);

  const doctorRes = runCli(kitRoot, home, ['doctor', '--platform', 'claude']);
  assert.equal(doctorRes.status, 0, doctorRes.stdout);
  assert.ok(Object.keys(sandboxEnv(home)).includes('USERPROFILE'));
});
```

---

## Zero-Test-Gaming Standards (`v5.5.0`)

Both the kit's own codebase and projects built with BoomOpen workflows (`/cook`, `/code`, `/test`, `/fix`, `/autopilot`, `/conduct`) enforce strict anti-test-gaming guarantees:

1. **`READ_ONLY_FILES` Regression Test Locks**: Existing regression test files are placed in `READ_ONLY_FILES` within 5-Field Wave Handoff Packets (`boomopen cook packets`) and guarded via SHA-256 file hashes (`boomopen cook verify-wave` and `boomopen conduct dispatch`). Executor shards cannot delete, weaken, or rewrite locked tests to make a failing build turn green.
2. **Static Anti-Gaming Gate (`boomopen check --strict-phase --no-stubs`)**:
   - `findTestGaming()` in [`cli/checker-rules.js`](../../cli/checker-rules.js) rejects skipped, focused, or deferred test declarations (`it.skip`, `test.only`, `describe.todo`) and vacuous assertions (`expect(true).toBe(true)` / `expect(1).toEqual(1)`).
   - `findHollowStub()` rejects test doubles (`vi.mock`, `jest.mock`, `spyOn`) leaked into non-test production files as well as unimplemented stub throws.
3. **TDD Given/When/Then Traceability**: Enforced via [`skills/tdd-workflow/SKILL.md`](../../skills/tdd-workflow/SKILL.md) and [`skills/testing-patterns/SKILL.md`](../../skills/testing-patterns/SKILL.md), mapping `PLAN-{task}.md` acceptance criteria directly to real assertions.

---

## Python Verification Runners (`scripts/`)

Alongside the Node.js CLI test suites, `scripts/` ships `7` cross-platform Python (`>= 3.10`, `sys.dont_write_bytecode = True`) verification and orchestration helpers tested by [`cli/python-scripts.test.js`](../../cli/python-scripts.test.js) and compiled in CI:

| Script | Purpose |
|--------|---------|
| [`scripts/checklist.py`](../../scripts/checklist.py) | Incremental priority validation runner (`P0` Security Scan -> `P1` Type/API Quality -> `P2` Schema Validation -> `P3` Test Runner -> `P4` UX & Accessibility -> `P5` SEO/GEO/i18n -> optional `--url` `P6` Lighthouse & Playwright E2E). |
| [`scripts/verify_all.py`](../../scripts/verify_all.py) | Full pre-deployment verification suite covering OWASP + LLM/Agentic Security, API & Schema validation, Test Suites, UX & WCAG 2.2 AA Accessibility, SEO/GEO, Core Web Vitals (`LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`), Playwright E2E, Mobile UX, and i18n. |
| `scripts/kit_checks.py`, `kit_console.py`, `kit_process.py` | Shared check specification runner, UTF-8 terminal reporter, and subprocess timeout/process-tree cleanup utilities. |
| `scripts/auto_preview.py`, `session_manager.py` | Local dev-server lifecycle manager (`/preview`) and session state inspector (`/save`, `/recap`, `/status`). |

---

## Remaining Testing Gaps (`v5.5.0`)

| Area | Current State | Notes |
|------|---------------|-------|
| **Numeric coverage threshold** | Not gated | All `34` suites run on `9` OS/Node combinations in CI, but `--experimental-test-coverage` / `c8` percentage thresholds are not enforced. |
| **`web/src/` React component unit tests** | Not present | Data generation is unit-tested in `web/build/kit-stats.test.mjs` and the app is gated by ESLint 9 + `tsc -b && vite build` in CI, without Vitest/RTL DOM component tests. |

---

## Evidence Sources

| Source | Path |
|--------|------|
| Package manifest (`test`, `test:unit`, `test:pack`, `lint`) | [../../package.json](../../package.json) |
| Hermetic sandbox test helper | [../../cli/sandbox.test-helper.js](../../cli/sandbox.test-helper.js) |
| CLI & content test suites | [../../cli/install.test.js](../../cli/install.test.js), [../../cli/checker.test.js](../../cli/checker.test.js), [../../cli/docs-content.test.js](../../cli/docs-content.test.js) |
| Zero-Test-Gaming & stub rules | [../../cli/checker-rules.js](../../cli/checker-rules.js) |
| Tarball smoke test | [../../.github/scripts/pack-smoke.js](../../.github/scripts/pack-smoke.js) |
| Cross-OS CI test matrix | [../../.github/workflows/ci.yml](../../.github/workflows/ci.yml) |
| Website build unit test | [../../web/build/kit-stats.test.mjs](../../web/build/kit-stats.test.mjs) |
| Python verification runners | [../../scripts/checklist.py](../../scripts/checklist.py), [../../scripts/verify_all.py](../../scripts/verify_all.py) |
