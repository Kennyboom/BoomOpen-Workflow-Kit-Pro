const fs = require('node:fs');

const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./markers.js');
const {
  KIT_VERSION,
  DEFAULT_SETTINGS,
  PRESETS,
  ALLOWED_ENUMS,
  SETTING_DESCRIPTIONS,
  CODING_STANDARDS_PRESETS,
  LINE_LIMIT_KEYS,
  MIN_LINE_LIMIT,
  MAX_LINE_LIMIT,
  ALL_STORABLE_KEYS,
  isSettingKey,
  isPresetName,
  getSettingByKey,
  coerceEnumValue,
  coerceLineLimit,
  validateAndSanitizeSettings,
} = require('./settings-schema.js');
const {
  getSettingsPaths,
  loadSettings,
  loadSettingsDetailed,
  writeGlobalSettings,
  writeProjectOverrides,
  backupCorruptFile,
} = require('./settings-store.js');
const {
  renderActiveSettingsMarkdown,
  injectSettingsBlockIntoText,
  detectInstalledPlatforms,
  syncSettingsToInstalledPlatforms,
} = require('./settings-sync.js');

const DEFAULT_UI_PORT = 4567;
const MAX_PORT = 65535;
const RULE = '─'.repeat(68);

const resolveScope = (options) => (options.scope === 'project' || options.project ? 'project' : 'global');

/**
 * Persists `patch` to the chosen scope. Global saves re-sync the platform entry files with the
 * GLOBAL settings; workspace saves never touch global files (agents read ./.boomopen.json directly).
 */
function saveSettings(patch = {}, options = {}) {
  const scope = resolveScope(options);
  let savedPath;
  let syncReport = null;
  if (scope === 'project') {
    savedPath = writeProjectOverrides(patch, options).savedPath;
  } else {
    const saved = writeGlobalSettings(patch, options);
    savedPath = saved.savedPath;
    if (options.sync !== false) syncReport = syncSettingsToInstalledPlatforms(saved.globalSettings, options);
  }
  return { settings: loadSettings({ ...options, scope: undefined }), savedPath, scope, syncReport };
}

function assertValidLineLimitPair(nextSoft, nextHard) {
  if (nextSoft > nextHard) {
    throw new Error(
      `Invalid line limits: codingStandards.softFileLines (${nextSoft}) cannot exceed codingStandards.hardFileLines (${nextHard})`
    );
  }
}

function setSettingByKey(dottedKey, rawValue, options = {}) {
  if (LINE_LIMIT_KEYS.includes(dottedKey)) {
    const coerced = coerceLineLimit(rawValue);
    if (coerced === undefined) {
      throw new Error(`Invalid value "${rawValue}" for ${dottedKey}. Allowed: integer ${MIN_LINE_LIMIT}..${MAX_LINE_LIMIT}`);
    }
    const scope = resolveScope(options);
    const currentCs = loadSettings({ ...options, scope: scope === 'project' ? undefined : 'global' }).codingStandards;
    const nextSoft = dottedKey === 'codingStandards.softFileLines' ? coerced : currentCs.softFileLines;
    const nextHard = dottedKey === 'codingStandards.hardFileLines' ? coerced : currentCs.hardFileLines;
    assertValidLineLimitPair(nextSoft, nextHard);
    return saveSettings({ [dottedKey]: coerced }, options);
  }
  if (!isSettingKey(dottedKey)) {
    throw new Error(`Unknown setting key "${dottedKey}". Allowed keys: ${ALL_STORABLE_KEYS.join(', ')}`);
  }
  const coerced = coerceEnumValue(dottedKey, rawValue);
  if (coerced === undefined) {
    throw new Error(`Invalid value "${rawValue}" for ${dottedKey}. Allowed: ${ALLOWED_ENUMS[dottedKey].join(' | ')}`);
  }
  // `set preset <name>` applies the whole preset; only `custom` is a pure label.
  if (dottedKey === 'preset' && isPresetName(coerced)) return applyPreset(coerced, options);
  return saveSettings({ [dottedKey]: coerced }, options);
}

function applyPreset(presetName, options = {}) {
  if (!isPresetName(presetName)) {
    throw new Error(`Unknown preset "${presetName}". Available presets: ${Object.keys(PRESETS).join(', ')}`);
  }
  return saveSettings(PRESETS[presetName], options);
}

function resetSettings(options = {}) {
  const scope = resolveScope(options);
  const { globalPath, projectPath } = getSettingsPaths(options);
  if (scope === 'project') {
    const existed = fs.existsSync(projectPath);
    if (existed) fs.rmSync(projectPath, { force: true });
    return {
      settings: loadSettings({ ...options, scope: undefined }),
      savedPath: existed ? projectPath : null,
      scope,
      syncReport: null,
      noop: !existed,
      message: existed ? `Removed workspace overrides ${projectPath}` : 'No workspace overrides to reset.',
    };
  }
  const backupPath = backupCorruptFile(globalPath);
  if (backupPath) fs.rmSync(globalPath, { force: true });
  const result = saveSettings(DEFAULT_SETTINGS, { ...options, scope: 'global' });
  return backupPath ? { ...result, backupPath } : result;
}

function printSyncReport(syncReport) {
  if (!syncReport) return;
  const installed = syncReport.installed || {};
  const syncedList = Object.entries(syncReport.platforms)
    .map(([p, ok]) => `${ok ? '✅' : installed[p] ? '⚠️' : '⬚'} ${p}`)
    .join('  ');
  console.log(`  🚀 Synced (${syncReport.elapsedMs}ms): ${syncedList}`);
  for (const { file, reason } of syncReport.skippedFiles || []) console.log(`  ⚠️  Skipped ${file}: ${reason}`);
  for (const { file, error } of syncReport.failedFiles || []) console.log(`  ❌ Failed  ${file}: ${error}`);
}

function printSettingsStatus(detail, paths, syncReport, homeDir) {
  const { settings, projectKeys, hasProject } = detail;
  console.log(`\n🎛️  BoomOpen Unified Control Center (v${KIT_VERSION})\n${RULE}`);
  console.log(`  ⚡ Active Preset:  ${settings.preset} (${hasProject ? 'workspace override active' : 'global'})`);
  console.log(`  🌐 Global Store:   ${paths.globalPath}`);
  console.log(`  📁 Project Store:  ${paths.projectPath} (${hasProject ? 'present' : 'not set'})`);
  console.log(RULE);
  for (const key of Object.keys(ALLOWED_ENUMS).filter((k) => k !== 'preset')) {
    const source = projectKeys.includes(key) ? '  [project]' : '';
    console.log(`  • ${key.padEnd(42)} = ${String(getSettingByKey(settings, key))}${source}`);
  }
  const cs = settings.codingStandards;
  console.log(`  • ${'codingStandards (soft/hard lines)'.padEnd(42)} = ${cs.softFileLines}/${cs.hardFileLines}`);
  console.log(RULE);
  const installed = detectInstalledPlatforms(homeDir);
  console.log(`  🧩 Installed: ${Object.entries(installed).map(([p, ok]) => `${ok ? '✅' : '⬚'} ${p}`).join('  ')}`);
  printSyncReport(syncReport);
  console.log(RULE + '\n');
}

const SETTINGS_HELP = `
Usage: boomopen settings <subcommand> [options]
       node cli/install.js settings <subcommand> [options]

Subcommands:
  status                  Show effective settings (alias: show; default when no subcommand is given)
  get [key]               Print the effective value of one key (or all settings)
  set <key> <value>       Set one key (also: set key=value). "set preset <name>" applies that preset
  mode <mode>             Shortcut for: set execution.mode <mode>
  preset <name>           Apply a preset: ${Object.keys(PRESETS).join(', ')}
  reset                   Restore defaults (with --project: delete ./.boomopen.json only)
  sync                    Re-write the settings block in every installed kit entry file
  ui                      Launch the local Web Control Center (also: --ui)
  help                    Show this help

Options:
  -p, --project           Write to the workspace file ./.boomopen.json instead of ~/.boomopen/settings.json
  --json                  Print get output as JSON
  --port <n>              Web UI port (default ${DEFAULT_UI_PORT}; 0 = random free port)
  --no-open               Do not open a browser for the Web UI

Keys: ${ALL_STORABLE_KEYS.join(', ')}
`;

function parseSettingsArgs(args) {
  const flags = { project: false, json: false, noOpen: false, ui: false, help: false, port: DEFAULT_UI_PORT };
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project' || arg === '-p') flags.project = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--no-open') flags.noOpen = true;
    else if (arg === '--ui') flags.ui = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (['--status', '--show', '--get', '--set', '--preset', '--mode', '--reset', '--sync'].includes(arg)) {
      const subCmd = arg.slice(2);
      if (!positional.includes(subCmd)) positional.unshift(subCmd);
    } else if (arg === '--port' || arg.startsWith('--port=')) {
      const raw = arg === '--port' ? args[++i] : arg.slice('--port='.length);
      const port = Number(raw);
      if (!/^\d+$/.test(String(raw)) || port > MAX_PORT) throw new Error(`Invalid --port value "${raw}"`);
      flags.port = port;
    } else if (arg.startsWith('-') && !(positional[0] === 'set' && positional.length === 2 && /^-\d/.test(arg))) {
      throw new Error(`Unknown settings option "${arg}". Run "boomopen settings help" for usage.`);
    } else positional.push(arg);
  }
  return { flags, positional };
}

function reportResult(action, res, opts, options) {
  if (!options.silent) {
    // Always show the effective values (with [project] source labels), like `status` does.
    const readOpts = { ...opts, scope: undefined };
    if (res.message) console.log(`\nℹ️  ${res.message}`);
    if (res.backupPath) console.log(`ℹ️  Unreadable settings file backed up to ${res.backupPath}`);
    printSettingsStatus(loadSettingsDetailed(readOpts), getSettingsPaths(readOpts), res.syncReport, opts.homeDir);
    if (res.syncReport && res.syncReport.failedFiles.length > 0) process.exitCode = 1;
  }
  return { action, ...res };
}

async function dispatchSettingsCommand(sub, positional, flags, options) {
  const opts = { ...options, scope: flags.project ? 'project' : 'global' };
  const readOpts = { ...options, scope: undefined };
  if (flags.help || sub === 'help') {
    if (!options.silent) console.log(SETTINGS_HELP);
    return { action: 'help', help: SETTINGS_HELP };
  }
  if (sub === 'ui' || flags.ui) {
    const { startSettingsUiServer } = require('./settings-ui.js');
    return startSettingsUiServer({ ...opts, port: flags.port, openBrowser: !flags.noOpen });
  }
  if (sub === 'status') {
    const detail = loadSettingsDetailed(readOpts);
    if (!options.silent) printSettingsStatus(detail, getSettingsPaths(readOpts), null, options.homeDir);
    return { action: 'status', settings: detail.settings, paths: getSettingsPaths(readOpts), syncReport: null };
  }
  if (sub === 'get') {
    const settings = loadSettings(readOpts);
    const val = positional[1] ? getSettingByKey(settings, positional[1]) : settings;
    if (val === undefined) throw new Error(`Unknown setting key "${positional[1]}"`);
    if (!options.silent) console.log(flags.json || typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
    return { action: 'get', value: val, settings };
  }
  if (sub === 'set') {
    let [, key, val] = positional;
    if (key && key.includes('=') && val === undefined) [key, val] = [key.slice(0, key.indexOf('=')), key.slice(key.indexOf('=') + 1)];
    return reportResult('set', setSettingByKey(key, val, opts), opts, options);
  }
  if (sub === 'mode') return reportResult('mode', setSettingByKey('execution.mode', positional[1], opts), opts, options);
  if (sub === 'preset') return reportResult('preset', applyPreset(positional[1], opts), opts, options);
  if (sub === 'reset') return reportResult('reset', resetSettings(opts), opts, options);
  if (sub === 'sync') {
    const syncReport = syncSettingsToInstalledPlatforms(null, { ...options, scope: 'global' });
    return reportResult('sync', { settings: loadSettings(readOpts), syncReport }, readOpts, options);
  }
  throw new Error(`Unknown settings subcommand "${sub}". Run "boomopen settings help" for usage.`);
}

async function runSettingsCommand(args = [], options = {}) {
  try {
    const { flags, positional } = parseSettingsArgs(args);
    const rawSub = (positional[0] || (flags.ui ? 'ui' : 'status')).toLowerCase();
    const sub = rawSub === 'show' ? 'status' : rawSub;
    const res = await dispatchSettingsCommand(sub, positional, flags, options);
    const failedSync = Boolean(res.syncReport && res.syncReport.failedFiles && res.syncReport.failedFiles.length > 0);
    return { exitCode: failedSync ? 1 : 0, ...res };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!options.silent) {
      console.error(`❌ ${message}`);
      process.exitCode = 1;
    }
    return { action: 'error', error: message, exitCode: 1 };
  }
}

module.exports = {
  SETTINGS_MARKER_START,
  SETTINGS_MARKER_END,
  DEFAULT_SETTINGS,
  PRESETS,
  ALLOWED_ENUMS,
  ALLOWED_VALUES: ALLOWED_ENUMS,
  SETTING_DESCRIPTIONS,
  CODING_STANDARDS_PRESETS,
  SETTINGS_HELP,
  getSettingsPaths,
  validateAndSanitizeSettings,
  loadSettings,
  loadSettingsDetailed,
  saveSettings,
  setSettingByKey,
  getSettingByKey,
  applyPreset,
  resetSettings,
  renderActiveSettingsMarkdown,
  injectSettingsBlockIntoText,
  detectInstalledPlatforms,
  syncSettingsToInstalledPlatforms,
  runSettingsCommand,
};
