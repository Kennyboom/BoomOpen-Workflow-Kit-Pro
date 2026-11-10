#!/usr/bin/env python3
"""
Skill: performance-profiling
Script: lighthouse_audit.py
Purpose: Run Lighthouse performance audit on a URL
Usage: python lighthouse_audit.py https://example.com
Output: JSON with performance scores
Exit code: 0 = report produced, 1 = usage error or Lighthouse failed (JSON has an "error" key)
Note: Requires lighthouse CLI (npm install -g lighthouse)
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

LIGHTHOUSE_TIMEOUT_SECONDS = 120
CATEGORY_KEYS = {
    "performance": "performance",
    "accessibility": "accessibility",
    "best_practices": "best-practices",
    "seo": "seo",
}


def category_score(categories: dict, key: str) -> int:
    """Score 0-100. Lighthouse reports `score: null` for categories whose audits failed."""
    score = categories.get(key, {}).get("score")
    return int((score or 0) * 100)


def report_failure(report: dict, categories: dict, returncode: int):
    """Why a written report is not a valid audit, or None.

    Lighthouse still writes a report when the page cannot be loaded: it carries `runtimeError`,
    every category score is null and the CLI exits non-zero. Such a report must fail the gate.
    """
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


def run_lighthouse(url: str) -> dict:
    """Run Lighthouse audit on URL."""
    # shutil.which also resolves lighthouse.cmd on Windows, which subprocess alone does not.
    executable = shutil.which("lighthouse")
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
        with open(output_path, "r", encoding="utf-8") as f:
            report = json.load(f)
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


def get_summary(categories: dict) -> str:
    """Generate summary based on scores."""
    perf = category_score(categories, "performance")
    if perf >= 90:
        return "[OK] Excellent performance"
    if perf >= 50:
        return "[!] Needs improvement"
    return "[X] Poor performance"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python lighthouse_audit.py <url>"}))
        sys.exit(1)

    audit = run_lighthouse(sys.argv[1])
    print(json.dumps(audit, indent=2))
    sys.exit(1 if "error" in audit else 0)
