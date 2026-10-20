import assert from 'node:assert/strict'
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, statfs } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveNativeExecutable } from '../../packages/action/src/native-executable'
import { verifyChromeRuntime } from '../../packages/ts-pantry/src/recipes/props/google.com/chrome/health'

const pantryVersion = process.env.PANTRY_PUBLIC_VERSION ?? ''
const source = process.env.PANTRY_PUBLIC_SOURCE ?? ''
assert.match(pantryVersion, /^\d+\.\d+\.\d+$/)
assert.match(source, /^[a-f0-9]{40}$/)
assert.equal(process.env.GITHUB_REF, `refs/tags/v${pantryVersion}`, 'Public compatibility must use the original immutable release tag')
assert.equal(process.env.GITHUB_SHA, source)
const chromeVersion = '155.0.8059.84.1'
const domain = 'google.com/chrome'
const artifacts = resolve(import.meta.dir, '../../artifacts/public-chrome-revision')
await mkdir(artifacts, { recursive: true })
assert(process.env.PANTRY_PUBLIC_CHROME_CLI, 'Supply the original published CLI from the immutable Action')
assert(!process.env.PANTRY_REGISTRY_URL, 'Use the actual public registry')
const cli = resolve(process.env.PANTRY_PUBLIC_CHROME_CLI)
const root = await mkdtemp(join(tmpdir(), 'pantry public Chrome revision '))
const proof: Record<string, unknown> = { passed: false, pantryVersion, source, chromeVersion, originalPublicCliAndSdk: true }
proof.originalActionIndexSha256 = Bun.SHA256.hash(await readFile(resolve(import.meta.dir, '../../packages/action/dist/index.js')), 'hex')
const diskPhases: Record<string, { beforeFreeBytes: number, minimumFreeBytes: number, afterFreeBytes: number, sampleIntervalMs: number }> = {}
proof.observedDiskPhases = diskPhases

async function regularFileBytes(directory: string): Promise<number> {
  const seen = new Set<string>()
  async function walk(path: string): Promise<number> {
    const stat = await lstat(path)
    if (stat.isSymbolicLink()) return 0
    if (stat.isDirectory()) {
      let bytes = 0
      for (const entry of await readdir(path)) bytes += await walk(join(path, entry))
      return bytes
    }
    const key = `${stat.dev}:${stat.ino}`
    if (!stat.isFile() || seen.has(key)) return 0
    seen.add(key)
    return stat.size
  }
  return walk(directory)
}

async function run(name: string, args: string[], cwd: string, environment: Record<string, string | undefined> = {}): Promise<string> {
  const stdout = join(artifacts, `${name}.stdout.log`)
  const stderr = join(artifacts, `${name}.stderr.log`)
  const free = async (): Promise<number> => { const fs = await statfs(root); return fs.bavail * fs.bsize }
  const before = await free()
  const phase = { beforeFreeBytes: before, minimumFreeBytes: before, afterFreeBytes: before, sampleIntervalMs: 500 }
  diskPhases[name] = phase
  const timer = setInterval(() => { void free().then(bytes => { phase.minimumFreeBytes = Math.min(bytes, phase.minimumFreeBytes) }).catch(() => {}) }, phase.sampleIntervalMs)
  try {
    const child = Bun.spawn(args, {
      cwd, env: { ...process.env, ...environment },
      stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(600_000),
    })
    const code = await child.exited
    const output = await readFile(stdout, 'utf8') + await readFile(stderr, 'utf8')
    assert.equal(code, 0, `${name}: ${output.slice(-8000)}`)
    return output
  }
  finally {
    clearInterval(timer)
    phase.afterFreeBytes = await free()
    phase.minimumFreeBytes = Math.min(phase.minimumFreeBytes, phase.afterFreeBytes)
  }
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
  proof.installedFootprint = {
    chromeRegularBytes: await regularFileBytes(join(cliRoot, 'pantry', domain, `v${chromeVersion}`)),
    wholeNativeTreeRegularBytes: await regularFileBytes(join(cliRoot, 'pantry')),
    llvmRegularBytes: await regularFileBytes(join(cliRoot, 'pantry/llvm.org')).catch(() => 0),
    scope: 'post-install regular-file bytes; filesystem-free samples observe staging pressure, not a guaranteed peak bound',
  }

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
