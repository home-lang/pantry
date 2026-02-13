/**
 * **canonical/pebble** - Pebble is a lightweight Linux service manager with layered configuration and an HTTP API.
 *
 * @domain `github.com/canonical/pebble`
 * @programs `pebble`
 * @version `1.27.0` (36 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/canonical/pebble`
 * @homepage https://canonical-pebble.readthedocs-hosted.com/
 * @buildDependencies `go.dev`, `gnu.org/sed`, `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcanonicalpebble
 * console.log(pkg.name)        // "canonical/pebble"
 * console.log(pkg.description) // "Pebble is a lightweight Linux service manager w..."
 * console.log(pkg.programs)    // ["pebble"]
 * console.log(pkg.versions[0]) // "1.27.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/canonical/pebble.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const pebblePackage = {
  /**
   * The display name of this package.
   */
  name: 'canonical/pebble' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/canonical/pebble' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Pebble is a lightweight Linux service manager with layered configuration and an HTTP API.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/canonical/pebble/package.yml' as const,
  homepageUrl: 'https://canonical-pebble.readthedocs-hosted.com/' as const,
  githubUrl: 'https://github.com/canonical/pebble' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/canonical/pebble' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/canonical/pebble -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/canonical/pebble' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pebble',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
    'gnu.org/sed',
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.2',
    '1.22.1',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.1',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.1',
    '1.9.0',
    '1.8.0',
    '1.7.4',
    '1.7.3',
    '1.7.2',
    '1.7.1',
    '1.7.0',
    '1.4.2',
    '1.4.1',
    '1.1.1',
  ] as const,
  aliases: [] as const,
}

export type PebblePackage = typeof pebblePackage
