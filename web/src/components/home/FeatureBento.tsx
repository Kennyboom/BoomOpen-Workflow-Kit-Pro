import { clsx } from 'clsx'
import { ArrowLeftRight, ArrowRight, CheckCircle2, FileCheck2, Layers, ShieldCheck, Sparkles } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'
import { CopyCommandBar } from '../ui/Primitives'

/**
 * Asymmetric 2x2 Studio Daylight Bento (lg:grid-cols-12 gap-7) showcasing BoomOpen's
 * 4 unique superpowers inside crisp porcelain #FFFFFF cards and #F4F6FB UI canvases.
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
  readonly models: ReadonlyArray<{ readonly name: string; readonly lens: string; readonly dotClass: string }>
  readonly verdictLabel: string
  readonly verdictDetail: string
}

interface AuditCopy {
  readonly badge: string
  readonly title: string
  readonly body: string
  readonly steps: ReadonlyArray<{ readonly num: string; readonly stage: string; readonly label: string; readonly done?: boolean }>
  readonly auditCommand: string
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
        { name: 'Phase 1 · Database & Auth', status: 'Completed' },
        { name: 'Phase 2 · Core API & UI', status: 'Completed' },
        { name: 'Phase 3 · Billing & E2E', status: 'Running', active: true },
      ],
    },
    reconcile: {
      badge: '100% SPEC PARITY',
      title: 'Zero-Omission Spec Reconcile',
      body: 'Cross-checks your project specs against actual code after implementation and automatically builds skipped or unwired features.',
      headerLeft: 'PRD Requirement',
      headerRight: 'Codebase Parity',
      rows: [
        { req: 'Recurring Billing', target: 'src/billing/subscriptions.ts', badge: 'Matched' },
        { req: 'Webhook Retries', target: 'src/webhooks/retry-worker.ts', badge: 'Matched' },
        { req: 'RBAC Permissions', target: 'Missing guard -> wired & tested', badge: 'Auto-built', healed: true },
      ],
    },
    council: {
      badge: 'CROSS-FAMILY DEBATE',
      title: '/conduct · Cross-Model AI Council',
      body: 'Summons Claude Code, OpenAI Codex, and Antigravity simultaneously to debate architecture, hunt hard bugs, and synthesize the strongest solution.',
      models: [
        { name: 'Claude Code', lens: 'System Architecture', dotClass: 'bg-amber-500' },
        { name: 'OpenAI Codex', lens: 'Edge Cases & Load', dotClass: 'bg-slate-900' },
        { name: 'Antigravity', lens: 'Gemini Cross-Synthesis', dotClass: 'bg-blue-600' },
      ],
      verdictLabel: 'Cross-Critique & Optimal Architecture Selected',
      verdictDetail: 'Independent analysis · Blind-spot elimination · Unified action plan',
    },
    audit: {
      badge: 'END-TO-END & DATA SAFETY',
      title: 'Multi-Round Deep /audit & Security',
      body: 'Runs multi-round end-to-end logic, integration, and data-leakage audits: pause for your review, auto-fix with file locks, and re-verify to zero blockers.',
      steps: [
        { num: '01', stage: 'Full Scan', label: 'UI, API, DB & data leaks' },
        { num: '02', stage: 'Your Review', label: 'Approve selected fixes' },
        { num: '03', stage: 'File-Locked Fix', label: 'Isolated /audit:fix shards' },
        { num: '04', stage: '100% Clean', label: '0 blockers · 1-click rollback', done: true },
      ],
      auditCommand: '/audit Run multi-round security, wiring & data-leakage audit',
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
        { name: 'Phase 1 · Database & Auth', status: 'Hoàn tất' },
        { name: 'Phase 2 · Core API & UI', status: 'Hoàn tất' },
        { name: 'Phase 3 · Billing & E2E', status: 'Đang chạy', active: true },
      ],
    },
    reconcile: {
      badge: 'ĐỐI SOÁT 100% TÀI LIỆU',
      title: 'Đối soát Tài liệu & Code 100%',
      body: 'Tự động so sánh tài liệu dự án với code thực tế sau mỗi đợt code, phát hiện tính năng bị sót hoặc chưa kết nối để code bù đủ 100%.',
      headerLeft: 'Yêu cầu trong PRD',
      headerRight: 'Đối chiếu mã nguồn',
      rows: [
        { req: 'Thanh toán định kỳ', target: 'src/billing/subscriptions.ts', badge: 'Đã khớp' },
        { req: 'Thử lại Webhook', target: 'src/webhooks/retry-worker.ts', badge: 'Đã khớp' },
        { req: 'Phân quyền RBAC', target: 'Thiếu middleware -> đã tự bù & test', badge: 'Tự động code bù', healed: true },
      ],
    },
    council: {
      badge: 'PHẢN BIỆN ĐA MODEL',
      title: '/conduct · Hội đồng Đa Model Chéo Hãng',
      body: 'Triệu tập cùng lúc Claude, Codex và Gemini độc lập phân tích kiến trúc hoặc săn bug khó, phản biện chéo để tìm ra lời giải tốt nhất.',
      models: [
        { name: 'Claude Code', lens: 'Kiến trúc hệ thống', dotClass: 'bg-amber-500' },
        { name: 'OpenAI Codex', lens: 'Bẫy biên & hiệu năng', dotClass: 'bg-slate-900' },
        { name: 'Antigravity', lens: 'Gemini đối chứng', dotClass: 'bg-blue-600' },
      ],
      verdictLabel: 'Phản biện chéo & Chọn kiến trúc tối ưu',
      verdictDetail: 'Độc lập phân tích · Triệt tiêu góc khuất · Chốt phương án mạnh nhất',
    },
    audit: {
      badge: 'BẢO MẬT & LIÊN KẾT MODULE',
      title: '/audit Đa Vòng & Kiểm toán Bảo mật',
      body: 'Tổng kiểm tra nhiều vòng toàn bộ liên kết module và lỗ hổng rò rỉ dữ liệu: báo cáo bạn duyệt, tự sửa khóa file và quét lại tới khi sạch lỗi.',
      steps: [
        { num: '01', stage: 'Quét toàn diện', label: 'UI, API, DB & rò rỉ dữ liệu' },
        { num: '02', stage: 'Bạn duyệt', label: 'Rõ ràng từng hạng mục' },
        { num: '03', stage: 'Tự sửa khóa file', label: '/audit:fix cô lập an toàn' },
        { num: '04', stage: 'Sạch 100% lỗi', label: '0 lỗi tồn đọng · Rollback 1 chạm', done: true },
      ],
      auditCommand: '/audit Tổng kiểm tra bảo mật & liên kết module đa vòng',
    },
  },
}

const CARD_SHELL =
  'specular-surface flex flex-col justify-between gap-7 rounded-3xl border border-slate-200/85 bg-white p-8 shadow-[0_18px_44px_-18px_rgba(15,23,42,0.08)] lg:p-10'
const UI_CANVAS = 'rounded-2xl border border-slate-200/75 bg-[#F4F6FB] p-5'

function AutopilotCard({ copy }: { readonly copy: AutopilotCopy }) {
  return (
    <article className={clsx(CARD_SHELL, 'lg:col-span-7')}>
      <div className={UI_CANVAS}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3.5 text-xs">
          <span className="inline-flex items-center gap-2 font-mono font-semibold text-slate-800">
            <Layers aria-hidden="true" className="size-4 text-blue-600" />
            <span>{copy.sourceTag}</span>
          </span>
          <span className="rounded-full border border-blue-200/80 bg-blue-50 px-3 py-0.5 font-medium text-blue-700">{copy.sessionNote}</span>
        </div>

        <div className="mt-4 space-y-2.5">
          {copy.phases.map((phase) => (
            <div
              key={phase.name}
              className={clsx(
                'flex items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-xs sm:text-sm',
                phase.active ? 'border-blue-200/90 shadow-[0_8px_20px_-8px_rgba(37,99,235,0.18)]' : 'border-slate-200/80 shadow-xs',
              )}
            >
              <span className="inline-flex min-w-0 items-center gap-2.5 font-semibold text-slate-900">
                {phase.active ? (
                  <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-blue-600 animate-pulse motion-reduce:animate-none" />
                ) : (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-emerald-600" />
                )}
                <span className="truncate">{phase.name}</span>
              </span>
              <span
                className={clsx(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                  phase.active ? 'border-blue-200/80 bg-blue-50 text-blue-700' : 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
                )}
              >
                {phase.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-blue-600">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-[#09090B] lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-slate-600 sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function ReconcileCard({ copy }: { readonly copy: ReconcileCopy }) {
  return (
    <article className={clsx(CARD_SHELL, 'lg:col-span-5')}>
      <div className={UI_CANVAS}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
          <span>{copy.headerLeft}</span>
          <span>{copy.headerRight}</span>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {copy.rows.map((row) => (
            <div key={row.req} className={clsx('rounded-xl border bg-white px-4 py-3 shadow-xs', row.healed ? 'border-indigo-200/90' : 'border-slate-200/80')}>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileCheck2 aria-hidden="true" className={clsx('size-4 shrink-0', row.healed ? 'text-indigo-600' : 'text-emerald-600')} />
                  <span className="truncate">{row.req}</span>
                </span>
                <span
                  className={clsx(
                    'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                    row.healed ? 'border-indigo-200/80 bg-indigo-50 text-indigo-700' : 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
                  )}
                >
                  {row.badge}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                <ArrowLeftRight aria-hidden="true" className="size-3 shrink-0 text-blue-600" />
                <span className="truncate">{row.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-blue-600">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-[#09090B] lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[46ch] text-[15px] leading-relaxed text-slate-600 sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function CouncilCard({ copy }: { readonly copy: CouncilCopy }) {
  return (
    <article className={clsx(CARD_SHELL, 'lg:col-span-5')}>
      <div className={clsx(UI_CANVAS, 'space-y-3')}>
        <div className="space-y-2">
          {copy.models.map((model) => (
            <div key={model.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs">
              <span className="inline-flex items-center gap-2.5 font-display text-sm font-bold text-slate-900">
                <span aria-hidden="true" className={clsx('size-2.5 shrink-0 rounded-full', model.dotClass)} />
                <span>{model.name}</span>
              </span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">{model.lens}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-indigo-200/85 bg-gradient-to-r from-blue-50 via-indigo-50/90 to-blue-50 px-4 py-3.5 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-800 sm:text-[13px]">
            <Sparkles aria-hidden="true" className="size-4 shrink-0 text-blue-600" />
            <span>{copy.verdictLabel}</span>
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-600">{copy.verdictDetail}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-blue-600">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-[#09090B] lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[46ch] text-[15px] leading-relaxed text-slate-600 sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

function AuditCard({
  copy,
  copyLabel,
  copiedLabel,
  manualCopyHint,
}: {
  readonly copy: AuditCopy
  readonly copyLabel: string
  readonly copiedLabel: string
  readonly manualCopyHint: string
}) {
  return (
    <article className={clsx(CARD_SHELL, 'lg:col-span-7')}>
      <div className={clsx(UI_CANVAS, 'space-y-4')}>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.steps.map((step, idx) => (
            <div
              key={step.num}
              className={clsx(
                'flex flex-col justify-between gap-2 rounded-xl border px-4 py-3 shadow-xs',
                step.done ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900' : 'border-slate-200/80 bg-white text-slate-900',
              )}
            >
              <div className="flex items-center justify-between gap-1 font-mono text-xs font-semibold">
                <span className={step.done ? 'text-emerald-700' : 'text-blue-600'}>{step.num}</span>
                {idx < copy.steps.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="size-3.5 text-slate-400" />
                ) : (
                  <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600" />
                )}
              </div>
              <div className="font-display text-sm font-bold">{step.stage}</div>
              <div className={clsx('text-xs leading-snug', step.done ? 'font-medium text-emerald-800' : 'text-slate-500')}>{step.label}</div>
            </div>
          ))}
        </div>

        <CopyCommandBar compact command={copy.auditCommand} copyLabel={copyLabel} copiedLabel={copiedLabel} manualCopyHint={manualCopyHint} />
      </div>

      <div className="space-y-2.5">
        <div className="font-mono text-xs font-semibold tracking-[0.08em] text-blue-600">{copy.badge}</div>
        <h3 className="font-display text-2xl leading-[1.14] font-bold tracking-[-0.028em] text-[#09090B] lg:text-[26px]">{copy.title}</h3>
        <p className="max-w-[56ch] text-[15px] leading-relaxed text-slate-600 sm:text-base">{copy.body}</p>
      </div>
    </article>
  )
}

export function FeatureBento() {
  const { locale, t } = useLanguage()
  const copy = BENTO_COPY[locale]

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
      <AutopilotCard copy={copy.autopilot} />
      <ReconcileCard copy={copy.reconcile} />
      <CouncilCard copy={copy.council} />
      <AuditCard copy={copy.audit} copyLabel={t.common.copy} copiedLabel={t.common.copied} manualCopyHint={t.common.copyManualHint} />
    </div>
  )
}
