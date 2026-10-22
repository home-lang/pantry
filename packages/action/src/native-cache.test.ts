import { expect, test } from 'bun:test'
import { nativeArtifactCacheIdentity } from './native-cache'
import type { RegistryMetadata } from '../../ts-pantry/src/installer'
import type { Platform } from './types'
import { packages } from '../../ts-pantry/src/packages'
import { mergeServicePackages, parseServiceSpecs } from './services'

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

test('service roots and their runtime dependencies participate in the restored prefix identity', async () => {
  const specs = mergeServicePackages('bun.com@1.4.3', parseServiceSpecs('dynamodb@3.3.0')).split(/\s+/)
  let serverDigest = 'a', javaDigest = 'b'
  const seen = new Set<string>()
  const read = async (domain: string): Promise<RegistryMetadata> => {
    seen.add(domain)
    const version = domain === 'aws.amazon.com/dynamodb-local' ? '3.3.0' : '17.0.18'
    return { versions: { [version]: { platforms: { 'linux-x86-64': {
      tarball: `${domain}/${version}.tar.gz`,
      sha256: (domain === 'aws.amazon.com/dynamodb-local' ? serverDigest : javaDigest).repeat(64),
    } } } } }
  }
  const dependencies = async (domain: string) => domain === 'aws.amazon.com/dynamodb-local' ? ['openjdk.org@17.0.18'] : []
  const identity = () => nativeArtifactCacheIdentity(specs, platform, read, dependencies)
  const before = await identity()
  expect(seen).toEqual(new Set(['aws.amazon.com/dynamodb-local', 'openjdk.org']))
  serverDigest = 'c'
  const rebuiltServer = await identity()
  expect(rebuiltServer).not.toBe(before)
  javaDigest = 'd'
  expect(await identity()).not.toBe(rebuiltServer)
  javaDigest = 'z'
  await expect(identity()).rejects.toThrow('missing artifact digest')
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


test('Windows Git uses its versioned standalone bundle while Unix Git keeps native dependencies', async () => {
  const windows: Platform = { os: 'windows', arch: 'x64', binaryName: 'pantry.exe', assetName: '' }
  const unexpected = async () => { throw new Error('A standalone Windows bundle has no registry dependency graph') }
  expect(await nativeArtifactCacheIdentity(['git-scm.org@2.53.0'], windows, unexpected, unexpected)).toMatch(/^[a-f0-9]{64}$/)
  const seen: string[] = []
  await nativeArtifactCacheIdentity(['git-scm.org@10.2.0'], platform, async domain => { seen.push(domain); return metadata('a') }, async () => ['openssl.org@10.2.0'])
  expect(seen.sort()).toEqual(['git-scm.org', 'openssl.org'])
})
