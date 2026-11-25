---
name: electron-desktop
description: Desktop application template principles (2026 Edition). Tauri v2 (primary) or Electron 35+, React 19, TypeScript, Tailwind CSS v4.
---

# Desktop App Template — Tauri v2 & Electron 35+ (2026 Edition)

> **2026 Architecture Choice**: Default to **Tauri v2** (~5–10 MB installers, Rust memory-safe core, capability-scoped ACLs, mobile/desktop parity). Choose **Electron 35+** only when bundling Node.js native addons or requiring identical Chromium rendering across OS versions.

## Tech Stack

| Component | Primary (Recommended) | Alternative (Chromium-Bundled) |
|-----------|-----------------------|--------------------------------|
| Desktop Shell | **Tauri v2** (Rust core + OS WebView) | **Electron 35+** (Node 22+ + Chromium) |
| UI Runtime | **React 19** + TypeScript 5.7+ | **React 19** + TypeScript 5.7+ |
| Styling | Tailwind CSS v4 (`@import "tailwindcss";`) | Tailwind CSS v4 (`@import "tailwindcss";`) |
| Bundler | Vite 6+ + `@tauri-apps/cli` | `electron-vite` + `electron-builder` |
| Native Bridge | `#[tauri::command]` + `invoke<T>()` + Capabilities ACL | `contextBridge.exposeInMainWorld` + typed `ipcMain.handle` |

---

## Directory Structure (Tauri v2 Primary)

```
project-name/
├── src/                         # React 19 Frontend
│   ├── App.tsx
│   ├── globals.css              # Tailwind v4 `@import "tailwindcss"; @theme { ... }`
│   ├── components/
│   │   ├── TitleBar.tsx         # Accessible native/custom window controls
│   │   └── ui/
│   └── lib/
│       └── ipc.ts               # Typed wrappers around `@tauri-apps/api/core` invoke()
├── src-tauri/                   # Rust Backend & Capability Sandbox
│   ├── capabilities/
│   │   └── default.json         # Explicit per-window command & fs scope allowlist
│   ├── src/
│   │   ├── lib.rs               # Command registration & plugin init
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json          # CSP, bundle IDs, updater config
└── package.json
```

*(For **Electron 35+**, replace `src-tauri/` with `electron/{main.ts, preload.ts, ipc/}` enforcing `contextIsolation: true`, `sandbox: true`, and `nodeIntegration: false`.)*

---

## Security & IPC Guardrails (Mandatory)

| Boundary | Tauri v2 Rule | Electron 35+ Rule |
|----------|---------------|-------------------|
| **Command Surface** | Scope every plugin/command in `src-tauri/capabilities/*.json`; never grant unscoped filesystem or shell access. | Expose narrow domain methods via `contextBridge`; **never** expose raw `ipcRenderer` or `process.env` to the renderer. |
| **Input Validation** | Deserialize typed Rust structs (`serde`) and canonicalize file paths within app data roots. | Validate every `ipcMain.handle` payload with Zod v4 (`z.strictObject`) and verify `event.senderFrame.url`. |
| **Navigation & CSP** | Define strict `security.csp` in `tauri.conf.json`. | Intercept `will-navigate` and `setWindowOpenHandler` to block arbitrary external URLs inside privileged windows. |

---

## Setup Steps

### Option A: Tauri v2 + React 19 (Recommended)
```bash
npm create tauri-app@latest {{name}} -- --template react-ts
cd {{name}}
npm install -D tailwindcss @tailwindcss/vite
npm run tauri dev
```

### Option B: Electron 35+ + React 19 (`electron-vite`)
```bash
npm create @quick-start/electron@latest {{name}} -- --template react-ts
cd {{name}}
npm install zod
npm install -D electron@latest tailwindcss @tailwindcss/vite
npm run dev
```

---

## Build Targets

| Platform | Tauri v2 Output | Electron 35+ Output |
|----------|-----------------|---------------------|
| Windows | `.msi`, NSIS `.exe` (WebView2) | NSIS `.exe`, Portable |
| macOS | Universal `.dmg`, `.app` (Notarized) | Universal `.dmg`, `.zip` |
| Linux | `.AppImage`, `.deb`, `.rpm` | `.AppImage`, `.deb` |
