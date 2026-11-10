---
name: webapp-testing
description: Web application testing principles. E2E, Playwright, Vitest + MSW v2, WCAG 2.2 accessibility, and deep audit strategies.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
---

# Web App Testing — Playwright E2E, Visual & WCAG 2.2 AA Verification (v5.5.0)

> **PURPOSE**: Verify real web applications end-to-end across routes, APIs, interactive states, and WCAG 2.2 AA accessibility — combining **Playwright resilient locators & traces**, **Vitest + MSW v2**, and **Zero-Test-Gaming CLI gates**.

---

## 🔧 Runtime Verification Scripts

| Script / CLI | Purpose | Canonical Command |
|--------------|---------|-------------------|
| `scripts/playwright_runner.py` | Live URL smoke check (Navigation Timing L2 + console errors) | `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py <url> [--screenshot]` |
| `scripts/playwright_runner.py --a11y` | Live DOM WCAG 2.2 AA landmarks, `html[lang]`, & accessible-label check | `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py <url> --a11y` |
| `scripts/playwright_runner.py --suite` | Execute project `npx playwright test` suite (`npx.cmd` safe on `win32`) | `python ~/.{TOOL}/skills/webapp-testing/scripts/playwright_runner.py --suite <project_path>` |
| `scripts/with_server.py` | Start ephemeral dev server, wait for port readiness, run E2E, kill process tree | `python ~/.{TOOL}/skills/webapp-testing/scripts/with_server.py --server "npm run dev" --port 3000 -- npx playwright test` |
| `accessibility_checker.py` | Static WCAG 2.2 AA audit on JSX/TSX/HTML/Vue/Svelte source files | `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path>` |
| `boomopen check` | Enforce `0` skipped/focused tests (`it.skip`/`test.only`) & `0` stubs | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 1. Systematic Web Audit & Route Discovery

1. **Map Routes & Entrypoints**: Enumerate Next.js `app/**/page.tsx`, Remix/React Router routes, Astro/SvelteKit pages, and API handlers (`app/api/**/route.ts`).
2. **Verify All 5 UI States per Critical View**: Assert `Default`, `Loading` (skeleton/`aria-busy`), `Empty` (zero-data CTA), `Error` (`role="alert"` recovery), and `Disabled`/`Focus` states defined in `DESIGN-{task}.md`.
3. **Capture Zero Console/Page Errors**: Attach `page.on('pageerror', ...)` and `page.on('console', ...)` listeners before `page.goto()` so hydration mismatches and uncaught exceptions fail the test immediately.

---

## 2. Playwright SOTA Locator, Auto-Wait & Trace Standards

### Locator Priority Hierarchy (Resilient to CSS Refactors)
1. **`page.getByRole('button', { name: 'Create workspace' })`** — Primary choice; validates WCAG accessible roles & names simultaneously.
2. **`page.getByLabel('Email address')` / `page.getByPlaceholder(...)`** — Form controls.
3. **`page.getByText(...)`** — Non-interactive copy & status banners.
4. **`page.getByTestId('checkout-summary')`** — Escape hatch for dynamic canvas/chart containers.
5. **NEVER** use brittle CSS class chains (`.div > .btn-primary:nth-child(3)`) or XPath!

### Web-First Assertions & Trace Configuration
```ts
import { expect, test } from '@playwright/test';

test('user completes checkout and sees receipt (AC-3)', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/checkout');
  await page.getByLabel('Cardholder name').fill('Alex Morgan');
  await page.getByRole('button', { name: /pay \$49\.00/i }).click();

  await expect(page).toHaveURL(/\/orders\/ord_/);
  await expect(page.getByRole('heading', { name: /payment confirmed/i })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
```

- **Playwright Config Defaults (`playwright.config.ts`)**:
  - `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
  - `retries: process.env.CI ? 2 : 0`, `fullyParallel: true`
  - Storage-state authentication fixtures (`storageState`) so non-auth specs skip repetitive UI logins.

---

## 3. WCAG 2.2 AA & Core Web Vitals E2E Gates

| Check | Requirement | How to Verify |
|-------|-------------|---------------|
| **Target Size (`WCAG 2.5.8`)** | Interactive controls `>= 24x24px` (`>= 44x44px` on touch viewports) | `accessibility_checker.py` + mobile viewport `{ width: 390, height: 844 }` |
| **Focus Visibility (`WCAG 2.4.7 / 2.4.11`)** | Every interactive control displays a clear `:focus-visible` ring not obscured by sticky headers | Keyboard `await page.keyboard.press('Tab')` + `expect(locator).toBeFocused()` |
| **Document Landmarks & Labels** | Valid `<html lang>`, single `<h1>`, `<main>`, `<nav>`, `alt` on `<img>`, `<label>` on inputs | `playwright_runner.py <url> --a11y` |
| **Interaction Responsiveness (`INP`)** | Zero main-thread freezes `> 200ms` during clicks/typing; zero layout shift (`CLS <= 0.1`) | Lighthouse / Performance Observer |

---

## 4. Zero-Test-Gaming & Anti-Flake Rules

| ❌ Anti-Pattern | ✅ SOTA Practice |
|----------------|-----------------|
| `await page.waitForTimeout(3000)` | Web-first auto-retrying assertions (`await expect(el).toBeVisible()`) |
| Sharing mutable DB rows across parallel workers | Isolated per-worker test tenants / transactional fixtures |
| Adding `test.skip` or `test.only` to silence CI | Fix root cause; preserve `READ_ONLY_FILES` regression specs intact |
| Mocking internal React components in integration tests | Use **Vitest + MSW v2** for fast component/network specs + Playwright for critical user journeys |

---

## 5. 2026 Specialized Web Testing & Accessibility Skills

| Testing Need | Skill Path |
|--------------|------------|
| Vitest + MSW v2 Component & Network Mocking | `../../skills_library/vitest-msw-testing-patterns/SKILL.md` (`skills_library/vitest-msw-testing-patterns/SKILL.md`) |
| WCAG 2.2 AA/AAA Accessibility & Keyboard/Focus Auditing | `../../skills_library/wcag-22-accessibility-ergonomics/SKILL.md` (`skills_library/wcag-22-accessibility-ergonomics/SKILL.md`) |
| Unit & Integration Test Patterns (`test_runner.py`) | `../testing-patterns/SKILL.md` (`skills/testing-patterns/SKILL.md`) |
