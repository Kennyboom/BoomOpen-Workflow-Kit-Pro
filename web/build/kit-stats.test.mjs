// Run with: node --test web/build/kit-stats.test.mjs (from the repository root)
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  KIT_STATS_FILE,
  PUBLIC_DIR,
  REPO_ROOT,
  checkKitStats,
  collectCommands,
  collectDomains,
  collectKitStats,
  readFrontmatterDescription,
} from './kit-stats.mjs'

const WEB_DATA_DIR = path.join(REPO_ROOT, 'web', 'src', 'data')
const CANONICAL_REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro'

/** @param {string} markdown @returns {string[]} */
function readBaseAgentsFromFrontmatter(markdown) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1]
  if (!fm) return []
  const lines = fm.split(/\r?\n/)
  const idx = lines.findIndex((line) => line.startsWith('base-agent:'))
  if (idx === -1) return []
  const inline = lines[idx].slice('base-agent:'.length).trim()
  if (inline) {
    return inline
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  /** @type {string[]} */
  const list = []
  for (const line of lines.slice(idx + 1)) {
    const match = /^\s+-\s+(.+)$/.exec(line)
    if (!match) break
    list.push(match[1].trim().replace(/^['"]|['"]$/g, ''))
  }
  return list
}

test('readFrontmatterDescription handles plain, quoted and folded values', () => {
  assert.equal(readFrontmatterDescription('---\ndescription: Plain text\n---\n'), 'Plain text')
  assert.equal(readFrontmatterDescription('---\ndescription: "🍳 Quoted"\n---\n'), 'Quoted')
  assert.equal(readFrontmatterDescription('---\ndescription: >-\n  Folded\n  value\nname: x\n---\n'), 'Folded value')
  assert.equal(readFrontmatterDescription('# no frontmatter'), '')
})

test('collectCommands groups variants under their base command', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kit-stats-'))
  try {
    for (const name of ['cook', 'cook-fast', 'cook-team', 'deploy', 'deploy-check', 'security-audit']) {
      fs.writeFileSync(path.join(dir, `${name}.md`), `---\ndescription: ${name}\n---\n`)
    }
    const commands = collectCommands(dir)
    assert.deepEqual(
      commands.map((command) => [command.name, command.variants]),
      [
        ['cook', ['fast', 'team']],
        ['deploy', ['check']],
        ['security-audit', []],
      ],
    )
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('collectDomains reads names and skill counts', () => {
  const yaml = [
    'version: 1',
    'domains:',
    '  backend:',
    '    name: "Backend Development"',
    '    skill_count: 12',
    '  ai_ml:',
    '    name: AI/ML',
    '    skill_count: 3',
    'other: true',
  ].join('\n')
  assert.deepEqual(collectDomains(yaml), [
    { id: 'backend', name: 'Backend Development', count: 12 },
    { id: 'ai_ml', name: 'ai_ml' === 'ai_ml' ? 'AI/ML' : '', count: 3 },
  ])
})

test('committed kit-stats.json and public discovery files match repository ground truth (LF & CRLF)', () => {
  const expected = collectKitStats(REPO_ROOT)
  const committed = JSON.parse(fs.readFileSync(KIT_STATS_FILE, 'utf8'))
  assert.deepEqual(committed, expected, 'run `npm --prefix web run stats` to regenerate kit-stats.json')
  assert.equal(committed.platforms, 5)
  assert.equal(committed.i18nLocales, 17)
  assert.equal(committed.agents, 22)
  assert.equal(committed.teams, 18)
  assert.equal(committed.teamRoles, 54)
  assert.equal(committed.teamFiles, 72)
  assert.equal(committed.coreSkills, 22)
  assert.equal(committed.librarySkills, 1440)
  assert.equal(committed.skills, 1462)
  assert.equal(committed.commands.length, 33)
  assert.equal(committed.commandFiles, 89)
  assert.deepEqual(checkKitStats(REPO_ROOT, KIT_STATS_FILE), { inSync: true })

  for (const discoveryFile of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
    const fullPath = path.join(PUBLIC_DIR, discoveryFile)
    assert.ok(fs.existsSync(fullPath), `Expected web/public/${discoveryFile} to exist`)
    assert.ok(fs.readFileSync(fullPath, 'utf8').trim().length > 20, `Expected ${discoveryFile} to be non-empty`)
  }

  const crlfFile = path.join(os.tmpdir(), `kit-stats-crlf-${Date.now()}.json`)
  try {
    const crlfJson = `${JSON.stringify(expected, null, 2)}\n`.replace(/\n/g, '\r\n')
    fs.writeFileSync(crlfFile, crlfJson, 'utf8')
    assert.deepEqual(checkKitStats(REPO_ROOT, crlfFile), { inSync: true })
    fs.writeFileSync(crlfFile, '{"stale":true}\n', 'utf8')
    assert.deepEqual(checkKitStats(REPO_ROOT, crlfFile), { inSync: false })
  } finally {
    fs.rmSync(crlfFile, { force: true })
  }
})

test('commands.ts, agents.ts, teams.ts, skills.ts & platforms.ts match 100% of disk definitions', () => {
  /** @type {import('../src/data/kitStats').KitStats} */
  const stats = JSON.parse(fs.readFileSync(KIT_STATS_FILE, 'utf8'))

  // 1. All 33 base slash commands
  const commandsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'commands.ts'), 'utf8')
  assert.ok(commandsTs.includes('export const COMMANDS_CATALOG'), 'commands.ts must export COMMANDS_CATALOG')
  const seededCommands = [...commandsTs.matchAll(/defineSeed\(\s*'([^']+)'/g)].map((m) => m[1]).sort()
  const diskCommands = stats.commands.map((c) => c.name).sort()
  assert.deepEqual(seededCommands, diskCommands, 'commands.ts must explicitly seed every base command in commands/')

  // 2. All 22 specialist agents
  const agentsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'agents.ts'), 'utf8')
  assert.ok(agentsTs.includes('export const SPECIALIST_AGENTS'), 'agents.ts must export SPECIALIST_AGENTS')
  const listedAgents = [...agentsTs.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]).sort()
  const diskAgents = fs
    .readdirSync(path.join(REPO_ROOT, 'agents'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.slice(0, -3))
    .sort()
  assert.deepEqual(listedAgents, diskAgents, 'agents.ts must match every agents/*.md file on disk')

  // 3. All 18 Golden Diamond teams & 54/54 base-agent role frontmatter definitions
  const teamsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'teams.ts'), 'utf8')
  assert.ok(teamsTs.includes('export const SPECIALIST_TEAMS'), 'teams.ts must export SPECIALIST_TEAMS')
  const teamBlocks = [
    ...teamsTs.matchAll(
      /dirName:\s*'([^']+)'[\s\S]*?roles:\s*\{\s*techlead:\s*\[([^\]]+)\],\s*executor:\s*\[([^\]]+)\],\s*reviewer:\s*\[([^\]]+)\]/g,
    ),
  ]
  /** @param {string} raw @returns {string[]} */
  const parseStringArray = (raw) =>
    raw
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)

  const listedTeamDirs = teamBlocks.map((m) => m[1]).sort()
  const teamsRoot = path.join(REPO_ROOT, 'agents', 'teams')
  const diskTeamDirs = fs
    .readdirSync(teamsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(listedTeamDirs, diskTeamDirs, 'teams.ts must list all 18 folders in agents/teams/')

  for (const [, dirName, rawTechlead, rawExecutor, rawReviewer] of teamBlocks) {
    const roleMap = {
      'techlead.md': parseStringArray(rawTechlead ?? ''),
      'executor.md': parseStringArray(rawExecutor ?? ''),
      'reviewer.md': parseStringArray(rawReviewer ?? ''),
    }
    for (const [roleFile, webAgents] of Object.entries(roleMap)) {
      const md = fs.readFileSync(path.join(teamsRoot, dirName, roleFile), 'utf8')
      const diskBaseAgents = readBaseAgentsFromFrontmatter(md)
      assert.deepEqual(webAgents, diskBaseAgents, `Mismatch in ${dirName}/${roleFile} base-agent mapping`)
    }
  }

  // 4. All 22 Core Skills, 19 Domains & Featured Library Skills on disk
  const skillsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'skills.ts'), 'utf8')
  const domainBlock = /SKILL_DOMAIN_LABELS[\s\S]*?=\s*\{([\s\S]*?)\n\}/.exec(skillsTs)?.[1] ?? ''
  const listedDomains = [...domainBlock.matchAll(/^\s*([a-z_]+):\s*\{/gm)].map((m) => m[1]).sort()
  assert.deepEqual(listedDomains, stats.domains.map((d) => d.id).sort(), 'SKILL_DOMAIN_LABELS must cover all 19 domains')

  const [corePart, libraryPart] = skillsTs.split('export const FEATURED_LIBRARY_SKILLS')
  const coreIds = [...(corePart ?? '').matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]).sort()
  const diskCoreSkills = fs
    .readdirSync(path.join(REPO_ROOT, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
  assert.deepEqual(coreIds, diskCoreSkills, 'CORE_SKILLS_SHOWCASE must list all 22 skills/* folders')

  const featuredIds = [...(libraryPart ?? '').matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1])
  assert.ok(featuredIds.length >= 19, 'Expected featured library skills across domains')
  for (const skillId of featuredIds) {
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, 'skills_library', skillId, 'SKILL.md')),
      `Featured skill skills_library/${skillId}/SKILL.md must exist on disk`,
    )
  }

  // 5. Platforms safe install URL & zero uninstall mixing
  const platformsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'platforms.ts'), 'utf8')
  assert.ok(platformsTs.includes(CANONICAL_REPO_URL), 'platforms.ts must point to BoomOpen-Workflow-Kit-Pro')
  const installCmds = [...platformsTs.matchAll(/\binstallCommand:\s*([^\n,]+)/g)].map((m) => m[1])
  assert.equal(installCmds.length, 5)
  for (const cmd of installCmds) {
    assert.ok(!/uninstall/i.test(cmd), `installCommand must never contain uninstall: ${cmd}`)
  }

  // 6. URL query deep-linking (useSearchParams), RFC 9110 Range hardening & dead dependency removal
  const webPkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'web', 'package.json'), 'utf8'))
  assert.equal(webPkg.version, stats.version, 'web/package.json version must match kit version')
  assert.ok(!('@xyflow/react' in (webPkg.dependencies ?? {})), '@xyflow/react must not remain in web/package.json')

  const llmsTxt = fs.readFileSync(path.join(PUBLIC_DIR, 'llms.txt'), 'utf8')
  for (const sub of ['install', 'uninstall', 'list', 'doctor', 'settings', 'research', 'design', 'plan', 'cook', 'reconcile', 'audit', 'ledger', 'conduct', 'check']) {
    assert.ok(llmsTxt.includes(`\`${sub}\``), `public/llms.txt must document CLI subcommand ${sub}`)
  }

  const pagesDir = path.join(REPO_ROOT, 'web', 'src', 'pages')
  for (const pageFile of ['CommandsPage.tsx', 'AgentsTeamsPage.tsx', 'SkillsPage.tsx', 'InstallPage.tsx', 'HomePage.tsx']) {
    const src = fs.readFileSync(path.join(pagesDir, pageFile), 'utf8')
    assert.ok(src.includes('useSearchParams'), `${pageFile} must sync URL query parameters via useSearchParams`)
  }
})
