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
  const { t, commandCopy } = useLanguage()

  return (
    <article className="specular-surface flex h-full flex-col justify-between rounded-3xl border border-indigo-200/[0.14] p-7 transition-colors duration-150 motion-reduce:transition-none hover:border-sky-300/30 sm:p-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-2xl font-bold tracking-tight text-ink tabular-nums">
              {item.slash}
            </code>
            {item.variants.map((variant) => (
              <code
                key={variant}
                className="rounded-lg border border-indigo-200/[0.15] bg-white/[0.05] px-2.5 py-1 font-mono text-[13px] text-sky-200 tabular-nums"
              >
                :{variant}
              </code>
            ))}
          </div>
          <span className="shrink-0 rounded-full border border-indigo-200/[0.14] bg-white/[0.05] px-3 py-1 font-mono text-xs text-slate-300">
            {categoryLabel}
          </span>
        </div>

        <p className="mt-3.5 text-base leading-relaxed text-muted">
          {commandCopy(item).summary}
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
