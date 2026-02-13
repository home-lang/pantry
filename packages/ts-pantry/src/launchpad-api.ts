import type { Dependency, DependencyResolutionResult, DependencyResolverOptions } from './dependency-resolver'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { deduplicateDependencies, parseDependencyFile, resolveDependencyFile, resolveTransitiveDependencies } from './dependency-resolver'

/**
 * Simplified package info for Launchpad
 */
export interface LaunchpadPackage {
  /** Package domain name (e.g., 'bun.sh', 'gnu.org/grep') */
  name: string
  /** Resolved version (e.g., '1.2.19', '3.12.0') */
  version: string
  /** Original version constraint from deps file (e.g., '^1.2.16', '>= 3.10') */
  constraint: string
  /** Whether this is an OS-specific dependency */
  isOsSpecific: boolean
  /** Target OS if OS-specific */
  os?: 'linux' | 'darwin' | 'windows'
}

/**
 * Result returned by Launchpad API
 */
export interface LaunchpadInstallResult {
  /** All packages that need to be installed (deduplicated) */
  packages: LaunchpadPackage[]
  /** Number of direct dependencies from the file */
  directCount: number
  /** Total number of packages including transitive deps */
  totalCount: number
  /** Version conflicts that were resolved */
  conflicts: Array<{
    package: string
    versions: string[]
    resolved: string
  }>
  /** Install command for pkgx */
  pkgxCommand: string
  /** Install command for launchpad */
  launchpadCommand: string
}

/**
 * Options for Launchpad dependency resolution
 */
export interface LaunchpadResolverOptions {
  /** Target operating system */
  targetOs?: 'linux' | 'darwin' | 'windows'
  /** Include OS-specific dependencies */
  includeOsSpecific?: boolean
  /** Maximum recursion depth for transitive deps */
  maxDepth?: number
  /** Show verbose output */
  verbose?: boolean
}

/**
 * Main API function for Launchpad to resolve dependencies from a file
 *
 * @param filePath Path to dependency file (deps.yaml, pkgx.yaml, etc.)
 * @param options Resolution options
 * @returns Promise with install information
 *
 * @example
 * ```typescript
 * import { resolveDependencies } from 'ts-pkgx/launchpad'
 *
 * const result = await resolveDependencies('./deps.yaml', {
 *   targetOs: 'darwin',
 *   includeOsSpecific: true
 * })
 *
 * console.log(`Installing ${result.totalCount} packages...`)
 * console.log(result.launchpadCommand)
 *
 * // Install each package
 * for (const pkg of result.packages) {
 *   await launchpad.install(pkg.name, pkg.version)
 * }
 * ```
 */
export async function resolveDependencies(
  filePath: string,
  options: LaunchpadResolverOptions = {},
): Promise<LaunchpadInstallResult> {
  const {
    targetOs = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'windows' : 'linux',
    includeOsSpecific = true,
    maxDepth = 10,
    verbose = false,
  } = options

  // Resolve all dependencies
  const result: DependencyResolutionResult = await resolveDependencyFile(filePath, {
    targetOs,
    includeOsSpecific,
    maxDepth,
    verbose,
  })

  // Count direct dependencies
  const directDeps = parseDependencyFile(filePath)

  // Convert to Launchpad format
  const packages: LaunchpadPackage[] = result.allDependencies.map(dep => ({
    name: dep.name,
    version: dep.version,
    constraint: dep.constraint,
    isOsSpecific: dep.isOsSpecific,
    os: dep.os as 'linux' | 'darwin' | 'windows' | undefined,
  }))

  // Generate install commands
  // Both pkgx and launchpad auto-resolve transitive dependencies, so only install direct deps
  const directPackageNames = directDeps.map(dep => dep.name)
  const pkgxCommand = `pkgx install ${directPackageNames.join(' ')}`
  const launchpadCommand = `launchpad install ${directPackageNames.join(' ')}`

  // Format conflicts with resolution info
  const conflicts = result.conflicts.map((conflict) => {
    const resolvedPkg = packages.find(p => p.name === conflict.package)
    return {
      package: conflict.package,
      versions: conflict.versions,
      resolved: resolvedPkg?.version || 'latest',
    }
  })

  return {
    packages,
    directCount: directDeps.length,
    totalCount: packages.length,
    conflicts,
    pkgxCommand,
    launchpadCommand,
  }
}

/**
 * Resolve dependencies from a YAML string directly
 *
 * @param yamlContent YAML content as string
 * @param options Resolution options
 * @returns Promise with install information
 *
 * @example
 * ```typescript
 * const yamlContent = `
 * global: true
 * dependencies:
 *   bun.sh: ^1.2.16
 *   gnu.org/grep: ^3.12.0
 * `
 *
 * const result = await resolveDependenciesFromYaml(yamlContent)
 * console.log(result.packages) // Array of resolved packages
 * ```
 */
export async function resolveDependenciesFromYaml(
  yamlContent: string,
  options: LaunchpadResolverOptions = {},
): Promise<LaunchpadInstallResult> {
  // Create a temporary file
  const tempFile = path.join(process.cwd(), `.temp-deps-${Date.now()}.yaml`)

  try {
    fs.writeFileSync(tempFile, yamlContent, 'utf-8')
    return await resolveDependencies(tempFile, options)
  }
  finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
    }
  }
}

/**
 * Resolve transitive dependencies for a single package
 *
 * @param packageName Package domain name (e.g., 'bun.sh', 'gnu.org/grep')
 * @param options Resolution options
 * @returns Promise with all transitive dependencies
 *
 * @example
 * ```typescript
 * const deps = await resolvePackageDependencies('gnu.org/grep')
 * console.log(deps) // ['pcre.org/v2@10.44.0', 'zlib.net@1.3.1', ...]
 * ```
 */
export async function resolvePackageDependencies(
  packageName: string,
  options: LaunchpadResolverOptions = {},
): Promise<LaunchpadPackage[]> {
  const {
    targetOs = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'windows' : 'linux',
    includeOsSpecific = true,
    maxDepth = 10,
  } = options

  const allDeps = await resolveTransitiveDependencies(packageName, {
    targetOs,
    includeOsSpecific,
    maxDepth,
  })

  // Add the main package as a direct dependency
  allDeps.unshift({
    name: packageName,
    version: 'latest',
    constraint: '*',
    isOsSpecific: false,
  })

  const result = await deduplicateDependencies(allDeps, {
    targetOs,
    includeOsSpecific,
    maxDepth,
  })

  return result.allDependencies.map(dep => ({
    name: dep.name,
    version: dep.version,
    constraint: dep.constraint,
    isOsSpecific: dep.isOsSpecific,
    os: dep.os as 'linux' | 'darwin' | 'windows' | undefined,
  }))
}

/**
 * Get install command for a list of packages
 *
 * @param packages Array of package names (should be direct deps only)
 * @param format Command format ('pkgx' or 'launchpad')
 * @returns Install command string
 *
 * @note Both pkgx and launchpad auto-resolve transitive dependencies
 */
export function getInstallCommand(packages: string[], format: 'pkgx' | 'launchpad' = 'launchpad'): string {
  if (format === 'pkgx') {
    return `pkgx install ${packages.join(' ')}`
  }
  return `launchpad install ${packages.join(' ')}`
}

// Export types for external use
export type { Dependency, DependencyResolutionResult, DependencyResolverOptions }
