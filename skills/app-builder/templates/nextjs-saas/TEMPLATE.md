---
name: nextjs-saas
description: Next.js SaaS template principles (2026 Standards). React 19, Server Actions, Better Auth, Stripe, Tailwind v4.
---

# Next.js SaaS Template (2026 Edition)

## Tech Stack

| Component | Technology | Version / Notes |
|-----------|------------|-----------------|
| Framework | Next.js | v16+ (App Router, React Compiler, Turbopack) |
| Runtime | Node.js | v24 (Krypton LTS) |
| Auth | Better Auth | `better-auth` (OAuth 2.1, Passkeys, 2FA, Organizations) |
| Payments | Stripe API | Checkout, Customer Portal & signed Webhooks |
| Database | PostgreSQL | Drizzle ORM or Prisma v6 (Serverless Driver) |
| Validation | Zod | v4 (`z.strictObject`, `z.uuid()`, `z.email()`) |
| Email | Resend | React Email |
| UI | Tailwind CSS | v4 (Oxide Engine, CSS-first `@theme` in `globals.css`) |

---

## Directory Structure

```
project-name/
├── prisma/
│   └── schema.prisma            # Database Schema (User, Session, Account, Verification, Organization)
├── src/
│   ├── actions/                 # Server Actions (Validated mutations)
│   │   ├── billing-actions.ts
│   │   └── user-actions.ts
│   ├── app/
│   │   ├── (auth)/              # Route Group: Login, register, passkey setup
│   │   ├── (dashboard)/         # Route Group: Protected app & tenant routes
│   │   ├── (marketing)/         # Route Group: Landing, pricing, changelog
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts   # Better Auth handler (`toNextJsHandler`)
│   │   │   └── webhooks/stripe/route.ts # Raw-body Stripe HMAC verification
│   │   └── globals.css          # Tailwind v4 `@import "tailwindcss"; @theme { ... }`
│   ├── components/
│   │   ├── emails/              # React Email templates
│   │   ├── forms/               # Client components using React 19 `useActionState`
│   │   └── ui/                  # Design-token UI primitives
│   └── lib/
│       ├── auth.ts              # Better Auth server instance (`betterAuth({...})`)
│       ├── auth-client.ts       # Better Auth client (`createAuthClient()`)
│       ├── db.ts                # Drizzle / Prisma singleton
│       └── stripe.ts            # Stripe singleton
├── proxy.ts                     # Next.js 16 session & route boundary protection
└── package.json
```

---

## SaaS Features

| Feature | Implementation |
|---------|---------------|
| Auth & Multi-Tenancy | `better-auth` + Passkeys + OAuth 2.1 + `organization()` plugin |
| Data Mutation | Server Actions validated with Zod v4 (`z.strictObject`) |
| Subscriptions | Stripe Checkout, Billing Portal & Better Auth `@better-auth/stripe` |
| Webhooks | Raw-body HMAC signature check + idempotent event processing |
| Email | Transactional via Resend + React Email |

---

## Database Schema

| Model | Fields (Key fields) |
|-------|---------------------|
| User | `id`, `email`, `emailVerified`, `name`, `stripeCustomerId`, `plan` |
| Session | `id`, `userId`, `token`, `expiresAt`, `activeOrganizationId` |
| Account | `id`, `userId`, `providerId`, `accountId` (OAuth 2.1 / Passkey credentials) |
| Verification | `id`, `identifier`, `value`, `expiresAt` |
| Organization / Member | Multi-tenant RBAC (`owner`, `admin`, `member`) |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | High-entropy signing secret (`>= 32` chars) |
| `BETTER_AUTH_URL` | Canonical auth base URL (e.g. `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Stripe server-side API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Transactional email API key |
| `NEXT_PUBLIC_APP_URL` | Public canonical application URL |

---

## Setup Steps

1. Initialize project (Node 24 LTS):
   ```bash
   npx create-next-app@latest {{name}} --typescript --tailwind --eslint --app --src-dir
   cd {{name}}
   ```

2. Install Better Auth, Stripe, Email & Validation:
   ```bash
   npm install better-auth @better-auth/stripe stripe resend @prisma/client zod
   npm install -D prisma
   ```

3. Generate Better Auth schema & sync database:
   ```bash
   npx @better-auth/cli generate
   npx prisma db push
   ```

4. Configure Tailwind v4 in `src/app/globals.css` (no `tailwind.config.ts`):
   ```css
   @import "tailwindcss";
   ```

5. Configure `.env.local`, start Stripe webhook listener (`npm run stripe:listen`), and run dev server:
   ```bash
   npm run dev
   ```
