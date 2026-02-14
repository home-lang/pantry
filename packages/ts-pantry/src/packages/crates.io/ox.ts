/**
 * **ox** - Independent Rust text editor that runs in your terminal
 *
 * @domain `crates.io/ox`
 * @programs `ox`
 * @version `0.7.7` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/ox`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioox
 * console.log(pkg.name)        // "ox"
 * console.log(pkg.description) // "Independent Rust text editor that runs in your ..."
 * console.log(pkg.programs)    // ["ox"]
 * console.log(pkg.versions[0]) // "0.7.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/ox.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiooxPackage = {
  /**
  * The display name of this package.
  */
  name: 'ox' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/ox' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Independent Rust text editor that runs in your terminal' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/ox/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/curlpipe/ox' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/ox' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/ox -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/ox' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ox',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.7',
    '0.7.6',
  ] as const,
  aliases: [] as const,
}

export type CratesiooxPackage = typeof cratesiooxPackage
