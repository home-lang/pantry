import assert from 'node:assert/strict'
import { mkdir, mkdtemp, lstat, rename, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { installPackage } from '../../packages/ts-pantry/src/installer'

assert.equal(process.platform, 'win32')
const artifacts = resolve('artifacts/windows-sdk-relocation-diagnostic')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry SDK relocation '))
const proof: Record<string, unknown> = { passed: false, bun: Bun.version }
const tree = join(root, 'pantry')
const moved = join(root, 'moved pantry')

async function run(name: string, command: string[]) {
  const child = Bun.spawn(command, { cwd: root, stdout: 'pipe', stderr: 'pipe', timeout: 180_000 })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, 0, `${name}: ${stderr}`)
  return stdout + stderr
}

try {
  await installPackage('ziglang.org', '0.17.0', { installDir: tree })
  const source = join(root, 'fixture.zig')
  await Bun.write(source, 'const std = @import("std"); pub fn main() void { std.debug.print("NATIVE_ZIG_STDLIB_OK\\n", .{}); }\n')
  const alias = join(tree, '.bin/zig.exe')
  assert((await lstat(alias)).isSymbolicLink())
  assert.equal((await run('installed-version', [alias, 'version'])).trim(), '0.17.0')
  const output = join(root, 'installed.exe')
  await run('installed-compile', [alias, 'build-exe', source, '-OReleaseSafe', `-femit-bin=${output}`])
  assert.equal((await run('installed-execute', [output])).trim(), 'NATIVE_ZIG_STDLIB_OK')
  try {
    await rename(tree, moved)
    proof.passed = true
  }
  catch (error) {
    proof.renameError = String(error)
    // This native call is diagnostic only. Never count a successful second
    // move as passing the original Bun rename or the required acceptance gate.
    const native = Bun.spawnSync(['powershell', '-NoProfile', '-Command', `
      $ErrorActionPreference = 'Stop'
      Get-Item -LiteralPath $env:PROBE_SOURCE, (Join-Path $env:PROBE_SOURCE '.bin'), (Join-Path $env:PROBE_SOURCE 'ziglang.org/v0.17.0'), (Join-Path $env:PROBE_SOURCE 'ziglang.org/v0.17.0/zig.exe') | Select-Object FullName, Attributes, LinkType, Target | ConvertTo-Json -Depth 4
      Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith($env:PROBE_ROOT, [System.StringComparison]::OrdinalIgnoreCase) } | Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine | ConvertTo-Json -Depth 4
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class NativeMove { [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] public static extern bool MoveFileEx(string source, string dest, uint flags); }'
      $ok = [NativeMove]::MoveFileEx($env:PROBE_SOURCE, $env:PROBE_DEST, 0)
      $code = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
      @{ moved = $ok; nativeError = $code } | ConvertTo-Json
    `], { env: { ...process.env, PROBE_ROOT: root, PROBE_SOURCE: tree, PROBE_DEST: moved }, stdout: 'pipe', stderr: 'pipe', timeout: 30_000 })
    await Bun.write(join(artifacts, 'native-filesystem-diagnostic.log'), native.stdout.toString() + native.stderr.toString())
    proof.nativeDiagnosticExit = native.exitCode
    throw error
  }
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
