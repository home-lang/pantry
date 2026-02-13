import type { FetchProjectsOptions, GitHubContent, PackageFetchOptions, PkgxPackage, ProjectFolder } from './types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getAliasOverrides, shouldReplaceAliases } from './alias-overrides'
import { DEFAULT_CACHE_DIR, DEFAULT_CACHE_EXPIRATION_MINUTES, DEFAULT_TIMEOUT_MS } from './consts'
import { aliases } from './packages/aliases'
import { scrapePkgxPackage } from './pkgx-scraper'
// Lazy import of utils functions to avoid module loading issues

// Legacy browser references - keeping for backwards compatibility but not used
type Browser = any
const _sharedBrowser: Browser | null = null
const browserPool: { browser: Browser, inUse: boolean, createdAt: number }[] = []
const MAX_BROWSER_POOL_SIZE = 10

/**
 * Helper function to get domain as TypeScript variable name
 */
function getDomainAsTypescriptName(domain: string): string {
  // First handle the case where there are slashes (nested paths)
  if (domain.includes('/')) {
    // Split into parent domain and subpath
    const [parentDomain, ...subPathParts] = domain.split('/')
    const subPath = subPathParts.join('/')

    // Clean parent domain part (remove dots)
    const cleanParent = parentDomain.replace(/\./g, '')

    // For GitHub projects, use just the last part (the repo name) for cleaner export names
    if (parentDomain.includes('github.com')) {
      // For GitHub repos like github.com/lrstanley/vault-unseal, use just "vault-unseal" -> "vaultunseal"
      const pathParts = subPath.split('/')
      const repoName = pathParts[pathParts.length - 1] // Get the last part
      return repoName.replace(/[.-]/g, '').toLowerCase()
    }

    // For variable names, we need to remove ALL special characters including slashes in the subpath
    const cleanSubPath = subPath.replace(/[/.-]/g, '')

    // Join without a separator to make a valid variable name
    return `${cleanParent}${cleanSubPath}`.toLowerCase()
  }

  // For regular domains (no slashes), just remove dots
  return domain.replace(/\./g, '').toLowerCase()
}

/**
 * Generates JSDoc comments for specific object properties
 */
function getPropertyJSDoc(key: string, value: any): string | null {
  switch (key) {
    case 'versions':
      if (Array.isArray(value) && value.length > 0) {
        return `  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */`
      }
      break

    case 'programs':
      if (Array.isArray(value) && value.length > 0) {
        return `  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */`
      }
      break

    case 'dependencies':
      if (Array.isArray(value) && value.length > 0) {
        // Check if any dependencies are OS-specific
        const hasOsDeps = value.some(dep => typeof dep === 'string' && dep.includes(':'))
        const osNote = hasOsDeps ? '\n  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).' : ''

        return `  /**
  * Runtime dependencies for this package.
  * These are required when running the package.${osNote}
  */`
      }
      break

    case 'buildDependencies':
      if (Array.isArray(value) && value.length > 0) {
        // Check if any dependencies are OS-specific
        const hasOsDeps = value.some(dep => typeof dep === 'string' && dep.includes(':'))
        const osNote = hasOsDeps ? '\n  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).' : ''

        return `  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.${osNote}
  */`
      }
      break

    case 'companions':
      if (Array.isArray(value) && value.length > 0) {
        return `  /**
  * Related packages that work well with this package.
  * Consider installing these for enhanced functionality.
  */`
      }
      break

    case 'aliases':
      if (Array.isArray(value) && value.length > 0) {
        return `  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */`
      }
      break

    case 'installCommand':
      return `  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */`

    case 'description':
      return `  /**
  * Brief description of what this package does.
  */`

    case 'domain':
      return `  /**
  * The canonical domain name for this package.
  */`

    case 'name':
      return `  /**
  * The display name of this package.
  */`

    default:
      return null
  }

  return null
}

/**
 * Format an object with 'as const' assertions for TypeScript
 */
function formatObjectWithAsConst(obj: Record<string, any>): string {
  const lines: string[] = []

  lines.push('{')

  // Add each property with appropriate formatting and JSDoc comments
  for (const [key, value] of Object.entries(obj)) {
    // Skip fetchedAt property to keep it out of TypeScript files
    if (key === 'fetchedAt')
      continue

    // Add JSDoc comments for specific properties
    const jsdocComment = getPropertyJSDoc(key, value)
    if (jsdocComment) {
      lines.push(jsdocComment)
    }

    if (value === undefined) {
      lines.push(`  ${key}: undefined,`)
      continue
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        // Empty array
        lines.push(`  ${key}: [] as const,`)
      }
      else if (typeof value[0] === 'string') {
        // For aliases array, filter out shell command patterns and package name duplicates
        let filteredArray = value
        if (key === 'aliases') {
          const packageName = obj.name
          filteredArray = value.filter((alias) => {
            // Filter out shell command patterns
            if (alias.includes('--') || alias.includes('$SHELL') || alias.includes('+') || alias.includes('(') || alias.includes(')')) {
              return false
            }
            // Filter out aliases that are the same as the package name
            if (alias === packageName) {
              return false
            }
            return true
          })
        }

        // Format string array with line breaks for readability
        if (filteredArray.length === 0) {
          lines.push(`  ${key}: [] as const,`)
        }
        else {
          lines.push(`  ${key}: [`)
          for (const item of filteredArray) {
            lines.push(`    '${String(item).replace(/'/g, '\\\'')}',`)
          }
          lines.push(`  ] as const,`)
        }
      }
      else {
        // Other array types - convert JSON.stringify output to use single quotes
        const jsonStr = JSON.stringify(value).replace(/"/g, '\'')
        lines.push(`  ${key}: ${jsonStr} as const,`)
      }
    }
    else if (typeof value === 'string') {
      // String with 'as const' using single quotes
      lines.push(`  ${key}: '${String(value).replace(/'/g, '\\\'')}' as const,`)
    }
    else if (typeof value === 'number' || typeof value === 'boolean') {
      // Numbers and booleans with 'as const'
      lines.push(`  ${key}: ${value} as const,`)
    }
    else if (value === null) {
      // Null values
      lines.push(`  ${key}: null,`)
    }
    else if (typeof value === 'object') {
      // Nested objects
      lines.push(`  ${key}: ${formatObjectWithAsConst(value)},`)
    }
    else {
      // Fallback for other types - convert JSON.stringify output to use single quotes
      const jsonStr = JSON.stringify(value).replace(/"/g, '\'')
      lines.push(`  ${key}: ${jsonStr},`)
    }
  }

  lines.push('}')

  return lines.join('\n')
}

/**
 * Generates comprehensive JSDoc documentation for a package
 */
function generatePackageJSDoc(packageInfo: PkgxPackage, domainName: string, packageDisplayName: string): string {
  const lines: string[] = []

  lines.push('/**')

  // Package title and description
  if (packageInfo.description) {
    lines.push(` * **${packageDisplayName}** - ${packageInfo.description.trim()}`)
  }
  else {
    lines.push(` * **${packageDisplayName}** - pkgx package`)
  }

  lines.push(' *')

  // Domain information
  lines.push(` * @domain \`${packageInfo.domain || domainName}\``)

  // Programs provided
  if (packageInfo.programs && packageInfo.programs.length > 0) {
    const programsList = packageInfo.programs.slice(0, 5).join('`, `')
    const morePrograms = packageInfo.programs.length > 5 ? `, ... (+${packageInfo.programs.length - 5} more)` : ''
    lines.push(` * @programs \`${programsList}\`${morePrograms}`)
  }

  // Latest version information
  if (packageInfo.versions && packageInfo.versions.length > 0) {
    lines.push(` * @version \`${packageInfo.versions[0]}\` (${packageInfo.versions.length} versions available)`)
    lines.push(` * @versions From newest version to oldest.`)
  }

  // Installation command
  if (packageInfo.installCommand) {
    lines.push(` *`)
    lines.push(` * @install \`${packageInfo.installCommand}\``)
  }

  // Aliases - filter out invalid shell command patterns and separate package name from true aliases
  if (packageInfo.aliases && packageInfo.aliases.length > 0) {
    const validAliases = packageInfo.aliases.filter((alias) => {
      // Filter out shell command patterns
      return !alias.includes('--') && !alias.includes('$SHELL') && !alias.includes('+') && !alias.includes('(') && !alias.includes(')')
    })

    if (validAliases.length > 0) {
      // Separate the package name from true aliases
      const packageName = packageInfo.name
      const trueAliases = validAliases.filter(alias => alias !== packageName)
      const packageNameAlias = validAliases.find(alias => alias === packageName)

      // Add @name if the package name is in the aliases list
      if (packageNameAlias) {
        lines.push(` * @name \`${packageNameAlias}\``)
      }

      // Add @aliases only for true aliases (not the package name)
      if (trueAliases.length > 0) {
        lines.push(` * @aliases ${trueAliases.map(a => `\`${a}\``).join(', ')}`)
      }
    }
  }

  // Homepage URL
  if (packageInfo.homepageUrl) {
    lines.push(` * @homepage ${packageInfo.homepageUrl}`)
  }

  // Runtime Dependencies
  if (packageInfo.dependencies && packageInfo.dependencies.length > 0) {
    const depsList = packageInfo.dependencies.slice(0, 3).join('`, `')
    const moreDeps = packageInfo.dependencies.length > 3 ? `, ... (+${packageInfo.dependencies.length - 3} more)` : ''

    // Check if any dependencies are OS-specific
    const hasOsDeps = packageInfo.dependencies.some(dep => dep.includes(':'))
    const osNote = hasOsDeps ? ' (includes OS-specific dependencies with `os:package` format)' : ''

    lines.push(` * @dependencies \`${depsList}\`${moreDeps}${osNote}`)
  }

  // Build Dependencies
  if (packageInfo.buildDependencies && packageInfo.buildDependencies.length > 0) {
    const depsList = packageInfo.buildDependencies.slice(0, 3).join('`, `')
    const moreDeps = packageInfo.buildDependencies.length > 3 ? `, ... (+${packageInfo.buildDependencies.length - 3} more)` : ''

    // Check if any dependencies are OS-specific
    const hasOsDeps = packageInfo.buildDependencies.some(dep => dep.includes(':'))
    const osNote = hasOsDeps ? ' (includes OS-specific dependencies with `os:package` format)' : ''

    lines.push(` * @buildDependencies \`${depsList}\`${moreDeps}${osNote} - required only when building from source`)
  }

  // Companions
  if (packageInfo.companions && packageInfo.companions.length > 0) {
    const companionsList = packageInfo.companions.slice(0, 3).join('`, `')
    const moreCompanions = packageInfo.companions.length > 3 ? `, ... (+${packageInfo.companions.length - 3} more)` : ''
    lines.push(` * @companions \`${companionsList}\`${moreCompanions}`)
  }

  lines.push(' *')

  // Usage example
  lines.push(' * @example')
  lines.push(' * ```typescript')
  lines.push(' * import { pantry } from \'ts-pkgx\'')
  lines.push(' *')

  // Show both alias and domain access if valid aliases exist
  if (packageInfo.aliases && packageInfo.aliases.length > 0) {
    // Find the first valid alias for the example
    const validAlias = packageInfo.aliases.find((alias) => {
      return !alias.includes('--') && !alias.includes('$SHELL') && !alias.includes('+') && !alias.includes('(') && !alias.includes(')')
    })

    if (validAlias) {
      const aliasVarName = validAlias.replace(/[^a-z0-9]/gi, '')
      // Use the same function as the index generation to ensure consistency
      const domainVarName = domainName.replace(/[.-]/g, '').replace(/\//g, '').toLowerCase()

      // Check if the alias is the same as the package name
      const isAliasPackageName = validAlias === packageInfo.name

      if (isAliasPackageName) {
        lines.push(` * // Access the package`)
        lines.push(` * const pkg = pantry.${aliasVarName}`)
        lines.push(` * // Or access via domain`)
        lines.push(` * const samePkg = pantry.${domainVarName}`)
        lines.push(` * console.log(pkg === samePkg) // true`)
      }
      else {
        lines.push(` * // Access via alias (recommended)`)
        lines.push(` * const pkg = pantry.${aliasVarName}`)
        lines.push(` * // Or access via domain`)
        lines.push(` * const samePkg = pantry.${domainVarName}`)
        lines.push(` * console.log(pkg === samePkg) // true`)
      }
    }
    else {
      // No valid aliases, use domain only
      const domainVarName = domainName.replace(/[.-]/g, '').replace(/\//g, '').toLowerCase()
      lines.push(` * const pkg = pantry.${domainVarName}`)
    }
  }
  else {
    // Use the same function as the index generation to ensure consistency
    const domainVarName = domainName.replace(/[.-]/g, '').replace(/\//g, '').toLowerCase()
    lines.push(` * const pkg = pantry.${domainVarName}`)
  }

  lines.push(` * console.log(pkg.name)        // "${packageInfo.name || packageDisplayName}"`)

  if (packageInfo.description) {
    const shortDesc = packageInfo.description.length > 50 ? `${packageInfo.description.substring(0, 47)}...` : packageInfo.description
    lines.push(` * console.log(pkg.description) // "${shortDesc}"`)
  }

  if (packageInfo.programs && packageInfo.programs.length > 0) {
    lines.push(` * console.log(pkg.programs)    // [${packageInfo.programs.slice(0, 2).map(p => `"${p}"`).join(', ')}${packageInfo.programs.length > 2 ? ', ...' : ''}]`)
  }

  if (packageInfo.versions && packageInfo.versions.length > 0) {
    lines.push(` * console.log(pkg.versions[0]) // "${packageInfo.versions[0]}" (latest)`)
  }

  lines.push(' * ```')
  lines.push(' *')

  // Links to documentation
  lines.push(` * @see https://ts-pkgx.netlify.app/packages/${domainName.replace(/\./g, '-')}.md`)
  lines.push(` * @see https://ts-pkgx.netlify.app/usage`)

  lines.push(' */')

  return lines.join('\n')
}

/**
 * Generates TypeScript content for a package
 */
function generateTypeScriptContent(packageInfo: PkgxPackage, domainName: string): string {
  // Helper function to check if a string is a valid alias for variable naming
  function isValidAliasForVarName(alias: string): boolean {
    if (!alias || alias.length < 2)
      return false

    // Filter out shell command patterns
    if (alias.includes('--') || alias.includes('$SHELL') || alias.includes('+') || alias.includes('(') || alias.includes(')')) {
      return false
    }

    // Filter out generic words that shouldn't be standalone aliases
    const genericWords = ['cli', 'app', 'tool', 'server', 'client', 'api', 'lib', 'core']
    if (genericWords.includes(alias.toLowerCase())) {
      return false
    }

    // Filter out version strings
    if (/^\d+(?:\.\d+)*/.test(alias)) {
      return false
    }

    return true
  }

  // Determine the best variable name - use a valid primary alias if available, otherwise use domain
  let varName: string
  let packageDisplayName: string

  // Special case for yarn packages to avoid naming conflicts
  if (domainName === 'classic.yarnpkg.com') {
    varName = 'classicYarnPackage'
    packageDisplayName = 'yarn'
  }
  else if (domainName === 'yarnpkg.com') {
    varName = 'yarnPackage'
    packageDisplayName = 'yarn'
  }
  else if (packageInfo.aliases && packageInfo.aliases.length > 0) {
    // Find the first valid alias for variable naming
    const validAlias = packageInfo.aliases.find(alias => isValidAliasForVarName(alias))

    if (validAlias) {
      // Make sure the const variable name starts with lowercase
      const aliasBase = validAlias.replace(/[^a-z0-9]/gi, '')
      varName = `${aliasBase.charAt(0).toLowerCase()}${aliasBase.slice(1)}Package`
      packageDisplayName = validAlias
    }
    else {
      // No valid aliases, fall back to domain-based naming
      varName = `${getDomainAsTypescriptName(domainName)}Package`
      packageDisplayName = packageInfo.name || domainName
    }
  }
  else {
    // Fall back to domain-based naming
    varName = `${getDomainAsTypescriptName(domainName)}Package`
    packageDisplayName = packageInfo.name || domainName
  }

  // Ensure the variable name doesn't contain any invalid JavaScript identifier characters
  const safeVarName = varName.replace(/[^\w$]/g, '')

  // Generate comprehensive JSDoc documentation
  const jsdoc = generatePackageJSDoc(packageInfo, domainName, packageDisplayName)

  // Format the package object with 'as const' assertions
  const formattedObj = formatObjectWithAsConst(packageInfo)

  // Create the TypeScript content with proper JSDoc, imports and exports
  return `${jsdoc}
export const ${safeVarName} = ${formattedObj}

export type ${safeVarName.charAt(0).toUpperCase() + safeVarName.slice(1)} = typeof ${safeVarName}
`
}

/**
 * Saves package data as a TypeScript file
 */
function sanitizeFilename(packageName: string): string {
  const sanitized = packageName.replace(/\{\{[^}]*\}\}/g, '').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '')
  if (!sanitized || sanitized.length === 0)
    return 'package'

  let cleanName = sanitized.replace(/[^\w.-]/g, '-')

  // Handle extremely long filenames to avoid ENAMETOOLONG errors
  // Most filesystems support filenames up to 255 characters, but we'll be conservative
  // and limit to 200 characters, leaving room for ".ts" extension
  if (cleanName.length > 200) {
    // Keep the first 150 characters and last 45 characters, separated by "..."
    cleanName = `${cleanName.substring(0, 150)}...${cleanName.substring(cleanName.length - 45)}`
  }

  return cleanName
}

export function savePackageAsTypeScript(outputDir: string, domainName: string, packageInfo: PkgxPackage): string {
  // Ensure base output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  let filePath: string

  // For nested domains (containing "/"), create proper directory structure
  if (domainName.includes('/')) {
    // Split the domain into parts: github.com/user/repo -> [github.com, user, repo]
    const parts = domainName.split('/')
    const baseDomain = parts[0] // github.com
    const subParts = parts.slice(1) // [user, repo]

    // Create directory structure: outputDir/github.com/user/
    const packageDir = path.join(outputDir, baseDomain, ...subParts.slice(0, -1))
    if (!fs.existsSync(packageDir)) {
      fs.mkdirSync(packageDir, { recursive: true })
    }

    // Use the last part as filename: repo.ts
    const filename = sanitizeFilename(subParts[subParts.length - 1])
    filePath = path.join(packageDir, `${filename}.ts`)
  }
  else {
    // For root domains, use consistent domain-based naming
    // Strip dots entirely from root domains (e.g., alacritty.org -> alacrittyorg)
    const filename = domainName.replace(/\./g, '')

    // Create the TypeScript file path in the base directory
    filePath = path.join(outputDir, `${filename}.ts`)
  }

  // Remove fetchedAt from the package info before generating TypeScript
  const cleanPackageInfo = { ...packageInfo }
  delete cleanPackageInfo.fetchedAt

  // Generate TypeScript content
  const tsContent = generateTypeScriptContent(cleanPackageInfo, domainName)

  // Write the file
  fs.writeFileSync(filePath, tsContent)

  return filePath
}

/**
 * Checks if a cached package exists and is still valid
 * @param packageName Name of the package to check
 * @param options Cache options
 * @returns The cached package data if valid, null otherwise
 */
export function getValidCachedPackage(
  packageName: string,
  options: PackageFetchOptions = {},
): { packageInfo: PkgxPackage, filePath: string } | null {
  try {
    // Determine cache directory
    const cacheDir = options.cacheDir || DEFAULT_CACHE_DIR

    // If cache is disabled, return null immediately
    if (options.cache === false) {
      console.log(`Cache disabled for ${packageName}, skipping cache check`)
      return null
    }

    // Handle aliases - need to check the canonical name
    const resolvedName = aliases[packageName] || packageName

    // Create a safe filename for the cache file - always use domain-based naming for cache
    // to ensure consistency regardless of package name extraction
    const safeFilename = resolvedName.replace(/\//g, '-')
    const cacheFilePath = path.join(cacheDir, `${safeFilename}.json`)

    console.log(`Checking for cache file: ${cacheFilePath}`)

    // Check if the cache file exists
    if (!fs.existsSync(cacheFilePath)) {
      return null
    }

    // Read and parse the cached data
    const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8')) as PkgxPackage

    // Check if the cached data has a fetchedAt timestamp
    if (!cachedData.fetchedAt) {
      console.log(`Cache for ${packageName} missing fetchedAt timestamp, invalidating`)
      return null
    }

    // Check for generic/placeholder descriptions that indicate bad cached data
    const genericDescriptions = [
      'Crafters of fine Open Source products',
      'Go home.',
      'Package information for',
      'pkgx package',
      'Loading...',
      'Please wait...',
    ]

    const hasGenericDescription = genericDescriptions.some(generic =>
      cachedData.description && cachedData.description.includes(generic),
    )

    if (hasGenericDescription) {
      console.log(`Cache for ${packageName} has generic description "${cachedData.description}", invalidating`)
      return null
    }

    // Check if the package has no versions (likely incomplete data)
    if (!cachedData.versions || cachedData.versions.length === 0) {
      console.log(`Cache for ${packageName} has no versions, invalidating`)
      return null
    }

    // Check if the cache has expired
    const cacheExpirationMinutes = options.cacheExpirationMinutes || DEFAULT_CACHE_EXPIRATION_MINUTES
    const cacheExpirationMs = cacheExpirationMinutes * 60 * 1000
    const now = Date.now()

    if (now - cachedData.fetchedAt > cacheExpirationMs) {
      console.log(`Cache for ${packageName} has expired (age: ${Math.round((now - cachedData.fetchedAt) / 60000)} minutes)`)
      return null
    }

    console.log(`Using cached data for ${packageName} (age: ${Math.round((now - cachedData.fetchedAt) / 60000)} minutes)`)
    return { packageInfo: cachedData, filePath: cacheFilePath }
  }
  catch (error) {
    console.error(`Error reading cache for ${packageName}:`, error)
    return null
  }
}

/**
 * Saves package data to the cache
 * @param packageName Name of the package
 * @param packageInfo Package data to cache
 * @param options Cache options
 * @returns Path to the cached file
 */
export function saveToCacheAndOutput(
  packageName: string,
  packageInfo: PkgxPackage,
  options: PackageFetchOptions = {},
): { cachePath: string, outputPath: string } {
  // Add timestamp to the package info for cache
  const enhancedPackageInfo = {
    ...packageInfo,
    fetchedAt: Date.now(),
  }

  // Determine cache directory and ensure it exists
  const cacheDir = options.cacheDir || DEFAULT_CACHE_DIR
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  // Create a safe filename for the cache file - always use domain-based naming for cache
  const safeFilename = packageName.replace(/\//g, '-')
  const cacheFilePath = path.join(cacheDir, `${safeFilename}.json`)

  // Save to cache with fetchedAt timestamp
  fs.writeFileSync(cacheFilePath, JSON.stringify(enhancedPackageInfo, null, 2))

  // Determine output directory and ensure it exists
  const outputDir = options.outputDir || 'packages'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Create TypeScript file in the output directory
  // Pass the original packageName (domain) to savePackageAsTypeScript so it can decide the best filename
  const outputFilePath = savePackageAsTypeScript(outputDir, packageName, packageInfo)

  return { cachePath: cacheFilePath, outputPath: outputFilePath }
}

// Function to check system resources and adjust behavior
function _getSystemResourceStatus() {
  const memUsage = process.memoryUsage()
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
  const rssUsedMB = Math.round(memUsage.rss / 1024 / 1024)

  // Consider system under stress if heap usage is high, RSS is very high, or we have many browsers
  const isUnderStress = heapUsedMB > 300 || rssUsedMB > 800 || browserPool.length >= MAX_BROWSER_POOL_SIZE

  return {
    heapUsedMB,
    heapTotalMB,
    rssUsedMB,
    browserCount: browserPool.length,
    isUnderStress,
  }
}

// Navigation logging disabled - kept for backwards compatibility

/**
 * Ensures all browser resources are properly closed
 */
export function cleanupBrowserResources(): Promise<void> {
  // Return a promise that always resolves and never rejects
  return Promise.resolve()
}

/**
 * Fetches project folder names from the pkgxdev pantry repository using GitHub API
 * @param options Optional configuration
 * @returns Promise resolving to an array of project folders
 */
export async function fetchPkgxProjects(options: FetchProjectsOptions = {}): Promise<ProjectFolder[]> {
  const apiUrl = options.apiUrl || 'https://api.github.com/repos/pkgxdev/pantry/contents/projects'

  try {
    console.log(`Fetching projects from GitHub API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        // Using GitHub API without authentication has a lower rate limit
        // If you hit rate limits, you'll need to add an auth token
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub API: ${response.statusText}`)
    }

    const contents = await response.json() as GitHubContent[]

    // Filter to only include directories
    const projects = contents
      .filter(item => item.type === 'dir')
      .map(item => ({
        name: item.name,
        url: item.html_url,
      }))

    console.log(`Retrieved ${projects.length} projects from GitHub API`)

    // Sort projects alphabetically for consistency
    projects.sort((a, b) => a.name.localeCompare(b.name))

    return projects
  }
  catch (error) {
    console.error('Error fetching projects from GitHub API:', error)
    throw error
  }
}

/**
 * Fetches package information from pkgx.dev using ts-web-scraper
 * @param packageName The name of the package to fetch
 * @param options Optional configuration
 * @returns Promise resolving to package information with original name and full domain name
 */
export async function fetchPantryPackage(
  packageName: string,
  options: PackageFetchOptions = {},
): Promise<{ packageInfo: PkgxPackage, originalName: string, fullDomainName: string }> {
  const originalName = packageName
  let fullDomainName = packageName

  // Special handling for known patterns
  // For paths like 'agwa.name/git-crypt', treat 'git-crypt' as the name
  // and 'agwa.name' as the domain
  if (packageName.includes('/')) {
    const [domain, name] = packageName.split('/')
    console.log(`Identified nested package: domain=${domain}, name=${name}`)
  }

  // Handle common package aliases
  if (aliases[packageName]) {
    console.log(`'${packageName}' is an alias for '${aliases[packageName]}', redirecting...`)
    fullDomainName = aliases[packageName]
    packageName = aliases[packageName]
  }

  try {
    // Use ts-web-scraper via scrapePkgxPackage
    const timeout = options.timeout || DEFAULT_TIMEOUT_MS

    // Scrape the package data
    const scrapedData = await scrapePkgxPackage(packageName, {
      timeout,
      useClientSideScraper: true,
    })

    // Convert scraped data to PkgxPackage format
    const packageInfo: PkgxPackage = {
      name: scrapedData.displayName || scrapedData.name || packageName.split('/').pop() || packageName,
      domain: scrapedData.domain || packageName,
      description: scrapedData.description || scrapedData.brief || '',
      packageYmlUrl: `https://github.com/pkgxdev/pantry/tree/main/projects/${packageName}/package.yml`,
      homepageUrl: scrapedData.homepage || '',
      githubUrl: scrapedData.github || '',
      installCommand: `launchpad install ${packageName}`,
      pkgxInstallCommand: `sh <(curl https://pkgx.sh) +${packageName} -- $SHELL -i`,
      launchpadInstallCommand: `launchpad install ${packageName}`,
      programs: scrapedData.provides || [],
      companions: Array.isArray(scrapedData.companions) ? scrapedData.companions : [],
      dependencies: Array.isArray(scrapedData.dependencies) ? scrapedData.dependencies : [],
      buildDependencies: scrapedData.buildDependencies || [],
      versions: scrapedData.versions || [],
      aliases: [],
    }

    // Try to get versions from GitHub API if not available
    if (!packageInfo.versions || packageInfo.versions.length === 0) {
      const domain = packageInfo.domain || packageName
      const skipGitHubAPI = [
        'apache.org',
        'breakfastquay.com',
        'catb.org',
        'bloomreach.com',
        'cairographics.org',
        'certifi.io',
        'charm.sh',
        'aws.amazon.com',
        'google.com',
        'microsoft.com',
        'mozilla.org',
        'freedesktop.org',
        'gnome.org',
        'kde.org',
        'sourceforge.net',
        'sf.net',
      ].some(skipDomain => domain.startsWith(skipDomain))

      if (!skipGitHubAPI) {
        try {
          const githubPath = packageInfo.domain || packageName
          const versions = await fetchVersionsFromGitHub(githubPath)
          packageInfo.versions = versions
        }
        catch (error) {
          console.warn(`Failed to fetch versions for ${packageName} from GitHub API:`, error)
          packageInfo.versions = []
        }
      }
    }

    // Sort versions using semver if they exist
    if (packageInfo.versions && packageInfo.versions.length > 0) {
      try {
        packageInfo.versions.sort((a: string, b: string) => {
          try {
            return -1 * Bun.semver.order(a, b)
          }
          catch {
            return b.localeCompare(a)
          }
        })
      }
      catch (error) {
        console.warn(`Warning: Failed to sort versions for ${packageName} using semver:`, error)
      }
    }

    // Ensure we have values for required fields
    packageInfo.name = packageInfo.name || originalName
    packageInfo.domain = packageInfo.domain || fullDomainName
    packageInfo.programs = packageInfo.programs || []
    packageInfo.companions = packageInfo.companions || []
    packageInfo.dependencies = packageInfo.dependencies || []
    packageInfo.versions = packageInfo.versions || []

    return { packageInfo, originalName, fullDomainName }
  }
  catch (error) {
    console.error(`Error in fetchPantryPackage for ${packageName}:`, error)

    // Return minimal package info on error
    return createMinimalPackageInfo(packageName, originalName, fullDomainName)
  }
}

/**
 * Attempts to fetch package versions from GitHub API
 */
async function fetchVersionsFromGitHub(packageName: string): Promise<string[]> {
  try {
    // Lazy import to avoid module loading issues
    const { shouldProceedWithGitHubRequest, saveRateLimitInfo } = await import('./utils')

    // Check if we're rate limited before making the request
    if (!shouldProceedWithGitHubRequest()) {
      console.warn(`Skipping GitHub API request for versions due to rate limiting`)
      return []
    }

    const response = await fetch(`https://api.github.com/repos/pkgxdev/pantry/contents/projects/${packageName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ts-pkgx',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(15000),
    })

    // Save rate limit information to file
    saveRateLimitInfo(response.headers)

    // Handle rate limiting
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
      const rateLimitReset = response.headers.get('X-RateLimit-Reset')

      const resetTime = rateLimitReset ? new Date(Number(rateLimitReset) * 1000).toLocaleString() : 'unknown'
      console.warn(`GitHub API rate limit exceeded. Remaining: ${rateLimitRemaining || 0}, Reset: ${resetTime}`)

      // Return empty array instead of throwing to avoid breaking the flow
      return []
    }

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}: ${response.statusText}`)
    }

    const data = await response.json() as any[]
    // Look for version files or directories
    return data
      .filter(item => item.name.match(/^v\d+/))
      .map(item => item.name)
  }
  catch (error) {
    console.error('Error fetching versions from GitHub:', error)
    return []
  }
}

// Add periodic cleanup function for browser resources
const CLEANUP_INTERVAL = 300000 // 5 minutes
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Sets up process exit handlers to ensure proper cleanup
 */
export function setupCleanupHandlers(): void {
  // Add graceful shutdown handlers
  const exitHandler = async (signal: string) => {
    console.log(`\nReceived ${signal} signal. Cleaning up resources...`)

    // Clear any intervals
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
    }

    // Perform cleanup of browser resources
    await cleanupBrowserResources()

    console.log('Resources cleaned up. Exiting.')

    // Force exit after 5 seconds if process is hanging
    setTimeout(() => {
      console.log('Forcing process exit...')
      process.exit(0)
    }, 5000)
  }

  // Handle various termination signals
  process.on('SIGINT', () => exitHandler('SIGINT'))
  process.on('SIGTERM', () => exitHandler('SIGTERM'))
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
    exitHandler('uncaughtException')
  })
}

// Initialize handlers
setupCleanupHandlers()

// Add global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  const errorString = String(error)
  console.error('Uncaught exception caught:', error.message)
  if (error.message.includes('No target found for targetId')
    || error.message.includes('Assertion error')
    || error.message.includes('Target page, context or browser has been closed')
    || error.message.includes('Failed to connect')
    || error.message.includes('Connection closed')
    || error.message.includes('Protocol error')
    || errorString.includes('WebSocket connection closed')
    || error.message.includes('Browser has been closed')) {
    console.error('Browser/network connection error detected, continuing execution...')
    // Don't exit the process for browser/network errors
    return
  }
  // For other uncaught exceptions, still exit
  console.error('Non-browser error, exiting...')
  process.exit(1)
})

process.on('unhandledRejection', (reason, _promise) => {
  const errorString = String(reason)
  console.error('Unhandled rejection caught:', errorString)
  if (errorString.includes('No target found for targetId')
    || errorString.includes('Assertion error')
    || errorString.includes('Target page, context or browser has been closed')
    || errorString.includes('Failed to connect')
    || errorString.includes('Connection closed')
    || errorString.includes('Protocol error')
    || errorString.includes('WebSocket connection closed')
    || errorString.includes('Browser has been closed')) {
    console.error('Browser/network connection error in promise, continuing execution...')
    // Don't exit the process for browser/network errors
    return
  }
  // For other unhandled rejections, still exit
  console.error('Non-browser promise rejection, exiting...')
  process.exit(1)
})

// Start a periodic cleanup task
export function startPeriodicCleanup(): void {
  // Clear any existing interval
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }

  // Set a new interval to periodically clean up resources
  cleanupInterval = setInterval(() => {
    console.log('Running periodic browser resource cleanup...')
    cleanupBrowserResources()
      .then(() => console.log('Periodic cleanup completed'))
      .catch(err => console.error('Error during periodic cleanup:', err))
  }, CLEANUP_INTERVAL)
}

/**
 * Fetches and saves all packages using the local pantry as source of truth
 */
export async function fetchAndSaveAllPackages(options: PackageFetchOptions = {}): Promise<string[]> {
  const timeout = options.timeout || DEFAULT_TIMEOUT_MS
  const outputDir = options.outputDir || 'packages'
  const cacheDir = options.cacheDir || DEFAULT_CACHE_DIR
  const useCache = options.cache !== false
  const cacheExpirationMinutes = options.cacheExpirationMinutes || DEFAULT_CACHE_EXPIRATION_MINUTES
  const concurrency = Math.min(options.concurrency || 6, 8) // Further reduce concurrency for stability
  const pantryDir = options.pantryDir || 'src/pantry'

  if (!options.outputJson) {
    console.log(`Starting bulk fetch with concurrency: ${concurrency}, timeout: ${timeout}ms`)
  }

  const startTime = Date.now()
  let allPackageNames: string[] = []

  try {
    // Use the local pantry as the source of truth
    if (!options.outputJson) {
      console.log('Scanning local pantry for packages...')
    }

    try {
      allPackageNames = await scanPantryPackages(pantryDir)

      if (!options.outputJson) {
        console.log(`Found ${allPackageNames.length} packages in local pantry`)
      }
    }
    catch (error) {
      if (!options.outputJson) {
        console.warn('Failed to scan local pantry, falling back to consts:', error)
      }

      // Fallback to the comprehensive known packages list
      try {
        const { ALL_KNOWN_PACKAGES } = await import('./consts')
        allPackageNames = [...ALL_KNOWN_PACKAGES].filter(name =>
          name && name !== 'undefined' && name !== 'aliases' && name !== 'index',
        )

        if (!options.outputJson) {
          console.log(`Using comprehensive package list: ${allPackageNames.length} packages`)
        }
      }
      catch (constError) {
        if (!options.outputJson) {
          console.warn('Failed to load consts, falling back to GitHub API:', constError)
        }

        // Final fallback: GitHub API
        try {
          const response = await fetch('https://api.github.com/repos/pkgxdev/pantry/contents/projects', {
            headers: {
              'User-Agent': 'ts-pkgx-fetcher',
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          if (response.ok) {
            const projects = await response.json() as Array<{ name: string, type: string }>
            const packageNames = projects
              .filter(item => item.type === 'dir')
              .map(item => item.name)
              .sort()

            if (!options.outputJson) {
              console.log(`Retrieved ${packageNames.length} projects from GitHub API`)
            }
            allPackageNames = packageNames
          }
          else {
            throw new Error(`GitHub API returned ${response.status}`)
          }
        }
        catch (githubError) {
          if (!options.outputJson) {
            console.warn('Failed to fetch from GitHub API, falling back to local discovery:', githubError)
          }
          // Final fallback: scan existing package files
          if (fs.existsSync(outputDir)) {
            const existingFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.ts'))
            allPackageNames = existingFiles.map(f => path.basename(f, '.ts'))
            console.log(`Found ${allPackageNames.length} existing packages`)
          }
        }
      }
    }

    if (allPackageNames.length === 0) {
      console.error('No packages found to process')
      return []
    }

    // Filter out packages that shouldn't exist as standalone packages
    const PARENT_DOMAINS_ONLY = [
      'android.com',
      'apache.org',
      'akuity.io',
      'alsa-project.org',
      'anchore.com',
      'aomedia.googlesource.com',
      'apollographql.com',
      'facebook.com',
      'google.com',
      'microsoft.com',
      'mozilla.org',
      'sourceforge.net',
      'x.org',
      'xiph.org',
      'yui.github.io',
      'crates.io', // Only has nested packages like crates.io/ripgrep
      'gitlab.com', // Only has nested packages
      'github.com', // Only has nested packages
    ]

    // For GitHub packages, filter out parent paths that only exist as containers for nested packages
    const githubParentsToFilter = new Set<string>()

    // Find all github.com packages
    const githubPackages = allPackageNames.filter(name => name.startsWith('github.com/'))

    // For each github package with multiple path segments, mark the parent as potentially filterable
    for (const pkg of githubPackages) {
      const pathParts = pkg.split('/')
      if (pathParts.length > 2) { // github.com/user/repo or deeper
        const parentPath = pathParts.slice(0, 2).join('/') // github.com/user
        githubParentsToFilter.add(parentPath)
      }
    }

    allPackageNames = allPackageNames.filter((name) => {
      // Filter out .pkgroot entries - these are just markers, not actual packages
      if (name.endsWith('/.pkgroot')) {
        console.log(`Filtering out .pkgroot marker: ${name}`)
        return false
      }

      // Filter out README.rst files - these are documentation, not packages
      if (name.endsWith('/README.rst')) {
        console.log(`Filtering out README.rst documentation: ${name}`)
        return false
      }

      // Filter out agwa.name as standalone - only agwa.name/git-crypt is valid
      if (name === 'agwa.name') {
        console.log(`Filtering out standalone agwa.name - only agwa.name/git-crypt is valid`)
        return false
      }

      // Filter out known parent domains that don't have standalone packages
      if (PARENT_DOMAINS_ONLY.includes(name)) {
        console.log(`Filtering out parent domain ${name} - only has nested packages`)
        return false
      }

      // Filter out GitHub parent paths that only exist as containers for nested packages
      if (githubParentsToFilter.has(name)) {
        console.log(`Filtering out GitHub parent path ${name} - only has nested packages`)
        return false
      }

      // Filter out other invalid standalone packages
      if (name === 'undefined' || name === 'aliases' || name === 'index') {
        return false
      }

      return true
    })

    console.log(`Found ${allPackageNames.length} packages to process`)

    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      allPackageNames = allPackageNames.slice(0, options.limit)
      console.log(`Limited to ${allPackageNames.length} packages`)
    }

    // No browser needed - fetchPantryPackage now uses ts-web-scraper
    const successfulPackages: string[] = []
    const failedPackages: string[] = []
    let processed = 0

    // Process packages in smaller batches to avoid overwhelming the system
    const batchSize = Math.min(concurrency, 6)
    const batches = []
    for (let i = 0; i < allPackageNames.length; i += batchSize) {
      batches.push(allPackageNames.slice(i, i + batchSize))
    }

    if (!options.outputJson) {
      console.log(`Processing ${allPackageNames.length} packages in ${batches.length} batches...`)
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      if (!options.outputJson) {
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} packages)`)
      }

      // Process batch with controlled concurrency using pantry-based approach
      const batchPromises = batch.map(async (packageName) => {
        try {
          // Check cache first
          const cacheFile = path.join(cacheDir, `${packageName.replace(/\//g, '-')}.json`)
          if (useCache && fs.existsSync(cacheFile)) {
            const stats = fs.statSync(cacheFile)
            const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60)

            if (ageMinutes < cacheExpirationMinutes) {
              if (!options.outputJson) {
                console.log(`Using cached data for ${packageName} (age: ${Math.round(ageMinutes)} minutes)`)
              }
              try {
                const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
                // Remove fetchedAt before generating TypeScript
                delete cachedData.fetchedAt
                const tsFilePath = savePackageAsTypeScript(outputDir, packageName, cachedData)
                if (!options.outputJson) {
                  console.log(`Using cached data for ${packageName} (saved to ${tsFilePath})`)
                }
                return { success: true, packageName }
              }
              catch {
                console.warn(`Cache file corrupted for ${packageName}, will refetch`)
              }
            }
          }

          // Use the new pantry-based fetch approach - no browser needed (uses ts-web-scraper)
          const result = await fetchPantryPackageWithMetadata(packageName, {
            ...options,
            pantryDir,
            timeout,
            cache: useCache,
            cacheDir,
            cacheExpirationMinutes,
          })

          if (result) {
            // Save to cache and output
            const { outputPath } = saveToCacheAndOutput(packageName, result.packageInfo, {
              cacheDir,
              outputDir,
              cache: useCache,
            })

            if (!options.outputJson) {
              console.log(`Successfully processed ${packageName} (saved to ${outputPath})`)
            }
            return { success: true, packageName }
          }
          else {
            console.warn(`Failed to fetch ${packageName}`)
            return { success: false, packageName }
          }
        }
        catch (error) {
          console.error(`Error processing ${packageName}:`, error)
          return { success: false, packageName }
        }
      })

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises)

      // Process results
      for (const result of batchResults) {
        processed++
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successfulPackages.push(result.value.packageName)
          }
          else {
            failedPackages.push(result.value.packageName)
          }
        }
        else {
          console.error('Batch promise rejected:', result.reason)
          failedPackages.push('unknown')
        }
      }

      // Progress update
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      const rate = Math.round(processed / elapsed * 10) / 10
      const eta = Math.round((allPackageNames.length - processed) / rate)

      if (!options.outputJson) {
        console.log(`Batch ${batchIndex + 1}/${batches.length} complete. Progress: ${processed}/${allPackageNames.length} (${Math.round(processed / allPackageNames.length * 100)}%) | Success: ${successfulPackages.length} | Failed: ${failedPackages.length} | Rate: ${rate}/s | ETA: ${eta}s`)
      }

      // Small delay between batches to prevent overwhelming the system
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // No browser cleanup needed - ts-web-scraper doesn't use browsers
    const totalTime = Math.round((Date.now() - startTime) / 1000)
    if (!options.outputJson) {
      console.log(`\nCompleted in ${totalTime}s. Successfully processed: ${successfulPackages.length}, Failed: ${failedPackages.length}`)

      if (failedPackages.length > 0) {
        console.log(`Failed packages: ${failedPackages.slice(0, 10).join(', ')}${failedPackages.length > 10 ? ` ... and ${failedPackages.length - 10} more` : ''}`)
      }
    }

    return successfulPackages
  }
  catch (error) {
    console.error('Error in fetchAndSaveAllPackages:', error)
    return []
  }
}

/**
 * Creates a minimal package info object when browser launch fails
 */
function createMinimalPackageInfo(
  packageName: string,
  originalName: string,
  fullDomainName: string,
): { packageInfo: PkgxPackage, originalName: string, fullDomainName: string } {
  // If it's a nested path like 'agwa.name/git-crypt', extract parts
  const parts = packageName.split('/')
  const domain = parts[0]
  const subPath = parts.length > 1 ? parts.slice(1).join('/') : null

  // Create a minimal package info object
  const packageInfo: PkgxPackage = {
    name: subPath || packageName,
    domain,
    description: `Package information for ${packageName}`,
    packageYmlUrl: '',
    homepageUrl: '',
    githubUrl: '',
    installCommand: `launchpad install ${packageName}`,
    pkgxInstallCommand: `sh <(curl https://pkgx.sh) +${packageName} -- $SHELL -i`,
    launchpadInstallCommand: `launchpad install ${packageName}`,
    programs: [],
    companions: [],
    dependencies: [],
    versions: [],
  }

  return { packageInfo, originalName, fullDomainName }
}

/**
 * Fetch and save a single package with improved handling for problematic packages
 * @param packageName The name of the package to fetch
 * @param outputDir Directory to save package data
 * @param timeout Timeout in milliseconds
 * @param saveAsJson Whether to save as JSON (true) or TypeScript (false)
 * @param retryNumber Current retry attempt number
 * @param maxRetries Maximum number of retry attempts
 * @param debug Whether to enable debug mode
 * @param options Additional options
 * @returns Promise with result information
 */
export async function fetchAndSavePackage(
  packageName: string,
  outputDir: string,
  timeout: number,
  saveAsJson = false,
  retryNumber = 1,
  maxRetries = 3,
  debug = false,
  options: PackageFetchOptions = {},
): Promise<{ success: boolean, fullDomainName?: string, aliases?: string[], filePath?: string }> {
  try {
    // Special handling for known problematic packages
    // agwa.name is filtered out - only agwa.name/git-crypt should be processed

    // Check cache first if caching is enabled
    const useCache = options.cache !== false
    const cacheDir = options.cacheDir || DEFAULT_CACHE_DIR

    // If caching is disabled, log it and skip cache check completely
    if (!useCache) {
      console.log(`Cache disabled for ${packageName}, will fetch directly`)
    }
    else {
      // Handle aliases - need to check the canonical name
      // const resolvedName = PACKAGE_ALIASES[packageName] || packageName

      const cachedPackage = getValidCachedPackage(packageName, {
        cacheDir,
        cacheExpirationMinutes: options.cacheExpirationMinutes,
        cache: options.cache,
      })

      if (cachedPackage) {
        // We found valid cached data
        const { packageInfo } = cachedPackage

        const fullDomainName = packageInfo.domain || packageName

        // Get aliases from the cached package
        const knownAliases = packageInfo.aliases || []

        // Save the package data to the output directory
        const filePath: string = savePackageAsTypeScript(outputDir, packageName, packageInfo)

        console.log(`Using cached data for ${packageName} (saved to ${filePath})`)
        return {
          success: true,
          fullDomainName,
          aliases: knownAliases,
          filePath,
        }
      }
    }

    // Use progressive timeout based on retry attempt - longer timeouts for retries
    const baseTimeout = timeout
    const actualTimeout = baseTimeout + (retryNumber - 1) * 10000 // Add 10s per retry

    console.log(`Using timeout for ${packageName} (attempt ${retryNumber}): ${actualTimeout}ms`)

    // Set an overall operation timeout to prevent hanging the entire process
    // This is different from the browser navigation timeout
    const operationTimeout = actualTimeout // Use the same timeout
    const operationTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error(`Operation timeout for ${packageName} after ${operationTimeout}ms`)
        reject(new Error(`Operation timeout after ${operationTimeout}ms`))
      }, operationTimeout)
    })

    // Handle nested package paths
    if (packageName.includes('/')) {
      const pathParts = packageName.split('/')
      const domain = pathParts[0]
      const subPath = pathParts.slice(1).join('/')

      console.log(`Processing nested package: domain=${domain}, subPath=${subPath}`)

      try {
        // Use a try/catch here to handle 404 errors
        // Race the fetch operation against the timeout
        const fetchPromise = fetchPantryPackage(`${domain}/${subPath}`, {
          timeout: actualTimeout,
          browser: options.browser,
        })

        const fetchResult = await Promise.race([fetchPromise, operationTimeoutPromise])

        // The timeout promise will reject if it times out, so we can directly use the result
        const { packageInfo, originalName, fullDomainName } = fetchResult

        // Sort versions using semver if they exist
        if (packageInfo.versions && packageInfo.versions.length > 0) {
          try {
            // Sort versions in descending order (newest first)
            packageInfo.versions.sort((a: string, b: string) => {
              try {
                // Use Bun.semver.order with negative multiplier for descending sort (newest first)
                return -1 * Bun.semver.order(a, b)
              }
              catch {
                // Fallback to string comparison if semver fails
                return b.localeCompare(a)
              }
            })
          }
          catch (error) {
            console.warn(`Warning: Failed to sort versions for ${packageName} using semver:`, error)
          }
        }

        // Create a safe version of the fullDomainName for filenames
        const safeFilename = fullDomainName.replace(/\//g, '-')

        // Add aliases information to the package info
        const knownAliases: string[] = []

        // Start with aliases that were extracted from the web scraping
        if (packageInfo.aliases && packageInfo.aliases.length > 0) {
          knownAliases.push(...packageInfo.aliases)
        }

        // Check if this is the target of an alias in PACKAGE_ALIASES
        for (const [alias, target] of Object.entries(aliases)) {
          if (target === fullDomainName && !knownAliases.includes(alias)) {
            knownAliases.push(alias)
          }
        }

        // Add the original name or path components as aliases
        if (originalName !== fullDomainName && !knownAliases.includes(originalName)) {
          knownAliases.push(originalName)
        }

        // Only add the subpath component as an alias if it makes sense
        // Don't add generic words like 'cli', 'app', 'tool' as standalone aliases
        const genericWords = ['cli', 'app', 'tool', 'server', 'client', 'api', 'lib', 'core']
        if (!knownAliases.includes(subPath) && !genericWords.includes(subPath.toLowerCase())) {
          knownAliases.push(subPath)
        }

        // Add the aliases to the package info
        const enhancedPackageInfo = {
          ...packageInfo,
          fullPath: packageName, // Store the full path in the package info
          aliases: knownAliases.length > 0 ? knownAliases : [],
        }

        // Save to cache first
        if (useCache) {
          // Save to cache directory
          const cachePath = path.join(cacheDir, `${safeFilename}.json`)
          const cacheData = {
            ...enhancedPackageInfo,
            fetchedAt: Date.now(),
          }

          // Ensure cache directory exists
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true })
          }

          // Write to cache
          fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2))
          console.log(`Saved package data to cache: ${cachePath}`)
        }

        // Always save the TypeScript file to the output directory
        const filePath: string = savePackageAsTypeScript(outputDir, fullDomainName, enhancedPackageInfo)

        console.log(`Successfully saved nested package ${packageName} to ${filePath} with aliases: ${knownAliases.join(', ') || 'none'}`)
        return {
          success: true,
          fullDomainName,
          aliases: knownAliases,
          filePath,
        }
      }
      catch (error: any) {
        if (error.toString().includes('404') || error.toString().includes('Not Found')) {
          console.error(`Package ${packageName} returned 404 Not Found.`)
          // Don't retry on 404 errors, skip to avoid overwriting existing files
          console.error(`Skipping ${packageName} to avoid overwriting existing files.`)
          return { success: false, fullDomainName: packageName }
        }
        throw error // Re-throw for other errors to allow retries
      }
    }
    else {
      // Handle standard (non-nested) packages
      try {
        // Race the fetch operation against the timeout
        const fetchPromise = fetchPantryPackage(packageName, {
          timeout: actualTimeout,
          browser: options.browser,
        })

        const fetchResult = await Promise.race([fetchPromise, operationTimeoutPromise])

        // The timeout promise will reject if it times out, so we can directly use the result
        const { packageInfo, originalName, fullDomainName } = fetchResult

        // Validate that we have meaningful package data before proceeding - be more lenient
        const hasDescription = packageInfo.description && packageInfo.description.trim() !== ''
        const hasVersions = packageInfo.versions && packageInfo.versions.length > 0
        const hasPrograms = packageInfo.programs && packageInfo.programs.length > 0
        const hasPackageYml = packageInfo.packageYmlUrl && packageInfo.packageYmlUrl.length > 0
        const hasDependencies = packageInfo.dependencies && packageInfo.dependencies.length > 0
        const hasCompanions = packageInfo.companions && packageInfo.companions.length > 0

        // Only skip if clearly problematic descriptions
        const hasClearlyBadDescription = hasDescription && (
          packageInfo.description.toLowerCase().trim() === 'go home.'
          || packageInfo.description.toLowerCase().trim() === 'page not found'
          || packageInfo.description.toLowerCase().trim() === 'not found'
          || packageInfo.description.toLowerCase().trim() === '404'
          || packageInfo.description.toLowerCase().trim() === 'error'
        )

        // Be more permissive - consider a package valid if it has:
        // 1. A non-problematic description (even if generic), OR
        // 2. Any structural data (versions, programs, dependencies, companions, packageYml), OR
        // 3. A valid domain name (for external packages that may have minimal pkgx data)
        const hasValidDescription = hasDescription && !hasClearlyBadDescription
        const hasStructuralData = hasVersions || hasPrograms || hasPackageYml || hasDependencies || hasCompanions
        const hasValidDomain = packageInfo.domain && packageInfo.domain.includes('.')

        const hasValidData = hasValidDescription || hasStructuralData || hasValidDomain

        if (!hasValidData) {
          console.error(`Package ${packageName} appears to have no meaningful data. Skipping to avoid creating empty files.`)
          return { success: false, fullDomainName: packageName }
        }

        // Additional validation: Check if we're about to overwrite a file with better data
        // We need to check both possible filenames: package name and domain-based
        const packageBasedFilename = packageInfo.name
          && packageInfo.name !== fullDomainName
          && packageInfo.name !== fullDomainName.split('/')[0]
          && packageInfo.name.length > 1
          && !packageInfo.name.includes('/')
          ? sanitizeFilename(packageInfo.name)
          : null
        const domainBasedFilename = fullDomainName.replace(/\//g, '-')

        const existingFilePath = packageBasedFilename
          ? path.join(outputDir, `${packageBasedFilename}.ts`)
          : path.join(outputDir, `${domainBasedFilename}.ts`)

        if (fs.existsSync(existingFilePath)) {
          const existingContent = fs.readFileSync(existingFilePath, 'utf-8')

          // Check if existing file has dependencies but new fetch doesn't
          const existingHasDependencies = existingContent.includes('dependencies: [')
            && !existingContent.includes('dependencies: [] as const')
          const newHasNoDependencies = packageInfo.dependencies.length === 0

          // Check if existing file has a real description but new fetch has generic one
          const existingHasRealDescription = !existingContent.includes('description: \'Package information for')
            && !existingContent.includes('description: \'\' as const')
          const newHasGenericDescription = packageInfo.description.includes('Package information for')
            || packageInfo.description.trim() === ''

          // If existing file is better, skip to avoid data degradation
          if ((existingHasDependencies && newHasNoDependencies)
            || (existingHasRealDescription && newHasGenericDescription)) {
            console.warn(`⚠️  Existing file ${existingFilePath} has better data than new fetch. Skipping to prevent data loss.`)
            console.warn(`   Existing deps: ${existingHasDependencies}, New deps: ${!newHasNoDependencies}`)
            console.warn(`   Existing desc: ${existingHasRealDescription}, New desc: ${!newHasGenericDescription}`)
            return { success: false, fullDomainName: packageName }
          }
        }

        // Sort versions using semver if they exist
        if (packageInfo.versions && packageInfo.versions.length > 0) {
          try {
            // Sort versions in descending order (newest first)
            packageInfo.versions.sort((a: string, b: string) => {
              try {
                // Use Bun.semver.order with negative multiplier for descending sort (newest first)
                return -1 * Bun.semver.order(a, b)
              }
              catch {
                // Fallback to string comparison if semver fails
                return b.localeCompare(a)
              }
            })
          }
          catch (error) {
            console.warn(`Warning: Failed to sort versions for ${packageName} using semver:`, error)
          }
        }

        // Create a safe version of the fullDomainName for filenames
        const safeFilename = fullDomainName.replace(/\//g, '-')

        // Add aliases information to the package info
        const knownAliases: string[] = []

        // Start with aliases that were extracted from the web scraping
        if (packageInfo.aliases && packageInfo.aliases.length > 0) {
          knownAliases.push(...packageInfo.aliases)
        }

        // Check if this is the target of an alias in PACKAGE_ALIASES
        for (const [alias, target] of Object.entries(aliases)) {
          if (target === fullDomainName && !knownAliases.includes(alias)) {
            knownAliases.push(alias)
          }
        }

        // Add the original name or path components as aliases
        if (originalName !== fullDomainName && !knownAliases.includes(originalName)) {
          knownAliases.push(originalName)
        }

        // Add the aliases to the package info
        const enhancedPackageInfo = {
          ...packageInfo,
          fullPath: packageName, // Store the full path in the package info
          aliases: knownAliases.length > 0 ? knownAliases : [],
        }

        // Save to cache first
        if (useCache) {
          // Save to cache directory
          const cachePath = path.join(cacheDir, `${safeFilename}.json`)
          const cacheData = {
            ...enhancedPackageInfo,
            fetchedAt: Date.now(),
          }

          // Ensure cache directory exists
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true })
          }

          // Write to cache
          fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2))
          console.log(`Saved package data to cache: ${cachePath}`)
        }

        // Always save the TypeScript file to the output directory
        const filePath: string = savePackageAsTypeScript(outputDir, fullDomainName, enhancedPackageInfo)

        console.log(`Successfully saved ${packageName} to ${filePath} with aliases: ${knownAliases.join(', ') || 'none'}`)
        return {
          success: true,
          fullDomainName,
          aliases: knownAliases,
          filePath,
        }
      }
      catch (error: any) {
        if (error.toString().includes('404') || error.toString().includes('Not Found')) {
          console.error(`Package ${packageName} returned 404 Not Found. Skipping to avoid overwriting existing files.`)
          return { success: false, fullDomainName: packageName }
        }
        throw error // Re-throw for other errors to allow retries
      }
    }
  }
  catch (error: any) {
    const errorString = String(error)

    // Check for timeout errors that should be retried
    const isTimeoutError = errorString.includes('Operation timed out after')
      || errorString.includes('Operation timeout after')
      || errorString.includes('timeout')
      || errorString.includes('Timeout')
      || errorString.includes('Navigation timeout')

    // Check for Playwright connection errors that indicate browser issues
    const isBrowserError = errorString.includes('No target found')
      || errorString.includes('targetId')
      || errorString.includes('Target page, context or browser has been closed')
      || errorString.includes('Protocol error')
      || errorString.includes('Connection closed')
      || errorString.includes('Assertion error')
      || errorString.includes('Browser has been closed')
      || errorString.includes('Target closed')
      || errorString.includes('Session closed')
      || errorString.includes('WebSocket connection closed')

    if (isTimeoutError) {
      console.error(`Timeout error for ${packageName}:`, errorString.substring(0, 200))

      // Wait a bit before retrying timeout errors
      await new Promise(resolve => setTimeout(resolve, 1000 * retryNumber))
    }
    else if (isBrowserError) {
      console.error(`Browser connection error for ${packageName}:`, errorString.substring(0, 200))

      // Force cleanup and wait longer for browser errors
      if (options.browser) {
        try {
          // Try to close the problematic browser
          await options.browser.close().catch(() => {})
        }
        catch {
          // Ignore errors when closing
        }
      }

      // Wait longer before retrying browser errors
      await new Promise(resolve => setTimeout(resolve, 3000 * retryNumber))
    }

    // If we've exceeded retry attempts, create a minimal placeholder package
    if (retryNumber >= maxRetries) {
      console.error(`Failed to fetch package ${packageName} after ${retryNumber} attempts:`, error)

      // Save debugging information if debug mode is enabled
      if (debug) {
        const debugPath = path.join(process.cwd(), `${packageName.replace(/\//g, '-')}-error.txt`)
        fs.writeFileSync(debugPath, `Error fetching ${packageName}:\n${error.toString()}\n\nStack:\n${error.stack || 'No stack trace available'}`)
        console.error(`Saved error details to ${debugPath}`)
      }

      // Don't create placeholder packages to avoid overwriting existing good files
      console.error(`Skipping ${packageName} after ${retryNumber} failed attempts to avoid overwriting existing files.`)
      return { success: false, fullDomainName: packageName }
    }

    console.error(`Attempt ${retryNumber} failed for ${packageName}, retrying...`, error)

    // Different wait times based on error type
    let waitTime = 500 * retryNumber // default
    if (isBrowserError) {
      waitTime = 2000 * retryNumber // longer for browser errors
    }
    else if (isTimeoutError) {
      waitTime = 1000 * retryNumber // medium for timeout errors
    }

    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Retry with same base timeout (actual timeout will still increase due to retry counter)
    return fetchAndSavePackage(packageName, outputDir, timeout, saveAsJson, retryNumber + 1, maxRetries, debug, options)
  }
}

/**
 * Check if a package has meaningful data and should be saved
 */

/**
 * Scans the local pantry directory and extracts all available packages
 * @param pantryDir Path to the pantry directory (default: 'src/pantry')
 * @returns Array of package names found in the pantry
 */
export async function scanPantryPackages(pantryDir = 'src/pantry'): Promise<string[]> {
  if (!fs.existsSync(pantryDir)) {
    throw new Error(`Pantry directory not found: ${pantryDir}. Please run 'bun ./bin/cli.ts update-pantry' first.`)
  }

  const packages: string[] = []

  function scanDirectory(dir: string, basePath = ''): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    // First, check if the current directory has a package.yml file
    const packageYmlPath = path.join(dir, 'package.yml')
    if (basePath && fs.existsSync(packageYmlPath)) {
      packages.push(basePath)
    }

    // Then recursively scan subdirectories (always continue regardless of package.yml presence)
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name
        const subDir = path.join(dir, entry.name)
        scanDirectory(subDir, currentPath)
      }
    }
  }

  scanDirectory(pantryDir)

  console.log(`Found ${packages.length} packages in pantry`)
  return packages.sort()
}

/**
 * Reads package.yml file and extracts basic package information
 * @param packageName The package name (e.g., 'github.com/user/repo')
 * @param pantryDir Path to the pantry directory
 * @returns Basic package information from package.yml
 */
export async function readPantryPackageInfo(packageName: string, pantryDir = 'src/pantry'): Promise<Partial<PkgxPackage> | null> {
  const packageYmlPath = path.join(pantryDir, packageName, 'package.yml')

  if (!fs.existsSync(packageYmlPath)) {
    console.warn(`Package.yml not found for ${packageName}`)
    return null
  }

  try {
    const yamlContent = fs.readFileSync(packageYmlPath, 'utf-8')

    // Parse YAML content - for now we'll extract what we can with simple regex
    // In a full implementation, you'd want to use a proper YAML parser

    // Extract dependencies with version constraints
    // Separate runtime dependencies (top-level) from build dependencies (build.dependencies)
    const runtimeDependencies: string[] = []
    const buildDependencies: string[] = []
    const depsLines = yamlContent.split('\n')
    let inDepsSection = false
    let inBuildDepsSection = false

    let inOsSection = false
    let currentOs = ''

    for (const line of depsLines) {
      // Check for top-level dependencies
      if (line.match(/^dependencies:\s*$/)) {
        inDepsSection = true
        inBuildDepsSection = false
        inOsSection = false
        continue
      }

      // Check for build.dependencies (2-space indented)
      if (line.match(/^\s{2}dependencies:\s*$/)) {
        inBuildDepsSection = true
        inDepsSection = false
        inOsSection = false
        continue
      }

      if (inDepsSection || inBuildDepsSection) {
        // Exit conditions: empty line or non-indented line (for top-level deps)
        // or less than 4-space indented line (for build deps)
        if (line.match(/^\s*$/)
          || (inDepsSection && line.match(/^\S/))
          || (inBuildDepsSection && !line.match(/^\s{4,}/))) {
          inDepsSection = false
          inBuildDepsSection = false
          inOsSection = false
          continue
        }

        // Check for OS-specific sections like "linux:", "darwin:", etc.
        const osMatch = line.match(/^\s{2}(linux|darwin|windows):\s*$/)
        if (osMatch) {
          inOsSection = true
          currentOs = osMatch[1]
          continue
        }

        // If we're in an OS section, look for packages with more indentation
        if (inOsSection) {
          // Parse lines like "    freetype.org: '*'" (4+ spaces)
          const osDepMatch = line.match(/^\s{4,}([^\s:]+):\s*['"]?([^'"]+)['"]?/)
          if (osDepMatch) {
            const pkg = osDepMatch[1]
            const version = osDepMatch[2].trim()

            // Add OS prefix to indicate conditional dependency
            const osPrefix = `${currentOs}:`

            if (version && version !== '*') {
              // Include version constraint - add @ for specific versions, ^ for ranges
              const hasVersionOperator = /^[~^>=<@]/.test(version)
              const isSpecificVersion = /^\d+(?:\.\d+)*$/.test(version)
              const operator = hasVersionOperator ? '' : (isSpecificVersion ? '@' : '^')
              const depString = `${osPrefix}${pkg}${operator}${version}`
              if (inBuildDepsSection) {
                buildDependencies.push(depString)
              }
              else {
                runtimeDependencies.push(depString)
              }
            }
            else {
              const depString = `${osPrefix}${pkg}`
              if (inBuildDepsSection) {
                buildDependencies.push(depString)
              }
              else {
                runtimeDependencies.push(depString)
              }
            }
          }
          // If we hit a line with less than 4 spaces, we're out of this OS section
          else if (!line.match(/^\s{4,}/) && !line.match(/^\s*$/)) {
            inOsSection = false
            currentOs = ''
          }
        }
        else {
          // Parse regular dependencies (direct under dependencies:)
          const depMatch = line.match(/^\s{2,3}([^\s:]+):\s*['"]?([^'"]+)['"]?/)
          if (depMatch) {
            const pkg = depMatch[1]
            const version = depMatch[2].trim()

            // Skip OS sections that we already handled
            if (['linux', 'darwin', 'windows'].includes(pkg)) {
              continue
            }

            if (version && version !== '*') {
              // Include version constraint - add @ for specific versions, ^ for ranges
              const hasVersionOperator = /^[~^>=<@]/.test(version)
              const isSpecificVersion = /^\d+(?:\.\d+)*$/.test(version)
              const operator = hasVersionOperator ? '' : (isSpecificVersion ? '@' : '^')
              const depString = `${pkg}${operator}${version}`
              if (inBuildDepsSection) {
                buildDependencies.push(depString)
              }
              else {
                runtimeDependencies.push(depString)
              }
            }
            else {
              const depString = pkg
              if (inBuildDepsSection) {
                buildDependencies.push(depString)
              }
              else {
                runtimeDependencies.push(depString)
              }
            }
          }
        }
      }
    }

    // Extract companions/runtime dependencies with version constraints
    const companions: string[] = []
    let inRuntimeSection = false

    for (const line of depsLines) {
      if (line.match(/^runtime:\s*$/)) {
        inRuntimeSection = true
        continue
      }
      if (inRuntimeSection) {
        if (line.match(/^\s*$/) || line.match(/^\S/)) {
          inRuntimeSection = false
          continue
        }

        // Skip environment variable definitions (env: section)
        if (line.match(/^\s+env:\s*$/)) {
          continue
        }

        // Skip lines that are environment variable assignments
        if (line.match(/^\s+[A-Z_]+:\s*\$\{\{/)) {
          continue
        }

        // Parse lines like "nodejs.org: '>=5'" or "curl.se: '*'" (actual package dependencies)
        const runtimeMatch = line.match(/^\s+([^\s:]+):\s*['"]?([^'"]+)['"]?/)
        if (runtimeMatch) {
          const pkg = runtimeMatch[1]
          const version = runtimeMatch[2].trim()

          // Skip if this looks like an environment variable (all caps with underscores)
          if (/^[A-Z_]+$/.test(pkg)) {
            continue
          }

          if (version && version !== '*') {
            // Include version constraint - add @ for specific versions, ^ for ranges
            const hasVersionOperator = /^[~^>=<@]/.test(version)
            const isSpecificVersion = /^\d+(?:\.\d+)*$/.test(version)
            const operator = hasVersionOperator ? '' : (isSpecificVersion ? '@' : '^')
            companions.push(`${pkg}${operator}${version}`)
          }
          else {
            companions.push(pkg)
          }
        }
      }
    }

    // Extract homepage and GitHub URLs from distributable.url
    let homepageUrl = ''
    let githubUrl = ''

    const distributableMatch = yamlContent.match(/distributable:[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*url:\s*(.+)/)
    if (distributableMatch) {
      const url = distributableMatch[1].trim()
      if (url.includes('github.com')) {
        // Extract GitHub URL from git+https://github.com/owner/repo.git format
        const githubMatch = url.match(/git\+https:\/\/github\.com\/([^/]+\/[^.]+)/)
        if (githubMatch) {
          githubUrl = `https://github.com/${githubMatch[1]}`

          // For well-known projects, try to determine homepage URL
          const repoPath = githubMatch[1]
          if (repoPath === 'python-attrs/attrs') {
            homepageUrl = 'https://www.attrs.org/'
          }
          // Add more mappings as needed
        }
      }
    }

    const packageInfo: Partial<PkgxPackage> = {
      name: packageName.split('/').pop() || packageName,
      domain: packageName,
      dependencies: runtimeDependencies,
      buildDependencies,
      companions,
      homepageUrl,
      githubUrl,
      // We'll get the rest from pkgx.dev
    }

    return packageInfo
  }
  catch (error) {
    console.warn(`Error reading package.yml for ${packageName}:`, error)
    return null
  }
}

/**
 * Combines pantry package data with additional metadata from pkgx.dev
 * @param packageName The package name (e.g., 'github.com/user/repo')
 * @param options Fetch options including pantry directory
 * @returns Complete package information
 */
export async function fetchPantryPackageWithMetadata(
  packageName: string,
  options: PackageFetchOptions = {},
): Promise<{ packageInfo: PkgxPackage, originalName: string, fullDomainName: string } | null> {
  const pantryDir = options.pantryDir || 'src/pantry'

  try {
    // First, get basic package info from pantry files
    const pantryInfo = await readPantryPackageInfo(packageName, pantryDir)

    if (!pantryInfo) {
      console.warn(`No pantry information found for ${packageName}`)
      return null
    }

    // Then fetch additional metadata from pkgx.dev
    try {
      const webData = await fetchPantryPackage(packageName, options)

      // Get alias overrides for this domain
      const domain = pantryInfo.domain || webData.packageInfo.domain
      const aliasOverrides = getAliasOverrides(domain)

      // Determine final aliases
      let finalAliases = webData.packageInfo.aliases || []
      if (aliasOverrides.length > 0) {
        if (shouldReplaceAliases(domain)) {
          // Replace existing aliases completely
          finalAliases = aliasOverrides
        }
        else {
          // Add to existing aliases, avoiding duplicates
          finalAliases = [...new Set([...finalAliases, ...aliasOverrides])]
        }
      }

      // Combine pantry data with web data, giving priority to pantry for dependencies/companions
      const combinedPackageInfo: PkgxPackage = {
        ...webData.packageInfo,
        // Override with pantry data where available
        dependencies: pantryInfo.dependencies && pantryInfo.dependencies.length > 0
          ? pantryInfo.dependencies
          : webData.packageInfo.dependencies,
        buildDependencies: pantryInfo.buildDependencies && pantryInfo.buildDependencies.length > 0
          ? pantryInfo.buildDependencies
          : webData.packageInfo.buildDependencies,
        companions: pantryInfo.companions && pantryInfo.companions.length > 0
          ? pantryInfo.companions
          : webData.packageInfo.companions,
        domain: pantryInfo.domain || webData.packageInfo.domain,
        // For name, prefer web data (which extracts actual program names) over pantry data (which uses generic path segments)
        // Only use pantry name if web data doesn't have a name
        name: webData.packageInfo.name || pantryInfo.name || packageName.split('/').pop() || packageName,
        // Use pantry URLs if available, otherwise fallback to web data
        homepageUrl: pantryInfo.homepageUrl || webData.packageInfo.homepageUrl,
        githubUrl: pantryInfo.githubUrl || webData.packageInfo.githubUrl,
        // Apply alias overrides
        aliases: finalAliases,
      }

      return {
        packageInfo: combinedPackageInfo,
        originalName: webData.originalName,
        fullDomainName: webData.fullDomainName,
      }
    }
    catch (webError) {
      console.warn(`Failed to fetch web metadata for ${packageName}, using pantry data only:`, webError)

      // Create a minimal package from pantry data only
      const packageInfo: PkgxPackage = {
        name: pantryInfo.name || packageName.split('/').pop() || packageName,
        domain: pantryInfo.domain || packageName,
        description: `Package from pantry: ${packageName}`,
        installCommand: `launchpad install ${packageName}`,
        pkgxInstallCommand: `sh <(curl https://pkgx.sh) +${packageName} -- $SHELL -i`,
        launchpadInstallCommand: `launchpad install ${packageName}`,
        programs: [],
        companions: pantryInfo.companions || [],
        dependencies: pantryInfo.dependencies || [],
        versions: [],
        packageYmlUrl: `https://github.com/pkgxdev/pantry/tree/main/projects/${packageName}/package.yml`,
        homepageUrl: '',
        githubUrl: '',
      }

      return {
        packageInfo,
        originalName: packageName,
        fullDomainName: packageName,
      }
    }
  }
  catch (error) {
    console.error(`Error processing pantry package ${packageName}:`, error)
    return null
  }
}
