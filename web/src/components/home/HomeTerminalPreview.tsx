import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { KIT_STATS, formatCount } from '../../data/kitStats'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * Cosmic Startup Metrics Stage (4 sculptural tabular counters) + Interactive 12-Command Slash Dock.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'

interface DockCommandItem {
  readonly slash: string
  readonly query: string
  readonly tag: Record<Locale, string>
}

interface DockCopy {
  readonly statIdes: string
  readonly statWorkflows: string
  readonly statAgents: string
  readonly statSkills: string
  readonly dockTitle: string
  readonly viewAllLabel: string
}

const DOCK_COPY: Record<Locale, DockCopy> = {
  vi: {
    statIdes: 'AI IDEs',
    statWorkflows: 'Lệnh quy trình',
    statAgents: 'Chuyên gia AI',
    statSkills: 'Kỹ năng',
    dockTitle: '36 lệnh. Gõ là chạy.',
    viewAllLabel: 'Xem tất cả',
  },
  en: {
    statIdes: 'AI IDEs',
    statWorkflows: 'Workflows',
    statAgents: 'Sub-Agents',
    statSkills: 'Skills',
    dockTitle: '36 workflows. One slash away.',
    viewAllLabel: 'View all',
  },
}

const FLAGSHIP_COMMANDS: readonly DockCommandItem[] = [
  { slash: '/autopilot', query: 'autopilot', tag: { vi: 'Dự án lớn', en: 'Full project' } },
  { slash: '/cook:team', query: 'cook', tag: { vi: 'Code 3-Wave', en: '3-Wave build' } },
  { slash: '/conduct', query: 'conduct', tag: { vi: 'Hội đồng AI', en: 'AI council' } },
  { slash: '/audit', query: 'audit', tag: { vi: 'Bảo mật', en: 'Security' } },
  { slash: '/plan:hard', query: 'plan', tag: { vi: 'Kiến trúc', en: 'Architecture' } },
  { slash: '/design:hard', query: 'design', tag: { vi: 'Thiết kế UI', en: 'UI system' } },
  { slash: '/onboard', query: 'onboard', tag: { vi: 'Đọc repo', en: 'Map repo' } },
  { slash: '/debug:team', query: 'debug', tag: { vi: 'Săn bug khó', en: 'Deep debug' } },
  { slash: '/pr:review', query: 'pr', tag: { vi: 'Soi PR', en: 'PR review' } },
  { slash: '/release', query: 'release', tag: { vi: 'Phát hành', en: 'Ship release' } },
  { slash: '/research:team', query: 'research', tag: { vi: 'Nghiên cứu', en: 'Deep research' } },
  { slash: '/brainstorm:team', query: 'brainstorm', tag: { vi: 'Ý tưởng', en: 'Ideation' } },
]

export function HomeTerminalPreview() {
  const { locale } = useLanguage()
  const copy = DOCK_COPY[locale]

  const metrics = [
    { value: formatCount(KIT_STATS.platforms), label: copy.statIdes, to: '/install' },
    { value: formatCount(KIT_STATS.commands.length), label: copy.statWorkflows, to: '/commands' },
    { value: formatCount(KIT_STATS.agents), label: copy.statAgents, to: '/agents' },
    { value: formatCount(KIT_STATS.skills), label: copy.statSkills, to: '/skills' },
  ] as const

  return (
    <div>
      {/* Top: 4 Giant Sculptural Startup Numbers */}
      <div className="mb-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
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
            {copy.dockTitle}
          </h3>
          <Link
            to="/commands"
            className={clsx(
              'inline-flex min-h-11 items-center gap-2 rounded-full border border-indigo-200/[0.18] bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-slate-100 transition-colors duration-150 hover:border-sky-300/35 hover:bg-white/[0.12] motion-reduce:transition-none no-underline',
              FOCUS_RING,
            )}
          >
            <span>{copy.viewAllLabel}</span>
            <ArrowRight aria-hidden="true" className="size-4 text-sky-400" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FLAGSHIP_COMMANDS.map((item) => (
            <Link
              key={item.slash}
              to={`/commands?q=${encodeURIComponent(item.query)}`}
              className={clsx(
                'group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-indigo-200/[0.12] bg-[#070B19]/85 px-5 py-3 text-slate-100 transition-all duration-150 hover:border-sky-400/45 hover:bg-[#101A3B] hover:text-white hover:shadow-[0_10px_26px_-8px_rgba(56,189,248,0.25)] motion-reduce:transition-none no-underline',
                FOCUS_RING,
              )}
            >
              <span className="font-mono text-sm font-bold text-sky-300 transition-colors group-hover:text-white">
                {item.slash}
              </span>
              <span className="shrink-0 text-xs font-medium text-slate-400 transition-colors group-hover:text-sky-200">
                {item.tag[locale]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
