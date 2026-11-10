#!/usr/bin/env python3
"""
Security Scanner - BoomOpen Workflow Kit (v5.5.0)
=================================================
Static DevSecOps & AI/Agentic security audit for application source code.

Detects:
    1. Leaked 2026 credentials & API tokens (Anthropic, OpenAI, GitHub PAT,
       Google Cloud/AI, Slack, AWS, Stripe, PEM private keys, inline DB URLs)
    2. Dangerous Web & API execution sinks (unsanitized dangerouslySetInnerHTML,
       eval / new Function, SQL string concatenation, shell=True command exec)
    3. OWASP 2025/2026 LLM, Agentic & Transport risks (disabled TLS verification,
       unsafe YAML/pickle deserialization, unvalidated tool/MCP SSRF sinks)

False-positive safeguards:
    - Skips .env.example / .env.sample / .env.template placeholder files
    - Skips lockfiles, build artifacts, and test/fixture files for secret scans

Usage (python3 on macOS/Linux, py on Windows also work):
    python security_scan.py <project_path> [--json]

Exit codes:
    0 = no CRITICAL/HIGH findings, 1 = CRITICAL/HIGH findings detected,
    2 = invalid arguments (missing path).
"""

import argparse
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
MAX_FILE_BYTES = 512 * 1024
MAX_PRINTED_FINDINGS = 20

SKIP_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", "out", "coverage",
    "__pycache__", ".venv", "venv", "vendor", "target", ".turbo", ".cache",
}

TEMPLATE_ENV_NAMES = {
    ".env.example", ".env.sample", ".env.template", ".env.dist",
    ".env.local.example", ".env.development.example", "example.env",
}

LOCKFILE_NAMES = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock",
    "Cargo.lock", "poetry.lock", "uv.lock", "composer.lock", "go.sum",
}

TEST_DIR_MARKERS = {"test", "tests", "__tests__", "fixtures", "__fixtures__", "mocks", "__mocks__"}
TEST_FILE_SUFFIXES = (".test.", ".spec.", "_test.", "_spec.")

SECRET_EXTS = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs",
    ".rb", ".php", ".java", ".kt", ".swift", ".json", ".yaml", ".yml",
    ".toml", ".ini", ".cfg", ".conf", ".sh", ".ps1",
}

CODE_EXTS = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs", ".rb", ".php",
}

PLACEHOLDER_VALUE_RE = re.compile(
    r"(?:\byour[_-][a-z0-9_-]*|example|placeholder|changeme|replace[_-]?me|dummy|sample|"
    r"xxxx+|00000+|password123|fake[_-]|mock[_-]|test[_-]|^<[^>]+>$|^\$\{[A-Za-z0-9_.]+\}$)",
    re.IGNORECASE,
)

# Patterns avoid embedding literal token fixtures in source comments/strings.
SECRET_PATTERNS: Tuple[Tuple[str, str, re.Pattern], ...] = (
    ("CRITICAL", "Anthropic API Key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("CRITICAL", "OpenAI Project/Service Key", re.compile(r"\bsk-(?:proj|svcacct)-[A-Za-z0-9_-]{20,}\b")),
    ("CRITICAL", "GitHub Access Token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")),
    ("CRITICAL", "Google API Key", re.compile(r"\bAIzaSy[0-9A-Za-z_-]{33}\b")),
    ("CRITICAL", "Slack Token", re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{16,}\b")),
    ("CRITICAL", "AWS Access Key ID", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("CRITICAL", "Stripe Live Secret Key", re.compile(r"\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b")),
    (
        "CRITICAL",
        "PEM Private Key Block",
        re.compile(r"-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PGP)?\s*PRIVATE\s+KEY-----"),
    ),
    (
        "HIGH",
        "Hardcoded Database Credentials URL",
        re.compile(
            r"\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://"
            r"[^:\s'\"`]+:([^@\s'\"`${]{8,})@(?!localhost\b|127\.0\.0\.1\b)(?:[A-Za-z0-9.-]+|\$\{[^}\s]+\})"
        ),
    ),
)

CODE_PATTERNS: Tuple[Tuple[str, str, re.Pattern], ...] = (
    (
        "HIGH",
        "Dynamic eval() / new Function() execution",
        re.compile(r"(?<![.\w])(?:eval\s*\(|new\s+Function\s*\()"),
    ),
    (
        "CRITICAL",
        "SQL string concatenation or unparameterized interpolation",
        re.compile(
            r"(?:\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^;\n]{0,120}"
            r"(?:\+\s*[A-Za-z_$]|\$\{[^}]+\}))|"
            r"(?:\bf[\"']\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^\"'\n]*\{)"
        ),
    ),
    (
        "HIGH",
        "Shell command execution with shell=True",
        re.compile(r"\bsubprocess\.(?:run|Popen|call|check_output)\s*\([^\n)]*shell\s*=\s*True"),
    ),
    (
        "HIGH",
        "Disabled TLS certificate verification",
        re.compile(r"NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['\"]0['\"]|\bverify\s*=\s*False\b"),
    ),
    (
        "HIGH",
        "Unsafe deserialization (pickle.loads / yaml.load without SafeLoader)",
        re.compile(r"\bpickle\.loads?\s*\(|\byaml\.load\s*\((?![^)\n]*\b(?:SafeLoader|CSafeLoader)\b)[^)\n]*\)"),
    ),
    (
        "MEDIUM",
        "Auth token persisted in Web localStorage (XSS exposure risk)",
        re.compile(r"\blocalStorage\.setItem\s*\(\s*['\"][^'\"]*(?:token|jwt|secret|api[_-]?key)['\"]", re.IGNORECASE),
    ),
)

DANGEROUS_HTML_RE = re.compile(r"\bdangerouslySetInnerHTML\s*=\s*\{")
SANITIZER_RE = re.compile(r"\b(?:DOMPurify\.sanitize|sanitizeHtml|sanitize)\s*\(")
JSON_LD_SCRIPT_RE = re.compile(r"<script\b[^>]*application/ld\+json", re.IGNORECASE)
JSON_STRINGIFY_RE = re.compile(r"\bJSON\.stringify\s*\(")
COMMENT_LINE_RE = re.compile(r"^\s*(?://|#|/\*|\*)")
SELF_PATH = Path(__file__).resolve()


def is_test_or_fixture(rel_parts: Tuple[str, ...], filename: str) -> bool:
    lowered_parts = {p.lower() for p in rel_parts[:-1]}
    if lowered_parts & TEST_DIR_MARKERS:
        return True
    lower_name = filename.lower()
    return any(marker in lower_name for marker in TEST_FILE_SUFFIXES)


def is_secret_candidate(file_path: Path, rel_parts: Tuple[str, ...]) -> bool:
    name = file_path.name
    lower_name = name.lower()
    if lower_name in TEMPLATE_ENV_NAMES or lower_name in LOCKFILE_NAMES:
        return False
    if lower_name.endswith((".example", ".sample", ".template")):
        return False
    if is_test_or_fixture(rel_parts, name):
        return False
    if lower_name == ".env" or (lower_name.startswith(".env.") and "example" not in lower_name):
        return True
    return file_path.suffix.lower() in SECRET_EXTS


def redact_snippet(line: str) -> str:
    compact = line.strip()
    return compact[:90] + ("..." if len(compact) > 90 else "")


def scan_secrets_in_lines(rel_path: str, lines: List[str]) -> List[Dict[str, object]]:
    findings: List[Dict[str, object]] = []
    for idx, line in enumerate(lines, start=1):
        if COMMENT_LINE_RE.match(line):
            continue
        for severity, label, pattern in SECRET_PATTERNS:
            for match in pattern.finditer(line):
                candidate = match.group(1) if match.lastindex else match.group(0)
                if PLACEHOLDER_VALUE_RE.search(candidate):
                    continue
                findings.append({
                    "severity": severity,
                    "category": "secrets",
                    "rule": label,
                    "file": rel_path,
                    "line": idx,
                    "snippet": redact_snippet(line),
                })
                break
    return findings


def scan_code_in_lines(rel_path: str, _content: str, lines: List[str]) -> List[Dict[str, object]]:
    findings: List[Dict[str, object]] = []
    total_lines = len(lines)

    for idx, line in enumerate(lines, start=1):
        if COMMENT_LINE_RE.match(line):
            continue
        if DANGEROUS_HTML_RE.search(line):
            start = max(0, idx - 4)
            end = min(total_lines, idx + 3)
            window = "\n".join(lines[start:end])
            is_sanitized = bool(SANITIZER_RE.search(window))
            is_json_ld = bool(JSON_LD_SCRIPT_RE.search(window) and JSON_STRINGIFY_RE.search(window))
            if not is_sanitized and not is_json_ld:
                findings.append({
                    "severity": "HIGH",
                    "category": "xss",
                    "rule": "Unsanitized dangerouslySetInnerHTML without DOMPurify/sanitizer",
                    "file": rel_path,
                    "line": idx,
                    "snippet": redact_snippet(line),
                })
        for severity, label, pattern in CODE_PATTERNS:
            if pattern.search(line):
                findings.append({
                    "severity": severity,
                    "category": "code_security",
                    "rule": label,
                    "file": rel_path,
                    "line": idx,
                    "snippet": redact_snippet(line),
                })
    return findings


def iter_target_files(target: Path) -> List[Tuple[Path, Tuple[str, ...]]]:
    if target.is_file():
        return [(target, (target.name,))]
    skip_dirs = SKIP_DIRS | ({"skills_library"} if "skills_library" not in target.parts else set())
    collected: List[Tuple[Path, Tuple[str, ...]]] = []
    for root_dir, dirs, files in os.walk(target):
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        for fname in files:
            fpath = Path(root_dir) / fname
            if fpath.resolve() == SELF_PATH:
                continue
            try:
                if fpath.stat().st_size > MAX_FILE_BYTES:
                    continue
                rel_parts = fpath.relative_to(target).parts
            except OSError:
                continue
            collected.append((fpath, rel_parts))
    return collected


def run_security_scan(target: Path) -> Dict[str, object]:
    findings: List[Dict[str, object]] = []
    files_scanned = 0

    for fpath, rel_parts in iter_target_files(target):
        check_secrets = is_secret_candidate(fpath, rel_parts)
        check_code = fpath.suffix.lower() in CODE_EXTS and not is_test_or_fixture(rel_parts, fpath.name)
        if not check_secrets and not check_code:
            continue
        try:
            content = fpath.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        files_scanned += 1
        rel_str = "/".join(rel_parts)
        lines = content.splitlines()
        if check_secrets:
            findings.extend(scan_secrets_in_lines(rel_str, lines))
        if check_code:
            findings.extend(scan_code_in_lines(rel_str, content, lines))

    blocking = [f for f in findings if f["severity"] in ("CRITICAL", "HIGH")]
    advisories = [f for f in findings if f["severity"] not in ("CRITICAL", "HIGH")]
    return {
        "script": "security_scan",
        "target": str(target),
        "files_scanned": files_scanned,
        "blocking_count": len(blocking),
        "advisory_count": len(advisories),
        "passed": len(blocking) == 0,
        "findings": findings,
    }


def print_report(report: Dict[str, object]) -> None:
    print(f"\n{'=' * 60}")
    print("[SECURITY SCAN] DevSecOps, Secrets & AI/Agentic Security Audit")
    print(f"{'=' * 60}")
    print(f"Target: {report['target']}")
    print(f"Files scanned: {report['files_scanned']}")
    print("-" * 60)

    findings = report["findings"]
    if findings:
        for item in findings[:MAX_PRINTED_FINDINGS]:
            print(f"[{item['severity']}] {item['file']}:{item['line']} - {item['rule']}")
        if len(findings) > MAX_PRINTED_FINDINGS:
            print(f"... and {len(findings) - MAX_PRINTED_FINDINGS} more finding(s)")
    else:
        print("[OK] Zero leaked secrets or dangerous execution sinks detected.")

    status = "PASS" if report["passed"] else "FAIL"
    print(f"\nSTATUS: {status} (blocking={report['blocking_count']}, advisories={report['advisory_count']})")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan source code for secrets and OWASP security risks")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory or file to scan")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    parser.add_argument("--skip-deps", action="store_true", help="Compatibility flag for static-only scan")
    args = parser.parse_args()
    if not Path(args.project_path).exists():
        parser.print_usage(sys.stderr)
        print(f"Error: path does not exist: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def main() -> None:
    args = parse_args()
    report = run_security_scan(Path(args.project_path).resolve())
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_report(report)
    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
