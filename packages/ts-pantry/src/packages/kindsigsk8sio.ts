/**
 * **kind** - Kubernetes IN Docker - local clusters for testing Kubernetes
 *
 * @domain `kind.sigs.k8s.io`
 * @programs `kind`
 * @version `0.31.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install kind.sigs.k8s.io`
 * @homepage https://kind.sigs.k8s.io/
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.kindsigsk8sio
 * console.log(pkg.name)        // "kind"
 * console.log(pkg.description) // "Kubernetes IN Docker - local clusters for testi..."
 * console.log(pkg.programs)    // ["kind"]
 * console.log(pkg.versions[0]) // "0.31.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/kind-sigs-k8s-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kindsigsk8sioPackage = {
  /**
  * The display name of this package.
  */
  name: 'kind' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'kind.sigs.k8s.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Kubernetes IN Docker - local clusters for testing Kubernetes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/kind.sigs.k8s.io/package.yml' as const,
  homepageUrl: 'https://kind.sigs.k8s.io/' as const,
  githubUrl: 'https://github.com/kubernetes-sigs/kind' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install kind.sigs.k8s.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +kind.sigs.k8s.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install kind.sigs.k8s.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kind',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.31.0',
    '0.30.0',
    '0.29.0',
    '0.28.0',
    '0.27.0',
    '0.26.0',
    '0.25.0',
    '0.24.0',
    '0.23.0',
    '0.22.0',
    '0.21.0',
    '0.20.0',
    '0.19.0',
  ] as const,
  aliases: [] as const,
}

export type Kindsigsk8sioPackage = typeof kindsigsk8sioPackage
