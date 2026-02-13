/**
 * **fd** - A simple, fast and user-friendly alternative to 'find'
 *
 * @domain `crates.io/fd-find`
 * @programs `fd`
 * @version `10.3.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/fd-find`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiofdfind
 * console.log(pkg.name)        // "fd"
 * console.log(pkg.description) // "A simple, fast and user-friendly alternative to..."
 * console.log(pkg.programs)    // ["fd"]
 * console.log(pkg.versions[0]) // "10.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/fd-find.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiofdfindPackage = {
  /**
   * The display name of this package.
   */
  name: 'fd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/fd-find' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A simple, fast and user-friendly alternative to \'find\'' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/fd-find/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/fd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/fd-find' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/fd-find -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/fd-find' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '10.3.0',
    '10.2.0',
    '10.1.0',
    '10.0.0',
    '9.0.0',
    '8.7.1',
    '8.7.0',
    '8.6.0',
    '8.5.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiofdfindPackage = typeof cratesiofdfindPackage
