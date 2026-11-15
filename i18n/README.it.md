<div align="center">
  <h1>⚡ BoomOpen Workflow Kit v5.5.0</h1>
  <p><strong>Sistema Operativo IA Smart-Hybrid Multi-Piattaforma — 22 Agenti Specialisti, 18 Team Triangolo d&#39;Oro e Caveau di 1.460+ Competenze On-Demand</strong></p>

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

**BoomOpen Workflow Kit v5.5 (Multi-Platform Unified & Smart-Hybrid Edition)** è un sistema operativo multi-agente open-source che trasforma un singolo assistente di programmazione AI in un’organizzazione di ingegneria del software coordinata composta da **22 agenti specialisti** (incluso `spec-reconciler`), **18 team avversari Golden Triangle (`72` file di team)**, **33 comandi slash (`89` file di workflow e protocollo)**, **14 comandi CLI**, **22 competenze chiave (`skills/`)** e **1.440 competenze specialistiche (`skills_library/`)** (**1.462** competenze indicizzate su **5 piattaforme**).

A differenza dei template rigidi o dei wrapper pesanti che gonfiano il contesto a ogni turno, BoomOpen v5.5 combina **Proactive Sub-agent First Gate al Turno 1**, **Routing in Linguaggio Naturale in 17 Lingue**, **Sharding Elastico dello Sciame a 4 Livelli (`role#shard`)**, **Auto-Riconciliazione Spec-to-Code Wave 2.5 (`boomopen reconcile`)**, **Audit Multi-Round Post-Completamento (`/audit`) con Motore di Sicurezza Anti-Leakage a 2 Livelli v6**, **Autopilota Progetto Multi-Sessione (`/autopilot`)** e **Conduttore Multi-Motore (`/conduct`)**:
- **🚀 Sub-agenti Paralleli al Turno 1, Riconciliazione Wave 2.5 e Orchestrazione Modalità B**: Esplorazione aperta del codice (`> 2` file), funzionalità multidominio (`≥ 2` domini), intenti in linguaggio naturale in **tutte le 17 lingue** o `/cmd` espliciti avviano subito shard paralleli (`role#shard`, `<= 3–4 OWNED_FILES`/shard) con **DAG Parallel Fan-Out**, **Direct Plan-to-Executor Dispatch**, **Blocchi File per Contratto (`SHARED_CONTRACT` + `OWNED_FILES`)**, **Auto-Riconciliazione Wave 2.5 (`boomopen reconcile` + `spec-reconciler` + `/cook amend-plan` per rilevare moduli isolati, parità route/`.env` e omissioni `[SC-*]`)** e **Riutilizzo a Caldo (`send_message`)**.
- **🏛️ Autopilota Multi-Sessione (`/autopilot`), Audit Multi-Round (`/audit`) e Consiglio Multi-Motore (`/conduct`)**: Compila specifiche multi-documento in `.boomopen/project-ledger.json` con guardie SHA-256 e ratchet di qualità a 4 livelli (`boomopen check --strict-phase --no-stubs`); esegue audit completi post-completamento (`/audit` e `/autopilot:audit` → `.boomopen/audit-ledger.json`) con ciclo **Round 1 → revisione utente → `/audit:fix` → `/audit:round2`** su copertura RTM, flussi verticali UI→API→DB e **Sicurezza Anti-Leakage a 2 Livelli v6 (`security_scan.py` v6)**; oppure orchestra più CLI AI in parallelo con `/conduct`.
- **⚡ Modalità A — Esecuzione Micro-Diretta su File Noti (Cold-Start 0s)**: Semplici Q&A e micro-modifiche con file target noti al Turno 1 vengono eseguite e verificate **direttamente** applicando gli **Standard di Codifica Pragmatici a 2 Livelli** e **Test e Risoluzione Persistente dei Bug**.
- **📚 Caveau di 1.462 Competenze a Zero Gonfiore di Contesto**: Precompilato in `matrix-skills/compact-index.json` per una ricerca `O(1)` in 2 passaggi — offrendo padronanza istantanea in Backend, Frontend, Mobile, Game Dev, IA/ML, Cloud/DevOps e Sicurezza OWASP senza appesantire il prompt.

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

    Direct --> Reconcile["🔄 Wave 2.5: spec-reconciler & boomopen reconcile<br/>Moduli isolati, parità route/.env & /cook amend-plan"]
    Triangle --> Reconcile
    Reconcile --> Verify["🧪 Fase 4: Verifica, /audit Multi-Round & Riutilizzo a Caldo<br/>tester + reviewer (ciclo send_message 0s)"]
```

---

<a id="pillars"></a>

## 🧠 I 6 Pilastri Fondamentali della v5.5

1. **🌐 Parità Unificata su 5 Piattaforme (`platforms/*`)**:
   - Installazione nativa di prima classe per **Antigravity (Gemini)**, **Claude Code**, **OpenAI Codex**, **Cursor** e **GitHub Copilot** da un’unica architettura unificata.
2. **📏 Standard di Codifica Pragmatici a 2 Livelli (Anti-Frammentazione)**:
   - **Livello 1 (Tolleranza Zero)**: Singola Responsabilità, **VIETATO `any` esplicito**, **VIETATO lasciare `console.log` di debug**, `try/catch` + errori tipizzati ai confini async/API, costanti `SCREAMING_SNAKE_CASE`, DRY (`≥ 3`) e import ordinati.
   - **Livello 2 (Coesione Prima di Tutto)**: File mirati a `~200–350 righe` con tetto flessibile `~400–450 righe` (divisione obbligatoria solo oltre `>500 righe` o più domini; test/tipi/docs esenti). Funzioni `~20–40 righe` (`~40–80 righe` per UI/Handler).
3. **🎯 Sharding Elastico a 4 Livelli (`role#shard`), Smistamento Diretto e Riutilizzo a Caldo (`send_message`)**:
   - Creato `PLAN-{feature}.md`, i task vengono assegnati **direttamente** agli shard ingegneristici (`<= 3–4 OWNED_FILES`/shard) e riutilizzati via `send_message` con **0s di latenza** e **100% del contesto preservato**.
4. **🤝 Esecuzione Parallela basata su Contratto (`SHARED_CONTRACT` + `OWNED_FILES`) e Riconciliazione Wave 2.5**:
   - API/DTO e proprietà dei file vengono bloccati prima del codice parallelo; poi Wave 2.5 esegue `boomopen reconcile` + `spec-reconciler` (`REC-G1..G4`) per intercettare moduli isolati, discrepanze route/`.env` e clausole `[SC-*]` omesse generando delta wave con `/cook amend-plan`.
5. **🔍 5-Whys (SPIE v3.0), `/audit` Multi-Round e Sicurezza Anti-Leakage a 2 Livelli v6**:
   - `debugger` traccia 3 ipotesi + 5-Whys; post-completamento `/audit` (`R1` spec e flussi → approvazione utente → `/audit:fix` → `/audit:round2` sicurezza & TX/Perf) integra `security_scan.py` v6 (AuthZ/IDOR in ingresso + PII/stacktrace/leak DB client in uscita) mantenendo l’albero Git pulito al 100% tramite `<appDataDir>\brain\<conversation-id>\`.
6. **🩺 Suite CLI Integrata a 14 Comandi (`research`, `design`, `plan`, `cook`, `reconcile`, `audit`, `ledger`, `conduct`, `check`, `doctor`, `settings`, `install`, `uninstall`, `list`)**:
   - `npm run doctor` verifica 5 piattaforme, **22 agenti**, **18 team (`72` file di team)**, **33 comandi (`89` file = `83` workflow + `6` `_ref/`)** e `matrix-skills/compact-index.json` (`1.462` competenze); `boomopen reconcile`, `boomopen audit`, `boomopen check --strict-phase --no-stubs`, `boomopen ledger` e `boomopen conduct` applicano gate deterministici sull’intero ciclo di vita.

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

# 3. Verifica l’installazione ed esegui i 14 comandi CLI
npm run doctor
npm link
boomopen research validate path/to/RESEARCH.md
boomopen design validate path/to/DESIGN.md
boomopen plan validate path/to/PLAN.md
boomopen cook preflight path/to/PLAN.md
boomopen reconcile path/to/your/project --plan path/to/PLAN.md   # Riconciliazione Wave 2.5 (REC-G1..G4)
boomopen audit init --docs docs/prd.md,docs/arch.md              # Inizializza registro audit multi-round
boomopen check path/to/your/project --strict-phase --no-stubs
boomopen ledger status
boomopen conduct probe
```

> Il kit **non è pubblicato su npm**: installalo solo da questo repository. Facoltativo: `npm link` aggiunge il comando `boomopen` al tuo PATH (nessun download da npm).

---

## 🎛️ Impostazioni Unificate e Selezione Modalità (`/settings` Control Center)

BoomOpen v5.5 include un **Centro di Controllo Unificato a Latenza Zero** per gestire modalità di esecuzione, **5 profili predefiniti (Preset)** e 20 impostazioni (+ 2 limiti di righe) su tutte le **5 piattaforme** in `< 10ms` (**0ms di latenza al Turno 1**):

| Profilo (`Preset`) | Modalità di Esecuzione (`execution.mode`) | Variante Predefinita | Ricerca in Linguaggio Naturale (`naturalLanguageResearchTrigger`) | Standard di Codice (`codingStandards`) | Utilizzo Ideale |
|:---|:---|:---:|:---:|:---:|:---|
| **⚡ `smart-hybrid`** *(Consigliato Predefinito)* | **`auto`** (`≤ 2 file` → Mode A; `> 2 file` o `/cmd` → Mode B) | `auto` | **`auto_team`** *(Indirizza ricerca/ideazione a `/research:team` / `/brainstorm:team`)* | `pragmatic` (`400/500` righe) | Sviluppo full-stack quotidiano: istantaneo sui piccoli task, profondo sulle architetture complesse |
| **🛡️ `carbon-guardrails`** | **`mode_a`** *(Fino a `≤ 10 file` diretti: Antigravity/Carbon guida i task quotidiani, BoomOpen applica `strict_e2e`)* | `auto` | `off` *(Solo `/cmd` espliciti — zero intercettazioni in linguaggio naturale)* | `pragmatic` (`400/500` righe) | Utenti Antigravity 2.0 che vogliono velocità diretta con gate CLI e verifica `strict_e2e` |
| **🚀 `solo-fast`** | **`mode_a`** *(Forza l’esecuzione diretta in solitaria, 0s di latenza sub-agent)* | `fast` | `off` *(Risposta diretta in chat salvo digitazione di `/brainstorm`)* | `relaxed` (`600/800` righe) | Hotfix urgenti, prototipazione rapida, script e massimo risparmio di token |
| **🧠 `deep-architect`** | **`mode_b`** *(Forza l’Orchestratore Multi-Agente Mode B su ogni attività)* | `hard` | `auto_hard` *(Avvia automaticamente `/research:hard` / `/brainstorm:hard`)* | `strict` (`300/400` righe) | Architettura di sistemi complessi, progetti greenfield e refactoring multi-dominio |
| **🔺 `adversarial-team`** | **`team`** *(Forza il team avversario a 3 agenti Golden Triangle `:team`)* | `team` | **`auto_team`** *(Dibattito e revisione incrociata a 3 agenti via `MAILBOX`)* | `strict` (`300/400` righe) | Codice di produzione mission-critical, audit di sicurezza e rilasci zero-defect |

### Tre Modi per Cambiare Modalità (Chat `/settings`, Dashboard Web Locale e CLI)

```bash
# 1. Comando Slash in Chat (Menu interattivo o comando rapido)
/settings                                     # Apri il menu interattivo (ask_question UI)
/settings preset smart-hybrid                 # Passa alla modalità predefinita consigliata (Auto Mode A/B + auto_team)
/settings preset carbon-guardrails            # Passa a Carbon Guardrails (Mode A ≤10 file + strict_e2e)
/settings preset solo-fast                    # Passa all’esecuzione diretta veloce (Mode A)
/settings preset deep-architect               # Passa all’Orchestratore Multi-Agente (Mode B)
/settings preset adversarial-team             # Passa al team Golden Triangle a 3 agenti (:team)
/settings mode auto | mode_a | mode_b | team  # Sovrascrivi direttamente la modalità di esecuzione

# 2. Dashboard Web Locale del Centro di Controllo (http://127.0.0.1:4567)
boomopen settings --ui

# 3. Terminale CLI (Globale ~/.boomopen/settings.json e Progetto ./.boomopen.json)
boomopen settings status
boomopen settings preset carbon-guardrails
cd path/to/your/project
boomopen settings set execution.mode mode_a --project
boomopen settings reset
```

> `--project` scrive sempre `./.boomopen.json` nella cartella da cui lo esegui: eseguilo nel tuo progetto, non nel clone del kit. Senza `npm link`, sostituisci `boomopen` con `node /path/to/BoomOpen-Workflow-Kit-Pro/cli/install.js`.

---

## 🌙 Guida Notturna per Grandi Progetti Multi-Fase (`/autopilot` vs `/goal` + `/autopilot` + `/audit`)

Quando costruisci grandi progetti da più documenti di specifica (`docs/`), scegli la strategia più adatta:

| Aspetto | `/autopilot` (Singolo) | `/goal` + `/autopilot` + `/audit` *(Consigliato per Esecuzioni Notturne)* |
|:---|:---|:---|
| **Ingestione & Registro** | Compila `docs/` in `project-ledger.json` + `PLAN` con controlli SHA-256 | Stesso registro e `PLAN`, ma `/goal` impedisce all’agente di fermarsi prima del completamento totale |
| **Persistenza Notturna** | Avanza per fase o sessione, ideale per checkpoint interattivi | Progettato per sessioni notturne continue: esegue `reconcile` e test fino al 100% di `project-ledger.json` |
| **Verifica Post-Completamento** | Applica `check --strict-phase` e `/autopilot:audit` a fine fase | Chiude con il ciclo `/audit` completo (Round 1 → report per approvazione → `/audit:fix` → `/audit:round2` + Sicurezza v6) |
| **Controllo Umano** | Può richiedere conferme tra una fase e l’altra | Costruisce tutto di notte e si ferma al mattino sul gate `/audit` per la tua revisione prima di modificare il codice |

### Prompt Pronto da Copiare per Progetti Notturni Multi-Fase

```text
/goal Usa /autopilot per leggere tutte le specifiche in docs/ e completare il progetto in tutte le sue fasi:
1. Inizializza e verifica project-ledger.json e i piani PLAN assicurando una copertura del 100% dei requisiti.
2. Implementa ogni fase con shard paralleli, esegui test reali e verifica il Wave 2.5 con reconcile + spec-reconciler al termine di ogni fase.
3. Al completamento di tutte le fasi, esegui /audit (Round 1 + Sicurezza v6) e presenta tutti i risultati nel report in attesa della mia approvazione prima di applicare modifiche.
```

---

## 🎯 Riferimento Comandi Slash (33 Comandi / 89 File)

| Comando | Varianti | Scopo Principale |
|---------|----------|-----------------|
| **`/cook`** | `:fast`, `:hard`, `:team`, `amend-plan` | Sviluppo completo end-to-end (Ricerca/Scout → Piano → Codice Parallelo → Wave 2.5 `reconcile` → Test → Revisione) |
| **`/code`** | `:fast`, `:hard`, `:team` | Esegue l’implementazione direttamente a partire da un `PLAN-{feature}.md` esistente |
| **`/plan`** | `:fast`, `:hard`, `:team` | Crea blueprint di implementazione con `SHARED_CONTRACT`, `OWNED_FILES` e criteri Given/When/Then |
| **`/fix`** | `:fast`, `:hard`, `:team` | Risoluzione dei bug alla radice con verifica obbligatoria tramite test di regressione |
| **`/debug`** | `:fast`, `:hard`, `:team` | Indagine della causa radice con 3 ipotesi + catena causale **5-Whys (SPIE v3.0)** (`DEBUG-{issue}.md`) |
| **`/test`** | `:fast`, `:hard`, `:team` | Esecuzione parallela DAG delle suite di test + ricerca di casi limite non coperti (`tester` + `scouter`) |
| **`/review`** | `:fast`, `:hard`, `:team` | Audit parallelo a 4 dimensioni (Architettura, Qualità del Codice, Sicurezza OWASP, Prestazioni) |
| **`/audit`** | `:run`, `:round2`, `:fix`, `:auto` | Audit multi-round post-completamento: Round 1 → revisione utente → `/audit:fix` → `/audit:round2` (Sicurezza a 2 Livelli v6, RTM e flussi verticali) |
| **`/design`** | `:fast`, `:hard`, `:team` | Architettura di sistema, schema del database e specifiche UI/UX (`DESIGN.md`) |
| **`/docs`** | `:core`, `:business`, `:audit` | Genera o sincronizza la documentazione strutturata a 2 livelli di architettura e business (`./documents/`) |
| **`/deploy`** | `:check`, `:preview`, `:production`, `:rollback` | Controlli pre-deploy, ambienti di anteprima, rilascio in produzione e rollback sicuro |
| **`/research`** | `:fast`, `:hard`, `:team` | Motore autonomo di ricerca approfondita (triangolazione a 4 fonti, ricerca a 3 ondate e consiglio a 3 vettori) |
| **`/brainstorm`** | `:fast`, `:hard`, `:team` | Scoperta socratica dei requisiti, analisi dei trade-off e ideazione |
| **`/report`** | `:fast`, `:hard`, `:team` | Report di sintesi esecutivi e tecnici completi di metriche e diagrammi |
| **`/autopilot`** | `:init`, `:run`, `:audit` | Orchestratore autonomo multi-sessione con `.boomopen/project-ledger.json`, ratchet a 4 livelli e `/autopilot:audit` |
| **`/conduct`** | `:council`, `:pipeline` | Conduttore multi-motore e consiglio parallelo (`boomopen conduct`) con sintesi di consenso in 4 parti |
| **`/orchestrate`** | — | Orchestrazione personalizzata di pipeline multi-agente attraverso più domini |
| **`/settings`** | `preset`, `mode`, `set`, `ui` | Centro di Controllo Unificato: cambia modalità, scegli tra **5 preset** (`carbon-guardrails` ecc.) o apri Web UI (`--ui`) |
| **`/save` / `/recap`** | — | Salva lo stato della sessione (`SESSION-HANDOVER.md`) e ripristina l’intero contesto in `< 5s` |

---

<a id="agents"></a>

## 🤖 22 Agenti Specialisti e 18 Team Golden Triangle

| Categoria | Agenti Specialisti (`agents/*.md`) | Team Golden Triangle (`agents/teams/*-team/`) |
|----------|-----------------------------------|------------------------------------------------|
| **Ingegneria ed Esecuzione** | `backend-engineer`, `frontend-engineer`, `mobile-engineer`, `game-engineer`, `database-architect`, `devops-engineer` | `backend-team`, `frontend-team`, `fullstack-team`, `mobile-team`, `game-team`, `database-team`, `devops-team` |
| **Architettura e Pianificazione** | `tech-lead`, `planner`, `brainstormer`, `business-analyst`, `project-manager`, `designer` | `planning-team`, `brainstorm-team`, `project-team`, `design-team` |
| **Qualità, Sicurezza, Debug & Riconciliazione** | `debugger`, `tester`, `reviewer`, `spec-reconciler`, `security-engineer`, `performance-engineer` | `debug-team`, `qa-team`, `security-team`, `performance-team` |
| **Ricerca e Conoscenza** | `researcher`, `scouter`, `docs-manager`, `reporter` | `research-team`, `docs-team`, `report-team` |

---

<a id="skills"></a>

## 📚 Caveau di 1.460+ Competenze (22 Core + 1.440 di Libreria)

BoomOpen include **1.462 competenze indicizzate** progettate per **0 consumo di token a riposo** tramite **Risoluzione Progressiva O(1) in 2 Passaggi** (`<skills>` → `matrix-skills/compact-index.json` → caricamento mirato di `SKILL.md` su richiesta):

| Livello / Dominio di Competenza | Numero | Competenze e Capacità Rappresentative | Meccanismo di Caricamento |
|:---|:---:|:---|:---|
| **⚡ Livello 1: Competenze Core (`skills/`)** | **22** | `clean-code`, `debugger`, `plan-writing`, `brainstorming`, `frontend-design`, `frontend-architecture`, `design-spec`, `api-patterns`, `database-design`, `testing-patterns`, `skill-seeker` | Pre-indicizzato in `<skills>` per accesso istantaneo al Turno 1 |
| **🎨 Design UI/UX, Motion e Design System** | **42** | Anti-AI-Slop Visual Craft, palette OKLCH e Bento Grids, Motion v12 + CSS View Transitions, primitive headless (`cmdk`/`vaul`/`sonner`), Figma MCP + W3C DTCG Tokens, WCAG 2.2 AA/AAA, iOS 18 HIG e Material 3 Expressive | Su richiesta via `compact-index.json` (`matrix-skills/design.yaml`) |
| **🌐 Web, Backend e Sistemi Distribuiti** | **390+** | Next.js/React 19, FastAPI, NestJS, microservizi Go/Rust, GraphQL, gRPC, architettura event-driven Redis/Kafka, SaaS multi-tenant | Su richiesta via `compact-index.json` (`skills_library/`) |
| **🤖 IA, Agenti LLM e Data Engineering** | **320+** | Pipeline RAG, server LangGraph/MCP, prompt engineering, Vertex AI, analisi BigQuery, dbt, Spark, database vettoriali | Su richiesta via `compact-index.json` (`skills_library/`) |
| **☁️ Cloud, DevOps, Kubernetes e Sicurezza** | **300+** | Terraform/OpenTofu, architettura AWS/GCP/Azure, Docker/K8s GitOps, pipeline CI/CD, Sicurezza a 2 Livelli v6 e OWASP Top 10, auth Zero-Trust | Su richiesta via `compact-index.json` (`skills_library/`) |
| **📱 Mobile, Game Engine e Domini Specializzati** | **410+** | iOS Swift/SwiftUI, Android Kotlin, React Native, Flutter, Unity 6, Unreal Engine 5, Godot 4, WebGL/Three.js, Finanza Quantitativa, Web3 | Su richiesta via `compact-index.json` (`skills_library/`) |

---

## 📂 Struttura del Repository

```text
BoomOpen-Workflow-Kit-Pro/
├── agents/                  # 22 Agenti Specialisti + 18 Team Golden Triangle (54 file di ruolo + 18 _team.md = 72 file)
├── cli/                     # Suite CLI a 14 Comandi: install.js, doctor.js, checker.js, settings.js, research.js, design.js, plan.js, cook.js, reconcile.js, audit.js, ledger.js & conductor.js
├── commands/                # 33 comandi Slash (83 workflow: :fast, :hard, :team, :run/:fix/:auto, :init/:run/:audit, :council/:pipeline) + 6 protocolli _ref/ (89 file)
├── documents/               # Documentazione a 2 livelli di Architettura, Dominio, Codice Sorgente e Standard
├── i18n/                    # Documentazione multilingue (16 traduzioni complete del README)
├── matrix-skills/           # Matrici YAML delle competenze per dominio + compact-index.json precompilato (1.462 competenze)
├── platforms/               # Template unificati per le 5 piattaforme (antigravity/, claude/, codex/, copilot/, cursor/)
├── rules/                   # Regole Modalità B caricate su richiesta (CORE, PHASES, AGENTS, TEAMS, SKILLS, ERRORS, REFERENCE)
├── scripts/                 # Script Python di automazione e verifica (checklist.py, verify_all.py, security_scan.py, ecc.)
├── skills/                  # 22 Competenze Chiave (clean-code, debugger, plan-writing, frontend-design, ecc.)
├── skills_library/          # 1.440 competenze specialistiche caricate su richiesta tramite ricerca rapida in 2 passaggi
└── GEMINI.md | CLAUDE.md | CODEX.md | COPILOT.md | CURSOR.md | AGENT.md
```

---

## 📄 Licenza e Sicurezza

- **Licenza**: Distribuito sotto [Licenza MIT](../LICENSE). Copyright © 2026 **BoomOpen Labs**. Le skill di terze parti in `skills_library/` mantengono le loro licenze originali: vedi [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
- **Politica di Sicurezza**: Consulta [SECURITY.md](../SECURITY.md) per le protezioni di sicurezza integrate e le linee guida sulla segnalazione delle vulnerabilità.
