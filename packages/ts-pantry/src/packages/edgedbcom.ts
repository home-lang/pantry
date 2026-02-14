/**
 * **edgedb** - The EdgeDB CLI
 *
 * @domain `edgedb.com`
 * @programs `edgedb`
 * @version `7.10.2` (44 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install edgedb.com`
 * @homepage https://www.edgedb.com/docs/cli/index
 * @buildDependencies `perl.org@^5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.edgedbcom
 * console.log(pkg.name)        // "edgedb"
 * console.log(pkg.description) // "The EdgeDB CLI"
 * console.log(pkg.programs)    // ["edgedb"]
 * console.log(pkg.versions[0]) // "7.10.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/edgedb-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const edgedbcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'edgedb' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'edgedb.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The EdgeDB CLI' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/edgedb.com/package.yml' as const,
  homepageUrl: 'https://www.edgedb.com/docs/cli/index' as const,
  githubUrl: 'https://github.com/edgedb/edgedb-cli' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install edgedb.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +edgedb.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install edgedb.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'edgedb',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'perl.org@^5',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '7.10.2',
    '7.10.1',
    '7.10.0',
    '7.9.0',
    '7.8.1',
    '7.8.0',
    '7.7.0',
    '7.6.0',
    '7.5.1',
    '7.5.0',
    '7.4.0',
    '7.3.0',
    '7.2.0',
    '7.1.1',
    '7.1.0',
    '7.0.3',
    '7.0.2',
    '7.0.1',
    '7.0.0',
    '6.1.2',
    '6.1.1',
    '6.1.0',
    '6.0.3',
    '6.0.2',
    '6.0.1',
    '6.0.0',
    '5.5.2',
    '5.5.1',
    '5.5.0',
    '5.4.1',
    '5.4.0',
    '5.3.0',
    '5.2.3',
    '5.2.2',
    '5.2.1',
    '5.2.0',
    '5.1.0',
    '5.0.0',
    '4.1.1',
    '4.1.0',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.5.0',
  ] as const,
  aliases: [] as const,
}

export type EdgedbcomPackage = typeof edgedbcomPackage
