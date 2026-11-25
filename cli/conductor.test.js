'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  findExecutableOnPath,
  resolveSpawnTarget,
  probeEngines,
  resolveCrossFamilyEngine,
  buildEngineInvocation,
  unwrapEngineStdout,
  captureReadOnlySnapshot,
  verifyAndRestoreReadOnlySnapshot,
  executeEngineSubprocess,
} = require('./conductor-engines.js');
const {
  COUNCIL_TASK_DIRECTIVES,
  resolveEngineForRole,
  dispatchToEngine,
  runMultiEngineCouncil,
  runConductorCli,
} = require('./conductor.js');
const { tempDir, removeDir } = require('./sandbox.test-helper.js');

const ALL_AVAILABLE_PROBES = {
  claude: { available: true, bin: 'claude' },
  codex: { available: true, bin: 'codex' },
  antigravity: { available: true, bin: 'agy' },
  cursor: { available: false, bin: null },
  copilot: { available: false, bin: null },
};

test('probeEngines, buildEngineInvocation, and resolveCrossFamilyEngine enforce Author != Critic', () => {
  const probes = probeEngines({ mockProbes: ALL_AVAILABLE_PROBES });
  assert.equal(probes.claude.available, true);
  assert.equal(probes.claude.family, 'anthropic');
  assert.equal(probes.codex.family, 'openai');
  assert.equal(probes.antigravity.family, 'google');
  assert.equal(probes.cursor.fallbackMode, 'queue');

  // Author != Critic cross-family resolution
  assert.equal(resolveCrossFamilyEngine('claude', ['claude', 'codex', 'antigravity'], 'reviewer'), 'codex');
  assert.equal(resolveCrossFamilyEngine('codex', ['claude', 'codex', 'antigravity'], 'reviewer'), 'claude');
  assert.equal(resolveCrossFamilyEngine('gemini', ['antigravity', 'claude'], 'debugger'), 'claude');

  // CLI invocations (read-only vs write)
  const claudeRo = buildEngineInvocation('claude', '/tmp/task.md', { readOnly: true });
  assert.equal(claudeRo.mode, 'cli');
  assert.ok(claudeRo.args.includes('--allowedTools'));

  const codexRw = buildEngineInvocation('codex', '/tmp/task.md', { readOnly: false });
  assert.ok(codexRw.args.includes('workspace-write'));

  const cursorQueue = buildEngineInvocation('cursor', '/tmp/task.md', { available: false, queueFile: '/tmp/q.md' });
  assert.equal(cursorQueue.mode, 'queue');
  assert.equal(cursorQueue.queueFile, '/tmp/q.md');
});

test('resolveEngineForRole handles auto affinity, cross_family, and council policies', () => {
  const probes = probeEngines({ mockProbes: ALL_AVAILABLE_PROBES });
  const settings = { engines: { researcher: 'council', planner: 'auto', coder: 'auto', debugger: 'cross_family', reviewer: 'cross_family', councilMembers: 'claude,codex,antigravity' } };
  const resCouncil = resolveEngineForRole('researcher', settings, probes);
  assert.equal(resCouncil.mode, 'council');
  assert.deepEqual(resCouncil.councilEngines, ['claude', 'codex', 'antigravity']);
  assert.equal(resolveEngineForRole('planner', settings, probes).primaryEngine, 'claude');
  assert.equal(resolveEngineForRole('coder', settings, probes).primaryEngine, 'codex');
  assert.equal(resolveEngineForRole('reviewer', settings, probes, { authorEngine: 'codex' }).primaryEngine, 'claude');
});

test('dispatchToEngine performs 3-Tier quota failover and restores mutated READ_ONLY_FILES via SHA-256 snapshot', async () => {
  const root = tempDir('boomopen-conductor-dispatch-');
  try {
    const protectedFile = path.join(root, 'src', 'contract.ts');
    fs.mkdirSync(path.dirname(protectedFile), { recursive: true });
    const originalContent = 'export interface AuthContract { id: string; }\n';
    fs.writeFileSync(protectedFile, originalContent, 'utf8');

    const attempts = [];
    const res = await dispatchToEngine({
      cwd: root, runId: 'test-dispatch-01', role: 'coder', engine: 'codex', prompt: 'Implement auth handler',
      ownedFiles: ['src/auth.ts'], readOnlyFiles: ['src/contract.ts'], mockProbes: ALL_AVAILABLE_PROBES,
      mockRunner: async (engine) => {
        attempts.push(engine);
        if (engine === 'codex') return { ok: false, exitCode: 1, stdout: '', stderr: 'HTTP 429 Too Many Requests: rate limit exceeded' };
        fs.writeFileSync(protectedFile, 'export interface AuthContract { hacked: any; }\n', 'utf8');
        return { ok: true, exitCode: 0, stdout: 'Implemented src/auth.ts cleanly.', stderr: '' };
      },
    });
    assert.equal(res.ok, true);
    assert.deepEqual(attempts, ['codex', 'antigravity']);
    assert.equal(res.engineUsed, 'antigravity');
    assert.equal(res.failoverHistory.length, 1);
    assert.equal(res.failoverHistory[0].engine, 'codex');
    assert.equal(res.failoverHistory[0].isQuotaError, true);
    assert.deepEqual(res.restoredReadOnlyFiles, ['src/contract.ts']);
    assert.equal(fs.readFileSync(protectedFile, 'utf8'), originalContent);
    assert.ok(fs.existsSync(res.resultPath));
  } finally { removeDir(root); }
});

test('runMultiEngineCouncil runs Claude, Codex & Antigravity in parallel and synthesizes Consensus + Unique Insights', async () => {
  const root = tempDir('boomopen-conductor-council-');
  try {
    const mockOutputs = {
      claude: ['# Claude Architecture Analysis', '- Enforce strict JWT RS256 token validation at the API gateway', '- Add rate limiting on /auth/login to prevent credential stuffing', '- Isolate tenant session keys using per-tenant HKDF salt'].join('\n'),
      codex: ['# Codex Implementation Analysis', '- Enforce strict JWT RS256 token validation at the API gateway', '- Add rate limiting on /auth/login to prevent credential stuffing', '- Use constant-time crypto.timingSafeEqual for HMAC signature checks'].join('\n'),
      antigravity: ['# Antigravity Ecosystem Analysis', '- Enforce strict JWT RS256 token validation at the API gateway', '- Support WebAuthn passkey fallback for passwordless UX'].join('\n'),
    };
    const councilRes = await runMultiEngineCouncil({
      cwd: root, runId: 'test-council-01', task: 'research', engines: ['claude', 'codex', 'antigravity'],
      prompt: 'Design zero-trust authentication architecture', mockProbes: ALL_AVAILABLE_PROBES,
      mockRunner: async (engine, invocation) => {
        assert.equal(invocation.readOnly, true, `${engine} in council mode must run read-only`);
        return { ok: true, exitCode: 0, stdout: mockOutputs[engine], stderr: '', durationMs: 12 };
      },
    });
    assert.equal(councilRes.ok, true);
    assert.deepEqual(councilRes.engines, ['claude', 'codex', 'antigravity']);
    assert.ok(fs.existsSync(councilRes.synthesisPath));
    assert.ok(fs.existsSync(councilRes.jsonPath));
    assert.equal(councilRes.consensus.length, 2);
    assert.deepEqual(councilRes.consensus[0].engines, ['claude', 'codex', 'antigravity']);
    assert.deepEqual(councilRes.consensus[1].engines, ['claude', 'codex']);
    assert.equal(councilRes.uniqueByEngine.claude.length, 1);
    assert.match(councilRes.uniqueByEngine.claude[0], /HKDF salt/);
    assert.equal(councilRes.uniqueByEngine.codex.length, 1);
    assert.match(councilRes.uniqueByEngine.codex[0], /timingSafeEqual/);
    assert.equal(councilRes.uniqueByEngine.antigravity.length, 1);
    assert.match(councilRes.uniqueByEngine.antigravity[0], /WebAuthn/);

    const reportMd = fs.readFileSync(councilRes.synthesisPath, 'utf8');
    for (const pat of [/MULTI-ENGINE COUNCIL SYNTHESIS REPORT \(RESEARCH\)/, /## 1\. 🤝 Multi-Engine Consensus/, /Unanimous \/ Multi-Engine Consensus/, /## 2\. 💡 Unique Blind-Spot Insights/, /Unique Blind-Spot Insights by Engine/, /## 3\. 🔴 Contradictions & Evidence Arbitration/, /## 4\. 🏆 Final Actionable Conclusion/, /Final Synthesized Verdict & Actionable Conclusion/]) {
      assert.match(reportMd, pat);
    }
    assert.ok(fs.existsSync(councilRes.aliasSynthesisPath));
    assert.equal(await runConductorCli(['probe', '--json'], { cwd: root, mockProbes: ALL_AVAILABLE_PROBES, silent: true }), 0);
    assert.equal(await runConductorCli(['status', '--json'], { cwd: root, silent: true }), 0);
    assert.equal(await runConductorCli(['help'], { cwd: root, silent: true }), 0);
    assert.equal(await runConductorCli(['dispatch'], { cwd: root, silent: true }), 2);
    assert.equal(await runConductorCli(['council'], { cwd: root, silent: true }), 2);

    const customOut = path.join(root, 'custom-council.md');
    const cliCouncilCode = await runConductorCli(['council', '--role', 'plan', '--prompt', 'Plan API', '--read-only-files', 'src/a.ts', '--output', customOut], {
      cwd: root, mockProbes: ALL_AVAILABLE_PROBES, mockRunner: async () => ({ ok: true, exitCode: 0, stdout: '- Use OpenAPI 3.1 schema validation', stderr: '', durationMs: 5 }), silent: true,
    });
    assert.equal(cliCouncilCode, 0);
    assert.ok(fs.existsSync(customOut));
  } finally { removeDir(root); }
});

test('COUNCIL_TASK_DIRECTIVES covers all 6 core council tasks including review and debug', async () => {
  assert.deepEqual(Object.keys(COUNCIL_TASK_DIRECTIVES), ['research', 'brainstorm', 'plan', 'design', 'review', 'debug']);
  const root = tempDir('boomopen-conductor-directives-');
  try {
    for (const [task, header] of [['review', '[COUNCIL REVIEWER REQUIREMENTS]'], ['debug', '[COUNCIL DEBUGGER REQUIREMENTS]']]) {
      const res = await runMultiEngineCouncil({
        cwd: root, runId: `directive-${task}`, task, engines: ['claude', 'codex'], prompt: `Audit auth module (${task})`, mockProbes: ALL_AVAILABLE_PROBES,
        mockRunner: async (_engine, _inv, ctx) => {
          assert.ok(ctx.promptText.includes(header), `Expected ${task} council prompt to include ${header}`);
          return { ok: true, exitCode: 0, stdout: `- Verified ${task} invariant at src/auth.ts:42`, stderr: '', durationMs: 4 };
        },
      });
      assert.equal(res.ok, true);
      assert.equal(res.consensus.length, 1);
    }
  } finally { removeDir(root); }
});

test('Windows .cmd npm shim resolution unwraps Node script and ignores extensionless POSIX wrappers on win32', () => {
  const binDir = tempDir('boomopen-win-bin-');
  try {
    // Extensionless POSIX wrapper should be ignored on win32
    fs.writeFileSync(path.join(binDir, 'codex'), '#!/bin/sh\necho posix\n', 'utf8');
    assert.equal(findExecutableOnPath('codex', { PATH: binDir }, 'win32'), null);

    // Add npm .cmd shim + target .js entrypoint
    const jsEntry = path.join(binDir, 'node_modules', '@openai', 'codex', 'bin', 'codex.js');
    fs.mkdirSync(path.dirname(jsEntry), { recursive: true });
    fs.writeFileSync(jsEntry, 'console.log("codex-js");\n', 'utf8');
    const cmdFile = path.join(binDir, 'codex.cmd');
    fs.writeFileSync(cmdFile, '@ECHO off\r\n"%_prog%"  "%dp0%\\node_modules\\@openai\\codex\\bin\\codex.js" %*\r\n', 'utf8');

    const found = findExecutableOnPath('codex', { PATH: binDir }, 'win32');
    assert.equal(found, cmdFile);

    const target = resolveSpawnTarget('codex', ['--version'], { PATH: binDir }, 'win32');
    assert.equal(target.command, process.execPath);
    assert.equal(target.args[0], jsEntry);
    assert.equal(target.args[1], '--version');
    assert.equal(target.shell, false);
  } finally {
    removeDir(binDir);
  }
});

test('regressions S1-BUG-01, S1-BUG-02, S1-BUG-06 & S1-BUG-11: Windows .cmd spaces/& safety, JSON/JSONL unwrapping, directory snapshots, designer affinity, and strict CLI flags', async () => {
  const root = tempDir('boomopen-conductor-reg-');
  try {
    // Designer role affinity -> antigravity primary
    const probes = probeEngines({ mockProbes: ALL_AVAILABLE_PROBES });
    assert.equal(resolveEngineForRole('designer', {}, probes).primaryEngine, 'antigravity');

    // S1-BUG-01: Non-npm .cmd wrapper in path containing spaces and `&` symbols (no shell injection / no DEP0190)
    const trickyDir = path.join(root, 'Dir With Spaces & Symbols (v1)', 'bin dir');
    fs.mkdirSync(trickyDir, { recursive: true });
    const echoJs = path.join(trickyDir, 'runner.js');
    fs.writeFileSync(echoJs, 'console.log(JSON.stringify({ args: process.argv.slice(2) }));\n', 'utf8');
    const customCmd = path.join(trickyDir, 'cursor-agent.cmd');
    fs.writeFileSync(customCmd, `@echo off\r\n"${process.execPath}" "${echoJs}" %*\r\n`, 'utf8');

    const winTarget = resolveSpawnTarget('cursor-agent', ['-p', 'hello & world'], { PATH: trickyDir }, 'win32');
    assert.equal(winTarget.shell, false);
    assert.equal(winTarget.windowsVerbatimArguments, true);
    if (process.platform === 'win32') {
      const promptPath = path.join(trickyDir, 'prompt file.md');
      const inv = buildEngineInvocation('cursor', promptPath, { available: true, bin: 'cursor-agent', readOnly: true });
      const subRes = await executeEngineSubprocess('cursor', inv, {
        cwd: trickyDir,
        env: { ...process.env, PATH: `${trickyDir};${process.env.PATH || process.env.Path || ''}` },
        platform: 'win32',
        timeoutMs: 10000,
      });
      assert.equal(subRes.ok, true, subRes.stderr);
      assert.match(subRes.stdout, /prompt file\.md/);
    }

    // S1-BUG-02: Unwrap real --output-format json (Claude/Antigravity) and --json JSONL (Codex) in council
    assert.equal(unwrapEngineStdout('claude', '{"type":"result","result":"- Bullet one"}'), '- Bullet one');
    const councilRes = await runMultiEngineCouncil({
      cwd: root,
      runId: 'json-unwrap-council',
      task: 'research',
      engines: ['claude', 'codex', 'antigravity'],
      prompt: 'Audit JWT rotation',
      mockProbes: ALL_AVAILABLE_PROBES,
      mockRunner: async (engine) => {
        if (engine === 'claude') {
          return { ok: true, exitCode: 0, stdout: JSON.stringify({ type: 'result', result: '# Claude\n- Enforce short-lived JWTs with rotation\n- Isolate signing keys' }) };
        }
        if (engine === 'codex') {
          return {
            ok: true,
            exitCode: 0,
            stdout: [
              JSON.stringify({ type: 'thread.started', thread_id: 'th_1' }),
              JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: '# Codex\n- Enforce short-lived JWTs with rotation\n- Use EdDSA verification' } }),
            ].join('\n'),
          };
        }
        return { ok: true, exitCode: 0, stdout: JSON.stringify({ response: '# Antigravity\n- Enforce short-lived JWTs with rotation\n- Support passkeys' }) };
      },
    });
    assert.equal(councilRes.consensus.length, 1);
    assert.deepEqual(councilRes.consensus[0].engines, ['claude', 'codex', 'antigravity']);
    assert.ok(!JSON.stringify(councilRes.uniqueByEngine).includes('thread.started'));

    // S1-BUG-11: Recursive directory snapshot & restore guard
    const contractsDir = path.join(root, 'contracts');
    fs.mkdirSync(path.join(contractsDir, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(contractsDir, 'api.ts'), 'export const SAFE = 1;\n', 'utf8');
    fs.writeFileSync(path.join(contractsDir, 'nested', 'dto.ts'), 'export interface Dto { id: string; }\n', 'utf8');
    const snap = captureReadOnlySnapshot(root, ['contracts']);
    fs.writeFileSync(path.join(contractsDir, 'api.ts'), 'export const HACKED = 999;\n', 'utf8');
    fs.rmSync(path.join(contractsDir, 'nested', 'dto.ts'));
    fs.writeFileSync(path.join(contractsDir, 'rogue.ts'), 'export const ROGUE = true;\n', 'utf8');
    const guard = verifyAndRestoreReadOnlySnapshot(root, snap);
    assert.equal(guard.restored, true);
    assert.equal(fs.readFileSync(path.join(contractsDir, 'api.ts'), 'utf8'), 'export const SAFE = 1;\n');
    assert.ok(fs.existsSync(path.join(contractsDir, 'nested', 'dto.ts')));
    assert.ok(!fs.existsSync(path.join(contractsDir, 'rogue.ts')));

    // S1-BUG-06: Strict CLI option validation
    assert.equal(await runConductorCli(['probe', '--unknown-flag'], { cwd: root, silent: true }), 2);
    assert.equal(await runConductorCli(['dispatch', '--prompt', 'ok', '--output', '--json'], { cwd: root, silent: true }), 2);

    // V3-CLI-01: verifyAndRestoreReadOnlySnapshot handles file-replaced-by-dir (no EISDIR) and prunes empty rogue dirs
    fs.rmSync(path.join(contractsDir, 'api.ts'));
    fs.mkdirSync(path.join(contractsDir, 'api.ts', 'sub'), { recursive: true });
    fs.writeFileSync(path.join(contractsDir, 'api.ts', 'sub', 'x.txt'), 'collision', 'utf8');
    fs.mkdirSync(path.join(contractsDir, 'empty-rogue', 'deep'), { recursive: true });
    const v3Guard = verifyAndRestoreReadOnlySnapshot(root, snap);
    assert.equal(v3Guard.restored, true);
    assert.ok(fs.lstatSync(path.join(contractsDir, 'api.ts')).isFile());
    assert.equal(fs.readFileSync(path.join(contractsDir, 'api.ts'), 'utf8'), 'export const SAFE = 1;\n');
    assert.ok(!fs.existsSync(path.join(contractsDir, 'empty-rogue')));
    assert.ok(v3Guard.violations.includes('contracts/empty-rogue') || v3Guard.violations.includes('contracts/empty-rogue/deep'));
  } finally {
    removeDir(root);
  }
});

test('engine sandboxing flags (agy vs gemini, claude, codex), Codex last agent_message unwrap, --dry-run, dual --read-only, role inference, council workspace guard, %~dp0 shim, PATHEXT & win32 timeout', async () => {
  const root = tempDir('boomopen-conductor-sec-');
  try {
    const pFile = '/tmp/handoff.md';
    const instr = `Read and strictly execute the task in "${pFile}"`;

    // 1. Antigravity: agy vs gemini(.cmd/.exe)
    assert.deepEqual(buildEngineInvocation('antigravity', pFile, { bin: 'agy', readOnly: true }).args, ['-p', instr, '--mode', 'plan', '--sandbox', '--output-format', 'json']);
    assert.deepEqual(buildEngineInvocation('antigravity', pFile, { bin: 'agy', readOnly: false }).args, ['-p', instr, '--mode', 'auto', '--dangerously-skip-permissions', '--output-format', 'json']);
    assert.deepEqual(buildEngineInvocation('antigravity', pFile, { bin: 'C:\\npm\\gemini.cmd', readOnly: true }).args, ['-p', instr, '--output-format', 'json', '--approval-mode', 'plan']);
    assert.deepEqual(buildEngineInvocation('antigravity', pFile, { bin: 'gemini.exe', readOnly: false }).args, ['-p', instr, '--output-format', 'json', '-y']);

    // 2. Claude Code: readOnly plan + disallowedTools + --no-session-persistence
    const claudeRo = buildEngineInvocation('claude', pFile, { readOnly: true });
    assert.deepEqual(claudeRo.args, ['-p', instr, '--output-format', 'json', '--permission-mode', 'plan', '--disallowedTools', 'Write,Edit,Bash,PowerShell,NotebookEdit', '--allowedTools', 'Read,Grep,Glob,WebSearch,WebFetch', '--no-session-persistence']);
    const claudeRw = buildEngineInvocation('claude', pFile, { readOnly: false });
    assert.deepEqual(claudeRw.args, ['-p', instr, '--output-format', 'json', '--dangerously-skip-permissions', '--no-session-persistence']);

    // 3. Codex: readOnly omits --full-auto and enforces -s read-only + approval_policy="never" + --ephemeral
    const codexRo = buildEngineInvocation('codex', pFile, { readOnly: true });
    assert.ok(!codexRo.args.includes('--full-auto'));
    assert.deepEqual(codexRo.args, ['exec', '--ephemeral', '--json', '-s', 'read-only', '-c', 'approval_policy="never"', instr]);
    const codexRw = buildEngineInvocation('codex', pFile, { readOnly: false });
    assert.deepEqual(codexRw.args, ['exec', '--ephemeral', '--full-auto', '--json', '-s', 'workspace-write', instr]);

    // 4. Codex JSONL unwrap returns ONLY the last non-empty agent_message (not intermediate chatter)
    const multiCodexJsonl = [
      JSON.stringify({ type: 'thread.started', thread_id: 'th_99' }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Let me inspect the files first...' } }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'Checking edge cases...' } }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: '# Final Answer\n- Verified invariant' } }),
      JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: '   ' } }),
      JSON.stringify({ type: 'turn.completed' }),
    ].join('\n');
    assert.equal(unwrapEngineStdout('codex', multiCodexJsonl), '# Final Answer\n- Verified invariant');

    // 5. Read-only role auto-inference + --dry-run + dual-mode --read-only
    let spawned = false;
    const dryReviewer = await dispatchToEngine({
      cwd: root, role: 'security-engineer', engine: 'codex', prompt: 'Audit SQLi', dryRun: true,
      mockProbes: ALL_AVAILABLE_PROBES, mockRunner: async () => { spawned = true; return { ok: true }; },
    });
    assert.equal(spawned, false);
    assert.equal(dryReviewer.dryRun, true);
    assert.equal(dryReviewer.readOnly, true);
    assert.ok(!dryReviewer.invocation.args.includes('--full-auto'));

    for (const roRole of ['reviewer', 'security-engineer', 'performance-engineer', 'spec-reconciler', 'scouter', 'researcher', 'auditor']) {
      const r = await dispatchToEngine({ cwd: root, role: roRole, prompt: 'Check', dryRun: true, mockProbes: ALL_AVAILABLE_PROBES });
      assert.equal(r.readOnly, true, `${roRole} with 0 ownedFiles must infer readOnly: true`);
    }
    const coderDry = await dispatchToEngine({ cwd: root, role: 'coder', prompt: 'Write', dryRun: true, mockProbes: ALL_AVAILABLE_PROBES });
    assert.equal(coderDry.readOnly, false);

    // CLI dual-mode --read-only (boolean at end / before --flag, and file list) + --read-only-mode + --dry-run
    assert.equal(await runConductorCli(['dispatch', '--role', 'coder', '--prompt', 'Audit', '--read-only', '--dry-run'], { cwd: root, mockProbes: ALL_AVAILABLE_PROBES, silent: true }), 0);
    assert.equal(await runConductorCli(['dispatch', '--read-only', '--role', 'coder', '--prompt', 'Audit', '--dry-run'], { cwd: root, mockProbes: ALL_AVAILABLE_PROBES, silent: true }), 0);
    assert.equal(await runConductorCli(['dispatch', '--read-only-mode', '--role', 'coder', '--prompt', 'Audit', '--read-only', 'src/a.ts,src/b.ts', '--dry-run'], { cwd: root, mockProbes: ALL_AVAILABLE_PROBES, silent: true }), 0);

    // 6. Council workspace mutation guard even when readOnlyFiles is empty
    const trackedSrc = path.join(root, 'src', 'service.ts');
    fs.mkdirSync(path.dirname(trackedSrc), { recursive: true });
    fs.writeFileSync(trackedSrc, 'export const v = 1;\n', 'utf8');
    const councilGuardRes = await runMultiEngineCouncil({
      cwd: root, runId: 'council-ws-guard', task: 'review', engines: ['claude', 'codex'], prompt: 'Review service',
      mockProbes: ALL_AVAILABLE_PROBES,
      mockRunner: async (engine) => {
        if (engine === 'codex') {
          fs.writeFileSync(trackedSrc, 'export const v = 999;\n', 'utf8');
          fs.writeFileSync(path.join(root, 'rogue-untracked.txt'), 'hacked\n', 'utf8');
        }
        return { ok: true, exitCode: 0, stdout: '- Validate service input schema', stderr: '' };
      },
    });
    assert.equal(fs.readFileSync(trackedSrc, 'utf8'), 'export const v = 1;\n');
    assert.equal(fs.existsSync(path.join(root, 'rogue-untracked.txt')), false);
    assert.ok(councilGuardRes.workspaceMutations.includes('src/service.ts'));
    assert.ok(councilGuardRes.workspaceMutations.includes('rogue-untracked.txt'));

    // 7. Windows %~dp0tool.js (no extra slash), PATHEXT, hasOwnProperty(env, 'PATH'), and win32 tree timeout
    const shimDir = path.join(root, 'shim-bin');
    fs.mkdirSync(shimDir, { recursive: true });
    const toolJs = path.join(shimDir, 'tool.js');
    fs.writeFileSync(toolJs, 'console.log("ok");\n', 'utf8');
    fs.writeFileSync(path.join(shimDir, 'agy.cmd'), '@ECHO off\r\nnode "%~dp0tool.js" %*\r\n', 'utf8');
    fs.writeFileSync(path.join(shimDir, 'custom.ps1'), '# ps1\n', 'utf8');
    assert.equal(findExecutableOnPath('agy', { PATH: '', Path: shimDir }, 'win32'), null, 'Explicit empty PATH must not fall back to Path');
    assert.equal(findExecutableOnPath('custom', { PATH: shimDir, PATHEXT: '.PS1;.CMD' }, 'win32'), path.join(shimDir, 'custom.ps1'));
    const unwrapped = resolveSpawnTarget('agy', ['-p', 'hi'], { PATH: shimDir }, 'win32');
    assert.equal(unwrapped.command, process.execPath);
    assert.equal(unwrapped.args[0], toolJs);

    const hangJs = path.join(shimDir, 'hang.js');
    fs.writeFileSync(hangJs, 'const { spawn } = require("node:child_process"); spawn(process.execPath, ["-e", "setInterval(()=>{}, 1000)"], { stdio: "inherit" }); setInterval(()=>{}, 1000);\n', 'utf8');
    const hangRes = await executeEngineSubprocess('codex', { mode: 'cli', command: process.execPath, args: [hangJs] }, { cwd: shimDir, timeoutMs: 250 });
    assert.equal(hangRes.ok, false);
    assert.equal(hangRes.exitCode, 124);
    assert.match(hangRes.stderr, /Timed out after 250ms/);
  } finally {
    removeDir(root);
  }
});
