import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowUpRight, CheckCircle2, FileCheck2, Layers, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/** Jewel-like macOS Studio Workspace Window floating over `/assets/studio-canvas.jpg`. */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

type ShowcaseModeId = 'autopilot' | 'reconcile' | 'council' | 'audit'
type PillTone = 'emerald' | 'blue' | 'indigo' | 'amber'

interface ShowcaseRowItem {
  readonly title: string; readonly detail: string; readonly status: string; readonly tone: PillTone; readonly active?: boolean
}

interface ShowcaseModeSpec {
  readonly id: ShowcaseModeId; readonly tabLabel: string; readonly paneTitle: string
  readonly progressLabel: string; readonly progressPercent: number
  readonly commandPill: string; readonly commandQuery: string
  readonly summaryEyebrow: string; readonly summaryTitle: string; readonly summaryBody: string
  readonly highlights: readonly string[]; readonly exploreLabel: string
  readonly rows: readonly ShowcaseRowItem[]
}

const PILL_TONE_CLASSES: Record<PillTone, string> = {
  emerald: 'border-emerald-200/90 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200/90 bg-blue-50 text-blue-700',
  indigo: 'border-indigo-200/90 bg-indigo-50 text-indigo-700',
  amber: 'border-amber-200/90 bg-amber-50 text-amber-800',
}

const ICON_TONE_CLASSES: Record<PillTone, string> = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
  blue: 'bg-blue-50 text-blue-600 border-blue-200/70',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/70',
  amber: 'bg-amber-50 text-amber-600 border-amber-200/70',
}

const SHOWCASE_MODES: Record<Locale, readonly ShowcaseModeSpec[]> = {
  vi: [
    {
      id: 'autopilot', tabLabel: '1. /autopilot Dự án lớn',
      paneTitle: 'Lộ trình 10 Phase xuyên phiên từ docs/', progressLabel: 'Tiến độ dự án · Phase 8/10', progressPercent: 84,
      commandPill: '/autopilot · Giữ trạng thái xuyên phiên', commandQuery: 'autopilot',
      summaryEyebrow: 'CƠ CHẾ HOẠT ĐỘNG', summaryTitle: 'Tự đọc tài liệu, tự chia phase và code tuần tự tới đích',
      summaryBody: 'Hệ thống đọc trọn bộ PRD và kiến trúc trong thư mục docs/, khóa trạng thái vào sổ cái dự án để chạy bền bỉ qua nhiều phiên làm việc.',
      highlights: [
        'Không trôi ngữ cảnh dù dự án kéo dài hàng chục phiên',
        'Tự động kiểm tra build và test cuối mỗi phase',
        'Hỗ trợ tạm dừng và tiếp tục chính xác từ mốc đang dở',
      ],
      exploreLabel: 'Xem chi tiết lệnh /autopilot',
      rows: [
        { title: 'Phase 1-4 · Xác thực, RBAC & Core API', detail: '42 bài kiểm thử tích hợp vượt qua · 0 lỗi kiểu dữ liệu', status: 'Hoàn tất', tone: 'emerald' },
        { title: 'Phase 5-7 · Thanh toán Stripe & Webhook', detail: 'Khóa hợp đồng dữ liệu song song Backend và UI', status: 'Hoàn tất', tone: 'emerald' },
        { title: 'Phase 8 · Trung tâm Phân tích Thời gian thực', detail: 'Đang ghép nối biểu đồ trực quan và bộ lọc đa chiều', status: 'Đang triển khai', tone: 'blue', active: true },
      ],
    },
    {
      id: 'reconcile', tabLabel: '2. Đối soát đặc tả 100%',
      paneTitle: 'Đối chiếu trực tiếp PRD với mã nguồn thực tế', progressLabel: 'Độ phủ đặc tả · 100% khớp nối', progressPercent: 100,
      commandPill: 'boomopen reconcile --strict', commandQuery: 'cook',
      summaryEyebrow: 'CHỐNG BỎ SÓT TÍNH NĂNG', summaryTitle: 'Phát hiện mục bị quên và tự động code bù ngay lập tức',
      summaryBody: 'Sau mỗi đợt triển khai, bộ đối soát rà từng yêu cầu trong tài liệu thiết kế với route API, giao diện và middleware thực tế trên đĩa.',
      highlights: [
        'Bắt trọn tính năng mới viết nửa chừng hoặc quên nối route',
        'Kiểm tra khớp schema dữ liệu giữa Frontend và Backend',
        'Tự động bổ sung phần còn thiếu trước khi bàn giao',
      ],
      exploreLabel: 'Khám phá quy trình Wave 2.5',
      rows: [
        { title: 'Chu kỳ gia hạn gói cước tự động', detail: 'Đối chiếu khớp hoàn toàn với src/billing/subscriptions.ts', status: 'Hoàn tất', tone: 'emerald' },
        { title: 'Cơ chế thử lại Webhook có khóa chống trùng', detail: 'Đã kết nối hàng đợi xử lý và bảng nhật ký sự kiện', status: 'Hoàn tất', tone: 'emerald' },
        { title: 'Middleware phân quyền xuất báo cáo CSV', detail: 'Phát hiện thiếu kiểm tra vai trò -> đã tự bổ sung và kiểm thử', status: 'Đã bù tính năng thiếu', tone: 'indigo', active: true },
      ],
    },
    {
      id: 'council', tabLabel: '3. /conduct Hội đồng AI',
      paneTitle: 'Hội đồng phản biện độc lập giữa 3 họ Model', progressLabel: 'Đồng thuận kiến trúc · 3/3 Model', progressPercent: 100,
      commandPill: '/conduct council · Author != Critic', commandQuery: 'conduct',
      summaryEyebrow: 'TRÍ TUỆ ĐA MÔ HÌNH', summaryTitle: 'Claude, Codex và Antigravity cùng mổ xẻ một bài toán',
      summaryBody: 'Không model nào tự chấm bài của chính mình. Ba mô hình phân tích độc lập, chỉ ra góc khuất của nhau và đúc kết phương án tối ưu nhất.',
      highlights: [
        'Loại bỏ điểm mù khi thiết kế hệ thống lớn hoặc săn bug khó',
        'Phân tích song song ở chế độ chỉ đọc an toàn tuyệt đối',
        'Tổng hợp thành bản hành động rõ ràng, súc tích',
      ],
      exploreLabel: 'Xem lệnh hội đồng /conduct',
      rows: [
        { title: 'Claude Code · Góc nhìn Kiến trúc Hệ thống', detail: 'Đề xuất tách lớp cô lập giao dịch cho cụm thanh toán', status: 'Đã phân tích', tone: 'amber' },
        { title: 'OpenAI Codex · Góc nhìn Bẫy biên & Tải cao', detail: 'Phát hiện nguy cơ tranh chấp khóa khi 2 request đến cùng lúc', status: 'Đã phản biện', tone: 'indigo' },
        { title: 'Antigravity · Tổng hợp & Chốt phương án', detail: 'Hợp nhất khóa idempotency nguyên tử, gọn nhẹ và an toàn', status: '3 Model đồng thuận', tone: 'emerald', active: true },
      ],
    },
    {
      id: 'audit', tabLabel: '4. /audit Bảo mật đa vòng',
      paneTitle: 'Kiểm toán bảo mật, phân quyền và luồng dữ liệu', progressLabel: 'Kiểm chứng Vòng 2 · 0 lỗi tồn đọng', progressPercent: 100,
      commandPill: '/audit -> /audit:fix -> Rollback 1 chạm', commandQuery: 'audit',
      summaryEyebrow: 'AN TOÀN TRƯỚC KHI LÊN PROD', summaryTitle: 'Rà soát đa vòng từ giao diện xuống tận cơ sở dữ liệu',
      summaryBody: 'Tổng kiểm tra lỗ hổng lộ dữ liệu nhạy cảm, thiếu kiểm tra quyền và đứt gãy luồng nghiệp vụ, trình bày rõ ràng để bạn duyệt trước khi tự sửa.',
      highlights: [
        'Bạn toàn quyền duyệt danh sách hạng mục trước khi máy sửa',
        'Khóa riêng từng cụm file để không gây lỗi dây chuyền',
        'Lưu mốc an toàn hỗ trợ hoàn tác tức thì chỉ với 1 lệnh',
      ],
      exploreLabel: 'Tìm hiểu quy trình /audit',
      rows: [
        { title: 'Vòng 1 · Quét liên kết UI, API, DB & DTO', detail: 'Phát hiện 3 điểm cần siết chặt quyền truy cập tài nguyên', status: 'Hoàn tất', tone: 'emerald' },
        { title: 'Bước tự sửa · /audit:fix theo nhóm file độc lập', detail: 'Đã vá 3/3 hạng mục bạn duyệt và giữ nguyên bài test cũ', status: 'Khóa file an toàn', tone: 'blue' },
        { title: 'Vòng 2 · Quét kiểm chứng toàn bộ hệ thống', detail: 'Xác nhận 0 lỗ hổng bảo mật, sẵn sàng phát hành sản phẩm', status: 'Sạch 100% lỗi', tone: 'emerald', active: true },
      ],
    },
  ],
  en: [
    {
      id: 'autopilot', tabLabel: '1. /autopilot Multi-Phase',
      paneTitle: '10-Phase Cross-Session Roadmap from docs/', progressLabel: 'Project Progress · Phase 8 of 10', progressPercent: 84,
      commandPill: '/autopilot · Persistent Ledger State', commandQuery: 'autopilot',
      summaryEyebrow: 'UNDER THE HOOD', summaryTitle: 'Ingests your specs and builds phase by phase autonomously',
      summaryBody: 'Reads your PRD and architecture docs, locks milestones into a persistent ledger, and executes sequential waves across sessions without context drift.',
      highlights: [
        'Zero state loss across multi-day engineering sessions',
        'Automated build, typecheck, and E2E verification per phase',
        'Pause and resume cleanly from verified checkpoints',
      ],
      exploreLabel: 'Inspect /autopilot workflow',
      rows: [
        { title: 'Phases 1-4 · Auth, RBAC & Core API', detail: '42 integration tests passing · 0 type errors', status: 'Completed', tone: 'emerald' },
        { title: 'Phases 5-7 · Stripe Billing & Webhooks', detail: 'Parallel Backend and UI shards with locked contracts', status: 'Completed', tone: 'emerald' },
        { title: 'Phase 8 · Real-Time Analytics Workspace', detail: 'Wiring interactive charts and multi-tenant filters', status: 'In Progress', tone: 'blue', active: true },
      ],
    },
    {
      id: 'reconcile', tabLabel: '2. 100% Spec Reconcile',
      paneTitle: 'Live PRD-to-Codebase Parity Verification', progressLabel: 'Spec Coverage · 100% Wired', progressPercent: 100,
      commandPill: 'boomopen reconcile --strict', commandQuery: 'cook',
      summaryEyebrow: 'ZERO SKIPPED FEATURES', summaryTitle: 'Catches unwired requirements and auto-builds missing pieces',
      summaryBody: 'After implementation waves finish, the reconciler cross-checks every spec clause against actual API routes, UI views, and middleware on disk.',
      highlights: [
        'Eliminates half-wired routes and forgotten edge requirements',
        'Verifies Frontend-to-Backend schema parity automatically',
        'Synthesizes and tests missing features before sign-off',
      ],
      exploreLabel: 'Explore Wave 2.5 reconcile',
      rows: [
        { title: 'Automated Recurring Plan Renewals', detail: 'Matched against src/billing/subscriptions.ts', status: 'Completed', tone: 'emerald' },
        { title: 'Idempotent Webhook Retry Queue', detail: 'Verified worker binding and audit event persistence', status: 'Completed', tone: 'emerald' },
        { title: 'CSV Export Role Permission Guard', detail: 'Detected missing middleware -> auto-built and verified', status: 'Auto-Healed Gap', tone: 'indigo', active: true },
      ],
    },
    {
      id: 'council', tabLabel: '3. /conduct AI Council',
      paneTitle: 'Independent Cross-Family Architecture Debate', progressLabel: 'Council Consensus · 3/3 Models', progressPercent: 100,
      commandPill: '/conduct council · Author != Critic', commandQuery: 'conduct',
      summaryEyebrow: 'MULTI-MODEL INTELLIGENCE', summaryTitle: 'Claude, Codex, and Antigravity debate side by side',
      summaryBody: 'No model grades its own homework. Three distinct model families analyze independently, challenge blind spots, and converge on one optimal design.',
      highlights: [
        'Eliminates single-model blind spots on complex bugs',
        'Runs safely in parallel read-only sandboxes',
        'Produces a unified, actionable engineering synthesis',
      ],
      exploreLabel: 'View /conduct council command',
      rows: [
        { title: 'Claude Code · System Architecture Lens', detail: 'Proposed isolated transaction boundary for checkout flow', status: 'Analyzed', tone: 'amber' },
        { title: 'OpenAI Codex · Concurrency & Edge Cases', detail: 'Pinpointed lock contention under duplicate webhook bursts', status: 'Cross-Checked', tone: 'indigo' },
        { title: 'Antigravity · Unified Synthesis', detail: 'Combined atomic idempotency key with minimal diff footprint', status: '3-Model Consensus', tone: 'emerald', active: true },
      ],
    },
    {
      id: 'audit', tabLabel: '4. /audit Deep Security',
      paneTitle: 'Multi-Round Security, Auth & Wiring Audit', progressLabel: 'Round 2 Verification · 0 Blockers', progressPercent: 100,
      commandPill: '/audit -> /audit:fix -> 1-Click Rollback', commandQuery: 'audit',
      summaryEyebrow: 'PRODUCTION CONFIDENCE', summaryTitle: 'Audits vertical flows from UI down to database queries',
      summaryBody: 'Scans for DTO data leaks, missing auth guards, and broken module links across rounds, pausing for your approval before applying file-locked fixes.',
      highlights: [
        'Human approval gate before automated fixes touch disk',
        'Strict per-file write locks prevent cascading regressions',
        'Instant 1-click checkpoint rollback when needed',
      ],
      exploreLabel: 'Explore /audit workflow',
      rows: [
        { title: 'Round 1 · Full UI-API-DB & DTO Scan', detail: 'Flagged 3 tenant-scoping checks for human review', status: 'Completed', tone: 'emerald' },
        { title: 'Remediation · Isolated /audit:fix Shards', detail: 'Patched all 3 approved items while preserving test locks', status: 'File-Locked', tone: 'blue' },
        { title: 'Round 2 · Clean Verification Pass', detail: 'Confirmed 0 open security or integration blockers', status: '100% Clean', tone: 'emerald', active: true },
      ],
    },
  ],
}

function ModeIcon({ id }: { readonly id: ShowcaseModeId }) {
  if (id === 'autopilot') return <Layers aria-hidden="true" className="size-4" />
  if (id === 'reconcile') return <FileCheck2 aria-hidden="true" className="size-4" />
  if (id === 'council') return <Users aria-hidden="true" className="size-4" />
  return <ShieldCheck aria-hidden="true" className="size-4" />
}

function LeftWorkspacePane({ mode }: { readonly mode: ShowcaseModeSpec }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/75 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="inline-flex size-7 items-center justify-center rounded-lg border border-blue-200/80 bg-blue-50 text-blue-600">
              <ModeIcon id={mode.id} />
            </span>
            <span>{mode.paneTitle}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">{`${mode.progressPercent}%`}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${mode.progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs font-medium text-slate-500">{mode.progressLabel}</div>
      </div>

      <div className="space-y-2.5">
        {mode.rows.map((row) => (
          <div
            key={row.title}
            className={clsx(
              'flex flex-col justify-between gap-2.5 rounded-xl border bg-white px-4 py-3.5 sm:flex-row sm:items-center',
              row.active ? 'border-blue-200/90 shadow-[0_10px_24px_-12px_rgba(37,99,235,0.22)]' : 'border-slate-200/80 shadow-2xs',
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className={clsx('mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg border', ICON_TONE_CLASSES[row.tone])}>
                <CheckCircle2 aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{row.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{row.detail}</div>
              </div>
            </div>
            <span className={clsx('inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1 text-xs font-semibold sm:self-center', PILL_TONE_CLASSES[row.tone])}>
              {row.active && <span aria-hidden="true" className="size-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none" />}
              <span>{row.status}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StudioHeroShowcase() {
  const { locale } = useLanguage()
  const [activeModeId, setActiveModeId] = useState<ShowcaseModeId>('autopilot')

  const modes = SHOWCASE_MODES[locale]
  const activeMode = modes.find((item) => item.id === activeModeId) ?? modes[0]
  const tabsAriaLabel = locale === 'vi' ? 'Chế độ trình diễn BoomOpen Studio' : 'BoomOpen Studio showcase modes'

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[#EEF2F8] bg-cover bg-center p-4 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.12)] sm:p-8 lg:p-12"
      style={{ backgroundImage: "url('/assets/studio-canvas.jpg')" }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/16" />

      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/90 bg-white/95 text-left shadow-[0_28px_70px_-12px_rgba(15,23,42,0.20)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#FF5F56]" />
            <span className="size-3 rounded-full bg-[#FFBD2E]" />
            <span className="size-3 rounded-full bg-[#27C93F]" />
          </div>

          <div role="tablist" aria-label={tabsAriaLabel} className="flex flex-wrap items-center gap-1.5">
            {modes.map((mode) => {
              const isSelected = mode.id === activeMode.id
              return (
                <button
                  key={mode.id}
                  id={`studio-hero-tab-${mode.id}`}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  aria-controls={`studio-hero-panel-${mode.id}`}
                  onClick={() => setActiveModeId(mode.id)}
                  className={clsx(
                    'inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-150 motion-reduce:transition-none sm:text-[13px] cursor-pointer',
                    FOCUS_RING,
                    isSelected
                      ? 'border-[#09090B] bg-[#09090B] text-white shadow-xs'
                      : 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100/70 hover:text-slate-900',
                  )}
                >
                  {mode.tabLabel}
                </button>
              )
            })}
          </div>
        </div>

        <div
          id={`studio-hero-panel-${activeMode.id}`}
          role="tabpanel"
          aria-labelledby={`studio-hero-tab-${activeMode.id}`}
          className="grid items-center gap-6 bg-white p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <LeftWorkspacePane mode={activeMode} />

          <div className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-slate-200/80 bg-slate-50 p-6">
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{activeMode.summaryEyebrow}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
                  <Sparkles aria-hidden="true" className="size-3.5 text-blue-600" />
                  <span>{activeMode.commandPill}</span>
                </span>
              </div>
              <h2 className="font-display text-xl leading-snug font-bold tracking-[-0.025em] text-slate-900 sm:text-[22px]">{activeMode.summaryTitle}</h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">{activeMode.summaryBody}</p>
              <ul className="space-y-2 pt-1">
                {activeMode.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 sm:text-[13px]">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-200/80 pt-3">
              <Link
                to={`/commands?q=${encodeURIComponent(activeMode.commandQuery)}`}
                className={clsx('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 no-underline', FOCUS_RING)}
              >
                <span>{activeMode.exploreLabel}</span>
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
