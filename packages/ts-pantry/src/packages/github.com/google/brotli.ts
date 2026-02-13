/**
 * **brotli** - Generic-purpose lossless compression algorithm by Google
 *
 * @domain `github.com/google/brotli`
 * @programs `brotli`
 * @version `1.2.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/google/brotli`
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgooglebrotli
 * console.log(pkg.name)        // "brotli"
 * console.log(pkg.description) // "Generic-purpose lossless compression algorithm ..."
 * console.log(pkg.programs)    // ["brotli"]
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/google/brotli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const brotliPackage = {
  /**
   * The display name of this package.
   */
  name: 'brotli' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/google/brotli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generic-purpose lossless compression algorithm by Google' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/google/brotli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/google/brotli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/google/brotli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/google/brotli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/google/brotli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'brotli',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.0',
    '1.1.0',
    '1.0.9',
  ] as const,
  aliases: [] as const,
}

export type BrotliPackage = typeof brotliPackage
