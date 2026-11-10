#!/usr/bin/env python3
"""
Schema Validator - Database schema validation (v5.5.0)
Validates Prisma and Drizzle ORM schemas (including src/db/schema.ts and *.schema.ts).

Usage (python3 on macOS/Linux, py on Windows also work):
    python schema_validator.py <project_path> [--json]

Exit codes: 0 = validated (schema issues are advisory) or "[SKIP]" printed
when no schema files exist, 2 = invalid arguments.
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
MAX_SCHEMAS = 10
EXCLUDED_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "coverage",
    "__pycache__", ".venv", "venv", "target", "out", ".boomopen", ".agent",
}
DRIZZLE_DIRS = {"drizzle", "db", "database", "schema", "schemas"}
DRIZZLE_MARKER_RE = re.compile(r"\bdrizzle-orm\b|\b(?:pgTable|mysqlTable|sqliteTable)\s*\(")
DRIZZLE_TABLE_HEAD_RE = re.compile(
    r"(\w+)\s*=\s*(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*[\"']([^\"']+)[\"']\s*,\s*\{"
)


def extract_balanced_braces(text: str, open_brace_idx: int) -> str:
    """Return substring inside `{ ... }` starting at `open_brace_idx` (`text[open_brace_idx] == '{'`)."""
    depth = 0
    quote = ""
    idx = open_brace_idx
    length = len(text)
    while idx < length:
        ch = text[idx]
        if quote:
            if ch == "\\" and idx + 1 < length:
                idx += 2
                continue
            if ch == quote:
                quote = ""
        else:
            if ch in ("'", '"', "`"):
                quote = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return text[open_brace_idx + 1 : idx]
        idx += 1
    return text[open_brace_idx + 1 :]


def extract_drizzle_tables(content: str) -> List[Tuple[str, str, str]]:
    """Extract (var_name, table_name, full_columns_body) handling nested column option braces."""
    tables: List[Tuple[str, str, str]] = []
    for match in DRIZZLE_TABLE_HEAD_RE.finditer(content):
        brace_pos = match.end() - 1
        body = extract_balanced_braces(content, brace_pos)
        tables.append((match.group(1), match.group(2), body))
    return tables


def find_schema_files(project_path: Path) -> List[Tuple[str, Path]]:
    """Find Prisma and Drizzle database schema files via pruned os.walk."""
    schemas: List[Tuple[str, Path]] = []
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDED_DIRS)
        rel_parts = {p.lower() for p in Path(root).relative_to(project_path).parts}
        for name in sorted(names):
            fpath = Path(root) / name
            lower_name = name.lower()
            if lower_name.endswith(".prisma") and ("prisma" in rel_parts or lower_name == "schema.prisma"):
                schemas.append(("prisma", fpath))
            elif fpath.suffix.lower() == ".ts" and not lower_name.endswith((".d.ts", ".test.ts", ".spec.ts")):
                is_candidate = bool(rel_parts & DRIZZLE_DIRS) or "schema" in lower_name or "table" in lower_name
                if not is_candidate:
                    continue
                try:
                    head = fpath.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                if DRIZZLE_MARKER_RE.search(head):
                    schemas.append(("drizzle", fpath))
            if len(schemas) >= MAX_SCHEMAS:
                return schemas
    return schemas


def validate_prisma_schema(file_path: Path) -> List[str]:
    """Validate Prisma schema file."""
    issues: List[str] = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        models = re.findall(r"model\s+(\w+)\s*\{([^}]+)\}", content, re.DOTALL)

        for model_name, model_body in models:
            if not model_name[0].isupper():
                issues.append(f"Model '{model_name}' should be PascalCase")
            if "@id" not in model_body and "@@id" not in model_body and "id" not in model_body.lower():
                issues.append(f"Model '{model_name}' might be missing @id field")
            if "createdAt" not in model_body and "created_at" not in model_body:
                issues.append(f"Model '{model_name}' missing createdAt field (recommended)")
            foreign_keys = re.findall(r"(\w+Id)\s+\w+", model_body)
            for fk in foreign_keys:
                if f"@@index([{fk}" not in content and f'@@index(["{fk}' not in content:
                    issues.append(f"Consider adding @@index([{fk}]) for better query performance in {model_name}")

        for enum_name in re.findall(r"enum\s+(\w+)\s*\{", content):
            if not enum_name[0].isupper():
                issues.append(f"Enum '{enum_name}' should be PascalCase")
    except OSError as exc:
        issues.append(f"Error reading schema: {str(exc)[:50]}")
    return issues


def validate_drizzle_schema(file_path: Path) -> List[str]:
    """Validate Drizzle ORM schema file (pgTable / mysqlTable / sqliteTable)."""
    issues: List[str] = []
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
        if re.search(r":\s*any\b|\bas\s+any\b", content):
            issues.append("Explicit 'any' type detected in Drizzle schema; use typed column builders")

        tables = extract_drizzle_tables(content)
        has_index_helper = bool(re.search(r"\b(?:index|uniqueIndex)\s*\(", content))

        for var_name, table_name, table_body in tables:
            label = f"{var_name} ('{table_name}')"
            if ".primaryKey(" not in table_body and "primaryKey(" not in content:
                issues.append(f"Drizzle table {label} might be missing a .primaryKey() definition")
            if "createdAt" not in table_body and "created_at" not in table_body:
                issues.append(f"Drizzle table {label} missing createdAt/created_at timestamp column (recommended)")
            if ".references(" in table_body and not has_index_helper:
                issues.append(f"Consider adding index() on foreign key columns in Drizzle table {label}")
    except OSError as exc:
        issues.append(f"Error reading schema: {str(exc)[:50]}")
    return issues


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Prisma/Drizzle schema files")
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
    schemas = find_schema_files(project_path)

    if not schemas:
        output = {
            "script": "schema_validator",
            "project": str(project_path),
            "schemas_checked": 0,
            "issues_found": 0,
            "passed": True,
            "skipped": True,
            "message": "No schema files found",
        }
        if args.json:
            print(json.dumps(output, indent=2))
        else:
            print(f"\n{'=' * 60}\n[SCHEMA VALIDATOR] Database Schema Validation\n{'=' * 60}")
            print("[SKIP] No schema files found - nothing to validate.")
            print(json.dumps(output, indent=2))
        sys.exit(0)

    all_issues: List[Dict[str, object]] = []
    for schema_type, file_path in schemas:
        issues = validate_prisma_schema(file_path) if schema_type == "prisma" else validate_drizzle_schema(file_path)
        if issues:
            all_issues.append({"file": str(file_path.name), "type": schema_type, "issues": issues})

    total_issues = sum(len(list(item["issues"])) for item in all_issues)  # type: ignore[arg-type]
    output = {
        "script": "schema_validator",
        "project": str(project_path),
        "schemas_checked": len(schemas),
        "issues_found": total_issues,
        "passed": True,
        "issues": all_issues,
    }

    if args.json:
        print(json.dumps(output, indent=2))
        sys.exit(0)

    print(f"\n{'=' * 60}\n[SCHEMA VALIDATOR] Database Schema Validation\n{'=' * 60}")
    print(f"Project: {project_path}\nTime: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n" + "-" * 60)
    print(f"Found {len(schemas)} schema files")
    print("\n" + "=" * 60 + "\nSCHEMA ISSUES\n" + "=" * 60)
    if all_issues:
        for item in all_issues:
            print(f"\n{item['file']} ({item['type']}):")
            item_issues = list(item["issues"])  # type: ignore[arg-type]
            for issue in item_issues[:5]:
                print(f"  - {issue}")
            if len(item_issues) > 5:
                print(f"  ... and {len(item_issues) - 5} more issues")
    else:
        print("No schema issues found!")

    print("\n" + json.dumps(output, indent=2))
    sys.exit(0)


if __name__ == "__main__":
    main()
