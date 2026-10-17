import assert from 'node:assert/strict'
import { mkdir, mkdtemp, lstat, rename, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installPackage } from '../../packages/ts-pantry/src/installer'

assert.equal(process.platform, 'win32')
const artifacts = join(import.meta.dir, '../../artifacts/windows-native-tools')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Windows '))
const proof: Record<string, unknown> = {}
async function run(name: string, command: string[]): Promise<string> {
  const child = Bun.spawn(command, { cwd: root, env: { ...process.env, NO_COLOR: '1' }, stdout: 'pipe', stderr: 'pipe' })
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
  const source = join(root, 'fixture.zig')
  await Bun.write(source, 'const std = @import("std"); pub fn main() void { std.debug.print("NATIVE_ZIG_STDLIB_OK\\n", .{}); }\n')
  for (const phase of ['installed', 'relocated']) {
    const alias = join(tree, '.bin/zig.exe')
    assert((await lstat(alias)).isSymbolicLink())
    assert.equal((await run(`${phase}-version`, [alias, 'version'])).trim(), '0.17.0')
    const output = join(root, `${phase}.exe`)
    await run(`${phase}-compile`, [alias, 'build-exe', source, '-OReleaseSafe', `-femit-bin=${output}`])
    assert.equal((await run(`${phase}-execute`, [output])).trim(), 'NATIVE_ZIG_STDLIB_OK')
    if (phase === 'installed') {
      const moved = join(root, 'moved pantry')
      await rename(tree, moved)
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
