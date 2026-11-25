import { useLanguage } from '../../i18n/context'
import type { CommandCatalogItem } from '../../types/ui-contract'
import { CopyCommandBar } from '../ui/Primitives'

/**
 * Expansive widescreen slash-command card for the 36-command directory.
 */
export interface CommandRowCardProps {
  readonly item: CommandCatalogItem
  readonly categoryLabel: string
}

export function CommandRowCard({ item, categoryLabel }: CommandRowCardProps) {
  const { t, pick } = useLanguage()

  return (
    <article className="specular-surface flex h-full flex-col justify-between rounded-3xl border border-white/[0.09] bg-card p-7 transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.22] sm:p-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-2xl font-bold tracking-tight text-ink tabular-nums">
              {item.slash}
            </code>
            {item.variants.map((variant) => (
              <code
                key={variant}
                className="rounded-lg border border-white/[0.12] bg-white/[0.05] px-2.5 py-1 font-mono text-[13px] text-ink/90 tabular-nums"
              >
                :{variant}
              </code>
            ))}
          </div>
          <span className="shrink-0 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted">
            {categoryLabel}
          </span>
        </div>

        <p className="mt-3.5 text-base leading-relaxed text-muted">
          {pick(item.summary)}
        </p>
      </div>

      <div className="mt-6">
        <CopyCommandBar
          command={item.slash}
          copyLabel={t.common.copy}
          copiedLabel={t.common.copied}
          manualCopyHint={t.common.copyManualHint}
        />
      </div>
    </article>
  )
}
