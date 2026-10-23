import { expect, test } from 'bun:test'
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
