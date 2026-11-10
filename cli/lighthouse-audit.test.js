// Regression test: lighthouse_audit.py must fail (and the required Lighthouse gate in
// checklist.py must report FAILED) when Lighthouse writes a report for a page it could not load.
// A fake `lighthouse` executable on PATH writes such a report (runtimeError, null scores, exit 1).
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

const FAKE_LIGHTHOUSE_PY = [
  'import json, sys',
  'out = next(a.split("=", 1)[1] for a in sys.argv if a.startswith("--output-path="))',
  'cats = {k: {"score": None} for k in ("performance", "accessibility", "best-practices", "seo")}',
  'report = {"runtimeError": {"code": "ERRORED_DOCUMENT_REQUEST", "message": "Unable to load the page"}, "categories": cats}',
  'open(out, "w", encoding="utf-8").write(json.dumps(report))',
  'sys.exit(1)',
  '',
].join('\n');

/** A temp folder holding a fake `lighthouse` (plus lighthouse.cmd on Windows) that runs FAKE_LIGHTHOUSE_PY. */
function makeFakeLighthouse(dir) {
  const script = path.join(dir, 'fake_lighthouse.py');
  fs.writeFileSync(script, FAKE_LIGHTHOUSE_PY, 'utf8');
  fs.writeFileSync(path.join(dir, 'lighthouse.cmd'), `@"${PYTHON}" -B "${script}" %*\r\n`, 'utf8');
  fs.writeFileSync(path.join(dir, 'lighthouse'), `#!/bin/sh\nexec "${PYTHON}" -B "${script}" "$@"\n`, { mode: 0o755 });
}

function sandboxEnv(home, binDir) {
  const env = { ...process.env, PYTHONDONTWRITEBYTECODE: '1', HOME: home, USERPROFILE: home };
  env.APPDATA = path.join(home, 'AppData', 'Roaming');
  env.LOCALAPPDATA = path.join(home, 'AppData', 'Local');
  env.XDG_CONFIG_HOME = path.join(home, '.config');
  const pathKey = Object.keys(env).find((key) => key.toUpperCase() === 'PATH') || 'PATH';
  env[pathKey] = `${binDir}${path.delimiter}${env[pathKey] || ''}`;
  return env;
}

function runPython(args, env) {
  const result = spawnSync(PYTHON, ['-B', ...args], { env, encoding: 'utf8', timeout: SCRIPT_TIMEOUT_MS });
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
  makeFakeLighthouse(binDir);
  const env = sandboxEnv(home, binDir);

  const direct = runPython([AUDIT_SCRIPT, DEAD_URL], env);
  assert.equal(direct.status, 1, direct.out);
  assert.match(direct.out, /ERRORED_DOCUMENT_REQUEST/);

  for (const name of ['checklist.py', 'kit_checks.py', 'kit_console.py']) {
    fs.copyFileSync(path.join(REPO_ROOT, 'scripts', name), path.join(kit, 'scripts', name));
  }
  const auditCopy = path.join(kit, 'skills_library', 'performance-profiling', 'scripts', 'lighthouse_audit.py');
  fs.mkdirSync(path.dirname(auditCopy), { recursive: true });
  fs.copyFileSync(AUDIT_SCRIPT, auditCopy);
  // The critical security gate runs first; a passing stand-in lets the checklist reach Lighthouse.
  const securityScan = path.join(kit, 'skills_library', 'vulnerability-scanner', 'scripts', 'security_scan.py');
  fs.mkdirSync(path.dirname(securityScan), { recursive: true });
  fs.writeFileSync(securityScan, 'print("scan ok")\n', 'utf8');
  const gate = runPython([path.join(kit, 'scripts', 'checklist.py'), project, '--url', DEAD_URL], env);
  assert.equal(gate.status, 1, gate.out);
  assert.match(gate.out, /Lighthouse Audit: FAILED/);
  assert.doesNotMatch(gate.out, /Lighthouse Audit: PASSED/);
});
