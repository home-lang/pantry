import { expect, test } from 'bun:test'
import { nativeArtifactCacheIdentity } from './native-cache'
import type { RegistryMetadata } from '../../ts-pantry/src/installer'
import type { Platform } from './types'

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
