import type { Platform } from './installer'

export interface WindowsGitRelease {
  version: string
  baseVersion: string
  tag: string
  filename: string
  url: string
  metadataUrl: string
}

/** Original GitHub release digests retained when this distribution was adopted. */
export function windowsGitPinnedDigest(expected: WindowsGitRelease): string | undefined {
  if (expected.version !== '2.53.0+windows.1') return undefined
  return expected.filename.endsWith('-arm64.zip')
    ? 'dd03826524767f228c9131bc4b2f4d29bc6f550a39fef9bec240f3e312210a1d'
    : '82b562c918ec87b2ef5316ed79bb199e3a25719bb871a0f10294acf21ebd08cd'
}

/** Keep the vendor revision in the installed identity rather than overwriting a Git version. */
export function windowsGitRelease(version: string, platform: Platform): WindowsGitRelease {
  if (platform.os !== 'windows' || !['x86_64', 'aarch64'].includes(platform.arch)) throw new Error('MinGit requires Windows x64 or arm64')
  const match = /^v?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:(?:\+|\.)windows\.([1-9]\d*))?$/.exec(version)
  if (!match || [...match[1].split('.'), match[2] || '1'].some(value => !Number.isSafeInteger(Number(value))))
    throw new Error(`Invalid Git for Windows version: ${version}`)
  const baseVersion = match[1]
  const revision = match[2] || '1'
  const tag = `v${baseVersion}.windows.${revision}`
  const filename = `MinGit-${baseVersion}-${platform.arch === 'aarch64' ? 'arm64' : '64-bit'}.zip`
  return {
    version: `${baseVersion}+windows.${revision}`, baseVersion, tag, filename,
    url: `https://github.com/git-for-windows/git/releases/download/${tag}/${filename}`,
    metadataUrl: `https://api.github.com/repos/git-for-windows/git/releases/tags/${tag}`,
  }
}

function releaseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Git for Windows release metadata')
  const release = value as Record<string, unknown>
  if (release.draft !== false || release.prerelease !== false || typeof release.tag_name !== 'string')
    throw new Error('Git for Windows requires a published stable release')
  return release
}

export function windowsGitVersionFromRelease(value: unknown): string {
  const release = releaseRecord(value)
  if (!/^v\d+\.\d+\.\d+\.windows\.[1-9]\d*$/.test(String(release.tag_name)))
    throw new Error('Invalid Git for Windows release tag')
  return windowsGitRelease(String(release.tag_name), { os: 'windows', arch: 'x86_64' }).version
}

/** A release digest must identify this exact architecture, vendor revision and official URL. */
export function windowsGitArchiveDigest(value: unknown, expected: WindowsGitRelease): string {
  const release = releaseRecord(value)
  if (release.tag_name !== expected.tag || !Array.isArray(release.assets)) throw new Error('Git for Windows release identity mismatch')
  const matches = release.assets.filter(asset => asset && typeof asset === 'object' && asset.name === expected.filename)
  if (matches.length !== 1) throw new Error(`Git for Windows requires one ${expected.filename} asset`)
  const asset = matches[0]
  if (asset.browser_download_url !== expected.url || !Number.isSafeInteger(asset.size) || asset.size <= 0
    || typeof asset.digest !== 'string' || !/^sha256:[a-f0-9]{64}$/i.test(asset.digest))
    throw new Error('Git for Windows archive has no verified official identity')
  const digest = asset.digest.slice(7).toLowerCase()
  const original = windowsGitPinnedDigest(expected)
  if (original && original !== digest) throw new Error('Git for Windows archive differs from its retained original digest')
  return digest
}

export function windowsGitVersions(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error('Invalid Git for Windows release list')
  const versions: string[] = []
  for (const release of value) {
    if (release?.draft || release?.prerelease || !/^v\d+\.\d+\.\d+\.windows\.[1-9]\d*$/.test(release?.tag_name || '')) continue
    versions.push(windowsGitVersionFromRelease(release))
  }
  const parts = (version: string) => version.match(/\d+/g)!.map(Number)
  return [...new Set(versions)].sort((left, right) => {
    const a = parts(left), b = parts(right)
    for (let index = 0; index < 4; index++) if (a[index] !== b[index]) return b[index] - a[index]
    return 0
  })
}
