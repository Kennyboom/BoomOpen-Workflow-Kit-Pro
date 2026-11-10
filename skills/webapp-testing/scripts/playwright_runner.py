#!/usr/bin/env python3
"""
Skill: webapp-testing
Script: playwright_runner.py (v5.5.0)
Purpose: Run Playwright browser smoke/a11y checks on a live URL, or execute a
         project's `npx playwright test` E2E suite (npx.cmd safe on win32).

Usage (python3 on macOS/Linux, py on Windows also work):
    python playwright_runner.py <url> [--screenshot] [--a11y]
    python playwright_runner.py --suite [project_path]

Output: JSON with page health, Navigation Timing Level 2 metrics, WCAG 2.2 a11y
        signals, or Playwright test suite summary.
Exit codes: 0 = check/suite passed (status "success"), 1 = check failed or
            Playwright missing, 2 = invalid arguments.
"""

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Dict, List

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
    (el.textContent || '').trim()
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


def capture_screenshot(page) -> str:
    screenshot_dir = os.path.join(tempfile.gettempdir(), SCREENSHOT_DIR_NAME)
    os.makedirs(screenshot_dir, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(screenshot_dir, f"screenshot_{stamp}.png")
    page.screenshot(path=screenshot_path, full_page=True)
    return screenshot_path


def run_basic_test(url: str, take_screenshot: bool = False) -> Dict[str, object]:
    """Run headless Chromium smoke check against a live URL."""
    if not PLAYWRIGHT_AVAILABLE:
        return {
            "url": url,
            "status": "error",
            "error": "Playwright not installed",
            "fix": "pip install playwright && playwright install chromium",
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


def run_accessibility_check(url: str) -> Dict[str, object]:
    """Run WCAG 2.2 AA structural & accessible-name checks on a live URL."""
    if not PLAYWRIGHT_AVAILABLE:
        return {"url": url, "status": "error", "error": "Playwright not installed"}

    result: Dict[str, object] = {"url": url, "accessibility": {}}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=NAVIGATION_TIMEOUT_MS)

            dom_a11y = page.evaluate(A11Y_EVAL_JS)
            result["accessibility"] = {
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
            result["status"] = "success"
    except Exception as exc:
        result["status"] = "error"
        result["error"] = str(exc)

    return result


def run_playwright_suite(project_dir: Path) -> Dict[str, object]:
    """Execute `npx playwright test` in a Node.js project (npx.cmd safe on win32)."""
    npx_bin = shutil.which("npx")
    if not npx_bin:
        return {"project": str(project_dir), "status": "error", "error": "npx not found on PATH"}

    has_config = any(
        (project_dir / cfg).exists()
        for cfg in ("playwright.config.ts", "playwright.config.js", "playwright.config.mjs")
    )
    if not has_config:
        return {
            "project": str(project_dir),
            "status": "success",
            "skipped": True,
            "summary": "[SKIP] No playwright.config.{ts,js,mjs} found",
        }

    try:
        proc = subprocess.run(
            [npx_bin, "playwright", "test", "--reporter=list"],
            cwd=str(project_dir),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=SUITE_TIMEOUT_SECONDS,
        )
        ok = proc.returncode == 0
        return {
            "project": str(project_dir),
            "status": "success" if ok else "failed",
            "exit_code": proc.returncode,
            "output": (proc.stdout or "")[:2500],
            "error": (proc.stderr or "")[:500] if not ok else "",
        }
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"project": str(project_dir), "status": "error", "error": str(exc)}


def print_usage_and_exit() -> None:
    print(json.dumps({
        "error": "Usage: python playwright_runner.py <url> [--screenshot] [--a11y] | --suite [project_path]",
        "examples": [
            "python playwright_runner.py https://example.com",
            "python playwright_runner.py https://example.com --screenshot",
            "python playwright_runner.py https://example.com --a11y",
            "python playwright_runner.py --suite .",
        ],
    }, indent=2))
    sys.exit(EXIT_USAGE)


def main() -> None:
    argv = sys.argv[1:]
    if not argv:
        print_usage_and_exit()

    if argv[0] == "--suite":
        target_dir = Path(argv[1] if len(argv) > 1 else ".").resolve()
        if not target_dir.is_dir():
            print_usage_and_exit()
        result = run_playwright_suite(target_dir)
        print(json.dumps(result, indent=2))
        sys.exit(0 if result.get("status") == "success" else EXIT_FAILED)

    url = argv[0]
    if not URL_RE.match(url):
        print_usage_and_exit()

    result = (
        run_accessibility_check(url)
        if "--a11y" in argv
        else run_basic_test(url, take_screenshot="--screenshot" in argv)
    )
    print(json.dumps(result, indent=2))
    sys.exit(0 if result.get("status") == "success" else EXIT_FAILED)


if __name__ == "__main__":
    main()
