/**
 * Install instructions shown across the site.
 *
 * The npm package is NOT published: install from a git clone. Do not advertise
 * `npm install -g @boomopen/workflow-kit` or `npx boomopen-workflow-kit`.
 * The CLI binary (package.json "bin") is `boomopen`; `node cli/install.js` works without linking.
 */
export const REPO_GIT_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit.git'
export const REPO_DIR = 'BoomOpen-Workflow-Kit'

export const CLONE_COMMAND = `git clone ${REPO_GIT_URL}`
export const CD_COMMAND = `cd ${REPO_DIR}`
export const LINK_COMMAND = 'npm link'

export type ToolId = 'cursor' | 'claude' | 'copilot' | 'antigravity' | 'codex'

/** Command run from the cloned repository (no global link needed). */
export const localInstallCommand = (tool: ToolId | '--all'): string => `node cli/install.js install ${tool}`
export const localUninstallCommand = (tool: ToolId | '--all'): string => `node cli/install.js uninstall ${tool}`

/** Command after `npm link` exposes the `boomopen` binary. */
export const cliInstallCommand = (tool: ToolId | '--all'): string => `boomopen install ${tool}`
export const cliUninstallCommand = (tool: ToolId | '--all'): string => `boomopen uninstall ${tool}`

/** Lists supported tools and whether each one is installed. */
export const VERIFY_COMMAND = 'node cli/install.js list'

/** One-line quick start used by the hero terminal. */
export const QUICK_INSTALL_ONE_LINER = `${CLONE_COMMAND} && ${CD_COMMAND} && ${localInstallCommand('claude')}`

/** Ordered steps for the installation page. */
export const INSTALL_STEPS: string[] = [CLONE_COMMAND, CD_COMMAND, localInstallCommand('--all')]

/** Deterministic v5.5 CLI compilers and quality gates exposed after `npm link`. */
export const CLI_SUITE_COMMANDS: string[] = [
  'boomopen doctor',
  'boomopen research validate RESEARCH-auth.md',
  'boomopen design validate DESIGN-dashboard.md',
  'boomopen plan validate PLAN-auth.md',
  'boomopen cook preflight --plan PLAN-auth.md',
  'boomopen check ./src --strict-phase --no-stubs',
  'boomopen ledger status',
  'boomopen conduct probe',
]
