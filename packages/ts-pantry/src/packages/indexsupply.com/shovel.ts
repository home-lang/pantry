/**
 * **shovel** - An Ethereum to Postgres indexer
 *
 * @domain `indexsupply.com/shovel`
 * @programs `shovel`
 * @version `1.6.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install indexsupply.com/shovel`
 * @homepage https://indexsupply.com/shovel
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.indexsupplycomshovel
 * console.log(pkg.name)        // "shovel"
 * console.log(pkg.description) // "An Ethereum to Postgres indexer"
 * console.log(pkg.programs)    // ["shovel"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/indexsupply-com/shovel.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const indexsupplycomshovelPackage = {
  /**
   * The display name of this package.
   */
  name: 'shovel' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'indexsupply.com/shovel' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An Ethereum to Postgres indexer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/indexsupply.com/shovel/package.yml' as const,
  homepageUrl: 'https://indexsupply.com/shovel' as const,
  githubUrl: 'https://github.com/indexsupply/code' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install indexsupply.com/shovel' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +indexsupply.com/shovel -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install indexsupply.com/shovel' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'shovel',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.0',
    '1.5.0',
    '1.4.0',
    '1.3.0',
    '1.2.0',
    '1.1.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type IndexsupplycomshovelPackage = typeof indexsupplycomshovelPackage
