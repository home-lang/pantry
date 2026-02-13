/**
 * **coredns** - CoreDNS is a DNS server that chains plugins
 *
 * @domain `coredns.io`
 * @programs `coredns`
 * @version `1.14.1` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install coredns.io`
 * @homepage https://coredns.io/
 * @buildDependencies `go.dev@~1.24.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.corednsio
 * console.log(pkg.name)        // "coredns"
 * console.log(pkg.description) // "CoreDNS is a DNS server that chains plugins"
 * console.log(pkg.programs)    // ["coredns"]
 * console.log(pkg.versions[0]) // "1.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/coredns-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const corednsioPackage = {
  /**
   * The display name of this package.
   */
  name: 'coredns' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'coredns.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'CoreDNS is a DNS server that chains plugins' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/coredns.io/package.yml' as const,
  homepageUrl: 'https://coredns.io/' as const,
  githubUrl: 'https://github.com/coredns/coredns' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install coredns.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +coredns.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install coredns.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'coredns',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.24.0',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.14.1',
    '1.14.0',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.4',
    '1.12.3',
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.4',
    '1.11.3',
    '1.11.2',
    '1.11.1',
    '1.10.1',
  ] as const,
  aliases: [] as const,
}

export type CorednsioPackage = typeof corednsioPackage
