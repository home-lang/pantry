/**
 * **libsamplerate** - An audio Sample Rate Conversion library
 *
 * @domain `github.com/libsndfile/libsamplerate`
 * @version `0.2.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/libsndfile/libsamplerate`
 * @homepage http://libsndfile.github.io/libsamplerate/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomlibsndfilelibsamplerate
 * console.log(pkg.name)        // "libsamplerate"
 * console.log(pkg.description) // "An audio Sample Rate Conversion library"
 * console.log(pkg.versions[0]) // "0.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/libsndfile/libsamplerate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libsampleratePackage = {
  /**
   * The display name of this package.
   */
  name: 'libsamplerate' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/libsndfile/libsamplerate' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An audio Sample Rate Conversion library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/libsndfile/libsamplerate/package.yml' as const,
  homepageUrl: 'http://libsndfile.github.io/libsamplerate/' as const,
  githubUrl: 'https://github.com/libsndfile/libsamplerate' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/libsndfile/libsamplerate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/libsndfile/libsamplerate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/libsndfile/libsamplerate' as const,
  programs: [] as const,
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
    '0.2.2',
  ] as const,
  aliases: [] as const,
}

export type LibsampleratePackage = typeof libsampleratePackage
