'use strict';

/**
 * `boomopen doctor`: health checks for the kit source tree (when run from a checkout) and for
 * every platform the kit is installed on. Platforms that are not installed are skipped.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  INDEX_FILE_NAME,
  parseDomainYaml,
  buildCompactIndexData,
  buildCompactSkillIndex,
  readCompactIndex,
} = require('./doctor-index.js');
const { MAX_DOC_LINES, DOC_LINE_LIMITS, auditKitMarkdown } = require('./doctor-markdown.js');
const { MAX_ENTRY_LINES, getPlatformLayouts, checkInstalledPlatforms } = require('./doctor-platforms.js');
const { checkSettingsFiles } = require('./doctor-settings.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { probeEngines } = require('./conductor-engines.js');

const MIN_COMPACT_SKILLS = 1000;
const EXIT_HEALTHY = 0;
const EXIT_UNHEALTHY = 1;
const EXIT_USAGE = 2;
const NAME_COLUMN = 34;

const REQUIRED_PLATFORM_ASSETS = [
  'platforms/antigravity/GEMINI.md',
  'platforms/antigravity/AntigravityGlobal.agent.md',
  'platforms/antigravity/hooks/validate-tool-call.mjs',
  'platforms/claude/CLAUDE.md',
  'platforms/codex/CODEX.md',
  'platforms/codex/config.toml',
  'platforms/copilot/boomopen-workflow-kit.agent.md',
  'platforms/cursor/.cursorrules',
  'platforms/cursor/rules/boomopen-workflow-kit.mdc',
];

/**
 * A git checkout / package of the kit (as opposed to the framework copy inside a platform home).
 */
function isSourceCheckout(repoRoot) {
  return fs.existsSync(path.join(repoRoot, 'platforms')) && fs.existsSync(path.join(repoRoot, 'package.json'));
}

function checkPlatformAssets(repoRoot) {
  const missing = REQUIRED_PLATFORM_ASSETS.filter((rel) => !fs.existsSync(path.join(repoRoot, rel)));
  const hasLegacyDir = fs.existsSync(path.join(repoRoot, 'code-assistants'));
  const passed = missing.length === 0 && !hasLegacyDir;
  const detail = passed
    ? '5 platforms OK (antigravity, claude, codex, copilot, cursor)'
    : `Missing: ${missing.join(', ')}${hasLegacyDir ? ' (legacy code-assistants exists)' : ''}`;
  return { name: 'platforms/* (5 platform bundles)', passed, detail };
}

/**
 * The committed compact index must match what the YAML files produce, and every entry must
 * resolve inside the checkout. Domain YAML layout errors and count mismatches are reported too.
 */
function checkRepoIndex(repoRoot, minSkills) {
  const name = `matrix-skills/${INDEX_FILE_NAME}`;
  const { payload, report } = buildCompactIndexData(repoRoot);
  const { data, error } = readCompactIndex(path.join(repoRoot, 'matrix-skills', INDEX_FILE_NAME));
  const problems = [];
  const needsRebuild = !data || JSON.stringify(data.skills) !== JSON.stringify(payload.skills);
  if (!data) problems.push(`${INDEX_FILE_NAME} ${error}`);
  else if (needsRebuild) problems.push('stale (YAML changed)');
  const missing = Object.entries(payload.skills)
    .filter(([, entry]) => !fs.existsSync(path.join(repoRoot, entry.path)))
    .map(([id]) => id);
  const libraryBundled = fs.existsSync(path.join(repoRoot, 'skills_library'));
  const libraryEntries = Object.values(payload.skills).filter((entry) => String(entry.path).startsWith('skills_library/'));
  if (!libraryBundled && libraryEntries.length) {
    problems.push(`skills library not bundled (${libraryEntries.length} entries point to skills_library/)`);
    const coreMissing = missing.filter((id) => !String(payload.skills[id].path).startsWith('skills_library/'));
    if (coreMissing.length) problems.push(`${coreMissing.length} skill folders missing (${coreMissing.slice(0, 3).join(', ')})`);
  } else if (missing.length) {
    problems.push(`${missing.length} skill folders missing (${missing.slice(0, 3).join(', ')})`);
  }
  if (payload.totalSkills < minSkills) problems.push(`only ${payload.totalSkills} skills (expected ≥ ${minSkills})`);
  for (const file of report.files) {
    if (file.layoutProblems.length) problems.push(`${file.file} invalid YAML: ${file.layoutProblems[0]}`);
  }
  const notes = report.files
    .filter((f) => f.declaredCount !== null && f.declaredCount !== f.entries)
    .map((f) => `${f.file} skill_count ${f.declaredCount}≠${f.entries}`);
  const fixHint = needsRebuild ? ' — run `node cli/doctor.js --rebuild-index`' : '';
  const summary = `${payload.totalSkills} skills (${report.entryCount} entries, ${report.duplicates.length} multi-domain)`;
  return {
    name,
    passed: problems.length === 0,
    warning: notes.length > 0,
    detail: problems.length
      ? `${problems.join('; ')}${fixHint}`
      : `${summary}, all resolve${notes.length ? `; ⚠️ ${notes.slice(0, 3).join(', ')}${notes.length > 3 ? ` +${notes.length - 3} more` : ''}` : ''}`,
  };
}

function guarded(name, fn) {
  try {
    return fn();
  } catch (err) {
    return { name, passed: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

function collectSourceChecks(repoRoot, minSkills) {
  return [
    guarded('platforms/*', () => checkPlatformAssets(repoRoot)),
    ...guarded('Markdown audit', () => auditKitMarkdown(repoRoot)),
    guarded(`matrix-skills/${INDEX_FILE_NAME}`, () => checkRepoIndex(repoRoot, minSkills)),
  ].flat();
}

function installedPlatformChecks(options, sourceCheckout) {
  const result = checkInstalledPlatforms({ ...options, isSourceCheckout: sourceCheckout });
  const layouts = getPlatformLayouts(options.homeDir, options);
  const notInstalled = Object.keys(layouts).filter((k) => !result.installed.includes(k));
  const summary = {
    name: 'Installed platforms',
    passed: result.installed.length > 0,
    detail: result.installed.length
      ? `${result.installed.join(', ')}${notInstalled.length ? ` (not installed: ${notInstalled.join(', ')})` : ''}`
      : 'None found — run `boomopen install <tool>` (or `node cli/install.js install <tool>`)',
  };
  return [summary, ...result.checks];
}

function printReport(checks, healthy) {
  console.log(`\n🩺 BoomOpen Workflow Kit Doctor (v${KIT_VERSION})\n` + '─'.repeat(60));
  for (const c of checks) {
    const icon = !c.passed ? '❌' : c.warning ? '⚠️ ' : '✅';
    console.log(`  ${icon} ${c.name.padEnd(NAME_COLUMN)} ${c.detail}`);
  }
  console.log('─'.repeat(60));
  console.log(healthy ? '  Healthy.' : '  Problems found (❌). ⚠️ lines are informational.');
}

/**
 * Run full BoomOpen Workflow Kit doctor diagnostics. Read-only: nothing is written.
 * @param {{ repoRoot?: string, homeDir?: string, cwd?: string, env?: NodeJS.ProcessEnv,
 *           platform?: NodeJS.Platform, platforms?: string[], minSkills?: number, sourceOnly?: boolean,
 *           silent?: boolean }} options
 * @returns {{ healthy: boolean, checks: Array<{name: string, passed: boolean, detail: string, warning?: boolean}> }}
 */
function checkConductorEngines(options = {}) {
  const probes = probeEngines({ env: options.env, platform: options.platform });
  const ready = Object.entries(probes).filter(([, v]) => v.available).map(([k, v]) => `${k} (${v.bin})`);
  const queued = Object.entries(probes).filter(([, v]) => !v.available).map(([k]) => k);
  return {
    name: 'Conductor CLI engines',
    passed: true,
    detail: ready.length
      ? `${ready.length} CLI ready (${ready.join(', ')})${queued.length ? `; queue fallback: ${queued.join(', ')}` : ''}`
      : `0 CLI binaries on PATH (queue fallback active for ${queued.join(', ')})`,
  };
}

function runDoctor(options = {}) {
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  const homeDir = options.homeDir || os.homedir();
  const minSkills = options.minSkills ?? MIN_COMPACT_SKILLS;
  const sourceCheckout = isSourceCheckout(repoRoot);
  const checks = [
    ...(sourceCheckout ? collectSourceChecks(repoRoot, minSkills) : []),
    ...(options.sourceOnly
      ? []
      : guarded('Installed platforms', () => installedPlatformChecks({ ...options, repoRoot, homeDir }, sourceCheckout))),
    checkSettingsFiles({ homeDir, cwd: options.cwd }),
    guarded('Conductor CLI engines', () => checkConductorEngines(options)),
  ].flat();
  const healthy = checks.every((c) => c.passed);
  if (!options.silent) printReport(checks, healthy);
  return { healthy, checks };
}

const DOCTOR_HELP = `Usage: boomopen doctor [options]   (or: node cli/install.js doctor)

Checks the kit source (when run from a checkout), every installed platform
(antigravity, claude, codex, cursor, copilot) and ~/.boomopen/settings.json.

Options:
  --platform <name>   Only check this platform (repeatable or comma-separated)
  --source-only       Only check the kit source tree (CI), not the installed platforms
  --rebuild-index     Regenerate matrix-skills/${INDEX_FILE_NAME} from the YAML files first
  -h, --help          Show this help

Exit codes: 0 = healthy, 1 = problems found, 2 = invalid arguments.`;

/**
 * Parse `doctor` arguments (everything after the command name) and run it.
 * @param {string[]} argv
 * @param {{ repoRoot?: string, homeDir?: string, cwd?: string }} [options]
 * @returns {number} exit code
 */
function runDoctorCli(argv = [], options = {}) {
  const platforms = [];
  let rebuild = false;
  let sourceOnly = false;
  const known = Object.keys(getPlatformLayouts(options.homeDir || os.homedir(), options));
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') { console.log(DOCTOR_HELP); return EXIT_HEALTHY; }
    if (arg === '--rebuild-index' || arg === '--fix') { rebuild = true; continue; }
    if (arg === '--source-only') { sourceOnly = true; continue; }
    if (arg === '--platform' || arg.startsWith('--platform=')) {
      const value = arg === '--platform' ? argv[++i] : arg.slice('--platform='.length);
      const names = (value || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const unknown = names.filter((n) => !known.includes(n));
      if (!names.length || unknown.length) {
        console.error(`❌ boomopen doctor: unknown platform "${unknown.join(', ') || value || ''}". Use: ${known.join(', ')}`);
        return EXIT_USAGE;
      }
      platforms.push(...names);
      continue;
    }
    console.error(`❌ boomopen doctor: unexpected argument "${arg}"\n\n${DOCTOR_HELP}`);
    return EXIT_USAGE;
  }
  const repoRoot = options.repoRoot || path.resolve(__dirname, '..');
  if (rebuild) {
    try {
      const { count, outputPath } = buildCompactSkillIndex(repoRoot);
      console.log(`🔁 Rebuilt ${outputPath} (${count} skills)`);
    } catch (err) {
      console.error(`❌ Could not rebuild the index: ${err instanceof Error ? err.message : String(err)}`);
      return EXIT_UNHEALTHY;
    }
  }
  const report = runDoctor({ ...options, repoRoot, platforms, sourceOnly });
  return report.healthy ? EXIT_HEALTHY : EXIT_UNHEALTHY;
}

if (require.main === module) {
  process.exitCode = runDoctorCli(process.argv.slice(2));
}

module.exports = {
  MAX_ENTRY_LINES,
  MAX_DOC_LINES,
  DOC_LINE_LIMITS,
  MIN_COMPACT_SKILLS,
  parseDomainYaml,
  buildCompactSkillIndex,
  runDoctor,
  runDoctorCli,
};
