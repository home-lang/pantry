/**
 * **sqlc** - Generate type-safe code from SQL
 *
 * @domain `sqlc.dev`
 * @programs `sqlc`
 * @version `1.30.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sqlc.dev`
 * @homepage https://sqlc.dev/
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sqlcdev
 * console.log(pkg.name)        // "sqlc"
 * console.log(pkg.description) // "Generate type-safe code from SQL"
 * console.log(pkg.programs)    // ["sqlc"]
 * console.log(pkg.versions[0]) // "1.30.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sqlc-dev.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sqlc.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sqlc.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sqlc.dev' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.30.0',
    '1.29.0',
    '1.28.0',
    '1.27.0',
  ] as const,
  aliases: [] as const,
}

export type SqlcdevPackage = typeof sqlcdevPackage
