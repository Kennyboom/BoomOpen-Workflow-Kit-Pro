/**
 * Kit statistics shown on the website.
 *
 * The numbers come from `kit-stats.json`, which `build/kit-stats.mjs` regenerates
 * from the repository (package.json, agents/, commands/, matrix-skills/,
 * skills_library/) every time the dev server starts or a build runs.
 * This module must stay free of DOM and Node APIs: it is also imported by vite.config.ts.
 */
import kitStatsJson from './kit-stats.json'

export interface KitCommand {
  /** Base command name without the leading slash, e.g. "cook". */
  name: string
  /** Variant suffixes, e.g. ["fast", "hard", "team"]. */
  variants: string[]
  /** Description taken from the command's frontmatter. */
  description: string
}

export interface KitDomain {
  id: string
  name: string
  count: number
}

export interface KitStats {
  version: string
  agents: number
  teams: number
  teamRoles: number
  /** Core skill folders shipped in skills/. */
  coreSkills: number
  /** Total indexed skills (matrix-skills/compact-index.json `totalSkills`). */
  skills: number
  /** Skill folders shipped in skills_library/. */
  librarySkills: number
  domains: KitDomain[]
  commands: KitCommand[]
  /** Number of command files (base commands plus variants). */
  commandFiles: number
}

export const KIT_STATS: KitStats = kitStatsJson

export const KIT_VERSION = KIT_STATS.version
export const AGENT_COUNT = KIT_STATS.agents
export const TEAM_COUNT = KIT_STATS.teams
export const TEAM_ROLE_COUNT = KIT_STATS.teamRoles
export const CORE_SKILL_COUNT = KIT_STATS.coreSkills
export const SKILL_COUNT = KIT_STATS.skills
export const LIBRARY_SKILL_COUNT = KIT_STATS.librarySkills
export const DOMAIN_COUNT = KIT_STATS.domains.length
export const COMMAND_COUNT = KIT_STATS.commands.length
export const WORKFLOW_COUNT = KIT_STATS.commandFiles

/** Commands that ship a `:team` variant, formatted as `/name:team`. */
export const TEAM_COMMANDS: string[] = KIT_STATS.commands
  .filter((command) => command.variants.includes('team'))
  .map((command) => `/${command.name}:team`)

/** Formats a count for display, e.g. 1462 -> "1,462". */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

/** Looks up a command by base name (without slash). */
export function findKitCommand(name: string): KitCommand | undefined {
  return KIT_STATS.commands.find((command) => command.name === name)
}
