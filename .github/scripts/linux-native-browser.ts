import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveNativeExecutable } from '../../packages/action/src/native-executable'

assert.equal(process.platform, 'linux')
assert.notEqual(process.getuid?.(), 0, 'Exercise installation as an unprivileged user')
assert(process.env.PANTRY_TEST_CLI, 'Supply the actual source Linux CLI')
const cli = resolve(process.env.PANTRY_TEST_CLI)
const artifacts = join(import.meta.dir, '../../artifacts/linux-native-browser')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Chrome '))
const env = { ...process.env, XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache'), PANTRY_VERBOSE: '1', NO_COLOR: '1' }
const proof: Record<string, unknown> = { passed: false, cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }

async function run(name: string, args: string[], timeout = 30_000): Promise<string> {
  const stdout = join(artifacts, `${name}.stdout.log`)
  const stderr = join(artifacts, `${name}.stderr.log`)
  const child = Bun.spawn(args, { cwd: root, env, stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(timeout) })
  const code = await child.exited
  const output = await Bun.file(stdout).text() + await Bun.file(stderr).text()
  if (name === 'install')
    assert.match(output, /\[verbose:installer\]/, 'Named native installs must preserve --verbose diagnostics')
  assert.equal(code, 0, `${name}: ${output}`)
  return output
}

try {
  proof.cliVersion = (await run('cli-version', [cli, '--version'])).trim()
  // The exact published package and ordinary install path used by HQ's CI.
  // A private XDG tree prevents an inherited installation from hiding failure.
  await run('install', [cli, 'install', 'git-scm.org@2.53.0', 'google.com/chrome@155.0.8059.84', '--no-save', '--verbose'], 600_000)
  const entry = join(root, 'pantry/.bin/google-chrome-stable')
  const executable = resolveNativeExecutable(entry)
  assert(executable.startsWith(`${root}/pantry/`), 'Use the installed package, not a host browser')
  proof.executableSha256 = Bun.SHA256.hash(await readFile(executable), 'hex')
  proof.version = (await run('chrome-version', [entry, '--version'])).trim()
  assert.match(String(proof.version), /\b155\.0\.8059\.84\b/)
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
