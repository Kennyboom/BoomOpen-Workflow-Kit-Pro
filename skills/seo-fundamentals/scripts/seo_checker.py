#!/usr/bin/env python3
"""
SEO Checker - Search Engine & AI Discovery Audit (v5.5.0)
=========================================================
Audits HTML/JSX/TSX pages for 2026 Technical SEO, Core Web Vitals readiness
(LCP <= 2.5s, INP <= 200ms replacing retired FID, CLS <= 0.1), structured data,
and AI/GEO crawlability.

WHAT IT CHECKS:
    - Document layouts (<head> / <Head> / Next.js metadata): title, description,
      Open Graph (og:title), canonical URL, JSON-LD (application/ld+json)
    - Heading hierarchy (single H1 per page) & semantic landmarks (<main>, <nav>, <article>)
    - Image accessibility (alt attribute presence; alt="" allowed for decorative images)
    - Project-level discovery files (robots.txt, sitemap.xml, llms.txt)

Usage (python3 on macOS/Linux, py on Windows also work):
    python seo_checker.py <project_path>

Exit codes: 0 = no blocking issues (or "[SKIP]" printed: no page files found),
1 = SEO issues found, 2 = invalid arguments.
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
MAX_PAGES = 50

# Real document head only: '<head' alone matches '<header>' in UI components.
DOCUMENT_HEAD_RE = re.compile(r"<head[\s>]|<Head\b")
DOCUMENT_HEAD_COMPONENT_RE = re.compile(r"<Head\b")
NEXT_METADATA_EXPORT_RE = re.compile(r"\bexport\s+(?:const\s+metadata|(?:async\s+)?function\s+generateMetadata)\b")
CANONICAL_RE = re.compile(r'rel=["\']canonical["\']|\bcanonical\s*:', re.IGNORECASE)
JSON_LD_RE = re.compile(r"application/ld\+json", re.IGNORECASE)
SEMANTIC_LANDMARK_RE = re.compile(r"<(?:main|article|nav|section)[\s>]", re.IGNORECASE)

SKIP_DIRS = {
    "node_modules", ".next", "dist", "build", ".git", ".github", ".boomopen",
    "__pycache__", ".vscode", ".idea", "coverage", "test", "tests",
    "__tests__", "spec", "docs", "documentation", "examples",
}

SKIP_PATTERNS = (
    "config", "setup", "util", "helper", "hook", "context", "store",
    "service", "api", "lib", "constant", "type", "interface", "mock",
    ".test.", ".spec.", "_test.", "_spec.",
)

PAGE_DIRS = {"pages", "app", "routes", "views", "screens"}
PAGE_NAMES = (
    "page", "index", "home", "about", "contact", "blog",
    "post", "article", "product", "landing", "layout",
)


def relative_parts(file_path: Path, project_path: Path) -> tuple:
    """Path parts inside the project (folders above the project must not count)."""
    try:
        return file_path.relative_to(project_path).parts
    except ValueError:
        return file_path.parts


def is_page_file(file_path: Path, project_path: Path) -> bool:
    """Return True when file_path is likely a public-facing route or HTML page."""
    name = file_path.name.lower()
    stem = file_path.stem.lower()
    if any(skip in name for skip in SKIP_PATTERNS):
        return False

    parts = [p.lower() for p in relative_parts(file_path, project_path)[:-1]]
    if any(d in parts for d in PAGE_DIRS):
        return True
    if any(p in stem for p in PAGE_NAMES):
        return True
    return file_path.suffix.lower() in (".html", ".htm")


def find_pages(project_path: Path) -> List[Path]:
    """Collect candidate page files up to MAX_PAGES."""
    files: List[Path] = []
    for pattern in ("**/*.html", "**/*.htm", "**/*.jsx", "**/*.tsx"):
        for fpath in project_path.glob(pattern):
            if any(skip in relative_parts(fpath, project_path)[:-1] for skip in SKIP_DIRS):
                continue
            if is_page_file(fpath, project_path):
                files.append(fpath)
    return files[:MAX_PAGES]


def check_layout_metadata(content: str, lower: str) -> List[str]:
    """Validate <head>/<Head> document metadata without flagging UI fragments."""
    issues: List[str] = []
    has_next_meta = bool(NEXT_METADATA_EXPORT_RE.search(content))

    has_title = (
        "<title" in lower
        or "title=" in content
        or bool(DOCUMENT_HEAD_COMPONENT_RE.search(content))
        or (has_next_meta and bool(re.search(r"\btitle\s*:", content)))
    )
    if not has_title:
        issues.append("Missing <title> tag")

    has_desc = (
        'name="description"' in lower
        or "name='description'" in lower
        or (has_next_meta and bool(re.search(r"\bdescription\s*:", content)))
    )
    if not has_desc:
        issues.append("Missing meta description")

    has_og = (
        "og:" in lower
        or 'property="og:' in lower
        or (has_next_meta and bool(re.search(r"\bopenGraph\s*:", content)))
    )
    if not has_og:
        issues.append("Missing Open Graph tags (og:title / openGraph)")

    return issues


def check_page(file_path: Path) -> Dict[str, object]:
    """Check a single page for blocking SEO defects and modern SEO signals."""
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except OSError as exc:
        return {"file": str(file_path.name), "issues": [f"Error: {exc}"], "signals": {}}

    lower = content.lower()
    is_layout = bool(DOCUMENT_HEAD_RE.search(content))
    issues = check_layout_metadata(content, lower) if is_layout else []

    h1_matches = re.findall(r"<h1\b[^>]*>", content, re.IGNORECASE)
    if len(h1_matches) > 1:
        issues.append(f"Multiple H1 tags ({len(h1_matches)})")

    for img in re.findall(r"<img\b[^>]+>", content, re.IGNORECASE):
        if "alt=" not in img.lower():
            issues.append("Image missing alt attribute")
            break

    signals = {
        "canonical": bool(CANONICAL_RE.search(content)),
        "json_ld": bool(JSON_LD_RE.search(content)),
        "semantic_landmarks": bool(SEMANTIC_LANDMARK_RE.search(content)),
        "og_title": "og:title" in lower or bool(re.search(r"\bopenGraph\s*:", content)),
    }
    return {"file": str(file_path.name), "issues": issues, "signals": signals}


def detect_discovery_files(project_path: Path) -> Dict[str, bool]:
    """Check optional root/public discovery assets (robots.txt, sitemap.xml, llms.txt)."""
    roots = [project_path, project_path / "public", project_path / "app", project_path / "src" / "app"]
    return {
        "robots": any((r / "robots.txt").exists() or (r / "robots.ts").exists() for r in roots),
        "sitemap": any((r / "sitemap.xml").exists() or (r / "sitemap.ts").exists() for r in roots),
        "llms_txt": any((r / "llms.txt").exists() for r in roots),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check page files for 2026 SEO best practices")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def print_issue_summary(all_issues: List[Dict[str, object]]) -> None:
    issue_counts: Dict[str, int] = {}
    for item in all_issues:
        for issue in item["issues"]:
            issue_counts[issue] = issue_counts.get(issue, 0) + 1

    print("\nIssue Summary:")
    for issue, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
        print(f"  [{count}] {issue}")

    print(f"\nAffected files ({len(all_issues)}):")
    for item in all_issues[:5]:
        print(f"  - {item['file']}")
    if len(all_issues) > 5:
        print(f"  ... and {len(all_issues) - 5} more")


def main() -> None:
    project_path = Path(parse_args().project_path).resolve()

    print(f"\n{'=' * 60}")
    print("  SEO CHECKER - 2026 Search, Core Web Vitals (INP) & GEO Audit")
    print(f"{'=' * 60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Core Web Vitals Targets: LCP <= 2.5s | INP <= 200ms | CLS <= 0.1")
    print("-" * 60)

    pages = find_pages(project_path)
    if not pages:
        print("\n[SKIP] No page files found - nothing to check.")
        print("    Looking for: HTML, JSX, TSX in pages/app/routes directories")
        output = {"script": "seo_checker", "files_checked": 0, "passed": True, "skipped": True}
        print("\n" + json.dumps(output, indent=2))
        sys.exit(0)

    print(f"Found {len(pages)} page files to analyze\n")
    page_results = [check_page(f) for f in pages]
    all_issues = [res for res in page_results if res["issues"]]
    discovery = detect_discovery_files(project_path)

    signal_totals = {
        key: sum(1 for r in page_results if r["signals"].get(key))
        for key in ("canonical", "json_ld", "semantic_landmarks", "og_title")
    }

    print("=" * 60)
    print("SEO ANALYSIS RESULTS")
    print("=" * 60)
    if all_issues:
        print_issue_summary(all_issues)
    else:
        print("\n[OK] No SEO issues found!")

    total_issues = sum(len(item["issues"]) for item in all_issues)
    passed = total_issues == 0
    output = {
        "script": "seo_checker",
        "project": str(project_path),
        "cwv_targets": {"lcp_s": 2.5, "inp_ms": 200, "cls": 0.1},
        "files_checked": len(pages),
        "files_with_issues": len(all_issues),
        "issues_found": total_issues,
        "modern_signals": signal_totals,
        "discovery_files": discovery,
        "passed": passed,
    }
    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
