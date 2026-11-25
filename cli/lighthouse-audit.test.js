// Regression tests for lighthouse_audit.py:
// 1. Fails (exit 1, passed=false) when Lighthouse reports a runtimeError / null scores.
// 2. Resolves local node_modules/.bin/lighthouse relative to the target project directory
//    (both via CLI argument and via checklist.py BOOMOPEN_PROJECT_DIR), fails when
//    performance/accessibility < 50, and passes when scores >= 50.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const AUDIT_SCRIPT = path.join(REPO_ROOT, 'skills_library', 'performance-profiling', 'scripts', 'lighthouse_audit.py');
const PYTHON_CANDIDATES = [['python3'], ['python'], ['py', '-3']];
const SCRIPT_TIMEOUT_MS = 120000;
const DEAD_URL = 'http://127.0.0.1:9';

function findPython() {
  for (const candidate of PYTHON_CANDIDATES) {
    const probe = spawnSync(candidate[0], [...candidate.slice(1), '-c', 'import sys; print(sys.executable)'], { encoding: 'utf8' });
    if (probe.status === 0 && probe.stdout.trim()) return probe.stdout.trim();
  }
  return null;
}

const PYTHON = findPython();
const SKIP = PYTHON && fs.existsSync(AUDIT_SCRIPT) ? false : 'Python 3 or skills_library is not available';

function buildFakeLighthousePy(reportObj, exitCode = 0) {
  return [
    'import json, sys',
    'out = next(a.split("=", 1)[1] for a in sys.argv if a.startswith("--output-path="))',
    `report = json.loads(${JSON.stringify(JSON.stringify(reportObj))})`,
    'open(out, "w", encoding="utf-8").write(json.dumps(report))',
    `sys.exit(${exitCode})`,
    '',
  ].join('\n');
}

function makeFakeLighthouse(dir, reportObj, exitCode = 0) {
  fs.mkdirSync(dir, { recursive: true });
  const script = path.join(dir, 'fake_lighthouse.py');
  fs.writeFileSync(script, buildFakeLighthousePy(reportObj, exitCode), 'utf8');
  fs.writeFileSync(path.join(dir, 'lighthouse.cmd'), `@"${PYTHON}" -B "${script}" %*\r\n`, 'utf8');
  fs.writeFileSync(path.join(dir, 'lighthouse'), `#!/bin/sh\nexec "${PYTHON}" -B "${script}" "$@"\n`, { mode: 0o755 });
}

function sandboxEnv(home, binDir) {
  const env = { ...process.env, PYTHONDONTWRITEBYTECODE: '1', HOME: home, USERPROFILE: home };
  env.APPDATA = path.join(home, 'AppData', 'Roaming');
  env.LOCALAPPDATA = path.join(home, 'AppData', 'Local');
  env.XDG_CONFIG_HOME = path.join(home, '.config');
  const pathKey = Object.keys(env).find((key) => key.toUpperCase() === 'PATH') || 'PATH';
  env[pathKey] = binDir ? `${binDir}${path.delimiter}${env[pathKey] || ''}` : (env[pathKey] || '');
  return env;
}

function runPython(args, env, cwd = REPO_ROOT) {
  const result = spawnSync(PYTHON, ['-B', ...args], { cwd, env, encoding: 'utf8', timeout: SCRIPT_TIMEOUT_MS });
  return { status: result.status, out: `${result.stdout || ''}${result.stderr || ''}` };
}

test('lighthouse_audit.py and the checklist Lighthouse gate fail when Lighthouse could not load the page', { skip: SKIP }, (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-lighthouse-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const binDir = path.join(root, 'bin');
  const home = path.join(root, 'home');
  const kit = path.join(root, 'kit');
  const project = path.join(root, 'project');
  for (const dir of [binDir, home, path.join(kit, 'scripts'), project]) fs.mkdirSync(dir, { recursive: true });
  makeFakeLighthouse(binDir, {
    runtimeError: { code: 'ERRORED_DOCUMENT_REQUEST', message: 'Unable to load the page' },
    categories: {
      performance: { score: null },
      accessibility: { score: null },
      'best-practices': { score: null },
      seo: { score: null },
    },
  }, 1);
  const env = sandboxEnv(home, binDir);

  const direct = runPython([AUDIT_SCRIPT, DEAD_URL], env);
  assert.equal(direct.status, 1, direct.out);
  assert.match(direct.out, /ERRORED_DOCUMENT_REQUEST/);
  assert.equal(JSON.parse(direct.out).passed, false);

  for (const name of ['checklist.py', 'kit_checks.py', 'kit_console.py']) {
    fs.copyFileSync(path.join(REPO_ROOT, 'scripts', name), path.join(kit, 'scripts', name));
  }
  const auditCopy = path.join(kit, 'skills_library', 'performance-profiling', 'scripts', 'lighthouse_audit.py');
  fs.mkdirSync(path.dirname(auditCopy), { recursive: true });
  fs.copyFileSync(AUDIT_SCRIPT, auditCopy);
  const securityScan = path.join(kit, 'skills', 'security-auditor', 'scripts', 'security_scan.py');
  fs.mkdirSync(path.dirname(securityScan), { recursive: true });
  fs.writeFileSync(securityScan, 'print("scan ok")\n', 'utf8');
  const gate = runPython([path.join(kit, 'scripts', 'checklist.py'), project, '--url', DEAD_URL], env);
  assert.equal(gate.status, 1, gate.out);
  assert.match(gate.out, /Lighthouse Audit: FAILED/);
  assert.doesNotMatch(gate.out, /Lighthouse Audit: PASSED/);
});

test('lighthouse_audit.py resolves project-local binary and enforces minimum score threshold', { skip: SKIP }, (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-lh-local-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const home = path.join(root, 'home');
  const outsideCwd = path.join(root, 'outside-cwd');
  const poorProject = path.join(root, 'poor-project');
  const goodProject = path.join(root, 'good-project');
  for (const dir of [home, outsideCwd, poorProject, goodProject]) fs.mkdirSync(dir, { recursive: true });

  makeFakeLighthouse(path.join(poorProject, 'node_modules', '.bin'), {
    categories: {
      performance: { score: 0.35 },
      accessibility: { score: 0.92 },
      'best-practices': { score: 0.90 },
      seo: { score: 0.95 },
    },
  }, 0);

  makeFakeLighthouse(path.join(goodProject, 'node_modules', '.bin'), {
    categories: {
      performance: { score: 0.91 },
      accessibility: { score: 0.96 },
      'best-practices': { score: 0.95 },
      seo: { score: 0.98 },
    },
  }, 0);

  const env = sandboxEnv(home, '');
  const poorRun = runPython([AUDIT_SCRIPT, 'http://127.0.0.1:3000', poorProject], env, outsideCwd);
  assert.equal(poorRun.status, 1, poorRun.out);
  const poorJson = JSON.parse(poorRun.out);
  assert.equal(poorJson.passed, false);
  assert.equal(poorJson.scores.performance, 35);

  const goodRun = runPython([AUDIT_SCRIPT, 'http://127.0.0.1:3000', '--project', goodProject], env, outsideCwd);
  assert.equal(goodRun.status, 0, goodRun.out);
  const goodJson = JSON.parse(goodRun.out);
  assert.equal(goodJson.passed, true);
  assert.equal(goodJson.scores.performance, 91);
});
