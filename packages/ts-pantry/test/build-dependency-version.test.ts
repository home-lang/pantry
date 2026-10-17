import { describe, expect, test } from 'bun:test'
import { versionSatisfies } from '../scripts/build-package'

describe('native builder constraints match installed runtime dependencies', () => {
  test('PostgreSQL libxml2~2.13 cannot link against the incompatible 2.15 ABI', () => {
    expect(versionSatisfies('2.13.9', '~2.13')).toBe(true)
    expect(versionSatisfies('2.14.0', '~2.13')).toBe(false)
    expect(versionSatisfies('2.15.1', '~2.13')).toBe(false)
    expect(versionSatisfies('2.13.4', '~2.13.5')).toBe(false)
    expect(versionSatisfies('2.13.9', '~2.13.5')).toBe(true)
  })
  test('zero-major carets and full comparison bounds retain their meaning', () => {
    expect(versionSatisfies('0.16.3', '^0.16.0')).toBe(true)
    expect(versionSatisfies('0.17.0', '^0.16.0')).toBe(false)
    expect(versionSatisfies('0.0.4', '^0.0.3')).toBe(false)
    expect(versionSatisfies('3.11.9', '>=3<3.12')).toBe(true)
    expect(versionSatisfies('3.12.0', '>=3<3.12')).toBe(false)
    expect(versionSatisfies('3.11.0', '>3.11.0')).toBe(false)
    expect(versionSatisfies('3.11.0', '<=3.11.0')).toBe(true)
  })
  test('partial versions, prereleases and malformed ranges do not select an accidental ABI', () => {
    expect(versionSatisfies('17.10', '17')).toBe(true)
    expect(versionSatisfies('17.10.1', '17.10')).toBe(true)
    expect(versionSatisfies('17.11.0', '17.10')).toBe(false)
    expect(versionSatisfies('2.13.10-dev.1', '~2.13')).toBe(false)
    expect(versionSatisfies('2.15.1', '~2.13 junk')).toBe(false)
  })
})

describe('native builder platform artifact selection', () => {
  test('uses the recipe range even when registry latest has a different ABI', async () => {
    const { buildDependencyCandidates } = await import('../scripts/build-package')
    const { recipe } = await import('../src/recipes/postgresql.org')
    const metadata = { latestVersion: '2.15.1', versions: {
      '2.15.1': { platforms: { 'linux-x86-64': { tarball: 'wrong-abi' } } },
      '2.13.8': { platforms: { 'linux-x86-64': { tarball: 'older-compatible' } } },
      '2.13.9': { platforms: { 'linux-x86-64': { tarball: 'compatible' } } },
    } }
    expect(buildDependencyCandidates(metadata, 'linux-x86-64', recipe.dependencies!['gnome.org/libxml2'] as string)).toEqual(['2.13.9', '2.13.8'])
  })
  test('never substitutes a different platform or registry latest for a missing compatible binary', async () => {
    const { buildDependencyCandidates, BuildDependencyResolutionError } = await import('../scripts/build-package')
    const metadata = { latestVersion: '2.15.1', versions: {
      '2.15.1': { platforms: { 'linux-x86-64': { tarball: 'wrong-abi' } } },
      '2.13.9': { platforms: { 'darwin-arm64': { tarball: 'wrong-platform' } } },
    } }
    expect(() => buildDependencyCandidates(metadata, 'linux-x86-64', '~2.13')).toThrow(BuildDependencyResolutionError)
    expect(() => buildDependencyCandidates(metadata, 'linux-x86-64', '~2.13')).toThrow('No linux-x86-64 dependency binary satisfies "~2.13"')
  })
  test('still selects available runtime dependencies for unconstrained recipes', async () => {
    const { buildDependencyCandidates } = await import('../scripts/build-package')
    expect(buildDependencyCandidates({ versions: { '1.0': { platforms: { 'linux-x86-64': {} } }, '2.0': { platforms: { 'darwin-arm64': {} } } } }, 'linux-x86-64', null)).toEqual(['1.0'])
  })
})
