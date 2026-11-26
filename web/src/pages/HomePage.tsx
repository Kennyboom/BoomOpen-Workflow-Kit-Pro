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
import { INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { Dictionary } from '../i18n/types'
import type { Locale, PlatformId } from '../types/ui-contract'

/** Visual-first Cosmic Deep Space startup homepage: Hero + SVG Hub, 3D Crystal Bento, Metrics + Slash Dock, and Closing stage. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]'
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))
const HERO_COSMIC_GLOW = [
  'radial-gradient(ellipse 72% 48% at 50% -6%, rgba(56, 189, 248, 0.22), rgba(139, 92, 246, 0.14) 46%, transparent 78%)',
  'radial-gradient(ellipse 46% 32% at 50% 42%, rgba(99, 102, 241, 0.14), transparent 72%)',
].join(', ')

interface HomeSectionCopy {
  readonly topPillLead: string
  readonly topPillIdes: string
  readonly watchFilmCta: string
  readonly closeFilmAria: string
  readonly bentoEyebrow: string
  readonly bentoTitle: string
  readonly dockEyebrow: string
  readonly dockTitle: string
  readonly closingHeadline: string
  readonly closingPrimaryCta: string
}

const HOME_COPY: Record<Locale, HomeSectionCopy> = {
  en: {
    topPillLead: 'BoomOpen Workflow Kit v5.5',
    topPillIdes: '5 AI IDEs',
    watchFilmCta: 'Watch Film (90s)',
    closeFilmAria: 'Close walkthrough film dialog',
    bentoEyebrow: 'SUPERPOWERS',
    bentoTitle: 'Built different.',
    dockEyebrow: 'ECOSYSTEM',
    dockTitle: 'Built for real scale.',
    closingHeadline: 'Ready in 30 seconds.',
    closingPrimaryCta: 'Install Now',
  },
  vi: {
    topPillLead: 'BoomOpen Workflow Kit v5.5',
    topPillIdes: '5 AI IDEs',
    watchFilmCta: 'Xem video (90s)',
    closeFilmAria: 'Đóng cửa sổ video giới thiệu',
    bentoEyebrow: 'ĐỘC QUYỀN',
    bentoTitle: 'Sức mạnh độc quyền.',
    dockEyebrow: 'HỆ SINH THÁI',
    dockTitle: 'Quy mô thực chiến.',
    closingHeadline: 'Sẵn sàng trong 30 giây.',
    closingPrimaryCta: 'Cài đặt ngay',
  },
}

function isPlatformId(value: string | null): value is PlatformId {
  return value !== null && PLATFORM_ID_SET.has(value)
}

function EyebrowPill({ index, label }: { readonly index: string; readonly label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/[0.16] bg-white/[0.05] px-3.5 py-1.5 font-mono text-xs text-slate-300 backdrop-blur-md tabular-nums">
      <span className="font-semibold text-sky-400">{index}</span>
      <span aria-hidden="true" className="text-indigo-300/35">/</span>
      <span className="font-semibold uppercase tracking-[0.09em] text-slate-200">{label}</span>
    </div>
  )
}

function TrailerCinemaModal({
  open,
  title,
  closeAriaLabel,
  onClose,
}: {
  readonly open: boolean
  readonly title: string
  readonly closeAriaLabel: string
  readonly onClose: () => void
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
        className="fixed inset-0 border-0 bg-[#02040D]/80 backdrop-blur-lg cursor-default"
      />
      <div className="relative z-10 my-auto w-full max-w-5xl rounded-[28px] border border-indigo-200/[0.18] bg-[#090F24]/95 p-4 text-white shadow-[0_32px_90px_-16px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4 px-1">
          <h2 id="home-trailer-modal-title" className="font-display text-lg font-bold text-white sm:text-xl">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={closeAriaLabel}
            onClick={onClose}
            className={clsx(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-indigo-200/[0.16] bg-white/[0.06] text-slate-200 transition-colors hover:bg-white/[0.12] hover:text-white cursor-pointer',
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

function HeroStage({
  t,
  copy,
  installHref,
  selectedPlatformId,
  reduceMotion,
  onOpenFilm,
  filmButtonRef,
}: {
  readonly t: Dictionary
  readonly copy: HomeSectionCopy
  readonly installHref: string
  readonly selectedPlatformId: PlatformId | null
  readonly reduceMotion: boolean
  readonly onOpenFilm: () => void
  readonly filmButtonRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden border-b border-indigo-200/[0.10]"
      style={{ backgroundImage: HERO_COSMIC_GLOW }}
    >
      {/* Celestial Aurora Crown & Planetary Horizon Rim Behind Hero */}
      <div
        aria-hidden="true"
        className="cosmic-core-pulse pointer-events-none absolute top-10 left-1/2 h-[320px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/22 to-purple-500/20 blur-[95px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[390px] left-1/2 h-[520px] w-[1380px] -translate-x-1/2 rounded-[100%] border-t border-sky-300/25 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.16),rgba(139,92,246,0.08)_38%,transparent_68%)] shadow-[0_-24px_80px_-12px_rgba(56,189,248,0.22)]"
      />

      <div className="relative mx-auto max-w-[90rem] px-4 pt-12 pb-18 sm:px-6 lg:px-10 lg:pt-20 lg:pb-26">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Link
            to={installHref}
            className={clsx(
              'inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border border-indigo-200/[0.18] bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-slate-200 shadow-[0_0_24px_-6px_rgba(56,189,248,0.28)] backdrop-blur-xl transition-colors duration-150 motion-reduce:transition-none hover:border-sky-300/40 hover:bg-white/[0.10] no-underline',
              FOCUS_RING,
            )}
          >
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
            <span className="shrink-0 font-semibold text-white">{copy.topPillLead}</span>
            <span aria-hidden="true" className="text-indigo-300/40">·</span>
            <span className="truncate text-xs text-slate-300 sm:text-sm">{copy.topPillIdes}</span>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-sky-400" />
          </Link>

          <h1
            id="home-hero-heading"
            className="hero-display-gradient mx-auto mt-7 max-w-[16ch] pb-1 text-center font-display text-[clamp(2.9rem,5.4vw,5.25rem)] leading-[1.15] font-bold tracking-[-0.04em]"
          >
            {t.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-[52ch] text-center text-lg leading-relaxed text-slate-300 sm:text-xl">
            {t.hero.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <ActionLink
              to={installHref}
              variant="primary"
              trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              className="px-7"
            >
              {t.hero.primaryCta}
            </ActionLink>
            <button
              ref={filmButtonRef}
              type="button"
              onClick={onOpenFilm}
              className={clsx(
                'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-indigo-200/[0.18] bg-white/[0.06] px-7 py-3 text-base font-semibold text-white backdrop-blur-xl transition-all duration-150 motion-reduce:transition-none hover:border-sky-300/40 hover:bg-white/[0.12] cursor-pointer',
                FOCUS_RING,
              )}
            >
              <Play aria-hidden="true" className="size-4 fill-sky-400 text-sky-400" />
              <span>{copy.watchFilmCta}</span>
            </button>
          </div>

          <div className="mx-auto mt-7 w-full max-w-4xl text-left">
            <CopyCommandBar
              compact
              command={INSTALL_ALL_COMMAND}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
            />
          </div>
        </motion.div>

        <div className="mt-14">
          <StudioHeroShowcase selectedPlatformId={selectedPlatformId} />
        </div>
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
        t={t}
        copy={copy}
        installHref={installHref}
        selectedPlatformId={selectedPlatformId}
        reduceMotion={Boolean(reduceMotion)}
        onOpenFilm={() => setIsFilmOpen(true)}
        filmButtonRef={filmButtonRef}
      />

      <TrailerCinemaModal
        open={isFilmOpen}
        title={t.trailer.title}
        closeAriaLabel={copy.closeFilmAria}
        onClose={handleCloseFilm}
      />

      <section aria-labelledby="home-bento-heading" className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="space-y-4">
          <EyebrowPill index="01" label={copy.bentoEyebrow} />
          <h2
            id="home-bento-heading"
            className="hero-display-gradient pb-1 font-display text-[clamp(2.35rem,3.8vw,3.4rem)] leading-[1.15] font-bold tracking-[-0.035em]"
          >
            {copy.bentoTitle}
          </h2>
        </div>
        <div className="mt-12 lg:mt-14">
          <FeatureBento />
        </div>
      </section>

      <section aria-labelledby="home-lifecycle-heading" className="border-t border-indigo-200/[0.10]">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="space-y-4">
            <EyebrowPill index="02" label={copy.dockEyebrow} />
            <h2
              id="home-lifecycle-heading"
              className="hero-display-gradient pb-1 font-display text-[clamp(2.35rem,3.8vw,3.4rem)] leading-[1.15] font-bold tracking-[-0.035em]"
            >
              {copy.dockTitle}
            </h2>
          </div>
          <div className="mt-12 lg:mt-14">
            <HomeTerminalPreview />
          </div>
        </div>
      </section>

      <section aria-labelledby="home-closing-heading" className="border-t border-indigo-200/[0.10]">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
          <div
            className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-indigo-200/[0.18] bg-[#060A1B]/72 shadow-[0_32px_80px_-18px_rgba(2,4,16,0.85),0_0_60px_-20px_rgba(56,189,248,0.20)] backdrop-blur-md"
          >
            <div className="p-10 text-center sm:p-16">
              <h2
                id="home-closing-heading"
                className="hero-display-gradient mx-auto pb-1 font-display text-[clamp(2.35rem,4vw,3.45rem)] leading-[1.15] font-bold tracking-[-0.035em]"
              >
                {copy.closingHeadline}
              </h2>

              <div className="mx-auto mt-8 max-w-3xl text-left">
                <CopyCommandBar
                  compact
                  command={INSTALL_ALL_COMMAND}
                  copyLabel={t.common.copy}
                  copiedLabel={t.common.copied}
                  manualCopyHint={t.common.copyManualHint}
                />
              </div>

              <div className="mt-8 flex justify-center">
                <ActionLink
                  to={installHref}
                  variant="primary"
                  trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                  className="px-8"
                >
                  {copy.closingPrimaryCta}
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
