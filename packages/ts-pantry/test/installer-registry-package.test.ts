// Installing a package that has no built-in resolver.
//
// The SDK ships bespoke resolvers for five toolchains whose origins need
// hand-written URL shapes. Everything else pantry builds lands in the registry
// under one predictable layout — and the SDK used to refuse all of it:
// `isSupported()` said no, the GitHub Action logged "not supported by TS
// installer SDK, skipping", and the next step died on `command not found`.
//
// It went unnoticed for as long as it did because it only bit CI. A developer's
// local `pantry install craft` goes through a different code path and works, so
// the Linux runner was the only place the tarball sitting in the registry was
// not being used.

import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, mkdirSync, writeFileSync, chmodSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const PACKAGE = 'example.test'
const TAMPERED = 'tampered.test'
const VERSION = '2.1.0'

/** Tarball requests the test registry has served, by package. */
const downloads: string[] = []

let server: Server
let registryUrl: string
let installer: typeof import('../src/installer')
const scratch: string[] = []

/** A tarball laid out the way the registry publishes them: `./bin/<program>`. */
function buildTarball(programs: string[]): Buffer {
  const stage = mkdtempSync(join(tmpdir(), 'registry-pkg-'))
  scratch.push(stage)
  mkdirSync(join(stage, 'bin'), { recursive: true })
  for (const program of programs) {
    const file = join(stage, 'bin', program)
    writeFileSync(file, `#!/bin/sh\necho ${program}\n`)
    chmodSync(file, 0o755)
  }
  const archive = join(stage, 'package.tar.gz')
  execFileSync('tar', ['-czf', archive, '-C', stage, './bin'])
  return readFileSync(archive)
}

function temp(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  scratch.push(dir)
  return dir
}

beforeAll(async () => {
  const tarball = buildTarball(['demo', 'demo-helper'])
  const sha256 = createHash('sha256').update(tarball).digest('hex')

  const metadata = {
    name: PACKAGE,
    latestVersion: VERSION,
    versions: {
      '1.0.0': {
        platforms: {
          'darwin-arm64': { tarball: `binaries/${PACKAGE}/1.0.0/darwin-arm64/${PACKAGE}-1.0.0.tar.gz`, sha256 },
        },
      },
      [VERSION]: {
        platforms: {
          'darwin-arm64': { tarball: `binaries/${PACKAGE}/${VERSION}/darwin-arm64/${PACKAGE}-${VERSION}.tar.gz`, sha256 },
          'linux-x86-64': { tarball: `binaries/${PACKAGE}/${VERSION}/linux-x86-64/${PACKAGE}-${VERSION}.tar.gz`, sha256 },
        },
      },
      // Published, but not for any platform under test — it must never be
      // chosen as "latest" for a target it was not built for.
      '3.0.0': {
        platforms: {
          'windows-x86-64': { tarball: `binaries/${PACKAGE}/3.0.0/windows-x86-64/${PACKAGE}-3.0.0.tar.gz`, sha256 },
        },
      },
    },
  }

  // Same artifact, but the listing swears it hashes to something else.
  const tamperedMetadata = {
    versions: {
      [VERSION]: {
        platforms: {
          'darwin-arm64': {
            tarball: `binaries/${TAMPERED}/${VERSION}/darwin-arm64/${TAMPERED}-${VERSION}.tar.gz`,
            sha256: 'f'.repeat(64),
          },
        },
      },
    },
  }

  server = createServer((req, res) => {
    const url = req.url || ''
    if (url === `/binaries/${PACKAGE}/metadata.json`) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(metadata))
      return
    }
    if (url === `/binaries/${TAMPERED}/metadata.json`) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(tamperedMetadata))
      return
    }
    if (url.endsWith('.tar.gz')) {
      downloads.push(url)
      res.writeHead(200, { 'Content-Type': 'application/gzip' })
      res.end(tarball)
      return
    }
    res.writeHead(404)
    res.end('not found')
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('test registry did not expose a port')
  registryUrl = `http://127.0.0.1:${address.port}`

  // Set before use, not before import: the installer reads
  // PANTRY_REGISTRY_URL per call, so this works no matter which test file the
  // runner loaded the module from first.
  process.env.PANTRY_REGISTRY_URL = registryUrl
  installer = await import('../src/installer')
})

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()))
  for (const dir of scratch.splice(0)) rmSync(dir, { recursive: true, force: true })
  delete process.env.PANTRY_REGISTRY_URL
})

const darwin = { os: 'darwin', arch: 'aarch64' } as const
const linux = { os: 'linux', arch: 'x86_64' } as const
const windowsArm = { os: 'windows', arch: 'aarch64' } as const

describe('installability of a registry-published package', () => {
  it('is not a built-in resolver', () => {
    expect(installer.isSupported(PACKAGE)).toBe(false)
  })

  it('is installable anyway, on every platform the registry publishes', async () => {
    expect(await installer.isInstallable(PACKAGE, darwin)).toBe(true)
    expect(await installer.isInstallable(PACKAGE, linux)).toBe(true)
  })

  it('is not installable on a platform the registry skipped', async () => {
    expect(await installer.isInstallable(PACKAGE, windowsArm)).toBe(false)
  })

  it('is not installable when the registry has never heard of it', async () => {
    expect(await installer.isInstallable('nothing-here.invalid', darwin)).toBe(false)
  })
})

describe('registry download source', () => {
  it('uses the tarball path the registry published rather than reconstructing one', () => {
    const metadata = {
      versions: { '9.9.9': { platforms: { 'linux-x86-64': { tarball: 'binaries/re/laid/out.tar.gz', sha256: 'abc' } } } },
    }
    expect(installer.registryDownloadSource(metadata, '9.9.9', linux)).toEqual({
      url: `${registryUrl}/binaries/re/laid/out.tar.gz`,
      format: 'tar.gz',
      prefix: '',
      sha256: 'abc',
    })
  })

  it('returns null for a version the platform has no artifact for', () => {
    const metadata = { versions: { '9.9.9': { platforms: { 'darwin-arm64': { tarball: 'x.tar.gz' } } } } }
    expect(installer.registryDownloadSource(metadata, '9.9.9', linux)).toBeNull()
  })
})

describe('version resolution without a built-in resolver', () => {
  it('resolves "latest" to the newest build for that platform, not the newest overall', async () => {
    // 3.0.0 exists, for Windows only. Handing it to a Linux runner would
    // resolve fine and 404 on download.
    expect(await installer.resolveLatestVersion(PACKAGE, linux)).toBe(VERSION)
  })

  it('resolves a semver range against what the registry actually publishes', async () => {
    const result = await installer.installPackage(PACKAGE, '^2.0.0', {
      installDir: temp('registry-range-'),
      platform: darwin,
      quiet: true,
    })
    expect(result.version).toBe(VERSION)
  })

  it('refuses a range nothing published satisfies, rather than silently installing latest', async () => {
    await expect(installer.installPackage(PACKAGE, '^7.0.0', {
      installDir: temp('registry-unsatisfiable-'),
      platform: darwin,
      quiet: true,
    })).rejects.toThrow(/satisfies/)
  })
})

describe('installing a registry-published package', () => {
  it('discovers its binaries from what it shipped in bin/', async () => {
    const installDir = temp('registry-install-')
    const result = await installer.installPackage(PACKAGE, VERSION, {
      installDir,
      platform: darwin,
      quiet: true,
    })

    expect(result.version).toBe(VERSION)
    // Discovered, not declared: nothing in this SDK knows these names.
    expect(result.binaries).toEqual(['demo', 'demo-helper'])
    expect(readdirSync(join(result.installPath, 'bin')).sort()).toEqual(['demo', 'demo-helper'])
  })

  it('links every discovered binary into .bin and keeps it executable', async () => {
    const installDir = temp('registry-links-')
    await installer.installPackage(PACKAGE, VERSION, { installDir, platform: darwin, quiet: true })

    for (const program of ['demo', 'demo-helper']) {
      const link = join(installDir, '.bin', program)
      expect(execFileSync(link, { encoding: 'utf8' }).trim()).toBe(program)
      expect(statSync(link).mode & 0o111).toBeGreaterThan(0)
    }
  })

  it('extracts to the package root, with no wrapper directory left behind', async () => {
    const installDir = temp('registry-prefix-')
    const result = await installer.installPackage(PACKAGE, VERSION, { installDir, platform: darwin, quiet: true })
    expect(existsSync(join(result.installPath, 'bin', 'demo'))).toBe(true)
  })

  it('serves the second install from cache without re-downloading', async () => {
    const installDir = temp('registry-cache-')
    await installer.installPackage(PACKAGE, VERSION, { installDir, platform: darwin, quiet: true })

    // Counting server hits, not swapping the registry URL out from under the
    // module: `PANTRY_REGISTRY` is read once at import, so reassigning the env
    // mid-test proves nothing.
    const before = downloads.length
    const again = await installer.installPackage(PACKAGE, VERSION, { installDir, platform: darwin, quiet: true })

    expect(again.binaries).toEqual(['demo', 'demo-helper'])
    expect(downloads.length).toBe(before)
  })

  it('rejects a tarball whose digest does not match the registry listing', async () => {
    // The digest comes from the metadata, so a substituted artifact is caught
    // before anything is unpacked. Served by the same test registry, because
    // the module captured its URL at import and will not follow a new one.
    const retries: string[] = []
    await expect(installer.installPackage(TAMPERED, VERSION, {
      installDir: temp('registry-tamper-'),
      platform: darwin,
      quiet: true,
      onRetry: message => retries.push(message),
    })).rejects.toThrow(/checksum mismatch/i)

    // A mismatch is deliberately retryable — a truncated transfer deserves
    // another go — so this burns the full retry budget before failing. That
    // backoff is why the timeout below is generous.
    expect(retries.length).toBeGreaterThan(0)
  }, 30_000)

  it('says which platform it looked for when nothing is published', async () => {
    await expect(installer.installPackage(PACKAGE, VERSION, {
      installDir: temp('registry-missing-'),
      platform: windowsArm,
      quiet: true,
    })).rejects.toThrow(/windows-arm64/)
  })
})
