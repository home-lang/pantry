/**
 * **sk** - Fuzzy Finder in rust!
 *
 * @domain `crates.io/skim`
 * @programs `sk`
 * @version `1.5.3` (44 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/skim`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioskim
 * console.log(pkg.name)        // "sk"
 * console.log(pkg.description) // "Fuzzy Finder in rust!"
 * console.log(pkg.programs)    // ["sk"]
 * console.log(pkg.versions[0]) // "1.5.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/skim.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioskimPackage = {
  /**
   * The display name of this package.
   */
  name: 'sk' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/skim' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Fuzzy Finder in rust!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/skim/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/lotabout/skim' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/skim' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/skim -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/skim' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sk',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.0',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.1',
    '0.20.5',
    '0.20.4',
    '0.20.3',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.0',
    '0.18.0',
    '0.17.3',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.2',
    '0.16.1',
    '0.16.0',
    '0.15.7',
    '0.15.6',
    '0.15.5',
    '0.15.4',
    '0.15.3',
    '0.15.2',
    '0.15.1',
    '0.15.0',
    '0.14.4',
    '0.14.3',
    '0.13.0',
    '0.12.0',
    '0.11.12',
    '0.11.11',
    '0.11.10',
    '0.10.4',
  ] as const,
  aliases: [] as const,
}

export type CratesioskimPackage = typeof cratesioskimPackage
