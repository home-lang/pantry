import { existsSync, realpathSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { registryZigVersion } from '../src/zig-native-hash'

const root = resolve(import.meta.dir, '..')
const bootstrap = join(root, 'pantry/.bootstrap')
const pantryVersion = '0.11.119'
const installerSource = '6fbf7259c2764d18a12d915bf8bc68c500cb4931'
const installerSha256 = 'cfdd3374c97ef179c0d32e71b8fdfa394674e917d32e20c822fa083790fc0cfe'

async function run(command: string[], env = process.env): Promise<void> {
  const child = Bun.spawn(command, { cwd: root, env, stdin: 'ignore', stdout: 'inherit', stderr: 'inherit' })
  if (await child.exited !== 0) throw new Error(`Registry toolchain command failed: ${command[0]}`)
}

await mkdir(bootstrap, { recursive: true })
const pantry = process.env.PANTRY_BIN || join(bootstrap, 'bin', process.platform === 'win32' ? 'pantry.exe' : 'pantry')
if (!existsSync(pantry)) {
  if (process.env.PANTRY_BIN) throw new Error('The declared Pantry executable is unavailable')
  const response = await fetch(`https://raw.githubusercontent.com/pantry-pm/pantry/${installerSource}/public/install.sh`, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`The maintained Pantry installer returned HTTP ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (new Bun.CryptoHasher('sha256').update(bytes).digest('hex') !== installerSha256)
    throw new Error('The original Pantry installer identity did not match')
  const installer = join(bootstrap, 'install.sh')
  await writeFile(installer, bytes)
  await run(['bash', installer], { ...process.env, PANTRY_VERSION: pantryVersion, PANTRY_INSTALL_DIR: join(bootstrap, 'bin') })
}
const version = Bun.spawnSync([pantry, '--version'], { cwd: root, stdout: 'pipe', stderr: 'pipe', timeout: 10_000 })
if (version.exitCode !== 0 || version.stdout.toString().trim() !== `pantry ${pantryVersion} (${installerSource.slice(0, 9)})`)
  throw new Error(`Registry provisioning requires the qualified Pantry ${pantryVersion}`)
// This is Pantry's normal installation path, not a compiler downloader.
await run([pantry, 'install', '--no-save', `ziglang.org@${registryZigVersion}`])
// Activate the public Pantry environment instead of guessing a workspace's
// installation prefix. Resolve the symlink before recording the native binary.
const environment = Bun.spawnSync(['bash', '-euo', 'pipefail', '-c', 'eval "$("$1" env)"; command -v zig', 'registry-zig', pantry], {
  cwd: root, stdout: 'pipe', stderr: 'inherit', timeout: 30_000,
})
if (environment.exitCode !== 0) throw new Error('Pantry did not activate the declared registry compiler')
const zig = realpathSync(environment.stdout.toString().trim())
const probe = Bun.spawnSync([zig, 'version'], { cwd: root, stdout: 'pipe', stderr: 'pipe', timeout: 10_000 })
if (probe.exitCode !== 0 || probe.stdout.toString().trim() !== registryZigVersion)
  throw new Error('The installed registry compiler identity did not match')
await writeFile(join(root, 'pantry/registry-zig-path'), `${zig}\n`)
console.log(`Registry package hashing: Zig ${registryZigVersion} at ${zig}`)
