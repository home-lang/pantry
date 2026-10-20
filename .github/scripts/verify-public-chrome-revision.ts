import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveNativeExecutable } from '../../packages/action/src/native-executable'
import { verifyChromeRuntime } from '../../packages/ts-pantry/src/recipes/props/google.com/chrome/health'

const pantryVersion = '0.11.103'
const source = '986749281fbc27190192d6349eee633dbdc054ff'
const chromeVersion = '155.0.8059.84.1'
const domain = 'google.com/chrome'
const artifacts = resolve(import.meta.dir, '../../artifacts/public-chrome-revision')
await mkdir(artifacts, { recursive: true })
assert(process.env.PANTRY_PUBLIC_CHROME_CLI, 'Supply the original published CLI from the immutable Action')
assert(!process.env.PANTRY_REGISTRY_URL, 'Use the actual public registry')
const cli = resolve(process.env.PANTRY_PUBLIC_CHROME_CLI)
const root = await mkdtemp(join(tmpdir(), 'pantry public Chrome revision '))
const proof: Record<string, unknown> = { passed: false, pantryVersion, source, chromeVersion, originalPublicCliAndSdk: true }

async function run(name: string, args: string[], cwd: string, environment: Record<string, string | undefined> = {}): Promise<string> {
  const stdout = join(artifacts, `${name}.stdout.log`)
  const stderr = join(artifacts, `${name}.stderr.log`)
  const child = Bun.spawn(args, {
    cwd, env: { ...process.env, ...environment },
    stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(600_000),
  })
  const code = await child.exited
  const output = await readFile(stdout, 'utf8') + await readFile(stderr, 'utf8')
  assert.equal(code, 0, `${name}: ${output.slice(-8000)}`)
  return output
}

try {
  const version = (await run('cli-version', [cli, '--version'], root)).trim()
  assert(version.includes(`pantry ${pantryVersion} (${source.slice(0, 9)})`), version)
  proof.cliVersion = version
  proof.cliSha256 = Bun.SHA256.hash(await readFile(cli), 'hex')

  const metadataResponse = await fetch('https://registry.pantry.dev/binaries/google.com/chrome/metadata.json', { signal: AbortSignal.timeout(30_000) })
  assert.equal(metadataResponse.status, 200)
  const metadata = await metadataResponse.json() as { versions: Record<string, { platforms: Record<string, { tarball: string, sha256: string, size: number }> }> }
  const old = metadata.versions['155.0.8059.84']!.platforms['linux-x86-64']!
  assert.equal(old.sha256, '9dbebf26bc67c8c853a85d97d3baa81ac015926b070a0563425e540dda8d35f0')
  assert.equal(old.size, 194792339)
  const selected = metadata.versions[chromeVersion]!.platforms['linux-x86-64']!
  assert.match(selected.sha256, /^[a-f0-9]{64}$/)
  const url = new URL(selected.tarball, 'https://registry.pantry.dev/')
  assert.equal(url.origin, 'https://registry.pantry.dev')
  const response = await fetch(url, { signal: AbortSignal.timeout(300_000) })
  assert.equal(response.status, 200)
  assert(response.body)
  const hasher = new Bun.CryptoHasher('sha256')
  let bytes = 0
  const reader = response.body.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    bytes += value.byteLength
    hasher.update(value)
  }
  assert.equal(bytes, selected.size)
  assert.equal(hasher.digest('hex'), selected.sha256)
  proof.originalPublicArchive = { ...selected, bytesRead: bytes, fullSha256Passed: true }
  proof.acceptedOriginalUnchanged = { sha256: old.sha256, size: old.size }

  const cliRoot = join(root, 'cli-consumer')
  await mkdir(cliRoot)
  await run('cli-install', [cli, 'install', `${domain}@${chromeVersion}`, '--no-save', '--verbose'], cliRoot, {
    XDG_DATA_HOME: join(root, 'cli-data'), XDG_CACHE_HOME: join(root, 'cli-cache'), PANTRY_VERBOSE: '1',
  })
  const cliEntry = join(cliRoot, 'pantry/.bin/google-chrome-stable')
  proof.cliHealth = await verifyChromeRuntime(cliEntry, join(cliRoot, 'pantry'), resolveNativeExecutable(cliEntry))

  const sdkRoot = join(root, 'sdk-consumer')
  await mkdir(sdkRoot)
  await Bun.write(join(sdkRoot, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { 'ts-pantry': pantryVersion } }))
  await Bun.write(join(sdkRoot, 'bunfig.toml'), '[install]\nlinker = "hoisted"\n')
  await run('sdk-normal-install', [process.execPath, 'install'], sdkRoot)
  const lock = await readFile(join(sdkRoot, 'bun.lock'))
  await run('sdk-frozen-install', [process.execPath, 'install', '--frozen-lockfile'], sdkRoot)
  assert(lock.equals(await readFile(join(sdkRoot, 'bun.lock'))))
  const manifest = JSON.parse(await readFile(join(sdkRoot, 'node_modules/ts-pantry/package.json'), 'utf8'))
  assert.equal(manifest.version, pantryVersion)
  const sdkProof = join(artifacts, 'original-sdk-install.json')
  await Bun.write(join(sdkRoot, 'probe.ts'), `
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { installPackage } from 'ts-pantry'
const resolved = import.meta.resolve('ts-pantry')
const resolvedPath = resolved.startsWith('file:') ? fileURLToPath(resolved) : resolved
assert(resolvedPath.startsWith(import.meta.dir + '/node_modules/'), resolved)
const result = await installPackage('${domain}', '${chromeVersion}', { installDir: import.meta.dir + '/native', quiet: true })
assert.equal(result.version, '${chromeVersion}')
writeFileSync(process.env.PANTRY_PUBLIC_CHROME_SDK_PROOF!, JSON.stringify({ resolved, ...result }))
`)
  await run('sdk-native-install', [process.execPath, join(sdkRoot, 'probe.ts')], sdkRoot, {
    PANTRY_PUBLIC_CHROME_SDK_PROOF: sdkProof, XDG_DATA_HOME: join(root, 'sdk-data'), XDG_CACHE_HOME: join(root, 'sdk-cache'),
  })
  const sdk = JSON.parse(await readFile(sdkProof, 'utf8')) as { version: string, installPath: string }
  assert.equal(sdk.version, chromeVersion)
  assert(sdk.installPath.startsWith(`${sdkRoot}/native/`))
  const sdkEntry = join(sdkRoot, 'native/.bin/google-chrome-stable')
  proof.sdkHealth = await verifyChromeRuntime(sdkEntry, join(sdkRoot, 'native'), resolveNativeExecutable(sdkEntry))
  proof.sdk = sdk
  proof.normalAndFrozenSdkLocksUnchanged = true
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
