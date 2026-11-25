# Tech Stack Selection (2026)

> Default and alternative technology choices for web applications.

## Default Stack (Web App - 2026)

```yaml
Frontend:
  framework: Next.js 16 (Stable)
  language: TypeScript 5.7+
  styling: Tailwind CSS v4
  state: React 19 Actions / Server Components
  caching: Next.js 16 Cache Components (Stable)
  bundler: Turbopack (Stable for Dev & Build)

Backend:
  runtime: Node.js 24 LTS
  framework: Next.js API Routes / Hono (for Edge & RPC)
  validation: Zod v4 / TypeBox

Database:
  primary: PostgreSQL
  orm: Drizzle / Prisma
  hosting: Supabase / Neon

Auth:
  provider: Better Auth / Clerk

Monorepo:
  tool: Turborepo 2.0
```

## Alternative Options

| Need | Default | Alternative |
|------|---------|-------------|
| Real-time | - | Supabase Realtime, Socket.io |
| File storage | - | Cloudinary, S3 |
| Payment | Stripe | LemonSqueezy, Paddle |
| Email | - | Resend, SendGrid |
| Search | - | Algolia, Typesense |
