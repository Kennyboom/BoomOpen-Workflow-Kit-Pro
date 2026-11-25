import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { ArrowUpRight, Check, CheckCircle2, Copy, Sparkles } from 'lucide-react'
import { useCopyCommand } from '../../hooks/useCopyCommand'
import { useLanguage } from '../../i18n/context'
import type { Locale } from '../../types/ui-contract'

/**
 * Interactive 5-Stage Project Lifecycle Showcase inside a sculpted .hardware-bezel:
 * demonstrates how BoomOpen's 36 workflows power every stage from ideation to release.
 */
const FOCUS_RING =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

type LifecycleStageId = 'ideate' | 'build' | 'autopilot' | 'debug' | 'ship'

interface StageTraceLine {
  readonly badge: string
  readonly detail: string
  readonly highlight?: boolean
}

interface LifecycleStageSpec {
  readonly id: LifecycleStageId
  readonly tabLabel: string
  readonly summary: string
  readonly commands: readonly string[]
  readonly prompt: string
  readonly lines: readonly StageTraceLine[]
}

const LIFECYCLE_STAGES: Record<Locale, readonly LifecycleStageSpec[]> = {
  en: [
    {
      id: 'ideate',
      tabLabel: 'Ideate & Design',
      summary: 'Map a 100k-line legacy repo in 60 seconds, validate product ideas, and lock bespoke UI design systems before writing code.',
      commands: ['/onboard', '/brainstorm:team', '/research:hard', '/design:hard'],
      prompt: '/design:hard Architect a dark-glass SaaS analytics workspace with full 5-state UI specs',
      lines: [
        { badge: '[/onboard]', detail: 'Mapped 142 modules, auth boundaries, and DB relations in 48s' },
        { badge: '[/research:hard]', detail: 'Triangulated 4 primary sources and resolved 2 architecture trade-offs' },
        { badge: '[/brainstorm:team]', detail: '3-role team stress-tested product scope and eliminated tarpit risks' },
        { badge: '[/design:hard]', detail: 'Generated OKLCH color system, typography scale, and 5-state UI matrix' },
        { badge: '[WCAG 2.2 AA]', detail: 'Verified contrast, touch targets, and anti-slop layout hierarchy' },
        { badge: '[READY]', detail: 'Blueprint & DESIGN_CONTRACT locked for parallel implementation ✓', highlight: true },
      ],
    },
    {
      id: 'build',
      tabLabel: '3-Wave Parallel Build',
      summary: 'Lock shared API/DB/UI contracts first, then dispatch parallel Backend and Frontend sub-agents with zero file collisions.',
      commands: ['/plan:hard', '/cook:team', '/code:team', '/test'],
      prompt: '/cook:team Implement multi-tenant Stripe billing from PLAN-billing.md',
      lines: [
        { badge: '[Wave 1]', detail: 'Locked shared TypeScript schemas, API contracts, and DB migrations' },
        { badge: '[Wave 2 · API]', detail: 'backend-engineer built webhook handlers & RBAC guards (isolated file lock)' },
        { badge: '[Wave 2 · UI]', detail: 'frontend-engineer built billing portal & upgrade flows in parallel' },
        { badge: '[Wave 2.5]', detail: 'Spec Reconciler verified 100% route parity and 0 unwired modules' },
        { badge: '[Wave 3 · QA]', detail: 'Independent tester & reviewer passed full integration suite' },
        { badge: '[COMPLETE]', detail: 'Full-stack feature delivered cleanly with zero merge conflicts ✓', highlight: true },
      ],
    },
    {
      id: 'autopilot',
      tabLabel: 'Overnight Autopilot',
      summary: 'Hand over your entire docs/ folder and let BoomOpen build a 10-phase system end-to-end with automatic spec reconciliation.',
      commands: ['/goal', '/autopilot', '/docs:core', '/save'],
      prompt: '/goal Use /autopilot to read docs/ and implement all phases sequentially with full spec reconciliation',
      lines: [
        { badge: '[Docs Ingest]', detail: 'Parsed PRD, system architecture, and 10 sequential milestone phases' },
        { badge: '[Phase 1..4]', detail: 'Completed Auth, RBAC, Core API, and Dashboard UI (all E2E tests green)' },
        { badge: '[Reconcile]', detail: 'Caught 1 missing webhook retry handler in Phase 5 -> auto-built & wired' },
        { badge: '[Phase 6..10]', detail: 'Completed Billing, Notifications, Analytics, and Admin Console' },
        { badge: '[Memory]', detail: 'Persisted cross-session roadmap & checkpoints without context drift' },
        { badge: '[DELIVERED]', detail: '10/10 phases built, reconciled, and ready for /audit Round 1 ✓', highlight: true },
      ],
    },
    {
      id: 'debug',
      tabLabel: 'Council & Deep Debug',
      summary: 'Summon Claude, Codex, and Gemini simultaneously to isolate elusive race conditions and ship regression-locked fixes.',
      commands: ['/conduct', '/debug:team', '/fix:hard', '/review:team'],
      prompt: '/conduct council --task debug --prompt "Isolate intermittent checkout race condition under load"',
      lines: [
        { badge: '[Claude Code]', detail: 'Traced transaction lock contention inside payment webhook retry worker' },
        { badge: '[OpenAI Codex]', detail: 'Pinpointed missing idempotency key check on concurrent retries' },
        { badge: '[Antigravity]', detail: 'Cross-verified repro trace and synthesized minimal atomic fix' },
        { badge: '[/debug:team]', detail: 'Reproduced race deterministically with a Failing-First regression test' },
        { badge: '[/fix:hard]', detail: 'Applied atomic upsert + idempotency guard without touching test locks' },
        { badge: '[RESOLVED]', detail: '3-model consensus verified · 0 regressions across 184 tests ✓', highlight: true },
      ],
    },
    {
      id: 'ship',
      tabLabel: 'Audit, PR & Release',
      summary: 'Run stateful multi-round security audits, adversarial PR hunk reviews, and automated semantic releases with confidence.',
      commands: ['/audit', '/pr', '/pr:review', '/release'],
      prompt: '/audit Run full multi-round architecture, integration, and data-leakage audit before release',
      lines: [
        { badge: '[/audit R1]', detail: 'Audited vertical UI-API-DB flows, auth guards, and DTO data exposure' },
        { badge: '[Human Gate]', detail: 'You approved 4 high-priority findings -> /audit:fix patched in locked shards' },
        { badge: '[/audit R2]', detail: 'Re-scan confirmed 0 open blockers and monotonic test ratchet intact' },
        { badge: '[/pr:review]', detail: 'Adversarial reviewer inspected every diff hunk for security & edge cases' },
        { badge: '[/release]', detail: 'Compiled release notes, changelog, and verified production build' },
        { badge: '[SHIPPED]', detail: 'Production release signed off with 1-click rollback checkpoint ✓', highlight: true },
      ],
    },
  ],
  vi: [
    {
      id: 'ideate',
      tabLabel: 'Ý tưởng & Thiết kế',
      summary: 'Nắm bắt codebase cũ 100.000 dòng trong 60 giây, phản biện ý tưởng sản phẩm và khóa hệ thống UI chuẩn mực trước khi code.',
      commands: ['/onboard', '/brainstorm:team', '/research:hard', '/design:hard'],
      prompt: '/design:hard Thiết kế giao diện SaaS phân tích dữ liệu sang trọng đủ 5 trạng thái UI',
      lines: [
        { badge: '[/onboard]', detail: 'Lập bản đồ 142 module, luồng phân quyền và quan hệ DB trong 48 giây' },
        { badge: '[/research:hard]', detail: 'Đối chiếu 4 nguồn tài liệu chuẩn và giải quyết 2 điểm nghẽn kiến trúc' },
        { badge: '[/brainstorm:team]', detail: 'Đội 3 vai trò phản biện phạm vi tính năng và loại bỏ bẫy thiết kế' },
        { badge: '[/design:hard]', detail: 'Khởi tạo bảng màu OKLCH, thang chữ và ma trận UI 5 trạng thái' },
        { badge: '[Chuẩn UI/UX]', detail: 'Đảm bảo độ tương phản WCAG 2.2 AA và bố cục sắc nét chống rập khuôn' },
        { badge: '[SẴN SÀNG]', detail: 'Hoàn tất bản thiết kế & hợp đồng giao diện để vào pha code song song ✓', highlight: true },
      ],
    },
    {
      id: 'build',
      tabLabel: 'Code Song Song 3-Wave',
      summary: 'Khóa chặt hợp đồng API/DB/UI ở Wave 1, sau đó điều phối sub-agent Backend và Frontend code song song không đụng file.',
      commands: ['/plan:hard', '/cook:team', '/code:team', '/test'],
      prompt: '/cook:team Triển khai phân hệ thanh toán định kỳ đa tổ chức từ PLAN-billing.md',
      lines: [
        { badge: '[Wave 1]', detail: 'Khóa hợp đồng TypeScript, đặc tả API và cấu trúc bảng Database' },
        { badge: '[Wave 2 · API]', detail: 'backend-engineer xây dựng luồng webhook & phân quyền (khóa riêng từng file)' },
        { badge: '[Wave 2 · UI]', detail: 'frontend-engineer dựng trang quản lý gói cước song song cùng lúc' },
        { badge: '[Wave 2.5]', detail: 'Tự động đối soát đặc tả: khớp 100% API và không sót module nào chưa nối' },
        { badge: '[Wave 3 · QA]', detail: 'Chuyên gia kiểm thử & phản biện độc lập xác nhận toàn bộ kịch bản E2E' },
        { badge: '[HOÀN TẤT]', detail: 'Hoàn thành trọn vẹn tính năng lớn không một dòng xung đột code ✓', highlight: true },
      ],
    },
    {
      id: 'autopilot',
      tabLabel: 'Chạy Tự Động Qua Đêm',
      summary: 'Giao trọn thư mục tài liệu docs/, hệ thống tự chạy xuyên suốt dự án 10 phase kèm bước tự đối soát chống bỏ sót tính năng.',
      commands: ['/goal', '/autopilot', '/docs:core', '/save'],
      prompt: '/goal Dùng /autopilot đọc toàn bộ docs/ và triển khai tuần tự hết các phase kèm đối soát 100%',
      lines: [
        { badge: '[Đọc tài liệu]', detail: 'Phân tích PRD, kiến trúc tổng thể và chia lộ trình 10 phase rõ ràng' },
        { badge: '[Phase 1..4]', detail: 'Hoàn tất Auth, phân quyền RBAC, Core API và trang tổng quan' },
        { badge: '[Đối soát bù]', detail: 'Phát hiện thiếu xử lý thử lại webhook ở Phase 5 -> tự động code bù ngay' },
        { badge: '[Phase 6..10]', detail: 'Hoàn tất Thanh toán, Thông báo thời gian thực, Báo cáo và Quản trị' },
        { badge: '[Xuyên phiên]', detail: 'Lưu tiến độ bền bỉ qua nhiều phiên mà không trôi ngữ cảnh dự án' },
        { badge: '[BÀN GIAO]', detail: 'Hoàn thành đủ 10/10 phase, sẵn sàng chuyển sang vòng /audit ✓', highlight: true },
      ],
    },
    {
      id: 'debug',
      tabLabel: 'Hội Chẩn & Sửa Bug Khó',
      summary: 'Triệu tập đồng thời Claude, Codex và Gemini cùng mổ xẻ nguyên nhân gốc của bug chập chờn và khóa test chống tái phát.',
      commands: ['/conduct', '/debug:team', '/fix:hard', '/review:team'],
      prompt: '/conduct council --task debug --prompt "Tìm nguyên nhân lỗi tranh chấp luồng khi thanh toán tải cao"',
      lines: [
        { badge: '[Claude Code]', detail: 'Khoanh vùng điểm nghẽn khóa giao dịch trong tiến trình xử lý webhook' },
        { badge: '[OpenAI Codex]', detail: 'Chỉ ra lỗ hổng thiếu kiểm tra khóa idempotency khi request lặp đồng thời' },
        { badge: '[Antigravity]', detail: 'Đối chứng chéo cả hai hướng và tổng hợp bản vá nguyên tử gọn nhất' },
        { badge: '[/debug:team]', detail: 'Tái hiện chính xác lỗi bằng bài test tự động trước khi sửa code' },
        { badge: '[/fix:hard]', detail: 'Áp dụng cơ chế khóa idempotency an toàn mà không phá vỡ luồng cũ' },
        { badge: '[ĐÃ XỬ LÝ]', detail: 'Hội đồng 3 model đồng thuận · Vượt qua 184 bài test không lỗi phụ ✓', highlight: true },
      ],
    },
    {
      id: 'ship',
      tabLabel: 'Kiểm Toán, PR & Release',
      summary: 'Kiểm toán bảo mật và luồng dữ liệu nhiều vòng, soi kỹ từng cụm diff trên PR và đóng gói bản phát hành chuyên nghiệp.',
      commands: ['/audit', '/pr', '/pr:review', '/release'],
      prompt: '/audit Tổng kiểm tra đa vòng toàn bộ luồng nghiệp vụ và bảo mật dữ liệu trước khi phát hành',
      lines: [
        { badge: '[/audit Vòng 1]', detail: 'Rà soát xuyên suốt UI-API-DB, phân quyền và nguy cơ lộ trường nhạy cảm' },
        { badge: '[Bạn phê duyệt]', detail: 'Duyệt 4 mục quan trọng -> /audit:fix tự động vá sạch theo từng nhóm file' },
        { badge: '[/audit Vòng 2]', detail: 'Quét kiểm chứng lần 2: sạch 100% lỗi tồn đọng và giữ vững toàn bộ test' },
        { badge: '[/pr:review]', detail: 'Phản biện độc lập từng cụm thay đổi trên PR trước khi gộp nhánh chính' },
        { badge: '[/release]', detail: 'Tổng hợp changelog, ghi chú phát hành và kiểm tra gói build sản phẩm' },
        { badge: '[PHÁT HÀNH]', detail: 'Sẵn sàng lên môi trường thật kèm mốc hoàn tác 1 chạm an toàn ✓', highlight: true },
      ],
    },
  ],
}

const STAGE_UI: Record<Locale, { readonly tabsAria: string; readonly liveBadge: string; readonly commandsLabel: string }> = {
  en: { tabsAria: 'Project lifecycle workflow stages', liveBadge: '5-IDE UNIFIED', commandsLabel: 'Workflows:' },
  vi: { tabsAria: 'Các giai đoạn quy trình dự án', liveBadge: 'ĐỒNG BỘ 5 IDE', commandsLabel: 'Lệnh dùng:' },
}

function commandQuery(slash: string): string {
  const base = slash.replace(/^\//, '').split(':')[0] ?? ''
  return base === 'goal' ? 'autopilot' : base
}

function selectNodeText(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined') return
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(element)
  selection.removeAllRanges()
  selection.addRange(range)
}

export function HomeTerminalPreview() {
  const { locale, t } = useLanguage()
  const [activeId, setActiveId] = useState<LifecycleStageId>('ideate')
  const { copied, copyFailed, copy } = useCopyCommand()
  const promptRef = useRef<HTMLElement | null>(null)

  const stages = LIFECYCLE_STAGES[locale]
  const activeStage = stages.find((stage) => stage.id === activeId) ?? stages[0]
  const ui = STAGE_UI[locale]

  const handleCopy = async () => {
    const ok = await copy(activeStage.prompt)
    if (!ok) selectNodeText(promptRef.current)
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="hardware-bezel">
        <div className="overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#06070B]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0B0D12] px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span aria-hidden="true" className="hidden items-center gap-1.5 lg:inline-flex lg:mr-1">
                <span className="size-2.5 rounded-full bg-[#FF5F56]/75" />
                <span className="size-2.5 rounded-full bg-[#FFBD2E]/75" />
                <span className="size-2.5 rounded-full bg-[#27C93F]/75" />
              </span>

              <div role="tablist" aria-label={ui.tabsAria} className="flex flex-wrap items-center gap-1.5">
                {stages.map((stage, idx) => {
                  const isActive = stage.id === activeStage.id
                  return (
                    <button
                      key={stage.id}
                      id={`home-stage-tab-${stage.id}`}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      aria-controls={`home-stage-panel-${stage.id}`}
                      onClick={() => setActiveId(stage.id)}
                      className={clsx(
                        'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-[13px] transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                        FOCUS_RING,
                        isActive
                          ? 'border-white bg-primary text-primary-ink font-semibold shadow-[0_6px_18px_-6px_rgba(255,255,255,0.28)]'
                          : 'border-white/[0.08] bg-white/[0.03] text-muted font-medium hover:border-white/[0.20] hover:bg-white/[0.07] hover:text-ink',
                      )}
                    >
                      <span className={clsx('font-mono text-[11px] tabular-nums', isActive ? 'text-primary-ink/75' : 'text-subtle')}>
                        {`0${idx + 1}`}
                      </span>
                      <span>{stage.tabLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="hidden items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/12 px-2.5 py-1 font-mono text-xs font-semibold text-accent xl:inline-flex">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <span>{ui.liveBadge}</span>
            </span>
          </div>

          <div
            id={`home-stage-panel-${activeStage.id}`}
            role="tabpanel"
            aria-labelledby={`home-stage-tab-${activeStage.id}`}
            className="space-y-5 p-5 sm:p-7"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-5 lg:flex-row lg:items-center">
              <p className="max-w-[58ch] text-[15px] leading-relaxed text-muted sm:text-base">{activeStage.summary}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 font-mono text-xs text-subtle">{ui.commandsLabel}</span>
                {activeStage.commands.map((slash) => (
                  <Link
                    key={slash}
                    to={`/commands?q=${encodeURIComponent(commandQuery(slash))}`}
                    className={clsx(
                      'inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 font-mono text-xs font-semibold text-ink transition-colors duration-150 motion-reduce:transition-none hover:border-accent/45 hover:bg-accent/10 hover:text-accent no-underline',
                      FOCUS_RING,
                    )}
                  >
                    <span>{slash}</span>
                    <ArrowUpRight aria-hidden="true" className="size-3.5 text-subtle" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.10] bg-[#0A0C12] px-4 py-2.5 sm:px-5">
              <div className="scrollbar-none flex min-w-0 items-center gap-3 overflow-x-auto py-0.5">
                <span aria-hidden="true" className="select-none font-mono text-sm font-semibold text-accent">&gt;</span>
                <code ref={promptRef} className="whitespace-nowrap font-mono text-sm sm:text-[15px] text-ink">
                  {activeStage.prompt}
                </code>
              </div>

              <button
                type="button"
                aria-label={`${t.common.copy}: ${activeStage.prompt}`}
                onClick={() => {
                  void handleCopy()
                }}
                className={clsx(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-xs font-medium transition-all duration-150 motion-reduce:transition-none cursor-pointer',
                  FOCUS_RING,
                  copied
                    ? 'border-accent/35 bg-accent/14 text-accent'
                    : 'border-white/[0.12] bg-white/[0.05] text-ink hover:border-white/[0.24] hover:bg-white/[0.10]',
                )}
              >
                {copied ? <Check aria-hidden="true" className="size-3.5 text-accent" /> : <Copy aria-hidden="true" className="size-3.5" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            <div className="scrollbar-none space-y-2.5 overflow-x-auto px-1 font-mono text-[13px] leading-relaxed sm:text-sm">
              {activeStage.lines.map((line) => (
                <div key={line.badge} className="flex items-baseline gap-3 whitespace-nowrap">
                  <span className={clsx('w-36 shrink-0 font-semibold', line.highlight ? 'text-accent' : 'text-accent/90')}>
                    {line.badge}
                  </span>
                  <span className={clsx('inline-flex items-center gap-2', line.highlight ? 'font-semibold text-ink' : 'text-ink/85')}>
                    {line.highlight && <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-accent" />}
                    <span>{line.detail}</span>
                  </span>
                </div>
              ))}
            </div>

            <div aria-live="polite" className="sr-only">
              {copied ? t.common.copied : copyFailed ? t.common.copyManualHint : ''}
            </div>
            {copyFailed && <div className="text-xs text-muted">{t.common.copyManualHint}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
