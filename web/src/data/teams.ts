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
      en: 'Locks DTO and OpenAPI schemas in Wave 1 before parallel backend shard implementation and independent code review.',
      vi: 'Khóa schema DTO và OpenAPI ở Wave 1 trước khi các nhánh backend triển khai song song và qua bước review độc lập.',
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
      en: 'Pairs codebase scouting and distinct architecture options with an independent Tech Lead pre-mortem critique.',
      vi: 'Kết hợp khảo sát mã nguồn và đề xuất phương án kiến trúc với bước phản biện rủi ro độc lập từ Tech Lead.',
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
      en: 'Reviews expand/contract migrations, lock-free index creation, and Row-Level Security policies before rollout.',
      vi: 'Kiểm soát migration mở rộng và thu hẹp an toàn, đánh chỉ mục không khóa bảng và đối chiếu phân quyền RLS.',
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
      en: 'Separates root-cause reproduction from surgical patch implementation and regression-test review.',
      vi: 'Tách bạch bước dựng kịch bản tái hiện nguyên nhân gốc với khâu viết bản vá gọn và kiểm tra chống hồi quy.',
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
      en: 'Authors 6-Block DESIGN specs, OKLCH token scales, and 5-state component contracts audited against WCAG 2.2 AA.',
      vi: 'Soạn đặc tả DESIGN 6 khối, thang màu OKLCH và hợp đồng component 5 trạng thái được đối chiếu chuẩn WCAG 2.2 AA.',
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
      en: 'Hardens CI/CD workflows, OpenTofu/Terraform modules, container configs, and rollback procedures.',
      vi: 'Rà soát và củng cố pipeline CI/CD, module hạ tầng IaC, cấu hình container cùng quy trình hoàn tác khi có sự cố.',
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
      en: 'Verifies every documented CLI flag, file path, API signature, and Mermaid diagram against live repository code.',
      vi: 'Đối chiếu từng cờ lệnh CLI, đường dẫn tệp, chữ ký API và sơ đồ Mermaid trong tài liệu với mã nguồn thực tế.',
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
      en: 'Builds accessible, 5-state UI components from DESIGN_CONTRACT tokens across non-overlapping file locks.',
      vi: 'Triển khai component giao diện đủ 5 trạng thái từ DESIGN_CONTRACT trên các nhánh sở hữu file tách biệt.',
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
      en: 'Full-stack 3-role review team coordinating database, backend, and frontend executors behind one SHARED_CONTRACT.',
      vi: 'Nhóm 3 vai trò phản biện phối hợp đồng bộ database, backend và frontend quanh một SHARED_CONTRACT thống nhất.',
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
      en: 'Audits ECS simulation loops, shader pipelines, and 60/120 FPS frame-time budgets for hot-path allocations.',
      vi: 'Kiểm soát vòng lặp ECS, pipeline shader và ngân sách khung hình 60/120 FPS nhằm tránh cấp phát rác gây giật hình.',
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
      en: 'Delivers iOS 18 and Material 3 mobile screens with 44pt/48dp touch targets, safe-area layout, and offline sync.',
      vi: 'Xây dựng màn hình di động chuẩn iOS 18 và Material 3 với vùng chạm 44pt/48dp, bố cục safe-area và đồng bộ ngoại tuyến.',
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
      en: 'Requires measured before/after p95 latency numbers, EXPLAIN ANALYZE query plans, and bundle-size verification.',
      vi: 'Yêu cầu số liệu đo độ trễ p95 trước và sau khi tối ưu, phân tích EXPLAIN ANALYZE và kiểm soát dung lượng gói tải.',
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
      en: 'Stress-tests wave dependencies, <= 4 OWNED_FILES shard boundaries, and rollback steps before coding begins.',
      vi: 'Kiểm tra chéo thứ tự phụ thuộc giữa các wave, giới hạn <= 4 OWNED_FILES mỗi shard và phương án hoàn tác trước khi code.',
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
      en: 'Compiles RTM requirement tables, phase milestones, and .boomopen/project-ledger.json tracking for multi-phase builds.',
      vi: 'Thiết lập bảng truy vết yêu cầu RTM, cột mốc nghiệm thu từng phase và cấu hình .boomopen/project-ledger.json đa phiên.',
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
      en: 'Pairs QA test authoring with joint security and performance review across auth boundaries, edge cases, and load.',
      vi: 'Kết hợp viết bộ test phủ ca biên với bước phản biện kép từ kỹ sư bảo mật và hiệu năng.',
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
      en: 'Cross-checks every status metric, file count, and changelog entry against git history and CLI verification logs.',
      vi: 'Đối chiếu từng chỉ số tiến độ, số lượng file và nội dung changelog với lịch sử Git cùng kết quả chạy CLI.',
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
      en: 'Splits complex questions across 3-6 parallel research lanes, triangulates primary docs, and resolves contradictions.',
      vi: 'Chia bài toán nghiên cứu thành 3-6 nhánh chạy song song, đối chiếu tài liệu gốc và làm rõ các điểm mâu thuẫn.',
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
      en: 'Pairs STRIDE and OWASP vulnerability findings with minimal-diff remediation patches and independent verification.',
      vi: 'Kết hợp rà soát lỗ hổng STRIDE & OWASP có dẫn chứng cụ thể với bản vá gọn và bước kiểm tra độc lập.',
    },
  },
]
