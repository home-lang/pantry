/**
 * **libevent** - Event notification library
 *
 * @domain `libevent.org`
 * @version `2.1.12` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libevent.org`
 * @homepage https://libevent.org
 * @dependencies `openssl.org^1.1`
 * @buildDependencies `gnu.org/libtool@2`, `gnu.org/automake@1`, `gnu.org/autoconf@2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libeventorg
 * console.log(pkg.name)        // "libevent"
 * console.log(pkg.description) // "Event notification library"
 * console.log(pkg.versions[0]) // "2.1.12" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libevent-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libeventorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'libevent' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libevent.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Event notification library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libevent.org/package.yml' as const,
  homepageUrl: 'https://libevent.org' as const,
  githubUrl: 'https://github.com/libevent/libevent' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libevent.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libevent.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libevent.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/libtool@2',
    'gnu.org/automake@1',
    'gnu.org/autoconf@2',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.12',
  ] as const,
  aliases: [] as const,
}

export type LibeventorgPackage = typeof libeventorgPackage
