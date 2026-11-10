import { totalAgents, getAgentCountByCategory } from './agents'
import { totalCommands } from './commands'
import { totalSkills, totalDomains } from './skills'
import { totalPlatforms } from './platforms'
import { formatCount } from './kitStats'

// Hero metrics (performance improvements)
export const heroMetrics = [
  { value: '70%', label: 'Faster Development', emoji: '⚡' },
  { value: '70%', label: 'Fewer Bugs', emoji: '🛡️' },
  { value: '85%', label: 'Token Savings', emoji: '💰' },
]

// Quick stats (key numbers)
export const quickStats = [
  { value: `${totalAgents}`, label: 'Specialist Agents' },
  { value: `${totalCommands}`, label: 'Commands' },
  { value: formatCount(totalSkills), label: 'Skills' },
  { value: `${totalPlatforms}`, label: 'Platforms' },
]

// Feature cards for homepage
export const featureCards = [
  {
    emoji: '🎭',
    title: 'Specialist Agents',
    description: `${totalAgents} pre-built agents including backend engineers, frontend developers, testers, debuggers, and more.`,
    href: '/features/specialist-agents',
    badge: 'Core',
  },
  {
    emoji: '⚡',
    title: 'Command Workflows',
    description: 'Slash commands like /cook, /fix, /test, /review trigger complete multi-phase development workflows.',
    href: '/features/commands-workflows',
    badge: 'Powerful',
  },
  {
    emoji: '🔌',
    title: 'Multi-Platform',
    description: 'Works seamlessly with Cursor, Claude Code, GitHub Copilot, Codex, and Antigravity.',
    href: '/features/multi-platform-support',
    badge: 'Flexible',
  },
  {
    emoji: '🧠',
    title: 'Hybrid Skill Orchestration',
    description: `${formatCount(totalSkills)} indexed matrix skills across ${totalDomains} domains plus on-demand community skills via find-skills. Variant-aware, deep expertise.`,
    href: '/features/matrix-skills',
    badge: 'Smart',
  },
]

// Prerequisites for installation
export const prerequisites = [
  { name: 'Node.js', version: '18.0+', icon: '🟢' },
  { name: 'npm', version: '9.0+', icon: '📦' },
  { name: 'Git', version: '2.0+', icon: '🔧' },
]

// Agent category summary for docs
const categoryCounts = getAgentCountByCategory()
export const agentCategorySummary = [
  { category: 'Implementation', count: categoryCounts.Implementation, examples: 'backend, frontend, mobile, game' },
  { category: 'Architecture', count: categoryCounts.Architecture, examples: 'tech-lead, database-architect' },
  { category: 'Quality', count: categoryCounts.Quality, examples: 'tester, reviewer, debugger, security' },
  { category: 'Planning', count: categoryCounts.Planning, examples: 'planner, brainstormer, analyst' },
  { category: 'Support', count: categoryCounts.Support, examples: 'designer, devops, docs, reporter, researcher...' },
]

// Documentation sections
export const docSections = [
  {
    title: 'Quick Start',
    icon: '🚀',
    description: 'Get up and running in minutes with a step-by-step guide.',
    links: [
      { label: 'Installation Guide', href: '/installation' },
      { label: 'First Commands', href: '/features/commands-workflows' },
      { label: 'Platform Setup', href: '/features/multi-platform-support' },
    ],
  },
  {
    title: 'Core Concepts',
    icon: '🧠',
    description: 'Understand the fundamental concepts behind BoomOpen Workflow Kit.',
    links: [
      { label: 'Orchestration Model', href: '/features/sub-agent-orchestration' },
      { label: 'Quality Gates', href: '/features/quality-gates' },
      { label: 'Skill Injection', href: '/features/matrix-skills' },
    ],
  },
  {
    title: 'Commands',
    icon: '⌨️',
    description: 'Complete reference for all available commands and workflows.',
    links: [
      { label: 'Command Reference', href: '/features/commands-workflows' },
      { label: 'Build Commands', href: '/features/commands-workflows#build' },
      { label: 'Quality Commands', href: '/features/commands-workflows#quality' },
    ],
  },
  {
    title: 'Agents',
    icon: '🎭',
    description: `Learn about the ${totalAgents} specialist agents and their capabilities.`,
    links: [
      { label: 'Agent Overview', href: '/features/specialist-agents' },
      { label: 'Agent Collaboration', href: '/features/sub-agent-orchestration' },
      { label: 'Custom Agents', href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/tree/main/agents', external: true },
    ],
  },
  {
    title: 'Skills',
    icon: '📚',
    description: `Explore the ${formatCount(totalSkills)} indexed skills available across ${totalDomains} domains.`,
    links: [
      { label: 'Skills Overview', href: '/features/matrix-skills' },
      { label: 'Skill Domains', href: '/features/matrix-skills#domains' },
      { label: 'Custom Skills', href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/tree/main/skills', external: true },
    ],
  },
  {
    title: 'Configuration',
    icon: '⚙️',
    description: 'Customize BoomOpen Workflow Kit to fit your workflow.',
    links: [
      { label: 'Global Config', href: '/features/one-time-setup' },
      { label: 'Project Overrides', href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/blob/main/commands/settings.md', external: true },
      { label: 'Platform Config', href: '/features/multi-platform-support' },
    ],
  },
]

// External resources
export const resources = [
  {
    title: 'GitHub Repository',
    description: 'Source code, issues, and contributions.',
    icon: '🐙',
    href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit',
    external: true,
  },
  {
    title: 'Release Notes',
    description: 'Latest updates and changelog.',
    icon: '📋',
    href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/releases',
    external: true,
  },
  {
    title: 'Security Policy',
    description: 'How to report a vulnerability privately.',
    icon: '🔐',
    href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/blob/main/SECURITY.md',
    external: true,
  },
  {
    title: 'Report Issues',
    description: 'Found a bug? Let us know.',
    icon: '🐛',
    href: 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit/issues/new',
    external: true,
  },
]

// Agent collaboration info
export const agentCollaboration = [
  {
    title: 'Reports To',
    description: 'Agents escalate complex decisions to their supervisor (usually tech-lead).',
    icon: '⬆️',
  },
  {
    title: 'Consults',
    description: 'Agents can request input from peer specialists for cross-domain expertise.',
    icon: '↔️',
  },
  {
    title: 'Delegates',
    description: 'Higher-level agents delegate specific tasks to implementation specialists.',
    icon: '⬇️',
  },
]
