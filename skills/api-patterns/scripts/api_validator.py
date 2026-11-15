#!/usr/bin/env python3
"""
API Validator - Checks backend API endpoints, Server Actions, tRPC routers,
and OpenAPI specs for security and contract best practices (v6.0).

Usage (python3 on macOS/Linux, py on Windows also work):
    python api_validator.py <project_path> [--json] [--max-files N]

Exit codes: 0 = no critical issues (or "[SKIP]" printed: no API files found),
1 = critical issues, 2 = invalid arguments.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
EXCLUDED_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__", ".next",
    ".svelte-kit", "coverage", ".boomopen", ".agent", ".venv", "venv", "target", "out",
}
FRONTEND_CLIENT_DIRS = {
    "components", "features", "hooks", "composables", "pages",
    "views", "screens", "client", "ui", "store", "stores",
}
CODE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".py"}
API_DIR_SUFFIXES = {
    "routes": {".ts", ".js", ".py"},
    "routers": {".ts", ".js", ".py"},
    "controllers": {".ts", ".js"},
    "endpoints": {".ts", ".py"},
    "trpc": {".ts", ".js"},
}
ROUTE_HANDLER_NAMES = {"route.ts", "route.js", "route.tsx", "route.jsx", "+server.ts", "+server.js"}
SPEC_NAMES = {"swagger.json", "swagger.yaml", "openapi.json", "openapi.yaml"}
SPEC_SUFFIXES = (".openapi.json", ".openapi.yaml")
LOOKING_FOR = "routes/, controllers/, endpoints/, api/, trpc/, route.ts, 'use server', openapi.json/yaml"

USE_SERVER_RE = re.compile(r"^\s*['\"]use server['\"]\s*;?", re.MULTILINE)
TRPC_MARKER_RE = re.compile(
    r"\b(?:publicProcedure|protectedProcedure|authedProcedure|adminProcedure|createTRPCRouter|t\.procedure)\b"
)
# Word-bounded auth guards — avoids false-positives on 'authorName', 'authority', or 'maxTokens'
AUTH_GUARD_RE = re.compile(
    r"\b(?:"
    r"requireAuth|authenticate|isAuthenticated|ensureAuthenticated|checkAuth|"
    r"getSession|getServerSession|validateSession|verifySession|"
    r"verifyToken|verifyJwt|jwtVerify|authMiddleware|withAuth|authGuard|AuthGuard|UseGuards|"
    r"protectedProcedure|authedProcedure|adminProcedure|"
    r"login_required|permission_required|JWTBearer|OAuth2PasswordBearer"
    r")\b"
    r"|(?:\bjwt\.verify\s*\()"
    r"|(?:Depends\s*\(\s*get_current_user)"
    r"|(?:\bauth\s*\(\s*\))"
    r"|(?:\bcurrentUser\s*\(\s*\))"
    r"|(?:@\s*(?:Authenticated|RequireAuth|Authorize|Roles)\b)"
    r"|(?:headers(?:\.get\s*\(\s*|\[\s*)['\"]authorization['\"])",
)


def is_static_api_path(rel_parts: Tuple[str, ...]) -> bool:
    """Classify a project-relative path by filename/directory conventions."""
    name = rel_parts[-1].lower()
    if name in ("api_validator.py", "api_scaffolder.py"):
        return False
    if any(m in name for m in (".test.", ".spec.", "_test.", "_spec.", ".d.ts")):
        return False
    folders = tuple(part.lower() for part in rel_parts[:-1])
    if "scripts" in folders or "cli" in folders:
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
    return suffix in (".ts", ".js", ".py") and "api" in Path(name).stem


def has_server_action_or_trpc(file_path: Path, rel_parts: Tuple[str, ...]) -> bool:
    """Inspect JS/TS files for Next.js 'use server' directives or tRPC procedure definitions."""
    name = rel_parts[-1].lower()
    if any(m in name for m in (".test.", ".spec.", "_test.", "_spec.", ".d.ts")):
        return False
    folders = tuple(part.lower() for part in rel_parts[:-1])
    if "scripts" in folders or "cli" in folders:
        return False
    if Path(name).suffix not in (".ts", ".tsx", ".js", ".jsx"):
        return False
    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return False
    return bool(USE_SERVER_RE.search(content) or TRPC_MARKER_RE.search(content))


def find_api_files(project_path: Path) -> List[Path]:
    """Find all API, Server Action, tRPC, and OpenAPI files with zero silent file cap."""
    files: List[Path] = []
    extra_skip = {"skills", "skills_library", "scripts", "cli"} - set(project_path.parts)
    skip_dirs = EXCLUDED_DIRS | extra_skip
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        rel_root = Path(root).relative_to(project_path).parts
        for name in sorted(names):
            rel_parts = rel_root + (name,)
            fpath = Path(root) / name
            if is_static_api_path(rel_parts) or has_server_action_or_trpc(fpath, rel_parts):
                files.append(fpath)
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
            for path_key, methods in spec["paths"].items():
                for method, details in methods.items():
                    if method in ("get", "post", "put", "patch", "delete"):
                        if "responses" not in details:
                            issues.append(f"[X] {method.upper()} {path_key}: No responses defined")
                        if "summary" not in details and "description" not in details:
                            issues.append(f"[!] {method.upper()} {path_key}: No description")
    except (OSError, ValueError, AttributeError, TypeError) as exc:
        issues.append(f"[X] Parse error: {exc}")

    return {"file": str(file_path), "passed": passed, "issues": issues, "type": "openapi"}


def check_api_code(file_path: Path) -> Dict[str, object]:
    """Check backend API route, Server Action, or tRPC router code for best practices."""
    issues: List[str] = []
    passed: List[str] = []
    auth_detected = False

    try:
        content = file_path.read_text(encoding="utf-8")
        is_server_action = bool(USE_SERVER_RE.search(content))
        is_trpc = bool(TRPC_MARKER_RE.search(content))
        code_kind = "server_action" if is_server_action else "trpc" if is_trpc else "code"

        error_patterns = [
            r"try\s*\{", r"try:", r"\.catch\(", r"except\s+", r"catch\s*\(",
            r"\bonError\b", r"\bHTTPException\b", r"\bTRPCError\b",
            r"\bApiError\b", r"\bAppError\b", r"\bNextResponse\.json\b",
            r"\bResponse\.json\b", r"\bc\.json\b", r"\bc\.text\b",
            r"\bsafeParse\b", r"\bzValidator\b", r"\.(?:query|mutation)\s*\(",
        ]
        if any(re.search(p, content) for p in error_patterns):
            passed.append("[OK] Error handling / typed response handler present")
        elif is_server_action and re.search(r"\b(?:revalidatePath|revalidateTag|redirect)\s*\(", content):
            passed.append("[OK] Server Action response/revalidation handler present")
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
        elif is_trpc or is_server_action:
            passed.append("[OK] Typed RPC / Server Action transport used")
        else:
            issues.append("[!] No explicit HTTP status codes")

        validation_patterns = [
            r"\bvalidate\b", r"\bschema\b", r"\bzod\b", r"\bz\.object\b", r"\bjoi\b", r"\byup\b",
            r"\bpydantic\b", r"@Body\(", r"@Query\(", r"\bzValidator\b", r"\bsafeParse\b", r"\.input\s*\(",
        ]
        if any(re.search(p, content, re.IGNORECASE) for p in validation_patterns):
            passed.append("[OK] Input validation present")
        else:
            issues.append("[!] No input validation detected")

        auth_detected = bool(AUTH_GUARD_RE.search(content))
        if auth_detected:
            passed.append("[OK] Authentication/authorization detected")
        else:
            issues.append("[!] No explicit auth guard detected")

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
        code_kind = "code"
        issues.append(f"[X] Read error: {exc}")

    return {
        "file": str(file_path),
        "passed": passed,
        "issues": issues,
        "auth_detected": auth_detected,
        "type": code_kind,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check API code, Server Actions, tRPC, and OpenAPI specs")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    parser.add_argument("--max-files", type=int, default=0, help="Optional cap on checked files (0 = scan all)")
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

    selected_files: List[Path] = api_files[: args.max_files] if args.max_files and args.max_files > 0 else api_files
    results = [
        check_openapi_spec(fp) if ("openapi" in fp.name.lower() or "swagger" in fp.name.lower()) else check_api_code(fp)
        for fp in selected_files
    ]
    total_passed = sum(len(list(r["passed"])) for r in results)  # type: ignore[arg-type]
    total_issues = sum(1 for r in results for item in list(r["issues"]) if str(item).startswith("[X]"))  # type: ignore[arg-type]
    passed = total_issues == 0

    if args.json:
        print(json.dumps({
            "script": "api_validator",
            "project": str(project_path),
            "files_discovered": len(api_files),
            "files_checked": len(results),
            "passed_checks": total_passed,
            "critical_issues": total_issues,
            "passed": passed,
            "results": results,
        }, indent=2))
        sys.exit(0 if passed else 1)

    print("\n" + "=" * 60 + "\n  API VALIDATOR - Endpoint Best Practices Check\n" + "=" * 60 + "\n")
    if len(api_files) > len(selected_files):
        print(f"[i] {len(api_files)} API files found, checking the first {len(selected_files)}")
    for result in results:
        print(f"\n[FILE] {result['file']} [{result['type']}]")
        for item in list(result["passed"]) + list(result["issues"]):  # type: ignore[arg-type]
            print(f"   {item}")
    print("\n" + "=" * 60 + f"\n[RESULTS] {total_passed} passed, {total_issues} critical issues\n" + "=" * 60)
    print("[OK] API validation passed" if passed else "[X] Fix critical issues before deployment")
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
