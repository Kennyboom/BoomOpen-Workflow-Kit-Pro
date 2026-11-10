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
    'Autonomous multi-session, multi-phase project execution governed by .boomopen/project-ledger.json, SHA-256 spec locks, and 100% RTM gates.',
    'Điều hành dự án đa phiên, nhiều phase tự hành qua .boomopen/project-ledger.json, khóa SHA-256 chống lệch đặc tả và cổng truy vết RTM 100%.',
    '"Run the next phase from our architecture spec on autopilot"',
    '"Đọc tài liệu kiến trúc và điều hành dự án chạy tiếp phase tiếp theo"',
  ),
  defineSeed(
    'conduct', 'orchestration',
    'Multi-engine council consensus and cross-platform CLI pipeline across Claude Code, OpenAI Codex, and Antigravity with Author != Critic review.',
    'Hội đồng đa mô hình và pipeline liên nền tảng giữa Claude Code, OpenAI Codex và Antigravity với cơ chế phản biện chéo Author != Critic.',
    '"Run a multi-engine council across Claude, Codex, and Gemini"',
    '"Cho hội đồng đa mô hình Claude + Codex + Gemini cùng phân tích rồi tổng hợp"',
  ),
  defineSeed(
    'orchestrate', 'orchestration',
    'Elastic swarm coordinator that decomposes cross-domain missions into parallel role#shard subagents with disjoint OWNED_FILES locks.',
    'Bộ điều phối đàn agent co giãn, tách nhiệm vụ liên miền thành các subagent role#shard song song với khóa ghi OWNED_FILES tách biệt.',
    '"Coordinate database, backend, and frontend shards in parallel"',
    '"Điều phối đội agent làm song song cả database, backend và frontend"',
  ),
  defineSeed(
    'auto', 'orchestration',
    'Smart-hybrid intent router that classifies an open prompt and dispatches the optimal Mode A micro-edit or Mode B multi-agent workflow.',
    'Bộ định tuyến thông minh tự phân loại yêu cầu tự nhiên và kích hoạt Mode A trực tiếp hoặc quy trình đa tác tử Mode B tối ưu.',
    '"Automatically pick the right workflow and execute this task"',
    '"Tự động chọn quy trình phù hợp nhất để xử lý yêu cầu này"',
  ),
  defineSeed(
    'next', 'orchestration',
    'Inspects current workspace artifacts, ledger state, and pending waves to recommend and launch the highest-leverage next step.',
    'Phân tích các artifact hiện có, trạng thái ledger và wave đang chờ để đề xuất kiêm kích hoạt bước tiếp theo hiệu quả nhất.',
    '"What is the next step in our current workflow?"',
    '"Bước tiếp theo cần làm trong dự án hiện tại là gì?"',
  ),
  defineSeed(
    'settings', 'orchestration',
    'Interactive configuration manager for presets, execution modes, parallel swarm caps, and < 10ms AOT synchronization across entrypoints.',
    'Trình quản lý cài đặt trực quan cho preset, chế độ thực thi, giới hạn subagent song song và đồng bộ AOT < 10ms vào mọi entrypoint.',
    '"Open kit settings and switch preset to strict-team"',
    '"Mở cài đặt bộ kit và chuyển preset sang strict-team"',
  ),

  // Engineering (8)
  defineSeed(
    'cook', 'engineering',
    'End-to-end feature builder when no plan exists yet: runs scouting, contract lock, parallel wave coding, and strict E2E verification.',
    'Xây dựng tính năng trọn gói từ đầu khi chưa có kế hoạch: khảo sát mã nguồn, khóa hợp đồng, code song song theo wave và kiểm thử E2E.',
    '"Build a full passkey authentication feature end-to-end"',
    '"Xây dựng trọn gói tính năng đăng nhập bằng Passkey từ đầu đến cuối"',
  ),
  defineSeed(
    'code', 'engineering',
    'Approved-Plan 3-Wave Contract-First Execution Router: dispatches an approved PLAN-* directly to domain shards without re-running /plan.',
    'Bộ định tuyến thực thi Kế hoạch đã duyệt theo 3 Wave Contract-First: giao thẳng PLAN-* cho các shard chuyên trách mà không chạy lại /plan.',
    '"Proceed, execute the approved plan right now"',
    '"Ok em tiến hành làm theo bản kế hoạch đã duyệt đi"',
  ),
  defineSeed(
    'fix', 'engineering',
    'Multi-file defect resolution workflow combining root-cause isolation, regression test locking, surgical patching, and full build verification.',
    'Quy trình sửa lỗi đa tệp kết hợp khoanh vùng nguyên nhân gốc, khóa bài test chống hồi quy, vá lỗi chính xác và chạy kiểm chứng toàn cục.',
    '"Fix the race condition breaking webhook retries across services"',
    '"Sửa dứt điểm lỗi race condition khi retry webhook giữa các service"',
  ),
  defineSeed(
    'refactor', 'engineering',
    'Behavior-preserving structural refactoring enforcing Pragmatic 2-Tier cohesion, clean module boundaries, and zero test regressions.',
    'Tái cấu trúc mã nguồn giữ nguyên hành vi, đảm bảo chuẩn 2 Tầng Thực dụng, ranh giới module sạch sẽ và không làm gãy bất kỳ bài test nào.',
    '"Refactor this 700-line controller into cohesive domain modules"',
    '"Tách file controller 700 dòng này thành các module đúng chuẩn đơn trách nhiệm"',
  ),
  defineSeed(
    'deploy', 'engineering',
    'Release readiness, preview staging, production rollout, and post-deploy smoke verification across check, preview, production, and rollback variants.',
    'Kiểm tra sẵn sàng phát hành, dựng bản preview, triển khai production và kiểm tra hậu kỳ với đủ biến thể check, preview, production, rollback.',
    '"Run pre-deployment checks and prepare production release"',
    '"Kiểm tra toàn bộ điều kiện trước khi deploy bản production"',
  ),
  defineSeed(
    'rollback', 'engineering',
    'Rapid incident containment workflow that safely reverts faulty deployments, validates schema compatibility, and restores service health.',
    'Quy trình ứng cứu sự cố khẩn cấp giúp hoàn tác bản triển khai lỗi an toàn, kiểm tra tương thích schema và khôi phục trạng thái hệ thống.',
    '"Roll back the latest release safely and verify health checks"',
    '"Hoàn tác bản release vừa rồi một cách an toàn và kiểm tra lại health check"',
  ),
  defineSeed(
    'init', 'engineering',
    'Bootstraps workspace conventions, .boomopen.json project rules, TypeScript/linter baselines, and architecture scaffolding for new repos.',
    'Khởi tạo chuẩn dự án, cấu hình .boomopen.json, nền tảng TypeScript/linter và khung kiến trúc chuẩn cho kho mã mới.',
    '"Initialize BoomOpen workspace standards in this repository"',
    '"Khởi tạo cấu hình chuẩn BoomOpen cho dự án mới này"',
  ),
  defineSeed(
    'preview', 'engineering',
    'Launches, inspects, and verifies local or ephemeral preview environments with automated port health and UI smoke checks.',
    'Khởi chạy và kiểm tra môi trường xem trước cục bộ hoặc tạm thời kèm bước xác thực cổng dịch vụ và giao diện trực quan.',
    '"Start a clean preview build and verify all routes render"',
    '"Chạy bản preview và kiểm tra tất cả các trang hiển thị chuẩn"',
  ),

  // Research & Design (6)
  defineSeed(
    'plan', 'research-design',
    'Authors CLI-validated PLAN-* blueprints (PLAN-G1..G5) with SHARED_CONTRACT schemas, wave DAGs, and <= 4 OWNED_FILES per executor shard.',
    'Lập bản thiết kế thực thi PLAN-* đạt chuẩn CLI (PLAN-G1..G5) kèm hợp đồng SHARED_CONTRACT, đồ thị Wave và khóa <= 4 OWNED_FILES mỗi shard.',
    '"Create a detailed implementation plan for multi-tenant RBAC"',
    '"Lên kế hoạch triển khai chi tiết cho hệ thống phân quyền đa tổ chức"',
  ),
  defineSeed(
    'design', 'research-design',
    'Produces 6-Block DESIGN-* specifications (DESIGN-G1..G4) with OKLCH color tokens, 3-axis typography, 5-State UI Matrix, and WCAG 2.2 AA.',
    'Thiết kế bản đặc tả giao diện 6 khối DESIGN-* (DESIGN-G1..G4) với bảng màu OKLCH, chữ 3 trục, ma trận 5 trạng thái và chuẩn WCAG 2.2 AA.',
    '"Design the UI/UX specification and token contract for our dashboard"',
    '"Thiết kế giao diện UI/UX và bộ token chuẩn cho trang dashboard"',
  ),
  defineSeed(
    'research', 'research-design',
    'Autonomous multi-hop deep research engine enforcing 4-Source Triangulation, Contradiction Arbitration, and CLI-validated RESEARCH-* briefs.',
    'Bộ máy nghiên cứu chuyên sâu đa tầng áp dụng Đối chiếu 4 nguồn, Phân xử mâu thuẫn và xuất báo cáo RESEARCH-* đạt chuẩn CLI.',
    '"Deep dive and compare WebGPU vs WebGL2 rendering pipelines"',
    '"Nghiên cứu chuyên sâu và so sánh kiến trúc đồ họa WebGPU với WebGL2"',
  ),
  defineSeed(
    'brainstorm', 'research-design',
    'Adversarial ideation protocol with codebase grounding, orthogonal architecture options, Devil’s Advocate pre-mortems, and MCDA scoring.',
    'Giao thức khám phá ý tưởng đối kháng bám sát mã nguồn, tạo phương án trực giao, phản biện Devil’s Advocate và chấm điểm đa tiêu chí MCDA.',
    '"Brainstorm 3 distinct realtime sync architectures with trade-offs"',
    '"Khám phá 3 hướng kiến trúc đồng bộ thời gian thực và phân tích đánh đổi"',
  ),
  defineSeed(
    'architect', 'research-design',
    'System architecture synthesizer defining service boundaries, data schemas, expand/contract migrations, and ADR decision records.',
    'Chuyên gia thiết kế kiến trúc hệ thống xác lập ranh giới dịch vụ, lược đồ dữ liệu, chiến lược di trú không gián đoạn và hồ sơ quyết định ADR.',
    '"Design the event-driven domain architecture and ADR records"',
    '"Thiết kế kiến trúc hướng sự kiện và lập hồ sơ quyết định kỹ thuật ADR"',
  ),
  defineSeed(
    'ui-ux-pro-max', 'research-design',
    'High-craft visual polish and anti-AI-slop design elevation workflow pairing bespoke typography, tactile surfaces, and spring motion.',
    'Quy trình nâng tầm thẩm mỹ giao diện cao cấp chống rập khuôn AI, kết hợp nghệ thuật chữ, chiều sâu bề mặt và chuyển động vật lý mượt mà.',
    '"Elevate this landing page with flagship editorial visual craft"',
    '"Nâng cấp giao diện trang chủ lên đẳng cấp thiết kế flagship sắc nét"',
  ),

  // Quality & Security (6)
  defineSeed(
    'review', 'quality-security',
    'Evidence-backed code and repository audit (including Golden Diamond :team) classifying defects by severity with exact file:line proof.',
    'Kiểm định mã nguồn và kho mã dựa trên bằng chứng thực tế (hỗ trợ Golden Diamond :team), phân loại mức độ nghiêm trọng kèm tọa độ file:line.',
    '"Review our pull request for architecture, type, and edge-case bugs"',
    '"Review toàn bộ nhánh code này để tìm lỗi tiềm ẩn và điểm nghẽn kiến trúc"',
  ),
  defineSeed(
    'debug', 'quality-security',
    'Scientific root-cause investigation (DBG-G1..G4) using reproduction harnesses, call-chain tracing, and hypothesis elimination before patching.',
    'Điều tra nguyên nhân gốc rễ theo phương pháp khoa học (DBG-G1..G4): dựng kịch bản tái hiện, lần vết chuỗi gọi hàm và loại trừ giả thuyết.',
    '"Find the exact root cause of the memory leak in worker queues"',
    '"Tìm chính xác nguyên nhân gốc gây rò rỉ bộ nhớ ở hàng đợi worker"',
  ),
  defineSeed(
    'test', 'quality-security',
    'Author and execute unit, integration, accessibility, and E2E suites mapped to Given/When/Then criteria with zero test gaming.',
    'Viết và thực thi bộ kiểm thử unit, tích hợp, trợ năng và E2E bám sát tiêu chí Given/When/Then, tuyệt đối không gian lận bỏ qua test.',
    '"Write comprehensive integration and edge-case tests for billing"',
    '"Viết bộ kiểm thử tích hợp và các ca biên toàn diện cho phân hệ thanh toán"',
  ),
  defineSeed(
    'security-audit', 'quality-security',
    'DevSecOps vulnerability assessment covering OWASP Top 10, OAuth/session boundaries, secret exposure, and AI prompt-injection surfaces.',
    'Đánh giá bảo mật chuyên sâu DevSecOps bao phủ OWASP Top 10, xác thực phiên, rò rỉ khóa bí mật và bề mặt tấn công prompt injection.',
    '"Perform a full OWASP security audit across API and auth routes"',
    '"Kiểm toán bảo mật toàn diện theo chuẩn OWASP cho tầng API và đăng nhập"',
  ),
  defineSeed(
    'performance', 'quality-security',
    'Profiles Core Web Vitals, bundle weight, SQL query plans, and event-loop bottlenecks with measurable before/after benchmarks.',
    'Đo đạc và tối ưu Core Web Vitals, dung lượng gói tải, truy vấn SQL và điểm nghẽn xử lý kèm số liệu đối chiếu trước/sau rõ ràng.',
    '"Profile and optimize slow SQL queries and frontend bundle size"',
    '"Đo lường và tối ưu các câu truy vấn SQL chậm cùng dung lượng gói frontend"',
  ),
  defineSeed(
    'deep-audit', 'quality-security',
    'Full-repository multi-shard forensic audit inspecting architecture parity, dead code, security posture, documentation, and test coverage.',
    'Tổng kiểm tra toàn diện kho mã bằng nhiều shard song song: đối chiếu kiến trúc, mã thừa, bảo mật, tài liệu và độ phủ kiểm thử.',
    '"Run a full-repo forensic audit across code, docs, and tests"',
    '"Thực hiện tổng kiểm tra chuyên sâu toàn bộ mã nguồn, tài liệu và bài test"',
  ),

  // Session & Ops (6)
  defineSeed(
    'docs', 'session-ops',
    'Generates synchronized workspace documentation across core technical specs (:core), business domain guides (:business), and drift audits (:audit).',
    'Biên soạn hệ thống tài liệu đồng bộ gồm đặc tả kỹ thuật (:core), nghiệp vụ sản phẩm (:business) và kiểm toán độ lệch tài liệu (:audit).',
    '"Generate core architecture and API reference documentation"',
    '"Viết bộ tài liệu kiến trúc cốt lõi và đặc tả API cho dự án"',
  ),
  defineSeed(
    'report', 'session-ops',
    'Compiles executive engineering status reports, release changelogs, verification metrics, and risk matrices from live repository state.',
    'Tổng hợp báo cáo tiến độ kỹ thuật, nhật ký phát hành, chỉ số kiểm chứng và ma trận rủi ro trực tiếp từ trạng thái kho mã.',
    '"Generate a comprehensive sprint delivery and verification report"',
    '"Tạo báo cáo tổng kết tiến độ bàn giao và kết quả kiểm thử của sprint"',
  ),
  defineSeed(
    'ask', 'session-ops',
    'Fast parallel read-only codebase Q&A fan-out that answers architectural questions with exact symbol links while keeping git clean.',
    'Hỏi đáp mã nguồn chỉ đọc bằng subagent song song, giải đáp chính xác kiến trúc kèm liên kết tệp mà không làm bẩn cây Git.',
    '"How does token refresh rotation work across our auth middleware?"',
    '"Cơ chế xoay vòng refresh token trong tầng middleware hoạt động thế nào?"',
  ),
  defineSeed(
    'save', 'session-ops',
    'Persists structured session context, architectural decisions, active shard IDs, and pending tasks so work resumes with zero context loss.',
    'Lưu trữ ngữ cảnh phiên làm việc, các quyết định kiến trúc, danh sách shard và đầu việc dở dang để nối lại liền mạch không mất ngữ cảnh.',
    '"Save our current session progress and architectural context"',
    '"Lưu lại tiến độ phiên làm việc và các quyết định kỹ thuật hiện tại"',
  ),
  defineSeed(
    'recap', 'session-ops',
    'Reconstructs session state from saved checkpoints, git history, and brain artifacts into a crisp briefing before continuing work.',
    'Khôi phục và tóm tắt nhanh bối cảnh dự án từ bản lưu trước, lịch sử Git và artifact để bắt nhịp công việc tức thì.',
    '"Recap where we left off and what waves remain pending"',
    '"Tóm tắt lại tiến độ phiên trước và những hạng mục còn đang chờ"',
  ),
  defineSeed(
    'status', 'session-ops',
    'Displays live repository health, active ledger phase, uncommitted file ownership, and active BoomOpen preset settings at a glance.',
    'Hiển thị nhanh sức khỏe kho mã, phase hiện hành trong ledger, danh sách tệp đang sửa và cấu hình preset BoomOpen đang bật.',
    '"Show current project workflow and ledger status"',
    '"Kiểm tra trạng thái workflow và tiến độ ledger hiện tại của dự án"',
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
