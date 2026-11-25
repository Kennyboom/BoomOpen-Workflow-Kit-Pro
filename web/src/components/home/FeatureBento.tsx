import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * 3 sculptural VIP architectural pillars for the homepage:
 * each pairs 1 crisp obsidian micro-diagram at top with <= 18 words of prose below.
 */
interface PillarCopy {
  readonly title: string
  readonly body: string
}

interface BentoLocaleCopy {
  readonly legacyBarLabel: string
  readonly boomBarLabel: string
  readonly card1: PillarCopy
  readonly card2: PillarCopy
  readonly card3: PillarCopy
}

const PILLARS_COPY: Record<Locale, BentoLocaleCopy> = {
  en: {
    legacyBarLabel: 'Legacy Rules',
    boomBarLabel: 'Frontier Default',
    card1: {
      title: '2.2 KB Frontier Guardrails',
      body: '90% lighter Turn-1 context so your IDE model edits up to 10 files with zero friction.',
    },
    card2: {
      title: '3-Wave & Spec Reconcile',
      body: 'File-locked parallel sub-agent waves with automatic spec-to-code verification before merge.',
    },
    card3: {
      title: 'Runtime Hooks & /audit',
      body: 'Real-time shell guards, stateful multi-round security audits, and 1-command Git rollback.',
    },
  },
  vi: {
    legacyBarLabel: 'Prompt cũ',
    boomBarLabel: 'Mặc định v5.5',
    card1: {
      title: '2.2 KB Frontier Guardrails',
      body: 'Giữ ngữ cảnh đầu phiên siêu nhẹ, model gốc xử lý trực tiếp tới 10 file không gián đoạn.',
    },
    card2: {
      title: '3-Wave & Đối soát đặc tả',
      body: 'Phân luồng sub-agent khóa cứng từng file và tự động đối chiếu tài liệu với code thực tế.',
    },
    card3: {
      title: 'Hooks & /audit Đa vòng',
      body: 'Chặn lệnh nguy hiểm thời gian thực, kiểm toán bảo mật đa vòng và hoàn tác Git tức thì.',
    },
  },
}

const WAVE_STEPS = [
  { step: '01', label: 'Contract', meta: 'SHARED_CONTRACT', accent: false },
  { step: '02', label: 'Parallel Shards', meta: '<= 4 OWNED_FILES', accent: false },
  { step: '03', label: 'Reconcile PASS', meta: 'REC-G1..G4', accent: true },
] as const

const SHIELD_ROWS = [
  { label: 'PreToolUse + Stop', meta: '< 85ms' },
  { label: 'Audit R2: 0 Blockers', meta: 'SHA-256' },
  { label: 'Git Rollback', meta: '1-cmd' },
] as const

function TokenMeterDiagram({
  legacyLabel,
  boomLabel,
  reduceMotion,
}: {
  readonly legacyLabel: string
  readonly boomLabel: string
  readonly reduceMotion: boolean
}) {
  return (
    <div className="flex min-h-[188px] flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#07080C] p-5">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 font-mono text-xs">
            <span className="text-subtle">{legacyLabel}</span>
            <span className="text-muted tabular-nums">12,000 tok</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.03] p-0.5">
            <div className="h-full w-[94%] rounded-full bg-white/[0.16]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 font-mono text-xs">
            <span className="font-semibold text-ink">{boomLabel}</span>
            <span className="font-semibold text-accent tabular-nums">600 tok (-90%)</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-accent/30 bg-accent/[0.06] p-0.5">
            <motion.div
              initial={reduceMotion ? false : { width: '0%' }}
              whileInView={{ width: '10%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="h-full min-w-[32px] rounded-full bg-gradient-to-r from-accent to-primary shadow-[0_0_16px_oklch(0.76_0.155_162/0.55)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[11px] text-subtle tabular-nums">
        <span>21 lines · 5 AI IDEs</span>
        <span className="text-accent">mode_a &lt;= 10 files</span>
      </div>
    </div>
  )
}

function WaveNodesDiagram() {
  return (
    <div className="flex min-h-[188px] flex-col justify-center gap-2 rounded-2xl border border-white/[0.08] bg-[#07080C] p-4 sm:p-5">
      {WAVE_STEPS.map((node, idx) => (
        <div key={node.step} className="space-y-2">
          <div
            className={
              node.accent
                ? 'flex items-center justify-between gap-2 rounded-xl border border-accent/35 bg-accent/[0.09] px-3.5 py-2 font-mono text-xs'
                : 'flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 font-mono text-xs'
            }
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className={node.accent ? 'font-semibold text-accent' : 'text-subtle'}>{node.step}</span>
              <ArrowRight aria-hidden="true" className="size-3 shrink-0 text-subtle" />
              <span className={node.accent ? 'truncate font-semibold text-accent' : 'truncate font-medium text-ink'}>
                {node.label}
              </span>
            </div>
            <span className={node.accent ? 'shrink-0 text-[11px] font-semibold text-accent' : 'shrink-0 text-[11px] text-subtle'}>
              {node.meta}
            </span>
          </div>
          {idx < WAVE_STEPS.length - 1 && <span className="sr-only">then</span>}
        </div>
      ))}
    </div>
  )
}

function ShieldRowsDiagram() {
  return (
    <div className="flex min-h-[188px] flex-col justify-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#07080C] p-4 sm:p-5">
      {SHIELD_ROWS.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5 font-mono text-xs"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-accent" />
            <span className="truncate font-medium text-ink">{row.label}</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent tabular-nums">
            <span>{row.meta}</span>
            <CheckCircle2 aria-hidden="true" className="size-3" />
          </span>
        </div>
      ))}
    </div>
  )
}

function PillarShell({
  index,
  copy,
  diagram,
}: {
  readonly index: string
  readonly copy: PillarCopy
  readonly diagram: React.ReactNode
}) {
  return (
    <article className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] p-8 lg:p-9">
      {diagram}
      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-accent tabular-nums">{index}</div>
        <h3 className="font-display text-[22px] leading-[1.16] font-bold tracking-[-0.028em] text-ink">
          {copy.title}
        </h3>
        <p className="max-w-[42ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

export function FeatureBento() {
  const { locale } = useLanguage()
  const reduceMotion = useReducedMotion()
  const copy = PILLARS_COPY[locale]

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
      <PillarShell
        index="01"
        copy={copy.card1}
        diagram={
          <TokenMeterDiagram
            legacyLabel={copy.legacyBarLabel}
            boomLabel={copy.boomBarLabel}
            reduceMotion={Boolean(reduceMotion)}
          />
        }
      />
      <PillarShell index="02" copy={copy.card2} diagram={<WaveNodesDiagram />} />
      <PillarShell index="03" copy={copy.card3} diagram={<ShieldRowsDiagram />} />
    </div>
  )
}
