/**
 * **gperf** - Perfect hash function generator
 *
 * @domain `gnu.org/gperf`
 * @programs `gperf`
 * @version `3.3.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/gperf`
 * @homepage https://www.gnu.org/software/gperf/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggperf
 * console.log(pkg.name)        // "gperf"
 * console.log(pkg.description) // "Perfect hash function generator"
 * console.log(pkg.programs)    // ["gperf"]
 * console.log(pkg.versions[0]) // "3.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/gperf.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggperfPackage = {
  /**
  * The display name of this package.
  */
  name: 'gperf' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/gperf' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Perfect hash function generator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gperf/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/gperf/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/gperf' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gperf -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/gperf' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gperf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.3.0',
    '3.2.1',
    '3.2.0',
    '3.1.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggperfPackage = typeof gnuorggperfPackage
