/**
 * **libsigsegv** - pkgx package
 *
 * @domain `gnu.org/libsigsegv`
 * @version `2.15.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/libsigsegv`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorglibsigsegv
 * console.log(pkg.name)        // "libsigsegv"
 * console.log(pkg.versions[0]) // "2.15.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/libsigsegv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorglibsigsegvPackage = {
  /**
   * The display name of this package.
   */
  name: 'libsigsegv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/libsigsegv' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libsigsegv/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/libsigsegv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/libsigsegv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/libsigsegv' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.15.0',
    '2.14.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorglibsigsegvPackage = typeof gnuorglibsigsegvPackage
