/**
 * **pqrs** - Command line tool for inspecting Parquet files
 *
 * @domain `crates.io/pqrs`
 * @programs `pqrs`
 * @version `0.3.2` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/pqrs`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiopqrs
 * console.log(pkg.name)        // "pqrs"
 * console.log(pkg.description) // "Command line tool for inspecting Parquet files"
 * console.log(pkg.programs)    // ["pqrs"]
 * console.log(pkg.versions[0]) // "0.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/pqrs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiopqrsPackage = {
  /**
  * The display name of this package.
  */
  name: 'pqrs' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/pqrs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Command line tool for inspecting Parquet files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pqrs/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/manojkarthick/pqrs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/pqrs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/pqrs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/pqrs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pqrs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.2',
    '0.3.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiopqrsPackage = typeof cratesiopqrsPackage
