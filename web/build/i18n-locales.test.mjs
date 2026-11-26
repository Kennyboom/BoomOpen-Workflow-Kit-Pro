// Run with: node --test web/build/i18n-locales.test.mjs (from the repository root)
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'
import { KIT_STATS_FILE, REPO_ROOT } from './kit-stats.mjs'

const WEB_DIR = path.join(REPO_ROOT, 'web')
const WEB_DATA_DIR = path.join(WEB_DIR, 'src', 'data')
const WEB_I18N_DIR = path.join(WEB_DIR, 'src', 'i18n')

const NEW_LOCALES = [
  'zh-CN',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'pt-BR',
  'ru',
  'hi',
  'ar',
  'id',
  'th',
]

const EXPECTED_PLATFORMS = ['antigravity', 'claude', 'codex', 'copilot', 'cursor']
const EXPECTED_CLI_IDS = [
  'audit',
  'check',
  'conduct',
  'cook',
  'design',
  'doctor',
  'install',
  'ledger',
  'list',
  'plan',
  'reconcile',
  'research',
  'settings',
  'uninstall',
]
const EXPECTED_SEO_ROUTES = [
  'agents',
  'architecture',
  'commands',
  'home',
  'install',
  'notFound',
  'skills',
]

const MAX_LOCALE_FILE_LINES = 385
const DASH_PATTERN = /[\u2014\u2013]/

/**
 * Evaluates a pure TypeScript data module (`import type` + `export const`) in an isolated VM context.
 * @param {string} filePath
 * @returns {Record<string, any>}
 */
function evalTsDataModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const stripped = source
    .replace(/^\s*import\s+type\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    .replace(/\bexport\s+const\s+([A-Za-z0-9_]+)\s*(?::\s*[A-Za-z0-9_<>[\]\s|]+)?\s*=/g, 'exports.$1 =')
    .replace(/\s+as\s+const\b/g, '')
  const sandbox = { exports: {} }
  vm.runInNewContext(stripped, sandbox, { filename: filePath })
  return sandbox.exports
}

/**
 * Recursively verifies that `actual` mirrors the exact key/array shape of `reference`
 * and that every string leaf is non-empty.
 * @param {unknown} actual
 * @param {unknown} reference
 * @param {string} keyPath
 */
function assertShapeAndNonEmptyStrings(actual, reference, keyPath) {
  if (typeof reference === 'string') {
    assert.equal(typeof actual, 'string', `${keyPath} must be a string`)
    assert.ok(/** @type {string} */ (actual).trim().length > 0, `${keyPath} must not be empty`)
    return
  }
  if (typeof reference === 'number' || typeof reference === 'boolean') {
    assert.equal(typeof actual, typeof reference, `${keyPath} type mismatch`)
    return
  }
  if (Array.isArray(reference)) {
    assert.ok(Array.isArray(actual), `${keyPath} must be an array`)
    assert.equal(actual.length, reference.length, `${keyPath} length must equal ${reference.length}`)
    for (let i = 0; i < reference.length; i++) {
      assertShapeAndNonEmptyStrings(actual[i], reference[i], `${keyPath}[${i}]`)
    }
    return
  }
  if (reference && typeof reference === 'object') {
    assert.ok(actual && typeof actual === 'object' && !Array.isArray(actual), `${keyPath} must be an object`)
    const refKeys = Object.keys(reference).sort()
    const actKeys = Object.keys(/** @type {Record<string, unknown>} */ (actual)).sort()
    assert.deepEqual(actKeys, refKeys, `${keyPath} keys mismatch`)
    for (const key of refKeys) {
      assertShapeAndNonEmptyStrings(
        /** @type {Record<string, unknown>} */ (actual)[key],
        /** @type {Record<string, unknown>} */ (reference)[key],
        `${keyPath}.${key}`,
      )
    }
  }
}

test('all 13 new locale & catalog files exist, stay <= 385 lines, use 100% LF, and have zero em/en-dashes', () => {
  assert.equal(NEW_LOCALES.length, 13)

  for (const locale of NEW_LOCALES) {
    const targetPaths = [
      path.join(WEB_I18N_DIR, 'locales', `${locale}.ts`),
      path.join(WEB_I18N_DIR, 'catalogs', `${locale}-a.ts`),
      path.join(WEB_I18N_DIR, 'catalogs', `${locale}-b.ts`),
    ]

    for (const fullPath of targetPaths) {
      const rel = path.relative(REPO_ROOT, fullPath).split(path.sep).join('/')
      assert.ok(fs.existsSync(fullPath), `Missing expected i18n file: ${rel}`)

      const raw = fs.readFileSync(fullPath)
      assert.ok(!raw.includes(0x0d), `${rel} must use 100% LF (found CR byte)`)

      const content = raw.toString('utf8')
      assert.ok(!DASH_PATTERN.test(content), `${rel} must contain zero em-dash or en-dash characters`)

      const lineCount = content.endsWith('\n') ? content.split('\n').length - 1 : content.split('\n').length
      assert.ok(
        lineCount <= MAX_LOCALE_FILE_LINES,
        `${rel} has ${lineCount} lines (exceeds ${MAX_LOCALE_FILE_LINES}-line limit)`,
      )
    }
  }
})

test('locales-meta.ts registers all 15 supported languages with RTL enabled for Arabic', () => {
  const metaSrc = fs.readFileSync(path.join(WEB_I18N_DIR, 'locales-meta.ts'), 'utf8')
  const entries = [
    ...metaSrc.matchAll(/\{\s*code:\s*'([^']+)'[\s\S]*?dir:\s*'(ltr|rtl)'\s*\}/g),
  ].map((m) => ({ code: m[1], dir: m[2] }))

  assert.equal(entries.length, 15, 'SUPPORTED_LOCALES must contain 15 languages')
  assert.deepEqual(
    entries.map((e) => e.code),
    ['en', 'vi', ...NEW_LOCALES],
    'SUPPORTED_LOCALES order and codes must match the 15 supported languages',
  )

  for (const entry of entries) {
    const expectedDir = entry.code === 'ar' ? 'rtl' : 'ltr'
    assert.equal(entry.dir, expectedDir, `Expected dir=${expectedDir} for locale ${entry.code}`)
  }
})

test('all 13 new dictionaries & split catalogs cover 5 platforms, 36 commands, 14 CLI, 7 SEO, 22 agents, 18 teams, 19 domains & 45 skills', () => {
  const kitStats = JSON.parse(fs.readFileSync(KIT_STATS_FILE, 'utf8'))
  const expectedCommands = kitStats.commands.map((/** @type {{ name: string }} */ c) => c.name).sort()
  const expectedDomains = kitStats.domains.map((/** @type {{ id: string }} */ d) => d.id).sort()
  const expectedAgents = fs
    .readdirSync(path.join(REPO_ROOT, 'agents'), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name.slice(0, -3))
    .sort()
  const teamsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'teams.ts'), 'utf8')
  const expectedTeams = [...teamsTs.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]).sort()
  const skillsTs = fs.readFileSync(path.join(WEB_DATA_DIR, 'skills.ts'), 'utf8')
  const expectedSkills = [...skillsTs.matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]).sort()

  assert.equal(EXPECTED_PLATFORMS.length, 5)
  assert.equal(expectedCommands.length, 36)
  assert.equal(EXPECTED_CLI_IDS.length, 14)
  assert.equal(EXPECTED_SEO_ROUTES.length, 7)
  assert.equal(expectedAgents.length, 22)
  assert.equal(expectedTeams.length, 18)
  assert.equal(expectedDomains.length, 19)
  assert.equal(expectedSkills.length, 45)

  const enDict = evalTsDataModule(path.join(WEB_I18N_DIR, 'en.ts')).en
  const viDict = evalTsDataModule(path.join(WEB_I18N_DIR, 'vi.ts')).vi
  assert.equal(enDict.locale, 'en')
  assert.equal(viDict.locale, 'vi')
  assertShapeAndNonEmptyStrings(viDict, enDict, 'vi')

  for (const locale of NEW_LOCALES) {
    const dict = evalTsDataModule(path.join(WEB_I18N_DIR, 'locales', `${locale}.ts`)).dictionary
    assert.ok(dict, `locales/${locale}.ts must export dictionary`)
    assert.equal(dict.locale, locale, `locales/${locale}.ts locale field must equal ${locale}`)
    assertShapeAndNonEmptyStrings(dict, enDict, `locales/${locale}`)

    const partA = evalTsDataModule(path.join(WEB_I18N_DIR, 'catalogs', `${locale}-a.ts`)).catalogPartA
    assert.ok(partA, `catalogs/${locale}-a.ts must export catalogPartA`)
    assert.equal(partA.locale, locale)

    assert.deepEqual(Object.keys(partA.platforms).sort(), EXPECTED_PLATFORMS, `${locale} platforms keys`)
    for (const id of EXPECTED_PLATFORMS) {
      assert.ok(partA.platforms[id].trim().length > 0, `${locale} platform ${id} summary empty`)
    }

    assert.deepEqual(Object.keys(partA.commands).sort(), expectedCommands, `${locale} commands keys`)
    for (const cmd of expectedCommands) {
      assert.ok(partA.commands[cmd].summary.trim().length > 0, `${locale} command ${cmd} summary empty`)
      assert.ok(partA.commands[cmd].nlExample.trim().length > 0, `${locale} command ${cmd} nlExample empty`)
    }

    assert.deepEqual(Object.keys(partA.cli).sort(), EXPECTED_CLI_IDS, `${locale} cli keys`)
    for (const cliId of EXPECTED_CLI_IDS) {
      assert.ok(partA.cli[cliId].trim().length > 0, `${locale} cli ${cliId} summary empty`)
    }

    assert.deepEqual(Object.keys(partA.seo).sort(), EXPECTED_SEO_ROUTES, `${locale} seo keys`)
    for (const routeId of EXPECTED_SEO_ROUTES) {
      assert.ok(partA.seo[routeId].title.trim().length > 0, `${locale} seo ${routeId} title empty`)
      assert.ok(partA.seo[routeId].description.trim().length > 0, `${locale} seo ${routeId} description empty`)
    }

    const partB = evalTsDataModule(path.join(WEB_I18N_DIR, 'catalogs', `${locale}-b.ts`)).catalogPartB
    assert.ok(partB, `catalogs/${locale}-b.ts must export catalogPartB`)
    assert.equal(partB.locale, locale)

    assert.deepEqual(Object.keys(partB.agents).sort(), expectedAgents, `${locale} agents keys`)
    for (const agentId of expectedAgents) {
      assert.ok(partB.agents[agentId].title.trim().length > 0, `${locale} agent ${agentId} title empty`)
      assert.ok(partB.agents[agentId].summary.trim().length > 0, `${locale} agent ${agentId} summary empty`)
    }

    assert.deepEqual(Object.keys(partB.teams).sort(), expectedTeams, `${locale} teams keys`)
    for (const teamId of expectedTeams) {
      assert.ok(partB.teams[teamId].trim().length > 0, `${locale} team ${teamId} summary empty`)
    }

    assert.deepEqual(Object.keys(partB.skillDomains).sort(), expectedDomains, `${locale} skillDomains keys`)
    for (const domainId of expectedDomains) {
      assert.ok(partB.skillDomains[domainId].trim().length > 0, `${locale} skillDomain ${domainId} empty`)
    }

    assert.deepEqual(Object.keys(partB.skills).sort(), expectedSkills, `${locale} skills keys`)
    for (const skillId of expectedSkills) {
      assert.ok(partB.skills[skillId].trim().length > 0, `${locale} skill ${skillId} summary empty`)
    }
  }
})
