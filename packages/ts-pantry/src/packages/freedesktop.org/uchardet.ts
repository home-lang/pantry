/**
 * **uchardet** - Encoding detector library
 *
 * @domain `freedesktop.org/uchardet`
 * @programs `uchardet`
 * @version `0.0.8` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/uchardet`
 * @homepage https://www.freedesktop.org/wiki/Software/uchardet/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporguchardet
 * console.log(pkg.name)        // "uchardet"
 * console.log(pkg.description) // "Encoding detector library"
 * console.log(pkg.programs)    // ["uchardet"]
 * console.log(pkg.versions[0]) // "0.0.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/uchardet.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporguchardetPackage = {
  /**
   * The display name of this package.
   */
  name: 'uchardet' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/uchardet' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Encoding detector library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/uchardet/package.yml' as const,
  homepageUrl: 'https://www.freedesktop.org/wiki/Software/uchardet/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/uchardet' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/uchardet -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/uchardet' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'uchardet',
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
    '0.0.8',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporguchardetPackage = typeof freedesktoporguchardetPackage
