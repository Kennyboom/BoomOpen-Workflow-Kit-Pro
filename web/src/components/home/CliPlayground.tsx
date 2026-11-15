import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { AlertOctagon, CheckCircle2, ShieldAlert, Terminal } from 'lucide-react';
import { CLI_COMMANDS } from '../../data/cliSuite';
import { useLanguage } from '../../i18n/context';
import type { CliCommandId, CliCommandSpec } from '../../types/ui-contract';
import { CopyCommandBar, EmptyCatalogState, FilterPill, StatusBadge, SurfaceCard } from '../ui/Primitives';

/**
 * Mission: interactive explorer for all 14 deterministic CLI compilers & gates, providing
 * trusted Pass (Exit 0) vs Fail (Exit 1) review diagnostics across the 1,462-skill kit.
 */
type CliCategoryFilter = 'all' | CliCommandSpec['category'];
type SimulationMode = 'pass' | 'fail';

const CATEGORY_ORDER: readonly CliCategoryFilter[] = ['all', 'compiler', 'orchestration', 'lifecycle'];
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

export function CliPlayground() {
  const { t, pick } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<CliCategoryFilter>('all');
  const [selectedId, setSelectedId] = useState<CliCommandId>('plan');
  const [simMode, setSimMode] = useState<SimulationMode>('pass');

  const categoryCounts = useMemo(() => {
    return {
      all: CLI_COMMANDS.length,
      compiler: CLI_COMMANDS.filter((item) => item.category === 'compiler').length,
      orchestration: CLI_COMMANDS.filter((item) => item.category === 'orchestration').length,
      lifecycle: CLI_COMMANDS.filter((item) => item.category === 'lifecycle').length,
    };
  }, []);

  const filteredCommands = useMemo(() => {
    if (activeCategory === 'all') {
      return CLI_COMMANDS;
    }
    return CLI_COMMANDS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const activeCommand: CliCommandSpec | undefined = useMemo(() => {
    const exact = filteredCommands.find((item) => item.id === selectedId);
    return exact ?? filteredCommands[0];
  }, [filteredCommands, selectedId]);

  const handleCategoryChange = (category: CliCategoryFilter) => {
    setActiveCategory(category);
    const nextList =
      category === 'all' ? CLI_COMMANDS : CLI_COMMANDS.filter((item) => item.category === category);
    if (nextList.length > 0 && !nextList.some((item) => item.id === selectedId)) {
      setSelectedId(nextList[0].id);
    }
  };

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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-1 content-start">
            {filteredCommands.map((cmd) => {
              const isSelected = cmd.id === activeCommand.id;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(cmd.id)}
                  className={clsx(
                    'flex min-h-11 items-center justify-between gap-2 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    isSelected
                      ? 'border-primary bg-elevated text-ink font-semibold'
                      : 'border-hairline bg-card text-muted hover:border-line-strong hover:text-ink font-normal',
                  )}
                >
                  <span className="flex items-center gap-2 truncate font-mono text-[clamp(0.82rem,0.12vw+0.79rem,0.9rem)] leading-snug">
                    <Terminal
                      aria-hidden="true"
                      className={clsx('size-4 shrink-0', isSelected ? 'text-primary' : 'text-muted')}
                    />
                    <span className="truncate">{`boomopen ${cmd.id}`}</span>
                  </span>
                  <span
                    className={clsx(
                      'shrink-0 rounded px-1.5 py-0.5 font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-none tabular-nums',
                      isSelected ? 'bg-primary/20 text-primary font-semibold' : 'bg-canvas text-muted font-normal',
                    )}
                  >
                    {`${cmd.gates.length}G`}
                  </span>
                </button>
              );
            })}
          </div>

          <SurfaceCard variant="elevated" className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="amber">{`boomopen ${activeCommand.id}`}</StatusBadge>
                <StatusBadge tone={simMode === 'pass' ? 'emerald' : 'danger'}>
                  {simMode === 'pass' ? (
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
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
                className="inline-flex items-center gap-1 rounded-[10px] border border-hairline bg-canvas p-1"
              >
                <button
                  type="button"
                  aria-pressed={simMode === 'pass'}
                  onClick={() => setSimMode('pass')}
                  className={clsx(
                    'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    simMode === 'pass'
                      ? 'bg-accent/20 text-accent border border-accent/40 font-semibold'
                      : 'text-muted hover:text-ink border border-transparent font-normal',
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
                    'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-mono text-[clamp(0.75rem,0.1vw+0.72rem,0.8125rem)] leading-none transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
                    FOCUS_RING,
                    simMode === 'fail'
                      ? 'bg-danger/20 text-danger border border-danger/40 font-semibold'
                      : 'text-muted hover:text-ink border border-transparent font-normal',
                  )}
                >
                  <ShieldAlert aria-hidden="true" className="size-3.5" />
                  <span>{t.cliPlayground.failToggleLabel}</span>
                </button>
              </div>
            </div>

            <p className="max-w-prose text-[clamp(0.9rem,0.15vw+0.87rem,0.975rem)] leading-relaxed font-normal text-muted">
              {pick(activeCommand.summary)}
            </p>

            <div className="space-y-1.5">
              <div className="font-mono text-[clamp(0.74rem,0.1vw+0.71rem,0.8rem)] leading-snug font-semibold text-ink">
                {t.cliPlayground.gatesLabel}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeCommand.gates.map((gate) => (
                  <StatusBadge key={gate} tone="cobalt">
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

            <div className="rounded-2xl border border-hairline bg-canvas p-1.5">
              <div className="flex items-center justify-between border-b border-hairline px-3 py-2 font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-none font-normal text-muted tabular-nums">
                <span>{t.cliPlayground.outputLabel}</span>
                <span className={simMode === 'pass' ? 'text-accent font-semibold' : 'text-danger font-semibold'}>
                  {simMode === 'pass' ? 'exit code 0' : 'exit code 1'}
                </span>
              </div>
              <pre
                aria-live="polite"
                className={clsx(
                  'overflow-x-auto rounded-[10px] p-4 font-mono text-[clamp(0.76rem,0.12vw+0.73rem,0.835rem)] leading-relaxed font-normal tabular-nums',
                  simMode === 'pass' ? 'text-ink' : 'text-warning',
                )}
              >
                <code>{simMode === 'pass' ? activeCommand.passOutput : activeCommand.failOutput}</code>
              </pre>
            </div>

            <div className="font-mono text-[clamp(0.74rem,0.1vw+0.71rem,0.8rem)] leading-relaxed font-normal text-muted">
              {t.cliPlayground.strictHint}
            </div>
          </SurfaceCard>
        </div>
      )}
    </div>
  );
}
