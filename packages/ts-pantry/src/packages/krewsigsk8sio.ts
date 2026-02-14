/**
 * **kubectl-krew** - 📦 Find and install kubectl plugins
 *
 * @domain `krew.sigs.k8s.io`
 * @programs `kubectl-krew`
 * @version `0.4.5` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install krew.sigs.k8s.io`
 * @homepage https://sigs.k8s.io/krew/
 * @dependencies `git-scm.org`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.krewsigsk8sio
 * console.log(pkg.name)        // "kubectl-krew"
 * console.log(pkg.description) // "📦 Find and install kubectl plugins"
 * console.log(pkg.programs)    // ["kubectl-krew"]
 * console.log(pkg.versions[0]) // "0.4.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/krew-sigs-k8s-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const krewsigsk8sioPackage = {
  /**
  * The display name of this package.
  */
  name: 'kubectl-krew' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'krew.sigs.k8s.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: '📦 Find and install kubectl plugins' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/krew.sigs.k8s.io/package.yml' as const,
  homepageUrl: 'https://sigs.k8s.io/krew/' as const,
  githubUrl: 'https://github.com/kubernetes-sigs/krew' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install krew.sigs.k8s.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +krew.sigs.k8s.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install krew.sigs.k8s.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'kubectl-krew',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'git-scm.org',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.4.5',
    '0.4.4',
  ] as const,
  aliases: [] as const,
}

export type Krewsigsk8sioPackage = typeof krewsigsk8sioPackage
