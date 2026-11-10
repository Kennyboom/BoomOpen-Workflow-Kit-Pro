'use strict';

/**
 * Progress bar + error log shared by install/uninstall.
 * TTY: one self-rewriting line. Non-TTY (CI, pipes): one line per 10% milestone.
 */

const BAR_WIDTH = 40;
const DRAW_THROTTLE_MS = 50;
const MILESTONE_STEP = 10;

const state = {
    total: 0,
    current: 0,
    errors: [],
    copiedFiles: [],
    removedPaths: [],
    startTime: 0,
    lastDraw: 0,
    lastPercent: -1,
    lastMilestone: -1,
    barOnScreen: false,
};

function isTTY() {
    return Boolean(process.stdout.isTTY);
}

function resetProgress(total = 0) {
    state.total = Math.max(0, Math.round(total));
    state.current = 0;
    state.errors = [];
    state.copiedFiles = [];
    state.removedPaths = [];
    state.startTime = Date.now();
    state.lastDraw = 0;
    state.lastPercent = -1;
    state.lastMilestone = -1;
    state.barOnScreen = false;
}

/** Clear an unfinished bar so other output never lands on the same line. */
function clearBar() {
    if (!state.barOnScreen || !isTTY()) return;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    state.barOnScreen = false;
}

function printLine(message = '') {
    clearBar();
    console.log(message);
}

function warnLine(message) {
    clearBar();
    console.warn(message);
}

function drawProgress(force = false) {
    if (state.total === 0) return; // no operation in progress (e.g. library helpers used directly)
    // Estimates can be low; never show "x/y" with x > y.
    const total = Math.max(state.total, state.current);
    const percent = Math.min(100, Math.round((state.current / total) * 100));
    const now = Date.now();
    if (!force && percent === state.lastPercent && now - state.lastDraw < DRAW_THROTTLE_MS) return;

    const previousPercent = state.lastPercent;
    state.lastDraw = now;
    state.lastPercent = percent;
    const filled = Math.round((percent / 100) * BAR_WIDTH);
    const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
    const elapsed = ((now - state.startTime) / 1000).toFixed(1);
    const line = `  ${bar} ${percent}% (${state.current.toLocaleString()}/${total.toLocaleString()}) ${elapsed}s`;

    if (isTTY()) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(line);
        state.barOnScreen = true;
        return;
    }
    const milestone = Math.floor(percent / MILESTONE_STEP) * MILESTONE_STEP;
    if (milestone !== state.lastMilestone && (percent !== previousPercent || force)) {
        state.lastMilestone = milestone;
        console.log(line);
    }
}

function tick() {
    state.current++;
    drawProgress();
}

function completeProgress() {
    if (state.total === 0 && state.current === 0) return;
    state.total = Math.max(state.total, state.current);
    state.current = state.total;
    drawProgress(true);
    if (isTTY()) {
        process.stdout.write('\n');
        state.barOnScreen = false;
    }
}

function logError(operation, targetPath, error) {
    state.errors.push({
        operation,
        path: targetPath,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
    });
}

module.exports = {
    progressState: state,
    resetProgress,
    drawProgress,
    tick,
    completeProgress,
    logError,
    printLine,
    warnLine,
    clearBar,
};
