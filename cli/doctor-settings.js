'use strict';

/**
 * Settings diagnostics: reads ~/.boomopen/settings.json and ./.boomopen.json directly and fails on
 * broken JSON or on keys/values the settings engine would silently ignore.
 */

const fs = require('node:fs');

const { readTextFile } = require('./checker-text.js');
const {
  DEFAULT_SETTINGS,
  getSettingByKey,
  getSettingsPaths,
  validateAndSanitizeSettings,
} = require('./settings.js');

const CHECK_NAME = 'Settings (global + workspace)';
const IGNORED_LEAF_KEYS = new Set(['version']);
const MAX_ISSUES_SHOWN = 5;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Flatten nested objects into dotted leaf keys ("execution.mode" → value). */
function flattenLeaves(value, prefix = '', accumulator = []) {
  for (const [key, child] of Object.entries(value)) {
    const dotted = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(child)) flattenLeaves(child, dotted, accumulator);
    else accumulator.push([dotted, child]);
  }
  return accumulator;
}

/**
 * List the keys/values of a raw settings object that sanitizing drops or replaces.
 * @param {object} raw parsed settings file
 * @param {object} base settings the file is layered on
 * @returns {{ sanitized: object, problems: string[] }}
 */
function findIgnoredSettings(raw, base) {
  const sanitized = validateAndSanitizeSettings(raw, base);
  const problems = [];
  for (const [key, value] of flattenLeaves(raw)) {
    if (IGNORED_LEAF_KEYS.has(key)) continue;
    const effective = getSettingByKey(sanitized, key);
    if (effective === undefined) problems.push(`unknown key "${key}"`);
    // Numeric strings such as "300" are coerced by the engine, so compare as text.
    else if (String(effective) !== String(value)) problems.push(`ignored ${key}=${JSON.stringify(value)}`);
  }
  return { sanitized, problems };
}

/**
 * @param {string} filePath
 * @param {object} base
 * @returns {{ settings: object, problems: string[], present: boolean }}
 */
function inspectSettingsFile(filePath, base) {
  if (!fs.existsSync(filePath)) return { settings: base, problems: [], present: false };
  let raw;
  try {
    raw = JSON.parse(readTextFile(filePath));
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { settings: base, problems: [`${filePath}: invalid JSON (${reason})`], present: true };
  }
  if (!isPlainObject(raw)) {
    return { settings: base, problems: [`${filePath}: must contain a JSON object`], present: true };
  }
  const { sanitized, problems } = findIgnoredSettings(raw, base);
  return { settings: sanitized, problems: problems.map((p) => `${filePath}: ${p}`), present: true };
}

/**
 * Doctor check for the global and workspace settings files.
 * @param {{ homeDir?: string, cwd?: string }} options
 * @returns {{ name: string, passed: boolean, detail: string }}
 */
function checkSettingsFiles(options = {}) {
  try {
    const { globalPath, projectPath } = getSettingsPaths(options);
    const globalResult = inspectSettingsFile(globalPath, DEFAULT_SETTINGS);
    const projectResult = inspectSettingsFile(projectPath, globalResult.settings);
    const active = projectResult.settings;
    const problems = [...globalResult.problems, ...projectResult.problems];
    const sources = [globalResult.present && 'global', projectResult.present && 'workspace'].filter(Boolean);
    const summary = `preset=${active.preset}, mode=${active.execution.mode}, ` +
      `standards=${active.codingStandards.preset} (${sources.length ? sources.join('+') : 'defaults'})`;
    if (problems.length === 0) return { name: CHECK_NAME, passed: true, detail: summary };
    const shown = problems.slice(0, MAX_ISSUES_SHOWN).join('; ');
    const more = problems.length > MAX_ISSUES_SHOWN ? ` (+${problems.length - MAX_ISSUES_SHOWN} more)` : '';
    return { name: CHECK_NAME, passed: false, detail: `${shown}${more} — fix the file or run \`boomopen settings reset\`` };
  } catch (err) {
    return { name: CHECK_NAME, passed: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

module.exports = {
  findIgnoredSettings,
  checkSettingsFiles,
};
