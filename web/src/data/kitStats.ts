/**
 * Kit statistics & normalized ground-truth counters for BoomOpen Workflow Kit Pro.
 *
 * Pure TypeScript module (zero DOM and zero Node APIs) so both Vite's build-time
 * `build/site-plugin.ts` (`tsconfig.node.json`) and browser React components
 * (`tsconfig.app.json`) import the exact same contract without environment Coupling.
 */
import rawStatsJson from './kit-stats.json'

export interface KitCommand {
  name: string
  variants: string[]
  description: string
}

export interface KitDomain {
  id: string
  name: string
  count: number
}

export interface KitStats {
  readonly version: string
  readonly platforms: number
  readonly i18nLocales: number
  readonly agents: number
  readonly teams: number
  readonly teamRoles: number
  readonly teamFiles: number
  readonly skills: number
  readonly coreSkills: number
  readonly librarySkills: number
  readonly domains: KitDomain[]
  readonly commands: KitCommand[]
  readonly commandWorkflowFiles: number
  readonly commandRefFiles: number
  readonly commandFiles: number
}

interface RawKitStatsShape {
  readonly version?: string
  readonly platforms?: number
  readonly i18nLocales?: number
  readonly agents?: number
  readonly teams?: number
  readonly teamRoles?: number
  readonly teamFiles?: number
  readonly skills?: number
  readonly coreSkills?: number
  readonly librarySkills?: number
  readonly domains?: KitDomain[]
  readonly commands?: KitCommand[]
  readonly commandWorkflowFiles?: number
  readonly commandRefFiles?: number
  readonly commandFiles?: number
}

const DEFAULT_PLATFORMS = 5
const DEFAULT_I18N_LOCALES = 17
const DEFAULT_AGENTS = 21
const DEFAULT_TEAMS = 18
const DEFAULT_TEAM_ROLES = 54
const DEFAULT_SKILLS = 1462
const DEFAULT_CORE_SKILLS = 22
const DEFAULT_LIBRARY_SKILLS = 1440
const DEFAULT_WORKFLOW_FILES = 79
const DEFAULT_REF_FILES = 5

function normalizeKitStats(raw: RawKitStatsShape): KitStats {
  const teams = raw.teams ?? DEFAULT_TEAMS
  const teamRoles = raw.teamRoles ?? DEFAULT_TEAM_ROLES
  const hasExplicitRefCount = typeof raw.commandRefFiles === 'number'
  const commandRefFiles = raw.commandRefFiles ?? DEFAULT_REF_FILES
  const commandWorkflowFiles =
    raw.commandWorkflowFiles ??
    (hasExplicitRefCount && typeof raw.commandFiles === 'number'
      ? raw.commandFiles - commandRefFiles
      : (raw.commandFiles ?? DEFAULT_WORKFLOW_FILES))
  const commandFiles = hasExplicitRefCount
    ? (raw.commandFiles ?? commandWorkflowFiles + commandRefFiles)
    : commandWorkflowFiles + commandRefFiles

  return {
    version: raw.version ?? '5.5.0',
    platforms: raw.platforms ?? DEFAULT_PLATFORMS,
    i18nLocales: raw.i18nLocales ?? DEFAULT_I18N_LOCALES,
    agents: raw.agents ?? DEFAULT_AGENTS,
    teams,
    teamRoles,
    teamFiles: raw.teamFiles ?? teams + teamRoles,
    skills: raw.skills ?? DEFAULT_SKILLS,
    coreSkills: raw.coreSkills ?? DEFAULT_CORE_SKILLS,
    librarySkills: raw.librarySkills ?? DEFAULT_LIBRARY_SKILLS,
    domains: raw.domains ?? [],
    commands: raw.commands ?? [],
    commandWorkflowFiles,
    commandRefFiles,
    commandFiles,
  }
}

export const KIT_STATS: KitStats = normalizeKitStats(rawStatsJson as RawKitStatsShape)

export const KIT_VERSION: string = KIT_STATS.version
export const PLATFORM_COUNT: number = KIT_STATS.platforms
export const LOCALE_COUNT: number = KIT_STATS.i18nLocales
export const AGENT_COUNT: number = KIT_STATS.agents
export const TEAM_COUNT: number = KIT_STATS.teams
export const TEAM_ROLE_COUNT: number = KIT_STATS.teamRoles
export const TEAM_FILE_COUNT: number = KIT_STATS.teamFiles
export const CORE_SKILL_COUNT: number = KIT_STATS.coreSkills
export const SKILL_COUNT: number = KIT_STATS.skills
export const LIBRARY_SKILL_COUNT: number = KIT_STATS.librarySkills
export const DOMAIN_COUNT: number = KIT_STATS.domains.length
export const COMMAND_COUNT: number = KIT_STATS.commands.length
export const WORKFLOW_COUNT: number = KIT_STATS.commandFiles

/** Commands that ship a `:team` variant, formatted as `/name:team`. */
export const TEAM_COMMANDS: readonly string[] = KIT_STATS.commands
  .filter((command) => command.variants.includes('team'))
  .map((command) => `/${command.name}:team`)

/** Formats a numeric count with US thousands separators, e.g. 1462 -> "1,462". */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

/** Looks up a slash command entry by base name (without leading slash). */
export function findKitCommand(name: string): KitCommand | undefined {
  return KIT_STATS.commands.find((command) => command.name === name)
}
