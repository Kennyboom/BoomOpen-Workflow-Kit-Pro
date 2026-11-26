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
 * Expansive 1440px 36-command showcase with URL-synced search and category filters.
 */
const FILTER_KEYS: readonly CommandFilterKey[] = ['all', ...COMMAND_CATEGORIES]

function isCommandFilterKey(value: string | null): value is CommandFilterKey {
  return value !== null && (FILTER_KEYS as readonly string[]).includes(value)
}

function CommandsHeroHeader() {
  const { locale, t } = useLanguage()
  const stats = [
    {
      value: formatCount(KIT_STATS.commands.length),
      label: locale === 'vi' ? 'Lệnh nền tảng' : 'Slash Commands',
    },
    {
      value: formatCount(KIT_STATS.commandFiles),
      label: locale === 'vi' ? 'Tệp đặc tả' : 'Workflow Specs',
    },
    {
      value: formatCount(TEAM_COMMANDS.length),
      label: locale === 'vi' ? 'Biến thể :team' : ':team Variants',
    },
  ]

  return (
    <header className="border-b border-indigo-200/[0.12] pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{t.commandsPage.eyebrow}</span>
          </div>
          <h1 className="hero-display-gradient pb-1 text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.16] font-bold tracking-[-0.036em] text-ink">
            {t.commandsPage.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">
            {t.commandsPage.subtitle}
          </p>
        </div>

        <dl className="specular-surface grid grid-cols-3 gap-6 rounded-2xl border border-indigo-200/[0.14] px-6 py-5 transition-colors duration-150 hover:border-sky-300/30 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <dd className="text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">
                {stat.value}
              </dd>
              <dt className="font-mono text-xs tracking-wider text-muted uppercase">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

export function CommandsPage() {
  const { t } = useLanguage()
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

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
    >
      <SEO routeId="commands" />
      <CommandsHeroHeader />

      <section aria-label={t.commandsPage.title}>
        <div className="my-8 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full lg:w-[460px]">
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
                variant="secondary"
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
            className="flex flex-wrap gap-2.5"
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
          <div className="grid gap-6 md:grid-cols-2 lg:gap-7">
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
