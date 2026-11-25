---
name: chrome-extension
description: Chrome Extension template principles (2026 Edition). Manifest V3, React 19, TypeScript, Tailwind CSS v4, Vite.
---

# Chrome Extension Template (2026 Edition)

## Tech Stack

| Component | Technology | Version / Notes |
|-----------|------------|-----------------|
| Manifest | Chrome Manifest V3 | Service worker + `sidePanel` + `offscreen` APIs |
| UI | **React 19** | Popup, Side Panel & Options UI |
| Language | TypeScript 5.7+ | Strict typed runtime message contracts |
| Styling | Tailwind CSS v4 | `@import "tailwindcss";` (`@tailwindcss/vite`) |
| Bundler | Vite + CRXJS / WXT | HMR for MV3 popup, side panel & content scripts |
| Storage | `chrome.storage` | `local`, `sync`, and ephemeral `session` storage |

---

## Directory Structure

```
project-name/
├── src/
│   ├── popup/               # Extension toolbar popup (React 19 root)
│   ├── sidepanel/           # Chrome Side Panel UI (React 19 root)
│   ├── options/             # Extension settings page
│   ├── background/          # Event-driven MV3 service worker (no persistent globals)
│   ├── content/             # Isolated-world content scripts
│   ├── components/          # Shared accessible UI primitives
│   └── lib/
│       ├── messaging.ts     # Discriminated-union typed message bus + Zod v4 validation
│       └── storage.ts       # Typed Promise wrappers over `chrome.storage`
├── public/
│   ├── icons/               # 16, 32, 48, 128px PNG icons
│   └── manifest.json        # Manifest V3 declaration
├── vite.config.ts
└── package.json
```

---

## Manifest V3 Architecture Rules

| Surface | Lifecycle & Security Rule |
|---------|---------------------------|
| **Service Worker (`background`)** | Terminates when idle — persist state in `chrome.storage.session` / `chrome.storage.local` and schedule work via `chrome.alarms`, never `setInterval`. |
| **Content Scripts** | Untrusted page boundary — validate every message sent to the service worker with Zod v4 and check `sender.id === chrome.runtime.id`. |
| **Popup / Side Panel** | React 19 UI surfaces rendered under strict extension CSP (`script-src 'self'`; zero remote code execution). |

---

## Least-Privilege Permissions

| Permission | Use Case |
|------------|----------|
| `storage` | Persist extension preferences & session state |
| `activeTab` | Temporary access to the current tab on explicit user gesture (prefer over broad `<all_urls>`) |
| `sidePanel` | Persistent companion panel alongside web pages |
| `scripting` | Programmatic content-script injection when needed |

---

## Setup Steps

1. Scaffold with Vite + React 19 + TypeScript (or `npx wxt@latest init {{name}} --template react`):
   ```bash
   npm create vite@latest {{name}} -- --template react-ts
   cd {{name}}
   npm install zod
   npm install -D @types/chrome tailwindcss @tailwindcss/vite @crxjs/vite-plugin
   ```

2. Configure `manifest.json` (`"manifest_version": 3`) and `vite.config.ts` with `@tailwindcss/vite` and `@crxjs/vite-plugin`.

3. Build & watch during development:
   ```bash
   npm run dev
   ```

4. Load unpacked extension in `chrome://extensions` (Developer Mode enabled → **Load unpacked** → `dist/`).

---

## Best Practices

- **Strict Message Validation**: Treat content scripts as untrusted callers; validate payloads with `z.strictObject({...})` in `chrome.runtime.onMessage`.
- **Zero Remote Code**: Bundle all logic locally (MV3 forbids remote `<script>` loading and `eval`).
- **Minimal Host Permissions**: Request optional host permissions (`chrome.permissions.request`) at point-of-use instead of install-time `<all_urls>`.
