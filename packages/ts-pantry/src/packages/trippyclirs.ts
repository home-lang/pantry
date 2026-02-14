/**
 * **trip** - Network diagnostic tool, inspired by mtr
 *
 * @domain `trippy.cli.rs`
 * @programs `trip`
 * @version `0.13.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install trippy.cli.rs`
 * @homepage https://trippy.cli.rs/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.trippyclirs
 * console.log(pkg.name)        // "trip"
 * console.log(pkg.description) // "Network diagnostic tool, inspired by mtr"
 * console.log(pkg.programs)    // ["trip"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/trippy-cli-rs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const trippyclirsPackage = {
  /**
  * The display name of this package.
  */
  name: 'trip' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'trippy.cli.rs' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Network diagnostic tool, inspired by mtr' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/trippy.cli.rs/package.yml' as const,
  homepageUrl: 'https://trippy.cli.rs/' as const,
  githubUrl: 'https://github.com/fujiapple852/trippy' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install trippy.cli.rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +trippy.cli.rs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install trippy.cli.rs' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'trip',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.13.0',
    '0.12.2',
    '0.12.1',
    '0.12.0',
    '0.11.0',
    '0.10.0',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type TrippyclirsPackage = typeof trippyclirsPackage
