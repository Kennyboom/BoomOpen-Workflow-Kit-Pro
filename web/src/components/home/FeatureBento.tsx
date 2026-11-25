import { clsx } from 'clsx'
import { ArrowDown, ArrowLeftRight, ArrowRight, CheckCircle2, Layers, RotateCcw, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * Asymmetric 2x2 widescreen Bento (lg:grid-cols-12 gap-7) showcasing BoomOpen's
 * 4 unique flagship superpowers with rich visual UI mockups and concise prose.
 */
interface AutopilotCopy {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly sourceTag: string
  readonly sessionNote: string
  readonly phases: ReadonlyArray<{ readonly name: string; readonly status: string; readonly active?: boolean }>
}

interface ReconcileCopy {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly headerLeft: string
  readonly headerRight: string
  readonly rows: ReadonlyArray<{ readonly req: string; readonly target: string; readonly badge: string; readonly healed?: boolean }>
}

interface CouncilCopy {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly models: ReadonlyArray<{ readonly name: string; readonly lens: string }>
  readonly verdictLabel: string
  readonly verdictDetail: string
}

interface AuditCopy {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly steps: ReadonlyArray<{ readonly stage: string; readonly label: string; readonly done?: boolean }>
  readonly rollbackBadge: string
}

interface BentoCopy {
  readonly autopilot: AutopilotCopy
  readonly reconcile: ReconcileCopy
  readonly council: CouncilCopy
  readonly audit: AuditCopy
}

const BENTO_COPY: Record<Locale, BentoCopy> = {
  en: {
    autopilot: {
      badge: 'MULTI-SESSION ROADMAP',
      title: '/autopilot · Autonomous Multi-Phase Builder',
      body: 'Reads your entire docs/ folder and builds every project phase sequentially across sessions without losing state or context.',
      sourceTag: 'docs/PRD.md + Architecture',
      sessionNote: 'Persistent across sessions',
      phases: [
        { name: 'Phase 1: Database & Auth', status: 'DONE' },
        { name: 'Phase 2: Core API & UI', status: 'DONE' },
        { name: 'Phase 3: Billing & E2E', status: 'RUNNING', active: true },
      ],
    },
    reconcile: {
      badge: '100% SPEC PARITY',
      title: 'Zero-Omission Spec Reconcile',
      body: 'Cross-checks your project specs against actual code after implementation and automatically builds any skipped or unwired features.',
      headerLeft: 'PRD Requirement',
      headerRight: 'Codebase Verification',
      rows: [
        { req: '[PRD] Recurring Billing', target: 'src/billing/*', badge: 'VERIFIED' },
        { req: '[PRD] Webhook Retries', target: 'src/webhooks/*', badge: 'VERIFIED' },
        { req: '[PRD] RBAC Permissions', target: 'Missing middleware', badge: 'Auto-built ✓', healed: true },
      ],
    },
    council: {
      badge: 'CROSS-FAMILY DEBATE',
      title: '/conduct · Cross-Model AI Council',
      body: 'Summons Claude Code, OpenAI Codex, and Antigravity simultaneously to debate architecture, hunt hard bugs, and synthesize the strongest solution.',
      models: [
        { name: 'Claude Code', lens: 'System Design' },
        { name: 'OpenAI Codex', lens: 'Edge Cases' },
        { name: 'Antigravity', lens: 'Gemini Synthesis' },
      ],
      verdictLabel: 'Cross-Critique & Optimal Architecture Selected ✓',
      verdictDetail: 'Independent analysis · Blind-spot elimination · Unified action plan',
    },
    audit: {
      badge: 'END-TO-END & DATA SAFETY',
      title: 'Multi-Round Deep /audit & Security',
      body: 'Runs multi-round end-to-end logic, integration, and data-leakage audits: pause for your review, auto-fix, and re-verify to zero blockers.',
      steps: [
        { stage: 'Round 1', label: 'Scan UI-API-DB & Data Leaks' },
        { stage: 'Your Review', label: 'Approve Selected Fixes' },
        { stage: '/audit:fix', label: 'File-Locked Auto-Fix' },
        { stage: 'Round 2', label: '100% Clean · 0 Blockers ✓', done: true },
      ],
      rollbackBadge: '1-Click Instant Rollback Ready',
    },
  },
  vi: {
    autopilot: {
      badge: 'LỘ TRÌNH XUYÊN PHIÊN',
      title: '/autopilot · Tự động code trọn dự án lớn nhiều Phase',
      body: 'Đọc toàn bộ tài liệu dự án, tự chia lộ trình và triển khai tuần tự hết phase này sang phase khác qua nhiều phiên mà không mất trạng thái.',
      sourceTag: 'docs/PRD.md + Architecture',
      sessionNote: 'Giữ trạng thái xuyên phiên',
      phases: [
        { name: 'Phase 1: Database & Auth', status: 'HOÀN TẤT' },
        { name: 'Phase 2: Core API & UI', status: 'HOÀN TẤT' },
        { name: 'Phase 3: Billing & E2E', status: 'ĐANG CHẠY', active: true },
      ],
    },
    reconcile: {
      badge: 'ĐỐI SOÁT 100% TÀI LIỆU',
      title: 'Đối soát Tài liệu & Code 100%',
      body: 'Tự động so sánh tài liệu dự án với code thực tế sau mỗi đợt code, phát hiện tính năng bị sót hoặc chưa kết nối để code bù đủ 100%.',
      headerLeft: 'Yêu cầu trong PRD',
      headerRight: 'Đối chiếu mã nguồn',
      rows: [
        { req: '[Yêu cầu PRD] Thanh toán định kỳ', target: 'src/billing/*', badge: 'ĐÃ ĐỐI SOÁT' },
        { req: '[Yêu cầu PRD] Thử lại Webhook', target: 'src/webhooks/*', badge: 'ĐÃ ĐỐI SOÁT' },
        { req: '[Yêu cầu PRD] Phân quyền RBAC', target: 'Thiếu middleware', badge: 'Tự động code bù ✓', healed: true },
      ],
    },
    council: {
      badge: 'PHẢN BIỆN ĐA MODEL',
      title: '/conduct · Hội đồng Đa Model Chéo Hãng',
      body: 'Triệu tập cùng lúc Claude, Codex và Gemini độc lập phân tích kiến trúc hoặc săn bug khó, phản biện chéo để tìm ra lời giải tốt nhất.',
      models: [
        { name: 'Claude Code', lens: 'Kiến trúc hệ thống' },
        { name: 'OpenAI Codex', lens: 'Bẫy biên & hiệu năng' },
        { name: 'Antigravity', lens: 'Gemini đối chứng' },
      ],
      verdictLabel: 'Phản biện chéo & Chọn kiến trúc tối ưu ✓',
      verdictDetail: 'Độc lập phân tích · Triệt tiêu góc khuất · Chốt phương án mạnh nhất',
    },
    audit: {
      badge: 'BẢO MẬT & LIÊN KẾT MODULE',
      title: '/audit Đa Vòng & Kiểm toán Bảo mật',
      body: 'Tổng kiểm tra nhiều vòng toàn bộ liên kết module và lỗ hổng rò rỉ dữ liệu: báo cáo bạn duyệt, tự sửa và quét lại tới khi sạch lỗi.',
      steps: [
        { stage: 'Vòng 1', label: 'Quét logic UI-API-DB & Lộ dữ liệu' },
        { stage: 'Bạn duyệt', label: 'Báo cáo rõ ràng từng hạng mục' },
        { stage: '/audit:fix', label: 'Tự sửa khóa cứng từng file' },
        { stage: 'Vòng 2', label: 'Sạch 100% lỗi ✓', done: true },
      ],
      rollbackBadge: 'Hỗ trợ Rollback 1 chạm an toàn',
    },
  },
}

function AutopilotCard({ copy }: { readonly copy: AutopilotCopy }) {
  return (
    <article className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] p-8 lg:col-span-7 lg:p-10">
      <div className="rounded-2xl border border-white/[0.08] bg-[#07080C] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3.5 font-mono text-xs">
          <span className="inline-flex items-center gap-2 font-medium text-ink">
            <Layers aria-hidden="true" className="size-4 text-accent" />
            <span>{copy.sourceTag}</span>
          </span>
          <span className="text-accent">{copy.sessionNote}</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {copy.phases.map((phase) => (
            <div
              key={phase.name}
              className={clsx(
                'flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 font-mono text-xs sm:text-[13px]',
                phase.active
                  ? 'border-accent/40 bg-accent/[0.09] text-ink shadow-[0_0_22px_-8px_oklch(0.76_0.155_162/0.35)]'
                  : 'border-white/[0.08] bg-white/[0.025] text-ink/90',
              )}
            >
              <span className="truncate font-medium">{phase.name}</span>
              <span
                className={clsx(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-semibold',
                  phase.active
                    ? 'border-accent/40 bg-accent/15 text-accent'
                    : 'border-white/[0.10] bg-white/[0.05] text-accent',
                )}
              >
                {phase.active ? (
                  <span aria-hidden="true" className="size-2 rounded-full bg-accent animate-pulse motion-reduce:animate-none" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="size-3.5" />
                )}
                <span>{`[${phase.status}]`}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-accent">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function ReconcileCard({ copy }: { readonly copy: ReconcileCopy }) {
  return (
    <article className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] p-8 lg:col-span-5 lg:p-10">
      <div className="rounded-2xl border border-white/[0.08] bg-[#07080C] p-5">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] pb-3 font-mono text-[11px] uppercase tracking-[0.07em] text-subtle">
          <span>{copy.headerLeft}</span>
          <span>{copy.headerRight}</span>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {copy.rows.map((row) => (
            <div
              key={row.req}
              className={clsx(
                'rounded-xl border px-3.5 py-2.5 font-mono text-xs',
                row.healed ? 'border-accent/40 bg-accent/[0.09]' : 'border-white/[0.08] bg-white/[0.025]',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{row.req}</span>
                <span className="shrink-0 rounded-md border border-accent/30 bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {row.badge}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-subtle">
                <ArrowLeftRight aria-hidden="true" className="size-3 shrink-0 text-accent" />
                <span className="truncate">{row.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-accent">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function CouncilCard({ copy }: { readonly copy: CouncilCopy }) {
  return (
    <article className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] p-8 lg:col-span-5 lg:p-10">
      <div className="flex flex-col justify-between gap-3.5 rounded-2xl border border-white/[0.08] bg-[#07080C] p-5">
        <div className="grid grid-cols-3 gap-2">
          {copy.models.map((m) => (
            <div key={m.name} className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3 text-center">
              <div className="truncate font-display text-xs font-bold text-ink sm:text-[13px]">{m.name}</div>
              <div className="mt-1 truncate font-mono text-[10px] text-subtle">{m.lens}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-accent" aria-hidden="true">
          <ArrowDown className="size-4" />
          <Users className="size-4" />
          <ArrowDown className="size-4" />
        </div>

        <div className="rounded-xl border border-accent/40 bg-accent/[0.09] px-4 py-3 text-center">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-accent">
            <Sparkles aria-hidden="true" className="size-3.5 shrink-0" />
            <span>{copy.verdictLabel}</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted">{copy.verdictDetail}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-accent">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function AuditCard({ copy }: { readonly copy: AuditCopy }) {
  return (
    <article className="specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-white/[0.10] p-8 lg:col-span-7 lg:p-10">
      <div className="space-y-3.5 rounded-2xl border border-white/[0.08] bg-[#07080C] p-5">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map((step, idx) => (
            <div
              key={step.stage}
              className={clsx(
                'flex flex-col justify-between gap-2 rounded-xl border p-3.5',
                step.done ? 'border-accent/40 bg-accent/[0.09]' : 'border-white/[0.08] bg-white/[0.025]',
              )}
            >
              <div className="flex items-center justify-between gap-1 font-mono text-[11px]">
                <span className={step.done ? 'font-semibold text-accent' : 'text-subtle'}>{`0${idx + 1}`}</span>
                {idx < copy.steps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="size-3 text-subtle" />
                ) : (
                  <ShieldCheck aria-hidden="true" className="size-3.5 text-accent" />
                )}
              </div>
              <div className={clsx('font-display text-sm font-bold', step.done ? 'text-accent' : 'text-ink')}>
                {step.stage}
              </div>
              <div className="font-mono text-[11px] leading-snug text-muted">{step.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 font-mono text-xs text-ink/90">
          <span className="inline-flex items-center gap-2">
            <RotateCcw aria-hidden="true" className="size-3.5 text-accent" />
            <span>{copy.rollbackBadge}</span>
          </span>
          <span className="font-semibold text-accent">/audit · /audit:fix</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-accent">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-ink lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-muted sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

export function FeatureBento() {
  const { locale } = useLanguage()
  const copy = BENTO_COPY[locale]

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
      <AutopilotCard copy={copy.autopilot} />
      <ReconcileCard copy={copy.reconcile} />
      <CouncilCard copy={copy.council} />
      <AuditCard copy={copy.audit} />
    </div>
  )
}
