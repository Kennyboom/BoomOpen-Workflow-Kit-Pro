'use strict';

/**
 * Deterministic Design Spec Parser, 4-Gate Validator & DESIGN_CONTRACT Compiler (`boomopen design`).
 * Enforces DESIGN-G1..G4 (OKLCH/token completeness, anti-slop guardrails, 5-state UI matrix,
 * WCAG 2.2 AA & responsive ergonomics, single-file budget <= 500 lines, and extractable DESIGN_CONTRACT).
 */

const fs = require('node:fs');
const path = require('node:path');

const { countLines } = require('./checker-text.js');

const EXIT_OK = 0;
const EXIT_FAIL = 1;
const EXIT_USAGE = 2;
const SOFT_DESIGN_LINES = 400;
const HARD_DESIGN_LINES = 500;

const NEGATION_LINE_RE = /\b(?:never|ban|banned|forbid|forbidden|avoid|do\s+not|don't|no\s+default|anti[- ]?slop|anti_patterns|instead\s+of|not\s+use|reject)\b|❌/i;
const BANNED_FONT_RE = /\b(?:Inter|Roboto|Arial)\b/i;
const DISTINCT_DISPLAY_FONT_RE = /\b(?:Instrument\s+Serif|Playfair\s+Display|Fraunces|Plus\s+Jakarta\s+Sans|Space\s+Grotesk|Clash\s+Display|Cabinet\s+Grotesk|Syne|Satoshi|Newsreader|Cormorant|Bricolage\s+Grotesque|Geist|Outfit|Manrope|DM\s+Serif|Lora)\b/i;
const MONO_FONT_RE = /\b(?:JetBrains\s+Mono|Fira\s+Code|Geist\s+Mono|IBM\s+Plex\s+Mono|Source\s+Code\s+Pro|Space\s+Mono|Commit\s+Mono|Monaspace)\b/i;
const FONT_ASSIGN_RE = /(?:^\s*(?:[-*]\s+)?(?:\*\*)?(?:sans|display|primary|heading|body|font(?:[-_ ]?family)?|--font-(?:sans|display))\b|font-family\s*:)/i;

const STATE_PATTERNS = [
  { key: 'Default', re: /\b(?:default|idle|normal|resting|initial)\b/i },
  { key: 'Loading', re: /\b(?:loading|skeleton|shimmer|pending|spinner)\b/i },
  { key: 'Empty', re: /\b(?:empty|zero[- ]data|no[- ]data|no[- ]results|blank[- ]slate)\b/i },
  { key: 'Error', re: /\b(?:error|failed|failure|invalid|destructive)\b/i },
  { key: 'Disabled/Focus', re: /\b(?:disabled|focus|focus-visible|focused|readonly)\b/i },
];

const BREAKPOINT_TOKENS = ['375px', '768px', '1024px', '1280px', '1440px'];
const KNOWN_YAML_KEYS = new Set([
  'colors', 'surface_elevation', 'typography', 'spacing', 'motion',
  'radius', 'rounded', 'components', 'anti_patterns', 'aesthetic_direction', 'layout',
]);

function parseScalarOrInlineArray(rawVal) {
  const trimmed = String(rawVal || '').trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function parseYamlTokens(yamlText) {
  const tokens = {};
  if (!yamlText || typeof yamlText !== 'string') return tokens;
  let currentTop = null;
  let currentSub = null;

  for (const rawLine of yamlText.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const topMatch = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(rawLine);
    if (topMatch) {
      const rawKey = topMatch[1].toLowerCase();
      currentTop = rawKey === 'rounded' ? 'radius' : rawKey;
      currentSub = null;
      const val = topMatch[2].trim();
      tokens[currentTop] = val && val !== '|' && val !== '>' ? parseScalarOrInlineArray(val) : (tokens[currentTop] || {});
      continue;
    }
    if (!currentTop) continue;
    const listMatch = /^\s+-\s+(.+)$/.exec(rawLine);
    if (listMatch) {
      const itemVal = parseScalarOrInlineArray(listMatch[1]);
      if (currentSub && tokens[currentTop] && typeof tokens[currentTop] === 'object' && !Array.isArray(tokens[currentTop])) {
        if (!Array.isArray(tokens[currentTop][currentSub])) tokens[currentTop][currentSub] = [];
        tokens[currentTop][currentSub].push(itemVal);
      } else {
        if (!Array.isArray(tokens[currentTop])) tokens[currentTop] = [];
        tokens[currentTop].push(itemVal);
      }
      continue;
    }
    const nestedMatch = /^(\s+)([a-zA-Z0-9_][\w-]*)\s*:\s*(.*)$/.exec(rawLine);
    if (nestedMatch && typeof tokens[currentTop] === 'object' && !Array.isArray(tokens[currentTop])) {
      const indent = nestedMatch[1].length;
      const nKey = nestedMatch[2];
      const nVal = nestedMatch[3].trim();
      if (indent <= 2) {
        currentSub = nKey;
        tokens[currentTop][nKey] = nVal ? parseScalarOrInlineArray(nVal) : {};
      } else if (currentSub) {
        if (typeof tokens[currentTop][currentSub] !== 'object' || Array.isArray(tokens[currentTop][currentSub])) {
          tokens[currentTop][currentSub] = {};
        }
        tokens[currentTop][currentSub][nKey] = parseScalarOrInlineArray(nVal);
      }
    }
  }
  return tokens;
}

function extractFrontmatterAndFences(markdown) {
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  let yamlBlock = fmMatch ? fmMatch[1] : '';
  const cssBlocks = [];
  const tsBlocks = [];
  const yamlFences = [];
  const fenceRe = /```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g;
  let m = fenceRe.exec(markdown);
  while (m) {
    const lang = (m[1] || '').toLowerCase();
    const body = m[2].trim();
    if (lang === 'css' || lang === 'scss' || lang === 'postcss' || /@theme\b|--(?:color|surface|font|radius)-/.test(body)) {
      cssBlocks.push(body);
    } else if (lang === 'ts' || lang === 'tsx' || lang === 'typescript' || /\b(?:export\s+)?(?:interface|type)\s+[A-Z]\w*/.test(body)) {
      tsBlocks.push(body);
    } else if ((lang === 'yaml' || lang === 'yml') && [...KNOWN_YAML_KEYS].some((k) => new RegExp(`^${k}\\s*:`, 'm').test(body))) {
      yamlFences.push(body);
    }
    m = fenceRe.exec(markdown);
  }
  if (!yamlBlock && yamlFences.length > 0) yamlBlock = yamlFences.join('\n');
  return { yamlBlock, cssBlocks, tsBlocks };
}

function detectAntiSlopViolations(markdown, yamlTokens) {
  let inAntiPatterns = false;
  let hasBannedPrimaryFont = false;
  let hasPurple = false;
  let hasCyan = false;

  for (const line of String(markdown || '').split(/\r?\n/)) {
    if (/^\s*anti_patterns\s*:|^#{1,4}\s+.*(?:anti[- ]?slop|anti[- ]?patterns|banned|forbidden)/i.test(line)) {
      inAntiPatterns = true;
      continue;
    }
    if (inAntiPatterns && (/^[a-zA-Z_][\w-]*\s*:/.test(line) || /^#{1,4}\s+/.test(line))) inAntiPatterns = false;
    if (inAntiPatterns || NEGATION_LINE_RE.test(line)) continue;
    if (FONT_ASSIGN_RE.test(line) && BANNED_FONT_RE.test(line)) hasBannedPrimaryFont = true;
    if (/#8B5CF6\b/i.test(line)) hasPurple = true;
    if (/#06B6D4\b/i.test(line)) hasCyan = true;
  }

  if (BANNED_FONT_RE.test(JSON.stringify(yamlTokens.typography || ''))) hasBannedPrimaryFont = true;
  const hasDistinctPairing = DISTINCT_DISPLAY_FONT_RE.test(markdown) && MONO_FONT_RE.test(markdown);
  return {
    bannedFontViolation: hasBannedPrimaryFont && !hasDistinctPairing,
    bannedGradientViolation: hasPurple && hasCyan,
  };
}

function parseDesignMarkdown(markdown) {
  const raw = String(markdown || '');
  const lineCount = raw ? countLines(raw) : 0;
  const { yamlBlock, cssBlocks, tsBlocks } = extractFrontmatterAndFences(raw);
  const yamlTokens = parseYamlTokens(yamlBlock);
  const headings = raw.split(/\r?\n/).map((l, idx) => {
    const hm = /^(#{1,4})\s+(.+)$/.exec(l);
    return hm ? { level: hm[1].length, text: hm[2].trim(), line: idx + 1 } : null;
  }).filter(Boolean);

  const states = {};
  const coveredStates = [];
  const missingStates = [];
  for (const s of STATE_PATTERNS) {
    states[s.key] = s.re.test(raw);
    if (states[s.key]) coveredStates.push(s.key);
    else missingStates.push(s.key);
  }

  const hasOklch = /oklch\s*\(/i.test(raw);
  const hasYamlTokenTriad = Boolean(yamlTokens.colors && yamlTokens.typography && (yamlTokens.surface_elevation || yamlTokens.spacing));
  const hasThemeBlock = /@theme\b|--(?:color|surface|font|radius)-[a-z0-9-]+/i.test(raw) || cssBlocks.length > 0;
  const hasTsProps = /\b(?:export\s+)?(?:interface|type)\s+[A-Z]\w*/.test(raw) || tsBlocks.length > 0;
  const hasYamlComponents = Boolean(yamlTokens.components && Object.keys(yamlTokens.components).length > 0);
  const wcag = {
    hasContrast: /\b(?:4\.5\s*:\s*1|3(?:\.0)?\s*:\s*1|7(?:\.0)?\s*:\s*1)\b/i.test(raw),
    hasHitTarget: /\b(?:(?:24\s*[x×]\s*24|44\s*[x×]\s*44|48\s*[x×]\s*48)(?:\s*(?:px|pt|dp))?|24\s*px|44\s*(?:px|pt)|48\s*(?:px|dp))\b/i.test(raw),
    hasReducedMotion: /prefers-reduced-motion/i.test(raw),
    hasBreakpoints: /\b(?:320|360|375|390|414)px\b/i.test(raw) && /\b(?:768|1024|1280|1440|1536)px\b/i.test(raw),
    breakpoints: BREAKPOINT_TOKENS.filter((bp) => raw.toLowerCase().includes(bp)),
  };

  return {
    lineCount, yamlTokens, headings, cssBlocks, tsBlocks,
    states, coveredStates, missingStates, stateCount: coveredStates.length, wcag,
    hasOklch, hasYamlTokenTriad, hasThemeBlock, hasTsProps, hasYamlComponents,
    hasTsContract: hasTsProps || hasYamlComponents,
    ...detectAntiSlopViolations(raw, yamlTokens),
  };
}

function resolveDesignInput(markdownOrParsed) {
  if (markdownOrParsed && typeof markdownOrParsed === 'object' && typeof markdownOrParsed.lineCount === 'number') {
    return markdownOrParsed;
  }
  const str = String(markdownOrParsed || '');
  const raw = str && !str.includes('\n') && fs.existsSync(str) ? fs.readFileSync(str, 'utf8') : str;
  return parseDesignMarkdown(raw);
}

function validateDesign(markdownOrParsed) {
  const parsed = resolveDesignInput(markdownOrParsed);
  const g1 = [];
  const g2 = [];
  const g3 = [];
  const g4 = [];
  const warnings = [];

  if (!parsed.hasOklch && !parsed.hasYamlTokenTriad) {
    g1.push('[DESIGN-G1] Missing perceptual color/token architecture: define oklch(...) tokens or YAML colors + typography + surface_elevation/spacing.');
  }
  if (parsed.bannedFontViolation) g1.push('[DESIGN-G1] Banned AI-slop primary font (Inter/Roboto/Arial without distinct display + mono pairing) detected.');
  if (parsed.bannedGradientViolation) g1.push('[DESIGN-G1] Banned AI-slop neon purple-cyan gradient (#8B5CF6 + #06B6D4) detected.');
  if (parsed.stateCount < STATE_PATTERNS.length) {
    g2.push(`[DESIGN-G2] Component state matrix incomplete (${parsed.stateCount}/5 required states); missing: ${parsed.missingStates.join(', ')}.`);
  }
  if (!parsed.wcag.hasContrast) g3.push('[DESIGN-G3] Missing explicit WCAG 2.2 AA contrast ratio requirement (4.5:1 or 3:1).');
  if (!parsed.wcag.hasHitTarget) g3.push('[DESIGN-G3] Missing minimum pointer/touch hit target specification (24x24px or 44x44pt).');
  if (!parsed.wcag.hasReducedMotion) g3.push('[DESIGN-G3] Missing motion safety guardrail (prefers-reduced-motion).');
  if (!parsed.wcag.hasBreakpoints) g3.push('[DESIGN-G3] Missing responsive breakpoint coverage (require 375px mobile + 768px/1024px/1440px desktop).');

  if (parsed.lineCount === 0) g4.push('[DESIGN-G4] Design specification is empty.');
  else if (parsed.lineCount > HARD_DESIGN_LINES) g4.push(`[DESIGN-G4] Design spec is ${parsed.lineCount} lines (exceeds cohesive single-file limit of ${HARD_DESIGN_LINES} lines).`);
  else if (parsed.lineCount > SOFT_DESIGN_LINES) warnings.push(`[DESIGN-G4] Design spec is ${parsed.lineCount} lines (exceeds soft target of ${SOFT_DESIGN_LINES} lines).`);
  if (!parsed.hasThemeBlock || !parsed.hasTsContract) {
    g4.push('[DESIGN-G4] Missing extractable DESIGN_CONTRACT: require @theme / --color-* CSS tokens AND TypeScript interface/type props (or YAML components: schema).');
  }

  const errors = [...g1, ...g2, ...g3, ...g4];
  return {
    valid: errors.length === 0, errors, warnings,
    gates: { G1: g1.length === 0, G2: g2.length === 0, G3: g3.length === 0, G4: g4.length === 0 },
    stats: {
      lineCount: parsed.lineCount, stateCount: parsed.stateCount,
      hasOklch: parsed.hasOklch, hasThemeBlock: parsed.hasThemeBlock, hasTsContract: parsed.hasTsContract,
    },
  };
}

function synthesizeCssFromYaml(yamlTokens) {
  const lines = ['@theme inline {'];
  const groups = [
    ['color', yamlTokens.colors],
    ['surface', yamlTokens.surface_elevation],
    ['font', yamlTokens.typography],
  ];
  for (const [prefix, obj] of groups) {
    if (!obj || typeof obj !== 'object') continue;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && !k.includes('scale')) lines.push(`  --${prefix}-${k.replace(/_/g, '-')}: ${v};`);
    }
  }
  lines.push('}');
  return lines.join('\n');
}

function synthesizeTsFromYaml(yamlTokens) {
  const lines = ["export type UiInteractiveState = 'default' | 'loading' | 'empty' | 'error' | 'disabled';"];
  const comps = yamlTokens.components && typeof yamlTokens.components === 'object' ? yamlTokens.components : {};
  for (const [name, spec] of Object.entries(comps)) {
    const pascal = name.replace(/(?:^|[_-])([a-z])/gi, (_, c) => c.toUpperCase());
    const variants = Array.isArray(spec?.variants) ? spec.variants.map((v) => `'${v}'`).join(' | ') : 'string';
    lines.push(`export interface ${pascal}Props {\n  variant?: ${variants};\n  state?: UiInteractiveState;\n}`);
  }
  return lines.join('\n\n');
}

function extractDesignContract(markdownOrPath) {
  const parsed = resolveDesignInput(markdownOrPath);
  const cssTheme = parsed.cssBlocks.length > 0 ? parsed.cssBlocks.join('\n\n') : synthesizeCssFromYaml(parsed.yamlTokens);
  const typescriptProps = parsed.tsBlocks.length > 0 ? parsed.tsBlocks.join('\n\n') : synthesizeTsFromYaml(parsed.yamlTokens);
  const markdownBlock = [
    '## 🤝 Design-to-Code Contract (`DESIGN_CONTRACT`)', '',
    '```css', cssTheme, '```', '',
    '```ts', typescriptProps, '```',
  ].join('\n');
  return { cssTheme, typescriptProps, yamlTokens: parsed.yamlTokens, markdownBlock };
}

const DESIGN_HELP = `Usage: boomopen design <validate|contract|help> <design.md> [options]
  validate <design.md> [--json]              Validate DESIGN.md against 4 Deterministic Gates (DESIGN-G1..G4)
  contract <design.md> [--out <file>] [--json] Extract DESIGN_CONTRACT (CSS @theme + TypeScript Props) for SHARED_CONTRACT`;

function runDesignCli(args = [], options = {}) {
  const flags = { json: false, help: false, out: null };
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') flags.help = true;
    else if (a === '--json') flags.json = true;
    else if (a === '--out' || a === '--output') flags.out = args[++i];
    else positional.push(a);
  }
  const sub = (positional[0] || 'help').toLowerCase();
  if (flags.help || sub === 'help') {
    if (!options.silent) console.log(DESIGN_HELP);
    return EXIT_OK;
  }
  const cwd = options.cwd || process.cwd();
  const targetFile = positional[1];
  if (!targetFile) {
    if (!options.silent) console.error(`❌ boomopen design ${sub} requires a <design.md> path.\n\n${DESIGN_HELP}`);
    process.exitCode = EXIT_USAGE;
    return EXIT_USAGE;
  }
  try {
    const absPath = path.resolve(cwd, targetFile);
    if (!fs.existsSync(absPath)) throw new Error(`Design file not found: ${targetFile}`);
    const raw = fs.readFileSync(absPath, 'utf8');
    if (sub === 'validate') {
      const res = validateDesign(raw);
      if (!res.valid) process.exitCode = EXIT_FAIL;
      if (!options.silent) {
        if (flags.json) console.log(JSON.stringify(res, null, 2));
        else if (res.valid) console.log(`✅ Design valid (${res.stats.lineCount} lines, ${res.stats.stateCount}/5 states, DESIGN-G1..G4 passed)`);
        else for (const err of res.errors) console.error(`❌ ${err}`);
      }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    if (sub === 'contract') {
      const contract = extractDesignContract(raw);
      if (flags.out) {
        const outAbs = path.resolve(cwd, flags.out);
        fs.mkdirSync(path.dirname(outAbs), { recursive: true });
        fs.writeFileSync(outAbs, `${contract.markdownBlock}\n`, 'utf8');
      }
      if (!options.silent) console.log(flags.json ? JSON.stringify(contract, null, 2) : contract.markdownBlock);
      return EXIT_OK;
    }
    if (!options.silent) console.error(`❌ Unknown design subcommand "${sub}"\n\n${DESIGN_HELP}`);
    process.exitCode = EXIT_USAGE;
    return EXIT_USAGE;
  } catch (err) {
    if (!options.silent) console.error(`❌ boomopen design: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = EXIT_FAIL;
    return EXIT_FAIL;
  }
}

module.exports = { parseDesignMarkdown, validateDesign, extractDesignContract, runDesignCli };
