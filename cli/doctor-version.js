'use strict';

/**
 * The kit version has one source of truth: the "version" field of the kit's package.json.
 */

const UNKNOWN_VERSION = 'unknown';

/**
 * @returns {string}
 */
function readKitVersion() {
  try {
    const pkg = require('../package.json');
    return typeof pkg.version === 'string' && pkg.version ? pkg.version : UNKNOWN_VERSION;
  } catch (err) {
    // An installed framework copy may not ship package.json; never crash a diagnostic for it.
    if (err && err.code === 'MODULE_NOT_FOUND') return UNKNOWN_VERSION;
    throw err;
  }
}

const KIT_VERSION = readKitVersion();

module.exports = { KIT_VERSION, UNKNOWN_VERSION };
