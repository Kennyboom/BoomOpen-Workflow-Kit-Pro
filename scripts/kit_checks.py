#!/usr/bin/env python3
"""
Check runner shared by checklist.py and verify_all.py.

Rules that keep the gate honest:
- Check scripts are resolved ONLY from the kit itself (repository checkout or
  installed layout), never from the audited project, so a project cannot
  shadow the security scan with its own copy.
- Child scripts run with the current interpreter (sys.executable), never a
  bare `python` that may not exist on macOS/Linux.
- URL-based checks (Lighthouse, Playwright) receive the URL as their first
  argument, and a JSON result that reports an error counts as a failure even
  if the script exited 0.
- A missing check script is a failure (incomplete install), and a run in
  which no check actually executed is never reported as passed.
- A checker that prints a line starting with "[SKIP]" and exits 0 had nothing
  to check (for example no API files); it is reported as skipped, not passed.
"""

import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from kit_console import Colors, print_error, print_header, print_step, print_success, print_warning

TARGET_PROJECT = "project"
TARGET_URL = "url"

STATUS_PASSED = "passed"
STATUS_FAILED = "failed"
STATUS_SKIPPED = "skipped"
STATUS_MISSING = "missing"

EXIT_USAGE = 2
SKIP_MARKER_RE = re.compile(r"^\[SKIP\]", re.MULTILINE)
URL_RE = re.compile(r"^https?://\S+$", re.IGNORECASE)
FRAMEWORK_DIR_NAME = "boomopen-workflow-kit"
OUTPUT_PREVIEW_LINES = 12
ERROR_PREVIEW_CHARS = 400


@dataclass(frozen=True)
class CheckSpec:
    """One validation script, relative to the kit root."""

    name: str
    rel_path: str
    required: bool = False
    target: str = TARGET_PROJECT


@dataclass
class CheckResult:
    name: str
    status: str
    duration: float = 0.0
    output: str = ""
    error: str = ""
    category: str = ""

    @property
    def is_failure(self) -> bool:
        return self.status in (STATUS_FAILED, STATUS_MISSING)


def kit_roots() -> List[Path]:
    """Directories that contain the kit's skills/ and skills_library/ folders.

    Repository checkout: <repo>/scripts/this_file -> <repo>.
    Installed layout:    ~/.<tool>/skills/boomopen-workflow-kit/scripts/this_file,
                         with skills at ~/.<tool>/skills and the library at
                         ~/.<tool>/skills_library -> root is ~/.<tool>.
    """
    scripts_dir = Path(__file__).resolve().parent
    framework_dir = scripts_dir.parent
    roots = [framework_dir]
    skills_dir = framework_dir.parent
    if framework_dir.name == FRAMEWORK_DIR_NAME and skills_dir.name == "skills":
        roots.append(skills_dir.parent)
    return roots


def resolve_script(rel_path: str) -> Optional[Path]:
    """Return the kit's own copy of a check script, or None if not installed."""
    for root in kit_roots():
        candidate = root / rel_path
        if candidate.is_file():
            return candidate
    return None


def is_valid_url(url: str) -> bool:
    return bool(URL_RE.match(url or ""))


def _json_reports_error(stdout: str) -> Optional[str]:
    """Return an error message if the script's JSON output reports a failure."""
    try:
        data = json.loads(stdout)
    except (ValueError, TypeError):
        return None
    if not isinstance(data, dict):
        return None
    if data.get("error"):
        return str(data["error"])
    if str(data.get("status", "")).lower() in ("error", "failed"):
        return str(data.get("summary") or data.get("status"))
    return None


def _child_env() -> dict:
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    return env


def run_check(spec: CheckSpec, project: Path, url: Optional[str], timeout: int) -> CheckResult:
    """Run one check script and classify the outcome."""
    script = resolve_script(spec.rel_path)
    if script is None:
        print_error(f"{spec.name}: MISSING - {spec.rel_path} is not installed with the kit")
        return CheckResult(spec.name, STATUS_MISSING, error=f"Script not found: {spec.rel_path}")

    argument = url if spec.target == TARGET_URL else str(project)
    if not argument:
        return CheckResult(spec.name, STATUS_SKIPPED, error="No URL provided")

    print_step(f"Running: {spec.name}")
    started = time.monotonic()
    try:
        proc = subprocess.run(
            [sys.executable, "-B", str(script), argument],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            env=_child_env(),
        )
    except subprocess.TimeoutExpired:
        duration = time.monotonic() - started
        print_error(f"{spec.name}: TIMEOUT (>{timeout}s)")
        return CheckResult(spec.name, STATUS_FAILED, duration, error=f"Timeout after {timeout}s")
    except OSError as exc:
        duration = time.monotonic() - started
        print_error(f"{spec.name}: ERROR - {exc}")
        return CheckResult(spec.name, STATUS_FAILED, duration, error=str(exc))

    duration = time.monotonic() - started
    stdout = proc.stdout or ""
    stderr = proc.stderr or ""
    status = STATUS_PASSED if proc.returncode == 0 else STATUS_FAILED
    if status == STATUS_PASSED and spec.target == TARGET_URL:
        reported = _json_reports_error(stdout)
        if reported:
            status = STATUS_FAILED
            stderr = stderr or reported
    if status == STATUS_PASSED and SKIP_MARKER_RE.search(stdout):
        status = STATUS_SKIPPED

    result = CheckResult(spec.name, status, duration, stdout, stderr)
    _print_outcome(result, proc.returncode)
    return result


def _print_outcome(result: CheckResult, returncode: int) -> None:
    timing = f"({result.duration:.1f}s)"
    if result.status == STATUS_PASSED:
        print_success(f"{result.name}: PASSED {timing}")
        return
    if result.status == STATUS_SKIPPED:
        print_warning(f"{result.name}: SKIPPED - nothing to check {timing}")
        return
    print_error(f"{result.name}: FAILED (exit {returncode}) {timing}")
    preview = result.error.strip()[:ERROR_PREVIEW_CHARS]
    if not preview:
        lines = [line for line in result.output.splitlines() if line.strip()]
        preview = "\n".join(lines[-OUTPUT_PREVIEW_LINES:])
    for line in preview.splitlines():
        print(f"    {line}")


def summarize(results: List[CheckResult], title: str, width: int = 60) -> bool:
    """Print the final report. Returns True only if the gate really passed."""
    print_header(title, width)
    passed = sum(1 for r in results if r.status == STATUS_PASSED)
    failed = sum(1 for r in results if r.status == STATUS_FAILED)
    missing = sum(1 for r in results if r.status == STATUS_MISSING)
    skipped = sum(1 for r in results if r.status == STATUS_SKIPPED)

    print(f"Total Checks: {len(results)}")
    print(f"{Colors.GREEN}✅ Passed:  {passed}{Colors.ENDC}")
    print(f"{Colors.RED}❌ Failed:  {failed}{Colors.ENDC}")
    print(f"{Colors.RED}🚫 Missing: {missing}{Colors.ENDC}")
    print(f"{Colors.YELLOW}⏭️  Skipped: {skipped}{Colors.ENDC}\n")

    icons = {
        STATUS_PASSED: f"{Colors.GREEN}✅{Colors.ENDC}",
        STATUS_FAILED: f"{Colors.RED}❌{Colors.ENDC}",
        STATUS_MISSING: f"{Colors.RED}🚫{Colors.ENDC}",
        STATUS_SKIPPED: f"{Colors.YELLOW}⏭️ {Colors.ENDC}",
    }
    category = None
    for r in results:
        if r.category and r.category != category:
            category = r.category
            print(f"\n{Colors.BOLD}{Colors.CYAN}{category}:{Colors.ENDC}")
        timing = f"({r.duration:.1f}s)" if r.status in (STATUS_PASSED, STATUS_FAILED) else ""
        label = " (script not installed)" if r.status == STATUS_MISSING else ""
        print(f"  {icons[r.status]} {r.name}{label} {timing}")
    print()

    if failed or missing:
        print_error(f"{failed + missing} check(s) FAILED or MISSING - fix before proceeding")
        return False
    if passed == 0:
        print_error("No check actually ran - nothing was verified")
        return False
    print_success(f"All {passed} executed check(s) PASSED ({skipped} skipped: nothing to check)")
    return True
