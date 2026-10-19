import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, readFile, realpath } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

// Exercise the Action's installed commands; no JAVA_HOME or PATH repair here.
const artifacts = join(import.meta.dir, '../../artifacts/native-toolchain-pins')
await mkdir(artifacts, { recursive: true })
const cli = process.env.PANTRY_TEST_CLI ? resolve(process.env.PANTRY_TEST_CLI) : undefined
const owned = cli ? await mkdtemp(join(tmpdir(), 'pantry-native-pins-')) : undefined
const env = owned ? { ...process.env, HOME: join(owned, 'home'), XDG_DATA_HOME: join(owned, 'data'), XDG_CACHE_HOME: join(owned, 'cache'), JAVA_HOME: undefined, NO_COLOR: '1' } : process.env
const proof: Record<string, unknown> = { passed: false }
async function run(name: string, args: string[], timeout = 120_000): Promise<string> {
  const child = Bun.spawn(args, { cwd: owned || process.cwd(), env, stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(timeout) })
  const [code, stdout, stderr] = await Promise.all([
    child.exited, new Response(child.stdout).text(), new Response(child.stderr).text(),
  ])
  await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, 0, `${name}: ${stdout}\n${stderr}`)
  return stdout + stderr
}

try {
  if (owned) await mkdir(join(owned, 'home'), { recursive: true })
  const executable = cli || Bun.which('pantry')
  assert(executable, 'Pantry must be available on the Action PATH')
  proof.cliSha256 = Bun.SHA256.hash(await readFile(executable), 'hex')
  proof.cliVersion = (await run('cli-version', [executable, '--version'])).trim()
  if (process.env.PANTRY_EXPECT_VERSION) assert.equal(String(proof.cliVersion).split(/\s+/)[1], process.env.PANTRY_EXPECT_VERSION)
  if (cli && owned) {
    await run('install', [cli, 'install', 'openjdk.org@17.0.20.8', 'android.com/cmdline-tools@14742923.0.0', '--no-save'], 600_000)
    env.PATH = `${join(owned, 'pantry/.bin')}:${process.env.PATH ?? ''}`
  }
  const compiler = await run('javac', ['javac', '-version'])
  proof.compiler = compiler.trim()
  assert.match(compiler.trim(), /(?:^|\n)javac 17\.0\.20\b/)
  const runtime = await run('java', ['java', '-XshowSettings:properties', '-version'])
  const javaHome = runtime.match(/^\s*java\.home\s*=\s*(.+)$/m)?.[1]?.trim()
  proof.javaHome = javaHome
  proof.environmentJavaHome = env.JAVA_HOME
  assert(javaHome && /\/openjdk\.org\/v17\.0\.20\.8(?:\/|$)/.test(javaHome.replaceAll('\\', '/')), `Unexpected JVM home: ${javaHome}`)
  if (!cli) {
    assert(env.JAVA_HOME, 'The selected JDK must be activated for Java-dependent launchers')
    assert.equal(await realpath(env.JAVA_HOME), await realpath(javaHome))
  }
  const manager = await run('sdkmanager', ['sdkmanager', '--version'])
  assert.match(manager.trim(), /(?:^|\n)\d+(?:\.\d+)*\s*$/)
  Object.assign(proof, { compiler: compiler.trim(), javaHome, sdkmanager: manager.trim(), passed: true })
}
finally {
  if (owned) await rm(owned, { recursive: true, force: true })
  proof.cleaned = !!owned
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
