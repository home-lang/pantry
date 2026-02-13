import type { DependencyResolverOptions } from '../src/dependency-resolver'
import type { PackageFetchOptions } from '../src/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CLI } from '@stacksjs/clapp'
import { version } from '../package.json'
import { findDependencyFiles, resolveDependencyFile } from '../src/dependency-resolver'
import {
  cleanupBrowserResources,
  DEFAULT_CACHE_DIR,
  DEFAULT_CACHE_EXPIRATION_MINUTES,
  DEFAULT_TIMEOUT_MS,
  fetchAndSaveAllPackages,
  fetchPantryPackageWithMetadata,
  generateAliases,
  generateDocs,
  generateIndex,
  savePackageAsTypeScript,
  saveToCacheAndOutput,
} from '../src/index'
import { aliases as PACKAGE_ALIASES } from '../src/packages/aliases'

// Helper functions for consts generation

/**
 * Scan pantry directory for packages (for consts generation)
 */
async function scanPantryPackagesForConsts(pantryDir = 'src/pantry'): Promise<string[]> {
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

    // Then recursively scan subdirectories
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name
        const subDir = path.join(dir, entry.name)
        scanDirectory(subDir, currentPath)
      }
    }
  }

  scanDirectory(pantryDir)
  console.log(`📦 Found ${packages.length} packages in local pantry`)
  return packages.sort()
}

/**
 * Scrape packages from S3 registry (for consts generation)
 */
async function scrapeRegistryPackages(_validate = false): Promise<string[]> {
  interface S3ListResult {
    IsTruncated: boolean
    NextContinuationToken?: string
    Contents: Array<{
      Key: string
    }>
  }

  async function fetchS3Listing(continuationToken?: string): Promise<S3ListResult> {
    const url = new URL('https://s3.amazonaws.com/dist.tea.xyz/')
    url.searchParams.set('list-type', '2')
    url.searchParams.set('prefix', '')
    url.searchParams.set('max-keys', '1000')

    if (continuationToken) {
      url.searchParams.set('continuation-token', continuationToken)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`Failed to fetch S3 listing: ${response.status}`)
    }

    const xml = await response.text()
    const contents: Array<{ Key: string }> = []
    const keyMatches = xml.match(/<Key>([^<]+)<\/Key>/g)

    if (keyMatches) {
      for (const match of keyMatches) {
        const key = match.replace(/<Key>([^<]+)<\/Key>/, '$1')
        contents.push({ Key: key })
      }
    }

    const isTruncated = xml.includes('<IsTruncated>true</IsTruncated>')
    const nextTokenMatch = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)
    const nextToken = nextTokenMatch ? nextTokenMatch[1] : undefined

    return {
      IsTruncated: isTruncated,
      NextContinuationToken: nextToken,
      Contents: contents,
    }
  }

  console.log('Scraping packages from S3 registry...')
  const packages = new Set<string>()
  let continuationToken: string | undefined

  do {
    const listing = await fetchS3Listing(continuationToken)

    for (const item of listing.Contents) {
      const key = item.Key
      const parts = key.split('/')
      if (parts.length === 0)
        continue

      // Skip obvious non-package files
      if (parts[0].startsWith('.') || parts[0].includes(' ') || key.match(/\.(md|txt|yml|yaml|json)$/i)) {
        continue
      }

      const platformDirs = ['darwin', 'linux', 'windows']
      let platformIndex = -1
      for (let i = 1; i < parts.length; i++) {
        if (platformDirs.includes(parts[i])) {
          platformIndex = i
          break
        }
      }

      if (platformIndex > 0) {
        const packagePath = parts.slice(0, platformIndex).join('/')
        if (packagePath.includes('.')) {
          packages.add(packagePath)
        }
      }
      else if (parts.length >= 2 && parts[0].includes('.') && !parts[1].startsWith('v') && !parts[1].match(/^\d/)) {
        const packagePath = `${parts[0]}/${parts[1]}`
        packages.add(packagePath)
      }
      else if (parts.length >= 1 && parts[0].includes('.')) {
        packages.add(parts[0])
      }
    }

    continuationToken = listing.NextContinuationToken
    console.log(`Found ${packages.size} packages so far...`)
  } while (continuationToken)

  // Filter packages
  const packageArray = Array.from(packages).sort()
  const validPackages: string[] = []

  // Filter out problematic patterns
  for (const pkg of packageArray) {
    // Basic filtering
    if (!pkg.includes('.') || pkg.match(/^[a-z0-9.-]+\.[a-z]{2,}(\/[\w.-]+)*$/i) === null) {
      continue
    }

    // Filter out README and documentation files
    if (pkg.endsWith('/README.rst') || pkg.endsWith('/README') || pkg.includes('/docs/')) {
      continue
    }

    // Filter out .pkgroot entries - these are just markers, not actual packages
    if (pkg.endsWith('/.pkgroot')) {
      continue
    }

    // Filter out known invalid packages
    const knownInvalidPackages = [
      'amazon.com/aws',
      'charm.sh',
      'code.videolan.org',
      'crates.io',
    ]
    if (knownInvalidPackages.includes(pkg)) {
      continue
    }

    validPackages.push(pkg)
  }

  console.log(`📦 Found ${validPackages.length} valid packages in registry`)
  return validPackages
}

/**
 * Update the consts.ts file with the given packages
 */
async function updateConstsFile(packages: string[], source: string): Promise<void> {
  const constsPath = 'src/consts.ts'

  const constantsContent = `/**
 * Constants used throughout the ts-pkgx package
 * This file is auto-generated from ${source}. Do not edit manually.
 * Generated on ${new Date().toISOString()}
 */

/**
 * Default cache directory for storing package data
 */
export const DEFAULT_CACHE_DIR = '.cache/packages'

/**
 * Default cache expiration time in minutes (24 hours)
 */
export const DEFAULT_CACHE_EXPIRATION_MINUTES = 1440

/**
 * Default timeout for network requests in milliseconds (20 seconds)
 */
export const DEFAULT_TIMEOUT_MS = 20000

/**
 * Package aliases mapping friendly names to domain names
 */
export const PACKAGE_ALIASES: Record<string, string> = {
  'node': 'nodejs.org',
  'python': 'python.org',
  'go': 'go.dev',
  'rust': 'rust-lang.org',
  'ruby': 'ruby-lang.org',
  'php': 'php.net',
  'perl': 'perl.org',
  'deno': 'deno.land',
  'bun': 'bun.sh',
  'bun.com': 'bun.sh',
  'git': 'git-scm.com',
  'docker': 'docker.com',
  'kubectl': 'kubernetes.io',
  'terraform': 'terraform.io',
  'ansible': 'ansible.com',
  'nvim': 'neovim.io',
  'vim': 'vim.org',
  'curl': 'curl.se',
} as const

/**
 * List of all known packages (${packages.length} total)
 */
export const ALL_KNOWN_PACKAGES: readonly string[] = [
${packages.map(pkg => `  '${pkg}',`).join('\n')}
] as const
`

  fs.writeFileSync(constsPath, constantsContent, 'utf-8')
}

// Define interface for CLI options
interface FetchOptions {
  all?: boolean
  pkg?: string
  outputDir?: string
  cacheDir?: string
  cache?: boolean
  cacheExpiration?: number
  limit?: number
  timeout?: number
  maxRetries?: number
  json?: boolean
  debug?: boolean
  verbose?: boolean
  concurrency?: number
  outputJson?: boolean
}

const cli = new CLI('ts-pkgx')

// Force exit after a maximum timeout to prevent hung processes
// This is a safety mechanism in case Playwright doesn't close properly
const EXIT_TIMEOUT = 1500000 // 25 minutes
const forceExitTimeout = setTimeout(() => {
  console.error('Force exiting after timeout - process may have hung') // so GitHub Actions doesn't run forever
  process.exit(1)
}, EXIT_TIMEOUT)

// Clear the force exit timeout if process exits normally
process.on('exit', () => {
  clearTimeout(forceExitTimeout)
})

// Clean exit handler for SIGINT and SIGTERM
async function exitHandler(signal: string) {
  console.log(`\nReceived ${signal} signal. Cleaning up resources...`)
  clearTimeout(forceExitTimeout)

  try {
    await cleanupBrowserResources()
    console.log('Resources cleaned up. Exiting.')
  }
  catch (err) {
    console.error('Error during cleanup:', err)
  }

  // Force exit after cleanup attempt
  setTimeout(() => {
    console.log('Forcing process exit...')
    process.exit(0)
  }, 1000)
}

// Process interrupt handling to ensure clean exit
process.on('SIGINT', () => exitHandler('SIGINT'))
process.on('SIGTERM', () => exitHandler('SIGTERM'))

/**
 * Convert a domain name to a friendly alias name if available
 */
function getFriendlyName(domainName: string): string {
  // Create reverse mapping from PACKAGE_ALIASES
  const reverseAliases: Record<string, string> = {}
  for (const [alias, domain] of Object.entries(PACKAGE_ALIASES)) {
    if (typeof domain === 'string') {
      reverseAliases[domain] = alias
    }
  }

  // Return the friendly alias if available, otherwise return the domain
  return reverseAliases[domainName] || domainName
}

/**
 * Convert a list of domain names to friendly names
 */
function getFriendlyNames(domainNames: string[]): { friendlyNames: string[], mixedNames: string[] } {
  const friendlyNames = domainNames.map(getFriendlyName)

  // Create a mixed list that uses friendly names when available, domain names otherwise
  const mixedNames = domainNames.map((domain) => {
    const friendly = getFriendlyName(domain)
    // If the friendly name is the same as domain, it means no alias was found
    return friendly === domain ? domain : friendly
  })

  return { friendlyNames, mixedNames }
}

// Unified fetch command with all functionality
cli
  .command('fetch [packageName]', 'Fetch package information from pkgx.dev')
  .option('-a, --all', 'Fetch all packages')
  .option('-p, --pkg <packageNames>', 'Comma-separated list of package names to fetch')
  .option('-o, --output-dir <dir>', 'Directory to save package data', { default: 'src/packages' })
  .option('-c, --cache-dir <dir>', 'Directory to cache package data', { default: DEFAULT_CACHE_DIR })
  .option('-n, --no-cache', 'Disable caching')
  .option('-e, --cache-expiration <minutes>', 'Cache expiration time in minutes', { default: DEFAULT_CACHE_EXPIRATION_MINUTES })
  .option('-l, --limit <count>', 'Limit the number of packages to fetch (use with --all)')
  .option('-t, --timeout <ms>', 'Timeout for network requests in milliseconds', { default: DEFAULT_TIMEOUT_MS })
  .option('-r, --max-retries <count>', 'Maximum number of retry attempts for failed requests', { default: 3 })
  .option('-j, --json', 'Save as JSON instead of TypeScript')
  .option('-d, --debug', 'Enable debug mode (save screenshots)')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-y, --concurrency <count>', 'Number of packages to fetch concurrently (default: 8)', { default: 8 })
  .option('--output-json', 'Output results as JSON (for CI integration)')
  .action(async (packageName: string | undefined, options: FetchOptions) => {
    // Extract options with appropriate types
    const {
      all: fetchAll,
      outputDir = 'src/packages',
      cacheDir = DEFAULT_CACHE_DIR,
      cache = true,
      cacheExpiration = DEFAULT_CACHE_EXPIRATION_MINUTES,
      limit,
      timeout = DEFAULT_TIMEOUT_MS,
      json: saveAsJson = false,
      debug = false,
      verbose = false,
      concurrency = 8,
      pkg,
      outputJson = false,
    } = options

    // Ensure output directory exists
    const outputDirPath = path.resolve(process.cwd(), outputDir)
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true })
    }

    // Ensure cache directory exists if caching is enabled
    const cacheDirPath = path.resolve(process.cwd(), cacheDir)
    if (cache) {
      if (!fs.existsSync(cacheDirPath)) {
        fs.mkdirSync(cacheDirPath, { recursive: true })
      }
    }

    try {
      let savedPackages: string[] = []
      let actuallyFetched: string[] = []

      if (fetchAll) {
        // Fetch all packages
        if (!outputJson) {
          console.log('Fetching all packages...')
        }
        const fetchOptions: PackageFetchOptions = {
          outputDir,
          cacheDir,
          cache,
          cacheExpirationMinutes: cacheExpiration,
          timeout: Number.parseInt(String(timeout), 10),
          debug,
          limit: limit ? Number.parseInt(String(limit), 10) : undefined,
          concurrency: Math.min(Number.parseInt(String(concurrency), 10), 12),
          outputJson,
        }

        savedPackages = await fetchAndSaveAllPackages(fetchOptions)
        // For the bulk fetch, we'll consider all returned packages as "actually fetched"
        // since the function only returns packages that were successfully processed
        actuallyFetched = [...savedPackages]
      }
      else if (pkg) {
        // Fetch specific packages
        const packageNames = pkg.split(',').map((p: string) => p.trim())
        if (!outputJson) {
          console.log(`Fetching ${packageNames.length} packages: ${packageNames.join(', ')}`)
        }

        // Process each package sequentially using the new pantry-based approach
        for (const name of packageNames) {
          try {
            // Check cache first
            const cacheFile = path.join(cacheDir, `${name.replace(/\//g, '-')}.json`)
            let usedCache = false

            if (cache && fs.existsSync(cacheFile)) {
              const stats = fs.statSync(cacheFile)
              const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60)

              if (ageMinutes < cacheExpiration) {
                if (!outputJson) {
                  console.log(`Using cached data for ${name} (age: ${Math.round(ageMinutes)} minutes)`)
                }
                try {
                  const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
                  // Remove fetchedAt before generating TypeScript
                  delete cachedData.fetchedAt
                  const tsFilePath = savePackageAsTypeScript(outputDir, name, cachedData)
                  if (verbose && !outputJson) {
                    console.log(`Using cached data for ${name} (saved to ${tsFilePath})`)
                  }
                  savedPackages.push(name)
                  usedCache = true
                  continue
                }
                catch {
                  console.warn(`Cache file corrupted for ${name}, will refetch`)
                }
              }
            }

            if (!usedCache) {
              // Use the new pantry-based fetch approach
              const result = await fetchPantryPackageWithMetadata(name, {
                timeout: Number.parseInt(String(timeout), 10),
                debug,
                outputJson,
                cacheDir,
                cache,
                cacheExpirationMinutes: cacheExpiration,
              })

              if (result) {
                // Save to cache and output
                const { outputPath } = saveToCacheAndOutput(name, result.packageInfo, {
                  cacheDir,
                  outputDir,
                  cache,
                })

                savedPackages.push(name)
                actuallyFetched.push(name)
                if (verbose && !outputJson) {
                  console.log(`Successfully saved ${name} to ${outputPath}`)
                }
              }
            }
          }
          catch (error) {
            console.error(`Error processing ${name}:`, error)
          }
        }
      }
      else if (packageName) {
        // Fetch a single package using the new pantry-based approach
        if (!outputJson) {
          console.log(`Fetching package: ${packageName}`)
        }

        try {
          // Check cache first
          const cacheFile = path.join(cacheDirPath, `${packageName.replace(/\//g, '-')}.json`)
          let usedCache = false

          if (cache && fs.existsSync(cacheFile)) {
            const stats = fs.statSync(cacheFile)
            const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60)

            if (ageMinutes < cacheExpiration) {
              if (!outputJson) {
                console.log(`Using cached data for ${packageName} (age: ${Math.round(ageMinutes)} minutes)`)
              }
              try {
                const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
                // Remove fetchedAt before generating TypeScript
                delete cachedData.fetchedAt
                const tsFilePath = savePackageAsTypeScript(outputDirPath, packageName, cachedData)
                if (verbose && !outputJson) {
                  console.log(`Using cached data for ${packageName} (saved to ${tsFilePath})`)
                }
                savedPackages.push(packageName)
                usedCache = true
              }
              catch {
                console.warn(`Cache file corrupted for ${packageName}, will refetch`)
              }
            }
          }

          if (!usedCache) {
            // Use the new pantry-based fetch approach
            const result = await fetchPantryPackageWithMetadata(packageName, {
              timeout: Number.parseInt(String(timeout), 10),
              debug,
              outputJson,
              cacheDir,
              cache,
              cacheExpirationMinutes: cacheExpiration,
            })

            if (result) {
              // Save to cache and output
              const { outputPath } = saveToCacheAndOutput(packageName, result.packageInfo, {
                cacheDir,
                outputDir,
                cache,
              })

              savedPackages.push(packageName)
              actuallyFetched.push(packageName)
              if (verbose && !outputJson) {
                console.log(`Successfully saved ${packageName} to ${outputPath}`)
              }
            }
          }
        }
        catch (error) {
          console.error(`Error processing ${packageName}:`, error)
        }
      }
      else {
        if (!outputJson) {
          console.error('Error: Please specify a package name, use --pkg, or use --all')
        }
        process.exit(1)
      }

      // Generate index file after fetching packages
      if (!saveAsJson && savedPackages.length > 0) {
        const indexPath = await generateIndex()
        if (!outputJson) {
          console.log(`Successfully generated ${indexPath}`)
        }
      }

      // Output results
      if (outputJson) {
        // Get friendly names for the updated packages
        const { friendlyNames, mixedNames } = getFriendlyNames(actuallyFetched)
        const { friendlyNames: allFriendlyNames, mixedNames: allMixedNames } = getFriendlyNames(savedPackages)

        // Output JSON for CI integration
        const result = {
          success: true,
          updatedPackages: actuallyFetched, // Packages that were actually fetched (not from cache)
          updatedPackagesFriendly: friendlyNames, // Friendly names for fetched packages
          updatedPackagesMixed: mixedNames, // Mixed friendly/domain names for fetched packages
          allProcessedPackages: savedPackages, // All packages processed (including from cache)
          allProcessedFriendly: allFriendlyNames, // All packages in friendly names
          allProcessedMixed: allMixedNames, // All packages in mixed names
          totalUpdated: actuallyFetched.length, // Count of actually fetched packages
          totalProcessed: savedPackages.length, // Count of all processed packages
          timestamp: new Date().toISOString(),
        }
        console.log(JSON.stringify(result))
      }
      else {
        console.log(`Processed ${savedPackages.length} packages.`)
      }

      // Clear the force exit timeout as we're finishing normally
      clearTimeout(forceExitTimeout)

      // Clean up and exit
      await cleanupBrowserResources()

      // Force exit after cleanup to prevent hanging
      setTimeout(() => process.exit(0), 1000)
    }
    catch (error) {
      if (outputJson) {
        // Output JSON error for CI integration
        const result = {
          success: false,
          error: String(error),
          timestamp: new Date().toISOString(),
        }
        console.log(JSON.stringify(result))
      }
      else {
        console.error('Error:', error)
      }

      // Attempt to clean up resources even on error
      await cleanupBrowserResources()

      // Force exit with error code
      setTimeout(() => process.exit(1), 1000)
    }
  })

// Generate index file command
cli
  .command('generate-index', 'Generate TypeScript index file for packages')
  .option('-o, --output-dir <dir>', 'Directory containing package files', { default: 'src/packages' })
  .action(async (options) => {
    const { outputDir = 'src/packages' } = options
    const outputDirPath = path.resolve(process.cwd(), outputDir)

    if (!fs.existsSync(outputDirPath)) {
      console.error(`Error: Directory ${outputDirPath} does not exist`)
      process.exit(1)
    }

    try {
      const indexPath = await generateIndex()
      console.log(`Successfully generated ${indexPath}`)

      // Force exit after successful completion to prevent hanging
      setTimeout(() => process.exit(0), 500)
    }
    catch (error) {
      console.error('Error generating index:', error)
      process.exit(1)
    }
  })

// Add a new command to generate TypeScript files from cached JSON
cli
  .command('generate-ts', 'Generate TypeScript files from cached JSON files')
  .option('--cache-dir <dir>', 'Directory with cached JSON files', { default: DEFAULT_CACHE_DIR })
  .option('--output-dir <dir>', 'Output directory for TypeScript files', { default: 'packages' })
  .action(async (options) => {
    try {
      console.log('Generating TypeScript files from cached JSON...')

      const cacheDir = options.cacheDir
      const outputDir = options.outputDir

      if (!fs.existsSync(cacheDir)) {
        console.error(`Cache directory ${cacheDir} does not exist!`)
        process.exit(1)
      }

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'))
      console.log(`Found ${files.length} JSON files in cache directory`)

      let count = 0
      for (const file of files) {
        try {
          const jsonContent = fs.readFileSync(path.join(cacheDir, file), 'utf-8')
          const packageInfo = JSON.parse(jsonContent)

          // Skip fetchedAt timestamp when generating TypeScript
          delete packageInfo.fetchedAt

          // Get domain name from filename (remove .json extension)
          const domainName = file.replace(/\.json$/, '')

          // Generate TypeScript file - use original domain from package info if available,
          // otherwise fallback to filename
          const tsFilePath = savePackageAsTypeScript(
            outputDir,
            packageInfo.fullPath || packageInfo.domain || domainName,
            packageInfo,
          )

          console.log(`Generated ${tsFilePath}`)
          count++
        }
        catch (error) {
          console.error(`Error processing ${file}:`, error)
        }
      }

      console.log(`Successfully generated ${count} TypeScript files from JSON cache`)
    }
    catch (error) {
      console.error('Error generating TypeScript files:', error)
      process.exit(1)
    }
  })

// Generate aliases file command
cli
  .command('generate-aliases', 'Generate TypeScript aliases file for packages')
  .action(async () => {
    try {
      const aliasesPath = await generateAliases()
      console.log(`Successfully generated ${aliasesPath}`)

      // Force exit after successful completion to prevent hanging
      setTimeout(() => process.exit(0), 500)
    }
    catch (error) {
      console.error('Error generating aliases:', error)
      process.exit(1)
    }
  })

// Generate comprehensive documentation command
cli
  .command('generate-docs', 'Generate comprehensive VitePress documentation for all packages')
  .option('-o, --output-dir <dir>', 'Output directory for documentation', { default: 'docs' })
  .action(async (options) => {
    try {
      const { outputDir = 'docs' } = options
      await generateDocs(outputDir)

      // Force exit after successful completion to prevent hanging
      setTimeout(() => process.exit(0), 500)
    }
    catch (error) {
      console.error('Error generating documentation:', error)
      process.exit(1)
    }
  })

// Add a new command to download and extract pantry
cli
  .command('update-pantry', 'Download and extract the latest pantry.tgz file')
  .option('-d, --pantry-dir <dir>', 'Directory to extract pantry files', { default: 'src/pantry' })
  .action(async (options) => {
    try {
      const { pantryDir = 'src/pantry' } = options
      const pantryDirPath = path.resolve(process.cwd(), pantryDir)

      console.log('Downloading pantry.tgz...')

      // Download pantry.tgz
      const response = await fetch('https://s3.amazonaws.com/dist.tea.xyz/pantry.tgz')
      if (!response.ok) {
        throw new Error(`Failed to download pantry.tgz: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const tempPath = path.join(process.cwd(), 'pantry.tgz')

      // Write to temporary file
      fs.writeFileSync(tempPath, new Uint8Array(buffer))
      console.log(`Downloaded ${buffer.byteLength} bytes`)

      // Remove existing pantry directory if it exists
      if (fs.existsSync(pantryDirPath)) {
        fs.rmSync(pantryDirPath, { recursive: true, force: true })
        console.log(`Removed existing ${pantryDirPath}`)
      }

      // Create pantry directory
      fs.mkdirSync(pantryDirPath, { recursive: true })

      // Extract pantry.tgz using tar command (first to temp directory)
      const tempExtractDir = path.join(process.cwd(), 'temp-pantry')
      const { spawn } = await import('node:child_process')

      // Create temp directory for extraction
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true })
      }
      fs.mkdirSync(tempExtractDir, { recursive: true })

      const tar = spawn('tar', ['-xzf', tempPath, '-C', tempExtractDir, '--strip-components=1'], {
        stdio: 'inherit',
      })

      await new Promise((resolve, reject) => {
        tar.on('close', (code) => {
          if (code === 0) {
            resolve(code)
          }
          else {
            reject(new Error(`tar extraction failed with code ${code}`))
          }
        })
        tar.on('error', reject)
      })

      // Move the contents of the projects folder to the pantry directory
      const tempProjectsDir = path.join(tempExtractDir, 'projects')
      if (fs.existsSync(tempProjectsDir)) {
        const projects = fs.readdirSync(tempProjectsDir)
        console.log(`Moving ${projects.length} projects from temp directory...`)

        for (const project of projects) {
          const sourcePath = path.join(tempProjectsDir, project)
          const destPath = path.join(pantryDirPath, project)

          // Remove destination if it exists
          if (fs.existsSync(destPath)) {
            fs.rmSync(destPath, { recursive: true, force: true })
          }

          // Move the project directory
          fs.renameSync(sourcePath, destPath)
        }

        console.log(`Successfully moved ${projects.length} projects to ${pantryDirPath}`)
      }
      else {
        console.log('Warning: No projects directory found in extracted pantry')
      }

      // Clean up temporary directories and files
      fs.unlinkSync(tempPath)
      if (fs.existsSync(tempExtractDir)) {
        fs.rmSync(tempExtractDir, { recursive: true, force: true })
      }
      console.log('Cleaned up temporary files')

      // Count final projects
      if (fs.existsSync(pantryDirPath)) {
        const projects = fs.readdirSync(pantryDirPath).filter((item) => {
          const itemPath = path.join(pantryDirPath, item)
          return fs.statSync(itemPath).isDirectory() && !item.startsWith('.')
        })
        console.log(`Final result: ${projects.length} projects in ${pantryDirPath}`)
      }

      process.exit(0)
    }
    catch (error) {
      console.error('Error updating pantry:', error)
      process.exit(1)
    }
  })

// Generate consts file command
cli
  .command('generate-consts', 'Generate or update the consts.ts file with all known packages')
  .option('-s, --source <source>', 'Source for packages: "pantry" (default) or "registry"', { default: 'pantry' })
  .option('--pantry-dir <dir>', 'Directory containing pantry files', { default: 'src/pantry' })
  .option('--validate', 'Validate a sample of packages (slower but more accurate)')
  .action(async (options) => {
    try {
      const { source = 'pantry', pantryDir = 'src/pantry', validate = false } = options

      console.log(`🚀 Generating consts.ts file using ${source} as source...`)

      let packages: string[] = []

      if (source === 'pantry') {
        packages = await scanPantryPackagesForConsts(pantryDir)
      }
      else if (source === 'registry') {
        packages = await scrapeRegistryPackages(validate)
      }
      else {
        console.error('Invalid source. Use "pantry" or "registry"')
        process.exit(1)
      }

      await updateConstsFile(packages, source)

      console.log('✅ Successfully updated consts.ts')
      console.log(`📊 Total packages: ${packages.length}`)

      // Write a summary file for reference
      const timestamp = new Date().toISOString()
      const summaryContent = `Generated from ${source} at ${timestamp}\nTotal packages: ${packages.length}\n\n${packages.join('\n')}`
      fs.writeFileSync(`${source}-packages-summary.txt`, summaryContent)
      console.log(`📄 Created ${source}-packages-summary.txt for reference`)

      process.exit(0)
    }
    catch (error) {
      console.error('Error generating consts file:', error)
      process.exit(1)
    }
  })

// Resolve dependencies command
cli
  .command('resolve-deps [file]', 'Resolve all dependencies (including transitive) from a dependency file')
  .option('-f, --file <path>', 'Path to dependency file (deps.yaml, dependencies.yaml, pkgx.yaml, etc.)')
  .option('-d, --dir <directory>', 'Directory to search for dependency files', { default: '.' })
  .option('--pantry-dir <dir>', 'Directory containing pantry files', { default: 'src/pantry' })
  .option('--packages-dir <dir>', 'Directory containing generated package files', { default: 'src/packages' })
  .option('--target-os <os>', 'Target OS for OS-specific dependencies (linux, darwin, windows)')
  .option('--include-os-deps', 'Include OS-specific dependencies in resolution')
  .option('--max-depth <depth>', 'Maximum recursion depth for dependency resolution', { default: 10 })
  .option('-v, --verbose', 'Enable verbose output')
  .option('-j, --json', 'Output results as JSON')
  .option('--install-command', 'Show install commands for resolved packages')
  .action(async (file: string | undefined, options) => {
    try {
      const {
        dir = '.',
        packagesDir = 'src/packages',
        targetOs,
        includeOsDeps = false,
        maxDepth = 10,
        verbose = false,
        json = false,
        installCommand = false,
      } = options

      let dependencyFile = file || options.file

      // If no file specified, try to find one in the directory
      if (!dependencyFile) {
        const foundFiles = findDependencyFiles(dir)
        if (foundFiles.length === 0) {
          console.error(`No dependency files found in ${dir}`)
          console.error('Supported filenames: deps.yaml, dependencies.yaml, pkgx.yaml (and .yml variants)')
          process.exit(1)
        }
        else if (foundFiles.length > 1) {
          console.error(`Multiple dependency files found in ${dir}:`)
          foundFiles.forEach(f => console.error(`  ${f}`))
          console.error('Please specify which file to use with --file or [file] argument')
          process.exit(1)
        }
        else {
          dependencyFile = foundFiles[0]
          if (!json) {
            console.log(`Found dependency file: ${dependencyFile}`)
          }
        }
      }

      // Validate file exists
      if (!fs.existsSync(dependencyFile)) {
        console.error(`Dependency file not found: ${dependencyFile}`)
        process.exit(1)
      }

      const resolverOptions: DependencyResolverOptions = {
        packagesDir,
        includeOsSpecific: includeOsDeps,
        targetOs: targetOs as 'linux' | 'darwin' | 'windows' | undefined,
        maxDepth: Number.parseInt(String(maxDepth), 10),
        verbose: verbose && !json, // Don't show verbose if JSON output requested
      }

      if (!json) {
        console.log('🔍 Resolving dependencies...')
      }

      const result = await resolveDependencyFile(dependencyFile, resolverOptions)

      if (json) {
        // Output as JSON for programmatic use
        const output = {
          success: true,
          file: dependencyFile,
          summary: {
            totalUnique: result.uniquePackages.length,
            conflicts: result.conflicts.length,
            osSpecific: {
              linux: result.osSpecificDeps.linux.length,
              darwin: result.osSpecificDeps.darwin.length,
              windows: result.osSpecificDeps.windows.length,
            },
          },
          packages: result.uniquePackages,
          dependencies: result.allDependencies,
          conflicts: result.conflicts,
          osSpecificDeps: result.osSpecificDeps,
          timestamp: new Date().toISOString(),
        }
        console.log(JSON.stringify(output, null, 2))
      }
      else {
        // Human-readable output
        console.log(`\n✅ Dependency resolution complete!`)
        console.log(`📦 Total unique packages: ${result.uniquePackages.length}`)

        if (result.conflicts.length > 0) {
          console.log(`⚠️  Version conflicts: ${result.conflicts.length}`)
          console.log('\nConflicts found:')
          result.conflicts.forEach((conflict) => {
            console.log(`  ${conflict.package}: ${conflict.versions.join(', ')}`)
          })
        }

        console.log('\n📋 All unique packages to install:')
        result.uniquePackages.forEach((pkg, index) => {
          const dep = result.allDependencies.find(d => d.name === pkg)
          const versionInfo = dep && dep.version && dep.version !== 'latest' ? ` (${dep.version})` : ''
          console.log(`  ${index + 1}. ${pkg}${versionInfo}`)
        })

        if (installCommand) {
          console.log('\n🚀 Install commands:')
          console.log('\nUsing pkgx:')
          const pkgxPackages = result.uniquePackages.map(pkg => `+${pkg}`).join(' ')
          console.log(`sh <(curl https://pkgx.sh) ${pkgxPackages} -- $SHELL -i`)

          console.log('\nOr install individually:')
          result.uniquePackages.forEach((pkg) => {
            console.log(`pkgx +${pkg}`)
          })
        }

        // Show OS-specific dependencies if any
        const totalOsSpecific = Object.values(result.osSpecificDeps).reduce((sum, deps) => sum + deps.length, 0)
        if (totalOsSpecific > 0) {
          console.log('\n🖥️  OS-specific dependencies:')
          Object.entries(result.osSpecificDeps).forEach(([os, deps]) => {
            if (deps.length > 0) {
              console.log(`  ${os}: ${deps.map(d => d.name).join(', ')}`)
            }
          })
        }
      }

      process.exit(0)
    }
    catch (error) {
      if (options.json) {
        const output = {
          success: false,
          error: String(error),
          timestamp: new Date().toISOString(),
        }
        console.log(JSON.stringify(output))
      }
      else {
        console.error('Error resolving dependencies:', error)
      }
      process.exit(1)
    }
  })

// Get PHP versions for CI/CD workflows
cli
  .command('get-php-versions', 'Get PHP versions suitable for CI/CD workflows')
  .option('--format <type>', 'Output format: json (default), yaml, or csv', { default: 'json' })
  .option('--branches <branches>', 'Comma-separated list of PHP branches to include (e.g., 8.4,8.3,8.2)')
  .option('--fallback <versions>', 'Comma-separated list of fallback versions if detection fails')
  .action(async (options) => {
    try {
      const { getPhpVersionsForWorkflow } = await import('../src/version-utils')

      const workflowOptions: any = {}

      if (options.branches) {
        workflowOptions.supportedBranches = options.branches.split(',').map((b: string) => b.trim())
      }

      if (options.fallback) {
        workflowOptions.fallbackVersions = options.fallback.split(',').map((v: string) => v.trim())
      }

      const versions = getPhpVersionsForWorkflow(workflowOptions)

      switch (options.format.toLowerCase()) {
        case 'yaml':
          console.log(`php_versions:\n${versions.map(v => `  - "${v}"`).join('\n')}`)
          break
        case 'csv':
          console.log(versions.join(','))
          break
        case 'json':
        default:
          console.log(JSON.stringify(versions))
          break
      }

      process.exit(0)
    }
    catch (error) {
      console.error('Error getting PHP versions:', error)
      process.exit(1)
    }
  })

// Generate Zig package definitions
cli
  .command('generate-zig', 'Generate Zig package definitions from TypeScript packages')
  .option('--packages-dir <dir>', 'Directory containing TypeScript package files', { default: 'src/packages' })
  .option('--output <file>', 'Output Zig file path', { default: 'packages.zig' })
  .option('--aliases', 'Also generate aliases file')
  .option('--aliases-output <file>', 'Output file for Zig aliases', { default: 'aliases.zig' })
  .action(async (options) => {
    try {
      const { generateZigDefinitions, generateZigAliases } = await import('../src/generate-zig')

      const {
        packagesDir = 'src/packages',
        output = 'packages.zig',
        aliases = false,
        aliasesOutput = 'aliases.zig',
      } = options

      console.log('🚀 Generating Zig package definitions...')

      // Generate main package definitions
      await generateZigDefinitions(packagesDir, output)

      // Generate aliases if requested
      if (aliases) {
        console.log('\n🚀 Generating Zig package aliases...')
        await generateZigAliases(packagesDir, aliasesOutput)
      }

      console.log('\n✅ Zig code generation complete!')
      process.exit(0)
    }
    catch (error) {
      console.error('Error generating Zig definitions:', error)
      process.exit(1)
    }
  })

// Display help if no command specified
cli.help()
cli.version(version)

// Parse command line arguments
const _parsed = cli.parse()

// If no command was provided or help was shown, exit cleanly
if (process.argv.length <= 2 || process.argv.includes('--help') || process.argv.includes('-h')) {
  process.exit(0)
}
