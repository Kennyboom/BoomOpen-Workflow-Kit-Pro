import { useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { AlertOctagon, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react'
import { CLI_COMMANDS } from '../../data/cliSuite'
import { useLanguage } from '../../i18n/context'
import type { CliCommandId, CliCommandSpec } from '../../types/ui-contract'
import { CopyCommandBar, EmptyCatalogState, FilterPill, StatusBadge } from '../ui/Primitives'

/**
 * Monochrome interactive explorer for all 14 CLI compilers and gates:
 * clean single-border #0B0B0E terminal chrome with Pass (Exit 0) vs Fail (Exit 1) output.
 */
type CliCategoryFilter = 'all' | CliCommandSpec['category']
type SimulationMode = 'pass' | 'fail'

const CATEGORY_ORDER: readonly CliCategoryFilter[] = ['all', 'compiler', 'orchestration', 'lifecycle']
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export function CliPlayground() {
  const { t, pick } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<CliCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<CliCommandId>('plan')
  const [simMode, setSimMode] = useState<SimulationMode>('pass')

  const categoryCounts = useMemo(() => {
    return {
      all: CLI_COMMANDS.length,
      compiler: CLI_COMMANDS.filter((item) => item.category === 'compiler').length,
      orchestration: CLI_COMMANDS.filter((item) => item.category === 'orchestration').length,
      lifecycle: CLI_COMMANDS.filter((item) => item.category === 'lifecycle').length,
    }
  }, [])

  const filteredCommands = useMemo(() => {
    if (activeCategory === 'all') {
      return CLI_COMMANDS
    }
    return CLI_COMMANDS.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  const activeCommand: CliCommandSpec | undefined = useMemo(() => {
    const exact = filteredCommands.find((item) => item.id === selectedId)
    return exact ?? filteredCommands[0]
  }, [filteredCommands, selectedId])

  const handleCategoryChange = (category: CliCategoryFilter) => {
    setActiveCategory(category)
    const nextList =
      category === 'all' ? CLI_COMMANDS : CLI_COMMANDS.filter((item) => item.category === category)
    if (nextList.length > 0 && !nextList.some((item) => item.id === selectedId)) {
      setSelectedId(nextList[0].id)
    }
  }

  return (
    <div className="space-y-5">
      <div
        role="group"
        aria-label={t.cliPlayground.eyebrow}
        className="flex flex-wrap items-center gap-2"
      >
        {CATEGORY_ORDER.map((category) => (
          <FilterPill
            key={category}
            label={t.cliPlayground.categories[category]}
            count={categoryCounts[category]}
            active={activeCategory === category}
            onSelect={() => handleCategoryChange(category)}
          />
        ))}
      </div>

      {!activeCommand ? (
        <EmptyCatalogState
          title={t.cliPlayground.emptyTitle}
          description={t.cliPlayground.strictHint}
          resetLabel={t.cliPlayground.resetAllCta}
          onReset={() => handleCategoryChange('all')}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="grid content-start grid-cols-2 gap-1.5 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1">
            {filteredCommands.map((cmd) => {
              const isSelected = cmd.id === activeCommand.id
              return (
                <button
                  key={cmd.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(cmd.id)}
                  className={clsx(
                    'flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    isSelected
                      ? 'border-line-strong bg-elevated text-ink font-medium'
                      : 'border-hairline bg-transparent text-muted hover:border-line-strong hover:text-ink font-normal',
                  )}
                >
                  <span className="flex items-center gap-2 truncate font-mono text-[clamp(0.8rem,0.1vw+0.78rem,0.875rem)] leading-snug">
                    <Terminal
                      aria-hidden="true"
                      className={clsx('size-3.5 shrink-0', isSelected ? 'text-ink' : 'text-subtle')}
                    />
                    <span className="truncate">{`boomopen ${cmd.id}`}</span>
                  </span>
                  <span
                    className={clsx(
                      'shrink-0 rounded px-1.5 py-0.5 font-mono text-[11px] leading-none tabular-nums',
                      isSelected ? 'bg-white/[0.08] text-ink font-medium' : 'bg-white/[0.03] text-subtle font-normal',
                    )}
                  >
                    {`${cmd.gates.length}G`}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-hairline bg-[#0B0B0E] lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-card/40 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span aria-hidden="true" className="hidden items-center gap-1.5 sm:inline-flex">
                  <span className="size-2.5 rounded-full bg-white/[0.14]" />
                  <span className="size-2.5 rounded-full bg-white/[0.14]" />
                  <span className="size-2.5 rounded-full bg-white/[0.14]" />
                </span>
                <span className="font-mono text-xs font-medium text-ink">{`boomopen ${activeCommand.id}`}</span>
                <StatusBadge tone={simMode === 'pass' ? 'emerald' : 'danger'}>
                  {simMode === 'pass' ? (
                    <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
                  ) : (
                    <AlertOctagon aria-hidden="true" className="size-3.5" />
                  )}
                  <span>
                    {simMode === 'pass' ? t.cliPlayground.statusPassBadge : t.cliPlayground.statusFailBadge}
                  </span>
                </StatusBadge>
              </div>

              <div
                role="group"
                aria-label={t.cliPlayground.outputLabel}
                className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-[#070709] p-0.5"
              >
                <button
                  type="button"
                  aria-pressed={simMode === 'pass'}
                  onClick={() => setSimMode('pass')}
                  className={clsx(
                    'inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-mono text-xs leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    simMode === 'pass'
                      ? 'bg-white/[0.08] text-ink font-medium'
                      : 'text-muted hover:text-ink font-normal',
                  )}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className={clsx('size-3.5', simMode === 'pass' ? 'text-accent' : 'text-subtle')}
                  />
                  <span>{t.cliPlayground.passToggleLabel}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={simMode === 'fail'}
                  onClick={() => setSimMode('fail')}
                  className={clsx(
                    'inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 font-mono text-xs leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    simMode === 'fail'
                      ? 'bg-white/[0.08] text-ink font-medium'
                      : 'text-muted hover:text-ink font-normal',
                  )}
                >
                  <ShieldAlert aria-hidden="true" className="size-3.5 text-subtle" />
                  <span>{t.cliPlayground.failToggleLabel}</span>
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <p className="max-w-prose text-[clamp(0.88rem,0.12vw+0.85rem,0.95rem)] leading-relaxed text-muted">
                {pick(activeCommand.summary)}
              </p>

              <div className="space-y-1.5">
                <div className="text-xs leading-snug font-medium text-subtle">
                  {t.cliPlayground.gatesLabel}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeCommand.gates.map((gate) => (
                    <StatusBadge key={gate} tone="neutral">
                      {gate}
                    </StatusBadge>
                  ))}
                </div>
              </div>

              <CopyCommandBar
                label={t.cliPlayground.invocationLabel}
                command={activeCommand.invocation}
                copyLabel={t.common.copy}
                copiedLabel={t.common.copied}
                manualCopyHint={t.common.copyManualHint}
                compact
              />

              <div className="overflow-hidden rounded-xl border border-hairline bg-[#070709]">
                <div className="flex items-center justify-between border-b border-hairline px-3.5 py-2 font-mono text-xs leading-none text-subtle tabular-nums">
                  <span>{t.cliPlayground.outputLabel}</span>
                  <span className={simMode === 'pass' ? 'text-accent font-medium' : 'text-muted font-medium'}>
                    {simMode === 'pass' ? 'exit code 0' : 'exit code 1'}
                  </span>
                </div>
                <pre
                  aria-live="polite"
                  className="overflow-x-auto p-4 font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.825rem)] leading-relaxed text-muted tabular-nums"
                >
                  <code>{simMode === 'pass' ? activeCommand.passOutput : activeCommand.failOutput}</code>
                </pre>
              </div>

              <div className="font-mono text-xs leading-relaxed text-subtle">
                {t.cliPlayground.strictHint}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
