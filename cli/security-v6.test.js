'use strict';

/**
 * Pillar 2B (v6) regression suite:
 *   - M1-M5 security_scan.py + security_rules.py detections and safe allowlists
 *   - M6 route_census.py (--emit-routes) zero-cap entrypoint extraction
 *   - api_validator.py zero 15-file cap, 'use server' + tRPC support, strict auth word-boundaries
 *   - schema_validator.py zero 10-schema cap, per-table Drizzle FK index check, --strict exit 1
 *   - Zero false positives on BoomOpen-Workflow-Kit-Pro and scripts/checklist.py
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT_TIMEOUT_MS = 120000;
const PYTHON_CANDIDATES = [['python3'], ['python'], ['py', '-3']];

function findPython() {
  for (const candidate of PYTHON_CANDIDATES) {
    const probe = spawnSync(candidate[0], [...candidate.slice(1), '-c', 'import sys; print(sys.version_info[0])'], {
      encoding: 'utf8',
    });
    if (probe.status === 0 && probe.stdout.trim() === '3') return candidate;
  }
  return null;
}

const PYTHON = findPython();
const SKIP = PYTHON ? false : 'Python 3 is not installed';

function withTemp(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function kitScript(rel) {
  return path.join(REPO_ROOT, ...rel.split('/'));
}

function runPython(t, scriptPath, args, options = {}) {
  const home = withTemp(t, 'boomopen-sec6-home-');
  const env = { ...process.env };
  delete env.PYTHONUTF8;
  delete env.PYTHONIOENCODING;
  env.PYTHONUTF8 = '0';
  env.PYTHONDONTWRITEBYTECODE = '1';
  env.HOME = home;
  env.USERPROFILE = home;
  const result = spawnSync(PYTHON[0], [...PYTHON.slice(1), '-B', scriptPath, ...args], {
    cwd: options.cwd || REPO_ROOT,
    env: { ...env, ...(options.env || {}) },
    encoding: 'utf8',
    timeout: options.timeout || SCRIPT_TIMEOUT_MS,
  });
  return { status: result.status, out: `${result.stdout || ''}${result.stderr || ''}` };
}

test('security_scan v6 catches M1-M5 leaks and sinks while allowing safe Drizzle sql`` and JSON-LD', { skip: SKIP }, (t) => {
  const badDir = withTemp(t, 'boomopen-sec6-bad-');
  const highEntropyJwtSecret = ['xK9mP2vQ', '8nL4rT7w', 'Y3zB6cN1', 'fH5jM0qR'].join('');
  const stripeLive = ['sk', 'live', '9a8b7c6d5e4f3g2h1j0kLmNoPq'].join('_');
  const whSecret = ['whsec', 'K9mP2vQ8nL4rT7wX1zB5cN3yF6hJ'].join('_');
  const publicEnvName = ['NEXT_PUBLIC', 'STRIPE', 'SECRET', 'KEY'].join('_');

  write(path.join(badDir, '.env'), `JWT_SECRET=${highEntropyJwtSecret}\nWEBHOOK_SIGN=${whSecret}\n`);
  write(path.join(badDir, 'Dockerfile'), `FROM node:22-alpine\nENV API_SECRET=${stripeLive}\n`);
  write(path.join(badDir, 'next.config.mjs'), `export default { env: { ${publicEnvName}: process.env.X }, productionBrowserSourceMaps: true };\n`);
  write(
    path.join(badDir, 'src', 'ClientLeak.tsx'),
    [
      '"use client";',
      "import { db } from '@/server/db';",
      'export function Leak() { return <div>{String(Boolean(db))}</div>; }',
      '',
    ].join('\n')
  );
  write(
    path.join(badDir, 'src', 'server.ts'),
    [
      "import child_process from 'node:child_process';",
      "import cors from 'cors';",
      "import jwt from 'jsonwebtoken';",
      "import path from 'node:path';",
      'app.use(cors({',
      "  origin: '*',",
      '  credentials: true,',
      '}));',
      'export async function handler(req, res) {',
      '  try {',
      '    const decoded = jwt.decode(req.headers.token);',
      '    child_process.exec(req.body.cmd);',
      '    const file = path.join("/var/uploads", req.query.name);',
      '    await fetch(req.body.callbackUrl);',
      '    await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${req.params.id}`);',
      '    return res.json({ decoded, file });',
      '  } catch (err) {',
      '    console.error(req.headers.authorization);',
      '    return res.status(500).json({ stack: err.stack });',
      '  }',
      '}',
      '',
    ].join('\n')
  );

  const badRun = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [badDir, '--json']);
  assert.equal(badRun.status, 1, badRun.out);
  const badReport = JSON.parse(badRun.out);
  const rules = badReport.findings.map((f) => f.rule);

  assert.ok(rules.some((r) => r.includes('Tracked non-template .env')), `missing M1 .env finding in ${rules}`);
  assert.ok(rules.some((r) => r.includes('High-entropy hardcoded secret')), `missing M2 entropy JWT_SECRET in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Stripe Webhook Signing Secret')), `missing M2 whsec_ in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Dockerfile ENV/ARG')), `missing M1 Dockerfile finding in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Public client env var')), `missing M3 NEXT_PUBLIC_* finding in ${rules}`);
  assert.ok(rules.some((r) => r.includes("'use client'")), `missing M3 'use client' DB import in ${rules}`);
  assert.ok(rules.some((r) => r.includes('error.stack or sqlMessage')), `missing M4 err.stack leak in ${rules}`);
  assert.ok(rules.some((r) => r.includes('auth header or cookies written to logs')), `missing M4 log leak in ${rules}`);
  assert.ok(rules.some((r) => r.includes('exec/execSync')), `missing M5 child_process.exec in ${rules}`);
  assert.ok(rules.some((r) => r.includes('unsafe raw SQL')), `missing M5 $queryRawUnsafe in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Permissive CORS')), `missing M5 multi-line cors in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Uncontained path.join')), `missing M5 path.join traversal in ${rules}`);
  assert.ok(rules.some((r) => r.includes('Unverified jwt.decode')), `missing M5 jwt.decode in ${rules}`);
  assert.ok(rules.some((r) => r.includes('SSRF')), `missing M5 SSRF fetch in ${rules}`);

  const safeDir = withTemp(t, 'boomopen-sec6-safe-');
  write(path.join(safeDir, '.env.example'), 'JWT_SECRET=changeme\nDATABASE_URL=postgres://user:example@localhost:5432/dev\n');
  write(
    path.join(safeDir, 'src', 'repo.ts'),
    [
      "import { sql } from 'drizzle-orm';",
      'export async function findById(db: { execute: (q: unknown) => Promise<unknown> }, id: string) {',
      '  return db.execute(sql`SELECT * FROM t WHERE id = ${id}`);',
      '}',
      '',
    ].join('\n')
  );
  write(
    path.join(safeDir, 'src', 'JsonLd.tsx'),
    'export const JsonLd = ({ data }: { data: Record<string, string> }) => (\n  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />\n);\n'
  );

  const safeRun = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [safeDir, '--json']);
  assert.equal(safeRun.status, 0, safeRun.out);
  const safeReport = JSON.parse(safeRun.out);
  assert.equal(safeReport.blocking_count, 0, safeRun.out);
  assert.equal(safeReport.advisory_count, 0, safeRun.out);
});

test('security_scan --json --emit-routes extracts >15 Next.js routes, Server Actions, Express, tRPC, Tauri & MCP tools', { skip: SKIP }, (t) => {
  const dir = withTemp(t, 'boomopen-sec6-routes-');
  for (let i = 1; i <= 18; i += 1) {
    const slug = `item-${String(i).padStart(2, '0')}`;
    write(
      path.join(dir, 'src', 'app', 'api', slug, 'route.ts'),
      [
        'export async function GET(req: Request) {',
        '  const session = await getSession(req);',
        '  const parsed = z.object({ orgId: z.string() }).safeParse({});',
        '  return Response.json({ ok: Boolean(session && parsed), select: { id: true } });',
        '}',
        '',
      ].join('\n')
    );
  }
  write(
    path.join(dir, 'src', 'app', 'actions', 'billing.ts'),
    '"use server";\nexport async function createInvoice(formData: FormData) { return { ok: Boolean(formData) }; }\n'
  );
  write(
    path.join(dir, 'src', 'server', 'express.ts'),
    "app.post('/webhooks/stripe', (req, res) => res.status(200).json({ ok: true }));\n"
  );
  write(
    path.join(dir, 'src', 'server', 'trpc.ts'),
    'export const appRouter = router({ listOrders: protectedProcedure.input(OrderSchema).query(() => []) });\n'
  );
  write(
    path.join(dir, 'src-tauri', 'src', 'commands.rs'),
    '#[tauri::command]\npub async fn unlock_vault(pin: String) -> Result<bool, String> { Ok(!pin.is_empty()) }\n'
  );
  write(
    path.join(dir, 'src', 'mcp', 'tools.ts'),
    "mcpServer.tool('query_metrics', { metric: z.string() }, async () => ({ content: [] }));\n"
  );

  const { status, out } = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [
    dir, '--json', '--emit-routes',
  ]);
  assert.equal(status, 0, out);
  const report = JSON.parse(out);
  assert.ok(report.route_census, 'expected route_census in JSON output');
  assert.equal(report.route_census.total, 23, out);
  const kinds = new Set(report.route_census.entrypoints.map((e) => e.kind));
  for (const expectedKind of ['nextjs_route', 'server_action', 'http_route', 'trpc_procedure', 'tauri_command', 'mcp_tool']) {
    assert.ok(kinds.has(expectedKind), `missing entrypoint kind ${expectedKind} in ${[...kinds]}`);
  }
  const firstNext = report.route_census.entrypoints.find((e) => e.kind === 'nextjs_route');
  assert.equal(firstNext.preflags.has_auth_hint, true);
  assert.equal(firstNext.preflags.has_schema_hint, true);
  assert.equal(firstNext.preflags.has_tenant_scope_hint, true);
});

test('api_validator scans >15 route files without truncation and does not false-pass authorName/maxTokens as auth', { skip: SKIP }, (t) => {
  const dir = withTemp(t, 'boomopen-sec6-api20-');
  for (let i = 1; i <= 20; i += 1) {
    const pad = String(i).padStart(2, '0');
    const authLine = i === 2 ? '  await requireAuth(req);' : '  const authorName = "Ada"; const maxTokens = 512;';
    write(
      path.join(dir, 'app', 'api', `r${pad}`, 'route.ts'),
      [
        'export async function POST(req: Request) {',
        '  try {',
        authLine,
        '    const body = OrderSchema.safeParse(await req.json());',
        '    return Response.json({ authorName: Boolean(body) }, { status: 201 });',
        '  } catch (err) {',
        '    return Response.json({ error: "bad_request" }, { status: 400 });',
        '  }',
        '}',
        '',
      ].join('\n')
    );
  }
  write(
    path.join(dir, 'src', 'actions', 'updateProfile.ts'),
    '"use server";\nexport async function updateProfile(raw: unknown) {\n  try { const data = ProfileSchema.safeParse(raw); return { ok: data.success }; } catch { return { ok: false }; }\n}\n'
  );
  write(
    path.join(dir, 'src', 'trpc', 'router.ts'),
    'export const userRouter = createTRPCRouter({\n  me: protectedProcedure.input(MeSchema).query(() => ({ ok: true })),\n});\n'
  );

  const { status, out } = runPython(t, kitScript('skills/api-patterns/scripts/api_validator.py'), [dir, '--json']);
  assert.equal(status, 0, out);
  const report = JSON.parse(out);
  assert.equal(report.files_checked, 22, 'must scan all 22 files with zero 15-file truncation');

  const r01 = report.results.find((r) => r.file.includes('r01'));
  const r02 = report.results.find((r) => r.file.includes('r02'));
  const trpc = report.results.find((r) => r.file.includes('router.ts'));
  assert.equal(r01.auth_detected, false, 'authorName / maxTokens must NOT count as auth');
  assert.ok(!r01.passed.some((p) => p.includes('Authentication/authorization')), 'r01 must not report auth passed');
  assert.equal(r02.auth_detected, true, 'requireAuth(req) must be detected as auth');
  assert.equal(trpc.auth_detected, true, 'protectedProcedure must be detected as auth');
});

test('schema_validator scans >10 schemas, checks Drizzle FK indexes per-table, and exits 1 with --strict', { skip: SKIP }, (t) => {
  const dir = withTemp(t, 'boomopen-sec6-schema-');
  for (let i = 1; i <= 11; i += 1) {
    const pad = String(i).padStart(2, '0');
    write(
      path.join(dir, 'src', 'db', `s${pad}.schema.ts`),
      [
        "import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';",
        `export const t${pad} = pgTable('t_${pad}', {`,
        "  id: uuid('id').defaultRandom().primaryKey(),",
        "  orgId: uuid('org_id').notNull(),",
        "  createdAt: timestamp('created_at').defaultNow().notNull(),",
        `}, (t) => [index('idx_${pad}').on(t.orgId)]);`,
        '',
      ].join('\n')
    );
  }
  write(
    path.join(dir, 'src', 'db', 's12.schema.ts'),
    [
      "import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';",
      "export const orgs = pgTable('orgs', {",
      "  id: uuid('id').defaultRandom().primaryKey(),",
      "  slugId: uuid('slug_id').notNull(),",
      "  createdAt: timestamp('created_at').defaultNow().notNull(),",
      "}, (t) => [index('idx_orgs_slug').on(t.slugId)]);",
      "export const invoices = pgTable('invoices', {",
      "  id: uuid('id').defaultRandom().primaryKey(),",
      "  orgId: uuid('org_id').notNull().references(() => orgs.id),",
      "  createdAt: timestamp('created_at').defaultNow().notNull(),",
      '});',
      '',
    ].join('\n')
  );

  const advisory = runPython(t, kitScript('skills/database-design/scripts/schema_validator.py'), [dir, '--json']);
  assert.equal(advisory.status, 0, advisory.out);
  const advReport = JSON.parse(advisory.out);
  assert.equal(advReport.schemas_checked, 12, 'must check all 12 schemas without 10-schema truncation');
  assert.equal(advReport.issues_found, 1, 'must catch unindexed FK on invoices even when orgs has index()');

  const strict = runPython(t, kitScript('skills/database-design/scripts/schema_validator.py'), [dir, '--strict', '--json']);
  assert.equal(strict.status, 1, 'must exit 1 under --strict when FK index issue exists');
});

test('security_scan . --skip-deps and checklist.py pass with 0 false positives', { skip: SKIP }, (t) => {
  const repoScan = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [
    REPO_ROOT, '--skip-deps', '--json',
  ]);
  assert.equal(repoScan.status, 0, repoScan.out);
  const repoReport = JSON.parse(repoScan.out);
  assert.equal(repoReport.blocking_count, 0, repoScan.out);
  assert.equal(repoReport.advisory_count, 0, repoScan.out);

  const cleanApp = withTemp(t, 'boomopen-sec6-checklist-');
  write(path.join(cleanApp, 'package.json'), '{"name":"clean-demo","version":"1.0.0","scripts":{}}');
  write(
    path.join(cleanApp, 'src', 'app', 'api', 'health', 'route.ts'),
    'export async function GET() {\n  try { return Response.json({ ok: true, schema: "v1" }, { status: 200 }); } catch { return Response.json({ ok: false }, { status: 500 }); }\n}\n'
  );
  const checklistRun = runPython(t, kitScript('scripts/checklist.py'), [cleanApp]);
  assert.equal(checklistRun.status, 0, checklistRun.out);
});
