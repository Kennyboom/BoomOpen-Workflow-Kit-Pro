# Dynamic Consequence-Driven Questioning & 2026 Architecture Defaults (v5.5.0)

> **PRINCIPLE**: Inspect the repository and prior `RESEARCH`/`SCOUT` artifacts **first** (`autonomous_first`). Ask a question **only** when it resolves a genuine, irreversible product or architectural fork that cannot be inferred from workspace context.

---

## 1. `autonomous_first` vs. `socratic_first` Clarification Matrix

| Execution Context | Action Rule | Why |
|-------------------|-------------|-----|
| **Sub-Agent Shard (`:hard` / `:team`)** | **0 Blocking Questions** — choose the 2026 `(Recommended)` default that fits `SCOUT` manifests, log `[ASSUMPTION-01..N]` in Block 1, and compare alternatives in Block 2/4. | Sub-agents run asynchronously and must return complete artifacts without stalling the swarm. |
| **Primary Agent (`autonomous_first` Default)** | **Ground First** (`package.json`, `./documents/`, schemas). If no P0 irreversible fork exists, synthesize the blueprint using `(Recommended)` defaults and surface `0–2` optional forks in `HANDOFF_BRIEF`. If a true P0 fork blocks scope, call `ask_question` (`1–3` questions). | Respects user velocity while eliminating guesswork. |
| **Primary Agent (`socratic_first` / `/grill-me`)** | Ground in manifests first (never ask what stack is already installed!), then call `ask_question` with `2–3` high-leverage P0/P1 trade-off questions. | Aligns interactive discovery with explicit user preference. |

---

## 2. Antigravity 2.0 Native `ask_question` Tool Pattern

When a P0 question is warranted in interactive mode, prefer the native `ask_question` UI widget over walls of prose:
- **Unnumbered options** (the UI numbers them automatically).
- **Omit `'Other'`** (the UI adds a free-text `'Other'` choice automatically).
- **Prefix the best default with `(Recommended)`** in position `0`, including brief cost/complexity rationale.

```json
{
  "questions": [
    {
      "question": "Which authentication & tenant model should back the MVP?",
      "is_multi_select": false,
      "options": [
        "(Recommended) Better Auth (self-hosted TypeScript, OAuth 2.1 + Passkeys + Org RBAC in our Postgres DB, $0 MAU tax)",
        "Supabase Auth + Postgres RLS (integrated JWT-to-RLS policies, fastest if already on Supabase)",
        "Managed SaaS Auth (Clerk / Auth0 — prebuilt enterprise SSO UI, per-MAU cost above free tier)"
      ]
    }
  ]
}
```

---

## 3. Question Filtering Algorithm (Delete Low-Leverage Questions)

1. **Step 1 — Check Repo Ground Truth**: Is the answer already in `package.json`, `.env.example`, `prisma/schema.prisma`, `src/db/schema.ts`, or `./DESIGN.md`? → **DO NOT ASK; pin it!**
2. **Step 2 — Check Reversibility (Two-Way vs. One-Way Door)**:
   - *Two-way door* (button copy, minor animation curve, internal folder helper) → **Pick 2026 best practice; do not ask.**
   - *One-way door* (multi-tenant isolation model, payment Merchant-of-Record vs. direct Stripe, authoritative multiplayer netcode vs. turn-based REST, destructive schema cutover) → **Candidate P0 fork.**
3. **Step 3 — Frame Consequence & Default**: Every question or `[ASSUMPTION]` must state **Impact** (latency, COGS at `10k DAU`, engineering days, lock-in) and **2026 Default**.

---

## 4. 2026 Domain Trade-Off Banks & `(Recommended)` Defaults

### A. Authentication, Sessions & Multi-Tenancy
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended)` Better Auth + OAuth 2.1 / Passkeys** | Owns user/org tables in your DB, zero per-MAU fee, native TypeScript plugins (2FA, Passkeys, Orgs) | Self-managed transactional email provider | Full-stack TypeScript / Next.js / Hono SaaS |
| **Supabase Auth + Postgres RLS** | Row-Level Security enforced directly in Postgres via JWT claims | Coupled to Supabase Postgres conventions | Data-centric & realtime Supabase apps |
| **Managed Identity (Clerk / WorkOS / Auth0)** | Drop-in SAML/SCIM enterprise directory sync in hours | Steep MAU/enterprise tier cost at consumer scale | B2B Enterprise SSO-first MVPs |

### B. Database Engine & Type-Safe ORM
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended)` Drizzle ORM + PostgreSQL (Neon / Supabase)** | SQL-transparent, zero-rust-binary cold starts on Edge/Serverless, instant `$inferSelect` contracts, branching | Requires explicit SQL migration discipline | Default SaaS, APIs, AI(`pgvector`) & transactional apps |
| **Turso (libSQL) / Cloudflare D1 + Drizzle** | Sub-10ms edge read replicas / per-tenant isolated SQLite databases | Single-writer concurrency ceiling per DB shard | Edge-heavy read workloads & per-tenant DB isolation |
| **Prisma ORM + PostgreSQL** | Declarative `.prisma` schema DSL & rich studio ecosystem | Heavier runtime bundle than Drizzle | Teams standardized on existing `schema.prisma` |

### C. Object Storage, Media & Asset Delivery
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended)` Cloudflare R2 (S3-Compatible + Presigned URLs)** | **$0 egress bandwidth fees**, S3 SDK compatible, global edge caching | Image transforms billed separately via Workers/Images | User uploads, media-heavy apps, AI artifacts & backups |
| **AWS S3 + CloudFront CDN** | Deep IAM/VPC lifecycle & Glacier archival tiers | Egress fees (`~$0.085/GB`) spike on viral media | AWS-native enterprise workloads |
| **Supabase Storage** | Integrated with Postgres RLS bucket policies | Higher per-GB cost at multi-TB scale | Rapid Supabase MVPs (`< 50GB`) |

### D. Realtime Streaming, AI Token Delivery & Multiplayer
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended for AI/Feeds)` Server-Sent Events (SSE)** | Standard HTTP/2+, automatic browser reconnect, zero stateful WS proxy pain, native Edge support | Unidirectional (`Server -> Client`; pair with `POST` mutations) | LLM token streaming, live dashboards, notifications |
| **`(Recommended for Collab/Games)` WebSockets + Durable Objects / Colyseus / PartyKit** | Sub-50ms bidirectional state sync, hibernation API cuts idle memory cost by ~90% | Requires room sharding & server-authority validation | Multiplayer games, CRDT collaborative editors, live cursors |
| **Supabase Realtime / Upstash Redis PubSub** | Quick Postgres CDC broadcast & presence channels | Throughput/connection tier limits at high CCU | Presence & moderate-frequency collaborative SaaS |

### E. Frontend Styling, Design Tokens & Motion
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended)` Tailwind CSS v4 (`@theme inline`) + OKLCH Tokens + Radix/shadcn** | Zero-JS CSS variables, uniform perceptual contrast across light/dark modes, 100% shard-lockable `DESIGN_CONTRACT` | Requires strict Anti-AI-Slop aesthetic archetype lock | All modern Web & Tauri v2 Desktop/Mobile UIs |
| **CSS View Transitions API + Motion v12 Springs** | Compositor-accelerated `transform`/`opacity` layout morphs + native `prefers-reduced-motion` | Avoid animating layout props (`width`/`top`/`height`) | Interactive dashboards, editorial & consumer web apps |

### F. Monetization, Billing & AI Cost Control
| Option | Strengths | Trade-Offs | 2026 Default For |
|--------|-----------|------------|------------------|
| **`(Recommended Global Indie/SaaS)` Merchant of Record (Polar / LemonSqueezy / Paddle)** | Automates global EU VAT / US sales tax remittance & compliance | ~4–5% + $0.50 fee vs. raw card processing | Global self-serve SaaS & developer tools |
| **`(Recommended Custom/Enterprise)` Stripe Billing + Webhooks** | Lowest base fee (2.9% + $0.30), metered usage-based AI token billing, Connect payouts | Must configure Stripe Tax + tax registrations | Usage-metered AI platforms, marketplaces & enterprise |
| **Hybrid Rule Engine + Tiered/Prompt-Cached LLM** | Deterministic logic handles 85–90% of events; prompt caching + small models cut inference COGS by 80%+ | Requires explicit router & token budget guardrails | Every AI-native product or game at `10k+ DAU` |
