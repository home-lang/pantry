/**
 * CLI utilities for ts-pkgx package management
 */

import type { PackageInfo, PackageName, SupportedArchitecture, SupportedPlatform } from './package-types'
import process from 'node:process'
import { detectPlatform, getAllPackageAliases } from './package-types'
import {
  getActivePackages,
  getAvailableVersions,
  getLatestVersion,
  getPackageInfo,
  getPopularPackages,
  resolveVersion,
  searchPackages,
  validatePackageSpec,
} from './version-utils'

/**
 * CLI command result interface
 */
export interface CLIResult<T = any> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

/**
 * Package installation plan
 */
export interface InstallationPlan {
  packageName: PackageName
  resolvedVersion: string
  platform: SupportedPlatform
  architecture: SupportedArchitecture
  dependencies: string[]
  companions: string[]
  installCommand: string
}

/**
 * Show detailed information about a package
 */
export async function showPackageInfo(packageName: string): Promise<CLIResult<PackageInfo>> {
  try {
    const info = await getPackageInfo(packageName as PackageName)

    if (!info) {
      return {
        success: false,
        error: `Package '${packageName}' not found. Use 'search' to find available packages.`,
      }
    }

    return {
      success: true,
      data: info,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to get package info: ${error}`,
    }
  }
}

/**
 * Search for packages by name or description
 */
export async function searchPackagesCommand(searchTerm: string): Promise<CLIResult<PackageInfo[]>> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: false,
        error: 'Search term cannot be empty',
      }
    }

    const results = await searchPackages(searchTerm.trim())

    return {
      success: true,
      data: results,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Search failed: ${error}`,
    }
  }
}

/**
 * List popular packages
 */
export async function listPopularPackages(limit: number = 20): Promise<CLIResult<PackageInfo[]>> {
  try {
    const packages = await getPopularPackages(5)
    const limitedPackages = packages.slice(0, limit)

    return {
      success: true,
      data: limitedPackages,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to list popular packages: ${error}`,
    }
  }
}

/**
 * List recently active packages
 */
export async function listActivePackages(limit: number = 20): Promise<CLIResult<PackageInfo[]>> {
  try {
    const packages = await getActivePackages(limit)

    return {
      success: true,
      data: packages,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to list active packages: ${error}`,
    }
  }
}

/**
 * List all available package aliases
 */
export function listAliases(): CLIResult<string[]> {
  try {
    const aliases = getAllPackageAliases()

    return {
      success: true,
      data: aliases,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to list aliases: ${error}`,
    }
  }
}

/**
 * Validate a package specification
 */
// eslint-disable-next-line no-unused-vars
export async function validatePackage(packageSpec: string): Promise<CLIResult<{
  packageName: PackageName
  version?: string
  isValid: boolean
}>> {
  try {
    const validation = await validatePackageSpec(packageSpec)

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    return {
      success: true,
      data: {
        packageName: validation.packageName!,
        version: validation.version,
        isValid: true,
      },
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Validation failed: ${error}`,
    }
  }
}

/**
 * Create an installation plan for a package
 */
export async function createInstallPlan(packageSpec: string): Promise<CLIResult<InstallationPlan>> {
  try {
    const validation = await validatePackageSpec(packageSpec)

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    const packageName = validation.packageName!
    const requestedVersion = validation.version || 'latest'

    const resolvedVersion = await resolveVersion(packageName, requestedVersion)
    if (!resolvedVersion) {
      return {
        success: false,
        error: `Could not resolve version '${requestedVersion}' for package '${packageName}'`,
      }
    }

    const packageInfo = await getPackageInfo(packageName)
    if (!packageInfo) {
      return {
        success: false,
        error: `Package '${packageName}' not found`,
      }
    }

    const platform = detectPlatform()

    const plan: InstallationPlan = {
      packageName,
      resolvedVersion,
      platform: platform.platform,
      architecture: platform.architecture,
      dependencies: packageInfo.dependencies,
      companions: packageInfo.companions,
      installCommand: `pkgx install ${packageName}@${resolvedVersion}`,
    }

    const warnings: string[] = []

    if (!platform.isSupported) {
      warnings.push(`Platform ${platform.platform}/${platform.architecture} may not be fully supported`)
    }

    if (packageInfo.dependencies.length > 0) {
      warnings.push(`This package has ${packageInfo.dependencies.length} dependencies that will also be installed`)
    }

    return {
      success: true,
      data: plan,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to create install plan: ${error}`,
    }
  }
}

/**
 * Get version information for a package
 */
// eslint-disable-next-line no-unused-vars
export async function getVersionInfo(packageName: string): Promise<CLIResult<{
  latest: string
  total: number
  versions: string[]
}>> {
  try {
    const latest = await getLatestVersion(packageName as PackageName)
    if (!latest) {
      return {
        success: false,
        error: `Package '${packageName}' not found`,
      }
    }

    const versions = await getAvailableVersions(packageName as PackageName)

    return {
      success: true,
      data: {
        latest,
        total: versions.length,
        versions,
      },
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to get version info: ${error}`,
    }
  }
}

/**
 * Format package info for CLI display
 */
export function formatPackageInfo(info: PackageInfo): string {
  const lines = [
    `Package: ${info.name}`,
    `Domain: ${info.domain}`,
    `Description: ${info.description}`,
    `Latest Version: ${info.latestVersion}`,
    `Total Versions: ${info.totalVersions}`,
  ]

  if (info.programs.length > 0) {
    lines.push(`Programs: ${info.programs.join(', ')}`)
  }

  if (info.dependencies.length > 0) {
    lines.push(`Dependencies: ${info.dependencies.join(', ')}`)
  }

  if (info.companions.length > 0) {
    lines.push(`Companions: ${info.companions.join(', ')}`)
  }

  return lines.join('\n')
}

/**
 * Format search results for CLI display
 */
export function formatSearchResults(results: PackageInfo[]): string {
  if (results.length === 0) {
    return 'No packages found matching your search.'
  }

  const lines = [`Found ${results.length} package(s):\n`]

  for (const pkg of results) {
    lines.push(`${pkg.name} (${pkg.domain})`)
    lines.push(`  ${pkg.description}`)
    lines.push(`  Latest: ${pkg.latestVersion} (${pkg.totalVersions} versions available)`)
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Format installation plan for CLI display
 */
export function formatInstallPlan(plan: InstallationPlan): string {
  const lines = [
    `Installation Plan for ${plan.packageName}@${plan.resolvedVersion}`,
    `Platform: ${plan.platform}/${plan.architecture}`,
    `Command: ${plan.installCommand}`,
  ]

  if (plan.dependencies.length > 0) {
    lines.push(`Dependencies: ${plan.dependencies.join(', ')}`)
  }

  if (plan.companions.length > 0) {
    lines.push(`Companions: ${plan.companions.join(', ')}`)
  }

  return lines.join('\n')
}

/**
 * Get system information relevant to package installation
 */
export function getSystemInfo(): CLIResult<{
  platform: SupportedPlatform
  architecture: SupportedArchitecture
  isSupported: boolean
  nodeVersion: string
}> {
  try {
    const platform = detectPlatform()

    return {
      success: true,
      data: {
        platform: platform.platform,
        architecture: platform.architecture,
        isSupported: platform.isSupported,
        nodeVersion: process.version,
      },
    }
  }
  catch (error) {
    return {
      success: false,
      error: `Failed to get system info: ${error}`,
    }
  }
}
