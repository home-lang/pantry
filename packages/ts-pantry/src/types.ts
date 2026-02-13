export interface ProjectFolder {
  name: string
  url: string
}

export interface FetchProjectsOptions {
  apiUrl?: string
}

export interface GitHubContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'dir' | 'file'
  _links: {
    self: string
    git: string
    html: string
  }
}

/**
 * Represents a pkgx package with its metadata
 */
export interface PkgxPackage {
  name: string
  domain: string
  description: string
  packageYmlUrl?: string
  homepageUrl?: string
  githubUrl?: string
  /**
   * Command to install this package using launchpad (default install command)
   * @example launchpad install domain
   */
  installCommand: string
  /**
   * Command to install this package using pkgx
   * @example sh <(curl https://pkgx.sh) +domain -- $SHELL -i
   */
  pkgxInstallCommand: string
  /**
   * Command to install this package using launchpad
   * @example launchpad install domain
   */
  launchpadInstallCommand: string
  programs: string[]
  companions: string[]
  /**
   * Runtime dependencies (from top-level dependencies in package.yml)
   */
  dependencies: string[]
  /**
   * Build-time dependencies (from build.dependencies in package.yml)
   */
  buildDependencies?: string[]
  versions: string[]
  /**
   * List of alternative names or aliases for this package
   */
  aliases?: string[]
  /**
   * The full path to the package, including any nested paths (e.g. 'agwa.name/git-crypt')
   */
  fullPath?: string
  /**
   * Timestamp when the package data was last fetched
   */
  fetchedAt?: number
}

/**
 * Options for package fetching methods
 */
export interface PackageFetchOptions {
  /**
   * Timeout in milliseconds for fetching operations
   * @default 30000
   */
  timeout?: number

  /**
   * Directory to save package data
   * @default 'packages'
   */
  outputDir?: string

  /**
   * Directory to store cached package data
   * @default '.cache/packages'
   */
  cacheDir?: string

  /**
   * Enable debug mode to save screenshots and additional info
   * @default false
   */
  debug?: boolean

  /**
   * Limit the number of packages to fetch
   */
  limit?: number

  /**
   * Whether to use cached data if available and not expired
   * @default true
   */
  cache?: boolean

  /**
   * Cache expiration time in minutes
   * @default 1440 (24 hours)
   */
  cacheExpirationMinutes?: number

  /**
   * Number of packages to fetch concurrently
   * @default 10
   */
  concurrency?: number

  /**
   * Browser instance to use for fetching (for concurrency)
   * @internal
   */
  browser?: any

  /**
   * Whether to output only JSON (suppress debug/log messages)
   * @default false
   */
  outputJson?: boolean

  /**
   * Directory containing the local pantry files
   * @default 'src/pantry'
   */
  pantryDir?: string
}

export interface FetchPkgxPackageOptions {
  url?: string
}

export type { Packages } from './packages'
