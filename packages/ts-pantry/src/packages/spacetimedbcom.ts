/**
 * **spacetime** - Multiplayer at the speed of light
 *
 * @domain `spacetimedb.com`
 * @programs `spacetime`
 * @version `2023.12.8` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install spacetimedb.com`
 * @homepage https://spacetimedb.com
 * @dependencies `openssl.org^1`
 * @buildDependencies `cmake.org@^3`, `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.spacetimedbcom
 * console.log(pkg.name)        // "spacetime"
 * console.log(pkg.description) // "Multiplayer at the speed of light"
 * console.log(pkg.programs)    // ["spacetime"]
 * console.log(pkg.versions[0]) // "2023.12.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/spacetimedb-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const spacetimedbcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'spacetime' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'spacetimedb.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Multiplayer at the speed of light' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/spacetimedb.com/package.yml' as const,
  homepageUrl: 'https://spacetimedb.com' as const,
  githubUrl: 'https://github.com/clockworklabs/SpacetimeDB' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install spacetimedb.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +spacetimedb.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install spacetimedb.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'spacetime',
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
    'cmake.org@^3',
    'perl.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.12.8',
    '2023.8.12',
  ] as const,
  aliases: [] as const,
}

export type SpacetimedbcomPackage = typeof spacetimedbcomPackage
