/**
 * **alembic** - A database migrations tool for SQLAlchemy.
 *
 * @domain `alembic.sqlalchemy.org`
 * @programs `alembic`
 * @version `1.18.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install alembic.sqlalchemy.org`
 * @dependencies `pkgx.sh^1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.alembicsqlalchemyorg
 * console.log(pkg.name)        // "alembic"
 * console.log(pkg.description) // "A database migrations tool for SQLAlchemy."
 * console.log(pkg.programs)    // ["alembic"]
 * console.log(pkg.versions[0]) // "1.18.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/alembic-sqlalchemy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const alembicsqlalchemyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'alembic' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'alembic.sqlalchemy.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A database migrations tool for SQLAlchemy.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/alembic.sqlalchemy.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sqlalchemy/alembic' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install alembic.sqlalchemy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +alembic.sqlalchemy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install alembic.sqlalchemy.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'alembic',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'pkgx.sh^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.18.1',
    '1.18.0',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.5',
    '1.16.4',
    '1.16.3',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.2',
    '1.15.1',
    '1.14.1',
    '1.14.0',
    '1.13.3',
    '1.13.2',
  ] as const,
  aliases: [] as const,
}

export type AlembicsqlalchemyorgPackage = typeof alembicsqlalchemyorgPackage
