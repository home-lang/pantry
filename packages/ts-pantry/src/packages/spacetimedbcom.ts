/**
 * **spacetime** - Multiplayer at the speed of light
 *
 * @domain `spacetimedb.com`
 * @programs `spacetime`
 * @version `2023.12.8` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install spacetimedb.com`
 * @homepage https://spacetimedb.com
 * @dependencies `openssl.org^1`
 * @buildDependencies `cmake.org@^3`, `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.spacetimedbcom
 * console.log(pkg.name)        // "spacetime"
 * console.log(pkg.description) // "Multiplayer at the speed of light"
 * console.log(pkg.programs)    // ["spacetime"]
 * console.log(pkg.versions[0]) // "2023.12.8" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/spacetimedb-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install spacetimedb.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +spacetimedb.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install spacetimedb.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.12.8',
    '2023.8.12',
    '2.1.0',
    '2.0.5',
    '2.0.4',
    '2.0.3',
    '2.0.2',
    '2.0.1',
    '1.12.0',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.0',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.1',
    '1.0.0',
    '1.0.0-rc3-hotfix7',
    '1.0.0-rc2-hotfix2',
    '1.0.0-rc1-hotfix1',
    '0.12.0-beta',
    '0.11.1-beta',
    '0.11.0-beta',
    '0.10.1-beta',
    '0.10.0-beta',
    '0.9.2-beta',
    '0.9.1-beta',
    '0.9.0-beta',
    '0.8.2-beta-hotfix7',
    '0.8.1-beta',
    '0.8.0-beta',
    '0.7.3-beta-hotfix1',
    '0.7.2-beta',
    '0.7.1-beta-hotfix1',
    '0.7.0-beta',
    '0.6.1-beta',
    '0.6.0-beta',
  ] as const,
  aliases: [] as const,
}

export type SpacetimedbcomPackage = typeof spacetimedbcomPackage
