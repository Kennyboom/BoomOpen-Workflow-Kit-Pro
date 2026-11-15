#!/usr/bin/env python3
"""
Security Rules & Detectors - BoomOpen Workflow Kit (v6.0)
=========================================================
Pattern definitions, Shannon entropy helper, comment-preserving stripper,
client-boundary helpers, and multi-line sink detectors for security_scan.py.
"""

import math
import re
from typing import Dict, List, Set, Tuple

SKIP_DIRS: Set[str] = {
    ".git", "node_modules", ".next", "dist", "build", "out", "coverage",
    "__pycache__", ".venv", "venv", "vendor", "target", ".turbo", ".cache",
}
TEMPLATE_ENV_NAMES: Set[str] = {
    ".env.example", ".env.sample", ".env.template", ".env.test", ".env.dist",
    ".env.local.example", ".env.development.example", ".env.production.example",
    "example.env",
}
LOCKFILE_NAMES: Set[str] = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock",
    "Cargo.lock", "poetry.lock", "uv.lock", "composer.lock", "go.sum",
}
TEST_DIR_MARKERS: Set[str] = {
    "test", "tests", "__tests__", "fixtures", "__fixtures__", "mocks", "__mocks__",
}
TEST_FILE_SUFFIXES: Tuple[str, ...] = (".test.", ".spec.", "_test.", "_spec.")
SECRET_EXTS: Set[str] = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs",
    ".rb", ".php", ".java", ".kt", ".swift", ".json", ".yaml", ".yml",
    ".toml", ".ini", ".cfg", ".conf", ".sh", ".ps1", ".env",
}
CODE_EXTS: Set[str] = {
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".go", ".rs", ".rb", ".php",
}
JS_EXTS: Set[str] = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}
C_STYLE_COMMENT_EXTS: Set[str] = JS_EXTS | {".go", ".rs", ".java", ".kt", ".swift", ".php"}
KEY_FILE_EXTS: Set[str] = {".pem", ".key", ".p12", ".pfx", ".jks", ".keystore"}
KEY_FILE_NAMES: Set[str] = {"id_rsa", "id_ed25519", "id_ecdsa", "id_dsa"}
DB_FILE_EXTS: Set[str] = {".sqlite", ".sqlite3"}

_DUMMY_WORD_A = "place" + "holder"
_DUMMY_WORD_B = "x" * 4 + "+"
DUMMY_VALUE_RE = re.compile(
    rf"(?:\byour[_-][a-z0-9_-]*|example|{_DUMMY_WORD_A}|changeme|replace[_-]?me|dummy|sample|"
    rf"{_DUMMY_WORD_B}|00000+|password123|fake[_-]|mock[_-]|test[_-]|dev[_-]?secret|"
    r"change[_-]in[_-]prod|^<[^>]+>$|^\$\{[A-Za-z0-9_.:-]+\}$|^\$[A-Za-z_][A-Za-z0-9_]*$)",
    re.IGNORECASE,
)
REGEX_DEF_LINE_RE = re.compile(r"(?:\bre\.compile\s*\(|\bnew\s+RegExp\s*\(|\\b\[A-Za-z|\(\?:|\[\^\\s)")
ENV_LOOKUP_RE = re.compile(r"\b(?:process\.env|import\.meta\.env|os\.environ|os\.getenv|Deno\.env)\b")
COMMENT_LINE_RE = re.compile(r"^\s*(?://|#|/\*|\*)")

# M2: Deterministic token prefixes & structured credential patterns
SECRET_PATTERNS: Tuple[Tuple[str, str, re.Pattern[str]], ...] = (
    ("CRITICAL", "Anthropic API Key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("CRITICAL", "OpenAI Project/Service Key", re.compile(r"\bsk-(?:proj|svcacct)-[A-Za-z0-9_-]{20,}\b")),
    ("CRITICAL", "GitHub Access Token", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b")),
    ("CRITICAL", "Google API Key", re.compile(r"\bAIzaSy[0-9A-Za-z_-]{33}\b")),
    ("CRITICAL", "Slack Token", re.compile(r"\bxox[baprs]-[0-9A-Za-z-]{16,}\b")),
    ("CRITICAL", "AWS Access Key ID", re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("CRITICAL", "Stripe Live Secret Key", re.compile(r"\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b")),
    ("CRITICAL", "Stripe Webhook Signing Secret", re.compile(r"\bwhsec_[A-Za-z0-9]{24,}\b")),
    ("CRITICAL", "Groq API Key", re.compile(r"\bgsk_[A-Za-z0-9]{24,}\b")),
    ("CRITICAL", "Hugging Face Access Token", re.compile(r"\bhf_[A-Za-z0-9]{24,}\b")),
    ("CRITICAL", "Resend API Key", re.compile(r"\bre_[A-Za-z0-9_]{20,}\b")),
    ("CRITICAL", "SendGrid API Key", re.compile(r"\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b")),
    (
        "CRITICAL",
        "Slack or Discord Webhook URL",
        re.compile(
            r"https://(?:hooks\.slack\.com/services/T[A-Z0-9]{8,}/B[A-Z0-9]{8,}/[A-Za-z0-9]{16,}|"
            r"(?:ptb\.|canary\.)?discord(?:app)?\.com/api/webhooks/\d{15,}/[A-Za-z0-9_-]{30,})"
        ),
    ),
    ("HIGH", "Hardcoded Signed JWT Literal", re.compile(r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{16,}\b")),
    ("CRITICAL", "PEM Private Key Block", re.compile(r"-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PGP)?\s*PRIVATE\s+KEY-----")),
    (
        "HIGH",
        "Hardcoded Database Credentials URL",
        re.compile(
            r"\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis)://"
            r"[^:\s'\"`]+:([^@\s'\"`${]{8,})@(?!localhost\b|127\.0\.0\.1\b)(?:[A-Za-z0-9.-]+|\$\{[^}\s]+\})"
        ),
    ),
)

GENERIC_SECRET_ASSIGN_RE = re.compile(
    r"\b(?:[A-Za-z0-9_]*_)?(?:jwt_secret|better_auth_secret|auth_secret|private_key|client_secret|webhook_secret)"
    r"\b\s*(?:=|:)\s*['\"]?([A-Za-z0-9+/=_!@#$%^&*.-]{16,})['\"]?",
    re.IGNORECASE,
)
DOCKERFILE_SECRET_RE = re.compile(
    r"^\s*(?:ENV|ARG)\s+[A-Z0-9_]*(?:SECRET|PASSWORD|PASSWD|TOKEN|API_KEY|PRIVATE_KEY|ACCESS_KEY)[A-Z0-9_]*"
    r"\s*(?:=|\s+)\s*['\"]?([^\s'\"$#]{8,})['\"]?",
)
SERVICE_ACCOUNT_RE = re.compile(r'"type"\s*:\s*"service_account"')

# M3: Client-bundle & server-boundary leak patterns
PUBLIC_SECRET_ENV_RE = re.compile(
    r"\b(?:NEXT_PUBLIC|VITE|EXPO_PUBLIC|NUXT_PUBLIC|PUBLIC)_[A-Z0-9_]*"
    r"(?:SECRET|PRIVATE|SERVICE_ROLE|PASSWORD|DATABASE|WEBHOOK)[A-Z0-9_]*\b"
)
USE_CLIENT_DIRECTIVE_RE = re.compile(r"^\s*['\"]use client['\"]\s*;?")
CLIENT_DB_IMPORT_RE = re.compile(
    r"""(?:\bfrom\s+['\"](?:@prisma/client|drizzle-orm(?:/[^'\"]*)?|pg|mysql2|better-sqlite3|mongodb|ioredis|firebase-admin|[^'\"]*(?:/server/db|/lib/db|/db/index|/prisma|/drizzle))['\"])"""
    r"""|(?:\brequire\s*\(\s*['\"](?:@prisma/client|drizzle-orm|pg|mysql2|better-sqlite3|mongodb|ioredis|firebase-admin)['\"]\s*\))"""
    r"""|(?:\bprocess\.env\.(?!NEXT_PUBLIC_|PUBLIC_)[A-Z0-9_]*(?:SECRET|PRIVATE|DATABASE_URL|SERVICE_ROLE)[A-Z0-9_]*\b)"""
)
SOURCEMAP_LEAK_RE = re.compile(r"\bproductionBrowserSourceMaps\s*:\s*true\b")
ELECTRON_BOUNDARY_RE = re.compile(r"\b(?:nodeIntegration\s*:\s*true|contextIsolation\s*:\s*false)\b")

# M4: Log, 500 error-stack & browser storage leaks
LOG_AUTH_LEAK_RE = re.compile(
    r"\b(?:console|logger|log|pino|winston)\.(?:log|info|warn|error|debug|trace)\s*\("
    r"[^;\n]{0,200}(?:\b(?:req\.headers\.authorization|headers\.authorization|req\.cookies|request\.cookies)\b|"
    r"\bheaders\[['\"]authorization['\"]\])",
    re.IGNORECASE,
)
HTTP_ERROR_STACK_RE = re.compile(
    r"\b(?:res(?:\s*\.\s*status\s*\([^)]*\))?\s*\.\s*(?:json|send)|NextResponse\.json|Response\.json|c\.json|reply\.send)"
    r"\s*\([\s\S]{0,220}?\b(?:(?:err|error|e|ex)\.(?:stack|sqlMessage)|sqlMessage)\b"
)
DEV_ENV_GUARD_RE = re.compile(r"NODE_ENV\s*===\s*['\"]development['\"]|\bisDev\b")
STORAGE_TOKEN_RE = re.compile(
    r"\b(?:localStorage|sessionStorage)\.setItem\s*\(\s*['\"][^'\"]*"
    r"(?:token|jwt|secret|api[_-]?key|session[_-]?id)['\"]",
    re.IGNORECASE,
)

# M5: Multi-line injection, traversal, CORS, JWT, TLS & SSRF sinks
DANGEROUS_HTML_RE = re.compile(r"\bdangerouslySetInnerHTML\s*=\s*\{")
SANITIZER_RE = re.compile(r"\b(?:DOMPurify\.sanitize|sanitizeHtml|sanitize)\s*\(")
JSON_LD_SCRIPT_RE = re.compile(r"<script\b[^>]*application/ld\+json", re.IGNORECASE)
JSON_STRINGIFY_RE = re.compile(r"\bJSON\.stringify\s*\(")
EVAL_RE = re.compile(r"(?<![.\w])(?:eval\s*\(|new\s+Function\s*\()")
UNSAFE_RAW_SQL_API_RE = re.compile(
    r"\.(?:\$queryRawUnsafe|\$executeRawUnsafe)\s*\("
    r"|\bsql\.raw\s*\(\s*(?:`[^`]*\$\{|[^)'\"\s,]+\s*\+|[A-Za-z_$][\w$.]*\s*\))"
)
SQL_CONCAT_OR_FSTRING_RE = re.compile(
    r"(?:\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^;\n`]{0,140}\+\s*[A-Za-z_$])"
    r"|(?:\bf[\"']\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^\"'\n]*\{)"
)
UNTAGGED_TEMPLATE_SQL_RE = re.compile(
    r"(?<![A-Za-z0-9_$>])`\s*(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^`]{0,220}?\$\{[^}]+\}"
)
CHILD_PROCESS_IMPORT_RE = re.compile(
    r"""(?:require\s*\(\s*['\"](?:node:)?child_process['\"]\s*\)|from\s+['\"](?:node:)?child_process['\"])"""
)
NODE_EXEC_EXPLICIT_RE = re.compile(r"\b(?:child_process|cp)\.(?:exec|execSync)\s*\(|(?<![.\w])execSync\s*\(")
NODE_EXEC_BARE_RE = re.compile(r"(?<![.\w])exec\s*\((?!\s*`start\s+\"\"\s+\"\$\{url\}\"`)")
NODE_SPAWN_SHELL_RE = re.compile(
    r"\b(?:(?:child_process|cp)\.)?spawn\s*\([\s\S]{0,200}?\{[^}]{0,160}?\bshell\s*:\s*true\b"
)
PY_SUBPROCESS_SHELL_RE = re.compile(
    r"\bsubprocess\.(?:run|Popen|call|check_output)\s*\([^\n)]*shell\s*=\s*True|\bos\.system\s*\("
)
PATH_TRAVERSAL_RE = re.compile(
    r"\bpath\.(?:join|resolve)\s*\([\s\S]{0,180}?\b(?:req|request|ctx)\.(?:file|files|body|query|params)\b"
)
PATH_CONTAINMENT_RE = re.compile(r"\b(?:realpath|realpathSync|startsWith|basename)\b")
CORS_BLOCK_RE = re.compile(r"\bcors\s*\(\s*\{([\s\S]{0,240}?)\}\s*\)")
CORS_WILDCARD_ORIGIN_RE = re.compile(r"\borigin\s*:\s*(?:['\"]\*['\"]|true\b)")
CORS_CREDENTIALS_RE = re.compile(r"\bcredentials\s*:\s*true\b")
JWT_DECODE_RE = re.compile(r"\b(?:jwt\.decode|decodeJwt)\s*\(")
JWT_VERIFY_RE = re.compile(r"\b(?:jwt\.verify|jwtVerify)\s*\(")
JWT_NO_VERIFY_OPT_RE = re.compile(r"verify_signature['\"]?\s*[:=]\s*False")
TLS_DISABLED_RE = re.compile(
    r"NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['\"]0['\"]|\bverify\s*=\s*False\b"
    r"|\brejectUnauthorized\s*:\s*false\b|\bInsecureSkipVerify\s*:\s*true\b"
)
UNSAFE_DESERIALIZE_RE = re.compile(
    r"\bpickle\.loads?\s*\(|\byaml\.load\s*\((?![^)\n]*\b(?:SafeLoader|CSafeLoader)\b)[^)\n]*\)"
)
SSRF_FETCH_RE = re.compile(
    r"\b(?:fetch|axios(?:\.(?:get|post|put|delete|request))?|got|requests\.(?:get|post|put|delete|request))\s*\(\s*"
    r"(?:req|request|ctx)\.(?:body|query|params)\.[A-Za-z0-9_$.[\]]+"
)


def shannon_entropy(value: str) -> float:
    if not value:
        return 0.0
    length = len(value)
    counts: Dict[str, int] = {}
    for ch in value:
        counts[ch] = counts.get(ch, 0) + 1
    return -sum((c / length) * math.log2(c / length) for c in counts.values())


def redact_snippet(line: str) -> str:
    compact = line.strip()
    return compact[:90] + ("..." if len(compact) > 90 else "")


def make_finding(
    severity: str, category: str, rule: str, rel_path: str, line_no: int, snippet_line: str
) -> Dict[str, object]:
    return {
        "severity": severity,
        "category": category,
        "rule": rule,
        "file": rel_path,
        "line": line_no,
        "snippet": redact_snippet(snippet_line),
    }


def line_number_at(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def is_test_or_fixture(rel_parts: Tuple[str, ...], filename: str) -> bool:
    if {p.lower() for p in rel_parts[:-1]} & TEST_DIR_MARKERS:
        return True
    lower_name = filename.lower()
    return any(marker in lower_name for marker in TEST_FILE_SUFFIXES)


def is_template_env(filename: str) -> bool:
    lower = filename.lower()
    return lower in TEMPLATE_ENV_NAMES or lower.endswith((".example", ".sample", ".template", ".test"))


def is_tracked_env_file(filename: str) -> bool:
    lower = filename.lower()
    return not is_template_env(lower) and (lower == ".env" or lower.startswith(".env."))


def is_dockerfile(filename: str) -> bool:
    lower = filename.lower()
    return lower == "dockerfile" or lower.startswith("dockerfile.") or lower.endswith(".dockerfile")


def is_dummy_or_regex(candidate: str, line: str) -> bool:
    return bool(DUMMY_VALUE_RE.search(candidate) or REGEX_DEF_LINE_RE.search(line))


def has_use_client_directive(stripped_lines: List[str], suffix: str) -> bool:
    if suffix not in JS_EXTS:
        return False
    head = [ln for ln in stripped_lines[:10] if ln.strip()][:2]
    return any(USE_CLIENT_DIRECTIVE_RE.match(ln) for ln in head)


def strip_comments_preserve_lines(content: str, suffix: str) -> str:
    """Replace comments with spaces while keeping string literals and line numbers intact."""
    if suffix not in C_STYLE_COMMENT_EXTS:
        return "\n".join((" " * len(ln)) if ln.lstrip().startswith("#") else ln for ln in content.splitlines())
    chars = list(content)
    idx, length, quote = 0, len(chars), ""
    while idx < length:
        ch = chars[idx]
        nxt = chars[idx + 1] if idx + 1 < length else ""
        if quote:
            if ch == "\\" and idx + 1 < length:
                idx += 2
                continue
            if ch == quote:
                quote = ""
            idx += 1
        elif ch in ("'", '"', "`"):
            quote = ch
            idx += 1
        elif ch == "/" and nxt == "/":
            while idx < length and chars[idx] != "\n":
                chars[idx] = " "
                idx += 1
        elif ch == "/" and nxt == "*":
            chars[idx] = chars[idx + 1] = " "
            idx += 2
            while idx < length:
                if chars[idx] == "*" and idx + 1 < length and chars[idx + 1] == "/":
                    chars[idx] = chars[idx + 1] = " "
                    idx += 2
                    break
                if chars[idx] != "\n":
                    chars[idx] = " "
                idx += 1
        else:
            idx += 1
    return "".join(chars)


def scan_multiline_sinks(rel_str: str, stripped: str, stripped_lines: List[str], raw_lines: List[str]) -> List[Dict[str, object]]:
    """Detect M4/M5 vulnerabilities spanning multiple lines on comment-stripped source."""
    findings: List[Dict[str, object]] = []
    total = len(raw_lines)
    for reg in (UNSAFE_RAW_SQL_API_RE, UNTAGGED_TEMPLATE_SQL_RE):
        for m in reg.finditer(stripped):
            lno = line_number_at(stripped, m.start())
            findings.append(make_finding("CRITICAL", "code_security", "SQL string concatenation or unsafe raw SQL execution", rel_str, lno, raw_lines[lno - 1]))
    for m in HTTP_ERROR_STACK_RE.finditer(stripped):
        lno = line_number_at(stripped, m.start())
        win = "\n".join(stripped_lines[max(0, lno - 3) : min(total, lno + 4)])
        if not DEV_ENV_GUARD_RE.search(win):
            findings.append(make_finding("HIGH", "data_leak", "HTTP response leaks internal error.stack or sqlMessage", rel_str, lno, raw_lines[lno - 1]))
    for m in NODE_SPAWN_SHELL_RE.finditer(stripped):
        lno = line_number_at(stripped, m.start())
        findings.append(make_finding("HIGH", "code_security", "Node child_process.spawn() with shell: true", rel_str, lno, raw_lines[lno - 1]))
    for m in PATH_TRAVERSAL_RE.finditer(stripped):
        lno = line_number_at(stripped, m.start())
        win = "\n".join(stripped_lines[max(0, lno - 3) : min(total, lno + 6)])
        if not PATH_CONTAINMENT_RE.search(win):
            findings.append(make_finding("HIGH", "code_security", "Uncontained path.join/resolve with untrusted request input", rel_str, lno, raw_lines[lno - 1]))
    for m in CORS_BLOCK_RE.finditer(stripped):
        if CORS_WILDCARD_ORIGIN_RE.search(m.group(1)) and CORS_CREDENTIALS_RE.search(m.group(1)):
            lno = line_number_at(stripped, m.start())
            findings.append(make_finding("HIGH", "code_security", "Permissive CORS origin (* / true) combined with credentials: true", rel_str, lno, raw_lines[lno - 1]))
    for m in SSRF_FETCH_RE.finditer(stripped):
        lno = line_number_at(stripped, m.start())
        findings.append(make_finding("HIGH", "code_security", "Unvalidated outbound fetch/request using raw request URL parameter (SSRF)", rel_str, lno, raw_lines[lno - 1]))
    return findings
