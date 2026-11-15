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
      en: 'Native Turn-1 parallel invoke_subagent fan-out, warm send_message session reuse, Brain Artifact UI routing, and global workflow parity.',
      vi: 'Fan-out subagent song song ngay Turn 1 qua invoke_subagent, tái sử dụng phiên ấm bằng send_message, định tuyến Brain Artifact và đồng bộ workflow toàn cục.',
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
      en: 'Dispatches parallel Task/Agent shards with disjoint OWNED_FILES write locks, SendMessage warm reuse, 89 command files (33 slash commands), and 22 specialist profiles.',
      vi: 'Điều phối các shard Task/Agent song song với khóa ghi OWNED_FILES tách biệt, tái sử dụng phiên ấm qua SendMessage, đủ 89 tệp lệnh (33 lệnh slash) và 22 chuyên gia.',
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
      en: 'Ships 22 native TOML role configs, spawn_agent + send_input multi-agent orchestration, and 83 generated $boomopen-* command skill bundles.',
      vi: 'Trang bị 22 cấu hình TOML bản địa, điều phối đa tác tử qua spawn_agent + send_input và 83 gói kỹ năng lệnh $boomopen-* tự động biên dịch.',
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
      en: 'Integrates always-on .mdc workspace rules, parallel Task subagents, 83 global slash workflows (89 command files), and on-demand 1,462-skill resolution inside Cursor IDE.',
      vi: 'Tích hợp quy tắc .mdc luôn bật, subagent Task chạy song song, 83 workflow slash toàn cục (89 tệp lệnh) và tra cứu kho 1,462 kỹ năng trực tiếp trong Cursor IDE.',
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
      en: 'Installs the VS Code Copilot custom agent profile, fresh-context #runSubagent handoff packets, deterministic CLI gates, and bilingual workflow routing.',
      vi: 'Cài đặt hồ sơ custom agent cho VS Code Copilot, gói bàn giao #runSubagent ngữ cảnh sạch, cổng kiểm định CLI tất định và định tuyến đa ngôn ngữ.',
    },
  },
]

export function findPlatformSpec(id: PlatformId): PlatformSpec | undefined {
  return PLATFORMS.find((platform) => platform.id === id)
}
