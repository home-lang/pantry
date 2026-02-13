/**
 * **desktop-file-utils** - Command-line utilities for working with desktop entries
 *
 * @domain `freedesktop.org/desktop-file-utils`
 * @programs `desktop-file-edit`, `desktop-file-install`, `desktop-file-validate`, `update-desktop-database`
 * @version `0.28.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/desktop-file-utils`
 * @homepage https://wiki.freedesktop.org/www/Software/desktop-file-utils/
 * @dependencies `gnome.org/glib@2`
 * @buildDependencies `mesonbuild.com@>=0.61` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgdesktopfileutils
 * console.log(pkg.name)        // "desktop-file-utils"
 * console.log(pkg.description) // "Command-line utilities for working with desktop..."
 * console.log(pkg.programs)    // ["desktop-file-edit", "desktop-file-install", ...]
 * console.log(pkg.versions[0]) // "0.28.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/desktop-file-utils.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgdesktopfileutilsPackage = {
  /**
   * The display name of this package.
   */
  name: 'desktop-file-utils' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/desktop-file-utils' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Command-line utilities for working with desktop entries' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/desktop-file-utils/package.yml' as const,
  homepageUrl: 'https://wiki.freedesktop.org/www/Software/desktop-file-utils/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/desktop-file-utils' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/desktop-file-utils -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/desktop-file-utils' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'desktop-file-edit',
    'desktop-file-install',
    'desktop-file-validate',
    'update-desktop-database',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib@2',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@>=0.61',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.28.0',
    '0.27.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgdesktopfileutilsPackage = typeof freedesktoporgdesktopfileutilsPackage
