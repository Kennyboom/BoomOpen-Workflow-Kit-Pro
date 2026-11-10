#!/usr/bin/env python3
"""
Start one or more servers, wait for them to be ready, run a command, then clean up.

Usage (python3 on macOS/Linux, py on Windows also work):
    # Single server
    python with_server.py --server "npm run dev" --port 5173 -- python automation.py
    python with_server.py --server "npm start" --port 3000 -- python test.py

    # Multiple servers
    python with_server.py \\
      --server "cd backend && python server.py" --port 3000 \\
      --server "cd frontend && npm run dev" --port 5173 \\
      -- python test.py

Behaviour:
- Fails fast if a port is already in use (otherwise tests would silently run
  against a stale server).
- Server output goes to a temporary log file (never to an unread pipe, which
  blocks chatty servers); the log tail is printed if a server fails to start.
- On exit the WHOLE process tree of each server is stopped (the shell and the
  real server it spawned), on Windows and POSIX.
"""

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import tempfile
import time
from typing import List, Optional

IS_WINDOWS = sys.platform == "win32"
EXIT_USAGE = 2
POLL_INTERVAL_SECONDS = 0.5
STOP_GRACE_SECONDS = 5
LOG_TAIL_LINES = 20


def is_port_open(port: int) -> bool:
    for host in ("127.0.0.1", "localhost"):
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            continue
    return False


def is_server_ready(port: int, process: subprocess.Popen, timeout: int = 30) -> bool:
    """Wait for the port to accept connections; give up early if the server exits."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if is_port_open(port):
            return True
        if process.poll() is not None:
            return False
        time.sleep(POLL_INTERVAL_SECONDS)
    return False


def start_server(cmd: str, log_file) -> subprocess.Popen:
    """Start a shell command (supports `cd x && ...`) in its own process group."""
    options = {}
    if IS_WINDOWS:
        options["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        options["start_new_session"] = True
    return subprocess.Popen(
        cmd, shell=True, stdin=subprocess.DEVNULL,
        stdout=log_file, stderr=subprocess.STDOUT, **options,
    )


def stop_server_tree(process: subprocess.Popen) -> None:
    """Stop the shell AND every process it started.

    The Popen object keeps a handle to the shell, so its PID cannot be reused
    by another program while we still hold it.
    """
    if IS_WINDOWS:
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(process.pid)],
                       capture_output=True, text=True)
    else:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            return
    try:
        process.wait(timeout=STOP_GRACE_SECONDS)
    except subprocess.TimeoutExpired:
        if not IS_WINDOWS:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        process.kill()
        process.wait()


def resolve_command(command: List[str]) -> List[str]:
    """Resolve the client executable (npm -> npm.cmd on Windows, where
    CreateProcess does not apply PATHEXT to a bare name)."""
    resolved = shutil.which(command[0])
    return [resolved] + command[1:] if resolved else command


def print_log_tail(path: str) -> None:
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as handle:
            lines = handle.read().splitlines()
    except OSError:
        return
    if lines:
        print(f"--- last {min(len(lines), LOG_TAIL_LINES)} lines of {path} ---")
        print("\n".join(lines[-LOG_TAIL_LINES:]))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Run command with one or more servers')
    parser.add_argument('--server', action='append', dest='servers', required=True,
                        help='Server command (can be repeated)')
    parser.add_argument('--port', action='append', dest='ports', type=int, required=True,
                        help='Port for each server (must match --server count)')
    parser.add_argument('--timeout', type=int, default=30, help='Timeout in seconds per server (default: 30)')
    parser.add_argument('--keep-logs', action='store_true', help='Keep server log files (they are always kept when a server fails to start)')
    parser.add_argument('command', nargs=argparse.REMAINDER, help='Command to run after server(s) ready')
    args = parser.parse_args()

    if args.command and args.command[0] == '--':
        args.command = args.command[1:]
    if not args.command:
        parser.print_usage(sys.stderr)
        print("Error: No command specified to run", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    if len(args.servers) != len(args.ports):
        print("Error: Number of --server and --port arguments must match", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def configure_output() -> None:
    """UTF-8 output (Windows pipes default to cp1252) and line buffering, so
    our progress lines stay in order with the output of the child processes."""
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        except (AttributeError, ValueError):
            pass


def main() -> None:
    configure_output()
    args = parse_args()
    busy = [port for port in args.ports if is_port_open(port)]
    if busy:
        print(f"Error: port(s) already in use: {', '.join(map(str, busy))}. "
              "Stop the existing server first so tests do not run against it.", file=sys.stderr)
        sys.exit(1)

    servers: List[subprocess.Popen] = []
    log_paths: List[str] = []
    exit_code: Optional[int] = None
    server_failed = False  # keep logs only when they explain a startup failure
    try:
        for index, (cmd, port) in enumerate(zip(args.servers, args.ports), start=1):
            print(f"Starting server {index}/{len(args.servers)}: {cmd}")
            fd, log_path = tempfile.mkstemp(prefix=f"with_server_{port}_", suffix=".log")
            log_paths.append(log_path)
            with os.fdopen(fd, "w", encoding="utf-8") as log_file:
                servers.append(start_server(cmd, log_file))

            print(f"Waiting for server on port {port}...")
            if not is_server_ready(port, servers[-1], timeout=args.timeout):
                print_log_tail(log_path)
                raise RuntimeError(f"Server failed to start on port {port} within {args.timeout}s "
                                   f"(log kept at {log_path})")
            print(f"Server ready on port {port}")

        print(f"\nAll {len(servers)} server(s) ready")
        print(f"Running: {' '.join(args.command)}\n")
        exit_code = subprocess.run(resolve_command(args.command)).returncode
    except RuntimeError as exc:
        server_failed = True
        print(f"Error: {exc}", file=sys.stderr)
    except OSError as exc:  # client command not found or not executable
        print(f"Error: could not run {args.command[0]}: {exc}", file=sys.stderr)
    finally:
        print(f"\nStopping {len(servers)} server(s)...")
        for index, process in enumerate(servers, start=1):
            stop_server_tree(process)
            print(f"Server {index} stopped")
        print("All servers stopped")
        if not server_failed and not args.keep_logs:
            for path in log_paths:
                try:
                    os.remove(path)
                except OSError:
                    pass
    sys.exit(exit_code if exit_code is not None else 1)


if __name__ == '__main__':
    main()
