#!/usr/bin/env python3
"""
Console helpers shared by the BoomOpen Workflow Kit scripts.

- force_utf8_output(): agents run these scripts with stdout attached to a pipe.
  On Windows a pipe defaults to the ANSI code page (cp1252), so printing an
  emoji raises UnicodeEncodeError before any work is done. Every entry script
  calls this first.
- Colors: ANSI colors only when stdout is a real terminal and NO_COLOR is unset,
  so piped output stays free of escape codes.
"""

import os
import sys


def force_utf8_output() -> None:
    """Make stdout/stderr encode as UTF-8 (replacing anything unencodable)."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is None:
            continue
        try:
            reconfigure(encoding="utf-8", errors="replace")
        except (ValueError, OSError):
            # Stream already closed or detached: nothing useful to do.
            pass


def _color_enabled() -> bool:
    if os.environ.get("NO_COLOR") is not None:
        return False
    isatty = getattr(sys.stdout, "isatty", None)
    try:
        return bool(isatty and isatty())
    except (ValueError, OSError):
        return False


_USE_COLOR = _color_enabled()


def _code(value: str) -> str:
    return value if _USE_COLOR else ""


class Colors:
    """ANSI escape codes (empty strings when color is disabled)."""

    BLUE = _code("\033[94m")
    CYAN = _code("\033[96m")
    GREEN = _code("\033[92m")
    YELLOW = _code("\033[93m")
    RED = _code("\033[91m")
    ENDC = _code("\033[0m")
    BOLD = _code("\033[1m")


def print_header(text: str, width: int = 60) -> None:
    line = "=" * width
    print(f"\n{Colors.BOLD}{Colors.CYAN}{line}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(width)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{line}{Colors.ENDC}\n")


def print_step(text: str) -> None:
    print(f"{Colors.BOLD}{Colors.BLUE}🔄 {text}{Colors.ENDC}")


def print_success(text: str) -> None:
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")


def print_warning(text: str) -> None:
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.ENDC}")


def print_error(text: str) -> None:
    print(f"{Colors.RED}❌ {text}{Colors.ENDC}")
