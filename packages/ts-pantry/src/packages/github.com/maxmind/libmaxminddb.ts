/**
 * **mmdblookup** - C library for the MaxMind DB file format
 *
 * @domain `github.com/maxmind/libmaxminddb`
 * @programs `mmdblookup`
 * @version `1.12.2` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/maxmind/libmaxminddb`
 * @homepage https://maxmind.github.io/libmaxminddb/
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommaxmindlibmaxminddb
 * console.log(pkg.name)        // "mmdblookup"
 * console.log(pkg.description) // "C library for the MaxMind DB file format"
 * console.log(pkg.programs)    // ["mmdblookup"]
 * console.log(pkg.versions[0]) // "1.12.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/maxmind/libmaxminddb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libmaxminddbPackage = {
  /**
  * The display name of this package.
  */
  name: 'mmdblookup' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/maxmind/libmaxminddb' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C library for the MaxMind DB file format' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/maxmind/libmaxminddb/package.yml' as const,
  homepageUrl: 'https://maxmind.github.io/libmaxminddb/' as const,
  githubUrl: 'https://github.com/maxmind/libmaxminddb' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/maxmind/libmaxminddb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/maxmind/libmaxminddb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/maxmind/libmaxminddb' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mmdblookup',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/libtool',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.1',
  ] as const,
  aliases: [] as const,
}

export type LibmaxminddbPackage = typeof libmaxminddbPackage
