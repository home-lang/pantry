/**
 * **sqlc** - Generate type-safe code from SQL
 *
 * @domain `sqlc.dev`
 * @programs `sqlc`
 * @version `1.30.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sqlc.dev`
 * @homepage https://sqlc.dev/
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.sqlcdev
 * console.log(pkg.name)        // "sqlc"
 * console.log(pkg.description) // "Generate type-safe code from SQL"
 * console.log(pkg.programs)    // ["sqlc"]
 * console.log(pkg.versions[0]) // "1.30.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sqlc-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sqlcdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'sqlc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sqlc.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Generate type-safe code from SQL' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sqlc.dev/package.yml' as const,
  homepageUrl: 'https://sqlc.dev/' as const,
  githubUrl: 'https://github.com/sqlc-dev/sqlc' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sqlc.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sqlc.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install sqlc.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sqlc',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.30.0',
    '1.29.0',
    '1.28.0',
    '1.27.0',
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.0',
    '1.22.0',
    '1.21.0',
    '1.20.0',
    '1.19.1',
    '1.19.0',
    '1.18.0',
    '1.17.2',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type SqlcdevPackage = typeof sqlcdevPackage
