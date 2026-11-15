<div align="center">
  <h1>⚡ BoomOpen Workflow Kit v5.5.0</h1>
  <p><strong>Sistema Operacional de Força de Trabalho IA Smart-Hybrid Multiplataforma — 22 Agentes Especialistas, 18 Equipes Triângulo Dourado e Cofre de 1.460+ Habilidades Sob Demanda</strong></p>

  <p>
    <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/releases"><img src="https://img.shields.io/badge/Version-5.5.0-7c3aed.svg" alt="Version: 5.5.0" /></a>
    <a href="#platforms"><img src="https://img.shields.io/badge/Platforms-Antigravity%20%7C%20Claude%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot-0ea5e9.svg" alt="Platforms: 5 Unified" /></a>
    <a href="#agents"><img src="https://img.shields.io/badge/Agents-22%20Specialists%20%2B%2018%20Teams-10b981.svg" alt="Agents: 22 Specialists + 18 Teams" /></a>
    <a href="#skills"><img src="https://img.shields.io/badge/Skills-22%20Core%20%2B%201%2C440%20Library-f59e0b.svg" alt="Skills: 22 Core + 1,440 Library" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-22c55e.svg" alt="Node.js: >=18.0.0" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/License%20(kit%20code)-MIT-blue.svg" alt="License: MIT (kit code)" /></a>
  </p>

  <p>
    <a href="../README.md">🇬🇧 English</a> • <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> • <a href="./README.zh-CN.md">🇨🇳 简体中文</a> • <a href="./README.zh-TW.md">🇹🇼 繁體中文</a> • <a href="./README.ja.md">🇯🇵 日本語</a> • <a href="./README.ko.md">🇰🇷 한국어</a> • <a href="./README.es.md">🇪🇸 Español</a> • <a href="./README.fr.md">🇫🇷 Français</a> • <a href="./README.de.md">🇩🇪 Deutsch</a><br/>
    <b>🇧🇷 Português</b> • <a href="./README.ru.md">🇷🇺 Русский</a> • <a href="./README.hi.md">🇮🇳 हिन्दी</a> • <a href="./README.ar.md">🇸🇦 العربية</a> • <a href="./README.id.md">🇮🇩 Bahasa Indonesia</a> • <a href="./README.th.md">🇹🇭 ไทย</a> • <a href="./README.tr.md">🇹🇷 Türkçe</a> • <a href="./README.it.md">🇮🇹 Italiano</a>
  </p>
</div>

---

## 🎬 Trailer Oficial de Lançamento (Full HD 1080p)

<div align="center">
  <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4">
    <img src="../assets/media/poster_en.png" alt="Assistir ao Trailer Oficial de Lançamento do BoomOpen Workflow Kit v5.5 (Full HD 1080p)" width="92%" />
  </a>
  <p>
    ▶️ <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4"><b>Clique aqui para assistir / transmitir o Trailer Oficial em Full HD 1080p (MP4 com narração de estúdio)</b></a>
  </p>
</div>

---

## 🌟 O que é o BoomOpen Workflow Kit v5.5?

**BoomOpen Workflow Kit v5.5 (Multi-Platform Unified & Smart-Hybrid Edition)** é um sistema operacional multi-agente de código aberto que transforma um único assistente de programação IA em uma organização de engenharia coordenada composta por **22 agentes especialistas**, **18 equipes adversárias Golden Triangle (`72` arquivos de equipe)**, **33 comandos slash (`89` arquivos de comando e referência)**, **14 comandos CLI**, **22 habilidades principais (Core Skills)** e **1.440 habilidades especializadas (`skills_library/`)**.

Ao contrário de templates rígidos ou wrappers pesados que adicionam latência e inchaço de contexto a cada turno, o BoomOpen v5.5 combina o **Portão Proativo de Sub-agentes no Turno 1**, **Roteamento em Linguagem Natural em 17 Idiomas**, **Fragmentação Elástica de Enxame em 4 Níveis (`role#shard`)**, **Reconciliação Automática Spec-to-Code Wave 2.5 (`boomopen reconcile`)**, **Auditoria Pós-Conclusão Multi-Rodada (`/audit` & `boomopen audit`)**, **Autopiloto Multi-Sessão (`/autopilot`)** e **Condutor Multi-Engine (`/conduct`)**:
- **🚀 Sub-agentes Paralelos no Turno 1, Wave 2.5 e Orquestração Modo B**: Exploração aberta (`> 2` arquivos), funcionalidades multidomínio (`≥ 2` domínios), intenções de fluxo em **todos os 17 idiomas suportados** ou comandos `/cmd` explícitos disparam imediatamente shards paralelos (`role#shard`, `<= 3–4 OWNED_FILES`/shard) com **Fan-Out Paralelo DAG**, **Despacho Direto do Plano ao Executor**, **Bloqueios por Contrato (`SHARED_CONTRACT` + `OWNED_FILES`)**, **Reconciliação Automática Wave 2.5 (`boomopen reconcile` + `spec-reconciler` + `/cook amend-plan`)** e **Reutilização a Quente (`role#shard -> conversationId` via `send_message`)**.
- **🏛️ Autopiloto Multi-Sessão (`/autopilot`), Auditoria Multi-Rodada (`/audit`) e Conselho Multi-Engine (`/conduct`)**: Ingestão de especificações em `.boomopen/project-ledger.json` com proteção SHA-256 e trava em 4 camadas (`boomopen check --strict-phase --no-stubs`); auditorias completas pós-conclusão em múltiplas rodadas (`/audit` → `/audit:fix` → `/audit:round2` via `.boomopen/audit-ledger.json`) com cobertura RTM, fluxo vertical UI→API→DB e Motor de Segurança Anti-Vazamento de 2 Camadas (`security_scan.py` v6).
- **⚡ Modo A — Execução Micro-Direta em Alvos Conhecidos (0s de Cold-Start)**: Perguntas simples, explicações e microedições em que os **exatos `≤ 2` arquivos-alvo já são conhecidos no Turno 1** executam diretamente aplicando os **Padrões Pragmáticos de 2 Níveis** e **Testes e Correção Persistente de Bugs**.
- **📚 Cofre Massivo de 1.462 Habilidades com Zero Inchaço de Contexto**: Combina **22 Habilidades Principais (`skills/`)** e **1.440 Habilidades de Biblioteca (`skills_library/`)** pré-compiladas em `matrix-skills/compact-index.json` para busca `O(1)` em 2 etapas sem poluir a janela de prompt.

---

## 🏗️ Arquitetura Híbrida-Inteligente (v5.5)

```mermaid
flowchart TD
    User["👤 Solicitação do Usuário / Comando Slash"] --> Gate{"🚦 Portão Inteligente de 2 Modos"}
    Gate -->|"≤ 2 arquivos, 1 domínio, sem /cmd"| ModeA["⚡ Modo A: Execução Direta (Tier 0)<br/>0s Cold-Start + Padrões Pragmáticos 2 Níveis"]
    Gate -->|"> 2 arquivos, ≥ 2 domínios, ou /cmd"| ModeB["🎻 Modo B: Orquestrador Multi-Agente (Tier 1)<br/>Model: inherit"]

    ModeB --> FanOut["🔀 Fase 1: Fan-Out Paralelo DAG<br/>(researcher + scouter | debugger + researcher)"]
    FanOut --> Plan["📋 Fase 2: Planejamento por Contrato (planner)<br/>Bloqueia SHARED_CONTRACT + OWNED_FILES"]
    Plan --> Dispatch{"🎯 Variante de Execução"}

    Dispatch -->|":fast / :hard"| Direct["⚡ Despacho Direto Plano para Engenheiro<br/>(backend-engineer + frontend-engineer em paralelo)"]
    Dispatch -->|":team"| Triangle["🔺 Equipe Adversária Golden Triangle<br/>(TechLead ⇄ Executor ⇄ Reviewer via MAILBOX)"]

    Direct --> Verify["🧪 Fase 4: Reconciliação Wave 2.5 & Verificação<br/>spec-reconciler + tester + reviewer (loop 0s)"]
    Triangle --> Verify
```

---

<a id="pillars"></a>

## 🧠 Os 6 Pilares Principais da v5.5

1. **🌐 Paridade Unificada em 5 Plataformas (`platforms/*`)**:
   - Instalação nativa de primeira classe para **Google Antigravity 2.0 (Gemini)**, **Claude Code**, **OpenAI Codex**, **Cursor** e **GitHub Copilot** a partir de uma arquitetura unificada.
2. **📏 Padrões de Codificação Pragmáticos de 2 Níveis (Anti-Fragmentação)**:
   - **Nível 1 — Tolerância Zero**: Responsabilidade Única, **PROIBIDO `any` explícito**, **PROIBIDO deixar `console.log` de depuração**, `try/catch` + erros tipados em fronteiras async/API, constantes `SCREAMING_SNAKE_CASE`, DRY (`≥ 3`) e imports organizados.
   - **Nível 2 — Diretrizes Estruturais Flexíveis**: Arquivos coesos visam `~200–350 linhas` com teto flexível `400` e split rígido `>500 linhas` (testes, tipos e docs isentos). Funções lógicas `~20–40 linhas` (`~40–80` para UI/Handlers).
3. **🎯 Fragmentação Elástica em 4 Níveis (`role#shard`), Despacho Direto e Reutilização a Quente (`send_message`)**:
   - Com `PLAN-{feature}.md` pronto, o Orquestrador despacha **diretamente** para shards de domínio (`<= 3–4 OWNED_FILES` cada) sem salto redundante pelo `tech-lead`, reutilizando sessões via `role#shard → conversationId` com **0s de cold-start**.
4. **🤝 Despacho Paralelo por Contrato (`SHARED_CONTRACT` + `OWNED_FILES`) & Wave 2.5 (`spec-reconciler`)**:
   - Trava endpoints, DTOs e posse exclusiva de arquivos antes do código paralelo; na **Wave 2.5**, `boomopen reconcile` + `spec-reconciler` + `/cook amend-plan` verificam `docs/` vs. código real, detectando módulos-ilha, divergências de rota/env e lacunas `[SC-*]` antes de fechar a fase.
5. **🔍 Depuração 5-Whys (SPIE v3.0), Auditoria Multi-Rodada (`/audit`) & Git 100% Limpo**:
   - `debugger` investiga 3 hipóteses + cadeia **5-Whys**; `/audit` executa rodadas progressivas com o Motor de Segurança Anti-Vazamento de 2 Camadas (`security_scan.py` v6). Artefatos transitórios vão para `<appDataDir>\brain\<conversation-id>\`.
6. **🩺 Suíte CLI Completa de 14 Comandos & Índice O(1)**:
   - `npm run doctor` valida 5 plataformas, **22 agentes**, **72 arquivos de equipe** (18 pastas), **89 arquivos de comando** (`83` fluxos + `6` em `_ref/`) e `compact-index.json` (`1.462` habilidades). Os 14 comandos (`research`, `design`, `plan`, `cook`, `reconcile`, `audit`, `ledger`, `conduct`, `check`, `doctor`, `settings`, `install`, `uninstall`, `list`) garantem compilação determinística e portões rigorosos.

---

## 🔍 Reconciliação Automática Wave 2.5 & Auditoria Multi-Rodada (`/audit`)

- **🔄 Wave 2.5 — Reconciliação Automática Spec-to-Code (`boomopen reconcile` + `spec-reconciler` + `/cook amend-plan`)**: Antes de encerrar qualquer fase ou onda, o `spec-reconciler` cruza os requisitos de `docs/` e `PLAN` com o código implementado (`REC-G1..G4`), identificando requisitos `[SC-*]` ausentes, shards desconectados ("ilhas") e paridade de rotas/variáveis de ambiente, gerando correções via `/cook amend-plan` para preencher tudo o que faltar.
- **🛡️ Auditoria Pós-Conclusão Multi-Rodada (`/audit`) & Motor Anti-Vazamento de 2 Camadas v6**:
  1. **Rodada 1 (`/audit` ou `/autopilot:audit`)**: Auditoria completa somente leitura (cobertura RTM de especificações, fluxo vertical UI→API→DB e varredura estática + semântica do `security_scan.py` v6 contra vazamentos de segredos/PII/injeção).
  2. **Revisão Humana**: Você revisa o relatório `AUDIT-{project}-r1.md` e aprova o escopo de correção.
  3. **Correção & Rodada 2 (`/audit:fix` → `/audit:round2`)**: Shards sem colisão corrigem os itens aprovados com travas de regressão e disparam `/audit:round2` em loop até atingir **0 achados** em `.boomopen/audit-ledger.json`.

---

<a id="platforms"></a>

## 💻 Plataformas de IA Suportadas

| Plataforma | Nível de Suporte | Ponto de Entrada Global | Caminho de Instalação do Framework |
|----------|:-------------:|-------------------|------------------------|
| **Antigravity (Gemini)** | ✅ Nativo v5.5 | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/boomopen-workflow-kit/` |
| **Claude Code** | ✅ Nativo v5.5 | `~/.claude/CLAUDE.md` | `~/.claude/skills/boomopen-workflow-kit/` |
| **OpenAI Codex** | ✅ Nativo v5.5 | `~/.codex/CODEX.md` & `AGENTS.md` | `~/.codex/skills/boomopen-workflow-kit/` |
| **Cursor** | ✅ Nativo v5.5 | `~/.cursor/rules/boomopen-workflow-kit.mdc` | `~/.cursor/skills/boomopen-workflow-kit/` |
| **GitHub Copilot** | ✅ Nativo v5.5 | `~/.copilot/COPILOT.md` | `~/.copilot/skills/boomopen-workflow-kit/` |

---

## 🚀 Início Rápido e Instalação

```bash
# 1. Clonar e instalar para seu assistente (ou --all para as 5 plataformas)
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
npm run install:antigravity   # ou: install:claude | install:codex | install:cursor | install:copilot | install:all

# 2. Verificar a instalação e usar a suíte CLI de 14 comandos
npm run doctor
npm link
boomopen research validate path/to/RESEARCH.md
boomopen design validate path/to/DESIGN.md
boomopen plan validate path/to/PLAN.md
boomopen cook preflight path/to/PLAN.md
boomopen reconcile path/to/your/project --plan path/to/PLAN.md
boomopen audit init --docs docs/prd.md,docs/arch.md
boomopen check path/to/your/project --strict-phase --no-stubs
boomopen ledger status
boomopen conduct probe
```

> O kit **não está publicado no npm** — instale-o somente a partir deste repositório (`npm link` adiciona `boomopen` ao seu PATH). Para remover: `boomopen uninstall <tool>`.

---

## 🎛️ Configurações Unificadas e 5 Perfis Predefinidos (`/settings`)

O BoomOpen v5.5 gerencia **20 configurações enum + 2 limites de linhas** nas **5 plataformas** em `< 10ms` (**0ms de latência no Turno 1**), agora com **5 perfis de um clique**:

| Perfil (`Preset`) | Modo (`execution.mode`) | Variante Padrão | Gatilho NL (`naturalLanguageResearchTrigger`) | Padrões de Código | Melhor Uso |
|:---|:---|:---:|:---:|:---:|:---|
| **⚡ `smart-hybrid`** *(Padrão)* | **`auto`** (`≤ 2 arquivos` → Mode A; `> 2` ou `/cmd` → Mode B) | `auto` | **`auto_team`** *(Roteia pesquisa/ideação NL para `/research:team` / `/brainstorm:team`)* | `pragmatic` (`400/500`) | Engenharia full-stack diária: ágil em edições pequenas, profundo em arquiteturas |
| **🛡️ `carbon-guardrails`** | **`mode_a`** *(Antigravity Carbon lidera diretamente até `≤ 10 arquivos`)* | `auto` | `off` *(Zero sequestro de NL; workflows BoomOpen apenas com `/cmd` explícito)* | `pragmatic` (`400/500`) | Deixar o **Antigravity Orchestrator Carbon** conduzir exploração/edições diárias enquanto o BoomOpen impõe regras 400/500 linhas, `strict_e2e` e guardrails `/cmd` |
| **🚀 `solo-fast`** | **`mode_a`** *(Execução solo direta, 0s de sub-agente)* | `fast` | `off` *(Resposta direta no chat salvo `/brainstorm`)* | `relaxed` (`600/800`) | Hotfixes urgentes, prototipagem rápida, scripts e economia de tokens |
| **🧠 `deep-architect`** | **`mode_b`** *(Orquestrador Multi-Agente em toda tarefa)* | `hard` | `auto_hard` *(Executa `/research:hard` / `/brainstorm:hard` de 5 lentes)* | `strict` (`300/400`) | Arquitetura complexa, projetos greenfield e refatorações multi-domínio |
| **🔺 `adversarial-team`** | **`team`** *(Equipe Golden Triangle de 3 agentes `:team`)* | `team` | **`auto_team`** *(Debate e revisão adversária via `MAILBOX`)* | `strict` (`300/400`) | Produção crítica, auditorias de segurança e entregas zero-defeitos |

```bash
# No Chat (/settings) | Painel Web (boomopen settings --ui) | Terminal CLI
/settings                                     # Menu interativo (ask_question UI)
/settings preset carbon-guardrails            # Ativar modo Carbon dirige + Guardrails BoomOpen
/settings preset smart-hybrid                 # Padrão Smart-Hybrid
/settings mode auto | mode_a | mode_b | team  # Substituir modo de execução diretamente
boomopen settings preset carbon-guardrails    # Aplicar globalmente e sincronizar 5 plataformas
boomopen settings set execution.mode mode_a --project   # Escreve ./.boomopen.json no projeto atual
```

---

## 🌙 Guia Noturno para Projetos Grandes Multi-Fase (`/autopilot` vs `/goal` + `/autopilot` + `/audit`)

| Estratégia | Escopo de Sessão e Contexto | Controle de Plano e Qualidade | Melhor Cenário |
|:---|:---|:---|:---|
| **`/autopilot` isolado** | Sessão única — encerra de forma limpa perto de **~70% do contexto** e **pausa aguardando aprovação do `PLAN` inicial** | Mantém `.boomopen/project-ledger.json`, 5 portões, Wave 2.5 `reconcile` e `/audit`, exigindo retomada manual por fase | Tarefas médias ou execução assistida fase a fase com revisão humana em cada etapa |
| **`/goal` + `/autopilot` + `/audit`** *(Recomendado à noite)* | **`/goal` impulsiona automaticamente múltiplas fases durante a noite** entre renovações de contexto sem parar na metade | O `/autopilot` garante rastreio imutável no `project-ledger.json`, 5 portões de qualidade, reconciliação Wave 2.5 (`reconcile`) e **Rodada 1 do `/audit`** ao final | Projetos grandes multi-documento executados de forma autônoma durante a noite até a auditoria completa |

**Prompt pronto para copiar (execução noturna):**

```text
/goal Construa todo o projeto de ponta a ponta a partir das especificações em docs/ usando /autopilot.
Inicialize e mantenha .boomopen/project-ledger.json, aprove e execute o PLAN por fases sem pular requisitos,
rode a reconciliação Wave 2.5 (boomopen reconcile) e os portões de verificação ao final de cada fase
e, após concluir todas as fases, execute a Rodada 1 de /audit para gerar o relatório completo para revisão pela manhã.
```

---

## 🎯 Referência de Comandos Slash (33 Comandos / 89 Arquivos)

| Comando | Variantes | Propósito Principal |
|---------|----------|-----------------|
| **`/cook`** | `:fast`, `:hard`, `:team`, `amend-plan` | Desenvolvimento completo ponta a ponta (Pesquisa/Scout → Plano → Código Paralelo → Wave 2.5 → Revisão) |
| **`/code`** | `:fast`, `:hard`, `:team` | Executar implementação diretamente a partir de um `PLAN-{feature}.md` existente |
| **`/plan`** | `:fast`, `:hard`, `:team` | Criar blueprints com `SHARED_CONTRACT`, `OWNED_FILES` e critérios Given/When/Then |
| **`/fix`** | `:fast`, `:hard`, `:team` | Resolução de bugs na causa raiz com verificação obrigatória por teste de regressão |
| **`/debug`** | `:fast`, `:hard`, `:team` | Investigação com 3 hipóteses + cadeia causal **5-Whys (SPIE v3.0)** (`DEBUG-{issue}.md`) |
| **`/test`** | `:fast`, `:hard`, `:team` | Execução paralela DAG de testes + busca de casos de borda (`tester` + `scouter`) |
| **`/review`** | `:fast`, `:hard`, `:team` | Auditoria paralela em 4 dimensões (Arquitetura, Qualidade, Segurança OWASP, Performance) |
| **`/audit`** | `:run`, `:fix`, `:round2`, `:auto` | Auditoria pós-conclusão multi-rodada (RTM, fluxo UI→API→DB, Anti-Vazamento 2 Camadas v6, correções via `/audit:fix` e re-auditoria `/audit:round2` até 0 achados) |
| **`/design`** | `:fast`, `:hard`, `:team` | Arquitetura de sistema, esquema de banco de dados e especificação UI/UX (`DESIGN.md`) |
| **`/docs`** | `:core`, `:business`, `:audit` | Gerar ou sincronizar documentação estruturada de arquitetura e negócios (`./documents/`) |
| **`/deploy`** | `:check`, `:preview`, `:production`, `:rollback` | Portões pré-deploy, ambientes de preview, rollout em produção e rollback seguro |
| **`/research`** | `:fast`, `:hard`, `:team` | Motor autônomo de pesquisa profunda (triangulação de 4 fontes, 3 ondas e conselho 3 vetores) |
| **`/brainstorm`** | `:fast`, `:hard`, `:team` | Descoberta socrática de requisitos, análise de trade-offs e ideação |
| **`/report`** | `:fast`, `:hard`, `:team` | Relatórios executivos e técnicos de síntese com métricas e diagramas |
| **`/autopilot`** | `:init`, `:run`, `:audit` | Orquestrador autônomo multi-sessão via `.boomopen/project-ledger.json` e trava de 4 camadas |
| **`/conduct`** | `:council`, `:pipeline` | Maestro multi-engine e conselho paralelo (`boomopen conduct`) com síntese em 4 partes |
| **`/orchestrate`** | — | Orquestração personalizada de pipelines multi-agente através de múltiplos domínios |
| **`/settings`** | `preset`, `mode`, `set`, `ui` | Centro de Controle Unificado: 20 chaves + 2 limites, **5 presets**, ou Web UI (`--ui`) |
| **`/save` / `/recap`** | — | Persistir estado da sessão (`SESSION-HANDOVER.md`) e restaurar contexto completo em `< 5s` |

---

<a id="agents"></a>

## 🤖 22 Agentes Especialistas e 18 Equipes Golden Triangle (`72` Arquivos)

| Categoria | Agentes Especialistas (`agents/*.md`) | Equipes Golden Triangle (`agents/teams/*-team/`) |
|----------|-----------------------------------|------------------------------------------------|
| **Engenharia e Execução** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect`, `devops-engineer` | `backend-team`, `frontend-team`, `fullstack-team`, `mobile-team`, `game-team`, `database-team`, `devops-team` |
| **Arquitetura e Planejamento** | `tech-lead`, `planner`, `brainstormer`, `business-analyst`, `project-manager`, `designer` | `planning-team`, `brainstorm-team`, `project-team`, `design-team` |
| **Qualidade, Segurança e Depuração** | `debugger`, `tester`, `reviewer`, **`spec-reconciler`**, `security-engineer`, `performance-engineer` | `debug-team`, `qa-team`, `security-team`, `performance-team` |
| **Pesquisa e Conhecimento** | `researcher`, `scouter`, `docs-manager`, `reporter` | `research-team`, `docs-team`, `report-team` |

---

<a id="skills"></a>

## 📚 Cofre de 1.462 Habilidades (22 Principais + 1.440 de Biblioteca)

Projetado para **0 consumo de tokens em repouso** via **Resolução Progressiva O(1) em 2 Etapas** (`<skills>` → `matrix-skills/compact-index.json` → `SKILL.md` sob demanda):

| Domínio de Habilidade | Quantidade | Capacidades Representativas | Carregamento |
|:---|:---:|:---|:---|
| **⚡ Nível 1: Principais (`skills/`)** | **22** | `clean-code`, `debugger`, `plan-writing`, `brainstorming`, `frontend-design`, `design-spec`, `api-patterns`, `database-design`, `testing-patterns`, `skill-seeker` | Pré-indexado em `<skills>` |
| **🎨 Design UI/UX & Motion** | **42** | Anti-AI-Slop Craft, OKLCH, Bento Grids, Motion v12, Figma MCP + W3C DTCG, WCAG 2.2 AA/AAA, iOS 18 HIG & Material 3 | `compact-index.json` |
| **🌐 Web, Backend & Edge** | **390+** | React 19, Next.js 15, Tailwind v4, TanStack, Hono RPC + Zod OpenAPI, Rust Axum, Supabase RLS, Drizzle + Neon/Turso | `skills_library/` |
| **🤖 IA, Agentes LLM & Dados** | **320+** | FastMCP 2025, OpenAI/Claude/Google ADK, Vercel AI SDK v4, RAG, BigQuery, dbt, Spark | `skills_library/` |
| **☁️ Cloud, DevOps & Segurança** | **300+** | Cloudflare Workers/D1/R2, Terraform/OpenTofu, Docker/K8s, Vitest + MSW v2, Better Auth, OWASP LLM 2025 | `skills_library/` |
| **📱 Mobile, Games & 3D Web** | **410+** | Unity 6 DOTS, Godot 4, WebGPU/Three.js TSL, Colyseus, Tauri v2, SwiftUI, Kotlin, React Native, Flutter | `skills_library/` |

---

## 📂 Estrutura do Repositório

```text
BoomOpen-Workflow-Kit-Pro/
├── agents/                  # 22 Agentes Especialistas (incl. spec-reconciler) + 18 Equipes (72 arquivos)
├── cli/                     # 14 comandos CLI: install, doctor, checker, settings, research, design, plan, cook, reconcile, audit, ledger & conductor
├── commands/                # 83 fluxos de comandos Slash (33 comandos) + 6 protocolos _ref/ (89 arquivos)
├── documents/               # Documentação de 2 níveis (Arquitetura, Domínio, Código-Fonte e Padrões)
├── i18n/                    # 16 traduções completas do README
├── matrix-skills/           # Matrizes YAML + compact-index.json pré-compilado (1.462 habilidades)
├── platforms/               # Templates unificados para 5 plataformas (antigravity/, claude/, codex/, copilot/, cursor/)
├── rules/                   # Regras sob demanda do Modo B (CORE, PHASES, AGENTS, TEAMS, SKILLS, ERRORS, REFERENCE)
├── scripts/                 # Scripts Python de automação e verificação (checklist.py, verify_all.py, etc.)
├── skills/                  # 22 Habilidades Principais
├── skills_library/          # 1.440 habilidades especializadas carregadas sob demanda
└── GEMINI.md | CLAUDE.md | CODEX.md | COPILOT.md | CURSOR.md | AGENT.md
```

---

## 📄 Licença e Segurança

- **Licença**: Distribuído sob a [Licença MIT](../LICENSE). Copyright © 2026 **BoomOpen Labs**. Skills de terceiros em `skills_library/` mantêm suas licenças originais — veja [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
- **Política de Segurança**: Veja [SECURITY.md](../SECURITY.md) para diretrizes de segurança integradas e relato de vulnerabilidades.
