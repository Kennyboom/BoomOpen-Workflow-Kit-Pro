#!/usr/bin/env python3
"""
Accessibility Checker - WCAG 2.2 AA compliance audit
Checks HTML/JSX/TSX/Vue/Svelte files for accessibility issues.

Usage (python3 on macOS/Linux, py on Windows also work):
    python accessibility_checker.py <project_path> [--json]

Exit codes: 0 = 0 blocking issues (`< MAX_TOLERATED_ISSUES`, or "[SKIP]" printed:
no markup files found), 1 = blocking issues found, 2 = invalid arguments.
Advisory findings (e.g. skip links, reduced-motion hints) are warnings and never fail.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
MAX_FILES = 50
MAX_TOLERATED_ISSUES = 1  # 0 blocking issues tolerated (< 1)
AUDITED_SUFFIXES = {".html", ".htm", ".jsx", ".tsx", ".vue", ".svelte"}
SKIP_DIRS = {
    "node_modules", ".next", "dist", "build", ".git", "coverage",
    "playwright-report", ".boomopen", ".agent", ".svelte-kit",
    ".astro", "out", "target", "__pycache__", ".venv", "venv",
}

# Match real <html> document root tag only (never TypeScript <HTMLDivElement> generics).
DOCUMENT_HTML_RE = re.compile(r"<html(?:\s|>)", re.IGNORECASE)

# Elements that are NOT keyboard-focusable by default.
NON_INTERACTIVE_ONCLICK_RE = re.compile(
    r"<(?:div|span|li|p|section|article|img|td|tr|ul|header|footer|main|label|i|svg)\b"
    r"(?:=>|[^>])*\bonclick\s*=(?:=>|[^>])*>",
    re.IGNORECASE,
)

BUTTON_BLOCK_RE = re.compile(r"<button\b((?:=>|[^>])*)>([\s\S]*?)</button>", re.IGNORECASE)


def find_markup_files(project_path: Path) -> List[Path]:
    """Find HTML/JSX/TSX/Vue/Svelte files via pruned os.walk."""
    files: List[Path] = []
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        for name in sorted(names):
            if Path(name).suffix.lower() in AUDITED_SUFFIXES:
                files.append(Path(root) / name)
                if len(files) >= MAX_FILES:
                    return files
    return files


def find_non_interactive_click_handlers(content: str) -> int:
    """Count click handlers on non-focusable elements lacking keyboard support."""
    count = 0
    for tag in NON_INTERACTIVE_ONCLICK_RE.findall(content):
        lowered = tag.lower()
        has_role = "role=" in lowered
        has_tabindex = "tabindex=" in lowered
        has_key_handler = "onkeydown=" in lowered or "onkeyup=" in lowered or "onkeypress=" in lowered
        if not (has_role and has_tabindex and has_key_handler):
            count += 1
    return count


def has_unlabeled_button(content: str) -> bool:
    """Return True if any <button>...</button> lacks text, JSX expression, or accessible label."""
    for attrs, body in BUTTON_BLOCK_RE.findall(content):
        if re.search(r"\b(?:aria-label|aria-labelledby|title)\s*=", attrs, re.IGNORECASE):
            continue
        if re.search(r"\b(?:aria-label|alt)\s*=\s*[\"'{][^\"'}]", body, re.IGNORECASE):
            continue
        cleaned = re.sub(r"<svg\b[\s\S]*?</svg>", "", body, flags=re.IGNORECASE)
        cleaned = re.sub(r"<[A-Za-z][\w.:-]*(?:\s+(?:=>|[^>])*)?/>", "", cleaned)
        cleaned = re.sub(r"<(?:=>|[^>])+>", "", cleaned)
        if not cleaned.strip():
            return True
    return False


def check_accessibility(file_path: Path) -> Tuple[List[str], List[str]]:
    """Check a single file. Returns (issues, warnings)."""
    issues: List[str] = []
    warnings: List[str] = []

    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        lower = content.lower()

        inputs = re.findall(r"<input\b(?:=>|[^>])*>", content, re.IGNORECASE)
        for inp in inputs:
            inp_low = inp.lower()
            if 'type="hidden"' not in inp_low and "type='hidden'" not in inp_low:
                if "aria-label" not in inp_low and "aria-labelledby" not in inp_low and "id=" not in inp_low:
                    if "<label" not in lower:
                        issues.append("Input without label or aria-label")
                        break

        if has_unlabeled_button(content):
            issues.append("Button without accessible text")

        if DOCUMENT_HTML_RE.search(content) and not re.search(r"<html\b[^>]*\blang\s*=", content, re.IGNORECASE):
            issues.append("Missing lang attribute on <html>")

        if re.search(r"<(?:main|body)\b", content, re.IGNORECASE):
            if "skip" not in lower and "#main" not in lower:
                warnings.append("Consider adding skip-to-main-content link")

        bad_click_count = find_non_interactive_click_handlers(content)
        if bad_click_count:
            issues.append(
                f"onClick on non-interactive element without role, tabIndex and key handler ({bad_click_count}x)"
            )

        if "tabindex=" in lower:
            positive_tabindex = re.findall(r'tabindex\s*=\s*["\'{]?\s*([1-9]\d*)', content, re.IGNORECASE)
            if positive_tabindex:
                issues.append("Avoid positive tabIndex values")

        if re.search(r"\bautoplay\b", content, re.IGNORECASE) and "muted" not in lower:
            issues.append("Autoplay media should be muted")

        div_buttons = re.findall(r'<div\b[^>]*role=["\']button["\'][^>]*>', content, re.IGNORECASE)
        for div in div_buttons:
            if "tabindex" not in div.lower():
                issues.append("role='button' without tabindex")
                break

        if re.search(r"outline\s*:\s*(?:none|0)\b|\boutline-none\b", content):
            if not re.search(r"focus-visible|focus:ring|focus:outline", content):
                warnings.append(
                    "outline-none/outline:none used without :focus-visible or focus ring replacement (WCAG 2.4.7 / 2.4.11)"
                )

        if re.search(r"@keyframes\b|\banimation\s*:|\banimate-(?:spin|ping|bounce)\b", content):
            if not re.search(r"prefers-reduced-motion|motion-reduce:", content):
                warnings.append("Animations detected without prefers-reduced-motion / motion-reduce support (WCAG 2.3.3)")

        if re.search(r"onPaste\s*=\s*\{[^}]*preventDefault", content):
            issues.append("Blocking paste (onPaste preventDefault) violates WCAG 2.2 AA Accessible Authentication (SC 3.3.8)")

    except OSError as exc:
        issues.append(f"Error reading file: {str(exc)[:50]}")

    return issues, warnings


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit HTML/JSX/TSX/Vue/Svelte files for WCAG 2.2 AA issues")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def main() -> None:
    args = parse_args()
    project_path = Path(args.project_path).resolve()
    files = find_markup_files(project_path)

    if not files:
        output = {
            "script": "accessibility_checker",
            "project": str(project_path),
            "files_checked": 0,
            "issues_found": 0,
            "passed": True,
            "skipped": True,
            "message": "No markup files found",
        }
        if args.json:
            print(json.dumps(output, indent=2))
        else:
            print(f"\n{'=' * 60}\n[ACCESSIBILITY CHECKER] WCAG Compliance Audit\n{'=' * 60}")
            print("[SKIP] No HTML/JSX/TSX/Vue/Svelte files found - nothing to check.")
            print(json.dumps(output, indent=2))
        sys.exit(0)

    all_issues = []
    all_warnings = []
    for fpath in files:
        issues, warnings = check_accessibility(fpath)
        if issues:
            all_issues.append({"file": str(fpath.name), "issues": issues})
        if warnings:
            all_warnings.append({"file": str(fpath.name), "warnings": warnings})

    total_issues = sum(len(item["issues"]) for item in all_issues)
    total_warnings = sum(len(item["warnings"]) for item in all_warnings)
    passed = total_issues < MAX_TOLERATED_ISSUES

    output = {
        "script": "accessibility_checker",
        "project": str(project_path),
        "files_checked": len(files),
        "files_with_issues": len(all_issues),
        "issues_found": total_issues,
        "warnings_found": total_warnings,
        "issues": all_issues,
        "passed": passed,
    }

    if args.json:
        print(json.dumps(output, indent=2))
        sys.exit(0 if passed else 1)

    print(f"\n{'=' * 60}")
    print("[ACCESSIBILITY CHECKER] WCAG Compliance Audit")
    print(f"{'=' * 60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    print(f"Found {len(files)} markup files")
    print("\n" + "=" * 60)
    print("ACCESSIBILITY ISSUES")
    print("=" * 60)

    if all_issues:
        for item in all_issues[:10]:
            print(f"\n{item['file']}:")
            for issue in item["issues"]:
                print(f"  - {issue}")
        if len(all_issues) > 10:
            print(f"\n... and {len(all_issues) - 10} more files with issues")
    else:
        print("No accessibility issues found!")

    if total_warnings:
        print(f"\nWarnings (advisory, {total_warnings}):")
        for item in all_warnings[:10]:
            print(f"  {item['file']}: {'; '.join(item['warnings'])}")

    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
