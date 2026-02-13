/**
 * **argc** - A Bash CLI framework, also a Bash command runner.
 *
 * @domain `crates.io/argc`
 * @programs `argc`
 * @version `1.23.0` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/argc`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioargc
 * console.log(pkg.name)        // "argc"
 * console.log(pkg.description) // "A Bash CLI framework, also a Bash command runner."
 * console.log(pkg.programs)    // ["argc"]
 * console.log(pkg.versions[0]) // "1.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/argc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioargcPackage = {
  /**
   * The display name of this package.
   */
  name: 'argc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/argc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Bash CLI framework, also a Bash command runner.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/argc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sigoden/argc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/argc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/argc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/argc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'argc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.23.0',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.1',
    '1.20.0',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.0',
    '1.15.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioargcPackage = typeof cratesioargcPackage
