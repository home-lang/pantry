/**
 * **libserdes** - Avro Serialization/Deserialization C/C++ library with Confluent schema-registry support
 *
 * @domain `github.com/confluentinc/libserdes`
 * @version `7.5.2.231027084844` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/confluentinc/libserdes`
 * @dependencies `apache.org/avro`, `digip.org/jansson`, `curl.se`
 * @buildDependencies `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomconfluentinclibserdes
 * console.log(pkg.name)        // "libserdes"
 * console.log(pkg.description) // "Avro Serialization/Deserialization C/C++ librar..."
 * console.log(pkg.versions[0]) // "7.5.2.231027084844" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/confluentinc/libserdes.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libserdesPackage = {
  /**
  * The display name of this package.
  */
  name: 'libserdes' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/confluentinc/libserdes' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Avro Serialization/Deserialization C/C++ library with Confluent schema-registry support' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/confluentinc/libserdes/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/confluentinc/libserdes' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/confluentinc/libserdes' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/confluentinc/libserdes -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/confluentinc/libserdes' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'apache.org/avro',
    'digip.org/jansson',
    'curl.se',
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
    '7.5.2.231027084844',
  ] as const,
  aliases: [] as const,
}

export type LibserdesPackage = typeof libserdesPackage
