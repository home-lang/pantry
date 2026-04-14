import type { Dependency, DependencyResolutionResult, DependencyResolverOptions } from './dependency-resolver'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { deduplicateDependencies, parseDependencyFile, resolveDependencyFile, resolveTransitiveDependencies } from './dependency-resolver'

/**
 * Simplified package info for Pantry
 */
export interface PantryPackage {
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
 * Result returned by Pantry API
 */
export interface PantryInstallResult {
  /** All packages that need to be installed (deduplicated) */
  packages: PantryPackage[]
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
  /** Install command for pantry */
  pantryCommand: string
}

/**
 * Options for Pantry dependency resolution
 */
export interface PantryResolverOptions {
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
 * Main API function for Pantry to resolve dependencies from a file
 *
 * @param filePath Path to dependency file (deps.yaml, pkgx.yaml, etc.)
 * @param options Resolution options
 * @returns Promise with install information
 *
 * @example
 * ```typescript
 * import { resolveDependencies } from 'ts-pantry'
 *
 * const result = await resolveDependencies('./deps.yaml', {
 *   targetOs: 'darwin',
 *   includeOsSpecific: true
 * })
 *
 * console.log(`Installing ${result.totalCount} packages...`)
 * console.log(result.pantryCommand)
 *
 * // Install each package
 * for (const pkg of result.packages) {
 *   await pantry.install(pkg.name, pkg.version)
 * }
 * ```
 */
export async function resolveDependencies(
  filePath: string,
  options: PantryResolverOptions = {},
): Promise<PantryInstallResult> {
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

  // Convert to Pantry format
  const packages: PantryPackage[] = result.allDependencies.map(dep => ({
    name: dep.name,
    version: dep.version,
    constraint: dep.constraint,
    isOsSpecific: dep.isOsSpecific,
    os: dep.os as 'linux' | 'darwin' | 'windows' | undefined,
  }))

  // Generate install commands
  // Both pkgx and pantry auto-resolve transitive dependencies, so only install direct deps
  const directPackageNames = directDeps.map(dep => dep.name)
  const pkgxCommand = `pkgx install ${directPackageNames.join(' ')}`
  const pantryCommand = `pantry install ${directPackageNames.join(' ')}`

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
    pantryCommand,
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
  options: PantryResolverOptions = {},
): Promise<PantryInstallResult> {
  // Create a secure private temp directory so other processes can't tamper with the file
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-deps-'))
  const tempFile = path.join(tempDir, 'deps.yaml')

  try {
    fs.writeFileSync(tempFile, yamlContent, { encoding: 'utf-8', mode: 0o600 })
    return await resolveDependencies(tempFile, options)
  }
  finally {
    // Clean up temp dir (handles both file and dir cleanup atomically)
    try { fs.rmSync(tempDir, { recursive: true, force: true }) }
    catch { /* ignore */ }
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
  options: PantryResolverOptions = {},
): Promise<PantryPackage[]> {
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
 * @param format Command format ('pkgx' or 'pantry')
 * @returns Install command string
 *
 * @note Both pkgx and pantry auto-resolve transitive dependencies
 */
export function getInstallCommand(packages: string[], format: 'pkgx' | 'pantry' = 'pantry'): string {
  if (format === 'pkgx') {
    return `pkgx install ${packages.join(' ')}`
  }
  return `pantry install ${packages.join(' ')}`
}

/**
 * Information about a project dependency from the pantry directory
 */
export interface ProjectDependency {
  /** Package name (e.g., '@stacksjs/cli', 'better-dx') */
  name: string
  /** Package version from its package.json */
  version: string
  /** Whether this is a workspace package */
  isWorkspace: boolean
  /** Whether this is a scoped package */
  isScoped: boolean
}

/**
 * Summary of a project's pantry dependencies
 */
export interface ProjectDependencies {
  /** All discovered dependencies */
  packages: ProjectDependency[]
  /** Number of third-party (non-workspace) packages */
  thirdPartyCount: number
  /** Number of workspace packages */
  workspaceCount: number
  /** Total package count */
  totalCount: number
}

/**
 * Read project dependencies from the pantry directory and pantry.lock.
 * This is a synchronous API suitable for use in STX server-side scripts.
 *
 * @param projectRoot Path to the project root (containing pantry/ and pantry.lock)
 * @returns Project dependency information
 *
 * @example
 * ```typescript
 * const deps = readProjectDependencies('/path/to/project')
 * console.log(`${deps.thirdPartyCount} third-party packages`)
 * ```
 */
export function readProjectDependencies(projectRoot: string): ProjectDependencies {
  const packages: ProjectDependency[] = []

  // Read from the pantry directory (actual installed packages)
  const pantryDir = path.join(projectRoot, 'pantry')
  try {
    const entries = fs.readdirSync(pantryDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      // Handle scoped packages (@scope/name)
      if (entry.name.startsWith('@')) {
        const scopeDir = path.join(pantryDir, entry.name)
        try {
          const scopedEntries = fs.readdirSync(scopeDir, { withFileTypes: true })
          for (const scopedEntry of scopedEntries) {
            if (!scopedEntry.isDirectory()) continue
            const pkgName = `${entry.name}/${scopedEntry.name}`
            const pkgJsonPath = path.join(scopeDir, scopedEntry.name, 'package.json')
            const version = readPackageVersion(pkgJsonPath)
            packages.push({
              name: pkgName,
              version,
              isWorkspace: pkgName.startsWith('@stacksjs/'),
              isScoped: true,
            })
          }
        }
        catch {
          // Skip unreadable scope directories
        }
      }
      else {
        const pkgJsonPath = path.join(pantryDir, entry.name, 'package.json')
        const version = readPackageVersion(pkgJsonPath)
        packages.push({
          name: entry.name,
          version,
          isWorkspace: false,
          isScoped: false,
        })
      }
    }
  }
  catch {
    // pantry directory may not exist
  }

  packages.sort((a, b) => a.name.localeCompare(b.name))

  const workspaceCount = packages.filter(p => p.isWorkspace).length
  const thirdPartyCount = packages.length - workspaceCount

  return {
    packages,
    thirdPartyCount,
    workspaceCount,
    totalCount: packages.length,
  }
}

function readPackageVersion(pkgJsonPath: string): string {
  try {
    const content = fs.readFileSync(pkgJsonPath, 'utf-8')
    const pkg = JSON.parse(content)
    return pkg.version || '0.0.0'
  }
  catch {
    return '0.0.0'
  }
}

// Export types for external use
export type { Dependency, DependencyResolutionResult, DependencyResolverOptions }
