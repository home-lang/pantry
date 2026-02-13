/**
 * **argo-cd** - GitOps Continuous Delivery for Kubernetes
 *
 * @domain `argoproj.github.io/cd`
 * @programs `argocd`
 * @version `3.2.6` (167 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install argoproj.github.io/cd`
 * @homepage https://argoproj.github.io/cd/
 * @buildDependencies `go.dev`, `nodejs.org@<23`, `yarnpkg.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.argoprojgithubiocd
 * console.log(pkg.name)        // "argo-cd"
 * console.log(pkg.description) // "GitOps Continuous Delivery for Kubernetes"
 * console.log(pkg.programs)    // ["argocd"]
 * console.log(pkg.versions[0]) // "3.2.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/argoproj-github-io/cd.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const argoprojgithubiocdPackage = {
  /**
   * The display name of this package.
   */
  name: 'argo-cd' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'argoproj.github.io/cd' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GitOps Continuous Delivery for Kubernetes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/argoproj.github.io/cd/package.yml' as const,
  homepageUrl: 'https://argoproj.github.io/cd/' as const,
  githubUrl: 'https://github.com/argoproj/cd' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install argoproj.github.io/cd' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +argoproj.github.io/cd -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install argoproj.github.io/cd' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'argocd',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
    'nodejs.org@<23',
    'yarnpkg.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.2.6',
    '3.2.5',
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.12',
    '3.1.11',
    '3.1.10',
    '3.1.9',
    '3.1.8',
    '3.1.7',
    '3.1.6',
    '3.1.5',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.23',
    '3.0.22',
    '3.0.21',
    '3.0.20',
    '3.0.19',
    '3.0.18',
    '3.0.17',
    '3.0.16',
    '3.0.15',
    '3.0.14',
    '3.0.13',
    '3.0.12',
    '3.0.11',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.14.21',
    '2.14.20',
    '2.14.19',
    '2.14.18',
    '2.14.17',
    '2.14.16',
    '2.14.15',
    '2.14.14',
    '2.14.13',
    '2.14.12',
    '2.14.11',
    '2.14.10',
    '2.14.9',
    '2.14.7',
    '2.14.6',
    '2.14.5',
    '2.14.4',
    '2.14.3',
    '2.14.2',
    '2.14.1',
    '2.14.0',
    '2.13.9',
    '2.13.7',
    '2.13.6',
    '2.13.5',
    '2.13.4',
    '2.13.3',
    '2.13.2',
    '2.13.1',
    '2.13.0',
    '2.12.13',
    '2.12.12',
    '2.12.11',
    '2.12.10',
    '2.12.9',
    '2.12.8',
    '2.12.7',
    '2.12.6',
    '2.12.5',
    '2.12.4',
    '2.12.3',
    '2.12.2',
    '2.12.1',
    '2.12.0',
    '2.11.14',
    '2.11.13',
    '2.11.12',
    '2.11.11',
    '2.11.10',
    '2.11.9',
    '2.11.8',
    '2.11.7',
    '2.11.6',
    '2.11.5',
    '2.11.4',
    '2.11.3',
    '2.11.2',
    '2.11.1',
    '2.11.0',
    '2.10.20',
    '2.10.19',
    '2.10.18',
    '2.10.17',
    '2.10.16',
    '2.10.15',
    '2.10.14',
    '2.10.13',
    '2.10.12',
    '2.10.11',
    '2.10.10',
    '2.10.9',
    '2.10.8',
    '2.10.7',
    '2.10.6',
    '2.10.5',
    '2.10.4',
    '2.10.3',
    '2.10.2',
    '2.10.1',
    '2.10.0',
    '2.9.22',
    '2.9.21',
    '2.9.20',
    '2.9.19',
    '2.9.18',
    '2.9.17',
    '2.9.16',
    '2.9.15',
    '2.9.14',
    '2.9.13',
    '2.9.12',
    '2.9.11',
    '2.9.10',
    '2.9.9',
    '2.9.7',
    '2.9.6',
    '2.9.5',
    '2.9.4',
    '2.9.3',
    '2.9.2',
    '2.9.1',
    '2.9.0',
    '2.8.21',
    '2.8.20',
    '2.8.19',
    '2.8.18',
    '2.8.17',
    '2.8.16',
    '2.8.15',
    '2.8.14',
    '2.8.12',
    '2.8.11',
    '2.8.10',
    '2.8.9',
    '2.8.8',
    '2.8.7',
    '2.8.6',
    '2.8.5',
    '2.8.4',
    '2.8.3',
    '2.8.2',
    '2.7.18',
    '2.7.17',
    '2.7.16',
    '2.7.15',
    '2.7.14',
    '2.6.15',
  ] as const,
  aliases: [] as const,
}

export type ArgoprojgithubiocdPackage = typeof argoprojgithubiocdPackage
