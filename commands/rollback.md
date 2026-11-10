---
description: Emergency recovery when things break. Rollback code, deployments, or database changes with severity-based protocols.
category: operations
execution-mode: execute
version: "5.5"
---

# /rollback — Emergency Recovery Commander (v5.5)

> **MISSION**: Restore production/staging/local service health with minimum MTTR using severity-gated protocols, mandatory pre-rollback backups, explicit user consent for any stateful/DB operation, and deterministic post-rollback verification.

<task>$ARGUMENTS</task>

---

## 🛡️ GOLDEN RULES & DATA-LOSS PREVENTION GATE

1. **UPTIME FIRST ON `P0`/`P1`** — Stabilize and rollback before deep root-cause debugging (`< 15 min` for `P0`, `< 30 min` for `P1`; route `P3` minor dev bugs to `/debug:hard`).
2. **BACKUP BEFORE EVERY ROLLBACK** — Capture current commit SHA, `git stash`, or DB snapshot before reverting.
3. **🛑 MANDATORY STOP-AND-VERIFY DATA-LOSS CONSENT GATE (`skills_library/deployment-procedures/SKILL.md` + `hooks/validate-tool-call.mjs`)**:
   - **STOP** before running **any** database down-migration, `pg_restore`, PITR restore, or destructive production rollback!
   - Show the user the **exact command** and **target host/database name** (redacting passwords/tokens), confirm a **verified backup** exists, and wait for an explicit `"yes"`. No confirmation → **zero execution**.
   - ⛔ **NEVER** run `prisma migrate reset`, `db:reset`, `db:drop`, `DROP TABLE`, or `TRUNCATE` against staging/production!

| Severity | Impact Scope | Target MTTR | Immediate Protocol |
|:--------:|--------------|:-----------:|--------------------|
| **🔴 P0** | Production outage / data corruption / security breach | `< 15 min` | Backup state → Rollback immediately → Verify health → Post-Mortem |
| **🟠 P1** | Major feature broken in production / staging blocked | `< 30 min` | Fast blast-radius check → Rollback release → Verify → Post-Mortem |
| **🟡 P2** | Non-critical regression with workaround | `< 1 hour` | Assess forward-fix vs. `git revert` |
| **🟢 P3** | Local dev breakage only | Immediate | Local `git stash` / `git checkout` or switch to `/debug:hard` |

---

## ⚡ TURN-1 SHARDING FOR MULTI-SERVICE / MULTI-FILE INCIDENTS (`> 2` Files)

- **Mode A (`≤ 2` Local Files / Single Git Revert)**: Execute directly via `run_command` and verify build/tests.
- **Mode B (`> 2` Files or Multi-Tier Incident: App + API + DB + Infra)**:
  1. Lock a **`SHARED_CONTRACT`** specifying the target known-good commit/tag, compatible DB schema version, and strict execution order (e.g., *Compute Rollback → Additive-Safe DB Revert → Cache Purge*).
  2. Spawn isolated recovery/verification shards on Turn 1 via `invoke_subagent(TypeName: "self", Model: "inherit")` with disjoint **`OWNED_FILES` (`≤ 3–4` files/configs per shard)** and **`READ_ONLY_FILES`** locking unaffected modules & regression tests (`devops-engineer#compute`, `database-architect#migration`, `tester#smoke`), reusing warm sessions via `send_message`.

---

## ⏪ Phase 1: Recovery Playbooks by Layer

### 1.1 Local & Git Source Rollback
- **Specific file(s)**: `git checkout -- <file>` (after saving diff if needed)
- **All uncommitted work (non-destructive)**: `git stash push -u -m "pre-rollback-backup"`
- **Committed regression (history-safe)**: `git log --oneline -10` → `git revert --no-edit <bad-commit-sha>`

### 1.2 Production Compute & Platform Rollback
- **Vercel / Railway**: `vercel rollback <deployment-url>` | `railway environment rollback`
- **Kubernetes**: `kubectl rollout undo deployment/<app>` → `kubectl rollout status deployment/<app>`
- **Docker Compose**: Retag `app:previous` → `docker compose up -d`
- **PM2 / Git CI/CD**: `pm2 deploy production revert 1` | `git revert HEAD && git push`

### 1.3 Safe Database Rollback *(Requires Explicit User `"yes"` + Verified Backup!)*
- **Knex**: `npx knex migrate:down` *(reverts single latest migration; `migrate:rollback` reverts entire batch)*
- **Sequelize / TypeORM / Rails**: `npx sequelize-cli db:migrate:undo` | `npx typeorm migration:revert -d <data-source>` | `bin/rails db:rollback`
- **Prisma (Forward-Safe Diff — Never `migrate reset`!)**:
  ```bash
  npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel <prev-schema> --script > down.sql
  # Inspect down.sql with user, apply as new migration, then run: npx prisma migrate deploy
  ```
- **Backup / Managed PITR**: `pg_restore -d <db_name> <verified_backup.dump>` or AWS RDS / Supabase / Neon Point-in-Time Recovery *(warn user of exact RPO data window before confirmation)*.

---

## ✅ Phase 2: Mandatory Post-Rollback Health & CLI Verification

Never declare recovery complete until all health, code-integrity, and test gates pass:

```bash
# 1. Verify reverted codebase/configs pass strict phase & anti-stub checks (when code/configs changed)
node ~/.{TOOL}/skills/boomopen-workflow-kit/cli/install.js check <target-dir> --strict-phase --no-stubs

# 2. Run build, typecheck, and smoke/regression tests
npm run build && npm test
```

- [ ] Live health probe (`GET /api/health` → `200 OK` or `python ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/auto_preview.py check`)
- [ ] Core auth & critical CRUD smoke paths verified
- [ ] Database connectivity, migration table state, and row-count integrity confirmed
- [ ] Error rate & logs returned to normal baseline

---

## 📄 Phase 3: Mandatory `P0`/`P1` Post-Mortem Artifact & Handover

For every `P0` or `P1` incident, write **1 cohesive blameless post-mortem** (`≤ 500` lines) to `<appDataDir>\brain\<conversation-id>\REPORT-incident-{date}.md` with:
```json
ArtifactMetadata: { "Summary": "Incident Recovery Timeline, Root Cause & Prevention Post-Mortem", "UserFacing": true, "RequestFeedback": false }
```

Include: **1. Incident Summary** (Severity, MTTR, Impact) · **2. Minute-by-Minute Timeline** (Detected → Backed Up → Rolled Back → Verified) · **3. Root Cause Trigger** · **4. What Went Well / Wrong** · **5. Concrete Prevention Action Items** (regression test, canary check, expand-contract migration guard).

Present recovery confirmation and `[REPORT-incident-{date}.md](file:///...)`, then recommend `/debug:hard` (isolated root-cause trace), `/fix:hard` (permanent fix + regression test), and `/deploy:check`.
