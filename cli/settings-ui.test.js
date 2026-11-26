const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const { startSettingsUiServer } = require('./settings-ui.js');
const { renderActiveSettingsMarkdown, PRESETS } = require('./settings.js');

const STREAM_LIMIT_BYTES = 400 * 1024 * 1024;
const KIT_HEADER = '# CLAUDE.md — Claude Code Orchestrator Instructions (v5.5 test)\n\n';

/** Raw request so Host/Origin/Content-Type can be forged exactly as a browser or attacker would. */
function request(port, { method = 'GET', pathName = '/api/settings', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, method, path: pathName, headers }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

async function withServer(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-ui-'));
  const homeDir = path.join(root, 'home');
  const cwd = path.join(root, 'workspace');
  fs.mkdirSync(cwd, { recursive: true });
  const claudeMd = path.join(homeDir, '.claude', 'CLAUDE.md');
  fs.mkdirSync(path.dirname(claudeMd), { recursive: true });
  fs.writeFileSync(claudeMd, `${KIT_HEADER}${renderActiveSettingsMarkdown(PRESETS['solo-fast'])}\n`);
  const { server, port } = await startSettingsUiServer({ port: 0, openBrowser: false, silent: true, homeDir, cwd });
  try {
    const page = await request(port, { pathName: '/', headers: { Host: `127.0.0.1:${port}` } });
    const token = /const TOKEN = "([0-9a-f]+)"/.exec(page.body)[1];
    await fn({ port, homeDir, cwd, claudeMd, token, page });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const jsonPost = (port, pathName, payload, headers = {}) =>
  request(port, {
    method: 'POST',
    pathName,
    headers: { 'Content-Type': 'application/json', Host: `127.0.0.1:${port}`, ...headers },
    body: JSON.stringify(payload),
  });

test('settings UI rejects cross-site, rebinding, wrong content type and tokenless requests, and locks CSP script-src (M14)', async () => {
  await withServer(async ({ port, homeDir, cwd, claudeMd, token, page }) => {
    const scriptBody = /<script>([\s\S]*?)<\/script>/.exec(page.body)[1];
    const expectedHash = crypto.createHash('sha256').update(scriptBody, 'utf8').digest('base64');
    const htmlCsp = String(page.headers['content-security-policy']);
    assert.ok(htmlCsp.includes(`script-src 'sha256-${expectedHash}'`), `expected sha256 script-src, got: ${htmlCsp}`);
    assert.doesNotMatch(htmlCsp, /script-src[^;]*unsafe-inline/);

    const before = fs.readFileSync(claudeMd, 'utf8');
    const settingsBody = { scope: 'global', settings: { verification: { level: 'manual' } } };

    const evil = await request(port, {
      method: 'POST',
      headers: { Host: `127.0.0.1:${port}`, Origin: 'http://evil.example', 'Content-Type': 'text/plain' },
      body: JSON.stringify(settingsBody),
    });
    assert.equal(evil.status, 403);
    const textPlain = await request(port, {
      method: 'POST',
      headers: { Host: `127.0.0.1:${port}`, 'Content-Type': 'text/plain', 'X-BoomOpen-Token': token },
      body: JSON.stringify(settingsBody),
    });
    assert.equal(textPlain.status, 415);
    assert.equal((await jsonPost(port, '/api/settings', settingsBody)).status, 403);
    assert.equal((await request(port, { headers: { Host: `127.0.0.1:${port}` } })).status, 403);
    const rebinding = await request(port, { headers: { Host: `attacker.example:${port}` } });
    assert.equal(rebinding.status, 421);
    assert.ok(!rebinding.body.includes(homeDir), 'no paths leak to a foreign Host');
    const noToken = await jsonPost(port, '/api/settings', settingsBody, { Origin: `http://127.0.0.1:${port}` });
    assert.equal(noToken.status, 403);
    fs.writeFileSync(path.join(cwd, '.boomopen.json'), '{"research":{"depth":"standard"}}');
    const reset = await jsonPost(port, '/api/reset', { scope: 'project' }, { Origin: 'http://evil.example' });
    assert.equal(reset.status, 403);
    assert.ok(fs.existsSync(path.join(cwd, '.boomopen.json')));
    assert.equal((await request(port, { method: 'OPTIONS' })).status, 405);
    assert.equal((await request(port, { method: 'DELETE', pathName: '/api/reset' })).status, 405);

    const get = await request(port, { headers: { Host: `localhost:${port}`, 'X-BoomOpen-Token': token } });
    assert.equal(get.status, 200);
    assert.equal(fs.readFileSync(claudeMd, 'utf8'), before, 'GET /api/settings is side-effect free');

    const ok = await jsonPost(port, '/api/settings', settingsBody, { Origin: `http://127.0.0.1:${port}`, 'X-BoomOpen-Token': token });
    assert.equal(ok.status, 200);
    assert.match(String(ok.headers['content-security-policy']), /default-src 'none'; script-src 'none'/);
    assert.equal(JSON.parse(ok.body).settings.preset, 'custom');
    assert.match(fs.readFileSync(claudeMd, 'utf8'), /verification.level = manual/);

    const frontierRes = await jsonPost(
      port,
      '/api/preset',
      { scope: 'global', preset: 'frontier-guardrails' },
      { Origin: `http://127.0.0.1:${port}`, 'X-BoomOpen-Token': token }
    );
    assert.equal(frontierRes.status, 200);
    assert.equal(JSON.parse(frontierRes.body).settings.preset, 'frontier-guardrails');

    const invertedLimits = await jsonPost(
      port,
      '/api/settings',
      { scope: 'global', settings: { codingStandards: { softFileLines: 600, hardFileLines: 500 } } },
      { Origin: `http://127.0.0.1:${port}`, 'X-BoomOpen-Token': token }
    );
    assert.equal(invertedLimits.status, 400);
    assert.match(JSON.parse(invertedLimits.body).error, /cannot exceed/);
  });
});

test('settings UI global view never returns (or later saves) workspace overrides (M15)', async () => {
  await withServer(async ({ port, homeDir, cwd, token }) => {
    fs.writeFileSync(path.join(cwd, '.boomopen.json'), '{"execution":{"mode":"team"}}');
    const headers = { Origin: `http://127.0.0.1:${port}`, 'X-BoomOpen-Token': token };

    const saved = JSON.parse((await jsonPost(port, '/api/settings', { scope: 'global', settings: { research: { depth: 'standard' } } }, headers)).body);
    assert.equal(saved.settings.execution.mode, 'auto', 'global view shows global values only');
    await jsonPost(port, '/api/settings', { scope: 'global', settings: saved.settings }, headers);
    const globalRaw = JSON.parse(fs.readFileSync(path.join(homeDir, '.boomopen', 'settings.json'), 'utf8'));
    assert.equal(globalRaw.execution.mode, 'auto');

    const projectView = JSON.parse((await request(port, { pathName: '/api/settings?scope=project', headers: { Host: `127.0.0.1:${port}`, 'X-BoomOpen-Token': token } })).body);
    assert.equal(projectView.settings.execution.mode, 'team', 'project view shows effective values');
  });
});

test('settings UI caps request bodies and drops the connection instead of buffering (M22)', async () => {
  await withServer(async ({ port, token }) => {
    const declared = await request(port, {
      method: 'POST',
      headers: {
        Host: `127.0.0.1:${port}`,
        'Content-Type': 'application/json',
        'Content-Length': String(10 * 1024 * 1024),
        'X-BoomOpen-Token': token,
      },
    }).catch((err) => ({ status: 0, error: err }));
    assert.ok(declared.status === 413 || declared.status === 0);

    const outcome = await new Promise((resolve) => {
      const socket = net.connect(port, '127.0.0.1');
      let response = '';
      let sent = 0;
      const chunk = Buffer.alloc(64 * 1024, 'a');
      socket.on('connect', () => {
        socket.write(
          `POST /api/settings HTTP/1.1\r\nHost: 127.0.0.1:${port}\r\nContent-Type: application/json\r\nX-BoomOpen-Token: ${token}\r\nTransfer-Encoding: chunked\r\n\r\n`
        );
        const pump = () => {
          while (sent < STREAM_LIMIT_BYTES && !socket.destroyed) {
            sent += chunk.length;
            if (!socket.write(`${chunk.length.toString(16)}\r\n${chunk}\r\n`)) return socket.once('drain', pump);
          }
          return undefined;
        };
        pump();
      });
      socket.on('data', (d) => (response += d.toString('utf8')));
      socket.on('error', () => {});
      socket.on('close', () => resolve({ response, sent }));
    });
    assert.match(outcome.response, /^HTTP\/1\.1 413/);
    assert.ok(outcome.sent < STREAM_LIMIT_BYTES, 'server closed the connection before the whole stream was sent');
  });
});

test('settings UI exposes smart-hybrid default, editorial tokens, zero inline handlers, EN/VI I18N, and WCAG attributes', async () => {
  const { CATEGORY_SCHEMA, I18N, renderDashboardHtml } = require('./settings-ui-html.js');
  const html = renderDashboardHtml('deadbeef');
  assert.equal(I18N.en.presets[0].id, 'smart-hybrid');
  assert.match(I18N.en.presets[0].title, /Recommended Default/);
  assert.equal(I18N.vi.presets[0].id, 'smart-hybrid');
  assert.ok(I18N.en.presets.some((p) => p.id === 'frontier-guardrails'));
  assert.ok(I18N.en.presets.some((p) => p.id === 'carbon-guardrails'));
  assert.match(html, /Plus Jakarta Sans/);
  assert.match(html, /JetBrains Mono/);
  assert.doesNotMatch(html, /'Inter'|#00f0ff|#8b5cf6|--cyan|--purple/i);
  assert.doesNotMatch(html, /\b(?:onclick|onchange|onkeydown)\s*=/i);
  assert.match(html, /addEventListener/);
  assert.match(html, /aria-label="Settings Scope"/);
  assert.match(html, /aria-label="Toggle UI Language"/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /minmax\(min\(100%, 480px\), 1fr\)/);
  const allKeys = CATEGORY_SCHEMA.flatMap((c) => c.fields.map((f) => f.key));
  assert.ok(allKeys.includes('codingStandards.softFileLines'));
  assert.ok(allKeys.includes('codingStandards.hardFileLines'));
  assert.equal(allKeys.length, 22);
  for (const key of allKeys) {
    assert.ok(I18N.en.hints[key], `missing EN hint for ${key}`);
    assert.ok(I18N.vi.hints[key], `missing VI hint for ${key}`);
    assert.ok(I18N.vi.labels[key], `missing VI label for ${key}`);
  }
  const viHintsBlob = JSON.stringify(I18N.vi.hints);
  for (const staleEnum of ['fixed_small', 'fast_economy', 'quick_scan', 'socratic_3q', 'unit_and_lint', 'minimal_inline']) {
    assert.ok(!viHintsBlob.includes(staleEnum), `VI hints must not mention stale pre-v5.5 enum "${staleEnum}"`);
  }
  assert.match(html, /const esc = \(s\) =>/);
});
