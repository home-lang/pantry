/**
 * **kubectl** - Production-Grade Container Scheduling and Management
 *
 * @domain `kubernetes.io/kubectl`
 * @programs `kubectl`
 * @version `1.35.1` (132 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kubernetes.io/kubectl`
 * @homepage https://kubernetes.io/docs/reference/kubectl/
 * @buildDependencies `go.dev@~1.24.4`, `gnu.org/coreutils@^9.1.0`, `gnu.org/bash@^5.1`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kubernetesiokubectl
 * console.log(pkg.name)        // "kubectl"
 * console.log(pkg.description) // "Production-Grade Container Scheduling and Manag..."
 * console.log(pkg.programs)    // ["kubectl"]
 * console.log(pkg.versions[0]) // "1.35.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kubernetes-io/kubectl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kubernetesiokubectlPackage = {
  /**
  * The display name of this package.
  */
  name: 'kubectl' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kubernetes.io/kubectl' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Production-Grade Container Scheduling and Management' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kubernetes.io/kubectl/package.yml' as const,
  homepageUrl: 'https://kubernetes.io/docs/reference/kubectl/' as const,
  githubUrl: 'https://github.com/kubernetes/kubernetes' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install kubernetes.io/kubectl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kubernetes.io/kubectl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kubernetes.io/kubectl' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubectl',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@~1.24.4',
    'gnu.org/coreutils@^9.1.0',
    'gnu.org/bash@^5.1',
    'rsync.samba.org',
    'curl.se',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.35.1',
    '1.35.0',
    '1.34.4',
    '1.34.3',
    '1.34.2',
    '1.34.1',
    '1.34.0',
    '1.33.8',
    '1.33.7',
    '1.33.6',
    '1.33.5',
    '1.33.4',
    '1.33.3',
    '1.33.2',
    '1.33.1',
    '1.33.0',
    '1.32.12',
    '1.32.11',
    '1.32.10',
    '1.32.9',
    '1.32.8',
    '1.32.7',
    '1.32.6',
    '1.32.5',
    '1.32.4',
    '1.32.3',
    '1.32.2',
    '1.32.1',
    '1.32.0',
    '1.31.14',
    '1.31.13',
    '1.31.12',
    '1.31.11',
    '1.31.10',
    '1.31.9',
    '1.31.8',
    '1.31.7',
    '1.31.6',
    '1.31.5',
    '1.31.4',
    '1.31.3',
    '1.31.2',
    '1.31.1',
    '1.31.0',
    '1.30.14',
    '1.30.13',
    '1.30.12',
    '1.30.11',
    '1.30.10',
    '1.30.9',
    '1.30.8',
    '1.30.7',
    '1.30.6',
    '1.30.5',
    '1.30.4',
    '1.30.3',
    '1.30.2',
    '1.30.1',
    '1.30.0',
    '1.29.15',
    '1.29.14',
    '1.29.13',
    '1.29.12',
    '1.29.11',
    '1.29.10',
    '1.29.9',
    '1.29.8',
    '1.29.7',
    '1.29.6',
    '1.29.5',
    '1.29.4',
    '1.29.3',
    '1.29.2',
    '1.29.1',
    '1.29.0',
    '1.28.15',
    '1.28.14',
    '1.28.13',
    '1.28.12',
    '1.28.11',
    '1.28.10',
    '1.28.9',
    '1.28.8',
    '1.28.7',
    '1.28.6',
    '1.28.5',
    '1.28.4',
    '1.28.3',
    '1.28.2',
    '1.28.1',
    '1.28.0',
    '1.27.16',
    '1.27.15',
    '1.27.14',
    '1.27.13',
    '1.27.12',
    '1.27.11',
    '1.27.10',
    '1.27.9',
    '1.27.8',
    '1.27.7',
    '1.27.6',
    '1.27.5',
    '1.27.4',
    '1.27.3',
    '1.27.2',
    '1.26.15',
    '1.26.14',
    '1.26.13',
    '1.26.12',
    '1.26.11',
    '1.26.10',
    '1.26.9',
    '1.26.8',
    '1.26.7',
    '1.26.6',
    '1.26.5',
    '1.26.3',
    '1.26.2',
    '1.25.16',
    '1.25.15',
    '1.25.14',
    '1.25.13',
    '1.25.12',
    '1.25.11',
    '1.25.10',
    '1.25.8',
    '1.24.17',
    '1.24.16',
    '1.24.15',
    '1.24.14',
    '1.24.12',
  ] as const,
  aliases: [] as const,
}

export type KubernetesiokubectlPackage = typeof kubernetesiokubectlPackage
