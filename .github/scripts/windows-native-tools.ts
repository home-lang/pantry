import assert from 'node:assert/strict'
import { mkdir, mkdtemp, lstat, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installPackage } from '../../packages/ts-pantry/src/installer'

assert.equal(process.platform, 'win32')
const artifacts = join(import.meta.dir, '../../artifacts/windows-native-tools')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Windows '))
const proof: Record<string, unknown> = {}
async function run(name: string, command: string[], environment: Record<string, string> = {}): Promise<string> {
  const child = Bun.spawn(command, { cwd: root, env: { ...process.env, NO_COLOR: '1', ...environment }, stdout: 'pipe', stderr: 'pipe' })
  const timeout = setTimeout(() => child.kill(), 180_000)
  try {
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
    assert.equal(code, 0, `${name}: ${stderr}`)
    return stdout + stderr
  }
  finally { clearTimeout(timeout) }
}
try {
  const cli = process.env.PANTRY_TEST_CLI
  assert(cli, 'The all-platform build must supply the actual Windows CLI')
  const version = (await run('cli-version', [cli, '--version'])).trim()
  assert.match(version, /^pantry \d+\.\d+\.\d+ \([0-9a-f]+\)$/)
  proof.cliVersion = version
  let tree = join(root, 'pantry')
  await installPackage('ziglang.org', '0.17.0', { installDir: tree })
  const compilerSha256 = Bun.SHA256.hash(await readFile(join(tree, '.bin/zig.exe')), 'hex')
  proof.compilerSha256 = compilerSha256
  const source = join(root, 'fixture.zig')
  await Bun.write(source, 'const std = @import("std"); pub fn main() void { std.debug.print("NATIVE_ZIG_STDLIB_OK\\n", .{}); }\n')
  for (const phase of ['installed', 'relocated']) {
    const alias = join(tree, '.bin/zig.exe')
    assert((await lstat(alias)).isSymbolicLink())
    assert.equal(Bun.SHA256.hash(await readFile(alias), 'hex'), compilerSha256)
    assert.equal((await run(`${phase}-version`, [alias, 'version'])).trim(), '0.17.0')
    const output = join(root, `${phase}.exe`)
    await run(`${phase}-compile`, [alias, 'build-exe', source, '-OReleaseSafe', `-femit-bin=${output}`])
    assert.equal((await run(`${phase}-execute`, [output])).trim(), 'NATIVE_ZIG_STDLIB_OK')
    if (phase === 'installed') {
      const moved = join(root, 'moved pantry')
      // Exercise the Windows user operation itself. Bun 1.4.3's rename rejects
      // this installed tree with EPERM while the native Windows move succeeds.
      // One native move must complete; source absence and the next phase's
      // symlink, byte identity, compile and execution assertions stay required.
      await run('relocate-prefix', ['powershell', '-NoProfile', '-NonInteractive', '-Command', 'Move-Item -LiteralPath $env:PANTRY_RELOCATION_SOURCE -Destination $env:PANTRY_RELOCATION_DESTINATION -ErrorAction Stop'], {
        PANTRY_RELOCATION_SOURCE: tree,
        PANTRY_RELOCATION_DESTINATION: moved,
      })
      await assert.rejects(lstat(tree), { code: 'ENOENT' })
      proof.prefixRelocatedByNativeWindows = true
      tree = moved
    }
  }
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
