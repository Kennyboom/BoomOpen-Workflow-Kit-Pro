'use strict';

/**
 * Per-platform diagnostics for the copies the installer wrote into the user's home:
 * entry files (kit-owned / kit block present), the framework folder, and the skills vault.
 * Layout mirrors cli/install.js TOOLS, but is computed from `homeDir` so tests can sandbox it.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { countLines, readTextFile } = require('./checker-text.js');
const { INDEX_FILE_NAME, buildCompactIndexData, readCompactIndex } = require('./doctor-index.js');
const {
  GEMINI_MARKER_START,
  GEMINI_MARKER_END,
  CODEX_MARKER_START,
  CODEX_MARKER_END,
  isKitOwnedText,
} = require('./markers.js');
const { HOOK_SCRIPT_NAME, isClaudeHookRegistered } = require('./hook-registration.js');
const { loadManifest } = require('./manifest.js');
const { getVSCodePromptsFolder } = require('./platform-paths.js');
const { FRAMEWORK_FILE_LIST } = require('./tool-config.js');

const MAX_ENTRY_LINES = 350;
const FRAMEWORK_DIR = 'boomopen-workflow-kit';
const MIRRORED_MD_DIRS = ['rules', 'commands', 'agents'];
// Framework folders that must exist and hold files, whatever the reference copy says.
const REQUIRED_DIRS = ['rules', 'commands', 'agents', 'scripts'];
const MAX_NAMES_SHOWN = 3;

/**
 * Where each platform's kit files live under homeDir.
 * @param {string} homeDir
 * @param {{ env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform }} [options]
 */
function getPlatformLayouts(homeDir, options = {}) {
  const env = options.env || (path.resolve(homeDir) === path.resolve(os.homedir()) ? process.env : {});
  const vsCodePrompts = getVSCodePromptsFolder(homeDir, env, options.platform || process.platform);
  const home = (...parts) => path.join(homeDir, ...parts);
  const kitFile = (filePath) => ({ path: filePath, kind: 'kit-file' });
  const layout = (name, skillsDir, entrypoints) => ({
    name,
    skillsDir,
    libraryDir: `${skillsDir}_library`,
    frameworkPath: path.join(skillsDir, FRAMEWORK_DIR),
    entrypoints,
  });
  return {
    antigravity: layout('Antigravity', home('.gemini', 'config', 'skills'), [
      { path: home('.gemini', 'GEMINI.md'), kind: 'gemini-block' },
      kitFile(home('.gemini', 'agents', 'AntigravityGlobal.agent.md')),
    ]),
    claude: layout('Claude Code', home('.claude', 'skills'), [kitFile(home('.claude', 'CLAUDE.md'))]),
    codex: layout('Codex', home('.codex', 'skills'), [
      kitFile(home('.codex', 'AGENTS.md')),
      { path: home('.codex', 'config.toml'), kind: 'codex-block' },
    ]),
    cursor: layout('Cursor', home('.cursor', 'skills'), [
      kitFile(home('.cursor', 'rules', 'boomopen-workflow-kit.mdc')),
      kitFile(home('.cursor', 'CURSOR.md')),
    ]),
    copilot: layout('GitHub Copilot', home('.copilot', 'skills'), [
      kitFile(path.join(vsCodePrompts, 'boomopen-workflow-kit.agent.md')),
      kitFile(home('.copilot', 'COPILOT.md')),
    ]),
  };
}

function displayPath(filePath, homeDir) {
  const rel = path.relative(homeDir, filePath);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) return `~/${rel.split(path.sep).join('/')}`;
  return filePath;
}

function listNames(names) {
  const shown = names.slice(0, MAX_NAMES_SHOWN).join(', ');
  return names.length > MAX_NAMES_SHOWN ? `${shown} +${names.length - MAX_NAMES_SHOWN} more` : shown;
}

/** Text between the first start/end markers (exclusive), or null. */
function extractMarkedBlock(text, start, end) {
  const from = text.indexOf(start);
  if (from === -1) return null;
  const to = text.indexOf(end, from + start.length);
  return to === -1 ? null : text.slice(from + start.length, to);
}

/**
 * @returns {string|null} problem description, or null when the entry file is healthy
 */
function inspectEntrypoint(entry) {
  if (!fs.existsSync(entry.path)) return 'missing';
  const text = readTextFile(entry.path);
  if (entry.kind === 'codex-block') {
    return extractMarkedBlock(text, CODEX_MARKER_START, CODEX_MARKER_END) === null ? 'no kit block' : null;
  }
  // Merged files keep the user's own text outside the kit block: only the block counts.
  const block = extractMarkedBlock(text, GEMINI_MARKER_START, GEMINI_MARKER_END);
  let kitText = block;
  if (entry.kind !== 'gemini-block' && block === null) kitText = isKitOwnedText(text) ? text : null;
  if (kitText === null) return entry.kind === 'gemini-block' ? 'no kit block' : 'not the kit file';
  const lines = countLines(kitText.replace(/^\r?\n/, ''));
  return lines > MAX_ENTRY_LINES ? `kit content ${lines} lines (limit ${MAX_ENTRY_LINES})` : null;
}

function checkEntrypoints(layout, homeDir) {
  const problems = [];
  const warnings = [];
  const legacyRe = /skills\/agent-assistant\b|AGENT ASSISTANT\s*(?:v\d|[—–-]|â€”)|\bAgent Assistant Orchestrator\b/i;
  for (const entry of layout.entrypoints) {
    const problem = inspectEntrypoint(entry);
    if (problem) {
      problems.push(`${displayPath(entry.path, homeDir)} ${problem}`);
    } else if (entry.kind !== 'codex-block' && fs.existsSync(entry.path)) {
      const text = readTextFile(entry.path);
      const start = text.indexOf(GEMINI_MARKER_START);
      if (start > 0 && legacyRe.test(text.slice(0, start))) {
        warnings.push(`${displayPath(entry.path, homeDir)} has legacy v2 preamble outside kit block (run boomopen install)`);
      }
    }
  }
  const okList = layout.entrypoints.map((e) => displayPath(e.path, homeDir)).join(', ');
  return {
    name: `${layout.name}: entry files`,
    passed: problems.length === 0,
    warning: problems.length === 0 && warnings.length > 0,
    detail: problems.length === 0
      ? `${okList} OK${warnings.length ? `; ⚠️ ${warnings.join('; ')}` : ''}`
      : problems.join('; '),
  };
}

function listMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

function hasFiles(dir) {
  try {
    return fs.readdirSync(dir).length > 0;
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) return false;
    throw err;
  }
}

/** Files of a kit copy (a checkout or another installed framework) the framework must also hold. */
function missingAgainstReference(fw, referenceRoot) {
  const missing = [];
  for (const dir of MIRRORED_MD_DIRS) {
    const lost = listMarkdown(path.join(referenceRoot, dir)).filter((f) => !fs.existsSync(path.join(fw, dir, f)));
    if (lost.length) missing.push(`${dir}/ (${lost.length} files: ${listNames(lost)})`);
  }
  const repoScripts = fs.existsSync(path.join(referenceRoot, 'scripts'))
    ? fs.readdirSync(path.join(referenceRoot, 'scripts')).filter((f) => f.endsWith('.py'))
    : [];
  const lostScripts = repoScripts.filter((f) => !fs.existsSync(path.join(fw, 'scripts', f)));
  if (lostScripts.length) missing.push(`scripts/ (${listNames(lostScripts)})`);
  return missing;
}

/** Files recorded in <framework>/install-files.json at install time, or null without a list. */
function readFileList(fw) {
  let files;
  try {
    files = JSON.parse(fs.readFileSync(path.join(fw, FRAMEWORK_FILE_LIST), 'utf8')).files;
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err instanceof SyntaxError)) return null;
    throw err;
  }
  return Array.isArray(files) ? files.filter((rel) => typeof rel === 'string') : null;
}

/**
 * A folder is required when the reference kit (or the recorded file list) has files in it; when the
 * framework checks itself without a list, every REQUIRED_DIRS folder is.
 */
function requiredDirs(referenceRoot, fileList) {
  return REQUIRED_DIRS.filter((dir) => {
    if (referenceRoot) return hasFiles(path.join(referenceRoot, dir));
    if (fileList) return fileList.some((rel) => rel.startsWith(`${dir}/`));
    return true;
  });
}

/**
 * @param {object} layout
 * @param {string|null} referenceRoot kit copy to compare with; null = the framework checks itself
 *   (doctor run from this installed copy), so the file list recorded at install time is used
 */
function checkFramework(layout, referenceRoot) {
  const fw = layout.frameworkPath;
  const name = `${layout.name}: framework files`;
  if (!fs.existsSync(fw)) return { name, passed: false, detail: `Missing: framework folder ${fw} — reinstall` };
  const missing = ['SKILL.md', 'workflows', `matrix-skills/${INDEX_FILE_NAME}`, `hooks/${HOOK_SCRIPT_NAME}`]
    .filter((rel) => !fs.existsSync(path.join(fw, ...rel.split('/'))));
  const fileList = referenceRoot ? null : readFileList(fw);
  const emptyDirs = requiredDirs(referenceRoot, fileList).filter((dir) => !hasFiles(path.join(fw, dir)));
  if (emptyDirs.length) missing.push(`${emptyDirs.map((d) => `${d}/`).join(', ')} (missing or empty)`);
  if (referenceRoot) {
    missing.push(...missingAgainstReference(fw, referenceRoot));
  } else if (fileList) {
    const lost = fileList.filter((rel) => !fs.existsSync(path.join(fw, ...rel.split('/'))));
    if (lost.length) missing.push(`${lost.length} installed files (${listNames(lost)})`);
  }
  const noFileList = !referenceRoot && fileList === null;
  const ok = noFileList
    ? `required folders present; ⚠️ no ${FRAMEWORK_FILE_LIST} to compare with (older release — reinstall)`
    : 'SKILL.md, rules, commands, agents, scripts, workflows, hooks, index OK';
  return {
    name,
    passed: missing.length === 0,
    warning: missing.length === 0 && noFileList,
    detail: missing.length === 0 ? ok : `Missing: ${missing.join('; ')} — reinstall`,
  };
}

/**
 * The kit copy the framework is compared with: the checkout, or the running CLI's own kit folder
 * when that is a different, complete copy. null when doctor runs from the framework being checked.
 */
function referenceRootFor(layout, options) {
  if (options.isSourceCheckout) return options.repoRoot;
  if (!options.repoRoot) return null;
  const root = path.resolve(options.repoRoot);
  if (root === path.resolve(layout.frameworkPath)) return null;
  return REQUIRED_DIRS.every((dir) => hasFiles(path.join(root, dir))) ? root : null;
}

/** An entry file that still carries kit content (a kit block, or a whole-file kit copy). */
function hasKitEntry(entry) {
  if (!fs.existsSync(entry.path)) return false;
  const text = readTextFile(entry.path);
  if (entry.kind === 'codex-block') return extractMarkedBlock(text, CODEX_MARKER_START, CODEX_MARKER_END) !== null;
  if (extractMarkedBlock(text, GEMINI_MARKER_START, GEMINI_MARKER_END) !== null) return true;
  return entry.kind === 'kit-file' && isKitOwnedText(text);
}

/**
 * Same rule as `uninstall`: a platform is installed when its framework folder, its install manifest
 * or kit content in an entry file exists. A partial install is therefore checked (and reported),
 * never listed as "not installed".
 */
function isPlatformPresent(key, layout, homeDir) {
  if (fs.existsSync(layout.frameworkPath)) return true;
  try {
    if (loadManifest(homeDir, key) !== null) return true;
  } catch {
    return true; // an unreadable manifest is reported by the install-state check
  }
  return layout.entrypoints.some(hasKitEntry);
}

/** Where an index entry path ("skills/x/SKILL.md" or "skills_library/x/SKILL.md") is installed. */
function installedSkillPath(layout, entryPath) {
  const [root, ...rest] = String(entryPath).split('/');
  const base = root === 'skills_library' ? layout.libraryDir : layout.skillsDir;
  return path.join(base, ...rest);
}

function sameIndex(a, b) {
  return JSON.stringify(a.skills) === JSON.stringify(b.skills);
}

/**
 * Every skill in the installed index must exist in this platform's vault. Stale vault folders and
 * an install older than the kit source are reported but do not fail the check.
 */
function checkVault(layout, repoIndex) {
  const name = `${layout.name}: skills vault`;
  const { data, error } = readCompactIndex(path.join(layout.frameworkPath, 'matrix-skills', INDEX_FILE_NAME));
  if (!data) return { name, passed: false, detail: `compact-index.json ${error}` };
  const entries = Object.entries(data.skills);
  const missing = entries.filter(([, entry]) => !fs.existsSync(installedSkillPath(layout, entry.path)));
  const indexedLibrary = new Set(entries.filter(([, e]) => String(e.path).startsWith('skills_library/')).map(([id]) => id));
  const stale = fs.existsSync(layout.libraryDir)
    ? fs.readdirSync(layout.libraryDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !indexedLibrary.has(d.name)).map((d) => d.name)
    : [];
  const notes = [];
  if (stale.length) notes.push(`${stale.length} folders not in the index (${listNames(stale)})`);
  if (repoIndex && !sameIndex(data, repoIndex)) notes.push('older than the kit source — reinstall');
  const detail = missing.length
    ? `${missing.length}/${entries.length} skills missing (${listNames(missing.map(([id]) => id))}) — reinstall`
    : `${entries.length} skills present${notes.length ? `; ⚠️ ${notes.join('; ')}` : ''}`;
  return { name, passed: missing.length === 0, warning: notes.length > 0, detail };
}

/**
 * Informational: install manifest present (safe uninstall) and, for Claude Code, whether the opt-in
 * guard hook is registered. Never fails the run.
 */
function checkInstallState(key, layout, homeDir) {
  const notes = [];
  let hasManifest = false;
  try {
    hasManifest = loadManifest(homeDir, key) !== null;
  } catch (err) {
    notes.push(`manifest unreadable (${err instanceof Error ? err.message : String(err)})`);
  }
  if (!hasManifest && notes.length === 0) {
    notes.push('no install manifest (installed by an older release; reinstall so uninstall and legacy skill cleanup are exact)');
  }
  let hookNote = '';
  if (key === 'claude') {
    let registered = false;
    try {
      registered = isClaudeHookRegistered(path.join(homeDir, '.claude', 'settings.json'));
    } catch {
      registered = false;
    }
    hookNote = registered
      ? '; guard hook registered'
      : '; guard hook not registered (opt-in: boomopen install claude --with-hooks)';
  }
  return {
    name: `${layout.name}: install state`,
    passed: true,
    warning: notes.length > 0,
    detail: `${notes.length ? notes.join('; ') : 'manifest OK'}${hookNote}`,
  };
}

/**
 * Doctor checks for every installed platform (or only `options.platforms`).
 * @param {{ homeDir: string, repoRoot: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform,
 *           platforms?: string[], isSourceCheckout?: boolean }} options
 * @returns {{ installed: string[], checks: Array<object> }}
 */
function checkInstalledPlatforms(options) {
  const layouts = getPlatformLayouts(options.homeDir, options);
  const wanted = options.platforms && options.platforms.length ? options.platforms : Object.keys(layouts);
  const installed = wanted.filter((key) => layouts[key] && isPlatformPresent(key, layouts[key], options.homeDir));
  let repoIndex = null;
  if (options.isSourceCheckout) {
    try {
      repoIndex = buildCompactIndexData(options.repoRoot).payload;
    } catch {
      repoIndex = null; // The repository index check reports this problem.
    }
  }
  const checks = [];
  for (const key of installed) {
    const layout = layouts[key];
    checks.push(checkEntrypoints(layout, options.homeDir));
    checks.push(checkFramework(layout, referenceRootFor(layout, options)));
    checks.push(checkVault(layout, repoIndex));
    checks.push(checkInstallState(key, layout, options.homeDir));
  }
  return { installed, checks };
}

module.exports = {
  MAX_ENTRY_LINES,
  getPlatformLayouts,
  checkInstalledPlatforms,
  isPlatformPresent,
};
