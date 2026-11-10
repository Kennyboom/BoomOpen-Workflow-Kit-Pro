import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useReducedMotion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Film, Play, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../../i18n/context';
import type { Locale } from '../../types/ui-contract';
import { ActionButton, ActionLink, InlineErrorState, StatusBadge, SurfaceCard } from '../ui/Primitives';

/**
 * Mission: studio-grade bilingual 1080p launch trailer player with trusted review controls,
 * prefers-reduced-motion calm poster mode, chapter seeking, and 1,462-skill ecosystem showcase.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

interface ChapterSelection {
  readonly locale: Locale;
  readonly seconds: number;
  readonly label: string;
}

export function TrailerPlayer() {
  const { locale, setLocale, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const [attempt, setAttempt] = useState<number>(0);
  const [failedStreamKey, setFailedStreamKey] = useState<string | null>(null);
  const [loadingStreamKey, setLoadingStreamKey] = useState<string | null>(null);
  const [manualPlayLocale, setManualPlayLocale] = useState<Locale | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterSelection | null>(null);

  const currentStreamKey = `${locale}:${attempt}`;
  const hasStreamError = failedStreamKey === currentStreamKey;
  const isBuffering = loadingStreamKey === currentStreamKey;
  const activeChapter = selectedChapter?.locale === locale ? selectedChapter : null;
  const showReducedMotionBanner = Boolean(reduceMotion) && manualPlayLocale !== locale && !hasStreamError;

  const handlePlayStudioTrailer = () => {
    setManualPlayLocale(locale);
    const node = videoRef.current;
    if (!node) {
      return;
    }
    setLoadingStreamKey(currentStreamKey);
    try {
      const playPromise = node.play();
      if (playPromise) {
        void playPromise.catch(() => {
          setLoadingStreamKey(null);
        });
      }
    } catch {
      setLoadingStreamKey(null);
    }
  };

  const handleChapterJump = (seconds: number, label: string) => {
    setManualPlayLocale(locale);
    setSelectedChapter({ locale, seconds, label });
    const node = videoRef.current;
    if (!node) {
      return;
    }
    try {
      if (node.readyState >= 1) {
        pendingSeekRef.current = null;
        node.currentTime = seconds;
      } else {
        pendingSeekRef.current = seconds;
      }
      const playPromise = node.play();
      if (playPromise) {
        void playPromise.catch(() => undefined);
      }
    } catch {
      pendingSeekRef.current = seconds;
    }
  };

  const handleRetryStream = () => {
    setFailedStreamKey(null);
    setAttempt((prev) => prev + 1);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-hairline bg-card p-1.5 specular-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="amber">
              <Film aria-hidden="true" className="size-3.5" />
              <span>{t.trailer.localeBadge}</span>
            </StatusBadge>
            <span className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-muted tabular-nums">
              1920x1080 • H.264 Studio Audio
            </span>
          </div>

          <div
            role="group"
            aria-label={t.nav.langToggleAria}
            className="inline-flex items-center gap-1 rounded-[10px] border border-hairline bg-canvas p-1"
          >
            {(['en', 'vi'] as const).map((targetLocale) => {
              const isActive = locale === targetLocale;
              return (
                <button
                  key={targetLocale}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setLocale(targetLocale)}
                  className={clsx(
                    'inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-3 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none tracking-widest transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    isActive
                      ? 'bg-primary text-primary-ink font-semibold'
                      : 'bg-transparent text-muted hover:text-ink font-normal',
                  )}
                >
                  <Volume2 aria-hidden="true" className="size-3.5" />
                  <span>{targetLocale.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {hasStreamError ? (
          <div className="rounded-[10px] border border-hairline bg-canvas p-4 sm:p-6">
            <InlineErrorState
              title={t.trailer.errorTitle}
              message={t.trailer.errorBody}
              retryLabel={t.trailer.retryCta}
              onRetry={handleRetryStream}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
          <div key={attempt} className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-hairline bg-canvas">
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
                if (manualPlayLocale === locale) {
                  setLoadingStreamKey(currentStreamKey);
                }
              }}
              onLoadedMetadata={() => {
                if (pendingSeekRef.current !== null && videoRef.current) {
                  try {
                    videoRef.current.currentTime = pendingSeekRef.current;
                  } catch {
                    // Ignore seek errors on constrained media decoders.
                  }
                  pendingSeekRef.current = null;
                }
              }}
              onLoadedData={() => setLoadingStreamKey(null)}
              onCanPlay={() => setLoadingStreamKey(null)}
              onPlaying={() => setLoadingStreamKey(null)}
              onError={() => {
                setLoadingStreamKey(null);
                setFailedStreamKey(currentStreamKey);
              }}
              className="size-full object-cover"
            >
              <a href={t.trailer.rawStreamUrl}>{t.trailer.openGithubStreamCta}</a>
            </video>

            {isBuffering && (
              <div
                role="status"
                aria-live="polite"
                className="pointer-events-none absolute inset-x-4 top-4 inline-flex items-center gap-2 rounded-lg border border-line-strong bg-overlay px-3 py-2 font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-ink animate-pulse motion-reduce:animate-none"
              >
                <Sparkles aria-hidden="true" className="size-4 text-primary" />
                <span>{t.trailer.loadingLabel}</span>
              </div>
            )}
          </div>
        )}

        {showReducedMotionBanner && (
          <SurfaceCard variant="subtle" className="mt-1.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] px-4 py-3">
            <div className="max-w-prose text-[clamp(0.84rem,0.12vw+0.81rem,0.9rem)] leading-relaxed font-normal text-muted">
              {t.trailer.reducedMotionNotice}
            </div>
            <ActionButton
              variant="primary"
              icon={<Play aria-hidden="true" className="size-4" />}
              onClick={handlePlayStudioTrailer}
            >
              {t.trailer.playStudioCta}
            </ActionButton>
          </SurfaceCard>
        )}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label={t.trailer.chaptersLabel}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 flex-1"
        >
          {t.trailer.media.chapters.map((chapter) => {
            const isSelected = activeChapter?.seconds === chapter.seconds;
            return (
              <button
                key={chapter.seconds}
                type="button"
                aria-pressed={isSelected}
                disabled={hasStreamError}
                onClick={() => handleChapterJump(chapter.seconds, chapter.label)}
                className={clsx(
                  'inline-flex min-h-11 items-center justify-between gap-2 rounded-[10px] border px-3.5 py-2 text-left font-mono text-[clamp(0.76rem,0.12vw+0.73rem,0.825rem)] leading-snug tabular-nums transition-colors duration-150 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
                  FOCUS_RING,
                  isSelected
                    ? 'border-primary bg-primary/14 text-ink font-semibold'
                    : 'border-hairline bg-card text-muted hover:border-line-strong hover:text-ink font-normal',
                )}
              >
                <span className="truncate">{chapter.label}</span>
                <Play aria-hidden="true" className={clsx('size-3.5 shrink-0', isSelected ? 'text-primary' : 'text-muted')} />
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="shrink-0">
          {activeChapter && (
            <StatusBadge tone="emerald">
              <CheckCircle2 aria-hidden="true" className="size-3.5" />
              <span>{`${t.trailer.chapterJumpedLabel}: ${activeChapter.label}`}</span>
            </StatusBadge>
          )}
        </div>
      </div>
    </div>
  );
}
