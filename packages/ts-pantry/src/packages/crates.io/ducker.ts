/**
 * **ducker** - A slightly quackers Docker TUI based on k9s 🦆
 *
 * @domain `crates.io/ducker`
 * @programs `ducker`
 * @version `0.6.3` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/ducker`
 * @homepage https://crates.io/crates/ducker
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioducker
 * console.log(pkg.name)        // "ducker"
 * console.log(pkg.description) // "A slightly quackers Docker TUI based on k9s 🦆"
 * console.log(pkg.programs)    // ["ducker"]
 * console.log(pkg.versions[0]) // "0.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ducker.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioduckerPackage = {
  /**
  * The display name of this package.
  */
  name: 'ducker' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/ducker' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A slightly quackers Docker TUI based on k9s 🦆' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ducker/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/ducker' as const,
  githubUrl: 'https://github.com/robertpsoane/ducker' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/ducker' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ducker -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/ducker' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ducker',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.7',
    '0.5.6',
    '0.5.5',
    '0.5.4',
    '0.5.3',
    '0.5.2',
    '0.5.1',
    '0.5.0',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.1',
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioduckerPackage = typeof cratesioduckerPackage
