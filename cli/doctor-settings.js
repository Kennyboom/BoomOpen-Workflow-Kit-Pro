'use strict';

/**
 * Settings diagnostics: reads ~/.boomopen/settings.json and ./.boomopen.json directly, fails on
 * broken JSON or on keys/values the settings engine would silently ignore, and verifies that
 * installed kit entry files have their BOOMOPEN-SETTINGS block synced with the global settings.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { readTextFile } = require('./checker-text.js');
const { GEMINI_MARKER_START, GEMINI_MARKER_END, isKitOwnedText } = require('./markers.js');
const {
  DEFAULT_SETTINGS,
  getSettingByKey,
  getSettingsPaths,
  validateAndSanitizeSettings,
} = require('./settings.js');
const { resolvePresetLabel } = require('./settings-schema.js');
const { findSettingsBlock, getSyncTargets, renderActiveSettingsMarkdown } = require('./settings-sync.js');

const CHECK_NAME = 'Settings (global + workspace)';
const IGNORED_LEAF_KEYS = new Set(['version']);
const MAX_ISSUES_SHOWN = 5;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function shortPath(filePath, homeDir) {
  const rel = path.relative(homeDir, filePath);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return `~/${rel.split(path.sep).join('/')}`;
  return filePath;
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

function editableRegion(content) {
  const start = content.indexOf(GEMINI_MARKER_START);
  if (start === -1) return content;
  const end = content.indexOf(GEMINI_MARKER_END, start + GEMINI_MARKER_START.length);
  return end === -1 ? null : content.slice(start, end);
}

/**
 * Check that every installed kit-owned entry file has an undamaged, up-to-date settings block.
 */
function findUnsyncedEntryFiles(globalSettings, options = {}) {
  if (options.sourceOnly) return [];
  const homeDir = options.homeDir || os.homedir();
  const targetsByPlatform = getSyncTargets(homeDir, options);
  const wanted = options.platforms && options.platforms.length ? options.platforms : Object.keys(targetsByPlatform);
  const expected = renderActiveSettingsMarkdown(resolvePresetLabel(globalSettings));
  const problems = [];
  for (const platform of wanted) {
    for (const filePath of targetsByPlatform[platform] || []) {
      const stat = fs.statSync(filePath, { throwIfNoEntry: false });
      if (!stat || !stat.isFile()) continue;
      const content = readTextFile(filePath);
      if (!isKitOwnedText(content)) continue;
      const region = editableRegion(content);
      if (region === null) continue; // damaged kit block is reported by checkEntrypoints
      const found = findSettingsBlock(region);
      if (found.state === 'malformed') {
        problems.push(`${shortPath(filePath, homeDir)}: damaged settings markers (${found.reason})`);
      } else if (found.state === 'ok' && region.slice(found.start, found.end).replace(/\r\n/g, '\n') !== expected) {
        problems.push(`${shortPath(filePath, homeDir)}: settings block out of sync`);
      }
    }
  }
  return problems;
}

/**
 * Doctor check for the global and workspace settings files and installed entry-file sync state.
 * @param {{ homeDir?: string, cwd?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform,
 *           platforms?: string[], sourceOnly?: boolean }} options
 * @returns {{ name: string, passed: boolean, detail: string }}
 */
function checkSettingsFiles(options = {}) {
  try {
    const { globalPath, projectPath } = getSettingsPaths(options);
    const globalResult = options.sourceOnly
      ? { settings: DEFAULT_SETTINGS, problems: [], present: false }
      : inspectSettingsFile(globalPath, DEFAULT_SETTINGS);
    const projectResult = inspectSettingsFile(projectPath, globalResult.settings);
    const active = resolvePresetLabel(projectResult.settings);
    const fileProblems = [...globalResult.problems, ...projectResult.problems];
    const syncProblems = fileProblems.length === 0 ? findUnsyncedEntryFiles(globalResult.settings, options) : [];
    const problems = [...fileProblems, ...syncProblems];
    const sources = [globalResult.present && 'global', projectResult.present && 'workspace'].filter(Boolean);
    const summary = `preset=${active.preset}, mode=${active.execution.mode}, ` +
      `standards=${active.codingStandards.preset} (${sources.length ? sources.join('+') : 'defaults'})`;
    if (problems.length === 0) return { name: CHECK_NAME, passed: true, detail: summary };
    const shown = problems.slice(0, MAX_ISSUES_SHOWN).join('; ');
    const more = problems.length > MAX_ISSUES_SHOWN ? ` (+${problems.length - MAX_ISSUES_SHOWN} more)` : '';
    const fixHint = fileProblems.length ? 'fix the file or run `boomopen settings reset`' : 'run `boomopen settings sync`';
    return { name: CHECK_NAME, passed: false, detail: `${shown}${more} — ${fixHint}` };
  } catch (err) {
    return { name: CHECK_NAME, passed: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

module.exports = {
  findIgnoredSettings,
  findUnsyncedEntryFiles,
  checkSettingsFiles,
};
