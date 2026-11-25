import { useRef, useState, type KeyboardEvent } from 'react'
import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, GitBranch, Lock } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import { CopyCommandBar, StatusBadge } from '../ui/Primitives'

/**
 * Monochrome execution topology visualizer: contrasts direct Mode A execution,
 * 3-wave contract-first shards, and adversarial Multi-Engine Council review.
 */
type SwarmModeId = 'tier0' | 'tier1' | 'council'

const SWARM_MODES: readonly SwarmModeId[] = ['tier1', 'tier0', 'council']
const TIER0_VERIFY_CMD = 'boomopen check ./src --strict-phase --no-stubs'
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

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
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % SWARM_MODES.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + SWARM_MODES.length) % SWARM_MODES.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = SWARM_MODES.length - 1
    }
    if (nextIndex !== null) {
      event.preventDefault()
      const nextMode = SWARM_MODES[nextIndex]
      setActiveMode(nextMode)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  const activeWave = t.swarm.tier1.waves[selectedWaveIdx] ?? t.swarm.tier1.waves[0]

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={t.swarm.eyebrow}
        className="grid grid-cols-1 gap-1.5 rounded-xl border border-hairline bg-[#0B0B0E] p-1.5 sm:grid-cols-3"
      >
        {SWARM_MODES.map((modeId, index) => {
          const isSelected = activeMode === modeId
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
                'inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border px-4 py-2 text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] leading-snug transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                isSelected
                  ? 'border-line-strong bg-elevated text-ink font-medium'
                  : 'border-transparent bg-transparent text-muted hover:text-ink font-normal',
              )}
            >
              <span className="font-mono text-xs text-subtle tabular-nums">{`0${index + 1}`}</span>
              <span>{tabLabels[modeId]}</span>
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeMode}
        id={`swarm-panel-${activeMode}`}
        role="tabpanel"
        aria-labelledby={`swarm-tab-${activeMode}`}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="rounded-2xl border border-hairline bg-[#0B0B0E] p-5 sm:p-6"
      >
        {activeMode === 'tier0' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="neutral">{t.swarm.tier0.badge}</StatusBadge>
              <StatusBadge tone="neutral">{t.swarm.tier0.latencyBadge}</StatusBadge>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-[clamp(1.2rem,0.5vw+1rem,1.5rem)] leading-tight font-semibold text-ink">
                {t.swarm.tier0.title}
              </h3>
              <div className="font-mono text-xs leading-snug text-subtle tabular-nums">
                {t.swarm.tier0.trigger}
              </div>
              <p className="max-w-prose text-[clamp(0.9rem,0.12vw+0.87rem,0.975rem)] leading-relaxed text-muted">
                {t.swarm.tier0.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {t.swarm.tier0.steps.map((step, idx) => (
                <div key={idx} className="space-y-2 rounded-xl border border-hairline bg-card/50 p-4">
                  <span className="font-mono text-xs leading-none text-subtle tabular-nums">
                    {`0${idx + 1}`}
                  </span>
                  <div className="max-w-prose text-[clamp(0.84rem,0.1vw+0.81rem,0.9rem)] leading-relaxed text-ink">
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
                <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
                <span>{t.swarm.tier0.outcome}</span>
              </StatusBadge>
            </div>
          </div>
        )}

        {activeMode === 'tier1' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="neutral">{t.swarm.tier1.badge}</StatusBadge>
              <StatusBadge tone="neutral">
                <Lock aria-hidden="true" className="size-3 text-subtle" />
                <span>{t.swarm.tier1.lockBadge}</span>
              </StatusBadge>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-[clamp(1.2rem,0.5vw+1rem,1.5rem)] leading-tight font-semibold text-ink">
                {t.swarm.tier1.title}
              </h3>
              <div className="font-mono text-xs leading-snug text-subtle tabular-nums">
                {t.swarm.tier1.trigger}
              </div>
              <p className="max-w-prose text-[clamp(0.9rem,0.12vw+0.87rem,0.975rem)] leading-relaxed text-muted">
                {t.swarm.tier1.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {t.swarm.tier1.waves.map((item, idx) => {
                const isActiveWave = selectedWaveIdx === idx
                const gateTag =
                  item.wave === 'Wave 1'
                    ? 'PLAN-G1..G5'
                    : item.wave === 'Wave 2'
                      ? 'OWNED_FILES'
                      : item.wave === 'Wave 2.5'
                        ? 'REC-G1..G4'
                        : 'COOK-G1..G4'
                return (
                  <button
                    key={item.wave}
                    type="button"
                    aria-pressed={isActiveWave}
                    onClick={() => setSelectedWaveIdx(idx)}
                    className={clsx(
                      'flex min-h-11 flex-col items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      isActiveWave
                        ? 'border-line-strong bg-elevated text-ink'
                        : 'border-hairline bg-card/40 text-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    <div className="w-full space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs leading-none font-medium text-ink tabular-nums">
                          {item.wave}
                        </span>
                        <span className="font-mono text-[11px] leading-none text-subtle tabular-nums">
                          {gateTag}
                        </span>
                      </div>
                      <div className="font-display text-[clamp(0.95rem,0.2vw+0.9rem,1.05rem)] leading-snug font-semibold text-ink">
                        {item.title}
                      </div>
                      <div className="max-w-prose text-xs leading-relaxed text-muted">
                        {item.summary}
                      </div>
                    </div>
                    <code className="w-full truncate rounded-md border border-hairline bg-[#070709] px-2.5 py-1.5 font-mono text-[11px] leading-snug text-muted tabular-nums">
                      {item.shardSpec}
                    </code>
                  </button>
                )
              })}
            </div>

            {activeWave && (
              <div className="grid gap-4 rounded-xl border border-hairline bg-card/40 p-4 lg:grid-cols-12 lg:items-center">
                <div className="space-y-1 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <GitBranch aria-hidden="true" className="size-4 text-subtle" />
                    <span className="font-mono text-xs leading-snug font-medium text-ink">
                      {`${activeWave.wave} · ${activeWave.contractBadge}`}
                    </span>
                  </div>
                  <div className="font-mono text-xs leading-snug text-muted">
                    {activeWave.shardSpec}
                  </div>
                </div>
                <div className="space-y-1 border-t border-hairline pt-3 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm leading-snug font-semibold text-ink">
                      {t.swarm.tier1.warmReuseTitle}
                    </span>
                    <StatusBadge tone="neutral">{t.swarm.tier1.warmReuseBadge}</StatusBadge>
                  </div>
                  <p className="max-w-prose text-xs leading-relaxed text-muted">
                    {t.swarm.tier1.warmReuseSummary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'council' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="neutral">{t.swarm.council.badge}</StatusBadge>
              <StatusBadge tone="emerald">
                <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
                <span>{t.swarm.council.invariantBadge}</span>
              </StatusBadge>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-[clamp(1.2rem,0.5vw+1rem,1.5rem)] leading-tight font-semibold text-ink">
                {t.swarm.council.title}
              </h3>
              <p className="max-w-prose text-[clamp(0.9rem,0.12vw+0.87rem,0.975rem)] leading-relaxed text-muted">
                {t.swarm.council.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(['Claude Code', 'OpenAI Codex', 'Antigravity'] as const).map((engine, idx) => (
                <div key={engine} className="space-y-1.5 rounded-xl border border-hairline bg-card/50 p-4">
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-subtle tabular-nums">
                    <span>{`0${idx + 1}`}</span>
                    <span>Author != Critic</span>
                  </div>
                  <div className="font-display text-base leading-snug font-semibold text-ink">
                    {engine}
                  </div>
                </div>
              ))}
            </div>

            <ul className="grid gap-3 md:grid-cols-3">
              {t.swarm.council.highlights.map((item, idx) => (
                <li
                  key={idx}
                  className="rounded-xl border border-hairline bg-card/30 p-3.5 text-[clamp(0.82rem,0.1vw+0.8rem,0.88rem)] leading-relaxed text-muted"
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
              compact
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
