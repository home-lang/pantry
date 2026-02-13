/**
 * **migrate** - Database migrations. CLI and Golang library.
 *
 * @domain `github.com/golang-migrate/migrate`
 * @programs `migrate`
 * @version `4.19.1` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/golang-migrate/migrate`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomgolangmigratemigrate
 * console.log(pkg.name)        // "migrate"
 * console.log(pkg.description) // "Database migrations. CLI and Golang library."
 * console.log(pkg.programs)    // ["migrate"]
 * console.log(pkg.versions[0]) // "4.19.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/golang-migrate/migrate.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const migratePackage = {
  /**
   * The display name of this package.
   */
  name: 'migrate' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/golang-migrate/migrate' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Database migrations. CLI and Golang library.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/golang-migrate/migrate/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/golang-migrate/migrate' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/golang-migrate/migrate' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/golang-migrate/migrate -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/golang-migrate/migrate' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'migrate',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.19.1',
    '4.19.0',
    '4.18.3',
    '4.18.2',
    '4.18.1',
    '4.18.0',
    '4.17.1',
    '4.17.0',
    '4.16.2',
  ] as const,
  aliases: [] as const,
}

export type MigratePackage = typeof migratePackage
