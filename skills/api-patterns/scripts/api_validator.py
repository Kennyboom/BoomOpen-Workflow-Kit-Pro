#!/usr/bin/env python3
"""
API Validator - Checks backend API endpoints and OpenAPI specs for best practices.

Usage (python3 on macOS/Linux, py on Windows also work):
    python api_validator.py <project_path> [--json]

Exit codes: 0 = no critical issues (or "[SKIP]" printed: no API files found),
1 = critical issues, 2 = invalid arguments.
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
MAX_FILES = 15
EXCLUDED_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__", ".next",
    ".svelte-kit", "coverage", ".boomopen", ".agent", ".venv", "venv", "target", "out",
}
FRONTEND_CLIENT_DIRS = {
    "components", "features", "hooks", "composables", "pages",
    "views", "screens", "client", "ui", "store", "stores",
}
CODE_SUFFIXES = {".ts", ".js", ".py"}
API_DIR_SUFFIXES = {
    "routes": {".ts", ".js", ".py"},
    "routers": {".ts", ".js", ".py"},
    "controllers": {".ts", ".js"},
    "endpoints": {".ts", ".py"},
}
ROUTE_HANDLER_NAMES = {"route.ts", "route.js", "+server.ts", "+server.js"}
SPEC_NAMES = {"swagger.json", "swagger.yaml", "openapi.json", "openapi.yaml"}
SPEC_SUFFIXES = (".openapi.json", ".openapi.yaml")
LOOKING_FOR = "routes/, controllers/, endpoints/, api/, route.ts, +server.ts, openapi.json/yaml"


def is_api_file(rel_parts: tuple) -> bool:
    """Classify a project-relative path as backend API code or OpenAPI spec."""
    name = rel_parts[-1].lower()
    if name in ("api_validator.py", "api_scaffolder.py"):
        return False
    if any(m in name for m in (".test.", ".spec.", "_test.", "_spec.", ".d.ts")):
        return False
    folders = tuple(part.lower() for part in rel_parts[:-1])
    if "scripts" in folders:
        return False
    suffix = Path(name).suffix
    if name in SPEC_NAMES or name.endswith(SPEC_SUFFIXES) or name in ROUTE_HANDLER_NAMES:
        return True
    if "api" in folders:
        return suffix in (".ts", ".js", ".py")
    if any(folder in FRONTEND_CLIENT_DIRS for folder in folders):
        return False
    if folders and suffix in API_DIR_SUFFIXES.get(folders[-1], ()):
        return True
    return suffix in CODE_SUFFIXES and "api" in Path(name).stem


def find_api_files(project_path: Path) -> List[Path]:
    """Find API-related files in a stable order via pruned os.walk."""
    files: List[Path] = []
    extra_skip = {"skills", "skills_library", "scripts"} - set(project_path.parts)
    skip_dirs = EXCLUDED_DIRS | extra_skip
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        rel_root = Path(root).relative_to(project_path).parts
        for name in sorted(names):
            if is_api_file(rel_root + (name,)):
                files.append(Path(root) / name)
    return files


def check_openapi_spec(file_path: Path) -> Dict[str, object]:
    """Check OpenAPI/Swagger specification."""
    issues: List[str] = []
    passed: List[str] = []

    try:
        content = file_path.read_text(encoding="utf-8")
        if file_path.suffix == ".json":
            spec = json.loads(content)
        else:
            if "openapi:" in content or "swagger:" in content:
                passed.append("[OK] OpenAPI/Swagger version defined")
            else:
                issues.append("[X] No OpenAPI version found")
            if "paths:" in content:
                passed.append("[OK] Paths section exists")
            else:
                issues.append("[X] No paths defined")
            if "components:" in content or "definitions:" in content:
                passed.append("[OK] Schema components defined")
            return {"file": str(file_path), "passed": passed, "issues": issues, "type": "openapi"}

        if "openapi" in spec or "swagger" in spec:
            passed.append("[OK] OpenAPI version defined")
        if "info" in spec:
            if "title" in spec["info"]:
                passed.append("[OK] API title defined")
            if "version" in spec["info"]:
                passed.append("[OK] API version defined")
            if "description" not in spec["info"]:
                issues.append("[!] API description missing")
        if "paths" in spec:
            passed.append(f"[OK] {len(spec['paths'])} endpoints defined")
            for path, methods in spec["paths"].items():
                for method, details in methods.items():
                    if method in ("get", "post", "put", "patch", "delete"):
                        if "responses" not in details:
                            issues.append(f"[X] {method.upper()} {path}: No responses defined")
                        if "summary" not in details and "description" not in details:
                            issues.append(f"[!] {method.upper()} {path}: No description")
    except (OSError, ValueError, AttributeError, TypeError) as exc:
        issues.append(f"[X] Parse error: {exc}")

    return {"file": str(file_path), "passed": passed, "issues": issues, "type": "openapi"}


def check_api_code(file_path: Path) -> Dict[str, object]:
    """Check backend API route/controller code for best practices."""
    issues: List[str] = []
    passed: List[str] = []

    try:
        content = file_path.read_text(encoding="utf-8")
        error_patterns = [
            r"try\s*\{", r"try:", r"\.catch\(", r"except\s+", r"catch\s*\(",
            r"\bonError\b", r"\bHTTPException\b", r"\bTRPCError\b",
            r"\bApiError\b", r"\bAppError\b", r"\bNextResponse\.json\b",
            r"\bResponse\.json\b", r"\bc\.json\b", r"\bc\.text\b",
            r"\bsafeParse\b", r"\bzValidator\b",
        ]
        if any(re.search(p, content) for p in error_patterns):
            passed.append("[OK] Error handling / typed response handler present")
        else:
            issues.append("[X] No error handling found")

        status_patterns = [
            r"status\s*\(\s*\d{3}\s*\)", r"statusCode\s*[=:]\s*\d{3}",
            r"HttpStatus\.", r"status_code\s*=\s*\d{3}",
            r"\.status\(\d{3}\)", r"res\.status\(", r"status\s*:\s*\d{3}",
            r"\bc\.json\s*\([^)]+,\s*\d{3}\s*\)",
        ]
        if any(re.search(p, content) for p in status_patterns):
            passed.append("[OK] HTTP status codes used")
        else:
            issues.append("[!] No explicit HTTP status codes")

        validation_patterns = [
            r"validate", r"schema", r"zod", r"joi", r"yup",
            r"pydantic", r"@Body\(", r"@Query\(", r"zValidator", r"safeParse",
        ]
        if any(re.search(p, content, re.IGNORECASE) for p in validation_patterns):
            passed.append("[OK] Input validation present")
        else:
            issues.append("[!] No input validation detected")

        if any(re.search(p, content, re.IGNORECASE) for p in (r"auth", r"jwt", r"bearer", r"token", r"middleware", r"guard", r"@Authenticated")):
            passed.append("[OK] Authentication/authorization detected")

        if any(re.search(p, content, re.IGNORECASE) for p in (r"rateLimit", r"throttle", r"rate.?limit")):
            passed.append("[OK] Rate limiting present")

        structured_log_patterns = [
            r"\blogger\.", r"\bpino\b", r"\bwinston\b",
            r"\bconsole\.(?:error|warn|info)\b", r"\blogging\.", r"\blog\.",
        ]
        if any(re.search(p, content) for p in structured_log_patterns):
            passed.append("[OK] Structured logging present")
        if re.search(r"\bconsole\.log\s*\(", content):
            issues.append("[!] Avoid console.log in API handlers; use structured logger")
    except (OSError, UnicodeDecodeError) as exc:
        issues.append(f"[X] Read error: {exc}")

    return {"file": str(file_path), "passed": passed, "issues": issues, "type": "code"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check API code and OpenAPI specs for best practices")
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
    api_files = find_api_files(project_path)

    if not api_files:
        payload = {
            "script": "api_validator",
            "project": str(project_path),
            "files_checked": 0,
            "critical_issues": 0,
            "skipped": True,
            "passed": True,
        }
        if args.json:
            print(json.dumps(payload, indent=2))
        else:
            print("\n" + "=" * 60 + "\n  API VALIDATOR - Endpoint Best Practices Check\n" + "=" * 60 + "\n")
            print("[SKIP] No API files found - nothing to validate.")
            print(f"   Looking for: {LOOKING_FOR}")
        sys.exit(0)

    results = [
        check_openapi_spec(fp) if ("openapi" in fp.name.lower() or "swagger" in fp.name.lower()) else check_api_code(fp)
        for fp in api_files[:MAX_FILES]
    ]
    total_passed = sum(len(list(r["passed"])) for r in results)  # type: ignore[arg-type]
    total_issues = sum(1 for r in results for item in list(r["issues"]) if str(item).startswith("[X]"))  # type: ignore[arg-type]
    passed = total_issues == 0

    if args.json:
        print(json.dumps({
            "script": "api_validator",
            "project": str(project_path),
            "files_checked": len(results),
            "passed_checks": total_passed,
            "critical_issues": total_issues,
            "passed": passed,
            "results": results,
        }, indent=2))
        sys.exit(0 if passed else 1)

    print("\n" + "=" * 60 + "\n  API VALIDATOR - Endpoint Best Practices Check\n" + "=" * 60 + "\n")
    if len(api_files) > MAX_FILES:
        print(f"[i] {len(api_files)} API files found, checking the first {MAX_FILES}")
    for result in results:
        print(f"\n[FILE] {result['file']} [{result['type']}]")
        for item in list(result["passed"]) + list(result["issues"]):  # type: ignore[arg-type]
            print(f"   {item}")
    print("\n" + "=" * 60 + f"\n[RESULTS] {total_passed} passed, {total_issues} critical issues\n" + "=" * 60)
    print("[OK] API validation passed" if passed else "[X] Fix critical issues before deployment")
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
