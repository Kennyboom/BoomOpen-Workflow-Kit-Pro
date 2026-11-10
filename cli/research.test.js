'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parseResearchMarkdown,
  validateResearch,
  extractResearchBrief,
  runResearchCli,
} = require('./research.js');
const { COUNCIL_TASK_DIRECTIVES, runMultiEngineCouncil } = require('./conductor.js');
const { detectCookState } = require('./cook.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const VALID_RESEARCH_MD = `---
title: "Passkey & Session Architecture Deep Research"
confidence: HIGH
---

# Deep Research — Passkey & Session Architecture

## 1. Executive Summary & Final Verdict
Adopt WebAuthn passkeys backed by short-lived HttpOnly session cookies and Redis revocation lists [HIGH].
Grounded in \`src/auth/session.ts:42\` and RFC/OWASP guidance (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## 2. Approach Comparison Matrix
| Option | Latency | Operational Complexity | Confidence |
|--------|---------|------------------------|------------|
| Passkey + HttpOnly Cookie | < 5ms | Low | HIGH |
| Stateless JWT Only | < 2ms | Medium (no instant revoke) | MEDIUM |
| Legacy Password + TOTP | ~15ms | High phishing risk | HIGH |

## 3. Contradictions, Trade-Offs & Failure Modes
- Cross-device passkey sync differs between enterprise managed Windows profiles and consumer keychains (https://www.w3.org/TR/webauthn-3/).
- Device-bound hardware keys require an account recovery fallback flow (\`src/auth/recovery.ts:18\`).

## 4. Downstream Handoff (HANDOFF_BRIEF)
- Implement \`PasskeyChallengeStore\` and \`SessionCookieManager\` in Wave 1 \`SHARED_CONTRACT\`.
- Enforce CSRF SameSite=Lax + Origin header check on state-mutating routes.
`;

const VALID_BRAINSTORM_MD = `---
mode: brainstorm
---

# Brainstorming & Ideation Blueprint — Realtime Presence Engine

## 1. Context & Constraints
- **Constraints**: Zero external broker cost in MVP, < 350 lines per module, compatible with \`SCOUT-presence.md\` and \`src/ws/gateway.ts\`.

## 2. Strategic Option Matrix
| Option | Value | Effort | Risk | Verdict |
|--------|-------|--------|------|---------|
| Option A: In-Memory Room Shards + SSE | 9/10 | Low | Low | Winner |
| Option B: Full CRDT Sync Mesh | 7/10 | High | High | Overkill |
| Option C: Client Polling Every 5s | 4/10 | Low | Medium | Stale UX |

## 3. Devil's Advocate & Pre-Mortem Critique
- Single-node room state drops ephemeral cursors during rolling restarts unless clients auto-reconnect with Last-Event-ID.

## 4. Recommended Option & Verdict
Select **Option A (In-Memory Room Shards + SSE)** for immediate sub-50ms presence updates without operational bloat.

## 5. Next Steps & HANDOFF_BRIEF
- Define \`PresenceEvent\` union in \`SHARED_CONTRACT\` before spawning backend and frontend shards.
`;

test('parseResearchMarkdown and validateResearch pass compliant RESEARCH and BRAINSTORM artifacts across RES-G1..G4', () => {
  const resParsed = parseResearchMarkdown(VALID_RESEARCH_MD, { filePath: 'RESEARCH-auth.md' });
  assert.equal(resParsed.mode, 'research');
  assert.ok(resParsed.citations.length >= 2);
  assert.ok(resParsed.confidenceTags.includes('HIGH'));
  assert.equal(resParsed.tableRowCount, 3);

  const resVal = validateResearch(resParsed);
  assert.equal(resVal.valid, true);
  assert.deepEqual(resVal.gates, { G1: true, G2: true, G3: true, G4: true });

  const bsParsed = parseResearchMarkdown(VALID_BRAINSTORM_MD, { filePath: 'BRAINSTORM-presence.md' });
  assert.equal(bsParsed.mode, 'brainstorm');
  assert.equal(bsParsed.hasConstraints, true);
  assert.ok(bsParsed.anchors.includes('SCOUT-presence.md'));

  const bsVal = validateResearch(bsParsed);
  assert.equal(bsVal.valid, true);
  assert.deepEqual(bsVal.gates, { G1: true, G2: true, G3: true, G4: true });
});

test('validateResearch enforces RES-G1 for both research (citations + confidence) and brainstorm (constraints + anchors)', () => {
  const missingCitAndConf = `# Deep Research — Caching
## Executive Summary
Option A gives high throughput and low latency in production (\`src/cache.ts:10\`).
## Comparison
| Option | Cost |
|--------|------|
| Redis | $10 |
| Memcached | $8 |
## Trade-Offs & Risks
Memory eviction under spike load.
## Downstream Handoff
Wire cache adapter in Wave 1.
`;
  const r1 = validateResearch(missingCitAndConf, { mode: 'research' });
  assert.equal(r1.valid, false);
  assert.equal(r1.gates.G1, false);
  assert.equal(r1.errors.length, 2);

  const missingConstraintsBrainstorm = `# Brainstorm — Billing Ideas
## Option Matrix
| Option | Score |
|--------|-------|
| Stripe | 9 |
| Paddle | 8 |
## Pre-Mortem Risks
Webhook retries can duplicate events.
## Final Verdict
Pick Stripe.
## Next Steps
Create billing contract.
`;
  const b1 = validateResearch(missingConstraintsBrainstorm);
  assert.equal(b1.mode, 'brainstorm');
  assert.equal(b1.valid, false);
  assert.equal(b1.gates.G1, false);
  assert.equal(b1.errors.length, 2);
});

test('validateResearch enforces RES-G2 (matrix + risks), RES-G3 (verdict + handoff), and RES-G4 (line budget + placeholders)', () => {
  const badG2G3 = VALID_RESEARCH_MD
    .replace(/\| Passkey[\s\S]*?\| Legacy[^\n]+\n/, '| OnlyOneRow | 5ms | Low | HIGH |\n')
    .replace(/## 3\. Contradictions[\s\S]*?## 4\. Downstream Handoff \(HANDOFF_BRIEF\)/, '## 3. Notes\nGeneral notes.');
  const res23 = validateResearch(badG2G3);
  assert.equal(res23.valid, false);
  assert.equal(res23.gates.G2, false);
  assert.equal(res23.gates.G3, false);

  const placeholderMd = `${VALID_RESEARCH_MD}\nInvestigate {topic} at {url} and resolve [TBD] items.\n`;
  const resPlaceholder = validateResearch(placeholderMd);
  assert.equal(resPlaceholder.valid, false);
  assert.equal(resPlaceholder.gates.G4, false);

  const softWarnMd = `${VALID_RESEARCH_MD}\n${Array.from({ length: 390 }, (_, i) => `- Evidence note ${i + 1}`).join('\n')}\n`;
  const resSoft = validateResearch(softWarnMd);
  assert.equal(resSoft.valid, true);
  assert.equal(resSoft.warnings.length, 1);

  const overBudgetMd = `${VALID_RESEARCH_MD}\n${Array.from({ length: 495 }, (_, i) => `- Overflow line ${i + 1}`).join('\n')}\n`;
  const resOver = validateResearch(overBudgetMd);
  assert.equal(resOver.valid, false);
  assert.equal(resOver.gates.G4, false);
});

test('extractResearchBrief and runResearchCli handle validate, brief --out, --json, help, and exit codes 0/1/2', () => {
  const dir = tempDir('boomopen-research-cli-');
  try {
    const resFile = path.join(dir, 'RESEARCH-passkeys.md');
    const badFile = path.join(dir, 'RESEARCH-broken.md');
    const outFile = path.join(dir, 'out', 'BRIEF.md');
    fs.writeFileSync(resFile, VALID_RESEARCH_MD, 'utf8');
    fs.writeFileSync(badFile, '# Empty Research\nOnly one line.\n', 'utf8');

    const brief = extractResearchBrief(resFile);
    assert.equal(brief.mode, 'research');
    assert.match(brief.markdownBlock, /HANDOFF_BRIEF/);
    assert.ok(brief.citations.some((c) => c.includes('src/auth/session.ts:42')));

    assert.equal(runResearchCli(['help'], { cwd: dir, silent: true }), 0);
    assert.equal(runResearchCli(['validate', 'RESEARCH-passkeys.md', '--json'], { cwd: dir, silent: true }), 0);
    assert.equal(runResearchCli(['brief', 'RESEARCH-passkeys.md', '--out', 'out/BRIEF.md'], { cwd: dir, silent: true }), 0);
    assert.ok(fs.existsSync(outFile));

    const prevExit = process.exitCode;
    assert.equal(runResearchCli(['validate', 'RESEARCH-broken.md'], { cwd: dir, silent: true }), 1);
    assert.equal(runResearchCli(['validate', 'MISSING-file.md'], { cwd: dir, silent: true }), 2);
    assert.equal(runResearchCli(['validate', 'RESEARCH-passkeys.md', '--mode', 'bogus'], { cwd: dir, silent: true }), 2);
    assert.equal(runResearchCli(['unknown-sub'], { cwd: dir, silent: true }), 2);
    process.exitCode = prevExit;
  } finally {
    removeDir(dir);
  }
});

test('runMultiEngineCouncil enriches prompts for research & brainstorm and detectCookState tracks BRAINSTORM-*.md', async () => {
  const dir = tempDir('boomopen-research-council-');
  const brain = tempDir('boomopen-brainstorm-state-');
  try {
    assert.ok(COUNCIL_TASK_DIRECTIVES.research.includes('[COUNCIL RESEARCHER REQUIREMENTS]'));
    assert.ok(COUNCIL_TASK_DIRECTIVES.brainstorm.includes('[COUNCIL BRAINSTORMER REQUIREMENTS]'));

    const capturedPrompts = {};
    const mockProbes = {
      claude: { available: true, bin: 'claude', family: 'anthropic' },
      codex: { available: true, bin: 'codex', family: 'openai' },
      antigravity: { available: true, bin: 'agy', family: 'google' },
    };
    const mockRunner = async (engine, _inv, ctx) => {
      capturedPrompts[engine] = ctx.promptText;
      return { ok: true, exitCode: 0, stdout: `- [${engine}] Finding verified [HIGH]\n`, stderr: '', durationMs: 5 };
    };

    await runMultiEngineCouncil({
      cwd: dir,
      task: 'research',
      prompt: 'Compare SQLite WAL vs DuckDB for local CLI telemetry',
      mockProbes,
      mockRunner,
    });
    assert.match(capturedPrompts.claude, /\[COUNCIL RESEARCHER REQUIREMENTS\]/);

    await runMultiEngineCouncil({
      cwd: dir,
      task: 'brainstorm',
      prompt: 'Explore 3 offline-first sync architectures',
      mockProbes,
      mockRunner,
    });
    assert.match(capturedPrompts.codex, /\[COUNCIL BRAINSTORMER REQUIREMENTS\]/);

    const bsPath = path.join(brain, 'BRAINSTORM-offline-sync.md');
    fs.writeFileSync(bsPath, VALID_BRAINSTORM_MD, 'utf8');
    const state = detectCookState({ cwd: dir, artifactDir: brain });
    assert.equal(state.feature, 'offline-sync');
    assert.equal(state.artifacts.brainstorm, bsPath);
    assert.equal(state.recommendedStage, 'STAGE_2_DESIGN_OR_PLAN');
    assert.equal(state.nextCommand, `boomopen research brief "${bsPath}"`);
  } finally {
    removeDir(dir);
    removeDir(brain);
  }
});

test('regressions S1-BUG-04, S1-BUG-06, S1-BUG-07, S1-BUG-08 & S1-BUG-14: Vietnamese headings, BRAINSTORM_ underscore, 4-backtick carousel, UTF-8 BOM, and strict flags', () => {
  const dir = tempDir('boomopen-research-reg-');
  try {
    const viResearch = `\uFEFF---
title: "Nghiên cứu Kiến trúc Passkey"
confidence: HIGH
---
# Nghiên cứu Chuyên sâu — Passkey

## 1. Tóm tắt Điều hành & Kết luận
Chọn WebAuthn passkey kết hợp HttpOnly cookie [HIGH] dựa trên \`src/auth/session.ts:42\` và https://www.w3.org/TR/webauthn-3/.

\`\`\`\`carousel
<!-- slide -->
\`\`\`ts
const example = "{topic} inside nested fence";
// TODO: nested code comment inside 4-backtick carousel
\`\`\`
\`\`\`\`

## 2. Ma trận So sánh
| Phương án | Độ trễ | Độ tin cậy |
|-----------|--------|------------|
| Passkey | < 5ms | HIGH |
| JWT | < 2ms | MEDIUM |

## 3. Đánh đổi, Mâu thuẫn & Rủi ro
- Cần luồng khôi phục tài khoản dự phòng (\`src/auth/recovery.ts:18\`).

## 4. Bàn giao Kiến trúc
- Khóa \`PasskeyStore\` trong Wave 1 \`SHARED_CONTRACT\`.
`;
    const rVal = validateResearch(viResearch, { filePath: 'RESEARCH_auth.md' });
    assert.equal(rVal.valid, true, rVal.errors.join('; '));
    const brief = extractResearchBrief(viResearch, { filePath: 'RESEARCH_auth.md' });
    assert.match(brief.verdict, /WebAuthn passkey/);
    assert.match(brief.risksSummary, /khôi phục/);

    const viBrainstorm = `\uFEFF# Khám phá Ý tưởng — Đồng bộ Ngoại tuyến
## 1. Bối cảnh & Ràng buộc
- **Ràng buộc**: Tương thích \`SCOUT_sync.md\` và \`src/sync/engine.ts\`.
## 2. Ma trận Phương án
| Phương án | Điểm |
|-----------|------|
| SSE | 9/10 |
| CRDT | 7/10 |
## 3. Phản biện & Rủi ro
- Mất kết nối tạm thời khi cuộn phiên bản.
## 4. Phương án Đề xuất
Chọn SSE.
## 5. Bước tiếp theo
- Tạo \`SyncContract\`.
`;
    const bsVal = validateResearch(viBrainstorm, { filePath: 'BRAINSTORM_sync.md' });
    assert.equal(bsVal.mode, 'brainstorm');
    assert.equal(bsVal.valid, true, bsVal.errors.join('; '));

    const resFile = path.join(dir, 'RESEARCH-vi.md');
    fs.writeFileSync(resFile, viResearch, 'utf8');
    const prevExit = process.exitCode;
    assert.equal(runResearchCli(['validate', resFile, '--bogus-flag'], { cwd: dir, silent: true }), 2);
    assert.equal(runResearchCli(['brief', resFile, '--out', '--json'], { cwd: dir, silent: true }), 2);
    assert.ok(!fs.existsSync(path.join(dir, '--json')));
    assert.equal(process.exitCode, prevExit);
  } finally {
    removeDir(dir);
  }
});
