'use strict';

/**
 * Request hardening for the local settings Web UI:
 * - Host must be a loopback name on the server's own port (blocks DNS rebinding);
 * - a present Origin must be that same loopback origin (blocks cross-site requests);
 * - POST bodies must be `application/json` (forces a CORS preflight, which is never granted);
 * - every /api/* request (and any request carrying Origin) must echo the per-launch token that
 *   GET / embeds in the page;
 * - bodies are capped and the socket is dropped once the cap is exceeded.
 */

const crypto = require('node:crypto');

const MAX_BODY_BYTES = 64 * 1024;
const TOKEN_HEADER = 'x-boomopen-token';
const SOCKET_CLOSE_DELAY_MS = 250;
const LOOPBACK_HOSTS = ['127.0.0.1', 'localhost', '[::1]'];

class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message client-facing message
   * @param {Record<string, string>} [headers] extra response headers
   */
  constructor(status, message, headers = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.headers = headers;
  }
}

function createSecurityContext() {
  return { token: crypto.randomBytes(24).toString('hex'), port: null };
}

function tokensMatch(expected, received) {
  if (typeof received !== 'string' || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

function allowedHostValues(port) {
  return port ? LOOPBACK_HOSTS.map((host) => `${host}:${port}`) : null;
}

function isAllowedHost(hostHeader, port) {
  if (typeof hostHeader !== 'string') return false;
  const host = hostHeader.toLowerCase();
  const allowed = allowedHostValues(port);
  if (allowed) return allowed.includes(host);
  return LOOPBACK_HOSTS.some((name) => host === name || host.startsWith(`${name}:`));
}

/**
 * Throws an HttpError when the request must be rejected.
 * @param {import('node:http').IncomingMessage} req
 * @param {{ token: string, port: number|null }} security
 * @param {{ requireJson: boolean, requireToken?: boolean }} rules
 */
function assertTrustedRequest(req, security, rules) {
  if (!isAllowedHost(req.headers.host, security.port)) {
    throw new HttpError(421, 'Misdirected request: unexpected Host header');
  }
  const origin = req.headers.origin;
  if (origin !== undefined) {
    let originHost = null;
    try {
      const parsed = new URL(origin);
      originHost = parsed.protocol === 'http:' ? parsed.host : null;
    } catch {
      originHost = null;
    }
    if (!originHost || !isAllowedHost(originHost, security.port)) {
      throw new HttpError(403, 'Cross-origin requests are not allowed');
    }
  }
  if ((rules.requireToken || origin !== undefined) && !tokensMatch(security.token, req.headers[TOKEN_HEADER])) {
    throw new HttpError(403, 'Missing or invalid session token');
  }
  if (rules.requireJson) {
    const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (contentType !== 'application/json') throw new HttpError(415, 'Content-Type must be application/json');
  }
}

/** Reads and parses a JSON body of at most MAX_BODY_BYTES; stops reading as soon as it is exceeded. */
function readJsonBody(req, limit = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length']);
    if (Number.isFinite(declared) && declared > limit) {
      req.resume(); // discard without buffering
      reject(new HttpError(413, 'Payload too large'));
      return;
    }
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      req.removeAllListeners('data');
      req.resume(); // keep draining into the void so nothing accumulates in memory
      reject(err);
    };
    req.on('data', (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > limit) {
        fail(new HttpError(413, 'Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        const parsed = raw.trim() ? JSON.parse(raw) : {};
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new HttpError(400, 'Request body must be a JSON object'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new HttpError(400, 'Request body is not valid JSON'));
      }
    });
    req.on('error', fail);
  });
}

const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

/**
 * After an oversized request: give the client a moment to read the 413, then drop the socket so a
 * streaming client cannot keep the connection busy.
 */
function closeAfterResponse(req, res) {
  res.on('finish', () => {
    const timer = setTimeout(() => req.socket?.destroy(), SOCKET_CLOSE_DELAY_MS);
    timer.unref();
  });
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, html) {
  res.writeHead(200, { ...BASE_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = {
  MAX_BODY_BYTES,
  TOKEN_HEADER,
  HttpError,
  createSecurityContext,
  assertTrustedRequest,
  readJsonBody,
  closeAfterResponse,
  sendJson,
  sendHtml,
};
