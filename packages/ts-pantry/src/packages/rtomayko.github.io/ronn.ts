/**
 * **ronn** - the opposite of roff
 *
 * @domain `rtomayko.github.io/ronn`
 * @programs `ronn`
 * @version `0.7.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rtomayko.github.io/ronn`
 * @homepage http://rtomayko.github.com/ronn/
 * @dependencies `ruby-lang.org^3.1`, `rubygems.org`
 * @buildDependencies `rubygems.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rtomaykogithubioronn
 * console.log(pkg.name)        // "ronn"
 * console.log(pkg.description) // "the opposite of roff"
 * console.log(pkg.programs)    // ["ronn"]
 * console.log(pkg.versions[0]) // "0.7.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rtomayko-github-io/ronn.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rtomaykogithubioronnPackage = {
  /**
  * The display name of this package.
  */
  name: 'ronn' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'rtomayko.github.io/ronn' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'the opposite of roff' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rtomayko.github.io/ronn/package.yml' as const,
  homepageUrl: 'http://rtomayko.github.com/ronn/' as const,
  githubUrl: 'https://github.com/rtomayko/ronn' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install rtomayko.github.io/ronn' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rtomayko.github.io/ronn -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rtomayko.github.io/ronn' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ronn',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'ruby-lang.org^3.1',
    'rubygems.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'rubygems.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.3',
  ] as const,
  aliases: [] as const,
}

export type RtomaykogithubioronnPackage = typeof rtomaykogithubioronnPackage
