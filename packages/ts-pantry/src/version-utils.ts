/**
 * Version resolution utilities for ts-pantry packages
 */

import type { PackageAlias, PackageDomain, PackageInfo, PackageName, VersionSpec } from './package-types'
import { aliases } from './packages/aliases'
import { programsForPlatform } from './programs'

// Create a dynamic packages loader function instead of importing the static packages object
async function loadPackages(): Promise<Record<string, any>> {
  try {
    const { packages } = await import('./packages')
    return packages as Record<string, any>
  }
  catch {
    // Return empty object if packages aren't generated yet
    return {}
  }
}

/**
 * Get the latest version of a package (versions[0] is always the latest)
 */
export async function getLatestVersion(packageName: PackageName): Promise<string | null> {
  const domain = resolvePackageDomain(packageName)
  if (!domain)
    return null

  const packages = await loadPackages()
  const pkg = packages[domain]
  if (!pkg || !pkg.versions || pkg.versions.length === 0)
    return null

  return pkg.versions[0] // versions[0] is always the latest
}

/**
 * Get all available versions for a package
 */
export async function getAvailableVersions(packageName: PackageName): Promise<string[]> {
  const domain = resolvePackageDomain(packageName)
  if (!domain)
    return []

  const packages = await loadPackages()
  const pkg = packages[domain]
  if (!pkg || !pkg.versions)
    return []

  return [...pkg.versions] // Return a copy
}

/**
 * Get PHP versions suitable for CI/CD workflows
 * Returns the latest versions from each supported major.minor branch
 */
export function getPhpVersionsForWorkflow(options: {
  supportedBranches?: string[]
  fallbackVersions?: string[]
} = {}): string[] {
  const defaultFallback = ['8.4.11', '8.3.14', '8.2.26', '8.1.30']
  const fallbackVersions = options.fallbackVersions || defaultFallback

  try {
    // Direct access to pantry since this is for build workflows
    // eslint-disable-next-line ts/no-require-imports
    const { pantry } = require('./packages')
    const php = pantry.phpnet || pantry.php

    if (!php || !php.versions || php.versions.length === 0) {
      return fallbackVersions
    }

    const versions = [...php.versions]

    // Determine supported branches dynamically or use provided ones
    const supportedBranches = options.supportedBranches || detectSupportedPhpBranches(versions)

    // Get latest versions from each major.minor branch
    const latestVersions = new Map<string, string>()

    for (const version of versions) {
      const [major, minor] = version.split('.')
      if (!major || !minor)
        continue

      const key = `${major}.${minor}`

      // Only include if it's in our supported branches
      if (supportedBranches.includes(key) && !latestVersions.has(key)) {
        latestVersions.set(key, version)
      }
    }

    // Get versions in order of supported branches
    const workflowVersions = supportedBranches
      .map(branch => latestVersions.get(branch))
      .filter(Boolean) as string[]

    return workflowVersions.length > 0 ? workflowVersions : fallbackVersions
  }
  catch {
    // Fallback if anything fails
    return fallbackVersions
  }
}

/**
 * Dynamically detect which PHP branches are currently supported
 * Based on available versions in ts-pantry
 */
function detectSupportedPhpBranches(versions: string[]): string[] {
  const branchCounts = new Map<string, number>()

  // Count versions per branch
  for (const version of versions) {
    const [major, minor] = version.split('.')
    if (!major || !minor)
      continue

    const branch = `${major}.${minor}`
    branchCounts.set(branch, (branchCounts.get(branch) || 0) + 1)
  }

  // Get branches sorted by major.minor version (newest first)
  const sortedBranches = Array.from(branchCounts.keys())
    .filter((branch) => {
      // Only include PHP 8.x branches with multiple versions (indicating active support)
      const [major] = branch.split('.')
      return major === '8' && branchCounts.get(branch)! > 3
    })
    .sort((a, b) => {
      const [aMajor, aMinor] = a.split('.').map(Number)
      const [bMajor, bMinor] = b.split('.').map(Number)

      if (aMajor !== bMajor)
        return bMajor - aMajor
      return bMinor - aMinor
    })

  // Return the top 4 most recent branches, or all if less than 4
  return sortedBranches.slice(0, 4)
}

/**
 * Check if a specific version is available for a package
 */
export async function isVersionAvailable(packageName: PackageName, version: string): Promise<boolean> {
  const versions = await getAvailableVersions(packageName)
  return versions.includes(version)
}

/**
 * Resolve a version specification to an actual version
 */
export async function resolveVersion(packageName: PackageName, versionSpec: VersionSpec = 'latest'): Promise<string | null> {
  if (versionSpec === 'latest') {
    return await getLatestVersion(packageName)
  }

  const versions = await getAvailableVersions(packageName)
  if (versions.length === 0)
    return null

  // For exact version matches
  if (versions.includes(versionSpec)) {
    return versionSpec
  }

  // For semver-like patterns, we'll do basic matching
  // This is a simplified implementation - a full semver resolver would be more complex
  if (versionSpec.startsWith('^')) {
    const baseVersion = versionSpec.slice(1)
    const majorVersion = baseVersion.split('.')[0]
    const matchingVersions = versions.filter(v => v.startsWith(`${majorVersion}.`))
    return matchingVersions[0] || null // Return the latest matching version
  }

  if (versionSpec.startsWith('~')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor] = baseVersion.split('.')
    const prefix = `${major}.${minor}.`
    const matchingVersions = versions.filter(v => v.startsWith(prefix))
    return matchingVersions[0] || null
  }

  if (versionSpec.startsWith('>=')) {
    const minVersion = versionSpec.slice(2)
    const minParts = minVersion.split('.').map(Number)
    const matchingVersions = versions.filter((v) => {
      const vParts = v.split('.').map(Number)
      for (let i = 0; i < Math.max(vParts.length, minParts.length); i++) {
        const a = vParts[i] ?? 0
        const b = minParts[i] ?? 0
        if (a > b) return true
        if (a < b) return false
      }
      return true // equal
    })
    return matchingVersions[0] || null
  }

  // For other patterns, return the latest version as fallback
  return await getLatestVersion(packageName)
}

/**
 * Get comprehensive package information
 */
export async function getPackageInfo(packageName: PackageName): Promise<PackageInfo | null> {
  const domain = resolvePackageDomain(packageName)
  if (!domain)
    return null

  const packages = await loadPackages()
  const pkg = packages[domain]
  if (!pkg)
    return null

  const latestVersion = await getLatestVersion(packageName)
  if (!latestVersion)
    return null

  return {
    name: String(packageName),
    domain,
    description: pkg.description || '',
    latestVersion,
    totalVersions: pkg.versions?.length || 0,
    programs: programsForPlatform({ ...pkg, programs: pkg.programs || [] }, process.platform),
    dependencies: [...(pkg.dependencies || [])],
    companions: [...(pkg.companions || [])],
    versions: [...(pkg.versions || [])],
  }
}

/**
 * Resolve package name to domain (handles aliases)
 */
export function resolvePackageDomain(packageName: PackageName): string | null {
  // Convert packageName to string to handle type compatibility
  const nameStr = String(packageName)

  // Check if it's an alias first
  if (nameStr in aliases) {
    const domain = aliases[nameStr as PackageAlias]
    // Convert domain to the format used in packages (e.g., 'bun.sh' -> 'bunsh')
    return convertDomainToVarName(domain)
  }

  // Convert the package name to the format used in packages
  return convertDomainToVarName(nameStr)
}

/**
 * Convert domain name to variable name format (same as used in packages)
 * @param domain Domain name (e.g., 'bun.sh', 'agwa.name/git-crypt')
 * @returns Variable name (e.g., 'bunsh', 'agwanamegitcrypt')
 */
function convertDomainToVarName(domain: string): string {
  // Handle nested paths like 'github.com/user/repo'
  if (domain.includes('/')) {
    const [parentDomain, ...subPathParts] = domain.split('/')
    const subPath = subPathParts.join('/')

    // Clean the parent domain (remove dots)
    const cleanParent = parentDomain.replace(/\./g, '')

    // Clean the subpath (remove slashes, hyphens, and special characters)
    const cleanSubPath = subPath.replace(/[/\-_.]/g, '').toLowerCase()

    return `${cleanParent}${cleanSubPath}`.toLowerCase()
  }

  // Regular domains like 'bun.sh' -> 'bunsh'
  return domain.replace(/[.\-_]/g, '').toLowerCase()
}

/**
 * Get all packages that match a search term
 */
export async function searchPackages(searchTerm: string): Promise<PackageInfo[]> {
  const results: PackageInfo[] = []
  const lowerSearchTerm = searchTerm.toLowerCase()

  // Search through aliases
  for (const [alias, _domain] of Object.entries(aliases)) {
    if (alias.toLowerCase().includes(lowerSearchTerm)) {
      const info = await getPackageInfo(alias as PackageAlias)
      if (info)
        results.push(info)
    }
  }

  // Search through package domains and descriptions
  const packages = await loadPackages()
  for (const [domain, pkg] of Object.entries(packages)) {
    if (domain.toLowerCase().includes(lowerSearchTerm)
      || pkg.description?.toLowerCase().includes(lowerSearchTerm)) {
      const info = await getPackageInfo(domain as PackageDomain)
      if (info && !results.some(r => r.domain === domain)) {
        results.push(info)
      }
    }
  }

  return results
}

/**
 * Get packages by category based on domain patterns
 */
export async function getPackagesByPattern(pattern: RegExp): Promise<PackageInfo[]> {
  const results: PackageInfo[] = []
  const packages = await loadPackages()

  for (const domain of Object.keys(packages)) {
    if (pattern.test(domain)) {
      const info = await getPackageInfo(domain as PackageDomain)
      if (info)
        results.push(info)
    }
  }

  return results
}

/**
 * Get popular packages (those with many versions, indicating active development)
 */
export async function getPopularPackages(minVersions: number = 10): Promise<PackageInfo[]> {
  const results: PackageInfo[] = []
  const packages = await loadPackages()

  for (const domain of Object.keys(packages)) {
    const info = await getPackageInfo(domain as PackageDomain)
    if (info && info.totalVersions >= minVersions) {
      results.push(info)
    }
  }

  // Sort by number of versions (descending)
  return results.sort((a, b) => b.totalVersions - a.totalVersions)
}

/**
 * Get recently updated packages (those with many versions, assuming frequent updates)
 */
export async function getActivePackages(limit: number = 50): Promise<PackageInfo[]> {
  const popularPackages = await getPopularPackages(5)
  return popularPackages.slice(0, limit)
}

/**
 * Validate a package specification
 */
// eslint-disable-next-line no-unused-vars
export async function validatePackageSpec(packageSpec: string): Promise<{
  isValid: boolean
  packageName?: PackageName
  version?: string
  error?: string
}> {
  try {
    const atIndex = packageSpec.lastIndexOf('@')

    if (atIndex === -1) {
      // No version specified
      const packageName = packageSpec
      const domain = resolvePackageDomain(packageName as PackageName)

      if (!domain) {
        return {
          isValid: false,
          error: `Unknown package: ${packageName}`,
        }
      }

      return {
        isValid: true,
        packageName: packageName as PackageName,
      }
    }

    const packageName = packageSpec.slice(0, atIndex)
    const version = packageSpec.slice(atIndex + 1)

    const domain = resolvePackageDomain(packageName as PackageName)
    if (!domain) {
      return {
        isValid: false,
        error: `Unknown package: ${packageName}`,
      }
    }

    if (version === 'latest') {
      return {
        isValid: true,
        packageName: packageName as PackageName,
        version,
      }
    }

    const versionAvailable = await isVersionAvailable(packageName as PackageName, version)
    if (!versionAvailable) {
      return {
        isValid: false,
        packageName: packageName as PackageName,
        version,
        error: `Version ${version} not available for package ${packageName}`,
      }
    }

    return {
      isValid: true,
      packageName: packageName as PackageName,
      version,
    }
  }
  catch {
    return {
      isValid: false,
      error: `Invalid package specification: ${packageSpec}`,
    }
  }
}

/** A version split into its comparable parts. */
interface ParsedVersion {
  major: number
  minor: number
  patch: number
  /** Dot-separated prerelease identifiers, empty for a stable release. */
  prerelease: string[]
}

/**
 * Parses a semver-ish version string.
 *
 * Tolerant of what registries actually publish: a missing patch (`0.16`), build
 * metadata (`+d5181a9c9`), and a `v` prefix. Non-numeric junk becomes 0 rather
 * than NaN, because NaN silently poisons every comparison it touches - that is
 * how a prerelease could sort above a stable release.
 */
export function parseVersion(version: string): ParsedVersion {
  const withoutBuild = version.replace(/^v/, '').split('+')[0]
  const [core, ...preParts] = withoutBuild.split('-')
  const [major, minor, patch] = core.split('.').map((part) => {
    const n = Number.parseInt(part, 10)
    return Number.isNaN(n) ? 0 : n
  })

  return {
    major: major ?? 0,
    minor: minor ?? 0,
    patch: patch ?? 0,
    prerelease: preParts.length > 0 ? preParts.join('-').split('.') : [],
  }
}

/**
 * Orders two versions, newest first. Precedence follows semver: compare
 * major/minor/patch numerically, then treat a prerelease as *lower* than the
 * release it precedes (`1.0.0-rc.1` < `1.0.0`), comparing identifiers so that
 * numeric ones sort numerically and `alpha` < `beta` < `rc`.
 */
export function compareVersionsDesc(a: string, b: string): number {
  const va = parseVersion(a)
  const vb = parseVersion(b)

  if (va.major !== vb.major) return vb.major - va.major
  if (va.minor !== vb.minor) return vb.minor - va.minor
  if (va.patch !== vb.patch) return vb.patch - va.patch

  const aPre = va.prerelease.length > 0
  const bPre = vb.prerelease.length > 0
  if (aPre !== bPre) return aPre ? 1 : -1 // stable first
  if (!aPre) return 0

  for (let i = 0; i < Math.max(va.prerelease.length, vb.prerelease.length); i++) {
    const x = va.prerelease[i]
    const y = vb.prerelease[i]
    if (x === undefined) return 1 // shorter prerelease is lower
    if (y === undefined) return -1

    const xn = Number.parseInt(x, 10)
    const yn = Number.parseInt(y, 10)
    const xIsNum = !Number.isNaN(xn) && String(xn) === x
    const yIsNum = !Number.isNaN(yn) && String(yn) === y

    if (xIsNum && yIsNum) {
      if (xn !== yn) return yn - xn
    }
    else if (xIsNum !== yIsNum) {
      return xIsNum ? 1 : -1 // numeric identifiers are lower than alphanumeric
    }
    else if (x !== y) {
      return x < y ? 1 : -1
    }
  }

  return 0
}

/**
 * Resolve a version constraint against available versions in S3 metadata.
 *
 * Ranges follow npm/semver semantics, which for `^` on a 0.x version means the
 * MINOR is pinned: `^0.16.0` is `>=0.16.0 <0.17.0`, not `>=0.16.0 <1.0.0`.
 * Zero-major releases make no compatibility promise between minors, so treating
 * `^0.16.0` as "any 0.x" hands back a toolchain that cannot build the project -
 * which is exactly what `^0.16.0` did when it resolved to 0.17.0-dev.
 *
 * Prereleases are excluded unless the constraint itself names one, again per
 * semver: `^0.16.0` must not select `0.17.0-dev`, but `^0.16.0-dev` may select
 * `0.16.0-dev.5`.
 */
export function resolveVersionFromMetadata(constraint: string, availableVersions: string[]): string | null {
  if (!availableVersions || availableVersions.length === 0) {
    return null
  }

  const sortedVersions = [...availableVersions].sort(compareVersionsDesc)

  const cleanConstraint = constraint.replace(/^[\^~]/, '')
  const wanted = parseVersion(cleanConstraint)
  // An explicit patch is required for `~1.2` to mean "any 1.2.x" rather than
  // "1.2.0 only", and for `^0.16` to pin the minor the same way `^0.16.0` does.
  const constraintCore = cleanConstraint.replace(/^v/, '').split('+')[0].split('-')[0]
  const hasPatch = constraintCore.split('.').length >= 3
  const constraintIsPrerelease = wanted.prerelease.length > 0

  /**
   * Whether a prerelease may be selected. Semver only allows it when the
   * constraint is itself a prerelease of the same major.minor.patch.
   */
  const prereleaseAllowed = (candidate: ParsedVersion): boolean => {
    if (candidate.prerelease.length === 0) return true
    if (!constraintIsPrerelease) return false
    return candidate.major === wanted.major
      && candidate.minor === wanted.minor
      && candidate.patch === wanted.patch
  }

  const atLeastConstraint = (candidate: ParsedVersion, version: string): boolean =>
    compareVersionsDesc(version, cleanConstraint) <= 0 || candidate.prerelease.length > 0

  const pick = (predicate: (candidate: ParsedVersion, version: string) => boolean): string | null => {
    for (const version of sortedVersions) {
      const candidate = parseVersion(version)
      if (!prereleaseAllowed(candidate)) continue
      if (predicate(candidate, version)) return version
    }
    return null
  }

  // Caret: same major, or - for a 0.x constraint - the same minor too.
  if (constraint.startsWith('^')) {
    return pick((candidate, version) => {
      if (candidate.major !== wanted.major) return false
      if (wanted.major === 0 && candidate.minor !== wanted.minor) return false
      return atLeastConstraint(candidate, version)
    })
  }

  // Tilde: same major.minor. Without an explicit patch (`~1.2`) any patch
  // qualifies; with one, only patches at or above it.
  if (constraint.startsWith('~')) {
    return pick((candidate, version) => {
      if (candidate.major !== wanted.major || candidate.minor !== wanted.minor) return false
      return !hasPatch || atLeastConstraint(candidate, version)
    })
  }

  // Exact match wins over any prefix interpretation.
  if (sortedVersions.includes(cleanConstraint)) {
    return cleanConstraint
  }

  // A partial version (`0.16`) means the latest release under it. Compare parsed
  // components rather than the raw string, so `0.1` cannot match `0.16.0`.
  const parts = constraintCore.split('.').filter(Boolean).map(n => Number.parseInt(n, 10))
  if (parts.length > 0 && parts.every(n => !Number.isNaN(n))) {
    const prefixMatch = pick((candidate) => {
      if (parts[0] !== undefined && candidate.major !== parts[0]) return false
      if (parts[1] !== undefined && candidate.minor !== parts[1]) return false
      if (parts[2] !== undefined && candidate.patch !== parts[2]) return false
      return true
    })
    if (prefixMatch) return prefixMatch
  }

  // Nothing matched. Fall back to the newest stable, then the newest overall -
  // an install with no version is more useful than a hard failure here.
  return pick(() => true) ?? sortedVersions[0] ?? null
}
