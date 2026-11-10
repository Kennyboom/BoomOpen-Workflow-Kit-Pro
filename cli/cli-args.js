'use strict';

/**
 * Shared strict CLI argument parser and verification command runner for BoomOpen subcommands
 * (`research`, `design`, `plan`, `cook`, `ledger`, `conduct`). Rejects unknown `-*` options and
 * missing or flag-swallowed values with `EXIT_USAGE (2)` so typos never bypass verification gates.
 */

const { spawnSync } = require('node:child_process');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const DEFAULT_VERIFY_TIMEOUT_MS = 60000;

/**
 * Parse subcommand argv strictly against declared boolean and value flags.
 *
 * @param {string[]} argv
 * @param {{
 *   defaults?: Record<string, unknown>,
 *   booleanFlags?: Record<string, { key: string, value?: boolean } | string>,
 *   valueFlags?: Record<string, string>,
 *   allowDashValueFlags?: Set<string> | string[],
 * }} [spec]
 * @returns {{ flags: Record<string, unknown>, positional: string[], error: string | null }}
 */
function parseSubcommandArgs(argv = [], spec = {}) {
  const flags = { ...(spec.defaults || {}) };
  const boolMap = spec.booleanFlags || {};
  const valMap = spec.valueFlags || {};
  const allowDash = spec.allowDashValueFlags instanceof Set
    ? spec.allowDashValueFlags
    : new Set(spec.allowDashValueFlags || []);
  const knownFlags = new Set([...Object.keys(boolMap), ...Object.keys(valMap)]);
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const raw = String(argv[i] ?? '');
    if (!raw.startsWith('-') || raw === '-') {
      positional.push(raw);
      continue;
    }

    const eqIdx = raw.indexOf('=');
    const flagName = eqIdx === -1 ? raw : raw.slice(0, eqIdx);
    const inlineVal = eqIdx === -1 ? undefined : raw.slice(eqIdx + 1);

    if (Object.prototype.hasOwnProperty.call(boolMap, flagName)) {
      if (inlineVal !== undefined) {
        return { flags, positional, error: `Option "${flagName}" does not take a value.` };
      }
      const target = boolMap[flagName];
      if (typeof target === 'string') flags[target] = true;
      else flags[target.key] = target.value !== undefined ? target.value : true;
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(valMap, flagName)) {
      const key = valMap[flagName];
      const val = inlineVal !== undefined ? inlineVal : argv[++i];
      if (val === undefined || String(val).length === 0) {
        return { flags, positional, error: `Option "${flagName}" requires a value.` };
      }
      const strVal = String(val);
      if (inlineVal === undefined && strVal.startsWith('-')) {
        if (!allowDash.has(flagName) || knownFlags.has(strVal.split('=')[0])) {
          return { flags, positional, error: `Option "${flagName}" requires a value (got flag "${strVal}").` };
        }
      }
      flags[key] = strVal;
      continue;
    }

    return { flags, positional, error: `Unknown option "${flagName}".` };
  }

  return { flags, positional, error: null };
}

/**
 * Split a comma-separated CLI option string into trimmed non-empty entries.
 * @param {string | null | undefined} raw
 * @returns {string[]}
 */
function splitCommaOption(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Execute unique shell verification commands synchronously and return failure messages.
 * @param {string[]} commands
 * @param {string} cwd
 * @param {number} [timeoutMs]
 * @returns {string[]}
 */
function runVerifyCommands(commands, cwd, timeoutMs = DEFAULT_VERIFY_TIMEOUT_MS) {
  const failures = [];
  for (const cmd of commands) {
    try {
      const res = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', timeout: timeoutMs, windowsHide: true });
      if (res.error || res.status !== 0) {
        const detail = (res.stderr || res.stdout || (res.error && res.error.message) || '').trim().slice(0, 180);
        failures.push(`Verify command failed (exit ${res.status ?? 1}): "${cmd}"${detail ? ` — ${detail}` : ''}`);
      }
    } catch (err) {
      failures.push(`Verify command threw error: "${cmd}" — ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return failures;
}

module.exports = {
  EXIT_OK,
  EXIT_FAIL,
  EXIT_USAGE,
  parseSubcommandArgs,
  splitCommaOption,
  runVerifyCommands,
};
