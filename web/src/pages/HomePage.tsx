import { Link, useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react'
import { CliPlayground } from '../components/home/CliPlayground'
import { FeatureBento } from '../components/home/FeatureBento'
import { SwarmVisualizer } from '../components/home/SwarmVisualizer'
import { TrailerPlayer } from '../components/home/TrailerPlayer'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { CLI_COMMANDS } from '../data/cliSuite'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { CLONE_SNIPPET, INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { Dictionary } from '../i18n/types'
import type { Locale, PlatformId } from '../types/ui-contract'

/**
 * Monumental widescreen flagship homepage (1440px stage):
 * Hero stage + 6-cell sculptural metrics band, 12-col engineering Bento,
 * cinema walkthrough, multi-agent wave stage, IDE terminal workbench, and closing CTA.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const INSTALL_WITH_HOOKS_CMD = `${CLONE_SNIPPET} && node cli/install.js install --all --with-hooks`
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))
const HERO_SPOTLIGHT =
  'radial-gradient(ellipse 75% 48% at 50% -6%, oklch(0.74 0.14 160 / 0.11), oklch(1 0 0 / 0.04) 48%, transparent 78%)'
const CLOSING_SPOTLIGHT =
  'radial-gradient(ellipse 70% 58% at 50% 0%, oklch(0.74 0.14 160 / 0.14), oklch(1 0 0 / 0.05) 45%, transparent 75%)'

const HOME_COPY = {
  en: {
    pillLabel: 'frontier-guardrails (< 2.3 KB / ~600 tok)', pillCta: 'Architecture',
    bentoEyebrow: 'Core Engineering',
    bentoTitle: 'Built for deterministic precision at frontier scale',
    bentoSubtitle: 'Four architectural guarantees that keep daily coding effortless while making large multi-agent builds verifiable, reversible, and conflict-free.',
    closingBadge: 'Open Source MIT | Zero Telemetry | Git-Native',
    closingHeadline: 'Ship production code across all 5 AI IDEs today.',
    closingSubheadline: 'Clone once, sync 14 entry files in under 10ms, preserve your personal rules with SHA-256 manifests, and scale from 1-file edits to 3-wave swarms on demand.',
  },
  vi: {
    pillLabel: 'frontier-guardrails (< 2.3 KB / ~600 tok)', pillCta: 'Kiến trúc',
    bentoEyebrow: 'Nền Tảng Kỹ Thuật',
    bentoTitle: 'Thiết kế chuẩn xác cho quy trình AI coding quy mô lớn',
    bentoSubtitle: 'Bốn trụ cột kỹ thuật giúp phiên làm việc hàng ngày luôn nhẹ nhàng nhưng vẫn kiểm chứng chặt chẽ, chống xung đột và khôi phục tức thì khi chạy đa tác tử.',
    closingBadge: 'Mã Nguồn Mở MIT | Không Thu Thập Dữ Liệu | Cài Qua Git',
    closingHeadline: 'Chuẩn hóa quy trình trên cả 5 AI IDE ngay hôm nay.',
    closingSubheadline: 'Clone một lần, đồng bộ 14 tệp đầu vào dưới 10ms, bảo toàn cấu hình riêng bằng manifest SHA-256 và sẵn sàng mở rộng từ tác vụ nhỏ tới chạy song song 3-Wave.',
  },
} satisfies Record<Locale, Record<string, string>>

function isPlatformId(value: string | null): value is PlatformId {
  return value !== null && PLATFORM_ID_SET.has(value)
}

function cleanMetricLabel(rawLabel: string, fallback: string): string {
  const withoutLeadingCount = rawLabel.replace(/^\d[\d,.]*\s+/, '')
  return /\d/.test(withoutLeadingCount) ? fallback : withoutLeadingCount
}

function SectionHeading({ index, id, eyebrow, title, subtitle }: { readonly index: string; readonly id: string; readonly eyebrow: string; readonly title: string; readonly subtitle: string }) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3.5 py-1 font-mono text-xs text-muted tabular-nums">
        <span className="font-semibold text-accent">{index}</span>
        <span aria-hidden="true" className="text-white/20">/</span>
        <span className="uppercase tracking-[0.09em]">{eyebrow}</span>
      </div>
      <h2 id={id} className="max-w-[24ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-ink">
        {title}
      </h2>
      <p className="max-w-[64ch] text-base leading-relaxed text-muted sm:text-lg lg:text-[19px]">{subtitle}</p>
    </div>
  )
}

function HeroStage({ t, locale, installHref, reduceMotion }: { readonly t: Dictionary; readonly locale: Locale; readonly installHref: string; readonly reduceMotion: boolean }) {
  const copy = HOME_COPY[locale]
  const d = t.hero.metrics.details
  const heroMetrics = [
    { id: 'platforms', value: formatCount(KIT_STATS.platforms), label: cleanMetricLabel(t.hero.metrics.platforms, t.hero.metrics.platforms), detail: d.platforms },
    { id: 'commands', value: formatCount(KIT_STATS.commands.length), label: cleanMetricLabel(t.hero.metrics.commands, t.nav.commands), detail: d.commands },
    { id: 'agentsTeams', value: `${formatCount(KIT_STATS.agents)}+${formatCount(KIT_STATS.teams)}`, label: cleanMetricLabel(t.hero.metrics.agentsTeams, t.nav.agents), detail: d.agentsTeams },
    { id: 'skills', value: formatCount(KIT_STATS.skills), label: cleanMetricLabel(t.hero.metrics.skills, t.nav.skills), detail: d.skills },
    { id: 'cliGates', value: formatCount(CLI_COMMANDS.length), label: cleanMetricLabel(t.hero.metrics.cliGates, t.hero.metrics.cliGates), detail: d.cliGates },
    { id: 'languages', value: formatCount(KIT_STATS.i18nLocales), label: cleanMetricLabel(t.hero.metrics.languages, t.hero.metrics.languages), detail: d.languages },
  ] as const

  return (
    <section aria-labelledby="home-hero-heading" className="relative overflow-hidden border-b border-white/[0.08]" style={{ backgroundImage: HERO_SPOTLIGHT }}>
      <div aria-hidden="true" className="architectural-grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[90rem] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-24 lg:pb-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Link
            to="/architecture"
            className={clsx(
              'inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-ink shadow-sm backdrop-blur-md transition-colors hover:border-white/[0.24] hover:bg-white/[0.08] no-underline',
              FOCUS_RING,
            )}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-xs font-semibold text-accent">{`v${KIT_STATS.version}`}</span>
            <span aria-hidden="true" className="text-white/25">|</span>
            <span className="text-ink/90">{copy.pillLabel}</span>
            <span className="hidden items-center gap-1 font-mono text-xs text-muted sm:inline-flex">
              <span>{copy.pillCta}</span>
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
          </Link>

          <h1 id="home-hero-heading" className="hero-display-gradient mt-7 max-w-[18ch] mx-auto text-center font-display text-[clamp(2.75rem,5.4vw,5.25rem)] leading-[1.04] font-bold tracking-[-0.04em]">
            {t.hero.headline}
          </h1>

          <p className="mt-6 max-w-[62ch] mx-auto text-center text-lg leading-relaxed text-muted sm:text-xl lg:text-[21px]">
            {t.hero.subheadline}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ActionLink to={installHref} variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />} className="min-h-13 rounded-2xl px-8 text-base font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.38)]">
              {t.hero.primaryCta}
            </ActionLink>
            <ActionLink to="/commands" variant="secondary" className="min-h-13 rounded-2xl border-white/[0.14] bg-white/[0.04] px-8 text-base font-medium backdrop-blur-md hover:bg-white/[0.08]">
              {t.hero.secondaryCta}
            </ActionLink>
          </div>

          <div className="mx-auto mt-8 w-full max-w-3xl text-left">
            <div className="hardware-bezel">
              <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#07080C]">
                <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#0B0C11] px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="inline-flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-[#FF5F56]/75" />
                      <span className="size-2.5 rounded-full bg-[#FFBD2E]/75" />
                      <span className="size-2.5 rounded-full bg-[#27C93F]/75" />
                    </span>
                    <span className="rounded-md border border-white/[0.09] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] font-medium text-ink">bash</span>
                  </div>
                  <span className="font-mono text-[11px] text-subtle tabular-nums">SHA-256 Manifest | 5 IDEs</span>
                </div>
                <div className="p-2.5">
                  <CopyCommandBar command={INSTALL_ALL_COMMAND} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-subtle">{t.hero.quickInstallCaption}</p>
          </div>
        </motion.div>

        <div className="specular-surface mt-16 grid grid-cols-2 divide-y divide-white/[0.08] overflow-hidden rounded-3xl border border-white/[0.10] bg-white/[0.02] backdrop-blur-md md:grid-cols-3 md:divide-y-0 md:divide-x lg:mt-24 lg:grid-cols-6">
          {heroMetrics.map((metric) => (
            <div key={metric.id} className="p-7 lg:p-8">
              <div className="font-display text-4xl leading-none font-bold tracking-[-0.03em] text-ink tabular-nums lg:text-[44px]">{metric.value}</div>
              <div className="mt-2.5 text-[15px] font-medium text-ink/90">{metric.label}</div>
              <div className="mt-1 text-xs leading-relaxed text-subtle">{metric.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlatformsAndClosingSection({ t, locale, selectedPlatformId, installHref, onSelectPlatform }: { readonly t: Dictionary; readonly locale: Locale; readonly selectedPlatformId: PlatformId; readonly installHref: string; readonly onSelectPlatform: (id: PlatformId) => void }) {
  const copy = HOME_COPY[locale]
  return (
    <section aria-labelledby="home-platforms-heading" className="mx-auto max-w-[90rem] space-y-12 border-t border-white/[0.08] px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading index="05" id="home-platforms-heading" eyebrow={t.platformsSection.eyebrow} title={t.platformsSection.title} subtitle={t.platformsSection.subtitle} />
        <ActionLink to={installHref} variant="secondary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />} className="min-h-12 self-start rounded-xl px-6 lg:self-auto">
          {t.nav.install}
        </ActionLink>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {PLATFORMS.map((platform) => {
          const isSelected = platform.id === selectedPlatformId
          const displayName = platform.id === 'antigravity' ? 'Antigravity' : platform.name
          return (
            <button
              key={platform.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectPlatform(platform.id)}
              className={clsx(
                'specular-surface group flex min-h-[220px] flex-col items-start justify-between gap-6 rounded-3xl border p-7 text-left transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                isSelected ? 'border-accent/50 bg-elevated text-ink shadow-[0_0_32px_-10px_oklch(0.74_0.14_160/0.35)]' : 'border-white/[0.10] bg-card/75 text-muted hover:border-white/[0.22] hover:bg-card hover:text-ink',
              )}
            >
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={clsx('rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-medium tabular-nums', isSelected ? 'border-accent/35 bg-accent/15 text-accent' : 'border-white/[0.09] bg-white/[0.03] text-subtle')}>
                    21L | ~2.2 KB
                  </span>
                  <ArrowUpRight aria-hidden="true" className={clsx('size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5', isSelected ? 'text-accent' : 'text-subtle group-hover:text-ink')} />
                </div>
                <div>
                  <div className="font-display text-xl leading-snug font-bold text-ink">{displayName}</div>
                  <div className="mt-1 text-sm text-subtle">{platform.vendor}</div>
                </div>
              </div>
              <code className="w-full truncate rounded-xl border border-white/[0.08] bg-[#06070A] px-3 py-2 font-mono text-xs text-ink/85 tabular-nums">{platform.entryFile}</code>
            </button>
          )
        })}
      </div>

      <div className="specular-surface relative mt-6 overflow-hidden rounded-[32px] border border-white/[0.14] bg-[#08090E] p-10 text-center shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-16 lg:p-20" style={{ backgroundImage: CLOSING_SPOTLIGHT }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 font-mono text-xs font-medium text-accent">
            <Sparkles aria-hidden="true" className="size-3.5" />
            <span>{copy.closingBadge}</span>
          </span>
          <h2 className="hero-display-gradient mt-6 max-w-[20ch] font-display text-[clamp(2.35rem,4vw,3.5rem)] leading-[1.06] font-bold tracking-[-0.035em]">
            {copy.closingHeadline}
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-muted sm:text-lg lg:text-xl">{copy.closingSubheadline}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <ActionLink to={installHref} variant="primary" trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />} className="min-h-13 rounded-2xl px-8 text-base font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.38)]">
              {t.hero.primaryCta}
            </ActionLink>
            <ActionLink to="/commands" variant="secondary" className="min-h-13 rounded-2xl border-white/[0.14] bg-white/[0.04] px-8 text-base font-medium hover:bg-white/[0.08]">
              {t.hero.secondaryCta}
            </ActionLink>
          </div>
          <div className="mt-8 w-full max-w-2xl text-left">
            <CopyCommandBar label={t.platformsSection.batchAllLabel} command={INSTALL_WITH_HOOKS_CMD} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTool = searchParams.get('tool')
  const selectedPlatformId: PlatformId = isPlatformId(rawTool) ? rawTool : 'antigravity'
  const installHref = selectedPlatformId === 'antigravity' ? '/install' : `/install?tool=${selectedPlatformId}`
  const copy = HOME_COPY[locale]

  const handleSelectPlatform = (nextId: PlatformId) => {
    const next = new URLSearchParams(searchParams)
    if (nextId === 'antigravity') next.delete('tool')
    else next.set('tool', nextId)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-dvh">
      <SEO routeId="home" />
      <HeroStage t={t} locale={locale} installHref={installHref} reduceMotion={Boolean(reduceMotion)} />

      <section aria-labelledby="home-bento-heading" className="mx-auto max-w-[90rem] space-y-12 px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
        <SectionHeading index="01" id="home-bento-heading" eyebrow={copy.bentoEyebrow} title={copy.bentoTitle} subtitle={copy.bentoSubtitle} />
        <FeatureBento />
      </section>

      <section aria-labelledby="home-trailer-heading" className="mx-auto max-w-[90rem] space-y-12 border-t border-white/[0.08] px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
        <SectionHeading index="02" id="home-trailer-heading" eyebrow={t.trailer.eyebrow} title={t.trailer.title} subtitle={t.trailer.subtitle} />
        <TrailerPlayer />
      </section>

      <section aria-labelledby="home-swarm-heading" className="mx-auto max-w-[90rem] space-y-12 border-t border-white/[0.08] px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
        <SectionHeading index="03" id="home-swarm-heading" eyebrow={t.swarm.eyebrow} title={t.swarm.title} subtitle={t.swarm.subtitle} />
        <SwarmVisualizer />
      </section>

      <section aria-labelledby="home-cli-heading" className="mx-auto max-w-[90rem] space-y-12 border-t border-white/[0.08] px-4 py-20 sm:px-6 sm:py-28 lg:px-10 lg:py-32">
        <SectionHeading index="04" id="home-cli-heading" eyebrow={t.cliPlayground.eyebrow} title={t.cliPlayground.title} subtitle={t.cliPlayground.subtitle} />
        <CliPlayground />
      </section>

      <PlatformsAndClosingSection t={t} locale={locale} selectedPlatformId={selectedPlatformId} installHref={installHref} onSelectPlatform={handleSelectPlatform} />
    </div>
  )
}

export default HomePage
