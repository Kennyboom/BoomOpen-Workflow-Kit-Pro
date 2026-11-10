import type { BilingualText, SkillShowcaseItem } from '../types/ui-contract'

export const SKILL_DOMAIN_LABELS: Record<string, { readonly en: string; readonly vi: string }> = {
  backend: { en: 'Backend Development', vi: 'Phát triển Backend & API' },
  frontend: { en: 'Frontend Development', vi: 'Phát triển Giao diện Web' },
  architecture: { en: 'System Architecture', vi: 'Kiến trúc Hệ thống' },
  quality: { en: 'Quality Assurance', vi: 'Kiểm thử & Chất lượng' },
  security: { en: 'Security Engineering', vi: 'Kỹ thuật Bảo mật' },
  design: { en: 'UI/UX Design', vi: 'Thiết kế Giao diện & Trải nghiệm' },
  planning: { en: 'Planning & Analysis', vi: 'Lập kế hoạch & Phân tích' },
  devops: { en: 'DevOps & Deployment', vi: 'DevOps & Triển khai' },
  data: { en: 'Data & Database', vi: 'Dữ liệu & Cơ sở Dữ liệu' },
  performance: { en: 'Performance Engineering', vi: 'Tối ưu Hiệu năng' },
  research: { en: 'Research & Documentation', vi: 'Nghiên cứu & Tài liệu' },
  mobile: { en: 'Mobile Development', vi: 'Phát triển Di động' },
  gaming: { en: 'Game Development', vi: 'Phát triển Game & Đồ họa' },
  management: { en: 'Project Management', vi: 'Quản trị Dự án & Sản phẩm' },
  ai_ml: { en: 'AI/ML Engineering', vi: 'Trí tuệ Nhân tạo & Học máy' },
  cloud: { en: 'Cloud & Infrastructure', vi: 'Điện toán Đám mây & Hạ tầng' },
  languages: { en: 'Programming Languages', vi: 'Ngôn ngữ Lập trình' },
  tools: { en: 'Tools & Utilities', vi: 'Công cụ & Tự động hóa' },
  mcp: { en: 'MCP & Agents', vi: 'Giao thức MCP & Tác tử AI' },
}

export const CORE_SKILLS_SHOWCASE: readonly SkillShowcaseItem[] = [
  {
    id: 'api-patterns',
    domainId: 'backend',
    tier: 'core',
    summary: {
      en: 'Contract-first REST, GraphQL & Hono RPC design with Zod/OpenAPI schemas, RFC 9457 errors, and api_validator.py gates.',
      vi: 'Thiết kế REST, GraphQL & Hono RPC theo hợp đồng trước với schema Zod/OpenAPI, chuẩn lỗi RFC 9457 và cổng kiểm tra tự động.',
    },
  },
  {
    id: 'app-builder',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: 'Full-stack application orchestrator using 3-Wave Contract-First sharding, DESIGN_CONTRACT tokens, and CLI verification.',
      vi: 'Trình điều phối xây dựng ứng dụng toàn diện theo 3 đợt song song, khóa DESIGN_CONTRACT và kiểm chứng CLI tự động.',
    },
  },
  {
    id: 'behavioral-modes',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: 'Adaptive operational stances across brainstorm, implement, debug, review, ship, and multi-agent swarm orchestration.',
      vi: 'Chuyển đổi linh hoạt chế độ vận hành giữa khám phá ý tưởng, lập trình, gỡ lỗi, phản biện, phát hành và điều phối đàn tác tử.',
    },
  },
  {
    id: 'brainstorming',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: 'Autonomous codebase grounding, orthogonal option generation, Devil’s Advocate pre-mortems, and 6-Block BRAINSTORM specs.',
      vi: 'Tự động khảo sát codebase, tạo phương án độc lập, phản biện điểm mù sớm và xuất bản thiết kế BRAINSTORM 6 khối chuẩn CLI.',
    },
  },
  {
    id: 'clean-code',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: 'Pragmatic 2-Tier coding standards: zero explicit any, structured error handling, and cohesive 200–400 line modules.',
      vi: 'Quy chuẩn code thực dụng 2 tầng: cấm kiểu any tường minh, xử lý lỗi chặt chẽ và giữ module gắn kết 200–400 dòng.',
    },
  },
  {
    id: 'database-design',
    domainId: 'data',
    tier: 'core',
    summary: {
      en: 'Wave 1 schema locking, expand-contract zero-downtime migrations, indexing strategy, and Drizzle/Prisma/Postgres patterns.',
      vi: 'Khóa schema ngay đợt 1, migration mở rộng–thu hẹp không dừng hệ thống, chiến lược chỉ mục và mẫu chuẩn Drizzle/Prisma/Postgres.',
    },
  },
  {
    id: 'debugger',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'Systematic SPIE v3.0 debugging with 5-Whys causal chains, minimal reproducers, and regression-locked root-cause fixes.',
      vi: 'Quy trình gỡ lỗi hệ thống SPIE v3.0 với chuỗi nhân quả 5-Whys, kịch bản tái hiện tối giản và bản vá triệt để gốc rễ.',
    },
  },
  {
    id: 'deep-research',
    domainId: 'research',
    tier: 'core',
    summary: {
      en: '3-Wave multi-hop search engine with 4-Source triangulation, contradiction arbitration, and CLI-validated RESEARCH briefs.',
      vi: 'Động cơ nghiên cứu sâu 3 đợt với đối chiếu chéo 4 nguồn, phân xử mâu thuẫn và bản tóm tắt bàn giao được kiểm định bằng CLI.',
    },
  },
  {
    id: 'design-spec',
    domainId: 'design',
    tier: 'core',
    summary: {
      en: 'Machine-verifiable 6-Block DESIGN-{task}.md contract with OKLCH tokens, surface elevation ladders, and 5-State matrices.',
      vi: 'Hợp đồng thiết kế DESIGN-{task}.md 6 khối kiểm chứng tự động bằng máy với hệ màu OKLCH, thang độ nổi và ma trận 5 trạng thái.',
    },
  },
  {
    id: 'frontend-architecture',
    domainId: 'frontend',
    tier: 'core',
    summary: {
      en: 'Clean UI/logic/data/type separation, state-tier boundaries, schema-validated API clients, and React/Next/Vue structure.',
      vi: 'Phân tách rạch ròi giao diện/nghiệp vụ/dữ liệu/kiểu, phân tầng trạng thái và cấu trúc chuẩn mực cho React/Next/Vue.',
    },
  },
  {
    id: 'frontend-design',
    domainId: 'frontend',
    tier: 'core',
    summary: {
      en: '2026 visual craft with OKLCH color architecture, 3-axis typography, spring motion physics, and WCAG 2.2 AA ergonomics.',
      vi: 'Mỹ thuật giao diện hiện đại với kiến trúc màu OKLCH, hệ chữ 3 trục, chuyển động vật lý tự nhiên và chuẩn tiếp cận WCAG 2.2 AA.',
    },
  },
  {
    id: 'game-developer',
    domainId: 'gaming',
    tier: 'core',
    summary: {
      en: 'Real-time ECS architecture, Unity 6/Unreal 5/Godot 4/WebGPU pipelines, physics determinism, and frame-budget profiling.',
      vi: 'Kiến trúc ECS thời gian thực, đường ống đồ họa Unity 6/Unreal 5/Godot 4/WebGPU, vật lý tất định và tối ưu ngân sách khung hình.',
    },
  },
  {
    id: 'intelligent-routing',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: '17-language natural-language intent classifier routing tasks into Mode A direct execution or 4-Tier elastic sub-agent swarms.',
      vi: 'Bộ phân loại ý định đa ngôn ngữ (17 thứ tiếng) tự động định tuyến tác vụ vào Mode A trực tiếp hoặc đàn sub-agent co giãn 4 tầng.',
    },
  },
  {
    id: 'mobile-design',
    domainId: 'design',
    tier: 'core',
    summary: {
      en: 'iOS 18 HIG & Android Material 3 Expressive design system rules with 44pt/48dp touch targets and safe-area geometry.',
      vi: 'Hệ quy tắc thiết kế di động chuẩn iOS 18 HIG & Material 3 Expressive với kích thước điểm chạm chuẩn và vùng hiển thị an toàn.',
    },
  },
  {
    id: 'mobile-developer',
    domainId: 'mobile',
    tier: 'core',
    summary: {
      en: 'Production React Native, Flutter, and Tauri v2 mobile engineering with offline-first sync and native platform bridges.',
      vi: 'Kỹ thuật xây dựng ứng dụng React Native, Flutter và Tauri v2 thực chiến với đồng bộ ngoại tuyến và cầu nối gốc mượt mà.',
    },
  },
  {
    id: 'plan-writing',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: '5-Gate validated PLAN-{task}.md authoring with compilable SHARED_CONTRACT blocks and <= 4 OWNED_FILES shard locks.',
      vi: 'Biên soạn kế hoạch PLAN-{task}.md vượt 5 cổng kiểm định với khối SHARED_CONTRACT biên dịch được và khóa tối đa 4 file mỗi phân mảnh.',
    },
  },
  {
    id: 'security-auditor',
    domainId: 'security',
    tier: 'core',
    summary: {
      en: 'DevSecOps & OWASP Top 10 auditing covering OAuth 2.1/Better Auth, secret scanning, and AI/LLM agent boundary defenses.',
      vi: 'Kiểm toán bảo mật DevSecOps & OWASP Top 10 bao quát OAuth 2.1/Better Auth, quét lộ bí mật và phòng vệ ranh giới tác tử AI.',
    },
  },
  {
    id: 'seo-fundamentals',
    domainId: 'research',
    tier: 'core',
    summary: {
      en: 'Technical SEO, Core Web Vitals (LCP/INP/CLS), JSON-LD structured graphs, canonical hygiene, and AI crawler llms.txt readiness.',
      vi: 'Tối ưu SEO kỹ thuật, chỉ số Core Web Vitals, dữ liệu có cấu trúc JSON-LD, chuẩn canonical và tệp llms.txt cho công cụ AI.',
    },
  },
  {
    id: 'skill-seeker',
    domainId: 'tools',
    tier: 'core',
    summary: {
      en: 'Zero-bloat O(1) resolver indexing all 1,462 skills in matrix-skills/compact-index.json for instant on-demand loading.',
      vi: 'Bộ tra cứu O(1) không gây phình ngữ cảnh, lập chỉ mục toàn bộ 1.462 kỹ năng trong compact-index.json để nạp tức thì khi cần.',
    },
  },
  {
    id: 'tdd-workflow',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'Strict RED-GREEN-REFACTOR discipline mapping Given/When/Then criteria to locked regression suites with zero test gaming.',
      vi: 'Kỷ luật RED-GREEN-REFACTOR nghiêm ngặt ánh xạ tiêu chí Given/When/Then vào bộ test khóa chống hồi quy và cấm gian lận test.',
    },
  },
  {
    id: 'testing-patterns',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'Unit & integration architecture with Vitest, MSW v2 network boundary mocking, deterministic fixtures, and a11y checks.',
      vi: 'Kiến trúc kiểm thử đơn vị & tích hợp với Vitest, giả lập tầng mạng bằng MSW v2, dữ liệu mẫu tất định và kiểm tra tiếp cận.',
    },
  },
  {
    id: 'webapp-testing',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'End-to-end Playwright browser automation, visual/console error capture, and multi-route WCAG 2.2 verification.',
      vi: 'Tự động hóa trình duyệt đầu–cuối với Playwright, bắt lỗi giao diện/console và kiểm định chuẩn tiếp cận WCAG 2.2 đa trang.',
    },
  },
]

export const FEATURED_LIBRARY_SKILLS: readonly SkillShowcaseItem[] = [
  { id: 'hono-rpc-zod-openapi', domainId: 'backend', tier: 'library', summary: { en: 'End-to-end type-safe Hono RPC routes with Zod OpenAPI generation on Workers and Node.', vi: 'Xây dựng định tuyến Hono RPC an toàn kiểu đầu–cuối kèm sinh đặc tả Zod OpenAPI tự động.' } },
  { id: 'react-19-nextjs-15-rsc', domainId: 'frontend', tier: 'library', summary: { en: 'React 19 Server Actions, Next.js 15 App Router streaming, and optimistic UI patterns.', vi: 'Mẫu chuẩn React 19 Server Actions, truyền tải luồng Next.js 15 App Router và cập nhật giao diện tức thì.' } },
  { id: 'senior-architect', domainId: 'architecture', tier: 'library', summary: { en: 'C4 system modeling, modular monolith vs distributed trade-offs, and ADR governance.', vi: 'Mô hình hóa hệ thống C4, phân tích đánh đổi kiến trúc nguyên khối mô-đun và quản trị quyết định ADR.' } },
  { id: 'vitest-msw-testing-patterns', domainId: 'quality', tier: 'library', summary: { en: 'Fast hermetic test suites using Vitest workspaces and MSW v2 HTTP/GraphQL interceptors.', vi: 'Bộ kiểm thử cô lập tốc độ cao dùng Vitest kết hợp chặn bắt tầng mạng HTTP/GraphQL bằng MSW v2.' } },
  { id: 'owasp-llm-agent-security-2025', domainId: 'security', tier: 'library', summary: { en: 'Defenses against indirect prompt injection, tool-call privilege escalation, and MCP SSRF.', vi: 'Phòng thủ chống tiêm lệnh gián tiếp, leo thang đặc quyền khi gọi công cụ và lỗi SSRF trên MCP.' } },
  { id: 'better-auth-typescript', domainId: 'security', tier: 'library', summary: { en: 'Type-safe session, passkey, OAuth 2.1, and multi-tenant organization auth with Better Auth.', vi: 'Xác thực phiên, passkey, OAuth 2.1 và phân quyền tổ chức đa thuê bao an toàn kiểu với Better Auth.' } },
  { id: 'anti-ai-slop-visual-craft', domainId: 'design', tier: 'library', summary: { en: 'Eliminates generic AI clichés in favor of intentional editorial grids, contrast, and craft.', vi: 'Loại bỏ lối mòn giao diện rập khuôn, kiến tạo bố cục sắc sảo, độ tương phản chuẩn và thẩm mỹ cao.' } },
  { id: 'figma-mcp-dtcg-design-tokens', domainId: 'design', tier: 'library', summary: { en: 'W3C DTCG design-token pipelines bridging Figma variables directly into CSS @theme code.', vi: 'Đường ống đồng bộ biến thiết kế chuẩn W3C DTCG từ Figma thẳng sang mã nguồn CSS @theme.' } },
  { id: 'sequential-thinking', domainId: 'planning', tier: 'library', summary: { en: 'Structured multi-step decomposition with hypothesis revision and dependency verification.', vi: 'Phân rã bài toán phức tạp theo từng bước có kiểm chứng phụ thuộc và hiệu chỉnh giả thuyết.' } },
  { id: 'terraform-opentofu-production', domainId: 'devops', tier: 'library', summary: { en: 'State-locked OpenTofu/Terraform modules, drift detection, and policy-gated plan pipelines.', vi: 'Thiết kế mô-đun OpenTofu/Terraform khóa trạng thái an toàn, phát hiện lệch cấu hình và kiểm duyệt tự động.' } },
  { id: 'drizzle-neon-turso-edge', domainId: 'data', tier: 'library', summary: { en: 'Edge-ready Drizzle ORM schemas, prepared queries, and branching migrations for Neon & Turso.', vi: 'Thiết kế schema Drizzle ORM tối ưu cho biên mạng, truy vấn biên dịch sẵn và migration phân nhánh trên Neon & Turso.' } },
  { id: 'supabase-rls-edge-realtime', domainId: 'data', tier: 'library', summary: { en: 'Zero-trust Postgres Row-Level Security policies, Edge Functions, and Realtime channels.', vi: 'Chính sách bảo mật cấp dòng Postgres RLS chặt chẽ, hàm biên mạng và kênh đồng bộ thời gian thực.' } },
  { id: 'performance-profiling', domainId: 'performance', tier: 'library', summary: { en: 'CPU flamegraphs, heap snapshot diffing, Lighthouse CWV audits, and SQL query tuning.', vi: 'Phân tích biểu đồ nhiệt CPU, đối chiếu bộ nhớ heap, kiểm toán Lighthouse và tối ưu truy vấn SQL.' } },
  { id: 'docs-seeker', domainId: 'research', tier: 'library', summary: { en: 'Version-pinned official SDK documentation retrieval and llms.txt specification lookup.', vi: 'Truy xuất tài liệu chính thức khớp đúng phiên bản thư viện và khai thác chuẩn llms.txt nhanh chóng.' } },
  { id: 'tauri-v2-rust-desktop-mobile', domainId: 'mobile', tier: 'library', summary: { en: 'Cross-platform Tauri v2 desktop & mobile apps with capability ACLs and typed Rust IPC.', vi: 'Xây dựng ứng dụng máy tính & di động Tauri v2 gọn nhẹ với phân quyền ACL chặt chẽ và giao tiếp Rust IPC.' } },
  { id: 'godot-4-gdscript-shaders-2d-3d', domainId: 'gaming', tier: 'library', summary: { en: 'Godot 4 scene composition, typed GDScript, custom 2D/3D shaders, and signal architecture.', vi: 'Tổ chức cảnh Godot 4, GDScript định kiểu chặt, viết shader 2D/3D tùy biến và kiến trúc tín hiệu sạch.' } },
  { id: 'multiplayer-netcode-colyseus', domainId: 'gaming', tier: 'library', summary: { en: 'Authoritative room state sync, client-side prediction, and lag compensation with Colyseus.', vi: 'Đồng bộ trạng thái phòng máy chủ chuẩn xác, dự đoán phía máy khách và bù trễ mạng với Colyseus.' } },
  { id: 'product-manager-toolkit', domainId: 'management', tier: 'library', summary: { en: 'Outcome-driven PRDs, opportunity trees, release slicing, and stakeholder alignment.', vi: 'Bộ công cụ lập PRD hướng kết quả, cây cơ hội sản phẩm, cắt lát phát hành và đồng thuận các bên.' } },
  { id: 'ai-agents-architect', domainId: 'ai_ml', tier: 'library', summary: { en: 'Multi-agent topologies, tool-use sandboxes, context compaction, and deterministic evals.', vi: 'Kiến trúc hệ đa tác tử, môi trường gọi công cụ an toàn, nén ngữ cảnh và bộ đánh giá định lượng.' } },
  { id: 'cloudflare-d1-r2-durable-objects', domainId: 'cloud', tier: 'library', summary: { en: 'Stateful Cloudflare Workers using Durable Objects SQLite, D1 replicas, and R2 storage.', vi: 'Ứng dụng biên mạng có trạng thái trên Cloudflare Workers với Durable Objects SQLite, D1 và lưu trữ R2.' } },
  { id: 'rust-axum-tokio-sqlx', domainId: 'languages', tier: 'library', summary: { en: 'Async Rust web services with Axum extractors, Tokio concurrency, and compile-checked SQLx.', vi: 'Dịch vụ hậu cần Rust bất đồng bộ hiệu năng cao với Axum, xử lý đồng thời Tokio và truy vấn SQLx kiểm tra lúc biên dịch.' } },
  { id: 'ai-ide-plugin-authoring', domainId: 'tools', tier: 'library', summary: { en: 'Cross-IDE rules, skills, slash workflows, and PreToolUse hooks across all 5 AI assistants.', vi: 'Biên soạn quy tắc, kỹ năng, lệnh quy trình và hook bảo vệ tiền thực thi tương thích cả 5 nền tảng AI IDE.' } },
  { id: 'mcp-server-fastmcp-2025', domainId: 'mcp', tier: 'library', summary: { en: 'Streamable HTTP MCP servers with typed tool schemas, resource URIs, and auth scopes.', vi: 'Xây dựng máy chủ MCP chuẩn Streamable HTTP với schema công cụ tường minh, tài nguyên định danh và phân quyền.' } },
]

export const ALL_SHOWCASE_SKILLS: readonly SkillShowcaseItem[] = [
  ...CORE_SKILLS_SHOWCASE,
  ...FEATURED_LIBRARY_SKILLS,
]

export function getSkillDomainLabel(domainId: string): BilingualText {
  return SKILL_DOMAIN_LABELS[domainId] ?? { en: domainId, vi: domainId }
}
