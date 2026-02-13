/**
 * **ctop** - Top-like interface for container metrics
 *
 * @domain `ctop.sh`
 * @programs `ctop`
 * @version `0.7.7` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ctop.sh`
 * @homepage https://bcicen.github.io/ctop/
 * @buildDependencies `go.dev@~1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ctopsh
 * console.log(pkg.name)        // "ctop"
 * console.log(pkg.description) // "Top-like interface for container metrics"
 * console.log(pkg.programs)    // ["ctop"]
 * console.log(pkg.versions[0]) // "0.7.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ctop-sh.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ctopshPackage = {
  /**
   * The display name of this package.
   */
  name: 'ctop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'ctop.sh' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Top-like interface for container metrics' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ctop.sh/package.yml' as const,
  homepageUrl: 'https://bcicen.github.io/ctop/' as const,
  githubUrl: 'https://github.com/bcicen/ctop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install ctop.sh' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ctop.sh -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ctop.sh' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ctop',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.7',
  ] as const,
  aliases: [] as const,
}

export type CtopshPackage = typeof ctopshPackage
