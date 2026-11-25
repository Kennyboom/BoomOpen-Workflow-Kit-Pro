#!/usr/bin/env python3
"""
Skill: webapp-testing
Script: playwright_runner.py (v5.5.0)
Purpose: Run Playwright browser smoke/a11y checks on a live URL, or execute a
         project's `npx playwright test` E2E suite (npx.cmd safe on win32).

Usage (python3 on macOS/Linux, py on Windows also work):
    python playwright_runner.py <url> [--screenshot] [--a11y] [--project <dir>]
    python playwright_runner.py --suite [project_path]

Output: JSON with page health, Navigation Timing Level 2 metrics, WCAG 2.2 a11y
        signals, or Playwright test suite summary.
Exit codes: 0 = check/suite passed (status "success"), 1 = check failed or
            Playwright missing, 2 = invalid arguments.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

EXIT_FAILED = 1
EXIT_USAGE = 2
NAVIGATION_TIMEOUT_MS = 30000
SUITE_TIMEOUT_SECONDS = 300
URL_RE = re.compile(r"^https?://\S+$", re.IGNORECASE)
SCREENSHOT_DIR_NAME = "boomopen_screenshots"
PLAYWRIGHT_CONFIG_NAMES = (
    "playwright.config.ts",
    "playwright.config.js",
    "playwright.config.mjs",
    "playwright.config.cjs",
)
INSTALL_HINT = (
    "uv run --with playwright python playwright_runner.py <url> "
    "(after `uv run --with playwright playwright install chromium`) or `npx playwright test`"
)

NAV_TIMING_JS = """() => {
  const nav = performance.getEntriesByType('navigation')[0];
  if (!nav) return { dom_content_loaded: 0, load_complete: 0 };
  return {
    dom_content_loaded: Math.round(nav.domContentLoadedEventEnd),
    load_complete: Math.round(nav.loadEventEnd)
  };
}"""

A11Y_EVAL_JS = """() => {
  const hasLabel = (el) => Boolean(
    (el.getAttribute('aria-label') || '').trim() ||
    el.getAttribute('aria-labelledby') ||
    (el.getAttribute('title') || '').trim() ||
    (el.textContent || '').trim() ||
    el.querySelector('[aria-label], img[alt]:not([alt=""])')
  );
  const buttons = Array.from(document.querySelectorAll('button'));
  const links = Array.from(document.querySelectorAll('a[href]'));
  return {
    html_lang: Boolean(document.documentElement.getAttribute('lang')),
    main_landmarks: document.querySelectorAll('main, [role="main"]').length,
    nav_landmarks: document.querySelectorAll('nav, [role="navigation"]').length,
    buttons_total: buttons.length,
    buttons_with_label: buttons.filter(hasLabel).length,
    buttons_unlabeled: buttons.filter((b) => !hasLabel(b)).length,
    links_with_text: links.filter(hasLabel).length
  };
}"""


def has_playwright_config(project_dir: Path) -> bool:
    return any((project_dir / cfg).exists() for cfg in PLAYWRIGHT_CONFIG_NAMES)


def resolve_project_dir(explicit_project: Optional[str]) -> Path:
    if explicit_project:
        return Path(explicit_project).resolve()
    env_dir = os.environ.get("BOOMOPEN_PROJECT_DIR")
    if env_dir and Path(env_dir).is_dir():
        return Path(env_dir).resolve()
    return Path.cwd().resolve()


def resolve_node_playwright_cmd(project_dir: Path) -> Optional[List[str]]:
    """Prefer project-local node_modules/.bin/playwright, else npx playwright."""
    names = ("playwright.cmd", "playwright.exe", "playwright") if sys.platform == "win32" else ("playwright",)
    for name in names:
        local_bin = project_dir / "node_modules" / ".bin" / name
        if local_bin.is_file():
            return [str(local_bin)]
    npx_bin = shutil.which("npx")
    return [npx_bin, "playwright"] if npx_bin else None


def capture_screenshot(page) -> str:
    screenshot_dir = os.path.join(tempfile.gettempdir(), SCREENSHOT_DIR_NAME)
    os.makedirs(screenshot_dir, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(screenshot_dir, f"screenshot_{stamp}.png")
    page.screenshot(path=screenshot_path, full_page=True)
    return screenshot_path


def run_basic_test(url: str, take_screenshot: bool = False, project_dir: Optional[Path] = None) -> Dict[str, object]:
    """Run headless Chromium smoke check against a live URL (or Node @playwright/test fallback)."""
    resolved_project = project_dir or resolve_project_dir(None)
    if not PLAYWRIGHT_AVAILABLE:
        if has_playwright_config(resolved_project):
            return run_playwright_suite(resolved_project, base_url=url)
        return {
            "url": url,
            "status": "error",
            "error": "Playwright not installed",
            "fix": INSTALL_HINT,
        }

    result: Dict[str, object] = {
        "url": url,
        "timestamp": datetime.now().isoformat(),
        "status": "pending",
    }
    console_errors: List[str] = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 720})
            page = context.new_page()
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

            response = page.goto(url, wait_until="networkidle", timeout=NAVIGATION_TIMEOUT_MS)
            loaded = response.ok if response else False
            result["page"] = {
                "title": page.title(),
                "url": page.url,
                "status_code": response.status if response else None,
            }
            result["health"] = {
                "loaded": loaded,
                "has_title": bool(page.title()),
                "has_h1": page.locator("h1").count() > 0,
                "has_links": page.locator("a").count() > 0,
                "has_images": page.locator("img").count() > 0,
            }
            result["console_errors"] = console_errors[:20]
            result["performance"] = page.evaluate(NAV_TIMING_JS)

            if take_screenshot:
                result["screenshot"] = capture_screenshot(page)
                result["screenshot_note"] = "Saved to temp directory (auto-cleaned by OS)"

            result["elements"] = {
                "links": page.locator("a").count(),
                "buttons": page.locator("button").count(),
                "inputs": page.locator("input").count(),
                "images": page.locator("img").count(),
                "forms": page.locator("form").count(),
            }
            browser.close()
            result["status"] = "success" if loaded else "failed"
            result["summary"] = "[OK] Page loaded successfully" if loaded else "[X] Page failed to load"
    except Exception as exc:
        result["status"] = "error"
        result["error"] = str(exc)
        result["summary"] = f"[X] Error: {str(exc)[:100]}"

    return result


def evaluate_a11y_violations(loaded: bool, a11y: Dict[str, object]) -> List[str]:
    violations: List[str] = []
    if not loaded:
        violations.append("Page failed to load")
    if not a11y.get("html_lang"):
        violations.append("Missing lang attribute on <html>")
    unlabeled = int(a11y.get("buttons_unlabeled", 0) or 0)  # type: ignore[arg-type]
    if unlabeled > 0:
        violations.append(f"{unlabeled} unlabeled button(s)")
    missing_alt = int(a11y.get("images_without_alt", 0) or 0)  # type: ignore[arg-type]
    if missing_alt > 0:
        violations.append(f"{missing_alt} image(s) missing alt attribute")
    return violations


def run_accessibility_check(url: str, project_dir: Optional[Path] = None) -> Dict[str, object]:
    """Run WCAG 2.2 AA structural & accessible-name checks on a live URL."""
    resolved_project = project_dir or resolve_project_dir(None)
    if not PLAYWRIGHT_AVAILABLE:
        if has_playwright_config(resolved_project):
            return run_playwright_suite(resolved_project, base_url=url)
        return {"url": url, "status": "error", "error": "Playwright not installed", "fix": INSTALL_HINT}

    result: Dict[str, object] = {"url": url, "accessibility": {}}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            response = page.goto(url, wait_until="networkidle", timeout=NAVIGATION_TIMEOUT_MS)
            loaded = response.ok if response else False

            dom_a11y = page.evaluate(A11Y_EVAL_JS)
            a11y_data: Dict[str, object] = {
                **dom_a11y,
                "images_with_alt": page.locator("img[alt]").count(),
                "images_without_alt": page.locator("img:not([alt])").count(),
                "form_labels": page.locator("label").count(),
                "headings": {
                    "h1": page.locator("h1").count(),
                    "h2": page.locator("h2").count(),
                    "h3": page.locator("h3").count(),
                },
            }
            browser.close()
            violations = evaluate_a11y_violations(loaded, a11y_data)
            a11y_data["violations"] = violations
            result["accessibility"] = a11y_data
            result["passed"] = len(violations) == 0
            result["status"] = "success" if not violations else "failed"
            result["summary"] = (
                "[OK] Accessibility check passed"
                if not violations
                else f"[X] Accessibility violations: {', '.join(violations)}"
            )
    except Exception as exc:
        result["status"] = "error"
        result["passed"] = False
        result["error"] = str(exc)

    return result


def run_playwright_suite(project_dir: Path, base_url: Optional[str] = None) -> Dict[str, object]:
    """Execute `@playwright/test` in a Node.js project (local binary or npx, win32 safe)."""
    if not has_playwright_config(project_dir):
        return {
            "project": str(project_dir),
            "status": "success",
            "skipped": True,
            "summary": "[SKIP] No playwright.config.{ts,js,mjs,cjs} found",
        }

    pw_cmd = resolve_node_playwright_cmd(project_dir)
    if not pw_cmd:
        return {"project": str(project_dir), "status": "error", "error": "npx / playwright CLI not found on PATH"}

    env = os.environ.copy()
    if base_url:
        env["PLAYWRIGHT_TEST_BASE_URL"] = base_url
        env.setdefault("BASE_URL", base_url)

    try:
        proc = subprocess.run(
            [*pw_cmd, "test", "--reporter=list"],
            cwd=str(project_dir),
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=SUITE_TIMEOUT_SECONDS,
        )
        ok = proc.returncode == 0
        payload: Dict[str, object] = {
            "project": str(project_dir),
            "runner": "node-playwright-test",
            "status": "success" if ok else "failed",
            "passed": ok,
            "exit_code": proc.returncode,
            "output": (proc.stdout or "")[:2500],
            "error": (proc.stderr or "")[:500] if not ok else "",
        }
        if base_url:
            payload["url"] = base_url
        return payload
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"project": str(project_dir), "status": "error", "passed": False, "error": str(exc)}


def print_usage_and_exit(
    message: str = "Usage: python playwright_runner.py <url> [--screenshot] [--a11y] [--project <dir>] | --suite [project_path]",
) -> None:
    print(json.dumps({
        "error": message,
        "examples": [
            "python playwright_runner.py https://example.com",
            "python playwright_runner.py https://example.com --screenshot",
            "python playwright_runner.py https://example.com --a11y",
            "python playwright_runner.py --suite .",
        ],
    }, indent=2))
    sys.exit(EXIT_USAGE)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run Playwright smoke/a11y checks on a live URL or execute a project's Playwright suite",
    )
    parser.add_argument("target", nargs="?", default=None, help="Live http(s) URL (or project path when --suite is set)")
    parser.add_argument("--screenshot", action="store_true", help="Capture full-page screenshot in temp dir")
    parser.add_argument("--a11y", action="store_true", help="Run WCAG 2.2 AA DOM landmark & label audit")
    parser.add_argument("--project", default=None, help="Project directory for auto-detecting playwright.config.*")
    parser.add_argument("--suite", nargs="?", const=".", default=None, metavar="PROJECT_PATH",
                        help="Run `npx playwright test` in PROJECT_PATH (default: current directory)")
    return parser


def main() -> None:
    parser = build_parser()
    args, unknown = parser.parse_known_args()
    if unknown:
        print_usage_and_exit(f"Unrecognized arguments: {' '.join(unknown)}")

    if args.suite is not None:
        raw_dir: Optional[str] = args.target if (args.suite == "." and args.target) else args.suite
        target_dir = Path(raw_dir or ".").resolve()
        if not target_dir.is_dir():
            print_usage_and_exit(f"Project directory does not exist: {target_dir}")
        result = run_playwright_suite(target_dir)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result.get("status") == "success" else EXIT_FAILED)

    if args.target and not URL_RE.match(args.target):
        candidate_dir = Path(args.target)
        if candidate_dir.is_dir() and has_playwright_config(candidate_dir):
            result = run_playwright_suite(candidate_dir.resolve())
            print(json.dumps(result, indent=2))
            sys.exit(0 if result.get("status") == "success" else EXIT_FAILED)
        print_usage_and_exit()

    if not args.target:
        print_usage_and_exit()

    if args.project and not Path(args.project).is_dir():
        print_usage_and_exit(f"Project directory does not exist: {args.project}")

    project_dir = resolve_project_dir(args.project)
    result = (
        run_accessibility_check(args.target, project_dir=project_dir)
        if args.a11y
        else run_basic_test(args.target, take_screenshot=args.screenshot, project_dir=project_dir)
    )
    print(json.dumps(result, indent=2))
    sys.exit(0 if result.get("status") == "success" else EXIT_FAILED)


if __name__ == "__main__":
    main()
