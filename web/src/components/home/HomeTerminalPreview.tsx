import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { KIT_STATS, formatCount } from '../../data/kitStats'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * Startup Metrics Stage (4 sculptural tabular counters) + Interactive 12-Command Slash Dock.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

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
              'group flex min-h-11 flex-col justify-between gap-3 rounded-[28px] border border-slate-200/85 bg-white p-7 shadow-[0_14px_36px_-14px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/90 hover:shadow-[0_20px_44px_-14px_rgba(37,99,235,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8 no-underline',
              FOCUS_RING,
            )}
          >
            <span className="font-display text-5xl leading-none font-bold tracking-tight text-slate-950 tabular-nums sm:text-6xl">
              {metric.value}
            </span>
            <span className="text-sm font-semibold text-slate-500 transition-colors group-hover:text-blue-600 sm:text-base">
              {metric.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom: Interactive Slash Command Dock */}
      <div className="rounded-[32px] border border-slate-200/85 bg-white p-7 shadow-[0_16px_44px_-12px_rgba(15,23,42,0.06)] sm:p-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-display text-2xl leading-tight font-bold tracking-[-0.03em] text-slate-950 sm:text-[28px]">
            {copy.dockTitle}
          </h3>
          <Link
            to="/commands"
            className={clsx(
              'inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-100 motion-reduce:transition-none no-underline',
              FOCUS_RING,
            )}
          >
            <span>{copy.viewAllLabel}</span>
            <ArrowRight aria-hidden="true" className="size-4 text-blue-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {FLAGSHIP_COMMANDS.map((item) => (
            <Link
              key={item.slash}
              to={`/commands?q=${encodeURIComponent(item.query)}`}
              className={clsx(
                'group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-5 py-3 text-slate-950 transition-all duration-150 hover:border-slate-950 hover:bg-slate-950 hover:text-white motion-reduce:transition-none no-underline',
                FOCUS_RING,
              )}
            >
              <span className="font-mono text-sm font-bold">{item.slash}</span>
              <span className="shrink-0 text-xs font-medium text-slate-500 transition-colors group-hover:text-slate-300">
                {item.tag[locale]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
