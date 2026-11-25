import { Link, useSearchParams } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { FeatureBento } from '../components/home/FeatureBento'
import { HomeTerminalPreview } from '../components/home/HomeTerminalPreview'
import { TrailerPlayer } from '../components/home/TrailerPlayer'
import { SEO } from '../components/seo/SEO'
import { ActionLink, CopyCommandBar } from '../components/ui/Primitives'
import { KIT_STATS, formatCount } from '../data/kitStats'
import { INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms'
import { useLanguage } from '../i18n/context'
import type { Dictionary } from '../i18n/types'
import type { Locale, PlatformId } from '../types/ui-contract'

/**
 * Visionary 4-section widescreen homepage (1440px stage):
 * 1. Hero + widescreen 1080p cinema stage + 5-IDE ecosystem & 4 flagship stats
 * 2. Asymmetric 2x2 Bento of BoomOpen's 4 unique superpowers
 * 3. Interactive 5-stage end-to-end project lifecycle showcase
 * 4. Clean 5-IDE unified closing stage
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'
const PLATFORM_ID_SET = new Set<string>(PLATFORMS.map((p) => p.id))
const HERO_SPOTLIGHT =
  'radial-gradient(ellipse 75% 48% at 50% -6%, oklch(0.74 0.14 160 / 0.11), oklch(1 0 0 / 0.04) 48%, transparent 78%)'
const CLOSING_SPOTLIGHT =
  'radial-gradient(ellipse 70% 58% at 50% 0%, oklch(0.74 0.14 160 / 0.14), oklch(1 0 0 / 0.05) 45%, transparent 75%)'

interface HomeSectionCopy {
  readonly topPillText: string
  readonly worksWithLabel: string
  readonly statWorkflows: string
  readonly statAgents: string
  readonly statTeams: string
  readonly statSkills: string
  readonly bentoEyebrow: string
  readonly bentoTitle: string
  readonly lifecycleEyebrow: string
  readonly lifecycleTitle: string
  readonly lifecycleLinkLabel: string
  readonly closingHeadline: string
  readonly closingSubline: string
  readonly closingPrimaryCta: string
  readonly closingSecondaryCta: string
}

const HOME_COPY: Record<Locale, HomeSectionCopy> = {
  en: {
    topPillText: 'BoomOpen v5.5 · Antigravity · Claude Code · Codex · Cursor · Copilot',
    worksWithLabel: 'Works natively with',
    statWorkflows: 'Workflows',
    statAgents: 'Specialist Agents',
    statTeams: 'Review Teams',
    statSkills: 'Domain Skills',
    bentoEyebrow: 'UNIQUE CAPABILITIES',
    bentoTitle: 'Capabilities no standalone AI IDE ships with.',
    lifecycleEyebrow: '36 END-TO-END WORKFLOWS',
    lifecycleTitle: 'Every workflow from idea to release.',
    lifecycleLinkLabel: 'Browse all 36 workflows',
    closingHeadline: 'Install once. Supercharge all 5 AI IDEs.',
    closingSubline: 'Works seamlessly across Antigravity, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot. Open source MIT.',
    closingPrimaryCta: 'Install Now',
    closingSecondaryCta: 'View Architecture',
  },
  vi: {
    topPillText: 'BoomOpen v5.5 · Antigravity · Claude Code · Codex · Cursor · Copilot',
    worksWithLabel: 'Tương thích gốc với',
    statWorkflows: 'Lệnh quy trình',
    statAgents: 'Chuyên gia AI',
    statTeams: 'Đội phản biện',
    statSkills: 'Kỹ năng chuyên sâu',
    bentoEyebrow: 'SỨC MẠNH KHÁC BIỆT',
    bentoTitle: 'Những khả năng không AI IDE đơn lẻ nào có sẵn.',
    lifecycleEyebrow: '36 QUY TRÌNH THỰC CHIẾN',
    lifecycleTitle: 'Trọn vòng đời từ ý tưởng đến phát hành.',
    lifecycleLinkLabel: 'Xem toàn bộ 36 lệnh',
    closingHeadline: 'Cài một lần. Nâng tầm cả 5 AI IDE.',
    closingSubline: 'Hoạt động đồng bộ trên Antigravity, Claude Code, OpenAI Codex, Cursor và GitHub Copilot. Mã nguồn mở MIT.',
    closingPrimaryCta: 'Cài đặt ngay',
    closingSecondaryCta: 'Xem kiến trúc',
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
    { value: formatCount(KIT_STATS.agents), label: copy.statAgents },
    { value: formatCount(KIT_STATS.teams), label: copy.statTeams },
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
            to={installHref}
            className={clsx(
              'inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-1.5 text-xs sm:text-sm font-medium text-ink backdrop-blur-md transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.24] hover:bg-white/[0.08] no-underline',
              FOCUS_RING,
            )}
          >
            <span className="relative flex size-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="truncate font-mono text-xs text-ink/95">{copy.topPillText}</span>
            <ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-accent" />
          </Link>

          <h1
            id="home-hero-heading"
            className="hero-display-gradient mx-auto mt-7 max-w-[18ch] text-center font-display text-[clamp(2.75rem,5.2vw,5.1rem)] leading-[1.05] font-bold tracking-[-0.04em]"
          >
            {t.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-[58ch] text-center text-lg leading-relaxed text-muted sm:text-xl">
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

          <div className="mx-auto mt-7 w-full max-w-4xl text-left">
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
            className="max-w-[22ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-ink"
          >
            {copy.bentoTitle}
          </h2>
        </div>
        <div className="mt-12 lg:mt-14">
          <FeatureBento />
        </div>
      </section>

      <section aria-labelledby="home-lifecycle-heading" className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-[90rem] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="space-y-4">
              <EyebrowPill index="02" label={copy.lifecycleEyebrow} />
              <h2
                id="home-lifecycle-heading"
                className="max-w-[22ch] font-display text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.035em] text-ink"
              >
                {copy.lifecycleTitle}
              </h2>
            </div>

            <Link
              to="/commands"
              className={clsx(
                'inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.24] hover:bg-white/[0.08] no-underline self-start sm:self-auto',
                FOCUS_RING,
              )}
            >
              <span>{copy.lifecycleLinkLabel}</span>
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
              className="hero-display-gradient mx-auto max-w-[20ch] font-display text-[clamp(2.35rem,4vw,3.35rem)] leading-[1.06] font-bold tracking-[-0.035em]"
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
                to="/architecture"
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
