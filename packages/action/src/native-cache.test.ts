import { expect, test } from 'bun:test'
import { nativeArtifactCacheIdentity } from './native-cache'
import type { RegistryMetadata } from '../../ts-pantry/src/installer'
import type { Platform } from './types'
import { packages } from '../../ts-pantry/src/packages'

const platform: Platform = { os: 'linux', arch: 'x64', binaryName: 'pantry', assetName: '' }
const metadata = (digest: string, macDigest = 'c'): RegistryMetadata => ({ versions: {
  '10.2.0': { platforms: {
    'linux-x86-64': { tarball: 'client.tar.gz', sha256: digest.repeat(64) },
    'darwin-arm64': { tarball: 'client-mac.tar.gz', sha256: macDigest.repeat(64) },
  } },
} })

test('a republished native artifact changes cache identity without a version bump', async () => {
  const identity = (digest: string) => nativeArtifactCacheIdentity(['openssh.com@10.2.0'], platform, async () => metadata(digest), async () => [])
  expect(await identity('a')).not.toBe(await identity('b'))
})

test('transitive artifact rebuilds invalidate cache, independent of input ordering', async () => {
  let cryptoDigest = 'a'
  const read = async (domain: string) => metadata(domain === 'openssl.org' ? cryptoDigest : 'b')
  const deps = async () => ['openssl.org']
  const before = await nativeArtifactCacheIdentity(['openssh.com', 'git-scm.org'], platform, read, deps)
  expect(await nativeArtifactCacheIdentity(['git-scm.org', 'openssh.com'], platform, read, deps)).toBe(before)
  cryptoDigest = 'd'
  expect(await nativeArtifactCacheIdentity(['openssh.com', 'git-scm.org'], platform, read, deps)).not.toBe(before)
})

test('another platform rebuild does not invalidate the installed platform', async () => {
  const identity = (digest: string) => nativeArtifactCacheIdentity(['openssh.com'], platform, async () => metadata('a', digest), async () => [])
  expect(await identity('b')).toBe(await identity('c'))
})

test('unknown or unverified artifacts cannot authorize cache reuse', async () => {
  for (const data of [{}, { versions: { '10.2.0': { platforms: { 'linux-x86-64': {} } } } }])
    await expect(nativeArtifactCacheIdentity(['openssh.com'], platform, async () => data, async () => [])).rejects.toThrow()
})

test('historical unsigned metadata does not hide a verified current artifact or a lock pin', async () => {
  const data = metadata('a')
  data.versions!['9.0.0'] = { platforms: { 'linux-x86-64': { tarball: 'historical.tar.gz' } } }
  const current = await nativeArtifactCacheIdentity(['openssh.com@^10'], platform, async () => data, async () => [])
  expect(current).toMatch(/^[a-f0-9]{64}$/)
  await expect(nativeArtifactCacheIdentity(['openssh.com'], platform, async () => data, async () => [], new Map([['openssh.com', '9.0.0']]))).rejects.toThrow('missing artifact digest')
})

test('native major and minor pins select the matching published candidate', async () => {
  const read = async () => metadata('a')
  expect(await nativeArtifactCacheIdentity(['openssh.com@10'], platform, read, async () => [])).toBe(await nativeArtifactCacheIdentity(['openssh.com@10.2'], platform, read, async () => []))
  const zeroMajor = { versions: { '0.13.0': metadata('a').versions!['10.2.0'] } }
  expect(await nativeArtifactCacheIdentity(['github.com/PJK/libcbor@0'], platform, async () => zeroMajor, async () => [])).toMatch(/^[a-f0-9]{64}$/)
})

test('the real GCC dependency graph authorizes caching only for its target architecture', async () => {
  const catalog = new Map<string, { versions: readonly string[] }>(Object.values(packages).map(pkg => [pkg.domain, pkg]))
  async function identity(target: Platform) {
    const seen = new Set<string>()
    const value = await nativeArtifactCacheIdentity(['gnu.org/gcc/libstdcxx@14'], target, async (domain) => {
      seen.add(domain)
      const pkg = catalog.get(domain)
      if (!pkg) throw new Error(`Unknown catalog domain: ${domain}`)
      return { versions: Object.fromEntries(pkg.versions.map(version => [version, { platforms: {
        'linux-x86-64': { tarball: 'linux.tar.gz', sha256: 'a'.repeat(64) },
        'darwin-arm64': { tarball: 'arm.tar.gz', sha256: 'b'.repeat(64) },
        'darwin-x86-64': { tarball: 'intel.tar.gz', sha256: 'c'.repeat(64) },
      } }])) }
    })
    expect(value).toMatch(/^[a-f0-9]{64}$/)
    return seen
  }
  expect((await identity(platform)).has('libisl.sourceforge.io')).toBe(false)
  expect((await identity({ ...platform, os: 'darwin', arch: 'arm64' })).has('libisl.sourceforge.io')).toBe(false)
  expect((await identity({ ...platform, os: 'darwin' })).has('libisl.sourceforge.io')).toBe(true)
})
