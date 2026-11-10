#!/usr/bin/env python3
"""
Mobile UX Audit Script - 2026 Mobile Design & Ergonomics Coverage (v5.5.0)

Analyzes React Native / Expo, Flutter, and Tauri v2 Mobile code for compliance with:

1. TOUCH ERGONOMICS & WCAG 2.2 (touch-psychology.md):
   - Touch Target Sizes (44pt iOS 18 HIG, 48dp Material 3 Expressive, 24px/44px WCAG 2.2)
   - Touch Target Spacing (8px minimum gap)
   - Thumb Zone Placement & Safe-Area Insets
   - Gesture Alternatives (visible buttons alongside swipe gestures)
   - Haptic Feedback & < 50ms Touch Feedback Timing

2. MOBILE PERFORMANCE & 60/120 FPS (mobile-performance.md):
   - ScrollView vs FlashList / FlatList virtualization (CRITICAL)
   - React.memo & useCallback for list items
   - Stable keyExtractor (never array index)
   - Reanimated / useNativeDriver worklets (transform/opacity only)
   - Zero leftover console.log & proper subscription cleanup

3. NAVIGATION, TYPOGRAPHY, OLED COLOR & PLATFORM RULES:
   - Tab Bar Max Items (5), Deep Link & Predictive Back handling
   - Dynamic Type / TextScaler support & mobile line-height
   - OLED dark-surface elevation (avoiding pure #000000 smearing) & contrast
   - iOS 18 SF Symbols / SwiftUI & Android Material 3 Expressive patterns
   - Secure Keychain/Keystore storage (never unencrypted AsyncStorage for tokens)

Usage (python3 on macOS/Linux, py on Windows also work):
    python mobile_audit.py <project_path_or_file> [--json]

Exit codes: 0 = no blocking issues (or "[SKIP]" printed: no React Native or
Flutter files found), 1 = blocking issues found, 2 = invalid arguments.

Implementation: the check sections live in mobile_checks_*.py next to this file.
"""

import argparse
import json
import os
import sys
from pathlib import Path

sys.dont_write_bytecode = True  # keep installed skill folders free of __pycache__
_SCRIPT_DIR = str(Path(__file__).resolve().parent)
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from mobile_audit_context import MobileFileContext  # noqa: E402
from mobile_checks_app import (  # noqa: E402
    check_backend, check_debugging, check_navigation, check_testing,
)
from mobile_checks_platform import check_platform_basics, check_platform_extended  # noqa: E402
from mobile_checks_touch_performance import check_performance, check_touch  # noqa: E402
from mobile_checks_typography_color import (  # noqa: E402
    check_color, check_color_extended, check_typography, check_typography_extended,
)

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
AUDITED_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".dart"}
SKIPPED_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", ".expo", ".dart_tool",
    ".boomopen", ".agent", "coverage", "ios", "android", ".idea", "__pycache__",
}
MAX_PRINTED_ISSUES = 10
MAX_PRINTED_WARNINGS = 15

CHECKS = (
    check_touch,                # 1
    check_performance,          # 2
    check_navigation,           # 3
    check_typography,           # 4
    check_color,                # 5
    check_platform_basics,      # 6-7
    check_backend,              # 8
    check_typography_extended,  # 9
    check_color_extended,       # 10
    check_platform_extended,    # 11-12
    check_testing,              # 13
    check_debugging,            # 14
)


class MobileAuditor:
    def __init__(self) -> None:
        self.issues: list = []
        self.warnings: list = []
        self.passed_count = 0
        self.files_checked = 0

    def audit_file(self, filepath: str) -> None:
        try:
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
        except OSError:
            return

        ctx = MobileFileContext.from_content(content, os.path.basename(filepath))
        if not ctx.is_mobile:
            return

        self.files_checked += 1
        for check in CHECKS:
            try:
                check(ctx)
            except Exception as exc:  # one odd file must not abort the whole audit
                ctx.warnings.append(f"[Audit Error] {ctx.filename}: {check.__name__} skipped ({exc})")
        self.issues.extend(ctx.issues)
        self.warnings.extend(ctx.warnings)
        self.passed_count += ctx.passed_count

    def audit_directory(self, directory: str) -> None:
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in SKIPPED_DIRS]
            for file in files:
                if Path(file).suffix in AUDITED_EXTENSIONS:
                    self.audit_file(os.path.join(root, file))

    def get_report(self) -> dict:
        return {
            "files_checked": self.files_checked,
            "issues": self.issues,
            "warnings": self.warnings,
            "passed_checks": self.passed_count,
            "compliant": len(self.issues) == 0,
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit React Native / Flutter code for mobile UX rules")
    parser.add_argument("path", help="Project directory or single file to audit")
    parser.add_argument("--json", action="store_true", help="Print the report as JSON")
    args = parser.parse_args()
    if not os.path.exists(args.path):
        parser.print_usage(sys.stderr)
        print(f"Error: path does not exist: {args.path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def print_text_report(report: dict) -> None:
    if report["files_checked"] == 0:
        print("[SKIP] No React Native or Flutter files found - nothing to audit.")
        return
    print(f"\n[MOBILE AUDIT] {report['files_checked']} mobile files checked")
    print("-" * 50)
    if report["issues"]:
        print(f"[!] ISSUES ({len(report['issues'])}):")
        for item in report["issues"][:MAX_PRINTED_ISSUES]:
            print(f"  - {item}")
    if report["warnings"]:
        print(f"[*] WARNINGS ({len(report['warnings'])}):")
        for warn in report["warnings"][:MAX_PRINTED_WARNINGS]:
            print(f"  - {warn}")
    print(f"[+] PASSED CHECKS: {report['passed_checks']}")
    status = "PASS" if report["compliant"] else "FAIL"
    print(f"STATUS: {status}")


def main() -> None:
    args = parse_args()
    auditor = MobileAuditor()
    if os.path.isfile(args.path):
        auditor.audit_file(args.path)
    else:
        auditor.audit_directory(args.path)

    report = auditor.get_report()
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print_text_report(report)

    sys.exit(0 if report["compliant"] else 1)


if __name__ == "__main__":
    main()
