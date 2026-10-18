import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { recipe } from '../../packages/ts-pantry/src/recipes/android.com/cmdline-tools'

assert.equal(process.platform, 'linux')
assert(process.env.PANTRY_TEST_CLI, 'Supply the actual source Linux CLI')
const cli = resolve(process.env.PANTRY_TEST_CLI)
const artifacts = join(import.meta.dir, '../../artifacts/android-native-tools')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Android '))
const home = join(root, 'home')
const env: NodeJS.ProcessEnv = { ...process.env, HOME: home, XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache'), JAVA_HOME: undefined, NO_COLOR: '1', PANTRY_VERBOSE: '1' }
await mkdir(home, { recursive: true })
const proof: Record<string, unknown> = { cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }

async function run(name: string, command: string[]): Promise<string> {
  const child = Bun.spawn(command, { cwd: root, env, stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' })
  child.stdin.write('y\n'.repeat(100))
  child.stdin.end()
  const timeout = setTimeout(() => child.kill(), 600_000)
  try {
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
    assert.equal(code, 0, `${name}: ${stdout}\n${stderr}`)
    return stdout + stderr
  }
  finally { clearTimeout(timeout) }
}

try {
  proof.cliVersion = (await run('cli-version', [cli, '--version'])).trim()
  await run('android-install', [cli, 'install', 'android.com/cmdline-tools@14742923.0.0', '--no-save'])
  const bin = join(root, 'pantry/.bin')
  for (const name of recipe.programs ?? []) {
    const file = await stat(join(bin, name))
    assert(file.isFile() && file.size > 0, `Missing declared Android tool: ${name}`)
  }
  // Use the Java installed by Pantry, without accepting a host Java fallback.
  const java = await stat(join(bin, 'java'))
  assert(java.isFile() && java.size > 0, 'Pantry must supply the required Java runtime')
  env.PATH = `${bin}:${process.env.PATH ?? ''}`
  await run('java-version', [join(bin, 'java'), '-version'])
  // sdkmanager resolves its linked package and JVM through the normal SDK scripts.
  assert.match((await run('sdkmanager-version', [join(bin, 'sdkmanager'), '--version'])).trim(), /^\d+(?:\.\d+)*$/)
  env.ANDROID_HOME = join(root, 'managed SDK health')
  await run('sdkmanager-build-tools', [join(bin, 'sdkmanager'), `--sdk_root=${env.ANDROID_HOME}`, 'build-tools;35.0.0'])
  await run('apkanalyzer-help', [join(bin, 'apkanalyzer'), '--help'])
  proof.programs = recipe.programs
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
