import type { aliases, packages } from 'ts-pkgx'
import { cleanupCache, getCacheStats } from './cache'
import { resolveAllDependencies } from './dependency-resolution'
import { downloadPackage } from './install-core'
import { install } from './install-main'
import { cleanupSpinner, resetInstalledTracker } from './logging'
import { getAllPackageAliases, getAllPackageDomains, getAllPackageNames, getAvailableVersions, getPackageInfo, isPackageAlias, isPackageDomain, isValidPackageName, listAvailablePackages, parsePackageSpec, resolvePackageName } from './package-resolution'
import { buildSqliteFromSource, installDependenciesOnly, testPhpBinary } from './special-installers'
import { DISTRIBUTION_CONFIG } from './types'
import { install_prefix } from './utils'

// Re-export types from types.ts
export type PackageAlias = keyof typeof aliases
export type PackageDomain = keyof typeof packages
export type PackageName = PackageAlias | PackageDomain
export type PackageSpec = string
export type SupportedFormat = 'tar.xz' | 'tar.gz'
export type SupportedPlatform = 'darwin' | 'linux' | 'windows'
export type SupportedArchitecture = 'x86_64' | 'aarch64' | 'armv7l'

// Re-export all the functions from the refactored modules
export {
  buildSqliteFromSource,
  cleanupCache,
  cleanupSpinner,
  DISTRIBUTION_CONFIG,
  downloadPackage,
  getAllPackageAliases,
  getAllPackageDomains,
  getAllPackageNames,
  getAvailableVersions,
  getCacheStats,
  getPackageInfo,
  install,
  install_prefix,
  installDependenciesOnly,
  isPackageAlias,
  isPackageDomain,
  isValidPackageName,
  listAvailablePackages,
  parsePackageSpec,
  resetInstalledTracker,
  resolveAllDependencies,
  resolvePackageName,
  testPhpBinary,
}
