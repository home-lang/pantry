import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

assert.equal(process.platform, 'win32', 'This fixture must run on a real Windows host')
const cli = resolve(process.env.PANTRY_TEST_CLI!)
const action = resolve(process.env.PANTRY_TEST_ACTION!)
const artifacts = resolve('artifacts/windows-native-runtime')
await mkdir(artifacts, { recursive: true })
const owned = await mkdtemp(join(tmpdir(), 'pantry-windows-runtime-'))
const proof: Record<string, unknown> = { passed: false, sourceCliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }
const env = { ...process.env, HOME: join(owned, 'home'), USERPROFILE: join(owned, 'home'), XDG_DATA_HOME: join(owned, 'data'), XDG_CACHE_HOME: join(owned, 'cache'), PATH: `${join(owned, 'missing-bin')};${join(owned, 'pantry/.bin')};${process.env.PATH ?? process.env.Path ?? ''}`, NO_COLOR: '1' }

async function run(name: string, args: string[], cwd: string, extra: Record<string, string> = {}, expected = 0): Promise<string> {
  const child = Bun.spawn(args, { cwd, env: { ...env, ...extra }, stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(180_000) })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, expected, `${name}: ${stdout}\n${stderr}`)
  return stdout + stderr
}

try {
  await mkdir(env.USERPROFILE, { recursive: true })
  const sdkBinary = await realpath(process.execPath)
  assert.equal((await run('sdk-bun-version', [sdkBinary, '--version'], owned)).trim(), '1.4.3')
  // Pantry's SDK lays out the official Windows archive with bun.exe at its
  // root. Reuse those exact bytes in an isolated tree for the native installer.
  const packageRoot = join(owned, 'pantry/bun.com/v1.4.3')
  await mkdir(packageRoot, { recursive: true })
  const runtime = join(packageRoot, 'bun.exe')
  await cp(sdkBinary, runtime)
  const originalHash = Bun.SHA256.hash(await readFile(runtime), 'hex')
  const version = await run('source-cli-version', [cli, '--version'], owned)
  proof.sourceCliVersion = version.trim()
  await run('native-named-install', [cli, 'install', 'bun.sh@1.4.3', '--no-save', '--verbose'], owned)
  await run('native-repeat-install', [cli, 'install', 'bun.sh@1.4.3', '--no-save', '--verbose'], owned)
  await Bun.write(join(owned, 'pantry.jsonc'), JSON.stringify({ dependencies: { 'bun.sh': '1.4.3' } }))
  await mkdir(join(owned, 'local-dependency'))
  await Bun.write(join(owned, 'local-dependency/package.json'), JSON.stringify({ name: '@fixture/local', version: '1.0.0', main: 'index.cjs' }))
  await Bun.write(join(owned, 'local-dependency/index.cjs'), 'module.exports = 143\n')
  await Bun.write(join(owned, 'package.json'), JSON.stringify({ name: 'windows-runtime-fixture', private: true, dependencies: { '@fixture/local': 'file:./local-dependency' } }))
  await run('native-workspace-install', [cli, 'install', '--no-save', '--verbose'], owned)
  const activated = join(owned, 'pantry/.bin/bun.exe')
  assert.equal((await run('native-activated-bun', [activated, '--version'], owned)).trim(), '1.4.3')
  assert.equal((await run('native-delegated-local-dependency', [activated, '-e', 'console.log(require("@fixture/local"))'], owned)).trim(), '143')
  assert.equal(Bun.SHA256.hash(await readFile(runtime), 'hex'), originalHash)
  proof.sdkRuntimeSha256 = originalHash
  proof.nativeRuntimeReusedAndActivated = true

  // Exercise the bundled Action itself. A missing local dependency must fail
  // inside workspace installation, before the Action can say setup completed.
  const negative = join(owned, 'required-workspace-failure')
  await mkdir(negative)
  await Bun.write(join(negative, 'package.json'), JSON.stringify({ name: 'required-workspace-fixture', private: true, dependencies: { '@fixture/missing': 'file:./missing' } }))
  const output = await run('action-required-workspace-failure', [sdkBinary, action], negative, {
    INPUT_VERSION: '0.11.99', INPUT_INSTALL: 'true', INPUT_PACKAGES: '', INPUT_CACHE: 'false',
    INPUT_SERVICES: '', INPUT_RELEASE: 'false', INPUT_PUBLISH: '',
  }, 1)
  assert.match(output, /Installing workspace dependencies/)
  assert.doesNotMatch(output, /Setup complete/)
  assert.doesNotMatch(output, /warning.*pantry workspace install failed/)
  proof.requiredWorkspaceFailurePropagated = true
  proof.passed = true
}
finally {
  await rm(owned, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
