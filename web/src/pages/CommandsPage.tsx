import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { CommandRowCard } from '../components/catalogs/CommandRowCard'
import { SEO } from '../components/seo/SEO'
import {
  ActionButton,
  EmptyCatalogState,
  FilterPill,
  SearchField,
} from '../components/ui/Primitives'
import { COMMAND_CATEGORIES, COMMANDS_CATALOG } from '../data/commands'
import { formatCount, KIT_STATS, TEAM_COMMANDS } from '../data/kitStats'
import { useLanguage } from '../i18n/context'
import type { CommandFilterKey } from '../i18n/types'

/**
 * Scannable 36-command directory with URL-synced search and category filters.
 */
const FILTER_KEYS: readonly CommandFilterKey[] = ['all', ...COMMAND_CATEGORIES]

function isCommandFilterKey(value: string | null): value is CommandFilterKey {
  return value !== null && (FILTER_KEYS as readonly string[]).includes(value)
}

export function CommandsPage() {
  const { t, locale } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? searchParams.get('cmd') ?? ''
  const rawCategory = searchParams.get('category') ?? searchParams.get('cat')
  const activeCategory: CommandFilterKey = isCommandFilterKey(rawCategory) ? rawCategory : 'all'

  const setQuery = (nextQuery: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete('cmd')
    if (nextQuery.trim()) {
      next.set('q', nextQuery)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  const setActiveCategory = (nextCat: CommandFilterKey) => {
    const next = new URLSearchParams(searchParams)
    next.delete('cat')
    if (nextCat === 'all') {
      next.delete('category')
    } else {
      next.set('category', nextCat)
    }
    setSearchParams(next, { replace: true })
  }

  const categoryCounts = useMemo<Readonly<Record<CommandFilterKey, number>>>(() => {
    const counts: Record<CommandFilterKey, number> = {
      all: COMMANDS_CATALOG.length,
      orchestration: 0,
      engineering: 0,
      'research-design': 0,
      'quality-security': 0,
      'session-ops': 0,
    }
    for (const command of COMMANDS_CATALOG) {
      counts[command.category] += 1
    }
    return counts
  }, [])

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return COMMANDS_CATALOG.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false
      }
      if (!normalizedQuery) {
        return true
      }
      const categoryLabel = t.commandsPage.categories[item.category].toLowerCase()
      const variantTokens = item.variants.flatMap((variant) => [
        variant.toLowerCase(),
        `:${variant.toLowerCase()}`,
        `${item.slash.toLowerCase()}:${variant.toLowerCase()}`,
      ])
      const searchableFields = [
        item.name.toLowerCase(),
        item.slash.toLowerCase(),
        item.category.toLowerCase(),
        categoryLabel,
        item.summary.en.toLowerCase(),
        item.summary.vi.toLowerCase(),
        item.nlExamples.en.toLowerCase(),
        item.nlExamples.vi.toLowerCase(),
        ...variantTokens,
      ]
      return searchableFields.some((field) => field.includes(normalizedQuery))
    })
  }, [activeCategory, query, t.commandsPage.categories])

  const hasActiveFilters = query.trim().length > 0 || activeCategory !== 'all'

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const resultsSummary = `${formatCount(filteredCommands.length)} / ${formatCount(COMMANDS_CATALOG.length)} ${t.common.resultsCount}`
  const inlineMetrics =
    locale === 'vi'
      ? `${formatCount(KIT_STATS.commands.length)} lệnh nền tảng · ${formatCount(KIT_STATS.commandFiles)} đặc tả (${formatCount(KIT_STATS.commandWorkflowFiles)} workflow + ${formatCount(KIT_STATS.commandRefFiles)} _ref) · ${formatCount(TEAM_COMMANDS.length)} lệnh :team · ${formatCount(KIT_STATS.i18nLocales)} ngôn ngữ`
      : `${formatCount(KIT_STATS.commands.length)} Base Commands · ${formatCount(KIT_STATS.commandFiles)} Specs (${formatCount(KIT_STATS.commandWorkflowFiles)} workflows + ${formatCount(KIT_STATS.commandRefFiles)} _ref) · ${formatCount(TEAM_COMMANDS.length)} :team · ${formatCount(KIT_STATS.i18nLocales)} Locales`

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[75rem] space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <SEO routeId="commands" />

      <header className="space-y-3.5 border-b border-hairline pb-8">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">
          {t.commandsPage.eyebrow}
        </p>
        <h1 className="text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink">
          {t.commandsPage.title}
        </h1>
        <p className="max-w-[58ch] text-base leading-relaxed text-muted">
          {t.commandsPage.subtitle}
        </p>
        <p className="pt-1 font-mono text-xs text-subtle tabular-nums">
          {inlineMetrics}
        </p>
      </header>

      <section aria-label={t.commandsPage.title} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <SearchField
                id="commands-catalog-search"
                label={t.commandsPage.searchLabel}
                value={query}
                onChange={setQuery}
                placeholder={t.commandsPage.searchPlaceholder}
                clearLabel={t.common.clearSearch}
                resultCountLabel={resultsSummary}
              />
            </div>

            {hasActiveFilters && (
              <ActionButton
                variant="ghost"
                icon={<RotateCcw aria-hidden="true" className="size-4" />}
                onClick={handleResetFilters}
              >
                {t.commandsPage.resetCta}
              </ActionButton>
            )}
          </div>

          <div
            id="commands-category-filter-bar"
            role="group"
            aria-label={t.commandsPage.categoryFilterAria}
            className="flex flex-wrap gap-2"
          >
            {FILTER_KEYS.map((categoryKey) => (
              <FilterPill
                key={categoryKey}
                label={t.commandsPage.categories[categoryKey]}
                count={categoryCounts[categoryKey]}
                active={activeCategory === categoryKey}
                onSelect={() => setActiveCategory(categoryKey)}
              />
            ))}
          </div>
        </div>

        {filteredCommands.length === 0 ? (
          <EmptyCatalogState
            title={t.commandsPage.emptyTitle}
            description={t.commandsPage.emptyBody}
            resetLabel={t.commandsPage.resetCta}
            onReset={handleResetFilters}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCommands.map((item) => (
              <CommandRowCard
                key={item.name}
                item={item}
                categoryLabel={t.commandsPage.categories[item.category]}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  )
}
