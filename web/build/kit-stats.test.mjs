// Run with: node --test web/build/kit-stats.test.mjs (from the repository root)
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import {
  KIT_STATS_FILE,
  REPO_ROOT,
  checkKitStats,
  collectCommands,
  collectDomains,
  collectKitStats,
  readFrontmatterDescription,
} from './kit-stats.mjs'

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
    { id: 'ai_ml', name: 'AI/ML', count: 3 },
  ])
})

test('committed kit-stats.json matches the repository', () => {
  const expected = collectKitStats(REPO_ROOT)
  const committed = JSON.parse(fs.readFileSync(KIT_STATS_FILE, 'utf8'))
  assert.deepEqual(committed, expected, 'run `npm run stats` in web/ to regenerate kit-stats.json')
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'))
  assert.equal(committed.version, pkg.version)
  assert.equal(committed.coreSkills, 22)
  assert.equal(committed.teams, 18)
  assert.equal(committed.teamRoles, 54)
  const agentTeamsTs = fs.readFileSync(path.join(REPO_ROOT, 'web', 'src', 'data', 'agentTeams.ts'), 'utf8')
  const listedDomains = [...agentTeamsTs.matchAll(/\{\s*domain:\s*'([^']+)'/g)].map((m) => `${m[1]}-team`).sort()
  const diskTeams = fs.readdirSync(path.join(REPO_ROOT, 'agents', 'teams'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
  assert.deepEqual(listedDomains, diskTeams, 'web/src/data/agentTeams.ts must list every team in agents/teams/')
  assert.deepEqual(checkKitStats(REPO_ROOT, KIT_STATS_FILE), { inSync: true })
  const stalePath = path.join(os.tmpdir(), `kit-stats-stale-${Date.now()}.json`)
  try {
    fs.writeFileSync(stalePath, '{"stale":true}\n')
    assert.deepEqual(checkKitStats(REPO_ROOT, stalePath), { inSync: false })
  } finally {
    fs.rmSync(stalePath, { force: true })
  }
})
