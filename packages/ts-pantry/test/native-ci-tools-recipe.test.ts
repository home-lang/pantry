import { expect, test } from 'bun:test'
import { githubAssetSteps } from '../scripts/github-asset-recipe'
import { netfilterVersions } from '../scripts/netfilter-versions'

test('public release asset coordinates cannot escape their paths or inject a build command', () => {
  expect(() => githubAssetSteps('oven-sh/bun', 'bun-v{{version}}', 'bun-linux-x64-profile.zip', 'bun.zip')).not.toThrow()
  for (const [repository, tag, asset, filename] of [
    ['../bun', 'v1.4.2', 'bun.zip', 'bun.zip'],
    ['oven-sh/..', 'v1.4.2', 'bun.zip', 'bun.zip'],
    ['oven-sh/bun', 'v1.4.2;touch pwned', 'bun.zip', 'bun.zip'],
    ['oven-sh/bun', 'v1.4.2', '../bun.zip', 'bun.zip'],
    ['oven-sh/bun', 'v1.4.2', 'bun.zip', '../../bun.zip'],
    ['oven-sh/bun', 'v1.4.2', 'bun.zip', '$(id)'],
  ]) expect(() => githubAssetSteps(repository!, tag!, asset!, filename!)).toThrow('Invalid GitHub recipe asset')
})

test('native netfilter discovery deduplicates the project archive versions and ignores signatures and other projects', async () => {
  const versions = await netfilterVersions('nftables', async (url) => {
    expect(url).toBe('https://www.netfilter.org/projects/nftables/downloads.html')
    return new Response('<a href="files/nftables-1.1.7.tar.xz">nftables-1.1.7.tar.xz</a><a href="files/nftables-1.1.6.tar.xz">previous</a><a href="files/nftables-1.1.8.tar.xz.sig">signature</a><a href="files/libmnl-1.0.5.tar.bz2">other</a>')
  })
  expect(versions).toEqual(['1.1.7', '1.1.6'])
})

test('native netfilter discovery fails on an unavailable upstream instead of claiming no updates', async () => {
  await expect(netfilterVersions('nftables', async () => new Response(null, { status: 503 }))).rejects.toThrow('HTTP 503')
  await expect(netfilterVersions('nftables', async () => new Response('no archives'))).rejects.toThrow('no native source archive')
  await expect(netfilterVersions('../nftables')).rejects.toThrow('Invalid netfilter project')
})
