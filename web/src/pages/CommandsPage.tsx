import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Diamond, FileCode2, Globe2, RotateCcw, Terminal } from 'lucide-react'
import { CommandRowCard } from '../components/catalogs/CommandRowCard'
import { SEO } from '../components/seo/SEO'
import {
  ActionButton,
  EmptyCatalogState,
  FilterPill,
  SearchField,
  StatusBadge,
  SurfaceCard,
} from '../components/ui/Primitives'
import { COMMAND_CATEGORIES, COMMANDS_CATALOG } from '../data/commands'
import { formatCount, KIT_STATS, TEAM_COMMANDS } from '../data/kitStats'
import { useLanguage } from '../i18n/context'
import type { CommandFilterKey } from '../i18n/types'

/**
 * Interactive 36-command & 93-file catalog built around our mission of deterministic
 * contract-first workflows, adversarial review, and 1,462 indexed skills.
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

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
    >
      <SEO routeId="commands" />

      <header className="space-y-5 border-b border-hairline pb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge tone="amber">
            <Terminal aria-hidden="true" className="size-3.5" />
            <span className="tracking-wider uppercase">{t.commandsPage.eyebrow}</span>
          </StatusBadge>
          <StatusBadge tone="emerald">
            <FileCode2 aria-hidden="true" className="size-3.5" />
            <span>{t.commandsPage.workflowFilesBadge}</span>
          </StatusBadge>
        </div>

        <h1 className="font-display text-[clamp(2rem,2.4vw+1.25rem,3.1rem)] leading-tight font-semibold tracking-tight text-ink">
          {t.commandsPage.title}
        </h1>

        <p className="max-w-prose text-[clamp(0.975rem,0.25vw+0.92rem,1.125rem)] leading-relaxed font-normal text-muted">
          {t.commandsPage.subtitle}
        </p>

        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <SurfaceCard variant="subtle" className="space-y-1 p-4">
            <div className="font-mono text-[clamp(1.35rem,0.6vw+1.15rem,1.75rem)] leading-tight font-semibold text-primary tabular-nums">
              {formatCount(KIT_STATS.commands.length)}
            </div>
            <div className="text-[clamp(0.8rem,0.12vw+0.77rem,0.875rem)] leading-snug font-normal text-muted">
              {locale === 'vi' ? 'Nhóm lệnh /cmd nền tảng' : 'Base /cmd workflow families'}
            </div>
          </SurfaceCard>

          <SurfaceCard variant="subtle" className="space-y-1 p-4">
            <div className="font-mono text-[clamp(1.35rem,0.6vw+1.15rem,1.75rem)] leading-tight font-semibold text-ink tabular-nums">
              {`${formatCount(KIT_STATS.commandWorkflowFiles)} + ${formatCount(KIT_STATS.commandRefFiles)} = ${formatCount(KIT_STATS.commandFiles)}`}
            </div>
            <div className="text-[clamp(0.8rem,0.12vw+0.77rem,0.875rem)] leading-snug font-normal text-muted">
              {t.commandsPage.workflowFilesBadge}
            </div>
          </SurfaceCard>

          <SurfaceCard variant="subtle" className="space-y-1 p-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-[clamp(1.35rem,0.6vw+1.15rem,1.75rem)] leading-tight font-semibold text-accent tabular-nums">
              <Diamond aria-hidden="true" className="size-4 text-primary" />
              <span>{formatCount(TEAM_COMMANDS.length)}</span>
            </div>
            <div className="text-[clamp(0.8rem,0.12vw+0.77rem,0.875rem)] leading-snug font-normal text-muted">
              {t.commandsPage.teamVariantBadge}
            </div>
          </SurfaceCard>

          <SurfaceCard variant="subtle" className="space-y-1 p-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-[clamp(1.35rem,0.6vw+1.15rem,1.75rem)] leading-tight font-semibold text-cobalt tabular-nums">
              <Globe2 aria-hidden="true" className="size-4" />
              <span>{formatCount(KIT_STATS.i18nLocales)}</span>
            </div>
            <div className="text-[clamp(0.8rem,0.12vw+0.77rem,0.875rem)] leading-snug font-normal text-muted">
              {locale === 'vi'
                ? 'Ngôn ngữ định tuyến ý định tự nhiên'
                : 'Supported natural-language locales'}
            </div>
          </SurfaceCard>
        </div>
      </header>

      <section aria-labelledby="commands-directory-heading" className="space-y-6">
        <SurfaceCard variant="default" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="commands-directory-heading"
              className="font-display text-[clamp(1.25rem,0.5vw+1.1rem,1.55rem)] leading-tight font-semibold text-ink"
            >
              {locale === 'vi' ? 'Danh mục Lệnh & Bộ lọc Quy trình' : 'Interactive Command Directory'}
            </h2>
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

          <SearchField
            id="commands-catalog-search"
            label={t.commandsPage.searchLabel}
            value={query}
            onChange={setQuery}
            placeholder={t.commandsPage.searchPlaceholder}
            clearLabel={t.common.clearSearch}
            resultCountLabel={resultsSummary}
          />

          <div
            id="commands-category-filter-bar"
            role="group"
            aria-label={t.commandsPage.categoryFilterAria}
            className="flex flex-wrap gap-2"
          >
            {FILTER_KEYS.map((categoryKey) => (
              <div key={categoryKey} id={`command-filter-${categoryKey}`}>
                <FilterPill
                  label={t.commandsPage.categories[categoryKey]}
                  count={categoryCounts[categoryKey]}
                  active={activeCategory === categoryKey}
                  onSelect={() => setActiveCategory(categoryKey)}
                />
              </div>
            ))}
          </div>
        </SurfaceCard>

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
