/**
 * **hubble** - Hubble - Network, Service & Security Observability for Kubernetes using eBPF
 *
 * @domain `cilium.io/hubble`
 * @programs `hubble`
 * @version `1.18.5` (19 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cilium.io/hubble`
 * @buildDependencies `go.dev@^1.22` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ciliumiohubble
 * console.log(pkg.name)        // "hubble"
 * console.log(pkg.description) // "Hubble - Network, Service & Security Observabil..."
 * console.log(pkg.programs)    // ["hubble"]
 * console.log(pkg.versions[0]) // "1.18.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cilium-io/hubble.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ciliumiohubblePackage = {
  /**
   * The display name of this package.
   */
  name: 'hubble' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cilium.io/hubble' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Hubble - Network, Service & Security Observability for Kubernetes using eBPF' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cilium.io/hubble/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/cilium/hubble' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cilium.io/hubble' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cilium.io/hubble -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cilium.io/hubble' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'hubble',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.22',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.18.5',
    '1.18.3',
    '1.18.0',
    '1.17.5',
    '1.17.3',
    '1.17.2',
    '1.17.1',
    '1.17.0',
    '1.16.6',
    '1.16.5',
    '1.16.4',
    '1.16.3',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '0.13.6',
    '0.13.5',
    '0.13.4',
    '0.13.3',
  ] as const,
  aliases: [] as const,
}

export type CiliumiohubblePackage = typeof ciliumiohubblePackage
