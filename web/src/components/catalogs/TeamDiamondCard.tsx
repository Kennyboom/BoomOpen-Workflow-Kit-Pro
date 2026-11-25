import { useRef } from 'react'
import { clsx } from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { TeamSpec } from '../../types/ui-contract'

/**
 * Architectural 3-role team card displaying Tech Lead -> Executor -> Reviewer
 * separated by single-pixel hairlines.
 */
export interface TeamDiamondCardProps {
  readonly team: TeamSpec
}

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

interface PipelineRoleCellProps {
  readonly step: string
  readonly roleLabel: string
  readonly agents: readonly string[]
  readonly taskNote: string
  readonly className?: string
}

function PipelineRoleCell({
  step,
  roleLabel,
  agents,
  taskNote,
  className,
}: PipelineRoleCellProps) {
  return (
    <div className={clsx('space-y-1.5', className)}>
      <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-subtle uppercase tabular-nums">
        <span>{step}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{roleLabel}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {agents.map((agentId) => (
          <code
            key={agentId}
            className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs font-medium text-ink"
          >
            {agentId}
          </code>
        ))}
      </div>
      <p className="text-xs leading-snug text-subtle">{taskNote}</p>
    </div>
  )
}

export function TeamDiamondCard({ team }: TeamDiamondCardProps) {
  const { locale, t, pick } = useLanguage()
  const { copied, copyFailed, copy } = useCopyCommand()
  const triggerRef = useRef<HTMLElement | null>(null)

  const handleCopyTrigger = () => {
    void copy(team.triggerCommand).then((ok) => {
      if (!ok && triggerRef.current && typeof window !== 'undefined') {
        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          range.selectNodeContents(triggerRef.current)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    })
  }

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-hairline bg-card p-5 transition-colors duration-150 motion-reduce:transition-none hover:border-line-strong">
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {team.dirName}
              </h3>
              <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-subtle">
                :team
              </span>
            </div>
            <div className="font-mono text-xs text-subtle">
              {`agents/teams/${team.dirName}/`}
            </div>
          </div>

          <button
            type="button"
            aria-label={`${t.common.copy}: ${team.triggerCommand}`}
            onClick={handleCopyTrigger}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-medium transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
              copied
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-hairline bg-white/[0.03] text-ink hover:border-line-strong',
            )}
          >
            <code ref={triggerRef} className="font-mono tabular-nums">
              {team.triggerCommand}
            </code>
            {copied ? (
              <Check aria-hidden="true" className="size-3.5 text-accent" />
            ) : (
              <Copy aria-hidden="true" className="size-3.5 text-subtle" />
            )}
          </button>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          {pick(team.summary)}
        </p>
      </div>

      <div>
        <div className="mt-4 grid divide-y divide-hairline border-t border-hairline pt-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <PipelineRoleCell
            step="01"
            roleLabel={t.agentsPage.roleBadges.techlead}
            agents={team.roles.techlead}
            taskNote={locale === 'vi' ? 'Khóa hợp đồng & chia shard' : 'Contract lock & sharding'}
            className="pb-3 sm:pr-4 sm:pb-0"
          />
          <PipelineRoleCell
            step="02"
            roleLabel={t.agentsPage.roleBadges.executor}
            agents={team.roles.executor}
            taskNote="<= 4 OWNED_FILES / shard"
            className="py-3 sm:px-4 sm:py-0"
          />
          <PipelineRoleCell
            step="03"
            roleLabel={t.agentsPage.roleBadges.reviewer}
            agents={team.roles.reviewer}
            taskNote={locale === 'vi' ? 'Phản biện độc lập' : 'Adversarial sign-off'}
            className="pt-3 sm:pt-0 sm:pl-4"
          />
        </div>

        <div aria-live="polite" className="sr-only">
          {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
        </div>
        {copyFailed && (
          <p className="pt-2 text-xs leading-relaxed text-muted">
            {t.common.copyManualHint}
          </p>
        )}
      </div>
    </article>
  )
}
