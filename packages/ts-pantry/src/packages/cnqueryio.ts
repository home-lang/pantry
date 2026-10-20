/**
 * **cnquery** - open source, cloud-native, graph-based asset inventory
 *
 * @domain `cnquery.io`
 * @programs `cnquery`
 * @version `14.8.0` (114 versions available)
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
 * console.log(pkg.versions[0]) // "14.8.0" (latest)
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
    '14.8.0',
    '14.7.1',
    '14.7.0',
    '14.6.0',
    '14.5.0',
    '14.4.0',
    '14.3.1',
    '14.3.0',
    '14.2.0',
    '14.1.0',
    '14.0.1',
    '14.0.0',
    '13.39.0',
    '13.38.1',
    '13.38.0',
    '13.37.0',
    '13.36.0',
    '13.35.2',
    '13.35.1',
    '13.35.0',
    '13.34.1',
    '13.34.0',
    '13.33.2',
    '13.33.1',
    '13.33.0',
    '13.32.2',
    '13.32.1',
    '13.32.0',
    '13.31.1',
    '13.31.0',
    '13.30.1',
    '13.30.0',
    '13.29.2',
    '13.29.1',
    '13.29.0',
    '13.28.1',
    '13.28.0',
    '13.27.4',
    '13.27.3',
    '13.27.2',
    '13.27.1',
    '13.27.0',
    '13.26.1',
    '13.26.0',
    '13.25.0',
    '13.24.2',
    '13.24.1',
    '13.24.0',
    '13.23.0',
    '13.22.1',
    '13.22.0',
    '13.21.1',
    '13.21.0',
    '13.20.1',
    '13.12.0',
    '13.11.0',
    '13.10.0',
    '13.9.0',
    '13.8.3',
    '13.8.2',
    '13.8.1',
    '13.8.0',
    '13.7.0',
    '13.6.0',
    '13.5.1',
    '13.5.0',
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
