'use strict';

/**
 * Renders the active-settings block and hot-syncs it (including < 2.5 KB Slim Guardrails swaps)
 * into the kit's installed entry files across all 5 supported platforms.
 *
 * Safety rules:
 * - only kit-owned files (see markers.isKitOwnedText) are touched;
 * - only a file with exactly one standalone START line followed by exactly one END line is updated;
 * - in a shared instruction file only the kit's own marked block is searched, never the user's text;
 * - YAML frontmatter on `.agent.md` and `.mdc` files is preserved across slim/full swaps;
 * - one unreadable/unwritable file is reported and the remaining files are still synced.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  SETTINGS_MARKER_START,
  SETTINGS_MARKER_END,
  GEMINI_MARKER_START: KIT_BLOCK_START,
  GEMINI_MARKER_END: KIT_BLOCK_END,
  isKitOwnedText,
} = require('./markers.js');
const { getVSCodePromptsFolder } = require('./platform-paths.js');
const { DEFAULT_SETTINGS, validateAndSanitizeSettings, resolvePresetLabel } = require('./settings-schema.js');
const { canonicalPath } = require('./install-ownership.js');
const { recordKitRewrite } = require('./manifest.js');
const { loadGlobalSettings } = require('./settings-store.js');
const {
  KIT_DIR_NAME,
  isSlimGuardrailsPreset,
  isSlimRegion,
  extractLeadingFrontmatter,
  renderActiveSettingsMarkdown,
  renderPlatformSlimBody,
  renderAntigravitySlimBody,
  cacheFullTemplateIfManifested,
  loadPlatformFullTemplate,
} = require('./settings-slim.js');

const COPILOT_AGENT_FILE = 'boomopen-workflow-kit.agent.md';
const FENCE_PATTERN = /^\s*(```|~~~)/;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const markerLinePattern = (marker) => new RegExp(`^[ \\t]*${escapeRegex(marker)}[ \\t]*(?=\\r?$)`, 'gm');

/**
 * Locates the settings block. Markers count only when they stand alone on a line, so prose that
 * merely mentions them is ignored.
 * @returns {{ state: 'none'|'ok'|'malformed', start?: number, end?: number, reason?: string }}
 */
function findSettingsBlock(content) {
  const starts = [...content.matchAll(markerLinePattern(SETTINGS_MARKER_START))];
  const ends = [...content.matchAll(markerLinePattern(SETTINGS_MARKER_END))];
  if (starts.length === 0 && ends.length === 0) return { state: 'none' };
  if (starts.length !== 1 || ends.length !== 1) {
    return { state: 'malformed', reason: `expected one marker pair, found ${starts.length} START / ${ends.length} END` };
  }
  if (ends[0].index < starts[0].index) return { state: 'malformed', reason: 'END marker appears before START marker' };
  return { state: 'ok', start: starts[0].index, end: ends[0].index + ends[0][0].length };
}

function matchLineEndings(block, content) {
  return content.includes('\r\n') ? block.replace(/\r?\n/g, '\r\n') : block;
}

/** Offset of the first `---` divider line outside front-matter and code fences, or -1. */
function findDividerOffset(content) {
  const lines = content.split('\n');
  let offset = 0;
  let inFence = false;
  let inFrontMatter = lines[0] !== undefined && lines[0].trim() === '---';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineOffset = offset;
    offset += lines[i].length + 1;
    if (i === 0 && inFrontMatter) continue;
    if (inFrontMatter) {
      if (line === '---') inFrontMatter = false;
      continue;
    }
    if (FENCE_PATTERN.test(line)) inFence = !inFence;
    else if (!inFence && line === '---') return lineOffset;
  }
  return -1;
}

/**
 * Pure helper: replaces a well-formed block, inserts one into text that has no markers at all,
 * and returns text with damaged markers unchanged.
 */
function injectSettingsBlockIntoText(content, settings = DEFAULT_SETTINGS, options = {}) {
  const block = matchLineEndings(renderActiveSettingsMarkdown(settings, options), content);
  const found = findSettingsBlock(content);
  if (found.state === 'ok') return content.slice(0, found.start) + block + content.slice(found.end);
  if (found.state === 'malformed') return content;
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const dividerIdx = findDividerOffset(content);
  if (dividerIdx > 0) {
    return `${content.slice(0, dividerIdx).trimEnd()}${eol}${eol}${block}${eol}${eol}${content.slice(dividerIdx)}`;
  }
  return `${content.trimEnd()}${eol}${eol}${block}${eol}`;
}

/** Kit framework folder per platform; its presence means the kit is installed for that tool. */
function getFrameworkPaths(homeDir) {
  return {
    antigravity: path.join(homeDir, '.gemini', 'config', 'skills', KIT_DIR_NAME),
    claude: path.join(homeDir, '.claude', 'skills', KIT_DIR_NAME),
    codex: path.join(homeDir, '.codex', 'skills', KIT_DIR_NAME),
    cursor: path.join(homeDir, '.cursor', 'skills', KIT_DIR_NAME),
    copilot: path.join(homeDir, '.copilot', 'skills', KIT_DIR_NAME),
  };
}

function detectInstalledPlatforms(homeDir = os.homedir()) {
  const installed = {};
  for (const [platform, frameworkPath] of Object.entries(getFrameworkPaths(homeDir))) {
    installed[platform] = fs.existsSync(frameworkPath);
  }
  return installed;
}

/**
 * Every entry file the installer writes that carries a settings block.
 * With a custom homeDir (tests, sandboxes) the real APPDATA is never used unless `env` is passed.
 */
function getSyncTargets(homeDir, options = {}) {
  const env = options.env || (canonicalPath(homeDir) === canonicalPath(os.homedir()) ? process.env : {});
  const vsCodePrompts = getVSCodePromptsFolder(homeDir, env, options.platform || process.platform);
  const home = (...parts) => path.join(homeDir, ...parts);
  return {
    antigravity: [
      home('.gemini', 'GEMINI.md'),
      home('.gemini', 'agents', 'AntigravityGlobal.agent.md'),
      home('.antigravity', 'agents', 'AntigravityGlobal.agent.md'),
      home('.gemini', 'config', 'plugins', KIT_DIR_NAME, 'rules', 'AGENTS.md'),
    ],
    claude: [home('.claude', 'CLAUDE.md'), home('.claude', 'AGENT.md')],
    codex: [home('.codex', 'CODEX.md'), home('.codex', 'AGENTS.md'), home('.codex', 'AGENT.md')],
    cursor: [
      home('.cursor', 'CURSOR.md'),
      home('.cursor', 'rules', 'boomopen-workflow-kit.mdc'),
      home('.cursor', 'AGENT.md'),
      home('.cursor', 'CLAUDE.md'),
    ],
    copilot: [
      home('.copilot', 'copilot-instructions.md'),
      home('.copilot', 'COPILOT.md'),
      home('.copilot', 'AGENT.md'),
      home('.copilot', 'CLAUDE.md'),
      path.join(vsCodePrompts, COPILOT_AGENT_FILE),
    ],
  };
}

const errorMessage = (err) => (err instanceof Error ? err.message : String(err));

/**
 * Region of a file the sync may edit. In a shared instruction file (user text plus the kit's
 * `boomopen-workflow-kit` block) only the kit block counts, so the user's own text is never edited.
 * @returns {{ start: number, end: number } | null} null when the kit block is damaged
 */
function editableRange(content) {
  const start = content.indexOf(KIT_BLOCK_START);
  if (start === -1) return { start: 0, end: content.length };
  const end = content.indexOf(KIT_BLOCK_END, start + KIT_BLOCK_START.length);
  return end === -1 ? null : { start, end };
}

function stripLeadingKitStart(region) {
  if (!region.startsWith(KIT_BLOCK_START)) return region;
  return region.slice(KIT_BLOCK_START.length).replace(/^\r?\n/, '');
}

function syncPlatformRegion(platform, filePath, region, active, homeDir, hasKitBlock, prefixHasFrontmatter) {
  const eol = region.includes('\r\n') ? '\r\n' : '\n';
  const inner = stripLeadingKitStart(region);
  const { frontmatter } = extractLeadingFrontmatter(inner);
  const wrap = (body) => {
    const normalized = body.replace(/\r?\n/g, eol).trimEnd();
    return hasKitBlock ? `${KIT_BLOCK_START}${eol}${normalized}${eol}` : `${normalized}${eol}`;
  };

  if (isSlimGuardrailsPreset(active)) {
    if (!isSlimRegion(inner)) cacheFullTemplateIfManifested(homeDir, platform, filePath, inner);
    const slimBody = renderPlatformSlimBody(platform, active, { platform });
    const withFrontmatter = frontmatter && !prefixHasFrontmatter ? `${frontmatter}\n\n${slimBody}` : slimBody;
    return wrap(withFrontmatter);
  }
  if (isSlimRegion(inner)) {
    const fullTemplate = loadPlatformFullTemplate(platform, filePath, homeDir);
    if (fullTemplate) {
      const cleaned = prefixHasFrontmatter ? extractLeadingFrontmatter(fullTemplate).body : fullTemplate;
      const restored = !extractLeadingFrontmatter(cleaned).frontmatter && frontmatter && !prefixHasFrontmatter
        ? `${frontmatter}\n\n${cleaned}`
        : cleaned;
      return wrap(injectSettingsBlockIntoText(restored, active, { platform }));
    }
  }
  return injectSettingsBlockIntoText(region, active, { platform });
}

/** @returns {{ status: 'absent'|'written'|'current'|'skipped'|'failed', reason?: string }} */
function syncOneFile(platform, filePath, active, homeDir) {
  let current;
  try {
    const stat = fs.statSync(filePath, { throwIfNoEntry: false });
    if (!stat) return { status: 'absent' };
    if (!stat.isFile()) return { status: 'skipped', reason: 'not a regular file' };
    current = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { status: 'failed', reason: errorMessage(err) };
  }
  if (!isKitOwnedText(current)) return { status: 'skipped', reason: 'not a kit-owned file' };
  const range = editableRange(current);
  if (!range) return { status: 'skipped', reason: 'damaged kit block markers' };
  const region = current.slice(range.start, range.end);
  const found = findSettingsBlock(region);
  if (found.state === 'none') return { status: 'skipped', reason: 'no settings block' };
  if (found.state === 'malformed') return { status: 'skipped', reason: `damaged settings markers: ${found.reason}` };

  const hasKitBlock = current.includes(KIT_BLOCK_START);
  const prefixHasFrontmatter = Boolean(extractLeadingFrontmatter(current.slice(0, range.start).trimStart()).frontmatter);
  const nextRegion = syncPlatformRegion(platform, filePath, region, active, homeDir, hasKitBlock, prefixHasFrontmatter);
  const updated = current.slice(0, range.start) + nextRegion + current.slice(range.end);
  if (updated === current) return { status: 'current' };
  try {
    fs.writeFileSync(filePath, updated, 'utf8');
  } catch (err) {
    return { status: 'failed', reason: errorMessage(err) };
  }
  try {
    // Keep the install manifest in step, so uninstall still recognises the file as the kit's.
    recordKitRewrite(homeDir, filePath, current, updated);
  } catch (err) {
    return { status: 'written', reason: `install manifest not updated: ${errorMessage(err)}` };
  }
  return { status: 'written' };
}

/**
 * Syncs `settings` (or, when omitted, the GLOBAL settings — never a workspace override) into every
 * kit-owned entry file.
 */
function syncSettingsToInstalledPlatforms(settings, options = {}) {
  const start = Date.now();
  const homeDir = options.homeDir || os.homedir();
  const active = settings
    ? resolvePresetLabel(validateAndSanitizeSettings(settings, DEFAULT_SETTINGS))
    : loadGlobalSettings({ ...options, scope: 'global' });
  const report = {
    updatedFiles: [],
    writtenFiles: [],
    skippedFiles: [],
    failedFiles: [],
    platforms: {},
    installed: detectInstalledPlatforms(homeDir),
    elapsedMs: 0,
  };
  const targetsByPlatform = getSyncTargets(homeDir, options);
  const wanted = Array.isArray(options.platforms) && options.platforms.length > 0
    ? options.platforms.filter((p) => Object.hasOwn(targetsByPlatform, p))
    : Object.keys(targetsByPlatform);
  for (const platform of wanted) {
    const fileList = targetsByPlatform[platform] || [];
    let anySynced = false;
    for (const filePath of fileList) {
      const result = syncOneFile(platform, filePath, active, homeDir);
      if (result.status === 'written' || result.status === 'current') {
        report.updatedFiles.push(filePath);
        if (result.status === 'written') report.writtenFiles.push(filePath);
        anySynced = true;
      } else if (result.status === 'failed') {
        report.failedFiles.push({ file: filePath, error: result.reason });
      } else if (result.status === 'skipped' && result.reason !== 'not a kit-owned file') {
        report.skippedFiles.push({ file: filePath, reason: result.reason });
      }
    }
    report.platforms[platform] = anySynced;
  }
  report.elapsedMs = Date.now() - start;
  return report;
}

module.exports = {
  renderActiveSettingsMarkdown,
  renderPlatformSlimBody,
  renderAntigravitySlimBody,
  findSettingsBlock,
  injectSettingsBlockIntoText,
  getFrameworkPaths,
  detectInstalledPlatforms,
  getSyncTargets,
  syncSettingsToInstalledPlatforms,
};
