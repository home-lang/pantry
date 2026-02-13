/**
 * **toast** - Containerize your development and continuous integration environments. 🥂
 *
 * @domain `crates.io/toast`
 * @programs `toast`
 * @version `0.47.7` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/toast`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotoast
 * console.log(pkg.name)        // "toast"
 * console.log(pkg.description) // "Containerize your development and continuous in..."
 * console.log(pkg.programs)    // ["toast"]
 * console.log(pkg.versions[0]) // "0.47.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/toast.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotoastPackage = {
  /**
   * The display name of this package.
   */
  name: 'toast' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/toast' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Containerize your development and continuous integration environments. 🥂' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/toast/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/stepchowfun/toast' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/toast' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/toast -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/toast' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'toast',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.47.7',
    '0.47.6',
    '0.47.5',
  ] as const,
  aliases: [] as const,
}

export type CratesiotoastPackage = typeof cratesiotoastPackage
