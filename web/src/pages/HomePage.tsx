import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Play, X } from 'lucide-react'
import { FeatureBento } from '../components/home/FeatureBento'
import { HomeTerminalPreview } from '../components/home/HomeTerminalPreview'
import { StudioHeroShowcase } from '../components/home/StudioHeroShowcase'
import { TrailerPlayer } from '../components/home/TrailerPlayer'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { Dictionary } from '../i18n/types'
import type { Locale, PlatformId } from '../types/ui-contract'

/** Studio Daylight 4-section homepage: Hero + StudioHeroShowcase, Bento, Lifecycle, and Closing stage. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))
const HERO_DAYLIGHT_GLOW =
  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.03) 48%, transparent 76%)'

interface HomeSectionCopy {
  readonly topPillLead: string; readonly topPillIdes: string
  readonly watchFilmCta: string; readonly closeFilmAria: string; readonly worksWithLabel: string
  readonly statWorkflows: string; readonly statAgents: string; readonly statTeams: string; readonly statSkills: string
  readonly bentoEyebrow: string; readonly bentoTitle: string
  readonly lifecycleEyebrow: string; readonly lifecycleTitle: string; readonly lifecycleLinkLabel: string
  readonly closingHeadline: string; readonly closingSubline: string
  readonly closingPrimaryCta: string; readonly closingSecondaryCta: string
}

const HOME_COPY: Record<Locale, HomeSectionCopy> = {
  en: {
    topPillLead: 'BoomOpen v5.5', topPillIdes: 'Antigravity · Claude Code · Codex · Cursor · Copilot',
    watchFilmCta: 'Watch 90s Film', closeFilmAria: 'Close walkthrough film dialog', worksWithLabel: 'Works natively with',
    statWorkflows: 'Workflows', statAgents: 'Specialist Agents', statTeams: 'Review Teams', statSkills: 'Domain Skills',
    bentoEyebrow: 'UNIQUE CAPABILITIES', bentoTitle: 'Capabilities no standalone AI IDE ships with.',
    lifecycleEyebrow: '36 END-TO-END WORKFLOWS', lifecycleTitle: 'Every workflow from idea to release.',
    lifecycleLinkLabel: 'Browse all 36 workflows',
    closingHeadline: 'Install once. Supercharge all 5 AI IDEs.',
    closingSubline: 'Works seamlessly across Antigravity, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot. Open source MIT.',
    closingPrimaryCta: 'Install Now', closingSecondaryCta: 'View Architecture',
  },
  vi: {
    topPillLead: 'BoomOpen v5.5', topPillIdes: 'Antigravity · Claude Code · Codex · Cursor · Copilot',
    watchFilmCta: 'Xem video giới thiệu (90s)', closeFilmAria: 'Đóng cửa sổ video giới thiệu', worksWithLabel: 'Tương thích gốc với',
    statWorkflows: 'Lệnh quy trình', statAgents: 'Chuyên gia AI', statTeams: 'Đội phản biện', statSkills: 'Kỹ năng chuyên sâu',
    bentoEyebrow: 'SỨC MẠNH KHÁC BIỆT', bentoTitle: 'Những khả năng không AI IDE đơn lẻ nào có sẵn.',
    lifecycleEyebrow: '36 QUY TRÌNH THỰC CHIẾN', lifecycleTitle: 'Trọn vòng đời từ ý tưởng đến phát hành.',
    lifecycleLinkLabel: 'Xem toàn bộ 36 lệnh',
    closingHeadline: 'Cài một lần. Nâng tầm cả 5 AI IDE.',
    closingSubline: 'Hoạt động đồng bộ trên Antigravity, Claude Code, OpenAI Codex, Cursor và GitHub Copilot. Mã nguồn mở MIT.',
    closingPrimaryCta: 'Cài đặt ngay', closingSecondaryCta: 'Xem kiến trúc',
  },
}

function isPlatformId(value: string | null): value is PlatformId {
  return value !== null && PLATFORM_ID_SET.has(value)
}

function EyebrowPill({ index, label }: { readonly index: string; readonly label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-600 shadow-2xs tabular-nums">
      <span className="font-semibold text-blue-600">{index}</span>
      <span aria-hidden="true" className="text-slate-300">/</span>
      <span className="font-semibold uppercase tracking-[0.09em] text-slate-700">{label}</span>
    </div>
  )
}

function TrailerCinemaModal({
  open, title, closeAriaLabel, onClose,
}: {
  readonly open: boolean; readonly title: string; readonly closeAriaLabel: string; readonly onClose: () => void
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-trailer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeAriaLabel}
        onClick={onClose}
        className="fixed inset-0 border-0 bg-slate-950/65 backdrop-blur-md cursor-default"
      />
      <div className="relative z-10 my-auto w-full max-w-5xl rounded-[28px] border border-slate-200/90 bg-white p-4 shadow-[0_32px_90px_-16px_rgba(15,23,42,0.45)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 px-1">
          <h2 id="home-trailer-modal-title" className="font-display text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={closeAriaLabel}
            onClick={onClose}
            className={clsx(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 cursor-pointer',
              FOCUS_RING,
            )}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <TrailerPlayer />
      </div>
    </div>
  )
}

function EcosystemMetricsStrip({ copy, selectedPlatformId }: { readonly copy: HomeSectionCopy; readonly selectedPlatformId: PlatformId | null }) {
  const stats = [
    { value: formatCount(KIT_STATS.commands.length), label: copy.statWorkflows },
    { value: formatCount(KIT_STATS.agents), label: copy.statAgents },
    { value: formatCount(KIT_STATS.teams), label: copy.statTeams },
    { value: formatCount(KIT_STATS.skills), label: copy.statSkills },
  ] as const

  return (
    <div className="mt-12 border-t border-slate-200/80 pt-10">
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <span className="mr-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{copy.worksWithLabel}</span>
        {PLATFORMS.map((platform) => {
          const displayName = platform.id === 'antigravity' ? 'Antigravity' : platform.name
          const isSelected = selectedPlatformId === platform.id
          return (
            <Link
              key={platform.id}
              to={`/install?tool=${platform.id}`}
              className={clsx(
                'inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 motion-reduce:transition-none no-underline',
                FOCUS_RING,
                isSelected
                  ? 'border-blue-300 bg-blue-50 font-semibold text-blue-700'
                  : 'border-slate-200/90 bg-white text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {displayName}
            </Link>
          )
        })}
      </div>

      <div className="mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-6 text-center sm:grid-cols-4 sm:gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1.5">
            <div className="font-display text-[32px] leading-none font-bold tracking-[-0.035em] text-[#09090B] tabular-nums sm:text-[38px]">{stat.value}</div>
            <div className="text-sm font-medium text-[#64748B]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroStage({
  t, copy, installHref, selectedPlatformId, reduceMotion, onOpenFilm, filmButtonRef,
}: {
  readonly t: Dictionary; readonly copy: HomeSectionCopy; readonly installHref: string
  readonly selectedPlatformId: PlatformId | null; readonly reduceMotion: boolean
  readonly onOpenFilm: () => void; readonly filmButtonRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <section aria-labelledby="home-hero-heading" className="relative overflow-hidden border-b border-slate-200/80" style={{ backgroundImage: HERO_DAYLIGHT_GLOW }}>
      <div className="relative mx-auto max-w-[90rem] px-4 pt-12 pb-16 sm:px-6 lg:px-10 lg:pt-20 lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Link
            to={installHref}
            className={clsx(
              'inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-2xs transition-colors duration-150 motion-reduce:transition-none hover:border-slate-300 hover:bg-white no-underline',
              FOCUS_RING,
            )}
          >
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-blue-600" />
            <span className="shrink-0 font-semibold text-slate-900">{copy.topPillLead}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="truncate text-xs text-slate-600 sm:text-sm">{copy.topPillIdes}</span>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-blue-600" />
          </Link>

          <h1 id="home-hero-heading" className="hero-display-gradient mx-auto mt-7 max-w-[18ch] text-center font-display text-[clamp(2.85rem,5.2vw,5rem)] leading-[1.05] font-bold tracking-[-0.04em]">
            {t.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-[56ch] text-center text-lg leading-relaxed text-slate-600 sm:text-xl">{t.hero.subheadline}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <ActionLink to={installHref} variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />} className="px-7">
              {t.hero.primaryCta}
            </ActionLink>
            <button
              ref={filmButtonRef}
              type="button"
              onClick={onOpenFilm}
              className={clsx(
                'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-slate-200/90 bg-white px-7 py-3 text-base font-semibold text-slate-900 shadow-2xs transition-all duration-150 motion-reduce:transition-none hover:border-slate-300 hover:bg-slate-50 cursor-pointer',
                FOCUS_RING,
              )}
            >
              <Play aria-hidden="true" className="size-4 fill-blue-600 text-blue-600" />
              <span>{copy.watchFilmCta}</span>
            </button>
            <ActionLink to="/commands" variant="ghost" trailingIcon={<ArrowRight aria-hidden="true" className="size-4 text-slate-500" />} className="border border-slate-200/80 bg-slate-100/85 text-slate-700 hover:bg-slate-200/70">
              {t.hero.secondaryCta}
            </ActionLink>
          </div>

          <div className="mx-auto mt-7 w-full max-w-4xl text-left">
            <CopyCommandBar command={INSTALL_ALL_COMMAND} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
          </div>
        </motion.div>

        <div className="mt-14">
          <StudioHeroShowcase />
        </div>

        <EcosystemMetricsStrip copy={copy} selectedPlatformId={selectedPlatformId} />
      </div>
    </section>
  )
}

export function HomePage() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams] = useSearchParams()
  const [isFilmOpen, setIsFilmOpen] = useState<boolean>(false)
  const filmButtonRef = useRef<HTMLButtonElement | null>(null)

  const rawTool = searchParams.get('tool')
  const selectedPlatformId: PlatformId | null = isPlatformId(rawTool) ? rawTool : null
  const installHref = selectedPlatformId ? `/install?tool=${selectedPlatformId}` : '/install'
  const copy = HOME_COPY[locale]

  const handleCloseFilm = () => {
    setIsFilmOpen(false)
    requestAnimationFrame(() => filmButtonRef.current?.focus())
  }

  return (
    <div className="min-h-dvh">
      <SEO routeId="home" />
      <HeroStage
        t={t} copy={copy} installHref={installHref} selectedPlatformId={selectedPlatformId}
        reduceMotion={Boolean(reduceMotion)} onOpenFilm={() => setIsFilmOpen(true)} filmButtonRef={filmButtonRef}
      />

      <TrailerCinemaModal open={isFilmOpen} title={t.trailer.title} closeAriaLabel={copy.closeFilmAria} onClose={handleCloseFilm} />

      <section aria-labelledby="home-bento-heading" className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="space-y-4">
          <EyebrowPill index="01" label={copy.bentoEyebrow} />
          <h2 id="home-bento-heading" className="max-w-[22ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-[#09090B]">
            {copy.bentoTitle}
          </h2>
        </div>
        <div className="mt-12 lg:mt-14">
          <FeatureBento />
        </div>
      </section>

      <section aria-labelledby="home-lifecycle-heading" className="border-t border-slate-200/80">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="space-y-4">
              <EyebrowPill index="02" label={copy.lifecycleEyebrow} />
              <h2 id="home-lifecycle-heading" className="max-w-[22ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-[#09090B]">
                {copy.lifecycleTitle}
              </h2>
            </div>
            <ActionLink to="/commands" variant="secondary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4 text-blue-600" />} className="min-h-11 self-start px-5 py-2.5 text-sm sm:self-auto">
              {copy.lifecycleLinkLabel}
            </ActionLink>
          </div>
          <div className="mt-12 lg:mt-14">
            <HomeTerminalPreview />
          </div>
        </div>
      </section>

      <section aria-labelledby="home-closing-heading" className="border-t border-slate-200/80">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
          <div
            className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/90 bg-[#EEF2F8] bg-cover bg-center shadow-[0_24px_64px_-16px_rgba(15,23,42,0.10)]"
            style={{ backgroundImage: "url('/assets/studio-canvas.jpg')" }}
          >
            <div className="bg-white/82 p-10 text-center backdrop-blur-xl sm:p-16">
              <h2 id="home-closing-heading" className="hero-display-gradient mx-auto max-w-[20ch] font-display text-[clamp(2.35rem,4vw,3.35rem)] leading-[1.06] font-bold tracking-[-0.035em]">
                {copy.closingHeadline}
              </h2>
              <p className="mx-auto mt-4 max-w-[60ch] text-lg leading-relaxed text-slate-600">{copy.closingSubline}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <ActionLink to={installHref} variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />} className="px-7">
                  {copy.closingPrimaryCta}
                </ActionLink>
                <ActionLink to="/architecture" variant="secondary" className="px-7">
                  {copy.closingSecondaryCta}
                </ActionLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
