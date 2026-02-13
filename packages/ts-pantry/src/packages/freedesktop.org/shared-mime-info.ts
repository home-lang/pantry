/**
 * **update-mime-database** - Database of common MIME types
 *
 * @domain `freedesktop.org/shared-mime-info`
 * @programs `update-mime-database`
 * @version `2.4.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freedesktop.org/shared-mime-info`
 * @homepage https://wiki.freedesktop.org/www/Software/shared-mime-info
 * @dependencies `gnome.org/glib@2`, `gnu.org/gettext^0.21`
 * @buildDependencies `mesonbuild.com@^0.63`, `gnome.org/libxml2@2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freedesktoporgsharedmimeinfo
 * console.log(pkg.name)        // "update-mime-database"
 * console.log(pkg.description) // "Database of common MIME types"
 * console.log(pkg.programs)    // ["update-mime-database"]
 * console.log(pkg.versions[0]) // "2.4.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freedesktop-org/shared-mime-info.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freedesktoporgsharedmimeinfoPackage = {
  /**
   * The display name of this package.
   */
  name: 'update-mime-database' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'freedesktop.org/shared-mime-info' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Database of common MIME types' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freedesktop.org/shared-mime-info/package.yml' as const,
  homepageUrl: 'https://wiki.freedesktop.org/www/Software/shared-mime-info' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install freedesktop.org/shared-mime-info' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freedesktop.org/shared-mime-info -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freedesktop.org/shared-mime-info' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'update-mime-database',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib@2',
    'gnu.org/gettext^0.21',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com@^0.63',
    'gnome.org/libxml2@2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.0',
    '2.3.0',
    '2.2.0',
  ] as const,
  aliases: [] as const,
}

export type FreedesktoporgsharedmimeinfoPackage = typeof freedesktoporgsharedmimeinfoPackage
