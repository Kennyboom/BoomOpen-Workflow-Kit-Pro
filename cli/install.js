#!/usr/bin/env node

/**
 * BoomOpen Workflow Kit CLI Installer
 * 
 * Installs the BoomOpen Workflow Kit framework for different AI coding tools:
 * - Cursor
 * - GitHub Copilot
 * - Antigravity (Gemini)
 * - Claude Code
 * - Codex
 * 
 * Usage:
 *   npx boomopen-workflow-kit install [tool]
 *   npx boomopen-workflow-kit install --all
 *   npx boomopen-workflow-kit uninstall [tool]
 *   npx boomopen-workflow-kit list
 * 
 * Features:
 *   - Real-time progress bar with file count
 *   - Verification phase to ensure all files are written
 *   - Proper file system sync for reliability
 *   - Summary report with statistics
 */

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const readline = require('node:readline');
const { buildCompactSkillIndex, runDoctor } = require('./doctor.js');
const { runCheck } = require('./checker.js');
const {
    loadSettings,
    saveSettings,
    setSettingByKey,
    getSettingByKey,
    applyPreset,
    resetSettings,
    renderActiveSettingsMarkdown,
    injectSettingsBlockIntoText,
    syncSettingsToInstalledPlatforms,
    runSettingsCommand,
    SETTINGS_MARKER_START,
    SETTINGS_MARKER_END,
} = require('./settings.js');
const { startSettingsUiServer } = require('./settings-ui.js');
const {
    BACKUP_SUFFIX,
    GEMINI_MARKER_START,
    GEMINI_MARKER_END,
    CODEX_MARKER_START,
    CODEX_MARKER_END,
    CODEX_DOC_FALLBACK,
    stripMarkedBlock,
    backupUserFile,
    restoreOrRemoveUserFile,
    removeIfKitOwned,
    removeMirroredFiles,
    removeMarkedBlockFromFile,
    stripCodexManagedConfig,
} = require('./user-files.js');

// ============================================================================
// Configuration
// ============================================================================

const HOME = os.homedir();
const ROOT = path.join(__dirname, '..');

// Platform-specific VS Code prompts folder
function getVSCodePromptsFolder() {
    switch (process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA || '', 'Code', 'User', 'prompts');
        case 'darwin':
            return path.join(HOME, 'Library', 'Application Support', 'Code', 'User', 'prompts');
        default:
            return path.join(HOME, '.config', 'Code', 'User', 'prompts');
    }
}

const TOOLS = {
    cursor: {
        name: 'Cursor',
        description: 'Cursor AI Editor',
        paths: {
            editorHome: path.join(HOME, '.cursor'),
            rules: path.join(HOME, '.cursor', 'rules'),
            skills: path.join(HOME, '.cursor', 'skills'),
            agents: path.join(HOME, '.cursor', 'agents'),
            commands: path.join(HOME, '.cursor', 'commands'),
            frameworkPath: path.join(HOME, '.cursor', 'skills', 'boomopen-workflow-kit'),
        },
        replacements: {
            '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.cursor/skills/boomopen-workflow-kit/',
            '{TOOL}/boomopen-workflow-kit/': 'cursor/skills/boomopen-workflow-kit/',
            '{TOOL}': 'cursor',
            '{HOME}': '~',
            '~/.agent/': '~/.cursor/skills/boomopen-workflow-kit/',
            'boomopen-workflow-kit': 'boomopen-workflow-kit',
        },
        assets: {
            rules: path.join(ROOT, 'platforms', 'cursor', 'rules'),
            cursorRules: path.join(ROOT, 'platforms', 'cursor', '.cursorrules'),
        }
    },
    copilot: {
        name: 'GitHub Copilot',
        description: 'GitHub Copilot in VS Code',
        paths: {
            home: path.join(HOME, '.copilot'),
            skills: path.join(HOME, '.copilot', 'skills'),
            commands: path.join(HOME, '.copilot', 'commands'),
            agents: path.join(HOME, '.copilot', 'agents'),
            rules: path.join(HOME, '.copilot', 'rules'),
            frameworkPath: path.join(HOME, '.copilot', 'skills', 'boomopen-workflow-kit'),
            vsCodePrompts: getVSCodePromptsFolder(),
        },
        replacements: {
            '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.copilot/skills/boomopen-workflow-kit/',
            '{TOOL}/boomopen-workflow-kit/': 'copilot/skills/boomopen-workflow-kit/',
            '{TOOL}': 'copilot',
            '{HOME}': '~',
            '~/.agent/': '~/.copilot/skills/boomopen-workflow-kit/',
            'boomopen-workflow-kit': 'boomopen-workflow-kit',
        },
        assets: {
            agentFile: path.join(ROOT, 'platforms', 'copilot', 'boomopen-workflow-kit.agent.md'),
        }
    },
    antigravity: {
        name: 'Antigravity (Gemini)',
        description: 'Google Antigravity / Gemini',
        paths: {
            editorHome: path.join(HOME, '.antigravity'),
            gemini: path.join(HOME, '.gemini'),
            antigravity: path.join(HOME, '.gemini', 'config'),
            skills: path.join(HOME, '.gemini', 'config', 'skills'),
            agents: path.join(HOME, '.antigravity', 'agents'), // User accessible agents
            globalAgents: path.join(HOME, '.gemini', 'agents'), // Global config
            workflows: path.join(HOME, '.antigravity', 'workflows'),
            globalWorkflows: path.join(HOME, '.gemini', 'config', 'global_workflows'),
            frameworkPath: path.join(HOME, '.gemini', 'config', 'skills', 'boomopen-workflow-kit'),
        },
        replacements: {
            '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.gemini/config/skills/boomopen-workflow-kit/',
            '~/.gemini/config/skills/boomopen-workflow-kit/': '~/.gemini/config/skills/boomopen-workflow-kit/',
            '~/.gemini/config/skills/agent-assistant/': '~/.gemini/config/skills/boomopen-workflow-kit/',
            '~/.gemini/config/global_workflows/': '~/.gemini/config/global_workflows/',
            '{TOOL}/boomopen-workflow-kit/': 'gemini/config/skills/boomopen-workflow-kit/',
            '{TOOL}': 'gemini/config',
            '{HOME}': '~',
            '~/.agent/': '~/.gemini/config/skills/boomopen-workflow-kit/',
            'boomopen-workflow-kit': 'boomopen-workflow-kit',
        },
        assets: {
            geminiMd: path.join(ROOT, 'platforms', 'antigravity', 'GEMINI.md'),
            agentFile: path.join(ROOT, 'platforms', 'antigravity', 'AntigravityGlobal.agent.md'),
        }
    },
    claude: {
        name: 'Claude Code',
        description: 'Anthropic Claude CLI',
        paths: {
            home: path.join(HOME, '.claude'),
            skills: path.join(HOME, '.claude', 'skills'),
            commands: path.join(HOME, '.claude', 'commands'),
            agents: path.join(HOME, '.claude', 'agents'),
            frameworkPath: path.join(HOME, '.claude', 'skills', 'boomopen-workflow-kit'),
        },
        replacements: {
            '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.claude/skills/boomopen-workflow-kit/',
            '{TOOL}/boomopen-workflow-kit/': 'claude/skills/boomopen-workflow-kit/',
            '{TOOL}': 'claude',
            '{HOME}': '~',
            '~/.agent/': '~/.claude/skills/boomopen-workflow-kit/',
            'boomopen-workflow-kit': 'boomopen-workflow-kit',
        },
        assets: {
            claudeMd: path.join(ROOT, 'platforms', 'claude', 'CLAUDE.md'),
        }
    },
    codex: {
        name: 'Codex',
        description: 'OpenAI Codex CLI',
        paths: {
            home: path.join(HOME, '.codex'),
            skills: path.join(HOME, '.codex', 'skills'),
            commands: path.join(HOME, '.codex', 'commands'),
            agents: path.join(HOME, '.codex', 'agents'),
            frameworkPath: path.join(HOME, '.codex', 'skills', 'boomopen-workflow-kit'),
        },
        replacements: {
            '~/.{TOOL}/skills/boomopen-workflow-kit/': '~/.codex/skills/boomopen-workflow-kit/',
            '{TOOL}/boomopen-workflow-kit/': 'codex/skills/boomopen-workflow-kit/',
            '{TOOL}': 'codex',
            '{HOME}': '~',
            '~/.agent/': '~/.codex/skills/boomopen-workflow-kit/',
            'boomopen-workflow-kit': 'boomopen-workflow-kit',
        },
        assets: {
            codexMd: path.join(ROOT, 'platforms', 'codex', 'CODEX.md'),
            configToml: path.join(ROOT, 'platforms', 'codex', 'config.toml'),
            agentTomlDir: path.join(ROOT, 'platforms', 'codex', 'agents'),
            commandSkillsDir: path.join(ROOT, 'platforms', 'codex', 'skills'),
        }
    }
};

// Core directories to copy for boomopen-workflow-kit framework
// Note: 'workflows' used to exist but was merged into 'rules'
// We copy 'commands' to both 'commands' and 'workflows' for backward compatibility
const CORE_DIRS = ['agents', 'rules', 'documents', 'commands', 'matrix-skills', 'cli'];

// Root files to copy
const ROOT_FILES = ['README.md', 'SKILL.md'];


// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Progress tracking state
 */
const progressState = {
    total: 0,
    current: 0,
    phase: '',
    errors: [],
    startTime: 0,
    copiedFiles: [],
    removedPaths: [],
    lastDraw: 0,          // Throttle draws
    lastPercent: -1       // Track last drawn percent
};

// Check if stdout is a TTY (interactive terminal)
const isTTY = process.stdout.isTTY;

/**
 * Reset progress state for new operation
 */
function resetProgress() {
    progressState.total = 0;
    progressState.current = 0;
    progressState.phase = '';
    progressState.errors = [];
    progressState.startTime = Date.now();
    progressState.copiedFiles = [];
    progressState.removedPaths = [];
    progressState.lastDraw = 0;
    progressState.lastPercent = -1;
}

/**
 * Count total files in a directory (for progress estimation)
 */
function countFiles(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        if (entry.isSymbolicLink()) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += countFiles(fullPath);
        } else {
            count++;
        }
    }
    return count;
}

/**
 * Draw progress bar in terminal (real-time single line update)
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {boolean} force - Force draw regardless of throttle
 */
function drawProgress(current, total, force = false) {
    if (total === 0) return;
    
    const percent = Math.min(100, Math.round((current / total) * 100));
    const now = Date.now();
    
    // Throttle: only draw every 50ms OR when percent changes OR forced
    if (!force && percent === progressState.lastPercent && (now - progressState.lastDraw) < 50) {
        return;
    }
    
    progressState.lastDraw = now;
    progressState.lastPercent = percent;
    
    const width = 40;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    
    // Unicode progress bar characters
    const filledChar = '█';
    const emptyChar = '░';
    
    const bar = filledChar.repeat(filled) + emptyChar.repeat(empty);
    const stats = `${current.toLocaleString()}/${total.toLocaleString()}`;
    const elapsed = ((now - progressState.startTime) / 1000).toFixed(1);
    
    const line = `  ${bar} ${percent}% (${stats}) ${elapsed}s`;
    
    if (isTTY) {
        // Real TTY: clear line and rewrite on same line
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);
    } else {
        // Non-TTY (piped): only print on percent milestones
        if (percent % 10 === 0 && percent !== progressState.lastPercent) {
            console.log(line);
        }
    }
}

/**
 * Update progress counter (no draw - for batch updates)
 */
function updateProgress(phase) {
    progressState.current++;
    progressState.phase = phase;
    drawProgress(progressState.current, progressState.total);
}

/**
 * Complete progress bar and move to next line
 */
function completeProgress() {
    if (progressState.total > 0) {
        drawProgress(progressState.total, progressState.total, true);
        console.log(''); // New line after progress bar
    }
}

/**
 * Log error to progress state
 */
function logError(operation, path, error) {
    progressState.errors.push({
        operation,
        path,
        error: error.message || String(error),
        timestamp: new Date().toISOString()
    });
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyWithReplace(src, dest, replacements = {}, trackProgress = true) {
    if (!fs.existsSync(src)) return 0;
    ensureDir(dest);
    let count = 0;

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        
        // Skip symbolic links for security (prevents path traversal attacks)
        if (entry.isSymbolicLink()) {
            if (process.env.DEBUG) {
                console.log(`  ⚠️ Skipping symlink: ${entry.name}`);
            }
            continue;
        }

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            count += copyWithReplace(srcPath, destPath, replacements, trackProgress);
        } else {
            try {
                // Apply replacements for text files
                const textExtensions = ['.md', '.txt', '.json', '.mdc', '.yaml', '.yml', '.toml'];
                const ext = path.extname(entry.name).toLowerCase();

                const isSkillsLib = destPath.includes('skills_library');
                const forceInstall = process.argv.includes('--force');
                let alreadyUpToDate = false;
                if (isSkillsLib && !forceInstall && fs.existsSync(destPath)) {
                    const srcStat = fs.statSync(srcPath);
                    const destStat = fs.statSync(destPath);
                    alreadyUpToDate = srcStat.size === destStat.size && srcStat.mtimeMs <= destStat.mtimeMs + 1000;
                }
                if (!alreadyUpToDate) {
                    if (textExtensions.includes(ext)) {
                        let content = fs.readFileSync(srcPath, 'utf8');
                        // Sort keys by length (longer first) to prevent partial replacements
                        const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
                        for (const search of keys) {
                            content = content.replaceAll(search, replacements[search]);
                        }
                        const needsWrite = !fs.existsSync(destPath) || fs.readFileSync(destPath, 'utf8') !== content;
                        if (needsWrite) {
                            fs.writeFileSync(destPath, content, 'utf8');
                        }
                    } else {
                        fs.copyFileSync(srcPath, destPath);
                    }
                }
                
                // Track copied file for verification
                progressState.copiedFiles.push(destPath);
                
                // Update progress
                if (trackProgress) {
                    updateProgress(entry.name);
                }
                
                count++;
            } catch (e) {
                logError('copy', srcPath, e);
                if (process.env.DEBUG) {
                    console.warn(`\n  ⚠️ Could not copy ${entry.name}: ${e.message}`);
                }
            }
        }
    }
    return count;
}

function copyFileWithReplace(src, dest, replacements = {}, trackProgress = true) {
    if (!fs.existsSync(src)) return false;

    ensureDir(path.dirname(dest));

    try {
        let content = fs.readFileSync(src, 'utf8');
        const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
        for (const search of keys) {
            content = content.replaceAll(search, replacements[search]);
        }
        
        // Write with fsync for reliability
        fs.writeFileSync(dest, content, 'utf8');
        
        // Track copied file for verification
        progressState.copiedFiles.push(dest);
        
        // Update progress
        if (trackProgress) {
            updateProgress(path.basename(dest));
        }
        
        return true;
    } catch (e) {
        logError('copy', src, e);
        if (process.env.DEBUG) {
            console.warn(`\n  ⚠️ Could not copy ${path.basename(src)}: ${e.message}`);
        }
        return false;
    }
}

/**
 * Copy a kit instruction file into a user-shared location (e.g. ~/.claude/CLAUDE.md),
 * keeping a backup of any user-authored file it replaces.
 */
function installUserFacingFile(src, dest, replacements = {}) {
    if (!fs.existsSync(src)) return false;
    try {
        const backupPath = backupUserFile(dest);
        if (backupPath) {
            console.log(`\n  💾 Backed up your existing ${path.basename(dest)} → ${backupPath}`);
        }
    } catch (e) {
        logError('backup', dest, e);
        console.warn(`\n  ⚠️ Could not back up ${dest} (${e.message}); leaving it untouched.`);
        return false;
    }
    return copyFileWithReplace(src, dest, replacements);
}

/** Record paths removed by user-files helpers so the uninstall summary counts them. */
function trackRemoved(paths) {
    for (const removedPath of paths) {
        progressState.removedPaths.push(removedPath);
        updateProgress(`Removed ${path.basename(removedPath)}`);
    }
    return paths.length;
}

/** Uninstall a kit file from a user-shared location and restore the user's backup. */
function uninstallUserFacingFile(filePath) {
    try {
        const outcome = restoreOrRemoveUserFile(filePath);
        if (outcome.removed) trackRemoved([filePath]);
        if (outcome.restored) console.log(`  ♻️  Restored your original ${filePath}`);
        if (outcome.kept) console.log(`  ℹ️  Kept ${filePath} (modified by you after install)`);
        return outcome.removed || outcome.restored;
    } catch (e) {
        logError('remove', filePath, e);
        return false;
    }
}

/** Remove only the files the kit copied from srcDir into a shared destDir. */
function uninstallMirrored(srcDir, destDir) {
    try {
        return trackRemoved(removeMirroredFiles(srcDir, destDir));
    } catch (e) {
        logError('remove', destDir, e);
        return 0;
    }
}

function removeDir(dir, trackProgress = true) {
    if (fs.existsSync(dir)) {
        try {
            fs.rmSync(dir, { recursive: true, force: true });
            progressState.removedPaths.push(dir);
            if (trackProgress) {
                updateProgress(`Removed ${path.basename(dir)}`);
            }
            return true;
        } catch (e) {
            logError('remove', dir, e);
            return false;
        }
    }
    return false;
}

/**
 * Remove a single file with tracking
 */
function removeFile(filePath, trackProgress = true) {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            progressState.removedPaths.push(filePath);
            if (trackProgress) {
                updateProgress(`Removed ${path.basename(filePath)}`);
            }
            return true;
        } catch (e) {
            logError('remove', filePath, e);
            return false;
        }
    }
    return false;
}

/**
 * Remove all subdirectories within a directory but keep files.
 * @deprecated No longer called by the installer: it also deleted user-created subfolders in
 * shared workflow directories. Kept only for backward compatibility of the module exports.
 */
function removeSubdirectories(dir, trackProgress = true) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (entry.name === '_ref') continue;
                const fullPath = path.join(dir, entry.name);
                fs.rmSync(fullPath, { recursive: true, force: true });
                const prefix = fullPath + path.sep;
                progressState.copiedFiles = progressState.copiedFiles.filter(
                    (filePath) => !filePath.startsWith(prefix)
                );
                if (trackProgress && process.env.DEBUG) {
                    console.log(`  🗑️ Filtered sub-directory for Gemini: ${entry.name}`);
                }
                count++;
            }
        }
    } catch (e) {
        logError('removeSubdirectories', dir, e);
    }
    return count;
}

function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Estimate total files for installation
 */
function estimateInstallFiles() {
    let total = 0;
    
    // Count files in core directories
    try { buildCompactSkillIndex(ROOT); } catch (err) { logError("compact-index", ROOT, err); }
    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        total += countFiles(srcDir);
    }
    
    // Count skills
    const skillsDir = path.join(ROOT, 'skills');
    total += countFiles(skillsDir);
    
    // Count skills library
    const libDir = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libDir)) total += countFiles(libDir);
    
    // Count agents
    const agentsDir = path.join(ROOT, 'agents');
    total += countFiles(agentsDir);
    
    // Commands (copied twice - once to commands, once to workflows for backward compat)
    const commandsDir = path.join(ROOT, 'commands');
    total += countFiles(commandsDir) * 2;
    
    // Root files
    total += ROOT_FILES.length;
    
    // Config files (estimate)
    total += 5;
    
    return total;
}

/**
 * Verify installation by checking copied files exist
 * @returns {Object} Verification result
 */
function verifyInstallation() {
    const verified = [];
    const failed = [];
    
    for (const filePath of progressState.copiedFiles) {
        if (fs.existsSync(filePath)) {
            verified.push(filePath);
        } else {
            failed.push(filePath);
        }
    }
    
    return {
        total: progressState.copiedFiles.length,
        verified: verified.length,
        failed: failed.length,
        failedPaths: failed,
        success: failed.length === 0
    };
}

/**
 * Print summary report
 */
function printSummary(toolName, operation = 'install') {
    const duration = ((Date.now() - progressState.startTime) / 1000).toFixed(2);
    const verification = operation === 'install' ? verifyInstallation() : null;
    
    console.log('\n' + '─'.repeat(60));
    console.log(`📊 ${operation === 'install' ? 'Installation' : 'Uninstallation'} Summary`);
    console.log('─'.repeat(60));
    
    if (operation === 'install') {
        console.log(`   Tool:        ${toolName}`);
        console.log(`   Files:       ${formatNumber(progressState.copiedFiles.length)} copied`);
        console.log(`   Duration:    ${duration}s`);
        
        if (verification) {
            console.log(`   Verified:    ${verification.verified}/${verification.total} files`);
            if (verification.failed > 0) {
                console.log(`   ⚠️  Failed:    ${verification.failed} files`);
                verification.failedPaths.slice(0, 5).forEach(p => {
                    console.log(`                 - ${p}`);
                });
                if (verification.failedPaths.length > 5) {
                    console.log(`                 ... and ${verification.failedPaths.length - 5} more`);
                }
            }
        }
    } else {
        console.log(`   Tool:        ${toolName}`);
        console.log(`   Removed:     ${formatNumber(progressState.removedPaths.length)} paths`);
        console.log(`   Duration:    ${duration}s`);
    }
    
    if (progressState.errors.length > 0) {
        console.log(`   ⚠️  Errors:    ${progressState.errors.length}`);
        progressState.errors.slice(0, 3).forEach(e => {
            console.log(`                 - ${e.operation}: ${path.basename(e.path)} (${e.error})`);
        });
        if (progressState.errors.length > 3) {
            console.log(`                 ... and ${progressState.errors.length - 3} more`);
        }
    }
    
    console.log('─'.repeat(60));
    
    if (operation === 'install' && verification && verification.success && progressState.errors.length === 0) {
        syncSettingsToInstalledPlatforms(loadSettings({ homeDir: HOME }), { homeDir: HOME, repoRoot: ROOT });
        console.log('✅ Installation completed successfully!');
    } else if (operation === 'uninstall' && progressState.errors.length === 0) {
        console.log('✅ Uninstallation completed successfully!');
    } else {
        console.log('⚠️  Operation completed with warnings. Check errors above.');
    }
}

// ============================================================================
// Installation Functions
// ============================================================================

function installCursor() {
    const tool = TOOLS.cursor;
    
    // Reset and estimate progress
    resetProgress();
    progressState.total = estimateInstallFiles();
    
    console.log(`\n📦 Installing BoomOpen Workflow Kit for ${tool.name}...`);
    console.log(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    let total = 0;

    // --- 1. INSTALL EDITOR CONFIG (~/.cursor) ---
    // 1.1 Global MDCs (Rules)
    if (tool.assets.rules && fs.existsSync(tool.assets.rules)) {
        total += copyWithReplace(tool.assets.rules, tool.paths.rules, tool.replacements);
    }

    // 1.2 Global Commands (Suggestions)
    total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.commands, tool.replacements);

    // --- 1.2 Global Config Files (CURSOR.md, AGENT.md, CLAUDE.md) ---
    // We want CURSOR.md, AGENT.md, CLAUDE.md in ~/.cursor/
    // .cursorrules from extension becomes CURSOR.md
    if (tool.assets.cursorRules && fs.existsSync(tool.assets.cursorRules)) {
        const destFile = path.join(tool.paths.editorHome, 'CURSOR.md');
        if (installUserFacingFile(tool.assets.cursorRules, destFile, tool.replacements)) total++;
    }

    // AGENT.md, CLAUDE.md (user-authored copies are backed up first)
    const globalFiles = ['AGENT.md', 'CLAUDE.md'];
    for (const file of globalFiles) {
        const src = path.join(ROOT, file);
        const dest = path.join(tool.paths.editorHome, file);
        if (installUserFacingFile(src, dest, tool.replacements)) total++;
    }

    // --- 2. INSTALL EXTENSION BRAIN (~/.cursor/skills/boomopen-workflow-kit) ---
    // Clean install - remove old framework
    if (fs.existsSync(tool.paths.frameworkPath)) {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
    }
    ensureDir(tool.paths.frameworkPath);

    // Copy all core directories
    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        if (fs.existsSync(srcDir)) {
            total += copyWithReplace(srcDir, path.join(tool.paths.frameworkPath, dir), tool.replacements);
        }
    }

    // Also copy 'commands' to 'workflows' for backward compatibility
    const commandsSrc = path.join(ROOT, 'commands');
    if (fs.existsSync(commandsSrc)) {
        total += copyWithReplace(commandsSrc, path.join(tool.paths.frameworkPath, 'workflows'), tool.replacements);
    }

    // Copy root files (README.md, etc.)
    for (const file of ROOT_FILES) {
        const srcFile = path.join(ROOT, file);
        if (fs.existsSync(srcFile)) {
            if (copyFileWithReplace(srcFile, path.join(tool.paths.frameworkPath, file), tool.replacements)) {
                total++;
            }
        }
    }

    // --- 3. INSTALL USER SKILLS (~/.cursor/skills/) ---
    total += copyWithReplace(path.join(ROOT, 'skills'), tool.paths.skills, tool.replacements);

    // --- INSTALL SKILLS LIBRARY ---
    const libSrc = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libSrc)) {
        const destLib = tool.paths.skills + '_library';
        total += copyWithReplace(libSrc, destLib, tool.replacements);
    }

    // --- 4. NATIVE SUBAGENT SUPPORT (~/.cursor/agents/) ---
    // Only copy bundled agents (merge/update)
    total += copyWithReplace(path.join(ROOT, 'agents'), tool.paths.agents, tool.replacements);

    // Complete progress bar
    completeProgress();
    
    // Print summary with verification
    printSummary(tool.name, 'install');
    
    console.log(`\n   📁 Paths:`);
    console.log(`      Rules:          ${tool.paths.rules}`);
    console.log(`      Commands:       ${tool.paths.commands}`);
    console.log(`      Core Framework: ${tool.paths.frameworkPath}`);
    console.log(`      Skills:         ${tool.paths.skills}`);
    console.log(`      Native Agents:  ${tool.paths.agents}`);

    return total;
}

function installCopilot() {
    const tool = TOOLS.copilot;
    
    // Reset and estimate progress
    resetProgress();
    progressState.total = estimateInstallFiles();
    
    console.log(`\n📦 Installing BoomOpen Workflow Kit for ${tool.name}...`);
    console.log(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    let total = 0;

    // --- 1. INSTALL TO VS CODE PROMPTS & GLOBAL CONFIG ---
    if (tool.assets.agentFile && fs.existsSync(tool.assets.agentFile)) {
        // 1.1 Custom Prompt (VS Code) -> boomopen-workflow-kit.agent.md
        ensureDir(tool.paths.vsCodePrompts);
        const promptDest = path.join(tool.paths.vsCodePrompts, 'boomopen-workflow-kit.agent.md');
        if (copyFileWithReplace(tool.assets.agentFile, promptDest, tool.replacements)) {
            total++;
        }
    }

    // --- 1.2 Global Config Files (COPILOT.md, AGENT.md, CLAUDE.md) ---
    ensureDir(tool.paths.home);
    const globalFiles = ['COPILOT.md', 'AGENT.md', 'CLAUDE.md'];
    for (const file of globalFiles) {
        const src = path.join(ROOT, file);
        const dest = path.join(tool.paths.home, file);
        if (installUserFacingFile(src, dest, tool.replacements)) total++;
    }

    // --- 2. INSTALL CORE FRAMEWORK (~/.copilot/skills/boomopen-workflow-kit) ---
    // Clean install - remove old framework
    if (fs.existsSync(tool.paths.frameworkPath)) {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
    }
    ensureDir(tool.paths.frameworkPath);

    // Copy all core directories
    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        if (fs.existsSync(srcDir)) {
            total += copyWithReplace(srcDir, path.join(tool.paths.frameworkPath, dir), tool.replacements);
        }
    }

    // Install commands to ~/.copilot/commands
    if (fs.existsSync(path.join(ROOT, 'commands'))) {
        ensureDir(tool.paths.commands);
        total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.commands, tool.replacements);
    }

    // Also copy 'commands' to 'workflows' for backward compatibility
    const commandsSrc = path.join(ROOT, 'commands');
    if (fs.existsSync(commandsSrc)) {
        total += copyWithReplace(commandsSrc, path.join(tool.paths.frameworkPath, 'workflows'), tool.replacements);
    }

    // Copy root files (README.md, etc.)
    for (const file of ROOT_FILES) {
        const srcFile = path.join(ROOT, file);
        if (fs.existsSync(srcFile)) {
            if (copyFileWithReplace(srcFile, path.join(tool.paths.frameworkPath, file), tool.replacements)) {
                total++;
            }
        }
    }

    // --- 3. INSTALL USER SKILLS (~/.copilot/skills/) ---
    total += copyWithReplace(path.join(ROOT, 'skills'), tool.paths.skills, tool.replacements);

    // --- INSTALL SKILLS LIBRARY ---
    const libSrc = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libSrc)) {
        const destLib = tool.paths.skills + '_library';
        total += copyWithReplace(libSrc, destLib, tool.replacements);
    }

    // --- 4. NATIVE SUBAGENT SUPPORT (~/.copilot/agents/) ---
    ensureDir(tool.paths.agents);
    total += copyWithReplace(path.join(ROOT, 'agents'), tool.paths.agents, tool.replacements);

    // Complete progress bar
    completeProgress();
    
    // Print summary with verification
    printSummary(tool.name, 'install');
    
    console.log(`\n   📁 Paths:`);
    console.log(`      VS Code Prompts: ${tool.paths.vsCodePrompts}`);
    console.log(`      Global Config:   ${tool.paths.home}`);
    console.log(`      Commands:        ${tool.paths.commands}`);
    console.log(`      Core Framework:  ${tool.paths.frameworkPath}`);
    console.log(`      Skills:          ${tool.paths.skills}`);
    console.log(`      Native Agents:   ${tool.paths.agents}`);

    return total;
}

function installAntigravity() {
    const tool = TOOLS.antigravity;
    
    // Reset and estimate progress
    resetProgress();
    progressState.total = estimateInstallFiles() * 1.5; // Antigravity has more destinations
    
    console.log(`\n📦 Installing BoomOpen Workflow Kit for ${tool.name}...`);
    console.log(`   Estimated files: ~${formatNumber(Math.round(progressState.total))}\n`);

    let total = 0;

    // --- 1. INSTALL EDITOR CONFIG (~/.antigravity) ---
    // 1.1 Workflows (from commands) -> ~/.antigravity/workflows
    ensureDir(tool.paths.workflows);
    total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.workflows, tool.replacements);

    // 1.2 Agents -> ~/.antigravity/agents
    ensureDir(tool.paths.agents);
    total += copyWithReplace(path.join(ROOT, 'agents'), tool.paths.agents, tool.replacements);


    // --- 2. INSTALL PLATFORM CONFIG (~/.gemini) ---
    ensureDir(tool.paths.gemini);

    // 2.1 GEMINI.md
    if (tool.assets.geminiMd && fs.existsSync(tool.assets.geminiMd)) {
        const destFile = path.join(tool.paths.gemini, 'GEMINI.md');
        // Marker-merge: user content outside the markers is preserved
        const MARKER_START = GEMINI_MARKER_START;
        const MARKER_END = GEMINI_MARKER_END;

        let bundledContent = fs.readFileSync(tool.assets.geminiMd, 'utf8');
        const keys = Object.keys(tool.replacements).sort((a, b) => b.length - a.length);
        for (const search of keys) {
            bundledContent = bundledContent.replaceAll(search, tool.replacements[search]);
        }

        const wrappedContent = `${MARKER_START}\n${bundledContent}\n${MARKER_END}`;
        let existingContent = '';
        if (fs.existsSync(destFile)) {
            existingContent = fs.readFileSync(destFile, 'utf8');
            existingContent = existingContent.replace(/<!-- AGENT-ASSISTANT-START -->[\s\S]*?<!-- AGENT-ASSISTANT-END -->\s*/g, '');
        }

        if (existingContent.includes(MARKER_START)) {
            const regex = new RegExp(`${MARKER_START}[\\s\\S]*?${MARKER_END}`, 'g');
            const fd = fs.openSync(destFile, 'w');
            fs.writeSync(fd, existingContent.replace(regex, wrappedContent));
            fs.fsyncSync(fd);
            fs.closeSync(fd);
        } else {
            const separator = existingContent.trim() === '' ? '' : '\n\n';
            const fd = fs.openSync(destFile, 'w');
            fs.writeSync(fd, existingContent.trimEnd() + separator + wrappedContent + '\n');
            fs.fsyncSync(fd);
            fs.closeSync(fd);
        }
        progressState.copiedFiles.push(destFile);
        updateProgress('GEMINI.md');
        total++;
    }

    // 2.2 Remove legacy kit copies of AGENT.md / CLAUDE.md in ~/.gemini/ (duplicate global rule
    // discovery in Antigravity 2.0). Files the user wrote themselves are never touched.
    const legacyGlobalFiles = ['AGENT.md', 'CLAUDE.md'];
    for (const file of legacyGlobalFiles) {
        try {
            removeIfKitOwned(path.join(tool.paths.gemini, file));
        } catch (e) {
            logError('remove', path.join(tool.paths.gemini, file), e);
        }
    }

    // Remove the legacy agent-assistant skill folder (the kit's former name) and only the kit's own
    // files from the legacy global_workflows folder (user workflows there are kept).
    removeDir(path.join(HOME, '.gemini', 'config', 'skills', 'agent-assistant'), false);
    try {
        removeMirroredFiles(path.join(ROOT, 'commands'), path.join(HOME, '.gemini', 'antigravity', 'global_workflows'));
    } catch (e) {
        logError('remove', path.join(HOME, '.gemini', 'antigravity', 'global_workflows'), e);
    }

    // 2.3 Global Agents (~/.gemini/agents)
    ensureDir(tool.paths.globalAgents);

    // AntigravityGlobal.agent.md
    if (tool.assets.agentFile && fs.existsSync(tool.assets.agentFile)) {
        const destFile = path.join(tool.paths.globalAgents, 'AntigravityGlobal.agent.md');
        if (copyFileWithReplace(tool.assets.agentFile, destFile, tool.replacements)) total++;
    }

    // Other Agents
    total += copyWithReplace(path.join(ROOT, 'agents'), tool.paths.globalAgents, tool.replacements);


    // --- 3. INSTALL EXTENSION BRAIN (~/.gemini/config) ---
    // 3.1 Global Workflows (~/.gemini/config/global_workflows)
    ensureDir(tool.paths.globalWorkflows);
    total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.globalWorkflows, tool.replacements);
    // 3.2 Core Framework (~/.gemini/config/skills/boomopen-workflow-kit)
    if (fs.existsSync(tool.paths.frameworkPath)) {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
    }
    ensureDir(tool.paths.frameworkPath);

    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        if (fs.existsSync(srcDir)) {
            total += copyWithReplace(srcDir, path.join(tool.paths.frameworkPath, dir), tool.replacements);
        }
    }

    // Backward compat workflows
    const commandsSrc = path.join(ROOT, 'commands');
    if (fs.existsSync(commandsSrc)) {
        total += copyWithReplace(commandsSrc, path.join(tool.paths.frameworkPath, 'workflows'), tool.replacements);
    }

    for (const file of ROOT_FILES) {
        const srcFile = path.join(ROOT, file);
        if (fs.existsSync(srcFile)) {
            if (copyFileWithReplace(srcFile, path.join(tool.paths.frameworkPath, file), tool.replacements)) total++;
        }
    }

    // 3.3 Skills (~/.gemini/config/skills)
    total += copyWithReplace(path.join(ROOT, 'skills'), tool.paths.skills, tool.replacements);

    // --- INSTALL SKILLS LIBRARY ---
    const libSrc = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libSrc)) {
        const destLib = tool.paths.skills + '_library';
        total += copyWithReplace(libSrc, destLib, tool.replacements);
    }

    // Complete progress bar
    completeProgress();
    
    // Print summary with verification
    printSummary(tool.name, 'install');
    
    console.log(`\n   📁 Paths:`);
    console.log(`      Editor Config:   ${tool.paths.editorHome}`);
    console.log(`      Platform Config: ${tool.paths.gemini}`);
    console.log(`      Extension Brain: ${tool.paths.antigravity}`);

    return total;
}

function installClaude() {
    const tool = TOOLS.claude;
    
    // Reset and estimate progress
    resetProgress();
    progressState.total = estimateInstallFiles();
    
    console.log(`\n📦 Installing BoomOpen Workflow Kit for ${tool.name}...`);
    console.log(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    let total = 0;

    // --- 1. INSTALL GLOBAL CONFIG (~/.claude) ---
    ensureDir(tool.paths.home);

    // 1.1 Global Config Files (CLAUDE.md, AGENT.md)
    if (tool.assets.claudeMd && fs.existsSync(tool.assets.claudeMd)) {
        const destFile = path.join(tool.paths.home, 'CLAUDE.md');
        if (installUserFacingFile(tool.assets.claudeMd, destFile, tool.replacements)) total++;
    }

    // Copy AGENT.md as well
    const agentMdSrc = path.join(ROOT, 'AGENT.md');
    if (installUserFacingFile(agentMdSrc, path.join(tool.paths.home, 'AGENT.md'), tool.replacements)) total++;

    // 1.2 Commands (~/.claude/commands)
    ensureDir(tool.paths.commands);
    total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.commands, tool.replacements);

    // 1.3 Native Agents (~/.claude/agents)
    ensureDir(tool.paths.agents);
    total += copyWithReplace(path.join(ROOT, 'agents'), tool.paths.agents, tool.replacements);

    // --- 2. INSTALL CORE FRAMEWORK (~/.claude/skills/boomopen-workflow-kit) ---
    if (fs.existsSync(tool.paths.frameworkPath)) {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
    }
    ensureDir(tool.paths.frameworkPath);

    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        if (fs.existsSync(srcDir)) {
            total += copyWithReplace(srcDir, path.join(tool.paths.frameworkPath, dir), tool.replacements);
        }
    }

    // Copy backward compat workflows
    const commandsSrc = path.join(ROOT, 'commands');
    if (fs.existsSync(commandsSrc)) {
        total += copyWithReplace(commandsSrc, path.join(tool.paths.frameworkPath, 'workflows'), tool.replacements);
    }

    // Copy root files
    for (const file of ROOT_FILES) {
        const srcFile = path.join(ROOT, file);
        if (fs.existsSync(srcFile)) {
            if (copyFileWithReplace(srcFile, path.join(tool.paths.frameworkPath, file), tool.replacements)) total++;
        }
    }

    // --- 3. INSTALL SKILLS (~/.claude/skills) ---
    total += copyWithReplace(path.join(ROOT, 'skills'), tool.paths.skills, tool.replacements);

    // --- INSTALL SKILLS LIBRARY ---
    const libSrc = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libSrc)) {
        const destLib = tool.paths.skills + '_library';
        total += copyWithReplace(libSrc, destLib, tool.replacements);
    }

    // Complete progress bar
    completeProgress();
    
    // Print summary with verification
    printSummary(tool.name, 'install');
    
    console.log(`\n   📁 Paths:`);
    console.log(`      Home:     ${tool.paths.home}`);
    console.log(`      Commands: ${tool.paths.commands}`);
    console.log(`      Skills:   ${tool.paths.skills}`);

    return total;
}

function mergeCodexConfig(templatePath, userConfigPath) {
    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');

    // Read existing user config or empty string
    let userConfig = '';
    if (fs.existsSync(userConfigPath)) {
        // Keep the pristine pre-install config so uninstall can restore the user's own values
        try {
            const backupPath = backupUserFile(userConfigPath, {
                isKitOwned: (text) => text.includes(CODEX_MARKER_START),
            });
            if (backupPath) console.log(`   💾 Backed up your existing config.toml → ${backupPath}`);
        } catch (e) {
            logError('backup', userConfigPath, e);
            console.warn(`   ⚠️ Could not back up ${userConfigPath} (${e.message}); leaving it untouched.`);
            return false;
        }
        userConfig = fs.readFileSync(userConfigPath, 'utf8');
    }

    // Our marker: lines between start and end markers
    const markerStart = CODEX_MARKER_START;
    const markerEnd = CODEX_MARKER_END;

    // Remove old boomopen-workflow-kit sections from user config
    userConfig = stripMarkedBlock(userConfig, markerStart, markerEnd).text;

    // Update or add project_doc_fallback_filenames in user config
    const docFallback = CODEX_DOC_FALLBACK;
    if (userConfig.includes('project_doc_fallback_filenames')) {
        userConfig = userConfig.replace(/project_doc_fallback_filenames\s*=\s*\[.*?\]/s, docFallback);
    } else {
        // Prepend before first section header or at end of top-level keys
        const firstSection = userConfig.indexOf('\n[');
        if (firstSection !== -1) {
            userConfig = userConfig.substring(0, firstSection) + '\n' + docFallback + '\n' + userConfig.substring(firstSection);
        } else {
            userConfig = userConfig.trimEnd() + '\n' + docFallback + '\n';
        }
    }

    // Build our managed block
    let managedBlock = `\n${markerStart}\n`;
    managedBlock += '# Managed by BoomOpen Workflow Kit — do not edit manually\n\n';

    // Add [features] if not present
    if (!userConfig.includes('[features]')) {
        managedBlock += '[features]\nmulti_agent = true\n\n';
    } else if (!userConfig.includes('multi_agent')) {
        // Need to add multi_agent to existing [features]
        userConfig = userConfig.replace('[features]', '[features]\nmulti_agent = true');
    }

    // Add agents config (always from template)
    // Extract everything from [agents] onward in template
    const agentsSectionMatch = template.match(/(\[agents\][\s\S]*)/);
    if (agentsSectionMatch) {
        managedBlock += agentsSectionMatch[1] + '\n';
    }

    managedBlock += `${markerEnd}\n`;

    // Append managed block to user config
    const finalConfig = userConfig.trimEnd() + '\n' + managedBlock;

    // Write with fsync
    fs.writeFileSync(userConfigPath, finalConfig, 'utf8');

    return true;
}

function installCodex() {
    const tool = TOOLS.codex;
    
    // Reset and estimate progress
    resetProgress();
    progressState.total = estimateInstallFiles();
    
    console.log(`\n📦 Installing BoomOpen Workflow Kit for ${tool.name}...`);
    console.log(`   Estimated files: ~${formatNumber(progressState.total)}\n`);

    let total = 0;

    // --- 1. INSTALL GLOBAL CONFIG (~/.codex) ---
    ensureDir(tool.paths.home);

    // 1.1 Global Config Files (AGENTS.md, CODEX.md, AGENT.md)
    if (tool.assets.codexMd && fs.existsSync(tool.assets.codexMd)) {
        const destFile = path.join(tool.paths.home, 'CODEX.md');
        if (installUserFacingFile(tool.assets.codexMd, destFile, tool.replacements)) total++;

        // Codex discovers global instructions from ~/.codex/AGENTS.md.
        const agentsDestFile = path.join(tool.paths.home, 'AGENTS.md');
        if (installUserFacingFile(tool.assets.codexMd, agentsDestFile, tool.replacements)) total++;
    }

    // Copy AGENT.md as well
    const agentMdSrc = path.join(ROOT, 'AGENT.md');
    if (installUserFacingFile(agentMdSrc, path.join(tool.paths.home, 'AGENT.md'), tool.replacements)) total++;

    // 1.2 Codex-native TOML agent configs (~/.codex/agents/)
    ensureDir(tool.paths.agents);
    if (tool.assets.agentTomlDir && fs.existsSync(tool.assets.agentTomlDir)) {
        total += copyWithReplace(tool.assets.agentTomlDir, tool.paths.agents, tool.replacements);
        console.log(`   ✅ Installed ${fs.readdirSync(tool.assets.agentTomlDir).filter(f => f.endsWith('.toml')).length} Codex agent roles (TOML)`);
    }

    // 1.3 Merge config.toml (agents + features into user config)
    if (tool.assets.configToml && fs.existsSync(tool.assets.configToml)) {
        const userConfigPath = path.join(tool.paths.home, 'config.toml');
        if (mergeCodexConfig(tool.assets.configToml, userConfigPath)) {
            total++;
            console.log(`   ✅ Merged agent config into ${userConfigPath}`);
        }
    }

    // 1.4 Commands (~/.codex/commands — for backward compat)
    ensureDir(tool.paths.commands);
    total += copyWithReplace(path.join(ROOT, 'commands'), tool.paths.commands, tool.replacements);

    // --- 2. INSTALL CORE FRAMEWORK (~/.codex/skills/boomopen-workflow-kit) ---
    if (fs.existsSync(tool.paths.frameworkPath)) {
        fs.rmSync(tool.paths.frameworkPath, { recursive: true, force: true });
    }
    ensureDir(tool.paths.frameworkPath);

    for (const dir of CORE_DIRS) {
        const srcDir = path.join(ROOT, dir);
        if (fs.existsSync(srcDir)) {
            total += copyWithReplace(srcDir, path.join(tool.paths.frameworkPath, dir), tool.replacements);
        }
    }

    // Copy backward compat workflows
    const commandsSrc = path.join(ROOT, 'commands');
    if (fs.existsSync(commandsSrc)) {
        total += copyWithReplace(commandsSrc, path.join(tool.paths.frameworkPath, 'workflows'), tool.replacements);
    }

    // Copy root files
    for (const file of ROOT_FILES) {
        const srcFile = path.join(ROOT, file);
        if (fs.existsSync(srcFile)) {
            if (copyFileWithReplace(srcFile, path.join(tool.paths.frameworkPath, file), tool.replacements)) total++;
        }
    }

    // --- 3. INSTALL SKILLS (~/.codex/skills) ---
    total += copyWithReplace(path.join(ROOT, 'skills'), tool.paths.skills, tool.replacements);

    // --- INSTALL SKILLS LIBRARY ---
    const libSrc = path.join(ROOT, 'skills_library');
    if (fs.existsSync(libSrc)) {
        const destLib = tool.paths.skills + '_library';
        total += copyWithReplace(libSrc, destLib, tool.replacements);
    }

    // 3.1 Install Codex-specific command skills (from platforms/codex/skills/)
    if (tool.assets.commandSkillsDir && fs.existsSync(tool.assets.commandSkillsDir)) {
        total += copyWithReplace(tool.assets.commandSkillsDir, tool.paths.skills, tool.replacements);
        const cmdSkillCount = fs.readdirSync(tool.assets.commandSkillsDir)
            .filter(f => fs.statSync(path.join(tool.assets.commandSkillsDir, f)).isDirectory()).length;
        console.log(`   ✅ Installed ${cmdSkillCount} command skills (Codex-native)`);
    }

    // Complete progress bar
    completeProgress();
    
    // Print summary with verification
    printSummary(tool.name, 'install');
    
    console.log(`\n   📁 Paths:`);
    console.log(`      Home:      ${tool.paths.home}`);
    console.log(`      Agents:    ${tool.paths.agents} (TOML configs)`);
    console.log(`      Commands:  ${tool.paths.commands}`);
    console.log(`      Skills:    ${tool.paths.skills}`);
    console.log(`      Framework: ${tool.paths.frameworkPath}`);

    return total;
}

// ============================================================================
// Uninstall Functions
// ============================================================================

/**
 * Shared uninstall prologue: reset progress and print the banner.
 */
function beginUninstall(tool, estimatedOps) {
    resetProgress();
    progressState.total = estimatedOps;
    console.log(`\n🗑️  Uninstalling BoomOpen Workflow Kit from ${tool.name}...`);
    console.log(`   Only files shipped by the kit are removed; your own files are kept.\n`);
}

/**
 * Shared uninstall epilogue: summary + preserved-skills note.
 */
function finishUninstall(tool, removed) {
    completeProgress();
    printSummary(tool.name, 'uninstall');
    console.log(`\n   ℹ️  User skills preserved at: ${tool.paths.skills}`);
    return removed;
}

function uninstallCursor() {
    const tool = TOOLS.cursor;
    beginUninstall(tool, 10);
    let removed = 0;

    // 1. Kit rules + global instruction files (user originals are restored from backup)
    removed += uninstallMirrored(tool.assets.rules, tool.paths.rules);
    for (const file of ['CURSOR.md', 'AGENT.md', 'CLAUDE.md']) {
        if (uninstallUserFacingFile(path.join(tool.paths.editorHome, file))) removed++;
    }

    // 2. Commands and native agents: only the files the kit copied
    removed += uninstallMirrored(path.join(ROOT, 'commands'), tool.paths.commands);
    removed += uninstallMirrored(path.join(ROOT, 'agents'), tool.paths.agents);

    // 3. Core framework (kit-owned folder)
    if (removeDir(tool.paths.frameworkPath)) removed++;

    return finishUninstall(tool, removed);
}

function uninstallCopilot() {
    const tool = TOOLS.copilot;
    beginUninstall(tool, 10);
    let removed = 0;

    // 1. Kit prompt file in VS Code prompts (kit-named)
    if (removeFile(path.join(tool.paths.vsCodePrompts, 'boomopen-workflow-kit.agent.md'))) removed++;

    // 2. Core framework (kit-owned folder)
    if (removeDir(tool.paths.frameworkPath)) removed++;

    // 3. Commands and native agents: only the files the kit copied
    removed += uninstallMirrored(path.join(ROOT, 'commands'), tool.paths.commands);
    removed += uninstallMirrored(path.join(ROOT, 'agents'), tool.paths.agents);

    // 4. Global instruction files (user originals are restored from backup)
    for (const file of ['AGENT.md', 'COPILOT.md', 'CLAUDE.md']) {
        if (uninstallUserFacingFile(path.join(tool.paths.home, file))) removed++;
    }

    return finishUninstall(tool, removed);
}

function uninstallAntigravity() {
    const tool = TOOLS.antigravity;
    beginUninstall(tool, 12);
    let removed = 0;
    const commandsSrc = path.join(ROOT, 'commands');
    const agentsSrc = path.join(ROOT, 'agents');

    // 1. Editor config (~/.antigravity): only the kit's workflows and agents
    removed += uninstallMirrored(commandsSrc, tool.paths.workflows);
    removed += uninstallMirrored(agentsSrc, tool.paths.agents);

    // 2. ~/.gemini/GEMINI.md: strip only the kit's marked block, keep the user's own rules
    const geminiMd = path.join(tool.paths.gemini, 'GEMINI.md');
    try {
        let status = removeMarkedBlockFromFile(geminiMd, GEMINI_MARKER_START, GEMINI_MARKER_END);
        if (status === 'updated') {
            // The settings block may have been injected outside the kit block; drop it too.
            const settingsStatus = removeMarkedBlockFromFile(geminiMd, SETTINGS_MARKER_START, SETTINGS_MARKER_END);
            if (settingsStatus === 'deleted') status = 'deleted';
        }
        if (status === 'deleted') removed += trackRemoved([geminiMd]);
        if (status === 'updated') {
            removed++;
            console.log(`  ✂️  Removed the kit block from ${geminiMd} (your content kept)`);
        }
    } catch (e) {
        logError('remove', geminiMd, e);
    }

    // Legacy kit copies of AGENT.md / CLAUDE.md in ~/.gemini (user-authored ones are kept)
    for (const file of ['AGENT.md', 'CLAUDE.md']) {
        if (uninstallUserFacingFile(path.join(tool.paths.gemini, file))) removed++;
    }

    // 3. Global agents (~/.gemini/agents): kit agents + the kit's orchestrator agent file
    if (removeFile(path.join(tool.paths.globalAgents, 'AntigravityGlobal.agent.md'))) removed++;
    removed += uninstallMirrored(agentsSrc, tool.paths.globalAgents);

    // 4. Extension brain: kit workflows + core framework (kit-owned folder)
    removed += uninstallMirrored(commandsSrc, tool.paths.globalWorkflows);
    if (removeDir(tool.paths.frameworkPath)) removed++;

    return finishUninstall(tool, removed);
}

function uninstallClaude() {
    const tool = TOOLS.claude;
    beginUninstall(tool, 6);
    let removed = 0;

    // 1. Global instruction files (user originals are restored from backup)
    for (const file of ['CLAUDE.md', 'AGENT.md']) {
        if (uninstallUserFacingFile(path.join(tool.paths.home, file))) removed++;
    }

    // 2. Commands and native agents: only the files the kit copied
    removed += uninstallMirrored(path.join(ROOT, 'commands'), tool.paths.commands);
    removed += uninstallMirrored(path.join(ROOT, 'agents'), tool.paths.agents);

    // 3. Core framework (kit-owned folder)
    if (removeDir(tool.paths.frameworkPath)) removed++;

    return finishUninstall(tool, removed);
}

/**
 * Remove the kit's managed block (and the keys it rewrote) from ~/.codex/config.toml so the
 * remaining config never points at deleted agent TOMLs.
 */
function uninstallCodexConfig(tool) {
    const configPath = path.join(tool.paths.home, 'config.toml');
    const backupPath = configPath + BACKUP_SUFFIX;
    if (!fs.existsSync(configPath)) return 0;
    try {
        const original = fs.existsSync(backupPath) ? fs.readFileSync(backupPath, 'utf8') : null;
        const current = fs.readFileSync(configPath, 'utf8');
        const cleaned = stripCodexManagedConfig(current, original);
        if (cleaned === current) return 0;
        if (cleaned === '') {
            fs.unlinkSync(configPath);
            trackRemoved([configPath]);
            return 1;
        }
        fs.writeFileSync(configPath, cleaned, 'utf8');
        console.log(`  ✂️  Removed the kit's agent config from ${configPath}`);
        if (original !== null) console.log(`  ℹ️  Your pre-install config is kept at ${backupPath}`);
        return 1;
    } catch (e) {
        logError('remove', configPath, e);
        return 0;
    }
}

function uninstallCodex() {
    const tool = TOOLS.codex;
    beginUninstall(tool, 8);
    let removed = 0;

    // 1. Global instruction files (user originals are restored from backup)
    for (const file of ['CODEX.md', 'AGENTS.md', 'AGENT.md']) {
        if (uninstallUserFacingFile(path.join(tool.paths.home, file))) removed++;
    }

    // 2. config.toml managed block first, so Codex never references removed agent TOMLs
    removed += uninstallCodexConfig(tool);

    // 3. Commands, agent TOMLs and Codex command skills: only the files the kit copied
    removed += uninstallMirrored(path.join(ROOT, 'commands'), tool.paths.commands);
    removed += uninstallMirrored(tool.assets.agentTomlDir, tool.paths.agents);
    removed += uninstallMirrored(tool.assets.commandSkillsDir, tool.paths.skills);

    // 4. Core framework (kit-owned folder)
    if (removeDir(tool.paths.frameworkPath)) removed++;

    return finishUninstall(tool, removed);
}


// ============================================================================
// CLI Interface
// ============================================================================

function printBanner() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🤖 BoomOpen Workflow Kit Framework Installer                      ║
║                                                               ║
║   Multi-agent orchestration for AI coding assistants          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
}

function printUsage() {
    console.log(`
Usage: npx boomopen-workflow-kit <command> [options]

Commands:
  install [tool]     Install for a specific tool (cursor, copilot, antigravity, claude, codex)
  install --all      Install for all supported tools
  uninstall [tool]   Uninstall from a specific tool
  settings [subcmd]  Configure workflow presets, execution mode, or launch Web UI (--ui)
  doctor             Run framework health & entrypoint diagnostics
  check [dir]        Audit source files against Pragmatic 2-Tier Coding Standards
  list               List supported tools and installation status
  help               Show this help message

Examples:
  npx boomopen-workflow-kit install cursor
  npx boomopen-workflow-kit install --all
  npx boomopen-workflow-kit settings preset adversarial-team
  npx boomopen-workflow-kit settings --ui --port 4567
  npx boomopen-workflow-kit uninstall copilot
  npx boomopen-workflow-kit list
`);
}

function listTools() {
    console.log('\n📋 Supported Tools:\n');

    for (const [key, tool] of Object.entries(TOOLS)) {
        // Check for the frameworkPath path which all tools now have
        const installed = fs.existsSync(tool.paths.frameworkPath);
        const status = installed ? '✅ Installed' : '⬚ Not installed';

        console.log(`  ${key.padEnd(12)} ${tool.name.padEnd(25)} ${status}`);

        if (installed) {
            // Show installation details
            const details = [];
            if (key === 'cursor') {
                if (fs.existsSync(path.join(tool.paths.rules, 'boomopen-workflow-kit.mdc'))) {
                    details.push('rules');
                }
            }
            if (key === 'copilot') {
                if (fs.existsSync(path.join(tool.paths.vsCodePrompts, 'boomopen-workflow-kit.agent.md'))) {
                    details.push('VS Code prompts');
                }
            }
            if (key === 'antigravity') {
                const geminiPath = path.join(tool.paths.gemini, 'GEMINI.md');
                if (fs.existsSync(geminiPath)) {
                    const content = fs.readFileSync(geminiPath, 'utf8');
                    if (content.includes('boomopen-workflow-kit-START')) {
                        details.push('GEMINI.md');
                    }
                }
            }
            if (key === 'claude') {
                if (fs.existsSync(path.join(tool.paths.home, 'CLAUDE.md'))) {
                    details.push('CLAUDE.md');
                }
            }
            if (key === 'codex') {
                if (fs.existsSync(path.join(tool.paths.home, 'AGENTS.md'))) {
                    details.push('AGENTS.md');
                }
                if (fs.existsSync(path.join(tool.paths.home, 'CODEX.md'))) {
                    details.push('CODEX.md');
                }
            }
            if (details.length > 0) {
                console.log(`               ${' '.padEnd(25)} (${details.join(', ')})`);
            }
        }
    }
    console.log('');
}

async function promptToolSelection() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log('\n📋 Select tools to install:\n');
        console.log('  1. Cursor');
        console.log('  2. GitHub Copilot');
        console.log('  3. Antigravity (Gemini)');
        console.log('  4. Claude Code');
        console.log('  5. Codex');
        console.log('  6. All tools');
        console.log('  0. Cancel\n');

        rl.question('Enter your choice (0-6): ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function interactiveInstall() {
    const choice = await promptToolSelection();

    switch (choice) {
        case '1':
            installCursor();
            break;
        case '2':
            installCopilot();
            break;
        case '3':
            installAntigravity();
            break;
        case '4':
            installClaude();
            break;
        case '5':
            installCodex();
            break;
        case '6':
            installCursor();
            installCopilot();
            installAntigravity();
            installClaude();
            installCodex();
            break;
        case '0':
            console.log('\n❌ Installation cancelled.\n');
            break;
        default:
            console.log('\n❌ Invalid choice. Please enter 0-6.\n');
    }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const command = args[0]?.toLowerCase();
    const target = args[1]?.toLowerCase();

    printBanner();

    if (!command || command === 'help' || command === '--help' || command === '-h') {
        printUsage();
        return;
    }

    const startTime = Date.now();
    let totalFiles = 0;

    switch (command) {
        case 'install':
            if (target === '--all' || target === 'all') {
                console.log('🚀 Installing for all supported tools...');
                console.log('   This may take a moment. Progress will be shown for each tool.\n');
                totalFiles += installCursor();
                totalFiles += installCopilot();
                totalFiles += installAntigravity();
                totalFiles += installClaude();
                totalFiles += installCodex();
                
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log('\n' + '═'.repeat(60));
                console.log('🎉 All installations complete!');
                console.log(`   Total files: ${formatNumber(totalFiles)}`);
                console.log(`   Total time:  ${duration}s`);
                console.log('═'.repeat(60) + '\n');
            } else if (target === 'cursor') {
                installCursor();
            } else if (target === 'copilot') {
                installCopilot();
            } else if (target === 'antigravity' || target === 'gemini') {
                installAntigravity();
            } else if (target === 'claude' || target === 'claude-code') {
                installClaude();
            } else if (target === 'codex') {
                installCodex();
            } else if (!target) {
                await interactiveInstall();
            } else {
                console.log(`❌ Unknown tool: ${target}`);
                console.log('   Supported tools: cursor, copilot, antigravity, claude, codex');
            }
            break;

        case 'uninstall':
            if (target === '--all' || target === 'all') {
                console.log('🗑️  Uninstalling from all tools...\n');
                uninstallCursor();
                uninstallCopilot();
                uninstallAntigravity();
                uninstallClaude();
                uninstallCodex();
                
                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log('\n' + '═'.repeat(60));
                console.log('✅ All uninstallations complete!');
                console.log(`   Total time: ${duration}s`);
                console.log('═'.repeat(60) + '\n');
            } else if (target === 'cursor') {
                uninstallCursor();
            } else if (target === 'copilot') {
                uninstallCopilot();
            } else if (target === 'antigravity' || target === 'gemini') {
                uninstallAntigravity();
            } else if (target === 'claude' || target === 'claude-code') {
                uninstallClaude();
            } else if (target === 'codex') {
                uninstallCodex();
            } else {
                console.log(`❌ Please specify a tool: cursor, copilot, antigravity, claude, codex, or --all`);
            }
            break;

        case 'list':
            listTools();
            break;

        case 'doctor': {
            const report = runDoctor({ repoRoot: ROOT, homeDir: HOME });
            if (!report.healthy) process.exitCode = 1;
            break;
        }

        case 'check': {
            const checkDir = process.argv[3] || process.cwd();
            const report = runCheck(checkDir);
            if (!report.passed) process.exitCode = 1;
            break;
        }

        case 'settings':
        case 'config': {
            await runSettingsCommand(args.slice(1), { homeDir: HOME, cwd: process.cwd(), repoRoot: ROOT });
            break;
        }

        default:
            console.log(`❌ Unknown command: ${command}`);
            printUsage();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    TOOLS,
    ROOT_FILES,
    ensureDir,
    copyWithReplace,
    copyFileWithReplace,
    removeDir,
    removeFile,
    removeSubdirectories,
    countFiles,
    buildCompactSkillIndex,
    runDoctor,
    runCheck,
    loadSettings,
    saveSettings,
    setSettingByKey,
    getSettingByKey,
    applyPreset,
    resetSettings,
    renderActiveSettingsMarkdown,
    injectSettingsBlockIntoText,
    syncSettingsToInstalledPlatforms,
    runSettingsCommand,
    startSettingsUiServer,
};



