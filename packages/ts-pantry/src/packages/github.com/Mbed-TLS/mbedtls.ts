/**
 * **generic_sum** - An open source, portable, easy to use, readable and flexible TLS library, and reference implementation of the PSA Cryptography API. Releases are on a varying cadence, typically around 3 - 6 months between releases.
 *
 * @domain `github.com/Mbed-TLS/mbedtls`
 * @programs `generic_sum`
 * @version `3.6.3.1` (10 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/Mbed-TLS/mbedtls`
 * @homepage https://tls.mbed.org/
 * @buildDependencies `cmake.org`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommbedtlsmbedtls
 * console.log(pkg.name)        // "generic_sum"
 * console.log(pkg.description) // "An open source, portable, easy to use, readable..."
 * console.log(pkg.programs)    // ["generic_sum"]
 * console.log(pkg.versions[0]) // "3.6.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/Mbed-TLS/mbedtls.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mbedtlsPackage = {
  /**
  * The display name of this package.
  */
  name: 'generic_sum' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/Mbed-TLS/mbedtls' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'An open source, portable, easy to use, readable and flexible TLS library, and reference implementation of the PSA Cryptography API. Releases are on a varying cadence, typically around 3 - 6 months between releases.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/Mbed-TLS/mbedtls/package.yml' as const,
  homepageUrl: 'https://tls.mbed.org/' as const,
  githubUrl: 'https://github.com/Mbed-TLS/mbedtls' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/Mbed-TLS/mbedtls' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/Mbed-TLS/mbedtls -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/Mbed-TLS/mbedtls' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'generic_sum',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'cmake.org',
    'python.org@~3.11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '3.6.3.1',
    '3.6.0',
    '3.5.2',
    '3.5.1',
    '3.4.1',
    '3.4.0',
    '2.28.8',
    '2.28.7',
    '2.28.6',
    '2.28.4',
  ] as const,
  aliases: [] as const,
}

export type MbedtlsPackage = typeof mbedtlsPackage
