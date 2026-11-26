import { SPECIALIST_AGENTS } from '../../data/agents'
import { CLI_COMMANDS } from '../../data/cliSuite'
import { COMMANDS_CATALOG } from '../../data/commands'
import { PLATFORMS } from '../../data/platforms'
import { SEO_ROUTES } from '../../data/seoRoutes'
import { ALL_SHOWCASE_SKILLS, SKILL_DOMAIN_LABELS } from '../../data/skills'
import { SPECIALIST_TEAMS } from '../../data/teams'
import type { CatalogLocalePack, CliCommandId, PageRouteId, PlatformId } from '../types'

function buildBaseCatalogPack(lang: 'en' | 'vi'): CatalogLocalePack {
  const platforms = Object.fromEntries(
    PLATFORMS.map((p) => [p.id, p.summary[lang]]),
  ) as Readonly<Record<PlatformId, string>>

  const commands = Object.fromEntries(
    COMMANDS_CATALOG.map((c) => [
      c.name,
      { summary: c.summary[lang], nlExample: c.nlExamples[lang] },
    ]),
  )

  const agents = Object.fromEntries(
    SPECIALIST_AGENTS.map((a) => [
      a.id,
      { title: a.title[lang], summary: a.summary[lang] },
    ]),
  )

  const teams = Object.fromEntries(
    SPECIALIST_TEAMS.map((team) => [team.id, team.summary[lang]]),
  )

  const skillDomains = Object.fromEntries(
    Object.entries(SKILL_DOMAIN_LABELS).map(([id, label]) => [id, label[lang]]),
  )

  const skills = Object.fromEntries(
    ALL_SHOWCASE_SKILLS.map((s) => [s.id, s.summary[lang]]),
  )

  const cli = Object.fromEntries(
    CLI_COMMANDS.map((cmd) => [cmd.id, cmd.summary[lang]]),
  ) as Readonly<Record<CliCommandId, string>>

  const seo = Object.fromEntries(
    SEO_ROUTES.map((route) => [
      route.id,
      { title: route.title[lang], description: route.description[lang] },
    ]),
  ) as Readonly<Record<PageRouteId, { readonly title: string; readonly description: string }>>

  return {
    locale: lang,
    platforms,
    commands,
    agents,
    teams,
    skillDomains,
    skills,
    cli,
    seo,
  }
}

export const EN_CATALOG_PACK: CatalogLocalePack = buildBaseCatalogPack('en')
export const VI_CATALOG_PACK: CatalogLocalePack = buildBaseCatalogPack('vi')
