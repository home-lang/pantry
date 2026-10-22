import { expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readlinkSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isSupported, resolvePackageVersion, installPackage } from '../src/installer'
import { windowsGitArchiveDigest, windowsGitRelease, windowsGitVersionFromRelease, windowsGitVersions } from '../src/git-for-windows'

test('the standalone Git for Windows bundle has a platform-specific SDK resolver', () => {
  expect(isSupported('git-scm.org', { os: 'windows', arch: 'x86_64' })).toBe(true)
  expect(isSupported('git-scm.org', { os: 'windows', arch: 'aarch64' })).toBe(true)
  expect(isSupported('git-scm.org', { os: 'linux', arch: 'x86_64' })).toBe(false)
  expect(isSupported('git-scm.org', { os: 'darwin', arch: 'aarch64' })).toBe(false)
})


const windows = { os: 'windows' as const, arch: 'x86_64' as const }
const checksum = '82b562c918ec87b2ef5316ed79bb199e3a25719bb871a0f10294acf21ebd08cd'
const expected = windowsGitRelease('2.53.0', windows)
function metadata() {
  return { tag_name: 'v2.53.0.windows.1', draft: false, prerelease: false, assets: [{
    name: 'MinGit-2.53.0-64-bit.zip', browser_download_url: expected.url, size: 41293746, digest: `sha256:${checksum}`,
  }] }
}

test('the vendor revision and architecture form an immutable installed identity', async () => {
  expect(await resolvePackageVersion('git-scm.org', '2.53.0', windows)).toBe('2.53.0+windows.1')
  expect(await resolvePackageVersion('git-scm.org', '2.53.0+windows.2', windows)).toBe('2.53.0+windows.2')
  expect(windowsGitRelease('2.53.0', { os: 'windows', arch: 'aarch64' }).filename).toBe('MinGit-2.53.0-arm64.zip')
  expect(windowsGitVersionFromRelease(metadata())).toBe('2.53.0+windows.1')
  expect(windowsGitArchiveDigest(metadata(), expected)).toBe(checksum)
})

test('unpublished releases and mismatched or unsigned archives cannot supply an executable', () => {
  const changes: Array<(value: ReturnType<typeof metadata>) => void> = [
    value => { value.draft = true }, value => { value.prerelease = true },
    value => { value.tag_name = 'v2.53.0.windows.2' },
    value => { value.assets[0].name = 'MinGit-2.53.0-arm64.zip' },
    value => { value.assets[0].browser_download_url = 'https://example.invalid/git.zip' },
    value => { value.assets[0].digest = 'sha256:abc' },
    value => { value.assets[0].digest = `sha256:${'a'.repeat(64)}` },
    value => { value.assets[0].size = 0 },
    value => { value.assets.push({ ...value.assets[0] }) },
  ]
  for (const mutate of changes) { const value = metadata(); mutate(value); expect(() => windowsGitArchiveDigest(value, expected)).toThrow() }
  for (const version of ['2.53.0/../../bad', '2.53.0+windows.0', '2.53.0-rc1', '02.53.0'])
    expect(() => windowsGitRelease(version, windows)).toThrow()
})

test('range candidates retain stable vendor revisions in numeric order', () => {
  const release = (tag: string) => ({ tag_name: tag, draft: false, prerelease: false })
  expect(windowsGitVersions([release('v2.53.0.windows.2'), release('v2.53.0.windows.10'), release('v2.54.0.windows.1'), { ...release('v3.0.0.windows.1'), prerelease: true }]))
    .toEqual(['2.54.0+windows.1', '2.53.0+windows.10', '2.53.0+windows.2'])
})


test('cached Windows entrypoints preserve their cmd directory and relative local/global aliases', async () => {
  const owned = mkdtempSync(join(tmpdir(), 'pantry-win-git-layout-'))
  try {
    const tree = join(owned, 'pantry')
    const prefix = join(tree, 'git-scm.org/v2.53.0+windows.1')
    mkdirSync(join(prefix, 'cmd'), { recursive: true })
    const provider = join(prefix, 'cmd/git.exe')
    // This fixture verifies cache and alias layout. Actual PE execution is a
    // separately required Windows-host integration check.
    writeFileSync(provider, 'nonempty cached executable fixture')
    writeFileSync(join(prefix, '.pantry-archive.json'), JSON.stringify({ schemaVersion: 1, os: 'windows', arch: 'x86_64', url: expected.url, sha256: checksum }))
    const marker = join(prefix, 'cache-marker')
    writeFileSync(marker, 'retained on a cache hit')
    const globalBin = join(owned, 'global-bin')
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await installPackage('git-scm.org', '2.53.0', { installDir: tree, platform: windows, globalBin, quiet: true })
      expect(result.version).toBe('2.53.0+windows.1')
      expect(existsSync(marker)).toBe(true)
      for (const directory of [join(tree, '.bin'), globalBin]) {
        const alias = join(directory, 'git.exe')
        expect(realpathSync(alias)).toBe(realpathSync(provider))
        expect(readlinkSync(alias)).not.toMatch(/^(?:[A-Z]:|\/)/i)
      }
    }
  }
  finally { rmSync(owned, { recursive: true, force: true }) }
})
