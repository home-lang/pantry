/**
 * **vcluster** - vCluster - Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better multi-tenancy and isolation than regular namespaces.
 *
 * @domain `vcluster.com`
 * @programs `vcluster`
 * @version `0.30.4` (59 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install vcluster.com`
 * @homepage https://www.vcluster.com
 * @dependencies `kubernetes.io/kubectl^1`, `linux:curl.se/ca-certs` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@^1.21`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.vclustercom
 * console.log(pkg.name)        // "vcluster"
 * console.log(pkg.description) // "vCluster - Create fully functional virtual Kube..."
 * console.log(pkg.programs)    // ["vcluster"]
 * console.log(pkg.versions[0]) // "0.30.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/vcluster-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const vclustercomPackage = {
  /**
   * The display name of this package.
   */
  name: 'vcluster' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'vcluster.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'vCluster - Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the underlying k8s cluster. It\'s cheaper than creating separate full-blown clusters and it offers better multi-tenancy and isolation than regular namespaces.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vcluster.com/package.yml' as const,
  homepageUrl: 'https://www.vcluster.com' as const,
  githubUrl: 'https://github.com/loft-sh/vcluster' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install vcluster.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vcluster.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install vcluster.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vcluster',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'kubernetes.io/kubectl^1',
    'linux:curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@^1.21',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.30.4',
    '0.30.3',
    '0.30.2',
    '0.30.1',
    '0.30.0',
    '0.29.3',
    '0.29.2',
    '0.29.1',
    '0.29.0',
    '0.28.2',
    '0.28.1',
    '0.28.0',
    '0.27.3',
    '0.27.2',
    '0.27.1',
    '0.27.0',
    '0.26.5',
    '0.26.4',
    '0.26.3',
    '0.26.2',
    '0.26.1',
    '0.26.0',
    '0.25.2',
    '0.25.1',
    '0.25.0',
    '0.24.1',
    '0.24.0',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.6',
    '0.22.5',
    '0.22.4',
    '0.22.3',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.6',
    '0.21.5',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.6',
    '0.20.5',
    '0.20.4',
    '0.20.3',
    '0.20.2',
    '0.20.1',
    '0.20.0',
    '0.19.10',
    '0.19.9',
    '0.19.8',
    '0.19.7',
    '0.19.6',
    '0.19.5',
    '0.19.4',
  ] as const,
  aliases: [] as const,
}

export type VclustercomPackage = typeof vclustercomPackage
