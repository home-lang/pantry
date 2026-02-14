/**
 * **readline** - pkgx package
 *
 * @domain `gnu.org/readline`
 * @version `8.3.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/readline`
 * @dependencies `invisible-island.net/ncurses^6`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgreadline
 * console.log(pkg.name)        // "readline"
 * console.log(pkg.versions[0]) // "8.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/readline.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgreadlinePackage = {
  /**
  * The display name of this package.
  */
  name: 'readline' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/readline' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/readline/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/readline' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/readline -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/readline' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'invisible-island.net/ncurses^6',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.3.0',
    '8.2.13',
    '8.2.0',
    '8.1.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgreadlinePackage = typeof gnuorgreadlinePackage
