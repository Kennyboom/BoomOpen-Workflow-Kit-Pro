---
name: react-native-app
description: React Native mobile app template principles (2026 Edition). Expo SDK 54+, React 19, Expo Router, NativeWind.
---

# React Native App Template (2026 Edition)

Modern iOS 18 (`44pt` targets) & Android Material 3 Expressive (`48dp` targets) mobile app template powered by Expo SDK 54+, New Architecture (Fabric + TurboModules), and React 19.

## Tech Stack

| Component | Technology | Version / Notes |
|-----------|------------|-----------------|
| Core | React Native + Expo | **Expo SDK 54+** (New Architecture enabled by default) |
| Language | TypeScript | v5.7+ (`strict: true`) |
| UI Runtime | React | **React 19** (React Compiler supported) |
| Navigation | Expo Router | v5+ (Typed file-based routes, Universal Links) |
| Styling | NativeWind | v4.1+ / v5 (Tailwind CSS token alignment via `global.css`) |
| Client & Server State | Zustand + TanStack Query | v5+ (Offline-ready query persistence) |
| Secure Storage | `expo-secure-store` + MMKV | Keychain/Keystore secrets + fast local cache |

---

## Directory Structure

```
project-name/
├── app/                     # Expo Router (Typed file-based routing)
│   ├── _layout.tsx          # Root Layout (Providers, fonts, `./global.css` import)
│   ├── index.tsx            # Entry route / auth gate
│   ├── (tabs)/              # Bottom tab navigation group
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   └── profile.tsx
│   ├── +not-found.tsx       # 404 screen
│   └── [id].tsx             # Typed dynamic route
├── components/
│   ├── ui/                  # Accessible touch primitives (>= 44pt/48dp hit targets)
│   └── features/            # Domain screen components
├── hooks/                   # Custom hooks
├── lib/
│   ├── api.ts               # Typed fetch / Hono RPC client
│   └── storage.ts           # SecureStore wrapper for auth tokens
├── store/                   # Zustand slices
├── assets/                  # Adaptive icons, splash, fonts
├── global.css               # Tailwind / NativeWind CSS entry point
├── metro.config.js          # Metro wrapped with `withNativeWind`
├── babel.config.js          # `jsxImportSource: "nativewind"` preset
└── app.json                 # Expo SDK 54+ config (`experiments.typedRoutes: true`)
```

---

## Key Packages & Purpose

| Package | Purpose |
|---------|---------|
| `expo-router` | File-based navigation with deep links & typed routes |
| `nativewind` + `tailwindcss` | Utility-first styling aligned with web `@theme` design tokens |
| `react-native-reanimated` | 60/120fps UI-thread spring animations |
| `react-native-safe-area-context` | Notch, Dynamic Island & gesture-bar inset handling |
| `@tanstack/react-query` | Server state caching, optimistic updates & offline retry |
| `zustand` | Lightweight synchronous UI state |
| `expo-image` | Memory-efficient cached image rendering |

---

## Setup Steps (Expo SDK 54+ Standard)

1. Initialize Project:
   ```bash
   npx create-expo-app@latest {{name}}
   cd {{name}}
   ```

2. Install Core Expo Modules (version-matched to SDK 54+):
   ```bash
   npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar expo-secure-store expo-image react-native-reanimated
   ```

3. Install & Configure NativeWind + Tailwind CSS:
   ```bash
   npx expo install nativewind tailwindcss
   ```
   - Wrap Metro in `metro.config.js` with `withNativeWind(config, { input: './global.css' })`.
   - Import `'../global.css'` (or `'./global.css'`) at the top of `app/_layout.tsx`.

4. Start Development Build / Simulator:
   ```bash
   npx expo start -c
   ```

---

## Best Practices (2026 Standards)

- **New Architecture First**: Expo SDK 54+ runs Fabric and TurboModules by default — avoid legacy bridge-only libraries.
- **Touch Target & Safe-Area Ergonomics**: Enforce minimum `44x44pt` (iOS) / `48x48dp` (Android) hitboxes (`hitSlop` on compact icons) and wrap screens with safe-area insets.
- **Typed Routes**: Enable `experiments: { typedRoutes: true }` in `app.json` for compile-time route safety.
- **Never Store Secrets in `EXPO_PUBLIC_*`**: Only public endpoints/publishable keys belong in `EXPO_PUBLIC_*`; store user tokens in `expo-secure-store`.
