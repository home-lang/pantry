/**
 * **diskonaut** - Terminal visual disk space navigator
 *
 * @domain `crates.io/diskonaut`
 * @programs `diskonaut`
 * @version `0.11.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/diskonaut`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiodiskonaut
 * console.log(pkg.name)        // "diskonaut"
 * console.log(pkg.description) // "Terminal visual disk space navigator"
 * console.log(pkg.programs)    // ["diskonaut"]
 * console.log(pkg.versions[0]) // "0.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/diskonaut.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiodiskonautPackage = {
  /**
   * The display name of this package.
   */
  name: 'diskonaut' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/diskonaut' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal visual disk space navigator' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/diskonaut/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/imsnif/diskonaut' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/diskonaut' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/diskonaut -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/diskonaut' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'diskonaut',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.11.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiodiskonautPackage = typeof cratesiodiskonautPackage
