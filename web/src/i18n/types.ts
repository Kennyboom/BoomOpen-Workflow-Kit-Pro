import type {
  BilingualText, CliCommandId, CommandCategory, Locale, PageRouteId, PlatformId, TrailerChapter, TrailerMediaAsset,
} from '../types/ui-contract'

export type { BilingualText, CliCommandId, CommandCategory, Locale, PageRouteId, PlatformId, TrailerChapter, TrailerMediaAsset }

export type CommandFilterKey = 'all' | CommandCategory
export type BentoCardId = 'autopilot' | 'reconcile' | 'council' | 'audit'
export type DockCommandKey =
  | 'autopilot' | 'cook' | 'conduct' | 'audit' | 'plan' | 'design'
  | 'onboard' | 'debug' | 'pr' | 'release' | 'research' | 'brainstorm'
export type AgentDomainKey =
  | 'architecture' | 'backend' | 'data' | 'design' | 'devops' | 'frontend' | 'gaming' | 'management'
  | 'mobile' | 'performance' | 'planning' | 'quality' | 'research' | 'security' | 'validation'

export interface NavCopy {
  readonly home: string; readonly commands: string; readonly agents: string; readonly skills: string
  readonly architecture: string; readonly install: string; readonly githubLabel: string; readonly skipToContent: string
  readonly langToggleAria: string; readonly primaryNavAria: string; readonly mobileMenuOpenAria: string
  readonly mobileMenuCloseAria: string; readonly localeEnShort: string; readonly localeViShort: string
}

export interface HeroMetricsCopy {
  readonly platforms: string; readonly commands: string; readonly agentsTeams: string
  readonly skills: string; readonly cliGates: string; readonly languages: string
  readonly details: {
    readonly platforms: string; readonly commands: string; readonly agentsTeams: string
    readonly skills: string; readonly cliGates: string; readonly languages: string
  }
}

export interface HeroCopy {
  readonly badge: string; readonly eyebrow: string; readonly headline: string; readonly subheadline: string
  readonly primaryCta: string; readonly secondaryCta: string; readonly quickInstallLabel: string
  readonly quickInstallCaption: string; readonly metrics: HeroMetricsCopy
}

export interface HomeBentoCardCopy {
  readonly id: BentoCardId; readonly badge: string; readonly imageAlt: string
  readonly title: string; readonly caption: string; readonly to: string
}

export interface HomeSurfaceCopy {
  readonly topPillLead: string; readonly topPillIdes: string; readonly watchFilmCta: string
  readonly closeFilmAria: string; readonly docsNodeSublabel: string; readonly bentoEyebrow: string
  readonly bentoTitle: string; readonly bentoCards: readonly HomeBentoCardCopy[]
  readonly dockEyebrow: string; readonly dockSectionTitle: string
  readonly dockMetrics: { readonly ides: string; readonly workflows: string; readonly agents: string; readonly skills: string }
  readonly dockCardTitle: string; readonly dockViewAll: string
  readonly dockCommandTags: Readonly<Record<DockCommandKey, string>>
  readonly closingHeadline: string; readonly closingPrimaryCta: string
}

export interface PageChromeCopy {
  readonly langMenuAria: string
  readonly langMenuHeading: string
  readonly commandsStats: { readonly slashCommands: string; readonly workflowSpecs: string; readonly teamVariants: string }
  readonly agentsStats: { readonly specialists: string; readonly reviewTeams: string; readonly roleSpecs: string }
  readonly agentDomains: Readonly<Record<AgentDomainKey, string>>
  readonly teamRoleNotes: { readonly contractLock: string; readonly adversarialSignOff: string }
  readonly skillsStats: {
    readonly indexedSkills: string; readonly coreSkills: string; readonly domains: string
    readonly allCountPrefix: string; readonly allDomainsNav: string
  }
  readonly architectureStats: {
    readonly entryBudget: string; readonly ruleModules: string; readonly syncPresets: string
    readonly defaultTag: string; readonly softCeiling: string; readonly hardThreshold: string
  }
  readonly installStats: {
    readonly supportedIdes: string; readonly entryFiles: string; readonly doctorVerify: string
    readonly stage01: string; readonly stage02: string; readonly stage03: string; readonly allFiveTab: string
  }
}

export interface TrailerCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string; readonly localeBadge: string
  readonly media: TrailerMediaAsset; readonly rawStreamUrl: string; readonly githubUrl: string
  readonly chaptersLabel: string; readonly chapterJumpedLabel: string; readonly loadingLabel: string
  readonly reducedMotionNotice: string; readonly playStudioCta: string; readonly errorTitle: string
  readonly errorBody: string; readonly retryCta: string; readonly openGithubStreamCta: string
}

export interface SwarmWaveItem {
  readonly wave: string; readonly title: string; readonly shardSpec: string
  readonly contractBadge: string; readonly summary: string
}

export interface SwarmCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly tabs: { readonly tier0: string; readonly tier1: string; readonly council: string }
  readonly tier0: {
    readonly badge: string; readonly title: string; readonly trigger: string; readonly latencyBadge: string
    readonly description: string; readonly steps: readonly string[]; readonly outcome: string
  }
  readonly tier1: {
    readonly badge: string; readonly title: string; readonly trigger: string; readonly lockBadge: string
    readonly description: string; readonly waves: readonly SwarmWaveItem[]
    readonly warmReuseTitle: string; readonly warmReuseBadge: string; readonly warmReuseSummary: string
  }
  readonly council: {
    readonly badge: string; readonly title: string; readonly invariantBadge: string; readonly command: string
    readonly description: string; readonly synthesisPath: string; readonly highlights: readonly string[]
  }
}

export interface CliPlaygroundCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly categories: { readonly all: string; readonly compiler: string; readonly orchestration: string; readonly lifecycle: string }
  readonly passToggleLabel: string; readonly failToggleLabel: string; readonly invocationLabel: string
  readonly gatesLabel: string; readonly outputLabel: string; readonly statusPassBadge: string
  readonly statusFailBadge: string; readonly loadingLabel: string; readonly emptyTitle: string
  readonly resetAllCta: string; readonly strictHint: string
}

export interface PlatformsSectionCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string; readonly tabsAriaLabel: string
  readonly entryPointLabel: string; readonly installPathLabel: string; readonly safeInstallLabel: string
  readonly verifyDoctorLabel: string; readonly batchAllLabel: string; readonly batchAllCommand: string
  readonly safetyGuarantee: string; readonly unrecognizedToolHint: string
}

export interface CommandsPageCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly searchLabel: string; readonly searchPlaceholder: string; readonly categoryFilterAria: string
  readonly categories: Readonly<Record<CommandFilterKey, string>>
  readonly variantsLabel: string; readonly teamVariantBadge: string; readonly nlTriggersLabel: string
  readonly workflowFilesBadge: string; readonly emptyTitle: string; readonly emptyBody: string; readonly resetCta: string
}

export interface AgentsPageCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly tabs: { readonly agents: string; readonly teams: string }
  readonly searchLabel: string; readonly searchPlaceholder: string; readonly domainFilterAria: string; readonly allDomains: string
  readonly diamondSection: { readonly badge: string; readonly title: string; readonly subtitle: string; readonly scalingRule: string; readonly mailboxNote: string }
  readonly roleBadges: { readonly techlead: string; readonly executor: string; readonly reviewer: string }
  readonly cardLabels: { readonly domain: string; readonly deliverable: string; readonly modelPolicy: string; readonly triggerCommand: string; readonly directory: string }
  readonly emptyTitle: string; readonly emptyBody: string; readonly resetCta: string
}

export interface SkillsPageCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly stats: { readonly coreLabel: string; readonly libraryLabel: string; readonly indexedLabel: string; readonly domainsLabel: string }
  readonly progressiveLookup: {
    readonly badge: string; readonly title: string; readonly description: string
    readonly steps: ReadonlyArray<{ readonly step: string; readonly code: string; readonly title: string; readonly summary: string }>
  }
  readonly searchLabel: string; readonly searchPlaceholder: string; readonly tierFilterAria: string
  readonly tiers: { readonly all: string; readonly core: string; readonly library: string }
  readonly allDomains: string; readonly domainsSectionTitle: string; readonly featuredSectionTitle: string
  readonly emptyTitle: string; readonly emptyBody: string; readonly resetCta: string
}

export interface ArchitecturePageCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string
  readonly coreRules: {
    readonly badge: string; readonly title: string; readonly subtitle: string
    readonly items: ReadonlyArray<{ readonly file: string; readonly trigger: string; readonly summary: string }>
  }
  readonly controlCenter: {
    readonly badge: string; readonly title: string; readonly subtitle: string; readonly webUiUrl: string
    readonly surfaces: ReadonlyArray<{ readonly title: string; readonly command: string; readonly summary: string }>
    readonly presets: ReadonlyArray<{ readonly name: string; readonly mode: string; readonly lineBudget: string; readonly summary: string }>
  }
  readonly artifactRouting: {
    readonly badge: string; readonly title: string; readonly subtitle: string
    readonly brainCard: { readonly title: string; readonly pathPattern: string; readonly summary: string }
    readonly workspaceCard: { readonly title: string; readonly pathPattern: string; readonly summary: string }
  }
  readonly codingStandards: {
    readonly badge: string; readonly title: string; readonly subtitle: string; readonly softLines: string; readonly hardLines: string
    readonly tier1Title: string; readonly tier1Items: readonly string[]; readonly tier2Title: string; readonly tier2Items: readonly string[]
  }
  readonly specRatchet: {
    readonly badge: string; readonly title: string; readonly subtitle: string; readonly ledgerFile: string; readonly auditCommand: string
    readonly guarantees: ReadonlyArray<{ readonly title: string; readonly summary: string }>
    readonly overnightPlaybook: {
      readonly badge: string; readonly title: string; readonly subtitle: string
      readonly modes: ReadonlyArray<{ readonly workflow: string; readonly scope: string; readonly behavior: string }>
      readonly promptLabel: string; readonly prompt: string
    }
  }
}

export interface InstallPageCopy {
  readonly eyebrow: string; readonly title: string; readonly subtitle: string; readonly gitOnlyNotice: string
  readonly prerequisites: { readonly title: string; readonly items: ReadonlyArray<{ readonly name: string; readonly version: string; readonly detail: string }> }
  readonly steps: { readonly title: string; readonly items: ReadonlyArray<{ readonly step: string; readonly title: string; readonly command: string; readonly summary: string }> }
  readonly verification: { readonly badge: string; readonly title: string; readonly subtitle: string; readonly command: string; readonly checks: readonly string[] }
  readonly globalLink: { readonly title: string; readonly command: string; readonly summary: string }
  readonly maintenance: { readonly summaryToggle: string; readonly badge: string; readonly safetyNotice: string; readonly description: string; readonly commandHeading: string }
}

export interface NotFoundPageCopy {
  readonly code: string; readonly eyebrow: string; readonly title: string; readonly description: string; readonly backHomeCta: string; readonly exploreCommandsCta: string
}

export interface FooterCopy {
  readonly tagline: string; readonly missionNote: string; readonly featuredBadge: string
  readonly columns: { readonly product: string; readonly resources: string; readonly governance: string }
  readonly links: {
    readonly overview: string; readonly commands: string; readonly agents: string; readonly skills: string
    readonly architecture: string; readonly install: string; readonly github: string; readonly releases: string
    readonly changelog: string; readonly license: string; readonly security: string; readonly llmsTxt: string
  }
  readonly copyright: string; readonly builtForLabel: string
}

export interface CommonCopy {
  readonly copy: string; readonly copied: string; readonly copyManualHint: string; readonly resetFilters: string
  readonly resultsCount: string; readonly openNewTab: string; readonly loading: string; readonly retry: string
  readonly reloadView: string; readonly clearSearch: string; readonly errorTitle: string; readonly errorDescription: string
}

export interface Dictionary {
  readonly locale: Locale; readonly nav: NavCopy; readonly hero: HeroCopy
  readonly homeSurface: HomeSurfaceCopy; readonly pageChrome: PageChromeCopy
  readonly trailer: TrailerCopy; readonly swarm: SwarmCopy; readonly cliPlayground: CliPlaygroundCopy
  readonly platformsSection: PlatformsSectionCopy; readonly commandsPage: CommandsPageCopy
  readonly agentsPage: AgentsPageCopy; readonly skillsPage: SkillsPageCopy
  readonly architecturePage: ArchitecturePageCopy; readonly installPage: InstallPageCopy
  readonly notFoundPage: NotFoundPageCopy; readonly footer: FooterCopy; readonly common: CommonCopy
}

export interface CatalogLocalePack {
  readonly locale: Locale
  readonly platforms: Readonly<Record<PlatformId, string>>
  readonly commands: Readonly<Record<string, { readonly summary: string; readonly nlExample: string }>>
  readonly agents: Readonly<Record<string, { readonly title: string; readonly summary: string }>>
  readonly teams: Readonly<Record<string, string>>
  readonly skillDomains: Readonly<Record<string, string>>
  readonly skills: Readonly<Record<string, string>>
  readonly cli: Readonly<Record<CliCommandId, string>>
  readonly seo: Readonly<Record<PageRouteId, { readonly title: string; readonly description: string }>>
}

export interface PartialCatalogPack {
  readonly locale?: Locale
  readonly platforms?: Readonly<Partial<Record<PlatformId, string>>>
  readonly commands?: Readonly<Record<string, { readonly summary: string; readonly nlExample: string }>>
  readonly agents?: Readonly<Record<string, { readonly title: string; readonly summary: string }>>
  readonly teams?: Readonly<Record<string, string>>
  readonly skillDomains?: Readonly<Record<string, string>>
  readonly skills?: Readonly<Record<string, string>>
  readonly cli?: Readonly<Partial<Record<CliCommandId, string>>>
  readonly seo?: Readonly<Partial<Record<PageRouteId, { readonly title: string; readonly description: string }>>>
}

export type CatalogPackPartA = Pick<CatalogLocalePack, 'locale' | 'platforms' | 'commands' | 'cli' | 'seo'>
export type CatalogPackPartB = Pick<CatalogLocalePack, 'locale' | 'agents' | 'teams' | 'skillDomains' | 'skills'>
