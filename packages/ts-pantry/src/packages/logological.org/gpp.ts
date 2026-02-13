/**
 * **gpp** - General-purpose preprocessor with customizable syntax
 *
 * @domain `logological.org/gpp`
 * @programs `gpp`
 * @version `2.28.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install logological.org/gpp`
 * @homepage https://logological.org/gpp
 * @buildDependencies `gnu.org/autoconf` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.logologicalorggpp
 * console.log(pkg.name)        // "gpp"
 * console.log(pkg.description) // "General-purpose preprocessor with customizable ..."
 * console.log(pkg.programs)    // ["gpp"]
 * console.log(pkg.versions[0]) // "2.28.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/logological-org/gpp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const logologicalorggppPackage = {
  /**
   * The display name of this package.
   */
  name: 'gpp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'logological.org/gpp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'General-purpose preprocessor with customizable syntax' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/logological.org/gpp/package.yml' as const,
  homepageUrl: 'https://logological.org/gpp' as const,
  githubUrl: 'https://github.com/logological/gpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install logological.org/gpp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +logological.org/gpp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install logological.org/gpp' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gpp',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.28.0',
    '2.27.0',
  ] as const,
  aliases: [] as const,
}

export type LogologicalorggppPackage = typeof logologicalorggppPackage
