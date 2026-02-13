/**
 * **psycopg2** - PostgreSQL database adapter for the Python programming language
 *
 * @domain `psycopg.org/psycopg2`
 * @version `2.9.11` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install psycopg.org/psycopg2`
 * @homepage https://www.psycopg.org/
 * @dependencies `python.org~3.11`, `postgresql.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.psycopgorgpsycopg2
 * console.log(pkg.name)        // "psycopg2"
 * console.log(pkg.description) // "PostgreSQL database adapter for the Python prog..."
 * console.log(pkg.versions[0]) // "2.9.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/psycopg-org/psycopg2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const psycopgorgpsycopg2Package = {
  /**
   * The display name of this package.
   */
  name: 'psycopg2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'psycopg.org/psycopg2' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'PostgreSQL database adapter for the Python programming language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/psycopg.org/psycopg2/package.yml' as const,
  homepageUrl: 'https://www.psycopg.org/' as const,
  githubUrl: 'https://github.com/psycopg/psycopg2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install psycopg.org/psycopg2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +psycopg.org/psycopg2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install psycopg.org/psycopg2' as const,
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
    '2.9.11',
    '2.9.10',
    '2.9.9',
  ] as const,
  aliases: [] as const,
}

export type Psycopgorgpsycopg2Package = typeof psycopgorgpsycopg2Package
