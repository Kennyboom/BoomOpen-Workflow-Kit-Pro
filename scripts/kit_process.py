#!/usr/bin/env python3
"""
Cross-platform process helpers for auto_preview.py.

Why not os.kill(pid, 0)? On Windows signal 0 is CTRL_C_EVENT, not an
existence check: it can interrupt or terminate the target process. Liveness
on Windows is therefore checked with OpenProcess + GetExitCodeProcess.

Every process is identified by (pid, start token). The start token is the
process creation time, so a PID that Windows or POSIX reused for an unrelated
process is never reported as ours and is never killed.
"""

import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

IS_WINDOWS = sys.platform == "win32"
POSIX_STOP_GRACE_SECONDS = 5.0
POLL_INTERVAL_SECONDS = 0.25
LOCALHOST = "127.0.0.1"


def _windows_start_token(pid: int) -> Optional[str]:
    import ctypes
    from ctypes import wintypes

    process_query_limited_information = 0x1000
    still_active = 259
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel32.OpenProcess.restype = wintypes.HANDLE
    kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    kernel32.GetExitCodeProcess.argtypes = [wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD)]
    kernel32.GetProcessTimes.argtypes = [wintypes.HANDLE] + [ctypes.POINTER(wintypes.FILETIME)] * 4
    kernel32.CloseHandle.argtypes = [wintypes.HANDLE]

    handle = kernel32.OpenProcess(process_query_limited_information, False, pid)
    if not handle:
        return None
    try:
        exit_code = wintypes.DWORD()
        if not kernel32.GetExitCodeProcess(handle, ctypes.byref(exit_code)):
            return None
        if exit_code.value != still_active:
            return None
        times = [wintypes.FILETIME() for _ in range(4)]
        if not kernel32.GetProcessTimes(handle, *(ctypes.byref(t) for t in times)):
            return "alive"
        created = (times[0].dwHighDateTime << 32) | times[0].dwLowDateTime
        return str(created)
    finally:
        kernel32.CloseHandle(handle)


def _posix_start_token(pid: int) -> Optional[str]:
    try:
        os.kill(pid, 0)  # POSIX: signal 0 only checks existence
    except ProcessLookupError:
        return None
    except PermissionError:
        pass  # exists but owned by another user
    stat_file = Path(f"/proc/{pid}/stat")
    try:
        # Field 22 (starttime) follows the ")" that closes the command name.
        fields = stat_file.read_text(encoding="utf-8").rsplit(")", 1)[1].split()
        return fields[19]
    except (OSError, IndexError):
        pass
    try:
        out = subprocess.run(["ps", "-o", "lstart=", "-p", str(pid)],
                             capture_output=True, text=True, timeout=5)
        token = out.stdout.strip()
        return token or None
    except (OSError, subprocess.SubprocessError):
        return "alive"


def process_start_token(pid: int) -> Optional[str]:
    """Return a creation-time token if `pid` is running, otherwise None."""
    if pid <= 0:
        return None
    try:
        return _windows_start_token(pid) if IS_WINDOWS else _posix_start_token(pid)
    except OSError:
        return None


def is_same_process(pid: int, token: Optional[str]) -> bool:
    """True if `pid` is alive and is the process we started (same start token)."""
    current = process_start_token(pid)
    if current is None:
        return False
    if not token or current == "alive" or token == "alive":
        return True
    return current == token


def kill_process_tree(pid: int) -> bool:
    """Terminate `pid` and all of its children. Returns True when it is gone."""
    if IS_WINDOWS:
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(pid)],
                       capture_output=True, text=True, timeout=30)
        return _wait_until_gone(pid, POSIX_STOP_GRACE_SECONDS)
    try:
        os.killpg(pid, signal.SIGTERM)  # started with start_new_session=True
    except ProcessLookupError:
        return True
    except PermissionError:
        return False
    if _wait_until_gone(pid, POSIX_STOP_GRACE_SECONDS):
        return True
    try:
        os.killpg(pid, signal.SIGKILL)
    except ProcessLookupError:
        return True
    return _wait_until_gone(pid, POSIX_STOP_GRACE_SECONDS)


def _wait_until_gone(pid: int, timeout: float) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process_start_token(pid) is None:
            return True
        _reap_child(pid)
        time.sleep(POLL_INTERVAL_SECONDS)
    return process_start_token(pid) is None


def _reap_child(pid: int) -> None:
    """Collect a zombie child on POSIX so it stops looking alive."""
    if IS_WINDOWS:
        return
    try:
        os.waitpid(pid, os.WNOHANG)
    except ChildProcessError:
        pass
    except OSError:
        pass


def is_port_open(port: int, host: str = LOCALHOST, timeout: float = 0.5) -> bool:
    for candidate in (host, "localhost"):
        try:
            with socket.create_connection((candidate, port), timeout=timeout):
                return True
        except OSError:
            continue
    return False
