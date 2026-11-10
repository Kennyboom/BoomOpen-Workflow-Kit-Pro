---
description: Preview server start, stop, and status check. Local development server management.
category: operations
execution-mode: execute
version: "5.5"
---

# /preview — Local Dev & Multi-Service Preview Manager (v5.5)

> **MISSION**: Start, stop, restart, and health-check local preview servers deterministically using the kit's portable `auto_preview.py` runner (or Antigravity 2.0 background daemon tasks), resolving port conflicts and multi-service dev startup issues cleanly.

<task>$ARGUMENTS</task>

---

## 🎮 Supported Subcommands

| Command | Action |
|---------|--------|
| `/preview` or `/preview status` | Inspect active preview URL, project type, PID, and listener health |
| `/preview start [port]` | Detect framework, verify free port, launch server, and wait until listening |
| `/preview stop` | Gracefully terminate the managed preview server |
| `/preview restart [port]` | Stop active preview instance and start a fresh server |
| `/preview check` | Deterministic health probe (exits `0` **only** when running and accepting connections) |

---

## 🛠️ Phase 1: Portable `auto_preview.py` Execution (Single-App Mode A)

Run the kit's built-in helper from the project root via `run_command` (use `python3` on macOS/Linux; always invoke the portable `~/.{TOOL}/skills/boomopen-workflow-kit/scripts/` path):

```bash
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py start [port]
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py stop
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py status
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py check   # exit 0 only if running and listening
```

### Daemon Lifecycle & Port-Conflict Protocol
1. **Fallback Daemon Mode (Antigravity 2.0)**: If `auto_preview.py` is unavailable or a custom workspace runner (`npm run dev`, `pnpm dev`, `cargo tauri dev`) is launched directly via `run_command`, **always** pass `IsDaemon: true` and `WaitMsBeforeAsync: 5000`, and manage its lifecycle via `manage_task(Action: "list" | "status" | "kill")` — never block the turn or sleep in a shell loop!
2. **Port Conflict Resolution**:
   - When the default port (`3000`, `5173`, `8080`) is already bound:
     - **Option 1 (Default Safe Path)**: Start on the next free port (`python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py start 3001`).
     - **Option 2 (Interactive Choice)**: Call `ask_question` before killing an unrecognized local process bound to that port.

---

## 🌊 Phase 2: Multi-Service Preview & Startup Repair (`> 2` Files — Mode B Shards)

When previewing a full-stack/monorepo workspace (`apps/web` + `apps/api` + proxy/env) **or** fixing broken dev-server/bundler configs spanning **`> 2` files**:

1. **Lock `SHARED_CONTRACT`**:
   ```ts
   // Local Preview Port & Origin Contract
   export const PREVIEW_PORTS = { web: 3000, api: 4000 } as const;
   export const ALLOWED_DEV_ORIGIN = 'http://localhost:3000';
   export const HEALTH_ENDPOINT = 'http://localhost:4000/api/health';
   ```
2. **Parallel 0-Turn Sub-Agent Shards**: Dispatch isolated shards on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` with disjoint **`OWNED_FILES` (`≤ 3–4` config/startup files per shard)** and **`READ_ONLY_FILES`** locking business logic and test suites:
   - `devops-engineer#web-preview`: Vite/Next.js config, `.env.local` public URLs, dev proxy rewrites (`≤ 3–4` files).
   - `devops-engineer#api-preview`: API server bootstrap, CORS dev origin allowlist, `/api/health` endpoint (`≤ 3–4` files).
   - Track `role#shard -> conversationId` and reuse warm shard sessions via `send_message(Recipient: conversationId)` if startup logs report follow-up build/env errors.

---

## ✅ Phase 3: Mandatory Health & Code-Quality Verification

Whenever any configuration or startup file was created or edited (`> 0` modified files), verify both Pragmatic 2-Tier code standards and live HTTP readiness end-to-end before reporting back:

```bash
# 1. Verify Pragmatic 2-Tier standards & zero stubs on any edited directory
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <edited-dir> --strict-phase --no-stubs

# 2. Confirm live listener readiness (exit code 0 required)
python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py check
```

### Standard Status Output
```text
=== Preview Status ===
🌐 URL:     http://localhost:3000
📁 Project: <workspace-root>
🏷️ Stack:   <detected-framework>
💚 Health:  OK (HTTP 200 / listening verified)
```

If startup still fails after 2 automated repair passes, route root-cause investigation to `/debug:hard` with the captured server log snippet.
