'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { inspectSourceFile, runCheck, runCheckCli, EXIT_USAGE } = require('./checker.js');
const { countLines, decodeTextBuffer } = require('./checker-text.js');
const { stripNonCode } = require('./checker-strip.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const lines = (count, text = 'const x = 1;') => `${Array.from({ length: count }, () => text).join('\n')}\n`;

function write(root, rel, content) {
  const filePath = path.join(root, ...rel.split('/'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function withProject(fn) {
  const root = tempDir('boomopen-check-');
  const home = tempDir('boomopen-check-home-');
  try {
    write(root, 'package.json', '{"name":"fixture"}\n');
    return fn(root, home);
  } finally {
    removeDir(root);
    removeDir(home);
  }
}

test('countLines matches wc -l (trailing newline is not a line) for LF, CRLF and empty text', () => {
  assert.equal(countLines(''), 0);
  assert.equal(countLines('a'), 1);
  assert.equal(countLines('a\n'), 1);
  assert.equal(countLines('a\nb'), 2);
  assert.equal(countLines('a\r\nb\r\n'), 2);
  assert.equal(countLines(lines(500)), 500);
});

test('a file of exactly the hard limit passes; one line more fails (L25)', () => {
  assert.equal(inspectSourceFile('/p/src/a.ts', '/p', lines(500)).violations.length, 0);
  assert.equal(inspectSourceFile('/p/src/a.ts', '/p', lines(501)).violations.length, 1);
  const crlf = Array.from({ length: 501 }, () => 'x').join('\r\n') + '\r\n';
  assert.match(inspectSourceFile('/p/src/a.ts', '/p', crlf).violations[0], /501 lines/);
});

test('decodeTextBuffer reads UTF-16LE/BE and UTF-8 BOM files', () => {
  const le = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('x: any', 'utf16le')]);
  assert.equal(decodeTextBuffer(le), 'x: any');
  const be = Buffer.from(Buffer.from('x: any', 'utf16le'));
  be.swap16();
  assert.equal(decodeTextBuffer(Buffer.concat([Buffer.from([0xfe, 0xff]), be])), 'x: any');
  assert.equal(decodeTextBuffer(Buffer.from('﻿ok', 'utf8')), 'ok');
});

test('explicit any: comments, strings, regex and JSX text are ignored (M29)', () => {
  const ts = [
    '// Note: any user may call this endpoint',
    'const s = "Error: any value is rejected";',
    '/* we never cast as any here */',
    'const r = /a: any/;',
    'const t = `x: any ${1}`;',
    'const p = Promise.any([a]);',
    'const o = { any: 1 };',
    'const v = any.foo;',
    'const w = any?.bar;',
  ].join('\n');
  assert.deepEqual(inspectSourceFile('/p/src/a.ts', '/p', ts).violations, []);
  const tsx = 'export const C = () => <p>Warning: any unsaved changes will be lost</p>;\nconst g = <T,>(x: T) => x;\n';
  assert.deepEqual(inspectSourceFile('/p/src/c.tsx', '/p', tsx).violations, []);
});

test('explicit any: generics, unions, tuples, defaults, return types and .mts/.cts are caught (M29)', () => {
  const offenders = [
    'let a: Record<string, any> = {};',
    'const m = new Map<string, any>();',
    'let u: string | any;',
    'let p: Promise<any | null>;',
    'function f<T = any>() {}',
    'let t: [any, string];',
    'type F = (...args: unknown[]) => any;',
    'let x = y as any;',
    'let z = <any>w;',
    'type C<T> = T extends string ? any : never;',
    'let q: any[] = [];',
  ];
  for (const code of offenders) {
    assert.equal(inspectSourceFile('/p/src/x.ts', '/p', code).violations.length, 1, code);
  }
  assert.equal(inspectSourceFile('/p/src/x.mts', '/p', 'let x: any;').violations.length, 1);
  assert.equal(inspectSourceFile('/p/src/x.cts', '/p', 'let x: any;').violations.length, 1);
  assert.equal(inspectSourceFile('/p/src/x.d.mts', '/p', 'let x: any;').violations.length, 0);
  const jsxExpr = 'export const C = () => <div>{(x as any).y}</div>;';
  assert.equal(inspectSourceFile('/p/src/c.tsx', '/p', jsxExpr).violations.length, 1);
});

test('stripNonCode keeps offsets and line breaks', () => {
  const src = 'a // c\nb "s"\n`t${x}`';
  const out = stripNonCode(src);
  assert.equal(out.length, src.length);
  assert.equal(out.split('\n').length, 3);
  assert.match(out, /\$\{x\}/);
});

test('line-limit exemptions follow the policy: tests, schema/types, declarations (M30)', () => {
  const big = lines(601);
  for (const rel of ['tests/test_big.py', 'pkg/big_test.go', 'app/big_test.py', 'src/__tests__/big.ts',
    'src/types.ts', 'src/user.schema.ts', 'src/user.types.ts', 'src/a.test.ts', 'src/a.d.ts']) {
    assert.deepEqual(inspectSourceFile(`/p/${rel}`, '/p', big).violations, [], rel);
  }
  assert.equal(inspectSourceFile('/p/src/install.js', '/p', big).violations.length, 1, 'only the kit installer is exempt');
  assert.equal(inspectSourceFile(path.join(__dirname, 'install.js'), path.dirname(__dirname), big).violations.length, 0);
});

test('console.log exemption uses project-relative segments only (L20)', () => {
  const warn = (abs, base, code, root) => inspectSourceFile(abs, base, code, undefined, { projectRoot: root }).warnings;
  assert.equal(warn('/p/client/src/main.ts', '/p', 'console.log(1);', '/p').length, 1);
  assert.equal(warn('/p/clinic/app.js', '/p', 'console.log(1);', '/p').length, 1);
  assert.equal(warn('/x/cli/webapp/src/app.ts', '/x/cli/webapp', 'console.log(1);', '/x/cli/webapp').length, 1);
  assert.equal(warn('/p/cli/tool.js', '/p', 'console.log(1);', '/p').length, 0);
  assert.equal(warn('/p/scripts/build.js', '/p', 'console.log(1);', '/p').length, 0);
  assert.equal(warn('/p/src/app.ts', '/p', '// console.log(state)\nconst s = "call console.log(x)";', '/p').length, 0);
});

test('check fails with exit 2 on a missing path, an option-like path or a non-source file (M27)', () => {
  withProject((root, home) => {
    const missing = runCheck(path.join(root, 'nope'), { silent: true, homeDir: home });
    assert.equal(missing.exitCode, EXIT_USAGE);
    assert.equal(missing.passed, false);
    assert.equal(runCheck('--help', { silent: true, homeDir: home }).exitCode, EXIT_USAGE);
    const doc = write(root, 'GUIDE.md', lines(600, '# doc'));
    assert.equal(runCheck(doc, { silent: true, homeDir: home }).exitCode, EXIT_USAGE);
    const png = write(root, 'logo.png', lines(900, 'binary'));
    assert.equal(runCheck(png, { silent: true, homeDir: home }).exitCode, EXIT_USAGE);
    assert.equal(runCheckCli(['--bogus'], { cwd: root, homeDir: home, silent: true }), EXIT_USAGE);
    assert.equal(runCheckCli(['a', 'b'], { cwd: root, homeDir: home, silent: true }), EXIT_USAGE);
  });
});

test('check skips venv/vendor/out/target folders and honours --ignore (M31)', () => {
  withProject((root, home) => {
    write(root, 'app/main.py', 'print("hi")\n');
    for (const rel of ['venv/Lib/site-packages/pip/big.py', 'vendor/github.com/acme/huge.go',
      'out/extension.js', 'target/debug/gen.rs', 'env/lib/x.py', 'generated/big.ts']) {
      write(root, rel, lines(900));
    }
    const plain = runCheck(root, { silent: true, homeDir: home, useGitIgnore: false });
    assert.deepEqual(plain.violations.map((v) => v.split(':')[0]), [path.join('generated', 'big.ts')]);
    const ignored = runCheckCli([root, '--ignore', 'generated', '--no-gitignore'], { homeDir: home, silent: true });
    assert.equal(ignored, 0);
  });
});

test('check applies global settings and the nearest .boomopen.json from any subfolder (M28)', () => {
  withProject((root, home) => {
    write(root, 'src/mod.ts', lines(451));
    const loose = runCheck(path.join(root, 'src'), { silent: true, homeDir: home, cwd: root });
    assert.equal(loose.passed, true, 'pragmatic default: 451 lines is only a warning');

    write(home, '.boomopen/settings.json', JSON.stringify({ codingStandards: { preset: 'strict' } }));
    const strictGlobal = runCheck(path.join(root, 'src'), { silent: true, homeDir: home, cwd: root });
    assert.equal(strictGlobal.passed, false, 'global strict preset must apply');

    fs.rmSync(path.join(home, '.boomopen'), { recursive: true, force: true });
    write(root, '.boomopen.json', JSON.stringify({ codingStandards: { preset: 'strict' } }));
    const fromSubfolder = runCheck(path.join(root, 'src'), { silent: true, homeDir: home, cwd: home });
    assert.equal(fromSubfolder.passed, false, 'workspace config found by walking up from src/');
  });
});

test('a file that cannot be read fails the check instead of crashing it (M26)', () => {
  withProject((root, home) => {
    write(root, 'src/ok.ts', 'export const OK = 1;\n');
    const locked = write(root, 'src/locked.ts', 'export const LOCKED = 1;\n');
    const originalRead = fs.readFileSync;
    fs.readFileSync = function patchedRead(file, ...rest) {
      if (path.resolve(String(file)) === locked) throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
      return originalRead.call(this, file, ...rest);
    };
    try {
      const result = runCheck(root, { silent: true, homeDir: home, cwd: home, useGitIgnore: false });
      assert.equal(result.exitCode, 1);
      assert.ok(result.violations.some((v) => /locked\.ts: could not be read \(EACCES/.test(v)), result.violations.join('\n'));
    } finally {
      fs.readFileSync = originalRead;
    }
  });
});

test('--strict-phase (and --no-stubs) catches deferred TODOs, hollow stubs/mocks, and test gaming', () => {
  const todoCode = 'export function calc(x: number): number {\n  // TODO: implement tax calculation\n  return x;\n}\n';
  assert.equal(inspectSourceFile('/p/src/calc.ts', '/p', todoCode).violations.length, 0);
  const strictTodo = inspectSourceFile('/p/src/calc.ts', '/p', todoCode, undefined, { strictPhase: true });
  assert.equal(strictTodo.violations.length, 1);
  assert.match(strictTodo.violations[0], /deferred TODO\/FIXME\/PLACEHOLDER/);

  const stubCode = 'export function save(): void {\n  throw new Error("Not implemented yet");\n}\n';
  const strictStub = inspectSourceFile('/p/src/save.ts', '/p', stubCode, undefined, { strictPhase: true });
  assert.equal(strictStub.violations.length, 1);
  assert.match(strictStub.violations[0], /hollow stub\/mock detected/);

  const prodMockCode = 'import { vi } from "vitest";\nexport const fn = vi.fn();\n';
  const strictProdMock = inspectSourceFile('/p/src/service.ts', '/p', prodMockCode, undefined, { strictPhase: true });
  assert.equal(strictProdMock.violations.length, 1);
  assert.match(strictProdMock.violations[0], /test mock\/spy in production file/);

  const skippedTest = 'import { test, expect } from "vitest";\ntest.skip("auth flow", () => {\n  expect(true).toBe(true);\n});\n';
  const strictTest = inspectSourceFile('/p/src/auth.test.ts', '/p', skippedTest, undefined, { strictPhase: true });
  assert.equal(strictTest.violations.length, 1);
  assert.match(strictTest.violations[0], /test gaming \/ skipped test detected/);

  const vacuousTest = 'import { test, expect } from "vitest";\ntest("auth flow", () => {\n  expect(true).toBe(true);\n});\n';
  const strictVacuous = inspectSourceFile('/p/src/auth.test.ts', '/p', vacuousTest, undefined, { strictPhase: true });
  assert.equal(strictVacuous.violations.length, 1);
  assert.match(strictVacuous.violations[0], /vacuous expect\(true\)\.toBe\(true\)/);

  withProject((root, home) => {
    write(root, 'src/pay.ts', stubCode);
    assert.equal(runCheckCli([root, '--no-gitignore'], { homeDir: home, silent: true }), 0);
    assert.equal(runCheckCli([root, '--no-gitignore', '--strict-phase'], { homeDir: home, silent: true }), 1);
    assert.equal(runCheckCli([root, '--no-gitignore', '--no-stubs'], { homeDir: home, silent: true }), 1);
  });

  // Prose comments with "placeholder" or multiple block comments must not false-positive
  const cleanProse = [
    '/** Header comment */',
    '/** Copy tree with placeholder replacement */',
    'export function render(todoList: string[]): string {',
    '  return todoList.join(",");',
    '}',
  ].join('\n');
  assert.deepEqual(inspectSourceFile('/p/src/clean.ts', '/p', cleanProse, undefined, { strictPhase: true }).violations, []);
});
