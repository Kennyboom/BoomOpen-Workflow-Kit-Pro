# Project Templates (15)

> Quick-start 2026 templates for scaffolding greenfield projects. This file is an index (`INDEX.md`, not a standalone skill) so nested templates never pollute IDE `<skills>` lists.

---

## 🎯 Selective Reading Rule

**Read ONLY the template matching the user's project type!**

| Template | Tech Stack | When to Use |
|----------|------------|-------------|
| [nextjs-fullstack](nextjs-fullstack/TEMPLATE.md) | Next.js 16 + Drizzle/Prisma + Tailwind v4 | Full-stack web app |
| [nextjs-saas](nextjs-saas/TEMPLATE.md) | Next.js 16 + Stripe + Better Auth + Tailwind v4 | SaaS product |
| [nextjs-static](nextjs-static/TEMPLATE.md) | Next.js 16 + Motion v12 + Tailwind v4 | Editorial / landing page |
| [astro-static](astro-static/TEMPLATE.md) | Astro + MDX | Blog / documentation site |
| [nuxt-app](nuxt-app/TEMPLATE.md) | Nuxt + Pinia | Vue full-stack app |
| [express-api](express-api/TEMPLATE.md) | Hono / Express + Zod v4 OpenAPI | Node / Edge REST API |
| [python-fastapi](python-fastapi/TEMPLATE.md) | Python 3.12+ + `uv` + FastAPI + `pwdlib[argon2]` | Python API / AI service |
| [mcp-server](mcp-server/TEMPLATE.md) | `@modelcontextprotocol/sdk` + Hono / `FastMCP` + OAuth 2.1 | **2026 MCP Server & MCP App** |
| [ai-agent-worker](ai-agent-worker/TEMPLATE.md) | Cloudflare Agents SDK + Durable Objects / OpenAI & Claude Agent SDKs | **2026 Stateful AI Agent Worker** |
| [react-native-app](react-native-app/TEMPLATE.md) | Expo SDK 54+ + React 19 + NativeWind + Zustand | iOS / Android mobile app |
| [flutter-app](flutter-app/TEMPLATE.md) | Flutter + Riverpod | Cross-platform mobile app |
| [electron-desktop](electron-desktop/TEMPLATE.md) | Tauri v2 (primary) / Electron 35+ + React 19 | Desktop application |
| [chrome-extension](chrome-extension/TEMPLATE.md) | Chrome MV3 + React 19 + Vite | Browser extension |
| [cli-tool](cli-tool/TEMPLATE.md) | Node.js + TypeScript | Developer CLI tool |
| [monorepo-turborepo](monorepo-turborepo/TEMPLATE.md) | Turborepo + pnpm workspaces | Multi-package monorepo |

---

## Usage

1. User asks to create a new project of `[type]`
2. Match to the closest template in the table above
3. Read **only** that template's `TEMPLATE.md`
4. Follow its 2026 tech stack, directory structure, and verification steps
