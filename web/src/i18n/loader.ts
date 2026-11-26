import { EN_CATALOG_PACK, VI_CATALOG_PACK } from './catalogs/base'
import { en } from './en'
import type { CatalogLocalePack, Dictionary, Locale, PartialCatalogPack } from './types'
import { vi } from './vi'

export interface LoadedLocaleBundle {
  readonly locale: Locale
  readonly dictionary: Dictionary
  readonly catalog: CatalogLocalePack
}

const DICT_MODULES = import.meta.glob<{ readonly dictionary: Dictionary }>('./locales/*.ts')
const CATALOG_A_MODULES = import.meta.glob<{ readonly catalogPartA: PartialCatalogPack }>('./catalogs/*-a.ts')
const CATALOG_B_MODULES = import.meta.glob<{ readonly catalogPartB: PartialCatalogPack }>('./catalogs/*-b.ts')
const CATALOG_FULL_MODULES = import.meta.glob<{ readonly catalog: CatalogLocalePack }>([
  './catalogs/*.ts',
  '!./catalogs/base.ts',
  '!./catalogs/*-a.ts',
  '!./catalogs/*-b.ts',
])

const BUNDLE_CACHE = new Map<Locale, LoadedLocaleBundle>([
  ['en', { locale: 'en', dictionary: en, catalog: EN_CATALOG_PACK }],
  ['vi', { locale: 'vi', dictionary: vi, catalog: VI_CATALOG_PACK }],
])

const INFLIGHT_LOADS = new Map<Locale, Promise<LoadedLocaleBundle>>()

function mergeDefined<K extends string, V>(
  base: Readonly<Record<K, V>>,
  override?: Readonly<Partial<Record<K, V>>>,
): Readonly<Record<K, V>> {
  if (!override) {
    return base
  }
  const next: Record<K, V> = { ...base }
  for (const [key, val] of Object.entries(override) as Array<[K, V | undefined]>) {
    if (val !== undefined) {
      next[key] = val
    }
  }
  return next
}

function mergeCatalogPack(
  locale: Locale,
  parts: ReadonlyArray<PartialCatalogPack | undefined>,
): CatalogLocalePack {
  let platforms = EN_CATALOG_PACK.platforms
  let commands = EN_CATALOG_PACK.commands
  let agents = EN_CATALOG_PACK.agents
  let teams = EN_CATALOG_PACK.teams
  let skillDomains = EN_CATALOG_PACK.skillDomains
  let skills = EN_CATALOG_PACK.skills
  let cli = EN_CATALOG_PACK.cli
  let seo = EN_CATALOG_PACK.seo

  for (const part of parts) {
    if (!part) continue
    platforms = mergeDefined(platforms, part.platforms)
    commands = mergeDefined(commands, part.commands)
    agents = mergeDefined(agents, part.agents)
    teams = mergeDefined(teams, part.teams)
    skillDomains = mergeDefined(skillDomains, part.skillDomains)
    skills = mergeDefined(skills, part.skills)
    cli = mergeDefined(cli, part.cli)
    seo = mergeDefined(seo, part.seo)
  }

  return { locale, platforms, commands, agents, teams, skillDomains, skills, cli, seo }
}

export function getCachedLocaleBundle(locale: Locale): LoadedLocaleBundle | undefined {
  return BUNDLE_CACHE.get(locale)
}

export function getFallbackLocaleBundle(): LoadedLocaleBundle {
  return BUNDLE_CACHE.get('en') ?? { locale: 'en', dictionary: en, catalog: EN_CATALOG_PACK }
}

export async function loadLocaleBundle(locale: Locale): Promise<LoadedLocaleBundle> {
  const cached = BUNDLE_CACHE.get(locale)
  if (cached) {
    return cached
  }
  const inflight = INFLIGHT_LOADS.get(locale)
  if (inflight) {
    return inflight
  }

  const task = (async (): Promise<LoadedLocaleBundle> => {
    try {
      const dictLoader = DICT_MODULES[`./locales/${locale}.ts`]
      const fullLoader = CATALOG_FULL_MODULES[`./catalogs/${locale}.ts`]
      const partALoader = CATALOG_A_MODULES[`./catalogs/${locale}-a.ts`]
      const partBLoader = CATALOG_B_MODULES[`./catalogs/${locale}-b.ts`]

      const [dictMod, fullMod, partAMod, partBMod] = await Promise.all([
        dictLoader ? dictLoader() : Promise.resolve(undefined),
        fullLoader ? fullLoader() : Promise.resolve(undefined),
        partALoader ? partALoader() : Promise.resolve(undefined),
        partBLoader ? partBLoader() : Promise.resolve(undefined),
      ])

      const dictionary: Dictionary = dictMod?.dictionary ?? { ...en, locale }
      const catalog: CatalogLocalePack = mergeCatalogPack(locale, [
        partAMod?.catalogPartA,
        partBMod?.catalogPartB,
        fullMod?.catalog,
      ])

      const resolved: LoadedLocaleBundle = { locale, dictionary, catalog }
      BUNDLE_CACHE.set(locale, resolved)
      return resolved
    } catch {
      const fallback: LoadedLocaleBundle = {
        locale,
        dictionary: { ...en, locale },
        catalog: { ...EN_CATALOG_PACK, locale },
      }
      BUNDLE_CACHE.set(locale, fallback)
      return fallback
    } finally {
      INFLIGHT_LOADS.delete(locale)
    }
  })()

  INFLIGHT_LOADS.set(locale, task)
  return task
}
