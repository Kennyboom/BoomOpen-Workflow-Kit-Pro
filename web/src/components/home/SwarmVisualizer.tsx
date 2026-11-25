import { useRef, useState, type KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Cpu, GitBranch, Layers, Lock, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n/context';
import { CopyCommandBar, StatusBadge, SurfaceCard } from '../ui/Primitives';

/**
 * Mission: interactive Smart-Hybrid topology visualizer contrasting TIER 0 direct execution,
 * TIER 1 3-wave contract-first shards, and trusted Multi-Engine Council review across 1,462 skills.
 */
type SwarmModeId = 'tier0' | 'tier1' | 'council';

const SWARM_MODES: readonly SwarmModeId[] = ['tier1', 'tier0', 'council'];
const TIER0_VERIFY_CMD = 'boomopen check ./src --strict-phase --no-stubs';
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

export function SwarmVisualizer() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [activeMode, setActiveMode] = useState<SwarmModeId>('tier1');
  const [selectedWaveIdx, setSelectedWaveIdx] = useState<number>(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabLabels: Readonly<Record<SwarmModeId, string>> = {
    tier0: t.swarm.tabs.tier0,
    tier1: t.swarm.tabs.tier1,
    council: t.swarm.tabs.council,
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % SWARM_MODES.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + SWARM_MODES.length) % SWARM_MODES.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = SWARM_MODES.length - 1;
    }
    if (nextIndex !== null) {
      event.preventDefault();
      const nextMode = SWARM_MODES[nextIndex];
      setActiveMode(nextMode);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const activeWave = t.swarm.tier1.waves[selectedWaveIdx] ?? t.swarm.tier1.waves[0];

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label={t.swarm.eyebrow}
        className="grid grid-cols-1 gap-2 rounded-2xl border border-hairline bg-card p-1.5 sm:grid-cols-3 specular-surface"
      >
        {SWARM_MODES.map((modeId, index) => {
          const isSelected = activeMode === modeId;
          const Icon = modeId === 'tier0' ? Zap : modeId === 'tier1' ? Layers : ShieldCheck;
          return (
            <button
              key={modeId}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`swarm-tab-${modeId}`}
              role="tab"
              type="button"
              tabIndex={isSelected ? 0 : -1}
              aria-selected={isSelected}
              aria-controls={`swarm-panel-${modeId}`}
              onClick={() => setActiveMode(modeId)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={clsx(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-[clamp(0.84rem,0.14vw+0.81rem,0.925rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                isSelected
                  ? 'border-primary bg-primary text-primary-ink font-semibold'
                  : 'border-transparent bg-canvas/60 text-muted hover:border-line-strong hover:text-ink font-normal',
              )}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{tabLabels[modeId]}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeMode}
        id={`swarm-panel-${activeMode}`}
        role="tabpanel"
        aria-labelledby={`swarm-tab-${activeMode}`}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {activeMode === 'tier0' && (
          <SurfaceCard variant="elevated" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="amber">{t.swarm.tier0.badge}</StatusBadge>
              <StatusBadge tone="emerald">{t.swarm.tier0.latencyBadge}</StatusBadge>
            </div>
            <div className="space-y-2">
              <div className="font-display text-[clamp(1.25rem,0.6vw+1.05rem,1.6rem)] leading-tight font-semibold text-ink">
                {t.swarm.tier0.title}
              </div>
              <div className="font-mono text-[clamp(0.78rem,0.12vw+0.75rem,0.85rem)] leading-snug font-normal text-cobalt tabular-nums">
                {t.swarm.tier0.trigger}
              </div>
              <p className="max-w-prose text-[clamp(0.92rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
                {t.swarm.tier0.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {t.swarm.tier0.steps.map((step, idx) => (
                <div key={idx} className="rounded-[10px] border border-hairline bg-canvas p-4 space-y-2">
                  <span className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-none font-semibold text-primary tabular-nums">
                    {`0${idx + 1}`}
                  </span>
                  <div className="max-w-prose text-[clamp(0.85rem,0.12vw+0.82rem,0.92rem)] leading-relaxed font-normal text-ink">
                    {step}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CopyCommandBar
                command={TIER0_VERIFY_CMD}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
                compact
                className="flex-1"
              />
              <StatusBadge tone="emerald" className="self-start lg:self-center">
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
                <span>{t.swarm.tier0.outcome}</span>
              </StatusBadge>
            </div>
          </SurfaceCard>
        )}

        {activeMode === 'tier1' && (
          <SurfaceCard variant="elevated" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="amber">{t.swarm.tier1.badge}</StatusBadge>
              <StatusBadge tone="cobalt">
                <Lock aria-hidden="true" className="size-3.5" />
                <span>{t.swarm.tier1.lockBadge}</span>
              </StatusBadge>
            </div>

            <div className="space-y-2">
              <div className="font-display text-[clamp(1.25rem,0.6vw+1.05rem,1.6rem)] leading-tight font-semibold text-ink">
                {t.swarm.tier1.title}
              </div>
              <div className="font-mono text-[clamp(0.78rem,0.12vw+0.75rem,0.85rem)] leading-snug font-normal text-cobalt tabular-nums">
                {t.swarm.tier1.trigger}
              </div>
              <p className="max-w-prose text-[clamp(0.92rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
                {t.swarm.tier1.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {t.swarm.tier1.waves.map((item, idx) => {
                const isActiveWave = selectedWaveIdx === idx;
                const gateTag =
                  item.wave === 'Wave 1'
                    ? 'PLAN-G1..G5 + DESIGN-G1..G4'
                    : item.wave === 'Wave 2'
                      ? 'OWNED_FILES != READ_ONLY_FILES'
                      : item.wave === 'Wave 2.5'
                        ? 'REC-G1..G4 • boomopen reconcile'
                        : 'COOK-G1..G4 • 0s Reuse';
                return (
                  <button
                    key={item.wave}
                    type="button"
                    aria-pressed={isActiveWave}
                    onClick={() => setSelectedWaveIdx(idx)}
                    className={clsx(
                      'flex min-h-11 flex-col items-start justify-between gap-3 rounded-[10px] border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      isActiveWave
                        ? 'border-primary bg-canvas text-ink'
                        : 'border-hairline bg-canvas/60 text-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[clamp(0.76rem,0.1vw+0.74rem,0.82rem)] leading-none font-semibold text-primary tabular-nums">
                          {item.wave}
                        </span>
                        <span className="font-mono text-[clamp(0.7rem,0.1vw+0.68rem,0.75rem)] leading-none font-normal text-accent tabular-nums">
                          {gateTag}
                        </span>
                      </div>
                      <div className="font-display text-[clamp(1rem,0.25vw+0.94rem,1.125rem)] leading-snug font-semibold text-ink">
                        {item.title}
                      </div>
                      <div className="max-w-prose text-[clamp(0.82rem,0.12vw+0.8rem,0.89rem)] leading-relaxed font-normal text-muted">
                        {item.summary}
                      </div>
                    </div>
                    <code className="w-full truncate rounded bg-elevated px-2.5 py-1.5 font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-snug font-normal text-cobalt tabular-nums">
                      {item.shardSpec}
                    </code>
                  </button>
                );
              })}
            </div>

            {activeWave && (
              <div className="grid gap-3 rounded-[10px] border border-hairline bg-canvas p-4 lg:grid-cols-12 lg:items-center">
                <div className="space-y-1 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <GitBranch aria-hidden="true" className="size-4 text-primary" />
                    <span className="font-mono text-[clamp(0.78rem,0.1vw+0.75rem,0.84rem)] leading-snug font-semibold text-ink">
                      {`${activeWave.wave} • ${activeWave.contractBadge}`}
                    </span>
                  </div>
                  <div className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-cobalt">
                    {activeWave.shardSpec}
                  </div>
                </div>
                <div className="space-y-1 border-t border-hairline pt-3 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[clamp(0.9rem,0.15vw+0.86rem,0.98rem)] leading-snug font-semibold text-ink">
                      {t.swarm.tier1.warmReuseTitle}
                    </span>
                    <StatusBadge tone="emerald">{t.swarm.tier1.warmReuseBadge}</StatusBadge>
                  </div>
                  <p className="max-w-prose text-[clamp(0.82rem,0.12vw+0.8rem,0.89rem)] leading-relaxed font-normal text-muted">
                    {t.swarm.tier1.warmReuseSummary}
                  </p>
                </div>
              </div>
            )}
          </SurfaceCard>
        )}

        {activeMode === 'council' && (
          <SurfaceCard variant="elevated" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="cobalt">
                <Cpu aria-hidden="true" className="size-3.5" />
                <span>{t.swarm.council.badge}</span>
              </StatusBadge>
              <StatusBadge tone="emerald">{t.swarm.council.invariantBadge}</StatusBadge>
            </div>

            <div className="space-y-2">
              <div className="font-display text-[clamp(1.25rem,0.6vw+1.05rem,1.6rem)] leading-tight font-semibold text-ink">
                {t.swarm.council.title}
              </div>
              <p className="max-w-prose text-[clamp(0.92rem,0.15vw+0.88rem,1rem)] leading-relaxed font-normal text-muted">
                {t.swarm.council.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(['Claude Code', 'OpenAI Codex', 'Antigravity 2.0'] as const).map((engine, idx) => (
                <div key={engine} className="rounded-[10px] border border-hairline bg-canvas p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[clamp(0.74rem,0.1vw+0.71rem,0.8rem)] leading-none font-semibold text-primary tabular-nums">
                      {`LANE 0${idx + 1}`}
                    </span>
                    <span className="font-mono text-[clamp(0.72rem,0.1vw+0.69rem,0.76rem)] leading-none font-normal text-accent">
                      Author != Critic
                    </span>
                  </div>
                  <div className="font-display text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-snug font-semibold text-ink">
                    {engine}
                  </div>
                </div>
              ))}
            </div>

            <ul className="grid gap-2.5 md:grid-cols-3">
              {t.swarm.council.highlights.map((item, idx) => (
                <li key={idx} className="rounded-[10px] border border-hairline bg-canvas/70 p-3.5 text-[clamp(0.83rem,0.12vw+0.8rem,0.9rem)] leading-relaxed font-normal text-muted">
                  {item}
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <div className="font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-snug font-normal text-muted">
                {`Artifact -> ${t.swarm.council.synthesisPath}`}
              </div>
              <CopyCommandBar
                command={t.swarm.council.command}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
                compact
              />
            </div>
          </SurfaceCard>
        )}
      </motion.div>
    </div>
  );
}
