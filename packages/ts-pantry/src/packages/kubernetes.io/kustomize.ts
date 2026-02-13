/**
 * **kustomize** - Template-free customization of Kubernetes YAML manifests
 *
 * @domain `kubernetes.io/kustomize`
 * @programs `kustomize`
 * @version `5.8.0` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kubernetes.io/kustomize`
 * @dependencies `kubernetes.io/kubectl`
 * @buildDependencies `go.dev@^1.18`, `linux:gnu.org/gcc`, `linux:gnu.org/binutils@~2.44` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kubernetesiokustomize
 * console.log(pkg.name)        // "kustomize"
 * console.log(pkg.description) // "Template-free customization of Kubernetes YAML ..."
 * console.log(pkg.programs)    // ["kustomize"]
 * console.log(pkg.versions[0]) // "5.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kubernetes-io/kustomize.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubernetesiokustomizePackage = {
  /**
   * The display name of this package.
   */
  name: 'kustomize' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'kubernetes.io/kustomize' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Template-free customization of Kubernetes YAML manifests' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/kustomize/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kubernetes-sigs/kustomize' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install kubernetes.io/kustomize' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubernetes.io/kustomize -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kubernetes.io/kustomize' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'kustomize',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'kubernetes.io/kubectl',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'go.dev@^1.18',
    'linux:gnu.org/gcc',
    'linux:gnu.org/binutils@~2.44',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.8.0',
    '5.7.1',
    '5.7.0',
    '5.6.0',
    '5.5.0',
    '5.4.3',
    '5.4.2',
    '5.4.1',
    '5.4.0',
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.1',
    '5.1.0',
    '5.0.3',
    '5.0.2',
    '5.0.1',
  ] as const,
  aliases: [] as const,
}

export type KubernetesiokustomizePackage = typeof kubernetesiokustomizePackage
