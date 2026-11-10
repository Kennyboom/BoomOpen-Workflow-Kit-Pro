'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  parseDesignMarkdown,
  validateDesign,
  extractDesignContract,
  runDesignCli,
} = require('./design.js');
const { runMultiEngineCouncil } = require('./conductor.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const VALID_DESIGN_MD = `---
aesthetic_direction:
  persona: "Warm Editorial Precision"
  references: ["Linear", "Stripe Press"]
colors:
  background: "oklch(0.985 0.004 85)"
  foreground: "oklch(0.18 0.01 85)"
  primary: "oklch(0.55 0.19 255)"
surface_elevation:
  level_0_canvas: "oklch(0.985 0.004 85)"
  level_1_card: "oklch(1.000 0 0)"
  level_2_elevated: "oklch(0.965 0.006 85)"
  hairline_border: "oklch(0.89 0.008 85)"
typography:
  display: "'Instrument Serif', serif"
  sans: "'Plus Jakarta Sans', sans-serif"
  mono: "'JetBrains Mono', monospace"
spacing:
  base_unit: "4px"
  scroll_padding_top: "5rem"
motion:
  reduced_motion: "prefers-reduced-motion: reduce"
radius:
  card_outer: "16px"
  card_inner: "8px"
components:
  button:
    variants: ["primary", "secondary", "ghost", "destructive"]
    states: ["default", "loading", "empty", "error", "disabled"]
anti_patterns:
  - "Never use Inter, Roboto, or Arial as unstyled default font"
  - "Never use #8B5CF6 to #06B6D4 neon purple-cyan gradient"
---

# UI/UX Design Specification — Analytics Workspace

## 1. Aesthetic Direction & Anti-Slop Guardrails
- Warm alabaster canvas (\`oklch(0.985 0.004 85)\`) with 1px structural hairline borders.
- Avoid generic AI-slop defaults (no default Inter/Roboto/Arial; no #8B5CF6 + #06B6D4 neon gradient).

## 2. Component States (5-State Matrix)
| Component | Default | Loading | Empty | Error | Disabled / Focus |
|-----------|---------|---------|-------|-------|------------------|
| MetricCard | Live KPI value | Shimmer skeleton | Zero-data prompt + CTA | Inline retry banner | Focus-visible 2px ring / Disabled 50% opacity |

## 3. Responsive Breakpoints & WCAG 2.2 AA Verification
- **Contrast**: Body text >= \`4.5:1\`, large display headings & UI borders >= \`3:1\`.
- **Hit Targets**: Minimum \`24x24px\` desktop pointer target and \`44x44pt\` mobile touch target.
- **Motion Safety**: Full \`prefers-reduced-motion: reduce\` support disabling spring transforms.
- **Breakpoints**: Mobile \`375px\`, Tablet \`768px\`, Desktop \`1024px\` and \`1440px\`.

## 🤝 Design-to-Code Contract (\`DESIGN_CONTRACT\`)

\`\`\`css
@theme inline {
  --color-canvas: oklch(0.985 0.004 85);
  --color-card: oklch(1.000 0 0);
  --color-primary: oklch(0.55 0.19 255);
  --font-display: 'Instrument Serif', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
\`\`\`

\`\`\`ts
export type MetricViewState = 'default' | 'loading' | 'empty' | 'error' | 'disabled';

export interface MetricCardProps {
  title: string;
  value: string;
  state: MetricViewState;
}
\`\`\`
`;

test('parseDesignMarkdown and validateDesign pass a compliant 2026 DESIGN.md across DESIGN-G1..G4', () => {
  const parsed = parseDesignMarkdown(VALID_DESIGN_MD);
  assert.equal(parsed.hasOklch, true);
  assert.equal(parsed.hasThemeBlock, true);
  assert.equal(parsed.hasTsContract, true);
  assert.equal(parsed.stateCount, 5);
  assert.equal(parsed.wcag.hasContrast, true);
  assert.equal(parsed.wcag.hasHitTarget, true);
  assert.equal(parsed.wcag.hasReducedMotion, true);
  assert.equal(parsed.wcag.hasBreakpoints, true);
  assert.equal(parsed.bannedFontViolation, false);
  assert.equal(parsed.bannedGradientViolation, false);

  const res = validateDesign(parsed);
  assert.equal(res.valid, true, `Unexpected validation errors: ${res.errors.join('; ')}`);
  assert.deepEqual(res.gates, { G1: true, G2: true, G3: true, G4: true });
  assert.equal(res.errors.length, 0);
  assert.equal(res.stats.stateCount, 5);
});

test('validateDesign enforces DESIGN-G1 (missing OKLCH/tokens, banned Inter/Roboto/Arial, banned #8B5CF6+#06B6D4 gradient)', () => {
  const slopMd = `# Slop UI
- **Font**: Inter, sans-serif
- **Gradient**: linear-gradient(to right, #8B5CF6, #06B6D4)
- States: Default, Loading, Empty, Error, Disabled
- Contrast 4.5:1, hit target 24x24px, prefers-reduced-motion, 375px and 1440px.
\`\`\`css
@theme { --color-bg: #8B5CF6; }
\`\`\`
\`\`\`ts
export interface BoxProps { id: string; }
\`\`\`
`;
  const res = validateDesign(slopMd);
  assert.equal(res.valid, false);
  assert.equal(res.gates.G1, false);
  assert.equal(res.gates.G2, true);
  assert.equal(res.gates.G3, true);
  assert.equal(res.gates.G4, true);
  assert.ok(res.errors.some((e) => /\[DESIGN-G1\].*perceptual color/i.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G1\].*Banned AI-slop primary font/i.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G1\].*neon purple-cyan gradient/i.test(e)));
});

test('validateDesign enforces DESIGN-G2 (5-state matrix) and DESIGN-G3 (WCAG 2.2 AA & responsive breakpoints)', () => {
  const incompleteMd = `# Incomplete UI
- Background: oklch(0.98 0.01 90)
- States: Default and Loading only.
\`\`\`css
@theme { --color-canvas: oklch(0.98 0.01 90); }
\`\`\`
\`\`\`ts
export interface CardProps { label: string; }
\`\`\`
`;
  const res = validateDesign(incompleteMd);
  assert.equal(res.valid, false);
  assert.equal(res.gates.G1, true);
  assert.equal(res.gates.G2, false);
  assert.equal(res.gates.G3, false);
  assert.equal(res.gates.G4, true);
  assert.equal(res.stats.stateCount, 2);
  assert.ok(res.errors.some((e) => /\[DESIGN-G2\].*Empty.*Error.*Disabled\/Focus/.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G3\].*contrast/i.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G3\].*hit target/i.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G3\].*prefers-reduced-motion/i.test(e)));
  assert.ok(res.errors.some((e) => /\[DESIGN-G3\].*breakpoint/i.test(e)));
});

test('validateDesign enforces DESIGN-G4 (<= 500 line budget and extractable DESIGN_CONTRACT)', () => {
  const noContractMd = `# Tokenless Spec
- Surface: oklch(0.98 0.005 85)
- States: Default, Loading, Empty, Error, Focus
- WCAG: 4.5:1 contrast, 24x24px hit target, prefers-reduced-motion, 375px and 1440px.
`;
  const resNoContract = validateDesign(noContractMd);
  assert.equal(resNoContract.valid, false);
  assert.equal(resNoContract.gates.G4, false);
  assert.ok(resNoContract.errors.some((e) => /\[DESIGN-G4\].*DESIGN_CONTRACT/.test(e)));

  const bloatedLines = `${VALID_DESIGN_MD}\n${Array.from({ length: 460 }, (_, i) => `- Extra line ${i + 1}`).join('\n')}`;
  const resBloated = validateDesign(bloatedLines);
  assert.equal(resBloated.valid, false);
  assert.equal(resBloated.gates.G4, false);
  assert.ok(resBloated.errors.some((e) => /\[DESIGN-G4\].*exceeds cohesive single-file limit of 500 lines/.test(e)));
});

test('extractDesignContract extracts explicit CSS/TS blocks and synthesizes contract from YAML tokens', () => {
  const explicit = extractDesignContract(VALID_DESIGN_MD);
  assert.match(explicit.cssTheme, /@theme inline/);
  assert.match(explicit.typescriptProps, /export interface MetricCardProps/);
  assert.match(explicit.markdownBlock, /### 🤝 Design-to-Code Contract \(`DESIGN_CONTRACT`\)/);

  const yamlOnlyMd = `---
colors:
  primary: "oklch(0.55 0.19 255)"
surface_elevation:
  canvas: "oklch(0.985 0.004 85)"
typography:
  display: "'Instrument Serif', serif"
components:
  badge:
    variants: ["info", "success"]
---
# YAML Spec
`;
  const synthesized = extractDesignContract(yamlOnlyMd);
  assert.match(synthesized.cssTheme, /--color-primary:\s*oklch\(0\.55 0\.19 255\)/);
  assert.match(synthesized.cssTheme, /--surface-canvas:\s*oklch\(0\.985 0\.004 85\)/);
  assert.match(synthesized.typescriptProps, /export interface BadgeProps/);
  assert.match(synthesized.typescriptProps, /'info' \| 'success'/);
});

test('runDesignCli supports validate, contract --out, --json, help, and conductor task=design enrichment', async () => {
  const root = tempDir('boomopen-design-cli-');
  try {
    const designPath = path.join(root, 'DESIGN-dashboard.md');
    fs.writeFileSync(designPath, VALID_DESIGN_MD, 'utf8');

    assert.equal(runDesignCli(['help'], { cwd: root, silent: true }), 0);
    assert.equal(runDesignCli(['validate', designPath, '--json'], { cwd: root, silent: true }), 0);

    const contractOut = path.join(root, 'DESIGN_CONTRACT.md');
    assert.equal(runDesignCli(['contract', designPath, '--out', contractOut], { cwd: root, silent: true }), 0);
    assert.ok(fs.existsSync(contractOut));
    assert.match(fs.readFileSync(contractOut, 'utf8'), /@theme inline/);

    const badPath = path.join(root, 'DESIGN-bad.md');
    fs.writeFileSync(badPath, '# Empty Spec\n', 'utf8');
    const prevExit = process.exitCode;
    const badCode = runDesignCli(['validate', badPath], { cwd: root, silent: true });
    assert.equal(badCode, 1);
    assert.equal(process.exitCode, prevExit);

    // Verify Multi-Engine Council prompt enrichment when task === 'design'
    const capturedPrompts = [];
    const councilRes = await runMultiEngineCouncil({
      cwd: root,
      runId: 'test-design-council',
      task: 'design',
      engines: ['claude', 'antigravity'],
      prompt: 'Design an editorial analytics dashboard',
      mockProbes: {
        claude: { available: true, bin: 'claude' },
        antigravity: { available: true, bin: 'agy' },
      },
      mockRunner: async (_engine, _inv, opts) => {
        capturedPrompts.push(opts.promptText);
        return { ok: true, exitCode: 0, stdout: '- Use OKLCH warm canvas tokens', stderr: '', durationMs: 5 };
      },
    });
    assert.equal(councilRes.ok, true);
    assert.equal(capturedPrompts.length, 2);
    for (const p of capturedPrompts) {
      assert.match(p, /\[COUNCIL DESIGNER REQUIREMENTS\]/);
      assert.match(p, /OKLCH \+ Tailwind v4 @theme inline/);
      assert.match(p, /5-State component matrix/);
    }
  } finally {
    removeDir(root);
  }
});

test('regressions S1-BUG-04, S1-BUG-06, S1-BUG-07 & S1-BUG-08: Vietnamese anti-slop negations & 5-state matrix, UTF-8 BOM frontmatter, 4-backtick carousel, and strict CLI flags', () => {
  const root = tempDir('boomopen-design-reg-');
  try {
    const viDesignBomAndCarousel = `\uFEFF---
colors:
  primary: "oklch(0.55 0.19 255)"
surface_elevation:
  canvas: "oklch(0.985 0.004 85)"
typography:
  sans: "'Plus Jakarta Sans', sans-serif"
spacing:
  base: "4px"
---
# Đặc tả Thiết kế Giao diện — Thanh toán

## 1. Quy tắc Cấm
- **Font**: Không sử dụng Inter, Roboto, hoặc Arial làm font mặc định.
- **Gradient**: Cấm dùng dải màu #8B5CF6 sang #06B6D4.

## 2. Ma trận 5 Trạng thái
| Thành phần | Mặc định | Đang tải | Trống | Lỗi | Vô hiệu hóa |
|------------|----------|----------|-------|-----|-------------|
| Hóa đơn | Số dư | Khung xương | Chưa có dữ liệu | Thất bại | Mờ 50% |

## 3. WCAG 2.2 AA
- Tương phản >= 4.5:1, vùng chạm >= 24x24px / 44x44pt, prefers-reduced-motion, 375px và 1440px.

\`\`\`\`carousel
<!-- slide -->
\`\`\`css
@theme inline {
  --color-brand: oklch(0.55 0.19 255);
}
\`\`\`
<!-- slide -->
\`\`\`ts
export interface InvoiceProps { amount: number; }
\`\`\`
\`\`\`\`
`;
    const val = validateDesign(viDesignBomAndCarousel);
    assert.equal(val.valid, true, val.errors.join('; '));
    const contract = extractDesignContract(viDesignBomAndCarousel);
    assert.match(contract.cssTheme, /--color-brand:\s*oklch\(0\.55 0\.19 255\)/);
    assert.match(contract.typescriptProps, /export interface InvoiceProps/);

    const filePath = path.join(root, 'DESIGN-vi.md');
    fs.writeFileSync(filePath, viDesignBomAndCarousel, 'utf8');
    assert.equal(runDesignCli(['validate', filePath, '--bogus'], { cwd: root, silent: true }), 2);
    assert.equal(runDesignCli(['contract', filePath, '--out', '--json'], { cwd: root, silent: true }), 2);
    assert.ok(!fs.existsSync(path.join(root, '--json')));
  } finally {
    removeDir(root);
  }
});
