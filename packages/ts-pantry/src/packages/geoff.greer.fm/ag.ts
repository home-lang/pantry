/**
 * **The Silver Searcher** - A code-searching tool similar to ack, but faster.
 *
 * @domain `geoff.greer.fm/ag`
 * @programs `ag`
 * @version `2.2.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install geoff.greer.fm/ag`
 * @homepage http://geoff.greer.fm/ag/
 * @dependencies `pcre.org^8`, `tukaani.org/xz^5.4.5`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.geoffgreerfmag
 * console.log(pkg.name)        // "The Silver Searcher"
 * console.log(pkg.description) // "A code-searching tool similar to ack, but faster."
 * console.log(pkg.programs)    // ["ag"]
 * console.log(pkg.versions[0]) // "2.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/geoff-greer-fm/ag.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const geoffgreerfmagPackage = {
  /**
  * The display name of this package.
  */
  name: 'The Silver Searcher' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'geoff.greer.fm/ag' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A code-searching tool similar to ack, but faster.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/geoff.greer.fm/ag/package.yml' as const,
  homepageUrl: 'http://geoff.greer.fm/ag/' as const,
  githubUrl: 'https://github.com/ggreer/the_silver_searcher' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install geoff.greer.fm/ag' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +geoff.greer.fm/ag -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install geoff.greer.fm/ag' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ag',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'pcre.org^8',
    'tukaani.org/xz^5.4.5',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.2.0',
  ] as const,
  aliases: [] as const,
}

export type GeoffgreerfmagPackage = typeof geoffgreerfmagPackage
