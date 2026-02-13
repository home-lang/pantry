/**
 * **pocket** - Official implementation of the Pocket Network Protocol
 *
 * @domain `pokt.network`
 * @programs `pocket`
 * @version `0.12.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install pokt.network`
 * @homepage http://www.pokt.network
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.poktnetwork
 * console.log(pkg.name)        // "pocket"
 * console.log(pkg.description) // "Official implementation of the Pocket Network P..."
 * console.log(pkg.programs)    // ["pocket"]
 * console.log(pkg.versions[0]) // "0.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/pokt-network.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const poktnetworkPackage = {
  /**
   * The display name of this package.
   */
  name: 'pocket' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'pokt.network' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official implementation of the Pocket Network Protocol' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/pokt.network/package.yml' as const,
  homepageUrl: 'http://www.pokt.network' as const,
  githubUrl: 'https://github.com/pokt-network/pocket-core' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install pokt.network' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +pokt.network -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install pokt.network' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pocket',
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
    '0.12.0',
    '0.11.3',
    '0.11.2',
    '0.11.1',
    '0.10.4',
    '0.10.3',
    '0.10.0',
    '0.9.2',
  ] as const,
  aliases: [] as const,
}

export type PoktnetworkPackage = typeof poktnetworkPackage
