/**
 * **marionette** - Something like puppet, for the localhost only.
 *
 * @domain `github.com/skx/marionette`
 * @programs `marionette`
 * @version `0.19.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/skx/marionette`
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomskxmarionette
 * console.log(pkg.name)        // "marionette"
 * console.log(pkg.description) // "Something like puppet, for the localhost only."
 * console.log(pkg.programs)    // ["marionette"]
 * console.log(pkg.versions[0]) // "0.19.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/skx/marionette.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const marionettePackage = {
  /**
   * The display name of this package.
   */
  name: 'marionette' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/skx/marionette' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Something like puppet, for the localhost only.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/skx/marionette/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/skx/marionette' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/skx/marionette' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/skx/marionette -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/skx/marionette' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'marionette',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.19.0',
    '0.18.0',
  ] as const,
  aliases: [] as const,
}

export type MarionettePackage = typeof marionettePackage
