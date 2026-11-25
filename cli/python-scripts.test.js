// Regression tests for the kit's Python helper scripts (scripts/*.py and
// skills/*/scripts/*.py). Each test runs a script on a throwaway fixture with
// a sandboxed HOME, piped stdout and UTF-8 mode switched off, which is how
// agents run them. Skipped when no Python 3 interpreter is available.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
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

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function sandboxEnv(home) {
  const env = { ...process.env };
  for (const key of ['PYTHONUTF8', 'PYTHONIOENCODING', 'NO_COLOR']) delete env[key];
  env.PYTHONUTF8 = '0';
  env.PYTHONDONTWRITEBYTECODE = '1';
  env.HOME = home;
  env.USERPROFILE = home;
  env.APPDATA = path.join(home, 'AppData', 'Roaming');
  env.LOCALAPPDATA = path.join(home, 'AppData', 'Local');
  env.XDG_CONFIG_HOME = path.join(home, '.config');
  return env;
}

function withTemp(t, prefix) {
  const dir = tempDir(prefix);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function runPython(t, scriptPath, args, options = {}) {
  const home = withTemp(t, 'boomopen-py-home-');
  const result = spawnSync(PYTHON[0], [...PYTHON.slice(1), '-B', scriptPath, ...args], {
    cwd: options.cwd || REPO_ROOT,
    env: { ...sandboxEnv(home), ...(options.env || {}) },
    encoding: 'utf8',
    timeout: options.timeout || SCRIPT_TIMEOUT_MS,
  });
  return { status: result.status, out: `${result.stdout || ''}${result.stderr || ''}` };
}

function kitScript(rel) {
  return path.join(REPO_ROOT, ...rel.split('/'));
}

/** A minimal kit: the real check runner plus fake check scripts. */
function buildFakeKit(t, fakeScripts) {
  const kit = withTemp(t, 'boomopen-py-kit-');
  fs.mkdirSync(path.join(kit, 'scripts'), { recursive: true });
  for (const name of ['checklist.py', 'verify_all.py', 'kit_checks.py', 'kit_console.py']) {
    fs.copyFileSync(path.join(REPO_ROOT, 'scripts', name), path.join(kit, 'scripts', name));
  }
  for (const [rel, body] of Object.entries(fakeScripts)) write(path.join(kit, ...rel.split('/')), body);
  return kit;
}

const RECORD_ARGV = (label, exitCode, stdout) => [
  'import json, os, sys',
  `open(os.path.join(os.environ["ARGV_LOG_DIR"], "${label}.txt"), "w", encoding="utf-8").write(sys.argv[1])`,
  `print(${JSON.stringify(stdout)})`,
  `sys.exit(${exitCode})`,
  '',
].join('\n');

test('checklist passes the URL (not the project path) to URL checks and fails when they report an error', { skip: SKIP }, (t) => {
  const kit = buildFakeKit(t, {
    'skills/security-auditor/scripts/security_scan.py': RECORD_ARGV('security', 0, 'scan ok'),
    'skills_library/performance-profiling/scripts/lighthouse_audit.py':
      RECORD_ARGV('lighthouse', 0, '{"error": "Lighthouse CLI not found"}'),
    'skills/webapp-testing/scripts/playwright_runner.py': RECORD_ARGV('playwright', 1, '{"status": "error"}'),
  });
  const project = withTemp(t, 'boomopen-py-project-');
  const logDir = withTemp(t, 'boomopen-py-argv-');
  const url = 'http://127.0.0.1:9';
  const { status, out } = runPython(t, path.join(kit, 'scripts', 'checklist.py'), [project, '--url', url], {
    env: { ARGV_LOG_DIR: logDir },
  });
  assert.equal(status, 1, out);
  assert.equal(fs.readFileSync(path.join(logDir, 'lighthouse.txt'), 'utf8'), url);
  assert.equal(fs.readFileSync(path.join(logDir, 'playwright.txt'), 'utf8'), url);
  assert.equal(fs.readFileSync(path.join(logDir, 'security.txt'), 'utf8'), fs.realpathSync.native(project));
  assert.match(out, /Lighthouse Audit: FAILED/);
  assert.match(out, /Playwright E2E: FAILED/);
  assert.match(out, /MISSING/, 'checks that are not installed are reported, not passed');
  assert.doesNotMatch(out, /All \d+ executed check\(s\) PASSED/);
});

test('checklist never reports success when no check script is installed', { skip: SKIP }, (t) => {
  const kit = buildFakeKit(t, {});
  const project = withTemp(t, 'boomopen-py-project-');
  const { status, out } = runPython(t, path.join(kit, 'scripts', 'checklist.py'), [project]);
  assert.equal(status, 1, out);
  assert.match(out, /Security Scan: MISSING/);
});

test('checklist ignores check scripts shipped inside the audited project', { skip: SKIP }, (t) => {
  const kit = buildFakeKit(t, {
    'skills/security-auditor/scripts/security_scan.py': 'import sys\nsys.exit(1)\n',
  });
  const project = withTemp(t, 'boomopen-py-project-');
  write(
    path.join(project, 'skills', 'security-auditor', 'scripts', 'security_scan.py'),
    'import pathlib, sys\npathlib.Path(sys.argv[1], "MARKER.txt").write_text("ran")\nsys.exit(0)\n'
  );
  const { status, out } = runPython(t, path.join(kit, 'scripts', 'checklist.py'), [project]);
  assert.equal(status, 1, out);
  assert.equal(fs.existsSync(path.join(project, 'MARKER.txt')), false, 'project code must not run');
});

test('checklist and verify_all reject a missing project path or a non-URL with exit 2', { skip: SKIP }, (t) => {
  const missing = path.join(os.tmpdir(), 'boomopen-no-such-project-dir');
  assert.equal(runPython(t, kitScript('scripts/checklist.py'), [missing]).status, 2);
  const project = withTemp(t, 'boomopen-py-project-');
  assert.equal(runPython(t, kitScript('scripts/verify_all.py'), [project, '--url', 'not-a-url']).status, 2);
});

test('entry scripts print emoji through a non-UTF-8 pipe without crashing', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-project-');
  const session = runPython(t, kitScript('scripts/session_manager.py'), ['status', project]);
  assert.equal(session.status, 0, session.out);
  assert.doesNotMatch(session.out, /UnicodeEncodeError/);
  const preview = runPython(t, kitScript('scripts/auto_preview.py'), ['status'], { cwd: project });
  assert.equal(preview.status, 0, preview.out);
  assert.match(preview.out, /Status: Stopped/);
  assert.equal(fs.existsSync(path.join(project, '.agent')), false, 'status does not create state');
});

test('auto_preview start fails cleanly in a project without a dev script or .agent folder', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-project-');
  write(path.join(project, 'package.json'), '{"name":"demo","scripts":{}}');
  const { status, out } = runPython(t, kitScript('scripts/auto_preview.py'), ['start', '38991'], { cwd: project });
  assert.equal(status, 1, out);
  assert.match(out, /No 'dev' or 'start' script/);
  assert.doesNotMatch(out, /Traceback/);
});

test('checkers exit 2 on a path that does not exist instead of passing', { skip: SKIP }, (t) => {
  const missing = path.join(os.tmpdir(), 'boomopen-no-such-project-dir');
  for (const rel of [
    'skills/security-auditor/scripts/security_scan.py',
    'skills/frontend-design/scripts/ux_audit.py',
    'skills/frontend-design/scripts/accessibility_checker.py',
    'skills/mobile-design/scripts/mobile_audit.py',
    'skills/seo-fundamentals/scripts/seo_checker.py',
    'skills/testing-patterns/scripts/test_runner.py',
    'skills/api-patterns/scripts/api_validator.py',
    'skills/database-design/scripts/schema_validator.py',
  ]) {
    const { status, out } = runPython(t, kitScript(rel), [missing]);
    assert.equal(status, 2, `${rel}: ${out}`);
  }
});

test('api_validator finds routes under a "build" parent folder and Next.js route handlers', { skip: SKIP }, (t) => {
  const root = withTemp(t, 'boomopen-py-api-');
  const handler = 'export async function GET(req) { try { return Response.json(validate(req), { status: 200 }) } catch (e) { throw e } }\n';
  const project = path.join(root, 'build-area', 'proj');
  write(path.join(project, 'routes', 'users.ts'), handler);
  write(path.join(project, 'app', 'api', 'users', 'route.ts'), handler);
  write(path.join(project, 'node_modules', 'pkg', 'api', 'ignored.ts'), handler);
  const { status, out } = runPython(t, kitScript('skills/api-patterns/scripts/api_validator.py'), [project]);
  assert.equal(status, 0, out);
  assert.match(out, /users\.ts/);
  assert.match(out, /route\.ts/);
  assert.doesNotMatch(out, /ignored\.ts/);
  assert.doesNotMatch(out, /\[SKIP\]/);
});

test('mobile_audit does not read width: 300 as a 30px touch target', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-mobile-');
  write(
    path.join(project, 'App.tsx'),
    "import { StyleSheet, Pressable } from 'react-native';\nconst s = StyleSheet.create({ card: { width: 300, height: 200 } });\n"
  );
  const { status, out } = runPython(t, kitScript('skills/mobile-design/scripts/mobile_audit.py'), [project]);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /Touch Target/);
});

test('seo_checker does not treat <header> as a document head and accepts alt=""', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-seo-');
  write(
    path.join(project, 'src', 'pages', 'Home.tsx'),
    '<header className="p-4"><h1>Shop</h1></header>\n<img src="divider.png" alt="" />\n'
  );
  const { status, out } = runPython(t, kitScript('skills/seo-fundamentals/scripts/seo_checker.py'), [project]);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /Missing <title>/);
});

test('accessibility_checker accepts native buttons with onClick', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-a11y-');
  for (let i = 0; i < 6; i += 1) {
    write(path.join(project, `Save${i}.jsx`), '<button onClick={() => save()}>Save</button>\n');
  }
  const { status, out } = runPython(t, kitScript('skills/frontend-design/scripts/accessibility_checker.py'), [project]);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /onClick/);
});

test('ux_audit ignores colour words in copy and survives "line-height: 1.5."', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-ux-');
  write(path.join(project, 'Soap.tsx'), '<p className="max-w-prose leading-relaxed">Lavender soap. Ultraviolet.</p>\n');
  write(path.join(project, 'Copy.tsx'), '<h1>Title</h1>\n{/* body copy uses line-height: 1.5. */}\n');
  const { status, out } = runPython(t, kitScript('skills/frontend-design/scripts/ux_audit.py'), [project]);
  assert.equal(status, 0, out);
  assert.doesNotMatch(out, /PURPLE|Purple|Traceback|Audit Error/);
  assert.match(out, /STATUS: PASS/);
});

test('test_runner skips the npm init placeholder test script', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-tests-');
  write(path.join(project, 'package.json'), '{"name":"x","scripts":{"test":"echo \\"Error: no test specified\\" && exit 1"}}');
  const { status, out } = runPython(t, kitScript('skills/testing-patterns/scripts/test_runner.py'), [project]);
  assert.equal(status, 0, out);
  assert.match(out, /\[SKIP\]/);
});

const NPM_SKIP = SKIP || (spawnSync('npm --version', { shell: true }).status !== 0 && 'npm is not installed');

test('test_runner can start npm (npm.cmd on Windows)', { skip: NPM_SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-tests-');
  write(path.join(project, 'package.json'), '{"name":"x","scripts":{"test":"node -e \\"process.exit(0)\\""}}');
  const { status, out } = runPython(t, kitScript('skills/testing-patterns/scripts/test_runner.py'), [project]);
  assert.equal(status, 0, out);
  assert.match(out, /\[PASS\]/);
});

function isListening(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

test('with_server copes with a chatty server and stops the whole server tree', { skip: SKIP }, async (t) => {
  const dir = withTemp(t, 'boomopen-py-server-');
  const port = 38990;
  write(path.join(dir, 'noisy.py'), [
    'import socket, sys',
    'sys.stdout.write("x" * 200000 + "\\n"); sys.stdout.flush()',
    's = socket.socket(); s.bind(("127.0.0.1", int(sys.argv[1]))); s.listen()',
    'while True:',
    '    c, _ = s.accept(); c.close()',
    '',
  ].join('\n'));
  const python = PYTHON.join(' ');
  const { status, out } = runPython(
    t,
    kitScript('skills/webapp-testing/scripts/with_server.py'),
    ['--server', `${python} -B noisy.py ${port}`, '--port', String(port), '--timeout', '30', '--',
      PYTHON[0], ...PYTHON.slice(1), '-c', 'print("client ran")'],
    { cwd: dir }
  );
  assert.equal(status, 0, out);
  assert.match(out, /client ran/);
  await new Promise((resolve) => setTimeout(resolve, 500));
  assert.equal(await isListening(port), false, 'the real server process must be gone');
});

test('security_scan catches JSX/DB-URL/pickle leaks while allowing application/ld+json JSON.stringify', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-sec-');
  const antKey = ['sk', 'ant', 'api03', 'ZzYyXxWwVvUu123456TtSsRrQqPp'].join('-');
  write(
    path.join(project, 'App.tsx'),
    [
      `export const A = () => <AIProvider apiKey="${antKey}" />;`,
      `const yourSecret = "${antKey}";`,
      'const dbUrl = `postgres://admin:RealProdPass99!@${DB_HOST}:5432/prod`;',
      '',
    ].join('\n')
  );
  write(
    path.join(project, 'worker.py'),
    'import pickle, yaml\nx = pickle.loads(raw); y = yaml.load(cfg, Loader=yaml.SafeLoader)\n'
  );
  const leakRun = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [project, '--json']);
  assert.equal(leakRun.status, 1, leakRun.out);
  const leakReport = JSON.parse(leakRun.out);
  assert.equal(leakReport.blocking_count, 4, leakRun.out);

  const safeDir = withTemp(t, 'boomopen-py-sec-safe-');
  write(
    path.join(safeDir, 'JsonLd.tsx'),
    'export const JsonLd = ({ d }: { d: object }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />;\n'
  );
  const safeRun = runPython(t, kitScript('skills/security-auditor/scripts/security_scan.py'), [safeDir, '--json']);
  assert.equal(safeRun.status, 0, safeRun.out);
  assert.equal(JSON.parse(safeRun.out).blocking_count, 0);
});

test('ux_audit passes <Card> components and DESIGN_CONTRACT globals.css with 3 fonts + view-timeline', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-ux-card-');
  write(path.join(project, 'Card.tsx'), 'export function Card({ title }: { title: string }) { return <div className="bg-card">{title}</div>; }\n');
  write(
    path.join(project, 'globals.css'),
    [
      '@font-face { font-family: "Instrument Serif"; src: url("/f1.woff2"); }',
      '@font-face { font-family: "Plus Jakarta Sans"; src: url("/f2.woff2"); }',
      '@font-face { font-family: "JetBrains Mono"; src: url("/f3.woff2"); }',
      ':root { --surface-card: oklch(1 0 0); }',
      'h1 { font-family: var(--font-display); }',
      'body { font-family: var(--font-sans); }',
      'code { font-family: var(--font-mono); }',
      '.reveal { view-timeline-name: --card; animation-timeline: view(); }',
      '@media (prefers-reduced-motion: reduce) { .reveal { animation: none; } }',
      '',
    ].join('\n')
  );
  const { status, out } = runPython(t, kitScript('skills/frontend-design/scripts/ux_audit.py'), [project, '--json']);
  assert.equal(status, 0, out);
  const report = JSON.parse(out);
  assert.deepEqual(report.issues, []);
});

test('accessibility_checker ignores TypeScript <HTMLDivElement> generics and flags unlabeled icon buttons', { skip: SKIP }, (t) => {
  const cleanDir = withTemp(t, 'boomopen-py-a11y-ts-');
  write(
    path.join(cleanDir, 'Card.tsx'),
    'import React from "react";\nexport const Card = (p: React.HTMLAttributes<HTMLDivElement>) => <div {...p} />;\n'
  );
  const cleanRun = runPython(t, kitScript('skills/frontend-design/scripts/accessibility_checker.py'), [cleanDir, '--json']);
  assert.equal(cleanRun.status, 0, cleanRun.out);
  assert.equal(JSON.parse(cleanRun.out).issues_found, 0);

  const badDir = withTemp(t, 'boomopen-py-a11y-icon-');
  write(path.join(badDir, 'IconBtn.tsx'), 'export const B = () => <button onClick={close}><TrashIcon /></button>;\n');
  const badRun = runPython(t, kitScript('skills/frontend-design/scripts/accessibility_checker.py'), [badDir, '--json']);
  assert.equal(badRun.status, 1, badRun.out);
  assert.equal(JSON.parse(badRun.out).issues_found, 1);
});

test('test_runner skips 0-test Python projects cleanly instead of failing with pytest exit 5', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-empty-pytest-');
  write(path.join(project, 'pyproject.toml'), '[project]\nname = "demo"\nversion = "0.1.0"\n');
  write(path.join(project, 'app.py'), 'def add(a: int, b: int) -> int:\n    return a + b\n');
  const { status, out } = runPython(t, kitScript('skills/testing-patterns/scripts/test_runner.py'), [project]);
  assert.equal(status, 0, out);
  assert.match(out, /\[SKIP\]/);
});

test('schema_validator discovers src/db/schema.ts and handles nested Drizzle { enum } braces', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-drizzle-');
  write(
    path.join(project, 'src', 'db', 'schema.ts'),
    [
      "import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';",
      "export const orders = pgTable('orders', {",
      "  orgId: uuid('org_id').notNull(),",
      "  status: text('status', { enum: ['pending', 'paid'] }).notNull(),",
      "  id: uuid('id').defaultRandom().primaryKey(),",
      "  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),",
      "}, (t) => [index('idx_org').on(t.orgId)]);",
      '',
    ].join('\n')
  );
  const { status, out } = runPython(t, kitScript('skills/database-design/scripts/schema_validator.py'), [project, '--json']);
  assert.equal(status, 0, out);
  const report = JSON.parse(out);
  assert.equal(report.schemas_checked, 1);
  assert.equal(report.issues_found, 0, out);
});

test('api_validator skips frontend user.api.ts clients, accepts Response.json, and session_manager reads verified phases', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-api-ledger-');
  write(
    path.join(project, 'src', 'app', 'api', 'health', 'route.ts'),
    'export async function GET() {\n  return Response.json({ ok: true, schema: "v1" }, { status: 200 });\n}\n'
  );
  write(
    path.join(project, 'src', 'features', 'users', 'user.api.ts'),
    'export async function getUsers() {\n  const r = await fetch("/api/users");\n  return r.json();\n}\n'
  );
  write(
    path.join(project, '.boomopen', 'project-ledger.json'),
    JSON.stringify({ project_name: 'demo-app', phases: [{ id: 'P1', status: 'verified' }, { id: 'P2', status: 'pending' }] })
  );
  const apiRun = runPython(t, kitScript('skills/api-patterns/scripts/api_validator.py'), [project, '--json']);
  assert.equal(apiRun.status, 0, apiRun.out);
  assert.equal(JSON.parse(apiRun.out).files_checked, 1);

  const sessRun = runPython(t, kitScript('scripts/session_manager.py'), ['info', project]);
  assert.equal(sessRun.status, 0, sessRun.out);
  const info = JSON.parse(sessRun.out);
  assert.equal(info.autopilot_ledger.project, 'demo-app');
  assert.equal(info.autopilot_ledger.phases_completed, 1);
});

const HAS_TYPE_COVERAGE = fs.existsSync(kitScript('skills_library/lint-and-validate/scripts/type_coverage.py'));

test('type_coverage uses AST without double-counting Python defs, strips TS comments/strings, removes 30-file cap, and enforces Tier 1 zero-any', { skip: SKIP || (!HAS_TYPE_COVERAGE && 'skills_library not available') }, (t) => {
  const pyDir = withTemp(t, 'boomopen-py-typecov-');
  for (let i = 0; i < 35; i += 1) {
    write(path.join(pyDir, `mod_${i}.py`), `def f_${i}(x: int) -> int:\n    return x + ${i}\n`);
  }
  write(path.join(pyDir, 'tests', 'test_untyped.py'), 'def test_raw(a, b):\n    return a + b\n');
  const pyRun = runPython(t, kitScript('skills_library/lint-and-validate/scripts/type_coverage.py'), [pyDir, '--json']);
  assert.equal(pyRun.status, 0, pyRun.out);
  const pyReport = JSON.parse(pyRun.out);
  const pyStats = pyReport.results.find((r) => r.type === 'python');
  assert.equal(pyStats.files, 35, 'must scan all 35 .py files without 30-file cap and skip tests/');
  assert.equal(pyStats.stats.typed_functions, 35, 'def f(x: int) -> int must count as 1 typed function, not 2');
  assert.equal(pyStats.stats.untyped_functions, 0);

  const tsCleanDir = withTemp(t, 'boomopen-ts-typecov-clean-');
  write(
    path.join(tsCleanDir, 'service.ts'),
    [
      '// Note: never use value: any or x as any here',
      'const doc = "example: any or foo as any";',
      'export function greet(name: string): string { return `${doc}: ${name}`; }',
      '',
    ].join('\n')
  );
  write(path.join(tsCleanDir, 'service.test.ts'), 'const mockVal: any = 123;\n');
  const tsClean = runPython(t, kitScript('skills_library/lint-and-validate/scripts/type_coverage.py'), [tsCleanDir, '--json']);
  assert.equal(tsClean.status, 0, tsClean.out);
  assert.equal(JSON.parse(tsClean.out).results[0].stats.any_count, 0);

  const tsBadDir = withTemp(t, 'boomopen-ts-typecov-bad-');
  write(path.join(tsBadDir, 'bad.ts'), 'export function parse(input: any): string { return String(input); }\n');
  const tsBad = runPython(t, kitScript('skills_library/lint-and-validate/scripts/type_coverage.py'), [tsBadDir, '--json']);
  assert.equal(tsBad.status, 1, 'even 1 explicit any must fail under BoomOpen Tier 1');
  assert.equal(JSON.parse(tsBad.out).passed, false);
});

test('accessibility_checker and ux_audit exclude test files/dirs and accessibility_checker has no 50-file cap', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-ui-notests-');
  for (let i = 0; i < 60; i += 1) {
    write(path.join(project, 'src', `Item${i}.tsx`), `export const Item${i} = () => <button type="button">Item ${i}</button>;\n`);
  }
  write(path.join(project, 'src', 'Broken61.tsx'), 'export const Broken = () => <button onClick={fn}></button>;\n');
  const cappedCheck = runPython(t, kitScript('skills/frontend-design/scripts/accessibility_checker.py'), [project, '--json']);
  assert.equal(cappedCheck.status, 1, 'must scan past 50 files and catch Broken61.tsx');
  assert.equal(JSON.parse(cappedCheck.out).files_checked, 61);

  fs.unlinkSync(path.join(project, 'src', 'Broken61.tsx'));
  write(path.join(project, 'src', 'Button.test.tsx'), 'export const T = () => <button onClick={fn}></button>;\n');
  write(path.join(project, '__tests__', 'Fixture.tsx'), 'export const F = () => <div onClick={fn}><img src="/x.png" /></div>;\n');

  const a11yClean = runPython(t, kitScript('skills/frontend-design/scripts/accessibility_checker.py'), [project, '--json']);
  assert.equal(a11yClean.status, 0, a11yClean.out);
  assert.equal(JSON.parse(a11yClean.out).files_checked, 60);

  const uxClean = runPython(t, kitScript('skills/frontend-design/scripts/ux_audit.py'), [project, '--json']);
  assert.equal(uxClean.status, 0, uxClean.out);
  assert.equal(JSON.parse(uxClean.out).files_checked, 60);
});

test('test_runner detects .test.ts and .spec.ts files', { skip: SKIP }, (t) => {
  const project = withTemp(t, 'boomopen-py-ts-tests-');
  write(
    path.join(project, 'math.test.ts'),
    "import test from 'node:test';\nimport assert from 'node:assert/strict';\ntest('adds', () => { assert.equal(1 + 1, 2); });\n"
  );
  const { status, out } = runPython(t, kitScript('skills/testing-patterns/scripts/test_runner.py'), [project, '--json']);
  const report = JSON.parse(out);
  assert.equal(report.skipped, false, 'must detect .test.ts instead of skipping');
  assert.equal(report.framework, 'node --test');
  assert.equal(status, 0, out);
});

test('playwright_runner uses uv/npx hints and auto-detects Node playwright.config.ts when Python playwright is absent', { skip: SKIP }, (t) => {
  const emptyDir = withTemp(t, 'boomopen-py-pw-empty-');
  const noCfg = runPython(t, kitScript('skills/webapp-testing/scripts/playwright_runner.py'), ['http://127.0.0.1:9', '--project', emptyDir]);
  if (noCfg.out.includes('Playwright not installed')) {
    assert.equal(noCfg.status, 1);
    assert.doesNotMatch(noCfg.out, /pip install/);
    assert.match(noCfg.out, /uv run|npx playwright/);

    const nodeProj = withTemp(t, 'boomopen-py-pw-node-');
    write(path.join(nodeProj, 'playwright.config.ts'), 'export default {};\n');
    const binDir = path.join(nodeProj, 'node_modules', '.bin');
    fs.mkdirSync(binDir, { recursive: true });
    write(path.join(binDir, 'fake_pw.py'), 'import sys\nprint("1 passed")\nsys.exit(0)\n');
    const pyExe = spawnSync(PYTHON[0], [...PYTHON.slice(1), '-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' }).stdout.trim();
    write(path.join(binDir, 'playwright.cmd'), `@"${pyExe}" -B "${path.join(binDir, 'fake_pw.py')}" %*\r\n`);
    fs.writeFileSync(path.join(binDir, 'playwright'), `#!/bin/sh\nexec "${pyExe}" -B "${path.join(binDir, 'fake_pw.py')}" "$@"\n`, { mode: 0o755 });

    const autoSuite = runPython(t, kitScript('skills/webapp-testing/scripts/playwright_runner.py'), ['http://127.0.0.1:3000', '--project', nodeProj]);
    assert.equal(autoSuite.status, 0, autoSuite.out);
    assert.equal(JSON.parse(autoSuite.out).runner, 'node-playwright-test');
  }
});

test('checklist and verify_all gracefully skip optional skills_library checks when skills_library/ is not bundled', { skip: SKIP }, (t) => {
  const passScript = 'print("ok")\n';
  const skipScript = 'print("[SKIP] nothing")\n';
  const kit = buildFakeKit(t, {
    'skills/security-auditor/scripts/security_scan.py': passScript,
    'skills/api-patterns/scripts/api_validator.py': skipScript,
    'skills/database-design/scripts/schema_validator.py': skipScript,
    'skills/testing-patterns/scripts/test_runner.py': passScript,
    'skills/frontend-design/scripts/ux_audit.py': skipScript,
    'skills/frontend-design/scripts/accessibility_checker.py': skipScript,
    'skills/seo-fundamentals/scripts/seo_checker.py': skipScript,
    'skills/webapp-testing/scripts/playwright_runner.py': passScript,
    'skills/mobile-design/scripts/mobile_audit.py': skipScript,
  });
  const project = withTemp(t, 'boomopen-py-unbundled-');
  const cl = runPython(t, path.join(kit, 'scripts', 'checklist.py'), [project, '--url', 'http://127.0.0.1:3000']);
  assert.equal(cl.status, 0, cl.out);
  assert.doesNotMatch(cl.out, /MISSING/);

  const va = runPython(t, path.join(kit, 'scripts', 'verify_all.py'), [project, '--url', 'http://127.0.0.1:3000']);
  assert.equal(va.status, 0, va.out);
  assert.doesNotMatch(va.out, /MISSING/);
});
