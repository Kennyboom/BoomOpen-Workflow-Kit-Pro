import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import {
  ActionButton,
  CopyCommandBar,
  EmptyCatalogState,
  FilterPill,
  SearchField,
} from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import {
  ALL_SHOWCASE_SKILLS,
  CORE_SKILLS_SHOWCASE,
  FEATURED_LIBRARY_SKILLS,
  getSkillDomainLabel,
} from '../data/skills'
import { useLanguage } from '../i18n/context'
import type { SkillShowcaseItem } from '../types/ui-contract'

/**
 * Unified 1,462-Skill Explorer with a desktop 2-column sidebar layout
 * and a compact progressive-lookup breakdown at the bottom.
 */
type SkillTierFilter = 'all' | 'core' | 'library'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const VALID_DOMAIN_IDS = new Set(KIT_STATS.domains.map((d) => d.id))

function isSkillTier(value: string | null): value is SkillTierFilter {
  return value === 'all' || value === 'core' || value === 'library'
}

function SkillCard({ skill }: { readonly skill: SkillShowcaseItem }) {
  const { pick } = useLanguage()
  const isCore = skill.tier === 'core'
  const skillPath = isCore ? `skills/${skill.id}/SKILL.md` : `skills_library/${skill.id}/SKILL.md`

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-hairline bg-card p-5 transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-sm font-semibold text-ink">{skill.id}</code>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle">
            {isCore ? 'core' : 'library'}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted">{pick(skill.summary)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline pt-3 font-mono text-xs text-subtle">
        <span className="truncate">{skillPath}</span>
        <span className="shrink-0">{pick(getSkillDomainLabel(skill.domainId))}</span>
      </div>
    </article>
  )
}

function DomainSidebar({
  activeDomain,
  onSelectDomain,
}: {
  readonly activeDomain: string
  readonly onSelectDomain: (domainId: string) => void
}) {
  const { locale, t, pick } = useLanguage()
  const copy = t.skillsPage
  const allDomainsLabel =
    locale === 'vi' ? `Tất cả ${formatCount(KIT_STATS.skills)}` : `All ${formatCount(KIT_STATS.skills)}`

  return (
    <aside aria-label={copy.domainsSectionTitle}>
      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        <button
          type="button"
          aria-pressed={activeDomain === 'all'}
          onClick={() => onSelectDomain('all')}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-colors cursor-pointer tabular-nums',
            FOCUS_RING,
            activeDomain === 'all'
              ? 'border-primary bg-primary font-semibold text-primary-ink'
              : 'border-hairline bg-card text-muted hover:text-ink',
          )}
        >
          <span>{allDomainsLabel}</span>
        </button>
        {KIT_STATS.domains.map((domain) => {
          const selected = activeDomain === domain.id
          return (
            <button
              key={domain.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectDomain(selected ? 'all' : domain.id)}
              className={clsx(
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs transition-colors cursor-pointer tabular-nums',
                FOCUS_RING,
                selected
                  ? 'border-primary bg-primary font-semibold text-primary-ink'
                  : 'border-hairline bg-card text-muted hover:text-ink',
              )}
            >
              <span>{pick(getSkillDomainLabel(domain.id))}</span>
              <span className={clsx('font-mono', selected ? 'text-primary-ink' : 'text-subtle')}>
                {formatCount(domain.count)}
              </span>
            </button>
          )
        })}
      </div>

      <nav aria-label={copy.domainsSectionTitle} className="hidden space-y-0.5 lg:sticky lg:top-24 lg:block">
        <div className="mb-2 px-3 font-mono text-xs tracking-wider text-subtle uppercase">
          {copy.domainsSectionTitle}
        </div>
        <button
          type="button"
          aria-pressed={activeDomain === 'all'}
          onClick={() => onSelectDomain('all')}
          className={clsx(
            'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
            FOCUS_RING,
            activeDomain === 'all'
              ? 'bg-white/[0.08] font-medium text-ink'
              : 'text-muted hover:bg-white/[0.03] hover:text-ink',
          )}
        >
          <span>{locale === 'vi' ? 'Tất cả miền' : 'All Domains'}</span>
          <span className="font-mono text-xs text-subtle tabular-nums">{formatCount(KIT_STATS.skills)}</span>
        </button>

        {KIT_STATS.domains.map((domain) => {
          const selected = activeDomain === domain.id
          return (
            <button
              key={domain.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelectDomain(selected ? 'all' : domain.id)}
              className={clsx(
                'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                selected
                  ? 'bg-white/[0.08] font-medium text-ink'
                  : 'text-muted hover:bg-white/[0.03] hover:text-ink',
              )}
            >
              <span className="truncate">{pick(getSkillDomainLabel(domain.id))}</span>
              <span className="shrink-0 font-mono text-xs text-subtle tabular-nums">
                {formatCount(domain.count)}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export function SkillsPage() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? searchParams.get('skill') ?? ''
  const rawTier = searchParams.get('tier')
  const tier: SkillTierFilter = isSkillTier(rawTier) ? rawTier : 'all'
  const rawDomain = searchParams.get('domain')
  const activeDomain = rawDomain && VALID_DOMAIN_IDS.has(rawDomain) ? rawDomain : 'all'

  const updateSearchParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (key === 'q') next.delete('skill')
    if (value && value !== 'all') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const setQuery = (nextQuery: string) => updateSearchParam('q', nextQuery.trim() ? nextQuery : null)
  const setTier = (nextTier: SkillTierFilter) => updateSearchParam('tier', nextTier)
  const setActiveDomain = (nextDomain: string) => updateSearchParam('domain', nextDomain)

  const copy = t.skillsPage

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ALL_SHOWCASE_SKILLS.filter((skill) => {
      if (tier !== 'all' && skill.tier !== tier) return false
      if (activeDomain !== 'all' && skill.domainId !== activeDomain) return false
      if (!normalized) return true
      const domainLabel = getSkillDomainLabel(skill.domainId)
      const haystack = `${skill.id} ${skill.domainId} ${domainLabel.en} ${domainLabel.vi} ${skill.summary.en} ${skill.summary.vi}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [query, tier, activeDomain])

  const hasFilters = query.trim().length > 0 || tier !== 'all' || activeDomain !== 'all'
  const resetFilters = () => setSearchParams(new URLSearchParams(), { replace: true })

  const inlineMetrics =
    locale === 'vi'
      ? `${formatCount(KIT_STATS.skills)} kỹ năng lập chỉ mục · ${formatCount(KIT_STATS.coreSkills)} Core · ${formatCount(KIT_STATS.librarySkills)} Library · ${formatCount(KIT_STATS.domains.length)} miền chuyên môn`
      : `${formatCount(KIT_STATS.skills)} Indexed · ${formatCount(KIT_STATS.coreSkills)} Core · ${formatCount(KIT_STATS.librarySkills)} Library · ${formatCount(KIT_STATS.domains.length)} Domains`

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[75rem] space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <SEO routeId="skills" />

      <header className="space-y-3.5 border-b border-hairline pb-8">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{copy.eyebrow}</p>
        <h1 className="text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink">
          {copy.title}
        </h1>
        <p className="max-w-[58ch] text-base leading-relaxed text-muted">{copy.subtitle}</p>
        <p className="pt-1 font-mono text-xs text-subtle tabular-nums">{inlineMetrics}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-start">
        <DomainSidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

        <div className="min-w-0 space-y-10">
          <section aria-label={copy.featuredSectionTitle} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <SearchField
                    id="skills-vault-search"
                    label={copy.searchLabel}
                    value={query}
                    onChange={setQuery}
                    placeholder={copy.searchPlaceholder}
                    clearLabel={t.common.clearSearch}
                    resultCountLabel={`${filteredSkills.length} / ${ALL_SHOWCASE_SKILLS.length} ${t.common.resultsCount}`}
                  />
                </div>
                {hasFilters && (
                  <ActionButton variant="ghost" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={resetFilters}>
                    {copy.resetCta}
                  </ActionButton>
                )}
              </div>

              <div role="group" aria-label={copy.tierFilterAria} className="flex flex-wrap gap-2">
                <FilterPill label={copy.tiers.all} count={ALL_SHOWCASE_SKILLS.length} active={tier === 'all'} onSelect={() => setTier('all')} />
                <FilterPill label={copy.tiers.core} count={CORE_SKILLS_SHOWCASE.length} active={tier === 'core'} onSelect={() => setTier('core')} />
                <FilterPill label={copy.tiers.library} count={FEATURED_LIBRARY_SKILLS.length} active={tier === 'library'} onSelect={() => setTier('library')} />
              </div>
            </div>

            {filteredSkills.length === 0 ? (
              <EmptyCatalogState
                title={copy.emptyTitle}
                description={query.trim() ? `${copy.emptyBody} ("${query.trim()}")` : copy.emptyBody}
                resetLabel={copy.resetCta}
                onReset={resetFilters}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredSkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="progressive-lookup-heading" className="space-y-5 border-t border-hairline pt-8">
            <div className="space-y-1.5">
              <p className="font-mono text-xs tracking-wider text-subtle uppercase">{copy.progressiveLookup.badge}</p>
              <h2 id="progressive-lookup-heading" className="text-xl font-semibold tracking-tight text-ink">
                {copy.progressiveLookup.title}
              </h2>
              <p className="max-w-[60ch] text-sm leading-relaxed text-muted">{copy.progressiveLookup.description}</p>
            </div>

            <div className="grid divide-y divide-hairline rounded-xl border border-hairline bg-card md:grid-cols-3 md:divide-x md:divide-y-0">
              {copy.progressiveLookup.steps.map((hop) => (
                <div key={hop.step} className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-subtle tabular-nums">
                    <span>{hop.step}</span>
                    <code className="truncate rounded bg-white/[0.04] px-1.5 py-0.5 text-ink">{hop.code}</code>
                  </div>
                  <h3 className="text-sm font-semibold text-ink">{hop.title}</h3>
                  <p className="text-xs leading-relaxed text-muted">{hop.summary}</p>
                </div>
              ))}
            </div>

            <CopyCommandBar
              command="node cli/install.js doctor"
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
              compact
            />
          </section>
        </div>
      </div>
    </motion.div>
  )
}
