'use strict';

/**
 * Matrix skills index: parses matrix-skills/<domain>.yaml (the subset of YAML those files use),
 * validates their list layout, and builds matrix-skills/compact-index.json.
 */

const fs = require('node:fs');
const path = require('node:path');

const { KIT_VERSION } = require('./doctor-version.js');

const INDEX_FILE_NAME = 'compact-index.json';
const DEFAULT_PRIORITY = 5;
const DEFAULT_CATEGORY = 'specialized';
const INDEXED_KEYS = new Set(['skill_id', 'category', 'priority_score']);
const ITEM_LINE = /^(\s*)-\s+(.*)$/;
const KEY_LINE = /^(\s*)([A-Za-z_][\w-]*):(?:\s+(.*))?$/;

function indentOf(line) {
  return line.length - line.trimStart().length;
}

function isBlankOrComment(line) {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

/**
 * Plain or quoted YAML scalar → string (surrounding quotes and trailing comments removed).
 * @param {string} raw
 * @returns {string}
 */
function parseScalar(raw) {
  const value = (raw || '').trim();
  const quoted = value.match(/^(["'])(.*)\1(?:\s+#.*)?$/);
  if (quoted) return quoted[1] === "'" ? quoted[2].replace(/''/g, "'") : quoted[2];
  return value.replace(/\s+#.*$/, '').trim();
}

/** Split a flow mapping body on commas that are outside quotes and brackets. */
function splitFlow(body) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (const ch of body) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0 && !quote) { parts.push(current); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function readFlowItem(text, fields) {
  const body = text.trim().replace(/^\{/, '').replace(/\}\s*(?:#.*)?$/, '');
  for (const part of splitFlow(body)) {
    const match = part.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (match && INDEXED_KEYS.has(match[1])) fields[match[1]] = parseScalar(match[2]);
  }
}

/**
 * Read the sequence items of a domain file: `- skill_id: x` blocks (any key order) and
 * `- { skill_id: x, ... }` flow items. Only an item's own top-level keys are read.
 * @param {string} yamlContent
 * @returns {Array<{ line: number, dashIndent: number, fieldIndent: number|null, fields: Record<string,string> }>}
 */
function readSequenceItems(yamlContent) {
  const lines = yamlContent.split(/\r?\n/);
  const items = [];
  let current = null;
  lines.forEach((line, index) => {
    if (isBlankOrComment(line)) return;
    const itemMatch = line.match(ITEM_LINE);
    if (itemMatch) {
      const dashIndent = itemMatch[1].length;
      current = { line: index + 1, dashIndent, fieldIndent: null, fields: {} };
      items.push(current);
      const rest = itemMatch[2];
      if (rest.trim().startsWith('{')) { readFlowItem(rest, current.fields); return; }
      const keyMatch = rest.match(KEY_LINE);
      if (keyMatch && INDEXED_KEYS.has(keyMatch[2])) current.fields[keyMatch[2]] = parseScalar(keyMatch[3]);
      current.fieldIndent = line.length - rest.length;
      return;
    }
    if (!current) return;
    const indent = indentOf(line);
    if (indent <= current.dashIndent) { current = null; return; }
    const keyMatch = line.match(KEY_LINE);
    if (!keyMatch) return;
    if (current.firstContinuationIndent === undefined) current.firstContinuationIndent = indent;
    if (indent === current.firstContinuationIndent && INDEXED_KEYS.has(keyMatch[2])) {
      current.fields[keyMatch[2]] = parseScalar(keyMatch[3]);
    }
  });
  return items.filter((item) => item.fields.skill_id);
}

/**
 * Report list-layout errors that make a file invalid YAML for real parsers
 * (mixed item indentation, or keys not aligned under the first key of their item).
 * @param {string} yamlContent
 * @returns {string[]} problems ("line N: ...")
 */
function validateDomainYamlLayout(yamlContent) {
  const items = readSequenceItems(yamlContent);
  if (items.length === 0) return [];
  const problems = [];
  // The indentation most items use is the intended one (on a tie, the nested one).
  const tally = new Map();
  for (const item of items) tally.set(item.dashIndent, (tally.get(item.dashIndent) || 0) + 1);
  const expectedDash = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
  for (const item of items) {
    if (item.dashIndent !== expectedDash) {
      problems.push(`line ${item.line}: list item indented ${item.dashIndent}, expected ${expectedDash}`);
    } else if (item.firstContinuationIndent !== undefined && item.fieldIndent !== null
      && item.firstContinuationIndent !== item.fieldIndent) {
      problems.push(`line ${item.line}: keys indented ${item.firstContinuationIndent}, expected ${item.fieldIndent}`);
    }
  }
  return problems;
}

/**
 * Parse a single domain YAML file into compact skill entries.
 * @param {string} yamlContent
 * @param {string} domainName
 * @param {Set<string>} coreSkillNames folders under skills/ (everything else is in skills_library/)
 * @returns {Record<string, {domain: string, priority: number, category: string, path: string}>}
 */
function parseDomainYaml(yamlContent, domainName, coreSkillNames) {
  const entries = {};
  for (const item of readSequenceItems(yamlContent)) {
    const skillId = item.fields.skill_id;
    const priority = Number.parseInt(item.fields.priority_score, 10);
    const skillFolder = coreSkillNames.has(skillId) ? 'skills' : 'skills_library';
    entries[skillId] = {
      domain: domainName,
      priority: Number.isFinite(priority) ? priority : DEFAULT_PRIORITY,
      category: item.fields.category || DEFAULT_CATEGORY,
      path: `${skillFolder}/${skillId}/SKILL.md`,
    };
  }
  return entries;
}

function listCoreSkills(repoRoot) {
  const skillsDir = path.join(repoRoot, 'skills');
  if (!fs.existsSync(skillsDir)) return new Set();
  return new Set(
    fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  );
}

function listDomainFiles(matrixDir) {
  return fs.readdirSync(matrixDir).filter((f) => f.endsWith('.yaml') && !f.startsWith('_')).sort();
}

/**
 * Build the compact index in memory. A skill listed in several domains gets a `domains` array
 * with all of them; `domain`, `priority` and `category` come from the last file (alphabetical).
 * @param {string} repoRoot
 * @returns {{ payload: object, report: { files: Array<object>, duplicates: string[], entryCount: number } }}
 */
function buildCompactIndexData(repoRoot) {
  const matrixDir = path.join(repoRoot, 'matrix-skills');
  const coreSkills = listCoreSkills(repoRoot);
  const skills = {};
  const files = [];
  const duplicates = new Set();
  let entryCount = 0;
  for (const file of listDomainFiles(matrixDir)) {
    const domain = path.basename(file, '.yaml');
    const content = fs.readFileSync(path.join(matrixDir, file), 'utf8');
    const entries = parseDomainYaml(content, domain, coreSkills);
    const declared = content.match(/^skill_count:\s*(\d+)/m);
    files.push({
      file,
      entries: Object.keys(entries).length,
      declaredCount: declared ? Number(declared[1]) : null,
      layoutProblems: validateDomainYamlLayout(content),
    });
    for (const [skillId, entry] of Object.entries(entries)) {
      entryCount++;
      const existing = skills[skillId];
      if (!existing) { skills[skillId] = entry; continue; }
      duplicates.add(skillId);
      const previous = existing.domains || [existing.domain];
      skills[skillId] = { ...entry, domains: previous.includes(domain) ? previous : [...previous, domain] };
    }
  }
  const payload = { version: KIT_VERSION, totalSkills: Object.keys(skills).length, skills };
  return { payload, report: { files, duplicates: [...duplicates].sort(), entryCount } };
}

/**
 * Build matrix-skills/compact-index.json from matrix-skills/*.yaml files.
 * @param {string} repoRoot
 * @returns {{ count: number, outputPath: string }}
 */
function buildCompactSkillIndex(repoRoot) {
  const { payload } = buildCompactIndexData(repoRoot);
  const outputPath = path.join(repoRoot, 'matrix-skills', INDEX_FILE_NAME);
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  return { count: payload.totalSkills, outputPath };
}

/**
 * Read a compact index file; null when missing or unreadable.
 * @param {string} indexPath
 * @returns {{ data: object|null, error: string|null }}
 */
function readCompactIndex(indexPath) {
  if (!fs.existsSync(indexPath)) return { data: null, error: 'missing' };
  try {
    const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (!data || typeof data !== 'object' || typeof data.skills !== 'object') {
      return { data: null, error: 'no "skills" map' };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: `invalid JSON (${err instanceof Error ? err.message : String(err)})` };
  }
}

module.exports = {
  INDEX_FILE_NAME,
  parseScalar,
  parseDomainYaml,
  validateDomainYamlLayout,
  buildCompactIndexData,
  buildCompactSkillIndex,
  readCompactIndex,
};
