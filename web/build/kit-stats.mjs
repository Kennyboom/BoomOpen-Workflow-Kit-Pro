#!/usr/bin/env node
/**
 * Collects website statistics from the kit repository and syncs static discovery
 * files (`robots.txt`, `sitemap.xml`, `llms.txt`) for `predev` / `prebuild`.
 * @typedef {import('../src/data/kitStats').KitStats} KitStats
 * @typedef {import('../src/data/kitStats').KitCommand} KitCommand
 * @typedef {import('../src/data/kitStats').KitDomain} KitDomain
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---/
const LEADING_SYMBOLS_PATTERN = /^[^\p{L}\p{N}/]+/u
const BLOCK_SCALAR_MARKERS = ['>-', '>', '|', '|-']
const TEAM_ROLE_FILES = ['techlead.md', 'executor.md', 'reviewer.md']
const REPO_GITHUB_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro'

const DISCOVERY_ROUTES = [
  { pathname: '/', priority: '1.0' },
  { pathname: '/commands', priority: '0.9' },
  { pathname: '/agents', priority: '0.9' },
  { pathname: '/skills', priority: '0.9' },
  { pathname: '/architecture', priority: '0.85' },
  { pathname: '/install', priority: '0.95' },
]

const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const REPO_ROOT = path.resolve(WEB_DIR, '..')
export const KIT_STATS_FILE = path.join(WEB_DIR, 'src', 'data', 'kit-stats.json')
export const PUBLIC_DIR = path.join(WEB_DIR, 'public')
export const SITE_ORIGIN = 'https://boomopen.com'

/** @param {string} value @returns {string} */
const normalizeLf = (value) => String(value).replace(/\r\n/g, '\n')

/** @param {string} value @returns {string} */
export const sanitizeDashes = (value) =>
  String(value)
    .replace(/\s+\u2014\s+/g, ': ')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')

/** @param {string} filePath @returns {string} */
const readText = (filePath) => fs.readFileSync(filePath, 'utf8')

/** @param {string} dirPath @returns {string[]} */
function listDirs(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

/** @param {string} dirPath @returns {string[]} Markdown basenames without extension. */
function listMarkdown(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.slice(0, -'.md'.length))
}

/** @param {string} markdown @returns {string} */
export function readFrontmatterDescription(markdown) {
  const frontmatter = FRONTMATTER_PATTERN.exec(markdown)?.[1]
  if (!frontmatter) return ''
  const lines = frontmatter.split(/\r?\n/)
  const index = lines.findIndex((line) => line.startsWith('description:'))
  if (index === -1) return ''
  let value = lines[index].slice('description:'.length).trim()
  if (BLOCK_SCALAR_MARKERS.includes(value)) {
    /** @type {string[]} */
    const block = []
    for (const line of lines.slice(index + 1)) {
      if (!/^\s+\S/.test(line)) break
      block.push(line.trim())
    }
    value = block.join(' ')
  }
  const cleaned = value.replace(/^["']|["']$/g, '').replace(LEADING_SYMBOLS_PATTERN, '').trim()
  return sanitizeDashes(cleaned)
}

/**
 * Groups command files into base commands and their variants (`deploy-check` -> deploy:check).
 * A file is a variant only when the prefix before a dash is itself a command file.
 * @param {string} commandsDir
 * @returns {KitCommand[]}
 */
export function collectCommands(commandsDir) {
  const names = new Set(listMarkdown(commandsDir))
  /** @type {(name: string) => [string, string] | null} */
  const variantOf = (name) => {
    const parts = name.split('-')
    for (let cut = parts.length - 1; cut >= 1; cut--) {
      const base = parts.slice(0, cut).join('-')
      if (names.has(base)) return [base, parts.slice(cut).join('-')]
    }
    return null
  }
  const sorted = [...names].sort()
  /** @type {Map<string, KitCommand>} */
  const commands = new Map()
  for (const name of sorted) {
    if (variantOf(name)) continue
    const description = readFrontmatterDescription(readText(path.join(commandsDir, `${name}.md`)))
    commands.set(name, { name, variants: [], description })
  }
  for (const name of sorted) {
    const match = variantOf(name)
    if (match) commands.get(match[0])?.variants.push(match[1])
  }
  return [...commands.values()]
}

/**
 * Parses the domain registry of matrix-skills/_index.yaml (line based, no YAML dependency).
 * @param {string} indexYaml
 * @returns {KitDomain[]}
 */
export function collectDomains(indexYaml) {
  const lines = indexYaml.split(/\r?\n/)
  const start = lines.indexOf('domains:')
  if (start === -1) return []
  /** @type {KitDomain[]} */
  const domains = []
  /** @type {KitDomain | undefined} */
  let current
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break
    const key = /^ {2}([a-z_]+):\s*$/.exec(line)
    if (key) {
      current = { id: key[1], name: key[1], count: 0 }
      domains.push(current)
      continue
    }
    const name = /^ {4}name:\s*"?([^"]+?)"?\s*$/.exec(line)
    if (name && current) current.name = sanitizeDashes(name[1])
    const count = /^ {4}skill_count:\s*(\d+)/.exec(line)
    if (count && current) current.count = Number(count[1])
  }
  return domains
}

/** @param {string} filePath @param {string} field @returns {unknown} */
function readJsonField(filePath, field) {
  /** @type {unknown} */
  const data = JSON.parse(readText(filePath))
  return typeof data === 'object' && data !== null ? Reflect.get(data, field) : undefined
}

/**
 * Reads every statistic from the repository root. Throws when a source is missing.
 * @param {string} repoRoot
 * @returns {KitStats}
 */
export function collectKitStats(repoRoot) {
  const version = readJsonField(path.join(repoRoot, 'package.json'), 'version')
  if (typeof version !== 'string' || !version) throw new Error('package.json has no version')
  const skills = readJsonField(path.join(repoRoot, 'matrix-skills', 'compact-index.json'), 'totalSkills')
  if (typeof skills !== 'number' || !skills) throw new Error('compact-index.json has no totalSkills')

  const platforms = listDirs(path.join(repoRoot, 'platforms')).length
  const i18nDir = path.join(repoRoot, 'i18n')
  const i18nTranslations = fs.existsSync(i18nDir)
    ? listMarkdown(i18nDir).filter((name) => name.startsWith('README.')).length
    : 0
  const i18nLocales = (fs.existsSync(path.join(repoRoot, 'README.md')) ? 1 : 0) + i18nTranslations

  const agentsDir = path.join(repoRoot, 'agents')
  const teamsDir = path.join(agentsDir, 'teams')
  const teams = listDirs(teamsDir)
  const teamRoles = teams.reduce(
    (total, team) =>
      total + TEAM_ROLE_FILES.filter((file) => fs.existsSync(path.join(teamsDir, team, file))).length,
    0,
  )
  const teamFiles = teams.reduce((total, team) => total + listMarkdown(path.join(teamsDir, team)).length, 0)

  const commandsDir = path.join(repoRoot, 'commands')
  const commandsRefDir = path.join(commandsDir, '_ref')
  const commands = collectCommands(commandsDir)
  const commandWorkflowFiles = commands.reduce((total, command) => total + 1 + command.variants.length, 0)
  const commandRefFiles = fs.existsSync(commandsRefDir) ? listMarkdown(commandsRefDir).length : 0

  return {
    version,
    platforms,
    i18nLocales,
    agents: listMarkdown(agentsDir).length,
    teams: teams.length,
    teamRoles,
    teamFiles,
    skills,
    coreSkills: listDirs(path.join(repoRoot, 'skills')).length,
    librarySkills: listDirs(path.join(repoRoot, 'skills_library')).length,
    domains: collectDomains(readText(path.join(repoRoot, 'matrix-skills', '_index.yaml'))),
    commands,
    commandWorkflowFiles,
    commandRefFiles,
    commandFiles: commandWorkflowFiles + commandRefFiles,
  }
}

/** @param {string} [siteOrigin] @returns {string} */
export function renderRobotsTxt(siteOrigin = SITE_ORIGIN) {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteOrigin}/sitemap.xml`, ''].join('\n')
}

/** @param {string} [siteOrigin] @returns {string} */
export function renderSitemapXml(siteOrigin = SITE_ORIGIN) {
  const urls = DISCOVERY_ROUTES.map(({ pathname, priority }) => {
    const loc = pathname === '/' ? `${siteOrigin}/` : `${siteOrigin}${pathname}`
    return ['  <url>', `    <loc>${loc}</loc>`, `    <priority>${priority}</priority>`, '  </url>'].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

/** @param {KitStats} stats @param {string} [siteOrigin] @returns {string} */
export function renderLlmsTxt(stats, siteOrigin = SITE_ORIGIN) {
  const skillsTotal = stats.skills.toLocaleString('en-US')
  const libTotal = stats.librarySkills.toLocaleString('en-US')
  const cmdTotal = stats.commands.length || 36
  const domainTotal = stats.domains.length || 19

  return sanitizeDashes([
    `# BoomOpen Workflow Kit Pro (v${stats.version})`,
    '',
    `> Proactive \`smart-hybrid\` default preset (auto Mode A/B + 17-language routing, plus < 2.3 KB \`frontier-guardrails\` slim Mode A), 3-Wave Contract-First sharding, Wave 2.5 spec-to-code reconciliation, multi-round project audit (/audit), multi-session /autopilot, and 14 local CLI commands across ${stats.platforms} AI coding IDEs (Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot).`,
    '',
    '## Canonical Inventory',
    `- Production Website: ${siteOrigin}`,
    `- Version: v${stats.version}`,
    `- Platforms (${stats.platforms}): Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot`,
    `- Default Preset: \`smart-hybrid\` (auto Mode A/B across 14 entry files; presets: \`smart-hybrid\`, \`frontier-guardrails\` < 2.3 KB slim, \`solo-fast\`, \`deep-architect\`, \`adversarial-team\`, plus \`carbon-guardrails\` alias; 22 config keys = 20 enum + 2 line limits)`,
    `- Slash Commands: ${cmdTotal} base commands (${stats.commandFiles} files: ${stats.commandWorkflowFiles} workflows + ${stats.commandRefFiles} shared references, including /onboard, /pr, /pr:review, /release, /audit, /autopilot, /conduct, /cook, /code)`,
    `- Sub-Agents: ${stats.agents} domain specialists`,
    `- Review Teams: ${stats.teams} adversarial 3-role review teams (${stats.teamFiles} files: Tech Lead, Executor, Reviewer)`,
    `- Skills Vault: ${skillsTotal} indexed skills (${stats.coreSkills} core + ${libTotal} library across ${domainTotal} domains, shared via ~/.agents/skills_library)`,
    `- Multilingual Routing: ${stats.i18nLocales} supported languages (opt-in via \`smart-hybrid\` or \`workflows.naturalLanguageResearchTrigger\`)`,
    '',
    '## Quick Install (From Git Clone)',
    '```bash',
    `git clone ${REPO_GITHUB_URL}.git`,
    'cd BoomOpen-Workflow-Kit-Pro',
    'node cli/install.js install --all',
    'node cli/install.js doctor',
    '```',
    '',
    '## Local CLI Subcommands (14)',
    '- `install` / `uninstall` / `list` / `doctor` / `settings`: SHA-256 manifest installer (14 entry files, `--as-plugin` bundle, opt-in `--with-hooks` on Claude/Antigravity/Cursor) & Control Center (`--ui`)',
    '- `research` / `design` / `plan` / `cook` / `reconcile`: Fast local validators (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`), wave packet compilers & Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`)',
    '- `audit` / `ledger` / `conduct` / `check`: Multi-round project audit (`.boomopen/audit-ledger.json`, `audit rollback --round 1 --yes`), `.boomopen/project-ledger.json` phase ratchet (`ledger rollback --phase PHASE-1 --yes`), Multi-Engine Council (`conduct council --task review --prompt "..."`), and 2-tier static gate (`--strict-phase --no-stubs`)',
    '',
    '## Documentation & Catalogs',
    `- [Overview & Walkthrough](${siteOrigin}/): 15-language overview, workflow visualizer, and 14-command CLI Playground`,
    `- [Slash Commands Catalog](${siteOrigin}/commands): Searchable reference of all ${cmdTotal} commands and variants`,
    `- [Sub-Agents & 3-Role Review Teams](${siteOrigin}/agents): ${stats.agents} sub-agents and ${stats.teams} review teams`,
    `- [Skills Vault Explorer](${siteOrigin}/skills): ${skillsTotal} indexed skills across ${domainTotal} engineering domains`,
    `- [Architecture & CLI Gates](${siteOrigin}/architecture): smart-hybrid default, 3-wave sharding, deliverable routing, and /autopilot ratchet`,
    `- [Git Installation Guide](${siteOrigin}/install): Per-IDE setup, doctor checks, and opt-in hook registration`,
    `- [GitHub Repository](${REPO_GITHUB_URL}): Source code, rules, agents, skills, and release notes`,
    '',
  ].join('\n'))
}

/** @param {KitStats} stats @param {string} [publicDir] @returns {Array<[string, string]>} */
function buildDiscoveryTargets(stats, publicDir = PUBLIC_DIR) {
  return [
    [path.join(publicDir, 'robots.txt'), renderRobotsTxt()],
    [path.join(publicDir, 'sitemap.xml'), renderSitemapXml()],
    [path.join(publicDir, 'llms.txt'), renderLlmsTxt(stats)],
  ]
}

/**
 * Checks whether kit-stats.json (and public discovery files on default target) are in sync.
 * @param {string} [repoRoot]
 * @param {string} [outFile]
 * @returns {{ inSync: boolean, error?: string }}
 */
export function checkKitStats(repoRoot = REPO_ROOT, outFile = KIT_STATS_FILE) {
  try {
    const stats = collectKitStats(repoRoot)
    const next = normalizeLf(`${JSON.stringify(stats, null, 2)}\n`)
    const current = fs.existsSync(outFile) ? normalizeLf(readText(outFile)) : ''
    if (current !== next) return { inSync: false }
    if (path.resolve(outFile) === path.resolve(KIT_STATS_FILE)) {
      for (const [targetFile, expectedContent] of buildDiscoveryTargets(stats)) {
        const existing = fs.existsSync(targetFile) ? normalizeLf(readText(targetFile)) : ''
        if (existing !== normalizeLf(expectedContent)) return { inSync: false }
      }
    }
    return { inSync: true }
  } catch (error) {
    return { inSync: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Regenerates `kit-stats.json` and `public/{robots.txt,sitemap.xml,llms.txt}`.
 * @param {string} [repoRoot]
 * @param {string} [outFile]
 * @returns {{ written: boolean, error?: string }}
 */
export function writeKitStats(repoRoot = REPO_ROOT, outFile = KIT_STATS_FILE) {
  try {
    const stats = collectKitStats(repoRoot)
    const next = normalizeLf(`${JSON.stringify(stats, null, 2)}\n`)
    const current = fs.existsSync(outFile) ? normalizeLf(readText(outFile)) : ''
    let written = false
    if (current !== next) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(outFile, next, 'utf8')
      written = true
    }
    if (path.resolve(outFile) === path.resolve(KIT_STATS_FILE)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true })
      for (const [targetFile, expectedContent] of buildDiscoveryTargets(stats)) {
        const normalizedExpected = normalizeLf(expectedContent)
        const existing = fs.existsSync(targetFile) ? normalizeLf(readText(targetFile)) : ''
        if (existing !== normalizedExpected) {
          fs.writeFileSync(targetFile, normalizedExpected, 'utf8')
          written = true
        }
      }
    }
    return { written }
  } catch (error) {
    return { written: false, error: error instanceof Error ? error.message : String(error) }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const relStats = path.relative(WEB_DIR, KIT_STATS_FILE)
  if (process.argv.includes('--check')) {
    const check = checkKitStats()
    if (check.error) {
      process.stderr.write(`[kit-stats] check failed: ${check.error}\n`)
      process.exit(1)
    }
    if (!check.inSync) {
      process.stderr.write(`[kit-stats] out of sync: ${relStats} (run \`node web/build/kit-stats.mjs\`)\n`)
      process.exit(1)
    }
    process.stdout.write(`[kit-stats] in sync: ${relStats} + public/{robots.txt,sitemap.xml,llms.txt}\n`)
    process.exit(0)
  }
  const result = writeKitStats()
  if (result.error) process.stderr.write(`[kit-stats] kept existing kit-stats.json: ${result.error}\n`)
  else process.stdout.write(`[kit-stats] ${result.written ? 'updated' : 'unchanged'} ${relStats} + public/{robots.txt,sitemap.xml,llms.txt}\n`)
}
