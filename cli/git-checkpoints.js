'use strict';

/**
 * Lightweight Git Checkpoint & Safe Rollback Primitives (`cli/git-checkpoints.js`).
 * Records `refs/boomopen/checkpoints/<label>` refs on phase/audit transitions and performs
 * confirmation-gated (`--yes`) workspace rollbacks via `git reset --hard <sha>`.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const GIT_TIMEOUT_MS = 15000;
const GIT_MAX_BUFFER = 16 * 1024 * 1024;
const CHECKPOINT_REF_PREFIX = 'refs/boomopen/checkpoints/';

function sanitizeCheckpointLabel(label) {
  const cleaned = String(label || 'default')
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/\.lock$/i, '-lock');
  return cleaned || 'default';
}

function runGit(cwd, args) {
  return spawnSync('git', ['-C', cwd, ...args], {
    encoding: 'utf8',
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: GIT_MAX_BUFFER,
    windowsHide: true,
  });
}

function isScopedGitRepo(root) {
  if (!root || !fs.existsSync(root)) return false;
  const topRes = runGit(root, ['rev-parse', '--show-toplevel']);
  if (topRes.error || topRes.status !== 0 || !topRes.stdout.trim()) return false;
  const rootAbs = path.resolve(root).toLowerCase();
  const topAbs = path.resolve(topRes.stdout.trim()).toLowerCase();
  if (topAbs !== rootAbs) {
    const tmpAbs = path.resolve(os.tmpdir()).toLowerCase();
    const homeAbs = path.resolve(os.homedir()).toLowerCase();
    if (topAbs === tmpAbs || topAbs === homeAbs) return false;
  }
  return true;
}

/**
 * Capture `HEAD` SHA, working-tree dirty status, and update `refs/boomopen/checkpoints/<label>`.
 * Gracefully returns `{ available: false }` outside git repos or on unborn `HEAD`.
 *
 * @param {string} cwd
 * @param {string} label
 */
function createGitCheckpoint(cwd, label) {
  if (!cwd) return { available: false, headSha: null, ref: null, dirty: false, dirtyStatus: '' };
  const root = path.resolve(cwd);
  if (!isScopedGitRepo(root)) {
    return { available: false, headSha: null, ref: null, dirty: false, dirtyStatus: '' };
  }
  const headRes = runGit(root, ['rev-parse', '--verify', 'HEAD']);
  if (headRes.error || headRes.status !== 0 || !headRes.stdout.trim()) {
    return { available: false, headSha: null, ref: null, dirty: false, dirtyStatus: '' };
  }
  const headSha = headRes.stdout.trim();
  const statusRes = runGit(root, ['status', '--porcelain']);
  const dirtyStatus = !statusRes.error && statusRes.status === 0
    ? statusRes.stdout.replace(/\r\n/g, '\n').trimEnd()
    : '';
  const safeLabel = sanitizeCheckpointLabel(label);
  const ref = `${CHECKPOINT_REF_PREFIX}${safeLabel}`;
  const refRes = runGit(root, ['update-ref', ref, headSha]);
  return {
    available: true,
    headSha,
    ref: !refRes.error && refRes.status === 0 ? ref : null,
    label: safeLabel,
    dirty: dirtyStatus.length > 0,
    dirtyStatus,
  };
}

function resolveCheckpointCommit(root, shaOrRef) {
  const raw = String(shaOrRef || '').trim();
  if (!raw) return null;
  const candidates = raw.startsWith('refs/')
    ? [raw]
    : [`${CHECKPOINT_REF_PREFIX}${sanitizeCheckpointLabel(raw)}`, raw];
  for (const cand of candidates) {
    const res = runGit(root, ['rev-parse', '--verify', `${cand}^{commit}`]);
    if (!res.error && res.status === 0 && res.stdout.trim()) {
      return { sha: res.stdout.trim(), resolvedFrom: cand };
    }
  }
  return null;
}

/**
 * Reset tracked workspace files back to `shaOrRef` via `git reset --hard <sha>`.
 * Strictly requires `confirm === true` (`--yes`).
 *
 * @param {string} cwd
 * @param {string} shaOrRef
 * @param {{ confirm?: boolean }} [options]
 */
function rollbackToGitCheckpoint(cwd, shaOrRef, options = {}) {
  if (!options || options.confirm !== true) {
    return {
      ok: false,
      restoredSha: null,
      summary: '',
      error: 'Rollback requires explicit confirmation (pass --yes or { confirm: true }).',
    };
  }
  if (!cwd) return { ok: false, restoredSha: null, summary: '', error: 'Target directory is required.' };
  const root = path.resolve(cwd);
  if (!isScopedGitRepo(root)) {
    return { ok: false, restoredSha: null, summary: '', error: `Not a git repository with commits: ${root}` };
  }
  const resolved = resolveCheckpointCommit(root, shaOrRef);
  if (!resolved) {
    return { ok: false, restoredSha: null, summary: '', error: `Checkpoint SHA or ref not found: "${shaOrRef}"` };
  }
  const prevRes = runGit(root, ['rev-parse', '--verify', 'HEAD']);
  const previousSha = !prevRes.error && prevRes.status === 0 ? prevRes.stdout.trim() : null;
  const resetRes = runGit(root, ['-c', 'core.autocrlf=false', 'reset', '--hard', resolved.sha]);
  if (resetRes.error || resetRes.status !== 0) {
    const detail = (resetRes.stderr || resetRes.stdout || (resetRes.error && resetRes.error.message) || '').trim();
    return { ok: false, restoredSha: null, summary: '', error: `git reset --hard failed: ${detail}` };
  }
  const summary = `Rolled back tracked files to ${resolved.sha.slice(0, 12)} (${resolved.resolvedFrom})`;
  return { ok: true, restoredSha: resolved.sha, previousSha, resolvedFrom: resolved.resolvedFrom, summary };
}

module.exports = {
  CHECKPOINT_REF_PREFIX,
  sanitizeCheckpointLabel,
  createGitCheckpoint,
  rollbackToGitCheckpoint,
};
