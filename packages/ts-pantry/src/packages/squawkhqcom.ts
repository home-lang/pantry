/**
 * **squawk** - 🐘 linter for PostgreSQL, focused on migrations
 *
 * @domain `squawkhq.com`
 * @programs `squawk`
 * @version `2.44.0` (73 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install squawkhq.com`
 * @homepage https://squawkhq.com
 * @buildDependencies `openssl.org`, `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.squawkhqcom
 * console.log(pkg.name)        // "squawk"
 * console.log(pkg.description) // "🐘 linter for PostgreSQL, focused on migrations"
 * console.log(pkg.programs)    // ["squawk"]
 * console.log(pkg.versions[0]) // "2.44.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/squawkhq-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const squawkhqcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'squawk' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'squawkhq.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🐘 linter for PostgreSQL, focused on migrations' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/squawkhq.com/package.yml' as const,
  homepageUrl: 'https://squawkhq.com' as const,
  githubUrl: 'https://github.com/sbdchd/squawk' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install squawkhq.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +squawkhq.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install squawkhq.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'squawk',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'openssl.org',
    'perl.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.47.0',
    '2.46.0',
    '2.45.0',
    '2.44.0',
    '2.43.0',
    '2.42.0',
    '2.41.0',
    '2.40.1',
    '2.40.0',
    '2.39.0',
    '2.38.0',
    '2.37.0',
    '2.36.0',
    '2.35.0',
    '2.34.0',
    '2.33.2',
    '2.33.1',
    '2.33.0',
    '2.32.0',
    '2.31.0',
    '2.30.0',
    '2.29.0',
    '2.28.1',
    '2.28.0',
    '2.27.0',
    '2.26.0',
    '2.25.1',
    '2.25.0',
    '2.24.0',
    '2.23.0',
    '2.22.0',
    '2.21.1',
    '2.21.0',
    '2.20.0',
    '2.19.0',
    '2.18.0',
    '2.17.0',
    '2.16.0',
    '2.15.0',
    '2.14.0',
    '2.13.0',
    '2.12.0',
    '2.11.0',
    '2.10.0',
    '2.9.0',
    '2.8.0',
    '2.7.0',
    '2.6.0',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.0',
    '2.1.0',
  ] as const,
  aliases: [] as const,
}

export type SquawkhqcomPackage = typeof squawkhqcomPackage
