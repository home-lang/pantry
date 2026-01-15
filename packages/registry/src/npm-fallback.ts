import type { PackageMetadata, SearchResult } from './types'

const NPM_REGISTRY = 'https://registry.npmjs.org'

/**
 * Fetch package metadata from npm registry
 */
export async function fetchFromNpm(name: string, version?: string): Promise<PackageMetadata | null> {
  try {
    const url = version
      ? `${NPM_REGISTRY}/${encodeURIComponent(name)}/${version}`
      : `${NPM_REGISTRY}/${encodeURIComponent(name)}/latest`

    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
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
    const response = await fetch(`${NPM_REGISTRY}/${encodeURIComponent(name)}`)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Object.keys(data.versions || {}).sort((a, b) => {
      // Sort by semver descending
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
      if (aMajor !== bMajor)
        return bMajor - aMajor
      if (aMinor !== bMinor)
        return bMinor - aMinor
      return bPatch - aPatch
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
    const response = await fetch(
      `${NPM_REGISTRY}/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`,
    )
    if (!response.ok) {
      return []
    }

    const data = await response.json()
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

    const response = await fetch(metadata.tarballUrl)
    if (!response.ok) {
      return null
    }

    return response.arrayBuffer()
  }
  catch {
    return null
  }
}
