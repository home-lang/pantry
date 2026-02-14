/**
 * **unbound** - Unbound is a validating, recursive, and caching DNS resolver.
 *
 * @domain `unbound.net`
 * @programs `unbound`, `unbound-anchor`, `unbound-checkconf`, `unbound-control`, `unbound-control-setup`, ... (+1 more)
 * @version `1.24.2` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install unbound.net`
 * @homepage https://nlnetlabs.nl/unbound
 * @dependencies `openssl.org^1`
 * @buildDependencies `libexpat.github.io`, `github.com/westes/flex`, `gnu.org/bison@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.unboundnet
 * console.log(pkg.name)        // "unbound"
 * console.log(pkg.description) // "Unbound is a validating, recursive, and caching..."
 * console.log(pkg.programs)    // ["unbound", "unbound-anchor", ...]
 * console.log(pkg.versions[0]) // "1.24.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/unbound-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const unboundnetPackage = {
  /**
  * The display name of this package.
  */
  name: 'unbound' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'unbound.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Unbound is a validating, recursive, and caching DNS resolver.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/unbound.net/package.yml' as const,
  homepageUrl: 'https://nlnetlabs.nl/unbound' as const,
  githubUrl: 'https://github.com/NLnetLabs/unbound' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install unbound.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +unbound.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install unbound.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'unbound',
    'unbound-anchor',
    'unbound-checkconf',
    'unbound-control',
    'unbound-control-setup',
    'unbound-host',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'libexpat.github.io',
    'github.com/westes/flex',
    'gnu.org/bison@^3',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.1',
    '1.23.0',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.0',
    '1.19.3',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.1',
  ] as const,
  aliases: [] as const,
}

export type UnboundnetPackage = typeof unboundnetPackage
