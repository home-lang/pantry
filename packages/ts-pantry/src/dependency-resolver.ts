import type { PkgxPackage } from './types'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Represents a dependency with version constraints
 */
export interface Dependency {
  name: string
  version: string
  constraint: string
  isOsSpecific: boolean
  os?: string
}

/**
 * Services configuration from deps.yaml
 */
export interface ServicesConfig {
  enabled: boolean
  autoStart: string[]
}

/**
 * Full parsed deps.yaml configuration including dependencies and services
 */
export interface DepsYamlConfig {
  dependencies: Dependency[]
  services?: ServicesConfig
}

/**
 * Result of dependency resolution
 */
export interface DependencyResolutionResult {
  allDependencies: Dependency[]
  uniquePackages: string[]
  conflicts: Array<{
    package: string
    versions: string[]
  }>
  osSpecificDeps: Record<string, Dependency[]>
  services?: ServicesConfig
}

/**
 * Options for dependency resolution
 */
export interface DependencyResolverOptions {
  packagesDir?: string
  includeOsSpecific?: boolean
  targetOs?: 'linux' | 'darwin' | 'windows'
  maxDepth?: number
  verbose?: boolean
}

/**
 * Parse a dependency file (deps.yaml, dependencies.yaml, pkgx.yaml, etc.)
 */
export function parseDependencyFile(filePath: string): Dependency[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dependency file not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const dependencies: Dependency[] = []

  // Parse YAML dependencies section
  const lines = content.split('\n')
  let inDepsSection = false
  let inGlobalSection = false
  let currentIndent = 0

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    // Detect dependencies section
    if (line.match(/^(dependencies|deps):\s*$/)) {
      inDepsSection = true
      inGlobalSection = false
      currentIndent = line.search(/\S/)
      continue
    }

    // Detect global dependencies (for cases where deps are at root level)
    if (line.match(/^global:\s*true\s*$/) || (line.match(/^global:\s*$/) && !inDepsSection)) {
      inGlobalSection = true
      continue
    }

    // If we encounter another top-level section, exit dependencies
    if (line.match(/^\w+:/) && !line.includes('  ') && inDepsSection && currentIndent === 0) {
      inDepsSection = false
      continue
    }

    if (inDepsSection || inGlobalSection) {
      // Skip the "dependencies:" line if it appears under global
      if (line.match(/^\s+(dependencies|deps):\s*$/)) {
        continue
      }

      // Parse dependency lines like "  package.name: ^1.2.3"
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const beforeColon = line.substring(0, colonIndex).trim()
        const afterColon = line.substring(colonIndex + 1).trim()

        if (beforeColon && afterColon) {
          const packageName = beforeColon
          const versionConstraint = afterColon.replace(/^['"]|['"]$/g, '')

          // Skip non-package entries
          if (packageName === 'global' || packageName === 'dependencies' || packageName === 'deps') {
            continue
          }

          // Parse version constraint
          let version = versionConstraint
          let constraint = versionConstraint

          // Handle version ranges and constraints
          if (versionConstraint.startsWith('^')) {
            version = versionConstraint.substring(1)
            constraint = versionConstraint
          }
          else if (versionConstraint.startsWith('~')) {
            version = versionConstraint.substring(1)
            constraint = versionConstraint
          }
          else if (versionConstraint.startsWith('>=') || versionConstraint.startsWith('<=') || versionConstraint.startsWith('>') || versionConstraint.startsWith('<')) {
            const operatorMatch = /^([><=]+)/.exec(versionConstraint)
            if (operatorMatch) {
              const operator = operatorMatch[1]
              version = versionConstraint.substring(operator.length).trim()
              constraint = versionConstraint
            }
          }
          else if (versionConstraint === '*' || versionConstraint === 'latest') {
            version = 'latest'
            constraint = '*'
          }
          else {
            // Assume it's a specific version
            version = versionConstraint
            constraint = `@${versionConstraint}`
          }

          dependencies.push({
            name: packageName,
            version,
            constraint,
            isOsSpecific: false,
          })
        }
      }
    }
  }

  return dependencies
}

/**
 * Parse a deps.yaml file and return both dependencies and services configuration.
 * Uses Bun.YAML for robust YAML parsing.
 */
export function parseDepsYamlConfig(filePath: string): DepsYamlConfig {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dependency file not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const dependencies = parseDependencyFile(filePath)

  // Use Bun's built-in YAML parser for the services section
  let services: ServicesConfig | undefined

  try {
    // eslint-disable-next-line ts/no-unsafe-assignment
    const parsed: any = typeof Bun !== 'undefined' && Bun.YAML
      ? Bun.YAML.parse(content)
      : parseYamlFallback(content)

    if (parsed?.services) {
      const autoStart: string[] = Array.isArray(parsed.services.autoStart)
        ? parsed.services.autoStart.map((s: any) => String(s))
        : []

      if (autoStart.length > 0) {
        services = {
          enabled: parsed.services.enabled === true,
          autoStart,
        }
      }
    }
  }
  catch {
    // If YAML parsing fails, services will be undefined
  }

  return { dependencies, services }
}

/**
 * Minimal YAML parser fallback for services section when Bun.YAML is unavailable
 */
function parseYamlFallback(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = content.split('\n')
  let inServicesSection = false
  let inAutoStartSection = false
  const autoStartList: string[] = []
  let servicesEnabled = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) continue

    if (line.match(/^services:\s*$/)) {
      inServicesSection = true
      inAutoStartSection = false
      continue
    }

    if (inServicesSection && !line.startsWith(' ') && !line.startsWith('\t') && !trimmedLine.startsWith('-')) {
      if (trimmedLine !== 'services:') {
        inServicesSection = false
        inAutoStartSection = false
        continue
      }
    }

    if (inServicesSection) {
      if (trimmedLine.startsWith('enabled:')) {
        servicesEnabled = trimmedLine.includes('true')
        continue
      }

      if (trimmedLine.match(/^autoStart:\s*$/)) {
        inAutoStartSection = true
        continue
      }

      if (inAutoStartSection && trimmedLine.startsWith('- ')) {
        const serviceName = trimmedLine.slice(2).trim()
        if (serviceName) autoStartList.push(serviceName)
      }
    }
  }

  if (autoStartList.length > 0) {
    result.services = {
      enabled: servicesEnabled,
      autoStart: autoStartList,
    }
  }

  return result
}

/**
 * Load available versions for a package from generated package files
 */
export async function getAvailableVersionsForPackage(packageName: string, packagesDir = 'src/packages'): Promise<string[]> {
  try {
    // Convert domain to the expected file path structure
    let filePath: string

    if (packageName.includes('/')) {
      // Handle nested packages like x.org/x11 -> x.org/x11.ts
      filePath = path.join(packagesDir, `${packageName}.ts`)
    }
    else {
      // Handle root domains
      const fileName = `${packageName.replace(/\./g, '')}.ts`
      filePath = path.join(packagesDir, fileName)
    }

    if (!fs.existsSync(filePath)) {
      return []
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    // Extract versions array from the TypeScript file
    const versionsStartIndex = content.indexOf('versions:')
    if (versionsStartIndex === -1) {
      return []
    }

    const fromVersions = content.substring(versionsStartIndex)
    const arrayStartIndex = fromVersions.indexOf('[')
    const arrayEndIndex = fromVersions.indexOf('] as const')

    if (arrayStartIndex === -1 || arrayEndIndex === -1) {
      return []
    }

    const versionsText = fromVersions.substring(arrayStartIndex + 1, arrayEndIndex)
    const versionMatches = versionsText.match(/'([^']+)'/g)

    if (!versionMatches) {
      return []
    }

    return versionMatches.map(v => v.replace(/'/g, ''))
  }
  catch {
    return []
  }
}

/**
 * Get available versions for a package from generated package data
 */
async function getAvailableVersionsFromPackage(packageName: string): Promise<string[]> {
  try {
    // Import the package index to get access to the generated packages
    const { packages } = await import('./packages/index.js').catch(() => import('./index.js'))

    // Convert domain to package key
    const packageKey = packageName.replace(/[^a-z0-9]/gi, '').toLowerCase()

    // Try to find the package in the pantry
    let pkg = (packages as any)[packageKey]

    // If direct key lookup fails, try searching by domain
    if (!pkg) {
      const allPackages = Object.values(packages as any)
      pkg = allPackages.find((p: any) => p.domain === packageName)
    }

    if (pkg && pkg.versions && Array.isArray(pkg.versions)) {
      return pkg.versions
    }

    return []
  }
  catch {
    return []
  }
}

/**
 * Resolve a version constraint to the best available version using proper semver
 */
export async function resolveVersionConstraint(
  packageName: string,
  constraint: string,
): Promise<string> {
  const availableVersions = await getAvailableVersionsFromPackage(packageName)

  if (availableVersions.length === 0) {
    // Fallback: extract version from constraint, handling comments
    const cleanConstraint = constraint.split('#')[0].trim()
    return cleanConstraint.replace(/^[@^~>=<]+/, '') || 'latest'
  }

  // Clean the constraint by removing comments and whitespace
  const cleanConstraint = constraint.split('#')[0].trim()

  // Handle different constraint types
  if (cleanConstraint === '*' || cleanConstraint === 'latest') {
    return availableVersions[0] // First version is latest
  }

  if (cleanConstraint.startsWith('@')) {
    // Exact version
    const exactVersion = cleanConstraint.slice(1)
    return availableVersions.includes(exactVersion) ? exactVersion : availableVersions[0]
  }

  // For semver constraints, find the best matching version
  const bestMatch = findBestSemverMatch(availableVersions, cleanConstraint)
  return bestMatch || availableVersions[0]
}

/**
 * Find the best semver match for a constraint using proper semver logic
 */
function findBestSemverMatch(availableVersions: string[], constraint: string): string | null {
  // Handle different constraint types with proper semver logic
  if (constraint.startsWith('^')) {
    // Caret: ^1.2.3 allows 1.2.3 <= version < 2.0.0 (compatible within major version)
    const baseVersion = constraint.slice(1)
    const [baseMajor] = parseVersionParts(baseVersion)

    const compatibleVersions = availableVersions.filter((version) => {
      const [vMajor] = parseVersionParts(version)
      return vMajor === baseMajor && compareVersions(version, baseVersion) >= 0
    })

    return compatibleVersions[0] || null
  }

  if (constraint.startsWith('~')) {
    // Tilde: ~1.2.3 allows 1.2.3 <= version < 1.3.0 (compatible within minor version)
    const baseVersion = constraint.slice(1)
    const [baseMajor, baseMinor] = parseVersionParts(baseVersion)

    const compatibleVersions = availableVersions.filter((version) => {
      const [vMajor, vMinor] = parseVersionParts(version)
      return vMajor === baseMajor && vMinor === baseMinor && compareVersions(version, baseVersion) >= 0
    })

    return compatibleVersions[0] || null
  }

  if (constraint.startsWith('>=')) {
    // Greater than or equal
    const minVersion = constraint.slice(2).trim()
    const validVersions = availableVersions.filter(v => compareVersions(v, minVersion) >= 0)
    return validVersions[0] || null
  }

  if (constraint.startsWith('>')) {
    // Greater than
    const minVersion = constraint.slice(1).trim()
    const validVersions = availableVersions.filter(v => compareVersions(v, minVersion) > 0)
    return validVersions[0] || null
  }

  if (constraint.startsWith('<=')) {
    // Less than or equal
    const maxVersion = constraint.slice(2).trim()
    const validVersions = availableVersions.filter(v => compareVersions(v, maxVersion) <= 0)
    return validVersions[0] || null
  }

  if (constraint.startsWith('<')) {
    // Less than
    const maxVersion = constraint.slice(1).trim()
    const validVersions = availableVersions.filter(v => compareVersions(v, maxVersion) < 0)
    return validVersions[0] || null
  }

  if (constraint.startsWith('=')) {
    // Exact match
    const exactVersion = constraint.slice(1).trim()
    return availableVersions.includes(exactVersion) ? exactVersion : null
  }

  // If no operator, treat as exact match
  return availableVersions.includes(constraint) ? constraint : null
}

/**
 * Parse a version string into major, minor, patch components
 */
function parseVersionParts(version: string): [number, number, number] {
  const parts = version.split('.').map((p) => {
    // Extract numeric part only (remove any non-numeric suffixes)
    const numericPart = p.match(/^\d+/)
    return numericPart ? Number.parseInt(numericPart[0], 10) : 0
  })
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

/**
 * Parse version constraint and compare versions for deduplication
 */
export function compareVersions(version1: string, version2: string): number {
  // Handle special cases
  if (version1 === 'latest' && version2 !== 'latest')
    return 1
  if (version2 === 'latest' && version1 !== 'latest')
    return -1
  if (version1 === 'latest' && version2 === 'latest')
    return 0

  // Clean versions by removing comments and non-numeric suffixes
  const cleanV1 = version1.split('#')[0].trim()
  const cleanV2 = version2.split('#')[0].trim()

  const [v1Major, v1Minor, v1Patch] = parseVersionParts(cleanV1)
  const [v2Major, v2Minor, v2Patch] = parseVersionParts(cleanV2)

  // Compare major version
  if (v1Major > v2Major)
    return 1
  if (v1Major < v2Major)
    return -1

  // Compare minor version
  if (v1Minor > v2Minor)
    return 1
  if (v1Minor < v2Minor)
    return -1

  // Compare patch version
  if (v1Patch > v2Patch)
    return 1
  if (v1Patch < v2Patch)
    return -1

  return 0
}

/**
 * Read package info from generated package data
 */
async function readPackageInfo(packageName: string): Promise<Partial<PkgxPackage> | null> {
  try {
    // Import the package index to get access to the generated packages
    const { packages } = await import('./packages/index.js').catch(() => import('./index.js'))

    // Convert domain to package key (e.g., bun.sh -> bunsh, github.com/user/repo -> githubcomuserrepo)
    const packageKey = packageName.replace(/[^a-z0-9]/gi, '').toLowerCase()

    // Try to find the package in the pantry
    const pkg = (packages as any)[packageKey]

    if (pkg) {
      return {
        dependencies: pkg.dependencies || [],
        companions: pkg.companions || [],
      }
    }

    // If direct key lookup fails, try searching by domain
    const allPackages = Object.values(packages as any)
    const foundPkg = allPackages.find((p: any) => p.domain === packageName)

    if (foundPkg) {
      return {
        dependencies: (foundPkg as any).dependencies || [],
        companions: (foundPkg as any).companions || [],
      }
    }

    return null
  }
  catch (error) {
    console.warn(`Failed to load package data for ${packageName}: ${error}`)
    return null
  }
}

/**
 * Resolve transitive dependencies for a package
 */
export async function resolveTransitiveDependencies(
  packageName: string,
  options: DependencyResolverOptions = {},
  visited: Set<string> = new Set<string>(),
  depth = 0,
): Promise<Dependency[]> {
  const {
    maxDepth = 10,
    verbose = false,
    targetOs,
    includeOsSpecific = true,
  } = options

  // Prevent infinite recursion
  if (depth > maxDepth || visited.has(packageName)) {
    return []
  }

  visited.add(packageName)

  if (verbose) {
    console.log(`${'  '.repeat(depth)}Resolving dependencies for: ${packageName}`)
  }

  const allDependencies: Dependency[] = []

  try {
    // Get package info from generated packages
    const packageInfo = await readPackageInfo(packageName)

    if (packageInfo && packageInfo.dependencies) {
      for (const dep of packageInfo.dependencies) {
        // Parse dependency string (e.g., "openssl.org@1.1", "linux:gnu.org/gcc@*")
        const osMatch = dep.match(/^(linux|darwin|windows):(.+)$/)
        const isOsSpecific = !!osMatch
        const depName = osMatch ? osMatch[2] : dep
        const osType = osMatch ? osMatch[1] : undefined

        // Skip OS-specific deps if not including them or wrong OS
        if (isOsSpecific && (!includeOsSpecific || (targetOs && osType !== targetOs))) {
          continue
        }

        // Parse package name and version constraint
        let packageName = depName
        let version = 'latest'
        let constraint = '*'

        const versionMatch = depName.match(/^([^@^~>=<]+)([@^~>=<].+)?$/)
        if (versionMatch) {
          packageName = versionMatch[1]
          if (versionMatch[2]) {
            const versionPart = versionMatch[2]
            if (versionPart.startsWith('@')) {
              version = versionPart.substring(1)
              constraint = versionPart
            }
            else {
              constraint = versionPart
              version = versionPart.replace(/^\D*/, '')
            }
          }
        }

        const dependency: Dependency = {
          name: packageName,
          version,
          constraint,
          isOsSpecific,
          os: osType,
        }

        allDependencies.push(dependency)

        // Recursively resolve transitive dependencies
        const transitiveDeps = await resolveTransitiveDependencies(
          packageName,
          options,
          visited,
          depth + 1,
        )
        allDependencies.push(...transitiveDeps)
      }
    }

    // Also check companions (runtime dependencies)
    if (packageInfo && packageInfo.companions) {
      for (const comp of packageInfo.companions) {
        const osMatch = comp.match(/^(linux|darwin|windows):(.+)$/)
        const isOsSpecific = !!osMatch
        const compName = osMatch ? osMatch[2] : comp
        const osType = osMatch ? osMatch[1] : undefined

        if (isOsSpecific && (!includeOsSpecific || (targetOs && osType !== targetOs))) {
          continue
        }

        let packageName = compName
        let version = 'latest'
        let constraint = '*'

        const versionMatch = compName.match(/^([^@^~>=<]+)([@^~>=<].+)?$/)
        if (versionMatch) {
          packageName = versionMatch[1]
          if (versionMatch[2]) {
            const versionPart = versionMatch[2]
            if (versionPart.startsWith('@')) {
              version = versionPart.substring(1)
              constraint = versionPart
            }
            else {
              constraint = versionPart
              version = versionPart.replace(/^\D*/, '')
            }
          }
        }

        const companion: Dependency = {
          name: packageName,
          version,
          constraint,
          isOsSpecific,
          os: osType,
        }

        allDependencies.push(companion)

        // Recursively resolve transitive dependencies for companions too
        const transitiveDeps = await resolveTransitiveDependencies(
          packageName,
          options,
          visited,
          depth + 1,
        )
        allDependencies.push(...transitiveDeps)
      }
    }
  }
  catch (error) {
    if (verbose) {
      console.warn(`${'  '.repeat(depth)}Warning: Could not resolve dependencies for ${packageName}: ${error}`)
    }
  }

  return allDependencies
}

/**
 * Deduplicate dependencies and resolve version conflicts
 */
export async function deduplicateDependencies(
  dependencies: Dependency[],
  _options: DependencyResolverOptions = {},
): Promise<DependencyResolutionResult> {
  const packageMap = new Map<string, Dependency[]>()
  const conflicts: Array<{ package: string, versions: string[] }> = []
  const osSpecificDeps: Record<string, Dependency[]> = {
    linux: [],
    darwin: [],
    windows: [],
  }

  // Group dependencies by package name
  for (const dep of dependencies) {
    if (!packageMap.has(dep.name)) {
      packageMap.set(dep.name, [])
    }
    packageMap.get(dep.name)!.push(dep)

    // Track OS-specific dependencies
    if (dep.isOsSpecific && dep.os) {
      osSpecificDeps[dep.os].push(dep)
    }
  }

  const uniqueDependencies: Dependency[] = []
  const uniquePackages: string[] = []

  // Resolve conflicts for each package
  for (const [packageName, deps] of packageMap) {
    if (deps.length === 1) {
      // No conflict - but still resolve the version constraint to actual version
      const resolvedVersion = await resolveVersionConstraint(packageName, deps[0].constraint)
      const resolvedDep = { ...deps[0], version: resolvedVersion }
      uniqueDependencies.push(resolvedDep)
      uniquePackages.push(packageName)
    }
    else {
      // Multiple versions found - resolve conflict
      const originalVersions = deps.map(d => d.version)
      const uniqueVersions = [...new Set(originalVersions)]

      if (uniqueVersions.length > 1) {
        conflicts.push({
          package: packageName,
          versions: uniqueVersions,
        })
      }

      // Resolve each constraint to actual available versions
      const resolvedDeps = await Promise.all(
        deps.map(async dep => ({
          ...dep,
          resolvedVersion: await resolveVersionConstraint(packageName, dep.constraint),
        })),
      )

      // Choose the best resolved version
      let chosen = resolvedDeps[0]
      for (const dep of resolvedDeps.slice(1)) {
        // Prefer specific version constraints over wildcard
        if (chosen.constraint === '*' && dep.constraint !== '*') {
          chosen = dep
        }
        else if (chosen.constraint !== '*' && dep.constraint === '*') {
          // Keep chosen
        }
        else if (compareVersions(dep.resolvedVersion, chosen.resolvedVersion) > 0) {
          chosen = dep
        }
      }

      // Use the resolved version as the final version
      const finalDep = {
        ...chosen,
        version: chosen.resolvedVersion,
      }
      delete (finalDep as any).resolvedVersion // Remove temporary field

      uniqueDependencies.push(finalDep)
      uniquePackages.push(packageName)
    }
  }

  return {
    allDependencies: uniqueDependencies,
    uniquePackages,
    conflicts,
    osSpecificDeps,
  }
}

/**
 * Main function to resolve all dependencies from a dependency file
 */
export async function resolveDependencyFile(
  filePath: string,
  options: DependencyResolverOptions = {},
): Promise<DependencyResolutionResult> {
  const { verbose = false } = options

  if (verbose) {
    console.log(`Parsing dependency file: ${filePath}`)
  }

  // Parse the dependency file
  const directDependencies = parseDependencyFile(filePath)

  if (verbose) {
    console.log(`Found ${directDependencies.length} direct dependencies`)
  }

  // Resolve transitive dependencies for each direct dependency
  const allDependencies: Dependency[] = [...directDependencies]

  for (const dep of directDependencies) {
    if (verbose) {
      console.log(`Resolving transitive dependencies for: ${dep.name}`)
    }

    const transitive = await resolveTransitiveDependencies(dep.name, options)
    allDependencies.push(...transitive)
  }

  if (verbose) {
    console.log(`Total dependencies found (before deduplication): ${allDependencies.length}`)
  }

  // Deduplicate and resolve conflicts
  const result = await deduplicateDependencies(allDependencies, options)

  if (verbose) {
    console.log(`Unique packages after deduplication: ${result.uniquePackages.length}`)
    if (result.conflicts.length > 0) {
      console.log(`Version conflicts found: ${result.conflicts.length}`)
    }
  }

  // Also parse services config if it's a YAML deps file
  const ext = path.extname(filePath)
  if (ext === '.yaml' || ext === '.yml') {
    const config = parseDepsYamlConfig(filePath)
    if (config.services) {
      result.services = config.services
    }
  }

  return result
}

/**
 * Find dependency files in a directory
 */
export function findDependencyFiles(directory: string): string[] {
  const possibleNames = [
    'deps.yaml',
    'deps.yml',
    'dependencies.yaml',
    'dependencies.yml',
    'pkgx.yaml',
    'pkgx.yml',
    '.deps.yaml',
    '.deps.yml',
  ]

  const foundFiles: string[] = []

  for (const name of possibleNames) {
    const filePath = path.join(directory, name)
    if (fs.existsSync(filePath)) {
      foundFiles.push(filePath)
    }
  }

  return foundFiles
}
