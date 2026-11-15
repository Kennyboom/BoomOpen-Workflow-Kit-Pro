'use strict';

/**
 * Settings schema: allowed values, presets, defaults and pure validation helpers.
 * No file-system access here, so every other settings module can depend on it.
 */

const { KIT_VERSION } = require('./doctor-version.js');

const CODING_STANDARDS_PRESETS = {
  pragmatic: { softFileLines: 400, hardFileLines: 500, forbidExplicitAny: true, warnConsoleLog: true },
  strict: { softFileLines: 300, hardFileLines: 400, forbidExplicitAny: true, warnConsoleLog: true },
  relaxed: { softFileLines: 600, hardFileLines: 800, forbidExplicitAny: true, warnConsoleLog: false },
};

const ALLOWED_ENUMS = {
  preset: ['smart-hybrid', 'carbon-guardrails', 'solo-fast', 'deep-architect', 'adversarial-team', 'custom'],
  'execution.mode': ['auto', 'mode_a', 'mode_b', 'team'],
  'execution.modeAThresholdFiles': [1, 2, 3, 5, 10],
  'execution.swarmScaling': ['elastic', 'hyper_swarm', 'conservative'],
  'execution.maxParallelSubagents': [3, 6, 8, 12, 16],
  'workflows.defaultVariant': ['auto', 'fast', 'hard', 'team', 'ask'],
  'workflows.naturalLanguageResearchTrigger': ['auto_team', 'auto_hard', 'ask_first', 'off'],
  'models.subagentPolicy': ['quality_first', 'strict_inherit', 'balanced_speed'],
  'research.depth': ['5_lens_deep', 'standard', 'quick_brief'],
  'clarification.style': ['autonomous_first', 'interactive_ask', 'zero_questions'],
  'teams.maxDebateRounds': [1, 2, 3],
  'codingStandards.preset': ['pragmatic', 'strict', 'relaxed'],
  'verification.level': ['strict_e2e', 'fast_check', 'manual'],
  'deliverables.routing': ['brain_artifacts', 'workspace_reports', 'both'],
  'language.response': [
    'auto',
    'vi',
    'en',
    'zh-CN',
    'zh-TW',
    'ja',
    'ko',
    'es',
    'fr',
    'de',
    'pt-BR',
    'ru',
    'hi',
    'ar',
    'id',
    'th',
    'tr',
    'it',
  ],
  'engines.researcher': ['current', 'auto', 'council', 'antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  'engines.planner': ['current', 'auto', 'council', 'antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  'engines.coder': ['current', 'auto', 'antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  'engines.debugger': ['current', 'auto', 'cross_family', 'council', 'antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  'engines.reviewer': ['current', 'auto', 'cross_family', 'council', 'antigravity', 'claude', 'codex', 'cursor', 'copilot'],
  'engines.councilMembers': [
    'claude,codex,antigravity',
    'claude,codex,antigravity,cursor',
    'claude,codex,antigravity,cursor,copilot',
    'claude,codex',
    'claude,antigravity',
    'codex,antigravity',
    'claude,cursor',
    'codex,cursor',
    'all_installed',
  ],
};

const SETTING_DESCRIPTIONS = {
  preset: 'Named configuration profile (smart-hybrid, carbon-guardrails, solo-fast, deep-architect, adversarial-team, custom)',
  'execution.mode': 'Orchestration gate mode (auto Proactive Sub-agent First, mode_a Direct, mode_b Orchestrator, team Golden Triangle)',
  'execution.modeAThresholdFiles': 'Max known-target files allowed in Mode A before spawning parallel sub-agents',
  'execution.swarmScaling': 'Sub-agent swarm scaling strategy (elastic 1->2-3->4-6->8+, hyper_swarm aggressive sharding, conservative 2-3 cap)',
  'execution.maxParallelSubagents': 'Max parallel sub-agents per wave (3, 6, 8, 12, or 16; default 8 in smart-hybrid)',
  'workflows.defaultVariant': 'Default slash-command variant when omitted (auto, fast, hard, team, ask)',
  'workflows.naturalLanguageResearchTrigger': 'Route natural-language intents (plan, design, research, brainstorm, review, debug, fix, test, cook, docs) automatically across all 17 languages (auto_team, auto_hard, ask_first, off)',
  'models.subagentPolicy': 'Sub-agent model selection policy (quality_first, strict_inherit, balanced_speed)',
  'research.depth': 'Research and brainstorm depth (5_lens_deep, standard, quick_brief)',
  'clarification.style': 'Ambiguity clarification style (autonomous_first, interactive_ask, zero_questions)',
  'teams.maxDebateRounds': 'Max adversarial critique/revision rounds in :team workflows (1, 2, or 3)',
  'codingStandards.preset': '2-Tier coding standards profile (pragmatic 400/500, strict 300/400, relaxed 600/800)',
  'verification.level': 'Verification strictness before reporting completion (strict_e2e, fast_check, manual)',
  'deliverables.routing': 'Where transient workflow deliverables are written (brain_artifacts, workspace_reports, both)',
  'language.response': 'Language for user responses and reports (auto or any of the 17 supported languages: vi, en, zh-CN, zh-TW, ja, ko, es, fr, de, pt-BR, ru, hi, ar, id, th, tr, it)',
  'engines.researcher': 'Cross-engine routing for deep research (current, auto, council, or a specific engine)',
  'engines.planner': 'Cross-engine routing for architecture & planning (current, auto, council, or a specific engine)',
  'engines.coder': 'Cross-engine routing for code implementation (current, auto, or a specific engine)',
  'engines.debugger': 'Cross-engine routing for debugging (current, auto, cross_family Author!=Critic, council, or a specific engine)',
  'engines.reviewer': 'Cross-engine routing for code review (current, auto, cross_family Author!=Critic, council, or a specific engine)',
  'engines.councilMembers': 'Engines participating in Multi-Engine Parallel Council consensus (claude,codex,antigravity, etc.)',
};

/** Free-form numeric keys (custom line limits) that may be stored next to the enum keys. */
const LINE_LIMIT_KEYS = ['codingStandards.softFileLines', 'codingStandards.hardFileLines'];
const MIN_LINE_LIMIT = 1;
const MAX_LINE_LIMIT = 100_000;
const CUSTOM_PRESET = 'custom';

const DEFAULT_SETTINGS = {
  version: KIT_VERSION,
  preset: 'smart-hybrid',
  execution: { mode: 'auto', modeAThresholdFiles: 2, swarmScaling: 'elastic', maxParallelSubagents: 8 },
  workflows: { defaultVariant: 'auto', naturalLanguageResearchTrigger: 'auto_team' },
  models: { subagentPolicy: 'quality_first' },
  research: { depth: '5_lens_deep' },
  clarification: { style: 'autonomous_first' },
  teams: { maxDebateRounds: 3 },
  codingStandards: { ...CODING_STANDARDS_PRESETS.pragmatic, preset: 'pragmatic' },
  verification: { level: 'strict_e2e' },
  deliverables: { routing: 'brain_artifacts' },
  language: { response: 'auto' },
  engines: {
    researcher: 'current',
    planner: 'current',
    coder: 'current',
    debugger: 'current',
    reviewer: 'current',
    councilMembers: 'claude,codex,antigravity',
  },
};

const PRESETS = {
  'smart-hybrid': structuredClone(DEFAULT_SETTINGS),
  'carbon-guardrails': {
    version: KIT_VERSION,
    preset: 'carbon-guardrails',
    execution: { mode: 'mode_a', modeAThresholdFiles: 10, swarmScaling: 'elastic', maxParallelSubagents: 8 },
    workflows: { defaultVariant: 'auto', naturalLanguageResearchTrigger: 'off' },
    models: { subagentPolicy: 'quality_first' },
    research: { depth: '5_lens_deep' },
    clarification: { style: 'autonomous_first' },
    teams: { maxDebateRounds: 3 },
    codingStandards: { ...CODING_STANDARDS_PRESETS.pragmatic, preset: 'pragmatic' },
    verification: { level: 'strict_e2e' },
    deliverables: { routing: 'brain_artifacts' },
    language: { response: 'auto' },
    engines: {
      researcher: 'current',
      planner: 'current',
      coder: 'current',
      debugger: 'current',
      reviewer: 'current',
      councilMembers: 'claude,codex,antigravity',
    },
  },
  'solo-fast': {
    version: KIT_VERSION,
    preset: 'solo-fast',
    execution: { mode: 'mode_a', modeAThresholdFiles: 10, swarmScaling: 'conservative', maxParallelSubagents: 3 },
    workflows: { defaultVariant: 'fast', naturalLanguageResearchTrigger: 'off' },
    models: { subagentPolicy: 'balanced_speed' },
    research: { depth: 'quick_brief' },
    clarification: { style: 'zero_questions' },
    teams: { maxDebateRounds: 1 },
    codingStandards: { ...CODING_STANDARDS_PRESETS.relaxed, preset: 'relaxed' },
    verification: { level: 'fast_check' },
    deliverables: { routing: 'brain_artifacts' },
    language: { response: 'auto' },
    engines: {
      researcher: 'current',
      planner: 'current',
      coder: 'current',
      debugger: 'current',
      reviewer: 'current',
      councilMembers: 'claude,codex',
    },
  },
  'deep-architect': {
    version: KIT_VERSION,
    preset: 'deep-architect',
    execution: { mode: 'mode_b', modeAThresholdFiles: 1, swarmScaling: 'elastic', maxParallelSubagents: 12 },
    workflows: { defaultVariant: 'hard', naturalLanguageResearchTrigger: 'auto_hard' },
    models: { subagentPolicy: 'strict_inherit' },
    research: { depth: '5_lens_deep' },
    clarification: { style: 'interactive_ask' },
    teams: { maxDebateRounds: 3 },
    codingStandards: { ...CODING_STANDARDS_PRESETS.strict, preset: 'strict' },
    verification: { level: 'strict_e2e' },
    deliverables: { routing: 'brain_artifacts' },
    language: { response: 'auto' },
    engines: {
      researcher: 'council',
      planner: 'auto',
      coder: 'auto',
      debugger: 'cross_family',
      reviewer: 'cross_family',
      councilMembers: 'claude,codex,antigravity',
    },
  },
  'adversarial-team': {
    version: KIT_VERSION,
    preset: 'adversarial-team',
    execution: { mode: 'team', modeAThresholdFiles: 1, swarmScaling: 'hyper_swarm', maxParallelSubagents: 12 },
    workflows: { defaultVariant: 'team', naturalLanguageResearchTrigger: 'auto_team' },
    models: { subagentPolicy: 'strict_inherit' },
    research: { depth: '5_lens_deep' },
    clarification: { style: 'interactive_ask' },
    teams: { maxDebateRounds: 3 },
    codingStandards: { ...CODING_STANDARDS_PRESETS.strict, preset: 'strict' },
    verification: { level: 'strict_e2e' },
    deliverables: { routing: 'both' },
    language: { response: 'auto' },
    engines: {
      researcher: 'council',
      planner: 'council',
      coder: 'auto',
      debugger: 'cross_family',
      reviewer: 'council',
      councilMembers: 'claude,codex,antigravity',
    },
  },
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Own-property checks only, so names like `__proto__`, `constructor` or `toString` never match. */
const isSettingKey = (key) => typeof key === 'string' && Object.hasOwn(ALLOWED_ENUMS, key);
const isPresetName = (name) => typeof name === 'string' && Object.hasOwn(PRESETS, name);

function getSettingByKey(settings, dottedKey) {
  if (!dottedKey) return settings;
  let cur = settings;
  for (const part of String(dottedKey).split('.')) {
    if (!isPlainObject(cur) || !Object.hasOwn(cur, part)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function setNestedValue(target, dottedKey, value) {
  const parts = dottedKey.split('.');
  let cur = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!isPlainObject(cur[parts[i]])) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

/** Reads a key from either a flat `{ 'a.b': v }` patch or a nested `{ a: { b: v } }` one. */
function readPatchValue(partial, dottedKey) {
  if (!isPlainObject(partial)) return undefined;
  if (Object.hasOwn(partial, dottedKey)) return partial[dottedKey];
  return getSettingByKey(partial, dottedKey);
}

const VALID_COUNCIL_ENGINES = new Set(['claude', 'codex', 'antigravity', 'cursor', 'copilot']);

function coerceCouncilMembers(rawVal) {
  if (typeof rawVal !== 'string') return undefined;
  const parts = [...new Set(rawVal.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))];
  return parts.length >= 2 && parts.every((p) => VALID_COUNCIL_ENGINES.has(p)) ? parts.join(',') : undefined;
}

function coerceEnumValue(dottedKey, rawVal) {
  if (!isSettingKey(dottedKey)) return undefined;
  const allowed = ALLOWED_ENUMS[dottedKey];
  const numericVal = typeof rawVal === 'string' && /^\d+$/.test(rawVal) ? Number(rawVal) : rawVal;
  if (allowed.includes(numericVal)) return numericVal;
  if (allowed.includes(rawVal)) return rawVal;
  if (dottedKey === 'engines.councilMembers') return coerceCouncilMembers(rawVal);
  return undefined;
}

function coerceLineLimit(rawVal) {
  const num = typeof rawVal === 'string' && /^\d+$/.test(rawVal) ? Number(rawVal) : rawVal;
  if (!Number.isInteger(num) || num < MIN_LINE_LIMIT || num > MAX_LINE_LIMIT) return undefined;
  return num;
}

/**
 * Coding standards: a changed profile starts from that profile's limits; an unchanged profile keeps
 * the base's (possibly hand-tuned) limits. Patch limits apply only when they are positive integers
 * and soft <= hard.
 */
function resolveCodingStandards(baseStandards, stdPreset, partial) {
  const presetDetails = CODING_STANDARDS_PRESETS[stdPreset];
  const sameProfile = isPlainObject(baseStandards) && baseStandards.preset === stdPreset;
  let soft = sameProfile ? coerceLineLimit(baseStandards.softFileLines) : undefined;
  let hard = sameProfile ? coerceLineLimit(baseStandards.hardFileLines) : undefined;
  if (soft === undefined || hard === undefined || soft > hard) {
    soft = presetDetails.softFileLines;
    hard = presetDetails.hardFileLines;
  }
  const patchSoft = coerceLineLimit(readPatchValue(partial, LINE_LIMIT_KEYS[0]));
  const patchHard = coerceLineLimit(readPatchValue(partial, LINE_LIMIT_KEYS[1]));
  const nextSoft = patchSoft ?? soft;
  const nextHard = patchHard ?? hard;
  if (nextSoft <= nextHard) {
    soft = nextSoft;
    hard = nextHard;
  }
  return { ...presetDetails, softFileLines: soft, hardFileLines: hard, preset: stdPreset };
}

function validateAndSanitizeSettings(partial = {}, base = DEFAULT_SETTINGS) {
  const merged = structuredClone(base);
  const baseStandards = isPlainObject(merged.codingStandards) ? { ...merged.codingStandards } : undefined;
  for (const key of Object.keys(ALLOWED_ENUMS)) {
    const coerced = coerceEnumValue(key, readPatchValue(partial, key));
    if (coerced !== undefined) setNestedValue(merged, key, coerced);
  }
  const stdPreset = coerceEnumValue('codingStandards.preset', merged.codingStandards?.preset) || 'pragmatic';
  merged.codingStandards = resolveCodingStandards(baseStandards, stdPreset, partial);
  merged.version = KIT_VERSION;
  return merged;
}

/** Comparable fingerprint of every user-facing value (the preset label and version excluded). */
function settingsFingerprint(settings) {
  const keys = [...Object.keys(ALLOWED_ENUMS).filter((k) => k !== 'preset'), ...LINE_LIMIT_KEYS];
  return JSON.stringify(keys.map((k) => getSettingByKey(settings, k)));
}

/**
 * The preset label always describes the actual values: a named label is kept while every value
 * still matches it, otherwise the matching named preset (if any) or `custom` is used.
 */
function resolvePresetLabel(settings) {
  const fingerprint = settingsFingerprint(settings);
  const label = settings.preset;
  if (isPresetName(label) && fingerprint === settingsFingerprint(PRESETS[label])) return settings;
  const match = Object.keys(PRESETS).find((name) => settingsFingerprint(PRESETS[name]) === fingerprint);
  return { ...settings, preset: match || CUSTOM_PRESET };
}

/** Every storable key (enum keys plus custom line limits). */
const ALL_STORABLE_KEYS = [...Object.keys(ALLOWED_ENUMS), ...LINE_LIMIT_KEYS];

/** Builds a sparse nested object holding only `keys` taken from `settings`. */
function pickKeys(settings, keys) {
  const out = {};
  for (const key of keys) {
    const value = getSettingByKey(settings, key);
    if (value !== undefined) setNestedValue(out, key, value);
  }
  return out;
}

/** Valid storable keys present in a raw (user-written) settings object. */
function presentKeys(raw) {
  return ALL_STORABLE_KEYS.filter((key) => readPatchValue(raw, key) !== undefined);
}

module.exports = {
  KIT_VERSION,
  CODING_STANDARDS_PRESETS,
  ALLOWED_ENUMS,
  ALLOWED_VALUES: ALLOWED_ENUMS,
  SETTING_DESCRIPTIONS,
  LINE_LIMIT_KEYS,
  MIN_LINE_LIMIT,
  MAX_LINE_LIMIT,
  ALL_STORABLE_KEYS,
  CUSTOM_PRESET,
  DEFAULT_SETTINGS,
  PRESETS,
  isPlainObject,
  isSettingKey,
  isPresetName,
  getSettingByKey,
  setNestedValue,
  readPatchValue,
  coerceEnumValue,
  coerceLineLimit,
  validateAndSanitizeSettings,
  resolvePresetLabel,
  pickKeys,
  presentKeys,
};
