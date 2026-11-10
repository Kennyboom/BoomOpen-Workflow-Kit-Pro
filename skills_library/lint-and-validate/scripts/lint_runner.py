#!/usr/bin/env python3
"""
Lint Runner - Unified linting and type checking
Runs appropriate linters based on project type.

Usage:
    python lint_runner.py <project_path>

Supports:
    - Node.js: npm run lint, npx tsc --noEmit
    - Python: ruff check, mypy
"""

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.dont_write_bytecode = True

# Fix Windows console encoding
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass


def detect_project_type(project_path: Path) -> dict:
    """Detect project type and available linters."""
    result = {
        "type": "unknown",
        "linters": []
    }

    # Node.js project
    package_json = project_path / "package.json"
    if package_json.exists():
        result["type"] = "node"
        try:
            pkg = json.loads(package_json.read_text(encoding="utf-8"))
            scripts = pkg.get("scripts", {})
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}

            # Check for lint script
            if "lint" in scripts:
                result["linters"].append({"name": "npm lint", "cmd": ["npm", "run", "lint"]})
            elif "eslint" in deps:
                result["linters"].append({"name": "eslint", "cmd": ["npx", "eslint", "."]})

            # Check for TypeScript (skip raw tsc --noEmit if solution tsconfig uses project references)
            tsconfig_path = project_path / "tsconfig.json"
            if "typescript" in deps or tsconfig_path.exists():
                is_solution_refs = False
                if tsconfig_path.exists():
                    try:
                        ts_raw = tsconfig_path.read_text(encoding="utf-8", errors="ignore")
                        if '"references"' in ts_raw and '"files": []' in ts_raw:
                            is_solution_refs = True
                    except OSError:
                        pass
                if not is_solution_refs:
                    result["linters"].append({"name": "tsc", "cmd": ["npx", "tsc", "--noEmit"]})

        except Exception:
            pass

    # Python project
    if (project_path / "pyproject.toml").exists() or (project_path / "requirements.txt").exists():
        result["type"] = "python"

        if shutil.which("ruff"):
            result["linters"].append({"name": "ruff", "cmd": ["ruff", "check", "."]})

        if ((project_path / "mypy.ini").exists() or (project_path / "pyproject.toml").exists()) and shutil.which("mypy"):
            result["linters"].append({"name": "mypy", "cmd": ["mypy", "."]})

    return result


def run_linter(linter: dict, cwd: Path) -> dict:
    """Run a single linter and return results."""
    result = {
        "name": linter["name"],
        "passed": False,
        "output": "",
        "error": ""
    }

    try:
        cmd = list(linter["cmd"])
        executable = shutil.which(cmd[0])
        if not executable:
            result["error"] = f"Command not found: {cmd[0]}"
            return result
        cmd[0] = executable

        proc = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=15,
            shell=False,
        )

        result["output"] = proc.stdout[:2000] if proc.stdout else ""
        result["error"] = proc.stderr[:500] if proc.stderr else ""
        result["passed"] = proc.returncode == 0

    except FileNotFoundError:
        result["error"] = f"Command not found: {linter['cmd'][0]}"
    except subprocess.TimeoutExpired:
        result["error"] = "Timeout after 15s"
    except Exception as e:
        result["error"] = str(e)

    return result


def main():
    parser = argparse.ArgumentParser(description="Run unified project linters")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--json", action="store_true", help="Print JSON output only")
    args = parser.parse_args()
    project_path = Path(args.project_path).resolve()
    
    print(f"\n{'='*60}")
    print(f"[LINT RUNNER] Unified Linting")
    print(f"{'='*60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Detect project type
    project_info = detect_project_type(project_path)
    print(f"Type: {project_info['type']}")
    print(f"Linters: {len(project_info['linters'])}")
    print("-"*60)
    
    if not project_info["linters"]:
        print("No linters found for this project type.")
        output = {
            "script": "lint_runner",
            "project": str(project_path),
            "type": project_info["type"],
            "checks": [],
            "passed": True,
            "message": "No linters configured"
        }
        print(json.dumps(output, indent=2))
        sys.exit(0)
    
    # Run each linter
    results = []
    all_passed = True
    
    for linter in project_info["linters"]:
        print(f"\nRunning: {linter['name']}...")
        result = run_linter(linter, project_path)
        results.append(result)
        
        if result["passed"]:
            print(f"  [PASS] {linter['name']}")
        else:
            print(f"  [FAIL] {linter['name']}")
            if result["error"]:
                print(f"  Error: {result['error'][:200]}")
            all_passed = False
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    for r in results:
        icon = "[PASS]" if r["passed"] else "[FAIL]"
        print(f"{icon} {r['name']}")
    
    output = {
        "script": "lint_runner",
        "project": str(project_path),
        "type": project_info["type"],
        "checks": results,
        "passed": all_passed
    }
    
    print("\n" + json.dumps(output, indent=2))
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
