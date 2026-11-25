import { useMemo, useRef, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { TeamDiamondCard } from '../components/catalogs/TeamDiamondCard'
import { SEO } from '../components/seo/SEO'
import { ActionButton, EmptyCatalogState, FilterPill, SearchField } from '../components/ui/Primitives'
import { SPECIALIST_AGENTS } from '../data/agents'
import { formatCount, KIT_STATS } from '../data/kitStats'
import { SPECIALIST_TEAMS } from '../data/teams'
import { useLanguage } from '../i18n/context'
import type { AgentSpec, BilingualText } from '../types/ui-contract'

/**
 * Minimalist workforce directory for 22 specialist sub-agents and 18 3-role teams.
 */
type WorkforceTabId = 'agents' | 'teams'

const WORKFORCE_TAB_ORDER: readonly WorkforceTabId[] = ['agents', 'teams']

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
  validation: { en: 'Spec Validation', vi: 'Đối soát đặc tả' },
}

function SpecialistAgentCard({ agent }: { readonly agent: AgentSpec }) {
  const { pick } = useLanguage()
  const domainLabel = DOMAIN_LABELS[agent.domain] ? pick(DOMAIN_LABELS[agent.domain]) : agent.domain

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-hairline bg-card p-5 transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-sm font-medium text-ink">{agent.id}</code>
          <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle">
            {domainLabel}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted">{pick(agent.summary)}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-3 font-mono text-xs text-subtle">
        <span className="truncate">{agent.deliverable}</span>
        <span className="shrink-0">{`model:${agent.modelPolicy}`}</span>
      </div>
    </article>
  )
}

export function AgentsTeamsPage() {
  const { t, locale, pick } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef<Record<WorkforceTabId, HTMLButtonElement | null>>({ agents: null, teams: null })

  const rawTab = searchParams.get('tab')
  const activeTab: WorkforceTabId =
    rawTab === 'teams' || (!rawTab && searchParams.has('team')) ? 'teams' : 'agents'
  const query = searchParams.get('q') ?? searchParams.get('agent') ?? searchParams.get('team') ?? ''
  const rawDomain = searchParams.get('domain')
  const activeDomain = rawDomain && rawDomain in DOMAIN_LABELS ? rawDomain : 'all'

  const updateParam = (key: 'tab' | 'q' | 'domain', value: string | null) => {
    const next = new URLSearchParams(searchParams)
    if (key === 'q') {
      next.delete('agent')
      next.delete('team')
    }
    if (value && value !== 'all' && !(key === 'tab' && value === 'agents')) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const setActiveTab = (nextTab: WorkforceTabId) => updateParam('tab', nextTab)
  const setQuery = (nextQuery: string) => updateParam('q', nextQuery.trim() ? nextQuery : null)
  const setActiveDomain = (nextDomain: string) => updateParam('domain', nextDomain)

  const domains = useMemo(
    () => Array.from(new Set(SPECIALIST_AGENTS.map((agent) => agent.domain))).sort(),
    [],
  )

  const teamDomainsById = useMemo(() => {
    const agentDomains = new Map<string, string>(SPECIALIST_AGENTS.map((a) => [a.id, a.domain]))
    const map = new Map<string, ReadonlySet<string>>()
    for (const team of SPECIALIST_TEAMS) {
      const roleIds = [...team.roles.techlead, ...team.roles.executor, ...team.roles.reviewer]
      const domainSet = new Set<string>()
      for (const id of roleIds) {
        const domain = agentDomains.get(id)
        if (domain) domainSet.add(domain)
      }
      map.set(team.id, domainSet)
    }
    return map
  }, [])

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

  const visibleCount = activeTab === 'agents' ? filteredAgents.length : filteredTeams.length
  const totalForTab = activeTab === 'agents' ? SPECIALIST_AGENTS.length : SPECIALIST_TEAMS.length
  const hasFilters = query.trim().length > 0 || activeDomain !== 'all'

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentTab: WorkforceTabId) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const nextTab: WorkforceTabId = currentTab === 'agents' ? 'teams' : 'agents'
    setActiveTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  const handleResetFilters = () => {
    const next = new URLSearchParams()
    if (activeTab === 'teams') next.set('tab', 'teams')
    setSearchParams(next, { replace: true })
  }

  const inlineStats =
    locale === 'vi'
      ? `${formatCount(KIT_STATS.agents)} Chuyên gia · ${formatCount(KIT_STATS.teams)} Đội 3 vai trò · ${formatCount(KIT_STATS.platforms)} IDE`
      : `${formatCount(KIT_STATS.agents)} Specialists · ${formatCount(KIT_STATS.teams)} Teams · ${formatCount(KIT_STATS.platforms)} IDEs`

  const tabMeta: Readonly<Record<WorkforceTabId, { readonly label: string; readonly count: number }>> = {
    agents: {
      label: locale === 'vi' ? `${formatCount(KIT_STATS.agents)} Chuyên gia` : `${formatCount(KIT_STATS.agents)} Specialists`,
      count: filteredAgents.length,
    },
    teams: {
      label: locale === 'vi' ? `${formatCount(KIT_STATS.teams)} Đội 3 vai trò` : `${formatCount(KIT_STATS.teams)} Teams`,
      count: filteredTeams.length,
    },
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[75rem] space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <SEO routeId="agents" />

      <header className="space-y-3.5 border-b border-hairline pb-8">
        <p className="font-mono text-xs tracking-wider text-subtle uppercase">{t.agentsPage.eyebrow}</p>
        <h1 className="text-[clamp(1.85rem,3vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink">
          {t.agentsPage.title}
        </h1>
        <p className="max-w-[58ch] text-base leading-relaxed text-muted">{t.agentsPage.subtitle}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-mono text-xs text-subtle tabular-nums">
          <span>{inlineStats}</span>
          <span aria-hidden="true">·</span>
          <span>Model: inherit</span>
          <span aria-hidden="true">·</span>
          <span>&lt;= 4 OWNED_FILES / shard</span>
        </div>
      </header>

      <section aria-label={t.agentsPage.title} className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div role="tablist" aria-label={t.agentsPage.title} className="inline-flex self-start rounded-xl border border-hairline bg-card p-1">
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
                      'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors duration-150 motion-reduce:transition-none cursor-pointer tabular-nums',
                      FOCUS_RING,
                      selected ? 'bg-primary font-semibold text-primary-ink' : 'bg-transparent font-normal text-muted hover:text-ink',
                    )}
                  >
                    <span>{tabMeta[tabId].label}</span>
                    {hasFilters && (
                      <span className={clsx('rounded px-1.5 py-0.5 font-mono text-xs tabular-nums', selected ? 'bg-black/15 text-primary-ink' : 'bg-white/[0.05] text-subtle')}>
                        {formatCount(tabMeta[tabId].count)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:max-w-md">
              <SearchField
                id="workforce-directory-search"
                label={t.agentsPage.searchLabel}
                value={query}
                onChange={setQuery}
                placeholder={t.agentsPage.searchPlaceholder}
                clearLabel={t.common.clearSearch}
                resultCountLabel={`${formatCount(visibleCount)} / ${formatCount(totalForTab)} ${t.common.resultsCount}`}
              />
              {hasFilters && (
                <ActionButton variant="ghost" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={handleResetFilters} className="shrink-0">
                  {t.agentsPage.resetCta}
                </ActionButton>
              )}
            </div>
          </div>

          <div id="workforce-domain-filters" role="group" aria-label={t.agentsPage.domainFilterAria} className="flex flex-wrap gap-2">
            <FilterPill label={t.agentsPage.allDomains} active={activeDomain === 'all'} onSelect={() => setActiveDomain('all')} />
            {domains.map((domain) => (
              <FilterPill
                key={domain}
                label={DOMAIN_LABELS[domain] ? pick(DOMAIN_LABELS[domain]) : domain}
                active={activeDomain === domain}
                onSelect={() => setActiveDomain(activeDomain === domain ? 'all' : domain)}
              />
            ))}
          </div>
        </div>

        <div id="workforce-tabpanel" role="tabpanel" aria-labelledby={`workforce-tab-${activeTab}`}>
          {visibleCount === 0 ? (
            <EmptyCatalogState title={t.agentsPage.emptyTitle} description={t.agentsPage.emptyBody} resetLabel={t.agentsPage.resetCta} onReset={handleResetFilters} />
          ) : activeTab === 'agents' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAgents.map((agent) => <SpecialistAgentCard key={agent.id} agent={agent} />)}
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredTeams.map((team) => <TeamDiamondCard key={team.id} team={team} />)}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
