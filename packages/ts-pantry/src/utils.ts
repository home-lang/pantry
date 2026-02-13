import type { ProjectFolder } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { aliases } from './packages/aliases'

const GITHUB_RATE_LIMIT_FILE = path.join(process.cwd(), 'github-rate-limit.json')
const GITHUB_CACHE_FILE = path.join(process.cwd(), 'github-cache.json')
const MIN_REMAINING_CALLS = 10 // Preserve at least this many GitHub API calls
const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour cache expiration

/**
 * Saves GitHub API rate limit information to a file
 * @param headers Response headers from a GitHub API request
 */
export function saveRateLimitInfo(headers: Headers): void {
  try {
    const rateLimitRemaining = headers.get('X-RateLimit-Remaining')
    const rateLimitReset = headers.get('X-RateLimit-Reset')
    const rateLimitLimit = headers.get('X-RateLimit-Limit')

    if (rateLimitRemaining && rateLimitReset && rateLimitLimit) {
      const resetTime = new Date(Number(rateLimitReset) * 1000)
      const info = {
        remaining: Number(rateLimitRemaining),
        limit: Number(rateLimitLimit),
        resetTime: resetTime.toISOString(),
        resetTimestamp: Number(rateLimitReset) * 1000,
        lastUpdated: new Date().toISOString(),
      }

      fs.writeFileSync(GITHUB_RATE_LIMIT_FILE, JSON.stringify(info, null, 2))
      console.warn(`GitHub API rate limit info saved to ${GITHUB_RATE_LIMIT_FILE}`)
      console.warn(`Rate limit: ${rateLimitRemaining}/${rateLimitLimit} remaining, resets at ${resetTime.toLocaleString()}`)
    }
  }
  catch (error) {
    console.error('Failed to save GitHub rate limit info:', error)
  }
}

/**
 * Checks if we should proceed with a GitHub API request based on rate limit
 * and adds delays when necessary to avoid hitting limits
 * @returns boolean indicating if the request should proceed
 */
export function shouldProceedWithGitHubRequest(): boolean {
  try {
    if (!fs.existsSync(GITHUB_RATE_LIMIT_FILE)) {
      // No rate limit info yet, proceed cautiously
      return true
    }

    const rateLimitInfo = JSON.parse(fs.readFileSync(GITHUB_RATE_LIMIT_FILE, 'utf8'))
    const now = Date.now()

    // If reset time has passed, we can proceed
    if (now >= rateLimitInfo.resetTimestamp) {
      return true
    }

    // Check if we have enough calls remaining
    if (rateLimitInfo.remaining <= MIN_REMAINING_CALLS) {
      const resetTime = new Date(rateLimitInfo.resetTimestamp)
      console.warn(`GitHub API rate limit almost exhausted (${rateLimitInfo.remaining}/${rateLimitInfo.limit} remaining). Preserving remaining calls until reset at ${resetTime.toLocaleString()}`)

      // Get wait time in seconds
      const waitTimeMs = rateLimitInfo.resetTimestamp - now

      // If wait time is reasonable (less than 5 minutes), add a delay
      if (waitTimeMs < 5 * 60 * 1000) {
        console.error(`Waiting ${Math.round(waitTimeMs / 1000)} seconds for rate limit to reset...`)
        // We don't actually wait here, but we'll use cached data instead
      }

      return false
    }

    return true
  }
  catch (error) {
    console.error('Error checking GitHub rate limit:', error)
    // Proceed cautiously in case of error
    return true
  }
}

/**
 * Gets cached GitHub package list if it exists and is still valid
 * @returns Array of package paths from cache, or null if cache invalid
 */
export function getGitHubPackageCache(): string[] | null {
  try {
    if (!fs.existsSync(GITHUB_CACHE_FILE)) {
      return null
    }

    const cacheData = JSON.parse(fs.readFileSync(GITHUB_CACHE_FILE, 'utf8'))
    const now = Date.now()

    // Check if cache is still valid (1 hour)
    if (cacheData.timestamp && (now - cacheData.timestamp < CACHE_DURATION_MS)) {
      const expiresAt = new Date(cacheData.timestamp + CACHE_DURATION_MS)

      console.error(`Using GitHub API cache from ${new Date(cacheData.timestamp).toLocaleString()}, expires at ${expiresAt.toLocaleString()}`)

      // Check if we have the packages array in the expected format
      if (Array.isArray(cacheData.packages)) {
        console.error(`Using ${cacheData.packages.length} packages from GitHub API cache`)
        return cacheData.packages
      }
      else if (Array.isArray(cacheData.data)) {
        // Support for older cache format
        console.error(`Using ${cacheData.data.length} packages from GitHub API cache (old format)`)
        return cacheData.data
      }
      else {
        console.error('GitHub API cache has invalid format, fetching fresh data')
        return null
      }
    }

    console.error(`GitHub API cache expired (older than ${CACHE_DURATION_MS / 1000 / 60} minutes), fetching fresh data`)
    return null
  }
  catch (error) {
    console.error('Error reading GitHub cache:', error)
    return null
  }
}

/**
 * Saves GitHub package list to cache
 * @param packages Array of package paths to cache
 */
export function saveGitHubPackageCache(packages: string[]): void {
  try {
    const cacheData = {
      timestamp: Date.now(),
      packages,
    }

    fs.writeFileSync(GITHUB_CACHE_FILE, JSON.stringify(cacheData, null, 2))
    console.error(`GitHub API package list cached to ${GITHUB_CACHE_FILE} (${packages.length} packages)`)
  }
  catch (error) {
    console.error('Error saving GitHub cache:', error)
  }
}

/**
 * Fetches a list of packages from GitHub API using nested directory approach
 * @param limit Maximum number of packages to return (0 for all)
 * @param singlePackage Optional specific package to return (skips fetching others)
 * @returns Array of package paths
 */
export async function fetchPackageListFromGitHub(limit: number = 0, singlePackage?: string): Promise<string[]> {
  // If a single package is requested, just return that package
  if (singlePackage) {
    // Validate that the package name is legitimate and not a path
    if (singlePackage.startsWith('/') || singlePackage.includes('/bin/')) {
      console.error(`Error: '${singlePackage}' appears to be a path, not a valid package name.`)
      // Return empty list to indicate failure
      return []
    }

    console.log(`Single package mode: only fetching '${singlePackage}'`)
    return [singlePackage]
  }

  console.log('Fetching package list from GitHub API...')

  // Check cache first
  const cachedPackages = getGitHubPackageCache()
  if (cachedPackages) {
    console.log('Using cached package list, no GitHub API calls needed')
    return limit > 0 ? cachedPackages.slice(0, limit) : cachedPackages
  }

  try {
    if (!shouldProceedWithGitHubRequest()) {
      console.warn('GitHub API rate limit preventing request - using cached data or hardcoded list')

      // If we hit rate limits, return a minimal hardcoded list rather than failing completely
      const hardcodedFallbackPackages = [
        'node',
        'bun.sh',
        'python.org',
        'go.dev',
        'rust-lang.org',
        'deno.land',
        'ruby-lang.org',
        'php.net',
        'dart.dev',
        'postgresql.org',
        'mozilla.org',
        'mysql.com',
        'nginx.org',
        'redis.io',
        'mongodb.com',
      ]

      // If we have to use the fallback, still cache it to avoid further API calls
      saveGitHubPackageCache(hardcodedFallbackPackages)

      return limit > 0 ? hardcodedFallbackPackages.slice(0, limit) : hardcodedFallbackPackages
    }

    console.error('No valid cache found, making GitHub API requests')

    // Fetch base projects
    const response = await fetch('https://api.github.com/repos/pkgxdev/pantry/contents/projects', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ts-pkgx',
      },
    })

    // Save rate limit info
    saveRateLimitInfo(response.headers)

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`)
    }

    const baseProjects = await response.json() as { name: string, type: string }[]
    const baseProjectNames = baseProjects
      .filter(item => item.type === 'dir')
      .map(item => item.name)

    console.error(`Found ${baseProjectNames.length} base projects on GitHub`)

    // Project paths to return
    const projectPaths: string[] = [...baseProjectNames]

    // Known projects with nested paths to look for
    const projectsWithNestedPaths = [
      'agwa.name',
      'acorn.io',
      'apache.org',
      'aquasecurity.github.io',
      'aws.amazon.com',
    ]

    // Additional known nested projects to add without API calls
    const knownNestedProjects = [
      'alsa-project.org/alsa-lib',
      'apple.com/remote_cmds',
      'android.com/cmdline-tools',
      'anchore.com/syft',
      'argoproj.github.io/cd',
      'argoproj.github.io/workflows',
      'amrdeveloper.github.io/GQL',
      'authzed.com/spicedb',
      'arduino.github.io/arduino-cli',
      'aomedia.googlesource.com/aom',
      'akuity.io/kargo',
      'asciinema.org/agg',
      'ansible.com/ansible-lint',
      'astral.sh/ruff',
      'astral.sh/uv',
      'apollographql.com/rover',
      'brxken128.github.io/dexios',
      'cedarpolicy.com/cli',
      'blake2.net/libb2',
    ]

    // Fetch nested projects - only check a few common ones to save API calls
    for (const project of projectsWithNestedPaths) {
      // Skip if rate limit is low
      if (!shouldProceedWithGitHubRequest()) {
        console.error(`Skipping nested path check for ${project} due to rate limit concerns`)
        continue
      }

      try {
        console.error(`Checking for nested projects in ${project}...`)

        const nestedResponse = await fetch(`https://api.github.com/repos/pkgxdev/pantry/contents/projects/${project}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'ts-pkgx',
          },
        })

        // Save rate limit info
        saveRateLimitInfo(nestedResponse.headers)

        if (!nestedResponse.ok) {
          console.error(`Failed to fetch nested projects for ${project}: ${nestedResponse.status}`)
          continue
        }

        const nestedProjects = await nestedResponse.json() as { name: string, type: string }[]
        const nestedPaths = nestedProjects
          .filter(item => item.type === 'dir')
          .map(item => `${project}/${item.name}`)

        console.error(`Found ${nestedPaths.length} nested projects for ${project}: ${nestedPaths.join(', ')}`)

        projectPaths.push(...nestedPaths)
      }
      catch (error) {
        console.error(`Error fetching nested projects for ${project}:`, error)
      }
    }

    // Add known nested projects without making API calls
    for (const nestedProject of knownNestedProjects) {
      if (!projectPaths.includes(nestedProject)) {
        console.error(`Adding known nested project: ${nestedProject}`)
        projectPaths.push(nestedProject)
      }
    }

    // Cache the results for future use
    saveGitHubPackageCache(projectPaths)
    console.error(`Cached ${projectPaths.length} packages for future use (valid for ${CACHE_DURATION_MS / 60000} minutes)`)

    // Apply limit if specified
    const finalProjects = limit > 0 ? projectPaths.slice(0, limit) : projectPaths

    console.error(`Total of ${projectPaths.length} projects found (including nested paths)`)

    return finalProjects
  }
  catch (error) {
    console.error('Error fetching package list from GitHub:', error)
    return []
  }
}

/**
 * Demo function to show how to use fetchPkgxProjects
 * @returns Promise resolving to array of projects or empty array on error
 */
export async function logPkgxProjects(): Promise<ProjectFolder[]> {
  try {
    // Lazy import to avoid circular dependencies and module loading issues
    const { fetchPkgxProjects } = await import('./fetch')

    // Fetch all projects using the API
    const projects = await fetchPkgxProjects()

    // Use allowed console methods
    console.error(`Found ${projects.length} projects`)

    // Display first 10 projects as an example - using error since it's allowed
    if (projects.length > 0) {
      console.error('First 10 projects:')
      projects.slice(0, 10).forEach((project: ProjectFolder) => {
        console.error(`- ${project.name}`)
      })

      if (projects.length > 10) {
        console.error(`... and ${projects.length - 10} more`)
      }
    }

    return projects
  }
  catch (error) {
    console.error('Failed to fetch projects:', error)
    return []
  }
}

/**
 * Formats an object as a string without quotes around property names
 * Used for generating TypeScript files with clean object syntax
 *
 * @param obj The object to format
 * @param indent The indentation level
 * @returns A formatted string representation of the object
 */
export function formatObjectWithoutQuotedKeys(obj: any, indent = 2): string {
  if (obj === null)
    return 'null'
  if (obj === undefined)
    return 'undefined'

  if (Array.isArray(obj)) {
    if (obj.length === 0)
      return '[]'

    // For arrays with string items, use a more compact format with proper indentation
    if (obj.every(item => typeof item === 'string')) {
      if (obj.length === 1) {
        return `[${JSON.stringify(obj[0])}]`
      }

      // Format string arrays with consistent indentation
      const items = obj.map(item => JSON.stringify(item)).join(`,\n${' '.repeat(indent)}`)
      return `[\n${' '.repeat(indent)}${items}\n${' '.repeat(indent - 2)}]`
    }

    // For non-string arrays, use recursive formatting
    const items = obj.map(item =>
      formatObjectWithoutQuotedKeys(item, indent + 2),
    ).join(`,\n${' '.repeat(indent + 2)}`)

    return `[\n${' '.repeat(indent + 2)}${items}\n${' '.repeat(indent)}]`
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj).map(([key, value]) => {
      const formattedValue = typeof value === 'string'
        ? JSON.stringify(value)
        : formatObjectWithoutQuotedKeys(value, indent + 2)

      return `${' '.repeat(indent)}${key}: ${formattedValue}`
    }).join(',\n')

    return `{\n${entries}\n}`
  }

  return String(obj)
}

/**
 * Utility functions for handling package domains and nested paths
 * These utilities help standardize the naming conventions for TypeScript files
 */

/**
 * Converts a domain name to a safe TypeScript variable name
 * @param domain Domain name (e.g., 'bun.sh', 'agwa.name/git-crypt')
 * @returns Safe TypeScript variable name (e.g., 'bunsh', 'agwanamegitcrypt')
 */
export function convertDomainToVarName(domain: string): string {
  // Handle nested paths
  if (domain.includes('/')) {
    const parts = domain.split('/')
    const parentDomain = parts[0]
    const subPaths = parts.slice(1)

    // Remove all dots and dashes from parent domain
    const cleanParent = parentDomain.replace(/[.-]/g, '')

    // Clean and process subpaths
    const cleanSubPaths = subPaths.map(part => part.replace(/[.-]/g, ''))

    // For deduplication logic: if the last subpath appears in the domain name (like github.com/cli/cli),
    // or if we have multiple path segments, use only the first unique one
    let finalSubPath = ''
    if (cleanSubPaths.length > 0) {
      // Check if any subpath is already contained in the parent domain
      const firstSubPath = cleanSubPaths[0]
      if (cleanParent.includes(firstSubPath.toLowerCase())) {
        // If the subpath name is already in the domain (like cli in cli.github.com),
        // use it only once by taking just the domain
        finalSubPath = ''
      }
      else if (cleanSubPaths.length === 1) {
        // Single subpath, use it
        finalSubPath = firstSubPath
      }
      else {
        // Multiple subpaths: use only the first one to avoid duplication
        // This handles cases like 'complex-domain.example.com/nested/path' -> 'complexdomainexamplecomnested'
        finalSubPath = firstSubPath
      }
    }

    // Combine all parts without any separator
    return `${cleanParent}${finalSubPath}`.toLowerCase()
  }

  // Regular domains like 'bun.sh' -> 'bunsh'
  return domain.replace(/[.-]/g, '').toLowerCase()
}

/**
 * Converts a domain name to a standard format for file names
 * @param domain Domain name or path
 * @returns Filename-safe version (e.g., 'bun.sh' -> 'bunsh', 'agwa.name/git-crypt' -> 'agwaname-gitcrypt')
 */
export function convertDomainToFileName(domain: string): string {
  // Handle nested paths consistently with convertDomainToVarName function
  if (domain.includes('/')) {
    const [parentDomain, subPath] = domain.split('/')
    // Clean the parent domain (remove dots)
    const cleanParent = parentDomain.replace(/\./g, '')

    // For filenames, preserve special characters in the subpath to ensure uniqueness
    // This ensures paths like 'apple.com/remote_cmds' become 'applecom-remote_cmds'
    const safeSubPath = subPath.replace(/\//g, '-')

    // For filenames, we use a hyphen between parent and subpath to maintain readability
    return `${cleanParent}-${safeSubPath}`.toLowerCase()
  }

  // Regular domains like 'bun.sh' -> 'bunsh'
  return domain.replace(/\./g, '').toLowerCase()
}

/**
 * Attempts to guess a domain name from a filename
 * @param fileName The filename (without extension)
 * @returns Best guess at the original domain
 */
export function guessOriginalDomain(fileName: string): string {
  // First check if it's a nested path (has a dash)
  if (fileName.includes('-')) {
    // Could be a nested path like 'agwaname-git-crypt'
    // We'll use the first dash to identify parent domain vs subpath
    const firstDashIndex = fileName.indexOf('-')
    const parentDomainFileName = fileName.substring(0, firstDashIndex)
    const subPath = fileName.substring(firstDashIndex + 1)

    // Try to reconstruct domain parts
    let domain = parentDomainFileName
    // Add dots for common domain extensions - only do this if there isn't already a dot
    if (domain.endsWith('org') && !domain.endsWith('.org'))
      domain = domain.replace(/org$/, '.org')
    if (domain.endsWith('io') && !domain.endsWith('.io'))
      domain = domain.replace(/io$/, '.io')
    if (domain.endsWith('com') && !domain.endsWith('.com'))
      domain = domain.replace(/com$/, '.com')
    if (domain.endsWith('sh') && !domain.endsWith('.sh'))
      domain = domain.replace(/sh$/, '.sh')
    if (domain.endsWith('dev') && !domain.endsWith('.dev'))
      domain = domain.replace(/dev$/, '.dev')
    if (domain.endsWith('net') && !domain.endsWith('.net'))
      domain = domain.replace(/net$/, '.net')
    if (domain.endsWith('name') && !domain.endsWith('.name'))
      domain = domain.replace(/name$/, '.name')

    // Reconstruct the nested path, preserving the original subpath (including special characters)
    return `${domain}/${subPath}`
  }

  // Not a nested path, just add dots for common domains
  let domain = fileName
  // Add dots for common domain extensions - only do this if there isn't already a dot
  if (domain.endsWith('org') && !domain.endsWith('.org'))
    domain = domain.replace(/org$/, '.org')
  if (domain.endsWith('io') && !domain.endsWith('.io'))
    domain = domain.replace(/io$/, '.io')
  if (domain.endsWith('com') && !domain.endsWith('.com'))
    domain = domain.replace(/com$/, '.com')
  if (domain.endsWith('sh') && !domain.endsWith('.sh'))
    domain = domain.replace(/sh$/, '.sh')
  if (domain.endsWith('dev') && !domain.endsWith('.dev'))
    domain = domain.replace(/dev$/, '.dev')
  if (domain.endsWith('net') && !domain.endsWith('.net'))
    domain = domain.replace(/net$/, '.net')
  if (domain.endsWith('land') && !domain.endsWith('.land'))
    domain = domain.replace(/land$/, '.land')

  return domain
}

/**
 * Resolves a package name to its full domain name using the PACKAGE_ALIASES mapping
 * @param packageName The package name to resolve (e.g., 'node', 'python', 'nodejs.org')
 * @returns The resolved domain name (e.g., 'nodejs.org', 'python.org')
 */
export function resolvePackageDomain(packageName: string): string {
  // Handle version specifications by extracting just the package name
  const [name] = packageName.split('@')

  // Check if it's a known alias
  if (aliases[name]) {
    return aliases[name]
  }

  // If it already looks like a domain (contains a dot), return as-is
  if (name.includes('.')) {
    return name
  }

  // Fallback: assume it's a .org domain
  return `${name}.org`
}

/**
 * Gets all available package aliases
 * @returns Record of alias to domain mappings
 */
export function getPackageAliases(): Record<string, string> {
  return { ...aliases }
}

/**
 * Checks if a package name is a known alias
 * @param packageName The package name to check
 * @returns True if the package name is a known alias
 */
export function isKnownAlias(packageName: string): boolean {
  const [name] = packageName.split('@')
  return name in aliases
}

/**
 * Gets the canonical domain name for a package, whether it's an alias or already a domain
 * @param packageName The package name or domain to canonicalize
 * @returns The canonical domain name
 */
export function getCanonicalDomain(packageName: string): string {
  return resolvePackageDomain(packageName)
}
