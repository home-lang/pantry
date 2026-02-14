/**
 * **zoxide** - Shell extension to navigate your filesystem faster
 *
 * @domain `crates.io/zoxide`
 * @programs `zoxide`
 * @version `0.9.9` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/zoxide`
 * @homepage https://crates.io/crates/zoxide
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiozoxide
 * console.log(pkg.name)        // "zoxide"
 * console.log(pkg.description) // "Shell extension to navigate your filesystem faster"
 * console.log(pkg.programs)    // ["zoxide"]
 * console.log(pkg.versions[0]) // "0.9.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/zoxide.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiozoxidePackage = {
  /**
  * The display name of this package.
  */
  name: 'zoxide' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/zoxide' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Shell extension to navigate your filesystem faster' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/zoxide/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/zoxide' as const,
  githubUrl: 'https://github.com/ajeetdsouza/zoxide' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/zoxide' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/zoxide -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/zoxide' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'zoxide',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.9.9',
    '0.9.8',
    '0.9.7',
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiozoxidePackage = typeof cratesiozoxidePackage
