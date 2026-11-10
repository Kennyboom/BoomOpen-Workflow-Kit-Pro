<div align="center">
  <h1>⚡ BoomOpen Workflow Kit v5.5.0</h1>
  <p><strong>Sistema Operativo IA Smart-Hybrid Multi-Piattaforma — 21 Agenti Specialisti, 18 Team Triangolo d&#39;Oro e Caveau di 1.460+ Competenze On-Demand</strong></p>

  <p>
    <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/releases"><img src="https://img.shields.io/badge/Version-5.5.0-7c3aed.svg" alt="Version: 5.5.0" /></a>
    <a href="#platforms"><img src="https://img.shields.io/badge/Platforms-Antigravity%20%7C%20Claude%20%7C%20Codex%20%7C%20Cursor%20%7C%20Copilot-0ea5e9.svg" alt="Platforms: 5 Unified" /></a>
    <a href="#agents"><img src="https://img.shields.io/badge/Agents-21%20Specialists%20%2B%2018%20Teams-10b981.svg" alt="Agents: 21 Specialists + 18 Teams" /></a>
    <a href="#skills"><img src="https://img.shields.io/badge/Skills-22%20Core%20%2B%201%2C440%20Library-f59e0b.svg" alt="Skills: 22 Core + 1,440 Library" /></a>
    <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-22c55e.svg" alt="Node.js: >=18.0.0" /></a>
    <a href="../LICENSE"><img src="https://img.shields.io/badge/License%20(kit%20code)-MIT-blue.svg" alt="License: MIT (kit code)" /></a>
  </p>

  <p>
    <a href="../README.md">🇬🇧 English</a> • <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> • <a href="./README.zh-CN.md">🇨🇳 简体中文</a> • <a href="./README.zh-TW.md">🇹🇼 繁體中文</a> • <a href="./README.ja.md">🇯🇵 日本語</a> • <a href="./README.ko.md">🇰🇷 한국어</a> • <a href="./README.es.md">🇪🇸 Español</a> • <a href="./README.fr.md">🇫🇷 Français</a> • <a href="./README.de.md">🇩🇪 Deutsch</a><br/>
    <a href="./README.pt-BR.md">🇧🇷 Português</a> • <a href="./README.ru.md">🇷🇺 Русский</a> • <a href="./README.hi.md">🇮🇳 हिन्दी</a> • <a href="./README.ar.md">🇸🇦 العربية</a> • <a href="./README.id.md">🇮🇩 Bahasa Indonesia</a> • <a href="./README.th.md">🇹🇭 ไทย</a> • <a href="./README.tr.md">🇹🇷 Türkçe</a> • <b>🇮🇹 Italiano</b>
  </p>
</div>

---

## 🎬 Trailer Ufficiale di Lancio (Full HD 1080p)

<div align="center">
  <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4">
    <img src="../assets/media/poster_en.png" alt="Guarda il Trailer Ufficiale di Lancio di BoomOpen Workflow Kit v5.5 (Full HD 1080p)" width="92%" />
  </a>
  <p>
    ▶️ <a href="https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/raw/main/assets/media/boomopen_v55_trailer_en.mp4"><b>Clicca qui per guardare / riprodurre il Trailer Ufficiale in Full HD 1080p (MP4 con voiceover da studio)</b></a>
  </p>
</div>

---

## 🌟 Cos’è BoomOpen Workflow Kit v5.5?

**BoomOpen Workflow Kit v5.5 (Multi-Platform Unified & Smart-Hybrid Edition)** è un sistema operativo multi-agente open-source che trasforma un singolo assistente di programmazione AI in un’organizzazione di ingegneria del software coordinata composta da **21 agenti specialisti**, **18 team avversari Golden Triangle**, **22 competenze chiave (Core Skills)** e **oltre 1.440 competenze specialistiche di libreria (`skills_library`)**.

A differenza dei template rigidi o dei wrapper pesanti che gonfiano il contesto a ogni turno, BoomOpen v5.5 combina un **Proactive Sub-agent First Gate**, **Routing in Linguaggio Naturale in 17 Lingue**, **Sharding Elastico dello Sciame a 4 Livelli (`role#shard`)**, **Autopilota Progetto Multi-Sessione (`/autopilot`)** e **Conduttore Multi-Motore (`/conduct`)**:
- **🚀 Sub-agenti Paralleli al Turno 1 e Orchestrazione Modalità B**: Esplorazione aperta del codice (`> 2` file), funzionalità multidominio (`≥ 2` domini), intenti di workflow in linguaggio naturale in **tutte le 17 lingue supportate** o comandi `/cmd` espliciti avviano subito shard paralleli (`role#shard`, `<= 3–4 OWNED_FILES`/shard) con **DAG Parallel Fan-Out**, **Direct Plan-to-Executor Dispatch**, **Blocchi File per Contratto (`SHARED_CONTRACT` + `OWNED_FILES`)** e **Riutilizzo a Caldo (`role#shard -> conversationId` tramite `send_message`)**, oltre a `/autopilot` (`boomopen ledger`) e ai consigli multi-motore `/conduct` (`boomopen conduct`).
- **⚡ Modalità A — Esecuzione Micro-Diretta su File Noti (Cold-Start 0s)**: Semplici Q&A, spiegazioni del codice e micro-modifiche in cui gli **esatti `≤ 2` file target sono già noti al Turno 1** (0 esplorazione, nessun `/cmd`) vengono eseguite, testate e verificate **direttamente** applicando gli **Standard di Codifica Pragmatici a 2 Livelli** e **Test e Risoluzione Persistente dei Bug**.

- **📚 Caveau Massivo di 1.462 Competenze a Zero Gonfiore di Contesto**: Unisce **22 Competenze Core (`skills/`)** e **1.440 Competenze Specialistiche (`skills_library/`)** precompilate in `matrix-skills/compact-index.json` per una ricerca `O(1)` in 2 passaggi — offrendo padronanza istantanea in Backend, Frontend, Mobile, Game Dev (Unity/Unreal/Godot), IA/ML, BigQuery/Data, Cloud/DevOps e Sicurezza OWASP senza appesantire la finestra di prompt.

---

## 🏗️ Architettura Smart-Hybrid (v5.5)

```mermaid
flowchart TD
    User["👤 Richiesta Utente / Comando Slash"] --> Gate{"🚦 Gate Intelligente a 2 Modalità"}
    Gate -->|"≤ 2 file, 1 dominio, nessun /cmd"| ModeA["⚡ Modalità A: Esecuzione Diretta (Tier 0)<br/>Avvio 0s + Standard Pragmatici a 2 Livelli"]
    Gate -->|"> 2 file, ≥ 2 domini, o /cmd"| ModeB["🎻 Modalità B: Orchestratore Multi-Agente (Tier 1)<br/>Model: inherit"]

    ModeB --> FanOut["🔀 Fase 1: DAG Parallel Fan-Out<br/>(researcher + scouter | debugger + researcher)"]
    FanOut --> Plan["📋 Fase 2: Pianificazione basata su Contratto (planner)<br/>Blocca SHARED_CONTRACT + OWNED_FILES"]
    Plan --> Dispatch{"🎯 Variante di Esecuzione"}

    Dispatch -->|":fast / :hard"| Direct["⚡ Smistamento Diretto dal Piano agli Ingegneri<br/>(backend-engineer + frontend-engineer in parallelo)"]
    Dispatch -->|":team"| Triangle["🔺 Team Avversario Golden Triangle<br/>(TechLead ⇄ Executor ⇄ Reviewer via MAILBOX)"]

    Direct --> Verify["🧪 Fase 4: Verifica e Riutilizzo Sessioni a Caldo<br/>tester + reviewer (ciclo send_message 0s)"]
    Triangle --> Verify
```

---

<a id="pillars"></a>

## 🧠 I 6 Pilastri Fondamentali della v5.5

1. **🌐 Parità Unificata su 5 Piattaforme (`platforms/*`)**:
   - Installazione nativa di prima classe per **Google Antigravity 2.0 (Gemini)**, **Claude Code**, **OpenAI Codex**, **Cursor** e **GitHub Copilot** da un’unica architettura unificata.
2. **📏 Standard di Codifica Pragmatici a 2 Livelli (Anti-Frammentazione)**:
   - **Livello 1 — Qualità e Sicurezza Rigorose (Tolleranza Zero)**: Singola Responsabilità (Single Responsibility), **VIETATO `any` esplicito**, **VIETATO lasciare `console.log` di debug** nel codice di produzione, gestione errori tipizzata con `try/catch` ai confini async/API, costanti in `SCREAMING_SNAKE_CASE`, DRY (`≥ 3`) e import ordinati.
   - **Livello 2 — Linee Guida Strutturali Flessibili (Coesione Prima del Taglio Meccanico)**: I file coesi puntano a `~200–350 righe` con un tetto flessibile di `~400–450 righe` (divisione obbligatoria solo oltre `>500 righe` o se mescolano più domini; test, tipi e docs sono esenti). Funzioni logiche `~20–40 righe` (`~40–80 righe` per UI/Handler).
3. **🎯 Sharding Elastico a 4 Livelli (`role#shard`), Smistamento Diretto dal Piano e Riutilizzo a Caldo (`send_message`)**:
   - Una volta creato `PLAN-{feature}.md`, l’Orchestratore assegna i task **direttamente** agli shard degli ingegneri di dominio (`backend-engineer#shard-1`, `frontend-engineer#shard-2`, `database-architect#shard-1`, `<= 3–4 OWNED_FILES`/shard) senza passaggi intermedi superflui tramite `tech-lead`.
   - I sub-agenti attivi vengono tracciati in un **Registro Sessioni per Shard (`role#shard → conversationId`)** e riutilizzati tramite `send_message` con **latenza di avvio 0s** e **100% del contesto file preservato**.
4. **🤝 Esecuzione Parallela basata su Contratto (`SHARED_CONTRACT` + `OWNED_FILES`)**:
   - I piani multidominio bloccano gli endpoint API, gli schemi DTO e la proprietà esclusiva di scrittura dei file (`OWNED_FILES` vs. `READ_ONLY_FILES`) prima di avviare gli ingegneri in parallelo, eliminando ogni conflitto di scrittura.
5. **🔍 Debugging della Causa Radice 5-Whys (SPIE v3.0) e Albero Git Pulito al 100%**:
   - `debugger` analizza ogni bug attraverso almeno 3 ipotesi classificate e una catena causale **5-Whys** (`Perché 1 Sintomo` → `Perché 5 Causa Radice Sistemica`). Gli artefatti temporanei (`PLAN`, `DEBUG`, `TEST`, `REVIEW`, `MAILBOX`) vengono salvati in `<appDataDir>\brain\<conversation-id>\` mantenendo l’albero di lavoro Git pulito al 100%.
6. **🩺 Diagnostica CLI Integrata (`research`, `design`, `plan`, `cook`, `ledger`, `conduct`, `check` & `doctor`) e Indice Competenze O(1)**:
   - `npm run doctor` convalida tutti i 5 pacchetti piattaforma, 21 agenti, 72 file di team, 84 file di comando (`79` workflow + `5` in `_ref/`) e `matrix-skills/compact-index.json` (`1.462` competenze indicizzate). `boomopen check <dir> [--strict-phase --no-stubs]` verifica lunghezza dei file, `any` esplicito in TypeScript, `console.log` dimenticati, commenti `TODO`/`FIXME` rimandati, stub vuoti e aggiramento dei test. Inoltre, `boomopen research`, `boomopen design`, `boomopen plan`, `boomopen cook`, `boomopen ledger` e `boomopen conduct` compilano contratti, pacchetti di handoff per ondata e consigli multi-motore.

---

<a id="platforms"></a>

## 💻 Piattaforme AI Supportate

| Piattaforma | Livello di Supporto | Entrypoint Globale | Percorso di Installazione del Framework |
|----------|:-------------:|-------------------|------------------------|
| **Antigravity (Gemini)** | ✅ Nativo v5.5 | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/boomopen-workflow-kit/` |
| **Claude Code** | ✅ Nativo v5.5 | `~/.claude/CLAUDE.md` | `~/.claude/skills/boomopen-workflow-kit/` |
| **OpenAI Codex** | ✅ Nativo v5.5 | `~/.codex/CODEX.md` & `AGENTS.md` | `~/.codex/skills/boomopen-workflow-kit/` |
| **Cursor** | ✅ Nativo v5.5 | `~/.cursor/rules/boomopen-workflow-kit.mdc` | `~/.cursor/skills/boomopen-workflow-kit/` |
| **GitHub Copilot** | ✅ Nativo v5.5 | `~/.copilot/COPILOT.md` | `~/.copilot/skills/boomopen-workflow-kit/` |

---

## 🚀 Avvio Rapido e Installazione

```bash
# 1. Clona il repository
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro

# 2. Installa per il tuo assistente di programmazione AI (scegline uno o --all)
npm run install:antigravity   # Google Antigravity 2.0 (Gemini)
npm run install:claude        # Anthropic Claude Code
npm run install:codex         # OpenAI Codex CLI
npm run install:cursor        # Cursor AI Editor
npm run install:copilot       # GitHub Copilot (VS Code)
npm run install:all           # Installa su tutte le 5 piattaforme contemporaneamente

# 3. Verifica l’installazione (sola lettura)
npm run doctor
npm link
boomopen research validate path/to/RESEARCH.md
boomopen design validate path/to/DESIGN.md
boomopen plan validate path/to/PLAN.md
boomopen cook preflight path/to/PLAN.md
boomopen check path/to/your/project --strict-phase --no-stubs
boomopen ledger status
boomopen conduct probe
```

> Il kit **non è pubblicato su npm**: installalo solo da questo repository. Facoltativo: `npm link` aggiunge il comando `boomopen` al tuo PATH (nessun download da npm).

---

## 🎛️ Impostazioni Unificate e Selezione Modalità (`/settings` Control Center)

BoomOpen v5.5 include un **Centro di Controllo Unificato a Latenza Zero** che permette di cambiare modalità di esecuzione (`auto`, `mode_a`, `mode_b`, `team`), 4 profili predefiniti e 20 impostazioni di sistema (+ 2 limiti di righe) su tutte le **5 piattaforme** in `< 10ms` (**0ms di latenza al Turno 1**):

| Profilo (`Preset`) | Modalità di Esecuzione (`execution.mode`) | Variante Predefinita | Ricerca in Linguaggio Naturale (`naturalLanguageResearchTrigger`) | Standard di Codice (`codingStandards`) | Utilizzo Ideale |
|:---|:---|:---:|:---:|:---:|:---|
| **⚡ `smart-hybrid`** *(Consigliato Predefinito)* | **`auto`** (`≤ 2 file` → Mode A Diretto; `> 2 file` o `/cmd` → Mode B) | `auto` | **`auto_team`** *(Indirizza automaticamente ricerca/ideazione a `/research:team` / `/brainstorm:team` Golden Triangle)* | `pragmatic` (`400/500` righe) | Sviluppo full-stack quotidiano: istantaneo sui piccoli task, profondo sulle architetture complesse |
| **🚀 `solo-fast`** | **`mode_a`** *(Forza l’esecuzione diretta in solitaria, 0s di latenza sub-agent)* | `fast` | `off` *(Risposta diretta in chat salvo digitazione di `/brainstorm`)* | `relaxed` (`600/800` righe) | Hotfix urgenti, prototipazione rapida, script e massimo risparmio di token |
| **🧠 `deep-architect`** | **`mode_b`** *(Forza l’Orchestratore Multi-Agente Mode B su ogni attività)* | `hard` | `auto_hard` *(Avvia automaticamente `/research:hard` / `/brainstorm:hard` a 5 lenti)* | `strict` (`300/400` righe) | Architettura di sistemi complessi, progetti greenfield e refactoring multi-dominio |
| **🔺 `adversarial-team`** | **`team`** *(Forza il team avversario a 3 agenti Golden Triangle `:team`)* | `team` | **`auto_team`** *(Dibattito e revisione incrociata a 3 agenti via `MAILBOX`)* | `strict` (`300/400` righe) | Codice di produzione mission-critical, audit di sicurezza e rilasci zero-defect |

### Tre Modi per Cambiare Modalità (Chat `/settings`, Dashboard Web Locale e CLI)

```bash
# 1. Comando Slash in Chat (Menu interattivo o comando rapido)
/settings                                     # Apri il menu interattivo (ask_question UI)
/settings preset smart-hybrid                 # Passa alla modalità predefinita consigliata (Auto Mode A/B + auto_team)
/settings preset solo-fast                    # Passa all’esecuzione diretta veloce (Mode A)
/settings preset deep-architect               # Passa all’Orchestratore Multi-Agente (Mode B)
/settings preset adversarial-team             # Passa al team Golden Triangle a 3 agenti (:team)
/settings mode auto | mode_a | mode_b | team  # Sovrascrivi direttamente la modalità di esecuzione

# 2. Dashboard Web Locale del Centro di Controllo (http://127.0.0.1:4567)
boomopen settings --ui

# 3. Terminale CLI (Globale ~/.boomopen/settings.json e Progetto ./.boomopen.json)
boomopen settings status
boomopen settings preset adversarial-team
cd path/to/your/project
boomopen settings set execution.mode mode_a --project
boomopen settings reset
```

> `--project` scrive sempre `./.boomopen.json` nella cartella da cui lo esegui: eseguilo nel tuo progetto, non nel clone del kit. Senza `npm link`, sostituisci `boomopen` con `node /path/to/BoomOpen-Workflow-Kit-Pro/cli/install.js`.

---

## 🎯 Riferimento Comandi Slash

| Comando | Varianti | Scopo Principale |
|---------|----------|-----------------|
| **`/cook`** | `:fast`, `:hard`, `:team` | Sviluppo completo di funzionalità end-to-end (Ricerca/Scout → Piano → Codice Parallelo → Test → Revisione) |
| **`/code`** | `:fast`, `:hard`, `:team` | Esegue l’implementazione direttamente a partire da un `PLAN-{feature}.md` esistente |
| **`/plan`** | `:fast`, `:hard`, `:team` | Crea blueprint di implementazione con `SHARED_CONTRACT`, `OWNED_FILES` e criteri Given/When/Then |
| **`/fix`** | `:fast`, `:hard`, `:team` | Risoluzione dei bug alla radice con verifica obbligatoria tramite test di regressione |
| **`/debug`** | `:fast`, `:hard`, `:team` | Indagine della causa radice con 3 ipotesi + catena causale **5-Whys (SPIE v3.0)** (`DEBUG-{issue}.md`) |
| **`/test`** | `:fast`, `:hard`, `:team` | Esecuzione parallela DAG delle suite di test + ricerca di casi limite non coperti (`tester` + `scouter`) |
| **`/review`** | `:fast`, `:hard`, `:team` | Audit parallelo a 4 dimensioni (Architettura, Qualità del Codice, Sicurezza OWASP, Prestazioni) |
| **`/design`** | `:fast`, `:hard`, `:team` | Architettura di sistema, schema del database e specifiche UI/UX (`DESIGN.md`) |
| **`/docs`** | `:core`, `:business`, `:audit` | Genera o sincronizza la documentazione strutturata a 2 livelli di architettura e business (`./documents/`) |
| **`/deploy`** | `:check`, `:preview`, `:production`, `:rollback` | Controlli pre-deploy, ambienti di anteprima, rilascio in produzione e rollback sicuro |
| **`/research`** | `:fast`, `:hard`, `:team` | Motore autonomo di ricerca approfondita (triangolazione a 4 fonti, ricerca a 3 ondate e consiglio a 3 vettori) |
| **`/brainstorm`** | `:fast`, `:hard`, `:team` | Scoperta socratica dei requisiti, analisi dei trade-off e ideazione |
| **`/report`** | `:fast`, `:hard`, `:team` | Report di sintesi esecutivi e tecnici completi di metriche e diagrammi |
| **`/autopilot`** | `:init`, `:run`, `:audit` | Orchestratore autonomo di progetti multi-sessione con `.boomopen/project-ledger.json` e controllo qualità a 4 livelli |
| **`/conduct`** | `:council`, `:pipeline` | Conduttore multi-motore e consiglio parallelo (`boomopen conduct`) con sintesi di consenso in 4 parti |
| **`/orchestrate`** | — | Orchestrazione personalizzata di pipeline multi-agente attraverso più domini |
| **`/settings`** | `preset`, `mode`, `set`, `ui` | Centro di Controllo Unificato: cambia `Auto` / `Mode A` / `Mode B` / `Team`, preset o apri Web UI (`--ui`) |
| **`/save` / `/recap`** | — | Salva lo stato della sessione (`SESSION-HANDOVER.md`) e ripristina l’intero contesto in `< 5s` |

---

<a id="agents"></a>

## 🤖 21 Agenti Specialisti e 18 Team Golden Triangle

| Categoria | Agenti Specialisti (`agents/*.md`) | Team Golden Triangle (`agents/teams/*-team/`) |
|----------|-----------------------------------|------------------------------------------------|
| **Ingegneria ed Esecuzione** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect`, `devops-engineer` | `backend-team`, `frontend-team`, `fullstack-team`, `mobile-team`, `game-team`, `database-team`, `devops-team` |
| **Architettura e Pianificazione** | `tech-lead`, `planner`, `brainstormer`, `business-analyst`, `project-manager`, `designer` | `planning-team`, `brainstorm-team`, `project-team`, `design-team` |
| **Qualità, Sicurezza e Debugging** | `debugger`, `tester`, `reviewer`, `security-engineer`, `performance-engineer` | `debug-team`, `qa-team`, `security-team`, `performance-team` |
| **Ricerca e Conoscenza** | `researcher`, `scouter`, `docs-manager`, `reporter` | `research-team`, `docs-team`, `report-team` |

---

<a id="skills"></a>

## 📚 Caveau di 1.460+ Competenze (22 Core + 1.440 di Libreria)

BoomOpen include uno dei più vasti ecosistemi open source di competenze ingegneristiche, progettato per **0 consumo di token a riposo** tramite **Risoluzione Progressiva O(1) in 2 Passaggi** (`<skills>` → `matrix-skills/compact-index.json` → caricamento mirato di `SKILL.md` su richiesta):

| Livello / Dominio di Competenza | Numero | Competenze e Capacità Rappresentative | Meccanismo di Caricamento |
|:---|:---:|:---|:---|
| **⚡ Livello 1: Competenze Core (`skills/`)** | **22** | `clean-code`, `debugger`, `plan-writing`, `brainstorming`, `frontend-design`, `frontend-architecture`, `design-spec`, `api-patterns`, `database-design`, `testing-patterns`, `skill-seeker` | Pre-indicizzato in `<skills>` per accesso istantaneo al Turno 1 |
| **🎨 Design UI/UX, Motion e Design System** | **42** | Anti-AI-Slop Visual Craft, palette OKLCH e Bento Grids, Motion v12 + CSS View Transitions, primitive headless (`cmdk`/`vaul`/`sonner`), Figma MCP + W3C DTCG Tokens, WCAG 2.2 AA/AAA, iOS 18 HIG e Material 3 Expressive | Su richiesta via `compact-index.json` (`matrix-skills/design.yaml`) |
| **🌐 Web, Backend e Sistemi Distribuiti** | **390+** | Next.js/React 19, FastAPI, NestJS, microservizi Go/Rust, GraphQL, gRPC, architettura event-driven Redis/Kafka, SaaS multi-tenant | Su richiesta via `compact-index.json` (`skills_library/`) |
| **🤖 IA, Agenti LLM e Data Engineering** | **320+** | Pipeline RAG, server LangGraph/MCP, prompt engineering, Vertex AI, analisi BigQuery, dbt, Spark, database vettoriali | Su richiesta via `compact-index.json` (`skills_library/`) |
| **☁️ Cloud, DevOps, Kubernetes e Sicurezza** | **300+** | Terraform/OpenTofu, architettura AWS/GCP/Azure, Docker/K8s GitOps, pipeline CI/CD, audit OWASP Top 10, autenticazione Zero-Trust | Su richiesta via `compact-index.json` (`skills_library/`) |
| **📱 Mobile, Game Engine e Domini Specializzati** | **410+** | iOS Swift/SwiftUI, Android Kotlin, React Native, Flutter, Unity 6, Unreal Engine 5, Godot 4, WebGL/Three.js, Finanza Quantitativa, Web3 | Su richiesta via `compact-index.json` (`skills_library/`) |

---

## 📂 Struttura del Repository

```text
BoomOpen-Workflow-Kit-Pro/
├── agents/                  # 21 definizioni di Agenti Specialisti + 18 Team Golden Triangle (54 file di ruolo + 18 _team.md, 72 file)
├── cli/                     # Installer (install.js), Doctor (doctor.js), Checker (checker.js), Settings (settings.js), research.js, design.js, plan.js, cook.js, Ledger (ledger.js) e Conductor (conductor.js)
├── commands/                # 79 workflow di comandi Slash (:fast, :hard, :team, :init/:run/:audit, :council/:pipeline) + 5 protocolli _ref/ (84 file)
├── documents/               # Documentazione a 2 livelli di Architettura, Dominio, Codice Sorgente e Standard
├── i18n/                    # Documentazione multilingue (16 traduzioni complete del README)
├── matrix-skills/           # Matrici YAML delle competenze per dominio + compact-index.json precompilato (1.462 competenze)
├── platforms/               # Template unificati per le 5 piattaforme (antigravity/, claude/, codex/, copilot/, cursor/)
├── rules/                   # Regole Modalità B caricate su richiesta (CORE, PHASES, AGENTS, TEAMS, SKILLS, ERRORS, REFERENCE)
├── scripts/                 # Script Python di automazione e verifica (checklist.py, verify_all.py, ecc.)
├── skills/                  # 22 Competenze Chiave (clean-code, debugger, plan-writing, frontend-design, ecc.)
├── skills_library/          # 1.440 competenze specialistiche caricate su richiesta tramite ricerca rapida in 2 passaggi
└── GEMINI.md | CLAUDE.md | CODEX.md | COPILOT.md | CURSOR.md | AGENT.md
```

---

## 📄 Licenza e Sicurezza

- **Licenza**: Distribuito sotto [Licenza MIT](../LICENSE). Copyright © 2026 **BoomOpen Labs**. Le skill di terze parti in `skills_library/` mantengono le loro licenze originali: vedi [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
- **Politica di Sicurezza**: Consulta [SECURITY.md](../SECURITY.md) per le protezioni di sicurezza integrate e le linee guida sulla segnalazione delle vulnerabilità.
