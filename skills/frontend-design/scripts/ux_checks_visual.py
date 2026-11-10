#!/usr/bin/env python3
"""
UX audit checks: visual effects (glass, neomorphism, shadows, gradients, glow, performance).

Part of ux_audit.py (one check section per module; run via ux_audit.py).
"""

import re

from ux_audit_context import UXFileContext


def check_visual_effects(ctx: UXFileContext) -> None:
    """Section 3: visual effects."""
    content = ctx.content
    filename = ctx.filename
    has_long_text = ctx.has_long_text
    has_hero = ctx.has_hero

    # --- 3. VISUAL EFFECTS (visual-effects.md) ---

    # Glassmorphism Check
    if 'backdrop-filter' in content or 'blur(' in content:
        if not re.search(r'background:\s*rgba|bg-opacity|bg-[a-z0-9]+\/\d+', content):
            ctx.warnings.append(f"[Visual] {filename}: Blur used without semi-transparent background (Glassmorphism fail)")

    # GPU Acceleration / Performance
    if re.search(r'@keyframes|transition:', content):
        expensive_props = re.findall(r'width|height|top|left|right|bottom|margin|padding', content)
        if expensive_props:
            ctx.warnings.append(f"[Performance] {filename}: Animating expensive properties ({', '.join(sorted(set(expensive_props)))}). Use transform/opacity where possible.")

        # Reduced Motion
        if not re.search(r'prefers-reduced-motion', content):
            ctx.warnings.append(f"[Accessibility] {filename}: Animations found without prefers-reduced-motion check")

    # Natural Shadows
    shadows = re.findall(r'box-shadow:\s*([^;]+)', content)
    for shadow in shadows:
        # Check if natural (Y > X) or multiple layers
        if ',' not in shadow and not re.search(r'\d+px\s+[1-9]\d*px', shadow): # Simple heuristic for Y-offset
             ctx.warnings.append(f"[Visual] {filename}: Simple/Unnatural shadow detected. Consider multiple layers or Y > X offset for realism.")

    # --- 3.1 NEOMORPHISM CHECK ---
    # Check for neomorphism patterns (dual shadows with opposite directions)
    neo_shadows = re.findall(r'box-shadow:\s*([^;]+)', content)
    for shadow in neo_shadows:
        # Neomorphism has two shadows: positive offset + negative offset
        if ',' in shadow and '-' in shadow:
            # Check for inset pattern (pressed state)
            if 'inset' in shadow:
                ctx.warnings.append(f"[Visual] {filename}: Neomorphism inset detected. Ensure adequate contrast for accessibility.")

    # --- 3.2 SHADOW HIERARCHY ---
    # Count shadow levels to check for elevation consistency
    shadow_count = len(shadows)
    if shadow_count > 0:
        # Check for shadow opacity levels (should indicate hierarchy)
        opacities = re.findall(r'rgba?\([^)]+,\s*(\d*\.?\d+)\)', content)
        shadow_opacities = [float(o) for o in opacities if float(o) < 0.5]
        if shadow_count >= 3 and len(shadow_opacities) > 0:
            # Check if there's variety in shadow opacities for different elevations
            unique_opacities = len(set(shadow_opacities))
            if unique_opacities < 2:
                ctx.warnings.append(f"[Visual] {filename}: All shadows at same opacity level. Vary shadow intensity for elevation hierarchy.")

    # --- 3.3 GRADIENT CHECKS ---
    # Check for gradient overuse (flat / solid-surface / 1px-border archetypes are encouraged)
    has_gradient = bool(re.search(r'gradient|linear-gradient|radial-gradient|conic-gradient', content))
    if has_gradient:
        # Warn about mesh/aurora gradients (can be overused)
        gradient_count = len(re.findall(r'gradient', content, re.IGNORECASE))
        if gradient_count > 5:
            ctx.warnings.append(f"[Visual] {filename}: Many gradients detected ({gradient_count}). Ensure this serves purpose, not decoration.")

    # --- 3.4 BORDER EFFECTS ---
    # Check for gradient borders or animated borders
    has_border = bool(re.search(r'border:|border-', content))
    if has_border:
        # Check for overly complex borders
        border_count = len(re.findall(r'border:', content))
        if border_count > 8:
            ctx.warnings.append(f"[Visual] {filename}: Many border declarations ({border_count}). Simplify for cleaner look.")

    # --- 3.5 GLOW EFFECTS ---
    # Check for text-shadow or multiple box-shadow layers (glow effects)
    text_shadows = re.findall(r'text-shadow:', content)
    for ts in text_shadows:
        # Multiple text-shadow layers indicate glow
        if ',' in ts:
            ctx.warnings.append(f"[Visual] {filename}: Text glow effect detected. Ensure readability is maintained.")

    # Check for box-shadow glow (multiple layers with 0 offset)
    glow_shadows = re.findall(r'box-shadow:\s*[^;]*0\s+0\s+', content)
    if len(glow_shadows) > 2:
        ctx.warnings.append(f"[Visual] {filename}: Multiple glow effects detected. Use sparingly for emphasis only.")

    # --- 3.6 OVERLAY TECHNIQUES ---
    # Check for image overlays (for readability)
    has_images = bool(re.search(r'<img|background-image:|bg-\[url', content))
    if has_images and has_long_text:
        has_overlay = bool(re.search(r'overlay|rgba\(0|gradient.*transparent|::after|::before', content))
        if not has_overlay:
            ctx.warnings.append(f"[Visual] {filename}: Text over image without overlay. Add gradient overlay for readability.")

    # --- 3.7 PERFORMANCE: will-change ---
    # Check for will-change usage
    if re.search(r'will-change:', content):
        will_change_props = re.findall(r'will-change:\s*([^;]+)', content)
        for prop in will_change_props:
            prop = prop.strip().lower()
            if prop in ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding']:
                ctx.issues.append(f"[Performance] {filename}: will-change on '{prop}' (layout property). Use only for transform/opacity.")

    # Check for excessive will-change usage
    will_change_count = len(re.findall(r'will-change:', content))
    if will_change_count > 3:
        ctx.warnings.append(f"[Performance] {filename}: Many will-change declarations ({will_change_count}). Use sparingly, only for heavy animations.")

    # --- 3.8 EFFECT SELECTION ---
    # Check for effect overuse (too many visual effects)
    effect_count = (
        (1 if has_gradient else 0) +
        shadow_count +
        len(re.findall(r'backdrop-filter|blur\(', content)) +
        len(re.findall(r'text-shadow:', content))
    )
    if effect_count > 10:
        ctx.warnings.append(f"[Visual] {filename}: Many visual effects ({effect_count}). Ensure effects serve purpose, not decoration.")

    # Check for surface hierarchy (shadows, 1px hairline borders, or surface tokens all provide depth)
    has_surface_depth = has_border or bool(re.search(r'--surface-|surface_elevation|oklch\(', content))
    if has_long_text and effect_count == 0 and not has_surface_depth:
        ctx.warnings.append(f"[Visual] {filename}: Flat design with no surface hierarchy. Consider 1px hairline borders or stepped surface elevation.")
