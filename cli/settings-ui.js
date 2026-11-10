const http = require('node:http');
const { exec, execFile } = require('node:child_process');

const {
  PRESETS,
  ALLOWED_ENUMS,
  CODING_STANDARDS_PRESETS,
  SETTING_DESCRIPTIONS,
  getSettingsPaths,
  loadSettings,
  saveSettings,
  applyPreset,
  resetSettings,
  renderActiveSettingsMarkdown,
  detectInstalledPlatforms,
} = require('./settings.js');
const {
  LINE_LIMIT_KEYS,
  MIN_LINE_LIMIT,
  MAX_LINE_LIMIT,
  coerceEnumValue,
  coerceLineLimit,
  readPatchValue,
} = require('./settings-schema.js');
const { renderDashboardHtml } = require('./settings-ui-html.js');
const {
  HttpError,
  createSecurityContext,
  assertTrustedRequest,
  readJsonBody,
  closeAfterResponse,
  sendJson,
  sendHtml,
} = require('./settings-http.js');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4567;

/** Allowed methods per route; anything else gets 405 (OPTIONS included, so no CORS is ever granted). */
const ROUTES = {
  '/': 'GET',
  '/api/settings': 'GET, POST',
  '/api/preset': 'POST',
  '/api/reset': 'POST',
};

const pickScope = (value) => (value === 'project' ? 'project' : 'global');

/**
 * Settings as seen from one scope: global-only values for the global view (so a later global save
 * can never copy workspace overrides into ~/.boomopen/settings.json), effective values otherwise.
 */
const loadScopedSettings = (scope, options) =>
  loadSettings({ ...options, scope: scope === 'project' ? undefined : 'global' });

function resultPayload(result, options) {
  const settings = loadScopedSettings(result.scope, options);
  return {
    ok: true,
    scope: result.scope,
    message: result.message,
    elapsedMs: result.syncReport?.elapsedMs ?? 0,
    settings,
    markdownPreview: renderActiveSettingsMarkdown(settings),
    installStatus: detectInstalledPlatforms(options.homeDir),
    syncReport: result.syncReport,
  };
}

/** Read-only: never writes settings or platform files. */
function getSettingsPayload(scope, options) {
  const opts = { ...options, scope: scope === 'project' ? undefined : 'global' };
  const settings = loadScopedSettings(scope, options);
  return {
    ok: true,
    scope,
    settings,
    presets: PRESETS,
    allowedEnums: ALLOWED_ENUMS,
    codingPresets: CODING_STANDARDS_PRESETS,
    descriptions: SETTING_DESCRIPTIONS,
    markdownPreview: renderActiveSettingsMarkdown(settings),
    installStatus: detectInstalledPlatforms(options.homeDir),
    syncStatus: detectInstalledPlatforms(options.homeDir),
    paths: getSettingsPaths(opts),
  };
}

function validateLineLimitPatch(patch, scope, options) {
  const rawSoft = readPatchValue(patch, LINE_LIMIT_KEYS[0]);
  const rawHard = readPatchValue(patch, LINE_LIMIT_KEYS[1]);
  if (rawSoft === undefined && rawHard === undefined) return;
  const patchSoft = rawSoft === undefined ? undefined : coerceLineLimit(rawSoft);
  const patchHard = rawHard === undefined ? undefined : coerceLineLimit(rawHard);
  if (rawSoft !== undefined && patchSoft === undefined) {
    throw new HttpError(400, `Invalid codingStandards.softFileLines "${rawSoft}" (expected integer ${MIN_LINE_LIMIT}..${MAX_LINE_LIMIT})`);
  }
  if (rawHard !== undefined && patchHard === undefined) {
    throw new HttpError(400, `Invalid codingStandards.hardFileLines "${rawHard}" (expected integer ${MIN_LINE_LIMIT}..${MAX_LINE_LIMIT})`);
  }
  const currentCs = loadScopedSettings(scope, options).codingStandards;
  const stdPreset = coerceEnumValue('codingStandards.preset', readPatchValue(patch, 'codingStandards.preset')) || currentCs.preset;
  const baseCs = stdPreset === currentCs.preset ? currentCs : CODING_STANDARDS_PRESETS[stdPreset];
  const nextSoft = patchSoft ?? baseCs.softFileLines;
  const nextHard = patchHard ?? baseCs.hardFileLines;
  if (nextSoft > nextHard) {
    throw new HttpError(400, `codingStandards.softFileLines (${nextSoft}) cannot exceed codingStandards.hardFileLines (${nextHard})`);
  }
}

async function handlePost(pathname, req, options) {
  const body = await readJsonBody(req);
  const scope = pickScope(body.scope);
  const opts = { ...options, scope };
  if (pathname === '/api/settings') {
    const patch = body.settings && typeof body.settings === 'object' ? body.settings : {};
    validateLineLimitPatch(patch, scope, options);
    return resultPayload(saveSettings(patch, opts), options);
  }
  if (pathname === '/api/preset') return resultPayload(applyPreset(body.preset, opts), options);
  return resultPayload(resetSettings(opts), options);
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {object} options settings options plus `security` ({ token, port }) from the server
 */
async function handleSettingsApiRequest(req, res, options = {}) {
  const security = options.security || { token: createSecurityContext().token, port: null };
  try {
    const parsedUrl = new URL(req.url || '/', 'http://127.0.0.1');
    const pathname = parsedUrl.pathname;
    const allowed = ROUTES[pathname];
    if (!allowed) throw new HttpError(404, 'Not found');
    if (!allowed.split(', ').includes(req.method)) throw new HttpError(405, 'Method not allowed', { Allow: allowed });
    assertTrustedRequest(req, security, { requireJson: req.method === 'POST', requireToken: pathname !== '/' });

    if (pathname === '/') {
      sendHtml(res, renderDashboardHtml(security.token));
      return true;
    }
    if (req.method === 'GET') {
      sendJson(res, 200, getSettingsPayload(pickScope(parsedUrl.searchParams.get('scope')), options));
      return true;
    }
    sendJson(res, 200, await handlePost(pathname, req, options));
    return true;
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 400;
    const headers = err instanceof HttpError ? err.headers : {};
    if (status === 413) closeAfterResponse(req, res);
    sendJson(res, status, { ok: false, error: err instanceof Error ? err.message : String(err) }, headers);
    return status !== 404;
  }
}

/** `url` is built only from the bound host and numeric port, never from request data. */
function openInBrowser(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`, () => {});
    return;
  }
  execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], () => {});
}

function startSettingsUiServer(options = {}) {
  const host = options.host || DEFAULT_HOST;
  const requestedPort = typeof options.port === 'number' ? options.port : DEFAULT_PORT;
  const security = createSecurityContext();
  const handlerOptions = { ...options, security };
  const server = http.createServer((req, res) => {
    handleSettingsApiRequest(req, res, handlerOptions).catch((err) => {
      if (!res.headersSent) sendJson(res, 500, { ok: false, error: err instanceof Error ? err.message : String(err) });
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        reject(new Error(`port ${requestedPort} is in use; pass --port <n> (or --port 0 for any free port)`));
        return;
      }
      reject(err);
    });
    server.listen(requestedPort, host, () => {
      const addr = server.address();
      const activePort = typeof addr === 'object' && addr ? addr.port : requestedPort;
      security.port = activePort;
      const url = `http://${host.includes(':') ? `[${host}]` : host}:${activePort}`;
      if (!options.silent) {
        console.log(`\n🌐 BoomOpen Web Control Center running at: ${url}`);
        console.log('   Press Ctrl+C to stop the server.\n');
      }
      if (options.openBrowser) openInBrowser(url);
      resolve({ server, url, port: activePort });
    });
  });
}

module.exports = {
  renderDashboardHtml,
  handleSettingsApiRequest,
  startSettingsUiServer,
};
