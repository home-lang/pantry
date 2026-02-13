/**
 * **psycopg3** - New generation PostgreSQL database adapter for the Python programming language
 *
 * @domain `psycopg.org/psycopg3`
 * @version `3.3.2` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install psycopg.org/psycopg3`
 * @homepage https://www.psycopg.org/psycopg3/
 * @dependencies `python.org~3.11`, `postgresql.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.psycopgorgpsycopg3
 * console.log(pkg.name)        // "psycopg3"
 * console.log(pkg.description) // "New generation PostgreSQL database adapter for ..."
 * console.log(pkg.versions[0]) // "3.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/psycopg-org/psycopg3.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const psycopgorgpsycopg3Package = {
  /**
   * The display name of this package.
   */
  name: 'psycopg3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'psycopg.org/psycopg3' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'New generation PostgreSQL database adapter for the Python programming language ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/psycopg.org/psycopg3/package.yml' as const,
  homepageUrl: 'https://www.psycopg.org/psycopg3/' as const,
  githubUrl: 'https://github.com/psycopg/psycopg' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install psycopg.org/psycopg3' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +psycopg.org/psycopg3 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install psycopg.org/psycopg3' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
    'postgresql.org',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.3.2',
    '3.3.1',
    '3.3.0',
    '3.2.13',
    '3.2.12',
    '3.2.11',
    '3.2.10',
    '3.2.9',
    '3.2.8',
    '3.2.7',
    '3.2.6',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
  ] as const,
  aliases: [] as const,
}

export type Psycopgorgpsycopg3Package = typeof psycopgorgpsycopg3Package
