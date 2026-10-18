export * from './cli-utils'
export * from './consts'
export { programsForPlatform } from './programs'
export type { PlatformPrograms, ProgramVersions } from './programs'
export * from './dependency-resolver'
export {
  detectPlatform,
  globalBinDir,
  installPackage,
  installPackages,
  isInstallable,
  isSupported,
  resolveLatestVersion,
} from './installer'
export {
  detectShell,
  installShellInit,
  rcFileFor,
  renderShellSnippet,
  uninstallShellInit,
} from './shell-init'
export {
  cleanStaleOutputFiles,
  cleanupBrowserResources,
  fetchAndSaveAllPackages,
  fetchAndSavePackage,
  fetchPantryPackage,
  fetchPantryPackageWithMetadata,
  fetchPkgxProjects,
  getValidCachedPackage,
  readPantryPackageInfo,
  savePackageAsTypeScript,
  saveToCacheAndOutput,
  scanPantryPackages,
  setupCleanupHandlers,
  startPeriodicCleanup,
} from './fetch'
export {
  generateAliases,
  generateDocs,
  generateIndex,
  toPackageVarName,
  toSafeVarName,
  toTypeName,
  updatePackageVersionMap,
} from './generate'
export * from './pantry-api'
export * from './package-types'
export * from './packages'
// pkgx-fetcher and pkgx-scraper removed — version discovery now via scripts/version-fetcher.ts
export * from './types'
export {
  convertDomainToFileName,
  convertDomainToVarName,
  fetchPackageListFromGitHub,
  formatObjectWithoutQuotedKeys,
  getCanonicalDomain,
  getGitHubPackageCache,
  getPackageAliases,
  guessOriginalDomain,
  isKnownAlias,
  logPkgxProjects,
  resolvePackageDomain,
  saveGitHubPackageCache,
  saveRateLimitInfo,
  shouldProceedWithGitHubRequest,
} from './utils'
export * from './version-utils'
export * from './config-types'
export * from './container'
export * from './testing'
export * from './desktop-apps'
export * from './app-store-connect'
export * from './apple-certificates'
export * from './installer'
