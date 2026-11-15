#!/usr/bin/env python3
"""
Security Scanner v6 - BoomOpen Workflow Kit (v6.0)
==================================================
2-Layer Static DevSecOps, Anti-Leakage & Route Census Scanner (M1-M6):
    M1: Tracked non-template .env, private keys/certs, service-account JSON,
        SQLite DB files, and Dockerfile hardcoded ENV/ARG secrets.
    M2: 2026 provider tokens (Anthropic, OpenAI, GitHub, Google, Slack/Discord,
        AWS AKIA/ASIA, Stripe sk_live/whsec, Groq, HF, Resend, SendGrid, JWTs,
        PEM keys, DB URLs) + Shannon entropy (>= 3.7) secret assignments.
    M3: Client-bundle & boundary leaks (NEXT_PUBLIC_/VITE_ secrets, 'use client'
        DB imports, productionBrowserSourceMaps, Electron webPreferences).
    M4: Auth header/cookie logs, HTTP 500 error.stack/sqlMessage JSON leaks,
        and Web localStorage/sessionStorage token persistence.
    M5: Multi-line SQLi (safe tagged sql`...` vs $queryRawUnsafe/sql.raw/concat),
        child_process.exec/spawn(shell:true), path traversal, permissive CORS +
        credentials, unverified jwt.decode, disabled TLS, and SSRF fetch sinks.
    M6: Optional --emit-routes 100% deterministic entrypoint census.

Usage:
    python security_scan.py <project_path> [--json] [--skip-deps] [--emit-routes] [--strict-leaks]

Exit codes:
    0 = no CRITICAL/HIGH findings, 1 = CRITICAL/HIGH findings detected,
    2 = invalid arguments (missing path).
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from route_census import extract_entrypoints  # noqa: E402
from security_rules import (  # noqa: E402
    CHILD_PROCESS_IMPORT_RE,
    CLIENT_DB_IMPORT_RE,
    CODE_EXTS,
    COMMENT_LINE_RE,
    DANGEROUS_HTML_RE,
    DB_FILE_EXTS,
    DOCKERFILE_SECRET_RE,
    ELECTRON_BOUNDARY_RE,
    ENV_LOOKUP_RE,
    EVAL_RE,
    GENERIC_SECRET_ASSIGN_RE,
    JS_EXTS,
    JSON_LD_SCRIPT_RE,
    JSON_STRINGIFY_RE,
    JWT_DECODE_RE,
    JWT_NO_VERIFY_OPT_RE,
    JWT_VERIFY_RE,
    KEY_FILE_EXTS,
    KEY_FILE_NAMES,
    LOCKFILE_NAMES,
    LOG_AUTH_LEAK_RE,
    NODE_EXEC_BARE_RE,
    NODE_EXEC_EXPLICIT_RE,
    PUBLIC_SECRET_ENV_RE,
    PY_SUBPROCESS_SHELL_RE,
    REGEX_DEF_LINE_RE,
    SANITIZER_RE,
    SECRET_EXTS,
    SECRET_PATTERNS,
    SERVICE_ACCOUNT_RE,
    SKIP_DIRS,
    SOURCEMAP_LEAK_RE,
    SQL_CONCAT_OR_FSTRING_RE,
    STORAGE_TOKEN_RE,
    TLS_DISABLED_RE,
    UNSAFE_DESERIALIZE_RE,
    has_use_client_directive,
    is_dockerfile,
    is_dummy_or_regex,
    is_template_env,
    is_test_or_fixture,
    is_tracked_env_file,
    make_finding,
    scan_multiline_sinks,
    shannon_entropy,
    strip_comments_preserve_lines,
)

EXIT_USAGE = 2
MAX_FILE_BYTES = 512 * 1024
MAX_PRINTED_FINDINGS = 25
SELF_DIR = Path(__file__).resolve().parent


def is_m1_binary_or_key_candidate(fpath: Path, rel_parts: Tuple[str, ...]) -> bool:
    if is_test_or_fixture(rel_parts, fpath.name):
        return False
    lower = fpath.name.lower()
    suffix = fpath.suffix.lower()
    if is_template_env(lower):
        return False
    return suffix in KEY_FILE_EXTS or lower in KEY_FILE_NAMES or suffix in DB_FILE_EXTS


def is_secret_candidate(file_path: Path, rel_parts: Tuple[str, ...]) -> bool:
    name = file_path.name
    lower_name = name.lower()
    if is_template_env(lower_name) or lower_name in LOCKFILE_NAMES:
        return False
    if is_test_or_fixture(rel_parts, name):
        return False
    if is_tracked_env_file(lower_name) or is_dockerfile(lower_name):
        return True
    return file_path.suffix.lower() in SECRET_EXTS


def scan_m1_tracked_files(fpath: Path, rel_str: str, lines: List[str], content: str) -> List[Dict[str, object]]:
    findings: List[Dict[str, object]] = []
    lower_name = fpath.name.lower()
    suffix = fpath.suffix.lower()
    first_line = lines[0] if lines else fpath.name
    if is_tracked_env_file(lower_name):
        findings.append(make_finding("CRITICAL", "secret_file", "Tracked non-template .env file", rel_str, 1, first_line))
    elif (suffix in KEY_FILE_EXTS or lower_name in KEY_FILE_NAMES) and not is_template_env(lower_name):
        findings.append(make_finding("CRITICAL", "secret_file", "Tracked private key or certificate store file", rel_str, 1, first_line))
    elif suffix in DB_FILE_EXTS:
        findings.append(make_finding("HIGH", "secret_file", "Tracked local SQLite database file", rel_str, 1, first_line))
    elif suffix == ".json" and lower_name not in LOCKFILE_NAMES and SERVICE_ACCOUNT_RE.search(content):
        if "service-account" in lower_name or "service_account" in lower_name or '"private_key"' in content:
            findings.append(make_finding("CRITICAL", "secret_file", "Google Cloud service account credentials JSON", rel_str, 1, first_line))
    elif is_dockerfile(lower_name):
        for idx, line in enumerate(lines, start=1):
            m = DOCKERFILE_SECRET_RE.search(line)
            if m and not is_dummy_or_regex(m.group(1), line):
                findings.append(make_finding("CRITICAL", "secret_file", "Hardcoded secret in Dockerfile ENV/ARG", rel_str, idx, line))
    return findings


def scan_secrets_in_lines(rel_path: str, lines: List[str]) -> List[Dict[str, object]]:
    findings: List[Dict[str, object]] = []
    for idx, line in enumerate(lines, start=1):
        if COMMENT_LINE_RE.match(line):
            continue
        if PUBLIC_SECRET_ENV_RE.search(line) and not REGEX_DEF_LINE_RE.search(line):
            findings.append(make_finding("CRITICAL", "client_leak", "Public client env var exposing secret/private/DB credential", rel_path, idx, line))
        matched_line = False
        for severity, label, pattern in SECRET_PATTERNS:
            for match in pattern.finditer(line):
                candidate = match.group(1) if match.lastindex else match.group(0)
                if is_dummy_or_regex(candidate, line):
                    continue
                findings.append(make_finding(severity, "secrets", label, rel_path, idx, line))
                matched_line = True
                break
            if matched_line:
                break
        if matched_line or ENV_LOOKUP_RE.search(line):
            continue
        gen_match = GENERIC_SECRET_ASSIGN_RE.search(line)
        if gen_match:
            secret_val = gen_match.group(1)
            if not is_dummy_or_regex(secret_val, line) and shannon_entropy(secret_val) >= 3.7:
                findings.append(make_finding("HIGH", "secrets", "High-entropy hardcoded secret assignment", rel_path, idx, line))
    return findings


def scan_code_in_lines(
    rel_path: str, suffix: str, content: str, lines: List[str], strict_leaks: bool = False
) -> List[Dict[str, object]]:
    findings: List[Dict[str, object]] = []
    stripped = strip_comments_preserve_lines(content, suffix)
    stripped_lines = stripped.splitlines()
    total_lines = len(lines)
    is_use_client = has_use_client_directive(stripped_lines, suffix)
    has_cp_import = suffix in JS_EXTS and bool(CHILD_PROCESS_IMPORT_RE.search(stripped))
    has_jwt_verify = bool(JWT_VERIFY_RE.search(stripped)) and not bool(JWT_NO_VERIFY_OPT_RE.search(stripped))

    for idx, sline in enumerate(stripped_lines, start=1):
        if not sline.strip():
            continue
        raw_line = lines[idx - 1]
        if PUBLIC_SECRET_ENV_RE.search(sline) and not REGEX_DEF_LINE_RE.search(raw_line):
            findings.append(make_finding("CRITICAL", "client_leak", "Public client env var exposing secret/private/DB credential", rel_path, idx, raw_line))
        if is_use_client and CLIENT_DB_IMPORT_RE.search(sline):
            findings.append(make_finding("HIGH", "client_leak", "Client component ('use client') imports server DB/ORM or secret", rel_path, idx, raw_line))
        if SOURCEMAP_LEAK_RE.search(sline):
            findings.append(make_finding("HIGH", "client_leak", "Production browser source maps enabled (productionBrowserSourceMaps: true)", rel_path, idx, raw_line))
        if ELECTRON_BOUNDARY_RE.search(sline):
            findings.append(make_finding("CRITICAL", "client_leak", "Insecure Electron webPreferences boundary", rel_path, idx, raw_line))
        if LOG_AUTH_LEAK_RE.search(sline):
            findings.append(make_finding("HIGH", "data_leak", "Sensitive auth header or cookies written to logs", rel_path, idx, raw_line))
        if STORAGE_TOKEN_RE.search(sline) and not REGEX_DEF_LINE_RE.search(raw_line):
            sev = "HIGH" if strict_leaks else "MEDIUM"
            findings.append(make_finding(sev, "data_leak", "Auth token persisted in Web browser storage (XSS exposure risk)", rel_path, idx, raw_line))
        if DANGEROUS_HTML_RE.search(sline):
            window = "\n".join(lines[max(0, idx - 4) : min(total_lines, idx + 3)])
            if not SANITIZER_RE.search(window) and not (JSON_LD_SCRIPT_RE.search(window) and JSON_STRINGIFY_RE.search(window)):
                findings.append(make_finding("HIGH", "xss", "Unsanitized dangerouslySetInnerHTML without DOMPurify/sanitizer", rel_path, idx, raw_line))
        if EVAL_RE.search(sline):
            findings.append(make_finding("HIGH", "code_security", "Dynamic eval() / new Function() execution", rel_path, idx, raw_line))
        if SQL_CONCAT_OR_FSTRING_RE.search(sline):
            findings.append(make_finding("CRITICAL", "code_security", "SQL string concatenation or unsafe raw SQL execution", rel_path, idx, raw_line))
        if NODE_EXEC_EXPLICIT_RE.search(sline) or (has_cp_import and NODE_EXEC_BARE_RE.search(sline)):
            findings.append(make_finding("HIGH", "code_security", "Node child_process shell command execution (exec/execSync)", rel_path, idx, raw_line))
        if PY_SUBPROCESS_SHELL_RE.search(sline):
            findings.append(make_finding("HIGH", "code_security", "Shell command execution with shell=True", rel_path, idx, raw_line))
        if TLS_DISABLED_RE.search(sline):
            findings.append(make_finding("HIGH", "code_security", "Disabled TLS certificate verification", rel_path, idx, raw_line))
        if UNSAFE_DESERIALIZE_RE.search(sline):
            findings.append(make_finding("HIGH", "code_security", "Unsafe deserialization (pickle.loads / yaml.load without SafeLoader)", rel_path, idx, raw_line))
        if JWT_DECODE_RE.search(sline) and not has_jwt_verify:
            findings.append(make_finding("HIGH", "code_security", "Unverified jwt.decode() used without signature verification", rel_path, idx, raw_line))

    findings.extend(scan_multiline_sinks(rel_path, stripped, stripped_lines, lines))
    return findings


def iter_target_files(target: Path) -> List[Tuple[Path, Tuple[str, ...]]]:
    if target.is_file():
        return [(target, (target.name,))]
    skip_dirs = SKIP_DIRS | ({"skills_library"} if "skills_library" not in target.parts else set())
    collected: List[Tuple[Path, Tuple[str, ...]]] = []
    for root_dir, dirs, files in os.walk(target):
        dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
        for fname in sorted(files):
            fpath = Path(root_dir) / fname
            if fpath.resolve().parent == SELF_DIR:
                continue
            try:
                rel_parts = fpath.relative_to(target).parts
                if fpath.stat().st_size > MAX_FILE_BYTES and not is_m1_binary_or_key_candidate(fpath, rel_parts):
                    continue
            except OSError:
                continue
            collected.append((fpath, rel_parts))
    return collected


def deduplicate_findings(raw_findings: List[Dict[str, object]]) -> List[Dict[str, object]]:
    unique: List[Dict[str, object]] = []
    seen: Set[Tuple[object, ...]] = set()
    for item in raw_findings:
        key = (item["file"], item["line"], item["rule"])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def run_security_scan(
    target: Path, emit_routes: bool = False, strict_leaks: bool = False
) -> Dict[str, object]:
    raw_findings: List[Dict[str, object]] = []
    files_scanned = 0

    for fpath, rel_parts in iter_target_files(target):
        rel_str = "/".join(rel_parts)
        if is_m1_binary_or_key_candidate(fpath, rel_parts):
            files_scanned += 1
            raw_findings.extend(scan_m1_tracked_files(fpath, rel_str, [], ""))
            continue

        check_secrets = is_secret_candidate(fpath, rel_parts)
        check_code = fpath.suffix.lower() in CODE_EXTS and not is_test_or_fixture(rel_parts, fpath.name)
        if not check_secrets and not check_code:
            continue
        try:
            content = fpath.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        files_scanned += 1
        lines = content.splitlines()
        if check_secrets:
            raw_findings.extend(scan_m1_tracked_files(fpath, rel_str, lines, content))
            raw_findings.extend(scan_secrets_in_lines(rel_str, lines))
        if check_code:
            raw_findings.extend(scan_code_in_lines(rel_str, fpath.suffix.lower(), content, lines, strict_leaks=strict_leaks))

    findings = deduplicate_findings(raw_findings)
    blocking = [f for f in findings if f["severity"] in ("CRITICAL", "HIGH")]
    advisories = [f for f in findings if f["severity"] not in ("CRITICAL", "HIGH")]
    report: Dict[str, object] = {
        "script": "security_scan",
        "target": str(target),
        "files_scanned": files_scanned,
        "blocking_count": len(blocking),
        "advisory_count": len(advisories),
        "passed": len(blocking) == 0,
        "findings": findings,
    }
    if emit_routes:
        census = extract_entrypoints(target)
        report["route_census"] = census
    return report


def print_report(report: Dict[str, object]) -> None:
    print(f"\n{'=' * 60}")
    print("[SECURITY SCAN v6] 2-Layer DevSecOps, Anti-Leakage & Route Audit")
    print(f"{'=' * 60}")
    print(f"Target: {report['target']}")
    print(f"Files scanned: {report['files_scanned']}")
    print("-" * 60)

    findings = list(report["findings"])  # type: ignore[arg-type]
    if findings:
        for item in findings[:MAX_PRINTED_FINDINGS]:
            print(f"[{item['severity']}] {item['file']}:{item['line']} - {item['rule']}")
        if len(findings) > MAX_PRINTED_FINDINGS:
            print(f"... and {len(findings) - MAX_PRINTED_FINDINGS} more finding(s)")
    else:
        print("[OK] Zero leaked secrets or dangerous execution sinks detected.")

    if "route_census" in report:
        census = report["route_census"]
        if isinstance(census, dict):
            print(f"\n[ROUTE CENSUS] Extracted {census.get('total', 0)} entrypoint(s)")
            for ep in list(census.get("entrypoints", []))[:25]:  # type: ignore[arg-type]
                print(f"  {ep['id']} [{ep['kind']}] {ep['method']} {ep['path_or_symbol']} ({ep['file']}:{ep['line']})")

    status = "PASS" if report["passed"] else "FAIL"
    print(f"\nSTATUS: {status} (blocking={report['blocking_count']}, advisories={report['advisory_count']})")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan source code for M1-M6 secrets, leaks, and OWASP risks")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory or file to scan")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    parser.add_argument("--skip-deps", action="store_true", help="Compatibility flag for static-only scan")
    parser.add_argument("--emit-routes", action="store_true", help="Include deterministic M6 route & entrypoint census")
    parser.add_argument("--strict-leaks", action="store_true", help="Promote browser token storage advisories to blocking HIGH")
    args = parser.parse_args()
    if not Path(args.project_path).exists():
        parser.print_usage(sys.stderr)
        print(f"Error: path does not exist: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def main() -> None:
    args = parse_args()
    report = run_security_scan(
        Path(args.project_path).resolve(),
        emit_routes=args.emit_routes,
        strict_leaks=args.strict_leaks,
    )
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_report(report)
    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
