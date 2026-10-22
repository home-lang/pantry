/**
 * **alembic** - A database migrations tool for SQLAlchemy.
 *
 * @domain `alembic.sqlalchemy.org`
 * @programs `alembic`
 * @version `1.20.1` (52 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install alembic.sqlalchemy.org`
 * @dependencies `pkgx.sh>=1`
 * @buildDependencies `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.alembicsqlalchemyorg
 * console.log(pkg.name)        // "alembic"
 * console.log(pkg.description) // "A database migrations tool for SQLAlchemy."
 * console.log(pkg.programs)    // ["alembic"]
 * console.log(pkg.versions[0]) // "1.20.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/alembic-sqlalchemy-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install alembic.sqlalchemy.org' as const,
  pantryInstallCommand: 'pantry install alembic.sqlalchemy.org' as const,
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
    'pkgx.sh>=1',
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.20.1',
    '1.20.0',
    '1.19.2',
    '1.19.1',
    '1.19.0',
    '1.18.5',
    '1.18.4',
    '1.18.3',
    '1.18.2',
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
    '1.15.0',
    '1.14.1',
    '1.14.0',
    '1.13.3',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.1',
    '1.12.0',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.11.0',
    '1.10.4',
    '1.10.3',
    '1.10.2',
    '1.10.1',
    '1.10.0',
    '1.9.4',
    '1.9.3',
    '1.9.2',
    '1.9.1',
    '1.9.0',
    '1.8.1',
    '1.8.0',
    '1.7.7',
    '1.7.6',
    '1.7.5',
    '1.7.4',
    '1.7.3',
  ] as const,
  aliases: [] as const,
}

export type AlembicsqlalchemyorgPackage = typeof alembicsqlalchemyorgPackage
