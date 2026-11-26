/**
 * Canonical 15-locale SEO route manifest & `/llms.txt` compiler.
 *
 * Pure TypeScript (zero DOM and zero Node APIs) so both `build/site-plugin.ts`
 * at Vite build time and `src/components/seo/SEO.tsx` at runtime share one
 * ground-truth route table derived dynamically from `KIT_STATS`.
 */
import type { BilingualText, Locale, PageRouteId, PageSeoEntry } from '../types/ui-contract'
import { KIT_STATS, formatCount, type KitStats } from './kitStats'

export type { BilingualText, Locale, PageRouteId, PageSeoEntry }

export interface RouteSeoCopy {
  readonly title: string
  readonly description: string
}

export const SITE_URL = 'https://boomopen.com'
export const SITE_NAME = 'BoomOpen Workflow Kit Pro'
export const REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro'
export const DEFAULT_OG_IMAGE = '/media/poster_en.png'

const SKILLS_FMT = formatCount(KIT_STATS.skills)
const LIB_SKILLS_FMT = formatCount(KIT_STATS.librarySkills)
const CMD_COUNT = KIT_STATS.commands.length || 36
const DOMAIN_TOTAL = KIT_STATS.domains.length || 19

export const SEO_ROUTES: readonly PageSeoEntry[] = [
  {
    id: 'home',
    pathname: '/',
    priority: 1.0,
    title: {
      en: `${SITE_NAME} | Guardrails & Workflows for AI Coding`,
      vi: `${SITE_NAME} | Quy trình & kiểm soát chất lượng cho AI coding`,
    },
    description: {
      en: `Slim < 2.3 KB default guardrails and opt-in multi-agent workflows across ${KIT_STATS.platforms} AI IDEs: ${CMD_COUNT} slash commands (${KIT_STATS.commandFiles} files), ${KIT_STATS.agents} sub-agents, ${KIT_STATS.teams} 3-role review teams, and ${SKILLS_FMT} skills.`,
      vi: `Bộ công cụ quy trình và kiểm soát chất lượng cho ${KIT_STATS.platforms} AI IDE: mặc định frontier-guardrails gọn nhẹ (< 2.3 KB), ${CMD_COUNT} lệnh (${KIT_STATS.commandFiles} tệp), ${KIT_STATS.agents} sub-agent chuyên biệt, ${KIT_STATS.teams} nhóm 3 vai trò phản biện và ${SKILLS_FMT} kỹ năng.`,
    },
  },
  {
    id: 'commands',
    pathname: '/commands',
    priority: 0.9,
    title: {
      en: `${CMD_COUNT} Slash Commands & ${KIT_STATS.commandFiles} Workflow Files | ${SITE_NAME}`,
      vi: `${CMD_COUNT} lệnh slash & ${KIT_STATS.commandFiles} tệp quy trình | ${SITE_NAME}`,
    },
    description: {
      en: `Browse all ${CMD_COUNT} BoomOpen v${KIT_STATS.version} slash commands (${KIT_STATS.commandWorkflowFiles} workflows + ${KIT_STATS.commandRefFiles} shared refs) with :fast, :hard, and :team variants plus local CLI validators.`,
      vi: `Tra cứu toàn bộ ${CMD_COUNT} lệnh BoomOpen v${KIT_STATS.version} (${KIT_STATS.commandFiles} tệp) với các biến thể :fast, :hard, :team cùng hệ thống kiểm tra nhất quán bằng CLI.`,
    },
  },
  {
    id: 'agents',
    pathname: '/agents',
    priority: 0.9,
    title: {
      en: `${KIT_STATS.agents} Sub-Agents & ${KIT_STATS.teams} Review Teams | ${SITE_NAME}`,
      vi: `${KIT_STATS.agents} sub-agent chuyên biệt & ${KIT_STATS.teams} nhóm phản biện | ${SITE_NAME}`,
    },
    description: {
      en: `Inspect ${KIT_STATS.agents} domain sub-agents and ${KIT_STATS.teams} adversarial 3-role review teams (${KIT_STATS.teamFiles} files) with Tech Lead, Executor, and Reviewer separation.`,
      vi: `Danh mục ${KIT_STATS.agents} sub-agent chuyên biệt và ${KIT_STATS.teams} nhóm 3 vai trò phản biện (${KIT_STATS.teamFiles} tệp) gồm Tech Lead, Executor và Reviewer độc lập.`,
    },
  },
  {
    id: 'skills',
    pathname: '/skills',
    priority: 0.9,
    title: {
      en: `${SKILLS_FMT} Skills Across ${DOMAIN_TOTAL} Domains | ${SITE_NAME}`,
      vi: `Kho ${SKILLS_FMT} kỹ năng trên ${DOMAIN_TOTAL} lĩnh vực | ${SITE_NAME}`,
    },
    description: {
      en: `Search ${KIT_STATS.coreSkills} core skills and ${LIB_SKILLS_FMT} on-demand library skills (${SKILLS_FMT} indexed in compact-index.json) across ${DOMAIN_TOTAL} engineering domains.`,
      vi: `Tìm kiếm ${KIT_STATS.coreSkills} kỹ năng cốt lõi và ${LIB_SKILLS_FMT} kỹ năng thư viện nạp theo nhu cầu (${SKILLS_FMT} mục trong compact-index.json) trên ${DOMAIN_TOTAL} lĩnh vực kỹ thuật.`,
    },
  },
  {
    id: 'architecture',
    pathname: '/architecture',
    priority: 0.85,
    title: {
      en: `System Architecture, Presets & 14 CLI Gates | ${SITE_NAME}`,
      vi: `Kiến trúc hệ thống, cấu hình & 14 lệnh CLI | ${SITE_NAME}`,
    },
    description: {
      en: `How BoomOpen pairs < 2.3 KB default frontier-guardrails with 3-Wave Contract-First sharding (<= 4 OWNED_FILES/shard), Wave 2.5 reconciliation, /autopilot ledgers, and multi-engine councils.`,
      vi: `Chi tiết cơ chế mặc định frontier-guardrails (< 2.3 KB), chạy song song 3-Wave khóa hợp đồng (<= 4 OWNED_FILES/shard), đối chiếu Wave 2.5, /autopilot đa phiên và hội đồng đa mô hình.`,
    },
  },
  {
    id: 'install',
    pathname: '/install',
    priority: 0.95,
    title: {
      en: `Git Install for ${KIT_STATS.platforms} AI IDEs | ${SITE_NAME}`,
      vi: `Cài đặt qua Git cho ${KIT_STATS.platforms} AI IDE | ${SITE_NAME}`,
    },
    description: {
      en: `Non-destructive SHA-256 manifest installer for Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot with boomopen doctor verification.`,
      vi: `Cài đặt an toàn qua Git dựa trên manifest SHA-256 cho Antigravity 2.0, Claude Code, OpenAI Codex, Cursor và GitHub Copilot kèm kiểm tra boomopen doctor.`,
    },
  },
  {
    id: 'notFound',
    noindex: true,
    title: {
      en: `404 Route Not Found | ${SITE_NAME}`,
      vi: `404 Không tìm thấy trang | ${SITE_NAME}`,
    },
    description: {
      en: 'The requested documentation or catalog route does not exist.',
      vi: 'Đường dẫn tài liệu hoặc danh mục bạn yêu cầu không tồn tại.',
    },
  },
] as const

export const INDEXABLE_SEO_ROUTES: readonly PageSeoEntry[] = SEO_ROUTES.filter(
  (entry) => !entry.noindex && typeof entry.pathname === 'string',
)

const FALLBACK_NOT_FOUND: PageSeoEntry = SEO_ROUTES[SEO_ROUTES.length - 1]

export function getRouteSeo(id: PageRouteId): PageSeoEntry {
  return SEO_ROUTES.find((entry) => entry.id === id) ?? FALLBACK_NOT_FOUND
}

export function getRouteSeoByPath(pathname: string): PageSeoEntry {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return INDEXABLE_SEO_ROUTES.find((entry) => entry.pathname === normalized) ?? FALLBACK_NOT_FOUND
}

export function toCanonicalUrl(pathname: string = '/'): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    return pathname
  }
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`
  return clean === '/' ? `${SITE_URL}/` : `${SITE_URL}${clean}`
}

export function getRouteSeoCopy(
  entry: PageSeoEntry,
  locale: Locale = 'en',
  catalogSeo?: Readonly<Partial<Record<PageRouteId, RouteSeoCopy>>>,
): RouteSeoCopy {
  const override = catalogSeo?.[entry.id]
  if (override) {
    return override
  }
  return {
    title: locale === 'vi' ? entry.title.vi : entry.title.en,
    description: locale === 'vi' ? entry.description.vi : entry.description.en,
  }
}

export function formatDocumentTitle(
  entry: PageSeoEntry,
  locale: Locale = 'en',
  catalogSeo?: Readonly<Partial<Record<PageRouteId, RouteSeoCopy>>>,
): string {
  return getRouteSeoCopy(entry, locale, catalogSeo).title
}

/**
 * Generates the machine-readable `/llms.txt` specification for AI coding agents and search crawlers.
 */
export function renderLlmsTxt(stats: KitStats = KIT_STATS, siteOrigin: string = SITE_URL): string {
  const skillsTotal = formatCount(stats.skills)
  const libTotal = formatCount(stats.librarySkills)
  const cmdTotal = stats.commands.length || 36
  const domainTotal = stats.domains.length || 19

  return [
    `# ${SITE_NAME} (v${stats.version})`,
    '',
    `> Proactive \`smart-hybrid\` default preset (auto Mode A/B + 17-language routing, plus < 2.3 KB \`frontier-guardrails\` slim Mode A), 3-Wave Contract-First sharding, Wave 2.5 spec-to-code reconciliation, multi-round project audit (/audit), multi-session /autopilot, and 14 local CLI commands across ${stats.platforms} AI coding IDEs (Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot).`,
    '',
    '## Canonical Inventory',
    `- Production Website: ${siteOrigin}`,
    `- Version: v${stats.version}`,
    `- Platforms (${stats.platforms}): Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot`,
    `- Default Preset: \`smart-hybrid\` (auto Mode A/B across 14 entry files; presets: \`smart-hybrid\`, \`frontier-guardrails\` < 2.3 KB slim, \`solo-fast\`, \`deep-architect\`, \`adversarial-team\`, plus \`carbon-guardrails\` alias; 22 config keys = 20 enum + 2 line limits)`,
    `- Slash Commands: ${cmdTotal} base commands (${stats.commandFiles} files: ${stats.commandWorkflowFiles} workflows + ${stats.commandRefFiles} shared references, including /onboard, /pr, /pr:review, /release, /audit, /autopilot, /conduct, /cook, /code)`,
    `- Sub-Agents: ${stats.agents} domain specialists`,
    `- Review Teams: ${stats.teams} adversarial 3-role review teams (${stats.teamFiles} files: Tech Lead, Executor, Reviewer)`,
    `- Skills Vault: ${skillsTotal} indexed skills (${stats.coreSkills} core + ${libTotal} library across ${domainTotal} domains, shared via ~/.agents/skills_library)`,
    `- Multilingual Routing: ${stats.i18nLocales} supported languages (opt-in via \`smart-hybrid\` or \`workflows.naturalLanguageResearchTrigger\`)`,
    '',
    '## Quick Install (From Git Clone)',
    '```bash',
    `git clone ${REPO_URL}.git`,
    'cd BoomOpen-Workflow-Kit-Pro',
    'node cli/install.js install --all',
    'node cli/install.js doctor',
    '```',
    '',
    '## Local CLI Subcommands (14)',
    '- `install` / `uninstall` / `list` / `doctor` / `settings`: SHA-256 manifest installer (14 entry files, `--as-plugin` bundle, opt-in `--with-hooks` on Claude/Antigravity/Cursor) & Control Center (`--ui`)',
    '- `research` / `design` / `plan` / `cook` / `reconcile`: Fast local validators (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`), wave packet compilers & Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`)',
    '- `audit` / `ledger` / `conduct` / `check`: Multi-round project audit (`.boomopen/audit-ledger.json`, `audit rollback --round 1 --yes`), `.boomopen/project-ledger.json` phase ratchet (`ledger rollback --phase PHASE-1 --yes`), Multi-Engine Council (`conduct council --task review --prompt "..."`), and 2-tier static gate (`--strict-phase --no-stubs`)',
    '',
    '## Documentation & Catalogs',
    `- [Overview & Walkthrough](${siteOrigin}/): Bilingual EN/VI overview, workflow visualizer, and 14-command CLI Playground`,
    `- [Slash Commands Catalog](${siteOrigin}/commands): Searchable reference of all ${cmdTotal} commands and variants`,
    `- [Sub-Agents & 3-Role Review Teams](${siteOrigin}/agents): ${stats.agents} sub-agents and ${stats.teams} review teams`,
    `- [Skills Vault Explorer](${siteOrigin}/skills): ${skillsTotal} indexed skills across ${domainTotal} engineering domains`,
    `- [Architecture & CLI Gates](${siteOrigin}/architecture): smart-hybrid default, 3-wave sharding, deliverable routing, and /autopilot ratchet`,
    `- [Git Installation Guide](${siteOrigin}/install): Per-IDE setup, doctor checks, and opt-in hook registration`,
    `- [GitHub Repository](${REPO_URL}): Source code, rules, agents, skills, and release notes`,
    '',
  ].join('\n')
}
