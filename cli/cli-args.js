'use strict';

/**
 * Shared strict CLI argument parser and verification command runner for BoomOpen subcommands
 * (`research`, `design`, `plan`, `cook`, `ledger`, `conduct`, `audit`, `reconcile`).
 * Rejects unknown `-*` options and missing or flag-swallowed values with `EXIT_USAGE (2)`.
 */

const { spawnSync } = require('node:child_process');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const DEFAULT_VERIFY_TIMEOUT_MS = 60000;

const REPEATABLE_LIST_FLAGS = new Set([
  'docs', 'owned-files', 'owned', 'read-only-files', 'read-only', 'engines', 'checks', 'tags',
  'files', 'targets', 'domains', 'skills', 'specs', 'select', 'exclude', 'defer', 'locked-tests',
  'changed', 'ignore',
]);

function toKebabFlagKey(raw) {
  return String(raw || '').replace(/^-+/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Parse subcommand argv strictly against declared boolean, optional-value, and value flags.
 * Repeatable list flags comma-join across repeated occurrences; scalar flags use last-value-wins.
 *
 * @param {string[]} argv
 * @param {{
 *   defaults?: Record<string, unknown>,
 *   booleanFlags?: Record<string, { key: string, value?: boolean } | string>,
 *   valueFlags?: Record<string, string>,
 *   optionalValueFlags?: Record<string, { key: string, value?: boolean } | string>,
 *   repeatableFlags?: Set<string> | string[],
 *   allowDashValueFlags?: Set<string> | string[],
 * }} [spec]
 * @returns {{ flags: Record<string, unknown>, positional: string[], error: string | null }}
 */
function parseSubcommandArgs(argv = [], spec = {}) {
  const flags = { ...(spec.defaults || {}) };
  const boolMap = spec.booleanFlags || {};
  const valMap = spec.valueFlags || {};
  const optValMap = spec.optionalValueFlags || {};
  const allowDash = spec.allowDashValueFlags instanceof Set
    ? spec.allowDashValueFlags
    : new Set(spec.allowDashValueFlags || []);
  const customRepeatable = spec.repeatableFlags instanceof Set
    ? spec.repeatableFlags
    : new Set(spec.repeatableFlags || []);
  const knownFlags = new Set([...Object.keys(boolMap), ...Object.keys(valMap)]);
  const seenValueKeys = new Set();
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
      if (inlineVal === undefined && Object.prototype.hasOwnProperty.call(optValMap, flagName)) {
        const nextRaw = argv[i + 1];
        if (nextRaw === undefined || (String(nextRaw).startsWith('-') && String(nextRaw) !== '-')) {
          const optTarget = optValMap[flagName];
          if (typeof optTarget === 'string') flags[optTarget] = true;
          else flags[optTarget.key] = optTarget.value !== undefined ? optTarget.value : true;
          continue;
        }
      }
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
      const isList = customRepeatable.has(flagName) || customRepeatable.has(key)
        || REPEATABLE_LIST_FLAGS.has(toKebabFlagKey(flagName))
        || REPEATABLE_LIST_FLAGS.has(toKebabFlagKey(key));
      flags[key] = isList && seenValueKeys.has(key) && flags[key] ? `${flags[key]},${strVal}` : strVal;
      seenValueKeys.add(key);
      continue;
    }

    return { flags, positional, error: `Unknown option "${flagName}".` };
  }

  return { flags, positional, error: null };
}

function splitCommaOption(raw) {
  if (!raw || typeof raw !== 'string') return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

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
  REPEATABLE_LIST_FLAGS,
  parseSubcommandArgs,
  splitCommaOption,
  runVerifyCommands,
};
