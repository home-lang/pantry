/**
 * **LibTomMath** - LibTomMath is a free open source portable number theoretic multiple-precision integer library written entirely in C.
 *
 * @domain `libtom.net/math`
 * @version `1.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libtom.net/math`
 * @homepage https://www.libtom.net
 * @buildDependencies `gnu.org/libtool@^2.4.7` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libtomnetmath
 * console.log(pkg.name)        // "LibTomMath"
 * console.log(pkg.description) // "LibTomMath is a free open source portable numbe..."
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libtom-net/math.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libtomnetmathPackage = {
  /**
   * The display name of this package.
   */
  name: 'LibTomMath' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libtom.net/math' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'LibTomMath is a free open source portable number theoretic multiple-precision integer library written entirely in C.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libtom.net/math/package.yml' as const,
  homepageUrl: 'https://www.libtom.net' as const,
  githubUrl: 'https://github.com/libtom/libtommath' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libtom.net/math' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libtom.net/math -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libtom.net/math' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/libtool@^2.4.7',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.0',
    '1.2.1',
  ] as const,
  aliases: [] as const,
}

export type LibtomnetmathPackage = typeof libtomnetmathPackage
