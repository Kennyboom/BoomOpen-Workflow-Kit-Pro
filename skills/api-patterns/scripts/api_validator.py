#!/usr/bin/env python3
"""
API Validator - Checks API endpoints for best practices.
Validates OpenAPI specs, response formats, and common issues.

Usage (python3 on macOS/Linux, py on Windows also work):
    python api_validator.py <project_path>

Exit codes: 0 = no critical issues (or "[SKIP]" printed: no API files found),
1 = critical issues, 2 = invalid arguments.
"""
import argparse
import os
import sys
import json
import re
from pathlib import Path

# Fix Windows console encoding for Unicode output
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass  # Python < 3.7

EXIT_USAGE = 2
MAX_FILES = 15
EXCLUDED_DIRS = {'node_modules', '.git', 'dist', 'build', '__pycache__', '.next', '.svelte-kit', 'coverage'}
CODE_SUFFIXES = {'.ts', '.js', '.py'}
API_DIR_SUFFIXES = {
    'routes': {'.ts', '.js', '.py'},
    'routers': {'.ts', '.js', '.py'},
    'controllers': {'.ts', '.js'},
    'endpoints': {'.ts', '.py'},
}
# Next.js route handlers (app/api/**/route.ts) and SvelteKit endpoints (+server.ts)
ROUTE_HANDLER_NAMES = {'route.ts', 'route.js', '+server.ts', '+server.js'}
SPEC_NAMES = {'swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml'}
SPEC_SUFFIXES = ('.openapi.json', '.openapi.yaml')
LOOKING_FOR = "routes/, controllers/, endpoints/, api/, route.ts, +server.ts, openapi.json/yaml"


def is_api_file(rel_parts: tuple) -> bool:
    """Classify a project-relative path (folders..., file name) as API code or spec."""
    name = rel_parts[-1].lower()
    folders = tuple(part.lower() for part in rel_parts[:-1])
    suffix = Path(name).suffix
    if name in SPEC_NAMES or name.endswith(SPEC_SUFFIXES) or name in ROUTE_HANDLER_NAMES:
        return True
    if suffix in CODE_SUFFIXES and 'api' in Path(name).stem:
        return True
    if folders and suffix in API_DIR_SUFFIXES.get(folders[-1], ()):
        return True
    return suffix in ('.ts', '.js') and 'api' in folders


def find_api_files(project_path: Path) -> list:
    """Find API-related files in a stable order.

    Build/vendor folders are pruned by name INSIDE the project only: testing
    substrings of the absolute path wrongly skipped every file of a project
    stored under e.g. ~/builds/ or D:/distrib/. Pruning also keeps the walk
    out of node_modules, which recursive globbing would traverse.
    """
    files = []
    for root, dirs, names in os.walk(project_path):
        dirs[:] = sorted(d for d in dirs if d not in EXCLUDED_DIRS)
        rel_root = Path(root).relative_to(project_path).parts
        for name in sorted(names):
            if is_api_file(rel_root + (name,)):
                files.append(Path(root) / name)
    return files


def check_openapi_spec(file_path: Path) -> dict:
    """Check OpenAPI/Swagger specification."""
    issues = []
    passed = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        
        if file_path.suffix == '.json':
            spec = json.loads(content)
        else:
            # Basic YAML check
            if 'openapi:' in content or 'swagger:' in content:
                passed.append("[OK] OpenAPI/Swagger version defined")
            else:
                issues.append("[X] No OpenAPI version found")
            
            if 'paths:' in content:
                passed.append("[OK] Paths section exists")
            else:
                issues.append("[X] No paths defined")
            
            if 'components:' in content or 'definitions:' in content:
                passed.append("[OK] Schema components defined")
            
            return {'file': str(file_path), 'passed': passed, 'issues': issues, 'type': 'openapi'}
        
        # JSON OpenAPI checks
        if 'openapi' in spec or 'swagger' in spec:
            passed.append("[OK] OpenAPI version defined")
        
        if 'info' in spec:
            if 'title' in spec['info']:
                passed.append("[OK] API title defined")
            if 'version' in spec['info']:
                passed.append("[OK] API version defined")
            if 'description' not in spec['info']:
                issues.append("[!] API description missing")
        
        if 'paths' in spec:
            path_count = len(spec['paths'])
            passed.append(f"[OK] {path_count} endpoints defined")
            
            # Check each path
            for path, methods in spec['paths'].items():
                for method, details in methods.items():
                    if method in ['get', 'post', 'put', 'patch', 'delete']:
                        if 'responses' not in details:
                            issues.append(f"[X] {method.upper()} {path}: No responses defined")
                        if 'summary' not in details and 'description' not in details:
                            issues.append(f"[!] {method.upper()} {path}: No description")
        
    except (OSError, ValueError, AttributeError, TypeError) as e:
        issues.append(f"[X] Parse error: {e}")
    
    return {'file': str(file_path), 'passed': passed, 'issues': issues, 'type': 'openapi'}

def check_api_code(file_path: Path) -> dict:
    """Check API code for common issues."""
    issues = []
    passed = []
    
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Check for error handling (explicit blocks or centralized/declarative error handlers)
        error_patterns = [
            r'try\s*{', r'try:', r'\.catch\(',
            r'except\s+', r'catch\s*\(',
            r'\bonError\b', r'\bHTTPException\b', r'\bTRPCError\b',
            r'\bApiError\b', r'\bAppError\b', r'\bNextResponse\.json\b',
            r'\bsafeParse\b', r'\bzValidator\b',
        ]
        has_error_handling = any(re.search(p, content) for p in error_patterns)
        if has_error_handling:
            passed.append("[OK] Error handling present")
        else:
            issues.append("[X] No error handling found")
        
        # Check for status codes
        status_patterns = [
            r'status\s*\(\s*\d{3}\s*\)', r'statusCode\s*[=:]\s*\d{3}',
            r'HttpStatus\.', r'status_code\s*=\s*\d{3}',
            r'\.status\(\d{3}\)', r'res\.status\(', r'status\s*:\s*\d{3}',
        ]
        has_status = any(re.search(p, content) for p in status_patterns)
        if has_status:
            passed.append("[OK] HTTP status codes used")
        else:
            issues.append("[!] No explicit HTTP status codes")
        
        # Check for validation
        validation_patterns = [
            r'validate', r'schema', r'zod', r'joi', r'yup',
            r'pydantic', r'@Body\(', r'@Query\(', r'zValidator', r'safeParse',
        ]
        has_validation = any(re.search(p, content, re.I) for p in validation_patterns)
        if has_validation:
            passed.append("[OK] Input validation present")
        else:
            issues.append("[!] No input validation detected")
        
        # Check for auth middleware
        auth_patterns = [
            r'auth', r'jwt', r'bearer', r'token',
            r'middleware', r'guard', r'@Authenticated'
        ]
        has_auth = any(re.search(p, content, re.I) for p in auth_patterns)
        if has_auth:
            passed.append("[OK] Authentication/authorization detected")
        
        # Check for rate limiting
        rate_patterns = [r'rateLimit', r'throttle', r'rate.?limit']
        has_rate = any(re.search(p, content, re.I) for p in rate_patterns)
        if has_rate:
            passed.append("[OK] Rate limiting present")
        
        # Check for structured logging (penalize raw console.log in production API handlers)
        structured_log_patterns = [
            r'\blogger\.', r'\bpino\b', r'\bwinston\b',
            r'\bconsole\.(?:error|warn|info)\b', r'\blogging\.', r'\blog\.',
        ]
        has_structured_logging = any(re.search(p, content) for p in structured_log_patterns)
        if has_structured_logging:
            passed.append("[OK] Structured logging present")
        if re.search(r'\bconsole\.log\s*\(', content):
            issues.append("[!] Avoid console.log in API handlers; use structured logger")
        
    except (OSError, UnicodeDecodeError) as e:
        issues.append(f"[X] Read error: {e}")
    
    return {'file': str(file_path), 'passed': passed, 'issues': issues, 'type': 'code'}

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Check API code and OpenAPI specs for best practices")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def main():
    project_path = Path(parse_args().project_path).resolve()
    
    print("\n" + "=" * 60)
    print("  API VALIDATOR - Endpoint Best Practices Check")
    print("=" * 60 + "\n")
    
    api_files = find_api_files(project_path)
    
    if not api_files:
        print("[SKIP] No API files found - nothing to validate.")
        print(f"   Looking for: {LOOKING_FOR}")
        sys.exit(0)
    
    if len(api_files) > MAX_FILES:
        print(f"[i] {len(api_files)} API files found, checking the first {MAX_FILES}")
    results = []
    for file_path in api_files[:MAX_FILES]:
        if 'openapi' in file_path.name.lower() or 'swagger' in file_path.name.lower():
            result = check_openapi_spec(file_path)
        else:
            result = check_api_code(file_path)
        results.append(result)
    
    # Print results
    total_issues = 0
    total_passed = 0
    
    for result in results:
        print(f"\n[FILE] {result['file']} [{result['type']}]")
        for item in result['passed']:
            print(f"   {item}")
            total_passed += 1
        for item in result['issues']:
            print(f"   {item}")
            if item.startswith("[X]"):
                total_issues += 1
    
    print("\n" + "=" * 60)
    print(f"[RESULTS] {total_passed} passed, {total_issues} critical issues")
    print("=" * 60)
    
    if total_issues == 0:
        print("[OK] API validation passed")
        sys.exit(0)
    else:
        print("[X] Fix critical issues before deployment")
        sys.exit(1)

if __name__ == "__main__":
    main()
