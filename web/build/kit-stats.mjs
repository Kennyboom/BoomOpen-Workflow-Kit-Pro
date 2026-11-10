#!/usr/bin/env node
/**
 * Collects website statistics from the kit repository so the numbers on the
 * site never drift from the real agents, commands and skills.
 *
 * Run directly (`node build/kit-stats.mjs`, wired to `predev` / `prebuild`) to
 * regenerate src/data/kit-stats.json. Plain JS so it runs on any supported Node.
 *
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
const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const REPO_ROOT = path.resolve(WEB_DIR, '..')
export const KIT_STATS_FILE = path.join(WEB_DIR, 'src', 'data', 'kit-stats.json')

/** @param {string} filePath */
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

/**
 * Reads the `description` field from a Markdown frontmatter block (plain, quoted or folded).
 * @param {string} markdown
 * @returns {string}
 */
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
  return value.replace(/^["']|["']$/g, '').replace(LEADING_SYMBOLS_PATTERN, '').trim()
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
    if (name && current) current.name = name[1]
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

  const agentsDir = path.join(repoRoot, 'agents')
  const teamsDir = path.join(agentsDir, 'teams')
  const teams = listDirs(teamsDir)
  const commands = collectCommands(path.join(repoRoot, 'commands'))
  const teamRoles = teams.reduce(
    (total, team) =>
      total + TEAM_ROLE_FILES.filter((file) => fs.existsSync(path.join(teamsDir, team, file))).length,
    0,
  )

  return {
    version,
    agents: listMarkdown(agentsDir).length,
    teams: teams.length,
    teamRoles,
    skills,
    coreSkills: listDirs(path.join(repoRoot, 'skills')).length,
    librarySkills: listDirs(path.join(repoRoot, 'skills_library')).length,
    domains: collectDomains(readText(path.join(repoRoot, 'matrix-skills', '_index.yaml'))),
    commands,
    commandFiles: commands.reduce((total, command) => total + 1 + command.variants.length, 0),
  }
}

/**
 * Checks whether kit-stats.json is in sync with the repository without modifying files.
 * @param {string} [repoRoot]
 * @param {string} [outFile]
 * @returns {{ inSync: boolean, error?: string }}
 */
export function checkKitStats(repoRoot = REPO_ROOT, outFile = KIT_STATS_FILE) {
  try {
    const next = `${JSON.stringify(collectKitStats(repoRoot), null, 2)}\n`
    const current = fs.existsSync(outFile) ? readText(outFile) : ''
    return { inSync: current === next }
  } catch (error) {
    return { inSync: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Regenerates the stats JSON when the repository is available. Keeps the committed JSON
 * when sources are missing (e.g. only web/ is deployed) and reports why.
 * @param {string} [repoRoot]
 * @param {string} [outFile]
 * @returns {{ written: boolean, error?: string }}
 */
export function writeKitStats(repoRoot = REPO_ROOT, outFile = KIT_STATS_FILE) {
  try {
    const next = `${JSON.stringify(collectKitStats(repoRoot), null, 2)}\n`
    const current = fs.existsSync(outFile) ? readText(outFile) : ''
    if (current === next) return { written: false }
    fs.writeFileSync(outFile, next)
    return { written: true }
  } catch (error) {
    return { written: false, error: error instanceof Error ? error.message : String(error) }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  if (process.argv.includes('--check')) {
    const check = checkKitStats()
    if (check.error) {
      console.error(`[kit-stats] check failed: ${check.error}`)
      process.exit(1)
    }
    if (!check.inSync) {
      console.error(`[kit-stats] out of sync: ${path.relative(WEB_DIR, KIT_STATS_FILE)} (run \`node web/build/kit-stats.mjs\`)`)
      process.exit(1)
    }
    console.log(`[kit-stats] in sync: ${path.relative(WEB_DIR, KIT_STATS_FILE)}`)
    process.exit(0)
  }
  const result = writeKitStats()
  if (result.error) console.warn(`[kit-stats] kept existing kit-stats.json: ${result.error}`)
  else console.log(`[kit-stats] ${result.written ? 'updated' : 'unchanged'} ${path.relative(WEB_DIR, KIT_STATS_FILE)}`)
}
