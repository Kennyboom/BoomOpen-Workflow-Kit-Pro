# BoomOpen Workflow Kit CLI

Command-line installer and tooling for the BoomOpen Workflow Kit. The version is the
`"version"` field of the repository's `package.json` (`boomopen --version` prints it).

## Install the CLI

The kit is **not published on npm**. Do not install npm packages that claim to be it.
Install from a clone of the repository:

```bash
git clone https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro.git
cd BoomOpen-Workflow-Kit-Pro
node cli/install.js install claude        # one tool
node cli/install.js install --all         # every supported tool

# Optional: put `boomopen` on your PATH (links this clone, nothing is downloaded)
npm link
boomopen install cursor
```

Node.js 18 or newer is required. The CLI uses only Node built-ins.

## Usage

```
Usage: boomopen <command> [options]
   or: node cli/install.js <command> [options]

Commands:
  install <tool>     Install for one tool: cursor, copilot, antigravity, claude, codex
  install --all      Install for every supported tool
  uninstall <tool>   Remove the kit from one tool (or --all); your own files are kept
  list               Show supported tools and what is installed
  settings [subcmd]  Presets, execution mode, sync, or the local Web UI (settings --ui); see "settings help"
  cook [subcmd]      State detection, wave handoff packets & post-wave verification; see "cook help"
  research [subcmd]  Validate RESEARCH/BRAINSTORM.md (4 gates) & extract HANDOFF_BRIEF; see "research help"
  design [subcmd]    Validate DESIGN.md (4 gates) & extract DESIGN_CONTRACT; see "design help"
  plan [subcmd]      Validate PLAN.md (5 gates) & compile to project-ledger.json; see "plan help"
  ledger [subcmd]    Multi-session project ledger, phase gate, and RTM audit; see "ledger help"
  conduct [subcmd]   Multi-engine cross-platform conductor & parallel council; see "conduct help"
  doctor             Kit source and installed-platform health checks (read-only)
  check [dir]        Audit source files against the Pragmatic 2-Tier Coding Standards
  help               Show help

Options:
  --all              With install/uninstall: every supported tool
  --with-hooks       Also register the opt-in destructive-command guard (Claude Code PreToolUse hook)
  --force            Accepted for compatibility (files are always compared by content)
  -v, --version      Print the kit version
  -h, --help         Show help
```

## What gets installed

Every tool gets the kit framework folder `<skills>/boomopen-workflow-kit/` (`SKILL.md`, `rules/`,
`commands/` (also as `workflows/`), `agents/`, `documents/`, `matrix-skills/`, `cli/`, the Python
helpers in `scripts/` and the guard in `hooks/`), the 22 core skills from `skills/` and the
on-demand vault from `skills_library/` (as `<skills>_library/`).

| Tool | Instruction files | Skills folder | Other |
| ---- | ----------------- | ------------- | ----- |
| **Antigravity / Gemini** | `~/.gemini/GEMINI.md` (kit block) | `~/.gemini/config/skills/` | `~/.gemini/agents/AntigravityGlobal.agent.md`, workflows in `~/.antigravity/workflows/` and `~/.gemini/config/global_workflows/` |
| **Claude Code** | `~/.claude/CLAUDE.md`, `~/.claude/AGENT.md` | `~/.claude/skills/` | `~/.claude/commands/`, `~/.claude/agents/` |
| **Codex** | `~/.codex/AGENTS.md` (read by Codex), `~/.codex/CODEX.md`, `~/.codex/AGENT.md` | `~/.codex/skills/` (+ native command skills) | agent role TOMLs in `~/.codex/agents/boomopen/` (a kit-only subfolder, so your own role files are never touched), a managed block in `~/.codex/config.toml` |
| **Cursor** | `~/.cursor/CURSOR.md`, `~/.cursor/AGENT.md` | `~/.cursor/skills/` | `~/.cursor/rules/boomopen-workflow-kit.mdc`, `~/.cursor/commands/`, `~/.cursor/agents/` |
| **GitHub Copilot** | `~/.copilot/COPILOT.md`, `~/.copilot/AGENT.md` | `~/.copilot/skills/` | agent file `boomopen-workflow-kit.agent.md` in the VS Code user `prompts` folder (`%APPDATA%\Code\User\prompts` on Windows, `~/Library/Application Support/Code/User/prompts` on macOS, `$XDG_CONFIG_HOME/Code/User/prompts` on Linux); agents in `~/.copilot/agents/`, commands in `~/.copilot/commands/` |

## Safety model

- **Your files are never deleted or overwritten blindly.** Shared instruction files get a
  `<!-- boomopen-workflow-kit-START -->` … `<!-- boomopen-workflow-kit-END -->` block; your own
  text outside the block is kept, and a pristine copy is saved as `<file>.boomopen-backup` the
  first time the kit changes it.
- **Install manifest.** Every file the kit writes is recorded with its sha256 in
  `~/.boomopen/manifests/<tool>.json`. Uninstall removes only files that still match the manifest;
  files you edited are kept.
- **Backups.** Kit files replaced by a reinstall are moved to `~/.boomopen/backups/<tool>/`.
  An instruction file that still holds text the kit did not write is saved as
  `<file>.boomopen-backup-<timestamp>` before uninstall changes it; symlinked files keep their link.
- **Upgrades from pre-manifest installs.** Only when an older kit install is found are skills that
  old releases bundled (and that are byte-identical to the vault copy) moved to
  `~/.boomopen/backups/<tool>/legacy-skills/`; uninstall moves them back. A fresh install never
  touches your skills.
- **Run install/uninstall from a clone.** The copy installed under
  `~/.<tool>/skills/boomopen-workflow-kit/cli/` runs `check`, `doctor`, `settings`, `cook`, `research`,
  `design`, `plan`, `ledger`, `conduct` and `list`, but refuses `install` / `uninstall`.
- **Empty folders.** Tool folders the kit created (`~/.claude`, `~/.codex`, …, `~/.boomopen`) are
  removed again by uninstall when nothing else is left in them.
- **Codex `config.toml`.** The kit's settings are merged as a managed block and the result is
  validated as TOML before it is written; uninstall strips only that block. Edits you make to the
  kit's tagged lines (e.g. a name added to `project_doc_fallback_filenames`, `multi_agent = false`)
  are kept by reinstall and uninstall; if you edit inside the managed block, your `config.toml` is
  saved as `config.toml.boomopen-backup-<timestamp>` before a reinstall resets the block. A leading
  UTF-8 BOM is preserved. Kit role TOMLs live in `~/.codex/agents/boomopen/`, so a role you define
  yourself (e.g. `agents/reviewer.toml`) is never overwritten.
- **Doctor from an installed copy.** Each framework folder holds `install-files.json`, the list of
  files the install wrote; `doctor` run from that copy checks the folder against it (and always
  requires non-empty `rules/`, `commands/`, `agents/`, `scripts/`). A platform whose framework
  folder is gone but whose manifest or entry files remain is reported as broken, not as
  "not installed".
- **Guard hook.** `hooks/validate-tool-call.mjs` is copied for every tool but registered only with
  `boomopen install claude --with-hooks`. See `SECURITY.md`.

## Settings

`boomopen settings help` lists the subcommands. Global settings live in `~/.boomopen/settings.json`;
`--project` writes `./.boomopen.json` in the current folder (run it from your project, not from the
kit clone). Changing global settings re-syncs the settings block in the kit's installed entry files.

## Development

```bash
npm test          # node:test suites (sandboxed HOME, never your real profile)
npm run lint      # node --check on every CLI module, test, hook and maintenance script
node cli/install.js doctor
node cli/install.js check .
```

## License

MIT, see the repository `LICENSE`. Third-party skills in `skills_library/` keep their own licenses
(see `THIRD_PARTY_NOTICES.md`).
