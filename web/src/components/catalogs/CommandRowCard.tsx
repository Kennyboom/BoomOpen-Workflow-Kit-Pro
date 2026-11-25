import { useLanguage } from '../../i18n/context'
import type { CommandCatalogItem } from '../../types/ui-contract'
import { CopyCommandBar } from '../ui/Primitives'

/**
 * Minimal architectural slash-command card for the 36-command directory.
 */
export interface CommandRowCardProps {
  readonly item: CommandCatalogItem
  readonly categoryLabel: string
}

export function CommandRowCard({ item, categoryLabel }: CommandRowCardProps) {
  const { t, pick } = useLanguage()

  return (
    <article className="flex h-full flex-col justify-between gap-4 rounded-xl border border-hairline bg-card px-5 py-4 transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <code className="font-mono text-base font-semibold text-ink tabular-nums">
              {item.slash}
            </code>
            {item.variants.map((variant) => (
              <code
                key={variant}
                className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-subtle tabular-nums"
              >
                :{variant}
              </code>
            ))}
          </div>
          <span className="shrink-0 pt-0.5 font-mono text-xs text-subtle">
            {categoryLabel}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          {pick(item.summary)}
        </p>
      </div>

      <CopyCommandBar
        command={item.slash}
        copyLabel={t.common.copy}
        copiedLabel={t.common.copied}
        manualCopyHint={t.common.copyManualHint}
        compact
      />
    </article>
  )
}
