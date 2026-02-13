/**
 * **stern** - ⎈ Multi pod and container log tailing for Kubernetes -- Friendly fork of https://github.com/wercker/stern
 *
 * @domain `github.com/stern/stern`
 * @programs `stern`
 * @version `1.33.1` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/stern/stern`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomsternstern
 * console.log(pkg.name)        // "stern"
 * console.log(pkg.description) // "⎈ Multi pod and container log tailing for Kuber..."
 * console.log(pkg.programs)    // ["stern"]
 * console.log(pkg.versions[0]) // "1.33.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/stern/stern.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sternPackage = {
  /**
   * The display name of this package.
   */
  name: 'stern' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/stern/stern' as const,
  /**
   * Brief description of what this package does.
   */
  description: '⎈ Multi pod and container log tailing for Kubernetes -- Friendly fork of https://github.com/wercker/stern' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/stern/stern/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/stern/stern' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/stern/stern' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/stern/stern -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/stern/stern' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'stern',
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
    '1.33.1',
    '1.33.0',
    '1.32.0',
    '1.31.0',
    '1.30.0',
    '1.29.0',
    '1.28.0',
    '1.27.0',
    '1.26.0',
  ] as const,
  aliases: [] as const,
}

export type SternPackage = typeof sternPackage
