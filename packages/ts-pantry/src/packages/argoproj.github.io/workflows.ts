/**
 * **argo-workflows** - Get stuff done with container-native workflows for Kubernetes
 *
 * @domain `argoproj.github.io/workflows`
 * @programs `argo`
 * @version `3.7.8` (50 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install argoproj.github.io/workflows`
 * @homepage https://argoproj.io
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.argoprojgithubioworkflows
 * console.log(pkg.name)        // "argo-workflows"
 * console.log(pkg.description) // "Get stuff done with container-native workflows ..."
 * console.log(pkg.programs)    // ["argo"]
 * console.log(pkg.versions[0]) // "3.7.8" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/argoproj-github-io/workflows.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const argoprojgithubioworkflowsPackage = {
  /**
   * The display name of this package.
   */
  name: 'argo-workflows' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'argoproj.github.io/workflows' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Get stuff done with container-native workflows for Kubernetes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/argoproj.github.io/workflows/package.yml' as const,
  homepageUrl: 'https://argoproj.io' as const,
  githubUrl: 'https://github.com/argoproj/argo-workflows' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install argoproj.github.io/workflows' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +argoproj.github.io/workflows -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install argoproj.github.io/workflows' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'argo',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.7.8',
    '3.7.7',
    '3.7.6',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.17',
    '3.6.16',
    '3.6.15',
    '3.6.13',
    '3.6.12',
    '3.6.11',
    '3.6.10',
    '3.6.9',
    '3.6.8',
    '3.6.7',
    '3.6.6',
    '3.6.5',
    '3.6.4',
    '3.6.3',
    '3.6.2',
    '3.6.1',
    '3.6.0',
    '3.5.15',
    '3.5.14',
    '3.5.13',
    '3.5.12',
    '3.5.11',
    '3.5.10',
    '3.5.9',
    '3.5.8',
    '3.5.7',
    '3.5.6',
    '3.5.5',
    '3.5.4',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.18',
    '3.4.17',
    '3.4.16',
    '3.4.15',
    '3.4.14',
    '3.4.13',
    '3.4.12',
    '3.4.11',
  ] as const,
  aliases: [] as const,
}

export type ArgoprojgithubioworkflowsPackage = typeof argoprojgithubioworkflowsPackage
