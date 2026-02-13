/**
 * **starship** - ☄🌌️  The minimal, blazing-fast, and infinitely customizable prompt for any shell!
 *
 * @domain `starship.rs`
 * @programs `starship`
 * @version `1.24.2` (24 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install starship.rs`
 * @homepage https://starship.rs
 * @buildDependencies `cmake.org@>=3.5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.starshiprs
 * console.log(pkg.name)        // "starship"
 * console.log(pkg.description) // "☄🌌️  The minimal, blazing-fast, and infinitely..."
 * console.log(pkg.programs)    // ["starship"]
 * console.log(pkg.versions[0]) // "1.24.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/starship-rs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const starshiprsPackage = {
  /**
   * The display name of this package.
   */
  name: 'starship' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'starship.rs' as const,
  /**
   * Brief description of what this package does.
   */
  description: '☄🌌️  The minimal, blazing-fast, and infinitely customizable prompt for any shell!' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/starship.rs/package.yml' as const,
  homepageUrl: 'https://starship.rs' as const,
  githubUrl: 'https://github.com/starship/starship' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install starship.rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +starship.rs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install starship.rs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'starship',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@>=3.5',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.0',
    '1.22.1',
    '1.22.0',
    '1.21.1',
    '1.21.0',
    '1.20.1',
    '1.20.0',
    '1.19.0',
    '1.18.2',
    '1.18.1',
    '1.18.0',
    '1.17.1',
    '1.17.0',
    '1.16.0',
    '1.15.0',
    '1.14.2',
    '1.14.1',
    '1.14.0',
    '1.13.1',
    '1.13.0',
    '1.12.0',
  ] as const,
  aliases: [] as const,
}

export type StarshiprsPackage = typeof starshiprsPackage
