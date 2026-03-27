/**
 * **depot** - 🖥️ Depot CLI, build your Docker images in the cloud
 *
 * @domain `depot.dev`
 * @programs `depot`
 * @version `2.101.29` (103 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install depot.dev`
 * @homepage https://depot.dev
 * @buildDependencies `go.dev@~1.21`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.depotdev
 * console.log(pkg.name)        // "depot"
 * console.log(pkg.description) // "🖥️ Depot CLI, build your Docker images in the ..."
 * console.log(pkg.programs)    // ["depot"]
 * console.log(pkg.versions[0]) // "2.101.29" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/depot-dev.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const depotdevPackage = {
  /**
  * The display name of this package.
  */
  name: 'depot' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'depot.dev' as const,
  /**
  * Brief description of what this package does.
  */
  description: '🖥️ Depot CLI, build your Docker images in the cloud' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/depot.dev/package.yml' as const,
  homepageUrl: 'https://depot.dev' as const,
  githubUrl: 'https://github.com/depot/cli' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install depot.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +depot.dev -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install depot.dev' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'depot',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.21',
    'gnu.org/coreutils',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.101.33',
    '2.101.32',
    '2.101.31',
    '2.101.30',
    '2.101.29',
    '2.101.28',
    '2.101.27',
    '2.101.26',
    '2.101.25',
    '2.101.24',
    '2.101.23',
    '2.101.22',
    '2.101.21',
    '2.101.20',
    '2.101.19',
    '2.101.18',
    '2.101.17',
    '2.101.16',
    '2.101.15',
    '2.101.14',
    '2.101.13',
    '2.101.12',
    '2.101.11',
    '2.101.10',
    '2.101.9',
    '2.101.8',
    '2.101.7',
    '2.101.6',
    '2.101.5',
    '2.101.4',
    '2.101.3',
    '2.101.2',
    '2.101.1',
    '2.101.0',
    '2.100.14',
    '2.100.13',
    '2.100.12',
    '2.100.11',
    '2.100.10',
    '2.100.9',
    '2.100.8',
    '2.100.7',
    '2.100.6',
    '2.100.5',
    '2.100.4',
    '2.100.3',
    '2.100.2',
    '2.100.1',
    '2.100.0',
    '2.99.1',
    '2.99.0',
    '2.98.1',
    '2.98.0',
    '2.97.1',
  ] as const,
  aliases: [] as const,
}

export type DepotdevPackage = typeof depotdevPackage
