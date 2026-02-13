/**
 * **mop** - Stock market tracker for hackers.
 *
 * @domain `github.com/mop-tracker/mop`
 * @programs `mop`
 * @version `2023.3.30` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mop-tracker/mop`
 * @buildDependencies `go.dev`, `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommoptrackermop
 * console.log(pkg.name)        // "mop"
 * console.log(pkg.description) // "Stock market tracker for hackers."
 * console.log(pkg.programs)    // ["mop"]
 * console.log(pkg.versions[0]) // "2023.3.30" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mop-tracker/mop.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mopPackage = {
  /**
   * The display name of this package.
   */
  name: 'mop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mop-tracker/mop' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Stock market tracker for hackers.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mop-tracker/mop/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mop-tracker/mop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mop-tracker/mop' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mop-tracker/mop -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mop-tracker/mop' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mop',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2023.3.30',
  ] as const,
  aliases: [] as const,
}

export type MopPackage = typeof mopPackage
