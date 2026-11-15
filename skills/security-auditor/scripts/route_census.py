#!/usr/bin/env python3
"""
M6 Deterministic Route & Entrypoint Census - BoomOpen Workflow Kit (v6.0)
=========================================================================
Enumerates 100% of backend/IPC/AI entrypoints across a codebase with zero
MAX_FILES cap: Next.js App/Pages Router, "use server" actions, Express/Fastify/
Hono/NestJS, tRPC procedures, FastAPI/Flask, Go/Rust HTTP routes, Tauri
#[tauri::command], Electron ipcMain, and AI tool() / MCP server tools.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple, Union

sys.dont_write_bytecode = True

from security_rules import (  # noqa: E402
    SKIP_DIRS,
    is_test_or_fixture,
    line_number_at,
    strip_comments_preserve_lines,
)

CENSUS_EXTS: Set[str] = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".go", ".rs"}
JS_TS_EXTS: Set[str] = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
NEXT_ROUTE_FILENAMES: Set[str] = {"route.ts", "route.js", "route.tsx", "route.jsx", "route.mjs"}
SELF_DIR = Path(__file__).resolve().parent

NEXT_METHOD_RE = re.compile(r"\bexport\s+(?:async\s+function|function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b")
USE_SERVER_TOP_RE = re.compile(r"^\s*['\"]use server['\"]\s*;?")
EXPORTED_ASYNC_FN_RE = re.compile(
    r"\bexport\s+(?:async\s+function\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)\s*=\s*async\b)"
)
INLINE_SERVER_ACTION_RE = re.compile(r"\basync\s+function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*['\"]use server['\"]")
EXPRESS_HONO_RE = re.compile(
    r"\b(?:app|router|fastify|server|api|hono|route|v\d+)\s*\.\s*(get|post|put|patch|delete|all)\s*\(\s*['\"`](/[^'\"`\n]*|[*])['\"`]"
)
NEST_CONTROLLER_RE = re.compile(r"@Controller\s*\(\s*(?:['\"`]([^'\"`]*)['\"`])?\s*\)")
NEST_METHOD_RE = re.compile(r"@(Get|Post|Put|Patch|Delete|All)\s*\(\s*(?:['\"`]([^'\"`]*)['\"`])?\s*\)")
TRPC_PROC_RE = re.compile(
    r"\b([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z0-9_$.]*(?:publicProcedure|protectedProcedure|authedProcedure|adminProcedure))"
    r"[\s\S]{0,260}?\.\s*(query|mutation|subscription)\s*\("
)
PY_ROUTE_RE = re.compile(r"@\s*(?:app|router|bp|blueprint|api)\s*\.\s*(get|post|put|patch|delete|route)\s*\(\s*['\"]([^'\"]+)['\"]")
GO_ROUTE_RE = re.compile(
    r"\b(?:mux|r|router|app|e|g|v\d+|api|http)\s*\.\s*(HandleFunc|Handle|Get|Post|Put|Patch|Delete|GET|POST|PUT|PATCH|DELETE)\s*\(\s*\"([^\"]+)\""
)
RUST_AXUM_RE = re.compile(r"\.route\s*\(\s*\"([^\"]+)\"\s*,\s*(get|post|put|patch|delete)\b")
RUST_ATTR_ROUTE_RE = re.compile(r"#\[\s*(get|post|put|patch|delete)\s*\(\s*\"([^\"]+)\"")
TAURI_CMD_RE = re.compile(r"#\[\s*tauri::command(?:\([^\]]*\))?\s*\][\s\S]{0,140}?\bfn\s+([A-Za-z_][A-Za-z0-9_]*)")
ELECTRON_IPC_RE = re.compile(r"\bipcMain\s*\.\s*(handle|on)\s*\(\s*['\"`]([^'\"`]+)['\"`]")
MCP_TOOL_RE = re.compile(r"\b(?:server|mcp|mcpServer)\s*\.\s*(?:tool|registerTool)\s*\(\s*['\"`]([^'\"`]+)['\"`]")
AI_SDK_TOOL_RE = re.compile(
    r"(?:([A-Za-z_$][\w$]*)\s*[:=]\s*)?\btool\s*\(\s*\{[\s\S]{0,220}?\b(?:description|parameters|inputSchema)\s*:"
)

AUTH_HINT_RE = re.compile(
    r"\b(?:requireAuth|authenticate|isAuthenticated|checkAuth|getSession|getServerSession|validateSession|"
    r"verifyToken|jwt\.verify|jwtVerify|authMiddleware|withAuth|AuthGuard|UseGuards|protectedProcedure|"
    r"authedProcedure|adminProcedure|login_required|Depends\s*\(\s*get_current_user|auth\s*\(\s*\)|currentUser\s*\(\s*\))\b"
)
SCHEMA_HINT_RE = re.compile(
    r"\b(?:z\.object|z\.string|safeParse|\.parse\s*\(|zValidator|\.input\s*\(|joi\.|yup\.|"
    r"BaseModel|pydantic|Deserialize|ValidateNested|ValidationPipe)\b"
)
TENANT_HINT_RE = re.compile(
    r"\b(?:orgId|org_id|tenantId|tenant_id|workspaceId|workspace_id|organizationId|organization_id|ownerId|owner_id|userId|user_id)\b"
)
PROJECTION_HINT_RE = re.compile(
    r"\b(?:select\s*:\s*\{|\.select\s*\(\s*\{|omit\s*:\s*\{|response_model\s*=|ResponseDto|OutputSchema|pick\s*\(|serialize)\b"
)


def _derive_next_app_route(rel_parts: Tuple[str, ...]) -> str:
    lower_parts = [p.lower() for p in rel_parts]
    app_idx = lower_parts.index("app") if "app" in lower_parts else 0
    segments = [
        seg for seg in rel_parts[app_idx + 1 : -1]
        if not (seg.startswith("(") and seg.endswith(")")) and not seg.startswith("@")
    ]
    return "/" + "/".join(segments) if segments else "/"


def _emit(
    sink: List[Dict[str, object]], kind: str, method: str, sym: str,
    rel_str: str, stripped: str, offset: int, force_auth: bool = False,
) -> None:
    window = stripped[max(0, offset - 160) : offset + 900]
    scope_text = window + "\n" + stripped[:1200]
    sink.append({
        "kind": kind,
        "method": method,
        "path_or_symbol": sym,
        "file": rel_str,
        "line": line_number_at(stripped, offset),
        "preflags": {
            "has_auth_hint": bool(force_auth or AUTH_HINT_RE.search(scope_text)),
            "has_schema_hint": bool(SCHEMA_HINT_RE.search(window)),
            "has_tenant_scope_hint": bool(TENANT_HINT_RE.search(window)),
            "has_output_projection_hint": bool(PROJECTION_HINT_RE.search(window)),
        },
    })


def _scan_js_ts_entrypoints(rel_parts: Tuple[str, ...], rel_str: str, stripped: str) -> List[Dict[str, object]]:
    found: List[Dict[str, object]] = []
    fname = rel_parts[-1].lower()
    lower_dirs = [p.lower() for p in rel_parts[:-1]]

    if fname in NEXT_ROUTE_FILENAMES and "app" in lower_dirs:
        route_path = _derive_next_app_route(rel_parts)
        for m in NEXT_METHOD_RE.finditer(stripped):
            _emit(found, "nextjs_route", m.group(1), route_path, rel_str, stripped, m.start())

    if "pages" in lower_dirs and "api" in lower_dirs:
        api_idx = lower_dirs.index("api")
        stem = Path(rel_parts[-1]).stem
        segs = list(rel_parts[api_idx:-1]) + ([] if stem == "index" else [stem])
        _emit(found, "nextjs_pages_api", "ALL", "/" + "/".join(segs), rel_str, stripped, 0)

    head_non_empty = [ln for ln in stripped.splitlines()[:10] if ln.strip()][:2]
    if any(USE_SERVER_TOP_RE.match(ln) for ln in head_non_empty):
        for m in EXPORTED_ASYNC_FN_RE.finditer(stripped):
            _emit(found, "server_action", "ACTION", m.group(1) or m.group(2), rel_str, stripped, m.start())
    else:
        for m in INLINE_SERVER_ACTION_RE.finditer(stripped):
            _emit(found, "server_action", "ACTION", m.group(1), rel_str, stripped, m.start())

    for m in EXPRESS_HONO_RE.finditer(stripped):
        _emit(found, "http_route", m.group(1).upper(), m.group(2), rel_str, stripped, m.start())

    ctrl_match = NEST_CONTROLLER_RE.search(stripped)
    if ctrl_match or "@Get(" in stripped or "@Post(" in stripped:
        prefix = "/" + (ctrl_match.group(1) or "").strip("/") if ctrl_match else ""
        for m in NEST_METHOD_RE.finditer(stripped):
            sub = (m.group(2) or "").strip("/")
            full_path = f"{prefix}/{sub}".replace("//", "/") or "/"
            _emit(found, "nestjs_route", m.group(1).upper(), full_path, rel_str, stripped, m.start())

    for m in TRPC_PROC_RE.finditer(stripped):
        proc_name, builder, op = m.group(1), m.group(2), m.group(3)
        is_protected = any(k in builder for k in ("protected", "authed", "admin"))
        _emit(found, "trpc_procedure", op.upper(), proc_name, rel_str, stripped, m.start(), force_auth=is_protected)

    for m in ELECTRON_IPC_RE.finditer(stripped):
        _emit(found, "electron_ipc", f"IPC_{m.group(1).upper()}", m.group(2), rel_str, stripped, m.start())

    for m in MCP_TOOL_RE.finditer(stripped):
        _emit(found, "mcp_tool", "TOOL", m.group(1), rel_str, stripped, m.start())

    for m in AI_SDK_TOOL_RE.finditer(stripped):
        _emit(found, "ai_tool", "TOOL", m.group(1) or "anonymous_tool", rel_str, stripped, m.start())

    return found


def _scan_other_lang_entrypoints(suffix: str, rel_str: str, stripped: str) -> List[Dict[str, object]]:
    found: List[Dict[str, object]] = []
    if suffix == ".py":
        for m in PY_ROUTE_RE.finditer(stripped):
            _emit(found, "python_route", m.group(1).upper(), m.group(2), rel_str, stripped, m.start())
    elif suffix == ".go":
        for m in GO_ROUTE_RE.finditer(stripped):
            method = m.group(1).upper()
            _emit(found, "go_route", "ANY" if method.startswith("HANDLE") else method, m.group(2), rel_str, stripped, m.start())
    elif suffix == ".rs":
        for m in TAURI_CMD_RE.finditer(stripped):
            _emit(found, "tauri_command", "COMMAND", m.group(1), rel_str, stripped, m.start())
        for m in RUST_AXUM_RE.finditer(stripped):
            _emit(found, "rust_route", m.group(2).upper(), m.group(1), rel_str, stripped, m.start())
        for m in RUST_ATTR_ROUTE_RE.finditer(stripped):
            _emit(found, "rust_route", m.group(1).upper(), m.group(2), rel_str, stripped, m.start())
    return found


def extract_entrypoints(project_root: Union[Path, str]) -> Dict[str, object]:
    """Deterministically enumerate 100% of project entrypoints with zero MAX_FILES cap."""
    root_path = Path(project_root).resolve()
    raw_items: List[Dict[str, object]] = []
    candidates: List[Tuple[Path, Tuple[str, ...]]] = []

    if root_path.is_file():
        candidates.append((root_path, (root_path.name,)))
    else:
        skip_dirs = SKIP_DIRS | ({"skills_library"} if "skills_library" not in root_path.parts else set())
        for dirpath, dirs, filenames in os.walk(root_path):
            dirs[:] = sorted(d for d in dirs if d not in skip_dirs)
            for fname in sorted(filenames):
                fpath = Path(dirpath) / fname
                if fpath.resolve().parent == SELF_DIR or fpath.suffix.lower() not in CENSUS_EXTS:
                    continue
                rel_parts = fpath.relative_to(root_path).parts
                if is_test_or_fixture(rel_parts, fname) or fname.endswith(".d.ts"):
                    continue
                candidates.append((fpath, rel_parts))

    for fpath, rel_parts in candidates:
        try:
            content = fpath.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        suffix = fpath.suffix.lower()
        rel_str = "/".join(rel_parts)
        stripped = strip_comments_preserve_lines(content, suffix)
        if suffix in JS_TS_EXTS:
            raw_items.extend(_scan_js_ts_entrypoints(rel_parts, rel_str, stripped))
        else:
            raw_items.extend(_scan_other_lang_entrypoints(suffix, rel_str, stripped))

    entrypoints: List[Dict[str, object]] = []
    seen: Set[Tuple[object, ...]] = set()
    for item in raw_items:
        dedup_key = (item["kind"], item["method"], item["path_or_symbol"], item["file"], item["line"])
        if dedup_key in seen:
            continue
        seen.add(dedup_key)
        entrypoints.append({"id": f"EP-{len(entrypoints) + 1:03d}", **item})

    return {"total": len(entrypoints), "entrypoints": entrypoints}


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract 100% of API/IPC/AI entrypoints")
    parser.add_argument("project_path", nargs="?", default=".", help="Project root directory")
    parser.add_argument("--json", action="store_true", help="Print JSON output")
    args = parser.parse_args()
    target = Path(args.project_path)
    if not target.exists():
        print(f"Error: path does not exist: {args.project_path}", file=sys.stderr)
        sys.exit(2)
    census = extract_entrypoints(target)
    if args.json:
        print(json.dumps(census, indent=2))
    else:
        print(f"[ROUTE CENSUS] Extracted {census['total']} entrypoint(s)")
        for ep in list(census["entrypoints"]):  # type: ignore[arg-type]
            print(f"  {ep['id']} [{ep['kind']}] {ep['method']} {ep['path_or_symbol']} ({ep['file']}:{ep['line']})")


if __name__ == "__main__":
    main()
