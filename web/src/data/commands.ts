import type { BilingualText, CommandCatalogItem, CommandCategory } from '../types/ui-contract'
import { KIT_STATS } from './kitStats'

export const COMMAND_CATEGORIES: readonly CommandCategory[] = [
  'orchestration',
  'engineering',
  'research-design',
  'quality-security',
  'session-ops',
]

interface CommandSeed {
  readonly name: string
  readonly category: CommandCategory
  readonly summary: BilingualText
  readonly nlExamples: BilingualText
}

function defineSeed(
  name: string,
  category: CommandCategory,
  enSummary: string,
  viSummary: string,
  enExample: string,
  viExample: string,
): CommandSeed {
  return {
    name,
    category,
    summary: { en: enSummary, vi: viSummary },
    nlExamples: { en: enExample, vi: viExample },
  }
}

const COMMAND_SEEDS: readonly CommandSeed[] = [
  // Orchestration (6)
  defineSeed(
    'autopilot', 'orchestration',
    'Multi-session phase runner backed by .boomopen/project-ledger.json, SHA-256 spec hashes, and 100% RTM phase gates.',
    'Chạy dự án nhiều phase xuyên phiên qua .boomopen/project-ledger.json, khóa băm đặc tả SHA-256 và đối chiếu RTM 100%.',
    '"/autopilot run the next phase from docs/"',
    '"/autopilot triển khai tiếp phase kế tiếp từ thư mục docs/"',
  ),
  defineSeed(
    'conduct', 'orchestration',
    'Runs multi-engine councils and cross-IDE pipelines across Claude Code, Codex, Antigravity, Cursor, and Copilot with Author != Critic review.',
    'Điều phối hội đồng đa mô hình và pipeline chéo giữa Claude Code, Codex, Antigravity, Cursor, Copilot theo nguyên tắc Author != Critic.',
    '"boomopen conduct council --task review --prompt \'Audit auth boundary\'"',
    '"boomopen conduct council --task review --prompt \'Kiểm tra ranh giới xác thực\'"',
  ),
  defineSeed(
    'orchestrate', 'orchestration',
    'Splits cross-domain work into parallel role#shard sub-agents with disjoint OWNED_FILES write locks.',
    'Tách tác vụ liên miền thành các sub-agent role#shard chạy song song với khóa ghi OWNED_FILES tách biệt.',
    '"Coordinate database, backend, and frontend shards in parallel"',
    '"Phối hợp chạy song song các nhánh database, backend và frontend"',
  ),
  defineSeed(
    'auto', 'orchestration',
    'Classifies an open request and dispatches either direct single-session edits or a multi-agent workflow.',
    'Phân loại yêu cầu hiện tại để xử lý trực tiếp hoặc chuyển sang quy trình phối hợp multi-agent phù hợp.',
    '"/auto pick the right workflow for this task"',
    '"/auto chọn quy trình phù hợp để xử lý yêu cầu này"',
  ),
  defineSeed(
    'next', 'orchestration',
    'Reads current artifacts, ledger cursor, and pending waves to recommend and launch the next step.',
    'Đọc trạng thái ledger, các bản thiết kế và wave đang chờ để đề xuất bước tiếp theo cần chạy.',
    '"/next what is pending in our current phase?"',
    '"/next bước tiếp theo trong phase hiện tại là gì?"',
  ),
  defineSeed(
    'settings', 'orchestration',
    'Configures all 5 presets (frontier-guardrails default), 22 config keys, local --ui dashboard, and < 10ms sync across 14 entry files.',
    'Quản lý 5 preset (mặc định frontier-guardrails), 22 khóa cấu hình, bảng điều khiển --ui và đồng bộ 14 tệp đầu vào dưới 10ms.',
    '"boomopen settings preset adversarial-team or /settings preset smart-hybrid"',
    '"boomopen settings preset adversarial-team hoặc /settings preset smart-hybrid"',
  ),

  // Engineering (10)
  defineSeed(
    'cook', 'engineering',
    'End-to-end feature workflow when no plan exists: scouts the repo, locks contracts, runs parallel shards, and verifies E2E.',
    'Xây dựng tính năng từ đầu khi chưa có kế hoạch: khảo sát mã nguồn, khóa hợp đồng, chạy song song theo wave và kiểm thử E2E.',
    '"/cook:team build passkey authentication end-to-end"',
    '"/cook:team xây dựng tính năng đăng nhập Passkey từ đầu đến cuối"',
  ),
  defineSeed(
    'code', 'engineering',
    'Executes an approved PLAN-* directly across Wave 1-3 shards without re-running /plan.',
    'Triển khai trực tiếp bản PLAN-* đã duyệt qua 3 wave song song mà không cần chạy lại /plan.',
    '"/code execute PLAN-rbac.md"',
    '"/code triển khai theo bản kế hoạch PLAN-rbac.md đã duyệt"',
  ),
  defineSeed(
    'fix', 'engineering',
    'Multi-file bug fix workflow pairing root-cause isolation, regression test locks, and full build verification.',
    'Quy trình sửa lỗi nhiều file: khoanh vùng nguyên nhân gốc, khóa test chống hồi quy và kiểm tra lại toàn bộ bản build.',
    '"/fix resolve the webhook retry race condition"',
    '"/fix xử lý lỗi race condition khi retry webhook"',
  ),
  defineSeed(
    'refactor', 'engineering',
    'Behavior-preserving restructuring into 200-350 line cohesive modules (400 soft / 500 hard) with zero test regressions.',
    'Tái cấu trúc mã nguồn giữ nguyên hành vi, tách gọn về các module 200-350 dòng (ngưỡng 400/500) và bảo toàn toàn bộ test.',
    '"/refactor split this 700-line controller into domain services"',
    '"/refactor tách file controller 700 dòng này thành các module rõ trách nhiệm"',
  ),
  defineSeed(
    'deploy', 'engineering',
    'Pre-release checks, preview staging, production rollout, and post-deploy smoke verification.',
    'Kiểm tra điều kiện phát hành, dựng bản preview, triển khai production và xác nhận trạng thái sau deploy.',
    '"/deploy:check verify production readiness"',
    '"/deploy:check kiểm tra toàn bộ điều kiện trước khi lên production"',
  ),
  defineSeed(
    'rollback', 'engineering',
    'Reverts a faulty release safely, checks schema compatibility, and verifies service recovery.',
    'Hoàn tác bản triển khai lỗi an toàn, kiểm tra tương thích schema dữ liệu và xác nhận dịch vụ phục hồi.',
    '"/rollback revert the latest release and run health checks"',
    '"/rollback hoàn tác bản phát hành vừa rồi và kiểm tra lại hệ thống"',
  ),
  defineSeed(
    'init', 'engineering',
    'Initializes .boomopen.json workspace overrides, linter/typecheck scripts, and baseline directory conventions.',
    'Khởi tạo tệp cấu hình dự án .boomopen.json, script kiểm tra kiểu/lint và cấu trúc thư mục chuẩn cho kho mã mới.',
    '"/init set up BoomOpen workspace conventions"',
    '"/init khởi tạo cấu hình dự án BoomOpen cho repo này"',
  ),
  defineSeed(
    'preview', 'engineering',
    'Starts and checks local preview builds with route rendering and console error verification.',
    'Khởi chạy bản preview cục bộ, kiểm tra cổng dịch vụ và xác nhận các trang hiển thị không phát sinh lỗi.',
    '"/preview build and check all routes locally"',
    '"/preview dựng bản xem trước và kiểm tra toàn bộ route"',
  ),
  defineSeed(
    'pr', 'engineering',
    'Runs pre-PR gates (check --strict-phase --no-stubs, reconcile REC-G1..G4) before gh pr create, plus /pr:review 3-role diff review.',
    'Chạy cổng kiểm tra trước PR (check --strict-phase --no-stubs, reconcile REC-G1..G4) kèm gh pr create và /pr:review phản biện diff 3 góc độ.',
    '"/pr open a verified pull request, or /pr:review #142"',
    '"/pr kiểm tra và tạo pull request, hoặc /pr:review #142"',
  ),
  defineSeed(
    'release', 'engineering',
    'Audits Conventional Commits since last tag, syncs version and CHANGELOG.md, runs doctor + check + test:pack, and stages gh release create.',
    'Đối chiếu Conventional Commits từ tag gần nhất, đồng bộ version & CHANGELOG.md, chạy doctor + check + test:pack và chuẩn bị gh release create.',
    '"/release prepare the next semantic version and changelog"',
    '"/release chuẩn bị phiên bản SemVer mới và cập nhật CHANGELOG.md"',
  ),

  // Research & Design (6)
  defineSeed(
    'plan', 'research-design',
    'Writes CLI-validated PLAN-* specs (PLAN-G1..G5) with SHARED_CONTRACT types, wave DAGs, and <= 4 OWNED_FILES per shard.',
    'Soạn kế hoạch PLAN-* kiểm tra qua CLI (PLAN-G1..G5) kèm kiểu SHARED_CONTRACT, thứ tự wave và tối đa 4 OWNED_FILES mỗi shard.',
    '"/plan:hard design multi-tenant RBAC waves"',
    '"/plan:hard lập kế hoạch triển khai phân quyền đa tổ chức"',
  ),
  defineSeed(
    'design', 'research-design',
    'Authors 6-Block DESIGN-* contracts (DESIGN-G1..G4) with OKLCH tokens, typography scale, 5-State Matrix, and WCAG 2.2 AA rules.',
    'Soạn đặc tả giao diện 6 khối DESIGN-* (DESIGN-G1..G4) gồm màu OKLCH, thang chữ, ma trận 5 trạng thái và chuẩn WCAG 2.2 AA.',
    '"/design:hard create the dashboard UI contract"',
    '"/design:hard thiết kế bộ token và hợp đồng giao diện cho trang dashboard"',
  ),
  defineSeed(
    'research', 'research-design',
    'Multi-hop technical research enforcing 4-Source Triangulation, contradiction checks, and CLI-validated RESEARCH-* briefs.',
    'Nghiên cứu kỹ thuật nhiều bước có đối chiếu 4 nguồn độc lập, phân tích điểm mâu thuẫn và xuất bản tóm tắt RESEARCH-* chuẩn CLI.',
    '"/research compare WebGPU and WebGL2 rendering trade-offs"',
    '"/research so sánh chi tiết ưu nhược điểm giữa WebGPU và WebGL2"',
  ),
  defineSeed(
    'brainstorm', 'research-design',
    'Explores 3+ distinct architecture options grounded in the codebase, runs pre-mortems, and scores trade-offs via MCDA.',
    'Đề xuất từ 3 phương án kiến trúc khác biệt bám sát mã nguồn, phân tích rủi ro sớm và chấm điểm lựa chọn theo MCDA.',
    '"/brainstorm evaluate 3 realtime sync architectures"',
    '"/brainstorm phân tích 3 hướng kiến trúc đồng bộ thời gian thực"',
  ),
  defineSeed(
    'architect', 'research-design',
    'Defines service boundaries, data contracts, zero-downtime expand/contract migrations, and ADR records.',
    'Xác định ranh giới dịch vụ, hợp đồng dữ liệu, lộ trình migration mở rộng và thu hẹp không gián đoạn cùng hồ sơ ADR.',
    '"/architect define event-driven service boundaries and ADRs"',
    '"/architect thiết kế ranh giới service hướng sự kiện và tài liệu ADR"',
  ),
  defineSeed(
    'ui-ux-pro-max', 'research-design',
    'UI refinement workflow focused on typographic hierarchy, contrast discipline, responsive rhythm, and clean motion.',
    'Tinh chỉnh giao diện tập trung vào phân cấp chữ, độ tương phản rõ nét, bố cục chuẩn và chuyển động mượt.',
    '"/ui-ux-pro-max refine visual hierarchy on the billing view"',
    '"/ui-ux-pro-max tinh chỉnh phân cấp thị giác cho trang thanh toán"',
  ),

  // Quality & Security (7)
  defineSeed(
    'audit', 'quality-security',
    'Multi-round post-completion project audit (.boomopen/audit-ledger.json): RTM coverage, vertical flows, security checks, and user-selected fix shards.',
    'Kiểm tra tổng thể dự án nhiều vòng sau khi code xong (.boomopen/audit-ledger.json): độ phủ RTM, luồng nghiệp vụ dọc, bảo mật và chọn mục cần sửa.',
    '"/audit run Round 1 against docs/ and list blockers"',
    '"/audit chạy vòng 1 đối chiếu tài liệu docs/ và liệt kê các điểm cần sửa"',
  ),
  defineSeed(
    'review', 'quality-security',
    'Code and architecture review (including 3-role :team mode) reporting P0-P3 defects with exact file:line proof.',
    'Review mã nguồn và kiến trúc (hỗ trợ nhóm 3 vai trò phản biện :team), phân loại lỗi P0-P3 kèm vị trí file:line cụ thể.',
    '"/review:team check auth and billing changes for P0-P2 bugs"',
    '"/review:team kiểm tra nhánh auth và thanh toán để tìm lỗi P0-P2"',
  ),
  defineSeed(
    'debug', 'quality-security',
    'Root-cause investigation (DBG-G1..G4) using minimal reproducers, call-chain tracing, and hypothesis testing before patching.',
    'Điều tra nguyên nhân gốc (DBG-G1..G4) qua kịch bản tái hiện tối giản, lần chuỗi gọi hàm và kiểm chứng giả thuyết trước khi sửa.',
    '"/debug isolate the worker queue memory leak"',
    '"/debug tìm nguyên nhân gốc gây rò rỉ bộ nhớ ở hàng đợi worker"',
  ),
  defineSeed(
    'test', 'quality-security',
    'Writes and runs unit, integration, accessibility, and E2E tests mapped to Given/When/Then criteria with zero skipped assertions.',
    'Viết và chạy kiểm thử unit, tích hợp, trợ năng và E2E bám sát tiêu chí Given/When/Then, không bỏ qua hay làm giả test.',
    '"/test add integration and edge-case tests for checkout"',
    '"/test bổ sung kiểm thử tích hợp và các ca biên cho luồng thanh toán"',
  ),
  defineSeed(
    'security-audit', 'quality-security',
    'Security review covering OWASP Top 10, auth/session boundaries, secret exposure, and LLM/MCP tool-call surfaces.',
    'Đánh giá bảo mật theo OWASP Top 10, phân quyền phiên đăng nhập, rò rỉ khóa bí mật và bề mặt gọi công cụ LLM/MCP.',
    '"/security-audit review API auth and webhook signature checks"',
    '"/security-audit kiểm tra bảo mật tầng xác thực API và chữ ký webhook"',
  ),
  defineSeed(
    'performance', 'quality-security',
    'Profiles Core Web Vitals, bundle weight, SQL query plans, and p95 latency bottlenecks with before/after numbers.',
    'Đo đạc và tối ưu Core Web Vitals, dung lượng bundle, kế hoạch thực thi SQL và độ trễ p95 kèm số liệu trước và sau.',
    '"/performance profile slow SQL queries and bundle weight"',
    '"/performance đo và tối ưu các truy vấn SQL chậm cùng kích thước bundle"',
  ),
  defineSeed(
    'deep-audit', 'quality-security',
    'Parallel read-only repository scan checking architecture alignment, dead code, security posture, docs parity, and test gaps.',
    'Quét toàn bộ kho mã ở chế độ chỉ đọc bằng nhiều shard song song để rà soát kiến trúc, mã thừa, bảo mật, tài liệu và độ phủ test.',
    '"/deep-audit inspect code, docs, and test coverage across the repo"',
    '"/deep-audit rà soát toàn diện mã nguồn, tài liệu và độ phủ test của repo"',
  ),

  // Session & Ops (7)
  defineSeed(
    'onboard', 'session-ops',
    '60-second read-only repo onboarding: 3 parallel scouters map stack, entrypoints, data flow, hotspots, and build/test commands into ARCHITECTURE-MAP.md.',
    'Làm quen nhanh codebase có sẵn trong 60 giây (chỉ đọc): 3 scouter chạy song song lập ARCHITECTURE-MAP.md gồm cấu trúc, luồng dữ liệu và lệnh build/test.',
    '"/onboard map entrypoints, data flow, and test commands"',
    '"/onboard tóm tắt cấu trúc, entrypoint, luồng dữ liệu và lệnh test của repo"',
  ),
  defineSeed(
    'docs', 'session-ops',
    'Writes source-verified repository docs across technical specs (:core), domain guides (:business), and drift checks (:audit).',
    'Biên soạn tài liệu đối chiếu trực tiếp từ mã nguồn gồm đặc tả kỹ thuật (:core), hướng dẫn nghiệp vụ (:business) và rà lệch (:audit).',
    '"/docs:core update architecture and CLI reference docs"',
    '"/docs:core cập nhật tài liệu kiến trúc và hướng dẫn CLI"',
  ),
  defineSeed(
    'report', 'session-ops',
    'Compiles delivery summaries, verification metrics, and risk tables grounded in git log and test output.',
    'Tổng hợp báo cáo tiến độ, kết quả kiểm thử và bảng rủi ro dựa trực tiếp trên lịch sử Git và log chạy CLI.',
    '"/report summarize sprint changes and test results"',
    '"/report tổng hợp các thay đổi trong sprint và kết quả chạy test"',
  ),
  defineSeed(
    'ask', 'session-ops',
    'Read-only parallel codebase Q&A returning symbol-level file:line references without touching the working tree.',
    'Hỏi đáp nhanh trên codebase ở chế độ chỉ đọc, trả về trích dẫn file:line chính xác và giữ nguyên cây thư mục Git.',
    '"/ask how does token refresh rotation work in auth middleware?"',
    '"/ask cơ chế xoay vòng refresh token trong middleware hoạt động thế nào?"',
  ),
  defineSeed(
    'save', 'session-ops',
    'Saves session decisions, active shard IDs, and pending tasks to an artifact so work resumes cleanly later.',
    'Lưu lại các quyết định kỹ thuật, danh sách shard và đầu việc đang dở để phiên sau tiếp tục ngay không mất ngữ cảnh.',
    '"/save checkpoint current progress and open tasks"',
    '"/save lưu lại tiến độ hiện tại và các mục còn đang làm"',
  ),
  defineSeed(
    'recap', 'session-ops',
    'Summarizes prior checkpoints, recent commits, and remaining ledger items at the start of a new session.',
    'Tóm tắt nhanh bản lưu phiên trước, các commit gần nhất và hạng mục còn lại trong ledger để bắt đầu làm tiếp.',
    '"/recap show where we left off"',
    '"/recap tóm tắt lại công việc phiên trước đang dừng ở đâu"',
  ),
  defineSeed(
    'status', 'session-ops',
    'Prints active preset settings, ledger phase cursor, modified files, and verification status in one compact summary.',
    'Hiển thị gọn preset đang bật, tiến độ phase trong ledger, danh sách file thay đổi và trạng thái kiểm tra.',
    '"/status show active preset and ledger progress"',
    '"/status xem cấu hình preset và tiến độ ledger hiện tại"',
  ),
]

const variantsByCommandName = new Map<string, readonly string[]>(
  KIT_STATS.commands.map((command) => [command.name, command.variants]),
)

const seededCommandNames = new Set(COMMAND_SEEDS.map((seed) => seed.name))

const fallbackSeeds: readonly CommandSeed[] = KIT_STATS.commands
  .filter((command) => !seededCommandNames.has(command.name))
  .map((command) =>
    defineSeed(
      command.name, 'engineering',
      command.description, command.description,
      `"Run /${command.name}"`, `"Chạy lệnh /${command.name}"`,
    ),
  )

export const COMMANDS_CATALOG: readonly CommandCatalogItem[] = [...COMMAND_SEEDS, ...fallbackSeeds]
  .filter((seed) => variantsByCommandName.has(seed.name))
  .map((seed) => {
    const variants = variantsByCommandName.get(seed.name) ?? []
    return {
      name: seed.name,
      slash: `/${seed.name}`,
      variants,
      category: seed.category,
      hasTeamVariant: variants.includes('team'),
      summary: seed.summary,
      nlExamples: seed.nlExamples,
    }
  })
