/**
 * **libnl** - Netlink Library Suite
 *
 * @domain `github.com/thom311/libnl`
 * @version `3.12.0` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/thom311/libnl`
 * @buildDependencies `gnu.org/bison`, `github.com/westes/flex` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomthom311libnl
 * console.log(pkg.name)        // "libnl"
 * console.log(pkg.description) // "Netlink Library Suite"
 * console.log(pkg.versions[0]) // "3.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/thom311/libnl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libnlPackage = {
  /**
   * The display name of this package.
   */
  name: 'libnl' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/thom311/libnl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Netlink Library Suite' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/thom311/libnl/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/thom311/libnl' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/thom311/libnl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/thom311/libnl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/thom311/libnl' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bison',
    'github.com/westes/flex',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.12.0',
    '3.11.0',
    '3.10.0',
    '3.9.0',
    '3.8.0',
    '3.7.0',
  ] as const,
  aliases: [] as const,
}

export type LibnlPackage = typeof libnlPackage
