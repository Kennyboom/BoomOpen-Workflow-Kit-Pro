import { useMemo, useState } from 'react'
import { clsx } from 'clsx'
import { AlertOctagon, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react'
import { CLI_COMMANDS } from '../../data/cliSuite'
import { useLanguage } from '../../i18n/context'
import type { CliCommandId, CliCommandSpec } from '../../types/ui-contract'
import { CopyCommandBar, EmptyCatalogState, FilterPill, StatusBadge } from '../ui/Primitives'

/**
 * Full-size IDE Terminal Workbench for all 14 zero-dependency CLI compilers and gates:
 * 380px scrollable command directory paired with a macOS console and live Exit 0 / Exit 1 switch.
 */
type CliCategoryFilter = 'all' | CliCommandSpec['category']
type SimulationMode = 'pass' | 'fail'

const CATEGORY_ORDER: readonly CliCategoryFilter[] = ['all', 'compiler', 'orchestration', 'lifecycle']
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

function classifyConsoleLine(line: string): string {
  if (line.startsWith('$ ')) {
    return 'text-sky-300 font-semibold'
  }
  if (line.includes('PASS') || line.includes('[OK]') || line.includes('exit 0') || line.includes('Healthy')) {
    return 'text-emerald-400'
  }
  if (line.includes('FAIL') || line.includes('Violations: 2') || line.includes('exit 1') || line.includes('exit 2')) {
    return 'text-rose-400'
  }
  if (line.includes('[WARN]') || line.includes('HINT') || line.includes('[SKIP]')) {
    return 'text-amber-300'
  }
  if (line.startsWith('  ') || line.startsWith('-')) {
    return 'text-slate-400'
  }
  return 'text-slate-100'
}

interface CommandSidebarProps {
  readonly commands: readonly CliCommandSpec[]
  readonly activeId: CliCommandId
  readonly headingLabel: string
  readonly pick: (b: { readonly en: string; readonly vi: string }) => string
  readonly onSelect: (id: CliCommandId) => void
}

function CommandSidebar({ commands, activeId, headingLabel, pick, onSelect }: CommandSidebarProps) {
  return (
    <div className="flex flex-col bg-[#060A1B]/90">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-200/[0.12] px-5 py-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
          {headingLabel}
        </span>
        <span className="rounded-md border border-indigo-200/[0.15] bg-white/[0.06] px-2 py-0.5 font-mono text-xs font-medium text-slate-200 tabular-nums">
          {commands.length}
        </span>
      </div>

      <div className="grid max-h-[540px] content-start gap-2 overflow-y-auto p-3 sm:grid-cols-2 lg:grid-cols-1">
        {commands.map((cmd) => {
          const isSelected = cmd.id === activeId
          return (
            <button
              key={cmd.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(cmd.id)}
              className={clsx(
                'flex min-h-14 flex-col justify-between gap-1.5 rounded-xl border p-3.5 text-left transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                FOCUS_RING,
                isSelected
                  ? 'border-sky-400/45 bg-[#101A3B]/90 text-white shadow-[0_14px_34px_-10px_rgba(56,189,248,0.22)] ring-1 ring-sky-400/25'
                  : 'border-indigo-200/[0.12] bg-[#070B19]/75 text-slate-300 hover:border-indigo-200/25 hover:bg-[#0C1430]/85 hover:text-white',
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate font-mono text-[15px] leading-snug font-bold text-ink">
                  <Terminal
                    aria-hidden="true"
                    className={clsx('size-4 shrink-0', isSelected ? 'text-accent' : 'text-subtle')}
                  />
                  <span className="truncate">{`boomopen ${cmd.id}`}</span>
                </span>
                <span
                  className={clsx(
                    'shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] leading-none tabular-nums',
                    isSelected
                      ? 'border-sky-400/35 bg-sky-400/12 font-semibold text-sky-300'
                      : 'border-indigo-200/[0.14] bg-white/[0.05] text-slate-300',
                  )}
                >
                  {`${cmd.gates.length}G`}
                </span>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted">{pick(cmd.summary)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CliPlayground() {
  const { t, pick } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<CliCategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<CliCommandId>('plan')
  const [simMode, setSimMode] = useState<SimulationMode>('pass')

  const categoryCounts = useMemo(
    () => ({
      all: CLI_COMMANDS.length,
      compiler: CLI_COMMANDS.filter((item) => item.category === 'compiler').length,
      orchestration: CLI_COMMANDS.filter((item) => item.category === 'orchestration').length,
      lifecycle: CLI_COMMANDS.filter((item) => item.category === 'lifecycle').length,
    }),
    [],
  )

  const filteredCommands = useMemo(
    () =>
      activeCategory === 'all'
        ? CLI_COMMANDS
        : CLI_COMMANDS.filter((item) => item.category === activeCategory),
    [activeCategory],
  )

  const activeCommand: CliCommandSpec | undefined = useMemo(
    () => filteredCommands.find((item) => item.id === selectedId) ?? filteredCommands[0],
    [filteredCommands, selectedId],
  )

  const handleCategoryChange = (category: CliCategoryFilter) => {
    setActiveCategory(category)
    const nextList =
      category === 'all' ? CLI_COMMANDS : CLI_COMMANDS.filter((item) => item.category === category)
    if (nextList.length > 0 && !nextList.some((item) => item.id === selectedId)) {
      setSelectedId(nextList[0].id)
    }
  }

  const rawOutput = activeCommand
    ? simMode === 'pass'
      ? activeCommand.passOutput
      : activeCommand.failOutput
    : ''
  const outputLines = useMemo(() => rawOutput.split('\n'), [rawOutput])

  return (
    <div className="space-y-5">
      <div role="group" aria-label={t.cliPlayground.eyebrow} className="flex flex-wrap items-center gap-2.5">
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
        <div className="hardware-bezel">
          <div className="grid min-h-[540px] divide-y divide-indigo-200/[0.12] overflow-hidden rounded-[20px] border border-indigo-200/[0.14] bg-[#080E24]/90 lg:grid-cols-[380px_1fr] lg:divide-y-0 lg:divide-x">
            <CommandSidebar
              commands={filteredCommands}
              activeId={activeCommand.id}
              headingLabel={t.cliPlayground.categories[activeCategory]}
              pick={pick}
              onSelect={setSelectedId}
            />

            <div className="flex min-w-0 flex-col justify-between bg-[#080E24]/90">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200/[0.12] bg-[#060A1B]/90 px-5 py-3.5 lg:px-7">
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="hidden items-center gap-1.5 sm:inline-flex">
                    <span className="size-2.5 rounded-full bg-[#FF5F56]/85" />
                    <span className="size-2.5 rounded-full bg-[#FFBD2E]/85" />
                    <span className="size-2.5 rounded-full bg-[#27C93F]/85" />
                  </span>
                  <span className="rounded-lg border border-indigo-200/[0.15] bg-white/[0.05] px-3 py-1 font-mono text-xs font-semibold text-sky-200">
                    {`bash : boomopen ${activeCommand.id}`}
                  </span>
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
                  className="inline-flex items-center gap-1 rounded-xl border border-indigo-200/[0.14] bg-[#050816] p-1"
                >
                  <button
                    type="button"
                    aria-pressed={simMode === 'pass'}
                    onClick={() => setSimMode('pass')}
                    className={clsx(
                      'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3.5 font-mono text-xs leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      simMode === 'pass'
                        ? 'border border-emerald-400/35 bg-emerald-400/12 font-semibold text-emerald-300'
                        : 'border border-transparent text-slate-400 hover:text-white',
                    )}
                  >
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    <span>{t.cliPlayground.passToggleLabel}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={simMode === 'fail'}
                    onClick={() => setSimMode('fail')}
                    className={clsx(
                      'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3.5 font-mono text-xs leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                      FOCUS_RING,
                      simMode === 'fail'
                        ? 'border border-rose-400/35 bg-rose-500/12 font-semibold text-rose-300'
                        : 'border border-transparent text-slate-400 hover:text-white',
                    )}
                  >
                    <ShieldAlert aria-hidden="true" className="size-3.5" />
                    <span>{t.cliPlayground.failToggleLabel}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-6 p-6 lg:p-8">
                <div className="space-y-4">
                  <p className="max-w-[70ch] text-[15px] leading-relaxed text-muted sm:text-base">
                    {pick(activeCommand.summary)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium text-subtle">
                      {`${t.cliPlayground.gatesLabel}:`}
                    </span>
                    {activeCommand.gates.map((gate) => (
                      <StatusBadge key={gate} tone="neutral">
                        {gate}
                      </StatusBadge>
                    ))}
                  </div>

                  <CopyCommandBar
                    label={t.cliPlayground.invocationLabel}
                    command={activeCommand.invocation}
                    copyLabel={t.common.copy}
                    copiedLabel={t.common.copied}
                    manualCopyHint={t.common.copyManualHint}
                  />
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-indigo-200/[0.14] bg-[#040713] text-slate-100">
                  <div className="flex items-center justify-between border-b border-indigo-200/[0.12] bg-[#060A1B]/90 px-4 py-2.5 font-mono text-xs tabular-nums">
                    <span className="text-slate-400">{t.cliPlayground.outputLabel}</span>
                    <span className={simMode === 'pass' ? 'font-semibold text-emerald-400' : 'font-semibold text-rose-400'}>
                      {simMode === 'pass' ? 'exit code 0' : 'exit code 1'}
                    </span>
                  </div>
                  <pre
                    aria-live="polite"
                    className="flex-1 overflow-x-auto bg-[#040713] p-6 font-mono text-[15px] leading-relaxed text-slate-100 tabular-nums lg:p-8"
                  >
                    <code>
                      {outputLines.map((line, idx) => (
                        <div key={idx} className={classifyConsoleLine(line)}>
                          {line}
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>

                <div className="font-mono text-xs leading-relaxed text-subtle">
                  {t.cliPlayground.strictHint}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
