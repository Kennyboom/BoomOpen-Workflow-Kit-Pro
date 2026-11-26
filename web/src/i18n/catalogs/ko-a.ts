import type { CatalogPackPartA } from '../types'

export const catalogPartA: CatalogPackPartA = {
  locale: 'ko',
  platforms: {
    antigravity: 'GEMINI.md 21줄 frontier-guardrails, 네이티브 invoke_subagent 및 Python run_workflow 병렬 팬아웃, /goal 지속 실행 러너, --as-plugin 모드, 옵트인 --with-hooks, Brain 산출물, 공용 ~/.agents/skills_library 지원.',
    claude: 'CLAUDE.md 21줄 frontier-guardrails, 병렬 Task/Agent 샤드, 기본 /plan 충돌을 피하는 /plan:hard, 옵트인 --with-hooks(PreToolUse, Stop, PreCompact), 93개 명령어 파일, 22개 서브에이전트, 공용 ~/.agents/skills_library 지원.',
    codex: 'AGENTS.md 21줄 frontier-guardrails, 스카우터·리뷰어용 OS sandbox_mode 읽기 전용 격리가 적용된 ~/.codex/agents/boomopen/ 내 22개 TOML 역할, 87개 $boomopen-* 스킬, 공용 ~/.agents/skills_library 지원.',
    cursor: '경량 .mdc + CURSOR.md 규칙, 병렬 Task 서브에이전트, 옵트인 --with-hooks(beforeShellExecution), 87개 슬래시 워크플로우(93개 명령어 파일), ./reports/{topic}/ 산출물 라우팅, 공용 ~/.agents/skills_library 지원.',
    copilot: 'VS Code Copilot 커스텀 에이전트 프로필, 경량 COPILOT.md 규칙, #runSubagent 핸드오프 패킷, 93개 명령어 파일(87개 워크플로우), ./reports/{topic}/ 산출물, 로컬 CLI 검증, 공용 ~/.agents/skills_library 지원.',
  },
  commands: {
    autopilot: {
      summary: '.boomopen/project-ledger.json, SHA-256 명세 해시, 100% RTM 페이즈 게이트 기반의 멀티 세션 페이즈 실행기.',
      nlExample: '"/autopilot docs/ 기준으로 다음 페이즈 이어서 구현해 줘"',
    },
    conduct: {
      summary: 'Claude Code, Codex, Antigravity, Cursor, Copilot 간 멀티 엔진 카운슬 및 크로스 IDE 파이프라인을 Author != Critic 원칙으로 실행.',
      nlExample: '"boomopen conduct council --task review --prompt \'인증 경계 감사\'"',
    },
    orchestrate: {
      summary: '복합 도메인 작업을 비중복 OWNED_FILES 파일 쓰기 잠금이 적용된 병렬 role#shard 서브에이전트로 분할 실행.',
      nlExample: '"데이터베이스, 백엔드, 프론트엔드 샤드를 병렬로 조율해 실행해 줘"',
    },
    auto: {
      summary: '현재 요청의 복잡도를 분류해 단일 세션 직접 수정 또는 멀티 에이전트 워크플로우로 자동 분기.',
      nlExample: '"/auto 이 작업에 맞는 워크플로우 골라서 진행해 줘"',
    },
    next: {
      summary: '현재 산출물, 레저 커서, 대기 중인 웨이브 상태를 읽고 다음 실행 단계를 제안 및 시작.',
      nlExample: '"/next 현재 페이즈에서 남은 다음 단계 알려 줘"',
    },
    settings: {
      summary: '5개 프리셋(기본값 frontier-guardrails), 22개 설정 키, 로컬 --ui 대시보드, 14개 진입 파일 10ms 미만 동기화 관리.',
      nlExample: '"boomopen settings preset adversarial-team 또는 /settings preset smart-hybrid"',
    },
    cook: {
      summary: '사전 플랜이 없을 때 쓰는 엔드투엔드 기능 구현 워크플로우: 저장소 탐색, 계약 잠금, 병렬 샤드 실행, E2E 검증 수행.',
      nlExample: '"/cook:team 패스키 인증 기능을 처음부터 끝까지 구현해 줘"',
    },
    code: {
      summary: '/plan 재실행 없이 승인된 PLAN-* 명세를 Wave 1-3 병렬 샤드로 즉시 구현.',
      nlExample: '"/code 승인된 PLAN-rbac.md 바로 구현해 줘"',
    },
    fix: {
      summary: '근본 원인 격리, 회귀 테스트 잠금, 전체 빌드 검증을 결합한 다중 파일 버그 수정 워크플로우.',
      nlExample: '"/fix 웹훅 재시도 레이스 컨디션 버그 수정해 줘"',
    },
    refactor: {
      summary: '동작 변경 없이 200-350줄 단위의 응집도 높은 모듈(권장 400 / 상한 500)로 재구성하고 회귀 테스트 통과를 보장.',
      nlExample: '"/refactor 700줄짜리 컨트롤러를 도메인 서비스별로 분리해 줘"',
    },
    deploy: {
      summary: '배포 전 사전 점검, 프리뷰 스테이징, 프로덕션 롤아웃 및 배포 후 스모크 검증 수행.',
      nlExample: '"/deploy:check 프로덕션 배포 준비 상태 점검해 줘"',
    },
    rollback: {
      summary: '문제가 발생한 릴리스를 안전하게 되돌리고 스키마 호환성 및 서비스 정상 복구를 검증.',
      nlExample: '"/rollback 방금 배포한 릴리스 롤백하고 상태 체크해 줘"',
    },
    init: {
      summary: '.boomopen.json 워크스페이스 설정, 린트·타입체크 스크립트, 기본 디렉터리 규칙 초기화.',
      nlExample: '"/init 이 저장소에 BoomOpen 워크스페이스 기본 설정 잡아 줘"',
    },
    preview: {
      summary: '로컬 프리뷰 빌드를 구동하고 라우트 렌더링 및 콘솔 에러 여부를 점검.',
      nlExample: '"/preview 로컬 프리뷰 빌드 띄워서 전체 라우트 확인해 줘"',
    },
    pr: {
      summary: 'gh pr create 실행 전 사전 PR 게이트(check --strict-phase --no-stubs, reconcile REC-G1..G4) 검증 및 /pr:review 3역할 diff 리뷰 수행.',
      nlExample: '"/pr 검증 거친 PR 생성하거나 /pr:review #142 실행해 줘"',
    },
    release: {
      summary: '이전 태그 이후 Conventional Commits 점검, 버전 및 CHANGELOG.md 동기화, doctor + check + test:pack 실행 후 gh release create 준비.',
      nlExample: '"/release 다음 시맨틱 버전과 CHANGELOG.md 준비해 줘"',
    },
    plan: {
      summary: 'SHARED_CONTRACT 타입, 웨이브 DAG, 샤드당 <= 4 OWNED_FILES 규칙을 포함한 CLI 검증(PLAN-G1..G5) PLAN-* 명세 작성.',
      nlExample: '"/plan:hard 멀티 테넌트 RBAC 구현 웨이브 설계해 줘"',
    },
    design: {
      summary: 'OKLCH 토큰, 타이포그래피 스케일, 5상태 매트릭스, WCAG 2.2 AA 기준을 담은 6블록 DESIGN-* 계약(DESIGN-G1..G4) 작성.',
      nlExample: '"/design:hard 대시보드 UI 계약서 작성해 줘"',
    },
    research: {
      summary: '4소스 교차 검증, 상충 정보 판별, CLI 검증 RESEARCH-* 브리프를 강제하는 멀티홉 기술 리서치.',
      nlExample: '"/research WebGPU와 WebGL2 렌더링 트레이드오프 비교해 줘"',
    },
    brainstorm: {
      summary: '코드베이스에 기반한 3가지 이상의 독립 아키텍처 대안을 탐색하고 사전 부검(Pre-Mortem)과 MCDA 점수로 비교.',
      nlExample: '"/brainstorm 실시간 동기화 아키텍처 대안 3가지 검토해 줘"',
    },
    architect: {
      summary: '서비스 경계, 데이터 계약, 무중단 확장·축소 마이그레이션 전략 및 ADR 문서 정의.',
      nlExample: '"/architect 이벤트 기반 서비스 경계와 ADR 정의해 줘"',
    },
    'ui-ux-pro-max': {
      summary: '타이포그래피 위계, 명도 대비 규율, 반응형 리듬, 절제된 모션에 집중하는 UI 정밀 개선 워크플로우.',
      nlExample: '"/ui-ux-pro-max 결제 화면의 시각적 위계 다듬어 줘"',
    },
    audit: {
      summary: '구현 완료 후 다회차 프로젝트 감사(.boomopen/audit-ledger.json): RTM 커버리지, 수직 흐름, 보안 점검 및 선택형 수정 샤드 실행.',
      nlExample: '"/audit docs/ 기준으로 1라운드 감사 돌리고 블로커 정리해 줘"',
    },
    review: {
      summary: '정확한 file:line 근거와 함께 P0-P3 결함을 보고하는 코드·아키텍처 리뷰(3역할 :team 모드 지원).',
      nlExample: '"/review:team 인증·결제 변경분에서 P0-P2 결함 있는지 리뷰해 줘"',
    },
    debug: {
      summary: '패치 작성 전 최소 재현 케이스, 호출 체인 추적, 가설 검증으로 근본 원인을 규명(DBG-G1..G4).',
      nlExample: '"/debug 워커 큐 메모리 누수 근본 원인 찾아 줘"',
    },
    test: {
      summary: '건너뛴 단언문 없이 Given/When/Then 기준에 매핑되는 유닛·통합·접근성·E2E 테스트 작성 및 실행.',
      nlExample: '"/test 체크아웃 플로우 통합 테스트와 엣지 케이스 추가해 줘"',
    },
    'security-audit': {
      summary: 'OWASP Top 10, 인증·세션 경계, 시크릿 노출, LLM/MCP 도구 호출 표면을 점검하는 보안 감사.',
      nlExample: '"/security-audit API 인증과 웹훅 서명 검증 로직 점검해 줘"',
    },
    performance: {
      summary: 'Core Web Vitals, 번들 크기, SQL 실행 계획, p95 지연 병목을 전후 수치와 함께 프로파일링.',
      nlExample: '"/performance 느린 SQL 쿼리와 번들 용량 프로파일링해 줘"',
    },
    'deep-audit': {
      summary: '아키텍처 정합성, 데드 코드, 보안 태세, 문서 일치 여부, 테스트 공백을 병렬 읽기 전용으로 전수 스캔.',
      nlExample: '"/deep-audit 저장소 전체 코드, 문서, 테스트 커버리지 점검해 줘"',
    },
    onboard: {
      summary: '60초 읽기 전용 저장소 온보딩: 3개 병렬 스카우터가 스택, 진입점, 데이터 흐름, 핫스팟, 빌드·테스트 명령을 ARCHITECTURE-MAP.md로 정리.',
      nlExample: '"/onboard 진입점, 데이터 흐름, 테스트 명령어 파악해 줘"',
    },
    docs: {
      summary: '기술 명세(:core), 도메인 가이드(:business), 드리프트 점검(:audit) 전반에 걸쳐 실제 소스 코드와 대조 검증된 문서 작성.',
      nlExample: '"/docs:core 아키텍처와 CLI 레퍼런스 문서 업데이트해 줘"',
    },
    report: {
      summary: 'git log와 실제 테스트 출력을 근거로 배포 요약, 검증 지표, 리스크 테이블을 취합.',
      nlExample: '"/report 이번 스프린트 변경사항과 테스트 결과 요약해 줘"',
    },
    ask: {
      summary: '워킹트리를 건드리지 않고 심볼 단위 file:line 근거를 반환하는 읽기 전용 병렬 코드베이스 Q&A.',
      nlExample: '"/ask 인증 미들웨어에서 리프레시 토큰 로테이션이 어떻게 동작해?"',
    },
    save: {
      summary: '세션 의사결정, 활성 샤드 ID, 남은 작업을 산출물로 저장해 다음 세션에서 끊김 없이 이어서 진행.',
      nlExample: '"/save 현재 진행 상황과 남은 작업 체크포인트로 저장해 줘"',
    },
    recap: {
      summary: '새 세션 시작 시 이전 체크포인트, 최근 커밋, 레저 잔여 항목을 간결하게 요약.',
      nlExample: '"/recap 지난 세션에서 어디까지 했는지 요약해 줘"',
    },
    status: {
      summary: '활성 프리셋 설정, 레저 페이즈 커서, 수정된 파일, 검증 상태를 한눈에 출력.',
      nlExample: '"/status 현재 활성 프리셋과 레저 진행률 보여 줘"',
    },
  },
  cli: {
    research: '6블록 RESEARCH-* 및 BRAINSTORM-*(--mode brainstorm) 브리프를 4개 소스 교차 검증 게이트로 검사하고 HANDOFF_BRIEF를 추출합니다.',
    design: '6블록 UI 명세(OKLCH 토큰, 타이포그래피 스케일, 5상태 매트릭스, WCAG 2.2 AA 명도 대비)를 검사하고 DESIGN_CONTRACT CSS + TypeScript props를 추출합니다.',
    plan: '웨이브 DAG 의존성, SHARED_CONTRACT 타입, 샤드당 <= 4 OWNED_FILES 비중복 잠금을 검증하고 .boomopen/project-ledger.json으로 컴파일합니다.',
    cook: '사전 점검(boomopen cook preflight PLAN.md), 5필드 웨이브 핸드오프 패킷 생성, 웨이브별 OWNED_FILES + READ_ONLY_FILES 잠금 검증을 수행합니다.',
    reconcile: '미연결 모듈, 프론트·백엔드 API 라우트 불일치, 누락된 [SC-*] 조항, 빠진 .env.example 키를 잡아내는 Wave 2.5 정합성 스캐너입니다.',
    audit: 'SHA-256 결함 핑거프린트, 선택적 수정 승인, Git 체크포인트, 테스트 래칫을 갖춘 다회차 프로젝트 감사(.boomopen/audit-ledger.json) 도구입니다.',
    ledger: 'SHA-256 명세 드리프트 점검, 100% RTM 추적성, 안전한 페이즈 롤백으로 .boomopen/project-ledger.json 진행 상태를 관리합니다.',
    conduct: '설치된 AI CLI를 탐지하고 Author != Critic 교차 검증이 적용된 6종 작업 멀티 엔진 카운슬(Claude, Codex, Antigravity, Cursor, Copilot)을 실행합니다.',
    check: '실용적 2계층 코드 기준을 검증합니다: 명시적 any 금지, 디버그 로그 제거, 400/500줄 제한, 빈 스텁 금지, 건너뛴 테스트 금지.',
    settings: '5개 프리셋(carbon-guardrails 별칭 포함), 22개 키(열거형 20 + 줄 제한 2), --ui 대시보드, 14개 진입 파일의 전역·워크스페이스 설정을 관리합니다.',
    doctor: 'SHA-256 매니페스트, 14개 진입 파일, 93개 명령어 파일(87 워크플로우 + 6 _ref), 22개 서브에이전트, 18개 팀, ~/.agents/skills_library를 읽기 전용으로 점검합니다.',
    install: '5개 IDE에 걸쳐 14개 진입 파일(기본 frontier-guardrails)을 동기화하고 ~/.agents/skills_library를 연결합니다. Claude Code·Antigravity·Cursor는 --with-hooks를 지원합니다.',
    uninstall: 'SHA-256 매니페스트에 기록된 미수정 키트 파일만 제거하고 BoomOpen 마커 블록만 정리해 사용자 파일과 수정본을 안전하게 보존합니다.',
    list: '현재 머신에서 지원되는 5대 AI 코딩 IDE의 감지된 경로, 설치된 키트 버전, 번들 위치를 출력합니다.',
  },
  seo: {
    home: {
      title: 'BoomOpen Workflow Kit Pro | AI 코딩을 위한 품질 가드레일 & 워크플로우',
      description: '5대 AI IDE를 위한 < 2.3 KB 경량 기본 가드레일과 옵트인 멀티 에이전트 워크플로우: 36개 슬래시 명령어(93개 파일), 22개 서브에이전트, 18개 3역할 리뷰 팀, 1,462개 스킬.',
    },
    commands: {
      title: '36개 슬래시 명령어 & 93개 워크플로우 파일 | BoomOpen Workflow Kit Pro',
      description: ':fast, :hard, :team 변형과 로컬 CLI 검증기를 갖춘 BoomOpen v5.5.0의 36개 슬래시 명령어(87개 워크플로우 + 6개 공통 참조) 전체 카탈로그.',
    },
    agents: {
      title: '22개 서브에이전트 & 18개 리뷰 팀 | BoomOpen Workflow Kit Pro',
      description: 'Tech Lead, Executor, Reviewer 역할이 분리된 22개 도메인 전담 서브에이전트와 18개 3역할 교차 리뷰 팀(72개 파일) 명세.',
    },
    skills: {
      title: '19개 도메인 1,462개 스킬 보관소 | BoomOpen Workflow Kit Pro',
      description: '19개 엔지니어링 도메인에 걸쳐 compact-index.json에 인덱싱된 22개 코어 스킬과 1,440개 온디맨드 라이브러리 스킬(총 1,462개) 탐색.',
    },
    architecture: {
      title: '시스템 아키텍처, 프리셋 & 14개 CLI 게이트 | BoomOpen Workflow Kit Pro',
      description: '< 2.3 KB 기본 frontier-guardrails와 3-Wave 계약 우선 병렬 샤딩(샤드당 <= 4 OWNED_FILES), Wave 2.5 정합성 검증, /autopilot 레저, 멀티 엔진 카운슬 구조.',
    },
    install: {
      title: '5개 AI IDE용 Git 설치 가이드 | BoomOpen Workflow Kit Pro',
      description: 'Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot을 위한 비파괴적 SHA-256 매니페스트 설치기 및 boomopen doctor 검증 가이드.',
    },
    notFound: {
      title: '404 페이지를 찾을 수 없음 | BoomOpen Workflow Kit Pro',
      description: '요청하신 문서 또는 카탈로그 경로가 존재하지 않습니다.',
    },
  },
}
