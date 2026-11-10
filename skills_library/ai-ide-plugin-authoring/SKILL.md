---
name: ai-ide-plugin-authoring
description: Authoring cross-platform AI coding assistant rules, SKILL.md modules, slash workflows, Cursor .mdc rules, and PreToolUse safety hooks across Antigravity 2.0, Claude Code, OpenAI Codex, Cursor, and GitHub Copilot.
domain: tools
---

# Cross-Platform AI IDE Plugin, Rule & Skill Authoring

## 1. When to Use This Skill
Use this skill when creating, packaging, auditing, or synchronizing **AI coding assistant extensions, rules, skills, and safety hooks** across the 5 major agentic IDE platforms:
- **Google Antigravity 2.0 (Gemini)**: `~/.gemini/GEMINI.md`, `AntigravityGlobal.agent.md`, and `hooks/validate-tool-call.mjs`.
- **Anthropic Claude Code**: `~/.claude/CLAUDE.md`, `.claude/commands/*.md`, and `.claude/agents/*.md`.
- **OpenAI Codex CLI**: `~/.codex/CODEX.md`, `AGENTS.md`, `config.toml`, and `agents/*.toml`.
- **Cursor AI Editor**: `.cursor/rules/*.mdc` (frontmatter `globs` / `alwaysApply`) and `~/.cursor/CURSOR.md`.
- **GitHub Copilot (VS Code)**: `.github/copilot-instructions.md` and `*.agent.md` prompt files.

---

## 2. Core Architecture Principles
1. **Progressive Disclosure (Zero Cold-Start Tax)**:
   - Global entrypoints (`GEMINI.md`, `CLAUDE.md`, `CODEX.md`, `.mdc`) are injected on **every turn**. Keep entrypoints compact (`<= 220 lines`) and load heavy domain specifications (`SKILL.md`, `rules/*.md`, `references/*.md`) **on-demand** only when triggered.
2. **AOT Marker-Based Configuration Injection**:
   - Use deterministic HTML comment markers (`<!-- BOOMOPEN-SETTINGS-START --> ... <!-- BOOMOPEN-SETTINGS-END -->`) to hot-sync user settings into platform entrypoints in `< 10ms` without runtime file-read tool calls on Turn 1.
3. **Canonical `SKILL.md` Frontmatter Contract**:
   - Every skill folder (`skills/<skill-id>/SKILL.md`) MUST begin with valid YAML frontmatter containing `name`, `description` (with clear trigger conditions), and `domain`, staying `<= 350 lines`.
4. **Opt-In Destructive Command Guard (`validate-tool-call.mjs`)**:
   - Pair prompt instructions with opt-in runtime command guards (`validate-tool-call.mjs`, registered via `boomopen install claude --with-hooks` or manual `BeforeTool` config) that exit `2` (`BLOCKED`) on catastrophic filesystem/disk/fork-bomb accidents (`rm -rf` / `Remove-Item -Recurse` / `del /s` against `/`, home folders, drives, or system folders; `mkfs` / `wipefs` / `Format-Volume`; `dd` to raw disks; fork bombs; payloads `> 8 MiB`). Remember it is an accident safety net, **not a sandbox** (it does not inspect scripts, aliases, encoded commands, git history pushes, SQL statements, or file writes).

---

## 3. Platform Format Templates

### 3.1. Cursor `.mdc` Rule Format (`.cursor/rules/boomopen-workflow-kit.mdc`)
```markdown
---
description: BoomOpen Smart-Hybrid Multi-Agent Orchestration & Pragmatic 2-Tier Coding Standards
globs: "**/*"
alwaysApply: true
---

# ⚡ BoomOpen Workflow Kit v5.5 (Cursor Edition)

<!-- BOOMOPEN-SETTINGS-START -->
## 🎛️ ACTIVE USER SETTINGS OVERRIDE
- **Active Preset**: `smart-hybrid` | **Execution Mode**: `auto`
<!-- BOOMOPEN-SETTINGS-END -->

## 📏 Pragmatic 2-Tier Coding Standards
- **Tier 1 (Zero Tolerance)**: Single Responsibility, NO explicit `any`, NO leftover `console.log` in production code, mandatory `try/catch` on async/API boundaries.
- **Tier 2 (Cohesive Structure)**: Soft target `200-350 lines` (soft ceiling `400-450 lines`, hard split `> 500 lines`).
```

### 3.2. OpenAI Codex Multi-Agent TOML (`platforms/codex/config.toml`)
```toml
project_doc_fallback_filenames = ["AGENT.md", "CODEX.md", "AGENTS.md", ".agents.md"]

[features]
multi_agent = true

[agents.backend-engineer]
description = "Backend API, database, and server-side implementation specialist"
config_file = "agents/backend-engineer.toml"

[agents.reviewer]
description = "4-way code quality, architecture, security, and performance auditor"
config_file = "agents/reviewer.toml"
```

---

## 4. Opt-In Destructive Filesystem & Disk Guard (`validate-tool-call.mjs`)

> **Scope (`SECURITY.md`)**: Exit `0` = allowed; exit `2` = blocked (reason on `stderr`, JSON `deny` decision on `stdout`). Guards against catastrophic filesystem root, home-folder, drive, and system-folder deletion (`rm -rf`, `Remove-Item -Recurse`, `del /s`), disk formatting (`mkfs`, `wipefs`, `Format-Volume`), raw-disk `dd` writes, fork bombs, and payloads over `8 MiB`. It is an opt-in accident guard, not a sandbox.

```javascript
const DESTRUCTIVE_COMMAND_PATTERNS = [
  { id: 'ROOT_OR_HOME_DELETE', regex: /\b(?:rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|Remove-Item\b[^\n]*-Recurse)\s+(?:\/|~|\$HOME|[A-Za-z]:\\?\s*$|--no-preserve-root)/i },
  { id: 'DISK_FORMAT', regex: /\b(?:mkfs(?:\.\w+)?|wipefs|Format-Volume)\b/i },
  { id: 'RAW_DISK_DD', regex: /\bdd\b[^\n]*\bof=\/dev\/(?:sd[a-z]|nvme\d+n\d+|disk\d+)\b/i },
  { id: 'FORK_BOMB', regex: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/ },
];

/**
 * Deterministically evaluate a shell command before execution.
 * @param {string} commandLine
 * @returns {{ allowed: boolean, ruleId?: string, reason?: string }}
 */
export function evaluateCommand(commandLine = '') {
  const normalized = String(commandLine).trim();
  for (const rule of DESTRUCTIVE_COMMAND_PATTERNS) {
    if (rule.regex.test(normalized)) {
      return {
        allowed: false,
        ruleId: rule.id,
        reason: `BLOCKED destructive command matching rule ${rule.id}`,
      };
    }
  }
  return { allowed: true };
}
```

---

## 5. Multi-Platform Template Synchronization Pattern

```javascript
const fs = require('node:fs');

function copyTemplateWithTokenReplacements(srcPath, destPath, replacements) {
  let content = fs.readFileSync(srcPath, 'utf8');
  const sortedTokens = Object.keys(replacements).sort((a, b) => b.length - a.length);
  for (const token of sortedTokens) {
    content = content.replaceAll(token, replacements[token]);
  }
  fs.writeFileSync(destPath, content, 'utf8');
}
```

---

## 6. Anti-Patterns to Avoid
- ❌ **Bloated Global Entrypoints (`> 350 lines`)**: Consumes thousands of tokens on every turn and degrades instruction adherence.
- ❌ **Hardcoded User Home Paths (`C:\Users\Alice\...` or `/Users/alice/...`)**: Always use portable placeholders (`~/.gemini/`, `~/.claude/`, `{TOOL}`) in committed templates.
- ❌ **Nested Subdirectories in Flat Workflow Directories**: Antigravity `global_workflows/` requires flat `*.md` files (`cook-fast.md`, not `cook/fast.md`).

---

## 7. Verification Checklist
- [ ] All 5 platform entrypoints stay `<= 220 lines` and include `<!-- BOOMOPEN-SETTINGS-START/END -->`.
- [ ] Zero personal paths or OS-specific absolute paths exist in committed skill/rule files.
- [ ] Every `SKILL.md` has valid YAML frontmatter (`name`, `description`, `domain`).
- [ ] Opt-in `validate-tool-call.mjs` guard exits `2` (`BLOCKED`) on catastrophic root/home/drive deletions, `mkfs`/`wipefs`/`Format-Volume`, raw-disk `dd`, and fork bombs.
