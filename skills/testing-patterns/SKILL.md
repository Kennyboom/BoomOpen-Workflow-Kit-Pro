---
name: testing-patterns
description: Testing patterns and principles. Unit, integration, mocking strategies, Vitest + MSW v2, and WCAG 2.2 accessibility verification.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
---

# Testing Patterns — Deterministic Multi-Layer Verification (v5.5.0)

> **PURPOSE**: Build fast, deterministic, zero-flake test suites across unit, integration, contract, and accessibility layers — enforcing **Vitest + MSW v2**, **Given/When/Then `AC-1..N` traceability**, and **Zero-Test-Gaming (`READ_ONLY_FILES`)**.

---

## 🔧 Runtime Verification Scripts

| Script / CLI | Purpose | Canonical Command |
|--------------|---------|-------------------|
| `scripts/test_runner.py` | Auto-detects & executes `vitest`, `jest`, `node --test`, `pytest`, `cargo test`, or `go test` (`npm.cmd`/`npx.cmd` safe on Windows) | `python ~/.{TOOL}/skills/testing-patterns/scripts/test_runner.py <project_path> [--coverage] [--json]` |
| `accessibility_checker.py` | Static WCAG 2.2 AA semantic, keyboard, & accessible-name audit | `python ~/.{TOOL}/skills/frontend-design/scripts/accessibility_checker.py <project_path> [--json]` |
| `boomopen check` | Anti-stub & anti-test-gaming gate (`0` `it.skip`, `test.only`, `test.todo`, vacuous `expect(true).toBe(true)`) | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 1. Modern Testing Trophy & Layer Selection

| Layer | Scope & Tooling | Target Speed | What to Verify |
|-------|-----------------|:------------:|----------------|
| **Static & Contract** | TypeScript `strict`, Zod schemas, `boomopen check` | `< 2s` | `SHARED_CONTRACT` types, `0` explicit `any`, `0` stubs |
| **Unit** | `vitest`, `node --test`, `pytest`, `cargo test`, `go test` | `< 50ms`/test | Pure domain logic, state reducers, parsers, edge cases |
| **Integration & Component** | Vitest + Testing Library + **MSW v2**, Testcontainers / SQLite | `50–500ms` | API handlers, DB transactions, UI 5-state rendering (`Loading`/`Empty`/`Error`/`Default`/`Disabled`) |
| **E2E & Accessibility** | Playwright (`webapp-testing`) + `accessibility_checker.py` | `1–10s`/flow | Critical user journeys, auth flows, WCAG 2.2 AA keyboard/focus |

---

## 2. Zero-Test-Gaming & `READ_ONLY_FILES` Lock (MANDATORY)

In Mode B multi-agent workflows (`/cook`, `/code`, `/test`, `/fix`, `/autopilot`):
1. **`AC-1..N` Given/When/Then Traceability**: Every acceptance criterion in `PLAN-{task}.md` (`AC-1`, `AC-2`, ...) MUST map to at least one automated test asserting **Given** precondition → **When** action → **Then** observable outcome.
2. **`READ_ONLY_FILES` Regression Lock**: When an implementation engineer shard (`backend-engineer#1`, `frontend-engineer#1`) receives existing or TDD-authored test files in `READ_ONLY_FILES`, the engineer **MUST fix production code to pass the tests** — NEVER weaken assertions, delete test cases, or edit locked test files!
3. **Zero Skipped or Focused Tests**: `it.skip`, `describe.skip`, `test.only`, `describe.only`, `test.todo`, `@pytest.mark.skip` without ticket justification, and vacuous assertions (`expect(true).toBe(true)`) are strictly blocked by `boomopen check --strict-phase --no-stubs`.

---

## 3. Vitest + MSW v2 Network-Level Mocking Standard

> **Rule**: Mock at the **network boundary** with MSW v2 (`msw/node`), **never** by mocking `fetch`, `axios`, or your own internal service module under test!

```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const server = setupServer(
  http.get('https://api.example.com/v1/orders/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, status: 'paid', totalCents: 4900 }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchOrderSummary (AC-1)', () => {
  it('returns normalized total when upstream API responds 200', async () => {
    const summary = await fetchOrderSummary('ord_101');
    expect(summary).toEqual({ id: 'ord_101', formattedTotal: '$49.00', isPaid: true });
  });

  it('surfaces typed UpstreamUnavailableError on HTTP 503', async () => {
    server.use(
      http.get('https://api.example.com/v1/orders/:id', () =>
        new HttpResponse(null, { status: 503 }),
      ),
    );
    await expect(fetchOrderSummary('ord_101')).rejects.toThrow(UpstreamUnavailableError);
  });
});
```

---

## 4. Mocking & Test Data Boundaries

| Mock Boundary | Verdict | Rationale |
|---------------|:-------:|-----------|
| External third-party HTTP APIs (Stripe, OAuth, LLM) | ✅ **Mock via MSW v2** | Deterministic offline CI & error-path simulation |
| System clock, timers, UUID/random seeds | ✅ **Fake timers / seeded** | Eliminates timezone & randomness flakiness |
| Internal functions/modules under test | ❌ **Never mock** | Couples tests to implementation details & hides broken contracts |
| Production files importing `vi.mock` / `jest.mock` | ❌ **Forbidden** | Blocked by `boomopen check --strict-phase --no-stubs` |

- **Factory Functions Over Giant Snapshots**: Use typed factory builders (`buildUser({ role: 'admin' })`) with realistic defaults instead of brittle 500-line inline snapshots.

---

## 5. WCAG 2.2 AA Component & Interaction Checks

Every UI component test suite must verify:
- **Semantic Queries First**: Query via `getByRole('button', { name: /save/i })` and `getByLabelText(...)` before falling back to `getByTestId`. If `getByRole` cannot find an interactive element, its accessible name or ARIA role is broken!
- **Keyboard & Focus Ergonomics**: Verify `Tab`, `Enter`, `Space`, and `Escape` dismissal on dialogs/menus, `:focus-visible` indicator presence, and absence of keyboard traps.
- **5-State UI Matrix**: Test `Default`, `Loading` (`aria-busy`), `Empty`, `Error` (`role="alert"`), and `Disabled` states explicitly.

---

## 6. 2026 Specialized Testing Skills (`skills_library/`)

| Testing Need | Skill Path |
|--------------|------------|
| Vitest + MSW v2 Network-Level API Mocking & Testing Library | `../../skills_library/vitest-msw-testing-patterns/SKILL.md` (`skills_library/vitest-msw-testing-patterns/SKILL.md`) |
| WCAG 2.2 AA/AAA Accessibility & Keyboard/Focus Auditing | `../../skills_library/wcag-22-accessibility-ergonomics/SKILL.md` (`skills_library/wcag-22-accessibility-ergonomics/SKILL.md`) |
| Browser E2E & Playwright Automation | `../webapp-testing/SKILL.md` (`skills/webapp-testing/SKILL.md`) |
| RED-GREEN-REFACTOR TDD Protocol | `../tdd-workflow/SKILL.md` (`skills/tdd-workflow/SKILL.md`) |
