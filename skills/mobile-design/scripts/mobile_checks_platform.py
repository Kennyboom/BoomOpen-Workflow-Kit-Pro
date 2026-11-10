#!/usr/bin/env python3
"""
Mobile audit checks: iOS and Android platform conventions.

Part of mobile_audit.py (one group of check sections per module; run via mobile_audit.py).
"""

import re

from mobile_audit_context import MobileFileContext


def check_platform_basics(ctx: MobileFileContext) -> None:
    """Sections 6-7: iOS and Android basics."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 6. PLATFORM iOS CHECKS ---

    if is_react_native:
        # 6.1 SF Symbols Check
        has_ios_icons = bool(re.search(r'@expo/vector-icons|ionicons', content))
        has_sf_symbols = bool(re.search(r'sf-symbol|SF Symbols', content))
        if has_ios_icons and not has_sf_symbols:
            ctx.passed_count += 1

        # 6.2 iOS Haptic Types
        has_haptic_import = bool(re.search(r'expo-haptics|react-native-haptic-feedback', content))
        has_haptic_types = bool(re.search(r'ImpactFeedback|NotificationFeedback|SelectionFeedback', content))
        if has_haptic_import and not has_haptic_types:
            ctx.warnings.append(f"[iOS Haptics] {filename}: Haptic library imported but not using typed haptics (Impact/Notification/Selection).")

        # 6.3 iOS Safe Area
        has_safe_area = bool(re.search(r'SafeAreaView|useSafeAreaInsets|safeArea', content))
        if not has_safe_area:
            ctx.warnings.append(f"[iOS] {filename}: No SafeArea detected. Content may be hidden by notch/home indicator.")

    # --- 7. PLATFORM ANDROID CHECKS ---

    if is_react_native:
        # 7.1 Material Icons Check
        has_material_icons = bool(re.search(r'@expo/vector-icons|MaterialIcons', content))
        if has_material_icons:
            ctx.passed_count += 1

        # 7.2 Ripple Effect
        has_ripple = bool(re.search(r'ripple|android_ripple|foregroundRipple', content))
        has_pressable = bool(re.search(r'Pressable|Touchable', content))
        if has_pressable and not has_ripple:
            ctx.warnings.append(f"[Android] {filename}: Touchable without ripple effect. Android users expect ripple feedback.")

        # 7.3 Hardware Back Button
        if is_react_native:
            has_back_button = bool(re.search(r'BackHandler|useBackHandler', content))
            has_navigation = bool(re.search(r'@react-navigation', content))
            if has_navigation and not has_back_button:
                ctx.warnings.append(f"[Android] {filename}: React Navigation detected without BackHandler listener. Android hardware back may not work correctly.")


def check_platform_extended(ctx: MobileFileContext) -> None:
    """Sections 11-12: extended iOS and Android checks."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 11. EXTENDED PLATFORM IOS CHECKS ---

    if is_react_native:
        # 11.1 SF Pro Font Detection
        has_sf_pro = bool(re.search(r'SF Pro|SFPro|fontFamily:\s*["\']?[-\s]*SF', content))
        has_custom_font = bool(re.search(r'fontFamily:\s*["\'][^"\']+', content))
        if has_custom_font and not has_sf_pro:
            ctx.warnings.append(f"[iOS] {filename}: Custom font without SF Pro fallback. Consider SF Pro Text for body, SF Pro Display for headings.")

        # 11.2 iOS System Colors Check
        # Check for semantic color usage
        has_label = bool(re.search(r'color:\s*["\']?label|\.label', content))
        has_secondaryLabel = bool(re.search(r'secondaryLabel|\.secondaryLabel', content))
        has_systemBackground = bool(re.search(r'systemBackground|\.systemBackground', content))

        has_hardcoded_gray = bool(re.search(r'#[78]0{4}', content))
        if has_hardcoded_gray and not (has_label or has_secondaryLabel):
            ctx.warnings.append(f"[iOS] {filename}: Hardcoded gray colors detected. Consider iOS semantic colors (label, secondaryLabel) for automatic dark mode.")

        # 11.3 iOS Accent Colors Check
        ios_blue = bool(re.search(r'#007AFF|#0A84FF|systemBlue', content))
        ios_green = bool(re.search(r'#34C759|#30D158|systemGreen', content))
        ios_red = bool(re.search(r'#FF3B30|#FF453A|systemRed', content))

        has_custom_primary = bool(re.search(r'primaryColor|theme.*primary|colors\.primary', content))
        if has_custom_primary and not (ios_blue or ios_green or ios_red):
            ctx.warnings.append(f"[iOS] {filename}: Custom primary color without iOS system color fallback. Consider systemBlue for consistent iOS feel.")

        # 11.4 iOS Navigation Patterns Check
        has_navigation_bar = bool(re.search(r'navigationOptions|headerStyle|cardStyle', content))
        has_header_title = bool(re.search(r'title:\s*["\']|headerTitle|navigation\.setOptions', content))
        if has_navigation_bar and not has_header_title:
            ctx.warnings.append(f"[iOS] {filename}: Navigation bar detected without title. iOS apps should have clear context in nav bar.")

        # 11.5 iOS Component Patterns Check
        # Check for iOS-specific components
        has_alert = bool(re.search(r'Alert\.alert|showAlert', content))
        has_action_sheet = bool(re.search(r'ActionSheet|ActionSheetIOS|showActionSheetWithOptions', content))
        has_activity_indicator = bool(re.search(r'ActivityIndicator|ActivityIndic', content))

        if has_alert or has_action_sheet or has_activity_indicator:
            ctx.passed_count += 1  # Good iOS component usage

    # --- 12. EXTENDED PLATFORM ANDROID CHECKS ---

    if is_react_native:
        # 12.1 Roboto Font Detection
        has_roboto = bool(re.search(r'Roboto|fontFamily:\s*["\']?[-\s]*Roboto', content))
        has_custom_font = bool(re.search(r'fontFamily:\s*["\'][^"\']+', content))
        if has_custom_font and not has_roboto:
            ctx.warnings.append(f"[Android] {filename}: Custom font without Roboto fallback. Roboto is optimized for Android displays.")

        # 12.2 Material 3 Dynamic Color Check
        has_material_colors = bool(re.search(r'MD3|MaterialYou|dynamicColor|useColorScheme', content))
        has_theme_provider = bool(re.search(r'MaterialTheme|ThemeProvider|PaperProvider|ThemeProvider', content))
        if not has_material_colors and not has_theme_provider:
            ctx.warnings.append(f"[Android] {filename}: No Material 3 dynamic color detected. Consider Material 3 theming for personalized feel.")

        # 12.3 Material Elevation Check
        # Check for elevation values (Material 3 uses elevation for depth)
        has_elevation = bool(re.search(r'elevation:\s*\d+|shadowOpacity|shadowRadius|android:elevation', content))
        has_box_shadow = bool(re.search(r'boxShadow:', content))
        if has_box_shadow and not has_elevation:
            ctx.warnings.append(f"[Android] {filename}: CSS box-shadow detected without elevation. Consider Material elevation system for consistent depth.")

        # 12.4 Material Component Patterns Check
        # Check for Material components
        has_ripple = bool(re.search(r'ripple|android_ripple|foregroundRipple', content))
        has_card = bool(re.search(r'Card|Paper|elevation.*\d+', content))
        has_fab = bool(re.search(r'FAB|FloatingActionButton|fab', content))
        has_snackbar = bool(re.search(r'Snackbar|showSnackBar|Toast', content))

        material_component_count = sum([has_ripple, has_card, has_fab, has_snackbar])
        if material_component_count >= 2:
            ctx.passed_count += 1  # Good Material design usage

        # 12.5 Android Navigation Patterns Check
        has_top_app_bar = bool(re.search(r'TopAppBar|AppBar|CollapsingToolbar', content))
        has_bottom_nav = bool(re.search(r'BottomNavigation|BottomNav', content))
        has_navigation_rail = bool(re.search(r'NavigationRail', content))

        if has_bottom_nav:
            ctx.passed_count += 1  # Good Android pattern
        elif has_top_app_bar and not (has_bottom_nav or has_navigation_rail):
            ctx.warnings.append(f"[Android] {filename}: TopAppBar without bottom navigation. Consider BottomNavigation for thumb-friendly access.")
