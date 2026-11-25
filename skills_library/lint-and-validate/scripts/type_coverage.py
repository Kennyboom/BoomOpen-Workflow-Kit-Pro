#!/usr/bin/env python3
"""
Type Coverage Checker - Measures TypeScript/Python type coverage.
Identifies untyped functions, explicit any usage, and BoomOpen Tier 1 type safety issues.
"""
import argparse
import ast
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

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
    ".astro", ".boomopen", ".agent", "test", "tests", "__tests__",
    "e2e", "fixtures", "cypress", "__mocks__",
}

TS_COMMENT_OR_STRING_RE = re.compile(
    r"//[^\n]*|/\*[\s\S]*?\*/|'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"|`(?:\\.|[^`\\])*`"
)


def is_test_filename(name: str) -> bool:
    low = name.lower()
    if ".test." in low or ".spec." in low:
        return True
    if low.endswith(".py") and (low.startswith("test_") or low.endswith("_test.py") or low == "conftest.py"):
        return True
    return False


def collect_source_files(project_path: Path) -> Tuple[List[Path], List[Path]]:
    ts_files: List[Path] = []
    py_files: List[Path] = []
    extra_skip = {"skills_library", "templates", "examples"} - {project_path.name}
    skip_dirs = EXCLUDED_DIRS | extra_skip
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        for name in sorted(names):
            if name.endswith(".d.ts") or is_test_filename(name):
                continue
            fpath = Path(root) / name
            suffix = fpath.suffix.lower()
            if suffix in (".ts", ".tsx"):
                ts_files.append(fpath)
            elif suffix == ".py":
                py_files.append(fpath)
    return ts_files, py_files


def strip_ts_comments_and_strings(content: str) -> str:
    """Replace JS/TS comments and string literals so `: any` inside text is ignored."""
    return TS_COMMENT_OR_STRING_RE.sub(
        lambda m: '""' if m.group(0)[0] in ("'", '"', "`") else " ",
        content,
    )


def check_typescript_coverage(ts_files: List[Path]) -> Dict[str, object]:
    issues: List[str] = []
    passed: List[str] = []
    stats = {"any_count": 0, "untyped_functions": 0, "total_functions": 0}

    for file_path in ts_files:
        try:
            raw = file_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        content = strip_ts_comments_and_strings(raw)
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
        passed.append("[OK] No explicit 'any' types found (Tier 1 compliant)")
    else:
        issues.append(f"[X] {stats['any_count']} explicit 'any' type(s) found (BoomOpen Tier 1 requires 0)")

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


def count_any_in_annotation(annotation: ast.AST) -> int:
    count = 0
    for sub in ast.walk(annotation):
        if isinstance(sub, ast.Name) and sub.id == "Any":
            count += 1
        elif isinstance(sub, ast.Attribute) and sub.attr == "Any":
            count += 1
    return count


def analyze_python_ast(content: str, filename: str) -> Tuple[int, int, int]:
    """Return (typed_functions, untyped_functions, any_count) using Python AST."""
    tree = ast.parse(content, filename=filename)
    typed_funcs = 0
    untyped_funcs = 0
    any_count = 0

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            all_args = list(node.args.posonlyargs) + list(node.args.args) + list(node.args.kwonlyargs)
            if node.args.vararg:
                all_args.append(node.args.vararg)
            if node.args.kwarg:
                all_args.append(node.args.kwarg)
            annotations = [arg.annotation for arg in all_args if arg.annotation is not None]
            if node.returns is not None:
                annotations.append(node.returns)
            if annotations:
                typed_funcs += 1
                any_count += sum(count_any_in_annotation(ann) for ann in annotations)
            else:
                untyped_funcs += 1
        elif isinstance(node, ast.AnnAssign) and node.annotation is not None:
            any_count += count_any_in_annotation(node.annotation)

    return typed_funcs, untyped_funcs, any_count


def check_python_coverage(py_files: List[Path]) -> Dict[str, object]:
    issues: List[str] = []
    passed: List[str] = []
    stats = {"untyped_functions": 0, "typed_functions": 0, "total_functions": 0, "any_count": 0}

    for file_path in py_files:
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        try:
            typed_cnt, untyped_cnt, any_cnt = analyze_python_ast(content, str(file_path))
            stats["typed_functions"] += typed_cnt
            stats["untyped_functions"] += untyped_cnt
            stats["any_count"] += any_cnt
        except SyntaxError:
            all_defs = re.findall(r"def\s+\w+\s*\([^)]*\)\s*(?:->\s*[^:]+)?:", content)
            typed_defs = [sig for sig in all_defs if "->" in sig or re.search(r"\([^)]*:[^)]+\)", sig)]
            stats["typed_functions"] += len(typed_defs)
            stats["untyped_functions"] += max(0, len(all_defs) - len(typed_defs))
            stats["any_count"] += len(re.findall(r":\s*Any\b", content))

    total = stats["typed_functions"] + stats["untyped_functions"]
    stats["total_functions"] = total
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
