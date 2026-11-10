import { useRef, useState, type KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cpu, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { CliPlayground } from '../components/home/CliPlayground';
import { SwarmVisualizer } from '../components/home/SwarmVisualizer';
import { TrailerPlayer } from '../components/home/TrailerPlayer';
import { SEO } from '../components/seo/SEO';
import { ActionLink, CopyCommandBar, StatusBadge, SurfaceCard } from '../components/ui/Primitives';
import { CLI_COMMANDS } from '../data/cliSuite';
import { KIT_STATS, formatCount } from '../data/kitStats';
import { INSTALL_ALL_COMMAND, PLATFORMS } from '../data/platforms';
import { useLanguage } from '../i18n/context';
import type { PlatformId } from '../types/ui-contract';

/**
 * Mission: BoomOpen-Workflow-Kit-Pro v5.5 flagship overview page with live ground-truth telemetry
 * (1,462 indexed skills), bilingual 1080p launch trailer, 3-wave swarm, 12 CLI gates, and trusted 5-IDE setup.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

export function HomePage() {
  const { t, pick } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [selectedPlatformId, setSelectedPlatformId] = useState<PlatformId>('antigravity');
  const platformTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activePlatform =
    PLATFORMS.find((platform) => platform.id === selectedPlatformId) ?? PLATFORMS[0];

  const heroMetrics = [
    { id: 'platforms', value: formatCount(KIT_STATS.platforms), label: t.hero.metrics.platforms, detail: t.hero.metrics.details.platforms },
    { id: 'commands', value: formatCount(KIT_STATS.commands.length), label: t.hero.metrics.commands, detail: `${formatCount(KIT_STATS.commandFiles)} • ${t.hero.metrics.details.commands}` },
    { id: 'agentsTeams', value: `${formatCount(KIT_STATS.agents)} + ${formatCount(KIT_STATS.teams)}`, label: t.hero.metrics.agentsTeams, detail: `${formatCount(KIT_STATS.teamFiles)} • ${t.hero.metrics.details.agentsTeams}` },
    { id: 'skills', value: formatCount(KIT_STATS.skills), label: t.hero.metrics.skills, detail: `${formatCount(KIT_STATS.coreSkills)} + ${formatCount(KIT_STATS.librarySkills)} • ${formatCount(KIT_STATS.domains.length)} domains` },
    { id: 'cliGates', value: formatCount(CLI_COMMANDS.length), label: t.hero.metrics.cliGates, detail: t.hero.metrics.details.cliGates },
    { id: 'languages', value: formatCount(KIT_STATS.i18nLocales), label: t.hero.metrics.languages, detail: t.hero.metrics.details.languages },
  ] as const;

  const handlePlatformKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIdx: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIdx = (index + 1) % PLATFORMS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIdx = (index - 1 + PLATFORMS.length) % PLATFORMS.length;
    } else if (event.key === 'Home') {
      nextIdx = 0;
    } else if (event.key === 'End') {
      nextIdx = PLATFORMS.length - 1;
    }
    if (nextIdx !== null) {
      event.preventDefault();
      const target = PLATFORMS[nextIdx];
      if (target) {
        setSelectedPlatformId(target.id);
        platformTabRefs.current[nextIdx]?.focus();
      }
    }
  };

  return (
    <div className="min-h-dvh space-y-20 pb-20 pt-8 sm:space-y-24 sm:pt-12">
      <SEO routeId="home" />

      {/* 1. Asymmetric 7:5 Flagship Hero + Live Telemetry Bento */}
      <section aria-labelledby="home-hero-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="grid gap-8 lg:grid-cols-12 lg:items-start"
        >
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge tone="amber">
                <Sparkles aria-hidden="true" className="size-3.5" />
                <span>{t.hero.badge}</span>
              </StatusBadge>
              <span className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold uppercase tracking-widest text-muted">
                {t.hero.eyebrow}
              </span>
            </div>

            <h1
              id="home-hero-heading"
              className="font-display text-[clamp(2.25rem,4.2vw+1rem,4.1rem)] leading-[1.08] font-semibold tracking-tight text-ink"
            >
              {t.hero.headline}
            </h1>

            <p className="max-w-prose text-[clamp(0.98rem,0.25vw+0.92rem,1.125rem)] leading-relaxed font-normal text-muted">
              {t.hero.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ActionLink
                to="/install"
                variant="primary"
                trailingIcon={<ArrowRight aria-hidden="true" className="size-4" />}
              >
                {t.hero.primaryCta}
              </ActionLink>
              <ActionLink
                to="/commands"
                variant="secondary"
                icon={<Terminal aria-hidden="true" className="size-4 text-primary" />}
              >
                {t.hero.secondaryCta}
              </ActionLink>
            </div>

            <div className="space-y-2 pt-1">
              <CopyCommandBar
                label={t.hero.quickInstallLabel}
                command={INSTALL_ALL_COMMAND}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
              />
              <p className="max-w-prose text-[clamp(0.78rem,0.1vw+0.75rem,0.84rem)] leading-relaxed font-normal text-muted">
                {t.hero.quickInstallCaption}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-2">
            {heroMetrics.map((metric) => (
              <SurfaceCard key={metric.id} variant="interactive" className="space-y-2 p-4 sm:p-5">
                <div className="font-mono text-[clamp(1.4rem,1.2vw+1rem,2rem)] leading-tight font-semibold text-primary tabular-nums">
                  {metric.value}
                </div>
                <div className="font-display text-[clamp(0.92rem,0.18vw+0.88rem,1.02rem)] leading-snug font-semibold text-ink">
                  {metric.label}
                </div>
                <div className="text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-relaxed font-normal text-muted tabular-nums">
                  {metric.detail}
                </div>
              </SurfaceCard>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 2. Official Studio 1080p Bilingual Launch Trailer */}
      <section aria-labelledby="home-trailer-heading" className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold uppercase tracking-widest text-primary">
            {t.trailer.eyebrow}
          </div>
          <h2
            id="home-trailer-heading"
            className="font-display text-[clamp(1.5rem,2.2vw+0.75rem,2.35rem)] leading-[1.16] font-semibold tracking-tight text-ink"
          >
            {t.trailer.title}
          </h2>
          <p className="max-w-prose text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-relaxed font-normal text-muted">
            {t.trailer.subtitle}
          </p>
        </div>
        <TrailerPlayer />
      </section>

      {/* 3. Smart-Hybrid TIER 0 vs TIER 1 & Multi-Engine Council Visualizer */}
      <section aria-labelledby="home-swarm-heading" className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold uppercase tracking-widest text-primary">
            {t.swarm.eyebrow}
          </div>
          <h2
            id="home-swarm-heading"
            className="font-display text-[clamp(1.5rem,2.2vw+0.75rem,2.35rem)] leading-[1.16] font-semibold tracking-tight text-ink"
          >
            {t.swarm.title}
          </h2>
          <p className="max-w-prose text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-relaxed font-normal text-muted">
            {t.swarm.subtitle}
          </p>
        </div>
        <SwarmVisualizer />
      </section>

      {/* 4. 12 Deterministic CLI Compilers & Gates Playground */}
      <section aria-labelledby="home-cli-heading" className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold uppercase tracking-widest text-primary">
            {t.cliPlayground.eyebrow}
          </div>
          <h2
            id="home-cli-heading"
            className="font-display text-[clamp(1.5rem,2.2vw+0.75rem,2.35rem)] leading-[1.16] font-semibold tracking-tight text-ink"
          >
            {t.cliPlayground.title}
          </h2>
          <p className="max-w-prose text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-relaxed font-normal text-muted">
            {t.cliPlayground.subtitle}
          </p>
        </div>
        <CliPlayground />
      </section>

      {/* 5. Unified 5-Platform Matrix & Pure 1-Click Safe Installer */}
      <section aria-labelledby="home-platforms-heading" className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold uppercase tracking-widest text-primary">
            {t.platformsSection.eyebrow}
          </div>
          <h2
            id="home-platforms-heading"
            className="font-display text-[clamp(1.5rem,2.2vw+0.75rem,2.35rem)] leading-[1.16] font-semibold tracking-tight text-ink"
          >
            {t.platformsSection.title}
          </h2>
          <p className="max-w-prose text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-relaxed font-normal text-muted">
            {t.platformsSection.subtitle}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t.platformsSection.tabsAriaLabel}
          className="grid grid-cols-2 gap-2 rounded-2xl border border-hairline bg-card p-1.5 sm:grid-cols-3 lg:grid-cols-5 specular-surface"
        >
          {PLATFORMS.map((platform, idx) => {
            const isSelected = platform.id === activePlatform.id;
            return (
              <button
                key={platform.id}
                ref={(el) => {
                  platformTabRefs.current[idx] = el;
                }}
                id={`platform-tab-${platform.id}`}
                role="tab"
                type="button"
                tabIndex={isSelected ? 0 : -1}
                aria-selected={isSelected}
                aria-controls={`platform-panel-${platform.id}`}
                onClick={() => setSelectedPlatformId(platform.id)}
                onKeyDown={(event) => handlePlatformKeyDown(event, idx)}
                className={clsx(
                  'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border px-3 py-2.5 text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  isSelected
                    ? 'border-primary bg-primary text-primary-ink font-semibold'
                    : 'border-transparent bg-canvas/60 text-muted hover:border-line-strong hover:text-ink font-normal',
                )}
              >
                <Cpu aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">{platform.name}</span>
              </button>
            );
          })}
        </div>

        {activePlatform && (
          <SurfaceCard
            id={`platform-panel-${activePlatform.id}`}
            role="tabpanel"
            aria-labelledby={`platform-tab-${activePlatform.id}`}
            variant="elevated"
            className="space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-display text-[clamp(1.2rem,0.5vw+1rem,1.5rem)] leading-tight font-semibold text-ink">
                  {activePlatform.name}
                </h3>
                <div className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-muted">
                  {`${activePlatform.vendor} • v${KIT_STATS.version}`}
                </div>
              </div>
              <StatusBadge tone="emerald">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                <span>Native v5.5 Parity</span>
              </StatusBadge>
            </div>

            <p className="max-w-prose text-[clamp(0.92rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
              {pick(activePlatform.summary)}
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[10px] border border-hairline bg-canvas p-3.5 space-y-1">
                <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold text-muted">
                  {t.platformsSection.entryPointLabel}
                </div>
                <code className="block overflow-x-auto font-mono text-[clamp(0.8rem,0.12vw+0.77rem,0.86rem)] leading-relaxed font-normal text-cobalt">
                  {activePlatform.entryFile}
                </code>
              </div>
              <div className="rounded-[10px] border border-hairline bg-canvas p-3.5 space-y-1">
                <div className="font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-semibold text-muted">
                  {t.platformsSection.installPathLabel}
                </div>
                <code className="block overflow-x-auto font-mono text-[clamp(0.8rem,0.12vw+0.77rem,0.86rem)] leading-relaxed font-normal text-accent">
                  {activePlatform.frameworkPath}
                </code>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <CopyCommandBar
                label={t.platformsSection.safeInstallLabel}
                command={activePlatform.installCommand}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
              />
              <CopyCommandBar
                label={t.platformsSection.verifyDoctorLabel}
                command={activePlatform.verifyCommand}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
              />
            </div>

            <div className="flex items-center gap-2 font-mono text-[clamp(0.74rem,0.1vw+0.71rem,0.8rem)] leading-relaxed font-normal text-muted">
              <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
              <span>{t.platformsSection.safetyGuarantee}</span>
            </div>
          </SurfaceCard>
        )}
      </section>
    </div>
  );
}
export default HomePage;
