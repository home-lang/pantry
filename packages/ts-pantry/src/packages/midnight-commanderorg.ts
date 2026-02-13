/**
 * **Midnight Commander** - Terminal-based visual file manager
 *
 * @domain `midnight-commander.org`
 * @programs `mc`, `mcdiff`, `mcedit`, `mcview`
 * @version `4.8.33` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install midnight-commander.org`
 * @homepage https://www.midnight-commander.org/
 * @dependencies `invisible-island.net/ncurses`, `gnome.org/glib>=2.30`, `gnu.org/gettext>=0.18.2`
 * @buildDependencies `gnu.org/autoconf@>=2.64`, `gnu.org/automake@>=1.12`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.midnightcommanderorg
 * console.log(pkg.name)        // "Midnight Commander"
 * console.log(pkg.description) // "Terminal-based visual file manager"
 * console.log(pkg.programs)    // ["mc", "mcdiff", ...]
 * console.log(pkg.versions[0]) // "4.8.33" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/midnight-commander-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const midnightcommanderorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'Midnight Commander' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'midnight-commander.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal-based visual file manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/midnight-commander.org/package.yml' as const,
  homepageUrl: 'https://www.midnight-commander.org/' as const,
  githubUrl: 'https://github.com/MidnightCommander/mc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install midnight-commander.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +midnight-commander.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install midnight-commander.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mc',
    'mcdiff',
    'mcedit',
    'mcview',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'invisible-island.net/ncurses',
    'gnome.org/glib>=2.30',
    'gnu.org/gettext>=0.18.2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf@>=2.64',
    'gnu.org/automake@>=1.12',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.8.33',
    '4.8.32',
    '4.8.31',
    '4.8.30',
    '4.8.29',
    '4.8.28',
  ] as const,
  aliases: [] as const,
}

export type MidnightcommanderorgPackage = typeof midnightcommanderorgPackage
