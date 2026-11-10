import { COMMAND_COUNT, findKitCommand } from './kitStats'

export interface CommandVariant {
  name: string
  description: string
}

export interface Command {
  name: string
  description: string
  example: string
  variants: CommandVariant[]
}

export interface CommandCategory {
  name: string
  description: string
  icon: string
  color: 'orange' | 'green' | 'cyan' | 'purple' | 'red'
  commands: Command[]
}

export const commandCategories: CommandCategory[] = [
  {
    name: 'Build',
    description: 'Create new features and implement code',
    icon: '🏗️',
    color: 'orange',
    commands: [
      {
        name: '/cook',
        description: 'Full-featured implementation with research, planning, testing, and review.',
        variants: [
          { name: 'fast', description: 'Quick execution, fewer phases' },
          { name: 'hard', description: 'Comprehensive, all phases' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/cook add user authentication with JWT',
      },
      {
        name: '/code',
        description: 'Quick code generation without the full workflow.',
        variants: [
          { name: 'fast', description: 'Quick execution' },
          { name: 'hard', description: 'Comprehensive' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/code create a React button component',
      },
      {
        name: '/fix',
        description: 'Fix bugs and issues with investigation and testing.',
        variants: [
          { name: 'fast', description: 'Quick fix' },
          { name: 'hard', description: 'Deep investigation' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/fix the login form validation is broken',
      },
    ],
  },
  {
    name: 'Quality',
    description: 'Ensure code quality and correctness',
    icon: '✅',
    color: 'green',
    commands: [
      {
        name: '/test',
        description: 'Generate comprehensive test suites for your code.',
        variants: [
          { name: 'fast', description: 'Quick tests' },
          { name: 'hard', description: 'Full coverage' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/test add tests for the auth service',
      },
      {
        name: '/review',
        description: 'Code review with security, performance, and best practices.',
        variants: [
          { name: 'fast', description: 'Quick review' },
          { name: 'hard', description: 'Deep review' },
          { name: 'team', description: 'Golden Triangle adversarial review' },
        ],
        example: '/review the changes in this PR',
      },
      {
        name: '/debug',
        description: 'Systematic debugging with root cause analysis.',
        variants: [
          { name: 'fast', description: 'Quick debug' },
          { name: 'hard', description: 'Deep analysis' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/debug why is the API returning 500 errors',
      },
    ],
  },
  {
    name: 'Plan',
    description: 'Plan and design before implementation',
    icon: '📋',
    color: 'cyan',
    commands: [
      {
        name: '/plan',
        description: 'Create detailed implementation plans with milestones.',
        variants: [
          { name: 'fast', description: 'Quick plan' },
          { name: 'hard', description: 'Detailed plan' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/plan redesign the database schema for scalability',
      },
      {
        name: '/brainstorm',
        description: 'Explore ideas and approaches before committing.',
        variants: [
          { name: 'fast', description: 'Quick ideas' },
          { name: 'hard', description: 'Deep exploration' },
          { name: 'team', description: 'Golden Triangle adversarial ideation' },
        ],
        example: '/brainstorm how should we handle real-time notifications',
      },
      {
        name: '/research',
        description: 'Deep technical research with multi-source triangulation and cited findings.',
        variants: [
          { name: 'fast', description: 'Quick lookup' },
          { name: 'hard', description: 'Multi-wave deep research' },
          { name: 'team', description: 'Golden Triangle 3-vector research' },
        ],
        example: '/research compare Drizzle and Prisma for edge runtimes',
      },
      {
        name: '/design',
        description: 'Design UI/UX or system architecture.',
        variants: [
          { name: 'fast', description: 'Quick design' },
          { name: 'hard', description: 'Full design' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/design a dashboard for analytics',
      },
    ],
  },
  {
    name: 'Docs',
    description: 'Generate and manage documentation',
    icon: '📝',
    color: 'purple',
    commands: [
      {
        name: '/docs:core',
        description: 'Generate core technical documentation.',
        variants: [],
        example: '/docs:core for the API module',
      },
      {
        name: '/docs:business',
        description: 'Generate business-focused documentation.',
        variants: [],
        example: '/docs:business create PRD for the feature',
      },
      {
        name: '/docs:audit',
        description: 'Audit existing documentation for gaps.',
        variants: [],
        example: '/docs:audit check the README',
      },
    ],
  },
  {
    name: 'Report',
    description: 'Create or update reports and summaries',
    icon: '📊',
    color: 'purple',
    commands: [
      {
        name: '/report',
        description: 'Create or update reports, status summaries, and documentation.',
        variants: [
          { name: 'fast', description: 'Quick status/summary' },
          { name: 'hard', description: 'Full analysis, any topic' },
          { name: 'team', description: 'Parallel multi-agent execution' },
        ],
        example: '/report status report for sprint',
      },
    ],
  },
  {
    name: 'Deploy',
    description: 'Deployment and operations',
    icon: '🚀',
    color: 'red',
    commands: [
      {
        name: '/deploy:check',
        description: 'Pre-deployment checks and validation.',
        variants: [],
        example: '/deploy:check verify production readiness',
      },
      {
        name: '/deploy:preview',
        description: 'Deploy to preview/staging environment.',
        variants: [],
        example: '/deploy:preview to staging',
      },
      {
        name: '/deploy:production',
        description: 'Deploy to production with safety checks.',
        variants: [],
        example: '/deploy:production with rollback plan',
      },
      {
        name: '/deploy:rollback',
        description: 'Rollback to previous version.',
        variants: [],
        example: '/deploy:rollback to v1.2.3',
      },
    ],
  },
  {
    name: 'Orchestration & Control',
    description: 'Autonomous multi-phase autopilot, multi-engine council, swarm orchestration, and unified settings',
    icon: '🎼',
    color: 'cyan',
    commands: [
      {
        name: '/autopilot',
        description: 'Multi-session autonomous project autopilot with persistent .boomopen/project-ledger.json tracking.',
        variants: [
          { name: 'init', description: 'Ingest spec docs and build Master Project DAG Ledger' },
          { name: 'run', description: 'Execute the next pending phase end-to-end with QA gates' },
          { name: 'audit', description: 'Audit implemented code against spec and ledger' },
        ],
        example: '/autopilot:init docs/PRD.md docs/ARCHITECTURE.md',
      },
      {
        name: '/conduct',
        description: 'Cross-engine conductor and parallel multi-engine council across Claude, Codex, Antigravity, Cursor, and Copilot.',
        variants: [
          { name: 'council', description: 'Parallel multi-engine consensus & blind peer review' },
          { name: 'pipeline', description: 'Cross-engine Author != Critic pipeline' },
        ],
        example: '/conduct:council architect a zero-downtime billing migration',
      },
      {
        name: '/orchestrate',
        description: 'Dynamic elastic multi-agent swarm orchestration with cognitive load sharding (role#shard).',
        variants: [],
        example: '/orchestrate full-stack checkout refactor across 4 domains',
      },
      {
        name: '/settings',
        description: 'Interactive Web Control Center & CLI settings manager synced across all 5 AI platforms.',
        variants: [],
        example: '/settings preset smart-hybrid',
      },
    ],
  },
]

// Quick reference commands for docs page
export const quickReferenceCommands = [
  { cmd: '/cook', desc: 'Full feature implementation', variants: ':fast, :hard, :team' },
  { cmd: '/fix', desc: 'Bug fix with investigation', variants: ':fast, :hard, :team' },
  { cmd: '/test', desc: 'Generate test suites', variants: ':fast, :hard, :team' },
  { cmd: '/review', desc: 'Code review', variants: ':fast, :hard, :team' },
  { cmd: '/research', desc: 'Deep technical research (boomopen research)', variants: ':fast, :hard, :team' },
  { cmd: '/brainstorm', desc: 'Orthogonal ideation & MCDA pre-mortem', variants: ':fast, :hard, :team' },
  { cmd: '/design', desc: '6-Block UI/UX & token contract (boomopen design)', variants: ':fast, :hard, :team' },
  { cmd: '/plan', desc: 'Contract-first blueprint (boomopen plan)', variants: ':fast, :hard, :team' },
  { cmd: '/debug', desc: 'Root cause analysis', variants: ':fast, :hard, :team' },
  { cmd: '/report', desc: 'Create/update reports and summaries', variants: ':fast, :hard, :team' },
  { cmd: '/autopilot', desc: 'Multi-session project autopilot', variants: ':init, :run, :audit' },
  { cmd: '/conduct', desc: 'Cross-engine conductor & council', variants: ':council, :pipeline' },
  { cmd: '/orchestrate', desc: 'Elastic multi-agent swarm', variants: 'role#shard' },
  { cmd: '/settings', desc: 'Unified Web UI & CLI settings', variants: 'ui, preset, set' },
  { cmd: '/docs', desc: 'Generate documentation', variants: ':core, :business, :audit' },
  { cmd: '/deploy', desc: 'Deployment workflows', variants: ':check, :preview, :production, :rollback' },
]

// Natural language detection examples
export const naturalLanguageExamples = [
  { input: '"implement user authentication"', detects: '/cook' },
  { input: '"fix the login bug"', detects: '/fix' },
  { input: '"add tests for the API"', detects: '/test' },
  { input: '"plan the refactoring"', detects: '/plan' },
  { input: '"review this code"', detects: '/review' },
  { input: '"run multi-phase project from spec"', detects: '/autopilot' },
  { input: '"run parallel multi-engine council"', detects: '/conduct:council' },
  { input: '"status report for sprint"', detects: '/report' },
]

// Quick start commands for installation page
export const quickStartCommands = [
  { cmd: '/cook add user authentication', desc: 'Full feature implementation' },
  { cmd: '/fix the login bug', desc: 'Bug fix with investigation' },
  { cmd: '/autopilot:init docs/SPEC.md', desc: 'Multi-phase project autopilot' },
  { cmd: '/conduct:council review architecture', desc: 'Multi-engine council consensus' },
  { cmd: '/plan redesign the database', desc: 'Create implementation plan' },
  { cmd: '/settings', desc: 'Open Unified Settings & Web UI' },
]

// Keep listed variants in step with commands/<name>-<variant>.md (kit-stats.json is generated at build).
const DEFAULT_VARIANT_DESCRIPTIONS: Record<string, string> = {
  fast: 'Quick execution',
  hard: 'Comprehensive',
  team: 'Golden Triangle multi-agent execution',
}
for (const category of commandCategories) {
  for (const command of category.commands) {
    const kitCommand = findKitCommand(command.name.replace(/^\//, ''))
    if (!kitCommand) continue
    for (const variant of kitCommand.variants) {
      if (command.variants.some((existing) => existing.name === variant)) continue
      command.variants.push({ name: variant, description: DEFAULT_VARIANT_DESCRIPTIONS[variant] ?? `${variant} variant` })
    }
  }
}

// Total base commands shipped in commands/*.md (via kit-stats.json)
export const getTotalCommands = (): number => COMMAND_COUNT

export const totalCommands = getTotalCommands()
