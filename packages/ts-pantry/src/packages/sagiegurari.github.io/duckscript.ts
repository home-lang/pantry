/**
 * **duckscript** - Simple, extendable and embeddable scripting language.
 *
 * @domain `sagiegurari.github.io/duckscript`
 * @programs `duck`
 * @version `0.11.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sagiegurari.github.io/duckscript`
 * @homepage https://sagiegurari.github.io/duckscript
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sagiegurarigithubioduckscript
 * console.log(pkg.name)        // "duckscript"
 * console.log(pkg.description) // "Simple, extendable and embeddable scripting lan..."
 * console.log(pkg.programs)    // ["duck"]
 * console.log(pkg.versions[0]) // "0.11.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sagiegurari-github-io/duckscript.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sagiegurarigithubioduckscriptPackage = {
  /**
   * The display name of this package.
   */
  name: 'duckscript' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sagiegurari.github.io/duckscript' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Simple, extendable and embeddable scripting language.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sagiegurari.github.io/duckscript/package.yml' as const,
  homepageUrl: 'https://sagiegurari.github.io/duckscript' as const,
  githubUrl: 'https://github.com/sagiegurari/duckscript' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sagiegurari.github.io/duckscript' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sagiegurari.github.io/duckscript -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sagiegurari.github.io/duckscript' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'duck',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.1',
    '0.11.0',
    '0.10.0',
    '0.9.4',
    '0.9.3',
  ] as const,
  aliases: [] as const,
}

export type SagiegurarigithubioduckscriptPackage = typeof sagiegurarigithubioduckscriptPackage
