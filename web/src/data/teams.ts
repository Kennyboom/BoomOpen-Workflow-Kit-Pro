import type { TeamSpec } from '../types/ui-contract'

export const SPECIALIST_TEAMS: readonly TeamSpec[] = [
  {
    id: 'backend',
    dirName: 'backend-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['tech-lead'],
      executor: ['backend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave Contract-First API & service team locking DTO/OpenAPI schemas before parallel shard execution and adversarial critique.',
      vi: 'Đội ngũ API & dịch vụ 3 đợt khóa hợp đồng DTO/OpenAPI trước khi phân mảnh thực thi song song và phản biện độc lập.',
    },
  },
  {
    id: 'brainstorm',
    dirName: 'brainstorm-team',
    triggerCommand: '/brainstorm:team',
    roles: {
      techlead: ['planner'],
      executor: ['brainstormer'],
      reviewer: ['tech-lead'],
    },
    summary: {
      en: '2-Stage ideation & strategy team combining autonomous codebase grounding, orthogonal options, and tarpit pre-mortems.',
      vi: 'Đội ngũ khám phá ý tưởng 2 giai đoạn kết hợp trinh sát codebase, phương án trực giao và mổ xẻ rủi ro trước khi làm.',
    },
  },
  {
    id: 'database',
    dirName: 'database-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['database-architect'],
      executor: ['database-architect'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave expand-contract data team enforcing reversible migrations, lock-free indexing, and RLS policy verification.',
      vi: 'Đội ngũ dữ liệu 3 đợt đảm bảo migration mở rộng–thu hẹp an toàn, đánh chỉ mục không khóa bảng và kiểm chứng quyền RLS.',
    },
  },
  {
    id: 'debug',
    dirName: 'debug-team',
    triggerCommand: '/debug:team',
    roles: {
      techlead: ['debugger'],
      executor: ['backend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Stage SPIE v3.0 root-cause team pairing parallel hypothesis reproduction with regression-locked surgical patches.',
      vi: 'Đội ngũ gỡ lỗi SPIE v3.0 3 giai đoạn kết hợp tái hiện giả thuyết song song với bản vá gọn sạch kèm kiểm thử chống hồi quy.',
    },
  },
  {
    id: 'design',
    dirName: 'design-team',
    triggerCommand: '/design:team',
    roles: {
      techlead: ['designer'],
      executor: ['designer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '2-Stage visual craft team authoring 6-Block DESIGN specs, OKLCH token ladders, 5-state UI contracts, and WCAG 2.2 AA audits.',
      vi: 'Đội ngũ thiết kế 2 giai đoạn biên soạn đặc tả DESIGN 6 khối, thang màu OKLCH, hợp đồng 5 trạng thái và kiểm toán WCAG 2.2 AA.',
    },
  },
  {
    id: 'devops',
    dirName: 'devops-team',
    triggerCommand: '/deploy:check',
    roles: {
      techlead: ['devops-engineer'],
      executor: ['devops-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave infrastructure & release team hardening GitHub Actions matrices, declarative IaC, and rollback-ready deployments.',
      vi: 'Đội ngũ hạ tầng & phát hành 3 đợt gia cố ma trận CI/CD, hạ tầng khai báo (IaC) và kịch bản triển khai sẵn sàng quay lui.',
    },
  },
  {
    id: 'docs',
    dirName: 'docs-team',
    triggerCommand: '/docs:team',
    roles: {
      techlead: ['docs-manager'],
      executor: ['researcher'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave source-grounded documentation team verifying every CLI flag, route, and Mermaid diagram against live code.',
      vi: 'Đội ngũ tài liệu kỹ thuật 3 đợt đối chiếu từng cờ lệnh CLI, định tuyến và sơ đồ Mermaid trực tiếp với mã nguồn thực tế.',
    },
  },
  {
    id: 'frontend',
    dirName: 'frontend-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['tech-lead'],
      executor: ['frontend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave DESIGN_CONTRACT frontend team shipping accessible, 5-state resilient components across disjoint UI file locks.',
      vi: 'Đội ngũ giao diện 3 đợt bám sát DESIGN_CONTRACT, xây dựng component chuẩn tiếp cận đủ 5 trạng thái với khóa file độc lập.',
    },
  },
  {
    id: 'fullstack',
    dirName: 'fullstack-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['tech-lead'],
      executor: ['database-architect', 'backend-engineer', 'frontend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave end-to-end Elastic Golden Diamond uniting database, backend, and frontend executors behind one SHARED_CONTRACT.',
      vi: 'Đội hình Kim Cương Vàng toàn diện kết nối thực thi cơ sở dữ liệu, backend và frontend quanh một SHARED_CONTRACT duy nhất.',
    },
  },
  {
    id: 'game',
    dirName: 'game-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['game-engineer'],
      executor: ['game-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave ECS & frame-budget game team enforcing 60/120 FPS determinism, shader pipelines, and zero-allocation hot loops.',
      vi: 'Đội ngũ phát triển game 3 đợt đảm bảo khung hình 60/120 FPS ổn định, kiến trúc ECS tất định và vòng lặp không gây trễ bộ nhớ.',
    },
  },
  {
    id: 'mobile',
    dirName: 'mobile-team',
    triggerCommand: '/cook:team',
    roles: {
      techlead: ['mobile-engineer'],
      executor: ['mobile-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave mobile team delivering native-feel iOS 18 & Material 3 apps with safe-area tokens, 44pt/48dp targets, and offline sync.',
      vi: 'Đội ngũ di động 3 đợt kiến tạo ứng dụng chuẩn iOS 18 & Material 3 với vùng chạm chuẩn xác và đồng bộ ngoại tuyến bền bỉ.',
    },
  },
  {
    id: 'performance',
    dirName: 'performance-team',
    triggerCommand: '/performance',
    roles: {
      techlead: ['performance-engineer'],
      executor: ['backend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '3-Wave measure-first optimization team requiring before/after p95 benchmarks, EXPLAIN ANALYZE plans, and bundle budgets.',
      vi: 'Đội ngũ tối ưu hiệu năng 3 đợt bắt buộc đo kiểm trước–sau với chuẩn p95, phân tích EXPLAIN ANALYZE và giới hạn dung lượng gói.',
    },
  },
  {
    id: 'planning',
    dirName: 'planning-team',
    triggerCommand: '/plan:team',
    roles: {
      techlead: ['planner'],
      executor: ['planner'],
      reviewer: ['tech-lead'],
    },
    summary: {
      en: '2-Stage architecture planning team stress-testing DAG wave dependencies, shard sizes, and blast-radius rollback plans.',
      vi: 'Đội ngũ lập kế hoạch kiến trúc 2 giai đoạn kiểm định chặt phụ thuộc sóng DAG, kích thước phân mảnh và phương án khôi phục.',
    },
  },
  {
    id: 'project',
    dirName: 'project-team',
    triggerCommand: '/autopilot',
    roles: {
      techlead: ['project-manager'],
      executor: ['business-analyst'],
      reviewer: ['tech-lead'],
    },
    summary: {
      en: '2-Stage multi-phase governance team compiling RTM traceability, milestone gates, and .boomopen/project-ledger.json specs.',
      vi: 'Đội ngũ quản trị dự án đa pha thiết lập ma trận truy vết yêu cầu RTM, cổng nghiệm thu cột mốc và sổ cái điều hành tự động.',
    },
  },
  {
    id: 'qa',
    dirName: 'qa-team',
    triggerCommand: '/test:team',
    roles: {
      techlead: ['tester'],
      executor: ['tester'],
      reviewer: ['security-engineer', 'performance-engineer'],
    },
    summary: {
      en: '3-Wave zero-test-gaming QA team reviewed jointly by security and performance critics for edge-case and load resilience.',
      vi: 'Đội ngũ kiểm thử 3 đợt chống gian lận test, được phản biện kép bởi chuyên gia bảo mật và hiệu năng cho mọi tình huống biên.',
    },
  },
  {
    id: 'report',
    dirName: 'report-team',
    triggerCommand: '/report:team',
    roles: {
      techlead: ['reporter'],
      executor: ['scouter'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '2-Stage evidence-mined reporting team auditing every metric and chart against repository state and CLI verification logs.',
      vi: 'Đội ngũ báo cáo thực chứng 2 giai đoạn kiểm chứng từng con số và biểu đồ đối chiếu trực tiếp với lịch sử Git và nhật ký CLI.',
    },
  },
  {
    id: 'research',
    dirName: 'research-team',
    triggerCommand: '/research:team',
    roles: {
      techlead: ['researcher'],
      executor: ['researcher'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: 'Elastic 3-to-6 vector deep-research team triangulating primary sources and arbitrating contradictions before synthesis.',
      vi: 'Đội ngũ nghiên cứu chuyên sâu đa hướng (3–6 mũi song song) đối chiếu nguồn gốc và phân xử mâu thuẫn trước khi tổng hợp.',
    },
  },
  {
    id: 'security',
    dirName: 'security-team',
    triggerCommand: '/review:team',
    roles: {
      techlead: ['security-engineer'],
      executor: ['backend-engineer'],
      reviewer: ['reviewer'],
    },
    summary: {
      en: '2-Stage STRIDE, OWASP & agentic security team pairing exploit-proof vulnerability audits with verified defense patches.',
      vi: 'Đội ngũ bảo mật STRIDE & OWASP 2 giai đoạn kết hợp kiểm toán lỗ hổng có bằng chứng khai thác với bản vá phòng thủ đã xác minh.',
    },
  },
]
