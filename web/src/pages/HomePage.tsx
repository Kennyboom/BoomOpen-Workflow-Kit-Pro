import { useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Copy } from 'lucide-react'
import { CliPlayground } from '../components/home/CliPlayground'
import { SwarmVisualizer } from '../components/home/SwarmVisualizer'
import { TrailerPlayer } from '../components/home/TrailerPlayer'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { CLI_COMMANDS } from '../data/cliSuite'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { CLONE_SNIPPET, INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useCopyCommand } from '../hooks/useCopyCommand'
import { useLanguage } from '../i18n/context'
import type { PlatformId } from '../types/ui-contract'

/**
 * Obsidian Monograph flagship homepage: left-aligned architectural hero, seamless hairline
 * telemetry bar, numbered 01..04 sections, and a concise 5-IDE strip linking to /install.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const INSTALL_WITH_HOOKS_CMD = `${CLONE_SNIPPET} && node cli/install.js install --all --with-hooks`
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))

function isPlatformId(value: string | null): value is PlatformId {
  return value !== null && PLATFORM_ID_SET.has(value)
}

function cleanMetricLabel(rawLabel: string, fallback: string): string {
  const withoutLeadingCount = rawLabel.replace(/^\d[\d,.]*\s+/, '')
  if (/\d/.test(withoutLeadingCount)) {
    return fallback
  }
  return withoutLeadingCount
}

export function HomePage() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const { copied, copyFailed, copy } = useCopyCommand()
  const heroCodeRef = useRef<HTMLElement | null>(null)

  const rawTool = searchParams.get('tool')
  const selectedPlatformId: PlatformId = isPlatformId(rawTool) ? rawTool : 'antigravity'

  const handleSelectPlatform = (nextId: PlatformId) => {
    const next = new URLSearchParams(searchParams)
    if (nextId === 'antigravity') {
      next.delete('tool')
    } else {
      next.set('tool', nextId)
    }
    setSearchParams(next, { replace: true })
  }

  const handleHeroCopy = async () => {
    const ok = await copy(INSTALL_ALL_COMMAND)
    if (!ok && heroCodeRef.current && typeof window !== 'undefined') {
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(heroCodeRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  const heroMetrics = [
    { id: 'platforms', value: formatCount(KIT_STATS.platforms), label: cleanMetricLabel(t.hero.metrics.platforms, t.hero.metrics.platforms) },
    { id: 'commands', value: formatCount(KIT_STATS.commands.length), label: cleanMetricLabel(t.hero.metrics.commands, t.nav.commands) },
    { id: 'agentsTeams', value: `${formatCount(KIT_STATS.agents)} + ${formatCount(KIT_STATS.teams)}`, label: cleanMetricLabel(t.hero.metrics.agentsTeams, t.nav.agents) },
    { id: 'skills', value: formatCount(KIT_STATS.skills), label: cleanMetricLabel(t.hero.metrics.skills, t.nav.skills) },
    { id: 'cliGates', value: formatCount(CLI_COMMANDS.length), label: cleanMetricLabel(t.hero.metrics.cliGates, t.hero.metrics.cliGates) },
    { id: 'languages', value: formatCount(KIT_STATS.i18nLocales), label: cleanMetricLabel(t.hero.metrics.languages, t.hero.metrics.languages) },
  ] as const

  const installHref = selectedPlatformId === 'antigravity' ? '/install' : `/install?tool=${selectedPlatformId}`

  const renderSectionHeader = (index: string, id: string, eyebrow: string, title: string, subtitle: string) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 font-mono text-xs text-subtle tabular-nums">
        <span>{index}</span>
        <span aria-hidden="true" className="text-white/20">/</span>
        <span className="uppercase tracking-[0.08em]">{eyebrow}</span>
      </div>
      <h2
        id={id}
        className="font-display text-[clamp(1.5rem,2.2vw+0.75rem,2.25rem)] leading-[1.12] font-semibold tracking-[-0.032em] text-ink"
      >
        {title}
      </h2>
      <p className="max-w-[58ch] text-sm leading-relaxed text-muted sm:text-base">{subtitle}</p>
    </div>
  )

  return (
    <div className="min-h-dvh">
      <SEO routeId="home" />

      {/* Hero */}
      <section aria-labelledby="home-hero-heading" className="mx-auto max-w-[74rem] px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-md border border-hairline bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted tabular-nums">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            <span>{`v${KIT_STATS.version} · Open Source MIT`}</span>
          </div>

          <div className="space-y-5">
            <h1
              id="home-hero-heading"
              className="max-w-[20ch] font-display text-[clamp(2.25rem,4.2vw,3.85rem)] font-semibold tracking-[-0.035em] leading-[1.06] text-ink"
            >
              {t.hero.headline}
            </h1>
            <p className="max-w-[56ch] text-base leading-relaxed text-muted sm:text-lg">{t.hero.subheadline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionLink to={installHref} variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}>
              {t.hero.primaryCta}
            </ActionLink>
            <ActionLink to="/commands" variant="secondary">
              {t.hero.secondaryCta}
            </ActionLink>
          </div>

          <div className="max-w-2xl space-y-2 pt-1">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-[#0B0B0E] px-3.5 py-2 specular-surface">
              <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
                <span aria-hidden="true" className="hidden shrink-0 items-center gap-1.5 border-r border-hairline pr-3 sm:inline-flex">
                  <span className="size-2 rounded-full bg-white/[0.16]" />
                  <span className="size-2 rounded-full bg-white/[0.16]" />
                  <span className="size-2 rounded-full bg-white/[0.16]" />
                </span>
                <span aria-hidden="true" className="select-none font-mono text-xs text-subtle">$</span>
                <code
                  ref={heroCodeRef}
                  className="whitespace-nowrap font-mono text-[clamp(0.78rem,0.12vw+0.75rem,0.85rem)] leading-relaxed text-ink tabular-nums"
                >
                  {INSTALL_ALL_COMMAND}
                </code>
              </div>

              <button
                type="button"
                aria-label={`${t.common.copy}: ${INSTALL_ALL_COMMAND}`}
                onClick={() => {
                  void handleHeroCopy()
                }}
                className={clsx(
                  'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs leading-none font-medium transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  copied
                    ? 'border-accent/30 bg-accent/10 text-accent'
                    : 'border-hairline bg-white/[0.04] text-muted hover:bg-white/[0.08] hover:text-ink',
                )}
              >
                {copied ? <Check aria-hidden="true" className="size-3.5 text-accent" /> : <Copy aria-hidden="true" className="size-3.5" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>
            <div aria-live="polite" className="sr-only">
              {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
            </div>
            <p className="max-w-[56ch] text-xs leading-relaxed text-subtle">{t.hero.quickInstallCaption}</p>
          </div>
        </motion.div>
      </section>

      {/* Architectural Metric Bar */}
      <div className="mx-auto max-w-[74rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-y divide-hairline border-y border-hairline py-6 sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-6">
          {heroMetrics.map((metric, idx) => (
            <div key={metric.id} className={clsx('px-4 py-3 sm:py-1', idx === 0 && 'sm:pl-0')}>
              <div className="font-mono text-2xl leading-tight font-semibold text-ink tabular-nums">{metric.value}</div>
              <div className="mt-1 text-xs leading-snug text-muted">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 01. Launch Walkthrough */}
      <section aria-labelledby="home-trailer-heading" className="mx-auto max-w-[74rem] space-y-8 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {renderSectionHeader('01', 'home-trailer-heading', t.trailer.eyebrow, t.trailer.title, t.trailer.subtitle)}
        <TrailerPlayer />
      </section>

      {/* 02. Execution Topology */}
      <section aria-labelledby="home-swarm-heading" className="mx-auto max-w-[74rem] space-y-8 border-t border-hairline px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {renderSectionHeader('02', 'home-swarm-heading', t.swarm.eyebrow, t.swarm.title, t.swarm.subtitle)}
        <SwarmVisualizer />
      </section>

      {/* 03. CLI Compilers & Gates */}
      <section aria-labelledby="home-cli-heading" className="mx-auto max-w-[74rem] space-y-8 border-t border-hairline px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {renderSectionHeader('03', 'home-cli-heading', t.cliPlayground.eyebrow, t.cliPlayground.title, t.cliPlayground.subtitle)}
        <CliPlayground />
      </section>

      {/* 04. Supported IDEs Architectural Strip */}
      <section aria-labelledby="home-platforms-heading" className="mx-auto max-w-[74rem] space-y-8 border-t border-hairline px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          {renderSectionHeader('04', 'home-platforms-heading', t.platformsSection.eyebrow, t.platformsSection.title, t.platformsSection.subtitle)}
          <ActionLink
            to={installHref}
            variant="secondary"
            trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
            className="self-start sm:self-auto"
          >
            {t.nav.install}
          </ActionLink>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PLATFORMS.map((platform) => {
            const isSelected = platform.id === selectedPlatformId
            const displayName = platform.id === 'antigravity' ? 'Antigravity' : platform.name
            return (
              <button
                key={platform.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectPlatform(platform.id)}
                className={clsx(
                  'flex min-h-11 flex-col items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer specular-surface',
                  FOCUS_RING,
                  isSelected
                    ? 'border-line-strong bg-elevated text-ink'
                    : 'border-hairline bg-card/50 text-muted hover:border-line-strong hover:text-ink',
                )}
              >
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-ink">
                      {displayName}
                    </span>
                    <span className="font-mono text-[11px] text-subtle">
                      ~2.2 KB
                    </span>
                  </div>
                  <div className="text-xs text-subtle">
                    {platform.vendor}
                  </div>
                </div>

                <code className="w-full truncate rounded-md border border-hairline bg-[#070709] px-2.5 py-1.5 font-mono text-[11px] text-muted tabular-nums">
                  {platform.entryFile}
                </code>
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 pt-2 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <CopyCommandBar
              label={t.platformsSection.batchAllLabel}
              command={INSTALL_WITH_HOOKS_CMD}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
            />
          </div>
          <div className="lg:col-span-3">
            <ActionLink
              to={installHref}
              variant="primary"
              trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              className="w-full"
            >
              {t.hero.primaryCta}
            </ActionLink>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
