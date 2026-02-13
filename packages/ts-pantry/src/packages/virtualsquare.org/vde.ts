/**
 * **vde** - pkgx package
 *
 * @domain `virtualsquare.org/vde`
 * @version `2.3.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install virtualsquare.org/vde`
 * @buildDependencies `gnu.org/autoconf@^2`, `gnu.org/automake@^1`, `gnu.org/libtool@^2.4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.virtualsquareorgvde
 * console.log(pkg.name)        // "vde"
 * console.log(pkg.versions[0]) // "2.3.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/virtualsquare-org/vde.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const virtualsquareorgvdePackage = {
  /**
   * The display name of this package.
   */
  name: 'vde' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'virtualsquare.org/vde' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/virtualsquare.org/vde/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/virtualsquare/vde-2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install virtualsquare.org/vde' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +virtualsquare.org/vde -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install virtualsquare.org/vde' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf@^2',
    'gnu.org/automake@^1',
    'gnu.org/libtool@^2.4',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.3',
  ] as const,
  aliases: [] as const,
}

export type VirtualsquareorgvdePackage = typeof virtualsquareorgvdePackage
