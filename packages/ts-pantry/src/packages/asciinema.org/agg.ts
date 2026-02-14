/**
 * **agg** - Asciicast to GIF converter
 *
 * @domain `asciinema.org/agg`
 * @programs `agg`
 * @version `1.7.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install asciinema.org/agg`
 * @homepage https://docs.asciinema.org/manual/agg/
 * @dependencies `rust-lang.org^1.56`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.asciinemaorgagg
 * console.log(pkg.name)        // "agg"
 * console.log(pkg.description) // "Asciicast to GIF converter"
 * console.log(pkg.programs)    // ["agg"]
 * console.log(pkg.versions[0]) // "1.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/asciinema-org/agg.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const asciinemaorgaggPackage = {
  /**
  * The display name of this package.
  */
  name: 'agg' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'asciinema.org/agg' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Asciicast to GIF converter' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/asciinema.org/agg/package.yml' as const,
  homepageUrl: 'https://docs.asciinema.org/manual/agg/' as const,
  githubUrl: 'https://github.com/asciinema/agg' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install asciinema.org/agg' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +asciinema.org/agg -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install asciinema.org/agg' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'agg',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'rust-lang.org^1.56',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.3',
  ] as const,
  aliases: [] as const,
}

export type AsciinemaorgaggPackage = typeof asciinemaorgaggPackage
