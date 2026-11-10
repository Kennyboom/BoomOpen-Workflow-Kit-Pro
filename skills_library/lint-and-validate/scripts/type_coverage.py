#!/usr/bin/env python3
"""
Type Coverage Checker - Measures TypeScript/Python type coverage.
Identifies untyped functions, explicit any usage, and type safety issues.
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
EXCLUDED_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "coverage",
    "__pycache__", ".venv", "venv", "target", "out", ".svelte-kit",
    ".astro", ".boomopen", ".agent",
}


def collect_source_files(project_path: Path) -> tuple:
    ts_files: List[Path] = []
    py_files: List[Path] = []
    extra_skip = {"skills_library", "templates"} - set(project_path.parts)
    skip_dirs = EXCLUDED_DIRS | extra_skip
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        for name in sorted(names):
            fpath = Path(root) / name
            if name.endswith(".d.ts"):
                continue
            suffix = fpath.suffix.lower()
            if suffix in (".ts", ".tsx") and len(ts_files) < 30:
                ts_files.append(fpath)
            elif suffix == ".py" and len(py_files) < 30:
                py_files.append(fpath)
    return ts_files, py_files


def check_typescript_coverage(ts_files: List[Path]) -> Dict[str, object]:
    issues: List[str] = []
    passed: List[str] = []
    stats = {"any_count": 0, "untyped_functions": 0, "total_functions": 0}

    for file_path in ts_files:
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        stats["any_count"] += len(re.findall(r":\s*any\b|\bas\s+any\b", content))
        untyped = re.findall(r"\bfunction\s+\w+\s*\(\s*[A-Za-z_$][^:)]*\)\s*\{", content)
        untyped += re.findall(r"\b(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\(\s*[A-Za-z_$][^:)]*\)\s*=>", content)
        stats["untyped_functions"] += len(untyped)
        typed = re.findall(
            r"\bfunction\s+\w+\s*(?:<[^>]+>)?\s*\([^)]*:[^)]*\)|"
            r"\bfunction\s+\w+\s*(?:<[^>]+>)?\s*\([^)]*\)\s*:|"
            r"\b(?:const|let)\s+\w+\s*(?::\s*[^=]+=\s*(?:async\s*)?\([^)]*\)\s*=>|=\s*(?:async\s*)?\([^)]*:[^)]*\)\s*=>)",
            content,
        )
        stats["total_functions"] += len(typed) + len(untyped)

    if stats["any_count"] == 0:
        passed.append("[OK] No 'any' types found")
    elif stats["any_count"] <= 5:
        issues.append(f"[!] {stats['any_count']} 'any' types found (acceptable)")
    else:
        issues.append(f"[X] {stats['any_count']} 'any' types found (too many)")

    if stats["total_functions"] > 0:
        typed_ratio = (stats["total_functions"] - stats["untyped_functions"]) / stats["total_functions"] * 100
        if typed_ratio >= 80:
            passed.append(f"[OK] Type coverage: {typed_ratio:.0f}%")
        elif typed_ratio >= 50:
            issues.append(f"[!] Type coverage: {typed_ratio:.0f}% (improve)")
        else:
            issues.append(f"[X] Type coverage: {typed_ratio:.0f}% (too low)")

    passed.append(f"[OK] Analyzed {len(ts_files)} TypeScript files")
    return {"type": "typescript", "files": len(ts_files), "passed": passed, "issues": issues, "stats": stats}


def check_python_coverage(py_files: List[Path]) -> Dict[str, object]:
    issues: List[str] = []
    passed: List[str] = []
    stats = {"untyped_functions": 0, "typed_functions": 0, "any_count": 0}

    for file_path in py_files:
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        stats["any_count"] += len(re.findall(r":\s*Any\b", content))
        typed_funcs = re.findall(r"def\s+\w+\s*\([^)]*:[^)]+\)", content)
        typed_funcs += re.findall(r"def\s+\w+\s*\([^)]*\)\s*->", content)
        stats["typed_functions"] += len(typed_funcs)
        all_funcs = re.findall(r"def\s+\w+\s*\(", content)
        stats["untyped_functions"] += max(0, len(all_funcs) - len(typed_funcs))

    total = stats["typed_functions"] + stats["untyped_functions"]
    if total > 0:
        typed_ratio = stats["typed_functions"] / total * 100
        if typed_ratio >= 70:
            passed.append(f"[OK] Type hints coverage: {typed_ratio:.0f}%")
        elif typed_ratio >= 40:
            issues.append(f"[!] Type hints coverage: {typed_ratio:.0f}%")
        else:
            issues.append(f"[X] Type hints coverage: {typed_ratio:.0f}% (add type hints)")

    if stats["any_count"] == 0:
        passed.append("[OK] No 'Any' types found")
    elif stats["any_count"] <= 3:
        issues.append(f"[!] {stats['any_count']} 'Any' types found")
    else:
        issues.append(f"[X] {stats['any_count']} 'Any' types found")

    passed.append(f"[OK] Analyzed {len(py_files)} Python files")
    return {"type": "python", "files": len(py_files), "passed": passed, "issues": issues, "stats": stats}


def main() -> None:
    parser = argparse.ArgumentParser(description="Check TypeScript and Python type coverage")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()
    if not project_path.is_dir():
        print(f"Error: project path is not an existing directory: {project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)

    ts_files, py_files = collect_source_files(project_path)
    results = []
    if ts_files:
        results.append(check_typescript_coverage(ts_files))
    if py_files:
        results.append(check_python_coverage(py_files))

    if not results:
        if args.json:
            print(json.dumps({"script": "type_coverage", "skipped": True, "passed": True}, indent=2))
        else:
            print("[SKIP] No TypeScript or Python files found.")
        sys.exit(0)

    critical_issues = sum(
        1 for r in results for item in list(r["issues"]) if str(item).startswith("[X]")  # type: ignore[arg-type]
    )
    passed = critical_issues == 0
    if args.json:
        print(json.dumps({"script": "type_coverage", "results": results, "passed": passed}, indent=2))
        sys.exit(0 if passed else 1)

    print("\n" + "=" * 60 + "\n  TYPE COVERAGE CHECKER\n" + "=" * 60 + "\n")
    for res in results:
        print(f"\n[{str(res['type']).upper()}]\n" + "-" * 40)
        for item in list(res["passed"]) + list(res["issues"]):  # type: ignore[arg-type]
            print(f"  {item}")
    print("\n" + "=" * 60)
    print("[OK] TYPE COVERAGE: ACCEPTABLE" if passed else f"[X] TYPE COVERAGE: {critical_issues} critical issues")
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
