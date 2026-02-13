/**
 * **topgrade** - Upgrade all the things
 *
 * @domain `crates.io/topgrade`
 * @programs `topgrade`
 * @version `16.8.0` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/topgrade`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotopgrade
 * console.log(pkg.name)        // "topgrade"
 * console.log(pkg.description) // "Upgrade all the things"
 * console.log(pkg.programs)    // ["topgrade"]
 * console.log(pkg.versions[0]) // "16.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/topgrade.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotopgradePackage = {
  /**
   * The display name of this package.
   */
  name: 'topgrade' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/topgrade' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Upgrade all the things' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/topgrade/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/topgrade-rs/topgrade' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/topgrade' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/topgrade -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/topgrade' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'topgrade',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '16.8.0',
    '16.7.0',
    '16.6.1',
    '16.6.0',
    '16.5.0',
    '16.4.2',
    '16.3.0',
    '16.2.1',
    '16.2.0',
    '16.1.2',
    '16.1.1',
    '16.1.0',
    '16.0.4',
    '16.0.3',
    '16.0.2',
    '16.0.1',
    '16.0.0',
    '15.0.0',
    '14.0.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiotopgradePackage = typeof cratesiotopgradePackage
