import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// Exercise the Action's installed commands; no JAVA_HOME or PATH repair here.
const artifacts = join(import.meta.dir, '../../artifacts/native-toolchain-pins')
await mkdir(artifacts, { recursive: true })
async function run(name: string, args: string[]): Promise<string> {
  const child = Bun.spawn(args, { stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(120_000) })
  const [code, stdout, stderr] = await Promise.all([
    child.exited, new Response(child.stdout).text(), new Response(child.stderr).text(),
  ])
  await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, 0, `${name}: ${stdout}\n${stderr}`)
  return stdout + stderr
}

const compiler = await run('javac', ['javac', '-version'])
assert.match(compiler.trim(), /(?:^|\n)javac 17\.0\.20\b/)
const runtime = await run('java', ['java', '-XshowSettings:properties', '-version'])
const javaHome = runtime.match(/^\s*java\.home\s*=\s*(.+)$/m)?.[1]?.trim()
assert(javaHome && /\/openjdk\.org\/v17\.0\.20\.8(?:\/|$)/.test(javaHome.replaceAll('\\', '/')), `Unexpected JVM home: ${javaHome}`)
const manager = await run('sdkmanager', ['sdkmanager', '--version'])
assert.match(manager.trim(), /(?:^|\n)\d+(?:\.\d+)*\s*$/)
await Bun.write(join(artifacts, 'proof.json'), JSON.stringify({
  compiler: compiler.trim(), javaHome, sdkmanager: manager.trim(), passed: true,
}, null, 2) + '\n')
