/**
 * **libcerf** - pkgx package
 *
 * @domain `jugit.fz-juelich.de/mlz/libcerf`
 * @version `2.5.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jugit.fz-juelich.de/mlz/libcerf`
 * @buildDependencies `cmake.org`, `perl.org@^5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jugitfzjuelichdemlzlibcerf
 * console.log(pkg.name)        // "libcerf"
 * console.log(pkg.versions[0]) // "2.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jugit-fz-juelich-de/mlz/libcerf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jugitfzjuelichdemlzlibcerfPackage = {
  /**
   * The display name of this package.
   */
  name: 'libcerf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jugit.fz-juelich.de/mlz/libcerf' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jugit.fz-juelich.de/mlz/libcerf/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jugit.fz-juelich.de/mlz/libcerf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jugit.fz-juelich.de/mlz/libcerf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jugit.fz-juelich.de/mlz/libcerf' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
    'perl.org@^5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.0',
    '2.4.0',
  ] as const,
  aliases: [] as const,
}

export type JugitfzjuelichdemlzlibcerfPackage = typeof jugitfzjuelichdemlzlibcerfPackage
