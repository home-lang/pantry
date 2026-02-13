/**
 * **sqlfluff** - A modular SQL linter and auto-formatter with support for multiple dialects and templated code.
 *
 * @domain `sqlfluff.com`
 * @programs `sqlfluff`
 * @version `4.0.0` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sqlfluff.com`
 * @homepage https://docs.sqlfluff.com/
 * @dependencies `python.org>=3.7<3.12`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sqlfluffcom
 * console.log(pkg.name)        // "sqlfluff"
 * console.log(pkg.description) // "A modular SQL linter and auto-formatter with su..."
 * console.log(pkg.programs)    // ["sqlfluff"]
 * console.log(pkg.versions[0]) // "4.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sqlfluff-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sqlfluffcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'sqlfluff' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sqlfluff.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modular SQL linter and auto-formatter with support for multiple dialects and templated code.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sqlfluff.com/package.yml' as const,
  homepageUrl: 'https://docs.sqlfluff.com/' as const,
  githubUrl: 'https://github.com/sqlfluff/sqlfluff' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sqlfluff.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sqlfluff.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sqlfluff.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sqlfluff',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.7<3.12',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.0.0',
    '3.5.0',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.1',
    '3.1.0',
    '3.0.7',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
  ] as const,
  aliases: [] as const,
}

export type SqlfluffcomPackage = typeof sqlfluffcomPackage
