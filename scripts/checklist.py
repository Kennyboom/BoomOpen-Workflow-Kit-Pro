#!/usr/bin/env python3
"""
Master Checklist Runner - BoomOpen Workflow Kit
===============================================

Orchestrates all validation scripts in priority order.
Use this for incremental validation during development.

Usage (python3 on macOS/Linux, py on Windows also work):
    python checklist.py .                    # Run core checks
    python checklist.py . --url <URL>        # Include performance checks

Installed location: ~/.<tool>/skills/boomopen-workflow-kit/scripts/checklist.py

Priority Order:
    P0: Security Scan (vulnerabilities, secrets)
    P1: Lint & Type Check (code quality)
    P2: Schema Validation (if database exists)
    P3: Test Runner (unit/integration tests)
    P4: UX Audit (psychology laws, accessibility)
    P5: SEO Check (meta tags, structure)
    P6: Performance (lighthouse, playwright - requires URL)

Exit codes: 0 = all executed checks passed, 1 = a check failed or is missing,
2 = invalid arguments.
"""

import argparse
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # keep the installed kit free of __pycache__

from kit_checks import (  # noqa: E402
    EXIT_USAGE, TARGET_URL, CheckSpec, is_valid_url, run_check, summarize,
)
from kit_console import force_utf8_output, print_error, print_header  # noqa: E402

CHECK_TIMEOUT_SECONDS = 300

CORE_CHECKS = [
    CheckSpec("Security Scan", "skills_library/vulnerability-scanner/scripts/security_scan.py", required=True),
    CheckSpec("Type Coverage", "skills_library/lint-and-validate/scripts/type_coverage.py"),
    CheckSpec("API Validation", "skills/api-patterns/scripts/api_validator.py"),
    CheckSpec("Schema Validation", "skills/database-design/scripts/schema_validator.py"),
    CheckSpec("Test Runner", "skills/testing-patterns/scripts/test_runner.py"),
    CheckSpec("UX Audit", "skills/frontend-design/scripts/ux_audit.py"),
    CheckSpec("Accessibility Audit", "skills/frontend-design/scripts/accessibility_checker.py", required=False),
    CheckSpec("SEO Check", "skills/seo-fundamentals/scripts/seo_checker.py"),
    CheckSpec("GEO Check", "skills_library/geo-fundamentals/scripts/geo_checker.py"),
    CheckSpec("i18n Check", "skills_library/i18n-localization/scripts/i18n_checker.py"),
]

PERFORMANCE_CHECKS = [
    CheckSpec("Lighthouse Audit", "skills_library/performance-profiling/scripts/lighthouse_audit.py",
              required=True, target=TARGET_URL),
    CheckSpec("Playwright E2E", "skills/webapp-testing/scripts/playwright_runner.py", target=TARGET_URL),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run BoomOpen Workflow Kit validation checklist",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python checklist.py .                                # Core checks only
  python checklist.py . --url http://localhost:3000    # Include performance
        """,
    )
    parser.add_argument("project", help="Project path to validate")
    parser.add_argument("--url", help="URL for performance checks (lighthouse, playwright)")
    parser.add_argument("--skip-performance", action="store_true",
                        help="Skip performance checks even if URL provided")
    return parser.parse_args()


def main() -> None:
    force_utf8_output()
    args = parse_args()

    project_path = Path(args.project).resolve()
    if not project_path.is_dir():
        print_error(f"Project path is not an existing directory: {project_path}")
        sys.exit(EXIT_USAGE)
    if args.url and not is_valid_url(args.url):
        print_error(f"--url must start with http:// or https:// (got: {args.url})")
        sys.exit(EXIT_USAGE)

    print_header("🚀 BOOMOPEN WORKFLOW KIT - MASTER CHECKLIST")
    print(f"Project: {project_path}")
    print(f"URL: {args.url if args.url else 'Not provided (performance checks skipped)'}")

    results = []
    print_header("📋 CORE CHECKS")
    for spec in CORE_CHECKS:
        result = run_check(spec, project_path, args.url, CHECK_TIMEOUT_SECONDS)
        results.append(result)
        if spec.required and result.is_failure:
            print_error(f"CRITICAL: {spec.name} failed. Stopping checklist.")
            summarize(results, "📊 CHECKLIST SUMMARY")
            sys.exit(1)

    if args.url and not args.skip_performance:
        print_header("⚡ PERFORMANCE CHECKS")
        for spec in PERFORMANCE_CHECKS:
            results.append(run_check(spec, project_path, args.url, CHECK_TIMEOUT_SECONDS))

    all_passed = summarize(results, "📊 CHECKLIST SUMMARY")
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
