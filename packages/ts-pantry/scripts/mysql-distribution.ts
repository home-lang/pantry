/** Official server tags exclude the independently versioned MySQL Cluster. */
export async function mysqlNativeVersions(fetcher: (url: string, init?: RequestInit) => Promise<Response> = fetch): Promise<string[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const response = await fetcher('https://api.github.com/repos/mysql/mysql-server/tags?per_page=100', {
    headers: { 'User-Agent': 'Pantry', Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`MySQL server version discovery returned HTTP ${response.status}`)
  const tags = await response.json() as Array<{ name: string }>
  const candidates = new Set(['26.7.0', '8.4.11'])
  for (const tag of tags) {
    const version = /^mysql-(\d+\.\d+\.\d+)$/.exec(tag.name)?.[1]
    if (version && (Number(version.split('.')[0]) >= 26 || version.startsWith('8.4.'))) candidates.add(version)
  }
  const available: string[] = []
  for (const version of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const archive = await fetcher(mysqlDistributionUrl(version, 'linux-x86-64'), { method: 'HEAD', signal: AbortSignal.timeout(15_000) })
    if (archive.ok) available.push(version)
  }
  if (!available.length) throw new Error('MySQL published no verified native LTS or calendar-version server archive')
  return available.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
}

/** Vendor runtime distributions for LTS and calendar releases; retain the 8.0 source family. */
export function mysqlDistributionUrl(version: string, platform = ''): string {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid MySQL version: ${version}`)
  if (version.startsWith('8.0.')) return `https://cdn.mysql.com/archives/mysql-8.0/mysql-boost-${version}.tar.gz`
  if (Number(version.split('.')[0]) < 26 && !version.startsWith('8.4.')) throw new Error(`Unsupported MySQL release family: ${version}`)
  const assets: Record<string, string> = {
    'linux-x86-64': 'linux-glibc2.28-x86_64.tar.xz',
    'linux-arm64': 'linux-glibc2.28-aarch64.tar.xz',
    'linux-aarch64': 'linux-glibc2.28-aarch64.tar.xz',
    'darwin-arm64': 'macos15-arm64.tar.gz',
    'darwin-aarch64': 'macos15-arm64.tar.gz',
    'darwin-x86-64': 'macos15-x86_64.tar.gz',
  }
  const asset = assets[platform]
  if (!asset) throw new Error(`Unsupported MySQL runtime platform: ${platform}`)
  const series = version.split('.').slice(0, 2).join('.')
  return `https://cdn.mysql.com/Downloads/MySQL-${series}/mysql-${version}-${asset}`
}
