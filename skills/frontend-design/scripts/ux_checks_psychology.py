#!/usr/bin/env python3
"""
UX audit checks: psychology laws, emotional design, trust, cognitive load, persuasion.

Part of ux_audit.py (one check section per module; run via ux_audit.py).
"""

import re

from ux_audit_context import UXFileContext


NAV_BLOCK_RE = re.compile(r'<nav\b[^>]*>([\s\S]*?)</nav>', re.IGNORECASE)
NAV_ITEM_RE = re.compile(r'<(?:NavLink|Link)\b|<a\s+[^>]*href=|nav-item')


def check_psychology(ctx: UXFileContext) -> None:
    """Sections 1-1.8: Hick, Fitts, Miller, Von Restorff, emotional design, trust, cognitive load, persuasion."""
    if ctx.is_stylesheet:
        return
    content = ctx.content
    filename = ctx.filename
    has_long_text = ctx.has_long_text
    has_form = ctx.has_form
    complex_elements = ctx.complex_elements
    has_hero = ctx.has_hero

    # --- 1. PSYCHOLOGY LAWS ---
    # Hick's Law (scoped to <nav> containers; ignores <link> metadata tags in <head>)
    nav_blocks = NAV_BLOCK_RE.findall(content)
    nav_items = max((len(NAV_ITEM_RE.findall(block)) for block in nav_blocks), default=0)
    if nav_items > 7:
        ctx.issues.append(f"[Hick's Law] {filename}: {nav_items} nav items (Max 7)")

    # Fitts' Law
    if re.search(r'height:\s*([0-3]\d)px', content) or re.search(r'h-[1-9]\b|h-10\b', content):
        ctx.warnings.append(f"[Fitts' Law] {filename}: Small targets (< 44px)")

    # Miller's Law
    form_fields = len(re.findall(r'<input|<select|<textarea', content, re.IGNORECASE))
    if form_fields > 7 and not re.search(r'step|wizard|stage', content, re.IGNORECASE):
        ctx.warnings.append(f"[Miller's Law] {filename}: Complex form ({form_fields} fields)")

    # Von Restorff
    if 'button' in content.lower() and not re.search(r'primary|bg-primary|Button.*primary|variant=["\']primary', content, re.IGNORECASE):
        ctx.warnings.append(f"[Von Restorff] {filename}: No primary CTA")

    # Serial Position Effect - Important items at beginning/end
    if nav_items > 3:
        # Check if last nav item is important (contact, login, etc.)
        nav_content = re.findall(r'<NavLink|<Link|<a\s+href[^>]*>([^<]+)</a>', content, re.IGNORECASE)
        if nav_content and len(nav_content) > 2:
            last_item = nav_content[-1].lower() if nav_content else ''
            if not any(x in last_item for x in ['contact', 'login', 'sign', 'get started', 'cta', 'button']):
                ctx.warnings.append(f"[Serial Position] {filename}: Last nav item may not be important. Place key actions at start/end.")

    # --- 1.5 EMOTIONAL DESIGN (Don Norman) ---

    # Visceral: First impressions (typography, surface hierarchy, borders, or motion — never force gradients)
    if has_hero:
        has_visual_craft = bool(
            re.search(r'font-|text-(?:3xl|4xl|5xl|6xl)|clamp\(|border|bg-|background|@keyframes|transition:|animate-', content)
        )
        if has_visual_craft:
            ctx.passed_count += 1

    # Behavioral: Instant feedback and usability
    if 'onClick' in content or '@click' in content or 'onclick' in content:
        has_feedback = re.search(r'transition|animate|hover:|focus:|disabled|loading|spinner', content, re.IGNORECASE)
        has_state_change = re.search(r'setState|useState|disabled|loading', content)

        if not has_feedback and not has_state_change:
            ctx.warnings.append(f"[Behavioral] {filename}: Interactive elements lack immediate feedback. Add hover/focus/disabled states.")

    # Reflective: Brand story, values, identity
    has_reflective = bool(re.search(r'about|story|mission|values|why we|our journey|testimonials', content, re.IGNORECASE))
    if has_long_text and not has_reflective:
        ctx.warnings.append(f"[Reflective] {filename}: Long-form content without brand story/values. Add 'About' or 'Why We Exist' section.")

    # --- 1.6 TRUST BUILDING (Enhanced) ---

    # Security signals
    if has_form:
        security_signals = re.findall(r'ssl|secure|encrypt|lock|padlock|https', content, re.IGNORECASE)
        if len(security_signals) == 0 and not re.search(r'checkout|payment', content, re.IGNORECASE):
            ctx.warnings.append(f"[Trust] {filename}: Form without security indicators. Add 'SSL Secure' or lock icon.")

    # Social proof elements
    social_proof = re.findall(r'review|testimonial|rating|star|trust|trusted by|customer|logo', content, re.IGNORECASE)
    if len(social_proof) > 0:
        ctx.passed_count += 1
    else:
        if has_long_text:
            ctx.warnings.append(f"[Trust] {filename}: No social proof detected. Consider adding testimonials, ratings, or 'Trusted by' logos.")

    # Authority indicators
    has_footer = bool(re.search(r'footer|<footer', content, re.IGNORECASE))
    if has_footer:
        authority = re.findall(r'certif|award|media|press|featured|as seen in', content, re.IGNORECASE)
        if len(authority) == 0:
            ctx.warnings.append(f"[Trust] {filename}: Footer lacks authority signals. Add certifications, awards, or media mentions.")

    # --- 1.7 COGNITIVE LOAD MANAGEMENT ---

    # Progressive disclosure
    if complex_elements > 5:
        has_progressive = re.search(r'step|wizard|stage|accordion|collapsible|tab|more\.\.\.|advanced|show more', content, re.IGNORECASE)
        if not has_progressive:
            ctx.warnings.append(f"[Cognitive Load] {filename}: Many form elements without progressive disclosure. Consider accordion, tabs, or 'Advanced' toggle.")

    # Visual noise check
    has_many_colors = len(re.findall(r'#[0-9a-fA-F]{3,6}|rgb|hsl', content)) > 15
    has_many_borders = len(re.findall(r'border:|border-', content)) > 10
    if has_many_colors and has_many_borders:
        ctx.warnings.append(f"[Cognitive Load] {filename}: High visual noise detected. Many colors and borders increase cognitive load.")

    # Familiar patterns
    if has_form:
        has_standard_labels = bool(re.search(r'<label|placeholder|aria-label', content, re.IGNORECASE))
        if not has_standard_labels:
            ctx.issues.append(f"[Cognitive Load] {filename}: Form inputs without labels. Use <label> for accessibility and clarity.")

    # --- 1.8 PERSUASIVE DESIGN (Ethical) ---

    # Smart defaults
    if has_form:
        has_defaults = bool(re.search(r'checked|selected|default|value=["\'].*["\']', content))
        radio_inputs = len(re.findall(r'type=["\']radio', content, re.IGNORECASE))
        if radio_inputs > 0 and not has_defaults:
            ctx.warnings.append(f"[Persuasion] {filename}: Radio buttons without default selection. Pre-select recommended option.")

    # Anchoring (showing original price)
    if re.search(r'price|pricing|cost|\$\d+', content, re.IGNORECASE):
        has_anchor = bool(re.search(r'original|was|strike|del|save \d+%', content, re.IGNORECASE))
        if not has_anchor:
            ctx.warnings.append(f"[Persuasion] {filename}: Prices without anchoring. Show original price to frame discount value.")

    # Social proof live indicators
    has_social = bool(re.search(r'join|subscriber|member|user', content, re.IGNORECASE))
    if has_social:
        has_count = bool(re.findall(r'\d+[+kmb]|\d+,\d+', content))
        if not has_count:
            ctx.warnings.append(f"[Persuasion] {filename}: Social proof without specific numbers. Use 'Join 10,000+' format.")

    # Progress indicators
    if has_form:
        has_progress = bool(re.search(r'progress|step \d+|complete|%|bar', content, re.IGNORECASE))
        if complex_elements > 5 and not has_progress:
            ctx.warnings.append(f"[Persuasion] {filename}: Long form without progress indicator. Add progress bar or 'Step X of Y'.")
