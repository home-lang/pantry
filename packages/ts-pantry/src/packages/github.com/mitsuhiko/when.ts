/**
 * **when** - Timezones from the command line
 *
 * @domain `github.com/mitsuhiko/when`
 * @programs `when`
 * @version `0.4.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mitsuhiko/when`
 * @homepage https://www.lightandmatter.com/when/when.html
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommitsuhikowhen
 * console.log(pkg.name)        // "when"
 * console.log(pkg.description) // "Timezones from the command line"
 * console.log(pkg.programs)    // ["when"]
 * console.log(pkg.versions[0]) // "0.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mitsuhiko/when.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const whenPackage = {
  /**
   * The display name of this package.
   */
  name: 'when' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/mitsuhiko/when' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Timezones from the command line' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mitsuhiko/when/package.yml' as const,
  homepageUrl: 'https://www.lightandmatter.com/when/when.html' as const,
  githubUrl: 'https://github.com/mitsuhiko/when' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/mitsuhiko/when' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mitsuhiko/when -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mitsuhiko/when' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'when',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.0',
  ] as const,
  aliases: [] as const,
}

export type WhenPackage = typeof whenPackage
