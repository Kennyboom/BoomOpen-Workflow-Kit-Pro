#!/usr/bin/env python3
"""
UX audit checks: typography system (pairing, line length/height, tracking, weights, scale).

Part of ux_audit.py (one check section per module; run via ux_audit.py).
"""

import re

from ux_audit_context import UXFileContext

LINE_HEIGHT_RATIO_RE = re.compile(r'line-height:\s*(\d+(?:\.\d+)?)(?![\d.]|\s*(?:px|rem|em|pt|vh|ch|ex|%))')
TAILWIND_ARBITRARY_LEADING_RE = re.compile(r'leading-\[(\d+(?:\.\d+)?)\]')


def check_typography(ctx: UXFileContext) -> None:
    """Section 2: typography system."""
    content = ctx.content
    filename = ctx.filename
    has_long_text = ctx.has_long_text

    # --- 2. TYPOGRAPHY SYSTEM (Complete Coverage) ---

    # 2.1 Font Pairing - Too many font families
    font_families = set()
    # Check for @font-face, Google Fonts, font-family declarations
    font_faces = re.findall(r'@font-face\s*\{[^}]*family:\s*["\']?([^;"\'\s}]+)', content, re.IGNORECASE)
    google_fonts = re.findall(r'fonts\.googleapis\.com[^"\']*family=([^"&]+)', content, re.IGNORECASE)
    font_family_css = re.findall(r'font-family:\s*([^;]+)', content, re.IGNORECASE)

    for font in font_faces: font_families.add(font.strip().lower())
    for font in google_fonts:
        for f in font.replace('+', ' ').split('|'):
            font_families.add(f.split(':')[0].strip().lower())
    for family in font_family_css:
        # Extract first font from stack
        first_font = family.split(',')[0].strip().strip('"\'')

        if first_font.lower() not in {'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'inherit', 'arial', 'georgia', 'times new roman', 'courier new', 'verdana', 'helvetica', 'tahoma'}:
            font_families.add(first_font.lower())

    if len(font_families) > 3:
        ctx.issues.append(f"[Typography] {filename}: {len(font_families)} font families detected. Limit to 2-3 for cohesion.")

    # 2.2 Line Length - Character-based width
    if has_long_text and not re.search(r'max-w-(?:prose|[\[\\]?\d+ch[\]\\]?)|max-width:\s*\d+ch', content):
        ctx.warnings.append(f"[Typography] {filename}: No line length constraint (45-75ch). Use max-w-prose or max-w-[65ch].")

    # 2.3 Line Height - Proper leading ratios
    # Check for text without proper line-height
    text_elements = len(re.findall(r'<p|<span|<div.*text|<h[1-6]', content, re.IGNORECASE))
    if text_elements > 0 and not re.search(r'leading-|line-height:', content):
        ctx.warnings.append(f"[Typography] {filename}: Text elements found without line-height. Body: 1.4-1.6, Headings: 1.1-1.3")

    # Check for heading-specific line height issues
    if re.search(r'<h[1-6]|text-(?:xl|2xl|3xl|4xl|5xl|6xl)', content, re.IGNORECASE):
        # Extract unitless line-height ratios. A strict number pattern avoids
        # float('1.5.') crashes on prose like "line-height: 1.5."; values with a
        # unit and Tailwind's numeric leading-N (rem-based spacing) are not ratios.
        line_heights = LINE_HEIGHT_RATIO_RE.findall(content) + TAILWIND_ARBITRARY_LEADING_RE.findall(content)
        for lh in line_heights:
            if float(lh) > 1.5:
                ctx.warnings.append(f"[Typography] {filename}: Heading has line-height {lh} (>1.3). Headings should be tighter (1.1-1.3).")

    # 2.4 Letter Spacing (Tracking)
    # Uppercase without tracking
    if re.search(r'uppercase|text-transform:\s*uppercase', content, re.IGNORECASE):
        if not re.search(r'tracking-|letter-spacing:', content):
            ctx.warnings.append(f"[Typography] {filename}: Uppercase text without tracking. ALL CAPS needs +5-10% spacing.")

    # Large text (display/hero) should have negative tracking
    if re.search(r'text-(?:4xl|5xl|6xl|7xl|8xl|9xl)|font-size:\s*[3-9]\dpx', content):
        if not re.search(r'tracking-tight|letter-spacing:\s*-[0-9]', content):
            ctx.warnings.append(f"[Typography] {filename}: Large display text without tracking-tight. Big text needs -1% to -4% spacing.")

    # 2.5 Weight and Emphasis - Contrast levels
    # Check for adjacent weight levels (poor contrast)
    weights = re.findall(r'font-weight:\s*(\d+)|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|fw-(\d+)', content, re.IGNORECASE)
    weight_values = []
    for w in weights:
        val = w[0] or w[1]
        if val:
            # Map named weights to numbers
            weight_map = {'thin': '100', 'extralight': '200', 'light': '300', 'normal': '400', 'medium': '500', 'semibold': '600', 'bold': '700', 'extrabold': '800', 'black': '900'}
            val = weight_map.get(val.lower(), val)
            try:
                weight_values.append(int(val))
            except ValueError:
                pass

    # Check for adjacent weights (400/500, 500/600, etc.)
    for i in range(len(weight_values) - 1):
        diff = abs(weight_values[i] - weight_values[i+1])
        if diff == 100:
            ctx.warnings.append(f"[Typography] {filename}: Adjacent font weights ({weight_values[i]}/{weight_values[i+1]}). Skip at least 2 levels for contrast.")

    # Too many weight levels
    unique_weights = set(weight_values)
    if len(unique_weights) > 4:
        ctx.warnings.append(f"[Typography] {filename}: {len(unique_weights)} font weights. Limit to 3-4 per page.")

    # 2.6 Responsive Typography - Fluid sizing with clamp()
    has_font_sizes = bool(re.search(r'font-size:|text-(?:xs|sm|base|lg|xl|2xl)', content))
    if has_font_sizes and not re.search(r'clamp\(|responsive:', content):
        ctx.warnings.append(f"[Typography] {filename}: Fixed font sizes without clamp(). Consider fluid typography: clamp(MIN, PREFERRED, MAX)")

    # 2.7 Hierarchy - Heading structure
    headings = re.findall(r'<(h[1-6])', content, re.IGNORECASE)
    if headings:
        # Check for skipped levels (h1 -> h3)
        for i in range(len(headings) - 1):
            curr = int(headings[i][1])
            next_h = int(headings[i+1][1])
            if next_h > curr + 1:
                ctx.warnings.append(f"[Typography] {filename}: Skipped heading level (h{curr} -> h{next_h}). Maintain sequential hierarchy.")

        # Check if h1 exists for main content
        if 'h1' not in [h.lower() for h in headings] and has_long_text:
            ctx.warnings.append(f"[Typography] {filename}: No h1 found. Each page should have one primary heading.")

    # 2.8 Modular Scale - Consistent sizing
    # Extract font-size values
    font_sizes = re.findall(r'font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)', content)
    size_values = []
    for size, unit in font_sizes:
        if unit == 'rem' or unit == 'em':
            size_values.append(float(size))
        elif unit == 'px':
            size_values.append(float(size) / 16)  # Normalize to rem

    if len(size_values) > 2:
        # Check if sizes follow a modular scale roughly
        sorted_sizes = sorted(set(size_values))
        ratios = []
        for i in range(1, len(sorted_sizes)):
            if sorted_sizes[i-1] > 0:
                ratios.append(sorted_sizes[i] / sorted_sizes[i-1])

        # Common scale ratios: 1.067, 1.125, 1.2, 1.25, 1.333, 1.5, 1.618
        common_ratios = {1.067, 1.125, 1.2, 1.25, 1.333, 1.5, 1.618}
        for ratio in ratios[:3]:  # Check first 3 ratios
            if not any(abs(ratio - cr) < 0.05 for cr in common_ratios):
                ctx.warnings.append(f"[Typography] {filename}: Font sizes may not follow modular scale (ratio: {ratio:.2f}). Consider consistent ratio like 1.25 (Major Third).")
                break

    # 2.9 Readability - Content chunking
    # Check for very long paragraphs (>5 lines estimated)
    paragraphs = re.findall(r'<p[^>]*>([^<]+)</p>', content, re.IGNORECASE)
    for p in paragraphs:
        word_count = len(p.split())
        if word_count > 100:  # ~5-6 lines
            ctx.warnings.append(f"[Typography] {filename}: Long paragraph detected ({word_count} words). Break into 3-4 line chunks for readability.")

    # Check for missing subheadings in long content
    if len(paragraphs) > 5:
        subheadings = len(re.findall(r'<h[2-6]', content, re.IGNORECASE))
        if subheadings == 0:
            ctx.warnings.append(f"[Typography] {filename}: Long content without subheadings. Add h2/h3 to break up text.")

    # 2.10 Modern Viewport Units (dvh/svh) & Tabular Numerals (tabular-nums)
    has_modern_viewport = bool(re.search(r'\b(?:100dvh|100svh|min-h-dvh|h-dvh)\b', content))
    has_legacy_vh = bool(re.search(r'\b(?:100vh|min-h-screen|h-screen)\b', content))
    if has_modern_viewport:
        ctx.passed_count += 1
    elif has_legacy_vh:
        ctx.warnings.append(
            f"[Typography] {filename}: 100vh/min-h-screen used without dvh fallback. "
            "Prefer min-h-dvh or 100dvh to avoid mobile browser chrome clipping."
        )

    if re.search(r'tabular-nums|font-variant-numeric\s*:\s*tabular-nums|[\'"]tnum[\'"]', content):
        ctx.passed_count += 1
