import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import { ActionButton, CopyCommandBar, EmptyCatalogState, FilterPill, SearchField } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { ALL_SHOWCASE_SKILLS, CORE_SKILLS_SHOWCASE, FEATURED_LIBRARY_SKILLS, getSkillDomainLabel } from '../data/skills'
import { useLanguage } from '../i18n/context'
import type { SkillShowcaseItem } from '../types/ui-contract'

/**
 * Widescreen 1440px Knowledge Vault Explorer for 1,462 indexed skills across 19 domains.
 */
type SkillTierFilter = 'all' | 'core' | 'library'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const VALID_DOMAIN_IDS = new Set(KIT_STATS.domains.map((d) => d.id))

function isSkillTier(value: string | null): value is SkillTierFilter {
  return value === 'all' || value === 'core' || value === 'library'
}

function SkillsHeroHeader() {
  const { locale, t } = useLanguage()
  const copy = t.skillsPage
  const stats = [
    { value: formatCount(KIT_STATS.skills), label: locale === 'vi' ? 'Tổng kỹ năng' : 'Indexed Skills' },
    { value: formatCount(KIT_STATS.coreSkills), label: locale === 'vi' ? 'Cốt lõi' : 'Core Skills' },
    { value: formatCount(KIT_STATS.domains.length), label: locale === 'vi' ? 'Lĩnh vực' : 'Domains' },
  ]

  return (
    <header className="border-b border-indigo-200/[0.12] pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{copy.eyebrow}</span>
          </div>
          <h1 className="hero-display-gradient pb-1 text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.16] font-bold tracking-[-0.036em] text-ink">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">{copy.subtitle}</p>
        </div>

        <dl className="specular-surface grid grid-cols-3 gap-6 rounded-2xl border border-indigo-200/[0.14] px-6 py-5 transition-colors duration-150 hover:border-sky-300/30 sm:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <dd className="text-3xl font-bold tracking-tight text-ink tabular-nums sm:text-4xl">{stat.value}</dd>
              <dt className="font-mono text-xs tracking-wider text-muted uppercase">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  )
}

function SkillCard({ skill }: { readonly skill: SkillShowcaseItem }) {
  const { pick } = useLanguage()
  const isCore = skill.tier === 'core'
  const skillPath = isCore ? `skills/${skill.id}/SKILL.md` : `skills_library/${skill.id}/SKILL.md`

  return (
    <article className="specular-surface flex h-full flex-col justify-between rounded-3xl border border-indigo-200/[0.14] p-7 transition-colors duration-150 motion-reduce:transition-none hover:border-sky-300/30">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <code className="font-mono text-xl font-bold tracking-tight text-ink">{skill.id}</code>
          <span
            className={clsx(
              'shrink-0 rounded-full border px-3 py-1 font-mono text-xs font-medium',
              isCore
                ? 'border-sky-400/30 bg-sky-400/12 text-sky-200'
                : 'border-indigo-200/[0.14] bg-white/[0.05] text-slate-300',
            )}
          >
            {isCore ? 'core' : 'library'}
          </span>
        </div>
        <p className="mt-3.5 text-base leading-relaxed text-muted">{pick(skill.summary)}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t border-indigo-200/[0.12] pt-4">
        <code className="max-w-full truncate rounded-lg border border-indigo-200/[0.15] bg-white/[0.05] px-3 py-1.5 font-mono text-xs text-sky-200">
          {skillPath}
        </code>
        <span className="shrink-0 rounded-md border border-indigo-200/[0.14] bg-white/[0.05] px-2.5 py-1 font-mono text-xs text-slate-300">
          {pick(getSkillDomainLabel(skill.domainId))}
        </span>
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
  const allDomainsLabel = locale === 'vi' ? `Tất cả ${formatCount(KIT_STATS.skills)}` : `All ${formatCount(KIT_STATS.skills)}`

  return (
    <aside aria-label={copy.domainsSectionTitle}>
      <div className="flex gap-2.5 overflow-x-auto pb-2 lg:hidden">
        <button
          type="button"
          aria-pressed={activeDomain === 'all'}
          onClick={() => onSelectDomain('all')}
          className={clsx(
            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors cursor-pointer tabular-nums',
            FOCUS_RING,
            activeDomain === 'all'
              ? 'border-primary bg-primary font-semibold text-primary-ink'
              : 'border-indigo-200/[0.14] bg-[#070B19]/85 text-slate-300 hover:border-sky-300/30 hover:text-white',
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
                'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors cursor-pointer tabular-nums',
                FOCUS_RING,
                selected
                  ? 'border-primary bg-primary font-semibold text-primary-ink'
                  : 'border-indigo-200/[0.14] bg-[#070B19]/85 text-slate-300 hover:border-sky-300/30 hover:text-white',
              )}
            >
              <span>{pick(getSkillDomainLabel(domain.id))}</span>
              <span className={clsx('font-mono text-xs', selected ? 'text-primary-ink' : 'text-subtle')}>
                {formatCount(domain.count)}
              </span>
            </button>
          )
        })}
      </div>

      <nav
        aria-label={copy.domainsSectionTitle}
        className="specular-surface hidden space-y-1 rounded-3xl border border-indigo-200/[0.14] p-4 lg:sticky lg:top-24 lg:block"
      >
        <div className="mb-3 px-3 font-mono text-xs tracking-wider text-subtle uppercase">{copy.domainsSectionTitle}</div>
        <button
          type="button"
          aria-pressed={activeDomain === 'all'}
          onClick={() => onSelectDomain('all')}
          className={clsx(
            'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
            FOCUS_RING,
            activeDomain === 'all'
              ? 'border-sky-400/35 bg-sky-400/12 font-semibold text-white'
              : 'border-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white',
          )}
        >
          <span>{locale === 'vi' ? 'Tất cả lĩnh vực' : 'All Domains'}</span>
          <span className="shrink-0 rounded-md border border-indigo-200/[0.14] bg-white/[0.05] px-2 py-0.5 font-mono text-xs text-slate-300 tabular-nums">
            {formatCount(KIT_STATS.skills)}
          </span>
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
                'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-[15px] transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                selected
                  ? 'border-sky-400/35 bg-sky-400/12 font-semibold text-white'
                  : 'border-transparent text-slate-300 hover:bg-white/[0.05] hover:text-white',
              )}
            >
              <span className="truncate">{pick(getSkillDomainLabel(domain.id))}</span>
              <span className="shrink-0 rounded-md border border-indigo-200/[0.14] bg-white/[0.05] px-2 py-0.5 font-mono text-xs text-slate-300 tabular-nums">
                {formatCount(domain.count)}
              </span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function ProgressiveLookupStage() {
  const { t } = useLanguage()
  const { progressiveLookup } = t.skillsPage

  return (
    <section aria-labelledby="progressive-lookup-heading" className="pt-4">
      <div className="hardware-bezel rounded-3xl p-2.5 sm:p-3.5">
        <div className="specular-surface space-y-7 rounded-2xl border border-indigo-200/[0.14] p-7 transition-colors duration-150 hover:border-sky-300/30 sm:p-9">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase">
              {progressiveLookup.badge}
            </span>
            <h2 id="progressive-lookup-heading" className="pb-1 text-2xl leading-[1.16] font-bold tracking-tight text-ink sm:text-3xl">
              {progressiveLookup.title}
            </h2>
            <p className="max-w-[62ch] text-base leading-relaxed text-muted">{progressiveLookup.description}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {progressiveLookup.steps.map((hop) => (
              <div key={hop.step} className="space-y-3 rounded-2xl border border-indigo-200/[0.12] bg-[#070B19]/85 p-6 text-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-subtle tabular-nums">
                  <span className="text-sm font-bold text-ink">{hop.step}</span>
                  <code className="max-w-full truncate rounded-lg border border-indigo-200/[0.15] bg-white/[0.05] px-2.5 py-1 text-sky-200">
                    {hop.code}
                  </code>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-ink">{hop.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{hop.summary}</p>
              </div>
            ))}
          </div>

          <CopyCommandBar
            command="node cli/install.js doctor"
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
          />
        </div>
      </div>
    </section>
  )
}

export function SkillsPage() {
  const { t } = useLanguage()
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

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
    >
      <SEO routeId="skills" />
      <SkillsHeroHeader />

      <div className="mt-10 grid gap-8 lg:grid-cols-[290px_1fr] lg:items-start lg:gap-10">
        <DomainSidebar activeDomain={activeDomain} onSelectDomain={setActiveDomain} />

        <div className="min-w-0 space-y-12">
          <section aria-label={copy.featuredSectionTitle} className="space-y-6">
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full lg:max-w-lg">
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
                  <ActionButton variant="secondary" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={resetFilters}>
                    {copy.resetCta}
                  </ActionButton>
                )}
              </div>

              <div role="group" aria-label={copy.tierFilterAria} className="flex flex-wrap gap-2.5">
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
              <div className="grid gap-6 md:grid-cols-2">
                {filteredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
              </div>
            )}
          </section>

          <ProgressiveLookupStage />
        </div>
      </div>
    </motion.div>
  )
}
