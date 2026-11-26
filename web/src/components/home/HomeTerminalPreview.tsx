import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { KIT_STATS, formatCount } from '../../data/kitStats'
import { useLanguage } from '../../i18n/context'
import type { DockCommandKey } from '../../i18n/types'

/**
 * Cosmic Startup Metrics Stage (4 sculptural tabular counters) + Interactive 12-Command Slash Dock.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'

interface DockCommandItem {
  readonly slash: string
  readonly key: DockCommandKey
}

const FLAGSHIP_COMMANDS: readonly DockCommandItem[] = [
  { slash: '/autopilot', key: 'autopilot' },
  { slash: '/cook:team', key: 'cook' },
  { slash: '/conduct', key: 'conduct' },
  { slash: '/audit', key: 'audit' },
  { slash: '/plan:hard', key: 'plan' },
  { slash: '/design:hard', key: 'design' },
  { slash: '/onboard', key: 'onboard' },
  { slash: '/debug:team', key: 'debug' },
  { slash: '/pr:review', key: 'pr' },
  { slash: '/release', key: 'release' },
  { slash: '/research:team', key: 'research' },
  { slash: '/brainstorm:team', key: 'brainstorm' },
]

export function HomeTerminalPreview() {
  const { t } = useLanguage()
  const surface = t.homeSurface

  const metrics = [
    { value: formatCount(KIT_STATS.platforms), label: surface.dockMetrics.ides, to: '/install' },
    { value: formatCount(KIT_STATS.commands.length), label: surface.dockMetrics.workflows, to: '/commands' },
    { value: formatCount(KIT_STATS.agents), label: surface.dockMetrics.agents, to: '/agents' },
    { value: formatCount(KIT_STATS.skills), label: surface.dockMetrics.skills, to: '/skills' },
  ] as const

  return (
    <div>
      {/* Top: 4 Giant Sculptural Startup Numbers */}
      <div className="mb-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.to}
            to={metric.to}
            className={clsx(
              'specular-surface group flex min-h-11 flex-col justify-between gap-3 rounded-[28px] border border-indigo-200/[0.14] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/35 hover:shadow-[0_22px_48px_-14px_rgba(56,189,248,0.20)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8 no-underline',
              FOCUS_RING,
            )}
          >
            <span className="hero-display-gradient pb-0.5 font-display text-5xl leading-[1.1] font-bold tracking-tight tabular-nums sm:text-6xl">
              {metric.value}
            </span>
            <span className="text-sm font-semibold text-slate-400 transition-colors group-hover:text-sky-300 sm:text-base">
              {metric.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom: Interactive Slash Command Dock */}
      <div className="specular-surface rounded-[32px] border border-indigo-200/[0.14] p-7 sm:p-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-2xl leading-[1.15] font-bold tracking-[-0.03em] text-white sm:text-[28px]">
            {surface.dockCardTitle}
          </h3>
          <Link
            to="/commands"
            className={clsx(
              'inline-flex min-h-11 items-center gap-2 rounded-full border border-indigo-200/[0.18] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors duration-150 hover:border-sky-300/35 hover:bg-white/[0.12] motion-reduce:transition-none no-underline',
              FOCUS_RING,
            )}
          >
            <span>{surface.dockViewAll}</span>
            <ArrowRight aria-hidden="true" className="size-4 text-sky-400" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FLAGSHIP_COMMANDS.map((item) => (
            <Link
              key={item.slash}
              to={`/commands?q=${encodeURIComponent(item.key)}`}
              className={clsx(
                'group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-indigo-200/[0.12] bg-[#070B19]/85 px-5 py-3 text-slate-100 transition-all duration-150 hover:border-sky-400/45 hover:bg-[#101A3B] hover:text-white hover:shadow-[0_10px_26px_-8px_rgba(56,189,248,0.25)] motion-reduce:transition-none no-underline',
                FOCUS_RING,
              )}
            >
              <span className="font-mono text-sm font-bold text-sky-300 transition-colors group-hover:text-white">
                {item.slash}
              </span>
              <span className="shrink-0 text-xs font-medium text-slate-400 transition-colors group-hover:text-sky-200">
                {surface.dockCommandTags[item.key]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
