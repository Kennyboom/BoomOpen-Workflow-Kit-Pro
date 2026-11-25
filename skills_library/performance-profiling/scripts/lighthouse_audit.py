#!/usr/bin/env python3
"""
Skill: performance-profiling
Script: lighthouse_audit.py
Purpose: Run Lighthouse performance & accessibility audit on a live URL
Usage: python lighthouse_audit.py <http(s)://url> [project_path] [--project <dir>] [--min-score 50]
Output: JSON with category scores, passed boolean, and threshold verdict
Exit codes: 0 = audit passed all thresholds, 1 = Lighthouse error or score below threshold, 2 = invalid arguments
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
from typing import List, Optional

sys.dont_write_bytecode = True

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
DEFAULT_MIN_SCORE = 50
LIGHTHOUSE_TIMEOUT_SECONDS = 120
URL_RE = re.compile(r"^https?://\S+$", re.IGNORECASE)
CATEGORY_KEYS = {
    "performance": "performance",
    "accessibility": "accessibility",
    "best_practices": "best-practices",
    "seo": "seo",
}
REQUIRED_SCORE_CATEGORIES = ("performance", "accessibility")


def candidate_roots(project_dir: Optional[Path]) -> List[Path]:
    """Ordered directories to search for local node_modules/.bin/lighthouse."""
    roots: List[Path] = []
    seeds: List[Path] = []
    if project_dir is not None:
        seeds.append(project_dir.resolve())
    env_dir = os.environ.get("BOOMOPEN_PROJECT_DIR")
    if env_dir and Path(env_dir).is_dir():
        seeds.append(Path(env_dir).resolve())
    seeds.append(Path.cwd().resolve())

    for seed in seeds:
        for directory in (seed, *seed.parents):
            if directory not in roots:
                roots.append(directory)
    return roots


def resolve_lighthouse_binary(project_dir: Optional[Path] = None) -> Optional[str]:
    """Check target project's local node_modules/.bin/lighthouse first, then cwd, then PATH."""
    names = ("lighthouse.cmd", "lighthouse.exe", "lighthouse") if sys.platform == "win32" else ("lighthouse",)
    for base in candidate_roots(project_dir):
        bin_dir = base / "node_modules" / ".bin"
        for name in names:
            local_bin = bin_dir / name
            if local_bin.is_file():
                return str(local_bin)
    return shutil.which("lighthouse")


def category_score(categories: dict, key: str) -> int:
    score = categories.get(key, {}).get("score")
    return round((score or 0) * 100)


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


def evaluate_scores(categories: dict, scores: dict, min_score: int) -> tuple:
    failing = [
        f"{cat}={scores[cat]} (< {min_score})"
        for cat in REQUIRED_SCORE_CATEGORIES
        if categories.get(CATEGORY_KEYS[cat], {}).get("score") is not None and scores[cat] < min_score
    ]
    if failing:
        return False, f"[X] Lighthouse score below threshold ({min_score}): {', '.join(failing)}"
    perf = scores["performance"]
    if perf >= 90:
        return True, "[OK] Excellent performance"
    return True, "[!] Acceptable performance (needs improvement)"


def run_lighthouse(url: str, project_dir: Optional[Path] = None, min_score: int = DEFAULT_MIN_SCORE) -> dict:
    executable = resolve_lighthouse_binary(project_dir)
    if executable is None:
        return {
            "url": url,
            "passed": False,
            "status": "error",
            "error": "Lighthouse CLI not found. Install locally with: npm install -D lighthouse",
        }
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
            return {
                "url": url,
                "passed": False,
                "status": "error",
                "error": "Lighthouse failed to generate report",
                "stderr": (result.stderr or "")[:500],
            }
        with open(output_path, "r", encoding="utf-8") as handle:
            report = json.load(handle)
        categories = report.get("categories", {})
        failure = report_failure(report, categories, result.returncode)
        if failure:
            return {
                "url": url,
                "passed": False,
                "status": "error",
                "error": failure,
                "stderr": (result.stderr or "")[:500],
            }
        scores = {name: category_score(categories, key) for name, key in CATEGORY_KEYS.items()}
        passed, summary = evaluate_scores(categories, scores, min_score)
        return {
            "url": url,
            "passed": passed,
            "status": "passed" if passed else "failed",
            "min_score": min_score,
            "scores": scores,
            "summary": summary,
        }
    except subprocess.TimeoutExpired:
        return {"url": url, "passed": False, "status": "error", "error": "Lighthouse audit timed out"}
    except (OSError, ValueError) as exc:
        return {"url": url, "passed": False, "status": "error", "error": f"Lighthouse report could not be read: {exc}"}
    finally:
        try:
            os.unlink(output_path)
        except OSError:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Lighthouse performance audit on a live URL")
    parser.add_argument("url", nargs="?", default=None, help="Target http(s) URL")
    parser.add_argument("project_path", nargs="?", default=None, help="Optional target project directory")
    parser.add_argument("--project", dest="project_opt", default=None, help="Target project directory")
    parser.add_argument("--min-score", type=int, default=DEFAULT_MIN_SCORE, help="Minimum passing score (0-100)")
    args = parser.parse_args()
    if not args.url or not URL_RE.match(args.url):
        print(json.dumps({"error": "Usage: python lighthouse_audit.py <http(s)://url> [project_path]"}))
        sys.exit(EXIT_USAGE)

    raw_project = args.project_opt or args.project_path
    project_dir: Optional[Path] = None
    if raw_project:
        project_dir = Path(raw_project)
        if not project_dir.is_dir():
            print(json.dumps({"error": f"Project path is not an existing directory: {raw_project}"}))
            sys.exit(EXIT_USAGE)

    audit = run_lighthouse(args.url, project_dir=project_dir, min_score=args.min_score)
    print(json.dumps(audit, indent=2))
    sys.exit(0 if audit.get("passed") else 1)


if __name__ == "__main__":
    main()
