import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Layers, Sparkles, Terminal, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { SEO } from '../components/seo/SEO'
import {
  ActionLink, CopyCommandBar, EmptyCatalogState, FilterPill, SearchField, StatusBadge, SurfaceCard,
} from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import {
  ALL_SHOWCASE_SKILLS, CORE_SKILLS_SHOWCASE, FEATURED_LIBRARY_SKILLS, getSkillDomainLabel,
} from '../data/skills'
import { useLanguage } from '../i18n/context'

/**
 * 1,462-Skill Vault Explorer — Obsidian Tungsten & Forge Amber oklch() @theme surfaces.
 * Our mission: zero-bloat progressive knowledge trusted by 5+ AI IDE workflows.
 */
type SkillTierFilter = 'all' | 'core' | 'library'

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const VALID_DOMAIN_IDS = new Set(KIT_STATS.domains.map((d) => d.id))

function isSkillTier(value: string | null): value is SkillTierFilter {
  return value === 'all' || value === 'core' || value === 'library'
}

export function SkillsPage() {
  const { locale, t, pick } = useLanguage()
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
  const maxDomainCount = useMemo(() => Math.max(...KIT_STATS.domains.map((d) => d.count), 1), [])

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

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const statCards = [
    { value: formatCount(KIT_STATS.coreSkills), label: copy.stats.coreLabel, tone: 'amber' as const, code: 'skills/*/SKILL.md' },
    { value: formatCount(KIT_STATS.librarySkills), label: copy.stats.libraryLabel, tone: 'cobalt' as const, code: 'skills_library/*/SKILL.md' },
    { value: formatCount(KIT_STATS.skills), label: copy.stats.indexedLabel, tone: 'emerald' as const, code: 'matrix-skills/compact-index.json' },
    { value: formatCount(KIT_STATS.domains.length), label: copy.stats.domainsLabel, tone: 'neutral' as const, code: 'matrix-skills/*.yaml' },
  ]

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <SEO routeId="skills" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <header className="space-y-8 border-b border-hairline pb-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <StatusBadge tone="amber">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.eyebrow}</span>
            </StatusBadge>
            <span className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug text-muted tabular-nums">
              v{KIT_STATS.version} · O(1) Compact Index
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-8">
              <h1 className="font-display text-[clamp(2rem,2.6vw+1.25rem,3.25rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.title}
              </h1>
              <p className="max-w-prose text-[clamp(1rem,0.25vw+0.94rem,1.125rem)] leading-relaxed font-normal text-muted">
                {copy.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <ActionLink to="/install" variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
                {t.nav.install}
              </ActionLink>
              <ActionLink to="/commands" variant="secondary">
                {t.nav.commands}
              </ActionLink>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <SurfaceCard key={stat.code} variant="default" className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[clamp(1.75rem,1.4vw+1.3rem,2.35rem)] leading-tight font-semibold text-ink tabular-nums">
                    {stat.value}
                  </span>
                  <StatusBadge tone={stat.tone}>{stat.code}</StatusBadge>
                </div>
                <p className="max-w-prose text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed font-normal text-muted">
                  {stat.label}
                </p>
              </SurfaceCard>
            ))}
          </div>
        </header>

        <section aria-labelledby="progressive-lookup-heading" className="space-y-6">
          <div className="space-y-2">
            <StatusBadge tone="emerald">
              <Zap aria-hidden="true" className="size-3.5" />
              <span className="uppercase tracking-wider">{copy.progressiveLookup.badge}</span>
            </StatusBadge>
            <h2 id="progressive-lookup-heading" className="font-display text-[clamp(1.45rem,1.2vw+1.1rem,2rem)] leading-tight font-semibold tracking-tight text-ink">
              {copy.progressiveLookup.title}
            </h2>
            <p className="max-w-prose text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
              {copy.progressiveLookup.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {copy.progressiveLookup.steps.map((hop) => (
              <SurfaceCard key={hop.step} variant="elevated" as="article" className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[clamp(0.8rem,0.1vw+0.76rem,0.875rem)] leading-none font-semibold text-primary tabular-nums">
                    HOP {hop.step}
                  </span>
                  <code className="rounded-md border border-hairline bg-canvas px-2.5 py-1 font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-tight text-accent">
                    {hop.code}
                  </code>
                </div>
                <h3 className="font-display text-[clamp(1.05rem,0.3vw+0.98rem,1.25rem)] leading-tight font-semibold text-ink">
                  {hop.title}
                </h3>
                <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                  {hop.summary}
                </p>
              </SurfaceCard>
            ))}
          </div>

          <CopyCommandBar
            command="node cli/install.js doctor"
            label={locale === 'vi' ? 'Kiểm chứng chỉ mục 1.462 kỹ năng (chế độ chỉ đọc)' : 'Verify 1,462-skill compact index parity (read-only)'}
            copyLabel={t.common.copy}
            copiedLabel={t.common.copied}
            manualCopyHint={t.common.copyManualHint}
            compact
          />
        </section>

        <section aria-labelledby="domain-matrices-heading" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h2 id="domain-matrices-heading" className="font-display text-[clamp(1.35rem,1vw+1.05rem,1.85rem)] leading-tight font-semibold tracking-tight text-ink">
                {copy.domainsSectionTitle}
              </h2>
              <p className="max-w-prose text-[clamp(0.875rem,0.12vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
                {locale === 'vi'
                  ? 'Chọn một miền chuyên môn bất kỳ để lọc danh mục kỹ năng bên dưới.'
                  : 'Select any engineering domain card to filter the showcase catalog below.'}
              </p>
            </div>
            {activeDomain !== 'all' && (
              <FilterPill label={copy.allDomains} count={KIT_STATS.skills} active={false} onSelect={() => setActiveDomain('all')} />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {KIT_STATS.domains.map((domain) => {
              const isSelected = activeDomain === domain.id
              const ratioPct = Math.max(8, Math.round((domain.count / maxDomainCount) * 100))
              return (
                <button
                  key={domain.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveDomain(isSelected ? 'all' : domain.id)}
                  className={clsx(
                    'flex min-h-11 flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer specular-surface',
                    FOCUS_RING,
                    isSelected ? 'border-primary bg-elevated text-ink' : 'border-hairline bg-card text-ink hover:border-line-strong',
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="font-display text-[clamp(0.925rem,0.15vw+0.88rem,1rem)] leading-snug font-semibold text-ink">
                      {pick(getSkillDomainLabel(domain.id))}
                    </span>
                    <span className="rounded-md bg-canvas px-2 py-0.5 font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-tight font-semibold text-primary tabular-nums">
                      {formatCount(domain.count)}
                    </span>
                  </div>
                  <div className="w-full space-y-1.5">
                    <div className="h-[6px] w-full overflow-hidden rounded-full bg-canvas">
                      <div className={clsx('h-full rounded-full', isSelected ? 'bg-primary' : 'bg-accent/80')} style={{ width: `${ratioPct}%` }} />
                    </div>
                    <div className="flex items-center justify-between font-mono text-[clamp(0.7rem,0.08vw+0.68rem,0.75rem)] leading-none text-subtle tabular-nums">
                      <span>{domain.id}</span>
                      <span>{((domain.count / KIT_STATS.skills) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="skills-catalog-heading" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="skills-catalog-heading" className="font-display text-[clamp(1.35rem,1vw+1.05rem,1.85rem)] leading-tight font-semibold tracking-tight text-ink">
              {copy.featuredSectionTitle}
            </h2>
            <StatusBadge tone="neutral">
              <Layers aria-hidden="true" className="size-3.5" />
              <span>{filteredSkills.length} / {ALL_SHOWCASE_SKILLS.length} {t.common.resultsCount}</span>
            </StatusBadge>
          </div>

          <SurfaceCard variant="default" className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <SearchField
                  id="skills-vault-search"
                  label={copy.searchLabel}
                  value={query}
                  onChange={setQuery}
                  placeholder={copy.searchPlaceholder}
                  clearLabel={t.common.clearSearch}
                  resultCountLabel={`${filteredSkills.length} ${t.common.resultsCount}`}
                />
              </div>
              <div role="group" aria-label={copy.tierFilterAria} className="flex flex-wrap gap-2 lg:col-span-5 lg:justify-end">
                <FilterPill label={copy.tiers.all} count={ALL_SHOWCASE_SKILLS.length} active={tier === 'all'} onSelect={() => setTier('all')} />
                <FilterPill label={copy.tiers.core} count={CORE_SKILLS_SHOWCASE.length} active={tier === 'core'} onSelect={() => setTier('core')} />
                <FilterPill label={copy.tiers.library} count={FEATURED_LIBRARY_SKILLS.length} active={tier === 'library'} onSelect={() => setTier('library')} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
              <FilterPill label={copy.allDomains} count={ALL_SHOWCASE_SKILLS.length} active={activeDomain === 'all'} onSelect={() => setActiveDomain('all')} />
              {KIT_STATS.domains.map((domain) => (
                <FilterPill
                  key={domain.id}
                  label={pick(getSkillDomainLabel(domain.id))}
                  active={activeDomain === domain.id}
                  onSelect={() => setActiveDomain(activeDomain === domain.id ? 'all' : domain.id)}
                />
              ))}
            </div>
          </SurfaceCard>

          {filteredSkills.length === 0 ? (
            <EmptyCatalogState
              title={copy.emptyTitle}
              description={query.trim() ? `${copy.emptyBody} ("${query.trim()}")` : copy.emptyBody}
              resetLabel={copy.resetCta}
              onReset={resetFilters}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => {
                const isCore = skill.tier === 'core'
                const skillPath = isCore ? `skills/${skill.id}/SKILL.md` : `skills_library/${skill.id}/SKILL.md`
                return (
                  <SurfaceCard key={skill.id} variant="interactive" as="article" className="flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <StatusBadge tone={isCore ? 'amber' : 'cobalt'}>
                          {isCore ? 'CORE · TURN-1' : 'LIBRARY · ON-DEMAND'}
                        </StatusBadge>
                        <StatusBadge tone="neutral" mono={false}>
                          {pick(getSkillDomainLabel(skill.domainId))}
                        </StatusBadge>
                      </div>
                      <h3 className="font-mono text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-tight font-semibold text-ink">
                        {skill.id}
                      </h3>
                      <p className="max-w-prose text-[clamp(0.85rem,0.12vw+0.82rem,0.925rem)] leading-relaxed font-normal text-muted">
                        {pick(skill.summary)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 border-t border-hairline pt-3 font-mono text-[clamp(0.72rem,0.08vw+0.7rem,0.78rem)] leading-tight text-subtle">
                      <Terminal aria-hidden="true" className="size-3.5 shrink-0 text-accent" />
                      <span className="truncate">{skillPath}</span>
                    </div>
                  </SurfaceCard>
                )
              })}
            </div>
          )}
        </section>
      </motion.div>
    </div>
  )
}
