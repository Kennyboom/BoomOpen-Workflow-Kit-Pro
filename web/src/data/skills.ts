import type { BilingualText, SkillShowcaseItem } from '../types/ui-contract'

export const SKILL_DOMAIN_LABELS: Record<string, { readonly en: string; readonly vi: string }> = {
  backend: { en: 'Backend Development', vi: 'Phát triển backend & API' },
  frontend: { en: 'Frontend Development', vi: 'Phát triển giao diện web' },
  architecture: { en: 'System Architecture', vi: 'Kiến trúc hệ thống' },
  quality: { en: 'Quality Assurance', vi: 'Kiểm thử & chất lượng' },
  security: { en: 'Security Engineering', vi: 'Kỹ thuật bảo mật' },
  design: { en: 'UI/UX Design', vi: 'Thiết kế UI/UX' },
  planning: { en: 'Planning & Analysis', vi: 'Lập kế hoạch & phân tích' },
  devops: { en: 'DevOps & Deployment', vi: 'DevOps & triển khai' },
  data: { en: 'Data & Database', vi: 'Dữ liệu & cơ sở dữ liệu' },
  performance: { en: 'Performance Engineering', vi: 'Tối ưu hiệu năng' },
  research: { en: 'Research & Documentation', vi: 'Nghiên cứu & tài liệu' },
  mobile: { en: 'Mobile Development', vi: 'Phát triển ứng dụng di động' },
  gaming: { en: 'Game Development', vi: 'Phát triển game & đồ họa' },
  management: { en: 'Project Management', vi: 'Quản lý dự án & sản phẩm' },
  ai_ml: { en: 'AI/ML Engineering', vi: 'Kỹ thuật AI & học máy' },
  cloud: { en: 'Cloud & Infrastructure', vi: 'Đám mây & hạ tầng' },
  languages: { en: 'Programming Languages', vi: 'Ngôn ngữ lập trình' },
  tools: { en: 'Tools & Utilities', vi: 'Công cụ & tự động hóa' },
  mcp: { en: 'MCP & Agents', vi: 'Giao thức MCP & AI agents' },
}

export const CORE_SKILLS_SHOWCASE: readonly SkillShowcaseItem[] = [
  {
    id: 'api-patterns',
    domainId: 'backend',
    tier: 'core',
    summary: {
      en: 'Contract-first REST, GraphQL, and Hono RPC design with Zod/OpenAPI schemas, RFC 9457 errors, and API validation scripts.',
      vi: 'Thiết kế REST, GraphQL và Hono RPC theo hợp đồng trước với schema Zod/OpenAPI, chuẩn lỗi RFC 9457 và script kiểm tra tự động.',
    },
  },
  {
    id: 'app-builder',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: 'Full-stack build coordinator using 3-Wave Contract-First sharding, DESIGN_CONTRACT tokens, and local CLI verification.',
      vi: 'Điều phối xây dựng ứng dụng full-stack theo 3 wave song song, khóa DESIGN_CONTRACT và kiểm tra nhất quán bằng CLI.',
    },
  },
  {
    id: 'behavioral-modes',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: 'Operational stances for brainstorming, implementation, debugging, code review, release prep, and multi-agent coordination.',
      vi: 'Chuyển đổi chế độ làm việc linh hoạt giữa phân tích phương án, lập trình, gỡ lỗi, review, phát hành và điều phối multi-agent.',
    },
  },
  {
    id: 'brainstorming',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: 'Codebase-grounded ideation, distinct option generation, pre-mortem critique, and 6-Block BRAINSTORM specs.',
      vi: 'Khảo sát mã nguồn trước khi đề xuất phương án, phân tích rủi ro sớm và xuất đặc tả BRAINSTORM 6 khối chuẩn CLI.',
    },
  },
  {
    id: 'clean-code',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: 'Pragmatic 2-Tier coding rules: zero explicit any, typed error handling, and cohesive 200-350 line modules (400/500 limits).',
      vi: 'Chuẩn code thực dụng 2 tầng: cấm kiểu any tường minh, xử lý lỗi chặt chẽ và giữ module gọn 200-350 dòng (ngưỡng 400/500).',
    },
  },
  {
    id: 'database-design',
    domainId: 'data',
    tier: 'core',
    summary: {
      en: 'Wave 1 schema locking, zero-downtime expand/contract migrations, indexing rules, and Drizzle/Prisma/Postgres patterns.',
      vi: 'Khóa schema ngay Wave 1, migration mở rộng và thu hẹp không dừng dịch vụ, chiến lược chỉ mục và mẫu Drizzle/Prisma/Postgres.',
    },
  },
  {
    id: 'debugger',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'Structured root-cause debugging with 5-Whys causal chains, minimal reproducers, and regression-locked patches.',
      vi: 'Quy trình gỡ lỗi theo chuỗi nguyên nhân 5-Whys, kịch bản tái hiện tối giản và bản vá kèm test chống hồi quy.',
    },
  },
  {
    id: 'deep-research',
    domainId: 'research',
    tier: 'core',
    summary: {
      en: '3-wave multi-hop search with 4-source triangulation, contradiction resolution, and CLI-validated RESEARCH briefs.',
      vi: 'Nghiên cứu chuyên sâu 3 bước có đối chiếu 4 nguồn, phân tích điểm mâu thuẫn và xuất bản tóm tắt RESEARCH kiểm tra bằng CLI.',
    },
  },
  {
    id: 'design-spec',
    domainId: 'design',
    tier: 'core',
    summary: {
      en: 'CLI-validated 6-Block DESIGN-{task}.md contract with OKLCH tokens, elevation scales, and 5-State component matrices.',
      vi: 'Hợp đồng thiết kế DESIGN-{task}.md 6 khối kiểm tra tự động qua CLI với màu OKLCH, thang độ nổi và ma trận 5 trạng thái.',
    },
  },
  {
    id: 'frontend-architecture',
    domainId: 'frontend',
    tier: 'core',
    summary: {
      en: 'UI/logic/data/type separation, state-tier boundaries, schema-validated API clients, and React/Next/Vue conventions.',
      vi: 'Phân tách rõ giao diện, logic, dữ liệu và kiểu; quản lý ranh giới state và cấu trúc chuẩn cho React, Next.js và Vue.',
    },
  },
  {
    id: 'frontend-design',
    domainId: 'frontend',
    tier: 'core',
    summary: {
      en: 'Modern web UI craft with OKLCH color tokens, clear typographic hierarchy, restrained motion, and WCAG 2.2 AA contrast.',
      vi: 'Thiết kế giao diện web sắc nét với hệ màu OKLCH, phân cấp chữ rõ ràng, chuyển động vừa phải và chuẩn tiếp cận WCAG 2.2 AA.',
    },
  },
  {
    id: 'game-developer',
    domainId: 'gaming',
    tier: 'core',
    summary: {
      en: 'Real-time ECS architecture, Unity 6/Unreal 5/Godot 4/WebGPU pipelines, fixed-step physics, and frame-time profiling.',
      vi: 'Kiến trúc ECS thời gian thực, pipeline Unity 6/Unreal 5/Godot 4/WebGPU, vật lý bước thời gian cố định và tối ưu khung hình.',
    },
  },
  {
    id: 'intelligent-routing',
    domainId: 'architecture',
    tier: 'core',
    summary: {
      en: 'Explicit /cmd and opt-in 17-language intent router dispatching either direct edits or parallel multi-agent workflows.',
      vi: 'Bộ định tuyến lệnh /cmd và ý định 17 ngôn ngữ (tùy chọn bật) giúp phân luồng sửa trực tiếp hoặc chạy song song multi-agent.',
    },
  },
  {
    id: 'mobile-design',
    domainId: 'design',
    tier: 'core',
    summary: {
      en: 'iOS 18 HIG and Android Material 3 design rules with 44pt/48dp touch targets and safe-area layout tokens.',
      vi: 'Quy tắc thiết kế di động chuẩn iOS 18 HIG và Material 3 với vùng chạm 44pt/48dp cùng hệ token safe-area chuẩn xác.',
    },
  },
  {
    id: 'mobile-developer',
    domainId: 'mobile',
    tier: 'core',
    summary: {
      en: 'React Native, Flutter, and Tauri v2 mobile engineering with offline-first sync and typed native bridges.',
      vi: 'Phát triển ứng dụng React Native, Flutter và Tauri v2 hỗ trợ đồng bộ ngoại tuyến và cầu nối native an toàn kiểu.',
    },
  },
  {
    id: 'plan-writing',
    domainId: 'planning',
    tier: 'core',
    summary: {
      en: '5-gate PLAN-{task}.md authoring with SHARED_CONTRACT schemas and disjoint <= 4 OWNED_FILES shard locks.',
      vi: 'Soạn kế hoạch PLAN-{task}.md vượt 5 cổng CLI kèm khối SHARED_CONTRACT và giới hạn tối đa 4 OWNED_FILES mỗi shard.',
    },
  },
  {
    id: 'security-auditor',
    domainId: 'security',
    tier: 'core',
    summary: {
      en: 'DevSecOps and OWASP Top 10 checks covering OAuth 2.1/Better Auth, secret scanning, and LLM/MCP agent boundaries.',
      vi: 'Kiểm tra bảo mật DevSecOps và OWASP Top 10 bao quát OAuth 2.1/Better Auth, quét lộ bí mật và bảo vệ biên gọi công cụ AI agent.',
    },
  },
  {
    id: 'seo-fundamentals',
    domainId: 'research',
    tier: 'core',
    summary: {
      en: 'Technical SEO, Core Web Vitals (LCP/INP/CLS), JSON-LD graphs, canonical URLs, and llms.txt discovery files.',
      vi: 'Tối ưu SEO kỹ thuật, chỉ số Core Web Vitals (LCP/INP/CLS), dữ liệu có cấu trúc JSON-LD, chuẩn canonical và tệp llms.txt.',
    },
  },
  {
    id: 'skill-seeker',
    domainId: 'tools',
    tier: 'core',
    summary: {
      en: 'O(1) lookup helper resolving all 1,462 skills in matrix-skills/compact-index.json without bloating prompt context.',
      vi: 'Công cụ tra cứu O(1) trên chỉ mục 1.462 kỹ năng trong compact-index.json để nạp đúng tài liệu cần dùng.',
    },
  },
  {
    id: 'tdd-workflow',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'RED-GREEN-REFACTOR workflow mapping Given/When/Then criteria to locked regression tests with zero skipped assertions.',
      vi: 'Quy trình RED-GREEN-REFACTOR ánh xạ tiêu chí Given/When/Then vào bộ test khóa chống hồi quy, cấm bỏ qua bài test.',
    },
  },
  {
    id: 'testing-patterns',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'Unit and integration test patterns with Vitest, MSW v2 network mocking, isolated fixtures, and WCAG 2.2 checks.',
      vi: 'Mẫu kiểm thử unit và tích hợp với Vitest, giả lập tầng mạng bằng MSW v2, dữ liệu test cô lập và kiểm tra trợ năng WCAG 2.2.',
    },
  },
  {
    id: 'webapp-testing',
    domainId: 'quality',
    tier: 'core',
    summary: {
      en: 'End-to-end Playwright browser automation, console/network error capture, and multi-route accessibility checks.',
      vi: 'Tự động hóa trình duyệt end-to-end bằng Playwright, bắt lỗi console/mạng và kiểm tra chuẩn trợ năng trên nhiều trang.',
    },
  },
]

export const FEATURED_LIBRARY_SKILLS: readonly SkillShowcaseItem[] = [
  { id: 'hono-rpc-zod-openapi', domainId: 'backend', tier: 'library', summary: { en: 'End-to-end type-safe Hono RPC routes with Zod OpenAPI generation on Workers and Node.', vi: 'Xây dựng route Hono RPC an toàn kiểu end-to-end kèm sinh tài liệu Zod OpenAPI trên Workers và Node.' } },
  { id: 'react-19-nextjs-15-rsc', domainId: 'frontend', tier: 'library', summary: { en: 'React 19 Server Actions, Next.js 15 App Router streaming, and optimistic UI patterns.', vi: 'Mẫu triển khai React 19 Server Actions, streaming với Next.js 15 App Router và cập nhật giao diện tức thì.' } },
  { id: 'senior-architect', domainId: 'architecture', tier: 'library', summary: { en: 'C4 system modeling, modular monolith vs distributed trade-offs, and ADR governance.', vi: 'Mô hình hóa hệ thống C4, phân tích đánh đổi giữa modular monolith và phân tán kèm hồ sơ ADR.' } },
  { id: 'vitest-msw-testing-patterns', domainId: 'quality', tier: 'library', summary: { en: 'Fast hermetic test suites using Vitest workspaces and MSW v2 HTTP/GraphQL interceptors.', vi: 'Bộ kiểm thử cô lập tốc độ cao dùng Vitest kết hợp giả lập HTTP/GraphQL bằng MSW v2.' } },
  { id: 'owasp-llm-agent-security-2025', domainId: 'security', tier: 'library', summary: { en: 'Defenses against indirect prompt injection, tool-call privilege escalation, and MCP SSRF.', vi: 'Phòng vệ trước tấn công tiêm lệnh gián tiếp, leo thang đặc quyền khi gọi công cụ và lỗi SSRF trên MCP.' } },
  { id: 'better-auth-typescript', domainId: 'security', tier: 'library', summary: { en: 'Type-safe session, passkey, OAuth 2.1, and multi-tenant organization auth with Better Auth.', vi: 'Xác thực phiên, passkey, OAuth 2.1 và phân quyền tổ chức đa thuê bao an toàn kiểu với Better Auth.' } },
  { id: 'anti-ai-slop-visual-craft', domainId: 'design', tier: 'library', summary: { en: 'Replaces generic AI UI clichés with disciplined editorial grids, contrast, and typography.', vi: 'Loại bỏ các mẫu giao diện AI rập khuôn bằng lưới bố cục chặt chẽ, độ tương phản chuẩn và chữ sắc nét.' } },
  { id: 'figma-mcp-dtcg-design-tokens', domainId: 'design', tier: 'library', summary: { en: 'W3C DTCG design-token pipelines bridging Figma variables directly into CSS @theme code.', vi: 'Đồng bộ biến thiết kế chuẩn W3C DTCG từ Figma sang mã nguồn CSS @theme.' } },
  { id: 'sequential-thinking', domainId: 'planning', tier: 'library', summary: { en: 'Structured multi-step problem decomposition with dependency checks and hypothesis revision.', vi: 'Phân rã bài toán nhiều bước kèm kiểm tra phụ thuộc và hiệu chỉnh giả thuyết khi có dữ kiện mới.' } },
  { id: 'terraform-opentofu-production', domainId: 'devops', tier: 'library', summary: { en: 'State-locked OpenTofu/Terraform modules, drift detection, and policy-gated plan pipelines.', vi: 'Tổ chức module OpenTofu/Terraform có khóa state, phát hiện lệch cấu hình và duyệt plan tự động.' } },
  { id: 'drizzle-neon-turso-edge', domainId: 'data', tier: 'library', summary: { en: 'Edge-ready Drizzle ORM schemas, prepared queries, and branching migrations for Neon and Turso.', vi: 'Thiết kế schema Drizzle ORM cho môi trường edge, prepared query và migration phân nhánh trên Neon & Turso.' } },
  { id: 'supabase-rls-edge-realtime', domainId: 'data', tier: 'library', summary: { en: 'Postgres Row-Level Security policies, Edge Functions, and typed Realtime channels.', vi: 'Chính sách bảo mật cấp dòng Postgres RLS, Edge Functions và kênh đồng bộ thời gian thực an toàn kiểu.' } },
  { id: 'performance-profiling', domainId: 'performance', tier: 'library', summary: { en: 'CPU flamegraphs, heap snapshot diffing, Lighthouse CWV checks, and SQL query tuning.', vi: 'Phân tích flamegraph CPU, so sánh heap snapshot, đo Lighthouse CWV và tối ưu truy vấn SQL.' } },
  { id: 'docs-seeker', domainId: 'research', tier: 'library', summary: { en: 'Version-matched official SDK documentation lookup and llms.txt retrieval.', vi: 'Tra cứu tài liệu SDK chính thức đúng phiên bản và khai thác nhanh đặc tả qua llms.txt.' } },
  { id: 'tauri-v2-rust-desktop-mobile', domainId: 'mobile', tier: 'library', summary: { en: 'Cross-platform Tauri v2 desktop and mobile apps with capability ACLs and typed Rust IPC.', vi: 'Xây dựng ứng dụng desktop và di động Tauri v2 với phân quyền capability ACL và giao tiếp Rust IPC.' } },
  { id: 'godot-4-gdscript-shaders-2d-3d', domainId: 'gaming', tier: 'library', summary: { en: 'Godot 4 scene composition, typed GDScript, custom 2D/3D shaders, and clean signal wiring.', vi: 'Tổ chức scene Godot 4, GDScript định kiểu, viết shader 2D/3D tùy biến và kết nối signal rõ ràng.' } },
  { id: 'multiplayer-netcode-colyseus', domainId: 'gaming', tier: 'library', summary: { en: 'Authoritative room state sync, client-side prediction, and lag compensation with Colyseus.', vi: 'Đồng bộ trạng thái phòng phía server, dự đoán phía client và bù trễ mạng với Colyseus.' } },
  { id: 'product-manager-toolkit', domainId: 'management', tier: 'library', summary: { en: 'Outcome-driven PRDs, opportunity trees, release slicing, and scope trade-off framing.', vi: 'Soạn PRD hướng kết quả, lập cây cơ hội sản phẩm, chia nhỏ các đợt phát hành và cân đối phạm vi.' } },
  { id: 'ai-agents-architect', domainId: 'ai_ml', tier: 'library', summary: { en: 'Multi-agent coordination patterns, tool-call sandboxes, context compaction, and automated evals.', vi: 'Thiết kế hệ thống multi-agent, cô lập môi trường gọi công cụ, nén ngữ cảnh và bộ đánh giá tự động.' } },
  { id: 'cloudflare-d1-r2-durable-objects', domainId: 'cloud', tier: 'library', summary: { en: 'Stateful Cloudflare Workers using Durable Objects SQLite, D1 replicas, and R2 object storage.', vi: 'Xây dựng Cloudflare Workers có trạng thái với Durable Objects SQLite, cơ sở dữ liệu D1 và lưu trữ R2.' } },
  { id: 'rust-axum-tokio-sqlx', domainId: 'languages', tier: 'library', summary: { en: 'Async Rust web services with Axum extractors, Tokio concurrency, and compile-checked SQLx.', vi: 'Dịch vụ web Rust bất đồng bộ với Axum, xử lý đồng thời Tokio và kiểm tra câu lệnh SQLx lúc biên dịch.' } },
  { id: 'ai-ide-plugin-authoring', domainId: 'tools', tier: 'library', summary: { en: 'Cross-IDE rules, skills, slash workflows, and opt-in guard hooks across all 5 AI assistants.', vi: 'Viết bộ quy tắc, kỹ năng, lệnh workflow và hook bảo vệ tương thích trên cả 5 AI IDE.' } },
  { id: 'mcp-server-fastmcp-2025', domainId: 'mcp', tier: 'library', summary: { en: 'Streamable HTTP MCP servers with typed tool schemas, resource URIs, and auth scopes.', vi: 'Xây dựng MCP server chuẩn Streamable HTTP với schema công cụ tường minh, URI tài nguyên và phân quyền.' } },
]

export const ALL_SHOWCASE_SKILLS: readonly SkillShowcaseItem[] = [
  ...CORE_SKILLS_SHOWCASE,
  ...FEATURED_LIBRARY_SKILLS,
]

export function getSkillDomainLabel(domainId: string): BilingualText {
  return SKILL_DOMAIN_LABELS[domainId] ?? { en: domainId, vi: domainId }
}
