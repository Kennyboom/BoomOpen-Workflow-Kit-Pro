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
import type { AgentDomainKey, PageChromeCopy } from '../i18n/types'
import type { AgentSpec } from '../types/ui-contract'

/**
 * Flagship 1440px workforce showcase for 22 specialist sub-agents and 18 3-role review teams.
 */
type WorkforceTabId = 'agents' | 'teams'

const WORKFORCE_TAB_ORDER: readonly WorkforceTabId[] = ['agents', 'teams']
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const VALID_AGENT_DOMAINS = new Set<string>([
  'architecture', 'backend', 'data', 'design', 'devops', 'frontend', 'gaming', 'management',
  'mobile', 'performance', 'planning', 'quality', 'research', 'security', 'validation',
])

function resolveAgentDomainLabel(
  domain: string,
  agentDomains: PageChromeCopy['agentDomains'],
): string {
  return VALID_AGENT_DOMAINS.has(domain)
    ? agentDomains[domain as AgentDomainKey]
    : domain
}

function AgentsHeroHeader() {
  const { t } = useLanguage()
  const stats = [
    { value: formatCount(KIT_STATS.agents), label: t.pageChrome.agentsStats.specialists },
    { value: formatCount(KIT_STATS.teams), label: t.pageChrome.agentsStats.reviewTeams },
    { value: formatCount(KIT_STATS.teamFiles), label: t.pageChrome.agentsStats.roleSpecs },
  ]

  return (
    <header className="border-b border-indigo-200/[0.12] pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{t.agentsPage.eyebrow}</span>
          </div>
          <h1 className="hero-display-gradient pb-1 text-[clamp(2.5rem,4.4vw,4rem)] leading-[1.16] font-bold tracking-[-0.036em] text-ink">
            {t.agentsPage.title}
          </h1>
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-muted sm:text-xl">
            {t.agentsPage.subtitle}
          </p>
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

function SpecialistAgentCard({ agent }: { readonly agent: AgentSpec }) {
  const { t, agentCopy } = useLanguage()
  const localized = agentCopy(agent)
  const domainLabel = resolveAgentDomainLabel(agent.domain, t.pageChrome.agentDomains)

  return (
    <article className="specular-surface flex h-full flex-col justify-between rounded-3xl border border-indigo-200/[0.14] p-7 transition-colors duration-150 motion-reduce:transition-none hover:border-sky-300/30 sm:p-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <code className="block font-mono text-xl font-bold tracking-tight text-ink">{agent.id}</code>
            <div className="text-sm font-medium text-ink/80">{localized.title}</div>
          </div>
          <span className="shrink-0 rounded-full border border-indigo-200/[0.14] bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-300">
            {domainLabel}
          </span>
        </div>
        <p className="mt-4 text-[15.5px] leading-relaxed text-muted sm:text-base">{localized.summary}</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-200/[0.12] pt-5">
        <code className="max-w-full truncate rounded-lg border border-indigo-200/[0.15] bg-white/[0.05] px-3 py-1.5 font-mono text-xs text-sky-200 sm:text-[13px]">
          {agent.deliverable}
        </code>
        <span className="shrink-0 font-mono text-xs text-subtle">{`model:${agent.modelPolicy}`}</span>
      </div>
    </article>
  )
}

function TeamsScalingBanner() {
  const { t } = useLanguage()
  const { diamondSection } = t.agentsPage

  return (
    <div className="hardware-bezel mt-10 rounded-3xl p-2.5 sm:p-3">
      <div className="specular-surface grid gap-6 rounded-2xl border border-indigo-200/[0.14] p-7 transition-colors duration-150 hover:border-sky-300/30 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-2">
          <span className="inline-flex rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3 py-1 font-mono text-xs tracking-wider text-slate-300 uppercase">
            {diamondSection.badge}
          </span>
          <h2 className="pb-1 text-2xl leading-[1.16] font-bold tracking-tight text-ink">{diamondSection.title}</h2>
          <p className="text-base leading-relaxed text-muted">{diamondSection.subtitle}</p>
        </div>
        <div className="space-y-3 rounded-2xl border border-indigo-200/[0.12] bg-[#070B19]/85 p-5 font-mono text-xs leading-relaxed text-slate-200 sm:text-[13px]">
          <p className="text-ink">{diamondSection.scalingRule}</p>
          <p className="border-t border-indigo-200/[0.12] pt-3 text-subtle">{diamondSection.mailboxNote}</p>
        </div>
      </div>
    </div>
  )
}

export function AgentsTeamsPage() {
  const { t, agentCopy, teamSummary } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabRefs = useRef<Record<WorkforceTabId, HTMLButtonElement | null>>({ agents: null, teams: null })

  const rawTab = searchParams.get('tab')
  const activeTab: WorkforceTabId =
    rawTab === 'teams' || (!rawTab && searchParams.has('team')) ? 'teams' : 'agents'
  const query = searchParams.get('q') ?? searchParams.get('agent') ?? searchParams.get('team') ?? ''
  const rawDomain = searchParams.get('domain')
  const activeDomain = rawDomain && VALID_AGENT_DOMAINS.has(rawDomain) ? rawDomain : 'all'

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
      const localized = agentCopy(agent)
      const domainLabel = resolveAgentDomainLabel(agent.domain, t.pageChrome.agentDomains)
      return [
        agent.id, agent.domain, domainLabel, agent.deliverable,
        localized.title, localized.summary, agent.title.en, agent.summary.en,
      ].some((field) => field.toLowerCase().includes(normalized))
    })
  }, [activeDomain, agentCopy, query, t.pageChrome.agentDomains])

  const filteredTeams = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return SPECIALIST_TEAMS.filter((team) => {
      if (activeDomain !== 'all' && !teamDomainsById.get(team.id)?.has(activeDomain)) return false
      if (!normalized) return true
      return [
        team.id, team.dirName, team.triggerCommand, teamSummary(team), team.summary.en,
        ...team.roles.techlead, ...team.roles.executor, ...team.roles.reviewer,
      ].some((field) => field.toLowerCase().includes(normalized))
    })
  }, [activeDomain, query, teamDomainsById, teamSummary])

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

  const tabMeta: Readonly<Record<WorkforceTabId, { readonly label: string; readonly count: number }>> = {
    agents: { label: t.agentsPage.tabs.agents, count: filteredAgents.length },
    teams: { label: t.agentsPage.tabs.teams, count: filteredTeams.length },
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="mx-auto min-h-dvh max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24"
    >
      <SEO routeId="agents" />
      <AgentsHeroHeader />

      <section aria-label={t.agentsPage.title}>
        <div className="my-8 space-y-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div
              role="tablist"
              aria-label={t.agentsPage.title}
              className="inline-flex flex-wrap self-start gap-1.5 rounded-full border border-indigo-200/[0.14] bg-[#070B19]/85 p-1.5"
            >
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
                      'inline-flex min-h-12 items-center gap-2.5 rounded-full px-6 py-2.5 text-base font-semibold transition-colors duration-150 motion-reduce:transition-none cursor-pointer tabular-nums',
                      FOCUS_RING,
                      selected
                        ? 'bg-primary text-primary-ink shadow-[0_0_20px_-4px_rgba(125,211,252,0.4)]'
                        : 'text-slate-300 hover:text-white',
                    )}
                  >
                    <span>{tabMeta[tabId].label}</span>
                    {hasFilters && (
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 font-mono text-xs tabular-nums',
                          selected ? 'bg-[#050816]/12 text-[#050816]' : 'bg-white/[0.08] text-slate-300',
                        )}
                      >
                        {formatCount(tabMeta[tabId].count)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
              <div className="w-full lg:w-[440px]">
                <SearchField
                  id="workforce-directory-search"
                  label={t.agentsPage.searchLabel}
                  value={query}
                  onChange={setQuery}
                  placeholder={t.agentsPage.searchPlaceholder}
                  clearLabel={t.common.clearSearch}
                  resultCountLabel={`${formatCount(visibleCount)} / ${formatCount(totalForTab)} ${t.common.resultsCount}`}
                />
              </div>
              {hasFilters && (
                <ActionButton variant="secondary" icon={<RotateCcw aria-hidden="true" className="size-4" />} onClick={handleResetFilters} className="shrink-0">
                  {t.agentsPage.resetCta}
                </ActionButton>
              )}
            </div>
          </div>

          <div id="workforce-domain-filters" role="group" aria-label={t.agentsPage.domainFilterAria} className="flex flex-wrap gap-2.5">
            <FilterPill label={t.agentsPage.allDomains} active={activeDomain === 'all'} onSelect={() => setActiveDomain('all')} />
            {domains.map((domain) => (
              <FilterPill
                key={domain}
                label={resolveAgentDomainLabel(domain, t.pageChrome.agentDomains)}
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
            <div className="grid gap-6 md:grid-cols-2 lg:gap-7 xl:grid-cols-3">
              {filteredAgents.map((agent) => <SpecialistAgentCard key={agent.id} agent={agent} />)}
            </div>
          ) : (
            <div>
              <div className="grid gap-7 xl:grid-cols-2">
                {filteredTeams.map((team) => <TeamDiamondCard key={team.id} team={team} />)}
              </div>
              <TeamsScalingBanner />
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
