/**
 * **jenv** - Manage your Java environment
 *
 * @domain `jenv.be`
 * @programs `jenv`
 * @version `0.6.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jenv.be`
 * @homepage http://www.jenv.be
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jenvbe
 * console.log(pkg.name)        // "jenv"
 * console.log(pkg.description) // "Manage your Java environment "
 * console.log(pkg.programs)    // ["jenv"]
 * console.log(pkg.versions[0]) // "0.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jenv-be.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jenvbePackage = {
  /**
   * The display name of this package.
   */
  name: 'jenv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'jenv.be' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Manage your Java environment ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jenv.be/package.yml' as const,
  homepageUrl: 'http://www.jenv.be' as const,
  githubUrl: 'https://github.com/jenv/jenv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jenv.be' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jenv.be -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jenv.be' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'jenv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.0',
    '0.5.9',
    '0.5.8',
    '0.5.7',
    '0.5.6',
  ] as const,
  aliases: [] as const,
}

export type JenvbePackage = typeof jenvbePackage
