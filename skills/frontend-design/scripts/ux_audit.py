#!/usr/bin/env python3
"""
UX Audit Script - Full Frontend Design Coverage

Analyzes code for compliance with:

1. CORE PSYCHOLOGY LAWS:
   - Hick's Law (nav items, form complexity)
   - Fitts' Law (target sizes, touch targets)
   - Miller's Law (chunking, memory limits)
   - Von Restorff Effect (primary CTA visibility)
   - Serial Position Effect (important items at start/end)

2. EMOTIONAL DESIGN (Don Norman):
   - Visceral (first impressions, gradients, animations)
   - Behavioral (feedback, usability, performance)
   - Reflective (brand story, values, identity)

3. TRUST BUILDING:
   - Security signals (SSL, encryption on forms)
   - Social proof (testimonials, reviews, logos)
   - Authority indicators (certifications, awards, media)

4. COGNITIVE LOAD MANAGEMENT:
   - Progressive disclosure (accordion, tabs, "Advanced")
   - Visual noise (too many colors/borders)
   - Familiar patterns (labels, standard conventions)

5. PERSUASIVE DESIGN (Ethical):
   - Smart defaults (pre-selected options)
   - Anchoring (original vs discount price)
   - Social proof (live indicators, numbers)
   - Progress indicators (progress bars, steps)

6. TYPOGRAPHY SYSTEM (9 sections):
   - Font Pairing (max 3 families)
   - Line Length (45-75ch)
   - Line Height (proper ratios)
   - Letter Spacing (uppercase, display text)
   - Weight and Emphasis (contrast levels)
   - Responsive Typography (clamp())
   - Hierarchy (sequential headings)
   - Modular Scale (consistent ratios)
   - Readability (chunking, subheadings)

7. VISUAL EFFECTS (10 sections):
   - Glassmorphism (blur + transparency)
   - Neomorphism (dual shadows, inset)
   - Shadow Hierarchy (elevation levels)
   - Gradients (usage, overuse)
   - Border Effects (complexity check)
   - Glow Effects (text-shadow, box-shadow)
   - Overlay Techniques (image text readability)
   - GPU Acceleration (transform/opacity vs layout)
   - Performance (will-change usage)
   - Effect Selection (purpose over decoration)

8. COLOR SYSTEM (7 sections):
   - Purple ban (color-system.md - purple/violet/fuchsia values and classes; warning)
   - 60-30-10 Rule (dominant, secondary, accent)
   - Color Scheme Patterns (monochromatic, analogous)
   - Dark Mode Compliance (no pure black/white)
   - WCAG Contrast (low-contrast detection)
   - Color Psychology Context (food + blue = bad)
   - HSL-Based Palettes (recommended approach)

9. ANIMATION GUIDE (6 sections):
   - Duration Appropriateness (50ms minimum, 1s max transitions)
   - Easing Functions (ease-out for entry, ease-in for exit)
   - Micro-interactions (hover/focus feedback)
   - Loading States (skeleton, spinner, progress)
   - Page Transitions (fade/slide for routing)
   - Scroll Animation Performance (no layout properties)

10. MOTION GRAPHICS (7 sections):
   - Lottie Animations (reduced motion fallbacks)
   - GSAP Memory Leaks (kill/revert on unmount)
   - SVG Animation Performance (stroke-dashoffset sparingly)
   - 3D Transforms (perspective parent, mobile warning)
   - Particle Effects (mobile fallback)
   - Scroll-Driven Animations (throttle with rAF)
   - Motion Decision Tree (functional vs decorative)

11. ACCESSIBILITY:
   - Alt text for images
   - Reduced motion checks
   - Form labels

Total: 80+ checks across all design principles

Usage (python3 on macOS/Linux, py on Windows also work):
    python ux_audit.py <project_path_or_file> [--json]

Exit codes: 0 = no blocking issues (or "[SKIP]" printed: no UI files found),
1 = blocking issues found, 2 = invalid arguments.

Implementation: the check sections live in ux_checks_*.py next to this file.
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

from ux_audit_context import UXFileContext  # noqa: E402
from ux_checks_color import check_accessibility, check_color  # noqa: E402
from ux_checks_motion import check_animation, check_motion_graphics  # noqa: E402
from ux_checks_psychology import check_psychology  # noqa: E402
from ux_checks_typography import check_typography  # noqa: E402
from ux_checks_visual import check_visual_effects  # noqa: E402

# Fix Windows console encoding (stdout is a cp1252 pipe when agents run this)
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

EXIT_USAGE = 2
AUDITED_EXTENSIONS = {'.tsx', '.jsx', '.html', '.vue', '.svelte', '.css'}
SKIPPED_DIRS = {
    'node_modules', '.git', 'dist', 'build', '.next', 'coverage',
    'playwright-report', '.boomopen', '.agent', '__pycache__',
    '.svelte-kit', '.astro', 'out', 'target', '.venv', 'venv',
}
MAX_PRINTED_ISSUES = 10
MAX_PRINTED_WARNINGS = 15

# Order matters: findings are reported in the same order as the original audit.
CHECKS = (
    check_psychology,
    check_typography,
    check_visual_effects,
    check_color,
    check_animation,
    check_motion_graphics,
    check_accessibility,
)


class UXAuditor:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.passed_count = 0
        self.files_checked = 0

    def audit_file(self, filepath: str) -> None:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except OSError:
            return

        self.files_checked += 1
        ctx = UXFileContext.from_content(content, os.path.basename(filepath))
        for check in CHECKS:
            try:
                check(ctx)
            except Exception as exc:  # one odd file must not abort the whole audit
                ctx.warnings.append(f"[Audit Error] {ctx.filename}: {check.__name__} skipped ({exc})")
        self.issues.extend(ctx.issues)
        self.warnings.extend(ctx.warnings)
        self.passed_count += ctx.passed_count

    def audit_directory(self, directory: str) -> None:
        target_parts = set(Path(directory).resolve().parts)
        extra_skip = {'skills_library', 'templates', 'examples', 'fixtures'} - target_parts
        skip_dirs = SKIPPED_DIRS | extra_skip
        for root, dirs, files in os.walk(directory):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for file in files:
                if Path(file).suffix in AUDITED_EXTENSIONS:
                    self.audit_file(os.path.join(root, file))

    def get_report(self):
        return {
            "files_checked": self.files_checked,
            "skipped": self.files_checked == 0,
            "issues": self.issues,
            "warnings": self.warnings,
            "passed_checks": self.passed_count,
            "compliant": len(self.issues) == 0
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit UI code for UX psychology, typography, color and motion rules")
    parser.add_argument("path", help="Project directory or single file to audit")
    parser.add_argument("--json", action="store_true", help="Print the report as JSON")
    args = parser.parse_args()
    if not os.path.exists(args.path):
        parser.print_usage(sys.stderr)
        print(f"Error: path does not exist: {args.path}", file=sys.stderr)
        sys.exit(EXIT_USAGE)
    return args


def print_text_report(report: dict) -> None:
    # Use ASCII-safe output for Windows console compatibility
    if report['files_checked'] == 0:
        print("[SKIP] No UI files (.tsx/.jsx/.html/.vue/.svelte/.css) found - nothing to audit.")
        return
    print(f"\n[UX AUDIT] {report['files_checked']} files checked")
    print("-" * 50)
    if report['issues']:
        print(f"[!] ISSUES ({len(report['issues'])}):")
        for i in report['issues'][:MAX_PRINTED_ISSUES]:
            print(f"  - {i}")
    if report['warnings']:
        print(f"[*] WARNINGS ({len(report['warnings'])}):")
        for w in report['warnings'][:MAX_PRINTED_WARNINGS]:
            print(f"  - {w}")
    print(f"[+] PASSED CHECKS: {report['passed_checks']}")
    status = "PASS" if report['compliant'] else "FAIL"
    print(f"STATUS: {status}")


def main():
    args = parse_args()

    auditor = UXAuditor()
    if os.path.isfile(args.path):
        auditor.audit_file(args.path)
    else:
        auditor.audit_directory(args.path)

    report = auditor.get_report()

    if args.json:
        print(json.dumps(report))
    else:
        print_text_report(report)

    sys.exit(0 if report['compliant'] else 1)


if __name__ == "__main__":
    main()
