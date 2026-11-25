---
name: mcp-server
description: 2026 Model Context Protocol (MCP) Server & interactive MCP App template. @modelcontextprotocol/sdk + TypeScript + Hono or Python FastMCP, Streamable HTTP, OAuth 2.1, Zod v4.
---

# MCP Server & MCP App Template (2026 Edition)

> Production blueprint for building **Model Context Protocol (MCP)** tool/resource servers and interactive **MCP Apps** (`ui://` HTML views) over **Streamable HTTP** (`/mcp`) and local `stdio`.

## Tech Stack

| Component | TypeScript / Edge Stack (Primary) | Python Stack (Alternative) |
|-----------|-----------------------------------|----------------------------|
| MCP SDK | `@modelcontextprotocol/sdk` (`McpServer`, `StreamableHTTPServerTransport`) | `mcp` (`FastMCP`, `uv` + Python 3.12+) |
| Interactive UI | `@modelcontextprotocol/ext-apps` (`ui://` HTML resource views) | `ui://` resource templates |
| HTTP Router | `Hono` (Node 24 LTS, Cloudflare Workers, Bun) | Starlette / ASGI (`mcp.streamable_http_app()`) |
| Schema Validation | **Zod v4** (`z.strictObject`, `z.uuid()`, `z.iso.datetime()`) | **Pydantic v2** (`Field(...)`, strict types) |
| Auth (Remote HTTP) | **OAuth 2.1 Resource Server** (`/.well-known/oauth-protected-resource` + PKCE `S256` Bearer verification) | OAuth 2.1 `TokenVerifier` + scoped claims |

---

## Directory Structure (TypeScript + Hono + MCP Apps)

```
project-name/
├── src/
│   ├── index.ts                 # HTTP entrypoint (/mcp Streamable HTTP + /health)
│   ├── stdio.ts                 # Optional local stdio entrypoint for desktop IDE hosts
│   ├── server.ts                # McpServer factory registering tools, resources & prompts
│   ├── auth/
│   │   └── oauth-verifier.ts    # OAuth 2.1 JWT/introspection & scope enforcement
│   ├── schemas/
│   │   └── tools.contract.ts    # Wave 1 locked Zod v4 inputSchema / outputSchema
│   ├── tools/
│   │   ├── search-items.ts      # Read-only tool (readOnlyHint: true)
│   │   └── mutate-item.ts       # Destructive/write tool (destructiveHint: true + auth scope)
│   ├── resources/
│   │   └── ui-dashboard.ts      # Interactive MCP App view (ui://app/dashboard)
│   └── ui/                      # Bundled single-file HTML/React widget for MCP App host
├── tests/
│   └── mcp-server.test.ts       # InMemoryTransport / Streamable HTTP integration tests
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Core 2026 MCP Patterns

### 1. Zod v4 Tool Registration with Behavioral Annotations & Structured Output

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerOrderTools(server: McpServer): void {
  server.registerTool(
    'get_order_status',
    {
      title: 'Get Order Status',
      description: 'Fetch tenant-scoped order status by UUID without mutating state.',
      inputSchema: {
        orderId: z.uuid().describe('Target order UUID'),
      },
      outputSchema: {
        id: z.uuid(),
        status: z.enum(['pending', 'paid', 'shipped']),
        updatedAt: z.iso.datetime(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ orderId }, extra) => {
      const order = { id: orderId, status: 'paid' as const, updatedAt: new Date().toISOString() };
      return {
        content: [{ type: 'text', text: JSON.stringify(order) }],
        structuredContent: order,
      };
    }
  );
}
```

### 2. Interactive MCP App Resource (`ui://` View)

Pair a tool with a `ui://` HTML resource (`mimeType: "text/html;profile=mcp-app"`) and attach `_meta: { ui: { resourceUri: "ui://orders/inspector" } }` on the tool definition so supporting hosts (Antigravity, Claude, VS Code) render an interactive themed UI inline.

---

## Security & Protocol Guardrails

- **Streamable HTTP over Legacy SSE**: Expose a single `/mcp` endpoint using `StreamableHTTPServerTransport` (MCP 2025-03-26+ / 2026 standard); do not build new servers on deprecated dual-endpoint SSE.
- **Zero `console.log` on `stdio`**: When running over `stdio`, stdout is reserved exclusively for JSON-RPC frames — write all structured logs to `stderr` (`pino(process.stderr)`).
- **OAuth 2.1 + Tenant Isolation**: Never pass raw upstream database credentials in tool arguments; derive `tenantId`/`userId` from the verified OAuth 2.1 access token (`extra.authInfo`) and enforce allowlisted roots/URLs against SSRF and path traversal.
- **Human-in-the-Loop Annotations**: Always set `annotations.destructiveHint: true` on state-deleting or external-side-effect tools.

---

## Setup & Verification Steps

### TypeScript (`@modelcontextprotocol/sdk` + Hono)
```bash
mkdir {{name}} && cd {{name}}
npm init -y
npm install @modelcontextprotocol/sdk hono @hono/node-server zod
npm install -D typescript tsx @types/node vitest
npx @modelcontextprotocol/inspector npx tsx src/stdio.ts
```

### Python (`FastMCP` + `uv`)
```bash
uv init {{name}} --python 3.12 && cd {{name}}
uv add "mcp[cli]" httpx pydantic-settings
uv add --dev pytest pytest-asyncio ruff
uv run mcp dev src/server.py
```
