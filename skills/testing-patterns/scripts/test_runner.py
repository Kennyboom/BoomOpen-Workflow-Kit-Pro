#!/usr/bin/env python3
"""
Test Runner - Unified Multi-Language Test Execution & Coverage (v5.5.0)
=======================================================================
Detects and runs the project's test suite across Node.js, Python, Rust, and Go,
safely resolving Windows command shims (npm.cmd / pnpm.cmd / npx.cmd on win32)
and project virtualenvs (.venv).

Usage (python3 on macOS/Linux, py on Windows also work):
    python test_runner.py <project_path> [--coverage] [--json]

Exit codes: 0 = tests passed (or "[SKIP]" printed: no test setup/files found),
1 = tests failed or could not start, 2 = invalid arguments.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
PYTEST_NO_TESTS_EXIT_CODE = 5
TEST_TIMEOUT_SECONDS = 300
NPM_PLACEHOLDER_TEST = "no test specified"
NODE_TEST_SUFFIXES = (
    ".test.js",
    ".test.mjs",
    ".test.cjs",
    ".test.jsx",
    ".test.ts",
    ".test.tsx",
    ".spec.js",
    ".spec.mjs",
    ".spec.cjs",
    ".spec.jsx",
    ".spec.ts",
    ".spec.tsx",
)
SKIP_SCAN_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage", "__pycache__", ".venv", "venv", "target"}


def scan_test_files(project_path: Path) -> Tuple[bool, bool]:
    """Single pruned os.walk returning (has_node_test_files, has_python_test_files)."""
    has_node = False
    has_py = False
    for _, dirs, names in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_SCAN_DIRS]
        for name in names:
            low = name.lower()
            if low.endswith(NODE_TEST_SUFFIXES):
                has_node = True
            elif low.endswith(".py") and (low.startswith("test_") or low.endswith("_test.py")):
                has_py = True
            if has_node and has_py:
                return True, True
    return has_node, has_py


def detect_package_runner(project_path: Path) -> str:
    for lock_name, binary in (
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("bun.lockb", "bun"),
        ("bun.lock", "bun"),
    ):
        if (project_path / lock_name).exists() and shutil.which(binary):
            return binary
    return "npm"


def resolve_python_interpreter(project_path: Path) -> str:
    candidates = [
        project_path / ".venv" / "Scripts" / "python.exe",
        project_path / ".venv" / "bin" / "python",
        project_path / "venv" / "Scripts" / "python.exe",
        project_path / "venv" / "bin" / "python",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return sys.executable


def detect_node_framework(project_path: Path, package_json: Path, has_node_tests: bool) -> Dict[str, object]:
    """Detect npm/pnpm/yarn/bun test, vitest, jest, or native node --test from package.json."""
    result: Dict[str, object] = {"type": "node", "framework": None, "cmd": None, "coverage_cmd": None}
    runner = detect_package_runner(project_path)
    try:
        pkg = json.loads(package_json.read_text(encoding="utf-8"))
        scripts = pkg.get("scripts", {}) if isinstance(pkg, dict) else {}
        deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}
        test_script = scripts.get("test", "") if isinstance(scripts, dict) else ""

        if test_script and NPM_PLACEHOLDER_TEST not in test_script:
            result["framework"] = f"{runner} test"
            result["cmd"] = ["bun", "test"] if runner == "bun" and test_script == "bun test" else [runner, "test"]
            if "vitest" in deps or "vitest" in test_script:
                result["framework"] = "vitest"
                result["coverage_cmd"] = ["npx", "vitest", "run", "--coverage"]
            elif "jest" in deps or "jest" in test_script:
                result["framework"] = "jest"
                result["coverage_cmd"] = ["npx", "jest", "--coverage"]
            elif "node --test" in test_script:
                result["framework"] = "node --test"
                result["coverage_cmd"] = ["node", "--test", "--experimental-test-coverage"]
        elif "vitest" in deps:
            result["framework"] = "vitest"
            result["cmd"] = ["npx", "vitest", "run"]
            result["coverage_cmd"] = ["npx", "vitest", "run", "--coverage"]
        elif "jest" in deps:
            result["framework"] = "jest"
            result["cmd"] = ["npx", "jest"]
            result["coverage_cmd"] = ["npx", "jest", "--coverage"]
        elif not test_script and has_node_tests:
            result["framework"] = "node --test"
            result["cmd"] = ["node", "--test"]
    except (OSError, ValueError, AttributeError, TypeError) as exc:
        print(f"[!] Could not read package.json: {exc}", file=sys.stderr)
    return result


def detect_test_framework(project_path: Path) -> Dict[str, object]:
    """Detect primary test runner across Node.js, Python, Rust, and Go."""
    has_node_tests, has_py_tests = scan_test_files(project_path)
    package_json = project_path / "package.json"
    if package_json.exists():
        node_info = detect_node_framework(project_path, package_json, has_node_tests)
        if node_info["cmd"] or not (
            (project_path / "pyproject.toml").exists()
            or (project_path / "Cargo.toml").exists()
            or (project_path / "go.mod").exists()
        ):
            return node_info

    has_py_manifest = (
        (project_path / "pyproject.toml").exists()
        or (project_path / "pytest.ini").exists()
        or (project_path / "requirements.txt").exists()
    )
    if has_py_manifest or has_py_tests:
        if not has_py_tests and not (project_path / "pytest.ini").exists():
            return {"type": "python", "framework": None, "cmd": None, "coverage_cmd": None}
        py_bin = resolve_python_interpreter(project_path)
        return {
            "type": "python",
            "framework": "pytest",
            "cmd": [py_bin, "-m", "pytest", "-v"],
            "coverage_cmd": [py_bin, "-m", "pytest", "--cov", "--cov-report=term-missing"],
        }

    if (project_path / "Cargo.toml").exists():
        return {"type": "rust", "framework": "cargo test", "cmd": ["cargo", "test"], "coverage_cmd": None}

    if (project_path / "go.mod").exists():
        return {
            "type": "go",
            "framework": "go test",
            "cmd": ["go", "test", "./..."],
            "coverage_cmd": ["go", "test", "-cover", "./..."],
        }

    if has_node_tests:
        return {"type": "node", "framework": "node --test", "cmd": ["node", "--test"], "coverage_cmd": None}

    return {"type": "unknown", "framework": None, "cmd": None, "coverage_cmd": None}


def resolve_command(cmd: List[str]) -> List[str]:
    """Resolve executable via shutil.which so npm.cmd/npx.cmd/pnpm.cmd work on win32."""
    resolved = shutil.which(cmd[0])
    return [resolved] + cmd[1:] if resolved else cmd


def parse_test_counts(output: str) -> Tuple[int, int]:
    """Extract (passed, failed) counts from Jest, Vitest, Pytest, Node --test, or Cargo output."""
    node_pass = re.search(r"(?:ℹ|#)\s+pass\s+(\d+)", output)
    node_fail = re.search(r"(?:ℹ|#)\s+fail\s+(\d+)", output)
    if node_pass or node_fail:
        return (int(node_pass.group(1)) if node_pass else 0, int(node_fail.group(1)) if node_fail else 0)

    cargo_match = re.search(r"test result:\s+\w+\.\s+(\d+)\s+passed;\s+(\d+)\s+failed", output)
    if cargo_match:
        return int(cargo_match.group(1)), int(cargo_match.group(2))

    passed_match = re.search(r"(\d+)\s+passed", output, re.IGNORECASE)
    failed_match = re.search(r"(\d+)\s+failed", output, re.IGNORECASE)
    if passed_match or failed_match:
        return (
            int(passed_match.group(1)) if passed_match else 0,
            int(failed_match.group(1)) if failed_match else 0,
        )
    return 0, 0


def run_tests(cmd: List[str], cwd: Path, framework: Optional[str]) -> Dict[str, object]:
    """Execute the resolved test runner command and summarize results."""
    result: Dict[str, object] = {
        "passed": False,
        "skipped": False,
        "output": "",
        "error": "",
        "tests_run": 0,
        "tests_passed": 0,
        "tests_failed": 0,
    }
    try:
        proc = subprocess.run(
            resolve_command(cmd),
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=TEST_TIMEOUT_SECONDS,
        )
        combined = f"{proc.stdout or ''}\n{proc.stderr or ''}"
        result["output"] = (proc.stdout or "")[:3000]
        result["error"] = (proc.stderr or "")[:500]
        if framework == "pytest" and proc.returncode == PYTEST_NO_TESTS_EXIT_CODE:
            result["passed"] = True
            result["skipped"] = True
            return result
        result["passed"] = proc.returncode == 0
        passed_cnt, failed_cnt = parse_test_counts(combined)
        result["tests_passed"] = passed_cnt
        result["tests_failed"] = failed_cnt
        result["tests_run"] = passed_cnt + failed_cnt
    except FileNotFoundError:
        result["error"] = f"Command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        result["error"] = f"Timeout after {TEST_TIMEOUT_SECONDS}s"
    except OSError as exc:
        result["error"] = str(exc)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect and run a project's test suite")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--coverage", action="store_true", help="Run with coverage")
    parser.add_argument("--json", action="store_true", help="Output report as JSON")
    args = parser.parse_args()
    if not Path(args.project_path).is_dir():
        parser.print_usage(sys.stderr)
        print(f"Error: project path is not an existing directory: {args.project_path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def build_json_payload(project_path: Path, test_info: Dict[str, object], result: Dict[str, object]) -> Dict[str, object]:
    return {
        "script": "test_runner",
        "project": str(project_path),
        "type": test_info["type"],
        "framework": test_info["framework"],
        "tests_run": result["tests_run"],
        "tests_passed": result["tests_passed"],
        "tests_failed": result["tests_failed"],
        "skipped": bool(result.get("skipped", False)),
        "passed": result["passed"],
    }


def main() -> None:
    args = parse_args()
    project_path = Path(args.project_path).resolve()
    test_info = detect_test_framework(project_path)

    raw_cmd: Optional[List[str]] = (
        test_info["coverage_cmd"] if args.coverage and test_info["coverage_cmd"] else test_info["cmd"]
    )  # type: ignore[assignment]
    if not raw_cmd:
        skip_payload = {
            "script": "test_runner",
            "project": str(project_path),
            "type": test_info["type"],
            "framework": None,
            "passed": True,
            "skipped": True,
            "message": "No tests configured",
        }
        if args.json:
            print(json.dumps(skip_payload, indent=2))
        else:
            print(f"\n{'=' * 60}\n[TEST RUNNER] Unified Test Execution\n{'=' * 60}")
            print("[SKIP] No test framework or test files found for this project.")
            print(json.dumps(skip_payload, indent=2))
        sys.exit(0)

    result = run_tests(raw_cmd, project_path, str(test_info["framework"]) if test_info["framework"] else None)
    payload = build_json_payload(project_path, test_info, result)

    if args.json:
        print(json.dumps(payload, indent=2))
        sys.exit(0 if result["passed"] else 1)

    print(f"\n{'=' * 60}\n[TEST RUNNER] Unified Test Execution\n{'=' * 60}")
    print(f"Project: {project_path}")
    print(f"Coverage: {'enabled' if args.coverage else 'disabled'}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Type: {test_info['type']} | Framework: {test_info['framework']}\n" + "-" * 60)

    if result.get("skipped"):
        print("[SKIP] Test runner collected 0 tests.")
        print(json.dumps(payload, indent=2))
        sys.exit(0)

    print(f"Running: {' '.join(str(part) for part in raw_cmd)}\n" + "-" * 60)
    if result["output"]:
        lines = str(result["output"]).split("\n")
        for line in lines[:30]:
            print(line)
        if len(lines) > 30:
            print(f"... ({len(lines) - 30} more lines)")

    print("\n" + "=" * 60 + "\nSUMMARY\n" + "=" * 60)
    if result["passed"]:
        print("[PASS] All tests passed")
    else:
        print("[FAIL] Some tests failed")
        if result["error"]:
            print(f"Error: {str(result['error'])[:200]}")

    if int(result["tests_run"]) > 0:
        print(f"Tests: {result['tests_run']} total, {result['tests_passed']} passed, {result['tests_failed']} failed")
    print("\n" + json.dumps(payload, indent=2))
    sys.exit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
