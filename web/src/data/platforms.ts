import type { PlatformId, PlatformSpec } from '../types/ui-contract'

export const REPO_URL = 'https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro'

export const CLONE_SNIPPET =
  'git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git && cd BoomOpen-Workflow-Kit-Pro'

export const INSTALL_ALL_COMMAND = `${CLONE_SNIPPET} && node cli/install.js install --all`

export const DOCTOR_VERIFY_COMMAND = 'node cli/install.js doctor'

export const PLATFORMS: readonly PlatformSpec[] = [
  {
    id: 'antigravity',
    name: 'Antigravity (Gemini)',
    vendor: 'Google DeepMind',
    entryFile: '~/.gemini/GEMINI.md',
    frameworkPath: '~/.gemini/config/skills/boomopen-workflow-kit/',
    installCommand: `${CLONE_SNIPPET} && node cli/install.js install antigravity`,
    verifyCommand: DOCTOR_VERIFY_COMMAND,
    uninstallCommand: 'node cli/install.js uninstall antigravity',
    summary: {
      en: '21-line frontier-guardrails in GEMINI.md, native invoke_subagent & Python run_workflow fan-out, /goal persistent runner, --as-plugin mode, opt-in --with-hooks, Brain artifacts, and shared ~/.agents/skills_library.',
      vi: 'Cấu hình gọn 21 dòng frontier-guardrails trong GEMINI.md, chạy song song invoke_subagent & Python run_workflow, vòng lặp /goal, gói --as-plugin, tùy chọn --with-hooks, Brain artifacts và kho chung ~/.agents/skills_library.',
    },
  },
  {
    id: 'claude',
    name: 'Claude Code',
    vendor: 'Anthropic',
    entryFile: '~/.claude/CLAUDE.md',
    frameworkPath: '~/.claude/skills/boomopen-workflow-kit/',
    installCommand: `${CLONE_SNIPPET} && node cli/install.js install claude`,
    verifyCommand: DOCTOR_VERIFY_COMMAND,
    uninstallCommand: 'node cli/install.js uninstall claude',
    summary: {
      en: '21-line frontier-guardrails in CLAUDE.md, parallel Task/Agent shards, /plan:hard avoiding native /plan collision, opt-in --with-hooks (PreToolUse, Stop, PreCompact), 93 command files, 22 sub-agents, and ~/.agents/skills_library.',
      vi: 'Cấu hình gọn 21 dòng trong CLAUDE.md, chạy song song Task/Agent, /plan:hard tránh đụng lệnh gốc, tùy chọn --with-hooks (PreToolUse, Stop, PreCompact), 93 tệp lệnh, 22 sub-agent và kho chung ~/.agents/skills_library.',
    },
  },
  {
    id: 'codex',
    name: 'OpenAI Codex',
    vendor: 'OpenAI',
    entryFile: '~/.codex/AGENTS.md + ~/.codex/config.toml',
    frameworkPath: '~/.codex/skills/boomopen-workflow-kit/',
    installCommand: `${CLONE_SNIPPET} && node cli/install.js install codex`,
    verifyCommand: DOCTOR_VERIFY_COMMAND,
    uninstallCommand: 'node cli/install.js uninstall codex',
    summary: {
      en: '21-line frontier-guardrails in AGENTS.md, 22 TOML roles in ~/.codex/agents/boomopen/ with OS sandbox_mode read-only isolation for scouts and reviewers, 87 $boomopen-* skills, and shared ~/.agents/skills_library.',
      vi: 'Cấu hình gọn 21 dòng trong AGENTS.md, 22 vai trò TOML kèm cơ chế OS sandbox_mode chỉ đọc cho scout và reviewer, hợp nhất config.toml, 87 kỹ năng $boomopen-* và kho chung ~/.agents/skills_library.',
    },
  },
  {
    id: 'cursor',
    name: 'Cursor',
    vendor: 'Anysphere',
    entryFile: '~/.cursor/CURSOR.md + ~/.cursor/rules/boomopen-workflow-kit.mdc',
    frameworkPath: '~/.cursor/skills/boomopen-workflow-kit/',
    installCommand: `${CLONE_SNIPPET} && node cli/install.js install cursor`,
    verifyCommand: DOCTOR_VERIFY_COMMAND,
    uninstallCommand: 'node cli/install.js uninstall cursor',
    summary: {
      en: 'Slim .mdc + CURSOR.md rules, parallel Task sub-agents, opt-in --with-hooks (beforeShellExecution), 87 slash workflows (93 command files), ./reports/{topic}/ deliverables, and shared ~/.agents/skills_library.',
      vi: 'Quy tắc gọn nhẹ trong .mdc & CURSOR.md, chạy song song Task sub-agent, tùy chọn --with-hooks (beforeShellExecution), 87 workflow (93 tệp lệnh), lưu báo cáo tại ./reports/{topic}/ và kho chung ~/.agents/skills_library.',
    },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    vendor: 'GitHub / Microsoft',
    entryFile: '~/.copilot/COPILOT.md + VS Code prompts/boomopen-workflow-kit.agent.md',
    frameworkPath: '~/.copilot/skills/boomopen-workflow-kit/',
    installCommand: `${CLONE_SNIPPET} && node cli/install.js install copilot`,
    verifyCommand: DOCTOR_VERIFY_COMMAND,
    uninstallCommand: 'node cli/install.js uninstall copilot',
    summary: {
      en: 'VS Code Copilot custom agent profile, slim COPILOT.md rules, #runSubagent handoff packets, 93 command files (87 workflows), ./reports/{topic}/ deliverables, local CLI checks, and shared ~/.agents/skills_library.',
      vi: 'Hồ sơ custom agent cho VS Code Copilot, quy tắc gọn trong COPILOT.md, gói bàn giao #runSubagent, 93 tệp lệnh (87 workflow), kiểm tra nhất quán bằng CLI và kho chung ~/.agents/skills_library.',
    },
  },
]

export function findPlatformSpec(id: PlatformId): PlatformSpec | undefined {
  return PLATFORMS.find((platform) => platform.id === id)
}
