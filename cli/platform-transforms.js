'use strict';

/**
 * Cross-IDE compilation transforms applied when installing commands, agents, rules, and skills:
 *  - skips internal kit reference folders (_ref/, teams/) when populating IDE command/agent pickers;
 *  - rewrites Antigravity <appDataDir>/brain/<conversation-id> artifact paths to ./reports/{topic}
 *    for non-Antigravity targets (claude, codex, cursor, copilot);
 *  - compiles per-target YAML frontmatter for Antigravity, Claude Code, and GitHub Copilot agents;
 *  - generates Claude Code nested <family>/<variant>.md slash command aliases (/plan:hard) and
 *    injects disable-model-invocation: true on high-blast-radius release/deploy commands.
 */

const path = require('node:path');
const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./markers.js');

const ANTIGRAVITY_FULL_TOOLS = ['read_file', 'edit_file', 'write_file', 'run_command', 'manage_task', 'search_web'];
const ANTIGRAVITY_READ_ONLY_TOOLS = ['read_file', 'run_command', 'search_web'];
const ANTIGRAVITY_READ_ONLY_ROLES = new Set([
    'reviewer',
    'security-engineer',
    'performance-engineer',
    'spec-reconciler',
    'scouter',
    'business-analyst',
]);

const CLAUDE_READ_ONLY_ROLES = new Set(['reviewer', 'security-engineer', 'performance-engineer', 'spec-reconciler']);
const CLAUDE_MEMORY_ROLES = new Set(['orchestrator', 'tech-lead', 'planner']);
const CLAUDE_WORKTREE_ROLES = new Set([
    'backend-engineer',
    'frontend-engineer',
    'database-architect',
    'mobile-engineer',
    'mobile-developer',
    'game-engineer',
    'game-developer',
]);
const CLAUDE_VALID_TOOLS = new Set([
    'Read', 'Write', 'Edit', 'MultiEdit', 'NotebookEdit',
    'Grep', 'Glob', 'LS', 'Bash', 'PowerShell',
    'WebFetch', 'WebSearch', 'Task', 'TodoWrite',
]);
const CLAUDE_MANUAL_ONLY_COMMANDS = new Set(['deploy-production', 'deploy-rollback', 'release']);

const INTERNAL_SKIP_SUBDIRS = {
    commands: new Set(['_ref']),
    agents: new Set(['teams']),
};

function unquoteYamlScalar(raw) {
    const trimmed = String(raw || '').trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        if (trimmed.startsWith('"')) {
            try {
                return JSON.parse(trimmed);
            } catch {
                return trimmed.slice(1, -1);
            }
        }
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function parseFrontmatter(markdown) {
    const eol = markdown.includes('\r\n') ? '\r\n' : '\n';
    const match = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(markdown);
    if (!match) return { hasFrontmatter: false, rawBlock: '', fields: {}, body: markdown, eol };
    const rawBlock = match[1];
    const body = markdown.slice(match[0].length);
    const fields = {};
    for (const line of rawBlock.split(/\r?\n/)) {
        const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
        if (kv) fields[kv[1]] = kv[2].trim();
    }
    return { hasFrontmatter: true, rawBlock, fields, body, eol };
}

function replaceBrainPathsSegment(segment) {
    return segment
        .replaceAll('<appDataDir>\\brain\\<conversation-id>\\', './reports/{topic}/')
        .replaceAll('<appDataDir>/brain/<conversation-id>/', './reports/{topic}/')
        .replaceAll('<appDataDir>\\brain\\<conversation-id>', './reports/{topic}')
        .replaceAll('<appDataDir>/brain/<conversation-id>', './reports/{topic}');
}

/** Rewrite Antigravity brain artifact paths for non-Antigravity targets, keeping settings blocks intact. */
function rewriteBrainArtifactPaths(text, platformKey) {
    if (!platformKey || platformKey === 'antigravity') return text;
    const start = text.indexOf(SETTINGS_MARKER_START);
    const end = start === -1 ? -1 : text.indexOf(SETTINGS_MARKER_END, start + SETTINGS_MARKER_START.length);
    if (start === -1 || end === -1) return replaceBrainPathsSegment(text);
    const blockEnd = end + SETTINGS_MARKER_END.length;
    return replaceBrainPathsSegment(text.slice(0, start)) + text.slice(start, blockEnd) + replaceBrainPathsSegment(text.slice(blockEnd));
}

function parseToolTokens(rawTools) {
    if (!rawTools) return [];
    const stripped = rawTools.trim().replace(/^\[|\]$/g, '');
    return stripped
        .split(',')
        .map((item) => unquoteYamlScalar(item))
        .filter(Boolean);
}

function isStringArrayYaml(rawVal) {
    if (!rawVal) return false;
    const trimmed = rawVal.trim();
    return trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.includes('{');
}

function compileAntigravityAgent(roleId, name, description, body, eol) {
    const tools = ANTIGRAVITY_READ_ONLY_ROLES.has(roleId) ? ANTIGRAVITY_READ_ONLY_TOOLS : ANTIGRAVITY_FULL_TOOLS;
    const fm = [
        '---',
        `name: ${name}`,
        `description: ${JSON.stringify(description)}`,
        'subagent: true',
        'mainAgent: true',
        `tools: [${tools.join(', ')}]`,
        '---',
    ].join(eol);
    return `${fm}${eol}${body.startsWith(eol) ? '' : eol}${body}`;
}

function compileClaudeAgent(roleId, name, description, parsed, body, eol) {
    const lines = [
        '---',
        `name: ${name}`,
        `description: ${JSON.stringify(description)}`,
    ];
    const tools = parseToolTokens(parsed.fields.tools);
    if (tools.length > 0 && tools.every((tool) => CLAUDE_VALID_TOOLS.has(tool))) {
        lines.push(`tools: ${tools.join(', ')}`);
    }
    if (CLAUDE_READ_ONLY_ROLES.has(roleId)) {
        lines.push('disallowedTools: Write, Edit, NotebookEdit');
    }
    if (CLAUDE_MEMORY_ROLES.has(roleId)) {
        lines.push('memory: project');
    }
    if (unquoteYamlScalar(parsed.fields.isolation) === 'worktree') {
        lines.push('isolation: worktree');
    } else if (CLAUDE_WORKTREE_ROLES.has(roleId)) {
        lines.push('# isolation: worktree (supported for isolated parallel git worktree shards)');
    }
    lines.push('---');
    return `${lines.join(eol)}${eol}${body.startsWith(eol) ? '' : eol}${body}`;
}

function compileCopilotAgent(name, description, parsed, body, eol) {
    const lines = [
        '---',
        `name: ${name}`,
        `description: ${JSON.stringify(description)}`,
    ];
    if (parsed.fields['argument-hint']) {
        lines.push(`argument-hint: ${JSON.stringify(unquoteYamlScalar(parsed.fields['argument-hint']))}`);
    }
    // Preserve structured object-array handoffs if present; strip flat string-array handoffs that fail Copilot validation.
    if (parsed.fields.handoffs && !isStringArrayYaml(parsed.fields.handoffs) && parsed.fields.handoffs.includes('{')) {
        lines.push(`handoffs: ${parsed.fields.handoffs}`);
    }
    lines.push('---');
    return `${lines.join(eol)}${eol}${body.startsWith(eol) ? '' : eol}${body}`;
}

/** Compile a kit specialist agent markdown file for a specific target IDE. */
function compileAgentMarkdown(markdown, platformKey, fileName) {
    const rewritten = rewriteBrainArtifactPaths(markdown, platformKey);
    if (!fileName.endsWith('.md')) return rewritten;
    const stem = path.basename(fileName).replace(/\.agent\.md$|\.md$/i, '');
    const parsed = parseFrontmatter(rewritten);
    const name = unquoteYamlScalar(parsed.fields.name) || stem;
    const roleId = stem.toLowerCase();
    const description = unquoteYamlScalar(parsed.fields.description) || `${name} specialist agent`;
    const body = parsed.body;
    const eol = parsed.eol;

    if (platformKey === 'antigravity') return compileAntigravityAgent(roleId, name, description, body, eol);
    if (platformKey === 'claude') return compileClaudeAgent(roleId, name, description, parsed, body, eol);
    if (platformKey === 'copilot') return compileCopilotAgent(name, description, parsed, body, eol);
    return rewritten;
}

/** Destination relative path for an installed agent file (Copilot uses <stem>.agent.md). */
function targetAgentRelPath(relPath, platformKey) {
    if (platformKey !== 'copilot') return relPath;
    if (relPath.endsWith('.agent.md') || !relPath.endsWith('.md')) return relPath;
    return `${relPath.slice(0, -3)}.agent.md`;
}

/** Compile a kit command markdown file for a target IDE (injects manual-only guardrails on Claude). */
function compileCommandMarkdown(markdown, platformKey, fileName) {
    const rewritten = rewriteBrainArtifactPaths(markdown, platformKey);
    if (platformKey !== 'claude' || !fileName.endsWith('.md')) return rewritten;
    const stem = path.basename(fileName, '.md').toLowerCase();
    if (!CLAUDE_MANUAL_ONLY_COMMANDS.has(stem)) return rewritten;
    const parsed = parseFrontmatter(rewritten);
    const eol = parsed.eol;
    if (!parsed.hasFrontmatter) {
        return `---${eol}disable-model-invocation: true${eol}---${eol}${eol}${rewritten}`;
    }
    const rawLines = parsed.rawBlock
        .split(/\r?\n/)
        .filter((line) => !/^\s*disable-model-invocation\s*:/.test(line));
    rawLines.push('disable-model-invocation: true');
    return `---${eol}${rawLines.join(eol)}${eol}---${eol}${parsed.body}`;
}

/**
 * Compute nested <family>/<variant>.md relative path for Claude Code `/family:variant` slash commands,
 * when `<family>.md` also exists at the top level of commands/.
 */
function claudeColonCommandAlias(relPath, topLevelCommandStems) {
    const normalized = relPath.split(path.sep).join('/');
    if (normalized.includes('/') || !normalized.endsWith('.md')) return null;
    const stem = normalized.slice(0, -3);
    let bestFamily = null;
    for (let idx = stem.lastIndexOf('-'); idx > 0; idx = stem.lastIndexOf('-', idx - 1)) {
        const candidate = stem.slice(0, idx);
        if (topLevelCommandStems.has(candidate)) {
            bestFamily = candidate;
            break;
        }
    }
    if (!bestFamily) return null;
    const variant = stem.slice(bestFamily.length + 1);
    return variant ? path.join(bestFamily, `${variant}.md`) : null;
}

module.exports = {
    ANTIGRAVITY_FULL_TOOLS,
    ANTIGRAVITY_READ_ONLY_TOOLS,
    ANTIGRAVITY_READ_ONLY_ROLES,
    CLAUDE_READ_ONLY_ROLES,
    CLAUDE_MEMORY_ROLES,
    CLAUDE_WORKTREE_ROLES,
    CLAUDE_MANUAL_ONLY_COMMANDS,
    INTERNAL_SKIP_SUBDIRS,
    rewriteBrainArtifactPaths,
    compileAgentMarkdown,
    targetAgentRelPath,
    compileCommandMarkdown,
    claudeColonCommandAlias,
};
