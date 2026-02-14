/**
 * **dgraph** - high-performance graph database for real-time use cases
 *
 * @domain `dgraph.io`
 * @programs `dgraph`
 * @version `25.2.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install dgraph.io`
 * @homepage https://dgraph.io/docs
 * @buildDependencies `go.dev@~1.22.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.dgraphio
 * console.log(pkg.name)        // "dgraph"
 * console.log(pkg.description) // "high-performance graph database for real-time u..."
 * console.log(pkg.programs)    // ["dgraph"]
 * console.log(pkg.versions[0]) // "25.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/dgraph-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const dgraphioPackage = {
  /**
  * The display name of this package.
  */
  name: 'dgraph' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'dgraph.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'high-performance graph database for real-time use cases' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/dgraph.io/package.yml' as const,
  homepageUrl: 'https://dgraph.io/docs' as const,
  githubUrl: 'https://github.com/dgraph-io/dgraph' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install dgraph.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +dgraph.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install dgraph.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dgraph',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.22.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '25.2.0',
    '25.1.0',
    '25.0.0',
    '24.1.4',
    '24.1.3',
    '24.1.2',
    '24.1.1',
    '24.1.0',
    '24.0.5',
    '24.0.4',
    '24.0.2',
    '24.0.1',
    '24.0.0',
    '23.1.1',
    '23.1.0',
  ] as const,
  aliases: [] as const,
}

export type DgraphioPackage = typeof dgraphioPackage
