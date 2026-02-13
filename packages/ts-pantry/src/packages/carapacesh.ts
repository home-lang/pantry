/**
 * **carapace** - Multi-shell multi-command argument completer
 *
 * @domain `carapace.sh`
 * @programs `carapace`
 * @version `1.6.0` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install carapace.sh`
 * @homepage https://carapace.sh
 * @buildDependencies `go.dev@~1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.carapacesh
 * console.log(pkg.name)        // "carapace"
 * console.log(pkg.description) // "Multi-shell multi-command argument completer"
 * console.log(pkg.programs)    // ["carapace"]
 * console.log(pkg.versions[0]) // "1.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/carapace-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const carapaceshPackage = {
  /**
   * The display name of this package.
   */
  name: 'carapace' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'carapace.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Multi-shell multi-command argument completer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/carapace.sh/package.yml' as const,
  homepageUrl: 'https://carapace.sh' as const,
  githubUrl: 'https://github.com/carapace-sh/carapace-bin' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install carapace.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +carapace.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install carapace.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'carapace',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.21',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.6.0',
    '1.5.7',
    '1.5.6',
    '1.5.5',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.1',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.7',
    '1.0.6',
    '1.0.5',
    '1.0.4',
  ] as const,
  aliases: [] as const,
}

export type CarapaceshPackage = typeof carapaceshPackage
