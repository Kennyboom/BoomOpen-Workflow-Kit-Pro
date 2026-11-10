#!/usr/bin/env python3
"""
UX audit checks: animation guide and motion graphics.

Part of ux_audit.py (one check section per module; run via ux_audit.py).
"""

import re

from ux_audit_context import UXFileContext


def check_animation(ctx: UXFileContext) -> None:
    """Section 5: animation guide."""
    content = ctx.content
    filename = ctx.filename

    # --- 5. ANIMATION GUIDE (animation-guide.md) ---

    # 5.1 Duration Appropriateness
    # Check for excessively long or short animations
    durations = re.findall(r'(?:duration|animation-duration|transition-duration):\s*(\d*\.?\d+)(s|ms)', content)
    for duration, unit in durations:
        duration_ms = float(duration) * (1000 if unit == 's' else 1)
        if duration_ms < 50:
            ctx.warnings.append(f"[Animation] {filename}: Very fast animation ({duration}{unit}). Minimum 50ms for visibility.")
        elif duration_ms > 1000 and 'transition' in content.lower():
            ctx.warnings.append(f"[Animation] {filename}: Long transition ({duration}{unit}). Transitions should be 100-300ms for responsiveness.")

    # 5.2 Easing Function Correctness
    # Check for incorrect easing patterns
    if re.search(r'ease-in\s+.*entry|fade-in.*ease-in', content):
        ctx.warnings.append(f"[Animation] {filename}: Entry animation with ease-in. Entry should use ease-out for snappy feel.")
    if re.search(r'ease-out\s+.*exit|fade-out.*ease-out', content):
        ctx.warnings.append(f"[Animation] {filename}: Exit animation with ease-out. Exit should use ease-in for natural feel.")

    # 5.3 Micro-interaction Feedback Patterns
    # Check for interactive elements without hover/focus states
    interactive_elements = len(re.findall(r'<button|<a\s+href|onClick|@click', content))
    has_hover_focus = bool(re.search(r'hover:|focus:|:hover|:focus', content))
    if interactive_elements > 2 and not has_hover_focus:
        ctx.warnings.append(f"[Animation] {filename}: Interactive elements without hover/focus states. Add micro-interactions for feedback.")

    # 5.4 Loading State Indicators
    # Check for loading patterns
    has_async = bool(re.search(r'async|await|fetch|axios|loading|isLoading', content))
    has_loading_indicator = bool(re.search(r'skeleton|spinner|progress|loading|<circle.*animate', content))
    if has_async and not has_loading_indicator:
        ctx.warnings.append(f"[Animation] {filename}: Async operations without loading indicator. Add skeleton or spinner for perceived performance.")

    # 5.5 Page Transition Patterns
    # Check for page/view transitions
    has_routing = bool(re.search(r'router|navigate|Link.*to|useHistory', content))
    has_page_transition = bool(re.search(r'AnimatePresence|motion\.|transition.*page|fade.*route', content))
    if has_routing and not has_page_transition:
        ctx.warnings.append(f"[Animation] {filename}: Routing detected without page transitions. Consider fade/slide for context continuity.")

    # 5.6 Scroll Animation Performance
    # Check for scroll-driven animations
    has_scroll_anim = bool(re.search(r'onScroll|scroll.*trigger|IntersectionObserver', content))
    if has_scroll_anim:
        # Check if using expensive properties in scroll handlers
        if re.search(r'onScroll.*[^\w](width|height|top|left)', content):
            ctx.issues.append(f"[Animation] {filename}: Scroll handler animating layout properties. Use transform/opacity for 60fps.")


def check_motion_graphics(ctx: UXFileContext) -> None:
    """Section 6: motion graphics."""
    content = ctx.content
    filename = ctx.filename

    # --- 6. MOTION GRAPHICS (motion-graphics.md) ---

    # 6.1 Lottie Animation Checks
    has_lottie = bool(re.search(r'lottie|Lottie|@lottie-react', content))
    if has_lottie:
        # Check for reduced motion fallback
        has_lottie_fallback = bool(re.search(r'prefers-reduced-motion.*lottie|lottie.*isPaused|lottie.*stop', content))
        if not has_lottie_fallback:
            ctx.warnings.append(f"[Motion] {filename}: Lottie animation without reduced-motion fallback. Add pause/stop for accessibility.")

    # 6.2 GSAP Memory Leak Risks
    has_gsap = bool(re.search(r'\bgsap\.|\bScrollTrigger\.|\bfrom\s*\([^)]*gsap', content))
    if has_gsap:
        # Check for cleanup patterns (including @gsap/react useGSAP auto-cleanup)
        has_gsap_cleanup = bool(re.search(r'\bkill\s*\(|\brevert\s*\(|\buseGSAP\s*\(|useEffect.*return.*gsap', content))
        if not has_gsap_cleanup:
            ctx.issues.append(f"[Motion] {filename}: GSAP animation without cleanup (kill/revert/useGSAP). Memory leak risk on unmount.")

    # 6.3 SVG Animation Performance
    svg_animations = re.findall(r'<animate|<animateTransform|stroke-dasharray|stroke-dashoffset', content)
    if len(svg_animations) > 3:
        ctx.warnings.append(f"[Motion] {filename}: Multiple SVG animations detected. Ensure stroke-dashoffset is used sparingly for mobile performance.")

    # 6.4 3D Transform Performance
    has_3d_transform = bool(re.search(r'transform3d|perspective\(|rotate3d|translate3d', content))
    if has_3d_transform:
        # Check for perspective on parent
        has_perspective_parent = bool(re.search(r'perspective:\s*\d+px|perspective\s*\(', content))
        if not has_perspective_parent:
            ctx.warnings.append(f"[Motion] {filename}: 3D transform without perspective parent. Add perspective: 1000px for realistic depth.")

        # Warn about mobile performance
        ctx.warnings.append(f"[Motion] {filename}: 3D transforms detected. Test on mobile; can impact performance on low-end devices.")

    # 6.5 Particle Effect Warnings
    # Check for canvas/WebGL particle systems
    has_particles = bool(re.search(r'particle|canvas.*loop|requestAnimationFrame.*draw|Three\.js', content))
    if has_particles:
        ctx.warnings.append(f"[Motion] {filename}: Particle effects detected. Ensure fallback or reduced-quality option for mobile devices.")

    # 6.6 Scroll-Driven Animation Performance
    # CSS view-timeline / animation-timeline: view() runs off-main-thread on the compositor (no JS rAF needed).
    if re.search(r'\b(?:view-timeline|scroll-timeline|animation-timeline\s*:\s*(?:view|scroll)\()', content):
        ctx.passed_count += 1
    elif not ctx.is_stylesheet and re.search(r'addEventListener\s*\(\s*["\']scroll["\']', content):
        has_throttle = bool(re.search(r'throttle|debounce|requestAnimationFrame|passive\s*:\s*true', content))
        if not has_throttle:
            ctx.issues.append(f"[Motion] {filename}: JS scroll listener without throttling/passive flag. Add requestAnimationFrame for 60fps.")

    # 6.7 Motion Decision Tree - Context Check
    # Check if animation serves purpose (not just decoration)
    total_animations = (
        len(re.findall(r'@keyframes|transition:|animate-', content)) +
        (1 if has_lottie else 0) +
        (1 if has_gsap else 0)
    )
    if total_animations > 5:
        # Check if animations are functional
        functional_animations = len(re.findall(r'hover:|focus:|disabled|loading|error|success', content))
        if functional_animations < total_animations / 2:
            ctx.warnings.append(f"[Motion] {filename}: Many animations ({total_animations}). Ensure majority serve functional purpose (feedback, guidance), not decoration.")
