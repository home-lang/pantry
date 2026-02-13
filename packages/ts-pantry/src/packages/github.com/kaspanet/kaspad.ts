/**
 * **kaspad** - Kaspad was the reference full node Kaspa implementation written in Go (golang), now rewritten in Rust: https://github.com/kaspanet/rusty-kaspa
 *
 * @domain `github.com/kaspanet/kaspad`
 * @programs `genkeypair`, `kaspactl`, `kaspad`, `kaspaminer`, `kaspawallet`
 * @version `0.12.22` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kaspanet/kaspad`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkaspanetkaspad
 * console.log(pkg.name)        // "kaspad"
 * console.log(pkg.description) // "Kaspad was the reference full node Kaspa implem..."
 * console.log(pkg.programs)    // ["genkeypair", "kaspactl", ...]
 * console.log(pkg.versions[0]) // "0.12.22" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kaspanet/kaspad.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const kaspadPackage = {
  /**
   * The display name of this package.
   */
  name: 'kaspad' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/kaspanet/kaspad' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Kaspad was the reference full node Kaspa implementation written in Go (golang), now rewritten in Rust: https://github.com/kaspanet/rusty-kaspa' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/kaspad/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kaspanet/kaspad' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/kaspanet/kaspad' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kaspanet/kaspad -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kaspanet/kaspad' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'genkeypair',
    'kaspactl',
    'kaspad',
    'kaspaminer',
    'kaspawallet',
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
    '0.12.22',
    '0.12.21',
    '0.12.20',
    '0.12.19',
    '0.12.18',
    '0.12.17',
    '0.12.15',
    '0.12.14',
  ] as const,
  aliases: [] as const,
}

export type KaspadPackage = typeof kaspadPackage
