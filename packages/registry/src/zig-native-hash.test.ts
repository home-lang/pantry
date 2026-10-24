import { expect, test } from 'bun:test'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { managedRegistryZig } from './zig-native-hash'
import { zigPackageFixture } from './zig-package-fixture'
import { computeZigHash, validateZigHash } from './zig'

test('advertises the native compiler package hash rather than a tarball checksum', async () => {
  // Independently measured with the declared original Zig 0.17.0 executable.
  // Tar/gzip headers are deliberately different from the oracle archive.
  expect(await computeZigHash(await zigPackageFixture())).toBe('graphics_package_consumer-1.0.0-eF_X1KAAAAB7sPq4wQFLI6Urz5wPpAnB_liZ_wFl9Csi')
}, 130_000)

test('native hashing honors the declared package paths across different archive bytes', async () => {
  const first = await zigPackageFixture('1.0.0', 'first unshipped contents')
  const second = await zigPackageFixture('1.0.0', 'different unshipped contents')
  expect(first.equals(second)).toBe(false)
  const original = await computeZigHash(first)
  expect(original).toBe(await computeZigHash(second))
  expect(original).not.toBe(await computeZigHash(await zigPackageFixture('1.0.0', '', 43)))
}, 130_000)

test('hash lookup accepts native and historical opaque keys with bounded syntax', () => {
  expect(validateZigHash('graphics_package_consumer-1.0.0-eF_X1KAAAAB7sPq4wQFLI6Urz5wPpAnB_liZ_wFl9Csi')).toBe(true)
  expect(validateZigHash(`1220${'a'.repeat(64)}`)).toBe(true)
  for (const value of ['', '../hash', 'a'.repeat(257), '1220abcd', 'craft-0.0.1-invalid'])
    expect(validateZigHash(value)).toBe(false)
})

test('native hashing separates its managed compiler cache from disposable uploads without a user home', async () => {
  const zig = process.env.PANTRY_ZIG_BIN || managedRegistryZig() || Bun.which('zig')
  expect(zig).toBeTruthy()
  const directory = await mkdtemp(join(tmpdir(), 'pantry-zig-service-'))
  const source = `import { computeZigHash } from ${JSON.stringify(fileURLToPath(new URL('./zig-native-hash.ts', import.meta.url)))};
import { zigPackageFixture } from ${JSON.stringify(fileURLToPath(new URL('./zig-package-fixture.ts', import.meta.url)))};
console.log(JSON.stringify(await Promise.all([computeZigHash(await zigPackageFixture()), computeZigHash(await zigPackageFixture('1.0.0', '', 43))])));`
  const child = Bun.spawn([process.execPath, '--no-env-file', '--eval', source], {
    // A service need not have HOME, XDG_CACHE_HOME or a user profile. Keep
    // hashing independent of those and of a developer's populated Zig cache.
    env: { PANTRY_ZIG_BIN: zig!, PANTRY_ZIG_CACHE_DIR: join(directory, 'compiler'), TMPDIR: directory }, stdout: 'pipe', stderr: 'pipe',
  })
  try {
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    expect(code, stderr).toBe(0)
    const hashes = JSON.parse(stdout)
    expect(hashes[0]).toBe('graphics_package_consumer-1.0.0-eF_X1KAAAAB7sPq4wQFLI6Urz5wPpAnB_liZ_wFl9Csi')
    expect(validateZigHash(hashes[1])).toBe(true)
    expect(hashes[1]).not.toBe(hashes[0])
    expect(await readdir(directory)).toEqual(['compiler'])
    expect((await readdir(join(directory, 'compiler'))).length).toBeGreaterThan(0)
  }
  finally {
    if (child.exitCode === null) child.kill()
    await child.exited
    await rm(directory, { recursive: true, force: true })
  }
}, 130_000)
