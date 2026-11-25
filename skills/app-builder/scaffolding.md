# Project Scaffolding

> Directory structure and core files for new projects. For stack-specific starters, see [templates/INDEX.md](templates/INDEX.md).

---

## Next.js Full-Stack Structure (2026+ Next.js 16 & Tailwind v4 Optimized)

```
project-name/
├── src/
│   ├── app/                        # Routes only (thin layer)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css             # Tailwind v4 CSS-first (@import "tailwindcss"; @theme { ... })
│   │   ├── (auth)/                 # Route group - auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/            # Route group - dashboard layout
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── [resource]/route.ts
│   │
│   ├── features/                   # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── actions.ts          # Server Actions
│   │   │   ├── queries.ts          # Data fetching
│   │   │   └── types.ts
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── actions.ts
│   │   │   └── queries.ts
│   │   └── cart/
│   │       └── ...
│   │
│   ├── shared/                     # Shared utilities
│   │   ├── components/ui/          # Reusable UI components
│   │   ├── lib/                    # Utils, helpers
│   │   └── hooks/                  # Global hooks
│   │
│   └── server/                     # Server-only code
│       ├── db/                     # Database client (Drizzle / Prisma)
│       ├── auth/                   # Better Auth config
│       └── services/               # External API integrations
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
├── proxy.ts
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

## Tailwind v4 CSS-First Token Configuration (`src/app/globals.css`)

Tailwind CSS v4 uses CSS-first configuration — **do NOT create a legacy `tailwind.config.ts` / `tailwind.config.js` file**:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(0.99 0.005 250);
  --color-foreground: oklch(0.16 0.02 250);
  --color-primary: oklch(0.55 0.21 255);
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;
}
```

---

## Structure Principles

| Principle | Implementation |
|-----------|----------------|
| **Feature isolation** | Each feature in `features/` with its own components, hooks, actions |
| **Server/Client separation** | Server-only code in `server/`, prevents accidental client imports |
| **Thin routes** | `app/` only for routing, logic lives in `features/` |
| **Route groups** | `(groupName)/` for layout sharing without URL impact |
| **Shared code** | `shared/` for truly reusable UI and utilities |

---

| File | Purpose |
|------|---------|
| `proxy.ts` | Next.js 16 Network boundary logic (auth, redirects) |
| `src/app/globals.css` | Tailwind v4 `@import "tailwindcss"; @theme { ... }` design tokens |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript + path aliases (`@/features/*`) |
| `.env.example` | Environment template |
| `README.md` | Project documentation |
| `.gitignore` | Git ignore rules |
| `prisma/schema.prisma` | Database schema |
| `src/server/cache-handler.ts` | Next.js 16 Cache Components Manager |

---

## Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/server/*": ["./src/server/*"]
    }
  }
}
```

---

## When to Use What

| Need | Location |
|------|----------|
| New page/route | `app/(group)/page.tsx` |
| Feature component | `features/[name]/components/` |
| Server action | `features/[name]/actions.ts` |
| Data fetching | `features/[name]/queries.ts` |
| Reusable button/input | `shared/components/ui/` |
| Database query | `server/db/` |
| External API call | `server/services/` |
