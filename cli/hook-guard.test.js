'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const HOOK_PATH = path.resolve(__dirname, '..', 'platforms', 'antigravity', 'hooks', 'validate-tool-call.mjs');
const STOP_HOOK_PATH = path.resolve(__dirname, '..', 'platforms', 'antigravity', 'hooks', 'stop-quality-gate.mjs');
const EXIT_BLOCK = 2;

const loadHook = () => import(pathToFileURL(HOOK_PATH).href);
const loadStopHook = () => import(pathToFileURL(STOP_HOOK_PATH).href);

const MUST_BLOCK = [
  'rm -rf /',
  'rm -rf /*',
  'sudo rm -rf --no-preserve-root /',
  'rm -r -f /',
  'rm --recursive --force /',
  '/bin/rm -rf /',
  'rm -rf "/"',
  '"rm" -rf /',
  'r\\m -rf /',
  '$(echo rm) -rf /',
  'bash -c "rm -rf /"',
  "sh -c 'rm -rf /'",
  '(rm -rf /)',
  'env rm -rf /',
  'sudo -u root rm -rf /',
  'echo hi\nrm -rf /',
  'cd /tmp && rm -rf ~',
  'rm -rf $HOME',
  'rm -rf "${HOME}/"',
  'rm -rf /usr',
  'Remove-Item C:\\ -Recurse -Force',
  'Remove-Item -Force -Recurse C:\\',
  'Remove-Item -Recurse -Force "C:\\"',
  'Remove-Item -Recurse -Force C:/',
  'Remove-Item -Rec -For C:\\',
  'rm -r -fo C:\\',
  'Remove-Item -Path $env:USERPROFILE -Recurse',
  'cmd /c format C:',
  'rd /s /q C:\\',
  'rmdir /s /q C:\\Windows',
  'del /f /s /q C:\\*',
  'powershell -Command "Remove-Item -Recurse -Force C:\\"',
  'mkfs.ext4 /dev/sda1',
  '/sbin/mkfs.ext4 /dev/sda',
  'dd if=/dev/zero of="/dev/sda" bs=1M',
  'dd if=/dev/zero of=/dev/mmcblk0',
  'dd if=/dev/zero of=/dev/disk0',
  'cat /dev/zero > /dev/sda',
  'find / -delete',
  'find ~ -type f -exec rm {} +',
  'chmod -R 777 /',
  'chown -R nobody /',
  ':(){ :|:& };:',
  'Format-Volume -DriveLetter C',
  // Git Bash / WSL / Cygwin drive roots, home folders by path, '..' above home, cd + wildcard
  'rm -rf /c/',
  'rm -rf /c/Windows',
  'rm -rf /mnt/c',
  'rm -rf /cygdrive/c/*',
  'rm -rf /home/kelly',
  'rm -rf /Users/kelly/',
  'rm -rf C:\\Users\\kelly',
  'rm -rf ~/..',
  'rm -rf $HOME/..',
  'rm -rf "$HOME"/../',
  'rm -rf ~/projects/..',
  'rm -rf /tmp/../',
  'cd / && rm -rf *',
  'cd ~ && rm -rf .',
  'cd && rm -rf ./*',
  // PowerShell: a trailing backslash inside double quotes is a path separator, not an escape
  'Remove-Item -Recurse -Force "$env:USERPROFILE\\"',
  'Remove-Item -Recurse -Force $env:USERPROFILE\\',
  // ${VAR} is one word: the home variable itself must still be caught
  'rm -rf ${HOME}',
  'rm -rf ${HOME}/',
  'rm -rf $USERPROFILE',
  'rm -rf ${USERPROFILE}',
  'bash -c "rm -rf ${HOME}"',
  // Joined cmd.exe flags, positional PowerShell, Windows system env vars, comma arrays, sh -c --
  'rd /s/q C:\\',
  'rmdir /s/q C:\\Windows',
  'del /f/s/q C:\\*',
  'powershell "Remove-Item -Recurse -Force C:\\"',
  'pwsh -NoProfile -NonInteractive "Remove-Item -Recurse -Force C:\\"',
  'Remove-Item -Recurse -Force $env:SystemDrive\\',
  'Remove-Item -Recurse -Force $env:SystemRoot',
  'Remove-Item -Recurse -Force $env:windir',
  'rd /s /q %SystemDrive%\\',
  'rd /s /q %SystemRoot%',
  'Remove-Item -Path .\\dist,C:\\ -Recurse -Force',
  'sh -c -- "rm -rf /"',
  'rm -rf /c',
  'rmdir -rf /c',
  'rd -rf /d',
  'powershell -Command "Remove-Item -Recurse -Force \\"C:\\\\\\""',
  '1..3 | ForEach-Object { if ($_) { try { if (1) { if (2) { if (3) { if (4) { Remove-Item C:\\ -Recurse -Force } } } } } catch {} } }',
];

const MUST_ALLOW = [
  'npm test',
  '1..10 | ForEach-Object { if ($_) { try { if (1) { if (2) { if (3) { if (4) { if (5) { Write-Host $_ } } } } } } catch { Write-Error $_ } } }',
  'python -c "import os; p = \'C:\\\\temp\'; print(\\"rm -rf /\\")"',
  'cd C:\\repo && node -e "const msg = \\"rm -rf /\\"; console.log(msg)"',
  'rm -rf node_modules',
  'rm -rf ./dist /tmp/build-cache',
  'rm -rf /tmp/boomopen-test',
  'git commit -m "fix: rm -rf / guard"',
  "git commit -m 'docs: block `rm -rf /` in hook'",
  'git commit -m "fix(guard): block (rm -rf /) subshell"',
  'git commit -m "fix(guard): block { rm -rf /; } group"',
  'git commit -m "docs: block :(){ :|:& };: fork bomb"',
  'git commit -m "docs: block > /dev/sda redirect"',
  "grep -rn '> /dev/sda' cli/",
  'Remove-Item -Recurse -Force $env:SystemDrive\\Temp\\build-cache',
  "echo 'rm -rf /'",
  'Remove-Item -Recurse -Force .\\dist; Set-Location C:\\',
  'Remove-Item -Recurse -Force C:\\Users\\me\\project\\dist',
  'rm -f /tmp/file.txt',
  'find . -name "*.log" -delete',
  'chmod -R 755 ./scripts',
  'dd if=disk.img of=backup.img',
  'ls -la /',
  'rm -rf /home/kelly/project/build',
  'rm -rf ~/projects/app/node_modules',
  'rm -rf ~/../kelly/tmp',
  'cd /tmp/build && rm -rf *',
  'cd ~/proj && rm -rf dist',
  'cd / && ls',
  'Remove-Item -Recurse -Force "$env:USERPROFILE\\project\\dist"',
  // a ${VAR} path is not a filesystem root
  'rm -rf ${BUILD_DIR}/*',
  'rm -rf ${OUT}/',
  'rm -rf ${HOME}/projects/app/dist',
];

test('evaluateCommand blocks catastrophic commands in many spellings', async () => {
  const { evaluateCommand } = await loadHook();
  for (const command of MUST_BLOCK) {
    assert.equal(evaluateCommand(command).allowed, false, `should block: ${command}`);
  }
});

test('evaluateCommand allows ordinary commands, including safe deletes', async () => {
  const { evaluateCommand } = await loadHook();
  for (const command of MUST_ALLOW) {
    assert.equal(evaluateCommand(command).allowed, true, `should allow: ${command}`);
  }
});

test('extractCommand understands Claude, Gemini, Antigravity, OpenAI and argv payloads', async () => {
  const { extractCommand } = await loadHook();
  assert.equal(extractCommand({ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }), 'rm -rf /');
  assert.equal(
    extractCommand({ hookEventName: 'PreToolUse', toolCall: { id: 'toolu_01', name: 'run_command', args: { CommandLine: 'npm test' } } }),
    'npm test'
  );
  assert.equal(
    extractCommand({ toolCall: { id: 'toolu_02', name: 'run_command', arguments: JSON.stringify({ CommandLine: 'rm -rf /' }) } }),
    'rm -rf /'
  );
  assert.equal(extractCommand({ tool_args: { CommandLine: 'ls' } }), 'ls');
  assert.equal(extractCommand({ arguments: JSON.stringify({ command: 'pwd' }) }), 'pwd');
  assert.equal(extractCommand({ tool_input: { command: ['rm', '-rf', '/'] } }), 'rm -rf /');
  assert.equal(extractCommand({ command: 'whoami' }), 'whoami');
  assert.equal(extractCommand({ tool_input: { file_path: 'a.txt' } }), '');
  assert.equal(extractCommand({ hookEventName: 'PreToolUse', toolCall: { id: 'toolu_03', name: 'read_file', args: { Path: 'a.txt' } } }), '');
});

function runHook(stdin, scriptPath = HOOK_PATH) {
  return spawnSync(process.execPath, [scriptPath], { input: stdin, encoding: 'utf8', timeout: 30000 });
}

test('hook process blocks with exit code 2 and a deny decision, allows silently with 0', () => {
  const blocked = runHook(JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }));
  assert.equal(blocked.status, EXIT_BLOCK, blocked.stderr);
  assert.match(blocked.stderr, /BLOCKED/);
  assert.equal(JSON.parse(blocked.stdout).hookSpecificOutput.permissionDecision, 'deny');

  const allowed = runHook(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'npm test' } }));
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.equal(allowed.stdout, '');

  const notJson = runHook('rm -rf /');
  assert.equal(notJson.status, EXIT_BLOCK, 'raw non-JSON input is evaluated as a command');
});

test('Antigravity 2.0 PreToolUse protocol outputs JSON decision allow/deny on stdout with exit 0', () => {
  const agyAllowed = runHook(
    JSON.stringify({ hookEventName: 'PreToolUse', toolCall: { id: 't1', name: 'run_command', args: { CommandLine: 'npm test' } } })
  );
  assert.equal(agyAllowed.status, 0, agyAllowed.stderr);
  assert.deepEqual(JSON.parse(agyAllowed.stdout), { decision: 'allow' });

  const agyNonShell = runHook(
    JSON.stringify({ hookEventName: 'PreToolUse', toolCall: { id: 't2', name: 'read_file', args: { Path: 'README.md' } } })
  );
  assert.equal(agyNonShell.status, 0, agyNonShell.stderr);
  assert.deepEqual(JSON.parse(agyNonShell.stdout), { decision: 'allow' });

  const agyBlocked = runHook(
    JSON.stringify({ hookEventName: 'PreToolUse', toolCall: { id: 't3', name: 'run_command', args: { CommandLine: 'Remove-Item C:\\ -Recurse -Force' } } })
  );
  assert.equal(agyBlocked.status, 0, 'Antigravity hooks.json expects clean exit 0 with JSON deny decision on stdout');
  assert.match(agyBlocked.stderr, /BLOCKED/);
  const parsedDeny = JSON.parse(agyBlocked.stdout);
  assert.equal(parsedDeny.decision, 'deny');
  assert.match(parsedDeny.reason, /BLOCKED by BoomOpen Workflow Kit/);
});

test('hook fails closed on an oversized payload (Claude exit 2, Antigravity exit 0 JSON deny, Cursor beforeShellExecution)', () => {
  const huge = JSON.stringify({ tool_input: { command: 'echo ' + 'x'.repeat(9 * 1024 * 1024) } });
  const result = runHook(huge);
  assert.equal(result.status, EXIT_BLOCK);

  const agyHuge = JSON.stringify({
    hookEventName: 'PreToolUse',
    toolCall: { id: 't_big', name: 'run_command', args: { CommandLine: 'echo ' + 'x'.repeat(9 * 1024 * 1024) } },
  });
  const agyResult = runHook(agyHuge);
  assert.equal(agyResult.status, 0, 'Antigravity oversized payload must follow Antigravity JSON deny protocol');
  assert.equal(JSON.parse(agyResult.stdout).decision, 'deny');

  const cursorOk = runHook(JSON.stringify({ hook_event_name: 'beforeShellExecution', command: 'npm test' }));
  assert.equal(cursorOk.status, 0);
  assert.deepEqual(JSON.parse(cursorOk.stdout), { permission: 'allow' });

  const cursorDeny = runHook(JSON.stringify({ hook_event_name: 'beforeShellExecution', command: 'rm -rf /' }));
  assert.equal(cursorDeny.status, EXIT_BLOCK);
  assert.equal(JSON.parse(cursorDeny.stdout).permission, 'deny');
});

test('stop-quality-gate handles PreCompact snapshots and Stop Tier-1 checks across Antigravity and Claude Code', async () => {
  const { evaluateStopGate } = await loadStopHook();
  const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-stop-gate-'));
  try {
    spawnSync('git', ['init', repoDir], { encoding: 'utf8', windowsHide: true });
    fs.mkdirSync(path.join(repoDir, '.boomopen'), { recursive: true });
    fs.writeFileSync(path.join(repoDir, '.boomopen', 'project-ledger.json'), JSON.stringify({ currentPhase: 2 }));

    const compactOut = runHook(
      JSON.stringify({ hook_event_name: 'PreCompact', cwd: repoDir, trigger: 'auto', session_id: 's-1' }),
      STOP_HOOK_PATH
    );
    assert.equal(compactOut.status, 0, compactOut.stderr);
    assert.deepEqual(JSON.parse(compactOut.stdout), {});
    const snap = JSON.parse(fs.readFileSync(path.join(repoDir, '.boomopen', 'compact-snapshot.json'), 'utf8'));
    assert.equal(snap.hasProjectLedger, true);
    assert.equal(snap.currentPhase, 2);

    // Dirty TypeScript file with explicit `any` violation triggers continue (Antigravity) / block (Claude)
    fs.mkdirSync(path.join(repoDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(repoDir, 'src', 'bad.ts'), 'export const bad = (x: any) => x;\n');

    assert.deepEqual(evaluateStopGate({ hookEventName: 'Stop', cwd: repoDir, continuationActive: true }), {});
    assert.deepEqual(evaluateStopGate({ hook_event_name: 'Stop', cwd: repoDir, stop_hook_active: true }), {});

    const agyStop = runHook(JSON.stringify({ hookEventName: 'Stop', cwd: repoDir, terminationReason: 'NO_TOOL_CALL' }), STOP_HOOK_PATH);
    assert.equal(agyStop.status, 0);
    const agyDecision = JSON.parse(agyStop.stdout);
    assert.equal(agyDecision.decision, 'continue');
    assert.match(agyDecision.reason, /explicit 'any'/);

    const claudeStop = runHook(JSON.stringify({ hook_event_name: 'Stop', cwd: repoDir }), STOP_HOOK_PATH);
    assert.equal(claudeStop.status, 0);
    const claudeDecision = JSON.parse(claudeStop.stdout);
    assert.equal(claudeDecision.decision, 'block');
    assert.match(claudeDecision.reason, /explicit 'any'/);

    // Fix the violation -> gate passes with {}
    fs.writeFileSync(path.join(repoDir, 'src', 'bad.ts'), 'export const clean = (x: unknown) => String(x);\n');
    const cleanStop = runHook(JSON.stringify({ hook_event_name: 'Stop', cwd: repoDir }), STOP_HOOK_PATH);
    assert.equal(cleanStop.status, 0);
    assert.deepEqual(JSON.parse(cleanStop.stdout), {});
  } finally {
    fs.rmSync(repoDir, { recursive: true, force: true });
  }
});

test('hook still runs when started through a copy in another folder (installed location)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomopen-hook-'));
  try {
    const copy = path.join(dir, 'boomopen-workflow-kit', 'hooks', 'validate-tool-call.mjs');
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(HOOK_PATH, copy);
    const result = runHook(JSON.stringify({ tool_input: { command: 'rm -rf /' } }), copy);
    assert.equal(result.status, EXIT_BLOCK);

    // Started through a junction / symlinked folder: the entry-point check must resolve real paths
    const link = path.join(dir, 'linked-hooks');
    fs.symlinkSync(path.dirname(copy), link, 'junction');
    const viaLink = runHook(JSON.stringify({ tool_input: { command: 'rm -rf /' } }), path.join(link, 'validate-tool-call.mjs'));
    assert.equal(viaLink.status, EXIT_BLOCK, 'a linked path must not make the hook fail open');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
