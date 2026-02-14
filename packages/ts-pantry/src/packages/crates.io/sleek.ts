/**
 * **sleek** - Sleek is a CLI tool for formatting SQL. It helps you maintain a consistent style across your SQL code, enhancing readability and productivity.
 *
 * @domain `crates.io/sleek`
 * @programs `sleek`
 * @version `0.5.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/sleek`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiosleek
 * console.log(pkg.name)        // "sleek"
 * console.log(pkg.description) // "Sleek is a CLI tool for formatting SQL. It help..."
 * console.log(pkg.programs)    // ["sleek"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/sleek.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiosleekPackage = {
  /**
  * The display name of this package.
  */
  name: 'sleek' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/sleek' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Sleek is a CLI tool for formatting SQL. It helps you maintain a consistent style across your SQL code, enhancing readability and productivity.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sleek/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nrempel/sleek' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/sleek' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/sleek -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/sleek' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sleek',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.0',
    '0.4.0',
    '0.3.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiosleekPackage = typeof cratesiosleekPackage
