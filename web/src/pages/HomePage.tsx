import { Link, useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { FeatureBento } from '../components/home/FeatureBento'
import { HomeTerminalPreview } from '../components/home/HomeTerminalPreview'
import { TrailerPlayer } from '../components/home/TrailerPlayer'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { CLI_COMMANDS } from '../data/cliSuite'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { Dictionary } from '../i18n/types'
import type { Locale, PlatformId } from '../types/ui-contract'

/**
 * Calm, monumental 4-section homepage (1440px stage):
 * 1. Hero + widescreen 1080p cinema stage + sleek ecosystem & 4-stat bar
 * 2. 3 sculptural VIP architectural pillars
 * 3. 4-tab live local CLI terminal preview
 * 4. Minimalist 30-second closing stage
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))
const HERO_SPOTLIGHT =
  'radial-gradient(ellipse 75% 48% at 50% -6%, oklch(0.74 0.14 160 / 0.11), oklch(1 0 0 / 0.04) 48%, transparent 78%)'
const CLOSING_SPOTLIGHT =
  'radial-gradient(ellipse 70% 58% at 50% 0%, oklch(0.74 0.14 160 / 0.14), oklch(1 0 0 / 0.05) 45%, transparent 75%)'

interface HomeSectionCopy {
  readonly worksWithLabel: string
  readonly statWorkflows: string
  readonly statSubagents: string
  readonly statCliGates: string
  readonly statSkills: string
  readonly bentoEyebrow: string
  readonly bentoTitle: string
  readonly cliEyebrow: string
  readonly cliTitle: string
  readonly cliLinkLabel: string
  readonly closingHeadline: string
  readonly closingSubline: string
  readonly closingPrimaryCta: string
  readonly closingSecondaryCta: string
}

const HOME_COPY: Record<Locale, HomeSectionCopy> = {
  en: {
    worksWithLabel: 'Works natively with',
    statWorkflows: 'Slash Workflows',
    statSubagents: 'Sub-Agents',
    statCliGates: 'CLI Gates',
    statSkills: 'Indexed Skills',
    bentoEyebrow: 'CORE ARCHITECTURE',
    bentoTitle: 'Light on daily edits. Strict at scale.',
    cliEyebrow: 'CLI GATES',
    cliTitle: 'Verified locally before every merge.',
    cliLinkLabel: 'Explore all 14 CLI gates',
    closingHeadline: 'Ready in 30 seconds.',
    closingSubline: 'Open source MIT · Zero runtime dependencies · Clean uninstall via SHA-256 manifest.',
    closingPrimaryCta: 'Install Now',
    closingSecondaryCta: 'Explore 36 Commands',
  },
  vi: {
    worksWithLabel: 'Tương thích gốc với',
    statWorkflows: 'Lệnh quy trình',
    statSubagents: 'Sub-Agents',
    statCliGates: 'Cổng CLI',
    statSkills: 'Kỹ năng',
    bentoEyebrow: 'KIẾN TRÚC LÕI',
    bentoTitle: 'Nhẹ khi code nhanh. Chặt khi làm lớn.',
    cliEyebrow: 'CLI GATES',
    cliTitle: 'Kiểm chứng tự động trên máy.',
    cliLinkLabel: 'Xem kiến trúc & 14 lệnh CLI',
    closingHeadline: 'Sẵn sàng trong 30 giây.',
    closingSubline: 'Mã nguồn mở MIT · 0 gói phụ thuộc ngoài · Gỡ cài đặt an toàn qua manifest SHA-256.',
    closingPrimaryCta: 'Cài đặt ngay',
    closingSecondaryCta: 'Xem 36 lệnh',
  },
}

function isPlatformId(value: string | null): value is PlatformId {
  return value !== null && PLATFORM_ID_SET.has(value)
}

function EyebrowPill({ index, label }: { readonly index: string; readonly label: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3.5 py-1 font-mono text-xs text-muted tabular-nums">
      <span className="font-semibold text-accent">{index}</span>
      <span aria-hidden="true" className="text-white/20">/</span>
      <span className="uppercase tracking-[0.09em]">{label}</span>
    </div>
  )
}

function EcosystemMetricsStrip({
  copy,
  selectedPlatformId,
}: {
  readonly copy: HomeSectionCopy
  readonly selectedPlatformId: PlatformId | null
}) {
  const stats = [
    { value: formatCount(KIT_STATS.commands.length), label: copy.statWorkflows },
    { value: formatCount(KIT_STATS.agents), label: copy.statSubagents },
    { value: formatCount(CLI_COMMANDS.length), label: copy.statCliGates },
    { value: formatCount(KIT_STATS.skills), label: copy.statSkills },
  ] as const

  return (
    <div className="mt-12 border-t border-white/[0.08] pt-10">
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <span className="mr-1 font-mono text-xs uppercase tracking-[0.08em] text-subtle">
          {copy.worksWithLabel}
        </span>
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
                  ? 'border-accent/45 bg-accent/12 text-ink'
                  : 'border-white/[0.10] bg-white/[0.03] text-ink/90 hover:border-white/[0.22] hover:bg-white/[0.07] hover:text-ink',
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
            <div className="font-display text-[32px] leading-none font-bold tracking-[-0.035em] text-ink tabular-nums sm:text-[36px]">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-subtle">{stat.label}</div>
          </div>
        ))}
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
}: {
  readonly t: Dictionary
  readonly copy: HomeSectionCopy
  readonly installHref: string
  readonly selectedPlatformId: PlatformId | null
  readonly reduceMotion: boolean
}) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative overflow-hidden border-b border-white/[0.08]"
      style={{ backgroundImage: HERO_SPOTLIGHT }}
    >
      <div aria-hidden="true" className="architectural-grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[90rem] px-4 pt-14 pb-16 sm:px-6 lg:px-10 lg:pt-22 lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-col items-center text-center"
        >
          <Link
            to="/architecture"
            className={clsx(
              'inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-ink backdrop-blur-md transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.24] hover:bg-white/[0.08] no-underline',
              FOCUS_RING,
            )}
          >
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-xs font-semibold text-accent">{`v${KIT_STATS.version}`}</span>
            <span aria-hidden="true" className="text-white/25">·</span>
            <span className="font-mono text-xs text-ink/90">frontier-guardrails</span>
            <ArrowRight aria-hidden="true" className="size-3.5 text-muted" />
          </Link>

          <h1
            id="home-hero-heading"
            className="hero-display-gradient mx-auto mt-7 max-w-[16ch] text-center font-display text-[clamp(3rem,5.5vw,5.25rem)] leading-[1.04] font-bold tracking-[-0.04em]"
          >
            {t.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-[50ch] text-center text-lg leading-relaxed text-muted sm:text-xl">
            {t.hero.subheadline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ActionLink
              to={installHref}
              variant="primary"
              trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              className="min-h-13 rounded-2xl px-8 text-base font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.38)]"
            >
              {t.hero.primaryCta}
            </ActionLink>
            <ActionLink
              to="/commands"
              variant="secondary"
              className="min-h-13 rounded-2xl border-white/[0.14] bg-white/[0.04] px-8 text-base font-medium backdrop-blur-md hover:bg-white/[0.08]"
            >
              {t.hero.secondaryCta}
            </ActionLink>
          </div>

          <div className="mx-auto mt-7 w-full max-w-2xl text-left">
            <CopyCommandBar
              command={INSTALL_ALL_COMMAND}
              copyLabel={t.common.copy}
              copiedLabel={t.common.copied}
              manualCopyHint={t.common.copyManualHint}
            />
          </div>
        </motion.div>

        <div className="mt-14 lg:mt-18">
          <TrailerPlayer />
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

  const rawTool = searchParams.get('tool')
  const selectedPlatformId: PlatformId | null = isPlatformId(rawTool) ? rawTool : null
  const installHref = selectedPlatformId ? `/install?tool=${selectedPlatformId}` : '/install'
  const copy = HOME_COPY[locale]

  return (
    <div className="min-h-dvh">
      <SEO routeId="home" />
      <HeroStage
        t={t}
        copy={copy}
        installHref={installHref}
        selectedPlatformId={selectedPlatformId}
        reduceMotion={Boolean(reduceMotion)}
      />

      <section aria-labelledby="home-bento-heading" className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
        <div className="space-y-4">
          <EyebrowPill index="01" label={copy.bentoEyebrow} />
          <h2
            id="home-bento-heading"
            className="max-w-[20ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-ink"
          >
            {copy.bentoTitle}
          </h2>
        </div>
        <div className="mt-12 lg:mt-14">
          <FeatureBento />
        </div>
      </section>

      <section aria-labelledby="home-cli-heading" className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="space-y-4">
              <EyebrowPill index="02" label={copy.cliEyebrow} />
              <h2
                id="home-cli-heading"
                className="max-w-[20ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-ink"
              >
                {copy.cliTitle}
              </h2>
            </div>

            <Link
              to="/architecture"
              className={clsx(
                'inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.24] hover:bg-white/[0.08] no-underline self-start sm:self-auto',
                FOCUS_RING,
              )}
            >
              <span>{copy.cliLinkLabel}</span>
              <ArrowRight aria-hidden="true" className="size-4 text-accent" />
            </Link>
          </div>

          <div className="mt-12 lg:mt-14">
            <HomeTerminalPreview />
          </div>
        </div>
      </section>

      <section aria-labelledby="home-closing-heading" className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-28">
          <div
            className="specular-surface mx-auto max-w-5xl rounded-[32px] border border-white/[0.14] p-12 text-center sm:p-16"
            style={{ backgroundImage: CLOSING_SPOTLIGHT }}
          >
            <h2
              id="home-closing-heading"
              className="hero-display-gradient mx-auto max-w-[18ch] font-display text-[clamp(2.5rem,4.2vw,3.375rem)] leading-[1.06] font-bold tracking-[-0.035em]"
            >
              {copy.closingHeadline}
            </h2>
            <p className="mx-auto mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">
              {copy.closingSubline}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ActionLink
                to={installHref}
                variant="primary"
                trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
                className="min-h-13 rounded-2xl px-8 text-base font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.38)]"
              >
                {copy.closingPrimaryCta}
              </ActionLink>
              <ActionLink
                to="/commands"
                variant="secondary"
                className="min-h-13 rounded-2xl border-white/[0.14] bg-white/[0.04] px-8 text-base font-medium hover:bg-white/[0.08]"
              >
                {copy.closingSecondaryCta}
              </ActionLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
