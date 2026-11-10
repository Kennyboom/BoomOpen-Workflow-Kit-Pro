/**
 * SEO configuration: the single source of truth for the site origin and per-route metadata.
 * Pure data (no DOM / Node APIs): it is also imported by vite.config.ts to render the static
 * <head>, sitemap.xml and robots.txt at build time.
 */
import {
  AGENT_COUNT,
  DOMAIN_COUNT,
  SKILL_COUNT,
  TEAM_COUNT,
  WORKFLOW_COUNT,
  formatCount,
} from '../../data/kitStats'

/**
 * Public origin of the website. The production domain is not decided yet; this keeps the
 * previous Vercel host. Change it here only: SEO tags, JSON-LD, sitemap.xml and robots.txt
 * all derive from this constant.
 */
export const SITE_URL = 'https://boomopen-workflow-kit-ten.vercel.app'
export const SITE_NAME = 'BoomOpen Workflow Kit'
export const SITE_AUTHOR = 'BoomOpen Labs'
export const REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit'
export const DEFAULT_IMAGE = '/assets/og-image.jpg'
export const LOGO_IMAGE = '/assets/logo.png'
export const SITE_KEYWORDS =
  'AI, coding assistant, agents, Cursor, Claude Code, GitHub Copilot, Codex, Antigravity, development workflow, orchestration'

const SKILLS = formatCount(SKILL_COUNT)
export const SITE_SUMMARY =
  `Multi-agent orchestration for AI coding assistants with ${AGENT_COUNT} specialist agents, ` +
  `${TEAM_COUNT} Golden Triangle teams, ${SKILLS} indexed skills and ${WORKFLOW_COUNT} command workflows.`

export interface PageSEO {
  title: string
  description: string
  /** Route path; omitted for pages without a canonical URL (404). */
  pathname?: string
  noindex?: boolean
  /** Sitemap priority (0.0 - 1.0). */
  priority?: number
}

export const pageSEO = {
  home: {
    title: SITE_NAME,
    description: `${SITE_SUMMARY} One-time setup for Cursor, Claude Code, GitHub Copilot, Codex and Antigravity.`,
    pathname: '/',
    priority: 1,
  },
  installation: {
    title: 'Installation Guide',
    description:
      'Clone the BoomOpen Workflow Kit repository and install it for Cursor, Claude Code, GitHub Copilot, Codex or Antigravity with one command.',
    pathname: '/installation',
    priority: 0.9,
  },
  docs: {
    title: 'Documentation',
    description:
      'Learn BoomOpen Workflow Kit - documentation for AI-powered development workflows with specialist agents and orchestration.',
    pathname: '/docs',
    priority: 0.9,
  },
  specialistAgents: {
    title: 'Specialist Agents',
    description: `${AGENT_COUNT} specialist agents including backend and frontend engineers, testers, debuggers, reviewers and more, each with its own expertise and thinking protocol.`,
    pathname: '/features/specialist-agents',
    priority: 0.8,
  },
  commands: {
    title: 'Commands & Workflows',
    description: `Slash commands like /cook, /fix, /test and /review trigger multi-phase development workflows. ${WORKFLOW_COUNT} command workflows in total.`,
    pathname: '/features/commands-workflows',
    priority: 0.8,
  },
  matrixSkills: {
    title: 'Hybrid Skill Orchestration (HSOL)',
    description: `${SKILLS} indexed skills across ${DOMAIN_COUNT} domains plus on-demand community skills via find-skills. Variant-aware discovery and fitness thresholds.`,
    pathname: '/features/matrix-skills',
    priority: 0.8,
  },
  multiPlatform: {
    title: 'Multi-Platform Support',
    description:
      'Works with Cursor, Claude Code, GitHub Copilot, Codex and Antigravity. One kit, multiple platforms.',
    pathname: '/features/multi-platform-support',
    priority: 0.8,
  },
  oneTimeSetup: {
    title: 'One-Time Setup',
    description:
      'Install once, use everywhere. Global configuration that works across all your projects and AI coding assistants.',
    pathname: '/features/one-time-setup',
    priority: 0.8,
  },
  qualityGates: {
    title: 'Quality Gates',
    description:
      'Deterministic CLI quality gates (boomopen research, design, plan, cook, ledger, conduct, check) verify every phase output before shipping.',
    pathname: '/features/quality-gates',
    priority: 0.8,
  },
  subAgentOrchestration: {
    title: 'Sub-Agent Orchestration',
    description:
      'The orchestrator delegates to specialist agents, coordinates their work and synthesizes the result for complex tasks.',
    pathname: '/features/sub-agent-orchestration',
    priority: 0.8,
  },
  workflow: {
    title: 'System Architecture',
    description: `Interactive architecture diagram showing how BoomOpen Workflow Kit orchestrates ${AGENT_COUNT} specialist agents, ${SKILLS} skills and tiered execution.`,
    pathname: '/features/workflow',
    priority: 0.7,
  },
  agentTeams: {
    title: 'Agent Teams — Golden Triangle',
    description: `Adversarial collaboration with ${TEAM_COUNT} specialized teams. Each team has a Tech Lead, Executor and Reviewer working through structured debate.`,
    pathname: '/features/agent-teams',
    priority: 0.7,
  },
} satisfies Record<string, PageSEO>

export const NOT_FOUND_SEO: PageSEO = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  noindex: true,
}

/** Extra paths that render an existing page (kept out of the sitemap, canonicalised to the target). */
const ROUTE_ALIASES: Record<string, string> = {
  '/features': '/features/one-time-setup',
}

/** Every indexable route, in sitemap order. */
export const INDEXABLE_PAGES: PageSEO[] = Object.values(pageSEO)

/** Every path the SPA serves (indexable pages plus aliases); used for hosting rewrites. */
export const SPA_PATHS: string[] = [
  ...INDEXABLE_PAGES.map((page) => page.pathname ?? '/'),
  ...Object.keys(ROUTE_ALIASES),
]

function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/** Resolves the SEO entry for a router pathname; unknown paths get the noindex 404 entry. */
export function getPageSEO(pathname: string): PageSEO {
  const path = normalizePath(pathname)
  const target = ROUTE_ALIASES[path] ?? path
  return INDEXABLE_PAGES.find((page) => page.pathname === target) ?? NOT_FOUND_SEO
}

/** Full document title for a page. */
export function getFullTitle(page: PageSEO): string {
  return page.title === SITE_NAME ? SITE_NAME : `${page.title} - ${SITE_NAME}`
}

/** Absolute URL for a site-relative path. */
export function toAbsoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`
}
