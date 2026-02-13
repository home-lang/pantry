/**
 * **freexl** - pkgx package
 *
 * @domain `gaia-gis.it/fossil/freexl`
 * @version `2.0.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gaia-gis.it/fossil/freexl`
 * @dependencies `zlib.net/minizip^1`, `libexpat.github.io^2`
 * @buildDependencies `doxygen.nl@1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gaiagisitfossilfreexl
 * console.log(pkg.name)        // "freexl"
 * console.log(pkg.versions[0]) // "2.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gaia-gis-it/fossil/freexl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gaiagisitfossilfreexlPackage = {
  /**
   * The display name of this package.
   */
  name: 'freexl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gaia-gis.it/fossil/freexl' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gaia-gis.it/fossil/freexl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gaia-gis.it/fossil/freexl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gaia-gis.it/fossil/freexl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gaia-gis.it/fossil/freexl' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net/minizip^1',
    'libexpat.github.io^2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'doxygen.nl@1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.0',
    '1.0.6',
  ] as const,
  aliases: [] as const,
}

export type GaiagisitfossilfreexlPackage = typeof gaiagisitfossilfreexlPackage
