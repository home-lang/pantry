/**
 * **jemalloc** - pkgx package
 *
 * @domain `jemalloc.net`
 * @version `5.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install jemalloc.net`
 * @homepage http://jemalloc.net/
 * @buildDependencies `gnu.org/autoconf`, `docbook.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.jemallocnet
 * console.log(pkg.name)        // "jemalloc"
 * console.log(pkg.versions[0]) // "5.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/jemalloc-net.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install jemalloc.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +jemalloc.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install jemalloc.net' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.3.0',
  ] as const,
  aliases: [] as const,
}

export type JemallocnetPackage = typeof jemallocnetPackage
