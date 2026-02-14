/**
 * **tmate** - Instant Terminal Sharing
 *
 * @domain `tmate.io`
 * @programs `tmate`
 * @version `2.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install tmate.io`
 * @homepage https://tmate.io/
 * @dependencies `libevent.org^2.0`, `invisible-island.net/ncurses@6`, `msgpack.org@6`, ... (+1 more)
 * @buildDependencies `gnu.org/bison`, `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.tmateio
 * console.log(pkg.name)        // "tmate"
 * console.log(pkg.description) // "Instant Terminal Sharing"
 * console.log(pkg.programs)    // ["tmate"]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/tmate-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tmateioPackage = {
  /**
  * The display name of this package.
  */
  name: 'tmate' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'tmate.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Instant Terminal Sharing' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/tmate.io/package.yml' as const,
  homepageUrl: 'https://tmate.io/' as const,
  githubUrl: 'https://github.com/tmate-io/tmate' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install tmate.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +tmate.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install tmate.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tmate',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libevent.org^2.0',
    'invisible-island.net/ncurses@6',
    'msgpack.org@6',
    'libssh.org@0',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/bison',
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.0',
  ] as const,
  aliases: [] as const,
}

export type TmateioPackage = typeof tmateioPackage
