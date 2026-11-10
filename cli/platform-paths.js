'use strict';

/**
 * OS-specific locations shared by the installer and the settings engine, so both always
 * read and write the same files.
 */

const path = require('node:path');

/**
 * VS Code user prompts folder (where the Copilot custom agent file is installed).
 * @param {string} homeDir user home directory
 * @param {NodeJS.ProcessEnv} env environment (APPDATA on Windows)
 * @param {NodeJS.Platform} platform target platform
 * @returns {string}
 */
function getVSCodePromptsFolder(homeDir, env = process.env, platform = process.platform) {
    switch (platform) {
        case 'win32':
            return path.join(env.APPDATA || path.join(homeDir, 'AppData', 'Roaming'), 'Code', 'User', 'prompts');
        case 'darwin':
            return path.join(homeDir, 'Library', 'Application Support', 'Code', 'User', 'prompts');
        default:
            return path.join(env.XDG_CONFIG_HOME || path.join(homeDir, '.config'), 'Code', 'User', 'prompts');
    }
}

module.exports = { getVSCodePromptsFolder };
