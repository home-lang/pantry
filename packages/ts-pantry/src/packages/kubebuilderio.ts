/**
 * **kubebuilder** - Kubebuilder - SDK for building Kubernetes APIs using CRDs
 *
 * @domain `kubebuilder.io`
 * @programs `kubebuilder`
 * @version `4.11.0` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kubebuilder.io`
 * @homepage http://book.kubebuilder.io
 * @buildDependencies `go.dev@~1.23`, `gnu.org/coreutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kubebuilderio
 * console.log(pkg.name)        // "kubebuilder"
 * console.log(pkg.description) // "Kubebuilder - SDK for building Kubernetes APIs ..."
 * console.log(pkg.programs)    // ["kubebuilder"]
 * console.log(pkg.versions[0]) // "4.11.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kubebuilder-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubebuilderioPackage = {
  /**
   * The display name of this package.
   */
  name: 'kubebuilder' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kubebuilder.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Kubebuilder - SDK for building Kubernetes APIs using CRDs' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubebuilder.io/package.yml' as const,
  homepageUrl: 'http://book.kubebuilder.io' as const,
  githubUrl: 'https://github.com/kubernetes-sigs/kubebuilder' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kubebuilder.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubebuilder.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kubebuilder.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'kubebuilder',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.23',
    'gnu.org/coreutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.11.0',
    '4.10.1',
    '4.10.0',
    '4.9.0',
    '4.8.0',
    '4.7.1',
    '4.7.0',
    '4.6.0',
    '4.5.2',
    '4.5.1',
    '4.5.0',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.0',
    '4.1.1',
    '4.1.0',
    '4.0.0',
    '3.15.1',
    '3.15.0',
    '3.14.2',
    '3.14.1',
    '3.14.0',
    '3.13.0',
    '3.12.0',
  ] as const,
  aliases: [] as const,
}

export type KubebuilderioPackage = typeof kubebuilderioPackage
