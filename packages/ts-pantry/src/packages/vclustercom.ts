/**
 * **vcluster** - vCluster - Create fully functional virtual Kubernetes clusters - Each vcluster runs inside a namespace of the underlying k8s cluster. It's cheaper than creating separate full-blown clusters and it offers better multi-tenancy and isolation than regular namespaces.
 *
 * @domain `vcluster.com`
 * @programs `vcluster`
 * @version `0.37.4` (51 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vcluster.com`
 * @homepage https://www.vcluster.com
 * @dependencies `kubernetes.io/kubectl^1`, `linux:curl.se/ca-certs` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `go.dev@^1.21`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.vclustercom
 * console.log(pkg.name)        // "vcluster"
 * console.log(pkg.description) // "vCluster - Create fully functional virtual Kube..."
 * console.log(pkg.programs)    // ["vcluster"]
 * console.log(pkg.versions[0]) // "0.37.4" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/vcluster-com.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install vcluster.com' as const,
  pantryInstallCommand: 'pantry install vcluster.com' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.37.4',
    '0.37.3',
    '0.37.2',
    '0.37.1',
    '0.37.0',
    '0.36.3',
    '0.36.2',
    '0.36.1',
    '0.36.0',
    '0.35.4',
    '0.35.3',
    '0.35.2',
    '0.35.1',
    '0.35.0',
    '0.34.8',
    '0.34.7',
    '0.34.6',
    '0.34.5',
    '0.34.4',
    '0.34.3',
    '0.34.2',
    '0.34.1',
    '0.34.0',
    '0.33.4',
    '0.33.3',
    '0.33.2',
    '0.33.1',
    '0.33.0',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.3',
    '0.31.2',
    '0.31.1',
    '0.31.0',
    '0.30.5',
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
  ] as const,
  aliases: [] as const,
}

export type VclustercomPackage = typeof vclustercomPackage
