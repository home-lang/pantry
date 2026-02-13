/**
 * **gsettings-desktop-schemas** - pkgx package
 *
 * @domain `gnome.org/gsettings-desktop-schemas`
 * @version `49.1.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnome.org/gsettings-desktop-schemas`
 * @dependencies `gnome.org/glib`, `libexpat.github.io`
 * @buildDependencies `mesonbuild.com`, `python.org@~3.11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnomeorggsettingsdesktopschemas
 * console.log(pkg.name)        // "gsettings-desktop-schemas"
 * console.log(pkg.versions[0]) // "49.1.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnome-org/gsettings-desktop-schemas.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnomeorggsettingsdesktopschemasPackage = {
  /**
   * The display name of this package.
   */
  name: 'gsettings-desktop-schemas' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnome.org/gsettings-desktop-schemas' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnome.org/gsettings-desktop-schemas/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnome.org/gsettings-desktop-schemas' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnome.org/gsettings-desktop-schemas -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnome.org/gsettings-desktop-schemas' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnome.org/glib',
    'libexpat.github.io',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'mesonbuild.com',
    'python.org@~3.11',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '49.1.0',
    '49.0.0',
    '48.0.0',
    '47.1.0',
    '46.1.0',
    '46.0.0',
    '45.0.0',
    '44.0.0',
  ] as const,
  aliases: [] as const,
}

export type GnomeorggsettingsdesktopschemasPackage = typeof gnomeorggsettingsdesktopschemasPackage
