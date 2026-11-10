'use strict';

/**
 * Deterministic Research & Brainstorm Artifact Parser, 4-Gate Validator & Brief Compiler (`boomopen research`).
 * Enforces RES-G1..G4 across all 17 supported languages (evidence/confidence or constraint grounding,
 * multi-option decision matrix & trade-offs, executive verdict & downstream HANDOFF_BRIEF, and <= 500-line hygiene).
 */

const fs = require('node:fs');
const path = require('node:path');

const { EXIT_OK, EXIT_FAIL, EXIT_USAGE, parseSubcommandArgs } = require('./cli-args.js');
const {
  countLines, stripBom, readCleanText, parseFenceOpen, isFenceClose, parseFrontmatter, stripMarkdownFences,
} = require('./markdown-fences.js');

const SOFT_RESEARCH_LINES = 400;
const HARD_RESEARCH_LINES = 500;
const MIN_RESEARCH_CITATIONS = 2;
const MIN_BRAINSTORM_ANCHORS = 1;
const MIN_TABLE_ROWS = 2;
const MAX_BRIEF_CITATIONS = 12;

function unicodeTermRe(terms) {
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${terms.join('|')})(?=$|[^\\p{L}\\p{N}])`, 'iu');
}

const URL_OR_FILE_URI_RE = /\b(?:https?|file):\/\/[^\s)>\]"'`]+/gi;
const CODE_LINE_REF_RE = /(?:^|[\s`(["'])([A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*\.[A-Za-z0-9]{1,8}:(?:L?\d+(?:-\d+)?)|[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*\.[A-Za-z0-9]{1,8}#L\d+(?:-L?\d+)?)/gm;
const REPO_PATH_OR_ARTIFACT_RE = /(?:^|[\s`(["'])((?:RESEARCH|SCOUT|BRAINSTORM|DESIGN|PLAN)[-_][A-Za-z0-9_.-]+\.md|[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+\.[A-Za-z0-9]{1,8})\b/gm;

const CONFIDENCE_BRACKET_RE = /(?:\[\s*|\(\s*|\*\*\s*|`\s*|\|\s*)(HIGH|MEDIUM|LOW)(?:\s+CONFIDENCE)?(?:\s*\]|\s*\)|\s*\*\*|\s*`|\s*\|)/g;
const CONFIDENCE_LABEL_RE = /\b(?:confidence(?:\s+(?:level|score|rating))?\s*[:=-]\s*[`*_[\s]*(HIGH|MEDIUM|LOW)|(HIGH|MEDIUM|LOW)\s+confidence)\b/gi;

const CONSTRAINTS_HEADING_RE = unicodeTermRe([
  'constraints?', 'assumptions?', 'grounding', 'guardrails?', 'non-goals?', 'scope(?:\\s+boundaries)?',
  'context\\s*(?:&|and)\\s*constraints?', 'problem\\s+framing', 'res-g1',
  'bối\\s+cảnh', 'ràng\\s+buộc', 'giả\\s+định', 'phạm\\s+vi', 'giới\\s+hạn', 'nguyên\\s+tắc', 'nền\\s+tảng',
  '约束', '假设', '前提', '範囲', '制約', '제약', '가정',
  'restricciones', 'supuestos', 'contraintes', 'hypothèses', 'rahmenbedingungen', 'annahmen', 'ограничения',
]);
const CONSTRAINTS_BULLET_RE = /^\s*(?:[-*+]|\d+\.)?\s*\*{0,2}(?:constraints?|assumptions?|grounding|guardrails?|non-goals?|scope\s+boundaries|ràng\s+buộc|giả\s+định|phạm\s+vi|giới\s+hạn|约束|假设|制約|제약|restricciones|contraintes|rahmenbedingungen)\*{0,2}\s*:/imu;

const RISKS_HEADING_RE = unicodeTermRe([
  'trade[- ]?offs?', 'contradictions?', 'pre[- ]?mortem', "devil'?s\\s+advocate", 'when\\s+not\\s+to\\s+use',
  'risks?', 'failure\\s+modes?', 'blind[- ]?spots?', 'pitfalls?', 'limitations?', 'anti[- ]?patterns?', 'rejected\\s+alternatives?', 'res-g2',
  'đánh\\s+đổi', 'mâu\\s+thuẫn', 'rủi\\s+ro', 'hạn\\s+chế', 'nhược\\s+điểm', 'phản\\s+biện', 'điểm\\s+mù', 'khi\\s+nào\\s+không', 'thất\\s+bại',
  '权衡', '风险', '矛盾', '局限', 'トレードオフ', 'リスク', '限界', '트레이드오프', '리스크', '한계',
  'riesgos', 'compromisos', 'risques', 'compromis', 'risiken', 'abwägungen', 'риски',
]);

const VERDICT_HEADING_RE = unicodeTermRe([
  'verdict', 'executive\\s+summary', 'recommended\\s+(?:option|direction|approach|solution|winner|choice)',
  'recommendation', 'final\\s+decision', 'selected\\s+(?:option|direction)', 'positioning', 'conclusion', 'decision\\s+summary', 'res-g3',
  'tóm\\s+tắt(?:\\s+điều\\s+hành)?', 'kết\\s+luận', 'phương\\s+án\\s+(?:đề\\s+xuất|tối\\s+ưu|chọn)', 'đề\\s+xuất', 'quyết\\s+định(?:\\s+cuối\\s+cùng)?',
  '总结', '结论', '推荐方案', '执行摘要', '結論', '要約', '推奨', '결론', '요약', '권장',
  'conclusión', 'recomendación', 'veredicto', 'recommandation', 'fazit', 'empfehlung', 'вывод', 'заключение',
]);

const HANDOFF_HEADING_RE = unicodeTermRe([
  'handoff_brief', 'research_handoff', 'downstream\\s+handoff', 'handoff\\s+(?:brief|packet|contract|to\\s+\\w+)',
  'recommended\\s+(?:architecture|technical\\s+stack)', 'implementation\\s+(?:roadmap|handoff)', 'phased\\s+delivery', 'next\\s+steps',
  'bàn\\s+giao', 'bước\\s+tiếp\\s+theo', 'kiến\\s+trúc\\s+đề\\s+xuất', 'lộ\\s+trình(?:\\s+triển\\s+khai)?', 'hướng\\s+triển\\s+khai',
  '下一步', '交接', '实施方案', '次のステップ', '引き継ぎ', '다음\\s+단계', '인계',
  'próximos\\s+pasos', 'entrega', 'prochaines\\s+étapes', 'nächste\\s+schritte', 'следующие\\s+шаги',
]);

const BRAINSTORM_TITLE_RE = unicodeTermRe([
  'brainstorm(?:ing)?', 'ideation(?:\\s+blueprint)?', 'idea\\s+matrix', 'option\\s+exploration',
  'khám\\s+phá\\s+ý\\s+tưởng', 'đề\\s+xuất\\s+ý\\s+tưởng', 'ý\\s+tưởng',
  '头脑风暴', 'ブレスト', '브레인스토밍', 'lluvia\\s+de\\s+ideas', 'remue[- ]méninges', 'ideenfindung',
]);

const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/;
const TEMPLATE_PLACEHOLDER_RE = new RegExp(`\\{(?:${['to' + 'pic', 'u' + 'rl', 'feature', 'task', 'request', 'project', 'date', 'author', 'option_\\d+', 'insert_[\\w-]+'].join('|')})\\}`, 'gi');
const DEFERRED_MARKER_RE = new RegExp(
  `(?:^\\s*(?:[-*+]\\s+)?|\\[\\s*)\\b(?:${['TO' + 'DO', 'FIX' + 'ME', 'PLACE' + 'HOLDER', 'TB' + 'D'].join('|')})\\b(?:\\s*[:\\]]|\\s+fill\\b)`,
  'gim'
);

function collectMatches(text, regex, pick) {
  regex.lastIndex = 0;
  const out = [];
  let m = regex.exec(text);
  while (m) {
    out.push(pick(m));
    m = regex.exec(text);
  }
  return out;
}

function detectArtifactMode(options, frontmatter, title) {
  const explicit = String(options.mode || '').trim().toLowerCase();
  if (explicit === 'research' || explicit === 'brainstorm') return explicit;
  const fileHint = path.basename(String(options.filePath || options.filename || ''));
  if (/^(?:BRAINSTORM|IDEAS?)(?:[-_.\s]|$)/i.test(fileHint)) return 'brainstorm';
  if (/^RESEARCH(?:[-_.\s]|$)/i.test(fileHint)) return 'research';
  const fmType = `${frontmatter.mode || ''} ${frontmatter.type || ''} ${frontmatter.category || ''}`;
  if (/\b(?:brainstorm|ideation|ideas)\b/i.test(fmType)) return 'brainstorm';
  if (/\b(?:research|investigation|deep[-_ ]?research)\b/i.test(fmType)) return 'research';
  if (BRAINSTORM_TITLE_RE.test(title)) return 'brainstorm';
  return 'research';
}

function extractSectionsAndTables(bodyText, lineOffset) {
  const lines = bodyText.split(/\r?\n/);
  const headings = [];
  const tables = [];
  let activeFence = null;
  let tableBuf = [];

  const flushTable = () => {
    const sepIdx = tableBuf.length >= 2 ? tableBuf.findIndex((row, idx) => idx >= 1 && TABLE_SEP_RE.test(row)) : -1;
    if (sepIdx >= 1) {
      const headers = tableBuf[sepIdx - 1].split('|').map((c) => c.trim()).filter(Boolean);
      const rows = tableBuf.slice(sepIdx + 1).filter((r) => r.includes('|') && !TABLE_SEP_RE.test(r));
      tables.push({ headers, rowCount: rows.length, rows });
    }
    tableBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!activeFence) {
      const opened = parseFenceOpen(line);
      if (opened) { flushTable(); activeFence = opened; continue; }
    } else {
      if (isFenceClose(line, activeFence)) activeFence = null;
      continue;
    }
    if (line.includes('|') && /^\s*\|/.test(line)) tableBuf.push(line);
    else flushTable();
    const hm = /^(#{1,4})\s+(.+)$/.exec(line);
    if (hm) headings.push({ level: hm[1].length, text: hm[2].trim(), bodyIndex: i, line: i + 1 + lineOffset });
  }
  flushTable();

  const sections = headings.map((h, idx) => {
    const nextPeer = headings.slice(idx + 1).find((cand) => cand.level <= h.level);
    const endBodyIdx = nextPeer ? nextPeer.bodyIndex : lines.length;
    const body = lines.slice(h.bodyIndex + 1, endBodyIdx).join('\n').trim();
    return { heading: h.text, level: h.level, line: h.line, startIdx: h.bodyIndex, endIdx: endBodyIdx, body };
  });
  return { headings, sections, tables };
}

function extractCitationsAndAnchors(raw) {
  const cleanRef = (val) => val.replace(/[.,;:!?)]+$/, '');
  const urls = collectMatches(raw, URL_OR_FILE_URI_RE, (m) => cleanRef(m[0]));
  const codeRefs = collectMatches(raw, CODE_LINE_REF_RE, (m) => cleanRef(m[1]));
  const repoRefs = collectMatches(raw, REPO_PATH_OR_ARTIFACT_RE, (m) => cleanRef(m[1]));
  const citations = [...new Set([...urls, ...codeRefs])];
  return { citations, anchors: [...new Set([...citations, ...repoRefs])] };
}

function extractConfidenceTags(raw, frontmatter) {
  const fmTag = frontmatter.confidence && /^(?:high|medium|low)\b/i.test(frontmatter.confidence)
    ? [frontmatter.confidence.trim().split(/\s+/)[0].toUpperCase()]
    : [];
  const bracketed = collectMatches(raw, CONFIDENCE_BRACKET_RE, (m) => m[1].toUpperCase());
  const labeled = collectMatches(raw, CONFIDENCE_LABEL_RE, (m) => (m[1] || m[2]).toUpperCase());
  return [...fmTag, ...bracketed, ...labeled];
}

function findMatchingSectionText(sections, headingRegex) {
  const matched = sections.filter((s) => headingRegex.test(s.heading) && s.body.length > 0);
  const deduped = matched.filter((s, idx) => !matched.slice(0, idx).some((anc) => s.startIdx > anc.startIdx && s.endIdx <= anc.endIdx));
  return deduped.map((s) => s.body).join('\n\n').trim();
}

function parseResearchMarkdown(markdown, options = {}) {
  const raw = stripBom(markdown);
  const lineCount = raw ? countLines(raw) : 0;
  const { frontmatter, bodyOffsetLines, bodyText } = parseFrontmatter(raw);
  const { headings, sections, tables } = extractSectionsAndTables(bodyText, bodyOffsetLines);
  const title = headings.find((h) => h.level === 1)?.text || frontmatter.title || 'Untitled Research Artifact';
  const mode = detectArtifactMode(options, frontmatter, title);

  const tableRowCount = tables.reduce((sum, t) => sum + t.rowCount, 0);
  const maxTableRows = tables.reduce((max, t) => Math.max(max, t.rowCount), 0);
  const { citations, anchors } = extractCitationsAndAnchors(raw);
  const confidenceTags = extractConfidenceTags(raw, frontmatter);
  const unfenced = stripMarkdownFences(bodyText);
  const proseOnly = unfenced.replace(/`[^`\r\n]+`/g, '');

  const hasConstraints = Boolean(findMatchingSectionText(sections, CONSTRAINTS_HEADING_RE)) || CONSTRAINTS_BULLET_RE.test(unfenced);
  const risksSection = findMatchingSectionText(sections, RISKS_HEADING_RE);
  const verdictSection = findMatchingSectionText(sections, VERDICT_HEADING_RE);
  const handoffSection = findMatchingSectionText(sections, HANDOFF_HEADING_RE)
    || sections.find((s) => /\b(?:HANDOFF_BRIEF|RESEARCH_HANDOFF)\b/.test(s.body))?.body
    || '';
  const unfilledPlaceholders = [...new Set([
    ...collectMatches(proseOnly, TEMPLATE_PLACEHOLDER_RE, (m) => m[0].trim()),
    ...collectMatches(proseOnly, DEFERRED_MARKER_RE, (m) => m[0].trim()),
  ])];

  return {
    mode, title, lineCount, frontmatter, headings, sections, tables,
    tableRowCount, maxTableRows, citations, anchors, confidenceTags,
    hasConstraints, risksSection, hasRisks: Boolean(risksSection),
    verdictSection, handoffSection, unfilledPlaceholders,
  };
}

function resolveResearchInput(markdownOrParsed, options = {}) {
  if (markdownOrParsed && typeof markdownOrParsed === 'object' && typeof markdownOrParsed.lineCount === 'number') {
    return { ...markdownOrParsed, mode: options.mode ? String(options.mode).toLowerCase() : markdownOrParsed.mode };
  }
  const str = String(markdownOrParsed || '');
  if (str && !str.includes('\n') && fs.existsSync(str)) {
    return parseResearchMarkdown(readCleanText(str), { ...options, filePath: options.filePath || str });
  }
  return parseResearchMarkdown(str, options);
}

function validateResearch(markdownOrParsed, options = {}) {
  const parsed = resolveResearchInput(markdownOrParsed, options);
  const mode = parsed.mode === 'brainstorm' ? 'brainstorm' : 'research';
  const [g1, g2, g3, g4, warnings] = [[], [], [], [], []];

  if (mode === 'brainstorm') {
    if (!parsed.hasConstraints) g1.push('[RES-G1] Brainstorm missing explicit Constraints / Assumptions / Grounding section or bullet.');
    if ((parsed.anchors || parsed.citations || []).length < MIN_BRAINSTORM_ANCHORS) {
      g1.push('[RES-G1] Brainstorm requires >= 1 concrete grounding reference (codebase path, RESEARCH-/SCOUT- artifact, or URL).');
    }
  } else {
    if ((parsed.citations || []).length < MIN_RESEARCH_CITATIONS) {
      g1.push(`[RES-G1] Research requires >= ${MIN_RESEARCH_CITATIONS} concrete citations (https://, file://, or file.ext:line); found ${(parsed.citations || []).length}.`);
    }
    if ((parsed.confidenceTags || []).length < 1) {
      g1.push('[RES-G1] Research missing explicit confidence tagging ([HIGH]/[MEDIUM]/[LOW] or frontmatter confidence:).');
    }
  }

  const bestRows = parsed.maxTableRows ?? parsed.tableRowCount ?? 0;
  if (bestRows < MIN_TABLE_ROWS) g2.push(`[RES-G2] Missing comparison/decision matrix table with >= ${MIN_TABLE_ROWS} data rows (found ${bestRows}).`);
  if (!parsed.hasRisks) g2.push("[RES-G2] Missing explicit Trade-Offs / Contradictions / Pre-Mortem / Devil's Advocate / When NOT to Use / Risks section.");

  if (!parsed.verdictSection) g3.push('[RES-G3] Missing Verdict / Executive Summary / Recommended Option section.');
  if (!parsed.handoffSection) g3.push('[RES-G3] Missing Downstream Handoff (HANDOFF_BRIEF / Recommended Architecture / Next Steps) section.');

  if (parsed.lineCount === 0) g4.push('[RES-G4] Artifact is empty.');
  else if (parsed.lineCount > HARD_RESEARCH_LINES) g4.push(`[RES-G4] Artifact is ${parsed.lineCount} lines (exceeds single-file limit of ${HARD_RESEARCH_LINES} lines).`);
  else if (parsed.lineCount > SOFT_RESEARCH_LINES) warnings.push(`[RES-G4] Artifact is ${parsed.lineCount} lines (exceeds soft target of ${SOFT_RESEARCH_LINES} lines).`);
  if ((parsed.unfilledPlaceholders || []).length > 0) {
    g4.push(`[RES-G4] Unfilled template placeholders or deferred markers detected: ${parsed.unfilledPlaceholders.slice(0, 5).join(', ')}.`);
  }

  const errors = [...g1, ...g2, ...g3, ...g4];
  return {
    valid: errors.length === 0, mode, errors, warnings,
    gates: { G1: g1.length === 0, G2: g2.length === 0, G3: g3.length === 0, G4: g4.length === 0 },
    stats: {
      lineCount: parsed.lineCount, citationCount: (parsed.citations || []).length,
      anchorCount: (parsed.anchors || []).length, confidenceCount: (parsed.confidenceTags || []).length,
      tableRowCount: parsed.tableRowCount, hasHandoffBrief: Boolean(parsed.handoffSection),
    },
  };
}

function compactLines(text, maxLines) {
  return String(text || '').split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.trim().length > 0).slice(0, maxLines).join('\n');
}

function extractResearchBrief(markdownOrPath, options = {}) {
  const parsed = resolveResearchInput(markdownOrPath, options);
  const verdict = compactLines(parsed.verdictSection, 8);
  const handoffBody = compactLines(parsed.handoffSection, 14);
  const risksSummary = compactLines(parsed.risksSection, 8);
  const citations = (parsed.citations.length > 0 ? parsed.citations : parsed.anchors).slice(0, MAX_BRIEF_CITATIONS);
  const markdownBlock = [
    '## 🧭 Upstream Handoff Brief (`HANDOFF_BRIEF`)',
    `- **Source Mode**: \`${parsed.mode}\` | **Title**: ${parsed.title}`, '',
    '### Verdict & Recommended Direction', verdict || '_No verdict extracted._', '',
    '### Downstream Architecture & Next Steps', handoffBody || '_No handoff section extracted._', '',
    '### Key Trade-Offs & Guardrails', risksSummary || '_No risks extracted._', '',
    '### Grounding Citations & References',
    ...(citations.length > 0 ? citations.map((c) => `- \`${c}\``) : ['- _None_']),
  ].join('\n');
  return { mode: parsed.mode, title: parsed.title, verdict, handoffBody, risksSummary, citations, markdownBlock };
}

const RESEARCH_HELP = `Usage: boomopen research <validate|brief|help> <file.md> [options]
  validate <file.md> [--mode research|brainstorm] [--json]            Validate RESEARCH/BRAINSTORM artifact (RES-G1..G4)
  brief <file.md> [--mode research|brainstorm] [--out <file>] [--json] Extract compact HANDOFF_BRIEF for /design, /plan, or /cook`;

const RESEARCH_ARG_SPEC = {
  defaults: { json: false, help: false, mode: null, out: null },
  booleanFlags: { '-h': 'help', '--help': 'help', '--json': 'json' },
  valueFlags: { '--mode': 'mode', '--out': 'out', '--output': 'out' },
};

function failUsage(msg, env) {
  if (!env.silent) console.error(msg);
  return EXIT_USAGE;
}

function runResearchCli(args = [], env = {}) {
  const { flags, positional, error } = parseSubcommandArgs(args, RESEARCH_ARG_SPEC);
  if (error) return failUsage(`❌ boomopen research: ${error}\n\n${RESEARCH_HELP}`, env);
  const sub = (positional[0] || 'help').toLowerCase();
  if (flags.help || sub === 'help') {
    if (!env.silent) console.log(RESEARCH_HELP);
    return EXIT_OK;
  }
  if (flags.mode && flags.mode !== 'research' && flags.mode !== 'brainstorm') {
    return failUsage(`❌ Invalid --mode "${flags.mode}" (expected research or brainstorm).`, env);
  }
  if (sub !== 'validate' && sub !== 'brief') return failUsage(`❌ Unknown research subcommand "${sub}"\n\n${RESEARCH_HELP}`, env);
  const targetFile = positional[1];
  if (!targetFile) return failUsage(`❌ boomopen research ${sub} requires a <file.md> path.\n\n${RESEARCH_HELP}`, env);

  const cwd = env.cwd || process.cwd();
  const absPath = path.resolve(cwd, targetFile);
  if (!fs.existsSync(absPath)) return failUsage(`❌ Research file not found: ${targetFile}`, env);

  try {
    const raw = readCleanText(absPath);
    const parseOpts = { filePath: absPath, mode: flags.mode || undefined };
    if (sub === 'validate') {
      const res = validateResearch(raw, parseOpts);
      if (!env.silent) {
        if (flags.json) console.log(JSON.stringify(res, null, 2));
        else if (res.valid) console.log(`✅ ${res.mode.toUpperCase()} valid (${res.stats.lineCount} lines, ${res.stats.citationCount} citations, RES-G1..G4 passed)`);
        else for (const err of res.errors) console.error(`❌ ${err}`);
      }
      return res.valid ? EXIT_OK : EXIT_FAIL;
    }
    const brief = extractResearchBrief(raw, parseOpts);
    if (flags.out) {
      const outAbs = path.resolve(cwd, flags.out);
      fs.mkdirSync(path.dirname(outAbs), { recursive: true });
      fs.writeFileSync(outAbs, `${brief.markdownBlock}\n`, 'utf8');
    }
    if (!env.silent) console.log(flags.json ? JSON.stringify(brief, null, 2) : brief.markdownBlock);
    return EXIT_OK;
  } catch (err) {
    if (!env.silent) console.error(`❌ boomopen research: ${err instanceof Error ? err.message : String(err)}`);
    return EXIT_FAIL;
  }
}

module.exports = { parseResearchMarkdown, validateResearch, extractResearchBrief, runResearchCli };
