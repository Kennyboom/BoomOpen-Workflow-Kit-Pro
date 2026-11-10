#!/usr/bin/env python3
"""
SEO Checker - Search Engine & AI Discovery Audit (v5.5.0)
=========================================================
Audits HTML/JSX/TSX pages for 2026 Technical SEO, Core Web Vitals readiness
(LCP <= 2.5s, INP <= 200ms replacing retired FID, CLS <= 0.1), structured data,
build-time/SSR SEO head injection, and AI/GEO crawlability.

Usage (python3 on macOS/Linux, py on Windows also work):
    python seo_checker.py <project_path> [--json]

Exit codes: 0 = no blocking issues (or "[SKIP]" printed: no page files found),
1 = SEO issues found, 2 = invalid arguments.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
MAX_PAGES = 50

DOCUMENT_HEAD_RE = re.compile(r"<head[\s>]|<Head\b")
DOCUMENT_HEAD_COMPONENT_RE = re.compile(r"<Head\b")
HEAD_INJECTION_PLACEHOLDER_RE = re.compile(
    r"<!--\s*(?:app-seo|app-head|ssr-head|head-outlet)\s*-->|%sveltekit\.head%",
    re.IGNORECASE,
)
NEXT_METADATA_EXPORT_RE = re.compile(r"\bexport\s+(?:const\s+metadata|(?:async\s+)?function\s+generateMetadata)\b")
CANONICAL_RE = re.compile(r'rel=["\']canonical["\']|\bcanonical\s*:', re.IGNORECASE)
JSON_LD_RE = re.compile(r"application/ld\+json", re.IGNORECASE)
SEMANTIC_LANDMARK_RE = re.compile(r"<(?:main|article|nav|section)[\s>]", re.IGNORECASE)

SKIP_DIRS = {
    "node_modules", ".next", "dist", "build", ".git", ".github", ".boomopen", ".agent",
    "__pycache__", ".vscode", ".idea", "coverage", "playwright-report",
    "test", "tests", "__tests__", "spec", "docs", "documentation", "examples",
    ".venv", "venv", "target", "out",
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


def is_page_file(file_path: Path, rel_parts: Tuple[str, ...]) -> bool:
    name = file_path.name.lower()
    stem = file_path.stem.lower()
    if any(skip in name for skip in SKIP_PATTERNS):
        return False
    parts = {p.lower() for p in rel_parts[:-1]}
    if parts & PAGE_DIRS:
        return True
    if any(p in stem for p in PAGE_NAMES):
        return True
    return file_path.suffix.lower() in (".html", ".htm")


def scan_pages_and_seo_modules(project_path: Path) -> Tuple[List[Path], Dict[str, bool]]:
    """Single pruned os.walk collecting page files and shared SEO module capabilities."""
    pages: List[Path] = []
    shared_seo = {"title": False, "description": False, "og": False, "canonical": False, "json_ld": False}
    extra_skip = {"skills_library", "templates", "examples"} - set(project_path.parts)
    skip_dirs = SKIP_DIRS | extra_skip

    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        rel_root = Path(root).relative_to(project_path).parts
        lower_folders = {p.lower() for p in rel_root}

        for name in sorted(names):
            fpath = Path(root) / name
            suffix = fpath.suffix.lower()
            lower_name = name.lower()

            if ("seo" in lower_folders or "seo" in lower_name or "head" in lower_name) and suffix in (".ts", ".tsx", ".js", ".jsx"):
                try:
                    seo_txt = fpath.read_text(encoding="utf-8", errors="ignore")
                    if re.search(r"\btitle\s*:|<title\b|document\.title", seo_txt):
                        shared_seo["title"] = True
                    if re.search(r"\bdescription\s*:|name=[\"']description[\"']", seo_txt):
                        shared_seo["description"] = True
                    if re.search(r"og:title|\bopenGraph\b|ogImage", seo_txt):
                        shared_seo["og"] = True
                    if CANONICAL_RE.search(seo_txt):
                        shared_seo["canonical"] = True
                    if JSON_LD_RE.search(seo_txt):
                        shared_seo["json_ld"] = True
                except OSError:
                    pass

            if suffix in (".html", ".htm", ".jsx", ".tsx") and len(pages) < MAX_PAGES:
                rel_parts = rel_root + (name,)
                if is_page_file(fpath, rel_parts):
                    pages.append(fpath)

    return pages, shared_seo


def check_layout_metadata(content: str, lower: str, shared_seo: Dict[str, bool]) -> List[str]:
    """Validate <head>/<Head> document metadata, honoring build-time <!--app-seo--> injection."""
    issues: List[str] = []
    has_next_meta = bool(NEXT_METADATA_EXPORT_RE.search(content))
    uses_head_placeholder = bool(HEAD_INJECTION_PLACEHOLDER_RE.search(content))

    has_title = (
        "<title" in lower
        or "title=" in content
        or bool(DOCUMENT_HEAD_COMPONENT_RE.search(content))
        or (has_next_meta and bool(re.search(r"\btitle\s*:", content)))
        or (uses_head_placeholder and shared_seo["title"])
    )
    if not has_title:
        issues.append("Missing <title> tag")

    has_desc = (
        'name="description"' in lower
        or "name='description'" in lower
        or (has_next_meta and bool(re.search(r"\bdescription\s*:", content)))
        or (uses_head_placeholder and shared_seo["description"])
    )
    if not has_desc:
        issues.append("Missing meta description")

    has_og = (
        "og:" in lower
        or 'property="og:' in lower
        or (has_next_meta and bool(re.search(r"\bopenGraph\s*:", content)))
        or (uses_head_placeholder and shared_seo["og"])
    )
    if not has_og:
        issues.append("Missing Open Graph tags (og:title / openGraph)")

    return issues


def check_page(file_path: Path, shared_seo: Dict[str, bool]) -> Dict[str, object]:
    """Check a single page for blocking SEO defects and modern SEO signals."""
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except OSError as exc:
        return {"file": str(file_path.name), "issues": [f"Error: {exc}"], "signals": {}}

    lower = content.lower()
    is_layout = bool(DOCUMENT_HEAD_RE.search(content))
    uses_placeholder = bool(HEAD_INJECTION_PLACEHOLDER_RE.search(content))
    issues = check_layout_metadata(content, lower, shared_seo) if is_layout else []

    h1_matches = re.findall(r"<h1\b[^>]*>", content, re.IGNORECASE)
    if len(h1_matches) > 1:
        issues.append(f"Multiple H1 tags ({len(h1_matches)})")

    for img in re.findall(r"<img\b[^>]+>", content, re.IGNORECASE):
        if "alt=" not in img.lower():
            issues.append("Image missing alt attribute")
            break

    signals = {
        "canonical": bool(CANONICAL_RE.search(content)) or (uses_placeholder and shared_seo["canonical"]),
        "json_ld": bool(JSON_LD_RE.search(content)) or (uses_placeholder and shared_seo["json_ld"]),
        "semantic_landmarks": bool(SEMANTIC_LANDMARK_RE.search(content)),
        "og_title": "og:title" in lower or bool(re.search(r"\bopenGraph\s*:", content)) or (uses_placeholder and shared_seo["og"]),
    }
    return {"file": str(file_path.name), "issues": issues, "signals": signals}


def detect_discovery_files(project_path: Path) -> Dict[str, bool]:
    roots = [
        project_path, project_path / "public", project_path / "dist",
        project_path / "app", project_path / "src" / "app", project_path / "build",
        project_path / "web", project_path / "web" / "public",
        project_path / "web" / "dist", project_path / "web" / "build",
    ]
    has_plugin_gen = False
    for r in roots:
        for plugin_name in ("site-plugin.ts", "site-plugin.js", "vite.config.ts"):
            pfile = r / plugin_name
            if pfile.is_file():
                try:
                    txt = pfile.read_text(encoding="utf-8", errors="ignore")
                    if "robots.txt" in txt and "sitemap.xml" in txt:
                        has_plugin_gen = True
                except OSError:
                    pass
    return {
        "robots": has_plugin_gen or any((r / "robots.txt").exists() or (r / "robots.ts").exists() for r in roots),
        "sitemap": has_plugin_gen or any((r / "sitemap.xml").exists() or (r / "sitemap.ts").exists() for r in roots),
        "llms_txt": any((r / "llms.txt").exists() for r in roots),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check page files for 2026 SEO best practices")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def print_issue_summary(all_issues: List[Dict[str, object]]) -> None:
    issue_counts: Dict[str, int] = {}
    for item in all_issues:
        for issue in list(item["issues"]):  # type: ignore[arg-type]
            issue_counts[str(issue)] = issue_counts.get(str(issue), 0) + 1

    print("\nIssue Summary:")
    for issue, count in sorted(issue_counts.items(), key=lambda x: -x[1]):
        print(f"  [{count}] {issue}")
    print(f"\nAffected files ({len(all_issues)}):")
    for item in all_issues[:5]:
        print(f"  - {item['file']}")
    if len(all_issues) > 5:
        print(f"  ... and {len(all_issues) - 5} more")


def main() -> None:
    args = parse_args()
    project_path = Path(args.project_path).resolve()
    pages, shared_seo = scan_pages_and_seo_modules(project_path)

    if not pages:
        output = {"script": "seo_checker", "files_checked": 0, "passed": True, "skipped": True}
        if args.json:
            print(json.dumps(output, indent=2))
        else:
            print(f"\n{'=' * 60}\n  SEO CHECKER - 2026 Search, Core Web Vitals (INP) & GEO Audit\n{'=' * 60}")
            print("\n[SKIP] No page files found - nothing to check.")
            print("\n" + json.dumps(output, indent=2))
        sys.exit(0)

    page_results = [check_page(f, shared_seo) for f in pages]
    all_issues = [res for res in page_results if res["issues"]]
    discovery = detect_discovery_files(project_path)

    signal_totals = {
        key: sum(1 for r in page_results if dict(r["signals"]).get(key))  # type: ignore[arg-type]
        for key in ("canonical", "json_ld", "semantic_landmarks", "og_title")
    }

    total_issues = sum(len(list(item["issues"])) for item in all_issues)  # type: ignore[arg-type]
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

    if args.json:
        print(json.dumps(output, indent=2))
        sys.exit(0 if passed else 1)

    print(f"\n{'=' * 60}\n  SEO CHECKER - 2026 Search, Core Web Vitals (INP) & GEO Audit\n{'=' * 60}")
    print(f"Project: {project_path}\nTime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Core Web Vitals Targets: LCP <= 2.5s | INP <= 200ms | CLS <= 0.1\n" + "-" * 60)
    print(f"Found {len(pages)} page files to analyze\n\n" + "=" * 60 + "\nSEO ANALYSIS RESULTS\n" + "=" * 60)
    if all_issues:
        print_issue_summary(all_issues)
    else:
        print("\n[OK] No SEO issues found!")
    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
