#!/usr/bin/env python3
"""
Mobile audit checks: touch psychology and runtime performance.

Part of mobile_audit.py (one group of check sections per module; run via mobile_audit.py).
"""

import re

from mobile_audit_context import MobileFileContext

MIN_TOUCH_TARGET = 44
MIN_REPORTED_SIZE = 10  # smaller values are hairlines/dividers, not targets
DIMENSION_RE = re.compile(r'\b(?:width|height|minWidth|minHeight)\s*:\s*(\d+(?:\.\d+)?)(?![\d.%])')
TOUCHABLE_RE = re.compile(r'Pressable|Touchable\w*|<Button\b|IconButton|InkWell|GestureDetector|ElevatedButton|TextButton')


def check_touch(ctx: MobileFileContext) -> None:
    """Section 1: touch psychology."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 1. TOUCH PSYCHOLOGY CHECKS ---

    # 1.1 Touch Target Size Check
    # Whole numbers only ("width: 300" is 300, not 30), and only in files that
    # render touchables. Regex cannot tell which style object belongs to a
    # touchable, so small sizes are a warning, not a blocking issue.
    if TOUCHABLE_RE.search(content):
        small_sizes = sorted({
            float(value) for value in DIMENSION_RE.findall(content)
            if MIN_REPORTED_SIZE <= float(value) < MIN_TOUCH_TARGET
        })
        if small_sizes:
            sizes = ", ".join(f"{size:g}" for size in small_sizes)
            ctx.warnings.append(f"[Touch Target] {filename}: Possible small touch target size(s) {sizes} < 44 minimum (iOS: 44pt, Android: 48dp). Verify Pressable/Touchable/Button styles.")

    # 1.2 Touch Target Spacing Check
    # Look for inadequate spacing between touchable elements
    small_gaps = re.findall(r'(?:margin|gap):\s*([0-7])\s*(?:px|dp)', content)
    for gap in small_gaps:
        if int(gap) < 8:
            ctx.warnings.append(f"[Touch Spacing] {filename}: Touch target spacing {gap}px < 8px minimum. Accidental taps risk.")

    # 1.3 Thumb Zone Placement Check
    # Primary CTAs should be at bottom (easy thumb reach)
    primary_buttons = re.findall(r'(?:testID|id):\s*["\'](?:.*(?:primary|cta|submit|confirm)[^"\']*)["\']', content, re.IGNORECASE)
    has_bottom_placement = bool(re.search(r'position:\s*["\']?absolute["\']?|bottom:\s*\d+|style.*bottom|justifyContent:\s*["\']?flex-end', content))
    if primary_buttons and not has_bottom_placement:
        ctx.warnings.append(f"[Thumb Zone] {filename}: Primary CTA may not be in thumb zone (bottom). Place primary actions at bottom for easy reach.")

    # 1.4 Gesture Alternatives Check
    # Swipe actions should have visible button alternatives
    has_swipe_gestures = bool(re.search(r'Swipeable|onSwipe|PanGestureHandler|swipe', content))
    has_visible_buttons = bool(re.search(r'Button.*(?:delete|archive|more)|TouchableOpacity|Pressable', content))
    if has_swipe_gestures and not has_visible_buttons:
        ctx.warnings.append(f"[Gestures] {filename}: Swipe gestures detected without visible button alternatives. Motor impaired users need alternatives.")

    # 1.5 Haptic Feedback Check
    # Important actions should have haptic feedback
    has_important_actions = bool(re.search(r'(?:onPress|onSubmit|delete|remove|confirm|purchase)', content))
    has_haptics = bool(re.search(r'Haptics|Vibration|react-native-haptic-feedback|FeedbackManager', content))
    if has_important_actions and not has_haptics:
        ctx.warnings.append(f"[Haptics] {filename}: Important actions without haptic feedback. Consider adding haptic confirmation.")

    # 1.6 Touch Feedback Timing Check
    # Touch feedback should be immediate (<50ms)
    if is_react_native:
        has_pressable = bool(re.search(r'Pressable|TouchableOpacity', content))
        has_feedback_state = bool(re.search(r'pressed|style.*opacity|underlay', content))
        if has_pressable and not has_feedback_state:
            ctx.warnings.append(f"[Touch Feedback] {filename}: Pressable without visual feedback state. Add opacity/scale change for tap confirmation.")


def check_performance(ctx: MobileFileContext) -> None:
    """Section 2: mobile performance."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 2. MOBILE PERFORMANCE CHECKS ---

    # 2.1 CRITICAL: ScrollView vs FlatList
    has_scrollview = bool(re.search(r'<ScrollView|ScrollView\.', content))
    has_map_in_scrollview = bool(re.search(r'ScrollView.*\.map\(|ScrollView.*\{.*\.map', content))
    if has_scrollview and has_map_in_scrollview:
        ctx.issues.append(f"[Performance CRITICAL] {filename}: ScrollView with .map() detected. Use FlatList for lists to prevent memory explosion.")

    # 2.2 React.memo Check
    if is_react_native:
        has_list = bool(re.search(r'FlatList|FlashList|SectionList', content))
        has_react_memo = bool(re.search(r'React\.memo|memo\(', content))
        if has_list and not has_react_memo:
            ctx.warnings.append(f"[Performance] {filename}: FlatList without React.memo on list items. Items will re-render on every parent update.")

    # 2.3 useCallback Check
    if is_react_native:
        has_flatlist = bool(re.search(r'FlatList|FlashList', content))
        has_use_callback = bool(re.search(r'useCallback', content))
        if has_flatlist and not has_use_callback:
            ctx.warnings.append(f"[Performance] {filename}: FlatList renderItem without useCallback. New function created every render.")

    # 2.4 keyExtractor Check (CRITICAL)
    if is_react_native:
        has_flatlist = bool(re.search(r'FlatList', content))
        has_key_extractor = bool(re.search(r'keyExtractor', content))
        uses_index_key = bool(re.search(r'key=\{.*index.*\}|key:\s*index', content))
        if has_flatlist and not has_key_extractor:
            ctx.issues.append(f"[Performance CRITICAL] {filename}: FlatList without keyExtractor. Index-based keys cause bugs on reorder/delete.")
        if uses_index_key:
            ctx.issues.append(f"[Performance CRITICAL] {filename}: Using index as key. This causes bugs when list changes. Use unique ID from data.")

    # 2.5 useNativeDriver Check
    if is_react_native:
        has_animated = bool(re.search(r'Animated\.', content))
        has_native_driver = bool(re.search(r'useNativeDriver:\s*true', content))
        has_native_driver_false = bool(re.search(r'useNativeDriver:\s*false', content))
        if has_animated and has_native_driver_false:
            ctx.warnings.append(f"[Performance] {filename}: Animation with useNativeDriver: false. Use true for 60fps (only supports transform/opacity).")
        if has_animated and not has_native_driver:
            ctx.warnings.append(f"[Performance] {filename}: Animated component without useNativeDriver. Add useNativeDriver: true for 60fps.")

    # 2.6 Memory Leak Check
    if is_react_native:
        has_effect = bool(re.search(r'useEffect', content))
        has_cleanup = bool(re.search(r'return\s*\(\)\s*=>|return\s+function', content))
        has_subscriptions = bool(re.search(r'addEventListener|subscribe|\.focus\(\)|\.off\(', content))
        if has_effect and has_subscriptions and not has_cleanup:
            ctx.issues.append(f"[Memory Leak] {filename}: useEffect with subscriptions but no cleanup function. Memory leak on unmount.")

    # 2.7 Console.log Detection
    console_logs = len(re.findall(r'console\.log|console\.warn|console\.error|console\.debug', content))
    if console_logs > 5:
        ctx.warnings.append(f"[Performance] {filename}: {console_logs} console.log statements detected. Remove before production (blocks JS thread).")

    # 2.8 Inline Function Detection
    if is_react_native:
        inline_functions = re.findall(r'(?:onPress|onPressIn|onPressOut|renderItem):\s*\([^)]*\)\s*=>', content)
        if len(inline_functions) > 3:
            ctx.warnings.append(f"[Performance] {filename}: {len(inline_functions)} inline arrow functions in props. Creates new function every render. Use useCallback.")

    # 2.9 Animation Properties Check
    # Warn if animating expensive properties
    animating_layout = bool(re.search(r'Animated\.timing.*(?:width|height|margin|padding)', content))
    if animating_layout:
        ctx.issues.append(f"[Performance] {filename}: Animating layout properties (width/height/margin). Use transform/opacity for 60fps.")
