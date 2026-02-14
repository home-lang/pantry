/**
 * **kcat** - Generic command line non-JVM Apache Kafka producer and consumer
 *
 * @domain `github.com/edenhill/kcat`
 * @programs `kcat`
 * @version `1.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/edenhill/kcat`
 * @dependencies `apache.org/avro`, `github.com/confluentinc/librdkafka`, `github.com/confluentinc/libserdes`, ... (+1 more)
 * @buildDependencies `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomedenhillkcat
 * console.log(pkg.name)        // "kcat"
 * console.log(pkg.description) // "Generic command line non-JVM Apache Kafka produ..."
 * console.log(pkg.programs)    // ["kcat"]
 * console.log(pkg.versions[0]) // "1.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/edenhill/kcat.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kcatPackage = {
  /**
  * The display name of this package.
  */
  name: 'kcat' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/edenhill/kcat' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Generic command line non-JVM Apache Kafka producer and consumer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/edenhill/kcat/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/edenhill/kcat' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/edenhill/kcat' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/edenhill/kcat -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/edenhill/kcat' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kcat',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'apache.org/avro',
    'github.com/confluentinc/librdkafka',
    'github.com/confluentinc/libserdes',
    'lloyd.github.io/yajl',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.7.0',
  ] as const,
  aliases: [] as const,
}

export type KcatPackage = typeof kcatPackage
