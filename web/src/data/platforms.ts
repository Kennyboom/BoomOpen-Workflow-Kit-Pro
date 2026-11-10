import { localInstallCommand, localUninstallCommand, type ToolId } from './install'

export type PlatformStatus = 'full' | 'partial' | 'coming-soon'

export interface Platform {
  id: ToolId
  name: string
  icon: string
  description: string
  status: PlatformStatus
  configFile: string
  installPath: string
  features: string[]
  steps: string[]
  /** [install, uninstall] commands, run from the cloned repository. */
  setup: [string, string]
}

export const platforms: Platform[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: '⚡',
    description: 'Full integration with Cursor IDE through .cursorrules and custom rules.',
    status: 'full',
    configFile: '~/.cursor/CURSOR.md + ~/.cursor/rules/',
    installPath: '~/.cursor/skills/boomopen-workflow-kit/',
    features: [
      'Custom agent rules',
      'Skill auto-discovery',
      'Command workflows',
      'Sub-agent orchestration',
    ],
    steps: [
      'Clone the repository and run the install command',
      'Restart Cursor IDE',
      'BoomOpen Workflow Kit auto-discovers from global path',
      'Start using /cook, /fix, /test commands',
    ],
    setup: [localInstallCommand('cursor'), localUninstallCommand('cursor')],
  },
  {
    id: 'claude',
    name: 'Claude Code',
    icon: '🤖',
    description: 'Native support through CLAUDE.md for seamless Claude integration.',
    status: 'full',
    configFile: '~/.claude/CLAUDE.md',
    installPath: '~/.claude/skills/boomopen-workflow-kit/',
    features: [
      'Native Claude support',
      'CLAUDE.md configuration',
      'Full skill library',
      'Orchestration laws',
    ],
    steps: [
      'Clone the repository and run the install command',
      'CLAUDE.md is auto-detected in projects',
      'Global config applies to all projects',
      'Use slash commands in any project',
    ],
    setup: [localInstallCommand('claude'), localUninstallCommand('claude')],
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    description: 'Works with GitHub Copilot through boomopen-workflow-kit.agent.md files.',
    status: 'full',
    configFile: 'VS Code prompts/boomopen-workflow-kit.agent.md + ~/.copilot/COPILOT.md',
    installPath: '~/.copilot/skills/boomopen-workflow-kit/',
    features: [
      'Copilot agents',
      'Workspace integration',
      'Custom instructions',
      'Skill injection',
    ],
    steps: [
      'Clone the repository and run the install command',
      'Agent files are auto-detected',
      'Works with Copilot Chat',
      'Full orchestration support',
    ],
    setup: [localInstallCommand('copilot'), localUninstallCommand('copilot')],
  },
  {
    id: 'antigravity',
    name: 'Antigravity',
    icon: '🚀',
    description: 'Full support for Antigravity through GEMINI.md configuration.',
    status: 'full',
    configFile: '~/.gemini/GEMINI.md',
    installPath: '~/.gemini/config/skills/boomopen-workflow-kit/',
    features: [
      'Gemini integration',
      'Global configuration',
      'Agent workflows',
      'Matrix skills',
    ],
    steps: [
      'Clone the repository and run the install command',
      'GEMINI.md is auto-detected',
      'Global configuration applies',
      'Use all commands and workflows',
    ],
    setup: [localInstallCommand('antigravity'), localUninstallCommand('antigravity')],
  },
  {
    id: 'codex',
    name: 'Codex',
    icon: '💻',
    description: 'Full support for OpenAI Codex through AGENTS.md (primary) and CODEX.md compatibility.',
    status: 'full',
    configFile: '~/.codex/AGENTS.md + ~/.codex/CODEX.md',
    installPath: '~/.codex/skills/boomopen-workflow-kit/',
    features: [
      'Codex integration',
      'CODEX.md configuration',
      'Full skill library',
      'Orchestration laws',
    ],
    steps: [
      'Clone the repository and run the install command',
      'CODEX.md is auto-detected in projects',
      'Global config applies to all projects',
      'Use slash commands in any project',
    ],
    setup: [localInstallCommand('codex'), localUninstallCommand('codex')],
  },
]

// Platform comparison features
export const platformComparisonFeatures = [
  { feature: 'Agent Orchestration', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
  { feature: 'Skill Injection', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
  { feature: 'Command Workflows', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
  { feature: 'Quality Gates', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
  { feature: 'Global Config', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
  { feature: 'Sub-agent Invocation', cursor: true, claude: true, copilot: true, antigravity: true, codex: true },
]

// Simplified platform data for badges
export const platformBadges = platforms.map(p => ({
  name: p.name,
  emoji: p.icon,
  status: p.status,
}))

// Get platform by ID
export const getPlatformById = (id: ToolId) => platforms.find(p => p.id === id)

// Total platforms count
export const totalPlatforms = platforms.length
