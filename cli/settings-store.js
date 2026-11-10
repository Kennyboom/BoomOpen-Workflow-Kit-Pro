'use strict';

/**
 * Settings persistence: locating, decoding (BOM / UTF-16 aware) and writing the global
 * `~/.boomopen/settings.json` and the sparse workspace `./.boomopen.json`.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  DEFAULT_SETTINGS,
  ALL_STORABLE_KEYS,
  getSettingByKey,
  validateAndSanitizeSettings,
  resolvePresetLabel,
  pickKeys,
  presentKeys,
} = require('./settings-schema.js');

const GLOBAL_DIR_NAME = '.boomopen';
const GLOBAL_FILE_NAME = 'settings.json';
const PROJECT_FILE_NAME = '.boomopen.json';
const CORRUPT_BACKUP_SUFFIX = '.bak';

const reportedWarnings = new Set();

function getSettingsPaths(options = {}) {
  const homeDir = options.homeDir || os.homedir();
  const cwd = options.cwd || process.cwd();
  return {
    globalPath: path.join(homeDir, GLOBAL_DIR_NAME, GLOBAL_FILE_NAME),
    projectPath: path.join(cwd, PROJECT_FILE_NAME),
  };
}

/** Decodes UTF-8 (with or without BOM) and UTF-16 LE/BE (BOM required) text. */
function decodeText(buffer) {
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) return buffer.subarray(2).toString('utf16le');
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    const swapped = Buffer.from(buffer.subarray(2));
    swapped.swap16();
    return swapped.toString('utf16le');
  }
  const text = buffer.toString('utf8');
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * @returns {{ exists: boolean, data: object|null, error: string|null }}
 * `error` is set when the file exists but is not a JSON object; callers must not overwrite it.
 */
function readSettingsFile(filePath) {
  let buffer;
  try {
    buffer = fs.readFileSync(filePath);
  } catch (err) {
    if (err && err.code === 'ENOENT') return { exists: false, data: null, error: null };
    return { exists: true, data: null, error: err instanceof Error ? err.message : String(err) };
  }
  try {
    const parsed = JSON.parse(decodeText(buffer));
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { exists: true, data: null, error: 'top-level value is not a JSON object' };
    }
    return { exists: true, data: parsed, error: null };
  } catch (err) {
    return { exists: true, data: null, error: err instanceof Error ? err.message : String(err) };
  }
}

function warnOnce(message, options = {}) {
  if (options.silent || reportedWarnings.has(message)) return;
  reportedWarnings.add(message);
  console.warn(`⚠️  ${message}`);
}

function readOrWarn(filePath, options) {
  const result = readSettingsFile(filePath);
  if (result.error) {
    warnOnce(`Ignoring unreadable settings file ${filePath} (${result.error}). Fix or delete it; it will not be overwritten.`, options);
  }
  return result;
}

/** Global-only settings (what gets synced into the platform entry files). */
function loadGlobalSettings(options = {}) {
  const { globalPath } = getSettingsPaths(options);
  const { data } = readOrWarn(globalPath, options);
  return resolvePresetLabel(validateAndSanitizeSettings(data || {}, DEFAULT_SETTINGS));
}

/**
 * Effective settings plus where each value comes from.
 * @returns {{ settings: object, globalSettings: object, projectKeys: string[], hasProject: boolean }}
 */
function loadSettingsDetailed(options = {}) {
  const { projectPath } = getSettingsPaths(options);
  const globalSettings = loadGlobalSettings(options);
  if (options.scope === 'global') {
    return { settings: globalSettings, globalSettings, projectKeys: [], hasProject: false };
  }
  const project = readOrWarn(projectPath, options);
  if (!project.data) {
    return { settings: globalSettings, globalSettings, projectKeys: [], hasProject: project.exists };
  }
  const merged = validateAndSanitizeSettings(project.data, globalSettings);
  return {
    settings: resolvePresetLabel(merged),
    globalSettings,
    projectKeys: presentKeys(project.data),
    hasProject: true,
  };
}

function loadSettings(options = {}) {
  return loadSettingsDetailed(options).settings;
}

let tmpWriteCounter = 0;

function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${++tmpWriteCounter}.tmp`;
  const payload = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(tmpPath, payload, 'utf8');
  try {
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    if (err && (err.code === 'EPERM' || err.code === 'EACCES')) {
      fs.writeFileSync(filePath, payload, 'utf8');
      fs.rmSync(tmpPath, { force: true });
      return;
    }
    fs.rmSync(tmpPath, { force: true });
    throw err;
  }
}

function assertWritable(filePath, readResult) {
  if (readResult.error) {
    throw new Error(
      `Refusing to overwrite ${filePath}: it could not be parsed (${readResult.error}). ` +
        'Fix the JSON or delete the file, then try again.'
    );
  }
}

/** Saves the full global settings after applying `patch`. Returns the new global settings. */
function writeGlobalSettings(patch, options = {}) {
  const { globalPath } = getSettingsPaths(options);
  const current = readSettingsFile(globalPath);
  assertWritable(globalPath, current);
  const base = validateAndSanitizeSettings(current.data || {}, DEFAULT_SETTINGS);
  const next = resolvePresetLabel(validateAndSanitizeSettings(patch, base));
  writeJsonFile(globalPath, next);
  return { savedPath: globalPath, globalSettings: next };
}

/**
 * Saves workspace overrides sparsely: keys already overridden stay, and patched keys are stored
 * only when they differ from the global value. Global changes keep reaching the workspace.
 */
function writeProjectOverrides(patch, options = {}) {
  const { projectPath } = getSettingsPaths(options);
  const current = readSettingsFile(projectPath);
  assertWritable(projectPath, current);
  const globalSettings = loadGlobalSettings(options);
  const existingKeys = presentKeys(current.data || {});
  const before = validateAndSanitizeSettings(current.data || {}, globalSettings);
  const next = validateAndSanitizeSettings(patch, before);
  const keys = ALL_STORABLE_KEYS.filter(
    (key) =>
      key !== 'preset' &&
      (existingKeys.includes(key) || getSettingByKey(next, key) !== getSettingByKey(globalSettings, key))
  );
  writeJsonFile(projectPath, pickKeys(next, keys));
  return { savedPath: projectPath, overriddenKeys: keys };
}

/** Moves an unparsable file aside so an explicit reset can proceed without losing it. */
function backupCorruptFile(filePath) {
  const result = readSettingsFile(filePath);
  if (!result.error) return null;
  const backupPath = filePath + CORRUPT_BACKUP_SUFFIX;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

module.exports = {
  getSettingsPaths,
  decodeText,
  readSettingsFile,
  loadGlobalSettings,
  loadSettingsDetailed,
  loadSettings,
  writeGlobalSettings,
  writeProjectOverrides,
  backupCorruptFile,
};
