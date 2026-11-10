import { useRef } from 'react'
import { clsx } from 'clsx'
import { ArrowDown, Check, Copy, Diamond, FolderGit2, Layers, ShieldCheck } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { BadgeTone, TeamSpec } from '../../types/ui-contract'
import { StatusBadge, SurfaceCard } from '../ui/Primitives'

/**
 * Elastic Golden Diamond team topology card supporting our mission of adversarial
 * review, trusted contract locks, and 1,462 on-demand skills.
 */
export interface TeamDiamondCardProps {
  readonly team: TeamSpec
}

const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

interface TopologyStageProps {
  readonly stageLabel: string
  readonly scaleHint: string
  readonly agents: readonly string[]
  readonly tone: BadgeTone
  readonly showConnector?: boolean
}

function TopologyStage({
  stageLabel,
  scaleHint,
  agents,
  tone,
  showConnector = false,
}: TopologyStageProps) {
  return (
    <div>
      <div className="rounded-xl border border-hairline bg-card/85 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone={tone} mono={false}>
            {stageLabel}
          </StatusBadge>
          <span className="font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-none font-normal text-subtle tabular-nums">
            {scaleHint}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agents.map((agentId) => (
            <code
              key={agentId}
              className="rounded-md border border-hairline bg-canvas px-2.5 py-1 font-mono text-[clamp(0.74rem,0.1vw+0.72rem,0.8rem)] leading-tight font-semibold text-ink"
            >
              {agentId}
            </code>
          ))}
        </div>
      </div>
      {showConnector && (
        <div className="flex items-center justify-center py-1 text-subtle" aria-hidden="true">
          <ArrowDown className="size-3.5" />
        </div>
      )}
    </div>
  )
}

export function TeamDiamondCard({ team }: TeamDiamondCardProps) {
  const { t, pick } = useLanguage()
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
    <SurfaceCard
      variant="interactive"
      className="flex h-full flex-col justify-between gap-4"
    >
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[clamp(1.05rem,0.28vw+0.98rem,1.2rem)] leading-tight font-semibold text-ink">
                {team.dirName}
              </span>
              <StatusBadge tone="amber">
                <Diamond aria-hidden="true" className="size-3.5" />
                <span>1-1-1 → 1-N-M</span>
              </StatusBadge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="neutral">
                <FolderGit2 aria-hidden="true" className="size-3.5 text-muted" />
                <span>{`agents/teams/${team.dirName}/`}</span>
              </StatusBadge>
            </div>
          </div>

          <button
            type="button"
            aria-label={`${t.common.copy}: ${team.triggerCommand}`}
            onClick={handleCopyTrigger}
            className={clsx(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] border px-3 py-2 font-mono text-[clamp(0.75rem,0.1vw+0.73rem,0.8125rem)] leading-none font-semibold transition-colors duration-150 motion-reduce:transition-none cursor-pointer',
              FOCUS_RING,
              copied
                ? 'border-accent/50 bg-accent/15 text-accent'
                : 'border-primary/40 bg-primary/12 text-primary hover:border-primary',
            )}
          >
            <code ref={triggerRef} className="font-mono font-semibold tabular-nums">
              {team.triggerCommand}
            </code>
            {copied ? (
              <Check aria-hidden="true" className="size-4 text-accent" />
            ) : (
              <Copy aria-hidden="true" className="size-4 text-primary" />
            )}
          </button>
        </div>

        <p className="max-w-prose text-[clamp(0.875rem,0.14vw+0.84rem,0.95rem)] leading-relaxed font-normal text-muted">
          {pick(team.summary)}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-hairline bg-canvas/80 p-3.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-semibold tracking-wider text-muted uppercase">
            <Layers aria-hidden="true" className="size-3.5 text-primary" />
            <span>Golden Diamond Topology</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[clamp(0.68rem,0.08vw+0.66rem,0.74rem)] leading-tight font-normal text-accent tabular-nums">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            <span>Author != Critic</span>
          </span>
        </div>

        <TopologyStage
          stageLabel={t.agentsPage.roleBadges.techlead}
          scaleHint="1 Coordinator"
          agents={team.roles.techlead}
          tone="amber"
          showConnector
        />
        <TopologyStage
          stageLabel={`${t.agentsPage.roleBadges.executor} (1..6)`}
          scaleHint="<= 4 OWNED_FILES / shard"
          agents={team.roles.executor}
          tone="emerald"
          showConnector
        />
        <TopologyStage
          stageLabel={`${t.agentsPage.roleBadges.reviewer} (1..3)`}
          scaleHint="Adversarial Sign-Off"
          agents={team.roles.reviewer}
          tone="cobalt"
        />

        <div aria-live="polite" className="sr-only">
          {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
        </div>
        {copyFailed && (
          <p className="max-w-prose pt-1 text-[clamp(0.74rem,0.1vw+0.72rem,0.8rem)] leading-relaxed font-normal text-warning">
            {t.common.copyManualHint}
          </p>
        )}
      </div>
    </SurfaceCard>
  )
}
