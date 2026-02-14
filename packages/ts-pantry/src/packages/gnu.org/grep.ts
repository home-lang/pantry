/**
 * **grep** - pkgx package
 *
 * @domain `gnu.org/grep`
 * @programs `grep`
 * @version `3.12.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/grep`
 * @dependencies `pcre.org/v2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggrep
 * console.log(pkg.name)        // "grep"
 * console.log(pkg.programs)    // ["grep"]
 * console.log(pkg.versions[0]) // "3.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/grep.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggrepPackage = {
  /**
  * The display name of this package.
  */
  name: 'grep' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/grep' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/grep/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/grep' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/grep -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/grep' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'grep',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pcre.org/v2',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.12.0',
    '3.11.0',
    '3.8.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggrepPackage = typeof gnuorggrepPackage
