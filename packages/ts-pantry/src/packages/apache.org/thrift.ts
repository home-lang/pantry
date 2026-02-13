/**
 * **thrift** - Framework for scalable cross-language services development
 *
 * @domain `apache.org/thrift`
 * @programs `thrift`
 * @version `0.22.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/thrift`
 * @homepage https://thrift.apache.org/
 * @dependencies `openssl.org@1.1`, `zlib.net`
 * @buildDependencies `gnu.org/automake`, `gnu.org/autoconf`, `gnu.org/libtool`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgthrift
 * console.log(pkg.name)        // "thrift"
 * console.log(pkg.description) // "Framework for scalable cross-language services ..."
 * console.log(pkg.programs)    // ["thrift"]
 * console.log(pkg.versions[0]) // "0.22.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/thrift.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgthriftPackage = {
  /**
   * The display name of this package.
   */
  name: 'thrift' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/thrift' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Framework for scalable cross-language services development' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/thrift/package.yml' as const,
  homepageUrl: 'https://thrift.apache.org/' as const,
  githubUrl: 'https://github.com/apache/thrift' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/thrift' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/thrift -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/thrift' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'thrift',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org@1.1',
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/automake',
    'gnu.org/autoconf',
    'gnu.org/libtool',
    'gnu.org/bison',
    'boost.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
    '0.18.1',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgthriftPackage = typeof apacheorgthriftPackage
