'use strict';

/**
 * Registers the kit's destructive-command guard (hooks/validate-tool-call.mjs) as a Claude Code
 * PreToolUse hook in ~/.claude/settings.json (opt-in: `install claude --with-hooks`), and removes
 * it again on uninstall.
 *
 * Only the kit's own hook entry is ever added or removed; every other setting and hook is kept.
 * A settings.json that is not valid JSON is never rewritten (a leading UTF-8 BOM, as written by
 * Windows PowerShell 5.1, is accepted). Uninstall never parses a settings.json that does not even
 * mention the kit's hook, so a JSONC file the kit never touched cannot fail an uninstall.
 */

const fs = require('node:fs');

const { isSymlink, restoreBackup } = require('./manifest.js');

const HOOK_SCRIPT_NAME = 'validate-tool-call.mjs';
const HOOK_OWNER_TAG = 'boomopen-workflow-kit';
const CLAUDE_HOOK_EVENT = 'PreToolUse';
const CLAUDE_SHELL_MATCHER = 'Bash';
const HOOK_TIMEOUT_SECONDS = 10;
const SETTINGS_BACKUP_SUFFIX = '.boomopen-backup';

class HookConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HookConfigError';
    }
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Command line for the hook; forward slashes work in cmd, PowerShell and bash alike. */
function buildHookCommand(scriptPath) {
    return `node "${scriptPath.replace(/\\/g, '/')}"`;
}

function isKitHook(hook) {
    return (
        isPlainObject(hook) &&
        typeof hook.command === 'string' &&
        hook.command.includes(HOOK_SCRIPT_NAME) &&
        hook.command.includes(HOOK_OWNER_TAG)
    );
}

function readSettings(settingsPath) {
    let raw;
    try {
        raw = fs.readFileSync(settingsPath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return { exists: false, data: {}, raw: null };
        throw error;
    }
    if (raw.trim() === '') return { exists: true, data: {}, raw };
    let data;
    try {
        data = JSON.parse(raw.replace(/^\uFEFF/, ''));
    } catch (error) {
        if (error instanceof SyntaxError) throw new HookConfigError(`${settingsPath} is not valid JSON (${error.message})`);
        throw error;
    }
    if (!isPlainObject(data)) throw new HookConfigError(`${settingsPath} does not contain a JSON object`);
    return { exists: true, data, raw };
}

/** Event entries with every kit hook removed (entries left empty are dropped). */
function withoutKitHooks(entries) {
    const kept = [];
    for (const entry of entries) {
        if (!isPlainObject(entry) || !Array.isArray(entry.hooks)) {
            kept.push(entry);
            continue;
        }
        const hooks = entry.hooks.filter((hook) => !isKitHook(hook));
        if (hooks.length === entry.hooks.length) kept.push(entry);
        else if (hooks.length > 0) kept.push({ ...entry, hooks });
    }
    return kept;
}

function getEventEntries(data, settingsPath) {
    if (data.hooks === undefined) return [];
    if (!isPlainObject(data.hooks)) throw new HookConfigError(`"hooks" in ${settingsPath} is not an object`);
    const entries = data.hooks[CLAUDE_HOOK_EVENT];
    if (entries === undefined) return [];
    if (!Array.isArray(entries)) throw new HookConfigError(`"hooks.${CLAUDE_HOOK_EVENT}" in ${settingsPath} is not an array`);
    return entries;
}

function writeSettings(settingsPath, data) {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/**
 * @param {string} settingsPath ~/.claude/settings.json
 * @param {string} scriptPath absolute path of the installed hook script
 * @returns {'added'|'updated'|'unchanged'}
 * @throws {HookConfigError} when settings.json cannot be safely edited
 */
function registerClaudeHook(settingsPath, scriptPath) {
    const { exists, data, raw } = readSettings(settingsPath);
    const entries = getEventEntries(data, settingsPath);
    const cleaned = withoutKitHooks(entries);
    const hadKitHook = JSON.stringify(cleaned) !== JSON.stringify(entries);
    const kitEntry = {
        matcher: CLAUDE_SHELL_MATCHER,
        hooks: [{ type: 'command', command: buildHookCommand(scriptPath), timeout: HOOK_TIMEOUT_SECONDS }],
    };
    const next = { ...data, hooks: { ...(data.hooks || {}), [CLAUDE_HOOK_EVENT]: [...cleaned, kitEntry] } };
    if (exists && JSON.stringify(next) === JSON.stringify(data)) return 'unchanged';

    const backupPath = settingsPath + SETTINGS_BACKUP_SUFFIX;
    if (exists && raw !== null && !hadKitHook && !fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw, 'utf8');
    writeSettings(settingsPath, next);
    return hadKitHook ? 'updated' : 'added';
}

/** True when settings.json already carries the kit's hook (unreadable files count as false). */
function isClaudeHookRegistered(settingsPath) {
    try {
        const { data } = readSettings(settingsPath);
        return getEventEntries(data, settingsPath).some(
            (entry) => isPlainObject(entry) && Array.isArray(entry.hooks) && entry.hooks.some(isKitHook)
        );
    } catch (error) {
        if (error instanceof HookConfigError) return false;
        throw error;
    }
}

/** Like readSettings, but a file that does not mention the kit's hook is not parsed at all. */
function readSettingsIfMentioned(settingsPath) {
    let raw;
    try {
        raw = fs.readFileSync(settingsPath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return { exists: false, data: {}, raw: null };
        throw error;
    }
    if (!raw.includes(HOOK_SCRIPT_NAME) || !raw.includes(HOOK_OWNER_TAG)) return { exists: true, data: {}, raw: null };
    return readSettings(settingsPath);
}

/**
 * @returns {'removed'|'missing'}
 * @throws {HookConfigError} when settings.json cannot be safely edited
 */
function unregisterClaudeHook(settingsPath) {
    const { exists, data, raw } = readSettingsIfMentioned(settingsPath);
    if (!exists || raw === null) return 'missing';
    const entries = getEventEntries(data, settingsPath);
    const cleaned = withoutKitHooks(entries);
    if (JSON.stringify(cleaned) === JSON.stringify(entries)) return 'missing';

    const hooks = { ...data.hooks };
    if (cleaned.length > 0) hooks[CLAUDE_HOOK_EVENT] = cleaned;
    else delete hooks[CLAUDE_HOOK_EVENT];
    const next = { ...data };
    if (Object.keys(hooks).length > 0) next.hooks = hooks;
    else delete next.hooks;

    const backupPath = settingsPath + SETTINGS_BACKUP_SUFFIX;
    const backup = readBackup(backupPath);
    if (backup.exists && backup.data !== null && JSON.stringify(backup.data) === JSON.stringify(next)) {
        // Byte-exact restore (BOM, CRLF, formatting); a symlinked settings.json keeps its link.
        restoreBackup(backupPath, settingsPath);
    } else if (!backup.exists && Object.keys(next).length === 0 && !isSymlink(settingsPath)) {
        fs.unlinkSync(settingsPath); // no backup: the installer created this file only for the hook
    } else {
        writeSettings(settingsPath, next);
    }
    return 'removed';
}

/**
 * The pre-registration copy of settings.json. data is null when the copy cannot be parsed; an empty
 * file counts as {} and a leading UTF-8 BOM is ignored, exactly as readSettings does.
 * @returns {{ exists: boolean, data: object|null }}
 */
function readBackup(backupPath) {
    let raw;
    try {
        raw = fs.readFileSync(backupPath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return { exists: false, data: null };
        throw error;
    }
    const text = raw.replace(/^\uFEFF/, '');
    if (text.trim() === '') return { exists: true, data: {} };
    try {
        return { exists: true, data: JSON.parse(text) };
    } catch (error) {
        if (error instanceof SyntaxError) return { exists: true, data: null };
        throw error;
    }
}

/** Manual registration instructions for hosts the installer does not configure itself. */
function describeManualRegistration(scriptPath) {
    const command = buildHookCommand(scriptPath);
    return [
        `Gemini CLI: add to ~/.gemini/settings.json → "hooks": { "BeforeTool": [ { "matcher": "run_shell_command",`,
        `  "hooks": [ { "name": "boomopen-guard", "type": "command", "command": ${JSON.stringify(command)} } ] } ] }`,
        `Other hosts: run ${command} before each shell command with the tool call JSON on stdin; exit code 2 = blocked.`,
    ];
}

module.exports = {
    HOOK_SCRIPT_NAME,
    HookConfigError,
    buildHookCommand,
    registerClaudeHook,
    unregisterClaudeHook,
    isClaudeHookRegistered,
    describeManualRegistration,
};
