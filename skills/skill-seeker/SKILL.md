---
name: skill-seeker
description: Core skill used to search and discover the 1,440 specialized library skills (1,462 total indexed skills in compact-index.json) without bloating context.
version: "5.5.0"
---

# Skill Seeker — 2-Step O(1) Progressive Skill Lookup (v5.5.0)

> **PURPOSE**: Discover and load specialized domain guidance from BoomOpen's **1,440 dormant library skills** (`~/.{TOOL}/skills_library/`) alongside the **22 active core skills** (`~/.{TOOL}/skills/`), totaling **1,462 indexed skills** in `matrix-skills/compact-index.json` — while keeping context consumption minimal.

---

## 1. When to Invoke `skill-seeker`

Use this 2-step lookup protocol whenever a task involves:
- A specialized framework, cloud service, protocol, or engine not covered in sufficient depth by the 22 pre-listed core skills (e.g., Stripe webhooks, Temporal workflows, Drizzle/Supabase RLS, Better Auth, OWASP LLM Agent security, WebGPU/TSL, Unity 6 DOTS, Godot 4 shaders, Terraform/OpenTofu, Kubernetes, BigQuery, HL7/FHIR).
- Assigning domain-specific skill pointers inside a Mode B **5-Field Handoff Packet** so specialist sub-agents (`backend-engineer#1`, `frontend-engineer#1`, `security-engineer`, etc.) load the exact `1–3` relevant `SKILL.md` files on Turn 1.

---

## 2. Mandatory 2-Step O(1) Lookup Protocol (`rules/SKILLS.md`)

> ⛔ **ANTI-CRAWLING RULE**: **NEVER** glob or read dozens of `SKILL.md` files across `skills_library/` sequentially! Always resolve via the pre-compiled index first, then load **at most `1–3` matched `SKILL.md` files** per task/shard.

### Step 1 — Query the Pre-Compiled Index (`compact-index.json` or Domain Matrix)
1. Check the active `<skills>` list in context first (`22` core skills).
2. If a deeper specialist skill is needed, query `~/.{TOOL}/skills/boomopen-workflow-kit/matrix-skills/compact-index.json` (which maps all `22` core + `1,440` library = **`1,462` skills** to `{ domain, priority, category, path }`) using `Grep` / keyword search — or inspect full descriptions and triggers in `~/.{TOOL}/skills/boomopen-workflow-kit/matrix-skills/*.yaml` (`backend.yaml`, `frontend.yaml`, `design.yaml`, `security.yaml`, `ai-ml.yaml`, `mcp.yaml`, `cloud.yaml`, `devops.yaml`, `data.yaml`, `mobile.yaml`, `gaming.yaml`, `quality.yaml`, `architecture.yaml`, `planning.yaml`, `research.yaml`, `performance.yaml`, `languages.yaml`, `management.yaml`, `tools.yaml`).

### Step 2 — Load Only the Exact Matched `SKILL.md` (`1–3` Max)
- Read `~/.{TOOL}/skills_library/<skill-id>/SKILL.md` directly (the installer maps `~/.{TOOL}/` automatically to `~/.gemini/config/`, `~/.claude/`, `~/.codex/`, `~/.cursor/`, or `~/.copilot/`).
- If the matched skill includes helper scripts or `references/*.md` files, load **only** the specific reference file needed for your subtask.

---

## 3. High-Value 2026 Library Skills Quick-Reference

| Domain | High-Signal `skills_library/<skill-id>/SKILL.md` |
|--------|--------------------------------------------------|
| **Frontend & Visual Craft** | `anti-ai-slop-visual-craft`, `tailwind-v4-shadcn-ui`, `shadcn`, `react-19-nextjs-15-rsc`, `nextjs-react-expert` |
| **Backend, Auth & Data** | `better-auth-typescript`, `hono-rpc-zod-openapi`, `drizzle-neon-turso-edge`, `stripe-integration`, `supabase-rls-edge-realtime` |
| **Testing & Accessibility** | `vitest-msw-testing-patterns`, `wcag-22-accessibility-ergonomics`, `performance-profiling` |
| **Security & DevSecOps** | `owasp-llm-agent-security-2025`, `vulnerability-scanner`, `terraform-opentofu-production` |
| **Mobile & Desktop** | `tauri-v2-rust-desktop-mobile`, `ios18-hig-material3-expressive`, `expo-app-design`, `flutter-expert` |
| **Game Engineering** | `unity-6-dots-ecs-architecture`, `godot-4-gdscript-shaders-2d-3d`, `webgpu-wgsl-three-tsl`, `react-three-fiber-rapier-3d`, `multiplayer-netcode-colyseus`, `pixijs-v8-phaser-2d-games` |

---

## 4. Sub-Agent Handoff Integration

When orchestrating Mode B sub-agents (`planner`, `cook`, `code`, `autopilot`), resolve the exact library skill paths once during planning/dispatch and include them in the sub-agent's **5-Field Handoff Packet** (`READ_ONLY_FILES` / Skill Pointers) so each shard loads its specialist `SKILL.md` in `1` deterministic `read_file` call with zero search overhead.
