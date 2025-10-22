import { cleanupCache, getCacheStats } from './cache'
import { resolveAllDependencies } from './dependency-resolution'
import { downloadPackage } from './install-core'
import { install } from './install-main'
import { cleanupSpinner, resetInstalledTracker } from './logging'
import { getAllPackageAliases, getAllPackageDomains, getAllPackageNames, getAvailableVersions, getLatestVersion, getPackageInfo, isPackageAlias, isPackageDomain, isValidPackageName, isVersionAvailable, listAvailablePackages, parsePackageSpec, resolvePackageName, resolveVersion } from './package-resolution'
import { buildSqliteFromSource, installDependenciesOnly } from './special-installers'
import { DISTRIBUTION_CONFIG } from './types'
import { install_prefix } from './utils'

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
  getLatestVersion,
  getPackageInfo,
  install,
  install_prefix,
  installDependenciesOnly,
  isPackageAlias,
  isPackageDomain,
  isValidPackageName,
  isVersionAvailable,
  listAvailablePackages,
  parsePackageSpec,
  resetInstalledTracker,
  resolveAllDependencies,
  resolvePackageName,
  resolveVersion,
}
