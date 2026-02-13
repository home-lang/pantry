/**
 * **flux** - Open and extensible continuous delivery solution for Kubernetes. Powered by GitOps Toolkit.
 *
 * @domain `fluxcd.io/flux2`
 * @programs `flux`
 * @version `2.7.5` (20 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fluxcd.io/flux2`
 * @homepage https://fluxcd.io
 * @buildDependencies `go.dev@^1.20`, `kubernetes.io/kustomize@^5`, `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fluxcdioflux2
 * console.log(pkg.name)        // "flux"
 * console.log(pkg.description) // "Open and extensible continuous delivery solutio..."
 * console.log(pkg.programs)    // ["flux"]
 * console.log(pkg.versions[0]) // "2.7.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fluxcd-io/flux2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fluxcdioflux2Package = {
  /**
   * The display name of this package.
   */
  name: 'flux' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fluxcd.io/flux2' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Open and extensible continuous delivery solution for Kubernetes. Powered by GitOps Toolkit.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fluxcd.io/flux2/package.yml' as const,
  homepageUrl: 'https://fluxcd.io' as const,
  githubUrl: 'https://github.com/fluxcd/flux2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fluxcd.io/flux2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fluxcd.io/flux2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fluxcd.io/flux2' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'flux',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.20',
    'kubernetes.io/kustomize@^5',
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.7.5',
    '2.7.4',
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.1',
    '2.5.0',
    '2.4.0',
    '2.3.0',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.2',
  ] as const,
  aliases: [] as const,
}

export type Fluxcdioflux2Package = typeof fluxcdioflux2Package
