/**
 * **asciinema** - Record and share terminal sessions
 *
 * @domain `asciinema.org`
 * @programs `asciinema`
 * @version `3.1.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install asciinema.org`
 * @homepage https://asciinema.org
 * @dependencies `python.org^3.12 # v2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.asciinemaorg
 * console.log(pkg.name)        // "asciinema"
 * console.log(pkg.description) // "Record and share terminal sessions"
 * console.log(pkg.programs)    // ["asciinema"]
 * console.log(pkg.versions[0]) // "3.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/asciinema-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const asciinemaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'asciinema' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'asciinema.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Record and share terminal sessions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/asciinema.org/package.yml' as const,
  homepageUrl: 'https://asciinema.org' as const,
  githubUrl: 'https://github.com/asciinema/asciinema' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install asciinema.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +asciinema.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install asciinema.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'asciinema',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org^3.12 # v2',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.1.0',
    '3.0.1',
    '3.0.0',
    '2.4.0',
  ] as const,
  aliases: [] as const,
}

export type AsciinemaorgPackage = typeof asciinemaorgPackage
