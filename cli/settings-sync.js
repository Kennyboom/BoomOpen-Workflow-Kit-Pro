'use strict';

/**
 * Renders the active-settings block and hot-syncs it into the kit's installed entry files.
 *
 * Safety rules:
 * - only kit-owned files (see markers.isKitOwnedText) are touched;
 * - only a file with exactly one standalone START line followed by exactly one END line is updated;
 * - in a shared instruction file only the kit's own marked block is searched, never the user's text;
 * - sync never inserts a new block (installed files already ship with one), so a user file can never
 *   gain a block and a damaged marker pair can never eat surrounding text;
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

const KIT_DIR_NAME = 'boomopen-workflow-kit';
const COPILOT_AGENT_FILE = 'boomopen-workflow-kit.agent.md';
const FENCE_PATTERN = /^\s*(```|~~~)/;

function renderActiveSettingsMarkdown(settings = DEFAULT_SETTINGS) {
  const s = validateAndSanitizeSettings(settings, DEFAULT_SETTINGS);
  const cs = s.codingStandards;
  const t = s.execution.modeAThresholdFiles;
  return [
    SETTINGS_MARKER_START,
    '## 🎛️ ACTIVE USER SETTINGS OVERRIDE (Managed via `/settings` & `~/.boomopen/settings.json`)',
    '> **PRECEDENCE**: `1. Explicit Turn Command (/cmd:variant, @fast/@deep/@team)` > `2. Workspace ./.boomopen.json` > `3. Active Settings Below` > `4. Default File Rules`.',
    `- **Active Preset**: \`${s.preset}\` | **Execution Mode (\`execution.mode\`)**: \`${s.execution.mode}\` (\`auto\` = **Proactive Sub-agent First**: Spawn parallel subagents on Turn 1 (your platform's subagent tool; a read-only scout for scouting) whenever scope is unknown, requires scouting/audit/research across > ${t} files, or spans ≥ 2 domains; use Mode A Direct ONLY for known-target micro-edits ≤ ${t} files or simple Q&A; \`mode_a\` = Force Direct Solo Mode unless \`:hard\`/\`:team\`/\`/orchestrate\`; \`mode_b\` = Force Multi-Agent Orchestrator; \`team\` = Force Golden Triangle 3-Agent \`:team\`) | **Swarm Scaling (\`execution.swarmScaling\`)**: \`${s.execution.swarmScaling}\` | **Max Parallel Sub-agents (\`execution.maxParallelSubagents\`)**: \`${s.execution.maxParallelSubagents}\``,
    `- **Workflows**: \`defaultVariant = ${s.workflows.defaultVariant}\` (\`auto\`|\`fast\`|\`hard\`|\`team\`|\`ask\`) | \`naturalLanguageResearchTrigger = ${s.workflows.naturalLanguageResearchTrigger}\` (\`auto_team\` routes NL research/ideation/review to \`:team\` and NL plan/design/debug/fix/test/cook/docs to \`commands/{cmd}-{variant}.md\` across all 17 languages | \`auto_hard\` → \`:hard\` | \`ask_first\` | \`off\`)`,
    `- **Intelligence & Research**: \`models.subagentPolicy = ${s.models.subagentPolicy}\` (\`inherit\` = subagents inherit the session model; never downgrade core roles) | \`research.depth = ${s.research.depth}\` | \`clarification.style = ${s.clarification.style}\` | \`teams.maxDebateRounds = ${s.teams.maxDebateRounds}\` | **Cross-Engine Routing (\`engines.*\`)**: \`researcher=${s.engines.researcher}, planner=${s.engines.planner}, coder=${s.engines.coder}, debugger=${s.engines.debugger}, reviewer=${s.engines.reviewer}, council=[${s.engines.councilMembers}]\``,
    `- **Standards & Verification**: \`codingStandards.preset = ${cs.preset}\` (Soft \`${cs.softFileLines}\` / Hard \`${cs.hardFileLines}\` lines, \`forbidExplicitAny = ${cs.forbidExplicitAny}\`, \`warnConsoleLog = ${cs.warnConsoleLog}\`) | \`verification.level = ${s.verification.level}\``,
    `- **Deliverables & Language**: \`deliverables.routing = ${s.deliverables.routing}\` (\`brain_artifacts\` = \`<appDataDir>\\brain\\<conversation-id>\\\` on Antigravity, \`./reports/{topic}/\` elsewhere) | \`language.response = ${s.language.response}\``,
    SETTINGS_MARKER_END,
  ].join('\n');
}

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
function injectSettingsBlockIntoText(content, settings = DEFAULT_SETTINGS) {
  const block = matchLineEndings(renderActiveSettingsMarkdown(settings), content);
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
 * `boomopen-workflow-kit` block) only the kit block counts, so the user's own text is never edited
 * even when it mentions or contains settings markers. A whole-file kit copy is edited as a whole.
 * @returns {{ start: number, end: number } | null} null when the kit block is damaged
 */
function editableRange(content) {
  const start = content.indexOf(KIT_BLOCK_START);
  if (start === -1) return { start: 0, end: content.length };
  const end = content.indexOf(KIT_BLOCK_END, start + KIT_BLOCK_START.length);
  return end === -1 ? null : { start, end };
}

/** @returns {{ status: 'absent'|'written'|'current'|'skipped'|'failed', reason?: string }} */
function syncOneFile(filePath, active, homeDir) {
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
  const updated = current.slice(0, range.start) + injectSettingsBlockIntoText(region, active) + current.slice(range.end);
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
  for (const [platform, fileList] of Object.entries(getSyncTargets(homeDir, options))) {
    let anySynced = false;
    for (const filePath of fileList) {
      const result = syncOneFile(filePath, active, homeDir);
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
  findSettingsBlock,
  injectSettingsBlockIntoText,
  getFrameworkPaths,
  detectInstalledPlatforms,
  getSyncTargets,
  syncSettingsToInstalledPlatforms,
};
