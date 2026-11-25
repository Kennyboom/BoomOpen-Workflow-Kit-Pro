/**
 * Canonical bilingual (`EN / VI`) SEO route manifest & `/llms.txt` compiler.
 *
 * Pure TypeScript (zero DOM and zero Node APIs) so both `build/site-plugin.ts`
 * at Vite build time and `src/components/seo/SEO.tsx` at runtime share one
 * ground-truth route table derived dynamically from `KIT_STATS`.
 */
import { KIT_STATS, formatCount, type KitStats } from './kitStats'

export type Locale = 'en' | 'vi'

export interface BilingualText {
  readonly en: string
  readonly vi: string
}

export type PageRouteId =
  | 'home'
  | 'commands'
  | 'agents'
  | 'skills'
  | 'architecture'
  | 'install'
  | 'notFound'

export interface PageSeoEntry {
  readonly id: PageRouteId
  readonly pathname?: string
  readonly priority?: number
  readonly noindex?: boolean
  readonly title: BilingualText
  readonly description: BilingualText
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
      en: `${SITE_NAME} v${KIT_STATS.version} — Smart-Hybrid Multi-Agent Orchestration`,
      vi: `${SITE_NAME} v${KIT_STATS.version} — Điều Phối Đa Tác Tử Smart-Hybrid`,
    },
    description: {
      en: `Smart-Hybrid AI engineering kit across ${KIT_STATS.platforms} IDEs: ${CMD_COUNT} slash commands (${KIT_STATS.commandFiles} files), ${KIT_STATS.agents} specialist agents, ${KIT_STATS.teams} Golden Diamond teams, and ${SKILLS_FMT} indexed skills.`,
      vi: `Bộ công cụ điều phối AI đa tác tử cho ${KIT_STATS.platforms} IDE: ${CMD_COUNT} lệnh (${KIT_STATS.commandFiles} tệp), ${KIT_STATS.agents} agent chuyên gia, ${KIT_STATS.teams} đội hình Golden Diamond và ${SKILLS_FMT} kỹ năng.`,
    },
  },
  {
    id: 'commands',
    pathname: '/commands',
    priority: 0.9,
    title: {
      en: `${CMD_COUNT} Slash Commands & ${KIT_STATS.commandFiles} Workflow Files — ${SITE_NAME}`,
      vi: `${CMD_COUNT} Lệnh Slash & ${KIT_STATS.commandFiles} Tệp Quy Trình — ${SITE_NAME}`,
    },
    description: {
      en: `Explore all ${CMD_COUNT} BoomOpen v${KIT_STATS.version} slash commands (${KIT_STATS.commandWorkflowFiles} workflows + ${KIT_STATS.commandRefFiles} shared refs) with 17-language natural-language routing and CLI compiler gates.`,
      vi: `Khám phá toàn bộ ${CMD_COUNT} lệnh điều phối BoomOpen v${KIT_STATS.version} (${KIT_STATS.commandFiles} tệp) hỗ trợ nhận diện ngôn ngữ tự nhiên đa quốc gia và cổng kiểm định CLI tất định.`,
    },
  },
  {
    id: 'agents',
    pathname: '/agents',
    priority: 0.9,
    title: {
      en: `${KIT_STATS.agents} Specialist Agents & ${KIT_STATS.teams} Golden Diamond Teams — ${SITE_NAME}`,
      vi: `${KIT_STATS.agents} Agent Chuyên Gia & ${KIT_STATS.teams} Đội Hình Golden Diamond — ${SITE_NAME}`,
    },
    description: {
      en: `Inspect ${KIT_STATS.agents} role-sharded specialist agents and ${KIT_STATS.teams} adversarial Golden Diamond teams (${KIT_STATS.teamFiles} team files) with Tech Lead, Executor, and Critic verification.`,
      vi: `Chi tiết ${KIT_STATS.agents} agent chuyên sâu và ${KIT_STATS.teams} đội hình phản biện Golden Diamond (${KIT_STATS.teamFiles} tệp) gồm Tech Lead, Executor và Critic độc lập.`,
    },
  },
  {
    id: 'skills',
    pathname: '/skills',
    priority: 0.9,
    title: {
      en: `${SKILLS_FMT} Indexed Skills Vault Across ${DOMAIN_TOTAL} Domains — ${SITE_NAME}`,
      vi: `Kho ${SKILLS_FMT} Kỹ Năng Trên ${DOMAIN_TOTAL} Lĩnh Vực — ${SITE_NAME}`,
    },
    description: {
      en: `Search ${KIT_STATS.coreSkills} core skills and ${LIB_SKILLS_FMT} library skills (${SKILLS_FMT} total in compact-index.json) spanning ${DOMAIN_TOTAL} engineering domains with 2-step O(1) progressive lookup.`,
      vi: `Tra cứu ${KIT_STATS.coreSkills} kỹ năng lõi và ${LIB_SKILLS_FMT} kỹ năng thư viện (tổng ${SKILLS_FMT} kỹ năng trong compact-index.json) phủ trọn ${DOMAIN_TOTAL} lĩnh vực kỹ thuật.`,
    },
  },
  {
    id: 'architecture',
    pathname: '/architecture',
    priority: 0.85,
    title: {
      en: `Smart-Hybrid 3-Wave Architecture & 14 CLI Gates — ${SITE_NAME}`,
      vi: `Kiến Trúc 3-Wave Smart-Hybrid & 14 Cổng CLI — ${SITE_NAME}`,
    },
    description: {
      en: `Deep dive into Tier 0 Direct vs Tier 1 Elastic Swarm sharding (<= 4 OWNED_FILES/shard), Contract-First 3-Wave DAGs, Warm Sub-agent Reuse, Multi-Session Autopilot, and Multi-Engine Council.`,
      vi: `Phân tích kiến trúc Tier 0 trực tiếp và Tier 1 phân mảnh đàn hồi (<= 4 OWNED_FILES/nhánh), hợp đồng 3-Wave, tái sử dụng phiên ấm, Autopilot đa phiên và Hội đồng đa mô hình.`,
    },
  },
  {
    id: 'install',
    pathname: '/install',
    priority: 0.95,
    title: {
      en: `1-Command Safe Install Across ${KIT_STATS.platforms} AI IDEs — ${SITE_NAME}`,
      vi: `Cài Đặt An Toàn Cho ${KIT_STATS.platforms} AI IDE — ${SITE_NAME}`,
    },
    description: {
      en: `Non-destructive SHA-256 manifest-backed installer for Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot with boomopen doctor health checks.`,
      vi: `Trình cài đặt bảo toàn dữ liệu dựa trên SHA-256 manifest cho Antigravity 2.0, Claude Code, OpenAI Codex, Cursor và GitHub Copilot kèm kiểm tra sức khỏe boomopen doctor.`,
    },
  },
  {
    id: 'notFound',
    noindex: true,
    title: {
      en: `404 Route Not Found — ${SITE_NAME}`,
      vi: `404 Không Tìm Thấy Trang — ${SITE_NAME}`,
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

export function formatDocumentTitle(entry: PageSeoEntry, locale: Locale = 'en'): string {
  return entry.title[locale]
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
    `> Smart-Hybrid Multi-Agent Orchestration, Slim \`frontier-guardrails\` Default Preset, Contract-First 3-Wave Swarm Sharding, Wave 2.5 Spec-to-Code Reconciliation, Stateful Multi-Round Project Audit (/audit), Multi-Session Project Autopilot, and Deterministic CLI Compiler Suite across ${stats.platforms} AI coding platforms (Google Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot).`,
    '',
    '## Canonical Inventory',
    `- Production Website: ${siteOrigin}`,
    `- Version: v${stats.version}`,
    `- Platforms (${stats.platforms}): Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, GitHub Copilot`,
    `- Default Preset: \`frontier-guardrails\` (< 2.5 KB slim guardrails across all 5 IDEs; \`carbon-guardrails\` alias supported)`,
    `- Slash Commands: ${cmdTotal} base commands (${stats.commandFiles} files: ${stats.commandWorkflowFiles} workflows + ${stats.commandRefFiles} shared references, including /onboard, /pr, /pr:review, /release, /audit, /autopilot, /conduct, /cook, /code)`,
    `- Specialist Agents: ${stats.agents} domain engineers & auditors`,
    `- Adversarial Teams: ${stats.teams} Golden Diamond / Triangle teams (${stats.teamFiles} files)`,
    `- Skills Vault: ${skillsTotal} indexed skills (${stats.coreSkills} core + ${libTotal} library across ${domainTotal} domains, shared via ~/.agents/skills_library)`,
    `- Multilingual Routing: ${stats.i18nLocales} supported languages`,
    '',
    '## Quick Install (From Git Clone)',
    '```bash',
    `git clone ${REPO_URL}.git`,
    'cd BoomOpen-Workflow-Kit-Pro',
    'node cli/install.js install --all',
    'node cli/install.js doctor',
    '```',
    '',
    '## Deterministic CLI Subcommands (14)',
    '- `install` / `uninstall` / `list` / `doctor` / `settings`: SHA-256 manifest lifecycle, `--as-plugin` bundle support & Control Center UI (`--ui`)',
    '- `research` / `design` / `plan` / `cook` / `reconcile`: Static `< 50ms` artifact validators (`RES-G1..G4`, `DESIGN-G1..G4`, `PLAN-G1..G5`, `COOK-G1..G4`), wave packet compilers & Wave 2.5 spec-to-code reconciliation (`REC-G1..G4`)',
    '- `audit` / `ledger` / `conduct` / `check`: Stateful multi-round human-gated project audit (`.boomopen/audit-ledger.json`, `audit rollback`), `.boomopen/project-ledger.json` phase ratchet (`ledger rollback`), Multi-Engine Council (`claude,codex,antigravity`), and Pragmatic 2-Tier static gate (`--strict-phase --no-stubs`)',
    '',
    '## Documentation & Interactive Catalogs',
    `- [Overview & Launch Trailer](${siteOrigin}/): Bilingual EN/VI showcase, 3-Wave + Wave 2.5 Swarm Visualizer, and 14-Command CLI Playground`,
    `- [Slash Commands Catalog](${siteOrigin}/commands): Searchable reference of all ${cmdTotal} workflow routers and variants`,
    `- [Agents & Golden Diamond Teams](${siteOrigin}/agents): ${stats.agents} specialist agents and ${stats.teams} adversarial review teams`,
    `- [Skills Vault Explorer](${siteOrigin}/skills): ${skillsTotal} indexed skills across ${domainTotal} engineering domains`,
    `- [Architecture & CLI Gates](${siteOrigin}/architecture): Tier 0 vs Tier 1 sharding, frontier-guardrails preset, SHARED_CONTRACT locks, and Autopilot ratchet`,
    `- [Platform Installation Guide](${siteOrigin}/install): Safe per-IDE setup, doctor verification, and hook configuration`,
    `- [GitHub Repository](${REPO_URL}): Source code, rules, agents, skills, and release notes`,
    '',
  ].join('\n')
}
