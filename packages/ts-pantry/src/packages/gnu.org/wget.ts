/**
 * **wget** - Internet file retriever
 *
 * @domain `gnu.org/wget`
 * @programs `wget`
 * @version `1.25.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/wget`
 * @homepage https://www.gnu.org/software/wget/
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgwget
 * console.log(pkg.name)        // "wget"
 * console.log(pkg.description) // "Internet file retriever"
 * console.log(pkg.programs)    // ["wget"]
 * console.log(pkg.versions[0]) // "1.25.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/wget.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgwgetPackage = {
  /**
   * The display name of this package.
   */
  name: 'wget' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/wget' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Internet file retriever' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/wget/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/wget/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/wget' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/wget -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/wget' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'wget',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.25.0',
    '1.24.5',
    '1.21.4',
    '1.21.3',
  ] as const,
  aliases: [] as const,
}

export type GnuorgwgetPackage = typeof gnuorgwgetPackage
