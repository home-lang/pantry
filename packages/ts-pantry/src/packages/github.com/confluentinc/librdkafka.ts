/**
 * **librdkafka** - The Apache Kafka C/C++ library
 *
 * @domain `github.com/confluentinc/librdkafka`
 * @version `2.13.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/confluentinc/librdkafka`
 * @dependencies `lz4.org`, `zlib.net`, `openssl.org^1.1`, ... (+2 more)
 * @buildDependencies `python.org@~3.11`, `linux:llvm.org` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomconfluentinclibrdkafka
 * console.log(pkg.name)        // "librdkafka"
 * console.log(pkg.description) // "The Apache Kafka C/C++ library"
 * console.log(pkg.versions[0]) // "2.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/confluentinc/librdkafka.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const librdkafkaPackage = {
  /**
   * The display name of this package.
   */
  name: 'librdkafka' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/confluentinc/librdkafka' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Apache Kafka C/C++ library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/librdkafka/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/confluentinc/librdkafka' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/confluentinc/librdkafka' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/confluentinc/librdkafka -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/confluentinc/librdkafka' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'lz4.org',
    'zlib.net',
    'openssl.org^1.1',
    'facebook.com/zstd',
    'curl.se',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'python.org@~3.11',
    'linux:llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.13.0',
    '2.12.1',
    '2.12.0',
    '2.11.1',
    '2.11.0',
    '2.10.1',
    '2.10.0',
    '2.8.0',
    '2.6.1',
    '2.6.0',
    '2.5.3',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.1',
    '2.2.0',
    '2.1.1',
  ] as const,
  aliases: [] as const,
}

export type LibrdkafkaPackage = typeof librdkafkaPackage
