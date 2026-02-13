/**
 * pkgx Package Fetcher - No Playwright Required!
 *
 * Fetches package data from pkgx.dev's JSON API (primary)
 * and GitHub pantry repository (fallback with rate limit handling)
 * using only Bun native APIs
 */

export interface PkgxPackageData {
  name: string
  domain: string
  brief?: string
  description?: string
  displayName?: string
  version?: string
  homepage?: string
  github?: string
  brew_url?: string
  license?: string
  provides?: string[]
  companions?: Record<string, string> | string[]
  // Runtime dependencies (from top-level dependencies in package.yml)
  dependencies?: Record<string, string | Record<string, string>> | string[]
  // Build-time dependencies (from build.dependencies in package.yml)
  buildDependencies?: string[]
  // All dependencies combined (runtime + build) for backwards compatibility
  allDependencies?: string[]
  // Test dependencies (from test.dependencies in package.yml, if exists)
  testDependencies?: string[]
  build?: {
    dependencies?: Record<string, string | Record<string, string>>
    script?: string | string[]
  }
  interprets?: {
    extensions: string | string[]
    args?: string | string[]
  }
  versions?: string[]
  [key: string]: any
}

export interface PkgxFetchOptions {
  /**
   * Timeout for requests in milliseconds
   * @default 15000
   */
  timeout?: number

  /**
   * Whether to include raw YAML content (GitHub fallback only)
   * @default false
   */
  includeRaw?: boolean

  /**
   * Custom GitHub token for higher rate limits
   */
  githubToken?: string

  /**
   * Branch to fetch from (GitHub fallback only)
   * @default 'main'
   */
  branch?: string

  /**
   * Whether to use GitHub as primary source instead of pkgx.dev JSON API
   * @default false
   */
  preferGitHub?: boolean

  /**
   * Cache responses to avoid hitting rate limits
   * @default true
   */
  useCache?: boolean
}

// Simple in-memory cache
const packageCache = new Map<string, { data: PkgxPackageData, timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

/**
 * Fetch package data from pkgx.dev JSON API (no rate limits!)
 */
async function fetchFromPkgxAPI(
  packageName: string,
  options: PkgxFetchOptions = {},
): Promise<PkgxPackageData> {
  const { timeout = 15000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // pkgx.dev uses the package name directly in the URL
    const url = `https://pkgx.dev/pkgs/${packageName}.json`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ts-pkgx',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json() as Record<string, any>

    // Normalize the data structure
    const packageData: PkgxPackageData = {
      name: data.displayName || data.name || packageName.split('/').pop() || packageName,
      domain: data.project || packageName,
      brief: data.brief,
      description: data.description || data.brief,
      displayName: data.displayName,
      homepage: data.homepage,
      github: data.github,
      brew_url: data.brew_url,
      license: data.license,
      provides: data.provides,
      ...data,
    }

    return packageData
  }
  finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetch package data from GitHub pantry (fallback with rate limits)
 */
async function fetchFromGitHub(
  packageName: string,
  options: PkgxFetchOptions = {},
): Promise<PkgxPackageData> {
  const {
    timeout = 15000,
    includeRaw = false,
    githubToken,
    branch = 'main',
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const url = `https://raw.githubusercontent.com/pkgxdev/pantry/${branch}/projects/${packageName}/package.yml`

    const headers: Record<string, string> = {
      'User-Agent': 'ts-pkgx',
    }

    if (githubToken) {
      headers.Authorization = `token ${githubToken}`
    }

    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch package.yml: ${response.status} ${response.statusText}`)
    }

    const yamlContent = await response.text()

    // Parse YAML using Bun's native parser
    const data = Bun.YAML.parse(yamlContent) as Record<string, any>

    // Extract domain from package name
    const domain = packageName

    // Extract name (usually the last part of the domain)
    const nameParts = packageName.split('/')
    const name = nameParts[nameParts.length - 1]

    // Build the package data structure
    const packageData: PkgxPackageData = {
      name,
      domain,
      description: data.display_name || data.description || `${name} package`,
      ...data,
    }

    // Extract GitHub URL if available
    if (data.versions?.github) {
      packageData.github = `https://github.com/${data.versions.github}`
    }

    // Extract homepage from distributable URL or other sources
    if (data.distributable?.url && !packageData.homepage) {
      try {
        const urlParts = data.distributable.url.split('/')
        const url = new URL(`${urlParts[0]}//${urlParts[2]}`)
        packageData.homepage = url.origin
      }
      catch {
        // Invalid URL, skip
      }
    }

    if (includeRaw) {
      packageData._raw = yamlContent
    }

    return packageData
  }
  finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetch package data from pkgx (tries pkgx.dev JSON API first, falls back to GitHub)
 */
export async function fetchPkgxPackage(
  packageName: string,
  options: PkgxFetchOptions = {},
): Promise<PkgxPackageData> {
  const { useCache = true, preferGitHub = false } = options

  // Check cache first
  if (useCache) {
    const cached = packageCache.get(packageName)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data
    }
  }

  let packageData: PkgxPackageData

  try {
    if (preferGitHub) {
      // Use GitHub as primary
      packageData = await fetchFromGitHub(packageName, options)
    }
    else {
      // Try pkgx.dev JSON API first (no rate limits!)
      try {
        packageData = await fetchFromPkgxAPI(packageName, options)
      }
      catch (apiError) {
        // Fall back to GitHub if pkgx.dev API fails
        console.warn(`pkgx.dev API failed for ${packageName}, trying GitHub fallback:`, apiError)
        packageData = await fetchFromGitHub(packageName, options)
      }
    }

    // Cache the result
    if (useCache) {
      packageCache.set(packageName, {
        data: packageData,
        timestamp: Date.now(),
      })
    }

    return packageData
  }
  catch (error) {
    throw new Error(`Failed to fetch package ${packageName}: ${error}`)
  }
}

/**
 * Fetch multiple packages in parallel
 */
export async function fetchPkgxPackages(
  packageNames: string[],
  options: PkgxFetchOptions = {},
): Promise<Map<string, PkgxPackageData>> {
  const results = new Map<string, PkgxPackageData>()

  const promises = packageNames.map(async (name) => {
    try {
      const data = await fetchPkgxPackage(name, options)
      results.set(name, data)
    }
    catch (error) {
      console.error(`Failed to fetch ${name}:`, error)
    }
  })

  await Promise.all(promises)
  return results
}

/**
 * List all available packages from pkgx.dev
 */
export async function listPkgxPackages(
  options: Pick<PkgxFetchOptions, 'timeout'> = {},
): Promise<string[]> {
  const { timeout = 15000 } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch('https://pkgx.dev/pkgs/index.json', {
      headers: {
        'User-Agent': 'ts-pkgx',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to list packages: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as Array<{ project: string }>

    // Extract package names
    const packages = data.map(item => item.project)

    return packages
  }
  finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Search for packages by name or description
 */
export async function searchPkgxPackages(
  query: string,
  options: PkgxFetchOptions = {},
): Promise<PkgxPackageData[]> {
  const allPackages = await listPkgxPackages(options)

  // Filter packages that match the query
  const matchingPackages = allPackages.filter((pkg) => {
    const lowerQuery = query.toLowerCase()
    return pkg.toLowerCase().includes(lowerQuery)
  })

  // Fetch the matching packages
  const results = await fetchPkgxPackages(matchingPackages, options)

  return Array.from(results.values())
}

/**
 * Get package metadata including versions and dependencies
 */
export async function getPkgxPackageMetadata(
  packageName: string,
  options: PkgxFetchOptions = {},
): Promise<{
    package: PkgxPackageData
    versions: string[]
    dependencies: string[]
    companions: string[]
  }> {
  const packageData = await fetchPkgxPackage(packageName, options)

  // Extract versions (would need to parse from versions.github or fetch tags)
  const versions: string[] = []

  // Extract dependencies
  const dependencies: string[] = []
  if (packageData.dependencies) {
    for (const [key, value] of Object.entries(packageData.dependencies)) {
      if (typeof value === 'string') {
        dependencies.push(key)
      }
      else if (typeof value === 'object') {
        // Platform-specific dependencies
        for (const dep of Object.keys(value)) {
          dependencies.push(dep)
        }
      }
    }
  }

  // Extract companions
  const companions: string[] = []
  if (packageData.companions) {
    companions.push(...Object.keys(packageData.companions))
  }

  return {
    package: packageData,
    versions,
    dependencies,
    companions,
  }
}

/**
 * Check if a package exists in the pantry
 */
export async function pkgxPackageExists(
  packageName: string,
  options: Pick<PkgxFetchOptions, 'timeout' | 'githubToken' | 'branch'> = {},
): Promise<boolean> {
  try {
    await fetchPkgxPackage(packageName, { ...options, timeout: options.timeout || 5000 })
    return true
  }
  catch {
    return false
  }
}

/**
 * Clear the package cache
 */
export function clearPkgxCache(): void {
  packageCache.clear()
}

/**
 * Get cache statistics
 */
export function getPkgxCacheStats(): { size: number, packages: string[] } {
  return {
    size: packageCache.size,
    packages: Array.from(packageCache.keys()),
  }
}
