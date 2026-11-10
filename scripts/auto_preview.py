#!/usr/bin/env python3
"""
Auto Preview - BoomOpen Workflow Kit (v5.5.0)
=============================================
Manages (start/stop/restart/status/check) the local development server used to
preview the application. Run it from the project root (python3 on macOS/Linux):

    python auto_preview.py start [port] [--timeout SECONDS]
    python auto_preview.py stop
    python auto_preview.py restart [port]
    python auto_preview.py status
    python auto_preview.py check      # exit 0 only if running and listening

Installed location: ~/.<tool>/skills/boomopen-workflow-kit/scripts/auto_preview.py

State is stored in <project>/.boomopen/preview.json (with optional fallback read
from legacy .agent/preview.json for seamless migration) and logs in
<project>/.boomopen/preview.log. Process start time guards against PID reuse.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

sys.dont_write_bytecode = True  # keep the installed kit free of __pycache__

from kit_console import force_utf8_output  # noqa: E402
from kit_process import (  # noqa: E402
    IS_WINDOWS, is_port_open, is_same_process, kill_process_tree, process_start_token,
)

STATE_DIR = Path(".boomopen")
STATE_FILE = STATE_DIR / "preview.json"
LOG_FILE = STATE_DIR / "preview.log"

# Optional fallback paths for projects started by an older release.
LEGACY_DIR = Path(".agent")
LEGACY_STATE_FILE = LEGACY_DIR / "preview.json"
LEGACY_PID_FILE = LEGACY_DIR / "preview.pid"
LEGACY_LOG_FILE = LEGACY_DIR / "preview.log"

DEFAULT_PORT = 3000
DEFAULT_START_TIMEOUT_SECONDS = 60
POLL_INTERVAL_SECONDS = 0.5
LOG_TAIL_LINES = 15
ANSI_ESCAPE_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
LOCAL_URL_RE = re.compile(r"https?://(?:localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0):(\d{2,5})")


def load_state() -> Tuple[Optional[dict], Path]:
    """Load preview state from .boomopen/preview.json or legacy .agent/preview.json."""
    for candidate, log_path in ((STATE_FILE, LOG_FILE), (LEGACY_STATE_FILE, LEGACY_LOG_FILE)):
        try:
            data = json.loads(candidate.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(data, dict) and isinstance(data.get("pid"), int):
            return data, log_path
    return None, LOG_FILE


def save_state(state: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def clear_state() -> None:
    for path in (STATE_FILE, LEGACY_STATE_FILE, LEGACY_PID_FILE):
        try:
            path.unlink()
        except FileNotFoundError:
            pass
        except OSError as exc:
            print(f"⚠️  Could not remove {path}: {exc}")


def warn_legacy_pid_file() -> None:
    """Old versions stored only a PID; its identity cannot be verified safely."""
    if not LEGACY_PID_FILE.exists():
        return
    pid = LEGACY_PID_FILE.read_text(encoding="utf-8", errors="replace").strip()
    print(f"⚠️  Found legacy {LEGACY_PID_FILE} (PID {pid}) without a start time.")
    print("   It is not stopped automatically because the PID may now belong to another")
    print("   program. Stop that dev server yourself if it is still running.")
    try:
        LEGACY_PID_FILE.unlink()
    except OSError as exc:
        print(f"⚠️  Could not remove {LEGACY_PID_FILE}: {exc}")


def detect_package_runner(root: Path) -> str:
    """Prefer lockfile-matched package manager if installed, falling back to npm."""
    for lock_name, binary in (
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("bun.lockb", "bun"),
        ("bun.lock", "bun"),
    ):
        if (root / lock_name).exists() and shutil.which(binary):
            return binary
    return "npm"


def get_start_command(root: Path) -> Optional[List[str]]:
    pkg_file = root / "package.json"
    try:
        data = json.loads(pkg_file.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except (OSError, ValueError) as exc:
        print(f"❌ Cannot read {pkg_file}: {exc}")
        return None
    scripts = data.get("scripts", {}) if isinstance(data, dict) else {}
    runner = detect_package_runner(root)
    if "dev" in scripts:
        return [runner, "run", "dev"]
    if "start" in scripts:
        return [runner, "start"] if runner == "npm" else [runner, "run", "start"]
    return None


def popen_platform_options() -> dict:
    """Detach the server into its own process group so it can be stopped as a tree."""
    if IS_WINDOWS:
        flags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
        return {"creationflags": flags}
    return {"start_new_session": True}


def read_log_tail(log_path: Path = LOG_FILE) -> str:
    try:
        lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return ""
    return "\n".join(lines[-LOG_TAIL_LINES:])


def detect_listening_port(requested_port: int) -> Optional[int]:
    """Return the port the server listens on (requested, or one printed in its log)."""
    if is_port_open(requested_port):
        return requested_port
    try:
        log_text = ANSI_ESCAPE_RE.sub("", LOG_FILE.read_text(encoding="utf-8", errors="replace"))
    except OSError:
        return None
    for match in reversed(LOCAL_URL_RE.findall(log_text)):
        port = int(match)
        if is_port_open(port):
            return port
    return None


def wait_until_ready(process: subprocess.Popen, port: int, timeout: int) -> Optional[int]:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            return None
        listening = detect_listening_port(port)
        if listening:
            return listening
        time.sleep(POLL_INTERVAL_SECONDS)
    return None


def start_server(port: int, timeout: int) -> int:
    state, _ = load_state()
    if state and is_same_process(state["pid"], state.get("token")):
        print(f"⚠️  Preview already running (PID: {state['pid']}, URL: {state.get('url')})")
        return 0
    if state:
        clear_state()
    warn_legacy_pid_file()

    root = Path.cwd()
    cmd = get_start_command(root)
    if not cmd:
        print("❌ No 'dev' or 'start' script found in package.json")
        return 1
    executable = shutil.which(cmd[0])
    if not executable:
        print(f"❌ '{cmd[0]}' was not found on PATH. Install Node.js/npm first.")
        return 1
    if is_port_open(port):
        print(f"❌ Port {port} is already in use. Stop that process or pass another port.")
        return 1

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env["PORT"] = str(port)
    print(f"🚀 Starting preview ({' '.join(cmd)}) on port {port}...")
    try:
        with open(LOG_FILE, "w", encoding="utf-8") as log:
            process = subprocess.Popen(
                [executable] + cmd[1:], cwd=str(root), stdin=subprocess.DEVNULL,
                stdout=log, stderr=subprocess.STDOUT, env=env, **popen_platform_options(),
            )
    except OSError as exc:
        print(f"❌ Could not start the dev server: {exc}")
        return 1

    state = {
        "pid": process.pid, "token": process_start_token(process.pid), "port": port,
        "url": f"http://localhost:{port}", "command": cmd,
        "started_at": datetime.now().isoformat(timespec="seconds"),
    }
    save_state(state)

    listening = wait_until_ready(process, port, timeout)
    if listening is None and process.poll() is not None:
        print(f"❌ Dev server exited with code {process.returncode} before listening.")
        print(read_log_tail())
        clear_state()
        return 1
    if listening is None:
        print(f"❌ Dev server (PID {process.pid}) is not listening after {timeout}s.")
        print(f"   It may still be starting. Check: {LOG_FILE} or run 'status'.")
        return 1

    state.update(port=listening, url=f"http://localhost:{listening}")
    save_state(state)
    print(f"✅ Preview started! (PID: {process.pid})")
    print(f"   Logs: {LOG_FILE}")
    print(f"   URL: {state['url']}")
    return 0


def stop_server() -> int:
    state, _ = load_state()
    if not state:
        warn_legacy_pid_file()
        print("ℹ️  No preview server found.")
        return 0
    pid = state["pid"]
    if not is_same_process(pid, state.get("token")):
        print(f"ℹ️  Preview (PID {pid}) was not running. Cleared stale state.")
        clear_state()
        return 0
    if kill_process_tree(pid):
        clear_state()
        print(f"🛑 Preview stopped (PID: {pid})")
        return 0
    print(f"❌ Could not stop preview (PID: {pid}). State kept in {STATE_FILE}.")
    return 1


def status_server(strict: bool) -> int:
    state, active_log = load_state()
    running = bool(state) and is_same_process(state["pid"], state.get("token"))
    listening = running and is_port_open(int(state.get("port", DEFAULT_PORT)))

    print("\n=== Preview Status ===")
    if running and state:
        print("✅ Status: Running" if listening else "⏳ Status: Running (port not answering yet)")
        print(f"🔢 PID: {state['pid']}")
        print(f"🌐 URL: {state.get('url')}")
        print(f"📝 Logs: {active_log}")
    else:
        print("⚪ Status: Stopped")
    print("======================\n")
    if strict:
        return 0 if listening else 1
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Manage the local preview dev server")
    parser.add_argument("action", choices=["start", "stop", "restart", "status", "check"])
    parser.add_argument("port", nargs="?", type=int, default=None, help=f"Port (default {DEFAULT_PORT})")
    parser.add_argument("--timeout", type=int, default=DEFAULT_START_TIMEOUT_SECONDS,
                        help="Seconds to wait for the server to listen")
    return parser.parse_args()


def main() -> None:
    force_utf8_output()
    args = parse_args()
    if args.action == "start":
        code = start_server(args.port or DEFAULT_PORT, args.timeout)
    elif args.action == "stop":
        code = stop_server()
    elif args.action == "restart":
        previous, _ = load_state()
        prev_port = previous.get("port") if previous else None
        code = stop_server()
        if code == 0:
            code = start_server(args.port or prev_port or DEFAULT_PORT, args.timeout)
    else:
        code = status_server(strict=args.action == "check")
    sys.exit(code)


if __name__ == "__main__":
    main()
