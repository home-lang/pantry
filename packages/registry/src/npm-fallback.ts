import type { PackageMetadata, SearchResult } from './types'

const NPM_REGISTRY = 'https://registry.npmjs.org'

/**
 * Fetch package metadata from npm registry
 */
export async function fetchFromNpm(name: string, version?: string): Promise<PackageMetadata | null> {
  try {
    // npm uses /{name} not /{encoded-name} — scoped packages use @scope%2Fname
    const encodedName = name.startsWith('@')
      ? `@${encodeURIComponent(name.slice(1))}`
      : encodeURIComponent(name)
    const url = version
      ? `${NPM_REGISTRY}/${encodedName}/${encodeURIComponent(version)}`
      : `${NPM_REGISTRY}/${encodedName}/latest`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) {
      return null
    }

    const data = await response.json() as Record<string, any>
    return {
      name: data.name,
      version: data.version,
      description: data.description,
      repository: typeof data.repository === 'string' ? data.repository : data.repository?.url,
      homepage: data.homepage,
      license: typeof data.license === 'string' ? data.license : data.license?.type,
      author: typeof data.author === 'string' ? data.author : data.author?.name,
      keywords: data.keywords,
      dependencies: data.dependencies,
      devDependencies: data.devDependencies,
      peerDependencies: data.peerDependencies,
      tarballUrl: data.dist?.tarball,
      checksum: data.dist?.shasum ? `sha1:${data.dist.shasum}` : undefined,
      publishedAt: new Date().toISOString(),
    }
  }
  catch (err) {
    console.warn('npm fallback: fetch failed:', (err as Error).message)
    return null
  }
}

/**
 * List all versions of a package from npm
 */
export async function listNpmVersions(name: string): Promise<string[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    const encodedName = name.startsWith('@')
      ? `@${encodeURIComponent(name.slice(1))}`
      : encodeURIComponent(name)
    const response = await fetch(`${NPM_REGISTRY}/${encodedName}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) {
      return []
    }

    const data = await response.json() as Record<string, any>
    return Object.keys(data.versions || {}).sort((a, b) => {
      const parse = (v: string) => {
        const dashIdx = v.indexOf('-')
        const numeric = (dashIdx === -1 ? v : v.slice(0, dashIdx)).split('.').map(s => {
          const n = Number.parseInt(s, 10)
          return Number.isNaN(n) ? 0 : n
        })
        const prerelease = dashIdx === -1 ? null : v.slice(dashIdx + 1)
        return { numeric, prerelease }
      }
      const pa = parse(a)
      const pb = parse(b)
      const len = Math.max(pa.numeric.length, pb.numeric.length)
      for (let i = 0; i < len; i++) {
        const diff = (pb.numeric[i] ?? 0) - (pa.numeric[i] ?? 0)
        if (diff !== 0) return diff
      }
      if (pa.prerelease === null && pb.prerelease !== null) return -1
      if (pa.prerelease !== null && pb.prerelease === null) return 1
      if (pa.prerelease !== null && pb.prerelease !== null) {
        return pa.prerelease < pb.prerelease ? 1 : pa.prerelease > pb.prerelease ? -1 : 0
      }
      return 0
    })
  }
  catch (err) {
    console.warn('npm fallback: failed to list versions:', (err as Error).message)
    return []
  }
}

/**
 * Search npm registry
 */
export async function searchNpm(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    const response = await fetch(
      `${NPM_REGISTRY}/-/v1/search?text=${encodeURIComponent(query)}&size=${Math.min(limit, 100)}`,
      { signal: controller.signal },
    )
    clearTimeout(timeout)
    if (!response.ok) {
      return []
    }

    const data = await response.json() as Record<string, any>
    return (data.objects || []).map((obj: any) => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description,
      keywords: obj.package.keywords,
      author: obj.package.author?.name,
      downloads: obj.downloads?.weekly || 0,
    }))
  }
  catch (err) {
    console.warn('npm fallback: search failed:', (err as Error).message)
    return []
  }
}

/**
 * Download tarball from npm
 */
export async function downloadNpmTarball(name: string, version: string): Promise<ArrayBuffer | null> {
  try {
    const metadata = await fetchFromNpm(name, version)
    if (!metadata?.tarballUrl) {
      return null
    }

    // Validate tarball URL is from expected registries (SSRF protection)
    const tarballUrl = new URL(metadata.tarballUrl)
    if (!['registry.npmjs.org', 'registry.yarnpkg.com'].includes(tarballUrl.hostname)) {
      return null
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    const response = await fetch(metadata.tarballUrl, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) {
      return null
    }

    return response.arrayBuffer()
  }
  catch (err) {
    console.warn('npm fallback: tarball download failed:', (err as Error).message)
    return null
  }
}
