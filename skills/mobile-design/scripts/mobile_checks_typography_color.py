#!/usr/bin/env python3
"""
Mobile audit checks: typography and color (basic and extended sections).

Part of mobile_audit.py (one group of check sections per module; run via mobile_audit.py).
"""

import re

from mobile_audit_context import MobileFileContext

MAX_LINE_HEIGHT_RATIO = 1.8
MAX_PLAUSIBLE_RATIO = 4.0


def check_typography(ctx: MobileFileContext) -> None:
    """Section 4: mobile typography."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 4. MOBILE TYPOGRAPHY CHECKS ---

    # 4.1 System Font Check
    if is_react_native:
        has_custom_font = bool(re.search(r"fontFamily:\s*[\"'][^\"']+", content))
        has_system_font = bool(re.search(r"fontFamily:\s*[\"']?(?:System|San Francisco|Roboto|-apple-system)", content))
        if has_custom_font and not has_system_font:
            ctx.warnings.append(f"[Typography] {filename}: Custom font detected. Consider system fonts (iOS: SF Pro, Android: Roboto) for native feel.")

    # 4.2 Text Scaling Check (iOS Dynamic Type)
    if is_react_native:
        has_font_sizes = bool(re.search(r'fontSize:', content))
        has_scaling = bool(re.search(r'allowFontScaling:\s*true|responsiveFontSize|useWindowDimensions', content))
        if has_font_sizes and not has_scaling:
            ctx.warnings.append(f"[Typography] {filename}: Fixed font sizes without scaling support. Consider allowFontScaling for accessibility.")

    # 4.3 Mobile Line Height Check
    # React Native lineHeight is in points (e.g. 24); only small values are
    # unitless ratios that can be compared with the 1.3-1.5 guideline.
    line_heights = re.findall(r'lineHeight:\s*(\d*\.?\d+)', content)
    for lh in line_heights:
        if MAX_LINE_HEIGHT_RATIO < float(lh) <= MAX_PLAUSIBLE_RATIO:
            ctx.warnings.append(f"[Typography] {filename}: lineHeight {lh} too high for mobile. Mobile text needs tighter spacing (1.3-1.5).")

    # 4.4 Font Size Limits
    font_sizes = re.findall(r'fontSize:\s*(\d*\.?\d+)', content)
    for fs in font_sizes:
        size = float(fs)
        if size < 12:
            ctx.warnings.append(f"[Typography] {filename}: fontSize {size}px below 12px minimum readability.")
        elif size > 32:
            ctx.warnings.append(f"[Typography] {filename}: fontSize {size}px very large. Consider using responsive scaling.")


def check_color(ctx: MobileFileContext) -> None:
    """Section 5: mobile color system."""
    content = ctx.content
    filename = ctx.filename

    # --- 5. MOBILE COLOR SYSTEM CHECKS ---

    # 5.1 Pure Black Avoidance
    if re.search(r'#000000|color:\s*black|backgroundColor:\s*["\']?black', content):
        ctx.warnings.append(f"[Color] {filename}: Pure black (#000000) detected. Use dark gray (#1C1C1E iOS, #121212 Android) for better OLED/battery.")

    # 5.2 Dark Mode Support
    has_color_schemes = bool(re.search(r'useColorScheme|colorScheme|appearance:\s*["\']?dark', content))
    has_dark_mode_style = bool(re.search(r'\\\?.*dark|style:\s*.*dark|isDark', content))
    if not has_color_schemes and not has_dark_mode_style:
        ctx.warnings.append(f"[Color] {filename}: No dark mode support detected. Consider useColorScheme for system dark mode.")


def check_typography_extended(ctx: MobileFileContext) -> None:
    """Section 9: extended mobile typography."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 9. EXTENDED MOBILE TYPOGRAPHY CHECKS ---

    # 9.1 iOS Type Scale Check
    if is_react_native:
        # Check for iOS text styles that match HIG
        has_large_title = bool(re.search(r'fontSize:\s*34|largeTitle|font-weight:\s*["\']?bold', content))
        has_title_1 = bool(re.search(r'fontSize:\s*28', content))
        has_headline = bool(re.search(r'fontSize:\s*17.*semibold|headline', content))
        has_body = bool(re.search(r'fontSize:\s*17.*regular|body', content))

        # Check if following iOS scale roughly
        font_sizes = re.findall(r'fontSize:\s*(\d*\.?\d+)', content)
        ios_scale_sizes = [34, 28, 22, 20, 17, 16, 15, 13, 12, 11]
        matching_ios = sum(1 for size in font_sizes if any(abs(float(size) - ios_size) < 1 for ios_size in ios_scale_sizes))

        if len(font_sizes) > 3 and matching_ios < len(font_sizes) / 2:
            ctx.warnings.append(f"[iOS Typography] {filename}: Font sizes don't match iOS type scale. Consider iOS text styles for native feel.")

    # 9.2 Android Material Type Scale Check
    if is_react_native:
        # Check for Material 3 text styles
        has_display = bool(re.search(r'fontSize:\s*[456][0-9]|display', content))
        has_headline_material = bool(re.search(r'fontSize:\s*[23][0-9]|headline', content))
        has_title_material = bool(re.search(r'fontSize:\s*2[12][0-9].*medium|title', content))
        has_body_material = bool(re.search(r'fontSize:\s*1[456].*regular|body', content))
        has_label = bool(re.search(r'fontSize:\s*1[1234].*medium|label', content))

        # Check if using sp (scale-independent pixels)
        uses_sp = bool(re.search(r'\d+\s*sp\b', content))
        if has_display or has_headline_material:
            if not uses_sp:
                ctx.warnings.append(f"[Android Typography] {filename}: Material typography detected without sp units. Use sp for text to respect user font size preferences.")

    # 9.3 Modular Scale Check
    # Check if font sizes follow modular scale
    font_sizes = re.findall(r'fontSize:\s*(\d+(?:\.\d+)?)', content)
    if len(font_sizes) > 3:
        sorted_sizes = sorted(set([float(s) for s in font_sizes]))
        ratios = []
        for i in range(1, len(sorted_sizes)):
            if sorted_sizes[i-1] > 0:
                ratios.append(sorted_sizes[i] / sorted_sizes[i-1])

        # Common ratios: 1.125, 1.2, 1.25, 1.333, 1.5
        common_ratios = {1.125, 1.2, 1.25, 1.333, 1.5}
        for ratio in ratios[:3]:
            if not any(abs(ratio - cr) < 0.03 for cr in common_ratios):
                ctx.warnings.append(f"[Typography] {filename}: Font sizes may not follow modular scale (ratio: {ratio:.2f}). Consider consistent ratio.")
                break

    # 9.4 Line Length Check (Mobile-specific)
    # Mobile text should be 40-60 characters max
    if is_react_native:
        has_long_text = bool(re.search(r'<Text[^>]*>[^<]{40,}', content))
        has_max_width = bool(re.search(r'maxWidth|max-w-\d+|width:\s*["\']?\d+', content))
        if has_long_text and not has_max_width:
            ctx.warnings.append(f"[Mobile Typography] {filename}: Text without max-width constraint. Mobile text should be 40-60 characters per line for readability.")

    # 9.5 Font Weight Pattern Check
    # Check for font weight distribution
    if is_react_native:
        font_weights = re.findall(r'fontWeight:\s*["\']?(\d+|normal|bold|medium|light)', content)
        weight_map = {'normal': '400', 'light': '300', 'medium': '500', 'bold': '700'}
        numeric_weights = []
        for w in font_weights:
            val = weight_map.get(w.lower(), w)
            try:
                numeric_weights.append(int(val))
            except ValueError:
                pass

        # Check if overusing bold (mobile should be regular-dominant)
        bold_count = sum(1 for w in numeric_weights if w >= 700)
        regular_count = sum(1 for w in numeric_weights if 400 <= w < 500)
        if bold_count > regular_count:
            ctx.warnings.append(f"[Mobile Typography] {filename}: More bold weights than regular. Mobile typography should be regular-dominant for readability.")


def check_color_extended(ctx: MobileFileContext) -> None:
    """Section 10: extended mobile color system."""
    content = ctx.content
    filename = ctx.filename

    # --- 10. EXTENDED MOBILE COLOR SYSTEM CHECKS ---

    # 10.1 OLED Optimization Check
    # Check for near-black colors instead of pure black
    if re.search(r'#121212|#1A1A1A|#0D0D0D', content):
        ctx.passed_count += 1  # Good OLED optimization
    elif re.search(r'backgroundColor:\s*["\']?#000000', content):
        # Using pure black for background is OK for OLED
        pass
    elif re.search(r'backgroundColor:\s*["\']?#[0-9A-Fa-f]{6}', content):
        # Check if using light colors in dark mode (bad for OLED)
        ctx.warnings.append(f"[Mobile Color] {filename}: Consider OLED-optimized dark backgrounds (#121212 Android, #000000 iOS) for battery savings.")

    # 10.2 Saturated Color Detection (Battery)
    # Highly saturated colors consume more power on OLED
    hex_colors = re.findall(r'#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})', content)
    saturated_count = 0
    for r, g, b in hex_colors:
        # Convert to RGB 0-255
        try:
            r_val, g_val, b_val = int(r, 16), int(g, 16), int(b, 16)
            max_val = max(r_val, g_val, b_val)
            min_val = min(r_val, g_val, b_val)
            # Saturation = (max - min) / max
            if max_val > 0:
                saturation = (max_val - min_val) / max_val
                if saturation > 0.8:  # Highly saturated
                    saturated_count += 1
        except ValueError:
            pass

    if saturated_count > 10:
        ctx.warnings.append(f"[Mobile Color] {filename}: {saturated_count} highly saturated colors detected. Desaturated colors save battery on OLED screens.")

    # 10.3 Outdoor Visibility Check
    # Low contrast combinations fail in outdoor sunlight
    light_colors = re.findall(r'#[0-9A-Fa-f]{6}|rgba?\([^)]+\)', content)
    # Check for potential low contrast (light gray on white, dark gray on black)
    potential_low_contrast = bool(re.search(r'#[EeEeEeEe].*#ffffff|#999999.*#ffffff|#333333.*#000000|#666666.*#000000', content))
    if potential_low_contrast:
        ctx.warnings.append(f"[Mobile Color] {filename}: Possible low contrast combination detected. Critical for outdoor visibility. Ensure WCAG AAA (7:1) for mobile.")

    # 10.4 Dark Mode Text Color Check
    # In dark mode, text should not be pure white
    has_dark_mode = bool(re.search(r'dark:\s*|isDark|useColorScheme|colorScheme:\s*["\']?dark', content))
    if has_dark_mode:
        has_pure_white_text = bool(re.search(r'color:\s*["\']?#ffffff|#fff["\']?\}|textColor:\s*["\']?white', content))
        if has_pure_white_text:
            ctx.warnings.append(f"[Mobile Color] {filename}: Pure white text (#FFFFFF) in dark mode. Use #E8E8E8 or light gray for better readability.")
