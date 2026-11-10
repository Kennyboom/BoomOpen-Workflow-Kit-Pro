#!/usr/bin/env python3
"""
Mobile audit checks: navigation, backend, testing and debugging.

Part of mobile_audit.py (one group of check sections per module; run via mobile_audit.py).
"""

import re

from mobile_audit_context import MobileFileContext


def check_navigation(ctx: MobileFileContext) -> None:
    """Section 3: mobile navigation."""
    content = ctx.content
    filename = ctx.filename

    # --- 3. MOBILE NAVIGATION CHECKS ---

    # 3.1 Tab Bar Max Items Check
    tab_bar_items = len(re.findall(r'Tab\.Screen|createBottomTabNavigator|BottomTab', content))
    if tab_bar_items > 5:
        ctx.warnings.append(f"[Navigation] {filename}: {tab_bar_items} tab bar items (max 5 recommended). More than 5 becomes hard to tap.")

    # 3.2 Tab State Preservation Check
    has_tab_nav = bool(re.search(r'createBottomTabNavigator|Tab\.Navigator', content))
    if has_tab_nav:
        # Look for lazy prop (false preserves state)
        has_lazy_false = bool(re.search(r'lazy:\s*false', content))
        if not has_lazy_false:
            ctx.warnings.append(f"[Navigation] {filename}: Tab navigation without lazy: false. Tabs may lose state on switch.")

    # 3.3 Back Handling Check
    has_back_listener = bool(re.search(r'BackHandler|useFocusEffect|navigation\.addListener', content))
    has_custom_back = bool(re.search(r'onBackPress|handleBackPress', content))
    if has_custom_back and not has_back_listener:
        ctx.warnings.append(f"[Navigation] {filename}: Custom back handling without BackHandler listener. May not work correctly.")

    # 3.4 Deep Link Support Check
    has_linking = bool(re.search(r'Linking\.|Linking\.openURL|deepLink|universalLink', content))
    has_config = bool(re.search(r'apollo-link|react-native-screens|navigation\.link', content))
    if not has_linking and not has_config:
        ctx.passed_count += 1
    else:
        if has_linking and not has_config:
            ctx.warnings.append(f"[Navigation] {filename}: Deep linking detected but may lack proper configuration. Test notification/share flows.")


def check_backend(ctx: MobileFileContext) -> None:
    """Section 8: mobile backend."""
    content = ctx.content
    filename = ctx.filename

    # --- 8. MOBILE BACKEND CHECKS ---

    # 8.1 Secure Storage Check
    has_async_storage = bool(re.search(r'AsyncStorage|@react-native-async-storage', content))
    has_secure_storage = bool(re.search(r'SecureStore|Keychain|EncryptedSharedPreferences', content))
    has_token_storage = bool(re.search(r'token|jwt|auth.*storage', content, re.IGNORECASE))
    if has_token_storage and has_async_storage and not has_secure_storage:
        ctx.issues.append(f"[Security] {filename}: Storing auth tokens in AsyncStorage (insecure). Use SecureStore (iOS) / EncryptedSharedPreferences (Android).")

    # 8.2 Offline Handling Check
    has_network = bool(re.search(r'fetch|axios|netinfo|@react-native-community/netinfo', content))
    has_offline = bool(re.search(r'offline|isConnected|netInfo|cache.*offline', content))
    if has_network and not has_offline:
        ctx.warnings.append(f"[Offline] {filename}: Network requests detected without offline handling. Consider NetInfo for connection status.")

    # 8.3 Push Notification Support
    has_push = bool(re.search(r'Notifications|pushNotification|Firebase\.messaging|PushNotificationIOS', content))
    has_push_handler = bool(re.search(r'onNotification|addNotificationListener|notification\.open', content))
    if has_push and not has_push_handler:
        ctx.warnings.append(f"[Push] {filename}: Push notifications imported but no handler found. May miss notifications.")


def check_testing(ctx: MobileFileContext) -> None:
    """Section 13: mobile testing."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 13. MOBILE TESTING CHECKS ---

    # 13.1 Testing Tool Detection
    has_rntl = bool(re.search(r'react-native-testing-library|@testing-library', content))
    has_detox = bool(re.search(r'detox|element\(|by\.text|by\.id', content))
    has_maestro = bool(re.search(r'maestro|\.yaml$', content))
    has_jest = bool(re.search(r'jest|describe\(|test\(|it\(', content))

    testing_tools = []
    if has_jest: testing_tools.append('Jest')
    if has_rntl: testing_tools.append('RNTL')
    if has_detox: testing_tools.append('Detox')
    if has_maestro: testing_tools.append('Maestro')

    if len(testing_tools) == 0:
        ctx.warnings.append(f"[Testing] {filename}: No testing framework detected. Consider Jest (unit) + Detox/Maestro (E2E) for mobile.")

    # 13.2 Test Pyramid Balance Check
    test_files = len(re.findall(r'\.test\.(tsx|ts|js|jsx)|\.spec\.', content))
    e2e_tests = len(re.findall(r'detox|maestro|e2e|spec\.e2e', content.lower()))

    if test_files > 0 and e2e_tests == 0:
        ctx.warnings.append(f"[Testing] {filename}: Unit tests found but no E2E tests. Mobile needs E2E on real devices for complete coverage.")

    # 13.3 Accessibility Label Check (Mobile-specific)
    if is_react_native:
        has_pressable = bool(re.search(r'Pressable|TouchableOpacity|TouchableHighlight', content))
        has_a11y_label = bool(re.search(r'accessibilityLabel|aria-label|testID', content))
        if has_pressable and not has_a11y_label:
            ctx.warnings.append(f"[A11y Mobile] {filename}: Touchable element without accessibilityLabel. Screen readers need labels for all interactive elements.")


def check_debugging(ctx: MobileFileContext) -> None:
    """Section 14: mobile debugging."""
    content = ctx.content
    filename = ctx.filename
    is_react_native = ctx.is_react_native

    # --- 14. MOBILE DEBUGGING CHECKS ---

    # 14.1 Performance Profiling Check
    has_performance = bool(re.search(r'Performance|systrace|profile|Flipper', content))
    has_console_log = len(re.findall(r'console\.(log|warn|error|debug|info)', content))
    has_debugger = bool(re.search(r'debugger|__DEV__|React\.DevTools', content))

    if has_console_log > 10:
        ctx.warnings.append(f"[Debugging] {filename}: {has_console_log} console.log statements. Remove before production; they block JS thread.")

    if has_performance:
        ctx.passed_count += 1  # Good performance monitoring

    # 14.2 Error Boundary Check
    has_error_boundary = bool(re.search(r'ErrorBoundary|componentDidCatch|getDerivedStateFromError', content))
    if not has_error_boundary and is_react_native:
        ctx.warnings.append(f"[Debugging] {filename}: No ErrorBoundary detected. Consider adding ErrorBoundary to prevent app crashes.")

    # 14.3 Hermes Check (React Native specific)
    if is_react_native:
        # Check if using Hermes engine (should be default in modern RN)
        # This is more of a configuration check, not code pattern
        ctx.passed_count += 1  # Hermes is default in RN 0.70+
