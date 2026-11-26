<div align="center">
  <h1>⚡ BoomOpen Workflow Kit v5.5.0</h1>
  <p><strong>멀티 플랫폼 스마트 하이브리드 AI 개발 OS — 22명 전문 에이전트, 18개 골든 트라이앵글 팀 &amp; 1,462 온디맨드 스킬 볼트</strong></p>

  <p>
    <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/releases"><img src="https://img.shields.io/badge/Version-5.5.0-7c3aed.svg" alt="Version: 5.5.0" /></a>
    <a href="#platforms"><img src="https://img.shields.io/badge/Platforms-Antigravity%20%7C%20Claude%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot-0ea5e9.svg" alt="Platforms: 5 Unified" /></a>
    <a href="#agents"><img src="https://img.shields.io/badge/Agents-22%20Specialists%20%2B%2018%20Teams-10b981.svg" alt="Agents: 22 Specialists + 18 Teams" /></a>
    <a href="#skills"><img src="https://img.shields.io/badge/Skills-22%20Core%20%2B%201%2C440%20Library-f59e0b.svg" alt="Skills: 22 Core + 1,440 Library" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-22c55e.svg" alt="Node.js: >=18.0.0" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/License%20(kit%20code)-MIT-blue.svg" alt="License: MIT (kit code)" /></a>
  </p>

  <p>
    <a href="../README.md">🇬🇧 English</a> • <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> • <a href="./README.zh-CN.md">🇨🇳 简体中文</a> • <a href="./README.zh-TW.md">🇹🇼 繁體中文</a> • <a href="./README.ja.md">🇯🇵 日本語</a> • <b>🇰🇷 한국어</b> • <a href="./README.es.md">🇪🇸 Español</a> • <a href="./README.fr.md">🇫🇷 Français</a> • <a href="./README.de.md">🇩🇪 Deutsch</a><br/>
    <a href="./README.pt-BR.md">🇧🇷 Português</a> • <a href="./README.ru.md">🇷🇺 Русский</a> • <a href="./README.hi.md">🇮🇳 हिन्दी</a> • <a href="./README.ar.md">🇸🇦 العربية</a> • <a href="./README.id.md">🇮🇩 Bahasa Indonesia</a> • <a href="./README.th.md">🇹🇭 ไทย</a> • <a href="./README.tr.md">🇹🇷 Türkçe</a> • <a href="./README.it.md">🇮🇹 Italiano</a>
  </p>

  <p>
    <a href="https://boomopen.com">🌐 Website</a> • <a href="#overview"><b>🌟 개요</b></a> • <a href="#architecture"><b>🏗️ 아키텍처</b></a> • <a href="#quickstart"><b>🚀 빠른 시작</b></a> • <a href="#settings"><b>🎛️ 프리셋 &amp; 설정</b></a> • <a href="#commands"><b>🎯 36개 명령어</b></a> • <a href="#agents"><b>🤖 22 에이전트 &amp; 18 팀</b></a> • <a href="#skills"><b>📚 1,462 스킬 볼트</b></a>
  </p>
</div>

---

## 🎬 공식 런칭 트레일러 (Full HD 1080p)

<div align="center">
  <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4">
    <img src="../assets/media/poster_en.png" alt="BoomOpen Workflow Kit v5.5 공식 런칭 트레일러 (Full HD 1080p)" width="92%" />
  </a>
  <p>
    ▶️ <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4"><b>여기를 클릭하여 Full HD 1080p 공식 런칭 트레일러 재생 / 스트리밍 (스튜디오 보이스오버 MP4)</b></a>
  </p>
</div>

---

<a id="overview"></a>

## 🌟 BoomOpen Workflow Kit v5.5란 무엇인가요?

**BoomOpen Workflow Kit v5.5 (Frontier-Guardrails & Multi-Platform Smart-Hybrid Edition)**는 단일 AI 코딩 어시스턴트를 **22명의 전문 에이전트(Specialist Agents)**, **18개의 골든 트라이앵글 팀(72개 팀 파일)**, **36개 슬래시 명령어(93개 명령 파일: 87개 워크플로우 + `_ref/` 6개)**, **14개 CLI 명령어**, 그리고 **1,462개의 온디맨드 스킬 볼트(22개 코어 스킬 + 1,440개 라이브러리 스킬, `~/.agents/skills_library` 공유로 IDE 간 중복 제거)**로 구성된 엔지니어링 조직으로 전환하는 오픈소스 멀티 에이전트 운영체제입니다.

매 턴마다 콜드 스타트 지연과 컨텍스트 팽창을 유발하는 무거운 래퍼들과 달리, BoomOpen v5.5는 신규 설치 시 기본 프리셋으로 5대 IDE 공통 **`⚡ smart-hybrid` (턴-1 선제적 탄력적 스웜 + 17개 국어 자연어 라우팅)**를 기본 탑재하는 동시에 선택형(opt-in) 슬림 Mode A 프리셋인 **`🛡️ frontier-guardrails` (`< 2.5 KB` / `~600 tokens`)**도 제공하며, **4단계 탄력적 스웜 샤딩(`role#shard`)**, **Wave 2.5 명세-코드 자동 정합(`boomopen reconcile` + `spec-reconciler`)**, **다중 라운드 완료 후 감사(`/audit` & `boomopen audit`)**, **60초 브라운필드 아키텍처 매핑(`/onboard`)**, **PR / 릴리스 품질 게이트(`/pr`, `/pr:review`, `/release`)**, **멀티 세션 오토파일럿(`/autopilot`)**, 그리고 **크로스 엔진 컨덕터(`/conduct`)**를 통합합니다:
- **⚡ 기본 프리셋 `smart-hybrid`: 턴-1 선제적 스웜 + 17개 국어 자연어 라우팅**: 신규 설치 직후(`boomopen settings reset`으로도 복원) 대상이 명확한 소규모 수정(`≤ 2`개 파일)은 Mode A로 지연 없이 직접 실행하며, 다중 파일 개발·심층 리서치·아이디어 기획 및 명시적 `/cmd` 호출(**`/onboard`**, **`/pr` + `/pr:review`**, **`/release`** 등) 시 턴 1에서 병렬 샤드(`role#shard`, 샤드당 `<= 3–4 OWNED_FILES`)를 즉시 실행합니다. **DAG 병렬 팬아웃**, **계획-실행자 직접 디스패치**, **계약 우선 파일 잠금(`SHARED_CONTRACT` + `OWNED_FILES`)**, **Wave 2.5 명세-코드 자동 정합(`boomopen reconcile`·`spec-reconciler`·`/cook amend-plan`이 고립 모듈, 라우트/환경변수 불일치 및 `[SC-*]` 누락을 자동 보완)**, **웜 재사용(`send_message`)**을 지원합니다.
- **🛡️ 선택형(Opt-In) 슬림 Mode A 프리셋 `frontier-guardrails` (`< 2.5 KB` / `~600 tokens`)**: 자연어 트리거 없이(`naturalLanguageResearchTrigger = off`) 최대 `≤ 10`개 파일까지 프론티어 모델이 직접(`mode_a`) 주도하길 원한다면 `boomopen settings preset frontier-guardrails` 명령으로 `< 10ms` 만에 전환할 수 있으며(`carbon-guardrails` 하위 호환 별칭 지원), **실용적 2계층 코딩 표준**과 **엄격한 E2E 검증**은 그대로 유지됩니다.
- **🏛️ 멀티 세션 `/autopilot`, 다중 라운드 `/audit` (롤백 지원) & 멀티 엔진 위원회 `/conduct`**: 다중 명세서를 불변 원장 `.boomopen/project-ledger.json`(`boomopen ledger rollback` 지원)으로 수집해 4계층 품질 래칫(`boomopen check --strict-phase --no-stubs`)으로 완수합니다. 완료 후에는 **다중 라운드 프로젝트 감사(`/audit` / `boomopen audit`, `audit rollback` 지원)**가 RTM 명세 커버리지·UI→API→DB 수직 흐름·**2계층 유출 방지 보안 엔진 `security_scan.py` v6**을 검증하고 승인된 샤드 수정으로 결함 0건까지 수렴시킵니다.
- **📚 중복 제거된 1,462 스킬 볼트 (유휴 토큰 0)**: `~/.agents/skills_library`를 통해 모든 설치된 IDE 간 디스크 중복을 제거하고, `matrix-skills/compact-index.json` 기반 `O(1)` 2단계 조회로 `mcp-server` 및 `ai-agent-worker` 템플릿을 포함한 핵심 지식을 프롬프트 오염 없이 즉시 주입합니다.

---

<a id="architecture"></a>

## 🏗️ 스마트 하이브리드 아키텍처 (v5.5)

```mermaid
flowchart TD
    User["👤 사용자 요청 / 슬래시 명령"] --> Gate{"🚦 프리셋 & 스마트 복잡도 게이트"}
    Gate -->|"Mode A (smart-hybrid ≤ 2개 파일 | frontier-guardrails ≤ 10개)"| ModeA["⚡ Mode A: 직접 실행 (Tier 0)<br/>~600 tokens (< 2.5 KB) 슬림 가드레일 + 실용적 2계층 표준"]
    Gate -->|"명시적 /cmd, > 임계치 파일, 또는 17개 국어 NL Mode B"| ModeB["🎻 Mode B: 멀티 에이전트 오케스트레이터 (Tier 1)<br/>Model: inherit"]

    ModeB --> FanOut["🔀 1단계: DAG 병렬 팬아웃<br/>(researcher + scouter | debugger + researcher)"]
    FanOut --> Plan["📋 2단계: 계약 우선 설계 (planner)<br/>SHARED_CONTRACT + OWNED_FILES 잠금"]
    Plan --> Dispatch{"🎯 실행 변형 라우팅"}

    Dispatch -->|":fast / :hard"| Direct["⚡ 계획에서 엔지니어로 직접 병렬 디스패치<br/>(backend-engineer + frontend-engineer)"]
    Dispatch -->|":team"| Triangle["🔺 골든 트라이앵글 적대적 리뷰 팀<br/>(TechLead ⇄ Executor ⇄ Reviewer via MAILBOX)"]

    Direct --> Reconcile["🧩 Wave 2.5: spec-reconciler & boomopen reconcile<br/>docs/ 요구사항 대조 + /cook amend-plan 자동 보완"]
    Triangle --> Reconcile
    Reconcile --> Verify["🧪 4단계: 검증, PR 게이트 & 다중 라운드 /audit<br/>tester + reviewer → /pr & /audit → 무결점 수렴"]
```

---

<a id="pillars"></a>

## 🧠 v5.5의 6대 핵심 기둥 & 2026 네이티브 플랫폼 기능

1. **🌐 5대 플랫폼 완벽 통합 & 2026 네이티브 기능 (`platforms/*`)**:
   - **Antigravity (Gemini)**(`install antigravity --as-plugin` 네이티브 플러그인 패키징 & Python 동적 오케스트레이션 `run_workflow`), **Claude Code**(`/plan:hard` 심층 설계 + `PreCompact`/`Stop` 품질·연속성 훅 + `Bash|PowerShell` 명령 안전 가드), **OpenAI Codex**(스카우트·리뷰 역할용 `read-only` 샌드박싱 & TOML 에이전트 프로필), **Cursor**, **GitHub Copilot**을 단일 아키텍처로 통합합니다.
2. **📏 실용적 2계층 코딩 표준 (Pragmatic 2-Tier Coding Standards)**:
   - **Tier 1 — 엄격한 품질 및 안전 규칙 (무관용 원칙)**: 단일 책임 원칙, **명시적 `any` 절대 금지**, **프로덕션 내 디버그 `console.log` 방치 금지**, 비동기/API 경계 `try/catch` + 타입 에러 처리, `SCREAMING_SNAKE_CASE` 상수, DRY(`≥ 3`), 깔끔한 import 정렬.
   - **Tier 2 — 유연한 구조 가이드라인 (응집도 우선)**: 파일 길이 `~200–350줄`(소프트 `400줄` / 하드 `500줄` 분할; 테스트·타입·문서 제외), 함수 로직 `~20–40줄` / UI `~40–80줄` 권장.
3. **🎯 4단계 탄력적 스웜 샤딩 (`role#shard`) & Wave 2.5 자동 정합 (`spec-reconciler`)**:
   - `PLAN-{feature}.md` 생성 후 도메인 엔지니어 샤드(`<= 3–4 OWNED_FILES`)에 직접 디스패치하며, 세션 레지스트리(`role#shard → conversationId`) 기반 `send_message`로 **0초 웜 재사용**을 수행합니다. **Wave 2.5**에서는 `spec-reconciler`와 `boomopen reconcile`(`REC-G1..G4`)이 누락된 요구사항과 고립 모듈을 자동 보완합니다.
4. **🤝 계약 우선 병렬 디스패치, PR/릴리스 게이트 & 다중 라운드 `/audit` (v6)**:
   - `SHARED_CONTRACT` + `OWNED_FILES`로 쓰기 충돌을 방지하고, `/onboard`로 기존 저장소를 60초 만에 분석하며, `/pr`(`:review`)과 `/release`로 PR·시맨틱 릴리스 품질 게이트를 강제하고, `/audit`으로 2계층 유출 방지 보안 v6 감사를 수행합니다.
5. **🔍 5-Whys (SPIE v3.0) 근본 원인 디버깅 & 100% 깨끗한 Git 트리**:
   - `debugger`가 3대 가설과 5-Whys 인과 체인으로 원인을 추적하며, 임시 산출물(`PLAN`, `DEBUG`, `TEST`, `REVIEW`, `AUDIT`, `ARCHITECTURE-MAP`, `MAILBOX`)은 `<appDataDir>\brain\<conversation-id>\`(타 IDE는 `./reports/`)에 저장되어 Git 작업 트리를 깨끗하게 유지합니다.
6. **🩺 내장 14개 CLI 명령 스위트 & 중복 제거 O(1) 스킬 인덱스**:
   - `npm run doctor`는 5개 플랫폼 번들, **22개 에이전트**, **72개 팀 파일(18개 팀)**, **93개 명령 파일(36개 명령: 87개 워크플로우 + `_ref/` 6개)** 및 `~/.agents/skills_library` 공유 **`1,462`개 스킬**을 검증합니다. `research`, `design`, `plan`, `cook`, `reconcile`, `audit`(`audit rollback` 포함), `ledger`(`ledger rollback` 포함), `conduct`, `check`, `doctor`, `settings`, `install`(`--as-plugin` 포함), `uninstall`, `list` 등 **14개 CLI 명령**이 전 과정을 결정론적으로 검증합니다.

---

<a id="platforms"></a>

## 💻 지원되는 AI 플랫폼

| 플랫폼 | 지원 수준 | 글로벌 엔트리포인트 & 2026 네이티브 기능 | 프레임워크 설치 경로 |
|----------|:-------------:|-------------------|------------------------|
| **Antigravity (Gemini)** | ✅ 네이티브 v5.5 | `~/.gemini/GEMINI.md` (`--as-plugin` · `run_workflow` · `/goal`) | `~/.gemini/config/skills/boomopen-workflow-kit/` |
| **Claude Code** | ✅ 네이티브 v5.5 | `~/.claude/CLAUDE.md` (`PreCompact`/`Stop` 훅 & `Bash\|PowerShell` 가드) | `~/.claude/skills/boomopen-workflow-kit/` |
| **OpenAI Codex** | ✅ 네이티브 v5.5 | `~/.codex/CODEX.md` & `AGENTS.md` (`read-only` 샌드박싱 & TOML 역할) | `~/.codex/skills/boomopen-workflow-kit/` |
| **Cursor** | ✅ 네이티브 v5.5 | `~/.cursor/rules/boomopen-workflow-kit.mdc` (`< 2.5 KB` 슬림 룰) | `~/.cursor/skills/boomopen-workflow-kit/` |
| **GitHub Copilot** | ✅ 네이티브 v5.5 | `~/.copilot/COPILOT.md` (커스텀 에이전트 & 서브 에이전트 연동) | `~/.copilot/skills/boomopen-workflow-kit/` |

---

<a id="quickstart"></a>

## 🚀 빠른 시작 및 설치 방법

```bash
# 1. 저장소 클론
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro

# 2. 사용 중인 AI 어시스턴트에 맞게 설치 (~/.agents/skills_library로 스킬 볼트 자동 중복 제거)
npm run install:antigravity                        # Antigravity (Gemini) 표준 설치
node cli/install.js install antigravity --as-plugin # Antigravity 네이티브 플러그인 모드 설치
npm run install:claude                             # Claude Code (PreCompact/Stop 훅 & Bash|PowerShell 가드 포함)
npm run install:codex                              # OpenAI Codex (read-only 샌드박싱 구성 포함)
npm run install:cursor                             # Cursor
npm run install:copilot                            # GitHub Copilot
npm run install:all                                # 5개 플랫폼 전체 일괄 설치

# 3. 설치 검증 및 주요 14개 CLI 게이트 · 롤백 실행
npm run doctor
npm link
boomopen research validate path/to/RESEARCH.md
boomopen design validate path/to/DESIGN.md
boomopen plan validate path/to/PLAN.md
boomopen cook preflight path/to/PLAN.md
boomopen reconcile path/to/your/project --plan path/to/PLAN.md   # Wave 2.5 명세-코드 정합 (REC-G1..G4)
boomopen audit init --docs docs/prd.md,docs/arch.md              # 다중 라운드 프로젝트 감사 (audit rollback 지원)
boomopen check path/to/your/project --strict-phase --no-stubs    # 줄 수, any, console.log, 스텁 검사
boomopen ledger status                                           # 원장 상태 조회 (boomopen ledger rollback 지원)
boomopen conduct probe
```

> 이 키트는 **npm에 게시되지 않았습니다** — 반드시 이 저장소에서 설치하세요(`npm link`는 로컬 복제본을 PATH에 연결할 뿐 npm에서 내려받지 않습니다).

---

<a id="settings"></a>

## 🎛️ 통합 설정 및 5가지 원클릭 프리셋 (`/settings` 컨트롤 센터)

BoomOpen v5.5의 **제로 레이턴시 통합 컨트롤 센터**는 **5가지 원클릭 프리셋**(신규 설치 시 기본 권장 **`⚡ smart-hybrid`**)과 20개 열거형 설정(+ 줄 수 제한 2개 키)을 **5개 플랫폼** 전체에 `< 10ms`(AOT `<!-- BOOMOPEN-SETTINGS-START -->` 주입으로 첫 턴 지연 **0ms**)로 동기화합니다:

| 프리셋 (`Preset`) | 실행 모드 (`execution.mode`) | 기본 변형 | 자연어 트리거 (`naturalLanguageResearchTrigger`) | 코딩 표준 (`codingStandards`) | 권장 사용 환경 |
|:---|:---|:---:|:---:|:---:|:---|
| **⚡ `smart-hybrid`** *(기본 권장)* | **`auto`** (`≤ 2`개 파일 → Mode A 직접 실행; `> 2` 또는 `/cmd` → Mode B) | `auto` | **`auto_team`** *(`/research:team` / `/brainstorm:team` 자동 라우팅)* | `pragmatic` (`400/500`줄) | 신규 설치 기본값(`boomopen settings reset` 복원) — 5대 IDE 전체에서 17개 국어 자연어 워크플로우 라우팅 + 2개 파일 초과 시 턴-1 자동 스웜 샤딩 |
| **🛡️ `frontier-guardrails`** *(선택형 슬림 Mode A)* | **`mode_a`** (`≤ 10`개 파일 직접 실행, `< 2.5 KB` / `~600 tokens` 슬림 가드레일) | `auto` | **`off`** *(자연어 가로채기 없음 — 명시적 `/cmd` 입력 시에만 실행)* | `pragmatic` (`400/500`줄) | 선택형 슬림 `< 2.5 KB` (`~600 tokens`) 직접 Mode A 속도 + 엄격한 코드 표준 및 E2E 게이트 유지 (`carbon-guardrails` 하위 호환 별칭 지원) |
| **🚀 `solo-fast`** | **`mode_a`** *(서브 에이전트 없이 직접 고속 실행 강제)* | `fast` | `off` *(`/brainstorm` 입력 시에만 실행, 기본은 즉시 답변)* | `relaxed` (`600/800`줄) | 긴급 핫픽스, 빠른 프로토타이핑, 스크립트 및 토큰 절약 |
| **🧠 `deep-architect`** | **`mode_b`** *(모든 작업에 Mode B 멀티 에이전트 오케스트레이션 강제)* | `hard` | `auto_hard` *(`/research:hard` / `/brainstorm:hard` 5-렌즈 심층 리서치)* | `strict` (`300/400`줄) | 복잡한 시스템 아키텍처 설계, 신규 프로젝트 및 다중 도메인 리팩토링 |
| **🔺 `adversarial-team`** | **`team`** *(모든 워크플로우에 3-에이전트 `:team` 강제)* | `team` | **`auto_team`** *(`MAILBOX` 기반 3-에이전트 교차 검증)* | `strict` (`300/400`줄) | 미션 크리티컬 프로덕션 코드, 보안 감사 및 무결점 릴리스 |

> **💡 기본 `smart-hybrid`와 선택형 `frontier-guardrails` 비교**: 신규 설치 시(및 `boomopen settings reset` 실행 시) 기본 적용되는 **`smart-hybrid`**는 `≤ 2`개 파일의 소규모 수정을 즉시 직접 처리하면서, 다중 파일 개발이나 17개 국어 리서치·설계·감사 요청 시 턴 1에서 병렬 서브 에이전트를 자동 편성합니다. 자연어 트리거를 끄고(`naturalLanguageResearchTrigger = off`) 최대 `≤ 10`개 파일까지 단일 모델의 직접 실행(`mode_a`)을 원할 때는 `boomopen settings preset frontier-guardrails`로 **`< 2.5 KB` (`~600 tokens`) 슬림 Mode A**를 선택하세요(`carbon-guardrails` 하위 호환 별칭 완벽 지원).

### 모드 전환 및 설정 변경의 3가지 방법 (채팅 `/settings`, 웹 UI, CLI)

```bash
# 1. 채팅창 슬래시 명령어
/settings                                     # 대화형 선택 메뉴 열기 (ask_question UI)
/settings preset smart-hybrid                 # Smart-Hybrid 기본 권장 모드 (Auto Mode A/B + 17개 국어 NL 라우팅)
/settings preset frontier-guardrails          # 선택형 슬림 <2.5KB (~600 tokens) Mode A (별칭: carbon-guardrails)
/settings preset solo-fast                    # Mode A 단일 에이전트 고속 실행
/settings preset deep-architect               # Mode B 멀티 에이전트 오케스트레이터
/settings preset adversarial-team             # 골든 트라이앵글 3-에이전트 팀 (:team)
/settings mode auto | mode_a | mode_b | team  # 실행 모드 직접 지정

# 2. 로컬 웹 컨트롤 센터 (http://127.0.0.1:4567) 및 터미널 CLI
boomopen settings --ui
boomopen settings status                                  # 활성 설정 및 5대 플랫폼 동기화 상태 확인
boomopen settings preset smart-hybrid                     # 전역 기본 권장 smart-hybrid 적용 및 IDE 재동기화
boomopen settings preset frontier-guardrails              # 선택형 슬림 Mode A 프리셋으로 전환
cd path/to/your/project && boomopen settings set execution.mode mode_a --project
boomopen settings reset                                   # 기본 권장 smart-hybrid 설정으로 초기화
```

---

<a id="commands"></a>

## 🎯 슬래시 명령어 레퍼런스 (36개 명령 / 93개 파일: 87개 워크플로우 + 6개 `_ref/`)

| 명령어 | 변형 / 하위 명령 | 주요 목적 |
|---------|----------|-----------------|
| **`/onboard`** | — | **60초 브라운필드 아키텍처 매핑**: 기존 저장소의 기술 스택, 엔트리포인트, 데이터 흐름, 위험 핫스팟 및 빌드/테스트 게이트를 `ARCHITECTURE-MAP.md`로 요약 (`/init` 충돌 제로, 저장소 오염 제로) |
| **`/cook`** | `:fast`, `:hard`, `:team`, `amend-plan` | 엔드투엔드 기능 개발 (리서치 → 계획 → 병렬 코딩 → **Wave 2.5 `reconcile`** → 테스트 → 리뷰) |
| **`/code`** | `:fast`, `:hard`, `:team` | 기존 `PLAN-{feature}.md`를 기반으로 즉시 코드 구현 및 검증 수행 |
| **`/plan`** | `:fast`, `:hard`, `:team` | `SHARED_CONTRACT`, `OWNED_FILES` 및 Given/When/Then 기준을 포함한 구현 청사진 작성 (Claude Code `/plan:hard` 지원) |
| **`/fix`** | `:fast`, `:hard`, `:team` | 근본 원인 버그 수정 및 필수 회귀 테스트 검증 |
| **`/debug`** | `:fast`, `:hard`, `:team` | 3대 가설 검증 + **5-Whys (SPIE v3.0)** 근본 원인 조사 (`DEBUG-{issue}.md`) |
| **`/test`** | `:fast`, `:hard`, `:team` | DAG 병렬 팬아웃 테스트 실행 + 미적용 엣지 케이스 탐색 (`tester` + `scouter`) |
| **`/review`** | `:fast`, `:hard`, `:team` | 4방향 병렬 코드 감사 (아키텍처, 코드 품질, OWASP 보안, 성능) |
| **`/pr`** | `:review` (`/pr:review`) | **PR 사전 게이트 & 적대적 헝크 리뷰**: `check`·`reconcile`·변경분 테스트 통과 후 `gh pr create` 생성, 또는 `/pr:review`로 `gh pr view`/`gh pr diff`를 3각 병렬 감사 |
| **`/release`** | — | **시맨틱 릴리스 준비**: 이전 태그 이후 Conventional Commits 감사, `CHANGELOG.md` 합성, `doctor`/`check`/`test`/`test:pack` 검증 및 사용자 승인형 `gh release create` |
| **`/audit`** | `:run`, `:fix`, `:auto` | **다중 라운드 완료 후 프로젝트 감사**: RTM 명세 커버리지·수직 흐름·2계층 유출 방지 보안 v6 점검 및 승인 기반 샤드 수정 (`boomopen audit` / `audit rollback`) |
| **`/design`** | `:fast`, `:hard`, `:team` | 시스템 아키텍처, 데이터베이스 스키마 및 UI/UX 명세서 작성 (`DESIGN.md`) |
| **`/docs`** | `:core`, `:business`, `:audit` | 2계층 구조의 아키텍처 및 비즈니스 문서 생성·동기화 (`./documents/`) |
| **`/deploy`** | `:check`, `:preview`, `:production`, `:rollback` | 배포 전 준비 상태 점검, 프리뷰 환경, 프로덕션 롤아웃 및 안전 롤백 |
| **`/research`** | `:fast`, `:hard`, `:team` | 자율 딥 리서치 엔진 (4대 소스 삼각 검증, 3웨이브 검색 및 3벡터 위원회) |
| **`/brainstorm`** | `:fast`, `:hard`, `:team` | 소크라테스식 요구사항 탐색, 트레이드오프 분석 및 아이디어 도출 |
| **`/report`** | `:fast`, `:hard`, `:team` | 지표 및 다이어그램이 포함된 기술·경영 종합 보고서 생성 |
| **`/autopilot`** | `:init`, `:run`, `:audit` | `.boomopen/project-ledger.json`(`ledger rollback` 지원) 및 4계층 래칫 기반 다중 세션 자율 오케스트레이터 |
| **`/conduct`** | `:council`, `:pipeline` | 크로스 엔진 컨덕터 및 병렬 멀티 엔진 위원회 (`boomopen conduct`) |
| **`/orchestrate`** | — | 여러 도메인에 걸친 맞춤형 멀티 에이전트 파이프라인 오케스트레이션 |
| **`/settings`** | `preset`, `mode`, `set`, `ui` | 통합 컨트롤 센터: 5개 프리셋, 20개 열거형 + 2개 줄 제한 설정, 웹 UI(`--ui`) 실행 |
| **`/save` / `/recap`** | — | 세션 상태(`SESSION-HANDOVER.md`) 저장 및 `< 5초` 이내 복원 (그 외 `/ask`, `/status`, `/next` 등 총 36개 명령) |

---

## 🌙 대규모 다중 단계 야간 자율 구축 가이드 (`/autopilot` vs `/goal` + `/autopilot` + `/audit`)

- **플랫폼별 외부 루프 메커니즘**: **`/goal`**은 **Antigravity (Gemini) 네이티브 외부 루프**로서 컨텍스트가 ~70%에 도달해도 세션을 넘나들며 끝까지 구동합니다. 반면 **Claude Code 및 OpenAI Codex**에서는 **`/autopilot` + `Stop` / `PreCompact` 품질·연속성 훅**이 다중 세션 상태 인계와 끊김 없는 연속 실행을 담당합니다.

| 실행 방식 | 지속 범위 및 플랫폼 동작 | 원장 · 게이트 · 정합 · 감사 보장 | 적합한 상황 |
|:---|:---|:---|:---|
| **`/autopilot` (+ Claude/Codex 훅)** | 단일 세션 실행, 또는 Claude Code / Codex의 `Stop`·`PreCompact` 훅을 통한 자동 상태 압축 및 재개 | `.boomopen/project-ledger.json`(`ledger rollback` 지원), 5대 검증 게이트, Wave 2.5 정합 | 주간 단계별 개발 및 Claude Code / Codex 기반 다중 세션 자율 구축 |
| **`/goal` + `/autopilot` + `/audit`** *(Antigravity)* | **Antigravity의 `/goal`이 외부 루프로서 모든 단계 완료까지 야간에도 지속 구동** | 원장 추적 + **5대 게이트** + **Wave 2.5 `reconcile`** + 100% 완료 후 **1라운드 `/audit`**(`audit rollback` 지원) | Antigravity에서 `docs/` 다중 명세서 기반 야간 전체 프로젝트 무인 구축 |

**📋 바로 복사해 쓰는 야간 자율 구축 프롬프트 예시 (Antigravity는 앞에 `/goal` 포함, Claude Code / Codex는 `/autopilot`부터 실행):**

```text
/goal /autopilot `docs/` 폴더의 모든 명세 문서를 읽고 .boomopen/project-ledger.json을 초기화한 뒤,
승인된 초기 PLAN에 따라 모든 단계를 처음부터 끝까지 자율 구현하세요.
매 단계마다 5대 검증 게이트, Wave 2.5 boomopen reconcile, boomopen check --strict-phase --no-stubs를 100% 통과해야 합니다.
전체 단계 완료 후 1라운드 /audit을 실행하고 검토용 감사 보고서를 출력한 뒤 정지하세요.
```

---

<a id="agents"></a>

## 🤖 22명의 전문 에이전트 & 18개의 골든 트라이앵글 팀 (72개 파일)

| 카테고리 | 전문 에이전트 (`agents/*.md`) | 골든 트라이앵글 팀 (`agents/teams/*-team/`) |
|----------|-----------------------------------|------------------------------------------------|
| **엔지니어링 및 실행** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect`, `devops-engineer` | `backend-team`, `frontend-team`, `fullstack-team`, `mobile-team`, `game-team`, `database-team`, `devops-team` |
| **아키텍처 및 기획** | `tech-lead`, `planner`, `brainstormer`, `business-analyst`, `project-manager`, `designer` | `planning-team`, `brainstorm-team`, `project-team`, `design-team` |
| **품질, 보안 및 디버깅** | `debugger`, `tester`, `reviewer`, **`spec-reconciler`**, `security-engineer`, `performance-engineer` | `debug-team`, `qa-team`, `security-team`, `performance-team` |
| **리서치 및 지식 관리** | `researcher`, `scouter`, `docs-manager`, `reporter` | `research-team`, `docs-team`, `report-team` |

---

<a id="skills"></a>

## 📚 1,462 스킬 볼트 (22개 코어 + 1,440 라이브러리, `~/.agents/skills_library` 공유)

BoomOpen은 `1,462`개의 엔지니어링 스킬을 탑재하고 공유 볼트 `~/.agents/skills_library`로 IDE 간 중복을 제거하며, **2단계 O(1) 점진적 스킬 조회**(`<skills>` 코어 확인 → `matrix-skills/compact-index.json` 검색 → 필요한 `SKILL.md`만 온디맨드 로드)를 통해 **유휴 토큰 소모 0**을 달성합니다:

| 스킬 계층 / 도메인 | 개수 | 대표 2026 스킬 및 템플릿 | 로딩 메커니즘 |
|:---|:---:|:---|:---|
| **⚡ Tier 1: 코어 스킬 (`skills/`)** | **22** | `clean-code`, `debugger`, `plan-writing`, `brainstorming`, `frontend-design`, `frontend-architecture`, `design-spec`, `api-patterns`, `database-design`, `testing-patterns`, `skill-seeker` | `<skills>`에 사전 인덱싱되어 Turn 1 즉시 사용 |
| **🎨 UI/UX 크래프트, 모션 & 디자인 시스템** | **42** | Anti-AI-Slop Visual Craft, OKLCH 색공간 & Bento Grid, Motion v12 + CSS View Transitions, 헤드리스 프리미티브(`cmdk`/`vaul`/`sonner`), Figma MCP + W3C DTCG 토큰, WCAG 2.2 AA/AAA, iOS 18 HIG & Material 3 Expressive | `compact-index.json` 기반 온디맨드 로드 (`matrix-skills/design.yaml`) |
| **🌐 웹, 백엔드 & 엣지 데이터 스택** | **390+** | React 19 & Next.js 15, Tailwind v4, TanStack Start, Hono RPC + Zod OpenAPI, Rust Axum/Tokio/SQLx, Supabase RLS, Drizzle + Neon/Turso | `compact-index.json` 기반 온디맨드 로드 (`~/.agents/skills_library`) |
| **🤖 AI 에이전트 SDK, MCP & 데이터 엔지니어링** | **320+** | **`mcp-server` & `ai-agent-worker` 템플릿**, MCP FastMCP (`StreamableHTTP`), OpenAI/Claude Agents SDK, Google ADK, RAG, BigQuery, dbt | `compact-index.json` 기반 온디맨드 로드 (`~/.agents/skills_library`) |
| **☁️ 클라우드, DevOps, 테스팅 & 보안** | **300+** | Cloudflare Workers/D1/R2/Durable Objects, Terraform/OpenTofu, Docker/K8s GitOps, Vitest + MSW v2, Better Auth, OWASP LLM 2025 감사 | `compact-index.json` 기반 온디맨드 로드 (`~/.agents/skills_library`) |
| **📱 모바일, 게임 엔진 & 3D 웹** | **410+** | Unity 6 DOTS/ECS, Godot 4, WebGPU/WGSL & Three.js TSL, Colyseus Netcode, Tauri v2, SwiftUI, Kotlin, React Native, Flutter | `compact-index.json` 기반 온디맨드 로드 (`~/.agents/skills_library`) |

---

## 📂 저장소 구조

```text
BoomOpen-Workflow-Kit-Pro/
├── agents/                  # 22개 전문 에이전트 (spec-reconciler 포함) + 18개 팀 (54개 역할 + 18개 _team.md, 총 72개 파일)
├── cli/                     # 14개 CLI 명령: install (--as-plugin), doctor, checker, settings, research, design, plan, cook, reconcile, audit (rollback), ledger (rollback) & conductor
├── commands/                # 87개 워크플로우 (36개 슬래시 명령: /onboard, /pr, /pr:review, /release, /audit, /autopilot 등) + 6개 _ref/ (총 93개 파일)
├── documents/               # 2계층 아키텍처, 도메인, 소스 베이스 및 코딩 표준 문서
├── i18n/                    # 다국어 문서 디렉토리 (주요 16개 언어 전체 번역 README)
├── matrix-skills/           # 도메인별 YAML 스킬 매트릭스 + 사전 컴파일된 compact-index.json (1,462 스킬)
├── platforms/               # 5대 플랫폼 통합 템플릿 및 훅 (antigravity/, claude/, codex/, copilot/, cursor/)
├── rules/                   # Mode B 온디맨드 규칙 (CORE, PHASES, AGENTS, TEAMS, SKILLS, ERRORS, REFERENCE)
├── scripts/                 # Python 자동 검증 스크립트 (security_scan.py v6, checklist.py, verify_all.py 등)
├── skills/                  # 22개 코어 스킬 (clean-code, debugger, plan-writing, frontend-design 등)
├── skills_library/          # ~/.agents/skills_library로 중복 제거되는 1,440 전문 스킬 (mcp-server, ai-agent-worker 포함)
└── GEMINI.md | CLAUDE.md | CODEX.md | COPILOT.md | CURSOR.md | AGENT.md
```

---

## 📄 라이선스 및 보안

- **라이선스**: [MIT 라이선스](../LICENSE)에 따라 배포됩니다. Copyright © 2026 **BoomOpen Labs**. `skills_library/`의 서드파티 스킬은 원래 라이선스를 따릅니다. [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)를 참고하세요.
- **보안 정책**: 내장된 보안 가드레일 및 취약점 제보 절차는 [SECURITY.md](../SECURITY.md)를 참조하세요.
