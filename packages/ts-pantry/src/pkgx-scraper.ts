/**
 * pkgx.dev-specific scraper using direct API calls
 *
 * Data sources (matching what pkgx.dev itself uses):
 * 1. pkgx.dev JSON API - basic package info (name, description, homepage, github, provides)
 *    https://pkgx.dev/pkgs/{package}.json
 *
 * 2. dist.pkgx.dev - version lists (no GitHub API needed!)
 *    https://dist.pkgx.dev/{package}/{platform}/versions.txt
 *
 * 3. GitHub raw content - dependencies and companions from pantry
 *    https://raw.githubusercontent.com/pkgxdev/pantry/main/projects/{package}/package.yml
 *    (This is NOT the GitHub API, no rate limits apply)
 */

import type { PkgxPackageData } from './pkgx-fetcher'

export interface PkgxScraperOptions {
  timeout?: number
  useClientSideScraper?: boolean
}

interface PantryData {
  versions?: {
    github?: string
  }
  dependencies?: Record<string, string>
  companions?: string[]
  runtime?: {
    dependencies?: Record<string, string>
  }
  build?: {
    dependencies?: Record<string, string>
  }
}

/**
 * Scrape package data from pkgx.dev using direct API calls
 */
export async function scrapePkgxPackage(
  packageName: string,
  options: PkgxScraperOptions = {},
): Promise<PkgxPackageData> {
  const { timeout = 30000 } = options

  // STEP 1: Fetch basic package info from pkgx.dev JSON API
  const pkgxData = await fetchPkgxJson(packageName, timeout)

  // STEP 2: Fetch pantry data for dependencies, companions, and version info
  const pantryData = await fetchPantryData(packageName, timeout)

  // STEP 3: Fetch versions from pkgx distribution endpoint
  // pkgx.dev uses https://dist.pkgx.dev/{package}/{platform}/versions.txt
  // We'll fetch from darwin/aarch64 as it has all versions
  const versions = await fetchVersions(packageName, timeout)

  // STEP 4: Combine all data
  return normalizePackageData(pkgxData, pantryData, versions, packageName)
}

/**
 * Fetch basic package info from pkgx.dev JSON API
 * Returns null if not available (some packages don't have JSON API data)
 */
async function fetchPkgxJson(packageName: string, timeout: number): Promise<any | null> {
  const url = `https://pkgx.dev/pkgs/${packageName}.json`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ts-pkgx',
      },
      signal: AbortSignal.timeout(timeout),
    })

    if (!response.ok) {
      // JSON API not available for this package (404), fall back to other sources
      return null
    }

    return await response.json()
  }
  catch {
    // Network error or timeout, return null to use other data sources
    return null
  }
}

/**
 * Fetch versions from pkgx distribution endpoint
 * pkgx.dev fetches from dist.pkgx.dev/{package}/{platform}/versions.txt
 */
async function fetchVersions(packageName: string, timeout: number): Promise<string[]> {
  // Try darwin/aarch64 first (most complete list)
  const platforms = [
    'darwin/aarch64',
    'linux/x86-64',
    'linux/aarch64',
  ]

  for (const platform of platforms) {
    try {
      const url = `https://dist.pkgx.dev/${packageName}/${platform}/versions.txt`
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'ts-pkgx',
        },
        signal: AbortSignal.timeout(timeout),
      })

      if (response.ok) {
        const text = await response.text()
        const versions = text
          .split('\n')
          .map(v => v.trim())
          .filter(v => v.length > 0)

        if (versions.length > 0) {
          return versions.reverse() // Newest first
        }
      }
    }
    catch {
      // Try next platform
      continue
    }
  }

  // No versions found
  console.warn(`No versions found for ${packageName}`)
  return []
}

/**
 * Fetch pantry package.yml - uses local pantry if available, otherwise GitHub
 */
async function fetchPantryData(packageName: string, timeout: number): Promise<PantryData | null> {
  // Try local pantry first (much faster, no rate limits!)
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const process = await import('node:process')

    const localPath = path.join(process.cwd(), 'src/pantry', packageName, 'package.yml')

    if (fs.existsSync(localPath)) {
      const yaml = fs.readFileSync(localPath, 'utf-8')
      return parseSimpleYaml(yaml)
    }
  }
  catch {
    // Local pantry not available, will try GitHub
  }

  // Fallback to GitHub
  const url = `https://raw.githubusercontent.com/pkgxdev/pantry/main/projects/${packageName}/package.yml`

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/plain',
        'User-Agent': 'ts-pkgx',
      },
      signal: AbortSignal.timeout(timeout),
    })

    if (!response.ok) {
      console.warn(`Pantry data not found for ${packageName}`)
      return null
    }

    const yaml = await response.text()
    return parseSimpleYaml(yaml)
  }
  catch (error) {
    console.warn(`Failed to fetch pantry data for ${packageName}:`, error instanceof Error ? error.message : String(error))
    return null
  }
}

/**
 * Simple YAML parser for package.yml (we only need a few fields)
 * This handles the specific structure of pkgx pantry files
 */
function parseSimpleYaml(yaml: string): PantryData {
  const data: PantryData = {}
  const lines = yaml.split('\n')

  // Extract versions.github
  let inVersions = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.match(/^versions:\s*$/)) {
      inVersions = true
      continue
    }

    if (inVersions) {
      const githubMatch = line.match(/^\s+github:\s+([^\s#]+)/)
      if (githubMatch) {
        data.versions = { github: githubMatch[1].trim() }
        break
      }
      // Exit if we hit another top-level key
      if (line.match(/^[a-z]/)) {
        inVersions = false
      }
    }
  }

  // Extract top-level dependencies (runtime deps)
  let inDeps = false
  const runtimeDeps: Record<string, string> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.match(/^dependencies:\s*$/)) {
      inDeps = true
      continue
    }

    if (inDeps) {
      // Match lines like "  lame.sourceforge.io: '>=3.98.3'"
      const depMatch = line.match(/^\s{2}([a-z0-9./]+):\s*['\x22]?([^'\x22#\n]+)['\x22]?/)
      if (depMatch) {
        const pkg = depMatch[1].trim()
        const version = depMatch[2].trim()
        runtimeDeps[pkg] = version
      }

      // Exit if we hit another top-level key
      if (line.match(/^[a-z]/) && !line.match(/^\s/)) {
        break
      }
    }
  }

  if (Object.keys(runtimeDeps).length > 0) {
    data.dependencies = runtimeDeps
  }

  // Extract build.dependencies (build-time deps)
  let inBuild = false
  let inBuildDeps = false
  const buildDeps: Record<string, string> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.match(/^build:\s*$/)) {
      inBuild = true
      continue
    }

    if (inBuild && line.match(/^\s{2}dependencies:\s*$/)) {
      inBuildDeps = true
      continue
    }

    if (inBuildDeps) {
      // Check for OS-specific dependency sections (e.g., "    linux:")
      const osMatch = line.match(/^\s{4}(darwin|linux):\s*$/)
      if (osMatch) {
        const os = osMatch[1]
        // Read the nested dependencies under this OS
        i++
        while (i < lines.length) {
          const osLine = lines[i]
          // Match dependencies like "      gnu.org/gcc: ^14"
          const osDepMatch = osLine.match(/^\s{6,}([a-z0-9./]+):\s*['\x22]?([^'\x22#\n]+)['\x22]?/)
          if (osDepMatch) {
            const pkg = osDepMatch[1].trim()
            const version = osDepMatch[2].trim()
            buildDeps[`${os}:${pkg}`] = version
            i++
          }
          else if (osLine.match(/^\s{0,5}\S/)) {
            // Exit nested section when we hit a line with less indentation
            i--
            break
          }
          else {
            i++
          }
        }
        continue
      }

      // Match regular (non-OS-specific) dependencies like "    curl.se: '*'"
      // Must have EXACTLY 4 spaces (not more, to avoid matching nested script items)
      const depMatch = line.match(/^ {4}([a-z0-9./]+):\s*['\x22]?([^'\x22#\n]+)['\x22]?/)
      if (depMatch && !line.match(/^ {5}/)) { // Ensure not more than 4 spaces
        const pkg = depMatch[1].trim()
        const version = depMatch[2].trim()
        // Skip if this looks like a script key (if, run, working-directory, etc.)
        if (!['if', 'run', 'working-directory', 'env', 'script'].includes(pkg)) {
          buildDeps[pkg] = version
        }
      }

      // Exit if we hit another section (script, env, etc.) or top-level key
      if (line.match(/^\s{2}(script|env|working-directory):\s*$/) || line.match(/^[a-z]/)) {
        break
      }
    }
  }

  if (Object.keys(buildDeps).length > 0) {
    data.build = { dependencies: buildDeps }
  }

  return data
}

/**
 * Normalize package data from various sources
 */
function normalizePackageData(
  pkgxData: any | null,
  pantryData: PantryData | null,
  versions: string[],
  packageName: string,
): PkgxPackageData {
  // Extract dependencies from pantry
  // Separate runtime dependencies (top-level) from build dependencies (build.dependencies)
  const runtimeDependencies: string[] = []
  const buildDependencies: string[] = []

  // Add runtime dependencies (top-level dependencies section)
  if (pantryData?.dependencies) {
    for (const [pkg, version] of Object.entries(pantryData.dependencies)) {
      const versionStr = version.toString().trim()
      runtimeDependencies.push(versionStr === '*' ? pkg : `${pkg}@${versionStr}`)
    }
  }

  // Add build dependencies (build.dependencies section)
  if (pantryData?.build?.dependencies) {
    for (const [pkg, version] of Object.entries(pantryData.build.dependencies)) {
      const versionStr = version.toString().trim()
      buildDependencies.push(versionStr === '*' ? pkg : `${pkg}@${versionStr}`)
    }
  }

  // Combine all dependencies for backwards compatibility (but keep them separated in the package data)
  const allDependencies = [...runtimeDependencies, ...buildDependencies]

  // Extract name from package path if not in pkgxData (e.g., "getmonero.org" -> "getmonero")
  const fallbackName = packageName.split('/').pop()?.replace(/\.(org|com|io|net|dev)$/, '') || packageName

  return {
    name: pkgxData?.displayName || pkgxData?.name || fallbackName,
    domain: pkgxData?.project || packageName,
    brief: pkgxData?.brief || pkgxData?.description || '',
    description: pkgxData?.description || pkgxData?.brief || '',
    displayName: pkgxData?.displayName,
    homepage: pkgxData?.homepage,
    github: pkgxData?.github,
    brew_url: pkgxData?.brew_url,
    license: pkgxData?.license,
    provides: pkgxData?.provides || [],
    companions: pantryData?.companions || [],
    // Keep separate dependency types
    dependencies: runtimeDependencies, // Only runtime dependencies in the main dependencies field
    buildDependencies, // Build-time dependencies
    // Also provide combined list for backwards compatibility
    allDependencies,
    versions,
    build: pantryData?.build,
    interprets: pkgxData?.interprets,
  }
}

/**
 * Scrape multiple packages
 */
export async function scrapePkgxPackages(
  packageNames: string[],
  options: PkgxScraperOptions = {},
): Promise<Map<string, PkgxPackageData>> {
  const results = new Map<string, PkgxPackageData>()

  const promises = packageNames.map(async (name) => {
    try {
      const data = await scrapePkgxPackage(name, options)
      results.set(name, data)
    }
    catch (error) {
      console.error(`Failed to scrape ${name}:`, error)
    }
  })

  await Promise.all(promises)

  return results
}

/**
 * List all packages by scraping the index
 */
export async function scrapePkgxIndex(
  _options: PkgxScraperOptions = {},
): Promise<string[]> {
  // Use the discovered index endpoint
  const indexUrl = 'https://pkgx.dev/pkgs/index.json'

  try {
    const response = await fetch(indexUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json() as Array<{ project: string }>
      return data.map(item => item.project)
    }
  }
  catch {
    // Fall through
  }

  // Fallback: If the JSON API fails, we should error out rather than try to scrape
  // (scraping is no longer needed since the JSON API is reliable)
  throw new Error('Failed to fetch package index from pkgx.dev/pkgs/index.json')
}
