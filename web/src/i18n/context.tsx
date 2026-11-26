/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getRouteSeoCopy } from '../data/seoRoutes'
import { getSkillDomainLabel } from '../data/skills'
import type {
  AgentSpec,
  BilingualText,
  CliCommandSpec,
  CommandCatalogItem,
  PageSeoEntry,
  PlatformSpec,
  SkillShowcaseItem,
  TeamSpec,
} from '../types/ui-contract'
import {
  getCachedLocaleBundle,
  getFallbackLocaleBundle,
  loadLocaleBundle,
  type LoadedLocaleBundle,
} from './loader'
import {
  getLocaleMeta,
  isSupportedLocale,
  matchNavigatorLocale,
  resolveSupportedLocale,
  type LocaleMeta,
} from './locales-meta'
import type { CatalogLocalePack, Dictionary, Locale, TrailerMediaAsset } from './types'

export const LOCALE_STORAGE_KEY = 'boomopen-locale'
const DEFAULT_LOCALE: Locale = 'en'

export interface LanguageContextValue {
  readonly locale: Locale
  readonly localeMeta: LocaleMeta
  readonly isLoadingLocale: boolean
  readonly setLocale: (next: Locale) => void
  readonly toggleLocale: () => void
  readonly t: Dictionary
  readonly catalog: CatalogLocalePack
  readonly platformSummary: (p: PlatformSpec) => string
  readonly commandCopy: (c: CommandCatalogItem) => { readonly summary: string; readonly nlExample: string }
  readonly agentCopy: (a: AgentSpec) => { readonly title: string; readonly summary: string }
  readonly teamSummary: (team: TeamSpec) => string
  readonly skillSummary: (skill: SkillShowcaseItem) => string
  readonly skillDomainLabel: (domainId: string) => string
  readonly cliSummary: (cmd: CliCommandSpec) => string
  readonly seoCopy: (entry: PageSeoEntry) => { readonly title: string; readonly description: string }
  readonly pick: (b: BilingualText) => string
}

function detectNavigatorLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  try {
    const candidates =
      window.navigator?.languages && window.navigator.languages.length > 0
        ? window.navigator.languages
        : window.navigator?.language
          ? [window.navigator.language]
          : []
    return matchNavigatorLocale(candidates)
  } catch {
    return DEFAULT_LOCALE
  }
}

export function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  try {
    const queryLang = new URLSearchParams(window.location.search).get('lang')
    const resolvedQuery = resolveSupportedLocale(queryLang)
    if (resolvedQuery) {
      return resolvedQuery
    }
  } catch {
    // Ignore malformed query string environments.
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    const resolvedStored = resolveSupportedLocale(stored)
    if (resolvedStored) {
      return resolvedStored
    }
  } catch {
    // Storage access can throw in restricted private browsing or sandboxed iframes.
  }
  return detectNavigatorLocale()
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export interface LanguageProviderProps {
  readonly children: ReactNode
  readonly initialLocale?: Locale
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? resolveInitialLocale())
  const [asyncBundle, setAsyncBundle] = useState<LoadedLocaleBundle>(() => {
    const start = initialLocale ?? resolveInitialLocale()
    return getCachedLocaleBundle(start) ?? getFallbackLocaleBundle()
  })

  const localeMeta = useMemo(() => getLocaleMeta(locale), [locale])
  const cachedBundle = getCachedLocaleBundle(locale)
  const activeBundle =
    cachedBundle ?? (asyncBundle.locale === locale ? asyncBundle : getFallbackLocaleBundle())
  const isLoadingLocale = cachedBundle === undefined && asyncBundle.locale !== locale

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = localeMeta.dir
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
      }
    } catch {
      // Keep active in-memory locale when localStorage writes are blocked.
    }

    if (getCachedLocaleBundle(locale)) {
      return
    }
    let cancelled = false
    void loadLocaleBundle(locale).then((bundle) => {
      if (!cancelled) {
        setAsyncBundle(bundle)
      }
    })
    return () => {
      cancelled = true
    }
  }, [locale, localeMeta.dir])

  const setLocale = useCallback((next: Locale) => {
    if (isSupportedLocale(next)) {
      setLocaleState(next)
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'en' ? 'vi' : 'en'))
  }, [])

  const { dictionary: t, catalog } = activeBundle

  const pick = useCallback(
    (bilingual: BilingualText): string => (locale === 'vi' ? bilingual.vi : bilingual.en),
    [locale],
  )

  const platformSummary = useCallback(
    (p: PlatformSpec): string => catalog.platforms[p.id] ?? pick(p.summary),
    [catalog, pick],
  )

  const commandCopy = useCallback(
    (c: CommandCatalogItem): { readonly summary: string; readonly nlExample: string } =>
      catalog.commands[c.name] ?? { summary: pick(c.summary), nlExample: pick(c.nlExamples) },
    [catalog, pick],
  )

  const agentCopy = useCallback(
    (a: AgentSpec): { readonly title: string; readonly summary: string } =>
      catalog.agents[a.id] ?? { title: pick(a.title), summary: pick(a.summary) },
    [catalog, pick],
  )

  const teamSummary = useCallback(
    (team: TeamSpec): string => catalog.teams[team.id] ?? pick(team.summary),
    [catalog, pick],
  )

  const skillSummary = useCallback(
    (skill: SkillShowcaseItem): string => catalog.skills[skill.id] ?? pick(skill.summary),
    [catalog, pick],
  )

  const skillDomainLabel = useCallback(
    (domainId: string): string =>
      catalog.skillDomains[domainId] ?? pick(getSkillDomainLabel(domainId)),
    [catalog, pick],
  )

  const cliSummary = useCallback(
    (cmd: CliCommandSpec): string => catalog.cli[cmd.id] ?? pick(cmd.summary),
    [catalog, pick],
  )

  const seoCopy = useCallback(
    (entry: PageSeoEntry): { readonly title: string; readonly description: string } =>
      getRouteSeoCopy(entry, locale, catalog.seo),
    [catalog, locale],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      localeMeta,
      isLoadingLocale,
      setLocale,
      toggleLocale,
      t,
      catalog,
      platformSummary,
      commandCopy,
      agentCopy,
      teamSummary,
      skillSummary,
      skillDomainLabel,
      cliSummary,
      seoCopy,
      pick,
    }),
    [
      locale,
      localeMeta,
      isLoadingLocale,
      setLocale,
      toggleLocale,
      t,
      catalog,
      platformSummary,
      commandCopy,
      agentCopy,
      teamSummary,
      skillSummary,
      skillDomainLabel,
      cliSummary,
      seoCopy,
      pick,
    ],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (context === null) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export type { BilingualText, CatalogLocalePack, Dictionary, Locale, LocaleMeta, TrailerMediaAsset }
