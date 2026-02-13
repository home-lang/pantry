/**
 * **libaec** - libaec - Adaptive Entropy Coding library
 *
 * @domain `dkrz.de/libaec`
 * @version `1.1.5` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dkrz.de/libaec`
 * @homepage https://gitlab.dkrz.de/k202009/libaec
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dkrzdelibaec
 * console.log(pkg.name)        // "libaec"
 * console.log(pkg.description) // "libaec - Adaptive Entropy Coding library"
 * console.log(pkg.versions[0]) // "1.1.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dkrz-de/libaec.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dkrzdelibaecPackage = {
  /**
   * The display name of this package.
   */
  name: 'libaec' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'dkrz.de/libaec' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'libaec - Adaptive Entropy Coding library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dkrz.de/libaec/package.yml' as const,
  homepageUrl: 'https://gitlab.dkrz.de/k202009/libaec' as const,
  githubUrl: 'https://github.com/MathisRosenhauer/libaec' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install dkrz.de/libaec' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dkrz.de/libaec -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dkrz.de/libaec' as const,
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
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.0.6',
  ] as const,
  aliases: [] as const,
}

export type DkrzdelibaecPackage = typeof dkrzdelibaecPackage
