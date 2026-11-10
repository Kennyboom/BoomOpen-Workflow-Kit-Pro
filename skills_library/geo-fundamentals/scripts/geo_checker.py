#!/usr/bin/env python3
"""
GEO Checker - Generative Engine Optimization Audit
Checks public web pages for AI citation readiness using pruned directory walks.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
SKIP_DIRS = {
    "node_modules", ".next", "dist", "build", ".git", ".github", ".boomopen", ".agent",
    "__pycache__", ".vscode", ".idea", "coverage", "test", "tests",
    "__tests__", "spec", "docs", "documentation", "target", "out", ".venv", "venv",
}
SKIP_FILE_MARKERS = (
    "jest.config", "webpack.config", "vite.config", "tsconfig",
    "package.json", "package-lock", "yarn.lock", ".eslintrc",
    "tailwind.config", "postcss.config", "next.config",
    "notfound", "not-found", "404", "500", "error", "loading", "layout",
)
PAGE_DIRS = {"pages", "app", "routes"}
PAGE_INDICATORS = ("page", "index", "home", "about", "contact", "blog", "post", "article", "product", "service", "landing")
EDITORIAL_INDICATORS = ("blog", "post", "article")


def is_page_file(file_path: Path, rel_parts: tuple) -> bool:
    stem = file_path.stem.lower()
    if any(skip in stem for skip in SKIP_FILE_MARKERS):
        return False
    if stem.endswith((".test", ".spec")) or stem.startswith(("test_", "spec_")):
        return False
    folder_parts = {p.lower() for p in rel_parts[:-1]}
    if folder_parts & PAGE_DIRS:
        return True
    if any(ind in stem for ind in PAGE_INDICATORS):
        return True
    return file_path.suffix.lower() in (".html", ".htm")


def scan_project_geo(project_path: Path) -> tuple:
    """Single pruned os.walk collecting public pages and shared SEO/JSON-LD signals."""
    pages: List[Path] = []
    has_shared_json_ld = False
    has_shared_entity = False

    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        rel_root = Path(root).relative_to(project_path).parts
        for name in sorted(names):
            fpath = Path(root) / name
            suffix = fpath.suffix.lower()
            if suffix in (".ts", ".tsx", ".js", ".jsx", ".html") and ("seo" in name.lower() or "structured" in name.lower() or "schema" in name.lower() or "layout" in name.lower()):
                try:
                    seo_txt = fpath.read_text(encoding="utf-8", errors="ignore")
                    if "application/ld+json" in seo_txt or "schema.org" in seo_txt:
                        has_shared_json_ld = True
                    if re.search(r'"@type"\s*:\s*"(?:Organization|WebSite|SoftwareApplication|Brand)"', seo_txt):
                        has_shared_entity = True
                except OSError:
                    pass
            if suffix in (".html", ".htm", ".jsx", ".tsx") and len(pages) < 30:
                rel_parts = rel_root + (name,)
                if is_page_file(fpath, rel_parts):
                    pages.append(fpath)

    return pages, has_shared_json_ld, has_shared_entity


def is_editorial_page(file_path: Path, content: str) -> bool:
    lower_path = file_path.as_posix().lower()
    if any(marker in lower_path for marker in EDITORIAL_INDICATORS):
        return True
    return bool(re.search(r'"@type"\s*:\s*"(?:Article|BlogPosting|NewsArticle)"', content))


def check_page(file_path: Path, shared_json_ld: bool, shared_entity: bool) -> Dict[str, object]:
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except OSError as exc:
        return {"file": str(file_path.name), "passed": [], "issues": [f"Error: {exc}"], "score": 0}

    issues: List[str] = []
    passed: List[str] = []
    editorial = is_editorial_page(file_path, content)

    if "application/ld+json" in content or shared_json_ld:
        passed.append("JSON-LD structured data found")
    else:
        issues.append("No JSON-LD structured data (AI engines prefer structured content)")

    h1_count = len(re.findall(r"<h1\b[^>]*>", content, re.IGNORECASE))
    h2_count = len(re.findall(r"<h2\b[^>]*>", content, re.IGNORECASE))
    has_landmarks = bool(re.search(r"<(?:main|section|article|nav)\b", content, re.IGNORECASE))

    if h1_count == 1:
        passed.append("Single H1 heading (clear topic)")
    elif h1_count > 1:
        issues.append(f"Multiple H1 headings ({h1_count}) - confusing for AI")
    elif has_landmarks:
        passed.append("Semantic landmarks present")

    if h2_count >= 1:
        passed.append(f"{h2_count} H2 subheading(s)")

    author_patterns = ("author", "byline", "written-by", "contributor", 'rel="author"')
    if any(p in content.lower() for p in author_patterns):
        passed.append("Author attribution found")
    elif editorial:
        issues.append("No author info on editorial article")

    date_patterns = ("datePublished", "dateModified", "datetime=", "pubdate", "article:published")
    if any(re.search(p, content, re.IGNORECASE) for p in date_patterns):
        passed.append("Publication date found")
    elif editorial:
        issues.append("No publication date on editorial article")

    if any(re.search(p, content, re.IGNORECASE) for p in (r"<details", r"faq", r"frequently.?asked", r'"FAQPage"')):
        passed.append("FAQ section detected")

    if len(re.findall(r"<(?:ul|ol)\b[^>]*>", content, re.IGNORECASE)) >= 1:
        passed.append("Structured list content")
    if len(re.findall(r"<table\b[^>]*>", content, re.IGNORECASE)) >= 1:
        passed.append("Structured table content")

    if shared_entity or re.search(r'"@type"\s*:\s*"(?:Organization|LocalBusiness|Brand|SoftwareApplication)"', content, re.IGNORECASE):
        passed.append("Entity/Brand recognition (E-E-A-T)")

    total = len(passed) + len(issues)
    score = round(len(passed) / total * 100) if total > 0 else 100
    return {"file": str(file_path.name), "passed": passed, "issues": issues, "score": score}


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit public web pages for AI citation / GEO readiness")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    parser.add_argument("--strict-geo", action="store_true", help="Fail exit code when GEO score < 60")
    args = parser.parse_args()

    target_path = Path(args.project_path).resolve()
    if not target_path.is_dir():
        print(f"Error: project path is not an existing directory: {target_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)

    pages, shared_json_ld, shared_entity = scan_project_geo(target_path)
    if not pages:
        output = {"script": "geo_checker", "pages_found": 0, "skipped": True, "passed": True}
        if args.json:
            print(json.dumps(output, indent=2))
        else:
            print("[SKIP] No public web pages found - nothing to check.")
            print(json.dumps(output, indent=2))
        sys.exit(0)

    results = [check_page(p, shared_json_ld, shared_entity) for p in pages]
    avg_score = sum(int(r["score"]) for r in results) / len(results)
    passed = avg_score >= 60 if args.strict_geo else avg_score >= 40

    output = {
        "script": "geo_checker",
        "project": str(target_path),
        "pages_checked": len(results),
        "average_score": round(avg_score),
        "passed": passed,
    }
    if args.json:
        print(json.dumps(output, indent=2))
        sys.exit(0 if passed else 1)

    print("\n" + "=" * 60 + "\n  GEO CHECKER - AI Citation Readiness Audit\n" + "=" * 60)
    print(f"Project: {target_path}\nFound {len(pages)} public pages to analyze\n" + "-" * 60)
    for res in results:
        tag = "[OK]" if int(res["score"]) >= 60 else "[!]"
        print(f"{tag} {res['file']}: {res['score']}%")
        for issue in list(res["issues"])[:2]:  # type: ignore[arg-type]
            print(f"    - {issue}")
    print("\n" + "=" * 60 + f"\nAVERAGE GEO SCORE: {avg_score:.0f}%\n" + "=" * 60)
    print("\n" + json.dumps(output, indent=2))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
