/**
 * Packagist (packagist.org) fallback for PHP/Composer packages.
 *
 * Similar to npm-fallback.ts — provides read-only access to the
 * public Packagist API for package discovery and metadata.
 */

const PACKAGIST_API = 'https://packagist.org'

export interface PackagistPackage {
  name: string
  description: string
  url: string
  repository: string
  downloads: number
  favers: number
}

export interface PackagistSearchResult {
  name: string
  description: string
  url: string
  repository: string
  downloads: number
  favers: number
}

/**
 * Search Packagist for packages
 */
export async function searchPackagist(query: string, limit = 20): Promise<PackagistSearchResult[]> {
  try {
    const url = `${PACKAGIST_API}/search.json?q=${encodeURIComponent(query)}&per_page=${Math.min(limit, 30)}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'pantry-registry/1.0' },
    })
    if (!response.ok) return []

    const data = await response.json() as any
    return (data.results || []).slice(0, limit).map((r: any) => ({
      name: r.name,
      description: r.description || '',
      url: r.url || '',
      repository: r.repository || '',
      downloads: r.downloads || 0,
      favers: r.favers || 0,
    }))
  }
  catch {
    return []
  }
}

/**
 * Fetch package metadata from Packagist
 */
export async function fetchFromPackagist(name: string): Promise<{
  name: string
  description: string
  version: string
  license: string[]
  homepage: string
  repository: string
  downloads: number
  favers: number
  type: string
  versions: string[]
  require: Record<string, string>
} | null> {
  try {
    // Validate package name matches vendor/package format
    if (!/^[a-z0-9]([a-z0-9._-]*[a-z0-9])?\/[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/i.test(name)) {
      return null
    }
    const response = await fetch(`${PACKAGIST_API}/packages/${encodeURIComponent(name)}.json`, {
      headers: { 'User-Agent': 'pantry-registry/1.0' },
    })
    if (!response.ok) return null

    const data = await response.json() as any
    const pkg = data.package
    if (!pkg) return null

    // Get latest stable version (sort by semver descending)
    const versionKeys = Object.keys(pkg.versions || {})
    const stableVersions = versionKeys
      .filter(v => !v.includes('dev') && !v.includes('alpha') && !v.includes('beta') && !v.includes('RC'))
      .sort((a, b) => {
        const pa = a.replace(/^v/, '').split('.').map(Number)
        const pb = b.replace(/^v/, '').split('.').map(Number)
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
          if (diff !== 0) return diff
        }
        return 0
      })
    const latestKey = stableVersions[0] || versionKeys[0] || ''
    const latest = pkg.versions?.[latestKey] || {}

    return {
      name: pkg.name,
      description: pkg.description || '',
      version: latest.version_normalized || latest.version || latestKey.replace(/^v/, '') || 'unknown',
      license: latest.license || [],
      homepage: latest.homepage || pkg.repository || '',
      repository: pkg.repository || '',
      downloads: pkg.downloads?.total || 0,
      favers: pkg.favers || 0,
      type: pkg.type || latest.type || 'library',
      versions: versionKeys.map((v: string) => v.replace(/^v/, '')).filter((v: string) => /^\d/.test(v)).slice(0, 50),
      require: latest.require || {},
    }
  }
  catch {
    return null
  }
}

/**
 * Get total package count from Packagist
 * Uses a lightweight endpoint to avoid heavy API calls
 */
let _packagistCountCache: { count: number, timestamp: number } | null = null

export async function getPackagistCount(): Promise<number> {
  // Cache for 1 hour
  if (_packagistCountCache && Date.now() - _packagistCountCache.timestamp < 3600000) {
    return _packagistCountCache.count
  }

  try {
    const response = await fetch(`${PACKAGIST_API}/statistics.json`, {
      headers: { 'User-Agent': 'pantry-registry/1.0' },
    })
    if (!response.ok) return _packagistCountCache?.count || 350000

    const data = await response.json() as any
    const count = data.totals?.packages || 350000
    _packagistCountCache = { count, timestamp: Date.now() }
    return count
  }
  catch {
    return _packagistCountCache?.count || 350000
  }
}
