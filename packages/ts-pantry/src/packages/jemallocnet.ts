/**
 * **jemalloc** - pkgx package
 *
 * @domain `jemalloc.net`
 * @version `5.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install jemalloc.net`
 * @homepage http://jemalloc.net/
 * @buildDependencies `gnu.org/autoconf`, `docbook.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.jemallocnet
 * console.log(pkg.name)        // "jemalloc"
 * console.log(pkg.versions[0]) // "5.3.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/jemalloc-net.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const jemallocnetPackage = {
  /**
  * The display name of this package.
  */
  name: 'jemalloc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'jemalloc.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/jemalloc.net/package.yml' as const,
  homepageUrl: 'http://jemalloc.net/' as const,
  githubUrl: 'https://github.com/jemalloc/jemalloc' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install jemalloc.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jemalloc.net -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install jemalloc.net' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'docbook.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.0',
    '5.0.1',
    '5.0.0',
    '4.5.0',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.1',
    '4.2.0',
    '4.1.1',
    '4.1.0',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.6.0',
    '3.5.1',
    '3.5.0',
    '3.4.1',
    '3.4.0',
    '3.3.1',
    '3.3.0',
    '3.2.0',
    '3.1.0',
    '3.0.0',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.1',
    '2.0.0',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type JemallocnetPackage = typeof jemallocnetPackage
