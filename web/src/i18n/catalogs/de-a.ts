import type { CatalogPackPartA } from '../types'

export const catalogPartA: CatalogPackPartA = {
  locale: 'de',
  platforms: {
    antigravity: '21-zeilige frontier-guardrails in GEMINI.md, paralleles Fan-out via invoke_subagent und Python run_workflow, persistenter /goal-Runner, --as-plugin-Modus, optionale --with-hooks, Brain-Artefakte und gemeinsames ~/.agents/skills_library.',
    claude: '21-zeilige frontier-guardrails in CLAUDE.md, parallele Task/Agent-Shards, /plan:hard ohne Kollision mit nativem /plan, optionale --with-hooks (PreToolUse, Stop, PreCompact), 93 Befehlsdateien, 22 Sub-Agents und ~/.agents/skills_library.',
    codex: '21-zeilige frontier-guardrails in AGENTS.md, 22 TOML-Rollen unter ~/.codex/agents/boomopen/ mit schreibgeschützter OS-sandbox_mode-Isolierung für Scouts und Reviewer, 87 $boomopen-*-Skills und ~/.agents/skills_library.',
    cursor: 'Schlanke Regeln in .mdc + CURSOR.md, parallele Task-Sub-Agents, optionale --with-hooks (beforeShellExecution), 87 Slash-Workflows (93 Befehlsdateien), Berichte unter ./reports/{topic}/ und ~/.agents/skills_library.',
    copilot: 'Eigenes Agent-Profil für VS Code Copilot, schlanke COPILOT.md-Regeln, #runSubagent-Übergabepakete, 93 Befehlsdateien (87 Workflows), Artefakte unter ./reports/{topic}/, lokale CLI-Checks und ~/.agents/skills_library.',
  },
  commands: {
    autopilot: {
      summary: 'Sitzungsübergreifender Phasen-Runner auf Basis von .boomopen/project-ledger.json, SHA-256-Spec-Hashes und 100 % RTM-Phasen-Gates.',
      nlExample: '"/autopilot nächste Phase aus docs/ umsetzen"',
    },
    conduct: {
      summary: 'Steuert Multi-Engine-Räte und IDE-übergreifende Pipelines zwischen Claude Code, Codex, Antigravity, Cursor und Copilot mit Author != Critic.',
      nlExample: '"boomopen conduct council --task review --prompt \'Auth-Grenze prüfen\'"',
    },
    orchestrate: {
      summary: 'Zerlegt domänenübergreifende Aufgaben in parallele role#shard-Sub-Agents mit disjunkten OWNED_FILES-Schreibsperren.',
      nlExample: '"Datenbank-, Backend- und Frontend-Shards parallel koordinieren"',
    },
    auto: {
      summary: 'Stuft offene Anfragen ein und wählt zwischen direkter Bearbeitung in einer Sitzung oder einem Multi-Agent-Workflow.',
      nlExample: '"/auto passenden Workflow für diese Aufgabe wählen"',
    },
    next: {
      summary: 'Liest aktuelle Artefakte, Ledger-Cursor und offene Waves aus und startet den empfohlenen nächsten Schritt.',
      nlExample: '"/next was steht in der aktuellen Phase als Nächstes an?"',
    },
    settings: {
      summary: 'Konfiguriert alle 5 Presets (Standard frontier-guardrails), 22 Optionen, lokales --ui-Dashboard und < 10 ms Sync über 14 Einstiegsdateien.',
      nlExample: '"boomopen settings preset adversarial-team oder /settings preset smart-hybrid"',
    },
    cook: {
      summary: 'End-to-End-Feature-Workflow ohne Vorab-Plan: analysiert das Repo, sperrt Verträge, führt parallele Shards aus und verifiziert E2E.',
      nlExample: '"/cook:team Passkey-Authentifizierung komplett umsetzen"',
    },
    code: {
      summary: 'Setzt einen freigegebenen PLAN-* direkt über parallele Wave-1-3-Shards um, ohne /plan erneut auszuführen.',
      nlExample: '"/code freigegebenen PLAN-rbac.md ausführen"',
    },
    fix: {
      summary: 'Mehrdatei-Bugfix-Workflow mit Ursachenisolierung, gesperrten Regressionstests und vollständiger Build-Verifikation.',
      nlExample: '"/fix Race-Condition beim Webhook-Retry beheben"',
    },
    refactor: {
      summary: 'Verhaltenserhaltende Neustrukturierung in kohäsive Module mit 200-350 Zeilen (400 Richtwert / 500 Limit) ohne Testregressionen.',
      nlExample: '"/refactor diesen 700-Zeilen-Controller in Domänen-Services aufteilen"',
    },
    deploy: {
      summary: 'Vorab-Checks vor dem Release, Preview-Staging, Produktions-Rollout und Smoke-Tests nach dem Deployment.',
      nlExample: '"/deploy:check Produktionsreife prüfen"',
    },
    rollback: {
      summary: 'Nimmt ein fehlerhaftes Release kontrolliert zurück, prüft Schema-Kompatibilität und bestätigt die Dienstwiederherstellung.',
      nlExample: '"/rollback letztes Release zurückrollen und Health-Checks ausführen"',
    },
    init: {
      summary: 'Richtet .boomopen.json-Projektvorgaben, Lint-/Typprüfungs-Skripte und saubere Verzeichniskonventionen ein.',
      nlExample: '"/init BoomOpen-Projektkonventionen einrichten"',
    },
    preview: {
      summary: 'Startet und prüft lokale Preview-Builds inklusive Routen-Rendering und Kontrolle auf Konsolenfehler.',
      nlExample: '"/preview lokalen Preview bauen und alle Routen prüfen"',
    },
    pr: {
      summary: 'Führt Vorab-Gates (check --strict-phase --no-stubs, reconcile REC-G1..G4) vor gh pr create aus und bietet /pr:review für 3-Rollen-Diff-Reviews.',
      nlExample: '"/pr geprüften Pull Request erstellen oder /pr:review #142"',
    },
    release: {
      summary: 'Prüft Conventional Commits seit dem letzten Tag, synchronisiert Version und CHANGELOG.md, führt doctor + check + test:pack aus und bereitet gh release create vor.',
      nlExample: '"/release nächste SemVer-Version und Changelog vorbereiten"',
    },
    plan: {
      summary: 'Erstellt CLI-geprüfte PLAN-*-Spezifikationen (PLAN-G1..G5) mit SHARED_CONTRACT-Typen, Wave-DAGs und <= 4 OWNED_FILES pro Shard.',
      nlExample: '"/plan:hard mandantenfähige RBAC-Waves planen"',
    },
    design: {
      summary: 'Verfasst 6-Block-DESIGN-*-Verträge (DESIGN-G1..G4) mit OKLCH-Tokens, Typografieskala, 5-Zustands-Matrix und WCAG-2.2-AA-Regeln.',
      nlExample: '"/design:hard UI-Vertrag für das Dashboard erstellen"',
    },
    research: {
      summary: 'Mehrstufige technische Recherche mit 4-Quellen-Abgleich, Widerspruchsprüfung und CLI-validierten RESEARCH-*-Dossiers.',
      nlExample: '"/research Vor- und Nachteile von WebGPU gegenüber WebGL2 vergleichen"',
    },
    brainstorm: {
      summary: 'Erarbeitet mindestens 3 tragfähige Architekturoptionen am realen Code, führt Pre-Mortems durch und bewertet Abwägungen per MCDA.',
      nlExample: '"/brainstorm 3 Echtzeit-Sync-Architekturen bewerten"',
    },
    architect: {
      summary: 'Definiert Service-Grenzen, Datenverträge, unterbrechungsfreie Expand/Contract-Migrationen und ADR-Dokumente.',
      nlExample: '"/architect Event-getriebene Service-Grenzen und ADRs definieren"',
    },
    'ui-ux-pro-max': {
      summary: 'UI-Feinschliff für typografische Hierarchie, saubere Kontraste, responsiven Rhythmus und dezente Animationen.',
      nlExample: '"/ui-ux-pro-max visuelle Hierarchie der Abrechnungsseite schärfen"',
    },
    audit: {
      summary: 'Mehrstufiges Projekt-Audit nach Abschluss (.boomopen/audit-ledger.json): RTM-Abdeckung, vertikale Abläufe, Sicherheitschecks und gezielte Fix-Shards.',
      nlExample: '"/audit Runde 1 gegen docs/ fahren und Blocker auflisten"',
    },
    review: {
      summary: 'Code- und Architektur-Review (inklusive 3-Rollen-Modus :team) mit P0-P3-Befunden und exakten file:line-Belegen.',
      nlExample: '"/review:team Auth- und Billing-Änderungen auf P0-P2-Fehler prüfen"',
    },
    debug: {
      summary: 'Ursachenanalyse (DBG-G1..G4) mit minimalen Reproduktionsfällen, Call-Chain-Tracing und Hypothesentests vor dem Patch.',
      nlExample: '"/debug Speicherleck in der Worker-Queue eingrenzen"',
    },
    test: {
      summary: 'Schreibt und startet Unit-, Integrations-, Barrierefreiheits- und E2E-Tests entlang Given/When/Then-Kriterien ohne übersprungene Assertions.',
      nlExample: '"/test Integrations- und Grenzfalltests für den Checkout ergänzen"',
    },
    'security-audit': {
      summary: 'Sicherheitsprüfung zu OWASP Top 10, Auth-/Session-Grenzen, Secret-Leaks sowie LLM-/MCP-Tool-Schnittstellen.',
      nlExample: '"/security-audit API-Authentifizierung und Webhook-Signaturen prüfen"',
    },
    performance: {
      summary: 'Analysiert Core Web Vitals, Bundle-Größe, SQL-Ausführungspläne und p95-Latenzspitzen mit Vorher-/Nachher-Messwerten.',
      nlExample: '"/performance langsame SQL-Abfragen und Bundle-Größe profilieren"',
    },
    'deep-audit': {
      summary: 'Paralleler schreibgeschützter Repository-Scan zu Architekturtreue, totem Code, Sicherheitsstatus, Doku-Abgleich und Testlücken.',
      nlExample: '"/deep-audit Code, Dokumentation und Testabdeckung im gesamten Repo prüfen"',
    },
    onboard: {
      summary: 'Schreibgeschütztes Repo-Onboarding in 60 Sekunden: 3 parallele Scouter erfassen Stack, Einstiegspunkte, Datenfluss, Hotspots und Build-/Testbefehle in ARCHITECTURE-MAP.md.',
      nlExample: '"/onboard Einstiegspunkte, Datenfluss und Testbefehle kartieren"',
    },
    docs: {
      summary: 'Erstellt am Quellcode verifizierte Projektdokumentation für Technik (:core), Fachdomäne (:business) und Drift-Prüfung (:audit).',
      nlExample: '"/docs:core Architektur- und CLI-Referenz aktualisieren"',
    },
    report: {
      summary: 'Erstellt Fortschrittsberichte, Prüfmetriken und Risikotabellen direkt auf Basis von git log und Testausgaben.',
      nlExample: '"/report Sprint-Änderungen und Testergebnisse zusammenfassen"',
    },
    ask: {
      summary: 'Schreibgeschützte parallele Codebasis-Fragenbeantwortung mit präzisen file:line-Verweisen ohne Änderungen am Arbeitsbaum.',
      nlExample: '"/ask wie funktioniert die Refresh-Token-Rotation in der Auth-Middleware?"',
    },
    save: {
      summary: 'Sichert Sitzungsentscheidungen, aktive Shard-IDs und offene Punkte in einem Artefakt für nahtloses Weiterarbeiten.',
      nlExample: '"/save aktuellen Fortschritt und offene Aufgaben sichern"',
    },
    recap: {
      summary: 'Fasst zu Beginn einer neuen Sitzung frühere Checkpoints, jüngste Commits und offene Ledger-Punkte kompakt zusammen.',
      nlExample: '"/recap zeige den letzten Arbeitsstand"',
    },
    status: {
      summary: 'Zeigt aktives Preset, Ledger-Phasenstand, geänderte Dateien und Verifikationsstatus in einer kompakten Übersicht.',
      nlExample: '"/status aktives Preset und Ledger-Fortschritt anzeigen"',
    },
  },
  cli: {
    research: 'Validiert 6-Block-RESEARCH-*- und BRAINSTORM-*-Dossiers (--mode brainstorm) über 4 Quellenabgleich-Gates und extrahiert einen kompakten HANDOFF_BRIEF.',
    design: 'Prüft die 6-Block-UI-Spezifikation (OKLCH-Tokens, Typografieskala, 5-Zustands-Matrix, WCAG-2.2-AA-Kontrast) und extrahiert DESIGN_CONTRACT für CSS und TypeScript.',
    plan: 'Verifiziert Wave-DAG-Abhängigkeiten, SHARED_CONTRACT-Typen sowie maximal 4 disjunkte OWNED_FILES pro Shard und überträgt Aufgaben nach .boomopen/project-ledger.json.',
    cook: 'Führt Preflight-Checks (boomopen cook preflight PLAN.md) aus, baut 5-Feld-Übergabepakete und erzwingt OWNED_FILES- sowie READ_ONLY_FILES-Sperren je Wave.',
    reconcile: 'Wave-2.5-Scanner zum Abgleich von Spezifikation und Code: erkennt unverdrahtete Module, API-Routen-Abweichungen, offene [SC-*]-Klauseln und fehlende .env.example-Einträge.',
    audit: 'Mehrstufiges Projekt-Audit (.boomopen/audit-ledger.json) mit SHA-256-Befund-Fingerprints, selektiver Fix-Freigabe, Git-Checkpoints und Test-Ratchet.',
    ledger: 'Verfolgt sitzungsübergreifenden /autopilot-Fortschritt in .boomopen/project-ledger.json inklusive SHA-256-Drift-Prüfung, 100 % RTM-Abdeckung und Phasen-Rollback.',
    conduct: 'Erkennt installierte KI-CLIs und steuert den Multi-Engine-Rat für 6 Aufgaben (Claude, Codex, Antigravity, Cursor, Copilot) mit Author != Critic.',
    check: 'Prüft die pragmatischen 2-Stufen-Standards: kein explizites any, sauberes Logging, 400/500-Zeilenlimits, keine leeren Stubs und keine übersprungenen Tests.',
    settings: 'Verwaltet globale (~/.boomopen/settings.json) und projektspezifische (.boomopen.json) Konfiguration über 5 Presets (inklusive Alias carbon-guardrails), 22 Schlüssel, --ui und 14 Einstiegsdateien.',
    doctor: 'Schreibgeschützter Gesundheitscheck für SHA-256-Manifeste, 14 synchronisierte Einstiegsdateien, 93 Befehlsdateien (87 Workflows + 6 _ref), 22 Sub-Agents, 18 Teams und ~/.agents/skills_library.',
    install: 'Synchronisiert 14 Einstiegsdateien über 5 IDEs (Standard frontier-guardrails) und verknüpft ~/.agents/skills_library. Mit --with-hooks für Claude Code, Antigravity und Cursor.',
    uninstall: 'Entfernt ausschließlich unveränderte Kit-Dateien laut SHA-256-Manifest sowie den BoomOpen-Markerblock und lässt eigene Dateien unberührt.',
    list: 'Listet alle 5 unterstützten KI-IDEs auf dem System samt erkannten Verzeichnissen, installierter Kit-Version und Bundle-Pfaden auf.',
  },
  seo: {
    home: {
      title: 'BoomOpen Workflow Kit Pro | Guardrails & Workflows für KI-gestütztes Coding',
      description: 'Schlanke Standard-Guardrails (< 2,3 KB) und optionale Multi-Agent-Workflows für 5 KI-IDEs: 36 Slash-Befehle (93 Dateien), 22 Sub-Agents, 18 3-Rollen-Review-Teams und 1.462 Skills.',
    },
    commands: {
      title: '36 Slash-Befehle & 93 Workflow-Dateien | BoomOpen Workflow Kit Pro',
      description: 'Alle 36 Slash-Befehle von BoomOpen v5.5.0 (87 Workflows + 6 gemeinsame Referenzen) mit :fast-, :hard- und :team-Varianten sowie lokalen CLI-Validatoren.',
    },
    agents: {
      title: '22 Sub-Agents & 18 Review-Teams | BoomOpen Workflow Kit Pro',
      description: 'Übersicht über 22 spezialisierte Sub-Agents und 18 gegenprüfende 3-Rollen-Review-Teams (72 Dateien) mit klarer Trennung von Tech Lead, Executor und Reviewer.',
    },
    skills: {
      title: '1.462 Skills in 19 Fachdomänen | BoomOpen Workflow Kit Pro',
      description: 'Durchsuchen Sie 22 Kern-Skills und 1.440 bei Bedarf geladene Bibliotheks-Skills (1.462 Einträge in compact-index.json) über 19 Engineering-Domänen.',
    },
    architecture: {
      title: 'Systemarchitektur, Presets & 14 CLI-Gates | BoomOpen Workflow Kit Pro',
      description: 'Wie BoomOpen < 2,3 KB Standard-Guardrails mit 3-Wave-Contract-Sharding (<= 4 OWNED_FILES/Shard), Wave-2.5-Abgleich, /autopilot-Ledgern und Multi-Engine-Räten verbindet.',
    },
    install: {
      title: 'Git-Installation für 5 KI-IDEs | BoomOpen Workflow Kit Pro',
      description: 'Nicht-destruktiver SHA-256-Manifest-Installer für Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor und GitHub Copilot inklusive boomopen doctor.',
    },
    notFound: {
      title: '404 Seite nicht gefunden | BoomOpen Workflow Kit Pro',
      description: 'Die angeforderte Dokumentations- oder Katalogroute existiert nicht.',
    },
  },
}
