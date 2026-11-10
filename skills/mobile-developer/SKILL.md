---
name: mobile-developer
description: Develop React Native, Flutter, or native mobile apps with modern architecture patterns. Masters cross-platform development, native integrations, offline sync, and app store optimization.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: "5.5.0"
---

# Mobile Developer — Cross-Platform, Native & Tauri v2 Mobile Engineering (v5.5.0)

> **PURPOSE**: Build 60–120 FPS mobile applications across **React Native 0.76+ (New Architecture: Fabric + TurboModules + JSI / Expo SDK 52+)**, **Flutter 3.x (Impeller + Dart 3)**, **Native iOS 18 (Swift 6 / SwiftUI)**, **Android (Kotlin / Material 3 Expressive)**, and **Tauri v2 Mobile** — governed by **3-Wave Contract-First Sharding (`<= 3–4 OWNED_FILES`/shard)** and deterministic CLI verification.

---

## 🔧 Mandatory Verification Gates

| Tool / CLI | Purpose | Canonical Command |
|------------|---------|-------------------|
| `mobile_audit.py` | 50+ checks across touch targets (`44pt` iOS / `48dp` Android), list virtualization, Reanimated/`useNativeDriver`, safe areas, OLED dark surfaces, and Keychain/Keystore storage | `python ~/.{TOOL}/skills/mobile-design/scripts/mobile_audit.py <project_path>` |
| `boomopen check` | Pragmatic 2-Tier code gate (`Soft 400 / Hard 500` lines, `0` explicit `any`, `0` `console.log`, `0` `TODO`/stubs) | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target_dir> --strict-phase --no-stubs` |
| `boomopen design` | Validate `DESIGN-{task}.md` 6-Block mobile token & 5-State UI contract before coding | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js design validate <DESIGN.md>` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.

---

## 1. 3-Wave Contract-First Mobile Sharding (`/cook`, `/code`, `/autopilot`)

Never mix navigation shells, native bridge/storage layers, and feature screens inside a single overloaded agent! Decompose mobile features into **3 deterministic waves** (`<= 3–4 OWNED_FILES` per `mobile-engineer#<shard>`):

1. **Wave 1 — `SHARED_CONTRACT` & `DESIGN_CONTRACT` Lock**:
   - Lock API DTOs, offline sync SQLite/Realm/Drift schemas, deep-link route types, and the 6-Block `DESIGN-{task}.md` tokens (spacing, safe-area insets, typography scale, OLED elevation surfaces, spring motion tokens).
2. **Wave 2 — Parallel Feature & Platform Shards (`<= 3–4 OWNED_FILES`/shard)**:
   - `mobile-engineer#data`: Offline-first repository, optimistic mutation queue, Keychain / SecureStore auth adapter.
   - `mobile-engineer#screens`: Screen views, virtualized lists (`FlashList` / `FlatList` / `SliverList`), and **5-State Mobile UI Matrix** (`Default`, `Loading` skeleton, `Empty`, `Error` retry, `Offline/Disabled`).
   - `mobile-engineer#native`: Camera/biometrics/push notifications (`APNs` / `FCM`), haptics, Live Activities / Widgets, or Tauri v2 Rust commands.
3. **Wave 3 — Device, Ergonomics & Static Verification**:
   - Execute `mobile_audit.py`, `boomopen check --strict-phase --no-stubs`, unit/widget tests (`vitest` / `jest` / `flutter test`), and Maestro / Detox / Patrol E2E flows.

---

## 2. 2026 Platform & Performance Standards

### React Native (New Architecture) & Expo
- Default to **Fabric + TurboModules + Hermes**; use `expo-router` typed routes, `@shopify/flash-list` (or memoized `FlatList` with stable `keyExtractor` — **never** `.map()` inside `ScrollView` for dynamic collections!), and `react-native-reanimated` worklets animating `transform` and `opacity` on the UI thread.
- Persist auth tokens and secrets strictly in **`expo-secure-store` / `react-native-keychain`** — **NEVER** store tokens in unencrypted `AsyncStorage`!

### Flutter 3.x & Dart 3
- Target the **Impeller** rendering engine for zero shader-compilation jank; use sealed classes + pattern matching in Dart 3, Riverpod / Bloc state isolation, `const` widget constructors, and `ListView.builder` / `CustomScrollView` slivers.
- Respect `MediaQuery.textScalerOf(context)` so Dynamic Type / accessibility font scaling never clips text.

### Native iOS 18, Android Material 3 Expressive & Ergonomics
- **Touch Targets & Thumb Zone**: Minimum **`44x44pt` (iOS HIG)** and **`48x48dp` (Material 3)** with `>= 8px` inter-target spacing; keep primary CTAs in the bottom thumb-reachable zone respecting `SafeAreaView` / WindowInsets (`top` Dynamic Island + `bottom` home indicator + keyboard avoidance).
- **Predictive Back & Deep Links**: Support Android 14/15 predictive back gestures, iOS interactive pop gestures, Universal Links, and Android App Links.
- **OLED Surface Hierarchy**: Avoid smearing pure `#000000` adjacent to high-contrast borders when elevated; step dark surfaces cleanly (`#0B0D10` → `#12161C` → `#1A2029`) with WCAG 2.2 AA contrast.

---

## 3. Offline-First Sync & MASVS Security Checklist

- **Offline Resilience**: Queue mutations locally in SQLite (Drizzle Expo / WatermelonDB / Drift) with idempotency keys, exponential backoff retry, and deterministic conflict resolution; surface non-blocking offline banners instead of modal crashes.
- **OWASP MASVS Controls**: Enforce TLS 1.3 / ATS, biometric gate (`FaceID` / `TouchID` / `BiometricPrompt`) for sensitive actions, deep-link parameter validation, privacy manifest (`PrivacyInfo.xcprivacy` / Play Data Safety), and zero leftover debug logs in release builds.

---

## 4. Companion Skills

- **Mobile UI/UX & 6-Block Spec**: `../mobile-design/SKILL.md` (`skills/mobile-design/SKILL.md`)
- **Pragmatic 2-Tier Clean Code**: `../clean-code/SKILL.md` (`skills/clean-code/SKILL.md`)
- **API & Sync Contracts**: `../api-patterns/SKILL.md` (`skills/api-patterns/SKILL.md`)
