/**
 * **libevent** - Event notification library
 *
 * @domain `libevent.org`
 * @version `2.1.12` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install libevent.org`
 * @homepage https://libevent.org
 * @dependencies `openssl.org^1.1`
 * @buildDependencies `gnu.org/libtool@2`, `gnu.org/automake@1`, `gnu.org/autoconf@2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.libeventorg
 * console.log(pkg.name)        // "libevent"
 * console.log(pkg.description) // "Event notification library"
 * console.log(pkg.versions[0]) // "2.1.12" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/libevent-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install libevent.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libevent.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install libevent.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.12',
    '2.1.11',
    '2.1.10',
    '2.1.8',
    '2.1.6-beta',
    '2.0.22',
    '2.0.21',
    '2.0.20',
    '2.0.19',
    '2.0.18',
    '2.0.17',
    '2.0.16',
    '1.4.15',
  ] as const,
  aliases: [] as const,
}

export type LibeventorgPackage = typeof libeventorgPackage
