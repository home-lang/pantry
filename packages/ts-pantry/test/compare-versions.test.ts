import { describe, expect, test } from 'bun:test'
import { compareVersions } from '../src/generate-zig'

// compareVersions sorts newest-first: it returns a negative number when `a`
// is newer than `b` (so `a` sorts before `b`), positive when `b` is newer.
describe('compareVersions (newest-first)', () => {
  test('orders by numeric components first', () => {
    expect(compareVersions('0.17.0', '0.16.0')).toBeLessThan(0)
    expect(compareVersions('0.16.0', '0.17.0')).toBeGreaterThan(0)
    expect(compareVersions('1.2.10', '1.2.9')).toBeLessThan(0)
  })

  test('a newer numeric base wins regardless of prerelease', () => {
    // The real-world regression: 0.17 dev must outrank a 0.16 dev build even
    // though the 0.16 build has a larger dev counter.
    expect(compareVersions('0.17.0-dev.263', '0.16.0-dev.2471')).toBeLessThan(0)
  })

  test('release outranks a prerelease of the same numeric version', () => {
    expect(compareVersions('1.0.0', '1.0.0-rc.1')).toBeLessThan(0)
    expect(compareVersions('1.0.0-rc.1', '1.0.0')).toBeGreaterThan(0)
  })

  test('numeric prerelease identifiers compare numerically, not lexically', () => {
    // The core bug: lexically "263" > "2471", but dev.2471 is the newer build.
    expect(compareVersions('0.17.0-dev.2471', '0.17.0-dev.263')).toBeLessThan(0)
    expect(compareVersions('0.17.0-dev.263', '0.17.0-dev.2471')).toBeGreaterThan(0)
    expect(compareVersions('1.0.0-alpha.2', '1.0.0-alpha.10')).toBeGreaterThan(0)
  })

  test('build metadata (+sha) is ignored for precedence', () => {
    expect(compareVersions('0.17.0-dev.263+0add2dfc4', '0.17.0-dev.263+ffffffff')).toBe(0)
    // Still ranked purely by the dev counter once build metadata is stripped.
    expect(compareVersions('0.17.0-dev.2471+aaaa', '0.17.0-dev.263+bbbb')).toBeLessThan(0)
  })

  test('handles a leading v prefix', () => {
    expect(compareVersions('v0.17.0-dev.263+0add2dfc4', '0.17.0-dev.263')).toBe(0)
    expect(compareVersions('v0.17.0', 'v0.16.0')).toBeLessThan(0)
  })

  test('numeric prerelease identifiers rank below alphanumeric ones', () => {
    // SemVer §11.4.3: 1.0.0-alpha.1 < 1.0.0-alpha.beta
    expect(compareVersions('1.0.0-alpha.beta', '1.0.0-alpha.1')).toBeLessThan(0)
  })

  test('a longer set of prerelease fields wins when prefixes are equal', () => {
    // SemVer §11.4.4: 1.0.0-alpha < 1.0.0-alpha.1
    expect(compareVersions('1.0.0-alpha.1', '1.0.0-alpha')).toBeLessThan(0)
  })
})
