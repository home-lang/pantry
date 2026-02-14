/**
 * **rg** - ripgrep recursively searches directories for a regex pattern while respecting your gitignore
 *
 * @domain `crates.io/ripgrep`
 * @programs `rg`
 * @version `15.1.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/ripgrep`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioripgrep
 * console.log(pkg.name)        // "rg"
 * console.log(pkg.description) // "ripgrep recursively searches directories for a ..."
 * console.log(pkg.programs)    // ["rg"]
 * console.log(pkg.versions[0]) // "15.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ripgrep.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioripgrepPackage = {
  /**
  * The display name of this package.
  */
  name: 'rg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/ripgrep' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'ripgrep recursively searches directories for a regex pattern while respecting your gitignore' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ripgrep/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/BurntSushi/ripgrep' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/ripgrep' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ripgrep -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/ripgrep' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rg',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '15.1.0',
    '15.0.0',
    '14.1.1',
    '14.1.0',
    '14.0.3',
    '14.0.2',
    '14.0.1',
    '14.0.0',
    '13.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioripgrepPackage = typeof cratesioripgrepPackage
