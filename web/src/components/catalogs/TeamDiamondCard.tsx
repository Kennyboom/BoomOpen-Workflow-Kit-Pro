import { useRef } from 'react'
import { clsx } from 'clsx'
import { Check, Copy } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { TeamSpec } from '../../types/ui-contract'

/**
 * Architectural 3-stage review team card displaying Tech Lead -> Executor -> Reviewer
 * inside connected glass pipeline cells across the 1440px stage.
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
}

function PipelineRoleCell({
  step,
  roleLabel,
  agents,
  taskNote,
}: PipelineRoleCellProps) {
  return (
    <div className="flex flex-col justify-between gap-3.5 rounded-2xl border border-white/[0.09] bg-[#090B10]/80 p-5">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 font-mono text-xs font-medium tracking-wider text-subtle uppercase tabular-nums">
          <span className="text-ink/85">{step}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{roleLabel}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agents.map((agentId) => (
            <code
              key={agentId}
              className="font-mono text-[15px] leading-snug font-bold text-ink"
            >
              {agentId}
            </code>
          ))}
        </div>
      </div>
      <p className="text-[13px] leading-snug text-muted">{taskNote}</p>
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
    <article className="specular-surface flex h-full flex-col justify-between rounded-3xl border border-white/[0.09] bg-card p-8 transition-colors duration-150 motion-reduce:transition-none hover:border-white/[0.22] sm:p-9">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-[22px] leading-snug font-bold tracking-tight text-ink">
              {team.dirName}
            </h3>
            <div className="font-mono text-xs text-subtle">
              {`agents/teams/${team.dirName}/`}
            </div>
          </div>

          <button
            type="button"
            aria-label={`${t.common.copy}: ${team.triggerCommand}`}
            onClick={handleCopyTrigger}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl border px-4 py-2 font-mono text-sm font-medium transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
              copied
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-white/[0.12] bg-[#090B10] text-ink hover:border-white/[0.28]',
            )}
          >
            <code ref={triggerRef} className="font-mono tabular-nums">
              {team.triggerCommand}
            </code>
            {copied ? (
              <Check aria-hidden="true" className="size-4 text-accent" />
            ) : (
              <Copy aria-hidden="true" className="size-4 text-subtle" />
            )}
          </button>
        </div>

        <p className="mt-3 text-base leading-relaxed text-muted">
          {pick(team.summary)}
        </p>
      </div>

      <div>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <PipelineRoleCell
            step="01"
            roleLabel={t.agentsPage.roleBadges.techlead}
            agents={team.roles.techlead}
            taskNote={locale === 'vi' ? 'Khóa hợp đồng & chia shard' : 'Contract lock & sharding'}
          />
          <PipelineRoleCell
            step="02"
            roleLabel={t.agentsPage.roleBadges.executor}
            agents={team.roles.executor}
            taskNote="<= 4 OWNED_FILES / shard"
          />
          <PipelineRoleCell
            step="03"
            roleLabel={t.agentsPage.roleBadges.reviewer}
            agents={team.roles.reviewer}
            taskNote={locale === 'vi' ? 'Phản biện độc lập' : 'Adversarial sign-off'}
          />
        </div>

        <div aria-live="polite" className="sr-only">
          {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
        </div>
        {copyFailed && (
          <p className="pt-2.5 text-xs leading-relaxed text-muted">
            {t.common.copyManualHint}
          </p>
        )}
      </div>
    </article>
  )
}
