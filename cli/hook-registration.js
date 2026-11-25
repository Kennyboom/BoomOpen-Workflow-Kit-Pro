'use strict';

/**
 * Registers the kit's destructive-command guard (hooks/validate-tool-call.mjs) and stop quality gate
 * (hooks/stop-quality-gate.mjs) as opt-in hooks via `install <tool> --with-hooks`, removing them on
 * uninstall while preserving every sibling setting, hook, BOM, CRLF, and symlink.
 */

const fs = require('node:fs');
const path = require('node:path');

const { isSymlink, restoreBackup } = require('./manifest.js');

const HOOK_SCRIPT_NAME = 'validate-tool-call.mjs';
const STOP_HOOK_SCRIPT_NAME = 'stop-quality-gate.mjs';
const HOOK_OWNER_TAG = 'boomopen-workflow-kit';
const CLAUDE_HOOK_EVENT = 'PreToolUse';
const CLAUDE_STOP_EVENT = 'Stop';
const CLAUDE_PRE_COMPACT_EVENT = 'PreCompact';
const CLAUDE_SHELL_MATCHER = 'Bash|PowerShell';
const ANTIGRAVITY_HOOK_NAME = 'boomopen-guard';
const ANTIGRAVITY_SHELL_MATCHER = 'run_command';
const CURSOR_SHELL_EVENT = 'beforeShellExecution';
const HOOK_TIMEOUT_SECONDS = 10;
const STOP_HOOK_TIMEOUT_SECONDS = 15;
const SETTINGS_BACKUP_SUFFIX = '.boomopen-backup';

class HookConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HookConfigError';
    }
}

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function buildHookCommand(scriptPath) {
    return `node "${scriptPath.replace(/\\/g, '/')}"`;
}

function buildAntigravityHookCommand(hooksJsonPath, scriptPath) {
    const rel = path.relative(path.dirname(hooksJsonPath), scriptPath).replace(/\\/g, '/');
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel) && !/[\s"&|<>^]/.test(rel)) {
        return `node ./${rel.replace(/^\.\//, '')}`;
    }
    return buildHookCommand(scriptPath);
}

function resolveStopScriptPath(scriptPath, stopScriptPath) {
    if (stopScriptPath) return stopScriptPath;
    return path.join(path.dirname(scriptPath), STOP_HOOK_SCRIPT_NAME);
}

function isKitCommandString(command) {
    if (typeof command !== 'string') return false;
    const hasScript = command.includes(HOOK_SCRIPT_NAME) || command.includes(STOP_HOOK_SCRIPT_NAME);
    // Relative `./hooks/...` inside a plugin's own hooks.json has no parent folder in the command string.
    return hasScript && (command.includes(HOOK_OWNER_TAG) || command.includes(`./hooks/${HOOK_SCRIPT_NAME}`) || command.includes(`./hooks/${STOP_HOOK_SCRIPT_NAME}`));
}

function isKitHook(hook) {
    return isPlainObject(hook) && isKitCommandString(hook.command);
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

function readSettingsIfMentioned(settingsPath) {
    let raw;
    try {
        raw = fs.readFileSync(settingsPath, 'utf8');
    } catch (error) {
        if (error && error.code === 'ENOENT') return { exists: false, data: {}, raw: null };
        throw error;
    }
    const mentionsScript = raw.includes(HOOK_SCRIPT_NAME) || raw.includes(STOP_HOOK_SCRIPT_NAME);
    if (!mentionsScript) return { exists: true, data: {}, raw: null };
    return readSettings(settingsPath);
}

function withoutKitGroupedHooks(entries) {
    const kept = [];
    for (const entry of entries) {
        if (!isPlainObject(entry) || !Array.isArray(entry.hooks)) {
            if (!isKitHook(entry)) kept.push(entry);
            continue;
        }
        const hooks = entry.hooks.filter((hook) => !isKitHook(hook));
        if (hooks.length === entry.hooks.length) kept.push(entry);
        else if (hooks.length > 0) kept.push({ ...entry, hooks });
    }
    return kept;
}

function withoutKitFlatHooks(entries) {
    return withoutKitGroupedHooks(entries);
}

function getHookArray(hooksObj, eventName, filePath, prefix = 'hooks') {
    if (hooksObj === undefined) return [];
    if (!isPlainObject(hooksObj)) throw new HookConfigError(`"${prefix}" in ${filePath} is not an object`);
    const entries = hooksObj[eventName];
    if (entries === undefined) return [];
    if (!Array.isArray(entries)) throw new HookConfigError(`"${prefix}.${eventName}" in ${filePath} is not an array`);
    return entries;
}

function writeSettings(settingsPath, data) {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

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

function finalizeUnregister(filePath, next) {
    const backupPath = filePath + SETTINGS_BACKUP_SUFFIX;
    const backup = readBackup(backupPath);
    if (backup.exists && backup.data !== null && JSON.stringify(backup.data) === JSON.stringify(next)) {
        restoreBackup(backupPath, filePath);
    } else if (!backup.exists && Object.keys(next).length === 0 && !isSymlink(filePath)) {
        fs.unlinkSync(filePath);
    } else {
        writeSettings(filePath, next);
    }
}

function registerClaudeHook(settingsPath, scriptPath, stopScriptPath = null) {
    const { exists, data, raw } = readSettings(settingsPath);
    const stopPath = resolveStopScriptPath(scriptPath, stopScriptPath);
    const preEntries = getHookArray(data.hooks, CLAUDE_HOOK_EVENT, settingsPath);
    const stopEntries = getHookArray(data.hooks, CLAUDE_STOP_EVENT, settingsPath);
    const compactEntries = getHookArray(data.hooks, CLAUDE_PRE_COMPACT_EVENT, settingsPath);

    const cleanedPre = withoutKitGroupedHooks(preEntries);
    const cleanedStop = withoutKitGroupedHooks(stopEntries);
    const cleanedCompact = withoutKitGroupedHooks(compactEntries);
    const hadKitHook =
        JSON.stringify(cleanedPre) !== JSON.stringify(preEntries) ||
        JSON.stringify(cleanedStop) !== JSON.stringify(stopEntries) ||
        JSON.stringify(cleanedCompact) !== JSON.stringify(compactEntries);

    const kitPre = {
        matcher: CLAUDE_SHELL_MATCHER,
        hooks: [{ type: 'command', command: buildHookCommand(scriptPath), timeout: HOOK_TIMEOUT_SECONDS }],
    };
    const kitStop = {
        hooks: [{ type: 'command', command: buildHookCommand(stopPath), timeout: STOP_HOOK_TIMEOUT_SECONDS }],
    };
    const kitCompact = {
        hooks: [{ type: 'command', command: buildHookCommand(stopPath), timeout: HOOK_TIMEOUT_SECONDS }],
    };

    const next = {
        ...data,
        hooks: {
            ...(data.hooks || {}),
            [CLAUDE_HOOK_EVENT]: [...cleanedPre, kitPre],
            [CLAUDE_STOP_EVENT]: [...cleanedStop, kitStop],
            [CLAUDE_PRE_COMPACT_EVENT]: [...cleanedCompact, kitCompact],
        },
    };
    if (exists && JSON.stringify(next) === JSON.stringify(data)) return 'unchanged';

    const backupPath = settingsPath + SETTINGS_BACKUP_SUFFIX;
    if (exists && raw !== null && !hadKitHook && !fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw, 'utf8');
    writeSettings(settingsPath, next);
    return hadKitHook ? 'updated' : 'added';
}

function isClaudeHookRegistered(settingsPath) {
    try {
        const { data } = readSettings(settingsPath);
        return getHookArray(data.hooks, CLAUDE_HOOK_EVENT, settingsPath).some(
            (entry) => isPlainObject(entry) && Array.isArray(entry.hooks) && entry.hooks.some(isKitHook)
        );
    } catch (error) {
        if (error instanceof HookConfigError) return false;
        throw error;
    }
}

function unregisterClaudeHook(settingsPath) {
    const { exists, data, raw } = readSettingsIfMentioned(settingsPath);
    if (!exists || raw === null) return 'missing';
    const hooks = isPlainObject(data.hooks) ? { ...data.hooks } : {};
    let changed = false;
    for (const eventName of [CLAUDE_HOOK_EVENT, CLAUDE_STOP_EVENT, CLAUDE_PRE_COMPACT_EVENT]) {
        const entries = getHookArray(data.hooks, eventName, settingsPath);
        const cleaned = withoutKitGroupedHooks(entries);
        if (JSON.stringify(cleaned) !== JSON.stringify(entries)) changed = true;
        if (cleaned.length > 0) hooks[eventName] = cleaned;
        else delete hooks[eventName];
    }
    if (!changed) return 'missing';
    const next = { ...data };
    if (Object.keys(hooks).length > 0) next.hooks = hooks;
    else delete next.hooks;
    finalizeUnregister(settingsPath, next);
    return 'removed';
}

function registerAntigravityHook(hooksJsonPath, scriptPath, stopScriptPath = null) {
    const { exists, data, raw } = readSettings(hooksJsonPath);
    const stopPath = resolveStopScriptPath(scriptPath, stopScriptPath);
    const group = data[ANTIGRAVITY_HOOK_NAME];
    if (group !== undefined && !isPlainObject(group)) {
        throw new HookConfigError(`"${ANTIGRAVITY_HOOK_NAME}" in ${hooksJsonPath} is not an object`);
    }
    const preEntries = getHookArray(group, CLAUDE_HOOK_EVENT, hooksJsonPath, ANTIGRAVITY_HOOK_NAME);
    const stopEntries = getHookArray(group, CLAUDE_STOP_EVENT, hooksJsonPath, ANTIGRAVITY_HOOK_NAME);
    const cleanedPre = withoutKitGroupedHooks(preEntries);
    const cleanedStop = withoutKitFlatHooks(stopEntries);
    const hadKitHook =
        JSON.stringify(cleanedPre) !== JSON.stringify(preEntries) ||
        JSON.stringify(cleanedStop) !== JSON.stringify(stopEntries);

    const kitPre = {
        matcher: ANTIGRAVITY_SHELL_MATCHER,
        hooks: [{ type: 'command', command: buildAntigravityHookCommand(hooksJsonPath, scriptPath), timeout: HOOK_TIMEOUT_SECONDS }],
    };
    const kitStop = {
        type: 'command',
        command: buildAntigravityHookCommand(hooksJsonPath, stopPath),
        timeout: STOP_HOOK_TIMEOUT_SECONDS,
    };
    const enabled = group && typeof group.enabled === 'boolean' ? group.enabled : true;
    const nextGroup = {
        ...(group || {}),
        enabled,
        [CLAUDE_HOOK_EVENT]: [...cleanedPre, kitPre],
        [CLAUDE_STOP_EVENT]: [...cleanedStop, kitStop],
    };
    const next = { ...data, [ANTIGRAVITY_HOOK_NAME]: nextGroup };
    if (exists && JSON.stringify(next) === JSON.stringify(data)) return 'unchanged';

    const backupPath = hooksJsonPath + SETTINGS_BACKUP_SUFFIX;
    if (exists && raw !== null && !hadKitHook && !fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw, 'utf8');
    writeSettings(hooksJsonPath, next);
    return hadKitHook ? 'updated' : 'added';
}

function isAntigravityHookRegistered(hooksJsonPath) {
    try {
        const { data } = readSettings(hooksJsonPath);
        const group = data[ANTIGRAVITY_HOOK_NAME];
        if (!isPlainObject(group)) return false;
        const preEntries = getHookArray(group, CLAUDE_HOOK_EVENT, hooksJsonPath, ANTIGRAVITY_HOOK_NAME);
        return preEntries.some((entry) => isPlainObject(entry) && Array.isArray(entry.hooks) && entry.hooks.some(isKitHook));
    } catch (error) {
        if (error instanceof HookConfigError) return false;
        throw error;
    }
}

function unregisterAntigravityHook(hooksJsonPath) {
    const { exists, data, raw } = readSettingsIfMentioned(hooksJsonPath);
    if (!exists || raw === null) return 'missing';
    const group = data[ANTIGRAVITY_HOOK_NAME];
    if (!isPlainObject(group)) return 'missing';
    const preEntries = getHookArray(group, CLAUDE_HOOK_EVENT, hooksJsonPath, ANTIGRAVITY_HOOK_NAME);
    const stopEntries = getHookArray(group, CLAUDE_STOP_EVENT, hooksJsonPath, ANTIGRAVITY_HOOK_NAME);
    const cleanedPre = withoutKitGroupedHooks(preEntries);
    const cleanedStop = withoutKitFlatHooks(stopEntries);
    if (JSON.stringify(cleanedPre) === JSON.stringify(preEntries) && JSON.stringify(cleanedStop) === JSON.stringify(stopEntries)) {
        return 'missing';
    }

    const nextGroup = { ...group };
    if (cleanedPre.length > 0) nextGroup[CLAUDE_HOOK_EVENT] = cleanedPre;
    else delete nextGroup[CLAUDE_HOOK_EVENT];
    if (cleanedStop.length > 0) nextGroup[CLAUDE_STOP_EVENT] = cleanedStop;
    else delete nextGroup[CLAUDE_STOP_EVENT];
    const next = { ...data };
    if (Object.keys(nextGroup).some((k) => k !== 'enabled')) next[ANTIGRAVITY_HOOK_NAME] = nextGroup;
    else delete next[ANTIGRAVITY_HOOK_NAME];
    finalizeUnregister(hooksJsonPath, next);
    return 'removed';
}

function registerCursorHook(hooksJsonPath, scriptPath) {
    const { exists, data, raw } = readSettings(hooksJsonPath);
    const entries = getHookArray(data.hooks, CURSOR_SHELL_EVENT, hooksJsonPath);
    const cleaned = withoutKitFlatHooks(entries);
    const hadKitHook = JSON.stringify(cleaned) !== JSON.stringify(entries);
    const kitEntry = { command: buildHookCommand(scriptPath) };
    const version = typeof data.version === 'number' ? data.version : 1;
    const next = {
        ...data,
        version,
        hooks: { ...(data.hooks || {}), [CURSOR_SHELL_EVENT]: [...cleaned, kitEntry] },
    };
    if (exists && JSON.stringify(next) === JSON.stringify(data)) return 'unchanged';

    const backupPath = hooksJsonPath + SETTINGS_BACKUP_SUFFIX;
    if (exists && raw !== null && !hadKitHook && !fs.existsSync(backupPath)) fs.writeFileSync(backupPath, raw, 'utf8');
    writeSettings(hooksJsonPath, next);
    return hadKitHook ? 'updated' : 'added';
}

function isCursorHookRegistered(hooksJsonPath) {
    try {
        const { data } = readSettings(hooksJsonPath);
        return getHookArray(data.hooks, CURSOR_SHELL_EVENT, hooksJsonPath).some(isKitHook);
    } catch (error) {
        if (error instanceof HookConfigError) return false;
        throw error;
    }
}

function unregisterCursorHook(hooksJsonPath) {
    const { exists, data, raw } = readSettingsIfMentioned(hooksJsonPath);
    if (!exists || raw === null) return 'missing';
    const entries = getHookArray(data.hooks, CURSOR_SHELL_EVENT, hooksJsonPath);
    const cleaned = withoutKitFlatHooks(entries);
    if (JSON.stringify(cleaned) === JSON.stringify(entries)) return 'missing';

    const hooks = { ...(data.hooks || {}) };
    if (cleaned.length > 0) hooks[CURSOR_SHELL_EVENT] = cleaned;
    else delete hooks[CURSOR_SHELL_EVENT];
    const next = { ...data };
    if (Object.keys(hooks).length > 0) {
        next.hooks = hooks;
    } else {
        delete next.hooks;
        const backup = readBackup(hooksJsonPath + SETTINGS_BACKUP_SUFFIX);
        if (!backup.exists && Object.keys(next).length === 1 && next.version === 1) delete next.version;
    }
    finalizeUnregister(hooksJsonPath, next);
    return 'removed';
}

function describeManualRegistration(scriptPath) {
    const command = buildHookCommand(scriptPath);
    return [
        'Antigravity / Claude / Cursor: run `boomopen install <antigravity|claude|cursor> --with-hooks`',
        `Gemini CLI: add to ~/.gemini/settings.json → "hooks": { "BeforeTool": [ { "matcher": "run_shell_command",`,
        `  "hooks": [ { "name": "boomopen-guard", "type": "command", "command": ${JSON.stringify(command)} } ] } ] }`,
        `Other hosts: run ${command} before each shell command with the tool call JSON on stdin; exit code 2 = blocked.`,
    ];
}

module.exports = {
    HOOK_SCRIPT_NAME,
    STOP_HOOK_SCRIPT_NAME,
    CLAUDE_SHELL_MATCHER,
    ANTIGRAVITY_HOOK_NAME,
    CURSOR_SHELL_EVENT,
    HookConfigError,
    buildHookCommand,
    registerClaudeHook,
    unregisterClaudeHook,
    isClaudeHookRegistered,
    registerAntigravityHook,
    unregisterAntigravityHook,
    isAntigravityHookRegistered,
    registerCursorHook,
    unregisterCursorHook,
    isCursorHookRegistered,
    describeManualRegistration,
};
