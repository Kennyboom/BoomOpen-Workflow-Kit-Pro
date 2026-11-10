#!/usr/bin/env python3
"""
i18n Checker - Detects hardcoded strings and missing translations in localized apps.
Skips cleanly ("[SKIP]") when a project has 0 locale files and 0 i18n imports.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Set

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "coverage",
    "__pycache__", ".venv", "venv", "target", "out", ".boomopen", ".agent",
}
TEST_DIRS = {"test", "tests", "__tests__", "spec", "specs", "fixtures"}
LOCALE_DIR_NAMES = {"locales", "translations", "lang", "i18n", "messages"}

HARDCODED_PATTERNS = {
    "jsx": [
        r">\s*[A-Z][a-zA-Z\s]{3,30}\s*</",
        r'(?:title|placeholder|label|alt|aria-label)="[A-Z][a-zA-Z\s]{2,}"',
        r"<(?:button|h[1-6]|p|span|label)[^>]*>\s*[A-Z][a-zA-Z\s!?.,]{3,}\s*</",
    ],
    "vue": [
        r">\s*[A-Z][a-zA-Z\s]{3,30}\s*</",
        r'(?:placeholder|label|title)="[A-Z][a-zA-Z\s]{2,}"',
    ],
    "python": [
        r'flash\s*\(\s*["\'][A-Z][^"\']{5,}["\']',
    ],
}

I18N_PATTERNS = [
    r'\bt\(["\']',
    r"\buseTranslation\b",
    r"\$t\(",
    r'\b_\(["\']',
    r"\bgettext\(",
    r"\buseTranslations\b",
    r"\bFormattedMessage\b",
    r"\bi18n\.",
]

CODE_EXTENSIONS = {
    ".tsx": "jsx", ".jsx": "jsx",
    ".vue": "vue",
    ".py": "python",
}


def flatten_keys(data: dict, prefix: str = "") -> Set[str]:
    keys: Set[str] = set()
    for key, val in data.items():
        new_key = f"{prefix}.{key}" if prefix else str(key)
        if isinstance(val, dict):
            keys.update(flatten_keys(val, new_key))
        else:
            keys.add(new_key)
    return keys


def collect_project_files(project_path: Path) -> tuple:
    """Single pruned os.walk collecting locale files and non-test UI/code files."""
    locale_files: List[Path] = []
    code_files: List[Path] = []

    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS)
        rel_parts = Path(root).relative_to(project_path).parts
        lower_parts = {p.lower() for p in rel_parts}
        in_locale_dir = bool(lower_parts & LOCALE_DIR_NAMES)
        in_test_dir = bool(lower_parts & TEST_DIRS)

        for name in sorted(names):
            fpath = Path(root) / name
            suffix = fpath.suffix.lower()
            if suffix == ".po" or (in_locale_dir and suffix == ".json"):
                locale_files.append(fpath)
                continue
            if in_test_dir or any(m in name.lower() for m in (".test.", ".spec.", "_test.", "_spec.")):
                continue
            if suffix in CODE_EXTENSIONS and len(code_files) < 50:
                code_files.append(fpath)

    return locale_files, code_files


def check_locale_completeness(locale_files: List[Path]) -> Dict[str, List[str]]:
    issues: List[str] = []
    passed: List[str] = []
    if not locale_files:
        return {"passed": [], "issues": []}

    locales: Dict[str, Dict[str, Set[str]]] = {}
    for fpath in locale_files:
        if fpath.suffix.lower() == ".json":
            try:
                lang = fpath.parent.name
                content = json.loads(fpath.read_text(encoding="utf-8"))
                if isinstance(content, dict):
                    locales.setdefault(lang, {})[fpath.stem] = flatten_keys(content)
            except (OSError, ValueError):
                continue

    if len(locales) < 2:
        passed.append(f"[OK] Found {len(locale_files)} locale file(s)")
        return {"passed": passed, "issues": issues}

    passed.append(f"[OK] Found {len(locales)} language(s): {', '.join(locales.keys())}")
    all_langs = list(locales.keys())
    base_lang = all_langs[0]

    for namespace, base_keys in locales.get(base_lang, {}).items():
        for lang in all_langs[1:]:
            other_keys = locales.get(lang, {}).get(namespace, set())
            missing = base_keys - other_keys
            if missing:
                issues.append(f"[X] {lang}/{namespace}: Missing {len(missing)} keys")
            extra = other_keys - base_keys
            if extra:
                issues.append(f"[!] {lang}/{namespace}: {len(extra)} extra keys")

    if not issues:
        passed.append("[OK] All locales have matching keys")
    return {"passed": passed, "issues": issues}


def check_hardcoded_strings(code_files: List[Path]) -> Dict[str, object]:
    issues: List[str] = []
    passed: List[str] = []
    files_with_i18n = 0
    files_with_hardcoded = 0
    examples: List[str] = []

    for file_path in code_files:
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        file_type = CODE_EXTENSIONS.get(file_path.suffix.lower(), "jsx")
        has_i18n = any(re.search(p, content) for p in I18N_PATTERNS)
        if has_i18n:
            files_with_i18n += 1

        hardcoded_found = False
        for pattern in HARDCODED_PATTERNS.get(file_type, []):
            matches = re.findall(pattern, content)
            if matches and not has_i18n:
                hardcoded_found = True
                if len(examples) < 5:
                    examples.append(f"{file_path.name}: {str(matches[0]).strip()[:40]}...")
        if hardcoded_found:
            files_with_hardcoded += 1

    passed.append(f"[OK] Analyzed {len(code_files)} code files")
    if files_with_i18n > 0:
        passed.append(f"[OK] {files_with_i18n} files use i18n")
    if files_with_hardcoded > 0:
        issues.append(f"[X] {files_with_hardcoded} files may have hardcoded strings")
        for ex in examples:
            issues.append(f"   -> {ex}")
    else:
        passed.append("[OK] No obvious hardcoded strings detected")

    return {"passed": passed, "issues": issues, "files_with_i18n": files_with_i18n}


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit i18n locale completeness and hardcoded UI strings")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()
    if not project_path.is_dir():
        print(f"Error: project path is not an existing directory: {project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)

    locale_files, code_files = collect_project_files(project_path)
    code_result = check_hardcoded_strings(code_files)

    if not locale_files and int(code_result["files_with_i18n"]) == 0:
        payload = {
            "script": "i18n_checker",
            "project": str(project_path),
            "skipped": True,
            "passed": True,
            "message": "Single-language project (no locale files or i18n imports detected)",
        }
        if args.json:
            print(json.dumps(payload, indent=2))
        else:
            print("[SKIP] No locale files or i18n framework detected - skipping i18n check.")
        sys.exit(0)

    locale_result = check_locale_completeness(locale_files)
    all_issues = locale_result["issues"] + list(code_result["issues"])  # type: ignore[arg-type]
    critical_issues = sum(1 for i in all_issues if i.startswith("[X]"))
    passed = critical_issues == 0

    if args.json:
        print(json.dumps({
            "script": "i18n_checker",
            "project": str(project_path),
            "locale_files": len(locale_files),
            "critical_issues": critical_issues,
            "issues": all_issues,
            "passed": passed,
        }, indent=2))
        sys.exit(0 if passed else 1)

    print("\n" + "=" * 60 + "\n  i18n CHECKER - Internationalization Audit\n" + "=" * 60 + "\n")
    print("[LOCALE FILES]\n" + "-" * 40)
    for item in locale_result["passed"] + locale_result["issues"]:
        print(f"  {item}")
    print("\n[CODE ANALYSIS]\n" + "-" * 40)
    for item in list(code_result["passed"]) + list(code_result["issues"]):  # type: ignore[arg-type]
        print(f"  {item}")
    print("\n" + "=" * 60)
    print("[OK] i18n CHECK: PASSED" if passed else f"[X] i18n CHECK: {critical_issues} issues found")
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
