'use strict';

/**
 * Platform-tailored < 2.5 KB Slim Guardrails rendering and full Mode-B template lookup for all 5 IDEs.
 * Preserves YAML frontmatter on `.agent.md` / `.mdc` files and never leaks Antigravity-only phrasing
 * onto Claude Code, OpenAI Codex, Cursor, or GitHub Copilot.
 */

const fs = require('node:fs');
const path = require('node:path');

const { applyReplacements } = require('./copy-engine.js');
const { SETTINGS_MARKER_START, SETTINGS_MARKER_END } = require('./markers.js');
const { DEFAULT_SETTINGS, validateAndSanitizeSettings, resolvePresetLabel } = require('./settings-schema.js');

const KIT_DIR_NAME = 'boomopen-workflow-kit';
const SLIM_PRESETS = new Set(['frontier-guardrails', 'carbon-guardrails', 'solo-fast']);
const SLIM_EDITION_PATTERN = /(?:FRONTIER-GUARDRAILS|CARBON-GUARDRAILS|SOLO-FAST SLIM) EDITION/;
const LEADING_FRONTMATTER_RE = /^(---\r?\n[\s\S]*?\r?\n---)(?:\r?\n)+/;

const PLATFORM_PROFILES = {
  antigravity: {
    editionPrefix: 'GEMINI/ANTIGRAVITY',
    actor: 'Antigravity',
    carbonActor: 'Antigravity 2.0 / Orchestrator Carbon',
    capabilities: 'daily planning, exploration, multi-file edits, `/plan`, `/boost`, `/teamwork`, `run_workflow`, and `swarm`',
    frameworkDir: `~/.gemini/config/skills/${KIT_DIR_NAME}`,
    toolSegment: 'gemini/config',
    frameworkRel: `gemini/config/skills/${KIT_DIR_NAME}`,
    artifacts: '`<appDataDir>\\brain\\<conversation-id>\\`',
  },
  claude: {
    editionPrefix: 'CLAUDE CODE',
    actor: 'Claude Code',
    capabilities: 'daily planning, codebase exploration (`Task`/`Explore`), and multi-file edits',
    frameworkDir: `~/.claude/skills/${KIT_DIR_NAME}`,
    toolSegment: 'claude',
    frameworkRel: `claude/skills/${KIT_DIR_NAME}`,
    artifacts: '`./reports/{topic}/`',
  },
  codex: {
    editionPrefix: 'OPENAI CODEX',
    actor: 'OpenAI Codex',
    capabilities: 'daily planning, exploration (`spawn_agent`), and multi-file edits',
    frameworkDir: `~/.codex/skills/${KIT_DIR_NAME}`,
    toolSegment: 'codex',
    frameworkRel: `codex/skills/${KIT_DIR_NAME}`,
    artifacts: '`./reports/{topic}/`',
  },
  cursor: {
    editionPrefix: 'CURSOR',
    actor: 'Cursor',
    capabilities: 'daily planning, codebase search, and multi-file edits',
    frameworkDir: `~/.cursor/skills/${KIT_DIR_NAME}`,
    toolSegment: 'cursor',
    frameworkRel: `cursor/skills/${KIT_DIR_NAME}`,
    artifacts: '`./reports/{topic}/`',
  },
  copilot: {
    editionPrefix: 'GITHUB COPILOT',
    actor: 'GitHub Copilot',
    capabilities: 'daily planning, exploration (`runSubagent`), and multi-file edits',
    frameworkDir: `~/.copilot/skills/${KIT_DIR_NAME}`,
    toolSegment: 'copilot',
    frameworkRel: `copilot/skills/${KIT_DIR_NAME}`,
    artifacts: '`./reports/{topic}/`',
  },
};

const isSlimGuardrailsPreset = (settings) => Boolean(settings && SLIM_PRESETS.has(settings.preset));
const isSlimRegion = (region) => SLIM_EDITION_PATTERN.test(region);

function extractLeadingFrontmatter(text) {
  const match = LEADING_FRONTMATTER_RE.exec(text);
  return match ? { frontmatter: match[1], body: text.slice(match[0].length) } : { frontmatter: '', body: text };
}

function renderActiveSettingsMarkdown(settings = DEFAULT_SETTINGS, options = {}) {
  const s = resolvePresetLabel(validateAndSanitizeSettings(settings, DEFAULT_SETTINGS));
  const cs = s.codingStandards;
  const t = s.execution.modeAThresholdFiles;
  if (isSlimGuardrailsPreset(s)) {
    const isOtherIde = Boolean(options.platform && options.platform !== 'antigravity');
    const driver = s.preset === 'carbon-guardrails' && !isOtherIde
      ? 'Carbon drives daily tasks'
      : 'Frontier model drives daily tasks';
    const nlNote = s.workflows.naturalLanguageResearchTrigger === 'off'
      ? ' (explicit `/cmd` only — zero NL hijacking)'
      : '';
    return [
      SETTINGS_MARKER_START,
      '## 🎛️ ACTIVE USER SETTINGS (`~/.boomopen/settings.json` | `/settings`)',
      `- **Active Preset**: \`${s.preset}\` | **Execution Mode (\`execution.mode\`)**: \`${s.execution.mode}\` (\`≤ ${t}\` files direct; ${driver}) | **Swarm**: \`${s.execution.swarmScaling}\` (max \`${s.execution.maxParallelSubagents}\`)`,
      `- **Workflows**: \`defaultVariant = ${s.workflows.defaultVariant}\` | \`naturalLanguageResearchTrigger = ${s.workflows.naturalLanguageResearchTrigger}\`${nlNote}`,
      `- **Standards**: \`${cs.preset}\` (Soft \`${cs.softFileLines}\` / Hard \`${cs.hardFileLines}\`L, \`forbidExplicitAny = ${cs.forbidExplicitAny}\`, \`warnConsoleLog = ${cs.warnConsoleLog}\`) | \`verification = ${s.verification.level}\` | \`deliverables = ${s.deliverables.routing}\` | \`lang = ${s.language.response}\``,
      SETTINGS_MARKER_END,
    ].join('\n');
  }
  return [
    SETTINGS_MARKER_START,
    '## 🎛️ ACTIVE USER SETTINGS OVERRIDE (Managed via `/settings` & `~/.boomopen/settings.json`)',
    '> **PRECEDENCE**: `1. Explicit Turn Command (/cmd:variant, @fast/@deep/@team)` > `2. Workspace ./.boomopen.json` > `3. Active Settings Below` > `4. Default File Rules`.',
    `- **Active Preset**: \`${s.preset}\` | **Execution Mode (\`execution.mode\`)**: \`${s.execution.mode}\` (\`auto\` = **Proactive Sub-agent First**: Spawn parallel subagents on Turn 1 (your platform's subagent tool; a read-only scout for scouting) whenever scope is unknown, requires scouting/audit/research across > ${t} files, or spans ≥ 2 domains; use Mode A Direct ONLY for known-target micro-edits ≤ ${t} files or simple Q&A; \`mode_a\` = Force Direct Solo Mode unless \`:hard\`/\`:team\`/\`/orchestrate\`; \`mode_b\` = Force Multi-Agent Orchestrator; \`team\` = Force Golden Triangle 3-Agent \`:team\`) | **Swarm Scaling (\`execution.swarmScaling\`)**: \`${s.execution.swarmScaling}\` | **Max Parallel Sub-agents (\`execution.maxParallelSubagents\`)**: \`${s.execution.maxParallelSubagents}\``,
    `- **Workflows**: \`defaultVariant = ${s.workflows.defaultVariant}\` (\`auto\`|\`fast\`|\`hard\`|\`team\`|\`ask\`) | \`naturalLanguageResearchTrigger = ${s.workflows.naturalLanguageResearchTrigger}\` (\`auto_team\` routes NL research/ideation/review to \`:team\` and NL plan/design/debug/fix/test/cook/docs to \`commands/{cmd}-{variant}.md\` across all 17 languages | \`auto_hard\` → \`:hard\` | \`ask_first\` | \`off\`)`,
    `- **Intelligence & Research**: \`models.subagentPolicy = ${s.models.subagentPolicy}\` (\`inherit\` = subagents inherit the session model; never downgrade core roles) | \`research.depth = ${s.research.depth}\` | \`clarification.style = ${s.clarification.style}\` | \`teams.maxDebateRounds = ${s.teams.maxDebateRounds}\` | **Cross-Engine Routing (\`engines.*\`)**: \`researcher=${s.engines.researcher}, planner=${s.engines.planner}, coder=${s.engines.coder}, debugger=${s.engines.debugger}, reviewer=${s.engines.reviewer}, council=[${s.engines.councilMembers}]\``,
    `- **Standards & Verification**: \`codingStandards.preset = ${cs.preset}\` (Soft \`${cs.softFileLines}\` / Hard \`${cs.hardFileLines}\` lines, \`forbidExplicitAny = ${cs.forbidExplicitAny}\`, \`warnConsoleLog = ${cs.warnConsoleLog}\`) | \`verification.level = ${s.verification.level}\``,
    `- **Deliverables & Language**: \`deliverables.routing = ${s.deliverables.routing}\` (\`brain_artifacts\` = \`<appDataDir>\\brain\\<conversation-id>\\\` on Antigravity, \`./reports/{topic}/\` elsewhere) | \`language.response = ${s.language.response}\``,
    SETTINGS_MARKER_END,
  ].join('\n');
}

function renderPlatformSlimBody(platform = 'antigravity', settings = DEFAULT_SETTINGS, options = {}) {
  const key = Object.hasOwn(PLATFORM_PROFILES, platform) ? platform : 'antigravity';
  const profile = PLATFORM_PROFILES[key];
  const s = resolvePresetLabel(validateAndSanitizeSettings(settings, DEFAULT_SETTINGS));
  const cs = s.codingStandards;
  const useCarbonLabel = key === 'antigravity' && s.preset === 'carbon-guardrails';
  const editionSuffix = useCarbonLabel
    ? 'CARBON-GUARDRAILS EDITION'
    : s.preset === 'solo-fast'
      ? 'SOLO-FAST SLIM EDITION'
      : 'FRONTIER-GUARDRAILS EDITION';
  const bannerLead = useCarbonLabel ? 'CARBON DRIVES, BOOMOPEN GUARDS' : 'FRONTIER MODEL DRIVES, BOOMOPEN GUARDS';
  const actorName = useCarbonLabel ? profile.carbonActor : profile.actor;

  return [
    `# ⚡ BoomOpen Workflow Kit v5.5 — ${profile.editionPrefix} ${editionSuffix}`,
    '',
    `> **${bannerLead}**: **${actorName}** handles ${profile.capabilities} directly. Load \`${profile.frameworkDir}/commands/{cmd}.md\` **ONLY** on explicit \`/cmd\` (\`/autopilot\`, \`/audit\`, \`/conduct\`, \`/design:hard\`, \`/cook:team\`, \`/review:team\`, \`/settings\`).`,
    '',
    renderActiveSettingsMarkdown(s, { ...options, platform: key }),
    '',
    '---',
    '',
    '## 📏 PRAGMATIC 2-TIER STANDARDS & VERIFICATION',
    '1. **Tier 1**: Single Responsibility; **NO `any`** (`unknown`/Zod/`<T>`); **NO debug `console.log`** in app code; `try/catch` + typed errors at async/API boundaries; `SCREAMING_SNAKE_CASE` constants; DRY (`≥ 3`) & sorted imports.',
    `2. **Tier 2 (\`${cs.softFileLines}\`/\`${cs.hardFileLines}\`L)**: Cohesive files \`~200–350\`L (split \`> ${cs.hardFileLines}\`L or multi-domain; tests/types/docs exempt); functions \`≤ 40\`L (logic) / \`≤ 80\`L (UI); nesting \`≤ 4\`; params \`≤ 5\`.`,
    '3. **E2E & Silence Guard**: Verify build/typecheck/tests to `0` errors. After background/subagent launch, reply in ≤ 2–3 sentences with `0` tool calls.',
    '',
    '## 🛠️ OPT-IN CLI GATES & VAULT',
    `- **CLI (\`${profile.frameworkDir}/cli/install.js\`)**: \`check . --strict-phase --no-stubs\` | \`reconcile\` | \`audit\` | \`ledger\` | \`conduct\` | \`design\` | \`plan\` | \`research\` | \`cook\` | \`settings\` | \`doctor\`.`,
    `- **Vault**: \`1,440\` skills in \`matrix-skills/compact-index.json\`; deliverables → ${profile.artifacts}; reply in user's language, code in English.`,
  ].join('\n');
}

function renderAntigravitySlimBody(settings) {
  return renderPlatformSlimBody('antigravity', settings, { platform: 'antigravity' });
}

function replacementsForPlatform(platform) {
  const profile = PLATFORM_PROFILES[platform] || PLATFORM_PROFILES.antigravity;
  return {
    '~/.{TOOL}/skills/boomopen-workflow-kit/': `~/.${profile.frameworkRel}/`,
    '{TOOL}/boomopen-workflow-kit/': `${profile.toolSegment}/skills/${KIT_DIR_NAME}/`,
    '{TOOL}': profile.toolSegment,
    '{HOME}': '~',
    '~/.agent/': `~/.${profile.frameworkRel}/`,
  };
}

function repoTemplateRelPath(platform, filePath) {
  const base = path.basename(filePath);
  if (base === 'AGENT.md') return ['AGENT.md'];
  if (base === 'AntigravityGlobal.agent.md') return ['platforms', 'antigravity', 'AntigravityGlobal.agent.md'];
  if (base === 'boomopen-workflow-kit.mdc') return ['platforms', 'cursor', 'rules', 'boomopen-workflow-kit.mdc'];
  if (base === 'boomopen-workflow-kit.agent.md') return ['platforms', 'copilot', 'boomopen-workflow-kit.agent.md'];
  if (base === 'GEMINI.md' || (platform === 'antigravity' && base === 'AGENTS.md')) return ['platforms', 'antigravity', 'GEMINI.md'];
  if (base === 'CODEX.md' || base === 'AGENTS.md') return ['platforms', 'codex', 'CODEX.md'];
  if (base === 'CURSOR.md' || base === '.cursorrules') return ['platforms', 'cursor', '.cursorrules'];
  if (base === 'COPILOT.md' || base === 'copilot-instructions.md') return ['COPILOT.md'];
  if (base === 'CLAUDE.md') return ['platforms', 'claude', 'CLAUDE.md'];
  return platform === 'antigravity' ? ['platforms', 'antigravity', 'GEMINI.md'] : ['AGENT.md'];
}

function cacheTemplatePath(homeDir, platform, filePath) {
  const rel = path.relative(homeDir, filePath);
  const safeName = (!rel.startsWith('..') && !path.isAbsolute(rel) ? rel : path.basename(filePath)).replace(/[\\/]+/g, '__');
  return path.join(homeDir, '.boomopen', 'templates', platform, safeName);
}

function cacheFullTemplateIfManifested(homeDir, platform, filePath, fullBody) {
  const manifestFile = path.join(homeDir, '.boomopen', 'manifests', `${platform}.json`);
  if (!fs.existsSync(manifestFile)) return;
  try {
    const dest = cacheTemplatePath(homeDir, platform, filePath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, fullBody, 'utf8');
  } catch {
    // non-fatal cache write
  }
}

function loadPlatformFullTemplate(platform, filePath, homeDir) {
  const repoRoot = path.join(__dirname, '..');
  const relParts = repoTemplateRelPath(platform, filePath);
  const candidates = [
    cacheTemplatePath(homeDir, platform, filePath),
    path.join(repoRoot, ...relParts),
    ...(path.basename(filePath) === 'GEMINI.md'
      ? [path.join(repoRoot, 'GEMINI.md'), path.join(homeDir, '.gemini', 'config', 'skills', KIT_DIR_NAME, 'GEMINI.md')]
      : []),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return applyReplacements(fs.readFileSync(candidate, 'utf8'), replacementsForPlatform(platform));
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

module.exports = {
  KIT_DIR_NAME,
  isSlimGuardrailsPreset,
  isSlimRegion,
  extractLeadingFrontmatter,
  renderActiveSettingsMarkdown,
  renderPlatformSlimBody,
  renderAntigravitySlimBody,
  cacheFullTemplateIfManifested,
  loadPlatformFullTemplate,
};
