'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const {
  CODE_EXTENSIONS,
  TS_EXTENSIONS,
  JS_FAMILY_EXTENSIONS,
  DECLARATION_FILE,
  toSegments,
  isIgnoredSegment,
  isTestPath,
  isLineCountExempt,
  isConsoleLogAllowed,
  codeOnly,
  findExplicitAny,
  findConsoleLog,
  findDeferredTodoComment,
  findHollowStub,
  findTestGaming,
} = require('./checker-rules.js');
const { countLines, readTextFile } = require('./checker-text.js');
const { KIT_VERSION } = require('./doctor-version.js');
const { CODING_STANDARDS_PRESETS, loadSettings } = require('./settings.js');

const SOFT_FILE_LINES = 400;
const HARD_FILE_LINES = 500;
const EXIT_OK = 0;
const EXIT_VIOLATIONS = 1;
const EXIT_USAGE = 2;
const WORKSPACE_CONFIG = '.boomopen.json';
const PROJECT_ROOT_MARKERS = [WORKSPACE_CONFIG, '.git', 'package.json', 'pyproject.toml', 'go.mod', 'Cargo.toml'];
const GIT_TIMEOUT_MS = 15000;
const GIT_MAX_BUFFER = 64 * 1024 * 1024;

/**
 * Resolve coding standards from a preset name, custom object, or default 400/500 limits.
 */
function resolveCodingStandards(customStandards) {
  if (typeof customStandards === 'string' && CODING_STANDARDS_PRESETS[customStandards]) {
    return CODING_STANDARDS_PRESETS[customStandards];
  }
  if (customStandards && typeof customStandards === 'object') {
    const presetBase =
      CODING_STANDARDS_PRESETS[customStandards.preset] || CODING_STANDARDS_PRESETS.pragmatic;
    return {
      softFileLines: customStandards.softFileLines ?? presetBase.softFileLines,
      hardFileLines: customStandards.hardFileLines ?? presetBase.hardFileLines,
      forbidExplicitAny: customStandards.forbidExplicitAny ?? presetBase.forbidExplicitAny,
      warnConsoleLog: customStandards.warnConsoleLog ?? presetBase.warnConsoleLog,
    };
  }
  return {
    softFileLines: SOFT_FILE_LINES,
    hardFileLines: HARD_FILE_LINES,
    forbidExplicitAny: true,
    warnConsoleLog: true,
  };
}

/**
 * Nearest ancestor of startDir (inclusive) that contains one of the marker names.
 * @returns {string|null}
 */
function findUp(startDir, markers) {
  let current = path.resolve(startDir);
  for (;;) {
    if (markers.some((marker) => fs.existsSync(path.join(current, marker)))) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Global (~/.boomopen/settings.json) + nearest workspace .boomopen.json, as documented in /settings.
 */
function resolveActiveStandards(targetDir, options = {}) {
  if (options.codingStandards) return options.codingStandards;
  const base = targetDir || options.cwd || process.cwd();
  const settingsCwd = findUp(base, [WORKSPACE_CONFIG]) || options.cwd || base;
  return loadSettings({ cwd: settingsCwd, homeDir: options.homeDir }).codingStandards;
}

/**
 * Inspect a single source file against Pragmatic 2-Tier Coding Standards.
 * @param {string} filePath
 * @param {string} baseDir folder that relative paths in messages are shown against
 * @param {string} [overrideContent]
 * @param {object|string} [customStandards]
 * @param {{ projectRoot?: string }} [context] root used for path-based exemptions
 * @returns {{violations: string[], warnings: string[]}}
 */
function inspectSourceFile(filePath, baseDir, overrideContent, customStandards, context = {}) {
  const std = resolveCodingStandards(customStandards);
  const relPath = path.relative(baseDir, filePath) || path.basename(filePath);
  const segments = toSegments(path.relative(context.projectRoot || baseDir, filePath) || path.basename(filePath));
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const content = overrideContent ?? readTextFile(filePath);
  const lineCount = countLines(content);
  const violations = [];
  const warnings = [];

  if (!isLineCountExempt(filePath, segments)) {
    if (lineCount > std.hardFileLines) {
      violations.push(`${relPath}: ${lineCount} lines (exceeds hard ceiling ${std.hardFileLines})`);
    } else if (lineCount > std.softFileLines) {
      warnings.push(
        `${relPath}: ${lineCount} lines (exceeds soft target ${std.softFileLines}, OK if single responsibility)`
      );
    }
  }
  const isTest = isTestPath(segments);
  const code = JS_FAMILY_EXTENSIONS.has(ext) ? codeOnly(content, ext) : '';
  if (context.strictPhase) {
    const todoLine = findDeferredTodoComment(content, ext);
    if (todoLine) violations.push(`${relPath}:${todoLine}: deferred TODO/FIXME/PLACEHOLDER comment detected (--strict-phase)`);
    const stub = findHollowStub(code, content, isTest, ext);
    if (stub) violations.push(`${relPath}:${stub.line}: hollow stub/mock detected (${stub.reason})`);
    const gaming = findTestGaming(code, content, isTest, ext);
    if (gaming) violations.push(`${relPath}:${gaming.line}: test gaming / skipped test detected (${gaming.reason})`);
  }
  if (!JS_FAMILY_EXTENSIONS.has(ext)) return { violations, warnings };

  if (std.forbidExplicitAny !== false && TS_EXTENSIONS.has(ext) && !DECLARATION_FILE.test(fileName)) {
    const anyLine = findExplicitAny(code);
    if (anyLine) violations.push(`${relPath}:${anyLine}: explicit 'any' type detected`);
  }
  if (std.warnConsoleLog !== false && !isConsoleLogAllowed(segments)) {
    const logLine = findConsoleLog(code);
    if (logLine) warnings.push(`${relPath}:${logLine}: leftover console.log() detected`);
  }
  return { violations, warnings };
}

function isSelectedFile(relPath, ignoreNames) {
  const segments = toSegments(relPath);
  if (!CODE_EXTENSIONS.has(path.extname(relPath).toLowerCase())) return false;
  return !segments.slice(0, -1).some((s) => isIgnoredSegment(s) || ignoreNames.has(s));
}

/**
 * Files git would track under dir (tracked + untracked, minus .gitignore'd); null outside a repo.
 * @returns {string[]|null} paths relative to dir
 */
function listGitFiles(dir) {
  const result = spawnSync('git', ['-C', dir, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    encoding: 'utf8',
    timeout: GIT_TIMEOUT_MS,
    maxBuffer: GIT_MAX_BUFFER,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) return null;
  return [...new Set(result.stdout.split('\0').filter(Boolean))];
}

function walkFiles(dir, ignoreNames, prefix = '', accumulator = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (isIgnoredSegment(entry.name) || ignoreNames.has(entry.name)) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walkFiles(path.join(dir, entry.name), ignoreNames, rel, accumulator);
    else if (entry.isFile()) accumulator.push(rel);
  }
  return accumulator;
}

/**
 * Collect source files under dir. Inside a git repository, .gitignore is respected.
 * @param {string} dir absolute directory
 * @param {{ ignore?: string[], useGitIgnore?: boolean }} options
 * @returns {string[]} absolute paths
 */
function collectSourceFiles(dir, options = {}) {
  const ignoreNames = new Set(options.ignore || []);
  const gitFiles = options.useGitIgnore === false ? null : listGitFiles(dir);
  const relFiles = gitFiles || walkFiles(dir, ignoreNames);
  return relFiles
    .filter((rel) => isSelectedFile(rel, ignoreNames))
    .map((rel) => path.join(dir, rel))
    .filter((abs) => fs.existsSync(abs) && fs.statSync(abs).isFile())
    .sort();
}

function usageError(message) {
  return { passed: false, scannedFiles: 0, violations: [], warnings: [], error: message, exitCode: EXIT_USAGE };
}

/**
 * Resolve the files to inspect for a target path, or a usage error.
 */
function resolveTargetFiles(targetPath, options) {
  if (typeof targetPath !== 'string' || targetPath.startsWith('-')) {
    return { error: `Invalid check target "${targetPath}". Usage: boomopen check [path] [--ignore <dir>]` };
  }
  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) return { error: `Path not found: ${resolved}` };
  const isFile = fs.statSync(resolved).isFile();
  const baseDir = isFile ? path.dirname(resolved) : resolved;
  const files = isFile
    ? [resolved].filter((f) => isSelectedFile(path.basename(f), new Set()))
    : collectSourceFiles(resolved, options);
  if (files.length === 0) {
    return { error: `No source files (${[...CODE_EXTENSIONS].join(' ')}) found in ${resolved}` };
  }
  return { resolved, baseDir, files };
}

function printReport(report, target, std) {
  console.log(`\n📏 BoomOpen Pragmatic 2-Tier Code Check (v${KIT_VERSION})\n` + '─'.repeat(60));
  console.log(`  📁 Target:   ${target}`);
  console.log(`  📄 Scanned:  ${report.scannedFiles} source files`);
  console.log(`  ❌ Errors:   ${report.violations.length} (Hard >${std.hardFileLines} lines or explicit 'any')`);
  console.log(`  ⚠️  Warnings: ${report.warnings.length} (Soft >${std.softFileLines} lines or console.log)`);
  for (const v of report.violations) console.log(`     ❌ ${v}`);
  for (const w of report.warnings) console.log(`     ⚠️  ${w}`);
  console.log('─'.repeat(60));
}

/**
 * Run deterministic code quality checks on a folder or a single file.
 * @param {string} targetDir
 * @param {{silent?: boolean, codingStandards?: object|string, homeDir?: string, cwd?: string,
 *          ignore?: string[], useGitIgnore?: boolean}} options
 * @returns {{passed: boolean, scannedFiles: number, violations: string[], warnings: string[],
 *            exitCode: number, error?: string}}
 */
function runCheck(targetDir = process.cwd(), options = {}) {
  let target;
  try {
    target = resolveTargetFiles(targetDir, options);
  } catch (err) {
    target = { error: `Cannot read ${targetDir}: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (target.error) {
    if (!options.silent) console.error(`❌ boomopen check: ${target.error}`);
    return usageError(target.error);
  }
  let std;
  try {
    std = resolveCodingStandards(resolveActiveStandards(target.baseDir, options));
  } catch (err) {
    const message = `Could not load settings: ${err instanceof Error ? err.message : String(err)}`;
    if (!options.silent) console.error(`❌ boomopen check: ${message}`);
    return usageError(message);
  }
  const projectRoot = findUp(target.baseDir, PROJECT_ROOT_MARKERS) || target.baseDir;
  const strictPhase = Boolean(options.strictPhase);
  const violations = [];
  const warnings = [];
  for (const filePath of target.files) {
    try {
      const report = inspectSourceFile(filePath, target.baseDir, undefined, std, { projectRoot, strictPhase });
      violations.push(...report.violations);
      warnings.push(...report.warnings);
    } catch (err) {
      // An unreadable file (EACCES, EISDIR, vanished mid-run) fails the check instead of crashing it.
      const relPath = path.relative(target.baseDir, filePath) || path.basename(filePath);
      violations.push(`${relPath}: could not be read (${err instanceof Error ? err.message : String(err)})`);
    }
  }
  const passed = violations.length === 0;
  const result = {
    passed,
    scannedFiles: target.files.length,
    violations,
    warnings,
    exitCode: passed ? EXIT_OK : EXIT_VIOLATIONS,
  };
  if (!options.silent) printReport(result, target.resolved, std);
  return result;
}

const CHECK_HELP = `Usage: boomopen check [path] [options]   (or: node cli/install.js check [path])

Checks source files (${[...CODE_EXTENSIONS].join(' ')}) against the Pragmatic 2-Tier Coding Standards.
Limits come from ~/.boomopen/settings.json and the nearest .boomopen.json.

Options:
  --ignore <dir>    Skip folders with this name (repeatable or comma-separated)
  --no-gitignore    Do not use .gitignore (walk every folder instead)
  --strict-phase    Also reject deferred TODO/FIXME comments, hollow stubs/mocks, and skipped/vacuous tests (alias: --no-stubs)
  -h, --help        Show this help

Exit codes: 0 = passed, 1 = violations found, 2 = invalid path or no source files.`;

/**
 * Parse `check` arguments (everything after the command name) and run the check.
 * @param {string[]} argv
 * @param {{ cwd?: string, homeDir?: string, silent?: boolean }} [options]
 * @returns {number} exit code
 */
function runCheckCli(argv = [], options = {}) {
  const ignore = [];
  let target = null;
  let useGitIgnore = true;
  let strictPhase = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      console.log(CHECK_HELP);
      return EXIT_OK;
    }
    if (arg === '--no-gitignore') { useGitIgnore = false; continue; }
    if (arg === '--strict-phase' || arg === '--no-stubs') { strictPhase = true; continue; }
    if (arg === '--ignore' || arg.startsWith('--ignore=')) {
      const value = arg === '--ignore' ? argv[++i] : arg.slice('--ignore='.length);
      if (!value) { console.error('❌ boomopen check: --ignore needs a folder name'); return EXIT_USAGE; }
      ignore.push(...value.split(',').map((s) => s.trim()).filter(Boolean));
      continue;
    }
    if (arg.startsWith('-') || target !== null) {
      console.error(`❌ boomopen check: unexpected argument "${arg}"\n\n${CHECK_HELP}`);
      return EXIT_USAGE;
    }
    target = arg;
  }
  const cwd = options.cwd || process.cwd();
  const report = runCheck(path.resolve(cwd, target || '.'), { ...options, cwd, ignore, useGitIgnore, strictPhase });
  return report.exitCode;
}

module.exports = {
  SOFT_FILE_LINES,
  HARD_FILE_LINES,
  EXIT_USAGE,
  collectSourceFiles,
  inspectSourceFile,
  resolveActiveStandards,
  resolveCodingStandards,
  runCheck,
  runCheckCli,
};
