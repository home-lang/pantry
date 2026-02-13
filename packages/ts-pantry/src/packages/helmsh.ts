/**
 * **helm** - The Kubernetes Package Manager
 *
 * @domain `helm.sh`
 * @programs `helm`
 * @version `4.1.0` (52 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install helm.sh`
 * @homepage https://helm.sh/
 * @buildDependencies `go.dev@^1.19` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.helmsh
 * console.log(pkg.name)        // "helm"
 * console.log(pkg.description) // "The Kubernetes Package Manager"
 * console.log(pkg.programs)    // ["helm"]
 * console.log(pkg.versions[0]) // "4.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/helm-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const helmshPackage = {
  /**
   * The display name of this package.
   */
  name: 'helm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'helm.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The Kubernetes Package Manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/helm.sh/package.yml' as const,
  homepageUrl: 'https://helm.sh/' as const,
  githubUrl: 'https://github.com/helm/helm' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install helm.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +helm.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install helm.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'helm',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
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
    '4.1.0',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.20.0',
    '3.19.5',
    '3.19.4',
    '3.19.3',
    '3.19.2',
    '3.19.1',
    '3.19.0',
    '3.18.6',
    '3.18.5',
    '3.18.4',
    '3.18.3',
    '3.18.2',
    '3.18.1',
    '3.18.0',
    '3.17.4',
    '3.17.3',
    '3.17.2',
    '3.17.1',
    '3.17.0',
    '3.16.4',
    '3.16.3',
    '3.16.2',
    '3.16.1',
    '3.16.0',
    '3.15.4',
    '3.15.3',
    '3.15.2',
    '3.15.1',
    '3.15.0',
    '3.14.4',
    '3.14.3',
    '3.14.2',
    '3.14.1',
    '3.14.0',
    '3.13.3',
    '3.13.2',
    '3.13.1',
    '3.13.0',
    '3.12.3',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.3',
    '3.11.2',
    '3.11.1',
  ] as const,
  aliases: [] as const,
}

export type HelmshPackage = typeof helmshPackage
