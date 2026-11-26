import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, FolderGit2 } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale, PlatformId } from '../../types/ui-contract'

/**
 * Pure visual animated SVG + frosted-glass Multi-AI Hub over `/assets/studio-canvas.jpg`:
 * Left `docs/` glass node -> Center `BoomOpen Core` concentric rings -> Right 5 clickable AI IDE nodes.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

interface StudioHeroShowcaseProps {
  readonly selectedPlatformId?: PlatformId | null
}

interface IdeNodeSpec {
  readonly id: PlatformId
  readonly label: string
  readonly beamPath: string
  readonly portY: number
  readonly accentRing: string
}

const INPUT_BEAM_PATH = 'M 204 190 C 292 190, 326 190, 412 190'
const INPUT_FILAMENT_TOP = 'M 204 182 C 286 182, 330 187, 412 190'
const INPUT_FILAMENT_BOTTOM = 'M 204 198 C 286 198, 330 193, 412 190'

const IDE_NODES: readonly IdeNodeSpec[] = [
  {
    id: 'antigravity',
    label: 'Antigravity',
    beamPath: 'M 588 190 C 668 190, 690 58, 768 58',
    portY: 58,
    accentRing: 'border-blue-200/90 bg-blue-50 text-blue-600',
  },
  {
    id: 'claude',
    label: 'Claude Code',
    beamPath: 'M 588 190 C 664 190, 694 124, 768 124',
    portY: 124,
    accentRing: 'border-amber-200/90 bg-amber-50 text-amber-700',
  },
  {
    id: 'codex',
    label: 'OpenAI Codex',
    beamPath: 'M 588 190 C 660 190, 700 190, 768 190',
    portY: 190,
    accentRing: 'border-emerald-200/90 bg-emerald-50 text-emerald-700',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    beamPath: 'M 588 190 C 664 190, 694 256, 768 256',
    portY: 256,
    accentRing: 'border-slate-300/90 bg-slate-100 text-slate-900',
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    beamPath: 'M 588 190 C 668 190, 690 322, 768 322',
    portY: 322,
    accentRing: 'border-sky-200/90 bg-sky-50 text-sky-700',
  },
]

const ORBITAL_BADGES = [
  { label: '/autopilot', dotClass: 'bg-blue-600', positionClass: '-top-2.5 left-1 sm:left-2' },
  { label: '100% Spec', dotClass: 'bg-emerald-500', positionClass: '-top-2.5 right-1 sm:right-2' },
  { label: '/conduct', dotClass: 'bg-amber-500', positionClass: '-bottom-2.5 left-2 sm:left-3' },
  { label: '/audit', dotClass: 'bg-sky-500', positionClass: '-bottom-2.5 right-2 sm:right-3' },
] as const

const DOCS_SUBLABEL: Record<Locale, string> = {
  vi: 'Tài liệu dự án',
  en: 'Specs & PRD',
}

function IdeMonogram({ id }: { readonly id: PlatformId }) {
  if (id === 'antigravity') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
        <path d="M10 2.2 12.2 7.8 17.8 10 12.2 12.2 10 17.8 7.8 12.2 2.2 10 7.8 7.8Z" />
      </svg>
    )
  }
  if (id === 'claude') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 stroke-current" fill="none" strokeWidth="1.9" strokeLinecap="round">
        <path d="M10 2.8v14.4M2.8 10h14.4M4.9 4.9l10.2 10.2M15.1 4.9 4.9 15.1" />
      </svg>
    )
  }
  if (id === 'codex') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 stroke-current" fill="none" strokeWidth="1.8" strokeLinejoin="round">
        <polygon points="10,2.4 16.6,6.2 16.6,13.8 10,17.6 3.4,13.8 3.4,6.2" />
        <circle cx="10" cy="10" r="2.3" className="fill-current stroke-none" />
      </svg>
    )
  }
  if (id === 'cursor') {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
        <path d="M4 3.2 16.6 9.6 10.8 11.4 8.6 17.2Z" />
      </svg>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 stroke-current" fill="none" strokeWidth="1.8">
      <rect x="3" y="5.5" width="6" height="9" rx="3" />
      <rect x="11" y="5.5" width="6" height="9" rx="3" />
    </svg>
  )
}

function MobileBeamConnector({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <div aria-hidden="true" className="flex justify-center py-1 lg:hidden">
      <svg viewBox="0 0 24 44" className="h-10 w-6 overflow-visible">
        <path d="M12 2v40" stroke="rgba(37,99,235,0.22)" strokeWidth="1.75" strokeLinecap="round" />
        {!reduceMotion && (
          <motion.path
            d="M12 2v40"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0.28, pathOffset: 0, opacity: 0 }}
            animate={{ pathOffset: [0, 0.72], opacity: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <circle cx="12" cy="4" r="3" fill="#2563EB" />
        <circle cx="12" cy="40" r="3" fill="#2563EB" />
      </svg>
    </div>
  )
}

function DesktopOrbitalSvg({ reduceMotion }: { readonly reduceMotion: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 380"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden size-full lg:block"
    >
      <defs>
        <linearGradient id="boomopen-beam-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#2563EB" stopOpacity="1" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <path d={INPUT_FILAMENT_TOP} fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="1.2" />
      <path d={INPUT_FILAMENT_BOTTOM} fill="none" stroke="rgba(37,99,235,0.12)" strokeWidth="1.2" />
      <path d={INPUT_BEAM_PATH} fill="none" stroke="rgba(37,99,235,0.24)" strokeWidth="1.8" />

      {!reduceMotion ? (
        <motion.path
          d={INPUT_BEAM_PATH}
          fill="none"
          stroke="url(#boomopen-beam-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0.3, pathOffset: 0, opacity: 0 }}
          animate={{ pathOffset: [0, 0.7], opacity: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <path d={INPUT_BEAM_PATH} fill="none" stroke="url(#boomopen-beam-glow)" strokeWidth="2.4" opacity="0.65" />
      )}

      {IDE_NODES.map((node, index) => (
        <g key={node.id}>
          <path d={node.beamPath} fill="none" stroke="rgba(37,99,235,0.2)" strokeWidth="1.6" />
          {!reduceMotion ? (
            <motion.path
              d={node.beamPath}
              fill="none"
              stroke="url(#boomopen-beam-glow)"
              strokeWidth="2.6"
              strokeLinecap="round"
              initial={{ pathLength: 0.26, pathOffset: 0, opacity: 0 }}
              animate={{ pathOffset: [0, 0.74], opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, delay: 0.28 + index * 0.18, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <path d={node.beamPath} fill="none" stroke="url(#boomopen-beam-glow)" strokeWidth="2" opacity="0.55" />
          )}
          <circle cx="768" cy={node.portY} r="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
        </g>
      ))}

      <circle cx="204" cy="190" r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.2" />
      <circle cx="412" cy="190" r="4.5" fill="#2563EB" />
      <circle cx="588" cy="190" r="4.5" fill="#2563EB" />
    </svg>
  )
}

export function StudioHeroShowcase({ selectedPlatformId = null }: StudioHeroShowcaseProps) {
  const { locale } = useLanguage()
  const reduceMotion = Boolean(useReducedMotion())

  return (
    <div
      className="relative overflow-hidden rounded-[36px] border border-slate-200/80 bg-[#EEF2F8] bg-cover bg-center p-6 shadow-[0_32px_80px_-20px_rgba(15,23,42,0.12)] sm:p-10 lg:p-14"
      style={{ backgroundImage: "url('/assets/studio-canvas.jpg')" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/14" />

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-white/90 bg-white/75 px-6 py-10 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.10), rgba(14, 165, 233, 0.04) 42%, transparent 70%)',
          }}
        />

        <div className="relative lg:grid lg:min-h-[380px] lg:grid-cols-[204px_1fr_232px] lg:items-center">
          <DesktopOrbitalSvg reduceMotion={reduceMotion} />

          {/* Left Node: docs/ */}
          <div className="relative z-10 mx-auto w-full max-w-[210px] lg:mx-0">
            <div className="flex flex-col items-center rounded-3xl border border-white/95 bg-white/92 px-5 py-6 text-center shadow-[0_18px_40px_-14px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <span className="inline-flex size-13 items-center justify-center rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50 to-white text-blue-600 shadow-2xs">
                <FolderGit2 aria-hidden="true" className="size-6" />
              </span>
              <span className="mt-3.5 font-mono text-lg font-bold tracking-tight text-slate-950">docs/</span>
              <span className="mt-1 text-xs font-semibold text-slate-500">{DOCS_SUBLABEL[locale]}</span>
            </div>
          </div>

          <MobileBeamConnector reduceMotion={reduceMotion} />

          {/* Center Hub: Sculptural Concentric Glass Rings + 4 Capability Badges */}
          <div className="relative z-10 flex items-center justify-center py-2 lg:py-0">
            <div className="relative flex size-56 items-center justify-center sm:size-64">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-blue-200/60 bg-gradient-to-b from-white/70 via-blue-50/35 to-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-4 rounded-full border border-dashed border-blue-300/60"
              />

              <div className="relative flex size-36 flex-col items-center justify-center gap-2 rounded-full border border-white bg-white/95 shadow-[0_24px_56px_-12px_rgba(37,99,235,0.24),inset_0_1px_2px_rgba(255,255,255,1)] sm:size-44">
                <img
                  src="/assets/logo.webp"
                  alt="BoomOpen Core"
                  width={56}
                  height={56}
                  className="size-12 rounded-2xl object-contain sm:size-14"
                />
                <span className="font-display text-xs font-bold tracking-tight text-slate-950 sm:text-[13px]">
                  BoomOpen Core
                </span>
              </div>

              {ORBITAL_BADGES.map((badge) => (
                <span
                  key={badge.label}
                  className={clsx(
                    'absolute inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1 font-mono text-[11px] font-semibold text-slate-800 shadow-[0_10px_22px_-8px_rgba(15,23,42,0.14)] backdrop-blur-md sm:text-xs',
                    badge.positionClass,
                  )}
                >
                  <span aria-hidden="true" className={clsx('size-1.5 rounded-full', badge.dotClass)} />
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>

          <MobileBeamConnector reduceMotion={reduceMotion} />

          {/* Right Fan-Out: 5 Clickable Glass IDE Pills */}
          <div className="relative z-10 mx-auto flex w-full max-w-xs flex-col gap-3 lg:mx-0 lg:max-w-none">
            {IDE_NODES.map((ide) => {
              const isSelected = selectedPlatformId === ide.id
              return (
                <Link
                  key={ide.id}
                  to={`/install?tool=${ide.id}`}
                  className={clsx(
                    'group flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-3.5 py-2 transition-all duration-200 motion-reduce:transition-none no-underline',
                    FOCUS_RING,
                    isSelected
                      ? 'border-blue-400 bg-blue-50/95 text-blue-950 shadow-[0_12px_28px_-10px_rgba(37,99,235,0.25)]'
                      : 'border-white/95 bg-white/92 text-slate-900 shadow-[0_10px_24px_-10px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-[0_16px_32px_-10px_rgba(37,99,235,0.18)] motion-reduce:hover:translate-y-0',
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <span className={clsx('inline-flex size-8 shrink-0 items-center justify-center rounded-xl border', ide.accentRing)}>
                      <IdeMonogram id={ide.id} />
                    </span>
                    <span className="truncate font-display text-sm font-semibold">{ide.label}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 motion-reduce:transition-none"
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
