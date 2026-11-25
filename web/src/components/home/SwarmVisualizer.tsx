import { useRef, useState, type KeyboardEvent } from 'react'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, GitBranch, Layers, Lock, ShieldCheck, Zap } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Dictionary } from '../../i18n/types'
import { CopyCommandBar, StatusBadge } from '../ui/Primitives'

/**
 * Widescreen 1400px interactive multi-agent orchestration stage inside a hardware bezel:
 * contrasts Mode A direct execution, 4-column connected Wave shards, and Multi-Engine Council.
 */
type SwarmModeId = 'tier0' | 'tier1' | 'council'

const SWARM_MODES: readonly SwarmModeId[] = ['tier1', 'tier0', 'council']
const TIER0_VERIFY_CMD = 'boomopen check ./src --strict-phase --no-stubs'
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function resolveWaveMeta(wave: string): { readonly label: string; readonly gateTag: string } {
  if (wave === 'Wave 1') return { label: 'Wave 1', gateTag: 'PLAN-G1..G5' }
  if (wave === 'Wave 2') return { label: 'Wave 2', gateTag: 'OWNED_FILES' }
  if (wave === 'Wave 2.5') return { label: 'Wave 2.5 Reconcile', gateTag: 'REC-G1..G4' }
  return { label: 'Wave 3', gateTag: 'COOK-G1..G4' }
}

function TierZeroStage({ t }: { readonly t: Dictionary }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="emerald">{t.swarm.tier0.badge}</StatusBadge>
          <StatusBadge tone="neutral">{t.swarm.tier0.latencyBadge}</StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-tight font-bold tracking-[-0.025em] text-ink lg:text-[28px]">
          {t.swarm.tier0.title}
        </h3>
        <div className="font-mono text-xs text-subtle tabular-nums sm:text-sm">{t.swarm.tier0.trigger}</div>
        <p className="max-w-[68ch] text-base leading-relaxed text-muted lg:text-[17px]">
          {t.swarm.tier0.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {t.swarm.tier0.steps.map((step, idx) => (
          <div
            key={idx}
            className="specular-surface flex flex-col justify-between gap-4 rounded-2xl border border-white/[0.09] bg-[#07080B] p-6"
          >
            <span className="inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] font-mono text-xs font-semibold text-ink tabular-nums">
              {`0${idx + 1}`}
            </span>
            <p className="text-[15px] leading-relaxed text-ink/95">{step}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.09] bg-[#07080B] p-5 lg:flex-row lg:items-center lg:justify-between">
        <CopyCommandBar
          command={TIER0_VERIFY_CMD}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
          manualCopyHint={t.common.copyManualHint}
          compact
          className="flex-1"
        />
        <StatusBadge tone="emerald" className="self-start px-3 py-1.5 lg:self-center">
          <CheckCircle2 aria-hidden="true" className="size-4 text-accent" />
          <span>{t.swarm.tier0.outcome}</span>
        </StatusBadge>
      </div>
    </div>
  )
}

function TierOneStage({
  t,
  selectedWaveIdx,
  onSelectWave,
}: {
  readonly t: Dictionary
  readonly selectedWaveIdx: number
  readonly onSelectWave: (index: number) => void
}) {
  const waves = t.swarm.tier1.waves
  const activeWave = waves[selectedWaveIdx] ?? waves[0]

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="emerald">{t.swarm.tier1.badge}</StatusBadge>
          <StatusBadge tone="neutral">
            <Lock aria-hidden="true" className="size-3.5 text-accent" />
            <span>{t.swarm.tier1.lockBadge}</span>
          </StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-tight font-bold tracking-[-0.025em] text-ink lg:text-[28px]">
          {t.swarm.tier1.title}
        </h3>
        <div className="font-mono text-xs text-subtle tabular-nums sm:text-sm">{t.swarm.tier1.trigger}</div>
        <p className="max-w-[70ch] text-base leading-relaxed text-muted lg:text-[17px]">
          {t.swarm.tier1.description}
        </p>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {waves.map((item, idx) => {
          const isActiveWave = selectedWaveIdx === idx
          const { label, gateTag } = resolveWaveMeta(item.wave)
          const isLast = idx === waves.length - 1
          return (
            <button
              key={item.wave}
              type="button"
              aria-pressed={isActiveWave}
              onClick={() => onSelectWave(idx)}
              className={clsx(
                'specular-surface relative flex min-h-[260px] flex-col items-start justify-between gap-5 rounded-2xl border p-5 text-left transition-all duration-150 motion-reduce:transition-none lg:p-6 cursor-pointer',
                FOCUS_RING,
                isActiveWave
                  ? 'border-accent/55 bg-elevated text-ink shadow-[0_0_34px_-8px_oklch(0.74_0.14_160/0.35)] ring-1 ring-accent/25'
                  : 'border-white/[0.09] bg-[#07080B] text-muted hover:border-white/[0.22] hover:bg-card/85 hover:text-ink',
              )}
            >
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={clsx(
                        'inline-flex size-8 items-center justify-center rounded-lg border font-mono text-xs font-bold tabular-nums',
                        isActiveWave
                          ? 'border-accent/40 bg-accent/15 text-accent'
                          : 'border-white/[0.12] bg-white/[0.04] text-ink',
                      )}
                    >
                      {`0${idx + 1}`}
                    </span>
                    <span className="font-mono text-xs font-semibold text-ink">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-subtle tabular-nums">
                      {gateTag}
                    </span>
                    {!isLast && (
                      <ArrowRight
                        aria-hidden="true"
                        className={clsx('hidden size-3.5 xl:block', isActiveWave ? 'text-accent' : 'text-subtle')}
                      />
                    )}
                  </div>
                </div>

                <div className="font-display text-base leading-snug font-semibold text-ink lg:text-[17px]">
                  {item.title}
                </div>

                <p className="text-sm leading-relaxed text-muted lg:text-[15px]">{item.summary}</p>
              </div>

              <code className="w-full truncate rounded-xl border border-white/[0.08] bg-[#040507] px-3 py-2 font-mono text-xs text-ink/85 tabular-nums">
                {item.shardSpec}
              </code>
            </button>
          )
        })}
      </div>

      {activeWave && (
        <div className="grid gap-5 rounded-2xl border border-white/[0.10] bg-[#07080B] p-5 sm:p-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-2 lg:col-span-6">
            <div className="flex flex-wrap items-center gap-2">
              <GitBranch aria-hidden="true" className="size-4 text-accent" />
              <span className="font-mono text-xs font-semibold text-ink sm:text-sm">
                {`${activeWave.wave} | ${activeWave.contractBadge}`}
              </span>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#040507] px-3.5 py-2 font-mono text-xs leading-relaxed text-ink/90">
              {activeWave.shardSpec}
            </div>
          </div>

          <div className="space-y-1.5 border-t border-white/[0.08] pt-4 lg:col-span-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[15px] font-semibold text-ink">
                {t.swarm.tier1.warmReuseTitle}
              </span>
              <StatusBadge tone="emerald">{t.swarm.tier1.warmReuseBadge}</StatusBadge>
            </div>
            <p className="text-sm leading-relaxed text-muted">{t.swarm.tier1.warmReuseSummary}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function CouncilStage({ t }: { readonly t: Dictionary }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="neutral">{t.swarm.council.badge}</StatusBadge>
          <StatusBadge tone="emerald">
            <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
            <span>{t.swarm.council.invariantBadge}</span>
          </StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-tight font-bold tracking-[-0.025em] text-ink lg:text-[28px]">
          {t.swarm.council.title}
        </h3>
        <p className="max-w-[68ch] text-base leading-relaxed text-muted lg:text-[17px]">
          {t.swarm.council.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(['Claude Code', 'OpenAI Codex', 'Antigravity'] as const).map((engine, idx) => (
          <div
            key={engine}
            className="specular-surface space-y-2.5 rounded-2xl border border-white/[0.09] bg-[#07080B] p-5 lg:p-6"
          >
            <div className="flex items-center justify-between gap-2 font-mono text-xs text-subtle tabular-nums">
              <span>{`LANE 0${idx + 1}`}</span>
              <span className="text-accent">Author != Critic</span>
            </div>
            <div className="font-display text-lg font-bold text-ink">{engine}</div>
          </div>
        ))}
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {t.swarm.council.highlights.map((item, idx) => (
          <li
            key={idx}
            className="rounded-2xl border border-white/[0.08] bg-[#07080B] p-5 text-[15px] leading-relaxed text-muted"
          >
            {item}
          </li>
        ))}
      </ul>

      <CopyCommandBar
        label={t.swarm.council.synthesisPath}
        command={t.swarm.council.command}
        copyLabel={t.common.copy}
        copiedLabel={t.common.copied}
        manualCopyHint={t.common.copyManualHint}
      />
    </div>
  )
}

export function SwarmVisualizer() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const [activeMode, setActiveMode] = useState<SwarmModeId>('tier1')
  const [selectedWaveIdx, setSelectedWaveIdx] = useState<number>(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const tabLabels: Readonly<Record<SwarmModeId, string>> = {
    tier0: t.swarm.tabs.tier0,
    tier1: t.swarm.tabs.tier1,
    council: t.swarm.tabs.council,
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % SWARM_MODES.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + SWARM_MODES.length) % SWARM_MODES.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = SWARM_MODES.length - 1

    if (nextIndex !== null) {
      event.preventDefault()
      setActiveMode(SWARM_MODES[nextIndex])
      tabRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="hardware-bezel">
      <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#07080C] p-3 sm:p-5 lg:p-6">
        <div
          role="tablist"
          aria-label={t.swarm.eyebrow}
          className="grid grid-cols-1 gap-2 rounded-2xl border border-white/[0.09] bg-[#040507] p-2 lg:grid-cols-3"
        >
        {SWARM_MODES.map((modeId, index) => {
          const isSelected = activeMode === modeId
          const ModeIcon = modeId === 'tier1' ? Layers : modeId === 'tier0' ? Zap : ShieldCheck
          return (
            <button
              key={modeId}
              ref={(el) => {
                tabRefs.current[index] = el
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
                'inline-flex min-h-13 items-center justify-center gap-3 rounded-xl border px-6 py-3 text-base leading-snug transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                isSelected
                  ? 'border-white/[0.18] bg-elevated text-ink font-semibold shadow-sm'
                  : 'border-transparent bg-transparent text-muted hover:bg-white/[0.03] hover:text-ink font-medium',
              )}
            >
              <ModeIcon aria-hidden="true" className={clsx('size-4 shrink-0', isSelected ? 'text-accent' : 'text-subtle')} />
              <span>{tabLabels[modeId]}</span>
              <span className="font-mono text-xs text-subtle tabular-nums">{`0${index + 1}`}</span>
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeMode}
        id={`swarm-panel-${activeMode}`}
        role="tabpanel"
        aria-labelledby={`swarm-tab-${activeMode}`}
        initial={reduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0B0C11] p-6 sm:p-8 lg:p-10"
      >
        {activeMode === 'tier0' && <TierZeroStage t={t} />}
        {activeMode === 'tier1' && (
          <TierOneStage t={t} selectedWaveIdx={selectedWaveIdx} onSelectWave={setSelectedWaveIdx} />
        )}
        {activeMode === 'council' && <CouncilStage t={t} />}
        </motion.div>
      </div>
    </div>
  )
}
