/**
 * **avro** - Apache Avro is a data serialization system.
 *
 * @domain `apache.org/avro`
 * @programs `avroappend`, `avrocat`, `avromod`, `avropipe`
 * @version `1.12.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install apache.org/avro`
 * @homepage https://avro.apache.org/
 * @dependencies `digip.org/jansson`, `google.github.io/snappy`, `tukaani.org/xz`, ... (+1 more)
 * @buildDependencies `gnu.org/tar`, `curl.se`, `cmake.org`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.apacheorgavro
 * console.log(pkg.name)        // "avro"
 * console.log(pkg.description) // "Apache Avro is a data serialization system."
 * console.log(pkg.programs)    // ["avroappend", "avrocat", ...]
 * console.log(pkg.versions[0]) // "1.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/apache-org/avro.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const apacheorgavroPackage = {
  /**
   * The display name of this package.
   */
  name: 'avro' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'apache.org/avro' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Apache Avro is a data serialization system.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/apache.org/avro/package.yml' as const,
  homepageUrl: 'https://avro.apache.org/' as const,
  githubUrl: 'https://github.com/apache/avro' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install apache.org/avro' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +apache.org/avro -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install apache.org/avro' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'avroappend',
    'avrocat',
    'avromod',
    'avropipe',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'digip.org/jansson',
    'google.github.io/snappy',
    'tukaani.org/xz',
    'zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/tar',
    'curl.se',
    'cmake.org',
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.0',
    '1.11.3',
  ] as const,
  aliases: [] as const,
}

export type ApacheorgavroPackage = typeof apacheorgavroPackage
