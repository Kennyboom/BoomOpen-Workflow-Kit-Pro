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
      en: 'Native Turn-1 invoke_subagent & Python run_workflow fan-out, --as-plugin bundle mode, warm send_message reuse, Brain Artifacts, 87 workflows (93 files), and shared ~/.agents/skills_library.',
      vi: 'Fan-out song song qua invoke_subagent & Python run_workflow, gói --as-plugin, tái sử dụng phiên ấm send_message, Brain Artifacts, 87 workflow (93 tệp) và kho chung ~/.agents/skills_library.',
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
      en: 'Parallel Task/Agent shards, /plan:hard avoiding native /plan collision, Stop & PreCompact session hooks, 93 command files (36 slash commands), 22 agents, and shared ~/.agents/skills_library.',
      vi: 'Phân mảnh Task/Agent song song, /plan:hard tránh đụng lệnh gốc, hook bảo vệ phiên Stop & PreCompact, 93 tệp lệnh (36 lệnh slash), 22 chuyên gia và kho chung ~/.agents/skills_library.',
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
      en: 'Ships 22 native TOML role configs with strict read-only sandboxing for scouts/critics, spawn_agent + send_input orchestration, 87 $boomopen-* skills, and shared ~/.agents/skills_library.',
      vi: 'Trang bị 22 cấu hình TOML bản địa với sandbox read-only cho scout/critic, điều phối spawn_agent + send_input, 87 gói kỹ năng $boomopen-* và kho chung ~/.agents/skills_library.',
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
      en: 'Integrates always-on .mdc workspace rules, parallel Task subagents, 87 global slash workflows (93 command files), and deduplicated 1,462-skill resolution via ~/.agents/skills_library.',
      vi: 'Tích hợp quy tắc .mdc luôn bật, subagent Task chạy song song, 87 workflow slash toàn cục (93 tệp lệnh) và tra cứu 1.462 kỹ năng chống trùng lặp qua ~/.agents/skills_library.',
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
      en: 'Installs the VS Code Copilot custom agent profile, fresh-context #runSubagent handoff packets, 93 command specs (87 workflows), deterministic CLI gates, and shared ~/.agents/skills_library.',
      vi: 'Cài đặt hồ sơ custom agent cho VS Code Copilot, gói bàn giao #runSubagent ngữ cảnh sạch, 93 tệp lệnh (87 workflow), cổng CLI tất định và kho chung ~/.agents/skills_library.',
    },
  },
]

export function findPlatformSpec(id: PlatformId): PlatformSpec | undefined {
  return PLATFORMS.find((platform) => platform.id === id)
}
