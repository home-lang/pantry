/**
 * **htop** - Improved top (interactive process viewer)
 *
 * @domain `htop.dev`
 * @programs `htop`
 * @version `3.4.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install htop.dev`
 * @homepage https://htop.dev/
 * @dependencies `invisible-island.net/ncurses@6`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.htopdev
 * console.log(pkg.name)        // "htop"
 * console.log(pkg.description) // "Improved top (interactive process viewer)"
 * console.log(pkg.programs)    // ["htop"]
 * console.log(pkg.versions[0]) // "3.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/htop-dev.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const htopdevPackage = {
  /**
   * The display name of this package.
   */
  name: 'htop' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'htop.dev' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Improved top (interactive process viewer)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/htop.dev/package.yml' as const,
  homepageUrl: 'https://htop.dev/' as const,
  githubUrl: 'https://github.com/htop-dev/htop' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install htop.dev' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +htop.dev -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install htop.dev' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'htop',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses@6',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.4.1',
    '3.4.0',
    '3.3.0',
    '3.2.2',
    '3.2.1',
  ] as const,
  aliases: [] as const,
}

export type HtopdevPackage = typeof htopdevPackage
