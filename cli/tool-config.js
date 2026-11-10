'use strict';

/**
 * Where the kit installs for each tool, described as data:
 *  - paths / replacements / assets (kept in the historical TOOLS shape),
 *  - instructionFiles: shared global instruction files (kit content is merged as a marked block),
 *  - legacyInstructionFiles: files older releases wrote that this release no longer installs,
 *  - shared: folders shared with the user (tracked file-by-file in the install manifest).
 * The kit-owned framework folder (<skills>/boomopen-workflow-kit) is rebuilt on every install.
 */

const path = require('node:path');
const { getVSCodePromptsFolder } = require('./platform-paths.js');

const KIT_DIR_NAME = 'boomopen-workflow-kit';
const COPILOT_PROMPT_FILE = 'boomopen-workflow-kit.agent.md';
const ANTIGRAVITY_AGENT_FILE = 'AntigravityGlobal.agent.md';
// Codex role TOMLs live in a kit-only subfolder of ~/.codex/agents, so a user's own
// agents/<role>.toml is never overwritten (platforms/codex/config.toml points config_file here).
const CODEX_KIT_AGENTS_DIR = 'boomopen';
// Written into every framework folder: the files the install put there. doctor run from an installed
// copy (no kit checkout to compare with) checks the folder against this list.
const FRAMEWORK_FILE_LIST = 'install-files.json';

// Kit framework content: copied into <frameworkPath>/<dir>. 'scripts' holds the Python helpers
// that commands reference as ~/.{TOOL}/skills/boomopen-workflow-kit/scripts/<name>.py.
const CORE_DIRS = ['agents', 'rules', 'documents', 'commands', 'matrix-skills', 'cli', 'scripts'];
// package.json ships too: it is the single source of the kit version for the installed CLI copy.
const ROOT_FILES = ['README.md', 'SKILL.md', 'package.json'];
// Copied verbatim: documents explain the placeholders, skills_library is vendored third-party content.
const VERBATIM_DIRS = new Set(['documents', 'skills_library']);

function replacementsFor(toolPathSegment, frameworkRel) {
    return {
        '~/.{TOOL}/skills/boomopen-workflow-kit/': `~/.${frameworkRel}/`,
        '{TOOL}/boomopen-workflow-kit/': `${toolPathSegment}/skills/boomopen-workflow-kit/`,
        '{TOOL}': toolPathSegment,
        '{HOME}': '~',
        '~/.agent/': `~/.${frameworkRel}/`,
    };
}

/**
 * @param {string} home user home folder
 * @param {string} root kit root (folder that holds package.json)
 * @param {NodeJS.ProcessEnv} env
 */
function buildTools(home, root, env = process.env) {
    const p = (...parts) => path.join(home, ...parts);
    const r = (...parts) => path.join(root, ...parts);
    return {
        cursor: {
            name: 'Cursor',
            description: 'Cursor AI Editor',
            paths: {
                editorHome: p('.cursor'),
                rules: p('.cursor', 'rules'),
                skills: p('.cursor', 'skills'),
                agents: p('.cursor', 'agents'),
                commands: p('.cursor', 'commands'),
                frameworkPath: p('.cursor', 'skills', KIT_DIR_NAME),
            },
            replacements: replacementsFor('cursor', `cursor/skills/${KIT_DIR_NAME}`),
            assets: {
                rules: r('platforms', 'cursor', 'rules'),
                cursorRules: r('platforms', 'cursor', '.cursorrules'),
            },
        },
        copilot: {
            name: 'GitHub Copilot',
            description: 'GitHub Copilot in VS Code',
            paths: {
                home: p('.copilot'),
                skills: p('.copilot', 'skills'),
                commands: p('.copilot', 'commands'),
                agents: p('.copilot', 'agents'),
                rules: p('.copilot', 'rules'),
                frameworkPath: p('.copilot', 'skills', KIT_DIR_NAME),
                vsCodePrompts: getVSCodePromptsFolder(home, env),
            },
            replacements: replacementsFor('copilot', `copilot/skills/${KIT_DIR_NAME}`),
            assets: { agentFile: r('platforms', 'copilot', COPILOT_PROMPT_FILE) },
        },
        antigravity: {
            name: 'Antigravity (Gemini)',
            description: 'Google Antigravity / Gemini',
            paths: {
                editorHome: p('.antigravity'),
                gemini: p('.gemini'),
                antigravity: p('.gemini', 'config'),
                skills: p('.gemini', 'config', 'skills'),
                agents: p('.antigravity', 'agents'),
                globalAgents: p('.gemini', 'agents'),
                workflows: p('.antigravity', 'workflows'),
                globalWorkflows: p('.gemini', 'config', 'global_workflows'),
                frameworkPath: p('.gemini', 'config', 'skills', KIT_DIR_NAME),
            },
            replacements: {
                ...replacementsFor('gemini/config', `gemini/config/skills/${KIT_DIR_NAME}`),
                '~/.gemini/config/skills/agent-assistant/': `~/.gemini/config/skills/${KIT_DIR_NAME}/`,
            },
            assets: {
                geminiMd: r('platforms', 'antigravity', 'GEMINI.md'),
                agentFile: r('platforms', 'antigravity', ANTIGRAVITY_AGENT_FILE),
            },
        },
        claude: {
            name: 'Claude Code',
            description: 'Anthropic Claude CLI',
            paths: {
                home: p('.claude'),
                skills: p('.claude', 'skills'),
                commands: p('.claude', 'commands'),
                agents: p('.claude', 'agents'),
                frameworkPath: p('.claude', 'skills', KIT_DIR_NAME),
            },
            replacements: replacementsFor('claude', `claude/skills/${KIT_DIR_NAME}`),
            assets: { claudeMd: r('platforms', 'claude', 'CLAUDE.md') },
        },
        codex: {
            name: 'Codex',
            description: 'OpenAI Codex CLI',
            paths: {
                home: p('.codex'),
                skills: p('.codex', 'skills'),
                commands: p('.codex', 'commands'),
                agents: p('.codex', 'agents', CODEX_KIT_AGENTS_DIR),
                frameworkPath: p('.codex', 'skills', KIT_DIR_NAME),
            },
            replacements: replacementsFor('codex', `codex/skills/${KIT_DIR_NAME}`),
            assets: {
                codexMd: r('platforms', 'codex', 'CODEX.md'),
                configToml: r('platforms', 'codex', 'config.toml'),
                agentTomlDir: r('platforms', 'codex', 'agents'),
                commandSkillsDir: r('platforms', 'codex', 'skills'),
            },
        },
    };
}

/** Skills + vault copies every tool gets. */
function skillCopies(tool, root) {
    return [
        { src: path.join(root, 'skills'), dest: tool.paths.skills },
        { src: path.join(root, 'skills_library'), dest: `${tool.paths.skills}_library`, verbatim: true },
    ];
}

/**
 * Install plan for one tool.
 * @returns {{ instructionFiles: Array<{src:string,dest:string}>, legacyInstructionFiles: string[],
 *   shared: Array<{src:string,dest:string,verbatim?:boolean,file?:boolean}> }}
 */
function buildPlan(key, tool, root) {
    const r = (...parts) => path.join(root, ...parts);
    const commands = r('commands');
    const agents = r('agents');
    switch (key) {
        case 'cursor':
            return {
                instructionFiles: [
                    { src: tool.assets.cursorRules, dest: path.join(tool.paths.editorHome, 'CURSOR.md') },
                    { src: r('AGENT.md'), dest: path.join(tool.paths.editorHome, 'AGENT.md') },
                ],
                legacyInstructionFiles: [path.join(tool.paths.editorHome, 'CLAUDE.md')],
                shared: [
                    { src: tool.assets.rules, dest: tool.paths.rules },
                    { src: commands, dest: tool.paths.commands },
                    { src: agents, dest: tool.paths.agents },
                    ...skillCopies(tool, root),
                ],
            };
        case 'copilot':
            return {
                instructionFiles: ['COPILOT.md', 'AGENT.md'].map((file) => ({ src: r(file), dest: path.join(tool.paths.home, file) })),
                legacyInstructionFiles: [path.join(tool.paths.home, 'CLAUDE.md')],
                shared: [
                    { src: tool.assets.agentFile, dest: path.join(tool.paths.vsCodePrompts, COPILOT_PROMPT_FILE), file: true },
                    { src: commands, dest: tool.paths.commands },
                    { src: agents, dest: tool.paths.agents },
                    ...skillCopies(tool, root),
                ],
            };
        case 'antigravity':
            return {
                instructionFiles: [{ src: tool.assets.geminiMd, dest: path.join(tool.paths.gemini, 'GEMINI.md') }],
                legacyInstructionFiles: ['AGENT.md', 'CLAUDE.md'].map((file) => path.join(tool.paths.gemini, file)),
                shared: [
                    { src: commands, dest: tool.paths.workflows },
                    { src: agents, dest: tool.paths.agents },
                    { src: tool.assets.agentFile, dest: path.join(tool.paths.globalAgents, ANTIGRAVITY_AGENT_FILE), file: true },
                    { src: agents, dest: tool.paths.globalAgents },
                    { src: commands, dest: tool.paths.globalWorkflows },
                    ...skillCopies(tool, root),
                ],
            };
        case 'claude':
            return {
                instructionFiles: [
                    { src: tool.assets.claudeMd, dest: path.join(tool.paths.home, 'CLAUDE.md') },
                    { src: r('AGENT.md'), dest: path.join(tool.paths.home, 'AGENT.md') },
                ],
                legacyInstructionFiles: [],
                shared: [
                    { src: commands, dest: tool.paths.commands },
                    { src: agents, dest: tool.paths.agents },
                    ...skillCopies(tool, root),
                ],
            };
        case 'codex':
            return {
                instructionFiles: [
                    { src: tool.assets.codexMd, dest: path.join(tool.paths.home, 'CODEX.md') },
                    // Codex reads its global instructions from ~/.codex/AGENTS.md
                    { src: tool.assets.codexMd, dest: path.join(tool.paths.home, 'AGENTS.md') },
                    { src: r('AGENT.md'), dest: path.join(tool.paths.home, 'AGENT.md') },
                ],
                legacyInstructionFiles: [],
                shared: [
                    { src: tool.assets.agentTomlDir, dest: tool.paths.agents },
                    { src: commands, dest: tool.paths.commands },
                    ...skillCopies(tool, root),
                    { src: tool.assets.commandSkillsDir, dest: tool.paths.skills },
                ],
            };
        default:
            throw new Error(`Unknown tool: ${key}`);
    }
}

module.exports = {
    KIT_DIR_NAME,
    CODEX_KIT_AGENTS_DIR,
    FRAMEWORK_FILE_LIST,
    CORE_DIRS,
    ROOT_FILES,
    VERBATIM_DIRS,
    buildTools,
    buildPlan,
};
