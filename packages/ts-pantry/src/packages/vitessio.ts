/**
 * **vitess** - Horizontally scalable MySQL: a database clustering system that shards MySQL behind a query router
 *
 * @domain `vitess.io`
 * @programs `mysqlctl`, `mysqlctld`, `vtorc`, `vtctld`, `vtctldclient`, ... (+4 more)
 * @version `24.0.5` (77 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vitess.io`
 * @homepage https://vitess.io
 * @buildDependencies `go.dev@^1.26` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.vitessio
 * console.log(pkg.name)        // "vitess"
 * console.log(pkg.description) // "Horizontally scalable MySQL: a database cluste..."
 * console.log(pkg.programs)    // ["vtgate", "vttablet", ...]
 * console.log(pkg.versions[0]) // "24.0.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/vitess-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const vitessioPackage = {
  /**
  * The display name of this package.
  */
  name: 'vitess' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vitess.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Horizontally scalable MySQL: a database clustering system that shards MySQL behind a query router' as const,
  packageYmlUrl: 'https://github.com/pantry-pm/pantry/tree/main/projects/vitess.io/package.yml' as const,
  homepageUrl: 'https://vitess.io' as const,
  githubUrl: 'https://github.com/vitessio/vitess' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install vitess.io' as const,
  pantryInstallCommand: 'pantry install vitess.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  *
  * A Vitess deployment is several cooperating daemons rather than one
  * server: `vtgate` routes queries, a `vttablet` sits beside every MySQL
  * instance, `vtctld` serves the control plane that `vtctldclient` talks to,
  * and `vtorc` handles failure detection and reparenting.
  */
  programs: [
    'mysqlctl',
    'mysqlctld',
    'vtorc',
    'vtctld',
    'vtctldclient',
    'vtgate',
    'vttablet',
    'vtbackup',
    'vtcombo',
  ] as const,
  /**
  * Packages typically installed alongside this one.
  *
  * Vitess stores its topology in an external key-value store, and manages
  * MySQL instances it does not itself provide. Neither is bundled, so both
  * are listed here rather than as hard dependencies: a cluster may point at
  * an existing etcd or an already-managed MySQL.
  */
  companions: [
    'etcd.io',
    'mysql.com',
  ] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.26',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '24.0.5',
    '24.0.4',
    '24.0.3',
    '24.0.2',
    '24.0.1',
    '24.0.0',
    '23.0.8',
    '23.0.7',
    '23.0.6',
    '23.0.5',
    '23.0.4',
    '23.0.3',
    '23.0.2',
    '23.0.1',
    '23.0.0',
    '22.0.4',
    '22.0.3',
    '22.0.2',
    '22.0.1',
    '22.0.0',
    '21.0.6',
    '21.0.5',
    '21.0.4',
    '21.0.3',
    '21.0.2',
    '21.0.1',
    '21.0.0',
    '20.0.8',
    '20.0.7',
    '20.0.6',
    '20.0.5',
    '20.0.4',
    '20.0.3',
    '20.0.2',
    '20.0.1',
    '20.0.0',
    '19.0.10',
    '19.0.9',
    '19.0.8',
    '19.0.7',
    '19.0.6',
    '19.0.5',
    '19.0.4',
    '19.0.3',
    '19.0.1',
    '19.0.0',
    '18.0.8',
    '18.0.7',
    '18.0.6',
    '18.0.5',
    '18.0.4',
    '18.0.3',
    '18.0.2',
    '18.0.1',
    '18.0.0',
    '17.0.7',
    '17.0.6',
    '17.0.5',
    '17.0.4',
    '17.0.3',
    '17.0.2',
    '17.0.1',
    '17.0.0',
    '16.0.7',
    '16.0.6',
    '16.0.5',
    '16.0.4',
    '16.0.3',
    '16.0.2',
    '16.0.1',
    '16.0.0',
    '15.0.5',
    '15.0.4',
    '15.0.3',
    '15.0.2',
    '15.0.1',
    '15.0.0',
  ] as const,
  aliases: [] as const,
}

export type VitessioPackage = typeof vitessioPackage
