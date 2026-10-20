import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { detectPlatform, installPackage, registryPlatformKey } from '../src/installer'

test.skipIf(process.platform === 'win32')('registry archive links survive extraction cleanup, relocation and a cached SDK install', async () => {
  const root = mkdtempSync(join(tmpdir(), "pantry archive links ' "))
  const moved = `${root} moved`
  const stage = join(root, 'archive')
  const domain = 'relative.links.test'
  const version = '155.0.8059.84.1'
  for (const dir of ['bin', 'lib', 'libexec', 'share']) mkdirSync(join(stage, dir), { recursive: true })
  writeFileSync(join(stage, 'libexec/demo'), '#!/bin/sh\nprefix=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd) || exit\ncat "$prefix/share/owned-resource"\n', { mode: 0o755 })
  writeFileSync(join(stage, 'share/owned-resource'), 'installed-prefix-resource\n')
  writeFileSync(join(stage, 'lib/provider.so'), 'owned-library-resource\n')
  symlinkSync('../libexec/demo', join(stage, 'bin/demo'))
  symlinkSync('provider.so', join(stage, 'lib/provider-alias.so'))
  const archive = execFileSync('tar', ['-czf', '-', '-C', stage, '.'])
  const sha256 = createHash('sha256').update(archive).digest('hex')
  const key = registryPlatformKey(detectPlatform())
  const server = createServer((req, res) => {
    if (req.url === `/binaries/${domain}/metadata.json`) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ versions: { [version]: { platforms: { [key]: { tarball: `binaries/${domain}/${version}/${key}/fixture.tar.gz`, sha256 } } } } }))
    }
    else if (req.url?.endsWith('/fixture.tar.gz')) { res.writeHead(200); res.end(archive) }
    else { res.writeHead(404); res.end() }
  })
  const originalRegistry = process.env.PANTRY_REGISTRY_URL
  try {
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('No test registry port')
    process.env.PANTRY_REGISTRY_URL = `http://127.0.0.1:${address.port}`
    const tree = join(root, 'installed')
    const result = await installPackage(domain, version, { installDir: tree, quiet: true })
    // installPackage has already removed its private extraction directory.
    expect(lstatSync(join(result.installPath, 'bin/demo')).isSymbolicLink()).toBe(true)
    expect(readlinkSync(join(result.installPath, 'bin/demo'))).toBe('../libexec/demo')
    expect(readlinkSync(join(result.installPath, 'lib/provider-alias.so'))).toBe('provider.so')
    expect(readFileSync(join(result.installPath, 'lib/provider-alias.so'), 'utf8')).toBe('owned-library-resource\n')
    expect(execFileSync(join(tree, '.bin/demo'), { encoding: 'utf8' })).toBe('installed-prefix-resource\n')
    renameSync(root, moved)
    const relocated = join(moved, 'installed')
    await installPackage(domain, version, { installDir: relocated, quiet: true })
    expect(execFileSync(join(relocated, '.bin/demo'), { encoding: 'utf8' })).toBe('installed-prefix-resource\n')
    expect(realpathSync(join(relocated, domain, `v${version}`, 'lib/provider-alias.so'))).toBe(realpathSync(join(relocated, domain, `v${version}`, 'lib/provider.so')))
    // Reproduce an old SDK's link into an extraction directory which no
    // longer exists. The ordinary API must repair it without a cache purge.
    const program = join(relocated, domain, `v${version}`, 'bin/demo')
    unlinkSync(program)
    symlinkSync(join(root, 'removed-extraction/libexec/demo'), program)
    await installPackage(domain, version, { installDir: relocated, quiet: true })
    expect(readlinkSync(program)).toBe('../libexec/demo')
    expect(execFileSync(join(relocated, '.bin/demo'), { encoding: 'utf8' })).toBe('installed-prefix-resource\n')
  }
  finally {
    if (originalRegistry === undefined) delete process.env.PANTRY_REGISTRY_URL
    else process.env.PANTRY_REGISTRY_URL = originalRegistry
    await new Promise<void>(resolve => server.close(() => resolve()))
    rmSync(root, { recursive: true, force: true })
    rmSync(moved, { recursive: true, force: true })
  }
})
