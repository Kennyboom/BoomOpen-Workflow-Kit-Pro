---
name: speed
description: Launch RSVP speed reader for text
trigger: command
risk: unknown
source: community
tools: Write, Bash, Read
---

> **Skill folder:** paths below that start with `$SKILL_DIR` are relative to the folder that contains this SKILL.md. BoomOpen installs vault skills at `~/.<tool>/skills_library/speed` (for example `~/.claude/skills_library/speed`, `~/.codex/skills_library/speed` or `~/.gemini/config/skills_library/speed`). Set it before running a command, e.g. `SKILL_DIR=~/.claude/skills_library/speed`.

> **Vault note:** this vault copy does not bundle some files the upstream skill refers to (`data/reader.html`). Steps that need them will not work until you add them from the upstream project; otherwise follow the inline guidance.

# Speed Reader

Launch the RSVP speed reader to display text one word at a time with Spritz-style ORP (Optimal Recognition Point) highlighting.

## Instructions

1. **Get the text:**
   - If `$ARGUMENTS` is provided, use that text
   - Otherwise, extract the main content from your **previous response** in this conversation

2. **Prepare the content:**
   - Strip markdown formatting (headers, bold, links, code blocks)
   - Keep clean, readable prose
   - Escape quotes and backslashes for JavaScript

3. **Write and launch:**
   - Replace `<!-- CONTENT_PLACEHOLDER -->` with:
     ```html
     <script>window.SPEED_READER_CONTENT = "your escaped text";</script>
     <!-- CONTENT_PLACEHOLDER -->
     ```
   - Run: `open $SKILL_DIR/data/reader.html`

4. **Confirm:** Tell the user it's opening. Mention `Space` to play/pause.

## Arguments
$ARGUMENTS
