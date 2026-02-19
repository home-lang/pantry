/**
 * **minikube** - Run a Kubernetes cluster locally
 *
 * @domain `kubernetes.io/minikube`
 * @programs `minikube`
 * @version `1.38.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kubernetes.io/minikube`
 * @homepage https://minikube.sigs.k8s.io/
 * @dependencies `kubernetes.io/kubectl`
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kubernetesiominikube
 * console.log(pkg.name)        // "minikube"
 * console.log(pkg.description) // "Run a Kubernetes cluster locally"
 * console.log(pkg.programs)    // ["minikube"]
 * console.log(pkg.versions[0]) // "1.38.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kubernetes-io/minikube.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubernetesiominikubePackage = {
  /**
  * The display name of this package.
  */
  name: 'minikube' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kubernetes.io/minikube' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Run a Kubernetes cluster locally' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/minikube/package.yml' as const,
  homepageUrl: 'https://minikube.sigs.k8s.io/' as const,
  githubUrl: 'https://github.com/kubernetes/minikube' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install kubernetes.io/minikube' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubernetes.io/minikube -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kubernetes.io/minikube' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'minikube',
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
  */
  buildDependencies: [
    'go.dev@^1.19',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.38.1',
    '1.38.0',
    '1.37.0',
    '1.36.0',
    '1.35.0',
    '1.34.0',
    '1.33.1',
    '1.33.0',
    '1.32.0',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.1',
    '1.30.0',
    '1.29.0',
  ] as const,
  aliases: [] as const,
}

export type KubernetesiominikubePackage = typeof kubernetesiominikubePackage
