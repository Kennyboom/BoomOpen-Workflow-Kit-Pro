import { useMemo, useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { Bot, Cpu, Diamond, FileCheck2, RotateCcw, ShieldCheck } from 'lucide-react'
import { TeamDiamondCard } from '../components/catalogs/TeamDiamondCard'
import { SEO } from '../components/seo/SEO'
import {
  ActionButton, EmptyCatalogState, FilterPill, SearchField, StatusBadge, SurfaceCard,
} from '../components/ui/Primitives'
import { SPECIALIST_AGENTS } from '../data/agents'
import { formatCount, KIT_STATS } from '../data/kitStats'
import { SPECIALIST_TEAMS } from '../data/teams'
import { useLanguage } from '../i18n/context'
import type { AgentSpec, BilingualText } from '../types/ui-contract'

/**
 * Workforce directory showcasing 21 specialist agents, 18 Elastic Golden Diamond
 * teams (72 files), our mission of adversarial review, and 1,462 indexed skills.
 */
type WorkforceTabId = 'all' | 'agents' | 'teams'

const WORKFORCE_TAB_ORDER: readonly WorkforceTabId[] = ['all', 'agents', 'teams']

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const DOMAIN_LABELS: Readonly<Record<string, BilingualText>> = {
  architecture: { en: 'Architecture', vi: 'Kiến trúc' },
  backend: { en: 'Backend', vi: 'Backend' },
  data: { en: 'Database', vi: 'Cơ sở dữ liệu' },
  design: { en: 'UI/UX Design', vi: 'Thiết kế UI/UX' },
  devops: { en: 'DevOps & Cloud', vi: 'DevOps & Hạ tầng' },
  frontend: { en: 'Frontend', vi: 'Frontend' },
  gaming: { en: 'Real-Time & Game', vi: 'Game & Đồ họa' },
  management: { en: 'Governance', vi: 'Quản trị dự án' },
  mobile: { en: 'Mobile', vi: 'Di động' },
  performance: { en: 'Performance', vi: 'Hiệu năng' },
  planning: { en: 'Planning', vi: 'Lập kế hoạch' },
  quality: { en: 'QA & Review', vi: 'Kiểm thử & Review' },
  research: { en: 'Research & Docs', vi: 'Nghiên cứu & Tài liệu' },
  security: { en: 'Security', vi: 'Bảo mật' },
  validation: { en: 'Spec Validation', vi: 'Đối soát Đặc tả' },
}

function toSlugId(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function SpecialistAgentCard({ agent }: { readonly agent: AgentSpec }) {
  const { t, pick } = useLanguage()
  const domainLabel = DOMAIN_LABELS[agent.domain] ? pick(DOMAIN_LABELS[agent.domain]) : agent.domain

  return (
    <SurfaceCard variant="interactive" className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <code className="rounded-lg border border-primary/35 bg-primary/12 px-2.5 py-1 font-mono text-[clamp(0.8rem,0.12vw+0.77rem,0.875rem)] leading-tight font-semibold text-primary">
            {agent.id}
          </code>
          <StatusBadge tone="emerald">{`Model: ${agent.modelPolicy}`}</StatusBadge>
        </div>
        <h3 className="font-display text-[clamp(1.05rem,0.28vw+0.98rem,1.2rem)] leading-tight font-semibold text-ink">
          {pick(agent.title)}
        </h3>
        <p className="max-w-prose text-[clamp(0.875rem,0.14vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
          {pick(agent.summary)}
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-hairline bg-canvas/80 p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold tracking-wider text-subtle uppercase">
            {t.agentsPage.cardLabels.domain}
          </span>
          <StatusBadge tone="cobalt" mono={false}>{domainLabel}</StatusBadge>
        </div>
        <div className="space-y-1 pt-1">
          <div className="font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold tracking-wider text-subtle uppercase">
            {t.agentsPage.cardLabels.deliverable}
          </div>
          <code className="block font-mono text-[clamp(0.76rem,0.1vw+0.74rem,0.82rem)] leading-snug font-normal text-ink">
            {agent.deliverable}
          </code>
        </div>
      </div>
    </SurfaceCard>
  )
}

function isWorkforceTab(value: string | null): value is WorkforceTabId {
  return value === 'all' || value === 'agents' || value === 'teams'
}

export function AgentsTeamsPage() {
  const { t, locale, pick } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef<Record<WorkforceTabId, HTMLButtonElement | null>>({
    all: null,
    agents: null,
    teams: null,
  })

  const rawTab = searchParams.get('tab')
  const activeTab: WorkforceTabId = isWorkforceTab(rawTab)
    ? rawTab
    : searchParams.has('team')
      ? 'teams'
      : searchParams.has('agent')
        ? 'agents'
        : 'all'
  const query = searchParams.get('q') ?? searchParams.get('agent') ?? searchParams.get('team') ?? ''
  const rawDomain = searchParams.get('domain')
  const activeDomain = rawDomain && rawDomain in DOMAIN_LABELS ? rawDomain : 'all'

  const updateParam = (key: 'tab' | 'q' | 'domain', value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (key === 'q') {
      next.delete('agent')
      next.delete('team')
    }
    if (value && value !== 'all') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const setActiveTab = (nextTab: WorkforceTabId) => updateParam('tab', nextTab)
  const setQuery = (nextQuery: string) => updateParam('q', nextQuery.trim() ? nextQuery : null)
  const setActiveDomain = (nextDomain: string) => updateParam('domain', nextDomain)

  const agentDomainsById = useMemo(
    () => new Map<string, string>(SPECIALIST_AGENTS.map((agent) => [agent.id, agent.domain])),
    [],
  )

  const domains = useMemo(
    () => Array.from(new Set(SPECIALIST_AGENTS.map((agent) => agent.domain))).sort(),
    [],
  )

  const teamDomainsById = useMemo(() => {
    const map = new Map<string, ReadonlySet<string>>()
    for (const team of SPECIALIST_TEAMS) {
      const roleAgentIds = [...team.roles.techlead, ...team.roles.executor, ...team.roles.reviewer]
      const domainSet = new Set<string>()
      for (const agentId of roleAgentIds) {
        const domain = agentDomainsById.get(agentId)
        if (domain) domainSet.add(domain)
      }
      map.set(team.id, domainSet)
    }
    return map
  }, [agentDomainsById])

  const filteredAgents = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return SPECIALIST_AGENTS.filter((agent) => {
      if (activeDomain !== 'all' && agent.domain !== activeDomain) return false
      if (!normalized) return true
      return [
        agent.id, agent.domain, agent.deliverable,
        agent.title.en, agent.title.vi, agent.summary.en, agent.summary.vi,
      ].some((field) => field.toLowerCase().includes(normalized))
    })
  }, [activeDomain, query])

  const filteredTeams = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return SPECIALIST_TEAMS.filter((team) => {
      if (activeDomain !== 'all' && !teamDomainsById.get(team.id)?.has(activeDomain)) return false
      if (!normalized) return true
      return [
        team.id, team.dirName, team.triggerCommand, team.summary.en, team.summary.vi,
        ...team.roles.techlead, ...team.roles.executor, ...team.roles.reviewer,
      ].some((field) => field.toLowerCase().includes(normalized))
    })
  }, [activeDomain, query, teamDomainsById])

  const visibleCount =
    activeTab === 'agents' ? filteredAgents.length
      : activeTab === 'teams' ? filteredTeams.length
        : filteredAgents.length + filteredTeams.length

  const totalForTab =
    activeTab === 'agents' ? SPECIALIST_AGENTS.length
      : activeTab === 'teams' ? SPECIALIST_TEAMS.length
        : SPECIALIST_AGENTS.length + SPECIALIST_TEAMS.length

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: WorkforceTabId) => {
    const idx = WORKFORCE_TAB_ORDER.indexOf(currentTab)
    const nextIdx =
      event.key === 'ArrowRight' ? (idx + 1) % WORKFORCE_TAB_ORDER.length
        : event.key === 'ArrowLeft' ? (idx - 1 + WORKFORCE_TAB_ORDER.length) % WORKFORCE_TAB_ORDER.length
          : event.key === 'Home' ? 0
            : event.key === 'End' ? WORKFORCE_TAB_ORDER.length - 1 : -1
    if (nextIdx >= 0) {
      event.preventDefault()
      const nextTab = WORKFORCE_TAB_ORDER[nextIdx]
      setActiveTab(nextTab)
      tabRefs.current[nextTab]?.focus()
    }
  }

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const tabLabels: Readonly<Record<WorkforceTabId, string>> = {
    all: locale === 'vi'
      ? `Tất cả (${formatCount(KIT_STATS.agents)} + ${formatCount(KIT_STATS.teams)})`
      : `All Workforce (${formatCount(KIT_STATS.agents)} + ${formatCount(KIT_STATS.teams)})`,
    agents: t.agentsPage.tabs.agents,
    teams: t.agentsPage.tabs.teams,
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8"
    >
      <SEO routeId="agents" />

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge tone="amber">
            <Bot aria-hidden="true" className="size-3.5" />
            <span className="tracking-wider uppercase">{t.agentsPage.eyebrow}</span>
          </StatusBadge>
          <StatusBadge tone="emerald">
            <Cpu aria-hidden="true" className="size-3.5" />
            <span>Model: &quot;inherit&quot;</span>
          </StatusBadge>
        </div>
        <h1 className="font-display text-[clamp(2rem,2.4vw+1.25rem,3.1rem)] leading-tight font-semibold tracking-tight text-ink">
          {t.agentsPage.title}
        </h1>
        <p className="max-w-prose text-[clamp(0.975rem,0.25vw+0.92rem,1.125rem)] leading-relaxed font-normal text-muted">
          {t.agentsPage.subtitle}
        </p>
      </header>

      <SurfaceCard variant="elevated" as="section" aria-labelledby="golden-diamond-heading" className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="amber">
            <Diamond aria-hidden="true" className="size-3.5" />
            <span className="tracking-wider uppercase">{t.agentsPage.diamondSection.badge}</span>
          </StatusBadge>
          <StatusBadge tone="cobalt">role#shard &lt;= 4 OWNED_FILES</StatusBadge>
          <StatusBadge tone="emerald">
            <FileCheck2 aria-hidden="true" className="size-3.5" />
            <span>{`${formatCount(KIT_STATS.teamFiles)} team files`}</span>
          </StatusBadge>
        </div>
        <h2 id="golden-diamond-heading" className="font-display text-[clamp(1.3rem,0.6vw+1.1rem,1.65rem)] leading-tight font-semibold text-ink">
          {t.agentsPage.diamondSection.title}
        </h2>
        <p className="max-w-prose text-[clamp(0.9rem,0.15vw+0.86rem,0.98rem)] leading-relaxed font-normal text-muted">
          {t.agentsPage.diamondSection.subtitle}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-canvas/80 p-3.5 text-[clamp(0.82rem,0.12vw+0.8rem,0.9rem)] leading-relaxed font-normal text-ink">
            <ShieldCheck aria-hidden="true" className="mr-1.5 inline size-4 text-accent" />
            {t.agentsPage.diamondSection.scalingRule}
          </div>
          <div className="rounded-xl border border-hairline bg-canvas/80 p-3.5 font-mono text-[clamp(0.78rem,0.1vw+0.76rem,0.85rem)] leading-relaxed font-normal text-muted tabular-nums">
            {t.agentsPage.diamondSection.mailboxNote}
          </div>
        </div>
      </SurfaceCard>

      <section aria-labelledby="workforce-controls-heading" className="space-y-6">
        <SurfaceCard variant="default" className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="workforce-controls-heading" className="font-display text-[clamp(1.2rem,0.45vw+1.08rem,1.5rem)] leading-tight font-semibold text-ink">
              {locale === 'vi' ? 'Bộ lọc Đội ngũ Chuyên gia & Team' : 'Workforce Explorer & Domain Matrix'}
            </h2>
            {(query.trim().length > 0 || activeDomain !== 'all') && (
              <ActionButton variant="secondary" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={handleResetFilters}>
                {t.agentsPage.resetCta}
              </ActionButton>
            )}
          </div>

          <div role="tablist" aria-label={t.agentsPage.title} className="inline-flex flex-wrap gap-2 rounded-xl border border-hairline bg-canvas p-1.5">
            {WORKFORCE_TAB_ORDER.map((tabId) => {
              const selected = activeTab === tabId
              return (
                <button
                  key={tabId}
                  ref={(el) => { tabRefs.current[tabId] = el }}
                  id={`workforce-tab-${tabId}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="workforce-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tabId)}
                  onKeyDown={(event) => handleTabKeyDown(event, tabId)}
                  className={clsx(
                    'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-[clamp(0.84rem,0.12vw+0.81rem,0.92rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none cursor-pointer tabular-nums',
                    FOCUS_RING,
                    selected ? 'bg-primary text-primary-ink font-semibold' : 'bg-transparent text-muted hover:text-ink font-normal',
                  )}
                >
                  {tabLabels[tabId]}
                </button>
              )
            })}
          </div>

          <SearchField
            id="workforce-directory-search"
            label={t.agentsPage.searchLabel}
            value={query}
            onChange={setQuery}
            placeholder={t.agentsPage.searchPlaceholder}
            clearLabel={t.common.clearSearch}
            resultCountLabel={`${formatCount(visibleCount)} / ${formatCount(totalForTab)} ${t.common.resultsCount}`}
          />

          <div id="workforce-domain-filters" role="group" aria-label={t.agentsPage.domainFilterAria} className="flex flex-wrap gap-2">
            <div id="workforce-domain-all">
              <FilterPill label={t.agentsPage.allDomains} active={activeDomain === 'all'} onSelect={() => setActiveDomain('all')} />
            </div>
            {domains.map((domain) => {
              const label = DOMAIN_LABELS[domain] ? pick(DOMAIN_LABELS[domain]) : domain
              return (
                <div key={domain} id={`workforce-domain-${toSlugId(domain)}`}>
                  <FilterPill label={label} active={activeDomain === domain} onSelect={() => setActiveDomain(domain)} />
                </div>
              )
            })}
          </div>
        </SurfaceCard>

        <div id="workforce-tabpanel" role="tabpanel" aria-labelledby={`workforce-tab-${activeTab}`} className="space-y-10">
          {visibleCount === 0 ? (
            <EmptyCatalogState title={t.agentsPage.emptyTitle} description={t.agentsPage.emptyBody} resetLabel={t.agentsPage.resetCta} onReset={handleResetFilters} />
          ) : (
            <>
              {(activeTab === 'all' || activeTab === 'agents') && filteredAgents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[clamp(1.25rem,0.5vw+1.1rem,1.55rem)] leading-tight font-semibold text-ink">
                      {t.agentsPage.tabs.agents}
                    </h2>
                    <StatusBadge tone="amber">{formatCount(filteredAgents.length)}</StatusBadge>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAgents.map((agent) => <SpecialistAgentCard key={agent.id} agent={agent} />)}
                  </div>
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'teams') && filteredTeams.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[clamp(1.25rem,0.5vw+1.1rem,1.55rem)] leading-tight font-semibold text-ink">
                      {t.agentsPage.tabs.teams}
                    </h2>
                    <StatusBadge tone="cobalt">{formatCount(filteredTeams.length)}</StatusBadge>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {filteredTeams.map((team) => <TeamDiamondCard key={team.id} team={team} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </motion.div>
  )
}
