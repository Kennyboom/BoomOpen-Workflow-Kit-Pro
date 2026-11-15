import { useRef } from 'react'
import { clsx } from 'clsx'
import { Check, Copy, Diamond, Sparkles } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { BadgeTone, CommandCatalogItem, CommandCategory } from '../../types/ui-contract'
import { StatusBadge, SurfaceCard } from '../ui/Primitives'

/**
 * Slash command card aligned with our mission of trusted, deterministic review
 * across 33 base commands (89 files) and 1,462 indexed skills.
 */
export interface CommandRowCardProps {
  readonly item: CommandCatalogItem
  readonly categoryLabel: string
}

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

const CATEGORY_TONES: Readonly<Record<CommandCategory, BadgeTone>> = {
  orchestration: 'amber',
  engineering: 'emerald',
  'research-design': 'cobalt',
  'quality-security': 'danger',
  'session-ops': 'neutral',
}

export function CommandRowCard({ item, categoryLabel }: CommandRowCardProps) {
  const { t, pick } = useLanguage()
  const { copied, copyFailed, copy } = useCopyCommand()
  const slashRef = useRef<HTMLElement | null>(null)

  const handleCopySlash = () => {
    void copy(item.slash).then((ok) => {
      if (!ok && slashRef.current && typeof window !== 'undefined') {
        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          range.selectNodeContents(slashRef.current)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    })
  }

  return (
    <SurfaceCard
      variant="interactive"
      className="flex h-full flex-col justify-between gap-4"
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <code
              ref={slashRef}
              className="inline-flex items-center rounded-[10px] border border-primary/35 bg-primary/14 px-3 py-1.5 font-mono text-[clamp(0.95rem,0.2vw+0.9rem,1.0625rem)] leading-tight font-semibold text-primary tabular-nums"
            >
              {item.slash}
            </code>
            <StatusBadge tone={CATEGORY_TONES[item.category]} mono={false}>
              {categoryLabel}
            </StatusBadge>
          </div>

          <button
            type="button"
            aria-label={`${t.common.copy}: ${item.slash}`}
            onClick={handleCopySlash}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 py-2 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none font-semibold transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
              copied
                ? 'border-accent/50 bg-accent/15 text-accent'
                : 'border-line-strong bg-elevated text-ink hover:border-primary/60',
            )}
          >
            {copied ? (
              <Check aria-hidden="true" className="size-4 text-accent" />
            ) : (
              <Copy aria-hidden="true" className="size-4 text-primary" />
            )}
            <span>{copied ? t.common.copied : t.common.copy}</span>
          </button>
        </div>

        {item.hasTeamVariant && (
          <div>
            <StatusBadge tone="amber">
              <Diamond aria-hidden="true" className="size-3.5" />
              <span>{t.commandsPage.teamVariantBadge}</span>
            </StatusBadge>
          </div>
        )}

        <p className="max-w-prose text-[clamp(0.875rem,0.14vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
          {pick(item.summary)}
        </p>

        {item.variants.length > 0 && (
          <div className="space-y-1.5">
            <div className="font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold tracking-wider text-subtle uppercase">
              {t.commandsPage.variantsLabel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.variants.map((variant) => (
                <code
                  key={variant}
                  className={clsx(
                    'rounded-md border px-2 py-1 font-mono text-[clamp(0.72rem,0.1vw+0.7rem,0.78rem)] leading-none font-normal tabular-nums',
                    variant === 'team'
                      ? 'border-primary/40 bg-primary/12 text-primary font-semibold'
                      : 'border-hairline bg-elevated text-ink',
                  )}
                >
                  :{variant}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 rounded-xl border border-hairline bg-canvas/80 p-3.5">
        <div className="flex items-center gap-1.5 font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold tracking-wider text-muted uppercase">
          <Sparkles aria-hidden="true" className="size-3.5 text-accent" />
          <span>{t.commandsPage.nlTriggersLabel}</span>
        </div>
        <p className="max-w-prose font-mono text-[clamp(0.78rem,0.12vw+0.75rem,0.84rem)] leading-relaxed font-normal text-ink">
          {pick(item.nlExamples)}
        </p>
        <div aria-live="polite" className="sr-only">
          {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
        </div>
        {copyFailed && (
          <p className="max-w-prose text-[clamp(0.74rem,0.1vw+0.72rem,0.8rem)] leading-relaxed font-normal text-warning">
            {t.common.copyManualHint}
          </p>
        )}
      </div>
    </SurfaceCard>
  )
}
