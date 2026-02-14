/**
 * **eks-node-viewer** - EKS Node Viewer
 *
 * @domain `github.com/awslabs/eks-node-viewer`
 * @programs `eks-node-viewer`
 * @version `0.7.4` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/awslabs/eks-node-viewer`
 * @buildDependencies `go.dev@~1.24.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomawslabseksnodeviewer
 * console.log(pkg.name)        // "eks-node-viewer"
 * console.log(pkg.description) // "EKS Node Viewer"
 * console.log(pkg.programs)    // ["eks-node-viewer"]
 * console.log(pkg.versions[0]) // "0.7.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/awslabs/eks-node-viewer.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const eksnodeviewerPackage = {
  /**
  * The display name of this package.
  */
  name: 'eks-node-viewer' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/awslabs/eks-node-viewer' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'EKS Node Viewer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/awslabs/eks-node-viewer/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/awslabs/eks-node-viewer' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/awslabs/eks-node-viewer' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/awslabs/eks-node-viewer -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/awslabs/eks-node-viewer' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'eks-node-viewer',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24.2',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.7.4',
  ] as const,
  aliases: [] as const,
}

export type EksnodeviewerPackage = typeof eksnodeviewerPackage
