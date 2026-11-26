import { useRef, useState } from 'react'
import { clsx } from 'clsx'
import { useReducedMotion } from 'framer-motion'
import { CheckCircle2, ExternalLink, Film, Play } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale, TrailerChapter } from '../../types/ui-contract'
import { ActionButton, ActionLink, InlineErrorState } from '../ui/Primitives'

/**
 * Studio Daylight cinema player for the 90-second 1080p HD walkthrough film:
 * pairs a crisp porcelain header and chapter bar with a pure bg-slate-950 video stage.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

interface ChapterSelection {
  readonly locale: Locale
  readonly seconds: number
  readonly label: string
}

function parseChapterParts(rawLabel: string): { readonly timestamp: string; readonly title: string } {
  const match = /^(\d{2}:\d{2})\s+(.+)$/.exec(rawLabel.trim())
  if (!match) {
    return { timestamp: '00:00', title: rawLabel }
  }
  return { timestamp: match[1], title: match[2] }
}

interface ChapterPillBarProps {
  readonly chapters: readonly TrailerChapter[]
  readonly chaptersLabel: string
  readonly activeSeconds: number | undefined
  readonly disabled: boolean
  readonly onSelectChapter: (seconds: number, label: string) => void
}

function ChapterPillBar({
  chapters,
  chaptersLabel,
  activeSeconds,
  disabled,
  onSelectChapter,
}: ChapterPillBarProps) {
  return (
    <div
      role="group"
      aria-label={chaptersLabel}
      className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap lg:gap-2.5"
    >
      {chapters.map((chapter) => {
        const isSelected = activeSeconds === chapter.seconds
        const { timestamp, title } = parseChapterParts(chapter.label)
        return (
          <button
            key={chapter.seconds}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onSelectChapter(chapter.seconds, chapter.label)}
            className={clsx(
              'inline-flex min-h-11 min-w-0 items-center gap-2 rounded-full border px-3.5 py-2 text-left text-xs transition-all duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 sm:text-[13px] cursor-pointer',
              FOCUS_RING,
              isSelected
                ? 'border-blue-200 bg-blue-50 font-semibold text-blue-800 shadow-2xs'
                : 'border-slate-200/80 bg-white font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <Play
              aria-hidden="true"
              className={clsx('size-3 shrink-0', isSelected ? 'fill-blue-600 text-blue-600' : 'text-slate-400')}
            />
            <span
              className={clsx(
                'shrink-0 font-mono text-[11px] tabular-nums',
                isSelected ? 'font-semibold text-blue-700' : 'text-slate-500',
              )}
            >
              {timestamp}
            </span>
            <span className="truncate">{title}</span>
          </button>
        )
      })}
    </div>
  )
}

export function TrailerPlayer() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  const [attempt, setAttempt] = useState<number>(0)
  const [failedStreamKey, setFailedStreamKey] = useState<string | null>(null)
  const [loadingStreamKey, setLoadingStreamKey] = useState<string | null>(null)
  const [manualPlayLocale, setManualPlayLocale] = useState<Locale | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<ChapterSelection | null>(null)

  const currentStreamKey = `${locale}:${attempt}`
  const hasStreamError = failedStreamKey === currentStreamKey
  const isBuffering = loadingStreamKey === currentStreamKey
  const activeChapter = selectedChapter?.locale === locale ? selectedChapter : null
  const showReducedMotionBanner = Boolean(reduceMotion) && manualPlayLocale !== locale && !hasStreamError

  const handlePlayStudioTrailer = () => {
    setManualPlayLocale(locale)
    const node = videoRef.current
    if (!node) return
    setLoadingStreamKey(currentStreamKey)
    try {
      const playPromise = node.play()
      if (playPromise) {
        void playPromise.catch(() => setLoadingStreamKey(null))
      }
    } catch {
      setLoadingStreamKey(null)
    }
  }

  const handleChapterJump = (seconds: number, label: string) => {
    setManualPlayLocale(locale)
    setSelectedChapter({ locale, seconds, label })
    const node = videoRef.current
    if (!node) return
    try {
      if (node.readyState >= 1) {
        pendingSeekRef.current = null
        node.currentTime = seconds
      } else {
        pendingSeekRef.current = seconds
      }
      const playPromise = node.play()
      if (playPromise) {
        void playPromise.catch(() => undefined)
      }
    } catch {
      pendingSeekRef.current = seconds
    }
  }

  const handleRetryStream = () => {
    setFailedStreamKey(null)
    setAttempt((prev) => prev + 1)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  return (
    <div className="mx-auto w-full max-w-[82rem]">
      <div className="hardware-bezel">
        <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="hidden items-center gap-1.5 sm:inline-flex">
                <span className="size-2.5 rounded-full bg-[#FF5F56]" />
                <span className="size-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="size-2.5 rounded-full bg-[#27C93F]" />
              </span>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Film aria-hidden="true" className="size-4 text-blue-600" />
                <span className="font-semibold text-slate-900">{t.trailer.localeBadge}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeChapter && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-xs font-semibold text-emerald-700">
                  <CheckCircle2 aria-hidden="true" className="size-3.5 text-emerald-600" />
                  <span>{`${t.trailer.chapterJumpedLabel}: ${activeChapter.label}`}</span>
                </span>
              )}
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 font-mono text-xs font-medium text-slate-600 tabular-nums">
                1920x1080 · H.264 HD
              </span>
            </div>
          </div>

          {hasStreamError ? (
            <div className="bg-white p-6 sm:p-8">
              <InlineErrorState
                title={t.trailer.errorTitle}
                message={t.trailer.errorBody}
                retryLabel={t.trailer.retryCta}
                onRetry={handleRetryStream}
              />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ActionLink
                  to={t.trailer.rawStreamUrl}
                  external
                  variant="primary"
                  icon={<Play aria-hidden="true" className="size-4" />}
                  trailingIcon={<ExternalLink aria-hidden="true" className="size-3.5" />}
                >
                  {t.trailer.openGithubStreamCta}
                </ActionLink>
                <ActionLink
                  to={t.trailer.media.fallbackUrl}
                  external
                  variant="secondary"
                  trailingIcon={<ExternalLink aria-hidden="true" className="size-3.5" />}
                >
                  {t.nav.githubLabel}
                </ActionLink>
              </div>
            </div>
          ) : (
            <div key={attempt} className="relative aspect-video w-full bg-slate-950">
              <video
                key={locale}
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster={t.trailer.media.posterSrc}
                src={t.trailer.media.videoSrc}
                aria-label={t.trailer.media.caption}
                onLoadStart={() => {
                  if (manualPlayLocale === locale) setLoadingStreamKey(currentStreamKey)
                }}
                onLoadedMetadata={() => {
                  if (pendingSeekRef.current !== null && videoRef.current) {
                    try {
                      videoRef.current.currentTime = pendingSeekRef.current
                    } catch {
                      // Ignore seek errors on constrained media decoders.
                    }
                    pendingSeekRef.current = null
                  }
                }}
                onLoadedData={() => setLoadingStreamKey(null)}
                onCanPlay={() => setLoadingStreamKey(null)}
                onPlaying={() => setLoadingStreamKey(null)}
                onError={() => {
                  setLoadingStreamKey(null)
                  setFailedStreamKey(currentStreamKey)
                }}
                className="size-full object-cover"
              >
                <a href={t.trailer.rawStreamUrl}>{t.trailer.openGithubStreamCta}</a>
              </video>

              {isBuffering && (
                <div
                  role="status"
                  aria-live="polite"
                  className="pointer-events-none absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-3.5 py-2 font-mono text-xs text-white animate-pulse motion-reduce:animate-none"
                >
                  <span aria-hidden="true" className="size-2 rounded-full bg-blue-500" />
                  <span>{t.trailer.loadingLabel}</span>
                </div>
              )}
            </div>
          )}

          {showReducedMotionBanner && (
            <div className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-4">
              <div className="max-w-prose text-sm leading-relaxed text-slate-600">{t.trailer.reducedMotionNotice}</div>
              <ActionButton variant="primary" icon={<Play aria-hidden="true" className="size-4" />} onClick={handlePlayStudioTrailer}>
                {t.trailer.playStudioCta}
              </ActionButton>
            </div>
          )}
        </div>
      </div>

      <ChapterPillBar
        chapters={t.trailer.media.chapters}
        chaptersLabel={t.trailer.chaptersLabel}
        activeSeconds={activeChapter?.seconds}
        disabled={hasStreamError}
        onSelectChapter={handleChapterJump}
      />

      <div aria-live="polite" className="sr-only">
        {activeChapter ? `${t.trailer.chapterJumpedLabel}: ${activeChapter.label}` : ''}
      </div>
    </div>
  )
}
