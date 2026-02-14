/**
 * **ipfscluster** - pkgx package
 *
 * @domain `ipfscluster.io`
 * @version `1.1.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ipfscluster.io`
 * @buildDependencies `go.dev@~1.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ipfsclusterio
 * console.log(pkg.name)        // "ipfscluster"
 * console.log(pkg.versions[0]) // "1.1.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ipfscluster-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ipfsclusterioPackage = {
  /**
  * The display name of this package.
  */
  name: 'ipfscluster' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ipfscluster.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ipfscluster.io/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ipfscluster.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ipfscluster.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ipfscluster.io' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.5',
    '1.1.4',
  ] as const,
  aliases: [] as const,
}

export type IpfsclusterioPackage = typeof ipfsclusterioPackage
