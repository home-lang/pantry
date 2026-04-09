/**
 * **cnquery** - open source, cloud-native, graph-based asset inventory
 *
 * @domain `cnquery.io`
 * @programs `cnquery`
 * @version `13.1.1` (203 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install cnquery.io`
 * @homepage https://cnquery.io
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.cnqueryio
 * console.log(pkg.name)        // "cnquery"
 * console.log(pkg.description) // "open source, cloud-native, graph-based asset in..."
 * console.log(pkg.programs)    // ["cnquery"]
 * console.log(pkg.versions[0]) // "13.1.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/cnquery-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const cnqueryioPackage = {
  /**
  * The display name of this package.
  */
  name: 'cnquery' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'cnquery.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'open source, cloud-native, graph-based asset inventory' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cnquery.io/package.yml' as const,
  homepageUrl: 'https://cnquery.io' as const,
  githubUrl: 'https://github.com/mondoohq/cnquery' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install cnquery.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cnquery.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install cnquery.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cnquery',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '13.4.1',
    '13.4.0',
    '13.3.4',
    '13.3.3',
    '13.3.2',
    '13.3.1',
    '13.3.0',
    '13.2.0',
    '13.1.1',
    '13.1.0',
    '13.0.1',
    '13.0.0',
    '12.23.1',
    '12.23.0',
    '12.22.0',
    '12.21.0',
    '12.20.1',
    '12.20.0',
    '12.19.2',
    '12.19.1',
    '12.19.0',
    '12.18.0',
    '12.17.0',
    '12.16.0',
    '12.15.0',
    '12.14.2',
    '12.14.1',
    '12.14.0',
    '12.13.2',
    '12.13.1',
    '12.13.0',
    '12.12.1',
    '12.12.0',
    '12.11.0',
    '12.10.0',
    '12.9.0',
    '12.8.0',
    '12.7.1',
    '12.7.0',
    '12.6.0',
    '12.5.1',
    '12.5.0',
    '12.4.0',
    '12.3.0',
    '12.2.1',
    '12.2.0',
    '12.1.0',
    '12.0.0',
  ] as const,
  aliases: [] as const,
}

export type CnqueryioPackage = typeof cnqueryioPackage
