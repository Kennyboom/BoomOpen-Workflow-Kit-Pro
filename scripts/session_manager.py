#!/usr/bin/env python3
"""
Session Manager - BoomOpen Workflow Kit (v5.5.0)
================================================
Analyzes workspace state, detects 2026 tech stacks across Node/TS, Python, Rust,
and Go, inspects `.boomopen/project-ledger.json` autopilot state when present,
and prints a clean UTF-8 session summary.

Usage (python3 on macOS/Linux, py on Windows also work):
    python session_manager.py status [path]
    python session_manager.py info [path]

Installed location: ~/.<tool>/skills/boomopen-workflow-kit/scripts/session_manager.py
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

sys.dont_write_bytecode = True  # keep the installed kit free of __pycache__

from kit_console import force_utf8_output  # noqa: E402

EXIT_USAGE = 2
EXCLUDED_DIRS = {
    ".git", "node_modules", ".next", "dist", "build", "target", "coverage",
    ".boomopen", ".agent", ".gemini", "__pycache__", ".venv", "venv",
}

NODE_STACK_DETECTORS = (
    (("next",), "Next.js"),
    (("astro",), "Astro"),
    (("react",), "React"),
    (("vue", "nuxt"), "Vue / Nuxt"),
    (("svelte", "@sveltejs/kit"), "Svelte / SvelteKit"),
    (("hono",), "Hono"),
    (("fastify",), "Fastify"),
    (("express",), "Express"),
    (("nestjs", "@nestjs/core"), "NestJS"),
    (("tailwindcss",), "Tailwind CSS"),
    (("drizzle-orm",), "Drizzle ORM"),
    (("prisma", "@prisma/client"), "Prisma"),
    (("better-auth",), "Better Auth"),
    (("@tauri-apps/api", "@tauri-apps/cli"), "Tauri"),
    (("vitest",), "Vitest"),
    (("@playwright/test", "playwright"), "Playwright"),
    (("typescript",), "TypeScript"),
)


def get_project_root(path: str) -> Path:
    return Path(path).resolve()


def read_ledger_summary(root: Path) -> Optional[Dict[str, Any]]:
    ledger_path = root / ".boomopen" / "project-ledger.json"
    if not ledger_path.exists():
        return None
    try:
        data = json.loads(ledger_path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return None
        phases = data.get("phases", [])
        if not isinstance(phases, list):
            phases = []
        completed = sum(
            1 for p in phases if isinstance(p, dict) and p.get("status") in ("verified", "completed")
        )
        project_title = (
            data.get("project_name")
            or data.get("project")
            or data.get("projectName")
            or data.get("name")
            or root.name
        )
        return {
            "project": project_title,
            "phases_total": len(phases),
            "phases_completed": completed,
        }
    except (OSError, ValueError):
        return None


def analyze_project(root: Path) -> Dict[str, Any]:
    stack: List[str] = []
    name = root.name
    version = "0.0.0"
    scripts: List[str] = []

    pkg_file = root / "package.json"
    if pkg_file.exists():
        try:
            data = json.loads(pkg_file.read_text(encoding="utf-8"))
            name = data.get("name", name)
            version = data.get("version", version)
            all_deps = {**(data.get("dependencies") or {}), **(data.get("devDependencies") or {})}
            scripts = list((data.get("scripts") or {}).keys())
            for keys, label in NODE_STACK_DETECTORS:
                if any(k in all_deps for k in keys):
                    stack.append(label)
        except (OSError, ValueError) as exc:
            return {"name": name, "error": str(exc), "stack": stack, "scripts": scripts}

    if (root / "pyproject.toml").exists() or (root / "requirements.txt").exists():
        stack.append("Python")
    if (root / "Cargo.toml").exists():
        stack.append("Rust (Cargo)")
    if (root / "go.mod").exists():
        stack.append("Go")

    ledger = read_ledger_summary(root)
    return {
        "name": name,
        "version": version,
        "stack": stack,
        "scripts": scripts,
        "autopilot_ledger": ledger,
    }


def count_files(root: Path) -> Dict[str, int]:
    total = 0
    for _, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        total += len(files)
    return {"total": total}


def detect_features(root: Path) -> List[str]:
    features: List[str] = []
    for base in (root / "src", root):
        if not base.exists():
            continue
        for candidate in ("features", "modules", "components", "app", "pages", "services", "routes"):
            folder = base / candidate
            if folder.is_dir():
                for child in sorted(folder.iterdir(), key=lambda p: p.name):
                    if child.is_dir() and not child.name.startswith(".") and child.name not in features:
                        features.append(child.name)
    return features[:10]


def print_status(root: Path) -> None:
    info = analyze_project(root)
    stats = count_files(root)
    features = detect_features(root)
    ledger = info.get("autopilot_ledger")

    print("\n=== Project Status ===")
    print(f"\n📁 Project: {info.get('name', root.name)}")
    print(f"📂 Path: {root}")
    print(f"🏷️  Type: {', '.join(info.get('stack') or ['Generic'])}")
    print("📊 Status: Active")
    if ledger:
        print(f"🧭 Autopilot Ledger: {ledger['phases_completed']}/{ledger['phases_total']} phases completed")

    print("\n🔧 Tech Stack:")
    for tech in info.get("stack", []):
        print(f"   • {tech}")
    if not info.get("stack"):
        print("   • (No framework manifest detected)")

    print(f"\n✅ Detected Modules/Features ({len(features)}):")
    for feat in features:
        print(f"   • {feat}")
    if not features:
        print("   (No distinct feature modules detected)")

    print(f"\n📄 Files: {stats['total']} total files tracked")
    print("\n====================\n")


def main() -> None:
    force_utf8_output()
    parser = argparse.ArgumentParser(description="BoomOpen Session & Workspace Manager")
    parser.add_argument("command", choices=["status", "info"], help="Command to run")
    parser.add_argument("path", nargs="?", default=".", help="Project path")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")

    args = parser.parse_args()
    root = get_project_root(args.path)
    if not root.is_dir():
        print(f"Error: project path is not an existing directory: {root}", file=sys.stderr)
        sys.exit(EXIT_USAGE)

    if args.command == "info" or args.json:
        payload = analyze_project(root)
        if args.command == "status":
            payload["files"] = count_files(root)["total"]
            payload["features"] = detect_features(root)
        print(json.dumps(payload, indent=2))
    else:
        print_status(root)


if __name__ == "__main__":
    main()
