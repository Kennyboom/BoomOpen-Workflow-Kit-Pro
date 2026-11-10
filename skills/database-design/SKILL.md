---
name: database-design
description: Database design principles, Wave 1 SHARED_CONTRACT schema locking, zero-downtime expand/contract migrations, indexing strategy, and ORM selection (Drizzle, Prisma, Postgres/Supabase, Neon, Turso, D1) (v5.5).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
version: 5.5.0
---

# Database Design (v5.5 — Contract-First & Zero-Downtime Migration Edition)

> **Data is durable state; code is ephemeral.** Lock schemas in Wave 1 (`SHARED_CONTRACT`), index every access path, and ship reversible zero-downtime migrations.

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map first:

| File | Description | When to Read |
|------|-------------|--------------|
| [database-selection.md](database-selection.md) | PostgreSQL vs Neon vs Supabase vs Turso/libSQL vs SQLite/D1 | Choosing database engine |
| [orm-selection.md](orm-selection.md) | Drizzle ORM vs Prisma vs Kysely | Choosing ORM / query builder |
| [schema-design.md](schema-design.md) | 3NF normalization, UUIDv7/ULID PKs, FK constraints, timestamps | Modeling entities & relations |
| [indexing.md](indexing.md) | B-tree, composite selectivity order, partial/GIN/pgvector indexes | Designing index strategy |
| [optimization.md](optimization.md) | Eliminating N+1 queries, `EXPLAIN (ANALYZE, BUFFERS)`, cursor pagination | Query tuning |
| [migrations.md](migrations.md) | Expand-Contract zero-downtime DDL & reversible down-migrations | Altering live schemas |

---

## 🔗 2026 Specialized Library & Safety Skills

| Need | Skill Path |
|------|------------|
| **Drizzle ORM + Neon Serverless Postgres + Turso Edge** | `../../skills_library/drizzle-neon-turso-edge/SKILL.md` (`skills_library/drizzle-neon-turso-edge/SKILL.md`) |
| **Prisma ORM Schema, Relations & Migrations** | `../../skills_library/prisma-expert/SKILL.md` (`skills_library/prisma-expert/SKILL.md`) |
| **Supabase Postgres RLS, Realtime & `pgvector`** | `../../skills_library/supabase-rls-edge-realtime/SKILL.md` (`skills_library/supabase-rls-edge-realtime/SKILL.md`) |
| **PostgreSQL Performance & Indexing Best Practices** | `../../skills_library/postgres-best-practices/SKILL.md` (`skills_library/postgres-best-practices/SKILL.md`) |
| **Cloudflare D1 SQLite, R2 & Durable Objects** | `../../skills_library/cloudflare-d1-r2-durable-objects/SKILL.md` (`skills_library/cloudflare-d1-r2-durable-objects/SKILL.md`) |
| **Zero-Downtime Database Migration Patterns** | `../../skills_library/database-migration/SKILL.md` (`skills_library/database-migration/SKILL.md`) |

---

## 🤝 Wave 1 `database-architect#schema` `SHARED_CONTRACT` Template

In `/plan`, `/cook`, and `/code`, `database-architect#schema` runs in **Wave 1** to materialize schema definitions (`src/db/schema.ts` or `prisma/schema.prisma`) and migrations so **Wave 2** `backend-engineer#api-1..k` shards import exact inferred row types (`InferSelectModel` / `Prisma.*`) with `src/db/schema.ts` locked in `READ_ONLY_FILES`:

```ts
// src/db/schema.ts (Wave 1 — Owned by database-architect#schema)
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').notNull(),
    status: text('status', { enum: ['pending', 'paid', 'failed'] }).notNull().default('pending'),
    totalCents: integer('total_cents').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_orders_org_created').on(table.orgId, table.createdAt),
  ],
);

export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
```

---

## 🛡️ 3-Part Blast-Radius Migration Safety Protocol (MANDATORY)

Every schema change in `PLAN-{task}.md` and Wave 1 execution MUST satisfy all 3 migration safety rules:

1. **Forward (`UP`) + Reversible (`DOWN`) Verification**:
   - Every migration MUST pair its forward `UP` DDL with a tested, non-destructive `DOWN` rollback script (documented in `PLAN-{task}.md`'s Blast-Radius Pre-Mortem).
2. **Zero-Downtime Expand → Backfill → Contract (Never Rename/Drop In-Place)**:
   - **Expand**: Add new nullable column (or column with safe server default) + non-blocking index (`CREATE INDEX CONCURRENTLY` on large Postgres tables).
   - **Backfill & Dual-Write**: Deploy application code writing to both old and new columns and backfill historical rows in batches.
   - **Contract**: Enforce `NOT NULL` or drop legacy column only in a subsequent release (**STOP-AND-VERIFY**: always obtain explicit user consent before executing any irreversible `DROP TABLE`/`DROP COLUMN`/`TRUNCATE`/un-scoped `DELETE` DDL).
3. **Mandatory Integrity & Precision Rules**:
   - Store money as integer minor units (`total_cents INTEGER`) or exact `NUMERIC(19,4)` — **never `FLOAT`/`REAL`**.
   - Store timestamps in UTC with timezone (`TIMESTAMPTZ` / `{ withTimezone: true }`), define explicit `ON DELETE` behavior (`RESTRICT` vs `CASCADE`), and index every foreign key (`org_id`, `user_id`).

---

## 🔧 Automated Schema Verification Gates

| Tool / Script | Purpose | Command |
|---------------|---------|---------|
| **Schema Validator (Prisma & Drizzle)** | Checks primary keys, `createdAt` timestamps, FK indexes, naming & zero `any` | `python ~/.{TOOL}/skills/database-design/scripts/schema_validator.py <project_path> [--json]` |
| **Pragmatic 2-Tier & Anti-Stub Gate** | Verifies `0` explicit `any`, `0` deferred `TODO`s, and `0` hollow stubs | `node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <project_path> --strict-phase --no-stubs` |

> `python` means your Python 3 launcher: use `python3` on macOS/Linux, or `py -3` on Windows, if `python` is not on PATH.
