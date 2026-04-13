import type { PackageMetadata, SearchResult } from './types'

const NPM_REGISTRY = 'https://registry.npmjs.org'

/**
 * Fetch package metadata from npm registry
 */
export async function fetchFromNpm(name: string, version?: string): Promise<PackageMetadata | null> {
  try {
    const url = version
      ? `${NPM_REGISTRY}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`
      : `${NPM_REGISTRY}/${encodeURIComponent(name)}/latest`

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
  catch {
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
    const response = await fetch(`${NPM_REGISTRY}/${encodeURIComponent(name)}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) {
      return []
    }

    const data = await response.json() as Record<string, any>
    return Object.keys(data.versions || {}).sort((a, b) => {
      // Sort by semver descending (handle non-numeric segments safely)
      const aParts = a.split('.').map(s => Number.parseInt(s, 10) || 0)
      const bParts = b.split('.').map(s => Number.parseInt(s, 10) || 0)
      const len = Math.max(aParts.length, bParts.length)
      for (let i = 0; i < len; i++) {
        const diff = (bParts[i] ?? 0) - (aParts[i] ?? 0)
        if (diff !== 0) return diff
      }
      return 0
    })
  }
  catch {
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
  catch {
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
    if (!['registry.npmjs.org', 'registry.yarnpkg.com'].includes(tarballUrl.hostname) && !tarballUrl.hostname.endsWith('.npmjs.org')) {
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
  catch {
    return null
  }
}
