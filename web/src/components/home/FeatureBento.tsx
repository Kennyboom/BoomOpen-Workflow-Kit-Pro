import { clsx } from 'clsx'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2, FileCheck2, GitCommitHorizontal, RotateCcw, ShieldCheck, Sparkles, Terminal } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'
import { CopyCommandBar, StatusBadge } from '../ui/Primitives'

/**
 * Monumental 12-column asymmetric product Bento showcasing BoomOpen v5.5's
 * 4 core engineering breakthroughs with live visual telemetry diagrams.
 */
const IDE_ENTRY_PILLS = [
  'GEMINI.md (2.2 KB)',
  'CLAUDE.md (2.1 KB)',
  'AGENTS.md (2.1 KB)',
  'boomopen.mdc (2.2 KB)',
  'copilot-instructions.md (2.1 KB)',
] as const

const RTM_ROWS = [
  { id: '[SC-01]', feature: 'Auth Session', target: 'src/api/auth.ts', status: 'PASS' },
  { id: '[SC-02]', feature: 'Rate Limiter', target: 'src/proxy.ts', status: 'PASS' },
  { id: '[SC-03]', feature: 'Audit Ledger', target: 'src/cli/audit.ts', status: 'PASS' },
] as const

const ROLLBACK_CMD = 'boomopen audit rollback --round 1 --yes'

const BENTO_COPY = {
  en: {
    card1: {
      eyebrow: '01 / FRONTIER GUARDRAILS', savingsBadge: '90% Lower Per-Turn Overhead',
      title: 'Frontier Guardrails: ~600 Tokens Across 5 IDEs',
      body: 'Keep Turn-1 context razor-thin at 21 lines (< 2.3 KB) so your frontier model handles up to 10 files natively with zero prompt bloat and zero NL hijacking.',
      chartTitle: 'Always-On Turn-1 Instruction Footprint',
      legacyLabel: 'Legacy Prompt Bloat', legacyTokens: '~8,000 - 12,500 tok',
      boomLabel: 'BoomOpen Frontier Guardrails', boomTokens: '~600 tok (2.2 KB)',
      boomNote: '21 lines | Mode A <= 10 files direct | 7 rules/*.md lazy-loaded on /cmd',
      filesLabel: 'Synced Entry Files (< 10ms)',
    },
    card2: {
      eyebrow: '02 / RUNTIME BOUNDARY', badge: '--with-hooks + OS Sandbox',
      title: 'Lifecycle Hooks & OS Sandboxing',
      body: 'Opt-in deterministic runtime shields across Claude Code, Antigravity, and Cursor, paired with read-only OS sandbox_mode isolation for Codex scouts.',
      gates: [
        { hook: 'PreToolUse', latency: '< 85ms AST Guard', detail: 'Bash | PowerShell | run_command destructive command interceptor' },
        { hook: 'PreCompact', latency: 'Zero-Loss Memory', detail: 'Persists .boomopen/compact-snapshot.json wave & task state' },
        { hook: 'Stop', latency: 'Turn-Exit Gate', detail: 'Runs boomopen check --strict-phase --no-stubs before exit' },
      ],
      sandboxFooter: 'Codex CLI: 22 TOML roles with OS sandbox_mode read-only reviewer isolation',
    },
    card3: {
      eyebrow: '03 / WAVE 2.5 RECONCILER', badge: 'REC-G1..G4 Strict',
      title: 'Wave 2.5 Spec-to-Code Reconciliation',
      body: 'Before E2E sign-off, the reconciler cross-checks every [SC-*] requirement clause against live imports, API routes, and .env keys.',
      footerSummary: 'REC-G1..G4: 0 Unwired Islands, 100% Route & Env Parity',
    },
    card4: {
      eyebrow: '04 / STATEFUL AUDIT LEDGER', badge: '.boomopen/audit-ledger.json',
      title: 'Stateful Multi-Round /audit & Instant Git Rollback',
      body: 'Track SHA-256 fingerprinted findings across human-gated remediation rounds with monotonic test ratchets and single-command Git checkpoint recovery.',
      stages: [
        { step: 'Round 1', metric: '6 Findings', detail: 'SHA-256 fingerprinted scan', tone: 'warn' as const },
        { step: 'Human Review', metric: 'Selective Gate', detail: 'Approve or defer per ID', tone: 'neutral' as const },
        { step: '/audit:fix', metric: 'Disjoint Shards', detail: '<= 4 OWNED_FILES + ratchet', tone: 'neutral' as const },
        { step: 'Round 2', metric: '0 Blockers', detail: 'CONVERGED | Exit 0', tone: 'emerald' as const },
      ],
      checkpointLabel: 'Git Snapshot Ref',
    },
  },
  vi: {
    card1: {
      eyebrow: '01 / FRONTIER GUARDRAILS', savingsBadge: 'Giảm 90% Token Mỗi Lượt',
      title: 'Frontier Guardrails: ~600 Token Trên Cả 5 IDE',
      body: 'Giữ ngữ cảnh đầu phiên siêu gọn ở mức 21 dòng (< 2.3 KB) để model gốc xử lý trực tiếp tới 10 file, không phình prompt và không tự ý bắt câu chat.',
      chartTitle: 'Chi Phí Ngữ Cảnh Thường Trực Đầu Phiên',
      legacyLabel: 'Prompt Hệ Thống Cũ Cồng Kềnh', legacyTokens: '~8,000 - 12,500 tok',
      boomLabel: 'BoomOpen Frontier Guardrails', boomTokens: '~600 tok (2.2 KB)',
      boomNote: '21 dòng | Mode A <= 10 file trực tiếp | 7 tệp rules/*.md chỉ nạp khi gọi /cmd',
      filesLabel: '14 Tệp Đầu Vào Đồng Bộ (< 10ms)',
    },
    card2: {
      eyebrow: '02 / LÁ CHẮN THỰC THI', badge: '--with-hooks + OS Sandbox',
      title: 'Lifecycle Hooks & Cô Lập OS Sandbox',
      body: 'Tùy chọn bật 3 lớp kiểm soát thời gian thực trên Claude Code, Antigravity, Cursor cùng cơ chế OS sandbox_mode chỉ đọc cho Codex.',
      gates: [
        { hook: 'PreToolUse', latency: '< 85ms AST Guard', detail: 'Bash | PowerShell | run_command chặn lệnh nguy hiểm trước khi chạy' },
        { hook: 'PreCompact', latency: 'Zero-Loss Memory', detail: 'Lưu .boomopen/compact-snapshot.json giữ nguyên tiến độ wave' },
        { hook: 'Stop', latency: 'Turn-Exit Gate', detail: 'Chạy boomopen check --strict-phase --no-stubs trước khi kết thúc' },
      ],
      sandboxFooter: 'Codex CLI: 22 vai trò TOML kèm OS sandbox_mode cô lập chỉ đọc cho scout/reviewer',
    },
    card3: {
      eyebrow: '03 / ĐỐI CHIẾU WAVE 2.5', badge: 'REC-G1..G4 Strict',
      title: 'Đối Chiếu Đặc Tả & Mã Nguồn Wave 2.5',
      body: 'Trước bước nghiệm thu E2E, bộ quét đối chiếu từng mục [SC-*] với cây import thực tế, đường dẫn API frontend/backend và biến .env.',
      footerSummary: 'REC-G1..G4: 0 Unwired Islands, 100% Route & Env Parity',
    },
    card4: {
      eyebrow: '04 / KIỂM TRA ĐA VÒNG & KHÔI PHỤC', badge: '.boomopen/audit-ledger.json',
      title: '/audit Đa Vòng Có Lưu Vết & Rollback Git Tức Thì',
      body: 'Theo dõi mã băm lỗi SHA-256 qua từng vòng duyệt của con người, giữ chốt chặn số bài test đạt và hoàn tác tức thì về mốc Git sạch.',
      stages: [
        { step: 'Round 1', metric: '6 Findings', detail: 'Định danh lỗi bằng SHA-256', tone: 'warn' as const },
        { step: 'Human Review', metric: 'Duyệt Chọn Lọc', detail: 'Chọn mục sửa trong ledger', tone: 'neutral' as const },
        { step: '/audit:fix', metric: 'Chia Nhánh Khóa File', detail: '<= 4 OWNED_FILES + test ratchet', tone: 'neutral' as const },
        { step: 'Round 2', metric: '0 Blockers', detail: 'CONVERGED | Exit 0', tone: 'emerald' as const },
      ],
      checkpointLabel: 'Mốc Lưu Git',
    },
  },
} satisfies Record<Locale, unknown>

type BentoLocaleCopy = (typeof BENTO_COPY)['en']

function TokenGuardrailsCard({ copy, reduceMotion }: { readonly copy: BentoLocaleCopy['card1']; readonly reduceMotion: boolean }) {
  return (
    <article className="specular-surface flex min-h-[380px] flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] bg-card/85 p-8 lg:col-span-7 lg:p-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium tracking-[0.08em] text-subtle">{copy.eyebrow}</span>
          <StatusBadge tone="emerald">
            <Sparkles aria-hidden="true" className="size-3.5 text-accent" />
            <span>{copy.savingsBadge}</span>
          </StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[28px]">{copy.title}</h3>
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/[0.09] bg-[#07080B] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
          <span className="font-mono text-xs font-medium text-ink/90">{copy.chartTitle}</span>
          <span className="font-mono text-xs font-semibold text-accent">90% Lower Per-Turn Overhead</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="text-muted">{copy.legacyLabel}</span>
              <span className="text-danger/90 tabular-nums">{copy.legacyTokens}</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.03] p-0.5">
              <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-danger/55 via-danger/35 to-white/[0.18]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className="font-semibold text-ink">{copy.boomLabel}</span>
              <span className="font-semibold text-accent tabular-nums">{copy.boomTokens}</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full border border-accent/25 bg-accent/[0.05] p-0.5">
              <motion.div
                initial={reduceMotion ? false : { width: '0%' }}
                whileInView={{ width: '9%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="h-full min-w-[34px] rounded-full bg-gradient-to-r from-accent to-primary shadow-[0_0_16px_oklch(0.74_0.14_160/0.55)]"
              />
            </div>
            <div className="font-mono text-[11px] text-subtle">{copy.boomNote}</div>
          </div>
        </div>

        <div className="space-y-2 border-t border-white/[0.07] pt-3.5">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-subtle">{copy.filesLabel}</div>
          <div className="flex flex-wrap gap-2">
            {IDE_ENTRY_PILLS.map((pill) => (
              <span key={pill} className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-ink/90 tabular-nums">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                <span>{pill}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function LifecycleShieldCard({ copy }: { readonly copy: BentoLocaleCopy['card2'] }) {
  return (
    <article className="specular-surface flex min-h-[380px] flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] bg-card/85 p-8 lg:col-span-5 lg:p-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium tracking-[0.08em] text-subtle">{copy.eyebrow}</span>
          <StatusBadge tone="neutral">{copy.badge}</StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>

      <div className="space-y-2.5 rounded-2xl border border-white/[0.09] bg-[#07080B] p-4 sm:p-5">
        {copy.gates.map((gate, idx) => (
          <div key={gate.hook} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4 text-accent" />
                <span className="font-mono text-sm font-semibold text-ink">{gate.hook}</span>
              </div>
              <span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-medium text-accent tabular-nums">{gate.latency}</span>
            </div>
            <div className="mt-1.5 pl-6 font-mono text-xs leading-relaxed text-muted">{`0${idx + 1}. ${gate.detail}`}</div>
          </div>
        ))}
        <div className="rounded-lg border border-white/[0.06] bg-[#050608] px-3.5 py-2 font-mono text-[11px] leading-relaxed text-subtle">{copy.sandboxFooter}</div>
      </div>
    </article>
  )
}

function WaveReconcileCard({ copy }: { readonly copy: BentoLocaleCopy['card3'] }) {
  return (
    <article className="specular-surface flex min-h-[380px] flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] bg-card/85 p-8 lg:col-span-5 lg:p-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium tracking-[0.08em] text-subtle">{copy.eyebrow}</span>
          <StatusBadge tone="emerald">
            <FileCheck2 aria-hidden="true" className="size-3.5 text-accent" />
            <span>{copy.badge}</span>
          </StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#07080B]">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] bg-white/[0.025] px-4 py-2.5 font-mono text-xs">
          <span className="flex items-center gap-2 truncate text-ink/90">
            <Terminal aria-hidden="true" className="size-3.5 shrink-0 text-subtle" />
            <span className="truncate">boomopen reconcile ./src --plan PLAN.md --strict</span>
          </span>
          <span className="shrink-0 font-semibold text-accent">EXIT 0</span>
        </div>

        <div className="divide-y divide-white/[0.06] px-4 py-1">
          {RTM_ROWS.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 py-3 font-mono text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 font-semibold text-ink">{row.id}</span>
                <span className="truncate text-ink/90">{row.feature}</span>
                <ArrowRight aria-hidden="true" className="size-3 shrink-0 text-subtle" />
                <span className="truncate text-muted">{row.target}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                <CheckCircle2 aria-hidden="true" className="size-3" />
                <span>{row.status}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-accent/20 bg-accent/[0.07] px-4 py-3 font-mono text-xs font-medium text-accent">{copy.footerSummary}</div>
      </div>
    </article>
  )
}

function AuditRollbackCard({ copy, copyLabel, copiedLabel, manualCopyHint }: { readonly copy: BentoLocaleCopy['card4']; readonly copyLabel: string; readonly copiedLabel: string; readonly manualCopyHint: string }) {
  return (
    <article className="specular-surface flex min-h-[380px] flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] bg-card/85 p-8 lg:col-span-7 lg:p-10">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-medium tracking-[0.08em] text-subtle">{copy.eyebrow}</span>
          <StatusBadge tone="neutral">{copy.badge}</StatusBadge>
        </div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[28px]">{copy.title}</h3>
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/[0.09] bg-[#07080B] p-5 sm:p-6">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.stages.map((stage, idx) => (
            <div
              key={stage.step}
              className={clsx(
                'flex flex-col justify-between gap-2 rounded-xl border p-3.5',
                stage.tone === 'emerald' ? 'border-accent/35 bg-accent/[0.07]' : stage.tone === 'warn' ? 'border-warning/30 bg-warning/[0.06]' : 'border-white/[0.08] bg-white/[0.025]',
              )}
            >
              <div className="flex items-center justify-between gap-1 font-mono text-[11px] text-subtle">
                <span>{`0${idx + 1}`}</span>
                <span>{stage.step}</span>
              </div>
              <div className={clsx('font-display text-base font-bold', stage.tone === 'emerald' ? 'text-accent' : stage.tone === 'warn' ? 'text-warning' : 'text-ink')}>
                {stage.metric}
              </div>
              <div className="font-mono text-[11px] leading-snug text-muted">{stage.detail}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 font-mono text-xs">
          <span className="inline-flex items-center gap-2 text-muted">
            <GitCommitHorizontal aria-hidden="true" className="size-4 text-accent" />
            <span>{`${copy.checkpointLabel}:`}</span>
          </span>
          <code className="rounded-md border border-white/[0.09] bg-[#050608] px-2.5 py-1 text-ink">refs/boomopen/checkpoints/phase-1</code>
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw aria-hidden="true" className="hidden size-4 shrink-0 text-subtle sm:block" />
          <CopyCommandBar command={ROLLBACK_CMD} copyLabel={copyLabel} copiedLabel={copiedLabel} manualCopyHint={manualCopyHint} compact />
        </div>
      </div>
    </article>
  )
}

export function FeatureBento() {
  const { locale, t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const copy = BENTO_COPY[locale]

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-7">
      <TokenGuardrailsCard copy={copy.card1} reduceMotion={Boolean(reduceMotion)} />
      <LifecycleShieldCard copy={copy.card2} />
      <WaveReconcileCard copy={copy.card3} />
      <AuditRollbackCard copy={copy.card4} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
    </div>
  )
}
