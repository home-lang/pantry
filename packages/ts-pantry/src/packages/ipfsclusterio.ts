/**
 * **ipfscluster** - pkgx package
 *
 * @domain `ipfscluster.io`
 * @programs `ipfs-cluster-follow`, `ipfs-cluster-ctl`, `ipfs-cluster-service`
 * @version `1.1.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install ipfscluster.io`
 * @buildDependencies `go.dev@~1.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.ipfsclusterio
 * console.log(pkg.name)        // "ipfscluster"
 * console.log(pkg.programs)    // ["ipfs-cluster-follow", "ipfs-cluster-ctl", ...]
 * console.log(pkg.versions[0]) // "1.1.5" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/ipfscluster-io.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install ipfscluster.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ipfscluster.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install ipfscluster.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'ipfs-cluster-follow',
    'ipfs-cluster-ctl',
    'ipfs-cluster-service',
  ] as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '1.1.5',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.8',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.14.5',
    '0.14.4',
    '0.14.3',
    '0.14.2',
    '0.14.1',
  ] as const,
  aliases: [] as const,
}

export type IpfsclusterioPackage = typeof ipfsclusterioPackage
