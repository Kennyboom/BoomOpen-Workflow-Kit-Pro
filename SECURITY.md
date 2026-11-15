# Security Policy

## Supported Versions

Only the latest release line of **BoomOpen Workflow Kit** receives security fixes:

| Version | Supported |
| ------- | --------- |
| **5.5.x** | ✅ Supported |
| **< 5.5.0** | ❌ Unsupported (upgrade by pulling the latest `main` and re-running the installer) |

The kit is distributed from source (`git clone` + `node cli/install.js install <tool>`). It is **not** published to npm yet; any npm package claiming to be BoomOpen Workflow Kit is not an official release.

---

## What the Kit Does and Does Not Protect

1. **Destructive command guard hook (`validate-tool-call.mjs`) — opt-in.**
   - The installer copies the guard to `<framework>/hooks/validate-tool-call.mjs` for every tool (for example `~/.claude/skills/boomopen-workflow-kit/hooks/`), but it is a plain file until you register it.
   - The installer does **not** register this hook unless you run `boomopen install claude --with-hooks` (which adds a `PreToolUse` hook with matcher `"Bash"` to `~/.claude/settings.json`) or `boomopen install antigravity --with-hooks` (which adds a `"boomopen-guard"` `PreToolUse` hook with matcher `"run_command"` to `~/.gemini/config/hooks.json`). `boomopen uninstall <tool>` removes the registration again, and `boomopen doctor` reports whether it is registered.
   - Gemini CLI: register it yourself in `~/.gemini/settings.json`. The easiest way is to copy the exact snippet that `node cli/install.js install antigravity` prints (it contains the absolute path of the installed script). Written by hand it looks like this, with `<HOME>` replaced by your **absolute** home folder (for example `C:/Users/you` or `/home/you`):
     `"hooks": {"BeforeTool": [{"matcher": "run_shell_command", "hooks": [{"name": "boomopen-guard", "type": "command", "command": "node \"<HOME>/.gemini/config/skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs\""}]}]}`.
     Do **not** write `~` inside the quotes: shells do not expand `~` in double quotes (and cmd.exe never does), so Node cannot find the script, the hook exits with code 1 and Gemini CLI treats that as a non-blocking error — the guard silently does nothing. After registering it, test it once: `echo '{"tool_name":"run_shell_command","tool_input":{"command":"rm -rf /"}}' | node "<HOME>/.gemini/config/skills/boomopen-workflow-kit/hooks/validate-tool-call.mjs"` must print `BLOCKED` and exit with code 2.
     Other hosts: run the script (absolute path) before each shell command with the tool-call JSON on stdin.
   - Exit code `0` = allowed; exit code `2` = blocked (reason on stderr, JSON `deny` decision on stdout). It blocks catastrophic patterns such as deleting a filesystem root, a home folder, a drive or a system folder (`rm -rf`, `Remove-Item -Recurse`, `del /s`, also through `sudo`, `sh -c`, `powershell -Command` …, including Git Bash / WSL drive paths such as `/c/` and `/mnt/c`, `/home/<user>`, `~/..` and `cd / && rm -rf *`), `mkfs`/`wipefs`/`Format-Volume`, `dd` to a raw disk and fork bombs. Payloads over 8 MiB are blocked because they cannot be verified.
   - It is a safety net for obvious accidents, **not a sandbox**: it does not inspect scripts, aliases, encoded commands or file writes.
2. **No telemetry, no credential storage.**
   - The CLI (`cli/*.js`) makes no outbound network requests and stores no credentials. It only writes inside the tool folders you install into (`~/.claude`, `~/.codex`, `~/.cursor`, `~/.copilot` plus the VS Code user `prompts` folder, `~/.gemini` / `~/.antigravity`) and its own state folder `~/.boomopen/` (`settings.json`, install manifests in `manifests/<tool>.json`, backups of replaced kit files in `backups/<tool>/`), plus `./.boomopen.json` when you pass `--project`.
   - `boomopen settings --ui` starts a local dashboard bound to `127.0.0.1` only.
   - Shared instruction files (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, …) keep your own text: the kit writes only a `<!-- boomopen-workflow-kit-START -->` … `<!-- boomopen-workflow-kit-END -->` block, and a pristine copy is saved as `<file>.boomopen-backup` before the first change. Uninstall removes only files recorded in the install manifest (unchanged since install) and strips the kit block; an instruction file that still holds text the kit did not write is first saved as `<file>.boomopen-backup-<timestamp>`, and symlinked files (dotfiles managers) keep their link.
   - The settings dashboard (`boomopen settings --ui`) only accepts requests whose Host/Origin is the local dashboard and a per-session token, so other websites cannot change your settings.
3. **Agent-level conventions are instructions, not enforcement.**
   - `OWNED_FILES` / `READ_ONLY_FILES` handoffs and the "ask before destructive operations" rules are prompt instructions for the AI assistant. They reduce mistakes but cannot technically stop an assistant (or a prompt injection) from running a command. Keep your assistant's own permission and approval settings enabled.
4. **Third-party skills.** `skills_library/` bundles community skills under their own licenses. Review a skill before letting an agent execute any scripts it contains.

---

## Reporting a Vulnerability

Please report vulnerabilities **privately**. Do **not** put exploit details, proof-of-concept code or affected secrets in a public issue, pull request or discussion.

1. Use GitHub private vulnerability reporting: [Report a vulnerability](https://github.com/Kennyboom/BoomOpen-Workflow-Kit-Pro/security/advisories/new).
2. If that form is unavailable, open a public issue titled **"Security contact request"** containing **no technical details**. A maintainer will reply with a private channel.
3. Include:
   - Affected file path(s), kit version or commit, and platform (`antigravity`, `claude`, `codex`, `cursor`, `copilot`)
   - Reproduction steps or proof-of-concept
   - Impact and recommended mitigation (if known)

### What to expect

| Step | Target |
| ---- | ------ |
| Acknowledgement of your report | within 3 business days |
| Initial assessment (confirmed / not a vulnerability / need more info) | within 10 business days |
| Fix or mitigation for confirmed high/critical issues | within 30 days, coordinated with you before public disclosure |

We credit reporters in the release notes unless you ask us not to.
