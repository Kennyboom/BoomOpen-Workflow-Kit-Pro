import type { CatalogPackPartA } from '../types'

export const catalogPartA: CatalogPackPartA = {
  locale: 'fr',
  platforms: {
    antigravity: 'Profil frontier-guardrails de 21 lignes dans GEMINI.md, parallélisation native via invoke_subagent et Python run_workflow, exécuteur persistant /goal, mode --as-plugin, --with-hooks optionnel, artefacts Brain et ~/.agents/skills_library partagé.',
    claude: 'Profil frontier-guardrails de 21 lignes dans CLAUDE.md, shards parallèles Task/Agent, /plan:hard sans conflit avec /plan natif, --with-hooks optionnel (PreToolUse, Stop, PreCompact), 93 fichiers de commandes, 22 sous-agents et ~/.agents/skills_library.',
    codex: 'Profil frontier-guardrails de 21 lignes dans AGENTS.md, 22 rôles TOML dans ~/.codex/agents/boomopen/ avec isolation OS sandbox_mode en lecture seule pour éclaireurs et relecteurs, 87 skills $boomopen-* et ~/.agents/skills_library.',
    cursor: 'Règles légères .mdc + CURSOR.md, sous-agents Task parallèles, --with-hooks optionnel (beforeShellExecution), 87 workflows slash (93 fichiers), livrables dans ./reports/{topic}/ et ~/.agents/skills_library partagé.',
    copilot: "Profil d'agent personnalisé pour VS Code Copilot, règles légères COPILOT.md, paquets de transfert #runSubagent, 93 fichiers de commandes (87 workflows), livrables dans ./reports/{topic}/, vérification CLI locale et ~/.agents/skills_library.",
  },
  commands: {
    autopilot: {
      summary: 'Exécuteur multi-sessions adossé à .boomopen/project-ledger.json, empreintes SHA-256 des specs et portes de phase à 100 % de couverture RTM.',
      nlExample: '"/autopilot exécuter la prochaine phase depuis docs/"',
    },
    conduct: {
      summary: 'Pilote des conseils multi-moteurs et pipelines inter-IDE sur Claude Code, Codex, Antigravity, Cursor et Copilot selon la règle Author != Critic.',
      nlExample: '"boomopen conduct council --task review --prompt \'Auditer la frontière auth\'"',
    },
    orchestrate: {
      summary: "Découpe un chantier transversal en sous-agents role#shard parallèles dotés de verrous d'écriture OWNED_FILES disjoints.",
      nlExample: '"Coordonner en parallèle les shards base de données, backend et frontend"',
    },
    auto: {
      summary: 'Qualifie la demande en cours et choisit entre édition directe en session unique ou workflow multi-agents.',
      nlExample: '"/auto choisir le workflow adapté à cette tâche"',
    },
    next: {
      summary: 'Analyse les artefacts présents, le curseur du registre et les vagues en attente pour recommander et lancer la suite.',
      nlExample: '"/next quelle est la prochaine étape de la phase en cours ?"',
    },
    settings: {
      summary: "Configure les 5 profils (frontier-guardrails par défaut), 22 clés, le tableau de bord local --ui et la synchro < 10 ms sur 14 fichiers d'entrée.",
      nlExample: '"boomopen settings preset adversarial-team ou /settings preset smart-hybrid"',
    },
    cook: {
      summary: "Workflow complet lorsqu'aucun plan n'existe : explore le dépôt, fige les contrats, lance les shards parallèles et vérifie en E2E.",
      nlExample: '"/cook:team implémenter l’authentification par passkey de bout en bout"',
    },
    code: {
      summary: 'Exécute directement un plan approuvé PLAN-* sur les vagues 1 à 3 sans relancer /plan.',
      nlExample: '"/code exécuter PLAN-rbac.md"',
    },
    fix: {
      summary: 'Correction de bugs multi-fichiers associant isolation de la cause racine, tests de non-régression verrouillés et validation du build.',
      nlExample: '"/fix corriger la condition de concurrence sur le renvoi des webhooks"',
    },
    refactor: {
      summary: 'Restructuration à comportement constant en modules cohésifs de 200-350 lignes (seuil 400 / limite 500) sans régression de tests.',
      nlExample: '"/refactor découper ce contrôleur de 700 lignes en services métier"',
    },
    deploy: {
      summary: 'Contrôles pré-livraison, mise en préproduction, déploiement en production et tests de fumée post-déploiement.',
      nlExample: '"/deploy:check vérifier la préparation pour la production"',
    },
    rollback: {
      summary: 'Annule proprement une version défectueuse, vérifie la compatibilité du schéma et confirme le rétablissement du service.',
      nlExample: '"/rollback annuler la dernière livraison et lancer les contrôles de santé"',
    },
    init: {
      summary: 'Initialise .boomopen.json, les scripts de lint/typage et la structure de répertoires de référence du dépôt.',
      nlExample: '"/init configurer les conventions du projet BoomOpen"',
    },
    preview: {
      summary: "Démarre et contrôle le build de prévisualisation local en vérifiant le rendu des routes et l'absence d'erreurs console.",
      nlExample: '"/preview compiler et tester toutes les routes en local"',
    },
    pr: {
      summary: 'Exécute les contrôles pré-PR (check --strict-phase --no-stubs, reconcile REC-G1..G4) avant gh pr create, ainsi que /pr:review à 3 rôles.',
      nlExample: '"/pr ouvrir une pull request vérifiée ou /pr:review #142"',
    },
    release: {
      summary: 'Analyse les Conventional Commits depuis le dernier tag, met à jour version et CHANGELOG.md, lance doctor + check + test:pack et prépare gh release create.',
      nlExample: '"/release préparer la prochaine version SemVer et le changelog"',
    },
    plan: {
      summary: 'Rédige des specs PLAN-* validées par CLI (PLAN-G1..G5) avec types SHARED_CONTRACT, graphes de vagues et <= 4 OWNED_FILES par shard.',
      nlExample: '"/plan:hard planifier les vagues RBAC multi-locataires"',
    },
    design: {
      summary: 'Rédige des contrats DESIGN-* en 6 blocs (DESIGN-G1..G4) avec tokens OKLCH, échelle typographique, matrice 5 états et règles WCAG 2.2 AA.',
      nlExample: '"/design:hard créer le contrat UI du tableau de bord"',
    },
    research: {
      summary: 'Recherche technique multi-étapes imposant recoupement de 4 sources, arbitrage des contradictions et synthèses RESEARCH-* validées par CLI.',
      nlExample: '"/research comparer les compromis de rendu entre WebGPU et WebGL2"',
    },
    brainstorm: {
      summary: 'Explore au moins 3 options architecturales ancrées dans le code, mène des pre-mortems et évalue les compromis par analyse MCDA.',
      nlExample: '"/brainstorm évaluer 3 architectures de synchronisation temps réel"',
    },
    architect: {
      summary: 'Définit les frontières de services, contrats de données, migrations expand/contract sans coupure et décisions ADR.',
      nlExample: '"/architect définir les frontières de services événementiels et les ADR"',
    },
    'ui-ux-pro-max': {
      summary: 'Affinage visuel centré sur la hiérarchie typographique, la rigueur des contrastes, le rythme responsive et des animations sobres.',
      nlExample: '"/ui-ux-pro-max affiner la hiérarchie visuelle de la page facturation"',
    },
    audit: {
      summary: 'Audit global post-implémentation en plusieurs tours (.boomopen/audit-ledger.json) : couverture RTM, flux verticaux, sécurité et correctifs ciblés.',
      nlExample: '"/audit lancer le tour 1 face à docs/ et lister les points bloquants"',
    },
    review: {
      summary: 'Revue de code et d’architecture (dont le mode :team à 3 rôles) classant les défauts P0-P3 avec preuves file:line exactes.',
      nlExample: '"/review:team inspecter les changements auth et facturation pour détecter tout bug P0-P2"',
    },
    debug: {
      summary: 'Diagnostic de cause racine (DBG-G1..G4) par reproduction minimale, traçage de la chaîne d’appels et vérification d’hypothèses avant correctif.',
      nlExample: '"/debug isoler la fuite mémoire de la file de workers"',
    },
    test: {
      summary: 'Écrit et exécute tests unitaires, d’intégration, d’accessibilité et E2E reliés aux critères Given/When/Then sans aucune assertion ignorée.',
      nlExample: '"/test ajouter des tests d’intégration et cas limites sur le paiement"',
    },
    'security-audit': {
      summary: 'Audit couvrant OWASP Top 10, frontières auth/session, exposition de secrets et surfaces d’appels d’outils LLM/MCP.',
      nlExample: '"/security-audit vérifier l’authentification API et la signature des webhooks"',
    },
    performance: {
      summary: 'Profile les Core Web Vitals, le poids des bundles, les plans SQL et les goulets de latence p95 avec mesures avant/après.',
      nlExample: '"/performance profiler les requêtes SQL lentes et le poids du bundle"',
    },
    'deep-audit': {
      summary: 'Analyse parallèle en lecture seule du dépôt : cohérence architecturale, code mort, posture sécurité, écarts documentaires et trous de tests.',
      nlExample: '"/deep-audit inspecter code, documentation et couverture de tests du dépôt"',
    },
    onboard: {
      summary: 'Prise en main du dépôt en 60 s (lecture seule) : 3 éclaireurs parallèles cartographient stack, points d’entrée, flux et commandes dans ARCHITECTURE-MAP.md.',
      nlExample: '"/onboard cartographier points d’entrée, flux de données et commandes de test"',
    },
    docs: {
      summary: 'Rédige une documentation vérifiée sur le code source pour les specs techniques (:core), guides métier (:business) et contrôles d’écart (:audit).',
      nlExample: '"/docs:core mettre à jour la documentation d’architecture et la référence CLI"',
    },
    report: {
      summary: 'Compile bilans de livraison, métriques de vérification et tableaux de risques directement à partir de git log et des sorties de tests.',
      nlExample: '"/report résumer les changements du sprint et les résultats des tests"',
    },
    ask: {
      summary: "Questions-réponses parallèles en lecture seule sur le code, renvoyant des références précises file:line sans modifier l'arbre Git.",
      nlExample: '"/ask comment fonctionne la rotation des refresh tokens dans le middleware auth ?"',
    },
    save: {
      summary: 'Enregistre décisions de session, identifiants de shards actifs et tâches restantes dans un artefact pour reprendre proprement plus tard.',
      nlExample: '"/save sauvegarder l’avancement actuel et les tâches ouvertes"',
    },
    recap: {
      summary: "Résume en début de session les sauvegardes précédentes, derniers commits et éléments restants du registre d'avancement.",
      nlExample: '"/recap résumer où nous nous sommes arrêtés"',
    },
    status: {
      summary: 'Affiche de façon concise le profil actif, la phase courante du registre, les fichiers modifiés et l’état des vérifications.',
      nlExample: '"/status afficher le profil actif et la progression du registre"',
    },
  },
  cli: {
    research: 'Valide les synthèses 6 blocs RESEARCH-* et BRAINSTORM-* (--mode brainstorm) sur 4 contrôles de recoupement des sources et extrait un HANDOFF_BRIEF compact.',
    design: 'Vérifie la spec UI en 6 blocs (tokens OKLCH, échelle typo, matrice 5 états, contraste WCAG 2.2 AA) et extrait DESIGN_CONTRACT pour CSS et TypeScript.',
    plan: 'Vérifie les dépendances DAG entre vagues, les types SHARED_CONTRACT et la limite <= 4 OWNED_FILES disjoints par shard, puis alimente .boomopen/project-ledger.json.',
    cook: 'Lance les contrôles préalables (boomopen cook preflight PLAN.md), génère les paquets de passage à 5 champs et applique les verrous OWNED_FILES et READ_ONLY_FILES.',
    reconcile: 'Analyseur Wave 2.5 spec-code détectant modules non reliés, écarts de routes API front/back, clauses [SC-*] oubliées et clés absentes de .env.example.',
    audit: 'Audit projet multi-tours (.boomopen/audit-ledger.json) avec empreintes SHA-256 des constats, approbation sélective, jalons Git et cliquet sur le nombre de tests.',
    ledger: 'Suit la progression multi-sessions de /autopilot dans .boomopen/project-ledger.json avec contrôle de dérive SHA-256, traçabilité RTM à 100 % et retour arrière sûr.',
    conduct: 'Détecte les CLI IA installées et orchestre le Conseil multi-moteurs sur 6 tâches (Claude, Codex, Antigravity, Cursor, Copilot) selon Author != Critic.',
    check: 'Applique les standards pragmatiques à 2 niveaux : zéro any explicite, absence de logs parasites, limites 400/500 lignes, zéro stub vide et zéro test ignoré.',
    settings: "Gère la configuration globale (~/.boomopen/settings.json) et projet (.boomopen.json) sur 5 profils (dont l'alias carbon-guardrails), 22 clés, --ui et 14 fichiers d'entrée.",
    doctor: "Diagnostic en lecture seule vérifiant manifestes SHA-256, 14 fichiers d'entrée synchronisés, 93 fichiers de commandes (87 workflows + 6 _ref), 22 sous-agents, 18 équipes et ~/.agents/skills_library.",
    install: "Synchronise 14 fichiers d'entrée sur 5 IDE (frontier-guardrails par défaut) et relie ~/.agents/skills_library. Ajoutez --with-hooks pour Claude Code, Antigravity et Cursor.",
    uninstall: 'Supprime uniquement les fichiers non modifiés du kit enregistrés au manifeste SHA-256 ainsi que le bloc marqueur BoomOpen, sans toucher à vos fichiers.',
    list: 'Liste les 5 IDE IA pris en charge sur la machine avec les répertoires détectés, la version installée et les chemins du kit.',
  },
  seo: {
    home: {
      title: "BoomOpen Workflow Kit Pro | Garde-fous & workflows pour le développement assisté par l'IA",
      description: 'Garde-fous légers par défaut (< 2,3 Ko) et workflows multi-agents à la demande sur 5 IDE IA : 36 commandes slash (93 fichiers), 22 sous-agents, 18 équipes à 3 rôles et 1 462 skills.',
    },
    commands: {
      title: '36 commandes slash & 93 fichiers de workflow | BoomOpen Workflow Kit Pro',
      description: 'Parcourez les 36 commandes slash de BoomOpen v5.5.0 (87 workflows + 6 références partagées) avec variantes :fast, :hard et :team et validateurs CLI locaux.',
    },
    agents: {
      title: '22 sous-agents & 18 équipes de revue | BoomOpen Workflow Kit Pro',
      description: 'Découvrez 22 sous-agents spécialisés et 18 équipes contradictoires à 3 rôles (72 fichiers) séparant clairement Tech Lead, Executor et Reviewer.',
    },
    skills: {
      title: '1 462 skills répartis sur 19 domaines | BoomOpen Workflow Kit Pro',
      description: 'Recherchez parmi 22 skills de base et 1 440 skills de bibliothèque chargés à la demande (1 462 indexés dans compact-index.json) sur 19 domaines techniques.',
    },
    architecture: {
      title: 'Architecture système, profils & 14 contrôles CLI | BoomOpen Workflow Kit Pro',
      description: 'Comment BoomOpen associe des garde-fous < 2,3 Ko par défaut au découpage contractuel 3-Wave (<= 4 OWNED_FILES/shard), à la réconciliation Wave 2.5, à /autopilot et aux conseils IA.',
    },
    install: {
      title: 'Installation Git pour 5 IDE IA | BoomOpen Workflow Kit Pro',
      description: 'Installateur non destructif par manifeste SHA-256 pour Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor et GitHub Copilot avec vérification boomopen doctor.',
    },
    notFound: {
      title: '404 Page introuvable | BoomOpen Workflow Kit Pro',
      description: 'La route de documentation ou de catalogue demandée est introuvable.',
    },
  },
}
