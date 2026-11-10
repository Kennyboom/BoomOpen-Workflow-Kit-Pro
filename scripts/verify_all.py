#!/usr/bin/env python3
"""
Full Verification Suite - BoomOpen Workflow Kit (v5.5.0)
========================================================

Runs COMPLETE validation across security, code quality, data schemas, test suites,
UI/UX & WCAG 2.2 AA accessibility, SEO & Core Web Vitals (LCP <= 2.5s,
INP <= 200ms, CLS <= 0.1), Playwright E2E, mobile ergonomics, and i18n.
Use this before deployment or major releases.

Usage (python3 on macOS/Linux, py on Windows also work):
    python verify_all.py . --url <URL>

Installed location: ~/.<tool>/skills/boomopen-workflow-kit/scripts/verify_all.py

Includes ALL checks:
    - Security Scan (OWASP Web + 2025/2026 LLM/Agentic, secrets, dependencies)
    - API Validation & Type Coverage
    - Database Schema Validation
    - Test Suite (Vitest, Jest, Node --test, Pytest, Cargo, Go)
    - UX Audit & WCAG 2.2 AA Accessibility Check
    - SEO (INP/CWV, metadata, JSON-LD) & GEO Check
    - Lighthouse Audit (Core Web Vitals) - opens the URL
    - Playwright E2E - opens the URL
    - Mobile UX & Ergonomics Audit (if applicable)
    - Internationalization (i18n) Check

Exit codes: 0 = all executed checks passed, 1 = a check failed or is missing,
2 = invalid arguments.
"""

import argparse
import sys
from datetime import datetime
from pathlib import Path

sys.dont_write_bytecode = True  # keep the installed kit free of __pycache__

from kit_checks import (  # noqa: E402
    EXIT_USAGE, TARGET_URL, CheckSpec, is_valid_url, run_check, summarize,
)
from kit_console import Colors, force_utf8_output, print_error, print_header  # noqa: E402

CHECK_TIMEOUT_SECONDS = 600
REPORT_WIDTH = 70
E2E_CATEGORY = "E2E Testing"

VERIFICATION_SUITE = [
    ("Security", [
        CheckSpec("Security Scan", "skills/security-auditor/scripts/security_scan.py", required=True),
    ]),
    ("Code Quality", [
        CheckSpec("API Validation", "skills/api-patterns/scripts/api_validator.py"),
        CheckSpec("Type Coverage", "skills_library/lint-and-validate/scripts/type_coverage.py"),
    ]),
    ("Data Layer", [
        CheckSpec("Schema Validation", "skills/database-design/scripts/schema_validator.py"),
    ]),
    ("Testing", [
        CheckSpec("Test Suite", "skills/testing-patterns/scripts/test_runner.py"),
    ]),
    ("UX & Accessibility", [
        CheckSpec("UX Audit", "skills/frontend-design/scripts/ux_audit.py"),
        CheckSpec("Accessibility Check", "skills/frontend-design/scripts/accessibility_checker.py"),
    ]),
    ("SEO & Content", [
        CheckSpec("SEO Check", "skills/seo-fundamentals/scripts/seo_checker.py"),
        CheckSpec("GEO Check", "skills_library/geo-fundamentals/scripts/geo_checker.py"),
    ]),
    ("Performance", [
        CheckSpec("Lighthouse Audit", "skills_library/performance-profiling/scripts/lighthouse_audit.py",
                  required=True, target=TARGET_URL),
    ]),
    (E2E_CATEGORY, [
        CheckSpec("Playwright E2E", "skills/webapp-testing/scripts/playwright_runner.py", target=TARGET_URL),
    ]),
    ("Mobile", [
        CheckSpec("Mobile Audit", "skills/mobile-design/scripts/mobile_audit.py"),
    ]),
    ("Internationalization", [
        CheckSpec("i18n Check", "skills_library/i18n-localization/scripts/i18n_checker.py"),
    ]),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run complete BoomOpen Workflow Kit v5.5 verification suite",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python verify_all.py . --url http://localhost:3000
  python verify_all.py . --url https://staging.example.com --no-e2e
        """,
    )
    parser.add_argument("project", help="Project path to validate")
    parser.add_argument("--url", required=True, help="URL for performance & E2E checks")
    parser.add_argument("--no-e2e", action="store_true", help="Skip E2E tests")
    parser.add_argument("--stop-on-fail", action="store_true", help="Stop on first critical failure")
    return parser.parse_args()


def main() -> None:
    force_utf8_output()
    args = parse_args()

    project_path = Path(args.project).resolve()
    if not project_path.is_dir():
        print_error(f"Project path is not an existing directory: {project_path}")
        sys.exit(EXIT_USAGE)
    if not is_valid_url(args.url):
        print_error(f"--url must start with http:// or https:// (got: {args.url})")
        sys.exit(EXIT_USAGE)

    started = datetime.now()
    print_header("🚀 BOOMOPEN WORKFLOW KIT - FULL VERIFICATION SUITE", REPORT_WIDTH)
    print(f"Project: {project_path}")
    print(f"URL: {args.url}")
    print(f"Started: {started.strftime('%Y-%m-%d %H:%M:%S')}")

    results = []
    for category, checks in VERIFICATION_SUITE:
        if args.no_e2e and category == E2E_CATEGORY:
            continue
        print_header(f"📋 {category.upper()}", REPORT_WIDTH)
        for spec in checks:
            result = run_check(spec, project_path, args.url, CHECK_TIMEOUT_SECONDS)
            result.category = category
            results.append(result)
            if args.stop_on_fail and spec.required and result.is_failure:
                print_error(f"CRITICAL: {spec.name} failed. Stopping verification.")
                summarize(results, "📊 FULL VERIFICATION REPORT", REPORT_WIDTH)
                sys.exit(1)

    total = (datetime.now() - started).total_seconds()
    all_passed = summarize(results, "📊 FULL VERIFICATION REPORT", REPORT_WIDTH)
    print(f"Total Duration: {total:.1f}s")
    if all_passed:
        print(f"{Colors.GREEN}✨ Ready for deployment ✨{Colors.ENDC}")
    else:
        print(f"{Colors.YELLOW}💡 Tip: Fix critical (security, lint, contract) issues first{Colors.ENDC}")
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
