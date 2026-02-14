/**
 * **gawk** - pkgx package
 *
 * @domain `gnu.org/gawk`
 * @programs `awk`, `gawk`, `gawk-{{version}}`, `gawkbug`
 * @version `5.3.2` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/gawk`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggawk
 * console.log(pkg.name)        // "gawk"
 * console.log(pkg.programs)    // ["awk", "gawk", ...]
 * console.log(pkg.versions[0]) // "5.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/gawk.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggawkPackage = {
  /**
  * The display name of this package.
  */
  name: 'gawk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/gawk' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gawk/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/gawk' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gawk -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/gawk' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'awk',
    'gawk',
    'gawk-{{version}}',
    'gawkbug',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '5.3.2',
    '5.3.1',
    '5.3.0',
    '5.2.2',
    '5.2.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorggawkPackage = typeof gnuorggawkPackage
