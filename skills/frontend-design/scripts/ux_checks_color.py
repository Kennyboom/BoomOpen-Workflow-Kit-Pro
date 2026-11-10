#!/usr/bin/env python3
"""
UX audit checks: color system and image accessibility.

Part of ux_audit.py (one check section per module; run via ux_audit.py).
"""

import re
from typing import Optional

from ux_audit_context import UXFileContext

PURPLE_HEX_RE = re.compile(
    r'#(?:8b5cf6|a855f7|9333ea|7c3aed|6d28d9|6366f1|4f46e5|a78bfa|c4b5fd|ddd6fe|ede9fe)\b', re.IGNORECASE
)
PURPLE_UTILITY_RE = re.compile(
    r'\b(?:bg|text|from|via|to|border|ring|fill|stroke|outline|decoration|shadow|accent|caret|divide)'
    r'-(?:purple|violet|fuchsia)-\d{2,3}\b'
)
PURPLE_CSS_RE = re.compile(
    r'\b(?:color|background(?:-color)?|fill|stroke|border(?:-color)?)\s*:\s*'
    r'(?:purple|violet|fuchsia|magenta|lavender|darkviolet|blueviolet|mediumpurple)\b',
    re.IGNORECASE,
)


def find_purple_color(content: str) -> Optional[str]:
    """Return the first purple color value/class found, or None."""
    for pattern in (PURPLE_HEX_RE, PURPLE_UTILITY_RE, PURPLE_CSS_RE):
        found = pattern.search(content)
        if found:
            return found.group(0)
    return None


def check_color(ctx: UXFileContext) -> None:
    """Section 4: color system."""
    content = ctx.content
    filename = ctx.filename

    # --- 4. COLOR SYSTEM (color-system.md) ---

    # 4.1 Purple ban (color-system.md). Only real color values count: hex
    # codes, Tailwind color utilities and CSS color declarations. Words in
    # copy or identifiers ("Lavender soap", "Ultraviolet") are not colors.
    match = find_purple_color(content)
    if match:
        ctx.warnings.append(
            f"[Color] {filename}: Purple color used ('{match}'). The frontend-design "
            "color-system.md avoids purple; consider Teal/Cyan/Emerald instead."
        )

    # 4.1b Anti-Slop neon purple-cyan pair ban (#8b5cf6 + #06b6d4)
    if re.search(r'#8b5cf6\b', content, re.IGNORECASE) and re.search(r'#06b6d4\b', content, re.IGNORECASE):
        ctx.warnings.append(
            f"[Anti-Slop] {filename}: Banned neon purple-cyan gradient pair (#8b5cf6 + #06b6d4) detected. "
            "Use a single high-conviction OKLCH accent instead."
        )

    # 4.2 60-30-10 Rule check
    # Count color usage to estimate ratio
    color_hex_count = len(re.findall(r'#[0-9a-fA-F]{3,6}', content))
    hsl_count = len(re.findall(r'hsl\(', content))
    oklch_count = len(re.findall(r'oklch\(', content, re.IGNORECASE))
    total_colors = color_hex_count + hsl_count + oklch_count
    if total_colors > 3:
        # Check for dominant colors (should be ~60%)
        bg_declarations = re.findall(r'(?:background|bg-|bg\[)([^;}\s]+)', content)
        text_declarations = re.findall(r'(?:color|text-)([^;}\s]+)', content)
        if len(bg_declarations) > 0 and len(text_declarations) > 0:
            # Just warn if too many distinct colors
            unique_hexes = set(re.findall(r'#[0-9a-fA-F]{6}', content))
            if len(unique_hexes) > 5:
                ctx.warnings.append(f"[Color] {filename}: {len(unique_hexes)} distinct colors. Consider 60-30-10 rule: dominant (60%), secondary (30%), accent (10%).")

    # 4.3 Color Scheme Pattern Detection
    # Detect monochromatic (same hue, different lightness)
    hsl_matches = re.findall(r'hsl\((\d+),\s*\d+%,\s*\d+%\)', content)
    if len(hsl_matches) >= 3:
        hues = [int(h) for h in hsl_matches]
        hue_range = max(hues) - min(hues)
        if hue_range < 10:
            ctx.warnings.append(f"[Color] {filename}: Monochromatic palette detected (hue variance: {hue_range}deg). Ensure adequate contrast.")

    # 4.4 Dark Mode Compliance
    # Check for pure black (#000000) or pure white (#FFFFFF) text (forbidden)
    if re.search(r'color:\s*#000000|#000\b', content):
        ctx.warnings.append(f"[Color] {filename}: Pure black (#000000) detected. Use #1a1a1a or darker grays for better dark mode.")
    if re.search(r'background:\s*#ffffff|#fff\b', content) and re.search(r'dark:\s*|dark:', content):
        ctx.warnings.append(f"[Color] {filename}: Pure white background in dark mode context. Use slight off-white (#f9fafb) for reduced eye strain.")

    # 4.5 WCAG Contrast Pattern Check
    # Look for potential low-contrast combinations
    light_bg_light_text = bool(re.search(r'bg-(?:gray|slate|zinc)-50|bg-white.*text-(?:gray|slate)-[12]', content))
    dark_bg_dark_text = bool(re.search(r'bg-(?:gray|slate|zinct)-9|bg-black.*text-(?:gray|slate)-[89]', content))
    if light_bg_light_text or dark_bg_dark_text:
        ctx.warnings.append(f"[Color] {filename}: Possible low-contrast combination detected. Verify WCAG AA (4.5:1 for text).")

    # 4.6 Color Psychology Context Check
    # Warn if blue used for food/restaurant context
    has_blue = bool(re.search(r'bg-blue|text-blue|from-blue|#[0-9a-fA-F]*00[0-9A-Fa-f]{2}|#[0-9a-fA-F]*1[0-9A-Fa-f]{2}', content))
    has_food_context = bool(re.search(r'restaurant|food|cooking|recipe|menu|dish|meal', content, re.IGNORECASE))
    if has_blue and has_food_context:
        ctx.warnings.append(f"[Color] {filename}: Blue color in food context. Blue suppresses appetite; consider warm colors (red, orange, yellow).")

    # 4.7 Perceptual / Modern Color System Detection (OKLCH, LCH, LAB, color-mix, @theme, or HSL)
    has_color_vars = bool(re.search(r'--color-|color-|primary-|secondary-', content))
    has_modern_color_fn = bool(
        re.search(r'(?:oklch|lch|lab|color-mix|hsl)\(|@theme\b', content, re.IGNORECASE)
    )
    if has_modern_color_fn:
        ctx.passed_count += 1
    elif has_color_vars and re.search(r'--color-[a-z0-9-]+\s*:\s*#[0-9a-fA-F]{3,8}', content):
        ctx.warnings.append(
            f"[Color] {filename}: CSS color variables use raw hex without perceptual tokens. "
            "Consider oklch() or @theme tokens for uniform perceived lightness."
        )


def check_accessibility(ctx: UXFileContext) -> None:
    """Section 7: accessibility (image alt text)."""
    content = ctx.content
    filename = ctx.filename

    # --- 7. ACCESSIBILITY ---
    if re.search(r'<img(?![^>]*alt=)[^>]*>', content):
        ctx.issues.append(f"[Accessibility] {filename}: Missing img alt text")
