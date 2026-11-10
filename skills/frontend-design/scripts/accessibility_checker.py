#!/usr/bin/env python3
"""
Accessibility Checker - WCAG compliance audit
Checks HTML files for accessibility issues.

Usage (python3 on macOS/Linux, py on Windows also work):
    python accessibility_checker.py <project_path>

Exit codes: 0 = fewer than MAX_TOLERATED_ISSUES issues (or "[SKIP]" printed:
no markup files found), 1 = too many issues, 2 = invalid arguments.
Advisory findings (e.g. skip links) are reported as warnings and never fail.

Checks:
    - Form labels
    - ARIA attributes
    - Color contrast hints
    - Keyboard navigation
    - Semantic HTML
"""

import argparse
import sys
import json
import re
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding (stdout is a cp1252 pipe when agents run this)
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
MAX_FILES = 50
MAX_TOLERATED_ISSUES = 1
SKIP_DIRS = {'node_modules', '.next', 'dist', 'build', '.git'}
# Elements that are NOT keyboard-focusable by default. A click handler on them
# needs role + tabIndex + a key handler; native <button>/<a>/<input> do not.
# "=>" is allowed inside the tag so JSX arrow functions do not end the match.
NON_INTERACTIVE_ONCLICK_RE = re.compile(
    r'<(?:div|span|li|p|section|article|img|td|tr|ul|header|footer|main|label|i|svg)\b'
    r'(?:=>|[^>])*\bonclick\s*=(?:=>|[^>])*>',
    re.IGNORECASE,
)


def find_html_files(project_path: Path) -> list:
    """Find all HTML/JSX/TSX files (excluded folders are matched inside the project only)."""
    patterns = ['**/*.html', '**/*.jsx', '**/*.tsx']

    files = []
    for pattern in patterns:
        for f in project_path.glob(pattern):
            try:
                parts = f.relative_to(project_path).parts[:-1]
            except ValueError:
                parts = f.parts[:-1]
            if not any(skip in parts for skip in SKIP_DIRS):
                files.append(f)

    return files[:MAX_FILES]


def find_non_interactive_click_handlers(content: str) -> int:
    """Count click handlers on non-focusable elements lacking keyboard support."""
    count = 0
    for tag in NON_INTERACTIVE_ONCLICK_RE.findall(content):
        lowered = tag.lower()
        has_role = 'role=' in lowered
        has_tabindex = 'tabindex=' in lowered
        has_key_handler = 'onkeydown=' in lowered or 'onkeyup=' in lowered or 'onkeypress=' in lowered
        if not (has_role and has_tabindex and has_key_handler):
            count += 1
    return count


def check_accessibility(file_path: Path) -> tuple:
    """Check a single file. Returns (issues, warnings)."""
    issues = []
    warnings = []

    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')

        # Check for form inputs without labels
        inputs = re.findall(r'<input[^>]*>', content, re.IGNORECASE)
        for inp in inputs:
            if 'type="hidden"' not in inp.lower():
                if 'aria-label' not in inp.lower() and 'id=' not in inp.lower():
                    issues.append("Input without label or aria-label")
                    break

        # Check for buttons without accessible text
        buttons = re.findall(r'<button[^>]*>[^<]*</button>', content, re.IGNORECASE)
        for btn in buttons:
            # Check if button has text content or aria-label
            if 'aria-label' not in btn.lower():
                text = re.sub(r'<[^>]+>', '', btn)
                if not text.strip():
                    issues.append("Button without accessible text")
                    break

        # Check for missing lang attribute
        if '<html' in content.lower() and 'lang=' not in content.lower():
            issues.append("Missing lang attribute on <html>")

        # Missing skip link is advisory only
        if '<main' in content.lower() or '<body' in content.lower():
            if 'skip' not in content.lower() and '#main' not in content.lower():
                warnings.append("Consider adding skip-to-main-content link")

        # Click handlers on non-focusable elements (native buttons/links are fine)
        bad_click_count = find_non_interactive_click_handlers(content)
        if bad_click_count:
            issues.append(f"onClick on non-interactive element without role, tabIndex and key handler ({bad_click_count}x)")

        # Check for tabIndex misuse
        if 'tabindex=' in content.lower():
            if 'tabindex="-1"' not in content.lower() and 'tabindex="0"' not in content.lower():
                positive_tabindex = re.findall(r'tabindex="([1-9]\d*)"', content, re.IGNORECASE)
                if positive_tabindex:
                    issues.append("Avoid positive tabIndex values")

        # Check for autoplay media
        if 'autoplay' in content.lower():
            if 'muted' not in content.lower():
                issues.append("Autoplay media should be muted")

        # Check for role usage
        if 'role="button"' in content.lower():
            # Divs with role button should have tabindex
            div_buttons = re.findall(r'<div[^>]*role="button"[^>]*>', content, re.IGNORECASE)
            for div in div_buttons:
                if 'tabindex' not in div.lower():
                    issues.append("role='button' without tabindex")
                    break

        # WCAG 2.2 AA: Check for outline removal without :focus-visible replacement
        if re.search(r'outline\s*:\s*(?:none|0)\b|\boutline-none\b', content):
            if not re.search(r'focus-visible|focus:ring|focus:outline', content):
                warnings.append("outline-none/outline:none used without :focus-visible or focus ring replacement (WCAG 2.4.7 / 2.4.11)")

        # WCAG 2.2 AA: Check for animations without prefers-reduced-motion awareness
        if re.search(r'@keyframes\b|\banimation\s*:|\banimate-(?:spin|ping|bounce)\b', content):
            if not re.search(r'prefers-reduced-motion|motion-reduce:', content):
                warnings.append("Animations detected without prefers-reduced-motion / motion-reduce support (WCAG 2.3.3)")

        # WCAG 2.2 AA SC 3.3.8: Accessible Authentication (do not block paste on inputs)
        if re.search(r'onPaste\s*=\s*\{[^}]*preventDefault', content):
            issues.append("Blocking paste (onPaste preventDefault) violates WCAG 2.2 AA Accessible Authentication (SC 3.3.8)")

    except OSError as e:
        issues.append(f"Error reading file: {str(e)[:50]}")

    return issues, warnings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit HTML/JSX/TSX files for common WCAG issues")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def main():
    project_path = Path(parse_args().project_path).resolve()

    print(f"\n{'='*60}")
    print(f"[ACCESSIBILITY CHECKER] WCAG Compliance Audit")
    print(f"{'='*60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-"*60)

    # Find HTML files
    files = find_html_files(project_path)
    print(f"Found {len(files)} HTML/JSX/TSX files")

    if not files:
        print("[SKIP] No HTML/JSX/TSX files found - nothing to check.")
        output = {
            "script": "accessibility_checker",
            "project": str(project_path),
            "files_checked": 0,
            "issues_found": 0,
            "passed": True,
            "skipped": True,
            "message": "No HTML files found"
        }
        print(json.dumps(output, indent=2))
        sys.exit(0)

    # Check each file
    all_issues = []
    all_warnings = []

    for f in files:
        issues, warnings = check_accessibility(f)
        if issues:
            all_issues.append({
                "file": str(f.name),
                "issues": issues
            })
        if warnings:
            all_warnings.append({"file": str(f.name), "warnings": warnings})

    # Summary
    print("\n" + "="*60)
    print("ACCESSIBILITY ISSUES")
    print("="*60)

    if all_issues:
        for item in all_issues[:10]:
            print(f"\n{item['file']}:")
            for issue in item["issues"]:
                print(f"  - {issue}")

        if len(all_issues) > 10:
            print(f"\n... and {len(all_issues) - 10} more files with issues")
    else:
        print("No accessibility issues found!")

    total_warnings = sum(len(item["warnings"]) for item in all_warnings)
    if total_warnings:
        print(f"\nWarnings (advisory, {total_warnings}):")
        for item in all_warnings[:10]:
            print(f"  {item['file']}: {'; '.join(item['warnings'])}")

    total_issues = sum(len(item["issues"]) for item in all_issues)
    # Accessibility issues are important but a few are tolerated
    passed = total_issues < MAX_TOLERATED_ISSUES

    output = {
        "script": "accessibility_checker",
        "project": str(project_path),
        "files_checked": len(files),
        "files_with_issues": len(all_issues),
        "issues_found": total_issues,
        "warnings_found": total_warnings,
        "passed": passed
    }

    print("\n" + json.dumps(output, indent=2))

    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
