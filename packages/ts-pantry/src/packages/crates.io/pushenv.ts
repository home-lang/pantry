/**
 * **pushenv** - A CLI utility that reads a .env file before starting a process
 *
 * @domain `crates.io/pushenv`
 * @programs `pushenv`
 * @version `1.1.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/pushenv`
 * @homepage https://crates.io/crates/pushenv
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiopushenv
 * console.log(pkg.name)        // "pushenv"
 * console.log(pkg.description) // "A CLI utility that reads a .env file before sta..."
 * console.log(pkg.programs)    // ["pushenv"]
 * console.log(pkg.versions[0]) // "1.1.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/pushenv.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiopushenvPackage = {
  /**
  * The display name of this package.
  */
  name: 'pushenv' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/pushenv' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A CLI utility that reads a .env file before starting a process' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/pushenv/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/pushenv' as const,
  githubUrl: 'https://github.com/JensGM/pushenv' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/pushenv' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/pushenv -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/pushenv' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'pushenv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.2',
  ] as const,
  aliases: [] as const,
}

export type CratesiopushenvPackage = typeof cratesiopushenvPackage
