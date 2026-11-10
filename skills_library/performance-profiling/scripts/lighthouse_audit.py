#!/usr/bin/env python3
"""
Skill: performance-profiling
Script: lighthouse_audit.py
Purpose: Run Lighthouse performance audit on a URL
Usage: python lighthouse_audit.py https://example.com
Output: JSON with performance scores
Exit codes: 0 = report produced, 1 = Lighthouse failed (JSON has an "error" key), 2 = invalid arguments
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
LIGHTHOUSE_TIMEOUT_SECONDS = 120
URL_RE = re.compile(r"^https?://\S+$", re.IGNORECASE)
CATEGORY_KEYS = {
    "performance": "performance",
    "accessibility": "accessibility",
    "best_practices": "best-practices",
    "seo": "seo",
}


def resolve_lighthouse_binary() -> Optional[str]:
    """Check local node_modules/.bin/lighthouse first, then global PATH."""
    bin_dir = Path.cwd() / "node_modules" / ".bin"
    names = ("lighthouse.cmd", "lighthouse.exe", "lighthouse") if sys.platform == "win32" else ("lighthouse",)
    for name in names:
        local_bin = bin_dir / name
        if local_bin.is_file():
            return str(local_bin)
    return shutil.which("lighthouse")


def category_score(categories: dict, key: str) -> int:
    score = categories.get(key, {}).get("score")
    return int((score or 0) * 100)


def report_failure(report: dict, categories: dict, returncode: int) -> Optional[str]:
    runtime_error = report.get("runtimeError")
    if isinstance(runtime_error, dict) and runtime_error:
        code = runtime_error.get("code", "UNKNOWN")
        message = runtime_error.get("message", "")
        return f"Lighthouse could not load the page: {code} {message}".strip()
    if returncode != 0:
        return f"Lighthouse exited with code {returncode}"
    scores = [categories.get(key, {}).get("score") for key in CATEGORY_KEYS.values()]
    if all(score is None for score in scores):
        return "Lighthouse produced no category scores"
    return None


def get_summary(categories: dict) -> str:
    perf = category_score(categories, "performance")
    if perf >= 90:
        return "[OK] Excellent performance"
    if perf >= 50:
        return "[!] Needs improvement"
    return "[X] Poor performance"


def run_lighthouse(url: str) -> dict:
    executable = resolve_lighthouse_binary()
    if executable is None:
        return {"error": "Lighthouse CLI not found. Install with: npm install -g lighthouse"}
    fd, output_path = tempfile.mkstemp(suffix=".json")
    os.close(fd)
    try:
        result = subprocess.run(
            [
                executable,
                url,
                "--output=json",
                f"--output-path={output_path}",
                "--chrome-flags=--headless",
                "--only-categories=performance,accessibility,best-practices,seo",
            ],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=LIGHTHOUSE_TIMEOUT_SECONDS,
        )
        if os.path.getsize(output_path) == 0:
            return {"error": "Lighthouse failed to generate report", "stderr": (result.stderr or "")[:500]}
        with open(output_path, "r", encoding="utf-8") as handle:
            report = json.load(handle)
        categories = report.get("categories", {})
        failure = report_failure(report, categories, result.returncode)
        if failure:
            return {"error": failure, "url": url, "stderr": (result.stderr or "")[:500]}
        return {
            "url": url,
            "scores": {name: category_score(categories, key) for name, key in CATEGORY_KEYS.items()},
            "summary": get_summary(categories),
        }
    except subprocess.TimeoutExpired:
        return {"error": "Lighthouse audit timed out"}
    except (OSError, ValueError) as exc:
        return {"error": f"Lighthouse report could not be read: {exc}"}
    finally:
        try:
            os.unlink(output_path)
        except OSError:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Lighthouse performance audit on a live URL")
    parser.add_argument("url", nargs="?", default=None, help="Target http(s) URL")
    args = parser.parse_args()
    if not args.url or not URL_RE.match(args.url):
        print(json.dumps({"error": "Usage: python lighthouse_audit.py <http(s)://url>"}))
        sys.exit(EXIT_USAGE)

    audit = run_lighthouse(args.url)
    print(json.dumps(audit, indent=2))
    sys.exit(1 if "error" in audit else 0)


if __name__ == "__main__":
    main()
